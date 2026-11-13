import { OBJECTIVE_CONFIG, OBJECTIVE_DATABASE } from './objective-data.js';

const ACTIVE_ACTIVITY_TYPES = new Set(['expedition', 'discovery', 'craft']);

function localDayKey(timestamp) {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function nextLocalMidnight(timestamp) {
  const date = new Date(timestamp);
  date.setHours(24, 0, 0, 0);
  return date.getTime();
}

function safeProgress(raw, goalCount) {
  return Array.from({ length: goalCount }, (_, index) => Math.max(0, Math.floor(Number(raw?.[index]) || 0)));
}

function safeTask(raw, definitions, tier) {
  if (!raw || typeof raw !== 'object') return null;
  const definition = definitions.find((entry) => entry.id === raw.id && entry.tier === tier);
  if (!definition) return null;
  const goals = definition.goals.map((goal, index) => {
    const savedGoal = raw.goals?.[index];
    const savedAreaId = savedGoal?.areaId;
    const savedLabel = typeof savedGoal?.label === 'string' ? savedGoal.label.slice(0, 80) : goal.label;
    return { ...goal, label: savedLabel, ...(savedAreaId ? { areaId: String(savedAreaId).slice(0, 80) } : {}) };
  });
  const progress = safeProgress(raw.progress, goals.length);
  const allComplete = progress.every((value, index) => value >= goals[index].target);
  const generatedAt = Math.max(0, Math.floor(Number(raw.generatedAt) || 0));
  const expiresAt = Math.max(0, Math.floor(Number(raw.expiresAt) || 0));
  return {
    id: definition.id,
    name: definition.name,
    description: typeof raw.description === 'string' ? raw.description.slice(0, 160) : definition.description,
    tier,
    objectiveType: definition.objectiveType,
    reward: OBJECTIVE_CONFIG.tiers[tier - 1].reward,
    goals,
    progress: progress.map((value, index) => Math.min(goals[index].target, value)),
    generatedAt,
    expiresAt,
    completed: Boolean(raw.completed) || allComplete,
    completedAt: Math.max(0, Math.floor(Number(raw.completedAt) || 0)),
  };
}

export class ObjectiveManager {
  constructor(config = OBJECTIVE_CONFIG, database = OBJECTIVE_DATABASE) {
    this.config = config;
    this.database = database;
  }

  sanitizeWorld(world, raw = {}, now = Date.now()) {
    const rawStates = raw.objectiveStates && typeof raw.objectiveStates === 'object' ? raw.objectiveStates : {};
    world.objectiveStates = {};
    for (const tier of this.config.tiers) {
      const saved = rawStates[String(tier.level)];
      const cooldownUntil = Math.max(0, Math.floor(Number(saved?.cooldownUntil) || 0));
      const task = safeTask(saved?.task, this.database, tier.level);
      world.objectiveStates[String(tier.level)] = { task, cooldownUntil };
    }
    world.objectiveHistory = Array.isArray(raw.objectiveHistory)
      ? raw.objectiveHistory
        .filter((entry) => entry && this.database.some((definition) => definition.id === entry.id))
        .slice(-this.config.recentHistoryLimit)
        .map((entry) => ({ id: String(entry.id), tier: Math.max(1, Math.min(5, Math.floor(Number(entry.tier) || 1))), objectiveType: String(entry.objectiveType || '').slice(0, 40), completedAt: Math.max(0, Math.floor(Number(entry.completedAt) || 0)) }))
      : [];
    world.objectiveDayKey = typeof raw.objectiveDayKey === 'string' ? raw.objectiveDayKey : localDayKey(now);
    world.objectiveDailyResetTimestamp = Math.max(0, Math.floor(Number(raw.objectiveDailyResetTimestamp) || nextLocalMidnight(now)));
    this.syncDaily(world, now);
    return world;
  }

  syncDaily(world, now = Date.now()) {
    const today = localDayKey(now);
    if (world.objectiveDayKey !== today) {
      world.objectiveDayKey = today;
      world.objectiveStates['5'] = { task: null, cooldownUntil: 0 };
    }
    world.objectiveDailyResetTimestamp = nextLocalMidnight(now);
  }

  eligible(definition, context) {
    const requirements = definition.requirements || {};
    if (context.level < (definition.minLevel || 1)) return false;
    if (requirements.pet && !context.hasPet) return false;
    if (requirements.system && !context.systems?.[requirements.system]) return false;
    if (requirements.discoverable && context.discoverableCount < requirements.discoverable) return false;
    if (requirements.unlockedAreas && context.unlockedAreas.length < requirements.unlockedAreas) return false;
    return true;
  }

  resolvedGoals(definition, context) {
    return definition.goals.map((goal) => {
      const resolved = { ...goal };
      if (goal.chooseArea) {
        const areas = context.unlockedAreas || [];
        const recentArea = context.recentExpeditionAreaId;
        const candidates = areas.length > 1 ? areas.filter((area) => area.id !== recentArea) : areas;
        const area = candidates[Math.floor(Math.random() * candidates.length)] || areas[0];
        if (area) {
          resolved.areaId = area.id;
          resolved.label = `${area.name} expeditions`;
        }
      }
      return resolved;
    });
  }

  chooseDefinition(tier, context, history) {
    const eligible = this.database.filter((entry) => entry.tier === tier && this.eligible(entry, context));
    if (!eligible.length) return null;
    const recentIds = history.filter((entry) => entry.tier === tier).slice(-this.config.avoidRecentRepeatCount).map((entry) => entry.id);
    const fresh = eligible.filter((entry) => !recentIds.includes(entry.id));
    const pool = fresh.length ? fresh : eligible;
    const recentTypes = history.slice(-6).map((entry) => entry.objectiveType);
    const weighted = pool.map((entry) => {
      const sameTypeCount = recentTypes.filter((type) => type === entry.objectiveType).length;
      const weight = Math.max(0.25, Number(entry.weight) || 1) * (1 / (1 + sameTypeCount * 0.42));
      return { entry, weight };
    });
    const total = weighted.reduce((sum, row) => sum + row.weight, 0);
    let roll = Math.random() * total;
    for (const row of weighted) {
      roll -= row.weight;
      if (roll < 0) return row.entry;
    }
    return weighted.at(-1)?.entry || null;
  }

  makeTask(tier, world, context, now) {
    const definition = this.chooseDefinition(tier, context, world.objectiveHistory || []);
    if (!definition) return null;
    const tierConfig = this.config.tiers[tier - 1];
    const goals = this.resolvedGoals(definition, context);
    const area = goals.find((goal) => goal.areaId);
    const description = definition.goals.some((goal) => goal.chooseArea) && area
      ? `Complete ${area.target} expeditions in ${area.label.replace(/ expeditions$/i, '')}.`
      : definition.description;
    return {
      id: definition.id,
      name: definition.name,
      description,
      tier,
      objectiveType: definition.objectiveType,
      reward: tierConfig.reward,
      goals,
      progress: goals.map(() => 0),
      generatedAt: now,
      expiresAt: tierConfig.daily ? nextLocalMidnight(now) : now + tierConfig.refreshMs,
      completed: false,
      completedAt: 0,
    };
  }

  refresh(world, context, now = Date.now()) {
    this.syncDaily(world, now);
    if (!world.objectiveStates || typeof world.objectiveStates !== 'object') world.objectiveStates = {};
    let changed = false;
    for (const tierConfig of this.config.tiers) {
      const tier = tierConfig.level;
      const key = String(tier);
      let slot = world.objectiveStates[key];
      if (!slot || typeof slot !== 'object') {
        slot = { task: null, cooldownUntil: 0 };
        world.objectiveStates[key] = slot;
        changed = true;
      }
      if (slot.task?.completed && tierConfig.daily && slot.task.expiresAt <= now) {
        slot.task = null;
        slot.cooldownUntil = 0;
        changed = true;
      } else if (slot.task && !slot.task.completed && slot.task.expiresAt && slot.task.expiresAt <= now) {
        slot.task = null;
        slot.cooldownUntil = 0;
        changed = true;
      }
      if (!slot.task && (!slot.cooldownUntil || slot.cooldownUntil <= now)) {
        slot.task = this.makeTask(tier, world, context, now);
        if (slot.task) {
          slot.cooldownUntil = 0;
          changed = true;
        } else if (!slot.cooldownUntil) {
          // Keep an unavailable tier asleep briefly; later unlocks are picked up without polling every frame.
          slot.cooldownUntil = now + 5 * 60 * 1000;
          changed = true;
        }
      }
    }
    return changed;
  }

  recordEvent(world, event, context, now = Date.now()) {
    this.refresh(world, context, now);
    const newlyCompleted = [];
    for (const tierConfig of this.config.tiers) {
      const task = world.objectiveStates[String(tierConfig.level)]?.task;
      if (!task || task.completed) continue;
      let taskChanged = false;
      task.goals.forEach((goal, index) => {
        const isActivity = goal.type === 'activity' && ACTIVE_ACTIVITY_TYPES.has(event.type);
        const eventMatches = goal.type === event.type
          || (goal.type === 'expedition-area' && event.type === 'expedition')
          || isActivity;
        if (!eventMatches || (goal.areaId && goal.areaId !== event.areaId)) return;
        const amount = isActivity ? 1 : Math.max(0, Math.floor(Number(event.amount) || 0));
        if (!amount) return;
        const next = Math.min(goal.target, task.progress[index] + amount);
        if (next !== task.progress[index]) {
          task.progress[index] = next;
          taskChanged = true;
        }
      });
      if (taskChanged && task.progress.every((amount, index) => amount >= task.goals[index].target)) {
        task.completed = true;
        task.completedAt = now;
        newlyCompleted.push(task);
        world.objectiveHistory.push({ id: task.id, tier: task.tier, objectiveType: task.objectiveType, completedAt: now });
        world.objectiveHistory = world.objectiveHistory.slice(-this.config.recentHistoryLimit);
      }
    }
    return newlyCompleted;
  }

  claim(world, tier, ticketManager, now = Date.now()) {
    const slot = world.objectiveStates?.[String(tier)];
    const task = slot?.task;
    if (!task?.completed || !Number.isInteger(tier) || tier < 1 || tier > 5) {
      return { ok: false, reason: 'not-complete' };
    }
    const result = ticketManager.awardActive(world, task.reward, { now, source: 'rotating objective' });
    const duration = this.config.tiers[tier - 1].refreshMs;
    slot.task = null;
    slot.cooldownUntil = tier === 5 ? nextLocalMidnight(now) : now + duration;
    return {
      ok: true,
      reward: result.granted,
      requestedReward: task.reward,
      blockedBy: result.blockedBy,
      taskName: task.name,
      refreshAt: slot.cooldownUntil,
    };
  }
}
