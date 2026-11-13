// The existing XP formula and rewards through Level 50 remain unchanged.
// Level 50 keeps its Master Collector milestone; this expansion continues to 60.
export const PROGRESSION_CONFIG = Object.freeze({
  baseXpPerLevel: 55,
  xpGrowthPerLevel: 0.055,
  discoveryXp: 8,
  collectionMilestoneEvery: 5,
  collectionMilestoneXp: 20,
});

export const MASTER_COLLECTOR_LEVEL = 50;
export const PLAYER_LEVEL_CAP = 60;

export const PROGRESSION_MILESTONES = [
  {
    id: 'milestone-10', level: 10, name: 'Explorer’s Compass', outputId: 'explorerCompass',
    description: 'A compass for the trails just beyond the Meadow.', category: 'Progression', station: 'Trail workbench',
    ingredients: [{ itemId: 'meadowMushroom', quantity: 2 }, { itemId: 'softwood', quantity: 3 }, { itemId: 'clover', quantity: 1 }, { itemId: 'dandelion', quantity: 1 }, { itemId: 'acorn', quantity: 2 }, { itemId: 'moss', quantity: 2 }],
    xpReward: 25, unlock: { areaId: 'bramblewood', rarity: 'Uncommon' },
  },
  {
    id: 'milestone-20', level: 20, name: 'Ancient Cauldron', outputId: 'ancientCauldron',
    description: 'A sturdy, well-loved vessel for the deepening journey.', category: 'Progression', station: 'Trail workbench',
    ingredients: [{ itemId: 'silverleaf', quantity: 2 }, { itemId: 'amberResin', quantity: 2 }, { itemId: 'featherDown', quantity: 2 }, { itemId: 'clover', quantity: 1 }, { itemId: 'softwood', quantity: 1 }, { itemId: 'moss', quantity: 1 }],
    xpReward: 30, unlock: { areaId: 'moonwell', rarity: 'Rare' },
  },
  {
    id: 'milestone-30', level: 30, name: 'Moonstone Lantern', outputId: 'moonstoneLantern',
    description: 'A gentle light to carry into places that glow by themselves.', category: 'Progression', station: 'Trail workbench',
    ingredients: [{ itemId: 'moonstoneShard', quantity: 2 }, { itemId: 'glowcap', quantity: 2 }, { itemId: 'crystalThread', quantity: 2 }, { itemId: 'silverleaf', quantity: 1 }, { itemId: 'amberResin', quantity: 1 }, { itemId: 'meadowMushroom', quantity: 1 }, { itemId: 'dandelion', quantity: 1 }],
    xpReward: 35, unlock: { areaId: 'starlit-bog', rarity: 'Super Rare' },
  },
  {
    id: 'milestone-40', level: 40, name: 'World Relic', outputId: 'worldRelic',
    description: 'A keepsake woven from the paths you have already wandered.', category: 'Progression', station: 'Trail workbench',
    ingredients: [{ itemId: 'starblossom', quantity: 2 }, { itemId: 'nightSilk', quantity: 2 }, { itemId: 'dreamglass', quantity: 2 }, { itemId: 'moonstoneShard', quantity: 1 }, { itemId: 'glowcap', quantity: 1 }, { itemId: 'crystalThread', quantity: 1 }, { itemId: 'moss', quantity: 2 }],
    xpReward: 40, unlock: { areaId: 'cloudstep-ruins', rarity: 'Ultra Rare' },
  },
  {
    id: 'milestone-50', level: MASTER_COLLECTOR_LEVEL, name: 'Master Collector’s Relic', outputId: 'masterCollectorsRelic',
    description: 'A lasting mark of all the little things you noticed along the way.', category: 'Progression', station: 'Trail workbench',
    ingredients: [{ itemId: 'sunmetal', quantity: 2 }, { itemId: 'cloudPearl', quantity: 2 }, { itemId: 'skyglass', quantity: 2 }, { itemId: 'starblossom', quantity: 1 }, { itemId: 'nightSilk', quantity: 1 }, { itemId: 'dreamglass', quantity: 1 }, { itemId: 'clover', quantity: 1 }, { itemId: 'acorn', quantity: 1 }],
    xpReward: 50, unlock: { title: 'Master Collector' },
  },
  {
    id: 'milestone-60', level: PLAYER_LEVEL_CAP, name: 'Ancient Root Crown', outputId: 'ancientRootCrown',
    description: 'A crown woven from Amberfall’s oldest roots, kept as a promise that there are still paths ahead.', category: 'Progression', station: 'Trail workbench',
    ingredients: [{ itemId: 'amberMoss', quantity: 3 }, { itemId: 'hollowBark', quantity: 2 }, { itemId: 'embercap', quantity: 2 }, { itemId: 'ancientRootFiber', quantity: 1 }, { itemId: 'amberResin', quantity: 1 }],
    xpReward: 0, unlock: { title: 'Rootkeeper' },
  },
];

