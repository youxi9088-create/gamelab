const RARITY_ORDER = Object.freeze({
  Common: 1,
  Uncommon: 2,
  Rare: 3,
  'Super Rare': 4,
  'Ultra Rare': 5,
  Epic: 6,
  Legendary: 7,
  Unique: 8,
});

const PET_IDS = new Set(['mango', 'beans', 'trash', 'luna']);
const CATEGORIES = new Set(['ambient', 'hint', 'discovery', 'progression', 'unlock']);
const MAX_QUEUE = 24;
const MAX_HISTORY = 100;
const DEFAULT_DURATION_MS = 3900;

// Dialogue is content data: future reactions can be added here without changing
// the manager or the game loop. Templates may use values from an event payload.
export const PET_DIALOGUE_DEFINITIONS = [
  {
    id: 'ambient-mango-room', category: 'ambient', trigger: 'ambient', pet: 'mango',
    requirements: {}, priority: 10, cooldownMs: 240000, weight: 3, durationMs: 4200,
    dialogue: ['I wonder what’s hiding out there…', 'I like our little room. What should we discover next?', 'Every window looks like the start of a story.'],
  },
  {
    id: 'ambient-beans-room', category: 'ambient', trigger: 'ambient', pet: 'beans',
    requirements: {}, priority: 10, cooldownMs: 240000, weight: 3, durationMs: 4200,
    dialogue: ['Everything we need is right where we left it. Probably.', 'This is a very well-organized little corner. Mostly.', 'I’ve been keeping an eye on that window.'],
  },
  {
    id: 'ambient-trash-room', category: 'ambient', trigger: 'ambient', pet: 'trash',
    requirements: {}, priority: 10, cooldownMs: 240000, weight: 3, durationMs: 4200,
    dialogue: ['I found a crumb. It was already mine.', 'This room has excellent hiding spots.', 'If we stare at the window long enough, treasure might appear.'],
  },
  {
    id: 'ambient-luna-room', category: 'ambient', trigger: 'ambient', pet: 'luna',
    requirements: {}, priority: 10, cooldownMs: 240000, weight: 3, durationMs: 4200,
    dialogue: ['The quiet has a little shimmer tonight.', 'I like how the lamplight rests here.', 'Somewhere, a tiny thing is waiting to be noticed.'],
  },
  {
    id: 'ambient-luna-night', category: 'ambient', trigger: 'ambient', pet: 'luna',
    requirements: { timeOfDay: 'night' }, priority: 10, cooldownMs: 240000, weight: 2, durationMs: 4200,
    dialogue: ['The night is full of secrets. We can listen awhile.', 'Moonlight makes everything feel a little possible.'],
  },
  {
    id: 'pet-tap-mango', category: 'ambient', trigger: 'petTap', pet: 'mango',
    requirements: {}, priority: 16, cooldownMs: 45000, durationMs: 3200,
    dialogue: ['Oh! Did you hear that little rustle?', 'Ready when you are, friend.'],
  },
  {
    id: 'pet-tap-beans', category: 'ambient', trigger: 'petTap', pet: 'beans',
    requirements: {}, priority: 16, cooldownMs: 45000, durationMs: 3200,
    dialogue: ['Just checking in. Everything is in order.', 'A good pat. Very efficient.'],
  },
  {
    id: 'pet-tap-trash', category: 'ambient', trigger: 'petTap', pet: 'trash',
    requirements: {}, priority: 16, cooldownMs: 45000, durationMs: 3200,
    dialogue: ['Psst. I was saving you a shiny thing. It’s invisible.', 'Hehe! Lucky us.'],
  },
  {
    id: 'pet-tap-luna', category: 'ambient', trigger: 'petTap', pet: 'luna',
    requirements: {}, priority: 16, cooldownMs: 45000, durationMs: 3200,
    dialogue: ['A little hello, soft as moonlight.', 'I’m right here with you.'],
  },
  {
    id: 'level-up', category: 'progression', trigger: 'levelUp',
    requirements: { excludeMilestoneLevel: true }, priority: 88, cooldownMs: 0,
    historyScope: 'level', oneTime: true, headline: 'LEVEL UP · {level}', visual: 'level-up', durationMs: 4600,
    dialogue: {
      mango: ['Whoa! We leveled up to {level}!', 'I wonder what Level {level} has in store…'],
      beans: ['Nice! We’re getting better at this. Level {level}!', 'Level {level}! That opens up new possibilities.'],
      trash: ['LEVEL {level}! We’re getting dangerous.', 'Lucky us—another level!'],
      luna: ['We’re growing stronger. Level {level}.', 'The world feels a little larger now.'],
    },
  },
  {
    id: 'level-milestone', category: 'progression', trigger: 'levelUp',
    requirements: { milestoneLevel: true }, priority: 102, cooldownMs: 0,
    historyScope: 'level', oneTime: true, headline: 'A POCKETWILD MILESTONE · {level}', visual: 'milestone', durationMs: 5000,
    dialogue: {
      mango: ['We made it to {level}! I wonder what’s waiting now!'],
      beans: ['Look how far we’ve come. Level {level}!', 'A very tidy milestone. We earned this.'],
      trash: ['Level {level}! We’re officially a little bit legendary.'],
      luna: ['Level {level}. Another page of our story, softly turned.'],
    },
  },
  {
    id: 'master-collector', category: 'progression', trigger: 'masterCollector',
    requirements: { requiredSystem: 'collection' }, priority: 120, cooldownMs: 0,
    oneTime: true, historyScope: 'global', headline: 'MASTER COLLECTOR', visual: 'master', durationMs: 5600,
    dialogue: {
      mango: ['WE MADE IT! We found so much together!'],
      beans: ['That’s quite an accomplishment. I’m glad we did it together.'],
      trash: ['Okay… you’re officially a big deal. Lucky me, too.'],
      luna: ['The world has revealed many of its secrets to you.'],
    },
  },
  {
    id: 'discovery-common', category: 'discovery', trigger: 'newDiscovery',
    requirements: { rarities: ['Common'] }, priority: 34, cooldownMs: 90000, chance: 0.2,
    historyScope: 'item', durationMs: 3400,
    dialogue: {
      mango: ['A new little thing for our journal!'], beans: ['A useful little find.'],
      trash: ['Ooooh, a new thing!'], luna: ['A small discovery. How lovely.'],
    },
  },
  {
    id: 'discovery-uncommon', category: 'discovery', trigger: 'newDiscovery',
    requirements: { rarities: ['Uncommon'] }, priority: 48, cooldownMs: 45000, chance: 0.58,
    historyScope: 'item', durationMs: 3600,
    dialogue: {
      mango: ['Whoa! I’ve never seen one of those before!'], beans: ['That’s a useful find. Nice noticing.'],
      trash: ['Ooooh… this one feels lucky.'], luna: ['What a strange little discovery…'],
    },
  },
  {
    id: 'discovery-rare', category: 'discovery', trigger: 'newDiscovery',
    requirements: { rarityAtLeast: 'Rare' }, priority: 78, cooldownMs: 0,
    oneTime: true, historyScope: 'item', headline: 'A RARE LITTLE FIND', visual: 'rare', durationMs: 4700,
    dialogue: {
      mango: ['Whoa! That’s not something we see every day!'], beans: ['A rare find. We’ll remember this one.'],
      trash: ['Ooooh… shiny! That’s a very lucky find.'], luna: ['A rare little wonder. The world is kind tonight.'],
    },
  },
  {
    id: 'discovery-super-rare', category: 'discovery', trigger: 'newDiscovery',
    requirements: { rarities: ['Super Rare'] }, priority: 88, cooldownMs: 0,
    oneTime: true, historyScope: 'item', headline: 'SUPER RARE!', visual: 'rare', durationMs: 4900,
    dialogue: {
      mango: ['We actually found one! Look at it!'], beans: ['That’s quite a find. I’m impressed.'],
      trash: ['WE ACTUALLY FOUND ONE!'], luna: ['Even the moonlight paused for this one.'],
    },
  },
  {
    id: 'discovery-ultra-rare', category: 'discovery', trigger: 'newDiscovery',
    requirements: { rarityAtLeast: 'Ultra Rare' }, priority: 98, cooldownMs: 0,
    oneTime: true, historyScope: 'item', headline: 'AN EXTRAORDINARY DISCOVERY', visual: 'rare', durationMs: 5200,
    dialogue: {
      mango: ['…YOU FOUND THAT?!'], beans: ['I think we should take a moment to admire this.'],
      trash: ['…YOU FOUND THAT?! LUCKY US!'], luna: ['A little piece of the impossible.'],
    },
  },
  {
    id: 'zone-unlocked', category: 'unlock', trigger: 'zoneUnlocked',
    requirements: { requiredSystem: 'exploration' }, priority: 82, cooldownMs: 0,
    oneTime: true, historyScope: 'zone', headline: 'A NEW PLACE IS OPEN', visual: 'unlock', durationMs: 4700,
    dialogue: {
      mango: ['That place is new! Let’s see what’s out there!'],
      beans: ['Looks like we’ve got somewhere new to explore.'],
      trash: ['Ooooh. New place. New stuff.'],
      luna: ['Something tells me {zoneName} has secrets.'],
    },
  },
  {
    id: 'crafting-system-unlocked', category: 'unlock', trigger: 'systemUnlocked',
    requirements: { system: 'crafting' }, priority: 76, cooldownMs: 0,
    oneTime: true, historyScope: 'system', headline: 'A NEW LITTLE POSSIBILITY', visual: 'unlock', durationMs: 4400,
    dialogue: {
      mango: ['Ooh! We can make things now!'], beans: ['A recipe note. I knew keeping those ingredients was sensible.'],
      trash: ['We can make stuff? I’m listening.'], luna: ['A new sort of magic, waiting in a little recipe.'],
    },
  },
  {
    id: 'potion-recipe-unlocked', category: 'unlock', trigger: 'potionUnlocked',
    requirements: { requiredSystem: 'crafting' }, priority: 62, cooldownMs: 120000,
    historyScope: 'recipe', durationMs: 3900,
    dialogue: {
      mango: ['A new potion recipe! I wonder what it’ll do.'], beans: ['A new recipe. Let’s see what it needs.'],
      trash: ['Ooh, something bubbly to make.'], luna: ['A new brew joins our little collection.'],
    },
  },
  {
    id: 'craft-missing-gold', category: 'hint', trigger: 'craftBlocked',
    requirements: { reason: 'insufficient-gold', requiredSystem: 'crafting' }, priority: 72, cooldownMs: 1500000,
    historyScope: 'recipe', suggestedAction: 'inventory-sell', durationMs: 4300,
    dialogue: {
      mango: ['We’ve got all the ingredients—just a little short on Gold. Maybe Clover would buy a spare find?'],
      beans: ['Everything’s ready except the Gold. Maybe we have something extra Clover could buy.'],
      trash: ['We’re short on coins. Psst… Clover buys spare treasures.'],
      luna: ['The ingredients are here. A few coins may be tucked in our extra finds.'],
    },
  },
  {
    id: 'craft-missing-material', category: 'hint', trigger: 'craftBlocked',
    requirements: { reason: 'missing-material', requiredSystem: 'crafting' }, priority: 70, cooldownMs: 1200000,
    historyScope: 'recipe-material', suggestedAction: 'explore-source', durationMs: 4200,
    dialogue: {
      mango: ['We’re missing a little {itemName}. Maybe another trip to {zoneName} will turn one up.'],
      beans: ['We need a bit more {itemName}. {zoneName} is a good place to look.'],
      trash: ['No {itemName}? I bet {zoneName} has some. Probably.'],
      luna: ['A little {itemName} is still waiting in {zoneName}, I think.'],
    },
  },
  {
    id: 'locked-area', category: 'hint', trigger: 'lockedAreaAttempt',
    requirements: { requiredSystem: 'exploration' }, priority: 68, cooldownMs: 900000,
    historyScope: 'zone', suggestedAction: 'gain-progress', durationMs: 3900,
    dialogue: {
      mango: ['Not yet… I think we need a little more trail practice first.'],
      beans: ['That path opens with a bit more exploring. We’ll get there.'],
      trash: ['Locked for now. We’ll find the key… or the right level.'],
      luna: ['Not yet. A little more growing, then the path will appear.'],
    },
  },
  {
    id: 'low-gold', category: 'hint', trigger: 'lowGold',
    requirements: { requiredSystem: 'inventory' }, priority: 64, cooldownMs: 1500000,
    historyScope: 'shop-item', suggestedAction: 'inventory-sell', durationMs: 4000,
    dialogue: {
      mango: ['We’re a little short on Gold. Maybe there’s something in our bag we can spare?'],
      beans: ['We could sell a few extra finds to Clover for Gold.'],
      trash: ['Psst… Clover might pay for something we’re not using.'],
      luna: ['A few spare things might turn into the coins we need.'],
    },
  },
  {
    id: 'inventory-full', category: 'hint', trigger: 'inventoryFull',
    requirements: { requiredSystem: 'inventory' }, priority: 66, cooldownMs: 1200000,
    historyScope: 'global', suggestedAction: 'inventory-sell', durationMs: 3900,
    dialogue: {
      mango: ['Our bag is stuffed! Maybe we could make a little room.'],
      beans: ['We’re out of room. Clover could take a few spare things.'],
      trash: ['Our bag is full! I can sit on the lid if that helps.'],
      luna: ['Our little bag is full. We could make space when we feel like it.'],
    },
  },
  {
    id: 'unused-materials', category: 'hint', trigger: 'unusedMaterials',
    requirements: { requiredSystem: 'crafting' }, priority: 35, cooldownMs: 3600000,
    historyScope: 'item', suggestedAction: 'craft-or-keep', durationMs: 3900,
    dialogue: {
      mango: ['We’ve collected quite a pile of {itemName}… I wonder what we could make.'],
      beans: ['We have a lot of {itemName}. It could be useful in a recipe.'],
      trash: ['That’s a suspiciously large pile of {itemName}. Keep it? Make something?'],
      luna: ['Our {itemName} collection has grown rather lovely.'],
    },
  },
  {
    id: 'crafting-success', category: 'ambient', trigger: 'craftSucceeded',
    requirements: { requiredSystem: 'crafting' }, priority: 38, cooldownMs: 120000,
    historyScope: 'recipe', durationMs: 3600,
    dialogue: {
      mango: ['That smelled interesting! What should we make next?'], beans: ['Nice work. No spills, either.'],
      trash: ['We made a thing! Does it have a shiny wrapper?'], luna: ['A small bit of magic, made by us.'],
    },
  },
];

