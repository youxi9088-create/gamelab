const SIMULATED_SOCIAL_KEY = 'pocketwild-simulated-social-v1';
const SIMULATED_DEVICE_KEY = 'pocketwild-simulated-device-v1';

export const SIMULATED_LEVEL_DISTRIBUTION = Object.freeze({
  // Simulated profiles now include the first Amberfall chapter through Level 60.
  zoneWeights: Object.freeze([32, 25, 18, 11, 9, 5]),
});

const ARCHETYPES = Object.freeze([
  { id: 'collector', label: 'Collector', weight: 22, completion: 0.91, discovery: 0.16, theme: 0.85, craft: 0.28 },
  { id: 'decorator', label: 'Decorator', weight: 19, completion: 0.76, discovery: 0.02, theme: 1.35, craft: 0.12 },
  { id: 'alchemist', label: 'Alchemist', weight: 13, completion: 0.94, discovery: 0.04, theme: 0.95, craft: 0.8 },
  { id: 'explorer', label: 'Explorer', weight: 20, completion: 0.86, discovery: 0.12, theme: 0.88, craft: 0.2 },
  { id: 'casual', label: 'Casual', weight: 20, completion: 0.61, discovery: -0.08, theme: 0.72, craft: 0.08 },
  { id: 'lucky', label: 'Lucky', weight: 6, completion: 0.8, discovery: 0.07, theme: 0.92, craft: 0.15 },
]);

const COZY_NAMES = Object.freeze([
  'Willow', 'Moss', 'Juniper', 'Bramble', 'Mochi', 'Fern', 'Pip', 'Clover', 'Noodle', 'Sunny',
  'Wisp', 'Maple', 'Sprout', 'Pebble', 'Basil', 'Miso', 'Dew', 'Poppy', 'Mallow', 'Bean',
  'MossyMochi', 'LittleFern', 'MoonBean', 'FroggyPip', 'WildWillow', 'MossAndMushrooms',
  'Nettle', 'AcornTea', 'Starling', 'HoneyThistle',
]);

const NAME_SEEDS = Object.freeze([
  ['sim_willow_48291', 'Willow'], ['sim_moss_73104', 'Moss'], ['sim_juniper_19385', 'Juniper'],
  ['sim_bramble_60412', 'Bramble'], ['sim_mochi_92816', 'Mochi'], ['sim_fern_35720', 'Fern'],
  ['sim_pip_84163', 'Pip'], ['sim_clover_27594', 'Clover'], ['sim_noodle_51638', 'Noodle'],
  ['sim_sunny_39047', 'Sunny'], ['sim_wisp_76205', 'Wisp'], ['sim_maple_14839', 'Maple'],
  ['sim_sprout_63071', 'Sprout'], ['sim_pebble_49528', 'Pebble'], ['sim_basil_20756', 'Basil'],
  ['sim_miso_85314', 'Miso'], ['sim_dew_41972', 'Dew'], ['sim_poppy_68103', 'Poppy'],
  ['sim_mallow_32485', 'Mallow'], ['sim_bean_90731', 'Bean'], ['sim_mossy-mochi_56820', 'MossyMochi'],
  ['sim_little-fern_13579', 'LittleFern'], ['sim_moon-bean_24680', 'MoonBean'],
  ['sim_froggy-pip_35791', 'FroggyPip'], ['sim_wild-willow_46802', 'WildWillow'],
  ['sim_moss-and-mushrooms_57913', 'MossAndMushrooms'], ['sim_nettle_68024', 'Nettle'],
  ['sim_acorn-tea_79135', 'AcornTea'], ['sim_starling_80246', 'Starling'], ['sim_honey-thistle_91357', 'HoneyThistle'],
]);

const BIOS = Object.freeze({
  collector: ['I keep a little page for every lovely thing.', 'My shelves are tiny, but they hold a lot of stories.', 'I like finding the one thing everyone else walked past.'],
  decorator: ['Moving one little chair can change a whole afternoon.', 'I make cozy corners for all my favorite finds.', 'Every room needs a place to pause and look around.'],
  alchemist: ['A good brew starts with a curious question.', 'I’m happiest with a warm lamp and a little mixing bowl.', 'The softest colors make the nicest potions.'],
  explorer: ['I always take the path with the interesting moss.', 'There’s something new around every bend.', 'My companion usually spots the trail first.'],
  casual: ['A quiet room and a kind friend are plenty.', 'I wander when the day feels like wandering.', 'Some finds are nice just because they remind me of home.'],
  lucky: ['Funny little things have a way of finding me.', 'I follow the fireflies if they seem friendly.', 'Sometimes the tiniest glimmer is the best one.'],
});

