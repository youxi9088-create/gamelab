const NPC_DEFINITIONS = Object.freeze({
  clover: Object.freeze({
    id: 'clover',
    name: 'Clover',
    location: 'room-shop',
    personality: ['patient', 'observant', 'gently curious'],
    preferredTopics: ['new discoveries', 'room comforts', 'the changing seasons'],
    likes: ['unusual finds', 'thoughtful room changes', 'tidy little trades'],
    dislikes: ['waste', 'rushing a good story'],
    routine: [
      { from: 5, to: 11, activity: 'sorting the morning seed packets' },
      { from: 11, to: 17, activity: 'tending the little shop shelf' },
      { from: 17, to: 21, activity: 'checking the window for returning explorers' },
      { from: 21, to: 5, activity: 'keeping a lamp on for night wanderers' },
    ],
    responses: [
      {
        id: 'noticed-rare-find', event: 'discovery', priority: 90, maxAgeMs: 7 * 86400000,
        cooldownMs: 6 * 3600000, when: { minRarity: 'Rare' },
        lines: [
          'A {itemName}? I thought I saw its little glimmer in the distance. I’m glad it found its way to you.',
          'That’s a remarkable find, {playerName}. It feels like the world has been waiting for someone to notice it.',
        ],
      },
      {
        id: 'noticed-new-place', event: 'expedition-return', priority: 70, maxAgeMs: 86400000,
        cooldownMs: 2 * 3600000,
        lines: [
          'Back from {zoneName} already? The air around you smells like somewhere new.',
          'You’re home! I was just wondering what the path through {zoneName} looked like today.',
        ],
      },
      {
        id: 'noticed-room-change', event: 'room-change', priority: 60, maxAgeMs: 3 * 86400000,
        cooldownMs: 8 * 3600000,
        lines: [
          'A little change to your room makes the whole place feel new. I like it, {playerName}.',
          'I noticed your room has a different feeling today. It suits you.',
        ],
      },
      {
        id: 'noticed-growth', event: 'level-up', priority: 65, maxAgeMs: 3 * 86400000,
        cooldownMs: 8 * 3600000,
        lines: [
          'You’ve been growing into your explorer boots. I can tell, {playerName}.',
          'A little more of Pocketwild has opened up to you. How lovely to watch.',
        ],
      },
      {
        id: 'noticed-craft', event: 'craft', priority: 45, maxAgeMs: 86400000,
        cooldownMs: 4 * 3600000,
        lines: [
          'I smelled something bubbling earlier. Whatever you made, it sounded like a good idea.',
          'There’s something satisfying about making a useful little thing by hand, isn’t there?',
        ],
      },
      {
        id: 'noticed-trade', event: 'trade', priority: 50, maxAgeMs: 86400000,
        cooldownMs: 2 * 3600000,
        lines: [
          'A {itemName} found a new home. Thank you for trusting me to keep it safe.',
          'A tidy little trade, and a good story to go with it. Thank you!',
        ],
      },
    ],
    greetings: {
      new: ['Welcome in. Take your time; the shelf isn’t going anywhere.', 'Oh, hello! I was just making room for a few more little discoveries.'],
      familiar: ['Good to see you again. I kept the cozy things near the front.', 'There you are, {playerName}. The shop feels more like itself when you visit.'],
      close: ['My favorite regular. I saved the good patch of lamplight for you.', 'I had a feeling you’d stop by. Something about today felt like a visiting day.'],
    },
    ambient: {
      day: ['The morning light makes even the ordinary things look new.', 'I wonder what the paths are showing everyone today.'],
      dusk: ['The window gets such a lovely color just before evening.', 'There’s a little hush in the shop at this hour. I like it.'],
      night: ['The lamp is on for anyone who comes home after dark.', 'I saw a firefly pass the window. It looked like a tiny visitor.'],
    },
    interactionLines: [
      'Thank you. I’ll find a good place for this little thing.',
      'A fair trade, and a nice story to go with it. Thank you!',
      'I’ll keep this safe on the shelf. Come by again whenever you like.',
    ],
  }),
});