function blankState() {
  return { history: {}, queue: [], active: null, lastAmbientAt: 0, idleMs: 0, nextSequence: 1 };
}

function cleanEvent(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const category = CATEGORIES.has(raw.category) ? raw.category : null;
  const text = typeof raw.text === 'string' ? raw.text.trim().slice(0, 180) : '';
  if (!category || !text) return null;
  const priority = Math.max(0, Math.min(200, Math.floor(Number(raw.priority) || 0)));
  const durationMs = Math.max(1800, Math.min(7000, Math.floor(Number(raw.durationMs) || DEFAULT_DURATION_MS)));
  const remainingMs = Math.max(0, Math.min(durationMs, Number.isFinite(Number(raw.remainingMs)) ? Number(raw.remainingMs) : durationMs));
  return {
    id: typeof raw.id === 'string' ? raw.id.slice(0, 120) : '',
    dialogueId: typeof raw.dialogueId === 'string' ? raw.dialogueId.slice(0, 80) : '',
    historyKey: typeof raw.historyKey === 'string' ? raw.historyKey.slice(0, 120) : '',
    category,
    priority,
    text,
    headline: typeof raw.headline === 'string' ? raw.headline.slice(0, 64) : '',
    visual: typeof raw.visual === 'string' ? raw.visual.slice(0, 24) : 'soft',
    suggestedAction: typeof raw.suggestedAction === 'string' ? raw.suggestedAction.slice(0, 48) : '',
    durationMs,
    remainingMs,
    sequence: Math.max(0, Math.floor(Number(raw.sequence) || 0)),
  };
}