const ROOM_NAMES = Object.freeze({
  'starter-room': ['Little Nook', 'The Soft Landing', 'Acorn Corner'],
  'forest-cabin': ['Fernlight Cabin', 'The Mossy Shelf', 'Bramble Hideaway'],
  'mushroom-cottage': ['Toadstool Tea Room', 'The Little Cap', 'Mushroom Morning'],
  'moonlit-room': ['Moonbeam Nook', 'The Quiet Orbit', 'Starling’s Nightlight'],
  'swamp-shack': ['Dewdrop Shack', 'The Green Quiet', 'Lily Pad Landing'],
  'magical-observatory': ['The Little Lookout', 'Comet Corner', 'Window to the Stars'],
  'beach-house': ['Shellsong Room', 'The Sunny Tide', 'Pebble Shore'],
  'canopy-sanctuary': ['High Branch Home', 'The Whispering Room', 'Cloudleaf Nook'],
});

const PET_MOODS = Object.freeze(['bright-eyed', 'gentle', 'mischievous', 'dreamy', 'patient', 'curious', 'snuggly', 'wide-awake']);
const ACTIVITY_STATES = Object.freeze(['Exploring', 'Decorating', 'Crafting', 'Resting', 'Looking through a collection']);
const ROOM_FURNITURE = Object.freeze(['bed', 'desk', 'lamp', 'plant']);
const DEFAULT_AVATAR_COUNTS = Object.freeze({ body: 3, skin: 4, hair: 4, hairColor: 4, eyes: 4, outfit: 4, accessory: 4 });
const RARITY_ORDER = Object.freeze({ Common: 1, Uncommon: 2, Rare: 3, 'Super Rare': 4, 'Ultra Rare': 5, Epic: 6, Legendary: 7, Unique: 8 });

