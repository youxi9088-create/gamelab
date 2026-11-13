export const RARITY_TIERS = ['Common', 'Uncommon', 'Rare', 'Super Rare', 'Ultra Rare', 'Epic', 'Legendary'];

// Progression caps the eligible tier; each area rolls only among the rarities
// represented by its current pool, so regional pools shape the normalized odds.
export const RARITY_DISTRIBUTIONS = {
  Common: { Common: 100 },
  Uncommon: { Common: 84, Uncommon: 16 },
  Rare: { Common: 68, Uncommon: 20, Rare: 12 },
  'Super Rare': { Common: 60, Uncommon: 20, Rare: 12, 'Super Rare': 8 },
  'Ultra Rare': { Common: 51, Uncommon: 20, Rare: 14, 'Super Rare': 10, 'Ultra Rare': 5 },
  Epic: { Common: 62, Uncommon: 22, Rare: 10, 'Super Rare': 4, 'Ultra Rare': 1.5, Epic: 0.5 },
  Legendary: { Common: 58, Uncommon: 23, Rare: 11, 'Super Rare': 5, 'Ultra Rare': 2, Epic: 0.8, Legendary: 0.2 },
};

export const MILESTONE_DROP_PITY_CONFIG = Object.freeze({
  multiplierPerEligibleFailure: 0.25,
  maxEligibleFailures: 10,
  maxMultiplier: 3.5,
});

export const WEATHER_DATA = {
  clear: { id: 'clear', label: 'Clear skies', icon: '☀️', tag: 'weather:clear', description: 'Soft light settles over the trail.' },
  rain: { id: 'rain', label: 'Gentle rain', icon: '🌧️', tag: 'weather:rain', description: 'Rain brings out mushrooms, rain flowers, and little beads of dew.' },
  fog: { id: 'fog', label: 'Wandering fog', icon: '🌫️', tag: 'weather:fog', description: 'The mist makes shy ghost plants easier to notice.' },
  storm: { id: 'storm', label: 'Faraway storm', icon: '⛈️', tag: 'weather:storm', description: 'A distant rumble can uncover lightning-bright crystals.' },
};

export const TIME_DATA = {
  day: { id: 'day', label: 'Daylight', icon: '🌤️', tag: 'time:day' },
  dusk: { id: 'dusk', label: 'Dusk', icon: '🌅', tag: 'time:dusk' },
  night: { id: 'night', label: 'Night', icon: '🌙', tag: 'time:night' },
};