function interpolate(text, payload) {
  return String(text || '').replace(/\{([a-zA-Z][\w]*)\}/g, (_, key) => {
    const value = payload?.[key];
    return value === undefined || value === null ? '' : String(value);
  }).replace(/\s{2,}/g, ' ').trim();
}

export class PetDialogueManager {
  constructor({ definitions = PET_DIALOGUE_DEFINITIONS, enabled = true, random = Math.random } = {}) {
    this.definitions = definitions;
    this.enabled = Boolean(enabled);
    this.random = random;
  }

  createState() {
    return blankState();
  }

  sanitizeState(raw) {
    const result = blankState();
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return result;
    if (raw.history && typeof raw.history === 'object' && !Array.isArray(raw.history)) {
      const validIds = new Set(this.definitions.map((definition) => definition.id));
      for (const [key, value] of Object.entries(raw.history).slice(-MAX_HISTORY)) {
        if (!key || !value || typeof value !== 'object' || !validIds.has(String(value.dialogueId || ''))) continue;
        result.history[String(key).slice(0, 120)] = {
          dialogueId: String(value.dialogueId).slice(0, 80),
          lastShownAt: Math.max(0, Math.floor(Number(value.lastShownAt) || 0)),
          count: Math.max(0, Math.min(100000, Math.floor(Number(value.count) || 0))),
          dismissed: Boolean(value.dismissed),
          oneTime: Boolean(value.oneTime),
        };
      }
    }
    result.queue = Array.isArray(raw.queue) ? raw.queue.map(cleanEvent).filter(Boolean).slice(0, MAX_QUEUE) : [];
    result.active = cleanEvent(raw.active);
    result.lastAmbientAt = Math.max(0, Math.floor(Number(raw.lastAmbientAt) || 0));
    result.idleMs = Math.max(0, Math.min(24 * 60 * 60 * 1000, Number(raw.idleMs) || 0));
    result.nextSequence = Math.max(1, Math.min(100000000, Math.floor(Number(raw.nextSequence) || 1)));
    return result;
  }