const RARITY_ORDER = Object.freeze({ Common: 1, Uncommon: 2, Rare: 3, 'Super Rare': 4, 'Ultra Rare': 5, Epic: 6, Legendary: 7, Unique: 8 });
const MAX_NPC_COUNT = 16;
const MAX_HISTORY = 40;

function cleanName(value, fallback = '') {
  return typeof value === 'string' ? value.trim().replace(/[<>]/g, '').slice(0, 64) : fallback;
}

function cleanEvent(raw) {
  if (!raw || typeof raw !== 'object' || typeof raw.type !== 'string') return null;
  const type = ['discovery', 'expedition-return', 'room-change', 'level-up', 'craft', 'trade'].includes(raw.type) ? raw.type : null;
  if (!type) return null;
  const rarity = Object.hasOwn(RARITY_ORDER, raw.rarity) ? raw.rarity : '';
  return {
    type,
    at: Math.max(0, Math.floor(Number(raw.at) || 0)),
    itemName: cleanName(raw.itemName),
    rarity,
    zoneName: cleanName(raw.zoneName),
    themeName: cleanName(raw.themeName),
    level: Math.max(0, Math.floor(Number(raw.level) || 0)),
  };
}

function blankCharacter() {
  return { familiarity: 0, interactions: 0, firstMetAt: 0, lastInteractionAt: 0, lastEvent: null, history: [], lastLine: '' };
}

function interpolate(line, values) {
  return String(line || '').replace(/\{([a-zA-Z][\w]*)\}/g, (_, key) => cleanName(values?.[key], '')).replace(/\s{2,}/g, ' ').trim();
}

export class NPCBehaviorManager {
  constructor({ definitions = NPC_DEFINITIONS } = {}) {
    this.definitions = definitions;
  }

  createState() {
    return { characters: {} };
  }

  sanitizeState(raw) {
    const result = this.createState();
    if (!raw || typeof raw !== 'object' || Array.isArray(raw) || !raw.characters || typeof raw.characters !== 'object' || Array.isArray(raw.characters)) return result;
    for (const [npcId, saved] of Object.entries(raw.characters).slice(-MAX_NPC_COUNT)) {
      if (!this.definitions[npcId] || !saved || typeof saved !== 'object') continue;
      const character = blankCharacter();
      character.familiarity = Math.min(100, Math.max(0, Math.floor(Number(saved.familiarity) || 0)));
      character.interactions = Math.min(100000, Math.max(0, Math.floor(Number(saved.interactions) || 0)));
      character.firstMetAt = Math.max(0, Math.floor(Number(saved.firstMetAt) || 0));
      character.lastInteractionAt = Math.max(0, Math.floor(Number(saved.lastInteractionAt) || 0));
      character.lastEvent = cleanEvent(saved.lastEvent);
      character.lastLine = cleanName(saved.lastLine, '').slice(0, 180);
      character.history = Array.isArray(saved.history)
        ? saved.history.filter((entry) => entry && typeof entry.id === 'string')
          .slice(-MAX_HISTORY)
          .map((entry) => ({ id: entry.id.slice(0, 80), at: Math.max(0, Math.floor(Number(entry.at) || 0)), count: Math.min(100000, Math.max(0, Math.floor(Number(entry.count) || 0))) }))
        : [];
      result.characters[npcId] = character;
    }
    return result;
  }

  character(world, npcId) {
    if (!this.definitions[npcId]) return null;
    if (!world.npcMemory || typeof world.npcMemory !== 'object' || Array.isArray(world.npcMemory)) world.npcMemory = this.createState();
    if (!world.npcMemory.characters || typeof world.npcMemory.characters !== 'object') world.npcMemory.characters = {};
    if (!world.npcMemory.characters[npcId]) world.npcMemory.characters[npcId] = blankCharacter();
    return world.npcMemory.characters[npcId];
  }

  rememberWorldEvent(world, npcId, type, payload = {}, now = Date.now()) {
    const character = this.character(world, npcId);
    if (!character) return false;
    const event = cleanEvent({ type, ...payload, at: now });
    if (!event) return false;
    character.lastEvent = event;
    return true;
  }

  routine(definition, now) {
    const hour = new Date(now).getHours();
    return definition.routine.find((entry) => entry.from < entry.to
      ? hour >= entry.from && hour < entry.to
      : hour >= entry.from || hour < entry.to) || definition.routine[0];
  }

