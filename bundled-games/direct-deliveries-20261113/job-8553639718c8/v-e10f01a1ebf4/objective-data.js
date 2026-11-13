export const OBJECTIVE_CONFIG = Object.freeze({
  tiers: [
    { level: 1, label: 'Quick', reward: 1, refreshMs: 30 * 60 * 1000, daily: false },
    { level: 2, label: 'Easy', reward: 2, refreshMs: 60 * 60 * 1000, daily: false },
    { level: 3, label: 'Moderate', reward: 3, refreshMs: 2 * 60 * 60 * 1000, daily: false },
    { level: 4, label: 'Challenging', reward: 4, refreshMs: 4 * 60 * 60 * 1000, daily: false },
    { level: 5, label: 'Daily Goal', reward: 5, refreshMs: 24 * 60 * 60 * 1000, daily: true },
  ],
  recentHistoryLimit: 24,
  avoidRecentRepeatCount: 2,
});

// Add objectives as data records; requirements and event goal types are interpreted by ObjectiveManager.
// Only mechanics currently implemented and unlocked by progression appear in this pool.
export const OBJECTIVE_DATABASE = [
  { id: 'quick-one-trail', name: 'Little Explorer', description: 'Complete 1 expedition.', tier: 1, objectiveType: 'expedition', requirements: { pet: true }, goals: [{ type: 'expedition', target: 1, label: 'Expeditions' }], weight: 4 },
  { id: 'quick-gather-three', name: 'Pocketful of Finds', description: 'Bring home 3 materials.', tier: 1, objectiveType: 'materials', requirements: { pet: true }, goals: [{ type: 'materials', target: 3, label: 'Materials' }], weight: 3 },
  { id: 'quick-discover-one', name: 'Something New', description: 'Discover 1 new item.', tier: 1, objectiveType: 'discovery', requirements: { pet: true, discoverable: 1 }, goals: [{ type: 'discovery', target: 1, label: 'New discoveries' }], weight: 2 },

  { id: 'easy-two-trails', name: 'Two Little Wanderings', description: 'Complete 2 expeditions.', tier: 2, objectiveType: 'expedition', requirements: { pet: true }, goals: [{ type: 'expedition', target: 2, label: 'Expeditions' }], weight: 3 },
  { id: 'easy-gather-five', name: 'A Useful Little Pile', description: 'Bring home 5 materials.', tier: 2, objectiveType: 'materials', requirements: { pet: true }, goals: [{ type: 'materials', target: 5, label: 'Materials' }], weight: 3 },
  { id: 'easy-two-discoveries', name: 'Curious Eyes', description: 'Discover 2 new items.', tier: 2, objectiveType: 'discovery', requirements: { pet: true, discoverable: 2 }, goals: [{ type: 'discovery', target: 2, label: 'New discoveries' }], weight: 2 },
  { id: 'easy-make-a-tonic', name: 'A Little Potion Maker', description: 'Craft 1 potion.', tier: 2, objectiveType: 'craft', requirements: { pet: true, system: 'crafting' }, goals: [{ type: 'craft', target: 1, label: 'Potions crafted' }], weight: 1.5 },

  { id: 'moderate-three-trails', name: 'Trail Regular', description: 'Complete 3 expeditions.', tier: 3, objectiveType: 'expedition', requirements: { pet: true }, goals: [{ type: 'expedition', target: 3, label: 'Expeditions' }], weight: 2 },
  { id: 'moderate-three-discoveries', name: 'Journal Keeper', description: 'Discover 3 new items.', tier: 3, objectiveType: 'discovery', requirements: { pet: true, discoverable: 3 }, goals: [{ type: 'discovery', target: 3, label: 'New discoveries' }], weight: 2 },
  { id: 'moderate-eight-materials', name: 'Well-Stocked Satchel', description: 'Bring home 8 materials.', tier: 3, objectiveType: 'materials', requirements: { pet: true }, goals: [{ type: 'materials', target: 8, label: 'Materials' }], weight: 2 },
  { id: 'moderate-two-potions', name: 'Steady Alchemist', description: 'Craft 2 potions.', tier: 3, objectiveType: 'craft', requirements: { pet: true, system: 'crafting' }, goals: [{ type: 'craft', target: 2, label: 'Potions crafted' }], weight: 1.5 },

  { id: 'challenge-current-trail', name: 'Know One Trail Well', description: 'Explore one open destination twice.', tier: 4, objectiveType: 'expedition-area', requirements: { pet: true, unlockedAreas: 1 }, goals: [{ type: 'expedition-area', target: 2, label: 'Expeditions in this place', chooseArea: true }], weight: 2 },
  { id: 'challenge-four-discoveries', name: 'A Page Full of Wonders', description: 'Discover 4 new items.', tier: 4, objectiveType: 'discovery', requirements: { pet: true, discoverable: 4 }, goals: [{ type: 'discovery', target: 4, label: 'New discoveries' }], weight: 1.5 },
  { id: 'challenge-three-potions', name: 'Thoughtful Potion Maker', description: 'Craft 3 potions.', tier: 4, objectiveType: 'craft', requirements: { pet: true, system: 'crafting' }, goals: [{ type: 'craft', target: 3, label: 'Potions crafted' }], weight: 1.25 },
  { id: 'challenge-mixed', name: 'A Trail and a Tidy Satchel', description: 'Complete 2 expeditions and bring home 6 materials.', tier: 4, objectiveType: 'mixed', requirements: { pet: true }, goals: [{ type: 'expedition', target: 2, label: 'Expeditions' }, { type: 'materials', target: 6, label: 'Materials' }], weight: 2.5 },

  { id: 'daily-expedition-discovery', name: 'Today’s Little Wonders', description: 'Complete 3 expeditions and discover 2 new items.', tier: 5, objectiveType: 'mixed', requirements: { pet: true, discoverable: 2 }, goals: [{ type: 'expedition', target: 3, label: 'Expeditions' }, { type: 'discovery', target: 2, label: 'New discoveries' }], weight: 2 },
  { id: 'daily-craft-gather', name: 'A Day of Making', description: 'Craft 2 potions and bring home 5 materials.', tier: 5, objectiveType: 'mixed', requirements: { pet: true, system: 'crafting' }, goals: [{ type: 'craft', target: 2, label: 'Potions crafted' }, { type: 'materials', target: 5, label: 'Materials' }], weight: 1.5 },
  { id: 'daily-broad-activities', name: 'A Little of Everything', description: 'Complete 5 activities across your Pocketwild.', tier: 5, objectiveType: 'activity', requirements: { pet: true }, goals: [{ type: 'activity', target: 5, label: 'Expeditions, discoveries, or crafts' }], weight: 2.5 },
  { id: 'daily-mix-and-wander', name: 'Wander and Make', description: 'Complete 2 expeditions, craft 1 potion, and discover 1 new item.', tier: 5, objectiveType: 'mixed', requirements: { pet: true, system: 'crafting', discoverable: 1 }, goals: [{ type: 'expedition', target: 2, label: 'Expeditions' }, { type: 'craft', target: 1, label: 'Potions crafted' }, { type: 'discovery', target: 1, label: 'New discoveries' }], weight: 1.5 },
];