  state(world) {
    if (!world.petDialogue || typeof world.petDialogue !== 'object') world.petDialogue = blankState();
    return world.petDialogue;
  }

  active(world) {
    return this.enabled ? this.state(world).active : null;
  }

  noteActivity(world) {
    const dialogue = this.state(world);
    dialogue.idleMs = 0;
  }

  historyKey(definition, payload = {}) {
    const scope = definition.historyScope;
    const key = scope === 'level' ? payload.level
      : scope === 'item' ? payload.itemId
        : scope === 'recipe' ? payload.recipeId
          : scope === 'zone' ? payload.zoneId
            : scope === 'system' ? payload.system
              : scope === 'recipe-material' ? `${payload.recipeId || 'recipe'}:${payload.itemId || 'material'}`
                : scope === 'shop-item' ? payload.itemId || payload.targetId
                  : null;
    return `${definition.id}${key === null || key === undefined ? '' : `:${String(key)}`}`;
  }

  eligible(definition, payload, context) {
    if (definition.enabled === false) return false;
    if (definition.pet && definition.pet !== context.petId) return false;
    if (!PET_IDS.has(context.petId)) return false;
    const level = Math.max(1, Math.floor(Number(context.level) || 1));
    if (level < (definition.minLevel || 1) || level > (definition.maxLevel || Infinity)) return false;
    if (definition.requiredSystem && !context.systems?.[definition.requiredSystem]) return false;
    if (definition.requiredZone && !(context.unlockedZones || []).includes(definition.requiredZone)) return false;
    const requirements = definition.requirements || {};
    if (requirements.requiredSystem && !context.systems?.[requirements.requiredSystem]) return false;
    if (requirements.system && payload.system !== requirements.system) return false;
    if (requirements.reason && payload.reason !== requirements.reason) return false;
    if (requirements.timeOfDay && context.timeOfDay !== requirements.timeOfDay) return false;
    if (requirements.rarities && !requirements.rarities.includes(payload.rarity)) return false;
    if (requirements.rarityAtLeast && (RARITY_ORDER[payload.rarity] || 0) < (RARITY_ORDER[requirements.rarityAtLeast] || Infinity)) return false;
    if (requirements.milestoneLevel && Number(payload.level) % 10 !== 0) return false;
    if (requirements.excludeMilestoneLevel && Number(payload.level) % 10 === 0) return false;
    if (definition.chance !== undefined && this.random() > Math.max(0, Math.min(1, Number(definition.chance) || 0))) return false;
    return true;
  }