  contextualResponse(character, definition, playerName, now, { markShown = false } = {}) {
    const event = character?.lastEvent;
    if (!event) return null;
    const responses = definition.responses.filter((entry) => entry.event === event.type
      && now - event.at <= entry.maxAgeMs
      && (!entry.when?.minRarity || (RARITY_ORDER[event.rarity] || 0) >= (RARITY_ORDER[entry.when.minRarity] || Infinity))
      && now - (character.history.find((record) => record.id === entry.id)?.at || 0) >= entry.cooldownMs)
      .sort((a, b) => b.priority - a.priority);
    const response = responses[0];
    if (!response) return null;
    const prior = character.history.find((record) => record.id === response.id);
    const lines = response.lines;
    const lineIndex = (prior?.count || 0) % lines.length;
    const text = interpolate(lines[lineIndex], { ...event, playerName: cleanName(playerName, 'friend') || 'friend' });
    if (markShown) this.markLine(character, response.id, text, now);
    return { text, responseId: response.id, mood: 'attentive', context: event.type };
  }

  presence(world, npcId, { playerName = '', now = Date.now() } = {}) {
    const definition = this.definitions[npcId];
    if (!definition) return null;
    const character = this.character(world, npcId);
    const routine = this.routine(definition, now);
    const contextual = this.contextualResponse(character, definition, playerName, now);
    const familiar = character.familiarity >= 8;
    const time = new Date(now).getHours();
    const timeOfDay = time >= 19 || time < 6 ? 'night' : time >= 17 ? 'dusk' : 'day';
    const pool = contextual ? null : definition.ambient[timeOfDay];
    const recentInteraction = character.lastLine && now - character.lastInteractionAt < 90000;
    const line = recentInteraction
      ? character.lastLine
      : contextual?.text || interpolate(pool[(character.interactions + Math.floor(now / 60000)) % pool.length], { playerName: cleanName(playerName, 'friend') || 'friend' });
    return {
      id: npcId,
      name: definition.name,
      personality: definition.personality,
      preferredTopics: definition.preferredTopics,
      likes: definition.likes,
      dislikes: definition.dislikes,
      location: definition.location,
      activity: routine.activity,
      mood: contextual?.mood || (familiar ? 'warm' : 'content'),
      familiarity: character.familiarity,
      interactions: character.interactions,
      line,
      lineSource: contextual ? contextual.context : 'ambient',
    };
  }

  interact(world, npcId, { playerName = '', itemName = '', now = Date.now() } = {}) {
    const definition = this.definitions[npcId];
    const character = this.character(world, npcId);
    if (!definition || !character) return null;
    if (!character.firstMetAt) character.firstMetAt = now;
    character.interactions = Math.min(100000, character.interactions + 1);
    character.familiarity = Math.min(100, character.familiarity + (character.interactions < 5 ? 2 : 1));
    character.lastInteractionAt = now;
    const contextual = this.contextualResponse(character, definition, playerName, now, { markShown: true });
    const pool = contextual ? null : character.familiarity >= 16 ? definition.greetings.close
      : character.familiarity >= 5 ? definition.greetings.familiar : definition.greetings.new;
    const fallback = definition.interactionLines[(character.interactions - 1) % definition.interactionLines.length];
    const text = contextual?.text || interpolate(pool[(character.interactions - 1) % pool.length] || fallback, { playerName: cleanName(playerName, 'friend') || 'friend', itemName });
    if (!contextual) this.markLine(character, `interaction-${Math.min(character.interactions, 3)}`, text, now);
    character.lastLine = text.slice(0, 180);
    return { npcId, name: definition.name, text, familiarity: character.familiarity, mood: contextual?.mood || 'warm' };
  }

  markLine(character, id, text, now) {
    const existing = character.history.find((entry) => entry.id === id);
    if (existing) {
      existing.at = now;
      existing.count = Math.min(100000, existing.count + 1);
    } else {
      character.history.push({ id, at: now, count: 1 });
    }
    character.history = character.history.slice(-MAX_HISTORY);
    character.lastLine = String(text || '').slice(0, 180);
  }
}