export const EVENT_DATA = {
  wanderingFireflies: {
    id: 'wanderingFireflies', label: 'A drift of fireflies', description: 'A few tiny lights lead your friend toward a well-hidden find.',
    tagBoosts: { 'time:night': 1.4, 'creature:glow': 1.3 }, xpBonus: 1,
  },
  oldTrail: {
    id: 'oldTrail', label: 'An old trail marker', description: 'A faded marker points toward a useful little material.',
    tagBoosts: { 'material:woodland': 1.35, 'material:stone': 1.35 }, xpBonus: 2,
  },
  rainPuddle: {
    id: 'rainPuddle', label: 'A shining rain puddle', description: 'A puddle catches something bright just beneath its surface.',
    tagBoosts: { 'weather:rain': 1.45, 'weather:storm': 1.3 }, xpBonus: 1,
  },
  quietEcho: {
    id: 'quietEcho', label: 'A curious little echo', description: 'A sound from somewhere deeper gives away a tucked-away treasure.',
    tagBoosts: { 'material:crystal': 1.35, 'time:night': 1.2 }, xpBonus: 2,
  },
  moonlitMurmur: {
    id: 'moonlitMurmur', label: 'A moonlit murmur', description: 'The grove seems to whisper where the loveliest blooms are hiding.',
    tagBoosts: { 'time:night': 1.45, 'plant:moonlit': 1.35 }, xpBonus: 2,
  },
  skywayWhisper: {
    id: 'skywayWhisper', label: 'A whisper from above', description: 'A drifting breeze reveals a glint among the old sky stones.',
    tagBoosts: { 'time:dusk': 1.25, 'treasure:sky': 1.4 }, xpBonus: 2,
  },
  canopyBreeze: {
    id: 'canopyBreeze', label: 'A breeze through the high branches', description: 'The leaves whisper in a familiar rhythm and point toward a hidden canopy find.',
    tagBoosts: { 'plant:canopy': 1.45, 'material:canopy': 1.4, 'creature:canopy': 1.25, 'weather:fog': 1.2 }, xpBonus: 4,
  },
  amberfallClearing: {
    id: 'amberfallClearing', label: 'An amber-leaf clearing', description: 'A sunlit pocket in the trees is strewn with bright leaves and little acorns.',
    tagBoosts: { 'plant:autumn': 1.55, 'artifact:amberfall': 1.25 }, xpBonus: 2,
  },
  hollowTreeEcho: {
    id: 'hollowTreeEcho', label: 'A hollow tree answers', description: 'A soft knock from inside an old trunk reveals a tucked-away woodland find.',
    tagBoosts: { 'material:amberfall': 1.55, 'artifact:amberfall': 1.3 }, xpBonus: 3,
  },
  mushroomGrove: {
    id: 'mushroomGrove', label: 'A little mushroom grove', description: 'A ring of mushrooms glows gently beneath the roots.',
    tagBoosts: { fungus: 1.55, 'weather:rain': 1.2 }, xpBonus: 2,
  },
  hiddenBurrow: {
    id: 'hiddenBurrow', label: 'A hidden burrow', description: 'A fox-sized doorway leads to a warm glimmer beneath the forest floor.',
    tagBoosts: { 'artifact:amberfall': 1.7, 'time:night': 1.3 }, xpBonus: 3,
  },
  oldGrowthWhisper: {
    id: 'oldGrowthWhisper', label: 'The oldest roots whisper', description: 'The oldest tree remembers a quiet path through Amberfall Woods.',
    tagBoosts: { 'material:amberfall': 1.5, 'time:night': 1.2 }, xpBonus: 4,
  },
};

export const PET_SPECIALTIES = {
  mango: { id: 'curious', label: 'Curiosity', knack: 'A 4% nudge toward discoveries your journal has not seen yet.', bonus: 0.04, effect: 'new-discovery' },
  beans: { id: 'resourceful', label: 'Resourcefulness', knack: 'A 4% chance to bring home one extra piece of a material.', bonus: 0.04, effect: 'extra-material' },
  trash: { id: 'lucky', label: 'Lucky finds', knack: 'A modest 3% nudge toward eligible Rare-or-better finds.', bonus: 0.03, effect: 'rare-find' },
  luna: { id: 'nocturnal', label: 'Night watch', knack: 'A 5% nudge toward night-loving finds on nighttime outings.', bonus: 0.05, effect: 'night-find' },
};

const pool = (itemId, weight, options = {}) => ({ itemId, weight, requiredTags: options.requiredTags || [], matchTags: options.matchTags || [] });