  selectDefinition(type, payload, context) {
    const matches = this.definitions.filter((definition) => definition.trigger === type && this.eligible(definition, payload, context));
    if (!matches.length) return null;
    const priority = Math.max(...matches.map((definition) => Number(definition.priority) || 0));
    const topPriority = matches.filter((definition) => (Number(definition.priority) || 0) === priority);
    const total = topPriority.reduce((sum, definition) => sum + Math.max(0, Number(definition.weight) || 1), 0);
    let roll = this.random() * total;
    for (const definition of topPriority) {
      roll -= Math.max(0, Number(definition.weight) || 1);
      if (roll < 0) return definition;
    }
    return topPriority.at(-1) || null;
  }

  trigger(world, type, payload = {}, context = {}, now = Date.now()) {
    if (!this.enabled || !world || !context.petId) return false;
    const definition = this.selectDefinition(type, payload, context);
    if (!definition) return false;
    const dialogue = this.state(world);
    const historyKey = this.historyKey(definition, payload);
    const history = dialogue.history[historyKey];
    if (definition.oneTime && history?.oneTime) return false;
    if (history?.lastShownAt && now - history.lastShownAt < Math.max(0, Number(definition.cooldownMs) || 0)) return false;
    if (dialogue.active?.historyKey === historyKey || dialogue.queue.some((event) => event.historyKey === historyKey)) return false;

    const petLines = definition.dialogue?.[context.petId] || definition.dialogue?.default || definition.dialogue;
    const line = Array.isArray(petLines) ? petLines[Math.floor(this.random() * petLines.length)] : petLines;
    const text = interpolate(line, payload);
    if (!text) return false;
    const event = cleanEvent({
      id: `${historyKey}:${Math.floor(now)}:${dialogue.nextSequence}`,
      dialogueId: definition.id,
      historyKey,
      category: definition.category,
      priority: definition.priority,
      text,
      headline: definition.headline ? interpolate(definition.headline, payload) : '',
      visual: definition.visual || 'soft',
      suggestedAction: definition.suggestedAction || '',
      durationMs: definition.durationMs,
      remainingMs: definition.durationMs,
      sequence: dialogue.nextSequence++,
    });
    if (!event) return false;
    if (definition.oneTime) {
      dialogue.history[historyKey] = {
        dialogueId: definition.id,
        lastShownAt: history?.lastShownAt || 0,
        count: history?.count || 0,
        dismissed: false,
        oneTime: true,
      };
    }
    if (type === 'ambient') dialogue.idleMs = 0;

    // Let a meaningful reaction take the floor from an ambient aside. Other
    // important reactions remain queued and are sorted by priority.
    if (dialogue.active?.category === 'ambient' && event.priority > dialogue.active.priority) {
      dialogue.active = null;
    }
    if (!dialogue.active && !dialogue.queue.length) {
      dialogue.active = event;
      this.recordShown(dialogue, event, now);
    } else {
      dialogue.queue.push(event);
      dialogue.queue.sort((a, b) => b.priority - a.priority || a.sequence - b.sequence);
      if (dialogue.queue.length > MAX_QUEUE) {
        const lowest = dialogue.queue.at(-1);
        if (lowest.priority <= 10) {
          dialogue.queue.pop();
          if (lowest.historyKey) delete dialogue.history[lowest.historyKey];
        } else {
          dialogue.queue.length = MAX_QUEUE;
        }
      }
    }
    this.pruneHistory(dialogue);
    return true;
  }

