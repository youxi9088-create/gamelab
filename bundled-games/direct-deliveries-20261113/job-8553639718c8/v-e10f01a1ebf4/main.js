import { DESTINATION_DATA, EVENT_DATA, PET_SPECIALTIES, MILESTONE_DROP_PITY_CONFIG, RARITY_DISTRIBUTIONS, RARITY_TIERS, TIME_DATA, WEATHER_DATA } from './expedition-data.js';
import { TICKET_CONFIG, TicketManager, runTicketManagerChecks } from './ticket-manager.js';
import { OBJECTIVE_CONFIG } from './objective-data.js';
import { ObjectiveManager } from './objective-manager.js';
import { OFFLINE_REWARD_CONFIG, OfflineRewardManager } from './offline-reward-manager.js';
import { PlayerSaveManager, authMessage } from './account-save-manager.js';
import { PocketwildSocial } from './social-manager.js';
import { PocketwildMarketplace } from './marketplace-manager.js';
import { ECONOMY_CONFIG } from './economy-data.js';
import { POTION_BALANCE, POTION_DEFINITIONS } from './potion-data.js';
import { MASTER_COLLECTOR_LEVEL, PLAYER_LEVEL_CAP, PROGRESSION_CONFIG, PROGRESSION_MILESTONES, WILDSOUL_TALENT_BRANCHES } from './progression-data.js';
import { SimulatedPlayerManager } from './simulated-player-manager.js';
import { PocketwildPlayerService } from './social-player-service.js';
import { PetDialogueManager } from './pet-dialogue-manager.js';
import { NPCBehaviorManager } from './npc-behavior-manager.js';
import { validateUserText, safeUserText } from './content-safety.js';
const container = document.getElementById('game-container');
const canvas = document.getElementById('world');
const ctx = canvas.getContext('2d');
const ui = document.getElementById('ui');
const DEV_SAVE_TOOLS = new URLSearchParams(window.location.search).get('debug') === '1';
const ticketManager = new TicketManager({
  debug: DEV_SAVE_TOOLS
});
const objectiveManager = new ObjectiveManager(OBJECTIVE_CONFIG);
const petDialogueManager = new PetDialogueManager({
  enabled: true
});
const npcBehaviorManager = new NPCBehaviorManager();
const offlineRewardManager = new OfflineRewardManager();
const playerSaveManager = new PlayerSaveManager({
  config: null
});
const socialManager = new PocketwildSocial({
  getUser: () => playerSaveManager.getStatus().user,
  config: null
});
const socialState = {
  view: 'home',
  tab: 'featured',
  loading: false,
  error: '',
  notice: '',
  friends: [],
  requests: {
    incoming: [],
    outgoing: []
  },
  directory: [],
  recent: [],
  notifications: [],
  searchResults: [],
  room: null,
  roomFriend: false,
  roomLiked: false,
  profileReturnView: 'discover',
  roomReturnView: 'discover',
  messages: [],
  chatFriend: null,
  threads: []
};
const marketplaceState = {
  tab: 'browse',
  listings: [],
  myListings: [],
  trades: [],
  friends: [],
  proceeds: [],
  bidHolds: [],
  blocked: [],
  dailyCounts: {},
  search: '',
  category: 'all',
  rarity: 'all',
  sort: 'newest',
  sellMode: 'fixed',
  loading: false,
  error: '',
  notice: ''
};
let accountView = 'home';
let accountNotice = '';
let accountEmail = '';
let accountBusy = false;
let roomShopPurchaseInFlight = false;
let npcSaleInFlight = false;
let shopTab = 'buy';
let shopNotice = '';
const MAX_INVENTORY_STACK = 999999;
const roomImage = loadImage('assets/room-bg.webp');
const roomLandscapeImage = loadImage('assets/pocketwild-isometric-cottage.webp');
const roomPortraitImage = loadImage('assets/pocketwild-isometric-cottage-portrait.webp');
const PET_RENDER_SCALE = 0.8;
const petImages = {
  mango: loadImage('assets/mango-frog-chunky.webp'),
  beans: loadImage('assets/beans-cat-chunky.webp'),
  trash: loadImage('assets/trash-raccoon-chunky.webp'),
  luna: loadImage('assets/luna-moth-chunky.webp')
};
const companionArtifactImages = {
  'milestone-10': loadImage('assets/explorer-compass-display.webp'),
  'milestone-20': loadImage('assets/ancient-cauldron-display.webp'),
  'milestone-30': loadImage('assets/moonstone-lantern-display.webp'),
  'milestone-40': loadImage('assets/world-relic-display.webp'),
  'milestone-50': loadImage('assets/master-collectors-relic-display.webp')
};
const PETS = [{
  id: 'mango',
  name: 'Mango',
  species: 'Frog',
  temperament: 'Curious',
  specialtyId: PET_SPECIALTIES.mango.id,
  knack: PET_SPECIALTIES.mango.knack,
  hello: 'Mango spots every little rustle. There might be something beyond that window…',
  greeting: 'Mango gives a happy little ribbit. “You’re my favorite new discovery!”'
}, {
  id: 'beans',
  name: 'Beans',
  species: 'Cat',
  temperament: 'Resourceful',
  specialtyId: PET_SPECIALTIES.beans.id,
  knack: PET_SPECIALTIES.beans.knack,
  hello: 'Beans gives your sleeve a tidy tug. “I like to keep an eye out for useful little things.”',
  greeting: 'Beans purrs against your hand. “Good. We make a very good team.”'
}, {
  id: 'trash',
  name: 'Trash',
  species: 'Raccoon',
  temperament: 'Lucky',
  specialtyId: PET_SPECIALTIES.trash.id,
  knack: PET_SPECIALTIES.trash.knack,
  hello: 'Trash’s lucky charm gives a tiny glint. “Funny things find us when we wander.”',
  greeting: 'Trash chirrs and shows you the lucky charm. “I knew you’d be nice!”'
}, {
  id: 'luna',
  name: 'Luna',
  species: 'Moon moth',
  temperament: 'Nocturnal',
  specialtyId: PET_SPECIALTIES.luna.id,
  knack: PET_SPECIALTIES.luna.knack,
  hello: 'Luna’s wings catch the lamplight. “There are lovely things to see after dusk.”',
  greeting: 'Luna flutters close. “The night feels a little brighter with you.”'
}];
const COMPANION_MILESTONES = [{
  id: 'milestone-10',
  level: 10,
  title: 'The First Awakening',
  artifact: 'Explorer’s Compass',
  artPath: 'assets/explorer-compass-display.webp',
  color: '#f4c879',
  accent: '#fff0b5',
  duration: 7.5,
  line: 'The compass needle remembers your first brave step.',
  beat: 'compass'
}, {
  id: 'milestone-20',
  level: 20,
  title: 'A Bond Beyond Words',
  artifact: 'Ancient Cauldron',
  artPath: 'assets/ancient-cauldron-display.webp',
  color: '#82d8bd',
  accent: '#d5ffe1',
  duration: 7.5,
  line: 'Even an ancient thing knows the shape of a kind heart.',
  beat: 'cauldron'
}, {
  id: 'milestone-30',
  level: 30,
  title: 'The World Remembers',
  artifact: 'Moonstone Lantern',
  artPath: 'assets/moonstone-lantern-display.webp',
  color: '#b7a5f0',
  accent: '#e6dbff',
  duration: 8,
  line: 'Every path you share leaves a little light behind.',
  beat: 'lantern'
}, {
  id: 'milestone-40',
  level: 40,
  title: 'The Hidden Nature',
  artifact: 'World Relic',
  artPath: 'assets/world-relic-display.webp',
  color: '#a6c77c',
  accent: '#f2d58e',
  duration: 8,
  line: 'There was always more wonder beneath the familiar.',
  beat: 'relic'
}, {
  id: 'milestone-50',
  level: 50,
  title: 'The Eternal Awakening',
  artifact: 'Master Collector’s Relic',
  artPath: 'assets/master-collectors-relic-display.webp',
  color: '#f2cc7b',
  accent: '#d8e9ae',
  duration: 25,
  line: 'Every little thing you noticed helped your friend become extraordinary.',
  beat: 'finale'
}];
const AVATAR_OPTIONS = {
  body: ['Soft round', 'Little and light', 'Tall and easy'],
  skin: ['Peach', 'Warm honey', 'Olive', 'Deep cocoa'],
  hair: ['Soft crop', 'Wavy', 'Curly', 'Long'],
  hairColor: ['Chestnut', 'Ink black', 'Honey', 'Plum'],
  eyes: ['Hazel', 'Forest', 'Sky', 'Violet'],
  outfit: ['Moss green', 'Berry red', 'Cloud blue', 'Sunflower'],
  accessory: ['Leaf pin', 'Round glasses', 'Little beret', 'None']
};
const SKIN_COLORS = ['#f4c9a2', '#d99b61', '#a96f4e', '#684536'];
const HAIR_COLORS = ['#59372e', '#29252f', '#e5a84f', '#8d526b'];
const OUTFIT_COLORS = ['#66836a', '#b85d67', '#6189a3', '#d29a43'];
const EYE_COLORS = ['#9a673c', '#547754', '#538fa2', '#8a659b'];
const TICKET_SETTINGS = {
  cap: TICKET_CONFIG.maxTicketStorage,
  starting: TICKET_CONFIG.startingTickets,
  regenMs: TICKET_CONFIG.passiveTicketIntervalMs
};
// Static item definitions stay separate from the player's journal and owned quantities.
// Add future items here; only discovered entries or currently owned items are shown in the phone.
const ITEM_CATALOG = {
  clover: {
    id: 'clover',
    name: 'Clover',
    category: 'Plants',
    rarity: 'Common',
    emoji: '🍀',
    description: 'A tiny four-leaf friend tucked into the Meadow grass.',
    sellValue: 4,
    buybackValue: 6,
    discoveryState: 'undiscovered',
    uses: ['collection keepsake', 'sell', 'trade'],
    craftingRoles: [],
    expansion: {
      marketplaceEligible: true,
      tradeEligible: true,
      socialGiftEligible: false
    }
  },
  meadowMushroom: {
    id: 'meadowMushroom',
    name: 'Meadow mushroom',
    category: 'Fungi',
    rarity: 'Common',
    emoji: '🍄',
    description: 'A plump little mushroom from the sun-warmed grass.',
    sellValue: 3,
    buybackValue: 5,
    discoveryState: 'undiscovered',
    uses: ['craft', 'sell', 'trade'],
    craftingRoles: ['ingredient', 'cooking'],
    expansion: {
      marketplaceEligible: true,
      tradeEligible: true,
      socialGiftEligible: false
    }
  },
  softwood: {
    id: 'softwood',
    name: 'Softwood',
    category: 'Materials',
    rarity: 'Common',
    emoji: '🪵',
    description: 'Smooth, lightweight wood from a fallen Meadow branch.',
    sellValue: 2,
    buybackValue: 3,
    discoveryState: 'undiscovered',
    uses: ['craft', 'sell', 'trade'],
    craftingRoles: ['building', 'furniture'],
    expansion: {
      marketplaceEligible: true,
      tradeEligible: true,
      socialGiftEligible: false
    }
  },
  dandelion: {
    id: 'dandelion',
    name: 'Dandelion',
    category: 'Plants',
    rarity: 'Common',
    emoji: '🌼',
    description: 'A sunny little flower nodding in the Meadow breeze.',
    sellValue: 2,
    buybackValue: 4,
    discoveryState: 'undiscovered',
    uses: ['collection keepsake', 'craft', 'sell', 'trade'],
    craftingRoles: ['dye', 'decoration'],
    expansion: {
      marketplaceEligible: true,
      tradeEligible: true,
      socialGiftEligible: false
    }
  },
  acorn: {
    id: 'acorn',
    name: 'Acorn',
    category: 'Materials',
    rarity: 'Common',
    emoji: '🌰',
    description: 'A sturdy acorn spotted under the Meadow grasses.',
    sellValue: 2,
    buybackValue: 3,
    discoveryState: 'undiscovered',
    uses: ['craft', 'sell', 'trade'],
    craftingRoles: ['ingredient', 'decoration'],
    expansion: {
      marketplaceEligible: true,
      tradeEligible: true,
      socialGiftEligible: false
    }
  },
  moss: {
    id: 'moss',
    name: 'Soft moss',
    category: 'Materials',
    rarity: 'Common',
    emoji: '🌿',
    description: 'A little cushion of soft, springy moss.',
    sellValue: 2,
    buybackValue: 3,
    discoveryState: 'undiscovered',
    uses: ['craft', 'sell', 'trade'],
    craftingRoles: ['building', 'decoration'],
    expansion: {
      marketplaceEligible: true,
      tradeEligible: true,
      socialGiftEligible: false
    }
  },
  meadowglowTonic: {
    id: 'meadowglowTonic',
    name: 'Meadowglow Tonic',
    category: 'Potions',
    rarity: 'Common',
    emoji: '🧪',
    description: 'A gentle glow for the road.',
    sellValue: 0,
    buybackValue: 0,
    discoveryState: 'undiscovered',
    uses: ['action-based buff'],
    craftingRoles: [],
    expansion: {
      marketplaceEligible: false,
      tradeEligible: false,
      socialGiftEligible: false
    }
  },
  rainFlower: {
    id: 'rainFlower',
    name: 'Rain flower',
    category: 'Plants',
    rarity: 'Common',
    emoji: '🌧️',
    description: 'A bright little flower that only opens its petals after gentle rain.',
    sellValue: 3,
    buybackValue: 4,
    discoveryState: 'undiscovered',
    uses: ['craft', 'sell', 'trade'],
    craftingRoles: ['dye', 'decoration'],
    tags: ['weather:rain', 'plant:flower'],
    expansion: {
      marketplaceEligible: true,
      tradeEligible: true,
      socialGiftEligible: false
    }
  },
  morningDew: {
    id: 'morningDew',
    name: 'Morning dew',
    category: 'Materials',
    rarity: 'Common',
    emoji: '💧',
    description: 'A cool bead of dew gathered from a rain-kissed leaf.',
    sellValue: 2,
    buybackValue: 3,
    discoveryState: 'undiscovered',
    uses: ['craft', 'sell', 'trade'],
    craftingRoles: ['ingredient', 'alchemy'],
    tags: ['weather:rain', 'plant:dew'],
    expansion: {
      marketplaceEligible: true,
      tradeEligible: true,
      socialGiftEligible: false
    }
  },
  firefly: {
    id: 'firefly',
    name: 'Firefly',
    category: 'Creatures',
    rarity: 'Common',
    emoji: '✨',
    description: 'A tiny glowing visitor, gently released after your explorer admires its light.',
    sellValue: 2,
    buybackValue: 3,
    discoveryState: 'undiscovered',
    uses: ['collection keepsake', 'trade', 'NPC request'],
    craftingRoles: [],
    tags: ['time:night', 'creature:glow'],
    expansion: {
      marketplaceEligible: false,
      tradeEligible: true,
      socialGiftEligible: true
    }
  },
  ghostPlant: {
    id: 'ghostPlant',
    name: 'Ghost plant',
    category: 'Plants',
    rarity: 'Uncommon',
    emoji: '👻',
    description: 'A pale woodland sprout that seems to appear only when the fog is thick.',
    sellValue: 3,
    buybackValue: 4,
    discoveryState: 'undiscovered',
    uses: ['craft', 'sell', 'trade'],
    craftingRoles: ['milestone', 'dye'],
    tags: ['weather:fog', 'plant:ghost'],
    expansion: {
      marketplaceEligible: true,
      tradeEligible: true,
      socialGiftEligible: false
    }
  },
  lunaMoth: {
    id: 'lunaMoth',
    name: 'Luna moth',
    category: 'Creatures',
    rarity: 'Uncommon',
    emoji: '🦋',
    description: 'A velvet-winged night visitor that pauses beneath the Wildwood canopy.',
    sellValue: 3,
    buybackValue: 4,
    discoveryState: 'undiscovered',
    uses: ['collection keepsake', 'trade', 'NPC request'],
    craftingRoles: [],
    tags: ['time:night', 'creature:glow', 'creature:woodland'],
    expansion: {
      marketplaceEligible: false,
      tradeEligible: true,
      socialGiftEligible: true
    }
  },
  lightningCrystal: {
    id: 'lightningCrystal',
    name: 'Lightning crystal',
    category: 'Treasures',
    rarity: 'Rare',
    emoji: '⚡',
    description: 'A storm-bright crystal that keeps a tiny spark from a faraway rumble.',
    sellValue: 4,
    buybackValue: 6,
    discoveryState: 'undiscovered',
    uses: ['craft', 'sell', 'trade'],
    craftingRoles: ['milestone', 'alchemy'],
    tags: ['weather:storm', 'material:crystal', 'material:stone'],
    expansion: {
      marketplaceEligible: true,
      tradeEligible: true,
      socialGiftEligible: false
    }
  },
  moonflower: {
    id: 'moonflower',
    name: 'Moonflower',
    category: 'Plants',
    rarity: 'Super Rare',
    emoji: '🌙',
    description: 'A silver-petaled bloom that slowly opens only under a nighttime sky.',
    sellValue: 5,
    buybackValue: 7,
    discoveryState: 'undiscovered',
    uses: ['craft', 'sell', 'trade'],
    craftingRoles: ['milestone', 'decoration'],
    tags: ['time:night', 'plant:moonlit'],
    expansion: {
      marketplaceEligible: true,
      tradeEligible: true,
      socialGiftEligible: false
    }
  },
  fortunePotion: {
    id: 'fortunePotion',
    name: 'Fortune Potion',
    category: 'Potions',
    rarity: 'Rare',
    emoji: '🧪',
    description: 'A lucky little sip for the road.',
    sellValue: 0,
    buybackValue: 0,
    discoveryState: 'undiscovered',
    uses: ['action-based buff'],
    craftingRoles: [],
    expansion: {
      marketplaceEligible: false,
      tradeEligible: false,
      socialGiftEligible: false
    }
  },
  moonlitWindowCharm: {
    id: 'moonlitWindowCharm',
    name: 'Moonlit Window Charm',
    category: 'Room keepsakes',
    rarity: 'Rare',
    emoji: '🪟',
    description: 'A Stardust-glass charm that catches the quiet shimmer of faraway stars.',
    sellValue: 0,
    buybackValue: 0,
    discoveryState: 'undiscovered',
    uses: ['room keepsake'],
    craftingRoles: [],
    shopRoomItem: true,
    expansion: {
      marketplaceEligible: false,
      tradeEligible: false,
      socialGiftEligible: false
    }
  },
  fireflyWishJar: {
    id: 'fireflyWishJar',
    name: 'Firefly Wish Jar',
    category: 'Room keepsakes',
    rarity: 'Super Rare',
    emoji: '🏮',
    description: 'A tiny lantern for three gentle fireflies and one very big wish.',
    sellValue: 0,
    buybackValue: 0,
    discoveryState: 'undiscovered',
    uses: ['room keepsake'],
    craftingRoles: [],
    shopRoomItem: true,
    expansion: {
      marketplaceEligible: false,
      tradeEligible: false,
      socialGiftEligible: false
    }
  },
  pocketPhone: {
    id: 'pocketPhone',
    name: 'Pocket Phone',
    category: 'Special items',
    rarity: 'Unique',
    emoji: '📱',
    description: 'A little pocket-sized way to keep your discoveries and notes close.',
    sellValue: 0,
    buybackValue: 0,
    discoveryState: 'undiscovered',
    uses: ['phone hub access'],
    craftingRoles: [],
    expansion: {
      marketplaceEligible: false,
      tradeEligible: false,
      socialGiftEligible: false
    }
  },
  silverleaf: {
    id: 'silverleaf',
    name: 'Silverleaf',
    category: 'Plants',
    rarity: 'Uncommon',
    emoji: '🍃',
    description: 'A softly shining leaf from the Wildwood.',
    sellValue: 3,
    buybackValue: 4,
    discoveryState: 'undiscovered',
    uses: ['craft'],
    craftingRoles: ['milestone'],
    expansion: {
      marketplaceEligible: false,
      tradeEligible: true,
      socialGiftEligible: false
    }
  },
  amberResin: {
    id: 'amberResin',
    name: 'Amber resin',
    category: 'Materials',
    rarity: 'Uncommon',
    emoji: '🟠',
    description: 'A warm bead of tree resin, clear as late-afternoon light.',
    sellValue: 3,
    buybackValue: 4,
    discoveryState: 'undiscovered',
    uses: ['craft'],
    craftingRoles: ['milestone'],
    expansion: {
      marketplaceEligible: true,
      tradeEligible: true,
      socialGiftEligible: false
    }
  },
  featherDown: {
    id: 'featherDown',
    name: 'Featherdown',
    category: 'Materials',
    rarity: 'Uncommon',
    emoji: '🪶',
    description: 'A cloud-soft feather left behind by a woodland bird.',
    sellValue: 3,
    buybackValue: 4,
    discoveryState: 'undiscovered',
    uses: ['craft'],
    craftingRoles: ['milestone'],
    expansion: {
      marketplaceEligible: true,
      tradeEligible: true,
      socialGiftEligible: false
    }
  },
  moonstoneShard: {
    id: 'moonstoneShard',
    name: 'Moonstone shard',
    category: 'Treasures',
    rarity: 'Rare',
    emoji: '🌙',
    description: 'A cool, pearly sliver that holds a little moonlight.',
    sellValue: 4,
    buybackValue: 6,
    discoveryState: 'undiscovered',
    uses: ['craft'],
    craftingRoles: ['milestone'],
    expansion: {
      marketplaceEligible: true,
      tradeEligible: true,
      socialGiftEligible: false
    }
  },
  glowcap: {
    id: 'glowcap',
    name: 'Glowcap',
    category: 'Fungi',
    rarity: 'Rare',
    emoji: '🍄',
    description: 'A tiny blue mushroom with a lantern-bright crown.',
    sellValue: 4,
    buybackValue: 6,
    discoveryState: 'undiscovered',
    uses: ['craft'],
    craftingRoles: ['milestone'],
    expansion: {
      marketplaceEligible: true,
      tradeEligible: true,
      socialGiftEligible: false
    }
  },
  crystalThread: {
    id: 'crystalThread',
    name: 'Crystal thread',
    category: 'Materials',
    rarity: 'Rare',
    emoji: '🧵',
    description: 'A glimmering strand spun through the Crystal Caverns.',
    sellValue: 4,
    buybackValue: 6,
    discoveryState: 'undiscovered',
    uses: ['craft'],
    craftingRoles: ['milestone'],
    expansion: {
      marketplaceEligible: true,
      tradeEligible: true,
      socialGiftEligible: false
    }
  },
  starblossom: {
    id: 'starblossom',
    name: 'Starblossom',
    category: 'Plants',
    rarity: 'Super Rare',
    emoji: '🌟',
    description: 'A dusk-blooming flower with a star at its heart.',
    sellValue: 5,
    buybackValue: 7,
    discoveryState: 'undiscovered',
    uses: ['craft'],
    craftingRoles: ['milestone'],
    expansion: {
      marketplaceEligible: true,
      tradeEligible: true,
      socialGiftEligible: false
    }
  },
  nightSilk: {
    id: 'nightSilk',
    name: 'Night silk',
    category: 'Materials',
    rarity: 'Super Rare',
    emoji: '🕸️',
    description: 'A soft, dark shimmer gathered from the Moonlit Grove.',
    sellValue: 5,
    buybackValue: 7,
    discoveryState: 'undiscovered',
    uses: ['craft'],
    craftingRoles: ['milestone'],
    expansion: {
      marketplaceEligible: true,
      tradeEligible: true,
      socialGiftEligible: false
    }
  },
  dreamglass: {
    id: 'dreamglass',
    name: 'Dreamglass',
    category: 'Treasures',
    rarity: 'Super Rare',
    emoji: '💎',
    description: 'A glassy pebble that catches colors that are not quite there.',
    sellValue: 5,
    buybackValue: 7,
    discoveryState: 'undiscovered',
    uses: ['craft'],
    craftingRoles: ['milestone'],
    expansion: {
      marketplaceEligible: true,
      tradeEligible: true,
      socialGiftEligible: false
    }
  },
  sunmetal: {
    id: 'sunmetal',
    name: 'Sunmetal',
    category: 'Materials',
    rarity: 'Ultra Rare',
    emoji: '🔆',
    description: 'A tiny warm-gold fragment from The Unknown.',
    sellValue: 6,
    buybackValue: 8,
    discoveryState: 'undiscovered',
    uses: ['craft'],
    craftingRoles: ['milestone'],
    expansion: {
      marketplaceEligible: true,
      tradeEligible: true,
      socialGiftEligible: false
    }
  },
  cloudPearl: {
    id: 'cloudPearl',
    name: 'Cloud pearl',
    category: 'Treasures',
    rarity: 'Ultra Rare',
    emoji: '☁️',
    description: 'A smooth little pearl as light as a drifting cloud.',
    sellValue: 6,
    buybackValue: 8,
    discoveryState: 'undiscovered',
    uses: ['craft'],
    craftingRoles: ['milestone'],
    expansion: {
      marketplaceEligible: true,
      tradeEligible: true,
      socialGiftEligible: false
    }
  },
  skyglass: {
    id: 'skyglass',
    name: 'Skyglass',
    category: 'Treasures',
    rarity: 'Ultra Rare',
    emoji: '🪞',
    description: 'A clear shard that reflects the blue above the clouds.',
    sellValue: 6,
    buybackValue: 8,
    discoveryState: 'undiscovered',
    uses: ['craft'],
    craftingRoles: ['milestone'],
    expansion: {
      marketplaceEligible: true,
      tradeEligible: true,
      socialGiftEligible: false
    }
  },
  explorerCompass: {
    id: 'explorerCompass',
    name: 'Explorer’s Compass',
    category: 'Special items',
    rarity: 'Unique',
    emoji: '🧭',
    description: 'A hand-built compass that remembers the paths you have walked.',
    sellValue: 0,
    buybackValue: 0,
    discoveryState: 'undiscovered',
    uses: ['milestone keepsake'],
    craftingRoles: [],
    expansion: {
      marketplaceEligible: false,
      tradeEligible: false,
      socialGiftEligible: false
    }
  },
  ancientCauldron: {
    id: 'ancientCauldron',
    name: 'Ancient Cauldron',
    category: 'Special items',
    rarity: 'Unique',
    emoji: '⚗️',
    description: 'A little old, a little magical, and ready for the next chapter.',
    sellValue: 0,
    buybackValue: 0,
    discoveryState: 'undiscovered',
    uses: ['milestone keepsake'],
    craftingRoles: [],
    expansion: {
      marketplaceEligible: false,
      tradeEligible: false,
      socialGiftEligible: false
    }
  },
  moonstoneLantern: {
    id: 'moonstoneLantern',
    name: 'Moonstone Lantern',
    category: 'Special items',
    rarity: 'Unique',
    emoji: '🏮',
    description: 'A gentle light for paths that only appear after dusk.',
    sellValue: 0,
    buybackValue: 0,
    discoveryState: 'undiscovered',
    uses: ['milestone keepsake'],
    craftingRoles: [],
    expansion: {
      marketplaceEligible: false,
      tradeEligible: false,
      socialGiftEligible: false
    }
  },
  worldRelic: {
    id: 'worldRelic',
    name: 'World Relic',
    category: 'Special items',
    rarity: 'Unique',
    emoji: '✨',
    description: 'A keepsake shaped by the many different places you have called yours.',
    sellValue: 0,
    buybackValue: 0,
    discoveryState: 'undiscovered',
    uses: ['milestone keepsake'],
    craftingRoles: [],
    expansion: {
      marketplaceEligible: false,
      tradeEligible: false,
      socialGiftEligible: false
    }
  },
  masterCollectorsRelic: {
    id: 'masterCollectorsRelic',
    name: 'Master Collector’s Relic',
    category: 'Special items',
    rarity: 'Unique',
    emoji: '🏆',
    description: 'A one-of-a-kind mark of a curious heart and a very full journal.',
    sellValue: 0,
    buybackValue: 0,
    discoveryState: 'undiscovered',
    uses: ['milestone keepsake'],
    craftingRoles: [],
    expansion: {
      marketplaceEligible: false,
      tradeEligible: false,
      socialGiftEligible: false
    }
  },
  canopyWisp: {
    id: 'canopyWisp',
    name: 'Canopy wisp',
    category: 'Creatures',
    rarity: 'Legendary',
    emoji: '🧚',
    description: 'A shy, lantern-bright creature that drifts between the Whispering Canopy branches.',
    sellValue: 0,
    buybackValue: 0,
    discoveryState: 'undiscovered',
    uses: ['collection keepsake'],
    craftingRoles: [],
    tags: ['time:night', 'creature:glow', 'creature:canopy'],
    expansion: {
      marketplaceEligible: false,
      tradeEligible: true,
      socialGiftEligible: true
    }
  },
  whisperingBloom: {
    id: 'whisperingBloom',
    name: 'Whispering bloom',
    category: 'Plants',
    rarity: 'Epic',
    emoji: '🪷',
    description: 'A soft-lilac flower whose petals seem to murmur with the wind.',
    sellValue: 7,
    buybackValue: 9,
    discoveryState: 'undiscovered',
    uses: ['craft'],
    craftingRoles: ['alchemy', 'milestone'],
    tags: ['plant:canopy', 'plant:moonlit'],
    expansion: {
      marketplaceEligible: true,
      tradeEligible: true,
      socialGiftEligible: false
    }
  },
  starlace: {
    id: 'starlace',
    name: 'Starlace',
    category: 'Materials',
    rarity: 'Epic',
    emoji: '🧵',
    description: 'A delicate, star-speckled thread gathered from high branches.',
    sellValue: 7,
    buybackValue: 9,
    discoveryState: 'undiscovered',
    uses: ['craft'],
    craftingRoles: ['alchemy', 'milestone'],
    tags: ['material:canopy', 'treasure:sky'],
    expansion: {
      marketplaceEligible: true,
      tradeEligible: true,
      socialGiftEligible: false
    }
  },
  canopyStarCompass: {
    id: 'canopyStarCompass',
    name: 'Canopy Star Compass',
    category: 'Special items',
    rarity: 'Unique',
    emoji: '🧭',
    description: 'A keepsake marking the first trails beyond the old map.',
    sellValue: 0,
    buybackValue: 0,
    discoveryState: 'undiscovered',
    uses: ['milestone keepsake'],
    craftingRoles: [],
    expansion: {
      marketplaceEligible: false,
      tradeEligible: false,
      socialGiftEligible: false
    }
  },
  amberAcornArtifact: {
    id: 'amberAcornArtifact',
    name: 'Amber Acorn',
    category: 'Special items',
    rarity: 'Common',
    emoji: '🌰',
    description: 'A little acorn glowing with the warm spirit of Amberfall Woods.',
    sellValue: 0,
    buybackValue: 0,
    discoveryState: 'undiscovered',
    uses: ['collection keepsake'],
    craftingRoles: [],
    artifact: true,
    tags: ['plant:autumn', 'artifact:amberfall'],
    expansion: {
      marketplaceEligible: false,
      tradeEligible: false,
      socialGiftEligible: false
    }
  },
  foxfireLanternArtifact: {
    id: 'foxfireLanternArtifact',
    name: 'Foxfire Lantern',
    category: 'Special items',
    rarity: 'Rare',
    emoji: '🏮',
    description: 'A tiny old lantern lit by foxfire, found where hidden paths slip beneath the roots.',
    sellValue: 0,
    buybackValue: 0,
    discoveryState: 'undiscovered',
    uses: ['collection keepsake'],
    craftingRoles: [],
    artifact: true,
    tags: ['time:night', 'artifact:amberfall'],
    expansion: {
      marketplaceEligible: false,
      tradeEligible: false,
      socialGiftEligible: false
    }
  },
  ancientRootCrown: {
    id: 'ancientRootCrown',
    name: 'Ancient Root Crown',
    category: 'Special items',
    rarity: 'Unique',
    emoji: '👑',
    description: 'A crown woven from Amberfall’s oldest roots, earned at the end of this chapter.',
    sellValue: 0,
    buybackValue: 0,
    discoveryState: 'undiscovered',
    uses: ['milestone keepsake'],
    craftingRoles: [],
    artifact: true,
    tags: ['material:amberfall', 'artifact:amberfall'],
    expansion: {
      marketplaceEligible: false,
      tradeEligible: false,
      socialGiftEligible: false
    }
  },
  amberLeaf: {
    id: 'amberLeaf',
    name: 'Amber leaf',
    category: 'Plants',
    rarity: 'Common',
    emoji: '🍂',
    description: 'A crisp amber leaf that still holds a little afternoon warmth.',
    sellValue: 2,
    buybackValue: 3,
    discoveryState: 'undiscovered',
    uses: ['collection keepsake', 'craft'],
    craftingRoles: ['dye', 'decoration'],
    tags: ['plant:autumn'],
    expansion: {
      marketplaceEligible: false,
      tradeEligible: true,
      socialGiftEligible: false
    }
  },
  amberMoss: {
    id: 'amberMoss',
    name: 'Amber moss',
    category: 'Materials',
    rarity: 'Common',
    emoji: '🌿',
    description: 'Soft, golden-edged moss tucked between the old roots.',
    sellValue: 2,
    buybackValue: 3,
    discoveryState: 'undiscovered',
    uses: ['craft'],
    craftingRoles: ['milestone', 'decoration'],
    tags: ['material:amberfall', 'material:woodland'],
    expansion: {
      marketplaceEligible: false,
      tradeEligible: true,
      socialGiftEligible: false
    }
  },
  hollowBark: {
    id: 'hollowBark',
    name: 'Hollow bark',
    category: 'Materials',
    rarity: 'Uncommon',
    emoji: '🪵',
    description: 'A smooth curl of bark from a hollow tree, light as a whispered secret.',
    sellValue: 3,
    buybackValue: 4,
    discoveryState: 'undiscovered',
    uses: ['craft'],
    craftingRoles: ['milestone', 'building'],
    tags: ['material:amberfall'],
    expansion: {
      marketplaceEligible: false,
      tradeEligible: true,
      socialGiftEligible: false
    }
  },
  embercap: {
    id: 'embercap',
    name: 'Embercap',
    category: 'Fungi',
    rarity: 'Uncommon',
    emoji: '🍄',
    description: 'A little copper mushroom with a faintly glowing cap.',
    sellValue: 3,
    buybackValue: 4,
    discoveryState: 'undiscovered',
    uses: ['craft', 'collection keepsake'],
    craftingRoles: ['milestone', 'alchemy'],
    tags: ['fungus', 'plant:autumn'],
    expansion: {
      marketplaceEligible: false,
      tradeEligible: true,
      socialGiftEligible: false
    }
  },
  ancientRootFiber: {
    id: 'ancientRootFiber',
    name: 'Ancient root fiber',
    category: 'Materials',
    rarity: 'Rare',
    emoji: '🪢',
    description: 'A sturdy golden-brown thread shed by Amberfall’s oldest roots.',
    sellValue: 4,
    buybackValue: 6,
    discoveryState: 'undiscovered',
    uses: ['craft'],
    craftingRoles: ['milestone'],
    tags: ['material:amberfall'],
    expansion: {
      marketplaceEligible: false,
      tradeEligible: true,
      socialGiftEligible: false
    }
  }
};
for (const potion of Object.values(POTION_DEFINITIONS)) {
  const item = ITEM_CATALOG[potion.itemId] || {
    id: potion.itemId,
    sellValue: 0,
    buybackValue: 0,
    discoveryState: 'undiscovered',
    uses: ['action-based buff'],
    craftingRoles: [],
    expansion: {
      marketplaceEligible: false,
      tradeEligible: false,
      socialGiftEligible: false
    }
  };
  Object.assign(item, {
    name: potion.name,
    category: 'Potions',
    rarity: potion.rarity,
    emoji: potion.emoji,
    description: `${potion.description} ${potion.effect.description}`,
    potionEffect: potion.effect,
    potionCategory: potion.category
  });
  ITEM_CATALOG[potion.itemId] = item;
}
const ITEM_ART_PATHS = Object.freeze({
  amberAcornArtifact: 'assets/amber-acorn-art.webp',
  foxfireLanternArtifact: 'assets/foxfire-lantern-art.webp',
  ancientRootCrown: 'assets/ancient-root-crown-art.webp'
});
function itemIconMarkup(item, className = 'journal-item-icon') {
  const imagePath = ITEM_ART_PATHS[item?.id];
  return `<span class="${className}" aria-hidden="true">${imagePath ? `<img class="item-art-image" src="${imagePath}" alt="" />` : escapeHTML(item?.emoji || '✦')}</span>`;
}
const COLLECTION_CATEGORIES = ['Plants', 'Fungi', 'Materials', 'Creatures', 'Potions', 'Treasures', 'Special items'];
const EXPEDITION_REWARDS = {
  first: [{
    type: 'discovery',
    id: 'clover',
    name: 'Clover',
    emoji: '🍀',
    quantity: 1,
    description: 'A tiny four-leaf friend, tucked into the Meadow grass.'
  }, {
    type: 'material',
    id: 'meadowMushroom',
    name: 'Meadow mushroom',
    emoji: '🍄',
    quantity: 2,
    description: 'Two plump little mushrooms, perfect for keeping.'
  }, {
    type: 'material',
    id: 'softwood',
    name: 'Softwood',
    emoji: '🪵',
    quantity: 3,
    description: 'A few smooth pieces of softwood from a fallen branch.'
  }, {
    type: 'xp',
    amount: 28,
    name: 'A little more experienced',
    emoji: '✦',
    description: 'Your first outing made you and your explorer a little wiser.'
  }, {
    type: 'phone',
    name: 'Your very own phone',
    emoji: '✆',
    description: 'It was waiting beneath the clover. A little pocket-sized way to keep your finds close.'
  }],
  second: [{
    type: 'discovery',
    id: 'dandelion',
    name: 'Dandelion',
    emoji: '🌼',
    quantity: 1,
    description: 'A sunny little flower your explorer found nodding in the grass.'
  }, {
    type: 'material',
    id: 'meadowMushroom',
    name: 'Meadow mushroom',
    emoji: '🍄',
    quantity: 1,
    description: 'One more plump mushroom for your growing collection of useful things.'
  }, {
    type: 'material',
    id: 'softwood',
    name: 'Softwood',
    emoji: '🪵',
    quantity: 2,
    description: 'A couple more smooth pieces from the Meadow.'
  }, {
    type: 'xp',
    amount: 17,
    name: 'Meadow know-how',
    emoji: '✦',
    description: 'Every little outing teaches you something new.'
  }],
  repeat: [{
    type: 'material',
    id: 'acorn',
    name: 'Acorn',
    emoji: '🌰',
    quantity: 1,
    description: 'A sturdy acorn your explorer spotted under the grasses.'
  }, {
    type: 'material',
    id: 'moss',
    name: 'Soft moss',
    emoji: '🌿',
    quantity: 2,
    description: 'A little cushion of soft, springy moss.'
  }, {
    type: 'xp',
    amount: 25,
    name: 'Trail practice',
    emoji: '✦',
    description: 'Your explorer is getting to know the Meadow.'
  }]
};

// Kept only to preserve old room-pin references inertly when loading existing saves.
const LEGACY_ROOM_DISPLAY_SLOT_IDS = new Set(['botanical', 'alchemy', 'treasure', 'discovery', 'favorite', 'prestige']);
const ROOM_WALL_STYLES = [{
  id: 'cream',
  label: 'Warm cream',
  color: '#d8bd91',
  shade: '#b8946c',
  light: '#f2dfb6'
}, {
  id: 'sage',
  label: 'Soft sage',
  color: '#a7b192',
  shade: '#7f8d71',
  light: '#d1d9b3'
}, {
  id: 'blue',
  label: 'Muted blue',
  color: '#91aab1',
  shade: '#6b858f',
  light: '#bfd0cc'
}];
const ROOM_FLOOR_STYLES = [{
  id: 'wood',
  label: 'Honey wood',
  color: '#96694a',
  shade: '#694833',
  detail: '#c28b5c'
}, {
  id: 'stone',
  label: 'Quiet stone',
  color: '#837d72',
  shade: '#5f5b54',
  detail: '#aaa18d'
}, {
  id: 'carpet',
  label: 'Mossy carpet',
  color: '#718064',
  shade: '#4d604c',
  detail: '#a4a77a'
}];
const ROOM_FURNITURE_DEFINITIONS = [{
  id: 'bed',
  layer: 'furniture',
  renderer: 'bed'
}, {
  id: 'desk',
  layer: 'furniture',
  renderer: 'desk'
}, {
  id: 'lamp',
  layer: 'furniture',
  renderer: 'lamp'
}, {
  id: 'plant',
  layer: 'furniture',
  renderer: 'plant'
}];
function createRoomState() {
  return {
    name: 'Little Nook',
    wallStyle: 'cream',
    floorStyle: 'wood',
    themeId: 'starter-room',
    furniture: ROOM_FURNITURE_DEFINITIONS.map(object => object.id),
    // Legacy display preferences remain inert so an older save can round-trip safely.
    favorites: [],
    slotAssignments: {},
    unlocks: []
  };
}
function sanitizeRoomState(raw) {
  const room = createRoomState();
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return room;
  const wallStyle = ROOM_WALL_STYLES.find(style => style.id === raw.wallStyle);
  const floorStyle = ROOM_FLOOR_STYLES.find(style => style.id === raw.floorStyle);
  const roomName = validateUserText(raw.name, 'ROOM_NAME');
  room.name = roomName.allowed ? roomName.text : room.name;
  room.wallStyle = wallStyle?.id || room.wallStyle;
  room.floorStyle = floorStyle?.id || room.floorStyle;
  room.furniture = Array.isArray(raw.furniture) ? [...new Set(raw.furniture.filter(id => ROOM_FURNITURE_DEFINITIONS.some(object => object.id === id)))].slice(0, 24) : room.furniture;
  room.unlocks = Array.isArray(raw.unlocks) ? [...new Set(raw.unlocks.filter(id => typeof id === 'string').map(id => id.slice(0, 64)))].slice(0, 80) : [];
  const assignments = raw.slotAssignments && typeof raw.slotAssignments === 'object' && !Array.isArray(raw.slotAssignments) ? raw.slotAssignments : {};
  room.slotAssignments = Object.fromEntries(Object.entries(assignments).filter(([slotId, itemId]) => /^[a-z][a-z0-9-]{0,48}$/i.test(slotId) && Object.hasOwn(ITEM_CATALOG, itemId)).slice(0, 24));
  room.favorites = Array.isArray(raw.favorites) ? [...new Set(raw.favorites.filter(itemId => Object.hasOwn(ITEM_CATALOG, itemId)))].slice(0, 3) : [];
  return room;
}
function sanitizeLegacyDisplayPins(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  return Object.fromEntries(Object.entries(raw).filter(([slotId, itemId]) => LEGACY_ROOM_DISPLAY_SLOT_IDS.has(slotId) && Object.hasOwn(ITEM_CATALOG, itemId)).slice(0, LEGACY_ROOM_DISPLAY_SLOT_IDS.size));
}
const MASTER_COLLECTOR_BADGE = {
  id: 'master-collector',
  name: 'Master Collector',
  icon: '✦',
  description: 'A badge for reaching Level 50 and noticing a world of little wonders.'
};
const ROOM_THEMES = {
  'starter-room': {
    id: 'starter-room',
    name: 'Starter Room',
    displayFrame: '#d8a568',
    shopTitle: 'MOSSY ROOM SHOP'
  },
  'forest-cabin': {
    id: 'forest-cabin',
    name: 'Forest Cabin',
    displayFrame: '#8aa477',
    shopTitle: 'FOREST SHOP'
  },
  'mushroom-cottage': {
    id: 'mushroom-cottage',
    name: 'Mushroom Cottage',
    displayFrame: '#c68177',
    shopTitle: 'MUSHROOM SHOP'
  },
  'moonlit-room': {
    id: 'moonlit-room',
    name: 'Moonlit Room',
    displayFrame: '#a6a7ce',
    shopTitle: 'MOONLIT SHOP'
  },
  'swamp-shack': {
    id: 'swamp-shack',
    name: 'Swamp Shack',
    displayFrame: '#839477',
    shopTitle: 'SWAMP SHOP'
  },
  'magical-observatory': {
    id: 'magical-observatory',
    name: 'Magical Observatory',
    displayFrame: '#9c83ad',
    shopTitle: 'STARLIGHT SHOP'
  },
  'beach-house': {
    id: 'beach-house',
    name: 'Beach House',
    displayFrame: '#e3b57f',
    shopTitle: 'SHORE SHOP'
  },
  'canopy-sanctuary': {
    id: 'canopy-sanctuary',
    name: 'Canopy Sanctuary',
    displayFrame: '#a8c777',
    shopTitle: 'WHISPERING CANOPY SHOP',
    unlockLevel: 51
  }
};
const RECIPES = Object.fromEntries(Object.values(POTION_DEFINITIONS).filter(potion => potion.recipe).map(potion => [potion.recipe.id, {
  ...potion.recipe,
  name: potion.name,
  category: potion.category,
  potionItemId: potion.itemId,
  effect: potion.effect,
  unlock: potion.unlock,
  maxCraftsPerWorld: null
}]));
const RARITY_ORDER = {
  Common: 1,
  Uncommon: 2,
  Rare: 3,
  'Super Rare': 4,
  'Ultra Rare': 5,
  Epic: 6,
  Legendary: 7,
  Unique: 8
};
// Destination definitions, conditional pools, weather, time, and events live in expedition-data.js.
// Keep these stable ids while names and regional art evolve; saved expeditions refer to their ids.
const AREA_CATALOG = DESTINATION_DATA;
const MILESTONE_MATERIAL_IDS = new Set(PROGRESSION_MILESTONES.flatMap(milestone => milestone.ingredients.map(ingredient => ingredient.itemId)));
const LEVEL_CAP = PLAYER_LEVEL_CAP;
const MAP_ZONE_LEVEL_CAP = LEVEL_CAP;
const MAX_TALENT_POINTS = LEVEL_CAP - 1;
const LEVEL_CAP_MIGRATION_NOTICE = 'Your older trail went beyond today’s map. Your level is now capped at 60; existing XP and keepsakes were kept, and unverified milestone or companion progress was not added.';
const TALENT_BY_ID = new Map(WILDSOUL_TALENT_BRANCHES.flatMap(branch => branch.talents.map(talent => [talent.id, talent])));
let legacyLevelWarningReported = false;
const AREA_ICONS = {
  meadow: '🌼',
  bramblewood: '🌳',
  moonwell: '💎',
  'starlit-bog': '🌙',
  'cloudstep-ruins': '✦',
  'amberfall-woods': '🍂',
  'whispering-canopy': '🌿'
};
const simulatedPlayerManager = new SimulatedPlayerManager({
  items: ITEM_CATALOG,
  pets: PETS,
  petSpecialties: PET_SPECIALTIES,
  areas: AREA_CATALOG,
  weatherData: WEATHER_DATA,
  timeData: TIME_DATA,
  milestones: PROGRESSION_MILESTONES,
  progressionConfig: PROGRESSION_CONFIG,
  recipes: RECIPES,
  roomThemes: ROOM_THEMES,
  roomThemePrices: ECONOMY_CONFIG.roomThemePrices,
  wallStyles: ROOM_WALL_STYLES,
  floorStyles: ROOM_FLOOR_STYLES,
  avatarOptions: Object.fromEntries(Object.entries(AVATAR_OPTIONS).map(([key, options]) => [key, options.length])),
  roomFurniture: ROOM_FURNITURE_DEFINITIONS.map(object => object.id),
  firstDiscoveryStardust: ECONOMY_CONFIG.firstDiscoveryStardust,
  commonCraftingGoldCosts: ECONOMY_CONFIG.commonCraftingGoldCosts,
  maxCurrency: ECONOMY_CONFIG.maxBalance,
  levelCap: LEVEL_CAP
});
const socialPlayerService = new PocketwildPlayerService({
  simulatedPlayers: simulatedPlayerManager,
  realPlayers: socialManager,
  getUser: () => playerSaveManager.getStatus().user
});
function xpForLevel(level) {
  const steps = Math.max(0, Math.floor(level) - 1);
  return Math.floor(PROGRESSION_CONFIG.baseXpPerLevel * (steps + PROGRESSION_CONFIG.xpGrowthPerLevel * steps * (steps - 1) / 2));
}
function levelForXpUncapped(xp) {
  let low = 1;
  let high = 2;
  while (xpForLevel(high) <= xp && high < 1_000_000_000) high *= 2;
  high = Math.min(high, 1_000_000_000);
  while (low + 1 < high) {
    const middle = Math.floor((low + high) / 2);
    if (xpForLevel(middle) <= xp) low = middle;else high = middle;
  }
  return xpForLevel(high) <= xp ? high : low;
}
function levelForXp(xp) {
  return Math.min(LEVEL_CAP, levelForXpUncapped(xp));
}
function companionEvolutionStageForLevel(level) {
  return COMPANION_MILESTONES.filter(milestone => level >= milestone.level).length;
}
function recordCompanionMilestonesCrossed(previousLevel, currentLevel) {
  const world = state.world;
  if (!world || currentLevel <= previousLevel) return false;
  world.companionCinematicSeen ||= [];
  world.companionCinematicQueue ||= [];
  let queued = false;
  for (const milestone of COMPANION_MILESTONES) {
    if (milestone.level <= previousLevel || milestone.level > currentLevel) continue;
    world.companionEvolutionStage = Math.max(world.companionEvolutionStage || 0, COMPANION_MILESTONES.indexOf(milestone) + 1);
    if (world.companionCinematicSeen.includes(milestone.id) || world.companionCinematicQueue.includes(milestone.id)) continue;
    world.companionCinematicQueue.push(milestone.id);
    queued = true;
  }
  world.companionEvolutionStage = Math.max(world.companionEvolutionStage || 0, companionEvolutionStageForLevel(currentLevel));
  return queued;
}
function completedMilestone(world, milestone) {
  return Boolean(world?.completedMilestones?.includes(milestone.id));
}
function milestoneHasMaterials(milestone, inventory = state.world.inventory) {
  return Boolean(milestone && milestone.ingredients.every(ingredient => (inventory?.[ingredient.itemId] || 0) >= ingredient.quantity));
}
function inferLegacyCompletedMilestones(raw) {
  const completed = new Set();
  const savedXpLevel = levelForXpUncapped(Math.max(0, Number(raw?.xp) || 0));
  const savedExpansionVersion = Math.max(0, Math.floor(Number(raw?.progressionContentVersion) || 0));
  // XP beyond the old Level 50 cap did not prove that the Master Collector
  // recipe was crafted. Keep that old save behavior during the first upgrade.
  const levelCanProveMilestone = savedXpLevel <= LEVEL_CAP && (savedExpansionVersion >= 2 || savedXpLevel <= MASTER_COLLECTOR_LEVEL);
  const inventory = raw?.inventory && typeof raw.inventory === 'object' ? raw.inventory : {};
  const collection = Array.isArray(raw?.collection) ? raw.collection : [];
  const evidencedAreas = new Set([raw?.activeAreaId, ...(Array.isArray(raw?.trailChoicesSeen) ? raw.trailChoicesSeen : [])].filter(id => AREA_CATALOG.some(area => area.id === id)));
  const furthestArea = Math.max(-1, ...[...evidencedAreas].map(id => AREA_CATALOG.findIndex(area => area.id === id)));
  for (const milestone of PROGRESSION_MILESTONES) {
    const artifactOwned = collection.includes(milestone.outputId) || Number(inventory[milestone.outputId]) > 0;
    const areaIndex = milestone.unlock.areaId ? AREA_CATALOG.findIndex(area => area.id === milestone.unlock.areaId) : -1;
    const areaProvesCraft = areaIndex >= 0 && furthestArea >= areaIndex;
    // Reaching a later level in old, un-gated saves proves the earlier chapter
    // was passed; reaching the milestone itself does not prove its craft.
    if (artifactOwned || areaProvesCraft || levelCanProveMilestone && savedXpLevel > milestone.level) completed.add(milestone.id);
  }
  return [...completed];
}
function availableAreaIds(world) {
  const ids = new Set([AREA_CATALOG[0].id]);
  for (const milestone of PROGRESSION_MILESTONES) {
    if (completedMilestone(world, milestone) && milestone.unlock.areaId) ids.add(milestone.unlock.areaId);
  }
  for (const area of AREA_CATALOG) {
    if (area.unlockMilestoneId && world?.completedMilestones?.includes(area.unlockMilestoneId)) ids.add(area.id);
  }
  return ids;
}
function unlockedAreas(world = state.world) {
  const ids = availableAreaIds(world);
  return AREA_CATALOG.filter(area => ids.has(area.id) && Number(area.maxLevel) <= LEVEL_CAP);
}
function objectiveContext() {
  const world = state.world;
  const openAreas = unlockedAreas(world).filter(area => areaAccessible(world, area));
  const maxTier = RARITY_TIERS.indexOf(highestUnlockedRarity(world));
  const discoverableIds = new Set();
  for (const area of openAreas) {
    const tierLimit = Math.min(RARITY_TIERS.indexOf(area.maxRarity), maxTier);
    for (const poolEntry of area.itemPool) {
      if (poolEntry.requiredTags.length) continue;
      const item = ITEM_CATALOG[poolEntry.itemId];
      if (!item || RARITY_TIERS.indexOf(item.rarity) > tierLimit || world.collection.includes(item.id)) continue;
      discoverableIds.add(item.id);
    }
  }
  return {
    level: progressionSnapshot(world).rawLevel,
    hasPet: Boolean(state.petId),
    unlockedAreas: openAreas.map(area => ({
      id: area.id,
      name: area.name
    })),
    discoverableCount: discoverableIds.size,
    systems: {
      crafting: world.knownRecipes.some(recipeId => world.discoveredRecipes.includes(recipeId))
    },
    recentExpeditionAreaId: world.lastTrip?.areaId || null
  };
}
function areaAccessible(world, area) {
  if (!area || !availableAreaIds(world).has(area.id)) return false;
  return progressionSnapshot(world).rawLevel >= area.minLevel;
}
function explorationMapAreas() {
  return AREA_CATALOG.filter(area => Number(area.maxLevel) <= MAP_ZONE_LEVEL_CAP);
}
function materialSourceAreas(itemId) {
  return explorationMapAreas().filter(area => area.itemPool.some(entry => entry.itemId === itemId));
}
function eligibleMaterialSourceAreas(itemId, world = state.world) {
  const item = ITEM_CATALOG[itemId];
  const itemTier = item ? RARITY_TIERS.indexOf(item.rarity) : -1;
  if (!item || itemTier < 0) return [];
  const worldTier = RARITY_TIERS.indexOf(highestUnlockedRarity(world));
  return materialSourceAreas(itemId).filter(area => {
    if (!areaAccessible(world, area)) return false;
    const areaTier = Math.min(RARITY_TIERS.indexOf(area.maxRarity), worldTier);
    return itemTier <= areaTier;
  });
}
function milestoneMaterialNeed(itemId, world = state.world) {
  if (!MILESTONE_MATERIAL_IDS.has(itemId)) return 0;
  const remainingRecipeDemand = PROGRESSION_MILESTONES.reduce((total, milestone) => {
    if (completedMilestone(world, milestone)) return total;
    return total + milestone.ingredients.reduce((ingredientTotal, ingredient) => ingredientTotal + (ingredient.itemId === itemId ? ingredient.quantity : 0), 0);
  }, 0);
  const owned = Math.max(0, Math.floor(Number(world?.inventory?.[itemId]) || 0));
  return Math.max(0, remainingRecipeDemand - owned);
}
function eligibleMilestoneDropIds(context, world = state.world) {
  const area = AREA_CATALOG.find(entry => entry.id === context?.destinationId);
  if (!area) return [];
  const tierLimit = Math.min(RARITY_TIERS.indexOf(area.maxRarity), RARITY_TIERS.indexOf(context.rarityEligibility));
  const tags = expeditionTags(context);
  return [...new Set(area.itemPool.filter(poolEntry => {
    const item = ITEM_CATALOG[poolEntry.itemId];
    return item && MILESTONE_MATERIAL_IDS.has(item.id) && milestoneMaterialNeed(item.id, world) > 0 && RARITY_TIERS.indexOf(item.rarity) <= tierLimit && poolEntry.requiredTags.every(tag => tags.has(tag));
  }).map(poolEntry => poolEntry.itemId))];
}
function areaMapLockCopy(world, area) {
  const gate = PROGRESSION_MILESTONES.find(milestone => milestone.unlock.areaId === area.id) || PROGRESSION_MILESTONES.find(milestone => milestone.id === area.unlockMilestoneId);
  const keepsakeOpen = availableAreaIds(world).has(area.id);
  const currentLevel = progressionSnapshot(world).rawLevel;
  return keepsakeOpen ? `Level ${area.minLevel} · you’re Level ${currentLevel}` : `Craft ${gate?.name || 'a milestone keepsake'} · Level ${gate?.level || area.unlockLevel}`;
}
function areasAwaitingTrailChoice(world = state.world) {
  const seen = new Set(world.trailChoicesSeen || []);
  return unlockedAreas(world).filter(area => areaAccessible(world, area) && !seen.has(area.id));
}
function highestUnlockedRarity(world) {
  const areas = unlockedAreas(world);
  return areas[areas.length - 1]?.maxRarity || 'Common';
}
function pendingMilestone(world = state.world) {
  return PROGRESSION_MILESTONES.find(milestone => !completedMilestone(world, milestone)) || null;
}
function roomShopMaterialPrice(itemId) {
  const item = ITEM_CATALOG[itemId];
  if (!item || !MILESTONE_MATERIAL_IDS.has(itemId)) return null;
  const basePrice = Math.max(0, Math.floor(Number(ECONOMY_CONFIG.npcBuybackGold[itemId] || item.buybackValue || item.sellValue) || 0));
  if (!basePrice) return null;
  const config = ECONOMY_CONFIG.roomShopRotation;
  return {
    currency: 'gold',
    price: Math.min(ECONOMY_CONFIG.maxBalance, Math.max(config.milestoneMaterialMinimumPrice, Math.floor(basePrice * config.milestoneMaterialPriceMultiplier)))
  };
}
function roomShopOfferDefinition(itemId, kind) {
  if (kind === 'material') {
    const price = roomShopMaterialPrice(itemId);
    return price ? {
      itemId,
      ...price,
      kind
    } : null;
  }
  const offer = ECONOMY_CONFIG.roomShopStock.find(entry => entry.itemId === itemId);
  return offer && ITEM_CATALOG[itemId] ? {
    ...offer,
    kind: 'catalog'
  } : null;
}
function sanitizeRoomShopRotation(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const periodId = Math.max(0, Math.floor(Number(raw.periodId) || 0));
  if (!Array.isArray(raw.slots)) return null;
  const seen = new Set();
  const slots = Array.from({
    length: ECONOMY_CONFIG.roomShopRotation.slotCount
  }, (_, index) => {
    const saved = raw.slots[index];
    if (!saved || typeof saved !== 'object' || typeof saved.itemId !== 'string' || seen.has(saved.itemId)) return null;
    const kind = saved.kind === 'material' ? 'material' : 'catalog';
    const definition = roomShopOfferDefinition(saved.itemId, kind);
    if (!definition) return null;
    seen.add(saved.itemId);
    return {
      ...definition,
      purchased: Boolean(saved.purchased)
    };
  });
  return {
    periodId,
    slots
  };
}
function seededRandom(seedText) {
  let seed = 2166136261;
  for (const character of String(seedText)) seed = Math.imul(seed ^ character.charCodeAt(0), 16777619);
  return () => {
    seed += 0x6D2B79F5;
    let value = seed;
    value = Math.imul(value ^ value >>> 15, value | 1);
    value ^= value + Math.imul(value ^ value >>> 7, value | 61);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}
function createRoomShopRotation(world, now = Date.now()) {
  const config = ECONOMY_CONFIG.roomShopRotation;
  const periodId = Math.floor(now / config.periodMs);
  const random = seededRandom(`${world.roomShopSeed}:${periodId}`);
  const milestone = pendingMilestone(world);
  const materialCandidates = (milestone?.ingredients || []).filter(ingredient => {
    const missing = Math.max(0, ingredient.quantity - Math.max(0, Math.floor(Number(world.inventory?.[ingredient.itemId]) || 0)));
    return missing > 0 && Boolean(roomShopMaterialPrice(ingredient.itemId));
  });
  const material = materialCandidates.length && random() < config.milestoneMaterialChance ? materialCandidates[Math.floor(random() * materialCandidates.length)] : null;
  const slots = Array(config.slotCount).fill(null);
  const usedIds = new Set();
  if (material) {
    const itemId = material.itemId;
    const index = Math.floor(random() * slots.length);
    slots[index] = {
      ...roomShopOfferDefinition(itemId, 'material'),
      purchased: false
    };
    usedIds.add(itemId);
  }
  for (let index = 0; index < slots.length; index++) {
    if (slots[index] || random() < config.emptySlotChance) continue;
    const available = ECONOMY_CONFIG.roomShopStock.filter(offer => ITEM_CATALOG[offer.itemId] && !usedIds.has(offer.itemId));
    if (!available.length) continue;
    const selected = available[Math.floor(random() * available.length)];
    slots[index] = {
      ...roomShopOfferDefinition(selected.itemId, 'catalog'),
      purchased: false
    };
    usedIds.add(selected.itemId);
  }
  return {
    periodId,
    slots
  };
}
function ensureRoomShopRotation(world = state.world, now = Date.now()) {
  const periodId = Math.floor(now / ECONOMY_CONFIG.roomShopRotation.periodMs);
  if (world.roomShopRotation?.periodId === periodId && Array.isArray(world.roomShopRotation.slots) && world.roomShopRotation.slots.length === ECONOMY_CONFIG.roomShopRotation.slotCount) return false;
  world.roomShopRotation = createRoomShopRotation(world, now);
  return true;
}
function availableLevelUpQuest(world = state.world) {
  const progress = progressionSnapshot(world);
  const milestone = progress.milestone;
  return milestone && progress.rawLevel >= milestone.level ? milestone : null;
}
function progressionSnapshot(world = state.world) {
  const totalXp = Math.max(0, Number(world.xp) || 0);
  const rawLevel = levelForXp(totalXp);
  const milestone = pendingMilestone(world);
  const level = milestone ? Math.min(rawLevel, milestone.level) : rawLevel;
  const levelCapped = level >= LEVEL_CAP;
  const xpCapped = rawLevel >= LEVEL_CAP;
  const startXp = xpForLevel(level);
  const nextLevelXp = levelCapped ? startXp : xpForLevel(level + 1);
  const needed = levelCapped ? 0 : Math.max(1, nextLevelXp - startXp);
  const earnedWithin = levelCapped ? 0 : Math.max(0, Math.min(needed, totalXp - startXp));
  const atBarrier = Boolean(milestone && level >= milestone.level);
  return {
    level,
    rawLevel,
    milestone,
    atBarrier,
    levelCapped,
    xpCapped,
    totalXp,
    startXp,
    nextLevelXp,
    earnedWithin,
    needed,
    percent: levelCapped ? 100 : Math.round(earnedWithin / needed * 100),
    remaining: levelCapped ? 0 : Math.max(0, needed - earnedWithin)
  };
}
function remainingXpCapacity(world = state.world) {
  return Math.max(0, xpForLevel(LEVEL_CAP) - Math.max(0, Number(world?.xp) || 0));
}
function expeditionXpSummary(amount) {
  const available = remainingXpCapacity();
  if (!available) return `XP paused at the Level ${LEVEL_CAP} cap`;
  if (available < amount) return `Up to ${available} XP before Level ${LEVEL_CAP}`;
  return `About ${amount} XP per outing`;
}
function earnedTalentPoints(world = state.world) {
  return Math.min(MAX_TALENT_POINTS, Math.max(0, progressionSnapshot(world).level - 1));
}
function spentTalentPoints(world = state.world) {
  return Object.values(world?.talents || {}).reduce((sum, rank) => sum + Math.max(0, Math.floor(Number(rank) || 0)), 0);
}
function talentRank(talentId, world = state.world) {
  return Math.max(0, Math.floor(Number(world?.talents?.[talentId]) || 0));
}
function talentEffectTotal(effect, world = state.world) {
  let total = 0;
  for (const branch of WILDSOUL_TALENT_BRANCHES) {
    for (const talent of branch.talents) {
      if (talent.effect === effect) total += talentRank(talent.id, world) * talent.value;
    }
  }
  return total;
}
function sanitizeTalentAllocations(rawTalents, world) {
  const raw = rawTalents && typeof rawTalents === 'object' && !Array.isArray(rawTalents) ? rawTalents : {};
  const earned = earnedTalentPoints(world);
  const ranks = {};
  let spent = 0;
  for (const branch of WILDSOUL_TALENT_BRANCHES) {
    let branchSpent = 0;
    for (const talent of branch.talents) {
      const requested = Math.max(0, Math.min(talent.maxRank, Math.floor(Number(raw[talent.id]) || 0)));
      let accepted = 0;
      while (accepted < requested && spent < earned && (accepted > 0 || branchSpent >= talent.unlockPoints)) {
        accepted++;
        spent++;
        branchSpent++;
      }
      if (accepted) ranks[talent.id] = accepted;
    }
  }
  return ranks;
}
function hasMasterCollectorBadge(world) {
  return Boolean(world?.badges?.includes(MASTER_COLLECTOR_BADGE.id) || world?.completedMilestones?.includes('milestone-50'));
}
function freshWorldData() {
  const now = Date.now();
  const today = new Date(now);
  const dayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const tomorrow = new Date(now);
  tomorrow.setHours(24, 0, 0, 0);
  return {
    ...ticketManager.createState(now),
    objectiveStates: {},
    objectiveHistory: [],
    objectiveDayKey: dayKey,
    objectiveDailyResetTimestamp: tomorrow.getTime(),
    lastActiveAt: now,
    offlineRewardTimestamp: now,
    pendingOfflineReward: null,
    progressionContentVersion: 2,
    xp: 0,
    talents: {},
    gold: 0,
    stardust: 0,
    autoSellEnabled: false,
    lastAutoSellExpedition: 0,
    selectedCraftRecipe: null,
    roomShopSeed: Math.floor(Math.random() * 2_147_483_646) + 1,
    roomShopRotation: null,
    inventory: {},
    collection: [],
    completedMilestones: [],
    companionEvolutionStage: 0,
    companionCinematicSeen: [],
    companionCinematicQueue: [],
    badges: [],
    activeAreaId: AREA_CATALOG[0].id,
    trailChoicesSeen: [],
    activeExpeditionAreaId: null,
    activeExpeditionXpStart: 0,
    notifications: [],
    marketHistory: [],
    phoneUnlocked: false,
    exploreInvitationDismissed: false,
    expeditions: 0,
    activeExpedition: 0,
    activeExpeditionData: null,
    activeExpeditionRewards: [],
    activeExpeditionPityTargets: [],
    milestoneDropPity: {},
    lastPityProcessedExpedition: 0,
    revealIndex: 0,
    lastTrip: null,
    phoneSection: 'home',
    discoveredRecipes: [],
    knownRecipes: [],
    craftedRecipes: [],
    activePotionBuff: null,
    displayPins: {},
    ownedRoomThemes: ['starter-room'],
    activeRoomTheme: 'starter-room',
    petDialogue: petDialogueManager.createState(),
    npcMemory: npcBehaviorManager.createState(),
    room: createRoomState()
  };
}
function sanitizePotionBuff(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const definition = POTION_DEFINITIONS[raw.itemId];
  if (!definition?.effect) return null;
  const legacyXpBonus = Number(raw.legacyXpBonus ?? raw.xpBonus);
  if (raw.remainingActions === undefined && Number.isFinite(legacyXpBonus) && legacyXpBonus > 0) {
    return {
      itemId: definition.itemId,
      remainingActions: 1,
      legacyXpBonus: Math.min(100, Math.floor(legacyXpBonus)),
      legacyOnly: true
    };
  }
  const maxActions = Math.max(1, Math.min(POTION_BALANCE.maxActionDuration, Math.floor(Number(definition.effect.duration) || 1)));
  const savedActions = Number(raw.remainingActions);
  return {
    itemId: definition.itemId,
    remainingActions: Number.isFinite(savedActions) ? Math.max(1, Math.min(maxActions, Math.floor(savedActions))) : maxActions
  };
}
function potionEffectFor(buff) {
  if (!buff || buff.legacyOnly) return null;
  return POTION_DEFINITIONS[buff.itemId]?.effect || null;
}
function potionActionLabel(action, count = 1) {
  const label = action === 'craft' ? 'craft' : 'outing';
  return count === 1 ? `next ${label}` : `next ${count} ${label}s`;
}
function activePotionSummary(buff = state.world.activePotionBuff) {
  if (!buff) return '';
  const definition = POTION_DEFINITIONS[buff.itemId];
  if (!definition) return '';
  if (buff.legacyOnly) return `${definition.name} · one saved XP boost remains.`;
  const effect = definition.effect;
  return `${definition.name} · ${potionActionLabel(effect.action, buff.remainingActions)} (${effect.description})`;
}
function consumePotionAction(action) {
  const buff = state.world.activePotionBuff;
  if (!buff) return null;
  if (buff.legacyOnly) {
    if (action !== 'expedition') return null;
    state.world.activePotionBuff = null;
    return {
      ...buff
    };
  }
  const effect = potionEffectFor(buff);
  if (!effect || effect.action !== action) return null;
  const consumed = {
    ...buff
  };
  buff.remainingActions = Math.max(0, buff.remainingActions - 1);
  if (!buff.remainingActions) state.world.activePotionBuff = null;
  return consumed;
}
function sanitizeWorldData(raw) {
  const world = freshWorldData();
  if (!raw || typeof raw !== 'object') return world;
  ticketManager.sanitizeWorld(world, raw);
  objectiveManager.sanitizeWorld(world, raw);
  const lastActiveAt = Number(raw.lastActiveAt);
  world.lastActiveAt = Number.isFinite(lastActiveAt) && lastActiveAt > 0 ? lastActiveAt : Date.now();
  const offlineRewardTimestamp = Number(raw.offlineRewardTimestamp);
  world.offlineRewardTimestamp = Number.isFinite(offlineRewardTimestamp) && offlineRewardTimestamp > 0 ? offlineRewardTimestamp : world.lastActiveAt;
  world.pendingOfflineReward = offlineRewardManager.sanitize(raw.pendingOfflineReward);
  const xp = Number(raw.xp);
  world.xp = Number.isFinite(xp) ? Math.max(0, Math.min(Number.MAX_SAFE_INTEGER, Math.floor(xp))) : 0;
  const savedXpLevel = levelForXpUncapped(world.xp);
  const legacyLevelAboveCap = savedXpLevel > LEVEL_CAP;
  for (const currency of ['gold', 'stardust']) {
    const balance = Number(raw[currency]);
    world[currency] = Number.isFinite(balance) ? Math.max(0, Math.min(ECONOMY_CONFIG.maxBalance, Math.floor(balance))) : 0;
  }
  world.autoSellEnabled = raw.autoSellEnabled === true;
  const lastAutoSellExpedition = Number(raw.lastAutoSellExpedition);
  world.lastAutoSellExpedition = Number.isSafeInteger(lastAutoSellExpedition) ? Math.max(0, lastAutoSellExpedition) : 0;
  world.completedMilestones = Array.isArray(raw.completedMilestones) ? [...new Set(raw.completedMilestones.filter(id => PROGRESSION_MILESTONES.some(milestone => milestone.id === id)))] : inferLegacyCompletedMilestones(raw);
  world.talents = sanitizeTalentAllocations(raw.talents, world);
  world.badges = Array.isArray(raw.badges) ? [...new Set(raw.badges.filter(id => id === MASTER_COLLECTOR_BADGE.id))] : [];
  if (hasMasterCollectorBadge(world) && !world.badges.includes(MASTER_COLLECTOR_BADGE.id)) {
    world.badges.push(MASTER_COLLECTOR_BADGE.id);
  }
  const hasEvolutionRecord = Object.hasOwn(raw, 'companionEvolutionStage') || Array.isArray(raw.companionCinematicSeen) || Array.isArray(raw.companionCinematicQueue);
  const reachedLevel = progressionSnapshot(world).level;
  const validCinematicIds = new Set(COMPANION_MILESTONES.map(milestone => milestone.id));
  world.companionEvolutionStage = legacyLevelAboveCap ? Math.max(0, Math.min(COMPANION_MILESTONES.length, Math.floor(Number(raw.companionEvolutionStage) || 0))) : Math.max(0, Math.min(COMPANION_MILESTONES.length, Math.floor(Number(raw.companionEvolutionStage) || 0)), companionEvolutionStageForLevel(reachedLevel));
  world.companionCinematicSeen = hasEvolutionRecord && Array.isArray(raw.companionCinematicSeen) ? [...new Set(raw.companionCinematicSeen.filter(id => validCinematicIds.has(id)))] : legacyLevelAboveCap ? [] : COMPANION_MILESTONES.filter(milestone => milestone.level <= reachedLevel).map(milestone => milestone.id);
  const seenCinematicIds = new Set(world.companionCinematicSeen);
  world.companionCinematicQueue = hasEvolutionRecord && Array.isArray(raw.companionCinematicQueue) ? [...new Set(raw.companionCinematicQueue.filter(id => validCinematicIds.has(id) && !seenCinematicIds.has(id)))].slice(0, COMPANION_MILESTONES.length) : [];
  const unlockedIds = availableAreaIds(world);
  const savedActiveArea = AREA_CATALOG.find(area => area.id === raw.activeAreaId);
  world.activeAreaId = unlockedIds.has(raw.activeAreaId) && areaAccessible(world, savedActiveArea) ? raw.activeAreaId : AREA_CATALOG[0].id;
  world.trailChoicesSeen = Array.isArray(raw.trailChoicesSeen) ? [...new Set(raw.trailChoicesSeen.filter(id => AREA_CATALOG.some(area => area.id === id)))] : unlockedAreas(world).filter(area => areaAccessible(world, area)).map(area => area.id);
  world.activeExpeditionAreaId = unlockedIds.has(raw.activeExpeditionAreaId) ? raw.activeExpeditionAreaId : world.activeAreaId;
  const expeditionXpStart = Number(raw.activeExpeditionXpStart);
  world.activeExpeditionXpStart = Number.isFinite(expeditionXpStart) ? Math.max(0, Math.min(world.xp, Math.floor(expeditionXpStart))) : world.xp;
  if (raw.inventory && typeof raw.inventory === 'object') {
    for (const id of Object.keys(ITEM_CATALOG)) {
      const amount = Number(raw.inventory[id]);
      if (Number.isFinite(amount) && amount > 0) world.inventory[id] = Math.min(MAX_INVENTORY_STACK, Math.floor(amount));
    }
  }
  const savedPity = raw.milestoneDropPity && typeof raw.milestoneDropPity === 'object' && !Array.isArray(raw.milestoneDropPity) ? raw.milestoneDropPity : {};
  world.milestoneDropPity = Object.fromEntries([...MILESTONE_MATERIAL_IDS].map(itemId => {
    const failures = Number(savedPity[itemId]);
    return [itemId, Number.isFinite(failures) ? Math.max(0, Math.min(MILESTONE_DROP_PITY_CONFIG.maxEligibleFailures, Math.floor(failures))) : 0];
  }).filter(([, failures]) => failures > 0));
  world.activeExpeditionPityTargets = Array.isArray(raw.activeExpeditionPityTargets) ? [...new Set(raw.activeExpeditionPityTargets.filter(itemId => MILESTONE_MATERIAL_IDS.has(itemId)))].slice(0, MILESTONE_MATERIAL_IDS.size) : [];
  world.collection = Array.isArray(raw.collection) ? [...new Set(raw.collection.filter(id => Object.hasOwn(ITEM_CATALOG, id)))] : [];
  world.notifications = Array.isArray(raw.notifications) ? raw.notifications.filter(message => typeof message === 'string').slice(0, 20) : [];
  if (legacyLevelAboveCap) {
    if (!world.notifications.includes(LEVEL_CAP_MIGRATION_NOTICE)) world.notifications.unshift(LEVEL_CAP_MIGRATION_NOTICE);
    if (!legacyLevelWarningReported) {
      console.info('[Pocketwild progression migration] A save contained XP beyond Level 60. Its XP and unrelated data were kept; unverified milestones and companion stages were not inferred.');
      legacyLevelWarningReported = true;
    }
  }
  world.marketHistory = Array.isArray(raw.marketHistory) ? raw.marketHistory.filter(entry => entry && typeof entry === 'object' && typeof entry.title === 'string').slice(0, ECONOMY_CONFIG.marketplace.historyLimit).map(entry => ({
    id: typeof entry.id === 'string' ? entry.id.slice(0, 80) : '',
    type: typeof entry.type === 'string' ? entry.type.slice(0, 24) : 'market',
    title: entry.title.slice(0, 100),
    itemId: Object.hasOwn(ITEM_CATALOG, entry.itemId) ? entry.itemId : '',
    quantity: Math.max(0, Math.min(999999, Math.floor(Number(entry.quantity) || 0))),
    gold: Math.max(0, Math.min(ECONOMY_CONFIG.maxBalance, Math.floor(Number(entry.gold) || 0))),
    currency: ['gold', 'stardust'].includes(entry.currency) ? entry.currency : 'gold',
    amount: Math.max(0, Math.min(ECONOMY_CONFIG.maxBalance, Math.floor(Number.isFinite(Number(entry.amount)) ? Number(entry.amount) : Number(entry.gold) || 0))),
    at: Math.max(0, Math.floor(Number(entry.at) || 0))
  })) : [];
  world.phoneUnlocked = Boolean(raw.phoneUnlocked);
  world.exploreInvitationDismissed = Boolean(raw.exploreInvitationDismissed);
  if (world.phoneUnlocked) {
    if (!world.collection.includes('pocketPhone')) world.collection.push('pocketPhone');
    world.inventory.pocketPhone = Math.max(1, world.inventory.pocketPhone || 0);
  }
  const expeditions = Number(raw.expeditions);
  world.expeditions = Number.isFinite(expeditions) ? Math.max(0, Math.floor(expeditions)) : 0;
  world.lastAutoSellExpedition = Math.min(world.expeditions, world.lastAutoSellExpedition);
  const lastPityProcessedExpedition = Number(raw.lastPityProcessedExpedition);
  world.lastPityProcessedExpedition = Number.isFinite(lastPityProcessedExpedition) ? Math.max(0, Math.min(world.expeditions, Math.floor(lastPityProcessedExpedition))) : 0;
  const activeExpedition = Number(raw.activeExpedition);
  world.activeExpedition = Number.isFinite(activeExpedition) ? Math.max(0, Math.floor(activeExpedition)) : 0;
  const revealIndex = Number(raw.revealIndex);
  world.revealIndex = Number.isFinite(revealIndex) ? Math.max(0, Math.floor(revealIndex)) : 0;
  world.activeExpeditionData = sanitizeExpeditionContext(raw.activeExpeditionData, world);
  world.activeExpeditionRewards = Array.isArray(raw.activeExpeditionRewards) ? raw.activeExpeditionRewards.map(sanitizeExpeditionReward).filter(Boolean).slice(0, 8) : [];
  if (raw.lastTrip && typeof raw.lastTrip === 'object') {
    world.lastTrip = {
      xp: Math.max(0, Math.floor(Number(raw.lastTrip.xp) || 0)),
      areaId: AREA_CATALOG.some(area => area.id === raw.lastTrip.areaId) ? raw.lastTrip.areaId : AREA_CATALOG[0].id,
      areaName: typeof raw.lastTrip.areaName === 'string' ? raw.lastTrip.areaName.slice(0, 48) : AREA_CATALOG[0].name,
      finds: Array.isArray(raw.lastTrip.finds) ? raw.lastTrip.finds.filter(name => typeof name === 'string').slice(0, 8) : [],
      items: Array.isArray(raw.lastTrip.items) ? raw.lastTrip.items.filter(item => item && typeof item.name === 'string' && typeof item.emoji === 'string').slice(0, 8).map(item => ({
        name: item.name.slice(0, 48),
        emoji: item.emoji.slice(0, 8),
        quantity: Math.max(1, Math.min(999, Math.floor(Number(item.quantity) || 1))),
        currency: ['gold', 'stardust'].includes(item.currency) ? item.currency : null
      })) : [],
      context: sanitizeExpeditionContext(raw.lastTrip.context, world)
    };
  }
  const recipeIds = Object.keys(RECIPES);
  world.discoveredRecipes = Array.isArray(raw.discoveredRecipes) ? [...new Set(raw.discoveredRecipes.filter(id => recipeIds.includes(id)))] : [];
  world.knownRecipes = Array.isArray(raw.knownRecipes) ? [...new Set(raw.knownRecipes.filter(id => world.discoveredRecipes.includes(id)))] : [];
  world.selectedCraftRecipe = world.knownRecipes.includes(raw.selectedCraftRecipe) ? raw.selectedCraftRecipe : null;
  world.craftedRecipes = Array.isArray(raw.craftedRecipes) ? [...new Set(raw.craftedRecipes.filter(id => recipeIds.includes(id)))] : [];
  world.activePotionBuff = sanitizePotionBuff(raw.activePotionBuff);
  // Old display pins are retained only as inert preferences; nothing reads or renders them.
  world.displayPins = sanitizeLegacyDisplayPins(raw.displayPins);
  const activeRoomTheme = raw.activeRoomTheme;
  const currentLevel = progressionSnapshot(world).level;
  world.ownedRoomThemes = [...new Set(['starter-room', ...(Array.isArray(raw.ownedRoomThemes) ? raw.ownedRoomThemes.filter(id => Object.hasOwn(ROOM_THEMES, id) && currentLevel >= (ROOM_THEMES[id].unlockLevel || 1)) : [])])];
  world.activeRoomTheme = world.ownedRoomThemes.includes(activeRoomTheme) ? activeRoomTheme : 'starter-room';
  const shopSeed = Number(raw.roomShopSeed);
  world.roomShopSeed = Number.isSafeInteger(shopSeed) && shopSeed > 0 && shopSeed <= 2_147_483_647 ? shopSeed : world.roomShopSeed;
  world.roomShopRotation = sanitizeRoomShopRotation(raw.roomShopRotation);
  world.room = sanitizeRoomState(raw.room);
  world.room.themeId = world.activeRoomTheme;
  world.petDialogue = petDialogueManager.sanitizeState(raw.petDialogue);
  world.npcMemory = npcBehaviorManager.sanitizeState(raw.npcMemory);
  world.phoneSection = ['home', 'profile', 'xp', 'talents', 'collection', 'inventory', 'pet', 'room', 'shop', 'notifications', 'crafting', 'social', 'marketplace'].includes(raw.phoneSection) ? raw.phoneSection : 'home';
  return world;
}
function weightedChoice(entries, getWeight = entry => entry.weight ?? 1) {
  const eligible = entries.map(entry => ({
    entry,
    weight: Math.max(0, Number(getWeight(entry)) || 0)
  })).filter(row => row.weight > 0);
  const total = eligible.reduce((sum, row) => sum + row.weight, 0);
  if (!total) return null;
  let roll = Math.random() * total;
  for (const row of eligible) {
    roll -= row.weight;
    if (roll < 0) return row.entry;
  }
  return eligible[eligible.length - 1]?.entry || null;
}
function sanitizeExpeditionContext(raw, world = null) {
  if (!raw || typeof raw !== 'object') return null;
  const area = AREA_CATALOG.find(entry => entry.id === raw.destinationId) || AREA_CATALOG.find(entry => entry.id === raw.areaId);
  if (!area) return null;
  const weatherId = area.weatherIds.includes(raw.weatherId) ? raw.weatherId : area.weatherIds[0];
  const timeId = Object.hasOwn(TIME_DATA, raw.timeId) ? raw.timeId : 'day';
  const eventId = area.eventIds.includes(raw.eventId) ? raw.eventId : null;
  const specialtyId = Object.values(PET_SPECIALTIES).some(specialty => specialty.id === raw.petSpecialtyId) ? raw.petSpecialtyId : null;
  const maxTier = Math.min(RARITY_TIERS.indexOf(area.maxRarity), RARITY_TIERS.indexOf(highestUnlockedRarity(world || {
    completedMilestones: []
  })));
  const savedTier = RARITY_TIERS.indexOf(raw.rarityEligibility);
  const potion = sanitizePotionBuff(raw.potion);
  const seenItems = Array.isArray(raw.discoveryState?.seenItemIds) ? [...new Set(raw.discoveryState.seenItemIds.filter(id => Object.hasOwn(ITEM_CATALOG, id)))].slice(0, 200) : [];
  return {
    playerLevel: Math.max(1, Math.min(LEVEL_CAP, Math.floor(Number(raw.playerLevel) || 1))),
    destinationId: area.id,
    rarityEligibility: RARITY_TIERS[Math.max(0, Math.min(maxTier, savedTier < 0 ? maxTier : savedTier))],
    discoveryState: {
      collectionSize: Math.max(0, Math.floor(Number(raw.discoveryState?.collectionSize) || 0)),
      seenItemIds: seenItems
    },
    petSpecialtyId: specialtyId,
    weatherId,
    timeId,
    potion,
    eventId
  };
}
function sanitizeExpeditionReward(raw) {
  if (!raw || typeof raw !== 'object') return null;
  if (raw.type === 'xp') {
    const amount = Math.max(0, Math.min(100000, Math.floor(Number(raw.amount) || 0)));
    return amount ? {
      type: 'xp',
      amount,
      name: typeof raw.name === 'string' ? raw.name.slice(0, 48) : 'Trail know-how',
      emoji: '✦',
      description: typeof raw.description === 'string' ? raw.description.slice(0, 240) : ''
    } : null;
  }
  if (raw.type === 'currency') {
    const currency = ['gold', 'stardust'].includes(raw.currency) ? raw.currency : null;
    const amount = Math.max(0, Math.min(ECONOMY_CONFIG.maxBalance, Math.floor(Number(raw.amount) || 0)));
    if (!currency || !amount) return null;
    return {
      type: 'currency',
      currency,
      amount,
      name: typeof raw.name === 'string' ? raw.name.slice(0, 48) : `${currency === 'gold' ? 'Pocket Gold' : 'Stardust'}`,
      emoji: currency === 'gold' ? '🪙' : '✧',
      description: typeof raw.description === 'string' ? raw.description.slice(0, 240) : ''
    };
  }
  if (raw.type === 'phone') return {
    type: 'phone',
    name: 'Your very own phone',
    emoji: '✆',
    description: typeof raw.description === 'string' ? raw.description.slice(0, 240) : ''
  };
  const item = ITEM_CATALOG[raw.id];
  if (!item || !['material', 'discovery'].includes(raw.type)) return null;
  return {
    type: raw.type,
    id: item.id,
    name: item.name,
    emoji: item.emoji,
    quantity: Math.max(1, Math.min(99, Math.floor(Number(raw.quantity) || 1))),
    description: typeof raw.description === 'string' ? raw.description.slice(0, 240) : item.description,
    rarity: item.rarity
  };
}
function makeExpeditionContext(areaId, world = state.world) {
  const area = AREA_CATALOG.find(entry => entry.id === areaId) || AREA_CATALOG[0];
  const weather = weightedChoice(area.weatherIds.map(id => WEATHER_DATA[id]), entry => area.weatherWeights[entry.id]);
  const time = weightedChoice(Object.keys(area.timeWeights).map(id => TIME_DATA[id]), entry => area.timeWeights[entry.id]);
  const potionEffect = potionEffectFor(world.activePotionBuff);
  const eventChanceBonus = potionEffect?.type === 'event-chance' ? Math.min(POTION_BALANCE.maxEventChanceBonus, Math.max(0, Number(potionEffect.bonus) || 0)) : 0;
  const returningToLastArea = state.world.lastTrip?.areaId === area.id;
  const talentEventBonus = Math.min(0.08, talentEffectTotal('eventChance') + (returningToLastArea ? talentEffectTotal('repeatEventChance') : 0));
  const event = Math.random() < Math.min(1, area.eventChance + eventChanceBonus + talentEventBonus) ? weightedChoice(area.eventIds.map(id => EVENT_DATA[id])) : null;
  const pet = PETS.find(entry => entry.id === state.petId);
  const specialty = pet ? PET_SPECIALTIES[pet.id] : null;
  const tierLimit = Math.min(RARITY_TIERS.indexOf(area.maxRarity), RARITY_TIERS.indexOf(highestUnlockedRarity(world)));
  return {
    playerLevel: progressionSnapshot(world).rawLevel,
    destinationId: area.id,
    rarityEligibility: RARITY_TIERS[Math.max(0, tierLimit)],
    discoveryState: {
      collectionSize: world.collection.length,
      seenItemIds: [...world.collection]
    },
    petSpecialtyId: specialty?.id || null,
    weatherId: weather?.id || area.weatherIds[0],
    timeId: time?.id || 'day',
    potion: world.activePotionBuff ? {
      ...world.activePotionBuff
    } : null,
    eventId: event?.id || null
  };
}
function expeditionTags(context) {
  const tags = new Set([WEATHER_DATA[context.weatherId]?.tag, TIME_DATA[context.timeId]?.tag].filter(Boolean));
  if (context.eventId) tags.add(`event:${context.eventId}`);
  return tags;
}
function rollExpeditionItem(context, excludedIds = new Set()) {
  const area = AREA_CATALOG.find(entry => entry.id === context.destinationId) || AREA_CATALOG[0];
  const tierLimit = Math.min(RARITY_TIERS.indexOf(area.maxRarity), RARITY_TIERS.indexOf(context.rarityEligibility));
  const tags = expeditionTags(context);
  const distribution = RARITY_DISTRIBUTIONS[RARITY_TIERS[tierLimit]] || RARITY_DISTRIBUTIONS.Common;
  const specialty = Object.values(PET_SPECIALTIES).find(entry => entry.id === context.petSpecialtyId);
  const petSpecialtyBonus = Math.min(0.1, Math.max(0, Number(specialty?.bonus) || 0) + talentEffectTotal('petSpecialtyBonus'));
  const returningToLastArea = state.world.lastTrip?.areaId === area.id;
  const newFindWeightBonus = Math.min(0.12, talentEffectTotal('newFindWeight') + (returningToLastArea ? talentEffectTotal('repeatFindWeight') : 0));
  const commonMaterialWeightBonus = Math.min(0.06, talentEffectTotal('commonMaterialWeight'));
  const potionEffect = potionEffectFor(context.potion);
  const rareWeightBonus = potionEffect?.type === 'rare-discovery-weight' ? Math.min(POTION_BALANCE.maxRareWeightBonus, Math.max(0, Number(potionEffect.bonus) || 0)) : 0;
  const event = context.eventId ? EVENT_DATA[context.eventId] : null;
  const candidatesByTier = new Map();
  for (const poolEntry of area.itemPool) {
    const item = ITEM_CATALOG[poolEntry.itemId];
    if (!item || excludedIds.has(item.id) || poolEntry.requiredTags.some(tag => !tags.has(tag))) continue;
    if ((item.category === 'Creatures' || item.artifact) && context.discoveryState.seenItemIds.includes(item.id)) continue;
    const itemTier = RARITY_TIERS.indexOf(item.rarity);
    if (itemTier < 0 || itemTier > tierLimit) continue;
    const bucket = candidatesByTier.get(item.rarity) || [];
    let baseItemWeight = poolEntry.weight;
    if (poolEntry.matchTags.some(tag => tags.has(tag))) baseItemWeight *= 1.35;
    if (item.rarity === 'Common' && ['Materials', 'Fungi'].includes(item.category) && !MILESTONE_MATERIAL_IDS.has(item.id)) baseItemWeight *= 1 + commonMaterialWeightBonus;
    const isNewNonMilestoneFind = !context.discoveryState.seenItemIds.includes(item.id) && !MILESTONE_MATERIAL_IDS.has(item.id);
    if (isNewNonMilestoneFind && newFindWeightBonus) baseItemWeight *= 1 + newFindWeightBonus;
    if (event) {
      for (const tag of poolEntry.matchTags) baseItemWeight *= event.tagBoosts[tag] || 1;
    }
    if (specialty?.effect === 'new-discovery' && isNewNonMilestoneFind) baseItemWeight *= 1 + petSpecialtyBonus;
    if (specialty?.effect === 'night-find' && context.timeId === 'night' && poolEntry.matchTags.includes('time:night')) baseItemWeight *= 1 + petSpecialtyBonus;
    const failures = Math.max(0, Math.floor(Number(state.world.milestoneDropPity?.[item.id]) || 0));
    const pityMultiplier = MILESTONE_MATERIAL_IDS.has(item.id) && milestoneMaterialNeed(item.id) > 0 ? Math.min(MILESTONE_DROP_PITY_CONFIG.maxMultiplier, 1 + failures * MILESTONE_DROP_PITY_CONFIG.multiplierPerEligibleFailure) : 1;
    bucket.push({
      item,
      weight: baseItemWeight * pityMultiplier,
      baseItemWeight,
      pityMultiplier
    });
    candidatesByTier.set(item.rarity, bucket);
  }
  const tierRows = Object.entries(distribution).map(([rarity, baseWeight]) => {
    const itemRows = candidatesByTier.get(rarity) || [];
    const isRareTier = RARITY_TIERS.indexOf(rarity) >= RARITY_TIERS.indexOf('Rare');
    const petMultiplier = specialty?.effect === 'rare-find' && isRareTier ? 1 + petSpecialtyBonus : 1;
    const potionMultiplier = isRareTier ? 1 + rareWeightBonus : 1;
    const baseItemWeight = itemRows.reduce((sum, row) => sum + row.baseItemWeight, 0);
    const pityBonusWeight = itemRows.reduce((sum, row) => sum + row.baseItemWeight * (row.pityMultiplier - 1), 0);
    const pityTierMultiplier = baseItemWeight > 0 ? 1 + pityBonusWeight / baseItemWeight : 1;
    return {
      rarity,
      itemRows,
      weight: itemRows.length ? baseWeight * petMultiplier * potionMultiplier * pityTierMultiplier : 0
    };
  });
  const selectedTier = weightedChoice(tierRows);
  if (!selectedTier) return null;
  const selected = weightedChoice(selectedTier.itemRows);
  if (!selected) return null;
  const isPermanentDiscovery = selected.item.category === 'Creatures' || Boolean(selected.item.artifact);
  const quantity = !isPermanentDiscovery && specialty?.effect === 'extra-material' && Math.random() < petSpecialtyBonus ? 2 : 1;
  return {
    type: isPermanentDiscovery ? 'discovery' : 'material',
    id: selected.item.id,
    name: selected.item.name,
    emoji: selected.item.emoji,
    quantity,
    rarity: selected.item.rarity,
    description: `${selected.item.description} Your explorer noticed it in ${area.shortName}.`
  };
}
function applyWildsoulGatherBonus(rewards, context) {
  const chance = Math.min(0.12, talentEffectTotal('extraCommonChance'));
  if (!chance || Math.random() >= chance) return;
  const area = AREA_CATALOG.find(entry => entry.id === context.destinationId);
  if (!area) return;
  const tags = expeditionTags(context);
  const eligible = area.itemPool.flatMap(entry => {
    const item = ITEM_CATALOG[entry.itemId];
    if (!item || item.rarity !== 'Common' || !['Materials', 'Fungi'].includes(item.category) || RARITY_TIERS.indexOf(item.rarity) > RARITY_TIERS.indexOf(context.rarityEligibility) || entry.requiredTags.some(tag => !tags.has(tag))) return [];
    return [{
      item,
      weight: Math.max(0, Number(entry.weight) || 0)
    }];
  });
  const selected = weightedChoice(eligible);
  if (!selected) return;
  const existing = rewards.find(reward => reward.type === 'material' && reward.id === selected.item.id);
  if (existing && existing.quantity < 99) {
    existing.quantity += 1;
    return;
  }
  rewards.push({
    type: 'material',
    id: selected.item.id,
    name: selected.item.name,
    emoji: selected.item.emoji,
    quantity: 1,
    rarity: selected.item.rarity,
    description: `${selected.item.description} A little extra turned up on the trail.`
  });
}
function generateExpeditionRewards(number, context) {
  const area = AREA_CATALOG.find(entry => entry.id === context.destinationId) || AREA_CATALOG[0];
  let rewards = [];
  if (area.id === 'meadow' && number === 1) {
    rewards = EXPEDITION_REWARDS.first.map(sanitizeExpeditionReward).filter(Boolean);
  } else if (area.id === 'meadow' && number === 2) {
    rewards = EXPEDITION_REWARDS.second.map(sanitizeExpeditionReward).filter(Boolean);
  } else {
    const excluded = new Set();
    const introAmberAcorn = area.id === 'amberfall-woods' && !context.discoveryState.seenItemIds.includes('amberAcornArtifact');
    if (introAmberAcorn) {
      const acorn = ITEM_CATALOG.amberAcornArtifact;
      rewards.push({
        type: 'discovery',
        id: acorn.id,
        name: acorn.name,
        emoji: acorn.emoji,
        quantity: 1,
        rarity: acorn.rarity,
        description: `${acorn.description} Your first Amberfall outing begins with a tiny keepsake from the forest.`
      });
      excluded.add(acorn.id);
    }
    const itemRollCount = introAmberAcorn ? 1 : 2;
    for (let index = 0; index < itemRollCount; index++) {
      const reward = rollExpeditionItem(context, excluded);
      if (!reward) continue;
      rewards.push(reward);
      excluded.add(reward.id);
    }
    const event = context.eventId ? EVENT_DATA[context.eventId] : null;
    const xpAmount = area.expeditionXp + (event?.xpBonus || 0);
    rewards.push({
      type: 'xp',
      amount: xpAmount,
      name: 'Trail know-how',
      emoji: '✦',
      description: `Every outing in ${area.shortName} teaches you a little more${event ? ` · ${event.label.toLowerCase()} added a small lesson` : ''}.`
    });
  }
  const effect = potionEffectFor(context.potion);
  if (effect?.type === 'gather-extra' && Math.random() < Math.min(POTION_BALANCE.maxGatherChance, Math.max(0, Number(effect.chance) || 0))) {
    const gathered = rewards.filter(reward => reward.type === 'material');
    const stack = gathered.length ? gathered[Math.floor(Math.random() * gathered.length)] : null;
    const extra = Math.min(POTION_BALANCE.maxGatherExtraAmount, Math.max(1, Math.floor(Number(effect.amount) || 1)));
    if (stack) stack.quantity = Math.min(99, stack.quantity + extra);
  }
  if (effect?.type === 'bonus-gold-chance' && Math.random() < Math.min(POTION_BALANCE.maxChance, Math.max(0, Number(effect.chance) || 0))) {
    rewards.push({
      type: 'currency',
      currency: 'gold',
      amount: Math.min(POTION_BALANCE.maxGoldBonusPerAction, Math.max(1, Math.floor(Number(effect.amount) || 1))),
      name: 'A lucky Gold glint',
      emoji: '🪙',
      description: 'Fortune smiled on this outing.'
    });
  }
  if (effect?.type === 'stardust-chance' && Math.random() < Math.min(POTION_BALANCE.maxChance, Math.max(0, Number(effect.chance) || 0))) {
    rewards.push({
      type: 'currency',
      currency: 'stardust',
      amount: Math.min(POTION_BALANCE.maxStardustBonusPerAction, Math.max(1, Math.floor(Number(effect.amount) || 1))),
      name: 'A wisp of Stardust',
      emoji: '✧',
      description: 'A little extra Stardust shimmered home with you.'
    });
  }
  applyWildsoulGatherBonus(rewards, context);
  return rewards.map(sanitizeExpeditionReward).filter(Boolean);
}
function expeditionRewards(number, areaId = state.world.activeExpeditionAreaId || state.world.activeAreaId) {
  if (state.world.activeExpeditionRewards.length) return state.world.activeExpeditionRewards;
  const context = state.world.activeExpeditionData || makeExpeditionContext(areaId);
  state.world.activeExpeditionData = context;
  state.world.activeExpeditionRewards = generateExpeditionRewards(number, context);
  return state.world.activeExpeditionRewards;
}
const SOUND_SETTINGS_KEY = 'pocketwild-audio-settings-v1';
function readSoundSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(SOUND_SETTINGS_KEY) || 'null');
    const volume = Number(saved?.volume);
    return {
      volume: Number.isFinite(volume) ? Math.max(0, Math.min(1, volume)) : 1,
      muted: Boolean(saved?.muted)
    };
  } catch {
    return {
      volume: 1,
      muted: false
    };
  }
}
function saveSoundSettings() {
  try {
    localStorage.setItem(SOUND_SETTINGS_KEY, JSON.stringify({
      volume: sound.volume,
      muted: sound.muted
    }));
  } catch {
    // Sound remains adjustable for this session if storage is unavailable.
  }
}
const sound = {
  ...readSoundSettings(),
  unlocked: false,
  controlsOpen: false
};
const MUSIC_TRACK_PATHS = ['assets/audio/cozy-theme.mp3', 'assets/audio/windowlight-lofi.mp3', 'assets/audio/mossy-afternoon-lofi.mp3'];
const musicPlayers = MUSIC_TRACK_PATHS.map(src => {
  const player = new Audio(src);
  player.loop = false;
  player.preload = 'auto';
  return player;
});
const MUSIC_GAIN = 0.32;
const MUSIC_CROSSFADE_MS = 2400;
const PET_SOUND_GAIN = 0.1;
const PET_SOUND_COOLDOWN_MS = 450;
let music = musicPlayers[0];
let queuedMusicTrack = null;
let musicFadeStartedAt = 0;
let musicFadeDurationMs = MUSIC_CROSSFADE_MS;
let musicFadeTimer = 0;
let musicPlayersPrimed = false;
const arrivalSound = new Audio('assets/audio/arrive-sparkle.mp3');
const petInteractionSounds = [new Audio('assets/audio/pet-purr-soft.mp3'), new Audio('assets/audio/pet-soft-rustle.mp3'), new Audio('assets/audio/pet-warm-chime.mp3')];
let lastPetSoundAt = -Infinity;
let lastPetSoundIndex = -1;
function chooseNextMusicTrack() {
  const choices = musicPlayers.filter(player => player !== music);
  return choices[Math.floor(Math.random() * choices.length)] || music;
}
function finishMusicCrossfade() {
  if (musicFadeTimer) window.clearInterval(musicFadeTimer);
  musicFadeTimer = 0;
  const previousTrack = music;
  music = queuedMusicTrack;
  queuedMusicTrack = null;
  previousTrack.pause();
  previousTrack.currentTime = 0;
  previousTrack.volume = 0;
  music.volume = Math.max(0, Math.min(1, MUSIC_GAIN * sound.volume));
}
function updateMusicCrossfade() {
  if (!queuedMusicTrack) return;
  const progress = Math.max(0, Math.min(1, (performance.now() - musicFadeStartedAt) / musicFadeDurationMs));
  const gain = Math.max(0, Math.min(1, MUSIC_GAIN * sound.volume));
  music.volume = gain * (1 - progress);
  queuedMusicTrack.volume = gain * progress;
  if (progress >= 1) finishMusicCrossfade();
}
function beginMusicCrossfade(nextTrack, {
  duration = MUSIC_CROSSFADE_MS,
  outgoingEnded = false
} = {}) {
  if (!nextTrack || nextTrack === music || queuedMusicTrack || sound.muted || !sound.unlocked) return false;
  const outgoingTrack = music;
  queuedMusicTrack = nextTrack;
  musicFadeStartedAt = performance.now();
  musicFadeDurationMs = Math.max(100, duration);
  nextTrack.pause();
  nextTrack.currentTime = 0;
  nextTrack.volume = 0;
  if (outgoingEnded) outgoingTrack.volume = 0;
  const playback = nextTrack.play();
  if (playback && typeof playback.catch === 'function') {
    playback.catch(() => {
      if (queuedMusicTrack !== nextTrack) return;
      if (musicFadeTimer) window.clearInterval(musicFadeTimer);
      musicFadeTimer = 0;
      queuedMusicTrack = null;
      nextTrack.pause();
      nextTrack.volume = 0;
      outgoingTrack.volume = outgoingEnded ? 0 : Math.max(0, Math.min(1, MUSIC_GAIN * sound.volume));
    });
  }
  musicFadeTimer = window.setInterval(updateMusicCrossfade, 40);
  updateMusicCrossfade();
  return true;
}
function pauseMusic() {
  if (musicFadeTimer) window.clearInterval(musicFadeTimer);
  musicFadeTimer = 0;
  if (queuedMusicTrack) {
    queuedMusicTrack.pause();
    queuedMusicTrack.currentTime = 0;
    queuedMusicTrack.volume = 0;
    queuedMusicTrack = null;
  }
  for (const player of musicPlayers) {
    player.pause();
    if (player !== music) player.volume = 0;
  }
}
function primeMusicPlayers() {
  if (musicPlayersPrimed) return;
  musicPlayersPrimed = true;
  for (const player of musicPlayers) {
    if (player === music) continue;
    player.volume = 0;
    const playback = player.play();
    if (playback && typeof playback.then === 'function') {
      playback.then(() => {
        if (player === music || player === queuedMusicTrack) return;
        player.pause();
        player.currentTime = 0;
        player.volume = 0;
      }).catch(() => {});
    }
  }
}
function applySoundVolume() {
  const volume = Math.max(0, Math.min(1, sound.volume));
  const musicGain = Math.max(0, Math.min(1, MUSIC_GAIN * volume));
  arrivalSound.volume = volume;
  for (const audio of petInteractionSounds) {
    audio.volume = Math.max(0, Math.min(1, PET_SOUND_GAIN * volume));
  }
  if (queuedMusicTrack && musicFadeTimer) {
    updateMusicCrossfade();
  } else {
    music.volume = musicGain;
    for (const player of musicPlayers) {
      if (player !== music) player.volume = 0;
    }
  }
}
for (const player of musicPlayers) {
  player.addEventListener('timeupdate', () => {
    if (player !== music || queuedMusicTrack || !Number.isFinite(player.duration)) return;
    if (player.duration - player.currentTime <= MUSIC_CROSSFADE_MS / 1000 + 0.25) {
      beginMusicCrossfade(chooseNextMusicTrack());
    }
  });
  player.addEventListener('ended', () => {
    if (player === music && !queuedMusicTrack) {
      beginMusicCrossfade(chooseNextMusicTrack(), {
        duration: 700,
        outgoingEnded: true
      });
    }
  });
}
applySoundVolume();
function loadImage(src) {
  const image = new Image();
  image.decoding = 'async';
  image.src = src;
  return image;
}
const defaultAvatar = () => Object.fromEntries(Object.entries(AVATAR_OPTIONS).map(([key]) => [key, 0]));
function validAvatar(candidate) {
  const avatar = defaultAvatar();
  if (!candidate || typeof candidate !== 'object') return avatar;
  for (const [key, options] of Object.entries(AVATAR_OPTIONS)) {
    const value = Number(candidate[key]);
    avatar[key] = Number.isInteger(value) ? (value % options.length + options.length) % options.length : 0;
  }
  return avatar;
}
function normalizePlayerNameDraft(value) {
  let name = String(value ?? '');
  try {
    name = name.normalize('NFC');
  } catch {/* Keep the entered name if normalization is unavailable. */}
  name = name.replace(/[\u0000-\u001f\u007f-\u009f]/g, '').replace(/\s+/g, ' ').trim();
  return Array.from(name).slice(0, 16).join('');
}
function sanitizePlayerName(value) {
  const result = validateUserText(normalizePlayerNameDraft(value), 'PLAYER_NAME');
  return result.allowed ? result.text : '';
}
function legacyOpeningWasCompleted(data) {
  if (typeof data.hasCompletedOpening === 'boolean') return data.hasCompletedOpening;
  const world = data.world && typeof data.world === 'object' ? data.world : {};
  const hasPet = PETS.some(pet => pet.id === data.petId);
  const hasInventory = world.inventory && typeof world.inventory === 'object' && Object.values(world.inventory).some(quantity => Number(quantity) > 0);
  const establishedProgress = Number(world.xp) > 0 || Number(world.expeditions) > 0 || Array.isArray(world.collection) && world.collection.length > 0 || hasInventory || Boolean(world.phoneUnlocked) || Array.isArray(world.completedMilestones) && world.completedMilestones.length > 0 || Array.isArray(world.badges) && world.badges.length > 0 || ['destination', 'departing', 'meadow', 'returning', 'reward-reveal', 'basecamp', 'phone'].includes(data.stage);
  // Older builds used `completed` once the player reached the Explore invitation.
  // Explicit false always wins, preserving a partially completed new opening.
  return Boolean(data.completed && hasPet || establishedProgress);
}
function sanitizeSaveData(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
  return {
    playerName: sanitizePlayerName(data.playerName),
    displayNameChangedAt: Math.max(0, Math.floor(Number(data.displayNameChangedAt) || 0)),
    avatar: validAvatar(data.avatar),
    petId: PETS.some(pet => pet.id === data.petId) ? data.petId : null,
    stage: typeof data.stage === 'string' ? data.stage : 'creation',
    roomState: data.roomState && typeof data.roomState === 'object' ? data.roomState : {
      revealed: false,
      furniture: 'starter-room'
    },
    world: sanitizeWorldData(data.world),
    hasCompletedOpening: legacyOpeningWasCompleted(data),
    completed: Boolean(data.completed),
    saveVersion: Math.max(1, Math.floor(Number(data.saveVersion) || 1)),
    revision: Math.max(0, Math.floor(Number(data.revision) || 0)),
    lastUpdated: Math.max(0, Math.floor(Number(data.lastUpdated) || 0)),
    lastSynced: Math.max(0, Math.floor(Number(data.lastSynced) || 0)),
    playerId: typeof data.playerId === 'string' ? data.playerId : null
  };
}
function readSave() {
  try {
    return sanitizeSaveData(playerSaveManager.readOfflineSave());
  } catch {
    return null;
  }
}
let save = readSave();
const state = {
  phase: 'title',
  overlay: null,
  cinematic: null,
  objectiveTab: 'daily',
  time: 0,
  lastSystemTickAt: Date.now(),
  playerName: '',
  displayNameChangedAt: Math.max(0, Math.floor(Number(save?.displayNameChangedAt) || 0)),
  profileDialog: '',
  profileDialogReturn: '',
  profileDraft: '',
  pendingDisplayName: '',
  profileCharacterEditing: false,
  profileNotice: '',
  profileFormInvalid: false,
  roomNameDraft: '',
  nameEntryError: '',
  avatar: defaultAvatar(),
  selectedPet: null,
  petId: null,
  hearts: [],
  sparkles: [],
  reactionUntil: 0,
  revealAt: 0,
  windowGlimmer: 0,
  inviteAcknowledged: false,
  roomFeedback: '',
  roomFeedbackUntil: 0,
  world: sanitizeWorldData(save?.world),
  hasCompletedOpening: Boolean(save?.hasCompletedOpening),
  phaseAt: 0,
  selectedCraftIngredients: [],
  selectedCraftRecipe: save?.world?.selectedCraftRecipe || 'meadowglow-tonic',
  milestoneCraftFocusId: null,
  milestoneCraftNotice: '',
  explorationMapOpen: false,
  explorationMapItemId: null,
  craftAnimation: null,
  devSaveNote: '',
  talentPointToast: 0,
  basecampPanelExpanded: false
};
const AUTO_EXPLORE_BUFFER_MS = 5_000;
let autoExploreActive = false;
let autoExploreActionAt = 0;
let autoExploreNextAt = 0;
let objectiveClaimAllBusy = false;
const marketplaceManager = new PocketwildMarketplace({
  getUser: () => playerSaveManager.getStatus().user,
  getCloudReady: () => playerSaveManager.getStatus().cloudReady,
  getItem: itemId => ITEM_CATALOG[itemId] || null,
  flushSave: async () => {
    persist();
    await playerSaveManager.flush();
  },
  onSaveChanged: envelope => adoptMarketplaceSave(envelope),
  getPlayerName: () => state.playerName || 'Wanderer',
  config: null
});
let W = 0;
let H = 0;
const OPENING_PHASES = new Set(['title', 'creation', 'player-name', 'pet-select', 'restart-confirm', 'room-reveal', 'pet-intro', 'window-moment', 'explore']);
const OPENING_TRANSITIONS = Object.freeze({
  title: ['creation', 'restart-confirm'],
  creation: ['player-name'],
  'player-name': ['creation', 'pet-select'],
  'pet-select': ['player-name', 'room-reveal'],
  'room-reveal': ['pet-intro'],
  'pet-intro': ['window-moment'],
  'window-moment': ['explore'],
  explore: ['destination'],
  destination: ['explore', 'departing'],
  'restart-confirm': []
});
const ROOM_SCENE_PHASES = ['room-reveal', 'pet-intro', 'window-moment', 'explore', 'departing', 'returning', 'reward-reveal', 'basecamp', 'phone'];
const NEXT_ARTIFACT_TRACKER_PHASES = new Set(['destination', 'departing', 'meadow', 'returning', 'basecamp']);
function petRenderScale() {
  return ROOM_SCENE_PHASES.includes(state.phase) ? PET_RENDER_SCALE * 0.75 : PET_RENDER_SCALE;
}
function transitionOpening(nextPhase) {
  if (!OPENING_TRANSITIONS[state.phase]?.includes(nextPhase)) return false;
  if (nextPhase === 'pet-select' && !sanitizePlayerName(state.playerName)) return false;
  if (nextPhase === 'room-reveal' && (!sanitizePlayerName(state.playerName) || !PETS.some(pet => pet.id === state.petId))) return false;
  if (['pet-intro', 'window-moment', 'explore', 'destination', 'departing'].includes(nextPhase) && !PETS.some(pet => pet.id === state.petId)) return false;
  state.phase = nextPhase;
  state.phaseAt = state.time;
  return true;
}
function roomCamera() {
  if (!state.cinematic) return {
    zoom: 1,
    offsetX: 0,
    offsetY: 0
  };
  const elapsed = Math.max(0, state.time - state.cinematic.startedAt);
  const inEase = Math.max(0, Math.min(1, elapsed / 0.8));
  const outEase = Math.max(0, Math.min(1, (state.cinematic.duration - elapsed) / 0.8));
  const ease = Math.min(inEase, outEase);
  const zoom = 1 + (state.cinematic.milestone.level === 50 ? 0.1 : 0.055) * ease;
  return {
    zoom,
    offsetX: W * 0.5 * (1 - zoom),
    offsetY: H * 0.5 * (1 - zoom)
  };
}
function roomCameraPoint(x, y, camera = roomCamera()) {
  return {
    x: x * camera.zoom + camera.offsetX,
    y: y * camera.zoom + camera.offsetY
  };
}
function resize() {
  const viewport = window.visualViewport;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  W = viewport?.width || window.innerWidth;
  H = viewport?.height || window.innerHeight;
  container.style.setProperty('--visible-width', `${W}px`);
  container.style.setProperty('--visible-height', `${H}px`);
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  canvas.style.width = `${W}px`;
  canvas.style.height = `${H}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = false;
  positionAutoExploreBanner();
}
window.addEventListener('resize', resize);
window.visualViewport?.addEventListener('resize', resize);
resize();
function currentPet() {
  return PETS.find(pet => pet.id === state.petId) || null;
}
function cloverPresence(now = Date.now()) {
  return npcBehaviorManager.presence(state.world, 'clover', {
    playerName: state.playerName,
    now
  });
}
function rememberCloverEvent(type, payload = {}, now = Date.now()) {
  return npcBehaviorManager.rememberWorldEvent(state.world, 'clover', type, payload, now);
}
function petDialogueContext() {
  const hour = new Date().getHours();
  const activePlayPhase = state.phase === 'basecamp' || state.phase === 'phone';
  return {
    petId: state.petId,
    level: progressionSnapshot().level,
    timeOfDay: hour >= 19 || hour < 6 ? 'night' : hour >= 17 ? 'dusk' : 'day',
    unlockedZones: unlockedAreas(state.world).filter(area => areaAccessible(state.world, area)).map(area => area.id),
    systems: {
      exploration: state.world.expeditions > 0 || ['destination', 'meadow', 'departing', 'returning', 'reward-reveal', 'basecamp'].includes(state.phase),
      crafting: state.world.phoneUnlocked && state.world.discoveredRecipes.length > 0,
      potions: state.world.phoneUnlocked && state.world.discoveredRecipes.some(recipeId => RECIPES[recipeId]?.category),
      inventory: state.world.phoneUnlocked,
      collection: state.world.collection.length > 0 || hasMasterCollectorBadge(state.world),
      room: state.world.phoneUnlocked,
      marketplace: state.world.phoneUnlocked && Boolean(playerSaveManager.getStatus().user)
    },
    allowAmbient: activePlayPhase && !state.overlay && !state.world.pendingOfflineReward && !(state.phase === 'phone' && state.world.phoneSection === 'crafting')
  };
}
function triggerPetDialogue(type, payload = {}) {
  return petDialogueManager.trigger(state.world, type, payload, petDialogueContext(), Date.now());
}
function evaluateCraftingHint(recipeId = state.selectedCraftRecipe) {
  if (state.phase !== 'phone' || state.world.phoneSection !== 'crafting' || !state.world.phoneUnlocked) return false;
  const recipe = RECIPES[recipeId];
  if (!recipe || !state.world.discoveredRecipes.includes(recipeId) || !state.world.knownRecipes.includes(recipeId)) return false;
  const missing = recipe.ingredients.find(ingredient => (state.world.inventory[ingredient.itemId] || 0) < ingredient.quantity);
  if (missing) {
    const item = ITEM_CATALOG[missing.itemId];
    const sourceArea = eligibleMaterialSourceAreas(missing.itemId)[0];
    if (!item || !sourceArea) return false;
    return triggerPetDialogue('craftBlocked', {
      reason: 'missing-material',
      recipeId,
      itemId: item.id,
      itemName: item.name,
      zoneName: sourceArea.shortName || sourceArea.name
    });
  }
  const goldCost = ECONOMY_CONFIG.commonCraftingGoldCosts[recipeId] || 0;
  if (goldCost > currencyBalance('gold')) {
    return triggerPetDialogue('craftBlocked', {
      reason: 'insufficient-gold',
      recipeId,
      itemId: recipe.output.itemId
    });
  }
  return false;
}
function refreshTickets() {
  return ticketManager.refresh(state.world, Date.now());
}
function offlineMaterialCandidates() {
  const candidates = new Set();
  for (const area of unlockedAreas(state.world).filter(entry => areaAccessible(state.world, entry))) {
    for (const poolEntry of area.itemPool) {
      if (poolEntry.requiredTags.length) continue;
      const item = ITEM_CATALOG[poolEntry.itemId];
      if (item?.rarity === 'Common' && ['Materials', 'Fungi'].includes(item.category) && state.world.collection.includes(item.id)) {
        candidates.add(item.id);
      }
    }
  }
  return [...candidates];
}
function collectOfflineWelcome(now = Date.now()) {
  const reward = offlineRewardManager.collect(state.world, offlineMaterialCandidates(), now);
  if (!reward) return false;
  reward.items = reward.items.filter(entry => {
    const item = ITEM_CATALOG[entry.id];
    return item?.rarity === 'Common' && ['Materials', 'Fungi'].includes(item.category) && state.world.collection.includes(item.id);
  });
  const offlineProgress = progressionSnapshot();
  const xpBeforeNextLevel = offlineProgress.xpCapped ? 0 : Math.max(0, offlineProgress.remaining - 1);
  reward.xp = Math.min(reward.xp, xpBeforeNextLevel);
  state.world.pendingOfflineReward = offlineRewardManager.sanitize(reward);
  if (!state.world.pendingOfflineReward) return false;
  for (const entry of state.world.pendingOfflineReward.items) changeInventoryQuantity(entry.id, entry.quantity);
  awardXp(state.world.pendingOfflineReward.xp, 'welcome-back find');
  const petName = currentPet()?.name || 'Your companion';
  addNotification(`${petName} found a few little things while you were away.`);
  return true;
}
function persist() {
  // Title and restart-confirm are temporary menus. Never replace a saved
  // tutorial/gameplay checkpoint with either menu during pagehide or autosave.
  if (state.phase === 'title' || state.phase === 'restart-confirm') return save;
  if (!state.petId && state.phase !== 'creation' && state.phase !== 'player-name' && state.phase !== 'pet-select') return null;
  const now = Date.now();
  refreshTickets();
  if (state.petId && !OPENING_PHASES.has(state.phase)) objectiveManager.refresh(state.world, objectiveContext(), now);
  state.world.lastActiveAt = now;
  save = playerSaveManager.persistLocal({
    playerName: state.playerName,
    displayNameChangedAt: state.displayNameChangedAt,
    avatar: {
      ...state.avatar
    },
    petId: ['player-name', 'pet-select'].includes(state.phase) ? state.selectedPet : state.petId,
    stage: state.phase,
    roomState: {
      revealed: ['pet-intro', 'window-moment', 'explore', 'destination', 'departing', 'meadow', 'returning', 'reward-reveal', 'basecamp', 'phone'].includes(state.phase),
      themeId: state.world.room.themeId,
      wallStyle: state.world.room.wallStyle,
      floorStyle: state.world.room.floorStyle,
      name: state.world.room.name,
      furniture: [...state.world.room.furniture],
      slotAssignments: {
        ...state.world.room.slotAssignments
      },
      favorites: [...state.world.room.favorites],
      unlocks: [...state.world.room.unlocks]
    },
    world: sanitizeWorldData(state.world),
    hasCompletedOpening: Boolean(state.hasCompletedOpening),
    completed: ['explore', 'destination', 'departing', 'meadow', 'returning', 'reward-reveal', 'basecamp', 'phone'].includes(state.phase)
  });
  if (state.petId && socialManager.preferences().discoverable) socialManager.publishProfile(publicPlayerProfile());
  return save;
}
function enterNewGame() {
  save = null;
  state.talentPointToast = 0;
  state.basecampPanelExpanded = false;
  state.playerName = '';
  state.displayNameChangedAt = 0;
  state.profileDialog = '';
  state.profileDialogReturn = '';
  state.profileDraft = '';
  state.pendingDisplayName = '';
  state.profileCharacterEditing = false;
  state.profileNotice = '';
  state.profileFormInvalid = false;
  state.avatar = defaultAvatar();
  state.selectedPet = null;
  state.petId = null;
  state.hasCompletedOpening = false;
  state.world = freshWorldData();
  state.phaseAt = state.time;
  state.revealAt = state.time;
  state.inviteAcknowledged = false;
  state.overlay = null;
  state.roomFeedback = '';
  state.roomFeedbackUntil = 0;
  state.hearts.length = 0;
  state.sparkles.length = 0;
  sound.controlsOpen = false;
  state.phase = 'creation';
  persist();
  renderUI();
}
function recoverSavedPhase(saved, world) {
  const savedPhase = saved?.stage || (saved?.petId ? 'room-reveal' : 'creation');
  const hasPet = PETS.some(pet => pet.id === saved?.petId);
  const hasName = Boolean(sanitizePlayerName(saved?.playerName));
  const inFlightStage = ['departing', 'meadow', 'returning', 'reward-reveal'].includes(savedPhase);
  if (hasPet && (world.activeExpedition > 0 || inFlightStage && world.expeditions > 0)) return 'reward-reveal';
  if (saved?.hasCompletedOpening && hasPet) {
    if (savedPhase === 'phone' && world.phoneUnlocked) return 'phone';
    if (savedPhase === 'destination') return 'destination';
    return 'basecamp';
  }
  if (!hasPet) {
    if (savedPhase === 'creation') return 'creation';
    if (savedPhase === 'player-name') return 'player-name';
    if (savedPhase === 'pet-select' && hasName) return 'pet-select';
    return hasName ? 'pet-select' : 'creation';
  }
  if (savedPhase === 'creation') return 'creation';
  if (savedPhase === 'player-name') return 'player-name';
  if (savedPhase === 'pet-select') return hasName ? 'pet-select' : 'player-name';
  if (savedPhase === 'room-reveal') return saved.roomState?.revealed ? 'pet-intro' : 'room-reveal';
  if (['pet-intro', 'window-moment', 'explore', 'destination'].includes(savedPhase)) return savedPhase;
  if (savedPhase === 'phone') return world.phoneUnlocked ? 'phone' : 'basecamp';
  if (savedPhase === 'basecamp') return world.expeditions > 0 ? 'basecamp' : 'explore';
  if (inFlightStage) return world.expeditions > 0 ? 'basecamp' : saved.completed ? 'explore' : 'pet-intro';
  if (savedPhase === 'title' || savedPhase === 'restart-confirm') {
    if (world.expeditions > 0) return 'basecamp';
    if (saved.completed || world.exploreInvitationDismissed) return 'explore';
    if (saved.roomState?.revealed) return 'pet-intro';
    return hasName ? 'pet-select' : 'player-name';
  }
  if (world.expeditions > 0) return 'basecamp';
  return saved.completed ? 'explore' : saved.roomState?.revealed ? 'pet-intro' : 'pet-select';
}
function resumeGame({
  preserveOverlay = false,
  persistState = true,
  render = true
} = {}) {
  if (!save) {
    enterNewGame();
    return;
  }
  const previousOverlay = state.overlay;
  state.talentPointToast = 0;
  state.playerName = sanitizePlayerName(save.playerName);
  state.displayNameChangedAt = Math.max(0, Math.floor(Number(save.displayNameChangedAt) || 0));
  state.avatar = validAvatar(save.avatar);
  const savedPetId = PETS.some(pet => pet.id === save.petId) ? save.petId : null;
  state.selectedPet = savedPetId;
  state.hasCompletedOpening = Boolean(save.hasCompletedOpening);
  state.world = sanitizeWorldData(save.world);
  state.phase = recoverSavedPhase(save, state.world);
  const selectionPhase = ['creation', 'player-name', 'pet-select'].includes(state.phase);
  state.petId = selectionPhase ? null : savedPetId;
  if (state.petId && !state.playerName) state.playerName = 'Wanderer';
  const inFlightStage = ['departing', 'meadow', 'returning', 'reward-reveal'].includes(save.stage);
  const hasPendingExpedition = Boolean(state.petId && (state.world.activeExpedition > 0 || inFlightStage && state.world.expeditions > 0));
  if (hasPendingExpedition) {
    state.world.expeditions = Math.max(1, state.world.expeditions, state.world.activeExpedition);
    state.world.activeExpedition = Math.max(1, state.world.activeExpedition || state.world.expeditions);
    const savedAreaId = state.world.activeExpeditionData?.destinationId || state.world.activeExpeditionAreaId || state.world.activeAreaId;
    const savedArea = AREA_CATALOG.find(area => area.id === savedAreaId) || AREA_CATALOG[0];
    state.world.activeExpeditionAreaId = savedArea.id;
    state.world.activeExpeditionData ||= makeExpeditionContext(savedArea.id);
    state.world.activeExpeditionRewards = state.world.activeExpeditionRewards.length ? state.world.activeExpeditionRewards : generateExpeditionRewards(state.world.activeExpedition, state.world.activeExpeditionData);
    state.phase = 'reward-reveal';
  } else if (state.world.activeExpedition > 0) {
    state.world.activeExpedition = 0;
    state.world.activeExpeditionAreaId = null;
    state.world.activeExpeditionData = null;
    state.world.activeExpeditionRewards = [];
    state.world.revealIndex = 0;
  }
  state.overlay = preserveOverlay ? previousOverlay : null;
  state.world.pendingOfflineReward = null;
  sound.controlsOpen = false;
  state.hearts.length = 0;
  state.sparkles.length = 0;
  state.reactionUntil = 0;
  state.phaseAt = state.time;
  state.revealAt = state.time;
  if (state.phase === 'reward-reveal' && state.world.activeExpeditionRewards.length && state.world.revealIndex >= state.world.activeExpeditionRewards.length) {
    finishExpedition(state.world.activeExpeditionRewards, state.world.activeExpeditionRewards.length);
    return;
  }
  if (persistState) persist();
  if (render) renderUI();
}
function unlockSound() {
  if (sound.unlocked) return;
  sound.unlocked = true;
  if (!sound.muted) {
    const playback = music.play();
    if (playback && typeof playback.catch === 'function') playback.catch(() => {});
    primeMusicPlayers();
  }
}
function playSound(audio) {
  if (sound.muted || sound.volume <= 0) return;
  audio.currentTime = 0;
  audio.play().catch(() => {});
}
function playPetInteractionSound() {
  if (sound.muted || sound.volume <= 0 || !sound.unlocked) return;
  const now = performance.now();
  if (now - lastPetSoundAt < PET_SOUND_COOLDOWN_MS || petInteractionSounds.some(audio => !audio.paused && !audio.ended)) return;
  const options = petInteractionSounds.map((audio, index) => ({
    audio,
    index
  })).filter(entry => entry.index !== lastPetSoundIndex);
  const selected = options[Math.floor(Math.random() * options.length)];
  if (!selected) return;
  selected.audio.currentTime = 0;
  selected.audio.volume = Math.max(0, Math.min(1, PET_SOUND_GAIN * sound.volume));
  lastPetSoundAt = now;
  lastPetSoundIndex = selected.index;
  selected.audio.play().catch(() => {});
}
function updateSoundControls() {
  const silent = sound.muted || sound.volume <= 0;
  const button = ui.querySelector('[data-action="sound"]');
  if (button) {
    button.innerHTML = `${silent ? '♪×' : '♪'}<span>sound</span>`;
    button.setAttribute('aria-label', `Sound settings · ${Math.round(sound.volume * 100)}% volume`);
  }
  const muteButton = ui.querySelector('[data-action="toggle-sound"]');
  if (muteButton) {
    muteButton.textContent = sound.muted ? 'Sound off' : 'Sound on';
    muteButton.setAttribute('aria-pressed', String(sound.muted));
  }
  const output = ui.querySelector('#game-volume-value');
  if (output) output.textContent = `${Math.round(sound.volume * 100)}%`;
  const slider = ui.querySelector('[data-audio-volume]');
  if (slider) slider.setAttribute('aria-valuetext', `${Math.round(sound.volume * 100)} percent`);
}
function setSoundVolume(value) {
  const volume = Number(value);
  if (!Number.isFinite(volume)) return;
  sound.volume = Math.max(0, Math.min(1, volume / 100));
  applySoundVolume();
  saveSoundSettings();
  updateSoundControls();
}
function toggleSound() {
  sound.muted = !sound.muted;
  saveSoundSettings();
  if (sound.muted) {
    pauseMusic();
  } else {
    unlockSound();
    primeMusicPlayers();
    if (music.paused) music.play().catch(() => {});
  }
  renderUI();
}
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => `&#${character.charCodeAt(0)};`);
}
function soundButton() {
  const silent = sound.muted || sound.volume <= 0;
  const controls = sound.controlsOpen ? `<div class="sound-panel" id="game-sound-panel" role="group" aria-label="Game sound controls"><div class="sound-panel-heading"><strong>Little sounds</strong><button class="sound-mute-button" type="button" data-action="toggle-sound" aria-pressed="${sound.muted}">${sound.muted ? 'Sound off' : 'Sound on'}</button><button class="phone-close" type="button" data-action="close-sound" aria-label="Close sound settings">×</button></div><label class="sound-volume-label" for="game-volume"><span>Volume</span><output id="game-volume-value">${Math.round(sound.volume * 100)}%</output></label><input class="sound-volume-control" id="game-volume" data-audio-volume type="range" min="0" max="100" step="1" value="${Math.round(sound.volume * 100)}" aria-label="Game sound volume" aria-valuetext="${Math.round(sound.volume * 100)} percent" /></div>` : '';
  return `<div class="sound-control"><button class="sound-button" type="button" data-action="sound" aria-label="Sound settings" aria-expanded="${sound.controlsOpen}" aria-controls="game-sound-panel">${silent ? '♪×' : '♪'}<span>sound</span></button>${controls}</div>`;
}
function objectivesButton() {
  if (!state.petId || ['title', 'creation', 'player-name', 'pet-select', 'restart-confirm', 'room-reveal', 'pet-intro', 'window-moment', 'explore'].includes(state.phase)) return '';
  const completed = Object.values(state.world.objectiveStates || {}).filter(slot => slot.task?.completed).length;
  const levelUpQuest = availableLevelUpQuest();
  const badge = levelUpQuest ? '↑' : completed;
  const label = levelUpQuest ? 'Open daily goals and your Level-up quest' : 'Open rotating objectives';
  return `<button class="objectives-shortcut" data-action="open-objectives" aria-label="${label}">✦ <span>Goals</span>${badge ? `<i>${badge}</i>` : ''}</button>`;
}
function progressHud() {
  if (!state.petId || ['title', 'creation', 'player-name', 'pet-select', 'restart-confirm', 'room-reveal', 'pet-intro', 'window-moment', 'explore'].includes(state.phase)) return '';
  refreshTickets();
  const progress = progressionSnapshot();
  const milestone = progress.atBarrier ? progress.milestone : null;
  const canCraftMilestone = milestoneHasMaterials(milestone);
  const xpLabel = progress.levelCapped ? 'MAX LEVEL' : progress.atBarrier ? canCraftMilestone ? 'CRAFT READY' : 'NEXT GOAL' : progress.xpCapped ? 'XP AT CAP' : `${progress.earnedWithin} / ${progress.needed} XP`;
  const objectiveCopy = milestone ? canCraftMilestone ? `Craft ${milestone.name} · tap to make it` : `Craft ${milestone.name}` : '';
  const widgetContent = `<div class="xp-labels"><span>LV ${progress.level}</span><span>${xpLabel}</span></div>
      <div class="xp-track"><div class="xp-fill" style="width:${progress.atBarrier || progress.levelCapped ? 100 : progress.percent}%"></div></div>
      ${milestone ? `<span class="xp-objective-copy">${escapeHTML(objectiveCopy)}</span>` : ''}`;
  const xpWidget = milestone && state.world.phoneUnlocked ? `<button class="xp-widget xp-objective-link" type="button" data-action="open-milestone-craft" data-milestone="${milestone.id}" aria-label="${escapeHTML(`${xpLabel}. ${objectiveCopy}. Open the ${milestone.name} progression recipe.`)}">${widgetContent}</button>` : `<div class="xp-widget" aria-label="${progress.levelCapped ? `Level ${LEVEL_CAP}, maximum level reached` : `Level ${progress.level}, ${progress.totalXp.toLocaleString()} total XP`}">${widgetContent}</div>`;
  return `<div class="progress-hud" aria-label="Progress and expedition tickets">
    <div class="ticket-pill" aria-label="${state.world.tickets} of ${TICKET_SETTINGS.cap} expedition tickets">🎟 ${state.world.tickets}/${TICKET_SETTINGS.cap}</div>
    ${xpWidget}
  </div>`;
}
function accountButton() {
  const status = playerSaveManager.getStatus();
  return `<button class="account-shortcut" data-action="open-account" aria-label="${status.user ? 'Account settings' : 'Guest save and account settings'}" title="Account">♙</button>`;
}
function profileButton() {
  if (!state.petId || !state.hasCompletedOpening) return '';
  return `<button class="profile-shortcut" data-action="open-player-profile" aria-label="Open your Pocketwild profile" title="Your profile">${socialAvatarMarkup(state.avatar, 'Your character portrait')}</button>`;
}
function roomShopShortcut() {
  if (!state.world.phoneUnlocked || state.phase !== 'basecamp') return '';
  return '<button class="room-shop-shortcut" type="button" data-action="open-room-shop" aria-label="Open the Room Shop" title="Room Shop"><span aria-hidden="true">🏪</span><span>Shop</span></button>';
}
function zoneMapShortcut() {
  if (!state.petId) return '';
  return '<button class="zone-map-shortcut" type="button" data-action="open-exploration-map" aria-label="Open the map to switch zones" title="Switch zones">🧭</button>';
}
function topBar() {
  return `<div class="top-bar"><span class="brand-chip" aria-label="Pocketwild"><span class="brand-sparkle" aria-hidden="true">✦</span><span class="brand-wordmark">POCKET<span>WILD</span></span></span><div class="top-actions">${objectivesButton()}${roomShopShortcut()}${profileButton()}${accountButton()}${soundButton()}</div></div>${progressHud()}${zoneMapShortcut()}`;
}
function panel(content, className = '', attributes = '') {
  return `<section class="panel ${className}" ${attributes}>${content}</section>`;
}
function renderTitle() {
  const savedName = save?.playerName ? escapeHTML(save.playerName) : '';
  const continueButton = save ? `<button class="button secondary" data-action="continue">Continue${savedName ? ` with ${savedName}` : ''}</button>` : '';
  return `${topBar()}
    <div class="title-copy" aria-label="Pocketwild">
      <div class="title-kicker">a tiny world, all your own</div>
      <h1>POCKET<span>WILD</span></h1>
      <p>A little room for the wild.</p>
      <div class="title-fireflies" aria-hidden="true">✦　·　✧</div>
    </div>
    ${panel(`<p class="eyebrow">A new little life awaits</p><h2>Come on in.</h2><p class="body-copy">Meet your companion, make a little room, and see what catches their eye.</p>${accountNotice ? `<p class="account-notice" role="status">${escapeHTML(accountNotice)}</p>` : ''}<div class="button-stack">${continueButton}<button class="button primary" data-action="new-game">New Game <span aria-hidden="true">→</span></button></div>`, 'title-panel')}`;
}
function renderCreation() {
  const controls = Object.entries(AVATAR_OPTIONS).map(([key, options]) => {
    const value = state.avatar[key] % options.length;
    const title = key === 'hairColor' ? 'Hair color' : key.charAt(0).toUpperCase() + key.slice(1);
    return `<button class="choice-tile" data-avatar="${key}" aria-label="Change ${escapeHTML(title)}. Current: ${escapeHTML(options[value])}">
      <span>${escapeHTML(title)}</span><strong>${escapeHTML(options[value])}</strong><i aria-hidden="true">↻</i>
    </button>`;
  }).join('');
  return `${topBar()}<div class="preview-label">YOUR LITTLE LOOK <span>✦</span></div>
    ${panel(`<div class="step-heading"><div class="step-count">1 OF 3</div><h2>Make yourself at home</h2><p>Tap any detail to try another look.</p></div><div class="choice-grid">${controls}</div><button class="button primary wide" data-action="to-name">That looks like me <span aria-hidden="true">→</span></button>`, 'setup-panel')}`;
}
function renderPlayerName() {
  return `${topBar()}<div class="preview-label">A FACE FOR YOUR LITTLE WORLD <span>✦</span></div>
    ${panel(`<div class="step-heading"><div class="step-count">2 OF 3</div><h2>What should we call you?</h2><p>Your companion will be glad to know.</p></div><label class="input-label" for="player-name">YOUR NAME</label><input id="player-name" class="name-input" type="text" maxlength="16" autocomplete="nickname" autocapitalize="words" enterkeyhint="go" spellcheck="false" placeholder="A name you like" value="${escapeHTML(state.playerName)}" aria-describedby="name-entry-error" aria-invalid="${Boolean(state.nameEntryError)}" /><p class="field-error" id="name-entry-error" role="status" aria-live="polite">${escapeHTML(state.nameEntryError)}</p><button class="button primary wide" data-action="save-name" ${state.playerName.trim() ? '' : 'disabled'}>Lovely. <span aria-hidden="true">→</span></button><button class="button secondary wide" data-action="back-to-creation">‹ Back to your look</button>`, 'setup-panel name-panel')}`;
}
function renderPetSelection() {
  const cards = PETS.map(pet => {
    const selected = state.selectedPet === pet.id;
    return `<button class="pet-card${selected ? ' selected' : ''}" data-action="select-pet" data-pet="${pet.id}" aria-pressed="${selected}">
      <span class="pet-art-wrap"><img src="assets/${pet.id === 'mango' ? 'mango-frog-chunky' : pet.id === 'beans' ? 'beans-cat-chunky' : pet.id === 'trash' ? 'trash-raccoon-chunky' : 'luna-moth-chunky'}.webp" alt="" /></span>
      <span class="pet-card-copy"><span class="pet-name">${pet.name}</span><span class="pet-species">${pet.species} · ${pet.temperament}</span><span class="pet-knack">${pet.knack}</span></span>
      <span class="selected-mark" aria-hidden="true">${selected ? '♥' : '○'}</span>
    </button>`;
  }).join('');
  const chosen = PETS.find(pet => pet.id === state.selectedPet) || null;
  return `${topBar()}${panel(`<div class="step-heading compact"><div class="step-count">3 OF 3</div><h2>Choose your companion</h2><p>Each friend has their own little knack.</p></div><div class="pet-grid">${cards}</div><div class="forever-note">♡ <span>Your chosen friend stays with you, always.</span></div><p class="gentle-balance">Just a small nudge—there’s no wrong friend to choose.</p><button class="button primary wide" data-action="choose-pet" ${chosen ? '' : 'disabled'}>${chosen ? `Choose ${escapeHTML(chosen.name)}` : 'Tap a friend to meet them'} <span aria-hidden="true">→</span></button><button class="button secondary wide" data-action="back-to-name">‹ Back to your name</button>`, 'pet-select-panel')}`;
}
function renderRestartConfirm() {
  const accountCopy = playerSaveManager.getStatus().user ? 'Starting fresh replaces this account’s current player save. The previous cloud version is kept in a private backup.' : 'Your current room and companion are saved here. Starting fresh will replace them on this device.';
  return `${topBar()}${panel(`<p class="eyebrow">One small thing</p><h2>Start a fresh little world?</h2><p class="body-copy">${accountCopy}</p><div class="button-stack"><button class="button primary" data-action="confirm-new">Start fresh</button><button class="button secondary" data-action="cancel-new">Keep my world</button></div>`, 'title-panel confirm-panel')}`;
}
function renderRoomReveal() {
  return `${topBar()}<div class="room-caption">YOUR LITTLE ROOM</div>${panel(`<p class="eyebrow">A place to call your own</p><h2>The room is yours.</h2><p class="body-copy">A warm bed, a little desk, and all the quiet in the world. Someone’s on their way in…</p>`, 'dialog-panel reveal-panel')}`;
}
function renderPetIntro() {
  const pet = currentPet();
  const greeting = pet?.greeting || 'A little friend has found you.';
  const personalGreeting = state.playerName ? `${state.playerName}! ${greeting}` : greeting;
  return `${topBar()}<div class="room-caption">YOUR LITTLE ROOM</div>${panel(`<div class="speaker-label">${escapeHTML(pet?.name || 'Your friend')} <span>✦</span></div><p class="dialogue">${escapeHTML(personalGreeting)}</p><button class="button primary wide" data-action="say-hello">Say hello back <span aria-hidden="true">→</span></button><p class="tap-hint">You can tap your friend anytime.</p>`, 'dialog-panel')}`;
}
function renderWindowMoment() {
  const pet = currentPet();
  return `${topBar()}<div class="room-caption">A LITTLE SOMETHING OUTSIDE…</div>${panel(`<div class="speaker-label">${escapeHTML(pet?.name || 'Your friend')} <span>✦</span></div><p class="dialogue">${escapeHTML(pet?.hello || 'There’s a little glimmer beyond the window…')}</p><button class="button primary wide" data-action="look-outside">Follow their gaze <span aria-hidden="true">→</span></button>`, 'dialog-panel')}`;
}
function renderExploreInvitation() {
  const petName = escapeHTML(currentPet()?.name || 'Your friend');
  if (state.world.exploreInvitationDismissed) {
    return `${topBar()}<button class="button primary invitation-return-cta" data-action="choose-trail">Choose a trail with ${petName} <span aria-hidden="true">→</span></button>`;
  }
  const endingCopy = `${petName} is ready to be your explorer. There’s a whole little world just beyond the window.`;
  const response = `<button class="button primary wide explore-button" data-action="choose-trail">Choose our first trail <span aria-hidden="true">→</span></button><p class="tap-hint">Pick a trail together, then send ${petName} off when you’re ready.</p>`;
  return `${topBar()}<div class="room-caption invitation-caption">SOMEWHERE JUST BEYOND THE WINDOW <span>✦</span></div>${panel(`<button class="phone-close invitation-close" type="button" data-action="dismiss-invitation" aria-label="Close explore invitation">×</button><p class="eyebrow">Whenever you’re ready</p><h2>Shall we explore?</h2><p class="body-copy invitation-copy">${endingCopy}</p>${response}`, 'dialog-panel invitation-panel')}`;
}
function renderDestination() {
  refreshTickets();
  const pet = currentPet();
  const unlockedIds = availableAreaIds(state.world);
  const rememberedArea = explorationMapAreas().find(area => area.id === state.world.activeAreaId);
  const chosenArea = areaAccessible(state.world, rememberedArea) ? rememberedArea : AREA_CATALOG.find(area => areaAccessible(state.world, area)) || AREA_CATALOG[0];
  const currentLevel = progressionSnapshot().rawLevel;
  const canGo = state.world.tickets > 0 && areaAccessible(state.world, chosenArea);
  const destinationAreas = explorationMapAreas();
  const areaCards = destinationAreas.map(area => {
    const keepsakeOpen = unlockedIds.has(area.id);
    const unlocked = areaAccessible(state.world, area);
    const selected = area.id === chosenArea.id;
    const gate = PROGRESSION_MILESTONES.find(milestone => milestone.unlock.areaId === area.id);
    const card = `<span class="area-card-heading"><strong>${AREA_ICONS[area.id] || '✦'} ${escapeHTML(area.name)}</strong><span class="area-rarity">${escapeHTML(area.rarity)}</span></span><span>${escapeHTML(area.description)}</span><span class="destination-level">${escapeHTML(area.levelRange)} · ${escapeHTML(area.rarity)} eligible</span><span class="area-visual">${escapeHTML(area.visualIdentity)}</span><span class="area-xp">${escapeHTML(expeditionXpSummary(area.expeditionXp))}</span>`;
    if (unlocked) return `<button class="area-card${selected ? ' selected' : ''}" data-action="select-area" data-area="${area.id}" aria-pressed="${selected}">${card}</button>`;
    const lockCopy = keepsakeOpen ? `🔒 Level ${area.minLevel} · you’re Level ${currentLevel}` : `🔒 Craft ${gate?.name || 'a milestone keepsake'} · Level ${gate?.level || area.unlockLevel}`;
    return `<button type="button" class="area-card locked" data-action="locked-area" data-area="${area.id}" aria-label="${escapeHTML(area.name)} locked. ${escapeHTML(lockCopy)}">${card}<span class="area-lock">${escapeHTML(lockCopy)}</span></button>`;
  }).join('');
  const nextTicketAt = state.world.tickets <= 0 ? ticketManager.nextTicketAt(state.world, Date.now()) : null;
  const waitCopy = state.world.tickets <= 0 ? `A new ticket is growing quietly. Next one in <span data-countdown-at="${nextTicketAt}" data-countdown-kind="ticket">${formatCountdown((nextTicketAt || Date.now()) - Date.now())}</span>.` : !areaAccessible(state.world, chosenArea) ? `This path starts at Level ${chosenArea.minLevel}. Your friend will be ready once you reach it.` : 'A quick, gentle outing. Your friend will be back before long.';
  const tier = Math.min(RARITY_TIERS.indexOf(chosenArea.maxRarity), RARITY_TIERS.indexOf(highestUnlockedRarity(state.world)));
  const eligibility = RARITY_TIERS[Math.max(0, tier)];
  const isFirstOuting = state.world.expeditions === 0;
  return `${topBar()}<div class="meadow-caption">A LITTLE WAY FROM HOME</div>${panel(`<p class="eyebrow">${isFirstOuting ? 'Choose your first trail' : 'Pick a place to wander'}</p><h2>${isFirstOuting ? 'Where shall we go?' : 'Where to today?'}</h2><p class="body-copy">Each destination has its own little landscape, weather, and finds. Rarer finds only become possible as your trail grows.</p><div class="exploration-map-entry"><span>Choose from your open paths</span><button class="exploration-map-button" type="button" data-action="open-exploration-map" aria-label="Open the Pocketwild exploration map">🧭 <span>Explore / Choose Area</span></button></div><div class="area-list">${areaCards}</div><div class="destination-card"><strong>🎟 ${escapeHTML(chosenArea.name)}</strong><span>${waitCopy}</span><div class="destination-facts"><span>${escapeHTML(chosenArea.levelRange)}</span><span>🎟 1 ticket · ${escapeHTML(expeditionXpSummary(chosenArea.expeditionXp))}</span></div><div class="expedition-weather"><span class="expedition-condition">${escapeHTML(eligibility)} finds eligible</span><span class="expedition-condition">Weather & time vary</span></div></div><button class="button primary wide" data-action="send-pet" ${canGo ? '' : 'disabled'}>Send ${escapeHTML(pet?.name || 'your friend')} to explore <span aria-hidden="true">→</span></button><button class="button secondary wide" data-action="back-home">Back to our room</button>`, 'destination-panel')}`;
}
function renderExplorationMap() {
  const areas = explorationMapAreas();
  const item = ITEM_CATALOG[state.explorationMapItemId] || null;
  const sourceAreaIds = new Set(item ? eligibleMaterialSourceAreas(item.id).map(area => area.id) : []);
  const visibleCurrentArea = areas.find(area => area.id === state.world.activeAreaId && areaAccessible(state.world, area));
  const sourceNames = areas.filter(area => sourceAreaIds.has(area.id)).map(area => area.shortName || area.name);
  const sourceNote = item ? sourceNames.length ? `${item.name} may turn up in ${sourceNames.join(' or ')}. Finds are not guaranteed; weather and time can matter.` : `Choose an open trail and see what your explorer notices.` : 'Choose any open trail. Your companion will only set out when you tap the existing send action.';
  const zones = areas.map(area => {
    const unlocked = areaAccessible(state.world, area);
    const current = area.id === visibleCurrentArea?.id;
    const source = sourceAreaIds.has(area.id);
    const icon = unlocked ? AREA_ICONS[area.id] || '✦' : '❔';
    const status = current ? 'CURRENT' : unlocked ? 'OPEN' : 'LOCKED';
    const detail = unlocked ? `${area.levelRange} · ${escapeHTML(area.description)}` : `🔒 ${escapeHTML(areaMapLockCopy(state.world, area))}`;
    const sourceBadge = source ? '<span class="map-source-badge">POSSIBLE SOURCE</span>' : '';
    const selectedBadge = `<span class="map-zone-state">${status}</span>`;
    const contents = `<span class="map-zone-icon" style="--zone-tint:${escapeHTML(area.palette?.[0] || '#77715f')}" aria-hidden="true">${icon}</span><span class="map-zone-copy"><strong>${escapeHTML(area.name)}</strong><small>${detail}</small>${source ? '<small class="map-source-note">This find is in this zone’s pool</small>' : ''}</span><span class="map-zone-badges">${selectedBadge}${sourceBadge}</span>`;
    return unlocked ? `<button class="map-zone${current ? ' current' : ''}${source ? ' recommended' : ''}" type="button" data-action="select-map-area" data-area="${escapeHTML(area.id)}" aria-pressed="${current}">${contents}</button>` : `<div class="map-zone locked${source ? ' recommended' : ''}" aria-label="${escapeHTML(area.name)} locked. ${escapeHTML(areaMapLockCopy(state.world, area))}">${contents}</div>`;
  }).join('');
  const lookingFor = item ? `<div class="map-looking-for"><span>LOOKING FOR</span><strong>${escapeHTML(item.emoji || '✦')} ${escapeHTML(item.name)}</strong></div>` : '';
  return `<div class="exploration-map-overlay" role="dialog" aria-modal="true" aria-label="Pocketwild exploration map"><section class="exploration-map-panel"><header class="exploration-map-header"><div><p class="eyebrow">A POCKET-SIZED GUIDE</p><h2>Pocketwild map</h2></div><button class="phone-close" type="button" data-action="close-exploration-map" aria-label="Close Pocketwild map">×</button></header>${lookingFor}<p class="exploration-map-note" role="status">${escapeHTML(sourceNote)}</p><div class="exploration-map-list">${zones}</div><p class="exploration-map-footer">Tap an open place to set your destination. Sending your friend is always a separate choice.</p></section></div>`;
}
function renderTravel() {
  const pet = currentPet();
  const area = AREA_CATALOG.find(entry => entry.id === state.world.activeExpeditionAreaId) || AREA_CATALOG[0];
  const context = state.world.activeExpeditionData;
  const weather = context ? WEATHER_DATA[context.weatherId] : null;
  const time = context ? TIME_DATA[context.timeId] : null;
  const event = context?.eventId ? EVENT_DATA[context.eventId] : null;
  const traveling = state.phase === 'departing';
  const returning = state.phase === 'returning';
  const heading = traveling ? 'Off you go!' : returning ? 'Someone’s coming home…' : 'Look what’s around!';
  const copy = traveling ? `${escapeHTML(pet?.name || 'Your friend')} is on their way to ${escapeHTML(area.name)}.` : returning ? `${escapeHTML(pet?.name || 'Your friend')} has something tucked away for you.` : `${escapeHTML(pet?.name || 'Your friend')} is sniffing out little treasures in ${escapeHTML(area.shortName)}.`;
  const conditions = context ? `<div class="expedition-weather"><span class="expedition-condition">${weather?.icon || '☀️'} ${escapeHTML(weather?.label || 'Clear skies')}</span><span class="expedition-condition">${time?.icon || '🌤️'} ${escapeHTML(time?.label || 'Daylight')}</span><span class="expedition-condition">${escapeHTML(context.rarityEligibility)} eligible</span></div>` : '';
  const eventCopy = event ? `<p class="expedition-event">✦ ${escapeHTML(event.label)} · ${escapeHTML(event.description)}</p>` : '';
  return `${topBar()}${panel(`<p class="eyebrow">${traveling ? 'A little adventure begins' : returning ? 'Back to you' : escapeHTML(area.name)}</p><h2>${heading}</h2><p class="body-copy">${copy}</p>${conditions}${eventCopy}<p class="tap-hint">${traveling ? 'See you soon, little explorer.' : returning ? 'There’s a story in every find.' : 'There are little things to notice everywhere.'}</p>${autoExploreStopControl('button secondary wide auto-explore-stop')}`, 'dialog-panel expedition-panel reveal-panel')}`;
}
function renderRewardReveal() {
  const rewards = expeditionRewards(state.world.activeExpedition);
  const reward = rewards[state.world.revealIndex];
  if (!reward) return renderBasecamp();
  const area = AREA_CATALOG.find(entry => entry.id === state.world.activeExpeditionAreaId) || AREA_CATALOG[0];
  const isDiscovery = reward.type === 'discovery';
  const isPhone = reward.type === 'phone';
  const isCurrency = reward.type === 'currency';
  const rewardItem = reward.id ? getItemRecord(reward.id) : null;
  const rewardIconMarkup = !isPhone && rewardItem ? itemIconMarkup(rewardItem, 'reward-item-icon') : escapeHTML(reward.emoji || '✦');
  const displayXp = reward.type === 'xp' ? Math.min(reward.amount, remainingXpCapacity()) : 0;
  const xpPaused = reward.type === 'xp' && displayXp === 0;
  const headline = isDiscovery ? 'A new discovery!' : isPhone ? 'Something just for you…' : reward.type === 'xp' ? xpPaused ? 'Your trail has taught you plenty' : `+${displayXp} XP!` : isCurrency ? 'A little extra sparkle!' : 'Your explorer found…';
  const label = isDiscovery ? 'NEW · COLLECTION' : isPhone ? 'SPECIAL FIND' : reward.type === 'xp' ? xpPaused ? `LEVEL ${LEVEL_CAP} · CURRENT CAP` : 'EXPERIENCE' : isCurrency ? `${reward.currency === 'gold' ? 'GOLD' : 'STARDUST'} BONUS` : `${escapeHTML(area.shortName.toUpperCase())} MATERIAL`;
  const buttonCopy = isPhone ? 'Keep my phone' : state.world.revealIndex === rewards.length - 1 ? 'Back to our room' : 'Keep this find';
  const phoneNote = isPhone ? '<p class="phone-unlock-note">It starts with four little corners: Collection, Profile, Pet and Room. More can find their way here later.</p>' : '';
  const rewardDescription = reward.type === 'xp' ? xpPaused ? 'You and your friend have learned all the trail can teach for now. Finds still matter, and XP can return with a future chapter.' : displayXp < reward.amount ? `${reward.description || ''} The current Level ${LEVEL_CAP} cap allows up to ${displayXp} XP from this find.` : reward.description || '' : reward.description || '';
  const rewardName = xpPaused ? `A quiet pause at Level ${LEVEL_CAP}` : reward.name;
  const badge = reward.type === 'material' ? `<span class="reward-badge">+${reward.quantity} ${reward.quantity === 1 ? 'piece' : 'pieces'}</span>` : isCurrency ? `<span class="reward-badge">+${reward.amount} ${reward.currency === 'gold' ? 'Gold' : 'Stardust'}</span>` : '';
  return `${topBar()}<div class="reward-backdrop" aria-hidden="true"></div>${panel(`<div class="reward-panel-head"><div class="reward-kicker">${label} · FIND ${state.world.revealIndex + 1} OF ${rewards.length}</div><button class="phone-close" type="button" data-action="close-reward" aria-label="Keep this find and close">×</button></div><div class="reward-panel-content"><h2>${headline}</h2><div class="reward-icon${isPhone ? ' phone-icon' : ''}" aria-hidden="true">${rewardIconMarkup}</div><p class="reward-name">${escapeHTML(rewardName)}</p><p class="reward-description">${escapeHTML(rewardDescription)}</p>${badge}${phoneNote}</div><button class="button primary wide" data-action="claim-reward">${buttonCopy} <span aria-hidden="true">→</span></button>${autoExploreStopControl('button secondary wide auto-explore-stop')}`, 'dialog-panel reward-panel reveal-panel', `role="dialog" aria-modal="true" aria-label="${escapeHTML(headline)}"`)}`;
}
function renderBasecamp() {
  refreshTickets();
  const pet = currentPet();
  const petName = escapeHTML(pet?.name || 'Your friend');
  const trip = state.world.lastTrip;
  const tripArea = trip?.areaName || 'The Meadow';
  const items = trip?.items?.length ? trip.items : (trip?.finds || []).map(name => ({
    name,
    emoji: '✦',
    quantity: 1
  }));
  const findsMarkup = items.length ? items.map(item => {
    const amount = item.currency ? ` +${item.quantity}${item.currency === 'gold' ? 'g' : ' Stardust'}` : item.quantity > 1 ? ` ×${item.quantity}` : '';
    return `<span class="basecamp-find">${escapeHTML(item.emoji)} ${escapeHTML(item.name)}${amount}</span>`;
  }).join('') : '<span class="basecamp-find">A little fresh-air practice</span>';
  const tripWeather = trip?.context ? WEATHER_DATA[trip.context.weatherId] : null;
  const tripTime = trip?.context ? TIME_DATA[trip.context.timeId] : null;
  const tripEvent = trip?.context?.eventId ? EVENT_DATA[trip.context.eventId] : null;
  const tripProgress = progressionSnapshot();
  const tripXpCopy = tripProgress.levelCapped ? `Level ${LEVEL_CAP} · current maximum` : tripProgress.xpCapped ? `XP paused at the Level ${LEVEL_CAP} cap` : `+${trip?.xp || 0} XP earned`;
  const levelProgressCopy = tripProgress.levelCapped ? 'MAX LEVEL' : tripProgress.atBarrier ? milestoneHasMaterials(tripProgress.milestone) ? 'Milestone ready' : 'Next milestone' : tripProgress.xpCapped ? 'XP paused at cap' : `${tripProgress.earnedWithin} / ${tripProgress.needed} XP`;
  const progressPercent = tripProgress.levelCapped || tripProgress.atBarrier ? 100 : Math.max(0, Math.min(100, Math.round(tripProgress.percent || 0)));
  const tripConditions = tripWeather && tripTime ? `<div class="basecamp-conditions" aria-label="Weather and time of day"><span>${tripWeather.icon} ${escapeHTML(tripWeather.label)} · ${tripTime.icon} ${escapeHTML(tripTime.label)}${tripEvent ? ` · ${escapeHTML(tripEvent.label)}` : ''}</span></div>` : '';
  const phoneButton = state.world.phoneUnlocked ? '<button class="basecamp-home-phone basecamp-hud-action" data-action="open-phone" aria-label="Open your Pocket Phone"><span class="basecamp-action-icon" aria-hidden="true">📱</span><span class="basecamp-action-copy"><strong>Open Phone</strong><small>Shop · goals · settings</small></span></button>' : '';
  const recipeInvite = state.world.discoveredRecipes.some(recipeId => !state.world.knownRecipes.includes(recipeId)) ? '<button class="basecamp-craft-cta basecamp-hud-action" data-action="open-crafting" aria-label="Learn your first recipe"><span class="basecamp-action-icon" aria-hidden="true">📖</span><span class="basecamp-action-copy"><strong>Learn Recipe</strong><small>Discover something new</small></span></button>' : '';
  const firstReturnHint = state.world.expeditions === 1 && state.world.phoneUnlocked ? '<div class="basecamp-onboarding-note">Your finds are in Collection, and a Meadowglow recipe is waiting in Crafting.</div>' : '';
  const nextTicket = state.world.tickets === 0 ? ticketManager.nextTicketAt(state.world, Date.now()) : null;
  const ticketWait = nextTicket ? `<span class="basecamp-ticket-wait">Next ticket <span data-countdown-at="${nextTicket}" data-countdown-kind="ticket">in ${formatCountdown(nextTicket - Date.now())}</span></span>` : '';
  const actionClasses = `basecamp-action-row${recipeInvite ? ' has-recipe' : ''}${phoneButton ? ' has-phone' : ''}`;
  const shownTickets = state.world.tickets;
  const compactXpCopy = tripProgress.levelCapped ? 'MAX XP' : tripProgress.atBarrier ? milestoneHasMaterials(tripProgress.milestone) ? 'Milestone ready' : 'Next milestone' : `${tripProgress.earnedWithin}/${tripProgress.needed} XP`;
  const panelExpanded = state.basecampPanelExpanded;
  return `${topBar()}<section class="basecamp-taskbar${panelExpanded ? '' : ' is-compact'}" role="status" aria-live="polite" aria-label="Basecamp status and actions">
    <div class="basecamp-compact-summary">
      <div class="basecamp-compact-heading">
        <strong><span aria-hidden="true">✦</span> ${petName} · ${escapeHTML(tripArea)}</strong>
        <button class="basecamp-panel-toggle" type="button" data-action="toggle-basecamp-panel" aria-controls="basecamp-taskbar-details" aria-expanded="${panelExpanded}" aria-label="${panelExpanded ? 'Collapse' : 'Expand'} basecamp details">${panelExpanded ? '⌃' : '⌄'}</button>
      </div>
      <div class="basecamp-compact-resource-row" aria-label="${shownTickets} of ${TICKET_SETTINGS.cap} tickets · Level ${tripProgress.level} · ${compactXpCopy}"><span>🎟 ${shownTickets}/${TICKET_SETTINGS.cap} tickets</span><span>LV ${tripProgress.level} · ${compactXpCopy}</span></div>
    </div>
    <div class="basecamp-taskbar-details" id="basecamp-taskbar-details">
      <div class="basecamp-hud-status">
        <div class="basecamp-hud-heading"><span aria-hidden="true">✦</span><strong>${petName} is home from ${escapeHTML(tripArea)}</strong></div>
        <div class="basecamp-finds" aria-label="Finds from this outing">${findsMarkup}</div>
        ${tripConditions}${firstReturnHint}
      </div>
      <div class="basecamp-hud-resources" aria-label="Resources and progression">
        <div class="basecamp-resource-grid">
          <div class="basecamp-ticket-card" aria-label="${shownTickets} of ${TICKET_SETTINGS.cap} expedition tickets">
            <div class="basecamp-ticket-heading"><span class="basecamp-ticket-icon" aria-hidden="true">🎟</span><strong class="basecamp-ticket-value">${shownTickets}<small> / ${TICKET_SETTINGS.cap}</small></strong></div>
            <span class="basecamp-resource-kicker">Tickets</span>
            ${ticketWait}
          </div>
          <div class="basecamp-xp-card">
            <div class="basecamp-xp-heading"><strong>${tripXpCopy}</strong><span>LV ${tripProgress.level}</span></div>
            <div class="basecamp-xp-track" role="progressbar" aria-label="Level ${tripProgress.level} progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progressPercent}"><span style="width:${progressPercent}%"></span></div>
            <div class="basecamp-xp-detail">${levelProgressCopy}</div>
          </div>
        </div>
        <div class="basecamp-wallet-line" aria-label="Pocket resources"><span>🪙 ${currencyBalance('gold').toLocaleString()}g</span><span>✧ ${currencyBalance('stardust').toLocaleString()} Stardust</span></div>
      </div>
      <div class="basecamp-hud-actions">
        ${autoExploreStatusMarkup()}
        <div class="${actionClasses}">
          ${recipeInvite}
          ${basecampAutoExploreControl('basecamp-hud-action')}
          ${phoneButton}
        </div>
      </div>
    </div>
  </section>`;
}
function milestoneUnlockSummary(milestone) {
  const area = milestone.unlock.areaId ? AREA_CATALOG.find(entry => entry.id === milestone.unlock.areaId) : null;
  if (area) return `${area.name} · ${milestone.unlock.rarity || area.rarity} discoveries`;
  return milestone.unlock.title ? `${milestone.unlock.title} title` : 'A new chapter';
}
function milestoneIngredientMarkup(ingredient, {
  displayLimit = false,
  showFind = true
} = {}) {
  const item = ITEM_CATALOG[ingredient.itemId];
  if (!item) return '';
  const have = Math.max(0, Math.floor(Number(state.world.inventory[ingredient.itemId]) || 0));
  const ready = have >= ingredient.quantity;
  const displayedHave = displayLimit ? Math.min(have, ingredient.quantity) : have;
  const sourceAreas = ready || !showFind ? [] : eligibleMaterialSourceAreas(item.id);
  const sourceNames = sourceAreas.map(area => area.shortName || area.name);
  const findButton = sourceAreas.length ? `<button class="milestone-find-button" type="button" data-action="open-exploration-map" data-map-item="${escapeHTML(item.id)}" aria-label="Find ${escapeHTML(item.name)} in ${escapeHTML(sourceNames.join(' or '))}">${sourceAreas.length === 1 ? `🧭 Find in ${escapeHTML(sourceNames[0])} →` : `🧭 Find · ${sourceAreas.length} areas →`}</button>` : '';
  return `<div class="milestone-ingredient-group"><div class="milestone-ingredient${ready ? ' ready' : ' missing'}"><span>${escapeHTML(item.emoji || '✦')} ${escapeHTML(item.name)}</span><strong>${displayedHave} / ${ingredient.quantity}</strong></div>${findButton}</div>`;
}
function renderMilestoneCard(progress, {
  levelUpQuest = false
} = {}) {
  const milestone = progress.milestone;
  if (!milestone) {
    const rootkeeper = completedMilestone(state.world, {
      id: 'milestone-60'
    });
    const master = completedMilestone(state.world, {
      id: 'milestone-50'
    });
    const completedOutput = rootkeeper ? ITEM_CATALOG.ancientRootCrown : master ? ITEM_CATALOG.masterCollectorsRelic : null;
    const completedKicker = rootkeeper ? '✦ ROOTKEEPER' : master ? '✦ MASTER COLLECTOR' : '✦ ALL CURRENT MILESTONES COMPLETE';
    const completedTitle = rootkeeper ? 'Amberfall’s old roots know your name.' : master ? 'The original journey is complete.' : 'A whole lot of places await.';
    const completedCopy = rootkeeper ? `You reached the current Level ${LEVEL_CAP} cap. The path is yours to revisit.` : master ? `The Master Collector keepsake marks Level ${MASTER_COLLECTOR_LEVEL}. Your next chapter is ready.` : 'Your next chapter will find its way here.';
    const completedHeading = completedOutput ? `<div class="milestone-card-heading">${itemIconMarkup(completedOutput, 'milestone-card-icon')}<div><div class="milestone-kicker">${completedKicker}</div><strong>${completedTitle}</strong></div></div>` : `<div class="milestone-kicker">${completedKicker}</div><strong>${completedTitle}</strong>`;
    return `<section class="milestone-card complete">${completedHeading}<p>${completedCopy}</p></section>`;
  }
  const output = ITEM_CATALOG[milestone.outputId];
  const ingredients = milestone.ingredients.map(ingredient => milestoneIngredientMarkup(ingredient, {
    displayLimit: !levelUpQuest
  })).join('');
  const enoughMaterials = milestoneHasMaterials(milestone);
  const canCraft = progress.level >= milestone.level && enoughMaterials;
  const unlock = milestoneUnlockSummary(milestone);
  const status = progress.level < milestone.level ? `Opens at Level ${milestone.level} · you’re Level ${progress.level}` : enoughMaterials ? 'Every material is ready. Make it whenever you like.' : 'Gather the missing materials to open the next path.';
  const ingredientMarkup = ingredients ? `<div class="milestone-ingredients">${ingredients}</div>` : '<div class="milestone-no-ingredients">Nothing to gather for this milestone.</div>';
  const milestoneSuffix = milestone.level === MASTER_COLLECTOR_LEVEL ? ' · finish the original journey' : milestone.level === LEVEL_CAP ? ' · complete this chapter' : progress.xpCapped ? ' · open the next path' : ` · +${milestone.xpReward} XP`;
  const milestoneAction = state.world.phoneUnlocked ? `<button class="button primary wide milestone-button" data-action="open-milestone-craft" data-milestone="${milestone.id}">See ${escapeHTML(milestone.name)} materials & craft <span aria-hidden="true">→</span></button>` : `<button class="button primary wide milestone-button" data-action="craft-milestone" data-milestone="${milestone.id}" ${canCraft ? '' : 'disabled'}>Craft ${escapeHTML(milestone.name)}${milestoneSuffix}</button>`;
  return `<section class="milestone-card${levelUpQuest ? ' objective-level-up-card' : ''}"><div class="milestone-card-heading">${itemIconMarkup(output, 'milestone-card-icon')}<div><div class="milestone-kicker">LEVEL ${milestone.level} · ${levelUpQuest ? 'LEVEL-UP QUEST' : 'PROGRESSION CRAFT'}</div><strong>${escapeHTML(milestone.name)}</strong></div></div><p>${escapeHTML(milestone.description)}</p><div class="milestone-unlock">🔓 Crafting this item unlocks: ${escapeHTML(unlock)}</div><div class="milestone-status">${escapeHTML(status)}</div>${ingredientMarkup}${milestoneAction}</section>`;
}
function renderNextArtifactTracker(open = false) {
  const milestone = PROGRESSION_MILESTONES.find(entry => entry.level <= LEVEL_CAP && !completedMilestone(state.world, entry));
  if (!milestone || !ITEM_CATALOG[milestone.outputId]) return '';
  let totalRequired = 0;
  let totalReady = 0;
  const materials = milestone.ingredients.map(ingredient => {
    const item = ITEM_CATALOG[ingredient.itemId];
    if (!item) return '';
    const required = Math.max(0, Math.floor(Number(ingredient.quantity) || 0));
    const have = Math.max(0, Math.floor(Number(state.world.inventory[ingredient.itemId]) || 0));
    const ready = have >= required;
    const percent = required > 0 ? Math.min(100, Math.round(have / required * 100)) : 100;
    totalRequired += required;
    totalReady += Math.min(have, required);
    const content = `<span class="next-artifact-item-icon" aria-hidden="true">${escapeHTML(item.emoji || '✦')}</span><span class="next-artifact-material-copy"><span class="next-artifact-material-line"><span class="next-artifact-material-name">${escapeHTML(item.name)}</span><span class="next-artifact-quantity">${have} / ${required}${ready ? ' ✓' : ''}</span></span><span class="next-artifact-item-track" role="progressbar" aria-label="${escapeHTML(item.name)} materials" aria-valuemin="0" aria-valuemax="${required}" aria-valuenow="${Math.min(have, required)}"><span style="width:${percent}%"></span></span></span>`;
    const sourceAreas = ready ? [] : eligibleMaterialSourceAreas(item.id);
    if (sourceAreas.length) {
      const sourceNames = sourceAreas.map(area => area.shortName || area.name).join(' or ');
      return `<button class="next-artifact-material next-artifact-material-action${ready ? ' ready' : ''}" type="button" data-action="open-exploration-map" data-map-item="${escapeHTML(item.id)}" aria-label="Find ${escapeHTML(item.name)} in ${escapeHTML(sourceNames)}. You have ${have} of ${required} required">${content}</button>`;
    }
    return `<div class="next-artifact-material${ready ? ' ready' : ' missing'}">${content}</div>`;
  }).join('');
  const output = ITEM_CATALOG[milestone.outputId];
  const progressLabel = `${totalReady}/${totalRequired}`;
  return `<details class="next-artifact-tracker" aria-label="Next artifact ${escapeHTML(milestone.name)}, ${progressLabel} materials ready"${open ? ' open' : ''}><summary aria-label="${open ? 'Collapse' : 'Expand'} ${escapeHTML(milestone.name)} materials">${itemIconMarkup(output, 'next-artifact-output')}<strong class="next-artifact-name">${escapeHTML(milestone.name)}</strong><span class="next-artifact-count">${progressLabel}</span><span class="next-artifact-chevron" aria-hidden="true">⌄</span></summary><div class="next-artifact-details"><div class="next-artifact-detail-heading"><span>LEVEL ${milestone.level} · REQUIRED MATERIALS</span><span>${progressLabel} ready</span></div><div class="next-artifact-materials" aria-label="Required materials">${materials}</div></div></details>`;
}
function renderMilestoneCraftingSection() {
  const activeMilestone = pendingMilestone();
  const progress = progressionSnapshot();
  const cards = PROGRESSION_MILESTONES.map(milestone => {
    const output = ITEM_CATALOG[milestone.outputId];
    if (!output) return '';
    const isCurrent = milestone.id === activeMilestone?.id;
    const completed = completedMilestone(state.world, milestone);
    const enoughMaterials = milestoneHasMaterials(milestone);
    const reached = isCurrent && progress.level >= milestone.level;
    const canCraft = isCurrent && reached && enoughMaterials;
    const status = completed ? milestone.level === MASTER_COLLECTOR_LEVEL ? '✓ Crafted · Master Collector journey complete' : milestone.level === LEVEL_CAP ? `✓ Crafted · Level ${LEVEL_CAP} chapter complete` : '✓ Crafted · chapter unlocked' : isCurrent && reached ? enoughMaterials ? 'CRAFT READY · every material is in your bag' : 'NEXT GOAL · gather the missing materials below' : isCurrent ? progress.xpCapped ? milestone.level === LEVEL_CAP ? `XP is at the Level ${LEVEL_CAP} cap · craft this keepsake to finish the chapter` : `XP is at the Level ${LEVEL_CAP} cap · craft this keepsake to open the next path` : `Normal XP progress · available at Level ${milestone.level}` : `Opens at Level ${milestone.level}`;
    const materials = milestone.ingredients.map(ingredient => milestoneIngredientMarkup(ingredient, {
      showFind: !completed
    })).join('');
    const unlock = milestoneUnlockSummary(milestone);
    const action = completed ? '<div class="milestone-complete-note">✓ Already crafted</div>' : `<button class="button ${canCraft ? 'primary' : 'secondary'} wide milestone-button" data-action="craft-milestone" data-milestone="${milestone.id}" ${canCraft ? '' : 'disabled'}>${canCraft ? `Craft ${escapeHTML(milestone.name)}` : isCurrent && reached ? 'Gather the materials above' : `Available at Level ${milestone.level}`}</button>`;
    const opened = isCurrent && progress.atBarrier;
    const milestoneTag = completed ? 'CRAFTED' : opened ? 'CURRENT OBJECTIVE' : isCurrent ? 'UP NEXT' : 'PROGRESSION';
    return `<details class="milestone-card milestone-craft-entry${completed ? ' complete' : ''}${isCurrent ? ' current' : ''}" data-milestone-card="${milestone.id}"${opened ? ' open' : ''}><summary>${itemIconMarkup(output, 'milestone-summary-icon')}<span class="milestone-summary-copy"><small>${escapeHTML(milestoneTag)} · LEVEL ${milestone.level}</small><strong>${escapeHTML(milestone.name)}</strong><span>🔓 ${escapeHTML(unlock)}</span></span><span class="milestone-summary-chevron" aria-hidden="true">⌄</span></summary><div class="milestone-craft-details"><div class="milestone-artifact-heading">${itemIconMarkup(output, 'milestone-detail-icon')}<div><strong>${escapeHTML(milestone.name)}</strong><small>${escapeHTML(milestone.category || 'Progression')} · ${escapeHTML(milestone.station || 'Trail workbench')}</small></div></div><p>${escapeHTML(milestone.description)}</p><div class="milestone-unlock">🔓 Crafting this item unlocks: ${escapeHTML(unlock)}</div><div class="milestone-status">${escapeHTML(status)}</div><div class="milestone-material-heading">REQUIRED MATERIALS</div>${materials ? `<div class="milestone-ingredients">${materials}</div>` : '<div class="milestone-no-ingredients">No raw materials needed.</div>'}${action}</div></details>`;
  }).join('');
  return `<section class="progression-crafting"><div class="crafting-section-heading"><span>⭐</span><div><strong>PROGRESSION</strong><small>Special keepsakes open new places and discoveries.</small></div></div>${cards}</section>`;
}
function renderWalletCard() {
  return `<div class="wallet-card" aria-label="Wallet: ${currencyBalance('gold')} gold and ${currencyBalance('stardust')} Stardust"><div class="wallet-heading"><strong>Your pocket</strong><span>two little currencies</span></div><div class="wallet-balances"><span>🪙 GOLD <b>${currencyBalance('gold').toLocaleString()}g</b></span><span>✧ STARDUST <b>${currencyBalance('stardust').toLocaleString()}</b></span></div></div>`;
}
function renderShopBuySection() {
  const rotation = state.world.roomShopRotation;
  const restockAt = (rotation.periodId + 1) * ECONOMY_CONFIG.roomShopRotation.periodMs;
  const offers = rotation.slots.map((offer, slotIndex) => {
    if (!offer) {
      return '<article class="shop-offer shop-offer-empty" aria-label="Empty shop shelf"><div class="shop-offer-heading"><span class="shop-item-icon" aria-hidden="true">· · ·</span><div><span class="shop-offer-type">A QUIET LITTLE SHELF</span><strong>Nothing here this hour</strong></div></div><p>Maybe something will turn up next time.</p></article>';
    }
    const item = ITEM_CATALOG[offer.itemId];
    if (!item) return '';
    const owned = state.world.inventory[item.id] || 0;
    const canAfford = currencyBalance(offer.currency) >= offer.price;
    const canCarry = owned < MAX_INVENTORY_STACK;
    const currencyCopy = offer.currency === 'stardust' ? 'STARDUST KEEPSAKE' : 'GOLD · WOODLAND STOCK';
    const purchaseState = offer.purchased || !canAfford || !canCarry ? 'disabled' : '';
    const buttonCopy = offer.purchased ? 'Sold out this hour' : !canCarry ? 'Satchel stack is full' : `Buy one · ${currencyLabel(offer.currency, offer.price)}`;
    return `<article class="shop-offer"><div class="shop-offer-heading"><span class="shop-item-icon" aria-hidden="true">${item.emoji}</span><div><span class="shop-offer-type">${currencyCopy}</span><strong>${escapeHTML(item.name)}</strong></div></div><p>${escapeHTML(item.description)}</p><div class="shop-offer-footer"><span>${escapeHTML(item.category)} · ${escapeHTML(item.rarity)} · Bag ×${owned}</span><strong>${currencyLabel(offer.currency, offer.price)}</strong></div><button class="button ${offer.currency === 'stardust' ? 'secondary' : 'primary'} wide shop-buy" data-action="buy-room-item" data-item="${item.id}" data-slot="${slotIndex}" ${purchaseState}>${buttonCopy}</button></article>`;
  }).join('');
  return `<p class="shop-section-note">A few handy materials, gentle brews, and keepsakes drift onto Clover’s shelves. Prices use the same Gold and Stardust as your room and recipes.</p><p class="shop-restock-note">The shelves turn over in <span data-countdown-kind="shop-restock" data-countdown-at="${restockAt}">${formatCountdown(restockAt - Date.now())}</span></p><div class="shop-stock">${offers}</div>`;
}
function renderShopSellSection() {
  const protection = calculateAutoSellProtection(state.world);
  const items = Object.entries(state.world.inventory).map(([itemId, amount]) => ({
    item: ITEM_CATALOG[itemId],
    quantity: Math.max(0, Math.floor(Number(amount) || 0))
  })).filter(({
    item,
    quantity
  }) => item && quantity > 0 && npcSellPrice(item.id) > 0).sort((a, b) => a.item.name.localeCompare(b.item.name));
  const rows = items.map(({
    item,
    quantity
  }) => {
    const price = npcSellPrice(item.id);
    const sellableQuantity = Math.min(quantity, Math.floor((ECONOMY_CONFIG.maxBalance - currencyBalance('gold')) / price));
    const reserve = protection.protectAll ? quantity : Math.min(quantity, protection.reserved.get(item.id) || 0);
    const reserveCopy = reserve ? `<p class="shop-sell-protection">Auto-Sell keeps ${reserve} for ${escapeHTML(protection.reasons.get(item.id)?.join(', ') || 'a current progression need')}; manual sales are always your choice.</p>` : '';
    const form = sellableQuantity ? `<form class="shop-sell-form" data-shop-sell-form data-item="${item.id}" data-price="${price}"><label class="shop-quantity-label">Quantity<input class="shop-quantity-input" data-shop-sell-quantity type="number" name="quantity" min="1" max="${sellableQuantity}" step="1" value="1" inputmode="numeric" required /></label><button class="button secondary" type="submit">Sell to Clover</button><p class="shop-sale-total">${price} Gold each · Total: <output data-shop-sale-total>${price} Gold</output></p></form>` : '<p class="shop-sell-protection">Your Gold pouch is full; Clover cannot buy more right now.</p>';
    return `<article class="shop-sell-card"><div class="shop-sell-card-head">${itemIconMarkup(item, 'shop-item-icon')}<div class="shop-sell-copy"><strong>${escapeHTML(item.name)}</strong><small>${escapeHTML(item.category)} · ${escapeHTML(item.rarity)} · ${price} Gold each</small></div><span class="shop-sell-owned">×${quantity}</span></div><p class="shop-sell-description">${escapeHTML(item.description)}</p>${reserveCopy}${form}</article>`;
  }).join('');
  return `<p class="shop-section-note">Clover pays a steady woodland buyback price. Choose any quantity from your current satchel; the total is shown before you confirm.</p><div class="shop-sell-list">${rows || '<div class="empty-note">Clover is only buying eligible ordinary finds. Your keepsakes and special items stay safely with you.</div>'}</div>`;
}
function renderSmartAutoSellSection() {
  const protection = calculateAutoSellProtection(state.world);
  const entries = Object.entries(state.world.inventory).map(([itemId, amount]) => ({
    item: ITEM_CATALOG[itemId],
    quantity: Math.max(0, Math.floor(Number(amount) || 0))
  })).filter(({
    item,
    quantity
  }) => item && quantity > 0).sort((a, b) => a.item.name.localeCompare(b.item.name));
  const preview = entries.map(({
    item,
    quantity
  }) => {
    const price = npcSellPrice(item.id);
    const reason = autoSellProtectionReason(item, protection);
    const reserve = protection.protectAll ? quantity : Math.min(quantity, protection.reserved.get(item.id) || 0);
    const surplus = Math.max(0, quantity - reserve);
    const canSell = !reason && price > 0 && state.world.collection.includes(item.id) && surplus > 0 && currencyBalance('gold') < ECONOMY_CONFIG.maxBalance;
    const amountCopy = reason || (!price ? 'Clover has no buyback price' : !surplus ? 'Protected · no surplus after reserves' : currencyBalance('gold') >= ECONOMY_CONFIG.maxBalance ? 'Held · Gold pouch is full' : `Surplus ×${surplus} · ${price} Gold each${state.world.autoSellEnabled ? '' : ' · off'}`);
    return `<article class="auto-sell-item"><span class="shop-item-icon" aria-hidden="true">${escapeHTML(item.emoji || '✦')}</span><div class="auto-sell-item-copy"><strong>${escapeHTML(item.name)} · ×${quantity}</strong><small>${escapeHTML(item.rarity)}${reserve ? ` · keeps ${reserve} reserved` : ''}</small></div><span class="auto-sell-state${canSell ? '' : ' protected'}">${escapeHTML(amountCopy)}</span></article>`;
  }).join('');
  return `<div class="shop-toggle-row"><div class="shop-toggle-copy"><strong>Smart Auto-Sell</strong><small>After an outing’s rewards are safely added, Clover buys only eligible surplus.</small></div><button class="shop-auto-toggle" type="button" data-action="toggle-auto-sell" aria-pressed="${state.world.autoSellEnabled}">${state.world.autoSellEnabled ? 'ON · Stop' : 'OFF · Start'}</button></div><p class="shop-protection-guide"><strong>Always protected:</strong> unique keepsakes and artifacts, undiscovered finds, quest/progression flags, room favorites or placed items, and materials reserved for your next milestone, selected learned recipe, or active item objective. New finds from the outing are left in your bag. If a requirement is unclear, Auto-Sell holds the affected stock safely.</p><h3 class="market-owner-label">What Clover would consider</h3><div class="auto-sell-preview">${preview || '<div class="empty-note">Nothing in your satchel is ready for Auto-Sell yet.</div>'}</div>`;
}
function renderShopHistory() {
  const entries = (state.world.marketHistory || []).filter(entry => ['npc-sale', 'auto-sell', 'npc-purchase'].includes(entry.type)).slice(0, 20);
  const rows = entries.map(entry => {
    const icon = entry.type === 'auto-sell' ? '🍃' : entry.type === 'npc-purchase' ? '🛍️' : '🪙';
    const date = entry.at ? new Date(entry.at).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }) : 'Earlier';
    const currency = entry.currency === 'stardust' ? 'stardust' : 'gold';
    const amount = Math.max(0, Math.floor(Number(entry.amount ?? entry.gold) || 0));
    const transactionValue = currency === 'stardust' ? `−${amount.toLocaleString()} Stardust` : `${entry.type === 'npc-purchase' ? '−' : '+'}${amount.toLocaleString()}g`;
    return `<article class="shop-transaction-row"><span aria-hidden="true">${icon}</span><div><strong>${escapeHTML(entry.title)}</strong><small>${escapeHTML(date)} · ×${Number(entry.quantity) || 0}</small></div><b>${transactionValue}</b></article>`;
  }).join('');
  return `<p class="shop-section-note">Your recent trades with Clover stay in your local and account-synced world save.</p><div class="shop-history-list">${rows || '<div class="empty-note">Your first little shop transaction will leave a note here.</div>'}</div>`;
}
function renderRoomShop() {
  ensureRoomShopRotation();
  const tabs = [['buy', 'Buy'], ['sell', 'Sell'], ['auto-sell', 'Auto-Sell'], ['history', 'History']].map(([id, label]) => `<button class="market-tab shop-tab${shopTab === id ? ' selected' : ''}" type="button" data-action="shop-tab" data-tab="${id}" aria-pressed="${shopTab === id}">${label}</button>`).join('');
  const content = shopTab === 'sell' ? renderShopSellSection() : shopTab === 'auto-sell' ? renderSmartAutoSellSection() : shopTab === 'history' ? renderShopHistory() : renderShopBuySection();
  const keeper = cloverPresence();
  const notice = shopNotice ? `<div class="market-notice" role="status">${escapeHTML(shopNotice)}</div>` : '';
  return `<div class="shopfront">${renderWalletCard()}<div class="shop-sign"><span>CLOVER’S WOODLAND TRADING POST</span><h3>${escapeHTML(roomShopTitle())}</h3><p>Welcome in, ${escapeHTML(state.playerName || 'Wanderer')}. A tiny shelf of useful things, fair trades, and warm company.</p>${keeper ? `<p class="shop-keeper-line"><span aria-hidden="true">🍀</span><span><strong>Clover is here.</strong> ${escapeHTML(keeper.line)}</span></p>` : ''}</div><div class="market-tabs shop-tabs" role="tablist" aria-label="Clover’s shop sections">${tabs}</div>${notice}${content}</div>`;
}
function publicPlayerProfile() {
  const pet = currentPet();
  const progress = progressionSnapshot();
  const theme = ROOM_THEMES[state.world.activeRoomTheme] || ROOM_THEMES['starter-room'];
  const master = hasMasterCollectorBadge(state.world);
  const favoriteItems = state.world.collection.slice(0, 3).map(id => ITEM_CATALOG[id]).filter(Boolean).map(item => ({
    id: item.id,
    name: item.name,
    emoji: item.emoji,
    rarity: item.rarity
  }));
  const count = state.world.collection.length;
  const collectionAchievements = [...(count >= 1 ? ['First little find'] : []), ...(count >= 5 ? ['A growing journal'] : []), ...(count >= 15 ? ['Curious collector'] : []), ...(count >= 30 ? ['A page for every place'] : [])];
  const offers = ECONOMY_CONFIG.roomShopStock.map(offer => {
    const item = ITEM_CATALOG[offer.itemId];
    return item ? {
      id: item.id,
      name: item.name,
      emoji: item.emoji,
      description: item.description,
      currency: offer.currency,
      price: offer.price
    } : null;
  }).filter(Boolean);
  const badge = master ? {
    ...MASTER_COLLECTOR_BADGE
  } : null;
  return {
    displayName: safeUserText(state.playerName, 'PLAYER_NAME', 'Wanderer'),
    avatar: {
      ...state.avatar
    },
    level: progress.level,
    xp: progress.totalXp,
    masterCollector: master,
    badges: badge ? [badge] : [],
    collectionCount: count,
    collection: [...state.world.collection].slice(0, 200),
    collectionAchievements,
    favoriteItems,
    discoverable: socialManager.preferences().discoverable,
    room: {
      name: safeUserText(state.world.room.name, 'ROOM_NAME', 'Little Nook'),
      themeId: theme.id,
      themeName: theme.name,
      wallStyle: state.world.room.wallStyle,
      floorStyle: state.world.room.floorStyle
    },
    pet: pet ? {
      id: pet.id,
      name: pet.name,
      species: pet.species,
      temperament: pet.temperament
    } : null,
    shop: {
      name: roomShopTitle(),
      offers
    },
    signals: {
      eventParticipation: 0
    }
  };
}
function socialAvatarMarkup(rawAvatar, label = 'Pocketwild player') {
  const avatar = validAvatar(rawAvatar);
  const skin = SKIN_COLORS[avatar.skin] || SKIN_COLORS[0];
  const hair = HAIR_COLORS[avatar.hairColor] || HAIR_COLORS[0];
  const outfit = OUTFIT_COLORS[avatar.outfit] || OUTFIT_COLORS[0];
  const eyes = EYE_COLORS[avatar.eyes] || EYE_COLORS[0];
  const accessory = avatar.accessory;
  return `<span class="social-avatar" role="img" aria-label="${escapeHTML(label)}"><svg viewBox="0 0 32 38" aria-hidden="true" shape-rendering="crispEdges"><rect x="9" y="24" width="14" height="10" fill="#302831"/><rect x="11" y="26" width="10" height="7" fill="${outfit}"/><rect x="7" y="9" width="18" height="16" fill="#302831"/><rect x="8" y="10" width="16" height="13" fill="${skin}"/><rect x="7" y="6" width="18" height="7" fill="#302831"/><rect x="9" y="5" width="14" height="6" fill="${hair}"/><rect x="10" y="6" width="7" height="2" fill="${hair === '#e5a84f' ? '#f2c66e' : hair === '#8d526b' ? '#b8768c' : '#805346'}"/><rect x="10" y="14" width="3" height="4" fill="#302831"/><rect x="19" y="14" width="3" height="4" fill="#302831"/><rect x="11" y="15" width="2" height="2" fill="${eyes}"/><rect x="20" y="15" width="2" height="2" fill="${eyes}"/><rect x="14" y="19" width="4" height="1" fill="#9b5f58"/>${accessory === 0 ? '<path d="M21 8h4v3h-2v2h-3V9z" fill="#a8c777"/>' : accessory === 1 ? '<path d="M9 14h5v4H9zm9 0h5v4h-5zm-1 1h1" fill="none" stroke="#d5b77b" stroke-width="1"/>' : accessory === 2 ? '<path d="M8 5h16v3H8z" fill="#bd7180"/>' : ''}</svg></span>`;
}
function socialOnlineMarkup(profile) {
  if (profile.accountType === 'simulated') {
    const activity = {
      Exploring: 'Often out exploring',
      Decorating: 'A room decorator',
      Crafting: 'A little alchemy fan',
      Resting: 'A gentle wanderer',
      'Looking through a collection': 'A collection admirer'
    }[profile.activityStatus] || 'A quiet wanderer';
    return `<span class="social-offline">${escapeHTML(activity)}</span>`;
  }
  const online = socialManager.online(profile);
  return `<span class="${online ? 'social-online' : 'social-offline'}">${online ? 'Here now' : 'Away for a while'}</span>`;
}
function socialOverviewMarkup(profile) {
  const level = Math.max(1, Math.floor(Number(profile.level) || 1));
  return `<div class="social-overview">${socialAvatarMarkup(profile.avatar, `${profile.displayName || 'Player'}’s avatar`)}<div class="social-overview-copy"><strong>${escapeHTML(profile.displayName || 'Wanderer')}${profile.masterCollector ? ' · ✦' : ''}</strong><span>Level ${level}${profile.masterCollector ? ' · Master Collector' : ''}</span></div>${socialOnlineMarkup(profile)}</div>`;
}
function socialSignalCopy(profile) {
  const signals = profile.signals || {};
  if (profile.accountType === 'simulated') return 'A cozy little room to browse';
  const bits = [];
  if (Number(signals.visitors) > 0) bits.push('Little footsteps have visited');
  if (Number(signals.likes) > 0) bits.push('A room visitors have loved');
  if (Number(signals.shopVisits) > 0) bits.push('A shop with curious visitors');
  if (Number(signals.eventParticipation) > 0) bits.push('Joined a little gathering');
  if (socialManager.online(profile)) bits.push('Freshly tended');
  return bits.slice(0, 2).join(' · ') || 'A quiet room waiting to be found';
}
function socialRoomCard(profile) {
  const masterCopy = profile.masterCollector ? ' · ✦ Master Collector' : '';
  const roomName = safeUserText(profile.room?.name, 'ROOM_NAME', 'A little room');
  return `<article class="social-room-card">${socialAvatarMarkup(profile.avatar, `${profile.displayName || 'Player'}’s portrait`)}<div class="social-room-copy"><strong>${escapeHTML(roomName)}</strong><span>${escapeHTML(profile.displayName || 'Wanderer')} · ${escapeHTML(profile.room?.themeName || 'Starter Room')}</span><span>Level ${Math.max(1, Math.floor(Number(profile.level) || 1))}${masterCopy} · ${Math.max(0, Math.floor(Number(profile.collectionCount) || 0))} finds</span><span class="social-signal-note">${escapeHTML(socialSignalCopy(profile))}</span></div><div class="social-actions"><button class="display-option" data-action="social-profile" data-player-uid="${escapeHTML(profile.uid || '')}">View profile</button><button class="button secondary" data-action="social-visit" data-room-uid="${escapeHTML(profile.uid || '')}">Visit room <span aria-hidden="true">→</span></button></div></article>`;
}
function socialPetSprite(petId) {
  return {
    mango: 'mango-frog-chunky.webp',
    beans: 'beans-cat-chunky.webp',
    trash: 'trash-raccoon-chunky.webp',
    luna: 'luna-moth-chunky.webp'
  }[petId] || 'companion.webp';
}
function socialRoomVignette(profile) {
  const room = profile.room || {};
  const pet = profile.pet;
  const petMarkup = pet ? `<div class="sim-room-pet"><img src="assets/${socialPetSprite(pet.id)}" alt="${escapeHTML(pet.name)} the ${escapeHTML(pet.species)}" /><span>${escapeHTML(pet.name)} · ${escapeHTML(pet.species)}</span></div>` : '<div class="sim-room-pet"><span>🐾</span><span>A little companion</span></div>';
  const wall = room.wallColor || '#d8bd91';
  const floor = room.floorColor || '#96694a';
  const roomName = safeUserText(room.name, 'ROOM_NAME', 'A little room');
  return `<section class="sim-room-vignette" style="--sim-wall:${escapeHTML(wall)};--sim-floor:${escapeHTML(floor)}" aria-label="${escapeHTML(roomName)}"><div class="sim-room-title"><span>⌂ ${escapeHTML(roomName)}</span><small>${escapeHTML(room.themeName || 'Starter Room')}</small></div><div class="sim-room-window" aria-hidden="true">✦ · ☾ · ✧</div><div class="sim-room-stage">${petMarkup}</div></section>`;
}
function socialIdentityMarkup(profile) {
  const master = profile.masterCollector || profile.badges?.some(badge => badge.id === MASTER_COLLECTOR_BADGE.id) ? '<span class="social-badge">✦ MASTER COLLECTOR</span>' : '';
  const achievements = (profile.collectionAchievements || []).slice(0, 4).map(label => `<span>${escapeHTML(label)}</span>`).join('');
  const favorites = (profile.favoriteItems || []).slice(0, 3);
  const favoriteMarkup = favorites.length ? `<p class="social-small-note">♡ Favorite finds · ${favorites.map(item => `${escapeHTML(item.emoji || '✦')} ${escapeHTML(item.name)}`).join(' · ')}</p>` : '<p class="social-small-note">♡ Favorite finds will appear as their collection grows.</p>';
  const collectionProgress = profile.accountType === 'simulated' ? `<span>📖 ${Math.max(0, Math.floor(Number(profile.collectionPercent) || 0))}% of open finds</span>` : '';
  const bio = profile.profileBio ? `<p class="social-profile-bio">“${escapeHTML(profile.profileBio)}”</p>` : '';
  return `<div class="social-identity">${socialAvatarMarkup(profile.avatar, `${profile.displayName || 'Player'}’s avatar`)}<div class="social-identity-copy"><strong>${escapeHTML(profile.displayName || 'Wanderer')}</strong><span>Level ${Math.max(1, Math.floor(Number(profile.level) || 1))} · ${Math.max(0, Math.floor(Number(profile.xp) || 0)).toLocaleString()} XP</span>${master}${socialOnlineMarkup(profile)}</div></div><div class="social-profile-meta"><span>📖 ${Math.max(0, Math.floor(Number(profile.collectionCount) || 0))} finds</span>${collectionProgress}${achievements}</div>${bio}${favoriteMarkup}`;
}
const SOCIAL_DISCOVERY_TABS = [['featured', 'Featured'], ['popular', 'Popular'], ['recent', 'Recently visited'], ['friends', 'Friends'], ['random', 'Random'], ['events', 'Events']];
function renderSocialDiscovery() {
  const tabs = SOCIAL_DISCOVERY_TABS.map(([id, label]) => `<button class="social-tab${socialState.tab === id ? ' selected' : ''}" data-action="social-tab" data-tab="${id}" aria-pressed="${socialState.tab === id}">${label}</button>`).join('');
  let profiles = [];
  let intro = '';
  if (socialState.tab === 'recent') {
    profiles = socialState.recent;
    intro = 'Rooms you have wandered through recently, kept just for you on this device.';
  } else if (socialState.tab === 'friends') {
    profiles = socialState.friends;
    intro = 'Your friends’ little corners are always close by.';
  } else if (socialState.tab === 'random') {
    profiles = [...socialState.directory].sort(() => Math.random() - 0.5).slice(0, 8);
    intro = 'A small, different handful of discoverable rooms, picked just for the joy of wandering.';
  } else if (socialState.tab === 'events') {
    return `<div class="social-subnav">${tabs}</div><p class="body-copy">A little calendar for shared Pocketwild moments.</p><article class="social-card"><strong>🌙 No gathering today</strong><p>When a seasonal event is underway, its rooms will gather here. Your ordinary adventures never wait on an event.</p></article>`;
  } else {
    profiles = [...socialState.directory];
    const activity = profile => {
      const signals = profile.signals || {};
      return Math.log1p(Number(signals.likes) || 0) * 2.1 + Math.log1p(Number(signals.visitors) || 0) * 1.3 + Math.log1p(Number(signals.shopVisits) || 0) * 1.15 + Math.min(5, Number(signals.eventParticipation) || 0) * 0.7;
    };
    if (socialState.tab === 'popular') {
      profiles.sort((a, b) => activity(b) - activity(a) || Number(b.lastSeenAt || 0) - Number(a.lastSeenAt || 0));
      intro = 'Rooms with a little recent visitor, like, shop, or gathering activity.';
    } else {
      profiles.sort((a, b) => Number(b.lastSeenAt || 0) - Number(a.lastSeenAt || 0));
      intro = 'A handpicked-feeling mix of fresh rooms and friendly activity.';
    }
  }
  return `<div class="social-subnav" aria-label="Room discovery tabs">${tabs}</div><p class="body-copy">${intro}</p>${socialState.loading ? '<div class="empty-note">Peeking through the little window…</div>' : `<div class="social-room-grid">${profiles.map(socialRoomCard).join('') || `<div class="empty-note">${socialState.tab === 'friends' ? 'Your friends’ rooms will be waiting here.' : socialState.tab === 'recent' ? 'Your first little visit will leave a breadcrumb here.' : 'No shared rooms just yet. You can keep your room private or invite a friend by name.'}</div>`}</div>`}`;
}
function renderSocialRequests() {
  const incoming = socialState.requests.incoming.map(request => `<article class="social-list-card">${socialOverviewMarkup({
    displayName: request.fromName || 'A Pocketwild player',
    avatar: request.fromAvatar,
    level: request.fromLevel,
    lastSeenAt: 0
  })}<div class="social-actions"><button class="display-option" data-action="social-accept" data-request-id="${escapeHTML(request.id)}">Accept</button><button class="display-option" data-action="social-decline" data-request-id="${escapeHTML(request.id)}">Not now</button></div></article>`).join('');
  const outgoing = socialState.requests.outgoing.map(request => `<div class="inventory-row"><span>Sent to ${escapeHTML(request.toName || 'a player')}</span><strong>Waiting for a hello</strong></div>`).join('');
  return `<p class="body-copy">Friend requests are always a choice. A declined request stays kind and quiet.</p><h3 class="social-inline-title">Waiting to meet you</h3><div class="social-list">${incoming || '<div class="empty-note">No new friend notes.</div>'}</div><h3 class="social-inline-title">Notes you sent</h3><div class="social-list">${outgoing || '<div class="empty-note">No requests waiting for a reply.</div>'}</div>`;
}
function socialRelationshipMarkup(profile) {
  if (profile.uid === socialManager.userId()) return '<span class="social-badge">YOUR ROOM</span>';
  const friend = socialState.friends.some(candidate => candidate.uid === profile.uid);
  const sent = socialState.requests.outgoing.some(request => request.toId === profile.uid);
  const received = socialState.requests.incoming.some(request => request.fromId === profile.uid);
  const friendAction = friend ? profile.accountType === 'simulated' ? `<button class="display-option" data-action="social-friend-remove" data-player-uid="${escapeHTML(profile.uid)}">Remove friend</button>` : `<button class="display-option" data-action="social-chat" data-friend-uid="${escapeHTML(profile.uid)}">Send a message</button>` : `<button class="display-option" data-action="social-friend-add-room" data-room-uid="${escapeHTML(profile.uid)}" ${sent || received ? 'disabled' : ''}>${profile.accountType === 'simulated' ? 'Add friend' : received ? 'They sent you a hello' : sent ? 'Request sent' : 'Send a friend hello'}</button>`;
  const likeButton = `<button class="display-option" data-action="social-like" data-room-uid="${escapeHTML(profile.uid)}" ${socialState.roomLiked ? 'disabled' : ''}>${socialState.roomLiked ? '♡ Room liked' : '♡ Like room'}</button>`;
  const collectionButton = `<button class="display-option" data-action="social-collection">View collection · ${Math.max(0, Number(profile.collectionCount) || 0)}</button>`;
  const shopButton = `<button class="display-option" data-action="social-shop">Visit shop</button>`;
  return `<div class="social-actions">${likeButton}${friendAction}${collectionButton}${shopButton}</div>${profile.accountType !== 'simulated' && !friend ? '<p class="social-small-note">Messages are just for friends. Send a hello first, then chat if you both choose.</p>' : ''}`;
}
function renderSocialProfile() {
  const profile = socialState.room;
  if (!profile) return '<div class="empty-note">That Pocketwild profile could not be found.</div>';
  const pet = profile.pet;
  const highlightRows = (profile.collectionHighlights || profile.favoriteItems || []).slice(0, 3).map(item => `<div class="inventory-row"><span>${escapeHTML(item.emoji || '✦')} ${escapeHTML(item.name)}</span><strong>${escapeHTML(item.rarity || 'Find')}</strong></div>`).join('');
  const petRow = pet ? `<div class="inventory-row"><span>🐾 Forever friend</span><strong>${escapeHTML(pet.name)} · ${escapeHTML(pet.species)}</strong></div>` : '<div class="inventory-row"><span>🐾 Forever friend</span><strong>A little friend is on the way</strong></div>';
  return `${socialIdentityMarkup(profile)}<div class="inventory-list">${petRow}<div class="inventory-row"><span>Favorite discovery</span><strong>${profile.favoriteDiscovery ? `${escapeHTML(profile.favoriteDiscovery.emoji)} ${escapeHTML(profile.favoriteDiscovery.name)}` : 'A find is still waiting'}</strong></div></div>${highlightRows ? `<h3 class="social-inline-title">A few favorite pages</h3><div class="inventory-list">${highlightRows}</div>` : ''}<button class="button primary wide" data-action="social-visit" data-room-uid="${escapeHTML(profile.uid)}" data-return-view="profile">Visit ${escapeHTML(profile.displayName || 'their')}’s room <span aria-hidden="true">→</span></button>${socialRelationshipMarkup(profile)}`;
}
function renderSocialRoom() {
  const profile = socialState.room;
  if (!profile) return '<div class="empty-note">That room could not be found. It may have gone private.</div>';
  const pet = profile.pet;
  const petCopy = pet ? `${escapeHTML(pet.name)} keeps close to ${escapeHTML(profile.displayName || 'their friend')}.` : 'A little companion is on the way.';
  const roomName = safeUserText(profile.room?.name, 'ROOM_NAME', 'A little room');
  return `${socialIdentityMarkup(profile)}<div class="social-card"><div class="social-room-heading"><span>THEIR LITTLE WORLD</span><strong>${escapeHTML(roomName)}</strong><small>${escapeHTML(profile.room?.themeName || 'Starter Room')} · ${escapeHTML(socialSignalCopy(profile))}</small></div>${socialRoomVignette(profile)}<p class="social-small-note">🐾 ${petCopy}</p></div>${socialRelationshipMarkup(profile)}`;
}
function renderSocialCollection() {
  const profile = socialState.room;
  const items = (profile?.collection || []).map(id => ITEM_CATALOG[id]).filter(Boolean);
  const rows = items.slice(0, 60).map(item => `<div class="inventory-row"><span>${escapeHTML(item.emoji)} ${escapeHTML(item.name)}</span><strong>${escapeHTML(item.rarity)}</strong></div>`).join('');
  return `<p class="body-copy">A peek at the finds ${escapeHTML(profile?.displayName || 'your friend')} has written into their journal.</p><div class="social-profile-meta"><span>${items.length} discoveries shown</span>${(profile?.collectionAchievements || []).map(badge => `<span>${escapeHTML(badge)}</span>`).join('')}</div><div class="inventory-list">${rows || '<div class="empty-note">Their journal is waiting for its first little find.</div>'}</div>`;
}
function renderSocialShop() {
  const profile = socialState.room;
  const shop = profile?.shop;
  const offers = (shop?.offers || []).map(offer => `<article class="shop-offer"><div class="shop-offer-heading"><span class="shop-item-icon" aria-hidden="true">${escapeHTML(offer.emoji || '✦')}</span><div><span class="shop-offer-type">${offer.currency === 'stardust' ? 'STARDUST KEEPSAKE' : 'GOLD · VISITOR STOCK'}</span><strong>${escapeHTML(offer.name)}</strong></div></div><p>${escapeHTML(offer.description || 'A little something for your room.')}</p><div class="shop-offer-footer"><span>On the room’s shelf</span><strong>${offer.currency === 'stardust' ? `${Math.max(0, Number(offer.price) || 0)} ✧` : `${Math.max(0, Number(offer.price) || 0)}g`}</strong></div></article>`).join('');
  return `<p class="body-copy">A quiet look around ${escapeHTML(profile?.displayName || 'your friend')}’s room shop.</p><div class="shop-sign"><span>ROOM SHOP · A LITTLE SHELF TO BROWSE</span><h3>${escapeHTML(shop?.name || 'A cozy little shop')}</h3><p>Room keepsakes and visitor stock, gathered close to home.</p></div><div class="shop-stock">${offers || '<div class="empty-note">This shop is still arranging its little shelf.</div>'}</div><p class="shop-footnote">Browsing is just for fun. There are no purchases or player trades in this visit.</p>`;
}
function renderSocialChat() {
  const friend = socialState.chatFriend;
  if (!friend) return '<div class="empty-note">Choose a friend to start a little chat.</div>';
  const messages = socialState.messages.map(message => `<div class="social-message${message.authorId === socialManager.userId() ? ' mine' : ''}">${escapeHTML(message.text)}<small>${escapeHTML(message.authorName || 'A friend')}</small></div>`).join('');
  return `${socialOverviewMarkup(friend)}<div class="social-message-list" aria-live="polite">${messages || '<div class="empty-note">A fresh little conversation. Say hello whenever you like.</div>'}</div><form class="social-form" data-social-form="message"><input class="name-input" name="message" maxlength="300" required autocomplete="off" placeholder="Write a little note…" aria-label="Message" /><button class="button primary" type="submit">Send</button></form>`;
}
function renderSocialNotifications() {
  const iconFor = {
    'room-like': '♡',
    message: '✉',
    'friend-accepted': '✦'
  };
  const copyFor = note => note.type === 'room-like' ? `${note.actorName || 'A visitor'} liked your room.` : note.type === 'message' ? `${note.actorName || 'A friend'} sent you a message: “${note.preview || ''}”` : `${note.actorName || 'A player'} accepted your friend request.`;
  const rows = socialState.notifications.map(note => `<article class="social-note-row${note.read ? '' : ' unread'}"><span aria-hidden="true">${iconFor[note.type] || '✦'}</span><p>${escapeHTML(copyFor(note))}</p></article>`).join('');
  return `<p class="body-copy">Friend hellos, room likes, and messages stay in one quiet corner.</p><div class="notification-list">${rows || '<div class="empty-note">No social notes yet. Nothing will interrupt your wandering.</div>'}</div>`;
}
function renderSocialContent() {
  const user = playerSaveManager.getStatus().user;
  const disclosure = '<article class="social-card simulated-disclosure"><strong>✦ A little note about Discovery</strong><p>Some Pocketwild profiles are locally generated while online player discovery is in development. Their rooms and friend saves stay on this device; simulated profiles cannot chat or trade.</p></article>';
  if (socialState.view === 'discover') return `${renderSocialDiscovery()}${disclosure}`;
  if (socialState.view === 'profile') return `${renderSocialProfile()}${socialState.room?.accountType === 'simulated' ? disclosure : ''}`;
  if (socialState.view === 'room') return `${renderSocialRoom()}${socialState.room?.accountType === 'simulated' ? disclosure : ''}`;
  if (socialState.view === 'room-collection') return `${renderSocialCollection()}${socialState.room?.accountType === 'simulated' ? disclosure : ''}`;
  if (socialState.view === 'shop') return `${renderSocialShop()}${socialState.room?.accountType === 'simulated' ? disclosure : ''}`;
  if (socialState.view === 'friends') {
    const friendRows = socialState.friends.map(friend => `<article class="social-list-card">${socialOverviewMarkup(friend)}<div class="social-actions"><button class="display-option" data-action="social-profile" data-player-uid="${escapeHTML(friend.uid)}">Profile</button><button class="display-option" data-action="social-visit" data-room-uid="${escapeHTML(friend.uid)}">Visit room</button>${friend.accountType === 'simulated' ? `<button class="display-option" data-action="social-friend-remove" data-player-uid="${escapeHTML(friend.uid)}">Remove friend</button>` : `<button class="display-option" data-action="social-chat" data-friend-uid="${escapeHTML(friend.uid)}">Message</button>`}</div></article>`).join('');
    const searchRows = socialState.searchResults.map(profile => {
      const isFriend = socialState.friends.some(friend => friend.uid === profile.uid);
      const sent = socialState.requests.outgoing.some(request => request.toId === profile.uid);
      const received = socialState.requests.incoming.some(request => request.fromId === profile.uid);
      const friendLabel = isFriend ? 'Already friends' : profile.accountType === 'simulated' ? 'Add friend' : received ? 'They sent you a hello' : sent ? 'Request sent' : 'Send a friend hello';
      return `<article class="social-list-card">${socialOverviewMarkup(profile)}<div class="social-actions"><button class="display-option" data-action="social-add-friend" data-player-uid="${escapeHTML(profile.uid)}" ${isFriend || received || sent ? 'disabled' : ''}>${friendLabel}</button><button class="display-option" data-action="social-profile" data-player-uid="${escapeHTML(profile.uid)}">View profile</button><button class="display-option" data-action="social-visit" data-room-uid="${escapeHTML(profile.uid)}">Visit room</button></div></article>`;
    }).join('');
    return `<p class="body-copy">Friends are the people whose rooms you choose to keep close. Find someone lovely, peek at their profile, then visit their little room.</p><form class="social-form" data-social-form="search"><input id="social-player-search" class="name-input" name="name" maxlength="20" required minlength="2" autocapitalize="none" autocomplete="off" placeholder="Find a player by name" aria-label="Find a player by name" /><button class="button primary" type="submit">Find</button></form>${searchRows ? `<h3 class="social-inline-title">Players you found</h3><div class="social-list">${searchRows}</div>` : ''}<h3 class="social-inline-title">Your friends · ${socialState.friends.length}</h3><div class="social-list">${friendRows || '<div class="empty-note">No friends here yet. Try a name above or wander through Discovery.</div>'}</div>${user ? `<button class="button secondary wide" data-action="social-open-requests">Friend requests · ${socialState.requests.incoming.length}</button>` : ''}${socialState.friends.some(friend => friend.accountType === 'simulated') || socialState.searchResults.some(profile => profile.accountType === 'simulated') ? disclosure : ''}`;
  }
  if (socialState.view === 'requests') return user ? renderSocialRequests() : `${disclosure}<p class="body-copy">Friend requests from real players need an account. You can still discover and keep simulated Pocketwild friends here.</p><button class="button primary wide" data-action="open-account">Connect an account</button>`;
  if (socialState.view === 'messages') return user ? (() => {
    const threads = socialState.friends.filter(friend => friend.accountType !== 'simulated').map(friend => {
      const thread = socialState.threads.find(entry => (entry.members || []).includes(friend.uid));
      return `<article class="social-list-card">${socialOverviewMarkup(friend)}<p class="social-small-note">${thread ? `${thread.lastSenderId === socialManager.userId() ? 'You: ' : ''}${escapeHTML(thread.lastMessage || 'Say hello whenever you like.')}` : 'A fresh conversation, ready when you are.'}</p><div class="social-actions"><button class="display-option" data-action="social-chat" data-friend-uid="${escapeHTML(friend.uid)}">Open chat</button></div></article>`;
    }).join('');
    return `<p class="body-copy">Messages are private between you and your real Pocketwild friends. Simulated profiles do not send messages.</p><div class="social-list">${threads || '<div class="empty-note">Your inbox is quiet. Real-player messages will appear here when available.</div>'}</div>`;
  })() : `${disclosure}<p class="body-copy">Messages are for real Pocketwild friends and need an account. Your simulated friends are here for room visits and collection browsing.</p><button class="button primary wide" data-action="open-account">Connect an account</button>`;
  if (socialState.view === 'chat') return renderSocialChat();
  if (socialState.view === 'notifications') return user ? renderSocialNotifications() : `${disclosure}<p class="body-copy">Social notes from real players are available when you connect an account.</p>`;
  const ownProfile = publicPlayerProfile();
  const unreadNotes = socialState.notifications.filter(note => !note.read).length;
  const unreadMessages = socialState.threads.filter(thread => thread.lastSenderId !== socialManager.userId()).length;
  const discoverable = user ? socialManager.preferences().discoverable : false;
  const socialMenu = user ? `<button class="phone-app" data-action="social-open-messages"><span class="phone-app-icon">✉</span><span class="phone-app-label">Messages</span><span class="phone-app-detail">${unreadMessages ? `${unreadMessages} new conversation${unreadMessages === 1 ? '' : 's'}` : 'Only from real friends'}</span></button><button class="phone-app" data-action="social-open-notifications"><span class="phone-app-icon">✦</span><span class="phone-app-label">Social notes</span><span class="phone-app-detail">${unreadNotes ? `${unreadNotes} new note${unreadNotes === 1 ? '' : 's'}` : 'Room likes & hellos'}</span></button>` : '';
  return `${socialIdentityMarkup(ownProfile)}<p class="body-copy">Your little world is yours first. Discover cozy rooms, keep a few Pocketwild friends close, or simply wander on by.</p>${!user ? disclosure : `<div class="social-switch-row"><div class="social-switch-copy"><strong>Share my room in Discovery</strong><small>${discoverable ? 'Other signed-in players can find your room. You can turn this off any time.' : 'Your room stays out of discovery until you choose to share it.'}</small></div><button class="social-toggle" data-action="social-toggle-discovery" aria-pressed="${discoverable}">${discoverable ? 'Sharing' : 'Private'}</button></div>`}<div class="social-menu"><button class="phone-app" data-action="social-open-discover"><span class="phone-app-icon">⌂</span><span class="phone-app-label">Discover rooms</span><span class="phone-app-detail">Featured · Recently visited</span></button><button class="phone-app" data-action="social-open-friends"><span class="phone-app-icon">♡</span><span class="phone-app-label">Friends & rooms</span><span class="phone-app-detail">${socialState.friends.length} friends · ${user ? `${socialState.requests.incoming.length} waiting` : 'Saved on this device'}</span></button>${socialMenu}</div>${user ? `<p class="social-small-note">Discovery can include real signed-in players and locally generated Pocketwild profiles. Simulated profiles never create Firebase accounts.</p>` : '<button class="button secondary wide" data-action="open-account">Connect an account for real-player features</button>'}`;
}
async function loadSocialOverview({
  directory = false
} = {}) {
  const user = playerSaveManager.getStatus().user;
  socialState.loading = true;
  socialState.error = '';
  renderUI();
  try {
    socialState.friends = await socialPlayerService.friends();
    if (!user) {
      socialState.requests = {
        incoming: [],
        outgoing: []
      };
      socialState.notifications = [];
      socialState.threads = [];
      if (directory || !socialState.directory.length) socialState.directory = await socialPlayerService.directory();
      if (socialState.tab === 'recent') socialState.recent = await socialPlayerService.recentRooms();
    } else {
      await socialManager.initialize();
      if (socialManager.preferences().discoverable) {
        socialManager.startPresence(publicPlayerProfile);
        await socialManager.publishProfile(publicPlayerProfile(), true);
      } else {
        socialManager.stopPresence();
      }
      const [friends, requests, notifications, threads] = await Promise.all([socialManager.friends(), socialManager.requests(), socialManager.socialNotifications(), socialManager.threads()]);
      socialState.friends = [...simulatedPlayerManager.friends(socialPlayerService.viewerKey()), ...friends.map(profile => ({
        ...profile,
        accountType: 'real'
      }))];
      socialState.requests = requests;
      socialState.notifications = notifications;
      if (socialState.view === 'notifications') {
        const unread = notifications.filter(note => !note.read);
        if (unread.length) {
          await socialManager.markNotificationsRead(unread);
          socialState.notifications = notifications.map(note => ({
            ...note,
            read: true
          }));
        }
      }
      socialState.threads = threads;
      if (directory) socialState.directory = await socialPlayerService.directory();
      if (socialState.tab === 'recent') socialState.recent = await socialPlayerService.recentRooms();
    }
  } catch (error) {
    socialState.error = error?.message || 'The social window is having a quiet moment. Your local Pocketwild friends are still safe.';
    socialState.friends = await socialPlayerService.friends();
    if (directory && !socialState.directory.length) socialState.directory = await socialPlayerService.directory();
  } finally {
    socialState.loading = false;
    renderUI();
  }
}
async function loadSocialTab(tab) {
  if (!SOCIAL_DISCOVERY_TABS.some(([id]) => id === tab)) return;
  socialState.tab = tab;
  socialState.view = 'discover';
  socialState.error = '';
  socialState.loading = true;
  renderUI();
  try {
    if (tab === 'featured' || tab === 'popular' || tab === 'random') socialState.directory = await socialPlayerService.directory();
    if (tab === 'recent') socialState.recent = await socialPlayerService.recentRooms();
    if (tab === 'friends') socialState.friends = await socialPlayerService.friends();
  } catch (error) {
    socialState.error = error?.message || 'Those little rooms could not be reached just now.';
    socialState.directory = socialState.directory.length ? socialState.directory : simulatedPlayerManager.listPlayers();
  } finally {
    socialState.loading = false;
    renderUI();
  }
}
function availableMarketItems(mode) {
  return Object.values(ITEM_CATALOG).filter(item => {
    if (!item.expansion?.tradeEligible || !state.world.collection.includes(item.id)) return false;
    const owned = state.world.inventory[item.id] || 0;
    if (!owned) return false;
    if (mode === 'fixed') {
      const commonRaw = item.rarity === 'Common' && ECONOMY_CONFIG.marketplace.commonRawItemIds.includes(item.id);
      const uncommonRaw = item.rarity === 'Uncommon' && ['Materials', 'Fungi'].includes(item.category);
      return item.expansion.marketplaceEligible && (commonRaw || uncommonRaw);
    }
    if (mode === 'auction') return item.expansion.marketplaceEligible && ECONOMY_CONFIG.marketplace.auctionRarities.includes(item.rarity);
    return true;
  }).sort((a, b) => a.name.localeCompare(b.name));
}
function marketItemOptions(mode, selected = '') {
  const items = availableMarketItems(mode);
  return `<option value="">${items.length ? 'Choose a discovered find…' : 'No eligible discovered items in your bag'}</option>${items.map(item => `<option value="${item.id}" ${selected === item.id ? 'selected' : ''}>${escapeHTML(item.emoji)} ${escapeHTML(item.name)} · ×${state.world.inventory[item.id]}</option>`).join('')}`;
}
function marketOfferCopy(offer) {
  const parts = [];
  const item = offer?.itemId ? ITEM_CATALOG[offer.itemId] : null;
  const quantity = Math.max(0, Math.floor(Number(offer?.quantity) || 0));
  const gold = Math.max(0, Math.floor(Number(offer?.gold) || 0));
  if (item && quantity) parts.push(`${item.emoji} ${item.name} ×${quantity}`);
  if (gold) parts.push(`🪙 ${gold.toLocaleString()} Gold`);
  return parts.length ? parts.map(escapeHTML).join(' + ') : 'No offer set yet';
}
function marketListingCard(listing, own = false) {
  const item = ITEM_CATALOG[listing.itemId];
  if (!item) return '';
  const isAuction = listing.kind === 'auction';
  const expiry = isAuction ? Number(listing.endsAtMs) || 0 : Number(listing.expiresAtMs) || 0;
  const timeKind = isAuction ? 'market-auction' : 'market-listing';
  const timeCopy = expiry > Date.now() ? `<span data-countdown-at="${expiry}" data-countdown-kind="${timeKind}">${formatCountdown(expiry - Date.now())}</span>` : 'Ended';
  const known = state.world.collection.includes(item.id);
  const stock = Math.max(0, Math.floor(Number(listing.remainingQuantity ?? listing.quantity) || 0));
  const limit = ECONOMY_CONFIG.marketplace.dailyInstantBuyLimits[item.rarity] || 0;
  const used = Math.max(0, Number(marketplaceState.dailyCounts[item.id]) || 0);
  const capRemaining = Math.max(0, limit - used);
  const bidderIsMe = listing.highestBidderUid === playerSaveManager.getStatus().user?.uid;
  const stateCopy = listing.state === 'sold' ? 'Completed' : listing.state === 'cancelled' ? 'Cancelled' : expiry <= Date.now() ? 'Ended · awaiting close' : 'Open';
  let actionMarkup = '';
  if (own) {
    const dueToCollect = marketplaceState.proceeds.find(entry => entry.listingId === listing.id);
    const sellerAuctionNote = isAuction && listing.state === 'open' && listing.highestBid > 0 ? `<p class="market-gold-note">${expiry <= Date.now() ? 'Auction ended · waiting for the leading player to claim.' : 'A bid is in · this auction cannot be cancelled.'}</p>` : '';
    actionMarkup = `${dueToCollect ? `<div class="market-actions"><button class="display-option" data-action="market-claim-proceeds" data-id="${escapeHTML(dueToCollect.id)}">Collect ${Number(dueToCollect.amount || 0).toLocaleString()}g</button></div>` : ''}${listing.state === 'open' && (!isAuction || !listing.highestBid) ? `<div class="market-actions"><button class="display-option" data-action="market-cancel-listing" data-id="${escapeHTML(listing.id)}">Cancel & return remaining items</button></div>` : ''}${sellerAuctionNote}`;
  } else if (isAuction) {
    if (listing.state === 'open' && expiry <= Date.now() && bidderIsMe) {
      actionMarkup = `<div class="market-actions"><button class="button primary wide" data-action="market-claim-auction" data-id="${escapeHTML(listing.id)}">Claim your auction find · ${Number(listing.highestBid || 0).toLocaleString()}g</button></div>`;
    } else if (listing.state === 'open' && expiry > Date.now()) {
      const topBid = Math.max(0, Number(listing.highestBid) || 0);
      const minimum = topBid > 0 ? topBid + Math.max(1, Math.ceil(topBid * 0.05)) : Number(listing.startingBid) || 1;
      actionMarkup = known ? `<form class="market-buy-form" data-market-form="bid" data-listing-id="${escapeHTML(listing.id)}"><label class="market-control-label">Your Gold bid<input class="market-control" name="amount" type="number" min="${minimum}" step="1" inputmode="numeric" required value="${minimum}" aria-label="Gold bid, minimum ${minimum}" /></label><button class="button primary" type="submit">Place bid</button></form>` : '<p class="market-gold-note">Discover this find on an outing before bidding. Rare pages belong in your journal first.</p>';
    } else {
      actionMarkup = `<p class="market-gold-note">${bidderIsMe ? 'Your Gold is safely held while you claim your win.' : 'This auction has ended.'}</p>`;
    }
  } else {
    actionMarkup = known && capRemaining > 0 && stock > 0 ? `<form class="market-buy-form" data-market-form="buy" data-listing-id="${escapeHTML(listing.id)}"><label class="market-control-label">Pieces <input class="market-control" name="quantity" type="number" min="1" max="${Math.min(stock, capRemaining)}" step="1" inputmode="numeric" value="1" required aria-label="Quantity to buy" /></label><button class="button primary" type="submit">Buy · ${Number(listing.unitPrice || 0).toLocaleString()}g each</button></form><p class="market-gold-note">Daily instant shelf · ${capRemaining} of ${limit} pieces left for this find.</p>` : !known ? '<p class="market-gold-note">Discover this find on an outing before buying it. The market will not skip your collection.</p>' : '<p class="market-gold-note">Daily limit reached, or this shelf is out of stock.</p>';
  }
  const reportControls = own ? '' : `<div class="market-actions"><button class="display-option" data-action="market-report-listing" data-id="${escapeHTML(listing.id)}">Report</button><button class="display-option" data-action="market-block-player" data-player-uid="${escapeHTML(listing.sellerUid)}">Block seller</button></div>`;
  const price = isAuction ? `${Number(listing.highestBid || 0).toLocaleString()}g${listing.highestBid ? ' · leading bid' : ` · starts ${Number(listing.startingBid || 0).toLocaleString()}g`}` : `${Number(listing.unitPrice || 0).toLocaleString()}g each`;
  const badge = isAuction ? 'AUCTION · GOLD HELD WHILE BIDDING' : 'FIXED PRICE · INSTANT BUY';
  return `<article class="market-card"><div class="market-card-head"><span class="market-item-icon" aria-hidden="true">${escapeHTML(item.emoji)}</span><div class="market-item-copy"><strong>${escapeHTML(item.name)} ×${stock}</strong><small>${escapeHTML(item.category)} · ${escapeHTML(item.rarity)} · ${own ? 'Your listing' : `by ${escapeHTML(listing.sellerName || 'Wanderer')}`}</small></div><span class="market-price">${price}</span></div><div class="market-meta"><span class="market-badge${isAuction ? ' auction' : ''}">${badge}</span><span>${own ? stateCopy : `${isAuction ? 'Closes' : 'Expires'} · ${timeCopy}`}</span>${isAuction && listing.highestBidderName ? `<span>Leading · ${escapeHTML(listing.highestBidderName)}</span>` : ''}${isAuction && listing.highestBidderUid === playerSaveManager.getStatus().user?.uid && expiry > Date.now() ? '<span>Your bid is leading · funds held</span>' : ''}</div>${actionMarkup}${reportControls}</article>`;
}
function renderMarketFilters() {
  const categories = [...new Set(marketplaceState.listings.map(listing => listing.category).filter(Boolean))].sort();
  const rarities = [...new Set(marketplaceState.listings.map(listing => listing.rarity).filter(Boolean))].sort((a, b) => (RARITY_ORDER[a] || 0) - (RARITY_ORDER[b] || 0));
  return `<form class="market-filters" data-market-form="filter"><label class="market-control-label">Search players’ shelves<input class="market-control" name="search" type="search" maxlength="60" value="${escapeHTML(marketplaceState.search)}" placeholder="Find a little something…" /></label><div class="market-filter-grid"><label class="market-control-label">Category<select class="market-control" name="category"><option value="all">All categories</option>${categories.map(category => `<option value="${escapeHTML(category)}" ${marketplaceState.category === category ? 'selected' : ''}>${escapeHTML(category)}</option>`).join('')}</select></label><label class="market-control-label">Rarity<select class="market-control" name="rarity"><option value="all">All rarities</option>${rarities.map(rarity => `<option value="${escapeHTML(rarity)}" ${marketplaceState.rarity === rarity ? 'selected' : ''}>${escapeHTML(rarity)}</option>`).join('')}</select></label></div><div class="market-filter-grid"><label class="market-control-label">Price / time<select class="market-control" name="sort"><option value="newest" ${marketplaceState.sort === 'newest' ? 'selected' : ''}>Newest first</option><option value="price-low" ${marketplaceState.sort === 'price-low' ? 'selected' : ''}>Lowest price</option><option value="price-high" ${marketplaceState.sort === 'price-high' ? 'selected' : ''}>Highest price</option></select></label><button class="button secondary" type="submit">Filter shelves</button></div></form>`;
}
function renderMarketBrowse() {
  const search = marketplaceState.search.trim().toLocaleLowerCase();
  const listings = marketplaceState.listings.filter(listing => {
    const item = ITEM_CATALOG[listing.itemId];
    if (!item) return false;
    return (!search || `${item.name} ${listing.sellerName || ''} ${item.category}`.toLocaleLowerCase().includes(search)) && (marketplaceState.category === 'all' || listing.category === marketplaceState.category) && (marketplaceState.rarity === 'all' || listing.rarity === marketplaceState.rarity);
  }).sort((a, b) => {
    if (marketplaceState.sort === 'price-low') return (Number(a.unitPrice || a.highestBid || a.startingBid) || 0) - (Number(b.unitPrice || b.highestBid || b.startingBid) || 0);
    if (marketplaceState.sort === 'price-high') return (Number(b.unitPrice || b.highestBid || b.startingBid) || 0) - (Number(a.unitPrice || a.highestBid || a.startingBid) || 0);
    return Number(b.createdAt || 0) - Number(a.createdAt || 0);
  });
  const fixedCount = listings.filter(entry => entry.kind === 'fixed').length;
  return `<p class="body-copy">Common raw finds use small, daily-capped instant shelves. Rare finds go to auction; friends can make exact, confirmed swaps. Your journal unlocks every purchase.</p>${renderMarketFilters()}<div class="market-meta"><span>🪙 ${currencyBalance('gold').toLocaleString()} Gold</span><span>${fixedCount} instant shelves · ${listings.length - fixedCount} auctions</span></div><div class="market-list">${marketplaceState.loading ? '<div class="market-empty">Opening the market window…</div>' : listings.map(listing => marketListingCard(listing)).join('') || '<div class="market-empty">No matching finds on the shelves just now. Gather a little, then leave a listing when you are ready.</div>'}</div>`;
}
function renderMarketSell() {
  const mode = marketplaceState.sellMode;
  const items = availableMarketItems(mode);
  const selected = items.find(entry => entry.id === marketplaceState.sellItemId)?.id || items[0]?.id || '';
  const item = selected ? ITEM_CATALOG[selected] : null;
  const quantity = item ? state.world.inventory[item.id] || 0 : 0;
  const modeButtons = `<div class="market-actions"><button class="market-tab${mode === 'fixed' ? ' selected' : ''}" type="button" data-action="market-sell-mode" data-mode="fixed">Instant shelf</button><button class="market-tab${mode === 'auction' ? ' selected' : ''}" type="button" data-action="market-sell-mode" data-mode="auction">Auction</button></div>`;
  if (mode === 'fixed') {
    const hasEligible = items.length > 0;
    return `<p class="body-copy">Put a few spare raw finds on a fixed-price shelf. A buyer’s Gold is held during the same secure transfer; unsold pieces return when you cancel.</p><div class="market-lock-note">Common raw purchases are limited to 3 pieces per find per 24 hours. Uncommon raw buys have a gentler 8-piece limit. Prices are set by players, not an NPC.</div>${modeButtons}<form class="market-form" data-market-form="create-fixed"><label class="market-control-label">Discovered raw find<select class="market-control" name="itemId" required>${marketItemOptions('fixed', selected)}</select></label><div class="market-filter-grid"><label class="market-control-label">Quantity · up to ${Math.min(quantity, 99)}<input class="market-control" name="quantity" type="number" min="1" max="${Math.min(quantity, 99)}" value="1" inputmode="numeric" required ${hasEligible ? '' : 'disabled'} /></label><label class="market-control-label">Gold each<input class="market-control" name="price" type="number" min="1" max="999999" value="${item ? Math.max(1, (ECONOMY_CONFIG.npcBuybackGold[item.id] || 2) * 2) : 1}" inputmode="numeric" required ${hasEligible ? '' : 'disabled'} /></label></div><label class="market-control-label">Shelf duration<select class="market-control" name="durationMs"><option value="86400000">1 day</option><option value="259200000">3 days</option><option value="604800000">7 days</option></select></label><button class="button primary wide" type="submit" ${hasEligible ? '' : 'disabled'}>List the find · safely set aside</button></form>${hasEligible ? '' : '<div class="market-empty">You need a discovered, player-tradable common or uncommon raw find in your bag before you can list one.</div>'}`;
  }
  return `<p class="body-copy">Rare finds are sold to the highest confirmed bid. Your item is set aside while the auction runs. Bids are Gold-backed and cannot be cancelled once placed.</p>${modeButtons}<form class="market-form" data-market-form="create-auction"><label class="market-control-label">Discovered rare find<select class="market-control" name="itemId" required>${marketItemOptions('auction', selected)}</select></label><div class="market-filter-grid"><label class="market-control-label">Lot quantity · up to ${Math.min(quantity, 20)}<input class="market-control" name="quantity" type="number" min="1" max="${Math.min(quantity, 20)}" value="1" inputmode="numeric" required ${items.length ? '' : 'disabled'} /></label><label class="market-control-label">Starting bid · Gold<input class="market-control" name="startingBid" type="number" min="1" max="999999999" value="1" inputmode="numeric" required ${items.length ? '' : 'disabled'} /></label></div><label class="market-control-label">Auction duration<select class="market-control" name="durationMs"><option value="3600000">1 hour</option><option value="21600000">6 hours</option><option value="86400000" selected>1 day</option><option value="259200000">3 days</option><option value="604800000">7 days</option></select></label><button class="button primary wide" type="submit" ${items.length ? '' : 'disabled'}>Start a rare-find auction</button></form>${items.length ? '' : '<div class="market-empty">A rare, super rare, or ultra rare discovery in your bag is needed before starting an auction.</div>'}`;
}
function renderMarketMine() {
  const own = marketplaceState.myListings.map(listing => marketListingCard(listing, true)).join('');
  const proceeds = marketplaceState.proceeds.map(entry => {
    const listing = marketplaceState.myListings.find(row => row.id === entry.listingId);
    const name = listing?.itemName || 'Market sale';
    return `<article class="market-card"><div class="market-card-head"><span class="market-item-icon">🪙</span><div class="market-item-copy"><strong>${escapeHTML(name)} · proceeds</strong><small>Gold is held separately until you collect it.</small></div><span class="market-price">${Number(entry.amount || 0).toLocaleString()}g</span></div><div class="market-actions"><button class="display-option" data-action="market-claim-proceeds" data-id="${escapeHTML(entry.id)}">Collect proceeds</button></div></article>`;
  }).join('');
  const holds = marketplaceState.bidHolds.map(entry => {
    const listing = entry.listing;
    const stillLeading = listing?.state === 'open' && listing.highestBidderUid === playerSaveManager.getStatus().user?.uid;
    const won = stillLeading && listing.endsAtMs <= Date.now();
    const status = won ? 'Auction won · ready to claim' : stillLeading ? 'Leading · Gold is held safely' : 'Outbid · Gold can be returned';
    const button = won ? `<button class="display-option" data-action="market-claim-auction" data-id="${escapeHTML(entry.id)}">Claim item</button>` : !stillLeading ? `<button class="display-option" data-action="market-claim-bid-refund" data-id="${escapeHTML(entry.id)}">Return ${Number(entry.amount || 0).toLocaleString()}g</button>` : '';
    return `<article class="market-card"><div class="market-card-head"><span class="market-item-icon">${escapeHTML(ITEM_CATALOG[entry.itemId]?.emoji || '🔨')}</span><div class="market-item-copy"><strong>${escapeHTML(listing?.itemName || ITEM_CATALOG[entry.itemId]?.name || 'Auction bid')}</strong><small>${escapeHTML(status)}</small></div><span class="market-price">${Number(entry.amount || 0).toLocaleString()}g</span></div>${button ? `<div class="market-actions">${button}</div>` : ''}</article>`;
  }).join('');
  return `<p class="body-copy">Your escrowed listings, collected proceeds, and protected auction bids.</p><h3 class="market-owner-label">Your shelves & auctions</h3><div class="market-list">${own || '<div class="market-empty">You do not have any live or recent listings yet.</div>'}</div><h3 class="market-owner-label">Gold ready to collect</h3><div class="market-list">${proceeds || '<div class="market-empty">Completed sales leave their Gold here until you collect it.</div>'}</div><h3 class="market-owner-label">Your auction holds</h3><div class="market-list">${holds || '<div class="market-empty">Any bid Gold stays visibly held until you win or are outbid.</div>'}</div>`;
}
function renderTradeCard(trade) {
  const uid = playerSaveManager.getStatus().user?.uid;
  const side = trade.memberIds?.[0] === uid ? 'a' : 'b';
  const otherSide = side === 'a' ? 'b' : 'a';
  const friendUid = trade.memberIds?.find(member => member !== uid);
  const friend = marketplaceState.friends.find(entry => entry.uid === friendUid);
  const friendName = friend?.displayName || trade.memberNames?.[otherSide] || 'Pocketwild friend';
  const ownOffer = trade.offers?.[side] || {};
  const theirOffer = trade.offers?.[otherSide] || {};
  const revision = Number(trade.revision) || 1;
  const confirmed = trade.confirmed?.[side] === revision;
  const otherConfirmed = trade.confirmed?.[otherSide] === revision;
  const ownItems = availableMarketItems('trade');
  let controls = '';
  if (trade.state === 'open' && !trade.blocked) {
    controls = `<form class="market-form" data-market-form="update-trade" data-trade-id="${escapeHTML(trade.id)}"><span class="market-control-label">Change your offer · this clears both confirmations</span><select class="market-control" name="itemId"><option value="">Gold only / no item</option>${ownItems.map(item => `<option value="${item.id}" ${ownOffer.itemId === item.id ? 'selected' : ''}>${escapeHTML(item.emoji)} ${escapeHTML(item.name)} · have ${state.world.inventory[item.id] || 0}</option>`).join('')}</select><div class="market-filter-grid"><label class="market-control-label">Item quantity<input class="market-control" name="quantity" type="number" min="0" max="99" value="${ownOffer.itemId ? Number(ownOffer.quantity) || 1 : 0}" inputmode="numeric" /></label><label class="market-control-label">Gold<input class="market-control" name="gold" type="number" min="0" max="999999999" value="${Number(ownOffer.gold) || 0}" inputmode="numeric" /></label></div><button class="button secondary wide" type="submit">Set aside this exact offer</button></form><div class="market-confirm-line${confirmed ? '' : ' waiting'}">${confirmed ? '✓ You confirmed these exact terms.' : 'Your confirmation is not set for this version.'} ${otherConfirmed ? '✓ Your friend confirmed.' : 'Waiting for your friend to confirm.'}</div>${trade.escrowed?.a && trade.escrowed?.b ? `<div class="market-actions"><button class="button primary wide" data-action="market-confirm-trade" data-id="${escapeHTML(trade.id)}">${confirmed ? 'Confirmed · waiting for your friend' : 'Final confirm exact exchange'}</button></div>` : '<p class="market-gold-note">Both players set aside an offer before either can confirm.</p>'}<div class="market-actions"><button class="display-option" data-action="market-cancel-trade" data-id="${escapeHTML(trade.id)}">Cancel trade</button></div>`;
  } else if (trade.state === 'locked') {
    const claimed = Boolean(trade.claimed?.[side]);
    controls = `<div class="market-lock-note">🔒 Final terms locked at version ${revision}. No offer can change now. Each friend can collect the other’s exact items and Gold once.</div>${claimed ? '<p class="market-confirm-line">✓ Your side of the exchange has arrived.</p>' : `<div class="market-actions"><button class="button primary wide" data-action="market-claim-trade" data-id="${escapeHTML(trade.id)}">Receive the exact agreed offer</button></div>`}`;
  } else if (trade.state === 'cancelled') {
    const returned = Boolean(trade.returned?.[side]);
    controls = trade.escrowed?.[side] && !returned ? `<div class="market-lock-note">Trade cancelled before final confirmation. Your own set-aside offer is still safe.</div><div class="market-actions"><button class="button secondary wide" data-action="market-claim-trade" data-id="${escapeHTML(trade.id)}">Return my exact offer</button></div>` : '<p class="market-confirm-line">Trade cancelled. Any set-aside items have been returned.</p>';
  } else if (trade.state === 'complete') {
    controls = '<p class="market-confirm-line">✓ This trade is complete. Both sides have received or returned their set-aside items.</p>';
  }
  const blockAction = friendUid && trade.state === 'open' ? `<button class="display-option" data-action="market-block-player" data-player-uid="${escapeHTML(friendUid)}">Block friend</button>` : '';
  return `<article class="market-card"><div class="market-card-head"><span class="market-item-icon">🤝</span><div class="market-item-copy"><strong>Friend trade · ${escapeHTML(friendName)}</strong><small>${escapeHTML(trade.state || 'open')} · Version ${revision}</small></div></div><div class="market-offer-columns"><div class="market-offer-side"><strong>YOU GIVE</strong><p>${marketOfferCopy(ownOffer)}</p></div><div class="market-offer-side"><strong>YOU RECEIVE</strong><p>${marketOfferCopy(theirOffer)}</p></div></div>${trade.blocked ? '<div class="market-error">A block is in place. This trade cannot be confirmed.</div>' : ''}${controls}<div class="market-actions"><button class="display-option" data-action="market-report-trade" data-id="${escapeHTML(trade.id)}">Report trade</button>${blockAction}</div></article>`;
}
function renderMarketTrades() {
  const friends = marketplaceState.friends;
  const items = availableMarketItems('trade');
  const friendOptions = friends.map(friend => `<option value="${escapeHTML(friend.uid)}">${escapeHTML(friend.displayName || 'Pocketwild friend')}</option>`).join('');
  const invite = friends.length ? `<form class="market-form" data-market-form="create-trade"><strong>Start a friend trade</strong><label class="market-control-label">Trade with<select class="market-control" name="friendUid" required><option value="">Choose a friend…</option>${friendOptions}</select></label><label class="market-control-label">Your discovered item (optional)<select class="market-control" name="itemId"><option value="">Gold only / no item</option>${items.map(item => `<option value="${item.id}">${escapeHTML(item.emoji)} ${escapeHTML(item.name)} · have ${state.world.inventory[item.id] || 0}</option>`).join('')}</select></label><div class="market-filter-grid"><label class="market-control-label">Item quantity<input class="market-control" name="quantity" type="number" min="0" max="99" value="${items.length ? 1 : 0}" inputmode="numeric" /></label><label class="market-control-label">Gold<input class="market-control" name="gold" type="number" min="0" max="999999999" value="0" inputmode="numeric" /></label></div><p class="market-gold-note">The offer is set aside immediately. Both friends must reconfirm after either side changes an offer.</p><button class="button primary wide" type="submit">Send a trade offer</button></form>` : '<div class="market-empty">Friend trades are for accepted friends only. Meet someone in Friends & rooms first.</div>';
  return `<p class="body-copy">Item-for-Gold and item-for-item swaps are welcome. Each side sees the exact pieces and Gold, both confirmations reset after a change, and nothing moves until the final lock.</p>${invite}<h3 class="market-owner-label">Your friend trades</h3><div class="market-trade-list">${marketplaceState.trades.map(renderTradeCard).join('') || '<div class="market-empty">No trades yet. A friend’s offer will appear here for you to check.</div>'}</div>`;
}
function renderMarketHistory() {
  const rows = (state.world.marketHistory || []).map(entry => {
    const icons = {
      listed: '🏷️',
      auction: '🔨',
      purchase: '🛍️',
      sale: '🪙',
      bid: '🔨',
      refund: '↩',
      'auction-win': '🏆',
      'trade-offer': '🤝',
      'trade-change': '↻',
      'trade-refund': '↩',
      'trade-complete': '🤝',
      cancel: '↩'
    };
    const when = entry.at ? new Date(entry.at).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }) : 'Earlier';
    const currency = entry.currency === 'stardust' ? 'stardust' : 'gold';
    const amount = Math.max(0, Math.floor(Number(entry.amount ?? entry.gold) || 0));
    const amountCopy = amount ? currency === 'stardust' ? `${amount.toLocaleString()} Stardust` : `${amount.toLocaleString()}g` : '';
    const details = [entry.quantity ? `×${entry.quantity}` : '', amountCopy].filter(Boolean).join(' · ');
    const valueCopy = amountCopy && entry.type === 'npc-purchase' ? `−${amountCopy}` : amountCopy;
    return `<article class="market-history-row"><span class="market-history-icon">${icons[entry.type] || '✦'}</span><div><strong>${escapeHTML(entry.title)}</strong><small>${escapeHTML(when)}${details ? ` · ${escapeHTML(details)}` : ''}</small></div><b>${valueCopy ? escapeHTML(valueCopy) : ''}</b></article>`;
  }).join('');
  return `<p class="body-copy">A readable little ledger of your own listings, bids, trades, and completed purchases. Other players never see this history.</p><div class="market-history-list">${rows || '<div class="market-empty">Your first market note will appear when you list, bid, or trade a find.</div>'}</div>`;
}
function renderMarketplaceContent() {
  const status = playerSaveManager.getStatus();
  if (!status.user) return `<p class="body-copy">Player listings need a signed-in account so every item and Gold transfer can be held safely in the cloud. Guest play and your solo progress remain available.</p><div class="market-lock-note">The market is optional and separate from expedition progression. Every item transfer still requires that find to be in your journal.</div><button class="button primary wide" data-action="open-account">Connect an account to open the market</button>`;
  if (!status.cloudReady) return `<div class="market-error">Your account’s cloud save is not ready. Marketplace actions stay paused rather than risk a lost item or duplicate payment. ${escapeHTML(status.lastError || '')}</div><button class="button secondary wide" data-action="open-account">Check account status</button>`;
  const tabs = [['browse', 'Browse'], ['sell', 'Sell'], ['mine', 'My listings'], ['trades', 'Friend trades'], ['history', 'History']].map(([id, label]) => `<button class="market-tab${marketplaceState.tab === id ? ' selected' : ''}" data-action="market-tab" data-tab="${id}" aria-pressed="${marketplaceState.tab === id}">${label}</button>`).join('');
  const content = marketplaceState.tab === 'sell' ? renderMarketSell() : marketplaceState.tab === 'mine' ? renderMarketMine() : marketplaceState.tab === 'trades' ? renderMarketTrades() : marketplaceState.tab === 'history' ? renderMarketHistory() : renderMarketBrowse();
  return `<div class="market-tabs" aria-label="Marketplace sections">${tabs}</div>${marketplaceState.loading ? '<div class="market-empty">Checking player listings and held items…</div>' : ''}${content}${marketplaceState.error ? `<div class="market-error" role="status">${escapeHTML(marketplaceState.error)}</div>` : ''}${marketplaceState.notice ? `<div class="market-notice" role="status">${escapeHTML(marketplaceState.notice)}</div>` : ''}`;
}
function displayNameCooldown() {
  const availableAt = state.displayNameChangedAt + 30 * 24 * 60 * 60 * 1000;
  const remainingMs = Math.max(0, availableAt - Date.now());
  return {
    availableAt,
    remainingMs,
    days: Math.ceil(remainingMs / (24 * 60 * 60 * 1000))
  };
}
async function syncProfileChanges() {
  const status = playerSaveManager.getStatus();
  if (!status.user) return;
  const shouldSyncProfile = socialManager.preferences().discoverable;
  const results = await Promise.allSettled([playerSaveManager.flush(), shouldSyncProfile ? socialManager.publishProfile(publicPlayerProfile(), true) : Promise.resolve(true)]);
  const saveSynced = results[0].status === 'fulfilled' && results[0].value !== false && playerSaveManager.getStatus().cloudReady;
  const profileSynced = results[1].status === 'fulfilled';
  if (saveSynced && profileSynced) return;
  state.profileNotice = 'Your change is saved on this device. Account sharing will catch up when cloud sync is ready.';
  renderUI();
}
function renderProfileAvatarEditor() {
  const controls = Object.entries(AVATAR_OPTIONS).map(([key, options]) => {
    const index = state.avatar[key] % options.length;
    const title = key === 'hairColor' ? 'Hair color' : key.charAt(0).toUpperCase() + key.slice(1);
    return `<button class="choice-tile" data-avatar="${key}" aria-label="Change ${escapeHTML(title)}. Current: ${escapeHTML(options[index])}"><span>${escapeHTML(title)}</span><strong>${escapeHTML(options[index])}</strong><i aria-hidden="true">↻</i></button>`;
  }).join('');
  return `<section class="profile-editor-card"><div class="profile-subheading"><strong>Make your look yours</strong><small>Tap a detail to try another style. Your room stays just the same.</small></div><div class="choice-grid">${controls}</div><button class="button secondary wide" data-action="finish-character-edit">Done</button></section>`;
}
function renderCompanionEvolutionProfile(pet) {
  if (!pet) return '<p class="profile-evolution-status">Your little friend’s story is just beginning.</p>';
  const stage = Math.max(0, Math.min(COMPANION_MILESTONES.length, state.world.companionEvolutionStage || 0));
  const latest = stage ? COMPANION_MILESTONES[stage - 1] : null;
  const seen = new Set(state.world.companionCinematicSeen || []);
  const replays = COMPANION_MILESTONES.filter((milestone, index) => index < stage && seen.has(milestone.id)).map(milestone => `<button class="evolution-replay-button" type="button" data-action="replay-companion-cinematic" data-milestone="${milestone.id}" aria-label="Replay the Level ${milestone.level} companion awakening">↻ Level ${milestone.level}</button>`).join('');
  return `<div class="profile-evolution-status"><strong>${stage ? `Awakening ${stage} of ${COMPANION_MILESTONES.length}` : 'A story still unfolding'}</strong><small>${latest ? `${escapeHTML(latest.artifact)} left a little magic to keep.` : 'Every shared adventure will leave a little mark.'}</small>${replays ? `<div class="evolution-replay-list" aria-label="Replay companion awakenings">${replays}</div>` : ''}</div>`;
}
function renderProfileRoomPreview(theme, pet) {
  const petArt = pet ? `<img src="assets/${socialPetSprite(pet.id)}" alt="${escapeHTML(pet.name)} the ${escapeHTML(pet.species)}" />` : '<span>🐾</span>';
  return `<div class="profile-room-preview" style="--preview-wall:${escapeHTML(ROOM_WALL_STYLES.find(style => style.id === state.world.room.wallStyle)?.color || '#d8bd91')};--preview-floor:${escapeHTML(ROOM_FLOOR_STYLES.find(style => style.id === state.world.room.floorStyle)?.color || '#96694a')};--preview-frame:${escapeHTML(theme.displayFrame)}" aria-label="Preview of ${escapeHTML(state.world.room.name)}"><span class="profile-preview-window" aria-hidden="true">✦ · ☾</span>${petArt}<span class="profile-preview-shelf">${state.world.collection.length} little finds</span></div>`;
}
function renderOwnProfile() {
  const pet = currentPet();
  const progress = progressionSnapshot();
  const theme = ROOM_THEMES[state.world.activeRoomTheme] || ROOM_THEMES['starter-room'];
  const master = hasMasterCollectorBadge(state.world);
  const name = safeUserText(state.playerName, 'PLAYER_NAME', 'Wanderer');
  const cooldown = displayNameCooldown();
  const titleMilestone = [...PROGRESSION_MILESTONES].reverse().find(milestone => completedMilestone(state.world, milestone) && milestone.unlock?.title);
  const playerTitle = master ? MASTER_COLLECTOR_BADGE.name : titleMilestone?.unlock.title || (progress.level > 1 ? 'Curious Explorer' : 'Pocketwild Friend');
  const nameAction = cooldown.remainingMs > 0 ? `<button class="display-option" data-action="open-display-name-editor" disabled>Change Display Name</button>` : '<button class="display-option" data-action="open-display-name-editor">Change Display Name</button>';
  const nextNameCopy = cooldown.remainingMs > 0 ? `Name can be changed again in ${cooldown.days} ${cooldown.days === 1 ? 'day' : 'days'} · ${new Date(cooldown.availableAt).toLocaleDateString()}.` : 'You can change your display name once every 30 days.';
  const achievements = [...(state.world.collection.length >= 1 ? ['First little find'] : []), ...(state.world.collection.length >= 5 ? ['A growing journal'] : []), ...(state.world.collection.length >= 15 ? ['Curious collector'] : []), ...(state.world.collection.length >= 30 ? ['A page for every place'] : [])];
  const achievementMarkup = [...(master ? ['✦ Master Collector'] : []), ...achievements].map(label => `<span class="profile-achievement">${escapeHTML(label)}</span>`).join('');
  const profileNotice = state.profileNotice && (!state.profileDialog || state.profileDialog === 'profile') ? `<p class="profile-notice" role="status" aria-live="polite">${escapeHTML(state.profileNotice)}</p>` : '';
  return `${profileNotice}<section class="profile-identity-card"><div class="profile-portrait">${socialAvatarMarkup(state.avatar, `${name}’s character portrait`)}</div><div class="profile-identity-copy"><span class="eyebrow">WHO YOU ARE</span><h3>${escapeHTML(name)}</h3><strong>Level ${progress.level} · ${escapeHTML(playerTitle)}</strong>${master ? '<span class="social-badge">✦ MASTER COLLECTOR</span>' : ''}</div></section><div class="profile-name-tools"><div><span class="profile-field-label">DISPLAY NAME</span><strong>${escapeHTML(name)}</strong><small>${escapeHTML(nextNameCopy)}</small></div>${nameAction}</div><button class="button secondary wide profile-edit-character" data-action="toggle-character-editor">${state.profileCharacterEditing ? 'Close character editor' : 'Edit Character'}</button>${state.profileCharacterEditing ? renderProfileAvatarEditor() : ''}<section class="profile-room-card"><div class="profile-section-heading"><div><span class="profile-field-label">YOUR LITTLE PLACE</span><h3>${escapeHTML(state.world.room.name)}</h3></div><button class="display-option" data-action="open-room-name-editor">Rename Room</button></div>${renderProfileRoomPreview(theme, pet)}<div class="profile-room-meta"><span>⌂ ${escapeHTML(theme.name)}</span><span>📖 ${state.world.collection.length} finds in your journal</span></div><button class="button secondary wide" data-action="phone-section" data-section="room">Customize my room <span aria-hidden="true">→</span></button></section><section class="profile-companion-card"><span class="profile-field-label">YOUR COMPANION</span><div class="profile-companion-row">${pet ? `<img src="assets/${socialPetSprite(pet.id)}" alt="" />` : '<span class="profile-companion-placeholder">🐾</span>'}<div><strong>${escapeHTML(pet?.name || 'Your friend')}</strong><small>${escapeHTML(pet?.species || 'Companion')} · ${escapeHTML(pet?.temperament || 'Curious')}</small><small>${escapeHTML(pet?.knack || 'Your forever friend')}</small></div></div>${renderCompanionEvolutionProfile(pet)}</section><section class="profile-progress-card"><span class="profile-field-label">YOUR LITTLE JOURNEY</span><div class="profile-stat-grid"><div><strong>${state.world.collection.length}</strong><small>Discoveries</small></div><div><strong>${unlockedAreas().length}</strong><small>Areas</small></div><div><strong>${state.world.completedMilestones.length}</strong><small>Collections</small></div><div><strong>${state.world.discoveredRecipes.length}</strong><small>Recipes</small></div><div><strong>${state.world.craftedRecipes.length}</strong><small>Potions made</small></div><div><strong>${state.world.expeditions}</strong><small>Outings</small></div></div></section>${achievementMarkup ? `<section class="profile-achievements"><span class="profile-field-label">LITTLE MILESTONES</span><div class="profile-achievement-list">${achievementMarkup}</div></section>` : '<p class="profile-empty-achievements">Your first little milestone is waiting to be found.</p>'}`;
}
function renderProfileDialog() {
  if (!state.profileDialog) return '';
  if (state.profileDialog === 'profile') {
    return `<div class="profile-dialog-overlay" role="dialog" aria-modal="true" aria-label="Your Pocketwild profile"><section class="profile-dialog-card"><header class="profile-dialog-heading"><div><p class="eyebrow">YOUR LITTLE WORLD</p><h2>Your Profile</h2></div><button class="phone-close" data-action="close-profile-dialog" aria-label="Close your profile">×</button></header>${renderOwnProfile()}</section></div>`;
  }
  if (state.profileDialog === 'room-name') {
    return `<div class="profile-dialog-overlay" role="dialog" aria-modal="true" aria-label="Name your room"><section class="profile-dialog-card"><header class="profile-dialog-heading"><div><p class="eyebrow">A LITTLE PLACE OF YOUR OWN</p><h2>Name Your Room</h2></div><button class="phone-close" data-action="close-profile-dialog" aria-label="Cancel room rename">×</button></header><p class="body-copy">Give your room a name that feels like you. You can change it whenever you like.</p><form data-profile-form="room-name" novalidate><label class="input-label" for="profile-room-name">ROOM NAME</label><input id="profile-room-name" class="name-input" name="name" maxlength="24" minlength="2" required autocomplete="off" value="${escapeHTML(state.roomNameDraft)}" aria-describedby="profile-form-notice" aria-invalid="${state.profileFormInvalid}" /><button class="button primary wide" type="submit">Save room name</button><button class="button secondary wide" type="button" data-action="close-profile-dialog">Cancel</button></form><p class="profile-notice" id="profile-form-notice" role="status" aria-live="polite" aria-atomic="true">${escapeHTML(state.profileNotice)}</p></section></div>`;
  }
  if (state.profileDialog === 'display-name-confirm') {
    return `<div class="profile-dialog-overlay" role="dialog" aria-modal="true" aria-label="Confirm display name"><section class="profile-dialog-card"><p class="eyebrow">ONE LAST LOOK</p><h2>Use this display name?</h2><p class="body-copy">Your profile will show <strong>${escapeHTML(state.pendingDisplayName)}</strong>. You can change it again in 30 days.</p>${state.profileNotice ? `<p class="profile-notice" role="status" aria-live="polite">${escapeHTML(state.profileNotice)}</p>` : ''}<button class="button primary wide" data-action="confirm-display-name">Yes, use this name</button><button class="button secondary wide" data-action="cancel-display-name-confirm">Keep my current name</button></section></div>`;
  }
  return `<div class="profile-dialog-overlay" role="dialog" aria-modal="true" aria-label="Change display name"><section class="profile-dialog-card"><header class="profile-dialog-heading"><div><p class="eyebrow">A NAME THAT FEELS LIKE YOU</p><h2>Change Display Name</h2></div><button class="phone-close" data-action="close-profile-dialog" aria-label="Cancel name change">×</button></header><p class="body-copy">Your next name change will be available in 30 days.</p><form data-profile-form="display-name" novalidate><label class="input-label" for="profile-display-name">DISPLAY NAME</label><input id="profile-display-name" class="name-input" name="name" maxlength="16" minlength="2" required autocomplete="nickname" autocapitalize="words" value="${escapeHTML(state.profileDraft || state.playerName)}" aria-describedby="profile-form-notice" aria-invalid="${state.profileFormInvalid}" /><button class="button primary wide" type="submit">Continue</button><button class="button secondary wide" type="button" data-action="close-profile-dialog">Cancel</button></form><p class="profile-notice" id="profile-form-notice" role="status" aria-live="polite" aria-atomic="true">${escapeHTML(state.profileNotice)}</p></section></div>`;
}
function restoreProfileDialog() {
  state.profileDialog = state.profileDialogReturn || '';
  state.profileDialogReturn = '';
  state.pendingDisplayName = '';
  state.profileDraft = '';
  state.roomNameDraft = '';
  state.profileFormInvalid = false;
}
function profileValidationNotice(result, label) {
  if (result.reason === 'too_short') return `${label} needs at least two letters.`;
  if (result.reason === 'too_long') return `${label} is a little too long. Please shorten it.`;
  return `Let’s try a different ${label.toLowerCase()} for our little world.`;
}
function submitProfileForm(form) {
  const formData = new FormData(form);
  const kind = form.dataset.profileForm;
  if (kind === 'room-name') {
    const candidate = String(formData.get('name') || '');
    const result = validateUserText(candidate, 'ROOM_NAME');
    state.roomNameDraft = result.text;
    state.profileFormInvalid = !result.allowed;
    if (!result.allowed) {
      state.profileNotice = profileValidationNotice(result, 'Room name');
      renderUI();
      requestAnimationFrame(() => ui.querySelector('#profile-room-name')?.focus());
      return;
    }
    state.profileFormInvalid = false;
    const changed = result.text !== state.world.room.name;
    state.world.room.name = result.text;
    if (changed) rememberCloverEvent('room-change', {
      themeName: ROOM_THEMES[state.world.activeRoomTheme]?.name || 'your room'
    });
    restoreProfileDialog();
    state.profileNotice = changed ? 'Your room has a lovely new name.' : 'That is already your room name.';
    if (changed) persist();
    renderUI();
    if (changed) void syncProfileChanges();
    return;
  }
  if (kind === 'display-name') {
    const candidate = normalizePlayerNameDraft(formData.get('name'));
    const result = validateUserText(candidate, 'PLAYER_NAME');
    state.profileDraft = candidate;
    state.profileFormInvalid = !result.allowed;
    if (!result.allowed) {
      state.profileNotice = profileValidationNotice(result, 'Display name');
      renderUI();
      requestAnimationFrame(() => ui.querySelector('#profile-display-name')?.focus());
      return;
    }
    state.profileFormInvalid = false;
    if (result.text === state.playerName) {
      state.profileNotice = 'That is already your display name.';
      renderUI();
      return;
    }
    const cooldown = displayNameCooldown();
    if (cooldown.remainingMs > 0) {
      state.profileNotice = `You can choose a new name in ${cooldown.days} ${cooldown.days === 1 ? 'day' : 'days'}.`;
      renderUI();
      return;
    }
    state.pendingDisplayName = result.text;
    state.profileNotice = '';
    state.profileDialog = 'display-name-confirm';
    renderUI();
  }
}
function renderWildsoulTalents() {
  const earned = earnedTalentPoints();
  const spent = spentTalentPoints();
  const available = Math.max(0, earned - spent);
  const branches = WILDSOUL_TALENT_BRANCHES.map(branch => {
    const branchSpent = branch.talents.reduce((sum, talent) => sum + talentRank(talent.id), 0);
    const cards = branch.talents.map(talent => {
      const rank = talentRank(talent.id);
      const unlocked = branchSpent >= talent.unlockPoints;
      const canInvest = available > 0 && unlocked && rank < talent.maxRank;
      const requirement = talent.unlockPoints === 0 ? 'Available from the start' : `Unlocks after ${talent.unlockPoints} ${branch.name} points are spent`;
      const stateCopy = rank >= talent.maxRank ? 'MAX RANK' : unlocked ? requirement : `LOCKED · ${requirement}`;
      return `<article class="talent-card${unlocked ? '' : ' locked'}"><div class="talent-card-heading"><strong>${escapeHTML(talent.name)}</strong><span>RANK ${rank}/${talent.maxRank}</span></div><p>${escapeHTML(talent.description)}</p><div class="talent-card-foot"><small>${escapeHTML(stateCopy)}</small><button class="talent-invest" type="button" data-action="invest-talent" data-talent="${talent.id}" ${canInvest ? '' : 'disabled'}>${rank >= talent.maxRank ? 'Learned' : available ? 'Add 1 point' : 'Save a point'}</button></div></article>`;
    }).join('');
    return `<section class="talent-branch"><header><span aria-hidden="true">${branch.icon}</span><div><h3>${escapeHTML(branch.name)}</h3><p>${escapeHTML(branch.description)}</p></div><small>${branchSpent} SPENT</small></header><div class="talent-list">${cards}</div></section>`;
  }).join('');
  return `<div class="talent-ledger"><strong>✧ ${available} available</strong><span>${spent} spent · ${earned}/${MAX_TALENT_POINTS} earned</span><p>One point arrives with each level after Level 1. Save them for later if you like; talent choices are permanent in this version.</p></div><div class="talent-branches">${branches}</div>`;
}
function investTalent(talentId) {
  if (state.phase !== 'phone' || state.world.phoneSection !== 'talents') return;
  const definition = TALENT_BY_ID.get(talentId);
  const branch = WILDSOUL_TALENT_BRANCHES.find(entry => entry.talents.some(talent => talent.id === talentId));
  if (!definition || !branch) return;
  const branchSpent = branch.talents.reduce((sum, talent) => sum + talentRank(talent.id), 0);
  if (earnedTalentPoints() - spentTalentPoints() < 1 || branchSpent < definition.unlockPoints || talentRank(talentId) >= definition.maxRank) return;
  state.world.talents = {
    ...(state.world.talents || {}),
    [talentId]: talentRank(talentId) + 1
  };
  persist();
  renderUI();
}
function renderPhone() {
  const section = state.world.phoneSection;
  const pet = currentPet();
  const availableTalents = Math.max(0, earnedTalentPoints() - spentTalentPoints());
  const sections = [['profile', '♡', 'Profile', 'Your little world'], ['xp', '✦', 'XP', 'What you’ve learned'], ['talents', '🍃', 'Wildsoul Talents', `${availableTalents} point${availableTalents === 1 ? '' : 's'} ready · shape your path`], ['collection', '📖', 'Collection', 'Finds you’ve discovered'], ['inventory', '🎒', 'Inventory', 'What you have now'], ['pet', '🐾', 'Pet', 'Your forever friend'], ['room', '⌂', 'Room', 'Your cozy home'], ['shop', '🏪', 'Room Shop', escapeHTML(roomShopTitle())], ['notifications', '✉', 'Notifications', 'Recent little notes'], ['social', '♡', 'Friends & rooms', 'Visit little worlds when you like'], ['marketplace', '⚖️', 'Player Market', 'Player shelves, auctions & swaps']];
  if (state.world.phoneUnlocked) sections.push(['crafting', '⚗️', 'Crafting', 'Progression & recipes']);
  const sectionButtons = `<div class="phone-app-grid">${sections.map(([id, icon, label, detail]) => `
    <button class="phone-app" data-action="phone-section" data-section="${id}"><span class="phone-app-icon" aria-hidden="true">${icon}</span><span class="phone-app-label">${label}</span><span class="phone-app-detail">${detail}</span></button>`).join('')}
  </div>`;
  let content = `<p class="body-copy">A few useful corners, all tucked in one place.</p>${sectionButtons}<p class="tap-hint">More phone corners can appear as your world grows.</p>`;
  let title = 'Your Pocket Phone';
  if (section === 'collection') {
    title = 'Collection';
    const discoveries = state.world.collection.map(id => getItemRecord(id)).filter(Boolean);
    const categories = [...COLLECTION_CATEGORIES, ...new Set(discoveries.map(item => item.category).filter(category => !COLLECTION_CATEGORIES.includes(category)))];
    const groupedRows = categories.map(category => {
      const items = discoveries.filter(item => item.category === category);
      if (!items.length) return '';
      const rows = items.map(item => {
        const owned = state.world.inventory[item.id] || 0;
        const ownershipLabel = owned > 0 ? `In Inventory ×${owned}` : 'Not currently owned';
        return `<article class="journal-item"><div class="journal-item-heading">${itemIconMarkup(item)}<div><strong>${escapeHTML(item.name)}</strong><span class="journal-rarity">${escapeHTML(item.rarity)}</span></div></div><p>${escapeHTML(item.description)}</p><div class="journal-item-footer"><span class="ownership-state${owned > 0 ? ' owned' : ''}">${ownershipLabel}</span></div></article>`;
      }).join('');
      return `<section class="journal-category"><h3>${escapeHTML(category)}</h3>${rows}</section>`;
    }).join('');
    content = `<p class="body-copy">A permanent journal of what you’ve discovered. It stays even when a find leaves your bag.</p><div class="journal-summary">${discoveries.length} ${discoveries.length === 1 ? 'discovery' : 'discoveries'} recorded</div><div class="journal-list">${groupedRows || '<div class="empty-note">No discoveries yet. Your explorer will leave the first page soon.</div>'}</div>`;
  } else if (section === 'inventory') {
    title = 'Inventory';
    const ownedItems = Object.entries(state.world.inventory).map(([id, quantity]) => ({
      item: getItemRecord(id),
      quantity
    })).filter(({
      item,
      quantity
    }) => item && quantity > 0);
    const rows = ownedItems.map(({
      item,
      quantity
    }) => {
      const potionAction = item.potionEffect ? state.world.activePotionBuff ? '<p class="potion-ready-note">One preparation is already active. Finish its listed actions before preparing another.</p>' : `<button class="potion-use-button" data-action="use-potion" data-item="${item.id}">Prepare for a ${item.potionEffect.action === 'craft' ? 'craft' : 'outing'}</button>` : '';
      const floorPrice = npcSellPrice(item.id);
      const tradeGuide = ECONOMY_CONFIG.playerTradeGuideGold[item.id];
      const sellableQuantity = floorPrice ? Math.min(quantity, Math.floor((ECONOMY_CONFIG.maxBalance - currencyBalance('gold')) / floorPrice)) : 0;
      const tradeGuideCopy = tradeGuide ? `<p class="player-trade-guide">Player-trade guide: ${tradeGuide[0]}–${tradeGuide[1]}g. Indicative only; urgent demand may push offers higher.</p>` : '';
      const sellControls = floorPrice ? `<div class="npc-buyback"><p><strong>Clover’s guaranteed NPC price</strong> · ${floorPrice}g each</p>${tradeGuideCopy}<div class="npc-sell-actions">${sellableQuantity ? `<button class="display-option" data-action="sell-to-npc" data-item="${item.id}" data-quantity="1">Sell 1 · ${floorPrice}g</button>${sellableQuantity > 1 ? `<button class="display-option" data-action="sell-all-to-npc" data-item="${item.id}" data-quantity="${sellableQuantity}">Sell ${sellableQuantity} · ${sellableQuantity * floorPrice}g</button>` : ''}` : '<span class="shop-footnote">Spend some Gold before Clover can buy more.</span>'}</div></div>` : '';
      return `<article class="inventory-item"><div class="inventory-item-main">${itemIconMarkup(item)}<div><strong>${escapeHTML(item.name)}</strong><span>${escapeHTML(item.category)} · ${escapeHTML(item.rarity)}</span></div><b>×${quantity}</b></div><p>${escapeHTML(item.description)}</p>${potionAction}${sellControls}</article>`;
    }).join('');
    const activeBuffCopy = state.world.activePotionBuff ? `<div class="active-buff-note">Active preparation · ${escapeHTML(activePotionSummary())}</div>` : '';
    const clover = cloverPresence();
    const cloverNote = clover ? `<article class="npc-presence-card" aria-label="Clover, the room-shop keeper"><span class="npc-presence-icon" aria-hidden="true">🍀</span><div><strong>Clover · ${escapeHTML(clover.activity)}</strong><p>“${escapeHTML(clover.line)}”</p></div><button class="display-option" data-action="greet-clover">Say hello</button></article>` : '';
    content = `${cloverNote}<p class="body-copy">Only the things you currently have are listed here. Sell a spare find to Clover for a safe, low NPC floor; player-to-player trades may be worth more. Prepare one potion at a time; its action-based uses do not expire while you are away.</p>${activeBuffCopy}<div class="inventory-list">${rows || '<div class="empty-note">Your bag is empty for now. Things you bring home will appear here.</div>'}</div>`;
  } else if (section === 'profile') {
    title = 'Your profile';
    content = renderOwnProfile();
  } else if (section === 'talents') {
    title = 'Wildsoul Talents';
    content = renderWildsoulTalents();
  } else if (section === 'xp') {
    title = 'Experience & milestones';
    const progress = progressionSnapshot();
    const areas = unlockedAreas();
    const rarity = areas[areas.length - 1]?.rarity || 'Common';
    const levelCopy = progress.levelCapped ? progress.milestone ? `Level ${LEVEL_CAP} is the current cap · craft ${progress.milestone.name} to finish this chapter.` : `The journey is complete · Level ${LEVEL_CAP} is the current cap.` : progress.atBarrier ? `Level ${progress.level} reached · craft ${progress.milestone?.name || 'your keepsake'} to carry on.` : progress.xpCapped ? `XP is held at the Level ${LEVEL_CAP} cap · craft ${progress.milestone?.name || 'the current keepsake'} to continue.` : `${progress.remaining} XP to Level ${progress.level + 1}`;
    const unlockRows = PROGRESSION_MILESTONES.filter(milestone => completedMilestone(state.world, milestone)).map(milestone => {
      const reward = milestone.unlock.areaId ? `${AREA_CATALOG.find(area => area.id === milestone.unlock.areaId)?.name || 'New area'} · ${milestone.unlock.rarity}` : milestone.unlock.title;
      return `<div class="inventory-row milestone-unlocked"><span>✓ Level ${milestone.level}</span><strong>${escapeHTML(reward || milestone.name)}</strong></div>`;
    }).join('');
    content = `<p class="body-copy">Outings are your main source of experience. New discoveries, recipes, and collection milestones add a little extra.</p><div class="phone-xp-card"><div class="phone-xp-labels"><strong>LEVEL ${progress.level}</strong><span>${progress.levelCapped ? 'MAX LEVEL' : progress.atBarrier ? milestoneHasMaterials(progress.milestone) ? 'CRAFT READY' : 'NEXT GOAL' : progress.xpCapped ? 'XP AT CAP' : `${progress.earnedWithin} / ${progress.needed} XP`}</span></div><div class="xp-track"><div class="xp-fill" style="width:${progress.atBarrier || progress.levelCapped ? 100 : progress.percent}%"></div></div><p>${progress.totalXp.toLocaleString()} total XP · ${levelCopy}</p><p class="xp-access">${areas.length} areas open · ${escapeHTML(rarity)} finds · ${state.world.expeditions} outings</p></div>${renderMilestoneCard(progress)}<div class="milestone-history"><h3>Trail markers</h3>${unlockRows || '<div class="empty-note">Your first big trail marker waits at Level 10.</div>'}</div>`;
  } else if (section === 'pet') {
    title = `${escapeHTML(pet?.name || 'Your friend')}`;
    content = `<p class="body-copy">Your forever companion and very best explorer.</p><div class="inventory-list"><div class="inventory-row"><span>Friend</span><strong>${escapeHTML(pet?.species || 'Companion')}</strong></div><div class="inventory-row"><span>Little knack</span><strong>${escapeHTML(pet?.temperament || 'Curious')}</strong></div><div class="inventory-row"><span>Outings together</span><strong>${state.world.expeditions}</strong></div></div>`;
  } else if (section === 'room') {
    title = 'Your room';
    content = renderRoomShowcase();
  } else if (section === 'social') {
    const socialTitles = {
      home: 'Friends & rooms',
      discover: 'Discover rooms',
      friends: 'Your friends',
      requests: 'Friend requests',
      profile: socialState.room ? `${escapeHTML(socialState.room.displayName || 'A friend')}’s profile` : 'Pocketwild profile',
      room: socialState.room ? `${escapeHTML(socialState.room.displayName || 'A friend')}’s room` : 'Room visit',
      'room-collection': 'Their collection',
      shop: 'Room shop',
      messages: 'Messages',
      chat: socialState.chatFriend ? `Chat with ${escapeHTML(socialState.chatFriend.displayName || 'a friend')}` : 'Messages',
      notifications: 'Social notes'
    };
    title = socialTitles[socialState.view] || 'Friends & rooms';
    content = renderSocialContent();
    if (socialState.error) content += `<div class="social-error" role="status">${escapeHTML(socialState.error)}</div>`;
    if (socialState.notice) content += `<div class="social-card" role="status"><p>${escapeHTML(socialState.notice)}</p></div>`;
  } else if (section === 'crafting') {
    title = 'Crafting & progression';
    content = renderCraftingContent();
  } else if (section === 'marketplace') {
    title = 'Player Market';
    content = renderMarketplaceContent();
  } else if (section === 'notifications') {
    title = 'Notifications';
    const notes = state.world.notifications.map(message => `<div class="notification-row"><span aria-hidden="true">✦</span><p>${escapeHTML(message)}</p></div>`).join('');
    content = `<p class="body-copy">A few recent notes from your little world.</p><div class="notification-list">${notes || '<div class="empty-note">Nothing new just yet. Your first little note will find its way here.</div>'}</div>`;
  }
  if (section === 'shop') {
    title = 'Your room shop';
    content = renderRoomShop();
  }
  const phoneFooter = section === 'social' && socialState.view !== 'home' ? '<button class="button secondary wide" data-action="social-back">‹ Back to social</button>' : section !== 'home' ? '<button class="button secondary wide" data-action="phone-home">‹ All phone sections</button>' : '';
  const wallet = section === 'profile' ? '' : renderWalletCard();
  return `${topBar()}<div class="room-caption progress-caption">A LITTLE SOMETHING TO KEEP CLOSE</div><div class="phone-backdrop" aria-hidden="true"></div>${panel(`<div class="phone-topline"><p class="eyebrow">POCKETWILD · ${section === 'profile' ? 'PROFILE' : 'PHONE'}</p><button class="phone-close" data-action="close-phone" aria-label="Close phone">×</button></div><h2>${title}</h2>${wallet}${content}${phoneFooter}`, 'dialog-panel phone-panel', `role="dialog" aria-modal="true" aria-label="${escapeHTML(title)}"`)}`;
}
function formatCountdown(milliseconds) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor(totalSeconds % 86400 / 3600);
  const minutes = Math.floor(totalSeconds % 3600 / 60);
  const seconds = totalSeconds % 60;
  if (days) return `${days}d ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  if (hours) return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
function renderObjectiveOverlay() {
  const now = Date.now();
  const levelUpQuest = availableLevelUpQuest();
  const activeTab = levelUpQuest && state.objectiveTab === 'level-up' ? 'level-up' : 'daily';
  const dailyCap = ticketManager.activeDailyCap();
  const allowance = ticketManager.dailyAllowance(state.world, now);
  const remaining = Math.max(0, TICKET_SETTINGS.cap - state.world.tickets);
  const dailyReset = state.world.dailyResetTimestamp;
  const nextTicket = ticketManager.nextTicketAt(state.world, now);
  const ticketLine = state.world.tickets >= TICKET_SETTINGS.cap ? '<strong>Storage is full.</strong> Passive tickets pause until you spend one.' : `<strong>Next ticket:</strong> <span data-countdown-at="${nextTicket}" data-countdown-kind="ticket">in ${formatCountdown(nextTicket - now)}</span>`;
  const allowanceLine = allowance > 0 ? `${state.world.activeTicketsEarnedToday} / ${dailyCap} earned today · ${allowance} more can be earned${TICKET_CONFIG.testingMode ? ' · testing allowance' : ''}` : `${state.world.activeTicketsEarnedToday} / ${dailyCap} earned today · limit reached. Objectives can still refresh; passive regeneration continues.`;
  const dailyLine = `Daily reset in <span data-countdown-at="${dailyReset}" data-countdown-kind="daily">${formatCountdown(dailyReset - now)}</span>`;
  const claimableCount = Object.values(state.world.objectiveStates || {}).filter(slot => slot?.task?.completed).length;
  const cards = OBJECTIVE_CONFIG.tiers.map(tier => {
    const slot = state.world.objectiveStates?.[String(tier.level)] || {
      task: null,
      cooldownUntil: 0
    };
    const task = slot.task;
    if (!task) {
      if (slot.cooldownUntil > now) {
        return `<article class="objective-card resting"><div class="objective-card-top"><span class="objective-tier">LEVEL ${tier.level} · ${escapeHTML(tier.label)}</span><span class="objective-reward">+${tier.reward} 🎟</span></div><strong class="objective-rest-title">A little breather</strong><p class="objective-description">Your next Pocketwild goal will be ready soon.</p><div class="objective-countdown">Refreshes in <span data-countdown-at="${slot.cooldownUntil}" data-countdown-kind="objective">${formatCountdown(slot.cooldownUntil - now)}</span></div></article>`;
      }
      return `<article class="objective-card resting"><div class="objective-card-top"><span class="objective-tier">LEVEL ${tier.level} · ${escapeHTML(tier.label)}</span><span class="objective-reward">+${tier.reward} 🎟</span></div><strong class="objective-rest-title">A new goal is on its way</strong><p class="objective-description">This little corner will fill when its activities open up.</p></article>`;
    }
    const progressRows = task.goals.map((goal, index) => {
      const progress = Math.min(goal.target, task.progress[index] || 0);
      const percent = Math.round(progress / Math.max(1, goal.target) * 100);
      return `<div class="objective-progress-row"><div class="objective-progress-label"><span>${escapeHTML(goal.label)}</span><strong>${progress} / ${goal.target}</strong></div><div class="objective-progress-track"><span style="width:${percent}%"></span></div></div>`;
    }).join('');
    const available = ticketManager.canAwardActive(state.world, task.reward, now);
    const limitCopy = allowance === 0 ? 'Daily active-ticket allowance reached. This objective can still be completed and refreshed.' : remaining === 0 ? 'Your ticket pouch is full. This objective can still be completed and refreshed.' : available < task.reward ? `Only +${available} ticket${available === 1 ? '' : 's'} fit your remaining ${allowance < task.reward ? 'daily active-ticket allowance' : 'ticket pouch space'}.` : '';
    const rewardLabel = available === task.reward ? `+${task.reward} 🎟` : `+${available} today 🎟`;
    const status = task.completed ? `<div class="objective-complete">✓ Goal complete${limitCopy ? ` · ${escapeHTML(limitCopy)}` : ''}</div><button class="button primary wide objective-claim" data-action="claim-objective" data-tier="${tier.level}">${available > 0 ? `Claim +${available} Ticket${available === 1 ? '' : 's'}` : 'Claim · refresh with +0 tickets'}</button>` : `<div class="objective-countdown">${tier.daily ? 'Daily refresh in' : 'Refreshes in'} <span data-countdown-at="${task.expiresAt}" data-countdown-kind="${tier.daily ? 'daily-objective' : 'objective'}">${formatCountdown(task.expiresAt - now)}</span></div>${limitCopy ? `<p class="objective-description">${escapeHTML(limitCopy)}</p>` : ''}`;
    return `<article class="objective-card${task.completed ? ' completed' : ''}"><div class="objective-card-top"><span class="objective-tier">LEVEL ${tier.level} · ${escapeHTML(tier.label)}</span><span class="objective-reward">${rewardLabel}</span></div><h3>${escapeHTML(task.name)}</h3><p class="objective-description">${escapeHTML(task.description)}</p><div class="objective-progress-list">${progressRows}</div>${status}</article>`;
  }).join('');
  const tabs = levelUpQuest ? `<div class="objective-tabs" role="tablist" aria-label="Objective sections"><button class="objective-tab${activeTab === 'daily' ? ' selected' : ''}" role="tab" aria-selected="${activeTab === 'daily'}" data-action="objective-tab" data-tab="daily">Daily objectives</button><button class="objective-tab${activeTab === 'level-up' ? ' selected' : ''}" role="tab" aria-selected="${activeTab === 'level-up'}" data-action="objective-tab" data-tab="level-up">Level-up quest · ${levelUpQuest.level}</button></div>` : '';
  const objectiveContent = activeTab === 'level-up' && levelUpQuest ? renderMilestoneCard(progressionSnapshot(), {
    levelUpQuest: true
  }) : `<div class="objective-list">${cards}</div>`;
  return `<div class="objective-overlay" role="dialog" aria-modal="true" aria-label="Objectives"><section class="objective-panel"><div class="objective-panel-head"><div><p class="eyebrow">LITTLE THINGS TO DO · TICKETS</p><h2>Your objectives</h2></div><div class="objective-panel-actions"><button class="objective-claim-all" type="button" data-action="claim-all-objectives" ${claimableCount ? '' : 'disabled'} aria-label="Claim all ${claimableCount} completed objective rewards">✦ Claim all <span>· ${claimableCount}</span></button><button class="phone-close" data-action="close-objectives" aria-label="Close objectives">×</button></div></div><p class="body-copy objective-intro">Small ideas for whenever you feel like wandering. Nothing here is a must.</p><div class="ticket-economy-card"><div class="ticket-economy-heading"><strong>🎟 ${state.world.tickets} / ${TICKET_SETTINGS.cap} tickets</strong><span>${remaining} spaces</span></div><p>${ticketLine}</p><p class="active-ticket-line"><strong>Active tickets today</strong><br>${escapeHTML(allowanceLine)}</p><p class="daily-reset-line">${dailyLine}</p></div>${tabs}${objectiveContent}</section></div>`;
}
function renderWelcomeBack() {
  const welcome = state.world.pendingOfflineReward;
  if (!welcome) return '';
  const items = welcome.items.map(entry => {
    const item = ITEM_CATALOG[entry.id];
    return item ? `<span class="offline-find">${item.emoji} ${escapeHTML(item.name)}${entry.quantity > 1 ? ` ×${entry.quantity}` : ''}</span>` : '';
  }).filter(Boolean).join('');
  const petName = escapeHTML(currentPet()?.name || 'Your companion');
  const awayHours = welcome.elapsedMs / (60 * 60 * 1000);
  const xpFind = welcome.xp ? `<span class="offline-find offline-xp">✦ +${welcome.xp} XP</span>` : '';
  return `<div class="return-overlay" role="dialog" aria-modal="true" aria-label="Welcome back"><section class="return-panel"><div class="return-panel-head"><div class="return-sparkle" aria-hidden="true">✦ · ✧</div><button class="phone-close" type="button" data-action="dismiss-offline" aria-label="Close welcome back message">×</button></div><p class="eyebrow">YOUR LITTLE WORLD MISSED YOU</p><h2>Welcome back${state.playerName ? `, ${escapeHTML(state.playerName)}` : ''}!</h2><p class="body-copy">While you were away${awayHours >= OFFLINE_REWARD_CONFIG.maxAccumulationMs / 3600000 ? ', for a cozy little while' : ''}…</p><div class="offline-find-list">${items || '<span class="offline-find">A few quiet moments together</span>'}${xpFind}</div><p class="offline-pet-note">${petName} found a few things and saved them just for you.</p><button class="button primary wide" data-action="dismiss-offline">Aww, thank you <span aria-hidden="true">♡</span></button></section></div>`;
}
function accountForm(view) {
  const isReset = view === 'reset';
  const heading = view === 'create' ? 'Create a little account' : isReset ? 'Reset your password' : 'Welcome back';
  const submit = view === 'create' ? 'Create account' : isReset ? 'Send reset email' : 'Log in';
  const copy = view === 'create' ? 'Save your Pocketwild world so it can follow you to another device.' : isReset ? 'We’ll send a password reset link to your email.' : 'Your saved Pocketwild world will be waiting.';
  return `<p class="eyebrow">YOUR LITTLE WORLD, SAFELY KEPT</p><h2>${heading}</h2><p class="body-copy">${copy}</p><form class="account-form" data-account-form="${view}"><label class="input-label" for="account-email">EMAIL</label><input class="name-input" id="account-email" name="email" type="email" required maxlength="254" autocomplete="email" inputmode="email" placeholder="you@example.com" value="${escapeHTML(accountEmail)}" />${isReset ? '' : `<label class="input-label" for="account-password">PASSWORD</label><input class="name-input" id="account-password" name="password" type="password" required minlength="6" autocomplete="${view === 'create' ? 'new-password' : 'current-password'}" placeholder="At least 6 characters" />`}<button class="button primary wide" type="submit" ${accountBusy ? 'disabled' : ''}>${accountBusy ? 'One little moment…' : submit}</button></form><button class="button secondary wide" data-action="account-back" ${accountBusy ? 'disabled' : ''}>‹ Back to Account</button>`;
}
function diagnosticDisplayText(value, status) {
  let text = String(value ?? '');
  for (const uid of [status.user?.uid, status.pendingUser?.uid].filter(Boolean)) text = text.split(uid).join('[hidden]');
  return text.replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[email hidden]').replace(/\bBearer\s+[^\s,;]+/gi, 'Bearer [hidden]').replace(/\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/g, '[token hidden]').replace(/\b(?:recaptcha|access|id|refresh|appcheck)[_-]?token\s*[:=]\s*[^\s,;]+/gi, '[token hidden]').replace(/\b6L[A-Za-z0-9_-]{20,}\b/g, '[key hidden]').replace(/\bAIza[0-9A-Za-z_-]{20,}\b/g, '[key hidden]').replace(/\b[A-Za-z0-9_-]{24,79}\b/g, '[identifier hidden]').replace(/\b[A-Za-z0-9_-]{80,}\b/g, '[identifier hidden]').slice(0, 320);
}
function diagnosticTimestamp(timestamp) {
  if (!Number.isFinite(Number(timestamp)) || Number(timestamp) <= 0) return 'Not yet observed';
  try {
    return new Date(Number(timestamp)).toLocaleString();
  } catch {
    return 'Time unavailable';
  }
}
function diagnosticResultText(result, kind) {
  if (kind === 'local') return {
    saved: 'Saved to this device',
    failed: 'Local write failed',
    'not-observed': 'No local write result yet'
  }[result] || result;
  if (kind === 'read') return {
    'valid-save-found': 'Cloud save found',
    'document-not-found': 'No cloud save found',
    failed: 'Cloud read failed',
    'not-observed': 'Not checked yet'
  }[result] || result;
  if (kind === 'write') return {
    committed: 'Cloud write confirmed',
    'newer-cloud-save-preserved': 'A newer cloud save was preserved',
    failed: 'Cloud write failed',
    'not-observed': 'No cloud write result yet'
  }[result] || result;
  if (kind === 'app-check') return {
    acquired: 'Token acquired',
    missing: 'Token missing',
    failed: 'Token request failed',
    'not-requested': 'Not requested yet'
  }[result] || result;
  if (kind === 'conflict') return {
    detected: 'A save conflict was detected',
    'restore-local-selected': 'Account restore selected the local save',
    'restore-cloud-selected': 'Account restore selected the cloud save',
    'newer-cloud-save-preserved': 'Newer cloud save preserved',
    'account-save-selected': 'Account save selected',
    'device-save-written-and-verified': 'Device save written and verified',
    'guest-world-kept': 'Guest world kept',
    'not-observed': 'No conflict outcome observed'
  }[result] || result || 'Not yet observed';
  return result || 'Not yet observed';
}
function renderSaveDiagnostics(status) {
  const diagnostics = status.diagnostics || {};
  const local = diagnostics.localSave || {};
  const cloudRead = diagnostics.cloudRead || {};
  const cloudWrite = diagnostics.cloudWrite || {};
  const appCheck = diagnostics.appCheck || {};
  const auth = diagnostics.auth || {};
  const events = Array.isArray(diagnostics.events) ? diagnostics.events : [];
  const authLabel = status.user || status.pendingUser || auth.signedIn ? 'Signed in' : 'Guest / signed out';
  const matchLabel = typeof auth.uidMatchesExpected === 'boolean' ? auth.uidMatchesExpected ? 'Yes' : 'No' : 'Not checked';
  const localDetail = local.target ? `${local.primaryWritten ? 'Primary slot written' : 'Primary slot not written'} · ${local.deviceSnapshotWritten ? 'device copy written' : 'device copy not confirmed'}` : local.result === 'failed' ? `${local.code || 'unknown'}${local.message ? ` · ${diagnosticDisplayText(local.message, status)}` : ''}` : '';
  const readDetail = cloudRead.path ? `Path: ${cloudRead.path}` : '';
  const readError = cloudRead.result === 'failed' ? `${cloudRead.code || 'unknown'}${cloudRead.message ? ` · ${diagnosticDisplayText(cloudRead.message, status)}` : ''}` : '';
  const writeDetail = status.cloudWriteQueued ? 'A write is queued for the debounce window.' : status.cloudWriteInFlight ? 'A cloud write is currently in progress.' : cloudWrite.path ? `Path: ${cloudWrite.path}` : '';
  const writeError = cloudWrite.result === 'failed' ? `${cloudWrite.code || 'unknown'}${cloudWrite.message ? ` · ${diagnosticDisplayText(cloudWrite.message, status)}` : ''}` : '';
  const conflict = diagnostics.lastCloudConflict || {};
  const cloudStatus = !status.configured ? 'Cloud accounts not configured' : status.pendingUser ? 'Account save choice pending' : status.user ? status.cloudReady ? 'Account cloud sync ready' : 'Cloud sync paused' : 'Guest · no active cloud sync';
  const cloudStatusDetail = status.lastError ? diagnosticDisplayText(status.lastError, status) : '';
  const writeResult = status.cloudWriteQueued ? 'Cloud write queued' : status.cloudWriteInFlight ? 'Cloud write in progress' : diagnosticResultText(cloudWrite.result, 'write');
  const summaryCards = [['Game origin', window.location.origin, 'Compare this exact origin on each device.'], ['Account session', authLabel, `Account ID match: ${matchLabel}${auth.source ? ` · ${diagnosticDisplayText(auth.source, status)}` : ''}`], ['Cloud sync status', cloudStatus, cloudStatusDetail], ['Local save', diagnosticResultText(local.result, 'local'), local.at ? `Observed: ${diagnosticTimestamp(local.at)}${localDetail ? ` · ${localDetail}` : ''}` : ''], ['App Check', diagnosticResultText(appCheck.result, 'app-check'), appCheck.at ? `Observed: ${diagnosticTimestamp(appCheck.at)}${appCheck.result === 'failed' ? ` · ${appCheck.errorCode || 'unknown'}${appCheck.message ? ` · ${diagnosticDisplayText(appCheck.message, status)}` : ''}` : ''}` : ''], ['Cloud save read', diagnosticResultText(cloudRead.result, 'read'), cloudRead.at ? `Observed: ${diagnosticTimestamp(cloudRead.at)}${readDetail ? ` · ${readDetail}` : ''}${readError ? ` · ${readError}` : ''}` : ''], ['Cloud save write', writeResult, cloudWrite.at ? `Observed: ${diagnosticTimestamp(cloudWrite.at)}${writeDetail ? ` · ${writeDetail}` : ''}${writeError ? ` · ${writeError}` : ''}` : writeDetail], ['Last cloud conflict', diagnosticResultText(conflict.result, 'conflict'), conflict.at ? `${diagnosticTimestamp(conflict.at)}${conflict.resolution ? ` · ${diagnosticDisplayText(conflict.resolution, status)}` : ''}` : 'No conflict outcome observed']].map(([label, value, detail]) => `<div class="save-diagnostic-card"><strong>${escapeHTML(label)}</strong><span>${escapeHTML(value)}</span>${detail ? `<small>${escapeHTML(detail)}</small>` : ''}</div>`).join('');
  const eventRows = events.slice(-18).reverse().map(entry => {
    let title = '';
    let detail = '';
    switch (entry.event) {
      case 'local-save-observed':
        title = entry.found ? 'Local cache found at startup' : 'No local cache found at startup';
        break;
      case 'local-save-requested':
        title = 'Local save requested';
        detail = entry.target ? `Slot: ${entry.target}` : '';
        break;
      case 'local-save-completed':
        title = 'Local save completed';
        detail = `${entry.primaryWritten ? 'Primary saved' : 'Fallback used'} · ${entry.deviceSnapshotWritten ? 'device copy saved' : 'device copy not confirmed'}`;
        break;
      case 'local-save-failed':
        title = 'Local save failed';
        detail = entry.message || entry.code || '';
        break;
      case 'auth-ready':
        title = entry.signedIn ? 'Account session restored' : 'Guest session';
        detail = `Account ID match: ${typeof entry.uidMatchesExpected === 'boolean' ? entry.uidMatchesExpected ? 'yes' : 'no' : 'not checked'}`;
        break;
      case 'auth-ready-failed':
        title = 'Account session check failed';
        detail = entry.code || entry.message || '';
        break;
      case 'app-check-token-started':
        title = 'App Check token request started';
        break;
      case 'app-check-token-completed':
        title = entry.acquired ? 'App Check token acquired' : 'App Check token missing';
        break;
      case 'app-check-token-failed':
        title = 'App Check token request failed';
        detail = `${entry.code || 'unknown'}${entry.message ? ` · ${entry.message}` : ''}`;
        break;
      case 'cloud-save-read-started':
        title = 'Cloud save read started';
        detail = entry.path || '';
        break;
      case 'cloud-save-read-completed':
        title = 'Cloud save read completed';
        detail = `${entry.result || 'completed'}${entry.path ? ` · ${entry.path}` : ''}`;
        break;
      case 'cloud-save-read-failed':
        title = 'Cloud save read failed';
        detail = `${entry.code || 'unknown'}${entry.path ? ` · ${entry.path}` : ''}${entry.message ? ` · ${entry.message}` : ''}`;
        break;
      case 'cloud-document-read-started':
        title = 'Cloud document read started';
        detail = entry.path || '';
        break;
      case 'cloud-document-read-completed':
        title = 'Cloud document read completed';
        detail = `${entry.path || ''}${typeof entry.exists === 'boolean' ? ` · ${entry.exists ? 'document exists' : 'not found'}` : ''}`;
        break;
      case 'cloud-document-read-failed':
        title = 'Cloud document read failed';
        detail = `${entry.path || ''}${entry.code ? ` · ${entry.code}` : ''}${entry.message ? ` · ${entry.message}` : ''}`;
        break;
      case 'cloud-save-write-queued':
        title = 'Cloud write queued';
        detail = `${entry.coalesced ? 'Updated queued save' : 'New queued save'} · ${entry.debounceMs || 0} ms debounce`;
        break;
      case 'cloud-save-write-dequeued':
        title = 'Queued cloud write started';
        detail = `Queue wait: ${Math.max(0, Number(entry.queueAgeMs) || 0)} ms`;
        break;
      case 'cloud-save-write-deferred':
        title = 'Cloud write held';
        detail = entry.reason || '';
        break;
      case 'cloud-save-write-started':
        title = 'Cloud write request started';
        detail = entry.path || '';
        break;
      case 'cloud-save-write-completed':
        title = 'Cloud write request completed';
        detail = `${entry.result || 'completed'}${entry.path ? ` · ${entry.path}` : ''}`;
        break;
      case 'cloud-save-write-failed':
        title = 'Cloud write failed';
        detail = `${entry.code || 'unknown'}${entry.path ? ` · ${entry.path}` : ''}${entry.message ? ` · ${entry.message}` : ''}`;
        break;
      case 'save-conflict-detected':
        {
          title = 'Save conflict detected';
          const resolution = entry.resolution === 'local-save-selected' ? 'Local save selected during account restore' : entry.resolution === 'cloud-save-selected' ? 'Cloud save selected during account restore' : entry.resolution;
          detail = `${entry.source || 'save restore'}${resolution ? ` · ${resolution}` : ''}`;
          break;
        }
      case 'account-save-choice-resolved':
        title = 'Account save choice completed';
        detail = entry.result || '';
        break;
      case 'cloud-save-conflict-detected':
        title = 'Newer cloud save detected';
        detail = entry.resolution || 'Both copies were kept for a choice.';
        break;
      case 'cloud-save-conflict-resolved':
        title = 'Cloud save conflict resolved';
        detail = `${entry.result || 'resolved'}${entry.resolution ? ` · ${entry.resolution}` : ''}`;
        break;
      case 'save-migration-detected':
        title = 'Legacy cloud save detected';
        detail = `${entry.result || ''}${entry.source ? ` · ${entry.source}` : ''}`;
        break;
      default:
        return '';
    }
    return `<div class="save-diagnostic-event"><strong>${escapeHTML(diagnosticDisplayText(title, status))}</strong><time>${escapeHTML(diagnosticTimestamp(entry.at))}</time>${detail ? `<small>${escapeHTML(diagnosticDisplayText(detail, status))}</small>` : ''}</div>`;
  }).filter(Boolean).join('');
  return `<p class="eyebrow">PRIVATE TO THIS DEVICE</p><h2>Save diagnostics</h2><p class="save-diagnostics-intro">This view reports save outcomes only. It does not show save contents, account IDs, email addresses, or tokens. The event list is temporary and stays in this browser tab.</p><div class="save-diagnostics"><div class="save-diagnostic-grid">${summaryCards}</div><div class="save-diagnostic-timeline"><h3>Recent events</h3>${eventRows || '<div class="empty-note">No save events have been recorded in this tab yet.</div>'}</div><div class="save-diagnostic-actions"><button class="button secondary" data-action="account-diagnostics-refresh" type="button">Refresh view</button><button class="button primary" data-action="account-diagnostics-back" type="button">Back to Account</button></div></div>`;
}
function renderAccountOverlay() {
  const status = playerSaveManager.getStatus();
  const pending = status.pendingUser;
  const closeDisabled = Boolean(pending) || accountBusy;
  let content = '';
  if (accountView === 'diagnostics') {
    content = renderSaveDiagnostics(status);
  } else if (accountView === 'create' || accountView === 'login' || accountView === 'reset') {
    content = accountForm(accountView);
    if (accountView === 'login') content += '<button class="button secondary wide" data-action="account-forgot" type="button">Forgot your password?</button>';
  } else if (accountView === 'conflict' && pending) {
    const loadFailed = status.pendingSource === 'login-load-error';
    const liveConflict = status.pendingSource === 'live-conflict';
    const hasCloud = status.pendingAccountExists;
    const hasDevice = status.pendingGuestExists;
    content = loadFailed ? `<p class="eyebrow">ACCOUNT SAVE NOT AVAILABLE</p><h2>Your guest world is safe.</h2><p class="body-copy">We signed in, but could not check the cloud save. Nothing has been replaced. Please try again when you have a connection.</p><button class="button secondary wide" data-action="account-cancel-pending">Continue as Guest</button>` : liveConflict ? `<p class="eyebrow">TWO DEVICES, TWO RECENT SAVES</p><h2>Which world should we keep?</h2><p class="body-copy">The cloud has a newer save than this device. Both copies are kept safe. Choose the cloud world, or explicitly save this device’s progress over it.</p><div class="account-conflict-actions"><button class="button primary" data-action="account-use-cloud">Use the newer cloud world</button>${hasDevice ? '<button class="button secondary" data-action="account-use-device">Keep this device’s world</button>' : ''}</div>` : `<p class="eyebrow">LET’S KEEP THE RIGHT WORLD</p><h2>${hasCloud ? 'An account save is already here.' : 'Choose where this world belongs.'}</h2><p class="body-copy">${hasCloud ? `This account (${escapeHTML(pending.email)}) already has a Pocketwild world. Your guest world will stay saved on this device unless you choose to move it.` : 'There is no cloud save on this account yet. Your guest world will stay on this device unless you choose to save it to the account.'}</p><div class="account-conflict-actions">${hasCloud ? '<button class="button primary" data-action="account-use-cloud">Use the account’s world</button>' : '<button class="button primary" data-action="account-use-cloud">Start a new account world</button>'}${hasDevice ? '<button class="button secondary" data-action="account-use-device">Save this device’s world to the account</button>' : ''}<button class="button secondary" data-action="account-cancel-pending">Stay with my guest world</button></div>`;
  } else if (status.user) {
    const saveStatus = status.cloudReady ? '<div class="account-status-card success"><strong>✓ Cloud Save Active</strong>Your progress is saved locally and synced to this account.</div>' : `<div class="account-status-card warning"><strong>Cloud sync needs a connection</strong>Your local account save is safe. ${escapeHTML(status.lastError || 'Cloud writes are paused until the save can be checked.')}</div>`;
    content = `<p class="eyebrow">YOUR POCKETWILD ACCOUNT</p><h2>Account</h2><div class="account-status-card"><strong>${escapeHTML(status.user.email || 'Pocketwild player')}</strong>Signed in · your player ID is safely attached to this account.</div>${saveStatus}<button class="button secondary wide" data-action="account-logout" ${accountBusy ? 'disabled' : ''}>${accountBusy ? 'Saving…' : 'Log out'}</button><button class="button secondary wide" data-action="new-game">Start a fresh world</button>`;
  } else {
    const guestCopy = status.configured ? 'Your progress is saved on this device. Make an account whenever you’d like to carry it to another device.' : 'Your guest progress is safe on this device. Cloud accounts are not configured for this Pocketwild build yet.';
    content = `<p class="eyebrow">A LITTLE NOTE ABOUT YOUR SAVE</p><h2>Account</h2><div class="account-status-card"><strong>Playing as Guest</strong>${guestCopy}</div>${status.lastError ? `<p class="account-notice">${escapeHTML(status.lastError)}</p>` : ''}${status.configured ? `<div class="button-stack"><button class="button primary" data-action="account-create-view">Create Account</button><button class="button secondary" data-action="account-login-view">Log In</button></div>` : ''}<button class="button secondary wide" data-action="account-continue-guest">Continue as Guest</button><button class="button secondary wide" data-action="new-game">Start a fresh world</button><p class="account-footer">Pocketwild never stores your password in your player save.</p>`;
  }
  if (accountView !== 'diagnostics') {
    content += '<button class="button secondary wide" data-action="account-diagnostics" type="button">View save diagnostics</button>';
  }
  const notice = accountNotice ? `<p class="account-notice" role="status">${escapeHTML(accountNotice)}</p>` : '';
  return `<div class="account-overlay" role="dialog" aria-modal="true" aria-label="Pocketwild account"><section class="account-panel"><div class="account-panel-head"><div><p class="eyebrow">POCKETWILD · ACCOUNT</p></div><button class="phone-close" data-action="close-account" aria-label="Close account" ${closeDisabled ? 'disabled' : ''}>×</button></div>${content}${notice}</section></div>`;
}
function applyAccountSave(rawSave) {
  save = sanitizeSaveData(rawSave);
  state.playerName = sanitizePlayerName(save?.playerName);
  state.displayNameChangedAt = Math.max(0, Math.floor(Number(save?.displayNameChangedAt) || 0));
  state.avatar = validAvatar(save?.avatar);
  state.petId = save?.petId || null;
  state.selectedPet = state.petId;
  state.hasCompletedOpening = Boolean(save?.hasCompletedOpening);
  state.world = sanitizeWorldData(save?.world);
  state.phase = 'title';
  state.phaseAt = state.time;
  state.revealAt = state.time;
  state.overlay = 'account';
  state.roomFeedback = '';
  state.hearts.length = 0;
  state.sparkles.length = 0;
  state.selectedCraftIngredients = [];
  state.craftAnimation = null;
  sound.controlsOpen = false;
  if (save) resumeGame({
    preserveOverlay: true,
    render: false
  });
}
function showAccountResult(result, operation) {
  accountEmail = result.user?.email || accountEmail;
  if (result.status === 'conflict' || result.status === 'load-error') {
    accountView = 'conflict';
    if (result.error) accountNotice = result.error;
    return;
  }
  applyAccountSave(result.save);
  accountView = 'home';
  accountNotice = result.status === 'migrated' ? 'Your Pocketwild adventure is now safely saved to your account!' : result.status === 'created-local-only' ? result.error || 'Your account is ready. Your guest progress is still safe on this device.' : operation === 'login' ? 'Welcome back. Your Pocketwild save is ready.' : 'Your account is ready whenever you are.';
}
async function submitAccountForm(form) {
  if (accountBusy) return;
  const formData = new FormData(form);
  accountEmail = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  const view = form.dataset.accountForm;
  accountBusy = true;
  accountNotice = '';
  renderUI();
  try {
    if (view === 'create') {
      showAccountResult(await playerSaveManager.createAccount(accountEmail, password), 'create');
    } else if (view === 'login') {
      showAccountResult(await playerSaveManager.completeLogin(accountEmail, password), 'login');
    } else if (view === 'reset') {
      await playerSaveManager.sendPasswordReset(accountEmail);
      accountView = 'login';
      accountNotice = 'If there’s an account for that email, a password-reset link is on its way.';
    }
  } catch (error) {
    accountNotice = authMessage(error);
  } finally {
    accountBusy = false;
    renderUI();
  }
}
async function handleAccountAction(action) {
  if (accountBusy) return;
  accountNotice = '';
  if (action === 'open-account') {
    accountView = playerSaveManager.getStatus().pendingUser ? 'conflict' : 'home';
    accountEmail = playerSaveManager.getStatus().user?.email || accountEmail;
    state.overlay = 'account';
    renderUI();
    return;
  }
  if (action === 'account-diagnostics') {
    accountView = 'diagnostics';
    state.overlay = 'account';
    renderUI();
    return;
  }
  if (action === 'account-diagnostics-refresh') {
    renderUI();
    return;
  }
  if (action === 'account-diagnostics-back') {
    accountView = playerSaveManager.getStatus().pendingUser ? 'conflict' : 'home';
    renderUI();
    return;
  }
  if (action === 'close-account' || action === 'account-continue-guest' || action === 'account-back') {
    accountView = 'home';
    if (!playerSaveManager.getStatus().pendingUser) state.overlay = null;
    renderUI();
    return;
  }
  if (action === 'account-create-view') accountView = 'create';else if (action === 'account-login-view') accountView = 'login';else if (action === 'account-forgot') accountView = 'reset';else if (action === 'account-use-cloud' || action === 'account-use-device' || action === 'account-cancel-pending' || action === 'account-logout') {
    accountBusy = true;
    renderUI();
    try {
      if (action === 'account-use-cloud') {
        const result = await playerSaveManager.chooseAccountSave();
        applyAccountSave(result.save);
        accountNotice = 'Your account’s Pocketwild world is ready.';
        accountView = 'home';
      } else if (action === 'account-use-device') {
        const result = await playerSaveManager.chooseDeviceSave();
        applyAccountSave(result.save);
        accountNotice = 'Your device world has been safely saved to the account.';
        accountView = 'home';
      } else if (action === 'account-cancel-pending') {
        const guest = await playerSaveManager.cancelPendingAuth();
        applyAccountSave(guest);
        accountView = 'home';
        accountEmail = '';
        accountNotice = 'You’re continuing with your guest world. It is still saved on this device.';
      } else {
        persist();
        const guest = await playerSaveManager.logout();
        applyAccountSave(guest);
        accountView = 'home';
        accountEmail = '';
        accountNotice = 'You’re logged out. Your account save and this device’s guest save remain safe.';
      }
    } catch (error) {
      accountNotice = authMessage(error);
      accountView = playerSaveManager.getStatus().pendingUser ? 'conflict' : 'home';
    } finally {
      accountBusy = false;
      renderUI();
    }
    return;
  } else return;
  state.overlay = 'account';
  renderUI();
}
playerSaveManager.onConflict = () => {
  accountView = 'conflict';
  accountNotice = '';
  state.overlay = 'account';
  renderUI();
};
function updateLiveTimers() {
  const now = Date.now();
  ui.querySelectorAll('[data-countdown-at]').forEach(node => {
    const target = Number(node.dataset.countdownAt);
    if (!Number.isFinite(target)) return;
    const left = Math.max(0, target - now);
    const kind = node.dataset.countdownKind;
    const time = formatCountdown(left);
    if (kind === 'daily') node.textContent = time;else if (kind === 'daily-objective') node.textContent = left > 0 ? time : 'refreshing…';else if (kind === 'ticket') node.textContent = left > 0 ? `in ${time}` : 'ready';else if (kind === 'auto-explore') node.textContent = left > 0 ? `${Math.ceil(left / 1000)}s` : 'starting…';else if (kind === 'shop-restock') node.textContent = left > 0 ? time : 'restocking…';else if (kind === 'market-auction') node.textContent = left > 0 ? time : 'auction ended';else if (kind === 'market-listing') node.textContent = left > 0 ? time : 'listing ended';else node.textContent = left > 0 ? time : 'ready';
  });
}
function renderPetDialogueBubble() {
  const active = petDialogueManager.active(state.world);
  if (!active || !state.petId || OPENING_PHASES.has(state.phase) || state.overlay || state.world.pendingOfflineReward) return '';
  const pet = currentPet();
  const position = petPosition();
  const image = petImages[state.petId];
  const ratio = image?.naturalWidth && image?.naturalHeight ? image.naturalWidth / image.naturalHeight : 1;
  const petHeight = Math.min(H * 0.205, W * 0.38, W * 0.43 / ratio) * petRenderScale();
  const camera = ROOM_SCENE_PHASES.includes(state.phase) ? roomCamera() : null;
  const screenX = camera ? roomCameraPoint(position.x, 0, camera).x : position.x;
  const centerY = camera ? roomCameraPoint(0, position.bottom - petHeight / 2, camera).y : position.bottom - petHeight / 2;
  const width = Math.min(280, Math.max(210, W - 24));
  let left = Math.max(8, Math.min(W - width - 8, screenX - width * 0.66));
  const textLength = Array.from(active.text || '').length;
  const charsPerLine = Math.max(20, Math.floor((width - 70) / 6.5));
  const bubbleHeight = Math.min(158, Math.max(76, 72 + Math.ceil(textLength / charsPerLine) * 15));
  const taskbar = ui.querySelector('.basecamp-taskbar');
  const taskbarTop = taskbar?.getBoundingClientRect().top;
  const bottomLimit = Math.min(H - bubbleHeight - 12, Number.isFinite(taskbarTop) ? taskbarTop - bubbleHeight - 8 : H - bubbleHeight - (state.phase === 'basecamp' ? 110 : 12));
  let top = Math.max(108, Math.min(H * 0.25, centerY - H * 0.57, bottomLimit));
  const obstacles = [...ui.querySelectorAll('.next-artifact-tracker, .zone-map-shortcut, .room-feedback')].map(node => node.getBoundingClientRect()).filter(rect => rect.width > 0 && rect.height > 0);
  const intersects = rect => left < rect.right + 4 && left + width > rect.left - 4 && top < rect.bottom + 4 && top + bubbleHeight > rect.top - 4;
  const collisions = obstacles.filter(intersects);
  if (collisions.length) {
    const below = Math.max(...collisions.map(rect => rect.bottom)) + 9;
    if (below <= bottomLimit) {
      top = below;
    } else {
      const leftOf = Math.min(...collisions.map(rect => rect.left)) - width - 9;
      const rightOf = Math.max(...collisions.map(rect => rect.right)) + 9;
      if (leftOf >= 8) left = leftOf;else if (rightOf + width <= W - 8) left = rightOf;else top = Math.max(108, bottomLimit);
    }
  }
  const important = ['level-up', 'milestone', 'master', 'unlock'].includes(active.visual);
  const visualClass = active.visual === 'rare' ? ' rare' : important ? ' major' : '';
  const label = active.headline || (active.category === 'hint' ? 'A little thought' : 'A little hello');
  return `<button type="button" class="pet-dialogue-bubble${visualClass}" data-action="dismiss-pet-dialogue" aria-label="${escapeHTML(pet?.name || 'Your companion')} says: ${escapeHTML(active.text)}. Tap to dismiss." style="left:${left}px;top:${top}px;width:${width}px" aria-live="polite"><span class="pet-dialogue-heading">${escapeHTML(pet?.name || 'Your friend')} · ${escapeHTML(label)}</span><span class="pet-dialogue-copy">“${escapeHTML(active.text)}”</span><span class="pet-dialogue-close" aria-hidden="true">×</span></button>`;
}
function avoidRoomFeedbackHudCollisions() {
  const feedback = ui.querySelector('.room-feedback');
  if (!feedback) return;
  const obstacles = [...ui.querySelectorAll('.next-artifact-tracker, .zone-map-shortcut')].map(node => node.getBoundingClientRect()).filter(rect => rect.width > 0 && rect.height > 0);
  const feedbackRect = feedback.getBoundingClientRect();
  const collisions = obstacles.filter(rect => feedbackRect.left < rect.right + 4 && feedbackRect.right > rect.left - 4 && feedbackRect.top < rect.bottom + 4 && feedbackRect.bottom > rect.top - 4);
  if (!collisions.length) return;
  const taskbarTop = ui.querySelector('.basecamp-taskbar')?.getBoundingClientRect().top;
  const bottomLimit = Math.min(H - feedbackRect.height - 12, Number.isFinite(taskbarTop) ? taskbarTop - feedbackRect.height - 8 : H - feedbackRect.height - 12);
  const below = Math.max(...collisions.map(rect => rect.bottom)) + 9;
  if (below <= bottomLimit) {
    feedback.style.top = `${below}px`;
    return;
  }
  const above = Math.min(...collisions.map(rect => rect.top)) - feedbackRect.height - 9;
  if (above >= 106) feedback.style.top = `${above}px`;
}
function avoidPetDialogueHudCollisions() {
  const bubble = ui.querySelector('.pet-dialogue-bubble');
  if (!bubble) return;
  const obstacles = [...ui.querySelectorAll('.next-artifact-tracker, .zone-map-shortcut, .room-feedback')].map(node => node.getBoundingClientRect()).filter(rect => rect.width > 0 && rect.height > 0);
  const bubbleRect = bubble.getBoundingClientRect();
  const collisions = obstacles.filter(rect => bubbleRect.left < rect.right + 4 && bubbleRect.right > rect.left - 4 && bubbleRect.top < rect.bottom + 4 && bubbleRect.bottom > rect.top - 4);
  if (!collisions.length) return;
  const taskbarTop = ui.querySelector('.basecamp-taskbar')?.getBoundingClientRect().top;
  const bottomLimit = Math.min(H - bubbleRect.height - 12, Number.isFinite(taskbarTop) ? taskbarTop - bubbleRect.height - 8 : H - bubbleRect.height - (state.phase === 'basecamp' ? 110 : 12));
  const below = Math.max(...collisions.map(rect => rect.bottom)) + 9;
  if (below <= bottomLimit) {
    bubble.style.top = `${below}px`;
    return;
  }
  const leftOf = Math.min(...collisions.map(rect => rect.left)) - bubbleRect.width - 9;
  const rightOf = Math.max(...collisions.map(rect => rect.right)) + 9;
  if (leftOf >= 8) bubble.style.left = `${leftOf}px`;else if (rightOf + bubbleRect.width <= W - 8) bubble.style.left = `${rightOf}px`;else bubble.style.top = `${Math.max(108, bottomLimit)}px`;
}
function renderDevSaveTools() {
  if (!DEV_SAVE_TOOLS) return '';
  return `<details class="dev-save-tools"><summary>DEV · SAVE & TICKETS</summary><div class="dev-save-controls">
    <button type="button" data-action="dev-save-game">Save Game</button>
    <button type="button" data-action="dev-load-local">Load Local Save</button>
    <div class="dev-ticket-readout">Current world · 🎟 ${state.world.tickets}/${TICKET_SETTINGS.cap}</div>
    <div class="dev-ticket-actions">
      <button type="button" data-action="dev-ticket-add-one">+1 ticket</button>
      <button type="button" data-action="dev-ticket-add-five">+5 tickets</button>
      <button type="button" data-action="dev-ticket-fill">Fill to cap</button>
      <button type="button" data-action="dev-ticket-clear">Clear tickets</button>
      <button type="button" data-action="dev-ticket-reset-timer">Reset regen timer</button>
      <button type="button" data-action="dev-ticket-checks">Run ticket checks</button>
    </div>
    <output role="status" aria-live="polite">${escapeHTML(state.devSaveNote || 'Ticket checks use temporary worlds and never touch your save.')}</output>
  </div></details>`;
}
function handleDevSaveAction(action) {
  if (!DEV_SAVE_TOOLS) return;
  if (action === 'dev-ticket-checks') {
    const result = runTicketManagerChecks();
    const passedCount = result.checks.filter(check => check.passed).length;
    const rows = result.checks.map(check => `${check.passed ? '✓' : '✗'} ${check.name}${check.error ? ` — ${check.error}` : ''}`);
    state.devSaveNote = `Ticket checks · ${passedCount}/${result.checks.length} passed · live save untouched.\n${rows.join('\n')}`;
    console.info('[Pocketwild ticket manager checks]', result);
    renderUI();
    return;
  }
  if (action.startsWith('dev-ticket-')) {
    if (state.phase === 'title' || state.phase === 'restart-confirm') {
      state.devSaveNote = 'Continue into your world before changing its tickets; title-screen saves are protected.';
      renderUI();
      return;
    }
    const now = Date.now();
    const before = state.world.tickets;
    const actions = {
      'dev-ticket-add-one': {
        balance: before + 1,
        label: 'Added 1 ticket'
      },
      'dev-ticket-add-five': {
        balance: before + 5,
        label: 'Added 5 tickets'
      },
      'dev-ticket-fill': {
        balance: TICKET_SETTINGS.cap,
        label: 'Filled ticket pouch'
      },
      'dev-ticket-clear': {
        balance: 0,
        label: 'Cleared ticket pouch'
      }
    };
    if (action === 'dev-ticket-reset-timer') {
      ticketManager.resetRegenerationTimer(state.world, now);
      persist();
      state.devSaveNote = `Regeneration timer reset · ${state.world.tickets}/${TICKET_SETTINGS.cap} tickets · saved locally.`;
      renderUI();
      return;
    }
    const selected = actions[action];
    if (!selected) return;
    ticketManager.debugSetBalance(state.world, selected.balance, {
      now,
      source: `developer ${action}`
    });
    const written = persist();
    state.devSaveNote = `${selected.label} · ${state.world.tickets}/${TICKET_SETTINGS.cap}${written ? ' · saved locally' : ' · session only'}.`;
    renderUI();
    return;
  }
  if (action === 'dev-save-game') {
    const written = persist();
    if (!written) {
      state.devSaveNote = 'This opening state is not ready to save yet.';
      renderUI();
      return;
    }
    state.devSaveNote = `Saved locally · revision ${written.revision}.`;
    const status = playerSaveManager.getStatus();
    if (status.user && status.cloudReady) {
      playerSaveManager.flush().then(synced => {
        state.devSaveNote = synced ? 'Saved locally and synced to this account.' : 'Saved locally · cloud save needs review.';
        renderUI();
      }).catch(error => {
        state.devSaveNote = `Saved locally · ${error?.message || 'cloud sync is unavailable.'}`;
        renderUI();
      });
    }
    renderUI();
    return;
  }
  if (action === 'dev-load-local') {
    const local = playerSaveManager.readCurrentLocalSave();
    if (!local) {
      state.devSaveNote = 'No valid local save was found on this device.';
      renderUI();
      return;
    }
    save = sanitizeSaveData(local);
    state.overlay = null;
    sound.controlsOpen = false;
    resumeGame();
    state.devSaveNote = `Loaded local revision ${save?.revision || 0}.`;
    renderUI();
  }
}
function companionCinematicForId(id) {
  return COMPANION_MILESTONES.find(milestone => milestone.id === id) || null;
}
function renderCompanionCinematic() {
  const active = state.cinematic;
  if (!active) return '';
  const milestone = active.milestone;
  const finaleArtifacts = milestone.level === 50 ? COMPANION_MILESTONES.map(entry => `<img src="${escapeHTML(entry.artPath)}" alt="" />`).join('') : '';
  const heroArt = `<img src="${escapeHTML(milestone.artPath)}" alt="" />`;
  const elapsed = Math.max(0, Math.min(milestone.duration, state.time - active.startedAt));
  return `<div class="evolution-overlay" role="dialog" aria-modal="true" aria-labelledby="evolution-title" style="--evolution-duration:${milestone.duration}s"><section class="evolution-card${milestone.level === 50 ? ' evolution-finale' : ''}" data-evolution-beat="${milestone.beat}" style="--evolution-glow:${milestone.color};--evolution-accent:${milestone.accent}"><span class="evolution-kicker">${active.replay ? 'A LITTLE MOMENT TO REMEMBER' : 'A POCKETWILD AWAKENING'} · LEVEL ${milestone.level}</span><h2 id="evolution-title">${escapeHTML(milestone.title)}</h2><div class="evolution-hero-art" aria-hidden="true">${heroArt}</div>${finaleArtifacts ? `<div class="evolution-artifact-ribbon" aria-label="All five milestone keepsakes gather">${finaleArtifacts}</div>` : ''}<p class="evolution-artifact-name">${escapeHTML(milestone.artifact)} remembers.</p><p class="evolution-line">${escapeHTML(milestone.line)}</p><div class="evolution-stage-pips" aria-label="Companion awakening ${state.world.companionEvolutionStage} of ${COMPANION_MILESTONES.length}" role="img">${COMPANION_MILESTONES.map((entry, index) => `<span class="${index < state.world.companionEvolutionStage ? 'lit' : ''}"></span>`).join('')}</div><div class="evolution-timer" aria-hidden="true"><span style="animation-delay:-${elapsed}s"></span></div><button class="button secondary evolution-skip" type="button" data-action="skip-companion-cinematic">Skip moment</button><small class="evolution-escape-hint">or press Esc</small></section></div>`;
}
function finishCompanionCinematic() {
  if (!state.cinematic) return;
  const finished = state.cinematic;
  state.cinematic = null;
  if (state.overlay === 'cinematic') state.overlay = null;
  persist();
  renderUI();
  if (finished.replay) {
    requestAnimationFrame(() => ui.querySelector(`[data-action="replay-companion-cinematic"][data-milestone="${finished.milestone.id}"]`)?.focus());
  }
}
function startCompanionCinematic(milestone, {
  replay = false
} = {}) {
  if (!milestone || state.cinematic) return false;
  if (!replay) {
    const queue = state.world.companionCinematicQueue || [];
    const queuedIndex = queue.indexOf(milestone.id);
    if (queuedIndex >= 0) queue.splice(queuedIndex, 1);
    state.world.companionCinematicSeen = [...new Set([...(state.world.companionCinematicSeen || []), milestone.id])];
  }
  state.cinematic = {
    milestone,
    startedAt: state.time,
    duration: milestone.duration,
    replay
  };
  state.overlay = 'cinematic';
  persist();
  renderUI();
  requestAnimationFrame(() => ui.querySelector('[data-action="skip-companion-cinematic"]')?.focus());
  return true;
}
function startNextCompanionCinematicIfSafe() {
  if (state.cinematic || state.overlay || state.profileDialog || state.world.pendingOfflineReward || state.explorationMapOpen || state.craftAnimation || state.world.activeExpedition > 0 || autoExploreActive) return false;
  if (state.phase !== 'basecamp' && state.phase !== 'phone') return false;
  if (state.phase === 'phone' && state.world.phoneSection !== 'home') return false;
  const milestone = companionCinematicForId(state.world.companionCinematicQueue?.[0]);
  return milestone ? startCompanionCinematic(milestone) : false;
}
function renderUI() {
  const trackerWasOpen = ui.querySelector('.next-artifact-tracker')?.open;
  if (state.phase === 'phone' && state.world.phoneSection === 'shop' && ensureRoomShopRotation(state.world, Date.now())) persist();
  if (state.petId && !OPENING_PHASES.has(state.phase)) objectiveManager.refresh(state.world, objectiveContext());
  const renderers = {
    title: renderTitle,
    creation: renderCreation,
    'player-name': renderPlayerName,
    'pet-select': renderPetSelection,
    'restart-confirm': renderRestartConfirm,
    'room-reveal': renderRoomReveal,
    'pet-intro': renderPetIntro,
    'window-moment': renderWindowMoment,
    explore: renderExploreInvitation,
    destination: renderDestination,
    departing: renderTravel,
    meadow: renderTravel,
    returning: renderTravel,
    'reward-reveal': renderRewardReveal,
    basecamp: renderBasecamp,
    phone: renderPhone
  };
  let markup = (renderers[state.phase] || renderTitle)();
  if (NEXT_ARTIFACT_TRACKER_PHASES.has(state.phase)) {
    const defaultOpen = false;
    markup += renderNextArtifactTracker(trackerWasOpen ?? defaultOpen);
  }
  if (state.overlay === 'cinematic') markup += renderCompanionCinematic();else if (state.overlay === 'account') markup += renderAccountOverlay();else if (state.world.pendingOfflineReward) markup += renderWelcomeBack();else if (state.overlay === 'objectives') markup += renderObjectiveOverlay();
  if (state.profileDialog) markup += renderProfileDialog();
  if (state.roomFeedback && state.time < state.roomFeedbackUntil) {
    markup += `<div class="room-feedback" role="status">${escapeHTML(state.roomFeedback)}</div>`;
  }
  markup += renderPetDialogueBubble();
  markup += renderDevSaveTools();
  if (state.explorationMapOpen) markup += renderExplorationMap();
  if (autoExploreActive) markup += autoExploreFlightStatus();
  ui.innerHTML = markup;
  positionAutoExploreBanner();
  avoidRoomFeedbackHudCollisions();
  avoidPetDialogueHudCollisions();
  updateLiveTimers();
  const focusMilestoneId = state.milestoneCraftFocusId;
  state.milestoneCraftFocusId = null;
  if (state.phase === 'basecamp' && !state.overlay && !state.cinematic && !state.world.pendingOfflineReward && !state.explorationMapOpen && state.talentPointToast > 0) {
    const points = state.talentPointToast;
    markup += `<aside class="talent-point-toast" role="status" aria-live="polite"><span>✧ ${points} Wildsoul talent point${points === 1 ? '' : 's'} ready. Spend it whenever you like.</span><div><button type="button" data-action="open-talents-from-toast">Choose a talent</button><button type="button" class="talent-toast-close" data-action="dismiss-talent-toast" aria-label="Dismiss talent point notice">×</button></div></aside>`;
  }
  if (focusMilestoneId && state.phase === 'phone' && state.world.phoneSection === 'crafting') {
    requestAnimationFrame(() => {
      const card = [...ui.querySelectorAll('[data-milestone-card]')].find(entry => entry.dataset.milestoneCard === focusMilestoneId);
      card?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    });
  }
}
function beginExpedition({
  fromBasecamp = false
} = {}) {
  const canStartFromCurrentPhase = state.phase === 'destination' || fromBasecamp && state.phase === 'basecamp';
  if (!canStartFromCurrentPhase || !state.petId) return false;
  if (state.phase === 'destination' && !OPENING_TRANSITIONS.destination.includes('departing')) return false;
  refreshTickets();
  const selectedArea = AREA_CATALOG.find(area => area.id === state.world.activeAreaId);
  const area = areaAccessible(state.world, selectedArea) ? selectedArea : AREA_CATALOG.find(entry => areaAccessible(state.world, entry));
  if (!area || !ticketManager.spend(state.world, 1, {
    now: Date.now(),
    source: 'expedition departure'
  })) {
    if (state.world.tickets <= 0) {
      addNotification('A new expedition ticket is growing quietly.');
      setRoomFeedback('A new ticket is growing quietly. Your friend is happy to wait here with you.');
    }
    persist();
    renderUI();
    return false;
  }
  const startedFromDestination = state.phase === 'destination';
  state.roomFeedback = '';
  state.roomFeedbackUntil = 0;
  state.world.activeAreaId = area.id;
  state.world.trailChoicesSeen = [...new Set([...(state.world.trailChoicesSeen || []), area.id])];
  state.world.expeditions += 1;
  state.world.activeExpedition = state.world.expeditions;
  state.world.activeExpeditionAreaId = area.id;
  state.world.activeExpeditionXpStart = state.world.xp;
  state.world.revealIndex = 0;
  state.world.activeExpeditionData = makeExpeditionContext(area.id);
  state.world.activeExpeditionPityTargets = area.id === 'meadow' && state.world.activeExpedition <= 2 ? [] : eligibleMilestoneDropIds(state.world.activeExpeditionData);
  state.world.activeExpeditionRewards = generateExpeditionRewards(state.world.activeExpedition, state.world.activeExpeditionData);
  if (startedFromDestination) {
    if (!transitionOpening('departing')) return;
  } else {
    state.phase = 'departing';
    state.phaseAt = state.time;
  }
  state.reactionUntil = state.time + 1.2;
  playPetInteractionSound();
  persist();
  renderUI();
  return true;
}
function startAutoExplore() {
  const fromBasecamp = state.phase === 'basecamp';
  if (autoExploreActive || !['destination', 'basecamp'].includes(state.phase) || !state.petId) return;
  refreshTickets();
  const selectedArea = AREA_CATALOG.find(area => area.id === state.world.activeAreaId);
  const area = areaAccessible(state.world, selectedArea) ? selectedArea : AREA_CATALOG.find(entry => areaAccessible(state.world, entry));
  if (state.world.tickets <= 0 || !area) {
    const message = state.world.tickets <= 0 ? 'Out of tickets. Auto Explore can start again when a ticket is ready.' : 'Your companion needs an open trail before Auto Explore can begin.';
    setRoomFeedback(message);
    renderUI();
    return;
  }
  if (fromBasecamp && areasAwaitingTrailChoice().length > 0) {
    state.phase = 'destination';
    setRoomFeedback('A new trail is open. Choose it together before Auto Explore can continue.');
    addNotification('Choose the newly opened trail before Auto Explore.');
    persist();
    renderUI();
    return;
  }
  autoExploreActive = true;
  autoExploreNextAt = 0;
  autoExploreActionAt = state.time + 0.55;
  if (!beginExpedition({
    fromBasecamp
  })) {
    const message = state.world.tickets <= 0 ? 'Out of tickets. Auto Explore stopped; your companion is home safely.' : 'Auto Explore paused because your companion cannot explore from here.';
    deactivateAutoExplore(message);
    persist();
    renderUI();
  }
}
function basecampAutoExploreControl(extraClass = '') {
  const tickets = state.world.tickets;
  if (autoExploreActive) {
    return `<button type="button" class="basecamp-auto-explore-button basecamp-auto-explore-stop ${extraClass}" data-action="stop-auto-explore" aria-label="Stop Auto Explore. ${tickets} tickets remain"><span class="basecamp-action-icon" aria-hidden="true">■</span><span class="basecamp-action-copy"><strong>Stop Auto Explore</strong><small>Outing finishes safely</small></span><span class="basecamp-action-ticket">🎟 ${tickets}</span></button>`;
  }
  return `<button type="button" class="basecamp-auto-explore-button ${extraClass}" data-action="start-auto-explore" ${tickets > 0 ? '' : 'disabled'} aria-label="${tickets > 0 ? `Start Auto Explore with ${tickets} ${tickets === 1 ? 'ticket' : 'tickets'}` : 'Auto Explore unavailable. No tickets available.'}"><span class="basecamp-action-icon" aria-hidden="true">🧭</span><span class="basecamp-action-copy"><strong>Auto Explore</strong><small>Automatic trail outings</small></span><span class="basecamp-action-ticket">🎟 ${tickets}</span></button>`;
}
function autoExploreStopControl(extraClass = '') {
  if (!autoExploreActive) return '';
  return `<button type="button" class="auto-explore-stop-control ${extraClass}" data-action="stop-auto-explore" aria-label="Stop Auto Explore. ${state.world.tickets} tickets remain">Stop Auto Explore · 🎟 ${state.world.tickets}</button>`;
}
function autoExploreStatusMarkup(variant = '') {
  if (!autoExploreActive) return '';
  const now = Date.now();
  const countdown = state.phase === 'basecamp' && autoExploreNextAt > now ? `<strong>Next expedition in <span data-countdown-at="${autoExploreNextAt}" data-countdown-kind="auto-explore" aria-live="off">${Math.ceil((autoExploreNextAt - now) / 1000)}s</span></strong>` : state.phase === 'basecamp' ? '<strong>Next expedition is getting ready…</strong>' : '<strong>Your companion is out exploring…</strong>';
  return `<div class="basecamp-auto-explore-status ${variant}" role="status" aria-live="off"><span class="auto-explore-spark" aria-hidden="true">✦</span><span>Auto-Exploring… ${countdown}</span></div>`;
}
function autoExploreFlightStatus() {
  if (!autoExploreActive) return '';
  return '<div class="auto-explore-flight-status" role="status" aria-live="off"><span class="auto-explore-spark" aria-hidden="true">✦</span><span>Auto-Exploring in Progress</span></div>';
}
function positionAutoExploreBanner() {
  const banner = ui.querySelector('.auto-explore-flight-status');
  if (!banner) return;
  const bannerHeight = banner.getBoundingClientRect().height || 38;
  const gap = 10;
  const progressBottom = ui.querySelector('.progress-hud')?.getBoundingClientRect().bottom || 0;
  const minimumTop = Math.max(112, progressBottom + gap);
  const taskbar = ui.querySelector('.basecamp-taskbar');
  const panel = ui.querySelector('.reward-panel, .expedition-panel, .destination-panel');
  let top;
  if (taskbar) {
    const taskbarTop = taskbar.getBoundingClientRect().top;
    const image = petImages[state.petId];
    const ratio = image?.naturalWidth && image?.naturalHeight ? image.naturalWidth / image.naturalHeight : 1;
    const petHeight = Math.min(H * 0.205, W * 0.38, W * 0.43 / ratio) * petRenderScale();
    const position = petPosition();
    const camera = ROOM_SCENE_PHASES.includes(state.phase) ? roomCamera() : null;
    const petTop = camera ? roomCameraPoint(0, position.bottom - petHeight, camera).y : position.bottom - petHeight;
    const petBottom = camera ? roomCameraPoint(0, position.bottom, camera).y : position.bottom;
    const freeGap = taskbarTop - petBottom;
    top = freeGap >= bannerHeight + gap * 2 ? petBottom + (freeGap - bannerHeight) / 2 : Math.min(petTop - bannerHeight - gap, taskbarTop - bannerHeight - gap);
  } else if (panel) {
    const panelRect = panel.getBoundingClientRect();
    const belowPanel = panelRect.bottom + bannerHeight + gap <= H - 12;
    top = belowPanel ? panelRect.bottom + gap : panelRect.top - bannerHeight - gap;
  } else {
    const image = petImages[state.petId];
    const ratio = image?.naturalWidth && image?.naturalHeight ? image.naturalWidth / image.naturalHeight : 1;
    const petHeight = Math.min(H * 0.205, W * 0.38, W * 0.43 / ratio) * petRenderScale();
    const position = petPosition();
    top = position.bottom - petHeight - bannerHeight - gap;
  }
  top = Math.max(minimumTop, Math.min(H - bannerHeight - 12, top));
  banner.style.top = `${top}px`;
}
function deactivateAutoExplore(message = '') {
  if (!autoExploreActive) return false;
  autoExploreActive = false;
  autoExploreActionAt = 0;
  autoExploreNextAt = 0;
  if (message) {
    addNotification(message);
    setRoomFeedback(message);
  }
  return true;
}
function stopAutoExplore(message = 'Auto Explore stopped. This outing will finish normally.') {
  if (!deactivateAutoExplore(message)) return;
  persist();
  renderUI();
}
function advanceAutoExplore() {
  if (!autoExploreActive) return;
  if (state.cinematic || state.overlay || state.profileDialog || state.world.pendingOfflineReward || state.explorationMapOpen || state.craftAnimation) {
    stopAutoExplore('Auto Explore paused because another screen needs your attention. This outing will finish normally.');
    return;
  }
  if (!['departing', 'meadow', 'returning', 'reward-reveal', 'basecamp'].includes(state.phase)) {
    stopAutoExplore('Auto Explore paused because your companion cannot explore from this screen.');
    return;
  }
  if (state.phase === 'reward-reveal') {
    if (state.time < autoExploreActionAt) return;
    autoExploreActionAt = state.time + 0.55;
    claimReward();
    return;
  }
  if (state.phase !== 'basecamp') return;
  refreshTickets();
  if (state.world.tickets <= 0) {
    stopAutoExplore('Out of tickets. Auto Explore stopped; your companion is home safely.');
    return;
  }
  if (areasAwaitingTrailChoice().length > 0) {
    deactivateAutoExplore('A new trail is open. Choose it on the map before Auto Explore can continue.');
    persist();
    renderUI();
    return;
  }
  if (autoExploreNextAt && Date.now() < autoExploreNextAt) return;
  autoExploreNextAt = 0;
  autoExploreActionAt = state.time + 0.55;
  if (!beginExpedition({
    fromBasecamp: true
  })) {
    const message = state.world.tickets <= 0 ? 'Out of tickets. Auto Explore stopped; your companion is home safely.' : 'Auto Explore paused because your companion cannot explore from here.';
    stopAutoExplore(message);
  }
}
function addNotification(message) {
  state.world.notifications.unshift(String(message).slice(0, 140));
  state.world.notifications = state.world.notifications.slice(0, 20);
}
function setRoomFeedback(message) {
  state.roomFeedback = String(message || '').slice(0, 180);
  state.roomFeedbackUntil = state.time + 4;
}
function currencyField(currency) {
  return currency === 'gold' || currency === 'stardust' ? currency : null;
}
function currencyBalance(currency) {
  const field = currencyField(currency);
  return field ? Math.max(0, Math.floor(Number(state.world[field]) || 0)) : 0;
}
function awardCurrency(currency, amount) {
  const field = currencyField(currency);
  const requested = Math.max(0, Math.floor(Number(amount) || 0));
  if (!field || !requested) return 0;
  const before = currencyBalance(field);
  state.world[field] = Math.min(ECONOMY_CONFIG.maxBalance, before + requested);
  return state.world[field] - before;
}
function spendCurrency(currency, amount) {
  const field = currencyField(currency);
  const cost = Math.max(0, Math.floor(Number(amount) || 0));
  if (!field || !cost || currencyBalance(field) < cost) return false;
  state.world[field] = currencyBalance(field) - cost;
  return true;
}
function currencyLabel(currency, amount) {
  const value = Math.max(0, Math.floor(Number(amount) || 0)).toLocaleString();
  return currency === 'stardust' ? `${value} ✧` : `${value}g`;
}
function npcSellPrice(itemId) {
  const item = ITEM_CATALOG[itemId];
  if (!item || item.artifact || item.rarity === 'Unique' || item.category === 'Creatures' || item.category === 'Special items' || item.shopRoomItem) return 0;
  const configuredPrice = Number(ECONOMY_CONFIG.npcBuybackGold[itemId]);
  const catalogPrice = Number(item.sellValue);
  const price = Number.isFinite(configuredPrice) && configuredPrice > 0 ? configuredPrice : catalogPrice;
  return Number.isFinite(price) ? Math.max(0, Math.min(ECONOMY_CONFIG.maxBalance, Math.floor(price))) : 0;
}
function calculateAutoSellProtection(world = state.world) {
  const reserved = new Map();
  const reasons = new Map();
  let protectAll = false;
  const reserveItem = (itemId, amount, reason) => {
    if (typeof itemId !== 'string' || !Object.hasOwn(ITEM_CATALOG, itemId)) {
      protectAll = true;
      return;
    }
    const owned = Math.max(0, Math.floor(Number(world.inventory?.[itemId]) || 0));
    if (!owned) return;
    const requested = Number(amount);
    if (Number.isFinite(requested) && requested <= 0) return;
    const safeAmount = Number.isFinite(requested) ? Math.min(owned, Math.ceil(requested)) : owned;
    reserved.set(itemId, Math.min(owned, (reserved.get(itemId) || 0) + safeAmount));
    if (reason) {
      const labels = reasons.get(itemId) || [];
      if (!labels.includes(reason)) labels.push(reason);
      reasons.set(itemId, labels);
    }
  };
  const reserveIngredients = (ingredients, reason) => {
    if (!Array.isArray(ingredients)) {
      protectAll = true;
      return;
    }
    for (const ingredient of ingredients) {
      if (!ingredient || typeof ingredient !== 'object' || !Object.hasOwn(ITEM_CATALOG, ingredient.itemId)) {
        protectAll = true;
        continue;
      }
      const quantity = Number(ingredient.quantity);
      reserveItem(ingredient.itemId, Number.isFinite(quantity) && quantity > 0 ? quantity : Infinity, reason);
    }
  };
  const reserveObjectiveRequirement = (record, reason, completed = 0) => {
    if (Array.isArray(record)) {
      for (const entry of record) reserveObjectiveRequirement(entry, reason, 0);
      return;
    }
    if (typeof record === 'string') {
      if (Object.hasOwn(ITEM_CATALOG, record)) reserveItem(record, Infinity, reason);else protectAll = true;
      return;
    }
    if (!record || typeof record !== 'object') {
      if (record !== null && record !== undefined) protectAll = true;
      return;
    }
    const itemIdKeys = ['itemId', 'item_id', 'requiredItemId', 'required_item_id'];
    const itemId = itemIdKeys.map(key => record[key]).find(value => value !== undefined && value !== null);
    const requirementType = String(record.type || '').toLowerCase();
    if (typeof itemId === 'string') {
      const target = Number(record.target ?? record.quantity ?? record.amount ?? record.count);
      const progress = Number(record.progress ?? completed) || 0;
      reserveItem(itemId, Number.isFinite(target) ? Math.max(0, target - progress) : Infinity, reason);
    } else if (itemId !== undefined || /item|collect|deliver|inventory|gather-item/.test(requirementType) || record.requiresItem === true) {
      protectAll = true;
    }
    const nonItemRequirementKeys = new Set(['pet', 'hasPet', 'system', 'discoverable', 'unlockedAreas', 'level', 'minLevel', 'maxLevel', 'areaId', 'zoneId', 'currency', 'gold', 'stardust', 'tickets']);
    for (const key of ['items', 'requiredItems', 'itemRequirements', 'requirements', 'ingredients', 'requiredMaterials', 'consumes', 'cost']) {
      if (record[key] === undefined) continue;
      const value = record[key];
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        for (const [id, amount] of Object.entries(value)) {
          if (Object.hasOwn(ITEM_CATALOG, id)) {
            const target = typeof amount === 'object' && amount !== null ? Number(amount.quantity ?? amount.amount ?? amount.target ?? amount.count) : Number(amount);
            const progress = typeof amount === 'object' && amount !== null ? Number(amount.progress) || 0 : 0;
            reserveItem(id, Number.isFinite(target) ? Math.max(0, target - progress) : Infinity, reason);
          } else if (nonItemRequirementKeys.has(id)) {
            continue;
          } else if (amount && typeof amount === 'object') {
            reserveObjectiveRequirement(amount, reason, 0);
          } else {
            protectAll = true;
          }
        }
      } else {
        reserveObjectiveRequirement(value, reason, 0);
      }
    }
  };
  const milestone = pendingMilestone(world);
  if (milestone) reserveIngredients(milestone.ingredients, `next milestone · ${milestone.name}`);
  const selectedRecipeId = world.selectedCraftRecipe || (world.knownRecipes?.includes(state.selectedCraftRecipe) ? state.selectedCraftRecipe : null);
  const selectedRecipe = selectedRecipeId ? RECIPES[selectedRecipeId] : null;
  if (selectedRecipe && world.discoveredRecipes?.includes(selectedRecipeId) && world.knownRecipes?.includes(selectedRecipeId)) {
    reserveIngredients(selectedRecipe.ingredients, `selected recipe · ${selectedRecipe.name}`);
  }
  if (state.craftAnimation?.recipeId && RECIPES[state.craftAnimation.recipeId]) {
    const activeRecipe = RECIPES[state.craftAnimation.recipeId];
    reserveIngredients(activeRecipe.ingredients, `active craft · ${activeRecipe.name}`);
  }
  for (const slot of Object.values(world.objectiveStates || {})) {
    const task = slot?.task;
    if (!task || task.completed) continue;
    for (const [index, goal] of (task.goals || []).entries()) {
      if (!goal || typeof goal !== 'object') continue;
      reserveObjectiveRequirement(goal, `active objective · ${task.name || 'current goal'}`, task.progress?.[index] || 0);
    }
    reserveObjectiveRequirement(task.requiredItems, `active objective · ${task.name || 'current goal'}`);
    reserveObjectiveRequirement(task.itemRequirements, `active objective · ${task.name || 'current goal'}`);
    if (task.requiresItem === true && !(task.requiredItems || task.itemRequirements || task.goals?.some(goal => goal?.itemId))) protectAll = true;
  }
  return {
    reserved,
    reasons,
    protectAll
  };
}
function autoSellProtectionReason(item, protection, newlyFoundIds = new Set()) {
  if (protection.protectAll) return 'Protected · a progression requirement needs a closer look';
  if (newlyFoundIds.has(item.id)) return 'Protected · newly found on this outing';
  if (item.artifact || item.rarity === 'Unique' || item.category === 'Creatures' || item.category === 'Special items' || item.shopRoomItem) return 'Protected · keepsake or special find';
  if (!state.world.collection.includes(item.id)) return 'Protected · undiscovered journal page';
  if (item.questCritical || item.progressionCritical || item.autoSellProtected || item.equipped || item.favorite) {
    return 'Protected · marked quest, progression, or favorite item';
  }
  const room = state.world.room || {};
  const explicitlyHeld = new Set([...(Array.isArray(room.favorites) ? room.favorites : []), ...(Array.isArray(state.world.favorites) ? state.world.favorites : []), ...(Array.isArray(state.world.equippedItems) ? state.world.equippedItems : []), ...Object.values(room.slotAssignments || {}), ...Object.values(state.world.displayPins || {}), ...Object.values(state.world.equippedItems || {}).filter(value => typeof value === 'string'), ...Object.values(state.world.protectedItems || {}).filter(value => typeof value === 'string')]);
  if (explicitlyHeld.has(item.id)) return 'Protected · equipped, placed, or favorited';
  return '';
}
function recordNpcShopTransaction(type, title, itemId, quantity, amount, currency = 'gold') {
  const item = ITEM_CATALOG[itemId];
  const history = Array.isArray(state.world.marketHistory) ? state.world.marketHistory : [];
  const validCurrency = currencyField(currency) || 'gold';
  const transactionAmount = Math.max(0, Math.min(ECONOMY_CONFIG.maxBalance, Math.floor(Number(amount) || 0)));
  history.unshift({
    id: `shop-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    title: String(title).slice(0, 100),
    itemId: item ? item.id : '',
    quantity: Math.max(0, Math.min(MAX_INVENTORY_STACK, Math.floor(Number(quantity) || 0))),
    gold: validCurrency === 'gold' ? transactionAmount : 0,
    currency: validCurrency,
    amount: transactionAmount,
    at: Date.now()
  });
  state.world.marketHistory = history.slice(0, ECONOMY_CONFIG.marketplace.historyLimit);
}
function processAutoSellAfterExpedition(expeditionNumber, rewards, expeditionContext) {
  const id = Math.max(0, Math.floor(Number(expeditionNumber) || 0));
  if (!id || state.world.lastAutoSellExpedition >= id) return 0;
  state.world.lastAutoSellExpedition = id;
  if (!state.world.autoSellEnabled) return 0;
  const seenAtDeparture = expeditionContext?.discoveryState?.seenItemIds;
  const newlyFoundIds = new Set();
  for (const reward of rewards || []) {
    if (!reward || !['material', 'discovery'].includes(reward.type) || !ITEM_CATALOG[reward.id]) continue;
    if (!Array.isArray(seenAtDeparture) || !seenAtDeparture.includes(reward.id)) newlyFoundIds.add(reward.id);
  }
  const protection = calculateAutoSellProtection(state.world);
  const sold = [];
  for (const itemId of Object.keys(state.world.inventory).sort()) {
    const item = ITEM_CATALOG[itemId];
    const price = npcSellPrice(itemId);
    const owned = Math.max(0, Math.floor(Number(state.world.inventory[itemId]) || 0));
    if (!item || !owned || price < 1 || !state.world.collection.includes(itemId)) continue;
    if (autoSellProtectionReason(item, protection, newlyFoundIds)) continue;
    const reserve = protection.protectAll ? owned : Math.min(owned, protection.reserved.get(itemId) || 0);
    const surplus = Math.max(0, owned - reserve);
    const walletRoom = Math.max(0, ECONOMY_CONFIG.maxBalance - currencyBalance('gold'));
    const quantity = Math.min(surplus, Math.floor(walletRoom / price));
    if (!quantity) continue;
    const proceeds = quantity * price;
    if (!Number.isSafeInteger(proceeds) || !changeInventoryQuantity(itemId, -quantity)) continue;
    const earned = awardCurrency('gold', proceeds);
    if (earned !== proceeds) {
      changeInventoryQuantity(itemId, quantity);
      continue;
    }
    recordNpcShopTransaction('auto-sell', `Auto-sold ${quantity} ${item.name}`, itemId, quantity, earned);
    addNotification(`Auto-sold ${quantity} ${item.name} · +${earned} Gold.`);
    sold.push({
      itemId,
      quantity,
      gold: earned
    });
  }
  return sold.length;
}
function roomShopTitle() {
  const theme = ROOM_THEMES[state.world.activeRoomTheme] || ROOM_THEMES['starter-room'];
  return `${(state.playerName || 'Wanderer').toLocaleUpperCase()}’S ${theme.shopTitle}`;
}
function recordObjectiveEvent(event) {
  const completed = objectiveManager.recordEvent(state.world, event, objectiveContext(), Date.now());
  for (const task of completed) addNotification(`${task.name} complete! Claim +${task.reward} ${task.reward === 1 ? 'ticket' : 'tickets'} in Objectives.`);
  return completed;
}
function claimObjective(tier, {
  render = true
} = {}) {
  const result = objectiveManager.claim(state.world, tier, ticketManager, Date.now());
  if (!result.ok) {
    addNotification('This objective is not ready to claim yet.');
  } else {
    playSound(arrivalSound);
    if (result.reward > 0) {
      const partialReason = result.reward < result.requestedReward ? result.blockedBy === 'daily-cap' ? ' · daily allowance reached' : ' · ticket pouch space used' : '';
      addNotification(`${result.taskName} claimed · +${result.reward} ticket${result.reward === 1 ? '' : 's'}${partialReason}.`);
    } else {
      const reason = result.blockedBy === 'daily-cap' ? 'daily active-ticket allowance reached' : 'ticket pouch is full';
      addNotification(`${result.taskName} claimed and refreshed · +0 tickets (${reason}).`);
    }
  }
  persist();
  if (render) renderUI();
  return result;
}
function claimAllObjectives() {
  if (objectiveClaimAllBusy) return;
  const claimableTiers = OBJECTIVE_CONFIG.tiers.filter(tier => state.world.objectiveStates?.[String(tier.level)]?.task?.completed).map(tier => tier.level);
  if (!claimableTiers.length) {
    renderUI();
    return;
  }
  objectiveClaimAllBusy = true;
  let interrupted = false;
  try {
    for (const tier of claimableTiers) {
      try {
        const result = claimObjective(tier, {
          render: false
        });
        if (!result.ok) continue;
        // Checkpoint each successful claim before attempting the next one. A retry
        // can only see objectives that the existing manager has not consumed.
      } catch (error) {
        interrupted = true;
        try {
          persist();
        } catch (saveError) {
          console.error('[Pocketwild objectives] Could not checkpoint a partial Claim All.', saveError);
        }
        console.warn('[Pocketwild objectives] Claim All paused after an error.', error);
        break;
      }
    }
  } finally {
    objectiveClaimAllBusy = false;
    if (interrupted) addNotification('Claim All paused. Already-claimed goals are saved and will not be offered again.');
    renderUI();
  }
}
function awardActiveTickets(amount, source) {
  const result = ticketManager.awardActive(state.world, amount, {
    now: Date.now(),
    source
  });
  if (result.granted > 0) {
    addNotification(`+${result.granted} active ${result.granted === 1 ? 'ticket' : 'tickets'} · ${source}.`);
  }
  return result.granted;
}
function awardTicketEvent(event, source) {
  return awardActiveTickets(ticketManager.activeRewardAmount(event), source);
}
function awardXp(amount, source = 'a little progress') {
  const requestedXp = Math.max(0, Math.floor(Number(amount) || 0));
  if (!requestedXp) return 0;
  const before = progressionSnapshot();
  if (before.xpCapped) return 0;
  const previousXp = Math.max(0, Math.floor(Number(state.world.xp) || 0));
  const capXp = xpForLevel(LEVEL_CAP);
  const acceptedXp = Math.min(requestedXp, Math.max(0, capXp - previousXp));
  if (!acceptedXp) return 0;
  state.world.xp = Math.min(capXp, previousXp + acceptedXp);
  const after = progressionSnapshot();
  recordCompanionMilestonesCrossed(before.level, after.level);
  if (after.level > before.level) {
    rememberCloverEvent('level-up', {
      level: after.level
    });
    for (let level = before.level + 1; level <= after.level; level++) {
      triggerPetDialogue('levelUp', {
        level,
        source
      });
    }
    addNotification(`Level ${after.level}! Your little world is growing.`);
    const pointsEarned = Math.max(0, after.level - before.level);
    if (pointsEarned) {
      state.talentPointToast = Math.min(MAX_TALENT_POINTS, state.talentPointToast + pointsEarned);
      addNotification(`+${pointsEarned} Wildsoul talent point${pointsEarned === 1 ? '' : 's'} ready to spend whenever you like.`);
    }
  }
  if (after.atBarrier && !before.atBarrier && after.milestone) {
    addNotification(`Level ${after.milestone.level} reached. Craft a ${after.milestone.name} to open the next path.`);
  }
  return state.world.xp - previousXp;
}
function recordDiscovery(itemId) {
  if (!Object.hasOwn(ITEM_CATALOG, itemId)) return false;
  if (state.world.collection.includes(itemId)) return false;
  // Collection is a permanent journal; ownership changes never edit this list.
  state.world.collection.push(itemId);
  const item = ITEM_CATALOG[itemId];
  rememberCloverEvent('discovery', {
    itemName: item.name,
    rarity: item.rarity
  });
  triggerPetDialogue('newDiscovery', {
    itemId: item.id,
    itemName: item.name,
    itemEmoji: item.emoji,
    rarity: item.rarity,
    category: item.category
  });
  addNotification(`${item.name} added to your Collection.`);
  const stardustReward = ECONOMY_CONFIG.firstDiscoveryStardust[item.rarity] || 0;
  const stardustEarned = awardCurrency('stardust', stardustReward);
  if (stardustEarned) addNotification(`First ${item.rarity.toLowerCase()} discovery · +${stardustEarned} Stardust.`);
  awardXp(PROGRESSION_CONFIG.discoveryXp, 'new discovery');
  recordObjectiveEvent({
    type: 'discovery',
    amount: 1
  });
  awardTicketEvent('discovery', 'a new discovery');
  const every = PROGRESSION_CONFIG.collectionMilestoneEvery;
  if (every > 0 && state.world.collection.length % every === 0) {
    const earnedXp = awardXp(PROGRESSION_CONFIG.collectionMilestoneXp, 'collection milestone');
    if (earnedXp) addNotification(`${state.world.collection.length} discoveries collected · +${earnedXp} collection XP!`);
  }
  return true;
}
function changeInventoryQuantity(itemId, delta) {
  if (!Object.hasOwn(ITEM_CATALOG, itemId) || !Number.isFinite(delta) || !Number.isInteger(Math.floor(delta))) return false;
  const current = Math.max(0, Math.floor(Number(state.world.inventory[itemId]) || 0));
  const next = current + Math.floor(delta);
  if (next < 0 || next > MAX_INVENTORY_STACK) return false;
  if (next === 0) delete state.world.inventory[itemId];else state.world.inventory[itemId] = next;
  // Deliberately does not change the Collection journal.
  return true;
}
function getItemRecord(itemId) {
  const item = ITEM_CATALOG[itemId];
  if (!item) return null;
  return {
    ...item,
    discoveryState: state.world.collection.includes(itemId) ? 'discovered' : 'undiscovered',
    ownedQuantity: state.world.inventory[itemId] || 0
  };
}
function resetPhonePanelScrollToTop() {
  if (state.phase !== 'phone') return;
  const phonePanel = ui.querySelector('.phone-panel');
  if (phonePanel) phonePanel.scrollTop = 0;
}
function sellToNpc(itemId, requestedQuantity = 1) {
  if (state.phase !== 'phone' || !['inventory', 'shop'].includes(state.world.phoneSection) || npcSaleInFlight) return false;
  const item = ITEM_CATALOG[itemId];
  const price = npcSellPrice(itemId);
  const owned = Math.max(0, Math.floor(Number(state.world.inventory[itemId]) || 0));
  const quantity = requestedQuantity === 'all' ? owned : Number(requestedQuantity);
  if (!item || price < 1 || !Number.isInteger(quantity) || quantity < 1 || quantity > owned) {
    addNotification('Clover could not sell that amount · check the item and quantity in your satchel.');
    if (state.world.phoneSection === 'shop') shopNotice = 'That quantity is no longer in your satchel. Nothing was sold.';
    renderUI();
    return false;
  }
  const proceeds = quantity * price;
  if (!Number.isSafeInteger(proceeds) || currencyBalance('gold') + proceeds > ECONOMY_CONFIG.maxBalance) {
    addNotification('Your Gold pouch has room for less than that sale. Choose a smaller quantity.');
    if (state.world.phoneSection === 'shop') shopNotice = 'Your Gold pouch cannot hold those proceeds yet. Choose a smaller quantity.';
    renderUI();
    return false;
  }
  npcSaleInFlight = true;
  try {
    if (!changeInventoryQuantity(itemId, -quantity)) return false;
    const earned = awardCurrency('gold', proceeds);
    if (earned !== proceeds) {
      changeInventoryQuantity(itemId, quantity);
      return false;
    }
    recordNpcShopTransaction('npc-sale', `Sold ${quantity} ${item.name} to Clover`, itemId, quantity, earned);
    rememberCloverEvent('trade', {
      itemName: item.name
    });
    npcBehaviorManager.interact(state.world, 'clover', {
      playerName: state.playerName,
      itemName: item.name
    });
    addNotification(`Clover bought ${quantity} ${item.name}${quantity === 1 ? '' : 's'} for ${earned} Gold.`);
    shopNotice = `Clover bought ${quantity} ${item.name}${quantity === 1 ? '' : 's'} · +${earned} Gold.`;
    awardTicketEvent('commerce', 'selling finds to Clover');
    persist();
    renderUI();
    if (state.world.phoneSection === 'inventory') resetPhonePanelScrollToTop();
    return true;
  } finally {
    npcSaleInFlight = false;
  }
}
function showLowGoldHint(targetId) {
  const queued = triggerPetDialogue('lowGold', {
    targetId
  });
  if (queued) {
    persist();
    renderUI();
  }
  return queued;
}
function buyRoomShopItem(itemId, slotValue) {
  if (state.phase !== 'phone' || state.world.phoneSection !== 'shop' || roomShopPurchaseInFlight) return;
  roomShopPurchaseInFlight = true;
  try {
    const rotationChanged = ensureRoomShopRotation(state.world, Date.now());
    const activePeriodId = Math.floor(Date.now() / ECONOMY_CONFIG.roomShopRotation.periodMs);
    if (rotationChanged || state.world.roomShopRotation.periodId !== activePeriodId) {
      ensureRoomShopRotation(state.world, Date.now());
      persist();
      renderUI();
      return;
    }
    const slotIndex = Number(slotValue);
    const offer = Number.isInteger(slotIndex) ? state.world.roomShopRotation?.slots?.[slotIndex] : null;
    const item = ITEM_CATALOG[itemId];
    const expectedOffer = offer && roomShopOfferDefinition(itemId, offer.kind);
    if (!offer || offer.itemId !== itemId || offer.purchased || !item || !expectedOffer || offer.currency !== expectedOffer.currency || offer.price !== expectedOffer.price) return;
    if (currencyBalance(offer.currency) < offer.price) {
      if (offer.currency === 'gold') showLowGoldHint(itemId);
      return;
    }
    if ((state.world.inventory[itemId] || 0) >= MAX_INVENTORY_STACK) {
      shopNotice = 'That satchel stack is full. Make room before buying another.';
      renderUI();
      return;
    }
    if (!spendCurrency(offer.currency, offer.price)) return;
    if (!changeInventoryQuantity(itemId, 1)) {
      awardCurrency(offer.currency, offer.price);
      return;
    }
    offer.purchased = true;
    recordNpcShopTransaction('npc-purchase', `Bought ${item.name} from Clover`, itemId, 1, offer.price, offer.currency);
    rememberCloverEvent('trade', {
      itemName: item.name
    });
    npcBehaviorManager.interact(state.world, 'clover', {
      playerName: state.playerName,
      itemName: item.name
    });
    addNotification(`${item.name} tucked into your Inventory · spent ${currencyLabel(offer.currency, offer.price)}.`);
    shopNotice = `${item.name} tucked into your satchel · spent ${currencyLabel(offer.currency, offer.price)}.`;
    awardTicketEvent('commerce', 'buying from the room shop');
    persist();
    renderUI();
    resetPhonePanelScrollToTop();
  } finally {
    roomShopPurchaseInFlight = false;
  }
}
function buyRoomTheme(themeId) {
  if (state.phase !== 'phone' || state.world.phoneSection !== 'room') return;
  const theme = ROOM_THEMES[themeId];
  const cost = ECONOMY_CONFIG.roomThemePrices[themeId];
  const currentLevel = progressionSnapshot().level;
  if (!theme || !cost || currentLevel < (theme.unlockLevel || 1) || state.world.ownedRoomThemes.includes(themeId)) return;
  if (currencyBalance(cost.currency) < cost.price) {
    if (cost.currency === 'gold') showLowGoldHint(themeId);
    return;
  }
  if (!spendCurrency(cost.currency, cost.price)) return;
  state.world.ownedRoomThemes.push(themeId);
  state.world.activeRoomTheme = themeId;
  rememberCloverEvent('room-change', {
    themeName: theme.name
  });
  addNotification(`${theme.name} is yours · spent ${currencyLabel(cost.currency, cost.price)}.`);
  persist();
  renderUI();
}
function activateRoomTheme(themeId) {
  if (state.phase !== 'phone' || state.world.phoneSection !== 'room' || !state.world.ownedRoomThemes.includes(themeId)) return;
  if (!ROOM_THEMES[themeId] || state.world.activeRoomTheme === themeId) return;
  state.world.activeRoomTheme = themeId;
  rememberCloverEvent('room-change', {
    themeName: ROOM_THEMES[themeId].name
  });
  addNotification(`${ROOM_THEMES[themeId].name} is now your room’s look.`);
  persist();
  renderUI();
}
function discoverRecipe(recipeId) {
  const recipe = RECIPES[recipeId];
  if (!recipe || state.world.discoveredRecipes.includes(recipeId)) return false;
  const firstRecipe = state.world.discoveredRecipes.length === 0;
  state.world.discoveredRecipes.push(recipeId);
  addNotification(`A recipe for ${recipe.name} was tucked into your potion notes.`);
  if (firstRecipe && state.world.phoneUnlocked) {
    triggerPetDialogue('systemUnlocked', {
      system: 'crafting',
      systemName: 'Crafting'
    });
  } else {
    triggerPetDialogue('potionUnlocked', {
      recipeId,
      itemId: recipe.potionItemId,
      recipeName: recipe.name
    });
  }
  awardXp(8 + talentRank('recipe-memory'), 'new recipe');
  return true;
}
function unlockPotionRecipesForProgress() {
  let unlockedAny = false;
  for (const recipe of Object.values(RECIPES)) {
    if (!recipe.unlock || state.world.discoveredRecipes.includes(recipe.id)) continue;
    const progress = progressionSnapshot();
    if (state.world.expeditions < recipe.unlock.expeditions || progress.level < recipe.unlock.level) continue;
    unlockedAny = discoverRecipe(recipe.id) || unlockedAny;
  }
  return unlockedAny;
}
function craftingGoldCost(recipeId) {
  const baseCost = Math.max(0, Math.floor(Number(ECONOMY_CONFIG.commonCraftingGoldCosts[recipeId]) || 0));
  if (!baseCost) return 0;
  const discount = Math.min(Math.max(0, baseCost - 1), talentRank('steady-hands'));
  return Math.max(1, baseCost - discount);
}
function beginCrafting(recipeId) {
  const recipe = RECIPES[recipeId];
  if (!recipe || state.craftAnimation || !state.world.knownRecipes.includes(recipeId) || !state.world.discoveredRecipes.includes(recipeId)) return;
  const selected = new Set(state.selectedCraftIngredients);
  const allSelected = recipe.ingredients.every(ingredient => selected.has(ingredient.itemId));
  const enoughIngredients = recipe.ingredients.every(ingredient => (state.world.inventory[ingredient.itemId] || 0) >= ingredient.quantity);
  const goldCost = craftingGoldCost(recipeId);
  if (!allSelected || !enoughIngredients || currencyBalance('gold') < goldCost) return;
  if (goldCost && !spendCurrency('gold', goldCost)) return;
  for (const ingredient of recipe.ingredients) changeInventoryQuantity(ingredient.itemId, -ingredient.quantity);
  rememberCloverEvent('craft', {
    itemName: recipe.name
  });
  const outputItem = ITEM_CATALOG[recipe.output.itemId];
  const extraPotionChance = Math.min(0.1, talentEffectTotal('craftExtraPotionChance'));
  const extraPotion = outputItem?.category === 'Potions' && Math.random() < extraPotionChance ? 1 : 0;
  changeInventoryQuantity(recipe.output.itemId, recipe.output.quantity + extraPotion);
  recordDiscovery(recipe.output.itemId);
  awardXp(recipe.xpReward + talentRank('material-savvy'), 'crafting');
  if (extraPotion) addNotification(`Careful brewing made an extra ${outputItem.name}.`);
  const goldBonusChance = Math.min(0.08, talentEffectTotal('craftGoldBonusChance'));
  if (goldBonusChance && Math.random() < goldBonusChance) {
    const bonusGold = awardCurrency('gold', 1);
    if (bonusGold) addNotification(`Careful Work found +${bonusGold} Gold in the mixing bowl.`);
  }
  applyCraftPotionEffect();
  recordObjectiveEvent({
    type: 'craft',
    amount: 1
  });
  awardTicketEvent('crafting', 'crafting');
  if (!state.world.craftedRecipes.includes(recipeId)) state.world.craftedRecipes.push(recipeId);
  triggerPetDialogue('craftSucceeded', {
    recipeId,
    recipeName: recipe.name
  });
  unlockPotionRecipesForProgress();
  const output = ITEM_CATALOG[recipe.output.itemId];
  addNotification(`${output.name} crafted and added to your Inventory.`);
  state.selectedCraftIngredients = [];
  state.craftAnimation = {
    recipeId,
    until: state.time + 1.65
  };
  playSound(arrivalSound);
  for (let i = 0; i < 18; i++) spawnSparkle(W * (0.42 + Math.random() * 0.16), H * (0.4 + Math.random() * 0.2));
  persist();
  renderUI();
}
function openMilestoneCrafting(milestoneId) {
  const milestone = pendingMilestone();
  if (!state.world.phoneUnlocked || !milestone || milestone.id !== milestoneId) return;
  state.overlay = null;
  state.world.phoneSection = 'crafting';
  state.selectedCraftIngredients = [];
  state.milestoneCraftNotice = '';
  state.milestoneCraftFocusId = milestone.id;
  state.phase = 'phone';
  persist();
  renderUI();
}
function craftMilestone(milestoneId) {
  const milestone = pendingMilestone();
  const progress = progressionSnapshot();
  if (!milestone || milestone.id !== milestoneId || progress.level < milestone.level) return;
  const enoughMaterials = milestone.ingredients.every(ingredient => (state.world.inventory[ingredient.itemId] || 0) >= ingredient.quantity);
  if (!enoughMaterials) return;
  for (const ingredient of milestone.ingredients) changeInventoryQuantity(ingredient.itemId, -ingredient.quantity);
  rememberCloverEvent('craft', {
    itemName: milestone.name
  });
  const earnsMasterCollector = milestone.id === 'milestone-50' && !hasMasterCollectorBadge(state.world);
  state.world.completedMilestones.push(milestone.id);
  recordCompanionMilestonesCrossed(progress.level, progressionSnapshot().level);
  if (earnsMasterCollector) {
    state.world.badges = [...new Set([...(state.world.badges || []), MASTER_COLLECTOR_BADGE.id])];
  }
  changeInventoryQuantity(milestone.outputId, 1);
  recordDiscovery(milestone.outputId);
  awardXp(milestone.xpReward, 'milestone crafting');
  applyCraftPotionEffect();
  unlockPotionRecipesForProgress();
  const output = ITEM_CATALOG[milestone.outputId];
  const nextArea = milestone.unlock.areaId ? AREA_CATALOG.find(area => area.id === milestone.unlock.areaId) : null;
  if (nextArea && areaAccessible(state.world, nextArea)) state.world.activeAreaId = nextArea.id;
  if (nextArea) {
    const trailCopy = areaAccessible(state.world, nextArea) ? `${nextArea.name} and ${milestone.unlock.rarity || nextArea.rarity} finds are now open.` : `${nextArea.name} is unlocked; reach Level ${nextArea.minLevel} to choose its trail.`;
    state.milestoneCraftNotice = areaAccessible(state.world, nextArea) ? `${output.name} crafted! New area unlocked: ${nextArea.name} · ${milestone.unlock.rarity || nextArea.rarity} discoveries available.` : `${output.name} crafted! Path opened to ${nextArea.name}; reach Level ${nextArea.minLevel} to wander there.`;
    addNotification(`${output.name} crafted! ${trailCopy}`);
    triggerPetDialogue('zoneUnlocked', {
      zoneId: nextArea.id,
      zoneName: nextArea.name,
      rarity: milestone.unlock.rarity || nextArea.rarity
    });
  } else {
    const completionCopy = milestone.level === MASTER_COLLECTOR_LEVEL ? `The original journey is complete at Level ${MASTER_COLLECTOR_LEVEL}.` : `The current Level ${LEVEL_CAP} chapter is complete.`;
    state.milestoneCraftNotice = `${output.name} crafted! ${milestone.unlock.title || 'A new chapter'} is yours. ${completionCopy}`;
    addNotification(`${output.name} crafted! ${completionCopy}`);
  }
  if (earnsMasterCollector) {
    addNotification(`MASTER COLLECTOR! Your Level ${MASTER_COLLECTOR_LEVEL} milestone earned the badge. The trail continues beyond this keepsake.`);
    triggerPetDialogue('masterCollector', {
      level: MASTER_COLLECTOR_LEVEL,
      title: MASTER_COLLECTOR_BADGE.name
    });
  }
  state.selectedCraftIngredients = [];
  playSound(arrivalSound);
  for (let i = 0; i < 24; i++) spawnSparkle(W * (0.34 + Math.random() * 0.32), H * (0.34 + Math.random() * 0.32));
  persist();
  renderUI();
}
function usePotion(itemId) {
  if (state.phase !== 'phone' || state.world.phoneSection !== 'inventory') return;
  const definition = POTION_DEFINITIONS[itemId];
  if (!definition?.effect || state.world.activePotionBuff || (state.world.inventory[itemId] || 0) < 1) return;
  const buff = sanitizePotionBuff({
    itemId,
    remainingActions: definition.effect.duration
  });
  if (!buff) return;
  changeInventoryQuantity(itemId, -1);
  state.world.activePotionBuff = buff;
  addNotification(`${definition.name} is ready for your ${definition.effect.action === 'craft' ? 'next craft' : 'next outing'}. ${definition.effect.description}`);
  persist();
  renderUI();
}
function applyCraftPotionEffect() {
  const consumed = consumePotionAction('craft');
  if (!consumed || consumed.legacyOnly) return false;
  const effect = potionEffectFor(consumed);
  if (effect?.type !== 'crafting-xp') return false;
  const amount = Math.min(POTION_BALANCE.maxXpBonusPerAction, Math.max(0, Math.floor(Number(effect.amount) || 0)));
  const earned = amount ? awardXp(amount, 'Maker’s Muse') : 0;
  if (earned) addNotification(`${POTION_DEFINITIONS[consumed.itemId]?.name || 'Your potion'} added +${earned} XP to your craft.`);
  return Boolean(earned);
}
function applyExpeditionPotionEffect() {
  const consumed = consumePotionAction('expedition');
  if (!consumed) return null;
  if (consumed.legacyOnly) {
    const amount = Math.min(POTION_BALANCE.maxXpBonusPerAction * 10, Math.max(0, Math.floor(Number(consumed.legacyXpBonus) || 0)));
    const earned = amount ? awardXp(amount, 'saved tonic') : 0;
    if (earned) addNotification(`${POTION_DEFINITIONS[consumed.itemId]?.name || 'Your tonic'} added +${earned} XP to the outing.`);
    return {
      itemId: consumed.itemId,
      effect: null
    };
  }
  const effect = potionEffectFor(consumed);
  if (effect?.type === 'expedition-xp') {
    const amount = Math.min(POTION_BALANCE.maxXpBonusPerAction, Math.max(0, Math.floor(Number(effect.amount) || 0)));
    const earned = amount ? awardXp(amount, 'Meadowglow Tonic') : 0;
    if (earned) addNotification(`${POTION_DEFINITIONS[consumed.itemId]?.name || 'Your tonic'} added +${earned} XP to the outing.`);
  }
  return {
    itemId: consumed.itemId,
    effect
  };
}
function renderCraftingContent() {
  const recipes = state.world.discoveredRecipes.map(id => RECIPES[id]).filter(Boolean);
  const milestoneSection = renderMilestoneCraftingSection();
  const successNote = state.milestoneCraftNotice ? `<div class="craft-success-note" role="status" aria-live="polite">✓ ${escapeHTML(state.milestoneCraftNotice)}</div>` : '';
  const ordinaryHeader = '<section class="ordinary-crafting"><div class="crafting-section-heading"><span>⚗️</span><div><strong>CRAFTING</strong><small>Everyday potion recipes</small></div></div>';
  const prefix = `${successNote}${milestoneSection}${ordinaryHeader}`;
  if (!recipes.length) {
    return `${prefix}<div class="empty-note">A little potion recipe will find its way here after an outing.</div></section>`;
  }
  const recipe = recipes.find(entry => entry.id === state.selectedCraftRecipe) || recipes[0];
  state.selectedCraftRecipe = recipe.id;
  const recipeId = recipe.id;
  const output = ITEM_CATALOG[recipe.output.itemId];
  const known = state.world.knownRecipes.includes(recipeId);
  const picker = `<div class="recipe-picker" aria-label="Discovered recipes">${recipes.map(entry => {
    const isSelected = entry.id === recipeId;
    const isKnown = state.world.knownRecipes.includes(entry.id);
    return `<button class="recipe-tab${isSelected ? ' selected' : ''}" data-action="select-recipe" data-recipe="${entry.id}" aria-pressed="${isSelected}"><strong>${escapeHTML(entry.name)}</strong><small>${isKnown ? 'Learned' : 'New note'}</small></button>`;
  }).join('')}</div>`;
  if (state.craftAnimation?.recipeId === recipeId) {
    return `${prefix}${picker}<div class="brew-animation" role="status" aria-live="polite"><div class="brew-sparkles" aria-hidden="true">✦ · ✧ · ✦</div><div class="brew-vial" aria-hidden="true">${output.emoji}</div><strong>${escapeHTML(recipe.name)} is taking shape…</strong><span>Just a gentle stir.</span></div></section>`;
  }
  if (!known) {
    const unlockLine = `A new ${recipe.category} recipe is tucked into your notes.`;
    return `${prefix}${picker}<p class="body-copy">${unlockLine} Learn it when you’re ready to see what it needs.</p><article class="recipe-card"><div class="recipe-output-icon">${output.emoji}</div><div><strong>${escapeHTML(recipe.name)}</strong><span>${escapeHTML(recipe.rarity)} · ${escapeHTML(recipe.quality)} quality</span></div></article><div class="recipe-discovery-note">${escapeHTML(recipe.effect.description)}</div><button class="button primary wide" data-action="learn-recipe" data-recipe="${recipeId}">Learn this recipe <span aria-hidden="true">→</span></button></section>`;
  }
  const selected = new Set(state.selectedCraftIngredients);
  const selectedCount = recipe.ingredients.filter(ingredient => selected.has(ingredient.itemId)).length;
  const ingredients = recipe.ingredients.map(ingredient => {
    const item = ITEM_CATALOG[ingredient.itemId];
    if (!item) return '';
    const quantity = state.world.inventory[item.id] || 0;
    const isSelected = selected.has(item.id);
    const available = quantity >= ingredient.quantity;
    return `<button class="ingredient-choice${isSelected ? ' selected' : ''}" data-action="toggle-ingredient" data-recipe="${recipeId}" data-item="${item.id}" aria-pressed="${isSelected}" ${available ? '' : 'disabled'}><span class="ingredient-emoji" aria-hidden="true">${item.emoji}</span><span class="ingredient-copy"><strong>${escapeHTML(item.name)}</strong><small>${isSelected ? 'In your mixing bowl · ' : ''}Have ${quantity} · Need ${ingredient.quantity}</small></span><span class="ingredient-check" aria-hidden="true">${isSelected ? '✓' : '+'}</span></button>`;
  }).join('');
  const goldCost = craftingGoldCost(recipeId);
  const canAfford = currencyBalance('gold') >= goldCost;
  const hasIngredients = recipe.ingredients.every(ingredient => selected.has(ingredient.itemId) && (state.world.inventory[ingredient.itemId] || 0) >= ingredient.quantity);
  const canBrew = hasIngredients && canAfford && !state.craftAnimation;
  const feeCopy = `<div class="recipe-output-line"><span>Brewing fee</span><span>${goldCost ? `${currencyLabel('gold', goldCost)} · You have ${currencyLabel('gold', currencyBalance('gold'))}` : 'No Gold fee'}</span></div>`;
  const goldHint = !canAfford ? '<p class="potion-effect-copy">Sell spare finds to Clover from Inventory to earn Gold for the brewing fee.</p>' : '';
  const activeBuffCopy = state.world.activePotionBuff ? `<div class="active-buff-note">Active preparation · ${escapeHTML(activePotionSummary())}. Only its listed action uses will consume it.</div>` : '';
  const craftXpPotential = Math.min(recipe.xpReward + talentRank('material-savvy'), remainingXpCapacity());
  const craftXpCopy = craftXpPotential ? `Up to +${craftXpPotential} XP this brew` : `XP paused · Level ${LEVEL_CAP} cap`;
  const craftedCopy = state.world.craftedRecipes.includes(recipeId) ? `<div class="craft-receipt">You’ve made ${escapeHTML(output.name)} before. It can be brewed again whenever you have the ingredients. <strong>${craftXpCopy}.</strong></div>` : '';
  return `${prefix}${picker}<article class="recipe-card"><div class="recipe-output-icon">${output.emoji}</div><div><strong>${escapeHTML(recipe.name)}</strong><span>${escapeHTML(recipe.rarity)} · ${escapeHTML(recipe.quality)} quality</span></div></article><p class="potion-effect-copy">${escapeHTML(recipe.effect.description)}</p><div class="recipe-step-label">PICK YOUR INGREDIENTS <span>${selectedCount}/${recipe.ingredients.length}</span></div><p class="body-copy craft-instruction">Tap each find to add it to the bowl.</p><div class="ingredient-list">${ingredients}</div><div class="mixing-bowl"><span aria-hidden="true">🥣</span><span>${selectedCount === recipe.ingredients.length ? 'Everything is ready to stir.' : 'Your little mixing bowl'}</span></div><div class="recipe-output-line"><span>✦ Makes ${escapeHTML(output.name)} ×${recipe.output.quantity}</span><span>${craftXpCopy}</span></div>${feeCopy}${goldHint}${activeBuffCopy}${craftedCopy}<button class="button primary wide" data-action="brew-recipe" data-recipe="${recipeId}" ${canBrew ? '' : 'disabled'}>Brew ${escapeHTML(recipe.name)}${goldCost ? ` · ${currencyLabel('gold', goldCost)}` : ''} <span aria-hidden="true">✦</span></button></section>`;
}
function renderRoomShowcase() {
  const room = state.world.room;
  const theme = ROOM_THEMES[state.world.activeRoomTheme] || ROOM_THEMES['starter-room'];
  const wall = ROOM_WALL_STYLES.find(style => style.id === room.wallStyle) || ROOM_WALL_STYLES[0];
  const floor = ROOM_FLOOR_STYLES.find(style => style.id === room.floorStyle) || ROOM_FLOOR_STYLES[0];
  const wallChoices = ROOM_WALL_STYLES.map(style => `<button class="room-style-choice${wall.id === style.id ? ' selected' : ''}" data-action="set-room-wall" data-style="${style.id}" aria-pressed="${wall.id === style.id}"><span class="room-style-swatch" style="--swatch:${style.color}"></span><span>${escapeHTML(style.label)}</span>${wall.id === style.id ? '<b aria-hidden="true">✓</b>' : ''}</button>`).join('');
  const floorChoices = ROOM_FLOOR_STYLES.map(style => `<button class="room-style-choice${floor.id === style.id ? ' selected' : ''}" data-action="set-room-floor" data-style="${style.id}" aria-pressed="${floor.id === style.id}"><span class="room-style-swatch floor-swatch" style="--swatch:${style.color}"></span><span>${escapeHTML(style.label)}</span>${floor.id === style.id ? '<b aria-hidden="true">✓</b>' : ''}</button>`).join('');
  const themeOptions = Object.values(ROOM_THEMES).map(option => {
    const owned = state.world.ownedRoomThemes.includes(option.id);
    const active = state.world.activeRoomTheme === option.id;
    const cost = ECONOMY_CONFIG.roomThemePrices[option.id];
    const levelAvailable = progressionSnapshot().level >= (option.unlockLevel || 1);
    const action = owned ? 'activate-room-theme' : 'buy-room-theme';
    const buttonLabel = owned ? active ? 'In your room' : 'Use theme' : !levelAvailable ? `Level ${option.unlockLevel} keepsake` : cost ? `Buy · ${currencyLabel(cost.currency, cost.price)}` : 'Not for sale';
    const lowGold = !owned && levelAvailable && cost?.currency === 'gold' && currencyBalance('gold') < cost.price;
    const disabled = active || !owned && (!levelAvailable || !cost || currencyBalance(cost.currency) < cost.price && !lowGold);
    return `<article class="theme-option"><span class="theme-swatch" style="--theme-frame:${option.displayFrame}" aria-hidden="true">⌂</span><div class="theme-option-copy"><strong>${escapeHTML(option.name)}</strong><small>${active ? 'Active room look' : owned ? 'Owned · ready to switch' : !levelAvailable ? `Opens at Level ${option.unlockLevel}` : 'A cozy room upgrade'}</small></div><button class="display-option" data-action="${action}" data-theme="${option.id}" ${lowGold ? 'aria-disabled="true"' : disabled ? 'disabled' : ''}>${buttonLabel}</button></article>`;
  }).join('');
  return `<p class="body-copy">Your room is a cozy place to come home to. Choose its name, colors, and atmosphere; your collection stays safe in your journal and bag.</p><section class="room-identity-card"><span class="input-label">YOUR ROOM NAME</span><strong class="room-identity-name">${escapeHTML(room.name)}</strong><button class="display-option" data-action="open-room-name-editor">Rename Room</button></section><section class="room-choice-section"><div class="room-section-heading"><strong>Wall color</strong><span>Free choices</span></div><div class="room-style-grid">${wallChoices}</div></section><section class="room-choice-section"><div class="room-section-heading"><strong>Floor feeling</strong><span>Free choices</span></div><div class="room-style-grid">${floorChoices}</div></section><div class="room-theme-card"><span aria-hidden="true">⌂</span><div><strong>${escapeHTML(theme.name)}</strong><small>Current room atmosphere</small></div></div><section class="room-shop-teaser"><strong>${escapeHTML(roomShopTitle())}</strong><p>Your cozy room shop is still here, just around the corner.</p><button class="button secondary wide" data-action="phone-section" data-section="shop">Visit my room shop <span aria-hidden="true">→</span></button></section><section class="theme-shop"><strong>Room themes & upgrades</strong><p>Gold brings cozy everyday rooms; Stardust opens the rarer looks. Every theme changes the room’s atmosphere.</p><div class="theme-options">${themeOptions}</div></section>`;
}
function grantReward(reward) {
  if (reward.type === 'discovery') {
    recordDiscovery(reward.id);
  } else if (reward.type === 'material') {
    recordDiscovery(reward.id);
    changeInventoryQuantity(reward.id, reward.quantity);
    recordObjectiveEvent({
      type: 'materials',
      amount: reward.quantity
    });
  } else if (reward.type === 'xp') {
    awardXp(reward.amount, 'outing');
  } else if (reward.type === 'currency') {
    const earned = awardCurrency(reward.currency, reward.amount);
    if (earned) addNotification(`+${earned} ${reward.currency === 'gold' ? 'Gold' : 'Stardust'} · ${reward.name.toLowerCase()}.`);
  } else if (reward.type === 'phone') {
    if (!state.world.phoneUnlocked) {
      state.world.phoneUnlocked = true;
      recordDiscovery('pocketPhone');
      changeInventoryQuantity('pocketPhone', 1);
      addNotification('Your Pocket Phone is ready to use.');
    }
  }
}
function updateMilestoneDropPity(expeditionNumber, rewards) {
  if (!Number.isInteger(expeditionNumber) || expeditionNumber <= 0 || state.world.lastPityProcessedExpedition >= expeditionNumber) return false;
  const eligibleTargets = state.world.activeExpeditionPityTargets || [];
  const foundIds = new Set((rewards || []).filter(reward => reward.type === 'material').map(reward => reward.id));
  if (!state.world.milestoneDropPity || typeof state.world.milestoneDropPity !== 'object') {
    state.world.milestoneDropPity = {};
  }
  for (const itemId of eligibleTargets) {
    if (foundIds.has(itemId) || milestoneMaterialNeed(itemId) <= 0) {
      delete state.world.milestoneDropPity[itemId];
      continue;
    }
    const failures = Math.max(0, Math.floor(Number(state.world.milestoneDropPity[itemId]) || 0));
    state.world.milestoneDropPity[itemId] = Math.min(MILESTONE_DROP_PITY_CONFIG.maxEligibleFailures, failures + 1);
  }
  state.world.activeExpeditionPityTargets = [];
  state.world.lastPityProcessedExpedition = expeditionNumber;
  return true;
}
function finishExpedition(rewards, startIndex = 0) {
  const expeditionNumber = state.world.activeExpedition;
  const area = AREA_CATALOG.find(entry => entry.id === state.world.activeExpeditionAreaId) || AREA_CATALOG[0];
  const expeditionContext = state.world.activeExpeditionData;
  const startingXp = Math.min(state.world.xp, state.world.activeExpeditionXpStart);
  const firstUnclaimed = Math.max(0, Math.floor(startIndex));
  for (const reward of rewards.slice(firstUnclaimed)) grantReward(reward);
  processAutoSellAfterExpedition(expeditionNumber, rewards, expeditionContext);
  updateMilestoneDropPity(expeditionNumber, rewards);
  const finds = rewards.filter(reward => reward.type !== 'xp' && reward.type !== 'phone').map(reward => reward.name);
  const items = rewards.filter(reward => reward.type !== 'xp' && reward.type !== 'phone').map(reward => ({
    name: reward.name,
    emoji: reward.emoji,
    quantity: reward.type === 'material' ? reward.quantity : reward.type === 'currency' ? reward.amount : 1,
    currency: reward.type === 'currency' ? reward.currency : null
  }));
  rememberCloverEvent('expedition-return', {
    zoneName: area.name
  });
  const completedPotion = applyExpeditionPotionEffect();
  if (completedPotion) {
    const potionName = POTION_DEFINITIONS[completedPotion.itemId]?.name || 'Your potion';
    const remaining = state.world.activePotionBuff?.itemId === completedPotion.itemId ? state.world.activePotionBuff.remainingActions : 0;
    addNotification(remaining > 0 ? `${potionName} helped on this outing · ${remaining} outing${remaining === 1 ? '' : 's'} left.` : `${potionName} was used up on this outing.`);
  }
  if (expeditionNumber === 1) discoverRecipe('meadowglow-tonic');
  unlockPotionRecipesForProgress();
  recordObjectiveEvent({
    type: 'expedition',
    amount: 1,
    areaId: area.id
  });
  const expeditionTicketReward = ticketManager.expeditionRewardAmount(expeditionNumber);
  if (expeditionTicketReward > 0) {
    awardActiveTickets(expeditionTicketReward, `every ${TICKET_CONFIG.expeditionRewardEvery} completed outings`);
  }
  const potionEffect = completedPotion?.effect;
  if (potionEffect?.type === 'ticket-refund-chance' && Math.random() < Math.min(POTION_BALANCE.maxChance, Math.max(0, Number(potionEffect.chance) || 0))) {
    const amount = Math.min(POTION_BALANCE.maxTicketRefundPerAction, Math.max(1, Math.floor(Number(potionEffect.amount) || 1)));
    awardActiveTickets(amount, 'Traveler’s Tonic');
  }
  const xp = Math.max(0, state.world.xp - startingXp);
  state.world.lastTrip = {
    xp,
    areaId: area.id,
    areaName: area.name,
    finds,
    items,
    context: expeditionContext
  };
  state.world.activeExpedition = 0;
  state.world.activeExpeditionAreaId = null;
  state.world.activeExpeditionData = null;
  state.world.activeExpeditionRewards = [];
  state.world.activeExpeditionXpStart = state.world.xp;
  state.world.revealIndex = 0;
  state.world.phoneSection = 'home';
  state.basecampPanelExpanded = false;
  const completedOpeningNow = expeditionNumber === 1 && !state.hasCompletedOpening;
  if (expeditionNumber === 1) state.hasCompletedOpening = true;
  state.phase = 'basecamp';
  if (autoExploreActive) {
    refreshTickets();
    autoExploreActionAt = 0;
    if (state.world.tickets <= 0) {
      deactivateAutoExplore('Out of tickets. Auto Explore stopped; your companion is home safely.');
    } else if (areasAwaitingTrailChoice().length > 0) {
      deactivateAutoExplore('A new trail is open. Choose it on the map before Auto Explore can continue.');
    } else {
      autoExploreNextAt = Date.now() + AUTO_EXPLORE_BUFFER_MS;
    }
  }
  const petName = currentPet()?.name || 'Your friend';
  addNotification(`${petName} came home from ${area.name}.`);
  persist();
  if (completedOpeningNow) {
    const status = playerSaveManager.getStatus();
    if (status.user && status.cloudReady) {
      playerSaveManager.flush().catch(error => console.warn('[Pocketwild cloud save] Opening completion saved locally; cloud sync will retry.', error));
    }
  }
  renderUI();
}
function claimReward() {
  const rewards = expeditionRewards(state.world.activeExpedition);
  const reward = rewards[state.world.revealIndex];
  if (!reward) {
    finishExpedition(rewards);
    return;
  }
  grantReward(reward);
  if (reward.type === 'discovery' || reward.type === 'phone' || reward.type === 'xp') {
    playSound(arrivalSound);
    for (let i = 0; i < 16; i++) spawnSparkle(W * (0.38 + Math.random() * 0.24), H * (0.45 + Math.random() * 0.2));
  } else {
    playPetInteractionSound();
  }
  state.world.revealIndex += 1;
  if (state.world.revealIndex >= rewards.length) {
    finishExpedition(rewards, rewards.length);
  } else {
    persist();
    renderUI();
  }
}
async function openSocialProfile(playerUid, returnView = socialState.view) {
  socialState.loading = true;
  socialState.error = '';
  renderUI();
  try {
    const profile = await socialPlayerService.profile(playerUid);
    if (!profile) throw new Error('That Pocketwild profile could not be found.');
    socialState.room = profile;
    socialState.profileReturnView = returnView || 'discover';
    socialState.roomFriend = await socialPlayerService.isFriend(playerUid);
    socialState.roomLiked = await socialPlayerService.hasLikedRoom(playerUid);
    socialState.view = 'profile';
  } catch (error) {
    socialState.error = error?.message || 'That profile could not be opened just now.';
  } finally {
    socialState.loading = false;
    renderUI();
  }
}
async function openSocialRoom(roomUid, returnView = socialState.view) {
  socialState.loading = true;
  socialState.error = '';
  let visited = false;
  renderUI();
  try {
    const profile = await socialPlayerService.visitRoom(roomUid);
    if (!profile) throw new Error('That room is private or has gone quiet.');
    socialState.room = profile;
    socialState.roomReturnView = returnView;
    [socialState.roomFriend, socialState.roomLiked] = await Promise.all([socialPlayerService.isFriend(roomUid), socialPlayerService.hasLikedRoom(roomUid)]);
    socialState.view = 'room';
    visited = true;
  } catch (error) {
    socialState.error = error?.message || 'That room could not be opened just now.';
  } finally {
    if (visited) {
      awardTicketEvent('visit', 'visiting a friend’s room');
      persist();
    }
    socialState.loading = false;
    renderUI();
  }
}
function adoptMarketplaceSave(envelope) {
  const local = playerSaveManager.adoptExternalSave(envelope);
  const normalized = sanitizeSaveData(local);
  if (!normalized) throw new Error('The market transfer completed, but its local save could not be refreshed. Reopen your account before another market action.');
  save = normalized;
  state.playerName = normalized.playerName || state.playerName;
  state.displayNameChangedAt = Math.max(0, Math.floor(Number(normalized.displayNameChangedAt) || state.displayNameChangedAt));
  state.avatar = validAvatar(normalized.avatar);
  state.petId = normalized.petId || state.petId;
  state.selectedPet = state.petId;
  state.world = sanitizeWorldData(normalized.world);
}
async function refreshMarketplaceData() {
  const [snapshot, myListings, proceeds, bidHolds] = await Promise.all([marketplaceManager.browse(), marketplaceManager.myListings(), marketplaceManager.myProceeds(), marketplaceManager.myBidHolds()]);
  marketplaceState.listings = snapshot.listings;
  marketplaceState.trades = snapshot.trades;
  marketplaceState.blocked = snapshot.blocked;
  marketplaceState.dailyCounts = snapshot.dailyCounts;
  marketplaceState.myListings = myListings;
  marketplaceState.proceeds = proceeds;
  marketplaceState.bidHolds = bidHolds;
  try {
    marketplaceState.friends = await socialManager.friends();
  } catch {
    marketplaceState.friends = [];
  }
}
async function loadMarketplace() {
  if (!playerSaveManager.getStatus().user || !playerSaveManager.getStatus().cloudReady) return;
  marketplaceState.loading = true;
  marketplaceState.error = '';
  renderUI();
  try {
    await marketplaceManager.initialize();
    await refreshMarketplaceData();
  } catch (error) {
    marketplaceState.error = error?.message || 'The market window is having a quiet moment. Your player save is still safe.';
  } finally {
    marketplaceState.loading = false;
    renderUI();
  }
}
async function handleMarketplaceAction(action, control) {
  if (action === 'market-tab') {
    marketplaceState.tab = ['browse', 'sell', 'mine', 'trades', 'history'].includes(control.dataset.tab) ? control.dataset.tab : 'browse';
    marketplaceState.error = '';
    marketplaceState.notice = '';
    renderUI();
    return;
  }
  if (action === 'market-sell-mode') {
    marketplaceState.sellMode = control.dataset.mode === 'auction' ? 'auction' : 'fixed';
    marketplaceState.sellItemId = '';
    renderUI();
    return;
  }
  if (marketplaceState.loading) return;
  marketplaceState.error = '';
  marketplaceState.notice = '';
  marketplaceState.loading = true;
  let ticketCommerceSource = '';
  renderUI();
  try {
    if (action === 'market-cancel-listing') {
      await marketplaceManager.cancelListing(control.dataset.id);
      marketplaceState.notice = 'The listing is closed and its remaining items are back in your bag.';
    } else if (action === 'market-claim-proceeds') {
      await marketplaceManager.claimProceeds(control.dataset.id);
      ticketCommerceSource = 'collecting player-market sale proceeds';
      marketplaceState.notice = 'Your player-market Gold has been added to your wallet.';
    } else if (action === 'market-claim-bid-refund') {
      await marketplaceManager.claimBidRefund(control.dataset.id);
      marketplaceState.notice = 'Your outbid Gold is safely back in your wallet.';
    } else if (action === 'market-claim-auction') {
      await marketplaceManager.claimAuctionWin(control.dataset.id);
      marketplaceState.notice = 'The auction find is in your bag. The seller’s Gold is held for them to collect.';
    } else if (action === 'market-confirm-trade') {
      await marketplaceManager.confirmTrade(control.dataset.id, Number(control.dataset.revision));
      marketplaceState.notice = 'Your exact offer is confirmed. It will only lock when your friend confirms the same version.';
    } else if (action === 'market-cancel-trade') {
      await marketplaceManager.cancelTrade(control.dataset.id);
      marketplaceState.notice = 'The trade is cancelled. Each player can return their own set-aside offer.';
    } else if (action === 'market-claim-trade') {
      await marketplaceManager.claimTrade(control.dataset.id);
      marketplaceState.notice = 'Your agreed items and Gold have arrived safely.';
    } else if (action === 'market-block-player') {
      await marketplaceManager.blockPlayer(control.dataset.playerUid);
      marketplaceState.notice = 'That player is blocked from your market shelves and new trade confirmations.';
    } else if (action === 'market-report-listing') {
      await marketplaceManager.reportListing(control.dataset.id);
      marketplaceState.notice = 'Thanks. The listing report has been sent for review.';
    } else if (action === 'market-report-trade') {
      await marketplaceManager.reportTrade(control.dataset.id);
      marketplaceState.notice = 'Thanks. The trade report has been sent for review.';
    } else {
      return;
    }
    if (ticketCommerceSource) {
      awardTicketEvent('commerce', ticketCommerceSource);
      persist();
    }
    await refreshMarketplaceData();
  } catch (error) {
    marketplaceState.error = error?.message || 'That market action could not be completed. No unconfirmed exchange was made.';
  } finally {
    marketplaceState.loading = false;
    renderUI();
  }
}
async function submitMarketplaceForm(form) {
  const kind = form.dataset.marketForm;
  const formData = new FormData(form);
  if (kind === 'filter') {
    marketplaceState.search = String(formData.get('search') || '').slice(0, 60);
    marketplaceState.category = String(formData.get('category') || 'all');
    marketplaceState.rarity = String(formData.get('rarity') || 'all');
    marketplaceState.sort = ['newest', 'price-low', 'price-high'].includes(formData.get('sort')) ? formData.get('sort') : 'newest';
    renderUI();
    return;
  }
  if (marketplaceState.loading || state.phase !== 'phone' || state.world.phoneSection !== 'marketplace') return;
  const itemId = String(formData.get('itemId') || '');
  const offer = {
    itemId,
    quantity: itemId ? Math.max(0, Math.floor(Number(formData.get('quantity')) || 0)) : 0,
    gold: Math.max(0, Math.floor(Number(formData.get('gold')) || 0))
  };
  marketplaceState.error = '';
  marketplaceState.notice = '';
  marketplaceState.loading = true;
  let ticketCommerceSource = '';
  renderUI();
  try {
    if (kind === 'create-fixed') {
      await marketplaceManager.createFixedListing({
        itemId,
        quantity: Number(formData.get('quantity')),
        unitPrice: Number(formData.get('price')),
        durationMs: Number(formData.get('durationMs'))
      });
      marketplaceState.notice = 'Your items are set aside on a fixed-price shelf. You can cancel and return any unsold pieces.';
      marketplaceState.tab = 'mine';
    } else if (kind === 'create-auction') {
      await marketplaceManager.createAuction({
        itemId,
        quantity: Number(formData.get('quantity')),
        startingBid: Number(formData.get('startingBid')),
        durationMs: Number(formData.get('durationMs'))
      });
      marketplaceState.notice = 'Your rare find is safely set aside for auction. A bid cannot be cancelled after it arrives.';
      marketplaceState.tab = 'mine';
    } else if (kind === 'buy') {
      await marketplaceManager.buyFixedListing(form.dataset.listingId, Number(formData.get('quantity')));
      ticketCommerceSource = 'buying from the player market';
      marketplaceState.notice = 'The discovered find is in your bag. The seller’s Gold is ready for them to collect.';
      marketplaceState.tab = 'history';
    } else if (kind === 'bid') {
      await marketplaceManager.placeBid(form.dataset.listingId, Number(formData.get('amount')));
      marketplaceState.notice = 'Your Gold is held safely with your bid. You can return it if another player outbids you.';
      marketplaceState.tab = 'mine';
    } else if (kind === 'create-trade') {
      await marketplaceManager.createTrade({
        friendUid: String(formData.get('friendUid') || ''),
        offer
      });
      marketplaceState.notice = 'Your friend can now see the exact offer. The items are held until both of you confirm.';
    } else if (kind === 'update-trade') {
      await marketplaceManager.setTradeOffer(form.dataset.tradeId, offer);
      marketplaceState.notice = 'The offer changed. Both confirmations were cleared so you can review this exact version again.';
    } else {
      return;
    }
    if (ticketCommerceSource) {
      awardTicketEvent('commerce', ticketCommerceSource);
      persist();
    }
    await refreshMarketplaceData();
  } catch (error) {
    marketplaceState.error = error?.message || 'That market action could not be completed. Your solo save is still safe.';
  } finally {
    marketplaceState.loading = false;
    renderUI();
  }
}
async function handleSocialAction(action, control) {
  if (socialState.loading && action !== 'social-back') return;
  socialState.error = '';
  socialState.notice = '';
  const fail = (error, fallback) => {
    socialState.error = error?.message || fallback;
  };
  try {
    if (action === 'social-toggle-discovery') {
      const previous = socialManager.preferences().discoverable;
      const next = !previous;
      socialManager.setDiscoverable(next);
      try {
        await socialManager.publishProfile(publicPlayerProfile(), true, {
          allowPrivateUpdate: true
        });
      } catch (error) {
        socialManager.setDiscoverable(previous);
        throw error;
      }
      if (next) socialManager.startPresence(publicPlayerProfile);else socialManager.stopPresence();
      socialState.notice = next ? 'Your room is in Discovery. You can make it private again any time.' : 'Your room is now private from Discovery.';
    } else if (action === 'social-open-discover') {
      await loadSocialTab('featured');
      return;
    } else if (action === 'social-open-friends') {
      socialState.view = 'friends';
      await loadSocialOverview();
      return;
    } else if (action === 'social-open-requests') {
      socialState.view = 'requests';
      await loadSocialOverview();
      return;
    } else if (action === 'social-open-messages') {
      socialState.view = 'messages';
      await loadSocialOverview();
      return;
    } else if (action === 'social-open-notifications') {
      socialState.view = 'notifications';
      await loadSocialOverview();
      return;
    } else if (action === 'social-tab') {
      await loadSocialTab(control.dataset.tab);
      return;
    } else if (action === 'social-profile') {
      await openSocialProfile(control.dataset.playerUid);
      return;
    } else if (action === 'social-visit') {
      await openSocialRoom(control.dataset.roomUid, control.dataset.returnView || socialState.view);
      return;
    } else if (action === 'social-like') {
      const result = await socialPlayerService.likeRoom(control.dataset.roomUid, socialState.room?.displayName);
      socialState.roomLiked = true;
      socialState.notice = result.alreadyLiked ? 'You have already left a little like here.' : 'A little like has been left by the window.';
    } else if (action === 'social-friend-add-room') {
      const result = await socialPlayerService.addFriend(socialState.room);
      if (socialState.room?.accountType === 'simulated') {
        socialState.friends = await socialPlayerService.friends();
        socialState.roomFriend = true;
        socialState.notice = result.alreadyFriends ? 'You are already friends.' : 'A new little friend, saved on this device.';
      } else {
        socialState.notice = result.alreadyFriends ? 'You are already friends.' : result.pending ? 'A friend hello is already waiting.' : result.incomingPending ? 'They already sent you a hello. You can answer it in Friend requests.' : 'A friend hello is on its way.';
        if (result.sent) socialState.requests = await socialManager.requests();
      }
    } else if (action === 'social-add-friend') {
      const profile = socialState.searchResults.find(candidate => candidate.uid === control.dataset.playerUid);
      if (!profile) throw new Error('Search for that player again to send a hello.');
      const result = await socialPlayerService.addFriend(profile);
      if (profile.accountType === 'simulated') {
        socialState.friends = await socialPlayerService.friends();
        socialState.notice = result.alreadyFriends ? 'You are already friends.' : 'A new little friend, saved on this device.';
      } else {
        socialState.notice = result.alreadyFriends ? 'You are already friends.' : result.pending ? 'A friend hello is already waiting.' : result.incomingPending ? 'They already sent you a hello. You can answer it in Friend requests.' : 'A friend hello is on its way.';
        if (result.sent) socialState.requests = await socialManager.requests();
      }
    } else if (action === 'social-friend-remove') {
      await socialPlayerService.removeFriend(control.dataset.playerUid);
      socialState.friends = await socialPlayerService.friends();
      socialState.roomFriend = socialState.room?.uid === control.dataset.playerUid ? false : socialState.roomFriend;
      socialState.notice = 'You can add them back any time. Your room visits and their little profile are unchanged.';
    } else if (action === 'social-accept' || action === 'social-decline') {
      await socialManager.respondToRequest(control.dataset.requestId, action === 'social-accept');
      socialState.requests = await socialManager.requests();
      socialState.friends = await socialPlayerService.friends();
      socialState.notifications = await socialManager.socialNotifications();
      socialState.notice = action === 'social-accept' ? 'A new friend! Your rooms are just a little closer now.' : 'Request declined kindly. No note was sent.';
    } else if (action === 'social-chat') {
      const friend = socialState.friends.find(candidate => candidate.uid === control.dataset.friendUid) || (socialState.room?.uid === control.dataset.friendUid ? socialState.room : null);
      if (!friend) throw new Error('That friend could not be found.');
      socialState.chatFriend = friend;
      socialState.messages = await socialManager.messages(friend.uid);
      socialState.view = 'chat';
    } else if (action === 'social-collection') {
      socialState.view = 'room-collection';
    } else if (action === 'social-shop') {
      await socialPlayerService.visitShop(socialState.room?.uid);
      socialState.view = 'shop';
    } else if (action === 'social-back') {
      const backTo = {
        chat: 'messages',
        'room-collection': 'room',
        shop: 'room',
        room: socialState.roomReturnView || 'discover',
        profile: socialState.profileReturnView || 'discover',
        requests: 'friends',
        friends: 'home',
        discover: 'home',
        messages: 'home',
        notifications: 'home'
      };
      socialState.view = backTo[socialState.view] || 'home';
      socialState.error = '';
      if (socialState.view === 'discover') {
        if (!socialState.directory.length) await loadSocialTab(socialState.tab || 'featured');
        return;
      }
    } else {
      return;
    }
  } catch (error) {
    fail(error, 'That little social note could not be sent just now. Your game save is safe.');
  }
  renderUI();
}
async function submitSocialForm(form) {
  const formData = new FormData(form);
  const kind = form.dataset.socialForm;
  socialState.error = '';
  socialState.notice = '';
  if (kind === 'search') {
    const name = String(formData.get('name') || '').trim();
    if (name.length < 2) return;
    socialState.loading = true;
    renderUI();
    try {
      socialState.searchResults = await socialPlayerService.searchPlayers(name);
      if (!socialState.searchResults.length) socialState.notice = 'No shared room with that name yet. Check the spelling or let them know to share their room.';
    } catch (error) {
      socialState.error = error?.message || 'That search could not reach the little directory.';
    } finally {
      socialState.loading = false;
      renderUI();
    }
    return;
  }
  if (kind === 'message') {
    const message = String(formData.get('message') || '').trim();
    if (!message || !socialState.chatFriend) return;
    socialState.loading = true;
    renderUI();
    try {
      await socialManager.sendMessage(socialState.chatFriend, message);
      socialState.messages = await socialManager.messages(socialState.chatFriend.uid);
      socialState.threads = await socialManager.threads();
    } catch (error) {
      socialState.error = error?.message || 'Your note could not be sent just now.';
    } finally {
      socialState.loading = false;
      renderUI();
      if (socialState.view === 'chat') ui.querySelector('[data-social-form="message"] input')?.focus();
    }
  }
}
ui.addEventListener('click', event => {
  const target = event.target instanceof Element ? event.target : null;
  if (target?.closest('.next-artifact-tracker > summary')) {
    requestAnimationFrame(avoidPetDialogueHudCollisions);
  }
  const control = target?.closest('[data-action], [data-avatar]');
  const backdrop = target?.closest('.account-overlay, .objective-overlay, .return-overlay, .profile-dialog-overlay, .exploration-map-overlay');
  if (backdrop && target === backdrop) {
    const dismissAction = backdrop.classList.contains('exploration-map-overlay') ? 'close-exploration-map' : backdrop.classList.contains('return-overlay') ? 'dismiss-offline' : backdrop.classList.contains('account-overlay') ? 'close-account' : backdrop.classList.contains('profile-dialog-overlay') ? backdrop.querySelector('[data-action="close-profile-dialog"]') ? 'close-profile-dialog' : 'cancel-display-name-confirm' : 'close-objectives';
    const closeButton = backdrop.querySelector(`[data-action="${dismissAction}"]`);
    if (closeButton && !closeButton.disabled) closeButton.click();
    return;
  }
  if (sound.controlsOpen && !target?.closest('.sound-control')) {
    sound.controlsOpen = false;
    if (!control) renderUI();
  }
  if (!control || !ui.contains(control)) return;
  if (control.dataset.action === 'open-account' || control.dataset.action?.startsWith('account-') || control.dataset.action === 'close-account') {
    handleAccountAction(control.dataset.action);
    return;
  }
  if (control.dataset.action?.startsWith('dev-')) {
    handleDevSaveAction(control.dataset.action);
    return;
  }
  unlockSound();
  petDialogueManager.noteActivity(state.world);
  if (control.dataset.action?.startsWith('social-')) {
    handleSocialAction(control.dataset.action, control);
    return;
  }
  if (control.dataset.action?.startsWith('market-')) {
    handleMarketplaceAction(control.dataset.action, control);
    return;
  }
  if (control.dataset.avatar) {
    const key = control.dataset.avatar;
    const options = AVATAR_OPTIONS[key];
    if (options) {
      state.avatar[key] = (state.avatar[key] + 1) % options.length;
      persist();
      renderUI();
    }
    return;
  }
  switch (control.dataset.action) {
    case 'open-player-profile':
      if (!state.petId || !state.hasCompletedOpening) return;
      state.profileDialog = 'profile';
      state.profileDialogReturn = '';
      state.profileCharacterEditing = false;
      state.profileNotice = '';
      renderUI();
      break;
    case 'replay-companion-cinematic':
      {
        const milestone = companionCinematicForId(control.dataset.milestone);
        const stage = state.world.companionEvolutionStage || 0;
        const milestoneIndex = milestone ? COMPANION_MILESTONES.indexOf(milestone) : -1;
        if (state.cinematic || state.profileDialog !== 'profile' || milestoneIndex < 0 || milestoneIndex >= stage || !state.world.companionCinematicSeen?.includes(milestone.id)) return;
        startCompanionCinematic(milestone, {
          replay: true
        });
        break;
      }
    case 'skip-companion-cinematic':
      finishCompanionCinematic();
      break;
    case 'open-room-name-editor':
      state.profileDialogReturn = state.profileDialog === 'profile' ? 'profile' : '';
      state.profileDialog = 'room-name';
      state.roomNameDraft = state.world.room.name;
      state.profileNotice = '';
      state.profileFormInvalid = false;
      renderUI();
      requestAnimationFrame(() => ui.querySelector('#profile-room-name')?.focus());
      break;
    case 'open-display-name-editor':
      {
        const cooldown = displayNameCooldown();
        if (cooldown.remainingMs > 0) return;
        state.profileDialogReturn = state.profileDialog === 'profile' ? 'profile' : '';
        state.profileDialog = 'display-name';
        state.profileDraft = state.playerName;
        state.profileNotice = '';
        state.profileFormInvalid = false;
        renderUI();
        requestAnimationFrame(() => {
          const input = ui.querySelector('#profile-display-name');
          input?.focus();
          input?.select();
        });
        break;
      }
    case 'close-profile-dialog':
      restoreProfileDialog();
      state.profileNotice = '';
      state.profileCharacterEditing = false;
      renderUI();
      break;
    case 'cancel-display-name-confirm':
      state.profileDialog = 'display-name';
      state.profileDraft = state.pendingDisplayName;
      state.pendingDisplayName = '';
      state.profileNotice = '';
      renderUI();
      requestAnimationFrame(() => ui.querySelector('#profile-display-name')?.focus());
      break;
    case 'confirm-display-name':
      {
        const cooldown = displayNameCooldown();
        const result = validateUserText(normalizePlayerNameDraft(state.pendingDisplayName), 'PLAYER_NAME');
        if (cooldown.remainingMs > 0) {
          state.profileDialog = 'display-name';
          state.profileDraft = state.pendingDisplayName;
          state.pendingDisplayName = '';
          state.profileNotice = `You can choose a new name in ${cooldown.days} ${cooldown.days === 1 ? 'day' : 'days'}.`;
          renderUI();
          break;
        }
        if (!result.allowed || result.text === state.playerName) {
          state.profileDialog = 'display-name';
          state.profileDraft = result.allowed ? result.text : state.pendingDisplayName;
          state.pendingDisplayName = '';
          state.profileNotice = result.allowed ? 'That is already your display name.' : profileValidationNotice(result, 'Display name');
          renderUI();
          requestAnimationFrame(() => ui.querySelector('#profile-display-name')?.focus());
          break;
        }
        state.playerName = result.text;
        state.displayNameChangedAt = Date.now();
        restoreProfileDialog();
        state.profileNotice = 'Your display name has changed. You can choose another in 30 days.';
        persist();
        renderUI();
        void syncProfileChanges();
        break;
      }
    case 'toggle-character-editor':
      if (!state.profileCharacterEditing) {
        state.profileCharacterEditing = true;
        state.profileNotice = '';
        renderUI();
      } else {
        state.profileCharacterEditing = false;
        state.profileNotice = 'Your character look is saved.';
        persist();
        renderUI();
        void syncProfileChanges();
      }
      break;
    case 'finish-character-edit':
      state.profileCharacterEditing = false;
      state.profileNotice = 'Your character look is saved.';
      persist();
      renderUI();
      void syncProfileChanges();
      break;
    case 'sound':
      sound.controlsOpen = !sound.controlsOpen;
      renderUI();
      break;
    case 'close-sound':
      sound.controlsOpen = false;
      renderUI();
      break;
    case 'greet-clover':
      npcBehaviorManager.interact(state.world, 'clover', {
        playerName: state.playerName
      });
      persist();
      renderUI();
      break;
    case 'dismiss-pet-dialogue':
      petDialogueManager.dismiss(state.world);
      persist();
      renderUI();
      break;
    case 'set-room-wall':
      {
        const style = ROOM_WALL_STYLES.find(candidate => candidate.id === control.dataset.style);
        if (!style || style.id === state.world.room.wallStyle) return;
        state.world.room.wallStyle = style.id;
        rememberCloverEvent('room-change', {
          themeName: ROOM_THEMES[state.world.activeRoomTheme]?.name || 'your room'
        });
        persist();
        renderUI();
        break;
      }
    case 'set-room-floor':
      {
        const style = ROOM_FLOOR_STYLES.find(candidate => candidate.id === control.dataset.style);
        if (!style || style.id === state.world.room.floorStyle) return;
        state.world.room.floorStyle = style.id;
        rememberCloverEvent('room-change', {
          themeName: ROOM_THEMES[state.world.activeRoomTheme]?.name || 'your room'
        });
        persist();
        renderUI();
        break;
      }
    case 'toggle-sound':
      toggleSound();
      break;
    case 'open-objectives':
      if (!state.petId) return;
      state.objectiveTab = availableLevelUpQuest() ? 'level-up' : 'daily';
      state.overlay = 'objectives';
      renderUI();
      break;
    case 'objective-tab':
      if (control.dataset.tab === 'level-up' && availableLevelUpQuest()) state.objectiveTab = 'level-up';else state.objectiveTab = 'daily';
      renderUI();
      break;
    case 'close-objectives':
      state.overlay = null;
      renderUI();
      break;
    case 'claim-objective':
      claimObjective(Number(control.dataset.tier));
      break;
    case 'claim-all-objectives':
      claimAllObjectives();
      break;
    case 'dismiss-offline':
      state.world.pendingOfflineReward = null;
      persist();
      renderUI();
      break;
    case 'new-game':
      if (state.phase === 'title') {
        if (save) {
          if (!transitionOpening('restart-confirm')) return;
          renderUI();
        } else {
          enterNewGame();
        }
      } else if (state.overlay === 'account' && save) {
        state.overlay = null;
        state.phase = 'title';
        if (!transitionOpening('restart-confirm')) return;
        renderUI();
      }
      break;
    case 'continue':
      if (state.phase === 'title') resumeGame();
      break;
    case 'confirm-new':
      if (state.phase === 'restart-confirm') enterNewGame();
      break;
    case 'cancel-new':
      if (state.phase === 'restart-confirm') resumeGame();
      break;
    case 'to-name':
      if (!transitionOpening('player-name')) return;
      persist();
      renderUI();
      break;
    case 'back-to-creation':
      if (!transitionOpening('creation')) return;
      persist();
      renderUI();
      break;
    case 'back-to-name':
      if (!transitionOpening('player-name')) return;
      persist();
      renderUI();
      break;
    case 'save-name':
      {
        if (state.phase !== 'player-name') return;
        const input = ui.querySelector('#player-name');
        const candidate = normalizePlayerNameDraft(input?.value ?? state.playerName);
        const result = validateUserText(candidate, 'PLAYER_NAME');
        if (!result.allowed) {
          state.playerName = candidate;
          state.nameEntryError = result.reason === 'too_short' ? 'Please choose a name with at least two letters.' : 'Let’s try a different name for our little world.';
          renderUI();
          requestAnimationFrame(() => ui.querySelector('#player-name')?.focus());
          return;
        }
        state.playerName = result.text;
        state.nameEntryError = '';
        if (!transitionOpening('pet-select')) return;
        persist();
        renderUI();
        break;
      }
    case 'select-pet':
      if (state.phase !== 'pet-select' || !PETS.some(pet => pet.id === control.dataset.pet)) return;
      state.selectedPet = control.dataset.pet;
      persist();
      renderUI();
      break;
    case 'choose-pet':
      {
        if (state.phase !== 'pet-select' || !sanitizePlayerName(state.playerName) || !PETS.some(pet => pet.id === state.selectedPet)) return;
        state.petId = state.selectedPet;
        if (!transitionOpening('room-reveal')) {
          state.petId = null;
          return;
        }
        state.revealAt = state.time;
        state.hearts.length = 0;
        playSound(arrivalSound);
        for (let i = 0; i < 34; i++) spawnSparkle(W * 0.28 + Math.random() * W * 0.48, H * 0.62 + Math.random() * H * 0.18);
        persist();
        renderUI();
        break;
      }
    case 'say-hello':
      if (state.phase !== 'pet-intro' || !state.petId || !transitionOpening('window-moment')) return;
      state.windowGlimmer = state.time + 6;
      state.reactionUntil = state.time + 1.5;
      for (let i = 0; i < 6; i++) spawnHeart();
      playPetInteractionSound();
      persist();
      renderUI();
      break;
    case 'look-outside':
      if (state.phase !== 'window-moment' || !state.petId || !transitionOpening('explore')) return;
      state.windowGlimmer = state.time + 5;
      persist();
      renderUI();
      break;
    case 'choose-trail':
      if (!transitionOpening('destination')) return;
      state.roomFeedback = '';
      state.roomFeedbackUntil = 0;
      persist();
      renderUI();
      break;
    case 'acknowledge-invitation':
      if (state.phase !== 'explore') return;
      state.inviteAcknowledged = true;
      state.reactionUntil = state.time + 1.4;
      spawnHeart();
      playPetInteractionSound();
      renderUI();
      break;
    case 'dismiss-invitation':
      if (state.phase !== 'explore') return;
      state.world.exploreInvitationDismissed = true;
      persist();
      renderUI();
      break;
    case 'send-again':
      state.phase = 'destination';
      persist();
      renderUI();
      break;
    case 'send-pet':
      beginExpedition();
      break;
    case 'start-auto-explore':
      startAutoExplore();
      break;
    case 'stop-auto-explore':
      stopAutoExplore();
      break;
    case 'open-exploration-map':
      {
        const itemId = control.dataset.mapItem;
        const sourceAreas = ITEM_CATALOG[itemId] ? eligibleMaterialSourceAreas(itemId) : [];
        state.explorationMapOpen = true;
        state.explorationMapItemId = sourceAreas.length ? itemId : null;
        if (state.explorationMapItemId && sourceAreas.length === 1) {
          state.world.activeAreaId = sourceAreas[0].id;
          persist();
        }
        renderUI();
        break;
      }
    case 'close-exploration-map':
      state.explorationMapOpen = false;
      state.explorationMapItemId = null;
      renderUI();
      break;
    case 'select-map-area':
      {
        if (!state.explorationMapOpen) return;
        const area = AREA_CATALOG.find(entry => entry.id === control.dataset.area);
        if (!area || !explorationMapAreas().some(entry => entry.id === area.id) || !areaAccessible(state.world, area)) return;
        state.world.activeAreaId = area.id;
        state.explorationMapOpen = false;
        state.explorationMapItemId = null;
        persist();
        renderUI();
        break;
      }
    case 'select-area':
      {
        if (state.phase !== 'destination') return;
        const areaId = control.dataset.area;
        const area = AREA_CATALOG.find(entry => entry.id === areaId);
        if (!areaAccessible(state.world, area)) return;
        state.world.activeAreaId = areaId;
        state.world.trailChoicesSeen = [...new Set([...(state.world.trailChoicesSeen || []), areaId])];
        persist();
        renderUI();
        break;
      }
    case 'craft-milestone':
      craftMilestone(control.dataset.milestone);
      break;
    case 'locked-area':
      {
        const area = AREA_CATALOG.find(entry => entry.id === control.dataset.area);
        if (!area || areaAccessible(state.world, area)) return;
        triggerPetDialogue('lockedAreaAttempt', {
          zoneId: area.id,
          zoneName: area.name,
          requiredLevel: area.minLevel
        });
        renderUI();
        break;
      }
    case 'back-home':
      if (state.phase !== 'destination') return;
      if (state.world.expeditions > 0) state.phase = 'basecamp';else if (!transitionOpening('explore')) return;
      persist();
      renderUI();
      break;
    case 'claim-reward':
    case 'close-reward':
      claimReward();
      break;
    case 'toggle-basecamp-panel':
      if (state.phase !== 'basecamp') return;
      state.basecampPanelExpanded = !state.basecampPanelExpanded;
      renderUI();
      break;
    case 'open-phone':
      if (!state.world.phoneUnlocked) return;
      state.world.phoneSection = 'home';
      state.phase = 'phone';
      persist();
      renderUI();
      break;
    case 'open-room-shop':
      if (state.phase !== 'basecamp' || !state.world.phoneUnlocked) return;
      state.world.phoneSection = 'shop';
      state.phase = 'phone';
      shopTab = 'buy';
      shopNotice = '';
      ensureRoomShopRotation(state.world, Date.now());
      persist();
      renderUI();
      break;
    case 'close-phone':
      state.phase = 'basecamp';
      state.milestoneCraftNotice = '';
      persist();
      renderUI();
      break;
    case 'phone-home':
      state.world.phoneSection = 'home';
      socialState.view = 'home';
      persist();
      renderUI();
      break;
    case 'open-milestone-craft':
      openMilestoneCrafting(control.dataset.milestone);
      break;
    case 'open-crafting':
      if (!state.world.phoneUnlocked) return;
      state.world.phoneSection = 'crafting';
      state.milestoneCraftNotice = '';
      state.milestoneCraftFocusId = pendingMilestone()?.id || null;
      state.selectedCraftIngredients = [];
      const openCraftRecipe = state.world.knownRecipes.includes(state.world.selectedCraftRecipe) ? state.world.selectedCraftRecipe : state.world.knownRecipes.find(recipeId => state.world.discoveredRecipes.includes(recipeId)) || null;
      state.selectedCraftRecipe = openCraftRecipe || 'meadowglow-tonic';
      state.world.selectedCraftRecipe = openCraftRecipe;
      state.phase = 'phone';
      evaluateCraftingHint();
      persist();
      renderUI();
      break;
    case 'select-recipe':
      {
        const recipeId = control.dataset.recipe;
        if (!RECIPES[recipeId] || !state.world.discoveredRecipes.includes(recipeId)) return;
        state.selectedCraftRecipe = recipeId;
        state.world.selectedCraftRecipe = recipeId;
        state.selectedCraftIngredients = [];
        evaluateCraftingHint(recipeId);
        persist();
        renderUI();
        break;
      }
    case 'learn-recipe':
      {
        const recipeId = control.dataset.recipe;
        if (!RECIPES[recipeId] || !state.world.discoveredRecipes.includes(recipeId) || state.world.knownRecipes.includes(recipeId)) return;
        state.world.knownRecipes.push(recipeId);
        state.selectedCraftRecipe = recipeId;
        state.world.selectedCraftRecipe = recipeId;
        state.selectedCraftIngredients = [];
        evaluateCraftingHint(recipeId);
        persist();
        renderUI();
        break;
      }
    case 'toggle-ingredient':
      {
        const recipe = RECIPES[control.dataset.recipe];
        const itemId = control.dataset.item;
        const requirement = recipe?.ingredients.find(ingredient => ingredient.itemId === itemId);
        if (!requirement || (state.world.inventory[itemId] || 0) < requirement.quantity || !state.world.knownRecipes.includes(recipe.id)) return;
        state.selectedCraftRecipe = recipe.id;
        state.selectedCraftIngredients = state.selectedCraftIngredients.includes(itemId) ? state.selectedCraftIngredients.filter(selectedId => selectedId !== itemId) : [...state.selectedCraftIngredients, itemId];
        renderUI();
        break;
      }
    case 'brew-recipe':
      beginCrafting(control.dataset.recipe);
      break;
    case 'use-potion':
      usePotion(control.dataset.item);
      break;
    case 'buy-room-item':
      buyRoomShopItem(control.dataset.item, control.dataset.slot);
      break;
    case 'sell-to-npc':
      sellToNpc(control.dataset.item, Number(control.dataset.quantity) || 1);
      break;
    case 'sell-all-to-npc':
      sellToNpc(control.dataset.item, Number(control.dataset.quantity));
      break;
    case 'shop-tab':
      if (!['buy', 'sell', 'auto-sell', 'history'].includes(control.dataset.tab)) return;
      shopTab = control.dataset.tab;
      shopNotice = '';
      renderUI();
      break;
    case 'toggle-auto-sell':
      if (state.phase !== 'phone' || state.world.phoneSection !== 'shop') return;
      state.world.autoSellEnabled = !state.world.autoSellEnabled;
      shopTab = 'auto-sell';
      shopNotice = state.world.autoSellEnabled ? 'Smart Auto-Sell is on. Clover will wait until each outing’s rewards are safely in your satchel.' : 'Smart Auto-Sell is off. Your finds will stay in your satchel.';
      persist();
      renderUI();
      break;
    case 'buy-room-theme':
      buyRoomTheme(control.dataset.theme);
      break;
    case 'activate-room-theme':
      activateRoomTheme(control.dataset.theme);
      break;
    case 'dismiss-talent-toast':
      state.talentPointToast = 0;
      renderUI();
      break;
    case 'open-talents-from-toast':
      state.talentPointToast = 0;
      state.overlay = null;
      state.phase = 'phone';
      state.world.phoneSection = 'talents';
      persist();
      renderUI();
      break;
    case 'invest-talent':
      investTalent(control.dataset.talent);
      break;
    case 'phone-section':
      if (!['profile', 'xp', 'talents', 'collection', 'inventory', 'pet', 'room', 'shop', 'notifications', 'crafting', 'social', 'marketplace'].includes(control.dataset.section)) return;
      if (state.profileDialog === 'profile') {
        state.profileDialog = '';
        state.profileDialogReturn = '';
        state.profileCharacterEditing = false;
      }
      const previousPhoneSection = state.world.phoneSection;
      state.world.phoneSection = control.dataset.section;
      state.milestoneCraftNotice = control.dataset.section === 'crafting' ? state.milestoneCraftNotice : '';
      state.milestoneCraftFocusId = control.dataset.section === 'crafting' ? pendingMilestone()?.id || null : null;
      state.selectedCraftIngredients = [];
      if (control.dataset.section === 'shop' && previousPhoneSection !== 'shop') {
        shopTab = 'buy';
        shopNotice = '';
      }
      if (control.dataset.section === 'crafting') {
        const knownRecipe = state.world.knownRecipes.includes(state.world.selectedCraftRecipe) ? state.world.selectedCraftRecipe : state.world.knownRecipes.find(recipeId => state.world.discoveredRecipes.includes(recipeId)) || null;
        state.selectedCraftRecipe = knownRecipe || 'meadowglow-tonic';
        state.world.selectedCraftRecipe = knownRecipe;
      }
      if (control.dataset.section === 'social') {
        socialState.view = 'home';
        socialState.error = '';
        socialState.notice = '';
      }
      if (control.dataset.section === 'crafting') evaluateCraftingHint();
      persist();
      renderUI();
      if (control.dataset.section === 'social') loadSocialOverview();
      if (control.dataset.section === 'marketplace') loadMarketplace();
      break;
  }
});
ui.addEventListener('submit', event => {
  const form = event.target.closest('[data-profile-form], [data-account-form], [data-social-form], [data-market-form], [data-shop-sell-form]');
  if (!form || !ui.contains(form)) return;
  event.preventDefault();
  if (form.matches('[data-profile-form]')) submitProfileForm(form);else if (form.matches('[data-account-form]')) submitAccountForm(form);else if (form.matches('[data-social-form]')) submitSocialForm(form);else if (form.matches('[data-market-form]')) submitMarketplaceForm(form);else sellToNpc(form.dataset.item, Number(new FormData(form).get('quantity')));
});
ui.addEventListener('input', event => {
  if (!(event.target instanceof HTMLInputElement)) return;
  if (event.target.matches('[data-shop-sell-quantity]')) {
    const form = event.target.closest('[data-shop-sell-form]');
    const quantity = event.target.valueAsNumber;
    const price = Number(form?.dataset.price);
    const minimum = Number(event.target.min);
    const maximum = Number(event.target.max);
    const valid = Number.isSafeInteger(quantity) && quantity >= minimum && quantity <= maximum && Number.isSafeInteger(price) && price > 0;
    const output = form?.querySelector('[data-shop-sale-total]');
    const submit = form?.querySelector('button[type="submit"]');
    if (output) output.textContent = valid ? `${(quantity * price).toLocaleString()} Gold` : '—';
    if (submit) submit.disabled = !valid || !Number.isSafeInteger(quantity * price);
    return;
  }
  if (event.target.matches('[data-audio-volume]')) {
    setSoundVolume(event.target.value);
    return;
  }
  if (event.target.id === 'account-email') {
    accountEmail = event.target.value.slice(0, 254);
    return;
  }
  if (event.target.id === 'player-name' && state.phase === 'player-name') {
    const cleanName = normalizePlayerNameDraft(event.target.value);
    if (event.target.value !== cleanName) event.target.value = cleanName;
    state.playerName = cleanName;
    state.nameEntryError = '';
    event.target.setAttribute('aria-invalid', 'false');
    const error = ui.querySelector('#name-entry-error');
    if (error) error.textContent = '';
    const submit = ui.querySelector('[data-action="save-name"]');
    if (submit) submit.disabled = !cleanName;
    return;
  }
  if (event.target.id === 'profile-room-name') state.roomNameDraft = event.target.value;
  if (event.target.id === 'profile-display-name') state.profileDraft = event.target.value;
  if (event.target.id === 'profile-room-name' || event.target.id === 'profile-display-name') {
    state.profileFormInvalid = false;
    event.target.setAttribute('aria-invalid', 'false');
    if (state.profileNotice) {
      state.profileNotice = '';
      const notice = ui.querySelector('#profile-form-notice');
      if (notice) notice.textContent = '';
    }
  }
});
function navigateBack() {
  if (sound.controlsOpen) {
    sound.controlsOpen = false;
    renderUI();
    return;
  }
  if (state.profileDialog) {
    restoreProfileDialog();
    state.profileNotice = '';
    state.profileCharacterEditing = false;
    renderUI();
    return;
  }
  if (state.overlay === 'account') {
    if (playerSaveManager.getStatus().pendingUser || accountBusy) return;
    state.overlay = null;
    accountView = 'home';
    renderUI();
    return;
  }
  if (state.world.pendingOfflineReward) {
    state.world.pendingOfflineReward = null;
    persist();
    renderUI();
    return;
  }
  if (state.overlay === 'objectives') {
    state.overlay = null;
    renderUI();
    return;
  }
  if (state.phase === 'phone') {
    if (state.world.phoneSection === 'social' && socialState.view !== 'home') {
      const socialBack = ui.querySelector('[data-action="social-back"]');
      if (socialBack) {
        socialBack.click();
        return;
      }
      socialState.view = 'home';
    }
    if (state.world.phoneSection !== 'home') {
      state.world.phoneSection = 'home';
      state.selectedCraftIngredients = [];
      socialState.view = 'home';
      persist();
      renderUI();
      return;
    }
    state.phase = 'basecamp';
    persist();
    renderUI();
    return;
  }
  if (state.phase === 'destination') {
    if (state.world.expeditions > 0) state.phase = 'basecamp';else if (!transitionOpening('explore')) return;
    persist();
    renderUI();
    return;
  }
  if (state.phase === 'player-name') {
    if (!transitionOpening('creation')) return;
    persist();
    renderUI();
    return;
  }
  if (state.phase === 'pet-select') {
    if (!transitionOpening('player-name')) return;
    persist();
    renderUI();
    return;
  }
  if (state.phase === 'restart-confirm') resumeGame();
}
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    event.preventDefault();
    if (state.cinematic) {
      finishCompanionCinematic();
      return;
    }
    navigateBack();
    return;
  }
  if (event.key === 'Enter' && event.target.id === 'player-name' && state.phase === 'player-name' && normalizePlayerNameDraft(event.target.value)) {
    event.preventDefault();
    ui.querySelector('[data-action="save-name"]')?.click();
  }
});
let lastLifecyclePersistAt = 0;
function persistBeforeLeaving() {
  const now = Date.now();
  if (now - lastLifecyclePersistAt < 1200) return;
  lastLifecyclePersistAt = now;
  persist();
}
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    stopAutoExplore('Auto Explore paused while Pocketwild was in the background. This outing will finish normally.');
    persistBeforeLeaving();
    playerSaveManager.flush().catch(error => console.warn('[Pocketwild cloud save] Final background sync failed; the local copy remains safe.', error));
  }
});
window.addEventListener('pagehide', () => {
  stopAutoExplore('Auto Explore paused as Pocketwild closed. This outing will finish normally.');
  persistBeforeLeaving();
  playerSaveManager.flush().catch(error => console.warn('[Pocketwild cloud save] Page-close sync failed; the local copy remains safe.', error));
});
function spawnSparkle(x, y) {
  const angle = Math.random() * Math.PI * 2;
  const speed = 16 + Math.random() * 70;
  state.sparkles.push({
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed - 16,
    life: 0.8 + Math.random() * 0.8,
    size: 2 + Math.floor(Math.random() * 3)
  });
}
function petPosition() {
  const layout = roomArtLayout();
  let x = layout.x + layout.width * 0.55;
  const inMeadow = state.phase === 'destination' || state.phase === 'meadow';
  const homePhases = ['pet-intro', 'window-moment', 'explore', 'reward-reveal', 'basecamp', 'phone'];
  const atHome = homePhases.includes(state.phase);
  const floor = inMeadow ? H * 0.77 : layout.y + layout.height * 0.72;
  const elapsed = Math.max(0, state.time - state.phaseAt);
  const activity = state.time % 31;
  if (state.phase === 'room-reveal') {
    const t = Math.max(0, Math.min(1, (state.time - state.revealAt) / 1.45));
    const eased = 1 - Math.pow(1 - t, 3);
    x = W * (-0.16 + 0.78 * eased);
  } else if (state.phase === 'departing') {
    const t = Math.min(1, elapsed / 0.95);
    x = W * (0.62 + 0.53 * t);
  } else if (state.phase === 'returning') {
    const t = Math.min(1, elapsed / 1.05);
    x = W * (-0.12 + 0.74 * t);
  } else if (inMeadow) {
    x = W * (0.53 + Math.sin(state.time * 1.7) * 0.055);
  } else if (state.phase === 'window-moment') {
    x = layout.x + layout.width * (0.54 + Math.sin(state.time * 1.5) * 0.018);
  } else if (atHome && activity > 19 && activity < 22.5) {
    x = layout.x + layout.width * (0.46 + Math.sin((activity - 19) * 1.7) * 0.035);
  } else if (atHome) {
    x = layout.x + layout.width * (0.53 + Math.sin(state.time * 0.42) * 0.045);
  } else {
    x += Math.sin(state.time * 0.35) * W * 0.025;
  }
  const bob = state.phase === 'room-reveal' ? Math.abs(Math.sin((state.time - state.revealAt) * 9)) * 5 : inMeadow ? Math.abs(Math.sin(state.time * 4.2)) * 6 : atHome && activity > 7.3 && activity < 9.4 ? Math.abs(Math.sin((activity - 7.3) * 3.4)) * H * 0.016 : 0;
  return {
    x,
    bottom: floor - bob
  };
}
function roundedRect(x, y, width, height, radius, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  ctx.fill();
}
function drawCover(image) {
  ctx.fillStyle = '#332319';
  ctx.fillRect(0, 0, W, H);
  if (!image.complete || !image.naturalWidth) return;
  const scale = Math.max(W / image.naturalWidth, H / image.naturalHeight);
  const width = image.naturalWidth * scale;
  const height = image.naturalHeight * scale;
  ctx.drawImage(image, Math.floor((W - width) / 2), Math.floor((H - height) / 2), Math.ceil(width), Math.ceil(height));
}
function drawCloud(x, y, width, color = 'rgba(255,249,218,.58)') {
  ctx.fillStyle = color;
  ctx.fillRect(x + width * 0.18, y, width * 0.56, 6);
  ctx.fillRect(x, y + 6, width, 7);
  ctx.fillRect(x + width * 0.12, y + 13, width * 0.72, 4);
}
function drawMeadowScene(area) {
  const [, hill, farGrass, nearGrass, sunGlow] = area.palette;
  ctx.fillStyle = area.palette[0];
  ctx.fillRect(0, 0, W, H);
  ctx.fillRect(0, 0, W, H * 0.43);
  const cloudDrift = Math.sin(state.time * 0.11) * W * 0.018;
  drawCloud(W * 0.12 + cloudDrift, H * 0.19, W * 0.16);
  drawCloud(W * 0.58 - cloudDrift * 0.72, H * 0.34, W * 0.13, 'rgba(255,249,218,.43)');
  const sunX = W * 0.78;
  const sunY = H * 0.25;
  ctx.fillStyle = 'rgba(255,233,164,.24)';
  ctx.fillRect(sunX - 27, sunY - 27, 54, 54);
  ctx.fillStyle = sunGlow;
  ctx.fillRect(sunX - 16, sunY - 16, 32, 32);
  ctx.fillStyle = '#fff0bd';
  ctx.fillRect(sunX - 8, sunY - 19, 16, 38);
  ctx.fillRect(sunX - 19, sunY - 8, 38, 16);
  ctx.fillStyle = hill;
  ctx.beginPath();
  ctx.ellipse(W * 0.19, H * 0.57, W * 0.48, H * 0.2, 0, 0, Math.PI * 2);
  ctx.ellipse(W * 0.83, H * 0.58, W * 0.47, H * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = farGrass;
  ctx.fillRect(0, H * 0.58, W, H * 0.42);
  ctx.fillStyle = nearGrass;
  ctx.fillRect(0, H * 0.64, W, H * 0.36);
  ctx.fillStyle = 'rgba(225,198,139,.36)';
  ctx.beginPath();
  ctx.moveTo(W * 0.43, H);
  ctx.quadraticCurveTo(W * 0.53, H * 0.84, W * 0.46, H * 0.69);
  ctx.lineTo(W * 0.59, H * 0.69);
  ctx.quadraticCurveTo(W * 0.56, H * 0.86, W * 0.69, H);
  ctx.closePath();
  ctx.fill();
  [0.07, 0.14, 0.23, 0.31, 0.39, 0.47, 0.56, 0.66, 0.73, 0.84, 0.93].forEach((x, index) => {
    const y = H * (0.69 + index % 3 * 0.045);
    const px = W * x + Math.sin(state.time * 0.72 + index * 1.9) * W * 0.002;
    ctx.fillStyle = index % 2 ? '#f4dfa1' : '#f6f0cc';
    ctx.fillRect(Math.round(px), Math.round(y), 4, 4);
    ctx.fillStyle = '#fff1c4';
    ctx.fillRect(Math.round(px + 2), Math.round(y - 2), 3, 3);
    ctx.fillStyle = '#5f8152';
    ctx.fillRect(Math.round(px + 1), Math.round(y + 4), 2, 7);
    if (index % 3 === 0) {
      ctx.fillStyle = '#e6a783';
      ctx.fillRect(Math.round(px + W * 0.035), Math.round(y + 10), 4, 4);
      ctx.fillStyle = '#678651';
      ctx.fillRect(Math.round(px + W * 0.035 + 1), Math.round(y + 14), 2, 6);
    }
  });
}
function drawWildwoodScene(area) {
  const [sky, canopy, deepGreen, ground, glow] = area.palette;
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#d7dfb5';
  ctx.globalAlpha = 0.16;
  ctx.beginPath();
  ctx.moveTo(W * 0.42, H * 0.1);
  ctx.lineTo(W * 0.69, H * 0.1);
  ctx.lineTo(W * 0.93, H * 0.72);
  ctx.lineTo(W * 0.2, H * 0.72);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = deepGreen;
  ctx.fillRect(0, H * 0.6, W, H * 0.4);
  const trees = [0.04, 0.24, 0.47, 0.73, 0.96];
  trees.forEach((position, index) => {
    const x = W * position + Math.sin(state.time * 0.24 + index * 1.6) * W * 0.003;
    const trunkWidth = Math.max(12, W * (index % 2 ? 0.055 : 0.075));
    const trunkTop = H * (index % 2 ? 0.13 : 0.2);
    ctx.fillStyle = index % 2 ? '#493d38' : '#57443a';
    ctx.fillRect(x - trunkWidth / 2, trunkTop, trunkWidth, H * 0.58);
    ctx.fillStyle = '#7a6544';
    ctx.fillRect(x - trunkWidth * 0.18, trunkTop + H * 0.05, trunkWidth * 0.16, H * 0.43);
    ctx.fillStyle = index % 2 ? deepGreen : canopy;
    ctx.beginPath();
    ctx.ellipse(x, trunkTop + H * 0.015, W * 0.2, H * 0.17, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = index % 2 ? canopy : '#6f875d';
    ctx.beginPath();
    ctx.ellipse(x + W * 0.04, trunkTop + H * 0.08, W * 0.14, H * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.fillStyle = ground;
  ctx.fillRect(0, H * 0.69, W, H * 0.31);
  ctx.fillStyle = 'rgba(224,211,146,.3)';
  ctx.beginPath();
  ctx.moveTo(W * 0.3, H);
  ctx.quadraticCurveTo(W * 0.5, H * 0.84, W * 0.47, H * 0.68);
  ctx.lineTo(W * 0.57, H * 0.68);
  ctx.quadraticCurveTo(W * 0.58, H * 0.87, W * 0.75, H);
  ctx.fill();
  for (let i = 0; i < 7; i++) {
    const x = W * (0.12 + i * 0.12);
    const y = H * (0.73 + i % 3 * 0.045);
    ctx.fillStyle = i % 2 ? '#a9c17c' : glow;
    ctx.fillRect(x, y, 4, 3);
    ctx.fillStyle = '#394b38';
    ctx.fillRect(x + 2, y + 3, 2, 8);
  }
}
function drawCrystal(x, baseY, width, height, color, highlight) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x - width / 2, baseY);
  ctx.lineTo(x - width * 0.34, baseY - height * 0.64);
  ctx.lineTo(x, baseY - height);
  ctx.lineTo(x + width * 0.34, baseY - height * 0.62);
  ctx.lineTo(x + width / 2, baseY);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = highlight;
  ctx.beginPath();
  ctx.moveTo(x - width * 0.22, baseY - height * 0.15);
  ctx.lineTo(x, baseY - height * 0.86);
  ctx.lineTo(x + width * 0.04, baseY - height * 0.12);
  ctx.closePath();
  ctx.fill();
}
function drawCavernScene(area) {
  const [sky, stone, shadow, pool, crystal] = area.palette;
  ctx.fillStyle = '#263746';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = sky;
  ctx.globalAlpha = 0.42;
  ctx.beginPath();
  ctx.ellipse(W * 0.5, H * 0.42, W * 0.72, H * 0.55, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = stone;
  ctx.fillRect(0, 0, W, H * 0.13);
  for (let i = 0; i < 7; i++) {
    const x = W * (i / 6);
    const width = W * (0.1 + i % 3 * 0.025);
    const tip = H * (0.18 + i % 3 * 0.055);
    ctx.fillStyle = i % 2 ? shadow : stone;
    ctx.beginPath();
    ctx.moveTo(x - width / 2, H * 0.08);
    ctx.lineTo(x + width / 2, H * 0.08);
    ctx.lineTo(x, tip);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = shadow;
  ctx.fillRect(0, H * 0.72, W, H * 0.28);
  ctx.fillStyle = 'rgba(110,210,220,.18)';
  ctx.beginPath();
  ctx.ellipse(W * 0.51, H * 0.79, W * 0.48, H * 0.095, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = pool;
  ctx.beginPath();
  ctx.ellipse(W * 0.51, H * 0.8, W * 0.39, H * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();
  const clusters = [[0.12, 0.73, 0.12, 0.3], [0.31, 0.77, 0.09, 0.19], [0.74, 0.75, 0.13, 0.32], [0.91, 0.77, 0.1, 0.23]];
  clusters.forEach(([x, y, width, height], index) => {
    const px = W * x;
    const base = H * y;
    drawCrystal(px, base, W * width * 0.55, H * height, crystal, '#d4f7ee');
    drawCrystal(px + W * width * 0.36, base, W * width * 0.48, H * height * 0.68, index % 2 ? '#77b6c5' : '#8ac8c1', '#d3fff0');
    drawCrystal(px - W * width * 0.33, base, W * width * 0.45, H * height * 0.56, '#759db4', '#c9ebee');
  });
  ctx.fillStyle = 'rgba(208,246,239,.28)';
  for (let i = 0; i < 9; i++) {
    const x = W * ((i * 0.137 + 0.08) % 0.9);
    const y = H * (0.32 + i % 4 * 0.085) + Math.sin(state.time * 0.7 + i) * 4;
    ctx.fillRect(x, y, 3, 3);
  }
}
function drawGroveScene(area) {
  const [sky, hill, deep, ground, moonGlow] = area.palette;
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(221,220,255,.09)';
  ctx.beginPath();
  ctx.ellipse(W * 0.77, H * 0.22, W * 0.27, H * 0.23, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = moonGlow;
  ctx.beginPath();
  ctx.arc(W * 0.77, H * 0.22, Math.max(17, W * 0.075), 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f6edda';
  ctx.beginPath();
  ctx.arc(W * 0.79, H * 0.2, Math.max(14, W * 0.064), 0, Math.PI * 2);
  ctx.fill();
  for (let i = 0; i < 18; i++) {
    const x = W * ((i * 0.173 + 0.04) % 0.94);
    const y = H * (0.08 + i % 5 * 0.075);
    ctx.globalAlpha = 0.35 + (Math.sin(state.time * 1.7 + i) + 1) * 0.22;
    ctx.fillStyle = '#e4e0ff';
    ctx.fillRect(x, y, 2, 2);
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = hill;
  ctx.beginPath();
  ctx.ellipse(W * 0.22, H * 0.61, W * 0.54, H * 0.19, 0, 0, Math.PI * 2);
  ctx.ellipse(W * 0.84, H * 0.62, W * 0.52, H * 0.21, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = deep;
  ctx.fillRect(0, H * 0.65, W, H * 0.35);
  [0.08, 0.29, 0.56, 0.9].forEach((position, index) => {
    const x = W * position;
    const trunkWidth = W * 0.055;
    ctx.fillStyle = '#292c45';
    ctx.fillRect(x - trunkWidth / 2, H * (index % 2 ? 0.26 : 0.36), trunkWidth, H * 0.47);
    ctx.fillStyle = index % 2 ? '#3c405c' : '#464766';
    ctx.beginPath();
    ctx.ellipse(x, H * 0.31, W * 0.18, H * 0.13, 0, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.strokeStyle = '#8f8b9c';
  ctx.lineWidth = Math.max(3, W * 0.012);
  ctx.beginPath();
  ctx.moveTo(W * 0.04, H * 0.85);
  ctx.quadraticCurveTo(W * 0.25, H * 0.79, W * 0.32, H * 0.97);
  ctx.moveTo(W * 0.97, H * 0.84);
  ctx.quadraticCurveTo(W * 0.77, H * 0.8, W * 0.71, H * 0.98);
  ctx.stroke();
  [0.14, 0.34, 0.47, 0.67, 0.84].forEach((position, index) => {
    const x = W * position;
    const y = H * (0.72 + index % 2 * 0.075);
    const pulse = 0.58 + (Math.sin(state.time * 2.2 + index) + 1) * 0.17;
    ctx.globalAlpha = pulse;
    ctx.fillStyle = '#e5c9fa';
    ctx.fillRect(x, y, 8, 5);
    ctx.fillRect(x + 2, y - 3, 4, 3);
    ctx.fillStyle = '#f6ecb8';
    ctx.fillRect(x + 3, y + 1, 2, 2);
  });
  ctx.globalAlpha = 1;
  ctx.fillStyle = ground;
  ctx.globalAlpha = 0.42;
  ctx.fillRect(0, H * 0.9, W, H * 0.1);
  ctx.globalAlpha = 1;
}
function drawCanopyScene(area) {
  const [sky, canopy, deep, ground, glow] = area.palette;
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(238,239,210,.42)';
  ctx.fillRect(0, H * 0.55, W, H * 0.11);
  const trunks = [0.08, 0.3, 0.69, 0.94];
  trunks.forEach((position, index) => {
    const x = W * position;
    const trunkWidth = W * (index % 2 ? 0.055 : 0.075);
    const top = H * (0.08 + index % 2 * 0.08);
    ctx.fillStyle = index % 2 ? '#55483c' : '#66513a';
    ctx.fillRect(x - trunkWidth / 2, top, trunkWidth, H * 0.72);
    ctx.fillStyle = '#9c8054';
    ctx.fillRect(x - trunkWidth * 0.17, top + H * 0.06, trunkWidth * 0.16, H * 0.5);
    ctx.fillStyle = index % 2 ? deep : canopy;
    ctx.beginPath();
    ctx.ellipse(x, top + H * 0.025, W * 0.24, H * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = index % 2 ? canopy : '#91a76d';
    ctx.beginPath();
    ctx.ellipse(x + W * 0.05, top + H * 0.07, W * 0.17, H * 0.13, 0, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.fillStyle = ground;
  ctx.fillRect(0, H * 0.77, W, H * 0.23);
  ctx.fillStyle = 'rgba(221,206,156,.4)';
  ctx.beginPath();
  ctx.moveTo(W * 0.36, H);
  ctx.quadraticCurveTo(W * 0.53, H * 0.85, W * 0.46, H * 0.74);
  ctx.lineTo(W * 0.57, H * 0.74);
  ctx.quadraticCurveTo(W * 0.57, H * 0.87, W * 0.7, H);
  ctx.fill();
  for (let i = 0; i < 13; i++) {
    const x = W * ((i * 0.193 + 0.07) % 0.9);
    const y = H * (0.24 + i % 5 * 0.095) + Math.sin(state.time * 0.8 + i) * 4;
    ctx.globalAlpha = 0.38 + (Math.sin(state.time * 1.8 + i * 1.7) + 1) * 0.24;
    ctx.fillStyle = i % 3 ? glow : '#f7e5ae';
    ctx.fillRect(Math.round(x), Math.round(y), 3, 3);
    ctx.fillRect(Math.round(x + 1), Math.round(y - 3), 1, 3);
  }
  ctx.globalAlpha = 1;
}
function drawAmberfallScene(area) {
  const [sky, canopy, deep, ground, glow] = area.palette;
  const sunset = ctx.createLinearGradient(0, 0, 0, H);
  sunset.addColorStop(0, sky);
  sunset.addColorStop(0.54, '#efc08a');
  sunset.addColorStop(1, '#8b6949');
  ctx.fillStyle = sunset;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(255,218,137,.34)';
  ctx.beginPath();
  ctx.arc(W * 0.76, H * 0.22, Math.max(30, W * 0.16), 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffe0a0';
  ctx.fillRect(W * 0.73, H * 0.19, W * 0.055, H * 0.025);
  ctx.fillStyle = '#a87755';
  ctx.beginPath();
  ctx.ellipse(W * 0.18, H * 0.58, W * 0.48, H * 0.17, 0, 0, Math.PI * 2);
  ctx.ellipse(W * 0.83, H * 0.59, W * 0.47, H * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#8d6548';
  ctx.fillRect(0, H * 0.59, W, H * 0.41);
  const trees = [0.03, 0.23, 0.48, 0.75, 0.98];
  trees.forEach((position, index) => {
    const x = W * position + Math.sin(state.time * 0.22 + index) * W * 0.002;
    const trunkWidth = Math.max(14, W * (index % 2 ? 0.055 : 0.075));
    const top = H * (index % 2 ? 0.16 : 0.1);
    ctx.fillStyle = index % 2 ? '#69463a' : '#573b32';
    ctx.fillRect(x - trunkWidth / 2, top, trunkWidth, H * 0.66);
    ctx.fillStyle = '#9a6744';
    ctx.fillRect(x - trunkWidth * 0.22, top + H * 0.07, trunkWidth * 0.16, H * 0.44);
    ctx.fillStyle = index % 2 ? canopy : '#c17a45';
    ctx.beginPath();
    ctx.ellipse(x, top + H * 0.045, W * 0.19, H * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = index % 2 ? '#d3944f' : deep;
    ctx.beginPath();
    ctx.ellipse(x + W * 0.045, top + H * 0.09, W * 0.13, H * 0.105, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e5aa5e';
    for (let leaf = 0; leaf < 4; leaf++) {
      const lx = x + W * ((leaf - 1.5) * 0.035);
      const ly = top + H * (0.04 + leaf % 2 * 0.08);
      ctx.fillRect(Math.round(lx), Math.round(ly), Math.max(3, W * 0.012), Math.max(3, W * 0.01));
    }
  });
  ctx.fillStyle = ground;
  ctx.beginPath();
  ctx.moveTo(0, H * 0.71);
  ctx.lineTo(W * 0.2, H * 0.68);
  ctx.lineTo(W * 0.45, H * 0.73);
  ctx.lineTo(W * 0.73, H * 0.67);
  ctx.lineTo(W, H * 0.71);
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(239,202,144,.36)';
  ctx.beginPath();
  ctx.moveTo(W * 0.37, H);
  ctx.quadraticCurveTo(W * 0.52, H * 0.86, W * 0.46, H * 0.7);
  ctx.lineTo(W * 0.56, H * 0.7);
  ctx.quadraticCurveTo(W * 0.55, H * 0.88, W * 0.7, H);
  ctx.closePath();
  ctx.fill();

  // A broad hollow trunk and its dark, welcoming opening give the clearing a landmark.
  const hollowX = W * 0.79;
  const hollowY = H * 0.62;
  ctx.fillStyle = '#533a32';
  ctx.fillRect(hollowX - W * 0.065, H * 0.32, W * 0.13, H * 0.4);
  ctx.fillStyle = '#9b6845';
  ctx.fillRect(hollowX - W * 0.042, H * 0.36, W * 0.014, H * 0.27);
  ctx.fillStyle = '#342b2b';
  ctx.beginPath();
  ctx.ellipse(hollowX + W * 0.008, hollowY - H * 0.035, W * 0.034, H * 0.067, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,190,93,.42)';
  ctx.fillRect(hollowX + W * 0.006, hollowY - H * 0.04, Math.max(3, W * 0.01), Math.max(4, H * 0.012));

  // Raised roots curl across the ground toward a small burrow entrance.
  ctx.strokeStyle = '#5b3c31';
  ctx.lineWidth = Math.max(5, W * 0.025);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(W * 0.78, H * 0.72);
  ctx.quadraticCurveTo(W * 0.7, H * 0.78, W * 0.62, H * 0.82);
  ctx.moveTo(W * 0.78, H * 0.72);
  ctx.quadraticCurveTo(W * 0.88, H * 0.79, W * 0.94, H * 0.84);
  ctx.moveTo(W * 0.24, H * 0.77);
  ctx.quadraticCurveTo(W * 0.18, H * 0.81, W * 0.1, H * 0.84);
  ctx.stroke();
  ctx.fillStyle = '#392c2b';
  ctx.beginPath();
  ctx.ellipse(W * 0.12, H * 0.84, W * 0.065, H * 0.033, 0, Math.PI, Math.PI * 2);
  ctx.fill();

  // Mushroom clusters frame the trail and make the damp groves readable at a glance.
  [[0.17, 0.86, 0.038], [0.31, 0.9, 0.026], [0.91, 0.88, 0.043]].forEach(([x, y, size], index) => {
    const capX = W * x;
    const baseY = H * y;
    const capWidth = W * size;
    ctx.fillStyle = '#f0d2a1';
    ctx.fillRect(capX - capWidth * 0.11, baseY, capWidth * 0.22, H * 0.045);
    ctx.fillStyle = index % 2 ? '#b85b3f' : '#d77943';
    ctx.fillRect(capX - capWidth * 0.5, baseY - H * 0.025, capWidth, H * 0.022);
    ctx.fillRect(capX - capWidth * 0.36, baseY - H * 0.041, capWidth * 0.72, H * 0.02);
    ctx.fillStyle = '#ffe0a0';
    ctx.fillRect(capX - capWidth * 0.2, baseY - H * 0.03, Math.max(2, capWidth * 0.1), Math.max(2, capWidth * 0.08));
  });

  // Slow falling leaves and soft lights animate the scene without changing its landmarks.
  for (let index = 0; index < 12; index++) {
    const drift = Math.sin(state.time * 0.55 + index * 1.8) * W * 0.018;
    const x = W * ((index * 0.173 + 0.06) % 0.9) + drift;
    const y = (H * (0.2 + index % 5 * 0.08) + state.time * (15 + index % 3 * 4)) % (H * 0.62);
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));
    ctx.rotate(Math.sin(state.time * 0.7 + index) * 0.6);
    ctx.fillStyle = index % 3 ? '#e5a34f' : '#c7643b';
    ctx.fillRect(-3, -1, 6, 3);
    ctx.fillRect(-1, -3, 3, 7);
    ctx.restore();
  }
  for (let index = 0; index < 6; index++) {
    const x = W * (0.16 + index * 0.137 % 0.7) + Math.sin(state.time + index) * 4;
    const y = H * (0.59 + index % 3 * 0.065);
    ctx.globalAlpha = 0.45 + (Math.sin(state.time * 2 + index) + 1) * 0.2;
    ctx.fillStyle = glow;
    ctx.fillRect(Math.round(x), Math.round(y), 3, 3);
  }
  ctx.globalAlpha = 1;
}
function drawUnknownScene(area) {
  const [sky, cloud, farStone, ground, glow] = area.palette;
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);
  ctx.save();
  ctx.strokeStyle = 'rgba(211,224,232,.44)';
  ctx.lineWidth = Math.max(5, W * 0.025);
  for (let band = 0; band < 3; band++) {
    ctx.globalAlpha = 0.2 + band * 0.08;
    ctx.beginPath();
    ctx.moveTo(-W * 0.1, H * (0.18 + band * 0.08));
    ctx.bezierCurveTo(W * 0.22, H * (0.07 + band * 0.07), W * 0.65, H * (0.34 + band * 0.04), W * 1.1, H * (0.16 + band * 0.07));
    ctx.stroke();
  }
  ctx.restore();
  drawCloud(W * 0.08, H * 0.31, W * 0.22, 'rgba(240,244,227,.44)');
  drawCloud(W * 0.64, H * 0.42, W * 0.2, 'rgba(240,244,227,.34)');
  const islands = [[0.15, 0.65, 0.23, 0.09], [0.55, 0.52, 0.28, 0.1], [0.87, 0.69, 0.24, 0.085]];
  islands.forEach(([cx, cy, width, height], index) => {
    const x = W * cx;
    const y = H * cy;
    const half = W * width / 2;
    ctx.fillStyle = farStone;
    ctx.beginPath();
    ctx.moveTo(x - half, y);
    ctx.lineTo(x - half * 0.68, y - H * height * 0.45);
    ctx.lineTo(x + half * 0.62, y - H * height * 0.5);
    ctx.lineTo(x + half, y);
    ctx.lineTo(x + half * 0.38, y + H * height * 0.75);
    ctx.lineTo(x - half * 0.27, y + H * height * 0.58);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = ground;
    ctx.fillRect(x - half * 0.64, y - H * height * 0.48, half * 1.25, H * height * 0.2);
    ctx.fillStyle = index % 2 ? '#a8c18a' : glow;
    ctx.fillRect(x - half * 0.28, y - H * height * 0.62, 5, 8);
    ctx.fillRect(x + half * 0.18, y - H * height * 0.58, 4, 6);
    ctx.fillStyle = '#f6e7b7';
    ctx.fillRect(x - 2, y - H * height * 0.88, 4, 4);
  });
  ctx.fillStyle = ground;
  ctx.beginPath();
  ctx.moveTo(0, H * 0.87);
  ctx.lineTo(W * 0.2, H * 0.76);
  ctx.lineTo(W * 0.47, H * 0.81);
  ctx.lineTo(W * 0.74, H * 0.73);
  ctx.lineTo(W, H * 0.82);
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fill();
}
function drawExpeditionAtmosphere(context, area) {
  const weatherId = context?.weatherId || 'clear';
  const timeId = context?.timeId || 'day';
  if (timeId === 'dusk') {
    ctx.fillStyle = 'rgba(129,76,92,.17)';
    ctx.fillRect(0, 0, W, H);
  } else if (timeId === 'night') {
    ctx.fillStyle = 'rgba(22,25,55,.24)';
    ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 16; i++) {
      const x = W * ((i * 0.173 + 0.06) % 0.92);
      const y = H * (0.09 + i % 6 * 0.07);
      ctx.globalAlpha = 0.28 + (Math.sin(state.time * 1.5 + i * 2) + 1) * 0.22;
      ctx.fillStyle = '#fff0cc';
      ctx.fillRect(x, y, 2, 2);
    }
    ctx.globalAlpha = 1;
  }
  if (weatherId === 'fog') {
    for (let band = 0; band < 4; band++) {
      const drift = Math.sin(state.time * 0.22 + band * 1.7) * W * 0.08;
      ctx.globalAlpha = 0.11 + band * 0.025;
      ctx.fillStyle = '#e3eadf';
      ctx.fillRect(-W * 0.15 + drift, H * (0.3 + band * 0.13), W * 1.3, H * 0.065);
    }
    ctx.globalAlpha = 1;
  }
  if (weatherId === 'rain' || weatherId === 'storm') {
    ctx.strokeStyle = 'rgba(205,229,231,.5)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 42; i++) {
      const x = (i * 67 + state.time * (weatherId === 'storm' ? 230 : 145)) % (W + 24) - 12;
      const y = (i * 97 + state.time * (weatherId === 'storm' ? 330 : 215)) % (H + 30) - 15;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 4, y + 10);
      ctx.stroke();
    }
  }
  if (weatherId === 'storm' && Math.sin(state.time * 0.71) > 0.97) {
    ctx.fillStyle = 'rgba(236,244,255,.19)';
    ctx.fillRect(0, 0, W, H);
  }
  const fireflyCount = Math.round((area.animation?.fireflies || 0) * 8);
  for (let i = 0; i < fireflyCount; i++) {
    const drift = Math.sin(state.time * (0.7 + i * 0.03) + i * 2.1) * W * 0.018;
    const x = W * ((i * 0.183 + 0.08) % 0.88) + drift;
    const y = H * (0.44 + i % 5 * 0.075) + Math.cos(state.time + i) * 5;
    ctx.globalAlpha = 0.36 + (Math.sin(state.time * 2 + i) + 1) * 0.26;
    ctx.fillStyle = timeId === 'night' ? '#f6e5a9' : '#fff0bf';
    ctx.fillRect(Math.round(x), Math.round(y), 3, 3);
    ctx.fillRect(Math.round(x + 1), Math.round(y - 2), 1, 2);
  }
  ctx.globalAlpha = 1;
}
function drawDestinationDepth(area) {
  const haze = ctx.createLinearGradient(0, H * 0.42, 0, H);
  haze.addColorStop(0, 'rgba(244,231,190,0)');
  haze.addColorStop(0.58, 'rgba(244,231,190,0.025)');
  haze.addColorStop(1, 'rgba(28,31,27,0.13)');
  ctx.fillStyle = haze;
  ctx.fillRect(0, 0, W, H);
  if (['meadow', 'bramblewood', 'amberfall-woods', 'whispering-canopy'].includes(area.id)) {
    const breeze = Math.max(0.15, Math.min(1, Number(area.animation?.breeze) || 0.4));
    ctx.strokeStyle = 'rgba(239,226,181,0.19)';
    ctx.lineWidth = Math.max(1, W * 0.002);
    for (let index = 0; index < 11; index++) {
      const x = W * ((index * 0.137 + 0.025) % 0.96);
      const y = H * (0.86 + index % 3 * 0.035);
      const sway = Math.sin(state.time * (0.65 + index % 3 * 0.09) + index * 1.7) * W * 0.009 * breeze;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + sway * 0.45, y - H * 0.014, x + sway, y - H * 0.032);
      ctx.stroke();
    }
  }
  if (area.animation?.crystalPulse) {
    const pulse = 0.14 + (Math.sin(state.time * 1.1) + 1) * 0.055;
    ctx.globalAlpha = pulse;
    ctx.fillStyle = '#d7fff1';
    for (let index = 0; index < 4; index++) {
      const x = W * (0.19 + index * 0.205);
      const y = H * (0.52 + index % 2 * 0.11);
      ctx.fillRect(Math.round(x), Math.round(y), 3, 3);
      ctx.fillRect(Math.round(x + 1), Math.round(y - 2), 1, 2);
    }
    ctx.globalAlpha = 1;
  }
}
function drawDestinationScene(area, context = null) {
  switch (area.id) {
    case 'bramblewood':
      drawWildwoodScene(area);
      break;
    case 'moonwell':
      drawCavernScene(area);
      break;
    case 'starlit-bog':
      drawGroveScene(area);
      break;
    case 'cloudstep-ruins':
      drawUnknownScene(area);
      break;
    case 'amberfall-woods':
      drawAmberfallScene(area);
      break;
    case 'whispering-canopy':
      drawCanopyScene(area);
      break;
    default:
      drawMeadowScene(area);
  }
  drawDestinationDepth(area);
  drawExpeditionAtmosphere(context, area);
}
function drawWindowTwinkle() {
  const centerX = W * 0.51;
  const centerY = H * 0.29;
  for (let i = 0; i < 6; i++) {
    const flicker = Math.sin(state.time * (1.1 + i * 0.17) + i * 4.2);
    const x = centerX + Math.sin(i * 8.4) * W * 0.08;
    const y = centerY + Math.cos(i * 3.2) * H * 0.045;
    ctx.globalAlpha = 0.22 + (flicker + 1) * 0.22;
    ctx.fillStyle = i % 2 ? '#d8f0d7' : '#ffe8ac';
    ctx.fillRect(Math.round(x), Math.round(y), 2, 2);
  }
  ctx.globalAlpha = 1;
  if (state.time < state.windowGlimmer) {
    const pulse = 0.5 + Math.sin(state.time * 8) * 0.5;
    ctx.globalAlpha = pulse;
    ctx.fillStyle = '#fff1bd';
    ctx.fillRect(Math.round(centerX + W * 0.034), Math.round(centerY - H * 0.028), 4, 4);
    ctx.fillRect(Math.round(centerX + W * 0.034), Math.round(centerY - H * 0.028) - 4, 4, 4);
    ctx.fillRect(Math.round(centerX + W * 0.034) - 4, Math.round(centerY - H * 0.028), 4, 4);
    ctx.globalAlpha = 1;
  }
}
function drawRoomCameraMatte() {
  const room = state.world.room;
  const wall = ROOM_WALL_STYLES.find(style => style.id === room.wallStyle) || ROOM_WALL_STYLES[0];
  const floor = ROOM_FLOOR_STYLES.find(style => style.id === room.floorStyle) || ROOM_FLOOR_STYLES[0];
  const camera = roomCamera();
  const floorTop = camera.offsetY + H * 0.625 * camera.zoom;
  ctx.fillStyle = wall.color;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = floor.color;
  ctx.fillRect(0, floorTop, W, H - floorTop);
  ctx.fillStyle = '#75533d';
  ctx.fillRect(0, floorTop - H * 0.016 * camera.zoom, W, H * 0.032 * camera.zoom);
  ctx.fillStyle = '#c29361';
  ctx.fillRect(0, floorTop - H * 0.015 * camera.zoom, W, H * 0.009 * camera.zoom);
}
function drawLegacyRoomBackdrop() {
  const room = state.world.room;
  const wall = ROOM_WALL_STYLES.find(style => style.id === room.wallStyle) || ROOM_WALL_STYLES[0];
  const floor = ROOM_FLOOR_STYLES.find(style => style.id === room.floorStyle) || ROOM_FLOOR_STYLES[0];
  const floorTop = H * 0.625;
  ctx.fillStyle = '#49352d';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#d8bd91';
  ctx.fillRect(0, 0, W, H * 0.13);
  const wallGradient = ctx.createLinearGradient(0, H * 0.13, 0, floorTop);
  wallGradient.addColorStop(0, wall.light);
  wallGradient.addColorStop(0.42, wall.color);
  wallGradient.addColorStop(1, wall.shade);
  ctx.fillStyle = wallGradient;
  ctx.fillRect(0, H * 0.13, W, floorTop - H * 0.13);
  ctx.fillStyle = wall.shade;
  ctx.fillRect(0, H * 0.13, W * 0.035, floorTop - H * 0.13);
  ctx.fillRect(W * 0.965, H * 0.13, W * 0.035, floorTop - H * 0.13);
  ctx.fillStyle = wall.light;
  ctx.fillRect(W * 0.035, H * 0.13, W * 0.93, Math.max(2, H * 0.009));
  ctx.fillStyle = 'rgba(255,239,195,.13)';
  for (let row = 0; row < 6; row++) {
    const y = H * (0.17 + row * 0.072);
    for (let column = 0; column < 9; column++) {
      const x = W * (0.045 + column * 0.117) + (row + column) % 2 * W * 0.035;
      if (x < W * 0.68 && y < H * 0.59) ctx.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(W * 0.006)), Math.max(1, Math.round(H * 0.004)));
    }
  }
  ctx.fillStyle = '#75533d';
  ctx.fillRect(0, floorTop - H * 0.016, W, H * 0.032);
  ctx.fillStyle = '#c29361';
  ctx.fillRect(0, floorTop - H * 0.015, W, H * 0.009);
  ctx.fillStyle = floor.color;
  ctx.fillRect(0, floorTop, W, H - floorTop);
  const plankCount = 9;
  ctx.strokeStyle = floor.shade;
  ctx.lineWidth = Math.max(1, W * 0.004);
  for (let index = 0; index <= plankCount; index++) {
    const topX = W * (index / plankCount);
    const bottomX = W * (index / plankCount);
    ctx.beginPath();
    ctx.moveTo(topX, floorTop);
    ctx.lineTo(bottomX + (index - 4) * W * 0.018, H);
    ctx.stroke();
  }
  ctx.strokeStyle = `${floor.detail}88`;
  ctx.lineWidth = Math.max(1, W * 0.003);
  for (let row = 1; row <= 5; row++) {
    const y = floorTop + Math.pow(row / 5, 1.7) * (H - floorTop);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
  if (floor.id === 'stone') {
    ctx.fillStyle = 'rgba(231,220,190,.11)';
    for (let row = 0; row < 5; row++) {
      for (let column = row % 2; column < 8; column += 2) {
        ctx.fillRect(W * (column / 8), floorTop + H * (0.035 + row * 0.064), W * 0.11, Math.max(1, H * 0.003));
      }
    }
  }
  const rugX = W * 0.48;
  const rugY = H * 0.765;
  ctx.fillStyle = floor.id === 'carpet' ? 'rgba(181,176,126,.62)' : 'rgba(104,70,62,.82)';
  ctx.fillRect(rugX, rugY, W * 0.32, H * 0.08);
  ctx.fillStyle = floor.id === 'carpet' ? 'rgba(215,211,159,.5)' : 'rgba(211,163,122,.7)';
  ctx.fillRect(rugX + W * 0.018, rugY + H * 0.012, W * 0.284, H * 0.054);
  ctx.strokeStyle = 'rgba(255,228,176,.37)';
  ctx.lineWidth = 1;
  ctx.strokeRect(rugX + W * 0.035, rugY + H * 0.021, W * 0.25, H * 0.035);
}
function roomArtLayout() {
  const portrait = H >= W;
  const image = portrait ? roomPortraitImage : roomLandscapeImage;
  const sourceWidth = image.naturalWidth || (portrait ? 576 : 1024);
  const sourceHeight = image.naturalHeight || (portrait ? 1024 : 576);
  const scale = Math.min(W / sourceWidth, H / sourceHeight);
  const width = sourceWidth * scale;
  const height = sourceHeight * scale;
  return {
    image,
    portrait,
    x: (W - width) / 2,
    y: (H - height) / 2,
    width,
    height
  };
}
function drawRoomBackdrop() {
  const layout = roomArtLayout();
  ctx.fillStyle = layout.portrait ? '#367573' : '#d9ceb8';
  ctx.fillRect(0, 0, W, H);
  if (layout.image.complete && layout.image.naturalWidth) {
    ctx.drawImage(layout.image, layout.x, layout.y, layout.width, layout.height);
  } else if (roomImage.complete && roomImage.naturalWidth) {
    drawCover(roomImage);
  }
}
function drawRoomWindow() {
  const cx = W * 0.81;
  const cy = H * 0.285;
  const rx = Math.min(W * 0.115, H * 0.057);
  const ry = rx * 0.9;
  const sway = Math.sin(state.time * 0.8) * 1.4;
  ctx.save();
  ctx.fillStyle = 'rgba(255,227,163,.13)';
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx * 1.65, ry * 1.55, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#49332c';
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx * 1.16, ry * 1.16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#563e35';
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx * 0.82, ry * 0.82, 0, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = '#193a43';
  ctx.fillRect(cx - rx, cy - ry, rx * 2, ry * 2);
  ctx.fillStyle = '#274b4e';
  ctx.fillRect(cx - rx * 0.85, cy + ry * 0.37, rx * 1.7, ry * 0.36);
  for (let index = 0; index < 8; index++) {
    const phase = state.time * (0.16 + index % 3 * 0.035) + index * 2.9;
    const starX = cx + Math.sin(phase) * rx * 0.65;
    const starY = cy + Math.cos(index * 2.17) * ry * 0.6;
    ctx.globalAlpha = 0.5 + Math.sin(state.time * 1.2 + index) * 0.22;
    ctx.fillStyle = index % 3 === 0 ? '#ffebb0' : '#c9e5d8';
    ctx.fillRect(Math.round(starX), Math.round(starY), Math.max(1, W * 0.006), Math.max(1, W * 0.006));
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#f2d590';
  ctx.beginPath();
  ctx.arc(cx + rx * 0.48, cy - ry * 0.42, rx * 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = '#b27b4e';
  ctx.lineWidth = Math.max(3, W * 0.018);
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = '#58372c';
  ctx.lineWidth = Math.max(2, W * 0.009);
  ctx.beginPath();
  ctx.moveTo(cx, cy - ry * 0.86);
  ctx.lineTo(cx, cy + ry * 0.86);
  ctx.stroke();
  ctx.fillStyle = '#c7925e';
  ctx.fillRect(cx - rx * 0.96, cy + ry * 0.88, rx * 1.92, Math.max(3, H * 0.009));
  ctx.fillStyle = '#9e6e49';
  ctx.save();
  ctx.translate(cx - rx * 1.15, cy - ry * 0.85);
  ctx.rotate(-0.045 + sway * 0.003);
  ctx.fillRect(-rx * 0.16, 0, rx * 0.32, ry * 1.7);
  ctx.fillRect(-rx * 0.06, 0, rx * 0.2, ry * 1.7);
  ctx.restore();
  ctx.save();
  ctx.translate(cx + rx * 1.15, cy - ry * 0.85);
  ctx.rotate(0.045 - sway * 0.003);
  ctx.fillRect(-rx * 0.16, 0, rx * 0.32, ry * 1.7);
  ctx.fillRect(-rx * 0.06, 0, rx * 0.2, ry * 1.7);
  ctx.restore();
  ctx.restore();
  if (state.time < state.windowGlimmer) {
    const pulse = 0.4 + (Math.sin(state.time * 7) + 1) * 0.25;
    ctx.globalAlpha = pulse;
    ctx.fillStyle = '#fff2bd';
    ctx.fillRect(cx + rx * 0.3, cy - ry * 0.32, 4, 4);
    ctx.fillRect(cx + rx * 0.3 - 3, cy - ry * 0.32 + 1, 2, 2);
    ctx.fillRect(cx + rx * 0.3 + 1, cy - ry * 0.32 - 3, 2, 2);
    ctx.globalAlpha = 1;
  }
}
function drawRoomFurnitureObject(objectId) {
  const p = Math.max(2, Math.min(5, Math.round(W / 92)));
  if (objectId === 'bed') {
    const x = W * 0.075;
    const y = H * 0.654;
    const width = W * 0.37;
    const height = H * 0.105;
    ctx.fillStyle = '#4c3028';
    ctx.fillRect(x, y + height * 0.72, width, height * 0.43);
    ctx.fillStyle = '#754931';
    ctx.fillRect(x + p, y + height * 0.79, p * 2, H * 0.065);
    ctx.fillRect(x + width - p * 3, y + height * 0.79, p * 2, H * 0.065);
    ctx.fillStyle = '#b37b4e';
    ctx.fillRect(x, y + height * 0.45, width, height * 0.36);
    ctx.fillStyle = '#f0ddbd';
    ctx.fillRect(x + p, y + height * 0.11, width - p * 2, height * 0.58);
    ctx.fillStyle = '#fff0d1';
    ctx.fillRect(x + p * 2, y + height * 0.15, width * 0.28, height * 0.24);
    ctx.fillStyle = '#c7a27a';
    ctx.fillRect(x + width * 0.42, y + height * 0.35, width * 0.56, height * 0.28);
    ctx.fillStyle = '#debd91';
    ctx.fillRect(x + width * 0.43, y + height * 0.35, width * 0.54, Math.max(2, height * 0.05));
    ctx.fillStyle = '#926047';
    ctx.fillRect(x + width * 0.45, y + height * 0.67, width * 0.12, p);
  } else if (objectId === 'desk') {
    const x = W * 0.78;
    const y = H * 0.685;
    const width = W * 0.18;
    ctx.fillStyle = '#53372b';
    ctx.fillRect(x + p, y + p * 2, width, p * 2);
    ctx.fillStyle = '#b4794b';
    ctx.fillRect(x, y, width + p * 2, p * 2);
    ctx.fillStyle = '#d5a16c';
    ctx.fillRect(x + p, y, width, p);
    ctx.fillStyle = '#69452f';
    ctx.fillRect(x + p * 2, y + p * 4, p * 2, H * 0.095);
    ctx.fillRect(x + width - p, y + p * 4, p * 2, H * 0.095);
    ctx.fillStyle = '#9bb184';
    ctx.fillRect(x + width * 0.18, y - p * 2, p * 3, p * 2);
    ctx.fillStyle = '#e5c17e';
    ctx.fillRect(x + width * 0.23, y - p * 3, p * 2, p);
  } else if (objectId === 'lamp') {
    const x = W * 0.87;
    const y = H * 0.665;
    const glow = 0.075 + (Math.sin(state.time * 2.1) + 1) * 0.018;
    ctx.fillStyle = `rgba(255,220,142,${glow})`;
    ctx.beginPath();
    ctx.arc(x, y - p * 2, W * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#55392b';
    ctx.fillRect(x - p, y - p * 5, p * 2, p * 5);
    ctx.fillStyle = '#f3cd83';
    ctx.fillRect(x - p * 3, y - p * 7, p * 6, p * 3);
    ctx.fillStyle = '#fff0bf';
    ctx.fillRect(x - p, y - p * 6, p * 2, p);
    ctx.fillStyle = '#8c6040';
    ctx.fillRect(x - p * 4, y, p * 8, p);
  } else if (objectId === 'plant') {
    const x = W * 0.94;
    const y = H * 0.737;
    const sway = Math.sin(state.time * 0.65) * 0.08;
    ctx.fillStyle = '#7a4832';
    ctx.fillRect(x - p * 4, y, p * 8, p * 5);
    ctx.fillStyle = '#b7784c';
    ctx.fillRect(x - p * 3, y + p, p * 6, p * 3);
    ctx.fillStyle = '#6e974f';
    ctx.save();
    ctx.translate(x, y + p);
    ctx.rotate(sway);
    ctx.fillRect(-p, -p * 9, p * 2, p * 9);
    ctx.fillRect(-p * 5, -p * 8, p * 5, p * 3);
    ctx.fillRect(p, -p * 10, p * 5, p * 3);
    ctx.fillRect(-p * 6, -p * 5, p * 5, p * 3);
    ctx.fillRect(p, -p * 6, p * 6, p * 3);
    ctx.fillStyle = '#abc67a';
    ctx.fillRect(-p * 4, -p * 7, p * 3, p);
    ctx.fillRect(p * 2, -p * 9, p * 3, p);
    ctx.restore();
  }
}
function drawRoomFurniture() {
  const objects = new Map(ROOM_FURNITURE_DEFINITIONS.map(object => [object.id, object]));
  for (const objectId of state.world.room.furniture) {
    const object = objects.get(objectId);
    if (object?.layer === 'furniture') drawRoomFurnitureObject(object.renderer);
  }
}
function drawRoomAmbient() {
  for (let index = 0; index < 6; index++) {
    const phase = state.time * (0.18 + index % 3 * 0.05) + index * 2.7;
    const x = W * (0.12 + index * 0.151 % 0.72) + Math.sin(phase) * W * 0.009;
    const y = H * (0.49 + index * 0.083 % 0.32) + Math.cos(phase * 0.75) * H * 0.012;
    ctx.globalAlpha = 0.12 + (Math.sin(phase * 1.4) + 1) * 0.08;
    ctx.fillStyle = index % 2 ? '#f3e3b7' : '#d6eccd';
    ctx.fillRect(Math.round(x), Math.round(y), Math.max(1, W * 0.006), Math.max(1, W * 0.006));
  }
  ctx.globalAlpha = 1;
}
function drawRoomScene() {
  drawRoomBackdrop();
  drawRoomAmbient();
}
function drawAvatar(x, bottom, height, avatar, time, labelShadow = true) {
  // A compact 22-by-26 chibi sprite keeps the avatar in the same chunky pixel world as the pets.
  const s = Math.max(2, Math.round(height / 26));
  const bodyChoice = avatar.body || 0;
  const bodyWidth = bodyChoice === 0 ? 15 : bodyChoice === 1 ? 12 : 14;
  const bodyLeft = Math.round((22 - bodyWidth) / 2);
  const skin = SKIN_COLORS[avatar.skin || 0];
  const skinLight = ['#ffe0b9', '#efbb7e', '#c58a65', '#87604c'][avatar.skin || 0];
  const hair = HAIR_COLORS[avatar.hairColor || 0];
  const hairLight = ['#805346', '#514653', '#f2c66e', '#b8768c'][avatar.hairColor || 0];
  const outfit = OUTFIT_COLORS[avatar.outfit || 0];
  const outfitLight = ['#8fa37d', '#d98986', '#8bb0c2', '#e9bf62'][avatar.outfit || 0];
  const eye = EYE_COLORS[avatar.eyes || 0];
  const hairStyle = avatar.hair || 0;
  const outfitStyle = avatar.outfit || 0;
  const bob = Math.sin(time * 2.7) * s * 0.3;
  ctx.save();
  ctx.translate(Math.round(x - 11 * s), Math.round(bottom - 26 * s + bob));
  if (labelShadow) {
    ctx.fillStyle = 'rgba(57,36,28,0.24)';
    ctx.beginPath();
    ctx.ellipse(11 * s, 26 * s, 8 * s, 1.1 * s, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  const px = (gx, gy, gw, gh, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(gx * s), Math.round(gy * s), Math.max(1, Math.round(gw * s)), Math.max(1, Math.round(gh * s)));
  };
  const ink = '#302831';

  // Stubby legs and shoes, with a warm highlight like the companion sprites.
  px(bodyLeft + 2, 21, 5, 4, ink);
  px(bodyLeft + bodyWidth - 7, 21, 5, 4, ink);
  px(bodyLeft + 3, 22, 3, 2, '#80604a');
  px(bodyLeft + bodyWidth - 6, 22, 3, 2, '#80604a');
  px(bodyLeft + 1, 24, 6, 2, ink);
  px(bodyLeft + bodyWidth - 7, 24, 6, 2, ink);
  px(bodyLeft + 2, 24, 3, 1, '#9a7656');
  px(bodyLeft + bodyWidth - 6, 24, 3, 1, '#9a7656');

  // Arms sit just behind a short, rounded outfit silhouette.
  px(bodyLeft - 2, 15, 4, 6, ink);
  px(bodyLeft + bodyWidth - 2, 15, 4, 6, ink);
  px(bodyLeft - 1, 16, 2, 4, outfit);
  px(bodyLeft + bodyWidth - 1, 16, 2, 4, outfit);
  px(bodyLeft - 1, 20, 2, 2, skin);
  px(bodyLeft + bodyWidth - 1, 20, 2, 2, skin);
  px(bodyLeft, 14, bodyWidth, 9, ink);
  px(bodyLeft + 1, 15, bodyWidth - 2, 7, outfit);
  px(bodyLeft + 2, 15, bodyWidth - 4, 2, outfitLight);
  if (outfitStyle === 0) {
    px(9, 16, 4, 5, '#c8b37d');
    px(10, 16, 2, 2, '#ead6a0');
  } else if (outfitStyle === 1) {
    px(9, 16, 4, 4, '#f1c3a2');
  } else if (outfitStyle === 2) {
    px(9, 16, 4, 4, '#cbe0de');
  } else {
    px(9, 16, 4, 4, '#f5d782');
  }
  // A tiny neck joins the larger, friendly face to the body.
  px(9, 12, 4, 4, ink);
  px(10, 12, 2, 3, skin);

  // Oversized stepped head and inset highlights echo the pets' rounded pixel silhouettes.
  px(5, 1, 12, 1, ink);
  px(3, 2, 16, 2, ink);
  px(2, 4, 18, 7, ink);
  px(3, 11, 16, 3, ink);
  px(5, 14, 12, 1, ink);
  px(5, 2, 12, 1, skinLight);
  px(4, 3, 14, 1, skin);
  px(3, 4, 16, 6, skin);
  px(4, 10, 14, 3, skin);
  px(6, 13, 10, 1, skinLight);
  px(3, 6, 1, 3, skinLight);
  px(18, 6, 1, 3, skinLight);

  // Hair shapes retain all selected styles while adding a soft, shaded pixel fringe.
  px(4, 1, 14, 3, ink);
  px(5, 1, 12, 2, hair);
  px(6, 1, 7, 1, hairLight);
  if (hairStyle === 0) {
    px(4, 3, 3, 2, hair);
    px(15, 3, 3, 2, hair);
    px(8, 3, 6, 2, hair);
  } else if (hairStyle === 1) {
    px(3, 2, 3, 5, hair);
    px(16, 2, 3, 5, hair);
    px(6, 3, 4, 2, hairLight);
    px(10, 4, 5, 2, hair);
  } else if (hairStyle === 2) {
    px(3, 1, 4, 3, hair);
    px(7, 0, 4, 3, hairLight);
    px(11, 1, 4, 3, hair);
    px(15, 1, 4, 3, hairLight);
    px(4, 3, 3, 3, hair);
    px(15, 3, 3, 3, hair);
  } else {
    px(3, 3, 3, 11, ink);
    px(16, 3, 3, 11, ink);
    px(4, 4, 2, 9, hair);
    px(16, 4, 2, 9, hair);
    px(7, 3, 8, 2, hair);
  }
  // Bright, oversized eyes, rosy cheeks and a small, kind smile.
  px(7, 7, 3, 4, ink);
  px(13, 7, 3, 4, ink);
  px(8, 8, 2, 2, eye);
  px(14, 8, 2, 2, eye);
  px(8, 7, 1, 1, '#fff1d6');
  px(14, 7, 1, 1, '#fff1d6');
  px(5, 11, 2, 1, '#e49b89');
  px(15, 11, 2, 1, '#e49b89');
  px(10, 11, 2, 1, '#9b5f58');
  px(11, 12, 1, 1, '#9b5f58');

  // One familiar accessory, drawn with the same chunky highlight treatment.
  switch (avatar.accessory || 0) {
    case 0:
      px(15, 3, 3, 2, '#709356');
      px(16, 2, 2, 2, '#a8c777');
      px(17, 2, 1, 2, '#d1dc9a');
      break;
    case 1:
      px(6, 7, 5, 1, '#d5b77b');
      px(6, 7, 1, 4, '#d5b77b');
      px(10, 7, 1, 4, '#d5b77b');
      px(11, 8, 2, 1, '#d5b77b');
      px(12, 7, 5, 1, '#d5b77b');
      px(12, 7, 1, 4, '#d5b77b');
      px(16, 7, 1, 4, '#d5b77b');
      break;
    case 2:
      px(4, 1, 14, 2, '#704457');
      px(7, 0, 8, 1, '#bd7180');
      px(6, 2, 10, 1, '#965c70');
      break;
  }
  ctx.restore();
}
function drawEvolutionPixelStar(x, y, size, color, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x - size), Math.round(y - size * 0.35), size * 2, size * 0.7);
  ctx.fillRect(Math.round(x - size * 0.35), Math.round(y - size), size * 0.7, size * 2);
  ctx.fillRect(Math.round(x - size * 0.55), Math.round(y - size * 0.55), size * 1.1, size * 1.1);
  ctx.restore();
}
function drawCompanionCinematicEffect(pet, position) {
  const active = state.cinematic;
  if (!active || !pet || !position) return;
  const elapsed = Math.max(0, state.time - active.startedAt);
  const pulse = 0.72 + Math.sin(elapsed * 2.5) * 0.12;
  const image = companionArtifactImages[active.milestone.id];
  const sprite = petImages[pet.id];
  const ratio = sprite?.naturalWidth && sprite?.naturalHeight ? sprite.naturalWidth / sprite.naturalHeight : 1;
  const height = Math.min(H * 0.205, W * 0.38, W * 0.43 / ratio) * petRenderScale();
  const width = height * ratio;
  const x = position.x;
  const y = position.bottom - height * 0.5;
  const artifactHeight = Math.max(22, Math.min(H * 0.13, width * 0.42));
  const drawArtifact = (art, atX, atY, size = artifactHeight, alpha = 1, rotation = 0) => {
    if (!art?.complete || !art.naturalWidth || !art.naturalHeight) return;
    const artWidth = size * art.naturalWidth / art.naturalHeight;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(atX, atY);
    ctx.rotate(rotation);
    ctx.drawImage(art, -artWidth / 2, -size / 2, artWidth, size);
    ctx.restore();
  };
  ctx.save();
  ctx.lineCap = 'round';
  if (active.milestone.beat === 'compass') {
    const angle = elapsed * 0.72;
    ctx.strokeStyle = `rgba(255,226,155,${pulse})`;
    ctx.lineWidth = Math.max(1, width * 0.012);
    ctx.beginPath();
    ctx.ellipse(x, y, width * 0.62, height * 0.48, angle * 0.16, 0, Math.PI * 2);
    ctx.stroke();
    ctx.save();
    ctx.translate(x + Math.cos(angle) * width * 0.62, y + Math.sin(angle) * height * 0.48);
    ctx.rotate(angle);
    ctx.fillStyle = '#fff0b5';
    ctx.beginPath();
    ctx.moveTo(0, -width * 0.055);
    ctx.lineTo(width * 0.035, 0);
    ctx.lineTo(0, width * 0.055);
    ctx.lineTo(-width * 0.035, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    drawArtifact(image, x + width * 0.43, y - height * 0.55 - Math.sin(elapsed * 2) * 4, artifactHeight * 0.78, pulse, angle * 0.15);
  } else if (active.milestone.beat === 'cauldron') {
    ctx.strokeStyle = `rgba(123,220,190,${pulse * 0.78})`;
    ctx.lineWidth = Math.max(1, width * 0.014);
    ctx.beginPath();
    ctx.ellipse(x, y + height * 0.04, width * 0.55, height * 0.34, 0, Math.PI * 0.12, Math.PI * 0.88);
    ctx.stroke();
    for (let index = 0; index < 4; index++) {
      const drift = (elapsed * (12 + index * 3) + index * height * 0.23) % (height * 0.88);
      const bubbleX = x + Math.sin(elapsed * 1.1 + index * 1.8) * width * 0.38;
      const bubbleY = y + height * 0.3 - drift;
      ctx.globalAlpha = 0.68 * (1 - drift / (height * 0.88));
      ctx.fillStyle = index % 2 ? '#d9f6c0' : '#8de0c1';
      ctx.beginPath();
      ctx.arc(bubbleX, bubbleY, Math.max(2, width * (0.018 + index * 0.003)), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    drawArtifact(image, x - width * 0.47, y - height * 0.43 - Math.sin(elapsed * 1.7) * 3, artifactHeight * 0.8, pulse, Math.sin(elapsed) * 0.08);
  } else if (active.milestone.beat === 'lantern') {
    const lanternX = x + width * 0.48;
    const lanternY = y - height * 0.32 - Math.sin(elapsed * 1.4) * 5;
    const glow = ctx.createRadialGradient(lanternX, lanternY, 1, lanternX, lanternY, width * 0.58);
    glow.addColorStop(0, 'rgba(207,222,255,.36)');
    glow.addColorStop(1, 'rgba(168,190,255,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(lanternX, lanternY, width * 0.58, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `rgba(222,233,255,${pulse * 0.72})`;
    ctx.lineWidth = Math.max(1, width * 0.012);
    ctx.beginPath();
    ctx.moveTo(lanternX, lanternY + artifactHeight * 0.27);
    ctx.lineTo(lanternX - width * 0.32, y + height * 0.1);
    ctx.lineTo(lanternX + width * 0.25, y + height * 0.28);
    ctx.stroke();
    drawArtifact(image, lanternX, lanternY, artifactHeight * 1.12, 0.95, Math.sin(elapsed * 1.2) * 0.035);
    drawEvolutionPixelStar(lanternX - width * 0.52, y - height * 0.4, Math.max(2, width * 0.022), '#e8ecff', pulse);
  } else if (active.milestone.beat === 'relic') {
    const rotation = elapsed * 0.32;
    ctx.strokeStyle = `rgba(185,213,147,${pulse * 0.72})`;
    ctx.lineWidth = Math.max(1, width * 0.012);
    ctx.setLineDash([width * 0.04, width * 0.06]);
    ctx.beginPath();
    ctx.ellipse(x, y, width * 0.72, height * 0.47, rotation, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    for (let index = 0; index < 6; index++) {
      const angle = rotation + index * Math.PI / 3;
      const leafX = x + Math.cos(angle) * width * 0.72;
      const leafY = y + Math.sin(angle) * height * 0.47;
      ctx.save();
      ctx.translate(leafX, leafY);
      ctx.rotate(angle);
      ctx.fillStyle = index % 2 ? '#c6d99b' : '#f1d68d';
      ctx.fillRect(-width * 0.026, -width * 0.009, width * 0.052, width * 0.018);
      ctx.fillRect(-width * 0.007, -width * 0.028, width * 0.014, width * 0.056);
      ctx.restore();
    }
    drawArtifact(image, x - width * 0.48, y - height * 0.44 - Math.sin(elapsed * 1.5) * 4, artifactHeight * 0.84, pulse, -rotation * 0.22);
  } else if (active.milestone.beat === 'finale') {
    const radiusX = width * 0.79;
    const radiusY = height * 0.58;
    for (let index = 0; index < COMPANION_MILESTONES.length; index++) {
      const artifact = companionArtifactImages[COMPANION_MILESTONES[index].id];
      const angle = elapsed * 0.22 + index * Math.PI * 2 / COMPANION_MILESTONES.length - Math.PI / 2;
      const scale = 0.78 + 0.22 * (0.5 + Math.sin(elapsed * 1.5 + index) * 0.5);
      const atX = x + Math.cos(angle) * radiusX;
      const atY = y + Math.sin(angle) * radiusY;
      drawArtifact(artifact, atX, atY, artifactHeight * scale, 0.94, Math.sin(elapsed + index) * 0.045);
      drawEvolutionPixelStar(atX, atY - artifactHeight * 0.42, Math.max(2, width * 0.018), index % 2 ? '#d8e9ae' : '#ffe6a0', pulse);
    }
    ctx.strokeStyle = `rgba(255,229,166,${pulse * 0.72})`;
    ctx.lineWidth = Math.max(1, width * 0.013);
    ctx.beginPath();
    ctx.ellipse(x, y, radiusX * 0.78, radiusY * 0.77, -elapsed * 0.1, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}
function drawPet(pet, position) {
  const image = petImages[pet.id];
  if (!image?.complete || !image.naturalWidth) return;
  const maxHeight = Math.min(H * 0.205, W * 0.38);
  const ratio = image.naturalWidth / image.naturalHeight;
  const height = Math.min(maxHeight, W * 0.43 / ratio) * petRenderScale();
  const width = height * ratio;
  const activity = state.time % 31;
  const homePhase = ['pet-intro', 'window-moment', 'explore', 'reward-reveal', 'basecamp', 'phone'].includes(state.phase);
  const sleeping = activity > 14.5 && activity < 18.2 && homePhase || activity > 12.5 && activity < 15 && state.phase === 'explore';
  const playing = activity > 7.3 && activity < 9.4 && homePhase;
  const reaction = Math.max(0, state.reactionUntil - state.time);
  const hop = playing ? Math.abs(Math.sin((activity - 6) * 3.4)) * H * 0.022 : reaction > 0 ? Math.sin((1.5 - reaction) * 12) * H * 0.014 : 0;
  const breath = 1 + Math.sin(state.time * 2.4) * 0.018;
  const tilt = playing ? Math.sin(state.time * 7) * 0.045 : 0;
  const cinematicElapsed = state.cinematic ? Math.max(0, state.time - state.cinematic.startedAt) : 0;
  const cinematicLift = state.cinematic ? state.cinematic.milestone.level === 50 ? height * 0.19 * Math.min(1, cinematicElapsed / 8, Math.max(0, (state.cinematic.duration - cinematicElapsed) / 5)) : height * 0.075 * Math.sin(Math.min(1, cinematicElapsed / state.cinematic.duration) * Math.PI) : 0;
  const centerY = position.bottom - height / 2 - hop - cinematicLift;
  ctx.fillStyle = 'rgba(36,25,22,0.26)';
  ctx.beginPath();
  ctx.ellipse(position.x, position.bottom - 2, width * 0.34, Math.max(4, height * 0.065), 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.save();
  ctx.translate(Math.round(position.x), Math.round(centerY));
  ctx.rotate(tilt);
  ctx.scale(1, breath);
  ctx.drawImage(image, -width / 2, -height / 2, width, height);
  ctx.restore();
  if (sleeping) {
    ctx.fillStyle = '#fff0c7';
    ctx.font = `bold ${Math.max(14, Math.round(H * 0.022))}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('z  Z', position.x + width * 0.38, centerY - height * 0.34 - Math.sin(state.time * 2) * 4);
  }
  if (state.phase === 'window-moment') drawWindowHint(position, centerY);
  return {
    x: position.x,
    centerY,
    width,
    height
  };
}
function drawWindowHint(position, centerY) {
  const layout = roomArtLayout();
  const windowX = layout.x + layout.width * (layout.portrait ? 0.76 : 0.57);
  const windowY = layout.y + layout.height * (layout.portrait ? 0.39 : 0.28);
  const progress = 0.5 + Math.sin(state.time * 2) * 0.12;
  ctx.fillStyle = 'rgba(255,228,165,0.48)';
  for (let i = 1; i < 8; i++) {
    const t = i / 9;
    const x = position.x + (windowX - position.x) * t;
    const y = centerY - H * 0.16 * t - 7;
    if ((i + Math.floor(state.time * 2)) % 2 === 0) ctx.fillRect(Math.round(x), Math.round(y), 3, 3);
  }
  const arrowX = position.x + (windowX - position.x) * progress * 0.28;
  const arrowY = centerY - H * 0.12;
  ctx.fillStyle = '#ffe2a1';
  ctx.fillRect(Math.round(arrowX), Math.round(arrowY), 4, 13);
  ctx.fillRect(Math.round(arrowX - 4), Math.round(arrowY + 3), 4, 4);
  ctx.fillRect(Math.round(arrowX + 4), Math.round(arrowY + 3), 4, 4);
}
function drawPixelHeart(x, y, size, alpha) {
  const pattern = ['0110110', '1111111', '1111111', '0111110', '0011100', '0001000'];
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
  ctx.fillStyle = '#f17b88';
  pattern.forEach((row, rowIndex) => {
    [...row].forEach((pixel, columnIndex) => {
      if (pixel === '1') ctx.fillRect(Math.round(x + (columnIndex - 3) * size), Math.round(y + rowIndex * size), size, size);
    });
  });
  ctx.globalAlpha = 1;
}
function drawParticles(dt) {
  state.sparkles = state.sparkles.filter(sparkle => {
    sparkle.life -= dt;
    sparkle.x += sparkle.vx * dt;
    sparkle.y += sparkle.vy * dt;
    sparkle.vy += 25 * dt;
    if (sparkle.life <= 0) return false;
    ctx.globalAlpha = Math.min(1, sparkle.life);
    ctx.fillStyle = '#fff0b2';
    ctx.fillRect(Math.round(sparkle.x), Math.round(sparkle.y), sparkle.size, sparkle.size);
    ctx.globalAlpha = 1;
    return true;
  });
  state.hearts = state.hearts.filter(heart => {
    heart.life -= dt;
    heart.y += heart.vy * dt;
    if (heart.life <= 0) return false;
    drawPixelHeart(heart.x, heart.y, heart.size, heart.life / heart.maxLife);
    return true;
  });
}
function spawnHeart() {
  const position = petPosition();
  const height = Math.min(H * 0.205, W * 0.38) * petRenderScale();
  const point = ROOM_SCENE_PHASES.includes(state.phase) ? roomCameraPoint(position.x + (Math.random() - 0.5) * height * 0.6, position.bottom - height * 0.88) : {
    x: position.x + (Math.random() - 0.5) * height * 0.6,
    y: position.bottom - height * 0.88
  };
  state.hearts.push({
    x: point.x,
    y: point.y,
    vy: -28 - Math.random() * 38,
    life: 1.5,
    maxLife: 1.5,
    size: Math.max(2, Math.round(W / 150))
  });
}
function drawAvatarPreview() {
  if (state.phase !== 'creation' && state.phase !== 'player-name') return;
  const x = W * 0.5;
  const bottom = H * 0.48;
  const size = Math.min(H * 0.185, W * 0.42);
  ctx.fillStyle = 'rgba(250,218,157,0.24)';
  ctx.beginPath();
  ctx.ellipse(x, bottom - size * 0.015, size * 0.43, size * 0.095, 0, 0, Math.PI * 2);
  ctx.fill();
  drawAvatar(x, bottom, size, state.avatar, state.time, false);
}
function drawTitleMagic() {
  for (let i = 0; i < 9; i++) {
    const phase = state.time * (0.25 + i % 3 * 0.08) + i * 3.1;
    const x = W * (0.15 + i * 0.217 % 0.72) + Math.sin(phase) * 5;
    const y = H * (0.22 + i * 0.137 % 0.42) + Math.cos(phase * 0.8) * 6;
    ctx.globalAlpha = 0.24 + (Math.sin(phase * 2) + 1) * 0.2;
    ctx.fillStyle = i % 2 ? '#fff0c8' : '#d9eccd';
    ctx.fillRect(Math.round(x), Math.round(y), 3, 3);
  }
  ctx.globalAlpha = 1;
}
function drawWorld(dt) {
  const meadowPhases = ['destination', 'meadow'];
  if (meadowPhases.includes(state.phase)) {
    const areaId = state.phase === 'meadow' ? state.world.activeExpeditionAreaId : state.world.activeAreaId;
    const area = AREA_CATALOG.find(entry => entry.id === areaId) || AREA_CATALOG[0];
    const context = state.phase === 'meadow' ? state.world.activeExpeditionData : null;
    drawDestinationScene(area, context);
  } else if (ROOM_SCENE_PHASES.includes(state.phase)) drawRoomCameraMatte();else drawCover(roomImage);
  if (!meadowPhases.includes(state.phase)) {
    const shade = state.phase === 'title' || state.phase === 'restart-confirm' ? 'rgba(36,26,36,0.25)' : ['creation', 'player-name', 'pet-select'].includes(state.phase) ? 'rgba(45,30,22,0.17)' : 'rgba(61,35,19,0.025)';
    ctx.fillStyle = shade;
    ctx.fillRect(0, 0, W, H);
    drawWindowTwinkle();
  }
  if (state.phase === 'title' || state.phase === 'restart-confirm') drawTitleMagic();
  if (ROOM_SCENE_PHASES.includes(state.phase)) {
    const camera = roomCamera();
    ctx.save();
    ctx.translate(camera.offsetX, camera.offsetY);
    ctx.scale(camera.zoom, camera.zoom);
    drawRoomScene();
    const pet = currentPet();
    if (pet) {
      const position = petPosition();
      if (state.cinematic) drawCompanionCinematicEffect(pet, position);
      drawPet(pet, position);
    }
    ctx.restore();
  } else if (!meadowPhases.includes(state.phase)) {
    drawAvatarPreview();
  }
  if (meadowPhases.includes(state.phase)) {
    const pet = currentPet();
    if (pet) drawPet(pet, petPosition());
  }
  drawParticles(dt);
}
let lastFrame = performance.now();
function frame(now) {
  const paused = Boolean(state.overlay && state.overlay !== 'cinematic' || state.profileDialog && !state.cinematic || state.world.pendingOfflineReward);
  const dt = paused ? 0 : Math.min(0.05, Math.max(0, (now - lastFrame) / 1000));
  lastFrame = now;
  state.time += dt;
  if (!paused && !state.cinematic && state.petId && !OPENING_PHASES.has(state.phase)) {
    const dialogueUpdate = petDialogueManager.update(state.world, dt, petDialogueContext(), Date.now());
    if (dialogueUpdate.started || dialogueUpdate.finished) {
      persist();
      renderUI();
    }
  }
  drawWorld(dt);
  if (state.roomFeedback && state.time >= state.roomFeedbackUntil) {
    state.roomFeedback = '';
    state.roomFeedbackUntil = 0;
    renderUI();
  }
  if (state.craftAnimation && state.time >= state.craftAnimation.until) {
    state.craftAnimation = null;
    if (state.phase === 'phone' && state.world.phoneSection === 'crafting') renderUI();
  }
  const systemNow = Date.now();
  if (systemNow - state.lastSystemTickAt >= 1000) {
    state.lastSystemTickAt = systemNow;
    const ticketsBeforeRefresh = state.world.tickets;
    const ticketDayBefore = state.world.activeTicketDay;
    const objectiveDayBefore = state.world.objectiveDayKey;
    const shopRotationChanged = state.phase === 'phone' && state.world.phoneSection === 'shop' ? ensureRoomShopRotation(state.world, systemNow) : false;
    refreshTickets();
    const objectivesEnabled = state.petId && !OPENING_PHASES.has(state.phase);
    const objectivesChanged = objectivesEnabled ? objectiveManager.refresh(state.world, objectiveContext(), systemNow) : false;
    const dailyChanged = ticketDayBefore !== state.world.activeTicketDay || objectivesEnabled && objectiveDayBefore !== state.world.objectiveDayKey;
    if (state.world.tickets !== ticketsBeforeRefresh || dailyChanged || objectivesChanged || shopRotationChanged) {
      persist();
      renderUI();
    } else {
      updateLiveTimers();
    }
  }
  if (state.phase === 'room-reveal' && state.time - state.revealAt >= 2.25) {
    if (transitionOpening('pet-intro')) {
      persist();
      renderUI();
    }
  } else if (state.phase === 'departing' && state.time - state.phaseAt >= 1.05) {
    state.phase = 'meadow';
    state.phaseAt = state.time;
    persist();
    renderUI();
  } else if (state.phase === 'meadow' && state.time - state.phaseAt >= 1.65) {
    state.phase = 'returning';
    state.phaseAt = state.time;
    persist();
    renderUI();
  } else if (state.phase === 'returning' && state.time - state.phaseAt >= 1.1) {
    state.phase = 'reward-reveal';
    state.phaseAt = state.time;
    state.world.revealIndex = 0;
    persist();
    renderUI();
  }
  advanceAutoExplore();
  if (state.cinematic && state.time - state.cinematic.startedAt >= state.cinematic.duration) {
    finishCompanionCinematic();
  }
  if (!state.cinematic) startNextCompanionCinematicIfSafe();
  requestAnimationFrame(frame);
}
canvas.addEventListener('pointerdown', event => {
  const pet = currentPet();
  if (!pet || !['room-reveal', 'pet-intro', 'window-moment', 'explore', 'destination', 'meadow', 'reward-reveal', 'basecamp', 'phone'].includes(state.phase)) return;
  const position = petPosition();
  const image = petImages[pet.id];
  const naturalRatio = image?.naturalWidth && image?.naturalHeight ? image.naturalWidth / image.naturalHeight : 1;
  const height = Math.min(H * 0.205, W * 0.38, W * 0.43 / naturalRatio) * petRenderScale();
  const camera = ROOM_SCENE_PHASES.includes(state.phase) ? roomCamera() : null;
  const center = camera ? roomCameraPoint(position.x, position.bottom - height / 2, camera) : {
    x: position.x,
    y: position.bottom - height / 2
  };
  const tapRadius = Math.max(height * (camera ? camera.zoom : 1) * 0.58, 44);
  if (Math.hypot(event.clientX - center.x, event.clientY - center.y) < tapRadius) {
    unlockSound();
    petDialogueManager.noteActivity(state.world);
    const dialogueTriggered = !OPENING_PHASES.has(state.phase) && !state.overlay && !state.world.pendingOfflineReward && triggerPetDialogue('petTap');
    if (state.phase === 'basecamp') {
      if (autoExploreActive) {
        setRoomFeedback('Your companion is resting between automatic outings.');
        if (dialogueTriggered) persist();
        renderUI();
        return;
      }
      refreshTickets();
      if (state.world.tickets > 0) {
        if (areasAwaitingTrailChoice().length > 0) {
          state.phase = 'destination';
          persist();
          renderUI();
        } else {
          beginExpedition({
            fromBasecamp: true
          });
        }
        return;
      }
      const nextTicket = ticketManager.nextTicketAt(state.world, Date.now());
      const wait = nextTicket ? ` The next one is about ${formatCountdown(nextTicket - Date.now())} away.` : '';
      setRoomFeedback(`${currentPet()?.name || 'Your friend'} is happy to stay close while a ticket grows.${wait}`);
      if (dialogueTriggered) persist();
      renderUI();
      return;
    }
    state.reactionUntil = state.time + 1.4;
    spawnHeart();
    playPetInteractionSound();
    if (dialogueTriggered) {
      persist();
      renderUI();
    }
  }
});
async function bootPocketwild() {
  ui.innerHTML = '<div class="opening-loader" role="status">Opening your little world…</div>';
  requestAnimationFrame(frame);
  const restored = await playerSaveManager.initialize();
  if (restored.error) accountNotice = restored.error;
  if (restored.user?.email) accountEmail = restored.user.email;
  applyAccountSave(restored.save);
  if (restored.pending) {
    accountView = 'conflict';
    accountEmail = restored.user?.email || playerSaveManager.getStatus().pendingUser?.email || '';
    state.overlay = 'account';
  } else {
    accountView = 'home';
    state.overlay = null;
  }
  renderUI();
}
bootPocketwild().catch(error => {
  accountNotice = authMessage(error);
  applyAccountSave(readSave());
  state.overlay = null;
  renderUI();
});