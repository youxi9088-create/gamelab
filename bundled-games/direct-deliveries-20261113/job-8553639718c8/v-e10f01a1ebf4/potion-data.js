// Potion content and effect tuning live here so recipes, durations, and power
// can be balanced without changing the game loop. Effects are intentionally
// small and are consumed by completed actions, never by real-time timers.
export const POTION_CATEGORIES = Object.freeze({
  economy: Object.freeze({ id: 'economy', label: 'Economy' }),
  gathering: Object.freeze({ id: 'gathering', label: 'Gathering' }),
  discovery: Object.freeze({ id: 'discovery', label: 'Discovery' }),
  social: Object.freeze({ id: 'social', label: 'Social' }),
  creative: Object.freeze({ id: 'creative', label: 'Creative' }),
  special: Object.freeze({ id: 'special', label: 'Special / event' }),
});

export const POTION_BALANCE = Object.freeze({
  maxActivePotions: 1,
  maxActionDuration: 5,
  maxChance: 0.3,
  maxGatherChance: 0.18,
  maxRareWeightBonus: 0.1,
  maxEventChanceBonus: 0.08,
  maxGoldBonusPerAction: 5,
  maxStardustBonusPerAction: 1,
  maxTicketRefundPerAction: 1,
  maxGatherExtraAmount: 1,
  maxXpBonusPerAction: 10,
});