  recordShown(dialogue, event, now) {
    const previous = dialogue.history[event.historyKey] || {};
    dialogue.history[event.historyKey] = {
      dialogueId: event.dialogueId,
      lastShownAt: now,
      count: Math.min(100000, (Number(previous.count) || 0) + 1),
      dismissed: false,
      oneTime: Boolean(previous.oneTime),
    };
    if (event.category === 'ambient') dialogue.lastAmbientAt = now;
  }

  pruneHistory(dialogue) {
    const entries = Object.entries(dialogue.history);
    if (entries.length <= MAX_HISTORY) return;
    entries.sort((a, b) => (Number(a[1].lastShownAt) || 0) - (Number(b[1].lastShownAt) || 0));
    for (const [key, value] of entries.slice(0, entries.length - MAX_HISTORY)) {
      if (value.oneTime || dialogue.active?.historyKey === key || dialogue.queue.some((event) => event.historyKey === key)) continue;
      delete dialogue.history[key];
    }
  }

  startNext(dialogue, now) {
    if (dialogue.active || !dialogue.queue.length) return null;
    dialogue.queue.sort((a, b) => b.priority - a.priority || a.sequence - b.sequence);
    dialogue.active = dialogue.queue.shift();
    this.recordShown(dialogue, dialogue.active, now);
    return dialogue.active;
  }

