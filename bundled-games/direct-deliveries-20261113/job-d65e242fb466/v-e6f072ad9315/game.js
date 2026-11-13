// =====================================================================
//  HOW YOU HAUNT ME // Look At This Polaroid
//  A five-photo Halloween horror action game (Three.js), 3D asset edition.
//
//  Rosebud / porting notes:
//   * All game code (logic, UI, CSS, sound effects, renderer, GLB loader)
//     lives in this one file. It imports 'three' (core build, no addons) and
//     ./sirfallsalot.js: Sir Falls-A-Lot: Halloween Edition, the arcade machine
//     in the bedroom (a game of its own, played on the cabinet: Arcade).
//   * Art lives in assets/:
//       assets/models/*.glb    characters (skinned + animated), props, items, the arcade cabinet
//       assets/textures/       PBR surface textures (jpg, a few png) for walls, floors, rugs, exterior
//       assets/*.mp3           music
//     After uploading them to Rosebud, replace the paths in ASSETS below with
//     the Rosebud asset URLs (or set window.HYHM_ASSET_URL, see assetURL()).
//     Models load as .glb or as .gltf JSON. Every model has a procedural fallback, so a
//     missing file never breaks the game.
//   * Loading: the models' geometry is compressed (EXT_meshopt_compression: about a third
//     of the size). The decoder is built into this file (meshoptWasm / meshoptJS), so a
//     model viewer without it may not open the .glb files, the game does. The house, the
//     player and the items load first; the haunts, the bosses and their helpers load while
//     the title is up (Assets.LATER), and New Game waits for them if it has to. Where the
//     browser compiles shaders in parallel, the house's shaders compile at once (compileHouse).
//     The DEVELOPING counter follows the whole start (LoadMeter): the downloads by their bytes
//     (ASSET_BYTES lists the files' sizes; update it if you swap a file, or leave it, the counter
//     then just runs a little less evenly), then the GPU, the house, its shaders and the first
//     frame. It shows 100 % only when CLICK TO ENTER appears.
//   * Graphics quality (Options) also picks the texture detail at load time:
//     High = full size, Medium = half, Low = quarter (for low memory machines).
//   * Ammo: the number on a weapon slot is every round you carry for it, loaded and spare.
//     The bar under it is what's loaded (a strip of 30 nails; the shotgun is a double
//     barrel, two shells), orange while it reloads. An empty gun reloads by itself when
//     there's ammo for it (Player.autoReload).
//   * Controls: WASD move, mouse aim, LMB attack, Space dodge, 1-4 / wheel
//     weapons, R reload, E interact, F look at the photo, Esc pause.
//     E at the arcade machine in the bedroom plays Sir Falls-A-Lot (Esc on its title
//     or the x leaves it; the house waits, no time passes in it meanwhile).
//   * Fullscreen: the title screen and the pause menu have a Fullscreen item (FS). On a
//     site like itch.io the game runs in a frame on the page, and the browser's own full
//     screen (F11) only enlarges the window around it. Where the browser can't go
//     fullscreen (iPhone Safari, a frame that doesn't allow it) the item isn't shown.
//   * Testing the ending: on the title screen, click HEADPHONES RECOMMENDED ten times
//     in a row. The game jumps to the basement right after the last boss. The ending
//     then goes up the hall stairs to the attic (W.buildAttic, Game.seqUpstairs).
// =====================================================================
import * as THREE from './_remote/c6e31e20c7338f4f/three.module.min.js';
// the arcade game is optional: loaded on the side, so a missing ./sirfallsalot.js never stops the house from loading
let createSirFallsArcade = null;
import("./sirfallsalot.js")
  .then((m) => { createSirFallsArcade = m.createSirFallsArcade || null; })
  .catch((e) => console.warn('[arcade] sirfallsalot.js unavailable, the cabinet stays off:', e && e.message));

const ASSETS = {
  music: {
    title: 'assets/music_title.mp3',
    explore: 'assets/music_explore.mp3',
    fight: 'assets/music_fight.mp3',
    boss: 'assets/music_boss.mp3',
  },
  effects: {
    woodStep: 'assets/audio/wood-floor-footstep.mp3',
    shotgun: 'assets/audio/shotgun-test-02-metallic-pump.mp3',
    pokerSwing: 'assets/audio/poker-swing.mp3',
    pokerHit: 'assets/audio/poker-impact.mp3',
    pokerWall: 'assets/audio/poker-hit-wall.mp3',
    pokerWood: 'assets/audio/poker-hit-wood.mp3',
    pokerStone: 'assets/audio/poker-hit-stone.mp3',
    pokerObject: 'assets/audio/poker-hit-object-soft.mp3',
    reload: 'assets/audio/shotgun-test-07-gritty-rattle.mp3',
    explode: 'assets/audio/shotgun-test-09-cinematic-bass.mp3',
    enemyStep: 'assets/audio/haunt-footstep-single.mp3',
    enemyScream: 'assets/audio/haunt-scream.mp3',
    enemyGrowl: 'assets/audio/haunt-growl.mp3',
    enemyLaugh: 'assets/audio/haunt-laugh.mp3',
    enemyBite: 'assets/audio/haunt-bite.mp3',
    enemyAttack: 'assets/audio/haunt-attack-whoosh.mp3',
    bossRoar: 'assets/audio/boss-roar-alt.mp3',
    bossAttack: 'assets/audio/boss-attack.mp3',
    bossImpact: 'assets/audio/boss-impact.mp3',
    bossDeath: 'assets/audio/boss-death.mp3',
    tvSmash: 'assets/audio/tv-smash.mp3',
    vhsStart: 'assets/audio/vhs-start.mp3',
    vhsRewind: 'assets/audio/vhs-rewind.mp3',
    vhsGlitch: 'assets/audio/vhs-glitch.mp3',
    playerHurt: 'assets/audio/player-hurt.mp3',
    playerDodge: 'assets/audio/player-dodge.mp3',
    pickupAmmo: 'assets/audio/pickup-ammo.mp3',
    pickupHealth: 'assets/audio/pickup-health.mp3',
    pickupWeapon: 'assets/audio/pickup-weapon-soft.mp3',
    doorLock: 'assets/audio/door-lock.mp3',
    doorUnlock: 'assets/audio/door-unlock.mp3',
    nailgunShot: 'assets/audio/nailgun-shot-alt.mp3',
    nailgunWall: 'assets/audio/nailgun-wall.mp3',
  },
  // skinned, animated characters + prop kits (GLB, textures embedded)
  models: {
    // characters
    player: 'assets/models/player.glb',
    fp_hands: 'assets/models/fp_hands.glb',
    man: 'assets/models/man.glb',
    pumpkin: 'assets/models/pumpkin.glb',
    candy: 'assets/models/candy.glb',
    stitch: 'assets/models/stitch.glb',
    ghost: 'assets/models/ghost.glb',
    devil: 'assets/models/devil.glb',
    imp: 'assets/models/imp.glb',
    jack: 'assets/models/jack.glb',
    maw: 'assets/models/maw.glb',
    stitches: 'assets/models/stitches.glb',
    visitor: 'assets/models/visitor.glb',
    uninvited: 'assets/models/uninvited.glb',
    // the tapes that live in the living room TV (TVSmash)
    vhs: 'assets/models/vhs.glb',
    // the thing in the bedroom wardrobe (Boogey) and its helpers: lost sock puppets and the moths from its coat
    boogey: 'assets/models/boogey.glb',
    sock: 'assets/models/sock.glb',
    moth: 'assets/models/moth.glb',
    // furniture / decor kits (one root node per prop) and the items kit (weapons, pickups, projectiles)
    props_hall: 'assets/models/props_hall.glb',
    props_kitchen: 'assets/models/props_kitchen.glb',
    props_common: 'assets/models/props_common.glb',
    props_living: 'assets/models/props_living.glb',
    props_bedroom: 'assets/models/props_bedroom.glb',
    props_basement: 'assets/models/props_basement.glb',
    props_exterior: 'assets/models/props_exterior.glb',
    // the lived-in house: the teenager's room, the kitchen shelves, the record cabinet, the mess (buildClutter / buildMess)
    props_lived: 'assets/models/props_lived.glb',
    items: 'assets/models/items.glb',
    // the living room TV once the poker has gone through the screen, and the glass on the carpet (TVSmash)
    tv_broken: 'assets/models/tv_broken.glb',
    // the arcade machine in the bedroom: Sir Falls-A-Lot: Halloween Edition (W.buildArcade, Arcade)
    arcade: 'assets/models/arcade_sirfallsalot.glb',
  },
  // PBR surface textures (albedo / normal / roughness). Walls: 1 texture = 1 m wide x 3 m tall,
  // floors 2 m tiles (grass 4 m), brick / stone / siding 1 m tiles, rugs: one texture per rug.
  textures: {
    wall_hall: { map: 'assets/textures/wall_hall_albedo.jpg', normal: 'assets/textures/wall_hall_normal.jpg', rough: 'assets/textures/wall_hall_rough.jpg' },
    wall_kitchen: { map: 'assets/textures/wall_kitchen_albedo.jpg', normal: 'assets/textures/wall_kitchen_normal.jpg', rough: 'assets/textures/wall_kitchen_rough.jpg' },
    wall_living: { map: 'assets/textures/wall_living_albedo.jpg', normal: 'assets/textures/wall_living_normal.jpg', rough: 'assets/textures/wall_living_rough.jpg' },
    wall_bedroom: { map: 'assets/textures/wall_bedroom_albedo.jpg', normal: 'assets/textures/wall_bedroom_normal.jpg', rough: 'assets/textures/wall_bedroom_rough.jpg' },
    wall_basement: { map: 'assets/textures/wall_basement_albedo.jpg', normal: 'assets/textures/wall_basement_normal.jpg', rough: 'assets/textures/wall_basement_rough.jpg' },
    wall_outside: { map: 'assets/textures/wall_outside_albedo.jpg', normal: 'assets/textures/wall_outside_normal.jpg', rough: 'assets/textures/wall_outside_rough.jpg' },
    floor_wood: { map: 'assets/textures/floor_wood_albedo.jpg', normal: 'assets/textures/floor_wood_normal.jpg', rough: 'assets/textures/floor_wood_rough.jpg' },
    floor_wood_light: { map: 'assets/textures/floor_wood_light_albedo.jpg', normal: 'assets/textures/floor_wood_light_normal.jpg', rough: 'assets/textures/floor_wood_light_rough.jpg' },
    floor_checker: { map: 'assets/textures/floor_checker_albedo.jpg', normal: 'assets/textures/floor_checker_normal.jpg', rough: 'assets/textures/floor_checker_rough.jpg' },
    floor_carpet: { map: 'assets/textures/floor_carpet_albedo.jpg', normal: 'assets/textures/floor_carpet_normal.jpg', rough: 'assets/textures/floor_carpet_rough.jpg' },
    floor_concrete: { map: 'assets/textures/floor_concrete_albedo.jpg', normal: 'assets/textures/floor_concrete_normal.jpg', rough: 'assets/textures/floor_concrete_rough.jpg' },
    floor_porch: { map: 'assets/textures/floor_porch_albedo.jpg', normal: 'assets/textures/floor_porch_normal.jpg', rough: 'assets/textures/floor_porch_rough.jpg' },
    roof_shingles: { map: 'assets/textures/roof_shingles_albedo.jpg', normal: 'assets/textures/roof_shingles_normal.jpg', rough: 'assets/textures/roof_shingles_rough.jpg' },
    path_stone: { map: 'assets/textures/path_stone_albedo.jpg', normal: 'assets/textures/path_stone_normal.jpg', rough: 'assets/textures/path_stone_rough.jpg' },
    ground_grass: { map: 'assets/textures/ground_grass_albedo.jpg', normal: 'assets/textures/ground_grass_normal.jpg', rough: 'assets/textures/ground_grass_rough.jpg' },
    ceiling: { map: 'assets/textures/ceiling_albedo.jpg', normal: 'assets/textures/ceiling_normal.jpg', rough: 'assets/textures/ceiling_rough.jpg' },
    brick: { map: 'assets/textures/brick_albedo.jpg', normal: 'assets/textures/brick_normal.jpg', rough: 'assets/textures/brick_rough.jpg' },
    stone_pier: { map: 'assets/textures/stone_pier_albedo.jpg', normal: 'assets/textures/stone_pier_normal.jpg', rough: 'assets/textures/stone_pier_rough.jpg' },
    rug_runner: { map: 'assets/textures/rug_runner_albedo.jpg', normal: 'assets/textures/rug_runner_normal.jpg', rough: 'assets/textures/rug_runner_rough.jpg' },
    rug_braided: { map: 'assets/textures/rug_braided_albedo.png', normal: 'assets/textures/rug_braided_normal.jpg', rough: 'assets/textures/rug_braided_rough.jpg' },
    rug_blue: { map: 'assets/textures/rug_blue_albedo.jpg', normal: 'assets/textures/rug_blue_normal.jpg', rough: 'assets/textures/rug_blue_rough.jpg' },
    ritual_circle: { map: 'assets/textures/ritual_circle_albedo.png' },
    polaroids_atlas: { map: 'assets/textures/polaroids_atlas.png' }, // 4 x 4 small polaroids (basement wall)
  },
  // the game on the arcade machine (sirfallsalot.js) asks for these: its logo and the knight's voice lines.
  // The left side is the path it asks for, the right side the file (put the Rosebud asset URLs there)
  arcade: {
    'assets/textures/sfal_logo_halloween.webp': 'assets/textures/sfal_logo_halloween.webp',
    'assets/audio/sfal-fall-misplaced-wall-2.mp3': 'assets/audio/sfal-fall-misplaced-wall-2.mp3',
    'assets/audio/sfal-fall-feet-independence.mp3': 'assets/audio/sfal-fall-feet-independence.mp3',
    'assets/audio/sfal-fall-tall-misunderstanding.mp3': 'assets/audio/sfal-fall-tall-misunderstanding.mp3',
    'assets/audio/sfal-fall-theoretical-landing-2.mp3': 'assets/audio/sfal-fall-theoretical-landing-2.mp3',
    'assets/audio/sfal-fall-not-dressed-descent.mp3': 'assets/audio/sfal-fall-not-dressed-descent.mp3',
    'assets/audio/sfal-fall-rude-castle-2.mp3': 'assets/audio/sfal-fall-rude-castle-2.mp3',
    'assets/audio/sfal-fall-longer-rope.mp3': 'assets/audio/sfal-fall-longer-rope.mp3',
    'assets/audio/sfal-fall-softest-rock.mp3': 'assets/audio/sfal-fall-softest-rock.mp3',
    'assets/audio/sfal-fall-dramatic-exit.mp3': 'assets/audio/sfal-fall-dramatic-exit.mp3',
    'assets/audio/sfal-fall-posture-trajectory.mp3': 'assets/audio/sfal-fall-posture-trajectory.mp3',
    'assets/audio/sfal-lava-greaves-boiling.mp3': 'assets/audio/sfal-lava-greaves-boiling.mp3',
    'assets/audio/sfal-lava-not-that-bath-2.mp3': 'assets/audio/sfal-lava-not-that-bath-2.mp3',
    'assets/audio/sfal-lava-cold-dungeon.mp3': 'assets/audio/sfal-lava-cold-dungeon.mp3',
    'assets/audio/sfal-lava-wearable-oven.mp3': 'assets/audio/sfal-lava-wearable-oven.mp3',
    'assets/audio/sfal-lava-medium-rare.mp3': 'assets/audio/sfal-lava-medium-rare.mp3',
    'assets/audio/sfal-lava-personal-grudge.mp3': 'assets/audio/sfal-lava-personal-grudge.mp3',
    'assets/audio/sfal-lava-toes-resigned.mp3': 'assets/audio/sfal-lava-toes-resigned.mp3',
    'assets/audio/sfal-lava-marshmallow.mp3': 'assets/audio/sfal-lava-marshmallow.mp3',
    'assets/audio/sfal-lava-warm-welcome.mp3': 'assets/audio/sfal-lava-warm-welcome.mp3',
    'assets/audio/sfal-lava-fiery-career-choice.mp3': 'assets/audio/sfal-lava-fiery-career-choice.mp3',
  },
};
// Byte sizes of the files above as shipped (models: [.glb, .gltf.json]), only for the loading counter: it weighs
// each download by its size from the first byte on. A file that has changed or isn't listed just makes the counter a
// little less even ('m:' = assets/models/, 't:' = assets/textures/)
const ASSET_BYTES = {
  'm:player.glb': [1242572, 1597359], 'm:fp_hands.glb': [251012, 328976], 'm:man.glb': [255672, 328971],
  'm:pumpkin.glb': [633856, 834659], 'm:candy.glb': [557588, 729358], 'm:stitch.glb': [740992, 967451],
  'm:ghost.glb': [449004, 577631], 'm:devil.glb': [327376, 417573], 'm:imp.glb': [345960, 438698],
  'm:jack.glb': [1043676, 1345455], 'm:maw.glb': [1072044, 1384759], 'm:stitches.glb': [1229560, 1602676],
  'm:visitor.glb': [1353080, 1743046], 'm:uninvited.glb': [1711492, 2186283], 'm:vhs.glb': [315988, 404986],
  'm:boogey.glb': [1150256, 1492345], 'm:sock.glb': [369112, 478892], 'm:moth.glb': [487192, 639016],
  'm:props_hall.glb': [2571680, 3378376], 'm:props_kitchen.glb': [2342592, 3053995],
  'm:props_common.glb': [1473316, 1940003], 'm:props_living.glb': [3268832, 4286971],
  'm:props_bedroom.glb': [1846012, 2412831], 'm:props_basement.glb': [1282956, 1683210],
  'm:props_exterior.glb': [1131344, 1492418], 'm:props_lived.glb': [2779296, 3607640],
  'm:items.glb': [1506192, 1966714], 'm:tv_broken.glb': [227324, 296443],
  'm:arcade_sirfallsalot.glb': [1036720, 1373943], 't:wall_hall_albedo.jpg': 130000, 't:wall_hall_normal.jpg': 71616,
  't:wall_hall_rough.jpg': 84699, 't:wall_kitchen_albedo.jpg': 139695, 't:wall_kitchen_normal.jpg': 46549,
  't:wall_kitchen_rough.jpg': 50860, 't:wall_living_albedo.jpg': 96170, 't:wall_living_normal.jpg': 45744,
  't:wall_living_rough.jpg': 51323, 't:wall_bedroom_albedo.jpg': 76088, 't:wall_bedroom_normal.jpg': 42317,
  't:wall_bedroom_rough.jpg': 51100, 't:wall_basement_albedo.jpg': 212115, 't:wall_basement_normal.jpg': 190560,
  't:wall_basement_rough.jpg': 19721, 't:wall_outside_albedo.jpg': 40912, 't:wall_outside_normal.jpg': 24739,
  't:wall_outside_rough.jpg': 24540, 't:floor_wood_albedo.jpg': 155075, 't:floor_wood_normal.jpg': 99193,
  't:floor_wood_rough.jpg': 101908, 't:floor_wood_light_albedo.jpg': 189226, 't:floor_wood_light_normal.jpg': 93242,
  't:floor_wood_light_rough.jpg': 93575, 't:floor_checker_albedo.jpg': 107215, 't:floor_checker_normal.jpg': 24189,
  't:floor_checker_rough.jpg': 97754, 't:floor_carpet_albedo.jpg': 383834, 't:floor_carpet_normal.jpg': 440989,
  't:floor_carpet_rough.jpg': 106642, 't:floor_concrete_albedo.jpg': 198705, 't:floor_concrete_normal.jpg': 138620,
  't:floor_concrete_rough.jpg': 89286, 't:floor_porch_albedo.jpg': 137508, 't:floor_porch_normal.jpg': 144922,
  't:floor_porch_rough.jpg': 106643, 't:roof_shingles_albedo.jpg': 327275, 't:roof_shingles_normal.jpg': 158347,
  't:roof_shingles_rough.jpg': 49517, 't:path_stone_albedo.jpg': 169520, 't:path_stone_normal.jpg': 191703,
  't:path_stone_rough.jpg': 108473, 't:ground_grass_albedo.jpg': 448583, 't:ground_grass_normal.jpg': 492812,
  't:ground_grass_rough.jpg': 149351, 't:ceiling_albedo.jpg': 21765, 't:ceiling_normal.jpg': 41885,
  't:ceiling_rough.jpg': 75168, 't:brick_albedo.jpg': 75133, 't:brick_normal.jpg': 100989,
  't:brick_rough.jpg': 47681, 't:stone_pier_albedo.jpg': 59156, 't:stone_pier_normal.jpg': 82665,
  't:stone_pier_rough.jpg': 30660, 't:rug_runner_albedo.jpg': 364496, 't:rug_runner_normal.jpg': 185941,
  't:rug_runner_rough.jpg': 143916, 't:rug_braided_albedo.png': 232951, 't:rug_braided_normal.jpg': 346186,
  't:rug_braided_rough.jpg': 78817, 't:rug_blue_albedo.jpg': 351159, 't:rug_blue_normal.jpg': 158608,
  't:rug_blue_rough.jpg': 144592, 't:ritual_circle_albedo.png': 447845, 't:polaroids_atlas.png': 405021
};
function assetBytes(path, url) {
  const v = ASSET_BYTES[path.replace('assets/models/', 'm:').replace('assets/textures/', 't:')];
  return Array.isArray(v) ? v[/\.json(\?|$)/i.test(url || '') ? 1 : 0] : v || 0;
}

// The DEVELOPING counter. Each part of the start has a share of it that roughly matches its share of the wait: the
// downloads count their bytes (weighed by ASSET_BYTES), the GPU its textures, the house its building steps, the
// shaders count themselves ready. So it keeps moving through the whole wait, and 100 % is the door (CLICK TO ENTER).
class LoadMeter {
  constructor(shares, onChange) { this.parts = {}; for (const k in shares) this.parts[k] = { w: shares[k], f: 0 }; this.files = new Map(); this.onChange = onChange; }
  set(k, f) { const p = this.parts[k]; if (p && f > p.f) { p.f = Math.min(1, f); if (this.onChange) this.onChange(this.value); } }
  get value() { let s = 0, t = 0; for (const k in this.parts) { const p = this.parts[k]; s += p.w * p.f; t += p.w; } return t ? s / t : 0; }
  // a download on its way: { bytes(got, length), done() } for it (counted until it is unpacked too)
  file(path, url) {
    const f = { w: assetBytes(path, url), got: 0, len: 0, done: false };
    this.files.set(path, f);
    return { bytes: (got, len) => { f.got = got; if (len) f.len = len; this.dl(); }, done: () => { f.done = true; this.dl(); } };
  }
  dl() {
    let s = 0, t = 0;
    for (const f of this.files.values()) { const n = f.w || f.len || 200000; s += n * (f.done ? 1 : Math.min(0.97, f.got / n)); t += n; }
    this.set('dl', t ? s / t : 0);
  }
}
// (lets the screen show the counter between two steps of the start: a frame goes by, unless the tab is hidden or one
// went by a moment ago, a few times a second is plenty)
let lastPaint = 0;
function letPaint() {
  if (typeof document === 'undefined' || document.hidden || performance.now() - lastPaint < 150) return Promise.resolve();
  return new Promise((res) => {
    let d = false; const go = () => { if (!d) { d = true; lastPaint = performance.now(); res(); } };
    requestAnimationFrame(() => setTimeout(go, 0)); setTimeout(go, 120);
  });
}

// optional host hook: a page can relocate or rename every asset file, e.g.
//   window.HYHM_ASSET_URL = (path) => 'https://my.cdn/game/' + path;
function assetURL(u) {
  try { if (typeof window !== 'undefined' && typeof window.HYHM_ASSET_URL === 'function') return window.HYHM_ASSET_URL(u) || u; } catch (e) { /* keep the path */ }
  return u;
}

const GAME_TITLE = 'HOW YOU HAUNT ME';
const GAME_SUB = 'Look At This Polaroid';
const QS = (typeof location !== 'undefined' ? location.search : '') || '';
const DEBUG = /[?&]debug/.test(QS);
const SHOTS = /[?&]shots/.test(QS); // automated screenshots: simulate in the loop, render only on demand

// ---------------------------------------------------------------------
//  Small math helpers
// ---------------------------------------------------------------------
const TAU = Math.PI * 2;
const DEG = Math.PI / 180;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
// keep the items of an array that pass, in place (per frame lists: no new array every frame)
function compact(a, keep) { let w = 0; for (let i = 0; i < a.length; i++) { const x = a[i]; if (keep(x)) a[w++] = x; } a.length = w; return a; }
const lerp = (a, b, t) => a + (b - a) * t;
const invLerp = (a, b, v) => clamp((v - a) / (b - a), 0, 1);
const damp = (a, b, lambda, dt) => lerp(a, b, 1 - Math.exp(-lambda * dt));
const rand = (a = 0, b = 1) => a + Math.random() * (b - a);
const randi = (a, b) => Math.floor(rand(a, b + 1));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const chance = (p) => Math.random() < p;
const sign = (v) => (v < 0 ? -1 : 1);
const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const easeIn = (t) => t * t * t;
const easeOutBack = (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
const smoothstep = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };
// shortest signed angle from a to b
const angDiff = (a, b) => { let d = (b - a) % TAU; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; return d; };
const dampAngle = (a, b, lambda, dt) => a + angDiff(a, b) * (1 - Math.exp(-lambda * dt));
const dist2 = (ax, az, bx, bz) => { const dx = ax - bx, dz = az - bz; return dx * dx + dz * dz; };
const dist = (ax, az, bx, bz) => Math.sqrt(dist2(ax, az, bx, bz));
// yaw convention: object rotation.y = yaw faces direction (sin(yaw), cos(yaw)) in x/z for models,
// camera with rotation.y = yaw looks toward (-sin(yaw), -cos(yaw)).
const yawTo = (dx, dz) => Math.atan2(dx, dz);           // model facing yaw
const camYawTo = (dx, dz) => Math.atan2(-dx, -dz);      // camera yaw

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const _v1 = new THREE.Vector3(), _v2 = new THREE.Vector3(), _v3 = new THREE.Vector3();
const _q1 = new THREE.Quaternion();
const _c1 = new THREE.Color();

function fmtTime(s) {
  s = Math.max(0, Math.floor(s));
  const m = Math.floor(s / 60), r = s % 60;
  return m + ':' + (r < 10 ? '0' : '') + r;
}

// ---------------------------------------------------------------------
//  Persistent settings and save (wrapped, storage may be unavailable)
// ---------------------------------------------------------------------
const Store = {
  get(key, def) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; } catch (e) { return def; }
  },
  set(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* ignore */ } },
  del(key) { try { localStorage.removeItem(key); } catch (e) { /* ignore */ } },
};

// retro: 0 = HD (default), 1 = VHS, 2 = chunky pixels. quality: 0 low, 1 medium, 2 high
// (machines that report under 8 GB of memory start on medium: half size textures, lighter shadows)
const LOW_MEM = typeof navigator !== 'undefined' && navigator.deviceMemory > 0 && navigator.deviceMemory < 8;
// touch-first devices (phones, tablets) get the on-screen controls and play in landscape; ?touch turns them on on a
// desktop (for testing). Phones start on low quality, tablets on medium
const FORCE_TOUCH = /[?&]touch/.test(QS);
const TOUCH_DEV = FORCE_TOUCH || (typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(pointer: coarse)').matches && !window.matchMedia('(pointer: fine)').matches);
const PHONE = TOUCH_DEV && typeof screen !== 'undefined' && Math.min(screen.width, screen.height) < 600;
const DEFAULT_SETTINGS = { master: 0.8, music: 0.6, sfx: 0.85, retro: 0, quality: TOUCH_DEV ? (PHONE ? 0 : 1) : LOW_MEM ? 1 : 2, shake: 1, sens: 1, easy: false, fps: false };
const SETTINGS = Object.assign({}, DEFAULT_SETTINGS, Store.get('hyhm_settings_v2', {}));
if (/[?&]lowq/.test((typeof location !== 'undefined' ? location.search : '') || '')) SETTINGS.quality = 0;
function saveSettings() { Store.set('hyhm_settings_v2', SETTINGS); }

// ---------------------------------------------------------------------
//  Global game state
// ---------------------------------------------------------------------
const G = {
  side: {},            // side haunts beaten this run (boogey: the thing in the bedroom wardrobe)
  state: 'boot',       // boot | title | play | ending
  phase: 'none',       // see game flow section
  level: 0,            // index of the active photo (0..4), 5 when finished
  time: 0,             // scaled game time
  realTime: 0,
  timeScale: 1,
  hitStop: 0,
  paused: false,
  dread: 0,            // 0 cozy -> 1 fully haunted
  haunted: false,
  arena: null,         // room id while doors are locked
  inBasement: false,
  enemies: [],
  bosses: [],
  projectiles: [],
  pickups: [],
  hazards: [],
  wave: null,
  stats: { kills: 0, damage: 0, time: 0, deaths: 0, shots: 0 },
  clockMinutes: 23 * 60 + 41, // in-game wall clock (minutes since midnight of Oct 31)
  objective: '',
  flags: {},
  arcade: null,        // the arcade machine in the bedroom: 'in' | 'on' | 'out' while you play it (Arcade)
};

// =====================================================================
//  UI: CSS, DOM overlay, menus (Halloween / 90s camcorder style)
// =====================================================================
const FONT_URL = './_remote/3a125e88c76c9347/css2';

const ICONS = {
  poker: '<svg viewBox="0 0 48 48"><path d="M9 41 L35 15" stroke="currentColor" stroke-width="3.6" stroke-linecap="round" fill="none"/><path d="M35 15 L42 8 M35 15 L40 20" stroke="currentColor" stroke-width="3.6" stroke-linecap="round" fill="none"/><circle cx="8" cy="42" r="4.2" stroke="currentColor" stroke-width="3" fill="none"/></svg>',
  nailgun: '<svg viewBox="0 0 48 48"><path d="M6 14 h28 l6 5 v5 H18 l-3 16 H7 l3 -16 H6 z" fill="currentColor"/><rect x="22" y="26" width="5" height="12" rx="1" fill="currentColor" opacity=".7"/><path d="M41 21 h5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>',
  shotgun: '<svg viewBox="0 0 48 48"><path d="M4 20 h30 v3 H4 z M4 25 h30 v3 H4 z" fill="currentColor"/><path d="M34 19 h4 l8 4 v8 l-6 3 -5 -6 h-1 z" fill="currentColor"/><path d="M26 28 l3 6 h3" stroke="currentColor" stroke-width="2.4" fill="none"/></svg>',
  bomb: '<svg viewBox="0 0 48 48"><ellipse cx="24" cy="29" rx="16" ry="13" fill="currentColor"/><path d="M24 16 v-5 q4 -5 8 -3" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M17 26 l4 3 -4 3z M31 26 l-4 3 4 3z M17 36 q7 4 14 0" fill="#000" opacity=".75"/><circle cx="33" cy="7" r="3" fill="#ffd36b"/></svg>',
  heart: '<svg viewBox="0 0 48 48"><path d="M24 42 C10 32 4 25 4 16 A9.5 9.5 0 0 1 24 11 A9.5 9.5 0 0 1 44 16 C44 25 38 32 24 42z" fill="currentColor"/></svg>',
  reload: '<svg viewBox="0 0 48 48"><path d="M38 24a14 14 0 1 1-4.1-9.9" stroke="currentColor" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M36 6v10H26" stroke="currentColor" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  sweater: '<svg viewBox="0 0 48 48"><path d="M17 8h14l10 7-4 9-4-2v18H15V22l-4 2-4-9z" fill="currentColor"/><path d="M19 8q5 6 10 0" stroke="#121014" stroke-width="2.5" fill="none"/><path d="M15 30h18M15 35h18" stroke="#121014" stroke-width="2" opacity=".6"/></svg>',
  shoe: '<svg viewBox="0 0 48 48"><path d="M6 30V16h10l4 6 10 3c8 2 12 5 12 9v2H6z" fill="currentColor"/><path d="M6 38h36" stroke="currentColor" stroke-width="3"/><path d="M4 20h-3M5 26H0M6 32H2" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>',
  candy: '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="10" fill="currentColor"/><path d="M14 24L4 16v16zM34 24l10-8v16z" fill="currentColor" opacity=".75"/><path d="M19 18q5 6 0 12M26 16q5 8 0 16" stroke="#121014" stroke-width="2" fill="none" opacity=".6"/></svg>',
  bag: '<svg viewBox="0 0 48 48"><path d="M10 18h28l-3 24H13z" fill="currentColor"/><path d="M17 18v-4a7 7 0 0 1 14 0v4" stroke="currentColor" stroke-width="3.5" fill="none"/><path d="M18 28h12" stroke="#121014" stroke-width="3"/></svg>',
  flashlight: '<svg viewBox="0 0 48 48"><path d="M4 20h18v8H4z" fill="currentColor"/><path d="M22 17l8-5v24l-8-5z" fill="currentColor"/><path d="M34 14l10-5M35 24h11M34 34l10 5" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity=".8"/></svg>',
  lock: '<svg viewBox="0 0 48 48"><rect x="11" y="21" width="26" height="20" rx="3" fill="currentColor"/><path d="M16 21 v-6 a8 8 0 0 1 16 0 v6" stroke="currentColor" stroke-width="4" fill="none"/></svg>',
};

// a gamepad button as a glyph (Xbox letters, the browser's standard mapping): A B X Y round and coloured, the rest keys
function padKey(n) { return `<span class="kc pk pk-${n}">${n}</span>`; }
// player-facing lines that name keyboard keys, as they read with a gamepad / with the touch controls (UI.ctl)
const CTL_TEXT = [
  [/WASD to walk around/, 'Left stick to walk around', 'Left thumb to walk around'],
  [/and press E\b/, 'and press A', 'and tap the prompt'],
  [/\(press F to look at it\)/, '(press Y to look at it)', '(tap the photo to look at it)'],
  [/press F and hold the photo up\./, 'press Y and hold the photo up with LT.', 'tap the photo and hold HOLD UP.'],
  [/Left click to swing\. Space to dodge roll\./, 'RT to swing. B to dodge roll.', 'Right thumb to swing. ROLL to dodge.'],
  [/Space to dodge\./, 'B to dodge.', 'ROLL to dodge.'],
  [/left click to swing {2}\/ {2}press 1/, 'RT to swing  /  LB RB to switch', 'right thumb to swing'],
  [/throw at the cursor/, 'aim with the right stick', 'aim, let go to throw'],
  [/ {2}\/ {2}press ([234])$/, '  /  RB to switch', '  /  tap weapon $1'],
];

const CSS = `
#hyhm{position:fixed;inset:0;background:#050406;overflow:hidden;color:#efe6d2;font-family:'Special Elite','Courier New',Courier,monospace;user-select:none;-webkit-user-select:none;touch-action:none;color-scheme:dark}
#hyhm *{box-sizing:border-box}
#hyhm canvas#hy-canvas{position:absolute;inset:0;width:100%;height:100%;display:block;outline:none}
#hyhm.playing canvas#hy-canvas{cursor:none}
#hyhm .hidden{display:none!important}
#hyhm button{font:inherit;color:inherit;background:none;border:0;cursor:pointer}
#hyhm .kc{display:inline-flex;align-items:center;justify-content:center;min-width:1.7em;height:1.6em;padding:0 .35em;margin:0 .12em;border:2px solid #efe6d2;border-bottom-width:4px;border-radius:5px;font-family:'VT323',monospace;font-size:1.05em;line-height:1;color:#efe6d2;background:#16121a;vertical-align:middle}
#hy-hud{position:absolute;inset:0;pointer-events:none}
#hy-objective{position:absolute;left:50%;top:min(75%,calc(100% - clamp(90px,15vh,150px) - clamp(14px,2vh,20px) * 2.2 - 14px));max-width:min(460px,62vw);width:max-content;background:#e9dfc6;color:#1c1416;padding:.6em 1.05em .65em;transform:translate(-50%,-100%) rotate(-1.2deg) scale(1);transform-origin:50% 100%;box-shadow:0 4px 0 rgba(0,0,0,.45),0 0 28px rgba(0,0,0,.55);clip-path:polygon(0 4%,6% 0,15% 3%,27% 0,41% 2%,55% 0,70% 3%,84% 0,100% 2%,99% 96%,88% 100%,72% 97%,58% 100%,40% 97%,25% 100%,10% 97%,1% 100%);transition:opacity .4s,left .6s ease,top .6s ease,transform .6s ease,transform-origin .6s ease}
#hy-objective .lbl{font-family:'VT323',monospace;font-size:clamp(14px,1.8vh,20px);letter-spacing:.12em;color:#8b1c1c;display:block;margin-bottom:.1em}
#hy-objective .txt{font-family:'Permanent Marker','Comic Sans MS',cursive;font-size:clamp(16px,2.7vh,29px);line-height:1.18}
#hy-objective .sub{font-size:clamp(12px,1.85vh,19px);margin-top:.3em;color:#4a3a36}
/* (in a fight or a cut scene the note waits in the corner, out of the way) */
#hy-objective.dock{left:clamp(10px,2vw,28px);top:clamp(10px,2vh,24px);transform:translate(0,0) rotate(-1.2deg) scale(.8);transform-origin:0 0}
#hy-objective.pulse{animation:hyPulse .7s ease-out}
@keyframes hyPulse{0%{scale:1.1}100%{scale:1}}
#hy-osd{position:absolute;right:clamp(10px,2vw,28px);top:clamp(8px,1.6vh,20px);text-align:right;font-family:'VT323',monospace;font-size:clamp(18px,2.6vh,28px);line-height:1;color:#f4f1e8;text-shadow:0 0 6px rgba(255,255,255,.35),2px 2px 0 rgba(0,0,0,.6);letter-spacing:.06em}
#hy-osd .rec{color:#ff3b30;animation:hyBlink 1.2s steps(2) infinite}
@keyframes hyBlink{50%{opacity:0}}
#hy-wave{position:absolute;left:clamp(14px,2.2vw,32px);top:calc(clamp(10px,2vh,24px) + 7.2em);font-family:'VT323',monospace;font-size:clamp(18px,2.6vh,26px);color:#ffb15c;text-shadow:0 0 8px rgba(255,120,20,.6),2px 2px 0 #000;letter-spacing:.08em}
#hy-boss{position:absolute;left:50%;top:clamp(12px,2.4vh,30px);transform:translateX(-50%);width:min(560px,42vw);text-align:center}
#hyhm.bossfight #hy-objective{max-width:min(300px,25vw)}
#hy-boss .name{font-family:'Creepster',cursive;font-size:clamp(22px,3.6vh,38px);letter-spacing:.08em;color:#ff7a1a;text-shadow:0 0 12px rgba(255,90,0,.55),3px 3px 0 #000}
#hy-boss .bar{position:relative;height:clamp(10px,1.5vh,16px);background:#1a0b0d;border:2px solid #efe6d2;box-shadow:0 0 0 2px #000,0 0 18px rgba(179,18,27,.45);overflow:hidden}
#hy-boss .lag{position:absolute;left:0;top:0;bottom:0;background:#f5e8c8;transition:width .6s ease-out .25s}
#hy-boss .fill{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(#e0241f,#7d0c12)}
#hy-health{position:absolute;left:clamp(12px,2vw,28px);bottom:clamp(12px,2.2vh,26px);display:flex;align-items:center;gap:.6em}
#hy-health .heart{width:clamp(30px,4.2vh,44px);height:clamp(30px,4.2vh,44px);color:#d11a25;filter:drop-shadow(2px 2px 0 #000)}
#hy-health.low .heart{animation:hyBeat .7s infinite}
@keyframes hyBeat{0%,100%{transform:scale(1)}15%{transform:scale(1.22)}30%{transform:scale(1)}45%{transform:scale(1.12)}}
#hy-health .bar{position:relative;width:clamp(150px,22vw,280px);height:clamp(14px,2vh,20px);background:#1a0b0d;border:2px solid #efe6d2;box-shadow:0 0 0 2px #000}
#hy-health .lag{position:absolute;left:0;top:0;bottom:0;background:#f5e8c8;transition:width .5s ease-out .2s}
#hy-health .fill{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(#e0241f,#8a0d14)}
#hy-health .num{font-family:'VT323',monospace;font-size:clamp(20px,2.8vh,30px);text-shadow:2px 2px 0 #000;min-width:3.2em}
#hy-photo{position:absolute;left:clamp(14px,2vw,30px);bottom:calc(clamp(12px,2.2vh,26px) + clamp(44px,6vh,62px));width:clamp(84px,11vh,124px);transform:rotate(-4deg);transition:transform .3s,opacity .3s}
#hy-photo .pol{background:#f2eee4;padding:6% 6% 26% 6%;box-shadow:3px 4px 0 rgba(0,0,0,.6);position:relative}
#hy-photo .img{width:100%;aspect-ratio:1/1;background:#26282a;background-size:cover;background-position:center;transition:filter 1.2s}
#hy-photo .cap{position:absolute;left:0;right:0;bottom:3%;text-align:center;font-family:'Permanent Marker',cursive;color:#222;font-size:clamp(9px,1.25vh,13px);white-space:nowrap;overflow:hidden}
#hy-photo .stack{position:absolute;inset:0;z-index:-1}
#hy-photo .stack i{position:absolute;inset:0;background:#d9d3c4;box-shadow:2px 3px 0 rgba(0,0,0,.5)}
#hy-photo .key{position:absolute;right:-.9em;top:-.7em;font-size:clamp(13px,1.8vh,18px)}
#hy-photo.glow .pol{box-shadow:0 0 18px 4px rgba(255,200,120,.75),3px 4px 0 rgba(0,0,0,.6)}
#hy-photo .count{position:absolute;left:-.4em;top:-.9em;font-family:'VT323',monospace;font-size:clamp(14px,1.9vh,19px);color:#efe6d2;text-shadow:1px 1px 0 #000}
#hy-weapons{position:absolute;right:clamp(12px,2vw,28px);bottom:clamp(12px,2.2vh,26px);display:flex;gap:clamp(5px,.7vw,9px)}
#hy-weapons .slot{position:relative;width:clamp(58px,8.2vh,86px);height:clamp(58px,8.2vh,86px);background:rgba(16,12,18,.78);border:2px solid rgba(239,230,210,.35);display:flex;flex-direction:column;align-items:center;justify-content:center;transition:transform .15s,border-color .15s}
#hy-weapons .slot svg{width:62%;height:62%;color:#efe6d2}
#hy-weapons .slot.active{border-color:#ff7a1a;transform:translateY(-6px);box-shadow:0 0 14px rgba(255,122,26,.45)}
#hy-weapons .slot.active svg{color:#ffb15c}
#hy-weapons .slot.locked svg{color:#3a3440}
#hy-weapons .slot .n{position:absolute;left:4px;top:1px;font-family:'VT323',monospace;font-size:clamp(14px,1.8vh,18px);color:#a99f8f}
#hy-weapons .slot .am{position:absolute;right:4px;bottom:5px;font-family:'VT323',monospace;font-size:clamp(14px,1.9vh,19px);line-height:1;color:#efe6d2;text-shadow:1px 1px 0 #000}
#hy-weapons .slot .mg{position:absolute;left:3px;right:3px;bottom:2px;height:3px;background:rgba(239,230,210,.16);display:none}
#hy-weapons .slot.gun .mg{display:block}
#hy-weapons .slot .mf{position:absolute;left:0;top:0;height:100%;width:0;background:rgba(239,230,210,.8)}
#hy-weapons .slot .rl{position:absolute;left:0;top:0;height:100%;background:#ff7a1a;width:0}
#hy-weapons .slot .mg.two::after{content:'';position:absolute;left:calc(50% - 1px);top:0;width:2px;height:100%;background:#100c12}
#hy-weapons .slot.empty .am{color:#ff4040}
#hy-weapons .wname{position:absolute;right:0;bottom:calc(100% + 10px);font-family:'Permanent Marker',cursive;font-size:clamp(13px,1.9vh,19px);color:#ffb15c;text-shadow:2px 2px 0 #000;white-space:nowrap;transition:opacity .4s}
#hy-prompt{position:absolute;left:50%;bottom:clamp(90px,15vh,150px);transform:translateX(-50%);background:rgba(10,8,12,.82);border:1px solid rgba(239,230,210,.4);padding:.45em 1em;font-size:clamp(14px,2vh,20px);white-space:nowrap;box-shadow:0 0 18px rgba(0,0,0,.6)}
#hy-hint{position:absolute;left:50%;top:clamp(10px,2vh,22px);transform:translateX(-50%);font-size:clamp(12px,1.7vh,17px);color:#e7dcc5;text-shadow:1px 1px 0 #000;white-space:nowrap;background:rgba(5,4,6,.55);padding:.35em .8em}
#hy-toast{position:absolute;left:50%;top:22%;transform:translateX(-50%);text-align:center;font-family:'Permanent Marker',cursive;font-size:clamp(16px,2.6vh,26px);color:#efe6d2;text-shadow:2px 2px 0 #000,0 0 14px rgba(0,0,0,.9);pointer-events:none;opacity:0;transition:opacity .35s;max-width:80vw}
#hy-toast.show{opacity:1}
#hy-reticle{position:absolute;left:0;top:0;width:34px;height:34px;margin:-17px 0 0 -17px;pointer-events:none;z-index:5}
#hy-reticle:before,#hy-reticle:after{content:'';position:absolute;inset:0;border:2px solid rgba(255,190,120,.9);border-radius:50%;clip-path:polygon(0 0,38% 0,38% 100%,62% 100%,62% 0,100% 0,100% 38%,0 38%,0 62%,100% 62%,100% 100%,0 100%);box-shadow:0 0 6px rgba(255,120,20,.6)}
#hy-reticle:after{inset:14px;border-radius:50%;background:#ffcf8a;border:0;clip-path:none}
#hy-reticle.hit:before{border-color:#fff;transform:scale(.8)}
#hy-titlecard{position:absolute;left:0;right:0;top:34%;text-align:center;pointer-events:none;opacity:0;transition:opacity .6s}
#hy-titlecard.show{opacity:1}
#hy-titlecard .big{font-family:'Creepster',cursive;font-size:clamp(40px,9vh,104px);letter-spacing:.06em;color:#ff7a1a;text-shadow:0 0 22px rgba(255,80,0,.5),4px 4px 0 #000;line-height:1}
#hy-titlecard .small{font-family:'Permanent Marker',cursive;font-size:clamp(16px,2.8vh,28px);color:#efe6d2;margin-top:.4em;text-shadow:2px 2px 0 #000}
#hy-titlecard.boss .big{color:#e0241f;text-shadow:0 0 26px rgba(224,36,31,.55),4px 4px 0 #000}
#hy-titlecard.clear .big{color:#efe6d2}
#hy-caption{position:absolute;left:50%;top:40%;transform:translate(-50%,-50%);width:min(760px,86vw);text-align:center;font-size:clamp(18px,3vh,30px);line-height:1.45;color:#efe6d2;text-shadow:2px 2px 0 #000;pointer-events:none}
#hy-caption .date{font-family:'VT323',monospace;font-size:1.25em;color:#ffb15c;letter-spacing:.1em}
#hy-dialog{position:absolute;left:50%;bottom:clamp(30px,8vh,90px);transform:translateX(-50%);width:min(720px,88vw);background:rgba(6,5,8,.88);border:2px solid #efe6d2;box-shadow:0 0 0 3px #000,0 10px 40px rgba(0,0,0,.8);padding:1em 1.3em 1.1em;pointer-events:none}
#hy-dialog .speaker{font-family:'VT323',monospace;font-size:clamp(16px,2.2vh,22px);color:#ff7a1a;letter-spacing:.14em;margin-bottom:.3em}
#hy-dialog .line{font-size:clamp(18px,3vh,30px);line-height:1.35}
#hy-dialog .more{position:absolute;right:.8em;bottom:.4em;font-family:'VT323',monospace;color:#a99f8f;animation:hyBlink 1s steps(2) infinite}
#hy-flash{position:absolute;inset:0;background:#fff;opacity:0;pointer-events:none}
#hy-fade{position:absolute;inset:0;background:#000;opacity:1;pointer-events:none}
#hy-scan{position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(0deg,rgba(0,0,0,.09) 0 1px,transparent 1px 3px);mix-blend-mode:multiply;opacity:.55}
#hy-loading{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1em;background:#050406;z-index:30}
#hy-loading .t{font-family:'Creepster',cursive;font-size:clamp(30px,6vh,60px);color:#ff7a1a;letter-spacing:.06em}
#hy-loading .p{font-family:'VT323',monospace;font-size:clamp(18px,2.6vh,26px);color:#a99f8f;letter-spacing:.2em}
#hy-loading .go{font-family:'VT323',monospace;font-size:clamp(20px,3vh,30px);color:#efe6d2;letter-spacing:.18em;padding:.4em 1.2em;border:2px solid #efe6d2;animation:hyBlink 1.4s steps(2) infinite;cursor:pointer;pointer-events:auto}
#hy-title{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;padding:0 clamp(18px,7vw,110px);pointer-events:none;background:radial-gradient(ellipse 62% 80% at 0% 64%,rgba(5,4,6,.84) 0%,rgba(5,4,6,.5) 50%,rgba(5,4,6,0) 100%)}
#hy-title .pre{font-family:'VT323',monospace;font-size:clamp(14px,2.2vh,22px);letter-spacing:.32em;color:#a99f8f;text-transform:uppercase}
#hy-title h1{margin:-.22em -.4em -.3em -.4em;padding:.3em .4em;font-family:'Creepster',cursive;font-weight:400;font-size:clamp(46px,12vh,140px);line-height:.9;letter-spacing:.04em;color:#ff7a1a;text-shadow:0 0 30px rgba(255,90,0,.38),5px 5px 0 #000;max-width:calc(9ch + .8em)}
#hy-title .sub{font-family:'Permanent Marker',cursive;font-size:clamp(20px,3.6vh,38px);color:#efe6d2;transform:rotate(-2.5deg);transform-origin:left;margin:.1em -.4em .95em -.3em;padding:.25em .4em;text-shadow:2px 2px 0 #000}
/* worn print: the lettering is masked with specks, chips and scratches (UI.init draws the masks) */
#hy-title h1,#hy-loading .t{-webkit-mask-image:var(--hy-worn);mask-image:var(--hy-worn);-webkit-mask-size:3.4em 3.4em;mask-size:3.4em 3.4em}
#hy-title .sub{-webkit-mask-image:var(--hy-worn2);mask-image:var(--hy-worn2);-webkit-mask-size:9em 9em;mask-size:9em 9em}
#hy-loading .t{padding:.3em .4em}
#hy-title .foot .hp{pointer-events:auto;cursor:default;-webkit-user-select:none;user-select:none}
#hy-title .foot .hp.tick{animation:hyTick .3s}
@keyframes hyTick{0%{color:#ff4a1a}100%{color:#8d8372}}
#hy-title .sub b{color:#d11a25;font-weight:400}
#hy-title nav{display:flex;flex-direction:column;align-items:flex-start;gap:.15em;pointer-events:auto}
#hyhm .mbtn{font-family:'Special Elite',monospace;font-size:clamp(18px,3vh,30px);letter-spacing:.14em;text-transform:uppercase;color:#d8cdb6;padding:.18em .2em;position:relative;transition:color .15s,transform .15s;text-align:left}
#hyhm .mbtn:before{content:'';position:absolute;left:-1.1em;top:50%;width:.7em;height:.7em;margin-top:-.35em;background:#ff7a1a;clip-path:polygon(0 0,100% 50%,0 100%);opacity:0;transition:opacity .15s}
#hyhm .mbtn:hover,#hyhm .mbtn:focus-visible,#hyhm .mbtn.sel{color:#ff9a3d;transform:translateX(.25em);outline:none}
#hyhm .mbtn:hover:before,#hyhm .mbtn:focus-visible:before,#hyhm .mbtn.sel:before{opacity:1}
#hyhm .mbtn[disabled]{opacity:.35;pointer-events:none}
#hy-title .foot{position:absolute;left:clamp(18px,7vw,110px);bottom:clamp(14px,3vh,34px);font-family:'VT323',monospace;font-size:clamp(14px,2vh,20px);color:#8d8372;letter-spacing:.12em}
#hy-panel{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(3,2,4,.72);z-index:20;padding:16px}
#hy-panel .card{position:relative;width:min(760px,94vw);max-height:92vh;overflow:auto;background:#0f0c11;border:2px solid #efe6d2;box-shadow:0 0 0 4px #000,0 18px 60px rgba(0,0,0,.85);padding:clamp(16px,3vh,34px) clamp(18px,3.4vw,44px)}
#hy-panel h2{margin:0 0 .4em;font-family:'Creepster',cursive;font-weight:400;font-size:clamp(34px,6vh,64px);letter-spacing:.06em;color:#ff7a1a;line-height:1;text-shadow:3px 3px 0 #000}
#hy-panel h2.red{color:#e0241f}
#hy-panel p{font-size:clamp(14px,2.1vh,19px);line-height:1.5;color:#d8cdb6;margin:.4em 0}
#hy-panel nav{display:flex;flex-direction:column;align-items:flex-start;gap:.1em;margin-top:.8em;padding-left:1.2em}
#hy-panel .row{display:grid;grid-template-columns:minmax(150px,1fr) 2fr;gap:.6em 1.2em;align-items:center;margin:.55em 0;font-size:clamp(14px,2.1vh,19px)}
#hy-panel .row label{color:#d8cdb6}
#hy-panel input[type=range]{width:100%;accent-color:#ff7a1a}
#hy-panel .seg{display:flex;gap:.4em;flex-wrap:wrap}
#hy-panel .seg button{border:1px solid #6b6052;padding:.2em .7em;color:#d8cdb6;font-size:.95em}
#hy-panel .seg button.on{border-color:#ff7a1a;color:#ff9a3d;background:rgba(255,122,26,.08)}
#hy-panel .keys{display:grid;grid-template-columns:auto 1fr;gap:.55em 1.2em;align-items:center;font-size:clamp(14px,2.05vh,19px);margin-top:.6em}
#hy-panel .keys .k{text-align:right;white-space:nowrap}
#hy-panel .keys .d{color:#d8cdb6}
#hy-panel .keys h4{grid-column:1/-1;margin:.7em 0 0;font-family:'VT323',monospace;font-weight:400;font-size:1.2em;letter-spacing:.16em;color:#ff7a1a}
#hy-panel .cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(10px,1.6vw,22px);margin-top:1em}
#hy-panel .ucard{background:#f2eee4;color:#1c1416;padding:clamp(8px,1vw,14px) clamp(8px,1vw,14px) clamp(8px,.9vw,12px);box-shadow:4px 5px 0 rgba(0,0,0,.7);cursor:pointer;transition:transform .15s,box-shadow .15s;text-align:left;display:flex;flex-direction:column}
#hy-panel .ucard:nth-child(1){transform:rotate(-2deg)}#hy-panel .ucard:nth-child(2){transform:rotate(1.2deg)}#hy-panel .ucard:nth-child(3){transform:rotate(-.8deg)}
#hy-panel .ucard:hover,#hy-panel .ucard:focus-visible,#hy-panel .ucard.sel{transform:rotate(0) translateY(-8px) scale(1.03);box-shadow:0 0 0 3px #ff7a1a,6px 10px 0 rgba(0,0,0,.7);outline:none}
#hy-panel .ucard .ph{aspect-ratio:1/1;background:radial-gradient(circle at 50% 40%,#3a2a2c,#121014 70%);display:flex;align-items:center;justify-content:center;color:#ff9a3d;filter:drop-shadow(0 0 10px rgba(255,120,30,.55))}
#hy-panel .ucard .ph svg{width:52%;height:52%}
#hy-panel .ucard .nm{font-family:'Permanent Marker',cursive;font-size:clamp(15px,2.3vh,22px);margin:.45em 0 .15em}
#hy-panel .ucard .ds{font-size:clamp(12px,1.75vh,16px);line-height:1.35;color:#3a302c}
#hy-panel .ucard .kk{font-family:'VT323',monospace;color:#8b1c1c;font-size:1.1em;margin-top:auto;padding-top:.4em}
#hy-panel .stats{display:grid;grid-template-columns:auto auto;gap:.3em 1.5em;justify-content:start;font-family:'VT323',monospace;font-size:clamp(18px,2.6vh,26px);margin:.6em 0 0}
#hy-panel .stats span:nth-child(odd){color:#a99f8f}
#hy-album{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:clamp(10px,2vw,30px);flex-wrap:wrap;background:rgba(3,2,4,.8);z-index:15;padding:20px;pointer-events:none}
#hy-album .ap{width:clamp(120px,17vw,220px);background:#f2eee4;padding:clamp(6px,.8vw,11px) clamp(6px,.8vw,11px) clamp(30px,3.6vw,46px);box-shadow:5px 6px 0 rgba(0,0,0,.65);position:relative}
#hy-album .ap .img{width:100%;aspect-ratio:1/1;background:#26282a;background-size:cover;background-position:center}
#hy-album .ap .cap{position:absolute;left:0;right:0;bottom:5%;text-align:center;font-family:'Permanent Marker',cursive;color:#222;font-size:clamp(11px,1.7vh,17px)}
#hy-album .ap.cur{box-shadow:0 0 0 4px #ff7a1a,5px 6px 0 rgba(0,0,0,.65)}
#hy-album .ap.done:after{content:'';position:absolute;inset:4% 4% 20%;background:linear-gradient(45deg,transparent 46%,#b3121b 46% 54%,transparent 54%),linear-gradient(-45deg,transparent 46%,#b3121b 46% 54%,transparent 54%);opacity:.8}
#hy-album .title{position:absolute;top:6vh;left:0;right:0;text-align:center;font-family:'Creepster',cursive;font-size:clamp(30px,5vh,52px);color:#ff7a1a}
#hy-album .lrow{flex-basis:100%;display:flex;justify-content:center;align-items:flex-end;gap:clamp(5px,.7vw,10px);flex-wrap:wrap;margin-top:1.2vh}
#hy-album .lrow .lt{flex-basis:100%;text-align:center;font-family:'VT323',monospace;letter-spacing:.14em;color:#a99f8f;font-size:clamp(14px,2vh,20px)}
#hy-album .lm{width:clamp(34px,4.2vw,58px);background:#f2eee4;padding:3px 3px 9px;box-shadow:2px 3px 0 rgba(0,0,0,.6)}
#hy-album .lm .img{aspect-ratio:1/1;background:#26282a center/cover}
#hy-album .lm.no{background:#3a3530;opacity:.55}
#hy-panel .lost{display:grid;grid-template-columns:minmax(0,.95fr) minmax(0,1.05fr);gap:clamp(14px,2.6vw,34px);align-items:center;margin-top:.7em}
#hy-panel .pol{background:#f2eee4;padding:4.5% 4.5% 19%;box-shadow:5px 6px 0 rgba(0,0,0,.65);position:relative;transform:rotate(-2deg)}
#hy-panel .pol .img{aspect-ratio:1/1;background:#17151a center/cover}
#hy-panel .pol .cap{position:absolute;left:0;right:0;bottom:4.5%;text-align:center;font-family:'Permanent Marker',cursive;color:#222;font-size:clamp(14px,2.4vh,23px)}
#hy-panel .back{font-family:'Special Elite',monospace;color:#2a2018;background:#e9e1cf;padding:1em 1.2em;box-shadow:5px 6px 0 rgba(0,0,0,.6);transform:rotate(1deg);line-height:1.55;font-size:clamp(13px,1.95vh,17px)}
#hy-panel .back .date{display:block;margin-bottom:.45em;font-family:'Permanent Marker',cursive;color:#8b1c1c;font-size:1.05em}
#hy-panel .who{margin-top:.9em;font-family:'VT323',monospace;letter-spacing:.06em;color:#ff9a3d;font-size:clamp(18px,2.6vh,26px)}
#hy-panel .cnt{margin-top:.5em;font-family:'VT323',monospace;letter-spacing:.14em;color:#8d8372;font-size:clamp(14px,2vh,19px)}
#hy-panel .lgrid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:clamp(8px,1.3vw,18px);margin-top:.9em}
#hy-panel .lcard{background:#f2eee4;padding:6% 6% 24%;box-shadow:3px 4px 0 rgba(0,0,0,.6);position:relative;text-align:center;cursor:pointer;transition:transform .15s,box-shadow .15s}
#hy-panel button.lcard:hover,#hy-panel button.lcard:focus-visible{transform:translateY(-5px) rotate(-1deg);box-shadow:0 0 0 3px #ff7a1a,4px 6px 0 rgba(0,0,0,.6);outline:none}
#hy-panel .lcard .img{aspect-ratio:1/1;background:#17151a center/cover;display:flex;align-items:center;justify-content:center;font-family:'Creepster',cursive;font-size:clamp(20px,3.4vh,34px);color:#4d443c}
#hy-panel .lcard .cap{position:absolute;left:3%;right:3%;bottom:4%;font-family:'Permanent Marker',cursive;color:#222;font-size:clamp(9px,1.35vh,13px);line-height:1.1}
#hy-panel .lcard.no{background:#2c2724;cursor:default}
#hy-panel .lcard.no .cap{font-family:'VT323',monospace;color:#a99f8f;font-size:clamp(10px,1.45vh,14px)}
#hy-panel .secret{display:grid;grid-template-columns:auto minmax(0,1fr);gap:clamp(12px,2vw,26px);align-items:center;margin:.8em 0 .3em}
#hy-panel .secret .pol{width:clamp(110px,22vh,190px)}
#hy-panel .secret .back{font-size:clamp(12px,1.75vh,16px)}
#hy-panel .cred h4{margin:.9em 0 .15em;font-family:'VT323',monospace;font-weight:400;font-size:clamp(20px,2.9vh,29px);letter-spacing:.18em;color:#ff7a1a}
#hy-panel .cred h4:first-child{margin-top:.2em}
#hy-panel .cred .by{font-family:'Permanent Marker',cursive;font-size:clamp(20px,3.3vh,32px);color:#efe6d2;margin:.15em 0 .25em;text-shadow:2px 2px 0 #000}
#hy-panel .cred .by b{color:#ff9a3d;font-weight:400}
#hy-panel .cred a{color:#ff9a3d;text-decoration:underline;text-underline-offset:.2em;overflow-wrap:anywhere;transition:color .15s}
#hy-panel .cred a:hover,#hy-panel .cred a:focus-visible{color:#ffc27a;outline:none}
#hy-panel .cred .reach{display:flex;gap:.5em;align-items:baseline;flex-wrap:wrap}
#hy-panel .cred .reach span{font-family:'VT323',monospace;letter-spacing:.1em;color:#a99f8f;font-size:1.15em}
#hy-fps{position:absolute;right:6px;bottom:4px;font-family:'VT323',monospace;font-size:14px;color:#7f7;z-index:40;pointer-events:none}
#hyhm.cine #hy-health,#hyhm.cine #hy-weapons,#hyhm.cine #hy-photo,#hyhm.cine #hy-wave,#hyhm.cine #hy-prompt{opacity:0;transition:opacity .5s}
#hy-health,#hy-weapons,#hy-photo{transition:opacity .5s}
#hy-touch{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;padding:24px;background:#050406;z-index:50;font-size:18px;line-height:1.5}
/* gamepad glyphs (Xbox letters) */
#hyhm .kc.pk{border-radius:7px;font-size:.95em;min-width:2em}
#hyhm .kc.pk-A,#hyhm .kc.pk-B,#hyhm .kc.pk-X,#hyhm .kc.pk-Y{border-radius:50%;width:1.6em;min-width:1.6em;padding:0;border-bottom-width:2px;color:#0f0c11}
#hyhm .kc.pk-A{background:#6fcf5f;border-color:#3f8f35}
#hyhm .kc.pk-B{background:#ef5a4c;border-color:#a8342b}
#hyhm .kc.pk-X{background:#4f9ff0;border-color:#2f68a8}
#hyhm .kc.pk-Y{background:#f2c84b;border-color:#a8862b}
#hyhm .kc.tap{font-size:.85em;letter-spacing:.06em;border-color:#ff9a3d;color:#ff9a3d}
/* touch: the on-screen controls */
#hyhm{-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent}
#hy-tc{position:absolute;inset:0;z-index:6;touch-action:none}
#hy-tc .stk{position:absolute;width:calc(var(--r,60px) * 2);height:calc(var(--r,60px) * 2);margin:calc(var(--r,60px) * -1) 0 0 calc(var(--r,60px) * -1);border-radius:50%;border:2px solid rgba(239,230,210,.4);background:radial-gradient(circle,rgba(239,230,210,.1),rgba(239,230,210,.03) 68%);pointer-events:none;opacity:.3;transition:opacity .15s}
#hy-tc .stk.l{left:22%;top:66%}
#hy-tc .stk.r{left:73%;top:56%}
#hy-tc .stk.on{opacity:1}
#hy-tc .stk .nub{position:absolute;left:50%;top:50%;width:44%;height:44%;margin:-22% 0 0 -22%;border-radius:50%;background:rgba(239,230,210,.42);box-shadow:0 0 12px rgba(0,0,0,.55)}
#hy-tc .stk.r .nub{background:rgba(255,122,26,.6)}
#hy-tc.fp .stk.r,#hy-tc.cine .stk{display:none}
#hy-tc .tb{position:absolute;display:flex;align-items:center;justify-content:center;flex-direction:column;width:var(--s,60px);height:var(--s,60px);border-radius:50%;background:rgba(14,10,16,.6);border:2px solid rgba(239,230,210,.5);color:#efe6d2;font-family:'VT323',monospace;font-size:calc(var(--s,60px) * .3);letter-spacing:.06em;line-height:.95;text-align:center;touch-action:none;box-shadow:0 0 14px rgba(0,0,0,.5);transition:transform .08s,background .08s,opacity .2s}
#hy-tc .tb.dn{transform:scale(.92);background:rgba(255,122,26,.42);border-color:#ff9a3d}
#hy-tc .tb.off{opacity:0;pointer-events:none}
#hy-tc .tb svg{width:58%;height:58%}
#hy-tc .tb.iso,#hy-tc .tb.fp{display:none}
#hy-tc.iso .tb.iso,#hy-tc.fp .tb.fp{display:flex}
#hy-tc .tb.pause{--s:44px;left:calc(10px + env(safe-area-inset-left,0px));top:10px;border-radius:10px;flex-direction:row;gap:5px}
#hy-tc .tb.pause i{display:block;width:5px;height:16px;background:#efe6d2}
#hy-tc .tb.dodge{--s:76px;right:calc(20px + env(safe-area-inset-right,0px));bottom:calc(clamp(58px,8.2vh,86px) + 34px);font-size:22px;border-color:#ff9a3d}
#hy-tc .tb.reload{--s:54px;right:calc(108px + env(safe-area-inset-right,0px));bottom:calc(clamp(58px,8.2vh,86px) + 36px)}
#hy-tc .tb.act{--s:62px;right:calc(26px + env(safe-area-inset-right,0px));bottom:calc(clamp(58px,8.2vh,86px) + 124px);font-size:20px;background:rgba(255,122,26,.3);border-color:#ff9a3d}
#hy-tc .tb.raise{--s:96px;right:calc(26px + env(safe-area-inset-right,0px));bottom:calc(28px + env(safe-area-inset-bottom,0px));font-size:24px;border-color:#ff9a3d}
#hy-tc .tb.away{--s:66px;right:calc(140px + env(safe-area-inset-right,0px));bottom:calc(40px + env(safe-area-inset-bottom,0px));font-size:17px}
#hyhm.touch #hy-weapons .slot,#hyhm.touch #hy-photo,#hyhm.touch #hy-prompt{pointer-events:auto;z-index:7;touch-action:none}
#hyhm.touch #hy-photo .key{display:none}
#hyhm.touch #hy-objective.dock{left:calc(64px + env(safe-area-inset-left,0px))}
#hyhm.touch #hy-hint{white-space:normal;max-width:min(92vw,720px);text-align:center}
#hyhm.pad .ucard .kk,#hyhm.touch .ucard .kk{display:none}
#hy-panel .card{touch-action:pan-y;-webkit-overflow-scrolling:touch;overscroll-behavior:contain}
#hy-panel p.also{font-size:clamp(12px,1.8vh,16px);color:#8d8372;margin-top:.9em}
#hy-panel .row.sel{outline:1px solid rgba(255,122,26,.5);outline-offset:4px}
#hy-panel .row.sel label{color:#ff9a3d}
#hy-panel button.lcard.sel{transform:translateY(-5px) rotate(-1deg);box-shadow:0 0 0 3px #ff7a1a,4px 6px 0 rgba(0,0,0,.6)}
#hy-loading .note{max-width:80vw;text-align:center;color:#ff9a3d;letter-spacing:.12em}
#hy-title .foot .pc{color:#ff9a3d;letter-spacing:.16em;margin-bottom:.3em;font-size:1.12em;text-transform:uppercase}
/* touch: held upright, the phone asks to be turned */
#hy-rotate{position:absolute;inset:0;z-index:60;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:24px;background:#050406;text-align:center}
#hy-rotate .ph{width:58px;height:96px;border:4px solid #efe6d2;border-radius:12px;position:relative;animation:hyTurn 2.4s ease-in-out infinite}
#hy-rotate .ph i{position:absolute;left:50%;bottom:6px;width:12px;height:4px;margin-left:-6px;border-radius:2px;background:#efe6d2}
@keyframes hyTurn{0%,30%{transform:rotate(0)}60%,100%{transform:rotate(-90deg)}}
#hy-rotate .t{font-family:'Creepster',cursive;font-size:34px;letter-spacing:.05em;color:#ff7a1a;text-shadow:3px 3px 0 #000}
#hy-rotate .s{font-family:'VT323',monospace;font-size:20px;letter-spacing:.14em;color:#a99f8f}
#hy-rotate .s.pc{color:#ff9a3d;text-transform:uppercase}
/* (a long panel scrolls; its menu stays in sight at the bottom) */
#hy-panel .card>nav{position:sticky;bottom:calc(-1 * clamp(16px,3vh,34px));padding-top:.2em;padding-bottom:.5em;margin-bottom:-.5em;background:#0f0c11;box-shadow:0 -14px 14px -2px #0f0c11;z-index:1}
#hyhm.touch.hold #hy-objective{opacity:0!important}
/* a phone held sideways: a short screen */
@media (max-height:500px){
#hy-title .pre{font-size:12px}
#hy-title h1{font-size:clamp(32px,10.5vh,52px)}
#hy-title .sub{font-size:clamp(15px,4.4vh,20px);margin-bottom:.45em}
#hyhm .mbtn{font-size:clamp(14px,4.3vh,19px);padding:.1em .2em}
#hy-title nav{gap:0}
#hy-title .foot{left:auto;right:calc(clamp(14px,3vw,30px) + env(safe-area-inset-right,0px));text-align:right;bottom:10px;font-size:13px}
#hy-panel{padding:8px}
#hy-panel .card{max-height:96vh;padding:12px 18px}
#hy-panel .card>nav{bottom:-12px}
#hy-panel h2{font-size:clamp(26px,8vh,40px)}
#hy-panel .cards{gap:10px;margin-top:.5em}
#hy-panel .ucard .ph{aspect-ratio:auto;height:22vh;min-height:0}
#hy-panel .ucard .ph svg{height:13vh;width:13vh}
#hy-objective{max-width:min(380px,48vw)}
#hy-objective .txt{font-size:15px}
#hy-objective .sub{font-size:11px}
#hy-caption{font-size:clamp(15px,4.6vh,22px);top:44%}
#hy-dialog{bottom:12px;padding:.6em 1em .7em}
#hy-dialog .line{font-size:clamp(15px,4.6vh,22px)}
#hy-titlecard .big{font-size:clamp(34px,11vh,60px)}
#hy-album .title{top:2vh}
#hy-album .ap{width:clamp(90px,15vw,150px)}
}
@media (max-width:640px){#hy-panel .cards{grid-template-columns:1fr}#hy-weapons .slot{width:48px;height:48px}#hy-objective{max-width:60vw}#hy-panel .lost,#hy-panel .secret{grid-template-columns:1fr}#hy-panel .lgrid{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media (prefers-reduced-motion:reduce){#hyhm *{animation:none!important;transition:none!important}}
`;

// ---------------------------------------------------------------------
//  Fullscreen from the game itself: the title screen and the pause menu offer it (on a phone the start screen asks
//  for it too). The whole page goes fullscreen, the arcade machine's game with it
// ---------------------------------------------------------------------
const FS = {
  el() { return (typeof document !== 'undefined' && (document.fullscreenElement || document.webkitFullscreenElement)) || null; },
  // (iPhone Safari has no fullscreen for pages, and a frame that doesn't allow it can't go fullscreen either)
  can() {
    if (typeof document === 'undefined') return false;
    const d = document, de = d.documentElement;
    return !!(de && (de.requestFullscreen || de.webkitRequestFullscreen) && (d.fullscreenEnabled || d.webkitFullscreenEnabled));
  },
  on() { return !!this.el(); },
  label() { return this.on() ? 'Exit Fullscreen' : 'Fullscreen'; },
  enter() {
    const de = document.documentElement, rq = de.requestFullscreen || de.webkitRequestFullscreen;
    if (!rq) return Promise.reject(new Error('no fullscreen'));
    let p;
    try { p = rq.call(de, { navigationUI: 'hide' }); } catch (e) { return Promise.reject(e); }
    // (a phone turns sideways where the browser allows it: the house plays in landscape)
    const lock = () => { if (Input.mode !== 'touch') return; try { const q = screen.orientation && screen.orientation.lock && screen.orientation.lock('landscape'); if (q && q.catch) q.catch(() => { }); } catch (e) { /* not here */ } };
    return Promise.resolve(p).then(lock);
  },
  exit() {
    const d = document, x = d.exitFullscreen || d.webkitExitFullscreen;
    try { const p = x && x.call(d); if (p && p.catch) p.catch(() => { }); } catch (e) { /* already out */ }
  },
  toggle() {
    if (this.on()) { this.exit(); return; }
    // (the browser only allows it from a click, a tap or a key: a gamepad button doesn't count. The item itself says
    // so for a moment, the toasts are part of the HUD)
    this.enter().catch(() => {
      const msg = Input.mode === 'pad' ? 'Click or press Enter for fullscreen' : 'No fullscreen in this browser';
      document.querySelectorAll('#hyhm .mbtn[data-fs]').forEach((b) => { b.textContent = msg; });
      clearTimeout(this._t); this._t = setTimeout(() => this.changed(), 2600);
    });
  },
  // the menu items follow it (Esc out of fullscreen, the browser's own button)
  changed() { if (typeof document !== 'undefined') document.querySelectorAll('#hyhm .mbtn[data-fs]').forEach((b) => { b.textContent = this.label(); }); },
};
if (typeof document !== 'undefined') for (const ev of ['fullscreenchange', 'webkitfullscreenchange']) document.addEventListener(ev, () => FS.changed());

const UI = {
  el: {},
  typeTimer: null,
  toastTimer: null,
  cardTimer: null,
  menuItems: [],
  menuIndex: 0,
  panelOpen: null,
  onPanelKey: null,

  init() {
    // fonts + css
    try {
      const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = FONT_URL; document.head.appendChild(link);
    } catch (e) { /* offline is fine */ }
    const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    if (!document.title) document.title = 'How You Haunt Me';
    document.documentElement.style.background = '#050406';
    document.body.style.background = '#050406';
    document.body.style.margin = '0';
    document.body.style.overflow = 'hidden';

    let root = document.getElementById('hyhm');
    if (!root) { root = document.createElement('div'); root.id = 'hyhm'; document.body.appendChild(root); }
    root.innerHTML = `
      <canvas id="hy-canvas" tabindex="0"></canvas>
      <div id="hy-scan"></div>
      <div id="hy-hud" class="hidden">
        <div id="hy-objective"><span class="lbl">TO DO</span><div class="txt"></div><div class="sub"></div></div>
        <div id="hy-osd"><div><span class="rec">&#9679;</span> <span class="mode">PLAY &#9654;</span></div><div class="date">OCT.31.1996</div><div class="clock">11:41 PM</div></div>
        <div id="hy-wave" class="hidden"></div>
        <div id="hy-boss" class="hidden"><div class="name"></div><div class="bar"><div class="lag"></div><div class="fill"></div></div></div>
        <div id="hy-photo" class="hidden"><div class="count"></div><div class="pol"><div class="stack"><i style="transform:rotate(7deg)"></i><i style="transform:rotate(-5deg)"></i></div><div class="img"></div><div class="cap"></div></div><span class="kc key">F</span></div>
        <div id="hy-health"><div class="heart">${ICONS.heart}</div><div class="bar"><div class="lag"></div><div class="fill"></div></div><div class="num">100</div></div>
        <div id="hy-weapons"><div class="wname"></div></div>
        <div id="hy-prompt" class="hidden"></div>
        <div id="hy-hint" class="hidden"></div>
        <div id="hy-toast"></div>
      </div>
      <div id="hy-reticle" class="hidden"></div>
      <div id="hy-titlecard"><div class="big"></div><div class="small"></div></div>
      <div id="hy-caption" class="hidden"></div>
      <div id="hy-dialog" class="hidden"><div class="speaker"></div><div class="line"></div><div class="more">&#9660;</div></div>
      <div id="hy-title" class="hidden">
        <div class="pre">October 31st, 1996</div>
        <h1>How You Haunt Me</h1>
        <div class="sub"><b>//</b> Look At This Polaroid</div>
        <nav id="hy-tmenu"></nav>
        <div class="foot"><div class="pc hidden">Best experienced on a computer</div><span class="ctl">KEYBOARD + MOUSE OR GAMEPAD</span> &nbsp;&bull;&nbsp; <span class="hp">HEADPHONES RECOMMENDED</span></div>
      </div>
      <div id="hy-album" class="hidden"></div>
      <div id="hy-panel" class="hidden"><div class="card"></div></div>
      <div id="hy-flash"></div>
      <div id="hy-fade"></div>
      <div id="hy-loading"><div class="t">How You Haunt Me</div><div class="p">DEVELOPING&hellip;</div></div>
      <div id="hy-fps" class="hidden"></div>
      <div id="hy-rotate" class="hidden"><div class="ph"><i></i></div><div class="t">Turn your phone sideways</div><div class="s">THIS GAME PLAYS IN LANDSCAPE</div><div class="s pc">Best experienced on a computer</div></div>`;
    const q = (s) => root.querySelector(s);
    this.el = {
      root, canvas: q('#hy-canvas'), hud: q('#hy-hud'), objective: q('#hy-objective'), objTxt: q('#hy-objective .txt'), objSub: q('#hy-objective .sub'),
      osd: q('#hy-osd'), osdClock: q('#hy-osd .clock'), osdMode: q('#hy-osd .mode'), wave: q('#hy-wave'), boss: q('#hy-boss'), bossName: q('#hy-boss .name'),
      bossFill: q('#hy-boss .fill'), bossLag: q('#hy-boss .lag'), photo: q('#hy-photo'), photoImg: q('#hy-photo .img'), photoCap: q('#hy-photo .cap'), photoCount: q('#hy-photo .count'),
      health: q('#hy-health'), hpFill: q('#hy-health .fill'), hpLag: q('#hy-health .lag'), hpNum: q('#hy-health .num'),
      weapons: q('#hy-weapons'), wname: q('#hy-weapons .wname'), prompt: q('#hy-prompt'), hint: q('#hy-hint'), toast: q('#hy-toast'),
      reticle: q('#hy-reticle'), card: q('#hy-titlecard'), cardBig: q('#hy-titlecard .big'), cardSmall: q('#hy-titlecard .small'),
      caption: q('#hy-caption'), dialog: q('#hy-dialog'), dlgSpeaker: q('#hy-dialog .speaker'), dlgLine: q('#hy-dialog .line'), dlgMore: q('#hy-dialog .more'),
      title: q('#hy-title'), tmenu: q('#hy-tmenu'), album: q('#hy-album'), panel: q('#hy-panel'), panelCard: q('#hy-panel .card'),
      flash: q('#hy-flash'), fade: q('#hy-fade'), loading: q('#hy-loading'), fps: q('#hy-fps'), scan: q('#hy-scan'),
      photoKey: q('#hy-photo .key'), footCtl: q('#hy-title .foot .ctl'), footPc: q('#hy-title .foot .pc'), rotate: q('#hy-rotate'),
    };
    // weapon slots
    const names = ['poker', 'nailgun', 'shotgun', 'bomb'];
    this.slots = names.map((n, i) => {
      const d = document.createElement('div');
      d.className = 'slot locked';
      // (.am every round you carry, .mg what is loaded right now: a strip of nails, the shotgun's two barrels; .rl the
      // reload filling it back up)
      d.innerHTML = `<span class="n">${i + 1}</span>${ICONS[n]}<span class="am"></span><div class="mg${n === 'shotgun' ? ' two' : ''}"><div class="mf"></div><div class="rl"></div></div>`;
      this.el.weapons.appendChild(d);
      return { el: d, am: d.querySelector('.am'), rl: d.querySelector('.rl'), mf: d.querySelector('.mf') };
    });
    // the on-screen controls (shown with touch input), and the HUD parts they make tappable
    Touch.init(root, { slots: this.slots, prompt: this.el.prompt, photo: this.el.photo });
    // (no pinch or double tap zoom: the game is the whole page)
    try {
      let vp = document.querySelector('meta[name=viewport]');
      if (!vp) { vp = document.createElement('meta'); vp.name = 'viewport'; document.head.appendChild(vp); }
      vp.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover';
    } catch (e) { /* ignore */ }
    this.onInputMode(Input.mode);
    this.el.fps.classList.toggle('hidden', !SETTINGS.fps);
    this.applyScan();
    // the title lettering looks worn: masks full of specks, chipped spots and scratches
    try { root.style.setProperty('--hy-worn', `url(${wornMask(512, 7, 1)})`); root.style.setProperty('--hy-worn2', `url(${wornMask(384, 13, 1.6)})`); } catch (e) { /* plain lettering */ }
    // (secret, for testing the ending: click "headphones recommended" ten times in a row on the title screen)
    const hp = q('#hy-title .foot .hp');
    if (hp) hp.addEventListener('click', (e) => {
      e.stopPropagation();
      if (G.state !== 'title' || this.panelOpen) return;
      const now = performance.now();
      this._hpN = now - (this._hpT || 0) < 1500 ? (this._hpN || 0) + 1 : 1; this._hpT = now;
      if (this._hpN >= 5) { hp.classList.remove('tick'); void hp.offsetWidth; hp.classList.add('tick'); }
      if (this._hpN >= 10) { this._hpN = 0; Game.skipToEnd(); }
    });
  },

  applyScan() { if (this.el.scan) this.el.scan.style.display = SETTINGS.retro ? 'block' : 'none'; },

  showHUD(on) { this.el.hud.classList.toggle('hidden', !on); },
  setPlaying(on) { this.el.root.classList.toggle('playing', on); },
  setCine(on) { this.el.root.classList.toggle('cine', !!on); },

  // quiet: the same note again in other words (the input changed), no pulse, no sound
  setObjective(text, sub, quiet = false) {
    const el = this.el;
    this._objRaw = text ? [text, sub] : null;
    if (!text) { el.objective.style.opacity = '0'; G.objective = ''; return; }
    text = this.ctl(text); sub = sub ? this.ctl(sub) : sub;
    if (G.objective === text && (el.objSub.textContent || '') === (sub || '')) return;
    G.objective = text;
    el.objective.style.opacity = '1';
    el.objTxt.textContent = text;
    el.objSub.textContent = sub || '';
    el.objSub.style.display = sub ? 'block' : 'none';
    if (quiet) return;
    el.objective.classList.remove('pulse'); void el.objective.offsetWidth; el.objective.classList.add('pulse');
    if (typeof Sfx !== 'undefined') Sfx.ui('note');
    // (a new one shows in the middle of the screen for a while, even in a fight)
    this.objFresh = 5;
  },

  // ---------------- the input in use ----------------
  // a line that names keyboard keys, as it reads with the input in use (CTL_TEXT)
  ctl(s) {
    if (!s || Input.mode === 'kb') return s;
    const k = Input.mode === 'pad' ? 1 : 2;
    for (const r of CTL_TEXT) s = s.replace(r[0], r[k]);
    return s;
  },
  // the glyph of an action's key for the input in use
  key(action) {
    const m = Input.mode;
    const K = { use: ['E', 'A', 'TAP'], photo: ['F', 'Y', ''] }[action] || ['?', '?', ''];
    if (m === 'pad') return padKey(K[1]);
    if (m === 'touch') return K[2] ? `<span class="kc tap">${K[2]}</span>` : '';
    return `<span class="kc">${K[0]}</span>`;
  },
  // another kind of input took over: the words and the on-screen controls follow
  onInputMode(m) {
    const el = this.el;
    el.root.classList.toggle('pad', m === 'pad'); el.root.classList.toggle('touch', m === 'touch');
    if (this._objRaw) this.setObjective(this._objRaw[0], this._objRaw[1], true);
    if (typeof Photos !== 'undefined' && Photos.mode === 'hold') this.hint(Photos.hintHTML());
    el.photoKey.innerHTML = m === 'pad' ? 'Y' : 'F';
    el.photoKey.classList.toggle('pk', m === 'pad'); el.photoKey.classList.toggle('pk-Y', m === 'pad');
    this.updateFoot();
    if (G.state === 'boot' && el.loading) { const go = el.loading.querySelector('.go'); if (go) go.textContent = m === 'touch' ? 'TAP TO ENTER' : m === 'pad' ? 'PRESS A TO ENTER' : 'CLICK TO ENTER'; }
    if (this.panelOpen === 'controls' && this._ctlBack) this.showControls(this._ctlBack);
  },
  // the title screen's small print: what to play with (and on a phone: that a computer is better)
  updateFoot() {
    const f = this.el.footCtl; if (!f) return;
    const m = Input.mode;
    f.textContent = m === 'touch' ? 'TOUCH CONTROLS' : m === 'pad' ? 'GAMEPAD' : 'KEYBOARD + MOUSE OR GAMEPAD';
    this.el.footPc.classList.toggle('hidden', !(m === 'touch' || TOUCH_DEV));
  },
  // the to-do note sits in the middle of the screen, a little low, where you look. In a fight or a cut scene it waits
  // in the corner, out of the way
  dockObjective(on) { if (this._objDock !== on) { this._objDock = on; this.el.objective.classList.toggle('dock', on); } },

  setHealth(hp, max) {
    const f = clamp(hp / max, 0, 1) * 100;
    this.el.hpFill.style.width = f + '%';
    this.el.hpLag.style.width = f + '%';
    this.el.hpNum.textContent = Math.ceil(hp);
    this.el.health.classList.toggle('low', hp / max < 0.3);
  },

  setWeapons(P) {
    const W = P.weapons;
    const keys = ['poker', 'nailgun', 'shotgun', 'bomb'];
    keys.forEach((k, i) => {
      const s = this.slots[i], w = W[k], size = WEAPONS[k].mag || 0;
      s.el.classList.toggle('locked', !w.owned);
      s.el.classList.toggle('active', P.weapon === k);
      // one number: every round you carry, loaded or spare, so it only reads 0 when the gun really is out. What is
      // loaded right now shows as the thin bar under it
      const total = P.rounds(k);
      const txt = w.owned && k !== 'poker' ? String(total) : '';
      if (s.am._t !== txt) { s.am._t = txt; s.am.textContent = txt; }
      s.el.classList.toggle('empty', w.owned && k !== 'poker' && total <= 0);
      const gun = w.owned && size > 0;
      s.el.classList.toggle('gun', gun);
      const mw = (gun ? Math.round(clamp(w.mag / size, 0, 1) * 100) : 0) + '%';
      if (s.mf._w !== mw) { s.mf._w = mw; s.mf.style.width = mw; }
      const rw = (P.weapon === k && P.reloadT > 0 ? Math.round((1 - P.reloadT / P.reloadDur) * 100) : 0) + '%';
      if (s.rl._w !== rw) { s.rl._w = rw; s.rl.style.width = rw; }
    });
  },

  weaponName(name) {
    const e = this.el.wname; e.textContent = name; e.style.opacity = '1';
    clearTimeout(this._wnT); this._wnT = setTimeout(() => { e.style.opacity = '0'; }, 1400);
  },

  setPhotoHUD(info) {
    // info: {visible, img (dataURL|null), caption, developing (0..1), glow, count}
    const el = this.el;
    if (!info || !info.visible) { el.photo.classList.add('hidden'); return; }
    el.photo.classList.remove('hidden');
    if (info.img !== undefined && el.photoImg._src !== info.img) {
      el.photoImg._src = info.img;
      el.photoImg.style.backgroundImage = info.img ? `url(${info.img})` : 'none';
    }
    const cap = info.caption || '', cnt = String(info.count || '');
    if (el.photoCap._t !== cap) { el.photoCap._t = cap; el.photoCap.textContent = cap; }
    const d = info.developing == null ? 1 : info.developing;
    const flt = d >= 1 ? 'none' : `brightness(${(0.18 + d * 0.82).toFixed(2)}) sepia(${((1 - d) * 0.9).toFixed(2)}) contrast(${(0.6 + d * 0.4).toFixed(2)}) blur(${((1 - d) * 2).toFixed(1)}px)`;
    if (el.photoImg._f !== flt) { el.photoImg._f = flt; el.photoImg.style.filter = flt; }
    el.photo.classList.toggle('glow', !!info.glow);
    if (el.photoCount._t !== cnt) { el.photoCount._t = cnt; el.photoCount.textContent = cnt; }
  },

  prompt(text) {
    if (!text) { this.el.prompt.classList.add('hidden'); this._prompt = null; return; }
    if (this._prompt === text) return;
    this._prompt = text;
    this.el.prompt.innerHTML = text;
    this.el.prompt.classList.remove('hidden');
  },

  hint(html) {
    if (!html) { this.el.hint.classList.add('hidden'); this._hint = null; return; }
    if (this._hint === html) return;
    this._hint = html; this.el.hint.innerHTML = html; this.el.hint.classList.remove('hidden');
  },

  toast(text, ms = 2600) {
    const t = this.el.toast;
    t.innerHTML = this.ctl(text); t.classList.add('show');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => t.classList.remove('show'), ms);
  },

  titleCard(big, small, ms = 2800, cls = '') {
    const c = this.el.card;
    c.className = cls;
    this.el.cardBig.textContent = big || '';
    this.el.cardSmall.textContent = this.ctl(small) || '';
    void c.offsetWidth;
    c.classList.add('show');
    clearTimeout(this.cardTimer);
    this.cardTimer = setTimeout(() => c.classList.remove('show'), ms);
  },

  // typewriter text: returns a handle with .done flag
  // typewriter; `start` visible characters are shown at once (to continue a line that is already on screen)
  _type(el, text, cps, onChar, start = 0) {
    clearInterval(this.typeTimer);
    const h = { done: false, skip: () => { clearInterval(this.typeTimer); el.innerHTML = text; h.done = true; } };
    const plain = text.replace(/<[^>]*>/g, '');
    if (!cps) { el.innerHTML = text; h.done = true; return h; }
    // render a prefix by counting visible characters
    const prefix = (n) => {
      let vis = 0, out = '';
      for (let k = 0; k < text.length; k++) {
        const ch = text[k];
        if (ch === '<') { const e = text.indexOf('>', k); out += text.slice(k, e + 1); k = e; continue; }
        if (vis >= n) break;
        out += ch; vis++;
      }
      return out;
    };
    let i = Math.min(start, plain.length); el.innerHTML = prefix(i);
    this.typeTimer = setInterval(() => {
      i++;
      el.innerHTML = prefix(i);
      if (onChar && plain[i - 1] && plain[i - 1] !== ' ') onChar();
      if (i >= plain.length) { clearInterval(this.typeTimer); h.done = true; }
    }, 1000 / cps);
    return h;
  },

  // cont: the new line extends the one on screen, only the added part is typed
  dialog(speaker, line, cont = false) {
    if (!line) { this.el.dialog.classList.add('hidden'); clearInterval(this.typeTimer); this._dlgLine = ''; return null; }
    this.el.dialog.classList.remove('hidden');
    this.el.dlgSpeaker.textContent = speaker || '';
    this.el.dlgMore.style.display = 'none';
    const start = cont && this._dlgLine && line.startsWith(this._dlgLine) ? this._dlgLine.replace(/<[^>]*>/g, '').length : 0;
    this._dlgLine = line;
    const h = this._type(this.el.dlgLine, line, 26, () => Sfx.ui('type'), start);
    return h;
  },

  caption(html, cps = 34) {
    if (!html) { this.el.caption.classList.add('hidden'); clearInterval(this.typeTimer); return null; }
    this.el.caption.classList.remove('hidden');
    return this._type(this.el.caption, html, cps, () => Sfx.ui('type'));
  },

  flashV: 0, flashRate: 1, fadeV: 1, fadeTarget: 1, fadeRate: 1,
  flash(ms = 400, peak = 1, color = '#fff') {
    this.el.flash.style.background = color;
    this.flashV = peak; this.flashRate = peak / Math.max(0.016, ms / 1000);
    this.el.flash.style.opacity = String(peak);
  },
  fade(to, ms = 600) {
    this.fadeTarget = to; this.fadeRate = 1 / Math.max(0.001, ms / 1000);
    if (ms <= 0) { this.fadeV = to; this.el.fade.style.opacity = String(to); }
  },
  // frame-driven overlays (robust against slow frames and pauses)
  tick(dt) {
    // touch: held upright, the phone asks to be turned (a game in progress pauses)
    const tall = (Input.mode === 'touch' || TOUCH_DEV) && innerHeight > innerWidth * 1.05;
    if (tall !== this._tall) {
      this._tall = tall; this.el.rotate.classList.toggle('hidden', !tall);
      if (tall && G.state === 'play' && !G.paused && !this.panelOpen && G.phase !== 'ending') Game.pause();
    }
    if (this.flashV > 0) { this.flashV = Math.max(0, this.flashV - this.flashRate * dt); this.el.flash.style.opacity = this.flashV.toFixed(3); }
    if (this.fadeV !== this.fadeTarget) {
      const d = this.fadeTarget - this.fadeV, step = this.fadeRate * dt;
      this.fadeV = Math.abs(d) <= step ? this.fadeTarget : this.fadeV + Math.sign(d) * step;
      this.el.fade.style.opacity = this.fadeV.toFixed(3);
    }
  },

  boss(name, frac) {
    if (!name) { this.el.boss.classList.add('hidden'); this.el.root.classList.remove('bossfight'); return; }
    this.el.boss.classList.remove('hidden'); this.el.root.classList.add('bossfight');
    if (this.el.bossName.textContent !== name) this.el.bossName.textContent = name;
    const f = clamp(frac, 0, 1) * 100;
    this.el.bossFill.style.width = f + '%';
    this.el.bossLag.style.width = f + '%';
  },

  wave(n) {
    if (n == null) { this.el.wave.classList.add('hidden'); return; }
    this.el.wave.classList.remove('hidden');
    if (this.el.wave._n !== n) { this.el.wave._n = n; this.el.wave.textContent = 'HAUNTS LEFT  ' + n; }
  },

  osd(clockStr, mode) {
    if (this.el.osdClock.textContent !== clockStr) this.el.osdClock.textContent = clockStr;
    if (mode && this.el.osdMode._m !== mode) { this.el.osdMode._m = mode; this.el.osdMode.innerHTML = mode; }
  },

  reticle(x, y, show) {
    const r = this.el.reticle;
    if (!show) { if (!r.classList.contains('hidden')) r.classList.add('hidden'); return; }
    r.classList.remove('hidden');
    r.style.transform = `translate(${x}px,${y}px)`;
  },
  reticleHit() {
    const r = this.el.reticle; r.classList.add('hit');
    clearTimeout(this._rh); this._rh = setTimeout(() => r.classList.remove('hit'), 90);
  },

  // ---------------- menus ----------------
  setMenu(container, items, onKeyBack) {
    container.innerHTML = '';
    this.menuItems = [];
    items.forEach((it) => {
      if (it.html) { const d = document.createElement('div'); d.innerHTML = it.html; container.appendChild(d); return; }
      const b = document.createElement('button');
      b.className = 'mbtn'; b.type = 'button'; b.textContent = it.label;
      if (it.fs) b.dataset.fs = '1';
      if (it.disabled) b.disabled = true;
      b.addEventListener('click', (e) => { e.stopPropagation(); Sfx.ui('click'); it.action(); });
      b.addEventListener('mouseenter', () => { this.menuIndex = this.menuItems.indexOf(b); this.highlightMenu(); Sfx.ui('hover'); });
      container.appendChild(b);
      if (!it.disabled) this.menuItems.push(b);
    });
    this.menuIndex = 0; this.menuGrid = false;
    this.onPanelKey = onKeyBack || null;
    this.highlightMenu();
  },
  highlightMenu(scroll = false) {
    this.menuItems.forEach((b, i) => b.classList.toggle('sel', i === this.menuIndex));
    // (stepping through a long panel scrolls to what is picked: a gamepad has no wheel)
    const b = this.menuItems[this.menuIndex];
    if (scroll && b && this.panelOpen && b.scrollIntoView) { try { b.scrollIntoView({ block: 'nearest' }); } catch (e) { /* ignore */ } }
  },
  // menu keys: up / down step through the items, left / right change a setting (an options row) or step through a
  // grid of photos, Enter / Space picks
  menuKey(code) {
    if (!this.menuItems.length) return false;
    const it = this.menuItems[this.menuIndex];
    if ((code === 'ArrowLeft' || code === 'ArrowRight' || code === 'KeyA' || code === 'KeyD') && (it && it._adj || this.menuGrid)) {
      const dir = code === 'ArrowRight' || code === 'KeyD' ? 1 : -1;
      if (it && it._adj) { it._adj(dir, false); return true; }
      this.menuIndex = (this.menuIndex + dir + this.menuItems.length) % this.menuItems.length; this.highlightMenu(true); Sfx.ui('hover'); return true;
    }
    if (code === 'ArrowDown' || code === 'KeyS') { this.menuIndex = (this.menuIndex + 1) % this.menuItems.length; this.highlightMenu(true); Sfx.ui('hover'); return true; }
    if (code === 'ArrowUp' || code === 'KeyW') { this.menuIndex = (this.menuIndex - 1 + this.menuItems.length) % this.menuItems.length; this.highlightMenu(true); Sfx.ui('hover'); return true; }
    if (code === 'Enter' || code === 'Space') { if (it && it._adj) { it._adj(1, true); return true; } if (it) it.click(); return true; }
    return false;
  },

  showTitleScreen(hasSave) {
    this.el.title.classList.remove('hidden');
    const items = [];
    if (hasSave) items.push({ id: 'cont', label: 'Continue  (photo ' + (hasSave.level + 1) + ')', action: () => Game.continueGame() });
    items.push({ id: 'new', label: 'New Game', action: () => Game.newGame() });
    items.push({ id: 'howto', label: 'How To Play', action: () => this.showControls(() => this.closePanel()) });
    items.push({ id: 'lost', label: `Lost Photos  ${Lost.count()}/${LOST_DEFS.length}`, action: () => Lost.showGallery(() => this.closePanel()) });
    items.push({ id: 'opt', label: 'Options', action: () => this.showOptions(() => this.closePanel()) });
    if (FS.can()) items.push({ id: 'fs', label: FS.label(), fs: true, action: () => FS.toggle() });
    items.push({ id: 'cred', label: 'Credits', action: () => this.showCredits(() => this.closePanel()) });
    // (back from a panel, the item that opened it is still the one picked)
    for (const it of items) { const a = it.action; it.action = () => { this._titleKey = it.id; a(); }; }
    this.setMenu(this.el.tmenu, items);
    const i = items.findIndex((it) => it.id === this._titleKey);
    if (i > 0) { this.menuIndex = i; this.highlightMenu(); }
  },
  hideTitleScreen() { this.el.title.classList.add('hidden'); },

  openPanel(html, name) {
    this.el.panel.classList.remove('hidden');
    this.el.panelCard.innerHTML = html;
    this.panelOpen = name;
    return this.el.panelCard;
  },
  closePanel() {
    this.el.panel.classList.add('hidden');
    this.panelOpen = null;
    this.menuItems = [];
    if (G.state === 'title') this.showTitleScreen(Game.getSave());
  },

  showControls(back) {
    this._ctlBack = back;
    const m = Input.mode, k = (x) => `<span class="kc">${x}</span>`, P = padKey;
    const row = (keys, d) => `<span class="k">${keys}</span><span class="d">${d}</span>`;
    let rows;
    if (m === 'pad') {
      rows = `<h4>IN THE HOUSE (GAMEPAD)</h4>
        ${row(P('LS'), 'Move')}
        ${row(P('RS'), 'Aim (your flashlight follows)')}
        ${row(P('RT'), 'Attack / fire')}
        ${row(P('B') + ' ' + P('LT'), 'Dodge roll (you can\'t be hurt mid-roll)')}
        ${row(P('LB') + ' ' + P('RB') + ' ' + k('D-pad'), 'Switch weapon')}
        ${row(P('X'), 'Reload')}
        ${row(P('A'), 'Interact / pick up')}
        ${row(P('Y'), 'Look at the polaroid (first person)')}
        ${row(P('View'), 'Photo album (hold)')}
        ${row(P('Menu'), 'Pause')}
        <h4>LOOKING AT THE PHOTO</h4>
        ${row(P('RS'), 'Look around')}
        ${row(P('LS'), 'Step slowly')}
        ${row('hold ' + P('LT') + ' / ' + P('RT'), 'Hold the photo up and compare it to the room')}
        ${row(P('Y') + ' ' + P('B'), 'Put the photo away')}`;
    } else if (m === 'touch') {
      rows = `<h4>IN THE HOUSE (TOUCH)</h4>
        ${row(k('Left thumb'), 'Move: put it down anywhere on the left and slide')}
        ${row(k('Right thumb'), 'Aim and attack: slide it the way you want to hit. Pumpkin bombs fly when you let go')}
        ${row(k('Quick tap'), 'A quick tap on the right strikes at the nearest haunt')}
        ${row(k('ROLL'), 'Dodge roll (you can\'t be hurt mid-roll)')}
        ${row(k('Tap a weapon'), 'Switch weapon')}
        ${row(k('USE') + ' ' + k('Tap the prompt'), 'Interact / pick up')}
        ${row(k('Tap the polaroid'), 'Look at it (first person). Hold it for the photo album')}
        ${row(k('II'), 'Pause')}
        <h4>LOOKING AT THE PHOTO</h4>
        ${row(k('Right thumb'), 'Slide to look around')}
        ${row(k('Left thumb'), 'Step slowly')}
        ${row(k('HOLD UP'), 'Hold it down to hold the photo up and compare it to the room')}
        ${row(k('PUT AWAY'), 'Put the photo away')}`;
    } else {
      rows = `<h4>IN THE HOUSE</h4>
        ${row(k('W') + k('A') + k('S') + k('D'), 'Move')}
        ${row(k('Mouse'), 'Aim (your flashlight follows)')}
        ${row(k('Left click'), 'Attack / fire')}
        ${row(k('Space'), 'Dodge roll (you can\'t be hurt mid-roll)')}
        ${row(k('1') + k('2') + k('3') + k('4') + ' ' + k('Wheel') + ' ' + k('Q'), 'Switch weapon')}
        ${row(k('R'), 'Reload')}
        ${row(k('E'), 'Interact / pick up')}
        ${row(k('F'), 'Look at the polaroid (first person)')}
        ${row(k('Tab'), 'Photo album')}
        ${row(k('P') + ' ' + k('Esc'), 'Pause')}
        <h4>LOOKING AT THE PHOTO</h4>
        ${row(k('Mouse') + ' ' + k('&larr;') + k('&rarr;'), 'Look around')}
        ${row(k('W') + k('A') + k('S') + k('D'), 'Step slowly')}
        ${row(k('Right click') + ' / ' + k('Space'), 'Hold the photo up and compare it to the room')}
        ${row(k('F'), 'Put the photo away')}`;
    }
    const also = m === 'touch' ? 'Best experienced on a computer with a keyboard and mouse, or a gamepad.' : 'Keyboard and mouse, gamepad and touch all work: the controls shown follow what you use.';
    const c = this.openPanel(`<h2>How To Play</h2>
      <p>A stranger rang the bell and left a stack of polaroids. Find where each photo was taken, hold it up and line it up with the room. Whatever is in the picture comes out.</p>
      <div class="keys">${rows}</div>
      <p class="also">${also}</p>
      <nav id="hy-pmenu"></nav>`, 'controls');
    this.setMenu(c.querySelector('#hy-pmenu'), [{ label: 'Back', action: back }], back);
  },

  showCredits(back) {
    const url = 'https://www.linkedin.com/in/oskari-olli/';
    const c = this.openPanel(`<h2>Credits</h2>
      <div class="cred">
        <h4>ABOUT THE CREATOR</h4>
        <div class="by">Created by <b>Oskari Olli</b></div>
        <p>Indie game creator from Finland. Making retro-inspired games for players who crave nostalgia.</p>
        <p>You can reach me on:</p>
        <p class="reach"><span>LinkedIn:</span><a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a></p>
        <h4>THANK YOU</h4>
        <p>Thanks for playing! If you enjoyed this game, feel free to check out my other projects.</p>
      </div>
      <nav id="hy-pmenu"></nav>`, 'credits');
    const a = c.querySelector('.cred a');
    a.addEventListener('click', (e) => { e.stopPropagation(); Sfx.ui('click'); });
    a.addEventListener('mouseenter', () => Sfx.ui('hover'));
    this.setMenu(c.querySelector('#hy-pmenu'), [
      { label: 'Visit LinkedIn', action: () => { try { window.open(url, '_blank', 'noopener'); } catch (e) { /* popups blocked */ } } },
      { label: 'Back', action: back },
    ], back);
    this.menuIndex = 1; this.highlightMenu();
  },

  showOptions(back) {
    const c = this.openPanel(`<h2>Options</h2>
      <div class="row"><label for="hy-o-master">Master volume</label><input id="hy-o-master" type="range" min="0" max="1" step="0.05" value="${SETTINGS.master}"></div>
      <div class="row"><label for="hy-o-music">Music</label><input id="hy-o-music" type="range" min="0" max="1" step="0.05" value="${SETTINGS.music}"></div>
      <div class="row"><label for="hy-o-sfx">Sound effects</label><input id="hy-o-sfx" type="range" min="0" max="1" step="0.05" value="${SETTINGS.sfx}"></div>
      <div class="row"><label for="hy-o-sens">Look sensitivity</label><input id="hy-o-sens" type="range" min="0.3" max="2.5" step="0.05" value="${SETTINGS.sens}"></div>
      <div class="row"><label>Graphics quality</label><div class="seg" id="hy-o-qual"><button data-v="0">Low</button><button data-v="1">Medium</button><button data-v="2">High</button></div></div>
      <div class="row"><label>Picture</label><div class="seg" id="hy-o-retro"><button data-v="0">HD</button><button data-v="1">VHS</button><button data-v="2">Chunky</button></div></div>
      <div class="row"><label>Screen shake</label><div class="seg" id="hy-o-shake"><button data-v="0">Off</button><button data-v="0.5">Low</button><button data-v="1">Full</button></div></div>
      <div class="row"><label>Difficulty</label><div class="seg" id="hy-o-diff"><button data-v="0">Normal</button><button data-v="1">Easy</button></div></div>
      <div class="row"><label>FPS counter</label><div class="seg" id="hy-o-fps"><button data-v="0">Off</button><button data-v="1">On</button></div></div>
      <nav id="hy-pmenu"></nav>`, 'options');
    const bindRange = (id, key, fn) => {
      const i = c.querySelector(id);
      i.addEventListener('input', () => { SETTINGS[key] = parseFloat(i.value); saveSettings(); if (fn) fn(); });
    };
    bindRange('#hy-o-master', 'master', () => Sfx.applyVolumes());
    bindRange('#hy-o-music', 'music', () => Sfx.applyVolumes());
    bindRange('#hy-o-sfx', 'sfx', () => { Sfx.applyVolumes(); Sfx.ui('hover'); });
    bindRange('#hy-o-sens', 'sens');
    const seg = (id, get, set) => {
      const box = c.querySelector(id);
      const refresh = () => box.querySelectorAll('button').forEach((b) => b.classList.toggle('on', String(get()) === b.dataset.v));
      box.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => { set(b.dataset.v); saveSettings(); refresh(); Sfx.ui('click'); }));
      refresh();
    };
    seg('#hy-o-retro', () => SETTINGS.retro, (v) => { SETTINGS.retro = parseInt(v, 10); Render.resize(); this.applyScan(); Tex.applyFilter(); });
    seg('#hy-o-qual', () => SETTINGS.quality, (v) => {
      SETTINGS.quality = parseInt(v, 10); Render.dyn = 1; Main.drsReset(); Render.resize(); Player.applyShadowQuality();
      if (Assets.texScaleFor(SETTINGS.quality) !== Assets.texScale) UI.toast('Texture detail changes the next time the game loads', 2600);
    });
    seg('#hy-o-shake', () => SETTINGS.shake, (v) => { SETTINGS.shake = parseFloat(v); });
    seg('#hy-o-diff', () => (SETTINGS.easy ? 1 : 0), (v) => { SETTINGS.easy = v === '1'; });
    seg('#hy-o-fps', () => (SETTINGS.fps ? 1 : 0), (v) => { SETTINGS.fps = v === '1'; this.el.fps.classList.toggle('hidden', !SETTINGS.fps); });
    this.setMenu(c.querySelector('#hy-pmenu'), [{ label: 'Back', action: back }], back);
    // every row can be picked with the keys or a gamepad: left / right changes it (Enter steps through a choice)
    const rows = [...c.querySelectorAll('.row')];
    for (const r of rows) {
      const inp = r.querySelector('input[type=range]'), box = r.querySelector('.seg');
      r._adj = (dir, wrap) => {
        if (inp) {
          const st = parseFloat(inp.step) || 0.05, lo = parseFloat(inp.min), hi = parseFloat(inp.max);
          const v = clamp(Math.round((parseFloat(inp.value) + dir * st * 2) / st) * st, lo, hi);
          inp.value = String(+v.toFixed(3)); inp.dispatchEvent(new Event('input')); Sfx.ui('hover');
        } else if (box) {
          const bs = [...box.querySelectorAll('button')];
          let i = bs.findIndex((b) => b.classList.contains('on')) + dir;
          i = wrap ? (i + bs.length) % bs.length : clamp(i, 0, bs.length - 1);
          if (!bs[i].classList.contains('on')) bs[i].click();
        }
      };
      r.addEventListener('pointerenter', () => { this.menuIndex = this.menuItems.indexOf(r); this.highlightMenu(); });
    }
    this.menuItems = [...rows, ...this.menuItems];
    this.menuIndex = rows.length; this.highlightMenu();
  },

  showPause() {
    const c = this.openPanel(`<h2>Paused</h2><p>${G.objective ? 'To do: ' + G.objective : ''}</p><nav id="hy-pmenu"></nav>`, 'pause');
    this.setMenu(c.querySelector('#hy-pmenu'), [
      { label: 'Resume', action: () => Game.resume() },
      { label: 'How To Play', action: () => this.showControls(() => this.showPause()) },
      { label: `Lost photos  ${Lost.count()}/${LOST_DEFS.length}`, action: () => Lost.showGallery(() => this.showPause()) },
      { label: 'Options', action: () => this.showOptions(() => this.showPause()) },
      ...(FS.can() ? [{ label: FS.label(), fs: true, action: () => FS.toggle() }] : []),
      { label: 'Restart this photo', action: () => { this.closePanel(); Game.retryCheckpoint(); }, disabled: !Game.checkpoint },
      { label: 'Quit to title', action: () => { this.closePanel(); Game.toTitle(); } },
    ], () => Game.resume());
  },

  showGameOver() {
    const c = this.openPanel(`<h2 class="red">You're in the picture now</h2>
      <p>Your photo joins the others in the basement. Or does it? The polaroid is still developing.</p><nav id="hy-pmenu"></nav>`, 'gameover');
    this.setMenu(c.querySelector('#hy-pmenu'), [
      { label: 'Try again from this photo', action: () => { this.closePanel(); Game.retryCheckpoint(); } },
      { label: 'Quit to title', action: () => { this.closePanel(); Game.toTitle(); } },
    ]);
  },

  showUpgrade(choices, cb) {
    const cards = choices.map((u, i) => `<button class="ucard" type="button" data-i="${i}"><div class="ph">${ICONS[u.icon] || u.glyph}</div><div class="nm">${u.name}</div><div class="ds">${u.desc}</div><div class="kk">[${i + 1}]</div></button>`).join('');
    const c = this.openPanel(`<h2>A Gift From The Photo</h2><p>Something stayed behind when it tore. Keep one.</p><div class="cards">${cards}</div>`, 'upgrade');
    const btns = [...c.querySelectorAll('.ucard')];
    this.menuItems = btns; this.menuIndex = 0;
    const choose = (i) => { if (this.panelOpen !== 'upgrade') return; Sfx.ui('pick'); this.closePanel(); cb(choices[i]); };
    btns.forEach((b, i) => {
      b.addEventListener('click', () => choose(i));
      b.addEventListener('mouseenter', () => { this.menuIndex = i; btns.forEach((x, k) => x.classList.toggle('sel', k === i)); Sfx.ui('hover'); });
    });
    btns[0].classList.add('sel');
    this.onPanelKey = null;
    this._upgradeChoose = choose;
  },

  showEnding(stats, last = null) {
    // (the last lost photo, the one that fell out of the stack on the porch)
    const extra = last ? `<div class="secret">${Lost.card(last)}<div><p style="margin:0 0 .5em">One more photo fell out of the stack.</p>${Lost.backHTML(last)}</div></div>` : '';
    const c = this.openPanel(`<h2>These Belong Here</h2>
      <p>The sun is coming up over Maple Street. Somewhere down the block, a doorbell rings.</p>${extra}
      <div class="stats">
        <span>Time in the house</span><span>${fmtTime(stats.time)}</span>
        <span>Haunts banished</span><span>${stats.kills}</span>
        <span>Damage taken</span><span>${Math.round(stats.damage)}</span>
        <span>Times you became a photo</span><span>${stats.deaths}</span>
      </div>
      <p style="margin-top:1em;font-family:'Permanent Marker',cursive;color:#ff9a3d">HOW YOU HAUNT ME // Look At This Polaroid</p>
      <p style="font-size:.9em;color:#8d8372">Made for a Halloween jam. Thanks for playing.</p>
      <nav id="hy-pmenu"></nav>`, 'ending');
    this.setMenu(c.querySelector('#hy-pmenu'), [
      { label: 'Play again', action: () => { this.closePanel(); Game.newGame(); } },
      { label: 'Title screen', action: () => { this.closePanel(); Game.toTitle(); } },
    ]);
  },

  showAlbum(on) {
    const a = this.el.album;
    if (!on) { a.classList.add('hidden'); return; }
    a.classList.remove('hidden');
    a.innerHTML = '<div class="title">Five Photographs</div>' + Photos.list.map((p, i) => {
      const img = p.developed >= 1 && p.thumb ? `background-image:url(${p.thumb})` : '';
      const cls = ['ap', i === G.level ? 'cur' : '', p.done ? 'done' : ''].join(' ');
      const rot = [-3, 2, -1.5, 3, -2][i];
      const cap = p.developed >= 1 ? p.title : '. . .';
      return `<div class="${cls}" style="transform:rotate(${rot}deg)"><div class="img" style="${img}"></div><div class="cap">${cap}</div></div>`;
    }).join('') + Lost.albumRow();
  },
};

// =====================================================================
//  AUDIO: WebAudio synthesized sound effects + music player
// =====================================================================
const Sfx = {
  ctx: null,
  ready: false,
  last: {},
  music: { tracks: {}, cur: null, curName: null, want: null, duck: 1 },
  effects: {},

  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = this.ctx = new AC();
    this.master = ctx.createGain();
    this.comp = ctx.createDynamicsCompressor();
    this.comp.threshold.value = -14; this.comp.knee.value = 12; this.comp.ratio.value = 4;
    this.comp.attack.value = 0.004; this.comp.release.value = 0.2;
    this.master.connect(this.comp); this.comp.connect(ctx.destination);
    this.musicBus = ctx.createGain(); this.musicDuck = ctx.createGain();
    this.musicBus.connect(this.musicDuck); this.musicDuck.connect(this.master);
    this.sfxBus = ctx.createGain();
    this.muffleF = ctx.createBiquadFilter(); this.muffleF.type = 'lowpass'; this.muffleF.frequency.value = 20000; this.muffleF.Q.value = 0.5;
    this.sfxBus.connect(this.muffleF); this.muffleF.connect(this.master);
    this.ambBus = ctx.createGain(); this.ambBus.connect(this.muffleF);
    // reverb
    this.reverb = ctx.createConvolver();
    this.reverb.buffer = this._impulse(2.6, 2.4);
    this.revSend = ctx.createGain(); this.revSend.gain.value = 0.9;
    this.revSend.connect(this.reverb); this.reverb.connect(this.muffleF);
    // distortion
    this.dist = ctx.createWaveShaper();
    const curve = new Float32Array(1024);
    for (let i = 0; i < 1024; i++) { const x = i / 512 - 1; curve[i] = Math.tanh(x * 3.2); }
    this.dist.curve = curve; this.dist.connect(this.sfxBus);
    // noise buffers
    this.white = this._noiseBuf(2, 'white');
    this.brown = this._noiseBuf(4, 'brown');
    this._startAmbience();
    this.applyVolumes();
    this.ready = true;
    this.loadMusic();
    this.loadEffects();
  },

  applyVolumes() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.master.gain.setTargetAtTime(this.isAway ? 0 : SETTINGS.master, t, 0.05);
    this.musicBus.gain.setTargetAtTime(SETTINGS.music * 0.8, t, 0.05);
    this.sfxBus.gain.setTargetAtTime(SETTINGS.sfx, t, 0.05);
    this.ambBus.gain.setTargetAtTime(SETTINGS.sfx * 0.9, t, 0.05);
    this.revSend.gain.setTargetAtTime(0.9 * SETTINGS.sfx, t, 0.05);
  },

  // the arcade machine (Arcade): the house goes quiet while you play, and its sound comes back when you leave
  away(on, delay = 0) {
    this.isAway = !!on;
    if (!this.ctx) return;
    const t = this.ctx.currentTime, g = this.master.gain;
    g.cancelScheduledValues(t); g.setValueAtTime(g.value, t);
    g.setTargetAtTime(on ? 0 : SETTINGS.master, t + delay, on ? 0.16 : 0.4);
  },

  _impulse(sec, decay) {
    const ctx = this.ctx, len = Math.floor(ctx.sampleRate * sec);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        const t = i / len;
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, decay) * (i < 90 ? i / 90 : 1);
      }
      // a few early reflections
      for (let k = 0; k < 6; k++) { const p = Math.floor(ctx.sampleRate * (0.012 + k * 0.017 + ch * 0.004)); if (p < len) d[p] += 0.5 / (k + 1); }
    }
    return buf;
  },

  _noiseBuf(sec, kind) {
    const ctx = this.ctx, len = Math.floor(ctx.sampleRate * sec);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      if (kind === 'brown') { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; } else d[i] = w;
    }
    return buf;
  },

  // ---- low level voices ----
  _out(node, o) {
    const ctx = this.ctx;
    let n = node;
    if (o.pan) { const p = ctx.createStereoPanner(); p.pan.value = clamp(o.pan, -1, 1); n.connect(p); n = p; }
    if (o.distort) n.connect(this.dist); else n.connect(o.dest || this.sfxBus);
    if (o.rev) { const r = ctx.createGain(); r.gain.value = o.rev; n.connect(r); r.connect(this.revSend); }
  },

  osc(type, f0, f1, dur, vol, o = {}) {
    if (!this.ready) return;
    const ctx = this.ctx, t0 = ctx.currentTime + (o.delay || 0);
    const os = ctx.createOscillator(); os.type = type;
    os.frequency.setValueAtTime(Math.max(1, f0), t0);
    if (f1 && f1 !== f0) {
      if (o.linear) os.frequency.linearRampToValueAtTime(Math.max(1, f1), t0 + dur);
      else os.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t0 + dur);
    }
    if (o.detune) os.detune.value = o.detune;
    let src = os;
    if (o.vib) { const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = o.vib; lg.gain.value = o.vibAmt || f0 * 0.03; l.connect(lg); lg.connect(os.frequency); l.start(t0); l.stop(t0 + dur + 0.1); }
    if (o.filter) { const f = ctx.createBiquadFilter(); f.type = o.filter; f.frequency.value = o.ff || 1000; f.Q.value = o.q || 1; if (o.ff1) f.frequency.exponentialRampToValueAtTime(o.ff1, t0 + dur); src.connect(f); src = f; }
    const g = ctx.createGain();
    const a = o.attack || 0.004;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + a);
    if (o.hold) g.gain.setValueAtTime(vol, t0 + a + o.hold);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(g); this._out(g, o);
    os.start(t0); os.stop(t0 + dur + 0.05);
  },

  noise(dur, vol, o = {}) {
    if (!this.ready) return;
    const ctx = this.ctx, t0 = ctx.currentTime + (o.delay || 0);
    const s = ctx.createBufferSource(); s.buffer = o.brown ? this.brown : this.white;
    s.playbackRate.value = o.rate || 1;
    const off = Math.random() * 1.5;
    let n = s;
    if (o.ftype !== 'none') {
      const f = ctx.createBiquadFilter(); f.type = o.ftype || 'lowpass';
      f.frequency.setValueAtTime(o.f0 || 1200, t0); f.Q.value = o.q || 0.8;
      if (o.f1) f.frequency.exponentialRampToValueAtTime(o.f1, t0 + dur);
      n.connect(f); n = f;
    }
    const g = ctx.createGain(); const a = o.attack || 0.003;
    g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(vol, t0 + a);
    if (o.hold) g.gain.setValueAtTime(vol, t0 + a + o.hold);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    if (o.am) { // amplitude modulation for crackle / motors
      const l = ctx.createOscillator(), lg = ctx.createGain(); l.type = 'square'; l.frequency.value = o.am; lg.gain.value = 0.5;
      const mg = ctx.createGain(); mg.gain.value = 0.5; l.connect(lg); lg.connect(mg.gain); n.connect(mg); n = mg; l.start(t0); l.stop(t0 + dur + 0.1);
    }
    n.connect(g); this._out(g, o);
    s.start(t0, off, dur + 0.1);
  },

  // rate limiter: returns false when the same sound played too recently
  gate(name, gap) {
    const t = performance.now() / 1000;
    if (this.last[name] && t - this.last[name] < gap) return false;
    this.last[name] = t; return true;
  },

  // spatial helpers (listener = player / camera focus)
  spatial(x, z) {
    if (typeof Cam === 'undefined') return { pan: 0, vol: 1 };
    const lx = Cam.focus.x, lz = Cam.focus.z;
    const dx = x - lx, dz = z - lz;
    const d = Math.sqrt(dx * dx + dz * dz);
    const right = Cam.rightVec;
    const pan = clamp((dx * right.x + dz * right.z) / 9, -1, 1) * 0.75;
    const vol = 1 / (1 + Math.max(0, d - 4) / 6);
    return { pan, vol };
  },

  muffle(on, sec = 0.6) {
    if (!this.ready) return;
    const t = this.ctx.currentTime;
    this.muffleF.frequency.cancelScheduledValues(t);
    this.muffleF.frequency.setTargetAtTime(on ? 520 : 20000, t, sec / 3);
    this.musicDuck.gain.setTargetAtTime(on ? 0.18 : this.music.duck, t, sec / 3);
  },
  duck(v, sec = 0.8) {
    this.music.duck = v;
    if (!this.ready) return;
    this.musicDuck.gain.setTargetAtTime(v, this.ctx.currentTime, sec / 3);
  },

  // ---- music ----
  loadMusic() {
    // a single-file build can carry the music inline (base64), so nothing has to be fetched
    const EMB = (typeof window !== 'undefined' && window.HYHM_EMBED && window.HYHM_EMBED.music) || null;
    for (const [k, url] of Object.entries(ASSETS.music)) {
      if (EMB && EMB[k]) {
        let bytes = null;
        try { const bin = atob(EMB[k]); bytes = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i); EMB[k] = null; } catch (e) { bytes = null; }
        if (bytes) {
          this.ctx.decodeAudioData(bytes.buffer).then((buf) => {
            this.music.tracks[k] = buf;
            if (this.music.want === k && this.music.curName !== k) this.playMusic(k, 2);
          }).catch(() => { /* music is optional */ });
          continue;
        }
      }
      if (!url) continue;
      fetch(assetURL(url)).then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error('missing')))).then((b) => this.ctx.decodeAudioData(b)).then((buf) => {
        this.music.tracks[k] = buf;
        if (this.music.want === k && this.music.curName !== k) this.playMusic(k, 2);
      }).catch(() => { /* music is optional */ });
    }
  },
  loadEffects() {
    for (const [name, url] of Object.entries(ASSETS.effects)) {
      fetch(assetURL(url))
        .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error('missing'))))
        .then((bytes) => this.ctx.decodeAudioData(bytes))
        .then((buffer) => { this.effects[name] = buffer; })
        .catch(() => { /* synthesized fallback stays available */ });
    }
  },
  playSample(name, pan = 0, vol = 1, rate = 1, reverb = 0, bass = 0) {
    if (!this.ready) return false;
    const buffer = this.effects[name];
    if (!buffer) return false;
    const ctx = this.ctx, source = ctx.createBufferSource(), gain = ctx.createGain();
    source.buffer = buffer;
    source.playbackRate.setValueAtTime(rate, ctx.currentTime);
    gain.gain.setValueAtTime(Math.max(0, vol), ctx.currentTime);
    if (bass !== 0) {
      const lowShelf = ctx.createBiquadFilter();
      lowShelf.type = 'lowshelf';
      lowShelf.frequency.setValueAtTime(160, ctx.currentTime);
      lowShelf.gain.setValueAtTime(bass, ctx.currentTime);
      source.connect(lowShelf);
      lowShelf.connect(gain);
    } else {
      source.connect(gain);
    }
    let output = gain;
    const sp = this._sp;
    if (sp && typeof Cam !== 'undefined' && ctx.createPanner) {
      // 3D HRTF placement relative to the listener (camera focus): direction comes from the panner,
      // distance loudness is already in vol, and far sounds lose some treble (air / walls)
      const dx = sp.x - Cam.focus.x, dz = sp.z - Cam.focus.z;
      const R = Cam.rightVec, F = Cam.fwdVec;
      const lx = dx * R.x + dz * R.z, lf = dx * F.x + dz * F.z;
      const d = Math.hypot(lx, lf);
      const panner = ctx.createPanner();
      panner.panningModel = 'HRTF'; panner.distanceModel = 'linear';
      panner.refDistance = 1; panner.maxDistance = 10000; panner.rolloffFactor = 0;
      const s = d < 0.5 ? 0 : 1 / 3; // keep a gentle scale so near sounds are not hard-panned
      const px = lx * s, pz = -lf * s, py = d < 0.5 ? 0.3 : 0;
      if (panner.positionX) { panner.positionX.value = px; panner.positionY.value = py; panner.positionZ.value = pz; }
      else panner.setPosition(px, py, pz);
      output.connect(panner); output = panner;
      if (d > 5) {
        const air = ctx.createBiquadFilter(); air.type = 'lowpass';
        air.frequency.value = clamp(18000 / (1 + (d - 5) * 0.35), 2500, 18000);
        output.connect(air); output = air;
      }
    } else if (pan) {
      const panner = ctx.createStereoPanner();
      panner.pan.setValueAtTime(clamp(pan, -1, 1), ctx.currentTime);
      output.connect(panner); output = panner;
    }
    output.connect(this.sfxBus);
    if (reverb > 0) {
      const send = ctx.createGain(); send.gain.value = reverb;
      output.connect(send); send.connect(this.revSend);
    }
    source.start();
    return true;
  },
  playMusic(name, fade = 1.5) {
    this.music.want = name;
    if (!this.ready) return;
    if (this.music.curName === name) return;
    const ctx = this.ctx, now = ctx.currentTime;
    if (this.music.cur) {
      const c = this.music.cur;
      c.g.gain.cancelScheduledValues(now); c.g.gain.setValueAtTime(c.g.gain.value, now);
      c.g.gain.linearRampToValueAtTime(0.0001, now + fade);
      try { c.src.stop(now + fade + 0.1); } catch (e) { /* ignore */ }
      this.music.cur = null; this.music.curName = null;
    }
    if (!name || name === 'none') return;
    const buf = this.music.tracks[name];
    if (!buf) return; // starts when loaded
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, now); g.gain.linearRampToValueAtTime(1, now + fade);
    src.connect(g); g.connect(this.musicBus); src.start(now);
    this.music.cur = { src, g }; this.music.curName = name;
  },

  // ---- ambience ----
  _startAmbience() {
    const ctx = this.ctx;
    const s = ctx.createBufferSource(); s.buffer = this.brown; s.loop = true;
    this.windF = ctx.createBiquadFilter(); this.windF.type = 'bandpass'; this.windF.frequency.value = 400; this.windF.Q.value = 1.4;
    this.windG = ctx.createGain(); this.windG.gain.value = 0.0;
    s.connect(this.windF); this.windF.connect(this.windG); this.windG.connect(this.ambBus);
    s.start();
    const r = ctx.createBufferSource(); r.buffer = this.brown; r.loop = true; r.playbackRate.value = 0.5;
    this.roomF = ctx.createBiquadFilter(); this.roomF.type = 'lowpass'; this.roomF.frequency.value = 160;
    this.roomG = ctx.createGain(); this.roomG.gain.value = 0.0;
    r.connect(this.roomF); this.roomF.connect(this.roomG); this.roomG.connect(this.ambBus);
    r.start();
    this.ambT = 0; this.creakT = 6; this.tickT = 0;
  },
  ambience(dt, opts) {
    if (!this.ready) return;
    const t = this.ctx.currentTime;
    this.ambT += dt;
    const wind = opts.wind || 0;
    // (the wind's automation 20 times a second: setTargetAtTime glides anyway, every frame only queued events)
    this.ambA = (this.ambA || 0) - dt;
    if (this.ambA <= 0) {
      this.ambA = 0.05;
      this.windF.frequency.setTargetAtTime(330 + Math.sin(this.ambT * 0.31) * 140 + Math.sin(this.ambT * 1.7) * 40, t, 0.3);
      this.windG.gain.setTargetAtTime(wind * (0.08 + 0.05 * Math.max(0, Math.sin(this.ambT * 0.23))), t, 0.5);
      this.roomG.gain.setTargetAtTime(opts.room || 0, t, 0.5);
    }
    if (opts.creaks) {
      this.creakT -= dt;
      if (this.creakT <= 0) { this.creakT = rand(7, 18); this.creak(rand(-0.8, 0.8), 0.05 + Math.random() * 0.05); }
    }
    if (opts.clock) {
      this.tickT -= dt;
      if (this.tickT <= 0) { this.tickT = 1; this.osc('square', 2100, 1700, 0.03, 0.02 * opts.clock, { filter: 'bandpass', ff: 2500, q: 4, rev: 0.4 }); }
    }
  },

  // ---- named effects ----
  ui(kind) {
    if (!this.ready) return;
    switch (kind) {
      case 'hover': if (this.gate('uih', 0.04)) this.osc('sine', 1300, 900, 0.05, 0.04); break;
      case 'click': this.osc('square', 520, 520, 0.05, 0.05, { filter: 'lowpass', ff: 2500 }); this.osc('square', 820, 820, 0.07, 0.05, { delay: 0.05, filter: 'lowpass', ff: 2500 }); break;
      case 'type': if (this.gate('uit', 0.03)) this.noise(0.025, 0.05, { ftype: 'bandpass', f0: 2800, q: 2 }); break;
      case 'note': this.noise(0.22, 0.08, { ftype: 'bandpass', f0: 2200, f1: 1200, q: 1.5, attack: 0.03 }); break;
      case 'pick': [880, 1320, 1760].forEach((f, i) => this.osc('sine', f, f, 0.5, 0.08, { delay: i * 0.07, rev: 0.4 })); break;
      case 'pause': this.osc('triangle', 300, 200, 0.2, 0.08); break;
      // a quarter into the arcade machine: it rattles down the slot, the machine chimes
      case 'coin':
        for (let i = 0; i < 3; i++) this.noise(0.03, 0.06, { ftype: 'bandpass', f0: 4200 - i * 600, q: 6, delay: i * 0.045 });
        this.osc('square', 988, 988, 0.07, 0.045, { delay: 0.16, filter: 'lowpass', ff: 3200 });
        this.osc('square', 1319, 1319, 0.26, 0.045, { delay: 0.23, filter: 'lowpass', ff: 3200 });
        break;
    }
  },

  bell(f, delay, vol = 0.22) {
    const parts = [[1, 1], [2.0, 0.5], [2.76, 0.35], [5.4, 0.18], [8.93, 0.08]];
    parts.forEach(([m, a]) => this.osc('sine', f * m, f * m, 2.4 / Math.sqrt(m), vol * a, { delay, rev: 0.7, attack: 0.002 }));
  },
  doorbell() { this.bell(659.3, 0, 0.2); this.bell(523.3, 0.62, 0.22); },

  creak(pan = 0, vol = 0.08) {
    if (!this.ready) return;
    const ctx = this.ctx, t0 = ctx.currentTime, dur = rand(0.6, 1.3);
    const o = ctx.createOscillator(); o.type = 'sawtooth';
    const base = rand(70, 140);
    o.frequency.setValueAtTime(base, t0);
    for (let k = 1; k < 10; k++) o.frequency.linearRampToValueAtTime(base * rand(0.8, 1.35), t0 + dur * k / 10);
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = rand(700, 1300); f.Q.value = 6;
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(vol, t0 + 0.08);
    g.gain.setValueAtTime(vol, t0 + dur * 0.7); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(f); f.connect(g); this._out(g, { pan, rev: 0.5 });
    o.start(t0); o.stop(t0 + dur + 0.05);
  },

  step(surface, x, z, vol = 1) {
    if (!this.ready || !this.gate('step', 0.08)) return;
    const s = x !== undefined ? this.spatial(x, z) : { pan: 0, vol: 1 };
    this._sp = x !== undefined ? { x, z } : null;
    const played = surface === 'wood' && this.playSample('woodStep', s.pan, 0.42 * vol * s.vol, rand(0.93, 1.07), 0.12);
    this._sp = null;
    if (played) return;
    const f = { wood: 750, tile: 1600, carpet: 380, stone: 1300, grass: 500 }[surface] || 700;
    this.noise(0.07, 0.07 * vol * s.vol, { ftype: surface === 'tile' ? 'bandpass' : 'lowpass', f0: f, q: 1.2, pan: s.pan });
    this.osc('sine', 130, 60, 0.06, (surface === 'carpet' ? 0.03 : 0.06) * vol * s.vol, { pan: s.pan });
  },

  play(name, x, z, vmul = 1, opt = null) {
    if (!this.ready) return;
    let pan = 0, v = vmul;
    if (typeof x === 'number' && typeof z === 'number') { const s = this.spatial(x, z); pan = s.pan; v *= s.vol; }
    this._sp = (typeof x === 'number' && typeof z === 'number') ? { x, z } : null;
    try { this._play(name, pan, v, opt); } finally { this._sp = null; }
  },
  _play(name, pan, v, opt) {
    const P = { pan };
    const pitch = (opt && opt.pitch) || 1;
    switch (name) {
      case 'enemyStep':
        if (!this.gate('enemyStep', 0.22)) return;
        if (this.playSample('enemyStep', pan, 0.34 * v, rand(0.94, 1.06), 0.08)) break;
        this.noise(0.11, 0.08 * v, { ftype: 'lowpass', f0: 520, pan }); this.osc('sine', 110, 65, 0.1, 0.05 * v, { pan });
        break;
      case 'doorOpen': this.creak(pan, 0.12 * v); this.noise(0.4, 0.05 * v, { ftype: 'lowpass', f0: 500, pan }); break;
      case 'creak': this.creak(pan, 0.11 * v); break;
      case 'doorSlam':
        this.osc('sine', 90, 35, 0.45, 0.6 * v, { pan, rev: 0.6 });
        this.noise(0.35, 0.4 * v, { ftype: 'lowpass', f0: 1400, f1: 200, pan, rev: 0.8 });
        break;
      case 'lock':
        if (this.playSample('doorLock', pan, 0.72 * v, rand(0.97, 1.03), 0.18)) break;
        this.noise(0.02, 0.25 * v, { ftype: 'highpass', f0: 2500, pan });
        this.osc('square', 1900, 1500, 0.05, 0.08 * v, { delay: 0.09, filter: 'bandpass', ff: 2400, q: 5, pan, rev: 0.4 });
        this.noise(0.03, 0.2 * v, { ftype: 'highpass', f0: 1800, delay: 0.16, pan });
        break;
      case 'unlock':
        if (this.playSample('doorUnlock', pan, 0.74 * v, rand(0.97, 1.03), 0.18)) break;
        this.noise(0.03, 0.25 * v, { ftype: 'highpass', f0: 2000, pan });
        this.osc('triangle', 1400, 2100, 0.12, 0.08 * v, { delay: 0.08, pan, rev: 0.5 });
        break;
      case 'swing': this.noise(0.2, 0.16 * v, { ftype: 'bandpass', f0: 500, f1: 2200, q: 2.2, attack: 0.03, pan }); break;
      case 'pokerSwing':
        if (this.playSample('pokerSwing', pan, 0.72 * v, rand(0.96, 1.04), 0.04)) break;
        this.noise(0.18, 0.12 * v, { ftype: 'bandpass', f0: 350, f1: 1300, q: 1.2, attack: 0.02, pan });
        this.osc('sine', 180, 100, 0.12, 0.06 * v, P);
        break;
      case 'hit':
        if (!this.gate('hit', 0.03)) return;
        this.osc('sine', 170, 55, 0.14, 0.32 * v, P); this.noise(0.08, 0.22 * v, { ftype: 'lowpass', f0: 1800, pan });
        break;
      case 'pokerHit':
        if (!this.gate('pokerHit', 0.03)) return;
        if (this.playSample('pokerHit', pan, 0.78 * v, rand(0.96, 1.04), 0.08)) break;
        this.osc('sine', 170, 55, 0.14, 0.32 * v, P);
        this.noise(0.08, 0.22 * v, { ftype: 'lowpass', f0: 1800, pan });
        break;
      case 'pokerWall': case 'pokerWood': case 'pokerStone': case 'pokerObject': {
        if (!this.gate('pokerSurf', 0.05)) return;
        const lvl = { pokerWall: 0.8, pokerWood: 0.78, pokerStone: 0.74, pokerObject: 0.5 }[name];
        if (this.playSample(name, pan, lvl * v, rand(0.95, 1.05), 0.14)) break;
        const isObject = name === 'pokerObject';
        const f0 = { pokerWall: 700, pokerWood: 1100, pokerStone: 2600, pokerObject: 850 }[name];
        this.osc('sine', name === 'pokerWood' ? 240 : 150, 70, 0.12, (isObject ? 0.14 : 0.26) * v, P);
        this.noise(0.09, (isObject ? 0.09 : 0.2) * v, { ftype: 'bandpass', f0, q: 1.2, pan });
        break;
      }
      case 'hitSoft':
        if (!this.gate('hits', 0.025)) return;
        this.osc('triangle', 420, 160, 0.07, 0.14 * v, P); this.noise(0.05, 0.1 * v, { ftype: 'bandpass', f0: 1200, pan });
        break;
      case 'nail':
        if (!this.gate('nail', 0.05)) return;
        if (this.playSample('nailgunShot', pan, 0.82 * v, rand(0.97, 1.03), 0.04)) break;
        this.noise(0.05, 0.12 * v, { ftype: 'highpass', f0: 2600, pan });
        this.osc('square', 1700, 300, 0.04, 0.07 * v, { filter: 'lowpass', ff: 3000, pan });
        break;
      case 'nailWall':
        if (!this.gate('nw', 0.04)) return;
        if (this.playSample('nailgunWall', pan, 0.82 * v, rand(0.97, 1.03), 0.08)) break;
        this.osc('triangle', 950, 620, 0.05, 0.06 * v, { pan, rev: 0.2 });
        break;
      case 'empty': this.osc('square', 900, 900, 0.03, 0.06, { filter: 'bandpass', ff: 1800, q: 3 }); break;
      case 'shotgun':
        if (this.playSample('shotgun', pan, 0.864 * v, rand(0.98, 1.02), 0.45, 3)) break;
        this.noise(0.45, 0.6 * v, { ftype: 'lowpass', f0: 5000, f1: 260, pan, rev: 0.7, distort: true });
        this.osc('sine', 110, 32, 0.35, 0.7 * v, { pan });
        break;
      case 'reload':
        if (this.playSample('reload', pan, 0.42 * v, rand(0.97, 1.03), 0.18)) break;
        this.noise(0.03, 0.15, { ftype: 'highpass', f0: 2000 });
        this.osc('square', 600, 600, 0.03, 0.05, { delay: 0.05, filter: 'bandpass', ff: 1500, q: 4 });
        break;
      case 'reloadDone':
        this.noise(0.03, 0.18, { ftype: 'highpass', f0: 1800 });
        this.osc('square', 900, 900, 0.04, 0.06, { delay: 0.07, filter: 'bandpass', ff: 2000, q: 4 });
        break;
      case 'throw': this.noise(0.25, 0.12 * v, { ftype: 'bandpass', f0: 400, f1: 1500, q: 1.5, attack: 0.05, pan }); break;
      case 'explode':
        if (this.playSample('explode', pan, 0.78 * v, rand(0.97, 1.03), 0.72)) break;
        this.noise(1.1, 0.75 * v, { ftype: 'lowpass', f0: 2600, f1: 70, pan, rev: 0.9, distort: true });
        this.osc('sine', 75, 28, 0.8, 0.8 * v, { pan });
        for (let i = 0; i < 6; i++) this.noise(0.04, 0.15 * v, { ftype: 'highpass', f0: 1500, delay: 0.1 + Math.random() * 0.6, pan });
        break;
      case 'pickupAmmo':
        if (this.playSample('pickupAmmo', 0, 0.78, rand(0.97, 1.03), 0.08)) break;
        this.noise(0.03, 0.15, { ftype: 'highpass', f0: 2500 }); this.osc('square', 700, 700, 0.04, 0.05, { delay: 0.06, filter: 'lowpass', ff: 2500 }); break;
      case 'pickupHealth':
        if (this.playSample('pickupHealth', 0, 0.78, rand(0.97, 1.03), 0.12)) break;
        [1046, 1318, 1568].forEach((f, i) => this.osc('triangle', f, f, 0.25, 0.08, { delay: i * 0.06 })); break;
      case 'pickupWeapon':
        if (this.playSample('pickupWeapon', 0, 0.8, rand(0.97, 1.03), 0.2)) break;
        [196, 247, 294].forEach((f) => this.osc('sawtooth', f, f, 0.9, 0.06, { filter: 'lowpass', ff: 1800, rev: 0.6 }));
        [784, 988, 1175, 1568].forEach((f, i) => this.osc('sine', f, f, 0.6, 0.07, { delay: 0.05 + i * 0.07, rev: 0.6 }));
        break;
      case 'hurt':
        if (this.playSample('playerHurt', 0, 0.8, rand(0.97, 1.03), 0.08)) break;
        this.osc('sine', 120, 50, 0.25, 0.5); this.noise(0.18, 0.25, { ftype: 'lowpass', f0: 900 });
        this.osc('sawtooth', 220, 140, 0.18, 0.05, { filter: 'lowpass', ff: 700 });
        break;
      case 'dodge':
        if (this.playSample('playerDodge', 0, 0.82, rand(0.97, 1.03), 0.05)) break;
        this.noise(0.22, 0.12, { ftype: 'bandpass', f0: 300, f1: 1400, q: 1.4, attack: 0.02 }); break;
      case 'heartbeat': this.osc('sine', 62, 40, 0.18, 0.4); this.osc('sine', 58, 38, 0.18, 0.3, { delay: 0.24 }); break;
      // critters
      case 'squeak': {
        if (!this.gate('sq', 0.06)) return;
        const f = pitch;
        this.osc('sine', 900 * f, 1500 * f, 0.09, 0.07 * v, { vib: 30, vibAmt: 60, pan });
        this.osc('sine', 1450 * f, 1050 * f, 0.1, 0.06 * v, { delay: 0.08, pan });
        break;
      }
      case 'giggle': {
        if (this.playSample('enemyLaugh', pan, 0.7 * v, pitch * rand(0.96, 1.04), 0.22)) break;
        const f = pitch; for (let i = 0; i < 5; i++) this.osc('sine', (1400 - i * 90) * f, (1100 - i * 80) * f, 0.07, 0.05 * v, { delay: i * 0.085, vib: 25, vibAmt: 50, rev: 0.4, pan }); break;
      }
      case 'patter': for (let i = 0; i < 10; i++) this.noise(0.03, 0.05, { ftype: 'bandpass', f0: 1200 + Math.random() * 900, q: 3, delay: i * 0.07 + Math.random() * 0.03, pan: Math.sin(i * 0.9) * 0.8 }); break;
      case 'screech':
        if (!this.gate('scr', 0.12)) return;
        if (this.playSample('enemyScream', pan, 0.78 * v, rand(0.96, 1.04), 0.25)) break;
        this.osc('sawtooth', 700, 260, 0.45, 0.12 * v, { vib: 38, vibAmt: 90, filter: 'bandpass', ff: 1400, q: 1.5, pan, rev: 0.5, distort: true });
        break;
      case 'growl':
        if (!this.gate('growl', 0.12)) return;
        if (this.playSample('enemyGrowl', pan, 0.72 * v, pitch * rand(0.96, 1.04), 0.22)) break;
        this.noise(0.52, 0.16 * v, { brown: true, ftype: 'lowpass', f0: 380, f1: 120, pan, rev: 0.3 });
        this.osc('sawtooth', 115, 72, 0.48, 0.1 * v, { filter: 'lowpass', ff: 480, pan, rev: 0.2 });
        break;
      case 'enemyAttack':
        if (!this.gate('enemyAttack', 0.22)) return;
        if (this.playSample('enemyAttack', pan, 0.72 * v, rand(0.96, 1.05), 0.16)) break;
        this.noise(0.2, 0.16 * v, { ftype: 'bandpass', f0: 400, f1: 2100, q: 1.7, attack: 0.02, pan });
        break;
      case 'bite':
        if (!this.gate('bite', 0.05)) return;
        if (this.playSample('enemyBite', pan, 0.76 * v, rand(0.96, 1.04), 0.12)) break;
        this.noise(0.04, 0.2 * v, { ftype: 'highpass', f0: 1500, pan }); this.osc('square', 300, 110, 0.08, 0.1 * v, { filter: 'lowpass', ff: 1200, pan });
        break;
      case 'pop':
        if (!this.gate('pop', 0.03)) return;
        this.osc('sine', 260, 980, 0.07, 0.18 * v, P); this.noise(0.18, 0.18 * v, { ftype: 'bandpass', f0: 900, f1: 300, q: 1, pan });
        break;
      case 'hop': if (!this.gate('hop', 0.09)) return; this.osc('sine', 190, 110, 0.06, 0.06 * v, P); break;
      case 'crinkle': if (!this.gate('cr', 0.1)) return; for (let i = 0; i < 6; i++) this.noise(0.02, 0.06 * v, { ftype: 'highpass', f0: 3500, delay: i * 0.03 + Math.random() * 0.02, pan }); break;
      case 'splat': this.noise(0.22, 0.2 * v, { ftype: 'lowpass', f0: 900, f1: 200, pan }); this.osc('sine', 200, 70, 0.15, 0.15 * v, P); break;
      case 'woo': this.osc('sine', 330, 410, 0.9, 0.06 * v, { attack: 0.3, vib: 5, vibAmt: 25, rev: 0.8, pan }); break;
      case 'blink': this.noise(0.3, 0.08 * v, { ftype: 'bandpass', f0: 3000, f1: 600, q: 2, pan, rev: 0.6 }); break;
      case 'cackle':
        if (this.playSample('enemyLaugh', pan, 0.72 * v, pitch * rand(0.86, 0.98), 0.24)) break;
        for (let i = 0; i < 4; i++) this.osc('sawtooth', 620 - i * 50, 480 - i * 40, 0.08, 0.05 * v, { delay: i * 0.1, filter: 'bandpass', ff: 1300, q: 2, pan, rev: 0.3 }); break;
      case 'fwump': this.noise(0.15, 0.15 * v, { ftype: 'lowpass', f0: 500, pan }); break;
      case 'cast': this.noise(0.4, 0.12 * v, { ftype: 'bandpass', f0: 500, f1: 1800, q: 2, attack: 0.25, pan }); break;
      case 'fire': this.noise(0.35, 0.16 * v, { ftype: 'bandpass', f0: 900, q: 0.8, pan, am: 23 }); this.osc('sine', 400, 180, 0.2, 0.08 * v, P); break;
      case 'spit': this.noise(0.12, 0.2 * v, { ftype: 'bandpass', f0: 1200, q: 1.5, pan }); this.osc('sine', 500, 180, 0.12, 0.12 * v, P); break;
      case 'sizzle': if (!this.gate('siz', 0.15)) return; this.noise(0.3, 0.05 * v, { ftype: 'highpass', f0: 3000, pan, am: 40 }); break;
      // bosses
      case 'roar': {
        if (this.playSample('bossRoar', pan, 0.78 * v, pitch, 0.28)) break;
        const p = pitch;
        [55, 58.5, 82.4, 110].forEach((f) => this.osc('sawtooth', f * p * 1.3, f * p * 0.75, 1.6, 0.13, { filter: 'lowpass', ff: 1400, ff1: 300, attack: 0.08, rev: 0.7, distort: true }));
        this.noise(1.4, 0.3, { ftype: 'bandpass', f0: 700 * p, f1: 300, q: 0.8, attack: 0.1, rev: 0.7 });
        break;
      }
      case 'bossAttack':
        if (!this.gate('bossAttack', 0.55)) return;
        if (this.playSample('bossAttack', pan, 0.66 * v, rand(0.96, 1.03), 0.22)) break;
        this.noise(0.65, 0.18 * v, { ftype: 'bandpass', f0: 230, f1: 1200, q: 1.2, attack: 0.12, pan, rev: 0.3 });
        break;
      case 'slam':
        if (this.playSample('bossImpact', pan, 0.86 * v, rand(0.96, 1.02), 0.3)) break;
        this.osc('sine', 70, 26, 0.6, 0.85 * v, { pan }); this.noise(0.5, 0.45 * v, { ftype: 'lowpass', f0: 900, f1: 120, pan, rev: 0.7 });
        break;
      case 'charge': this.noise(0.8, 0.22 * v, { ftype: 'bandpass', f0: 200, f1: 900, q: 1.2, attack: 0.2, pan }); break;
      case 'tongue': this.osc('sine', 160, 900, 0.25, 0.18 * v, P); this.noise(0.3, 0.12 * v, { ftype: 'bandpass', f0: 600, f1: 1800, q: 3, pan }); break;
      case 'slurp': this.osc('sine', 700, 150, 0.4, 0.15 * v, { vib: 18, vibAmt: 80, pan }); break;
      case 'chomp':
        if (this.playSample('enemyBite', pan, 0.9 * v, rand(0.92, 1.0), 0.14)) break;
        this.noise(0.1, 0.4 * v, { ftype: 'lowpass', f0: 2500, pan }); this.osc('square', 180, 60, 0.15, 0.2 * v, { filter: 'lowpass', ff: 900, pan }); break;
      case 'yarn': this.noise(0.25, 0.1 * v, { ftype: 'bandpass', f0: 800, f1: 2000, q: 2, pan }); break;
      case 'zip': this.noise(0.4, 0.12 * v, { ftype: 'bandpass', f0: 2500, q: 3, am: 60, pan }); break;
      // the Boogeyman and its helpers
      case 'flutter':
        if (!this.gate('flut', 0.08)) return;
        for (let i = 0; i < 6; i++) this.noise(0.045, 0.05 * v, { ftype: 'bandpass', f0: (650 + Math.random() * 350) * pitch, q: 1.4, delay: i * 0.038, pan });
        break;
      case 'hanger':
        this.noise(0.55, 0.09 * v, { ftype: 'bandpass', f0: 2200, f1: 800, q: 2, am: 16, pan });
        this.osc('triangle', 2350, 2280, 0.25, 0.03 * v, { pan, rev: 0.5 });
        break;
      case 'wardrobe':
        this.osc('sine', 120, 48, 0.32, 0.38 * v, { pan });
        this.noise(0.28, 0.2 * v, { ftype: 'lowpass', f0: 800, f1: 150, pan, rev: 0.4 });
        this.noise(0.06, 0.06 * v, { ftype: 'bandpass', f0: 1800, q: 2, delay: 0.02, pan });
        break;
      case 'scrape': this.noise(0.5, 0.08 * v, { ftype: 'bandpass', f0: 320, f1: 520, q: 1.4, am: 28, attack: 0.05, pan }); break;
      case 'rattle': for (let i = 0; i < 7; i++) this.noise(0.035, 0.07 * v, { ftype: 'bandpass', f0: 700 + Math.random() * 500, q: 2.5, delay: i * 0.055 + Math.random() * 0.015, pan, rev: 0.3 }); break;
      case 'chuckle':
        if (this.playSample('enemyLaugh', pan, 0.78 * v, pitch * rand(0.88, 0.98), 0.28)) break;
        for (let i = 0; i < 5; i++) this.osc('sawtooth', (170 - i * 9) * pitch, (125 - i * 7) * pitch, 0.13, 0.07 * v, { delay: i * 0.15, filter: 'bandpass', ff: 520, q: 2, rev: 0.6, pan }); break;
      case 'lightsOut':
        this.osc('square', 60, 60, 0.5, 0.06, { filter: 'lowpass', ff: 800 });
        this.noise(0.08, 0.3, { ftype: 'highpass', f0: 1200, delay: 0.45 });
        this.osc('sine', 90, 40, 0.3, 0.4, { delay: 0.47 });
        break;
      case 'lightsOn': this.osc('square', 120, 120, 0.25, 0.05, { filter: 'lowpass', ff: 1200, am: 30 }); this.noise(0.05, 0.1, { ftype: 'highpass', f0: 2000 }); break;
      case 'whisper': this.noise(1.3, 0.09 * v, { ftype: 'bandpass', f0: 3800, f1: 2200, q: 2, attack: 0.4, pan, rev: 0.6 }); break;
      case 'teleport': this.noise(0.5, 0.14 * v, { ftype: 'bandpass', f0: 400, f1: 3500, q: 3, attack: 0.45, pan, rev: 0.6 }); break;
      case 'bossDie':
        if (this.playSample('bossDeath', 0, 0.84, rand(0.97, 1.02), 0.34)) break;
        this.noise(2.5, 0.6, { ftype: 'lowpass', f0: 3000, f1: 60, rev: 1, distort: true });
        [41, 43.6, 61.7].forEach((f) => this.osc('sawtooth', f * 2, f, 2.4, 0.15, { filter: 'lowpass', ff: 900, ff1: 80, rev: 0.9 }));
        this.stinger(0.3);
        break;
      // photo
      case 'tick': this.osc('sine', 2200, 2000, 0.015, 0.05 * v); break;
      case 'snap':
        this.noise(0.012, 0.4, { ftype: 'highpass', f0: 3000 });
        this.osc('square', 200, 80, 0.05, 0.15, { delay: 0.05, filter: 'lowpass', ff: 900 });
        this.osc('sine', 1800, 4200, 0.6, 0.03, { delay: 0.12, linear: true });
        break;
      case 'whir': this.noise(0.7, 0.12, { ftype: 'bandpass', f0: 1500, q: 1.2, am: 32 }); this.osc('square', 110, 130, 0.7, 0.03, { filter: 'lowpass', ff: 600 }); break;
      case 'rustle': for (let i = 0; i < 8; i++) this.noise(0.05, 0.08 * v, { ftype: 'bandpass', f0: 1800 + Math.random() * 2000, q: 1.5, delay: i * 0.06 + Math.random() * 0.04, pan }); break;
      case 'tear': this.noise(0.7, 0.45, { ftype: 'bandpass', f0: 3200, f1: 700, q: 1.2, am: 47 }); this.noise(0.5, 0.25, { ftype: 'highpass', f0: 1500, delay: 0.1 }); break;
      case 'thunder':
        this.noise(4.5, 0.42 * v, { ftype: 'lowpass', f0: 420, f1: 60, attack: 0.05, rev: 0.6, brown: true, rate: 1.2 });
        this.noise(0.4, 0.25 * v, { ftype: 'lowpass', f0: 2500, f1: 300 });
        break;
      case 'flicker': if (!this.gate('fl', 0.2)) return; this.osc('square', 120, 120, 0.12, 0.025, { filter: 'lowpass', ff: 1500, am: 40 }); break;
      // the living room TV and its tapes
      case 'tvSmash': {
        // the tube implodes: a hollow thump, the screen bursting, bits of glass raining down after
        if (this.playSample('tvSmash', pan, 0.86 * v, rand(0.97, 1.03), 0.22)) break;
        this.osc('sine', 120, 38, 0.5, 0.55 * v, { pan, rev: 0.6 });
        this.noise(0.6, 0.5 * v, { ftype: 'highpass', f0: 1800, pan, rev: 0.5 });
        this.noise(0.25, 0.35 * v, { ftype: 'bandpass', f0: 3200, q: 0.7, pan });
        for (let i = 0; i < 14; i++) this.osc('sine', rand(2600, 6200), rand(2400, 5800), rand(0.04, 0.12), rand(0.03, 0.07) * v, { delay: 0.05 + Math.random() * 0.9, pan: clamp(pan + rand(-0.3, 0.3), -1, 1), rev: 0.3 });
        for (let i = 0; i < 10; i++) this.noise(0.03, rand(0.05, 0.12) * v, { ftype: 'bandpass', f0: rand(3000, 7000), q: 2, delay: 0.1 + Math.random() * 1.1, pan });
        break;
      }
      case 'zap':
        // high voltage arcing in the dead set
        if (!this.gate('zap', 0.12)) return;
        this.noise(0.35, 0.22 * v, { ftype: 'bandpass', f0: 2600, q: 0.8, am: 70, pan });
        this.osc('square', 120, 116, 0.35, 0.06 * v, { filter: 'lowpass', ff: 1400, pan });
        for (let i = 0; i < 6; i++) this.noise(0.015, 0.18 * v, { ftype: 'highpass', f0: 2500, delay: Math.random() * 0.3, pan });
        break;
      case 'tapeWhir':
        // the VCR under it starts up by itself: motor, warble, rising
        if (this.playSample('vhsStart', pan, 0.82 * v, rand(0.97, 1.03), 0.18)) break;
        this.noise(1.1, 0.12 * v, { ftype: 'bandpass', f0: 900, f1: 2400, q: 1.6, am: 26, attack: 0.3, pan });
        this.osc('square', 70, 140, 1.0, 0.05 * v, { filter: 'lowpass', ff: 700, attack: 0.25, pan });
        this.osc('sine', 420, 1300, 0.95, 0.05 * v, { vib: 7, vibAmt: 60, attack: 0.3, pan, rev: 0.5 });
        break;
      case 'tapeSwarm':
        // a flutter of loose tape and a thin, many-voiced shriek
        for (let i = 0; i < 9; i++) this.noise(0.35, 0.09 * v, { ftype: 'bandpass', f0: rand(700, 1800), q: 1.4, am: rand(35, 60), delay: i * 0.08, pan: clamp(pan + rand(-0.4, 0.4), -1, 1) });
        this.osc('sawtooth', 1500, 420, 0.7, 0.07 * v, { vib: 30, vibAmt: 140, filter: 'bandpass', ff: 1800, q: 1.2, pan, rev: 0.6, distort: true });
        this.osc('sawtooth', 1150, 300, 0.8, 0.05 * v, { delay: 0.12, vib: 23, vibAmt: 120, filter: 'bandpass', ff: 1400, q: 1.2, pan, rev: 0.6 });
        break;
      case 'tapeChatter': {
        // the flap clacking, the reels squealing
        if (!this.gate('tch', 0.25)) return;
        const f = pitch;
        for (let i = 0; i < 4; i++) this.noise(0.02, 0.09 * v, { ftype: 'bandpass', f0: 2200 * f, q: 3, delay: i * 0.055, pan });
        this.osc('sine', 1800 * f, 2600 * f, 0.18, 0.025 * v, { vib: 40, vibAmt: 200, delay: 0.05, pan });
        break;
      }
      case 'tapeHiss':
        if (!this.gate('ths', 0.15)) return;
        if (this.playSample('vhsGlitch', pan, 0.58 * v, rand(0.96, 1.04), 0.12)) break;
        this.noise(0.3, 0.1 * v, { ftype: 'highpass', f0: 3500, attack: 0.15, pan });
        this.osc('sawtooth', 300, 900, 0.28, 0.04 * v, { filter: 'bandpass', ff: 1200, q: 2, pan });
        break;
      case 'tapeDie': {
        // the shell cracks, the tape inside winds down like a deck losing power
        if (!this.gate('tdie', 0.04)) return;
        const f = pitch;
        this.noise(0.05, 0.3 * v, { ftype: 'highpass', f0: 1800, pan });
        this.osc('square', 520 * f, 420 * f, 0.04, 0.08 * v, { filter: 'bandpass', ff: 1600, q: 3, pan });
        this.osc('sawtooth', 460 * f, 38, 0.42, 0.09 * v, { filter: 'lowpass', ff: 2200, ff1: 300, pan, rev: 0.3 });
        for (let i = 0; i < 5; i++) this.noise(0.02, 0.05 * v, { ftype: 'highpass', f0: 3500, delay: 0.04 + i * 0.03 + Math.random() * 0.02, pan });
        break;
      }
      case 'glassCrunch':
        if (!this.gate('gcr', 0.2)) return;
        this.noise(0.06, 0.12 * v, { ftype: 'highpass', f0: 3000, pan });
        for (let i = 0; i < 3; i++) this.osc('sine', rand(3500, 6500), rand(3000, 6000), 0.05, 0.02 * v, { delay: Math.random() * 0.05, pan });
        break;
      case 'rewind':
        // fast rewind, then the clunk of the deck stopping
        if (this.playSample('vhsRewind', pan, 0.8 * v, rand(0.97, 1.03), 0.16)) break;
        this.osc('sawtooth', 240, 2600, 0.7, 0.05 * v, { filter: 'bandpass', ff: 1600, q: 1.5, linear: true, pan });
        this.noise(0.7, 0.07 * v, { ftype: 'bandpass', f0: 900, f1: 3500, q: 1.2, am: 40, pan });
        this.noise(0.05, 0.2 * v, { ftype: 'highpass', f0: 2000, delay: 0.72, pan });
        this.osc('sine', 150, 70, 0.1, 0.15 * v, { delay: 0.72, pan });
        break;
    }
  },

  stinger(vol = 0.35) {
    [110, 116.5, 155.6, 233.1, 311].forEach((f, i) => this.osc(i % 2 ? 'sawtooth' : 'triangle', f, f * 0.985, 2.2, vol * (i < 2 ? 0.35 : 0.22), { filter: 'lowpass', ff: 2600, ff1: 500, rev: 0.9, attack: 0.01 }));
    this.noise(1.2, vol * 0.5, { ftype: 'bandpass', f0: 4000, f1: 800, q: 1, rev: 0.8 });
  },
};

// =====================================================================
//  MESHOPT DECODER (third party: meshoptimizer 0.21, MIT License, Copyright (C) 2016-2024 Arseny Kapoulkine;
//  the reference decoder by Jasper St. Pierre). The models' geometry is stored with EXT_meshopt_compression
//  (see GLB.parse): meshoptWasm() is the fast WebAssembly decoder, meshoptJS() the plain JavaScript one used
//  where a page may not run WebAssembly.
// =====================================================================
function meshoptWasm() {
	// Built with clang version 18.1.2
	// Built from meshoptimizer 0.21
	var wasm_base = "b9H79Tebbbe8Fv9Gbb9Gvuuuuueu9Giuuub9Geueu9Giuuueuikqbeeedddillviebeoweuec:q;iekr;leDo9TW9T9VV95dbH9F9F939H79T9F9J9H229F9Jt9VV7bb8A9TW79O9V9Wt9F9KW9J9V9KW9wWVtW949c919M9MWVbeY9TW79O9V9Wt9F9KW9J9V9KW69U9KW949c919M9MWVbdE9TW79O9V9Wt9F9KW9J9V9KW69U9KW949tWG91W9U9JWbiL9TW79O9V9Wt9F9KW9J9V9KWS9P2tWV9p9JtblK9TW79O9V9Wt9F9KW9J9V9KWS9P2tWV9r919HtbvL9TW79O9V9Wt9F9KW9J9V9KWS9P2tWVT949Wbol79IV9Rbrq;w8Wqdbk;esezu8Jjjjjbcj;eb9Rgv8Kjjjjbc9:hodnadcefal0mbcuhoaiRbbc:Ge9hmbavaialfgrad9Radz1jjjbhwcj;abad9Uc;WFbGgocjdaocjd6EhDaicefhocbhqdnindndndnaeaq9nmbaDaeaq9RaqaDfae6Egkcsfglcl4cifcd4hxalc9WGgmTmecbhPawcjdfhsaohzinaraz9Rax6mvarazaxfgo9RcK6mvczhlcbhHinalgic9WfgOawcj;cbffhldndndndndnazaOco4fRbbaHcoG4ciGPlbedibkal9cb83ibalcwf9cb83ibxikalaoRblaoRbbgOco4gAaAciSgAE86bbawcj;cbfaifglcGfaoclfaAfgARbbaOcl4ciGgCaCciSgCE86bbalcVfaAaCfgARbbaOcd4ciGgCaCciSgCE86bbalc7faAaCfgARbbaOciGgOaOciSgOE86bbalctfaAaOfgARbbaoRbegOco4gCaCciSgCE86bbalc91faAaCfgARbbaOcl4ciGgCaCciSgCE86bbalc4faAaCfgARbbaOcd4ciGgCaCciSgCE86bbalc93faAaCfgARbbaOciGgOaOciSgOE86bbalc94faAaOfgARbbaoRbdgOco4gCaCciSgCE86bbalc95faAaCfgARbbaOcl4ciGgCaCciSgCE86bbalc96faAaCfgARbbaOcd4ciGgCaCciSgCE86bbalc97faAaCfgARbbaOciGgOaOciSgOE86bbalc98faAaOfgORbbaoRbigoco4gAaAciSgAE86bbalc99faOaAfgORbbaocl4ciGgAaAciSgAE86bbalc9:faOaAfgORbbaocd4ciGgAaAciSgAE86bbalcufaOaAfglRbbaociGgoaociSgoE86bbalaofhoxdkalaoRbwaoRbbgOcl4gAaAcsSgAE86bbawcj;cbfaifglcGfaocwfaAfgARbbaOcsGgOaOcsSgOE86bbalcVfaAaOfgORbbaoRbegAcl4gCaCcsSgCE86bbalc7faOaCfgORbbaAcsGgAaAcsSgAE86bbalctfaOaAfgORbbaoRbdgAcl4gCaCcsSgCE86bbalc91faOaCfgORbbaAcsGgAaAcsSgAE86bbalc4faOaAfgORbbaoRbigAcl4gCaCcsSgCE86bbalc93faOaCfgORbbaAcsGgAaAcsSgAE86bbalc94faOaAfgORbbaoRblgAcl4gCaCcsSgCE86bbalc95faOaCfgORbbaAcsGgAaAcsSgAE86bbalc96faOaAfgORbbaoRbvgAcl4gCaCcsSgCE86bbalc97faOaCfgORbbaAcsGgAaAcsSgAE86bbalc98faOaAfgORbbaoRbogAcl4gCaCcsSgCE86bbalc99faOaCfgORbbaAcsGgAaAcsSgAE86bbalc9:faOaAfgORbbaoRbrgocl4gAaAcsSgAE86bbalcufaOaAfglRbbaocsGgoaocsSgoE86bbalaofhoxekalao8Pbb83bbalcwfaocwf8Pbb83bbaoczfhokdnaiam9pmbaHcdfhHaiczfhlarao9RcL0mekkaiam6mvaoTmvdnakTmbawaPfRbbhHawcj;cbfhlashiakhOinaialRbbgzce4cbazceG9R7aHfgH86bbaiadfhialcefhlaOcufgOmbkkascefhsaohzaPcefgPad9hmbxikkcbc99arao9Radcaadca0ESEhoxlkaoaxad2fhCdnakmbadhlinaoTmlarao9Rax6mlaoaxfhoalcufglmbkaChoxekcbhmawcjdfhAinarao9Rax6miawamfRbbhHawcj;cbfhlaAhiakhOinaialRbbgzce4cbazceG9R7aHfgH86bbaiadfhialcefhlaOcufgOmbkaAcefhAaoaxfhoamcefgmad9hmbkaChokabaqad2fawcjdfakad2z1jjjb8Aawawcjdfakcufad2fadz1jjjb8Aakaqfhqaombkc9:hoxekc9:hokavcj;ebf8Kjjjjbaok;cseHu8Jjjjjbc;ae9Rgv8Kjjjjbc9:hodnaeci9UgrcHfal0mbcuhoaiRbbgwc;WeGc;Ge9hmbawcsGgwce0mbavc;abfcFecjez:jjjjb8AavcUf9cu83ibavc8Wf9cu83ibavcyf9cu83ibavcaf9cu83ibavcKf9cu83ibavczf9cu83ibav9cu83iwav9cu83ibaialfc9WfhDaicefgqarfhidnaeTmbcmcsawceSEhkcbhxcbhmcbhPcbhwcbhlindnaiaD9nmbc9:hoxikdndnaqRbbgoc;Ve0mbavc;abfalaocu7gscl4fcsGcitfgzydlhrazydbhzdnaocsGgHak9pmbavawasfcsGcdtfydbaxaHEhoaHThsdndnadcd9hmbabaPcetfgHaz87ebaHclfao87ebaHcdfar87ebxekabaPcdtfgHazBdbaHcwfaoBdbaHclfarBdbkaxasfhxcdhHavawcdtfaoBdbawasfhwcehsalhOxdkdndnaHcsSmbaHc987aHamffcefhoxekaicefhoai8SbbgHcFeGhsdndnaHcu9mmbaohixekaicvfhiascFbGhscrhHdninao8SbbgOcFbGaHtasVhsaOcu9kmeaocefhoaHcrfgHc8J9hmbxdkkaocefhikasce4cbasceG9R7amfhokdndnadcd9hmbabaPcetfgHaz87ebaHclfao87ebaHcdfar87ebxekabaPcdtfgHazBdbaHcwfaoBdbaHclfarBdbkcdhHavawcdtfaoBdbcehsawcefhwalhOaohmxekdnaocpe0mbaxcefgHavawaDaocsGfRbbgocl49RcsGcdtfydbaocz6gzEhravawao9RcsGcdtfydbaHazfgAaocsGgHEhoaHThCdndnadcd9hmbabaPcetfgHax87ebaHclfao87ebaHcdfar87ebxekabaPcdtfgHaxBdbaHcwfaoBdbaHclfarBdbkcdhsavawcdtfaxBdbavawcefgwcsGcdtfarBdbcihHavc;abfalcitfgOaxBdlaOarBdbavawazfgwcsGcdtfaoBdbalcefcsGhOawaCfhwaxhzaAaCfhxxekaxcbaiRbbgOEgzaoc;:eSgHfhraOcsGhCaOcl4hAdndnaOcs0mbarcefhoxekarhoavawaA9RcsGcdtfydbhrkdndnaCmbaocefhxxekaohxavawaO9RcsGcdtfydbhokdndnaHTmbaicefhHxekaicdfhHai8SbegscFeGhzdnascu9kmbaicofhXazcFbGhzcrhidninaH8SbbgscFbGaitazVhzascu9kmeaHcefhHaicrfgic8J9hmbkaXhHxekaHcefhHkazce4cbazceG9R7amfgmhzkdndnaAcsSmbaHhsxekaHcefhsaH8SbbgicFeGhrdnaicu9kmbaHcvfhXarcFbGhrcrhidninas8SbbgHcFbGaitarVhraHcu9kmeascefhsaicrfgic8J9hmbkaXhsxekascefhskarce4cbarceG9R7amfgmhrkdndnaCcsSmbashixekascefhias8SbbgocFeGhHdnaocu9kmbascvfhXaHcFbGhHcrhodninai8SbbgscFbGaotaHVhHascu9kmeaicefhiaocrfgoc8J9hmbkaXhixekaicefhikaHce4cbaHceG9R7amfgmhokdndnadcd9hmbabaPcetfgHaz87ebaHclfao87ebaHcdfar87ebxekabaPcdtfgHazBdbaHcwfaoBdbaHclfarBdbkcdhsavawcdtfazBdbavawcefgwcsGcdtfarBdbcihHavc;abfalcitfgXazBdlaXarBdbavawaOcz6aAcsSVfgwcsGcdtfaoBdbawaCTaCcsSVfhwalcefcsGhOkaqcefhqavc;abfaOcitfgOarBdlaOaoBdbavc;abfalasfcsGcitfgraoBdlarazBdbawcsGhwalaHfcsGhlaPcifgPae6mbkkcbc99aiaDSEhokavc;aef8Kjjjjbaok:flevu8Jjjjjbcz9Rhvc9:hodnaecvfal0mbcuhoaiRbbc;:eGc;qe9hmbav9cb83iwaicefhraialfc98fhwdnaeTmbdnadcdSmbcbhDindnaraw6mbc9:skarcefhoar8SbbglcFeGhidndnalcu9mmbaohrxekarcvfhraicFbGhicrhldninao8SbbgdcFbGaltaiVhiadcu9kmeaocefhoalcrfglc8J9hmbxdkkaocefhrkabaDcdtfaic8Etc8F91aicd47avcwfaiceGcdtVgoydbfglBdbaoalBdbaDcefgDae9hmbxdkkcbhDindnaraw6mbc9:skarcefhoar8SbbglcFeGhidndnalcu9mmbaohrxekarcvfhraicFbGhicrhldninao8SbbgdcFbGaltaiVhiadcu9kmeaocefhoalcrfglc8J9hmbxdkkaocefhrkabaDcetfaic8Etc8F91aicd47avcwfaiceGcdtVgoydbfgl87ebaoalBdbaDcefgDae9hmbkkcbc99arawSEhokaok:Lvoeue99dud99eud99dndnadcl9hmbaeTmeindndnabcdfgd8Sbb:Yab8Sbbgi:Ygl:l:tabcefgv8Sbbgo:Ygr:l:tgwJbb;:9cawawNJbbbbawawJbbbb9GgDEgq:mgkaqaicb9iEalMgwawNakaqaocb9iEarMgqaqNMM:r:vglNJbbbZJbbb:;aDEMgr:lJbbb9p9DTmbar:Ohixekcjjjj94hikadai86bbdndnaqalNJbbbZJbbb:;aqJbbbb9GEMgq:lJbbb9p9DTmbaq:Ohdxekcjjjj94hdkavad86bbdndnawalNJbbbZJbbb:;awJbbbb9GEMgw:lJbbb9p9DTmbaw:Ohdxekcjjjj94hdkabad86bbabclfhbaecufgembxdkkaeTmbindndnabclfgd8Ueb:Yab8Uebgi:Ygl:l:tabcdfgv8Uebgo:Ygr:l:tgwJb;:FSawawNJbbbbawawJbbbb9GgDEgq:mgkaqaicb9iEalMgwawNakaqaocb9iEarMgqaqNMM:r:vglNJbbbZJbbb:;aDEMgr:lJbbb9p9DTmbar:Ohixekcjjjj94hikadai87ebdndnaqalNJbbbZJbbb:;aqJbbbb9GEMgq:lJbbb9p9DTmbaq:Ohdxekcjjjj94hdkavad87ebdndnawalNJbbbZJbbb:;awJbbbb9GEMgw:lJbbb9p9DTmbaw:Ohdxekcjjjj94hdkabad87ebabcwfhbaecufgembkkk;oiliui99iue99dnaeTmbcbhiabhlindndnJ;Zl81Zalcof8UebgvciV:Y:vgoal8Ueb:YNgrJb;:FSNJbbbZJbbb:;arJbbbb9GEMgw:lJbbb9p9DTmbaw:OhDxekcjjjj94hDkalclf8Uebhqalcdf8UebhkabaiavcefciGfcetfaD87ebdndnaoak:YNgwJb;:FSNJbbbZJbbb:;awJbbbb9GEMgx:lJbbb9p9DTmbax:OhDxekcjjjj94hDkabaiavciGfgkcd7cetfaD87ebdndnaoaq:YNgoJb;:FSNJbbbZJbbb:;aoJbbbb9GEMgx:lJbbb9p9DTmbax:OhDxekcjjjj94hDkabaiavcufciGfcetfaD87ebdndnJbbjZararN:tawawN:taoaoN:tgrJbbbbarJbbbb9GE:rJb;:FSNJbbbZMgr:lJbbb9p9DTmbar:Ohvxekcjjjj94hvkabakcetfav87ebalcwfhlaiclfhiaecufgembkkk9mbdnadcd4ae2gdTmbinababydbgecwtcw91:Yaece91cjjj98Gcjjj;8if::NUdbabclfhbadcufgdmbkkk9teiucbcbydj1jjbgeabcifc98GfgbBdj1jjbdndnabZbcztgd9nmbcuhiabad9RcFFifcz4nbcuSmekaehikaik;LeeeudndnaeabVciGTmbabhixekdndnadcz9pmbabhixekabhiinaiaeydbBdbaiclfaeclfydbBdbaicwfaecwfydbBdbaicxfaecxfydbBdbaeczfheaiczfhiadc9Wfgdcs0mbkkadcl6mbinaiaeydbBdbaeclfheaiclfhiadc98fgdci0mbkkdnadTmbinaiaeRbb86bbaicefhiaecefheadcufgdmbkkabk;aeedudndnabciGTmbabhixekaecFeGc:b:c:ew2hldndnadcz9pmbabhixekabhiinaialBdbaicxfalBdbaicwfalBdbaiclfalBdbaiczfhiadc9Wfgdcs0mbkkadcl6mbinaialBdbaiclfhiadc98fgdci0mbkkdnadTmbinaiae86bbaicefhiadcufgdmbkkabkkkebcjwklz9Kbb";
	var wasm_simd = "b9H79TebbbeKl9Gbb9Gvuuuuueu9Giuuub9Geueuikqbbebeedddilve9Weeeviebeoweuec:q;Aekr;leDo9TW9T9VV95dbH9F9F939H79T9F9J9H229F9Jt9VV7bb8A9TW79O9V9Wt9F9KW9J9V9KW9wWVtW949c919M9MWVbdY9TW79O9V9Wt9F9KW9J9V9KW69U9KW949c919M9MWVblE9TW79O9V9Wt9F9KW9J9V9KW69U9KW949tWG91W9U9JWbvL9TW79O9V9Wt9F9KW9J9V9KWS9P2tWV9p9JtboK9TW79O9V9Wt9F9KW9J9V9KWS9P2tWV9r919HtbrL9TW79O9V9Wt9F9KW9J9V9KWS9P2tWVT949Wbwl79IV9RbDq:p9sqlbzik9:evu8Jjjjjbcz9Rhbcbheincbhdcbhiinabcwfadfaicjuaead4ceGglE86bbaialfhiadcefgdcw9hmbkaec:q:yjjbfai86bbaecitc:q1jjbfab8Piw83ibaecefgecjd9hmbkk:N8JlHud97euo978Jjjjjbcj;kb9Rgv8Kjjjjbc9:hodnadcefal0mbcuhoaiRbbc:Ge9hmbavaialfgrad9Rad;8qbbcj;abad9UhlaicefhodnaeTmbadTmbalc;WFbGglcjdalcjd6EhwcbhDinawaeaD9RaDawfae6Egqcsfglc9WGgkci2hxakcethmalcl4cifcd4hPabaDad2fhsakc;ab6hzcbhHincbhOaohAdndninaraA9RaP6meavcj;cbfaOak2fhCaAaPfhocbhidnazmbarao9Rc;Gb6mbcbhlinaCalfhidndndndndnaAalco4fRbbgXciGPlbedibkaipxbbbbbbbbbbbbbbbbpklbxikaiaopbblaopbbbgQclp:meaQpmbzeHdOiAlCvXoQrLgQcdp:meaQpmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9ogLpxiiiiiiiiiiiiiiiip8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spklbaoclfaYpQbfaKc:q:yjjbfRbbfhoxdkaiaopbbwaopbbbgQclp:meaQpmbzeHdOiAlCvXoQrLpxssssssssssssssssp9ogLpxssssssssssssssssp8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spklbaocwfaYpQbfaKc:q:yjjbfRbbfhoxekaiaopbbbpklbaoczfhokdndndndndnaXcd4ciGPlbedibkaipxbbbbbbbbbbbbbbbbpklzxikaiaopbblaopbbbgQclp:meaQpmbzeHdOiAlCvXoQrLgQcdp:meaQpmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9ogLpxiiiiiiiiiiiiiiiip8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spklzaoclfaYpQbfaKc:q:yjjbfRbbfhoxdkaiaopbbwaopbbbgQclp:meaQpmbzeHdOiAlCvXoQrLpxssssssssssssssssp9ogLpxssssssssssssssssp8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spklzaocwfaYpQbfaKc:q:yjjbfRbbfhoxekaiaopbbbpklzaoczfhokdndndndndnaXcl4ciGPlbedibkaipxbbbbbbbbbbbbbbbbpklaxikaiaopbblaopbbbgQclp:meaQpmbzeHdOiAlCvXoQrLgQcdp:meaQpmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9ogLpxiiiiiiiiiiiiiiiip8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spklaaoclfaYpQbfaKc:q:yjjbfRbbfhoxdkaiaopbbwaopbbbgQclp:meaQpmbzeHdOiAlCvXoQrLpxssssssssssssssssp9ogLpxssssssssssssssssp8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spklaaocwfaYpQbfaKc:q:yjjbfRbbfhoxekaiaopbbbpklaaoczfhokdndndndndnaXco4Plbedibkaipxbbbbbbbbbbbbbbbbpkl8WxikaiaopbblaopbbbgQclp:meaQpmbzeHdOiAlCvXoQrLgQcdp:meaQpmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9ogLpxiiiiiiiiiiiiiiiip8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgXcitc:q1jjbfpbibaXc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgXcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spkl8WaoclfaYpQbfaXc:q:yjjbfRbbfhoxdkaiaopbbwaopbbbgQclp:meaQpmbzeHdOiAlCvXoQrLpxssssssssssssssssp9ogLpxssssssssssssssssp8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgXcitc:q1jjbfpbibaXc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgXcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spkl8WaocwfaYpQbfaXc:q:yjjbfRbbfhoxekaiaopbbbpkl8Waoczfhokalc;abfhialcjefak0meaihlarao9Rc;Fb0mbkkdnaiak9pmbaici4hlinarao9RcK6miaCaifhXdndndndndnaAaico4fRbbalcoG4ciGPlbedibkaXpxbbbbbbbbbbbbbbbbpkbbxikaXaopbblaopbbbgQclp:meaQpmbzeHdOiAlCvXoQrLgQcdp:meaQpmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9ogLpxiiiiiiiiiiiiiiiip8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spkbbaoclfaYpQbfaKc:q:yjjbfRbbfhoxdkaXaopbbwaopbbbgQclp:meaQpmbzeHdOiAlCvXoQrLpxssssssssssssssssp9ogLpxssssssssssssssssp8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spkbbaocwfaYpQbfaKc:q:yjjbfRbbfhoxekaXaopbbbpkbbaoczfhokalcdfhlaiczfgiak6mbkkaoTmeaohAaOcefgOclSmdxbkkc9:hoxlkdnakTmbavcjdfaHfhiavaHfpbdbhYcbhXinaiavcj;cbfaXfglpblbgLcep9TaLpxeeeeeeeeeeeeeeeegQp9op9Hp9rgLalakfpblbg8Acep9Ta8AaQp9op9Hp9rg8ApmbzeHdOiAlCvXoQrLgEalamfpblbg3cep9Ta3aQp9op9Hp9rg3alaxfpblbg5cep9Ta5aQp9op9Hp9rg5pmbzeHdOiAlCvXoQrLg8EpmbezHdiOAlvCXorQLgQaQpmbedibedibedibediaYp9UgYp9AdbbaiadfglaYaQaQpmlvorlvorlvorlvorp9UgYp9AdbbaladfglaYaQaQpmwDqkwDqkwDqkwDqkp9UgYp9AdbbaladfglaYaQaQpmxmPsxmPsxmPsxmPsp9UgYp9AdbbaladfglaYaEa8EpmwDKYqk8AExm35Ps8E8FgQaQpmbedibedibedibedip9UgYp9AdbbaladfglaYaQaQpmlvorlvorlvorlvorp9UgYp9AdbbaladfglaYaQaQpmwDqkwDqkwDqkwDqkp9UgYp9AdbbaladfglaYaQaQpmxmPsxmPsxmPsxmPsp9UgYp9AdbbaladfglaYaLa8ApmwKDYq8AkEx3m5P8Es8FgLa3a5pmwKDYq8AkEx3m5P8Es8Fg8ApmbezHdiOAlvCXorQLgQaQpmbedibedibedibedip9UgYp9AdbbaladfglaYaQaQpmlvorlvorlvorlvorp9UgYp9AdbbaladfglaYaQaQpmwDqkwDqkwDqkwDqkp9UgYp9AdbbaladfglaYaQaQpmxmPsxmPsxmPsxmPsp9UgYp9AdbbaladfglaYaLa8ApmwDKYqk8AExm35Ps8E8FgQaQpmbedibedibedibedip9UgYp9AdbbaladfglaYaQaQpmlvorlvorlvorlvorp9UgYp9AdbbaladfglaYaQaQpmwDqkwDqkwDqkwDqkp9UgYp9AdbbaladfglaYaQaQpmxmPsxmPsxmPsxmPsp9UgYp9AdbbaladfhiaXczfgXak6mbkkaHclfgHad6mbkasavcjdfaqad2;8qbbavavcjdfaqcufad2fad;8qbbaqaDfgDae6mbkkcbc99arao9Radcaadca0ESEhokavcj;kbf8Kjjjjbaokwbz:bjjjbk::seHu8Jjjjjbc;ae9Rgv8Kjjjjbc9:hodnaeci9UgrcHfal0mbcuhoaiRbbgwc;WeGc;Ge9hmbawcsGgwce0mbavc;abfcFecje;8kbavcUf9cu83ibavc8Wf9cu83ibavcyf9cu83ibavcaf9cu83ibavcKf9cu83ibavczf9cu83ibav9cu83iwav9cu83ibaialfc9WfhDaicefgqarfhidnaeTmbcmcsawceSEhkcbhxcbhmcbhPcbhwcbhlindnaiaD9nmbc9:hoxikdndnaqRbbgoc;Ve0mbavc;abfalaocu7gscl4fcsGcitfgzydlhrazydbhzdnaocsGgHak9pmbavawasfcsGcdtfydbaxaHEhoaHThsdndnadcd9hmbabaPcetfgHaz87ebaHclfao87ebaHcdfar87ebxekabaPcdtfgHazBdbaHcwfaoBdbaHclfarBdbkaxasfhxcdhHavawcdtfaoBdbawasfhwcehsalhOxdkdndnaHcsSmbaHc987aHamffcefhoxekaicefhoai8SbbgHcFeGhsdndnaHcu9mmbaohixekaicvfhiascFbGhscrhHdninao8SbbgOcFbGaHtasVhsaOcu9kmeaocefhoaHcrfgHc8J9hmbxdkkaocefhikasce4cbasceG9R7amfhokdndnadcd9hmbabaPcetfgHaz87ebaHclfao87ebaHcdfar87ebxekabaPcdtfgHazBdbaHcwfaoBdbaHclfarBdbkcdhHavawcdtfaoBdbcehsawcefhwalhOaohmxekdnaocpe0mbaxcefgHavawaDaocsGfRbbgocl49RcsGcdtfydbaocz6gzEhravawao9RcsGcdtfydbaHazfgAaocsGgHEhoaHThCdndnadcd9hmbabaPcetfgHax87ebaHclfao87ebaHcdfar87ebxekabaPcdtfgHaxBdbaHcwfaoBdbaHclfarBdbkcdhsavawcdtfaxBdbavawcefgwcsGcdtfarBdbcihHavc;abfalcitfgOaxBdlaOarBdbavawazfgwcsGcdtfaoBdbalcefcsGhOawaCfhwaxhzaAaCfhxxekaxcbaiRbbgOEgzaoc;:eSgHfhraOcsGhCaOcl4hAdndnaOcs0mbarcefhoxekarhoavawaA9RcsGcdtfydbhrkdndnaCmbaocefhxxekaohxavawaO9RcsGcdtfydbhokdndnaHTmbaicefhHxekaicdfhHai8SbegscFeGhzdnascu9kmbaicofhXazcFbGhzcrhidninaH8SbbgscFbGaitazVhzascu9kmeaHcefhHaicrfgic8J9hmbkaXhHxekaHcefhHkazce4cbazceG9R7amfgmhzkdndnaAcsSmbaHhsxekaHcefhsaH8SbbgicFeGhrdnaicu9kmbaHcvfhXarcFbGhrcrhidninas8SbbgHcFbGaitarVhraHcu9kmeascefhsaicrfgic8J9hmbkaXhsxekascefhskarce4cbarceG9R7amfgmhrkdndnaCcsSmbashixekascefhias8SbbgocFeGhHdnaocu9kmbascvfhXaHcFbGhHcrhodninai8SbbgscFbGaotaHVhHascu9kmeaicefhiaocrfgoc8J9hmbkaXhixekaicefhikaHce4cbaHceG9R7amfgmhokdndnadcd9hmbabaPcetfgHaz87ebaHclfao87ebaHcdfar87ebxekabaPcdtfgHazBdbaHcwfaoBdbaHclfarBdbkcdhsavawcdtfazBdbavawcefgwcsGcdtfarBdbcihHavc;abfalcitfgXazBdlaXarBdbavawaOcz6aAcsSVfgwcsGcdtfaoBdbawaCTaCcsSVfhwalcefcsGhOkaqcefhqavc;abfaOcitfgOarBdlaOaoBdbavc;abfalasfcsGcitfgraoBdlarazBdbawcsGhwalaHfcsGhlaPcifgPae6mbkkcbc99aiaDSEhokavc;aef8Kjjjjbaok:flevu8Jjjjjbcz9Rhvc9:hodnaecvfal0mbcuhoaiRbbc;:eGc;qe9hmbav9cb83iwaicefhraialfc98fhwdnaeTmbdnadcdSmbcbhDindnaraw6mbc9:skarcefhoar8SbbglcFeGhidndnalcu9mmbaohrxekarcvfhraicFbGhicrhldninao8SbbgdcFbGaltaiVhiadcu9kmeaocefhoalcrfglc8J9hmbxdkkaocefhrkabaDcdtfaic8Etc8F91aicd47avcwfaiceGcdtVgoydbfglBdbaoalBdbaDcefgDae9hmbxdkkcbhDindnaraw6mbc9:skarcefhoar8SbbglcFeGhidndnalcu9mmbaohrxekarcvfhraicFbGhicrhldninao8SbbgdcFbGaltaiVhiadcu9kmeaocefhoalcrfglc8J9hmbxdkkaocefhrkabaDcetfaic8Etc8F91aicd47avcwfaiceGcdtVgoydbfgl87ebaoalBdbaDcefgDae9hmbkkcbc99arawSEhokaok:wPliuo97eue978Jjjjjbca9Rhiaec98Ghldndnadcl9hmbdnalTmbcbhvabhdinadadpbbbgocKp:RecKp:Sep;6egraocwp:RecKp:Sep;6earp;Geaoczp:RecKp:Sep;6egwp;Gep;Kep;LegDpxbbbbbbbbbbbbbbbbp:2egqarpxbbbjbbbjbbbjbbbjgkp9op9rp;Kegrpxbb;:9cbb;:9cbb;:9cbb;:9cararp;MeaDaDp;Meawaqawakp9op9rp;Kegrarp;Mep;Kep;Kep;Jep;Negwp;Mepxbbn0bbn0bbn0bbn0gqp;KepxFbbbFbbbFbbbFbbbp9oaopxbbbFbbbFbbbFbbbFp9op9qarawp;Meaqp;Kecwp:RepxbFbbbFbbbFbbbFbbp9op9qaDawp;Meaqp;Keczp:RepxbbFbbbFbbbFbbbFbp9op9qpkbbadczfhdavclfgval6mbkkalaeSmeaipxbbbbbbbbbbbbbbbbgqpklbaiabalcdtfgdaeciGglcdtgv;8qbbdnalTmbaiaipblbgocKp:RecKp:Sep;6egraocwp:RecKp:Sep;6earp;Geaoczp:RecKp:Sep;6egwp;Gep;Kep;LegDaqp:2egqarpxbbbjbbbjbbbjbbbjgkp9op9rp;Kegrpxbb;:9cbb;:9cbb;:9cbb;:9cararp;MeaDaDp;Meawaqawakp9op9rp;Kegrarp;Mep;Kep;Kep;Jep;Negwp;Mepxbbn0bbn0bbn0bbn0gqp;KepxFbbbFbbbFbbbFbbbp9oaopxbbbFbbbFbbbFbbbFp9op9qarawp;Meaqp;Kecwp:RepxbFbbbFbbbFbbbFbbp9op9qaDawp;Meaqp;Keczp:RepxbbFbbbFbbbFbbbFbp9op9qpklbkadaiav;8qbbskdnalTmbcbhvabhdinadczfgxaxpbbbgopxbbbbbbFFbbbbbbFFgkp9oadpbbbgDaopmbediwDqkzHOAKY8AEgwczp:Reczp:Sep;6egraDaopmlvorxmPsCXQL358E8FpxFubbFubbFubbFubbp9op;6eawczp:Sep;6egwp;Gearp;Gep;Kep;Legopxbbbbbbbbbbbbbbbbp:2egqarpxbbbjbbbjbbbjbbbjgmp9op9rp;Kegrpxb;:FSb;:FSb;:FSb;:FSararp;Meaoaop;Meawaqawamp9op9rp;Kegrarp;Mep;Kep;Kep;Jep;Negwp;Mepxbbn0bbn0bbn0bbn0gqp;KepxFFbbFFbbFFbbFFbbp9oaoawp;Meaqp;Keczp:Rep9qgoarawp;Meaqp;KepxFFbbFFbbFFbbFFbbp9ogrpmwDKYqk8AExm35Ps8E8Fp9qpkbbadaDakp9oaoarpmbezHdiOAlvCXorQLp9qpkbbadcafhdavclfgval6mbkkalaeSmbaiaeciGgvcitgdfcbcaad9R;8kbaiabalcitfglad;8qbbdnavTmbaiaipblzgopxbbbbbbFFbbbbbbFFgkp9oaipblbgDaopmbediwDqkzHOAKY8AEgwczp:Reczp:Sep;6egraDaopmlvorxmPsCXQL358E8FpxFubbFubbFubbFubbp9op;6eawczp:Sep;6egwp;Gearp;Gep;Kep;Legopxbbbbbbbbbbbbbbbbp:2egqarpxbbbjbbbjbbbjbbbjgmp9op9rp;Kegrpxb;:FSb;:FSb;:FSb;:FSararp;Meaoaop;Meawaqawamp9op9rp;Kegrarp;Mep;Kep;Kep;Jep;Negwp;Mepxbbn0bbn0bbn0bbn0gqp;KepxFFbbFFbbFFbbFFbbp9oaoawp;Meaqp;Keczp:Rep9qgoarawp;Meaqp;KepxFFbbFFbbFFbbFFbbp9ogrpmwDKYqk8AExm35Ps8E8Fp9qpklzaiaDakp9oaoarpmbezHdiOAlvCXorQLp9qpklbkalaiad;8qbbkk;4wllue97euv978Jjjjjbc8W9Rhidnaec98GglTmbcbhvabhoinaiaopbbbgraoczfgwpbbbgDpmlvorxmPsCXQL358E8Fgqczp:Segkclp:RepklbaopxbbjZbbjZbbjZbbjZpx;Zl81Z;Zl81Z;Zl81Z;Zl81Zakpxibbbibbbibbbibbbp9qp;6ep;NegkaraDpmbediwDqkzHOAKY8AEgrczp:Reczp:Sep;6ep;MegDaDp;Meakarczp:Sep;6ep;Megxaxp;Meakaqczp:Reczp:Sep;6ep;Megqaqp;Mep;Kep;Kep;Lepxbbbbbbbbbbbbbbbbp:4ep;Jepxb;:FSb;:FSb;:FSb;:FSgkp;Mepxbbn0bbn0bbn0bbn0grp;KepxFFbbFFbbFFbbFFbbgmp9oaxakp;Mearp;Keczp:Rep9qgxaDakp;Mearp;Keamp9oaqakp;Mearp;Keczp:Rep9qgkpmbezHdiOAlvCXorQLgrp5baipblbpEb:T:j83ibaocwfarp5eaipblbpEe:T:j83ibawaxakpmwDKYqk8AExm35Ps8E8Fgkp5baipblbpEd:T:j83ibaocKfakp5eaipblbpEi:T:j83ibaocafhoavclfgval6mbkkdnalaeSmbaiaeciGgvcitgofcbcaao9R;8kbaiabalcitfgwao;8qbbdnavTmbaiaipblbgraipblzgDpmlvorxmPsCXQL358E8Fgqczp:Segkclp:RepklaaipxbbjZbbjZbbjZbbjZpx;Zl81Z;Zl81Z;Zl81Z;Zl81Zakpxibbbibbbibbbibbbp9qp;6ep;NegkaraDpmbediwDqkzHOAKY8AEgrczp:Reczp:Sep;6ep;MegDaDp;Meakarczp:Sep;6ep;Megxaxp;Meakaqczp:Reczp:Sep;6ep;Megqaqp;Mep;Kep;Kep;Lepxbbbbbbbbbbbbbbbbp:4ep;Jepxb;:FSb;:FSb;:FSb;:FSgkp;Mepxbbn0bbn0bbn0bbn0grp;KepxFFbbFFbbFFbbFFbbgmp9oaxakp;Mearp;Keczp:Rep9qgxaDakp;Mearp;Keamp9oaqakp;Mearp;Keczp:Rep9qgkpmbezHdiOAlvCXorQLgrp5baipblapEb:T:j83ibaiarp5eaipblapEe:T:j83iwaiaxakpmwDKYqk8AExm35Ps8E8Fgkp5baipblapEd:T:j83izaiakp5eaipblapEi:T:j83iKkawaiao;8qbbkk:Pddiue978Jjjjjbc;ab9Rhidnadcd4ae2glc98GgvTmbcbheabhdinadadpbbbgocwp:Recwp:Sep;6eaocep:SepxbbjFbbjFbbjFbbjFp9opxbbjZbbjZbbjZbbjZp:Uep;Mepkbbadczfhdaeclfgeav6mbkkdnavalSmbaialciGgecdtgdVcbc;abad9R;8kbaiabavcdtfgvad;8qbbdnaeTmbaiaipblbgocwp:Recwp:Sep;6eaocep:SepxbbjFbbjFbbjFbbjFp9opxbbjZbbjZbbjZbbjZp:Uep;Mepklbkavaiad;8qbbkk9teiucbcbydj1jjbgeabcifc98GfgbBdj1jjbdndnabZbcztgd9nmbcuhiabad9RcFFifcz4nbcuSmekaehikaikkkebcjwklz9Tbb";

	var detector = new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,3,2,0,0,5,3,1,0,1,12,1,0,10,22,2,12,0,65,0,65,0,65,0,252,10,0,0,11,7,0,65,0,253,15,26,11]);
	var wasmpack = new Uint8Array([32,0,65,2,1,106,34,33,3,128,11,4,13,64,6,253,10,7,15,116,127,5,8,12,40,16,19,54,20,9,27,255,113,17,42,67,24,23,146,148,18,14,22,45,70,69,56,114,101,21,25,63,75,136,108,28,118,29,73,115]);

	if (typeof WebAssembly !== 'object') {
		return {
			supported: false,
		};
	}

	var wasm = WebAssembly.validate(detector) ? unpack(wasm_simd) : unpack(wasm_base);

	var instance;

	var ready =
		WebAssembly.instantiate(wasm, {})
		.then(function(result) {
			instance = result.instance;
			instance.exports.__wasm_call_ctors();
		});

	function unpack(data) {
		var result = new Uint8Array(data.length);
		for (var i = 0; i < data.length; ++i) {
			var ch = data.charCodeAt(i);
			result[i] = ch > 96 ? ch - 97 : ch > 64 ? ch - 39 : ch + 4;
		}
		var write = 0;
		for (var i = 0; i < data.length; ++i) {
			result[write++] = (result[i] < 60) ? wasmpack[result[i]] : (result[i] - 60) * 64 + result[++i];
		}
		return result.buffer.slice(0, write);
	}

	function decode(instance, fun, target, count, size, source, filter) {
		var sbrk = instance.exports.sbrk;
		var count4 = (count + 3) & ~3;
		var tp = sbrk(count4 * size);
		var sp = sbrk(source.length);
		var heap = new Uint8Array(instance.exports.memory.buffer);
		heap.set(source, sp);
		var res = fun(tp, count, size, sp, source.length);
		if (res == 0 && filter) {
			filter(tp, count4, size);
		}
		target.set(heap.subarray(tp, tp + count * size));
		sbrk(tp - sbrk(0));
		if (res != 0) {
			throw new Error("Malformed buffer data: " + res);
		}
	}

	var filters = {
		NONE: "",
		OCTAHEDRAL: "meshopt_decodeFilterOct",
		QUATERNION: "meshopt_decodeFilterQuat",
		EXPONENTIAL: "meshopt_decodeFilterExp",
	};

	var decoders = {
		ATTRIBUTES: "meshopt_decodeVertexBuffer",
		TRIANGLES: "meshopt_decodeIndexBuffer",
		INDICES: "meshopt_decodeIndexSequence",
	};

	return {
		ready: ready,
		supported: true,
		decodeVertexBuffer: function(target, count, size, source, filter) {
			decode(instance, instance.exports.meshopt_decodeVertexBuffer, target, count, size, source, instance.exports[filters[filter]]);
		},
		decodeIndexBuffer: function(target, count, size, source) {
			decode(instance, instance.exports.meshopt_decodeIndexBuffer, target, count, size, source);
		},
		decodeIndexSequence: function(target, count, size, source) {
			decode(instance, instance.exports.meshopt_decodeIndexSequence, target, count, size, source);
		},
		decodeGltfBuffer: function(target, count, size, source, mode, filter) {
			decode(instance, instance.exports[decoders[mode]], target, count, size, source, instance.exports[filters[filter]]);
		},
	};
}

function meshoptJS() {
    const MeshoptDecoder = {};
MeshoptDecoder.supported = true;
MeshoptDecoder.ready = Promise.resolve();

function assert(cond) {
    if (!cond) {
        throw new Error("Assertion failed");
    }
}

function dezig(v) {
    return ((v & 1) !== 0) ? ~(v >>> 1) : v >>> 1;
}

MeshoptDecoder.decodeVertexBuffer = (target, elementCount, byteStride, source, filter) => {
    assert(source[0] === 0xA0);

    const maxBlockElements = Math.min((0x2000 / byteStride) & ~0x000F, 0x100);

    const deltas = new Uint8Array(0x10);

    const tailDataOffs = source.length - byteStride;

    // What deltas are stored relative to
    const tempData = source.slice(tailDataOffs, tailDataOffs + byteStride);

    let srcOffs = 0x01;

    // Attribute Blocks
    for (let dstElemBase = 0; dstElemBase < elementCount; dstElemBase += maxBlockElements) {
        const attrBlockElementCount = Math.min(elementCount - dstElemBase, maxBlockElements);
        const groupCount = ((attrBlockElementCount + 0x0F) & ~0x0F) >>> 4;
        const headerByteCount = ((groupCount + 0x03) & ~0x03) >>> 2;

        // Data blocks
        for (let byte = 0; byte < byteStride; byte++) {
            let headerBitsOffs = srcOffs;

            srcOffs += headerByteCount;
            for (let group = 0; group < groupCount; group++) {
                const mode = (source[headerBitsOffs] >>> ((group & 0x03) << 1)) & 0x03;
                // If this is the last group, move to the next byte of header bits.
                if ((group & 0x03) === 0x03)
                    headerBitsOffs++;

                const dstElemGroup = dstElemBase + (group << 4);

                if (mode === 0) {
                    // bits 0: All 16 byte deltas are 0; the size of the encoded block is 0 bytes
                    deltas.fill(0x00);
                } else if (mode === 1) {
                    // bits 1: Deltas are using 2-bit sentinel encoding; the size of the encoded block is [4..20] bytes
                    const srcBase = srcOffs;
                    srcOffs += 0x04;
                    for (let m = 0; m < 0x10; m++) {
                        // 0 = >>> 6, 1 = >>> 4, 2 = >>> 2, 3 = >>> 0
                        const shift = (6 - ((m & 0x03) << 1));
                        let delta = (source[srcBase + (m >>> 2)] >>> shift) & 0x03;
                        if (delta === 3)
                            delta = source[srcOffs++];
                        deltas[m] = delta;
                    }
                } else if (mode === 2) {
                    // bits 2: Deltas are using 4-bit sentinel encoding; the size of the encoded block is [8..24] bytes
                    const srcBase = srcOffs;
                    srcOffs += 0x08;
                    for (let m = 0; m < 0x10; m++) {
                        // 0 = >>> 6, 1 = >>> 4, 2 = >>> 2, 3 = >>> 0
                        const shift = (m & 0x01) ? 0 : 4;
                        let delta = (source[srcBase + (m >>> 1)] >>> shift) & 0x0f;
                        if (delta === 0xf)
                            delta = source[srcOffs++];
                        deltas[m] = delta;
                    }
                } else {
                    // bits 3: All 16 byte deltas are stored verbatim; the size of the encoded block is 16 bytes
                    deltas.set(source.subarray(srcOffs, srcOffs + 0x10));
                    srcOffs += 0x10;
                }

                // Go through and apply deltas to data
                for (let m = 0; m < 0x10; m++) {
                    const dstElem = dstElemGroup + m;
                    if (dstElem >= elementCount)
                        break;

                    const delta = dezig(deltas[m]);
                    const dstOffs = dstElem * byteStride + byte;
                    target[dstOffs] = (tempData[byte] += delta);
                }
            }
        }
    }

    // Filters - only applied if filter isn't undefined or NONE
    if (filter === 'OCTAHEDRAL') {
        assert(byteStride === 4 || byteStride === 8);

        let dst, maxInt;
        if (byteStride === 4) {
            dst = new Int8Array(target.buffer);
            maxInt = 127;
        } else {
            dst = new Int16Array(target.buffer);
            maxInt = 32767;
        }

        for (let i = 0; i < 4 * elementCount; i += 4) {
            let x = dst[i + 0], y = dst[i + 1], one = dst[i + 2];
            x /= one;
            y /= one;
            const z = 1.0 - Math.abs(x) - Math.abs(y);
            const t = Math.max(-z, 0.0);
            x -= (x >= 0) ? t : -t;
            y -= (y >= 0) ? t : -t;
            const h = maxInt / Math.hypot(x, y, z);
            dst[i + 0] = Math.round(x * h);
            dst[i + 1] = Math.round(y * h);
            dst[i + 2] = Math.round(z * h);
            // keep dst[i + 3] as is
        }
    } else if (filter === 'QUATERNION') {
        assert(byteStride === 8);

        const dst = new Int16Array(target.buffer);

        for (let i = 0; i < 4 * elementCount; i += 4) {
            const inputW = dst[i + 3];
            const maxComponent = inputW & 0x03;
            const s = Math.SQRT1_2 / (inputW | 0x03);
            let x = dst[i + 0] * s;
            let y = dst[i + 1] * s;
            let z = dst[i + 2] * s;
            let w = Math.sqrt(Math.max(0.0, 1.0 - x**2 - y**2 - z**2));
            dst[i + (maxComponent + 1) % 4] = Math.round(x * 32767);
            dst[i + (maxComponent + 2) % 4] = Math.round(y * 32767);
            dst[i + (maxComponent + 3) % 4] = Math.round(z * 32767);
            dst[i + (maxComponent + 0) % 4] = Math.round(w * 32767);
        }
    } else if (filter === 'EXPONENTIAL') {
        assert((byteStride & 0x03) === 0x00);

        const src = new Int32Array(target.buffer);
        const dst = new Float32Array(target.buffer);
        for (let i = 0; i < (byteStride * elementCount) / 4; i++) {
            const v = src[i], exp = v >> 24, mantissa = (v << 8) >> 8;
            dst[i] = 2.0**exp * mantissa;
        }
    }
};

function pushfifo(fifo, n) {
    for (let i = fifo.length - 1; i > 0; i--)
        fifo[i] = fifo[i - 1];
    fifo[0] = n;
}

MeshoptDecoder.decodeIndexBuffer = (target, count, byteStride, source) => {
    assert(source[0] === 0xE1);
    assert(count % 3 === 0);
    assert(byteStride === 2 || byteStride === 4);

    let dst;
    if (byteStride === 2)
        dst = new Uint16Array(target.buffer);
    else
        dst = new Uint32Array(target.buffer);

    const triCount = count / 3;

    let codeOffs = 0x01;
    let dataOffs = codeOffs + triCount;
    let codeauxOffs = source.length - 0x10;

    function readLEB128() {
        let n = 0;
        for (let i = 0; ; i += 7) {
            const b = source[dataOffs++];
            n |= (b & 0x7F) << i;

            if (b < 0x80)
                return n;
        }
    }

    let next = 0, last = 0;
    const edgefifo = new Uint32Array(32);
    const vertexfifo = new Uint32Array(16);

    function decodeIndex(v) {
        return (last += dezig(v));
    }

    let dstOffs = 0;
    for (let i = 0; i < triCount; i++) {
        const code = source[codeOffs++];
        const b0 = code >>> 4, b1 = code & 0x0F;

        if (b0 < 0x0F) {
            const a = edgefifo[(b0 << 1) + 0], b = edgefifo[(b0 << 1) + 1];
            let c = -1;

            if (b1 === 0x00) {
                c = next++;
                pushfifo(vertexfifo, c);
            } else if (b1 < 0x0D) {
                c = vertexfifo[b1];
            } else if (b1 === 0x0D) {
                c = --last;
                pushfifo(vertexfifo, c);
            } else if (b1 === 0x0E) {
                c = ++last;
                pushfifo(vertexfifo, c);
            } else if (b1 === 0x0F) {
                const v = readLEB128();
                c = decodeIndex(v);
                pushfifo(vertexfifo, c);
            }

            // fifo pushes happen backwards
            pushfifo(edgefifo, b); pushfifo(edgefifo, c);
            pushfifo(edgefifo, c); pushfifo(edgefifo, a);

            dst[dstOffs++] = a;
            dst[dstOffs++] = b;
            dst[dstOffs++] = c;
        } else { // b0 === 0x0F
            let a = -1, b = -1, c = -1;

            if (b1 < 0x0E) {
                const e = source[codeauxOffs + b1];
                const z = e >>> 4, w = e & 0x0F;

                a = next++;

                if (z === 0x00)
                    b = next++;
                else
                    b = vertexfifo[z - 1];

                if (w === 0x00)
                    c = next++;
                else
                    c = vertexfifo[w - 1];

                pushfifo(vertexfifo, a);
                if (z === 0x00)
                    pushfifo(vertexfifo, b);
                if (w === 0x00)
                    pushfifo(vertexfifo, c);
            } else {
                const e = source[dataOffs++];
                if (e === 0x00)
                    next = 0;

                const z = e >>> 4, w = e & 0x0F;

                if (b1 === 0x0E)
                    a = next++;
                else
                    a = decodeIndex(readLEB128());

                if (z === 0x00)
                    b = next++;
                else if (z === 0x0F)
                    b = decodeIndex(readLEB128());
                else
                    b = vertexfifo[z - 1];

                if (w === 0x00)
                    c = next++;
                else if (w === 0x0F)
                    c = decodeIndex(readLEB128());
                else
                    c = vertexfifo[w - 1];

                pushfifo(vertexfifo, a);
                if (z === 0x00 || z === 0x0F)
                    pushfifo(vertexfifo, b);
                if (w === 0x00 || w === 0x0F)
                    pushfifo(vertexfifo, c);
            }

            pushfifo(edgefifo, a); pushfifo(edgefifo, b);
            pushfifo(edgefifo, b); pushfifo(edgefifo, c);
            pushfifo(edgefifo, c); pushfifo(edgefifo, a);

            dst[dstOffs++] = a;
            dst[dstOffs++] = b;
            dst[dstOffs++] = c;
        }
    }
};

MeshoptDecoder.decodeIndexSequence = (target, count, byteStride, source) => {
    assert(source[0] === 0xD1);
    assert(byteStride === 2 || byteStride === 4);

    let dst;
    if (byteStride === 2)
        dst = new Uint16Array(target.buffer);
    else
        dst = new Uint32Array(target.buffer);

    let dataOffs = 0x01;

    function readLEB128() {
        let n = 0;
        for (let i = 0; ; i += 7) {
            const b = source[dataOffs++];
            n |= (b & 0x7F) << i;

            if (b < 0x80)
                return n;
        }
    }

    const last = new Uint32Array(2);

    for (let i = 0; i < count; i++) {
        const v = readLEB128();
        const b = (v & 0x01);
        const delta = dezig(v >>> 1);
        dst[i] = (last[b] += delta);
    }
};

MeshoptDecoder.decodeGltfBuffer = (target, count, size, source, mode, filter) => {
    var table = {
        ATTRIBUTES: MeshoptDecoder.decodeVertexBuffer,
        TRIANGLES: MeshoptDecoder.decodeIndexBuffer,
        INDICES: MeshoptDecoder.decodeIndexSequence,
    };
    assert(table[mode] !== undefined);
    table[mode](target, count, size, source, filter);
};

    return MeshoptDecoder;
}

// =====================================================================
//  ASSETS: self-contained GLB loader, preloading, instancing, animation
// =====================================================================

const GLB = {
  cache: new Map(),
  // decoded images and textures are shared between all GLBs by content (identical images upload once)
  imgCache: new Map(), texShared: new Map(), imgTex: new Map(),
  texScale: 1, texMin: 64,

  hash(u8) {
    let h1 = 0x811c9dc5 ^ u8.length, h2 = 0x9e3779b1, i = 0;
    // (four bytes at a time where the data sits on a 4 byte boundary, the usual case in a GLB)
    if ((u8.byteOffset & 3) === 0) {
      const n = u8.length >> 2, w = new Uint32Array(u8.buffer, u8.byteOffset, n);
      for (; i < n; i++) { const c = w[i]; h1 = Math.imul(h1 ^ c, 16777619); h2 = Math.imul(h2 ^ (c + i), 2246822519); }
      i = n << 2;
    }
    for (; i < u8.length; i++) { const c = u8[i]; h1 = Math.imul(h1 ^ c, 16777619); h2 = Math.imul(h2 ^ (c + i), 2246822519); }
    return (h1 >>> 0).toString(36) + '_' + (h2 >>> 0).toString(36) + '_' + u8.length.toString(36);
  },
  // data: URI -> bytes (decoded here: a page's security policy may not allow fetching data: URLs)
  dataURI(u) {
    const i = u.indexOf(','), meta = u.slice(5, i), body = u.slice(i + 1);
    if (!/;base64/i.test(meta)) return new TextEncoder().encode(decodeURIComponent(body));
    const bin = atob(body), out = new Uint8Array(bin.length);
    for (let k = 0; k < bin.length; k++) out[k] = bin.charCodeAt(k);
    return out;
  },
  // decode (and downscale for the lower quality settings) once per unique image
  image(bytes, mime) {
    const key = this.hash(bytes);
    if (!this.imgCache.has(key)) {
      const blob = new Blob([bytes], { type: mime || 'image/png' });
      this.imgCache.set(key, this.decode(blob).then((img) => ({ key, img })));
    }
    return this.imgCache.get(key);
  },
  async decode(blob) {
    const opt = { premultiplyAlpha: 'none', colorSpaceConversion: 'none' };
    let img = null;
    try { if (typeof createImageBitmap === 'function') img = await createImageBitmap(blob, opt); } catch (e) { img = null; }
    if (!img) img = await new Promise((res, rej) => { const u = URL.createObjectURL(blob); const im = new Image(); im.onload = () => { URL.revokeObjectURL(u); res(im); }; im.onerror = rej; im.src = u; });
    const s = this.texScale, w = img.width, h = img.height;
    if (s < 1 && Math.max(w, h) > this.texMin) {
      const k = Math.max(s, this.texMin / Math.max(w, h)), nw = Math.max(1, Math.round(w * k)), nh = Math.max(1, Math.round(h * k));
      try {
        if (typeof createImageBitmap === 'function') { const r = await createImageBitmap(img, Object.assign({ resizeWidth: nw, resizeHeight: nh, resizeQuality: 'high' }, opt)); if (img.close) img.close(); img = r; }
      } catch (e) { /* keep the full size image */ }
    }
    return img;
  },
  // after the GPU upload the decoded copy is not needed any more: free it once every texture using it is uploaded
  release(t) {
    t.userData.uploaded = true;
    const users = this.imgTex.get(t.userData.imgKey);
    if (!users || ![...users].every((u) => u.userData.uploaded)) return;
    const img = t.image;
    if (img && typeof img.close === 'function') { const w = img.width, h = img.height; img.close(); for (const u of users) u.image = { width: w, height: h, closed: true }; }
  },

  // EXT_meshopt_compression (the models' geometry): the WebAssembly decoder, or the plain JavaScript one where the
  // page may not run WebAssembly
  meshopt() {
    if (!this._mo) {
      this._mo = (async () => {
        try { const d = meshoptWasm(); if (d.supported !== false) { await d.ready; return d; } } catch (e) { /* no WebAssembly here */ }
        return meshoptJS();
      })();
    }
    return this._mo;
  },

  load(url, onBytes) {
    if (!this.cache.has(url)) {
      const p = this.fetchBytes(url, onBytes).then((b) => this.parse(b, url));
      this.cache.set(url, p);
    }
    return this.cache.get(url);
  },
  // fetch a file, counting its bytes as they come in (for the loading counter)
  async fetchBytes(url, onBytes) {
    const r = await fetch(url);
    if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + url);
    if (!onBytes || !r.body || !r.body.getReader) return r.arrayBuffer();
    const len = +(r.headers.get('content-length') || 0), rd = r.body.getReader(), parts = [];
    let got = 0;
    for (;;) { const { done, value } = await rd.read(); if (done) break; parts.push(value); got += value.length; onBytes(got, len); }
    const out = new Uint8Array(got);
    let o = 0; for (const c of parts) { out.set(c, o); o += c.length; }
    return out.buffer;
  },

  async parse(ab, name = 'glb') {
    const dv = new DataView(ab);
    let json = null, bin = null;
    if (dv.getUint32(0, true) === 0x46546C67) {
      const len = dv.getUint32(8, true);
      let off = 12;
      while (off < len) {
        const cl = dv.getUint32(off, true), ct = dv.getUint32(off + 4, true);
        if (ct === 0x4E4F534A) json = JSON.parse(new TextDecoder().decode(new Uint8Array(ab, off + 8, cl)));
        else if (ct === 0x004E4942) bin = new Uint8Array(ab, off + 8, cl);
        off += 8 + cl;
      }
    } else json = JSON.parse(new TextDecoder().decode(new Uint8Array(ab)));
    const A = { name, json, bin, accessors: [], textures: [], materials: [], meshes: [], clips: [], vcMats: new Map() };
    const base = name.includes('/') ? name.slice(0, name.lastIndexOf('/') + 1) : '';
    const bufs = await Promise.all((json.buffers || []).map((b, i) => {
      if (b.uri === undefined) return i === 0 ? bin : null;   // (a meshopt fallback buffer holds no data of its own)
      if (b.uri.startsWith('data:')) return GLB.dataURI(b.uri);
      return fetch(base + b.uri).then((r) => r.arrayBuffer()).then((x) => new Uint8Array(x));
    }));
    // compressed views are decoded once, on first use
    const MO = (json.extensionsUsed || []).includes('EXT_meshopt_compression') ? await GLB.meshopt() : null, decoded = [];
    const viewBytes = (bvI) => {
      const bv = json.bufferViews[bvI], x = bv.extensions && bv.extensions.EXT_meshopt_compression;
      if (x && MO) {
        if (!decoded[bvI]) {
          const src = bufs[x.buffer || 0], t = new Uint8Array(x.count * x.byteStride);
          MO.decodeGltfBuffer(t, x.count, x.byteStride, new Uint8Array(src.buffer, src.byteOffset + (x.byteOffset || 0), x.byteLength), x.mode, x.filter || 'NONE');
          decoded[bvI] = t;
        }
        return decoded[bvI];
      }
      const b = bufs[bv.buffer || 0];
      return new Uint8Array(b.buffer, b.byteOffset + (bv.byteOffset || 0), bv.byteLength);
    };
    const NC = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT2: 4, MAT3: 9, MAT4: 16 };
    const TA = { 5120: Int8Array, 5121: Uint8Array, 5122: Int16Array, 5123: Uint16Array, 5125: Uint32Array, 5126: Float32Array };
    const accessor = (i) => {
      if (A.accessors[i]) return A.accessors[i];
      const a = json.accessors[i], n = NC[a.type], T = TA[a.componentType];
      let arr;
      if (a.bufferView === undefined) arr = new T(a.count * n);
      else {
        const bv = json.bufferViews[a.bufferView], bytes = viewBytes(a.bufferView);
        const es = T.BYTES_PER_ELEMENT, stride = bv.byteStride || es * n, off = a.byteOffset || 0;
        if (stride === es * n && (bytes.byteOffset + off) % es === 0) arr = new T(bytes.buffer, bytes.byteOffset + off, a.count * n);
        else {
          arr = new T(a.count * n);
          const src = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
          const get = { 5120: 'getInt8', 5121: 'getUint8', 5122: 'getInt16', 5123: 'getUint16', 5125: 'getUint32', 5126: 'getFloat32' }[a.componentType];
          for (let k = 0; k < a.count; k++) for (let c = 0; c < n; c++) arr[k * n + c] = src[get](off + k * stride + c * es, true);
        }
      }
      if (a.sparse) {
        arr = arr.slice();
        const sp = a.sparse, ib = viewBytes(sp.indices.bufferView), vb = viewBytes(sp.values.bufferView);
        const IT = TA[sp.indices.componentType];
        const ids = new IT(ib.buffer, ib.byteOffset + (sp.indices.byteOffset || 0), sp.count);
        const vals = new T(vb.buffer, vb.byteOffset + (sp.values.byteOffset || 0), sp.count * n);
        for (let k = 0; k < sp.count; k++) for (let c = 0; c < n; c++) arr[ids[k] * n + c] = vals[k * n + c];
      }
      return (A.accessors[i] = { array: arr, itemSize: n, normalized: !!a.normalized, count: a.count });
    };
    // ---- images / textures
    const images = await Promise.all((json.images || []).map(async (im) => {
      if (im.bufferView !== undefined) return GLB.image(viewBytes(im.bufferView), im.mimeType);
      const bytes = im.uri.startsWith('data:') ? GLB.dataURI(im.uri) : new Uint8Array(await fetch(base + im.uri).then((r) => r.arrayBuffer()));
      return GLB.image(bytes, im.mimeType);
    }));
    const texture = (ti, srgb) => {
      const td = json.textures[ti], sm = (json.samplers || [])[td.sampler] || {};
      const src = td.source !== undefined ? td.source : (td.extensions && td.extensions.EXT_texture_webp ? td.extensions.EXT_texture_webp.source : 0);
      const I = images[src];
      const W = { 33071: THREE.ClampToEdgeWrapping, 33648: THREE.MirroredRepeatWrapping, 10497: THREE.RepeatWrapping };
      const wS = W[sm.wrapS] || THREE.RepeatWrapping, wT = W[sm.wrapT] || THREE.RepeatWrapping;
      const mag = sm.magFilter === 9728 ? THREE.NearestFilter : THREE.LinearFilter;
      const min = sm.minFilter === 9728 ? THREE.NearestFilter : sm.minFilter === 9729 ? THREE.LinearFilter : THREE.LinearMipmapLinearFilter;
      const key = I.key + (srgb ? '_s_' : '_l_') + wS + '_' + wT + '_' + mag + '_' + min;
      let t = GLB.texShared.get(key);
      if (!t) {
        t = new THREE.Texture(I.img);
        t.flipY = false;
        t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
        t.wrapS = wS; t.wrapT = wT; t.magFilter = mag; t.minFilter = min;
        t.anisotropy = GLB.anisotropy || 4;
        t.userData.imgKey = I.key;
        t.onUpdate = () => GLB.release(t);
        t.needsUpdate = true;
        GLB.texShared.set(key, t);
        if (!GLB.imgTex.has(I.key)) GLB.imgTex.set(I.key, new Set());
        GLB.imgTex.get(I.key).add(t);
      }
      if (!A.textures.includes(t)) A.textures.push(t);
      return t;
    };
    // ---- materials
    A.materials = (json.materials || []).map((md) => {
      const pbr = md.pbrMetallicRoughness || {}, ext = md.extensions || {};
      const unlit = !!ext.KHR_materials_unlit;
      // (sheen and clearcoat add a second lobe for every light: only where they show, and not on low quality.
      // A faint sheen colour or a thin coat is left out)
      const shx = ext.KHR_materials_sheen, ccx = ext.KHR_materials_clearcoat;
      const useSheen = !!shx && SETTINGS.quality >= 1 && Math.max(...(shx.sheenColorFactor || [0, 0, 0])) >= 0.04;
      const useCoat = !!ccx && SETTINGS.quality >= 1 && (ccx.clearcoatFactor ?? 0) >= 0.3;
      const phys = useSheen || useCoat || ext.KHR_materials_transmission;
      const m = unlit ? new THREE.MeshBasicMaterial() : phys ? new THREE.MeshPhysicalMaterial() : new THREE.MeshStandardMaterial();
      m.name = md.name || '';
      const bc = pbr.baseColorFactor || [1, 1, 1, 1];
      m.color.setRGB(bc[0], bc[1], bc[2], THREE.LinearSRGBColorSpace);
      m.opacity = bc[3];
      if (pbr.baseColorTexture) m.map = texture(pbr.baseColorTexture.index, true);
      if (!unlit) {
        m.metalness = pbr.metallicFactor ?? 1; m.roughness = pbr.roughnessFactor ?? 1;
        if (pbr.metallicRoughnessTexture) { const t = texture(pbr.metallicRoughnessTexture.index, false); m.metalnessMap = t; m.roughnessMap = t; }
        if (md.normalTexture) { m.normalMap = texture(md.normalTexture.index, false); const s = md.normalTexture.scale ?? 1; m.normalScale.set(s, -s); }
        if (md.occlusionTexture) { m.aoMap = texture(md.occlusionTexture.index, false); m.aoMapIntensity = md.occlusionTexture.strength ?? 1; }
        if (md.emissiveFactor) m.emissive.setRGB(md.emissiveFactor[0], md.emissiveFactor[1], md.emissiveFactor[2], THREE.LinearSRGBColorSpace);
        if (md.emissiveTexture) m.emissiveMap = texture(md.emissiveTexture.index, true);
        if (ext.KHR_materials_emissive_strength) m.emissiveIntensity = ext.KHR_materials_emissive_strength.emissiveStrength;
        if (useSheen) { const s = shx; m.sheen = 1; m.sheenColor.setRGB(...(s.sheenColorFactor || [0, 0, 0]), THREE.LinearSRGBColorSpace); m.sheenRoughness = s.sheenRoughnessFactor ?? 0; }
        if (useCoat) { const c = ccx; m.clearcoat = c.clearcoatFactor ?? 0; m.clearcoatRoughness = c.clearcoatRoughnessFactor ?? 0; }
      }
      if (md.alphaMode === 'BLEND') { m.transparent = true; m.depthWrite = false; }
      else if (md.alphaMode === 'MASK') m.alphaTest = md.alphaCutoff ?? 0.5;
      else m.opacity = 1;
      if (md.doubleSided) m.side = THREE.DoubleSide;
      m.userData = Object.assign({}, md.extras || {});
      if (shx) m.userData.glbSheen = true;
      return m;
    });
    const defMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.8 });
    // (quantized normals, uvs or positions go back to floats: the game merges and transforms them as such)
    const deq = new Map();
    const floatAttr = (k, ai) => {
      const a = accessor(ai);
      if (!a.normalized || a.array instanceof Float32Array || !/^(NORMAL|TANGENT|POSITION|TEXCOORD)/.test(k)) return a;
      if (!deq.has(ai)) {
        const q = a.array, d = q instanceof Int8Array ? 127 : q instanceof Uint8Array ? 255 : q instanceof Int16Array ? 32767 : 65535, f = new Float32Array(q.length);
        for (let i = 0; i < q.length; i++) f[i] = Math.max(q[i] / d, -1);
        deq.set(ai, { array: f, itemSize: a.itemSize, normalized: false, count: a.count });
      }
      return deq.get(ai);
    };
    // ---- meshes (geometry per primitive)
    A.meshes = (json.meshes || []).map((md) => md.primitives.map((p) => {
      const g = new THREE.BufferGeometry();
      const AM = { POSITION: 'position', NORMAL: 'normal', TEXCOORD_0: 'uv', TEXCOORD_1: 'uv1', COLOR_0: 'color', JOINTS_0: 'skinIndex', WEIGHTS_0: 'skinWeight', TANGENT: 'tangent' };
      for (const [k, ai] of Object.entries(p.attributes)) {
        const nm = AM[k]; if (!nm) continue;
        const a = floatAttr(k, ai);
        g.setAttribute(nm, new THREE.BufferAttribute(a.array, a.itemSize, a.normalized));
      }
      if (p.indices !== undefined) { const a = accessor(p.indices); g.setIndex(new THREE.BufferAttribute(a.array, 1)); }
      if (p.targets) {
        g.morphAttributes.position = p.targets.filter((t) => t.POSITION !== undefined).map((t) => { const a = accessor(t.POSITION); return new THREE.BufferAttribute(a.array, 3); });
        g.morphTargetsRelative = true;
      }
      g.computeBoundingSphere();
      let mat = p.material !== undefined ? A.materials[p.material] : defMat;
      if (p.attributes.COLOR_0 !== undefined && !mat.vertexColors) {
        const key = p.material ?? -1;
        if (!A.vcMats.has(key)) { const c = mat.clone(); c.vertexColors = true; A.vcMats.set(key, c); }
        mat = A.vcMats.get(key);
      }
      return { geometry: g, material: mat, skinned: p.attributes.JOINTS_0 !== undefined, morph: !!p.targets, mode: p.mode ?? 4 };
    }));
    // ---- skins (inverse bind matrices, shared)
    A.skins = (json.skins || []).map((s) => {
      const inv = [];
      if (s.inverseBindMatrices !== undefined) { const a = accessor(s.inverseBindMatrices); for (let k = 0; k < s.joints.length; k++) inv.push(new THREE.Matrix4().fromArray(a.array, k * 16)); }
      else for (let k = 0; k < s.joints.length; k++) inv.push(new THREE.Matrix4());
      return { joints: s.joints, inverses: inv };
    });
    A.jointSet = new Set(); (json.skins || []).forEach((s) => s.joints.forEach((i) => A.jointSet.add(i)));
    // ---- animations
    A.clips = (json.animations || []).map((an, ai) => {
      const tracks = [];
      for (const ch of an.channels) {
        const smp = an.samplers[ch.sampler], nd = json.nodes[ch.target.node];
        if (!nd) continue;
        const nodeName = GLB.nodeName(nd, ch.target.node);
        const times = accessor(smp.input).array, vals = accessor(smp.output);
        let values = vals.array;
        if (vals.normalized || !(values instanceof Float32Array)) { const f = new Float32Array(values.length); const div = { 1: 127, 2: 255 }[values.BYTES_PER_ELEMENT] || 1; for (let k = 0; k < f.length; k++) f[k] = values[k] / div; values = f; }
        const interp = smp.interpolation === 'STEP' ? THREE.InterpolateDiscrete : THREE.InterpolateLinear;
        if (smp.interpolation === 'CUBICSPLINE') { // keep the values, drop tangents
          const n = values.length / times.length / 3, out = new Float32Array(times.length * n);
          for (let k = 0; k < times.length; k++) for (let c = 0; c < n; c++) out[k * n + c] = values[k * 3 * n + n + c];
          values = out;
        }
        const path = ch.target.path;
        let tr;
        if (path === 'rotation') tr = new THREE.QuaternionKeyframeTrack(nodeName + '.quaternion', times, values, interp);
        else if (path === 'translation') tr = new THREE.VectorKeyframeTrack(nodeName + '.position', times, values, interp);
        else if (path === 'scale') tr = new THREE.VectorKeyframeTrack(nodeName + '.scale', times, values, interp);
        else if (path === 'weights') tr = new THREE.NumberKeyframeTrack(nodeName + '.morphTargetInfluences', times, values, interp);
        if (tr) tracks.push(tr);
      }
      return new THREE.AnimationClip(an.name || ('anim' + ai), -1, tracks);
    });
    A.clipMap = {}; for (const c of A.clips) A.clipMap[c.name] = c;
    A.nodeIndex = {}; json.nodes.forEach((n, i) => { A.nodeIndex[GLB.nodeName(n, i)] = i; });
    return A;
  },

  nodeName(nd, i) { return THREE.PropertyBinding.sanitizeNodeName(nd.name || ('node_' + i)); },

  // build a fresh object hierarchy (shares geometry, materials, textures and clips)
  instantiate(A, rootNames = null, opts = {}) {
    const j = A.json, objs = [];
    const make = (i) => {
      if (objs[i]) return objs[i];
      const nd = j.nodes[i];
      let o;
      const prims = nd.mesh !== undefined ? A.meshes[nd.mesh] : null;
      const meshFor = (p) => {
        let m;
        if (p.skinned && nd.skin !== undefined) m = new THREE.SkinnedMesh(p.geometry, p.material);
        else m = new THREE.Mesh(p.geometry, p.material);
        if (p.morph) m.updateMorphTargets();
        m.castShadow = opts.cast !== false; m.receiveShadow = opts.receive !== false;
        return m;
      };
      if (A.jointSet.has(i)) o = new THREE.Bone();
      else if (prims && prims.length === 1) o = meshFor(prims[0]);
      else o = new THREE.Object3D();
      if (prims && (prims.length > 1 || A.jointSet.has(i))) prims.forEach((p, k) => { const m = meshFor(p); m.name = GLB.nodeName(nd, i) + '_p' + k; o.add(m); });
      o.name = GLB.nodeName(nd, i);
      if (nd.matrix) { o.matrix.fromArray(nd.matrix); o.matrix.decompose(o.position, o.quaternion, o.scale); }
      else {
        if (nd.translation) o.position.fromArray(nd.translation);
        if (nd.rotation) o.quaternion.fromArray(nd.rotation);
        if (nd.scale) o.scale.fromArray(nd.scale);
      }
      o.userData = Object.assign({}, nd.extras || {});
      objs[i] = o;
      for (const c of nd.children || []) o.add(make(c));
      return o;
    };
    const root = new THREE.Group();
    root.name = opts.name || 'glb';
    let roots;
    if (rootNames) roots = rootNames.map((n) => (typeof n === 'number' ? n : A.nodeIndex[THREE.PropertyBinding.sanitizeNodeName(n)])).filter((x) => x !== undefined);
    else roots = (j.scenes && j.scenes[j.scene || 0] ? j.scenes[j.scene || 0].nodes : j.nodes.map((_, i) => i));
    for (const r of roots) { const o = make(r); if (rootNames) { o.position.set(0, 0, 0); } root.add(o); }
    // skins
    root.updateMatrixWorld(true);
    j.nodes.forEach((nd, i) => {
      if (nd.skin === undefined || !objs[i]) return;
      const sk = A.skins[nd.skin];
      const bones = sk.joints.map((ji) => objs[ji] || make(ji));
      const skeleton = new THREE.Skeleton(bones, sk.inverses.map((m) => m.clone()));
      const targets = [];
      objs[i].traverse((o) => { if (o.isSkinnedMesh && (o === objs[i] || o.parent === objs[i])) targets.push(o); });
      for (const m of targets) { m.bind(skeleton, m.matrixWorld); m.frustumCulled = false; }
    });
    root.userData.asset = A;
    return root;
  },

  find(root, name) { const n = THREE.PropertyBinding.sanitizeNodeName(name); let r = null; root.traverse((o) => { if (!r && o.name === n) r = o; }); return r; },
};

const Assets = {
  data: {}, tex: {}, failed: {}, loaded: 0, total: 0,
  // the house, the player and the items come first (the title screen needs them). The haunts, the bosses and
  // their helpers come right after, while the title is up (loadLater): New Game waits for them if it has to
  LATER: ['pumpkin', 'candy', 'stitch', 'ghost', 'devil', 'imp', 'jack', 'maw', 'stitches', 'visitor', 'uninvited', 'vhs', 'boogey', 'sock', 'moth'],
  later: null, laterDone: false,
  // texture detail follows the quality setting at load time (high: full size, medium: 1/2, low: 1/4)
  texScaleFor(q) { return q >= 2 ? 1 : q === 1 ? 0.5 : 0.25; },
  async loadAll(meter) {
    const jobs = [];
    GLB.texScale = this.texScale = this.texScaleFor(SETTINGS.quality);
    const models = Object.entries(ASSETS.models).filter(([k]) => !this.LATER.includes(k)), texs = Object.entries(ASSETS.textures);
    this.total = models.length + texs.length; this.loaded = 0;
    const tick = () => { this.loaded++; };
    for (const [k, url] of models) {
      const u = assetURL(url), m = meter.file(url, u);
      jobs.push(GLB.load(u, m.bytes).then((a) => { this.data[k] = a; }).catch((e) => { this.failed[k] = String(e); console.warn('[assets] model unavailable, using fallback:', k, e && e.message); }).finally(() => { m.done(); tick(); }));
    }
    const tl = new THREE.TextureLoader();
    const shrink = (t) => {
      const s = this.texScale, img = t.image;
      if (s >= 1 || !img || typeof document === 'undefined') return t;
      const w = img.width, h = img.height, k = Math.max(s, 128 / Math.max(w, h));
      if (k >= 1) return t;
      const cv = document.createElement('canvas'); cv.width = Math.max(1, Math.round(w * k)); cv.height = Math.max(1, Math.round(h * k));
      const g = cv.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(img, 0, 0, cv.width, cv.height);
      t.image = cv; t.needsUpdate = true;
      return t;
    };
    for (const [k, set] of texs) {
      // (decoded off the main thread before the upload where the browser can: the upload doesn't decode it then)
      const decoded = (t) => (t.image && t.image.decode ? t.image.decode().catch(() => { }).then(() => t) : t);
      // (fetched first, so the counter sees its bytes come in; then loaded as before, from the downloaded copy)
      const fetched = (u, m) => GLB.fetchBytes(u, m.bytes).then((b) => {
        const blobURL = URL.createObjectURL(new Blob([b], { type: /\.png(\?|$)/i.test(u) ? 'image/png' : /\.webp(\?|$)/i.test(u) ? 'image/webp' : 'image/jpeg' }));
        return tl.loadAsync(blobURL).then(decoded).finally(() => URL.revokeObjectURL(blobURL));
      });
      const one = (url, srgb) => {
        if (!url) return Promise.resolve(null);
        const u = assetURL(url), m = meter.file(url, u);
        return fetched(u, m).then((t) => { t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = GLB.anisotropy || 8; return shrink(t); }).catch(() => null).finally(m.done);
      };
      jobs.push(Promise.all([one(set.map, true), one(set.normal, false), one(set.rough, false)]).then(([map, normal, rough]) => { if (map) this.tex[k] = { map, normal, rough }; else this.failed[k] = 'texture'; }).finally(tick));
    }
    await Promise.all(jobs);
    // (the arcade cabinet's screen picture is copied out before upload() frees the decoded images: the attract
    // mode draws it, ArcadeScreen)
    ArcadeScreen.grab(this.data.arcade);
  },
  // the haunts (LATER): fetched once the house is in, so they don't share the line with it. Their own counter
  // (laterMeter: shown if New Game has to wait for them)
  laterMeter: new LoadMeter({ dl: 0.55, gpu: 0.1, shaders: 0.3, photos: 0.05 }),
  get laterProg() { return this.laterDone ? 1 : this.laterMeter.value; },
  loadLater() {
    if (this.later) return this.later;
    const keys = this.LATER.filter((k) => ASSETS.models[k]);
    this.later = Promise.all(keys.map((k) => {
      const u = assetURL(ASSETS.models[k]), m = this.laterMeter.file(ASSETS.models[k], u);
      return GLB.load(u, m.bytes).then((a) => { this.data[k] = a; })
        .catch((e) => { this.failed[k] = String(e); console.warn('[assets] model unavailable, using fallback:', k, e && e.message); })
        .finally(m.done);
    }));
    return this.later;
  },
  // upload every model texture to the GPU while the loading screen is up (no hitches when a room first comes
  // into view; the decoded copies are freed right after their upload). Again for the haunts: only what's new
  async upload(renderer, onProgress) {
    const list = [...GLB.texShared.values()].filter((t) => !t.userData.uploaded);
    // (the floors', walls' and rugs' surface sets too: they were decoded and sent up on first sight)
    for (const k in this.tex) for (const t of [this.tex[k].map, this.tex[k].normal, this.tex[k].rough]) if (t) list.push(t);
    let last = performance.now();
    for (let i = 0; i < list.length; i++) {
      try { renderer.initTexture(list[i]); } catch (e) { /* uploaded on first use instead */ }
      if (performance.now() - last > 30) { if (onProgress) onProgress(i / list.length); await new Promise((r) => setTimeout(r, 0)); last = performance.now(); }
    }
    if (onProgress) onProgress(1);
  },
  has(k) { return !!this.data[k]; },
  inst(k, opts = {}) { return GLB.instantiate(this.data[k], opts.nodes || null, opts); },
  clips(k) { return this.data[k] ? this.data[k].clips : []; },
  additive(k, name) {
    const A = this.data[k]; if (!A) return null;
    A.additive = A.additive || {};
    if (!A.additive[name] && A.clipMap[name]) A.additive[name] = THREE.AnimationUtils.makeClipAdditive(A.clipMap[name].clone());
    return A.additive[name] || null;
  },
};

// crossfading clip player for one character instance
class Animator {
  constructor(root, assetKey) {
    this.key = assetKey;
    this.mixer = new THREE.AnimationMixer(root);
    this.clips = {};
    for (const c of Assets.clips(assetKey)) this.clips[c.name] = c;
    this.actions = {}; this.cur = null; this.curName = null; this.flinches = {};
  }
  has(n) { return !!this.clips[n]; }
  action(n) { if (!this.clips[n]) return null; return this.actions[n] || (this.actions[n] = this.mixer.clipAction(this.clips[n])); }
  play(n, fade = 0.15, opts = {}) {
    const a = this.action(n);
    if (!a) return false;
    if (this.curName === n && !opts.restart) { if (opts.speed != null) a.timeScale = opts.speed; return true; }
    const once = !!opts.once;
    a.reset(); a.enabled = true;
    a.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat, Infinity);
    a.clampWhenFinished = once;
    a.timeScale = opts.speed ?? 1;
    a.setEffectiveWeight(1);
    a.play();
    if (this.cur && this.cur !== a) { if (fade > 0) this.cur.crossFadeTo(a, fade, false); else this.cur.stop(); }
    if (opts.at != null) a.time = opts.at * a.getClip().duration;
    this.cur = a; this.curName = n;
    return true;
  }
  speed(s) { if (this.cur) this.cur.timeScale = s; }
  finished() { return !!this.cur && this.cur.loop === THREE.LoopOnce && this.cur.time >= this.cur.getClip().duration - 1e-3; }
  flinch(n, w = 1) {
    let a = this.flinches[n];
    if (!a) { const clip = Assets.additive(this.key, n); if (!clip) return; a = this.flinches[n] = this.mixer.clipAction(clip); a.blendMode = THREE.AdditiveAnimationBlendMode; a.setLoop(THREE.LoopOnce, 1); a.clampWhenFinished = false; }
    a.reset(); a.setEffectiveWeight(w); a.play();
  }
  update(dt) { this.mixer.update(dt); }
  stopAll() { this.mixer.stopAllAction(); this.cur = null; this.curName = null; }
}

// =====================================================================
//  TEXTURES: procedural canvas textures (low-res, 90s / PS1 flavour)
// =====================================================================
const Tex = {
  cache: {},
  canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; },
  make(key, w, h, draw, opts = {}) {
    if (this.cache[key]) return this.cache[key];
    const c = this.canvas(w, h);
    const g = c.getContext('2d', opts.readback ? { willReadFrequently: true } : undefined);
    const rng = mulberry32(opts.seed || key.length * 7919 + w);
    draw(g, w, h, rng);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = opts.clamp ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping;
    t.magFilter = opts.smooth || !SETTINGS.retro ? THREE.LinearFilter : THREE.NearestFilter;
    t.userData.smooth = !!opts.smooth;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.anisotropy = 4;
    t.userData.canvas = c;
    this.cache[key] = t;
    return t;
  },
  // per pixel grain
  grain(g, w, h, amt, rng) {
    const id = g.getImageData(0, 0, w, h), d = id.data;
    for (let i = 0; i < d.length; i += 4) {
      const n = (rng() - 0.5) * amt;
      d[i] = clamp(d[i] + n, 0, 255); d[i + 1] = clamp(d[i + 1] + n, 0, 255); d[i + 2] = clamp(d[i + 2] + n, 0, 255);
    }
    g.putImageData(id, 0, 0);
  },
  speckle(g, w, h, n, colors, rng, size = 1) {
    for (let i = 0; i < n; i++) { g.fillStyle = colors[Math.floor(rng() * colors.length)]; g.fillRect(Math.floor(rng() * w), Math.floor(rng() * h), size, size); }
  },
  shade(hex, f) { const c = new THREE.Color(hex); c.multiplyScalar(f); return '#' + c.getHexString(); },
  applyFilter() {
    for (const k in this.cache) { const t = this.cache[k]; const f = t.userData.smooth || !SETTINGS.retro ? THREE.LinearFilter : THREE.NearestFilter; if (t.magFilter !== f) { t.magFilter = f; t.needsUpdate = true; } }
  },
};

// --- wall: 128px = 1m wide, 384px = 3m tall (top of canvas = ceiling) ---
function wallTexture(kind) {
  return Tex.make('wall_' + kind, 128, 384, (g, w, h, rng) => {
    const P = {
      hall: { base: '#33402f', motif: '#4a5a43', accent: '#7a6c3c', wain: '#3a2316', wainHi: '#563624', rail: '#2a170e' },
      kitchen: { base: '#d4c58e', motif: '#b84a3a', accent: '#4f7a4a', wain: '#d6cfbd', wainHi: '#ebe5d6', rail: '#9c8e6e' },
      living: { base: '#5d3b2a', motif: '#6d4733', accent: '#a07a3e', wain: '#4b2f1e', wainHi: '#5e3d27', rail: '#2e1b10' },
      bedroom: { base: '#3b4766', motif: '#55638a', accent: '#d8c27a', wain: '#bdb6a7', wainHi: '#d4cdbd', rail: '#8a8273' },
      basement: { base: '#3b3833', motif: '#46423c', accent: '#2a2724', wain: '#3b3833', wainHi: '#4a4640', rail: '#2a2724' },
      outside: { base: '#6f7a80', motif: '#5c666b', accent: '#4a5357', wain: '#6f7a80', wainHi: '#7c878d', rail: '#4a5357' },
    }[kind];
    g.fillStyle = P.base; g.fillRect(0, 0, w, h);
    const ppm = 128;
    const wainTop = h - 0.9 * ppm;
    if (kind === 'basement') {
      // stone blocks
      const bh = 24;
      for (let y = 0; y < h; y += bh) {
        const off = ((y / bh) % 2) * 32;
        for (let x = -64; x < w + 64; x += 64) {
          const v = 0.8 + rng() * 0.35;
          g.fillStyle = Tex.shade(P.base, v); g.fillRect(x + off + 1, y + 1, 62, bh - 2);
        }
      }
      g.fillStyle = 'rgba(0,0,0,.35)';
      for (let y = 0; y < h; y += bh) g.fillRect(0, y, w, 1);
      Tex.speckle(g, w, h, 900, ['#2b2926', '#57524a', '#3f3a33'], rng, 2);
      // damp stains
      for (let i = 0; i < 5; i++) { g.fillStyle = 'rgba(20,24,18,.25)'; g.beginPath(); g.ellipse(rng() * w, h - rng() * 80, 10 + rng() * 25, 20 + rng() * 40, 0, 0, TAU); g.fill(); }
      Tex.grain(g, w, h, 18, rng);
      return;
    }
    if (kind === 'outside') {
      // clapboard siding
      for (let y = 0; y < h; y += 16) {
        g.fillStyle = Tex.shade(P.base, 0.92 + rng() * 0.12); g.fillRect(0, y, w, 16);
        g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, y + 14, w, 2);
        g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(0, y, w, 2);
      }
      Tex.grain(g, w, h, 14, rng);
      return;
    }
    // wallpaper pattern
    if (kind === 'hall') {
      // damask
      const drawDamask = (cx, cy, s) => {
        g.fillStyle = P.motif;
        g.beginPath();
        g.moveTo(cx, cy - 26 * s);
        g.bezierCurveTo(cx + 18 * s, cy - 14 * s, cx + 14 * s, cy + 6 * s, cx, cy + 26 * s);
        g.bezierCurveTo(cx - 14 * s, cy + 6 * s, cx - 18 * s, cy - 14 * s, cx, cy - 26 * s);
        g.fill();
        g.fillStyle = P.base; g.beginPath(); g.ellipse(cx, cy, 5 * s, 10 * s, 0, 0, TAU); g.fill();
        g.fillStyle = P.accent; g.fillRect(cx - 1, cy - 30 * s, 2, 6 * s);
        g.beginPath(); g.arc(cx - 10 * s, cy - 18 * s, 3 * s, 0, TAU); g.arc(cx + 10 * s, cy - 18 * s, 3 * s, 0, TAU); g.fill();
      };
      for (let y = 30; y < wainTop; y += 64) {
        drawDamask(32, y, 1); drawDamask(96, y + 32, 1);
      }
    } else if (kind === 'kitchen') {
      // small floral dots on cream + grid
      g.strokeStyle = 'rgba(150,120,60,.25)';
      for (let x = 0; x < w; x += 32) { g.beginPath(); g.moveTo(x + 0.5, 0); g.lineTo(x + 0.5, wainTop); g.stroke(); }
      for (let y = 8; y < wainTop - 10; y += 32) {
        for (let x = 16; x < w; x += 32) {
          const cx = x + ((y / 32) % 2) * 0, cy = y + 8;
          g.fillStyle = P.motif;
          for (let k = 0; k < 5; k++) { const a = k / 5 * TAU; g.beginPath(); g.arc(cx + Math.cos(a) * 3, cy + Math.sin(a) * 3, 2.2, 0, TAU); g.fill(); }
          g.fillStyle = '#f2d36b'; g.beginPath(); g.arc(cx, cy, 1.6, 0, TAU); g.fill();
          g.fillStyle = P.accent; g.fillRect(cx + 4, cy + 4, 4, 2);
        }
      }
      // 90s wallpaper border above chair rail
      g.fillStyle = '#7a2f2a'; g.fillRect(0, wainTop - 22, w, 20);
      g.fillStyle = '#e8dcb5';
      for (let x = 0; x < w; x += 16) { g.beginPath(); g.arc(x + 8, wainTop - 12, 4, 0, TAU); g.fill(); }
      g.fillStyle = '#4f7a4a'; for (let x = 0; x < w; x += 16) g.fillRect(x + 2, wainTop - 6, 4, 2);
    } else if (kind === 'living') {
      // vertical stripes with pinstripes
      for (let x = 0; x < w; x += 32) {
        g.fillStyle = P.motif; g.fillRect(x, 0, 14, wainTop);
        g.fillStyle = P.accent; g.fillRect(x + 20, 0, 2, wainTop);
      }
    } else if (kind === 'bedroom') {
      // stars and moons
      for (let y = 20; y < wainTop - 10; y += 40) {
        for (let x = 16; x < w; x += 42) {
          const cx = x + ((y / 40) % 2) * 20, cy = y;
          g.fillStyle = P.accent;
          if ((x + y) % 3 === 0) {
            g.beginPath(); g.arc(cx, cy, 6, 0, TAU); g.fill();
            g.fillStyle = P.base; g.beginPath(); g.arc(cx + 3, cy - 2, 5.5, 0, TAU); g.fill();
          } else {
            g.beginPath();
            for (let k = 0; k < 10; k++) { const r = k % 2 ? 2.2 : 5.5, a = k / 10 * TAU - Math.PI / 2; g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); }
            g.fill();
          }
        }
      }
    }
    // crown molding
    g.fillStyle = P.rail; g.fillRect(0, 0, w, 10); g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(0, 8, w, 2);
    // wainscot
    g.fillStyle = P.wain; g.fillRect(0, wainTop, w, h - wainTop);
    if (kind === 'kitchen' || kind === 'bedroom') {
      for (let x = 0; x < w; x += 12) { g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(x, wainTop, 1, h - wainTop); g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(x + 1, wainTop, 1, h - wainTop); }
    } else {
      // raised panels
      for (let x = 6; x < w; x += 64) {
        g.fillStyle = P.wainHi; g.fillRect(x, wainTop + 14, 52, h - wainTop - 34);
        g.fillStyle = P.wain; g.fillRect(x + 4, wainTop + 18, 44, h - wainTop - 42);
        g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(x, h - 21, 52, 2);
      }
    }
    g.fillStyle = P.rail; g.fillRect(0, wainTop - 3, w, 7);
    g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(0, wainTop - 3, w, 2);
    // baseboard
    g.fillStyle = P.rail; g.fillRect(0, h - 14, w, 14);
    // age: stains, grain
    for (let i = 0; i < 3; i++) { g.fillStyle = 'rgba(30,20,10,.08)'; g.beginPath(); g.ellipse(rng() * w, rng() * wainTop, 10 + rng() * 20, 20 + rng() * 50, 0, 0, TAU); g.fill(); }
    Tex.grain(g, w, h, 16, rng);
  });
}

// --- floors: 128px = 2m ---
function floorTexture(kind) {
  return Tex.make('floor_' + kind, 128, 128, (g, w, h, rng) => {
    if (kind === 'wood' || kind === 'woodLight' || kind === 'porch') {
      const base = kind === 'wood' ? '#4f321f' : kind === 'woodLight' ? '#7b5a3c' : '#5f5a52';
      g.fillStyle = base; g.fillRect(0, 0, w, h);
      const ph = 16;
      for (let y = 0; y < h; y += ph) {
        let x = -Math.floor(rng() * 60);
        while (x < w) {
          const len = 48 + Math.floor(rng() * 70);
          g.fillStyle = Tex.shade(base, 0.82 + rng() * 0.3);
          g.fillRect(x, y, len - 1, ph - 1);
          // grain lines
          g.fillStyle = 'rgba(0,0,0,.12)';
          for (let k = 0; k < 3; k++) g.fillRect(x + 2, y + 2 + Math.floor(rng() * (ph - 4)), len - 6, 1);
          g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(x + len - 1, y, 1, ph);
          x += len;
        }
        g.fillStyle = 'rgba(0,0,0,.5)'; g.fillRect(0, y + ph - 1, w, 1);
      }
      if (kind === 'porch') Tex.speckle(g, w, h, 300, ['#3f3b36', '#77716a'], rng, 1);
      Tex.grain(g, w, h, 14, rng);
    } else if (kind === 'checker') {
      const s = 32;
      for (let y = 0; y < h; y += s) for (let x = 0; x < w; x += s) {
        const dark = ((x + y) / s) % 2 === 0;
        g.fillStyle = dark ? '#262529' : '#b3ab98'; g.fillRect(x, y, s, s);
      }
      Tex.speckle(g, w, h, 400, ['rgba(0,0,0,.15)', 'rgba(255,255,255,.12)', 'rgba(120,100,60,.2)'], rng, 1);
      Tex.grain(g, w, h, 12, rng);
    } else if (kind === 'carpet') {
      g.fillStyle = '#6a4630'; g.fillRect(0, 0, w, h);
      Tex.speckle(g, w, h, 3500, ['#7d5638', '#5a3a26', '#8a6040', '#4e3220', '#9a6a3e'], rng, 1);
      Tex.grain(g, w, h, 20, rng);
    } else if (kind === 'concrete') {
      g.fillStyle = '#48443f'; g.fillRect(0, 0, w, h);
      Tex.speckle(g, w, h, 1500, ['#3b3833', '#57524a', '#4f4a44'], rng, 2);
      g.strokeStyle = 'rgba(0,0,0,.4)'; g.lineWidth = 1;
      for (let i = 0; i < 3; i++) { g.beginPath(); let x = rng() * w, y = rng() * h; g.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (rng() - 0.5) * 30; y += (rng() - 0.5) * 30; g.lineTo(x, y); } g.stroke(); }
      for (let i = 0; i < 4; i++) { g.fillStyle = 'rgba(20,16,12,.18)'; g.beginPath(); g.ellipse(rng() * w, rng() * h, 10 + rng() * 25, 6 + rng() * 18, rng() * 3, 0, TAU); g.fill(); }
      Tex.grain(g, w, h, 18, rng);
    } else if (kind === 'grass') {
      g.fillStyle = '#1d2618'; g.fillRect(0, 0, w, h);
      Tex.speckle(g, w, h, 4000, ['#26331e', '#17200f', '#2f3b22', '#3a3320'], rng, 1);
      Tex.speckle(g, w, h, 140, ['#5a3a1a', '#7a4a1e', '#6b2f12'], rng, 2); // fallen leaves
    } else if (kind === 'roof') {
      g.fillStyle = '#26232a'; g.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 12) {
        const off = ((y / 12) % 2) * 10;
        for (let x = -20; x < w; x += 20) { g.fillStyle = Tex.shade('#2e2a33', 0.8 + rng() * 0.4); g.fillRect(x + off, y, 19, 11); }
      }
      Tex.grain(g, w, h, 16, rng);
    } else if (kind === 'path') {
      g.fillStyle = '#4a4741'; g.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 32) for (let x = 0; x < w; x += 32) { g.fillStyle = Tex.shade('#55514a', 0.8 + rng() * 0.3); g.fillRect(x + 1, y + 1, 30, 30); }
      Tex.grain(g, w, h, 20, rng);
    }
  });
}

function rugTexture(kind) {
  return Tex.make('rug_' + kind, 128, 128, (g, w, h, rng) => {
    if (kind === 'runner') {
      g.fillStyle = '#6e1a1d'; g.fillRect(0, 0, w, h);
      g.strokeStyle = '#c9a25a'; g.lineWidth = 4; g.strokeRect(8, 8, w - 16, h - 16);
      g.strokeStyle = '#1d2a3e'; g.lineWidth = 3; g.strokeRect(16, 16, w - 32, h - 32);
      g.fillStyle = '#c9a25a';
      for (let y = 28; y < h - 20; y += 24) for (let x = 28; x < w - 20; x += 24) { g.beginPath(); g.moveTo(x, y - 7); g.lineTo(x + 7, y); g.lineTo(x, y + 7); g.lineTo(x - 7, y); g.fill(); }
      g.fillStyle = '#1d2a3e'; for (let y = 28; y < h - 20; y += 24) for (let x = 28; x < w - 20; x += 24) g.fillRect(x - 2, y - 2, 4, 4);
    } else if (kind === 'braided') {
      const cx = w / 2, cy = h / 2;
      const cols = ['#7a4a2a', '#a8763e', '#4f6a3a', '#8a3a2a', '#c49a5a'];
      for (let r = 64; r > 0; r -= 5) { g.fillStyle = cols[Math.floor(r / 5) % cols.length]; g.beginPath(); g.ellipse(cx, cy, r, r, 0, 0, TAU); g.fill(); }
      Tex.speckle(g, w, h, 900, ['rgba(0,0,0,.2)', 'rgba(255,255,255,.1)'], rng, 1);
    } else if (kind === 'blue') {
      g.fillStyle = '#26365a'; g.fillRect(0, 0, w, h);
      g.strokeStyle = '#d9c47a'; g.lineWidth = 3; g.strokeRect(6, 6, w - 12, h - 12);
      g.fillStyle = '#3a5080';
      for (let y = 20; y < h - 10; y += 22) for (let x = 20; x < w - 10; x += 22) { g.beginPath(); g.arc(x, y, 6, 0, TAU); g.fill(); }
    } else if (kind === 'circle') {
      // chalk summoning circle (transparent)
      g.clearRect(0, 0, w, h);
      g.strokeStyle = 'rgba(235,225,210,.85)'; g.lineWidth = 2;
      g.beginPath(); g.arc(64, 64, 60, 0, TAU); g.stroke();
      g.beginPath(); g.arc(64, 64, 50, 0, TAU); g.stroke();
      g.beginPath(); g.arc(64, 64, 22, 0, TAU); g.stroke();
      // five-pointed star of lines inside the ring (as a heptagram for a less literal look)
      g.beginPath();
      for (let k = 0; k <= 7; k++) { const a = (k * 3 / 7) * TAU - Math.PI / 2; const x = 64 + Math.cos(a) * 50, y = 64 + Math.sin(a) * 50; if (k === 0) g.moveTo(x, y); else g.lineTo(x, y); }
      g.stroke();
      g.font = '9px monospace'; g.fillStyle = 'rgba(235,225,210,.9)';
      const runes = 'áš áš¢áš¦áš¨áš±áš²áš·áš¹ášºáš¾á›á›ƒ';
      for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; g.save(); g.translate(64 + Math.cos(a) * 55, 64 + Math.sin(a) * 55); g.rotate(a + Math.PI / 2); g.fillText(runes[k], -3, 3); g.restore(); }
    }
    Tex.grain(g, w, h, 14, rng);
  });
}

function fabricTexture(kind) {
  return Tex.make('fab_' + kind, 64, 64, (g, w, h, rng) => {
    if (kind === 'flannel' || kind === 'flannelGreen' || kind === 'plaidSofa') {
      const pal = kind === 'flannel' ? ['#8e1b1b', '#2a0d0d', '#c2453a'] : kind === 'flannelGreen' ? ['#2d4a2a', '#151f14', '#55724a'] : ['#6b4a2a', '#3a2614', '#9a7a4a'];
      g.fillStyle = pal[0]; g.fillRect(0, 0, w, h);
      g.fillStyle = pal[1]; g.globalAlpha = 0.65;
      g.fillRect(0, 8, w, 14); g.fillRect(8, 0, 14, h);
      g.globalAlpha = 0.5; g.fillStyle = pal[2]; g.fillRect(0, 38, w, 3); g.fillRect(38, 0, 3, h);
      g.globalAlpha = 1;
    } else if (kind === 'quilt') {
      const cols = ['#8a3a3a', '#d8c08a', '#3a5a7a', '#6a8a4a', '#b07a4a', '#e8e0cc'];
      for (let y = 0; y < h; y += 16) for (let x = 0; x < w; x += 16) { g.fillStyle = cols[Math.floor(rng() * cols.length)]; g.fillRect(x, y, 16, 16); g.fillStyle = 'rgba(255,255,255,.35)'; for (let k = 0; k < 16; k += 4) { g.fillRect(x + k, y, 2, 1); g.fillRect(x, y + k, 1, 2); } }
    } else if (kind === 'plush') {
      g.fillStyle = '#9a7048'; g.fillRect(0, 0, w, h);
      Tex.speckle(g, w, h, 900, ['#ab8058', '#86603c', '#b88e64'], rng, 1);
    } else if (kind === 'patch') {
      const cols = ['#9a7048', '#7a5a8a', '#4a7a6a', '#b0604a', '#c9b07a'];
      for (let y = 0; y < h; y += 21) for (let x = 0; x < w; x += 21) { g.fillStyle = cols[Math.floor(rng() * cols.length)]; g.fillRect(x, y, 21, 21); }
      g.strokeStyle = '#2a1a10'; g.setLineDash([2, 2]);
      for (let k = 21; k < w; k += 21) { g.beginPath(); g.moveTo(k + 0.5, 0); g.lineTo(k + 0.5, h); g.stroke(); g.beginPath(); g.moveTo(0, k + 0.5); g.lineTo(w, k + 0.5); g.stroke(); }
    } else if (kind === 'denim') {
      g.fillStyle = '#2f4a6e'; g.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 2) { g.fillStyle = y % 4 ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.1)'; g.fillRect(0, y, w, 1); }
    } else if (kind === 'wood') {
      g.fillStyle = '#5a3a22'; g.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y++) { g.fillStyle = `rgba(0,0,0,${0.05 + 0.1 * Math.abs(Math.sin(y * 0.7 + rng()))})`; g.fillRect(0, y, w, 1); }
    } else if (kind === 'brick') {
      g.fillStyle = '#3a2420'; g.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 8) { const off = ((y / 8) % 2) * 8; for (let x = -16; x < w; x += 16) { g.fillStyle = Tex.shade('#7a3a2a', 0.75 + rng() * 0.4); g.fillRect(x + off + 1, y + 1, 14, 6); } }
    } else if (kind === 'sheet') {
      g.fillStyle = '#e6e2d8'; g.fillRect(0, 0, w, h);
      for (let x = 0; x < w; x += 6) { g.fillStyle = 'rgba(0,0,0,.05)'; g.fillRect(x, 0, 2, h); }
    } else if (kind === 'stripes') {
      for (let y = 0; y < h; y += 16) { g.fillStyle = '#e7e0cf'; g.fillRect(0, y, w, 8); g.fillStyle = '#b3242a'; g.fillRect(0, y + 8, w, 8); }
    } else if (kind === 'candy') {
      g.fillStyle = '#f7f1ea'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#ff5fa0';
      for (let k = -h; k < w; k += 16) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k + 8, 0); g.lineTo(k + 8 + h, h); g.lineTo(k + h, h); g.fill(); }
    } else if (kind === 'skin') {
      g.fillStyle = '#c0261c'; g.fillRect(0, 0, w, h);
      Tex.speckle(g, w, h, 500, ['#a81f17', '#d23a2a', '#8f1a12'], rng, 1);
    } else if (kind === 'coat') {
      g.fillStyle = '#16141a'; g.fillRect(0, 0, w, h);
      Tex.speckle(g, w, h, 500, ['#1f1c24', '#0e0c10'], rng, 1);
    }
    Tex.grain(g, w, h, 10, rng);
  });
}

function bookTexture() {
  return Tex.make('books', 128, 64, (g, w, h, rng) => {
    const cols = ['#6b1d1d', '#1d3b5a', '#3a5a2a', '#7a5a2a', '#2a2a2a', '#5a2a5a', '#8a7a5a', '#1d4a4a'];
    let x = 0;
    while (x < w) {
      const bw = 4 + Math.floor(rng() * 6), bh = 40 + Math.floor(rng() * 24);
      g.fillStyle = cols[Math.floor(rng() * cols.length)]; g.fillRect(x, h - bh, bw, bh);
      g.fillStyle = 'rgba(255,220,150,.45)'; g.fillRect(x, h - bh + 6, bw, 1); g.fillRect(x, h - 8, bw, 1);
      x += bw;
    }
  }, { clamp: true });
}

function windowTexture() {
  return Tex.make('window', 64, 96, (g, w, h, rng) => {
    const grd = g.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0, '#0d1630'); grd.addColorStop(1, '#2a3550');
    g.fillStyle = grd; g.fillRect(0, 0, w, h);
    Tex.speckle(g, w, h * 0.6, 25, ['#c8d4ff', '#8090c0'], rng, 1);
    g.fillStyle = '#e8e6d0'; g.beginPath(); g.arc(44, 20, 9, 0, TAU); g.fill();
    g.fillStyle = 'rgba(232,230,208,.15)'; g.beginPath(); g.arc(44, 20, 16, 0, TAU); g.fill();
    // branches
    g.strokeStyle = '#05060a'; g.lineWidth = 2;
    const br = (x, y, a, l, d) => { if (d <= 0 || l < 3) return; const x2 = x + Math.cos(a) * l, y2 = y + Math.sin(a) * l; g.lineWidth = d * 0.7; g.beginPath(); g.moveTo(x, y); g.lineTo(x2, y2); g.stroke(); br(x2, y2, a - 0.5 + rng() * 0.3, l * 0.7, d - 1); br(x2, y2, a + 0.4 + rng() * 0.3, l * 0.65, d - 1); };
    br(-2, 80, -0.6, 22, 5);
    g.fillStyle = '#05060a'; g.fillRect(0, h - 10, w, 10);
  }, { clamp: true });
}

function posterTexture(i) {
  return Tex.make('poster' + i, 64, 90, (g, w, h, rng) => {
    if (i === 0) { // band-ish poster
      g.fillStyle = '#16121e'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#e8d24a'; g.beginPath(); g.arc(32, 40, 22, 0, TAU); g.fill();
      g.fillStyle = '#16121e'; g.beginPath(); g.arc(24, 36, 4, 0, TAU); g.arc(40, 36, 4, 0, TAU); g.fill();
      g.strokeStyle = '#16121e'; g.lineWidth = 3; g.beginPath(); g.arc(32, 44, 10, 0.2, Math.PI - 0.2); g.stroke();
      g.fillStyle = '#e8e2d0'; g.font = 'bold 11px monospace'; g.fillText('GRUNGE', 9, 78);
    } else if (i === 1) { // space poster
      const grd = g.createLinearGradient(0, 0, 0, h); grd.addColorStop(0, '#1a0a3a'); grd.addColorStop(1, '#8a2a6a');
      g.fillStyle = grd; g.fillRect(0, 0, w, h);
      Tex.speckle(g, w, h, 60, ['#fff', '#ccf'], rng, 1);
      g.fillStyle = '#f0a040'; g.beginPath(); g.arc(30, 40, 14, 0, TAU); g.fill();
      g.strokeStyle = '#f8d080'; g.lineWidth = 2; g.beginPath(); g.ellipse(30, 40, 24, 6, -0.3, 0, TAU); g.stroke();
      g.fillStyle = '#fff'; g.font = 'bold 10px monospace'; g.fillText('SPACE 96', 8, 80);
    } else { // calendar
      g.fillStyle = '#efe9da'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#b3242a'; g.fillRect(0, 0, w, 26);
      g.fillStyle = '#efe9da'; g.font = 'bold 9px monospace'; g.fillText('OCTOBER', 12, 11); g.fillText('1996', 20, 22);
      g.fillStyle = '#333';
      for (let r = 0; r < 5; r++) for (let c = 0; c < 7; c++) g.fillRect(4 + c * 8, 32 + r * 11, 6, 8);
      g.strokeStyle = '#b3242a'; g.lineWidth = 2; g.beginPath(); g.arc(4 + 4 * 8 + 3, 32 + 4 * 11 + 4, 6, 0, TAU); g.stroke();
    }
  }, { clamp: true });
}

function frameTexture(i) {
  return Tex.make('frame' + i, 48, 60, (g, w, h, rng) => {
    // old family photo: sepia, blurry people
    g.fillStyle = '#8a7258'; g.fillRect(0, 0, w, h);
    const grd = g.createRadialGradient(24, 30, 4, 24, 30, 34); grd.addColorStop(0, '#c8ad86'); grd.addColorStop(1, '#5a4632');
    g.fillStyle = grd; g.fillRect(0, 0, w, h);
    g.fillStyle = '#3a2a1c';
    const n = 1 + (i % 3);
    for (let k = 0; k < n; k++) { const x = 24 + (k - (n - 1) / 2) * 12; g.beginPath(); g.arc(x, 24, 5, 0, TAU); g.fill(); g.fillRect(x - 6, 30, 12, 24); }
    Tex.grain(g, w, h, 30, rng);
  }, { clamp: true });
}

function tvTexture() {
  // animated static, updated by the TV prop
  return Tex.make('tv', 64, 48, (g, w, h, rng) => { g.fillStyle = '#222'; g.fillRect(0, 0, w, h); }, { readback: true });
}
function updateTV(tex, t, haunted) {
  const c = tex.userData.canvas, g = c.getContext('2d');
  const id = tex.userData._id || (tex.userData._id = g.createImageData(c.width, c.height)), d = id.data;
  for (let i = 0; i < d.length; i += 4) {
    let v = Math.random() * 255;
    if (!haunted) { // soft blue glow "late movie"
      const y = Math.floor(i / 4 / c.width);
      v = 60 + Math.random() * 40 + Math.sin(y * 0.6 + t * 6) * 20;
      d[i] = v * 0.6; d[i + 1] = v * 0.7; d[i + 2] = v * 1.2;
    } else { d[i] = v; d[i + 1] = v; d[i + 2] = v; }
    d[i + 3] = 255;
  }
  g.putImageData(id, 0, 0);
  tex.needsUpdate = true;
}

// --- creature faces (transparent) ---
function faceTexture(kind, scary) {
  return Tex.make('face_' + kind + (scary ? '_s' : '_c'), 128, 128, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    const eyesCute = (x1, x2, y, r, col = '#141016') => {
      [x1, x2].forEach((x) => {
        g.fillStyle = col; g.beginPath(); g.ellipse(x, y, r, r * 1.15, 0, 0, TAU); g.fill();
        g.fillStyle = '#fff'; g.beginPath(); g.arc(x - r * 0.35, y - r * 0.4, r * 0.32, 0, TAU); g.fill();
        g.beginPath(); g.arc(x + r * 0.3, y + r * 0.35, r * 0.14, 0, TAU); g.fill();
      });
    };
    const blush = (x1, x2, y) => { g.fillStyle = 'rgba(255,110,140,.55)'; [x1, x2].forEach((x) => { g.beginPath(); g.ellipse(x, y, 9, 5, 0, 0, TAU); g.fill(); }); };
    const smile = (y, wdt = 10) => { g.strokeStyle = '#141016'; g.lineWidth = 4; g.lineCap = 'round'; g.beginPath(); g.arc(64, y - 6, wdt, 0.25 * Math.PI, 0.75 * Math.PI); g.stroke(); };
    const glowTri = (x, y, s, col, flip) => { g.fillStyle = col; g.beginPath(); g.moveTo(x - s, y + s * 0.7); g.lineTo(x + s, y + s * 0.7); g.lineTo(x + (flip ? -s * 0.4 : s * 0.4), y - s); g.closePath(); g.fill(); };
    const fangs = (y, wdt, col, depth, n = 7) => {
      g.fillStyle = col; g.beginPath(); g.moveTo(64 - wdt, y);
      for (let k = 0; k <= n; k++) { const x = 64 - wdt + (k / n) * wdt * 2; g.lineTo(x, y + (k % 2 ? depth : 0) + Math.sin(k / n * Math.PI) * depth * 0.6); }
      g.lineTo(64 + wdt, y); g.quadraticCurveTo(64, y + depth * 2.4, 64 - wdt, y); g.fill();
    };
    switch (kind) {
      case 'pumpkin':
        if (!scary) { eyesCute(44, 84, 56, 11); blush(32, 96, 74); smile(84, 9); }
        else { glowTri(42, 52, 14, '#ffd25a', false); glowTri(86, 52, 14, '#ffd25a', true); g.fillStyle = '#ffb030'; fangs(78, 34, '#ffc84a', 12, 9); }
        break;
      case 'candy':
        if (!scary) { eyesCute(46, 82, 58, 9); blush(34, 94, 74); smile(84, 7); }
        else { g.fillStyle = '#2a0610'; g.beginPath(); g.ellipse(64, 82, 30, 18, 0, 0, TAU); g.fill(); g.fillStyle = '#fff'; for (let k = 0; k < 7; k++) { const x = 38 + k * 9; g.beginPath(); g.moveTo(x, 68); g.lineTo(x + 8, 68); g.lineTo(x + 4, 80); g.fill(); g.beginPath(); g.moveTo(x, 96); g.lineTo(x + 8, 96); g.lineTo(x + 4, 86); g.fill(); } g.fillStyle = '#ff2a4a'; g.beginPath(); g.arc(46, 52, 7, 0, TAU); g.arc(82, 52, 7, 0, TAU); g.fill(); }
        break;
      case 'stitch':
        // signature: one big button eye + one X eye, stitched mouth
        if (!scary) {
          g.fillStyle = '#1b1414'; g.beginPath(); g.arc(46, 56, 12, 0, TAU); g.fill();
          g.fillStyle = '#5a4a40'; [[42, 52], [50, 52], [42, 60], [50, 60]].forEach(([x, y]) => { g.beginPath(); g.arc(x, y, 2, 0, TAU); g.fill(); });
          g.strokeStyle = '#1b1414'; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(76, 48); g.lineTo(90, 62); g.moveTo(90, 48); g.lineTo(76, 62); g.stroke();
          blush(36, 92, 74); smile(86, 10);
        } else {
          g.fillStyle = '#e8231c'; g.beginPath(); g.arc(46, 56, 12, 0, TAU); g.fill(); g.fillStyle = '#fff3a0'; g.beginPath(); g.arc(46, 56, 4, 0, TAU); g.fill();
          g.strokeStyle = '#1b1414'; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(74, 46); g.lineTo(92, 64); g.moveTo(92, 46); g.lineTo(74, 64); g.stroke();
          g.strokeStyle = '#1b1414'; g.lineWidth = 3; g.beginPath(); g.moveTo(36, 84); g.lineTo(92, 84); g.stroke();
          for (let k = 0; k < 8; k++) { g.beginPath(); g.moveTo(39 + k * 7, 76); g.lineTo(42 + k * 7, 92); g.stroke(); }
        }
        break;
      case 'ghost':
        if (!scary) { g.fillStyle = '#1b1620'; g.beginPath(); g.ellipse(48, 58, 8, 11, 0, 0, TAU); g.ellipse(80, 58, 8, 11, 0, 0, TAU); g.fill(); blush(36, 92, 74); g.fillStyle = '#1b1620'; g.beginPath(); g.ellipse(64, 80, 5, 6, 0, 0, TAU); g.fill(); }
        else { g.fillStyle = '#0a0810'; g.beginPath(); g.ellipse(48, 54, 11, 15, 0.2, 0, TAU); g.ellipse(80, 54, 11, 15, -0.2, 0, TAU); g.fill(); g.fillStyle = '#ffe680'; g.beginPath(); g.arc(48, 56, 3.5, 0, TAU); g.arc(80, 56, 3.5, 0, TAU); g.fill(); g.fillStyle = '#0a0810'; g.beginPath(); g.ellipse(64, 88, 11, 17, 0, 0, TAU); g.fill(); }
        break;
      case 'devil':
        if (!scary) { eyesCute(46, 82, 58, 10, '#2a0a06'); g.fillStyle = '#ffd34a'; g.beginPath(); g.arc(43, 55, 2, 0, TAU); g.arc(79, 55, 2, 0, TAU); g.fill(); smile(86, 9); g.fillStyle = '#fff'; g.beginPath(); g.moveTo(58, 86); g.lineTo(62, 86); g.lineTo(60, 91); g.fill(); }
        else { g.fillStyle = '#ffd34a'; [46, 82].forEach((x, i) => { g.beginPath(); g.ellipse(x, 56, 11, 7, i ? -0.35 : 0.35, 0, TAU); g.fill(); }); g.fillStyle = '#1a0402'; g.fillRect(44, 50, 4, 12); g.fillRect(80, 50, 4, 12); fangs(78, 26, '#1a0402', 10, 7); g.fillStyle = '#fff'; for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(44 + k * 12, 79); g.lineTo(50 + k * 12, 79); g.lineTo(47 + k * 12, 87); g.fill(); } }
        break;
      case 'jack': // boss: same triangle eyes, huge jagged grin
        glowTri(38, 44, 20, '#ffe070', false); glowTri(90, 44, 20, '#ffe070', true);
        fangs(70, 46, '#ffb030', 18, 11);
        break;
      case 'stitches':
        g.fillStyle = '#e8231c'; g.beginPath(); g.arc(42, 48, 16, 0, TAU); g.fill(); g.fillStyle = '#fff3a0'; g.beginPath(); g.arc(42, 48, 5, 0, TAU); g.fill();
        g.strokeStyle = '#1b1414'; g.lineWidth = 8; g.lineCap = 'round'; g.beginPath(); g.moveTo(76, 36); g.lineTo(98, 58); g.moveTo(98, 36); g.lineTo(76, 58); g.stroke();
        g.lineWidth = 4; g.beginPath(); g.moveTo(26, 86); g.quadraticCurveTo(64, 106, 102, 86); g.stroke();
        for (let k = 0; k < 10; k++) { g.beginPath(); g.moveTo(30 + k * 7.5, 82); g.lineTo(32 + k * 7.5, 100); g.stroke(); }
        break;
      case 'visitor':
        g.fillStyle = '#0a0810'; g.beginPath(); g.ellipse(46, 56, 14, 22, 0.25, 0, TAU); g.ellipse(82, 56, 14, 22, -0.25, 0, TAU); g.fill();
        g.fillStyle = '#ffe680'; g.beginPath(); g.arc(46, 60, 5, 0, TAU); g.arc(82, 60, 5, 0, TAU); g.fill();
        g.strokeStyle = '#0a0810'; g.lineWidth = 3; g.beginPath(); g.moveTo(40, 100); g.quadraticCurveTo(64, 108, 88, 100); g.stroke();
        break;
      case 'uninvited':
        g.fillStyle = '#ffd34a'; [42, 86].forEach((x, i) => { g.beginPath(); g.ellipse(x, 50, 15, 9, i ? -0.4 : 0.4, 0, TAU); g.fill(); });
        g.fillStyle = '#1a0402'; g.fillRect(40, 42, 4, 16); g.fillRect(84, 42, 4, 16);
        fangs(76, 40, '#1a0402', 16, 9);
        g.fillStyle = '#fff'; for (let k = 0; k < 6; k++) { g.beginPath(); g.moveTo(32 + k * 11, 78); g.lineTo(39 + k * 11, 78); g.lineTo(35.5 + k * 11, 90); g.fill(); }
        break;
      case 'player':
        g.fillStyle = '#1a1210'; g.fillRect(44, 56, 8, 9); g.fillRect(76, 56, 8, 9);
        g.fillStyle = '#3a2418'; g.fillRect(40, 46, 16, 4); g.fillRect(72, 46, 16, 4);
        g.fillStyle = '#7a3a30'; g.fillRect(56, 84, 16, 3);
        break;
    }
  }, { clamp: true });
}

// glow sprite for lamps / eyes / fire (soft radial)
function glowTexture() {
  return Tex.make('glow', 64, 64, (g, w, h) => {
    const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, 'rgba(255,255,255,1)'); grd.addColorStop(0.25, 'rgba(255,255,255,.55)'); grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd; g.fillRect(0, 0, w, h);
  }, { clamp: true, smooth: true });
}

// four-point camera glint (hidden lost photos)
function glintTexture() {
  return Tex.make('glint', 128, 128, (g, w, h) => {
    const c = w / 2;
    const ray = (ang, len, wid) => {
      g.save(); g.translate(c, c); g.rotate(ang);
      const grd = g.createLinearGradient(-len, 0, len, 0);
      grd.addColorStop(0, 'rgba(255,255,255,0)'); grd.addColorStop(0.5, 'rgba(255,255,255,1)'); grd.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = grd; g.beginPath(); g.moveTo(-len, 0); g.lineTo(0, -wid); g.lineTo(len, 0); g.lineTo(0, wid); g.closePath(); g.fill();
      g.restore();
    };
    ray(0, c, 3.2); ray(Math.PI / 2, c, 3.2); ray(Math.PI / 4, c * 0.45, 2); ray(-Math.PI / 4, c * 0.45, 2);
    const grd = g.createRadialGradient(c, c, 0, c, c, c * 0.32);
    grd.addColorStop(0, 'rgba(255,255,255,1)'); grd.addColorStop(0.35, 'rgba(255,255,255,.5)'); grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd; g.fillRect(0, 0, w, h);
  }, { clamp: true, smooth: true });
}

// --- worn print (title lettering): an alpha mask, opaque except for specks, chipped spots, rubbed patches and
// scratches. Returned as a data URL for a CSS mask
function wornMask(size, seed, k = 1) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d'), rng = mulberry32(seed), n = (v) => Math.round(v * k * size * size / (512 * 512));
  g.fillStyle = '#000'; g.fillRect(0, 0, size, size);
  g.globalCompositeOperation = 'destination-out';
  // rubbed patches: soft, half gone
  for (let i = 0; i < n(12); i++) {
    const x = rng() * size, y = rng() * size, r = 16 + rng() * 46, grd = g.createRadialGradient(x, y, 0, x, y, r);
    grd.addColorStop(0, `rgba(0,0,0,${(0.3 + rng() * 0.3).toFixed(2)})`); grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd; g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  g.fillStyle = '#000';
  // fine grain
  for (let i = 0; i < n(1500); i++) { g.globalAlpha = 0.3 + rng() * 0.6; g.beginPath(); g.arc(rng() * size, rng() * size, 0.45 + rng() * 1.1, 0, TAU); g.fill(); }
  // chips: clusters of small bites
  for (let i = 0; i < n(80); i++) {
    const x = rng() * size, y = rng() * size; g.globalAlpha = 0.75 + rng() * 0.25;
    for (let j = 0; j < 5; j++) { g.beginPath(); g.arc(x + (rng() - 0.5) * 9, y + (rng() - 0.5) * 7, 0.8 + rng() * 3.2, 0, TAU); g.fill(); }
  }
  // scratches, mostly one way
  g.strokeStyle = '#000'; g.lineCap = 'round';
  for (let i = 0; i < n(18); i++) {
    const x = rng() * size, y = rng() * size, a = -0.75 + (rng() - 0.5) * 0.9, L = 30 + rng() * 130;
    g.globalAlpha = 0.55 + rng() * 0.45; g.lineWidth = 0.6 + rng() * 1.4;
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * L * 0.5 + (rng() - 0.5) * 12, y + Math.sin(a) * L * 0.5 + (rng() - 0.5) * 12, x + Math.cos(a) * L, y + Math.sin(a) * L); g.stroke();
  }
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  return c.toDataURL('image/png');
}

// --- the night outside (title shot) ---
// warm light falling out of a window onto the ground: brightest at the wall, spreading and fading outward, the
// window cross in it (the top of the canvas lies at the wall)
function spillTexture() {
  return Tex.make('spill', 128, 128, (g, w, h) => {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const q = c.getContext('2d');
    const grd = q.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0, 'rgba(255,255,255,1)'); grd.addColorStop(0.55, 'rgba(255,255,255,.45)'); grd.addColorStop(1, 'rgba(255,255,255,0)');
    q.fillStyle = grd; q.beginPath(); q.moveTo(w * 0.2, 6); q.lineTo(w * 0.8, 6); q.lineTo(w * 0.96, h - 4); q.lineTo(w * 0.04, h - 4); q.closePath(); q.fill();
    q.globalCompositeOperation = 'destination-out'; q.strokeStyle = '#000';
    q.lineWidth = 5; q.beginPath(); q.moveTo(w / 2, 0); q.lineTo(w / 2, h); q.stroke();
    q.lineWidth = 6; q.beginPath(); q.moveTo(0, h * 0.42); q.lineTo(w, h * 0.46); q.stroke();
    g.clearRect(0, 0, w, h);
    if ('filter' in g) g.filter = 'blur(3px)';
    g.drawImage(c, 0, 0);
    if ('filter' in g) g.filter = 'none';
  }, { clamp: true, smooth: true });
}
// soft tileable cloud noise (ground mist, the clouds): fbm of wrapping value noise, gray in rgb, stored linear.
// lo / hi: the noise range spread over black to white (patchier when narrow)
function mistTexture(lo = 0, hi = 1) {
  const t = Tex.make('mist_' + lo + '_' + hi, 256, 256, (g, w, h, rng) => {
    const oct = [[4, 0.48], [8, 0.27], [16, 0.16], [32, 0.09]].map(([n, a]) => ({ n, a, v: Array.from({ length: n * n }, () => rng()) }));
    const sm = (t) => t * t * (3 - 2 * t);
    const id = g.createImageData(w, h), d = id.data;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      let s = 0;
      for (const o of oct) {
        const fx = x / w * o.n, fy = y / h * o.n, x0 = Math.floor(fx), y0 = Math.floor(fy), tx = sm(fx - x0), ty = sm(fy - y0);
        const at = (i, j) => o.v[((j % o.n) + o.n) % o.n * o.n + ((i % o.n) + o.n) % o.n];
        const a = at(x0, y0) + (at(x0 + 1, y0) - at(x0, y0)) * tx, b = at(x0, y0 + 1) + (at(x0 + 1, y0 + 1) - at(x0, y0 + 1)) * tx;
        s += (a + (b - a) * ty) * o.a;
      }
      const v = Math.round(smoothstep(lo, hi, s) * 255), k = (y * w + x) * 4;
      d[k] = d[k + 1] = d[k + 2] = v; d[k + 3] = 255;
    }
    g.putImageData(id, 0, 0);
  }, { smooth: true, seed: 4242 });
  t.colorSpace = THREE.NoColorSpace;   // (data, not a color)
  return t;
}

// --- shadows in the lit windows of the title shot ---
// somebody walking past inside (side on, facing +u), soft like a shadow on a curtain. 128 x 256 px = 0.64 x 1.6 m,
// the top of the canvas 1.95 m above the floor (see WinShadows)
function walkerTexture() {
  return Tex.make('walker', 128, 256, (g, w, h) => {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const q = c.getContext('2d');
    q.fillStyle = '#fff'; q.strokeStyle = '#fff'; q.lineCap = 'round'; q.lineJoin = 'round';
    q.beginPath(); q.ellipse(64, 36, 17, 19, 0.15, 0, TAU); q.fill();                    // head
    q.beginPath(); q.moveTo(78, 30); q.lineTo(88, 42); q.lineTo(78, 46); q.fill();        // nose
    q.fillRect(56, 48, 15, 16);                                                           // neck
    q.beginPath(); q.moveTo(46, 66); q.quadraticCurveTo(64, 54, 84, 64); q.lineTo(88, 104); q.quadraticCurveTo(86, 140, 82, 152);
    q.lineTo(44, 152); q.quadraticCurveTo(38, 112, 46, 66); q.fill();                     // torso
    q.lineWidth = 15; q.beginPath(); q.moveTo(66, 70); q.quadraticCurveTo(76, 110, 86, 146); q.stroke();   // arm
    q.lineWidth = 21; q.beginPath(); q.moveTo(58, 150); q.lineTo(44, 250); q.moveTo(70, 150); q.lineTo(88, 250); q.stroke(); // stride
    g.clearRect(0, 0, w, h);
    if ('filter' in g) g.filter = 'blur(5px)';
    g.drawImage(c, 0, 0);
    if ('filter' in g) g.filter = 'none';
    // (the canvas edges stay empty: the texture clamps, so outside it nothing shows)
    g.clearRect(0, 0, w, 2); g.clearRect(0, 0, 2, h); g.clearRect(w - 2, 0, 2, h);
  }, { clamp: true, smooth: true });
}
// the round attic window from the yard: a hat, a sack for a head, arms out along a crossbar
function scarecrowSilhouetteTexture() {
  return Tex.make('scareSil', 128, 128, (g, w, h) => {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const q = c.getContext('2d');
    q.save(); q.beginPath(); q.arc(64, 64, 61, 0, TAU); q.clip();
    q.fillStyle = '#fff'; q.strokeStyle = '#fff'; q.lineCap = 'round';
    q.beginPath(); q.ellipse(66, 46, 30, 6, -0.12, 0, TAU); q.fill();                   // hat brim
    q.beginPath(); q.moveTo(54, 44); q.lineTo(57, 26); q.lineTo(76, 24); q.lineTo(80, 42); q.fill(); // crown
    q.beginPath(); q.ellipse(67, 62, 13, 15, -0.3, 0, TAU); q.fill();                    // the sack
    q.fillRect(0, 76, w, 9);                                                              // the crossbar
    q.lineWidth = 13; q.beginPath(); q.moveTo(8, 84); q.lineTo(120, 82); q.stroke();      // arms on it
    q.lineWidth = 3; for (const x of [10, 16, 22, 106, 112, 118]) { q.beginPath(); q.moveTo(x, 88); q.lineTo(x + (x < 64 ? -3 : 3), 102); q.stroke(); } // straw hands
    q.beginPath(); q.moveTo(46, 76); q.lineTo(86, 76); q.lineTo(92, 128); q.lineTo(40, 128); q.fill(); // shirt
    q.restore();
    g.clearRect(0, 0, w, h);
    if ('filter' in g) g.filter = 'blur(1.5px)';
    g.drawImage(c, 0, 0);
    if ('filter' in g) g.filter = 'none';
  }, { clamp: true, smooth: true });
}

// --- the scarecrow upstairs (last lost photo) ---
// loose burlap weave
function burlapWeave(g, w, h, rng, base = '#86704e') {
  g.fillStyle = base; g.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 2) { g.fillStyle = `rgba(38,26,12,${(0.1 + rng() * 0.2).toFixed(3)})`; g.fillRect(0, y, w, 1); }
  for (let x = 0; x < w; x += 2) { g.fillStyle = `rgba(224,196,146,${(0.04 + rng() * 0.1).toFixed(3)})`; g.fillRect(x, 0, 1, h); }
  for (let i = 0; i < w * h / 90; i++) { g.fillStyle = rng() < 0.5 ? 'rgba(30,20,10,.35)' : 'rgba(210,180,130,.25)'; g.fillRect(Math.floor(rng() * w), Math.floor(rng() * h), 1 + Math.floor(rng() * 3), 1); }
  Tex.grain(g, w, h, 22, rng);
}
function burlapTexture() { return Tex.make('burlap', 64, 64, (g, w, h, rng) => burlapWeave(g, w, h, rng)); }
// dry straw: thin streaks, yellow to brown
function strawTexture() {
  return Tex.make('straw', 64, 64, (g, w, h, rng) => {
    g.fillStyle = '#b8954a'; g.fillRect(0, 0, w, h);
    const cols = ['#e2c477', '#a07a34', '#cfae5c', '#7a5a26', '#f0d890'];
    for (let i = 0; i < 160; i++) { g.fillStyle = cols[Math.floor(rng() * cols.length)]; g.fillRect(Math.floor(rng() * w), Math.floor(rng() * h), 1, 4 + Math.floor(rng() * 14)); }
  });
}
// twisted rope (on a torus: u runs along the ring, v around the strand)
function ropeTexture() {
  return Tex.make('rope', 128, 32, (g, w, h, rng) => {
    g.fillStyle = '#6a5636'; g.fillRect(0, 0, w, h);
    for (let x = -h; x < w + h; x += 8) {
      const grd = g.createLinearGradient(x, 0, x + 8, 0);
      grd.addColorStop(0, 'rgba(40,30,16,.85)'); grd.addColorStop(0.5, 'rgba(150,126,86,.6)'); grd.addColorStop(1, 'rgba(40,30,16,.85)');
      g.fillStyle = grd; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 8, 0); g.lineTo(x + 8 + h, h); g.lineTo(x + h, h); g.closePath(); g.fill();
    }
    for (let i = 0; i < 90; i++) { g.fillStyle = rng() < 0.5 ? 'rgba(200,170,120,.35)' : 'rgba(20,14,8,.35)'; g.fillRect(rng() * w, rng() * h, 3 + rng() * 6, 1); }
  });
}
// the sack over the scarecrow's head (sphere uvs: the front of the sphere is u = 0.25), a face stitched on in black
// thread: X eyes and a long crooked grin
function sackTexture() {
  // (big enough for the last close-up: the face fills the screen)
  return Tex.make('sack', 1024, 512, (g, w, h, rng) => {
    burlapWeave(g, w, h, rng, '#7e6848');
    const S = w / 512, cx = w * 0.25, ey = h * 0.45, my = h * 0.6;
    // water stains and grime, darkest around the eyes and the mouth
    for (let i = 0; i < 14; i++) {
      const x = rng() * w, y = rng() * h, r = (14 + rng() * 40) * S, grd = g.createRadialGradient(x, y, 0, x, y, r);
      grd.addColorStop(0, `rgba(40,26,12,${(0.12 + rng() * 0.18).toFixed(2)})`); grd.addColorStop(1, 'rgba(40,26,12,0)');
      g.fillStyle = grd; g.fillRect(x - r, y - r, r * 2, r * 2);
    }
    for (const [x, y, r] of [[cx - 26 * S, ey, 22 * S], [cx + 26 * S, ey, 22 * S], [cx, my, 36 * S]]) {
      const grd = g.createRadialGradient(x, y, 0, x, y, r);
      grd.addColorStop(0, 'rgba(24,14,8,.6)'); grd.addColorStop(1, 'rgba(24,14,8,0)');
      g.fillStyle = grd; g.fillRect(x - r, y - r, r * 2, r * 2);
    }
    // a stitch of thick black thread: dark, with a dull sheen along it
    const thread = (pts, lw) => {
      for (const [c, k] of [['#0d0704', 1], ['rgba(70,58,46,.55)', 0.32]]) {
        g.strokeStyle = c; g.lineWidth = lw * k; g.lineCap = 'round';
        g.beginPath(); g.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]); g.stroke();
      }
    };
    // X eyes, each pulled through twice
    for (const s of [-1, 1]) {
      const x = cx + s * 26 * S, y = ey, r = 9 * S;
      for (const o of [-1.2, 1.2]) { thread([x - r, y - r + o * S, x + r, y + r + o * S], 2.6 * S); thread([x + r, y - r + o * S, x - r, y + r + o * S], 2.6 * S); }
    }
    // the grin: a seam from cheek to cheek, cross stitched
    g.strokeStyle = '#100905'; g.lineWidth = 2.4 * S; g.beginPath(); g.moveTo(cx - 44 * S, my - 7 * S);
    g.quadraticCurveTo(cx - 10 * S, my + 11 * S, cx + 6 * S, my + 4 * S); g.quadraticCurveTo(cx + 26 * S, my - 2 * S, cx + 46 * S, my - 10 * S); g.stroke();
    for (let k = 0; k < 9; k++) {
      const x = cx + (-38 + k * 10) * S, y = my + (k < 5 ? -4 + k * 2.4 : 6 - (k - 4) * 3.2) * S;
      thread([x - 2 * S, y - 7 * S, x + 2 * S, y + 7 * S], 2.2 * S);
    }
    // frayed holes in the weave
    for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(12,8,4,.8)'; g.beginPath(); g.ellipse(rng() * w, rng() * h, (1.5 + rng() * 2.5) * S, (1 + rng() * 2) * S, rng() * 3, 0, TAU); g.fill(); }
  }, { clamp: false });
}
// --- the attic ---
// a cobweb strung into a corner (the corner at the top left of the canvas): spokes and a sagging spiral
function cobwebTexture(corner = false) {
  // (corner: strung across the angle of two walls under the ceiling, spokes fanning down from the top middle)
  return Tex.make(corner ? 'cobwebC' : 'cobweb', 256, 256, (g, w, h, rng) => {
    g.clearRect(0, 0, w, h);
    const ox = corner ? w / 2 : 0, a0 = corner ? 0.18 : 0, a1 = corner ? Math.PI - 0.18 : Math.PI / 2, R = corner ? w * 0.62 : w;
    g.strokeStyle = 'rgba(235,235,230,.75)'; g.lineWidth = 1.1;
    const spokes = [];
    for (let i = 0; i < 9; i++) { const a = a0 + (i + 0.2 + rng() * 0.6) / 9 * (a1 - a0), r = R * (0.75 + rng() * 0.35); spokes.push([a, r]); g.beginPath(); g.moveTo(ox, 0); g.lineTo(ox + Math.cos(a) * r, Math.sin(a) * r); g.stroke(); }
    g.lineWidth = 0.8;
    for (let k = 1; k < 13; k++) {
      const rr = k * R / 15 * (0.9 + rng() * 0.15);
      g.strokeStyle = `rgba(230,230,225,${(0.35 + rng() * 0.35).toFixed(2)})`;
      g.beginPath();
      spokes.forEach(([a], i) => { const x = ox + Math.cos(a) * rr, y = Math.sin(a) * rr; if (!i) g.moveTo(x, y); else { const [pa] = spokes[i - 1], m = (a + pa) / 2, sag = rr * 0.86; g.quadraticCurveTo(ox + Math.cos(m) * sag, Math.sin(m) * sag, x, y); } });
      g.stroke();
    }
    // a few broken strands hanging down
    for (let i = 0; i < 4; i++) { const x = w * (0.2 + rng() * 0.6), y = h * (0.15 + rng() * 0.35); g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 6, y + 30, x - 3 + rng() * 6, y + 50 + rng() * 40); g.stroke(); }
  }, { clamp: true, smooth: true });
}
// a cobweb for the yard and the porch: the same build as the indoor ones (spokes fanning from the top left corner, a
// sagging spiral) but drawn bolder, it is seen from across the lawn; dew on the silk catches the light
function yardWebTexture() {
  return Tex.make('cobwebYard', 512, 512, (g, w, h, rng) => {
    g.clearRect(0, 0, w, h);
    g.lineCap = 'round';
    const R = w * 0.98, spokes = [];
    for (let i = 0; i < 11; i++) { const a = (i + 0.2 + rng() * 0.6) / 11 * (Math.PI / 2), r = R * (0.74 + rng() * 0.28); spokes.push([a, r]); }
    g.strokeStyle = 'rgba(242,242,238,.92)'; g.lineWidth = 2.8;
    for (const [a, r] of spokes) { g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * r, Math.sin(a) * r); g.stroke(); }
    const dew = [];
    for (let k = 1; k < 15; k++) {
      const rr = k * R / 16 * (0.92 + rng() * 0.12);
      g.strokeStyle = `rgba(238,238,232,${(0.55 + rng() * 0.4).toFixed(2)})`; g.lineWidth = 1.9;
      g.beginPath();
      let on = false;
      spokes.forEach(([a, r], i) => {
        const x = Math.cos(a) * rr, y = Math.sin(a) * rr;
        if (rr > r * 0.97) { on = false; return; } // (the spiral ends where the spoke does)
        if (!on) { g.moveTo(x, y); on = true; return; }
        const [pa] = spokes[i - 1], m = (a + pa) / 2, sag = rr * 0.86;
        g.quadraticCurveTo(Math.cos(m) * sag, Math.sin(m) * sag, x, y);
        if (rng() < 0.35) dew.push([Math.cos(m) * rr * 0.9, Math.sin(m) * rr * 0.9]);
      });
      g.stroke();
    }
    // a couple of broken strands hanging loose
    g.lineWidth = 1.6; g.strokeStyle = 'rgba(236,236,230,.7)';
    for (let i = 0; i < 3; i++) { const x = w * (0.3 + rng() * 0.45), y = h * (0.1 + rng() * 0.3); g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 10, y + 50, x - 4 + rng() * 8, y + 90 + rng() * 70); g.stroke(); }
    // dew
    for (const [x, y] of dew) { g.fillStyle = 'rgba(255,255,255,.95)'; g.beginPath(); g.arc(x, y, 2.2 + rng() * 1.6, 0, TAU); g.fill(); }
  }, { clamp: true, smooth: true });
}
// loose straw on the floor around the scarecrow's post (alpha: the floor shows between the strands)
function strawFloorTexture() {
  return Tex.make('strawFloor', 512, 512, (g, w, h, rng) => {
    g.clearRect(0, 0, w, h);
    const cols = ['#d8b968', '#a88440', '#c6a456', '#7d5e2a', '#e8cf86'];
    g.lineCap = 'round';
    for (let i = 0; i < 900; i++) {
      // denser toward the middle
      const rr = Math.pow(rng(), 0.75) * w * 0.48, a = rng() * TAU, x = w / 2 + Math.cos(a) * rr, y = h / 2 + Math.sin(a) * rr;
      const L = 8 + rng() * 26, b = rng() * TAU;
      g.strokeStyle = cols[Math.floor(rng() * cols.length)]; g.globalAlpha = 0.55 + rng() * 0.45; g.lineWidth = 1 + rng() * 1.6;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(b) * L, y + Math.sin(b) * L); g.stroke();
    }
    g.globalAlpha = 1;
  }, { clamp: true, smooth: true });
}
// moonlight on the floorboards through the round window: a soft disc with the cross of the muntins in it
function moonPatchTexture() {
  return Tex.make('moonPatch', 128, 128, (g, w, h) => {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const q = c.getContext('2d');
    q.fillStyle = '#fff'; q.beginPath(); q.arc(w / 2, h / 2, w * 0.4, 0, TAU); q.fill();
    q.globalCompositeOperation = 'destination-out'; q.fillStyle = '#000';
    q.fillRect(w / 2 - 3, 0, 6, h); q.fillRect(0, h / 2 - 3, w, 6);
    g.clearRect(0, 0, w, h);
    if ('filter' in g) g.filter = 'blur(3px)';
    g.drawImage(c, 0, 0);
    if ('filter' in g) g.filter = 'none';
  }, { clamp: true, smooth: true });
}
// a polaroid lying face up: the white frame, a dark smudge of a picture (other houses, other front doors)
function oldPolaroidTexture(i) {
  return Tex.make('oldPol' + i, 64, 80, (g, w, h, rng) => {
    g.fillStyle = '#e9e3d4'; g.fillRect(0, 0, w, h);
    const grd = g.createLinearGradient(0, 6, 0, 58);
    grd.addColorStop(0, ['#2a2f3a', '#3a2c22', '#1f2a24', '#33281e'][i % 4]); grd.addColorStop(1, '#0c0a0a');
    g.fillStyle = grd; g.fillRect(5, 5, w - 10, 52);
    // the house in it: a dark roof line and a lit window or two
    g.fillStyle = 'rgba(0,0,0,.6)'; g.beginPath(); g.moveTo(10, 40); g.lineTo(32, 22 + rng() * 6); g.lineTo(54, 40); g.lineTo(54, 57); g.lineTo(10, 57); g.fill();
    g.fillStyle = 'rgba(255,190,90,.75)'; for (let k = 0; k < 1 + (i % 2); k++) g.fillRect(16 + rng() * 26, 44 + rng() * 6, 4, 4);
    Tex.grain(g, w, h, 26, rng);
  }, { clamp: true });
}

// --- wear: the house is old. One tileable noise texture laid over its surfaces in world space (addWear) ---
// r: blotches, g: fine grime, b: stain shapes (warped noise: water stains and their tide lines)
function wearTexture() {
  const t = Tex.make('wear', 256, 256, (g, w, h, rng) => {
    const oct = (list) => list.map(([n, a]) => ({ n, a, v: Float32Array.from({ length: n * n }, () => rng()) }));
    const sm = (x) => x * x * (3 - 2 * x);
    const fbm = (os, u, v) => {
      let s = 0, t2 = 0;
      for (const o of os) {
        const fx = u * o.n, fy = v * o.n, x0 = Math.floor(fx), y0 = Math.floor(fy), tx = sm(fx - x0), ty = sm(fy - y0);
        const at = (i, j) => o.v[(((j % o.n) + o.n) % o.n) * o.n + (((i % o.n) + o.n) % o.n)];
        const a = at(x0, y0) + (at(x0 + 1, y0) - at(x0, y0)) * tx, b = at(x0, y0 + 1) + (at(x0 + 1, y0 + 1) - at(x0, y0 + 1)) * tx;
        s += (a + (b - a) * ty) * o.a; t2 += o.a;
      }
      return s / t2;
    };
    const A = oct([[4, 0.5], [8, 0.27], [16, 0.15], [32, 0.08]]), B = oct([[16, 0.42], [32, 0.33], [64, 0.25]]), C = oct([[3, 0.5], [6, 0.3], [12, 0.2]]);
    const st = (x) => clamp((x - 0.5) * 2.1 + 0.5, 0, 1);
    const id = g.createImageData(w, h), d = id.data;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const u = x / w, v = y / h, k = (y * w + x) * 4;
      const wx = u + (fbm(A, u + 0.31, v + 0.17) - 0.5) * 0.3, wy = v + (fbm(A, u + 0.71, v + 0.53) - 0.5) * 0.3;
      d[k] = st(fbm(A, u, v)) * 255; d[k + 1] = st(fbm(B, u, v)) * 255; d[k + 2] = st(fbm(C, wx, wy)) * 255; d[k + 3] = 255;
    }
    g.putImageData(id, 0, 0);
  }, { smooth: true, seed: 9091 });
  t.colorSpace = THREE.NoColorSpace;   // (data, not a color)
  return t;
}
// In the shader (all in world space): floors have gone dull and faded, grime gathers along the walls and thickest in
// the corners, the finish is worn off in patches, there are old spills with darker rings and scuffs everywhere. Walls
// have yellowed, are scuffed above the floor, grimy up to the knee and sooty under the ceiling, water stains with
// brown tide lines have grown down from the ceiling and damp has come up from the floor, there are drip streaks and
// smudges at hand height. Ceilings have yellowed and have water stains of their own. Rugs (uWearRug) have faded
// and gone threadbare where everybody walks. (The rooms' walls are at x 0 / 14 / 30, z 0 / 12 / 24, the basement's
// at x 60 / 80, z 2 / 20, the attic's at x 0.17 / 29.83, z 2.5 / 21.5 above y 3.05)
const WEAR_GLSL = `
varying vec3 vWearP;
varying vec3 vWearN;
uniform sampler2D tWear;
uniform sampler2D tWearPath;
uniform float uWear;
uniform float uWearRug;
uniform vec4 uWearDoor[6];
vec2 wearD(vec3 P) {
  vec2 d;
  if (P.y > 3.05) d = vec2(min(abs(P.x - 0.17), abs(P.x - 29.83)), min(abs(P.z - 2.5), abs(P.z - 21.5)));
  else if (P.x > 50.0) d = vec2(min(abs(P.x - 60.0), abs(P.x - 80.0)), min(abs(P.z - 2.0), abs(P.z - 20.0)));
  else d = vec2(min(min(abs(P.x), abs(P.x - 14.0)), abs(P.x - 30.0)), min(min(abs(P.z), abs(P.z - 12.0)), abs(P.z - 24.0)));
  return max(d - 0.15, 0.0);
}
float wearLum(vec3 c) { return dot(c, vec3(0.3, 0.59, 0.11)); }
float wearApply(inout vec3 col) {
  vec3 P = vWearP, N = normalize(vWearN);
  float k = uWear, g = 0.0, l = wearLum(col);
  if (uWearRug > 0.5) {
    vec2 q = P.xz;
    vec3 a = texture2D(tWear, q * 0.17 + vec2(0.13, 0.41)).rgb, b = texture2D(tWear, q * 0.6 + vec2(0.71, 0.29)).rgb;
    col = mix(col, l * vec3(1.06, 0.98, 0.86), 0.4 * k);
    float worn = smoothstep(0.45, 0.7, a.r);
    col = mix(col, l * vec3(1.18, 1.1, 0.96) + 0.012, worn * 0.42 * k);
    g = clamp(smoothstep(0.5, 0.8, b.g) * 0.32 + smoothstep(0.66, 0.74, a.b) * 0.38, 0.0, 1.0) * k;
    col *= mix(vec3(1.0), vec3(0.62, 0.54, 0.44), g);
    return g + worn * 0.3 * k;
  }
  if (N.y > 0.5) {
    vec2 q = P.xz, d = wearD(P);
    vec3 a = texture2D(tWear, q * 0.083).rgb;
    vec3 b = texture2D(tWear, q * 0.29 + vec2(0.31, 0.67)).rgb;
    vec3 c = texture2D(tWear, q * 1.13 + vec2(0.57, 0.21)).rgb;
    float edge = 1.0 - smoothstep(0.0, 0.6, min(d.x, d.y));
    float corner = (1.0 - smoothstep(0.0, 1.1, d.x)) * (1.0 - smoothstep(0.0, 1.1, d.y));
    float worn = smoothstep(0.42, 0.66, a.r * 0.6 + b.r * 0.4);
    float spill = smoothstep(0.74, 0.86, b.b) * smoothstep(0.45, 0.62, a.b);
    float scuff = smoothstep(0.6, 0.8, c.g) * (0.25 + 0.75 * smoothstep(0.35, 0.6, b.r));
    // (distance to the worn paths: baked over the house, x -1..31, z -1..25, see wearPathTexture)
    float dp = P.x < 31.0 ? texture2D(tWearPath, (q + 1.0) / vec2(32.0, 26.0)).r * 2.0 : 99.0;
    float path = (1.0 - smoothstep(0.25, 1.05, dp + (b.r - 0.5) * 0.6)) * (P.y < 1.0 ? 1.0 : 0.0);
    col = mix(col, vec3(0.2, 0.18, 0.15), (0.12 + worn * 0.18 + path * 0.2) * k);
    g = clamp(edge * (0.4 + 0.4 * b.g) + corner * 0.45 + spill * 0.4 + scuff * (0.3 + path * 0.25) + path * 0.1, 0.0, 1.0) * k;
    col *= mix(vec3(1.0), vec3(0.52, 0.44, 0.34), g);
    return g + (worn * 0.5 + path * 0.4) * k;
  }
  if (N.y < -0.5) {
    vec2 q = P.xz, d = wearD(P);
    vec3 a = texture2D(tWear, q * 0.18 + vec2(0.4, 0.2)).rgb, b = texture2D(tWear, q * 0.31).rgb;
    float s = a.b * 0.8 + b.r * 0.2;
    float inside = smoothstep(0.84, 0.855, s), rim = inside * (1.0 - smoothstep(0.855, 0.89, s));
    col = mix(col, l * vec3(1.05, 0.97, 0.8), 0.25 * k);
    col *= mix(vec3(1.0), vec3(0.87, 0.76, 0.58), inside * 0.55 * k);
    g = clamp(rim * 0.35 + (1.0 - smoothstep(0.0, 0.7, min(d.x, d.y))) * 0.35 + smoothstep(0.55, 0.85, b.g) * 0.15, 0.0, 1.0) * k;
    col *= mix(vec3(1.0), vec3(0.6, 0.5, 0.38), g);
    return g;
  }
  float along = abs(N.x) > 0.5 ? P.z : P.x, hy = P.y - (P.y > 3.05 ? 3.14 : 0.0);
  vec2 q = vec2(along, P.y);
  vec3 a = texture2D(tWear, q * 0.11 + vec2(0.5, 0.13)).rgb;
  vec3 b = texture2D(tWear, q * 0.37).rgb;
  vec3 c = texture2D(tWear, q * 1.3 + vec2(0.2, 0.8)).rgb;
  col = mix(col, l * vec3(1.07, 0.97, 0.8), 0.24 * k);
  float sTop = a.b + (hy - 2.3) * 0.25;
  float inside = smoothstep(0.915, 0.925, sTop), rim = inside * (1.0 - smoothstep(0.925, 0.98, sTop));
  float damp = smoothstep(0.68, 0.8, a.r * 0.7 + b.b * 0.3 + (0.45 - hy) * 0.55);
  float streak = smoothstep(0.62, 0.92, texture2D(tWear, vec2(along * 0.8, P.y * 0.04)).g) * 0.22;
  float hand = smoothstep(0.6, 0.78, c.r) * smoothstep(0.75, 1.0, hy) * (1.0 - smoothstep(1.45, 1.7, hy)) * 0.25;
  vec2 dd = wearD(P);
  float cornerW = 1.0 - smoothstep(0.0, 0.5, abs(N.x) > 0.5 ? dd.y : dd.x);
  float jamb = 9.0;
  for (int i = 0; i < 6; i++) {
    vec4 D = uWearDoor[i];
    float off = D.x < 0.5 ? abs(P.z - D.y) : abs(P.x - D.y), sd = D.x < 0.5 ? P.x : P.z;
    if (off < 0.25) jamb = min(jamb, min(abs(sd - D.z), abs(sd - D.w)));
  }
  float smudge = (1.0 - smoothstep(0.06, 0.42, jamb)) * smoothstep(0.7, 1.0, hy) * (1.0 - smoothstep(1.5, 1.8, hy)) * (0.35 + 0.65 * smoothstep(0.4, 0.7, c.r));
  col *= mix(vec3(1.0), vec3(0.88, 0.76, 0.56), inside * 0.6 * k);
  g = (1.0 - smoothstep(0.0, 0.16, hy)) * 0.5 + (1.0 - smoothstep(0.1, 0.95, hy)) * (0.2 + 0.35 * b.g)
    + smoothstep(2.15, 3.0, hy) * (0.3 + 0.2 * b.r) + damp * 0.35 + rim * 0.6 + streak + hand + smoothstep(0.55, 0.85, b.r) * 0.18
    + cornerW * (0.18 + 0.2 * b.g) + smudge * 0.42;
  g = clamp(g, 0.0, 1.0) * k;
  col *= mix(vec3(1.0), vec3(0.56, 0.48, 0.38), g);
  return g;
}
`;
// paths worn across the floors (door to door, to the stairs, the stove, the armchair, the bed: world x0, z0, x1, z1)
// and the doors, whose jambs everybody has handled (axis: 0 = wall along x at z = c, 1 = along z at x = c; c, s0,
// s1: filled in by W.applyWear)
const WEAR_PATHS = [[0.4, 17.8, 7.0, 17.5], [7.0, 17.5, 10.3, 12.4], [7.0, 17.5, 13.6, 20.5], [7.0, 17.5, 8.0, 14.0],
  [10.3, 11.6, 8.0, 6.5], [8.0, 6.5, 13.6, 5.1], [8.0, 6.5, 6.5, 2.2],
  [14.4, 5.1, 20.5, 7.0], [20.5, 7.0, 25.3, 11.6], [20.5, 7.0, 17.6, 3.8],
  [14.4, 20.5, 21.0, 17.5], [25.3, 12.4, 21.0, 17.5], [21.0, 17.5, 25.0, 18.6]];
const WEAR_U = {
  doors: Array.from({ length: 6 }, () => new THREE.Vector4(0, -99, 0, 0)),
};
// the distance to the nearest worn path over the house floors (x -1..31, z -1..25 at 8 texels a meter, 2 m = 255),
// baked once: the floor shader reads one texel instead of measuring 16 segments for every pixel
let _wearPathTex = null;
function wearPathTexture() {
  if (_wearPathTex) return _wearPathTex;
  const W_ = 256, H_ = 208, data = new Uint8Array(W_ * H_);
  for (let j = 0; j < H_; j++) for (let i = 0; i < W_; i++) {
    const x = -1 + (i + 0.5) / W_ * 32, z = -1 + (j + 0.5) / H_ * 26;
    let d = 99;
    for (const [x0, z0, x1, z1] of WEAR_PATHS) {
      const abx = x1 - x0, abz = z1 - z0, t = clamp(((x - x0) * abx + (z - z0) * abz) / Math.max(abx * abx + abz * abz, 1e-4), 0, 1);
      d = Math.min(d, Math.hypot(x - x0 - abx * t, z - z0 - abz * t));
    }
    data[j * W_ + i] = Math.round(Math.min(d, 2) / 2 * 255);
  }
  const t = _wearPathTex = new THREE.DataTexture(data, W_, H_, THREE.RedFormat, THREE.UnsignedByteType);
  t.magFilter = t.minFilter = THREE.LinearFilter; t.generateMipmaps = false;
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; t.colorSpace = THREE.NoColorSpace; t.needsUpdate = true;
  return t;
}
// wear a material (once): amt scales all of it, rug: the rug version (faded, threadbare)
function addWear(mat, amt = 1, rug = false) {
  if (!mat || !mat.isMeshStandardMaterial || mat.userData.wear != null) return mat;
  mat.userData.wear = amt;
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.tWear = { value: wearTexture() };
    sh.uniforms.uWear = { value: amt };
    sh.uniforms.uWearRug = { value: rug ? 1 : 0 };
    sh.uniforms.tWearPath = { value: wearPathTexture() };
    sh.uniforms.uWearDoor = { value: WEAR_U.doors };
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWearP;\nvarying vec3 vWearN;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvWearP = (modelMatrix * vec4(transformed, 1.0)).xyz;\nvWearN = normalize(mat3(modelMatrix) * objectNormal);');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\n' + WEAR_GLSL)
      .replace('#include <map_fragment>', '#include <map_fragment>\nvec3 wearC = diffuseColor.rgb;\nfloat wearG = wearApply(wearC);\ndiffuseColor.rgb = wearC;')
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, 1.0, clamp(wearG, 0.0, 1.0) * 0.6);');
  };
  mat.customProgramCacheKey = () => 'wear';
  mat.needsUpdate = true;
  return mat;
}
// --- rugs ---
// a rag rug: strips of old clothes woven across it, a cord along both edges, fringe at the ends (u runs along it)
function ragRugTexture(key, cols) {
  return Tex.make('rag_' + key, 512, 128, (g, w, h, rng) => {
    let x = 10;
    g.fillStyle = '#d8ccb0'; g.fillRect(0, 0, w, h);
    while (x < w - 10) {
      const bw = 5 + Math.floor(rng() * 14), c = cols[Math.floor(rng() * cols.length)];
      g.fillStyle = c; g.fillRect(x, 8, bw, h - 16);
      for (let i = 0; i < bw * 9; i++) { g.fillStyle = rng() < 0.5 ? 'rgba(0,0,0,.18)' : 'rgba(255,255,255,.12)'; g.fillRect(x + rng() * bw, 8 + rng() * (h - 16), 1 + rng() * 2, 2 + rng() * 5); }
      x += bw;
    }
    g.fillStyle = '#3a3026'; g.fillRect(10, 6, w - 20, 3); g.fillRect(10, h - 9, w - 20, 3);
    g.strokeStyle = '#d8ccb0'; g.lineWidth = 1.2;
    for (let y = 10; y < h - 10; y += 4) { g.beginPath(); g.moveTo(0, y); g.lineTo(10, y + rng() * 2 - 1); g.moveTo(w - 10, y); g.lineTo(w, y + rng() * 2 - 1); g.stroke(); }
    Tex.grain(g, w, h, 18, rng);
  });
}
// a coir doormat inside the front door: WELCOME inside a border (sized to fit whatever serif the browser has), a
// little worn where everybody steps
function doormatTexture() {
  return Tex.make('doormat2', 512, 336, (g, w, h, rng) => {
    g.fillStyle = '#7a5a34'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 9000; i++) { g.fillStyle = rng() < 0.5 ? 'rgba(40,26,12,.35)' : 'rgba(200,160,100,.25)'; g.fillRect(rng() * w, rng() * h, 1.5, 3 + rng() * 6); }
    const m = 26;
    g.strokeStyle = '#3a2a18'; g.lineWidth = 12; g.strokeRect(m, m, w - 2 * m, h - 2 * m);
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = 'bold 100px Georgia, "Times New Roman", serif';
    const fs = Math.floor(100 * Math.min(1.05, (w - 2 * m - 80) / g.measureText('WELCOME').width));
    g.font = `bold ${fs}px Georgia, "Times New Roman", serif`;
    g.fillStyle = 'rgba(40,24,12,.85)'; g.fillText('WELCOME', w / 2, h / 2 + fs * 0.05);
    for (let i = 0; i < 3; i++) {
      const x = w * (0.35 + rng() * 0.3), y = h * (0.4 + rng() * 0.25), r = w * (0.12 + rng() * 0.12), grd = g.createRadialGradient(x, y, 2, x, y, r);
      grd.addColorStop(0, 'rgba(150,115,70,.32)'); grd.addColorStop(1, 'rgba(150,115,70,0)');
      g.fillStyle = grd; g.fillRect(0, 0, w, h);
    }
  });
}
// a faded persian rug: red field, a medallion, borders of little motifs, a lighter worn path across it
function persianRugTexture() {
  return Tex.make('persian', 512, 384, (g, w, h, rng) => {
    g.fillStyle = '#e6d8b8'; g.fillRect(0, 0, w, h);
    const band = (m, c) => { g.fillStyle = c; g.fillRect(m, m, w - 2 * m, h - 2 * m); };
    band(8, '#2a2a46'); band(26, '#c8a25a'); band(32, '#6a1e1c'); band(58, '#c8a25a'); band(62, '#7e2420');
    // motifs in the wide border
    g.fillStyle = '#d8c08a';
    for (let x = 44; x < w - 40; x += 22) { g.beginPath(); g.arc(x, 45, 5, 0, TAU); g.fill(); g.beginPath(); g.arc(x, h - 45, 5, 0, TAU); g.fill(); }
    for (let y = 44; y < h - 40; y += 22) { g.beginPath(); g.arc(45, y, 5, 0, TAU); g.fill(); g.beginPath(); g.arc(w - 45, y, 5, 0, TAU); g.fill(); }
    // the medallion and its corners
    const dia = (cx, cy, rx, ry, c) => { g.fillStyle = c; g.beginPath(); g.moveTo(cx, cy - ry); g.lineTo(cx + rx, cy); g.lineTo(cx, cy + ry); g.lineTo(cx - rx, cy); g.closePath(); g.fill(); };
    dia(w / 2, h / 2, 130, 95, '#22223c'); dia(w / 2, h / 2, 100, 72, '#c8a25a'); dia(w / 2, h / 2, 84, 60, '#8a2a24'); dia(w / 2, h / 2, 40, 28, '#e6d0a0'); dia(w / 2, h / 2, 18, 12, '#22223c');
    for (const [cx, cy] of [[62, 62], [w - 62, 62], [62, h - 62], [w - 62, h - 62]]) dia(cx, cy, 60, 44, '#2a2a46');
    for (let i = 0; i < 90; i++) { g.fillStyle = rng() < 0.5 ? 'rgba(220,190,120,.5)' : 'rgba(30,30,60,.5)'; const x = 70 + rng() * (w - 140), y = 70 + rng() * (h - 140); g.fillRect(x, y, 3, 3); }
    // threads, wear, fringe
    for (let i = 0; i < 5000; i++) { g.fillStyle = rng() < 0.5 ? 'rgba(0,0,0,.12)' : 'rgba(255,240,210,.08)'; g.fillRect(rng() * w, rng() * h, 1, 1 + rng() * 2); }
    const grd = g.createLinearGradient(0, h * 0.2, w, h * 0.8);
    grd.addColorStop(0.3, 'rgba(230,210,170,0)'); grd.addColorStop(0.5, 'rgba(230,210,170,.28)'); grd.addColorStop(0.7, 'rgba(230,210,170,0)');
    g.fillStyle = grd; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#e6d8b8'; g.lineWidth = 1;
    for (let y = 10; y < h - 10; y += 3) { g.beginPath(); g.moveTo(0, y); g.lineTo(8, y); g.moveTo(w - 8, y); g.lineTo(w, y); g.stroke(); }
  });
}
// a shaggy bedside rug, soft cream gone grey
function shagRugTexture() {
  return Tex.make('shag', 256, 256, (g, w, h, rng) => {
    g.clearRect(0, 0, w, h);
    g.save(); g.beginPath(); g.ellipse(w / 2, h / 2, w / 2 - 4, h / 2 - 4, 0, 0, TAU); g.clip();
    g.fillStyle = '#b8ae98'; g.fillRect(0, 0, w, h);
    g.lineCap = 'round';
    for (let i = 0; i < 5200; i++) {
      const x = rng() * w, y = rng() * h, a = rng() * TAU, L = 3 + rng() * 6;
      g.strokeStyle = rng() < 0.5 ? 'rgba(232,224,204,.55)' : 'rgba(90,80,64,.4)'; g.lineWidth = 1 + rng() * 1.5;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); g.stroke();
    }
    g.restore();
  }, { clamp: true, smooth: true });
}

// --- clothes lying around: one atlas of cut-out garments, 4 x 2 cells of 256 px (alpha: the floor shows around
// them). 0 white tee, 1 black band tee, 2 flannel shirt, 3 jeans, 4 two socks (white, grey), 5 hoodie, 6 towel,
// 7 plaid blanket ---
function clothesTexture() {
  return Tex.make('clothes', 1024, 512, (g, w, h, rng) => {
    g.clearRect(0, 0, w, h);
    const C = 256;
    const path = (pts) => { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) { const q = pts[i]; if (q.length === 4) g.quadraticCurveTo(q[0], q[1], q[2], q[3]); else g.lineTo(q[0], q[1]); } g.closePath(); };
    const speck = (n, cols, sw = 1.5, sh = 3) => { for (let k = 0; k < n; k++) { g.fillStyle = cols[Math.floor(rng() * cols.length)]; g.fillRect(rng() * C, rng() * C, sw, sh * (0.5 + rng())); } };
    // creases: soft dark folds with a light edge
    const creases = (n, a = 0.16) => {
      g.lineCap = 'round';
      for (let k = 0; k < n; k++) {
        const x = rng() * C, y = rng() * C, an = rng() * Math.PI, L = 30 + rng() * 90;
        const mx = x + Math.cos(an) * L * 0.5 + (rng() - 0.5) * 30, my = y + Math.sin(an) * L * 0.5 + (rng() - 0.5) * 30, ex = x + Math.cos(an) * L, ey = y + Math.sin(an) * L;
        g.strokeStyle = `rgba(0,0,0,${a})`; g.lineWidth = 3 + rng() * 6; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(mx, my, ex, ey); g.stroke();
        g.strokeStyle = `rgba(255,255,255,${a * 0.45})`; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x + 3, y - 2); g.quadraticCurveTo(mx + 3, my - 2, ex + 3, ey - 2); g.stroke();
      }
    };
    // one garment: clipped to its outline, filled, its details and folds, a darker seam along the edge
    const garment = (i, pts, fill, detail, extra) => {
      g.save(); g.translate((i % 4) * C, Math.floor(i / 4) * C);
      if (extra) extra();
      path(pts); g.save(); g.clip();
      fill(); if (detail) detail(); creases(12);
      g.restore();
      path(pts); g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 3; g.stroke();
      g.restore();
    };
    const plain = (c, sp) => () => { g.fillStyle = c; g.fillRect(0, 0, C, C); speck(2500, sp); };
    const tee = [[90, 30], [128, 64, 166, 30], [198, 38], [244, 84], [222, 120], [192, 100], [194, 246], [62, 246], [64, 100], [34, 120], [12, 84], [58, 38]];
    const longSleeved = (t) => [[90, t], [128, t + 30, 166, t], [198, t + 8], [238, t + 110], [250, 240], [220, 246], [204, t + 120], [194, t + 66], [194, 246], [62, 246], [62, t + 66], [52, t + 120], [36, 246], [6, 240], [18, t + 110], [58, t + 8]];
    const neck = (t) => { g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 9; g.beginPath(); g.moveTo(90, t); g.quadraticCurveTo(128, t + 30, 166, t); g.stroke(); };
    // 0: white tee, a faded camp print
    garment(0, tee, plain('#e2ded3', ['rgba(0,0,0,.05)', 'rgba(255,255,255,.1)']), () => {
      neck(30);
      g.globalAlpha = 0.6; g.strokeStyle = '#b03a2a'; g.lineWidth = 5; g.beginPath(); g.arc(128, 120, 26, 0, TAU); g.stroke();
      g.fillStyle = '#2a6a3a'; g.beginPath(); g.moveTo(128, 100); g.lineTo(144, 132); g.lineTo(112, 132); g.closePath(); g.fill(); g.globalAlpha = 1;
      g.strokeStyle = 'rgba(0,0,0,.12)'; g.lineWidth = 4; g.beginPath(); g.moveTo(62, 238); g.lineTo(194, 238); g.stroke();
    });
    // 1: black band tee (the band on the poster: a melting smiley)
    garment(1, tee, plain('#1d1d20', ['rgba(255,255,255,.04)', 'rgba(0,0,0,.2)']), () => {
      neck(30);
      g.globalAlpha = 0.85; g.fillStyle = '#e8c83a'; g.beginPath(); g.arc(128, 112, 30, 0, TAU); g.fill();
      for (const [dx, L] of [[-16, 26], [-2, 18], [14, 30]]) { g.fillRect(128 + dx - 3, 128, 6, L); g.beginPath(); g.arc(128 + dx, 128 + L, 3.5, 0, TAU); g.fill(); }
      g.strokeStyle = '#1d1d20'; g.lineWidth = 3;
      for (const ex of [-11, 11]) { g.beginPath(); g.moveTo(128 + ex - 5, 101); g.lineTo(128 + ex + 5, 109); g.moveTo(128 + ex + 5, 101); g.lineTo(128 + ex - 5, 109); g.stroke(); }
      g.beginPath(); g.moveTo(114, 122); g.quadraticCurveTo(121, 116, 128, 122); g.quadraticCurveTo(135, 128, 142, 122); g.stroke();
      g.fillStyle = '#e8e4da'; g.font = 'bold 22px sans-serif'; g.textAlign = 'center'; g.fillText('MILDEW', 128, 182);
      g.globalAlpha = 1; speck(600, ['rgba(29,29,32,.6)'], 2, 2);
    });
    // 2: flannel shirt, green and navy plaid, buttons down the front
    garment(2, longSleeved(30), () => {
      g.fillStyle = '#2c5a3a'; g.fillRect(0, 0, C, C);
      g.fillStyle = 'rgba(16,26,52,.55)'; for (let y = 8; y < C; y += 56) g.fillRect(0, y, C, 22); for (let x = 8; x < C; x += 56) g.fillRect(x, 0, 22, C);
      g.fillStyle = 'rgba(220,190,80,.4)'; for (let y = 44; y < C; y += 56) g.fillRect(0, y, C, 3); for (let x = 44; x < C; x += 56) g.fillRect(x, 0, 3, C);
      speck(2500, ['rgba(0,0,0,.12)', 'rgba(255,255,255,.07)']);
    }, () => {
      neck(30);
      g.strokeStyle = 'rgba(0,0,0,.3)'; g.lineWidth = 2; g.beginPath(); g.moveTo(128, 62); g.lineTo(128, 246); g.stroke();
      g.fillStyle = '#d8d0b8'; for (let y = 76; y < 240; y += 28) { g.beginPath(); g.arc(131, y, 3.5, 0, TAU); g.fill(); }
      g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.moveTo(92, 30); g.lineTo(116, 62); g.lineTo(104, 30); g.fill(); g.beginPath(); g.moveTo(164, 30); g.lineTo(140, 62); g.lineTo(152, 30); g.fill();
    });
    // 3: jeans, faded at the thighs and knees, orange stitching
    garment(3, [[70, 14], [186, 14], [192, 60], [198, 248], [146, 248], [132, 112], [124, 112], [110, 248], [58, 248], [64, 60]], () => {
      g.fillStyle = '#3a5a86'; g.fillRect(0, 0, C, C);
      g.strokeStyle = 'rgba(255,255,255,.05)'; g.lineWidth = 1; for (let k = -C; k < C; k += 4) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k + C, C); g.stroke(); }
      for (const [x, y, r] of [[96, 110, 40], [160, 110, 40], [88, 190, 22], [166, 190, 22]]) { const grd = g.createRadialGradient(x, y, 2, x, y, r); grd.addColorStop(0, 'rgba(150,180,215,.38)'); grd.addColorStop(1, 'rgba(150,180,215,0)'); g.fillStyle = grd; g.fillRect(0, 0, C, C); }
      speck(2500, ['rgba(0,0,0,.12)', 'rgba(255,255,255,.08)']);
    }, () => {
      g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(64, 14, 128, 20);
      g.strokeStyle = 'rgba(210,150,70,.7)'; g.lineWidth = 1.5; g.setLineDash([3, 3]);
      g.beginPath(); g.moveTo(64, 36); g.lineTo(192, 36); g.moveTo(128, 36); g.quadraticCurveTo(136, 70, 128, 96); g.moveTo(72, 40); g.quadraticCurveTo(80, 64, 102, 62); g.moveTo(184, 40); g.quadraticCurveTo(176, 64, 154, 62);
      g.moveTo(68, 60); g.lineTo(62, 246); g.moveTo(188, 60); g.lineTo(194, 246); g.stroke(); g.setLineDash([]);
      g.fillStyle = '#b89a50'; g.beginPath(); g.arc(128, 24, 4, 0, TAU); g.fill();
    });
    // 4: socks, a white one with stripes and a grey one
    const sock = [[34, 12], [88, 12], [90, 150], [112, 196], [120, 226], [100, 246], [60, 236], [40, 196], [32, 160]];
    garment(4, sock, plain('#e4e0d6', ['rgba(0,0,0,.05)']), () => {
      g.fillStyle = '#b03a2a'; g.fillRect(0, 26, 128, 8); g.fillStyle = '#2a4a8a'; g.fillRect(0, 40, 128, 6);
      g.fillStyle = 'rgba(0,0,0,.12)'; g.beginPath(); g.arc(46, 196, 24, 0, TAU); g.fill(); g.beginPath(); g.arc(104, 232, 22, 0, TAU); g.fill();
      g.strokeStyle = 'rgba(0,0,0,.06)'; g.lineWidth = 2; for (let x = 38; x < 90; x += 5) { g.beginPath(); g.moveTo(x, 12); g.lineTo(x, 24); g.stroke(); }
    });
    garment(4, sock.map(([x, y]) => [x + 128, y]), plain('#45454b', ['rgba(255,255,255,.05)', 'rgba(0,0,0,.15)']), () => {
      g.fillStyle = 'rgba(255,255,255,.12)'; g.beginPath(); g.arc(174, 196, 24, 0, TAU); g.fill(); g.beginPath(); g.arc(232, 232, 22, 0, TAU); g.fill();
    });
    // 5: hoodie, heather grey, the hood above, a pocket, drawstrings
    garment(5, longSleeved(60), plain('#86888c', ['rgba(0,0,0,.08)', 'rgba(255,255,255,.08)']), () => {
      neck(60);
      g.fillStyle = 'rgba(0,0,0,.1)'; g.fillRect(84, 176, 88, 54); g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 2; g.strokeRect(84, 176, 88, 54);
      g.strokeStyle = '#e8e4da'; g.lineWidth = 3; g.beginPath(); g.moveTo(118, 78); g.lineTo(116, 128); g.moveTo(138, 78); g.lineTo(141, 124); g.stroke();
      g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(62, 232, 132, 14);
    }, () => {
      // the hood lies flat above the shoulders
      g.beginPath(); g.ellipse(128, 40, 48, 36, 0, 0, TAU); g.fillStyle = '#7e8084'; g.fill();
      const grd = g.createRadialGradient(128, 46, 4, 128, 46, 34); grd.addColorStop(0, 'rgba(0,0,0,.45)'); grd.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = grd; g.fill();
      g.strokeStyle = 'rgba(0,0,0,.3)'; g.lineWidth = 3; g.stroke();
    });
    // 6: a bath towel, faded blue with white stripes
    garment(6, [[16, 64], [240, 64], [240, 192], [16, 192]], () => {
      g.fillStyle = '#4a78a6'; g.fillRect(0, 0, C, C);
      g.fillStyle = '#e8e4da'; g.fillRect(36, 0, 12, C); g.fillRect(54, 0, 4, C); g.fillRect(208, 0, 12, C); g.fillRect(198, 0, 4, C);
      speck(5000, ['rgba(255,255,255,.18)', 'rgba(0,0,0,.18)'], 2, 2);
    });
    // 7: a red and black buffalo check blanket with a fringe
    garment(7, [[6, 10], [250, 10], [250, 246], [6, 246]], () => {
      g.fillStyle = '#8a1c1c'; g.fillRect(0, 0, C, C);
      g.fillStyle = 'rgba(10,6,6,.5)'; for (let k = 0; k < C; k += 48) { g.fillRect(k, 0, 24, C); g.fillRect(0, k, C, 24); }
      speck(5000, ['rgba(0,0,0,.18)', 'rgba(255,200,180,.08)'], 2, 2);
    }, null, () => {
      g.strokeStyle = '#6a1616'; g.lineWidth = 2;
      for (let x = 10; x < 248; x += 5) { g.beginPath(); g.moveTo(x, 10); g.lineTo(x + (rng() - 0.5) * 3, 1); g.moveTo(x, 246); g.lineTo(x + (rng() - 0.5) * 3, 255); g.stroke(); }
    });
  }, { clamp: true, smooth: true });
}
// each garment's cell (and part of it) and its size in meters across x l
const CLOTHES = {
  tee: { cell: 0, w: 0.62, l: 0.62 }, band: { cell: 1, w: 0.62, l: 0.62 }, flannel: { cell: 2, w: 0.82, l: 0.82 }, jeans: { cell: 3, w: 1.0, l: 1.0 },
  sockA: { cell: 4, u0: 0, u1: 0.5, w: 0.16, l: 0.32 }, sockB: { cell: 4, u0: 0.5, u1: 1, w: 0.16, l: 0.32 },
  hoodie: { cell: 5, w: 0.8, l: 0.8 }, towel: { cell: 6, w: 0.75, l: 0.75 }, blanket: { cell: 7, w: 1.35, l: 1.35 },
};
function clothUV(g, K) {
  const uv = g.attributes.uv, u0 = K.u0 ?? 0, u1 = K.u1 ?? 1, ci = K.cell % 4, cj = Math.floor(K.cell / 4);
  for (let i = 0; i < uv.count; i++) { const u = uv.getX(i), v = uv.getY(i); uv.setXY(i, (ci + u0 + (u1 - u0) * u) / 4, 1 - (cj + 1 - v) / 2); }
}
// a garment lying crumpled (on the floor, or on something y0 up): a grid over its cell pushed up into folds and a
// lump where it bunched up. o: seed, amp (fold height), lump, y0, nx / nz
function clothGeo(kind, o = {}) {
  const K = CLOTHES[kind], small = K.l < 0.4, nx = o.nx ?? (small ? 4 : 12), nz = o.nz ?? (small ? 8 : 12);
  const g = new THREE.PlaneGeometry(K.w, K.l, nx, nz);
  g.rotateX(-Math.PI / 2);
  clothUV(g, K);
  const R = mulberry32((o.seed ?? 7) * 7919), amp = o.amp ?? (small ? 0.008 : 0.025), lump = o.lump ?? (small ? 0.01 : 0.04);
  const W = [0, 1, 2].map(() => { const a = R() * Math.PI; return { x: Math.cos(a), z: Math.sin(a), f: (small ? 30 : 9) + R() * 14, p: R() * TAU }; });
  const cx = (R() - 0.5) * K.w * 0.3, cz = (R() - 0.5) * K.l * 0.3, sg = Math.max(K.w, K.l) * 0.28;
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i), z = pos.getZ(i);
    const n = W.reduce((sum, wv, k) => sum + Math.sin((x * wv.x + z * wv.z) * wv.f + wv.p) * (k ? 0.3 : 0.4), 0);
    const hump = Math.exp(-((x - cx) ** 2 + (z - cz) ** 2) / (2 * sg * sg));
    const y = (o.y0 ?? 0) + 0.006 + amp * (0.5 + 0.5 * n) * (0.4 + hump) + lump * hump;
    x += Math.sin(z * 5 + W[0].p) * 0.02 * (small ? 0.3 : 1); z += Math.sin(x * 4 + W[1].p) * 0.02 * (small ? 0.3 : 1);
    pos.setXYZ(i, x, y, z);
  }
  g.computeVertexNormals();
  return g;
}
// a garment hung over a bar or an edge (along x at the origin, the top of the bar at y 0): side A (the garment's top
// part) goes toward -z, side B toward +z. o: split (where along the garment from its top the bar is, 0..1), R (the
// bar's radius: the cloth goes round it), aA / aB (how steeply each side falls: 0 lies flat on top, PI/2 hangs
// straight down), dropA / dropB (how far below the bar that side lands on something and lies on it), wr (folds)
function drapeGeo(kind, o = {}) {
  const K = CLOTHES[kind], nx = o.nx ?? 10, nz = o.nz ?? 20;
  const g = new THREE.PlaneGeometry(K.w, K.l, nx, nz);
  clothUV(g, K);
  const R = o.R ?? 0.03, Rn = mulberry32((o.seed ?? 3) * 104729), p1 = Rn() * TAU, p2 = Rn() * TAU, wr = o.wr ?? 0.012;
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), t = (K.l / 2 - pos.getY(i)) - (o.split ?? 0.5) * K.l;
    const sd = t < 0 ? -1 : 1, d = Math.abs(t), a = sd < 0 ? (o.aA ?? 1.4) : (o.aB ?? 1.4), drop = sd < 0 ? o.dropA : o.dropB, arc = R * a;
    let y, z, ny, nz;
    if (d <= arc) { const f = d / R; z = sd * R * Math.sin(f); y = -R + R * Math.cos(f); ny = Math.cos(f); nz = sd * Math.sin(f); }
    else { const e = d - arc; z = sd * (R * Math.sin(a) + Math.cos(a) * e); y = -R + R * Math.cos(a) - Math.sin(a) * e; ny = Math.cos(a); nz = sd * Math.sin(a); }
    if (drop != null && y < -drop) {
      const e0 = (-R + R * Math.cos(a) + drop) / Math.max(Math.sin(a), 1e-3), rest = d - arc - e0;
      z = sd * (R * Math.sin(a) + Math.cos(a) * e0 + rest * (0.8 + 0.2 * Math.sin(x * 9 + p1))); y = -drop + 0.006; ny = 1; nz = 0;
    }
    const fold = (Math.sin(x * 21 + t * 6 + p1) * 0.6 + Math.sin(x * 9 - t * 11 + p2) * 0.4) * wr, f = ny > 0.9 ? Math.abs(fold) : fold;
    pos.setXYZ(i, x + Math.sin(t * 7 + p2) * 0.012, y + ny * f, z + nz * f);
  }
  g.computeVertexNormals();
  return g;
}
// a box with rounded edges and corners (normals point straight out of the rounding)
function roundedBoxGeo(w, h, d, r, seg = 3) {
  const g = new THREE.BoxGeometry(w, h, d, seg * 2, seg * 2, seg * 2), p = g.attributes.position, nor = g.attributes.normal;
  const v = new THREE.Vector3(), c = new THREE.Vector3(), hx = w / 2 - r, hy = h / 2 - r, hz = d / 2 - r;
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    c.set(clamp(v.x, -hx, hx), clamp(v.y, -hy, hy), clamp(v.z, -hz, hz));
    v.sub(c);
    if (v.lengthSq() > 1e-12) { v.normalize(); nor.setXYZ(i, v.x, v.y, v.z); v.multiplyScalar(r); }
    p.setXYZ(i, c.x + v.x, c.y + v.y, c.z + v.z);
  }
  return g;
}
// a sneaker's upper: its side profile (heel up at the back, the ankle opening, sloping down to a round toe)
// extruded across and rounded by the bevel; the toe toward +z, the bottom just above a sole
function sneakerGeo() {
  return Geo.get('sneaker', () => {
    const s = new THREE.Shape();
    s.moveTo(-0.125, 0.03); s.lineTo(-0.13, 0.085); s.quadraticCurveTo(-0.128, 0.1, -0.11, 0.1); s.quadraticCurveTo(-0.075, 0.08, -0.04, 0.088);
    s.lineTo(-0.02, 0.098); s.quadraticCurveTo(0.05, 0.075, 0.1, 0.055); s.quadraticCurveTo(0.13, 0.045, 0.128, 0.03); s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.06, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 2, curveSegments: 4 });
    g.translate(0, 0, -0.03); g.rotateY(-Math.PI / 2);
    return g;
  });
}
// a cork board over the desk: polaroids, a concert ticket, sticky notes, a MISSING flyer, pins
function corkBoardTexture() {
  return Tex.make('cork', 384, 256, (g, w, h, rng) => {
    g.fillStyle = '#a8804c'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 9000; i++) { g.fillStyle = rng() < 0.5 ? 'rgba(60,36,14,.35)' : 'rgba(230,190,130,.3)'; g.fillRect(rng() * w, rng() * h, 1 + rng() * 1.5, 1 + rng() * 1.5); }
    const pin = (x, y, c) => { g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.arc(x + 2, y + 2, 4.5, 0, TAU); g.fill(); g.fillStyle = c; g.beginPath(); g.arc(x, y, 4.5, 0, TAU); g.fill(); g.fillStyle = 'rgba(255,255,255,.6)'; g.beginPath(); g.arc(x - 1.5, y - 1.5, 1.5, 0, TAU); g.fill(); };
    const item = (x, y, ww, hh, rot, draw) => { g.save(); g.translate(x, y); g.rotate(rot); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(-ww / 2 + 3, -hh / 2 + 3, ww, hh); draw(ww, hh); g.restore(); };
    for (const [x, y, r, k] of [[56, 66, -0.12, 0], [114, 80, 0.08, 1], [300, 186, 0.1, 2]]) item(x, y, 52, 62, r, (ww, hh) => {
      g.fillStyle = '#ece6d6'; g.fillRect(-ww / 2, -hh / 2, ww, hh);
      const grd = g.createLinearGradient(0, -hh / 2, 0, hh / 2 - 14); grd.addColorStop(0, ['#3a4a6a', '#5a3a2a', '#2a4a3a'][k]); grd.addColorStop(1, '#141010');
      g.fillStyle = grd; g.fillRect(-ww / 2 + 4, -hh / 2 + 4, ww - 8, hh - 18);
      g.fillStyle = 'rgba(255,220,150,.6)'; g.beginPath(); g.arc(-4 + k * 6, -6, 5 + k, 0, TAU); g.fill();
      pin(0, -hh / 2 + 4, '#c83a2a');
    });
    item(200, 58, 96, 40, 0.06, (ww, hh) => {
      g.fillStyle = '#d8c060'; g.fillRect(-ww / 2, -hh / 2, ww, hh);
      g.fillStyle = '#2a2a2a'; g.textAlign = 'center'; g.font = 'bold 13px sans-serif'; g.fillText('MILDEW', -8, -2); g.font = '9px sans-serif'; g.fillText('LIVE  OCT 12', -8, 12);
      g.strokeStyle = 'rgba(0,0,0,.4)'; g.setLineDash([3, 3]); g.beginPath(); g.moveTo(ww / 2 - 18, -hh / 2); g.lineTo(ww / 2 - 18, hh / 2); g.stroke(); g.setLineDash([]);
      pin(-ww / 2 + 8, 0, '#3a6ac8');
    });
    for (const [x, y, r, c] of [[206, 150, -0.15, '#f0e070'], [258, 118, 0.12, '#f0a0c0'], [78, 184, 0.05, '#a0e0f0']]) item(x, y, 46, 44, r, (ww, hh) => {
      g.fillStyle = c; g.fillRect(-ww / 2, -hh / 2, ww, hh);
      g.strokeStyle = 'rgba(30,30,80,.6)'; g.lineWidth = 1.2;
      for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(-ww / 2 + 6, -hh / 2 + 12 + k * 8); for (let x2 = -ww / 2 + 6; x2 < ww / 2 - 6; x2 += 4) g.lineTo(x2, -hh / 2 + 12 + k * 8 + (rng() - 0.5) * 3); g.stroke(); }
      pin(0, -hh / 2 + 5, '#2a9a4a');
    });
    item(332, 76, 70, 100, -0.05, (ww, hh) => {
      g.fillStyle = '#e8e4da'; g.fillRect(-ww / 2, -hh / 2, ww, hh);
      g.fillStyle = '#1a1a1a'; g.textAlign = 'center'; g.font = 'bold 13px sans-serif'; g.fillText('MISSING', 0, -hh / 2 + 18);
      g.fillStyle = '#5a5a5a'; g.fillRect(-18, -hh / 2 + 26, 36, 36);
      for (let k = 0; k < 4; k++) g.fillRect(-ww / 2 + 8, -hh / 2 + 70 + k * 6, ww - 16 - rng() * 14, 2);
      pin(0, -hh / 2 + 4, '#d8b030');
    });
  }, { clamp: true });
}

function scorchTexture() {
  return Tex.make('scorch', 64, 64, (g, w, h, rng) => {
    const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, 'rgba(0,0,0,.85)'); grd.addColorStop(0.6, 'rgba(10,6,4,.5)'); grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(0,0,0,.4)'; const a = rng() * TAU, r = rng() * 28; g.fillRect(32 + Math.cos(a) * r, 32 + Math.sin(a) * r, 2, 2); }
  }, { clamp: true, smooth: true });
}

function splatTexture() {
  return Tex.make('splat', 64, 64, (g, w, h, rng) => {
    g.fillStyle = '#fff';
    g.beginPath(); g.arc(32, 32, 16, 0, TAU); g.fill();
    for (let i = 0; i < 9; i++) { const a = rng() * TAU, r = 14 + rng() * 14; g.beginPath(); g.arc(32 + Math.cos(a) * r, 32 + Math.sin(a) * r, 3 + rng() * 6, 0, TAU); g.fill(); }
  }, { clamp: true, smooth: true });
}

// =====================================================================
//  RENDER: renderer, low-res target + retro post shader, camera rig
// =====================================================================
const POST_VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
const POST_FRAG = `
precision highp float;
uniform sampler2D tScene; uniform sampler2D tBloom; uniform vec2 uRes; uniform float uTime;
uniform float uDither; uniform float uLevels; uniform float uVignette; uniform float uGrain; uniform float uBloom;
uniform vec3 uTint; uniform vec3 uLift; uniform float uSat; uniform float uContrast; uniform float uExposure;
uniform float uDamage; uniform float uAberr; uniform float uDesat; uniform float uWobble;
varying vec2 vUv;
float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
// 4x4 ordered (Bayer) dither in closed form: the same matrix as the 0 8 2 10 / 12 4 14 6 / ... table
float bayer2(vec2 a){ a = floor(a); return fract(a.x * 0.5 + a.y * a.y * 0.75); }
float bayer4(vec2 p){ return bayer2(0.5 * p) * 0.25 + bayer2(p); }
vec3 aces(vec3 x){ const float a=2.51; const float b=0.03; const float c=2.43; const float d=0.59; const float e=0.14; return clamp((x*(a*x+b))/(x*(c*x+d)+e),0.0,1.0); }
vec3 toSRGB(vec3 c){ return mix(c*12.92, 1.055*pow(max(c,vec3(0.0)), vec3(1.0/2.4)) - 0.055, step(0.0031308, c)); }
void main(){
  vec2 uv = vUv;
#ifdef RETRO
  // VHS line wobble (retro modes only)
  float wob = (hash(vec2(floor(uv.y * uRes.y * 0.25), floor(uTime * 12.0))) - 0.5) * uWobble / uRes.x;
  uv.x += wob;
#endif
  vec2 dir = uv - 0.5;
  float ab = uAberr * dot(dir, dir);
  vec3 col;
  col.r = texture2D(tScene, uv + dir * ab).r;
  col.g = texture2D(tScene, uv).g;
  col.b = texture2D(tScene, uv - dir * ab).b;
  col += texture2D(tBloom, uv).rgb * uBloom;
  col *= uExposure;
  col = aces(col);
  col = toSRGB(col);
  float l = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(vec3(l), col, uSat * (1.0 - uDesat));
  col = (col - 0.5) * uContrast + 0.5;
  col = col * uTint + uLift * (1.0 - l);
  float asp = uRes.x / uRes.y;
  float vd = length(dir * vec2(asp, 1.0)) / length(vec2(asp, 1.0) * 0.5);
  float vig = smoothstep(1.15, 0.35, vd);
  col *= mix(1.0, vig, uVignette);
  col = mix(col, vec3(0.55, 0.0, 0.02), uDamage * smoothstep(0.35, 1.1, vd));
  col += (hash(uv * uRes + fract(uTime) * 91.7) - 0.5) * uGrain;
#ifdef RETRO
  vec2 px = floor(vUv * uRes);
  float d = bayer4(px) - 0.5;
  col = mix(col, floor(col * uLevels + d * uDither + 0.5) / uLevels, step(0.5, uDither));
#endif
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;
// bloom: soft-threshold prefilter + 13 tap downsample, tent upsample (dual filter mip chain)
const BLOOM_DOWN = `
precision highp float; uniform sampler2D tSrc; uniform vec2 uTexel; uniform float uThreshold; uniform float uKnee; uniform float uPrefilter; varying vec2 vUv;
vec3 s(vec2 o){ return texture2D(tSrc, vUv + o * uTexel).rgb; }
void main(){
  vec3 a = s(vec2(-1.0,-1.0)), b = s(vec2(1.0,-1.0)), c = s(vec2(-1.0,1.0)), d = s(vec2(1.0,1.0));
  vec3 e = s(vec2(-2.0,-2.0)), f = s(vec2(0.0,-2.0)), g = s(vec2(2.0,-2.0)), h = s(vec2(-2.0,0.0));
  vec3 i = s(vec2(0.0,0.0)), j = s(vec2(2.0,0.0)), k = s(vec2(-2.0,2.0)), l = s(vec2(0.0,2.0)), m = s(vec2(2.0,2.0));
  vec3 col = (a+b+c+d) * 0.125 + (e+g+k+m) * 0.03125 + (f+h+j+l) * 0.0625 + i * 0.125;
  if (uPrefilter > 0.5) {
    float br = max(col.r, max(col.g, col.b));
    float rq = clamp(br - uThreshold + uKnee, 0.0, 2.0 * uKnee);
    rq = (rq * rq) / (4.0 * uKnee + 1e-4);
    col *= max(rq, br - uThreshold) / max(br, 1e-4);
    col = min(col, vec3(40.0));
  }
  gl_FragColor = vec4(col, 1.0);
}`;
const BLOOM_UP = `
precision highp float; uniform sampler2D tSrc; uniform sampler2D tAdd; uniform vec2 uTexel; uniform float uScatter; varying vec2 vUv;
vec3 s(vec2 o){ return texture2D(tSrc, vUv + o * uTexel).rgb; }
void main(){
  vec3 col = s(vec2(0.0)) * 4.0 + (s(vec2(-1.0,0.0)) + s(vec2(1.0,0.0)) + s(vec2(0.0,-1.0)) + s(vec2(0.0,1.0))) * 2.0
           + s(vec2(-1.0,-1.0)) + s(vec2(1.0,-1.0)) + s(vec2(-1.0,1.0)) + s(vec2(1.0,1.0));
  col /= 16.0;
  gl_FragColor = vec4(texture2D(tAdd, vUv).rgb + col * uScatter, 1.0);
}`;

const Render = {
  renderer: null, scene: null, camera: null, overlayScene: null, overlayCam: null,
  rt: null, post: null, w: 1, h: 1, rw: 1, rh: 1,
  grade: { tint: new THREE.Vector3(1, 1, 1), lift: new THREE.Vector3(0, 0, 0), sat: 1, contrast: 1, exposure: 1, vignette: 0.5 },
  gradeTarget: null, bloomStrength: 0.9, bloomThreshold: 1.0, mips: [], ups: [],

  init(canvas) {
    const r = this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance', alpha: false, preserveDrawingBuffer: DEBUG || /[?&]shots/.test(QS) });
    r.outputColorSpace = THREE.SRGBColorSpace;
    r.toneMapping = THREE.NoToneMapping;
    r.shadowMap.enabled = true;
    r.shadowMap.type = THREE.PCFSoftShadowMap;
    // shadow proxies (W.buildShadowProxies) only exist while the shadow maps of the main scene render
    this.shadowProxies = [];
    const sm = r.shadowMap, smRender = sm.render;
    sm.render = (lights, scene, camera) => {
      const P = this.shadowProxies;
      if (!P.length || !lights.length || scene !== this.scene) { smRender.call(sm, lights, scene, camera); return; }
      for (const m of P) m.visible = true;
      try { smRender.call(sm, lights, scene, camera); } finally { for (const m of P) m.visible = false; }
    };
    r.setPixelRatio(1);
    r.autoClear = false;
    // (anisotropic filtering by quality: it mostly shows in first person)
    GLB.anisotropy = Math.min(SETTINGS.quality >= 2 ? 8 : SETTINGS.quality === 1 ? 4 : 2, r.capabilities.getMaxAnisotropy());
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x050407);
    this.scene.fog = new THREE.Fog(0x050407, 25, 70);
    this.camera = new THREE.PerspectiveCamera(24, 1, 0.05, 200);
    this.camera.rotation.order = 'YXZ';
    this.overlayScene = new THREE.Scene();
    this.overlayCam = new THREE.PerspectiveCamera(65, 1, 0.01, 10);
    this.overlayScene.add(this.overlayCam);
    // first person hands + held polaroid: their own light rig, dimmed with the room (overlayK, set by W.updateLights)
    this.ovHemi = new THREE.HemisphereLight(0xfff0dd, 0x403028, 1.4); this.overlayScene.add(this.ovHemi);
    const ol = this.ovDir = new THREE.DirectionalLight(0xffe2c0, 2.4); ol.position.set(-0.5, 1, 0.8); this.overlayScene.add(ol);
    this.overlayK = 1;
    this.overlayVisible = false;
    // image based lighting for PBR materials: a soft neutral room
    this.envTex = this.makeEnvironment();
    this.scene.environment = this.envTex;
    this.scene.environmentIntensity = 0.35;
    this.overlayScene.environment = this.envTex;
    this.overlayScene.environmentIntensity = 0.6;
    // post
    this.postMat = new THREE.ShaderMaterial({
      vertexShader: POST_VERT, fragmentShader: POST_FRAG, depthTest: false, depthWrite: false,
      uniforms: {
        tScene: { value: null }, tBloom: { value: null }, uRes: { value: new THREE.Vector2(1, 1) }, uTime: { value: 0 }, uBloom: { value: 0.9 },
        uDither: { value: 1 }, uLevels: { value: 40 }, uVignette: { value: 0.5 }, uGrain: { value: 0.04 },
        uTint: { value: new THREE.Vector3(1, 1, 1) }, uLift: { value: new THREE.Vector3(0, 0, 0) }, uSat: { value: 1 }, uContrast: { value: 1 }, uExposure: { value: 1 },
        uDamage: { value: 0 }, uAberr: { value: 0.006 }, uDesat: { value: 0 }, uWobble: { value: 0.6 },
      },
    });
    this.downMat = new THREE.ShaderMaterial({ vertexShader: POST_VERT, fragmentShader: BLOOM_DOWN, depthTest: false, depthWrite: false, uniforms: { tSrc: { value: null }, uTexel: { value: new THREE.Vector2() }, uThreshold: { value: 1 }, uKnee: { value: 0.5 }, uPrefilter: { value: 0 } } });
    this.upMat = new THREE.ShaderMaterial({ vertexShader: POST_VERT, fragmentShader: BLOOM_UP, depthTest: false, depthWrite: false, uniforms: { tSrc: { value: null }, tAdd: { value: null }, uTexel: { value: new THREE.Vector2() }, uScatter: { value: 0.75 } } });
    this.postScene = new THREE.Scene();
    const tri = new THREE.BufferGeometry();
    tri.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
    tri.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 2, 0, 0, 2], 2));
    this.quad = new THREE.Mesh(tri, this.postMat); this.quad.frustumCulled = false; this.postScene.add(this.quad);
    this.postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.resize();
    window.addEventListener('resize', () => this.resize());
  },

  makeEnvironment() {
    // tiny procedural "room" (soft ceiling panel + warm/cool bounce cards), prefiltered for PBR
    const s = new THREE.Scene();
    const box = new THREE.BoxGeometry();
    const room = new THREE.Mesh(box, new THREE.MeshBasicMaterial({ side: THREE.BackSide, color: 0x3a3430 }));
    room.scale.set(24, 10, 24); room.position.y = 4; s.add(room);
    const card = (x, y, z, sx, sy, sz, c) => { const m = new THREE.Mesh(box, new THREE.MeshBasicMaterial({ color: c })); m.position.set(x, y, z); m.scale.set(sx, sy, sz); s.add(m); };
    card(0, 8.9, 0, 9, 0.1, 9, new THREE.Color(1.6, 1.45, 1.25));
    card(-11.9, 3.5, 0, 0.1, 4, 10, new THREE.Color(1.1, 0.75, 0.45));
    card(11.9, 4, -2, 0.1, 3, 6, new THREE.Color(0.45, 0.55, 0.85));
    card(0, 3, 11.9, 8, 3, 0.1, new THREE.Color(0.7, 0.6, 0.5));
    card(0, -0.9, 0, 24, 0.1, 24, new THREE.Color(0.18, 0.13, 0.1));
    const pm = new THREE.PMREMGenerator(this.renderer);
    const rt = pm.fromScene(s, 0.035);
    pm.dispose();
    return rt.texture;
  },

  quality() { return SETTINGS.retro ? 0 : SETTINGS.quality; },

  pixelScale() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (/[?&]lowres/.test(QS)) return 4;
    if (SETTINGS.retro === 2) return 4;
    if (SETTINGS.retro === 1) return 2.4;
    const q = SETTINGS.quality;
    return q >= 2 ? 1 / Math.min(dpr, 1.5) : q === 1 ? 1 / Math.min(dpr, 1.0) : 1.35;
  },

  // The canvas (the post pass, the first person overlay) at the scene's resolution rather than the screen's: on a 2x
  // screen the post pass otherwise shades up to 4-7x the pixels the scene has (medium / low / retro), for an image the
  // browser would scale anyway. Full screen resolution while the hands or the held photo are up (they draw straight
  // into the canvas). Retro modes keep their hard pixels (image-rendering).
  canvasDpr() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (this.overlayVisible) return dpr;
    return clamp(1 / this.pixelScale(), 1, dpr);
  },
  applyDpr() {
    const k = this.canvasDpr();
    this._dpr = k; this._dprOv = this.overlayVisible;
    if (Math.abs(this.renderer.getPixelRatio() - k) > 1e-3) { this.renderer.setPixelRatio(k); this.renderer.setSize(this.w, this.h, false); this.dirty = true; }
    const c = this.renderer.domElement, ir = SETTINGS.retro ? 'pixelated' : '';
    if (c.style.imageRendering !== ir) c.style.imageRendering = ir;
  },
  resize() {
    const w = Math.max(1, window.innerWidth), h = Math.max(1, window.innerHeight);
    this.w = w; this.h = h;
    this.renderer.setPixelRatio(this.canvasDpr());
    this.renderer.setSize(w, h, false);
    this.applyDpr();
    this.allocTargets();
    this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
    this.overlayCam.aspect = w / h; this.overlayCam.updateProjectionMatrix();
    if (typeof Particles !== 'undefined' && Particles.updateScale) Particles.updateScale();
    if (typeof Player !== 'undefined' && Player.spot) Player.applyShadowQuality();
    if (typeof W !== 'undefined' && W.pool && W.pool.length) W.applyShadowQuality();
  },

  // adaptive resolution (see Main.drs): 1 = the full resolution of the quality setting
  dyn: 1,
  setDyn(k) {
    k = SETTINGS.retro ? 1 : clamp(k, 0.75, 1);
    if (Math.abs(k - this.dyn) < 0.001) return;
    this.dyn = k;
    this.allocTargets();
  },

  // scene render target + bloom chain for the current window, quality and adaptive scale
  allocTargets() {
    this.dirty = true;
    const w = this.w, h = this.h, s = this.pixelScale(), k = SETTINGS.retro ? 1 : this.dyn;
    let rw = Math.max(64, Math.round(w / s * k)), rh = Math.max(36, Math.round(h / s * k));
    const cap = Math.round((SETTINGS.quality >= 2 ? 2560 : SETTINGS.quality === 1 ? 1920 : 1280) * k);
    if (rw > cap) { rh = Math.round(rh * cap / rw); rw = cap; }
    this.rw = rw; this.rh = rh;
    if (this.rt) this.rt.dispose();
    const retro = SETTINGS.retro > 0;
    const samples = retro ? 0 : SETTINGS.quality >= 2 ? 4 : SETTINGS.quality === 1 ? 2 : 0;
    // (resolveDepthBuffer false: nothing reads the scene depth, the multisampled depth needn't be resolved every frame)
    this.rt = new THREE.WebGLRenderTarget(rw, rh, {
      type: THREE.HalfFloatType, depthBuffer: true, samples, resolveDepthBuffer: false,
      minFilter: retro ? THREE.NearestFilter : THREE.LinearFilter, magFilter: retro ? THREE.NearestFilter : THREE.LinearFilter,
    });
    // bloom mip chain
    for (const t of this.mips.concat(this.ups)) t.dispose();
    this.mips = []; this.ups = [];
    const levels = SETTINGS.quality === 0 ? 4 : 6;
    let bw = Math.max(8, rw >> 1), bh = Math.max(8, rh >> 1);
    for (let i = 0; i < levels; i++) {
      const o = { type: THREE.HalfFloatType, depthBuffer: false, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter };
      this.mips.push(new THREE.WebGLRenderTarget(bw, bh, o));
      if (i < levels - 1) this.ups.push(new THREE.WebGLRenderTarget(bw, bh, o));
      bw = Math.max(4, bw >> 1); bh = Math.max(4, bh >> 1);
    }
    const u = this.postMat.uniforms;
    u.tScene.value = this.rt.texture;
    u.tBloom.value = this.ups.length ? this.ups[0].texture : this.mips[0].texture;
    u.uRes.value.set(rw, rh);
    u.uDither.value = retro ? 1 : 0;
    u.uLevels.value = SETTINGS.retro === 2 ? 24 : 40;
    u.uWobble.value = retro ? 0.7 : 0;
    const pd = this.postMat.defines || (this.postMat.defines = {});
    if (!!pd.RETRO !== retro) { if (retro) pd.RETRO = 1; else delete pd.RETRO; this.postMat.needsUpdate = true; }
  },

  pass(mat, target) {
    this.quad.material = mat;
    this.renderer.setRenderTarget(target);
    this.renderer.render(this.postScene, this.postCam);
  },

  bloom() {
    const d = this.downMat.uniforms, up = this.upMat.uniforms;
    let src = this.rt.texture, sw = this.rw, sh = this.rh;
    d.uThreshold.value = this.bloomThreshold; d.uKnee.value = 0.6;
    for (let i = 0; i < this.mips.length; i++) {
      d.tSrc.value = src; d.uTexel.value.set(1 / sw, 1 / sh); d.uPrefilter.value = i === 0 ? 1 : 0;
      this.pass(this.downMat, this.mips[i]);
      src = this.mips[i].texture; sw = this.mips[i].width; sh = this.mips[i].height;
    }
    // upsample: ups[i] = mips[i] + tent(ups[i+1] or mips[last])
    for (let i = this.ups.length - 1; i >= 0; i--) {
      const small = i === this.ups.length - 1 ? this.mips[i + 1] : this.ups[i + 1];
      up.tSrc.value = small.texture; up.tAdd.value = this.mips[i].texture; up.uTexel.value.set(1 / small.width, 1 / small.height);
      this.pass(this.upMat, this.ups[i]);
    }
  },

  render(dt) {
    const r = this.renderer, u = this.postMat.uniforms;
    u.uTime.value += dt;
    if (this._dprOv !== this.overlayVisible) this.applyDpr();
    // grading follows target smoothly
    const g = this.grade, tg = this.gradeTarget;
    if (tg) {
      const k = 1 - Math.exp(-2.2 * dt);
      g.tint.lerp(tg.tint, k); g.lift.lerp(tg.lift, k);
      g.sat = lerp(g.sat, tg.sat, k); g.contrast = lerp(g.contrast, tg.contrast, k);
      g.exposure = lerp(g.exposure, tg.exposure, k); g.vignette = lerp(g.vignette, tg.vignette, k);
    }
    u.uTint.value.copy(g.tint); u.uLift.value.copy(g.lift);
    u.uSat.value = g.sat; u.uContrast.value = g.contrast; u.uExposure.value = g.exposure; u.uVignette.value = g.vignette;
    u.uGrain.value = SETTINGS.retro ? 0.045 : 0.022;
    u.uBloom.value = this.bloomStrength;
    // (which shadow maps get redrawn is decided in W.updateShadows)
    r.setRenderTarget(this.rt);
    r.setClearColor(this.scene.background, 1);
    r.clear(true, true, true);
    r.render(this.scene, this.camera);
    this.bloom();
    this.quad.material = this.postMat;
    r.setRenderTarget(null);
    r.clear(true, true, true);
    r.render(this.postScene, this.postCam);
    if (this.overlayVisible) {
      const k = this.overlayK;
      this.ovHemi.intensity = 1.4 * k; this.ovDir.intensity = 2.4 * k; this.overlayScene.environmentIntensity = 0.6 * k;
      this.overlayCam.fov = this.camera.fov; this.overlayCam.updateProjectionMatrix();
      r.clearDepth();
      r.render(this.overlayScene, this.overlayCam);
    }
  },

  setGrade(o) {
    const cur = this.gradeTarget || { tint: new THREE.Vector3(1, 1, 1), lift: new THREE.Vector3(), sat: 1, contrast: 1, exposure: 1, vignette: 0.5 };
    this.gradeTarget = {
      tint: o.tint ? new THREE.Vector3(...o.tint) : cur.tint.clone(),
      lift: o.lift ? new THREE.Vector3(...o.lift) : cur.lift.clone(),
      sat: o.sat ?? cur.sat, contrast: o.contrast ?? cur.contrast, exposure: o.exposure ?? cur.exposure, vignette: o.vignette ?? cur.vignette,
    };
  },
};

// ---------------------------------------------------------------------
//  Camera rig: isometric follow, first person, cinematic + transitions
// ---------------------------------------------------------------------
const Cam = {
  mode: 'iso',
  focus: new THREE.Vector3(7, 0, 18),
  isoAz: 45 * DEG, isoEl: 52 * DEG, isoDist: 29, isoFov: 22,
  fpFov: 65,
  pos: new THREE.Vector3(), look: new THREE.Vector3(), fov: 22,
  rightVec: new THREE.Vector3(1, 0, 0), fwdVec: new THREE.Vector3(0, 0, -1),
  shakeAmt: 0, shakeT: 0,
  trans: null,
  isoWeight: 1,            // 1 = iso, 0 = first person (used for wall fading / fog)
  fp: { pos: new THREE.Vector3(), yaw: 0, pitch: 0 },
  cine: { pos: new THREE.Vector3(), look: new THREE.Vector3(), fov: 50 },
  isoHold: null,           // a scene that flies the cine camera but keeps the iso look (cut walls, no ceilings): Arcade
  lookAhead: new THREE.Vector3(),
  bounds: null,

  init() {
    const az = this.isoAz;
    this.rightVec.set(Math.cos(az), 0, -Math.sin(az));
    this.fwdVec.set(-Math.sin(az), 0, -Math.cos(az));
  },

  isoPose(out) {
    const f = _v1.copy(this.focus).add(this.lookAhead);
    const D = this.isoDist, el = this.isoEl, az = this.isoAz;
    out.pos.set(f.x + Math.sin(az) * Math.cos(el) * D, f.y + Math.sin(el) * D, f.z + Math.cos(az) * Math.cos(el) * D);
    out.look.copy(f); out.fov = this.isoFov;
    return out;
  },
  fpPose(out) {
    const p = this.fp;
    out.pos.copy(p.pos);
    const cp = Math.cos(p.pitch);
    out.look.set(p.pos.x - Math.sin(p.yaw) * cp, p.pos.y + Math.sin(p.pitch), p.pos.z - Math.cos(p.yaw) * cp);
    out.fov = this.fpFov;
    return out;
  },
  cinePose(out) { out.pos.copy(this.cine.pos); out.look.copy(this.cine.look); out.fov = this.cine.fov; return out; },
  poseFor(mode, out) { return mode === 'iso' ? this.isoPose(out) : mode === 'fp' ? this.fpPose(out) : this.cinePose(out); },

  // smooth switch to another mode; onDone fires at the end
  to(mode, dur = 1, onDone = null, ease = easeInOut) {
    const from = { pos: this.pos.clone(), look: this.look.clone(), fov: this.fov, w: this.isoWeight };
    this.trans = { from, mode, t: 0, dur: Math.max(0.001, dur), onDone, ease };
    this.mode = mode;
  },
  snap(mode) {
    this.mode = mode; this.trans = null;
    const p = this.poseFor(mode, { pos: new THREE.Vector3(), look: new THREE.Vector3(), fov: 0 });
    this.pos.copy(p.pos); this.look.copy(p.look); this.fov = p.fov;
    this.isoWeight = mode === 'iso' ? 1 : 0;
  },
  shake(a) { this.shakeAmt = Math.min(1.5, this.shakeAmt + a * SETTINGS.shake); if (a >= 0.2) Pad.rumble(Math.min(1, a * 0.7), Math.min(1, a), 80 + a * 140); },

  update(dt) {
    const target = this.poseFor(this.mode, this._tmp || (this._tmp = { pos: new THREE.Vector3(), look: new THREE.Vector3(), fov: 0 }));
    const wTarget = this.mode === 'iso' ? 1 : 0;
    if (this.trans) {
      const tr = this.trans;
      tr.t += dt;
      const k = tr.ease(clamp(tr.t / tr.dur, 0, 1));
      this.pos.lerpVectors(tr.from.pos, target.pos, k);
      this.look.lerpVectors(tr.from.look, target.look, k);
      // fov eased slightly differently for the dolly feel
      this.fov = lerp(tr.from.fov, target.fov, k);
      this.isoWeight = lerp(tr.from.w, wTarget, k);
      if (tr.t >= tr.dur) { this.trans = null; if (tr.onDone) tr.onDone(); }
    } else {
      if (this.mode === 'iso') {
        this.pos.copy(target.pos); this.look.copy(target.look);
      } else { this.pos.copy(target.pos); this.look.copy(target.look); }
      this.fov = target.fov; this.isoWeight = wTarget;
    }
    if (this.isoHold != null) this.isoWeight = this.isoHold;
    const cam = Render.camera;
    cam.position.copy(this.pos);
    if (this.shakeAmt > 0.001) {
      this.shakeT += dt * 60;
      const s = this.shakeAmt * this.shakeAmt * (this.mode === 'iso' ? 0.35 : 0.06);
      cam.position.x += (Math.sin(this.shakeT * 1.3) + Math.sin(this.shakeT * 2.9)) * s;
      cam.position.y += (Math.sin(this.shakeT * 1.7 + 1) + Math.sin(this.shakeT * 3.3)) * s * 0.6;
      cam.position.z += (Math.sin(this.shakeT * 1.1 + 2) + Math.sin(this.shakeT * 2.3)) * s;
      this.shakeAmt = Math.max(0, this.shakeAmt - dt * 2.6);
    }
    cam.lookAt(this.look);
    if (Math.abs(cam.fov - this.fov) > 0.01) { cam.fov = this.fov; cam.updateProjectionMatrix(); }
    // fog follows mode
    const fog = Render.scene.fog;
    const iw = this.isoWeight;
    const dread = G.dread;
    const isoNear = this.isoDist - 4, isoFar = this.isoDist + 30 - dread * 6;
    const fpNear = 2.5 - dread * 1.2, fpFar = 26 - dread * 8;
    fog.near = lerp(fpNear, isoNear, iw); fog.far = lerp(fpFar, isoFar, iw);
    if (G.state === 'title' || G.state === 'boot') { fog.near = 14; fog.far = 75; }
    if (G.fog) { fog.near = G.fog[0]; fog.far = G.fog[1]; }
  },
};

// ---------------------------------------------------------------------
//  Materials and geometry helpers
// ---------------------------------------------------------------------
// cache key of a material's options. (Not JSON.stringify: it calls Texture.toJSON on any texture in them, which
// encodes the canvas as a PNG data URL, on every call, cache hit or not: every nail, pellet and pickup used to)
function optKey(o) {
  let k = '';
  for (const n in o) { const v = o[n]; k += n + ':' + (v && v.isTexture ? '#' + v.uuid : v && typeof v === 'object' ? optKey(v) : v) + ';'; }
  return k;
}
const Mat = {
  cache: {},
  lam(color, o = {}) {
    const key = 'l' + color + optKey(o);
    if (!o.unique && this.cache[key]) return this.cache[key];
    const m = new THREE.MeshStandardMaterial(Object.assign({ color, roughness: o.rough ?? 0.8, metalness: o.metal ?? 0 }, o.p || {}));
    if (o.emissive) { m.emissive = new THREE.Color(o.emissive); m.emissiveIntensity = o.ei || 1; }
    if (o.side) m.side = o.side;
    if (o.flat) m.flatShading = true;
    if (!o.unique) this.cache[key] = m;
    return m;
  },
  tex(map, o = {}) {
    // (textures in the options are keyed by uuid: JSON.stringify on a Texture would serialize its image)
    const key = 't' + map.uuid + optKey(o);
    if (!o.unique && this.cache[key]) return this.cache[key];
    const m = new THREE.MeshStandardMaterial({ map, color: o.color != null ? o.color : 0xffffff, roughness: o.rough ?? 0.8, metalness: o.metal ?? 0 });
    if (o.normalMap) { m.normalMap = o.normalMap; m.normalScale.setScalar(o.normalScale ?? 1); }
    if (o.roughnessMap) m.roughnessMap = o.roughnessMap;
    if (o.transparent) { m.transparent = true; m.depthWrite = false; }
    if (o.alphaTest) m.alphaTest = o.alphaTest;
    if (o.side) m.side = o.side;
    if (o.emissive) { m.emissive = new THREE.Color(o.emissive); m.emissiveMap = o.emissiveMap || map; m.emissiveIntensity = o.ei || 1; }
    if (!o.unique) this.cache[key] = m;
    return m;
  },
  basic(color, o = {}) {
    const key = 'b' + color + optKey(o);
    if (!o.unique && this.cache[key]) return this.cache[key];
    const m = new THREE.MeshBasicMaterial({ color, map: o.map || null, transparent: !!o.transparent, opacity: o.opacity ?? 1, side: o.side || THREE.FrontSide, alphaTest: o.alphaTest || 0, fog: o.fog !== false });
    if (o.additive) { m.blending = THREE.AdditiveBlending; m.transparent = true; m.depthWrite = false; }
    if (!o.unique) this.cache[key] = m;
    return m;
  },
  glow(color, opacity = 1, unique = false) { return this.basic(color, { map: glowTexture(), additive: true, opacity, fog: false, unique }); },
};

const Geo = {
  cache: {},
  get(key, fn) { return this.cache[key] || (this.cache[key] = fn()); },
  box(w, h, d) { return this.get(`b${w},${h},${d}`, () => new THREE.BoxGeometry(w, h, d)); },
  cyl(rt, rb, h, s = 12) { return this.get(`c${rt},${rb},${h},${s}`, () => new THREE.CylinderGeometry(rt, rb, h, s)); },
  sph(r, ws = 14, hs = 10) { return this.get(`s${r},${ws},${hs}`, () => new THREE.SphereGeometry(r, ws, hs)); },
  cone(r, h, s = 10) { return this.get(`k${r},${h},${s}`, () => new THREE.ConeGeometry(r, h, s)); },
  plane(w, h) { return this.get(`p${w},${h}`, () => new THREE.PlaneGeometry(w, h)); },
  torus(r, t, rs = 8, ts = 16, arc = TAU) { return this.get(`t${r},${t},${rs},${ts},${arc}`, () => new THREE.TorusGeometry(r, t, rs, ts, arc)); },
  circle(r, s = 24) { return this.get(`ci${r},${s}`, () => new THREE.CircleGeometry(r, s)); },
  capsule(r, l) { return this.get(`ca${r},${l}`, () => new THREE.CapsuleGeometry(r, l, 4, 10)); },
};

// world-space UVs for boxes placed directly in world coordinates
function worldBox(x0, y0, z0, x1, y1, z1, su = 1, sv = 1, svY = null) {
  const w = x1 - x0, h = y1 - y0, d = z1 - z0;
  const g = new THREE.BoxGeometry(w, h, d);
  g.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
  const pos = g.attributes.position, nor = g.attributes.normal, uv = g.attributes.uv;
  const vy = svY == null ? sv : svY;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const nx = Math.abs(nor.getX(i)), ny = Math.abs(nor.getY(i));
    if (nx > 0.5) uv.setXY(i, z * su * (nor.getX(i) > 0 ? -1 : 1), y * vy);
    else if (ny > 0.5) uv.setXY(i, x * su, z * su);
    else uv.setXY(i, x * su * (nor.getZ(i) > 0 ? 1 : -1), y * vy);
  }
  uv.needsUpdate = true;
  return g;
}

// flat rug quad over [x0,x1] x [z0,z1] at height y: one texture over the whole rug (u along x)
function flatRug(x0, z0, x1, z1, y) {
  const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0);
  g.rotateX(-Math.PI / 2); g.translate((x0 + x1) / 2, y, (z0 + z1) / 2);
  return g;
}
// uvs in meters (times su) for an untransformed BoxGeometry; vSign flips v on the +-y faces
function boxMeterUV(g, su = 1, vSign = 1) {
  const pos = g.attributes.position, nor = g.attributes.normal, uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    if (Math.abs(nor.getX(i)) > 0.5) uv.setXY(i, z * su, y * su);
    else if (Math.abs(nor.getY(i)) > 0.5) uv.setXY(i, x * su, z * su * vSign);
    else uv.setXY(i, x * su, y * su);
  }
  uv.needsUpdate = true;
  return g;
}

// merge wall boxes (worldBox geometries, BoxGeometry face order +x -x +y -y +z -z) into one geometry with
// 3 groups: 0 = the posFace sides, 1 = the negFace sides, 2 = ends + caps (vertex colors: ends lighter)
const WALL_END_COL = new THREE.Color(0x3a3029), WALL_CAP_COL = new THREE.Color(0x17110f);
function mergeWallBoxes(geos, posFace, negFace) {
  const pos = [], nor = [], uv = [], col = [], idx = [[], [], []];
  for (const g of geos) {
    const base = pos.length / 3, P = g.attributes.position, N = g.attributes.normal, U = g.attributes.uv, I = g.index.array;
    for (let i = 0; i < P.count; i++) {
      pos.push(P.getX(i), P.getY(i), P.getZ(i)); nor.push(N.getX(i), N.getY(i), N.getZ(i)); uv.push(U.getX(i), U.getY(i));
      const face = Math.floor(i / 4), c = face === 2 || face === 3 ? WALL_CAP_COL : WALL_END_COL;
      col.push(c.r, c.g, c.b);
    }
    for (let f = 0; f < 6; f++) {
      const bucket = f === posFace ? 0 : f === negFace ? 1 : 2;
      for (let k = f * 6; k < f * 6 + 6; k++) idx[bucket].push(I[k] + base);
    }
    g.dispose();
  }
  const mg = new THREE.BufferGeometry();
  mg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  mg.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  mg.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  mg.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  mg.setIndex(idx[0].concat(idx[1], idx[2]));
  mg.addGroup(0, idx[0].length, 0); mg.addGroup(idx[0].length, idx[1].length, 1); mg.addGroup(idx[0].length + idx[1].length, idx[2].length, 2);
  mg.computeBoundingSphere();
  return mg;
}

// mesh helper
function mk(geo, mat, x = 0, y = 0, z = 0, parent = null, o = {}) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  if (o.rx) m.rotation.x = o.rx;
  if (o.ry) m.rotation.y = o.ry;
  if (o.rz) m.rotation.z = o.rz;
  if (o.s != null) m.scale.setScalar(o.s);
  if (o.sx != null) m.scale.x = o.sx;
  if (o.sy != null) m.scale.y = o.sy;
  if (o.sz != null) m.scale.z = o.sz;
  m.castShadow = o.cast !== false;
  m.receiveShadow = o.receive !== false;
  if (parent) parent.add(m);
  return m;
}
function grp(parent, x = 0, y = 0, z = 0, ry = 0) {
  const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; if (parent) parent.add(g); return g;
}
function setLayer(obj, layer) { obj.traverse((o) => { o.layers.set(layer); }); }
function setShadow(obj, cast, receive) { obj.traverse((o) => { if (o.isMesh) { o.castShadow = cast; o.receiveShadow = receive; } }); }

// =====================================================================
//  WORLD: the old house (4 rooms), hidden basement, porch + yard
// =====================================================================
const WALL_H = 3.0, WALL_T = 0.3, STUB_H = 0.55, DOOR_H = 2.35;
// the gable roof (ridge along x at z = 12) and the attic under it: its floor, and the stairwell the hall stairs come
// up through (x0, x1, z0, z1)
const ROOF_RIDGE = 7.4, ROOF_EAVE = 0.7, ATTIC_Y = 3.14, ATTIC_HOLE = [0.15, 5.1, 12.15, 13.65];
// dead trees to the right of the title shot: x, z, turn, size
const TITLE_TREES = [[5, 31.5, 0.9, 1.0], [33, 31, 2.4, 1.25], [45, 26, 4.2, 1.45], [24, 36.5, 5.6, 1.1],
  [6, -11, 1.3, 1.15], [23, -13, 3.3, 1.0], [37, -5, 5.0, 1.3], [-8, -7, 2.0, 1.05]];
// the rest of Maple Street: x, z, turn (the front faces local +z), width, depth, height, siding
const MAPLE_ST = [[-44, -14, 1.571, 12, 9, 3.4, 0], [-46, 8, 1.571, 10, 8, 5.6, 1], [-44, 30, 1.571, 13, 9, 3.4, 2], [-46, 52, 1.571, 11, 8, 5.4, 3],
  [-2, -38, 3.142, 12, 9, 3.6, 4], [20, -40, 3.142, 11, 8, 5.6, 5], [42, -37, 3.142, 13, 9, 3.4, 0],
  [66, -4, 1.571, 10, 8, 5.4, 2], [64, 20, 1.571, 12, 9, 3.6, 3], [66, 44, 1.571, 11, 8, 3.4, 1],
  [2, 62, 0, 12, 9, 3.6, 5], [28, 64, 0, 11, 8, 5.6, 4]];
// the moon hangs behind the house, low over its left end in the title shot (45 degrees north of east, 30 up). Its
// light comes from there: the house stands dark against the sky and throws a long shadow over the yard toward you
const MOON_TARGET = [12, 0, 17], MOON_DIR = [0.6124, 0.5, -0.6124];
const moonAt = (k) => new THREE.Vector3(MOON_TARGET[0] + MOON_DIR[0] * k, MOON_TARGET[1] + MOON_DIR[1] * k, MOON_TARGET[2] + MOON_DIR[2] * k);
// lamp falloff: a steeper decay keeps pools of light around the lamps and lets the corners fall into the dark
const LIGHT_MUL = 2.1, LIGHT_DECAY = 1.7;

const ROOMS = {
  hall: { id: 'hall', name: 'Hallway', x0: 0, x1: 14, z0: 12, z1: 24, floor: 'wood', wall: 'hall', surface: 'wood' },
  kitchen: { id: 'kitchen', name: 'Kitchen', x0: 0, x1: 14, z0: 0, z1: 12, floor: 'checker', wall: 'kitchen', surface: 'tile' },
  living: { id: 'living', name: 'Living Room', x0: 14, x1: 30, z0: 0, z1: 12, floor: 'carpet', wall: 'living', surface: 'carpet' },
  bedroom: { id: 'bedroom', name: 'Bedroom', x0: 14, x1: 30, z0: 12, z1: 24, floor: 'woodLight', wall: 'bedroom', surface: 'wood' },
  basement: { id: 'basement', name: 'Basement', x0: 60, x1: 80, z0: 2, z1: 20, floor: 'concrete', wall: 'basement', surface: 'stone' },
  porch: { id: 'porch', name: 'Porch', x0: -5.4, x1: 0, z0: 13.4, z1: 22.6, floor: 'porch', surface: 'wood', outside: true },
  // up the hall stairs, under the roof: not on the floor plan (roomAt skips it), only reached at the very end
  attic: { id: 'attic', name: 'Attic', x0: 0, x1: 30, z0: 2.5, z1: 21.5, floor: 'wood', surface: 'wood', upper: true },
};
const NEIGHBORS = { hall: ['kitchen', 'bedroom', 'porch'], kitchen: ['hall', 'living'], living: ['kitchen', 'bedroom'], bedroom: ['hall', 'living'], basement: [], porch: ['hall'], attic: [] };

const W = {
  root: null, statics: {}, dyn: null, ext: null, roof: null, basement: null,
  walls: [], colliders: [], doors: {}, lights: [], pool: [], interactables: [], breakables: [], ceilings: [],
  anim: [], props: {}, windows: [],
  lightsOut: {}, // room -> 0..1 (1 = dark)
  lightning: 0,
  // ambient balance (hemisphere fill + image based light) for the cozy evening / haunted house / basement / title
  // (kept low: the lamps make pools of light and the rest of the house sinks into the dark)
  tune: { hemiCozy: 0.62, hemiHaunt0: 0.55, hemiHaunt1: 0.24, hemiBase: 0.34, hemiTitle: 0.5, envCozy: 0.15, envHaunt0: 0.12, envHaunt1: 0.06, envBase: 0.08, envTitle: 0.09, moonPlay: 1.1, moonTitle: 1.35 },

  roomAt(x, z) {
    for (const k in ROOMS) { const r = ROOMS[k]; if (!r.upper && x >= r.x0 && x <= r.x1 && z >= r.z0 && z <= r.z1) return k; }
    return null;
  },

  addCol(x0, z0, x1, z1, o = {}) {
    const c = { x0: Math.min(x0, x1), x1: Math.max(x0, x1), z0: Math.min(z0, z1), z1: Math.max(z0, z1), h: o.h ?? 1, shots: o.shots ?? ((o.h ?? 1) > 1.25), active: o.active ?? true, id: o.id || null, low: !!o.low };
    c.room = o.room || this.roomAt((c.x0 + c.x1) / 2, (c.z0 + c.z1) / 2);
    this.colliders.push(c); return c;
  },
  // rectangle collider for a piece centered at cx,cz with size w (x) d (z) rotated by ry (multiples of 90deg)
  colRect(cx, cz, w, d, ry = 0, o = {}) {
    const swap = Math.abs(Math.sin(ry)) > 0.5;
    const hw = (swap ? d : w) / 2, hd = (swap ? w : d) / 2;
    return this.addCol(cx - hw, cz - hd, cx + hw, cz + hd, o);
  },

  // push a circle out of colliders. returns true if touched anything
  collide(pos, r, opts = null) {
    let hit = false;
    for (let it = 0; it < 2; it++) {
      for (const c of this.colliders) {
        if (!c.active) continue;
        if (opts && opts.ignoreLow && c.low) continue;
        if (opts && opts.minH != null && (c.h ?? 1) < opts.minH) continue; // (things that fly clear it)
        if (pos.x + r < c.x0 || pos.x - r > c.x1 || pos.z + r < c.z0 || pos.z - r > c.z1) continue;
        const cx = clamp(pos.x, c.x0, c.x1), cz = clamp(pos.z, c.z0, c.z1);
        const dx = pos.x - cx, dz = pos.z - cz, d2 = dx * dx + dz * dz;
        if (d2 >= r * r) continue;
        hit = true;
        if (d2 > 1e-9) { const d = Math.sqrt(d2), p = r - d; pos.x += dx / d * p; pos.z += dz / d * p; }
        else {
          const l = pos.x - c.x0, rr = c.x1 - pos.x, t = pos.z - c.z0, b = c.z1 - pos.z;
          const m = Math.min(l, rr, t, b);
          if (m === l) pos.x = c.x0 - r; else if (m === rr) pos.x = c.x1 + r; else if (m === t) pos.z = c.z0 - r; else pos.z = c.z1 + r;
        }
      }
      if (!hit) break; // (the second pass only settles pushes into a neighbour)
    }
    return hit;
  },

  // segment (x0,z0)->(x1,z1) vs shot-blocking colliders; returns t in [0,1] of first hit or 2
  rayHit(x0, z0, x1, z1, shotsOnly = true) {
    let best = 2; let bc = null;
    const dx = x1 - x0, dz = z1 - z0;
    const ax = Math.min(x0, x1), bx = Math.max(x0, x1), az = Math.min(z0, z1), bz = Math.max(z0, z1);
    for (const c of this.colliders) {
      if (!c.active || (shotsOnly && !c.shots)) continue;
      if (bx < c.x0 || ax > c.x1 || bz < c.z0 || az > c.z1) continue; // (the segment's box misses it)
      let tmin = 0, tmax = 1;
      if (Math.abs(dx) < 1e-9) { if (x0 < c.x0 || x0 > c.x1) continue; }
      else { let t1 = (c.x0 - x0) / dx, t2 = (c.x1 - x0) / dx; if (t1 > t2) { const tt = t1; t1 = t2; t2 = tt; } tmin = Math.max(tmin, t1); tmax = Math.min(tmax, t2); if (tmin > tmax) continue; }
      if (Math.abs(dz) < 1e-9) { if (z0 < c.z0 || z0 > c.z1) continue; }
      else { let t1 = (c.z0 - z0) / dz, t2 = (c.z1 - z0) / dz; if (t1 > t2) { const tt = t1; t1 = t2; t2 = tt; } tmin = Math.max(tmin, t1); tmax = Math.min(tmax, t2); if (tmin > tmax) continue; }
      if (tmin < best) { best = tmin; bc = c; }
    }
    this._lastRayCol = bc;
    return best;
  },
  los(x0, z0, x1, z1) { return this.rayHit(x0, z0, x1, z1, true) > 1; },

  addLight(room, x, y, z, color, intensity, distance = 11, o = {}) {
    const L = { room, pos: new THREE.Vector3(x, y, z), color: new THREE.Color(color), base: intensity, distance, flicker: o.flicker || 0, kind: o.kind || 'lamp', on: o.on !== false, mats: o.mats || [], cur: 0, haunt: o.haunt ?? 1, seed: Math.random() * 100 };
    this.lights.push(L); return L;
  },

  // how many room lamps throw shadows (each one renders a cube shadow map): 2 high, 1 medium / retro, 0 low
  shadowSlots() {
    if (/[?&]lowres/.test(QS)) return 1;
    const q = SETTINGS.quality;
    return q >= 2 ? (SETTINGS.retro ? 1 : 2) : q === 1 ? 1 : 0;
  },
  applyShadowQuality() {
    if (!this.pool.length) return;
    const n = this.shadowSlots(), q = Render.quality();
    const size = q >= 2 ? 512 : 384;
    this.pool.forEach((p, i) => {
      const l = p.light, cast = i < n;
      l.castShadow = cast;
      if (cast && l.shadow.mapSize.x !== size) { l.shadow.mapSize.set(size, size); if (l.shadow.map) { l.shadow.map.dispose(); l.shadow.map = null; } }
      if (cast) { l.shadow.needsUpdate = true; l.shadow.parked = false; p.sig = null; }
    });
    const ms = q >= 2 ? 2048 : 1024, sh = this.moon.shadow;
    if (sh.mapSize.x !== ms) { sh.mapSize.set(ms, ms); if (sh.map) { sh.map.dispose(); sh.map = null; } }
    sh.needsUpdate = true;
  },
  // glowing shades and bulbs, glass and glow sprites let the light through: they must not throw shadows
  lightPassMeshes() {
    const re = /^(Glow|WindowGlass|DoorGlass|FrontDoorGlass|MirrorGlass|GlassClear|JarGlass|OvenGlass|MWWindow)/;
    const pass = (m) => re.test(m.name || '') || (m.isMeshBasicMaterial && (m.transparent || m.blending !== THREE.NormalBlending));
    // cut-out decals (labels, soot, stencils, cobwebs) stay out of the shadow passes; foliage cards keep theirs
    const decal = (m) => (m.alphaTest > 0 || m.transparent) && !/Leaf|Evergreen|Branch|Foliage|Twig|Vine/.test(m.name || '');
    for (const root of [this.root, this.ext, this.roof]) root.traverse((o) => {
      if (o.isMesh && o.material && !Array.isArray(o.material) && (pass(o.material) || decal(o.material))) o.castShadow = false;
    });
    // door hardware (handles, keyholes) is too small to matter in a shadow pass
    for (const k in this.doors) {
      const d = this.doors[k];
      for (const pv of [d.pivot].concat((d.leaves || []).map((l) => l.pivot))) if (pv) pv.traverse((o) => { if (o.isMesh && !Array.isArray(o.material) && /^(Keyhole|Brass)/.test(o.material.name || '')) o.castShadow = false; });
    }
  },

  addInteract(o) { const it = Object.assign({ r: 1.4, enabled: true }, o); this.interactables.push(it); return it; },

  // ------------------------------------------------------------------
  //  GLB prop kits + PBR surfaces. Each helper returns null when the asset is
  //  unavailable: the caller then builds its procedural fallback.
  // ------------------------------------------------------------------
  hasKit(kit, node) { const A = Assets.data[kit]; return !!(A && A.nodeIndex[THREE.PropertyBinding.sanitizeNodeName(node)] !== undefined); },
  // instance of one kit node (origin as authored), placed at x,y,z with yaw ry
  kit(kit, node, parent, x = 0, y = 0, z = 0, ry = 0, o = {}) {
    if (!this.hasKit(kit, node)) return null;
    const g = Assets.inst(kit, { nodes: [node], name: node, cast: o.cast !== false, receive: o.receive !== false });
    g.position.set(x, y, z); g.rotation.set(o.rx || 0, ry, o.rz || 0);
    if (o.s != null) { if (typeof o.s === 'number') g.scale.setScalar(o.s); else g.scale.set(o.s[0], o.s[1], o.s[2]); }
    if (parent) parent.add(g);
    return g;
  },
  // wall-mounted kit node (kit origin = wall surface, extends toward +Z)
  wallKit(kit, node, axis, c, s, y, inward, o = {}) {
    const g = this.kit(kit, node, null, 0, 0, 0, 0, Object.assign({ cast: false }, o));
    return g ? this.wallDecor(axis, c, s, y, inward, g, o.parent, true) : null;
  },
  // clone the Glow* materials of one prop instance so its light can dim / flicker it on its own.
  // updateLights scales userData.baseEI (the authored emissive strength).
  glowMats(obj, re = /^Glow/) {
    const out = [], map = new Map();
    obj.traverse((o) => {
      if (!o.isMesh || !o.material || Array.isArray(o.material) || !re.test(o.material.name)) return;
      const m = o.material;
      if (!map.has(m)) { const c = m.clone(); c.userData.baseEI = m.emissiveIntensity; map.set(m, c); out.push(c); }
      o.material = map.get(m);
    });
    return out;
  },
  keepObj(o) { if (o) o.traverse((c) => { c.userData.keep = true; }); return o; },
  // PBR surface material from a texture set (albedo + normal + roughness map, roughness 1)
  _surf: {},
  surf(set, o = {}) {
    const T = Assets.tex[set]; if (!T) return null;
    const key = set + JSON.stringify(o);
    if (this._surf[key]) return this._surf[key];
    const m = new THREE.MeshStandardMaterial({ map: T.map, color: o.color ?? 0xffffff, roughness: o.rough ?? 1, metalness: 0 });
    if (T.normal) { m.normalMap = T.normal; m.normalScale.setScalar(o.ns ?? 1); }
    if (T.rough) m.roughnessMap = T.rough;
    if (o.side) m.side = o.side;
    if (o.alphaTest) m.alphaTest = o.alphaTest;
    if (o.transparent) { m.transparent = true; m.depthWrite = false; }
    if (o.polyOffset) { m.polygonOffset = true; m.polygonOffsetFactor = -1; m.polygonOffsetUnits = -4; }
    m.name = 'surf_' + set;
    this._surf[key] = m;
    return m;
  },
  // wall unit meshes for a fade value (one combined mesh while opaque)
  wallVis(u, f) {
    const w = u.wallMeshes; if (!w) return;
    w.full.visible = f >= 0.995; w.upper.visible = f < 0.995 && f > 0.02; w.stub.visible = f < 0.995;
  },
  // raise the low end of a set's roughness map (lo + (1 - lo) * r): punctual lights have no area, so mirror-like
  // floors would show tiny blinding highlights
  roughRemap(set, lo) {
    const T = Assets.tex[set], t = T && T.rough;
    if (!t || !t.image || t.userData.remapped || typeof document === 'undefined') return;
    try {
      const img = t.image, w = img.width, h = img.height;
      const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
      const g = cv.getContext('2d', { willReadFrequently: true }); g.drawImage(img, 0, 0);
      const id = g.getImageData(0, 0, w, h), d = id.data;
      for (let i = 0; i < d.length; i += 4) { const v = lo * 255 + (1 - lo) * d[i + 1]; d[i] = d[i + 1] = d[i + 2] = v; }
      g.putImageData(id, 0, 0);
      t.image = cv; t.needsUpdate = true; t.userData.remapped = true;
    } catch (e) { /* keep the original map */ }
  },
  // cutaway fade of a wall unit's materials (glass keeps its authored opacity)
  fadeMats(mats, f) {
    const transparent = f < 0.995;
    for (const m of mats) {
      if (m.userData.baseOpacity != null) { m.opacity = m.userData.baseOpacity * f; continue; }
      m.opacity = f; if (m.transparent !== transparent) { m.transparent = transparent; m.needsUpdate = true; } m.depthWrite = !transparent;
    }
  },
  // kit material tweaks: mirrors only reflect the soft environment map, give them more of it
  kitMaterialTweaks() {
    for (const k of ['props_hall', 'props_bedroom']) {
      const A = Assets.data[k]; if (!A) continue;
      for (const m of A.materials.concat([...A.vcMats.values()])) if (/^Mirror/.test(m.name)) m.envMapIntensity = 3;
    }
    // cut-out foliage cards get soft edges from the multisampling (instead of shimmering while the camera drifts)
    const E = Assets.data.props_exterior;
    if (E) for (const m of E.materials.concat([...E.vcMats.values()])) if (m.alphaTest > 0 && /Evergreen|Leaf|Foliage|Branch|Twig|Vine/.test(m.name)) m.alphaToCoverage = true;
  },
  // per wall unit copies of a door kit's materials (so each wall fades on its own)
  unitMats(unit, obj) {
    const map = unit._kitMats || (unit._kitMats = new Map());
    obj.traverse((o) => {
      if (!o.isMesh || Array.isArray(o.material)) return;
      const m = o.material;
      if (!map.has(m)) {
        const c = m.clone();
        if (c.transparent) c.userData.baseOpacity = c.opacity;
        map.set(m, c); unit.mats.push(c);
      }
      o.material = map.get(m);
    });
  },

  // ------------------------------------------------------------------
  // (in steps: the loading counter moves between them, see Game.init)
  async build(step = async () => { }) {
    const scene = Render.scene;
    this.root = grp(scene); this.root.name = 'house';
    this.dyn = grp(this.root);
    for (const k of ['hall', 'kitchen', 'living', 'bedroom', 'basement', 'porch', 'ext']) this.statics[k] = grp(this.root);
    this.ext = grp(scene);
    this.roof = grp(scene);
    // light pool. The first entries cast soft shadows (how many depends on the quality setting): updateLights hands
    // them to the strongest lamps of the room you are in
    for (let i = 0; i < 8; i++) {
      const l = new THREE.PointLight(0xffffff, 0, 10, LIGHT_DECAY); l.castShadow = false;
      const s = l.shadow; s.camera.near = 0.35; s.bias = -0.0025; s.normalBias = 0.045; s.radius = 7; s.autoUpdate = false;
      scene.add(l); this.pool.push({ light: l, src: null, sk: 0 });
    }
    this.hemi = new THREE.HemisphereLight(0x8090c0, 0x3a2a24, 2.0); scene.add(this.hemi);
    // moonlight for the yard (title screen, the visitor at the door, the ending): it comes from the moon in the sky,
    // behind the house, so the house, the trees and the gravestones throw long shadows over the lawn
    this.moon = new THREE.DirectionalLight(0x8fa6da, 0); this.moon.target.position.set(...MOON_TARGET);
    this.moon.position.copy(moonAt(90)); scene.add(this.moon); scene.add(this.moon.target);
    {
      // (the frustum fits the house, the yard out to the fence and the side yard trees)
      const m = this.moon, c = m.shadow.camera;
      m.castShadow = true; c.left = -43; c.right = 42; c.top = 32; c.bottom = -23; c.near = 44; c.far = 130; c.updateProjectionMatrix();
      m.shadow.bias = -0.0005; m.shadow.normalBias = 0.04; m.shadow.radius = 5; m.shadow.intensity = 0.92; m.shadow.autoUpdate = false;
    }
    this.applyShadowQuality();
    // muzzle / explosion flashes: not a light of its own, it borrows the pool's last entry while it lasts (updateLights).
    // Every lit shader pays for every point light in the scene, whether it is on or not: one fewer is ~10 % of the
    // lighting cost of every pixel
    this.flashFX = { position: new THREE.Vector3(), color: new THREE.Color(0xffaa55), intensity: 0, distance: 12, decay: 1.6 };

    this.kitMaterialTweaks();
    const parts = [() => this.buildFloorsAndCeilings(), () => this.buildWalls(), () => this.buildHall(), () => this.buildKitchen(), () => this.buildLiving(),
      () => this.buildBedroom(), () => this.buildBasement(), () => this.buildExterior(), () => this.buildAttic(), () => this.buildClutter(), () => this.buildMess()];
    for (let i = 0; i < parts.length; i++) { parts[i](); await step(0.65 * (i + 1) / parts.length); }
    // keep animated / removable things separate, merge the rest
    const keep = (o) => this.keepObj(o);
    for (const a of this.anim) { keep(a.m); keep(a.hands); if (a.flames) a.flames.forEach(keep); if (a.blobs) a.blobs.forEach(keep); }
    keep(this.props.fire); keep(this.props.flashlightItem); keep(this.props.pokerItem); keep(this.props.circle);
    keep(this.props.tvWhole); keep(this.props.tvBroken); keep(this.props.tvGlass); keep(this.props.wardrobe);
    if (this.props.tv && this.props.tv.mesh) keep(this.props.tv.mesh);
    for (const b of this.breakables) keep(b.mesh);
    // (each room's merged meshes are kept by room: up in the attic at the end the rooms below are put away)
    this.staticMeshes = {};
    for (const k in this.statics) this.staticMeshes[k] = bakeStatic(this.statics[k]);
    for (const k in this.clutter) this.staticMeshes[k].push(...bakeStatic(this.clutter[k]));
    bakeStatic(this.dyn, this.dyn);
    for (const u of this.walls) bakeStatic(u.decorGroup, u.decorGroup);
    bakeStatic(this.ext, this.ext);
    bakeStatic(this.roof, this.roof);
    await step(0.8);
    this.lightPassMeshes();
    this.buildShadowProxies();
    // the roof throws its shadow under the moon (from the top-down view it is hidden, so it casts nothing there).
    // Not part of the shadow proxies, they would cast while it is hidden
    this.roof.traverse((o) => {
      if (!o.isMesh || o === this.atticFigure) return;
      const ms = Array.isArray(o.material) ? o.material : [o.material];
      if (ms.every((m) => !m.transparent && !m.isMeshBasicMaterial && !(m.emissive && m.emissive.getHex() && m.emissiveIntensity > 0))) o.castShadow = true;
    });
    this.freezeStatics();
    this.applyWear();
    await step(0.88);
  },

  // the house does not move (only door leaves and the kept props do): its matrices are composed once, not every frame
  freezeStatics() {
    const live = new Set();
    for (const k in this.doors) { const d = this.doors[k]; if (d.pivot) live.add(d.pivot); for (const l of d.leaves || []) live.add(l.pivot); }
    const walk = (o) => {
      if (o.userData.keep || live.has(o)) return;
      o.updateMatrix(); o.matrixAutoUpdate = false;
      for (const c of o.children) walk(c);
    };
    for (const root of [this.root, this.ext, this.roof]) for (const c of root.children) walk(c);
  },

  // Shadow proxies: the static shadow casters (furniture, walls, frames, wall decor, the yard) cut into 5 m cells of
  // bare triangles. A lamp's cube shadow map then costs a few dozen draw calls instead of several hundred, and each
  // face only draws the cells it can see. The proxies take part in shadow passes only (Render wraps shadowMap.render);
  // the real meshes stop casting. Doors, breakables and everything else that moves or disappears keep their own shadows.
  buildShadowProxies() {
    const T = THREE, CELL = 5, dynRoots = new Set();
    for (const k in this.doors) { const d = this.doors[k]; if (d.pivot) dynRoots.add(d.pivot); for (const l of d.leaves || []) dynRoots.add(l.pivot); }
    const movable = (o) => { for (let p = o; p; p = p.parent) if (!p.visible || p.userData.keep || dynRoots.has(p) || p.isBone) return true; return false; };
    const solid = (m) => !m.transparent && !(m.alphaTest > 0) && !m.alphaMap;
    const wallParts = new Set();
    for (const u of this.walls) if (u.wallMeshes) { wallParts.add(u.wallMeshes.upper); wallParts.add(u.wallMeshes.stub); u.wallMeshes.upper.castShadow = false; u.wallMeshes.stub.castShadow = false; }
    const cells = new Map(), v = new T.Vector3();
    for (const root of [this.root, this.ext, this.roof]) {
      root.updateMatrixWorld(true);
      root.traverse((o) => {
        if (!o.isMesh || o.isSkinnedMesh || o.isInstancedMesh || !o.castShadow || wallParts.has(o)) return;
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        const g = o.geometry, pos = g.attributes.position;
        if (!pos || !mats.every(solid) || movable(o)) return;
        const side = mats.some((m) => m.side === T.DoubleSide) ? T.DoubleSide : mats[0].side;
        const idx = g.index ? g.index.array : null, nTri = Math.floor((idx ? idx.length : pos.count) / 3);
        const wp = new Float32Array(pos.count * 3);
        for (let i = 0; i < pos.count; i++) { v.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld); wp[i * 3] = v.x; wp[i * 3 + 1] = v.y; wp[i * 3 + 2] = v.z; }
        const remap = new Map();
        for (let t = 0; t < nTri; t++) {
          const a = idx ? idx[t * 3] : t * 3, b = idx ? idx[t * 3 + 1] : t * 3 + 1, c = idx ? idx[t * 3 + 2] : t * 3 + 2;
          const cx = (wp[a * 3] + wp[b * 3] + wp[c * 3]) / 3, cz = (wp[a * 3 + 2] + wp[b * 3 + 2] + wp[c * 3 + 2]) / 3;
          const key = Math.floor(cx / CELL) + ',' + Math.floor(cz / CELL) + ',' + side;
          let cell = cells.get(key);
          if (!cell) { cell = { side, pos: [], idx: [] }; cells.set(key, cell); }
          let lm = remap.get(cell);
          if (!lm) { lm = new Map(); remap.set(cell, lm); }
          for (const vi of [a, b, c]) {
            let ni = lm.get(vi);
            if (ni === undefined) { ni = cell.pos.length / 3; cell.pos.push(wp[vi * 3], wp[vi * 3 + 1], wp[vi * 3 + 2]); lm.set(vi, ni); }
            cell.idx.push(ni);
          }
        }
        o.castShadow = false;
      });
    }
    // (the proxies are simplified: their vertices snapped to a 2 cm grid and merged, the triangles that collapse
    // dropped. A shadow map texel is 2-4 cm here and soft filtered, so the shadows look the same; the dense props'
    // bevels and lathe rings stop costing triangles in every face of every shadow cube)
    const Q = 0.02;
    const simplify = (cell) => {
      const P = cell.pos, I = cell.idx, nv = P.length / 3, key = new Map(), remap = new Int32Array(nv), out = [];
      for (let i = 0; i < nv; i++) {
        const ix = Math.round(P[i * 3] / Q), iy = Math.round(P[i * 3 + 1] / Q), iz = Math.round(P[i * 3 + 2] / Q);
        const k = ((ix + 16384) * 32768 + (iy + 16384)) * 32768 + (iz + 16384);
        let j = key.get(k);
        if (j === undefined) { j = out.length / 3; key.set(k, j); out.push(ix * Q, iy * Q, iz * Q); }
        remap[i] = j;
      }
      const idx = [];
      for (let t = 0; t < I.length; t += 3) { const a = remap[I[t]], b = remap[I[t + 1]], c = remap[I[t + 2]]; if (a !== b && b !== c && a !== c) idx.push(a, b, c); }
      cell.pos = out; cell.idx = idx;
    };
    const mats = {};
    this.shadowProxies = [];
    for (const cell of cells.values()) {
      if (!NO_PROXY_SIMPLIFY) simplify(cell);
      if (!cell.idx.length) continue;
      const geo = new T.BufferGeometry(), n = cell.pos.length / 3;
      geo.setAttribute('position', new T.Float32BufferAttribute(cell.pos, 3));
      geo.setIndex(n > 65535 ? new T.Uint32BufferAttribute(cell.idx, 1) : new T.Uint16BufferAttribute(cell.idx, 1));
      geo.computeBoundingSphere();
      const m = mats[cell.side] || (mats[cell.side] = new T.MeshBasicMaterial({ side: cell.side, colorWrite: false, depthWrite: false }));
      const mesh = new T.Mesh(geo, m);
      mesh.name = 'shadowProxy'; mesh.castShadow = true; mesh.receiveShadow = false; mesh.visible = false; mesh.matrixAutoUpdate = false;
      Render.scene.add(mesh);
      this.shadowProxies.push(mesh);
    }
    Render.shadowProxies = this.shadowProxies;
  },

  buildFloorsAndCeilings() {
    for (const [set, lo] of [['floor_checker', 0.4], ['floor_wood', 0.25], ['floor_wood_light', 0.25], ['floor_concrete', 0.3]]) this.roughRemap(set, lo);
    // PBR floor sets (2 m tiles, planks run along x); canvas textures only as fallback
    const FLOOR = { wood: 'floor_wood', woodLight: 'floor_wood_light', checker: 'floor_checker', carpet: 'floor_carpet', concrete: 'floor_concrete' };
    for (const k of ['hall', 'kitchen', 'living', 'bedroom', 'basement']) {
      const r = ROOMS[k];
      const fm = this.surf(FLOOR[r.floor]) || Mat.tex(floorTexture(r.floor));
      const g = worldBox(r.x0, -0.2, r.z0, r.x1, 0, r.z1, 0.5, 0.5);
      mk(g, fm, 0, 0, 0, this.statics[k], { cast: false });
      // ceilings (first person only): plaster upstairs, the floor boards' underside in the basement
      const cm = k === 'basement' ? (this.surf('floor_wood', { color: 0x6a5a4c }) || Mat.lam(0x2c2925)) : (this.surf('ceiling', { color: 0xb4ab9e }) || Mat.lam(0x857d70));
      // (the hall's has the stairwell in it: until the very end a black cap closes it, upstairs is pitch dark)
      const [hx0, hx1, hz0, hz1] = ATTIC_HOLE;
      const parts = k === 'hall' ? [[r.x0, r.x1, hz1, r.z1], [hx1, r.x1, r.z0, hz1], [r.x0, hx1, r.z0, hz0]] : [[r.x0, r.x1, r.z0, r.z1]];
      for (const [x0, x1, z0, z1] of parts) {
        const c = mk(worldBox(x0, WALL_H, z0, x1, WALL_H + 0.1, z1, 0.5, 0.5), cm, 0, 0, 0, this.root, { cast: false });
        c.visible = false; this.ceilings.push(c);
      }
      if (k === 'hall') {
        this.stairCap = mk(Geo.plane(hx1 - r.x0, hz1 - hz0), Mat.basic(0x000000), (r.x0 + hx1) / 2, WALL_H + 0.08, (hz0 + hz1) / 2, this.root, { rx: Math.PI / 2, cast: false, receive: false });
        this.stairCap.visible = false;
        void hx0;
      }
      if (k === 'basement') {
        // joists
        const bm = this.surf('floor_wood', { color: 0x9a8676 }) || Mat.tex(fabricTexture('wood'));
        for (let x = r.x0 + 2; x < r.x1; x += 3) { const b = mk(worldBox(x - 0.15, WALL_H - 0.35, r.z0, x + 0.15, WALL_H, r.z1, 1, 1), bm, 0, 0, 0, this.root, { cast: false }); b.visible = false; this.ceilings.push(b); }
      }
    }
  },

  // ------------------------------------------------------------------
  //  Walls with cutaway fading
  // ------------------------------------------------------------------
  buildWalls() {
    // PBR wall sets: 1 texture = 1 m wide x 3 m tall (u per meter, v = y / 3); the outside siding is a 1 m tile
    const WSET = { hall: 'wall_hall', kitchen: 'wall_kitchen', living: 'wall_living', bedroom: 'wall_bedroom', basement: 'wall_basement', outside: 'wall_outside' };
    const wm = {};
    const wallMat = (kind) => wm[kind] || (wm[kind] = this.surf(WSET[kind]) || Mat.tex(wallTexture(kind)));
    const sidingPBR = !!Assets.tex.wall_outside;
    const endCapMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85, metalness: 0 }); // ends 0x3a3029, caps 0x17110f
    // [axis, c, s0, s1, sideNeg(room on -side), sidePos(room on +side), openings[[s0,s1,h,type]]]
    const defs = [
      ['x', 0, 0, 14, 'outside', 'kitchen', []],
      ['x', 0, 14, 30, 'outside', 'living', []],
      ['x', 12, 0, 14, 'kitchen', 'hall', [[9.2, 11.4, DOOR_H, 'door']]],
      ['x', 12, 14, 30, 'living', 'bedroom', [[24.2, 26.4, DOOR_H, 'door']]],
      ['x', 24, 0, 14, 'hall', 'outside', []],
      ['x', 24, 14, 30, 'bedroom', 'outside', []],
      ['z', 0, 0, 12, 'outside', 'kitchen', []],
      ['z', 0, 12, 24, 'outside', 'hall', [[17.2, 18.4, DOOR_H, 'front']]],
      ['z', 14, 0, 12, 'kitchen', 'living', [[4.0, 6.2, DOOR_H, 'door']]],
      ['z', 14, 12, 24, 'hall', 'bedroom', [[19.4, 21.6, DOOR_H, 'door']]],
      ['z', 30, 0, 12, 'living', 'outside', []],
      ['z', 30, 12, 24, 'bedroom', 'outside', []],
      // basement
      ['x', 2, 60, 80, 'outside', 'basement', []],
      ['x', 20, 60, 80, 'basement', 'outside', []],
      ['z', 60, 2, 20, 'outside', 'basement', []],
      ['z', 80, 2, 20, 'basement', 'outside', []],
    ];
    const T = WALL_T / 2;
    // The outer walls along x wrap the corners (half a wall thickness past their ends) and the outer walls along z
    // stop where those begin; inner walls stop inside the wall they meet. So no two wall faces ever lie in the same
    // plane: coplanar faces flicker (from the yard they shimmered like posts at the corners and where an inner wall
    // met the outer one)
    const outerX = (z, x) => defs.some((d) => d[0] === 'x' && d[1] === z && (d[4] === 'outside' || d[5] === 'outside') && x >= d[2] - 0.01 && x <= d[3] + 0.01);
    for (const def of defs) {
      const [axis, c, s0, s1, neg, pos, openings] = def;
      const isBase = c >= 60 || (axis === 'x' && s0 >= 60);
      const outer = neg === 'outside' || pos === 'outside';
      const runs = (sv) => defs.some((d) => d !== def && d[0] === axis && d[1] === c && (d[2] === sv || d[3] === sv));
      const ext0 = axis === 'x' && outer && !runs(s0) ? T : 0, ext1 = axis === 'x' && outer && !runs(s1) ? T : 0;
      const trim0 = axis === 'z' && outer && outerX(s0, c) ? T : 0, trim1 = axis === 'z' && outer && outerX(s1, c) ? T : 0;
      const unit = { axis, c, s0, s1, fade: 1, target: 1, meshes: [], decor: [], mats: [], doors: [], base: isBase, rooms: [neg, pos] };
      const g = grp(this.root);
      unit.group = g;
      unit.decorGroup = grp(this.root);
      unit.decor.push(unit.decorGroup);
      // build list of solid spans
      let spans = []; let cur = s0 + trim0;
      const sorted = openings.slice().sort((a, b) => a[0] - b[0]);
      for (const o of sorted) { if (o[0] > cur) spans.push([cur, o[0]]); cur = o[1]; }
      if (cur < s1 - trim1) spans.push([cur, s1 - trim1]);
      const negKind = neg === 'outside' ? (isBase ? 'basement' : 'outside') : ROOMS[neg].wall;
      const posKind = pos === 'outside' ? (isBase ? 'basement' : 'outside') : ROOMS[pos].wall;
      const negM = wallMat(negKind), posM = wallMat(posKind);
      // box faces showing the siding (BoxGeometry face order +x -x +y -y +z -z, 4 vertices each)
      const sidingFaces = [];
      if (sidingPBR && negKind === 'outside') sidingFaces.push(axis === 'x' ? 5 : 1);
      if (sidingPBR && posKind === 'outside') sidingFaces.push(axis === 'x' ? 4 : 0);
      // unique materials per unit so it can fade on its own (clones share the textures). Each unit is drawn as
      // two merged meshes (upper part that fades / lower stub that stays) with 3 material groups:
      // +side, -side, and the dark ends + caps (one vertex-colored material).
      const mNeg = negM.clone(), mPos = posM.clone(), mEndCap = endCapMat.clone();
      unit.mats.push(mNeg, mPos, mEndCap);
      const posFace = axis === 'x' ? 4 : 0, negFace = axis === 'x' ? 5 : 1;
      const upperGeos = [], stubGeos = [];
      const addBox = (a0, a1, y0, y1, isUpper) => {
        let geo;
        if (axis === 'x') geo = worldBox(a0, y0, c - T, a1, y1, c + T, 1, 1, 1 / WALL_H);
        else geo = worldBox(c - T, y0, a0, c + T, y1, a1, 1, 1, 1 / WALL_H);
        if (sidingFaces.length) { const uv = geo.attributes.uv; for (const f of sidingFaces) for (let i = f * 4; i < f * 4 + 4; i++) uv.setY(i, uv.getY(i) * WALL_H); }
        (isUpper ? upperGeos : stubGeos).push(geo);
      };
      spans.forEach(([a, b], i) => {
        const a0 = a - (i === 0 ? ext0 : 0), a1 = b + (i === spans.length - 1 ? ext1 : 0);
        addBox(a0, a1, 0, STUB_H, false);
        addBox(a0, a1, STUB_H, WALL_H, true);
        if (axis === 'x') this.addCol(a0, c - T, a1, c + T, { h: 3, shots: true, room: 'wall' });
        else this.addCol(c - T, a0, c + T, a1, { h: 3, shots: true, room: 'wall' });
      });
      for (const o of sorted) {
        addBox(o[0], o[1], o[2], WALL_H, true); // lintel
        // threshold strip
        const th = axis === 'x' ? worldBox(o[0], 0, c - T, o[1], 0.02, c + T, 1, 1) : worldBox(c - T, 0, o[0], c + T, 0.02, o[1], 1, 1);
        mk(th, Mat.lam(0x2a1d14), 0, 0, 0, g, { cast: false });
        if (o[3] === 'door') this.makeDoubleDoor(unit, axis, c, o[0], o[1]);
        if (o[3] === 'front') this.makeFrontDoor(unit, axis, c, o[0], o[1]);
      }
      // opaque walls draw one combined mesh; while the unit fades, the upper part (fading) and the stub are split
      const full = new THREE.Mesh(mergeWallBoxes(upperGeos.concat(stubGeos).map((x) => x.clone()), posFace, negFace), [mPos, mNeg, mEndCap]);
      const upper = new THREE.Mesh(mergeWallBoxes(upperGeos, posFace, negFace), [mPos, mNeg, mEndCap]);
      const stub = new THREE.Mesh(mergeWallBoxes(stubGeos, posFace, negFace), [posM, negM, endCapMat]);
      for (const m of [full, upper, stub]) { m.castShadow = true; m.receiveShadow = true; g.add(m); }
      unit.wallMeshes = { full, upper, stub };
      this.wallVis(unit, 1);
      this.walls.push(unit);
    }
    // white corner boards on the outside corners of the house, a little proud of the siding (they come and go with
    // the front and back walls)
    const trimM = Mat.lam(0xd8d0c0), TW = 0.36;
    for (const [cx, cz, sx, sz] of [[0, 0, -1, -1], [30, 0, 1, -1], [0, 24, -1, 1], [30, 24, 1, 1]]) {
      const ox = cx + sx * (T + 0.025), oz = cz + sz * (T + 0.025), ix = ox - sx * TW, iz = oz - sz * TW;
      const m = mk(worldBox(Math.min(ox, ix), 0, Math.min(oz, iz), Math.max(ox, ix), WALL_H, Math.max(oz, iz), 1, 1), trimM, 0, 0, 0, null, { cast: false });
      const u = this.wallUnit('z', cx, cz);
      (u ? u.decorGroup : this.root).add(m);
    }
  },

  wallUnit(axis, c, s) { return this.walls.find((u) => u.axis === axis && Math.abs(u.c - c) < 0.01 && s >= u.s0 - 0.01 && s <= u.s1 + 0.01); },
  attach(obj, axis, c, s) { const u = this.wallUnit(axis, c, s); if (u) u.decorGroup.attach(obj); return obj; },

  makeDoubleDoor(unit, axis, c, s0, s1) {
    const wdt = (s1 - s0) / 2;
    const useKit = this.hasKit('props_common', 'DoorLeaf');
    let mat = null, glass = null;
    if (!useKit) {
      mat = Mat.tex(fabricTexture('wood'), { unique: true, color: 0xb08a68 });
      glass = Mat.lam(0x1a2230, { unique: true, emissive: 0x0a1020 });
      unit.mats.push(mat, glass);
    }
    const door = { unit, axis, c, s0, s1, open: 1, target: 1, leaves: [], col: null, locked: false };
    [0, 1].forEach((side) => {
      const hinge = side === 0 ? s0 : s1;
      const pivot = new THREE.Group();
      if (axis === 'x') pivot.position.set(hinge, 0, c); else pivot.position.set(c, 0, hinge);
      unit.group.add(pivot);
      const leaf = new THREE.Group(); pivot.add(leaf);
      const dir = side === 0 ? 1 : -1;
      if (useKit) {
        // kit leaf: hinge axis at its origin, extends along +X; the second leaf of the pair is turned around
        const lf = this.kit('props_common', 'DoorLeaf', leaf, 0, 0, 0, side === 0 ? 0 : Math.PI);
        if (Math.abs(wdt - 1.1) > 0.01) lf.scale.x = wdt / 1.1;
        this.unitMats(unit, lf);
      } else {
        mk(Geo.box(wdt - 0.04, DOOR_H - 0.05, 0.07), mat, dir * wdt / 2, DOOR_H / 2, 0, leaf);
        mk(Geo.box(wdt * 0.6, 0.9, 0.08), glass, dir * wdt / 2, DOOR_H * 0.68, 0, leaf, { cast: false });
        mk(Geo.sph(0.05, 6, 4), Mat.lam(0xc9a25a), dir * (wdt - 0.12), 1.0, 0.06, leaf, { cast: false });
      }
      if (axis === 'z') leaf.rotation.y = -Math.PI / 2;
      leaf.traverse((o) => { if (o.isMesh) unit.meshes.push(o); });
      door.leaves.push({ pivot, dir, side });
    });
    door.col = axis === 'x' ? this.addCol(s0, c - 0.12, s1, c + 0.12, { h: 3, shots: true, active: false }) : this.addCol(c - 0.12, s0, c + 0.12, s1, { h: 3, shots: true, active: false });
    const key = unit.rooms.filter((r) => r !== 'outside').sort().join('-');
    this.doors[key] = door;
    unit.doors.push(door);
  },

  makeFrontDoor(unit, axis, c, s0, s1) {
    const pivot = new THREE.Group(); pivot.position.set(c, 0, s0); unit.group.add(pivot);
    const leaf = grp(pivot);
    const w = s1 - s0;
    // kit door: hinge axis at its origin, extends along +Z, exterior (knocker) face toward -X (the porch)
    const fd = this.kit('props_common', 'FrontDoor', leaf);
    if (fd) {
      if (Math.abs(w - 1.2) > 0.01) fd.scale.z = w / 1.2;
      this.unitMats(unit, fd);
    } else {
      const mat = Mat.lam(0x4a1414, { unique: true });
      const glass = Mat.lam(0x30281a, { unique: true, emissive: 0x2a2010 });
      unit.mats.push(mat, glass);
      mk(Geo.box(0.08, DOOR_H - 0.04, w - 0.04), mat, 0, DOOR_H / 2, w / 2, leaf);
      mk(Geo.box(0.09, 0.5, w * 0.5), glass, 0, DOOR_H * 0.74, w / 2, leaf, { cast: false });
      for (const y of [0.55, 1.3]) mk(Geo.box(0.1, 0.5, w * 0.62), Mat.lam(0x3a0f0f), 0, y, w / 2, leaf, { cast: false });
      mk(Geo.sph(0.06, 6, 4), Mat.lam(0xd8b060), 0.07, 1.05, w - 0.15, leaf, { cast: false });
      mk(Geo.sph(0.06, 6, 4), Mat.lam(0xd8b060), -0.07, 1.05, w - 0.15, leaf, { cast: false });
    }
    leaf.traverse((o) => { if (o.isMesh) unit.meshes.push(o); });
    const door = { unit, axis, c, s0, s1, open: 0, target: 0, front: true, pivot, col: null, locked: true };
    door.col = this.addCol(c - 0.12, s0, c + 0.12, s1, { h: 3, shots: true, active: true, id: 'front' });
    this.doors.front = door;
  },

  setDoor(key, open, instant = false) {
    const d = this.doors[key]; if (!d) return;
    d.target = open ? 1 : 0;
    if (instant) d.open = d.target;
    d.col.active = !open;
  },
  setArenaDoors(room, open) {
    for (const k in this.doors) { if (k === 'front') continue; if (k.split('-').includes(room)) this.setDoor(k, open); }
  },

  // ------------------------------------------------------------------
  //  Furniture builders (front faces +z, origin on the floor)
  // ------------------------------------------------------------------
  wallDecor(axis, c, s, y, inward, obj, parent, surface = false) {
    // place obj on wall; inward = +1 if room is on + side. surface: kit props whose origin is the wall surface
    const u = this.wallUnit(axis, c, s);
    (u ? u.decorGroup : (parent || this.dyn)).add(obj);
    const off = WALL_T / 2 + (surface ? 0.003 : 0.02);
    if (axis === 'x') { obj.position.set(s, y, c + inward * off); obj.rotation.y = inward > 0 ? 0 : Math.PI; }
    else { obj.position.set(c + inward * off, y, s); obj.rotation.y = inward > 0 ? Math.PI / 2 : -Math.PI / 2; }
    return obj;
  },

  frame(w, h, tex, frameCol = 0x2a1a10) {
    const g = new THREE.Group();
    mk(Geo.box(w + 0.1, h + 0.1, 0.04), Mat.lam(frameCol), 0, 0, 0, g, { cast: false });
    mk(Geo.plane(w, h), Mat.tex(tex), 0, 0, 0.025, g, { cast: false });
    return g;
  },

  windowObj(w, h, glassMat) {
    const g = new THREE.Group();
    const frameM = Mat.lam(0xd8d0c0);
    mk(Geo.box(w + 0.16, 0.08, 0.1), frameM, 0, -h / 2 - 0.04, 0, g, { cast: false });
    mk(Geo.box(w + 0.16, 0.08, 0.08), frameM, 0, h / 2 + 0.04, 0, g, { cast: false });
    mk(Geo.box(0.08, h, 0.08), frameM, -w / 2 - 0.04, 0, 0, g, { cast: false });
    mk(Geo.box(0.08, h, 0.08), frameM, w / 2 + 0.04, 0, 0, g, { cast: false });
    mk(Geo.box(0.04, h, 0.06), frameM, 0, 0, 0, g, { cast: false });
    mk(Geo.box(w, 0.04, 0.06), frameM, 0, 0, 0, g, { cast: false });
    const glass = mk(Geo.plane(w, h), glassMat, 0, 0, -0.01, g, { cast: false, receive: false });
    // curtains
    const cm = Mat.lam(0x6a1f24);
    mk(Geo.box(0.32, h + 0.5, 0.05), cm, -w / 2 - 0.12, 0.05, 0.06, g, { cast: false });
    mk(Geo.box(0.32, h + 0.5, 0.05), cm, w / 2 + 0.12, 0.05, 0.06, g, { cast: false });
    mk(Geo.box(w + 0.9, 0.06, 0.06), Mat.lam(0x3a2a1a), 0, h / 2 + 0.3, 0.08, g, { cast: false });
    void glass;
    return g;
  },

  // window on a wall: kit window or the procedural fallback. Its glass looks out at the real night on that side of
  // the house (winView), and lights up with the lightning
  windowAt(kit, node, axis, c, s, y, inward, w, h) {
    const v = this.winView(axis === 'x' ? (c < 12 ? 'north' : 'south') : (c < 15 ? 'west' : 'east'));
    if (!this.windows.includes(v.mat)) this.windows.push(v.mat);
    const k = this.wallKit(kit, node, axis, c, s, y, inward);
    if (!k) return this.wallDecor(axis, c, s, y, inward, this.windowObj(w, h, v.mat));
    k.traverse((o) => { if (o.isMesh && !Array.isArray(o.material) && o.material.name === 'WindowGlass') o.material = v.mat; });
    return k;
  },

  // The view out of the windows: a cube map of the yard shot once from just outside each side of the house
  // (bakeWindowViews, while loading), looked up along the view ray. The ray is first carried out to a sphere
  // around the shot point (the size of the yard), so a window far from that point still sees the right trees and
  // the moon in the right place, and the view shifts as you walk past it
  winView(side) {
    const V = this.winViews || (this.winViews = {});
    if (V[side]) return V[side];
    const C = { north: [16, 1.65, -0.9], south: [13, 1.65, 24.9], east: [30.9, 1.65, 15.8], west: [-0.9, 1.65, 3.7] }[side];
    const size = SETTINGS.quality >= 2 ? 384 : SETTINGS.quality === 1 ? 256 : 128;
    const rt = new THREE.WebGLCubeRenderTarget(size, { type: THREE.UnsignedByteType, colorSpace: THREE.SRGBColorSpace, generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter, magFilter: THREE.LinearFilter });
    return (V[side] = { side, C, rt, mat: this.winGlassMat(C, rt.texture) });
  },
  // the glass for a view shot from C (gain brightens it: the small round attic windows look out at the moonlit sky)
  winGlassMat(C, tex, gain = 1) {
    const mat = new THREE.ShaderMaterial({
      name: 'WindowGlass', fog: true,
      uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { tView: { value: null }, uCenter: { value: new THREE.Vector3(...C) }, uRadius: { value: 28 }, uFlash: { value: 0 }, uGain: { value: gain } }]),
      vertexShader: `varying vec3 vWorld; varying vec3 vNormalW;
        #include <fog_pars_vertex>
        void main(){
          vec4 w = modelMatrix * vec4(position, 1.0); vWorld = w.xyz; vNormalW = normalize(mat3(modelMatrix) * normal);
          vec4 mvPosition = viewMatrix * w; gl_Position = projectionMatrix * mvPosition;
          #include <fog_vertex>
        }`,
      fragmentShader: `uniform samplerCube tView; uniform vec3 uCenter; uniform float uRadius; uniform float uFlash; uniform float uGain; varying vec3 vWorld; varying vec3 vNormalW;
        #include <fog_pars_fragment>
        void main(){
          vec3 d = normalize(vWorld - cameraPosition), o = vWorld - uCenter;
          float b = dot(o, d), c = dot(o, o) - uRadius * uRadius;
          vec3 dir = o + d * (-b + sqrt(max(b * b - c, 0.0)));
          vec3 col = textureCube(tView, dir).rgb * vec3(0.9, 0.94, 1.0) * uGain * (1.0 + uFlash * 2.5);
          // the room shows faintly in the glass at a glancing look
          col += vec3(0.05, 0.035, 0.022) * pow(1.0 - abs(dot(d, normalize(vNormalW))), 4.0);
          gl_FragColor = vec4(col, 1.0);
          #include <fog_fragment>
        }`,
    });
    mat.uniforms.tView.value = tex;
    return mat;
  },
  // shoot the night outside for the windows: the yard as on the title screen (moonlight, cold sky light, the porch
  // lamp, the trees, the clouds, the mist), the lamps inside the house off
  bakeWindowViews() {
    const V = Object.values(this.winViews || {}); if (!V.length) return;
    const r = Render.renderer, sc = Render.scene, TU = this.tune;
    const restoreL = this.forceLights('porch', 1, TU.hemiTitle);
    const vis = [this.sky, this.titleTrees, this.clouds, this.spills, this.hood, this.roof, this.moonG, ...(this.mist || []).map((m) => m.pl)].filter(Boolean).map((o) => [o, o.visible]);
    const keep = { moon: this.moon.intensity, hc: this.hemi.color.clone(), hg: this.hemi.groundColor.clone(), env: sc.environmentIntensity, fn: sc.fog.near, ff: sc.fog.far, fc: sc.fog.color.clone(), bg: sc.background.clone(), ac: r.autoClear };
    try {
      this.moon.intensity = TU.moonTitle; this.unparkShadow(this.moon); this.moon.shadow.needsUpdate = true;
      this.hemi.color.set(0x56669a); this.hemi.groundColor.set(0x18140f);
      sc.environmentIntensity = TU.envTitle; sc.fog.near = 14; sc.fog.far = 75; sc.fog.color.set(0x0b0e16); sc.background.set(0x0b0e16);
      this.sky.material.uniforms.uHorizon.value.copy(sc.fog.color); this.sky.material.uniforms.uFlash.value = 0; this.clouds.material.uniforms.uFlash.value = 0;
      for (const [o] of vis) o.visible = true;
      for (const m of this.mist || []) m.pl.visible = false;   // (the ground mist is the title screen's)
      r.autoClear = true;
      const cam = new THREE.CubeCamera(0.1, 220, V[0].rt);
      for (const v of V) { cam.renderTarget = v.rt; cam.position.set(...v.C); cam.updateMatrixWorld(true); cam.update(r, sc); }
    } catch (e) { console.error(e); }
    r.setRenderTarget(null); r.autoClear = keep.ac;
    for (const [o, v] of vis) o.visible = v;
    this.moon.intensity = keep.moon; this.hemi.color.copy(keep.hc); this.hemi.groundColor.copy(keep.hg);
    sc.fog.near = keep.fn; sc.fog.far = keep.ff; sc.fog.color.copy(keep.fc); sc.background.copy(keep.bg);
    restoreL();
    sc.environmentIntensity = keep.env;
    this.moon.shadow.needsUpdate = true;
  },

  lampShade(g, x, y, z, r0, r1, h, color = 0xe8d0a0) {
    const shadeMat = Mat.lam(color, { emissive: color, ei: 0.55, unique: true });
    mk(Geo.cyl(r0, r1, h, 12), shadeMat, x, y, z, g, { cast: false });
    return shadeMat;
  },

  // static furniture helpers ------------------------------------------
  armchair(parent, x, z, ry, mat) {
    const g = grp(parent, x, 0, z, ry);
    mk(Geo.box(0.95, 0.42, 0.85), mat, 0, 0.32, 0.05, g);
    mk(Geo.box(0.95, 0.85, 0.22), mat, 0, 0.62, -0.36, g);
    mk(Geo.box(0.18, 0.62, 0.85), mat, -0.47, 0.42, 0.05, g);
    mk(Geo.box(0.18, 0.62, 0.85), mat, 0.47, 0.42, 0.05, g);
    mk(Geo.box(0.8, 0.12, 0.7), Mat.lam(0x7a5a3a), 0, 0.56, 0.08, g);
    for (const [lx, lz] of [[-0.4, 0.38], [0.4, 0.38], [-0.4, -0.38], [0.4, -0.38]]) mk(Geo.box(0.08, 0.12, 0.08), Mat.lam(0x2a1a10), lx, 0.06, lz, g);
    this.colRect(x, z, 1.1, 1.0, ry, { h: 0.9 });
    return g;
  },
  sofa(parent, x, z, ry, w, mat) {
    const g = grp(parent, x, 0, z, ry);
    mk(Geo.box(w, 0.42, 0.9), mat, 0, 0.3, 0.05, g);
    mk(Geo.box(w, 0.9, 0.25), mat, 0, 0.62, -0.38, g);
    mk(Geo.box(0.22, 0.65, 0.9), mat, -w / 2, 0.42, 0.05, g);
    mk(Geo.box(0.22, 0.65, 0.9), mat, w / 2, 0.42, 0.05, g);
    for (let i = 0; i < 3; i++) mk(Geo.box(w / 3 - 0.08, 0.12, 0.72), Mat.lam(0x8a6a4a), -w / 3 + i * w / 3, 0.56, 0.1, g);
    this.colRect(x, z, w + 0.2, 1.05, ry, { h: 0.95 });
    return g;
  },
  table(parent, x, z, w, d, h, topMat, legMat, cloth = null) {
    const g = grp(parent, x, 0, z, 0);
    mk(Geo.box(w, 0.06, d), topMat, 0, h, 0, g);
    for (const [lx, lz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) mk(Geo.box(0.07, h, 0.07), legMat, lx * (w / 2 - 0.08), h / 2, lz * (d / 2 - 0.08), g);
    if (cloth) mk(Geo.box(w + 0.14, 0.03, d + 0.14), cloth, 0, h + 0.035, 0, g, { cast: false });
    this.addCol(x - w / 2, z - d / 2, x + w / 2, z + d / 2, { h, low: true });
    return g;
  },
  // kit table (same low collider as table()) or the primitive table
  tableKit(parent, kit, node, x, z, w, d, h, topMat, legMat, cloth = null) {
    if (!this.kit(kit, node, parent, x, 0, z)) return this.table(parent, x, z, w, d, h, topMat, legMat, cloth);
    this.addCol(x - w / 2, z - d / 2, x + w / 2, z + d / 2, { h, low: true });
    return null;
  },
  chair(parent, x, z, ry, mat) {
    const g = grp(parent, x, 0, z, ry);
    mk(Geo.box(0.45, 0.05, 0.45), mat, 0, 0.46, 0, g);
    mk(Geo.box(0.45, 0.55, 0.05), mat, 0, 0.75, -0.2, g);
    for (const [lx, lz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) mk(Geo.box(0.05, 0.46, 0.05), mat, lx * 0.19, 0.23, lz * 0.19, g);
    this.colRect(x, z, 0.5, 0.5, 0, { h: 0.9, low: true });
    return g;
  },
  chairKit(parent, kit, node, x, z, ry, mat) {
    if (!this.kit(kit, node, parent, x, 0, z, ry)) return this.chair(parent, x, z, ry, mat);
    this.colRect(x, z, 0.5, 0.5, 0, { h: 0.9, low: true });
    return null;
  },
  cabinet(parent, x, z, ry, w, d, h, mat, top = null, handles = true) {
    const g = grp(parent, x, 0, z, ry);
    mk(Geo.box(w, h, d), mat, 0, h / 2, 0, g);
    if (top) mk(Geo.box(w + 0.04, 0.05, d + 0.04), top, 0, h + 0.025, 0.02, g);
    const n = Math.max(1, Math.round(w / 0.6));
    for (let i = 0; i < n; i++) {
      const cx = -w / 2 + (i + 0.5) * (w / n);
      mk(Geo.box(w / n - 0.06, h - 0.16, 0.02), Mat.lam(0x000000, { p: { transparent: true, opacity: 0.18 } }), cx, h / 2, d / 2 + 0.005, g, { cast: false, receive: false });
      if (handles) mk(Geo.box(0.12, 0.025, 0.03), Mat.lam(0xb0a080), cx, h * 0.8, d / 2 + 0.02, g, { cast: false });
    }
    return g;
  },
  bookshelf(parent, x, z, ry, w, h) {
    const g = grp(parent, x, 0, z, ry);
    const wood = Mat.lam(0x3a2414);
    mk(Geo.box(w, h, 0.05), wood, 0, h / 2, -0.2, g);
    mk(Geo.box(0.05, h, 0.42), wood, -w / 2, h / 2, 0, g);
    mk(Geo.box(0.05, h, 0.42), wood, w / 2, h / 2, 0, g);
    const bt = bookTexture();
    for (let y = 0.05; y < h; y += 0.42) {
      mk(Geo.box(w, 0.04, 0.42), wood, 0, y, 0, g);
      if (y + 0.38 < h) mk(Geo.plane(w - 0.1, 0.34), Mat.tex(bt), 0, y + 0.2, 0.1, g, { cast: false });
    }
    mk(Geo.box(w, 0.05, 0.44), wood, 0, h, 0, g);
    this.colRect(x, z, w, 0.5, ry, { h, shots: true });
    return g;
  },
  pumpkinDecor(parent, x, y, z, r, color = 0xd8661a, face = false) {
    // kit pumpkins (radius 0.25 at scale 1): classic, tall deep orange, white, carved jack-o-lantern (face +Z)
    const node = face ? 'JackOLantern' : color === 0xe8e0c8 ? 'Pumpkin_White' : color === 0xc85a14 ? 'Pumpkin_Tall' : 'Pumpkin';
    const k = this.kit('props_common', node, parent, x, y, z, face ? 0 : rand(0, TAU), { s: r / 0.25 });
    if (k) return k;
    const g = grp(parent, x, y, z, rand(0, TAU));
    const m = Mat.lam(color);
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; mk(Geo.sph(r * 0.62, 10, 8), m, Math.cos(a) * r * 0.42, r * 0.8, Math.sin(a) * r * 0.42, g, { sy: 1.15 }); }
    mk(Geo.cyl(r * 0.08, r * 0.12, r * 0.4, 6), Mat.lam(0x4a5a1e), 0, r * 1.6, 0, g, { rz: 0.3 });
    if (face) {
      const fm = Mat.basic(0xffffff, { map: faceTexture('pumpkin', true), transparent: true, alphaTest: 0.4 });
      const f = mk(Geo.plane(r * 1.3, r * 1.3), fm, 0, r * 0.8, r * 0.94, g, { cast: false, receive: false });
      f.rotation.y = 0; g.rotation.y = 0;
    }
    return g;
  },
  // animated candle flame glow (billboards around y)
  flame(x, y, z) {
    const f = mk(Geo.plane(0.12, 0.2), Mat.glow(0xffb050, 0.9), x, y, z, this.dyn, { cast: false, receive: false });
    f.userData.flame = true; this.anim.push({ type: 'flame', m: f, seed: Math.random() * 10 });
    return f;
  },
  candle(parent, x, y, z, h = 0.18) {
    // kit pillar candle (Candle h 0.18, CandleTall h 0.25; scaled in y for other heights) + flame above the wick
    const tall = h > 0.19;
    const k = this.kit('props_common', tall ? 'CandleTall' : 'Candle', parent, x, y, z, rand(0, TAU), { s: [1, h / (tall ? 0.25 : 0.18), 1], cast: false });
    if (!k) mk(Geo.cyl(0.035, 0.04, h, 6), Mat.lam(0xe8dfc8), x, y + h / 2, z, parent, { cast: false });
    return this.flame(x, y + h + 0.06, z);
  },

  // ------------------------------------------------------------------
  buildHall() {
    const S = this.statics.hall, D = this.dyn, KH = 'props_hall';
    const dark = Mat.lam(0x3a2414), wood = Mat.tex(fabricTexture('wood'), { color: 0xc09070 });
    // staircase rising to the west along the north wall (the kit staircase is modelled in world coordinates)
    const steps = 12, sx0 = 0.15, sx1 = 7.3, sz0 = 12.15, sz1 = 13.65;
    const run = (sx1 - sx0) / steps;
    if (!this.kit(KH, 'Staircase', S)) {
      const stepMat = Mat.tex(floorTexture('wood'), { color: 0xd0b090 });
      for (let i = 0; i < steps; i++) {
        const x1 = sx1 - i * run, x0 = x1 - run, top = (i + 1) * (WALL_H / steps);
        mk(worldBox(x0, 0, sz0, x1, top, sz1, 0.5, 0.5), stepMat, 0, 0, 0, S);
        mk(worldBox(x0, top - 0.02, sz0, x0 + 0.06, top + 0.03, sz1, 1, 1), dark, 0, 0, 0, S, { cast: false });
      }
      // side panel (wainscot) on south face
      const panelMat = Mat.lam(0x3a2316);
      for (let i = 0; i < steps; i++) {
        const x1 = sx1 - i * run, x0 = x1 - run, top = (i + 1) * (WALL_H / steps);
        mk(worldBox(x0, 0, sz1, x1, top, sz1 + 0.04, 1, 1), panelMat, 0, 0, 0, S, { cast: false });
      }
      // banister + newel post
      mk(Geo.box(0.16, 1.25, 0.16), dark, sx1 - 0.08, 0.62, sz1 - 0.08, S);
      mk(Geo.sph(0.11, 8, 6), dark, sx1 - 0.08, 1.3, sz1 - 0.08, S);
      const rail = mk(Geo.box(Math.hypot(sx1 - sx0, WALL_H) + 0.2, 0.08, 0.08), dark, (sx0 + sx1) / 2, WALL_H / 2 + 1.0, sz1 - 0.08, S);
      rail.rotation.z = -Math.atan2(WALL_H, sx1 - sx0);
      for (let i = 1; i < steps; i += 1) {
        const x = sx1 - i * run - run * 0.5, top = (i + 1) * (WALL_H / steps);
        mk(Geo.box(0.04, 0.95, 0.04), dark, x, top + 0.47, sz1 - 0.08, S, { cast: false });
      }
    }
    this.addCol(sx0, sz0, sx1, sz1 + 0.1, { h: 3, shots: true });
    this.props.stairPanel = { x0: sx0, x1: sx1, z: sz1 + 0.04 };
    // boxes blocking the stairs bottom ("off limits")
    if (!this.kit(KH, 'StairBoxes', S, 7.75, 0, 12.6)) {
      mk(Geo.box(0.6, 0.5, 0.5), Mat.lam(0x8a6a44), 7.75, 0.25, 12.6, S);
      mk(Geo.box(0.5, 0.4, 0.45), Mat.lam(0x7a5a3a), 7.7, 0.7, 12.62, S, { ry: 0.3 });
    }
    this.addCol(7.4, 12.3, 8.1, 12.9, { h: 0.9 });
    // (only a line about the dark up there: anything else in reach here comes first, like the photo on the boxes)
    this.addInteract({ id: 'stairs', x: 7.8, z: 13.6, r: 1.2, pri: -1, label: 'Upstairs', enabled: () => G.state === 'play' && !G.arena, use: () => UI.toast(Lost.has('you') ? 'Upstairs is pitch black.<br>Something up there is standing very still, in a red flannel shirt.' : 'Upstairs is pitch black.<br>Whatever this is, it\'s happening down here.', 3200) });

    // wall sconces by the front door
    const sconce = (z) => {
      const k = this.wallKit(KH, 'Sconce', 'z', 0, z, 2.0, 1);
      if (k) return this.glowMats(k);
      const g = grp(D, 0.22, 2.0, z);
      mk(Geo.box(0.06, 0.25, 0.14), Mat.lam(0x6a5530), 0, 0, 0, g, { cast: false });
      const sm = this.lampShade(g, 0.14, 0.12, 0, 0.07, 0.1, 0.18, 0xf0d8a8);
      this.attach(g, 'z', 0, z);
      return [sm];
    };
    const s1 = sconce(16.5), s2 = sconce(19.2);
    this.addLight('hall', 0.6, 2.05, 16.5, 0xffc27a, 5, 7, { mats: s1, flicker: 0.05 });
    this.addLight('hall', 0.6, 2.05, 19.2, 0xffc27a, 5, 7, { mats: s2, flicker: 0.05 });
    // chandelier
    let chm;
    const chk = this.kit(KH, 'Chandelier', D, 7, 2.55, 18, 0, { cast: false });
    if (chk) chm = this.glowMats(chk);
    else {
      const ch = grp(D, 7, 2.55, 18);
      mk(Geo.cyl(0.01, 0.01, 0.5, 4), Mat.lam(0x222222), 0, 0.25, 0, ch, { cast: false });
      mk(Geo.torus(0.35, 0.03, 6, 16), Mat.lam(0x8a7040), 0, 0, 0, ch, { rx: Math.PI / 2, cast: false });
      const m = Mat.lam(0xffe0a0, { emissive: 0xffd080, ei: 1, unique: true });
      for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; mk(Geo.sph(0.06, 6, 5), m, Math.cos(a) * 0.35, 0.08, Math.sin(a) * 0.35, ch, { cast: false }); }
      chm = [m];
    }
    this.addLight('hall', 7, 2.4, 18, 0xffcf8a, 16, 13, { mats: chm, flicker: 0.03 });
    // coat rack
    if (!this.kit(KH, 'CoatRack', S, 0.6, 0, 15.6)) {
      const cr = grp(S, 0.6, 0, 15.6);
      mk(Geo.cyl(0.04, 0.05, 1.9, 6), dark, 0, 0.95, 0, cr);
      mk(Geo.cyl(0.25, 0.28, 0.05, 8), dark, 0, 0.03, 0, cr);
      mk(Geo.capsule(0.2, 0.7), Mat.lam(0x2a3a2a), 0.12, 1.25, 0.05, cr, { sz: 0.6 });
      mk(Geo.capsule(0.18, 0.6), Mat.lam(0x5a2a1a), -0.1, 1.3, -0.08, cr, { sz: 0.6 });
      mk(Geo.cyl(0.18, 0.2, 0.12, 10), Mat.lam(0x1a1a1a), 0, 1.92, 0, cr);
    }
    this.addCol(0.25, 15.3, 0.95, 15.95, { h: 2 });
    // umbrella stand
    if (!this.kit(KH, 'UmbrellaStand', S, 0.45, 0, 16.75)) {
      mk(Geo.cyl(0.13, 0.12, 0.5, 8), Mat.lam(0x3a4a5a), 0.45, 0.25, 16.75, S);
      mk(Geo.cyl(0.015, 0.015, 0.8, 4), Mat.lam(0x111111), 0.45, 0.6, 16.75, S, { rz: 0.15 });
    }
    // console table with candy bowl, flashlight and poker
    this.tableKit(S, KH, 'Table_ConsoleHall', 0.52, 20.2, 0.62, 1.6, 0.85, wood, dark);
    if (!this.kit(KH, 'CandyBowl', D, 0.5, 0.88, 20.45)) {
      const bowl = grp(D, 0.5, 0.88, 20.45);
      mk(Geo.sph(0.2, 10, 6), Mat.lam(0xd86a1a), 0, 0.05, 0, bowl, { sy: 0.5, cast: false });
      for (let i = 0; i < 8; i++) mk(Geo.box(0.06, 0.03, 0.04), Mat.lam(pick([0xff5fa0, 0xffd34a, 0x6ad06a, 0x8a5aff, 0xe8e8e8])), rand(-0.12, 0.12), 0.12, rand(-0.12, 0.12), bowl, { ry: rand(0, 3), cast: false });
    }
    this.props.flashlightItem = grp(D, 0.5, 0.92, 19.75, 0.4);
    const fli = itemModel('Flashlight', { s: 1.5, cast: false });
    if (fli) {
      fli.rotation.y = Math.PI / 2; // lens toward +x like the original, lying on the table top (0.88)
      fli.position.y = 0.88 + 0.027 * 1.5 - 0.92;
      for (const m of this.glowMats(fli)) m.emissiveIntensity = 0.05; // switched off
      this.props.flashlightItem.add(fli);
    } else {
      mk(Geo.cyl(0.05, 0.045, 0.3, 8), Mat.lam(0x2a2a30), 0, 0, 0, this.props.flashlightItem, { rz: Math.PI / 2, cast: false });
      mk(Geo.cyl(0.07, 0.05, 0.08, 8), Mat.lam(0xb0b0b0), 0.17, 0, 0, this.props.flashlightItem, { rz: Math.PI / 2, cast: false });
    }
    const pki = itemModel('Poker', { cast: false });
    if (pki) {
      // tip on the floor, ring handle up, leaning on the edge of the console table
      this.props.pokerItem = grp(D, 0.98, 0, 20.9, 0);
      pki.rotation.x = Math.PI / 2; pki.position.y = 0.962;
      this.props.pokerItem.add(pki);
      this.props.pokerItem.rotation.z = 0.14;
    } else {
      this.props.pokerItem = grp(D, 0.95, 0, 20.9, 0);
      const pk = mk(Geo.cyl(0.02, 0.02, 1.0, 5), Mat.lam(0x1a1a1e), 0, 0.5, 0, this.props.pokerItem, { cast: false });
      mk(Geo.box(0.12, 0.03, 0.03), Mat.lam(0x1a1a1e), 0.04, 0.95, 0, this.props.pokerItem, { cast: false });
      this.props.pokerItem.rotation.z = 0.32; void pk;
    }
    // mirror above the console
    if (!this.wallKit(KH, 'Mirror_90x70', 'z', 0, 20.2, 1.6, 1)) {
      const mirror = this.frame(0.9, 0.7, Tex.make('mirror', 32, 32, (g, w, h) => { const grd = g.createLinearGradient(0, 0, w, h); grd.addColorStop(0, '#5a6a72'); grd.addColorStop(1, '#2a3238'); g.fillStyle = grd; g.fillRect(0, 0, w, h); }), 0x5a4020);
      this.wallDecor('z', 0, 20.2, 1.6, 1, mirror);
    }
    // pumpkin patch display (photo 1 subject)
    if (!this.kit(KH, 'HayBale', S, 1.5, 0, 23.05)) {
      const hay = Mat.lam(0xb89a4a);
      mk(Geo.box(2.0, 0.75, 0.9), hay, 1.5, 0.375, 23.05, S);
      mk(Geo.box(2.02, 0.05, 0.92), Mat.lam(0x8a6a2a), 1.5, 0.3, 23.05, S, { cast: false });
    }
    this.addCol(0.5, 22.6, 2.5, 23.5, { h: 0.8, low: true });
    this.pumpkinDecor(S, 0.75, 0.75, 22.9, 0.22, 0xd8661a);
    this.pumpkinDecor(S, 2.25, 0.75, 23.2, 0.18, 0xe07a2a);
    this.pumpkinDecor(S, 2.9, 0, 23.4, 0.3, 0xc85a14);
    this.pumpkinDecor(S, 0.6, 0, 22.2, 0.2, 0xe8e0c8);
    if (!this.kit(KH, 'CornStalks', S, 0.53, 0, 23.7)) {
      for (let i = 0; i < 4; i++) mk(Geo.cyl(0.03, 0.05, 2.1, 5), Mat.lam(0x9a8a4a), 0.35 + i * 0.12, 1.05, 23.7, S, { rz: -0.1 + i * 0.07, cast: false });
    }
    // bench + shoes
    if (!this.kit(KH, 'Bench', S, 6, 0, 23.55)) {
      const bench = grp(S, 6, 0, 23.55);
      mk(Geo.box(2.0, 0.08, 0.45), wood, 0, 0.45, 0, bench);
      for (const lx of [-0.9, 0.9]) mk(Geo.box(0.08, 0.45, 0.4), dark, lx, 0.22, 0, bench);
    }
    this.addCol(5, 23.3, 7, 23.8, { h: 0.5, low: true });
    if (!this.kit(KH, 'Shoes', S, 5.7, 0, 23.05, 0, { cast: false })) {
      mk(Geo.box(0.3, 0.12, 0.12), Mat.lam(0x1a1a1a), 5.5, 0.06, 23.0, S, { ry: 0.4, cast: false });
      mk(Geo.box(0.3, 0.12, 0.12), Mat.lam(0x6a1a1a), 5.9, 0.06, 23.1, S, { ry: -0.2, cast: false });
    }
    // grandfather clock (pendulum + hands are animated child nodes)
    const clk = this.kit(KH, 'GrandfatherClock', S, 12.9, 0, 12.48);
    const pend = clk && this.keepObj(GLB.find(clk, 'Pendulum')), hands = clk && this.keepObj(GLB.find(clk, 'ClockHands'));
    if (pend && hands) this.anim.push({ type: 'pendulum', m: pend, hands });
    else {
      if (clk) S.remove(clk);
      const c = grp(S, 12.9, 0, 12.48);
      mk(Geo.box(0.7, 2.25, 0.45), dark, 0, 1.125, 0, c);
      mk(Geo.box(0.8, 0.12, 0.5), dark, 0, 2.3, 0, c);
      mk(Geo.cyl(0.24, 0.24, 0.04, 16), Mat.lam(0xe8dcc0, { emissive: 0x302820 }), 0, 1.85, 0.23, c, { rx: Math.PI / 2, cast: false });
      const pd = grp(D, 12.9, 1.55, 12.73);
      mk(Geo.box(0.02, 0.7, 0.02), Mat.lam(0xb09040), 0, -0.35, 0, pd, { cast: false });
      mk(Geo.cyl(0.09, 0.09, 0.02, 10), Mat.lam(0xd8b050), 0, -0.72, 0, pd, { rx: Math.PI / 2, cast: false });
      const hd = grp(D, 12.9, 1.85, 12.74);
      mk(Geo.box(0.015, 0.16, 0.01), Mat.lam(0x111111), 0, 0.07, 0, hd, { cast: false });
      this.anim.push({ type: 'pendulum', m: pd, hands: hd });
    }
    this.addCol(12.5, 12.2, 13.3, 12.75, { h: 2.4, shots: true });
    // side table + jack-o-lantern (its carved glow flickers with the candle light)
    this.tableKit(S, KH, 'Table_SideHall', 13.4, 16.0, 0.6, 0.6, 0.75, wood, dark);
    const jol = this.pumpkinDecor(D, 13.35, 0.78, 15.92, 0.2, 0xe07a2a, true);
    jol.rotation.y = -Math.PI / 2;
    this.addLight('hall', 13.2, 1.1, 16.0, 0xff8a2a, 3.5, 5, { flicker: 0.25, kind: 'candle', mats: this.glowMats(jol) });
    // rug runner (one texture over the whole 8.3 x 2 m runner)
    const runner = this.surf('rug_runner');
    if (runner) mk(flatRug(1.2, 16.8, 9.5, 18.8, 0.012), runner, 0, 0, 0, S, { cast: false });
    else mk(worldBox(1.2, 0, 16.8, 9.5, 0.015, 18.8, 0.25, 0.5), Mat.tex(rugTexture('runner')), 0, 0, 0, S, { cast: false });
    // plant
    if (!this.kit(KH, 'Plant_Hall', S, 8.3, 0, 12.6)) {
      mk(Geo.cyl(0.22, 0.17, 0.4, 8), Mat.lam(0x7a3a2a), 8.3, 0.2, 12.6, S);
      for (let i = 0; i < 6; i++) mk(Geo.cone(0.08, 0.7, 4), Mat.lam(0x2a4a22), 8.3 + rand(-0.1, 0.1), 0.65, 12.6 + rand(-0.1, 0.1), S, { rz: rand(-0.6, 0.6), rx: rand(-0.6, 0.6), cast: false });
    }
    this.addCol(8.05, 12.35, 8.55, 12.85, { h: 1 });
    // family photos
    const FR = ['Frame_40x50_A', 'Frame_40x50_B', 'Frame_40x50_C'];
    for (let i = 0; i < 3; i++) {
      const s = 13.4 + i * 0.9, y = 1.75 + (i % 2) * 0.25;
      if (!this.wallKit(KH, FR[i], 'z', 14, s, y, -1)) this.wallDecor('z', 14, s, y, -1, this.frame(0.4, 0.5, frameTexture(i)));
    }
    if (!this.wallKit(KH, 'Frame_50x60_A', 'x', 12, 8.6, 1.8, 1)) this.wallDecor('x', 12, 8.6, 1.8, 1, this.frame(0.5, 0.6, frameTexture(3)));
    // paper bats garland on north wall
    for (let i = 0; i < 7; i++) {
      const b = new THREE.Group();
      const bat = this.kit(KH, 'PaperBat', b, 0, 0, 0, 0, { rz: i % 2 ? 0.2 : -0.2, cast: false });
      if (!bat) mk(Geo.box(0.36, 0.12, 0.01), Mat.lam(0x0a0a0a), 0, 0, 0, b, { cast: false, rz: (i % 2 ? 0.2 : -0.2) });
      this.wallDecor('x', 12, 8.4 + (i % 4) * 0.4, 2.55 - (i % 3) * 0.15, 1, b, null, !!bat);
    }
    // windows
    this.windowAt(KH, 'Window_120x130', 'x', 24, 3.5, 1.6, -1, 1.2, 1.3);
    this.windowAt(KH, 'Window_120x130', 'x', 24, 10.5, 1.6, -1, 1.2, 1.3);
    // breakables
    this.addBreakable('vase', 13.48, 0.78, 16.18, 'hall');
    this.addBreakable('jar', 8.2, 0, 23.4, 'hall');
  },

  buildKitchen() {
    const S = this.statics.kitchen, D = this.dyn, KK = 'props_kitchen';
    const cab = Mat.lam(0x8a6a4a), top = Mat.lam(0xc8c0b0), almond = Mat.lam(0xd8ceb0);
    // north counter run
    if (!this.kit(KK, 'Counter_370', S, 2.0, 0, 0.48)) this.cabinet(S, 2.0, 0.48, 0, 3.7, 0.65, 0.9, cab, top);
    if (!this.kit(KK, 'Counter_200', S, 5.6, 0, 0.48)) this.cabinet(S, 5.6, 0.48, 0, 2.0, 0.65, 0.9, cab, top);
    if (!this.kit(KK, 'Counter_220', S, 8.45, 0, 0.48)) this.cabinet(S, 8.45, 0.48, 0, 2.2, 0.65, 0.9, cab, top);
    this.addCol(0.15, 0.15, 9.6, 0.82, { h: 0.95 });
    // sink (kit: a sink base fills the 0.75 m gap between the counters, the sink sits in its top)
    let sinkX = 4.55;
    if (this.hasKit(KK, 'Sink') && this.hasKit(KK, 'Counter_Sink')) {
      sinkX = 4.225;
      this.kit(KK, 'Counter_Sink', S, sinkX, 0, 0.48);
      this.kit(KK, 'Sink', S, sinkX, 0.95, 0.48);
    } else {
      mk(Geo.box(0.8, 0.05, 0.45), Mat.lam(0x6a6e72), 4.55, 0.93, 0.48, S, { cast: false });
      mk(Geo.cyl(0.02, 0.02, 0.35, 5), Mat.lam(0xb0b4b8), 4.55, 1.1, 0.25, S, { cast: false });
      mk(Geo.box(0.04, 0.04, 0.2), Mat.lam(0xb0b4b8), 4.55, 1.27, 0.33, S, { cast: false });
    }
    // stove + pot
    if (this.kit(KK, 'Stove', S, 7.0, 0, 0.5)) this.kit(KK, 'Pot', S, 6.82, 0.94, 0.62);
    else {
      const st = grp(S, 7.0, 0, 0.5);
      mk(Geo.box(0.78, 0.92, 0.66), almond, 0, 0.46, 0, st);
      mk(Geo.box(0.6, 0.4, 0.02), Mat.lam(0x1a1a1a), 0, 0.42, 0.335, st, { cast: false });
      for (const [bx, bz] of [[-0.18, -0.15], [0.18, -0.15], [-0.18, 0.12], [0.18, 0.12]]) mk(Geo.cyl(0.1, 0.1, 0.02, 10), Mat.lam(0x222222), bx, 0.93, bz, st, { cast: false });
      mk(Geo.box(0.78, 0.3, 0.06), almond, 0, 1.06, -0.3, st);
      mk(Geo.cyl(0.16, 0.14, 0.2, 10), Mat.lam(0x6a2a1a), -0.18, 1.04, 0.12, st, { cast: false });
    }
    // upper cabinets (not over the window)
    if (!this.kit(KK, 'UpperCab_260', S, 1.6, 1.65, 0.33)) this.cabinet(S, 1.6, 0.33, 0, 2.6, 0.36, 0.75, cab).position.y = 1.65;
    if (!this.kit(KK, 'UpperCab_360', S, 7.4, 1.65, 0.33)) this.cabinet(S, 7.4, 0.33, 0, 3.6, 0.36, 0.75, cab).position.y = 1.65;
    // window over sink
    this.sinkX = sinkX;
    this.windowAt(KK, 'Window_130x90', 'x', 0, sinkX, 1.75, 1, 1.3, 0.9);
    // fridge
    if (!this.kit(KK, 'Fridge', S, 10.5, 0, 0.52)) {
      const fr = grp(S, 10.5, 0, 0.52);
      mk(Geo.box(0.95, 1.9, 0.72), almond, 0, 0.95, 0, fr);
      mk(Geo.box(0.9, 0.02, 0.02), Mat.lam(0x8a8270), 0, 1.3, 0.37, fr, { cast: false });
      mk(Geo.box(0.04, 0.35, 0.04), Mat.lam(0x8a8270), -0.38, 1.55, 0.38, fr, { cast: false });
      mk(Geo.box(0.04, 0.35, 0.04), Mat.lam(0x8a8270), -0.38, 0.95, 0.38, fr, { cast: false });
      const mags = [0xff3a3a, 0x3a8aff, 0xffd34a, 0x5ad05a];
      for (let i = 0; i < 6; i++) mk(Geo.box(0.07, 0.07, 0.02), Mat.lam(mags[i % 4]), rand(-0.3, 0.3), rand(1.4, 1.8), 0.37, fr, { cast: false });
      mk(Geo.plane(0.28, 0.22), Mat.tex(posterTexture(1)), 0.12, 1.55, 0.37, fr, { cast: false });
    }
    this.addCol(10.0, 0.15, 11.0, 0.9, { h: 1.9, shots: true });
    // west counter with microwave + toaster (appliances stand on the 0.95 m counter top)
    if (!this.kit(KK, 'Counter_440', S, 0.48, 0, 3.4, Math.PI / 2)) this.cabinet(S, 0.48, 3.4, Math.PI / 2, 4.4, 0.65, 0.9, cab, top);
    this.addCol(0.15, 0.82, 0.82, 5.6, { h: 0.95 });
    if (!this.kit(KK, 'Microwave', S, 0.5, 0.95, 2.0, Math.PI / 2)) {
      const mw = grp(S, 0.5, 0.92, 2.0, Math.PI / 2);
      mk(Geo.box(0.6, 0.35, 0.42), Mat.lam(0xe8e2d0), 0, 0.175, 0, mw);
      mk(Geo.box(0.38, 0.24, 0.02), Mat.lam(0x1a1e1e, { emissive: 0x0a1410 }), -0.07, 0.175, 0.215, mw, { cast: false });
      mk(Geo.box(0.12, 0.05, 0.02), Mat.basic(0x5aff7a), 0.2, 0.28, 0.215, mw, { cast: false });
    }
    if (!this.kit(KK, 'Toaster', S, 0.5, 0.95, 4.4)) mk(Geo.box(0.32, 0.2, 0.2), Mat.lam(0xb8b8bc), 0.5, 1.02, 4.4, S);
    this.windowAt(KK, 'Window_120x90', 'z', 0, 3.7, 1.75, 1, 1.2, 0.9);
    // table + chairs + cake
    const cloth = Mat.tex(Tex.make('cloth', 32, 32, (g) => { for (let y = 0; y < 32; y += 8) for (let x = 0; x < 32; x += 8) { g.fillStyle = ((x + y) / 8) % 2 ? '#b3242a' : '#efe6d2'; g.fillRect(x, y, 8, 8); } }));
    this.tableKit(S, KK, 'Table_Kitchen', 3.7, 7.8, 2.2, 1.5, 0.76, Mat.lam(0x6a4a2a), Mat.lam(0x3a2414), cloth);
    this.chairKit(S, KK, 'Chair_Kitchen', 2.9, 6.75, 0, Mat.lam(0x5a3a22));
    this.chairKit(S, KK, 'Chair_Kitchen', 4.5, 6.75, 0, Mat.lam(0x5a3a22));
    this.chairKit(S, KK, 'Chair_Kitchen', 2.9, 8.85, Math.PI, Mat.lam(0x5a3a22));
    this.chairKit(S, KK, 'Chair_Kitchen', 4.5, 8.85, Math.PI, Mat.lam(0x5a3a22));
    if (this.kit(KK, 'Cake', S, 3.5, 0.8, 7.8)) this.flame(3.5, 1.14, 7.8); // the kit cake has its own candle (wick top 1.1)
    else {
      const cake = grp(S, 3.5, 0.8, 7.8);
      mk(Geo.cyl(0.25, 0.25, 0.18, 14), Mat.lam(0xff8a2a), 0, 0.09, 0, cake, { cast: false });
      mk(Geo.cyl(0.26, 0.26, 0.03, 14), Mat.lam(0x2a1a10), 0, 0.17, 0, cake, { cast: false });
      mk(Geo.cyl(0.32, 0.32, 0.02, 14), Mat.lam(0xe8e8e8), 0, 0.0, 0, cake, { cast: false });
      this.candle(S, 3.5, 0.98, 7.8, 0.1);
    }
    // candy jars (photo 2 subject)
    const jarG = (x, col) => {
      const g = grp(S, x, 0.95, 0.42);
      mk(Geo.cyl(0.14, 0.14, 0.34, 12), Mat.lam(0xcfe0e0, { p: { transparent: true, opacity: 0.35 } }), 0, 0.17, 0, g, { cast: false });
      for (let i = 0; i < 9; i++) mk(Geo.sph(0.045, 6, 4), Mat.lam(pick(col)), rand(-0.07, 0.07), 0.05 + Math.floor(i / 3) * 0.07, rand(-0.07, 0.07), g, { cast: false });
      mk(Geo.cyl(0.15, 0.15, 0.05, 12), Mat.lam(0xd8402a), 0, 0.36, 0, g, { cast: false });
    };
    if (!this.kit(KK, 'CandyJar_A', S, 8.15, 0.95, 0.42)) jarG(8.15, [0xff5fa0, 0xffffff, 0x8ae0c0]);
    if (!this.kit(KK, 'CandyJar_B', S, 9.2, 0.95, 0.42)) jarG(9.2, [0xffd34a, 0xff7a1a, 0xffffff]);
    // ceiling light (fluorescent) + under cabinet light
    let flm;
    const flk = this.kit(KK, 'FluorescentLight', D, 7, 2.94, 6, 0, { cast: false });
    if (flk) flm = this.glowMats(flk);
    else flm = [mk(Geo.box(1.4, 0.06, 0.4), Mat.lam(0xf0f4ff, { emissive: 0xe0eaff, ei: 1, unique: true }), 7, 2.94, 6, D, { cast: false }).material];
    this.addLight('kitchen', 7, 2.6, 6, 0xdde8ff, 9.5, 13, { mats: flm, flicker: 0.06, kind: 'tube' });
    this.addLight('kitchen', 7.4, 1.45, 0.75, 0xffcf8a, 3, 4, { flicker: 0.02 });
    // trash + broom
    if (!this.kit(KK, 'TrashCan', S, 13.4, 0, 0.6)) mk(Geo.cyl(0.22, 0.2, 0.7, 10), Mat.lam(0x4a4a4e), 13.4, 0.35, 0.6, S);
    this.addCol(13.15, 0.35, 13.65, 0.85, { h: 0.7 });
    if (!this.kit(KK, 'Broom', S, 13.75, 0, 2.2, 0, { cast: false })) mk(Geo.cyl(0.02, 0.02, 1.4, 4), Mat.lam(0x8a6a3a), 13.75, 0.7, 2.2, S, { rz: 0.15, cast: false });
    // calendar + clock
    if (!this.wallKit(KK, 'Calendar', 'z', 14, 2.6, 1.7, -1)) this.wallDecor('z', 14, 2.6, 1.7, -1, this.frame(0.45, 0.62, posterTexture(2), 0xd8d0c0));
    if (!this.wallKit(KK, 'WallClock', 'x', 12, 5.0, 2.2, -1)) {
      const wc = new THREE.Group();
      mk(Geo.cyl(0.25, 0.25, 0.05, 16), Mat.lam(0xf0ead8), 0, 0, 0, wc, { rx: Math.PI / 2, cast: false });
      mk(Geo.torus(0.25, 0.03, 4, 16), Mat.lam(0xb3242a), 0, 0, 0, wc, { cast: false });
      this.wallDecor('x', 12, 5.0, 2.2, -1, wc);
    }
    // breakables
    this.addBreakable('plate', 1.9, 0.95, 0.5, 'kitchen');
    this.addBreakable('jar', 0.5, 0.95, 4.9, 'kitchen');
    this.addBreakable('vase', 4.3, 0.8, 8.2, 'kitchen');
  },

  buildLiving() {
    const S = this.statics.living, D = this.dyn, KL = 'props_living';
    const dark = Mat.lam(0x2e1a10);
    // fireplace
    if (!this.kit(KL, 'Fireplace', S, 22, 0, 0.55)) {
      const brick = Mat.tex(fabricTexture('brick'));
      const fp = grp(S, 22, 0, 0.55);
      mk(Geo.box(3.0, 1.25, 0.8), brick, 0, 0.625, 0, fp);
      mk(Geo.box(1.4, 0.85, 0.1), Mat.lam(0x080606), 0, 0.43, 0.36, fp, { cast: false });
      mk(Geo.box(3.3, 0.1, 1.0), dark, 0, 1.3, 0.05, fp);
      mk(Geo.box(2.0, 1.7, 0.6), brick, 0, 2.2, -0.1, fp);
      mk(Geo.box(3.2, 0.05, 1.3), Mat.lam(0x4a3a30), 0, 0.02, 0.45, fp, { cast: false });
    }
    this.addCol(20.5, 0.15, 23.5, 1.0, { h: 1.3 });
    // fire (dynamic): kit logs + embers glow with the fire light, flames stay animated glow planes
    const fire = grp(D, 22, 0.15, 0.75);
    const logs = this.kit(KL, 'FireLogs', fire, 0, 0, 0, 0, { cast: false });
    const fireMats = logs ? this.glowMats(logs) : [];
    if (!logs) for (let i = 0; i < 3; i++) mk(Geo.cyl(0.06, 0.07, 0.7, 6), Mat.lam(0x3a2414), -0.3 + i * 0.3, 0.05, 0, fire, { rz: Math.PI / 2, ry: rand(-0.4, 0.4), cast: false });
    const flames = [];
    for (let i = 0; i < 5; i++) { const f = mk(Geo.plane(0.5, 0.7), Mat.glow(i % 2 ? 0xff7a1a : 0xffb040, 0.85), -0.4 + i * 0.2, 0.32, 0.05 + i * 0.01, fire, { cast: false, receive: false }); flames.push(f); }
    this.anim.push({ type: 'fire', flames, seed: 1 });
    this.props.fire = fire;
    this.addLight('living', 22, 0.7, 1.4, 0xff8a3a, 14, 11, { flicker: 0.35, kind: 'fire', mats: fireMats });
    // mantle decor: candles, empty poker stand
    this.candle(S, 20.9, 1.35, 0.6); this.candle(S, 23.1, 1.35, 0.6);
    if (!this.kit(KL, 'PokerStand', S, 23.85, 0, 1.05)) {
      mk(Geo.box(0.06, 0.6, 0.06), dark, 23.85, 0.3, 1.05, S);
      mk(Geo.box(0.3, 0.03, 0.03), dark, 23.85, 0.62, 1.05, S, { cast: false });
    }
    // bookshelf
    if (this.kit(KL, 'Bookshelf_240', S, 16.2, 0, 0.4)) this.colRect(16.2, 0.4, 2.4, 0.5, 0, { h: 2.2, shots: true });
    else this.bookshelf(S, 16.2, 0.4, 0, 2.4, 2.2);
    // armchair with plushies (photo 3 subject sits in the middle of the seat)
    const fab = Mat.tex(fabricTexture('plaidSofa'));
    if (this.kit(KL, 'Armchair', S, 16.8, 0, 2.9)) this.colRect(16.8, 2.9, 1.1, 1.0, 0, { h: 0.9 });
    else this.armchair(S, 16.8, 2.9, 0, Mat.lam(0x6a2a2a));
    const plushAt = (x, y, z, col, s, ry) => {
      const g = grp(S, x, y, z, ry);
      const pm = Mat.lam(col);
      mk(Geo.sph(0.15 * s, 8, 6), pm, 0, 0.15 * s, 0, g, { sy: 1.1 });
      mk(Geo.sph(0.12 * s, 8, 6), pm, 0, 0.38 * s, 0.02, g);
      mk(Geo.sph(0.05 * s, 6, 4), pm, -0.09 * s, 0.48 * s, 0, g);
      mk(Geo.sph(0.05 * s, 6, 4), pm, 0.09 * s, 0.48 * s, 0, g);
      mk(Geo.sph(0.02 * s, 4, 3), Mat.lam(0x111111), -0.04 * s, 0.4 * s, 0.11 * s, g, { cast: false });
      mk(Geo.sph(0.02 * s, 4, 3), Mat.lam(0x111111), 0.04 * s, 0.4 * s, 0.11 * s, g, { cast: false });
    };
    // kit plushies sit on the arm rolls (top ~0.73) so the photo-3 critter in the middle of the seat stays in view
    if (!this.kit(KL, 'Plush_A', S, 16.33, 0.73, 2.75, 0.5)) plushAt(16.45, 0.6, 2.75, 0x9a7048, 1, 0.3);
    if (!this.kit(KL, 'Plush_B', S, 17.27, 0.73, 2.62, -0.5)) plushAt(17.2, 0.6, 2.8, 0x7a5a8a, 0.9, -0.3);
    if (!this.kit(KL, 'Plush_C', S, 16.8, 1.04, 2.53, 0)) plushAt(16.75, 1.05, 2.45, 0xc9b07a, 0.75, 0);
    // floor lamp
    let flm;
    const flk = this.kit(KL, 'FloorLamp', D, 15.3, 0, 3.9);
    if (flk) flm = this.glowMats(flk);
    else {
      const fl = grp(D, 15.3, 0, 3.9);
      mk(Geo.cyl(0.18, 0.2, 0.04, 10), dark, 0, 0.02, 0, fl);
      mk(Geo.cyl(0.02, 0.02, 1.55, 5), Mat.lam(0x8a7040), 0, 0.78, 0, fl, { cast: false });
      flm = [this.lampShade(fl, 0, 1.6, 0, 0.17, 0.27, 0.32, 0xe8c890)];
    }
    this.addCol(15.1, 3.7, 15.5, 4.1, { h: 1.7 });
    this.addLight('living', 15.3, 1.55, 3.9, 0xffc27a, 7, 8, { mats: flm, flicker: 0.02 });
    // TV corner (the screen keeps the animated canvas texture)
    if (!this.kit(KL, 'TVStand', S, 28.5, 0, 0.75)) this.cabinet(S, 28.5, 0.75, 0, 1.6, 0.6, 0.55, Mat.lam(0x3a2414), Mat.lam(0x2a1a10), false);
    this.addCol(27.7, 0.3, 29.4, 1.05, { h: 1.2 });
    const tvTex = tvTexture();
    const screenMat = Mat.basic(0xffffff, { map: tvTex, unique: true });
    const tvk = this.kit(KL, 'CRTTV', D, 28.5, 0.6, 0.75);
    const scr = tvk && GLB.find(tvk, 'TVScreen');
    if (scr) {
      scr.material = screenMat; scr.castShadow = false;
      tvTex.flipY = false; // glTF uv convention (v = 0 at the top)
      this.kit(KL, 'VCR', S, 28.2, 0.36, 0.75);
      this.kit(KL, 'VHSTapes', S, 27.5, 0, 1.4, 0.25, { cast: false });
      this.props.tvWhole = tvk;
    } else {
      if (tvk) D.remove(tvk);
      const tvg = grp(D, 28.5, 0.6, 0.75);
      this.props.tvWhole = tvg;
      mk(Geo.box(0.95, 0.72, 0.62), Mat.lam(0x2a2a2c), 0, 0.36, -0.02, tvg);
      mk(Geo.plane(0.72, 0.54), screenMat, -0.06, 0.38, 0.295, tvg, { cast: false, receive: false });
      mk(Geo.cyl(0.006, 0.006, 0.5, 3), Mat.lam(0x888888), 0.2, 0.9, -0.1, tvg, { rz: 0.5, cast: false });
      mk(Geo.cyl(0.006, 0.006, 0.5, 3), Mat.lam(0x888888), 0.3, 0.9, -0.1, tvg, { rz: -0.4, cast: false });
      mk(Geo.box(0.5, 0.09, 0.32), Mat.lam(0x1a1a1a), -0.2, -0.06, 0.1, tvg, { cast: false }); // VCR
      mk(Geo.box(0.08, 0.02, 0.01), Mat.basic(0x40ff70), -0.06, -0.05, 0.27, tvg, { cast: false });
      for (let i = 0; i < 4; i++) mk(Geo.box(0.2, 0.04, 0.11), Mat.lam(pick([0x111111, 0x1a1a3a, 0x3a1a1a])), 27.5 + rand(-0.1, 0.1), 0.02 + i * 0.04, 1.4 + rand(-0.05, 0.05), S, { ry: rand(-0.3, 0.3), cast: false });
    }
    this.props.tv = { tex: tvTex, mat: screenMat, mesh: scr || null };
    // the same set once the poker has gone through the screen, and the glass on the carpet: hidden until then (TVSmash)
    const tvb = this.kit('tv_broken', 'CRTTV_Broken', D, 28.5, 0.6, 0.75);
    if (tvb) { tvb.visible = false; this.props.tvBroken = tvb; this.props.tvCavity = this.glowMats(tvb, /^GlowCavity/); }
    const tvgl = this.kit('tv_broken', 'GlassShards', D, 28.44, 0, 1.08, 0, { cast: false });
    if (tvgl) { tvgl.visible = false; this.props.tvGlass = tvgl; }
    this.props.tvLight = this.addLight('living', 28.4, 1.1, 1.6, 0x8aa0ff, 4, 6, { flicker: 0.3, kind: 'tv' });
    // sofa against east wall facing west
    if (this.kit(KL, 'Sofa_340', S, 29.35, 0, 5.8, -Math.PI / 2)) this.colRect(29.35, 5.8, 3.4 + 0.2, 1.05, -Math.PI / 2, { h: 0.95 });
    else this.sofa(S, 29.35, 5.8, -Math.PI / 2, 3.4, fab);
    // coffee table
    this.tableKit(S, KL, 'Table_Coffee', 26.5, 5.8, 1.3, 2.0, 0.45, Mat.lam(0x5a3a22), dark);
    if (!this.kit(KL, 'Bowl', S, 26.4, 0.48, 5.3, 0, { cast: false })) mk(Geo.sph(0.18, 8, 5), Mat.lam(0xe8e0c8), 26.4, 0.55, 5.3, S, { sy: 0.45, cast: false });
    if (!this.kit(KL, 'Remote', S, 26.6, 0.48, 6.4, 0.4, { cast: false })) mk(Geo.box(0.2, 0.04, 0.11), Mat.lam(0x111111), 26.6, 0.5, 6.4, S, { ry: 0.4, cast: false });
    // side table + lamp
    this.tableKit(S, KL, 'Table_SideLiving', 29.4, 8.4, 0.6, 0.6, 0.6, Mat.lam(0x5a3a22), dark);
    let tlm;
    const tlk = this.kit(KL, 'TableLamp', D, 29.4, 0.63, 8.4);
    if (tlk) tlm = this.glowMats(tlk);
    else {
      const tl = grp(D, 29.4, 0.62, 8.4);
      mk(Geo.cyl(0.08, 0.12, 0.3, 8), Mat.lam(0x7a8a6a), 0, 0.15, 0, tl, { cast: false });
      tlm = [this.lampShade(tl, 0, 0.45, 0, 0.13, 0.2, 0.25, 0xe8d0a0)];
    }
    this.addLight('living', 29.3, 1.1, 8.4, 0xffc27a, 6, 8, { mats: tlm, flicker: 0.02 });
    // rocking chair
    if (!this.kit(KL, 'RockingChair', S, 25.0, 0, 2.2, -0.5)) {
      const rc = grp(S, 25.0, 0, 2.2, -0.5);
      const rw = Mat.lam(0x4a2a16);
      mk(Geo.box(0.55, 0.05, 0.5), rw, 0, 0.45, 0, rc);
      mk(Geo.box(0.55, 0.7, 0.05), rw, 0, 0.82, -0.25, rc);
      for (const lx of [-0.27, 0.27]) { mk(Geo.torus(0.6, 0.025, 4, 12, 1.2), rw, lx, 0.62, 0, rc, { ry: Math.PI / 2, rz: Math.PI + 0.97, cast: false }); mk(Geo.box(0.04, 0.45, 0.04), rw, lx, 0.22, 0.2, rc); mk(Geo.box(0.04, 0.45, 0.04), rw, lx, 0.22, -0.2, rc); }
    }
    this.addCol(24.65, 1.85, 25.35, 2.55, { h: 1, low: true });
    // braided rug (one round texture stretched over the oval)
    const rugM = this.surf('rug_braided', { alphaTest: 0.5 }) || Mat.tex(rugTexture('braided'));
    const rug = mk(Geo.circle(1, 48), rugM, 21.5, 0.012, 6.2, S, { rx: -Math.PI / 2, cast: false });
    rug.scale.set(3.8, 2.6, 1);
    // toy chest + toys
    if (!this.kit(KL, 'ToyChest', S, 14.62, 0, 9.4, Math.PI / 2)) this.cabinet(S, 14.62, 9.4, Math.PI / 2, 1.2, 0.6, 0.6, Mat.lam(0x8a3a2a), Mat.lam(0x6a2a1a), false);
    this.addCol(14.3, 8.8, 14.95, 10.0, { h: 0.65 });
    if (!this.kit(KL, 'ToyBlocks', S, 15.37, 0, 9.2, 0.3, { cast: false })) {
      mk(Geo.box(0.2, 0.2, 0.2), Mat.lam(0x3a8aff), 15.3, 0.1, 9.0, S, { ry: 0.5 });
      mk(Geo.box(0.2, 0.2, 0.2), Mat.lam(0xffd34a), 15.45, 0.1, 9.4, S, { ry: 0.2 });
      mk(Geo.box(0.2, 0.2, 0.2), Mat.lam(0xff3a3a), 15.35, 0.3, 9.2, S, { ry: 0.9 });
    }
    // plant
    if (!this.kit(KL, 'Plant_Large', S, 14.65, 0, 11.35)) {
      mk(Geo.cyl(0.25, 0.2, 0.5, 8), Mat.lam(0x8a4a2a), 14.65, 0.25, 11.35, S);
      for (let i = 0; i < 9; i++) mk(Geo.cone(0.1, 0.9, 4), Mat.lam(0x2a5a22), 14.65 + rand(-0.15, 0.15), 0.8, 11.35 + rand(-0.15, 0.15), S, { rz: rand(-0.8, 0.8), rx: rand(-0.8, 0.8), cast: false });
    }
    this.addCol(14.35, 11.05, 14.95, 11.75, { h: 1.2 });
    // windows + frames
    this.windowAt('props_hall', 'Window_120x130', 'x', 0, 18.5, 1.6, 1, 1.2, 1.3);
    this.windowAt('props_hall', 'Window_120x130', 'x', 0, 25.7, 1.6, 1, 1.2, 1.3);
    this.windowAt(KL, 'Window_110x120', 'z', 30, 10.4, 1.6, -1, 1.1, 1.2);
    if (!this.wallKit(KL, 'Frame_80x60', 'x', 12, 18.0, 1.8, -1)) this.wallDecor('x', 12, 18.0, 1.8, -1, this.frame(0.8, 0.6, frameTexture(4)));
    // breakables (the vase stands on the mantel shelf in front of the chimney breast)
    this.addBreakable('vase', 22.6, 1.35, 0.92, 'living');
    this.addBreakable('jar', 26.9, 0.48, 6.4, 'living');
    this.addBreakable('box', 14.9, 0, 7.6, 'living');
  },

  buildBedroom() {
    const S = this.statics.bedroom, D = this.dyn, KB = 'props_bedroom';
    const wood = Mat.lam(0x6a4a2a), dark = Mat.lam(0x3a2414);
    // bed (headboard on east wall)
    if (!this.kit(KB, 'Bed', S, 28.35, 0, 16.5, -Math.PI / 2)) {
      const bed = grp(S, 28.35, 0, 16.5, -Math.PI / 2);
      mk(Geo.box(2.2, 0.35, 2.95), wood, 0, 0.18, 0, bed);
      mk(Geo.box(2.1, 0.25, 2.85), Mat.lam(0xe8e2d0), 0, 0.47, 0, bed);
      mk(Geo.box(2.18, 0.08, 2.1), Mat.tex(fabricTexture('quilt')), 0, 0.62, 0.38, bed);
      mk(Geo.box(2.2, 0.24, 0.05), Mat.tex(fabricTexture('quilt')), 0, 0.5, 1.43, bed, { cast: false });
      mk(Geo.box(0.8, 0.14, 0.45), Mat.lam(0xf0ece0), -0.5, 0.66, -1.1, bed);
      mk(Geo.box(0.8, 0.14, 0.45), Mat.lam(0xf0ece0), 0.5, 0.66, -1.1, bed);
      mk(Geo.box(2.3, 1.25, 0.1), dark, 0, 0.62, -1.5, bed);
      mk(Geo.box(2.3, 0.6, 0.08), dark, 0, 0.3, 1.5, bed);
    }
    this.addCol(26.85, 15.35, 29.85, 17.65, { h: 0.7, low: true });
    // nightstands + lamps (kit lamps stand a little toward the wall so the alarm clock fits beside)
    const ns = (z, lz) => {
      if (!this.kit(KB, 'Nightstand', S, 29.55, 0, z, -Math.PI / 2)) this.cabinet(S, 29.55, z, -Math.PI / 2, 0.6, 0.55, 0.6, wood, dark, true);
      this.addCol(29.25, z - 0.32, 29.85, z + 0.32, { h: 0.65 });
      const lk = this.kit(KB, 'BedsideLamp', D, 29.6, 0.65, lz);
      if (lk) return this.glowMats(lk);
      const lg = grp(D, 29.55, 0.62, z);
      mk(Geo.cyl(0.06, 0.1, 0.25, 8), Mat.lam(0xb0a080), 0, 0.12, 0, lg, { cast: false });
      return [this.lampShade(lg, 0, 0.38, 0, 0.11, 0.17, 0.22, 0xf0d8b0)];
    };
    const l1 = ns(14.75, 14.85), l2 = ns(18.25, 18.25);
    this.addLight('bedroom', 29.4, 1.15, 14.75, 0xffc890, 5, 7, { mats: l1, flicker: 0.02 });
    this.addLight('bedroom', 29.4, 1.15, 18.25, 0xffc890, 5, 7, { mats: l2, flicker: 0.02 });
    // alarm clock
    if (!this.kit(KB, 'AlarmClock', S, 29.47, 0.65, 14.55, -Math.PI / 2, { cast: false })) {
      mk(Geo.box(0.22, 0.1, 0.1), Mat.lam(0x1a1a1a), 29.5, 0.67, 14.55, S, { ry: -Math.PI / 2, cast: false });
      mk(Geo.plane(0.16, 0.06), Mat.basic(0xff2a2a), 29.44, 0.68, 14.55, S, { ry: -Math.PI / 2, cast: false, receive: false });
    }
    // nightlight (ghost signature)
    let nlm;
    const nlk = this.wallKit(KB, 'Nightlight', 'z', 30, 19.1, 0.38, -1);
    if (nlk) nlm = this.glowMats(nlk);
    else {
      const nl = grp(D, 29.82, 0.38, 19.1, -Math.PI / 2);
      mk(Geo.box(0.12, 0.16, 0.04), Mat.lam(0xe8e2d0), 0, 0, 0, nl, { cast: false });
      const m = Mat.lam(0xfff0a0, { emissive: 0xffe070, ei: 1.2, unique: true });
      mk(Geo.sph(0.07, 8, 6), m, 0, 0.02, 0.05, nl, { cast: false, sz: 0.6 });
      this.attach(nl, 'z', 30, 19.1);
      nlm = [m];
    }
    this.addLight('bedroom', 29.5, 0.45, 19.1, 0xffe070, 1.6, 4, { mats: nlm, kind: 'night' });
    // wardrobe (its doors open: the Boogeyman lives in it)
    this.props.wardrobe = this.kit(KB, 'Wardrobe', S, 15.9, 0, 12.55);
    if (!this.props.wardrobe) {
      const wd = grp(S, 15.9, 0, 12.55);
      mk(Geo.box(1.7, 2.2, 0.7), dark, 0, 1.1, 0, wd);
      mk(Geo.box(0.02, 2.0, 0.02), Mat.lam(0x111111), 0, 1.1, 0.36, wd, { cast: false });
      mk(Geo.sph(0.035, 5, 4), Mat.lam(0xc9a25a), -0.08, 1.15, 0.37, wd, { cast: false });
      mk(Geo.sph(0.035, 5, 4), Mat.lam(0xc9a25a), 0.08, 1.15, 0.37, wd, { cast: false });
    }
    this.addCol(15.05, 12.15, 16.75, 12.92, { h: 2.2, shots: true });
    // dresser + lava lamp
    if (!this.kit(KB, 'Dresser', S, 18.9, 0, 12.47)) this.cabinet(S, 18.9, 12.47, 0, 1.8, 0.55, 1.0, wood, dark);
    this.addCol(18.0, 12.15, 19.8, 12.78, { h: 1.0 });
    let lavaM;
    const lvk = this.kit(KB, 'LavaLamp', D, 19.5, 1.05, 12.5, 0, { cast: false });
    const blobs = lvk ? ['LavaBlob1', 'LavaBlob2', 'LavaBlob3'].map((n) => this.keepObj(GLB.find(lvk, n))).filter(Boolean) : [];
    if (lvk && blobs.length) {
      lavaM = this.glowMats(lvk);
      this.anim.push({ type: 'lava', blobs, y0: 0.17, yr: 0.23 });
    } else {
      if (lvk) D.remove(lvk);
      const lava = grp(D, 19.5, 1.03, 12.5);
      mk(Geo.cone(0.09, 0.15, 8), Mat.lam(0x8a8a90), 0, 0.075, 0, lava, { rx: Math.PI, cast: false });
      const lavaGlass = Mat.lam(0xff40a0, { emissive: 0xc02070, ei: 1, unique: true });
      mk(Geo.cyl(0.05, 0.08, 0.32, 8), lavaGlass, 0, 0.31, 0, lava, { cast: false });
      const bl = [0, 1, 2].map((i) => mk(Geo.sph(0.035, 6, 4), Mat.lam(0xffe060, { emissive: 0xffa020 }), 0, 0.2 + i * 0.08, 0, lava, { cast: false }));
      this.anim.push({ type: 'lava', blobs: bl });
      lavaM = [lavaGlass];
    }
    this.addLight('bedroom', 19.5, 1.5, 12.8, 0xff60b0, 1.8, 4, { mats: lavaM, kind: 'night' });
    if (!this.wallKit(KB, 'Mirror_70x50', 'x', 12, 18.9, 1.75, 1)) this.wallDecor('x', 12, 18.9, 1.75, 1, this.frame(0.7, 0.5, Tex.make('mirror2', 32, 32, (g, w, h) => { const grd = g.createLinearGradient(0, 0, w, h); grd.addColorStop(0, '#6a7a82'); grd.addColorStop(1, '#2a3238'); g.fillStyle = grd; g.fillRect(0, 0, w, h); }), 0x6a4a2a));
    // posters (on the east wall, over the guitar and the amp in the corner by the window)
    if (!this.wallKit(KB, 'Poster_Grunge', 'z', 30, 22.62, 1.85, -1)) this.wallDecor('z', 30, 22.62, 1.85, -1, this.frame(0.55, 0.78, posterTexture(0), 0x111111));
    if (!this.wallKit(KB, 'Poster_Space', 'z', 30, 23.4, 1.75, -1)) this.wallDecor('z', 30, 23.4, 1.75, -1, this.frame(0.55, 0.78, posterTexture(1), 0x111111));
    // the arcade machine by the door to the living room, where the low shelf stood (it is in the corner by the amp)
    this.buildArcade();
    // desk with 90s PC (south wall); the kit PC faces the room, the swivel chair faces the desk
    if (this.kit(KB, 'Desk', S, 18.0, 0, 23.45, Math.PI)) this.kit(KB, 'PC90s', S, 18.0, 0.765, 23.45, Math.PI);
    else {
      const desk = grp(S, 18.0, 0, 23.45, Math.PI);
      mk(Geo.box(1.6, 0.05, 0.7), wood, 0, 0.74, 0, desk);
      for (const lx of [-0.75, 0.75]) mk(Geo.box(0.05, 0.74, 0.66), dark, lx, 0.37, 0, desk);
      mk(Geo.box(0.42, 0.4, 0.42), Mat.lam(0xd8cfb8), -0.2, 0.97, 0.05, desk);
      mk(Geo.plane(0.3, 0.24), Mat.basic(0x1a3a6a), -0.2, 0.99, -0.17, desk, { ry: Math.PI, cast: false, receive: false });
      mk(Geo.box(0.2, 0.42, 0.45), Mat.lam(0xd8cfb8), 0.5, 0.98, 0.05, desk);
      mk(Geo.box(0.45, 0.03, 0.16), Mat.lam(0xd8cfb8), -0.2, 0.78, -0.22, desk, { cast: false });
    }
    this.addCol(17.2, 23.1, 18.8, 23.85, { h: 1.2 });
    if (this.kit(KB, 'Chair_Desk', S, 18.0, 0, 22.6, 0)) this.colRect(18.0, 22.6, 0.5, 0.5, 0, { h: 0.9, low: true });
    else this.chair(S, 18.0, 22.6, Math.PI, Mat.lam(0x2a2a3a));
    // blue rug (one texture over the 5 x 6 m rug)
    const blue = this.surf('rug_blue');
    if (blue) mk(flatRug(19.5, 15.5, 24.5, 21.5, 0.012), blue, 0, 0, 0, S, { cast: false });
    else mk(worldBox(19.5, 0, 15.5, 24.5, 0.012, 21.5, 0.4, 0.33), Mat.tex(rugTexture('blue')), 0, 0, 0, S, { cast: false });
    // ceiling lamp
    let clm;
    const clk = this.kit(KB, 'CeilingLamp', D, 22, 3.0, 18, 0, { cast: false });
    if (clk) clm = this.glowMats(clk);
    else clm = [mk(Geo.sph(0.3, 12, 6, 0, TAU, 0, Math.PI / 2), Mat.lam(0xf0e0c0, { emissive: 0xffe0a0, ei: 0.9, unique: true }), 22, 2.98, 18, D, { rx: Math.PI, cast: false }).material];
    this.addLight('bedroom', 22, 2.5, 18, 0xffd0a0, 9.5, 13, { mats: clm, flicker: 0.03 });
    // laundry (the boombox stands on the stereo cabinet: buildClutter)
    if (!this.kit(KB, 'LaundryBasket', S, 21.6, 0, 23.35, 0.3)) {
      mk(Geo.cyl(0.3, 0.25, 0.5, 10), Mat.lam(0xd8d0b8), 21.6, 0.25, 23.35, S);
      mk(Geo.sph(0.25, 6, 4), Mat.lam(0x3a5a8a), 21.6, 0.55, 23.35, S, { sy: 0.4 });
    }
    // windows
    this.windowAt('props_living', 'Window_110x120', 'z', 30, 21.2, 1.6, -1, 1.1, 1.2);
    this.windowAt('props_hall', 'Window_120x130', 'x', 24, 25.0, 1.6, -1, 1.2, 1.3);
    // breakables
    this.addBreakable('piggy', 18.4, 1.05, 12.45, 'bedroom');
    this.addBreakable('box', 23.5, 0, 23.3, 'bedroom');
  },

  // The arcade machine: Sir Falls-A-Lot: Halloween Edition (sirfallsalot.js). Its marquee, coin lights and screen
  // glow and throw a violet light on the floor in front of it; the screen plays the attract mode (ArcadeScreen) and
  // E plays the game (Arcade)
  buildArcade() {
    const S = this.statics.bedroom, x = 21.9, z = 12.6;
    let glow = [], screenMat = null, screen = null;
    const cab = this.kit('arcade', 'ArcadeCabinet', S, x, 0, z, 0);
    if (cab) {
      glow = this.glowMats(cab, /^(Marquee|CoinGlow|ButtonStart|ArcadeScreen)$/);
      screenMat = glow.find((m) => m.name === 'ArcadeScreen') || null;
      screen = GLB.find(cab, 'Screen');
    }
    if (!screenMat) {
      // (no model: a plain cabinet, the same size, its screen tilted back like the real one's)
      if (cab) S.remove(cab);
      const g = grp(S, x, 0, z), body = Mat.lam(0x1c1026), edge = Mat.lam(0xff7a1a, { emissive: 0x5a1c00, ei: 1, unique: true });
      mk(Geo.box(0.62, 1.84, 0.6), body, 0, 0.92, -0.12, g);
      mk(Geo.box(0.66, 0.1, 0.36), body, 0, 0.88, 0.24, g);
      for (const sx of [-1, 1]) mk(Geo.box(0.02, 1.84, 0.62), edge, sx * 0.32, 0.92, -0.11, g, { cast: false });
      const mq = Mat.lam(0x2a0a3a, { emissive: 0xff8a2a, ei: 0.8, unique: true });
      mk(Geo.box(0.6, 0.2, 0.02), mq, 0, 1.72, 0.19, g, { cast: false });
      screenMat = Mat.lam(0x000000, { emissive: 0xffffff, ei: 1.25, unique: true, rough: 0.15 });
      const pg = new THREE.PlaneGeometry(0.33, 0.44), uv = pg.attributes.uv;
      for (let i = 0; i < uv.count; i++) uv.setY(i, 1 - uv.getY(i)); // (glTF uv convention, like the model's)
      screen = mk(pg, screenMat, 0, 1.32, 0.105, g, { rx: -0.255, cast: false });
      for (const m of [edge, mq, screenMat]) m.userData.baseEI = m.emissiveIntensity;
      glow = [edge, mq, screenMat];
    }
    // the screen's centre and the way it faces (the camera leans in to it: Arcade)
    const C = Arcade.C, N = Arcade.N;
    screen.updateWorldMatrix(true, true);
    new THREE.Box3().setFromObject(screen).getCenter(C);
    let n = 0; _v3.set(0, 0, 0);
    screen.traverse((o) => {
      const na = o.isMesh && o.geometry.attributes.normal; if (!na) return;
      _v2.set(0, 0, 0); for (let i = 0; i < na.count; i++) _v2.x += na.getX(i), _v2.y += na.getY(i), _v2.z += na.getZ(i);
      if (_v2.lengthSq() > 1e-8) { _v3.add(_v2.transformDirection(o.matrixWorld)); n++; }
    });
    if (n && _v3.lengthSq() > 1e-8) N.copy(_v3).normalize(); else N.set(0, Math.sin(0.255), Math.cos(0.255));
    this.colRect(x, z, 0.7, 0.86, 0, { h: 1.84 });
    // (a satin screen: the lamps of the room don't burn white spots into the picture. The machine's light hangs over
    // the marquee, out of its own screen's reflection)
    screenMat.roughness = Math.max(screenMat.roughness, 0.42);
    for (const m of glow) if (m.name === 'Marquee' && m.userData.baseEI != null) m.userData.baseEI *= 0.8;
    const L = this.addLight('bedroom', C.x + N.x * 0.3, 1.95, C.z + 0.38, 0x8a62ff, 2.0, 3.8, { mats: glow, kind: 'night', flicker: 0.04 });
    L.noShadow = true;
    ArcadeScreen.init(screenMat);
    this.props.arcade = { root: cab, x, z, light: L, screenMat };
  },

  buildBasement() {
    const S = this.statics.basement, D = this.dyn, KB = 'props_basement';
    const R = ROOMS.basement;
    // stairs (rising north along west wall; the kit stairs are modelled in world coordinates)
    if (!this.kit(KB, 'BasementStairs', S)) {
      const stepMat = Mat.tex(fabricTexture('wood'), { color: 0x8a7a6a });
      for (let i = 0; i < 10; i++) {
        const z1 = 7.6 - i * 0.55, z0 = z1 - 0.55, top = (i + 1) * 0.3;
        mk(worldBox(60.15, 0, z0, 61.7, top, z1, 0.5, 0.5), stepMat, 0, 0, 0, S);
      }
      mk(Geo.box(0.08, 1.0, 0.08), Mat.lam(0x2a1a10), 61.75, 0.5, 7.55, S);
    }
    this.addCol(60.15, 2.0, 61.75, 7.6, { h: 3, shots: true });
    this.basementStairs = this.addInteract({ id: 'upstairs', x: 61.0, z: 8.2, r: 1.2, label: 'Go upstairs', enabled: () => G.flags.basementCleared, use: () => Game.leaveBasement() });
    // the red stair door glow at the top
    mk(Geo.plane(1.2, 2.0), Mat.basic(0x601010, { opacity: 0.8, transparent: true }), 60.95, 4.0, 2.25, S, { cast: false, receive: false });
    // pillars
    for (const [px, pz] of [[66, 8], [74, 8], [66, 14.5], [74, 14.5]]) {
      // squat stone piers (low enough to see over from above)
      if (!this.kit(KB, 'StonePier', S, px, 0, pz)) {
        mk(worldBox(px - 0.45, 0, pz - 0.45, px + 0.45, 1.35, pz + 0.45, 1, 1, 1 / WALL_H), Mat.tex(wallTexture('basement')), 0, 0, 0, S);
        mk(worldBox(px - 0.52, 1.35, pz - 0.52, px + 0.52, 1.45, pz + 0.52, 1, 1), Mat.lam(0x2a2622), 0, 0, 0, S);
      }
      this.candle(S, px + 0.2, 1.45, pz + 0.15, 0.2);
      this.addCol(px - 0.45, pz - 0.45, px + 0.45, pz + 0.45, { h: 1.45, shots: true });
    }
    // furnace (its fire grate glows with the furnace light)
    let fuM = [];
    const fu = this.kit(KB, 'Furnace', S, 78.4, 0, 3.4);
    if (fu) fuM = this.glowMats(fu);
    else {
      const f = grp(S, 78.4, 0, 3.4);
      mk(Geo.cyl(0.9, 1.0, 2.2, 12), Mat.lam(0x3a3632), 0, 1.1, 0, f);
      mk(Geo.cyl(0.18, 0.18, 1.2, 8), Mat.lam(0x2a2826), 0, 2.6, 0, f);
      mk(Geo.box(0.6, 0.35, 0.05), Mat.basic(0xff6a1a), 0, 0.6, 0.98, f, { cast: false, receive: false });
    }
    this.addCol(77.4, 2.4, 79.6, 4.4, { h: 2.4, shots: true });
    this.addLight('basement', 78.4, 0.8, 4.8, 0xff6a2a, 9, 9, { flicker: 0.3, kind: 'fire', mats: fuM });
    // shelves with jars
    for (const [x0, z0, ry] of [[64.5, 2.45, 0], [79.6, 10.5, -Math.PI / 2]]) {
      if (!this.kit(KB, 'JarShelf', S, x0, 0, z0, ry)) {
        const sh = grp(S, x0, 0, z0, ry);
        const sw = Mat.lam(0x3a2a1a);
        for (let y = 0.4; y < 2.2; y += 0.55) mk(Geo.box(2.4, 0.05, 0.45), sw, 0, y, 0, sh);
        for (const lx of [-1.18, 1.18]) mk(Geo.box(0.06, 2.1, 0.45), sw, lx, 1.05, 0, sh);
        for (let y = 0.45; y < 2.2; y += 0.55) for (let k = 0; k < 7; k++) mk(Geo.cyl(0.08, 0.08, 0.22, 6), Mat.lam(pick([0x5a7a3a, 0x8a5a2a, 0x6a2a2a, 0x3a5a6a]), { p: { transparent: true, opacity: 0.85 } }), -1.0 + k * 0.33, y + 0.13, 0, sh, { cast: false });
      }
      this.colRect(x0, z0, 2.4, 0.5, ry, { h: 2.2, shots: true });
    }
    // polaroid wall: 170 small faded polaroids
    const atlas = Assets.tex.polaroids_atlas;
    if (atlas) {
      // one merged mesh, each quad picks one of the 4 x 4 atlas cells (texture flipY: image top = v 1)
      const N = 170, pos = [], nor = [], uv = [], idx = [];
      const q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), v = new THREE.Vector3(), n = new THREE.Vector3();
      const hw = 0.11, hh = 0.135;
      for (let i = 0; i < N; i++) {
        const onNorth = i < 110;
        const out = WALL_T / 2 + 0.004 + i * 0.0008; // later ones overlap the earlier ones
        if (onNorth) p.set(68 + Math.random() * 9, 0.8 + Math.random() * 1.9, R.z0 + out);
        else p.set(R.x0 + out, 0.8 + Math.random() * 1.9, 9.5 + Math.random() * 9);
        q.setFromEuler(e.set(0, onNorth ? 0 : Math.PI / 2, rand(-0.35, 0.35)));
        n.set(0, 0, 1).applyQuaternion(q);
        const cell = Math.floor(Math.random() * 16), cx = cell % 4, cy = Math.floor(cell / 4);
        const u0 = cx / 4, u1 = (cx + 1) / 4, v1 = 1 - cy / 4, v0 = 1 - (cy + 1) / 4;
        const base = pos.length / 3;
        for (const [x, y, uu, vv] of [[-hw, -hh, u0, v0], [hw, -hh, u1, v0], [hw, hh, u1, v1], [-hw, hh, u0, v1]]) {
          v.set(x, y, 0).applyQuaternion(q).add(p);
          pos.push(v.x, v.y, v.z); nor.push(n.x, n.y, n.z); uv.push(uu, vv);
        }
        idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
      }
      const pg = new THREE.BufferGeometry();
      pg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      pg.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
      pg.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
      pg.setIndex(idx);
      mk(pg, new THREE.MeshStandardMaterial({ map: atlas.map, roughness: 0.55, metalness: 0 }), 0, 0, 0, D, { cast: false });
    } else {
      // (fallback) instanced canvas polaroids
      const polGeo = new THREE.PlaneGeometry(0.22, 0.27);
      const polTex = Tex.make('polaroidMini', 16, 20, (g, w, h, rng) => {
        g.fillStyle = '#e8e2d2'; g.fillRect(0, 0, w, h);
        g.fillStyle = '#2a2622'; g.fillRect(1, 1, w - 2, w - 2);
        g.fillStyle = 'rgba(120,90,70,.6)'; g.fillRect(4 + rng() * 6, 4 + rng() * 4, 3, 7);
      }, { clamp: true });
      const N = 170;
      const im = new THREE.InstancedMesh(polGeo, Mat.tex(polTex), N);
      const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(1, 1, 1), p = new THREE.Vector3();
      for (let i = 0; i < N; i++) {
        const onNorth = i < 110;
        if (onNorth) p.set(68 + Math.random() * 9, 0.8 + Math.random() * 1.9, R.z0 + WALL_T / 2 + 0.02);
        else p.set(R.x0 + WALL_T / 2 + 0.02, 0.8 + Math.random() * 1.9, 9.5 + Math.random() * 9);
        q.setFromEuler(new THREE.Euler(0, onNorth ? 0 : Math.PI / 2, rand(-0.35, 0.35)));
        p.x += onNorth ? 0 : 0.002 * i; p.z += onNorth ? 0.002 * i : 0;
        m4.compose(p, q, sc); im.setMatrixAt(i, m4);
      }
      im.castShadow = false; im.receiveShadow = true;
      D.add(im);
    }
    // ritual circle
    const circleTex = Assets.tex.ritual_circle ? Assets.tex.ritual_circle.map : rugTexture('circle');
    const circ = mk(Geo.plane(7, 7), Mat.basic(0xffffff, { map: circleTex, transparent: true, opacity: 0.75, unique: true }), 70, 0.015, 11.25, D, { rx: -Math.PI / 2, cast: false, receive: false });
    this.props.circle = circ;
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; this.candle(S, 70 + Math.cos(a) * 3.7, 0, 11.25 + Math.sin(a) * 3.7, 0.25); }
    this.addLight('basement', 70, 0.8, 11.25, 0xff7a3a, 10, 11, { flicker: 0.25, kind: 'candle' });
    this.props.circleLight = this.addLight('basement', 70, 1.2, 11.25, 0xff1a1a, 0, 12, { flicker: 0.2, kind: 'circle' });
    // bare bulbs hanging from the ceiling
    const bulb = (x, z) => {
      const k = this.kit(KB, 'HangingBulb', D, x, WALL_H, z, rand(0, TAU), { cast: false });
      if (k) return this.glowMats(k);
      const bm = Mat.lam(0xfff0c0, { emissive: 0xffe0a0, ei: 1, unique: true });
      mk(Geo.cyl(0.005, 0.005, 0.6, 3), Mat.lam(0x111111), x, 2.7, z, D, { cast: false });
      mk(Geo.sph(0.07, 6, 5), bm, x, 2.38, z, D, { cast: false });
      return [bm];
    };
    this.addLight('basement', 70, 2.3, 6.5, 0xffe0a0, 10, 12, { mats: bulb(70, 6.5), flicker: 0.12 });
    this.addLight('basement', 72, 2.3, 16.5, 0xffd890, 8, 11, { mats: bulb(72, 16.5), flicker: 0.2 });
    this.addLight('basement', 62.5, 2.2, 15.0, 0x8090ff, 4, 9, { kind: 'night' });
    // crates, barrels, sheet-covered chair, trunk
    for (const [cx, cz, s] of [[62.6, 18.6, 0.8], [63.5, 18.9, 0.6], [62.8, 17.6, 0.55], [78.6, 18.6, 0.9]]) {
      if (!this.kit(KB, 'Crate', S, cx, 0, cz, rand(-0.3, 0.3), { s })) mk(Geo.box(s, s, s), Mat.lam(0x6a4a2a), cx, s / 2, cz, S, { ry: rand(-0.3, 0.3) });
      this.addCol(cx - s / 2, cz - s / 2, cx + s / 2, cz + s / 2, { h: s });
    }
    for (const [bx, bz] of [[77.2, 18.9], [76.4, 19.1]]) {
      if (!this.kit(KB, 'Barrel', S, bx, 0, bz, rand(0, TAU))) mk(Geo.cyl(0.35, 0.35, 0.95, 10), Mat.lam(0x4a3020), bx, 0.48, bz, S);
      this.addCol(bx - 0.35, bz - 0.35, bx + 0.35, bz + 0.35, { h: 1 });
    }
    if (!this.kit(KB, 'SheetChair', S, 63.0, 0, 11.5, Math.PI / 2)) {
      const sheet = grp(S, 63.0, 0, 11.5, Math.PI / 2);
      mk(Geo.sph(0.6, 8, 6), Mat.lam(0xb8b2a4), 0, 0.6, 0, sheet, { sy: 1.1 });
    }
    this.addCol(62.4, 10.9, 63.6, 12.1, { h: 1.2 });
    if (!this.kit(KB, 'Trunk', S, 72.0, 0, 19.4, Math.PI)) this.cabinet(S, 72.0, 19.4, Math.PI, 1.4, 0.7, 0.7, Mat.lam(0x4a2a1a), Mat.lam(0x2a1a10), false);
    this.addCol(71.3, 19.0, 72.7, 19.85, { h: 0.75 });
    // chains
    for (const [cx, cz] of [[68, 9], [72, 13.5], [76, 12]]) {
      if (!this.kit(KB, 'HangingChain', S, cx, WALL_H, cz, rand(0, TAU), { cast: false })) for (let k = 0; k < 6; k++) mk(Geo.torus(0.05, 0.012, 4, 8), Mat.lam(0x3a3a3a), cx, 2.9 - k * 0.09, cz, S, { ry: k % 2 ? Math.PI / 2 : 0, cast: false });
    }
    this.addBreakable('box', 64.5, 0, 18.9, 'basement');
    this.addBreakable('jar', 75.5, 0, 2.7, 'basement');
  },

  buildExterior() {
    const E = this.statics.ext, D = this.ext, KE = 'props_exterior';
    // ground (below house floor level), 4 m grass tiles
    const grass = this.surf('ground_grass');
    const gg = new THREE.PlaneGeometry(220, 160);
    if (grass) { const uv = gg.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 55, uv.getY(i) * 40); }
    const ground = mk(gg, grass || Mat.tex(floorTexture('grass')), 15, -0.45, 12, D, { rx: -Math.PI / 2, cast: false });
    if (!grass) ground.material.map.repeat.set(55, 40);
    // foundation band (stone); its top stays just below the room floors (coplanar faces z-fight)
    mk(worldBox(-0.15, -0.45, -0.15, 30.15, -0.008, 24.15, 1, 1), this.surf('stone_pier', { color: 0xa8a29a }) || Mat.lam(0x3a3632), 0, 0, 0, E, { cast: false });
    // porch deck
    const deck = this.surf('floor_porch') || Mat.tex(floorTexture('porch'));
    mk(worldBox(-4.6, -0.45, 13.4, -0.15, 0, 22.6, 0.5, 0.5), deck, 0, 0, 0, E, { cast: false });
    for (let i = 0; i < 2; i++) mk(worldBox(-5.0 - i * 0.4, -0.45, 16.7, -4.6 - i * 0.4, -0.15 - i * 0.15, 19.3, 0.5, 0.5), deck, 0, 0, 0, E, { cast: false });
    // posts + rails (the kit railing is modelled in world coordinates); colliders unchanged
    const railKit = this.kit(KE, 'PorchRailing', E);
    const white = Mat.lam(0xd8d2c4);
    if (!railKit) for (const z of [13.55, 16.6, 19.4, 22.45]) mk(Geo.box(0.18, 2.95, 0.18), white, -4.45, 1.47, z, E);
    for (const [z0, z1] of [[13.55, 16.6], [19.4, 22.45]]) {
      if (!railKit) {
        mk(worldBox(-4.5, 0.85, z0, -4.4, 0.92, z1, 1, 1), white, 0, 0, 0, E);
        for (let z = z0 + 0.2; z < z1; z += 0.22) mk(Geo.box(0.05, 0.8, 0.05), white, -4.45, 0.45, z, E, { cast: false });
      }
      this.addCol(-4.55, z0, -4.35, z1, { h: 1, room: 'porch' });
    }
    for (const [x0, x1, z] of [[-4.5, -0.15, 13.45], [-4.5, -0.15, 22.55]]) {
      if (!railKit) mk(worldBox(x0, 0.85, z - 0.05, x1, 0.92, z + 0.05, 1, 1), white, 0, 0, 0, E);
      this.addCol(x0, z - 0.1, x1, z + 0.1, { h: 1, room: 'porch' });
    }
    this.addCol(-6.5, 16.6, -4.55, 19.4, { h: 1, room: 'porch' }); // steps are closed off: no running away
    // porch roof: shingles on top, painted boards underneath (rows run along the eave)
    const roofM = this.surf('roof_shingles') || Mat.tex(floorTexture('roof'));
    const boards = this.surf('floor_porch', { color: 0x8c8780 });
    const prg = worldBox(-5.0, 2.95, 13.2, -0.1, 3.05, 22.8, 0.5, 0.5);
    if (boards) {
      const uv = prg.attributes.uv;
      for (let i = 8; i < 16; i++) { const u = uv.getX(i); uv.setX(i, uv.getY(i)); uv.setY(i, u); } // top + bottom faces: u along z
      mk(prg, [boards, boards, roofM, boards, boards, boards], 0, 0, 0, this.roof, { cast: false });
    } else mk(prg, roofM, 0, 0, 0, this.roof, { cast: false });
    // porch light lantern (glass glows with the porch light)
    let lanM;
    const lanK = this.kit(KE, 'PorchLantern', D, -0.15, 2.3, 16.75, -Math.PI / 2, { cast: false });
    if (lanK) lanM = this.glowMats(lanK);
    else {
      const lan = grp(D, -0.28, 2.3, 16.75);
      mk(Geo.box(0.18, 0.3, 0.18), Mat.lam(0x1a1a1a), 0, 0, 0, lan, { cast: false });
      const m = Mat.lam(0xffe0a0, { emissive: 0xffc070, ei: 1.2, unique: true });
      mk(Geo.box(0.13, 0.22, 0.13), m, 0, 0, 0, lan, { cast: false });
      lanM = [m];
    }
    this.props.porchLight = this.addLight('porch', -0.7, 2.2, 16.8, 0xffb860, 5.5, 9, { mats: lanM, flicker: 0.18 });
    // jack-o-lanterns on the steps (carved glow flickers with their candle light)
    const jom = [];
    for (const [jx, jy, jz, jr, jc, jry] of [[-4.85, -0.15, 16.4, 0.24, 0xd8661a, -Math.PI / 2], [-4.85, -0.15, 19.6, 0.2, 0xe07a2a, -Math.PI / 2], [-3.8, 0, 21.9, 0.28, 0xc85a14, -Math.PI / 2 - 0.4]]) {
      const j = this.pumpkinDecor(D, jx, jy, jz, jr, jc, true); j.rotation.y = jry;
      jom.push(...this.glowMats(j));
    }
    this.addLight('porch', -4.4, 0.4, 18.0, 0xff8a2a, 4, 5, { flicker: 0.3, kind: 'candle', mats: jom });
    // porch rocker + doormat
    if (!this.kit(KE, 'PorchRocker', E, -2.8, 0, 21.5, Math.PI / 2 + 0.4)) {
      const rk = grp(E, -2.8, 0, 21.5, Math.PI / 2 + 0.4);
      mk(Geo.box(0.55, 0.05, 0.5), Mat.lam(0x6a6a62), 0, 0.45, 0, rk);
      mk(Geo.box(0.55, 0.8, 0.05), Mat.lam(0x6a6a62), 0, 0.85, -0.25, rk);
    }
    if (!this.kit(KE, 'Doormat', E, -0.6, 0, 17.8, -Math.PI / 2, { cast: false })) mk(Geo.box(0.7, 0.01, 1.0), Mat.lam(0x5a3a1a), -0.6, 0.01, 17.8, E, { cast: false });
    // house exterior facade: windows lit
    this.litWins = [];
    const litWin = (x, y, z, ry, w, h, key = null) => {
      const g = grp(D, x, y, z, ry);
      mk(Geo.box(w + 0.2, h + 0.2, 0.08), Mat.lam(0xd8d0c0), 0, 0, 0, g, { cast: false });
      const wm = Mat.lam(0xffc070, { emissive: 0xffb050, ei: 0.8, unique: true });
      mk(Geo.plane(w, h), wm, 0, 0, 0.05, g, { cast: false });
      // (the glass is merged into the static yard later: remember where it is, 4 mm in front of it)
      this.litWins.push({ key, w, h, y, ry, pos: new THREE.Vector3(x + Math.sin(ry) * 0.054, y, z + Math.cos(ry) * 0.054) });
      // a window comes and goes with its wall (no frames left floating when the top-down view cuts the wall away)
      const u = ry === 0 ? this.wallUnit('x', 24, x) : Math.abs(ry) > 3 ? this.wallUnit('x', 0, x) : this.wallUnit('z', 0, z);
      if (u) u.decorGroup.attach(g);
      return g;
    };
    litWin(-0.2, 1.75, 3.7, -Math.PI / 2, 1.2, 0.9, 'kitchen');
    litWin(-0.2, 1.6, 14.5, -Math.PI / 2, 1.0, 1.3, 'hallA');
    litWin(-0.2, 1.6, 21.3, -Math.PI / 2, 1.0, 1.3, 'hallB');
    // the side of the house (the hall and the bedroom windows)
    for (const wx of [3.5, 10.5, 25.0]) litWin(wx, 1.6, 24.2, 0, 1.2, 1.3);
    litWin(this.sinkX || 4.55, 1.75, -0.2, Math.PI, 1.3, 0.9);
    litWin(18.5, 1.6, -0.2, Math.PI, 1.2, 1.3);
    litWin(25.7, 1.6, -0.2, Math.PI, 1.2, 1.3);
    // roof (gable, ridge along x at z=12), shingles in 2 m tiles with rows along the ridge
    const ridgeY = ROOF_RIDGE, eave = ROOF_EAVE;
    const slopeLen = Math.hypot(12 + eave, ridgeY - WALL_H);
    const ang = Math.atan2(ridgeY - WALL_H, 12 + eave);
    for (const side of [-1, 1]) {
      const rg = new THREE.BoxGeometry(31.4, 0.12, slopeLen);
      if (Assets.tex.roof_shingles) boxMeterUV(rg, 0.5, side);
      const r = mk(rg, roofM, 15, (ridgeY + WALL_H) / 2, 12 + side * (12 + eave) / 2, this.roof, { cast: false });
      r.rotation.x = side * ang;
      if (!Assets.tex.roof_shingles) r.material.map.repeat.set(1, 1);
    }
    // gable triangles (siding, 1 m tiles: the shape uvs are in meters) at both ends
    const gab = new THREE.Shape(); gab.moveTo(-12, 0); gab.lineTo(12, 0); gab.lineTo(0, ridgeY - WALL_H); gab.closePath();
    const gGeo = new THREE.ShapeGeometry(gab);
    const sid = this.surf('wall_outside', { side: THREE.DoubleSide }) || Mat.tex(wallTexture('outside'), { side: THREE.DoubleSide });
    for (const x of [-0.16, 30.16]) { const m = mk(gGeo, sid, x, WALL_H, 12, this.roof, { ry: -Math.PI / 2, cast: false }); m.scale.set(1, 1, 1); }
    const attic = Mat.lam(0xffb050, { emissive: 0xff9a30, ei: 0.4, unique: true });
    mk(Geo.circle(0.45, 16), attic, -0.2, 5.0, 12, this.roof, { ry: -Math.PI / 2, cast: false });
    this.atticWindow = attic;
    // (after the last lost photo: something stands in it, arms out, in a hat)
    const scm = new THREE.MeshBasicMaterial({ map: scarecrowSilhouetteTexture(), color: 0x0d0805, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -8 });
    this.atticFigure = mk(Geo.plane(0.9, 0.9), scm, -0.205, 5.0, 12, this.roof, { ry: -Math.PI / 2, cast: false, receive: false });
    this.atticFigure.visible = false;
    // chimney (1 m brick tiles)
    mk(worldBox(21.2, 3, 0.0, 22.8, ridgeY + 0.6, 1.4, 1, 1), this.surf('brick') || Mat.tex(fabricTexture('brick')), 0, 0, 0, this.roof);
    // yard: path, fence, tree, gravestones, mailbox
    mk(worldBox(-19, -0.44, 17.2, -5.4, -0.42, 18.8, 0.5, 0.5), this.surf('path_stone') || Mat.tex(floorTexture('path')), 0, 0, 0, E, { cast: false });
    if (this.hasKit(KE, 'FenceSection')) {
      // 2 m picket sections along z at x = -20 (pickets face the street), open where the path meets the fence
      for (let z0 = -1; z0 < 39; z0 += 2) if (z0 !== 17) this.kit(KE, 'FenceSection', E, -20, -0.45, z0, -Math.PI / 2, { cast: false });
    } else {
      const fenceM = Mat.lam(0xcfc8b8);
      for (let z = -2; z < 38; z += 0.4) { if (z > 16.8 && z < 19.2) continue; mk(Geo.box(0.08, 1.0, 0.12), fenceM, -20, 0.05, z, E, { cast: false }); }
      mk(worldBox(-20.05, 0.2, -2, -19.95, 0.28, 38, 1, 1), fenceM, 0, 0, 0, E, { cast: false });
    }
    const deadTree = (parent, x, z, ry = 0, s = 1) => {
      if (this.kit(KE, 'DeadTree', parent, x, -0.45, z, ry, { s })) return;
      const tree = grp(parent, x, -0.45, z, ry); tree.scale.setScalar(s);
      const bark = Mat.lam(0x1a1512);
      const branch = (par, len, rad, depth) => {
        mk(Geo.cyl(rad * 0.65, rad, len, 5), bark, 0, len / 2, 0, par, { cast: true });
        if (depth <= 0) return;
        const n = depth > 2 ? 3 : 2;
        for (let i = 0; i < n; i++) {
          const c = grp(par, 0, len * (0.65 + i * 0.12), 0, i * 2.1 + rand(-0.5, 0.5));
          c.rotation.z = rand(0.45, 0.85) * (i % 2 ? 1 : -1);
          branch(c, len * rand(0.55, 0.72), rad * 0.62, depth - 1);
        }
      };
      branch(tree, 3.6, 0.42, 4);
    };
    deadTree(D, -12, 8);
    // a few more in the side yard and behind the house (the right side of the title shot). They stand where the
    // top-down camera looks over the house, so they only show in the outdoor views (Main.tick)
    const TT = this.titleTrees = new THREE.Group(); TT.userData.keep = true; Render.scene.add(TT);
    for (const [tx, tz, tr, ts] of TITLE_TREES) deadTree(TT, tx, tz, tr, ts);
    // yard gravestones (engraved faces toward the street / title camera)
    const GS = ['Gravestone_A', 'Gravestone_B', 'Gravestone_C'];
    [[-9, 23, 0.2], [-11.5, 25, -0.15], [-7.5, 27, 0.05]].forEach(([gx, gz, gr], i) => {
      // (raised a little: the rim of the dirt mound lay in the plane of the lawn and flickered)
      if (this.kit(KE, GS[i], E, gx, -0.435, gz, -Math.PI / 2 + gr)) return;
      const gs = grp(E, gx, -0.45, gz, Math.PI / 2 + gr);
      mk(Geo.box(0.7, 0.9, 0.16), Mat.lam(0x6a6a70), 0, 0.45, 0, gs);
      mk(Geo.cyl(0.35, 0.35, 0.16, 10, 1), Mat.lam(0x6a6a70), 0, 0.9, 0, gs, { rx: Math.PI / 2 });
    });
    // candles burning in front of the gravestones, cobwebs on two of them and up in the corners of the porch (the
    // title screen looks at all of it). Each little group of candles lights its stone from below (a 'yard' lamp:
    // updateLights only uses those while the view is outdoors)
    const yardWebM = new THREE.MeshStandardMaterial({ map: yardWebTexture(), color: 0xd2d2d6, emissive: 0x46464e, transparent: true, opacity: 0.85, depthWrite: false, side: THREE.DoubleSide, roughness: 0.8, metalness: 0 });
    // (a web's corner at local x, y, z of parent; it fans out to +x and down, or to -x when flipped)
    const yardWeb = (parent, x, y, z, s, flip = false) => {
      const m = mk(Geo.plane(1, 1), yardWebM, x + (flip ? -0.5 : 0.5) * s, y - 0.5 * s, z, parent, { cast: false, receive: false });
      m.scale.set(flip ? -s : s, s, 1); m.renderOrder = 2;
      return m;
    };
    const haloM = new THREE.SpriteMaterial({ map: glowTexture(), color: 0xff9a44, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false });
    // (out here nothing else lights the candles: the wax glows a little with its own flame, a candle in the dark is
    // never black)
    const waxMats = new Map();
    const waxGlow = (m) => { if (!waxMats.has(m)) { const c = m.clone(); c.emissive = new THREE.Color(0x8a4c1c); c.emissiveIntensity = 1; waxMats.set(m, c); } return waxMats.get(m); };
    const graveCandle = (x, z, h) => {
      const tall = h > 0.19;
      // (no moon shadow of the stone across them either: a hard band of it over a candle by its own flame looked wrong)
      const k = this.kit('props_common', tall ? 'CandleTall' : 'Candle', E, x, -0.45, z, rand(0, TAU), { s: [1, h / (tall ? 0.25 : 0.18), 1], cast: false, receive: false });
      if (k) k.traverse((o) => { if (o.isMesh && !Array.isArray(o.material) && /^Wax/.test(o.material.name)) o.material = waxGlow(o.material); });
      else mk(Geo.cyl(0.035, 0.04, h, 6), Mat.lam(0xe8dfc8, { emissive: 0x6a3a14 }), x, -0.45 + h / 2, z, E, { cast: false });
      this.flame(x, -0.45 + h + 0.06, z);
    };
    [
      // stone x, z, turn; candles [across, in front, height]; web [x, y, size, flip] on the stone
      [-9, 23, 0.2, [[-0.2, 0.5, 0.26], [0.03, 0.6, 0.16], [0.23, 0.48, 0.21]], null],
      [-11.5, 25, -0.15, [[-0.25, 0.52, 0.2], [0.0, 0.62, 0.3], [0.2, 0.5, 0.14], [0.37, 0.64, 0.18]], [0.31, 0.74, 0.64, false]],
      [-7.5, 27, 0.05, [[-0.16, 0.5, 0.18], [0.18, 0.57, 0.24]], [-0.3, 0.6, 0.55, true]],
    ].forEach(([gx, gz, gr, cs, wb]) => {
      const fx = -Math.cos(gr), fz = Math.sin(gr), rx = Math.sin(gr), rz = Math.cos(gr); // the stone's front, its right
      const at = (a, f) => [gx + rx * a + fx * f, gz + rz * a + fz * f];
      let hx = 0, hz = 0, top = 0;
      for (const [a, f, h] of cs) { const [x, z] = at(a, f); graveCandle(x, z, h); hx += x; hz += z; top = Math.max(top, h); }
      hx /= cs.length; hz /= cs.length;
      const halo = new THREE.Sprite(haloM); halo.position.set(hx, -0.45 + top * 0.8, hz); halo.scale.setScalar(0.75); halo.renderOrder = 3; E.add(halo);
      // (the light hangs at the height of the flames, just in front of the candles: inside one it would light it
      // from within, black)
      const [lx, lz] = at(0, 0.8);
      this.addLight('yard', (hx + lx) / 2, -0.45 + top + 0.03, (hz + lz) / 2, 0xffa04c, 1.7, 3.4, { flicker: 0.35, kind: 'candle' });
      if (wb) { const sg = grp(E, gx, -0.435, gz, -Math.PI / 2 + gr); yardWeb(sg, wb[0], wb[1], 0.07, wb[2], wb[3]); }
    });
    // porch: under the roof, in the top corners next to the end posts (they go with the roof, hidden from above)
    for (const [z, flip, s] of [[13.64, false, 0.72], [22.36, true, 0.86]]) {
      const pg = grp(this.roof, -4.47, 0, 0, -Math.PI / 2);
      yardWeb(pg, z, 2.95, 0, s, flip);
    }
    if (!this.kit(KE, 'Mailbox', E, -19.3, -0.45, 15.6, -Math.PI / 2)) {
      mk(Geo.box(0.1, 1.1, 0.1), Mat.lam(0x2a1a10), -19.3, 0.1, 15.6, E);
      mk(Geo.box(0.35, 0.3, 0.6), Mat.lam(0x2a2a2e), -19.3, 0.75, 15.6, E);
    }
    [[-6, 12, 1], [-6.2, 24.3, 1.2], [-3, 25.5, 0.9], [-2.5, 11.4, 0.8]].forEach(([bx, bz, bs], i) => {
      if (!this.kit(KE, i % 2 ? 'Bush_B' : 'Bush_A', E, bx, -0.45, bz, rand(0, TAU), { s: bs * 1.1 })) mk(Geo.sph(bs, 8, 6), Mat.lam(0x1a2a16), bx, -0.45 + bs * 0.5, bz, E, { sy: 0.7 });
    });
    this.buildNeighborhood();
    // the night sky over the yard (outdoor views only, with the moon): the fog color at the horizon, a cold haze
    // just above it, darker overhead, so bare trees and the roof stand out against it. Lightning lights it up
    const skyM = new THREE.ShaderMaterial({
      uniforms: { uHorizon: { value: new THREE.Color(0x0b0e16) }, uHaze: { value: new THREE.Color(0x1d2536) }, uTop: { value: new THREE.Color(0x020305) }, uFlash: { value: 0 } },
      vertexShader: 'varying vec3 vDir; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vDir = normalize(w.xyz - cameraPosition); gl_Position = projectionMatrix * viewMatrix * w; }',
      fragmentShader: `uniform vec3 uHorizon; uniform vec3 uHaze; uniform vec3 uTop; uniform float uFlash; varying vec3 vDir;
        void main(){ float e = normalize(vDir).y;
          vec3 c = mix(uHorizon, uHaze, smoothstep(-0.02, 0.07, e));
          c = mix(c, uTop, smoothstep(0.07, 0.6, e));
          c += vec3(0.22, 0.25, 0.32) * uFlash * smoothstep(-0.05, 0.5, e);
          gl_FragColor = vec4(c, 1.0); }`,
      side: THREE.BackSide, depthWrite: false, fog: false,
    });
    const sky = this.sky = new THREE.Mesh(new THREE.SphereGeometry(150, 32, 16), skyM);
    sky.position.set(15, 0, 12); sky.renderOrder = -10; sky.castShadow = false; sky.receiveShadow = false;
    Render.scene.add(sky);
    // clouds drifting over the moon: a dome just inside the moon (around the title camera), drawn after it so they
    // can cross it. Silver edges near the moon, lightning lights them up
    const cloudM = new THREE.ShaderMaterial({
      uniforms: { tNoise: { value: mistTexture() }, uTime: { value: 0 }, uMoon: { value: new THREE.Vector3(...MOON_DIR) }, uFlash: { value: 0 } },
      vertexShader: 'varying vec3 vDir; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vDir = w.xyz - cameraPosition; gl_Position = projectionMatrix * viewMatrix * w; }',
      fragmentShader: `uniform sampler2D tNoise; uniform float uTime; uniform vec3 uMoon; uniform float uFlash; varying vec3 vDir;
        void main(){ vec3 d = normalize(vDir); if (d.y < 0.0) discard;
          vec2 p = d.xz / (d.y + 0.12) * 0.1;
          float n = texture2D(tNoise, p + vec2(uTime * 0.0032, uTime * 0.0011)).g * 0.62 + texture2D(tNoise, p * 2.4 + vec2(-uTime * 0.0047, 0.37)).g * 0.38;
          float c = smoothstep(0.44, 0.76, n) * smoothstep(0.02, 0.2, d.y);
          float m = max(dot(d, normalize(uMoon)), 0.0);
          vec3 col = vec3(0.016, 0.019, 0.03) + vec3(0.36, 0.4, 0.5) * pow(m, 22.0) * (1.3 - c) + vec3(0.04, 0.05, 0.075) * pow(m, 4.0) + vec3(0.32, 0.34, 0.4) * uFlash;
          gl_FragColor = vec4(col, c * 0.9); }`,
      transparent: true, depthWrite: false, side: THREE.BackSide, fog: false,
    });
    const clouds = this.clouds = new THREE.Mesh(new THREE.SphereGeometry(100, 32, 16), cloudM);
    clouds.position.set(-21, 2.3, 27); clouds.renderOrder = 3; clouds.castShadow = false; clouds.receiveShadow = false;
    Render.scene.add(clouds);
    // ground mist over the yard (title screen): two slow layers, lit by the moon and the porch light, dark where
    // the house throws its shadow
    const mistTex = mistTexture(0.36, 0.74);
    this.mist = [];
    for (const [y, op, rep, sp] of [[-0.3, 0.26, 9, [0.0055, 0.0018]], [0.08, 0.16, 14, [-0.0035, 0.0027]]]) {
      const tex = mistTex.clone(); tex.needsUpdate = true; tex.repeat.set(rep, rep);
      const m = new THREE.MeshLambertMaterial({ color: 0xb4c2e0, alphaMap: tex, transparent: true, opacity: op, depthWrite: false });
      const pl = mk(Geo.plane(150, 150), m, 10, y, 18, null, { rx: -Math.PI / 2, cast: false });
      pl.renderOrder = 1; pl.visible = false;
      Render.scene.add(pl); this.mist.push({ pl, tex, sp });
    }
    // warm light falling out of the lit windows onto the porch and the lawn (outdoor views)
    const spillM = new THREE.MeshBasicMaterial({ map: spillTexture(), color: 0xff9c4a, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -4 });
    const SP = this.spills = new THREE.Group(); Render.scene.add(SP);
    for (const w of this.litWins) {
      if (Math.abs(w.ry) > 3) continue;   // (the back of the house is never seen from outside)
      const nx = Math.sin(w.ry), nz = Math.cos(w.ry), bx = w.pos.x - nx * 0.05, bz = w.pos.z - nz * 0.05;
      const onPorch = bx < 0 && bz > 13.4 && bz < 22.6, gy = onPorch ? 0.004 : -0.446, depth = onPorch ? 2.1 : 2.6;
      const sg = grp(SP, bx, gy, bz, w.ry);
      mk(Geo.plane(w.w * 1.5, depth), spillM, 0, 0, depth / 2, sg, { rx: -Math.PI / 2, cast: false, receive: false });
    }
    // moon
    const moonM = Mat.basic(0xe8e4d0, { fog: false });
    const moonG = this.moonG = grp(Render.scene);
    const mp = moonAt(85), hp = moonAt(85.6);
    const moon = mk(Geo.circle(3.2, 24), moonM, mp.x, mp.y, mp.z, moonG, { cast: false, receive: false });
    moon.lookAt(-21, 2.3, 27);
    const halo = mk(Geo.plane(20, 20), Mat.glow(0x8090b0, 0.35), hp.x, hp.y, hp.z, moonG, { cast: false, receive: false });
    halo.lookAt(-21, 2.3, 27);
    // mystery man (hidden until the intro)
    this.props.man = buildMysteryMan();
    this.props.man.position.set(-1.9, 0, 17.8); this.props.man.rotation.y = Math.PI / 2;
    this.props.man.visible = false;
    Render.scene.add(this.props.man);
  },

  // The rest of Maple Street around the lot: the neighbors' houses (a few windows still lit), the street out front
  // with its lamps. Seen from the yard and out of the windows (outdoor views only), merged into a few meshes
  buildNeighborhood() {
    const N = this.hood = new THREE.Group(); Render.scene.add(N);
    const rng = mulberry32(1031);
    const lit = Mat.lam(0xffc27a, { emissive: 0xffa040, ei: 1.15, unique: true });
    const dark = Mat.lam(0x16181e, { rough: 0.3 });
    const sidings = [0x8a8478, 0x6c7884, 0x8c7c66, 0x7a5c52, 0x9c9a90, 0x5e6a5e].map((c) => Mat.lam(c, { rough: 0.9 }));
    const roofs = [0x2a2622, 0x3a2e2a, 0x262a30].map((c) => Mat.lam(c, { rough: 0.95 }));
    const doorM = Mat.lam(0x3a2418), trimM = Mat.lam(0xb8b2a4);
    for (const [x, z, ry, w, d, h, si] of MAPLE_ST) {
      const g = grp(N, x, -0.45, z, ry);
      mk(Geo.box(w, h, d), sidings[si], 0, h / 2, 0, g, { cast: false });
      // gable roof: a triangular prism along the length, the eaves a little past the walls
      const rh = d * 0.42, pg = new THREE.CylinderGeometry(1, 1, w + 0.5, 3, 1).rotateZ(Math.PI / 2).rotateX(-Math.PI / 2);
      pg.scale(1, rh / 1.5, (d / 2 + 0.35) / 0.866); pg.translate(0, h + 0.5 * rh / 1.5, 0);
      mk(pg, roofs[si % roofs.length], 0, 0, 0, g, { cast: false });
      mk(Geo.box(0.6, 1.8, 0.6), sidings[(si + 3) % sidings.length], w * 0.28, h + rh * 0.55, -d * 0.12, g, { cast: false });
      // windows all round, one or two floors; a few still lit
      const floors = h > 4.5 ? [1.45, 4.1] : [1.45];
      for (const [face, len] of [[0, w], [1, d], [2, w], [3, d]]) {
        const n = Math.max(1, Math.floor(len / 3.2));
        const fg = grp(g, 0, 0, 0, face * Math.PI / 2);
        const off = (face % 2 ? w : d) / 2 + 0.03;
        for (const fy of floors) for (let i = 0; i < n; i++) {
          const wx = (i - (n - 1) / 2) * (len / n);
          if (face === 0 && fy < 2 && i === Math.floor(n / 2)) { mk(Geo.box(1.0, 2.1, 0.08), doorM, wx, 1.05, off, fg, { cast: false }); continue; }
          mk(Geo.box(1.0, 1.25, 0.06), trimM, wx, fy, off - 0.01, fg, { cast: false });
          mk(Geo.plane(0.82, 1.06), rng() < 0.32 ? lit : dark, wx, fy, off + 0.025, fg, { cast: false, receive: false });
        }
      }
    }
    // the street out front, the sidewalk, the lamps
    mk(Geo.plane(10, 170), Mat.lam(0x1c1d21, { rough: 0.85 }), -29.5, -0.44, 18, N, { rx: -Math.PI / 2, cast: false });
    mk(Geo.plane(2.4, 170), Mat.lam(0x45454a, { rough: 0.9 }), -23.2, -0.435, 18, N, { rx: -Math.PI / 2, cast: false });
    const poleM = Mat.lam(0x1a1a1c), headM = Mat.lam(0xffe2b0, { emissive: 0xffc070, ei: 2.2, unique: true });
    for (const lz of [-8, 22, 52]) {
      const lg = grp(N, -23.4, -0.45, lz);
      mk(Geo.cyl(0.07, 0.1, 4.8, 8), poleM, 0, 2.4, 0, lg, { cast: false });
      mk(Geo.box(1.2, 0.08, 0.08), poleM, -0.55, 4.7, 0, lg, { cast: false });
      mk(Geo.box(0.42, 0.14, 0.26), headM, -1.1, 4.62, 0, lg, { cast: false });
    }
    // (the lamps' glow and the light they pour on the street stay out of the merge)
    bakeStatic(N, N);
    for (const lz of [-8, 22, 52]) {
      const sp = glowSprite(0xffc890, 2.6, 0.55); sp.position.set(-24.5, 4.15, lz); N.add(sp);
      mk(Geo.plane(9, 9), Mat.glow(0xffa860, 0.22), -24.5, -0.43, lz, N, { rx: -Math.PI / 2, cast: false, receive: false });
    }
  },

  // ------------------------------------------------------------------
  //  THE ATTIC under the gable roof, up the hall stairs. Nobody goes up there all night: it only shows at the very
  //  end (and in the last lost photo). Plank floor around the stairwell, knee walls, boards and rafters under the
  //  roof, a round window in each gable (the moon comes in through the east one), what is left of everyone who
  //  ever lived here, and one bare bulb on a cord: the spot under it is where the last photo was taken
  // ------------------------------------------------------------------
  buildAttic() {
    const A = this.attic = grp(Render.scene); A.name = 'attic'; A.visible = false;
    const S = grp(A), y0 = ATTIC_Y, [, hx1, hz0, hz1] = ATTIC_HOLE;
    const tanA = (ROOF_RIDGE - WALL_H) / (12 + ROOF_EAVE), cosA = 1 / Math.hypot(1, tanA), ang = Math.atan(tanA);
    const KNEE = 9.5, Z0 = 12 - KNEE, Z1 = 12 + KNEE;
    const under = (d) => ROOF_RIDGE - 0.06 / cosA - d * tanA;          // the underside of the roof, d m from the ridge
    const kh = under(KNEE);
    const floorM = this.surf('floor_wood_light', { color: 0x9a8b7a }) || Mat.lam(0x5a4a3a);
    const boardM = this.surf('floor_wood_light', { color: 0x6e5f50 }) || Mat.lam(0x3e3226);
    const beamA = Mat.lam(0x3c2d21), beamB = Mat.lam(0x30241a);
    // floorboards around the stairwell, knee walls along the eaves
    const fl = (x0, x1, z0, z1) => mk(worldBox(x0, y0 - 0.04, z0, x1, y0, z1, 0.5, 0.5), floorM, 0, 0, 0, S, { cast: false });
    fl(0.15, 29.85, Z0 - 0.05, hz0); fl(0.15, 29.85, hz1, Z1 + 0.05); fl(hx1, 29.85, hz0, hz1);
    for (const z of [Z0, Z1]) mk(worldBox(0.15, y0, z - 0.03, 29.85, kh + 0.02, z + 0.03, 0.5, 0.5), boardM, 0, 0, 0, S, { cast: false });
    // a railing around the stairwell (open at the top of the stairs, on the south side)
    const railM = Mat.lam(0x3a2a1e);
    const rail = (ax, az, bx, bz, end = false) => {
      const L = Math.hypot(bx - ax, bz - az), alongX = Math.abs(bx - ax) > Math.abs(bz - az);
      for (const [x, z] of end ? [[ax, az], [bx, bz]] : [[ax, az]]) mk(Geo.box(0.09, 1.0, 0.09), railM, x, y0 + 0.5, z, S);
      const cx = (ax + bx) / 2, cz = (az + bz) / 2;
      mk(alongX ? Geo.box(L, 0.06, 0.08) : Geo.box(0.08, 0.06, L), railM, cx, y0 + 0.95, cz, S);
      mk(alongX ? Geo.box(L, 0.05, 0.05) : Geo.box(0.05, 0.05, L), railM, cx, y0 + 0.08, cz, S, { cast: false });
      const n = Math.floor(L / 0.22);
      for (let i = 1; i < n; i++) { const k = i / n; mk(Geo.box(0.028, 0.84, 0.028), railM, ax + (bx - ax) * k, y0 + 0.5, az + (bz - az) * k, S); }
    };
    rail(1.05, hz1 + 0.04, hx1 + 0.04, hz1 + 0.04);
    rail(hx1 + 0.04, hz1 + 0.04, hx1 + 0.04, hz0 - 0.04);
    rail(hx1 + 0.04, hz0 - 0.04, 0.22, hz0 - 0.04, true);
    // boards under both slopes of the roof, rafters under the boards, the ridge beam, collar ties, posts
    const L = KNEE / cosA + 0.05, dm = KNEE / 2;
    for (const s of [-1, 1]) {
      mk(boxMeterUV(new THREE.BoxGeometry(29.7, 0.04, L), 0.5, s), boardM, 15, under(dm) - 0.02 / cosA, 12 + s * dm, S, { rx: s * ang, cast: false });
      for (let x = 0.75, i = 0; x < 29.8; x += 1.2, i++) mk(Geo.box(0.075, 0.16, L), i % 2 ? beamA : beamB, x, under(dm) - 0.12 / cosA, 12 + s * dm, S, { rx: s * ang });
    }
    mk(worldBox(0.15, under(0) - 0.34, 11.91, 29.85, under(0) - 0.02, 12.09, 1, 1), beamA, 0, 0, 0, S);
    const cy = 6.2, cd = (under(0) - 0.2 / cosA - cy - 0.07) / tanA;
    for (let x = 0.75; x < 29.8; x += 2.4) mk(worldBox(x + 0.04, cy - 0.07, 12 - cd, x + 0.1, cy + 0.07, 12 + cd, 1, 1), beamB, 0, 0, 0, S);
    for (const x of [3.4, 13.0, 22.6]) mk(worldBox(x - 0.08, y0, 11.92, x + 0.08, under(0) - 0.33, 12.08, 1, 1), beamA, 0, 0, 0, S);
    // the gable ends: boards, a round window in each, cold light inside them
    for (const east of [false, true]) {
      const f = east ? 1 : -1, sh = new THREE.Shape();   // (shape x = f * z: the rotation below turns it into the wall)
      sh.moveTo(f * Z0, y0); sh.lineTo(f * Z0, kh); sh.lineTo(f * 12, under(0)); sh.lineTo(f * Z1, kh); sh.lineTo(f * Z1, y0); sh.closePath();
      const hole = new THREE.Path(); hole.absarc(f * 12, 5.0, 0.47, 0, TAU, true); sh.holes.push(hole);
      const g = new THREE.ShapeGeometry(sh, 24), uv = g.attributes.uv;
      for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 0.5, uv.getY(i) * 0.5);
      const gx = east ? 29.84 : 0.16, ry = east ? -Math.PI / 2 : Math.PI / 2, inx = east ? -1 : 1;
      mk(g, boardM, gx, 0, 0, S, { ry, cast: false });
      const v = this.winView(east ? 'east' : 'west'), glass = this.winGlassMat(v.C, v.rt.texture, 1.7);
      this.windows.push(glass);
      mk(Geo.circle(0.47, 32), glass, gx - inx * 0.02, 5.0, 12, S, { ry, cast: false, receive: false });
      mk(Geo.torus(0.48, 0.045, 6, 32), beamA, gx + inx * 0.02, 5.0, 12, S, { ry: Math.PI / 2, cast: false });
      mk(Geo.box(0.035, 0.95, 0.035), beamA, gx + inx * 0.01, 5.0, 12, S, { cast: false });
      mk(Geo.box(0.035, 0.035, 0.95), beamA, gx + inx * 0.01, 5.0, 12, S, { cast: false });
    }
    this.atticWinL = this.addLight('attic', 0.9, 4.85, 12.4, 0x7f9cff, 1.15, 5.5, { kind: 'night' });
    this.atticWinL.noShadow = true;
    // moonlight through the east window: a shaft of dusty light down to a patch on the floorboards
    const md = new THREE.Vector3(-MOON_DIR[0], -MOON_DIR[1], -MOON_DIR[2]).normalize();
    const w0 = new THREE.Vector3(29.8, 5.0, 12), len = (5.0 - y0) / -md.y, w1 = w0.clone().addScaledVector(md, len);
    this.atticBeamMat = new THREE.ShaderMaterial({
      uniforms: { uColor: { value: new THREE.Color(0xb4c2ff) }, uI: { value: 0.16 } },
      vertexShader: 'varying float vV; varying vec3 vN; varying vec3 vView; void main(){ vV = uv.y; vec4 w = modelMatrix * vec4(position, 1.0); vN = normalize(mat3(modelMatrix) * normal); vView = cameraPosition - w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
      fragmentShader: 'uniform vec3 uColor; uniform float uI; varying float vV; varying vec3 vN; varying vec3 vView; void main(){ float f = abs(dot(normalize(vN), normalize(vView))); float a = pow(f, 3.0) * smoothstep(0.0, 0.45, vV) * mix(0.3, 1.0, vV); gl_FragColor = vec4(uColor * a * uI, 1.0); }',
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
    });
    const beam = mk(new THREE.CylinderGeometry(0.42, 0.66, len, 24, 1, true), this.atticBeamMat, 0, 0, 0, A, { cast: false, receive: false });
    beam.position.copy(w0).lerp(w1, 0.5); beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), md.clone().negate());
    // (the disc of the window lies stretched along the way the light goes)
    const patch = mk(Geo.plane(0.8, 1.6), Mat.basic(0x8ea4ff, { map: moonPatchTexture(), additive: true, opacity: 0.55, unique: true }), w1.x, y0 + 0.004, w1.z, A, { cast: false, receive: false });
    patch.rotation.order = 'YXZ'; patch.rotation.set(-Math.PI / 2, Math.atan2(-md.x, -md.z), 0);
    this.addLight('attic', w1.x + 0.2, y0 + 0.6, w1.z - 0.2, 0x8ea6ff, 2.4, 6, { kind: 'night' }).noShadow = true;
    // the bulb on its cord from the ridge beam (it swings a little: updateAttic), right over the spot
    const [fx, fy, fz] = ATTIC, bx = fx + ATTIC_BULB[0], by = fy + ATTIC_BULB[1], bz = fz + ATTIC_BULB[2];
    const top = under(Math.abs(bz - 12)) - 0.33;
    const pend = this.atticPend = grp(A, bx, top, bz);
    let bulbMats;
    const kb = this.kit('props_basement', 'HangingBulb', pend, 0, by + 0.72 - top, 0, 0.6, { cast: false });
    if (kb) {
      bulbMats = this.glowMats(kb);
      mk(Geo.cyl(0.005, 0.005, top - by - 0.72, 4), Mat.lam(0x111111), 0, (by + 0.72 - top) / 2, 0, pend, { cast: false });
    } else {
      const bm = Mat.lam(0xfff0c0, { emissive: 0xffe0a0, ei: 1, unique: true });
      mk(Geo.cyl(0.005, 0.005, top - by, 4), Mat.lam(0x111111), 0, (by - top) / 2, 0, pend, { cast: false });
      mk(Geo.sph(0.06, 8, 6), bm, 0, by - top, 0, pend, { cast: false, sy: 1.25 });
      bulbMats = [bm];
    }
    this.atticGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color: 0xffc070, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false }));
    this.atticGlow.scale.setScalar(0.9); this.atticGlow.position.set(0, by - top, 0); pend.add(this.atticGlow);
    this.atticBulbAt = new THREE.Vector3(0, by - 0.05 - top, 0);
    this.atticBulb = this.addLight('attic', bx, by - 0.05, bz, 0xffcf96, 7, 14, { mats: bulbMats, flicker: 0.04 });
    this.atticBulb.prio = 1;
    this.atticSwing = 0.04;
    // (a little warm fill for the very last close-up, off until then)
    this.atticFill = this.addLight('attic', fx + 1.2, fy + 1.9, fz + 0.2, 0xffcfa0, 0.9, 3.5, { kind: 'night' });
    this.atticFill.noShadow = true; this.atticFill.force = 0; this.atticFill.home = this.atticFill.pos.clone();
    // dust drifting in its light
    const DN = 170, dp = new Float32Array(DN * 3), rng = mulberry32(77);
    for (let i = 0; i < DN; i++) { dp[i * 3] = bx + (rng() - 0.5) * 5; dp[i * 3 + 1] = y0 + 0.3 + rng() * 3.2; dp[i * 3 + 2] = bz + (rng() - 0.5) * 4.4; }
    const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(dp, 3));
    this.atticDust = new THREE.Points(dg, new THREE.PointsMaterial({ map: glowTexture(), color: 0xffdcae, size: 0.022, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending }));
    this.atticDust.userData.base = dp.slice(); this.atticDust.frustumCulled = false; A.add(this.atticDust);

    // ---- what is up here ----
    const kp = (kit, node, x, z, ry = 0, o = {}) => this.kit(kit, node, S, x, o.y ?? y0, z, ry, o);
    const box = (x, z, w, h, d, ry = 0, c = 0x8a6a44, y = y0) => mk(Geo.box(w, h, d), Mat.lam(c), x, y + h / 2, z, S, { ry });
    // (nothing is lit up here: Walt's jack-o'-lanterns are long dead, gone dark and soft)
    const dead = new Map();
    const kill = (o) => o && o.traverse((m) => {
      if (!m.isMesh || Array.isArray(m.material)) return;
      if (!dead.has(m.material)) {
        const c = m.material.clone(), glow = /^Glow/.test(c.name || '');
        if (c.emissive) c.emissiveIntensity = 0;
        c.color.multiplyScalar(glow ? 0.25 : 0.62); c.color.lerp(new THREE.Color(0x4a3a20), 0.3);
        dead.set(m.material, c);
      }
      m.material = dead.get(m.material);
    });
    // west end, by the stairwell: boxes nobody unpacked, a trunk, a chair under a sheet, a rocking chair at the window
    for (const [x, z, ry, y] of [[0.75, 5.6, 0.1, 0], [0.8, 6.25, -0.15, 0], [0.78, 5.9, 0.3, 0.456], [1.45, 5.2, 0.5, 0], [0.8, 15.2, 0.05, 0], [0.82, 15.85, -0.2, 0], [0.8, 15.5, 0.25, 0.456],
      [1.5, 20.3, 0.3, 0], [2.2, 20.75, -0.1, 0], [21.0, 20.4, 0.2, 0], [21.6, 20.8, -0.3, 0], [21.3, 20.6, 0.1, 0.456], [27.6, 4.6, 0.4, 0]]) {
      if (!kp('props_common', 'CardboardBox', x, z, ry, { y: y0 + y })) box(x, z, 0.5, 0.45, 0.5, ry, 0x9a7a4a, y0 + y);
    }
    if (!kp('props_basement', 'Trunk', 1.75, 4.25, 0.1)) box(1.75, 4.25, 1.4, 0.7, 0.7, 0.1, 0x4a2a1a);
    if (!kp('props_hall', 'StairBoxes', 1.05, 10.3, 0.4)) box(1.05, 10.3, 0.6, 0.9, 0.5, 0.4);
    if (!kp('props_basement', 'SheetChair', 2.2, 8.3, 0.5)) box(2.2, 8.3, 1.1, 1.1, 1.0, 0.5, 0xd8d4c8);
    if (!kp('props_living', 'RockingChair', 2.5, 16.9, -2.1)) box(2.5, 16.9, 0.6, 1.1, 0.8, -2.1, 0x4a3020);
    kp('props_living', 'Frame_80x60', 4.3, 2.6, 0.08, { y: y0 + 0.36, rx: -0.22 });
    // around the spot under the bulb, a little of everyone who lived here: Walt's lanterns, Agnes' dolls, Dottie's
    // jars, straw for whoever is next
    if (!kp('props_hall', 'HayBale', 4.5, 10.3, 0.25)) box(4.5, 10.3, 2.0, 0.8, 1.0, 0.25, 0xb89a4a);
    kp('props_hall', 'CornStalks', 8.1, 10.1, -0.6);
    if (!kp('props_living', 'ToyChest', 3.9, 15.8, 0.35)) box(3.9, 15.8, 1.3, 0.66, 0.66, 0.35, 0x8a2a20);
    kp('props_living', 'Plush_A', 3.85, 15.77, 0.55, { y: y0 + 0.66 });
    kp('props_living', 'Plush_B', 4.9, 16.35, -0.5);
    kp('props_living', 'Plush_C', 3.1, 16.6, 0.9);
    for (const [x, z, ry] of [[8.7, 15.1, -2.4], [9.35, 15.6, -2.0], [8.15, 15.95, -2.8], [9.85, 14.7, -1.8], [7.6, 16.5, 2.9]]) kill(kp('props_common', 'JackOLantern', x, z, ry));
    if (!kp('props_basement', 'Crate', 8.85, 9.85, 0.2, { s: 0.7 })) box(8.85, 9.85, 0.7, 0.7, 0.7, 0.2, 0x6a4a2a);
    kp('props_kitchen', 'CandyJar_A', 8.7, 9.75, 0.3, { y: y0 + 0.7 });
    kp('props_kitchen', 'CandyJar_A', 9.05, 10.05, 1.9, { y: y0 + 0.7 });
    const fork = itemModel('Pitchfork');
    if (fork) { fork.position.set(3.72, y0, 12.3); fork.rotation.set(-0.08, 0, 0.11); S.add(fork); }   // (against the post)
    // the east end, mostly dark: more sheets, crates, a dressmaker's dummy
    if (!kp('props_basement', 'SheetChair', 16.9, 15.6, -0.7)) box(16.9, 15.6, 1.1, 1.1, 1.0, -0.7, 0xd8d4c8);
    if (!kp('props_basement', 'SheetChair', 19.6, 9.4, 2.2)) box(19.6, 9.4, 1.1, 1.1, 1.0, 2.2, 0xd8d4c8);
    for (const [x, z, s] of [[23.8, 16.6, 0.9], [24.75, 17.35, 0.6]]) if (!kp('props_basement', 'Crate', x, z, 0.3, { s })) box(x, z, s, s, s, 0.3, 0x6a4a2a);
    if (!kp('props_basement', 'Barrel', 22.8, 8.6, 0.7)) mk(Geo.cyl(0.35, 0.35, 0.95, 10), Mat.lam(0x4a3020), 22.8, y0 + 0.48, 8.6, S);
    kp('props_basement', 'Trunk', 26.4, 19.3, 0.1);
    {
      const dm2 = grp(S, 11.4, y0, 15.2, 0.6), cloth = Mat.lam(0x8c705c), wood = Mat.lam(0x2e2219);
      mk(Geo.capsule(0.17, 0.42), cloth, 0, 1.36, 0, dm2, { sx: 1.18, sz: 0.74 });
      mk(Geo.cyl(0.045, 0.06, 0.12, 8), cloth, 0, 1.8, 0, dm2);
      mk(Geo.cyl(0.018, 0.018, 1.0, 6), wood, 0, 0.55, 0, dm2);
      for (let i = 0; i < 3; i++) mk(Geo.box(0.035, 0.035, 0.42), wood, Math.sin(i * 2.1) * 0.17, 0.05, Math.cos(i * 2.1) * 0.17, dm2, { ry: i * 2.1, rx: 0.22 });
    }
    // cobwebs in the angles of the rafters and the ridge
    const webM = new THREE.MeshStandardMaterial({ map: cobwebTexture(), color: 0xb8b4ac, transparent: true, opacity: 0.55, depthWrite: false, side: THREE.DoubleSide, roughness: 1, metalness: 0 });
    for (const [x, s] of [[2.55, 1], [3.75, -1], [4.95, 1], [7.35, -1], [8.55, 1], [9.75, -1], [12.15, 1], [14.55, -1]]) {
      // (the web's corner, the top left of the texture, sits in the angle under the ridge beam)
      const wv = mk(Geo.plane(0.85, 0.85), webM, x, under(0) - 0.36 - 0.42, 12 + s * (0.09 + 0.42), A, { ry: -s * Math.PI / 2, cast: false, receive: false });
      wv.renderOrder = 2;
    }
    // loose straw on the floor where you will stand, and polaroids: the ones he left on the porches
    const straw = mk(Geo.plane(3.4, 3.4), new THREE.MeshStandardMaterial({ map: strawFloorTexture(), transparent: true, depthWrite: false, roughness: 1, metalness: 0, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -4 }), fx, y0 + 0.003, fz, A, { rx: -Math.PI / 2, cast: false });
    straw.renderOrder = 1;
    const prng = mulberry32(1996);
    for (let i = 0; i < 9; i++) {
      const a = prng() * TAU, r = 0.75 + prng() * 1.8;
      mk(Geo.box(0.088, 0.003, 0.107), Mat.tex(oldPolaroidTexture(i % 4)), fx + Math.cos(a) * r, y0 + 0.002 + i * 0.0002, fz + Math.sin(a) * r, S, { ry: prng() * TAU, cast: false });
    }
    bakeStatic(S, A);
  },

  // ------------------------------------------------------------------
  //  A lived-in house: shelves full of things along the walls, a few more rugs, cobwebs up in the corners (the
  //  surfaces get their age in applyWear). Everything new stands against a wall: the middle of every room is where
  //  the fights happen
  // ------------------------------------------------------------------
  buildClutter() {
    const rng = mulberry32(4711), rr = (a, b) => a + (b - a) * rng(), pickR = (a) => a[Math.floor(rng() * a.length)];
    const BOOK = [0x6b2a22, 0x2f3f5a, 0x3e5a3a, 0x7a5a2a, 0x5a2a4a, 0x8a7a5a, 0x2a2a2a, 0xa0522d, 0x4a4a6a, 0x6a6a4a, 0x9a3a2a, 0x3a5a6a, 0xc8b890, 0x1e3a2a];
    const shelfWood = Mat.lam(0x4a3220), paint = Mat.lam(0x76835f), paintIn = Mat.lam(0x8f9a78), darkWood = Mat.lam(0x2e1d12);
    const NC = { cast: false };
    // The small things on the shelves throw no shadows of their own (the shelves do): they are merged apart from
    // the furniture, per room, and stay out of the shadow passes. (Kept with the room's merged meshes in build)
    const SMALL = this.clutter = {};
    for (const k of ['hall', 'kitchen', 'living', 'bedroom']) SMALL[k] = grp(this.root);
    const twin = (room, g) => grp(SMALL[room], g.position.x, g.position.y, g.position.z, g.rotation.y);
    // (the lived-in kit's furniture throws its shadow from the carcass alone: the plates, records, tins, glass and
    // hardware on and in it stay out of the shadow passes)
    const DETAIL = /^(Porcelain|Covers|Packaging|Electronics|Chrome|Brass|Steel|Glass|SmokedGlass|Food|Rubber|Vinyl|TinMetal|Paper|Kraft|Books|Wax|Cork|GrilleCloth|Leather|Rosewood)/;
    const lite = (o) => { if (o) o.traverse((m) => { if (m.isMesh && m.material && DETAIL.test(m.material.name || '')) m.castShadow = false; }); return o; };
    const K = (kit, node, g, x, y, z, ry = 0, s, cast = false) => {
      const o = this.kit(kit, node, g, x, y, z, ry, Object.assign({ cast }, s != null ? { s } : {}));
      return cast && kit === 'props_lived' ? lite(o) : o;
    };
    const LV = this.hasKit('props_lived', 'BookRow_A');
    // books standing in a row from x0 to x1, now and then a gap or one leaning over
    const books = (g, x0, x1, y, z, hmax, d = 0.2) => {
      if (LV) {
        // (kit rows of 0.3, 0.45 and 0.6 m, at most 0.29 tall: every shelf here is taller)
        const rows = [['BookRow_C', 0.6], ['BookRow_B', 0.45], ['BookRow_A', 0.3]];
        for (let x = x0 + rr(0, 0.02); x1 - x >= 0.3;) {
          const fit = rows.filter((r) => r[1] <= x1 - x + 0.001), [nd, len] = pickR(fit);
          K('props_lived', nd, g, x + len / 2, y, z, 0);
          x += len + rr(0.004, 0.02) + (rng() < 0.15 ? rr(0.05, 0.12) : 0);
        }
        return;
      }
      let x = x0;
      while (x < x1 - 0.03) {
        if (rng() < 0.05) { x += rr(0.05, 0.18); continue; }
        const bw = rr(0.022, 0.055), bh = Math.min(hmax, rr(0.17, 0.29));
        if (x + bw > x1) break;
        const m = mk(Geo.box(bw, bh, d * rr(0.82, 1)), Mat.lam(pickR(BOOK)), x + bw / 2, y + bh / 2, z, g, NC);
        if (rng() < 0.04) { const a = rr(0.2, 0.35); m.rotation.z = -a; m.position.x += Math.sin(a) * bh / 2; m.position.y -= (1 - Math.cos(a)) * bh / 2; x += Math.sin(a) * bh; }
        x += bw + 0.002;
      }
    };
    // a pile lying flat (magazines, comics, old books)
    const pile = (g, x, y, z, n, w = 0.24, d = 0.17, node = null) => {
      if (LV && K('props_lived', node || (n >= 7 ? 'MagazinePile_A' : n >= 4 ? 'BookPile' : 'MagazinePile_B'), g, x, y, z, rr(-0.35, 0.35))) return y + 0.05;
      let yy = y;
      for (let i = 0; i < n; i++) { const t = rr(0.012, 0.045); mk(Geo.box(w * rr(0.85, 1.05), t, d * rr(0.85, 1.05)), Mat.lam(pickR(BOOK)), x + rr(-0.02, 0.02), yy + t / 2, z + rr(-0.02, 0.02), g, { ry: rr(-0.25, 0.25), cast: false }); yy += t; }
      return yy;
    };
    // tins (a paper label around the middle) and packets (a label on the front, a band across the top), in the
    // faded colours of old packaging
    const TIN = Mat.lam(0x8e8c86, { metal: 0.5, rough: 0.5 });
    const TINS = ['TinCan_Tomato', 'TinCan_Beans', 'TinCan_Soup', 'TinCan_Peach'];
    const PACKS = [['Packet_Rice', 0.16, 0.24], ['Packet_Pasta', 0.18, 0.26], ['Packet_Flour', 0.15, 0.25], ['Packet_Crackers', 0.22, 0.22], ['Packet_Oats', 0.17, 0.27], ['Packet_Tea', 0.16, 0.2]];
    const cans = (g, x0, x1, y, z) => {
      if (LV) { for (let x = x0 + 0.045; x < x1 - 0.04; x += 0.092) K('props_lived', pickR(TINS), g, x, y, z + rr(-0.012, 0.012), rr(-0.35, 0.35)); return; }
      for (let x = x0 + 0.045; x < x1 - 0.04; x += 0.095) {
        mk(Geo.cyl(0.04, 0.04, 0.11, 10), TIN, x, y + 0.055, z, g, NC);
        mk(Geo.cyl(0.0412, 0.0412, 0.072, 10), Mat.lam(pickR([0x9a3a2a, 0x3e5a3a, 0xb8903e, 0x3a4e72, 0xcfc4a8, 0x7a4a2a])), x, y + 0.055, z, g, NC);
      }
    };
    const packs = (g, x0, x1, y, z, hmax = 0.32) => {
      if (LV) {
        const ok = PACKS.filter((q) => q[2] <= hmax);
        for (let x = x0; ok.length;) {
          const [nd, bw] = pickR(ok);
          if (x + bw > x1) break;
          K('props_lived', nd, g, x + bw / 2, y, z, rr(-0.1, 0.1));
          x += bw + rr(0.01, 0.03);
        }
        return;
      }
      for (let x = x0; x < x1 - 0.18;) {
        const bw = rr(0.16, 0.24), bh = Math.min(hmax, rr(0.22, 0.32)), b = grp(g, x + bw / 2, y, z, rr(-0.1, 0.1));
        mk(Geo.box(bw, bh, 0.07), Mat.lam(pickR([0xb8862e, 0x9a3a2a, 0x46628a, 0xcfc2a0, 0x5a7a4a, 0x7a5636, 0xa8a090])), 0, bh / 2, 0, b, NC);
        mk(Geo.box(bw * 0.7, bh * 0.36, 0.004), Mat.lam(pickR([0xe8dcc0, 0xd8c8a0, 0x3a2a1e, 0xb03a2a])), 0, bh * 0.52, 0.037, b, NC);
        mk(Geo.box(bw + 0.002, 0.03, 0.072), Mat.lam(pickR([0xe8dcc0, 0x2a2a2a, 0xc8a050])), 0, bh - 0.03, 0, b, NC);
        x += bw + 0.02;
      }
    };
    // earthenware crock with a lid, a cup
    const crock = (g, x, y, z, r, h, col) => { if (LV && K('props_lived', r >= 0.1 ? 'Crock_A' : r >= 0.08 ? 'Crock_B' : 'Crock_C', g, x, y, z, rr(0, TAU))) return; mk(Geo.cyl(r * 0.92, r, h, 14), Mat.lam(col), x, y + h / 2, z, g, NC); mk(Geo.cyl(r * 0.8, r * 0.86, 0.025, 14), Mat.lam(col), x, y + h + 0.012, z, g, NC); mk(Geo.sph(r * 0.18, 8, 6), Mat.lam(0x3a2a1e), x, y + h + 0.03, z, g, NC); };
    const cup = (g, x, y, z, col) => mk(Geo.cyl(0.042, 0.034, 0.08, 10), Mat.lam(col), x, y + 0.04, z, g, NC);
    // an open shelf unit against a wall (front +z locally): back, sides, n shelves. fill(g, i, y, x0, x1, h) puts
    // the things on shelf i into g (the unit's twin in the room's small things)
    const unit = (room, x, z, ry, w, h, d, n, mat, fill, back = mat, node = null) => {
      const g = grp(this.statics[room], x, 0, z, ry), gs = twin(room, g);
      const gap = (h - 0.1) / n, kitted = !!(node && K('props_lived', node, g, 0, 0, 0, 0, null, true));
      if (!kitted) {
        mk(Geo.box(w, h, 0.025), back, 0, h / 2, -d / 2 + 0.0125, g);
        for (const sx of [-1, 1]) mk(Geo.box(0.035, h, d), mat, sx * (w / 2 - 0.0175), h / 2, 0, g);
        for (let i = 0; i <= n; i++) mk(Geo.box(w - 0.07, 0.025, d - 0.025), mat, 0, 0.06 + i * gap, 0.0125, g);
        mk(Geo.box(w + 0.03, 0.035, d + 0.02), mat, 0, h + 0.0175, 0, g);
      }
      // (the kit units keep the same shelf heights: the top of shelf i at 0.0725 + i * gap)
      for (let i = 0; i < n; i++) fill(gs, i, 0.06 + i * gap + 0.0125, -w / 2 + 0.06, w / 2 - 0.06, gap - 0.05, d);
      this.colRect(x, z, w, d + 0.04, ry, { h, shots: true });
      return g;
    };

    // ---- kitchen: an old painted dresser on the west wall (plates standing on the plate rail, cups, crocks, tins
    // and packets), a pantry shelf by the fridge, spice shelves by the door to the living room ----
    const SK = this.statics.kitchen;
    unit('kitchen', 0.37, 8.0, Math.PI / 2, 2.2, 2.0, 0.42, 4, paint, (g, i, y, x0, x1, hh, d) => {
      if (i === 0) { K('props_common', 'Jar', g, x0 + 0.2, y, 0.02, 0.3); K('props_common', 'Jar', g, x0 + 0.55, y, 0.0, 1.2, 0.85); K('props_kitchen', 'Pot', g, x1 - 0.3, y, 0.02, 0.4); packs(g, x0 + 0.85, x1 - 0.6, y, -0.06); }
      else if (i === 1) { cans(g, x0, x0 + 0.95, y, 0.07); packs(g, x0 + 1.0, x1, y, -0.07); }
      else if (i === 2) {
        // (the kit dresser has its plates on the rail and the teacups on their hooks already)
        if (LV) return;
        // plates on edge against the back, held by the rail, cups in front of them
        for (let k = 0, x = x0 + 0.16; x < x1 - 0.12; k++, x += rr(0.25, 0.29)) {
          // (a coloured band around the rim: the plate in that colour, its middle in front of it)
          const r = rr(0.105, 0.13), pg = grp(g, x, y + r * 0.98, -d / 2 + 0.06);
          pg.rotation.x = Math.PI / 2 - 0.22;
          mk(Geo.cyl(r, r, 0.012, 18), Mat.lam(pickR([0x3a5a8a, 0x8a3a2a, 0x5a7a4a, 0xb8903e, 0x2a3a5a])), 0, 0, 0, pg, NC);
          mk(Geo.cyl(r * 0.8, r * 0.8, 0.004, 18), Mat.lam(pickR([0xe8e0cc, 0xdcd4c0, 0xe6dcc4])), 0, 0.007, 0, pg, NC);
        }
        mk(Geo.box(x1 - x0, 0.014, 0.014), paintIn, 0, y + 0.07, -d / 2 + 0.11, g, NC);
        for (const cx of [x0 + 0.35, x0 + 0.95, x1 - 0.5]) cup(g, cx, y, 0.1, pickR([0xe8e0cc, 0x8a3a2a, 0x46628a]));
      } else { crock(g, x0 + 0.22, y, 0.02, 0.11, 0.24, 0x8a5a36); K('props_common', 'Vase', g, x0 + 0.8, y, 0.02, 0, 0.82); cans(g, x0 + 1.1, x0 + 1.55, y, 0.05); crock(g, x1 - 0.2, y, 0.02, 0.09, 0.18, 0xc8b894); }
    }, paintIn, 'KitchenDresser');
    unit('kitchen', 12.05, 0.35, 0, 1.5, 2.1, 0.38, 5, shelfWood, (g, i, y, x0, x1, hh) => {
      if (i === 0) { K('props_common', 'CardboardBox', g, x0 + 0.32, y, 0.0, 0.2, 0.74); K('props_common', 'Jar', g, x1 - 0.24, y, 0.02, 2.0); }
      else if (i % 2) cans(g, x0, x1, y, 0.05);
      else packs(g, x0, x1, y, 0, hh);
    }, shelfWood, 'PantryShelf');
    if (!this.wallKit('props_lived', 'SpiceShelves', 'z', 14, 9.7, 0, -1)) {
      const ws = new THREE.Group();
      for (const y of [1.28, 1.7]) {
        mk(Geo.box(1.9, 0.03, 0.24), shelfWood, 0, y, 0.12, ws, NC);
        for (const bx of [-0.75, 0.75]) mk(Geo.box(0.03, 0.14, 0.16), darkWood, bx, y - 0.085, 0.09, ws, NC);
        for (let x = -0.85; x < 0.85; x += rr(0.07, 0.11)) { if (rng() < 0.2) continue; mk(Geo.cyl(0.03, 0.03, rr(0.08, 0.12), 8), Mat.lam(pickR([0xe8e0d0, 0xb03a2a, 0x7a5a3a, 0x3a6a3a, 0xd8b04a])), x, y + 0.075, 0.12, ws, NC); }
      }
      crock(ws, 0.6, 1.715, 0.12, 0.07, 0.15, 0x6a7a5a);
      this.wallDecor('z', 14, 9.7, 0, -1, ws);
    }
    // a rag runner along the counter, a braided rug under the table
    const runM = addWear(Mat.tex(ragRugTexture('kitchen', ['#8a3a2a', '#c89a4a', '#3a5a7a', '#d8ccb0', '#6a7a4a', '#a05a3a']), { rough: 1 }), 0.8, true);
    mk(flatRug(1.4, 1.0, 6.4, 1.75, 0.012), runM, 0, 0, 0, SK, NC);
    const brM = addWear(this.surf('rug_braided', { alphaTest: 0.5, color: 0xd0bca0 }) || Mat.tex(rugTexture('braided'), { color: 0xd0bca0 }), 0.8, true);
    const br = mk(Geo.circle(1, 48), brM, 3.7, 0.012, 7.8, SK, { rx: -Math.PI / 2, cast: false });
    br.scale.set(2.15, 1.65, 1);

    // ---- hall: a bookcase in the corner by the window, a doormat inside the front door ----
    const SH = this.statics.hall;
    if (K('props_living', 'Bookshelf_240', SH, 12.55, 0, 23.615, Math.PI, null, true)) this.colRect(12.55, 23.6, 2.5, 0.5, Math.PI, { h: 2.3, shots: true });
    else this.bookshelf(SH, 12.55, 23.6, Math.PI, 2.4, 2.2);
    {
      const g = new THREE.PlaneGeometry(1.0, 0.66); g.rotateX(-Math.PI / 2); g.rotateY(Math.PI / 2); g.translate(0.55, 0.013, 17.8);
      mk(g, addWear(Mat.tex(doormatTexture(), { rough: 1 }), 0.6, true), 0, 0, 0, SH, NC);
    }

    // ---- living room: a second bookcase and a record cabinet on the wall to the bedroom, an old persian rug
    // under the reading chair, newspapers piled by it ----
    const SL = this.statics.living;
    if (K('props_living', 'Bookshelf_240', SL, 21.85, 0, 11.615, Math.PI, null, true)) this.colRect(21.85, 11.6, 2.5, 0.5, Math.PI, { h: 2.3, shots: true });
    else this.bookshelf(SL, 21.85, 11.6, Math.PI, 2.4, 2.2);
    const recKit = K('props_lived', 'RecordCabinet', SL, 18.1, 0, 11.6, Math.PI, null, true);
    if (recKit) {
      // the teak sideboard (records inside), the turntable on top with its lid up, sleeves leaning on the wall
      // (the wall is 0.25 behind the cabinet's centre line), a few lying in a pile
      const gs = twin('living', recKit), top = 0.765;
      this.colRect(18.1, 11.6, 1.85, 0.5, Math.PI, { h: 0.8 });
      K('props_lived', 'RecordPlayer', gs, -0.35, top, 0.035, 0);
      K('props_lived', 'LPLean', gs, 0.22, top, -0.15, 0);
      K('props_lived', 'LPPile', gs, 0.68, top, 0.03, 0.3);
    } else {
      const g = this.cabinet(SL, 18.1, 11.6, Math.PI, 1.8, 0.45, 0.72, darkWood, Mat.lam(0x5a3a22), true), gs = twin('living', g);
      this.colRect(18.1, 11.6, 1.85, 0.5, Math.PI, { h: 0.8 });
      // the record player on top, records leaning beside it, a pile of them
      const tt = grp(gs, -0.35, 0.745, 0);
      mk(Geo.box(0.46, 0.1, 0.36), Mat.lam(0x2a201a), 0, 0.05, 0, tt, NC);
      mk(Geo.cyl(0.15, 0.15, 0.015, 24), Mat.lam(0x111114), 0, 0.105, 0, tt, NC);
      mk(Geo.cyl(0.04, 0.04, 0.017, 12), Mat.lam(0xb03a2a), 0, 0.107, 0, tt, NC);
      mk(Geo.box(0.02, 0.015, 0.22), Mat.lam(0xb8b8bc), 0.17, 0.12, 0.02, tt, { ry: 0.35, cast: false });
      for (let k = 0; k < 9; k++) mk(Geo.box(0.006, 0.31, 0.31), Mat.lam(pickR([0x1a1a1a, 0xc83a2a, 0xe8d8b0, 0x3a5a9a, 0xd8a02a, 0x5a2a4a])), 0.25 + k * 0.012, 0.745 + 0.155, 0, gs, { rz: 0.12, cast: false });
      pile(gs, 0.62, 0.745, 0.02, 4, 0.3, 0.22);
    }
    const persM = addWear(Mat.tex(persianRugTexture(), { rough: 1 }), 0.8, true);
    mk(flatRug(15.2, 1.3, 18.6, 3.8, 0.012), persM, 0, 0, 0, SL, NC);
    pile(SMALL.living, 17.75, 0, 3.55, 6, 0.3, 0.22, 'NewspaperPile');

    // ---- bedroom: a shelf of books and toys on the wall to the hall, a low one in the corner by the guitar and the
    // amp (the posters over them; the arcade machine stands where it was), a shaggy rug by the bed ----
    const SB = this.statics.bedroom;
    unit('bedroom', 14.33, 15.4, Math.PI / 2, 2.0, 1.75, 0.34, 4, shelfWood, (g, i, y, x0, x1, hh) => {
      if (i === 0) { K('props_living', 'ToyBlocks', g, x0 + 0.3, y, 0.02, 0.4, 0.9); pile(g, x0 + 0.85, y, 0.02, 7, 0.22, 0.16); K('props_common', 'CardboardBox', g, x1 - 0.32, y, 0.0, 0.1, 0.62); }
      else if (i === 1) { books(g, x0, x0 + 1.15, y, -0.02, hh); K('props_living', 'VHSTapes', g, x1 - 0.4, y, 0.02, 0.2); K('props_living', 'VHSTapes', g, x1 - 0.15, y, 0.02, -0.3); }
      else if (i === 2) { books(g, x0, x1, y, -0.02, hh); }
      else { K('props_living', 'Plush_C', g, x0 + 0.25, y, 0.02, 0.3, 0.8); books(g, x0 + 0.55, x1 - 0.45, y, -0.02, hh); pile(g, x1 - 0.2, y, 0.02, 5, 0.2, 0.15); }
    }, shelfWood, 'ShelfUnit_Tall');
    unit('bedroom', 28.2, 23.68, Math.PI, 2.0, 0.85, 0.34, 2, shelfWood, (g, i, y, x0, x1, hh) => {
      if (i === 0) { pile(g, x0 + 0.2, y, 0.02, 9, 0.22, 0.16); books(g, x0 + 0.45, x0 + 1.2, y, -0.02, hh); K('props_living', 'VHSTapes', g, x1 - 0.2, y, 0.02, 0.1); }
      else {
        if (!(LV && K('props_lived', 'CassetteRow', g, x0 + 0.21, y, 0.04, 0))) for (let k = 0; k < 12; k++) mk(Geo.box(0.018, 0.11, 0.07), Mat.lam(pickR([0x1a1a1a, 0xd8d0c0, 0xc83a2a, 0x3a5a9a])), x0 + 0.1 + k * 0.025, y + 0.055, 0.04, g, NC);
        K('props_bedroom', 'AlarmClock', g, x0 + 0.75, y, 0.05, 0.2); pile(g, x1 - 0.3, y, 0.02, 3, 0.26, 0.2);
      }
    }, shelfWood, 'ShelfUnit_Low');
    mk(flatRug(25.4, 15.6, 26.7, 17.4, 0.013), addWear(Mat.tex(shagRugTexture(), { rough: 1, alphaTest: 0.5 }), 0.7, true), 0, 0, 0, SB, NC);
    // a teenager's room: a stereo cabinet on the wall to the hall (the boombox and the tapes on it), a little TV on
    // a stand in the corner by the desk with a beanbag in front of it, an armchair in the corner by the door to the
    // living room, an amplifier and a guitar against the wall by the window, a cork board over the desk
    {
      // (the kit cabinet: the hi-fi behind its smoked glass door, CDs and tapes in the open bay; its top at 0.67 too)
      const cab = K('props_lived', 'StereoCabinet', SB, 14.42, 0, 17.95, Math.PI / 2, null, true) || this.cabinet(SB, 14.42, 17.95, Math.PI / 2, 1.2, 0.45, 0.62, Mat.lam(0x5a3a22), darkWood, true);
      this.colRect(14.42, 17.95, 1.2, 0.47, Math.PI / 2, { h: 0.7 });
      const top = twin('bedroom', cab);
      if (!K('props_bedroom', 'Boombox', top, 0.16, 0.67, 0.02)) {
        const bb = grp(top, 0.16, 0.67, 0.02);
        mk(Geo.box(0.6, 0.3, 0.18), Mat.lam(0x222226), 0, 0.15, 0, bb, NC);
        for (const lx of [-0.18, 0.18]) mk(Geo.cyl(0.1, 0.1, 0.02, 10), Mat.lam(0x111111), lx, 0.15, 0.09, bb, { rx: Math.PI / 2, cast: false });
      }
      if (LV) { K('props_lived', 'CassetteStack', top, -0.36, 0.67, 0.02, rr(-0.2, 0.2)); K('props_lived', 'CDStack', top, -0.51, 0.67, 0.0, rr(-0.15, 0.15)); }
      else {
        for (let k = 0, y = 0.67; k < 6; k++, y += 0.017) mk(Geo.box(0.11, 0.016, 0.07), Mat.lam(pickR([0x2a2a30, 0x3a3a44, 0xd8d0c0])), -0.36 + rr(-0.01, 0.01), y + 0.008, 0.02, top, { ry: rr(-0.2, 0.2), cast: false });
        for (let k = 0, y = 0.67; k < 4; k++, y += 0.011) mk(Geo.box(0.142, 0.01, 0.125), Mat.lam(pickR([0x9aa0a8, 0x1a1a1a, 0x8a3a2a])), -0.51 + rr(-0.008, 0.008), y + 0.005, 0.0, top, { ry: rr(-0.12, 0.12), cast: false });
      }
    }
    {
      if (!K('props_living', 'TVStand', SB, 15.15, 0, 23.53, Math.PI, null, true)) this.cabinet(SB, 15.15, 23.53, Math.PI, 1.6, 0.6, 0.6, darkWood, darkWood, false);
      this.colRect(15.15, 23.53, 1.66, 0.64, Math.PI, { h: 1.05 });
      // a little portable TV with rabbit ears, switched off
      if (K('props_lived', 'PortableTV', SB, 15.05, 0.6, 23.45, Math.PI, null, true)) { /* kit */ } else {
      const tv = grp(SB, 15.05, 0.6, 23.45, Math.PI), plastic = Mat.lam(0x2c2c30);
      mk(Geo.box(0.5, 0.42, 0.38), plastic, 0, 0.21, 0, tv);
      mk(Geo.box(0.38, 0.32, 0.16), plastic, 0, 0.2, -0.26, tv);
      mk(Geo.plane(0.36, 0.27), Mat.lam(0x0e1216, { rough: 0.25 }), -0.04, 0.22, 0.191, tv, { cast: false });
      mk(Geo.box(0.07, 0.26, 0.004), Mat.lam(0x18181a), 0.19, 0.21, 0.191, tv, { cast: false });
      for (const k of [0, 1]) mk(Geo.cyl(0.012, 0.012, 0.012, 8), Mat.lam(0x9a9aa0), 0.19, 0.3 - k * 0.05, 0.196, tv, { rx: Math.PI / 2, cast: false });
      mk(Geo.sph(0.035, 8, 6), Mat.lam(0x2a2a2c), 0, 0.43, -0.06, tv, { sy: 0.5, cast: false });
      for (const sd of [-1, 1]) mk(Geo.cyl(0.004, 0.004, 0.44, 4), Mat.lam(0xa0a0a6, { metal: 0.5, rough: 0.5 }), sd * 0.093, 0.63, -0.06, tv, { rz: -sd * 0.45, cast: false });
      }
      // the beanbag: a sack sagging where you sit, higher at the back (turned to face the TV)
      if (K('props_lived', 'Beanbag', SB, 15.8, 0, 22.0, -0.35, null, true)) { /* kit */ } else {
      const bg = new THREE.SphereGeometry(0.5, 20, 14), bp = bg.attributes.position;
      for (let i = 0; i < bp.count; i++) {
        let x = bp.getX(i), y = bp.getY(i) * 0.56, z = bp.getZ(i);
        if (y > 0) y += -0.13 * Math.exp(-(x * x + z * z) / 0.06) + 0.07 * Math.max(0, -z) / 0.5;
        else { x *= 1.08; z *= 1.08; y = Math.max(y, -0.24); }
        bp.setXYZ(i, x, y + 0.24, z);
      }
      bg.computeVertexNormals();
      mk(bg, Mat.lam(0x4a3a72), 15.8, 0, 22.0, SB, { ry: 0.3 });
      }
      this.colRect(15.8, 22.0, 0.95, 0.95, 0, { h: 0.5, low: true });
    }
    if (!K('props_living', 'Armchair', SB, 28.75, 0, 13.1, -Math.PI / 4, null, true)) this.armchair(SB, 28.75, 13.1, -Math.PI / 4, Mat.lam(0x6a2a2a));
    else this.colRect(28.75, 13.1, 1.3, 1.3, 0, { h: 0.9 });
    if (LV && K('props_lived', 'GuitarAmp', SB, 29.6, 0, 23.38, -Math.PI / 2, null, true)) {
      this.colRect(29.6, 23.38, 0.44, 0.27, -Math.PI / 2, { h: 0.45, low: true });
      // the guitar leans on the wall beside it, its face to the room, plugged into the amp (the cable is the amp's)
      const gtr = grp(SB, 29.58, 0, 22.55, -Math.PI / 2), g2 = K('props_lived', 'ElectricGuitar', gtr, 0, 0, 0, 0, null, true);
      if (g2) g2.rotation.x = -0.21;
      // the handheld game left on the floor by the beanbag
      K('props_lived', 'HandheldGame', SMALL.bedroom, 15.22, 0, 21.52, 2.2);
    } else {
      const amp = grp(SB, 29.6, 0, 23.38, -Math.PI / 2);
      mk(Geo.box(0.44, 0.42, 0.25), Mat.lam(0x1c1c1e), 0, 0.21, 0, amp);
      mk(Geo.box(0.38, 0.27, 0.004), Mat.lam(0x3a3632), 0, 0.17, 0.127, amp, NC);
      mk(Geo.box(0.42, 0.05, 0.004), Mat.lam(0x2a2a2c), 0, 0.365, 0.127, amp, NC);
      for (let k = 0; k < 5; k++) mk(Geo.cyl(0.011, 0.011, 0.014, 8), Mat.lam(0xd8d4c8), -0.14 + k * 0.055, 0.365, 0.133, amp, { rx: Math.PI / 2, cast: false });
      mk(Geo.box(0.1, 0.025, 0.004), Mat.lam(0xd8d0b8), 0.13, 0.29, 0.13, amp, NC);
      this.colRect(29.6, 23.38, 0.44, 0.27, -Math.PI / 2, { h: 0.45, low: true });
      // the guitar leans on the wall beside it, its face to the room
      const gtr = grp(SB, 29.58, 0, 22.55, -Math.PI / 2), tilt = grp(gtr), maple = Mat.lam(0xd8b070);
      tilt.rotation.x = -0.21;
      const body = new THREE.Shape();
      body.moveTo(0, 0); body.quadraticCurveTo(0.17, 0.0, 0.165, 0.13); body.quadraticCurveTo(0.16, 0.2, 0.12, 0.25); body.quadraticCurveTo(0.16, 0.33, 0.125, 0.43);
      body.quadraticCurveTo(0.08, 0.38, 0.035, 0.37); body.lineTo(-0.035, 0.37); body.quadraticCurveTo(-0.09, 0.37, -0.11, 0.4); body.quadraticCurveTo(-0.15, 0.31, -0.12, 0.25);
      body.quadraticCurveTo(-0.16, 0.19, -0.165, 0.13); body.quadraticCurveTo(-0.17, 0.0, 0, 0);
      mk(new THREE.ExtrudeGeometry(body, { depth: 0.04, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 1, curveSegments: 6 }), Mat.lam(0x7a1414, { rough: 0.25 }), 0, 0.006, -0.02, tilt);
      const pg = new THREE.Shape(); pg.absellipse(0.03, 0.22, 0.1, 0.14, 0, TAU, false, 0.3);
      mk(new THREE.ShapeGeometry(pg, 12), Mat.lam(0xe8e0cc), 0, 0, 0.0275, tilt, NC);
      for (const y of [0.16, 0.22, 0.28]) mk(Geo.box(0.07, 0.018, 0.006), Mat.lam(0xf0ece0), 0, y, 0.031, tilt, NC);
      mk(Geo.box(0.075, 0.03, 0.01), Mat.lam(0xa0a0a6, { metal: 0.5, rough: 0.5 }), 0, 0.095, 0.032, tilt, NC);
      for (const [kx, ky] of [[0.085, 0.07], [0.105, 0.115], [0.115, 0.16]]) mk(Geo.cyl(0.012, 0.012, 0.012, 8), Mat.lam(0xe8e0cc), kx, ky, 0.034, tilt, { rx: Math.PI / 2, cast: false });
      mk(Geo.box(0.052, 0.62, 0.024), maple, 0, 0.66, 0.004, tilt);
      mk(Geo.box(0.049, 0.58, 0.005), Mat.lam(0x3a2418), 0, 0.68, 0.018, tilt, NC);
      mk(Geo.box(0.085, 0.17, 0.018), maple, 0.014, 1.055, 0, tilt);
    }
    if (!this.wallKit('props_lived', 'CorkBoard', 'x', 24, 18.0, 1.62, -1)) this.wallDecor('x', 24, 18.0, 1.62, -1, this.frame(0.9, 0.6, corkBoardTexture(), 0x5a3a22));

    // ---- cobwebs up in the far corners of every room ----
    const webM = new THREE.MeshStandardMaterial({ map: cobwebTexture(true), color: 0xb8b4ac, transparent: true, opacity: 0.62, depthWrite: false, side: THREE.DoubleSide, roughness: 1, metalness: 0 });
    for (const k of ['hall', 'kitchen', 'living', 'bedroom']) {
      const R = ROOMS[k];
      for (const [cx, sx] of [[R.x0 + 0.15, 1], [R.x1 - 0.15, -1]]) {
        const cz = R.z0 + 0.15, s = rr(0.75, 1.0), web = mk(Geo.plane(1, 1), webM, cx + sx * 0.34 * s, WALL_H - 0.47 * s, cz + 0.34 * s, null, { ry: sx * Math.PI / 4, cast: false, receive: false });
        web.scale.setScalar(s); web.renderOrder = 2;
        // (they come and go with a wall behind them: the one in the east corner with the east wall, which is cut
        // away from above while you are in the room, and the web would hang there from nothing)
        const u = sx > 0 ? this.wallUnit('x', R.z0, cx + 0.5) : this.wallUnit('z', R.x1, cz + 0.5);
        (u ? u.decorGroup : this.dyn).add(web);
      }
    }
  },

  // ------------------------------------------------------------------
  //  People live here: clothes on the bedroom floor and over the furniture, a console and its controllers in front
  //  of the TV, shoes and a schoolbag in the hall, mail on the table, dishes waiting by the sink, groceries not
  //  put away, a blanket left on the sofa, cans, tapes, slippers, toys. All of it small and flat enough to walk
  //  over (no colliders), merged with each room's small things (no shadows of their own)
  // ------------------------------------------------------------------
  buildMess() {
    const rng = mulberry32(1996), rr = (a, b) => a + (b - a) * rng(), pickR = (a) => a[Math.floor(rng() * a.length)];
    const SM = this.clutter, NC = { cast: false };
    const TIN = Mat.lam(0x8e8c86, { metal: 0.5, rough: 0.5 });
    // (the kit versions of all of it: props_lived; the primitives below stay as the fallback)
    const LV = this.hasKit('props_lived', 'Sneaker_Red');
    const KM = (node, room, x, y, z, ry = 0, o = {}) => (LV ? this.kit('props_lived', node, SM[room], x, y, z, ry, Object.assign({ cast: false }, o)) : null);
    // (things on the floor lie on the rugs where there is one)
    const RUGS = [[19.5, 15.5, 24.5, 21.5], [15.2, 1.3, 18.6, 3.8], [1.2, 16.8, 9.5, 18.8], [1.4, 1.0, 6.4, 1.75], [25.4, 15.6, 26.7, 17.4], [0.22, 17.3, 0.88, 18.3]];
    const OVALS = [[21.5, 6.2, 3.8, 2.6], [3.7, 7.8, 2.15, 1.65]];
    const fy = (x, z) => (RUGS.some(([a, b, c, d]) => x > a - 0.25 && x < c + 0.25 && z > b - 0.25 && z < d + 0.25) || OVALS.some(([cx, cz, ax, az]) => ((x - cx) / (ax + 0.25)) ** 2 + ((z - cz) / (az + 0.25)) ** 2 < 1)) ? 0.014 : 0;
    const clothM = new THREE.MeshStandardMaterial({ map: clothesTexture(), alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.95, metalness: 0 });
    let seed = 1;
    // a garment lying crumpled at x, z (y0: on something), turned ry; s shrinks it (bunched up)
    const cloth = (room, kind, x, z, ry, o = {}) => {
      const m = mk(clothGeo(kind, Object.assign({ seed: seed++, y0: o.y0 ?? fy(x, z) }, o)), clothM, x, 0, z, SM[room], { ry, cast: false });
      if (o.s) m.scale.set(o.s, 1, o.s);
      return m;
    };
    // a garment hung over a bar or an edge at x, y, z (the bar along local x, turned ry; sx: narrower along the bar)
    const drape = (room, kind, x, y, z, ry, o = {}) => { const m = mk(drapeGeo(kind, Object.assign({ seed: seed++ }, o)), clothM, x, y, z, SM[room], { ry, cast: false }); if (o.sx) m.scale.x = o.sx; return m; };
    const sneaker = (room, x, z, ry, col, side = 0) => {
      if (KM(col === 0x8a1e1e ? 'Sneaker_Red' : 'Sneaker_Blue', room, x, fy(x, z) + (side ? 0.046 : 0), z, ry, side ? { rz: side * 1.42 } : {})) return;
      const g = grp(SM[room], x, fy(x, z), z, ry);
      if (side) { g.rotation.z = side * 1.4; g.position.y += 0.042; }
      mk(Geo.capsule(0.044, 0.2), Mat.lam(0xe6e2d8), 0, 0.02, 0, g, { rx: Math.PI / 2, sz: 0.46, cast: false });
      mk(sneakerGeo(), Mat.lam(col), 0, 0, 0, g, NC);
      mk(Geo.circle(0.03, 12), Mat.lam(0x1a1414), 0, 0.095, -0.075, g, { rx: -Math.PI / 2, sy: 1.25, cast: false });
      for (let k = 0; k < 3; k++) mk(Geo.box(0.05, 0.005, 0.008), Mat.lam(0xe8e4dc), 0, 0.104 - k * 0.0075, k * 0.025, g, NC);
    };
    const can = (room, x, y, z, col, lying = false, crushed = false) => {
      if (KM(crushed ? 'SodaCan_Crushed' : col === 0xb02a1e ? 'SodaCan_Red' : 'SodaCan_Green', room, x, y + (lying ? 0.033 : 0), z, rr(0, TAU), lying ? { rz: Math.PI / 2 } : {})) return;
      const g = grp(SM[room], x, y + (lying ? 0.033 : 0), z, rr(0, TAU)), h = crushed ? 0.07 : 0.12;
      if (lying) g.rotation.z = Math.PI / 2;
      mk(Geo.cyl(0.033, 0.033, h, 12), Mat.lam(col), 0, h / 2, 0, g, NC);
      mk(Geo.cyl(0.029, 0.033, 0.008, 12), TIN, 0, h + 0.004, 0, g, NC);
    };
    const flat = (room, x, y, z, ry, w, d, col, t = 0.004) => mk(Geo.box(w, t, d), Mat.lam(col), x, y + t / 2, z, SM[room], { ry, cast: false });
    const magazine = (room, x, z, ry, col) => {
      if (KM(col === 0x3a6aa8 ? 'Magazine_Open_A' : 'Magazine_Open_B', room, x, fy(x, z), z, ry)) return;
      const g = grp(SM[room], x, fy(x, z), z, ry);
      for (const sd of [-1, 1]) mk(Geo.box(0.2, 0.005, 0.27), Mat.lam(sd < 0 ? 0xe8e4d8 : 0xdcd6c8), sd * 0.1, 0.006, 0, g, { rz: -sd * 0.05, cast: false });
      mk(Geo.box(0.13, 0.002, 0.15), Mat.lam(col), -0.1, 0.0125, -0.04, g, NC);
      mk(Geo.box(0.15, 0.002, 0.05), Mat.lam(0x6a6a6a), 0.1, 0.0125, 0.06, g, NC);
    };
    let tapeK = 0;
    const tape = (room, x, y, z, ry) => { if (KM(['Cassette_A', 'CassetteCase', 'Cassette_B'][tapeK++ % 3], room, x, y, z, ry)) return; mk(Geo.box(0.1, 0.016, 0.064), Mat.lam(pickR([0x2a2a30, 0x3a3a44])), x, y + 0.008, z, SM[room], { ry, cast: false }); mk(Geo.box(0.072, 0.002, 0.03), Mat.lam(pickR([0xe8e4d8, 0xd8b84a, 0xc84a3a])), x, y + 0.017, z, SM[room], { ry, cast: false }); };
    // a schoolbag leaning on the wall (its back to it): a padded body, a front pocket, a zip, straps, a loop
    const backpack = (room, x, z, ry, col, pocket, lean = -0.18) => {
      if (KM(col === 0x26344e ? 'Backpack_Navy' : 'Backpack_Red', room, x, 0, z, ry)) return;
      const o = grp(SM[room], x, 0, z, ry), g = grp(o);
      g.rotation.x = lean;
      mk(roundedBoxGeo(0.31, 0.43, 0.15, 0.055), Mat.lam(col), 0, 0.215, 0, g, NC);
      mk(roundedBoxGeo(0.24, 0.17, 0.07, 0.03), Mat.lam(pocket), 0, 0.14, 0.085, g, NC);
      mk(Geo.box(0.2, 0.008, 0.006), Mat.lam(0x1a1a1a), 0, 0.2, 0.12, g, NC);
      mk(Geo.box(0.006, 0.3, 0.006), Mat.lam(0x1a1a1a), -0.12, 0.25, 0.077, g, NC);
      for (const sx of [-0.08, 0.08]) mk(Geo.box(0.045, 0.34, 0.012), Mat.lam(0x1a1a1a), sx, 0.24, -0.08, g, NC);
      mk(Geo.torus(0.03, 0.008, 4, 10), Mat.lam(0x1a1a1a), 0, 0.445, -0.02, g, NC);
    };
    const mug = (room, x, y, z, col) => {
      if (KM(col === 0x8a3a2a ? 'Mug_Red' : col === 0xd8c060 ? 'Mug_Yellow' : 'Mug_White', room, x, y, z, rr(0, TAU))) return;
      const g = grp(SM[room], x, y, z, rr(0, TAU));
      mk(Geo.cyl(0.04, 0.037, 0.095, 12), Mat.lam(col), 0, 0.0475, 0, g, NC);
      mk(Geo.torus(0.025, 0.007, 5, 10), Mat.lam(col), 0.046, 0.05, 0, g, NC);
      mk(Geo.cyl(0.034, 0.034, 0.002, 12), Mat.lam(0x2a1a10), 0, 0.082, 0, g, NC);
    };
    const plates = (room, x, y, z, n) => { if (KM('DirtyPlates', room, x, y, z, rr(0, TAU))) return; for (let k = 0; k < n; k++) mk(Geo.cyl(0.115, 0.1, 0.014, 18), Mat.lam(pickR([0xe8e0cc, 0xdcd4c0])), x + rr(-0.012, 0.012), y + 0.007 + k * 0.015, z + rr(-0.012, 0.012), SM[room], NC); mk(Geo.cyl(0.05, 0.05, 0.002, 10), Mat.lam(0x8a6a3a), x, y + n * 0.015 + 0.001, z + 0.02, SM[room], NC); };
    const slipper = (room, x, z, ry, col) => {
      if (KM('Slipper', room, x, fy(x, z), z, ry)) return;
      const g = grp(SM[room], x, fy(x, z), z, ry);
      mk(Geo.capsule(0.05, 0.16), Mat.lam(col), 0, 0.03, 0, g, { rx: Math.PI / 2, sx: 1.05, sz: 0.55, cast: false });
      mk(Geo.circle(0.035, 10), Mat.lam(0x2a1e22), 0, 0.058, -0.045, g, { rx: -Math.PI / 2, sy: 1.4, cast: false });
    };

    // ---- bedroom: clothes everywhere, the console on the floor in front of the TV ----
    cloth('bedroom', 'jeans', 16.1, 13.8, 0.6, { amp: 0.03, lump: 0.03 });
    cloth('bedroom', 'band', 25.85, 18.8, 2.2);
    cloth('bedroom', 'tee', 20.85, 22.95, 0.9, { s: 0.85 });
    cloth('bedroom', 'towel', 26.3, 14.6, 0.4, { s: 0.85 });
    for (const [k, x, z, ry] of [['sockA', 26.2, 17.95, 1.1], ['sockA', 26.55, 18.3, 2.6], ['sockB', 16.55, 21.2, 0.4], ['sockB', 19.45, 14.35, -0.7], ['sockA', 23.6, 13.45, 2.0], ['sockB', 22.6, 20.9, 1.4]]) cloth('bedroom', k, x, z, ry);
    // a pile of clothes on the armchair, a hoodie over the back of the desk chair
    {
      const cx = 28.69, cz = 13.16, ry = -Math.PI / 4;
      cloth('bedroom', 'jeans', cx, cz, ry + 0.3, { y0: 0.645, s: 0.66, lump: 0.08, amp: 0.035 });
      cloth('bedroom', 'flannel', cx + 0.03, cz - 0.02, ry - 0.5, { y0: 0.71, s: 0.68, lump: 0.08, amp: 0.035 });
      cloth('bedroom', 'tee', cx - 0.04, cz + 0.05, ry + 1.2, { y0: 0.78, s: 0.62, lump: 0.06, amp: 0.03 });
    }
    drape('bedroom', 'hoodie', 18.0, 0.985, 22.33, 0, { split: 0.42, R: 0.055, aA: 1.42, aB: 1.32, dropA: 0.985, dropB: 0.49 });
    sneaker('bedroom', 15.55, 19.05, 1.2, 0x8a1e1e); sneaker('bedroom', 15.85, 19.3, 0.5, 0x8a1e1e, 1);
    magazine('bedroom', 24.15, 19.6, 0.5, 0x3a6aa8); magazine('bedroom', 25.75, 19.35, -0.4, 0xc8a03a);
    backpack('bedroom', 19.05, 23.45, Math.PI, 0x26344e, 0x1c2638);
    for (const [x, z, ry] of [[14.95, 17.6, 0.4], [15.2, 18.15, 2.1], [15.05, 17.95, 1.2]]) tape('bedroom', x, fy(x, z), z, ry);
    // pizza box and cans by the beanbag
    if (KM('PizzaBox', 'bedroom', 16.75, 0, 22.95, 0.3)) { can('bedroom', 16.95, 0, 22.42, 0xb02a1e); can('bedroom', 16.5, 0, 21.62, 0x2a7a3a, true); } else {
      const g = grp(SM.bedroom, 16.75, 0, 22.95, 0.3);
      mk(Geo.box(0.36, 0.04, 0.36), Mat.lam(0xd8c8a8), 0, 0.02, 0, g, NC);
      mk(Geo.box(0.3, 0.002, 0.07), Mat.lam(0xb02a1e), 0, 0.041, -0.09, g, NC);
      mk(Geo.box(0.12, 0.002, 0.12), Mat.lam(0x2a6a3a), 0.06, 0.041, 0.07, g, NC);
      can('bedroom', 16.95, 0, 22.42, 0xb02a1e); can('bedroom', 16.5, 0, 21.62, 0x2a7a3a, true);
    }
    // the console and two controllers on their cords
    if (!KM('ConsoleSet', 'bedroom', 15.55, 0, 22.98, Math.PI)) {
      const cx = 15.55, cz = 22.98, g = grp(SM.bedroom, cx, 0, cz, Math.PI), grey = Mat.lam(0x8a8a90);
      mk(Geo.box(0.26, 0.06, 0.2), grey, 0, 0.03, 0, g, NC);
      mk(Geo.box(0.12, 0.006, 0.1), Mat.lam(0x4a4a50), -0.04, 0.062, -0.02, g, NC);
      mk(Geo.box(0.1, 0.05, 0.016), Mat.lam(0x3a3a3e), -0.04, 0.085, -0.02, g, NC);
      mk(Geo.box(0.03, 0.012, 0.006), Mat.lam(0xb03030), 0.08, 0.04, 0.101, g, NC);
      const pad = (x, z, ry) => {
        const p = grp(SM.bedroom, x, 0, z, ry);
        mk(Geo.box(0.13, 0.022, 0.055), grey, 0, 0.011, 0, p, NC);
        for (const sd of [-1, 1]) mk(Geo.sph(0.032, 8, 6), grey, sd * 0.06, 0.011, 0.012, p, { sy: 0.4, cast: false });
        mk(Geo.box(0.03, 0.004, 0.012), Mat.lam(0x2a2a2a), -0.04, 0.024, 0, p, NC); mk(Geo.box(0.012, 0.004, 0.03), Mat.lam(0x2a2a2a), -0.04, 0.024, 0, p, NC);
        for (const [bx, bz, c] of [[0.035, -0.006, 0xb03030], [0.052, 0.008, 0x3050b0]]) mk(Geo.cyl(0.008, 0.008, 0.006, 8), Mat.lam(c), bx, 0.024, bz, p, NC);
        return new THREE.Vector3(x - Math.sin(ry) * 0.03, 0.011, z - Math.cos(ry) * 0.03);
      };
      for (const [px, pz, ry, sx] of [[15.15, 22.6, 0.5, -0.05], [16.3, 22.68, -0.4, 0.05]]) {
        const end = pad(px, pz, ry), start = new THREE.Vector3(cx - sx, 0.03, cz - 0.1);
        const pts = [start, new THREE.Vector3(start.x, 0.005, start.z - 0.06)];
        for (let k = 1; k < 4; k++) { const f = k / 4; pts.push(new THREE.Vector3(start.x + (end.x - start.x) * f + rr(-0.08, 0.08), 0.005, start.z - 0.06 + (end.z - start.z + 0.06) * f + rr(-0.06, 0.06))); }
        pts.push(end);
        mk(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 28, 0.0035, 4, false), Mat.lam(0x2a2a2a), 0, 0, 0, SM.bedroom, NC);
      }
    }

    // ---- hall: a shirt left on the bench, a schoolbag by it, sneakers kicked off by the door, mail on the table ----
    drape('hall', 'flannel', 6.55, 0.495, 23.34, 0, { split: 0.45, R: 0.02, aA: 1.45, aB: 0, dropA: 0.495 });
    backpack('hall', 7.35, 23.48, Math.PI, 0x6a1e1e, 0x4a1414);
    sneaker('hall', 1.15, 18.85, 0.3, 0x2a3a6a); sneaker('hall', 1.45, 19.08, -0.5, 0x2a3a6a, -1);
    if (!KM('MailPile', 'hall', 0.43, 0.88, 20.82, 1.2)) for (let k = 0; k < 4; k++) flat('hall', 0.43 + rr(-0.03, 0.03), 0.88 + k * 0.004, 20.82 + rr(-0.03, 0.03), rr(-0.3, 0.3), k === 3 ? 0.2 : 0.16, k === 3 ? 0.14 : 0.1, [0xe8e4d8, 0xd8cfb8, 0xb8c8d8, 0xd85a3a][k], 0.003);

    // ---- kitchen: dishes by the sink, cereal and milk left out, a bag of groceries, breakfast on the table ----
    plates('kitchen', 5.0, 0.95, 0.42, 4);
    mug('kitchen', 5.27, 0.95, 0.58, 0xe8e0cc); mug('kitchen', 4.82, 0.95, 0.66, 0x8a3a2a);
    if (KM('CerealBox', 'kitchen', 2.5, 0.95, 0.34, 0.15)) KM('MilkCarton', 'kitchen', 2.8, 0.95, 0.42, -0.3);
    else {
      const g = grp(SM.kitchen, 2.5, 0.95, 0.34, 0.15);
      mk(Geo.box(0.2, 0.3, 0.07), Mat.lam(0xd8a02a), 0, 0.15, 0, g, NC);
      mk(Geo.box(0.14, 0.12, 0.002), Mat.lam(0xb02a1e), 0, 0.19, 0.036, g, NC);
      const m = grp(SM.kitchen, 2.8, 0.95, 0.42, -0.3);
      mk(Geo.box(0.075, 0.19, 0.075), Mat.lam(0xf0ece4), 0, 0.095, 0, m, NC);
      mk(Geo.box(0.077, 0.05, 0.077), Mat.lam(0x2a5aa8), 0, 0.12, 0, m, NC);
      mk(Geo.box(0.053, 0.053, 0.075), Mat.lam(0xf0ece4), 0, 0.19, 0, m, { rz: Math.PI / 4, cast: false });
    }
    if (!KM('GroceryBag', 'kitchen', 0.48, 0.95, 3.1, 0.3 + Math.PI / 2)) {
      const g = grp(SM.kitchen, 0.48, 0.95, 3.1, 0.3);
      mk(Geo.box(0.18, 0.36, 0.3), Mat.lam(0xb08a5a), 0, 0.18, 0, g, NC);
      mk(Geo.box(0.16, 0.004, 0.28), Mat.lam(0x4a3a28), 0, 0.358, 0, g, NC);
      mk(Geo.capsule(0.03, 0.28), Mat.lam(0xc8904a), 0.02, 0.42, -0.06, g, { rx: 0.35, cast: false });
      for (let k = 0; k < 3; k++) mk(Geo.cyl(0.012, 0.014, 0.3, 6), Mat.lam(0x6a9a3a), -0.03 + k * 0.012, 0.42, 0.06 + k * 0.025, g, { rx: -0.15 + k * 0.1, cast: false });
      mk(Geo.box(0.04, 0.2, 0.12), Mat.lam(0x3a6ab0), -0.04, 0.4, 0.0, g, NC);
    }
    mug('kitchen', 2.65, 0.8, 7.42, 0xd8c060);
    if (!KM('CerealBowl', 'kitchen', 2.82, 0.8, 8.28, 0.4)) {
      const g = grp(SM.kitchen, 2.82, 0.8, 8.28, 0.4);
      mk(new THREE.SphereGeometry(0.075, 14, 6, 0, TAU, Math.PI / 2, Math.PI / 2), Mat.lam(0xe8e0cc), 0, 0.07, 0, g, { cast: false });
      mk(Geo.cyl(0.066, 0.066, 0.002, 14), Mat.lam(0xf0ece4), 0, 0.055, 0, g, NC);
      mk(Geo.box(0.16, 0.006, 0.02), TIN, 0.05, 0.075, 0.0, g, { rz: -0.35, cast: false });
    }
    if (!KM('Newspaper', 'kitchen', 4.55, 0.8, 7.35, 0.25)) flat('kitchen', 4.55, 0.8, 7.35, 0.25, 0.3, 0.42, 0xd8d4c8, 0.008);

    // ---- living room: a blanket left over the arm of the sofa, cans on the coffee table, tapes on the floor by
    // the TV, slippers by the armchair, socks, toys out of the chest ----
    drape('living', 'blanket', 29.2, 0.75, 4.1, 0, { split: 0.4, R: 0.13, aA: 1.5, aB: 0.9, dropA: 0.75, dropB: 0.15, wr: 0.016, sx: 0.6 });
    can('living', 26.15, 0.48, 6.02, 0xb02a1e); can('living', 26.32, 0.48, 6.32, 0x2a7a3a, true); can('living', 27.45, 0, 4.4, 0xb02a1e, true, true);
    for (const [x, z, ry] of [[27.05, 1.8, 0.4], [27.28, 2.08, 1.9]]) { if (KM(x < 27.1 ? 'VHSTape_A' : 'VHSTape_B', 'living', x, fy(x, z), z, ry)) continue; mk(Geo.box(0.188, 0.026, 0.104), Mat.lam(0x161616), x, fy(x, z) + 0.013, z, SM.living, { ry, cast: false }); mk(Geo.box(0.16, 0.002, 0.04), Mat.lam(0xe8e4d8), x, fy(x, z) + 0.027, z, SM.living, { ry, cast: false }); }
    slipper('living', 16.45, 3.78, 0.2, 0x9a6a7a); slipper('living', 16.75, 3.92, -0.35, 0x9a6a7a);
    cloth('living', 'sockB', 27.7, 7.75, 0.3);
    for (const [x, z, ry, c] of [[15.7, 8.6, 0.4, 0x3a8aff], [15.95, 9.78, 1.1, 0xffd34a], [15.62, 10.25, 2.3, 0xff3a3a], [16.15, 9.15, 0.8, 0x5ad05a]]) if (LV) {
      // (each block tipped onto a different face: turned about its centre)
      const o = grp(SM.living, x, 0.04, z, ry), t = grp(o);
      t.rotation.set((c & 3) * Math.PI / 2, 0, ((c >> 4) & 3) * Math.PI / 2);
      this.kit('props_lived', 'AlphaBlock', t, 0, -0.04, 0, 0, { cast: false });
    } else mk(Geo.box(0.08, 0.08, 0.08), Mat.lam(c), x, 0.04, z, SM.living, { ry, cast: false });
  },

  // the age of the house: floors, walls and ceilings (and the rugs, the attic boards) wear their grime
  applyWear() {
    let di = 0;
    for (const k in this.doors) { const d = this.doors[k]; if (di < WEAR_U.doors.length) WEAR_U.doors[di++].set(d.axis === 'x' ? 0 : 1, d.c, d.s0, d.s1); }
    const amt = (m) => {
      const n = m.name || '';
      if (/^surf_floor_(wood|checker|carpet|concrete)/.test(n)) return 1;
      if (/^surf_wall_(hall|kitchen|living|bedroom|basement)/.test(n)) return 1;
      if (/^surf_ceiling/.test(n)) return 1;
      if (/^surf_rug/.test(n)) return 0.85;
      return 0;
    };
    for (const root of [this.root, this.attic]) root.traverse((o) => {
      if (!o.isMesh) return;
      for (const m of Array.isArray(o.material) ? o.material : [o.material]) {
        const a = amt(m);
        if (a) addWear(m, m.name.includes('floor_wood_light') && o.parent === this.attic ? 1.2 : a, /^surf_rug/.test(m.name));
      }
    });
  },

  // the attic while it shows: the bulb swings on its cord (its light goes with it), dust drifts in the light
  updateAttic(dt, t) {
    const A = this.attic;
    if (!A || !A.visible) return;
    const p = this.atticPend, sw = this.atticSwing;
    p.rotation.x = Math.sin(t * 2.45 + 0.7) * sw * 0.55;
    p.rotation.z = Math.sin(t * 2.52) * sw;
    p.updateMatrixWorld(true);
    const L = this.atticBulb;
    L.pos.copy(this.atticBulbAt).applyMatrix4(p.matrixWorld);
    const k = clamp(L.cur / (L.base * LIGHT_MUL), 0, 2);
    this.atticGlow.material.opacity = 0.6 * Math.min(1, k); this.atticGlow.scale.setScalar(0.65 + 0.35 * k);
    const D = this.atticDust, pos = D.geometry.attributes.position, b = D.userData.base;
    for (let i = 0; i < pos.count; i++) {
      const s = i * 1.37;
      pos.array[i * 3] = b[i * 3] + Math.sin(t * 0.21 + s) * 0.35;
      pos.array[i * 3 + 1] = ATTIC_Y + 0.3 + ((b[i * 3 + 1] - ATTIC_Y - 0.3 - t * 0.04 + s * 0.13) % 3.2 + 3.2) % 3.2;
      pos.array[i * 3 + 2] = b[i * 3 + 2] + Math.cos(t * 0.17 + s * 1.3) * 0.3;
    }
    pos.needsUpdate = true;
    D.material.opacity = 0.55 * Math.min(1, k);
    this.atticBeamMat.uniforms.uI.value = 0.15 + Math.sin(t * 0.31) * 0.03 + this.lightning * 0.4;
  },

  // breakable decor: smash for small loot (each keeps its own mesh to hide when smashed)
  addBreakable(kind, x, y, z, room) {
    const g = grp(this.dyn, x, y, z, rand(0, TAU));
    let col = 0x8a6a4a, r = 0.3;
    const node = { vase: 'Vase', jar: 'Jar', plate: 'PlateStack', box: 'CardboardBox', piggy: 'PiggyBank' }[kind];
    const k = node ? this.kit('props_common', node, g, 0, 0, 0, 0, { cast: false }) : null;
    if (kind === 'vase') { if (!k) { mk(Geo.cyl(0.08, 0.12, 0.35, 8), Mat.lam(0x3a6a8a), 0, 0.175, 0, g); mk(Geo.cyl(0.06, 0.08, 0.1, 8), Mat.lam(0x3a6a8a), 0, 0.4, 0, g); } col = 0x3a6a8a; r = 0.25; }
    else if (kind === 'jar') { if (!k) mk(Geo.cyl(0.14, 0.14, 0.32, 8), Mat.lam(0xb06a3a), 0, 0.16, 0, g); col = 0xb06a3a; }
    else if (kind === 'plate') { if (!k) for (let i = 0; i < 4; i++) mk(Geo.cyl(0.14, 0.12, 0.02, 10), Mat.lam(0xe8e4d8), 0, 0.012 + i * 0.022, 0, g); col = 0xe8e4d8; r = 0.25; }
    else if (kind === 'box') { if (!k) { mk(Geo.box(0.5, 0.45, 0.5), Mat.lam(0x9a7a4a), 0, 0.225, 0, g); mk(Geo.box(0.52, 0.03, 0.15), Mat.lam(0xc8b080), 0, 0.46, 0, g); } col = 0x9a7a4a; r = 0.4; }
    else if (kind === 'piggy') { if (!k) { mk(Geo.sph(0.13, 8, 6), Mat.lam(0xff9ab0), 0, 0.13, 0, g, { sx: 1.3 }); mk(Geo.cyl(0.05, 0.05, 0.05, 6), Mat.lam(0xff9ab0), 0.17, 0.14, 0, g, { rz: Math.PI / 2 }); } col = 0xff9ab0; r = 0.25; }
    const b = { kind, mesh: g, x, z, y, r, room, col, hp: kind === 'box' ? 2 : 1, alive: true };
    this.breakables.push(b);
    return b;
  },

  // ------------------------------------------------------------------
  //  Per-frame
  // ------------------------------------------------------------------
  update(dt, t) {
    // wall cutaway
    const p = Player.pos;
    const iso = Cam.isoWeight > 0.5;
    for (const u of this.walls) {
      let want = 1;
      if (iso) {
        if (u.axis === 'x') want = u.c > p.z + 0.35 ? 0 : 1;
        else want = u.c > p.x + 0.35 ? 0 : 1;
        if (G.forceWallsUp) want = 1;
      }
      u.target = want;
      if (Math.abs(u.fade - want) > 0.001) {
        u.fade = damp(u.fade, want, 9, dt);
        if (Math.abs(u.fade - want) < 0.01) u.fade = want;
        const f = u.fade;
        this.fadeMats(u.mats, f);
        for (const m of u.meshes) m.visible = f > 0.02;
        this.wallVis(u, f);
        for (const d of u.decor) d.visible = f > 0.5;
      }
    }
    // ceilings in first person
    const showCeil = Cam.isoWeight < 0.5;
    for (const c of this.ceilings) c.visible = showCeil;
    if (this.stairCap) this.stairCap.visible = showCeil && !this.atticOpen;
    this.updateAttic(dt, t);
    // doors
    for (const k in this.doors) {
      const d = this.doors[k];
      if (Math.abs(d.open - d.target) > 0.001) {
        const sp = d.target < d.open ? 7 : 3;
        d.open = damp(d.open, d.target, sp, dt);
        if (Math.abs(d.open - d.target) < 0.01) d.open = d.target;
      }
      if (d.front) d.pivot.rotation.y = d.open * 1.75;
      else for (const l of d.leaves) l.pivot.rotation.y = (d.axis === 'x' ? -1 : 1) * l.dir * d.open * 1.5;
    }
    // the visitor at the door
    if (this.props.man && this.props.man.visible && this.props.man.userData.anim) this.props.man.userData.anim.update(dt);
    // animated props
    for (const a of this.anim) {
      if (a.type === 'pendulum') { a.m.rotation.z = Math.sin(t * Math.PI) * 0.22; a.hands.rotation.z = -t * 0.02; }
      else if (a.type === 'fire') a.flames.forEach((f, i) => { f.scale.y = 0.8 + Math.sin(t * 9 + i * 1.7) * 0.18 + Math.random() * 0.1; f.scale.x = 0.9 + Math.sin(t * 7 + i) * 0.1; f.position.y = 0.32 + f.scale.y * 0.05; });
      else if (a.type === 'flame') { a.m.scale.y = 0.85 + Math.sin(t * 13 + a.seed) * 0.12 + Math.random() * 0.08; const cp = Render.camera.position; a.m.rotation.set(0, Math.atan2(cp.x - a.m.position.x, cp.z - a.m.position.z), 0); }
      else if (a.type === 'lava') a.blobs.forEach((b, i) => { b.position.y = (a.y0 ?? 0.2) + ((t * 0.05 + i * 0.33) % 1) * (a.yr ?? 0.24); b.scale.setScalar(0.8 + Math.sin(t + i) * 0.3); });
    }
    if (this.props.tv && !this.tvSmashed && (Math.floor(t * 15) !== this._tvF)) { this._tvF = Math.floor(t * 15); updateTV(this.props.tv.tex, t, G.haunted); }
    // lightning
    if (this.lightning > 0) this.lightning = Math.max(0, this.lightning - dt * 2.5);
    const lw = this.lightning;
    // lightning brightens the window glass (kit WindowGlass: emissive map = night sky)
    for (const m of this.windows) { if (m.uniforms && m.uniforms.uFlash) m.uniforms.uFlash.value = lw; else if (m.userData.baseEI != null) m.emissiveIntensity = m.userData.baseEI * (1 + lw * 3); else m.color.setScalar(1 + lw * 3); }
    this.updateLights(dt, t);
  },

  updateLights(dt, t) {
    // (the title screen looks at the house from the yard: light the porch)
    const title = G.state === 'title' || G.state === 'boot';
    // (G.lightAt: a cut scene walks the camera somewhere the player isn't, the lamps around it light the way)
    const la = G.lightAt;
    const room = G.photoRoom || (la && la.room) || (title ? 'porch' : Player.room) || 'hall';
    // choose sources
    this._lt = (this._lt || 0) - dt;
    if (this._lt <= 0 || this._lastRoom !== room) {
      this._lt = 0.3; this._lastRoom = room;
      const near = NEIGHBORS[room] || [];
      const yard = !G.photoRoom && (title || room === 'porch' || (this.doors.front && this.doors.front.open > 0.05));
      const mid = G.photoRoom || title;
      const px = mid ? (ROOMS[room].x0 + ROOMS[room].x1) / 2 : la ? la.x : Player.pos.x, pz = mid ? (ROOMS[room].z0 + ROOMS[room].z1) / 2 : la ? la.z : Player.pos.z;
      const scored = this.lights.filter((L) => L.room === room || (!G.photoRoom && near.includes(L.room)) || (yard && L.room === 'yard'))
        // (the yard candles come after the porch's own lamps, and after the room's when you look out of the door)
        .map((L) => ({ L, s: (L.room === room ? 0 : L.room === 'yard' ? (title || room === 'porch' ? 50 : 150) : 100) + dist(L.pos.x, L.pos.z, px, pz) - L.base * 0.2 }))
        .sort((a, b) => a.s - b.s).slice(0, this.pool.length).map((o) => o.L);
      // keep assigned sources stable
      const free = this.pool.filter((p) => !p.src || !scored.includes(p.src));
      for (const p of this.pool) if (p.src && !scored.includes(p.src)) p.src = null;
      for (const L of scored) {
        if (this.pool.some((p) => p.src === L)) continue;
        // (L.noShadow: never worth a shadow map, take a plain entry while there is one)
        const i = L.noShadow ? Math.max(0, free.findIndex((p) => !p.light.castShadow)) : 0, slot = free.splice(i, 1)[0];
        if (!slot) break;
        this.setSlot(slot, L, 0);
      }
      // the shadow casting entries go to the strongest lamps of this room (near ones first). Lamps inside
      // pumpkins, night lights and the TV stay shadowless; L.prio lets a scene pick its key light
      const nS = this.pool.reduce((n, p) => n + (p.light.castShadow ? 1 : 0), 0);
      let cand = [];
      if (nS) {
        cand = scored.filter((L) => L.prio || (L.on && L.room === room && L.base >= 5 && L.kind !== 'night' && L.kind !== 'tv' && L.kind !== 'circle'))
          .map((L) => ({ L, s: (L.prio || 0) * 100 + L.base / (1 + 0.035 * ((L.pos.x - px) ** 2 + (L.pos.z - pz) ** 2)) }))
          .sort((a, b) => b.s - a.s).slice(0, nS).map((o) => o.L);
        for (const L of cand) {
          const cur = this.pool.find((p) => p.src === L);
          if (cur && cur.light.castShadow) continue;
          const tgt = this.pool.find((p) => p.light.castShadow && !cand.includes(p.src));
          if (!tgt) break;
          // swap the two entries without a visible jump in brightness
          const A = tgt.src, AI = tgt.light.intensity;
          this.setSlot(tgt, L, cur ? cur.light.intensity : 0);
          if (cur) this.setSlot(cur, A, AI);
        }
      }
      // (a shadow entry that is left with a lamp from another room - the next room's lamp in a room with a single key
      // lamp - throws no shadow: its shadows fall out of sight, it fades out and its cube is not redrawn. The room's
      // own minor lamps keep theirs: an under-cabinet light still shades the jars on the counter)
      for (const p of this.pool) if (p.light.castShadow) p.key = !!p.src && (cand.includes(p.src) || p.src.room === room);
    }
    const haunt = G.dread;
    for (const L of this.lights) {
      let I = L.on && !L.broken ? L.base * LIGHT_MUL : 0;
      if (G.haunted) I *= lerp(1, 0.62, haunt) * (L.haunt);
      const n = Math.sin(t * 11 + L.seed) * 0.5 + Math.sin(t * 23.7 + L.seed * 2) * 0.3 + Math.sin(t * 5.3 + L.seed * 3) * 0.2;
      if (L.flicker) I *= 1 - L.flicker * 0.5 * (0.5 + 0.5 * n);
      if (G.haunted && L.kind !== 'fire' && L.kind !== 'candle' && L.kind !== 'circle') {
        // occasional haunted flicker bursts
        const burst = Math.sin(t * 0.7 + L.seed * 5) > 0.97 - haunt * 0.05;
        if (burst && Math.random() < 0.5) { I *= 0.1; if (L.room === room) Sfx.play('flicker'); }
      }
      const out = this.lightsOut[L.room] || 0;
      I *= 1 - out;
      // (L.force: a scene drives the lamp itself, a strobe has to cut hard)
      if (L.force != null) L.cur = L.force * LIGHT_MUL;
      else L.cur = damp(L.cur, I, 25, dt);
      const em = L.base > 0 ? L.cur / (L.base * LIGHT_MUL) : 0;
      // glow materials follow their light (kit Glow* materials scale their authored strength)
      for (const m of L.mats) m.emissiveIntensity = (m.userData.baseEI ?? 1) * ((L.force != null ? 0.02 : 0.15) + em * 1.0);
    }
    // (the flash entry: a minor lamp's light that the flash borrows; it fades back in afterwards)
    const fx = this.flashFX, fp = this.pool[this.pool.length - 1], flashing = fx.intensity > 0.01 && !fp.light.castShadow;
    if (fp.fx && !flashing) {
      fp.fx = false; const l = fp.light;
      l.decay = LIGHT_DECAY; l.intensity = 0;
      if (fp.src) { l.color.copy(fp.src.color); l.distance = fp.src.distance; }
    }
    for (const p of this.pool) {
      if (p.fx) continue;
      if (!p.src) p.light.intensity = damp(p.light.intensity, 0, 10, dt);
      else { p.light.intensity = p.src.force != null ? p.src.cur : damp(p.light.intensity, p.src.cur, 12, dt); p.light.position.copy(p.src.pos); }
      // shadows fade in when a key lamp takes over a shadow entry (and out when the entry is left with a minor lamp)
      if (p.light.castShadow) { p.sk = p.key === false ? Math.max(0, p.sk - dt * 2.5) : Math.min(1, p.sk + dt * 2.5); p.light.shadow.intensity = 0.94 * p.sk; }
    }
    if (flashing) {
      const l = fp.light; fp.fx = true;
      l.position.copy(fx.position); l.color.copy(fx.color); l.intensity = fx.intensity; l.distance = fx.distance; l.decay = fx.decay;
    }
    this.updateShadows();
    // ambient
    const inBase = G.inBasement;
    const outside = Player.room === 'porch' || G.state === 'title' || (this.doors.front && this.doors.front.open > 0.05);
    const TU = this.tune;
    let hemiI = G.haunted ? lerp(TU.hemiHaunt0, TU.hemiHaunt1, haunt) : TU.hemiCozy;
    let envI = G.haunted ? lerp(TU.envHaunt0, TU.envHaunt1, haunt) : TU.envCozy;
    if (inBase) { hemiI = TU.hemiBase; envI = TU.envBase; }
    if (G.state === 'title' || G.state === 'boot') { hemiI = TU.hemiTitle; envI = TU.envTitle; }
    const outRoom = this.lightsOut[room] || 0;
    hemiI *= 1 - outRoom * 0.75;
    // (G.ambient = [hemisphere, environment]: a scene sets its own darkness, the attic at the end)
    if (G.ambient) { hemiI = G.ambient[0]; envI = G.ambient[1]; }
    hemiI += this.lightning * 1.6;
    this.hemi.intensity = damp(this.hemi.intensity, hemiI, 4, dt);
    // image based light (PBR reflections) dims with the mood too: a dark room should not mirror a bright one
    Render.scene.environmentIntensity = damp(Render.scene.environmentIntensity, envI * (1 - outRoom * 0.6), 4, dt);
    this.moonBase = damp(this.moonBase || 0, outside ? (G.state === 'play' ? TU.moonPlay : TU.moonTitle) : 0, 3, dt);
    this.moon.intensity = this.moonBase + (outside ? this.lightning * 5 : 0);
    // the first person hands sit in the same gloom
    let ok = G.haunted ? lerp(0.8, 0.62, haunt) : 0.92;
    if (inBase) ok = 0.66;
    ok *= 1 - outRoom * 0.35;
    Render.overlayK = damp(Render.overlayK, ok + this.lightning * 0.4, 4, dt);
  },

  porchDefault() { const L = this.props.porchLight; if (L) { L.base = 5.5; L.flicker = 0.18; L.prio = 0; } },

  setSlot(p, L, I) {
    p.src = L; p.sk = 0; p.sig = null;
    if (p.fx) return;
    p.light.intensity = I;
    if (L) { p.light.position.copy(L.pos); p.light.color.copy(L.color); p.light.distance = L.distance; }
    if (p.light.castShadow) p.light.shadow.needsUpdate = true;
  },

  // Everything that can change a shadow: the player moving, turning or swinging, anything alive, pickups, doors,
  // smashed decor. While it stays the same the shadow maps stay valid and nothing is redrawn.
  shadowSig() {
    const P = Player;
    let s = 0;
    if (P.rig && P.rig.root.visible) {
      // (5 mm / 0.1 degree steps: the last creep of a stop doesn't count as moving)
      s += Math.round(P.pos.x * 200) * 1.37 + Math.round(P.pos.z * 200) * 2.71 + Math.round(P.yaw * 600) * 3.13 + (WEAPON_ORDER.indexOf(P.weapon) + 2) * 0.731 + (P.hasFlashlight ? 0.517 : 0);
      if (P.swingT > 0 || P._evT > 0 || P.reloadT > 0 || P.dodgeT > 0 || P.hurtFlash > 0.01 || !P.alive) s += G.time * 7.77;
    }
    let live = G.bosses.length > 0 || !!(this.props.man && this.props.man.visible);
    for (let i = 0; !live && i < G.enemies.length; i++) if (!G.enemies[i].bonus) live = true;
    if (live) s += G.time * 3.33;
    for (const k in this.doors) s += this.doors[k].open * 0.913;
    // (the bedroom wardrobe's doors: opening, rattling)
    if (typeof Boogey !== 'undefined' && Boogey.wd) s += Math.round(Boogey.open * 100) * 0.00587 + (Boogey.rattle > 0 ? G.time * 1.91 : 0);
    for (const b of this.breakables) if (!b.alive) s += 0.377;
    if (this.tvSmashed) s += 0.291;
    if (this.props.flashlightItem && this.props.flashlightItem.visible) s += 0.211;
    if (this.props.pokerItem && this.props.pokerItem.visible) s += 0.173;
    if (typeof Photos !== 'undefined' && Photos.redDoor) s += Photos.redDoor.layers.mask * 0.059 + (Photos.redDoor.visible ? 0.041 : 0);
    if (this.titleTrees && this.titleTrees.visible) s += 0.0613;
    // (the attic scene at the end: the bulb swings, you move)
    if (this.attic && this.attic.visible) s += 0.0457 + (this.atticLive ? G.time * 5.17 : 0);
    return s;
  },

  // shadow maps are redrawn only when something changed: lamp cubes one per frame, the flashlight when it or the
  // scene moves, the moon only outdoors. A light that is off is parked: the shaders skip its shadow lookups.
  updateShadows() {
    const sig = this.shadowSig();
    this._sf = (this._sf || 0) + 1;
    this.pool.forEach((p, i) => {
      const l = p.light, sh = l.shadow;
      if (!l.castShadow) return;
      sh.autoUpdate = false;
      // (an entry whose shadow has faded out is parked: no cube redraws, and no cube lookups in any shader)
      if (p.key === false && p.sk <= 0) { if (!sh.parked || sh.needsUpdate) this.parkShadow(l); p.sig = null; return; }
      if (sh.parked) { sh.parked = false; p.sig = null; }
      if (l.intensity > 0.05 && p.sig !== sig && (this._sf + i) % 2 === 0) { sh.needsUpdate = true; p.sig = sig; }
    });
    const sp = typeof Player !== 'undefined' ? Player.spot : null;
    if (sp) {
      if (sp.intensity < 0.01) this.parkShadow(sp);
      else {
        const a = sp.position, b = sp.target.position;
        const key = sig + Math.round(a.x * 50) * 0.0137 + Math.round(a.y * 50) * 0.0271 + Math.round(a.z * 50) * 0.0313 + Math.round(b.x * 20) * 0.0419 + Math.round(b.y * 20) * 0.0467 + Math.round(b.z * 20) * 0.0523;
        if (this.unparkShadow(sp) || key !== this._spotKey) { sp.shadow.needsUpdate = true; this._spotKey = key; }
      }
    }
    const mo = this.moon;
    if (mo.intensity < 0.01) this.parkShadow(mo);
    else if (this.unparkShadow(mo) || sig !== this._moonSig) { mo.shadow.needsUpdate = true; this._moonSig = sig; }
  },
  // every fragment falls outside the shadow frustum of a parked light, so the shader skips its shadow taps
  // (a lamp's cube: every fragment lies past its far plane)
  parkShadow(light) {
    const sh = light.shadow;
    sh.autoUpdate = false; sh.needsUpdate = false; sh.parked = true;
    if (light.isPointLight) sh.matrix.makeTranslation(1e5, 1e5, 1e5);
    else sh.matrix.set(0, 0, 0, -10, 0, 0, 0, -10, 0, 0, 0, 0, 0, 0, 0, 1);
  },
  unparkShadow(light) { const sh = light.shadow; sh.autoUpdate = false; if (!sh.parked) return false; sh.parked = false; return true; },

  allLightsInRoom(room, on) { for (const L of this.lights) if (L.room === room) L.on = on; },

  // instantly light a room for a photo render; returns a restore function. keepMaps: the photo sees the same shadow
  // casters as the view (first person, nobody else around): a shadow map is only redrawn where its lamp moves
  forceLights(room, mul = 1, hemiI = null, keepMaps = false) {
    const saved = this.pool.map((p) => ({ p, src: p.src, I: p.light.intensity, pos: p.light.position.clone(), d: p.light.distance }));
    // (a cube is reused only when it is up to date: not parked, drawn with the shadow casters as they are now)
    const sig = this.shadowSig();
    const redraw = (p, x, y, z, d) => {
      const l = p.light, sh = l.shadow;
      if (l.castShadow && (!keepMaps || sh.parked || p.sig !== sig || l.position.x !== x || l.position.y !== y || l.position.z !== z || l.distance !== d)) { sh.needsUpdate = true; sh.parked = false; p.sig = sig; }
    };
    // (strongest first: the shadow casting entries get the key lamps; pumpkin candles and night lights go last)
    const shadowless = (L) => L.base < 5 || L.kind === 'night' || L.kind === 'tv';
    const list = this.lights.filter((L) => L.room === room && L.kind !== 'circle')
      .sort((a, b) => (shadowless(a) - shadowless(b)) || (b.base - a.base)).slice(0, this.pool.length);
    // (a key lamp stays in the shadow entry that already holds it: with keepMaps its cube needn't be redrawn)
    const nS = this.pool.reduce((n, p) => n + (p.light.castShadow ? 1 : 0), 0);
    for (let i = 0; i < nS; i++) { const j = list.indexOf(this.pool[i].src); if (j >= 0 && j < nS && j !== i) { const t = list[i]; list[i] = list[j]; list[j] = t; } }
    this.pool.forEach((p, i) => {
      const L = list[i];
      // (a shadowless lamp's cube is not looked at: it is not redrawn for the photo)
      if (L) { if (!shadowless(L)) redraw(p, L.pos.x, L.pos.y, L.pos.z, L.distance); p.light.position.copy(L.pos); p.light.color.copy(L.color); p.light.distance = L.distance; p.light.intensity = L.base * mul * LIGHT_MUL; }
      else p.light.intensity = 0;
      if (p.light.castShadow) p.light.shadow.intensity = L && !shadowless(L) ? 0.85 : 0;
    });
    // (the photos are flash pictures of the cozy evening: brighter fill than the haunted house around you)
    const hemi = this.hemi.intensity, env = Render.scene.environmentIntensity;
    this.hemi.intensity = hemiI ?? (room === 'basement' ? 0.9 : 1.9);
    Render.scene.environmentIntensity = 0.22;
    return () => {
      for (const s of saved) {
        s.p.src = s.src; s.p.light.intensity = s.I;
        const pos = s.src ? s.src.pos : s.pos, d = s.src ? s.src.distance : s.d;
        if (s.p.light.castShadow && s.p.key === false && s.p.sk <= 0) this.parkShadow(s.p.light);
        else redraw(s.p, pos.x, pos.y, pos.z, d);
        s.p.light.position.copy(pos); s.p.light.distance = d;
        if (s.src) s.p.light.color.copy(s.src.color);
        if (s.p.light.castShadow) s.p.light.shadow.intensity = 0.94 * s.p.sk;
      }
      this.hemi.intensity = hemi; Render.scene.environmentIntensity = env;
      this._lt = 0;
    };
  },
};

// merge static meshes of a group to cut draw calls. Plain colored materials are folded into one
// vertex-colored mesh; textured / emissive / transparent ones (GLB kit materials) are merged per
// material, keeping their uvs, normals and baked-AO vertex colors (COLOR_0) when they use them.
const PLAIN_MATS = {};
function plainMat(m) {
  const k = m.roughness.toFixed(2) + '_' + m.metalness.toFixed(2);
  return PLAIN_MATS[k] || (PLAIN_MATS[k] = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: m.roughness, metalness: m.metalness }));
}
function isPlain(m) {
  return (m.isMeshStandardMaterial || m.isMeshLambertMaterial) && !m.isMeshPhysicalMaterial && !m.map && !m.normalMap && !m.roughnessMap && !m.metalnessMap && !m.alphaMap && !m.alphaTest && !m.transparent && m.opacity === 1 && m.side === THREE.FrontSide && (!m.emissive || (m.emissive.r + m.emissive.g + m.emissive.b) === 0) && !m.vertexColors;
}
function bakeStatic(group, target = null) {
  target = target || group.parent;
  group.updateMatrixWorld(true);
  const buckets = new Map();
  const toRemove = [];
  group.traverse((o) => {
    if (!o.isMesh || o.isInstancedMesh || o.isSkinnedMesh || o.isPoints || Array.isArray(o.material) || o.userData.keep || !o.visible) return;
    const ga = o.geometry.attributes;
    if (!ga.position || !ga.normal || o.children.length || o.geometry.morphAttributes.position) return; // (children would be lost)
    let p = o.parent; while (p && p !== group) { if (!p.visible || p.userData.keep) return; p = p.parent; }
    const plain = isPlain(o.material);
    const pm = plain ? plainMat(o.material.isMeshLambertMaterial ? { roughness: 0.85, metalness: 0 } : o.material) : null;
    // one bucket per material (casts when any member casts: avoids doubling draw calls per material)
    const key = (plain ? pm.uuid : o.material.uuid) + '|' + (o.receiveShadow ? 1 : 0);
    if (!buckets.has(key)) buckets.set(key, { mat: plain ? pm : o.material, plain, cast: false, recv: o.receiveShadow, list: [] });
    const bk = buckets.get(key);
    // (tiny parts - caps, knobs, kernels - don't throw a shadow worth a draw call in every shadow pass)
    if (o.castShadow && !bk.cast) {
      if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere();
      bk.cast = o.geometry.boundingSphere.radius * o.matrixWorld.getMaxScaleOnAxis() >= 0.12;
    }
    bk.list.push(o);
    toRemove.push(o);
  });
  for (const o of toRemove) o.parent.remove(o);
  const made = [];
  target.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(target.matrixWorld).invert();
  const identity = inv.equals(new THREE.Matrix4());
  // copy an attribute into a packed float array (handles normalized / integer sources, pads alpha with 1)
  const put = (dst, attr, off, size) => {
    const n = attr.count;
    if (!attr.isInterleavedBufferAttribute && !attr.normalized && attr.array instanceof Float32Array && attr.itemSize === size) { dst.set(attr.array.subarray(0, n * size), off * size); return; }
    const s = Math.min(size, attr.itemSize);
    for (let i = 0; i < n; i++) {
      const o = (off + i) * size;
      for (let c = 0; c < s; c++) dst[o + c] = attr.getComponent(i, c);
      for (let c = s; c < size; c++) dst[o + c] = 1;
    }
  };
  for (const b of buckets.values()) {
    const vc = !b.plain && !!b.mat.vertexColors;
    let vCount = 0, iCount = 0, cSize = 3;
    const geos = b.list.map((m) => {
      const g = m.geometry.clone(); g.applyMatrix4(m.matrixWorld);
      vCount += g.attributes.position.count; iCount += g.index ? g.index.count : g.attributes.position.count;
      if (vc && g.attributes.color && g.attributes.color.itemSize === 4) cSize = 4;
      return { g, col: m.material.color };
    });
    const pos = new Float32Array(vCount * 3), nor = new Float32Array(vCount * 3), uv = new Float32Array(vCount * 2);
    const col = b.plain ? new Float32Array(vCount * 3) : vc ? new Float32Array(vCount * cSize) : null;
    const idx = vCount > 65535 ? new Uint32Array(iCount) : new Uint16Array(iCount);
    let vo = 0, io = 0;
    for (const { g, col: c } of geos) {
      const at = g.attributes, n = at.position.count;
      put(pos, at.position, vo, 3);
      put(nor, at.normal, vo, 3);
      if (at.uv) put(uv, at.uv, vo, 2);
      if (b.plain) for (let i = 0; i < n; i++) { col[(vo + i) * 3] = c.r; col[(vo + i) * 3 + 1] = c.g; col[(vo + i) * 3 + 2] = c.b; }
      else if (vc) { if (at.color) put(col, at.color, vo, cSize); else col.fill(1, vo * cSize, (vo + n) * cSize); }
      if (g.index) { const a = g.index.array; for (let i = 0; i < a.length; i++) idx[io + i] = a[i] + vo; io += a.length; }
      else { for (let i = 0; i < n; i++) idx[io + i] = vo + i; io += n; }
      vo += n;
      g.dispose();
    }
    const mg = new THREE.BufferGeometry();
    mg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    mg.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    mg.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    if (col) mg.setAttribute('color', new THREE.BufferAttribute(col, b.plain ? 3 : cSize));
    mg.setIndex(new THREE.BufferAttribute(idx, 1));
    if (!identity) mg.applyMatrix4(inv);
    mg.computeBoundingSphere();
    const mesh = new THREE.Mesh(mg, b.mat);
    mesh.castShadow = b.cast; mesh.receiveShadow = b.recv;
    mesh.matrixAutoUpdate = false;
    mesh.updateMatrix();
    target.add(mesh);
    made.push(mesh);
  }
  // drop empty groups / emptied GLB nodes
  const prune = (o) => { for (const c of o.children.slice()) prune(c); if (o !== group && o !== target && (o.isGroup || o.type === 'Object3D') && o.children.length === 0 && o.parent && !o.userData.keep) o.parent.remove(o); };
  prune(group);
  return made;
}

// =====================================================================
//  MODELS: player, mystery man, critters, bosses, weapons, pickups
//  (all built from primitives, low-poly PS1 style)
// =====================================================================
function uMat(color, o = {}) {
  const m = new THREE.MeshStandardMaterial({ color, roughness: o.rough ?? 0.75, metalness: o.metal ?? 0 });
  if (o.map) m.map = o.map;
  if (o.emissive != null) { m.emissive = new THREE.Color(o.emissive); m.emissiveIntensity = o.ei ?? 1; }
  if (o.transparent) { m.transparent = true; m.opacity = o.opacity ?? 1; }
  if (o.side) m.side = o.side;
  return m;
}
function faceMats(kind) {
  return {
    cute: new THREE.MeshLambertMaterial({ map: faceTexture(kind, false), transparent: true, alphaTest: 0.35, depthWrite: true }),
    scary: new THREE.MeshBasicMaterial({ map: faceTexture(kind, true), transparent: true, alphaTest: 0.35 }),
  };
}
// curved face patch (part of a sphere) so faces wrap the head
function facePatch(r, size = 1.1) {
  return Geo.get('fp' + r + size, () => {
    const g = new THREE.SphereGeometry(r * 1.01, 12, 10, Math.PI / 2 - size / 2, size, Math.PI / 2 - size / 2, size);
    // remap uvs to 0..1 across the patch
    const uv = g.attributes.uv;
    let minU = 1, maxU = 0, minV = 1, maxV = 0;
    for (let i = 0; i < uv.count; i++) { minU = Math.min(minU, uv.getX(i)); maxU = Math.max(maxU, uv.getX(i)); minV = Math.min(minV, uv.getY(i)); maxV = Math.max(maxV, uv.getY(i)); }
    for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) - minU) / (maxU - minU), (uv.getY(i) - minV) / (maxV - minV));
    return g;
  });
}

// ---------------------------------------------------------------------
//  Player (90s kid in a flannel)
// ---------------------------------------------------------------------
// ---------------------------------------------------------------------
//  GLB player: skinned kid with base clips + per-arm overlay clips
// ---------------------------------------------------------------------
// arm chains used by the overlay masks: each hand has 3 bones per finger (idx, mid, rng, pnk, thb)
const PL_FINGERS = (s) => ['idx', 'mid', 'rng', 'pnk', 'thb'].flatMap((f) => [1, 2, 3].map((k) => f + k + s));
const PL_R = ['armUpR', 'armLowR', 'handR', 'handGripR'].concat(PL_FINGERS('R'));
const PL_L = ['armUpL', 'armLowL', 'handL'].concat(PL_FINGERS('L'));
class PlayerAnim {
  constructor(root) {
    this.mixer = new THREE.AnimationMixer(root);
    this.A = Assets.data.player;
    this.clips = this.A.clipMap;
    this.masked = {}; this.actions = {};
    this.base = null; this.baseKey = null; this.baseName = null;
    this.r = null; this.rName = null; this.l = null; this.lName = null;
    this.chest = {};
    for (const c of this.A.clips) this.chest[c.name] = c.tracks.some((t) => t.name.split('.')[0] === 'chest');
  }
  has(n) { return !!this.clips[n]; }
  clip(name, mask) {
    const src = this.clips[name]; if (!src) return null;
    if (!mask) return src;
    const key = name + '|' + mask;
    if (!this.masked[key]) {
      const rm = new Set();
      if (mask.includes('R')) PL_R.forEach((b) => rm.add(b));
      if (mask.includes('c')) rm.add('chest');
      if (mask.includes('L')) PL_L.forEach((b) => rm.add(b));
      this.masked[key] = new THREE.AnimationClip(key, src.duration, src.tracks.filter((t) => !rm.has(t.name.split('.')[0])));
    }
    return this.masked[key];
  }
  act(clip) { return this.actions[clip.name] || (this.actions[clip.name] = this.mixer.clipAction(clip)); }
  start(a, once, speed) {
    a.reset(); a.enabled = true; a.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat, Infinity); a.clampWhenFinished = !!once;
    a.timeScale = speed; a.setEffectiveWeight(1); a.play();
  }
  setBase(name, mask, o = {}) {
    const clip = this.clip(name, mask); if (!clip) return;
    const a = this.act(clip), speed = o.speed ?? 1;
    if (this.baseKey === clip.name && !o.restart) { a.timeScale = speed; return; }
    const prev = this.base, keepPhase = prev && this.baseName === name && !o.restart;
    const t = keepPhase ? prev.time : 0;
    this.start(a, o.once, speed);
    if (keepPhase) a.time = t;
    if (prev && prev !== a) { if ((o.fade ?? 0.15) > 0) prev.crossFadeTo(a, o.fade ?? 0.15, false); else prev.stop(); }
    this.base = a; this.baseKey = clip.name; this.baseName = name;
  }
  setOverlay(side, name, o = {}) {
    const cur = side === 'R' ? this.r : this.l, curName = side === 'R' ? this.rName : this.lName;
    if (name && !this.clips[name]) name = null;
    if (name === curName && !o.restart) { if (cur) cur.timeScale = o.speed ?? 1; return; }
    let a = null;
    if (name) {
      a = this.act(this.clips[name]);
      this.start(a, o.once, o.speed ?? 1);
      if (cur && cur !== a) cur.crossFadeTo(a, o.fade ?? 0.12, false);
    } else if (cur) cur.fadeOut(o.fade ?? 0.15);
    if (side === 'R') { this.r = a; this.rName = name; } else { this.l = a; this.lName = name; }
  }
  hasChest(name) { return !!(name && this.chest[name]); }
  flinch() {
    if (!this.has('Hurt')) return;
    if (!this.hurtAct) { const c = THREE.AnimationUtils.makeClipAdditive(this.clips.Hurt.clone()); c.name = 'HurtAdd'; this.hurtAct = this.mixer.clipAction(c); this.hurtAct.blendMode = THREE.AdditiveAnimationBlendMode; this.hurtAct.setLoop(THREE.LoopOnce, 1); }
    this.hurtAct.reset(); this.hurtAct.setEffectiveWeight(1); this.hurtAct.play();
  }
  reset() { this.mixer.stopAllAction(); this.base = this.r = this.l = null; this.baseKey = this.baseName = this.rName = this.lName = null; this.setBase('Idle', '', { fade: 0 }); }
  update(dt) { this.mixer.update(dt); }
}

// pose a mixer-less player clone: base clip (masked for the overlay) + overlay held at its end
function posePlayer(rig, base, overlay, tBase = 0) {
  const A = Assets.data.player; if (!A || !rig.glb) return;
  const pa = new PlayerAnim(rig.root);
  const mask = overlay ? (pa.hasChest(overlay) ? 'Rc' : 'R') : '';
  pa.setBase(base, mask, { fade: 0 });
  if (overlay) pa.setOverlay('R', overlay, { once: true, fade: 0 });
  pa.update(0);
  if (pa.base) pa.base.time = tBase;
  if (pa.r) pa.r.time = pa.r.getClip().duration;
  pa.mixer.update(0);
  rig._pose = pa;
}

// Skinned characters: frustum culling against a fixed sphere around the bind pose, scaled up to hold the animation (the
// loader turns culling off; three.js would otherwise skin every vertex to measure them). The shadow cube faces and the
// flashlight then only draw the characters they can see, not every critter in all six faces of every lamp.
function cullSkinned(root, k = 1.6) {
  root.traverse((o) => {
    if (!o.isSkinnedMesh) return;
    const g = o.geometry;
    if (!g.boundingSphere) g.computeBoundingSphere();
    o.boundingSphere = g.boundingSphere.clone();
    o.boundingSphere.radius = o.boundingSphere.radius * k + 0.15;
    o.frustumCulled = true;
  });
  return root;
}

function buildPlayerGLB(forPhoto = false) {
  if (!Assets.has('player')) return null;
  const root = cullSkinned(Assets.inst('player', { name: 'player' }), 1.6);
  const f = (n) => GLB.find(root, n);
  const rig = { root, glb: true, body: f('body'), spine: f('spine'), chest: f('chest'), head: f('head'), headG: f('head'), torso: f('chest'),
    handR: f('HandR') || f('handR'), handL: f('HandL') || f('handL'), weapons: {}, mats: [] };
  root.traverse((o) => {
    if (!o.isMesh) return;
    o.castShadow = !forPhoto; o.receiveShadow = true;
    o.material = o.material.clone(); rig.mats.push(o.material);
    o.material.userData.baseEmissive = o.material.emissive ? o.material.emissive.clone() : null;
  });
  rig.weaponSlot = rig.handR;
  // flashlight in the left hand (items.glb Flashlight: origin = grip, lens +Z)
  const fl = new THREE.Group(); rig.handL.add(fl);
  let lens = null;
  const flk = itemModel('Flashlight', { s: 1.0, cast: false });
  if (flk) { fl.add(flk); lens = GLB.find(flk, 'Lens'); if (lens) { lens.material = lens.material.clone(); lens.material.userData.baseEI = lens.material.emissiveIntensity * 0.6; } }
  if (!lens) {
    if (flk) fl.remove(flk);
    mk(Geo.cyl(0.035, 0.03, 0.22, 10), uMat(0x26262c), 0, 0, 0.08, fl, { rx: Math.PI / 2, cast: false });
    lens = mk(Geo.circle(0.04, 12), new THREE.MeshBasicMaterial({ color: 0xfff2c8 }), 0, 0, 0.195, fl, { cast: false });
  }
  fl.visible = false;
  rig.flashlight = fl; rig.lens = lens;
  if (forPhoto) setLayer(root, 1);
  rig.anim = forPhoto ? null : new PlayerAnim(root);
  if (rig.anim) rig.anim.setBase('Idle', '', { fade: 0 });
  return rig;
}

function buildPlayerModel(forPhoto = false) {
  const glb = buildPlayerGLB(forPhoto);
  if (glb) return glb;
  const root = new THREE.Group();
  const body = grp(root, 0, 0, 0);
  const skin = uMat(0xe0b08a), flannel = uMat(0xffffff, { map: fabricTexture('flannel') }), denim = uMat(0xffffff, { map: fabricTexture('denim') });
  const shirt = uMat(0xe8e4d8), shoe = uMat(0xf0f0f0), hair = uMat(0x3a2418);
  const mats = [skin, flannel, denim, shirt, shoe, hair];
  // legs (pivot at hip)
  const legL = grp(body, -0.12, 0.88, 0), legR = grp(body, 0.12, 0.88, 0);
  for (const L of [legL, legR]) {
    mk(Geo.box(0.17, 0.82, 0.19), denim, 0, -0.41, 0, L);
    mk(Geo.box(0.19, 0.11, 0.3), shoe, 0, -0.84, 0.05, L);
  }
  const torso = grp(body, 0, 0.88, 0);
  mk(Geo.box(0.46, 0.6, 0.26), flannel, 0, 0.3, 0, torso);
  mk(Geo.box(0.16, 0.56, 0.02), shirt, 0, 0.3, 0.135, torso, { cast: false });
  mk(Geo.box(0.48, 0.12, 0.28), denim, 0, -0.02, 0, torso);
  const headG = grp(torso, 0, 0.62, 0);
  mk(Geo.box(0.1, 0.08, 0.1), skin, 0, 0.02, 0, headG);
  const head = mk(Geo.box(0.27, 0.3, 0.26), skin, 0, 0.2, 0, headG);
  const faceM = new THREE.MeshLambertMaterial({ map: faceTexture('player'), transparent: true, alphaTest: 0.3 });
  mk(Geo.plane(0.27, 0.27), faceM, 0, 0.19, 0.131, headG, { cast: false });
  mk(Geo.box(0.3, 0.12, 0.29), hair, 0, 0.37, -0.01, headG);
  mk(Geo.box(0.3, 0.2, 0.08), hair, 0, 0.27, -0.12, headG);
  mk(Geo.box(0.22, 0.06, 0.06), hair, 0.03, 0.31, 0.12, headG, { rz: 0.15 });
  // arms (pivot at shoulder)
  const armL = grp(torso, -0.3, 0.55, 0), armR = grp(torso, 0.3, 0.55, 0);
  for (const A of [armL, armR]) {
    mk(Geo.box(0.14, 0.5, 0.15), flannel, 0, -0.25, 0, A);
    mk(Geo.box(0.11, 0.12, 0.12), skin, 0, -0.55, 0, A);
  }
  const handL = grp(armL, 0, -0.58, 0.02), handR = grp(armR, 0, -0.58, 0.02);
  // flashlight in left hand (items.glb Flashlight: origin = grip, lens +Z; its Lens glows while it is on)
  const fl = grp(handL, 0, -0.02, 0.1);
  let lens = null;
  const flk = itemModel('Flashlight', { s: 1.3, cast: false });
  if (flk) { fl.add(flk); lens = GLB.find(flk, 'Lens'); if (lens) { lens.material = lens.material.clone(); lens.material.userData.baseEI = lens.material.emissiveIntensity * 0.6; } }
  if (!lens) {
    if (flk) fl.remove(flk);
    mk(Geo.cyl(0.04, 0.035, 0.24, 8), uMat(0x26262c), 0, 0, 0, fl, { rx: Math.PI / 2, cast: false });
    mk(Geo.cyl(0.055, 0.04, 0.06, 8), uMat(0xb0b0b0), 0, 0, 0.14, fl, { rx: Math.PI / 2, cast: false });
    lens = mk(Geo.circle(0.045, 10), new THREE.MeshBasicMaterial({ color: 0xfff2c8 }), 0, 0, 0.172, fl, { cast: false });
  }
  fl.visible = false;
  const weaponSlot = grp(handR, 0, -0.03, 0.05);
  setShadow(root, false, true);
  if (forPhoto) setLayer(root, 1);
  return { root, body, torso, headG, head, legL, legR, armL, armR, handL, handR, flashlight: fl, lens, weaponSlot, mats, weapons: {} };
}

// items.glb node instance (null when the items kit is unavailable)
function itemModel(node, o = {}) {
  if (!W.hasKit('items', node)) return null;
  const g = Assets.inst('items', { nodes: [node], name: node, cast: o.cast !== false, receive: o.receive !== false });
  if (o.s != null) g.scale.setScalar(o.s);
  return g;
}
// soft additive glow that always faces the camera
const GLOW_SPRITES = {};
function glowSprite(color, size, opacity = 1) {
  const k = color + '_' + opacity;
  const m = GLOW_SPRITES[k] || (GLOW_SPRITES[k] = new THREE.SpriteMaterial({ map: glowTexture(), color, opacity, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false }));
  const sp = new THREE.Sprite(m); sp.scale.setScalar(size);
  return sp;
}
// spark on a pumpkin bomb's lit fuse (FuseTip node)
function fuseSpark(obj, size = 0.06) {
  const tip = GLB.find(obj, 'FuseTip'); if (!tip) return null;
  const sp = glowSprite(0xffc040, size, 1); tip.add(sp);
  return sp;
}

// barrel tips of the hand-held guns (items.glb weapons: origin = grip, pointing +Z)
const MUZZLE_TIP = { nailgun: new THREE.Vector3(0, 0.056, 0.37), shotgun: new THREE.Vector3(0, 0.039, 0.7) };

function buildWeaponModel(kind) {
  const g = new THREE.Group();
  // items.glb weapons: origin = grip, pointing +Z (the bomb sits in the palm a little forward like the original)
  const node = { poker: 'Poker', nailgun: 'NailGun', shotgun: 'Shotgun', bomb: 'PumpkinBomb' }[kind];
  const it = node ? itemModel(node) : null;
  if (it) {
    g.add(it);
    if (kind === 'bomb') { it.position.z = 0.08; fuseSpark(it, 0.05); }
    g.traverse((o) => { if (o.isMesh) { o.castShadow = true; } });
    return g;
  }
  if (kind === 'poker') {
    const iron = uMat(0x1c1c20);
    mk(Geo.cyl(0.018, 0.018, 0.95, 5), iron, 0, 0, 0.42, g, { rx: Math.PI / 2 });
    mk(Geo.box(0.03, 0.03, 0.14), iron, 0.05, 0, 0.88, g, { ry: 0.9 });
    mk(Geo.cone(0.03, 0.08, 4), iron, 0, 0, 0.93, g, { rx: Math.PI / 2 });
    mk(Geo.torus(0.05, 0.012, 4, 10), uMat(0xa08040), 0, 0, -0.07, g);
  } else if (kind === 'nailgun') {
    mk(Geo.box(0.1, 0.12, 0.38), uMat(0xe8b818), 0, 0.03, 0.14, g);
    mk(Geo.box(0.07, 0.16, 0.08), uMat(0x1a1a1a), 0, -0.07, 0.0, g, { rx: 0.25 });
    mk(Geo.box(0.05, 0.05, 0.26), uMat(0x3a3a3a), 0, -0.05, 0.2, g);
    mk(Geo.cyl(0.02, 0.02, 0.06, 6), uMat(0x2a2a2a), 0, 0.03, 0.35, g, { rx: Math.PI / 2 });
  } else if (kind === 'shotgun') {
    const metal = uMat(0x2a2a30), woodM = uMat(0x6a3a1a);
    mk(Geo.cyl(0.025, 0.025, 0.62, 6), metal, -0.027, 0.03, 0.36, g, { rx: Math.PI / 2 });
    mk(Geo.cyl(0.025, 0.025, 0.62, 6), metal, 0.027, 0.03, 0.36, g, { rx: Math.PI / 2 });
    mk(Geo.box(0.08, 0.08, 0.16), metal, 0, 0.01, 0.0, g);
    mk(Geo.box(0.07, 0.13, 0.32), woodM, 0, -0.04, -0.2, g, { rx: -0.2 });
    mk(Geo.box(0.07, 0.05, 0.2), woodM, 0, -0.01, 0.2, g);
  } else if (kind === 'bomb') {
    const m = uMat(0xe0701a);
    for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; mk(Geo.sph(0.07, 6, 5), m, Math.cos(a) * 0.04, 0, Math.sin(a) * 0.04 + 0.08, g); }
    mk(Geo.cyl(0.01, 0.01, 0.08, 4), uMat(0x2a2a2a), 0, 0.09, 0.08, g);
    mk(Geo.sph(0.025, 5, 4), new THREE.MeshBasicMaterial({ color: 0xffd34a }), 0, 0.14, 0.08, g, { cast: false });
  }
  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; } });
  return g;
}

// ---------------------------------------------------------------------
//  The mystery man / visitor
// ---------------------------------------------------------------------
function buildMysteryMan(withPhotos = true) {
  if (Assets.has('man')) {
    const root = Assets.inst('man', { name: 'visitorMan' });
    // he stands right under the porch lantern: keep the wool's sheen faint so the coat and hat stay black
    root.traverse((o) => {
      if (!o.isMesh) return;
      o.castShadow = true; o.receiveShadow = true;
      const m = o.material;
      if (m.userData.tamed) return;
      m.userData.tamed = true;
      if (m.sheen > 0 || m.userData.glbSheen) { if (m.sheen > 0) m.sheenColor.multiplyScalar(0.5); m.color.multiplyScalar(0.5); if ('specularIntensity' in m) m.specularIntensity = 0.15; }
      if (m.name === 'Polaroid') m.color.multiplyScalar(0.55); // white card stock right under the lamp blooms
    });
    const photos = GLB.find(root, 'Photos');
    if (photos) photos.visible = withPhotos;
    root.userData.photos = photos;
    root.userData.anim = new Animator(root, 'man');
    root.userData.anim.play('Idle', 0);
    return root;
  }
  const root = new THREE.Group();
  const coat = uMat(0xffffff, { map: fabricTexture('coat') });
  const black = uMat(0x0b0a0d);
  mk(Geo.cyl(0.26, 0.42, 1.45, 10), coat, 0, 0.78, 0, root);
  mk(Geo.cyl(0.22, 0.27, 0.35, 10), coat, 0, 1.58, 0, root);
  mk(Geo.box(0.58, 0.14, 0.3), coat, 0, 1.68, 0, root);
  mk(Geo.cyl(0.15, 0.17, 0.08, 10), coat, 0, 1.78, 0.02, root);
  const head = mk(Geo.sph(0.15, 10, 8), black, 0, 1.9, 0, root, { sy: 1.15 });
  void head;
  mk(Geo.cyl(0.4, 0.4, 0.03, 16), black, 0, 2.02, 0, root);
  mk(Geo.cyl(0.17, 0.19, 0.24, 12), black, 0, 2.14, 0, root);
  mk(Geo.cyl(0.192, 0.192, 0.05, 12), uMat(0x3a0a0a), 0, 2.06, 0, root, { cast: false });
  // faint eye glints
  const glint = new THREE.MeshBasicMaterial({ color: 0x8a8070 });
  mk(Geo.sph(0.012, 4, 3), glint, -0.05, 1.92, 0.14, root, { cast: false });
  mk(Geo.sph(0.012, 4, 3), glint, 0.05, 1.92, 0.14, root, { cast: false });
  // arm reaching forward with photos
  const arm = grp(root, 0.24, 1.55, 0.05);
  mk(Geo.cyl(0.07, 0.08, 0.6, 6), coat, 0, -0.1, 0.25, arm, { rx: 1.2 });
  const hand = grp(arm, 0, -0.22, 0.52);
  mk(Geo.box(0.08, 0.05, 0.12), uMat(0xb8b0a0), 0, 0, 0, hand);
  if (withPhotos) {
    const pm = uMat(0xf2eee4);
    for (let i = 0; i < 5; i++) mk(Geo.box(0.088, 0.003, 0.107), pm, -0.07 + i * 0.035, 0.02 + i * 0.002, 0.05, hand, { ry: -0.5 + i * 0.25, cast: false });
  }
  mk(Geo.cyl(0.06, 0.08, 1.1, 6), coat, -0.27, 1.05, 0, root, { rz: 0.08 });
  setShadow(root, true, true);
  return root;
}

// ---------------------------------------------------------------------
//  Critters
// ---------------------------------------------------------------------
const EYE_MATS = {};
const CRITTER_SPEC = {
  pumpkin: { color: 0xe0701a, height: 0.75 },
  candy: { color: 0xff6fae, height: 0.7 },
  stitch: { color: 0x9a7048, height: 0.85 },
  ghost: { color: 0xeae6dc, height: 0.85 },
  devil: { color: 0xc0261c, height: 0.8 },
  imp: { color: 0x8a1a3a, height: 0.8 },
  vhs: { color: 0x1e1e22, height: 0.3 },
  sock: { color: 0xe9e4d6, height: 0.62 },
  moth: { color: 0x8a7a62, height: 0.3 },
};

// locomotion clips per critter: [clip, nominal speed m/s]
const CRIT_ANIM = {
  pumpkin: { walk: ['Walk', 0.9], run: ['Hop', 3.0] },
  candy: { walk: ['Walk', 0.9], run: ['Run', 3.2] },
  stitch: { walk: ['Walk', 0.9], run: ['Run', 2.9] },
  ghost: { walk: ['Float', 0.9], run: ['FloatFast', 2.7] },
  devil: { walk: ['Walk', 0.9], run: ['Run', 3.9] },
  imp: { walk: ['Walk', 0.9], run: ['Run', 3.1] },
  vhs: { walk: ['Fly', 1.2], run: ['FlyFast', 4.0] },
  sock: { walk: ['Walk', 0.9], run: ['Hop', 3.0] },
  moth: { walk: ['Fly', 1.2], run: ['FlyFast', 4.0] },
};
const CRIT_EYE = { pumpkin: 0xffc040, candy: 0xff2a1a, stitch: 0xff2a1a, ghost: 0xffe060, devil: 0xff2a1a, imp: 0xff2a1a, vhs: 0xff2a1a, sock: 0xff3a1a, moth: 0xffb030 };
// eye glow size (the tapes' eyes are their two little reel hubs, the socks' are buttons)
const CRIT_EYE_S = { vhs: 0.1, sock: 0.12, moth: 0.09 };
// the lost socks come in every colour the laundry ever ate: [knit, stripes]
const SOCK_KNIT = [0xf2efe6, 0xe8dcc0, 0xc9c9cf, 0xf0c8d0, 0xc8d8e8, 0xd8e8c8];
const SOCK_STRIPE = [0xc8322c, 0x2a4fa0, 0x2f8a4a, 0xd0a020, 0x7a3a9a, 0x1a1a1a, 0xe07020];

// pose a (mixer-less) GLB rig with a clip at time t (photo subjects)
function poseRig(rig, key, clipName, t) {
  const A = Assets.data[key]; if (!A) return;
  const clip = A.clipMap[clipName] || A.clips[0]; if (!clip) return;
  if (!rig._poseMixer) { rig._poseMixer = new THREE.AnimationMixer(rig.root); }
  const act = rig._poseMixer.clipAction(clip);
  if (!act.isRunning()) { rig._poseMixer.stopAllAction(); act.play(); }
  rig._poseMixer.setTime(t % clip.duration);
}

// GLB critter rig (skinned + animated). Returns null when the model is unavailable.
function buildCritterGLB(type, forPhoto = false) {
  if (!Assets.has(type)) return null;
  const root = cullSkinned(Assets.inst(type, { name: 'critter_' + type }), 1.8);
  const body = GLB.find(root, 'body'), head = GLB.find(root, 'head');
  const faceCute = GLB.find(root, 'FaceCute'), faceScary = GLB.find(root, 'FaceScary');
  const flash = [], fade = [];
  const knit = type === 'sock' ? pick(SOCK_KNIT) : 0, stripe = type === 'sock' ? pick(SOCK_STRIPE) : 0;
  root.traverse((o) => {
    if (!o.isMesh) return;
    o.castShadow = !forPhoto && type !== 'vhs' && type !== 'moth'; o.receiveShadow = true;
    if (o === faceCute || o === faceScary || o.parent === faceCute || o.parent === faceScary) { o.castShadow = false; o.material = o.material.clone(); fade.push(o.material); return; }
    const m = o.material.clone(); o.material = m;
    if (knit && m.name === 'SockKnit') m.color.setHex(knit);
    else if (stripe && m.name === 'SockStripe') m.color.setHex(stripe);
    m.userData.baseEmissive = m.emissive ? m.emissive.clone() : null;
    if (m.emissive && !m.emissiveMap) flash.push(m);
    fade.push(m);
  });
  if (faceScary) faceScary.visible = false;
  // (the ghost fades in and out: its materials are see-through from the start, the variant warmShaders compiles)
  if (type === 'ghost') for (const m of fade) { if (m.userData.baseOpacity == null) m.userData.baseOpacity = m.opacity; m.transparent = true; }
  const eyeMat = EYE_MATS[type] || (EYE_MATS[type] = new THREE.SpriteMaterial({ map: glowTexture(), color: CRIT_EYE[type] || 0xff2a1a, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false }));
  const sprites = [];
  for (const n of ['EyeL', 'EyeR']) { const sock = GLB.find(root, n); if (!sock) continue; const sp = new THREE.Sprite(eyeMat); sp.scale.setScalar(CRIT_EYE_S[type] || 0.16); sp.visible = false; sock.add(sp); sprites.push(sp); }
  const parts = { eyes: { set visible(v) { for (const sp of sprites) sp.visible = v; }, get visible() { return sprites.length ? sprites[0].visible : false; } } };
  const fg = GLB.find(root, 'FaceGlow');
  if (fg && type === 'pumpkin') { parts.glow = mk(Geo.plane(0.7, 0.7), Mat.glow(0xff8a20, 0.0), 0, 0, 0, fg, { cast: false, receive: false }); }
  const spr = (sock, color, size, op) => { const m = new THREE.SpriteMaterial({ map: glowTexture(), color, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false, opacity: op }); const sp = new THREE.Sprite(m); sp.scale.setScalar(size); sock.add(sp); return sp; };
  const orbS = GLB.find(root, 'Orb');
  if (orbS) {
    // small fireball in the casting hand: soft orange halo + hot core (the group is scaled while casting)
    const og = new THREE.Group(); orbS.add(og);
    spr(og, 0xff6a18, 0.2, 0.7); spr(og, 0xffe0a0, 0.07, 0.9);
    parts.orb = og; og.userData.s0 = 1;
  }
  const core = GLB.find(root, 'Core');
  if (core) parts.core = spr(core, 0xffd860, 0.7, 0.55);
  const patch = GLB.find(root, 'Patch');
  if (patch) { parts.patch = patch; patch.visible = false; }
  if (forPhoto) setLayer(root, 1);
  const anim = forPhoto ? null : new Animator(root, type);
  if (anim) { anim.play('Idle', 0); anim.update(Math.random() * 2); }
  return { root, body, head, face: faceCute, faceMats: null, flash, fade, parts, type, height: CRITTER_SPEC[type].height, glb: true, anim, faceCute, faceScary,
    rest: { bodyY: body ? body.position.y : 0, headY: head ? head.position.y : 0 } };
}

function buildCritter(type, forPhoto = false) {
  const glb = buildCritterGLB(type, forPhoto);
  if (glb) return glb;
  const root = new THREE.Group();
  const body = grp(root);
  const head = grp(body);
  const flash = [];
  const parts = {};
  let face;
  const fm = faceMats(type === 'imp' ? 'devil' : type);
  if (type === 'pumpkin') {
    const m = uMat(0xe0701a); flash.push(m);
    head.position.y = 0.36;
    for (let i = 0; i < 7; i++) { const a = i / 7 * TAU; mk(Geo.sph(0.21, 10, 8), m, Math.cos(a) * 0.14, 0, Math.sin(a) * 0.14, head, { sy: 1.05 }); }
    mk(Geo.sph(0.27, 12, 10), m, 0, 0, 0, head, { sy: 0.95 });
    const stem = grp(head, 0, 0.26, 0);
    mk(Geo.cyl(0.035, 0.05, 0.14, 6), uMat(0x4a5a1e), 0, 0.05, 0, stem, { rz: 0.3 });
    mk(Geo.torus(0.05, 0.015, 4, 8, Math.PI), uMat(0x4a5a1e), -0.05, 0.12, 0, stem, { rz: 0.5 });
    mk(Geo.sph(0.07, 6, 4), uMat(0x5a8a2a), 0.08, 0.08, 0, stem, { sx: 1.4, sy: 0.3, rz: -0.4 });
    face = mk(facePatch(0.365, 1.15), fm.cute, 0, 0.0, 0, head, { cast: false });
    parts.feet = [mk(Geo.sph(0.07, 6, 5), uMat(0x3a4a1a), -0.12, 0.06, 0.04, body), mk(Geo.sph(0.07, 6, 5), uMat(0x3a4a1a), 0.12, 0.06, 0.04, body)];
    parts.glow = mk(Geo.plane(0.7, 0.7), Mat.glow(0xff8a20, 0.0), 0, 0.36, 0.3, body, { cast: false, receive: false });
  } else if (type === 'candy') {
    const m = uMat(0xffffff, { map: fabricTexture('candy') }); flash.push(m);
    const wrap = uMat(0x8ae0c0); flash.push(wrap);
    head.position.y = 0.36;
    mk(Geo.sph(0.27, 14, 10), m, 0, 0, 0, head);
    for (const s of [-1, 1]) { const w = grp(head, s * 0.27, 0, 0); mk(Geo.cone(0.13, 0.2, 6), wrap, s * 0.1, 0, 0, w, { rz: s * Math.PI / 2 }); mk(Geo.sph(0.05, 5, 4), wrap, 0, 0, 0, w); parts['wrap' + s] = w; }
    face = mk(facePatch(0.27, 1.3), fm.cute, 0, 0, 0, head, { cast: false });
    parts.feet = [mk(Geo.sph(0.06, 6, 5), uMat(0xff9ac8), -0.1, 0.06, 0.03, body), mk(Geo.sph(0.06, 6, 5), uMat(0xff9ac8), 0.1, 0.06, 0.03, body)];
  } else if (type === 'stitch') {
    const m = uMat(0xffffff, { map: fabricTexture('patch') }); flash.push(m);
    const pl = uMat(0x9a7048); flash.push(pl);
    mk(Geo.sph(0.22, 10, 8), m, 0, 0.3, 0, body, { sy: 1.15 });
    head.position.y = 0.62;
    mk(Geo.sph(0.21, 12, 10), pl, 0, 0, 0, head);
    mk(Geo.sph(0.07, 6, 5), pl, -0.15, 0.17, 0, head); mk(Geo.sph(0.07, 6, 5), pl, 0.15, 0.17, 0, head);
    face = mk(facePatch(0.215, 1.35), fm.cute, 0, 0, 0, head, { cast: false });
    parts.arms = [grp(body, -0.22, 0.42, 0), grp(body, 0.22, 0.42, 0)];
    for (const a of parts.arms) mk(Geo.capsule(0.06, 0.16), pl, 0, -0.1, 0, a);
    parts.feet = [mk(Geo.sph(0.08, 6, 5), pl, -0.1, 0.07, 0.02, body), mk(Geo.sph(0.08, 6, 5), pl, 0.1, 0.07, 0.02, body)];
    parts.patch = mk(Geo.box(0.12, 0.1, 0.02), uMat(0xc9b07a), 0.08, 0.36, 0.22, body, { cast: false });
    parts.patch.visible = false;
  } else if (type === 'ghost') {
    const m = uMat(0xeae6dc, { emissive: 0x3a3428, transparent: true, opacity: 0.92 }); flash.push(m);
    mk(Geo.sph(0.28, 12, 8, 0, TAU, 0, Math.PI / 2), m, 0, 0.42, 0, body);
    const skirt = mk(new THREE.CylinderGeometry(0.28, 0.36, 0.42, 12, 1, true), m, 0, 0.21, 0, body);
    skirt.material.side = THREE.DoubleSide;
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; mk(Geo.cone(0.08, 0.12, 4), m, Math.cos(a) * 0.32, -0.04, Math.sin(a) * 0.32, body, { rx: Math.PI }); }
    head.position.y = 0.46;
    face = mk(facePatch(0.315, 1.25), fm.cute, 0, 0, 0, head, { cast: false });
    // nightcap
    const cap = grp(head, 0.05, 0.22, 0, 0); cap.rotation.z = -0.5;
    mk(Geo.cone(0.18, 0.4, 8), uMat(0xffffff, { map: fabricTexture('stripes') }), 0, 0.15, 0, cap);
    mk(Geo.sph(0.05, 5, 4), uMat(0xf0ece0), 0, 0.36, 0, cap);
    parts.core = mk(Geo.plane(0.8, 0.8), Mat.glow(0xffd860, 0.55), 0, 0.3, 0, body, { cast: false, receive: false });
    parts.bodyMat = m;
  } else if (type === 'vhs') {
    const m = uMat(0x1e1e22); flash.push(m);
    head.position.y = 1.0;
    mk(Geo.box(0.43, 0.06, 0.24), m, 0, 0, 0, head);
    mk(Geo.box(0.36, 0.004, 0.1), uMat(0xe9e3d2), 0, 0.032, -0.05, head, { cast: false });
    face = mk(Geo.plane(0.2, 0.05), fm.cute, 0, 0, 0.121, head, { cast: false });
  } else if (type === 'devil' || type === 'imp') {
    const col = type === 'devil' ? 0xc0261c : 0x8a1a3a;
    const m = uMat(col); flash.push(m);
    mk(Geo.capsule(0.15, 0.2), m, 0, 0.32, 0, body);
    head.position.y = 0.62;
    mk(Geo.sph(0.2, 12, 10), m, 0, 0, 0, head);
    const hornM = uMat(0x2a1a14);
    mk(Geo.cone(0.05, 0.16, 6), hornM, -0.11, 0.18, 0, head, { rz: 0.4 });
    mk(Geo.cone(0.05, 0.16, 6), hornM, 0.11, 0.18, 0, head, { rz: -0.4 });
    face = mk(facePatch(0.205, 1.35), fm.cute, 0, 0, 0, head, { cast: false });
    const tail = grp(body, 0, 0.22, -0.13);
    mk(Geo.cyl(0.015, 0.02, 0.35, 4), m, 0, 0.0, -0.15, tail, { rx: -1.1 });
    mk(Geo.cone(0.05, 0.08, 3), hornM, 0, 0.12, -0.32, tail, { rx: -0.5 });
    parts.tail = tail;
    parts.arms = [grp(body, -0.17, 0.42, 0), grp(body, 0.17, 0.42, 0)];
    for (const a of parts.arms) mk(Geo.capsule(0.045, 0.14), m, 0, -0.1, 0, a);
    parts.feet = [mk(Geo.sph(0.06, 5, 4), hornM, -0.08, 0.05, 0.02, body), mk(Geo.sph(0.06, 5, 4), hornM, 0.08, 0.05, 0.02, body)];
    if (type === 'devil') {
      const fork = grp(parts.arms[1], 0, -0.2, 0.05);
      mk(Geo.cyl(0.012, 0.012, 0.55, 4), uMat(0x3a2a1a), 0, 0.1, 0, fork);
      for (const fx of [-0.04, 0, 0.04]) mk(Geo.cone(0.012, 0.09, 3), uMat(0x9a9aa0), fx, 0.42, 0, fork);
      parts.weapon = fork;
    } else {
      const orb = mk(Geo.plane(0.4, 0.4), Mat.glow(0xff7a20, 0.9), 0, -0.24, 0.08, parts.arms[1], { cast: false, receive: false });
      parts.orb = orb;
      for (const s of [-1, 1]) mk(Geo.cone(0.12, 0.25, 3), uMat(0x3a0a1a), s * 0.16, 0.45, -0.12, body, { rz: s * -1.1, cast: false, sz: 0.2 });
    }
  }
  // glowing eyes when they turn (readable from the isometric camera in the dark)
  const eyeMat = EYE_MATS[type] || (EYE_MATS[type] = new THREE.SpriteMaterial({ map: glowTexture(), color: type === 'ghost' ? 0xffe060 : type === 'pumpkin' ? 0xffc040 : 0xff2a1a, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false }));
  const eyes = new THREE.Group();
  const er = { pumpkin: 0.37, candy: 0.29, stitch: 0.23, ghost: 0.33, devil: 0.22, imp: 0.22, vhs: 0.12 }[type];
  for (const sx of [-1, 1]) { const sp = new THREE.Sprite(eyeMat); sp.scale.setScalar(0.22); sp.position.set(sx * er * 0.32, er * 0.18, er * 0.95); eyes.add(sp); }
  head.add(eyes); eyes.visible = false; parts.eyes = eyes;
  if (face) face.rotation.x = -0.22;
  if (forPhoto) setLayer(root, 1);
  setShadow(root, !forPhoto, false);
  // only the big parts cast shadows (keeps the flashlight shadow pass cheap)
  root.traverse((o) => { if (o.isMesh) { if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere(); if (o.geometry.boundingSphere.radius * Math.max(o.scale.x, o.scale.y, o.scale.z) < 0.15) o.castShadow = false; } });
  if (face) face.castShadow = false;
  return { root, body, head, face, faceMats: fm, flash, parts, type, height: CRITTER_SPEC[type].height };
}

// ---------------------------------------------------------------------
//  Bosses
// ---------------------------------------------------------------------
// boss eye glow sprites: [color, size]
const BOSS_EYE = { jack: [0xffc040, 0.55], maw: [0xff2a3a, 0.42], stitches: [0xff3020, 0.5], visitor: [0xffe070, 0.3], uninvited: [0xffd34a, 0.42], boogey: [0xffc83a, 0.17] };
const BOSS_H = { jack: 3.3, maw: 3.0, stitches: 3.1, visitor: 3.7, uninvited: 3.9, boogey: 2.9 };
// game anim tag -> [clip, once?, timeScale]
const BOSS_CLIP = { rear: ['Rear', true], dash: ['Dash', false, 2.4], raise: ['Raise', true], roar: ['Roar', true], throw: ['Throw', true], reach: ['Reach', true], sweep: ['Sweep', true], spit: ['Spit', true], open: ['Open', true], slam: ['Slam', true],
  // the Boogeyman: the sleeve snatch (its arm thrust lands as the sleeve shoots out), the slow coat sweep, folding
  // up to hide, unfolding out of a wardrobe
  lash: ['Reach', true, 0.5], coatSweep: ['Sweep', true, 0.6], hide: ['Hide', true], emerge: ['Emerge', true, 1.4] };

function buildBossGLB(type, forPhoto = false) {
  if (!Assets.has(type)) return null;
  const root = Assets.inst(type, { name: 'boss_' + type });
  const f = (n) => GLB.find(root, n);
  const body = f('body'), head = f('head');
  const flash = [];
  root.traverse((o) => {
    if (!o.isMesh) return;
    o.castShadow = !forPhoto; o.receiveShadow = true;
    const m = o.material.clone(); o.material = m;
    m.userData.baseEmissive = m.emissive ? m.emissive.clone() : null;
    if (m.emissive && !m.emissiveMap && !/^Glow/.test(m.name)) flash.push(m);
  });
  const parts = { head, handR: f('HandR'), handL: f('HandL') };
  const E = BOSS_EYE[type];
  if (E) {
    const em = new THREE.SpriteMaterial({ map: glowTexture(), color: E[0], blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false });
    const sprites = [];
    for (const n of ['EyeL', 'EyeR']) { const sk = f(n); if (!sk || sk.userData.glow === false) continue; const sp = new THREE.Sprite(em); sp.scale.setScalar(E[1]); sk.add(sp); sprites.push(sp); }
    parts.eyes = { set visible(v) { for (const sp of sprites) sp.visible = v; }, get visible() { return sprites.length ? sprites[0].visible : false; } };
  }
  const sprite = (sock, color, size, op) => {
    const sk = f(sock); if (!sk) return null;
    const m = new THREE.SpriteMaterial({ map: glowTexture(), color, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false, opacity: op });
    const sp = new THREE.Sprite(m); sp.scale.setScalar(size); sk.add(sp); return sp;
  };
  if (type === 'jack') parts.glow = sprite('Mouth', 0xff7a10, 1.8, 0.35);
  if (type === 'uninvited') parts.glow = sprite('Glow', 0xff2a10, 2.6, 0.3);
  if (type === 'visitor') parts.core = sprite('Core', 0xffd860, 1.2, 0.45);
  if (forPhoto) setLayer(root, 1);
  const anim = forPhoto ? null : new Animator(root, type);
  if (anim) anim.play('Idle', 0);
  const height = (root.children[0] && root.children[0].userData && root.children[0].userData.height) || BOSS_H[type] || 3;
  return { root, body, head, flash, parts, type, height, glb: true, anim };
}

function buildBoss(type, forPhoto = false) {
  const glb = buildBossGLB(type, forPhoto);
  if (glb) return glb;
  const root = new THREE.Group();
  const body = grp(root);
  const flash = [];
  const parts = {};
  let head = grp(body);
  let height = 3;
  if (type === 'jack') {
    height = 3.3;
    const vine = uMat(0x3a5a1e); flash.push(vine);
    const m = uMat(0xd8661a, { emissive: 0x401000, ei: 1 }); flash.push(m);
    // root legs
    parts.legs = [grp(body, -0.4, 1.0, 0), grp(body, 0.4, 1.0, 0)];
    for (const L of parts.legs) { mk(Geo.cyl(0.12, 0.2, 1.05, 6), vine, 0, -0.5, 0, L); mk(Geo.cone(0.25, 0.3, 5), vine, 0, -1.0, 0.1, L, { rx: 1.4 }); }
    mk(Geo.cyl(0.35, 0.22, 0.9, 7), vine, 0, 1.35, 0, body, { ry: 0.5 });
    head.position.y = 2.35;
    for (let i = 0; i < 9; i++) { const a = i / 9 * TAU; mk(Geo.sph(0.62, 12, 10), m, Math.cos(a) * 0.45, 0, Math.sin(a) * 0.45, head, { sy: 1.0 }); }
    mk(Geo.sph(0.85, 14, 10), m, 0, 0, 0, head, { sy: 0.92 });
    // hollow, cut top
    mk(Geo.cyl(0.55, 0.55, 0.05, 12), uMat(0x1a0a02), 0, 0.82, 0, head, { cast: false });
    const lid = grp(head, 0.3, 0.95, -0.2); lid.rotation.z = -0.6;
    mk(Geo.cyl(0.55, 0.62, 0.18, 12), m, 0, 0, 0, lid);
    const stem = grp(lid, 0, 0.15, 0);
    mk(Geo.cyl(0.1, 0.15, 0.4, 6), uMat(0x4a5a1e), 0, 0.15, 0, stem, { rz: 0.3 });
    mk(Geo.torus(0.15, 0.04, 4, 8, Math.PI), uMat(0x4a5a1e), -0.15, 0.36, 0, stem, { rz: 0.5 });
    mk(Geo.sph(0.22, 6, 4), uMat(0x5a8a2a), 0.25, 0.25, 0, stem, { sx: 1.4, sy: 0.3, rz: -0.4 });
    const fm = new THREE.MeshBasicMaterial({ map: faceTexture('jack', true), transparent: true, alphaTest: 0.35 });
    parts.face = mk(facePatch(1.1, 1.25), fm, 0, 0, 0, head, { cast: false });
    parts.glow = mk(Geo.plane(2.2, 2.2), Mat.glow(0xff7a10, 0.7), 0, 2.3, 1.2, body, { cast: false, receive: false });
    parts.arms = [grp(body, -0.9, 1.9, 0), grp(body, 0.9, 1.9, 0)];
    for (const [i, A] of parts.arms.entries()) {
      const s = i ? 1 : -1;
      mk(Geo.cyl(0.08, 0.13, 1.4, 6), vine, s * 0.2, -0.6, 0.1, A, { rz: s * 0.25 });
      for (let k = 0; k < 3; k++) mk(Geo.sph(0.18, 6, 4), uMat(0x4a7a2a), s * 0.35 + (k - 1) * 0.12, -1.3, 0.2, A, { sx: 0.6, sy: 1.4, rz: (k - 1) * 0.5 });
    }
  } else if (type === 'maw') {
    height = 3.0;
    const m = uMat(0xffffff, { map: fabricTexture('candy') }); flash.push(m);
    const wrap = uMat(0x8ae0c0); flash.push(wrap);
    parts.legs = [grp(body, -0.5, 0.6, 0), grp(body, 0.5, 0.6, 0)];
    for (const L of parts.legs) mk(Geo.cyl(0.18, 0.22, 0.65, 8), uMat(0xff9ac8), 0, -0.3, 0, L);
    head.position.y = 1.75;
    mk(Geo.sph(1.15, 18, 12), m, 0, 0, 0, head);
    // mouth: dark cavity + candy corn teeth
    const mouth = grp(head, 0, -0.15, 0.62);
    mk(Geo.sph(0.75, 14, 8, 0, TAU, 0, Math.PI), uMat(0x3a0614), 0, 0, 0, mouth, { rx: Math.PI / 2, sy: 0.55, cast: false });
    const corn = (x, y, flip) => { const t = grp(mouth, x, y, 0.42); t.rotation.z = flip ? Math.PI : 0; mk(Geo.cone(0.09, 0.12, 5), uMat(0xffffff), 0, -0.06, 0, t); mk(Geo.cone(0.095, 0.08, 5), uMat(0xffb020), 0, 0.03, 0, t, { cast: false }); };
    for (let i = 0; i < 7; i++) { corn(-0.55 + i * 0.18, 0.28, true); corn(-0.55 + i * 0.18, -0.28, false); }
    parts.mouth = mouth;
    for (const s of [-1, 1]) { const w = grp(head, s * 1.1, 0.2, 0); mk(Geo.cone(0.45, 0.8, 6), wrap, s * 0.35, 0, 0, w, { rz: s * Math.PI / 2 }); mk(Geo.sph(0.18, 6, 4), wrap, 0, 0, 0, w); }
    const eyeM = new THREE.MeshBasicMaterial({ color: 0xff2a3a });
    mk(Geo.sph(0.1, 8, 6), eyeM, -0.35, 0.55, 0.98, head, { cast: false });
    mk(Geo.sph(0.1, 8, 6), eyeM, 0.35, 0.55, 0.98, head, { cast: false });
    parts.arms = [grp(body, -1.0, 1.8, 0.2), grp(body, 1.0, 1.8, 0.2)];
    const taffy = uMat(0xffffff, { map: fabricTexture('stripes') });
    for (const [i, A] of parts.arms.entries()) {
      const s = i ? 1 : -1;
      const seg = grp(A, 0, 0, 0); seg.rotation.z = s * 0.4;
      mk(Geo.cyl(0.1, 0.12, 1.3, 6), taffy, 0, -0.65, 0, seg);
      mk(Geo.sph(0.22, 8, 6), uMat(0xff9ac8), 0, -1.35, 0, seg);
      parts['arm' + i] = seg;
    }
    // licorice tongue (scaled at runtime)
    const tongue = grp(head, 0, -0.2, 0.9);
    parts.tongueMesh = mk(Geo.cyl(0.09, 0.09, 1, 6), uMat(0x141016), 0, 0, 0.5, tongue, { rx: Math.PI / 2 });
    mk(Geo.sph(0.16, 6, 5), uMat(0x2a0a14), 0, 0, 1.0, tongue);
    tongue.visible = false;
    parts.tongue = tongue;
  } else if (type === 'stitches') {
    height = 3.1;
    const pm = uMat(0xffffff, { map: fabricTexture('patch') }); flash.push(pm);
    const pl = uMat(0x9a7048); flash.push(pl);
    parts.legs = [grp(body, -0.55, 0.6, 0), grp(body, 0.55, 0.6, 0)];
    for (const L of parts.legs) mk(Geo.sph(0.4, 8, 6), pl, 0, -0.25, 0.1, L, { sy: 1.2 });
    mk(Geo.sph(1.05, 14, 10), pm, 0, 1.45, 0, body, { sy: 1.05 });
    // zipper belly
    mk(Geo.box(0.06, 1.1, 0.02), uMat(0x2a2a2a), 0, 1.35, 1.03, body, { cast: false });
    for (let k = 0; k < 10; k++) mk(Geo.box(0.14, 0.02, 0.02), uMat(0x9a9aa0), 0, 0.85 + k * 0.11, 1.04, body, { cast: false });
    parts.zip = mk(Geo.box(0.1, 0.16, 0.03), uMat(0xc0c0c8), 0, 1.92, 1.06, body, { cast: false });
    head.position.y = 2.65;
    mk(Geo.sph(0.62, 12, 10), pl, 0, 0, 0, head);
    mk(Geo.sph(0.2, 8, 6), pl, -0.45, 0.45, 0, head); mk(Geo.sph(0.2, 8, 6), pl, 0.45, 0.45, 0, head);
    const fm = new THREE.MeshBasicMaterial({ map: faceTexture('stitches', true), transparent: true, alphaTest: 0.35 });
    parts.face = mk(facePatch(0.625, 1.45), fm, 0, 0, 0, head, { cast: false });
    // extra sewn-on heads (cute ones gone wrong)
    const small = (x, y, z, col) => {
      const h = grp(body, x, y, z);
      mk(Geo.sph(0.3, 10, 8), uMat(col), 0, 0, 0, h);
      const f = faceMats('stitch');
      mk(facePatch(0.305, 1.35), f.scary, 0, 0, 0, h, { cast: false });
      return h;
    };
    parts.extra = [small(-0.95, 2.15, 0.1, 0x7a5a8a), small(0.95, 2.1, 0.15, 0xc9b07a)];
    parts.extra[0].rotation.z = 0.5; parts.extra[1].rotation.z = -0.4;
    parts.arms = [grp(body, -1.0, 1.8, 0), grp(body, 1.0, 1.8, 0)];
    for (const [i, A] of parts.arms.entries()) { const s = i ? 1 : -1; mk(Geo.capsule(0.2, 0.9), pl, s * 0.2, -0.6, 0, A, { rz: s * 0.35 }); }
    for (let k = 0; k < 6; k++) mk(Geo.sph(0.12, 5, 4), uMat(0xf4f0e6), rand(-0.8, 0.8), rand(0.8, 2.0), rand(0.6, 0.9), body, { cast: false });
  } else if (type === 'visitor') {
    height = 3.7;
    const sheet = uMat(0xffffff, { map: fabricTexture('sheet'), emissive: 0x1a1810 }); flash.push(sheet);
    const lean = grp(body, 0, 0, 0); parts.lean = lean;
    mk(new THREE.CylinderGeometry(0.35, 0.9, 2.9, 10, 1, true), sheet, 0, 1.45, 0, lean).material.side = THREE.DoubleSide;
    const upper = grp(lean, 0, 2.8, 0); upper.rotation.x = 0.45; parts.upper = upper;
    mk(Geo.cyl(0.25, 0.38, 0.6, 8), sheet, 0, 0.2, 0, upper);
    head = grp(upper, 0, 0.75, 0.25);
    mk(Geo.sph(0.3, 10, 8), sheet, 0, 0, 0, head, { sy: 1.25 });
    const fm = new THREE.MeshBasicMaterial({ map: faceTexture('visitor', true), transparent: true, alphaTest: 0.35 });
    parts.face = mk(facePatch(0.305, 1.4), fm, 0, 0, 0, head, { cast: false, sy: 1.25 });
    const cap = grp(head, 0.05, 0.32, 0); cap.rotation.z = -0.6;
    mk(Geo.cone(0.28, 0.8, 8), uMat(0xffffff, { map: fabricTexture('stripes') }), 0, 0.3, 0, cap);
    mk(Geo.sph(0.08, 5, 4), uMat(0xf0ece0), 0, 0.72, 0, cap);
    parts.arms = [grp(upper, -0.4, 0.4, 0), grp(upper, 0.4, 0.4, 0)];
    for (const [i, A] of parts.arms.entries()) {
      const s = i ? 1 : -1;
      mk(Geo.cyl(0.06, 0.09, 2.2, 6), sheet, s * 0.15, -1.1, 0.2, A, { rz: s * 0.1, rx: -0.2 });
      for (let k = 0; k < 4; k++) mk(Geo.cyl(0.015, 0.02, 0.35, 4), uMat(0xd8d0c0), s * 0.25 + (k - 1.5) * 0.04, -2.3, 0.45, A, { rx: 0.4 });
    }
    parts.core = mk(Geo.plane(1.6, 1.6), Mat.glow(0xffd860, 0.6), 0, 2.2, 0.4, body, { cast: false, receive: false });
  } else if (type === 'uninvited') {
    height = 3.9;
    const skin = uMat(0xffffff, { map: fabricTexture('skin'), emissive: 0x3a0804, ei: 1 }); flash.push(skin);
    const coat = uMat(0xffffff, { map: fabricTexture('coat') }); flash.push(coat);
    const black = uMat(0x0b0a0d);
    parts.legs = [grp(body, -0.35, 1.3, 0), grp(body, 0.35, 1.3, 0)];
    for (const L of parts.legs) { mk(Geo.cyl(0.17, 0.12, 1.3, 7), skin, 0, -0.65, 0, L); mk(Geo.box(0.3, 0.18, 0.4), black, 0, -1.25, 0.08, L); }
    mk(Geo.capsule(0.55, 0.8), skin, 0, 2.15, 0, body);
    // coat (open front)
    mk(new THREE.CylinderGeometry(0.62, 1.05, 2.3, 12, 1, true, 0.6, TAU - 1.2), coat, 0, 1.65, 0, body).material.side = THREE.DoubleSide;
    mk(Geo.box(1.5, 0.3, 0.8), coat, 0, 2.85, 0, body);
    head.position.y = 3.35;
    mk(Geo.sph(0.42, 12, 10), skin, 0, 0, 0, head, { sy: 1.1 });
    const fm = new THREE.MeshBasicMaterial({ map: faceTexture('uninvited', true), transparent: true, alphaTest: 0.35 });
    parts.face = mk(facePatch(0.425, 1.45), fm, 0, 0, 0, head, { cast: false, sy: 1.1 });
    // the visitor's hat, horns through it
    mk(Geo.cyl(0.72, 0.72, 0.05, 18), black, 0, 0.4, 0, head);
    mk(Geo.cyl(0.42, 0.46, 0.5, 14), black, 0, 0.67, 0, head);
    mk(Geo.cyl(0.465, 0.465, 0.09, 14), uMat(0x3a0a0a), 0, 0.48, 0, head, { cast: false });
    const hornM = uMat(0x2a1a14);
    for (const s of [-1, 1]) { const h = grp(head, s * 0.35, 0.45, 0); h.rotation.z = s * -0.6; mk(Geo.cone(0.12, 0.7, 6), hornM, 0, 0.35, 0, h); }
    parts.arms = [grp(body, -0.75, 2.75, 0), grp(body, 0.75, 2.75, 0)];
    for (const [i, A] of parts.arms.entries()) {
      const s = i ? 1 : -1;
      mk(Geo.capsule(0.17, 1.0), coat, s * 0.1, -0.6, 0, A, { rz: s * 0.15 });
      mk(Geo.sph(0.2, 8, 6), skin, s * 0.2, -1.3, 0.05, A);
      for (let k = 0; k < 3; k++) mk(Geo.cone(0.04, 0.2, 4), hornM, s * 0.2 + (k - 1) * 0.08, -1.5, 0.12, A, { rx: Math.PI });
    }
    // a fan of five polaroids in the left hand
    const fan = grp(parts.arms[0], -0.2, -1.35, 0.35);
    for (let i = 0; i < 5; i++) mk(Geo.box(0.28, 0.01, 0.34), uMat(0xf2eee4), (i - 2) * 0.09, 0, 0, fan, { ry: (i - 2) * 0.25, rx: 1.2, cast: false });
    const tail = grp(body, 0, 1.4, -0.5); parts.tail = tail;
    mk(Geo.cyl(0.04, 0.08, 1.6, 5), skin, 0, -0.2, -0.7, tail, { rx: -1.2 });
    mk(Geo.cone(0.14, 0.25, 3), hornM, 0, 0.1, -1.45, tail, { rx: -0.6 });
    parts.glow = mk(Geo.plane(3, 3), Mat.glow(0xff2a10, 0.4), 0, 2.0, 0.6, body, { cast: false, receive: false });
  }
  parts.head = head;
  // glowing eyes, readable from any angle
  const E = { jack: [0xffc040, 0.42, 0.18, 1.02, 0.75], maw: [0xff2a3a, 0.35, 0.55, 1.05, 0.5], stitches: [0xff3020, 0.3, 0.07, 0.62, 0.55], visitor: [0xffe070, 0.11, 0.05, 0.3, 0.35], uninvited: [0xffd34a, 0.17, 0.05, 0.42, 0.55] }[type];
  if (E) {
    const em = new THREE.SpriteMaterial({ map: glowTexture(), color: E[0], blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false });
    const eyes = new THREE.Group();
    const sides = type === 'stitches' ? [-1] : [-1, 1];
    for (const sx of sides) { const sp = new THREE.Sprite(em); sp.scale.setScalar(E[4]); sp.position.set(sx * E[1], E[2], E[3]); eyes.add(sp); }
    head.add(eyes); parts.eyes = eyes;
  }
  if (forPhoto) setLayer(root, 1);
  setShadow(root, !forPhoto, false);
  return { root, body, head, flash, parts, type, height };
}

// ---------------------------------------------------------------------
//  Pickups
// ---------------------------------------------------------------------
function buildPickupModel(kind) {
  const g = new THREE.Group();
  const inner = grp(g, 0, 0.35, 0);
  // items.glb pickups (origin at the bottom center) are centered on the spin / bob pivot
  const KIT = { nails: ['NailsBox', 1.0], shells: ['ShellsBox', 1.35], candy: ['Candy', 1.5], choco: ['ChocoBar', 1.45], upgrade: ['UpgradePolaroid', 1.6], bombbag: ['BombBag', 1.35], bomb: ['PumpkinBomb', 2.2] }[kind];
  const it = KIT ? itemModel(KIT[0], { s: KIT[1] }) : null;
  if (it) {
    const bb = new THREE.Box3().setFromObject(it);
    it.position.y = -(bb.min.y + bb.max.y) / 2;
    if (kind === 'bomb') fuseSpark(it, 0.05);
    inner.add(it);
  } else switch (kind) {
    case 'nails': mk(Geo.box(0.32, 0.18, 0.22), uMat(0x7a7a80), 0, 0, 0, inner); mk(Geo.box(0.33, 0.08, 0.23), uMat(0xe8b818), 0, 0.02, 0, inner, { cast: false }); break;
    case 'shells': mk(Geo.box(0.3, 0.16, 0.2), uMat(0xb3242a), 0, 0, 0, inner); for (let i = 0; i < 3; i++) mk(Geo.cyl(0.03, 0.03, 0.1, 6), uMat(0xd8a040), -0.08 + i * 0.08, 0.12, 0, inner, { cast: false }); break;
    case 'bomb': inner.add(buildWeaponModel('bomb')); inner.scale.setScalar(2.2); break;
    case 'candy': {
      const m = uMat(0xff5fa0); mk(Geo.sph(0.12, 8, 6), m, 0, 0, 0, inner, { sx: 1.3 });
      for (const s of [-1, 1]) mk(Geo.cone(0.08, 0.12, 5), uMat(0xffd34a), s * 0.2, 0, 0, inner, { rz: s * Math.PI / 2 });
      break;
    }
    case 'choco': mk(Geo.box(0.4, 0.06, 0.2), uMat(0x5a2a14), 0, 0, 0, inner); mk(Geo.box(0.26, 0.07, 0.21), uMat(0xb3242a), 0.07, 0, 0, inner, { cast: false }); break;
    case 'nailgun': case 'shotgun': { const w = buildWeaponModel(kind); w.scale.setScalar(1.8); w.rotation.y = Math.PI / 2; inner.add(w); break; }
    case 'bombbag': { const w = buildWeaponModel('bomb'); w.scale.setScalar(2.4); inner.add(w); const w2 = buildWeaponModel('bomb'); w2.scale.setScalar(2.0); w2.position.set(0.2, -0.05, 0.1); inner.add(w2); break; }
    case 'upgrade': {
      mk(Geo.box(0.36, 0.44, 0.02), uMat(0xf2eee4, { emissive: 0x7a6a40, ei: 0.6 }), 0, 0.1, 0, inner);
      mk(Geo.plane(0.3, 0.3), new THREE.MeshBasicMaterial({ color: 0xff9a3d }), 0, 0.15, 0.011, inner, { cast: false });
      break;
    }
  }
  const ringCol = { nails: 0xffd34a, shells: 0xff6a4a, bomb: 0xff9a2a, candy: 0xff7ab0, choco: 0xff7ab0, nailgun: 0xffd34a, shotgun: 0xffd34a, bombbag: 0xffd34a, upgrade: 0xffe0a0 }[kind] || 0xffffff;
  const ring = mk(Geo.plane(1.1, 1.1), Mat.glow(ringCol, kind === 'upgrade' ? 0.9 : 0.5), 0, 0.03, 0, g, { rx: -Math.PI / 2, cast: false, receive: false });
  // (no shadow: a bobbing pickup would keep every shadow map redrawing for as long as it lies there)
  setShadow(inner, false, false);
  return { root: g, inner, ring };
}

// =====================================================================
//  FX: particles, debris chunks, floor decals, attack telegraphs
// =====================================================================
const PART_VERT = `
attribute float psize; attribute vec4 pcolor; varying vec4 vColor; uniform float uScale;
void main(){ vColor = pcolor; vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_PointSize = max(1.0, psize * uScale / -mv.z); gl_Position = projectionMatrix * mv; }`;
const PART_FRAG = `
varying vec4 vColor; uniform float uSoft;
void main(){ vec2 c = gl_PointCoord - 0.5; float d = length(c); if (d > 0.5) discard; float a = mix(1.0, smoothstep(0.5, 0.0, d), uSoft); gl_FragColor = vec4(vColor.rgb, vColor.a * a); }`;

class ParticleSystem {
  constructor(max, additive) {
    this.max = max; this.n = 0;
    this.pos = new Float32Array(max * 3); this.col = new Float32Array(max * 4); this.size = new Float32Array(max);
    this.vel = new Float32Array(max * 3); this.life = new Float32Array(max); this.maxLife = new Float32Array(max);
    this.grav = new Float32Array(max); this.drag = new Float32Array(max); this.s0 = new Float32Array(max); this.s1 = new Float32Array(max); this.a0 = new Float32Array(max);
    const g = new THREE.BufferGeometry();
    this.pAttr = new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage);
    this.cAttr = new THREE.BufferAttribute(this.col, 4).setUsage(THREE.DynamicDrawUsage);
    this.sAttr = new THREE.BufferAttribute(this.size, 1).setUsage(THREE.DynamicDrawUsage);
    g.setAttribute('position', this.pAttr); g.setAttribute('pcolor', this.cAttr); g.setAttribute('psize', this.sAttr);
    g.setDrawRange(0, 0);
    this.mat = new THREE.ShaderMaterial({
      vertexShader: PART_VERT, fragmentShader: PART_FRAG, transparent: true, depthWrite: false,
      blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
      uniforms: { uScale: { value: 300 }, uSoft: { value: additive ? 1 : 0.35 } },
    });
    this.points = new THREE.Points(g, this.mat);
    this.points.frustumCulled = false;
    this.points.renderOrder = additive ? 5 : 4;
    this.geo = g;
  }
  emit(x, y, z, vx, vy, vz, r, gg, b, a, size, life, grav = 0, drag = 0, size1 = null) {
    let i;
    if (this.n < this.max) i = this.n++;
    else i = Math.floor(Math.random() * this.max);
    this.pos[i * 3] = x; this.pos[i * 3 + 1] = y; this.pos[i * 3 + 2] = z;
    this.vel[i * 3] = vx; this.vel[i * 3 + 1] = vy; this.vel[i * 3 + 2] = vz;
    this.col[i * 4] = r; this.col[i * 4 + 1] = gg; this.col[i * 4 + 2] = b; this.col[i * 4 + 3] = a;
    this.a0[i] = a; this.size[i] = size; this.s0[i] = size; this.s1[i] = size1 == null ? size : size1;
    this.life[i] = life; this.maxLife[i] = life; this.grav[i] = grav; this.drag[i] = drag;
  }
  update(dt) {
    let n = this.n;
    for (let i = 0; i < n; i++) {
      this.life[i] -= dt;
      if (this.life[i] <= 0) {
        // swap with last
        n--;
        if (i !== n) {
          for (let k = 0; k < 3; k++) { this.pos[i * 3 + k] = this.pos[n * 3 + k]; this.vel[i * 3 + k] = this.vel[n * 3 + k]; }
          for (let k = 0; k < 4; k++) this.col[i * 4 + k] = this.col[n * 4 + k];
          this.size[i] = this.size[n]; this.life[i] = this.life[n]; this.maxLife[i] = this.maxLife[n]; this.grav[i] = this.grav[n];
          this.drag[i] = this.drag[n]; this.s0[i] = this.s0[n]; this.s1[i] = this.s1[n]; this.a0[i] = this.a0[n];
          i--;
        }
        continue;
      }
      const d = Math.max(0, 1 - this.drag[i] * dt);
      this.vel[i * 3] *= d; this.vel[i * 3 + 1] = this.vel[i * 3 + 1] * d - this.grav[i] * dt; this.vel[i * 3 + 2] *= d;
      this.pos[i * 3] += this.vel[i * 3] * dt; this.pos[i * 3 + 1] += this.vel[i * 3 + 1] * dt; this.pos[i * 3 + 2] += this.vel[i * 3 + 2] * dt;
      if (this.pos[i * 3 + 1] < 0.01 && this.grav[i] > 0) { this.pos[i * 3 + 1] = 0.01; this.vel[i * 3 + 1] *= -0.3; this.vel[i * 3] *= 0.6; this.vel[i * 3 + 2] *= 0.6; }
      const k = this.life[i] / this.maxLife[i];
      this.size[i] = lerp(this.s1[i], this.s0[i], k);
      this.col[i * 4 + 3] = this.a0[i] * Math.min(1, k * 2.5);
    }
    this.n = n;
    this.geo.setDrawRange(0, n);
    // (upload only the live part of the buffers, and nothing while there is nothing to draw)
    if (n === 0) return;
    for (const [a, k] of this._attrs || (this._attrs = [[this.pAttr, 3], [this.cAttr, 4], [this.sAttr, 1]])) { a.clearUpdateRanges(); a.addUpdateRange(0, n * k); a.needsUpdate = true; }
  }
  clear() { this.n = 0; this.geo.setDrawRange(0, 0); }
}

const Particles = {
  glow: null, dust: null,
  init() {
    this.glow = new ParticleSystem(1600, true);
    this.dust = new ParticleSystem(1600, false);
    Render.scene.add(this.glow.points); Render.scene.add(this.dust.points);
    this.updateScale();
  },
  updateScale() {
    if (!this.glow) return;
    const s = Render.rh / (2 * Math.tan(Render.camera.fov * DEG / 2));
    this.glow.mat.uniforms.uScale.value = s; this.dust.mat.uniforms.uScale.value = s;
  },
  update(dt) { this.updateScale(); this.glow.update(dt); this.dust.update(dt); },
  clear() { this.glow.clear(); this.dust.clear(); },
};

const FX = {
  _c: new THREE.Color(),
  rgb(hex) { this._c.set(hex); return [this._c.r, this._c.g, this._c.b]; },
  burst(x, y, z, hex, n = 12, speed = 3, o = {}) {
    const [r, g, b] = this.rgb(hex);
    const sys = o.glow ? Particles.glow : Particles.dust;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * TAU, up = rand(o.upMin ?? 0.2, o.upMax ?? 1.0), sp = speed * rand(0.4, 1);
      sys.emit(x, y, z, Math.cos(a) * sp, up * speed * rand(0.5, 1.2), Math.sin(a) * sp, r * rand(0.8, 1.15), g * rand(0.8, 1.15), b * rand(0.8, 1.15), o.alpha ?? 1, (o.size ?? 0.12) * rand(0.7, 1.3), (o.life ?? 0.8) * rand(0.6, 1.2), o.grav ?? 9, o.drag ?? 1.5, o.size1 ?? null);
    }
  },
  sparks(x, y, z, hex = 0xffc060, n = 10, speed = 6) { this.burst(x, y, z, hex, n, speed, { glow: true, size: 0.07, life: 0.35, grav: 6, drag: 3, size1: 0.02 }); },
  smoke(x, y, z, n = 6, hex = 0x2a2624, size = 0.6) {
    const [r, g, b] = this.rgb(hex);
    for (let i = 0; i < n; i++) Particles.dust.emit(x + rand(-0.3, 0.3), y + rand(0, 0.3), z + rand(-0.3, 0.3), rand(-0.4, 0.4), rand(0.4, 1.2), rand(-0.4, 0.4), r, g, b, 0.45, size * rand(0.6, 1.2), rand(0.8, 1.6), -0.3, 1.2, size * 2.2);
  },
  fire(x, y, z, n = 3, spread = 0.2, size = 0.3) {
    for (let i = 0; i < n; i++) {
      const hot = Math.random();
      Particles.glow.emit(x + rand(-spread, spread), y + rand(0, spread), z + rand(-spread, spread), rand(-0.3, 0.3), rand(0.8, 2.0), rand(-0.3, 0.3), 1, 0.35 + hot * 0.4, 0.08 * hot, 0.85, size * rand(0.7, 1.3), rand(0.35, 0.7), -1.5, 1.5, size * 0.2);
    }
  },
  explosion(x, z, radius) {
    this.burst(x, 0.6, z, 0xff8a20, 40, radius * 3.2, { glow: true, size: 0.35, life: 0.6, grav: 2, drag: 3, size1: 0.05 });
    this.burst(x, 0.6, z, 0xffe080, 20, radius * 2, { glow: true, size: 0.5, life: 0.35, grav: 0, drag: 4, size1: 0.1 });
    this.smoke(x, 0.4, z, 14, 0x1a1614, 1.1);
    this.burst(x, 0.5, z, 0xe0701a, 16, 6, { size: 0.12, life: 1.2, grav: 12, drag: 0.8 });
    Chunks.spawn(x, 0.5, z, 0xd8661a, 10, 6);
    Decals.add('scorch', x, z, radius * 0.9, 0x000000, 14);
    this.light(x, 1.2, z, 0xff8a30, 60, 0.35);
  },
  light(x, y, z, hex, I, dur) {
    const L = W.flashFX; L.position.set(x, y, z); L.color.set(hex); L.intensity = I; this._lightT = dur; this._lightI = I;
  },
  update(dt) {
    if (this._lightT > 0) { this._lightT -= dt; W.flashFX.intensity = Math.max(0, this._lightI * (this._lightT / 0.35)); if (this._lightT <= 0) W.flashFX.intensity = 0; }
  },
};

// ---------------------------------------------------------------------
//  Debris chunks (instanced)
// ---------------------------------------------------------------------
const Chunks = {
  max: 220, list: [], mesh: null,
  init() {
    const m = new THREE.MeshLambertMaterial({ color: 0xffffff });
    this.mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), m, this.max);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.count = 0; this.mesh.castShadow = false; this.mesh.frustumCulled = false;
    for (let i = 0; i < this.max; i++) this.mesh.setColorAt(i, new THREE.Color(1, 1, 1));
    Render.scene.add(this.mesh);
    this._m = new THREE.Matrix4(); this._q = new THREE.Quaternion(); this._e = new THREE.Euler(); this._s = new THREE.Vector3(); this._p = new THREE.Vector3(); this._col = new THREE.Color();
  },
  spawn(x, y, z, hex, n = 6, speed = 4, size = 0.1) {
    for (let i = 0; i < n; i++) {
      if (this.list.length >= this.max) this.list.shift();
      const a = Math.random() * TAU, sp = speed * rand(0.3, 1);
      this.list.push({ x, y, z, vx: Math.cos(a) * sp, vy: rand(2, 5), vz: Math.sin(a) * sp, rx: rand(0, 6), ry: rand(0, 6), rz: rand(0, 6), wr: rand(-12, 12), life: rand(2.5, 4), s: size * rand(0.6, 1.4), col: hex, rest: false });
    }
  },
  update(dt) {
    if (!this.list.length) { if (this.mesh.count) this.mesh.count = 0; return; }
    let i = 0;
    for (const c of this.list) {
      c.life -= dt;
      if (!c.rest) {
        c.vy -= 16 * dt; c.x += c.vx * dt; c.y += c.vy * dt; c.z += c.vz * dt;
        c.rx += c.wr * dt; c.rz += c.wr * 0.7 * dt;
        if (c.y < c.s / 2) { c.y = c.s / 2; c.vy *= -0.35; c.vx *= 0.55; c.vz *= 0.55; c.wr *= 0.5; if (Math.abs(c.vy) < 0.6) { c.rest = true; c.rx = 0; c.rz = 0; } }
      }
    }
    // (compacted in place, no new array every frame)
    let w = 0;
    for (const c of this.list) if (c.life > 0) this.list[w++] = c;
    this.list.length = w;
    for (const c of this.list) {
      const sc = c.s * Math.min(1, c.life * 2);
      this._e.set(c.rx, c.ry, c.rz); this._q.setFromEuler(this._e); this._s.set(sc, sc, sc); this._p.set(c.x, c.y, c.z);
      this._m.compose(this._p, this._q, this._s);
      this.mesh.setMatrixAt(i, this._m);
      if (c.lin === undefined) { this._col.set(c.col); c.lin = this._col.clone(); }
      this.mesh.setColorAt(i, c.lin);
      i++;
    }
    this.mesh.count = i;
    const im = this.mesh.instanceMatrix; im.clearUpdateRanges(); im.addUpdateRange(0, Math.max(1, i) * 16); im.needsUpdate = true;
    const ic = this.mesh.instanceColor; if (ic) { ic.clearUpdateRanges(); ic.addUpdateRange(0, Math.max(1, i) * 3); ic.needsUpdate = true; }
  },
  clear() { this.list = []; this.mesh.count = 0; },
};

// ---------------------------------------------------------------------
//  Floor decals: sticky puddles (gameplay), scorch marks, splats
// ---------------------------------------------------------------------
const Decals = {
  list: [], max: 70, group: null,
  init() { this.group = grp(Render.scene); },
  // (one decal that is never disposed, for warmShaders, see Tele.keep)
  keep() {
    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff, map: splatTexture(), transparent: true, depthWrite: false, opacity: 0, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
    mat.emissive = new THREE.Color(0x000000);
    return mk(Geo.plane(2, 2), mat, 0, -50, 0, null, { rx: -Math.PI / 2, cast: false });
  },
  add(kind, x, z, r, hex, life = 10, o = {}) {
    if (this.list.length >= this.max) { const old = this.list.shift(); this.group.remove(old.mesh); old.mesh.material.dispose(); }
    const tex = kind === 'scorch' ? scorchTexture() : splatTexture();
    const mat = new THREE.MeshLambertMaterial({ color: hex, map: tex, transparent: true, depthWrite: false, opacity: 0, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
    if (kind === 'puddle' || kind === 'tar') { mat.emissive = new THREE.Color(hex); mat.emissiveIntensity = kind === 'tar' ? 0.6 : 0.18; }
    const m = mk(Geo.plane(2, 2), mat, x, 0.02 + this.list.length * 0.0004, z, this.group, { rx: -Math.PI / 2, cast: false });
    m.rotation.z = rand(0, TAU);
    m.scale.setScalar(0.01);
    const d = { kind, x, z, r, life, max: life, mesh: m, slow: o.slow || 0, dps: o.dps || 0, grow: 0, owner: o.owner || null };
    this.list.push(d);
    return d;
  },
  update(dt) {
    for (const d of this.list) {
      d.life -= dt; d.grow = Math.min(1, d.grow + dt * 5);
      d.mesh.scale.setScalar(Math.max(0.01, d.r * easeOutBack(d.grow)));
      const op = Math.min(1, d.life / 1.2) * (d.kind === 'scorch' ? 0.8 : 0.85);
      d.mesh.material.opacity = Math.max(0, op);
    }
    if (!this.list.some((d) => d.life <= 0)) return;
    for (const d of this.list) if (d.life <= 0) { this.group.remove(d.mesh); d.mesh.material.dispose(); }
    compact(this.list, (d) => d.life > 0);
  },
  // gameplay query: slow factor + damage at a point
  at(x, z) {
    let slow = 0, dps = 0;
    for (const d of this.list) {
      if (!d.slow && !d.dps) continue;
      if (d.life < 0.4) continue;
      if (dist2(x, z, d.x, d.z) < (d.r * 0.85) * (d.r * 0.85)) { slow = Math.max(slow, d.slow); dps = Math.max(dps, d.dps); }
    }
    return { slow, dps };
  },
  clear() { for (const d of this.list) { this.group.remove(d.mesh); d.mesh.material.dispose(); } this.list = []; },
};

// ---------------------------------------------------------------------
//  Telegraphs (red floor warnings before attacks)
// ---------------------------------------------------------------------
const TELE_FRAG = `
varying vec2 vUv; uniform vec3 uColor; uniform float uProgress; uniform float uAlpha; uniform float uShape; uniform float uHalfArc; uniform float uTime;
void main(){
  float a = 0.0;
  if (uShape < 0.5) { // circle
    float d = length(vUv - 0.5) * 2.0; if (d > 1.0) discard;
    float edge = smoothstep(0.86, 0.98, d);
    a = 0.18 + edge * 0.7 + step(d, uProgress) * 0.28;
  } else if (uShape < 1.5) { // line (x along length)
    float e = max(smoothstep(0.8, 1.0, abs(vUv.y - 0.5) * 2.0), smoothstep(0.97, 1.0, vUv.x));
    a = 0.16 + e * 0.6 + step(vUv.x, uProgress) * 0.3;
  } else { // cone
    vec2 p = (vUv - 0.5) * 2.0; float d = length(p); if (d > 1.0) discard;
    float ang = atan(p.y, p.x); if (abs(ang) > uHalfArc) discard;
    float edge = max(smoothstep(0.88, 1.0, d), smoothstep(uHalfArc - 0.06, uHalfArc, abs(ang)));
    a = 0.16 + edge * 0.6 + step(d, uProgress) * 0.3;
  }
  a *= 0.75 + 0.25 * sin(uTime * 18.0);
  gl_FragColor = vec4(uColor, a * uAlpha);
}`;
const Tele = {
  list: [], group: null, lineGeo: null,
  init() {
    this.group = grp(Render.scene);
    this.lineGeo = new THREE.PlaneGeometry(1, 1); this.lineGeo.translate(0.5, 0, 0);
  },
  _make(shape, geo) {
    const mat = new THREE.ShaderMaterial({
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: TELE_FRAG, transparent: true, depthWrite: false,
      uniforms: { uColor: { value: new THREE.Color(0xff2a1a) }, uProgress: { value: 0 }, uAlpha: { value: 1 }, uShape: { value: shape }, uHalfArc: { value: 0.6 }, uTime: { value: 0 } },
      polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4,
    });
    const m = new THREE.Mesh(geo, mat); m.rotation.x = -Math.PI / 2; m.renderOrder = 3;
    this.group.add(m);
    return m;
  },
  // (a telegraph that is never disposed, for warmShaders: its program then outlives the ones that come and go)
  keep() { const m = this._make(0, Geo.plane(2, 2)); this.group.remove(m); m.position.y = -50; return m; },
  circle(x, z, r, dur, hex = 0xff2a1a) {
    const m = this._make(0, Geo.plane(2, 2)); m.position.set(x, 0.05, z); m.scale.set(r, r, 1);
    m.material.uniforms.uColor.value.set(hex);
    const t = { m, t: 0, dur, x, z, r }; this.list.push(t); return t;
  },
  line(x, z, ang, len, width, dur, hex = 0xff2a1a) {
    const m = this._make(1, this.lineGeo); m.position.set(x, 0.05, z); m.scale.set(len, width, 1);
    m.rotation.set(-Math.PI / 2, 0, -ang + Math.PI / 2, 'YXZ');
    m.rotation.order = 'XYZ'; m.rotation.set(-Math.PI / 2, 0, Math.atan2(-Math.cos(ang), Math.sin(ang)));
    m.material.uniforms.uColor.value.set(hex);
    const t = { m, t: 0, dur, x, z, ang, len }; this.list.push(t); return t;
  },
  cone(x, z, ang, r, halfArc, dur, hex = 0xff2a1a) {
    const m = this._make(2, Geo.plane(2, 2)); m.position.set(x, 0.05, z); m.scale.set(r, r, 1);
    m.rotation.set(-Math.PI / 2, 0, Math.atan2(-Math.cos(ang), Math.sin(ang)));
    m.material.uniforms.uHalfArc.value = halfArc;
    m.material.uniforms.uColor.value.set(hex);
    const t = { m, t: 0, dur, x, z }; this.list.push(t); return t;
  },
  update(dt) {
    for (const t of this.list) {
      t.t += dt;
      const u = t.m.material.uniforms;
      u.uProgress.value = clamp(t.t / t.dur, 0, 1); u.uTime.value += dt;
      u.uAlpha.value = t.t > t.dur ? Math.max(0, 1 - (t.t - t.dur) * 6) : Math.min(1, t.t * 8);
      if (t.follow) { t.m.position.x = t.follow.x; t.m.position.z = t.follow.z; }
    }
    if (!this.list.some((t) => t.t > t.dur + 0.18 || t.kill)) return;
    for (const t of this.list) if (t.t > t.dur + 0.18 || t.kill) { this.group.remove(t.m); t.m.material.dispose(); }
    compact(this.list, (t) => !(t.t > t.dur + 0.18 || t.kill));
  },
  clear() { for (const t of this.list) { this.group.remove(t.m); t.m.material.dispose(); } this.list = []; },
};

// =====================================================================
//  INPUT: keyboard + mouse, gamepad, touch. Every kind drives the same actions: a gamepad and the on-screen
//  controls press the same keys (Game.onKey) and add analog move / aim / look / fire on top
// =====================================================================
const Input = {
  keys: {}, pressed: {}, released: {}, vkeys: {},
  mouse: { x: 0, y: 0, nx: 0, ny: 0, down: [false, false, false], pressed: [false, false, false], released: [false, false, false], seen: false },
  wheel: 0, dx: 0, dy: 0, locked: false,
  // the kind of input in use: 'kb' keyboard + mouse, 'pad' gamepad, 'touch'. Prompts, hints and the on-screen
  // controls follow it, and it changes the moment another kind is used
  mode: TOUCH_DEV ? 'touch' : 'kb',
  move: { x: 0, y: 0 },                      // analog move, screen space (x right, y up), length up to 1
  aim: { x: 0, y: 0, mag: 0, on: false },    // analog aim, screen space, while a stick is pushed
  look: { x: 0, y: 0 },                      // first person turn this frame, radians (right, down)
  fire: false, fireOnce: false, dodge: false, cycle: 0, raise: false, autoAim: false, touchT: -1e9,
  gameKeys: new Set(['Space', 'Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyE', 'KeyF', 'KeyQ', 'KeyR']),
  init(canvas) {
    window.addEventListener('keydown', (e) => {
      if (this.gameKeys.has(e.code) && G.state !== 'boot') e.preventDefault();
      if (G.arcade) return; // (the arcade machine has the keyboard while you play it: Arcade)
      this.setMode('kb');
      if (!e.repeat) { this.pressed[e.code] = true; Game.onKey(e.code); }
      this.keys[e.code] = true;
    });
    window.addEventListener('keyup', (e) => { this.keys[e.code] = false; this.released[e.code] = true; });
    // (a tap sends mouse events of its own a moment later: those are not the mouse)
    const mouse = () => performance.now() - this.touchT > 900;
    window.addEventListener('mousemove', (e) => {
      if (!mouse()) return;
      this.mouse.x = e.clientX; this.mouse.y = e.clientY; this.mouse.seen = true;
      this.mouse.nx = (e.clientX / Render.w) * 2 - 1; this.mouse.ny = -(e.clientY / Render.h) * 2 + 1;
      this.dx += e.movementX || 0; this.dy += e.movementY || 0;
      if (!FORCE_TOUCH && Math.abs(e.movementX || 0) + Math.abs(e.movementY || 0) > 3) this.setMode('kb');
    });
    canvas.addEventListener('mousedown', (e) => {
      if (e.button > 2 || !mouse()) return;
      if (!FORCE_TOUCH) this.setMode('kb');
      this.mouse.down[e.button] = true; this.mouse.pressed[e.button] = true;
      Game.onMouseDown(e.button);
      canvas.focus();
    });
    window.addEventListener('mouseup', (e) => { if (e.button > 2) return; this.mouse.down[e.button] = false; this.mouse.released[e.button] = true; });
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    canvas.addEventListener('wheel', (e) => { this.wheel += Math.sign(e.deltaY); e.preventDefault(); }, { passive: false });
    const away = () => { this.keys = {}; this.vkeys = {}; this.mouse.down = [false, false, false]; Touch.releaseAll(); Game.onBlur(); };
    window.addEventListener('blur', away);
    // (a phone switching apps doesn't always blur the window)
    document.addEventListener('visibilitychange', () => { if (document.hidden) away(); });
    document.addEventListener('pointerlockchange', () => { this.locked = document.pointerLockElement === canvas; });
    // the first touch anywhere brings the on-screen controls
    const touched = () => { this.touchT = performance.now(); this.setMode('touch'); };
    window.addEventListener('touchstart', touched, { passive: true, capture: true });
    window.addEventListener('pointerdown', (e) => { if (e.pointerType === 'touch' || e.pointerType === 'pen') touched(); }, true);
    // (sound may only start after a click, a key or a tap: a gamepad press doesn't count)
    const wake = () => { if (Sfx.ctx && Sfx.ctx.state === 'suspended') { try { Sfx.ctx.resume(); } catch (e) { /* not yet */ } } };
    window.addEventListener('pointerdown', wake, true); window.addEventListener('keydown', wake, true); window.addEventListener('touchend', wake, true);
    this.canvas = canvas;
  },
  setMode(m) {
    if (this.mode === m) return;
    this.mode = m;
    if (m !== 'kb') this.unlock();
    Touch.releaseAll();
    if (UI.el && UI.el.root) UI.onInputMode(m);
  },
  // a press from a gamepad button or an on-screen button: the same path as the key
  press(code) { this.pressed[code] = true; Game.onKey(code); },
  lock() {
    if (this.locked || this.mode !== 'kb') return;
    try { const p = this.canvas.requestPointerLock(); if (p && p.catch) p.catch(() => { }); } catch (e) { /* not allowed here */ }
  },
  unlock() { try { if (document.pointerLockElement) document.exitPointerLock(); } catch (e) { /* ignore */ } },
  down(code) { return !!(this.keys[code] || this.vkeys[code]); },
  hit(code) { return !!this.pressed[code]; },
  // once a frame before anything reads input: the gamepad and the touch sticks, merged
  update(dt) {
    Pad.poll(dt);
    Touch.poll(dt);
    let mx = Pad.move.x + Touch.move.x, my = Pad.move.y + Touch.move.y;
    const ml = Math.hypot(mx, my); if (ml > 1) { mx /= ml; my /= ml; }
    this.move.x = mx; this.move.y = my;
    const a = Touch.aim.on ? Touch.aim : Pad.aim;
    this.aim.x = a.x; this.aim.y = a.y; this.aim.mag = a.mag; this.aim.on = a.on;
    this.fire = Pad.fire || Touch.fire;
    this.raise = Pad.raise || Touch.raise;
    this.vkeys.Tab = Pad.back || Touch.album;
  },
  endFrame() {
    this.pressed = {}; this.released = {}; this.wheel = 0; this.dx = 0; this.dy = 0;
    this.mouse.pressed = [false, false, false]; this.mouse.released = [false, false, false];
    this.look.x = 0; this.look.y = 0; this.fireOnce = false; this.dodge = false; this.cycle = 0; this.autoAim = false;
  },
};

// Gamepad (the browser's standard mapping: Xbox, PlayStation and Switch Pro layouts alike). Read once a frame
const Pad = {
  A: 0, B: 1, X: 2, Y: 3, LB: 4, RB: 5, LT: 6, RT: 7, BACK: 8, START: 9, UP: 12, DOWN: 13, LEFT: 14, RIGHT: 15,
  prev: [], rep: { dir: null, t: 0 }, connected: false,
  move: { x: 0, y: 0 }, aim: { x: 0, y: 0, mag: 0, on: false }, fire: false, raise: false, back: false,
  get() {
    if (typeof navigator === 'undefined' || !navigator.getGamepads) return null;
    let list = null;
    try { list = navigator.getGamepads(); } catch (e) { return null; }
    if (list) for (const g of list) if (g && g.connected !== false && g.buttons && g.buttons.length >= 10 && g.axes && g.axes.length >= 2) return g;
    return null;
  },
  // radial dead zone, rescaled so a full push still reads 1
  stick(x, y, dz = 0.2) { const m = Math.hypot(x, y); if (m < dz) return [0, 0, 0]; const k = Math.min(1, (m - dz) / (1 - dz)); return [x / m * k, y / m * k, k]; },
  poll(dt) {
    const g = this.get();
    this.move.x = this.move.y = 0; this.aim.on = false; this.aim.mag = 0; this.fire = false; this.raise = false; this.back = false;
    this.connected = !!g;
    if (!g) { this.prev.length = 0; this.rep.dir = null; return; }
    const now = [];
    for (let i = 0; i < g.buttons.length; i++) { const b = g.buttons[i], v = typeof b === 'number' ? b : (b ? b.value || 0 : 0); now[i] = !!(b && b.pressed) || v > 0.5; }
    const [lx, ly, lm] = this.stick(g.axes[0] || 0, g.axes[1] || 0);
    const [rx, ry, rm] = this.stick(g.axes[2] || 0, g.axes[3] || 0);
    const prev = this.prev, hit = (i) => !!now[i] && !prev[i];
    let any = false; for (let i = 0; i < now.length; i++) if (hit(i)) any = true;
    this.prev = now;
    // (the arcade machine reads the pad itself while you play it; the buttons are still followed here, so the press
    // that leaves it doesn't reach the house)
    if (G.arcade) { this.rep.dir = null; return; }
    if (any || lm > 0.4 || rm > 0.4) Input.setMode('pad');
    if (Input.mode !== 'pad') { this.rep.dir = null; return; }
    // the start screen
    if (G.state === 'boot') { if (hit(this.A) || hit(this.START)) { const b = UI.el.loading && UI.el.loading.querySelector('.go'); if (b) b.click(); } return; }
    // menus (the title, the pause menu, options, the cards, the end): the stick or the d-pad steps, A picks, B goes back
    if (G.state === 'title' || UI.panelOpen) {
      let dir = null;
      if (now[this.UP] || ly < -0.55) dir = 'ArrowUp'; else if (now[this.DOWN] || ly > 0.55) dir = 'ArrowDown';
      else if (now[this.LEFT] || lx < -0.55) dir = 'ArrowLeft'; else if (now[this.RIGHT] || lx > 0.55) dir = 'ArrowRight';
      if (dir !== this.rep.dir) { this.rep.dir = dir; this.rep.t = 0.4; if (dir) Input.press(dir); }
      else if (dir && (this.rep.t -= dt) <= 0) { this.rep.t = 0.11; Input.press(dir); }
      if (hit(this.A)) Input.press('Enter');
      if (hit(this.B)) Input.press('Escape');
      if (hit(this.START)) Input.press(UI.panelOpen ? 'Escape' : 'Enter');
      return;
    }
    this.rep.dir = null;
    if (G.state !== 'play') return;
    this.move.x = lx; this.move.y = -ly;
    if (Photos.mode === 'hold') {
      // first person: the right stick looks around (a curve: fine control near the middle), a trigger or A holds the
      // photo up, Y or B puts it away
      const k = 2.3 * SETTINGS.sens * dt, cx = Math.sign(rx) * Math.abs(rx) ** 1.6, cy = Math.sign(ry) * Math.abs(ry) ** 1.6;
      Input.look.x += cx * k; Input.look.y += cy * k * 0.75;
      this.raise = now[this.LT] || now[this.RT] || now[this.A];
      if (hit(this.Y) || hit(this.B)) Input.press('KeyF');
      if (hit(this.START)) Game.pause();
      return;
    }
    // twin stick: the left stick walks, the right stick aims, RT attacks
    if (rm > 0.22) { this.aim.x = rx / Math.hypot(rx, ry); this.aim.y = -ry / Math.hypot(rx, ry); this.aim.mag = rm; this.aim.on = true; }
    this.fire = now[this.RT];
    if (hit(this.B) || hit(this.LT)) Input.dodge = true;
    if (hit(this.A)) Input.press('KeyE');
    if (hit(this.X)) Input.press('KeyR');
    if (hit(this.Y)) Input.press('KeyF');
    if (hit(this.LB)) Input.cycle = -1;
    if (hit(this.RB)) Input.cycle = 1;
    if (hit(this.LEFT)) Input.press('Digit1');
    if (hit(this.UP)) Input.press('Digit2');
    if (hit(this.RIGHT)) Input.press('Digit3');
    if (hit(this.DOWN)) Input.press('Digit4');
    if (hit(this.START)) Input.press('Escape');
    this.back = now[this.BACK];
    if (hit(this.BACK)) Input.press('Tab');
  },
  // a short rumble where the browser offers one
  rumble(strong, weak, ms) {
    if (Input.mode !== 'pad') return;
    const g = this.get(), a = g && g.vibrationActuator;
    if (!a || !a.playEffect) return;
    try { const p = a.playEffect('dual-rumble', { startDelay: 0, duration: ms, strongMagnitude: clamp(strong, 0, 1), weakMagnitude: clamp(weak, 0, 1) }); if (p && p.catch) p.catch(() => { }); } catch (e) { /* not supported */ }
  },
};

// Touch controls (phones and tablets, landscape). The left thumb is a stick wherever it lands; the right thumb aims and
// attacks (a pumpkin bomb flies when you let go, a quick tap strikes at the nearest haunt). Buttons for the rest; the
// weapon slots, the polaroid and the prompt on the HUD are tapped directly. In first person the right thumb looks
// around. Menus are tapped as they are
const Touch = {
  el: null, stk: null, btn: null, sticks: { l: null, r: null }, ctx: '',
  move: { x: 0, y: 0 }, aim: { x: 0, y: 0, mag: 0, on: false }, fire: false, raise: false, album: false,
  last: null, throwNext: false, tapNext: false,
  R() { return clamp(Math.min(innerWidth, innerHeight) * 0.15, 44, 76); },
  ok(e) { return Input.mode === 'touch' && (e.pointerType !== 'mouse' || FORCE_TOUCH); },
  init(root, hud) {
    const d = this.el = document.createElement('div');
    d.id = 'hy-tc'; d.className = 'hidden';
    d.innerHTML = `
      <div class="stk l"><div class="nub"></div></div>
      <div class="stk r"><div class="nub"></div></div>
      <button type="button" class="tb pause" data-a="pause" aria-label="Pause"><i></i><i></i></button>
      <button type="button" class="tb dodge iso" data-a="dodge">ROLL</button>
      <button type="button" class="tb reload iso" data-a="reload" aria-label="Reload">${ICONS.reload}</button>
      <button type="button" class="tb act iso" data-a="act">USE</button>
      <button type="button" class="tb raise fp" data-a="raise">HOLD<br>UP</button>
      <button type="button" class="tb away fp" data-a="away">PUT<br>AWAY</button>`;
    root.appendChild(d);
    this.stk = { l: d.querySelector('.stk.l'), r: d.querySelector('.stk.r') };
    this.btn = {};
    d.querySelectorAll('.tb').forEach((b) => { this.btn[b.dataset.a] = b; });
    // the play area: a thumb that lands starts a stick on its half of the screen
    d.addEventListener('pointerdown', (e) => this.down(e));
    d.addEventListener('pointermove', (e) => this.slide(e));
    d.addEventListener('pointerup', (e) => this.up(e, false));
    d.addEventListener('pointercancel', (e) => this.up(e, true));
    d.addEventListener('contextmenu', (e) => e.preventDefault());
    const tap = (el, fn, upFn) => {
      el.addEventListener('pointerdown', (e) => {
        if (!this.ok(e)) return;
        e.preventDefault(); e.stopPropagation();
        el.classList.add('dn');
        try { el.setPointerCapture(e.pointerId); } catch (x) { /* ignore */ }
        fn(e);
      });
      const up = () => { if (!el.classList.contains('dn')) return; el.classList.remove('dn'); if (upFn) upFn(); };
      el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
      el.addEventListener('contextmenu', (e) => e.preventDefault());
    };
    tap(this.btn.pause, () => { if (G.state === 'play' && !G.paused && !UI.panelOpen) Game.pause(); });
    tap(this.btn.dodge, () => { Input.dodge = true; });
    tap(this.btn.reload, () => Input.press('KeyR'));
    tap(this.btn.act, () => Input.press('KeyE'));
    tap(this.btn.raise, () => { this.raise = true; }, () => { this.raise = false; });
    tap(this.btn.away, () => Input.press('KeyF'));
    // on the HUD: a weapon slot picks it, the prompt does it, the polaroid is looked at (a long press: the album)
    hud.slots.forEach((s, i) => tap(s.el, () => Input.press('Digit' + (i + 1))));
    tap(hud.prompt, () => Input.press('KeyE'));
    let lp = null;
    tap(hud.photo, () => { clearTimeout(lp); this.album = false; lp = setTimeout(() => { this.album = true; Input.press('Tab'); }, 380); },
      () => { clearTimeout(lp); if (this.album) this.album = false; else Input.press('KeyF'); });
  },
  side(id) { return this.sticks.l && this.sticks.l.id === id ? 'l' : this.sticks.r && this.sticks.r.id === id ? 'r' : null; },
  down(e) {
    if (!this.ok(e)) { if (e.pointerType === 'mouse') Input.setMode('kb'); return; }
    e.preventDefault();
    const side = e.clientX < innerWidth * 0.42 ? 'l' : 'r';
    if (this.sticks[side] || (this.ctx !== 'iso' && this.ctx !== 'fp')) return;
    try { this.el.setPointerCapture(e.pointerId); } catch (x) { /* ignore */ }
    this.sticks[side] = { id: e.pointerId, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, t0: performance.now(), far: 0, armed: false };
    this.draw(side);
  },
  slide(e) {
    const side = this.side(e.pointerId); if (!side) return;
    e.preventDefault();
    const s = this.sticks[side], R = this.R();
    // first person: the right thumb turns the view by how far it slid
    if (side === 'r' && this.ctx === 'fp') { const k = 0.0042 * SETTINGS.sens; Input.look.x += (e.clientX - s.x) * k; Input.look.y += (e.clientY - s.y) * k; }
    s.x = e.clientX; s.y = e.clientY;
    const dx = s.x - s.x0, dy = s.y - s.y0, l = Math.hypot(dx, dy);
    s.far = Math.max(s.far, l);
    // (the left stick's base follows a thumb that slides past its rim)
    if (side === 'l' && l > R) { s.x0 = s.x - dx / l * R; s.y0 = s.y - dy / l * R; }
    this.draw(side);
  },
  up(e, cancel) {
    const side = this.side(e.pointerId); if (!side) return;
    const s = this.sticks[side];
    this.sticks[side] = null;
    if (!cancel && side === 'r' && this.ctx === 'iso') {
      if (performance.now() - s.t0 < 260 && s.far < 14) this.tapNext = true;   // a quick tap: one strike at the nearest haunt
      else if (s.armed && Player.weapon === 'bomb') this.throwNext = true;      // let go: the bomb flies
    }
    this.draw(side);
  },
  releaseAll() { this.sticks.l = this.sticks.r = null; this.raise = false; this.album = false; this.throwNext = this.tapNext = false; if (this.stk) { this.draw('l'); this.draw('r'); } },
  draw(side) {
    const s = this.sticks[side], el = this.stk[side], R = this.R();
    el.style.setProperty('--r', R + 'px');
    if (!s) { el.classList.remove('on'); el.style.left = ''; el.style.top = ''; el.firstElementChild.style.transform = ''; return; }
    el.classList.add('on');
    el.style.left = s.x0 + 'px'; el.style.top = s.y0 + 'px';
    let dx = s.x - s.x0, dy = s.y - s.y0; const l = Math.hypot(dx, dy); if (l > R) { dx *= R / l; dy *= R / l; }
    el.firstElementChild.style.transform = `translate(${dx}px,${dy}px)`;
  },
  // once a frame: which controls the moment needs (iso: playing, fp: holding the photo, cine: a scene plays out),
  // and the sticks turned into move / aim / fire
  poll() {
    if (!this.el) return;
    const play = Input.mode === 'touch' && G.state === 'play' && !G.paused && !UI.panelOpen && !G.arcade;
    const ctx = !play ? '' : Photos.mode === 'hold' ? 'fp' : (Player.control && Player.alive && Photos.mode === 'off') ? 'iso' : 'cine';
    if (ctx !== this.ctx) { this.ctx = ctx; this.releaseAll(); this.el.className = ctx || 'hidden'; }
    this.move.x = this.move.y = 0; this.fire = false;
    const a = this.aim; a.on = false;
    if (!ctx) return;
    const R = this.R(), L = this.sticks.l, Rt = this.sticks.r;
    if (L) {
      let vx = (L.x - L.x0) / R, vy = (L.y - L.y0) / R; const m = Math.hypot(vx, vy);
      if (m > 1) { vx /= m; vy /= m; }
      if (m > 0.12) { this.move.x = vx; this.move.y = -vy; }
    }
    if (ctx !== 'iso') return;
    if (Rt) {
      const vx = (Rt.x - Rt.x0) / R, vy = (Rt.y - Rt.y0) / R, l = Math.hypot(vx, vy), m = Math.min(1, l);
      Rt.armed = m > 0.45;
      if (m > 0.2) { a.x = vx / l; a.y = -vy / l; a.mag = m; a.on = true; this.last = { x: a.x, y: a.y, mag: m }; this.fire = Rt.armed && Player.weapon !== 'bomb'; }
    }
    if (this.throwNext && this.last) { a.x = this.last.x; a.y = this.last.y; a.mag = this.last.mag; a.on = true; Input.fireOnce = true; }
    if (this.tapNext) { Input.autoAim = true; Input.fireOnce = true; }
    this.throwNext = this.tapNext = false;
    // (the reload button only with a gun in hand, the use button only next to something to use)
    const wk = Player.weapon, gun = (wk === 'nailgun' || wk === 'shotgun') && Player.weapons[wk].owned;
    if (this.btn.reload._on !== gun) { this.btn.reload._on = gun; this.btn.reload.classList.toggle('off', !gun); }
    const act = !!UI._prompt;
    if (this.btn.act._on !== act) { this.btn.act._on = act; this.btn.act.classList.toggle('off', !act); }
  },
};

// =====================================================================
//  PLAYER + WEAPONS
// =====================================================================
const BASE_STATS = { maxHp: 100, speed: 5.1, meleeDmg: 34, meleeArc: 1.1, meleeRange: 2.25, reloadMul: 1, nailRate: 9, nailDmg: 13, pellets: 8, pelletDmg: 11, spread: 0.34, bombRadius: 3.4, bombDmg: 150, bombMax: 4, dodgeCd: 0.75, healMul: 1, ammoMul: 1, lifesteal: 0, beam: 0 };
// mag: what one load holds (a strip of 30 nails; the shotgun is a double-barrel, two shells). max: the most rounds
// you can carry, loaded and spare together (what the HUD counts), before Deep Pockets
const WEAPONS = {
  poker: { name: 'Fire Poker', rate: 0.4 },
  nailgun: { name: 'Nail Gun', mag: 30, reload: 1.1, max: 180 },
  shotgun: { name: 'Shotgun', mag: 2, reload: 1.65, max: 32, rate: 0.28 },
  bomb: { name: 'Pumpkin Bomb', rate: 0.65 },
};
const WEAPON_ORDER = ['poker', 'nailgun', 'shotgun', 'bomb'];

const Player = {
  pos: new THREE.Vector3(7, 0, 18), vel: new THREE.Vector3(), yaw: Math.PI, aim: new THREE.Vector3(), aimDir: new THREE.Vector3(0, 0, 1), aimDist: 4, room: 'hall',
  hp: 100, alive: true, inv: 0, control: false, visible: true,
  stats: Object.assign({}, BASE_STATS), upgrades: [],
  weapons: null, weapon: 'poker', cooldown: 0, reloadT: 0, reloadDur: 1,
  swingT: 0, swingHit: false, dodgeT: 0, dodgeCd: 0, dodgeDir: new THREE.Vector3(),
  hasFlashlight: false, rig: null, stepT: 0, animT: 0, bindT: 0, grabbed: null, hurtFlash: 0, recoil: 0,
  moveAmt: 0, _ray: new THREE.Raycaster(), _plane: new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.9),

  init() {
    this.rig = buildPlayerModel();
    Render.scene.add(this.rig.root);
    for (const k of ['poker', 'nailgun', 'shotgun', 'bomb']) {
      const w = buildWeaponModel(k); w.visible = false; this.rig.weaponSlot.add(w); this.rig.weapons[k] = w;
      if (this.rig.glb) { w.traverse((o) => { if (o.isMesh) o.castShadow = true; }); if (k === 'bomb' && w.children[0]) w.children[0].position.z = 0; }
    }
    const s = this.spot = new THREE.SpotLight(0xfff0d0, 0, 22, 0.5, 0.55, 1.5);
    s.castShadow = true; s.shadow.camera.near = 0.2; s.shadow.camera.far = 22;
    s.shadow.bias = -0.0004; s.shadow.normalBias = 0.025; s.shadow.radius = 3;
    this.applyShadowQuality();
    Render.scene.add(s); Render.scene.add(s.target);
    this.reset();
  },

  applyShadowQuality() {
    const s = this.spot; if (!s) return;
    const q = Render.quality();
    // (1024 texels over the beam are already finer than a screen pixel from the isometric camera: 2048 cost 4x the fill)
    const n = /[?&]lowres/.test(QS) ? 512 : q >= 1 ? 1024 : 512;
    if (s.shadow.mapSize.x !== n) { s.shadow.mapSize.set(n, n); if (s.shadow.map) { s.shadow.map.dispose(); s.shadow.map = null; } }
  },

  reset() {
    this.stats = Object.assign({}, BASE_STATS);
    this.upgrades = [];
    this.weapons = {
      poker: { owned: false, mag: 0, ammo: 0 },
      nailgun: { owned: false, mag: 0, ammo: 0 },
      shotgun: { owned: false, mag: 0, ammo: 0 },
      bomb: { owned: false, mag: 0, ammo: 0 },
    };
    this.weapon = 'poker'; this.hp = this.stats.maxHp; this.alive = true; this.inv = 0;
    this.hasFlashlight = false; this.cooldown = 0; this.reloadT = 0; this.bindT = 0; this.grabbed = null;
    this.vel.set(0, 0, 0);
    this.updateWeaponModel();
  },

  snapshot() {
    return { hp: this.hp, stats: Object.assign({}, this.stats), upgrades: this.upgrades.slice(), weapons: JSON.parse(JSON.stringify(this.weapons)), weapon: this.weapon, hasFlashlight: this.hasFlashlight };
  },
  restore(s) {
    this.stats = Object.assign({}, BASE_STATS, s.stats); this.upgrades = s.upgrades.slice();
    this.weapons = JSON.parse(JSON.stringify(s.weapons)); this.weapon = s.weapon || 'poker';
    this.hasFlashlight = s.hasFlashlight; this.hp = Math.max(s.hp, this.stats.maxHp * 0.6); this.alive = true; this.inv = 1;
    this.bindT = 0; this.grabbed = null; this.reloadT = 0; this.cooldown = 0;
    // (a retry starts with the guns loaded from their spare rounds)
    for (const k of ['nailgun', 'shotgun']) {
      const w = this.weapons[k]; if (!w || !w.owned) continue;
      const t = Math.min(WEAPONS[k].mag - w.mag, w.ammo);
      if (t > 0) { w.mag += t; w.ammo -= t; }
    }
    this.updateWeaponModel();
  },

  // every round of a weapon you carry: loaded and spare (bombs are never "loaded")
  rounds(k) { const w = this.weapons[k]; return w && k !== 'poker' ? w.mag + w.ammo : 0; },
  maxAmmo(k) { return Math.round((k === 'bomb' ? this.stats.bombMax : WEAPONS[k].max) * (k === 'bomb' ? 1 : this.stats.ammoMul)); },
  canTakeAmmo(k) { const w = this.weapons[k]; return !!w && w.owned && this.rounds(k) < this.maxAmmo(k); },
  // (into the spare rounds, up to the cap on loaded and spare together)
  addAmmo(k, n) {
    const w = this.weapons[k]; if (!w) return 0;
    const before = w.ammo;
    w.ammo = Math.max(before, Math.min(this.maxAmmo(k) - w.mag, w.ammo + n));
    return w.ammo - before;
  },

  give(k) {
    const w = this.weapons[k];
    const first = !w.owned;
    w.owned = true;
    if (k === 'nailgun') { if (first) { w.mag = 30; w.ammo = 60; } else this.addAmmo(k, 30); }
    if (k === 'shotgun') { if (first) { w.mag = 2; w.ammo = 10; } else this.addAmmo(k, 6); }
    if (k === 'bomb') { this.addAmmo('bomb', 3); }
    if (first && k !== 'poker') this.switchTo(k);
    UI.setWeapons(this);
  },

  switchTo(k) {
    if (!this.weapons[k] || !this.weapons[k].owned || this.weapon === k) return;
    this.weapon = k; this.reloadT = 0; this.cooldown = Math.max(this.cooldown, 0.15); this.swingT = 0;
    this.updateWeaponModel();
    UI.weaponName(WEAPONS[k].name);
    // (taken out empty, it starts reloading at once: that plays its own sound)
    if (!this.autoReload()) Sfx.play('reload');
  },
  // the gun in hand is empty but there are spare rounds: reload without waiting for a click or R. True if it started
  autoReload() {
    const k = this.weapon, w = this.weapons[k];
    if (!WEAPONS[k].mag || !w.owned || w.mag > 0 || w.ammo <= 0 || this.reloadT > 0) return false;
    this.startReload();
    return this.reloadT > 0;
  },
  cycle(dir) {
    const owned = WEAPON_ORDER.filter((k) => this.weapons[k].owned);
    if (owned.length < 2) return;
    const i = owned.indexOf(this.weapon);
    this.switchTo(owned[(i + dir + owned.length) % owned.length]);
  },
  updateWeaponModel() {
    if (!this.rig) return;
    for (const k in this.rig.weapons) this.rig.weapons[k].visible = this.weapons && this.weapons[k].owned && this.weapon === k;
    this.rig.flashlight.visible = this.hasFlashlight;
  },

  // mouse -> aim point on a plane at chest height. A gamepad or the touch stick aims by direction instead (how far it
  // is pushed: how far a pumpkin bomb flies), with a little help toward the haunt nearest the line; not aiming, you
  // face the way you walk
  updateAim() {
    if (Input.mode !== 'kb') {
      const A = Input.aim, mv = Input.move;
      let dx = 0, dz = 0, d = this.aimDist || 4, snap = false;
      if (A.on) {
        dx = Cam.rightVec.x * A.x + Cam.fwdVec.x * A.y; dz = Cam.rightVec.z * A.x + Cam.fwdVec.z * A.y;
        d = 2.5 + 6.5 * clamp(A.mag, 0, 1);
      } else if (Input.autoAim) { dx = Math.sin(this.yaw); dz = Math.cos(this.yaw); d = 4; snap = true; }
      else if (Math.hypot(mv.x, mv.y) > 0.25 && this.dodgeT <= 0) { dx = Cam.rightVec.x * mv.x + Cam.fwdVec.x * mv.y; dz = Cam.rightVec.z * mv.x + Cam.fwdVec.z * mv.y; }
      const l = Math.hypot(dx, dz);
      if (l > 1e-3) {
        dx /= l; dz /= l;
        // (a quick tap strikes at the nearest haunt ahead, a pushed stick leans a little toward the one on its line)
        const t = (A.on || snap) ? this.assistAim(dx, dz, snap ? 1.6 : 0.2, snap ? 8 : 13) : null;
        if (t) { dx = t[0]; dz = t[1]; d = clamp(t[2], 2, 10); }
        this.aimDir.set(dx, 0, dz); this.aimDist = d;
        if (snap) this.yaw = Math.atan2(dx, dz);
      } else this.aimDir.set(Math.sin(this.yaw), 0, Math.cos(this.yaw));   // (still: keep facing as you are)
      this.aim.set(this.pos.x + this.aimDir.x * this.aimDist, 0.9, this.pos.z + this.aimDir.z * this.aimDist);
      return;
    }
    if (!Input.mouse.seen) { this.aim.set(this.pos.x + Math.sin(this.yaw) * 4, 0.9, this.pos.z + Math.cos(this.yaw) * 4); return; }
    this._ray.setFromCamera({ x: Input.mouse.nx, y: Input.mouse.ny }, Render.camera);
    const hit = this._ray.ray.intersectPlane(this._plane, _v2);
    if (hit) this.aim.copy(hit);
  },

  // the haunt (critter or boss) best lined up with a direction: [dx, dz, distance] toward it, or null. maxAng: how far
  // off the line it may be (radians, plus its size), maxDist: how far away; it must be in plain sight
  assistAim(dx, dz, maxAng, maxDist) {
    const ya = Math.atan2(dx, dz);
    let best = null, bs = Infinity;
    const test = (x, z, r) => {
      const ex = x - this.pos.x, ez = z - this.pos.z, d = Math.hypot(ex, ez);
      if (d < 0.3 || d > maxDist) return;
      const tol = maxAng + Math.atan2(r, d), da = Math.abs(angDiff(ya, Math.atan2(ex, ez)));
      if (da > tol) return;
      const sc = da / tol + d / maxDist * 0.35;
      if (sc < bs && W.los(this.pos.x, this.pos.z, x, z)) { bs = sc; best = [ex / d, ez / d, d]; }
    };
    for (const e of G.enemies) if (e.targetable()) test(e.pos.x, e.pos.z, (e.def && e.def.r) || 0.4);
    for (const b of G.bosses) if (b.targetable()) test(b.pos.x, b.pos.z, b.r || 1);
    return best;
  },

  inBeam(x, z, maxD = 10) {
    if (!this.hasFlashlight) return false;
    const dx = x - this.pos.x, dz = z - this.pos.z, d = Math.hypot(dx, dz);
    if (d > maxD) return false;
    if (d < 0.8) return true;
    const half = this.spot.angle * 0.95;
    return Math.abs(angDiff(this.yaw, Math.atan2(dx, dz))) < half;
  },

  update(dt) {
    const rig = this.rig;
    this.inv = Math.max(0, this.inv - dt);
    this.cooldown = Math.max(0, this.cooldown - dt);
    this.dodgeCd = Math.max(0, this.dodgeCd - dt);
    this.hurtFlash = Math.max(0, this.hurtFlash - dt * 3);
    this.recoil = Math.max(0, this.recoil - dt * 6);
    this.room = W.roomAt(this.pos.x, this.pos.z) || this.room;
    const fpMode = Cam.mode !== 'iso' || Cam.trans;
    rig.root.visible = this.visible && !(Cam.mode === 'fp' && !Cam.trans) && Cam.isoWeight > 0.25;

    if (this.grabbed) {
      // pulled by a tongue / chain
      const gtar = this.grabbed;
      this.vel.set(0, 0, 0);
      this.safeMove(damp(this.pos.x, gtar.x, 9, dt) - this.pos.x, damp(this.pos.z, gtar.z, 9, dt) - this.pos.z);
    } else if (this.control && this.alive && !fpMode) {
      this.updateAim();
      // aim / facing
      const ax = this.aim.x - this.pos.x, az = this.aim.z - this.pos.z;
      if (ax * ax + az * az > 0.04 && this.dodgeT <= 0) this.yaw = dampAngle(this.yaw, Math.atan2(ax, az), 22, dt);
      // movement
      let mx = 0, mz = 0;
      if (Input.down('KeyW') || Input.down('ArrowUp')) { mx += Cam.fwdVec.x; mz += Cam.fwdVec.z; }
      if (Input.down('KeyS') || Input.down('ArrowDown')) { mx -= Cam.fwdVec.x; mz -= Cam.fwdVec.z; }
      if (Input.down('KeyD') || Input.down('ArrowRight')) { mx += Cam.rightVec.x; mz += Cam.rightVec.z; }
      if (Input.down('KeyA') || Input.down('ArrowLeft')) { mx -= Cam.rightVec.x; mz -= Cam.rightVec.z; }
      // (a stick: partly pushed walks slower)
      const amx = Input.move.x, amy = Input.move.y;
      if (amx || amy) { mx += Cam.rightVec.x * amx + Cam.fwdVec.x * amy; mz += Cam.rightVec.z * amx + Cam.fwdVec.z * amy; }
      const ml = Math.hypot(mx, mz); if (ml > 1) { mx /= ml; mz /= ml; }
      // dodge
      if ((Input.hit('Space') || Input.hit('ShiftLeft') || Input.hit('ShiftRight') || Input.dodge) && this.dodgeCd <= 0 && this.dodgeT <= 0 && this.bindT <= 0) {
        if (ml > 0) this.dodgeDir.set(mx / ml, 0, mz / ml); else this.dodgeDir.set(Math.sin(this.yaw), 0, Math.cos(this.yaw));
        this.dodgeT = 0.3; this.inv = Math.max(this.inv, 0.34); this.dodgeCd = this.stats.dodgeCd;
        Sfx.play('dodge');
        FX.smoke(this.pos.x, 0.1, this.pos.z, 3, 0x6a6058, 0.35);
      }
      const puddle = Decals.at(this.pos.x, this.pos.z);
      let sp = this.stats.speed * (1 - puddle.slow) * (this.swingT > 0 ? 0.85 : 1);
      if (this.bindT > 0) { sp = 0; this.bindT -= dt; }
      if (puddle.dps > 0) this.hurt(puddle.dps * dt, null, null, 0, true);
      if (this.dodgeT > 0) {
        this.dodgeT -= dt;
        const k = 13.5 * (this.dodgeT > 0.08 ? 1 : 0.5);
        this.vel.set(this.dodgeDir.x * k, 0, this.dodgeDir.z * k);
        if (Math.random() < 0.5) Particles.dust.emit(this.pos.x, 0.1, this.pos.z, 0, 0.3, 0, 0.4, 0.37, 0.33, 0.4, 0.25, 0.4, 0, 1, 0.5);
      } else {
        this.vel.x = damp(this.vel.x, mx * sp, 14, dt);
        this.vel.z = damp(this.vel.z, mz * sp, 14, dt);
      }
      // weapons
      this.updateWeapons(dt);
    } else {
      this.vel.x = damp(this.vel.x, 0, 10, dt); this.vel.z = damp(this.vel.z, 0, 10, dt);
    }
    // integrate + collide (in small steps: hard knockbacks or a slow frame can't tunnel through a wall)
    this.safeMove(this.vel.x * dt, this.vel.z * dt);
    // animation
    const speed = Math.hypot(this.vel.x, this.vel.z);
    if (rig.glb) this.animateGLB(dt, speed);
    else this.animateOld(dt, speed);
    // footsteps
    if (speed > 1 && this.dodgeT <= 0) {
      this.stepT -= dt * speed;
      if (this.stepT <= 0) { this.stepT = 2.3; Sfx.step(ROOMS[this.room] ? ROOMS[this.room].surface : 'wood', undefined, undefined, 0.8); }
    }
    this.updateFlashlight(dt);
  },

  animateOld(dt, speed) {
    const rig = this.rig;
    this.moveAmt = damp(this.moveAmt, clamp(speed / 5, 0, 1), 10, dt);
    this.animT += dt * (4 + speed * 1.6);
    const sw = Math.sin(this.animT) * 0.75 * this.moveAmt;
    rig.root.position.set(this.pos.x, 0, this.pos.z);
    rig.root.rotation.y = this.yaw;
    rig.legL.rotation.x = sw; rig.legR.rotation.x = -sw;
    rig.body.position.y = Math.abs(Math.cos(this.animT)) * 0.05 * this.moveAmt;
    rig.armL.rotation.set(this.hasFlashlight ? -1.25 : sw * 0.6, 0, this.hasFlashlight ? 0.12 : 0);
    // right arm pose by weapon
    if (this.weapon === 'poker' || !this.weapons[this.weapon].owned) {
      if (this.swingT > 0) {
        const k = 1 - this.swingT / 0.32;
        rig.armR.rotation.set(-1.4 + Math.sin(k * Math.PI) * 0.2, lerp(1.2, -1.3, easeOut(k)), 0);
      } else rig.armR.rotation.set(-sw * 0.6 - 0.35, 0.2, 0.15);
    } else if (this.weapon === 'bomb') {
      rig.armR.rotation.set(-0.9 - (this.cooldown > 0.3 ? 1.2 : 0), 0, 0);
    } else {
      rig.armR.rotation.set(-1.45 + this.recoil * 0.5, -0.05, 0);
    }
    if (this.reloadT > 0) rig.armR.rotation.x = -0.6 + Math.sin(G.time * 18) * 0.15;
    rig.torso.rotation.y = this.swingT > 0 ? Math.sin((1 - this.swingT / 0.32) * Math.PI) * -0.4 : 0;
    rig.body.rotation.x = this.dodgeT > 0 ? 0.55 : 0;
    rig.body.scale.y = this.dodgeT > 0 ? 0.82 : 1;
    rig.headG.rotation.y = 0;
    const fl = this.hurtFlash;
    for (const m of rig.mats) { if (!m.emissive) continue; m.emissive.setRGB(fl, fl * 0.1, fl * 0.1); }
  },

  animateGLB(dt, speed) {
    const rig = this.rig, A = rig.anim;
    rig.root.position.set(this.pos.x, 0, this.pos.z);
    rig.root.rotation.y = this.yaw;
    if (!A) return;
    // attack events from updateWeapons
    if (this.animEv) { this._ev = this.animEv; this._evT = { swing: 0.32, nail: 0.11, shotgun: 0.28, throw: 0.5 }[this.animEv] || 0.2; this._evNew = true; this.animEv = null; }
    this._evT = (this._evT || 0) - dt;
    // locomotion relative to facing: forward / backpedal with the hips steered toward the motion
    let dirSign = 1, legYaw = 0;
    if (speed > 0.4) {
      const rel = angDiff(this.yaw, Math.atan2(this.vel.x, this.vel.z));
      if (Math.abs(rel) <= 1.95) legYaw = clamp(rel, -1.15, 1.15);
      else { dirSign = -1; legYaw = clamp(angDiff(this.yaw + Math.PI, Math.atan2(this.vel.x, this.vel.z)), -1.15, 1.15); }
    }
    this._legYaw = dampAngle(this._legYaw || 0, legYaw, 10, dt);
    let base = 'Idle'; const bo = {};
    if (!this.alive) { base = 'Death'; bo.once = true; bo.fade = 0.12; }
    else if (this.dodgeT > 0) { base = 'Dodge'; bo.once = true; bo.fade = 0.05; if (!this._dodging) { bo.restart = true; this._dodging = true; } }
    else if (speed > 2.9) { base = 'Run'; bo.speed = clamp(speed / 5.1, 0.6, 1.5) * dirSign; }
    else if (speed > 0.3) { base = 'Walk'; bo.speed = clamp(speed / 2.0, 0.45, 1.6) * dirSign; }
    if (this.dodgeT <= 0) this._dodging = false;
    // right arm: weapon pose, left arm: flashlight
    let R = null; const ro = {};
    const w = this.weapons && this.weapons[this.weapon];
    const show = this.alive && this.dodgeT <= 0 && this.visible;
    if (show && w && w.owned) {
      const ev = this._evT > 0 ? this._ev : null;
      if (this.weapon === 'poker') { if (ev === 'swing') { R = 'R_Swing'; ro.once = true; ro.fade = 0.04; } else R = 'R_Poker'; }
      else if (this.reloadT > 0) R = this.weapon === 'shotgun' && A.has('R_ReloadShotgun') ? 'R_ReloadShotgun' : 'R_Reload';
      else if (this.weapon === 'nailgun') { if (ev === 'nail') { R = 'R_NailFire'; ro.once = true; ro.fade = 0.03; } else R = 'R_Nail'; }
      else if (this.weapon === 'shotgun') { if (ev === 'shotgun') { R = 'R_ShotgunFire'; ro.once = true; ro.fade = 0.03; } else R = 'R_Shotgun'; }
      else if (this.weapon === 'bomb') { if (ev === 'throw') { R = 'R_Throw'; ro.once = true; ro.fade = 0.05; } else R = 'R_Bomb'; }
      if (this._evNew && ro.once) ro.restart = true;
    }
    this._evNew = false;
    const L = show && this.hasFlashlight ? 'L_Flashlight' : null;
    const mask = (R ? (A.hasChest(R) ? 'Rc' : 'R') : '') + (L ? 'L' : '');
    A.setBase(base, mask, bo);
    A.setOverlay('R', R, ro);
    A.setOverlay('L', L, {});
    A.update(dt);
    // steer the legs toward the movement, keep the upper body on the aim
    const ly = this._legYaw;
    if (Math.abs(ly) > 0.001 && rig.body && this.alive && this.dodgeT <= 0) {
      rig.body.rotateY(ly);
      if (rig.spine) rig.spine.rotateY(-ly * 0.45);
      if (rig.chest) rig.chest.rotateY(-ly * 0.55);
    }
    // hurt flash
    const fl = this.hurtFlash;
    for (const m of rig.mats) {
      if (!m.emissive) continue;
      const b = m.userData.baseEmissive;
      if (b) m.emissive.copy(b); else m.emissive.setRGB(0, 0, 0);
      if (fl > 0) m.emissive.lerp(_c1.setRGB(1, 0.08, 0.06), fl * 0.8);
    }
  },

  updateFlashlight(dt) {
    const s = this.spot;
    if (!this.hasFlashlight) { s.intensity = 0; return; }
    const wide = this.stats.beam ? 0.62 : 0.5;
    s.angle = wide;
    let target = 75;
    if (Cam.mode === 'fp' || (Cam.trans && Cam.mode !== 'iso')) {
      const c = Render.camera;
      c.getWorldDirection(_v3);
      s.position.copy(c.position).addScaledVector(_v3, 0.1); s.position.y -= 0.15;
      s.target.position.copy(c.position).addScaledVector(_v3, 8);
      target = 55;
    } else {
      const fx = Math.sin(this.yaw), fz = Math.cos(this.yaw);
      if (this.rig.glb && this.rig.handL && this.rig.root.visible) {
        this.rig.handL.getWorldPosition(_v3);
        s.position.set(_v3.x + fx * 0.22, Math.max(0.95, _v3.y), _v3.z + fz * 0.22);
      } else s.position.set(this.pos.x + fx * 0.3 - fz * 0.18, 1.25, this.pos.z + fz * 0.3 + fx * 0.18);
      s.target.position.set(this.pos.x + fx * 7, 0.15, this.pos.z + fz * 7);
    }
    if (G.flags.flashFlicker > 0) { G.flags.flashFlicker -= dt; target *= Math.random() < 0.5 ? 0.1 : 1; }
    else if (G.flags.flashDead) target = 0;
    if (G.arcade) target = 0; // (the flashlight is put down while you play the arcade machine)
    s.intensity = damp(s.intensity, target, 12, dt);
    const lm = this.rig.lens.material, lit = s.intensity > 20;
    if (lm.userData.baseEI != null) lm.emissiveIntensity = lm.userData.baseEI * (lit ? 1 : 0.08); else lm.color.setScalar(lit ? 1 : 0.3);
  },

  updateWeapons(dt) {
    const wk = this.weapon, w = this.weapons[wk];
    // switching
    for (let i = 0; i < 4; i++) if (Input.hit('Digit' + (i + 1))) this.switchTo(WEAPON_ORDER[i]);
    if (Input.wheel) this.cycle(Input.wheel > 0 ? 1 : -1);
    if (Input.hit('KeyQ')) this.cycle(1);
    if (Input.cycle) this.cycle(Input.cycle);
    if (this.swingT > 0) {
      this.swingT -= dt;
      if (!this.swingHit && this.swingT < 0.24) { this.swingHit = true; this.meleeHit(); }
    }
    // reload
    if (this.reloadT > 0) {
      this.reloadT -= dt;
      if (this.reloadT <= 0) {
        const def = WEAPONS[wk];
        const need = def.mag - w.mag, take = Math.min(need, w.ammo);
        w.mag += take; w.ammo -= take;
        Sfx.play('reloadDone');
      }
      UI.setWeapons(this);
      return;
    }
    // (empty in hand after a switch, a pickup or a reload cut short: it fills up by itself)
    if (this.autoReload()) { UI.setWeapons(this); return; }
    if (Input.hit('KeyR') && (wk === 'nailgun' || wk === 'shotgun')) this.startReload();
    if (!w.owned) return;
    const firing = Input.mouse.down[0] || Input.fire || Input.fireOnce;
    if (!firing || this.cooldown > 0) return;
    if (G.noAttack) return;
    if (wk === 'poker') {
      this.cooldown = WEAPONS.poker.rate; this.swingT = 0.32; this.swingHit = false; this.animEv = 'swing';
      Sfx.play('pokerSwing');
    } else if (wk === 'nailgun') {
      if (w.mag <= 0) { if (w.ammo > 0) this.startReload(); else { this.cooldown = 0.3; Sfx.play('empty'); UI.toast('Out of nails', 900); } return; }
      w.mag--; this.cooldown = 1 / this.stats.nailRate; this.recoil = 0.6; this.animEv = 'nail';
      this.fireProjectile('nail', this.stats.nailDmg, 32, 0.035);
      Sfx.play('nail', this.pos.x, this.pos.z);
      G.stats.shots++;
      if (w.mag <= 0 && w.ammo > 0) this.startReload();
    } else if (wk === 'shotgun') {
      if (w.mag <= 0) { if (w.ammo > 0) this.startReload(); else { this.cooldown = 0.4; Sfx.play('empty'); UI.toast('Out of shells', 900); } return; }
      w.mag--; this.cooldown = WEAPONS.shotgun.rate; this.recoil = 1.2; this.animEv = 'shotgun';
      const o = this.shotOrigin();
      for (let i = 0; i < this.stats.pellets; i++) this.fireProjectile('pellet', this.stats.pelletDmg, rand(30, 40), this.stats.spread, true, o);
      Sfx.play('shotgun', this.pos.x, this.pos.z);
      Cam.shake(0.35);
      const fx = Math.sin(this.yaw), fz = Math.cos(this.yaw);
      FX.light(o.x + fx * 0.2, o.y + 0.1, o.z + fz * 0.2, 0xffc070, 30, 0.12);
      FX.burst(o.x + fx * 0.15, o.y, o.z + fz * 0.15, 0xffd080, 8, 3, { glow: true, size: 0.15, life: 0.15, grav: 0, drag: 6 });
      this.vel.x -= fx * 3; this.vel.z -= fz * 3;
      G.stats.shots++;
      if (w.mag <= 0 && w.ammo > 0) this.startReload();
    } else if (wk === 'bomb') {
      if (w.ammo <= 0) { this.cooldown = 0.4; Sfx.play('empty'); UI.toast('No pumpkin bombs', 900); return; }
      w.ammo--; this.cooldown = WEAPONS.bomb.rate; this.animEv = 'throw';
      Projectiles.throwBomb(this);
      Sfx.play('throw');
    }
    UI.setWeapons(this);
  },

  startReload() {
    const wk = this.weapon, w = this.weapons[wk];
    if (this.reloadT > 0 || !WEAPONS[wk].mag || w.mag >= WEAPONS[wk].mag || w.ammo <= 0) return;
    this.reloadDur = WEAPONS[wk].reload * this.stats.reloadMul;
    this.reloadT = this.reloadDur;
    Sfx.play('reload');
  },

  // barrel tip of the gun in the right hand, in world space (null without a usable gun model)
  muzzle(out) {
    const rig = this.rig, w = rig.weapons && rig.weapons[this.weapon], tip = MUZZLE_TIP[this.weapon];
    if (!rig.glb || !w || !tip || !w.visible || !rig.root.visible) return null;
    rig.root.updateMatrixWorld(true);
    return w.localToWorld(out.copy(tip));
  },
  // where a shot starts: the barrel tip while the gun points ahead (the old fixed spot in front of the body otherwise)
  shotOrigin() {
    const fx = Math.sin(this.yaw), fz = Math.cos(this.yaw);
    const o = { x: this.pos.x + fx * 0.55 - fz * 0.12, z: this.pos.z + fz * 0.55 + fx * 0.12, y: 0.95 };
    const m = this.muzzle(_v2);
    if (m && (m.x - this.pos.x) * fx + (m.z - this.pos.z) * fz > 0.15) { o.x = m.x; o.z = m.z; o.y = clamp(m.y, 0.6, 1.7); }
    // don't spawn inside a wall
    if (W.rayHit(this.pos.x, this.pos.z, o.x, o.z) < 1) { o.x = this.pos.x; o.z = this.pos.z; }
    return o;
  },

  fireProjectile(kind, dmg, speed, spread, falloff = false, o = this.shotOrigin()) {
    const a = this.yaw + rand(-spread, spread);
    // (it leaves the barrel, then settles to the height the hits are judged at, so it meets the critters it hits)
    Projectiles.spawn({ owner: 'p', kind, x: o.x, z: o.z, y: o.y, yTo: 0.95, vx: Math.sin(a) * speed, vz: Math.cos(a) * speed, r: kind === 'pellet' ? 0.12 : 0.1, dmg, life: kind === 'pellet' ? 0.3 : 1.2, falloff });
  },

  meleeHit() {
    const range = this.stats.meleeRange, arc = this.stats.meleeArc, dmg = this.stats.meleeDmg;
    let hitAny = false;
    const fx = Math.sin(this.yaw), fz = Math.cos(this.yaw);
    for (const e of G.enemies) {
      if (!e.targetable()) continue;
      const dx = e.pos.x - this.pos.x, dz = e.pos.z - this.pos.z, d = Math.hypot(dx, dz);
      if (d > range + e.def.r) continue;
      if (d > 0.6 && Math.abs(angDiff(this.yaw, Math.atan2(dx, dz))) > arc) continue;
      e.hurt(dmg, dx / (d || 1), dz / (d || 1), 8, 'melee');
      hitAny = true;
    }
    for (const b of G.bosses) {
      if (!b.targetable()) continue;
      const dx = b.pos.x - this.pos.x, dz = b.pos.z - this.pos.z, d = Math.hypot(dx, dz);
      if (d > range + b.r) continue;
      if (d > b.r + 0.4 && Math.abs(angDiff(this.yaw, Math.atan2(dx, dz))) > arc) continue;
      b.hurt(dmg, 'melee'); hitAny = true;
    }
    for (const p of G.projectiles) {
      if (p.owner === 'e' && p.shootable && dist(p.x, p.z, this.pos.x, this.pos.z) < range) { p.life = 0; FX.sparks(p.x, p.y, p.z, 0xffe080, 8, 4); hitAny = true; }
    }
    const brk = Breakables.hitArc(this.pos.x, this.pos.z, this.yaw, range, arc);
    if (TVSmash.hitArc(this.pos.x, this.pos.z, this.yaw, range, arc)) hitAny = true;
    if (Shells.hitArc(this.pos.x, this.pos.z, this.yaw, range, arc)) hitAny = true;
    // no creature in the way: the poker meets the room itself (wall, furniture, a box) and sounds like it
    if (!hitAny) {
      let surf = null, sx = 0, sz = 0;
      if (brk) { surf = 'pokerObject'; sx = brk.x; sz = brk.z; }
      else {
        const reach = range * 0.85;
        let bestT = 2, bestC = null;
        for (const da of [0, -arc * 0.45, arc * 0.45]) {
          const a = this.yaw + da;
          const t = W.rayHit(this.pos.x, this.pos.z, this.pos.x + Math.sin(a) * reach, this.pos.z + Math.cos(a) * reach, false);
          if (t < bestT) { bestT = t; bestC = W._lastRayCol; sx = this.pos.x + Math.sin(a) * reach * t; sz = this.pos.z + Math.cos(a) * reach * t; }
        }
        if (bestC) {
          const stone = G.inBasement || bestC.room === 'basement';
          if (bestC.room === 'wall') surf = stone ? 'pokerStone' : 'pokerWall';
          else if (stone && (bestC.h ?? 1) >= 1.4) surf = 'pokerStone';
          else surf = 'pokerWood';
        }
      }
      if (surf) {
        Sfx.play(surf, sx, sz);
        FX.sparks(sx, 1.0, sz, surf === 'pokerStone' ? 0xffd090 : 0xcfc2a8, surf === 'pokerStone' ? 8 : 4, 3);
        G.hitStop = Math.max(G.hitStop, 0.03); Cam.shake(0.1);
      }
    }
    // swing trail
    for (let i = 0; i < 7; i++) {
      const a = this.yaw + lerp(arc, -arc, i / 6);
      Particles.glow.emit(this.pos.x + Math.sin(a) * range * 0.75, 1.0, this.pos.z + Math.cos(a) * range * 0.75, 0, 0, 0, 1, 0.75, 0.45, 0.35, 0.28, 0.16, 0, 0, 0.05);
    }
    if (hitAny) { Sfx.play('pokerHit', this.pos.x + fx, this.pos.z + fz); G.hitStop = Math.max(G.hitStop, 0.045); Cam.shake(0.18); UI.reticleHit(); }
  },

  // move by (dx, dz) in sub steps with collision each step, then keep inside a locked arena
  safeMove(dx, dz) {
    const len = Math.hypot(dx, dz), n = Math.min(12, Math.max(1, Math.ceil(len / 0.12)));
    for (let i = 0; i < n; i++) { this.pos.x += dx / n; this.pos.z += dz / n; W.collide(this.pos, 0.33); }
    if (G.arena) { const r = ROOMS[G.arena]; this.pos.x = clamp(this.pos.x, r.x0 + 0.5, r.x1 - 0.5); this.pos.z = clamp(this.pos.z, r.z0 + 0.5, r.z1 - 0.5); }
  },

  hurt(dmg, sx, sz, kb = 6, silent = false) {
    if (!this.alive || G.godMode) return;
    if (!silent && (this.inv > 0 || this.dodgeT > 0)) return;
    const mult = SETTINGS.easy ? 0.55 : 1;
    dmg *= mult;
    this.hp -= dmg; G.stats.damage += dmg;
    if (!silent) {
      this.inv = 0.65; this.hurtFlash = 1;
      if (sx != null) { const dx = this.pos.x - sx, dz = this.pos.z - sz, d = Math.hypot(dx, dz) || 1; this.vel.x += dx / d * kb; this.vel.z += dz / d * kb; }
      Sfx.play('hurt'); Cam.shake(0.55);
      Pad.rumble(0.8, 0.5, 220);
      if (Input.mode === 'touch' && navigator.vibrate) { try { navigator.vibrate(35); } catch (e) { /* ignore */ } }
      if (this.rig && this.rig.anim && this.rig.anim.flinch) this.rig.anim.flinch();
      Render.postMat.uniforms.uDamage.value = 0.85;
      G.hitStop = Math.max(G.hitStop, 0.06);
    } else {
      Render.postMat.uniforms.uDamage.value = Math.max(Render.postMat.uniforms.uDamage.value, 0.3);
    }
    UI.setHealth(this.hp, this.stats.maxHp);
    if (this.hp <= 0) { this.hp = 0; this.alive = false; Game.onPlayerDeath(); }
  },

  heal(n) {
    const before = this.hp;
    this.hp = Math.min(this.stats.maxHp, this.hp + n);
    UI.setHealth(this.hp, this.stats.maxHp);
    return this.hp - before;
  },
};

// =====================================================================
//  PROJECTILES (player nails / pellets / bombs, enemy seeds / fire / yarn / orbs / goo)
// =====================================================================
const Projectiles = {
  spawn(o) {
    const p = Object.assign({ y: 0.9, r: 0.12, life: 2, dmg: 10, alive: true, t: 0, vy: 0, grav: 0, pierce: 0, shootable: false }, o);
    p.px = p.x; p.pz = p.z;
    p.mesh = this.makeMesh(p);
    Render.scene.add(p.mesh);
    G.projectiles.push(p);
    return p;
  },
  makeMesh(p) {
    const g = new THREE.Group();
    // items.glb projectiles fly along +Z (oriented by velocity); glows are camera-facing sprites
    const KIT = { nail: ['Nail', 1.2], pellet: ['Pellet', 1.6], seed: ['Seed', 2.2], fireball: ['Fireball', 1.0], yarn: ['YarnBall', 1.0], chain: ['Chain', 1.5], orb: ['Orb', 1.0], goo: ['Goo', 1.1], tar: ['Tar', 1.05], bomb: ['PumpkinBomb', 2.3] }[p.kind];
    const it = KIT ? itemModel(KIT[0], { s: KIT[1], cast: false }) : null;
    if (it) {
      g.add(it); g.rotation.order = 'YXZ';
      p.orient = p.kind !== 'bomb';
      switch (p.kind) {
        case 'nail': mk(Geo.plane(0.12, 0.5), Mat.glow(0xfff0c0, 0.5), 0, 0, -0.15, g, { rx: -Math.PI / 2, cast: false }); break;
        case 'pellet': mk(Geo.plane(0.1, 0.45), Mat.glow(0xffd070, 0.6), 0, 0, -0.18, g, { rx: -Math.PI / 2, cast: false }); break;
        case 'seed': g.add(glowSprite(0xff7a10, 0.8, 0.9)); break;
        case 'fireball': g.add(glowSprite(0xff4a10, 1.1, 0.95)); break;
        case 'chain': g.add(glowSprite(0xff3a20, 0.7, 0.5)); break;
        case 'orb': g.add(glowSprite(0xffd860, 1.2, 0.75)); break;
        case 'tar': g.add(glowSprite(0xff3a10, 0.9, 0.6)); break;
        case 'goo': if (p.color != null) {
          // tinted per projectile (one material per color)
          const cache = this.gooMats || (this.gooMats = {});
          it.traverse((o) => { if (!o.isMesh) return; const k = p.color + o.material.uuid; if (!cache[k]) { cache[k] = o.material.clone(); cache[k].color.set(p.color); } o.material = cache[k]; });
        } break;
        case 'bomb': fuseSpark(it, 0.06); break;
      }
    } else switch (p.kind) {
      case 'nail': mk(Geo.box(0.035, 0.035, 0.3), Mat.lam(0xb8bcc4), 0, 0, 0, g, { cast: false }); mk(Geo.plane(0.12, 0.5), Mat.glow(0xfff0c0, 0.5), 0, 0, -0.15, g, { rx: -Math.PI / 2, cast: false }); break;
      case 'pellet': mk(Geo.sph(0.05, 5, 4), Mat.basic(0xffe9a0), 0, 0, 0, g, { cast: false }); mk(Geo.plane(0.1, 0.45), Mat.glow(0xffd070, 0.6), 0, 0, -0.18, g, { rx: -Math.PI / 2, cast: false }); break;
      case 'seed': mk(Geo.sph(0.11, 6, 5), Mat.basic(0xffe0a0), 0, 0, 0, g, { cast: false, sy: 1.4 }); mk(Geo.plane(0.8, 0.8), Mat.glow(0xff7a10, 0.9), 0, 0, 0, g, { cast: false }); break;
      case 'fireball': mk(Geo.sph(0.16, 8, 6), Mat.basic(0xffd070), 0, 0, 0, g, { cast: false }); mk(Geo.plane(1.1, 1.1), Mat.glow(0xff4a10, 0.95), 0, 0, 0, g, { cast: false }); break;
      case 'yarn': mk(Geo.sph(0.2, 8, 6), Mat.lam(0xb03a6a), 0, 0, 0, g, { cast: false }); mk(Geo.torus(0.2, 0.025, 4, 10), Mat.lam(0xe06a9a), 0, 0, 0, g, { cast: false, rx: 1 }); break;
      case 'chain': mk(Geo.torus(0.18, 0.05, 4, 8), Mat.lam(0x5a5a62), 0, 0, 0, g, { cast: false }); mk(Geo.torus(0.18, 0.05, 4, 8), Mat.lam(0x5a5a62), 0, 0, 0.15, g, { cast: false, ry: Math.PI / 2 }); mk(Geo.plane(0.7, 0.7), Mat.glow(0xff3a20, 0.5), 0, 0, 0, g, { cast: false }); break;
      case 'orb': mk(Geo.sph(0.18, 8, 6), Mat.basic(0xfff2b0), 0, 0, 0, g, { cast: false }); mk(Geo.plane(1.2, 1.2), Mat.glow(0xffd860, 0.75), 0, 0, 0, g, { cast: false }); break;
      case 'goo': mk(Geo.sph(0.22, 7, 5), Mat.lam(p.color || 0xff6fae, { emissive: p.color || 0xff6fae, ei: 0.3 }), 0, 0, 0, g, { cast: false }); break;
      case 'tar': mk(Geo.sph(0.24, 7, 5), Mat.lam(0x1a0808, { emissive: 0x5a1004, ei: 0.8 }), 0, 0, 0, g, { cast: false }); mk(Geo.plane(0.9, 0.9), Mat.glow(0xff3a10, 0.6), 0, 0, 0, g, { cast: false }); break;
      case 'bomb': { const b = buildWeaponModel('bomb'); b.scale.setScalar(2.3); g.add(b); break; }
      case 'hanger': {
        // a wire coat hanger lying flat (it spins as it flies): the bar, the two shoulders, the hook, a cold glint
        const wm = this.hangerMat || (this.hangerMat = Mat.lam(0xc4c8d2, { emissive: 0x3a4050, ei: 1 }));
        const h = new THREE.Group(); h.rotation.x = -Math.PI / 2; g.add(h);
        const seg = (x0, y0, x1, y1) => { const dx = x1 - x0, dy = y1 - y0; mk(Geo.cyl(0.02, 0.02, Math.hypot(dx, dy), 5), wm, (x0 + x1) / 2, (y0 + y1) / 2, 0, h, { rz: Math.atan2(-dx, dy), cast: false }); };
        seg(-0.44, -0.11, 0.44, -0.11); seg(-0.44, -0.11, 0, 0.12); seg(0.44, -0.11, 0, 0.12); seg(0, 0.12, 0, 0.17);
        mk(Geo.torus(0.065, 0.02, 4, 10, Math.PI * 1.3), wm, 0.0, 0.23, 0, h, { rz: -0.9, cast: false });
        g.add(glowSprite(0xc8d4ff, 1.0, 0.4));
        break;
      }
    }
    g.position.set(p.x, p.y, p.z);
    return g;
  },
  throwBomb(pl) {
    const fx = Math.sin(pl.yaw), fz = Math.cos(pl.yaw);
    let tx = pl.aim.x, tz = pl.aim.z;
    const dx = tx - pl.pos.x, dz = tz - pl.pos.z, d = Math.hypot(dx, dz);
    const md = clamp(d, 2, 10);
    tx = pl.pos.x + (d > 0.01 ? dx / d : fx) * md; tz = pl.pos.z + (d > 0.01 ? dz / d : fz) * md;
    const T = 0.55 + md * 0.025;
    this.spawn({ owner: 'p', kind: 'bomb', x: pl.pos.x + fx * 0.4, z: pl.pos.z + fz * 0.4, y: 1.3, vx: (tx - pl.pos.x) / T, vz: (tz - pl.pos.z) / T, vy: 4.6, grav: (2 * (1.3 + 4.6 * T)) / (T * T), life: 3, fuse: T + 0.45, r: 0.2, dmg: pl.stats.bombDmg, radius: pl.stats.bombRadius, bounce: true });
  },

  update(dt) {
    const pl = Player;
    for (const p of G.projectiles) {
      if (!p.alive) continue;
      p.t += dt; p.life -= dt;
      p.px = p.x; p.pz = p.z;
      // homing orbs
      if (p.homing) {
        const want = Math.atan2(pl.pos.x - p.x, pl.pos.z - p.z);
        const cur = Math.atan2(p.vx, p.vz);
        const na = cur + clamp(angDiff(cur, want), -p.homing * dt, p.homing * dt);
        const sp = Math.hypot(p.vx, p.vz);
        p.vx = Math.sin(na) * sp; p.vz = Math.cos(na) * sp;
      }
      // boomerangs (the Boogeyman's hangers): curve out, then turn back to whoever threw them
      if (p.boomerang) {
        const b = p.boomerang; b.t += dt;
        const sp = Math.hypot(p.vx, p.vz);
        let ang = Math.atan2(p.vx, p.vz);
        const o = b.boss && !b.boss.dead && !b.boss.hidden ? b.boss : null;
        if (b.t < b.out || !o) ang += b.curve * dt * (o ? 1 : 0.5);
        else {
          ang += clamp(angDiff(ang, Math.atan2(o.pos.x - p.x, o.pos.z - p.z)), -4.2 * dt, 4.2 * dt);
          if (b.t > b.out + 0.3 && dist(p.x, p.z, o.pos.x, o.pos.z) < o.r + 0.35) { p.alive = false; this.kill(p); continue; }
        }
        p.vx = Math.sin(ang) * sp; p.vz = Math.cos(ang) * sp;
      }
      p.x += p.vx * dt; p.z += p.vz * dt;
      if (p.grav) { p.vy -= p.grav * dt; p.y += p.vy * dt; }
      else if (p.yTo != null) p.y = damp(p.y, p.yTo, 7, dt);
      // ground contact for lobbed things
      if (p.grav && p.y <= 0.2) {
        p.y = 0.2;
        if (p.kind === 'bomb') { p.vx *= 0.55; p.vz *= 0.55; p.vy = Math.abs(p.vy) * 0.25; if (Math.abs(p.vy) < 1) { p.vy = 0; p.grav = 0; p.vx *= 0.3; p.vz *= 0.3; } }
        else { this.land(p); continue; }
      }
      if (p.kind === 'bomb') {
        p.fuse -= dt;
        if (Math.random() < 0.6) Particles.glow.emit(p.x, p.y + 0.35, p.z, rand(-0.3, 0.3), 1, rand(-0.3, 0.3), 1, 0.8, 0.3, 1, 0.08, 0.25, 0, 1, 0.02);
        const t = W.rayHit(p.px, p.pz, p.x, p.z);
        if (t <= 1) { p.x = p.px; p.z = p.pz; p.vx *= -0.4; p.vz *= -0.4; }
        if (p.fuse <= 0) { this.explode(p); continue; }
        p.mesh.position.set(p.x, p.y, p.z); p.mesh.rotation.y += dt * 5;
        continue;
      }
      // walls / furniture
      const t = W.rayHit(p.px, p.pz, p.x, p.z, true);
      if (t <= 1) {
        const hx = lerp(p.px, p.x, t), hz = lerp(p.pz, p.z, t);
        this.hitWall(p, hx, hz);
        continue;
      }
      // hits
      if (p.owner === 'p') {
        let hit = false;
        for (const e of G.enemies) {
          if (!e.targetable() || p.hitSet && p.hitSet.has(e)) continue;
          if (segCircle(p.px, p.pz, p.x, p.z, e.pos.x, e.pos.z, e.def.r + p.r)) {
            let dmg = p.dmg;
            if (p.falloff) dmg *= clamp(1.25 - p.t * 2.2, 0.35, 1.25);
            const d = Math.hypot(p.vx, p.vz) || 1;
            e.hurt(dmg, p.vx / d, p.vz / d, p.kind === 'pellet' ? 5 : 2.5, p.kind);
            FX.burst(p.x, p.y, p.z, e.def.color, 4, 2.5, { size: 0.08, life: 0.4 });
            hit = true; break;
          }
        }
        if (!hit) for (const b of G.bosses) {
          if (!b.targetable()) continue;
          if (segCircle(p.px, p.pz, p.x, p.z, b.pos.x, b.pos.z, b.r + p.r)) {
            let dmg = p.dmg; if (p.falloff) dmg *= clamp(1.25 - p.t * 2.2, 0.35, 1.25);
            b.hurt(dmg, p.kind); FX.burst(p.x, p.y, p.z, 0xffe0a0, 4, 3, { glow: true, size: 0.08, life: 0.25 });
            hit = true; break;
          }
        }
        if (!hit) for (const q of G.projectiles) {
          if (q.owner === 'e' && q.shootable && q.alive && segCircle(p.px, p.pz, p.x, p.z, q.x, q.z, 0.35)) { q.life = 0; q.alive = false; this.kill(q); FX.sparks(q.x, q.y, q.z, 0xfff0a0, 10, 4); hit = true; break; }
        }
        if (!hit && Breakables.hitPoint(p.x, p.z, p.r)) hit = true;
        if (!hit && Shells.hitSeg(p.px, p.pz, p.x, p.z, p.r)) hit = true;
        if (hit) { UI.reticleHit(); Sfx.play('hitSoft', p.x, p.z); p.alive = false; this.kill(p); continue; }
      } else if (pl.alive && !(pl.inv > 0 || pl.dodgeT > 0)) {
        if (segCircle(p.px, p.pz, p.x, p.z, pl.pos.x, pl.pos.z, 0.33 + p.r)) {
          pl.hurt(p.dmg, p.x - p.vx * 0.1, p.z - p.vz * 0.1, 4);
          if (p.bind) { pl.bindT = Math.max(pl.bindT, p.bind); UI.toast('Tangled!', 700); }
          if (p.kind === 'goo' || p.kind === 'tar') this.land(p);
          else { FX.burst(p.x, p.y, p.z, 0xff8a30, 8, 3, { glow: true, size: 0.12, life: 0.3 }); p.alive = false; this.kill(p); }
          continue;
        }
      }
      if (p.life <= 0) {
        if (p.landOnEnd) { this.land(p); continue; }
        p.alive = false; this.kill(p); continue;
      }
      // visuals
      p.mesh.position.set(p.x, p.y, p.z);
      if (p.kind === 'hanger') { p.mesh.rotation.set(0.3 * Math.sin(p.t * 3), p.t * 15, 0); if (Math.random() < 0.3) Particles.glow.emit(p.x, p.y, p.z, 0, 0, 0, 0.8, 0.85, 1, 0.35, 0.18, 0.25, 0, 0, 0.02); }
      else if (p.orient || p.kind === 'nail' || p.kind === 'pellet') {
        p.mesh.rotation.y = Math.atan2(p.vx, p.vz);
        if (p.grav) p.mesh.rotation.x = Math.atan2(-p.vy, Math.hypot(p.vx, p.vz));
      } else p.mesh.lookAt(Render.camera.position);
      if (p.kind === 'seed' || p.kind === 'fireball' || p.kind === 'tar') FX.fire(p.x, p.y, p.z, 1, 0.08, p.kind === 'fireball' ? 0.35 : 0.22);
      if (p.kind === 'orb' && Math.random() < 0.4) Particles.glow.emit(p.x, p.y, p.z, 0, 0.2, 0, 1, 0.9, 0.5, 0.6, 0.18, 0.5, 0, 1, 0.02);
    }
    compact(G.projectiles, (p) => p.alive);
  },

  land(p) {
    p.alive = false; this.kill(p);
    if (p.kind === 'seed') { const d = Decals.add('scorch', p.x, p.z, 0.75, 0x000000, 3.2, { dps: 11, owner: 'e' }); d.fire = true; Sfx.play('sizzle', p.x, p.z); }
    else if (p.kind === 'goo') { Decals.add('puddle', p.x, p.z, p.puddleR || 1.1, p.color || 0xff6fae, 7, { slow: 0.55 }); Sfx.play('splat', p.x, p.z); FX.burst(p.x, 0.2, p.z, p.color || 0xff6fae, 8, 2.5, { size: 0.1 }); }
    else if (p.kind === 'tar') { const d = Decals.add('tar', p.x, p.z, 1.2, 0x2a0604, 6, { slow: 0.4, dps: 9 }); d.fire = true; Sfx.play('splat', p.x, p.z); }
    else if (p.kind === 'yarn' || p.kind === 'chain') FX.burst(p.x, 0.2, p.z, p.kind === 'yarn' ? 0xb03a6a : 0x5a5a62, 6, 2, { size: 0.08 });
    else FX.burst(p.x, 0.3, p.z, 0xff8a30, 6, 2, { glow: true, size: 0.12, life: 0.3 });
  },

  hitWall(p, hx, hz) {
    p.alive = false; this.kill(p);
    if (p.kind === 'nail') { Sfx.play('nailWall', hx, hz); FX.sparks(hx, p.y, hz, 0xfff0c0, 3, 2.5); Nails.add(hx, p.y, hz, p.vx, p.vz); }
    else if (p.kind === 'pellet') { if (Math.random() < 0.3) FX.sparks(hx, p.y, hz, 0xffe0a0, 2, 2); }
    else if (p.kind === 'goo' || p.kind === 'tar') this.land(p);
    else if (p.landOnEnd) this.land(Object.assign(p, { x: hx - p.vx * 0.02, z: hz - p.vz * 0.02 }));
    else if (p.kind === 'hanger') { FX.sparks(hx, p.y, hz, 0xd8dce4, 8, 3); Sfx.play('nailWall', hx, hz, 0.8); }
    else FX.burst(hx, p.y, hz, 0xff8a30, 6, 2, { glow: true, size: 0.12, life: 0.3 });
    Breakables.hitPoint(hx, hz, 0.3);
  },

  explode(p) {
    p.alive = false; this.kill(p);
    const R = p.radius;
    FX.explosion(p.x, p.z, R);
    Sfx.play('explode', p.x, p.z);
    Cam.shake(0.9);
    G.hitStop = Math.max(G.hitStop, 0.07);
    for (const e of G.enemies) {
      if (!e.targetable()) continue;
      const d = dist(e.pos.x, e.pos.z, p.x, p.z);
      if (d < R + e.def.r) { const k = 1 - clamp(d / (R + e.def.r), 0, 1) * 0.5; e.hurt(p.dmg * k, (e.pos.x - p.x) / (d || 1), (e.pos.z - p.z) / (d || 1), 12, 'bomb'); }
    }
    for (const b of G.bosses) { if (!b.targetable()) continue; const d = dist(b.pos.x, b.pos.z, p.x, p.z); if (d < R + b.r) b.hurt(p.dmg * (1 - clamp(d / (R + b.r), 0, 1) * 0.5), 'bomb'); }
    for (const q of G.projectiles) if (q.owner === 'e' && q.shootable && dist(q.x, q.z, p.x, p.z) < R) { q.alive = false; this.kill(q); }
    Breakables.hitRadius(p.x, p.z, R);
    Shells.hitRadius(p.x, p.z, R);
  },

  kill(p) { if (p.mesh && p.mesh.parent) p.mesh.parent.remove(p.mesh); p.mesh = null; },
  clear() { for (const p of G.projectiles) this.kill(p); G.projectiles = []; },
};

function segCircle(x0, z0, x1, z1, cx, cz, r) {
  const dx = x1 - x0, dz = z1 - z0, l2 = dx * dx + dz * dz;
  let t = l2 > 0 ? ((cx - x0) * dx + (cz - z0) * dz) / l2 : 0;
  t = clamp(t, 0, 1);
  const px = x0 + dx * t - cx, pz = z0 + dz * t - cz;
  return px * px + pz * pz < r * r;
}

// nails stuck in walls (instanced)
const Nails = {
  max: 120, i: 0, mesh: null,
  init() {
    this.mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(0.025, 0.025, 0.14), new THREE.MeshLambertMaterial({ color: 0x9a9ea6 }), this.max);
    this.mesh.count = 0; this.mesh.frustumCulled = false;
    Render.scene.add(this.mesh);
    this._m = new THREE.Matrix4(); this._q = new THREE.Quaternion(); this._e = new THREE.Euler();
  },
  add(x, y, z, vx, vz) {
    const yaw = Math.atan2(vx, vz);
    this._e.set(rand(-0.15, 0.15), yaw, 0); this._q.setFromEuler(this._e);
    this._m.compose(new THREE.Vector3(x - Math.sin(yaw) * 0.03, y, z - Math.cos(yaw) * 0.03), this._q, new THREE.Vector3(1, 1, 1));
    this.mesh.setMatrixAt(this.i % this.max, this._m);
    this.i++; this.mesh.count = Math.min(this.max, this.i);
    this.mesh.instanceMatrix.needsUpdate = true;
  },
  clear() { this.i = 0; this.mesh.count = 0; },
};

// =====================================================================
//  BREAKABLE DECOR
// =====================================================================
const Breakables = {
  smash(b) {
    if (!b.alive) return;
    b.alive = false;
    b.mesh.visible = false;
    Sfx.play('pop', b.x, b.z);
    Chunks.spawn(b.x, (b.y || 0) + 0.3, b.z, b.col, 8, 3, 0.08);
    FX.burst(b.x, (b.y || 0) + 0.3, b.z, b.col, 10, 2.5, { size: 0.08 });
    const r = Math.random();
    const drop = b.kind === 'piggy' ? 'candy' : r < 0.35 ? 'candy' : r < 0.6 ? Pickups.ammoKind() : null;
    if (drop) Pickups.spawn(drop, b.x, b.z, true);
  },
  hitArc(px, pz, yaw, range, arc) {
    let hit = null;
    for (const b of W.breakables) {
      if (!b.alive || b.room !== Player.room) continue;
      const dx = b.x - px, dz = b.z - pz, d = Math.hypot(dx, dz);
      if (d < range + b.r && (d < 0.5 || Math.abs(angDiff(yaw, Math.atan2(dx, dz))) < arc)) { hit = hit || { x: b.x, z: b.z }; if (--b.hp <= 0) this.smash(b); }
    }
    return hit;
  },
  hitPoint(x, z, r) {
    for (const b of W.breakables) {
      if (!b.alive) continue;
      if (dist2(x, z, b.x, b.z) < (b.r + r) * (b.r + r)) { if (--b.hp <= 0) this.smash(b); return true; }
    }
    return false;
  },
  hitRadius(x, z, R) { for (const b of W.breakables) if (b.alive && dist(x, z, b.x, b.z) < R) this.smash(b); },
  reset() { for (const b of W.breakables) { b.alive = true; b.mesh.visible = true; b.hp = b.kind === 'box' ? 2 : 1; } TVSmash.reset(); },
};

// =====================================================================
//  THE LIVING ROOM TV. Hit it with the poker: it breaks, you say what everyone thinks, and out of the dead set
//  comes a swarm of horror VHS tapes. A secret stash: every tape drops ammo (sweets while you have no gun yet)
// =====================================================================
const TVSmash = {
  X: 28.5, Z: 0.75, R: 0.5,          // the set's centre on its stand (hit test)
  SX: 28.44, SY: 0.98, SZ: 0.98,     // the hole in the screen (the tapes come out of it)
  N: 9, QUIP: '57 Channels and nothing on!',
  done: false, t: 0, spawned: 0, spawnT: 0, tapes: [], over: true, quipped: false, whir: false, dlgT: 0, sparkT: 0, crunchT: 0,
  reset() {
    if (this.dlgT > 0 && UI._dlgLine === this.QUIP) UI.dialog(null);
    this.done = false; this.t = 0; this.spawned = 0; this.spawnT = 0; this.tapes = []; this.over = true; this.quipped = false; this.whir = false; this.dlgT = 0;
    W.tvSmashed = false;
    const P = W.props;
    if (P.tvWhole) P.tvWhole.visible = true;
    if (P.tvBroken) P.tvBroken.visible = false;
    if (P.tvGlass) P.tvGlass.visible = false;
    for (const m of P.tvCavity || []) m.emissiveIntensity = m.userData.baseEI ?? 1;
    const L = P.tvLight;
    if (L) { L.broken = false; L.base = 4; L.flicker = 0.3; L.color.set(0x8aa0ff); L.pos.set(28.4, 1.1, 1.6); this.syncLight(); }
  },
  syncLight() { const L = W.props.tvLight; if (L) for (const p of W.pool) if (p.src === L) p.light.color.copy(L.color); },
  alive() { let n = 0; for (const e of this.tapes) if (!e.dead) n++; return n; },
  divers() { let n = 0; for (const e of this.tapes) if (!e.dead && (e.state === 'windup' || e.state === 'lunge')) n++; return n; },
  // the tapes are after you (or about to be): no holding photos up now
  threat() { return this.done && !this.over && (this.spawned < this.N || (Player.room === 'living' && this.alive() > 0)); },
  // Player.meleeHit: true when the swing met the set
  hitArc(px, pz, yaw, range, arc) {
    const P = W.props;
    if (G.state !== 'play' || Player.room !== 'living' || !P.tvBroken || !P.tvWhole) return false;
    const dx = this.X - px, dz = this.Z - pz, d = Math.hypot(dx, dz);
    if (d > range + this.R) return false;
    if (d > 0.8 && Math.abs(angDiff(yaw, Math.atan2(dx, dz))) > arc) return false;
    if (this.done) { // a dead set still bites back a little
      FX.sparks(this.SX + rand(-0.15, 0.15), this.SY + rand(-0.1, 0.1), this.SZ + 0.05, pick([0xffc060, 0xbfe0ff]), 7, 3);
      Sfx.play('zap', this.SX, this.SZ, 0.45);
      return true;
    }
    this.smash();
    return true;
  },
  smash() {
    this.done = true; this.t = 0; this.spawned = 0; this.spawnT = 0; this.tapes = []; this.over = false; this.quipped = false; this.whir = false; this.sparkT = 0.6;
    W.tvSmashed = true;
    const P = W.props;
    P.tvWhole.visible = false; P.tvBroken.visible = true;
    if (P.tvGlass) P.tvGlass.visible = true;
    const L = P.tvLight;
    if (L) { L.color.set(0xff7a3a); L.base = 2.6; L.flicker = 0.55; L.pos.set(this.SX, this.SY, 0.66); this.syncLight(); }
    const x = this.SX, y = this.SY, z = this.SZ + 0.08;
    Sfx.play('tvSmash', x, z); Sfx.play('zap', x, z, 0.9);
    // the tube goes: a blue-white flash, glass everywhere, sparks, smoke out of the hole
    FX.light(x, y + 0.2, z + 0.5, 0xbcd0ff, 45, 0.35);
    FX.burst(x, y, z, 0xcfe0ea, 26, 4.2, { size: 0.05, life: 0.9, grav: 12, drag: 1.2, upMin: 0.1, upMax: 0.8 });
    Chunks.spawn(x, y, z + 0.1, 0x9fb4c0, 8, 3.5, 0.035);
    FX.sparks(x, y, z, 0xbfe0ff, 16, 6);
    FX.sparks(x, y, z, 0xffc060, 12, 5);
    FX.smoke(x, y, z, 8, 0x3a3a3e, 0.45);
    Cam.shake(0.45); G.hitStop = Math.max(G.hitStop, 0.08);
    UI.flash(90, 0.16, '#cfe0ff');
  },
  // what a tape drops: ammo you are short of (counting what already lies on the floor), else any ammo you can use;
  // before the first gun turns up, sweets
  dropKind() {
    const pl = Player, w = pl.weapons, mul = pl.stats.ammoMul;
    const want = [], own = [];
    for (const [k, wk, per, wt] of [['nails', 'nailgun', 24 * mul, 2], ['shells', 'shotgun', 5 * mul, 2], ['bomb', 'bomb', 1, 1]]) {
      if (!w[wk].owned) continue;
      own.push(k);
      let need = pl.maxAmmo(wk) - pl.rounds(wk);
      for (const p of G.pickups) if (p.alive && p.kind === k) need -= per;
      if (need > 0) for (let i = 0; i < wt; i++) want.push(k);
    }
    if (want.length) return pick(want);
    if (pl.hp < pl.stats.maxHp) return 'candy';
    return own.length ? pick(own) : 'candy';
  },
  onTapeGone(e) {
    if (this.over || this.spawned < this.N || this.alive() > 0) return;
    // the last one: the stash is yours (and a full-size chocolate bar out of the last tape)
    this.over = true;
    Pickups.spawn('choco', e.pos.x, e.pos.z, true);
    Sfx.play('rewind', this.SX, this.SZ, 0.9);
    UI.toast('Be kind. Rewind.', 2600);
  },
  // a wave is about to start: tapes still flying around go away quietly (no drops)
  dismiss() {
    let any = false;
    for (const e of this.tapes) if (!e.dead) { FX.smoke(e.pos.x, 1 + (e.alt || 0), e.pos.z, 3, 0x1a1a1e, 0.35); e.remove(); any = true; }
    if (any) G.enemies = G.enemies.filter((e) => !e.dead);
    if (this.done) { this.spawned = this.N; this.over = true; }
  },
  spawnTape(i) {
    // they fan out into the room, a little apart from each other
    const a = lerp(-1.15, 1.15, this.N > 1 ? i / (this.N - 1) : 0.5) + rand(-0.18, 0.18);
    const c = new Critter('vhs', this.SX + Math.sin(a) * 0.08, this.SZ, 'burst');
    c.burstDir.set(Math.sin(a), 0, Math.cos(a));
    c.yaw = a; c.alt = this.SY - 1.0 + rand(-0.05, 0.05);
    c.animateSwarm(0, 0);
    G.enemies.push(c); this.tapes.push(c);
    FX.burst(this.SX, this.SY, this.SZ + 0.1, 0x101014, 4, 1.5, { size: 0.08, life: 0.4, grav: 0 });
  },
  update(dt) {
    if (!this.done) return;
    this.t += dt;
    const t = this.t, P = W.props, x = this.SX, y = this.SY, z = this.SZ + 0.08;
    // the line
    if (!this.quipped && t > 0.4) { this.quipped = true; UI.dialog('YOU', this.QUIP); this.dlgT = 3.2; }
    if (this.dlgT > 0) { this.dlgT -= dt; if (this.dlgT <= 0 && UI._dlgLine === this.QUIP) UI.dialog(null); }
    // something in the dead set is still running...
    if (!this.whir && t > 1.4) { this.whir = true; Sfx.play('tapeWhir', x, z); }
    // ...and out they come
    if (t > 2.35 && this.spawned < this.N && G.state === 'play') {
      if (this.spawned === 0) {
        Sfx.play('tapeSwarm', x, z); Cam.shake(0.3);
        FX.burst(x, y, z, 0xdfe6ff, 30, 3.5, { glow: true, size: 0.04, life: 0.5, grav: 0, drag: 2.5 }); // a last puff of static
        FX.smoke(x, y, z, 5, 0x1a1a1e, 0.4);
      }
      this.spawnT -= dt;
      while (this.spawnT <= 0 && this.spawned < this.N) { this.spawnT += 0.075; this.spawnTape(this.spawned++); }
    }
    // the embers in the tube: a pulse while the tapes stir, then they die down over half a minute (and the glow on
    // the walls with them)
    const pre = t > 1.4 && t < 2.35;
    const ember = clamp(1 - (t - 2.35) / 26, 0, 1), fl = 0.8 + 0.2 * Math.sin(t * 17) * Math.sin(t * 7.3);
    for (const m of P.tvCavity || []) m.emissiveIntensity = (m.userData.baseEI ?? 1) * (t < 2.35 ? 1.3 + (pre ? 0.9 * Math.abs(Math.sin(t * 24)) : 0) : ember * fl);
    const L = P.tvLight;
    if (L && !L.broken) {
      // (once they are out the set has little left: a dim glow, nothing that burns a tape flying past it white)
      L.base = t < 2.35 ? 2.6 + (pre ? 2.4 * Math.abs(Math.sin(t * 24)) : 0) : 1.4 * ember;
      if (ember <= 0) L.broken = true;
    }
    // sparks and wisps of smoke out of the hole for a while
    if (t < 20 && Player.room === 'living') {
      this.sparkT -= dt;
      if (this.sparkT <= 0) { this.sparkT = rand(0.9, 2.6) * (1 + t * 0.08); FX.sparks(x + rand(-0.12, 0.12), y + rand(-0.1, 0.1), z, pick([0xffc060, 0xbfe0ff]), 5, 2.5); Sfx.play('zap', x, z, 0.22); }
      if (Math.random() < dt * 1.5) FX.smoke(x, y + 0.15, z, 1, 0x2a2a2e, 0.3);
    }
    // glass crunches underfoot
    if (P.tvGlass) {
      const pl = Player;
      this.crunchT -= dt;
      if (this.crunchT <= 0 && Math.hypot(pl.vel.x, pl.vel.z) > 0.8 && pl.pos.x > 27.3 && pl.pos.x < 29.2 && pl.pos.z > 1.0 && pl.pos.z < 2.1) { this.crunchT = rand(0.26, 0.38); Sfx.play('glassCrunch', pl.pos.x, pl.pos.z, 0.8); }
    }
  },
};

// loose magnetic tape (what a smashed tape spills): a couple of ribbons flutter down and lie on the floor a while
const TapeSpill = {
  geos: null, mat: null,
  init() {
    this.mat = new THREE.MeshStandardMaterial({ color: 0x2b1c12, roughness: 0.32, metalness: 0.35, side: THREE.DoubleSide });
    this.geos = [];
    const rng = mulberry32(57);
    for (let v = 0; v < 4; v++) {
      // a tangle: a wandering curve, the ribbon twisting slowly along it
      const pts = [];
      let x = 0, y = 0.12, z = 0, a = rng() * TAU;
      for (let i = 0; i < 7 + v; i++) { pts.push(new THREE.Vector3(x, y, z)); a += (rng() - 0.5) * 2.4; const s = 0.09 + rng() * 0.08; x += Math.cos(a) * s; z += Math.sin(a) * s; y = 0.04 + rng() * 0.22; }
      const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
      const N = 72, w = 0.013, pos = [], idx = [];
      const fr = curve.computeFrenetFrames(N, false), b = new THREE.Vector3(), q = new THREE.Vector3();
      for (let i = 0; i <= N; i++) {
        const p = curve.getPointAt(i / N), tw = i / N * TAU * (1 + v * 0.5);
        b.copy(fr.binormals[i]).multiplyScalar(Math.cos(tw)).add(q.copy(fr.normals[i]).multiplyScalar(Math.sin(tw))).multiplyScalar(w / 2);
        pos.push(p.x + b.x, p.y + b.y, p.z + b.z, p.x - b.x, p.y - b.y, p.z - b.z);
        if (i < N) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
      g.computeBoundingBox(); const bb = g.boundingBox;
      g.translate(-(bb.min.x + bb.max.x) / 2, -bb.min.y, -(bb.min.z + bb.max.z) / 2);
      this.geos.push(g);
    }
  },
  spawn(x, y, z, vx = 0, vz = 0) {
    if (!this.geos) this.init();
    for (let k = 0; k < 2; k++) {
      const m = new THREE.Mesh(this.geos[(Math.random() * this.geos.length) | 0], this.mat);
      m.castShadow = false; m.receiveShadow = true;
      m.position.set(x + rand(-0.1, 0.1), Math.max(0.01, y - 0.12), z + rand(-0.1, 0.1)); m.rotation.y = rand(0, TAU);
      const s = { vx: vx * 0.25 + rand(-0.8, 0.8), vy: rand(0.5, 1.5), vz: vz * 0.25 + rand(-0.8, 0.8), wr: rand(-3, 3), land: false, sy: 1 };
      Temp.add(m, (e, dt) => {
        const o = e.obj;
        if (!s.land) {
          s.vy = Math.max(s.vy - 7 * dt, -1.6); // light as anything: it flutters down
          s.vx = damp(s.vx, 0, 1.5, dt); s.vz = damp(s.vz, 0, 1.5, dt);
          o.position.x += s.vx * dt; o.position.y += s.vy * dt; o.position.z += s.vz * dt;
          o.rotation.y += s.wr * dt; o.rotation.z = Math.sin(e.t * 5 + s.wr) * 0.3;
          if (o.position.y <= 0.004) { o.position.y = 0.004; s.land = true; }
        } else o.rotation.z = damp(o.rotation.z, 0, 8, dt);
        s.sy = damp(s.sy, s.land ? 0.16 : 1, 6, dt); // settles flat on the floor
        const f = clamp((e.life - e.t) / 0.8, 0, 1);
        o.scale.set(f, s.sy * f, f);
      }, rand(8, 11));
    }
  },
};


// =====================================================================
//  PICKUPS
// =====================================================================
const Pickups = {
  spawn(kind, x, z, pop = true) {
    const m = buildPickupModel(kind);
    m.root.position.set(x, 0, z);
    Render.scene.add(m.root);
    const p = { kind, x, z, y: 0, vy: pop ? 4 : 0, vx: pop ? rand(-1.5, 1.5) : 0, vz: pop ? rand(-1.5, 1.5) : 0, t: rand(0, 6), rig: m, alive: true, delay: 0.35, magnet: !['nailgun', 'shotgun', 'bombbag', 'upgrade'].includes(kind) };
    G.pickups.push(p);
    return p;
  },
  ammoKind() {
    const opts = [];
    const pl = Player;
    if (pl.canTakeAmmo('nailgun')) opts.push('nails', 'nails');
    if (pl.canTakeAmmo('shotgun')) opts.push('shells', 'shells');
    if (pl.canTakeAmmo('bomb')) opts.push('bomb');
    return opts.length ? pick(opts) : null;
  },
  // drop roll for a killed critter
  rollDrop(x, z) {
    const pl = Player;
    const hpFrac = pl.hp / pl.stats.maxHp;
    let hpChance = 0.12 + (hpFrac < 0.4 ? 0.14 : 0) + (hpFrac < 0.2 ? 0.1 : 0);
    let ammoChance = 0.3 * pl.stats.ammoMul;
    const w = pl.weapons;
    const lowAmmo = (w.nailgun.owned && w.nailgun.ammo + w.nailgun.mag < 20) || (w.shotgun.owned && w.shotgun.ammo + w.shotgun.mag < 4);
    if (lowAmmo) ammoChance += 0.15;
    const r = Math.random();
    if (r < hpChance) this.spawn(Math.random() < 0.22 ? 'choco' : 'candy', x, z);
    else if (r < hpChance + ammoChance) { const k = this.ammoKind(); if (k) this.spawn(k, x, z); }
  },
  update(dt) {
    const pl = Player;
    for (const p of G.pickups) {
      if (!p.alive) continue;
      p.t += dt; p.delay -= dt;
      if (p.vy || p.y > 0) {
        p.vy -= 14 * dt; p.y += p.vy * dt; p.x += p.vx * dt; p.z += p.vz * dt;
        if (p.y <= 0) { p.y = 0; p.vy = Math.abs(p.vy) > 2 ? -p.vy * 0.3 : 0; p.vx *= 0.5; p.vz *= 0.5; }
        const q = { x: p.x, z: p.z }; W.collide(q, 0.25); p.x = q.x; p.z = q.z;
        if (G.arena) { const r = ROOMS[G.arena]; p.x = clamp(p.x, r.x0 + 0.5, r.x1 - 0.5); p.z = clamp(p.z, r.z0 + 0.5, r.z1 - 0.5); }
      }
      const d = dist(p.x, p.z, pl.pos.x, pl.pos.z);
      const mr = p.magnet ? 2.4 : 1.7;
      if (d < mr && p.delay <= 0 && pl.alive && this.wants(p.kind)) {
        const k = (1 - d / mr) * 12 * dt + 2.5 * dt;
        p.x = lerp(p.x, pl.pos.x, clamp(k, 0, 1)); p.z = lerp(p.z, pl.pos.z, clamp(k, 0, 1));
      }
      if (d < 0.75 && p.delay <= 0 && pl.alive && G.state === 'play' && this.wants(p.kind)) { this.collect(p); continue; }
      p.rig.root.position.set(p.x, p.y, p.z);
      p.rig.inner.position.y = 0.35 + Math.sin(p.t * 3) * 0.08;
      p.rig.inner.rotation.y = p.t * 1.8;
      p.rig.ring.material.opacity = 0.35 + Math.sin(p.t * 4) * 0.15;
    }
    compact(G.pickups, (p) => p.alive);
  },
  wants(kind) {
    const pl = Player;
    if (kind === 'candy' || kind === 'choco') return pl.hp < pl.stats.maxHp;
    if (kind === 'nails') return pl.canTakeAmmo('nailgun');
    if (kind === 'shells') return pl.canTakeAmmo('shotgun');
    if (kind === 'bomb') return pl.canTakeAmmo('bomb');
    return true;
  },
  collect(p) {
    p.alive = false; Render.scene.remove(p.rig.root);
    const pl = Player;
    switch (p.kind) {
      case 'candy': pl.heal(15 * pl.stats.healMul); Sfx.play('pickupHealth'); UI.toast('+ candy', 700); break;
      case 'choco': pl.heal(35 * pl.stats.healMul); Sfx.play('pickupHealth'); UI.toast('+ full-size chocolate bar', 900); break;
      case 'nails': pl.addAmmo('nailgun', Math.round(24 * pl.stats.ammoMul)); Sfx.play('pickupAmmo'); break;
      case 'shells': pl.addAmmo('shotgun', Math.round(5 * pl.stats.ammoMul)); Sfx.play('pickupAmmo'); break;
      case 'bomb': pl.addAmmo('bomb', 1); Sfx.play('pickupAmmo'); break;
      case 'nailgun': pl.give('nailgun'); Sfx.play('pickupWeapon'); UI.titleCard('NAIL GUN', 'fast and precise  /  press 2', 2600, 'clear'); break;
      case 'shotgun': pl.give('shotgun'); Sfx.play('pickupWeapon'); UI.titleCard('SHOTGUN', 'up close and personal  /  press 3', 2600, 'clear'); break;
      case 'bombbag': pl.give('bomb'); Sfx.play('pickupWeapon'); UI.titleCard('PUMPKIN BOMBS', 'throw at the cursor  /  press 4', 2600, 'clear'); break;
      case 'upgrade': Sfx.play('pickupWeapon'); Game.offerUpgrade(); break;
    }
    FX.burst(p.x, 0.5, p.z, 0xffe0a0, 8, 2, { glow: true, size: 0.1, life: 0.4, grav: 0 });
    UI.setWeapons(pl);
  },
  clear() { for (const p of G.pickups) Render.scene.remove(p.rig.root); G.pickups = []; },
};

// =====================================================================
//  CRITTERS: cute first, then not.
// =====================================================================
const CRIT = {
  pumpkin: { hp: 54, speed: 3.0, dmg: 10, r: 0.42, range: 1.35, windup: 0.42, lunge: 0.22, lungeSpeed: 9.5, pitch: 1.0, color: 0xe0701a },
  candy: { hp: 48, speed: 3.25, dmg: 9, r: 0.4, range: 1.3, windup: 0.4, lunge: 0.2, lungeSpeed: 9.5, pitch: 1.3, color: 0xff6fae, puddleEvery: 2.8 },
  stitch: { hp: 52, speed: 2.9, dmg: 11, r: 0.42, range: 1.35, windup: 0.45, lunge: 0.22, lungeSpeed: 9, pitch: 0.8, color: 0x9a7048, revive: 30 },
  ghost: { hp: 42, speed: 2.7, dmg: 12, r: 0.4, range: 1.45, windup: 0.5, lunge: 0.24, lungeSpeed: 9.5, pitch: 1.5, color: 0xeae6dc, fly: true },
  devil: { hp: 48, speed: 3.9, dmg: 12, r: 0.4, range: 1.35, windup: 0.34, lunge: 0.2, lungeSpeed: 11, pitch: 1.1, color: 0xc0261c },
  imp: { hp: 40, speed: 3.1, dmg: 11, r: 0.38, range: 0, ranged: true, keep: 6, castT: 2.4, pitch: 1.35, color: 0x8a1a3a },
  // the tapes in the living room TV (TVSmash): a bonus swarm, not part of any haunting. Brittle (one hit of anything),
  // quick; they circle you and now and then one rears up and dives in. range = how close a dive starts
  vhs: { hp: 6, speed: 4.4, dmg: 3, r: 0.3, range: 4.2, windup: 0.32, lunge: 0.26, lungeSpeed: 10, pitch: 1.7, color: 0x1e1e22, fly: true, swarm: true },
  // the Boogeyman's helpers. Lost socks shaken out of its coat: quick little biters with pins for teeth. Dust moths
  // pouring out of the moth-eaten coat: a swarm like the tapes, but they can't resist your flashlight (lit, they
  // dance in the beam instead of diving at you, and they are easy to swat)
  sock: { hp: 24, speed: 3.1, dmg: 7, r: 0.34, range: 1.3, windup: 0.48, lunge: 0.22, lungeSpeed: 9.5, pitch: 1.25, color: 0xe9e4d6 },
  moth: { hp: 7, speed: 3.8, dmg: 3, r: 0.3, range: 4.0, windup: 0.36, lunge: 0.26, lungeSpeed: 9.5, pitch: 1.9, color: 0x8a7a62, fly: true, swarm: true },
};

// ---------------------------------------------------------------------
//  Flow field over the arena room (8-way BFS from the player)
// ---------------------------------------------------------------------
const Flow = {
  room: null, cell: 0.5, w: 0, h: 0, x0: 0, z0: 0, blocked: null, dist: null, t: 0,
  build(roomId) {
    const r = ROOMS[roomId];
    this.room = roomId; this.x0 = r.x0; this.z0 = r.z0;
    this.w = Math.ceil((r.x1 - r.x0) / this.cell); this.h = Math.ceil((r.z1 - r.z0) / this.cell);
    this.blocked = new Uint8Array(this.w * this.h); this.dist = new Int32Array(this.w * this.h);
    const inflate = 0.32;
    for (let j = 0; j < this.h; j++) for (let i = 0; i < this.w; i++) {
      const cx = this.x0 + (i + 0.5) * this.cell, cz = this.z0 + (j + 0.5) * this.cell;
      let b = cx < r.x0 + 0.35 || cx > r.x1 - 0.35 || cz < r.z0 + 0.35 || cz > r.z1 - 0.35;
      if (!b) for (const c of W.colliders) { if (!c.active) continue; if (cx > c.x0 - inflate && cx < c.x1 + inflate && cz > c.z0 - inflate && cz < c.z1 + inflate) { b = true; break; } }
      this.blocked[j * this.w + i] = b ? 1 : 0;
    }
    this.t = 0;
  },
  idx(x, z) { const i = Math.floor((x - this.x0) / this.cell), j = Math.floor((z - this.z0) / this.cell); if (i < 0 || j < 0 || i >= this.w || j >= this.h) return -1; return j * this.w + i; },
  update(dt, tx, tz) {
    if (!this.blocked) return;
    this.t -= dt; if (this.t > 0) return; this.t = 0.2;
    const D = this.dist; D.fill(1e9);
    let s = this.idx(tx, tz); if (s < 0) return;
    if (this.blocked[s]) { // find nearest free cell
      let best = -1, bd = 1e9; const si = s % this.w, sj = Math.floor(s / this.w);
      for (let dj = -3; dj <= 3; dj++) for (let di = -3; di <= 3; di++) { const i = si + di, j = sj + dj; if (i < 0 || j < 0 || i >= this.w || j >= this.h) continue; const k = j * this.w + i; if (!this.blocked[k] && di * di + dj * dj < bd) { bd = di * di + dj * dj; best = k; } }
      if (best < 0) return; s = best;
    }
    const q = new Int32Array(this.w * this.h); let qh = 0, qt = 0;
    D[s] = 0; q[qt++] = s;
    while (qh < qt) {
      const k = q[qh++], i = k % this.w, j = (k - i) / this.w, d = D[k] + 1;
      for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
        if (!di && !dj) continue;
        const ni = i + di, nj = j + dj; if (ni < 0 || nj < 0 || ni >= this.w || nj >= this.h) continue;
        const nk = nj * this.w + ni; if (this.blocked[nk] || D[nk] <= d) continue;
        if (di && dj && (this.blocked[j * this.w + ni] || this.blocked[nj * this.w + i])) continue; // no corner cutting
        D[nk] = d; q[qt++] = nk;
      }
    }
  },
  // direction to walk from x,z
  dir(x, z, out) {
    const k = this.idx(x, z);
    if (k < 0 || !this.dist) return false;
    const i = k % this.w, j = (k - i) / this.w;
    let best = this.dist[k], bi = 0, bj = 0;
    for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
      const ni = i + di, nj = j + dj; if (ni < 0 || nj < 0 || ni >= this.w || nj >= this.h) continue;
      const v = this.dist[nj * this.w + ni]; if (v < best) { best = v; bi = di; bj = dj; }
    }
    if (!bi && !bj) return false;
    const l = Math.hypot(bi, bj); out.x = bi / l; out.z = bj / l; return true;
  },
  free(x, z) { const k = this.idx(x, z); return k >= 0 && !this.blocked[k]; },
  randomFree(minDistFromPlayer = 3) {
    for (let t = 0; t < 60; t++) {
      const r = ROOMS[this.room];
      const x = rand(r.x0 + 1, r.x1 - 1), z = rand(r.z0 + 1, r.z1 - 1);
      if (this.free(x, z) && dist(x, z, Player.pos.x, Player.pos.z) > minDistFromPlayer) return { x, z };
    }
    const r = ROOMS[this.room]; return { x: (r.x0 + r.x1) / 2, z: (r.z0 + r.z1) / 2 };
  },
};

// soft round shadow under things that fly and throw no real shadow (the VHS swarm)
function blobTexture() {
  return Tex.make('blob', 64, 64, (g, w, h) => {
    const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, 'rgba(255,255,255,0.85)'); grd.addColorStop(0.45, 'rgba(255,255,255,0.5)'); grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd; g.fillRect(0, 0, w, h);
  }, { clamp: true, smooth: true });
}
let _blobMat = null;
function blobShadow() {
  if (!_blobMat) _blobMat = new THREE.MeshBasicMaterial({ color: 0x000000, map: blobTexture(), transparent: true, opacity: 0.38, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 });
  const m = new THREE.Mesh(Geo.get('blobShadow', () => new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2)), _blobMat);
  m.castShadow = false; m.receiveShadow = false; m.renderOrder = 1;
  return m;
}

class Critter {
  constructor(type, x, z, state = 'cute') {
    this.type = type; this.def = CRIT[type];
    const hpMul = (SETTINGS.easy ? 0.85 : 1) * 1.15;
    this.hp = this.def.hp * hpMul; this.maxHp = this.hp;
    this.rig = buildCritter(type);
    Render.scene.add(this.rig.root);
    this.pos = new THREE.Vector3(x, 0, z); this.vel = new THREE.Vector3();
    this.yaw = rand(0, TAU); this.state = state; this.t = 0; this.seed = rand(0, 100);
    this.wander = { x, z, t: 0 };
    this.stepT = rand(0.1, 0.45);
    this.flashT = 0; this.stagger = 0; this.revived = false; this.alpha = 1; this.dead = false;
    this.castT = rand(1, this.def.castT || 2); this.puddleT = rand(1, 3); this.blinkCd = rand(2.5, 4.5);
    this.scary = state !== 'cute';
    if (this.scary) this.setScary(true);
    if (state === 'spawn') { this.rig.root.scale.setScalar(0.01); this.spawnT = 0; }
    this.lungeDir = new THREE.Vector3(); this.hitDone = false;
    if (this.def.swarm) this.initSwarm();
    this.update(0);
  }
  targetable() { return !this.dead && this.state !== 'hidden' && this.state !== 'blinkOut' && this.state !== 'dying' && !(this.state === 'spawn' && this.t < 0.3); }
  setScary(on) {
    this.scary = on;
    if (this.rig.glb) { if (this.rig.faceCute) this.rig.faceCute.visible = !on; if (this.rig.faceScary) this.rig.faceScary.visible = on; }
    else this.rig.face.material = on ? this.rig.faceMats.scary : this.rig.faceMats.cute;
    if (this.rig.parts.eyes) this.rig.parts.eyes.visible = on;
    if (this.rig.parts.glow) this.rig.parts.glow.material = Mat.glow(0xff8a20, on ? 0.55 : 0);
  }
  setState(s) { this.state = s; this.t = 0; }

  update(dt) {
    if (this.dead) return;
    if (this.def.swarm) { this.updateSwarm(dt); return; }
    const d = this.def, pl = Player;
    this.t += dt;
    this.flashT = Math.max(0, this.flashT - dt);
    const dx = pl.pos.x - this.pos.x, dz = pl.pos.z - this.pos.z, dP = Math.hypot(dx, dz);
    const toYaw = Math.atan2(dx, dz);
    let moveX = 0, moveZ = 0, sp = 0;
    if (this.stagger > 0) { this.stagger -= dt; }
    switch (this.state) {
      case 'spawn':
        this.rig.root.scale.setScalar(easeOutBack(clamp(this.t / 0.5, 0, 1)));
        if (this.t >= 0.5) { this.rig.root.scale.setScalar(1); this.setState(this.scary ? (d.ranged ? 'keep' : 'chase') : 'cute'); }
        break;
      case 'cute': {
        // wander, look at the player, tilt head
        this.wander.t -= dt;
        if (this.wander.t <= 0) {
          this.wander.t = rand(1.2, 2.8);
          const a = rand(0, TAU), r = rand(0.5, 1.8);
          let tx = this.pos.x + Math.cos(a) * r, tz = this.pos.z + Math.sin(a) * r;
          if (dP > 3 && Math.random() < 0.45) { tx = this.pos.x + dx / dP * 1.2; tz = this.pos.z + dz / dP * 1.2; } // curious approach
          this.wander.x = tx; this.wander.z = tz;
          if (Math.random() < 0.35) Sfx.play('squeak', this.pos.x, this.pos.z, 0.6, { pitch: d.pitch * rand(0.9, 1.15) });
        }
        const wx = this.wander.x - this.pos.x, wz = this.wander.z - this.pos.z, wl = Math.hypot(wx, wz);
        if (wl > 0.2 && dP > 1.6) { moveX = wx / wl; moveZ = wz / wl; sp = 0.9; }
        const lookAt = (Math.sin(this.t * 0.8 + this.seed) > -0.2) ? toYaw : Math.atan2(moveX || 0.01, moveZ || 0.01);
        this.yaw = dampAngle(this.yaw, lookAt, 4, dt);
        if (G.wave && G.wave.aggro) { this.turnDelay = this.turnDelay ?? rand(0, 0.45); this.turnDelay -= dt; if (this.turnDelay <= 0) this.setState('turn'); }
        break;
      }
      case 'turn':
        this.yaw = dampAngle(this.yaw, toYaw, 8, dt);
        if (this.t > 0.25 && !this.scary) { this.setScary(true); Sfx.play('screech', this.pos.x, this.pos.z, 0.7); }
        if (this.t > 0.6) this.setState(d.ranged ? 'keep' : 'chase');
        break;
      case 'chase': {
        if (this.stagger > 0) break;
        if (dP < d.range && pl.alive) { Sfx.play('growl', this.pos.x, this.pos.z, 0.6, { pitch: d.pitch || 1 }); this.setState('windup'); this.lungeDir.set(dx / dP, 0, dz / dP); break; }
        if (d.fly || W.los(this.pos.x, this.pos.z, pl.pos.x, pl.pos.z)) { moveX = dx / dP; moveZ = dz / dP; }
        else if (Flow.dir(this.pos.x, this.pos.z, _v3)) { moveX = _v3.x; moveZ = _v3.z; }
        else { moveX = dx / dP; moveZ = dz / dP; }
        sp = d.speed * (G.wave && G.wave.frenzy ? 1.15 : 1);
        this.yaw = dampAngle(this.yaw, Math.atan2(moveX, moveZ), 10, dt);
        if (d.puddleEvery) { this.puddleT -= dt; if (this.puddleT <= 0) { this.puddleT = d.puddleEvery * rand(0.8, 1.3); Decals.add('puddle', this.pos.x, this.pos.z, 0.85, pick([0xff6fae, 0x8ae0c0, 0xffd34a]), 7, { slow: 0.5 }); Sfx.play('splat', this.pos.x, this.pos.z, 0.4); } }
        if (this.type === 'ghost') { this.blinkCd -= dt; if (this.blinkCd <= 0 && dP > 3.2 && dP < 11) { this.setState('blinkOut'); Sfx.play('blink', this.pos.x, this.pos.z); } }
        break;
      }
      case 'keep': { // ranged imps
        if (this.stagger > 0) break;
        const want = d.keep;
        if (dP < want - 1.5) { moveX = -dx / dP; moveZ = -dz / dP; }
        else if (dP > want + 1.5) {
          if (W.los(this.pos.x, this.pos.z, pl.pos.x, pl.pos.z)) { moveX = dx / dP; moveZ = dz / dP; }
          else if (Flow.dir(this.pos.x, this.pos.z, _v3)) { moveX = _v3.x; moveZ = _v3.z; }
        } else { const s = Math.sin(this.seed) > 0 ? 1 : -1; moveX = -dz / dP * s; moveZ = dx / dP * s; }
        sp = d.speed * 0.85;
        this.yaw = dampAngle(this.yaw, toYaw, 8, dt);
        this.castT -= dt;
        if (this.castT <= 0 && dP < 12 && W.los(this.pos.x, this.pos.z, pl.pos.x, pl.pos.z)) { this.setState('cast'); Sfx.play('cast', this.pos.x, this.pos.z); }
        break;
      }
      case 'cast':
        this.yaw = dampAngle(this.yaw, toYaw, 10, dt);
        if (this.rig.parts.orb) this.rig.parts.orb.scale.setScalar((this.rig.parts.orb.userData.s0 || 1) * (1 + this.t * 2.5));
        if (this.t >= 0.55) {
          const lead = 0.35;
          const tx = pl.pos.x + pl.vel.x * lead, tz = pl.pos.z + pl.vel.z * lead;
          const a = Math.atan2(tx - this.pos.x, tz - this.pos.z);
          Projectiles.spawn({ owner: 'e', kind: 'fireball', x: this.pos.x + Math.sin(a) * 0.4, z: this.pos.z + Math.cos(a) * 0.4, y: 0.7, vx: Math.sin(a) * 7.5, vz: Math.cos(a) * 7.5, r: 0.2, dmg: d.dmg * this.dmgMul(), life: 3, shootable: true });
          Sfx.play('fire', this.pos.x, this.pos.z);
          if (this.rig.parts.orb) this.rig.parts.orb.scale.setScalar(this.rig.parts.orb.userData.s0 || 1);
          this.castT = d.castT * rand(0.8, 1.25);
          this.setState('keep');
        }
        break;
      case 'windup':
        this.yaw = dampAngle(this.yaw, Math.atan2(this.lungeDir.x, this.lungeDir.z), 12, dt);
        if (this.t < d.windup * 0.6 && dP > 0.3) this.lungeDir.set(dx / dP, 0, dz / dP);
        if (this.stagger > 0) { this.setState('chase'); break; }
        if (this.t >= d.windup) { this.setState('lunge'); this.hitDone = false; Sfx.play('enemyAttack', this.pos.x, this.pos.z, 0.75); }
        break;
      case 'lunge':
        moveX = this.lungeDir.x; moveZ = this.lungeDir.z; sp = d.lungeSpeed;
        if (!this.hitDone && pl.alive && dP < d.r + 0.42) { this.hitDone = true; Sfx.play('bite', this.pos.x, this.pos.z, 0.85); pl.hurt(d.dmg * this.dmgMul(), this.pos.x, this.pos.z, 7); }
        if (this.t >= d.lunge) this.setState('recover');
        break;
      case 'recover':
        if (this.t >= 0.45) this.setState('chase');
        break;
      case 'down':
        if (this.t > 2.0) { this.setState('revive'); Sfx.play('fwump', this.pos.x, this.pos.z); }
        break;
      case 'revive':
        if (this.t > 0.5) { this.hp = d.revive; this.revived = true; this.rig.parts.patch.visible = true; this.setState('chase'); Sfx.play('screech', this.pos.x, this.pos.z, 0.6); }
        break;
      case 'blinkOut':
        this.alpha = 1 - this.t / 0.3;
        if (this.t >= 0.3) {
          this.alpha = 0;
          // pick a spot near the player, preferably behind them
          const back = pl.yaw + Math.PI + rand(-1.0, 1.0), r = rand(2.2, 3.2);
          let tx = pl.pos.x + Math.sin(back) * r, tz = pl.pos.z + Math.cos(back) * r;
          const rm = ROOMS[G.arena || pl.room];
          if (rm) { tx = clamp(tx, rm.x0 + 0.8, rm.x1 - 0.8); tz = clamp(tz, rm.z0 + 0.8, rm.z1 - 0.8); }
          this.blinkTo = { x: tx, z: tz };
          this.blinkTele = Tele.circle(tx, tz, 0.7, 0.7, 0xffe080);
          this.setState('hidden');
        }
        break;
      case 'hidden':
        if (this.t >= 0.7) {
          this.pos.x = this.blinkTo.x; this.pos.z = this.blinkTo.z;
          this.setState('blinkIn'); Sfx.play('woo', this.pos.x, this.pos.z, 0.8);
        }
        break;
      case 'blinkIn':
        this.alpha = this.t / 0.3; this.yaw = toYaw;
        if (this.t >= 0.3) { this.alpha = 1; this.blinkCd = rand(3.5, 6); this.lungeDir.set(dx / (dP || 1), 0, dz / (dP || 1)); this.setState(dP < 3.5 ? 'windup' : 'chase'); this.t = 0.15; }
        break;
      case 'dying':
        this.rig.root.scale.setScalar(Math.max(0.01, 1 + this.t * 3));
        if (this.t > 0.08) this.finishDeath();
        break;
    }
    // perched on furniture (the critter from the photo): hop down when it starts moving
    if (this.perch > 0) {
      const moving = this.state !== 'cute' || Math.hypot(moveX, moveZ) * sp > 0.3;
      if (moving) {
        if (!this.hopTo) {
          let best = null, bd = 1e9;
          for (let a = 0; a < 16; a++) for (const rr of [0.8, 1.3, 1.8]) {
            const x = this.pos.x + Math.cos(a / 16 * TAU) * rr, z = this.pos.z + Math.sin(a / 16 * TAU) * rr;
            if (!Flow.free(x, z)) continue;
            const dd = dist(x, z, Player.pos.x, Player.pos.z) * 0.1 + rr;
            if (dd < bd) { bd = dd; best = { x, z }; }
          }
          this.hopTo = best || { x: this.pos.x, z: this.pos.z };
          this.perch0 = this.perch; this.hopT = 0;
          Sfx.play('hop', this.pos.x, this.pos.z);
        }
        this.hopT += dt;
        const k = clamp(this.hopT / 0.4, 0, 1);
        this.pos.x = lerp(this.pos.x, this.hopTo.x, k); this.pos.z = lerp(this.pos.z, this.hopTo.z, k);
        this.perch = Math.max(0, this.perch0 * (1 - k) + Math.sin(k * Math.PI) * 0.35);
        if (k >= 1) this.perch = 0;
        this.animate(dt, 0);
        return;
      }
    }
    // integrate
    if (sp > 0 && this.stagger <= 0) {
      const k = this.state === 'lunge' ? 1 : 1 - Math.exp(-10 * dt);
      this.vel.x = lerp(this.vel.x, moveX * sp, k); this.vel.z = lerp(this.vel.z, moveZ * sp, k);
    } else { this.vel.x = damp(this.vel.x, 0, 8, dt); this.vel.z = damp(this.vel.z, 0, 8, dt); }
    if (this.state !== 'hidden') {
      this.pos.x += this.vel.x * dt; this.pos.z += this.vel.z * dt;
      if (!d.fly && !(this.perch > 0)) W.collide(this.pos, d.r * 0.85);
      const rm = G.arena ? ROOMS[G.arena] : null;
      if (rm) { this.pos.x = clamp(this.pos.x, rm.x0 + d.r, rm.x1 - d.r); this.pos.z = clamp(this.pos.z, rm.z0 + d.r, rm.z1 - d.r); }
    }
    const speed = Math.hypot(this.vel.x, this.vel.z);
    if (!d.fly && this.perch <= 0 && speed > 0.65 && (this.state === 'chase' || this.state === 'keep' || this.state === 'lunge')) {
      this.stepT -= dt;
      if (this.stepT <= 0) { Sfx.play('enemyStep', this.pos.x, this.pos.z, clamp(speed / 3, 0.45, 0.85)); this.stepT = rand(0.42, 0.62); }
    } else this.stepT = Math.min(this.stepT, 0.12);
    this.animate(dt, speed);
  }

  dmgMul() { return 1 + (G.level >= 3 ? 0.1 : 0); }

  // ---- the VHS swarm (TVSmash). They fly in their own room: circle you while you are in it (and the TV while
  // you are not), now and then one rears up, jaw open, and dives at you. Never part of a wave
  initSwarm() {
    // (the tapes belong to the living room: a bonus swarm, never part of a wave. Moths belong to the fight they came
    // out of)
    this.bonus = this.type === 'vhs'; this.home = this.type === 'vhs' ? 'living' : (G.arena || Player.room || 'bedroom');
    this.dazzle = 0;
    this.alt = 0; this.altBase = rand(-0.12, 0.42);
    this.orbA = rand(0, TAU); this.orbW = (Math.random() < 0.5 ? -1 : 1) * rand(1.1, 1.9); this.orbR = rand(1.6, 2.7);
    this.diveCd = rand(1.4, 3.2); this.chatterT = rand(1.5, 4.5);
    this.bank = 0; this.pitch = 0;
    this.burstDir = new THREE.Vector3(0, 0, 1);
    this.rig.root.rotation.order = 'YXZ'; // yaw, then pitch and roll about its own axes (it banks into turns)
    this.blob = blobShadow(); Render.scene.add(this.blob);
  }

  updateSwarm(dt) {
    const d = this.def, pl = Player;
    this.t += dt;
    this.flashT = Math.max(0, this.flashT - dt);
    if (this.stagger > 0) this.stagger -= dt;
    const dx = pl.pos.x - this.pos.x, dz = pl.pos.z - this.pos.z, dP = Math.hypot(dx, dz) || 1e-3;
    const rm = ROOMS[this.home];
    const hunt = pl.alive && Player.control && pl.room === this.home;
    let tx = this.pos.x, tz = this.pos.z, sp = 0, faceYaw = null, altT = this.altBase;
    switch (this.state) {
      case 'burst': {
        // shot out of the screen: fast and straight, a little up, then it finds its place in the circle
        tx = this.pos.x + this.burstDir.x; tz = this.pos.z + this.burstDir.z;
        sp = lerp(d.speed * 2.3, d.speed * 0.9, clamp(this.t / 0.6, 0, 1));
        faceYaw = Math.atan2(this.burstDir.x, this.burstDir.z);
        altT = this.altBase + 0.3;
        if (this.t >= 0.6) { this.setState('chase'); this.orbA = Math.atan2(this.pos.z - pl.pos.z, this.pos.x - pl.pos.x); }
        break;
      }
      case 'chase': {
        const moth = this.type === 'moth';
        // moths can't resist the flashlight: lit, they dance in the beam in front of you instead of diving at you
        if (moth) {
          const lit = pl.hasFlashlight && pl.spot.intensity > 20 && pl.inBeam(this.pos.x, this.pos.z, 9.5);
          this.dazzle = clamp(this.dazzle + (lit ? dt * 2.5 : -dt * 0.7), 0, 1);
        }
        const dz_ = moth && this.dazzle > 0.5;
        this.orbA += this.orbW * dt * (dz_ ? 1.8 : 1);
        let cx, cz;
        if (dz_) { cx = pl.pos.x + Math.sin(pl.yaw) * 3.4; cz = pl.pos.z + Math.cos(pl.yaw) * 3.4; }
        else if (hunt) { cx = pl.pos.x; cz = pl.pos.z; }
        else if (moth) { cx = (rm.x0 + rm.x1) / 2; cz = (rm.z0 + rm.z1) / 2; }
        else { cx = TVSmash.X; cz = TVSmash.Z + 2.0; }
        const R = dz_ ? 0.55 + Math.sin(this.t * 3.1 + this.seed) * 0.3 : (hunt ? this.orbR : this.orbR * 0.6) + Math.sin(this.t * 1.7 + this.seed) * 0.35;
        tx = cx + Math.cos(this.orbA) * R; tz = cz + Math.sin(this.orbA) * R;
        sp = d.speed * (dz_ ? 0.8 : 1);
        altT = this.altBase + Math.sin(this.t * (dz_ ? 5.3 : 2.3) + this.seed) * (dz_ ? 0.22 : 0.12);
        if (dz_) this.diveCd = Math.max(this.diveCd, rand(0.5, 1.2));
        if (hunt) {
          this.diveCd -= dt;
          const divers = moth ? G.enemies.reduce((n, e) => n + (e.type === 'moth' && !e.dead && (e.state === 'windup' || e.state === 'lunge') ? 1 : 0), 0) : TVSmash.divers();
          if (this.diveCd <= 0 && dP < d.range && divers < 2) { this.setState('windup'); this.lungeDir.set(dx / dP, 0, dz / dP); Sfx.play(moth ? 'flutter' : 'tapeHiss', this.pos.x, this.pos.z, 0.8); }
          this.chatterT -= dt;
          if (this.chatterT <= 0) { this.chatterT = rand(2.5, 6); Sfx.play(moth ? 'flutter' : 'tapeChatter', this.pos.x, this.pos.z, 0.5, { pitch: rand(0.85, 1.2) }); }
        }
        break;
      }
      case 'windup':
        // rears up with the jaw open, tracking you, then comes in straight
        faceYaw = Math.atan2(dx, dz);
        if (this.t < d.windup * 0.7) this.lungeDir.set(dx / dP, 0, dz / dP);
        altT = this.altBase + 0.28;
        if (this.stagger > 0 || !hunt) { this.setState('chase'); this.diveCd = rand(1.5, 2.5); break; }
        if (this.t >= d.windup) { this.setState('lunge'); this.hitDone = false; Sfx.play('enemyAttack', this.pos.x, this.pos.z, 0.72); }
        break;
      case 'lunge':
        tx = this.pos.x + this.lungeDir.x; tz = this.pos.z + this.lungeDir.z; sp = d.lungeSpeed;
        faceYaw = Math.atan2(this.lungeDir.x, this.lungeDir.z);
        altT = -0.2;
        if (!this.hitDone && pl.alive && dP < d.r + 0.45) { this.hitDone = true; Sfx.play('bite', this.pos.x, this.pos.z, 0.8); pl.hurt(d.dmg * this.dmgMul(), this.pos.x, this.pos.z, 4); }
        if (this.t >= d.lunge) this.setState('recover');
        break;
      case 'recover':
        // pulls out and up, back into the circle
        tx = this.pos.x - this.lungeDir.x; tz = this.pos.z - this.lungeDir.z; sp = d.speed * 0.5;
        faceYaw = Math.atan2(this.lungeDir.x, this.lungeDir.z);
        if (this.t >= 0.45) { this.setState('chase'); this.diveCd = rand(2.2, 4.8); this.orbA = Math.atan2(this.pos.z - pl.pos.z, this.pos.x - pl.pos.x); }
        break;
      case 'dying':
        this.rig.root.scale.setScalar(Math.max(0.01, 1 + this.t * 3));
        if (this.t > 0.08) { this.finishDeath(); return; }
        break;
    }
    // steer: soft swoops around the circle, straight lines in and out
    if (sp > 0 && this.stagger <= 0) {
      let vx = tx - this.pos.x, vz = tz - this.pos.z;
      const l = Math.hypot(vx, vz), s = this.state === 'chase' ? sp * Math.min(1, l / 1.2) : sp;
      if (l > 1e-4) { vx = vx / l * s; vz = vz / l * s; } else { vx = 0; vz = 0; }
      const k = this.state === 'lunge' ? 1 : 1 - Math.exp(-(this.state === 'burst' ? 6 : 3.5) * dt);
      this.vel.x = lerp(this.vel.x, vx, k); this.vel.z = lerp(this.vel.z, vz, k);
    } else { this.vel.x = damp(this.vel.x, 0, 6, dt); this.vel.z = damp(this.vel.z, 0, 6, dt); }
    this.pos.x += this.vel.x * dt; this.pos.z += this.vel.z * dt;
    // they stay in their room
    const m = 0.45;
    if (this.pos.x < rm.x0 + m) { this.pos.x = rm.x0 + m; this.vel.x = Math.max(0, this.vel.x); }
    if (this.pos.x > rm.x1 - m) { this.pos.x = rm.x1 - m; this.vel.x = Math.min(0, this.vel.x); }
    if (this.pos.z < rm.z0 + m) { this.pos.z = rm.z0 + m; this.vel.z = Math.max(0, this.vel.z); }
    if (this.pos.z > rm.z1 - m) { this.pos.z = rm.z1 - m; this.vel.z = Math.min(0, this.vel.z); }
    // round anything taller than its flying height (the set it came out of, bookcases, the chimney), except while it
    // is still coming out of the screen
    if (this.state !== 'burst' || this.t > 0.12) W.collide(this.pos, d.r * 0.8, { minH: 1 + this.alt - 0.1 });
    // face where it flies (or its target), bank into the turns
    const spd = Math.hypot(this.vel.x, this.vel.z);
    const want = faceYaw != null ? faceYaw : spd > 0.3 ? Math.atan2(this.vel.x, this.vel.z) : Math.atan2(dx, dz);
    const py = this.yaw;
    this.yaw = dampAngle(this.yaw, want, faceYaw != null ? 12 : 6, dt);
    const rate = dt > 0 ? angDiff(py, this.yaw) / dt : 0;
    this.bank = damp(this.bank, clamp(-rate * 0.12, -0.32, 0.32), 5, dt);
    this.pitch = damp(this.pitch, this.state === 'lunge' ? 0.18 : clamp((altT - this.alt) * -0.6, -0.25, 0.25), 6, dt);
    this.alt = damp(this.alt, altT, this.state === 'lunge' ? 10 : 4, dt);
    this.animateSwarm(dt, spd);
  }

  animateSwarm(dt, speed) {
    const r = this.rig, A = r.anim, st = this.state, d = this.def;
    r.root.position.set(this.pos.x, this.alt, this.pos.z);
    r.root.rotation.set(this.pitch, this.yaw, this.bank);
    // (it comes out of the picture: grows to full size as it leaves the screen)
    if (st === 'burst') r.root.scale.setScalar(lerp(0.35, 1, clamp(this.t / 0.3, 0, 1)));
    else if (st !== 'dying' && r.root.scale.x !== 1) r.root.scale.setScalar(1);
    if (A) {
      let clip = 'Fly', fade = 0.2;
      const opts = {};
      if (st === 'burst') { clip = 'FlyFast'; opts.speed = 1.25; }
      else if (st === 'chase') { const fast = speed > 3.2; clip = fast ? 'FlyFast' : 'Fly'; opts.speed = fast ? clamp(speed / 4.4, 0.9, 1.3) : clamp(0.75 + speed * 0.12, 0.75, 1.25); fade = 0.25; }
      else if (st === 'windup') { clip = 'Windup'; fade = 0.08; opts.once = true; opts.speed = 0.3 / Math.max(0.1, d.windup); }
      else if (st === 'lunge') { clip = 'Lunge'; fade = 0.05; opts.once = true; opts.speed = 0.22 / Math.max(0.1, d.lunge); }
      else if (st === 'recover') { clip = 'Recover'; fade = 0.08; opts.once = true; }
      else if (st === 'dying') clip = A.curName || 'Fly';
      if (!A.play(clip, fade, opts)) A.play('Fly', fade);
      A.update(dt);
    } else if (r.head) r.head.position.y = 1.0 + Math.sin(G.time * 9 + this.seed) * 0.03;
    // hit flash; the reels burn while it winds up
    const f = this.flashT > 0 ? 1 : st === 'windup' ? Math.min(1, this.t / d.windup) * 0.6 : 0;
    for (const m of r.flash) {
      const b = m.userData.baseEmissive;
      if (b) m.emissive.copy(b); else m.emissive.setRGB(0, 0, 0);
      if (f > 0) m.emissive.lerp(_c1.setRGB(1, st === 'windup' ? 0.12 : 1, st === 'windup' ? 0.05 : 1), Math.min(1, f));
    }
    // its blob shadow: the shape of a cassette, softer and smaller the higher it flies
    if (this.blob) {
      const h = 1 + this.alt, k = clamp(1.25 - h * 0.3, 0.6, 1.1) * r.root.scale.x;
      this.blob.position.set(this.pos.x, 0.03, this.pos.z); this.blob.rotation.y = this.yaw;
      this.blob.scale.set(0.55 * k, 1, 0.36 * k);
    }
  }

  // a moth is swatted: a puff of wing dust and a few torn wing scales
  mothDeath() {
    const x = this.pos.x, z = this.pos.z, y = 1.15 + this.alt;
    Sfx.play('flutter', x, z, 0.7, { pitch: 1.3 }); Sfx.play('fwump', x, z, 0.35);
    FX.burst(x, y, z, 0xb8ab90, 16, 2.2, { size: 0.09, life: 1.3, grav: 0.6, drag: 2.2 });
    Chunks.spawn(x, y, z, 0x8a7a62, 4, 2.5, 0.06);
    Chunks.spawn(x, y, z, 0xc89a48, 2, 2.5, 0.05);
    if (this.killedBy === 'melee' && Player.stats.lifesteal) Player.heal(Player.stats.lifesteal);
    G.stats.kills++;
    if (Math.random() < 0.2) Pickups.spawn(Math.random() < 0.5 ? 'candy' : Pickups.ammoKind() || 'candy', x, z, true);
  }

  // a tape is done: the shell cracks open, magnetic tape everywhere, and whatever it was hiding drops out
  tapeDeath() {
    const x = this.pos.x, z = this.pos.z, y = 1 + this.alt;
    Sfx.play('tapeDie', x, z, 1, { pitch: rand(0.9, 1.15) });
    Chunks.spawn(x, y, z, 0x1a1a1e, 6, 3.5, 0.07);
    Chunks.spawn(x, y, z, 0xe6e0cc, 2, 3, 0.05);
    FX.burst(x, y, z, 0x3a2618, 14, 3, { size: 0.07, life: 1.1, grav: 3, drag: 2 });
    FX.sparks(x, y, z, 0xff4a2a, 6, 4);
    TapeSpill.spawn(x, y, z, this.vel.x, this.vel.z);
    if (this.killedBy === 'melee' && Player.stats.lifesteal) Player.heal(Player.stats.lifesteal);
    G.stats.kills++;
    const p = Pickups.spawn(TVSmash.dropKind(), x, z, true);
    p.y = Math.max(0, y - 0.5); p.vy = 2.2;
    TVSmash.onTapeGone(this);
  }

  animateGLB(dt, speed) {
    const r = this.rig, A = r.anim, t = G.time + this.seed, st = this.state, d = this.def;
    r.root.position.set(this.pos.x, this.perch || 0, this.pos.z);
    r.root.rotation.y = this.yaw;
    const L = CRIT_ANIM[this.type] || { walk: ['Walk', 1], run: ['Run', 3] };
    let clip = 'Idle', fade = 0.18, opts = {};
    const loco = () => {
      if (speed < 0.25) { clip = 'Idle'; return; }
      const run = speed > 1.7 && A.has(L.run[0]);
      const c = run ? L.run : L.walk;
      clip = A.has(c[0]) ? c[0] : 'Idle';
      opts.speed = clamp(speed / c[1], 0.6, 1.6);
    };
    switch (st) {
      case 'cute': case 'chase': case 'keep': case 'spawn': case 'recover': loco(); break;
      case 'windup': clip = 'Windup'; fade = 0.08; opts.once = true; opts.speed = 0.42 / Math.max(0.1, d.windup || 0.42); break;
      case 'lunge': clip = 'Lunge'; fade = 0.05; opts.once = true; break;
      case 'turn': clip = A.has('Shiver') ? 'Shiver' : 'Idle'; fade = 0.1; break;
      case 'cast': clip = A.has('Cast') ? 'Cast' : 'Windup'; fade = 0.1; opts.once = true; break;
      case 'down': clip = A.has('Down') ? 'Down' : 'Hurt'; fade = 0.12; opts.once = true; break;
      case 'revive': clip = A.has('Revive') ? 'Revive' : 'Idle'; fade = 0.1; opts.once = true; break;
      case 'blinkOut': case 'hidden': case 'blinkIn': loco(); break;
      case 'dying': clip = A.curName || 'Idle'; break;
    }
    if (st === 'recover' && this.t < 0.45 && A.has('Recover')) { clip = 'Recover'; opts = { once: true }; fade = 0.06; }
    if (!A.play(clip, fade, opts)) A.play('Idle', fade);
    A.update(dt);
    // procedural layers on top of the clip
    if (r.head) {
      if (st === 'cute') r.head.rotateZ(Math.sin(t * 1.3) * 0.3 * (Math.sin(t * 0.37) > 0 ? 1 : 0.3));
      else if (st === 'turn') { r.head.rotateZ((Math.random() - 0.5) * 0.4); r.root.position.x += (Math.random() - 0.5) * 0.06; }
    }
    if (this.type === 'ghost') {
      const a = this.alpha;
      for (const m of r.fade) { if (m.userData.baseOpacity == null) m.userData.baseOpacity = m.opacity; m.transparent = true; m.opacity = m.userData.baseOpacity * a; m.depthWrite = a > 0.98; }
      if (r.parts.core) r.parts.core.material.opacity = 0.55 * a;
      r.root.visible = a > 0.01;
    }
    // hit flash / windup glow
    const f = this.flashT > 0 ? 1 : st === 'windup' ? Math.min(1, this.t / (d.windup || 0.4)) * 0.6 : 0;
    for (const m of r.flash) {
      const b = m.userData.baseEmissive;
      if (b) m.emissive.copy(b); else m.emissive.setRGB(0, 0, 0);
      if (f > 0) m.emissive.lerp(_c1.setRGB(1, st === 'windup' ? 0.12 : 1, st === 'windup' ? 0.05 : 1), Math.min(1, f));
    }
  }

  animate(dt, speed) {
    if (this.rig.glb) { this.animateGLB(dt, speed); return; }
    const r = this.rig, p = r.parts, t = G.time + this.seed;
    r.root.position.set(this.pos.x, this.perch || 0, this.pos.z);
    r.root.rotation.y = this.yaw;
    let by = 0, sy = 1, rz = 0, rx = 0;
    if (this.type === 'pumpkin') {
      const hop = Math.abs(Math.sin(t * (speed > 0.5 ? 9 : 4)));
      by = hop * (speed > 0.5 ? 0.22 : 0.06); sy = 1 - (1 - hop) * 0.12 + hop * 0.04;
      if (speed > 0.5 && hop < 0.15 && this.state === 'chase' && Math.random() < 0.1) Sfx.play('hop', this.pos.x, this.pos.z, 0.5);
    } else if (this.type === 'candy') {
      rz = Math.sin(t * 10) * 0.18 * Math.min(1, speed); by = Math.abs(Math.sin(t * 10)) * 0.05;
      if (p.wrap1) { p.wrap1.rotation.x = Math.sin(t * 14) * 0.6; p['wrap-1'].rotation.x = -Math.sin(t * 14) * 0.6; }
    } else if (this.type === 'stitch') {
      rz = Math.sin(t * 8) * 0.14 * Math.min(1, speed + 0.2);
      if (p.arms) { p.arms[0].rotation.x = Math.sin(t * 8) * 0.8; p.arms[1].rotation.x = -Math.sin(t * 8) * 0.8; }
    } else if (this.type === 'ghost') {
      by = 0.3 + Math.sin(t * 2.4) * 0.1; rz = Math.sin(t * 1.7) * 0.1;
      const a = this.alpha * 0.92;
      p.bodyMat.opacity = a; r.face.material.opacity = this.alpha; r.face.visible = this.alpha > 0.1;
      p.core.material.opacity = 0.55 * this.alpha;
      r.root.visible = this.alpha > 0.01;
    } else {
      by = Math.abs(Math.sin(t * 12)) * 0.05 * Math.min(1, speed);
      if (p.arms) { p.arms[0].rotation.x = Math.sin(t * 12) * 0.7 * Math.min(1, speed); p.arms[1].rotation.x = (this.state === 'windup' || this.state === 'cast') ? -2.2 : -Math.sin(t * 12) * 0.7 * Math.min(1, speed); }
      if (p.tail) p.tail.rotation.y = Math.sin(t * 6) * 0.5;
    }
    if (this.state === 'windup') { sy = 1 - Math.min(1, this.t / this.def.windup) * 0.25; rx = -0.25; }
    if (this.state === 'lunge') { rx = 0.35; sy = 1.1; }
    if (this.state === 'cute') r.head.rotation.z = Math.sin(t * 1.3) * 0.35 * (Math.sin(t * 0.37) > 0 ? 1 : 0.3);
    else if (this.state === 'turn') { r.head.rotation.z = (Math.random() - 0.5) * 0.4; r.root.position.x += (Math.random() - 0.5) * 0.08; }
    else r.head.rotation.z = damp(r.head.rotation.z, 0, 8, dt);
    if (this.state === 'down' || this.state === 'revive') {
      const k = this.state === 'down' ? Math.min(1, this.t * 5) : 1 - Math.min(1, this.t * 2);
      rx = -k * 1.45; by = 0.05;
    }
    r.body.position.y = by; r.body.scale.y = sy; r.body.rotation.z = rz; r.body.rotation.x = rx;
    // hit flash / windup glow
    const f = this.flashT > 0 ? 1 : this.state === 'windup' ? Math.min(1, this.t / this.def.windup) * 0.6 : 0;
    for (const m of r.flash) m.emissive.setRGB(f, this.state === 'windup' ? f * 0.1 : f, this.state === 'windup' ? f * 0.05 : f);
  }

  hurt(dmg, kx, kz, kb, src) {
    if (!this.targetable()) return;
    if (Player.stats.beam && Player.inBeam(this.pos.x, this.pos.z)) dmg *= 1.2;
    if (this.type === 'moth' && this.dazzle > 0.5) dmg *= 1.5;
    if (this.state === 'cute') { G.wave && (G.wave.aggro = true); }
    this.hp -= dmg; this.flashT = 0.1;
    if (this.rig.anim) this.rig.anim.flinch('Hurt', 0.9);
    this.vel.x += kx * kb; this.vel.z += kz * kb;
    if (src === 'melee' || src === 'pellet' || src === 'bomb') { this.stagger = 0.18; if (this.state === 'windup') this.setState('chase'); }
    Sfx.play(this.type === 'stitch' ? 'fwump' : 'hitSoft', this.pos.x, this.pos.z, 0.6);
    if (this.hp <= 0) {
      if (this.type === 'stitch' && !this.revived && src !== 'boss' && this.state !== 'down' && this.state !== 'revive') {
        this.setState('down'); this.vel.set(kx * 3, 0, kz * 3);
        FX.burst(this.pos.x, 0.5, this.pos.z, 0xf4f0e6, 14, 2.5, { size: 0.12, life: 1.2, grav: 4 });
        Sfx.play('fwump', this.pos.x, this.pos.z);
        this.hp = 1; this.downed = true;
        return;
      }
      this.die(src);
    }
  }

  die(src) {
    if (this.dead) return;
    this.setState('dying');
    this.killedBy = src;
  }

  finishDeath() {
    this.dead = true;
    Render.scene.remove(this.rig.root);
    if (this.blob) { Render.scene.remove(this.blob); this.blob = null; }
    if (this.def.swarm) { if (this.type === 'moth') this.mothDeath(); else this.tapeDeath(); return; }
    const c = this.def.color;
    Sfx.play('pop', this.pos.x, this.pos.z);
    FX.burst(this.pos.x, 0.5, this.pos.z, c, 18, 4, { size: 0.12, life: 0.9 });
    Chunks.spawn(this.pos.x, 0.4, this.pos.z, c, this.type === 'ghost' ? 0 : 6, 4, 0.09);
    if (this.type === 'pumpkin') { FX.burst(this.pos.x, 0.4, this.pos.z, 0xffe0a0, 8, 3, { size: 0.06, life: 1.2 }); Decals.add('splat', this.pos.x, this.pos.z, 0.7, 0xc0601a, 9); }
    if (this.type === 'candy') { Chunks.spawn(this.pos.x, 0.4, this.pos.z, 0x8ae0c0, 4, 4, 0.07); Decals.add('puddle', this.pos.x, this.pos.z, 1.0, 0xff6fae, 6, { slow: 0.5 }); Sfx.play('crinkle', this.pos.x, this.pos.z); }
    if (this.type === 'stitch') FX.burst(this.pos.x, 0.5, this.pos.z, 0xf4f0e6, 16, 3, { size: 0.13, life: 1.4, grav: 3 });
    if (this.type === 'ghost') { FX.burst(this.pos.x, 0.6, this.pos.z, 0xffe8a0, 20, 3, { glow: true, size: 0.15, life: 0.8, grav: -1 }); Sfx.play('woo', this.pos.x, this.pos.z, 0.5); }
    if (this.type === 'sock') { FX.burst(this.pos.x, 0.45, this.pos.z, 0xf4f0e6, 14, 2.8, { size: 0.1, life: 1.2, grav: 3 }); Chunks.spawn(this.pos.x, 0.5, this.pos.z, 0x141414, 2, 3, 0.05); Sfx.play('fwump', this.pos.x, this.pos.z, 0.8); }
    if (this.type === 'devil' || this.type === 'imp') { FX.fire(this.pos.x, 0.4, this.pos.z, 10, 0.3, 0.35); FX.smoke(this.pos.x, 0.3, this.pos.z, 5, 0x1a1414, 0.6); Sfx.play('cackle', this.pos.x, this.pos.z, 0.6); }
    if (this.killedBy === 'melee' && Player.stats.lifesteal) Player.heal(Player.stats.lifesteal);
    G.stats.kills++;
    Waves.onKill(this);
  }

  remove() { this.dead = true; Render.scene.remove(this.rig.root); if (this.blob) { Render.scene.remove(this.blob); this.blob = null; } if (this.blinkTele) this.blinkTele.kill = true; }
}

// separation between critters
function separateCritters() {
  const list = G.enemies;
  for (let i = 0; i < list.length; i++) {
    const a = list[i]; if (a.dead || a.state === 'hidden') continue;
    for (let j = i + 1; j < list.length; j++) {
      const b = list[j]; if (b.dead || b.state === 'hidden') continue;
      const dx = b.pos.x - a.pos.x, dz = b.pos.z - a.pos.z, d2 = dx * dx + dz * dz, rr = a.def.r + b.def.r;
      if (d2 < rr * rr && d2 > 1e-6) { const d = Math.sqrt(d2), p = (rr - d) * 0.5; a.pos.x -= dx / d * p; a.pos.z -= dz / d * p; b.pos.x += dx / d * p; b.pos.z += dz / d * p; }
    }
    // keep off the player a little
    const pdx = a.pos.x - Player.pos.x, pdz = a.pos.z - Player.pos.z, pd = Math.hypot(pdx, pdz), pr = a.def.r + 0.3;
    if (pd < pr && pd > 1e-4 && a.state !== 'lunge') { a.pos.x += pdx / pd * (pr - pd); a.pos.z += pdz / pd * (pr - pd); }
  }
  for (const b of G.bosses) {
    for (const a of list) {
      if (a.dead || b.dead) continue;
      const dx = a.pos.x - b.pos.x, dz = a.pos.z - b.pos.z, d = Math.hypot(dx, dz), rr = a.def.r + b.r;
      if (d < rr && d > 1e-4) { a.pos.x += dx / d * (rr - d); a.pos.z += dz / d * (rr - d); }
    }
  }
}

// =====================================================================
//  WAVES
// =====================================================================
const Waves = {
  start(lv, room) {
    TVSmash.dismiss(); // (any tapes still flying around rewind themselves into the dark)
    G.wave = { lv, room, type: lv.minion, quota: lv.quota, spawned: 0, killed: 0, maxAlive: lv.maxAlive, aggro: false, spawnT: 1.5, active: true, weaponDropped: false, frenzy: false };
    Flow.build(room);
  },
  // initial cute batch around the room (during the photo event)
  spawnInitial(lv, room, n, avoid) {
    Flow.build(room);
    const pts = (lv.spots || []).slice();
    for (let i = 0; i < n; i++) {
      let p = pts.length ? pts.shift() : Flow.randomFree(2.5);
      if (avoid && dist(p.x, p.z, avoid.x, avoid.z) < 1.5) p = Flow.randomFree(2.5);
      const type = lv.minion === 'devil' ? (i % 3 === 2 ? 'imp' : 'devil') : lv.minion;
      const c = new Critter(type, p.x, p.z, 'cute');
      c.yaw = Math.atan2(Player.pos.x - p.x, Player.pos.z - p.z) + rand(-0.5, 0.5);
      G.enemies.push(c);
      if (G.wave) G.wave.spawned++;
    }
  },
  spawnOne(type, x, z, scary = true) {
    const c = new Critter(type, x, z, 'spawn');
    if (scary) c.setScary(true);
    G.enemies.push(c);
    FX.smoke(x, 0.2, z, 6, 0x1a1616, 0.7);
    FX.burst(x, 0.3, z, CRIT[type].color, 8, 2, { size: 0.08 });
    Sfx.play('pop', x, z, 0.5);
    return c;
  },
  alive() { return G.enemies.filter((e) => !e.dead && !e.bonus).length; },
  update(dt) {
    const w = G.wave;
    for (const e of G.enemies) e.update(dt);
    separateCritters();
    G.enemies = G.enemies.filter((e) => !e.dead);
    Flow.update(dt, Player.pos.x, Player.pos.z);
    if (!w || !w.active || !w.aggro) return;
    const alive = this.alive();
    if (w.spawned < w.quota) {
      w.spawnT -= dt;
      const pack = w.type === 'devil';
      if (w.spawnT <= 0 && (pack ? alive <= 2 : alive < w.maxAlive)) {
        const n = pack ? Math.min(5, w.quota - w.spawned) : 1;
        for (let i = 0; i < n; i++) {
          const p = Flow.randomFree(4.5);
          const type = w.type === 'devil' ? (i >= 3 ? 'imp' : 'devil') : w.type;
          this.spawnOne(type, p.x, p.z, true);
          w.spawned++;
        }
        w.spawnT = pack ? 1.2 : rand(0.6, 1.3);
      }
    }
    if (w.killed >= w.quota * 0.75) w.frenzy = true;
    UI.wave(Math.max(0, w.quota - w.killed));
    if (w.spawned >= w.quota && alive === 0 && w.killed >= w.quota) { w.active = false; Game.onWaveCleared(); }
  },
  onKill(e) {
    const w = G.wave;
    if (w && w.active) {
      w.killed++;
      // guaranteed weapon drop partway through
      const lv = w.lv;
      if (lv.weaponDrop && !w.weaponDropped && w.killed >= lv.weaponAt) {
        w.weaponDropped = true;
        Pickups.spawn(lv.weaponDrop, e.pos.x, e.pos.z, true);
        UI.toast('Something dropped a ' + ({ nailgun: 'nail gun', shotgun: 'shotgun', bombbag: 'bag of pumpkin bombs' }[lv.weaponDrop]) + '!', 2200);
        return;
      }
    }
    Pickups.rollDrop(e.pos.x, e.pos.z);
  },
  clear() { for (const e of G.enemies) e.remove(); G.enemies = []; G.wave = null; },
};

// =====================================================================
//  BOSSES: the true forms
// =====================================================================
const BOSS = {
  jack: { name: 'THE HOLLOW JACK', hp: 1150, r: 1.25, speed: 1.9, color: 0xe0701a, pitch: 1.0, minion: 'pumpkin' },
  maw: { name: 'THE CANDY MAW', hp: 1450, r: 1.35, speed: 1.5, color: 0xff6fae, pitch: 1.25, minion: 'candy' },
  stitches: { name: 'MOTHER STITCHES', hp: 1600, r: 1.3, speed: 1.6, color: 0x9a7048, pitch: 0.85, minion: 'stitch' },
  visitor: { name: 'THE BEDTIME VISITOR', hp: 1650, r: 0.95, speed: 2.1, color: 0xeae6dc, pitch: 0.7, minion: 'ghost' },
  uninvited: { name: 'THE UNINVITED', hp: 2700, r: 1.35, speed: 2.25, color: 0xc0261c, pitch: 0.6, minion: 'devil' },
  // the side haunt behind the bedroom wardrobe doors (Boogey): its hp grows with the night (see the Boss constructor)
  boogey: { name: 'THE BOOGEYMAN', hp: 700, r: 1.0, speed: 1.85, color: 0x3a4231, pitch: 0.8, minion: 'sock', side: true },
};

function* wait(sec) { let t = 0; while (t < sec) t += yield; }

// temporary visual effects (falling needles, decoy eyes, whips)
const Temp = {
  list: [],
  add(obj, fn, life) { Render.scene.add(obj); this.list.push({ obj, fn, life, t: 0 }); return obj; },
  update(dt) {
    let dead = 0;
    for (const e of this.list) { e.t += dt; if (e.fn) e.fn(e, dt); if (e.t >= e.life || e.kill) dead++; }
    if (!dead) return;
    for (const e of this.list) if (e.t >= e.life || e.kill) Render.scene.remove(e.obj);
    compact(this.list, (e) => !(e.t >= e.life || e.kill));
  },
  clear() { for (const e of this.list) Render.scene.remove(e.obj); this.list = []; },
};

class Boss {
  constructor(type, x, z) {
    this.type = type; this.def = BOSS[type];
    this.maxHp = (type === 'boogey' ? this.def.hp + 180 * G.level : this.def.hp) * (SETTINGS.easy ? 0.85 : 1); this.hp = this.maxHp;
    this.r = this.def.r;
    this.rig = buildBoss(type);
    Render.scene.add(this.rig.root);
    this.pos = new THREE.Vector3(x, 0, z); this.vel = new THREE.Vector3();
    this.yaw = Math.atan2(Player.pos.x - x, Player.pos.z - z);
    this.state = 'intro'; this.t = 0; this.atk = null; this.cd = 1.2; this.phase = 1;
    this.flashT = 0; this.stunT = 0; this.staggerT = 0; this.touchCd = 0; this.hidden = false; this.dead = false;
    this.anim = null; this.animT = 0; this.last = null; this.lightsCd = 6; this.summonCd = 8; this.hideCd = 9; this.hides = 0;
    this.stuckT = 0; this.lastPos = new THREE.Vector3(x, 0, z);
    this.rig.root.position.set(x, -this.rig.height, z);
  }
  targetable() { return !this.dead && this.state === 'fight' && !this.hidden; }
  toPlayer() { return Math.atan2(Player.pos.x - this.pos.x, Player.pos.z - this.pos.z); }
  distP() { return dist(Player.pos.x, Player.pos.z, this.pos.x, this.pos.z); }
  room() { return ROOMS[G.arena] || ROOMS.hall; }

  update(dt) {
    if (this.dead) return;
    this.t += dt; this.animT += dt;
    this.flashT = Math.max(0, this.flashT - dt);
    this.touchCd = Math.max(0, this.touchCd - dt);
    if (this.state === 'intro' && this.type === 'boogey') {
      // it pours out of the wardrobe as a heap of old clothes and unfolds (the Emerge clip)
      const k = easeOut(clamp(this.t / 1.1, 0, 1));
      if (!this.from) this.from = this.pos.clone();
      const to = this.introTo || this.from;
      this.rig.root.position.set(lerp(this.from.x, to.x, k), 0, lerp(this.from.z, to.z, k));
      this.rig.root.rotation.y = this.yaw;
      if (this.t > 2.3) { this.pos.set(to.x, 0, to.z); this.state = 'fight'; this.t = 0; }
      this.animate(dt);
      return;
    }
    if (this.state === 'intro') {
      const k = clamp(this.t / 1.5, 0, 1);
      this.rig.root.position.set(this.pos.x + (Math.random() - 0.5) * 0.1 * (1 - k), lerp(-this.rig.height, 0, easeOut(k)), this.pos.z);
      this.rig.root.rotation.y = this.yaw;
      if (Math.random() < 0.6) { Particles.dust.emit(this.pos.x + rand(-1.5, 1.5), 0.1, this.pos.z + rand(-1.5, 1.5), rand(-1, 1), rand(2, 5), rand(-1, 1), 0.95, 0.93, 0.88, 1, 0.12, 1.4, 3, 1); }
      if (this.t > 1.6) { this.state = 'fight'; this.t = 0; }
      this.animate(dt);
      return;
    }
    if (this.state === 'dying') {
      this.rig.root.position.x = this.pos.x + (Math.random() - 0.5) * 0.25;
      this.rig.root.position.z = this.pos.z + (Math.random() - 0.5) * 0.25;
      this.flashT = Math.random() < 0.3 ? 0.05 : 0;
      if (Math.random() < 0.35) FX.burst(this.pos.x + rand(-1, 1), rand(0.5, this.rig.height), this.pos.z + rand(-1, 1), this.def.color, 8, 4, { glow: true, size: 0.2, life: 0.5 });
      this.animate(dt);
      if (this.t > 2.0) this.finish();
      return;
    }
    // fight
    const pl = Player;
    if (this.stunT > 0) {
      this.stunT -= dt;
      if (Math.random() < 0.3) Particles.glow.emit(this.pos.x + Math.cos(this.animT * 6) * 0.8, this.rig.height + 0.2, this.pos.z + Math.sin(this.animT * 6) * 0.8, 0, 0, 0, 1, 1, 0.6, 1, 0.2, 0.3, 0, 0);
      this.vel.x = damp(this.vel.x, 0, 6, dt); this.vel.z = damp(this.vel.z, 0, 6, dt);
    } else if (this.staggerT > 0) {
      this.staggerT -= dt;
    } else if (this.atk) {
      const r = this.atk.next(dt);
      if (r.done) { this.atk = null; this.cd = rand(0.55, 1.2) * (this.phase >= 2 ? 0.75 : 1) * (this.phase >= 3 ? 0.8 : 1) * (this.type === 'boogey' ? 1.4 : 1); this.anim = null; }
    } else {
      // move between attacks
      const d = this.distP(), a = this.toPlayer();
      const want = this.type === 'visitor' ? 4.5 : this.type === 'maw' ? 5 : this.type === 'boogey' ? 3.4 : 2.6;
      let mx = 0, mz = 0;
      if (d > want + 0.6) { mx = Math.sin(a); mz = Math.cos(a); }
      else if (d < want - 1.5 && this.type !== 'jack') { mx = -Math.sin(a); mz = -Math.cos(a); }
      else { const s = Math.sin(this.animT * 0.4) > 0 ? 1 : -1; mx = Math.cos(a) * s * 0.6; mz = -Math.sin(a) * s * 0.6; }
      const sp = this.def.speed * (this.phase >= 2 ? 1.15 : 1);
      this.vel.x = damp(this.vel.x, mx * sp, 5, dt); this.vel.z = damp(this.vel.z, mz * sp, 5, dt);
      this.yaw = dampAngle(this.yaw, a, 5, dt);
      this.cd -= dt;
      this.lightsCd -= dt; this.summonCd -= dt; this.hideCd -= dt;
      if (this.cd <= 0) this.atk = this.choose();
    }
    if (!this.hidden) {
      this.pos.x += this.vel.x * dt; this.pos.z += this.vel.z * dt;
      this.collideWorld();
    }
    // touching the boss hurts a little
    if (!this.hidden && pl.alive && this.touchCd <= 0 && this.distP() < this.r + 0.32) { this.touchCd = 0.9; pl.hurt(this.type === 'boogey' ? 6 : 8, this.pos.x, this.pos.z, 9); }
    // push player out
    if (!this.hidden) {
      const dx = pl.pos.x - this.pos.x, dz = pl.pos.z - this.pos.z, dd = Math.hypot(dx, dz), rr = this.r + 0.33;
      if (dd < rr && dd > 1e-4) pl.safeMove(dx / dd * (rr - dd), dz / dd * (rr - dd));
    }
    // phases
    const f = this.hp / this.maxHp;
    if (this.type === 'uninvited') {
      if (this.phase === 1 && f < 0.66) this.phaseChange(2);
      else if (this.phase === 2 && f < 0.33) this.phaseChange(3);
    } else if (this.phase === 1 && f < 0.5) { this.phase = 2; Sfx.play('roar', this.pos.x, this.pos.z, 0.7, { pitch: this.def.pitch * 1.1 }); UI.toast(this.def.name.toLowerCase().replace(/^the /, 'the ') + ' is enraged', 1500); }
    this.ambientFX(dt);
    this.animate(dt);
  }

  collideWorld() {
    const before = _v1.set(this.pos.x, 0, this.pos.z);
    const bx = before.x, bz = before.z;
    let hit = W.collide(this.pos, this.r * 0.85);
    const rm = this.room();
    const cx = clamp(this.pos.x, rm.x0 + this.r, rm.x1 - this.r), cz = clamp(this.pos.z, rm.z0 + this.r, rm.z1 - this.r);
    if (cx !== this.pos.x || cz !== this.pos.z) hit = true;
    this.pos.x = cx; this.pos.z = cz;
    void bx; void bz;
    return hit;
  }

  phaseChange(p) {
    this.phase = p;
    if (this.atk) { this.atk.return(); this.atk = null; }
    this.atk = this.atkPhaseShift();
  }

  *atkPhaseShift() {
    this.anim = 'roar';
    Sfx.play('roar', this.pos.x, this.pos.z, 1, { pitch: 0.55 });
    Cam.shake(1.2);
    UI.flash(300, 0.5, '#ff3010');
    const tele = Tele.circle(this.pos.x, this.pos.z, 5.5, 1.0);
    yield* wait(1.0);
    if (this.distP() < 5.5) Player.hurt(16, this.pos.x, this.pos.z, 15);
    for (let i = 0; i < 40; i++) { const a = i / 40 * TAU; Particles.glow.emit(this.pos.x + Math.cos(a), 0.3, this.pos.z + Math.sin(a), Math.cos(a) * 12, 0.5, Math.sin(a) * 12, 1, 0.4, 0.1, 1, 0.4, 0.45, 0, 2); }
    Sfx.play('slam', this.pos.x, this.pos.z);
    UI.titleCard(this.phase === 2 ? 'IT REMEMBERS' : 'IT REMEMBERS EVERYTHING', this.phase === 2 ? 'the Uninvited borrows from its children' : 'lights out', 2200, 'boss');
    void tele;
    yield* wait(0.6);
  }

  choose() {
    const d = this.distP();
    const opts = [];
    const add = (name, w) => { if (w > 0) opts.push([name, name === this.last ? w * 0.35 : w]); };
    const minions = G.enemies.filter((e) => !e.dead && !e.bonus).length;
    switch (this.type) {
      case 'jack':
        add('charge', d > 3 ? 3 : 1.2); add('spit', 3);
        if (this.phase >= 2 && this.summonCd <= 0 && minions < 4) add('summon', 2.5);
        break;
      case 'maw':
        add('tongue', d < 11 ? 3.2 : 1); add('slam', 2.2); add('lob', 2);
        if (this.phase >= 2 && this.summonCd <= 0 && minions < 4) add('summon', 2);
        break;
      case 'stitches':
        add('yarn', 3); add('stomp', d < 4.5 ? 3 : 0.4);
        if (this.summonCd <= 0 && minions < 5) add('summon', 2.6);
        if (this.phase >= 2) add('needles', 2.4);
        break;
      case 'visitor':
        add('sweep', d < 5.5 ? 3.2 : 0.6); add('orbs', 2);
        if (this.lightsCd <= 0) add('lightsOut', 9);
        break;
      case 'uninvited':
        add('charge', d > 3 ? 2.5 : 1); add('fireFan', 2.6); add('chain', d < 11 ? 2.4 : 0.8);
        if (this.phase >= 2) { add('tar', 2); add('binds', 1.8); if (this.summonCd <= 0 && minions < 5) add('summon', 2.4); }
        if (this.phase >= 3) { add('needles', 1.8); if (this.lightsCd <= 0) add('lightsOut', 5); }
        break;
      case 'boogey': {
        const n = (t) => G.enemies.reduce((k, e) => k + (e.type === t && !e.dead ? 1 : 0), 0);
        add('lash', d < 10 ? 2.6 : 0.8); add('coatSweep', d < 5 ? 3.2 : 0.4); add('hangers', d > 3 ? 2.6 : 1.4);
        if (this.summonCd <= 0 && n('moth') < 4) add('moths', 2.0);
        if (this.summonCd <= 0 && n('sock') < 2) add('socks', 1.8);
        // the special: hide and seek in the wardrobes (always the move once it is ready)
        if (this.hideCd <= 0 && Shells.canPlay(this)) add('hide', 40);
        break;
      }
    }
    let tot = 0; for (const o of opts) tot += o[1];
    let r = Math.random() * tot, name = opts[0][0];
    for (const o of opts) { r -= o[1]; if (r <= 0) { name = o[0]; break; } }
    this.last = name;
    Sfx.play('bossAttack', this.pos.x, this.pos.z, 0.9);
    const U = this.type === 'uninvited';
    switch (name) {
      case 'charge': return this.atkCharge(U ? 15 : 13, this.phase >= 2 ? 2 : 1, U ? 22 : 20);
      case 'spit': return this.atkSpit(this.phase >= 2 ? 2 : 1, 7, 1.25, 9, 'seed', 10);
      case 'fireFan': return this.atkSpit(this.phase >= 3 ? 2 : 1, 9, 1.5, 8.5, 'fireball', 12);
      case 'tongue': return this.atkWhip('tongue', 11.5, 18);
      case 'chain': return this.atkWhip('chain', 12.5, 20);
      case 'slam': return this.atkCircles(3, 1.8, 1.0, 16, 'taffy');
      case 'needles': return this.atkCircles(U ? 6 : 5, 1.25, 1.1, 16, U ? 'pitchfork' : 'needle');
      case 'lob': return this.atkLob('goo', 4, 8);
      case 'tar': return this.atkLob('tar', 4, 10);
      case 'yarn': return this.atkYarn('yarn', this.phase >= 2 ? 5 : 3);
      case 'binds': return this.atkYarn('chain', 4);
      case 'stomp': return this.atkStomp(3.4, 18);
      case 'summon': return this.atkSummon();
      case 'sweep': return this.atkSweep(4.3, 0.95, 18);
      case 'orbs': return this.atkOrbs(this.phase >= 2 ? 4 : 3);
      case 'lightsOut': return this.atkLightsOut();
      case 'lash': return this.atkWhip('sleeve', 10.5, 12);
      case 'coatSweep': return this.atkSweep(3.8, 0.95, 13, 'coatSweep');
      case 'hangers': return this.atkHangers(this.phase >= 2 ? 4 : 3);
      case 'moths': return this.atkMoths(this.phase >= 2 ? 4 : 3);
      case 'socks': return this.atkSocks(2);
      case 'hide': return this.atkHide();
    }
    return this.atkSpit(1, 5, 1, 8, 'seed', 10);
  }

  // ---- attacks ----
  *atkCharge(speed, times, dmg) {
    for (let n = 0; n < times; n++) {
      let ang = this.toPlayer();
      const L = 16;
      const tele = Tele.line(this.pos.x, this.pos.z, ang, L, this.r * 1.7, 0.95);
      this.anim = 'rear';
      Sfx.play('charge', this.pos.x, this.pos.z, 0.8);
      let t = 0;
      try {
        while (t < 0.95) {
          const dt = yield; t += dt;
          if (t < 0.72) { ang = dampAngle(ang, this.toPlayer(), 8, dt); this.yaw = ang; }
          tele.m.position.set(this.pos.x, 0.05, this.pos.z);
          tele.m.rotation.z = Math.atan2(-Math.cos(ang), Math.sin(ang));
        }
      } finally { tele.kill = true; }
      this.anim = 'dash';
      let travel = 0, hit = false;
      Sfx.play('roar', this.pos.x, this.pos.z, 0.35, { pitch: this.def.pitch * 1.4 });
      while (travel < L) {
        const dt = yield;
        const step = speed * dt;
        this.pos.x += Math.sin(ang) * step; this.pos.z += Math.cos(ang) * step; travel += step;
        if (!hit && this.distP() < this.r + 0.5 && Player.alive) { hit = true; Player.hurt(dmg, this.pos.x, this.pos.z, 14); }
        if (Math.random() < 0.7) FX.smoke(this.pos.x, 0.1, this.pos.z, 1, 0x3a322c, 0.5);
        if (this.collideWorld()) {
          Cam.shake(1.0); Sfx.play('slam', this.pos.x, this.pos.z);
          FX.burst(this.pos.x + Math.sin(ang) * this.r, 1.2, this.pos.z + Math.cos(ang) * this.r, 0x8a7a6a, 14, 4, { size: 0.1 });
          if (this.type === 'jack' || this.type === 'uninvited') { this.stunT = this.type === 'jack' ? 1.7 : 1.1; UI.toast('It\'s dazed. Hit it!', 1100); }
          break;
        }
      }
      this.vel.set(0, 0, 0);
      this.anim = null;
      yield* wait(0.35);
      if (this.stunT > 0) return;
    }
  }

  mouthPos(out) {
    const h = this.type === 'maw' ? 1.5 : this.type === 'jack' ? 2.2 : this.type === 'uninvited' ? 2.4 : this.type === 'boogey' ? 2.25 : 2.2;
    out.set(this.pos.x + Math.sin(this.yaw) * this.r * 0.9, h, this.pos.z + Math.cos(this.yaw) * this.r * 0.9);
    return out;
  }

  *atkSpit(volleys, n, spread, speed, kind, dmg) {
    for (let v = 0; v < volleys; v++) {
      this.anim = 'spit';
      let t = 0;
      while (t < 0.6) { const dt = yield; t += dt; this.yaw = dampAngle(this.yaw, this.toPlayer(), 8, dt); if (this.rig.parts.glow) this.rig.parts.glow.material.opacity = this.rig.glb ? 0.35 + t : 0.7 + t; }
      const base = this.toPlayer() + (v % 2 ? spread / (n - 1) / 2 : 0);
      const m = this.mouthPos(_v2);
      for (let i = 0; i < n; i++) {
        const a = base + lerp(-spread / 2, spread / 2, n > 1 ? i / (n - 1) : 0.5);
        Projectiles.spawn({ owner: 'e', kind, x: m.x, z: m.z, y: 1.0, vx: Math.sin(a) * speed, vz: Math.cos(a) * speed, r: kind === 'fireball' ? 0.22 : 0.18, dmg, life: kind === 'seed' ? rand(0.75, 1.05) : 2.6, landOnEnd: kind === 'seed', shootable: kind === 'fireball' });
      }
      Sfx.play(kind === 'seed' ? 'spit' : 'fire', this.pos.x, this.pos.z);
      if (this.rig.parts.glow) this.rig.parts.glow.material.opacity = this.rig.glb ? 0.35 : 0.7;
      yield* wait(0.35);
    }
    this.anim = null;
    yield* wait(0.3);
  }

  *atkWhip(kind, len, dmg) {
    let ang = this.toPlayer();
    const tele = Tele.line(this.pos.x, this.pos.z, ang, len, 0.9, 0.75);
    const sleeve = kind === 'sleeve';
    this.anim = sleeve ? 'lash' : 'open';
    Sfx.play(kind === 'tongue' ? 'slurp' : sleeve ? 'whisper' : 'charge', this.pos.x, this.pos.z, 0.7);
    let t = 0;
    try {
      while (t < 0.75) {
        const dt = yield; t += dt;
        if (t < 0.55) { ang = dampAngle(ang, this.toPlayer(), 9, dt); this.yaw = ang; }
        tele.m.position.set(this.pos.x, 0.05, this.pos.z); tele.m.rotation.z = Math.atan2(-Math.cos(ang), Math.sin(ang));
      }
    } finally { tele.kill = true; }
    // whip object (the Boogeyman's: an impossibly long coat sleeve with a grey knitted glove at the end)
    const g = new THREE.Group();
    const col = kind === 'tongue' ? 0x141016 : sleeve ? 0x3a4231 : 0x5a5a62;
    const rr = kind === 'tongue' ? 0.09 : sleeve ? 0.1 : 0.06;
    const shaft = mk(Geo.cyl(rr, rr, 1, 6), Mat.lam(col), 0, 0, 0, g, { rx: Math.PI / 2, cast: false });
    const tip = mk(kind === 'tongue' ? Geo.sph(0.18, 6, 5) : sleeve ? Geo.sph(0.17, 7, 5) : Geo.torus(0.18, 0.05, 4, 8), Mat.lam(kind === 'tongue' ? 0x2a0a14 : sleeve ? 0x8a867e : 0x6a6a72), 0, 0, 0, g, { cast: false, sx: sleeve ? 0.8 : 1, sy: sleeve ? 0.55 : 1 });
    if (sleeve) for (let i = 0; i < 4; i++) mk(Geo.cyl(0.03, 0.022, 0.26, 4), Mat.lam(0x8a867e), (i - 1.5) * 0.065, 0, 0.18, tip, { rx: Math.PI / 2 - 0.25, cast: false });
    Render.scene.add(g);
    let L = 0, grabbed = false;
    const O = new THREE.Vector3();
    const place = () => {
      if (sleeve) { this.handPos(O); O.y = clamp(O.y, 1.0, 2.2); } else { this.mouthPos(O); O.y = kind === 'tongue' ? 1.4 : 1.8; }
      const ty = 1.0;
      const dx = Math.sin(ang) * L, dz = Math.cos(ang) * L;
      g.position.copy(O);
      g.lookAt(O.x + dx, ty, O.z + dz);
      const len3 = Math.hypot(L, O.y - ty);
      shaft.scale.y = Math.max(0.01, len3); shaft.position.z = len3 / 2;
      tip.position.z = len3;
    };
    Sfx.play('tongue', this.pos.x, this.pos.z);
    try {
      while (L < len) {
        const dt = yield;
        L += 30 * dt; place();
        const tx = this.pos.x + Math.sin(ang) * L, tz = this.pos.z + Math.cos(ang) * L;
        if (Player.alive && !(Player.dodgeT > 0) && dist(tx, tz, Player.pos.x, Player.pos.z) < 0.7) { grabbed = true; break; }
        if (W.rayHit(this.pos.x, this.pos.z, tx, tz) < 1) break;
      }
      if (grabbed) {
        UI.toast(kind === 'tongue' ? 'Caught by the licorice!' : sleeve ? 'Caught by the sleeve!' : 'Chained!', 900);
        const pl = Player;
        pl.grabbed = { x: pl.pos.x, z: pl.pos.z };
        let tt = 0;
        while (tt < 0.55) {
          const dt = yield; tt += dt;
          const k = clamp(tt / 0.55, 0, 1);
          const mx = this.pos.x + Math.sin(ang) * (this.r + 0.6), mz = this.pos.z + Math.cos(ang) * (this.r + 0.6);
          pl.grabbed.x = lerp(pl.grabbed.x, mx, k * 0.25 + 0.05); pl.grabbed.z = lerp(pl.grabbed.z, mz, k * 0.25 + 0.05);
          L = Math.max(0.2, dist(pl.pos.x, pl.pos.z, this.pos.x, this.pos.z) - this.r * 0.5); place();
        }
        pl.grabbed = null;
        pl.inv = 0;
        pl.hurt(dmg, this.pos.x, this.pos.z, 0);
        Sfx.play(kind === 'tongue' ? 'chomp' : 'slam', this.pos.x, this.pos.z);
        pl.vel.x = Math.sin(ang) * 12; pl.vel.z = Math.cos(ang) * 12;
        Cam.shake(0.8);
      }
      while (L > 0.1) { const dt = yield; L -= 34 * dt; place(); }
    } finally {
      Render.scene.remove(g);
      if (Player.grabbed) Player.grabbed = null;
    }
    this.anim = null;
    yield* wait(0.4);
  }

  *atkCircles(n, r, delay, dmg, kind) {
    const pl = Player, rm = this.room();
    const spots = [{ x: pl.pos.x + pl.vel.x * 0.4, z: pl.pos.z + pl.vel.z * 0.4 }];
    for (let i = 1; i < n; i++) { const a = rand(0, TAU), d = rand(1.8, 4.2); spots.push({ x: pl.pos.x + Math.cos(a) * d, z: pl.pos.z + Math.sin(a) * d }); }
    for (const s of spots) { s.x = clamp(s.x, rm.x0 + 0.8, rm.x1 - 0.8); s.z = clamp(s.z, rm.z0 + 0.8, rm.z1 - 0.8); Tele.circle(s.x, s.z, r, delay); }
    this.anim = 'raise';
    Sfx.play(kind === 'taffy' ? 'slurp' : 'cast', this.pos.x, this.pos.z, 0.7);
    // falling objects appear during the last part of the delay
    let t = 0, spawned = false;
    while (t < delay) {
      const dt = yield; t += dt;
      if (t > delay - 0.2 && this.anim === 'raise') this.anim = 'slam';
      if (!spawned && t > delay - 0.32 && kind !== 'taffy') {
        spawned = true;
        for (const s of spots) {
          const m = new THREE.Group();
          const hz = itemModel(kind === 'needle' ? 'Needle' : 'Pitchfork', { cast: false }); // origin at the floor tip, +Y up
          if (hz) m.add(hz);
          else if (kind === 'needle') { mk(Geo.cyl(0.06, 0.02, 2.4, 6), Mat.lam(0xc8ccd4), 0, 1.2, 0, m, { cast: false }); mk(Geo.torus(0.1, 0.03, 4, 8), Mat.lam(0xc8ccd4), 0, 2.45, 0, m, { cast: false }); }
          else { mk(Geo.cyl(0.04, 0.04, 2.2, 5), Mat.lam(0x3a2a1a), 0, 1.3, 0, m, { cast: false }); for (const fx of [-0.15, 0, 0.15]) mk(Geo.cone(0.04, 0.3, 4), Mat.lam(0x9a9aa0), fx, 0.1, 0, m, { rx: Math.PI, cast: false }); mk(Geo.box(0.36, 0.05, 0.05), Mat.lam(0x9a9aa0), 0, 0.25, 0, m, { cast: false }); }
          m.position.set(s.x, 7, s.z); m.rotation.z = rand(-0.15, 0.15);
          Temp.add(m, (e) => { const k = clamp(e.t / 0.32, 0, 1); e.obj.position.y = lerp(7, 0, k * k); if (e.t > 1.1) e.obj.position.y = -(e.t - 1.1) * 3; }, 1.6);
        }
      }
    }
    for (const s of spots) {
      if (pl.alive && dist(s.x, s.z, pl.pos.x, pl.pos.z) < r + 0.25) pl.hurt(dmg, s.x, s.z, 8);
      FX.burst(s.x, 0.2, s.z, kind === 'taffy' ? 0xff9ac8 : kind === 'pitchfork' ? 0xff6a2a : 0xd8d8e0, 10, 3.5, { size: 0.1, life: 0.6 });
      if (kind === 'taffy') Decals.add('puddle', s.x, s.z, r, pick([0xff6fae, 0x8ae0c0]), 7, { slow: 0.55 });
      if (kind === 'pitchfork') { const d2 = Decals.add('scorch', s.x, s.z, r * 0.8, 0, 3, { dps: 10 }); d2.fire = true; }
    }
    Sfx.play('slam', pl.pos.x, pl.pos.z, 0.8);
    Cam.shake(0.6);
    yield* wait(0.3);
    this.anim = null;
    yield* wait(0.15);
  }

  *atkLob(kind, n, dmg) {
    this.anim = 'spit';
    yield* wait(0.5);
    const pl = Player, rm = this.room();
    const m = this.mouthPos(_v2);
    for (let i = 0; i < n; i++) {
      let tx = pl.pos.x + (i ? rand(-3, 3) : pl.vel.x * 0.5), tz = pl.pos.z + (i ? rand(-3, 3) : pl.vel.z * 0.5);
      tx = clamp(tx, rm.x0 + 0.8, rm.x1 - 0.8); tz = clamp(tz, rm.z0 + 0.8, rm.z1 - 0.8);
      const T = rand(0.8, 1.05), g = 14, y0 = m.y;
      const vy = (0.2 - y0 + 0.5 * g * T * T) / T;
      Projectiles.spawn({ owner: 'e', kind, x: m.x, z: m.z, y: y0, vx: (tx - m.x) / T, vz: (tz - m.z) / T, vy, grav: g, r: 0.25, dmg, life: 3, color: kind === 'goo' ? pick([0xff6fae, 0x8ae0c0, 0xffd34a]) : undefined, puddleR: 1.25 });
      Tele.circle(tx, tz, 1.0, T, kind === 'goo' ? 0xff6fae : 0xff3a10);
    }
    Sfx.play('spit', this.pos.x, this.pos.z);
    this.anim = null;
    yield* wait(0.5);
  }

  *atkYarn(kind, n) {
    this.anim = 'throw';
    let t = 0;
    while (t < 0.5) { const dt = yield; t += dt; this.yaw = dampAngle(this.yaw, this.toPlayer(), 8, dt); }
    const base = this.toPlayer(), spread = 0.9;
    const m = this.mouthPos(_v2);
    for (let i = 0; i < n; i++) {
      const a = base + lerp(-spread / 2, spread / 2, n > 1 ? i / (n - 1) : 0.5);
      Projectiles.spawn({ owner: 'e', kind, x: m.x, z: m.z, y: 1.0, vx: Math.sin(a) * 8.5, vz: Math.cos(a) * 8.5, r: 0.24, dmg: kind === 'chain' ? 10 : 8, life: 2.2, bind: kind === 'chain' ? 0.75 : 0.9, shootable: true });
    }
    Sfx.play('yarn', this.pos.x, this.pos.z);
    this.anim = null;
    yield* wait(0.5);
  }

  *atkStomp(r, dmg) {
    const tele = Tele.circle(this.pos.x, this.pos.z, r, 0.85);
    tele.follow = this.pos;
    this.anim = 'raise';
    yield* wait(0.65);
    this.anim = 'slam';
    yield* wait(0.2);
    if (this.distP() < r + 0.2) Player.hurt(dmg, this.pos.x, this.pos.z, 13);
    for (let i = 0; i < 30; i++) { const a = i / 30 * TAU; Particles.dust.emit(this.pos.x + Math.cos(a) * 0.8, 0.2, this.pos.z + Math.sin(a) * 0.8, Math.cos(a) * 9, 0.6, Math.sin(a) * 9, 0.8, 0.75, 0.7, 0.7, 0.3, 0.45, 2, 3); }
    Sfx.play('slam', this.pos.x, this.pos.z); Cam.shake(0.9);
    yield* wait(0.3);
    this.anim = null;
    yield* wait(0.2);
  }

  *atkSummon() {
    this.anim = 'roar';
    this.summonCd = this.type === 'stitches' ? 11 : 14;
    Sfx.play(this.type === 'stitches' ? 'zip' : 'roar', this.pos.x, this.pos.z, 0.7, { pitch: this.def.pitch * 1.3 });
    yield* wait(0.6);
    const n = this.type === 'uninvited' ? 4 : 3;
    for (let i = 0; i < n; i++) {
      const a = this.yaw + (i - (n - 1) / 2) * 0.8;
      let x = this.pos.x + Math.sin(a) * (this.r + 1.0), z = this.pos.z + Math.cos(a) * (this.r + 1.0);
      const rm = this.room(); x = clamp(x, rm.x0 + 0.8, rm.x1 - 0.8); z = clamp(z, rm.z0 + 0.8, rm.z1 - 0.8);
      const type = this.type === 'uninvited' ? (i === n - 1 ? 'imp' : 'devil') : this.def.minion;
      Waves.spawnOne(type, x, z, true);
    }
    yield* wait(0.7);
    this.anim = null;
  }

  *atkSweep(r, half, dmg, tag = null) {
    let ang = this.toPlayer();
    const tele = Tele.cone(this.pos.x, this.pos.z, ang, r, half, 0.8);
    this.anim = tag || 'reach';
    Sfx.play('whisper', this.pos.x, this.pos.z, 0.6);
    let t = 0;
    try {
      while (t < 0.8) {
        const dt = yield; t += dt;
        if (t < 0.45) { ang = dampAngle(ang, this.toPlayer(), 7, dt); this.yaw = ang; }
        tele.m.position.set(this.pos.x, 0.05, this.pos.z); tele.m.rotation.z = Math.atan2(-Math.cos(ang), Math.sin(ang));
      }
    } finally { tele.kill = true; }
    const d = this.distP();
    if (Player.alive && d < r + 0.3 && Math.abs(angDiff(ang, this.toPlayer())) < half + 0.1) Player.hurt(dmg, this.pos.x, this.pos.z, 10);
    for (let i = 0; i < 12; i++) { const a = ang + lerp(-half, half, i / 11); Particles.glow.emit(this.pos.x + Math.sin(a) * r * 0.8, 1.0, this.pos.z + Math.cos(a) * r * 0.8, 0, 0, 0, 1, 0.9, 0.6, 0.5, 0.4, 0.25, 0, 0, 0.05); }
    Sfx.play('swing', this.pos.x, this.pos.z, 1.5);
    this.anim = tag || 'sweep';
    yield* wait(0.5);
    this.anim = null;
  }

  *atkOrbs(n) {
    this.anim = 'raise';
    yield* wait(0.5);
    for (let i = 0; i < n; i++) {
      const a = this.yaw + (i - (n - 1) / 2) * 0.9;
      Projectiles.spawn({ owner: 'e', kind: 'orb', x: this.pos.x + Math.sin(a), z: this.pos.z + Math.cos(a), y: 1.4, vx: Math.sin(a) * 4.2, vz: Math.cos(a) * 4.2, r: 0.25, dmg: 10, life: 6.5, homing: 1.7, shootable: true });
    }
    Sfx.play('woo', this.pos.x, this.pos.z);
    this.anim = null;
    yield* wait(0.6);
  }

  *atkLightsOut() {
    const room = G.arena;
    this.lightsCd = this.phase >= 2 ? 9 : 12.5;
    this.anim = 'raise';
    const decoys = [];
    try {
      Sfx.play('whisper', this.pos.x, this.pos.z);
      // flicker
      let t = 0;
      while (t < 0.7) { const dt = yield; t += dt; W.lightsOut[room] = Math.random() < 0.5 ? 1 : 0.2; if (Math.random() < 0.2) Sfx.play('flicker'); }
      W.lightsOut[room] = 1; G.flags.dark = true;
      Sfx.play('lightsOut');
      G.flags.flashFlicker = 0.5;
      // vanish
      this.hidden = true;
      this.rig.root.visible = false;
      Sfx.play('teleport', this.pos.x, this.pos.z);
      const rm = this.room();
      for (let i = 0; i < 3; i++) {
        const eg = new THREE.Group();
        for (const s of [-0.12, 0.12]) mk(Geo.sph(0.05, 5, 4), Mat.basic(0xffe680, { fog: false }), s, 0, 0, eg, { cast: false });
        mk(Geo.plane(0.8, 0.5), Mat.glow(0xffd860, 0.3), 0, 0, -0.05, eg, { cast: false, receive: false });
        eg.position.set(rand(rm.x0 + 1.5, rm.x1 - 1.5), rand(2.2, 2.9), rand(rm.z0 + 1.5, rm.z1 - 1.5));
        decoys.push(Temp.add(eg, (e) => { e.obj.lookAt(Player.pos.x, 2.5, Player.pos.z); e.obj.visible = Math.sin(e.t * 3 + e.obj.position.x) > -0.7; }, 8));
      }
      yield* wait(rand(1.3, 2.0));
      // reappear behind the player
      const pl = Player;
      const back = pl.yaw + Math.PI + rand(-0.6, 0.6);
      this.pos.x = clamp(pl.pos.x + Math.sin(back) * 2.6, rm.x0 + this.r, rm.x1 - this.r);
      this.pos.z = clamp(pl.pos.z + Math.cos(back) * 2.6, rm.z0 + this.r, rm.z1 - this.r);
      this.yaw = this.toPlayer();
      this.hidden = false; this.rig.root.visible = true;
      Sfx.play('whisper', this.pos.x, this.pos.z, 1.3);
      // grab with a chance to flinch him with the flashlight
      let ang = this.toPlayer();
      const tele = Tele.cone(this.pos.x, this.pos.z, ang, 3.4, 0.8, 0.85, 0xffe080);
      this.anim = 'reach';
      let flinched = false; t = 0;
      while (t < 0.85) {
        const dt = yield; t += dt;
        if (t < 0.5) { ang = dampAngle(ang, this.toPlayer(), 6, dt); this.yaw = ang; tele.m.rotation.z = Math.atan2(-Math.cos(ang), Math.sin(ang)); }
        if (Player.inBeam(this.pos.x, this.pos.z, 8)) { flinched = true; break; }
      }
      tele.kill = true;
      if (flinched) {
        Sfx.play('roar', this.pos.x, this.pos.z, 0.6, { pitch: 1.5 });
        UI.toast('The light hurts it!', 1100);
        this.staggerT = 1.2; this.hurt(60, 'light');
        FX.burst(this.pos.x, 2.4, this.pos.z, 0xffe8a0, 16, 3, { glow: true, size: 0.15, life: 0.5 });
      } else if (Player.alive && this.distP() < 3.6 && Math.abs(angDiff(ang, this.toPlayer())) < 0.9) {
        Player.hurt(this.type === 'uninvited' ? 22 : 20, this.pos.x, this.pos.z, 12);
      }
      yield* wait(0.8);
    } finally {
      W.lightsOut[room] = 0; G.flags.dark = false;
      for (const d of decoys) d.visible = false;
      Temp.list.forEach((e) => { if (decoys.includes(e.obj)) e.kill = true; });
      this.hidden = false; this.rig.root.visible = true;
      Sfx.play('lightsOn');
    }
    this.anim = null;
  }

  // ---- the Boogeyman ----
  handPos(out) { const h = this.rig.parts && this.rig.parts.handR; if (h) { h.getWorldPosition(out); return out; } return this.mouthPos(out); }

  // wire coat hangers flung in a fan: they spin out, curve, and come back to it like boomerangs
  *atkHangers(n) {
    this.anim = 'throw';
    let t = 0;
    while (t < 0.36) { const dt = yield; t += dt; this.yaw = dampAngle(this.yaw, this.toPlayer(), 8, dt); }
    const base = this.toPlayer(), spread = n >= 5 ? 1.7 : 1.2;
    const h = this.handPos(_v2);
    for (let i = 0; i < n; i++) {
      const k = n > 1 ? i / (n - 1) : 0.5, a = base + lerp(-spread / 2, spread / 2, k);
      const curve = (k - 0.5) * 2.6 + (Math.abs(k - 0.5) < 0.01 ? (Math.random() < 0.5 ? -0.9 : 0.9) : 0);
      Projectiles.spawn({ owner: 'e', kind: 'hanger', x: h.x, z: h.z, y: 1.25, yTo: 1.1, vx: Math.sin(a) * 8, vz: Math.cos(a) * 8, r: 0.3, dmg: 6, life: 3.8, shootable: true, boomerang: { boss: this, t: 0, out: 0.75, curve } });
    }
    Sfx.play('hanger', this.pos.x, this.pos.z);
    yield* wait(0.35);
    this.anim = null;
    yield* wait(0.3);
  }

  // the coat flaps open and moths pour out of it
  *atkMoths(n) {
    this.anim = 'roar'; this.summonCd = 12;
    Sfx.play('roar', this.pos.x, this.pos.z, 0.55, { pitch: 1.35 });
    yield* wait(0.4);
    Sfx.play('flutter', this.pos.x, this.pos.z, 1.3); Sfx.play('rustle', this.pos.x, this.pos.z);
    FX.burst(this.pos.x, 1.6, this.pos.z, 0xb8ab90, 30, 3.5, { size: 0.12, life: 1.6, grav: 0.4, drag: 2 });
    for (let i = 0; i < n; i++) {
      const a = this.yaw + (i - (n - 1) / 2) * 0.55 + rand(-0.2, 0.2);
      const c = new Critter('moth', this.pos.x + Math.sin(a) * 0.5, this.pos.z + Math.cos(a) * 0.5, 'burst');
      c.burstDir.set(Math.sin(a), 0, Math.cos(a)); c.alt = 0.35; c.yaw = a;
      G.enemies.push(c);
    }
    if (!G.flags.mothTip) { G.flags.mothTip = true; UI.toast('Moths! They can\'t resist your flashlight.', 2600); }
    yield* wait(0.6);
    this.anim = null;
  }

  // it shakes lost socks out of its coat: they land biting
  *atkSocks(n) {
    this.anim = 'raise'; this.summonCd = 12;
    Sfx.play('rustle', this.pos.x, this.pos.z); Sfx.play('chuckle', this.pos.x, this.pos.z, 0.8);
    yield* wait(0.55);
    const rm = this.room();
    for (let i = 0; i < n; i++) {
      const a = this.yaw + (i - (n - 1) / 2) * 0.9;
      const x = clamp(this.pos.x + Math.sin(a) * (this.r + 0.9), rm.x0 + 0.6, rm.x1 - 0.6), z = clamp(this.pos.z + Math.cos(a) * (this.r + 0.9), rm.z0 + 0.6, rm.z1 - 0.6);
      Waves.spawnOne('sock', x, z, true);
    }
    yield* wait(0.6);
    this.anim = null;
  }

  // out of a wardrobe and straight at you
  *atkPounce(dmg = 14) {
    let ang = this.toPlayer();
    const tele = Tele.cone(this.pos.x, this.pos.z, ang, 4.2, 0.55, 0.65, 0xffe080);
    this.anim = 'reach';
    let t = 0;
    try {
      while (t < 0.65) {
        const dt = yield; t += dt;
        if (t < 0.38) { ang = dampAngle(ang, this.toPlayer(), 6, dt); this.yaw = ang; }
        tele.m.position.set(this.pos.x, 0.05, this.pos.z); tele.m.rotation.z = Math.atan2(-Math.cos(ang), Math.sin(ang));
      }
    } finally { tele.kill = true; }
    Sfx.play('swing', this.pos.x, this.pos.z, 1.4);
    let tr = 0, hit = false;
    while (tr < 3.4) {
      const dt = yield; const st = 13 * dt;
      this.pos.x += Math.sin(ang) * st; this.pos.z += Math.cos(ang) * st; tr += st;
      if (!hit && Player.alive && this.distP() < this.r + 0.55) { hit = true; Player.hurt(dmg, this.pos.x, this.pos.z, 13); }
      if (this.collideWorld()) break;
    }
    this.vel.set(0, 0, 0);
    yield* wait(0.45);
    this.anim = null;
  }

  // out of hiding (a wardrobe) at x, z
  appearAt(x, z, yaw) {
    const rm = this.room();
    this.pos.set(clamp(x, rm.x0 + this.r, rm.x1 - this.r), 0, clamp(z, rm.z0 + this.r, rm.z1 - this.r));
    this.collideWorld();
    this.yaw = yaw; this.hidden = false; this.rig.root.visible = true; this.vel.set(0, 0, 0);
    this.rig.root.position.set(this.pos.x, 0, this.pos.z);
    FX.burst(this.pos.x, 1.2, this.pos.z, 0x4a4036, 16, 3, { size: 0.12, life: 1.0, grav: 2 });
  }

  // THE SPECIAL: hide and seek. It folds itself up and dives into a wardrobe, more wardrobes rise out of the floor
  // and shuffle; hit the one it is in. The flashlight makes it giggle. Right: it tumbles out dizzy. Wrong (or too
  // slow): moths and a sock burst out of the empty one and it jumps out of the real one at you
  *atkHide() {
    const n = this.phase >= 2 ? 4 : 3;
    const spots = Shells.layout(n);
    if (!spots) { this.hideCd = 4; return; }
    const first = this.hides === 0;
    this.hides++;
    this.hideCd = this.phase >= 2 ? 16 : 20;
    const room = G.arena;
    this.anim = 'hide';
    Sfx.play('chuckle', this.pos.x, this.pos.z, 1.2);
    if (first) UI.titleCard('HIDE AND SEEK', 'which wardrobe is he in?', 2200, 'boss');
    else UI.toast('Ready or not...', 1400);
    let t = 0;
    try {
      while (t < 0.8) { const dt = yield; t += dt; W.lightsOut[room] = Math.min(0.45, t * 0.6); }
      this.hidden = true; this.rig.root.visible = false; this.vel.set(0, 0, 0);
      FX.burst(this.pos.x, 0.6, this.pos.z, 0x3a4231, 16, 2.5, { size: 0.12, life: 0.9 });
      FX.smoke(this.pos.x, 0.3, this.pos.z, 8, 0x1a1a18, 0.8);
      Sfx.play('fwump', this.pos.x, this.pos.z);
      // the wardrobes rise, and it waves from the one it is in
      const real = Math.floor(Math.random() * n);
      Shells.start(spots, real, this);
      yield* until(() => Shells.risen());
      Shells.peek(1.7);
      Sfx.play('giggle', this.pos.x, this.pos.z, 1, { pitch: 0.55 });
      yield* wait(1.8);
      // the shuffle
      const swaps = this.phase >= 2 ? 6 : 4, dur = this.phase >= 2 ? 0.56 : 0.72;
      for (let k = 0; k < swaps; k++) {
        const i = Math.floor(Math.random() * n), j = (i + 1 + Math.floor(Math.random() * (n - 1))) % n;
        Shells.swap(i, j, dur);
        yield* until(() => !Shells.moving());
      }
      // pick one
      Shells.choosing = true; Shells.chosen = -1; Shells.urgency = 0;
      UI.toast(first ? 'Hit the wardrobe he is in! Your light makes him giggle.' : 'Which one?', first ? 3000 : 1400);
      t = 0;
      const limit = this.phase >= 2 ? 7.5 : 9;
      while (t < limit && Shells.chosen < 0) { const dt = yield; t += dt; Shells.urgency = t / limit; }
      Shells.choosing = false;
      const S = Shells.list, realS = S.find((s) => s.real), ch = Shells.chosen;
      const f = Shells.front(realS);
      if (ch >= 0 && S[ch] === realS) {
        // FOUND YOU: it tumbles out, dizzy
        Shells.burst(realS, false);
        this.appearAt(realS.x + f.x * 1.05, realS.z + f.z * 1.05, Math.atan2(f.x, f.z));
        W.lightsOut[room] = 0;
        UI.titleCard('FOUND YOU!', 'hit him while he is dizzy', 1800, 'clear');
        Sfx.play('roar', this.pos.x, this.pos.z, 0.6, { pitch: 1.7 });
        Shells.sinkAll(0.5);
        this.hurt(80, 'light');
        this.stunT = this.phase >= 2 ? 4.4 : 5.2;
      } else {
        // wrong (or too slow): the empty one spills, and it jumps out of the real one at you
        if (ch >= 0) Shells.burst(S[ch], true);
        else { const e = S.find((s) => s !== realS); if (e) Shells.burst(e, true); }
        yield* wait(0.4);
        Shells.burst(realS, false);
        this.appearAt(realS.x + f.x * 0.95, realS.z + f.z * 0.95, Math.atan2(Player.pos.x - realS.x, Player.pos.z - realS.z));
        W.lightsOut[room] = 0;
        Sfx.play('roar', this.pos.x, this.pos.z, 1, { pitch: 1.25 });
        UI.titleCard('BOO!', '', 900, 'boss'); Cam.shake(0.7);
        Shells.sinkAll(0.9);
        yield* this.atkPounce(14);
      }
    } finally {
      W.lightsOut[room] = 0;
      Shells.choosing = false;
      if (this.hidden) { this.hidden = false; this.rig.root.visible = true; }
      if (Shells.list.length && !Shells.list.every((s) => s.sinking)) Shells.sinkAll(0.3);
    }
    this.anim = null;
  }

  // ---- damage / death ----
  hurt(dmg, src) {
    if (this.dead || this.state !== 'fight' || this.hidden) return;
    if (this.stunT > 0) dmg *= 1.3;
    if (this.type === 'visitor' && G.flags.dark && Player.inBeam(this.pos.x, this.pos.z)) dmg *= 1.5;
    if (Player.stats.beam && Player.inBeam(this.pos.x, this.pos.z)) dmg *= 1.2;
    this.hp -= dmg; this.flashT = 0.07;
    if (this.rig.anim && (src === 'melee' || src === 'bomb' || src === 'light' || Math.random() < 0.15)) this.rig.anim.flinch('Hurt', src === 'bomb' ? 1 : 0.6);
    UI.boss(this.def.name, this.hp / this.maxHp);
    if (this.hp <= 0) { this.hp = 0; this.die(); }
  }

  die() {
    if (this.state === 'dying') return;
    if (this.atk) { this.atk.return(); this.atk = null; }
    this.state = 'dying'; this.t = 0;
    G.slowmoT = 1.1; G.slowmoScale = 0.35;
    Sfx.play('bossDie');
    UI.boss(this.def.name, 0);
    Cam.shake(1.4);
    for (const e of G.enemies) if (!e.dead && e.type !== 'vhs') { if (e.state === 'hidden' || e.state === 'blinkOut') e.remove(); else e.die('boss'); }
    for (const p of G.projectiles) if (p.owner === 'e') { p.alive = false; Projectiles.kill(p); }
  }

  finish() {
    this.dead = true;
    if (this.type === 'boogey') {
      // nothing in there now: the empty coat stays on the floor, a hanger poking out of the hood
      if (this.rig.parts.eyes) this.rig.parts.eyes.visible = false;
      Temp.add(this.rig.root, null, 900);
    } else Render.scene.remove(this.rig.root);
    const x = this.pos.x, z = this.pos.z;
    FX.burst(x, 1.5, z, this.def.color, 60, 8, { size: 0.2, life: 1.4 });
    FX.burst(x, 1.5, z, 0xfff0d0, 40, 6, { glow: true, size: 0.3, life: 0.8, grav: 1 });
    // photo paper shreds
    FX.burst(x, 2, z, 0xf2eee4, 40, 5, { size: 0.14, life: 2.4, grav: 1.5, drag: 1.2 });
    Chunks.spawn(x, 1.2, z, this.def.color, 24, 7, 0.16);
    FX.light(x, 2, z, 0xffffff, 120, 0.35);
    UI.flash(600, 0.8);
    Sfx.play('explode', x, z, 1.2);
    Game.onBossDefeated(this);
  }

  // ---- visuals ----
  ambientFX(dt) {
    const x = this.pos.x, z = this.pos.z;
    if (this.hidden) return;
    if (this.type === 'jack' && Math.random() < 0.5) FX.fire(x + rand(-0.4, 0.4), 3.1, z + rand(-0.4, 0.4), 1, 0.1, 0.4);
    if (this.type === 'maw' && Math.random() < 0.2) Particles.glow.emit(x + rand(-1, 1), rand(1, 2.6), z + rand(-1, 1), 0, 0.3, 0, 1, 0.7, 0.9, 0.7, 0.08, 0.6, 0, 0);
    if (this.type === 'stitches' && Math.random() < 0.15) Particles.dust.emit(x + rand(-1, 1), rand(1, 2.4), z + rand(-1, 1), rand(-0.5, 0.5), 0.5, rand(-0.5, 0.5), 0.95, 0.93, 0.88, 1, 0.1, 1.2, 1.5, 1);
    if (this.type === 'visitor' && Math.random() < 0.3) Particles.glow.emit(x + rand(-0.6, 0.6), rand(0.2, 1.5), z + rand(-0.6, 0.6), 0, 0.4, 0, 0.9, 0.85, 0.6, 0.35, 0.3, 0.9, -0.2, 1);
    if (this.type === 'uninvited' && Math.random() < 0.6) FX.fire(x + rand(-0.6, 0.6), rand(0.2, 0.6), z + rand(-0.6, 0.6), 1, 0.1, 0.35);
    void dt;
  }

  animateGLB(dt) {
    const r = this.rig, A = r.anim, t = this.animT;
    if (this.state !== 'intro' && this.state !== 'dying') r.root.position.set(this.pos.x, 0, this.pos.z);
    r.root.rotation.y = this.yaw;
    const speed = Math.hypot(this.vel.x, this.vel.z);
    let clip = 'Idle', fade = 0.22; const o = {};
    if (this.state === 'intro') { clip = 'Emerge'; o.once = true; fade = 0; }
    else if (this.state === 'dying') { clip = 'Death'; o.once = true; fade = 0.12; }
    else if (this.stunT > 0) clip = 'Stun';
    else if (this.anim && BOSS_CLIP[this.anim]) {
      const c = BOSS_CLIP[this.anim];
      clip = c[0]; o.once = c[1]; if (c[2]) o.speed = c[2]; fade = this.anim === 'dash' ? 0.1 : 0.16;
      if (!A.has(clip)) { clip = this.anim === 'slam' || this.anim === 'dash' ? 'Idle' : A.has('Raise') ? 'Raise' : 'Idle'; o.once = clip !== 'Idle'; }
    } else if (speed > 0.3 && A.has('Walk')) { clip = 'Walk'; o.speed = clamp(speed / this.def.speed, 0.5, 1.8); }
    if (!A.play(clip, fade, o)) A.play('Idle', fade);
    A.update(dt);
    if (this.stunT > 0 && r.head && !A.has('Stun')) r.head.rotateZ(Math.sin(t * 8) * 0.25);
    const f = this.flashT > 0 ? 1 : this.stunT > 0 ? 0.22 + Math.sin(t * 20) * 0.08 : 0;
    for (const m of r.flash) {
      const b = m.userData.baseEmissive;
      if (b) m.emissive.copy(b); else m.emissive.setRGB(0, 0, 0);
      if (f > 0) m.emissive.lerp(_c1.setRGB(1, 1, 1), Math.min(1, f * 0.85));
    }
  }

  animate(dt) {
    if (this.rig.glb) { this.animateGLB(dt); return; }
    const r = this.rig, p = r.parts, t = this.animT;
    if (this.state !== 'intro' && this.state !== 'dying') r.root.position.set(this.pos.x, 0, this.pos.z);
    r.root.rotation.y = this.yaw;
    const speed = Math.hypot(this.vel.x, this.vel.z);
    const walk = Math.sin(t * (3 + speed * 1.5));
    if (p.legs) { p.legs[0].rotation.x = walk * 0.4 * Math.min(1, speed); p.legs[1].rotation.x = -walk * 0.4 * Math.min(1, speed); }
    let bodyRx = 0, armRx = 0, armRz = 0;
    if (this.anim === 'rear') bodyRx = -0.25;
    if (this.anim === 'dash') bodyRx = 0.3;
    if (this.anim === 'raise' || this.anim === 'roar') { armRx = -2.2; }
    if (this.anim === 'throw') armRx = -2.5;
    if (this.anim === 'reach') armRx = -1.6;
    if (this.anim === 'sweep') { armRx = -1.2; armRz = 0.8; }
    if (this.anim === 'spit' || this.anim === 'open') bodyRx = -0.15;
    r.body.rotation.x = damp(r.body.rotation.x, bodyRx, 8, dt);
    r.body.position.y = Math.abs(walk) * 0.06 * Math.min(1, speed) + Math.sin(t * 1.5) * 0.03;
    if (p.arms) p.arms.forEach((a, i) => {
      a.rotation.x = damp(a.rotation.x, armRx + (this.anim ? 0 : walk * 0.3 * (i ? 1 : -1)), 7, dt);
      a.rotation.z = damp(a.rotation.z, armRz * (i ? -1 : 1), 7, dt);
    });
    if (this.type === 'visitor' && p.upper) p.upper.rotation.x = 0.45 + Math.sin(t * 0.8) * 0.05 + (this.anim === 'reach' ? 0.25 : 0);
    if (this.type === 'maw' && p.mouth) p.mouth.scale.y = this.anim === 'open' || this.anim === 'spit' ? 1.3 : 1 + Math.sin(t * 3) * 0.05;
    if (p.tail) p.tail.rotation.y = Math.sin(t * 2) * 0.4;
    if (this.type === 'stitches' && p.extra) p.extra.forEach((h, i) => { h.rotation.y = Math.sin(t * 1.3 + i * 2) * 0.4; });
    if (p.head) p.head.rotation.z = this.stunT > 0 ? Math.sin(t * 8) * 0.25 : damp(p.head.rotation.z, 0, 5, dt);
    const f = this.flashT > 0 ? 1 : this.stunT > 0 ? 0.25 + Math.sin(t * 20) * 0.1 : 0;
    for (const m of r.flash) m.emissive.setRGB(f, f, f);
  }

  remove() { this.dead = true; if (this.atk) { this.atk.return(); this.atk = null; } Render.scene.remove(this.rig.root); }
}

// =====================================================================
//  POLAROIDS: in-engine photos, first person inspection, alignment
// =====================================================================
// boss staging in the revealed photo: [move toward the lens (m), sink into the floor (m), lean toward the lens (rad)]
const BOSS_PHOTO = { jack: [0.7, -0.95, 0.25], maw: [0.1, -0.75, 0.1], stitches: [0.8, -1.15, 0.2], visitor: [0.9, -1.55, 0.3], uninvited: [0.9, -1.65, 0.25] };
const PHOTO_FOV = 39.26;            // matches the raised polaroid on screen (65deg FP fov)
const PHOTO_RES = 320;
const POL_W = 0.318, POL_H = 0.3866, POL_CY = -0.0289; // frame size, frame center relative to image center

const PHOTO_DEFS = [
  { title: 'Pumpkin Patch', room: 'hall', cam: [5.0, 1.6, 21.0], look: [1.5, 0.82, 22.95], subject: [1.5, 0.75, 23.0], minion: 'pumpkin', boss: 'jack', perch: 0.75 },
  { title: 'Sweet Tooth', room: 'kitchen', cam: [8.4, 1.6, 4.7], look: [8.65, 0.95, 0.5], subject: [8.65, 0.95, 0.55], minion: 'candy', boss: 'maw', perch: 0.95 },
  { title: 'Stitchlings', room: 'living', cam: [20.2, 1.6, 6.0], look: [16.8, 0.8, 2.95], subject: [16.8, 0.64, 3.0], minion: 'stitch', boss: 'stitches', perch: 0.64 }, // armchair seat cushion ~0.645
  { title: 'Nightlights', room: 'bedroom', cam: [23.0, 1.6, 17.3], look: [28.0, 1.0, 16.45], subject: [28.0, 0.71, 16.45], minion: 'ghost', boss: 'visitor', perch: 0.66 }, // quilt top ~0.62
  { title: 'Little Devils', room: 'hall', cam: [4.35, 1.6, 17.4], look: [2.15, 1.05, 13.8], subject: [2.48, 0, 13.95], minion: 'devil', boss: 'uninvited', door: true },
];

const POL_FRAG = `
uniform sampler2D tPhoto; uniform sampler2D tCaption; uniform float uDevelop; uniform float uGlow; uniform float uImgAlpha;
uniform float uTime; uniform float uSide; uniform float uCrackle; uniform float uDark; uniform float uExposure;
varying vec2 vUv;
float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
vec3 aces(vec3 x){ return clamp((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14),0.0,1.0); }
vec3 toSRGB(vec3 c){ return mix(c*12.92, 1.055*pow(max(c,vec3(0.0)), vec3(1.0/2.4)) - 0.055, step(0.0031308, c)); }
void main(){
  vec2 uv = vUv;
  if (uSide > -0.5) {
    float edge = 0.5 + (hash(vec2(floor(uv.y * 38.0), 3.0)) - 0.5) * 0.07 + sin(uv.y * 21.0) * 0.012;
    if (uSide < 0.5 && uv.x > edge) discard;
    if (uSide > 0.5 && uv.x < edge) discard;
  }
  vec2 I0 = vec2(0.0511, 0.2056), I1 = vec2(0.9489, 0.9439);
  vec3 paper = vec3(0.93, 0.915, 0.87) * (0.955 + 0.045 * hash(floor(uv * vec2(180.0, 220.0))));
  paper *= 0.93 + 0.07 * (1.0 - uv.y);
  vec3 col = paper; float alpha = 1.0;
  if (uv.x > I0.x && uv.x < I1.x && uv.y > I0.y && uv.y < I1.y) {
    vec2 iuv = (uv - I0) / (I1 - I0);
    vec3 c = texture2D(tPhoto, iuv).rgb * uExposure;
    c = toSRGB(aces(c));
    c = c * vec3(1.07, 1.0, 0.88) + vec3(0.035, 0.04, 0.06);
    float l = dot(c, vec3(0.3, 0.59, 0.11));
    c = mix(vec3(l), c, 0.82);
    vec2 d = iuv - 0.5; c *= 1.0 - dot(d, d) * 0.95;
    float e = min(min(iuv.x, 1.0 - iuv.x), min(iuv.y, 1.0 - iuv.y));
    c *= 0.8 + 0.2 * smoothstep(0.0, 0.05, e);
    c += (hash(iuv * vec2(311.0, 157.0) + fract(uTime)) - 0.5) * 0.05;
    c = mix(c, c * vec3(0.55, 0.45, 0.5), uDark);
    vec3 undev = vec3(0.11, 0.12, 0.115) + vec3(0.05, 0.045, 0.03) * hash(floor(iuv * 24.0));
    float dev = clamp(uDevelop, 0.0, 1.0);
    vec3 mid = mix(undev, c * vec3(0.62, 0.8, 1.08), smoothstep(0.0, 0.6, dev));
    c = mix(mid, c, smoothstep(0.45, 1.0, dev));
    c += uCrackle * (hash(floor(iuv * 90.0) + floor(uTime * 24.0)) - 0.5) * 0.5;
    col = c; alpha = uImgAlpha;
  } else if (uv.y < I0.y) {
    vec2 cuv = vec2((uv.x - 0.04) / 0.92, uv.y / I0.y);
    vec4 cap = texture2D(tCaption, cuv);
    col = mix(paper, cap.rgb, cap.a * 0.92);
  }
  float edgeD = min(min(uv.x, 1.0 - uv.x), min(uv.y, 1.0 - uv.y));
  col += vec3(1.0, 0.86, 0.6) * uGlow * smoothstep(0.07, 0.0, edgeD) * 1.3;
  col += vec3(1.0, 0.9, 0.7) * uGlow * 0.12;
  gl_FragColor = vec4(col, alpha);
}`;
const POL_VERT = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }';

function captionTexture(text, doodle) {
  return Tex.make('cap_' + text, 512, 128, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.save(); g.translate(w / 2, h / 2 + 6); g.rotate(-0.035);
    g.fillStyle = '#1d1a24';
    g.font = '58px "Permanent Marker", "Marker Felt", "Comic Sans MS", cursive';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(text, 0, 0);
    const tw = g.measureText(text).width;
    g.strokeStyle = '#b3121b'; g.lineWidth = 4; g.lineCap = 'round';
    if (doodle === 'heart') { g.beginPath(); const x = tw / 2 + 34, y = -4; g.moveTo(x, y + 10); g.bezierCurveTo(x - 22, y - 6, x - 10, y - 22, x, y - 10); g.bezierCurveTo(x + 10, y - 22, x + 22, y - 6, x, y + 10); g.stroke(); }
    else if (doodle === 'star') { g.beginPath(); for (let k = 0; k < 11; k++) { const r = k % 2 ? 7 : 16, a = k / 10 * TAU - Math.PI / 2; g.lineTo(tw / 2 + 34 + Math.cos(a) * r, Math.sin(a) * r); } g.stroke(); }
    else if (doodle === 'x') { g.beginPath(); g.moveTo(tw / 2 + 22, -14); g.lineTo(tw / 2 + 46, 10); g.moveTo(tw / 2 + 46, -14); g.lineTo(tw / 2 + 22, 10); g.stroke(); }
    else { g.beginPath(); g.moveTo(-tw / 2, 30); g.quadraticCurveTo(0, 38, tw / 2, 28); g.stroke(); }
    g.restore();
  }, { clamp: true, smooth: true });
}

const Photos = {
  list: [], cam: null, rtBake: null, bakeScene: null, bakeCam: null, bakeMat: null,
  mode: 'off', raise: 0, raiseTarget: 0, show: 0, showTarget: 0, glow: 0, alignT: 0, tickT: 0, fpTime: 0,
  overlay: null, pol: null, polMat: null, halves: null, hands: null,
  worldPhoto: null, current: null,

  init() {
    this.cam = new THREE.PerspectiveCamera(PHOTO_FOV, 1, 0.05, 60);
    this.cam.rotation.order = 'YXZ';
    this.cam.layers.enable(1);
    // bake pipeline (photo RT -> 8-bit -> canvas)
    this.rtBake = new THREE.WebGLRenderTarget(256, 256, { type: THREE.UnsignedByteType });
    this.bakeMat = new THREE.ShaderMaterial({ vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy,0.0,1.0); }', fragmentShader: POL_FRAG.replace('uv.x > I0.x && uv.x < I1.x && uv.y > I0.y && uv.y < I1.y', 'true').replace('vec2 iuv = (uv - I0) / (I1 - I0);', 'vec2 iuv = uv;'), uniforms: this.uniforms(null, null), depthTest: false });
    this.bakeMat.uniforms.uSide.value = -1;
    this.bakeScene = new THREE.Scene();
    const q = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.bakeMat); q.frustumCulled = false; this.bakeScene.add(q);
    this.bakeCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    // photos
    this.list = PHOTO_DEFS.map((d, i) => {
      const ph = Object.assign({}, d, { id: i, developed: i === 0 ? 0 : 0, done: false, thumb: null, rendered: false });
      ph.rt = new THREE.WebGLRenderTarget(PHOTO_RES, PHOTO_RES, { type: THREE.HalfFloatType, depthBuffer: true });
      ph.camPos = new THREE.Vector3(...d.cam);
      const lx = d.look[0] - d.cam[0], ly = d.look[1] - d.cam[1], lz = d.look[2] - d.cam[2];
      ph.yaw = camYawTo(lx, lz); ph.pitch = Math.atan2(ly, Math.hypot(lx, lz));
      ph.caption = captionTexture(d.title, ['heart', 'star', 'line', 'star', 'x'][i]);
      return ph;
    });
    this.buildOverlay();
    this.buildPhotoProps();
  },

  uniforms(photo, caption) {
    return {
      tPhoto: { value: photo }, tCaption: { value: caption }, uDevelop: { value: 1 }, uGlow: { value: 0 }, uImgAlpha: { value: 1 },
      uTime: { value: 0 }, uSide: { value: -1 }, uCrackle: { value: 0 }, uDark: { value: 0 }, uExposure: { value: 1.25 },
    };
  },

  buildOverlay() {
    const ov = this.overlay = new THREE.Group();
    Render.overlayCam.add(ov);
    const geo = new THREE.PlaneGeometry(POL_W, POL_H); geo.translate(0, POL_CY, 0);
    this.polMat = new THREE.ShaderMaterial({ vertexShader: POL_VERT, fragmentShader: POL_FRAG, uniforms: this.uniforms(null, null), transparent: true });
    this.pol = new THREE.Group(); ov.add(this.pol);
    this.polMesh = new THREE.Mesh(geo, this.polMat); this.pol.add(this.polMesh);
    // back side
    const back = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color: 0x2a2a2e })); back.rotation.y = Math.PI; back.position.z = -0.002; this.pol.add(back);
    // tear halves
    this.halves = [0, 1].map((s) => {
      const m = this.polMat.clone(); m.uniforms = THREE.UniformsUtils.clone(this.polMat.uniforms); m.uniforms.uSide.value = s;
      const mesh = new THREE.Mesh(geo, m); mesh.visible = false; this.pol.add(mesh); return mesh;
    });
    // hands (fp_hands.glb: real-size hands holding a 0.088 x 0.107 m card centered at the origin)
    if (Assets.has('fp_hands')) {
      const S = POL_W / 0.088;
      // the card is drawn first and writes depth, then the hands: the fingers behind the card must not show
      // through the see-through image while lining up a photo (so the hands go into the transparent pass)
      this.polMesh.renderOrder = 1; this.halves.forEach((h) => { h.renderOrder = 1; });
      const handMats = new Map();
      this.hands = ['HandL', 'HandR'].map((n) => {
        const g = new THREE.Group();
        const h = Assets.inst('fp_hands', { nodes: [n] });
        h.traverse((o) => {
          if (!o.isMesh) return;
          o.castShadow = false; o.receiveShadow = false; o.renderOrder = 2;
          if (!handMats.has(o.material)) { const m = o.material.clone(); m.transparent = true; m.opacity = 1; m.depthWrite = true; handMats.set(o.material, m); }
          o.material = handMats.get(o.material);
        });
        g.add(h); g.position.set(0, POL_CY, 0); g.scale.setScalar(S);
        this.pol.add(g);
        return g;
      });
      ov.visible = false;
      return;
    }
    const skin = new THREE.MeshLambertMaterial({ color: 0xe0b08a });
    const sleeve = new THREE.MeshLambertMaterial({ map: fabricTexture('flannel') });
    const hand = (side) => {
      const h = new THREE.Group();
      const s = side;
      mk(Geo.box(0.052, 0.06, 0.022), skin, s * 0.006, -0.026, -0.012, h, { cast: false });
      for (let k = 0; k < 3; k++) mk(Geo.box(0.012, 0.03, 0.012), skin, s * (0.004 - k * 0.014), 0.012, -0.012, h, { cast: false });
      mk(Geo.box(0.014, 0.034, 0.012), skin, -s * 0.024, 0.004, 0.008, h, { rz: s * 0.6, cast: false });
      mk(Geo.box(0.064, 0.1, 0.06), sleeve, s * 0.012, -0.1, -0.03, h, { rz: s * 0.12, cast: false });
      h.position.set(s * (POL_W / 2 - 0.012), -0.215, 0);
      this.pol.add(h);
      return h;
    };
    this.hands = [hand(-1), hand(1)];
    ov.visible = false;
  },

  buildPhotoProps() {
    // red door that only exists in photo 5 (and later for real)
    const door = this.redDoor = new THREE.Group();
    // kit door: frame + glowing gap, child RedDoorLeaf hinged at (-0.48, 0, 0.04)
    const rd = W.kit('props_common', 'RedDoor', door, 0, 0, 0, 0, { cast: false });
    let leafPivot = rd && GLB.find(rd, 'RedDoorLeaf');
    if (!leafPivot) {
      if (rd) door.remove(rd);
      const frameM = Mat.lam(0x2a0a0a, { unique: true });
      const doorM = Mat.lam(0x8a1010, { unique: true, emissive: 0x2a0000, ei: 0.6 });
      mk(Geo.box(1.15, 1.95, 0.06), frameM, 0, 0.975, 0, door, { cast: false });
      leafPivot = grp(door, -0.48, 0, 0.04);
      mk(Geo.box(0.96, 1.85, 0.06), doorM, 0.48, 0.925, 0.0, leafPivot, { cast: false });
      mk(Geo.sph(0.04, 6, 4), Mat.lam(0xd8b060), 0.85, 0.95, 0.05, leafPivot, { cast: false });
      const glowM = Mat.basic(0xffa040, { opacity: 0.95, transparent: true });
      mk(Geo.plane(0.9, 1.8), glowM, 0, 0.92, -0.01, door, { cast: false, receive: false });
    }
    leafPivot.rotation.y = -0.6;
    door.position.set(2.05, 0, 13.72);
    this.redDoorLeaf = leafPivot;
    setLayer(door, 1);
    Render.scene.add(door);
  },

  // ---------------------------------------------------------------
  //  Rendering photos from the house itself
  // ---------------------------------------------------------------
  stageSubject(ph, variant) {
    // remove old
    if (ph.subjectRig) { Render.scene.remove(ph.subjectRig.root); ph.subjectRig = null; }
    if (variant === 'empty') return;
    const s = ph.subject;
    let rig;
    if (variant === 'boss') {
      rig = buildBoss(ph.boss, true);
      // it rises out of the floor where the cute one sat, leaning toward the lens
      const dx = ph.camPos.x - s[0], dz = ph.camPos.z - s[2], d = Math.hypot(dx, dz);
      const P = BOSS_PHOTO[ph.boss] || [0.8, -1, 0.2];
      rig.root.position.set(s[0] + dx / d * P[0], P[1], s[2] + dz / d * P[0]);
      rig.root.rotation.y = Math.atan2(dx, dz);
      if (rig.glb) { rig.photoLean = P[2]; poseRig(rig, ph.boss, 'Idle', 0.4); rig.body.rotateX(P[2]); }
      else rig.body.rotation.x = P[2];
    } else {
      rig = buildCritter(ph.minion, true);
      rig.root.position.set(s[0], ph.door ? 0 : s[1], s[2]);
      rig.root.rotation.y = Math.atan2(ph.camPos.x - s[0], ph.camPos.z - s[2]);
      if (rig.glb) poseRig(rig, ph.minion, 'Idle', 0.3);
      else if (ph.minion === 'ghost') rig.body.position.y = 0.3;
    }
    Render.scene.add(rig.root);
    ph.subjectRig = rig;
  },

  render(ph, variant = 'cute') {
    // tests: skip live re-renders while fast-forwarding / between screenshots (the snapshot re-renders it)
    if (variant === null && (G.fastForward || (SHOTS && !this._snapping))) { this._dirty = ph; return; }
    if (variant !== null) this.stageSubject(ph, variant);
    this.shoot(ph, { mul: variant === 'boss' ? 0.75 : 1.15 });
    ph.rendered = true;
  },

  // Render the house from a photo camera (ph.camPos / yaw / pitch) into ph.rt: the room's lamps on (o.mul), every
  // wall and the roof up, the player, enemies and the visitor out of the picture (o.man keeps the visitor),
  // o.moon lights the yard, o.light = { pos, color, intensity, distance } adds one more lamp
  shoot(ph, o = {}) {
    const r = Render.renderer, sc = Render.scene;
    // (in first person with nobody else around the photo sees the same shadow casters as the view: the shadow maps
    // stay valid wherever the lamps don't move, the live re-render doesn't redraw them twice a frame)
    let same = !Player.rig.root.visible && W.props.man.visible === !!o.man && this.redDoor.visible === !!ph.door && !(this.worldPhoto && this.worldPhoto.visible);
    for (const e of G.enemies) if (e.rig.root.visible) same = false;
    for (const b of G.bosses) if (b.rig && b.rig.root.visible) same = false;
    const restoreL = W.forceLights(ph.room, o.mul ?? 1.15, o.hemi, same);
    const spotI = Player.spot.intensity; Player.spot.intensity = 0;
    const pv = Player.rig.root.visible; Player.rig.root.visible = false;
    const ceil = W.ceilings.map((c) => c.visible); W.ceilings.forEach((c) => { c.visible = true; });
    const capV = W.stairCap.visible; W.stairCap.visible = !W.attic.visible;
    const ws = W.wallSnapshot(); W.wallsOpaque();
    const roofV = W.roof.visible; W.roof.visible = true;
    const moonI = W.moon.intensity; if (o.moon != null) W.moon.intensity = o.moon;
    // (o.light takes the pool's last entry for the shot; a flash in progress stays out of the picture)
    const xl = W.pool[W.pool.length - 1].light;
    if (o.light) { xl.position.set(...o.light.pos); xl.color.set(o.light.color); xl.intensity = o.light.intensity; xl.distance = o.light.distance || 10; xl.decay = 1.6; }
    else xl.decay = LIGHT_DECAY;
    const fogN = sc.fog.near, fogF = sc.fog.far; sc.fog.near = 7; sc.fog.far = 45;
    const hidden = [];
    for (const e of G.enemies) if (e.rig.root.visible) { e.rig.root.visible = false; hidden.push(e.rig.root); }
    for (const b of G.bosses) if (b.rig && b.rig.root.visible) { b.rig.root.visible = false; hidden.push(b.rig.root); }
    if (this.worldPhoto && this.worldPhoto.visible) { this.worldPhoto.visible = false; hidden.push(this.worldPhoto); }
    // (nor what a fight leaves lying about: loot, sparks and dust, shots, spilled tape, an empty coat, the wardrobes.
    // The particles would also come out huge: their size is set for the view's camera)
    const hide = (o) => { if (o && o.visible) { o.visible = false; hidden.push(o); } };
    for (const e of Temp.list) hide(e.obj);
    for (const p of G.pickups) if (p.rig) hide(p.rig.root);
    for (const p of G.projectiles) hide(p.mesh);
    for (const s of Shells.list) hide(s.root);
    if (Particles.glow) { hide(Particles.glow.points); hide(Particles.dust.points); }
    const redVis = this.redDoor.visible;
    this.redDoor.visible = !!ph.door;
    const man = W.props.man.visible; W.props.man.visible = !!o.man;
    // (the night sky, the side yard trees and the shadows in the windows belong to the title shot, not to the photos)
    const title = [W.sky, W.titleTrees, W.atticFigure, WinShadows.quad, W.clouds, W.spills, W.hood, ...(W.mist || []).map((m) => m.pl)].filter(Boolean), titleV = title.map((o) => o.visible);
    for (const o of title) o.visible = false;
    const c = this.cam;
    c.position.copy(ph.camPos); c.rotation.set(ph.pitch, ph.yaw, 0, 'YXZ'); c.updateMatrixWorld();
    r.setRenderTarget(ph.rt); r.setClearColor(0x050407, 1); r.clear(true, true, true);
    r.render(sc, c);
    r.setRenderTarget(null);
    // restore
    for (const h of hidden) h.visible = true;
    this.redDoor.visible = redVis;
    W.props.man.visible = man; title.forEach((o, i) => { o.visible = titleV[i]; });
    sc.fog.near = fogN; sc.fog.far = fogF;
    xl.decay = LIGHT_DECAY;
    W.moon.intensity = moonI; W.roof.visible = roofV;
    W.wallRestore(ws);
    W.ceilings.forEach((cc, i) => { cc.visible = ceil[i]; });
    W.stairCap.visible = capV;
    Player.rig.root.visible = pv; Player.spot.intensity = spotI;
    restoreL();
  },

  bake(ph, opts = {}) {
    // graded photo -> canvas -> dataURL (for HTML UI and world polaroids)
    const cv = this.bakeCanvas(ph.rt.texture, opts);
    ph.imageCanvas = cv;
    ph.thumb = cv.toDataURL('image/jpeg', 0.86);
    return cv;
  },
  bakeCanvas(tex, opts = {}) {
    const r = Render.renderer, u = this.bakeMat.uniforms;
    u.tPhoto.value = tex; u.uDevelop.value = 1; u.uGlow.value = 0; u.uImgAlpha.value = 1; u.uCrackle.value = 0; u.uDark.value = opts.dark || 0;
    r.setRenderTarget(this.rtBake); r.clear(); r.render(this.bakeScene, this.bakeCam); r.setRenderTarget(null);
    const px = new Uint8Array(256 * 256 * 4);
    r.readRenderTargetPixels(this.rtBake, 0, 0, 256, 256, px);
    const cv = document.createElement('canvas'); cv.width = 256; cv.height = 256;
    const g = cv.getContext('2d'); const id = g.createImageData(256, 256);
    for (let y = 0; y < 256; y++) id.data.set(px.subarray((255 - y) * 1024, (256 - y) * 1024), y * 1024);
    g.putImageData(id, 0, 0);
    return cv;
  },

  // full polaroid as a canvas texture for the world (dropped photo on the floor)
  worldTexture(ph) {
    const cv = document.createElement('canvas'); cv.width = 176; cv.height = 214;
    const g = cv.getContext('2d');
    g.fillStyle = '#ece7dc'; g.fillRect(0, 0, 176, 214);
    if (ph.imageCanvas) g.drawImage(ph.imageCanvas, 9, 12, 158, 158);
    else { g.fillStyle = '#26282a'; g.fillRect(9, 12, 158, 158); }
    g.fillStyle = '#1d1a24'; g.font = '18px "Permanent Marker", cursive'; g.textAlign = 'center';
    g.fillText(ph.title, 88, 198);
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
    return t;
  },

  placeWorldPhoto(ph, x, z, ry = 0) {
    this.removeWorldPhoto();
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.51), new THREE.MeshLambertMaterial({ map: this.worldTexture(ph), emissive: 0xffffff, emissiveIntensity: 0.12 }));
    m.material.emissiveMap = m.material.map;
    m.rotation.x = -Math.PI / 2; m.rotation.z = ry;
    m.position.set(x, 0.03, z);
    m.castShadow = false; m.receiveShadow = true;
    const glow = mk(Geo.plane(1.6, 1.6), Mat.glow(0xffe0a0, 0.5), 0, 0, -0.01, m, { cast: false, receive: false });
    m.userData.glow = glow;
    Render.scene.add(m);
    this.worldPhoto = m;
    return m;
  },
  removeWorldPhoto() { if (this.worldPhoto) { Render.scene.remove(this.worldPhoto); this.worldPhoto = null; } },

  // ---------------------------------------------------------------
  //  First person mode
  // ---------------------------------------------------------------
  canEnter() {
    const ph = this.current;
    return ph && ph.developed >= 1 && !ph.done && G.phase === 'explore' && Player.alive && !G.arena && this.mode === 'off' && !Cam.trans && !TVSmash.threat();
  },

  enter() {
    const ph = this.current;
    this.mode = 'hold'; this.fpTime = 0; this.alignT = 0; this.raise = 0; this.raiseTarget = 0;
    Player.control = false;
    Cam.fp.pos.set(Player.pos.x, 1.6, Player.pos.z);
    Cam.fp.yaw = Player.yaw + Math.PI; Cam.fp.pitch = -0.08;
    Cam.to('fp', 0.85);
    this.setPhotoMaterial(ph);
    this.overlay.visible = true; Render.overlayVisible = true;
    this.showTarget = 1; this.show = 0;
    Input.lock();
    Sfx.play('rustle', undefined, undefined, 0.7);
    UI.hint(this.hintHTML());
    UI.prompt(null);
    UI.setPlaying(false);
  },

  // what to press while holding the photo, for the input in use
  hintHTML() {
    if (Input.mode === 'pad') return `${padKey('RS')} look &nbsp; ${padKey('LS')} step &nbsp; hold ${padKey('LT')} hold up the photo &nbsp; ${padKey('Y')} put away`;
    if (Input.mode === 'touch') return 'Slide your right thumb to look &nbsp; left thumb to step &nbsp; hold <b>HOLD UP</b> to hold up the photo';
    return '<span class="kc">Mouse</span> look &nbsp; <span class="kc">W</span><span class="kc">A</span><span class="kc">S</span><span class="kc">D</span> step &nbsp; hold <span class="kc">Right click</span>/<span class="kc">Space</span> hold up the photo &nbsp; <span class="kc">F</span> put away';
  },

  exit(dur = 0.85) {
    this.mode = 'exiting';
    this.showTarget = 0; this.raiseTarget = 0;
    Input.unlock();
    UI.hint(null);
    Player.pos.x = Cam.fp.pos.x; Player.pos.z = Cam.fp.pos.z;
    Player.yaw = Cam.fp.yaw + Math.PI;
    Cam.to('iso', dur, () => { this.mode = 'off'; this.overlay.visible = false; Render.overlayVisible = false; if (G.phase === 'explore') Player.control = true; UI.setPlaying(true); });
    Sfx.muffle(false);
  },

  setPhotoMaterial(ph, variant) {
    const u = this.polMat.uniforms;
    u.tPhoto.value = ph.rt.texture; u.tCaption.value = ph.caption; u.uDevelop.value = ph.developed; u.uSide.value = -1; u.uCrackle.value = 0; u.uDark.value = variant === 'boss' ? 0.35 : 0;
    for (const h of this.halves) { h.material.uniforms.tPhoto.value = ph.rt.texture; h.material.uniforms.tCaption.value = ph.caption; h.visible = false; h.position.set(0, 0, 0); h.rotation.set(0, 0, 0); }
    this.polMesh.visible = true;
  },

  // pose of the held polaroid in camera space
  updateOverlay(dt) {
    if (!this.overlay.visible) return;
    this.show = damp(this.show, this.showTarget, 7, dt);
    this.raise = damp(this.raise, this.raiseTarget, 9, dt);
    const r = this.raise, s = this.show;
    const pose = this.pose || 'normal';
    let px = lerp(0.17, 0, r), py = lerp(-0.165, 0, r), pz = lerp(-0.45, -0.4, r);
    let rx = lerp(-0.42, 0, r), ry = lerp(-0.3, 0, r), rz = lerp(0.14, 0, r), sc = lerp(0.62, 1, r);
    if (pose === 'reveal') { px = 0; py = -0.02; pz = -0.42; rx = -0.08; ry = 0; rz = 0.02; sc = 1.0; }
    if (pose === 'ending') { px = 0; py = 0.06; pz = -0.42; rx = -0.05; ry = 0; rz = -0.015; sc = 0.78; }
    py -= (1 - s) * 0.5;
    const t = G.realTime;
    this.pol.position.set(px + Math.sin(t * 1.3) * 0.002, py + Math.sin(t * 1.9) * 0.002, pz);
    this.pol.rotation.set(rx, ry, rz);
    this.pol.scale.setScalar(sc);
    this.hands[0].visible = r > 0.5 || pose === 'reveal' || pose === 'ending';
    const u = this.polMat.uniforms;
    u.uTime.value = t;
    u.uImgAlpha.value = (pose === 'reveal' || pose === 'ending') ? 1 : lerp(1, 0.5, smoothstep(0.6, 1, r)) + this.alignFade;
    u.uGlow.value = this.glow;
    for (const h of this.halves) { h.material.uniforms.uTime.value = t; h.material.uniforms.uGlow.value = this.glow; h.material.uniforms.uCrackle.value = u.uCrackle.value; h.material.uniforms.uDark.value = u.uDark.value; }
  },
  alignFade: 0,

  alignment(ph) {
    const p = Cam.fp;
    const dpos = dist(p.pos.x, p.pos.z, ph.camPos.x, ph.camPos.z);
    const dyaw = Math.abs(angDiff(p.yaw, ph.yaw));
    const dpitch = Math.abs(p.pitch - ph.pitch);
    const score = clamp(1 - dpos / 3, 0, 1) * clamp(1 - dyaw / 0.9, 0, 1) * clamp(1 - dpitch / 0.7, 0, 1);
    const ok = dpos < 0.9 && dyaw < 0.25 && dpitch < 0.28;
    return { dpos, dyaw, dpitch, score, ok };
  },

  updateFP(dt) {
    const ph = this.current;
    if (this.mode !== 'hold') return;
    this.fpTime += dt;
    const p = Cam.fp;
    const sens = 0.0024 * SETTINGS.sens;
    if (!Cam.trans) {
      p.yaw -= Input.dx * sens; p.pitch -= Input.dy * sens;
      p.yaw -= Input.look.x; p.pitch -= Input.look.y;     // (a gamepad's right stick, a thumb sliding on the screen)
      const kt = 1.8 * dt;
      if (Input.down('ArrowLeft')) p.yaw += kt; if (Input.down('ArrowRight')) p.yaw -= kt;
      if (Input.down('ArrowUp')) p.pitch += kt * 0.7; if (Input.down('ArrowDown')) p.pitch -= kt * 0.7;
      // edge turning when the pointer is not locked
      if (Input.mode === 'kb' && !Input.locked && Input.mouse.seen) {
        const ex = Input.mouse.x / Render.w;
        if (ex < 0.05) p.yaw += 1.4 * dt * (1 - ex / 0.05); else if (ex > 0.95) p.yaw -= 1.4 * dt * ((ex - 0.95) / 0.05);
      }
      p.pitch = clamp(p.pitch, -1.2, 1.1);
      // slow walk
      let fx = 0, fz = 0;
      const fwdX = -Math.sin(p.yaw), fwdZ = -Math.cos(p.yaw), rX = Math.cos(p.yaw), rZ = -Math.sin(p.yaw);
      if (Input.down('KeyW')) { fx += fwdX; fz += fwdZ; }
      if (Input.down('KeyS')) { fx -= fwdX; fz -= fwdZ; }
      if (Input.down('KeyD')) { fx += rX; fz += rZ; }
      if (Input.down('KeyA')) { fx -= rX; fz -= rZ; }
      const smx = Input.move.x, smy = Input.move.y;
      if (smx || smy) { fx += fwdX * smy + rX * smx; fz += fwdZ * smy + rZ * smx; }
      const l = Math.hypot(fx, fz);
      if (l > 0) {
        const sp = 1.7 * (this.raise > 0.5 ? 0.6 : 1) * Math.min(1, l);
        p.pos.x += fx / l * sp * dt; p.pos.z += fz / l * sp * dt;
        W.collide(p.pos, 0.3);
        this.stepT = (this.stepT || 0) - dt; if (this.stepT <= 0) { this.stepT = 0.55; Sfx.step(ROOMS[W.roomAt(p.pos.x, p.pos.z) || 'hall'].surface, undefined, undefined, 0.5); }
      }
      Player.pos.x = p.pos.x; Player.pos.z = p.pos.z;
      this.raiseTarget = (Input.mouse.down[2] || Input.down('Space') || Input.raise) ? 1 : 0;
    }
    // alignment
    const a = this.alignment(ph);
    const sameRoom = W.roomAt(p.pos.x, p.pos.z) === ph.room;
    const warm = sameRoom ? a.score : 0;
    this.glow = damp(this.glow, warm * warm * 0.6 + (a.ok ? 0.3 : 0), 5, dt);
    this.alignFade = a.ok ? Math.min(0.3, this.alignT) : 0;
    this.tickT -= dt;
    if (sameRoom && warm > 0.25 && this.tickT <= 0) { this.tickT = lerp(0.9, 0.12, warm); Sfx.play('tick', undefined, undefined, 0.3 + warm); }
    if (a.ok && this.raise > 0.85) {
      this.alignT += dt;
      if (this.alignT > 0.35) { this.mode = 'event'; Game.photoAligned(ph); }
    } else this.alignT = Math.max(0, this.alignT - dt * 2);
    // hints
    if (this.fpTime > 22 && !this._hinted) { this._hinted = true; UI.toast(sameRoom ? 'This is the room. Find where the photographer stood.' : 'Wrong room? Look at the furniture in the photo.', 3200); }
    if (this.fpTime > 50 && !this._hinted2) { this._hinted2 = true; UI.toast('Stand where the photo was taken, then hold it up.<br>The photo glows when you get close.', 3600); }
  },

  // smoothly drive the FP camera to the exact photo pose
  *assist(ph, dur = 0.5) {
    const p = Cam.fp;
    const sx = p.pos.x, sz = p.pos.z, sy = p.yaw, sp = p.pitch;
    let t = 0;
    while (t < dur) {
      const dt = yield; t += dt;
      const k = easeInOut(clamp(t / dur, 0, 1));
      p.pos.x = lerp(sx, ph.camPos.x, k); p.pos.z = lerp(sz, ph.camPos.z, k);
      p.yaw = sy + angDiff(sy, ph.yaw) * k; p.pitch = lerp(sp, ph.pitch, k);
      this.raiseTarget = 1;
    }
  },

  // polaroid falls out of view
  *drop(dur = 0.75) {
    let t = 0;
    const p0 = this.pol.position.clone(), r0 = this.pol.rotation.clone();
    this.showTarget = 1; this.dropping = true;
    while (t < dur) {
      const dt = yield; t += dt;
      const k = clamp(t / dur, 0, 1);
      this.pol.position.set(p0.x + k * 0.05, p0.y - k * k * 0.55, p0.z - k * 0.05);
      this.pol.rotation.set(r0.x - k * 1.1, r0.y + k * 0.4, r0.z + k * 0.6);
    }
    this.dropping = false;
    this.overlay.visible = false; Render.overlayVisible = false;
  },

  update(dt) {
    if (this.mode === 'hold') this.updateFP(dt);
    if (!this.dropping) this.updateOverlay(dt);
    else { this.polMat.uniforms.uTime.value = G.realTime; }
    // world photo glow
    if (this.worldPhoto) {
      const gl = this.worldPhoto.userData.glow;
      gl.material.opacity = 0.3 + Math.sin(G.realTime * 4) * 0.2;
      if (this.worldPhoto.userData.rustle) { this.worldPhoto.rotation.z += Math.sin(G.realTime * 37) * 0.02; this.worldPhoto.position.y = 0.03 + Math.abs(Math.sin(G.realTime * 23)) * 0.02; }
    }
    // developing
    for (const ph of this.list) {
      if (ph.developing) {
        ph.developed = Math.min(1, ph.developed + dt / 6);
        if (ph.developed >= 1) { ph.developing = false; Game.onPhotoDeveloped(ph); }
      }
    }
    // keep the photo-only subject animating during events
    if (this.current && this.current.subjectRig && this.animSubject) this.animSubject(dt);
  },

  hudInfo() {
    const ph = this.current;
    if (!ph || G.state !== 'play') return { visible: false };
    const left = this.list.filter((p) => !p.done).length;
    const inRoom = Player.room === ph.room && ph.developed >= 1 && !ph.done && G.phase === 'explore';
    return { visible: true, img: ph.thumb, caption: ph.developed >= 1 ? ph.title : 'developing...', developing: ph.developed, glow: inRoom, count: left + ' left' };
  },
};

// wall snapshot helpers used by photo renders
W.wallSnapshot = function () { return this.walls.map((u) => ({ u, fade: u.fade })); };
W.wallsOpaque = function () {
  for (const u of this.walls) {
    this.fadeMats(u.mats, 1);
    for (const m of u.meshes) m.visible = true;
    this.wallVis(u, 1);
    for (const d of u.decor) d.visible = true;
  }
};
W.wallRestore = function (snap) {
  for (const { u, fade } of snap) {
    u.fade = fade;
    this.fadeMats(u.mats, fade);
    for (const m of u.meshes) m.visible = fade > 0.02;
    this.wallVis(u, fade);
    for (const d of u.decor) d.visible = fade > 0.5;
  }
};

// =====================================================================
//  LOST POLAROIDS: old photos of the house. Every haunt was somebody who lived here once, until their fear took
//  them into a photo. Five are hidden in the house, five fall out of the torn photos when their haunt is banished,
//  and the last one falls at the very end: you, upstairs. Found photos stay found between runs.
// =====================================================================
// the spot in the attic under the bare bulb (the bulb: relative to it), where the last photo is taken
const ATTIC = [6.2, ATTIC_Y, 12.55], ATTIC_BULB = [0.5, 2.32, -0.25];
// the scarecrow's pose: arm raise, elbow and wrist slack, how high it hangs, the sack (y, z, radii x y z, head space)
const SCARE = { arm: 0.72, elbow: 0.2, hand: 0.8, lift: 0.16, sack: [0.12, 0.01, 0.168, 0.19, 0.172] };
const LOST_DEFS = [
  { id: 'walt_a', year: 1958, title: 'Walt\'s Lanterns', date: 'Halloween 1958', hint: 'A light that never goes out',
    spot: { x: 12.55, z: 15.95, r: 1.3, label: 'Look inside the jack-o\'-lantern', glint: [13.3, 1.2, 15.9] },
    back: 'Walt hasn\'t slept with the lights off since the war. This year he carved fourteen of them, one for every window, and he sits up all night keeping them lit. "Nothing gets in where there\'s a light," he says.',
    shot: { room: 'porch', cam: [-10.4, 1.15, 15.4], look: [-3.2, 0.4, 18.4], mul: 0.85, moon: 0.7, stage: 'lanterns' } },
  { id: 'walt_b', boss: 'jack', year: 1958, title: 'Lights Out', date: 'Nov. 1, 1958', hint: 'Left behind by photo 1',
    back: 'The power went out at 11:42. We found every lantern in the house burning and his chair empty. Walt will never be in the dark again.',
    who: 'The Hollow Jack was Walter Pruitt.',
    shot: { room: 'hall', cam: [10.6, 1.5, 19.6], look: [3.0, 1.3, 18.3], mul: 0.25, dark: 0.3, stage: 'boss', boss: 'jack', at: [2.8, -0.55, 18.2] } },
  { id: 'agnes_a', year: 1964, title: 'Eleven', date: 'Summer 1964', hint: 'Where the toys sleep',
    spot: { x: 15.45, z: 9.4, r: 1.25, label: 'Open the toy chest', glint: [14.7, 0.72, 9.4] },
    back: 'The twins leave for college in September. Agnes sews dolls of them so the house won\'t feel so empty. She has made eleven. She says it still isn\'t enough.',
    shot: { room: 'living', cam: [20.0, 1.3, 6.2], look: [16.9, 0.6, 3.0], mul: 1.0, stage: 'dolls' } },
  { id: 'agnes_b', boss: 'stitches', year: 1965, title: 'Home For Good', date: 'Thanksgiving 1965', hint: 'Left behind by photo 3',
    back: 'The twins stopped writing. Agnes says they are right here with her. She only has to sew them shut so they can never leave again.',
    who: 'Mother Stitches was Agnes Hale.',
    shot: { room: 'living', cam: [21.2, 1.5, 7.4], look: [17.3, 1.1, 3.6], mul: 0.3, dark: 0.3, stage: 'boss', boss: 'stitches', at: [17.2, -0.75, 3.7] } },
  { id: 'dottie_a', year: 1971, title: 'Dottie\'s Haul', date: 'Halloween 1971', hint: 'Somewhere cold',
    spot: { x: 10.5, z: 1.45, r: 1.2, label: 'Check the fridge', glint: [10.5, 1.15, 0.95] },
    back: 'Dad lost his job at the mill this spring. Dottie hides her Halloween candy in jars all over the kitchen and counts it every night before bed. She is so scared of running out.',
    shot: { room: 'kitchen', cam: [6.8, 1.55, 3.6], look: [8.7, 0.9, 0.6], mul: 1.0, stage: 'candy' } },
  { id: 'dottie_b', boss: 'maw', year: 1972, title: 'Still Hungry', date: 'Spring 1972', hint: 'Left behind by photo 2',
    back: 'The jars are empty. Then the cupboards. She ate the wrappers. She ate the jars. Every night she comes down to the kitchen and tells us she is still hungry.',
    who: 'The Candy Maw was Dorothy Marsh.',
    shot: { room: 'kitchen', cam: [8.2, 1.5, 9.8], look: [8.5, 1.2, 3.0], mul: 0.3, dark: 0.3, stage: 'boss', boss: 'maw', at: [8.5, -0.35, 3.2] } },
  { id: 'frank', boss: 'boogey', year: 1977, title: 'Nothing In There', date: 'Oct. 1977', hint: 'Something lives in the bedroom wardrobe',
    back: 'Gus would not go to sleep until his dad checked the wardrobe. "See? Nothing in there," Frank laughed, and climbed in to prove it. The doors swung shut behind him. There is something in there now, and it is wearing Dad\'s coat.',
    who: 'The Boogeyman was Frank Doyle, Gus\'s dad.',
    shot: { room: 'bedroom', cam: [19.4, 1.45, 17.7], look: [15.9, 1.35, 13.3], mul: 0.3, dark: 0.3, stage: 'boss', boss: 'boogey', at: [15.9, 0, 13.6] } },
  { id: 'toby_a', year: 1983, title: 'Toby\'s Nightlight', date: 'Oct. 1983', hint: 'Under something you sleep on',
    spot: { x: 26.5, z: 16.5, r: 1.3, label: 'Look under the bed', glint: [26.95, 0.2, 16.5] },
    back: 'Toby says something stands by his bed whenever the nightlight blinks. He won\'t close his eyes anymore. Day six.',
    shot: { room: 'bedroom', cam: [25.2, 1.25, 14.0], look: [28.2, 0.6, 16.6], mul: 0.55 } },
  { id: 'toby_b', boss: 'visitor', year: 1983, title: 'Day Forty', date: 'Dec. 1983', hint: 'Left behind by photo 4',
    back: 'Toby doesn\'t sleep at all now. At night he stands by other people\'s beds so nobody has to be alone in the dark. He only wants someone to stay awake with him.',
    who: 'The Bedtime Visitor was Toby Reyes.',
    shot: { room: 'bedroom', cam: [22.4, 1.5, 12.6], look: [27.0, 1.1, 15.6], mul: 0.25, dark: 0.3, stage: 'boss', boss: 'visitor', at: [27.3, -0.9, 15.5] } },
  { id: 'ray_a', year: 1989, title: 'Ray\'s Circle', date: 'Oct. 1989', hint: 'Boxes nobody unpacked',
    // (right where you stand when you walk up to the boxes: it shares the foot of the stairs with "Upstairs", which
    // gives way to it)
    spot: { x: 7.8, z: 13.5, r: 1.2, label: 'Dig through the boxes', glint: [7.75, 0.95, 12.6] },
    back: 'Ray found the photos the man left on our porch. He says if he can\'t stop them, he\'ll call something bigger to do it. He drew a circle on a basement floor we never had.',
    shot: { room: 'basement', cam: [70.0, 2.4, 5.0], look: [70.0, 0.0, 11.25], mul: 0.6 } },
  { id: 'ray_b', boss: 'uninvited', year: 1989, title: '3:33 AM', date: 'Halloween 1989', hint: 'Left behind by photo 5',
    back: 'Something bigger answered. A devil climbed up out of Ray\'s circle, and nobody had invited it in. Ray never came back up the stairs.',
    who: 'Ray Delaney let The Uninvited in.',
    shot: { room: 'basement', cam: [70.0, 1.7, 4.4], look: [70.0, 1.3, 11.25], mul: 0.3, dark: 0.25, stage: 'boss', boss: 'uninvited', at: [70.0, -0.8, 11.6], light: { pos: [70, 1.2, 11.25], color: 0xff2a10, intensity: 30, distance: 9 } } },
  { id: 'you', final: true, year: 1996, title: 'Upstairs', date: 'Nov. 1, 1996', hint: 'Finish the night',
    back: 'Someone always has to stay upstairs and keep watch until the next knock. The straw itches at first. Then you stop feeling anything at all.',
    who: 'The scarecrow upstairs is wearing your shirt.',
    shot: { room: 'attic', cam: [10.6, 4.55, 12.95], look: [6.2, 4.4, 12.55], mul: 0.8, hemi: 0.3, moon: 0, stage: 'scarecrow' } },
];

const Lost = {
  found: new Set(), img: {}, rt: null, glints: [], staged: {}, hinted: false, exploreT: 0,

  init() {
    this.found = new Set(Store.get('hyhm_lost_v1', []).filter((id) => LOST_DEFS.some((d) => d.id === id)));
    this.rt = new THREE.WebGLRenderTarget(PHOTO_RES, PHOTO_RES, { type: THREE.HalfFloatType, depthBuffer: true });
    // hiding spots: a glint that catches the eye (and the flashlight), and something to search
    for (const d of LOST_DEFS) {
      if (!d.spot) continue;
      const s = d.spot;
      const m = new THREE.SpriteMaterial({ map: glintTexture(), color: 0xfff2d8, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, transparent: true, fog: false, opacity: 0 });
      const sp = new THREE.Sprite(m); sp.scale.setScalar(0.3); sp.position.set(...s.glint); sp.visible = false; sp.renderOrder = 5;
      Render.scene.add(sp);
      this.glints.push({ d, sp, ph: Math.random() * 6 });
      W.addInteract({ id: 'lost_' + d.id, x: s.x, z: s.z, r: s.r, label: s.label, enabled: () => this.canSearch(d), use: () => this.take(d) });
    }
  },

  def(id) { return LOST_DEFS.find((d) => d.id === id); },
  has(id) { return this.found.has(id); },
  count() { return this.found.size; },
  add(id) {
    if (this.found.has(id)) return false;
    this.found.add(id); Store.set('hyhm_lost_v1', [...this.found]);
    return true;
  },
  // searching needs a quiet house: no fights, no cut scenes, nothing else on screen
  canSearch(d) {
    if (G.state !== 'play' || !Player.control || Photos.mode !== 'off' || UI.panelOpen || this.has(d.id)) return false;
    if (G.enemies.some((e) => !e.dead && (!e.bonus || e.home === Player.room)) || G.bosses.length) return false;
    return !G.arena || (G.inBasement && !!G.flags.basementCleared);
  },

  update(dt, t) {
    for (const g of this.glints) {
      const vis = G.state === 'play' && G.phase !== 'ending' && !this.has(g.d.id);
      g.sp.visible = vis;
      if (!vis) continue;
      // a camera-flash twinkle every few seconds, brighter when the flashlight sweeps over it
      const tw = Math.pow(Math.max(0, Math.sin(t * 2.1 + g.ph)), 10);
      const p = g.sp.position;
      const beam = Player.hasFlashlight && Player.spot.intensity > 20 && Player.inBeam(p.x, p.z, 9) ? 1 : 0;
      g.k = damp(g.k || 0, beam, 6, dt);
      g.sp.material.opacity = Math.min(1, 0.2 + tw * 0.8 + g.k * 0.45);
      g.sp.material.rotation = t * 0.6 + g.ph;
      g.sp.scale.setScalar(0.3 + tw * 0.45 + g.k * 0.2);
    }
    // one hint per session, a little while into the first quiet stretch
    if (!this.hinted && G.state === 'play' && G.phase === 'explore' && !G.paused && LOST_DEFS.some((d) => d.spot && !this.has(d.id))) {
      this.exploreT += dt;
      if (this.exploreT > 7) { this.hinted = true; UI.toast('Something glints in the dark. Old photos are hidden around the house.', 3200); }
    }
  },

  take(d) {
    if (!this.add(d.id)) return;
    Sfx.play('rustle', undefined, undefined, 0.9); Sfx.play('pickupWeapon');
    UI.flash(120, 0.2);
    this.show(d, 'found');
  },

  // ---------------- images ----------------
  // render the photo from the house (on first use, kept for the session), staged and aged to its year
  image(id) {
    if (this.img[id]) return this.img[id];
    const d = this.def(id);
    const cv = this.render(d, d.shot.stage, this.rt);
    return (this.img[id] = cv.toDataURL('image/jpeg', 0.88));
  },
  // shoot a photo (with its subject staged as `stage`) into rt; returns the aged 256 px canvas
  render(d, stage, rt) {
    const s = d.shot, cam = s.cam, look = s.look;
    const ph = { room: s.room, camPos: new THREE.Vector3(...cam), rt, door: false };
    const lx = look[0] - cam[0], ly = look[1] - cam[1], lz = look[2] - cam[2];
    ph.yaw = camYawTo(lx, lz); ph.pitch = Math.atan2(ly, Math.hypot(lx, lz));
    let undo = null;
    try {
      undo = this.stage(d, stage, cam);
      Photos.shoot(ph, { mul: s.mul, hemi: s.hemi, moon: s.moon, light: s.light });
    } catch (e) { console.error(e); }
    try { if (undo) undo(); } catch (e) { console.error(e); }
    const cv = Photos.bakeCanvas(rt.texture, { dark: s.dark || 0 });
    this.age(cv, d);
    return cv;
  },
  // develop every photo found in earlier runs (while the loading screen is up)
  prerender() { for (const id of this.found) { try { this.image(id); } catch (e) { console.error(e); } } },

  // put the photo's subject into the house for the shot; returns the undo
  stage(d, stage, cam) {
    const s = d.shot, undo = [];
    const toLens = (x, z) => Math.atan2(cam[0] - x, cam[2] - z);
    const put = (obj) => { Render.scene.add(obj); undo.push(() => Render.scene.remove(obj)); };
    if (stage === 'boss') {
      const rig = buildBoss(s.boss, true);
      rig.root.position.set(...s.at); rig.root.rotation.y = toLens(s.at[0], s.at[2]);
      if (rig.glb) poseRig(rig, s.boss, 'Idle', 0.4);
      put(rig.root);
      // (it stands in front of the wardrobe it came out of: the doors wide open)
      if (s.boss === 'boogey') { Boogey.pose(1); undo.push(() => Boogey.pose(Boogey.open)); }
    } else if (stage === 'dolls') {
      [[16.8, 0.64, 3.0], [17.45, 0, 3.35], [16.1, 0, 3.55]].forEach(([x, y, z], i) => {
        const rig = buildCritter('stitch', true);
        rig.root.position.set(x, y, z); rig.root.rotation.y = toLens(x, z) + (i - 1) * 0.35;
        if (rig.glb) poseRig(rig, 'stitch', 'Idle', 0.3 + i * 0.6);
        put(rig.root);
      });
    } else if (stage === 'candy') {
      const g = this.staged.candy || (this.staged.candy = this.makeCandy());
      put(g);
    } else if (stage === 'lanterns') {
      const g = this.staged.lanterns || (this.staged.lanterns = this.makeLanterns());
      put(g);
    } else if (stage === 'you' || stage === 'scarecrow') {
      // upstairs, under the bulb: you, or what you turn into up there (the same figure the ending uses: put back
      // the way it was)
      const F = this.figure(), was = { parent: F.g.parent, k: F.k, stage: F.stage, ghost: F.ghostOn, pos: F.g.position.clone(), ry: F.g.rotation.y };
      const av = W.attic.visible; W.attic.visible = true;
      this.setFigure(F, stage === 'you' ? 0 : 1, stage === 'you' ? 0 : 5); this.ghost(F, false);
      F.g.position.set(...ATTIC); F.g.rotation.y = toLens(ATTIC[0], ATTIC[2]);
      if (!was.parent) Render.scene.add(F.g);
      undo.push(() => {
        W.attic.visible = av;
        if (!was.parent) Render.scene.remove(F.g);
        F.g.position.copy(was.pos); F.g.rotation.y = was.ry;
        this.setFigure(F, Math.max(0, was.k), Math.max(0, was.stage)); this.ghost(F, !!was.ghost);
      });
    }
    return () => { for (let i = undo.length - 1; i >= 0; i--) undo[i](); };
  },
  // fourteen lanterns, one for every window: the porch, the steps and the path, all carved and lit
  makeLanterns() {
    const g = new THREE.Group();
    const spots = [[-4.95, 0, 14.1, 0.2], [-4.95, 0, 15.2, 0.24], [-4.95, 0, 20.8, 0.22], [-4.95, 0, 22.1, 0.2], [-0.5, 0, 16.2, 0.2], [-0.5, 0, 19.4, 0.22],
      [-7.1, -0.45, 17.3, 0.22], [-7.1, -0.45, 18.7, 0.2], [-8.6, -0.45, 16.9, 0.24], [-8.6, -0.45, 19.1, 0.21]];
    for (const [x, y, z, r] of spots) {
      const j = W.pumpkinDecor(g, x, y, z, r, 0xd8661a, true);
      j.rotation.y = Math.atan2(-11.6 - x, 15.0 - z) + rand(-0.4, 0.4);
      for (const m of W.glowMats(j)) m.emissiveIntensity = (m.userData.baseEI ?? 1) * 1.3;
    }
    setLayer(g, 1);
    return g;
  },
  // Dottie's stash spilled over the counter
  makeCandy() {
    const g = new THREE.Group();
    for (let i = 0; i < 12; i++) {
      const it = itemModel(i % 4 === 3 ? 'ChocoBar' : 'Candy', { s: 1.25, cast: false });
      if (!it) continue;
      it.position.set(rand(7.75, 9.55), 0.955, rand(0.4, 0.85)); it.rotation.set(0, rand(0, TAU), 0);
      g.add(it);
    }
    setLayer(g, 1);
    return g;
  },
  // ---------------- you, upstairs ----------------
  // One figure for the last photo and for the end: you, and what you turn into up there. k (0..1) hoists you onto
  // the crossbar (the head drops first, then the arms are pulled out, the feet leave the floor last); stage (0..5)
  // is what the attic has done to you so far: 1 straw for hands, 2 burlap for skin and straw for hair, 3 ropes at
  // the elbows and the wrists, straw out of the jeans and the shirt, 4 the sack over the head and the straw hat,
  // 5 the post, the crossbar and the crow
  figure() { return this._fig || (this._fig = this.makeFigure()); },
  makeFigure() {
    const g = new THREE.Group(); g.name = 'you';
    const c = buildPlayerModel(true);
    g.add(c.root);
    if (c.flashlight) c.flashlight.visible = false;
    const F = { g, c, k: -1, stage: -1, ghostOn: false, bones: [], hands: [], parts: [[], [], [], [], [], []], swaps: [], mats: new Set() };
    const rng = mulberry32(1996), rr = (a, b) => a + (b - a) * rng();
    // (its own materials: ghost() changes them)
    const burlap = new THREE.MeshStandardMaterial({ map: burlapTexture(), roughness: 1, metalness: 0 });
    // (the weave of the sack in relief: the last shot is a close-up of it)
    const sackM = new THREE.MeshStandardMaterial({ map: sackTexture(), bumpMap: sackTexture(), bumpScale: 1.4, color: 0xa89a80, roughness: 1, metalness: 0 });
    const straw = new THREE.MeshStandardMaterial({ map: strawTexture(), color: 0x9c8a66, roughness: 1, metalness: 0 });
    const own = (c) => Mat.lam(c, { unique: true, rough: 1 });
    const ropeTex = ropeTexture().clone(); ropeTex.repeat.set(6, 1); ropeTex.needsUpdate = true;
    const wood = own(0x3a2a1c), rope = new THREE.MeshStandardMaterial({ map: ropeTex, color: 0xb0a080, roughness: 1, metalness: 0 }), black = own(0x0e0d12), band = own(0x5a1010), beak = own(0x2a2620);
    const UP = new THREE.Vector3(0, 1, 0), Z = new THREE.Vector3(0, 0, 1);
    const add = (st, m) => { F.parts[st].push(m); return m; };
    // a tuft of straw: n strands from p, out along dir (made in figure space, hung on a bone afterwards)
    const strand = (parent, p, d, L, r) => {
      const m = mk(Geo.cone(r, 1, 4), straw, 0, 0, 0, parent);
      m.scale.set(1, L, 1); m.quaternion.setFromUnitVectors(UP, d); m.position.copy(p).addScaledVector(d, L * 0.45);
      return m;
    };
    const tuft = (st, p, dir, n, len, spread, r = 0.016) => {
      const out = [];
      for (let k = 0; k < n; k++) {
        const d = new THREE.Vector3(dir.x + rr(-spread, spread), dir.y + rr(-spread, spread), dir.z + rr(-spread, spread)).normalize();
        out.push(add(st, strand(g, p, d, len * rr(0.65, 1.25), r)));
      }
      return out;
    };
    let bar = { y: 1.45, z: -0.2, x: 0.78 };
    if (c.glb) {
      // (stage 2) burlap for skin, straw for hair, the clothes gone dull: the rig's materials are its own copies
      c.root.traverse((o) => {
        if (!o.isMesh || Array.isArray(o.material)) return;
        const m = o.material, n = m.name;
        let to = null;
        if (n === 'Skin') to = burlap;
        else if (n === 'Hair') to = straw;
        else if (n === 'Tee' || n === 'Flannel' || n === 'Denim' || n === 'Sneaker') {
          to = m.clone();
          if (n === 'Tee') to.color.setRGB(0.4, 0.34, 0.26); else if (n === 'Sneaker') to.color.setRGB(0.55, 0.5, 0.42); else to.color.multiplyScalar(0.82);
        }
        if (to) F.swaps.push({ mesh: o, from: m, to });
      });
      posePlayer(c, 'Idle', null, 0.2);
      const B = (n) => GLB.find(c.root, n);
      // hung on the crossbar: arms out, slack at the elbows, hands limp, the head fallen to one side, feet dangling.
      // Each bone: where it ends up, and when it moves (k range)
      const POSE = {
        spine: [[0.06, 0, 0.03], 0.2, 0.9], chest: [[0.05, 0, 0.02], 0.2, 0.9],
        armUpL: [[0, 0, SCARE.arm], 0.12, 0.75], armUpR: [[0, 0, -SCARE.arm], 0.12, 0.75],
        armLowL: [[0, 0, -SCARE.elbow], 0.3, 0.9], armLowR: [[0, 0, SCARE.elbow], 0.3, 0.9],
        handL: [[0.15, 0, -SCARE.hand], 0.35, 0.95], handR: [[0.15, 0, SCARE.hand], 0.35, 0.95],
        neck: [[0.08, 0, 0.1], 0, 0.55], head: [[0.12, 0.12, 0.38], 0, 0.6],
        legUpL: [[0.03, 0, 0.05], 0.5, 1], legUpR: [[-0.02, 0, -0.04], 0.5, 1],
        legLowL: [[0.14, 0, 0], 0.5, 1], legLowR: [[0.1, 0, 0], 0.5, 1],
        footL: [[0.7, 0, 0.08], 0.55, 1], footR: [[0.6, 0, -0.06], 0.55, 1],
      };
      for (const n in POSE) {
        const b = B(n); if (!b) continue;
        const [e, a0, a1] = POSE[n];
        F.bones.push({ b, q0: b.quaternion.clone(), q1: new THREE.Quaternion().setFromEuler(new THREE.Euler(e[0], e[1], e[2])), a0, a1 });
      }
      for (const n of ['handL', 'handR']) { const b = B(n); if (b) F.hands.push(b); }
      F.at = { head: B('head'), body: B('body'), footL: B('footL'), footR: B('footR'), handL: B('handL'), handR: B('handR') };
      // the ropes and the straw are made on the final pose, then hung on the bones that carry them
      for (const o of F.bones) o.b.quaternion.copy(o.q1);
      c.root.position.y = SCARE.lift;
      g.updateMatrixWorld(true);
      const P = (n) => { const b = B(n); return b ? b.getWorldPosition(new THREE.Vector3()) : new THREE.Vector3(); };
      const sh = [P('armUpL'), P('armUpR')], el = [P('armLowL'), P('armLowR')], wr = [P('handL'), P('handR')];
      bar = { y: (sh[0].y + el[0].y) / 2 - 0.08, z: P('chest').z - 0.2, x: Math.max(wr[0].x, -wr[1].x) + 0.1 };
      const hang = (bone, list) => { const b = B(bone); if (!b) return; g.updateMatrixWorld(true); for (const m of list) b.attach(m); };
      for (let s = 0; s < 2; s++) {
        const S = s ? 'R' : 'L';
        // ropes at the elbow and the wrist
        for (const [a, b, bone] of [[sh[s], el[s], 'armUp' + S], [el[s], wr[s], 'armLow' + S]]) {
          const d = b.clone().sub(a).normalize(), at = b.clone().addScaledVector(d, -0.05);
          const t = add(3, mk(Geo.torus(0.052, 0.014, 6, 18), rope, at.x, at.y, at.z, g));
          t.quaternion.setFromUnitVectors(Z, d);
          hang(bone, [t]);
        }
        // straw for hands, out of the cuffs
        const out = wr[s].clone().sub(el[s]).normalize(), cuff = wr[s].clone().addScaledVector(out, -0.03);
        hang('armLow' + S, tuft(1, cuff, out.clone().add(new THREE.Vector3(0, -0.9, 0)).normalize(), 12, 0.17, 0.55, 0.02));
        hang('armLow' + S, tuft(1, cuff, out, 6, 0.12, 0.6));
        // and out of the jeans at the ankles
        hang('legLow' + S, tuft(3, P('foot' + S).add(new THREE.Vector3(0, 0.05, 0)), new THREE.Vector3(0, -1, 0), 6, 0.11, 0.8));
      }
      // out from under the shirt
      const hip = P('body'), hem = [];
      for (let k = 0; k < 9; k++) { const a = (k / 8 - 0.5) * 4.2; hem.push(...tuft(3, hip.clone().add(new THREE.Vector3(Math.sin(a) * 0.17, -0.03, Math.cos(a) * 0.11)), new THREE.Vector3(Math.sin(a) * 0.5, -1, Math.cos(a) * 0.3), 1, 0.16, 0.25, 0.02)); }
      hang('body', hem);
      // the sack over the head with the face stitched on, tied at the neck; the straw hat
      const head = B('head');
      if (head) {
        F.sack = add(4, mk(Geo.sph(1, 24, 16), sackM, 0, SCARE.sack[0], SCARE.sack[1], head, { sx: SCARE.sack[2], sy: SCARE.sack[3], sz: SCARE.sack[4] }));
        const ty = SCARE.sack[0] - SCARE.sack[3] * 0.78;
        add(4, mk(Geo.torus(1, 0.16, 8, 28), rope, 0, ty, SCARE.sack[1], head, { rx: Math.PI / 2, s: SCARE.sack[2] * 0.66 }));
        for (let k = 0; k < 18; k++) {
          const a = k / 18 * TAU + rr(-0.15, 0.15);
          add(4, strand(head, new THREE.Vector3(Math.cos(a) * 0.08, ty - 0.01, SCARE.sack[1] + Math.sin(a) * 0.08), new THREE.Vector3(Math.cos(a) * 0.6 + rr(-0.2, 0.2), -1, Math.sin(a) * 0.6 + rr(-0.2, 0.2)).normalize(), 0.13 * rr(0.6, 1.3), 0.008));
        }
        const hat = F.hat = add(4, grp(head, 0, SCARE.sack[0] + SCARE.sack[3] * 0.74, SCARE.sack[1] - 0.01));
        hat.rotation.set(-0.08, 0, -0.14);
        mk(Geo.cyl(0.105, 0.128, 0.14, 14), straw, 0, 0.07, 0, hat);
        mk(Geo.cyl(0.25, 0.26, 0.016, 20), straw, 0, 0.004, 0, hat);
        mk(Geo.cyl(0.131, 0.131, 0.034, 14), band, 0, 0.03, 0, hat);
        for (let k = 0; k < 14; k++) { const a = k / 14 * TAU + rr(0, 0.3); strand(hat, new THREE.Vector3(Math.cos(a) * 0.12, -0.01, Math.sin(a) * 0.12), new THREE.Vector3(Math.cos(a), -0.9, Math.sin(a)).normalize(), 0.1 * rr(0.6, 1.3), 0.0065); }
      }
    }
    // (stage 5) the post, the crossbar and a cross foot to stand on; a crow on the end of the bar
    const H = bar.y + 0.32, pz = bar.z - 0.11;
    add(5, mk(Geo.box(0.12, H, 0.12), wood, 0, H / 2, pz, g));
    add(5, mk(Geo.box(bar.x * 2, 0.1, 0.1), wood, 0, bar.y, bar.z, g));
    for (const a of [0.6, 0.6 + Math.PI / 2]) add(5, mk(Geo.box(0.8, 0.07, 0.11), wood, 0, 0.035, pz, g, { ry: a }));
    const crow = F.crow = add(5, grp(g, bar.x - 0.09, bar.y + 0.05, bar.z + 0.01, -0.7));
    mk(Geo.sph(1, 10, 8), black, 0, 0.055, 0, crow, { sx: 0.05, sy: 0.055, sz: 0.09 });
    F.crowHead = grp(crow, 0, 0.11, 0.07);
    mk(Geo.sph(0.034, 8, 6), black, 0, 0, 0, F.crowHead);
    mk(Geo.cone(0.012, 0.05, 5), beak, 0, -0.005, 0.045, F.crowHead, { rx: Math.PI / 2 });
    mk(Geo.box(0.06, 0.012, 0.09), black, 0, 0.05, -0.1, crow, { rx: -0.35 });
    // (a real part of the scene at the end, not only of the photo: layer 0, and it throws shadows)
    setShadow(g, true, true); setLayer(g, 0);
    // (the brim would put the face in the dark under the bulb)
    if (F.hat) setShadow(F.hat, false, true);
    // every material the figure can wear (ghost() turns them all see-through at once)
    g.traverse((o) => { if (o.isMesh) F.mats.add(o.material); });
    for (const s of F.swaps) { F.mats.add(s.from); F.mats.add(s.to); }
    this.setFigure(F, 0, 0);
    return F;
  },
  setFigure(F, k, stage) {
    k = clamp(k, 0, 1);
    if (k !== F.k) {
      for (const o of F.bones) o.b.quaternion.slerpQuaternions(o.q0, o.q1, smoothstep(o.a0, o.a1, k));
      F.c.root.position.y = SCARE.lift * smoothstep(0.5, 1, k);
      F.k = k;
    }
    if (stage !== F.stage) {
      F.parts.forEach((list, i) => { for (const m of list) m.visible = stage >= i; });
      for (const b of F.hands) b.scale.setScalar(stage >= 1 ? 0.001 : 1);
      for (const s of F.swaps) s.mesh.material = stage >= 2 ? s.to : s.from;
      F.stage = stage;
    }
  },
  // see-through, but still throwing its shadow (on the stairs at the end the camera is in your head)
  ghost(F, on) {
    if (F.ghostOn === on) return;
    F.ghostOn = on;
    for (const m of F.mats) { m.colorWrite = !on; m.depthWrite = !on; }
  },
  // film stock of the year: sepia and scratches in the fifties, warm fade in the seventies, cool in the eighties.
  // The photos taken after the change are darker, with a red light leak creeping in
  age(cv, d) {
    const g = cv.getContext('2d'), w = cv.width, h = cv.height;
    const id = g.getImageData(0, 0, w, h), px = id.data, y = d.year, after = !!d.boss || !!d.final;
    const sep = y <= 1952 ? 0.95 : y <= 1958 ? 0.55 : y <= 1965 ? 0.25 : y <= 1972 ? 0.22 : y <= 1983 ? 0.06 : 0;
    const tint = y <= 1952 ? [1.06, 0.97, 0.8] : y <= 1958 ? [1.1, 0.98, 0.8] : y <= 1965 ? [1.05, 0.96, 0.9] : y <= 1972 ? [1.12, 1.0, 0.76] : y <= 1983 ? [0.97, 1.0, 1.05] : [0.96, 1.0, 1.06];
    const fade = y <= 1952 ? 0.14 : y <= 1972 ? 0.09 : 0.05, con = y <= 1958 ? 0.9 : y <= 1972 ? 0.94 : 1.04;
    const grain = y <= 1958 ? 0.09 : 0.05;
    let seed = 1 + d.id.length * 97;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const k = (j * w + i) * 4;
      let r = px[k] / 255, gg = px[k + 1] / 255, b = px[k + 2] / 255;
      const l = r * 0.3 + gg * 0.59 + b * 0.11;
      r = lerp(r, l * 1.07, sep) * tint[0]; gg = lerp(gg, l * 0.95, sep) * tint[1]; b = lerp(b, l * 0.74, sep) * tint[2];
      r = (r - 0.5) * con + 0.5; gg = (gg - 0.5) * con + 0.5; b = (b - 0.5) * con + 0.5;
      r = r * (1 - fade) + fade * 0.62; gg = gg * (1 - fade) + fade * 0.56; b = b * (1 - fade) + fade * 0.47;
      const dx = i / w - 0.5, dy = j / h - 0.5, v = 1 - (dx * dx + dy * dy) * (after ? 1.7 : 1.0), n = (rnd() - 0.5) * grain;
      r = r * v + n; gg = gg * v + n; b = b * v + n;
      if (after) { const lk = Math.max(0, 1 - Math.hypot(i / w - 1, j / h) * 1.7); r += lk * 0.24; gg += lk * 0.04; }
      px[k] = clamp(r, 0, 1) * 255; px[k + 1] = clamp(gg, 0, 1) * 255; px[k + 2] = clamp(b, 0, 1) * 255;
    }
    g.putImageData(id, 0, 0);
    if (y <= 1965) {
      // dust and hairline scratches
      g.globalAlpha = 0.32; g.strokeStyle = '#efe6d2'; g.lineWidth = 0.7;
      for (let s = 0; s < (y <= 1952 ? 8 : 4); s++) { const x0 = rnd() * w, y0 = rnd() * h; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0 + (rnd() - 0.5) * 30, y0 + rnd() * 70); g.stroke(); }
      g.globalAlpha = 1;
    }
  },

  // ---------------- UI ----------------
  card(d) {
    const img = this.has(d.id) ? this.image(d.id) : '';
    return `<div class="pol"><div class="img" style="${img ? `background-image:url(${img})` : ''}"></div><div class="cap">${d.title}</div></div>`;
  },
  backHTML(d) { return `<div class="back"><span class="date">${d.date}</span>${d.back}</div>${d.who ? `<div class="who">${d.who}</div>` : ''}`; },

  // a photo that was just found: large, with what was written on the back. The game waits
  show(d, how) {
    const head = how === 'boss' ? 'Stuck To The Back' : 'A Lost Polaroid';
    G.paused = true; Input.unlock(); UI.setPlaying(false);
    const c = UI.openPanel(`<h2>${head}</h2><div class="lost">${this.card(d)}<div>${this.backHTML(d)}<div class="cnt">LOST PHOTOS ${this.count()} / ${LOST_DEFS.length}</div></div></div><nav id="hy-pmenu"></nav>`, 'lost');
    const close = () => { if (UI.panelOpen !== 'lost') return; UI.closePanel(); G.paused = false; UI.setPlaying(true); };
    UI.setMenu(c.querySelector('#hy-pmenu'), [{ label: 'Keep it', action: close }], close);
  },
  // every lost photo: found ones open to their back, the others show a hint
  showGallery(back) {
    if (!Assets.laterDone) return Game.whenLoaded(() => this.showGallery(back));
    const cards = LOST_DEFS.map((d, i) => {
      if (this.has(d.id)) return `<button class="lcard" type="button" data-i="${i}"><div class="img" style="background-image:url(${this.image(d.id)})"></div><div class="cap">${d.title}</div></button>`;
      return `<div class="lcard no"><div class="img">?</div><div class="cap">${d.hint}</div></div>`;
    }).join('');
    const c = UI.openPanel(`<h2>Lost Photos</h2><p>${this.count()} of ${LOST_DEFS.length} found. They stay found, even if you start over.</p><div class="lgrid">${cards}</div><nav id="hy-pmenu"></nav>`, 'gallery');
    const found = [...c.querySelectorAll('.lcard[data-i]')];
    found.forEach((b) => b.addEventListener('click', () => { Sfx.ui('click'); this.showOne(LOST_DEFS[+b.dataset.i], () => this.showGallery(back)); }));
    UI.setMenu(c.querySelector('#hy-pmenu'), [{ label: 'Back', action: back }], back);
    // (the photos can be picked with the keys or a gamepad too, Back last)
    UI.menuItems = [...found, ...UI.menuItems]; UI.menuIndex = found.length; UI.menuGrid = true; UI.highlightMenu();
  },
  showOne(d, back) {
    const c = UI.openPanel(`<h2>${d.title}</h2><div class="lost">${this.card(d)}<div>${this.backHTML(d)}</div></div><nav id="hy-pmenu"></nav>`, 'gallery');
    UI.setMenu(c.querySelector('#hy-pmenu'), [{ label: 'Back', action: back }], back);
  },
  // the album row (Tab)
  albumRow() {
    const mini = LOST_DEFS.map((d) => this.has(d.id) ? `<div class="lm"><div class="img" style="background-image:url(${this.image(d.id)})"></div></div>` : '<div class="lm no"><div class="img"></div></div>').join('');
    return `<div class="lrow"><div class="lt">LOST PHOTOS ${this.count()} / ${LOST_DEFS.length}</div>${mini}</div>`;
  },
  // the last photo, held and developed at the very end: first you, upstairs, then what you turn into
  finalPh() {
    if (this._fin) return this._fin;
    const rt = () => new THREE.WebGLRenderTarget(PHOTO_RES, PHOTO_RES, { type: THREE.HalfFloatType, depthBuffer: true });
    return (this._fin = { id: 6, title: 'Upstairs', developed: 0, imageCanvas: null, rt: rt(), rtAfter: rt(), caption: captionTexture('Upstairs', 'x') });
  },
  // both versions are shot ahead of time (nothing stalls when it changes); the album keeps what it turned into
  shootFinal() {
    const f = this.finalPh(), d = this.def('you');
    f.imageCanvas = this.render(d, 'you', f.rt);
    this.img.you = this.render(d, 'scarecrow', f.rtAfter).toDataURL('image/jpeg', 0.88);
    return f;
  },
};

// =====================================================================
//  TITLE SHOT: now and then somebody walks past the lit windows (a shadow on the curtains): down the hall past
//  both front windows, or stopping in one to look out. And once you have seen the last lost photo, something
//  stands in the round attic window
// =====================================================================
const WinShadows = {
  FW: 0.83, FH: 2.08, TOP: 2.0,            // the walker texture on the curtain (a shadow, so a bit larger than life)
  quad: null, mat: null, wins: {}, cur: null, queue: [], wait: 3.5,

  init() {
    this.mat = new THREE.MeshBasicMaterial({ map: walkerTexture(), color: 0x0b0705, transparent: true, opacity: 0.88, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -8 });
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), this.mat);
    this.quad.castShadow = false; this.quad.receiveShadow = false; this.quad.visible = false;
    Render.scene.add(this.quad);
    for (const w of W.litWins || []) if (w.key) this.wins[w.key] = w;
  },
  // dir +1: to the right as seen from the yard. stop: seconds standing still in the middle; back: then turn round
  plan() {
    const r = Math.random(), d = Math.random() < 0.5 ? 1 : -1;
    if (r < 0.45) this.queue = [{ key: d > 0 ? 'hallA' : 'hallB', dir: d, speed: 0.95 }, { gap: rand(1.6, 2.6) }, { key: d > 0 ? 'hallB' : 'hallA', dir: d, speed: 0.95 }];
    else if (r < 0.8) this.queue = [{ key: Math.random() < 0.5 ? 'hallA' : 'hallB', dir: d, speed: 0.7, stop: rand(1.8, 3.2), back: Math.random() < 0.6 }];
    else this.queue = [{ key: 'kitchen', dir: d, speed: 1.1 }];
  },
  start(p) {
    const w = this.wins[p.key]; if (!w) return;
    this.quad.position.copy(w.pos); this.quad.rotation.set(0, w.ry, 0); this.quad.scale.set(w.w, w.h, 1); this.quad.visible = true;
    const span = w.w / 2 + this.FW / 2;
    this.cur = { w, dir: p.dir, speed: p.speed, stop: p.stop || 0, back: !!p.back, x: -p.dir * span, span, t: 0, held: -1 };
    this.layout();
  },
  layout(bob = 0) {
    const c = this.cur, w = c.w, t = this.mat.map;
    t.repeat.set(c.dir * w.w / this.FW, w.h / this.FH);
    t.offset.set(0.5 + c.dir * (-w.w / 2 - c.x) / this.FW, (w.y - w.h / 2 - (this.TOP - this.FH) - bob) / this.FH);
  },
  update(dt) {
    if (W.atticFigure) W.atticFigure.visible = Lost.has('you');
    if (G.state !== 'title') {
      if (this.quad && this.quad.visible) this.quad.visible = false;
      this.cur = null; this.queue = []; this.wait = rand(2.5, 4.5);
      return;
    }
    if (!this.quad) return;
    if (!this.cur) {
      this.quad.visible = false;
      const q = this.queue[0];
      if (q) { if (q.gap != null) { q.gap -= dt; if (q.gap <= 0) this.queue.shift(); } else this.start(this.queue.shift()); return; }
      this.wait -= dt;
      if (this.wait <= 0) { this.plan(); this.wait = rand(9, 18); }
      return;
    }
    const c = this.cur;
    c.t += dt;
    // halfway across: stand there a while (looking out), then go on or turn back
    if (c.stop > 0 && c.held < 0 && c.x * c.dir >= 0) c.held = 0;
    if (c.held >= 0 && c.held < c.stop) { c.held += dt; if (c.held >= c.stop) { c.stop = 0; if (c.back) c.dir = -c.dir; } this.layout(); return; }
    c.x += c.dir * c.speed * dt;
    this.layout(Math.abs(Math.sin(c.t * 6.2)) * 0.018);
    if (c.x * c.dir > c.span) { this.cur = null; this.quad.visible = false; }
  },
};

// =====================================================================
//  GAME FLOW: sequences, levels, intro, ending, menus, checkpoints
// =====================================================================
// =====================================================================
//  THE BOOGEYMAN'S WARDROBES: its special move, hide and seek. Copies of the bedroom wardrobe rise out of the floor
//  in a row facing the camera, it hides in one and they shuffle like cups in a shell game. While you pick, the
//  doors rattle; your flashlight makes the right one giggle. Hit one (swing, shoot, bomb) to choose it.
// =====================================================================
const Shells = {
  list: [], choosing: false, chosen: -1, urgency: 0, owner: null, eyeMat: null,
  canPlay() { return G.arena === 'bedroom' && !this.list.length; },
  // a row of n spots across the screen, on free floor, a few metres up the screen from you (null: no room)
  layout(n) {
    const rm = ROOMS[G.arena || 'bedroom'], R = Cam.rightVec, F = Cam.fwdVec, pl = Player.pos, sp = 2.25;
    const want = { x: pl.x + F.x * 3.6, z: pl.z + F.z * 3.6 };
    let best = null, bd = 1e9;
    const foot = [[0, 0], [0.85, 0], [-0.85, 0], [0, 0.42], [0, -0.42], [0.85, 0.4], [-0.85, 0.4], [0.85, -0.4], [-0.85, -0.4]];
    for (let gx = rm.x0 + 1.5; gx <= rm.x1 - 1.5; gx += 0.5) for (let gz = rm.z0 + 1.5; gz <= rm.z1 - 1.5; gz += 0.5) {
      const d = dist(gx, gz, want.x, want.z);
      if (d >= bd) continue;
      const pts = [];
      let ok = true;
      for (let i = 0; i < n && ok; i++) {
        const o = (i - (n - 1) / 2) * sp, x = gx + R.x * o, z = gz + R.z * o;
        if (x < rm.x0 + 1.0 || x > rm.x1 - 1.0 || z < rm.z0 + 1.0 || z > rm.z1 - 1.0 || dist(x, z, pl.x, pl.z) < 2.0) { ok = false; break; }
        // its footprint (1.8 x 0.8, front to the camera) must be free floor
        for (const [a, b] of foot) if (!Flow.free(x + R.x * a - F.x * b, z + R.z * a - F.z * b)) { ok = false; break; }
        pts.push({ x, z });
      }
      if (ok) { bd = d; best = pts; }
    }
    return best;
  },
  model() {
    let g, doors = [];
    if (Assets.has('props_bedroom')) {
      g = Assets.inst('props_bedroom', { nodes: ['Wardrobe'], name: 'shell', cast: true, receive: true });
      doors = [GLB.find(g, 'WardrobeDoorL'), GLB.find(g, 'WardrobeDoorR')];
    } else { g = new THREE.Group(); mk(Geo.box(1.7, 2.2, 0.7), Mat.lam(0x3a2418), 0, 1.1, 0, g); }
    return { g, doors };
  },
  eyes(parent) {
    const m = this.eyeMat || (this.eyeMat = new THREE.SpriteMaterial({ map: glowTexture(), color: 0xffc83a, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false }));
    const e = new THREE.Group();
    for (const sx of [-0.085, 0.08]) { const sp = new THREE.Sprite(m); sp.scale.setScalar(sx < 0 ? 0.22 : 0.16); sp.position.set(sx, 1.86, 0.47); e.add(sp); }
    e.visible = false; parent.add(e);
    return e;
  },
  start(spots, real, owner) {
    this.clear(); this.owner = owner;
    const yaw = Math.atan2(-Cam.fwdVec.x, -Cam.fwdVec.z);
    spots.forEach((p, i) => {
      const { g, doors } = this.model();
      const root = new THREE.Group(); root.add(g); Render.scene.add(root);
      this.list.push({ root, g, doors, eyes: this.eyes(g), x: p.x, z: p.z, yaw, real: i === real, idx: i, y: -2.5, rise: -i * 0.12, open: 0, opening: false,
        peekT: 0, lit: 0, giggleCd: 0, move: null, hop: 0, tilt: 0, sinking: false, sink: 0, gone: false });
    });
    Sfx.play('wardrobe', spots[0].x, spots[0].z, 1.1); Cam.shake(0.35);
  },
  risen() { return this.list.every((s) => s.rise >= 1); },
  peek(dur) { for (const s of this.list) if (s.real) s.peekT = dur; },
  front(s) { return { x: Math.sin(s.yaw), z: Math.cos(s.yaw) }; },
  swap(i, j, dur) {
    const A = this.list[i], B = this.list[j];
    A.move = { x0: A.x, z0: A.z, x1: B.x, z1: B.z, t: 0, dur, side: 1 };
    B.move = { x0: B.x, z0: B.z, x1: A.x, z1: A.z, t: 0, dur, side: -1 };
    Sfx.play('scrape', (A.x + B.x) / 2, (A.z + B.z) / 2, 0.9);
  },
  moving() { return this.list.some((s) => s.move); },
  // a wardrobe bursts open: the real one lets it out, an empty one spills moths and a lost sock
  burst(s, spill) {
    if (s.opening) return;
    s.opening = true; s.peekT = 0;
    const f = this.front(s);
    Sfx.play('doorSlam', s.x, s.z, 0.8); Cam.shake(0.3);
    FX.burst(s.x + f.x * 0.6, 1.2, s.z + f.z * 0.6, 0x5a4a3a, 14, 3, { size: 0.1, life: 1.0, grav: 2 });
    if (!spill) return;
    Sfx.play('flutter', s.x, s.z, 1.1);
    const moths = G.enemies.reduce((k, e) => k + (e.type === 'moth' && !e.dead ? 1 : 0), 0);
    for (let i = 0; i < 1 && moths + i < 5; i++) {
      const a = Math.atan2(f.x, f.z) + rand(-0.7, 0.7);
      const c = new Critter('moth', s.x + f.x * 0.7, s.z + f.z * 0.7, 'burst');
      c.burstDir.set(Math.sin(a), 0, Math.cos(a)); c.alt = 0.45; c.yaw = a;
      G.enemies.push(c);
    }
    if (Math.random() < 0.4 && G.enemies.reduce((k, e) => k + (e.type === 'sock' && !e.dead ? 1 : 0), 0) < 2) Waves.spawnOne('sock', s.x + f.x * 1.15, s.z + f.z * 1.15, true);
  },
  sinkAll(delay = 0) { for (const s of this.list) if (!s.sinking) { s.sinking = true; s.sink = -delay / 0.6; } },
  // is x, z inside wardrobe s (grown by r)? (its local frame: width along x, depth along z)
  inside(s, x, z, r) {
    const c = Math.cos(s.yaw), sn = Math.sin(s.yaw), dx = x - s.x, dz = z - s.z;
    return Math.abs(dx * c - dz * sn) < 0.9 + r && Math.abs(dx * sn + dz * c) < 0.42 + r;
  },
  solid(s) { return s.y > -1.4 && !s.gone; },
  choose(s) {
    if (!this.choosing || this.chosen >= 0) return;
    this.chosen = this.list.indexOf(s);
    Sfx.play('wardrobe', s.x, s.z, 0.9);
    s.tilt = 0.06;
  },
  // the player's hits (true when a wardrobe took it)
  hitSeg(x0, z0, x1, z1, r) {
    if (!this.list.length) return false;
    for (const s of this.list) {
      if (!this.solid(s)) continue;
      for (let k = 0; k <= 4; k++) { const t = k / 4; if (this.inside(s, lerp(x0, x1, t), lerp(z0, z1, t), r)) { this.choose(s); FX.sparks(lerp(x0, x1, t), 1.0, lerp(z0, z1, t), 0xc8a070, 5, 2); return true; } }
    }
    return false;
  },
  hitArc(px, pz, yaw, range, arc) {
    let best = null, bd = 1e9;
    for (const s of this.list) {
      if (!this.solid(s)) continue;
      const d = dist(px, pz, s.x, s.z);
      if (d > range + 1.0 || d > bd) continue;
      if (d > 1.1 && Math.abs(angDiff(yaw, Math.atan2(s.x - px, s.z - pz))) > arc + 0.35) continue;
      best = s; bd = d;
    }
    if (best) { this.choose(best); Sfx.play('wardrobe', best.x, best.z, 0.7); }
    return !!best;
  },
  hitRadius(x, z, R) {
    let best = null, bd = 1e9;
    for (const s of this.list) { if (!this.solid(s)) continue; const d = dist(x, z, s.x, s.z); if (d < R + 0.8 && d < bd) { bd = d; best = s; } }
    if (best) this.choose(best);
  },
  push(pos, r, s) {
    const c = Math.cos(s.yaw), sn = Math.sin(s.yaw), dx = pos.x - s.x, dz = pos.z - s.z;
    const lx = dx * c - dz * sn, lz = dx * sn + dz * c, hx = 0.9 + r, hz = 0.42 + r;
    if (Math.abs(lx) >= hx || Math.abs(lz) >= hz) return;
    let nx = lx, nz = lz;
    if (hx - Math.abs(lx) < hz - Math.abs(lz)) nx = sign(lx) * hx; else nz = sign(lz) * hz;
    pos.x = s.x + nx * c + nz * sn; pos.z = s.z - nx * sn + nz * c;
  },
  update(dt) {
    if (!this.list.length) return;
    const pl = Player, F = Cam.fwdVec;
    for (const s of this.list) {
      // up out of the floor / back down
      if (s.sinking) {
        s.sink += dt / 0.6;
        s.y = -easeIn(clamp(s.sink, 0, 1)) * 2.6;
        if (s.sink > 0 && s.sink < 0.9 && Math.random() < 0.4) Particles.dust.emit(s.x + rand(-0.9, 0.9), 0.05, s.z + rand(-0.5, 0.5), rand(-1, 1), rand(1, 3), rand(-1, 1), 0.7, 0.66, 0.6, 0.8, 0.12, 1.0, 2, 1);
        if (s.sink >= 1) s.gone = true;
      } else if (s.rise < 1) {
        s.rise = Math.min(1, s.rise + dt / 0.85);
        const k = clamp(s.rise, 0, 1);
        s.y = -2.5 * (1 - easeOutBack(k));
        if (k > 0 && k < 0.8 && Math.random() < 0.5) Particles.dust.emit(s.x + rand(-0.9, 0.9), 0.05, s.z + rand(-0.5, 0.5), rand(-1, 1), rand(1.5, 4), rand(-1, 1), 0.7, 0.66, 0.6, 0.9, 0.12, 1.2, 2, 1);
        if (k >= 1) { s.y = 0; Sfx.play('wardrobe', s.x, s.z, 0.6); }
      }
      // a swap: along a half circle (one passes in front, the other behind), a hop and a lean
      if (s.move) {
        const m = s.move; m.t += dt;
        const k = clamp(m.t / m.dur, 0, 1), e = easeInOut(k);
        const hx = (m.x1 - m.x0) / 2, hz = (m.z1 - m.z0) / 2, half = Math.hypot(hx, hz);
        s.x = (m.x0 + m.x1) / 2 - hx * Math.cos(Math.PI * e) - F.x * Math.sin(Math.PI * e) * half * 0.55 * m.side;
        s.z = (m.z0 + m.z1) / 2 - hz * Math.cos(Math.PI * e) - F.z * Math.sin(Math.PI * e) * half * 0.55 * m.side;
        s.hop = Math.sin(Math.PI * e) * 0.14; s.tilt = Math.sin(TAU * e) * 0.07 * m.side;
        if (Math.random() < 0.3) Particles.dust.emit(s.x + rand(-0.8, 0.8), 0.05, s.z + rand(-0.4, 0.4), 0, rand(0.5, 1.5), 0, 0.7, 0.66, 0.6, 0.6, 0.1, 0.8, 1.5, 1);
        if (k >= 1) { s.x = m.x1; s.z = m.z1; s.move = null; s.hop = 0; s.tilt = 0; }
      } else s.tilt = damp(s.tilt, 0, 6, dt);
      // the doors: shut and rattling while you choose (harder as the time runs out), flung open when it bursts
      if (s.opening) s.open = Math.min(1, s.open + dt * 7);
      let rat = 0;
      if (this.choosing) rat = 0.015 + 0.06 * this.urgency * (0.5 + 0.5 * Math.sin(G.time * 9 + s.idx * 2.1));
      if (s.peekT > 0) { s.peekT -= dt; rat = Math.max(rat, 0.06); }
      s.eyes.visible = s.peekT > 0 && s.real && Math.sin(G.time * 4) > -0.85;
      if (s.doors[0]) s.doors[0].rotation.y = -(s.open * 1.9 + Math.max(0, rat * Math.sin(G.time * 51 + s.idx)));
      if (s.doors[1]) s.doors[1].rotation.y = s.open * 1.9 + Math.max(0, rat * Math.sin(G.time * 47 + s.idx * 2));
      // your light: the right one giggles and peeks out
      s.giggleCd -= dt;
      if (this.choosing && pl.hasFlashlight && pl.spot.intensity > 20 && pl.inBeam(s.x, s.z, 10)) {
        s.lit += dt;
        if (s.lit > 0.2 && s.real && s.giggleCd <= 0) { s.giggleCd = 1.3; s.peekT = 1.0; Sfx.play('giggle', s.x, s.z, 1.1, { pitch: 0.55 }); }
      } else s.lit = Math.max(0, s.lit - dt * 2);
      s.root.position.set(s.x, s.y + s.hop, s.z);
      s.root.rotation.set(0, s.yaw, s.tilt);
      // solid: you and the critters walk round it
      if (this.solid(s)) {
        this.push(pl.pos, 0.33, s);
        for (const e of G.enemies) if (!e.dead && !e.def.fly) this.push(e.pos, e.def.r, s);
      }
    }
    if (this.list.some((s) => s.gone)) {
      for (const s of this.list) if (s.gone) Render.scene.remove(s.root);
      this.list = this.list.filter((s) => !s.gone);
    }
    // the hidden Boogeyman rides along in its wardrobe
    const o = this.owner;
    if (o && o.hidden && !o.dead) { const r = this.list.find((s) => s.real); if (r) { o.pos.x = r.x; o.pos.z = r.z; } }
  },
  clear() {
    for (const s of this.list) Render.scene.remove(s.root);
    this.list = []; this.choosing = false; this.chosen = -1; this.owner = null; this.urgency = 0;
  },
};

// =====================================================================
//  THE BEDROOM WARDROBE: until the Boogeyman is out, now and then its doors rattle and something looks out of the
//  crack while you are in the bedroom. Open it (Game.seqBoogeyman) and it comes out. Once it is beaten the doors
//  stay ajar on Dad's old coats.
// =====================================================================
const Boogey = {
  wd: null, doors: [], eyes: null, open: 0, override: null, fast: false, rattle: 0, peekT: 0, teaseT: 5, told: false,
  init(wd) {
    this.wd = wd || null;
    if (!wd) return;
    this.doors = [GLB.find(wd, 'WardrobeDoorL'), GLB.find(wd, 'WardrobeDoorR')];
    this.eyes = Shells.eyes(wd);
  },
  pending() { return !(G.side && G.side.boogey); },
  canOpen() {
    return !!this.wd && G.state === 'play' && G.phase === 'explore' && Player.control && !G.arena && !G.bosses.length && this.pending() &&
      !!Photos.current && Photos.current.developed >= 1 && Photos.mode === 'off' && !TVSmash.threat();
  },
  // set the doors right now (the lost photo is shot between frames)
  pose(open) {
    if (this.doors[0]) this.doors[0].rotation.y = -open * 1.9;
    if (this.doors[1]) this.doors[1].rotation.y = open * 1.9;
  },
  reset() { this.override = null; this.fast = false; this.rattle = 0; this.peekT = 0; this.teaseT = 5; },
  update(dt) {
    if (!this.wd) return;
    const live = G.bosses.some((b) => b.type === 'boogey' && !b.dead);
    const target = this.override != null ? this.override : (!this.pending() || live ? 0.62 : 0);
    this.open = damp(this.open, target, this.fast ? 16 : 3, dt);
    if (this.pending() && this.override == null && G.state === 'play' && G.phase === 'explore' && !G.arena && Player.room === 'bedroom' && !G.paused) {
      this.teaseT -= dt;
      if (this.teaseT <= 0) {
        this.teaseT = rand(7, 13); this.rattle = 0.9;
        if (Math.random() < 0.65) this.peekT = 1.2;
        Sfx.play('rattle', 15.9, 12.9, 0.8);
        if (!this.told) { this.told = true; UI.toast('Something is scratching inside the wardrobe.', 2600); }
      }
    }
    this.rattle = Math.max(0, this.rattle - dt); this.peekT = Math.max(0, this.peekT - dt);
    const r = this.rattle > 0 ? 0.045 * Math.max(0, Math.sin(G.time * 55)) * Math.min(1, this.rattle * 2) : 0;
    if (this.doors[0]) this.doors[0].rotation.y = -(this.open * 1.9 + r);
    if (this.doors[1]) this.doors[1].rotation.y = this.open * 1.9 + r * 0.8;
    if (this.eyes) this.eyes.visible = this.peekT > 0 && Math.sin(G.time * 3.3) > -0.8;
  },
};

const LEVELS = [
  { n: 1, title: 'Pumpkin Patch', minion: 'pumpkin', boss: 'jack', arena: 'hall', quota: 18, start: 7, maxAlive: 7, weaponDrop: 'nailgun', weaponAt: 4, clock: 23 * 60 + 52, hint: 'Pumpkins and hay. Somewhere in the hallway.', bossAt: [7.5, 19.0], grade: 'pumpkin' },
  { n: 2, title: 'Sweet Tooth', minion: 'candy', boss: 'maw', arena: 'kitchen', quota: 22, start: 8, maxAlive: 8, weaponDrop: 'shotgun', weaponAt: 6, clock: 24 * 60 + 38, hint: 'Candy jars on a counter. The kitchen.', bossAt: [8.0, 6.5], tag: "if it's sweet, we can kill it." }, // Predator
  { n: 3, title: 'Stitchlings', minion: 'stitch', boss: 'stitches', arena: 'living', quota: 18, start: 7, maxAlive: 8, weaponDrop: 'bombbag', weaponAt: 5, clock: 25 * 60 + 31, hint: 'An armchair full of plush toys. The living room.', bossAt: [22.0, 6.8], tag: "we're gonna need a bigger needle." }, // Jaws
  { n: 4, title: 'Nightlights', minion: 'ghost', boss: 'visitor', arena: 'bedroom', quota: 20, start: 7, maxAlive: 8, weaponDrop: null, clock: 26 * 60 + 27, hint: 'A bed and a little nightlight.', bossAt: [22.0, 18.0], tag: 'i see LED people.' }, // The Sixth Sense
  { n: 5, title: 'Little Devils', minion: 'devil', boss: 'uninvited', arena: 'basement', quota: 30, start: 8, maxAlive: 10, weaponDrop: null, clock: 27 * 60 + 33, hint: 'Under the stairs. That door was never there.', bossAt: [70.0, 11.25], tag: 'the first rule of fright club: no biting.' }, // Fight Club
];

function* until(fn) { while (!fn()) yield; }

const Seq = {
  list: [],
  run(gen) { const s = { gen, done: false }; this.list.push(s); this.step(s, 0); return s; },
  step(s, dt) { try { const r = s.gen.next(dt); if (r.done) s.done = true; } catch (e) { s.done = true; console.error(e); } },
  update(dt) { for (const s of this.list.slice()) if (!s.done) this.step(s, dt); this.list = this.list.filter((s) => !s.done); },
  clear() { for (const s of this.list) { try { s.gen.return(); } catch (e) { /* ignore */ } } this.list = []; },
};

// =====================================================================
//  THE ARCADE MACHINE in the bedroom: Sir Falls-A-Lot: Halloween Edition (sirfallsalot.js)
// =====================================================================
// The cabinet's screen while nobody plays it: the attract mode. The title picture (baked into the cabinet's GLB)
// with INSERT COIN blinking, stars and a bat over the moon, then tonight's hi-score with pumpkins and the lava; the
// last picture of a game left paused; and once the house is haunted, now and then, something that should not be on
// it. A 384 x 512 canvas (the screen's emissive map), redrawn ten times a second while you are in the bedroom
const ArcadeScreen = {
  W: 384, H: 512, base: null, tex: null, g: null, mat: null, fx: null, t: 0, acc: 1,
  glitchT: 0, nextGlitch: 30, glitchText: '',

  // the title picture, copied out of the cabinet's GLB while its decoded image is still there (Assets.loadAll)
  grab(A) {
    try {
      const m = A && A.materials.find((x) => x.name === 'ArcadeScreen'), img = m && m.emissiveMap && m.emissiveMap.image;
      if (!img || !img.width || img.closed || typeof document === 'undefined') return;
      const c = Tex.canvas(this.W, this.H);
      c.getContext('2d').drawImage(img, 0, 0, this.W, this.H);
      this.base = c;
    } catch (e) { this.base = null; }
  },
  init(mat) {
    if (typeof document === 'undefined') return;
    const W = this.W, H = this.H;
    this.tex = Tex.make('arcade_screen', W, H, (g) => { g.fillStyle = '#06020c'; g.fillRect(0, 0, W, H); }, { clamp: true, smooth: true });
    this.tex.flipY = false; // (glTF uv convention: v = 0 at the top)
    this.g = this.tex.userData.canvas.getContext('2d');
    // the tube, drawn once: scanlines and dark corners
    const scan = Tex.canvas(W, H), sg = scan.getContext('2d');
    sg.fillStyle = 'rgba(0,0,0,0.16)';
    for (let y = 0; y < H; y += 3) sg.fillRect(0, y, W, 1);
    const vig = Tex.canvas(W, H), vg = vig.getContext('2d'), rg = vg.createRadialGradient(W / 2, H / 2, H * 0.32, W / 2, H / 2, H * 0.74);
    rg.addColorStop(0, 'rgba(0,0,0,0)'); rg.addColorStop(1, 'rgba(0,0,0,0.55)');
    vg.fillStyle = rg; vg.fillRect(0, 0, W, H);
    // (stars where the picture has night sky: the top corners)
    const rng = mulberry32(31), stars = [];
    for (let i = 0; i < 14; i++) {
      const left = i % 2 === 0;
      stars.push({ x: Math.floor(left ? 4 + rng() * 52 : W - 56 + rng() * 52), y: Math.floor(4 + rng() * 64), r: rng() < 0.3 ? 2 : 1, sp: 1.3 + rng() * 2.6, ph: rng() * TAU });
    }
    this.fx = { scan, vig, stars };
    this.mat = mat || null;
    if (mat) { mat.emissiveMap = this.tex; if (mat.emissive) mat.emissive.set(0xffffff); mat.needsUpdate = true; }
    this.draw();
  },

  update(dt) {
    if (!this.tex) return;
    this.t += dt;
    if (this.glitchT > 0) this.glitchT -= dt;
    else if (G.haunted && G.state === 'play' && Player.room === 'bedroom' && !G.arcade && !G.paused && !G.arena) {
      // something on the screen that should not be there (the haunted house, now and then, a fifth of a second)
      this.nextGlitch -= dt;
      if (this.nextGlitch <= 0) {
        this.nextGlitch = rand(28, 55); this.glitchT = 0.22; this.acc = 1;
        this.glitchText = pick(['BEHIND YOU', 'PLAY WITH ME', 'LET ME OUT', 'GAME OVER']);
        Sfx.play('tapeHiss', Arcade.C.x, Arcade.C.z, 0.5);
      }
    }
    // (only while it can be seen: you in the bedroom, or the camera on its way to or from the machine)
    const seen = (G.state === 'play' && Player.room === 'bedroom' && !G.paused) || G.arcade === 'in' || G.arcade === 'out';
    if (!seen) return;
    this.acc += dt;
    if (this.acc < 0.1) return;
    this.acc = 0;
    this.draw();
  },

  draw() {
    const g = this.g, W = this.W, H = this.H, t = this.t, M = Arcade.machine;
    if (!g) return;
    g.save();
    const snap = M && M.snapshot;
    if (snap) this.pagePaused(g, snap, t, M);
    else if (t % 13 < 8.5) this.pageTitle(g, t);
    else this.pageScore(g, t, M);
    if (this.glitchT > 0) this.pageGlitch(g);
    g.globalAlpha = 1;
    g.drawImage(this.fx.scan, 0, 0);
    // a slow roll bar, the dark corners of the tube
    const ry = ((t * 0.11) % 1.4 - 0.2) * H, rb = g.createLinearGradient(0, ry - 46, 0, ry + 46);
    rb.addColorStop(0, 'rgba(220,210,255,0)'); rb.addColorStop(0.5, 'rgba(220,210,255,0.07)'); rb.addColorStop(1, 'rgba(220,210,255,0)');
    g.fillStyle = rb; g.fillRect(0, ry - 46, W, 92);
    g.drawImage(this.fx.vig, 0, 0);
    g.restore();
    this.tex.needsUpdate = true;
  },
  text(g, s, x, y, px, col, font = 'VT323', glow = null) {
    g.font = px + 'px ' + (font === 'Creepster' ? 'Creepster, Impact, sans-serif' : 'VT323, "Courier New", monospace');
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
    g.lineWidth = Math.max(3, px * 0.12); g.strokeStyle = 'rgba(10,3,16,0.95)';
    if (glow) { g.shadowColor = glow; g.shadowBlur = px * 0.35; }
    g.strokeText(s, x, y);
    g.fillStyle = col; g.fillText(s, x, y);
    g.shadowBlur = 0; g.shadowColor = 'rgba(0,0,0,0)';
  },
  pageTitle(g, t) {
    const W = this.W, H = this.H;
    if (this.base) g.drawImage(this.base, 0, 0, W, H);
    else {
      // (no picture: the title written out)
      const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#1a0830'); bg.addColorStop(1, '#3a1004');
      g.fillStyle = bg; g.fillRect(0, 0, W, H);
      this.text(g, 'SIR', W / 2, 120, 70, '#ffb030', 'Creepster', 'rgba(255,120,30,0.7)');
      this.text(g, 'FALLS-A-LOT', W / 2, 192, 58, '#ff8a1a', 'Creepster', 'rgba(255,120,30,0.7)');
      this.text(g, 'HALLOWEEN EDITION', W / 2, 252, 32, '#8dff4a');
      for (let i = 0; i < 3; i++) this.pumpkin(g, W / 2 + (i - 1) * 100, 360, 30, t + i);
      if (t % 1.1 < 0.62) this.text(g, 'INSERT COIN', W / 2, 474, 36, '#ffd07a', 'VT323', 'rgba(255,170,60,0.6)');
    }
    // stars twinkle, a bat crosses the moon
    for (const s of this.fx.stars) {
      const a = Math.sin(t * s.sp + s.ph); if (a < 0.35) continue;
      g.fillStyle = 'rgba(255,244,226,' + (a * 0.95).toFixed(2) + ')'; g.fillRect(s.x, s.y, s.r, s.r);
      if (s.r > 1 && a > 0.85) { g.fillRect(s.x - 2, s.y, 6, 1); g.fillRect(s.x, s.y - 2, 1, 6); }
    }
    const bt = t % 9;
    if (bt < 3.4) { const k = bt / 3.4; this.bat(g, W + 30 - k * (W + 70), 96 - k * 46 + Math.sin(k * 15) * 7, 0.75 + 0.35 * Math.abs(Math.sin(t * 16))); }
    // INSERT COIN blinks (the band behind the words is laid back over them)
    if (this.base && t % 1.1 > 0.62) g.drawImage(this.base, 4, 455, 6, 40, 88, 455, 208, 40);
  },
  pageScore(g, t, M) {
    const W = this.W, H = this.H;
    let best = 0;
    try { best = M ? M.best() : +(localStorage.getItem('sfal-halloween-best') || 0); } catch (e) { best = 0; }
    const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#0d0418'); bg.addColorStop(0.65, '#1c0828'); bg.addColorStop(1, '#2a0a08');
    g.fillStyle = bg; g.fillRect(0, 0, W, H);
    // the moon, the haunted tower in the dark behind the words
    const mg = g.createRadialGradient(306, 66, 8, 306, 66, 60); mg.addColorStop(0, 'rgba(255,186,96,0.42)'); mg.addColorStop(0.7, 'rgba(255,140,60,0.18)'); mg.addColorStop(1, 'rgba(255,140,60,0)');
    g.fillStyle = mg; g.fillRect(240, 0, 144, 132);
    g.fillStyle = '#12061c'; g.fillRect(134, 236, 116, H - 236);
    for (let i = 0; i < 5; i++) g.fillRect(134 + i * 26, 222, 14, 16);
    g.fillStyle = 'rgba(255,170,60,' + (0.55 + 0.25 * Math.sin(t * 5.1)).toFixed(2) + ')'; g.fillRect(184, 420, 14, 22);
    this.text(g, 'HI-SCORE', W / 2, 92, 62, '#ff9a2e', 'Creepster', 'rgba(255,120,30,0.75)');
    this.text(g, Math.floor(best || 0).toLocaleString('en-US'), W / 2, 166, 74, '#ffd08a', 'VT323', 'rgba(255,170,60,0.6)');
    this.text(g, "TONIGHT'S BEST", W / 2, 214, 28, '#b9a6cc');
    for (let i = 0; i < 3; i++) this.pumpkin(g, W / 2 + (i - 1) * 100, 292 + Math.sin(t * 2.2 + i * 1.3) * 6, i === 1 ? 34 : 28, t + i * 1.7);
    this.text(g, 'GRAB THE PUMPKINS', W / 2, 360, 30, '#e9dcff');
    this.text(g, 'BEAT THE LAVA', W / 2, 392, 30, '#e9dcff');
    if (t % 1.1 < 0.66) this.text(g, 'FREE PLAY TONIGHT', W / 2, 436, 32, '#8dff4a', 'VT323', 'rgba(120,255,60,0.55)');
    // the lava down below
    const ly = H - 36 + Math.sin(t * 1.3) * 3, lg = g.createLinearGradient(0, ly - 18, 0, H);
    lg.addColorStop(0, 'rgba(255,90,10,0)'); lg.addColorStop(0.3, 'rgba(255,110,20,0.9)'); lg.addColorStop(1, '#ffd060');
    g.fillStyle = lg; g.beginPath(); g.moveTo(0, H);
    for (let x = 0; x <= W; x += 12) g.lineTo(x, ly + Math.sin(x * 0.05 + t * 3) * 5 + Math.sin(x * 0.13 - t * 2) * 3);
    g.lineTo(W, H); g.closePath(); g.fill();
  },
  pagePaused(g, snap, t, M) {
    const W = this.W, H = this.H, y = H * 0.42;
    g.drawImage(snap, 0, 0, W, H);
    g.fillStyle = 'rgba(8,3,16,0.45)'; g.fillRect(0, 0, W, H);
    if (t % 1.3 < 0.85) this.text(g, 'PAUSED', W / 2, y, 76, '#ffd08a', 'VT323', 'rgba(255,160,60,0.7)');
    this.text(g, 'SCORE ' + M.score.toLocaleString('en-US'), W / 2, y + 62, 32, '#e9dcff');
    this.text(g, 'THE KNIGHT WAITS', W / 2, y + 98, 28, '#8dff4a');
  },
  pageGlitch(g) {
    const W = this.W, H = this.H, c = g.canvas;
    for (let i = 0; i < 7; i++) { const y = Math.random() * H, h = 4 + Math.random() * 26; g.drawImage(c, 0, y, W, h, (Math.random() - 0.5) * 44, y, W, h); }
    g.fillStyle = 'rgba(150,0,10,0.28)'; g.fillRect(0, 0, W, H);
    this.text(g, this.glitchText, W / 2, H * 0.5, 66, '#ff1a24', 'Creepster', 'rgba(255,0,0,0.9)');
  },
  bat(g, x, y, f) {
    g.save(); g.translate(x, y); g.scale(1.3, 1.3 * f);
    g.fillStyle = '#060208';
    g.beginPath();
    g.moveTo(0, -2); g.quadraticCurveTo(7, -10, 17, -7); g.quadraticCurveTo(13, -3, 14, 3); g.quadraticCurveTo(10, 0, 7, 3);
    g.quadraticCurveTo(4, 1, 1, 5); g.lineTo(-1, 5); g.quadraticCurveTo(-4, 1, -7, 3); g.quadraticCurveTo(-10, 0, -14, 3);
    g.quadraticCurveTo(-13, -3, -17, -7); g.quadraticCurveTo(-7, -10, 0, -2); g.fill();
    g.beginPath(); g.moveTo(-3, -1); g.lineTo(-3, -6); g.lineTo(-1, -3); g.lineTo(1, -3); g.lineTo(3, -6); g.lineTo(3, -1); g.fill();
    g.restore();
  },
  pumpkin(g, x, y, r, t) {
    g.save(); g.translate(x, y);
    const lobe = (dx, w, c) => { g.fillStyle = c; g.beginPath(); g.ellipse(dx, 0, w, r * 0.82, 0, 0, TAU); g.fill(); };
    lobe(-r * 0.45, r * 0.6, '#c2500c'); lobe(r * 0.45, r * 0.6, '#c2500c'); lobe(0, r * 0.62, '#f07a1a');
    g.strokeStyle = 'rgba(90,30,0,0.6)'; g.lineWidth = 2;
    for (const dx of [-r * 0.32, r * 0.32]) { g.beginPath(); g.ellipse(dx, 0, r * 0.2, r * 0.78, 0, 0, TAU); g.stroke(); }
    g.fillStyle = '#3e5a16'; g.fillRect(-r * 0.09, -r * 1.04, r * 0.18, r * 0.32);
    // the face, lit from inside (it flickers)
    const fl = 0.7 + 0.3 * Math.abs(Math.sin(t * 9.3) * Math.sin(t * 4.1 + 1));
    g.fillStyle = 'rgba(255,' + Math.round(196 + 50 * fl) + ',90,' + (0.55 + 0.45 * fl).toFixed(2) + ')';
    for (const sx of [-1, 1]) { g.beginPath(); g.moveTo(sx * r * 0.5, -r * 0.12); g.lineTo(sx * r * 0.14, -r * 0.12); g.lineTo(sx * r * 0.32, -r * 0.46); g.closePath(); g.fill(); }
    g.beginPath(); g.moveTo(-r * 0.56, r * 0.14);
    for (let i = 1; i < 7; i++) g.lineTo(-r * 0.56 + i * r * 0.16, r * (i % 2 ? 0.3 : 0.16));
    g.lineTo(r * 0.56, r * 0.14); g.quadraticCurveTo(0, r * 0.72, -r * 0.56, r * 0.14); g.closePath(); g.fill();
    g.restore();
  },
};

// E at the cabinet: a coin goes in, the camera leans in over your shoulder and turns square to the screen, the screen
// comes on and the game opens over the page. The house holds its breath from the coin to the moment you are back:
// no time passes in it, its sound fades away and while the game is on it is not redrawn. Leave the machine (Esc on
// its title, the x, B on a gamepad) and the camera steps back
const Arcade = {
  machine: null,
  state: 'off',          // off | in (the camera on its way to the screen) | on (playing) | out (on its way back)
  t: 0, from: null, keep: null,
  C: new THREE.Vector3(), N: new THREE.Vector3(0, 0, 1), // the screen's centre and the way it faces (W.buildArcade)
  FOV: 40, IN: 1.35, OUT: 1.1,

  canPlay() {
    if (!createSirFallsArcade || this.state !== 'off' || !W.props.arcade || G.state !== 'play' || G.paused || UI.panelOpen) return false;
    if (!Player.control || !Player.alive || Photos.mode !== 'off' || Cam.trans || Cam.mode !== 'iso') return false;
    if (G.arena || G.bosses.length || G.enemies.some((e) => !e.dead && (!e.bonus || e.home === Player.room))) return false;
    return !TVSmash.threat();
  },
  label() { return this.machine && this.machine.inProgress ? 'Back to Sir Falls-A-Lot' : 'Play Sir Falls-A-Lot'; },
  ensure() {
    if (!this.machine) this.machine = createSirFallsArcade({
      assetURL: (p) => assetURL(ASSETS.arcade[p] || p),
      isTouch: () => Input.mode === 'touch',
      volume: () => SETTINGS.master,
      onRequestClose: () => this.leave(),
    });
    return this.machine;
  },

  // (called from the E press: the machine's sound may only start inside one)
  start() {
    if (!this.canPlay()) return false;
    try { this.ensure().prime(); } catch (e) { console.error(e); UI.toast('The machine won\'t switch on.', 1800); return false; }
    this.state = 'in'; G.arcade = 'in'; this.t = 0;
    this.keep = { control: Player.control, fog: G.fog };
    Player.control = false;
    Input.keys = {}; Input.vkeys = {}; Input.mouse.down = [false, false, false]; Touch.releaseAll(); Input.unlock();
    UI.prompt(null); UI.setPlaying(false); UI.reticle(0, 0, false);
    Sfx.ui('coin'); Sfx.away(true, 0.45);
    // (the camera sets off from the iso view of this moment)
    this.from = { focus: Cam.focus.clone().add(Cam.lookAhead), fov: Cam.fov, dist: Cam.isoDist };
    Cam.trans = null; Cam.mode = 'cine'; Cam.isoHold = 1;
    this.pose(0);
    return true;
  },
  // the machine asks to be left (sirfallsalot.js: Esc on its title, the x, B on a gamepad)
  leave() {
    if (this.state !== 'on') return;
    this.state = 'out'; G.arcade = 'out'; this.t = this.OUT;
    ArcadeScreen.acc = 1;
    this.machine.close();
  },
  finish() {
    this.state = 'off'; G.arcade = null;
    Cam.focus.copy(this.from.focus); Cam.lookAhead.set(0, 0, 0);
    Cam.isoHold = null; Cam.snap('iso');
    Player.visible = true;
    G.fog = this.keep.fog;
    Input.keys = {}; Input.vkeys = {}; Input.mouse.down = [false, false, false];
    if (G.state === 'play') { Player.control = this.keep.control; UI.setPlaying(true); }
    Sfx.away(false);
  },

  // the camera's way: s = 0 the iso view, s = 1 square in front of the screen, which then fills the view the way the
  // game's own screen will (sirfallsalot.js: 3:4, 28 px short of the window's height)
  pose(s) {
    const F = this.from, C = this.C, N = this.N, c = Cam.cine, az = Cam.isoAz, el = Cam.isoEl;
    const iso = _v1.set(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el));
    const S1 = 0.45, D1 = 2.05, F1 = 30;
    if (s <= S1) {
      // lean in: the iso view closes in on the screen
      const u = easeInOut(s / S1), d = F.dist * Math.pow(D1 / F.dist, u);
      _v2.lerpVectors(F.focus, C, u);
      c.pos.copy(_v2).addScaledVector(iso, d); c.look.copy(_v2); c.fov = lerp(F.fov, F1, u);
    } else {
      // and turn square to it
      const v = easeInOut((s - S1) / (1 - S1));
      _v3.copy(iso).lerp(N, v).normalize();
      c.pos.copy(C).addScaledVector(_v3, lerp(D1, this.endDist(), v)); c.look.copy(C); c.fov = lerp(F1, this.FOV, v);
    }
  },
  endDist() {
    const w = Render.w || innerWidth, h = Render.h || innerHeight, k = 2 * Math.tan(this.FOV * DEG / 2);
    // (on a touch screen the game takes the whole screen: the camera goes on into the picture until it fills the
    // view. The screen's picture is 0.33 m wide, 0.44 m tall)
    if (Input.mode === 'touch') return Math.min(0.44 / k, 0.33 / (k * Math.max(0.1, w / Math.max(1, h)))) * 0.97;
    const hp = w > h ? Math.min(h - 28, (w - 28) * 4 / 3) : Math.min(w - 16, (h - 210) * 0.75) * 4 / 3;
    return 0.44 / (clamp(hp / Math.max(1, h), 0.3, 1) * k);
  },

  // once a frame (real time: the house's own time stands still while the machine is on)
  update(dt) {
    ArcadeScreen.update(dt);
    // (nothing else moves in the house meanwhile: you settle at the machine and turn to it)
    if ((this.state === 'in' || this.state === 'out') && G.state === 'play') Player.update(dt);
    if (this.state === 'in') {
      this.t = Math.min(this.IN, this.t + dt);
      const s = this.t / this.IN;
      this.pose(s);
      // you turn to the machine; at the screen the camera takes your place
      Player.yaw = dampAngle(Player.yaw, Math.atan2(this.C.x - Player.pos.x, this.C.z - Player.pos.z), 10, dt);
      Player.visible = s < 0.62;
      if (this.t >= this.IN) {
        this.state = 'on'; G.arcade = 'on';
        try { this.machine.open(); } catch (e) { console.error(e); this.leave(); }
      }
    } else if (this.state === 'on') this.pose(1);
    else if (this.state === 'out') {
      this.t = Math.max(0, this.t - dt);
      const s = this.t / this.OUT;
      this.pose(s);
      Player.visible = s < 0.62;
      if (this.t <= 0) this.finish();
    }
  },
};

const Game = {
  checkpoint: null,
  titleT: 0,

  // ---------------- boot & title ----------------
  // (step(f): how far along the house is, 0..1, for the loading counter; it lets a frame show it)
  async init(step = async () => { }) {
    await W.build(step);
    Boogey.init(W.props.wardrobe);
    Player.init();
    Photos.init();
    await step(0.94);
    this.setupInteractables();
    Lost.init();
    WinShadows.init();
    // (the windows' view of the yard is shot right after, once the house's shaders are in: Main.boot)
    this.applyMood(0);
    // title scene camera (menu is shown after the start gate)
    Player.rig.root.visible = false; Player.visible = false;
    Cam.cine.pos.set(-21, 2.2, 27); Cam.cine.look.set(-1, 2.6, 16.5); Cam.cine.fov = 50;
    Cam.snap('cine');
    await step(1);
  },

  getSave() { const s = Store.get('hyhm_save_v1', null); return s && s.level != null ? s : null; },

  toTitle(first = false) {
    Seq.clear(); this.clearWorld();
    G.state = 'title'; G.phase = 'none'; G.paused = false; G.haunted = false; G.dread = 0; G.inBasement = false;
    W.doors.front.target = 0; W.doors.front.open = 0; W.doors.front.col.active = true;
    UI.closePanel(); UI.showHUD(false); UI.boss(null); UI.wave(null); UI.prompt(null); UI.hint(null); UI.dialog(null); UI.caption(null); UI.showAlbum(false);
    UI.setPlaying(false);
    Photos.overlay.visible = false; Render.overlayVisible = false; Photos.mode = 'off';
    Player.rig.root.visible = false; Player.visible = false; Player.control = false;
    W.props.man.visible = false;
    W.allLightsInRoom('porch', true);
    for (const k of Object.keys(W.lightsOut)) W.lightsOut[k] = 0;
    Cam.mode = 'cine'; Cam.trans = null;
    Cam.cine.pos.set(-21, 2.2, 27); Cam.cine.look.set(-1, 2.6, 16.5); Cam.cine.fov = 50;
    Cam.snap('cine');
    this.applyMood(0);
    // a cold moonlit night: blue sky light in the shadows, the warm porch and windows the only warm colors
    W.hemi.color.set(0x56669a); W.hemi.groundColor.set(0x18140f);
    Render.setGrade({ tint: [0.97, 0.98, 1.08], lift: [0.0, 0.006, 0.02], sat: 0.9, contrast: 1.16, exposure: 1.04, vignette: 0.95 });
    Render.scene.fog.color.set(0x0b0e16); Render.scene.background.set(0x0b0e16);
    UI.showTitleScreen(this.getSave());
    UI.fade(0, first ? 1600 : 700);
    Sfx.playMusic('title', 2);
    this.titleT = 0;
  },

  clearWorld() {
    Waves.clear();
    for (const b of G.bosses) b.remove(); G.bosses = [];
    Projectiles.clear(); Pickups.clear(); Decals.clear(); Tele.clear(); Temp.clear(); Chunks.clear(); Particles.clear(); Nails.clear();
    Photos.removeWorldPhoto();
    for (const ph of Photos.list) if (ph.subjectRig) { Render.scene.remove(ph.subjectRig.root); ph.subjectRig = null; }
    G.arena = null; G.flags = {}; G.wave = null; G.noAttack = false; G.timeScale = 1;
    Shells.clear(); Boogey.reset(); W.lightsOut.bedroom = 0;
    for (const k in W.doors) if (k !== 'front') W.setDoor(k, true, true);
    Breakables.reset();
    Photos.redDoor.visible = true; setLayer(Photos.redDoor, 1);
    W.redDoorInteract.enabled = false;
    if (W.redLight) W.redLight.on = false;
    W.props.circleLight.on = false; W.props.circleLight.base = 0;
    W.porchDefault();
    this.resetAttic();
  },

  // overall look: 0 = cozy halloween evening, 1..5 = increasingly haunted
  applyMood(level) {
    if (!G.haunted) {
      Render.setGrade({ tint: [1.06, 0.97, 0.86], lift: [0.006, 0.003, 0.0], sat: 1.0, contrast: 1.08, exposure: 1.1, vignette: 0.62 });
      Render.scene.fog.color.set(0x0a0806); Render.scene.background.set(0x0a0806);
      W.hemi.color.set(0xb0a090); W.hemi.groundColor.set(0x3a2a1c);
      return;
    }
    const d = G.dread;
    Render.setGrade({ tint: [lerp(0.97, 1.0, d), lerp(0.96, 0.88, d), lerp(1.06, 0.98, d)], lift: [0.0, 0.003, lerp(0.012, 0.016, d)], sat: lerp(0.86, 0.74, d), contrast: lerp(1.12, 1.2, d), exposure: lerp(1.04, 0.94, d), vignette: lerp(0.78, 1.0, d) });
    Render.scene.fog.color.set(0x050407); Render.scene.background.set(0x050407);
    W.hemi.color.set(0x8090c0); W.hemi.groundColor.set(0x2a2028);
    void level;
  },

  // New Game, Continue and the lost photos need the haunts (Assets.loadLater, while the title is up). If they're
  // still on their way, the loading screen comes back with its counter, and it goes on by itself once they're in
  whenLoaded(fn) {
    if (Assets.laterDone) return fn();
    this._afterLoad = fn;
    if (this._waitEl) return;
    const ld = this._waitEl = document.createElement('div');
    ld.id = 'hy-loading'; ld.innerHTML = '<div class="t">How You Haunt Me</div><div class="p"></div>';
    UI.el.fps.parentNode.insertBefore(ld, UI.el.fps);
    const p = ld.querySelector('.p');
    const tick = () => {
      if (!Assets.laterDone) { p.textContent = 'DEVELOPING\u2026 ' + Math.min(99, Math.floor(Assets.laterProg * 100)) + '%'; setTimeout(tick, 100); return; }
      ld.style.transition = 'opacity .4s'; ld.style.opacity = '0'; setTimeout(() => ld.remove(), 450);
      this._waitEl = null;
      const f = this._afterLoad; this._afterLoad = null;
      if (f && G.state === 'title') f();
    };
    tick();
  },

  newGame() {
    if (!Assets.laterDone) return this.whenLoaded(() => this.newGame());
    Store.del('hyhm_save_v1');
    Sfx.init();
    UI.hideTitleScreen();
    UI.fade(1, 600);
    setTimeout(() => {
      this.resetRun();
      Seq.run(this.seqIntro());
    }, 650);
  },

  resetRun() {
    Seq.clear(); this.clearWorld();
    G.state = 'play'; G.paused = false; G.level = 0; G.haunted = false; G.dread = 0; G.inBasement = false;
    G.stats = { kills: 0, damage: 0, time: 0, deaths: 0, shots: 0 };
    G.side = {};
    G.clockMinutes = 23 * 60 + 41;
    Player.reset(); Player.visible = true; Player.pos.set(6.8, 0, 19.2); Player.yaw = -Math.PI / 2; Player.control = false;
    Player.rig.root.visible = true;
    for (const ph of Photos.list) { ph.developed = 0; ph.done = false; ph.thumb = null; ph.developing = false; ph.rendered = false; }
    Photos.current = null;
    W.doors.front.target = 0; W.doors.front.open = 0; W.doors.front.col.active = true;
    W.props.flashlightItem.visible = true; W.props.pokerItem.visible = true;
    W.props.man.visible = false;
    for (const k of Object.keys(W.lightsOut)) W.lightsOut[k] = 0;
    UI.setHealth(Player.hp, Player.stats.maxHp); UI.setWeapons(Player);
    this.checkpoint = null;
    this.applyMood(0);
  },

  continueGame() {
    if (!Assets.laterDone) return this.whenLoaded(() => this.continueGame());
    const s = this.getSave(); if (!s) return this.newGame();
    Sfx.init();
    UI.hideTitleScreen();
    UI.fade(1, 500);
    setTimeout(() => { this.resetRun(); this.checkpoint = s; this.retryCheckpoint(true); }, 550);
  },

  // (secret, for testing the ending: ten clicks on "headphones recommended" on the title screen) straight to the
  // end of the night: down in the basement, the last haunt just banished and its loot on the floor. From there
  // the game plays on as usual: the reward, back upstairs, the front door, the ending
  skipToEnd() {
    if (G.state !== 'title') return;
    if (!Assets.laterDone) return this.whenLoaded(() => this.skipToEnd());
    Sfx.init(); Sfx.stinger(0.3);
    UI.hideTitleScreen();
    UI.fade(1, 500);
    setTimeout(() => {
      this.resetRun();
      Player.hasFlashlight = true; Player.weapons.poker.owned = true;
      for (const k of ['nailgun', 'shotgun', 'bomb']) Player.give(k);
      Player.weapon = 'shotgun'; Player.updateWeaponModel();
      W.props.flashlightItem.visible = false; W.props.pokerItem.visible = false;
      G.haunted = true; G.level = 4; G.dread = 0.88; G.clockMinutes = LEVELS[4].clock + 21; G.flags.locked = true;
      for (const ph of Photos.list) {
        ph.done = true; ph.developed = 1; ph.developing = false;
        if (!ph.rendered || !ph.thumb) { Photos.render(ph, 'empty'); Photos.bake(ph); }
      }
      Photos.list[4].photoGone = true;
      Photos.current = Photos.list[4];
      this.applyMood(5);
      // downstairs, through the red door that was never there
      setLayer(Photos.redDoor, 0); Photos.redDoor.visible = true;
      G.inBasement = true; G.arena = 'basement';
      W.props.circleLight.on = true; W.props.circleLight.base = 3;
      Player.pos.set(66.2, 0, 11.6); Player.yaw = Math.PI / 2;
      Cam.focus.copy(Player.pos); Cam.lookAhead.set(0, 0, 0); Cam.snap('iso');
      UI.showHUD(true); UI.setHealth(Player.hp, Player.stats.maxHp); UI.setWeapons(Player);
      Player.control = true; UI.setPlaying(true);
      UI.fade(0, 900);
      Seq.run(this.seqAfterBoss(LEVELS[4], { pos: new THREE.Vector3(70, 0, 11.25) }));
    }, 550);
  },

  // ---------------- interactables ----------------
  setupInteractables() {
    W.addInteract({ id: 'frontdoor', x: 0.9, z: 17.8, r: 1.5, label: 'Answer the door', enabled: () => G.phase === 'intro' && G.flags.bell && !G.flags.answered, use: () => { G.flags.answered = true; } });
    W.addInteract({ id: 'frontlocked', x: 0.9, z: 17.8, r: 1.3, label: 'Try the front door', enabled: () => G.state === 'play' && G.haunted && !G.flags.frontOpen && G.phase !== 'intro' && G.phase !== 'final', use: () => { Sfx.play('lock'); UI.toast(['It won\'t budge. The lock is ice cold.', 'Still locked. Something wants you to stay.', 'Five photos. Then it opens. You just know.'][Math.min(2, G.level)], 2200); Cam.shake(0.15); } });
    W.addInteract({ id: 'frontopen', x: 0.9, z: 17.8, r: 1.5, label: 'Open the front door', enabled: () => G.phase === 'final', use: () => { G.flags.openFront = true; } });
    W.addInteract({ id: 'flashlight', x: 1.0, z: 19.75, r: 1.25, label: 'Take the flashlight', enabled: () => G.state === 'play' && G.flags.locked && !Player.hasFlashlight, use: () => {
      Player.hasFlashlight = true; W.props.flashlightItem.visible = false; Player.updateWeaponModel(); Sfx.play('pickupAmmo');
      UI.toast('Flashlight. It points wherever you aim.', 2200);
    } });
    W.addInteract({ id: 'poker', x: 1.25, z: 20.9, r: 1.25, label: 'Take the old fire poker', enabled: () => G.state === 'play' && G.flags.locked && !Player.weapons.poker.owned, use: () => {
      Player.weapons.poker.owned = true; Player.weapon = 'poker'; W.props.pokerItem.visible = false; Player.updateWeaponModel(); UI.setWeapons(Player); Sfx.play('pickupWeapon');
      UI.titleCard('FIRE POKER', 'left click to swing  /  press 1', 2400, 'clear');
    } });
    W.addInteract({ id: 'worldphoto', x: 0, z: 0, r: 1.4, label: 'Look at the photo', enabled: () => G.phase === 'waveClear' && G.flags.photoLanded, pos: () => Photos.worldPhoto && Photos.worldPhoto.position, use: () => { G.flags.lookBoss = true; } });
    W.redDoorInteract = W.addInteract({ id: 'reddoor', x: 2.05, z: 14.5, r: 1.3, label: 'Go down', enabled: false, use: () => this.enterBasement() });
    // the bedroom wardrobe: something lives in it (Boogey)
    W.addInteract({ id: 'wardrobe', x: 15.9, z: 13.5, r: 1.4, label: 'Open the wardrobe', enabled: () => Boogey.canOpen(), use: () => Seq.run(this.seqBoogeyman()) });
    W.addInteract({ id: 'wardrobeEmpty', x: 15.9, z: 13.5, r: 1.3, label: 'Look in the wardrobe', enabled: () => G.state === 'play' && !Boogey.pending() && !G.arena && Player.control && Photos.mode === 'off',
      use: () => UI.toast('Dad\'s old coats. Nothing in there.<br>Nothing at all.', 2600) });
    // the arcade machine by the door to the living room: Sir Falls-A-Lot: Halloween Edition (Arcade)
    const arc = W.addInteract({ id: 'arcade', x: 21.9, z: 13.5, r: 1.3, label: 'Play Sir Falls-A-Lot', enabled: () => Arcade.canPlay(), use: () => Arcade.start() });
    Object.defineProperty(arc, 'label', { get: () => Arcade.label() });
  },

  nearestInteract() {
    let best = null, bd = 1e9;
    for (const it of W.interactables) {
      // (the distance first: the enabled() checks - some scan the enemies - only for what is in reach. Among those in
      // reach a higher pri wins, then the nearer one)
      const p = it.pos ? it.pos() : null;
      const x = p ? p.x : it.x, z = p ? p.z : it.z;
      const d = dist(x, z, Player.pos.x, Player.pos.z);
      const k = d - (it.pri || 0) * 100;
      if (!(d < it.r && k < bd)) continue;
      const en = typeof it.enabled === 'function' ? it.enabled() : it.enabled;
      if (en) { bd = k; best = it; }
    }
    return best;
  },

  // ---------------- input hooks ----------------
  onKey(code) {
    if (G.state === 'boot' || G.arcade) return; // (the arcade machine has the keys while you play it)
    if (UI.panelOpen) {
      if (UI.panelOpen === 'upgrade' && /^Digit[123]$/.test(code)) { const i = parseInt(code.slice(5), 10) - 1; if (UI._upgradeChoose) UI._upgradeChoose(i); return; }
      if (UI.panelOpen === 'upgrade' && (code === 'ArrowLeft' || code === 'ArrowRight' || code === 'KeyA' || code === 'KeyD')) {
        UI.menuIndex = (UI.menuIndex + (code === 'ArrowRight' || code === 'KeyD' ? 1 : -1) + 3) % 3; UI.menuItems.forEach((b, k) => b.classList.toggle('sel', k === UI.menuIndex)); Sfx.ui('hover'); return;
      }
      if (UI.panelOpen === 'upgrade' && (code === 'Enter' || code === 'Space')) { if (UI._upgradeChoose) UI._upgradeChoose(UI.menuIndex); return; }
      if (code === 'Escape' && UI.onPanelKey) { UI.onPanelKey(); return; }
      UI.menuKey(code);
      return;
    }
    if (G.state === 'title') { Sfx.init(); UI.menuKey(code); return; }
    if (G.state !== 'play') return;
    if (code === 'Escape' || code === 'KeyP') { if (Photos.mode === 'hold') { Photos.exit(); return; } this.pause(); return; }
    if (G.paused) return;
    if (code === 'Tab') { UI.showAlbum(true); this.albumOpen = true; return; }
    if (code === 'KeyF') {
      if (Photos.mode === 'hold') { Photos.exit(); return; }
      if (Photos.canEnter()) { Photos.enter(); return; }
      if (G.phase === 'explore' && Photos.current && Photos.current.developed < 1) UI.toast('The photo is still developing...', 1400);
      else if (G.arena || TVSmash.threat()) UI.toast('No time for photos now!', 1200);
      return;
    }
    if (code === 'KeyE' && Player.control) {
      const it = this.nearestInteract();
      if (it) { it.use(); Sfx.ui('click'); }
    }
  },
  onMouseDown(btn) {
    if (G.state === 'title') Sfx.init();
    if (G.state === 'play' && Photos.mode === 'hold' && !Input.locked) Input.lock();
    void btn;
  },
  onBlur() { if (G.state === 'play' && !G.paused && !UI.panelOpen && G.phase !== 'ending' && !G.arcade) this.pause(); },

  pause() {
    if (G.paused || UI.panelOpen) return;
    G.paused = true; Input.unlock(); UI.showPause(); Sfx.ui('pause'); Sfx.duck(0.35); UI.setPlaying(false);
  },
  resume() {
    G.paused = false; UI.closePanel(); Sfx.duck(1);
    if (Photos.mode === 'hold') Input.lock(); else UI.setPlaying(true);
  },

  // ---------------- per frame ----------------
  update(dt, realDt) {
    if (this.albumOpen && !Input.down('Tab')) { this.albumOpen = false; UI.showAlbum(false); }
    if (G.state === 'title') { this.updateTitle(realDt); return; }
    if (G.state !== 'play') return;
    G.stats.time += dt;
    Seq.update(dt);
    Player.update(dt);
    Waves.update(dt);
    for (const b of G.bosses) b.update(dt);
    compact(G.bosses, (b) => !b.dead);
    Shells.update(dt);
    Boogey.update(dt);
    Projectiles.update(dt);
    Pickups.update(dt);
    TVSmash.update(dt);
    // fire patches burn
    for (const d of Decals.list) if (d.fire && d.life > 0.3 && Math.random() < 0.4) FX.fire(d.x + rand(-d.r, d.r) * 0.6, 0.05, d.z + rand(-d.r, d.r) * 0.6, 1, 0.1, 0.3);
    // camera follow
    if (Cam.mode === 'iso') {
      Cam.focus.x = damp(Cam.focus.x, Player.pos.x, 7, dt); Cam.focus.z = damp(Cam.focus.z, Player.pos.z, 7, dt);
      if (Player.control && Input.mouse.seen) {
        const ax = clamp((Player.aim.x - Player.pos.x) * 0.16, -2.2, 2.2), az = clamp((Player.aim.z - Player.pos.z) * 0.16, -2.2, 2.2);
        Cam.lookAhead.x = damp(Cam.lookAhead.x, ax, 3, dt); Cam.lookAhead.z = damp(Cam.lookAhead.z, az, 3, dt);
      } else { Cam.lookAhead.x = damp(Cam.lookAhead.x, 0, 3, dt); Cam.lookAhead.z = damp(Cam.lookAhead.z, 0, 3, dt); }
    }
    this.updateHUD(dt);
    // ambience
    const room = Player.room;
    Sfx.ambience(dt, G.amb || { wind: G.haunted ? 0.6 + G.dread * 0.6 : 0.25, room: G.inBasement ? 0.05 : 0.02, creaks: G.haunted, clock: room === 'hall' && !G.arena ? 1 : 0 });
    // thunder & lightning now and then
    if (G.haunted && !G.inBasement) {
      this.thunderT = (this.thunderT ?? 25) - dt;
      if (this.thunderT <= 0) { this.thunderT = rand(35, 70); W.lightning = 1; Sfx.play('thunder', undefined, undefined, 0.8); }
    }
    // clock ticks slowly during play
    if (G.phase !== 'ending') G.clockMinutes += dt / 8;
    // damage vignette decay
    const u = Render.postMat.uniforms;
    u.uDamage.value = Math.max(Player.hp / Player.stats.maxHp < 0.25 ? 0.25 + Math.sin(G.realTime * 5) * 0.08 : 0, u.uDamage.value - dt * 1.6);
    u.uAberr.value = lerp(0.006, 0.02, u.uDamage.value);
  },

  updateTitle(dt) {
    this.titleT += dt;
    const t = this.titleT;
    Cam.cine.pos.set(-21 + Math.sin(t * 0.07) * 3, 2.3 + Math.sin(t * 0.11) * 0.4, 27 - Math.sin(t * 0.05) * 2);
    Cam.cine.look.set(-1, 2.8, 17 + Math.sin(t * 0.09) * 1.2);
    if (Math.random() < dt * 0.02) { W.lightning = 1; Sfx.play('thunder', undefined, undefined, 0.5); }
    Sfx.ambience(dt, { wind: 0.5, room: 0, creaks: false, clock: 0 });
    Cam.focus.set(-1, 0, 17.8);
  },

  clockString() {
    let m = Math.floor(G.clockMinutes) % (24 * 60);
    const h24 = Math.floor(m / 60), mm = m % 60;
    const ap = h24 >= 12 ? 'PM' : 'AM';
    const h = ((h24 + 11) % 12) + 1;
    return `${h}:${mm < 10 ? '0' : ''}${mm} ${ap}`;
  },

  updateHUD(dt) {
    const cine = ['event', 'bossIntro', 'ending'].includes(G.phase) || (G.phase === 'intro' && !Player.control) || Photos.mode === 'hold' || !!G.arcade;
    if (cine !== this._cine) { this._cine = cine; UI.setCine(cine); }
    UI.objFresh = Math.max(0, (UI.objFresh || 0) - dt);
    const fight = G.enemies.some((e) => !e.bonus || e.home === Player.room) || G.bosses.length > 0 || G.phase === 'wave' || G.phase === 'boss';
    // (on a phone or with the touch controls the note also waits in the corner while you explore: the thumbs and the
    // house need the middle of the small screen)
    const small = Input.mode === 'touch' || innerHeight < 560;
    UI.dockObjective(cine || Photos.mode !== 'off' || ((fight || small) && UI.objFresh <= 0));
    const hold = Photos.mode === 'hold';
    if (hold !== this._hold) { this._hold = hold; UI.el.root.classList.toggle('hold', hold); }
    this.hudT = (this.hudT || 0) - dt;
    if (this.hudT <= 0) {
      this.hudT = 0.1;
      UI.setWeapons(Player);
      UI.setPhotoHUD(Photos.hudInfo());
      UI.osd(this.clockString(), G.arena ? '&#9679; REC' : Photos.mode === 'hold' ? 'PHOTO' : 'PLAY &#9654;');
      if (SETTINGS.fps) UI.el.fps.textContent = Math.round(this.fps || 0) + ' fps' + (Render.dyn < 0.999 ? '  ' + Math.round(Render.dyn * 100) + '%' : '');
    }
    // prompt
    const canAct = Player.control && G.state === 'play' && !G.paused && Photos.mode === 'off';
    const it = canAct ? this.nearestInteract() : null;
    UI.prompt(it ? `${UI.key('use')} ${it.label}` : null);
    // (the reticle from the first step on: you always face the mouse, the flashlight only lights the way. With a
    // gamepad or the touch stick it sits where you aim while you aim: where a pumpkin bomb would land)
    if (Input.mode === 'kb') UI.reticle(Input.mouse.x, Input.mouse.y, canAct && Player.alive && Input.mouse.seen);
    else if (canAct && Player.alive && Input.aim.on) {
      _v1.set(Player.aim.x, Player.weapon === 'bomb' ? 0.05 : 0.9, Player.aim.z).project(Render.camera);
      UI.reticle((_v1.x + 1) / 2 * Render.w, (1 - _v1.y) / 2 * Render.h, true);
    } else UI.reticle(0, 0, false);
  },

  setObjectiveForLevel() {
    const ph = Photos.current, lv = LEVELS[G.level];
    if (!ph) return;
    if (ph.developed < 1) UI.setObjective(`Photo ${G.level + 1} is developing...`, 'Give it a moment');
    else UI.setObjective(`Find where photo ${G.level + 1} was taken`, lv.hint + '  (press F to look at it)');
  },

  // ---------------- intro ----------------
  *seqIntro() {
    G.phase = 'intro';
    UI.showHUD(true); UI.setObjective(null);
    UI.setPlaying(false);
    Cam.focus.copy(Player.pos); Cam.lookAhead.set(0, 0, 0);
    Cam.snap('iso');
    Sfx.playMusic('none', 1.5);
    UI.fade(1, 0);
    yield* wait(0.4);
    let h = UI.caption('<span class="date">OCT. 31, 1996 &nbsp; 11:41 PM</span><br><br>The trick-or-treaters stopped coming an hour ago.<br>The candy bowl is still half full.');
    UI.fade(0, 2600);
    yield* wait(4.6);
    UI.caption(null);
    Player.control = true; UI.setPlaying(true);
    UI.setObjective('Enjoy the quiet', 'WASD to walk around');
    yield* wait(3.5);
    Sfx.doorbell();
    G.flags.bell = true;
    UI.toast('DING-DONG', 1600);
    UI.setObjective('Someone is at the door', 'Walk to the front door and press E');
    let bw = 0;
    while (!G.flags.answered) {
      bw += yield;
      if (bw > 9) { bw = 0; Sfx.doorbell(); UI.toast('DING-DONG', 1400); }
    }
    // --- the visitor ---
    Player.control = false; UI.setPlaying(false); UI.setObjective(null);
    Player.pos.set(1.15, 0, 17.8); Player.yaw = -Math.PI / 2;
    Cam.fp.pos.set(1.15, 1.6, 17.8); Cam.fp.yaw = Math.PI / 2; Cam.fp.pitch = -0.02;
    Cam.to('fp', 1.1);
    yield* wait(1.2);
    W.doors.front.target = 1; W.doors.front.col.active = false;
    Sfx.play('doorOpen');
    // he stands in the gloom: the porch lantern barely holds on, and it is the lamp that throws his shadow
    const PL = W.props.porchLight; PL.base = 3.2; PL.flicker = 0.32; PL.prio = 1;
    W.lightsOut.hall = 0.7; // (and the hall lamps sag when he shows up)
    Render.setGrade({ tint: [1.0, 0.95, 0.93], lift: [0.0, 0.0, 0.006], sat: 0.84, contrast: 1.16, exposure: 0.96, vignette: 0.92 });
    W.props.man.visible = true;
    const manA = W.props.man.userData.anim, manP = W.props.man.userData.photos;
    if (manA) manA.play('Idle', 0, { restart: true });
    if (manP) manP.visible = true;
    Sfx.play('creak');
    yield* wait(1.0);
    if (manA) manA.play('Offer', 0.3, { once: true });
    yield* wait(0.6);
    h = UI.dialog('THE VISITOR', 'These belong here.');
    Sfx.osc('sawtooth', 70, 62, 1.4, 0.07, { filter: 'lowpass', ff: 300, rev: 0.6, attack: 0.2 });
    yield* wait(2.4);
    // the photos change hands: photo 1 develops in yours
    if (manP) manP.visible = false;
    if (manA) manA.play('Idle', 0.5);
    const ph = Photos.list[0];
    Photos.current = ph;
    Photos.render(ph, 'cute');
    ph.developed = 0;
    Photos.setPhotoMaterial(ph);
    Photos.pose = 'held'; Photos.raise = 0; Photos.raiseTarget = 0; Photos.show = 0; Photos.showTarget = 1;
    Photos.overlay.visible = true; Render.overlayVisible = true;
    Sfx.play('rustle', undefined, undefined, 0.8);
    UI.dialog(null);
    yield* wait(0.8);
    // porch light dies, he is gone
    W.props.porchLight.on = false; Sfx.play('flicker'); yield* wait(0.25);
    W.props.porchLight.on = true; yield* wait(0.15);
    W.props.porchLight.on = false; Sfx.play('lightsOut');
    yield* wait(0.9);
    W.props.man.visible = false;
    W.props.porchLight.on = true; Sfx.stinger(0.25);
    yield* wait(1.0);
    // door slams, lock turns by itself
    W.doors.front.target = 0; W.doors.front.col.active = true;
    W.porchDefault(); W.lightsOut.hall = 0;
    yield* wait(0.18);
    Sfx.play('doorSlam'); Cam.shake(0.5);
    yield* wait(0.5);
    Sfx.play('lock');
    G.haunted = true; G.dread = 0.12; G.flags.locked = true;
    this.applyMood(1);
    Sfx.playMusic('explore', 3);
    W.lightning = 1; Sfx.play('thunder');
    for (const L of W.lights) L.cur *= 0.2;
    // photo develops while you watch
    let t = 0;
    while (t < 3.4) { const dt = yield; t += dt; ph.developed = Math.min(1, t / 3.2); Photos.polMat.uniforms.uDevelop.value = ph.developed; }
    ph.developed = 1;
    Photos.bake(ph);
    UI.toast('Five polaroids. Only one has an image so far.', 2600);
    yield* wait(1.2);
    Photos.showTarget = 0;
    Cam.to('iso', 1.0);
    yield* wait(1.05);
    Photos.overlay.visible = false; Render.overlayVisible = false; Photos.pose = 'normal';
    Player.control = true; UI.setPlaying(true);
    UI.toast('The door slammed shut. It won\'t open.', 2400);
    UI.setObjective('Grab the flashlight and the poker', 'On the little table by the door. Press E');
    yield* until(() => Player.hasFlashlight && Player.weapons.poker.owned);
    yield* wait(0.8);
    this.startExplore(0);
  },

  // ---------------- levels ----------------
  startExplore(i) {
    G.level = i; G.phase = 'explore'; G.arena = null; G.inBasement = false;
    const ph = Photos.list[i], lv = LEVELS[i];
    Photos.current = ph;
    if (!ph.rendered) { Photos.render(ph, 'cute'); Photos.bake(ph); }
    G.clockMinutes = Math.max(G.clockMinutes, lv.clock);
    Player.control = true; UI.setPlaying(true);
    this.setObjectiveForLevel();
    this.saveCheckpoint('explore');
    Sfx.playMusic('explore', 2.5);
    this.applyMood(i + 1);
    G.flags.roomHint = false; G.flags.bigHint = false;
    Seq.run(this.seqExploreHints(i));
  },

  *seqExploreHints(i) {
    const ph = Photos.list[i];
    let t = 0;
    while (G.phase === 'explore' && G.level === i) {
      const dt = yield; t += dt;
      if (!G.flags.roomHint && Player.room === ph.room && ph.developed >= 1) { G.flags.roomHint = true; UI.toast('The photo feels warm in here.', 2000); }
      if (t > 75 && !G.flags.bigHint) { G.flags.bigHint = true; UI.setObjective(`Find where photo ${i + 1} was taken`, `${LEVELS[i].hint} Stand where the camera stood, press F and hold the photo up.`); }
    }
  },

  photoAligned(ph) {
    const lv = LEVELS[ph.id];
    if (ph.door) Seq.run(this.seqDoorEvent(lv, ph));
    else Seq.run(this.seqCuteEvent(lv, ph));
  },

  // the cute critter leaves the photo
  *seqCuteEvent(lv, ph) {
    G.phase = 'event'; Player.control = false;
    UI.hint(null);
    yield* Photos.assist(ph, 0.45);
    Sfx.play('snap'); Sfx.muffle(true, 0.5);
    Photos.glow = 1.2;
    UI.flash(160, 0.25);
    const rig = ph.subjectRig;
    // head tilt + squeak, rendered live into the photo
    let t = 0;
    while (t < 1.5) {
      const dt = yield; t += dt;
      Photos.glow = Math.max(0.2, Photos.glow - dt);
      if (rig && rig.glb) { poseRig(rig, ph.minion, 'Idle', t); rig.head.rotateZ(Math.sin(t * 5) * 0.35 * Math.min(1, t * 2)); rig.body.position.y += Math.abs(Math.sin(t * 6)) * 0.03; }
      else if (rig) { rig.head.rotation.z = Math.sin(t * 5) * 0.35 * Math.min(1, t * 2); rig.body.position.y = (ph.minion === 'ghost' ? 0.3 : 0) + Math.abs(Math.sin(t * 6)) * 0.03; }
      Photos.render(ph, null);
      if (t > 0.5 && !this._sq) { this._sq = true; Sfx.play('squeak', undefined, undefined, 1, { pitch: CRIT[ph.minion].pitch }); }
    }
    this._sq = false;
    // hop out of the frame
    t = 0;
    const sx = rig ? rig.root.position.x : 0, sz = rig ? rig.root.position.z : 0, sy = rig ? rig.root.position.y : 0;
    Sfx.play('giggle', undefined, undefined, 1, { pitch: CRIT[ph.minion].pitch });
    while (t < 0.6) {
      const dt = yield; t += dt;
      const k = t / 0.6;
      if (rig) { rig.root.position.set(sx + (ph.camPos.x - sx) * k * 0.15 + Math.sin(k * 3) * 0.4, sy + Math.sin(k * Math.PI) * 0.6, sz + (ph.camPos.z - sz) * k * 0.15); rig.root.scale.setScalar(1 - k * 0.4); }
      Photos.render(ph, null);
    }
    if (rig) rig.root.visible = false;
    Photos.render(ph, null);
    Sfx.play('patter');
    yield* wait(0.7);
    // the real thing sits where the picture was
    W.setArenaDoors(lv.arena, false);
    G.arena = lv.arena;
    Waves.start(lv, lv.arena);
    const s = ph.subject;
    const first = new Critter(ph.minion, s[0], s[2], 'cute');
    first.perch = ph.perch || 0; first.yaw = Math.atan2(ph.camPos.x - s[0], ph.camPos.z - s[2]);
    first.wander.t = 3.2;
    G.enemies.push(first); G.wave.spawned++;
    yield* Photos.drop(0.75);
    Sfx.play('squeak', s[0], s[2], 1, { pitch: CRIT[ph.minion].pitch * 1.1 });
    yield* wait(0.9);
    Sfx.play('doorSlam'); Cam.shake(0.3);
    Waves.spawnInitial(lv, lv.arena, lv.start - 1, { x: Player.pos.x, z: Player.pos.z });
    Sfx.muffle(false, 0.8);
    Photos.exit(1.4);
    Photos.placeWorldPhoto(ph, Cam.fp.pos.x + 0.2, Cam.fp.pos.z + 0.3, rand(-0.5, 0.5));
    yield* wait(1.45);
    Photos.removeWorldPhoto();
    ph.photoGone = true;
    G.phase = 'cute';
    Player.control = true; UI.setPlaying(true);
    UI.titleCard(lv.title.toUpperCase(), lv.tag || 'they look... friendly?', lv.tag ? 3000 : 2600);
    UI.setObjective('Uh oh', 'They seem harmless. For now.');
    Sfx.playMusic('none', 1);
    let ct = 0;
    while (ct < 3.4 && !G.wave.aggro) { const dt = yield; ct += dt; }
    G.wave.aggro = true;
    G.phase = 'wave';
    Sfx.stinger(0.4);
    UI.flash(140, 0.35, '#ff2a10');
    UI.titleCard('NOT SO CUTE', 'survive the haunting', 2000, 'boss');
    UI.setObjective('Survive', lv.n === 1 ? 'Left click to swing. Space to dodge roll.' : 'Doors are sealed until they are gone');
    Sfx.playMusic('fight', 0.5);
    Cam.shake(0.4);
  },

  onWaveCleared() { Seq.run(this.seqPhotoReturns(LEVELS[G.level])); },

  *seqPhotoReturns(lv) {
    G.phase = 'waveClear';
    G.flags.lookBoss = false; G.flags.photoLanded = false;
    UI.wave(null);
    Sfx.playMusic('explore', 2);
    UI.titleCard('SILENCE', 'for a moment', 1800, 'clear');
    yield* wait(1.6);
    const ph = Photos.current;
    const rm = ROOMS[lv.arena];
    const tx = lv.n === 5 ? 70 : (rm.x0 + rm.x1) / 2, tz = lv.n === 5 ? 11.25 : (rm.z0 + rm.z1) / 2 + (lv.n === 1 ? 1 : 0);
    let fx = tx, fz = tz;
    if (!Flow.free(fx, fz)) { const p = Flow.randomFree(0); fx = p.x; fz = p.z; }
    const m = Photos.placeWorldPhoto(ph, fx, fz, 0);
    Sfx.play('rustle', fx, fz);
    UI.toast('Something flutters down from the ceiling...', 2000);
    let t = 0;
    while (t < 1.8) { const dt = yield; t += dt; const k = t / 1.8; m.position.set(fx + Math.sin(t * 3) * 0.5 * (1 - k), lerp(3, 0.03, easeOut(k)), fz + Math.cos(t * 2.3) * 0.3 * (1 - k)); m.rotation.z = Math.sin(t * 4) * (1 - k); }
    m.position.set(fx, 0.03, fz);
    m.userData.rustle = true;
    G.flags.photoLanded = true;
    UI.setObjective('The photo is back. It has changed.', 'Walk to it and press E');
    let ct = 0;
    while (!G.flags.lookBoss) { const dt = yield; ct -= dt; if (ct <= 0) { ct = rand(1.2, 2.4); Sfx.play('rustle', fx, fz, 0.5); } }
    yield* this.seqBossReveal(lv, ph);
  },

  *seqBossReveal(lv, ph) {
    G.phase = 'bossIntro'; Player.control = false; UI.setPlaying(false); UI.prompt(null);
    G.flags.photoLanded = false;
    const wp = Photos.worldPhoto;
    const px = wp ? wp.position.x : Player.pos.x, pz = wp ? wp.position.z : Player.pos.z;
    Photos.removeWorldPhoto();
    Photos.render(ph, 'boss');
    Photos.setPhotoMaterial(ph, 'boss');
    Photos.pose = 'reveal'; Photos.raise = 0; Photos.show = 0; Photos.showTarget = 1;
    Photos.overlay.visible = true; Render.overlayVisible = true;
    Player.yaw = Math.atan2(px - Player.pos.x, pz - Player.pos.z) || Player.yaw;
    Cam.fp.pos.set(Player.pos.x, 1.6, Player.pos.z); Cam.fp.yaw = Player.yaw + Math.PI; Cam.fp.pitch = -0.35;
    Cam.to('fp', 0.7);
    Sfx.play('rustle');
    yield* wait(0.8);
    Sfx.play('heartbeat'); Sfx.muffle(true, 0.4);
    const rig = ph.subjectRig;
    let t = 0;
    const base = rig ? rig.root.position.clone() : null;
    while (t < 1.8) {
      const dt = yield; t += dt;
      if (rig) {
        rig.root.position.copy(base).add(_v1.set(ph.camPos.x - base.x, 0, ph.camPos.z - base.z).normalize().multiplyScalar(t * 0.45));
        rig.root.position.y = base.y + t * 0.3;
        rig.root.scale.setScalar(1 + t * 0.06);
        if (rig.glb) { poseRig(rig, ph.boss, 'Idle', 0.4 + t); rig.body.rotateX(rig.photoLean || 0); if (rig.head) rig.head.rotateZ(Math.sin(t * 9) * 0.06); }
        else if (rig.parts.head) rig.parts.head.rotation.z = Math.sin(t * 9) * 0.06;
      }
      Photos.render(ph, null);
      Photos.polMat.uniforms.uCrackle.value = t / 1.8 * 0.5;
      Cam.shake(0.05);
      if (t > 0.9 && !this._hb) { this._hb = true; Sfx.play('heartbeat'); }
    }
    this._hb = false;
    // it tears
    Sfx.play('tear'); UI.flash(220, 0.55);
    Photos.polMesh.visible = false;
    Photos.halves.forEach((h) => { h.visible = true; });
    t = 0;
    while (t < 0.55) {
      const dt = yield; t += dt; const k = easeIn(clamp(t / 0.55, 0, 1));
      Photos.halves[0].position.set(-k * 0.25, -k * 0.3, 0); Photos.halves[0].rotation.set(0, -k * 0.6, k * 0.9);
      Photos.halves[1].position.set(k * 0.25, -k * 0.35, 0); Photos.halves[1].rotation.set(0, k * 0.6, -k * 1.0);
    }
    Photos.overlay.visible = false; Render.overlayVisible = false; Photos.pose = 'normal';
    Photos.polMat.uniforms.uCrackle.value = 0;
    if (ph.subjectRig) { Render.scene.remove(ph.subjectRig.root); ph.subjectRig = null; }
    Sfx.muffle(false, 0.3);
    // the boss steps out (away from the player)
    let bx = lv.bossAt[0], bz = lv.bossAt[1];
    if (dist(bx, bz, Player.pos.x, Player.pos.z) < 4.5) {
      const rm = ROOMS[lv.arena]; let best = -1;
      for (const fx of [0.25, 0.5, 0.75]) for (const fz of [0.25, 0.5, 0.75]) {
        const x = lerp(rm.x0, rm.x1, fx), z = lerp(rm.z0, rm.z1, fz);
        if (!Flow.free(x, z)) continue;
        const d = dist(x, z, Player.pos.x, Player.pos.z);
        if (d > best && d < 9) { best = d; bx = x; bz = z; }
      }
    }
    const boss = new Boss(lv.boss, bx, bz);
    G.bosses.push(boss);
    Cam.to('iso', 1.1);
    Sfx.play('roar', bx, bz, 1, { pitch: BOSS[lv.boss].pitch });
    Cam.shake(1.0);
    Sfx.playMusic('boss', 0.4);
    UI.titleCard(BOSS[lv.boss].name, 'its true form', 2800, 'boss');
    UI.boss(BOSS[lv.boss].name, 1);
    UI.setObjective('Banish ' + BOSS[lv.boss].name.toLowerCase().replace('the ', 'the '), 'Watch the red warnings on the floor. Space to dodge.');
    yield* wait(1.15);
    yield* until(() => boss.state === 'fight' || boss.dead);
    G.phase = 'boss'; Player.control = true; UI.setPlaying(true);
  },

  onBossDefeated(boss) { Seq.run(boss.type === 'boogey' ? this.seqAfterBoogey(boss) : this.seqAfterBoss(LEVELS[G.level], boss)); },

  // ---------------- the side haunt: the thing in the bedroom wardrobe ----------------
  *seqBoogeyman() {
    G.phase = 'bossIntro'; Player.control = false; UI.setPlaying(false); UI.prompt(null); UI.hint(null);
    const wx = 15.9, wz = 12.55;
    Player.vel.set(0, 0, 0);
    Player.yaw = Math.atan2(wx - Player.pos.x, wz + 0.6 - Player.pos.z);
    Sfx.playMusic('none', 0.8);
    // it opens a crack... and something in there looks back
    Boogey.override = 0.06; Boogey.fast = false;
    Sfx.play('creak', wx, wz + 0.5, 1.3);
    yield* wait(1.0);
    Boogey.peekT = 1.5;
    Sfx.play('whisper', wx, wz, 1.4); Sfx.play('heartbeat');
    yield* wait(1.5);
    // BANG
    Boogey.override = 1; Boogey.fast = true;
    Sfx.play('doorSlam', wx, wz + 0.5, 1.4); Cam.shake(0.9); UI.flash(160, 0.35, '#ffd890');
    FX.burst(wx, 1.2, wz + 0.9, 0x4a4036, 26, 4.5, { size: 0.14, life: 1.4, grav: 2 });
    FX.smoke(wx, 0.6, wz + 0.9, 10, 0x1a1816, 0.9);
    // the room shuts behind you
    W.setArenaDoors('bedroom', false); G.arena = 'bedroom'; Flow.build('bedroom');
    const boss = new Boss('boogey', wx, wz + 0.35);
    boss.introTo = new THREE.Vector3(wx, 0, wz + 1.6);
    // (you stumble back from the doors)
    const p0 = Player.pos.clone(), p1 = new THREE.Vector3(clamp(p0.x, 14.9, 19.6), 0, Math.max(p0.z, wz + 3.5));
    boss.yaw = Math.atan2(p1.x - wx, p1.z - (wz + 1.6));
    G.bosses.push(boss);
    Cam.cine.pos.set(wx + 3.4, 2.25, wz + 6.4); Cam.cine.look.set(wx, 1.45, wz + 1.3); Cam.cine.fov = 42;
    Cam.to('cine', 0.7);
    Sfx.play('roar', wx, wz, 1, { pitch: 0.8 });
    Sfx.playMusic('boss', 0.6);
    let tt = 0;
    while (tt < 0.4) { const dt = yield; tt += dt; Player.pos.lerpVectors(p0, p1, easeOut(clamp(tt / 0.4, 0, 1))); Player.yaw = Math.atan2(wx - Player.pos.x, wz + 1.6 - Player.pos.z); }
    yield* wait(0.6);
    UI.titleCard(BOSS.boogey.name, 'he was in there the whole time', 2800, 'boss');
    UI.boss(BOSS.boogey.name, 1);
    UI.setObjective('Banish the Boogeyman', 'He hides. Your light finds him.');
    yield* wait(1.4);
    Cam.to('iso', 1.0);
    yield* until(() => boss.state === 'fight' || boss.dead);
    Boogey.override = null; Boogey.fast = false;
    G.phase = 'boss'; Player.control = true; UI.setPlaying(true);
  },

  *seqAfterBoogey(boss) {
    G.phase = 'reward';
    UI.boss(null);
    Sfx.playMusic('none', 2);
    G.side.boogey = true;
    W.lightsOut.bedroom = 0;
    yield* wait(0.8);
    Pickups.spawn('upgrade', boss.pos.x, boss.pos.z, true);
    for (let i = 0; i < 2; i++) { const k = Pickups.ammoKind(); if (k) Pickups.spawn(k, boss.pos.x + rand(-1, 1), boss.pos.z + rand(-1, 1), true); }
    Pickups.spawn('choco', boss.pos.x + rand(-1, 1), boss.pos.z + rand(-1, 1), true);
    UI.titleCard('NOTHING IN THERE', 'the wardrobe is empty now', 2600, 'clear');
    W.setArenaDoors('bedroom', true); Sfx.play('unlock'); Sfx.play('doorOpen');
    G.arena = null;
    UI.setObjective('Take what he left behind', 'A glowing polaroid');
    G.flags.upgradeTaken = false;
    yield* until(() => G.flags.upgradeTaken);
    yield* wait(0.6);
    const lb = LOST_DEFS.find((d) => d.boss === 'boogey');
    if (lb && Lost.add(lb.id)) {
      Sfx.play('rustle', undefined, undefined, 0.9);
      Lost.show(lb, 'boss');
      yield* until(() => UI.panelOpen !== 'lost');
      yield* wait(0.3);
    }
    this.startExplore(G.level);
  },

  *seqAfterBoss(lv, boss) {
    G.phase = 'reward';
    UI.boss(null);
    Sfx.playMusic('none', 2);
    const ph = Photos.current;
    ph.done = true;
    yield* wait(0.8);
    Pickups.spawn('upgrade', boss.pos.x, boss.pos.z, true);
    for (let i = 0; i < 3; i++) { const k = Pickups.ammoKind(); if (k) Pickups.spawn(k, boss.pos.x + rand(-1, 1), boss.pos.z + rand(-1, 1), true); }
    Pickups.spawn('candy', boss.pos.x + rand(-1, 1), boss.pos.z + rand(-1, 1), true);
    Pickups.spawn(lv.n >= 3 ? 'choco' : 'candy', boss.pos.x + rand(-1, 1), boss.pos.z + rand(-1, 1), true);
    UI.titleCard('PHOTO ' + lv.n + ' OF 5', 'banished', 2600, 'clear');
    if (lv.arena !== 'basement') { W.setArenaDoors(lv.arena, true); Sfx.play('unlock'); Sfx.play('doorOpen'); }
    G.arena = lv.arena === 'basement' ? 'basement' : null;
    UI.setObjective('Take what it left behind', 'A glowing polaroid');
    G.flags.upgradeTaken = false;
    yield* until(() => G.flags.upgradeTaken);
    yield* wait(0.6);
    // the haunt's own story was stuck to the back of the torn photo (shown the first time it turns up)
    const lb = LOST_DEFS.find((d) => d.boss === lv.boss);
    if (lb && Lost.add(lb.id)) {
      Sfx.play('rustle', undefined, undefined, 0.9);
      Lost.show(lb, 'boss');
      yield* until(() => UI.panelOpen !== 'lost');
      yield* wait(0.3);
    }
    if (lv.n < 5) {
      const next = Photos.list[lv.n];
      Photos.current = next;
      G.level = lv.n;
      G.dread = Math.min(1, G.dread + 0.19);
      this.applyMood(lv.n + 1);
      Photos.render(next, 'cute'); Photos.bake(next);
      next.developed = 0; next.developing = true;
      Sfx.play('whir');
      UI.toast(`Photo ${lv.n + 1} is starting to develop...`, 2400);
      G.phase = 'explore';
      UI.setObjective(`Photo ${lv.n + 1} is developing...`, 'Collect the loot and catch your breath');
      Sfx.playMusic('explore', 3);
      yield* until(() => next.developed >= 1);
      this.startExplore(lv.n);
    } else {
      yield* this.seqFinale();
    }
  },

  onPhotoDeveloped(ph) {
    Sfx.play('pickupHealth');
    UI.toast(`Photo ${ph.id + 1}: <b>${ph.title}</b>`, 2400);
  },

  offerUpgrade() {
    const pl = Player, w = pl.weapons;
    const pool = [
      { id: 'poker', name: 'Heavy Poker', icon: 'poker', glyph: '!', desc: 'Poker hits 50% harder and wider.', ok: true, apply: (s) => { s.meleeDmg *= 1.5; s.meleeArc *= 1.2; } },
      { id: 'reload', name: 'Quick Hands', icon: 'reload', glyph: 'R', desc: 'Reload 40% faster.', ok: w.nailgun.owned || w.shotgun.owned, apply: (s) => { s.reloadMul *= 0.6; } },
      { id: 'nailer', name: 'Rapid Nailer', icon: 'nailgun', glyph: '>>', desc: 'Nail gun fires 35% faster.', ok: w.nailgun.owned, apply: (s) => { s.nailRate *= 1.35; } },
      { id: 'buck', name: 'Buckshot', icon: 'shotgun', glyph: '::', desc: 'Shotgun fires 3 more pellets, tighter.', ok: w.shotgun.owned, apply: (s) => { s.pellets += 3; s.spread *= 0.8; } },
      { id: 'boom', name: 'Bigger Boom', icon: 'bomb', glyph: '*', desc: 'Pumpkin bombs: 40% bigger blast, carry 2 more.', ok: w.bomb.owned, apply: (s) => { s.bombRadius *= 1.4; s.bombMax += 2; } },
      { id: 'sweater', name: 'Thick Sweater', icon: 'sweater', glyph: '+', desc: '+30 max health and a full heal.', ok: true, apply: (s) => { s.maxHp += 30; pl.hp = s.maxHp; } },
      { id: 'sneakers', name: 'Light Sneakers', icon: 'shoe', glyph: '~', desc: 'Move 12% faster. Dodge recharges faster.', ok: true, apply: (s) => { s.speed *= 1.12; s.dodgeCd *= 0.65; } },
      { id: 'sugar', name: 'Sugar Rush', icon: 'candy', glyph: 'o', desc: 'Candy and chocolate heal 60% more.', ok: true, apply: (s) => { s.healMul *= 1.6; } },
      { id: 'hoard', name: 'Deep Pockets', icon: 'bag', glyph: '#', desc: '50% more ammo capacity and pickups.', ok: w.nailgun.owned || w.shotgun.owned, apply: (s) => { s.ammoMul *= 1.5; } },
      { id: 'revenge', name: 'Sweet Revenge', icon: 'heart', glyph: '<3', desc: 'Poker kills heal you for 5.', ok: true, apply: (s) => { s.lifesteal += 5; } },
      { id: 'beam', name: 'Halogen Bulb', icon: 'flashlight', glyph: 'O', desc: 'Wider flashlight. Lit enemies take 20% more damage.', ok: true, apply: (s) => { s.beam = 1; } },
    ].filter((u) => u.ok && !pl.upgrades.includes(u.id));
    const choices = [];
    while (choices.length < 3 && pool.length) choices.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
    G.paused = true; Input.unlock(); UI.setPlaying(false);
    UI.showUpgrade(choices, (u) => {
      pl.upgrades.push(u.id); u.apply(pl.stats);
      UI.setHealth(pl.hp, pl.stats.maxHp); UI.setWeapons(pl);
      UI.titleCard(u.name.toUpperCase(), u.desc, 2600, 'clear');
      G.paused = false; UI.setPlaying(true);
      G.flags.upgradeTaken = true;
    });
  },

  // ---------------- photo 5: the door that was never there ----------------
  *seqDoorEvent(lv, ph) {
    G.phase = 'event'; Player.control = false; UI.hint(null);
    yield* Photos.assist(ph, 0.45);
    Sfx.play('snap'); Sfx.muffle(true, 0.5); Photos.glow = 1.2; UI.flash(160, 0.25);
    const rig = ph.subjectRig;
    let t = 0;
    const start = rig ? rig.root.position.clone() : null;
    Sfx.play('giggle', undefined, undefined, 1, { pitch: 0.9 });
    while (t < 2.0) {
      const dt = yield; t += dt;
      Photos.glow = Math.max(0.2, Photos.glow - dt);
      if (rig) {
        if (rig.glb) { poseRig(rig, ph.minion, 'Idle', t); rig.head.rotateZ(Math.sin(t * 7) * 0.3); } else rig.head.rotation.z = Math.sin(t * 7) * 0.3;
        if (t > 1.1) { const k = clamp((t - 1.1) / 0.6, 0, 1); rig.root.position.set(start.x - 0.4 * k, 0, start.z - 0.5 * k); rig.root.scale.setScalar(1 - k * 0.6); if (k >= 1) rig.root.visible = false; }
      }
      Photos.redDoorLeaf.rotation.y = -0.6 + (t > 1.6 ? Math.min(0.45, (t - 1.6) * 1.5) : 0);
      Photos.render(ph, null);
    }
    Sfx.play('cackle', undefined, undefined, 0.8);
    // the door is real now
    Photos.redDoorLeaf.rotation.y = -0.9;
    setLayer(Photos.redDoor, 0); Photos.redDoor.visible = true;
    if (!W.redLight) W.redLight = W.addLight('hall', 2.05, 0.9, 14.3, 0xff5a20, 6, 6, { flicker: 0.3, kind: 'circle' });
    W.redLight.on = true; W.redLight.base = 6;
    W.redDoorInteract.enabled = true;
    yield* Photos.drop(0.75);
    Sfx.play('creak'); Sfx.play('doorOpen');
    yield* wait(0.6);
    Sfx.muffle(false, 0.8);
    Photos.exit(1.3);
    yield* wait(1.35);
    ph.photoGone = true;
    G.phase = 'basementDoor';
    Player.control = true; UI.setPlaying(true);
    UI.setObjective('Go down the red door', 'Your house never had a basement.');
    UI.toast('That door was never there.', 2400);
  },

  enterBasement() {
    if (G.inBasement) return;
    W.redDoorInteract.enabled = false;
    Seq.run(this.seqBasement(LEVELS[4]));
  },

  *seqBasement(lv, fromCheckpoint = false) {
    Player.control = false; UI.setPlaying(false);
    UI.fade(1, 700); Sfx.play('doorOpen');
    yield* wait(0.8);
    for (let i = 0; i < 6; i++) { Sfx.step('wood', undefined, undefined, 0.6); yield* wait(0.28); }
    G.inBasement = true; G.arena = 'basement';
    Player.pos.set(61.0, 0, 9.2); Player.yaw = Math.PI / 2 + 0.3;
    Cam.focus.copy(Player.pos); Cam.lookAhead.set(0, 0, 0); Cam.snap('iso');
    W.props.circleLight.on = true; W.props.circleLight.base = 3;
    if (!fromCheckpoint) this.saveCheckpoint('basement');
    Waves.start(lv, 'basement');
    Waves.spawnInitial(lv, 'basement', lv.start, { x: Player.pos.x, z: Player.pos.z });
    for (const e of G.enemies) { const a = rand(0, TAU); e.pos.set(70 + Math.cos(a) * rand(2, 4.5), 0, 11.25 + Math.sin(a) * rand(2, 4.5)); }
    Sfx.playMusic('none', 1);
    UI.fade(0, 1200);
    let h = UI.caption('You have lived here for years.<br>You never knew this was here.');
    yield* wait(3.4);
    UI.caption(null);
    UI.toast('Polaroids everywhere. Other houses. Other front doors.', 2600);
    Player.control = true; UI.setPlaying(true);
    G.phase = 'cute';
    UI.titleCard(lv.title.toUpperCase(), lv.tag || 'they look... friendly?', lv.tag ? 3000 : 2600);
    UI.setObjective('Uh oh', 'They seem harmless. For now.');
    let ct = 0;
    while (ct < 3.6 && !G.wave.aggro) { const dt = yield; ct += dt; }
    G.wave.aggro = true; G.phase = 'wave';
    Sfx.stinger(0.45); UI.flash(140, 0.35, '#ff2a10');
    UI.titleCard('NOT SO CUTE', 'they come in packs', 2000, 'boss');
    UI.setObjective('Survive', 'Some of them throw fire. Keep moving.');
    Sfx.playMusic('fight', 0.5);
    void h;
  },

  *seqFinale() {
    G.flags.basementCleared = true; G.phase = 'final0';
    yield* wait(1.0);
    Sfx.play('unlock', undefined, undefined, 0.5); Sfx.stinger(0.2);
    UI.toast('Somewhere upstairs, a lock clicks open.', 3000);
    W.props.circleLight.on = false;
    G.dread = 0.5; this.applyMood(5);
    UI.setObjective('Go back upstairs', 'The stairs by the west wall. Press E');
    Sfx.playMusic('title', 3);
    yield* until(() => G.flags.leftBasement);
    G.phase = 'final';
    UI.setObjective('Open the front door', 'It is over. Isn\'t it?');
    yield* until(() => G.flags.openFront);
    yield* this.seqEnding();
  },

  leaveBasement() {
    if (!G.inBasement) return;
    Seq.run((function* () {
      Player.control = false; UI.fade(1, 600); yield* wait(0.65);
      Waves.clear(); Pickups.clear(); Projectiles.clear(); Decals.clear(); Tele.clear();
      G.inBasement = false; G.arena = null;
      Player.pos.set(2.6, 0, 15.0); Player.yaw = Math.PI / 2;
      Cam.focus.copy(Player.pos); Cam.snap('iso');
      setLayer(Photos.redDoor, 0);
      if (W.redLight) W.redLight.on = false;
      G.dread = 0.3; Game.applyMood(5);
      UI.fade(0, 900); yield* wait(0.5);
      Player.control = true; G.flags.leftBasement = true;
    })());
  },

  *seqEnding() {
    G.phase = 'ending'; Player.control = false; UI.setPlaying(false); UI.prompt(null); UI.setObjective(null);
    let fin = null;
    try { fin = Lost.shootFinal(); } catch (e) { console.error(e); }
    Player.pos.set(1.15, 0, 17.8); Player.yaw = -Math.PI / 2;
    Cam.fp.pos.set(1.15, 1.6, 17.8); Cam.fp.yaw = Math.PI / 2; Cam.fp.pitch = -0.02;
    Cam.to('fp', 1.1);
    yield* wait(1.2);
    W.doors.front.target = 1; W.doors.front.col.active = false;
    Sfx.play('doorOpen'); Sfx.play('creak');
    this.applyMood(0);
    Render.setGrade({ tint: [1.0, 0.95, 1.04], lift: [0.01, 0.01, 0.026], sat: 0.85, contrast: 1.08, exposure: 1.12, vignette: 0.7 });
    // a final polaroid lies on the porch
    const endPh = this.endPhoto || (this.endPhoto = { id: 5, title: 'These Belong Here', room: 'porch', camPos: new THREE.Vector3(1.15, 1.6, 17.8), yaw: Math.PI / 2, pitch: -0.03, rt: new THREE.WebGLRenderTarget(PHOTO_RES, PHOTO_RES, { type: THREE.HalfFloatType }), caption: captionTexture('These Belong Here', 'line'), developed: 0 });
    Photos.placeWorldPhoto(endPh, -1.3, 17.8, 0.3);
    yield* wait(1.6);
    // walk out and look down at it
    let t = 0;
    while (t < 2.2) { const dt = yield; t += dt; const k = easeInOut(clamp(t / 2.2, 0, 1)); Cam.fp.pos.x = lerp(1.15, -0.6, k); Cam.fp.pitch = lerp(-0.02, -0.75, k); if (Math.random() < dt * 2) Sfx.step('wood'); }
    yield* wait(0.4);
    // render: YOU, standing where the visitor stood, five photos in hand
    const clone = buildPlayerModel(true);
    clone.root.position.set(-1.9, 0, 17.8); clone.root.rotation.y = Math.PI / 2;
    if (clone.glb) {
      posePlayer(clone, 'Idle', 'R_Offer', 0.4);
      const fan = Assets.has('man') ? Assets.inst('man', { nodes: ['Photos'] }) : null;
      if (fan && clone.handR) clone.handR.add(fan);
      clone.flashlight.visible = false;
    } else {
      clone.armR.rotation.x = -1.1; clone.armL.rotation.x = -0.2;
      const fan = grp(clone.handR, 0, -0.05, 0.08);
      for (let i = 0; i < 5; i++) mk(Geo.box(0.088, 0.003, 0.107), new THREE.MeshLambertMaterial({ color: 0xf2eee4 }), -0.07 + i * 0.035, i * 0.002, 0.05, fan, { ry: -0.5 + i * 0.25, cast: false });
    }
    setLayer(clone.root, 1);
    Render.scene.add(clone.root);
    Photos.removeWorldPhoto();
    const fpPos = Cam.fp.pos.clone();
    const doorWas = W.doors.front.open;
    W.doors.front.open = 1;
    Photos.render(endPh, 'empty');
    Render.scene.remove(clone.root);
    void fpPos; void doorWas;
    Photos.setPhotoMaterial(endPh);
    Photos.polMat.uniforms.uDevelop.value = 0;
    Photos.pose = 'ending'; Photos.show = 0; Photos.showTarget = 1; Photos.overlay.visible = true; Render.overlayVisible = true;
    Sfx.play('rustle');
    t = 0;
    while (t < 4.5) { const dt = yield; t += dt; Photos.polMat.uniforms.uDevelop.value = Math.min(1, t / 4); }
    Sfx.stinger(0.3);
    UI.dialog('YOU', 'These belong here.');
    yield* wait(2.2);
    // (upstairs stayed boxed off and pitch black all night. Now it is someone else's turn)
    UI.dialog('YOU', 'These belong here. Would you like to try the upstairs?', true);
    Sfx.osc('sawtooth', 70, 62, 1.4, 0.07, { filter: 'lowpass', ff: 300, rev: 0.6, attack: 0.2 });
    yield* wait(2.6);
    // ...and one more photo slips out from behind the stack: the last lost photo. It shows you upstairs, and that
    // is where you go
    if (fin) { yield* this.seqLastPhoto(fin); yield* this.seqUpstairs(); }
    else { yield* wait(1.2); UI.dialog(null); UI.fade(1, 2200); yield* wait(2.4); }
    UI.dialog(null);
    Photos.overlay.visible = false; Render.overlayVisible = false; Photos.pose = 'normal';
    UI.showHUD(false);
    UI.titleCard('HOW YOU HAUNT ME', 'Look At This Polaroid', 4200);
    yield* wait(4.5);
    Store.del('hyhm_save_v1');
    G.state = 'ending';
    UI.showEnding(G.stats, fin ? Lost.def('you') : null);
  },

  // the last photo flutters down to the porch boards. Picked up, it develops: you, upstairs, under a bare bulb.
  // Then it changes in your hands into what you become up there
  *seqLastPhoto(fin) {
    const fp = Cam.fp, yaw = fp.yaw, p0 = fp.pitch, y0 = fp.pos.y;
    const F = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw)), R = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw)), UP = new THREE.Vector3(0, 1, 0);
    const base = fp.pos.clone();
    // the flashlight gives out...
    G.flags.flashFlicker = 0.3; G.flags.flashDead = true; Sfx.play('flicker');
    yield* wait(0.45);
    // ...and the last photo slips out from behind the one in your hands: undeveloped, a faint glow in the dark
    Sfx.play('rustle', undefined, undefined, 0.8);
    const d0 = 0.37, h0 = y0 - 0.27;
    const wp = Photos.placeWorldPhoto({ title: fin.title, imageCanvas: null }, base.x + F.x * d0, base.z + F.z * d0, yaw);
    wp.scale.setScalar(0.5); wp.userData.glow.visible = false; wp.material.emissiveIntensity = 0.4;
    const toCam = new THREE.Vector3(-F.x * d0, y0 - h0, -F.z * d0).normalize();
    const n = new THREE.Vector3(), r = new THREE.Vector3(), u = new THREE.Vector3(), M = new THREE.Matrix4();
    let t = 0;
    const T = 1.6;
    while (t < T) {
      const dt = yield; t += dt;
      if (t > 0.3) Photos.showTarget = 0;
      const k = clamp(t / T, 0, 1), d = lerp(d0, 1.1, 1 - (1 - k) * (1 - k)), sway = Math.sin(t * 5.2) * 0.09 * (1 - k);
      wp.position.set(base.x + F.x * d + R.x * sway, lerp(h0, 0.03, Math.pow(k, 1.3)), base.z + F.z * d + R.z * sway);
      // facing you at first, tumbling flat as it falls
      n.copy(toCam).lerp(UP, smoothstep(0, 0.85, k)).addScaledVector(R, Math.sin(t * 7.3) * 0.35 * (1 - k)).addScaledVector(F, Math.cos(t * 6.1) * 0.2 * (1 - k)).normalize();
      r.crossVectors(F, n).normalize(); u.crossVectors(n, r);
      const spin = Math.sin(t * 3.1) * 0.5 * (1 - k) + 0.35 * k;
      r.applyAxisAngle(n, spin); u.applyAxisAngle(n, spin);
      wp.quaternion.setFromRotationMatrix(M.makeBasis(r, u, n));
      fp.pitch = lerp(p0, -1.0, easeInOut(k));
    }
    wp.userData.glow.visible = true; wp.material.emissiveIntensity = 0.35;
    Sfx.play('rustle', undefined, undefined, 0.45);
    yield* wait(0.7);
    UI.dialog(null);
    // pick it up
    const at = wp.position.clone();
    t = 0;
    while (t < 0.85) { const dt = yield; t += dt; const k = easeInOut(clamp(t / 0.85, 0, 1)); fp.pos.y = lerp(y0, 1.1, k); fp.pos.x = lerp(base.x, base.x + (at.x - base.x) * 0.3, k); fp.pos.z = lerp(base.z, base.z + (at.z - base.z) * 0.3, k); fp.pitch = lerp(-1.0, -1.2, k); }
    Photos.removeWorldPhoto();
    Sfx.play('rustle');
    fin.developed = 0;
    Photos.setPhotoMaterial(fin);
    const U = Photos.polMat.uniforms;
    U.uDevelop.value = 0;
    Photos.pose = 'ending'; Photos.show = 0; Photos.showTarget = 1;
    const pp = fp.pos.clone();
    t = 0;
    while (t < 1.0) { const dt = yield; t += dt; const k = easeInOut(clamp(t / 1.0, 0, 1)); fp.pos.y = lerp(1.1, y0, k); fp.pos.x = lerp(pp.x, base.x, k); fp.pos.z = lerp(pp.z, base.z, k); fp.pitch = lerp(-1.2, -0.35, k); }
    // it develops: you, upstairs, under a bare bulb
    t = 0;
    while (t < 3.6) { const dt = yield; t += dt; U.uDevelop.value = Math.min(1, t / 3.4); }
    yield* wait(1.6);
    // somewhere above you, a board creaks
    Sfx.play('creak', undefined, undefined, 0.75);
    yield* wait(1.5);
  },

  // first person walk along a smooth path through pts ([x, y, z] eye positions) at about `speed` m/s, easing in
  // and out: the view turns ahead into the curve, a footstep every stride meters, the head bobs a little
  *fpWalk(pts, speed, o = {}) {
    const fp = Cam.fp, path = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)), false, 'centripetal');
    const len = path.getLength(), T = len / speed, ta = Math.min(o.ease ?? 0.9, T / 2), vm = 1 / (T - ta);
    const frac = (t) => (t < ta ? 0.5 * vm * t * t / ta : t < T - ta ? vm * (t - ta / 2) : 1 - 0.5 * vm * (T - t) * (T - t) / ta);
    const P = new THREE.Vector3(), Q = new THREE.Vector3(), stride = o.stride || 0.75;
    let t = 0, next = stride * 0.5;
    while (t < T) {
      const dt = yield; t = Math.min(T, t + dt);
      const u = clamp(frac(t), 0, 1), s = u * len;
      path.getPointAt(u, P);
      fp.pos.set(P.x, P.y - 0.03 + Math.abs(Math.sin(s / stride * Math.PI)) * 0.03 * (o.bob ?? 1), P.z);
      path.getPointAt(Math.min(1, u + 1.2 / len), Q);
      if (Q.distanceToSquared(P) > 0.01) fp.yaw = dampAngle(fp.yaw, camYawTo(Q.x - P.x, Q.z - P.z), o.turn ?? 3.5, dt);
      fp.pitch = damp(fp.pitch, o.pitch ?? 0, 3, dt);
      if (s >= next) { next += stride; Sfx.step('wood', undefined, undefined, o.stepVol ?? 0.8); if (o.onStep) o.onStep(s, P); }
      if (o.each) o.each(u, P, dt, t);
    }
  },

  // Up to where the photo was taken. You turn back into the house and climb the stairs; the front door swings shut
  // and the house goes dark below you. At the top a bare bulb clicks on behind you, your own shadow on the wall in
  // front of you, and you walk to it. Then the camera is where the photo was taken from: you, under the bulb. The
  // flash goes off, and the attic does what it does to whoever comes up here. It ends on the face
  *seqUpstairs() {
    const fp = Cam.fp, F = Lost.figure(), L = W.atticBulb, [fx, fy, fz] = ATTIC, shot = Lost.def('you').shot, E = ATTIC_Y + 1.6;
    // (the strobe: dim the bulb to a fraction of itself, or let it be when null)
    const bulb = (v) => { L.force = v == null ? null : L.base * v; };
    UI.dialog(null); UI.showHUD(false);
    // the photo goes down
    Photos.showTarget = 0;
    yield* wait(0.6);
    Photos.overlay.visible = false; Render.overlayVisible = false; Photos.pose = 'normal';
    // the attic is up there now: the stairwell open, the bulb off
    W.attic.visible = true; W.atticOpen = true; W.atticSwing = 0.03; bulb(0);
    Sfx.playMusic('none', 7);
    G.lightAt = { room: 'hall', x: 0.5, z: 17.8 };
    // turn back to the house (to the right, past north)...
    let t = 0;
    const y0 = fp.yaw, p0 = fp.pitch;
    while (t < 1.6) { const dt = yield; t += dt; const k = easeInOut(clamp(t / 1.6, 0, 1)); fp.yaw = lerp(y0, -Math.PI / 2, k); fp.pitch = lerp(p0, 0.02, k); }
    // ...in through the front door, across the hall to the foot of the stairs (squeezing past the boxes)
    yield* this.fpWalk([[fp.pos.x, 1.6, fp.pos.z], [1.0, 1.6, 17.6], [4.0, 1.6, 16.4], [7.0, 1.6, 14.7], [8.7, 1.6, 13.75], [8.35, 1.6, 13.14], [7.8, 1.6, 13.1]], 1.5, {
      turn: 5, each: (u, P) => { G.lightAt.x = P.x; G.lightAt.z = P.z; },
    });
    // up the stairs, one at a time, toward the round window at the top. Behind you the front door swings shut,
    // below you the house goes dark
    const run = 7.15 / 12, stairY = (x) => { const q = clamp((7.3 - x) / run + 0.5, 0, 12.5), n = Math.floor(q); return 0.25 * Math.min(12, n + smoothstep(0.45, 1, q - n)); };
    const X0 = fp.pos.x, X1 = 1.64, Z0 = fp.pos.z, TC = 7.2;
    let n0 = 0, door = 0, tD = -1;
    t = 0;
    while (t < TC) {
      const dt = yield; t += dt;
      const k = clamp(t / TC, 0, 1), x = lerp(X0, X1, 0.5 - 0.5 * Math.cos(Math.PI * k));
      fp.pos.set(x, 1.6 + stairY(x), lerp(Z0, 12.98, k));
      fp.yaw = dampAngle(fp.yaw, Math.PI / 2 + Math.sin(t * 0.7) * 0.025, 4, dt);
      fp.pitch = damp(fp.pitch, lerp(0.03, 0.3, smoothstep(0.25, 1, k)), 2, dt);
      const n = Math.floor((7.3 - x) / run + 0.5);
      if (n > n0) { n0 = n; Sfx.step('wood', undefined, undefined, 0.9); if (n % 3 === 2) Sfx.creak(rand(-0.4, 0.4), 0.07); }
      if (door === 0 && x < 6.6) { door = 1; W.doors.front.target = 0; W.doors.front.col.active = true; Sfx.play('creak', undefined, undefined, 0.6); }
      if (door === 1 && W.doors.front.open < 0.04) { door = 2; Sfx.play('doorSlam', undefined, undefined, 0.3); }
      if (tD < 0 && x < 5.0) { tD = 0; Sfx.play('lightsOut'); }
      if (tD >= 0 && tD < 0.6) {
        tD += dt;
        const v = tD < 0.45 ? (Math.random() < 0.55 ? 0.85 : 0.1) : 1;
        for (const r of ['hall', 'porch', 'kitchen', 'bedroom']) W.lightsOut[r] = v;
        if (tD >= 0.6) {
          // (from here on only the attic's own light: the cold of the round windows, the bulb when it comes on)
          G.photoRoom = 'attic'; G.lightAt = null; W.atticLive = true;
          G.ambient = [0.14, 0.03]; G.fog = [4, 30];
          G.amb = { wind: 0.9, room: 0.04, creaks: true, clock: 0.3 };
          Render.setGrade({ tint: [1.0, 0.97, 0.95], lift: [0.004, 0.004, 0.01], sat: 0.84, contrast: 1.16, exposure: 1.1, vignette: 1.0 });
        }
      }
    }
    // at the top, the round window and the night in it. Something clicks behind you: the bulb comes on, and your
    // shadow stands on the wall in front of you (your body, unseen: the camera is in your head)
    yield* wait(0.8);
    Sfx.creak(0.6, 0.06);
    yield* wait(0.7);
    Lost.setFigure(F, 0, 0); Lost.ghost(F, true);
    F.g.position.set(fp.pos.x, fp.pos.y - 1.6, fp.pos.z); F.g.rotation.y = fp.yaw + Math.PI;
    Render.scene.add(F.g);
    Sfx.play('lightsOn');
    // (the cold from the window gives way: the shadow stands out)
    W.atticWinL.force = W.atticWinL.base * 0.35;
    for (const v of [1.6, 0.1, 1.4, 0.05, 1.7]) { bulb(v); yield* wait(0.04 + Math.random() * 0.05); }
    L.on = true;
    Sfx.osc('sawtooth', 55, 49, 7, 0.05, { filter: 'lowpass', ff: 320, rev: 0.7, attack: 2 });
    // (the light settles; you look down at your own shadow)
    t = 0;
    while (t < 1.7) { const dt = yield; t += dt; bulb(lerp(1.7, 1, smoothstep(0, 1.6, t))); fp.pitch = damp(fp.pitch, 0.06, 2.2, dt); }
    bulb(null);
    // turn around (to the left): the attic end to end, the bulb hanging in the middle of it, nobody under it
    const yA = fp.yaw, turn = new THREE.CatmullRomCurve3([fp.pos.clone(), new THREE.Vector3(0.62, 4.6, 13.05), new THREE.Vector3(0.75, E, 14.15)]);
    t = 0;
    while (t < 2.5) {
      const dt = yield; t += dt;
      const k = clamp(t / 2.5, 0, 1);
      fp.yaw = yA + Math.PI * easeInOut(k); fp.pitch = damp(fp.pitch, 0.04, 2.5, dt);
      turn.getPoint(smoothstep(0.2, 1, k), fp.pos);
      F.g.rotation.y = fp.yaw + Math.PI; F.g.position.set(fp.pos.x, fp.pos.y - 1.6, fp.pos.z);
      if (k > 0.55 && F.g.parent) Render.scene.remove(F.g);
    }
    W.atticWinL.force = null;
    yield* wait(0.6);
    // ...and walk to it. Halfway there the lightning shows the whole attic for a moment
    let flashed = false;
    yield* this.fpWalk([[0.75, E, 14.15], [2.6, E, 14.35], [4.5, E, 14.1], [5.65, E, 13.0], [fx, E, fz]], 1.05, {
      turn: 3, stride: 0.72, stepVol: 0.9,
      onStep: (s) => { if (Math.random() < 0.3) Sfx.creak(rand(-0.5, 0.5), 0.05); },
      each: (u) => { if (!flashed && u > 0.42) { flashed = true; W.lightning = 1; Sfx.play('thunder', undefined, undefined, 0.6); } },
    });
    // right under it. Look up at it...
    t = 0;
    while (t < 2.1) {
      const dt = yield; t += dt;
      const b = L.pos, dx = b.x - fp.pos.x, dz = b.z - fp.pos.z;
      fp.yaw = dampAngle(fp.yaw, camYawTo(dx, dz), 2.4, dt); fp.pitch = damp(fp.pitch, Math.atan2(b.y - fp.pos.y, Math.hypot(dx, dz)), 2.2, dt);
      bulb(t > 1.1 && Math.random() < 0.18 ? rand(0.25, 0.7) : null);
      if (t > 1.1 && Math.random() < dt * 3) Sfx.play('flicker');
    }
    bulb(null);
    // ...and back down, ahead, into the dark where something is standing
    t = 0;
    while (t < 1.3) { const dt = yield; t += dt; fp.yaw = dampAngle(fp.yaw, -Math.PI / 2, 3.5, dt); fp.pitch = damp(fp.pitch, -0.03, 3.5, dt); }
    yield* wait(0.4);
    Sfx.play('lightsOut');
    for (const v of [0.4, 1, 0.15, 0.8, 0.05]) { bulb(v); yield* wait(0.06 + Math.random() * 0.06); }
    bulb(0);
    yield* wait(0.9);

    // ---- where the photo was taken from: you, under the bulb, looking back ----
    Cam.cine.pos.set(...shot.cam); Cam.cine.look.set(...shot.look); Cam.cine.fov = PHOTO_FOV;
    Cam.snap('cine');
    Lost.ghost(F, false); Lost.setFigure(F, 0, 0);
    F.g.position.set(fx, fy, fz); F.g.rotation.y = Math.atan2(shot.cam[0] - fx, shot.cam[2] - fz);
    if (!F.g.parent) Render.scene.add(F.g);
    const cam0 = Cam.cine.pos.clone(), look0 = Cam.cine.look.clone(), camB = cam0.clone(), dolly = look0.clone().sub(cam0).normalize();
    // (held by hand: the camera breathes a little)
    const drift = () => { const tt = G.time; Cam.cine.pos.set(camB.x + Math.sin(tt * 0.6) * 0.012, camB.y + Math.sin(tt * 0.83 + 1) * 0.008, camB.z + Math.sin(tt * 0.47 + 2) * 0.012); };
    for (const v of [0.7, 0.1, 1, 0.3, 1]) { bulb(v); yield* wait(0.05 + Math.random() * 0.05); }
    bulb(null);
    t = 0;
    while (t < 1.4) { const dt = yield; t += dt; drift(); if (t > 0.4 && t - dt <= 0.4) Sfx.play('heartbeat'); if (t > 1.1 && t - dt <= 1.1) Sfx.play('heartbeat'); }
    // the flash: this is the photo
    Sfx.play('snap'); FX.light(shot.cam[0], shot.cam[1], shot.cam[2], 0xe8eeff, 140, 0.3); UI.flash(170, 0.85);
    yield* wait(0.4);
    Sfx.play('whir');
    yield* wait(0.5);
    // the attic takes you: the bulb stutters, the arms are pulled out on ropes nobody holds, the feet leave the
    // floor, and every time the light comes back there is less of you
    Sfx.osc('sawtooth', 52, 36, 7.5, 0.07, { filter: 'lowpass', ff: 380, rev: 0.6, attack: 3 });
    W.atticSwing = 0.07;
    const DARK = [[1.0, 0.12], [1.9, 0.18], [2.6, 0.1], [3.1, 0.24], [3.7, 0.12], [4.15, 0.3], [4.75, 0.15], [5.15, 0.36], [5.75, 0.55]];
    const STAGE = [[1.9, 1], [3.1, 2], [4.15, 3], [5.15, 4], [5.75, 5]];
    const TT = 6.45;
    // (loose straw flies off wherever it just changed, as the light comes back)
    const AT = { 1: ['handL', 'handR'], 2: ['head'], 3: ['body', 'footL', 'footR'], 4: ['head'], 5: ['body', 'head'] }, wp = new THREE.Vector3();
    const straw = (s) => { for (const n of AT[s] || []) { const b = F.at && F.at[n]; if (!b) continue; b.getWorldPosition(wp); FX.burst(wp.x, wp.y, wp.z, 0x7a5e30, 12, 1.6, { size: 0.035, life: 1.4, grav: 2.5, drag: 2.2, upMin: -0.2, upMax: 0.8 }); } };
    let stage = 0, wasDark = false, beat = 0.9, burst = 0;
    t = 0;
    while (t < TT) {
      const dt = yield; t += dt;
      // (creeping closer while it happens)
      camB.copy(cam0).addScaledVector(dolly, 1.1 * smoothstep(0, TT + 0.8, t)); Cam.cine.fov = lerp(PHOTO_FOV, 36, smoothstep(0, TT, t));
      drift();
      Lost.setFigure(F, smoothstep(0.2, 5.9, t), stage);
      const dk = DARK.some(([a, l]) => t >= a && t < a + l);
      // (the flying straw is no light of its own: gone with the light)
      Particles.dust.points.visible = !dk;
      if (dk) {
        bulb(0.02);
        if (!wasDark) Sfx.play('flicker');
        // (the change happens in the dark)
        for (const [a, s] of STAGE) if (t >= a && stage < s) { stage = s; burst = s; Lost.setFigure(F, F.k, stage); Sfx.play('rustle', undefined, undefined, 0.6 + s * 0.08); if (s === 3) Sfx.creak(0, 0.08); }
      } else {
        bulb(0.88 + Math.sin(t * 37) * Math.sin(t * 13.3) * 0.14);
        if (burst && burst < 5) { straw(burst); burst = 0; }
      }
      wasDark = dk;
      beat -= dt;
      if (beat <= 0) { beat = lerp(0.85, 0.32, t / TT); Sfx.play('heartbeat'); }
    }
    Particles.dust.points.visible = true;
    // the bulb flares: what hangs there now
    Lost.setFigure(F, 1, 5);
    straw(5);
    Lost.add('you');
    bulb(2.6); UI.flash(260, 0.55, '#fff1d8'); Sfx.stinger(0.5); Cam.shake(0.35);
    const caw = (d) => { Sfx.osc('sawtooth', 820, 560, 0.22, 0.07, { delay: d, filter: 'bandpass', ff: 1250, q: 2.5, rev: 0.5, distort: true }); };
    caw(0.5); caw(0.85);
    W.atticSwing = 0.11;
    t = 0;
    while (t < 0.8) { const dt = yield; t += dt; bulb(lerp(2.6, 1, smoothstep(0, 0.8, t))); camB.copy(cam0).addScaledVector(dolly, 1.1 * smoothstep(0, TT + 0.8, TT + t)); drift(); }
    bulb(null);
    // closer, slowly, until the face is all there is: the burlap, the stitches, the bulb swinging across it
    // (the middle of the stitched face, a little under the eyes, and the way it looks: the head hangs, so the camera
    // ends up a little below it, looking up into it)
    const sack = F.sack, sackC = new THREE.Vector3(), faceC = new THREE.Vector3(), faceD = new THREE.Vector3();
    if (sack) { sack.getWorldPosition(sackC); sack.localToWorld(faceC.set(0, -0.06, 1)); faceD.subVectors(faceC, sackC); faceD.y *= 0.5; faceD.normalize(); }
    else { faceC.set(fx, fy + 1.6, fz); faceD.set(shot.cam[0] - fx, 0, shot.cam[2] - fz).normalize(); }
    const camEnd = faceC.clone().addScaledVector(faceD, 0.44), fill = W.atticFill, camS = Cam.cine.pos.clone(), lookS = Cam.cine.look.clone(), fovS = Cam.cine.fov;
    t = 0;
    const TP = 4.3;
    while (t < TP) {
      const dt = yield; t += dt;
      const k = easeInOut(clamp(t / TP, 0, 1));
      Cam.cine.pos.lerpVectors(camS, camEnd, k); Cam.cine.look.lerpVectors(lookS, faceC, Math.min(1, k * 1.15));
      Cam.cine.fov = lerp(fovS, 34, k);
      if (Math.random() < dt * 0.6) bulb(rand(0.5, 0.8)); else bulb(null);
      // (the light off the bulb in the burlap: a little warm fill from the front, so the face can be seen)
      if (fill) { fill.pos.copy(Cam.cine.pos).lerp(faceC, 0.35); fill.pos.y += 0.25; fill.force = fill.base * smoothstep(0.2, 1, k); }
    }
    bulb(null);
    // it hangs there. Once the head gives a little twitch on the rope
    const head = F.bones.find((o) => o.b.name === 'head'), hq = head ? head.b.quaternion.clone() : null, tw = new THREE.Quaternion(), ax = new THREE.Vector3(0, 0, 1);
    t = 0;
    while (t < 2.3) {
      const dt = yield; t += dt;
      if (head) head.b.quaternion.copy(hq).multiply(tw.setFromAxisAngle(ax, 0.07 * smoothstep(1.0, 1.06, t) * (1 - smoothstep(1.06, 1.5, t))));
      if (t > 1.0 && t - dt <= 1.0) Sfx.creak(0, 0.07);
    }
    // one more flash, the bulb bursts, and that's all
    Sfx.play('snap'); FX.light(Cam.cine.pos.x, Cam.cine.pos.y, Cam.cine.pos.z, 0xe8eeff, 90, 0.25); UI.flash(140, 0.95);
    bulb(0); Sfx.noise(0.12, 0.3, { ftype: 'highpass', f0: 2600 }); Sfx.noise(0.5, 0.12, { ftype: 'bandpass', f0: 5200, f1: 1800, q: 1.5, delay: 0.05 });
    UI.fade(1, 250);
    yield* wait(0.6);
    Sfx.play('whir');
    yield* wait(1.6);
  },

  // the attic back the way it was before the end: shut and dark, the bulb at rest, nobody in it
  resetAttic() {
    const F = Lost._fig;
    if (F) { if (F.g.parent) F.g.parent.remove(F.g); Lost.ghost(F, false); Lost.setFigure(F, 0, 0); }
    if (W.attic) { W.attic.visible = false; W.atticOpen = false; W.atticLive = false; W.atticSwing = 0.04; }
    if (W.atticBulb) { W.atticBulb.force = null; W.atticBulb.on = true; }
    if (W.atticFill) { W.atticFill.force = 0; W.atticFill.pos.copy(W.atticFill.home); }
    if (W.atticWinL) W.atticWinL.force = null;
    G.photoRoom = null; G.lightAt = null; G.ambient = null; G.fog = null; G.amb = null;
    if (Particles.dust) Particles.dust.points.visible = true;
  },

  // ---------------- death / checkpoints ----------------
  onPlayerDeath() {
    G.stats.deaths++;
    Player.control = false;
    Seq.run((function* () {
      G.slowmoT = 0.6; G.slowmoScale = 0.3; Sfx.stinger(0.4); Sfx.playMusic('none', 1);
      UI.flash(500, 0.7, '#600000');
      if (!Player.rig.glb) { Player.rig.body.rotation.x = -1.4; Player.rig.body.position.y = 0.2; }
      yield* wait(0.25);
      UI.fade(0.85, 900);
      yield* wait(1.0);
      Input.unlock(); UI.setPlaying(false);
      UI.showGameOver();
    })());
  },

  saveCheckpoint(stage) {
    this.checkpoint = { level: G.level, stage, player: Player.snapshot(), dread: G.dread, clock: G.clockMinutes, stats: Object.assign({}, G.stats), side: Object.assign({}, G.side) };
    Store.set('hyhm_save_v1', this.checkpoint);
  },

  retryCheckpoint(fromSave = false) {
    const cp = this.checkpoint; if (!cp) return this.toTitle();
    Seq.clear(); this.clearWorld();
    UI.closePanel(); UI.showHUD(true); UI.boss(null); UI.wave(null); UI.dialog(null); UI.caption(null);
    G.state = 'play'; G.paused = false; G.haunted = true; G.dread = cp.dread; G.level = cp.level; G.clockMinutes = cp.clock;
    G.side = Object.assign({}, cp.side || {});
    if (fromSave && cp.stats) G.stats = Object.assign({}, cp.stats);
    G.flags.locked = true;
    Photos.overlay.visible = false; Render.overlayVisible = false; Photos.mode = 'off'; Photos.pose = 'normal';
    Input.unlock();
    Player.restore(cp.player); Player.visible = true; Player.rig.root.visible = true;
    if (Player.rig.glb) { if (Player.rig.anim) Player.rig.anim.reset(); } else { Player.rig.body.rotation.x = 0; Player.rig.body.position.y = 0; }
    UI.setHealth(Player.hp, Player.stats.maxHp); UI.setWeapons(Player);
    W.props.flashlightItem.visible = !Player.hasFlashlight; W.props.pokerItem.visible = !Player.weapons.poker.owned;
    W.doors.front.target = 0; W.doors.front.open = 0; W.doors.front.col.active = true;
    for (let i = 0; i < Photos.list.length; i++) {
      const ph = Photos.list[i];
      ph.done = i < cp.level; ph.developing = false; ph.photoGone = false;
      ph.developed = i <= cp.level ? 1 : 0;
      if (i <= cp.level && (!ph.rendered || !ph.thumb)) { Photos.render(ph, i === cp.level ? 'cute' : 'empty'); Photos.bake(ph); }
    }
    const ph = Photos.list[cp.level];
    Photos.render(ph, 'cute');
    Photos.current = ph;
    this.applyMood(cp.level + 1);
    UI.fade(0, 900);
    if (cp.stage === 'basement') {
      setLayer(Photos.redDoor, 0); Photos.redDoor.visible = true;
      Seq.run(this.seqBasement(LEVELS[4], true));
      return;
    }
    Player.pos.set(7.0, 0, 18.4); Player.yaw = Math.PI;
    if (cp.level >= 1) { const r = ROOMS.hall; Player.pos.set((r.x0 + r.x1) / 2, 0, (r.z0 + r.z1) / 2); }
    Cam.focus.copy(Player.pos); Cam.lookAhead.set(0, 0, 0); Cam.snap('iso');
    UI.setPlaying(true);
    this.startExplore(cp.level);
  },
};

// =====================================================================
//  MAIN LOOP & BOOT
// =====================================================================
const NO_DRS = /[?&]nodrs/.test(QS);
const NO_PROXY_SIMPLIFY = /[?&]fullproxy/.test(QS);
const Main = {
  last: 0,
  frames: 0, fpsT: 0,
  start() {
    UI.init();
    Render.init(UI.el.canvas);
    Cam.init();
    Particles.init(); Chunks.init(); Decals.init(); Tele.init(); Nails.init();
    Input.init(UI.el.canvas);
    G.state = 'boot';
    // the counter (LoadMeter): the downloads, the textures up to the GPU, the house built, its shaders compiled, the
    // view out of the windows and the first frame. 99 % at most: when it's all done the door takes its place
    const ldp = UI.el.loading.querySelector('.p');
    let shown = -1;
    const m = this.meter = new LoadMeter({ dl: 0.55, gpu: 0.08, build: 0.11, shaders: 0.22, view: 0.04 }, (v) => {
      const n = Math.min(99, Math.floor(v * 100));
      if (n !== shown && ldp) { shown = n; ldp.textContent = 'DEVELOPING\u2026 ' + n + '%'; }
    });
    // (the haunts start on their way as soon as the house is in: Assets.loadLater)
    Assets.loadAll(m).then(() => { Assets.loadLater(); return Assets.upload(Render.renderer, (f) => m.set('gpu', f)); }).then(() => this.boot()).catch((e) => console.error(e));
  },
  // Compile the shaders of a list of things, counting them ready (onProgress 0..1). Each entry: { obj, target (the
  // scene whose lights they're lit by, else obj itself), cam, hdr (into the HDR scene target: the variant the game
  // draws the scene in), before, after }. In parallel where the browser offers it (all handed over at once, then
  // counted off as they get ready), else one after another, each finished before the next, a frame between them.
  async compileList(list, onProgress = () => { }, limitMs = 20000) {
    const r = Render.renderer, par = !!r.extensions.has('KHR_parallel_shader_compile');
    const progOf = (mt) => { const p = r.properties.get(mt); return p && p.currentProgram; };
    const compileOne = (e) => {
      if (e.before) e.before();
      r.setRenderTarget(e.hdr ? Render.rt : null);
      try { return [...r.compile(e.obj, e.cam, e.target || e.obj)]; } catch (err) { console.error(err); return []; } finally { r.setRenderTarget(null); if (e.after) e.after(); }
    };
    if (par) {
      let mats = [];
      for (const e of list) mats.push(...compileOne(e));
      mats = [...new Set(mats)];
      const total = mats.length || 1, t0 = performance.now();
      while (mats.length && performance.now() - t0 < limitMs) {
        mats = mats.filter((mt) => { const p = progOf(mt); return !!p && !p.isReady(); });
        onProgress(1 - mats.length / total);
        if (mats.length) await new Promise((res) => setTimeout(res, 25));
      }
    } else {
      for (let i = 0; i < list.length; i++) {
        for (const mt of compileOne(list[i])) { const p = progOf(mt); try { if (p) p.getUniforms(); } catch (err) { /* three reports it */ } }
        onProgress((i + 1) / list.length);
        await letPaint();
      }
    }
    onProgress(1);
  },
  // Compile the shaders of everything that only shows up later (critters, bosses, pickups, projectiles, the held
  // weapons and the first person hands) in the variant the game renders them with: the first wave, boss or pickup
  // of each kind doesn't stutter. This runs while the title is up, once the haunts are in (Assets.loadLater).
  async warmShaders(onProgress) {
    const g = new THREE.Group();
    try {
      for (const k of Object.keys(CRIT)) g.add(buildCritter(k).root);
      for (const k of Object.keys(BOSS)) g.add(buildBoss(k).root);
      for (const k of ['nails', 'shells', 'candy', 'choco', 'upgrade', 'bombbag', 'bomb', 'nailgun', 'shotgun']) g.add(buildPickupModel(k).root);
      for (const k of ['nail', 'pellet', 'seed', 'fireball', 'yarn', 'chain', 'orb', 'goo', 'tar', 'bomb', 'hanger']) g.add(Projectiles.makeMesh({ kind: k, x: 0, y: -50, z: 0 }));
      // telegraphs, floor decals, the tapes' blob shadows and spilled tape: made and thrown away during play. These
      // stay alive (never disposed), so their programs do too: a boss attack or a splat doesn't recompile a shader
      g.add(Tele.warm || (Tele.warm = Tele.keep()));
      g.add(Decals.warm || (Decals.warm = Decals.keep()));
      g.add(blobShadow());
      TapeSpill.init(); g.add(new THREE.Mesh(TapeSpill.geos[0], TapeSpill.mat));
      // (hidden: compile() also prepares hidden objects, and the render loop doesn't draw them meanwhile)
      g.visible = false; Render.scene.add(g);
      const S = Render.scene, cam = Render.camera;
      const list = [...g.children].map((o) => ({ obj: o, target: S, cam, hdr: true }));
      // (the walls' see-through variants too: the first cutaway as you walk in no longer compiles them mid-step)
      list.push({ obj: S, cam, hdr: true, before: () => { for (const u of W.walls) W.fadeMats(u.mats, 0.5); }, after: () => { for (const u of W.walls) W.fadeMats(u.mats, 1); } });
      list.push({ obj: Render.overlayScene, cam: Render.overlayCam });
      await this.compileList(list, onProgress, 15000);
    } catch (e) { console.error(e); }
    Render.scene.remove(g);
  },

  // every shader of the house before its first frame (the window views, the title): all at once where the browser
  // compiles them side by side, else one material at a time with the counter moving between them
  compileHouse(onProgress) {
    const sc = Render.scene, cam = Render.camera;
    if (Render.renderer.extensions.has('KHR_parallel_shader_compile')) return this.compileList([{ obj: sc, cam, hdr: true }], onProgress);
    // (a mesh for each material and kind of mesh stands in for all the others like it)
    const one = new Map();
    sc.traverse((o) => {
      if (!(o.isMesh || o.isPoints || o.isLine || o.isSprite) || !o.material) return;
      for (const mt of [].concat(o.material)) {
        const k = mt.uuid + (o.isSkinnedMesh ? 's' : '') + (o.isInstancedMesh ? 'i' : '') + (o.geometry && o.geometry.attributes.color ? 'c' : '');
        if (!one.has(k)) one.set(k, o);
      }
    });
    return this.compileList([...new Set(one.values())].map((o) => ({ obj: o, target: sc, cam, hdr: true })), onProgress);
  },

  async boot() {
    const m = this.meter, r = Render.renderer;
    // the house goes up a piece at a time, the counter moving between them
    await Game.init(async (f) => { m.set('build', f); await letPaint(); });
    // (the procedural canvas textures of the house go up now too, not when a room first comes into view)
    for (const k in Tex.cache) { const t = Tex.cache[k]; if (t && t.isTexture) { try { r.initTexture(t); } catch (e) { /* on first use instead */ } } }
    const house = this.compileHouse((f) => m.set('shaders', f)).then(async () => {
      await letPaint();
      // the windows look out at the night: shoot the yard for them once
      W.bakeWindowViews();
      m.set('view', 0.6); await letPaint();
      try { Render.render(0); } catch (e) { console.error(e); }
      m.set('view', 1);
      this.houseReady = true;
    });
    // the haunts: up to the GPU and their shaders compiled once they're in, and photos found in earlier runs
    // developed (not when you first open the album). New Game waits for this (Game.whenLoaded)
    const lm = Assets.laterMeter;
    Promise.all([Assets.loadLater(), house]).then(() => Assets.upload(r, (f) => lm.set('gpu', f)))
      .then(() => this.warmShaders((f) => lm.set('shaders', f)))
      .then(() => Lost.prerender()).catch((e) => console.error(e))
      .then(() => { lm.set('photos', 1); Assets.laterDone = true; });
    // the start gate as soon as the house is up (and the fonts, for the captions)
    const fontsReady = (document.fonts && document.fonts.load) ? Promise.race([Promise.all(['40px "Permanent Marker"', '40px Creepster', '20px "Special Elite"', '20px VT323'].map((f) => document.fonts.load(f))), new Promise((res) => setTimeout(res, 2500))]) : Promise.resolve();
    Promise.all([fontsReady, house]).then(() => {
      // re-draw caption textures now that the marker font is (maybe) available
      for (const ph of Photos.list) { const c = ph.caption; const key = 'cap_' + ph.title; delete Tex.cache[key]; ph.caption = captionTexture(ph.title, ['heart', 'star', 'line', 'star', 'x'][ph.id]); void c; }
      const ld = UI.el.loading;
      const touch = Input.mode === 'touch';
      ld.innerHTML = '<div class="t">How You Haunt Me</div><div class="p">OCT. 31, 1996</div>' + (touch || TOUCH_DEV ? '<div class="p note">Best experienced on a computer. Touch controls work in landscape.</div>' : '') + `<button class="go" type="button">${touch ? 'TAP TO ENTER' : Input.mode === 'pad' ? 'PRESS A TO ENTER' : 'CLICK TO ENTER'}</button>`;
      const go = () => {
        if (G.state !== 'boot') return;
        Sfx.init();
        // (a phone: the whole screen, turned sideways, where the browser allows it)
        if (Input.mode === 'touch' && !SHOTS && FS.can()) FS.enter().catch(() => { });
        ld.style.transition = 'opacity .6s'; ld.style.opacity = '0';
        setTimeout(() => { ld.remove(); }, 650);
        G.state = 'title';
        Game.toTitle(true);
        window.removeEventListener('keydown', key);
      };
      const key = (e) => { if (e.code === 'Enter' || e.code === 'Space') go(); };
      ld.querySelector('.go').addEventListener('click', go);
      window.addEventListener('keydown', key);
      if (/[?&]autostart/.test(QS)) go();
    });
    this.last = performance.now();
    requestAnimationFrame((t) => this.frame(t));
    window.HYHM = { BOSS_PHOTO, SETTINGS, G, Game, Player, Photos, W, Cam, Render, Sfx, Waves, LEVELS, Input, UI, Seq, Boss, Critter, Assets, GLB, THREE, Pickups, Projectiles, Temp, Tex, TVSmash, Shells, Boogey, itemModel, debug: Debug, Lost, LOST_DEFS, WinShadows, Arcade, ArcadeScreen, FS, Main_tick: (dt) => Main.tick(dt, false), drs: Main.drs, drsTick: (ms) => Main.drsTick(ms) };
  },
  frame(now) {
    requestAnimationFrame((t) => this.frame(t));
    const rawMs = now - this.last;
    this.last = now;
    Game.frameMs = rawMs;
    this.frames++; this.fpsT += rawMs / 1000;
    if (this.fpsT > 0.5) { Game.fps = this.frames / this.fpsT; this.frames = 0; this.fpsT = 0; }
    this.drsTick(rawMs);
    // (a frame begun during a long blocking task can carry a timestamp older than `last`: never step back in time,
    // a negative dt makes every damp() diverge)
    UI.tick(clamp(rawMs / 1000, 0, 0.25));
    // (screenshot mode: the simulation only advances through Debug.ff, so captures are deterministic)
    this.tick(SHOTS ? 0 : clamp(rawMs / 1000, 0, 0.05), !SHOTS);
  },
  // Adaptive resolution: if the frame rate sags under ~52 fps during play, the scene renders a little smaller
  // (8 % steps, never below 75 %), and it climbs back when there is headroom again. A machine that keeps up never
  // leaves 100 %. Evaluated once a second, single hitches don't count.
  drs: { buf: [], t: 0, lvl: 0, cool: 0, probe: 6, wait: 6, probing: false, good: 0 },
  DRS_STEPS: [1, 0.92, 0.84, 0.75],
  drsReset() { const d = this.drs; d.buf.length = 0; d.t = 0; d.lvl = 0; d.cool = 0; d.probe = 6; d.wait = 6; d.probing = false; d.good = 0; Render.setDyn(1); },
  drsTick(ms) {
    const d = this.drs, steps = this.DRS_STEPS;
    if (SHOTS || SETTINGS.retro || NO_DRS) return;
    if (G.state !== 'play' || G.paused || UI.panelOpen || G.arcade || document.visibilityState !== 'visible' || !(ms > 0) || ms > 120) return;
    // (photo events re-render the photo live and the camera flies: their frames say nothing about play)
    if (Photos.mode !== 'off' || G.phase === 'event' || G.phase === 'bossIntro' || Cam.trans) return;
    d.buf.push(ms); d.t += ms / 1000;
    if (d.t < 1) return;
    // trimmed mean (the slowest 5 % dropped): with vsync a sagging frame rate shows up as a mix of 1x and 2x frames
    const s = d.buf.slice().sort((a, b) => a - b), n = Math.max(1, s.length - Math.max(1, Math.round(s.length * 0.05)));
    let avg = 0; for (let i = 0; i < n; i++) avg += s[i]; avg /= n;
    d.buf.length = 0; d.t = 0; d.cool--;
    if (avg > 19.2) {
      d.good = 0;
      if (d.cool <= 0 && d.lvl < steps.length - 1) {
        // (a step up that did not hold: wait twice as long before trying again)
        if (d.probing) d.wait = Math.min(64, d.wait * 2);
        d.probing = false;
        Render.setDyn(steps[++d.lvl]); d.cool = 2; d.probe = d.wait;
      }
    } else if (avg < 17.4) {
      if (++d.good >= 3 && d.probing) { d.probing = false; d.wait = Math.max(6, d.wait / 2); }
      if (d.lvl > 0 && --d.probe <= 0 && d.cool <= 0) { d.probing = true; d.good = 0; Render.setDyn(steps[--d.lvl]); d.cool = 2; d.probe = d.wait; }
    }
  },

  tick(realDt, doRender) {
    G.realTime += realDt;
    Input.update(realDt);
    // (the arcade machine is on: the house is a still picture under it, only a resize redraws it)
    if (G.arcade === 'on' && (this.stillFrames || 0) >= 4 && !Render.dirty) { Arcade.update(realDt); Input.endFrame(); return; }
    if (G.fastForward) UI.tick(realDt);
    if (G.slowmoT > 0) { G.slowmoT -= realDt; G.timeScale = G.slowmoT > 0 ? (G.slowmoScale || 0.35) : 1; }
    let dt = realDt * G.timeScale;
    if (G.hitStop > 0) { G.hitStop -= realDt; dt *= 0.05; }
    if (G.paused || UI.panelOpen || G.arcade) dt = 0;
    G.time += dt;
    try {
      Game.update(dt, realDt);
      if (G.state === 'play' && !G.paused) Photos.update(dt);
      Arcade.update(G.paused ? 0 : realDt);
      Cam.update(G.paused ? 0 : realDt);
      // (up in the attic at the end nothing outside can be seen: the roof, the sky and the yard rest)
      const shut = !!W.atticLive;
      W.roof.visible = Cam.isoWeight < 0.5 && !shut; W.moonG.visible = Cam.isoWeight < 0.5 && !shut;
      if (W.roomsPut !== shut) {
        // (only the hall shows, down the stairwell)
        W.roomsPut = shut; W.ext.visible = !shut;
        for (const k of ['kitchen', 'living', 'bedroom', 'basement', 'ext']) for (const m of W.staticMeshes[k] || []) m.visible = !shut;
      }
      if (W.titleTrees) {
        const out = Cam.isoWeight < 0.5 && !shut, title = G.state === 'title';
        W.titleTrees.visible = out; W.sky.visible = out; W.clouds.visible = out; W.spills.visible = out; W.hood.visible = out;
        const su = W.sky.material.uniforms; su.uHorizon.value.copy(Render.scene.fog.color); su.uFlash.value = W.lightning || 0;
        const cu = W.clouds.material.uniforms; cu.uTime.value = G.realTime; cu.uFlash.value = W.lightning || 0;
        // (the ground mist only on the title screen, and not on the lowest quality)
        const mist = title && SETTINGS.quality >= 1;
        for (const m of W.mist) { m.pl.visible = mist; if (mist) { m.tex.offset.x += m.sp[0] * realDt; m.tex.offset.y += m.sp[1] * realDt; } }
      }
      W.update(G.paused ? 0 : realDt, G.realTime);
      Lost.update(G.paused ? 0 : realDt, G.realTime);
      WinShadows.update(G.paused ? 0 : realDt);
      Particles.update(dt); Chunks.update(dt); Decals.update(dt); Tele.update(dt); Temp.update(dt); FX.update(dt);
      // a paused game (pause menu, upgrade cards, game over, the end screen) is a still picture: after a few frames it
      // is no longer redrawn, the screen keeps showing the last one (a resize or a settings change draws it once more)
      const still = (G.state === 'play' && (G.paused || !!UI.panelOpen || G.arcade === 'on')) || G.state === 'ending' || G.state === 'boot';
      this.stillFrames = still ? (this.stillFrames || 0) + 1 : 0;
      // (nothing is drawn before the house's shaders are in: a frame then would compile them one by one, Main.boot)
      if (doRender && this.houseReady && (this.stillFrames < 4 || Render.dirty)) {
        Render.dirty = false;
        const info = Render.renderer.info;
        info.autoReset = false; info.reset();
        Render.render(realDt);
        Game.drawCalls = info.render.calls; Game.tris = info.render.triangles;
      }
    } catch (e) { console.error(e); }
    Input.endFrame();
  },
};

const Debug = {
  god() { G.godMode = !G.godMode; return G.godMode; },
  snap(dt = 1 / 60) {
    Cam.update(dt); W.update(dt, G.realTime);
    // (nothing renders during ff: redraw every shadow map that is in use)
    for (const l of [...W.pool.map((p) => p.light), Player.spot, W.moon]) if (l.castShadow && !l.shadow.parked) l.shadow.needsUpdate = true;
    if (Photos._dirty) { Photos._snapping = true; try { Photos.render(Photos._dirty, null); } finally { Photos._snapping = false; Photos._dirty = null; } }
    const info = Render.renderer.info, ar = info.autoReset;
    info.autoReset = false; info.reset();
    Render.render(dt);
    Game.drawCalls = info.render.calls; Game.tris = info.render.triangles; info.autoReset = ar;
    return Render.rw + 'x' + Render.rh;
  },
  // advance the simulation quickly without rendering (for automated tests)
  ff(sec, dt = 1 / 30) { G.fastForward = true; const n = Math.round(sec / dt); try { for (let i = 0; i < n; i++) Main.tick(dt, false); } finally { G.fastForward = false; } return { phase: G.phase, t: G.time.toFixed(1) }; },
  hold(code, sec) { Input.keys[code] = true; Input.pressed[code] = true; const r = this.ff(sec); Input.keys[code] = false; return r; },
  press(code) { Input.pressed[code] = true; Game.onKey(code); Main.tick(1 / 30, false); return G.phase; },
  // jump straight to a level's explore phase with sensible gear
  level(i, opts = {}) {
    Sfx.init();
    UI.hideTitleScreen();
    Game.resetRun();
    Player.hasFlashlight = true; Player.weapons.poker.owned = true;
    if (i >= 1) Player.give('nailgun');
    if (i >= 2) Player.give('shotgun');
    if (i >= 3) Player.give('bomb');
    Player.weapon = 'poker'; Player.updateWeaponModel();
    G.dread = 0.12 + i * 0.19;
    Game.checkpoint = { level: i, stage: opts.stage || 'explore', player: Player.snapshot(), dread: G.dread, clock: LEVELS[i].clock, stats: Object.assign({}, G.stats) };
    Game.retryCheckpoint();
  },
  alignNow() { const ph = Photos.current; if (!ph) return; if (Photos.mode !== 'hold') Photos.enter(); Cam.trans = null; Cam.fp.pos.set(ph.camPos.x, 1.6, ph.camPos.z); Cam.fp.yaw = ph.yaw; Cam.fp.pitch = ph.pitch; Photos.raiseTarget = 1; Photos.raise = 1; Photos.mode = 'event'; Game.photoAligned(ph); },
  killAll() { for (const e of G.enemies) e.die('debug'); },
  winWave() { if (!G.wave) return; G.wave.aggro = true; G.wave.spawned = G.wave.quota; G.wave.killed = G.wave.quota; for (const e of G.enemies) e.remove(); G.enemies = []; },
  hurtBoss(f = 0.5) { for (const b of G.bosses) b.hurt(b.maxHp * f, 'debug'); },
  // straight into the wardrobe fight (level i's explore, standing in the bedroom)
  boogey(i = 1) {
    this.level(i);
    Player.pos.set(19.5, 0, 17.5); Cam.focus.copy(Player.pos); Cam.snap('iso');
    Photos.current.developed = 1;
    this.ff(0.2);
    Seq.run(Game.seqBoogeyman());
    return G.phase;
  },
  takeUpgrade() { for (const p of G.pickups) if (p.kind === 'upgrade') { Player.pos.set(p.x, 0, p.z); } },
  // every critter (or boss) in a row down the hall, posed at a fixed frame: for comparing renders
  lineup(bosses = false, t = 0.3) {
    const old = Render.scene.getObjectByName('lineup'); if (old) Render.scene.remove(old);
    const g = new THREE.Group(); g.name = 'lineup';
    (bosses ? Object.keys(BOSS) : Object.keys(CRIT)).forEach((k, i) => {
      const rig = bosses ? buildBoss(k) : buildCritter(k);
      rig.root.position.set(1.5 + i * (bosses ? 2.2 : 1.1), 0, bosses ? 19 : 17.5); rig.root.rotation.y = 0.5;
      if (rig.glb) poseRig(rig, k, 'Idle', t);
      g.add(rig.root);
    });
    Render.scene.add(g);
    return g.children.length;
  },
  // stand at the arcade machine in the bedroom (level i's explore); play: walk up to the screen and switch it on
  arcade(i = 0, play = true) {
    this.level(i);
    this.ff(1.5);
    Player.pos.set(21.9, 0, 13.75); Player.yaw = Math.PI; Cam.focus.copy(Player.pos); Cam.lookAhead.set(0, 0, 0); Cam.snap('iso');
    Player.control = true;
    this.ff(0.2);
    return play ? Arcade.start() : Arcade.canPlay();
  },
  // stage a fight for screenshots: level index, critter count, boss?
  stage(i, n = 6, boss = false, scary = true) {
    this.level(i);
    const lv = LEVELS[i], room = lv.arena, r = ROOMS[room];
    G.inBasement = room === 'basement';
    Player.pos.set((r.x0 + r.x1) / 2 - 2, 0, (r.z0 + r.z1) / 2 + 1);
    Cam.focus.copy(Player.pos); Cam.snap('iso');
    G.arena = room; W.setArenaDoors(room, false);
    Waves.start(lv, room); G.wave.aggro = scary; G.phase = 'wave';
    for (let k = 0; k < n; k++) { const p = Flow.randomFree(2.5); const type = lv.minion === 'devil' ? (k % 3 === 2 ? 'imp' : 'devil') : lv.minion; const c = new Critter(type, p.x, p.z, scary ? 'chase' : 'cute'); if (scary) c.setScary(true); G.enemies.push(c); G.wave.spawned++; }
    if (boss) { const b = new Boss(lv.boss, lv.bossAt[0], lv.bossAt[1]); G.bosses.push(b); G.wave.active = false; G.phase = 'boss'; UI.boss(BOSS[lv.boss].name, 1); }
    return { room, enemies: G.enemies.length };
  },
};

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => Main.start());
  else Main.start();
}

/* Disabled appended prototype: the complete game implementation is above.

import { createWorld, fitModel } from './rosie/roseblox.js';
import { buildHouse, loadGLB } from './house.js';

const container = document.getElementById('game-container');
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);
scene.fog = new THREE.FogExp2(0x050304, 0.07);
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.05, 60);
scene.add(camera);
const ambient = new THREE.HemisphereLight(0x556070, 0x150a05, 0.35);
scene.add(ambient);

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

// Flashlight
const flashlight = new THREE.SpotLight(0xfff2d0, 8, 18, 0.45, 0.5, 1.5);
flashlight.position.set(0.2, -0.15, 0);
camera.add(flashlight);
flashlight.target.position.set(0, 0, -1);
camera.add(flashlight.target);

// UI refs
const $ = id => document.getElementById(id);
const ui = {
    start: $('start'), pause: $('pause'), end: $('end'), endTitle: $('end-title'), endText: $('end-text'),
    hp: $('hp-fill'), bat: $('bat-fill'), objective: $('objective'), msg: $('msg'), hint: $('hint'),
    polaroid: $('polaroid'), caption: $('caption'), flash: $('flash'), red: $('red'),
};
const snapCanvas = $('snap');
const snapCtx = snapCanvas.getContext('2d');

// Audio
const music = new Audio('assets/audio/haunt-drone.mp3');
music.loop = true;
music.volume = 0.5;
const scream = new Audio('assets/audio/ghost-scream.mp3');
const shutter = new Audio('assets/audio/camera-shutter.mp3');
let muted = false;
let actx = null;
function play(a) {
    if (muted) return;
    a.currentTime = 0;
    a.play().catch(() => {});
}
function tone(freqA, freqB, dur, type = 'sawtooth', vol = 0.15) {
    if (!actx || muted) return;
    const o = actx.createOscillator();
    const g = actx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freqA, actx.currentTime);
    o.frequency.exponentialRampToValueAtTime(freqB, actx.currentTime + dur);
    g.gain.setValueAtTime(vol, actx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + dur);
    o.connect(g).connect(actx.destination);
    o.start();
    o.stop(actx.currentTime + dur);
}

// Polaroid spots
const spots = [
    { pos: new THREE.Vector3(-9, 1.6, -4), look: new THREE.Vector3(-14, 1, -9), room: 'Vihreä huone' },
    { pos: new THREE.Vector3(-2, 1.6, -3.5), look: new THREE.Vector3(2, 0.7, -8.5), room: 'Punainen sali' },
    { pos: new THREE.Vector3(9.5, 1.6, -6), look: new THREE.Vector3(13, 0.9, -2), room: 'Sininen kammio' },
    { pos: new THREE.Vector3(-10, 1.6, 4.5), look: new THREE.Vector3(-10, 0.9, 9.5), room: 'Takkahuone' },
    { pos: new THREE.Vector3(9.5, 1.6, 3.5), look: new THREE.Vector3(14.8, 1.5, 7), room: 'Kynttiläkammio' },
];
const waves = [
    { count: 3, speed: 1.5, hp: 1.0, size: 1.6, label: 'NE HERÄSIVÄT...', surprise: 'none' },
    { count: 5, speed: 2.2, hp: 0.8, size: 1.4, label: 'VALOT VÄLKKYVÄT!', surprise: 'flicker' },
    { count: 2, speed: 1.1, hp: 4.0, size: 2.8, label: 'JOKIN ISO LÄHESTYY', surprise: 'doll' },
    { count: 6, speed: 2.0, hp: 1.0, size: 1.5, label: 'SÄHKÖKATKO', surprise: 'blackout' },
    { count: 9, speed: 2.5, hp: 1.2, size: 1.5, label: 'TALO HUUTAA', surprise: 'blackout' },
];

const snapCam = new THREE.PerspectiveCamera(70, 1, 0.05, 60);
const RT = 256;
const rt = new THREE.WebGLRenderTarget(RT, RT);
const gammaLut = new Uint8Array(256);
for (let i = 0; i < 256; i++) {
    gammaLut[i] = Math.min(255, Math.round(255 * Math.pow(i / 255, 1 / 2.2) * 1.15));
}

let house;
let ghostTemplate = null;
const ghosts = [];
const pickups = [];
const state = {
    mode: 'explore', index: 0, hp: 100, battery: 100, beam: false,
    lightMode: 'none', msgTimer: 0, started: false, time: 0,
};

function renderSnapshot(spot) {
    snapCam.position.copy(spot.pos);
    snapCam.lookAt(spot.look);
    snapCam.updateMatrixWorld();
    const prevFlash = flashlight.visible;
    flashlight.visible = false;
    ghosts.forEach(g => (g.mesh.visible = false));
    const prevAmb = ambient.intensity;
    ambient.intensity = 0.9;
    house.lights.forEach(l => (l.light.intensity = l.base));
    renderer.setRenderTarget(rt);
    renderer.render(scene, snapCam);
    renderer.setRenderTarget(null);
    ambient.intensity = prevAmb;
    flashlight.visible = prevFlash;
    ghosts.forEach(g => (g.mesh.visible = true));
    const buf = new Uint8Array(RT * RT * 4);
    renderer.readRenderTargetPixels(rt, 0, 0, RT, RT, buf);
    const img = snapCtx.createImageData(RT, RT);
    for (let y = 0; y < RT; y++) {
        for (let x = 0; x < RT; x++) {
            const s = ((RT - 1 - y) * RT + x) * 4;
            const d = (y * RT + x) * 4;
            img.data[d] = gammaLut[buf[s]];
            img.data[d + 1] = gammaLut[buf[s + 1]];
            img.data[d + 2] = gammaLut[buf[s + 2]];
            img.data[d + 3] = 255;
        }
    }
    snapCtx.putImageData(img, 0, 0);
}

function showPolaroid() {
    const spot = spots[state.index];
    renderSnapshot(spot);
    ui.caption.textContent = `Kuva ${state.index + 1}/${spots.length}`;
    ui.polaroid.classList.remove('drop');
    void ui.polaroid.offsetWidth;
    ui.polaroid.classList.add('drop');
    ui.objective.textContent = 'Etsi paikka, josta Polaroid on otettu. Katso samaan suuntaan ja paina E.';
}

function message(text, time = 2.5) {
    ui.msg.textContent = text;
    ui.msg.style.opacity = 1;
    state.msgTimer = time;
}

function makeGhost(size) {
    let mesh;
    if (ghostTemplate) {
        mesh = fitModel(ghostTemplate.clone(true), { height: size });
        mesh.traverse(o => {
            if (o.isMesh) {
                o.material = o.material.clone();
                o.material.transparent = true;
                o.material.opacity = 0.85;
                o.material.emissive = new THREE.Color(0x3a8a80);
                o.material.emissiveIntensity = 0.6;
            }
        });
    } else {
        mesh = new THREE.Mesh(
            new THREE.SphereGeometry(size * 0.3, 16, 12),
            new THREE.MeshStandardMaterial({ color: 0xccffee, emissive: 0x3a8a80, transparent: true, opacity: 0.8 })
        );
    }
    const wrap = new THREE.Group();
    mesh.position.y -= size * 0.5;
    wrap.add(mesh);
    scene.add(wrap);
    return wrap;
}

function setGhostTint(g, color, intensity) {
    g.mesh.traverse(o => {
        if (o.isMesh && o.material.emissive) {
            o.material.emissive.setHex(color);
            o.material.emissiveIntensity = intensity;
        }
    });
}

function startWave() {
    const wave = waves[state.index];
    state.mode = 'wave';
    state.lightMode = wave.surprise === 'doll' ? 'flicker' : wave.surprise;
    play(scream);
    ui.red.style.opacity = 0.8;
    setTimeout(() => (ui.red.style.opacity = 0), 250);
    message(wave.label, 3);
    ui.objective.textContent = 'Selviä! Pidä hiiren vasenta pohjassa polttaaksesi kummitukset taskulampulla.';
    const p = player.position;
    for (let i = 0; i < wave.count; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = 7 + Math.random() * 5;
        const x = THREE.MathUtils.clamp(p.x + Math.cos(a) * r, -14, 14);
        const z = THREE.MathUtils.clamp(p.z + Math.sin(a) * r, -9, 9);
        const mesh = makeGhost(wave.size);
        mesh.position.set(x, 1.4, z);
        ghosts.push({ mesh, hp: wave.hp, speed: wave.speed * (0.85 + Math.random() * 0.3), phase: Math.random() * 6, hit: 0 });
    }
    if (wave.surprise === 'doll' && house.doll) {
        const f = player.forward;
        house.doll.position.set(p.x + f.x * 1.5, 0, p.z + f.z * 1.5);
        house.doll.lookAt(p.x, 0, p.z);
        message('NUKKE LIIKKUI... ' + wave.label, 3);
    }
}

function endWave() {
    state.lightMode = 'none';
    state.index++;
    if (state.index >= spots.length) {
        finishGame(true);
        return;
    }
    message('Hiljaista... toistaiseksi.', 2.5);
    spawnPickup();
    showPolaroid();
    state.mode = 'explore';
}

function spawnPickup() {
    const centers = [[-10, -5], [0, -5], [10, -5], [-10, 5], [0, 5], [10, 5]];
    const [x, z] = centers[Math.floor(Math.random() * centers.length)];
    const mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 0.35, 12),
        new THREE.MeshBasicMaterial({ color: 0xffe640 })
    );
    mesh.position.set(x + (Math.random() - 0.5) * 4, 0.6, z + (Math.random() - 0.5) * 4);
    const glow = new THREE.PointLight(0xffe640, 1.5, 3);
    mesh.add(glow);
    scene.add(mesh);
    pickups.push(mesh);
}

function finishGame(won) {
    state.mode = won ? 'won' : 'dead';
    player.pause();
    ui.endTitle.textContent = won ? 'TALO VAIKENI' : 'SINUSTA TULI YKSI HEISTÄ';
    ui.endText.textContent = won
        ? 'Löysit kaikki Polaroidien kuvauspaikat ja selvisit.'
        : `Löysit ${state.index}/${spots.length} kuvauspaikkaa.`;
    ui.end.style.display = 'flex';
    if (!won) {
        play(scream);
    }
}

function checkMatch() {
    if (state.mode !== 'explore') return false;
    const spot = spots[state.index];
    const p = player.position;
    const dist = Math.hypot(p.x - spot.pos.x, p.z - spot.pos.z);
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    const want = spot.look.clone().sub(camera.position).normalize();
    const dot = dir.dot(want);
    if (dist < 1.3 && dot > 0.88) {
        ui.hint.textContent = '📸 Tämä on se kohta! Paina E';
        ui.hint.style.opacity = 1;
        return true;
    }
    if (dist < 3) {
        ui.hint.textContent = 'Kuva tuntuu tutulta... lämpenee';
        ui.hint.style.opacity = 0.8;
    } else {
        ui.hint.style.opacity = 0;
    }
    return false;
}

function confirmPhoto() {
    if (!checkMatch()) return;
    play(shutter);
    ui.flash.style.opacity = 1;
    setTimeout(() => (ui.flash.style.opacity = 0), 120);
    ui.hint.style.opacity = 0;
    message(`${spots[state.index].room} löytyi...`, 1.5);
    setTimeout(startWave, 1200);
    state.mode = 'waiting';
}

function updateLights(dt) {
    const t = state.time;
    house.lights.forEach((l, i) => {
        let k = 1;
        if (Math.random() < 0.01) k = 0.3;
        if (state.lightMode === 'flicker') k = Math.random() < 0.25 ? 0 : 1;
        if (state.lightMode === 'blackout') k = 0;
        l.light.intensity = l.base * k * (0.9 + 0.1 * Math.sin(t * 7 + i));
        l.bulb.visible = k > 0.5;
    });
    ambient.intensity = state.lightMode === 'blackout' ? 0.05 : 0.35;
}

function update(dt) {
    state.time += dt;
    updateLights(dt);
    if (state.msgTimer > 0) {
        state.msgTimer -= dt;
        if (state.msgTimer <= 0) ui.msg.style.opacity = 0;
    }
    if (state.mode === 'explore') checkMatch();

    const beaming = state.beam && state.battery > 0;
    if (beaming) {
        state.battery = Math.max(0, state.battery - 14 * dt);
    } else {
        state.battery = Math.min(100, state.battery + 3 * dt);
    }
    flashlight.intensity = beaming ? 40 : 8;
    flashlight.angle = beaming ? 0.3 : 0.45;
    flashlight.color.setHex(beaming ? 0xd0f0ff : 0xfff2d0);

    const eye = camera.position;
    const fwd = new THREE.Vector3();
    camera.getWorldDirection(fwd);
    for (let i = ghosts.length - 1; i >= 0; i--) {
        const g = ghosts[i];
        const to = eye.clone().sub(g.mesh.position);
        const dist = to.length();
        to.normalize();
        const step = Math.min(dist - 0.6, g.speed * dt * (g.hit > 0 ? 0.3 : 1));
        if (step > 0) g.mesh.position.addScaledVector(to, step);
        g.phase += dt * 3;
        g.mesh.position.y = 1.3 + Math.sin(g.phase) * 0.2;
        g.mesh.lookAt(eye.x, g.mesh.position.y, eye.z);
        g.hit = Math.max(0, g.hit - dt);
        if (beaming && dist < 10 && fwd.dot(to.clone().negate()) > 0.94) {
            g.hp -= dt;
            g.hit = 0.15;
            setGhostTint(g, 0xffffff, 1.5);
            if (Math.random() < 0.1) tone(300 + Math.random() * 200, 120, 0.15, 'square', 0.04);
        } else if (g.hit <= 0) {
            setGhostTint(g, 0x3a8a80, 0.6);
        }
        if (g.hp <= 0) {
            scene.remove(g.mesh);
            ghosts.splice(i, 1);
            tone(900, 60, 0.6, 'sawtooth', 0.15);
            continue;
        }
        if (dist < 1.1) {
            state.hp -= 22 * dt;
            ui.red.style.opacity = 0.5;
        }
    }
    if (ghosts.length === 0 || state.hp > 0) {
        if (!ghosts.some(g => g.mesh.position.distanceTo(eye) < 1.1)) {
            ui.red.style.opacity = Math.max(0, parseFloat(ui.red.style.opacity || 0) - dt * 2);
        }
    }
    if (state.mode === 'wave' && ghosts.length === 0) endWave();

    for (let i = pickups.length - 1; i >= 0; i--) {
        const pk = pickups[i];
        pk.rotation.y += dt * 2;
        pk.position.y = 0.6 + Math.sin(state.time * 3) * 0.1;
        const p = player.position;
        if (Math.hypot(p.x - pk.position.x, p.z - pk.position.z) < 1) {
            scene.remove(pk);
            pickups.splice(i, 1);
            state.battery = Math.min(100, state.battery + 60);
            state.hp = Math.min(100, state.hp + 25);
            tone(500, 1200, 0.25, 'sine', 0.15);
            message('Paristo! +akku +terveys', 1.5);
        }
    }

    if (state.hp <= 0 && state.mode !== 'dead') {
        state.hp = 0;
        finishGame(false);
    }
    ui.hp.style.width = state.hp + '%';
    ui.bat.style.width = state.battery + '%';
}

// Boot
const world = await createWorld();
house = await buildHouse(scene, world);
const ghostGltf = await loadGLB('assets/models/ghost.glb');
if (ghostGltf) ghostTemplate = ghostGltf.scene;

const player = await world.addPlayer({
    camera, canvas: renderer.domElement, feet: [0, 0.1, 5], height: 1.7,
    view: 'first', speed: 3.5, runSpeed: 6, yaw: Math.PI,
});
scene.add(player.root);

renderer.render(scene, camera);
showPolaroid();
setTimeout(() => {
    if (state.mode === 'explore') renderSnapshot(spots[state.index]);
}, 2000);
for (let i = 0; i < 2; i++) spawnPickup();

ui.start.querySelector('button').addEventListener('click', () => {
    state.started = true;
    ui.start.style.display = 'none';
    actx = actx || new AudioContext();
    if (!muted) music.play().catch(() => {});
    player.start();
});
ui.pause.querySelector('button').addEventListener('click', () => player.start());
ui.end.querySelector('button').addEventListener('click', () => location.reload());

document.addEventListener('mousedown', e => {
    if (e.button === 0 && player.active) state.beam = true;
});
document.addEventListener('mouseup', e => {
    if (e.button === 0) state.beam = false;
});
document.addEventListener('keydown', e => {
    if (e.code === 'KeyE' && player.active) confirmPhoto();
    if (e.code === 'KeyQ') ui.polaroid.classList.toggle('big');
    if (e.code === 'KeyM') {
        muted = !muted;
        if (muted) music.pause();
        else if (state.started) music.play().catch(() => {});
    }
});

const timer = new THREE.Timer();
renderer.setAnimationLoop(time => {
    timer.update(time);
    const playing = player.active && (state.mode === 'explore' || state.mode === 'wave' || state.mode === 'waiting');
    ui.pause.style.display = state.started && !player.active && state.mode !== 'dead' && state.mode !== 'won' ? 'flex' : 'none';
    world.advance(Math.max(0, timer.getDelta()), {
        paused: !playing,
        afterStep: step => update(step),
    });
    renderer.render(scene, camera);
});
*/