// Unlock thresholds are points already invested in that branch. Each branch's
// four-rank capstone opens after 12 points in its earlier talents. Across the
// 15 talents there are 48 spendable ranks; Level 60 earns 59 points, so extra
// points remain banked after every talent is fully ranked.
export const WILDSOUL_TALENT_BRANCHES = Object.freeze([
  Object.freeze({
    id: 'wildcraft', name: 'Wildcraft', icon: '🍃',
    description: 'A little more noticing, gathering, and knowing familiar paths.',
    talents: Object.freeze([
      Object.freeze({ id: 'keen-senses', name: 'Keen Senses', maxRank: 3, unlockPoints: 0, effect: 'commonMaterialWeight', value: 0.02,
        description: 'Eligible Common materials that are not milestone ingredients gain +2% relative find weight per rank (up to +6%).' }),
      Object.freeze({ id: 'foragers-luck', name: 'Forager’s Luck', maxRank: 3, unlockPoints: 3, effect: 'extraCommonChance', value: 0.02,
        description: 'Adds +2% per rank to the chance of bringing home one extra eligible Common material (shared 12% cap).' }),
      Object.freeze({ id: 'trail-memory', name: 'Trail Memory', maxRank: 3, unlockPoints: 6, effect: 'repeatEventChance', value: 0.01,
        description: 'On a return to your last area, adds +1 percentage point per rank to that outing’s event chance.' }),
      Object.freeze({ id: 'curiosity-calls', name: 'Curiosity Calls', maxRank: 3, unlockPoints: 9, effect: 'newFindWeight', value: 0.02,
        description: 'Eligible, uncollected non-milestone finds gain +2% relative find weight per rank (up to +6%).' }),
      Object.freeze({ id: 'master-forager', name: 'Master Forager', maxRank: 4, unlockPoints: 12, effect: 'extraCommonChance', value: 0.01,
        description: 'Adds +1% per rank to the shared chance for one extra eligible Common material; all branches together cap at 12%.' }),
    ]),
  }),
  Object.freeze({
    id: 'artisan', name: 'Artisan', icon: '⚗️',
    description: 'Small, thoughtful touches for everyday potion making.',
    talents: Object.freeze([
      Object.freeze({ id: 'steady-hands', name: 'Steady Hands', maxRank: 3, unlockPoints: 0, effect: 'craftGoldDiscount', value: 1,
        description: 'Everyday potion brewing costs 1 Gold less per rank (the fee never falls below 1 Gold).' }),
      Object.freeze({ id: 'material-savvy', name: 'Material Savvy', maxRank: 3, unlockPoints: 3, effect: 'craftBonusXp', value: 1,
        description: 'Gain +1 bonus XP per rank when successfully brewing an everyday potion.' }),
      Object.freeze({ id: 'recipe-memory', name: 'Recipe Memory', maxRank: 3, unlockPoints: 6, effect: 'recipeDiscoveryBonusXp', value: 1,
        description: 'Gain +1 bonus XP per rank the first time each new potion recipe is discovered.' }),
      Object.freeze({ id: 'careful-work', name: 'Careful Work', maxRank: 3, unlockPoints: 9, effect: 'craftGoldBonusChance', value: 0.02,
        description: 'Each rank adds a 2% chance to find 1 Gold after an everyday potion craft (up to 6%).' }),
      Object.freeze({ id: 'master-artisan', name: 'Master Artisan', maxRank: 4, unlockPoints: 12, effect: 'craftExtraPotionChance', value: 0.02,
        description: 'Each rank adds a 2% chance to brew one extra potion (up to 8%); milestone keepsakes are never duplicated.' }),
    ]),
  }),
  Object.freeze({
    id: 'companion-bond', name: 'Companion Bond', icon: '🐾',
    description: 'Let your best friend’s curiosity and little knack shine.',
    talents: Object.freeze([
      Object.freeze({ id: 'curious-companion', name: 'Curious Companion', maxRank: 3, unlockPoints: 0, effect: 'newFindWeight', value: 0.01,
        description: 'Eligible, uncollected non-milestone finds gain +1% relative find weight per rank (up to +3%).' }),
      Object.freeze({ id: 'gentle-pace', name: 'Gentle Pace', maxRank: 3, unlockPoints: 3, effect: 'eventChance', value: 0.01,
        description: 'Adds +1 percentage point per rank to eligible expedition event chances.' }),
      Object.freeze({ id: 'familiar-trails', name: 'Familiar Trails', maxRank: 3, unlockPoints: 6, effect: 'repeatFindWeight', value: 0.015,
        description: 'When revisiting your last area, eligible uncollected non-milestone finds gain +1.5% relative weight per rank.' }),
      Object.freeze({ id: 'keen-companion', name: 'Keen Companion', maxRank: 3, unlockPoints: 9, effect: 'petSpecialtyBonus', value: 0.005,
        description: 'Adds half a percentage point per rank to your chosen companion’s existing knack.' }),
      Object.freeze({ id: 'deep-bond', name: 'Deep Bond', maxRank: 4, unlockPoints: 12, effect: 'extraCommonChance', value: 0.01,
        description: 'Adds +1% per rank to the shared chance for one extra eligible Common material; all branches together cap at 12%.' }),
    ]),
  }),
]);