export const DESTINATION_DATA = [
  {
    id: 'meadow', name: 'The Meadow', shortName: 'Meadow', levelRange: 'Levels 1–10', minLevel: 1, maxLevel: 10,
    description: 'Soft grass, tiny flowers, and all sorts of things to notice.', rarity: 'Common', maxRarity: 'Common',
    unlockLevel: 1, expeditionXp: 14,
    palette: ['#bad7bc', '#8fb89a', '#739b70', '#a1bc78', '#f6e4b0'],
    visualIdentity: 'sun-warmed hills, a winding footpath, and cheerful wildflowers', animation: { breeze: 0.7, fireflies: 0.45 },
    weatherIds: ['clear', 'rain', 'fog'], weatherWeights: { clear: 62, rain: 27, fog: 11 },
    timeWeights: { day: 70, dusk: 23, night: 7 }, eventChance: 0.16, eventIds: ['wanderingFireflies', 'rainPuddle'],
    itemPool: [
      pool('meadowMushroom', 12, { matchTags: ['weather:rain', 'fungus'] }), pool('softwood', 10, { matchTags: ['material:woodland'] }),
      pool('dandelion', 9, { matchTags: ['plant:flower'] }), pool('acorn', 8, { matchTags: ['material:woodland'] }),
      pool('moss', 8, { matchTags: ['material:woodland', 'weather:rain'] }), pool('clover', 5, { matchTags: ['plant:flower'] }),
      pool('rainFlower', 1.4, { requiredTags: ['weather:rain'], matchTags: ['plant:flower'] }),
      pool('morningDew', 1.4, { requiredTags: ['weather:rain'], matchTags: ['plant:dew'] }),
      pool('firefly', 1.2, { requiredTags: ['time:night'], matchTags: ['creature:glow'] }),
    ],
  },
  {
    id: 'bramblewood', name: 'The Wildwood', shortName: 'Wildwood', levelRange: 'Levels 11–20', minLevel: 11, maxLevel: 20,
    description: 'A leafy woodland where the canopy keeps a few secrets.', rarity: 'Uncommon', maxRarity: 'Uncommon',
    unlockLevel: 10, expeditionXp: 17,
    palette: ['#bbd0aa', '#849c73', '#526f58', '#718451', '#e5d5a0'],
    visualIdentity: 'deep green boughs, fern-lit clearings, and old woodland stones', animation: { breeze: 0.45, fireflies: 0.55 },
    weatherIds: ['clear', 'rain', 'fog'], weatherWeights: { clear: 42, rain: 24, fog: 34 },
    timeWeights: { day: 55, dusk: 30, night: 15 }, eventChance: 0.2, eventIds: ['wanderingFireflies', 'oldTrail', 'rainPuddle'],
    itemPool: [
      pool('dandelion', 3, { matchTags: ['plant:flower'] }), pool('moss', 5, { matchTags: ['material:woodland', 'weather:rain'] }),
      pool('softwood', 4, { matchTags: ['material:woodland'] }), pool('acorn', 4, { matchTags: ['material:woodland'] }),
      pool('silverleaf', 8, { matchTags: ['plant:woodland'] }), pool('amberResin', 7, { matchTags: ['material:woodland'] }),
      pool('featherDown', 7, { matchTags: ['creature:woodland'] }),
      pool('ghostPlant', 1.5, { requiredTags: ['weather:fog'], matchTags: ['plant:ghost'] }),
      pool('lunaMoth', 1.2, { requiredTags: ['time:night'], matchTags: ['creature:glow'] }),
    ],
  },
  {
    id: 'moonwell', name: 'Crystal Caverns', shortName: 'Crystal Caverns', levelRange: 'Levels 21–30', minLevel: 21, maxLevel: 30,
    description: 'A quiet crystal cave where small things shine in the dark.', rarity: 'Rare', maxRarity: 'Rare',
    unlockLevel: 20, expeditionXp: 20,
    palette: ['#9ec5cf', '#708f9c', '#4a677a', '#62847e', '#b9dcdb'],
    visualIdentity: 'blue stone, luminous crystal clusters, and a cool underground pool', animation: { breeze: 0.18, crystalPulse: 1.2 },
    weatherIds: ['clear', 'rain', 'fog', 'storm'], weatherWeights: { clear: 35, rain: 16, fog: 29, storm: 20 },
    timeWeights: { day: 36, dusk: 34, night: 30 }, eventChance: 0.23, eventIds: ['quietEcho', 'rainPuddle', 'oldTrail'],
    itemPool: [
      pool('moss', 3, { matchTags: ['material:woodland'] }), pool('softwood', 2, { matchTags: ['material:woodland'] }),
      pool('silverleaf', 3, { matchTags: ['plant:woodland'] }), pool('amberResin', 3, { matchTags: ['material:woodland'] }),
      pool('moonstoneShard', 8, { matchTags: ['material:crystal'] }), pool('glowcap', 8, { matchTags: ['fungus', 'weather:rain'] }),
      pool('crystalThread', 7, { matchTags: ['material:crystal'] }),
      pool('lightningCrystal', 1.3, { requiredTags: ['weather:storm'], matchTags: ['material:crystal', 'weather:storm'] }),
    ],
  },
  {
    id: 'starlit-bog', name: 'Moonlit Grove', shortName: 'Moonlit Grove', levelRange: 'Levels 31–40', minLevel: 31, maxLevel: 40,
    description: 'A hush-soft grove where moonflowers open beneath the trees.', rarity: 'Super Rare', maxRarity: 'Super Rare',
    unlockLevel: 30, expeditionXp: 23,
    palette: ['#333b5d', '#50567b', '#353c5a', '#53604f', '#d1c3ed'],
    visualIdentity: 'silvery moonlight, winding roots, and blossoms that open after dusk', animation: { breeze: 0.26, fireflies: 1.1, moonPulse: 0.7 },
    weatherIds: ['clear', 'rain', 'fog', 'storm'], weatherWeights: { clear: 28, rain: 15, fog: 39, storm: 18 },
    timeWeights: { day: 15, dusk: 31, night: 54 }, eventChance: 0.28, eventIds: ['moonlitMurmur', 'wanderingFireflies', 'quietEcho'],
    itemPool: [
      pool('moss', 2, { matchTags: ['material:woodland'] }), pool('silverleaf', 3, { matchTags: ['plant:woodland'] }),
      pool('moonstoneShard', 3, { matchTags: ['material:crystal'] }), pool('glowcap', 3, { matchTags: ['fungus'] }),
      pool('starblossom', 8, { matchTags: ['plant:moonlit'] }), pool('nightSilk', 7, { matchTags: ['material:moonlit'] }),
      pool('dreamglass', 6, { matchTags: ['material:crystal', 'time:night'] }),
      pool('moonflower', 1.5, { requiredTags: ['time:night'], matchTags: ['plant:moonlit'] }),
      pool('firefly', 1.6, { requiredTags: ['time:night'], matchTags: ['creature:glow'] }),
    ],
  },
  {
    id: 'cloudstep-ruins', name: 'The Unknown', shortName: 'The Unknown', levelRange: 'Levels 41–50', minLevel: 41, maxLevel: 50,
    description: 'A faraway place between old sky stones and drifting light.', rarity: 'Ultra Rare', maxRarity: 'Ultra Rare',
    unlockLevel: 40, expeditionXp: 25,
    palette: ['#91bad0', '#7194ae', '#536d89', '#708a86', '#f1d99b'],
    visualIdentity: 'floating stone paths, bright sky, and an aurora at the edge of sight', animation: { breeze: 0.55, skyDrift: 0.8, starPulse: 1.15 },
    weatherIds: ['clear', 'rain', 'fog', 'storm'], weatherWeights: { clear: 39, rain: 12, fog: 22, storm: 27 },
    timeWeights: { day: 33, dusk: 39, night: 28 }, eventChance: 0.3, eventIds: ['skywayWhisper', 'quietEcho', 'wanderingFireflies'],
    itemPool: [
      pool('silverleaf', 2, { matchTags: ['plant:woodland'] }), pool('moonstoneShard', 3, { matchTags: ['material:crystal'] }),
      pool('starblossom', 3, { matchTags: ['plant:moonlit'] }), pool('nightSilk', 3, { matchTags: ['material:moonlit'] }),
      pool('sunmetal', 8, { matchTags: ['treasure:sky'] }), pool('cloudPearl', 7, { matchTags: ['treasure:sky'] }),
      pool('skyglass', 7, { matchTags: ['treasure:sky', 'time:dusk'] }),
      pool('lightningCrystal', 1, { requiredTags: ['weather:storm'], matchTags: ['material:crystal', 'weather:storm'] }),
    ],
  },
  {
    id: 'amberfall-woods', name: 'Amberfall Woods', shortName: 'Amberfall', levelRange: 'Levels 51–60', minLevel: 51, maxLevel: 60,
    description: 'A cozy autumn forest of amber leaves, mossy roots, and softly glowing hidden places.', rarity: 'Epic', maxRarity: 'Legendary',
    unlockLevel: 50, unlockMilestoneId: 'milestone-50', expeditionXp: 28,
    palette: ['#d99c6b', '#b66c3d', '#69433a', '#78814e', '#ffd17b'],
    visualIdentity: 'amber-leaf clearings, mossy roots, giant mushrooms, hollow trees, and hidden burrows', animation: { breeze: 0.5, fireflies: 0.85, leafFall: 0.7 },
    weatherIds: ['clear', 'rain', 'fog'], weatherWeights: { clear: 48, rain: 31, fog: 21 },
    timeWeights: { day: 42, dusk: 35, night: 23 }, eventChance: 0.32,
    eventIds: ['amberfallClearing', 'hollowTreeEcho', 'mushroomGrove', 'hiddenBurrow', 'oldGrowthWhisper'],
    itemPool: [
      pool('amberAcornArtifact', 14, { matchTags: ['plant:autumn', 'artifact:amberfall'] }),
      pool('amberLeaf', 10, { matchTags: ['plant:autumn'] }),
      pool('amberMoss', 9, { matchTags: ['material:amberfall', 'material:woodland'] }),
      pool('hollowBark', 8, { matchTags: ['material:amberfall'] }),
      pool('embercap', 7, { matchTags: ['fungus', 'plant:autumn'] }),
      pool('ancientRootFiber', 5, { matchTags: ['material:amberfall'] }),
      pool('foxfireLanternArtifact', 0.55, { requiredTags: ['time:night'], matchTags: ['event:hiddenBurrow', 'artifact:amberfall'] }),
    ],
  },
  {
    id: 'whispering-canopy', name: 'Whispering Canopy', shortName: 'Whispering Canopy', levelRange: 'Levels 61–70', minLevel: 61, maxLevel: 70,
    description: 'A high, hushed forest where old branches keep a little starlight.', rarity: 'Legendary', maxRarity: 'Legendary',
    unlockLevel: 60, expeditionXp: 55,
    palette: ['#c7d6b1', '#78966b', '#405c4a', '#647f53', '#d9c4ef'],
    visualIdentity: 'towering boughs, suspended lantern seeds, and a quiet trail above the clouds', animation: { breeze: 0.7, fireflies: 1.25, starPulse: 0.8 },
    weatherIds: ['clear', 'rain', 'fog'], weatherWeights: { clear: 38, rain: 24, fog: 38 },
    timeWeights: { day: 16, dusk: 31, night: 53 }, eventChance: 0.34, eventIds: ['canopyBreeze', 'moonlitMurmur', 'skywayWhisper'],
    itemPool: [
      pool('silverleaf', 2, { matchTags: ['plant:woodland'] }), pool('amberResin', 2, { matchTags: ['material:woodland'] }),
      pool('moonstoneShard', 2, { matchTags: ['material:crystal'] }), pool('glowcap', 2, { matchTags: ['fungus'] }),
      pool('starblossom', 2, { matchTags: ['plant:moonlit'] }), pool('nightSilk', 2, { matchTags: ['material:moonlit'] }),
      pool('sunmetal', 2, { matchTags: ['treasure:sky'] }), pool('cloudPearl', 2, { matchTags: ['treasure:sky'] }),
      pool('skyglass', 2, { matchTags: ['treasure:sky', 'time:dusk'] }),
      pool('whisperingBloom', 9, { requiredTags: ['time:dusk'], matchTags: ['plant:canopy', 'plant:moonlit'] }),
      pool('starlace', 8, { matchTags: ['material:canopy', 'treasure:sky'] }),
      pool('canopyWisp', 1.1, { requiredTags: ['time:night'], matchTags: ['creature:glow', 'creature:canopy'] }),
    ],
  },
];