export const POTION_DEFINITIONS = Object.freeze({
  meadowglowTonic: Object.freeze({
    itemId: 'meadowglowTonic', name: 'Meadowglow Tonic', category: 'special', rarity: 'Common', emoji: '🧪',
    description: 'A gentle glow for the road.',
    effect: Object.freeze({ type: 'expedition-xp', action: 'expedition', duration: 1, amount: 3, description: '+3 XP on your next completed outing.' }),
    unlock: Object.freeze({ expeditions: 1, level: 1 }),
    recipe: Object.freeze({
      id: 'meadowglow-tonic', ingredients: Object.freeze([{ itemId: 'meadowMushroom', quantity: 1 }, { itemId: 'softwood', quantity: 1 }]),
      output: Object.freeze({ itemId: 'meadowglowTonic', quantity: 1 }), rarity: 'Common', quality: 'Steady', xpReward: 6,
    }),
  }),
  fortunePotion: Object.freeze({
    itemId: 'fortunePotion', name: 'Fortune Potion', category: 'economy', rarity: 'Rare', emoji: '🧪',
    description: 'A lucky little sip for the road.',
    effect: Object.freeze({ type: 'bonus-gold-chance', action: 'expedition', duration: 3, chance: 0.25, amount: 4, description: '25% chance to find +4 Gold on each of your next 3 outings.' }),
    unlock: Object.freeze({ expeditions: 1, level: 1 }),
    recipe: null,
  }),
  greenThumbPotion: Object.freeze({
    itemId: 'greenThumbPotion', name: 'Green Thumb Potion', category: 'gathering', rarity: 'Common', emoji: '🌱',
    description: 'A little extra care for everything growing along the trail.',
    effect: Object.freeze({ type: 'gather-extra', action: 'expedition', duration: 3, chance: 0.12, amount: 1, description: '12% chance to bring home +1 piece from a gathered stack on each of your next 3 outings.' }),
    unlock: Object.freeze({ expeditions: 3, level: 1 }),
    recipe: Object.freeze({
      id: 'green-thumb-potion', ingredients: Object.freeze([{ itemId: 'dandelion', quantity: 1 }, { itemId: 'moss', quantity: 1 }]),
      output: Object.freeze({ itemId: 'greenThumbPotion', quantity: 1 }), rarity: 'Common', quality: 'Steady', xpReward: 6,
    }),
  }),
  makersMuse: Object.freeze({
    itemId: 'makersMuse', name: 'Maker’s Muse', category: 'creative', rarity: 'Common', emoji: '🎨',
    description: 'A bright little idea for the next thing you make.',
    effect: Object.freeze({ type: 'crafting-xp', action: 'craft', duration: 1, amount: 5, description: '+5 XP on your next successful craft.' }),
    unlock: Object.freeze({ expeditions: 4, level: 1 }),
    recipe: Object.freeze({
      id: 'makers-muse', ingredients: Object.freeze([{ itemId: 'dandelion', quantity: 1 }, { itemId: 'acorn', quantity: 1 }]),
      output: Object.freeze({ itemId: 'makersMuse', quantity: 1 }), rarity: 'Common', quality: 'Steady', xpReward: 6,
    }),
  }),
  travelersTonic: Object.freeze({
    itemId: 'travelersTonic', name: 'Traveler’s Tonic', category: 'special', rarity: 'Uncommon', emoji: '🎟️',
    description: 'A thoughtful sip that may help a ticket find its way back.',
    effect: Object.freeze({ type: 'ticket-refund-chance', action: 'expedition', duration: 3, chance: 0.1, amount: 1, description: '10% chance to earn +1 ticket after each of your next 3 outings; normal ticket limits apply.' }),
    unlock: Object.freeze({ expeditions: 6, level: 1 }),
    recipe: Object.freeze({
      id: 'travelers-tonic', ingredients: Object.freeze([{ itemId: 'clover', quantity: 1 }, { itemId: 'softwood', quantity: 1 }]),
      output: Object.freeze({ itemId: 'travelersTonic', quantity: 1 }), rarity: 'Uncommon', quality: 'Steady', xpReward: 7,
    }),
  }),
  weatherwiseElixir: Object.freeze({
    itemId: 'weatherwiseElixir', name: 'Weatherwise Elixir', category: 'special', rarity: 'Uncommon', emoji: '🌦️',
    description: 'A tiny weather-vane of a brew, tuned to curious days.',
    effect: Object.freeze({ type: 'event-chance', action: 'expedition', duration: 3, bonus: 0.06, description: 'A modest +6 percentage-point nudge to event chances on your next 3 outings.' }),
    unlock: Object.freeze({ expeditions: 10, level: 10 }),
    recipe: Object.freeze({
      id: 'weatherwise-elixir', ingredients: Object.freeze([{ itemId: 'morningDew', quantity: 1 }, { itemId: 'rainFlower', quantity: 1 }]),
      output: Object.freeze({ itemId: 'weatherwiseElixir', quantity: 1 }), rarity: 'Uncommon', quality: 'Steady', xpReward: 7,
    }),
  }),
  stardustElixir: Object.freeze({
    itemId: 'stardustElixir', name: 'Stardust Elixir', category: 'economy', rarity: 'Rare', emoji: '✨',
    description: 'A quiet shimmer that sometimes leaves a little Stardust behind.',
    effect: Object.freeze({ type: 'stardust-chance', action: 'expedition', duration: 3, chance: 0.08, amount: 1, description: '8% chance to find +1 Stardust on each of your next 3 outings.' }),
    unlock: Object.freeze({ expeditions: 13, level: 10 }),
    recipe: Object.freeze({
      id: 'stardust-elixir', ingredients: Object.freeze([{ itemId: 'silverleaf', quantity: 1 }, { itemId: 'amberResin', quantity: 1 }]),
      output: Object.freeze({ itemId: 'stardustElixir', quantity: 1 }), rarity: 'Rare', quality: 'Steady', xpReward: 8,
    }),
  }),
  discoveryDraught: Object.freeze({
    itemId: 'discoveryDraught', name: 'Discovery Draught', category: 'discovery', rarity: 'Rare', emoji: '🔎',
    description: 'A clear-eyed brew for noticing the little things.',
    effect: Object.freeze({ type: 'rare-discovery-weight', action: 'expedition', duration: 3, bonus: 0.08, description: '8% more relative weight for Rare-or-better finds already eligible in your area, for your next 3 outings.' }),
    unlock: Object.freeze({ expeditions: 22, level: 20 }),
    recipe: Object.freeze({
      id: 'discovery-draught', ingredients: Object.freeze([{ itemId: 'moonstoneShard', quantity: 1 }, { itemId: 'glowcap', quantity: 1 }]),
      output: Object.freeze({ itemId: 'discoveryDraught', quantity: 1 }), rarity: 'Rare', quality: 'Steady', xpReward: 8,
    }),
  }),
  canopyWhisperPotion: Object.freeze({
    itemId: 'canopyWhisperPotion', name: 'Canopy Whisper', category: 'special', rarity: 'Epic', emoji: '🌿',
    description: 'A soft green brew that listens for the rarer rustle in the leaves.',
    effect: Object.freeze({ type: 'rare-discovery-weight', action: 'expedition', duration: 3, bonus: 0.08, description: 'A small 8% relative nudge toward Rare-or-better finds on your next 3 outings.' }),
    unlock: Object.freeze({ expeditions: 50, level: 61 }),
    recipe: Object.freeze({
      id: 'canopy-whisper-potion', ingredients: Object.freeze([{ itemId: 'whisperingBloom', quantity: 1 }, { itemId: 'starlace', quantity: 1 }]),
      output: Object.freeze({ itemId: 'canopyWhisperPotion', quantity: 1 }), rarity: 'Epic', quality: 'Luminous', xpReward: 10,
    }),
  }),
});

// These effects are intentionally only design hooks. Pocketwild does not yet
// have featured-room discovery or player marketplace listings, so they cannot
// be crafted or activated until those real systems provide an action to modify.
export const POTION_EXTENSION_HOOKS = Object.freeze({
  charmingHomePotion: Object.freeze({
    name: 'Charming Home Potion', category: 'social', type: 'room-discovery-visibility', bonus: 0.1,
    requires: 'A real featured-room discovery action.',
  }),
  merchantsBrew: Object.freeze({
    name: 'Merchant’s Brew', category: 'economy', type: 'marketplace-listing-fee-discount', discount: 0.1,
    requires: 'A real player marketplace listing-fee action.',
  }),
});