  update(world, deltaSeconds, context = {}, now = Date.now()) {
    if (!this.enabled || !world || !context.petId) return { changed: false, started: null, finished: false };
    const dialogue = this.state(world);
    const deltaMs = Math.max(0, Math.min(100, Number(deltaSeconds) * 1000 || 0));
    let changed = false;
    let finished = false;
    if (dialogue.active && deltaMs > 0) {
      dialogue.active.remainingMs = Math.max(0, dialogue.active.remainingMs - deltaMs);
      if (dialogue.active.remainingMs <= 0) {
        dialogue.active = null;
        changed = true;
        finished = true;
      }
    }
    let started = null;
    if (!dialogue.active) {
      started = this.startNext(dialogue, now);
      if (started) changed = true;
    }

    if (context.allowAmbient && deltaMs > 0 && !dialogue.active && !dialogue.queue.length) {
      dialogue.idleMs += deltaMs;
      const ambientReady = now - dialogue.lastAmbientAt >= 240000;
      if (dialogue.idleMs >= 45000 && ambientReady && this.random() < 0.0032) {
        changed = this.trigger(world, 'ambient', { eventKey: `idle:${Math.floor(now / 60000)}` }, context, now) || changed;
        if (dialogue.active) started = dialogue.active;
      }
    }
    return { changed, started, finished };
  }

  dismiss(world, now = Date.now()) {
    if (!this.enabled || !world) return false;
    const dialogue = this.state(world);
    if (!dialogue.active) return false;
    const history = dialogue.history[dialogue.active.historyKey];
    if (history) history.dismissed = true;
    dialogue.active = null;
    this.startNext(dialogue, now);
    return true;
  }
}