function hashString(value) {
  let hash = 2166136261;
  for (let index = 0; index < String(value).length; index++) {
    hash ^= String(value).charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededRandom(seed) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function weightedChoice(rows, random, getWeight = (entry) => entry.weight ?? 1) {
  const eligible = rows.map((entry) => ({ entry, weight: Math.max(0, Number(getWeight(entry)) || 0) })).filter((row) => row.weight > 0);
  const total = eligible.reduce((sum, row) => sum + row.weight, 0);
  if (!total) return null;
  let roll = random() * total;
  for (const row of eligible) {
    roll -= row.weight;
    if (roll < 0) return row.entry;
  }
  return eligible.at(-1)?.entry || null;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function safeCount(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.floor(number)) : fallback;
}

function itemCanAppear(item, area, rarityLimit, weatherData, timeData) {
  if (!item || !area || (RARITY_ORDER[item.rarity] || 0) > rarityLimit) return false;
  const possibleTags = new Set();
  for (const weatherId of area.weatherIds || []) {
    if (weatherData?.[weatherId]?.tag) possibleTags.add(weatherData[weatherId].tag);
  }
  for (const timeId of Object.keys(area.timeWeights || {})) {
    if (timeData?.[timeId]?.tag) possibleTags.add(timeData[timeId].tag);
  }
  return (area.itemPool || []).some((entry) => entry.itemId === item.id
    && (entry.requiredTags || []).every((tag) => possibleTags.has(tag)));
}

export class SimulatedPlayerManager {
  constructor({
    items,
    pets,
    petSpecialties = {},
    areas = [],
    weatherData = {},
    timeData = {},
    milestones = [],
    progressionConfig = {},
    recipes = {},
    roomThemes = {},
    roomThemePrices = {},
    wallStyles = [],
    floorStyles = [],
    avatarOptions = DEFAULT_AVATAR_COUNTS,
    roomFurniture = ROOM_FURNITURE,
    firstDiscoveryStardust = {},
    commonCraftingGoldCosts = {},
    maxCurrency = 999_999_999,
    levelCap = 50,
    population = NAME_SEEDS,
    storage = typeof localStorage !== 'undefined' ? localStorage : null,
  } = {}) {
    this.items = items || {};
    this.pets = pets || [];
    this.petSpecialties = petSpecialties;
    this.areas = [...areas].sort((a, b) => Number(a.minLevel || 1) - Number(b.minLevel || 1));
    this.weatherData = weatherData;
    this.timeData = timeData;
    this.milestones = [...milestones].sort((a, b) => a.level - b.level);
    this.progressionConfig = { baseXpPerLevel: 55, xpGrowthPerLevel: 0.055, ...progressionConfig };
    this.recipes = Object.values(recipes);
    this.roomThemes = roomThemes;
    this.roomThemePrices = roomThemePrices;
    this.wallStyles = wallStyles;
    this.floorStyles = floorStyles;
    this.avatarOptions = avatarOptions;
    this.roomFurniture = roomFurniture;
    this.firstDiscoveryStardust = firstDiscoveryStardust;
    this.commonCraftingGoldCosts = commonCraftingGoldCosts;
    this.maxCurrency = Math.max(1, safeCount(maxCurrency, 999_999_999));
    this.levelCap = Math.max(1, safeCount(levelCap, 50));
    this.population = population;
    this.storage = storage;
    this.cache = new Map();
    this.deviceId = this.readOrCreateDeviceId();
  }

  readOrCreateDeviceId() {
    if (!this.storage) return 'local-device';
    try {
      let id = this.storage.getItem(SIMULATED_DEVICE_KEY);
      if (!id) {
        const suffix = Math.floor(Math.random() * 0x100000000).toString(36);
        id = `device_${Date.now().toString(36)}_${suffix}`;
        this.storage.setItem(SIMULATED_DEVICE_KEY, id);
      }
      return id;
    } catch {
      return 'local-device';
    }
  }

  viewerKey(userId = null) {
    return userId ? `account:${String(userId)}` : `guest:${this.deviceId}`;
  }

  xpForLevel(level) {
    const steps = Math.max(0, Math.floor(level) - 1);
    return Math.floor(this.progressionConfig.baseXpPerLevel * (steps + this.progressionConfig.xpGrowthPerLevel * steps * (steps - 1) / 2));
  }

  levelForXp(xp) {
    let low = 1;
    let high = 2;
    while (this.xpForLevel(high) <= xp && high < 1_000_000_000) high *= 2;
    high = Math.min(high, 1_000_000_000);
    while (low + 1 < high) {
      const middle = Math.floor((low + high) / 2);
      if (this.xpForLevel(middle) <= xp) low = middle;
      else high = middle;
    }
    return Math.min(this.levelCap, this.xpForLevel(high) <= xp ? high : low);
  }

  levelBands() {
    const areas = this.areas.filter((area) => Math.max(1, safeCount(area.minLevel, 1)) <= this.levelCap);
    if (!areas.length) return [{ min: 1, max: this.levelCap, weight: 1 }];
    return areas.map((area, index) => {
      const next = areas[index + 1];
      const min = Math.max(1, safeCount(area.minLevel, 1));
      const configuredMax = safeCount(area.maxLevel, next ? next.minLevel - 1 : this.levelCap);
      const max = Math.max(min, Math.min(this.levelCap, configuredMax));
      return { min, max, weight: SIMULATED_LEVEL_DISTRIBUTION.zoneWeights[index] ?? 1 };
    });
  }

  rollLevel(random) {
    const band = weightedChoice(this.levelBands(), random);
    return Math.min(this.levelCap, band.min + Math.floor(random() * (band.max - band.min + 1)));
  }

  collectionChance(item, poolEntry, archetype) {
    const base = {
      Common: 0.42, Uncommon: 0.31, Rare: 0.17, 'Super Rare': 0.105,
      'Ultra Rare': 0.06, Epic: 0.04, Legendary: 0.025,
    }[item.rarity] || 0.08;
    const poolWeight = Math.max(0.25, Math.min(1, Math.sqrt(Math.max(0.1, poolEntry.weight || 1) / 10)));
    const conditionFactor = (poolEntry.requiredTags || []).length ? 0.62 : 1;
    const personalityFactor = Math.max(0.35, 1 + archetype.discovery);
    const luckyFactor = archetype.id === 'lucky' && (RARITY_ORDER[item.rarity] || 0) >= RARITY_ORDER.Rare ? 1.12 : 1;
    return Math.min(0.72, base * poolWeight * conditionFactor * personalityFactor * luckyFactor);
  }

  buildAreas(completedMilestones, rawLevel) {
    const unlockedIds = new Set(this.areas.length ? [this.areas[0].id] : []);
    for (const milestone of this.milestones) {
      if (completedMilestones.has(milestone.id) && milestone.unlock?.areaId) unlockedIds.add(milestone.unlock.areaId);
    }
    for (const area of this.areas) {
      if (area.unlockMilestoneId && completedMilestones.has(area.unlockMilestoneId)) unlockedIds.add(area.id);
    }
    return this.areas.filter((area) => unlockedIds.has(area.id) && rawLevel >= (area.minLevel || 1));
  }

  generateCollection(random, archetype, rawLevel, completedMilestones) {
    const accessibleAreas = this.buildAreas(completedMilestones, rawLevel);
    const found = new Set();
    const seenCreature = new Set();
    for (const area of accessibleAreas) {
      const rarityLimit = RARITY_ORDER[area.maxRarity] || RARITY_ORDER.Common;
      for (const entry of area.itemPool || []) {
        const item = this.items[entry.itemId];
        if (!itemCanAppear(item, area, rarityLimit, this.weatherData, this.timeData)) continue;
        if (item.category === 'Creatures' && seenCreature.has(item.id)) continue;
        if (random() < this.collectionChance(item, entry, archetype)) {
          found.add(item.id);
          if (item.category === 'Creatures') seenCreature.add(item.id);
        }
      }
    }
    return { found, accessibleAreas };
  }

  canCompleteMilestone(milestone, completedMilestones, rawLevel) {
    const areas = this.buildAreas(completedMilestones, rawLevel);
    const rarityLimit = Math.max(0, ...areas.map((area) => RARITY_ORDER[area.maxRarity] || 1));
    return (milestone.ingredients || []).every((ingredient) => {
      const item = this.items[ingredient.itemId];
      return item && areas.some((area) => itemCanAppear(item, area, rarityLimit, this.weatherData, this.timeData));
    });
  }

  generatePlayer(id, preferredName = '') {
    const random = seededRandom(hashString(`pocketwild-simulated-player-v1:${id}`));
    const archetype = weightedChoice(ARCHETYPES, random) || ARCHETYPES[0];
    const pet = this.pets[Math.floor(random() * Math.max(1, this.pets.length))] || null;
    const rawLevel = Math.min(this.levelCap, this.rollLevel(random));
    const startXp = this.xpForLevel(rawLevel);
    const nextXp = this.xpForLevel(rawLevel + 1);
    const xp = Math.min(this.xpForLevel(this.levelCap), startXp + Math.floor((nextXp - startXp) * (0.28 + random() * 0.6)));
    const rolledRawLevel = this.levelForXp(xp);
    const completedMilestones = new Set();
    let previousGateOpen = true;
    for (const milestone of this.milestones) {
      if (milestone.level > rolledRawLevel) continue;
      const canComplete = previousGateOpen && this.canCompleteMilestone(milestone, completedMilestones, rolledRawLevel);
      const completionChance = Math.min(0.98, Math.max(0.42, archetype.completion + (archetype.id === 'collector' ? random() * 0.06 : 0)));
      const completed = canComplete && random() < completionChance;
      if (completed) completedMilestones.add(milestone.id);
      else previousGateOpen = false;
    }
    const nextUnfinishedMilestone = this.milestones.find((milestone) => !completedMilestones.has(milestone.id));
    const level = nextUnfinishedMilestone ? Math.min(rolledRawLevel, nextUnfinishedMilestone.level) : rolledRawLevel;
    const { found, accessibleAreas } = this.generateCollection(random, archetype, rolledRawLevel, completedMilestones);

    // Completing a milestone means its recipe ingredients were gathered in
    // zones the profile had already opened. Preserve that same prerequisite
    // history in the generated journal and bag rather than granting an output
    // unsupported by its required materials.
    const inventory = {};
    const collection = new Set(found);
    for (const milestone of this.milestones) {
      if (!completedMilestones.has(milestone.id)) continue;
      for (const ingredient of milestone.ingredients || []) {
        const item = this.items[ingredient.itemId];
        const eligible = accessibleAreas.some((area) => itemCanAppear(item, area, RARITY_ORDER[area.maxRarity] || 1, this.weatherData, this.timeData));
        if (eligible) collection.add(item.id);
      }
      if (this.items[milestone.outputId]) {
        collection.add(milestone.outputId);
        inventory[milestone.outputId] = 1;
      }
    }

    const expeditionXp = Math.max(20, Number(accessibleAreas.at(-1)?.expeditionXp) || 25);
    const estimatedExpeditions = Math.max(0, Math.floor(xp / (expeditionXp + 11)));
    const materialItems = [...collection].map((itemId) => this.items[itemId]).filter((item) => item
      && !['Creatures', 'Potions', 'Special items'].includes(item.category) && !item.shopRoomItem);
    for (const item of materialItems) {
      const milestoneNeed = this.milestones
        .filter((milestone) => completedMilestones.has(milestone.id))
        .flatMap((milestone) => milestone.ingredients || [])
        .filter((ingredient) => ingredient.itemId === item.id)
        .reduce((max, ingredient) => Math.max(max, ingredient.quantity), 0);
      const progressionStock = 1 + Math.floor(Math.sqrt(estimatedExpeditions) * (0.45 + random() * 0.34));
      inventory[item.id] = Math.max(inventory[item.id] || 0, Math.min(16, progressionStock), milestoneNeed);
    }

    const trips = estimatedExpeditions;
    let gold = Math.min(this.maxCurrency, Math.floor(trips * (3.3 + random() * 1.6) + rolledRawLevel * (1.2 + random() * 0.7)));
    let stardust = 0;
    for (const itemId of collection) {
      const item = this.items[itemId];
      stardust += Math.max(0, safeCount(this.firstDiscoveryStardust[item?.rarity]));
    }
    stardust = Math.min(this.maxCurrency, stardust);

    const discoveredRecipes = this.recipes.filter((recipe) => recipe.unlock
      && trips >= safeCount(recipe.unlock.expeditions)
      && rolledRawLevel >= safeCount(recipe.unlock.level, 1));
    const knownRecipes = discoveredRecipes.filter(() => random() < Math.min(0.98, 0.45 + archetype.craft));
    const craftedItems = [...this.milestones.filter((milestone) => completedMilestones.has(milestone.id)).map((milestone) => milestone.id)];
    const potions = {};
    for (const recipe of knownRecipes) {
      const wantsCraft = random() < Math.min(0.93, archetype.craft + 0.2 + Math.min(0.32, trips / 100));
      if (!wantsCraft || !recipe.potionItemId || !recipe.ingredients?.every((ingredient) => (inventory[ingredient.itemId] || 0) >= ingredient.quantity)) continue;
      const cost = Math.max(0, safeCount(this.commonCraftingGoldCosts[recipe.id]));
      if (gold < cost) continue;
      for (const ingredient of recipe.ingredients) inventory[ingredient.itemId] -= ingredient.quantity;
      gold -= cost;
      const output = this.items[recipe.potionItemId];
      if (output) collection.add(output.id);
      inventory[recipe.potionItemId] = (inventory[recipe.potionItemId] || 0) + 1;
      potions[recipe.potionItemId] = (potions[recipe.potionItemId] || 0) + 1;
      craftedItems.push(recipe.id);
    }

    const currentThemes = Object.values(this.roomThemes);
    const ownedThemes = ['starter-room'];
    const affordableThemes = currentThemes.filter((theme) => theme.id !== 'starter-room'
      && level >= (theme.unlockLevel || 1)
      && this.roomThemePrices[theme.id]);
    const themeOrder = [...affordableThemes].sort((a, b) => {
      const affinityA = (a.id.includes('mushroom') && archetype.id === 'casual' ? 1 : 0)
        + (a.id.includes('moon') && archetype.id === 'explorer' ? 1 : 0)
        + (a.id.includes('forest') && ['collector', 'decorator'].includes(archetype.id) ? 1 : 0)
        + (a.id.includes('observatory') && archetype.id === 'alchemist' ? 1 : 0);
      const affinityB = (b.id.includes('mushroom') && archetype.id === 'casual' ? 1 : 0)
        + (b.id.includes('moon') && archetype.id === 'explorer' ? 1 : 0)
        + (b.id.includes('forest') && ['collector', 'decorator'].includes(archetype.id) ? 1 : 0)
        + (b.id.includes('observatory') && archetype.id === 'alchemist' ? 1 : 0);
      return affinityB - affinityA || random() - 0.5;
    });
    for (const theme of themeOrder) {
      if (ownedThemes.length >= (archetype.id === 'decorator' ? 3 : 2) || random() > archetype.theme * 0.34) continue;
      const price = this.roomThemePrices[theme.id];
      const balance = price.currency === 'stardust' ? stardust : gold;
      if (balance < price.price) continue;
      ownedThemes.push(theme.id);
      if (price.currency === 'stardust') stardust -= price.price;
      else gold -= price.price;
    }
    const ownedThemeSet = new Set(ownedThemes);
    const theme = currentThemes.find((candidate) => candidate.id === 'starter-room' && ownedThemeSet.has(candidate.id))
      ? currentThemes.find((candidate) => candidate.id === ownedThemes.at(-1))
      : null;
    const activeTheme = theme || this.roomThemes[ownedThemes.at(-1)] || { id: 'starter-room', name: 'Starter Room', displayFrame: '#d8a568' };

    const collectionItems = [...collection].map((itemId) => this.items[itemId]).filter(Boolean);
    const favoriteCandidates = [...collectionItems].sort(() => random() - 0.5).slice(0, 8);
    const favoriteItems = favoriteCandidates.slice(0, 3).map((item) => ({ id: item.id, name: item.name, emoji: item.emoji, rarity: item.rarity }));
    const favorites = favoriteItems.map((item) => item.id);
    const wallStyle = this.wallStyles[Math.floor(random() * Math.max(1, this.wallStyles.length))] || { id: 'cream', color: '#d8bd91' };
    const floorStyle = this.floorStyles[Math.floor(random() * Math.max(1, this.floorStyles.length))] || { id: 'wood', color: '#96694a' };
    const nameChoices = ROOM_NAMES[activeTheme.id] || ROOM_NAMES['starter-room'];
    const roomName = nameChoices[Math.floor(random() * nameChoices.length)];
    const avatar = Object.fromEntries(Object.entries(this.avatarOptions).map(([key, count]) => [key, Math.floor(random() * Math.max(1, Number(count) || 1))]));
    const personality = PET_MOODS[Math.floor(random() * PET_MOODS.length)];
    const activityStatus = ACTIVITY_STATES[Math.floor(random() * ACTIVITY_STATES.length)];
    const profileName = preferredName || COZY_NAMES[Math.floor(random() * COZY_NAMES.length)];
    const collectionPool = accessibleAreas.flatMap((area) => (area.itemPool || []).map((entry) => this.items[entry.itemId]))
      .filter((item, index, all) => item && all.findIndex((candidate) => candidate.id === item.id) === index);
    const collectionPercent = collectionPool.length
      ? Math.round((collectionPool.filter((item) => collection.has(item.id)).length / collectionPool.length) * 100)
      : 0;
    const favoriteDiscovery = [...collectionItems].filter((item) => item.category !== 'Special items')
      .sort((a, b) => (RARITY_ORDER[b.rarity] || 0) - (RARITY_ORDER[a.rarity] || 0))[Math.floor(random() * Math.min(3, collectionItems.length || 1))] || null;
    const masterCollector = completedMilestones.has('milestone-50');
    const collectionAchievements = [
      ...(collection.size >= 1 ? ['First little find'] : []),
      ...(collection.size >= 5 ? ['A growing journal'] : []),
      ...(collection.size >= 15 ? ['Curious collector'] : []),
      ...(collection.size >= 30 ? ['A page for every place'] : []),
    ];
    const room = {
      name: roomName,
      themeId: activeTheme.id,
      themeName: activeTheme.name,
      wallStyle: wallStyle.id,
      wallColor: wallStyle.color,
      floorStyle: floorStyle.id,
      floorColor: floorStyle.color,
      furniture: this.roomFurniture.slice(0, archetype.id === 'casual' ? 2 : this.roomFurniture.length),
      unlocks: [...ownedThemes],
    };
    const collectionIds = [...collection];
    const maxRarity = accessibleAreas.at(-1)?.maxRarity || 'Common';
    const activity = activityStatus;
    const petRecord = pet ? {
      id: pet.id,
      name: pet.name,
      species: pet.species,
      temperament: pet.temperament,
      specialtyId: pet.specialtyId,
      specialty: this.petSpecialties[pet.id] ? clone(this.petSpecialties[pet.id]) : null,
      personality,
    } : null;
    const levelXp = this.xpForLevel(level);
    const nextLevelXp = this.xpForLevel(level + 1);
    const progressWithinLevel = level >= this.levelCap
      ? 1
      : Math.max(0, Math.min(1, (xp - levelXp) / Math.max(1, nextLevelXp - levelXp)));
    const archetypeBios = BIOS[archetype.id] || BIOS.casual;
    const likes = 0;
    const publicProfile = {
      uid: id,
      simulatedPlayerId: id,
      accountType: 'simulated',
      displayName: profileName,
      nameLower: profileName.toLocaleLowerCase(),
      avatar,
      level,
      xp,
      xpProgress: Math.round(progressWithinLevel * 100),
      playerArchetype: archetype.label,
      pet: petRecord,
      petPersonality: personality,
      collection: collectionIds,
      collectionCount: collectionIds.length,
      collectionPercent,
      collectionAchievements,
      collectionHighlights: collectionItems.slice(0, 4).map((item) => ({ id: item.id, name: item.name, emoji: item.emoji, rarity: item.rarity })),
      favoriteItems,
      favoriteDiscovery: favoriteDiscovery ? { id: favoriteDiscovery.id, name: favoriteDiscovery.name, emoji: favoriteDiscovery.emoji, rarity: favoriteDiscovery.rarity } : null,
      favorites,
      inventory: Object.fromEntries(Object.entries(inventory).filter(([, quantity]) => quantity > 0)),
      craftedItems: [...new Set(craftedItems)],
      potions,
      currency: { gold, stardust },
      room,
      roomTheme: { id: activeTheme.id, name: activeTheme.name },
      likes,
      profileBio: archetypeBios[Math.floor(random() * archetypeBios.length)],
      discoveryProgress: {
        rawLevel: rolledRawLevel,
        unlockedAreaIds: accessibleAreas.map((area) => area.id),
        unlockedAreas: accessibleAreas.map((area) => ({ id: area.id, name: area.name })),
        rarityCeiling: maxRarity,
        completedMilestones: [...completedMilestones],
        collectionPercent,
      },
      activityStatus: activity,
      lastSeenAt: 0,
      signals: { visitors: 0, likes: 0, shopVisits: 0, eventParticipation: 0 },
      masterCollector,
      badges: masterCollector ? [{ id: 'master-collector', name: 'Master Collector', icon: '✦' }] : [],
      discoverable: true,
      // This shop is a read-only room preview. It never carries real offers.
      shop: { name: `${profileName.toLocaleUpperCase()}’S ${activeTheme.name.toLocaleUpperCase()}`, offers: [] },
    };
    return publicProfile;
  }

  getPlayer(id) {
    if (typeof id !== 'string' || !id.startsWith('sim_')) return null;
    if (this.cache.has(id)) return this.cache.get(id);
    const predefined = this.population.find(([playerId]) => playerId === id);
    const preferredName = predefined?.[1] || '';
    const profile = this.generatePlayer(id, preferredName);
    this.cache.set(id, profile);
    return profile;
  }

  listPlayers({ limit = 30 } = {}) {
    return this.population.slice(0, Math.max(0, safeCount(limit, 30))).map(([id]) => this.getPlayer(id)).filter(Boolean);
  }

  searchPlayers(query, { limit = 8 } = {}) {
    const needle = String(query || '').trim().toLocaleLowerCase();
    if (needle.length < 2) return [];
    return this.listPlayers({ limit: this.population.length })
      .filter((profile) => profile.displayName.toLocaleLowerCase().includes(needle))
      .slice(0, Math.max(0, safeCount(limit, 8)));
  }

  readState() {
    if (!this.storage) return { viewers: {} };
    try {
      const raw = JSON.parse(this.storage.getItem(SIMULATED_SOCIAL_KEY) || '{}');
      return raw && typeof raw === 'object' && raw.viewers && typeof raw.viewers === 'object' ? raw : { viewers: {} };
    } catch {
      return { viewers: {} };
    }
  }

  writeState(state) {
    if (!this.storage) return false;
    try {
      this.storage.setItem(SIMULATED_SOCIAL_KEY, JSON.stringify(state));
      return true;
    } catch {
      return false;
    }
  }

  viewerState(viewerId, state = this.readState()) {
    const key = String(viewerId || this.viewerKey());
    const previous = state.viewers[key] && typeof state.viewers[key] === 'object' ? state.viewers[key] : {};
    return {
      friends: [...new Set((Array.isArray(previous.friends) ? previous.friends : []).filter((id) => typeof id === 'string' && id.startsWith('sim_')))].slice(0, 200),
      recentVisits: (Array.isArray(previous.recentVisits) ? previous.recentVisits : []).filter((entry) => typeof entry?.id === 'string' && entry.id.startsWith('sim_')).slice(0, 30),
      likedRooms: [...new Set((Array.isArray(previous.likedRooms) ? previous.likedRooms : []).filter((id) => typeof id === 'string' && id.startsWith('sim_')))].slice(0, 200),
    };
  }

  friendIds(viewerId) {
    return this.viewerState(viewerId).friends;
  }

  friends(viewerId) {
    return this.friendIds(viewerId).map((id) => this.getPlayer(id)).filter(Boolean);
  }

  isFriend(playerId, viewerId) {
    return this.friendIds(viewerId).includes(playerId);
  }

  addFriend(playerId, viewerId) {
    if (!this.getPlayer(playerId)) throw new Error('That Pocketwild profile could not be found.');
    const state = this.readState();
    const key = String(viewerId || this.viewerKey());
    const current = this.viewerState(key, state);
    if (current.friends.includes(playerId)) return { alreadyFriends: true };
    current.friends.unshift(playerId);
    state.viewers[key] = current;
    if (!this.writeState(state)) throw new Error('This browser could not save your friends list just now.');
    return { added: true };
  }

  removeFriend(playerId, viewerId) {
    const state = this.readState();
    const key = String(viewerId || this.viewerKey());
    const current = this.viewerState(key, state);
    const existed = current.friends.includes(playerId);
    current.friends = current.friends.filter((id) => id !== playerId);
    state.viewers[key] = current;
    if (!this.writeState(state)) throw new Error('This browser could not update your friends list just now.');
    return existed;
  }

  recordVisit(playerId, viewerId) {
    const profile = this.getPlayer(playerId);
    if (!profile) throw new Error('That Pocketwild room could not be found.');
    const state = this.readState();
    const key = String(viewerId || this.viewerKey());
    const current = this.viewerState(key, state);
    current.recentVisits = [{ id: playerId, at: Date.now() }, ...current.recentVisits.filter((entry) => entry.id !== playerId)].slice(0, 30);
    state.viewers[key] = current;
    if (!this.writeState(state)) throw new Error('This browser could not save that little room visit.');
    return profile;
  }

  recentRooms(viewerId) {
    return this.viewerState(viewerId).recentVisits.map((entry) => {
      const profile = this.getPlayer(entry.id);
      return profile ? { ...profile, visitedAt: Number(entry.at) || 0 } : null;
    }).filter(Boolean);
  }

  hasLikedRoom(playerId, viewerId) {
    return this.viewerState(viewerId).likedRooms.includes(playerId);
  }

  likeRoom(playerId, viewerId) {
    if (!this.getPlayer(playerId)) throw new Error('That Pocketwild room could not be found.');
    const state = this.readState();
    const key = String(viewerId || this.viewerKey());
    const current = this.viewerState(key, state);
    if (current.likedRooms.includes(playerId)) return { alreadyLiked: true };
    current.likedRooms.push(playerId);
    state.viewers[key] = current;
    if (!this.writeState(state)) throw new Error('This browser could not save that little room like.');
    return { liked: true };
  }
}

export { ARCHETYPES as SIMULATED_PLAYER_ARCHETYPES, COZY_NAMES as SIMULATED_PLAYER_NAMES, NAME_SEEDS as DEFAULT_SIMULATED_PLAYERS };
