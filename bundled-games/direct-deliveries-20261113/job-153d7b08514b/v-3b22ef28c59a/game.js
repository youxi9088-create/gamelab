/* =====================================================================
   SIR ROLLS-A-LOT  ·  Pumpkin Night at the Castle
   A Halloween survivors-style arena game made with three.js. Sir
   Rolls-A-Lot walks around a castle courtyard with a jack-o'-lantern tied
   to his ankle by a rubber band. Hold to charge a kick, swing it around,
   and pull it back for a return strike. Glowing rutabagas fill a meter:
   every third one calls a Rutabaga Jam (burning rutabagas rain down), and
   three from one kick call a Rutabagamageddon (a rutabaga meteor and the
   Rutabaga Champion fighting at Sir's side). Gravestones rise from the
   floor, power-ups glow in the courtyard and five bosses haunt the night
   (Headless Horseman, Spider Queen, King Rutabaga, Vampire Count, Grim
   Reaper).

   FILE MAP (search for the ===== headers)
     1. CONFIG ........ gameplay tuning (walking, physics, enemies, bosses, waves, power-ups, gravestones, upgrades)
     2. ASSETS ........ model / texture file names (swap for Rosebud URLs)
     3. TEXTS ......... all UI texts (English)
     4. THREE.JS ...... renderer look, floor geometry, sprite particles, loaders
     5+ GAME .......... audio, world, hero, pumpkin, input, enemies, pickups,
                        combat, gravestones and hazards, power-ups, bosses,
                        rutabaga events, director, UI, main loop

   three.js comes from the import map in index.html (version 0.186.1).

   GLB MODEL CONVENTIONS
     Characters face +Z. Animated parts are nodes named Body, Head, Jaw,
     ArmL, ArmR, LegL, LegR, Tail (+ Cape, Plume, WingL, WingR, Flame, Flag,
     Brew; spiders also LegL2..LegL4 and LegR2..LegR4, the horse LegL2 and
     LegR2 for its hind legs). The scarecrow's stake is Pole and the
     Headless Horseman's rider is Rider.
     Sir also has Eyes (blinking), EyesX (knocked out) and RopeAnchor.
     Gravestones have Crack and Crack2 nodes that appear as they take hits.
     A replacement model without these nodes still works: it is moved as
     one piece. Materials named "Stone" get the castle stone texture and
     materials named "Roof" the wooden shingle texture (roof_shingles.png).
   ===================================================================== */
import * as THREE from './_remote/a7c5af5a4f176f63/three.module.js';
import { GLTFLoader } from './_remote/c04ad9ca6e9813b1/GLTFLoader.js';

// =====================================================================
// 1. CONFIG
// All gameplay numbers live here. Distances are metres (world units),
// times are seconds, speeds are metres per second.
// =====================================================================
const CONFIG = {
  arena: {
    wallRadius: 17.6,      // centre line of the round castle wall
    floorRadius: 17.2,     // radius of the stone floor disc
    innerRadius: 16.6,     // pumpkin bounces off here
    spawnRadius: 15.0,     // enemies rise from the ground at this distance
    towerAngles: [22.5, -22.5, -67.5, -112.5, -157.5, 157.5], // degrees (0 = east, -90 = north gate)
  },
  camera: {
    fov: 38,               // vertical field of view (degrees)
    pitch: 60,             // degrees down from horizontal (90 = straight down)
    fitWide: 12.8,         // landscape: keep this radius visible
    fitTallX: 9.6,         // portrait: horizontal radius kept visible
    fitTallZ: 13.6,        // portrait: vertical radius kept visible
    mobileFit: 0.36,       // phones: tighter view so Sir and nearby enemies read clearly
    followMargin: 3.0,     // the camera follows Sir so he stays at least this far (m) inside the view
    followRate: 3.5,       // how quickly the camera catches up
  },
  hero: {
    maxHp: 100,
    damageTakenMult: 1.1,   // slightly harder hits; combined with denser waves for ~20% more challenge
    scale: 1.18,           // visual size of Sir
    radius: 0.72,          // body size for enemy contact
    hurtInvuln: 0.45,      // invulnerability after taking a hit
    regen: 0.6,            // health per second when not hurt for regenDelay seconds
    regenDelay: 5,
    attackWindup: 0.75,    // enemies wait this long after reaching Sir before the first hit
    // walking (WASD / arrow keys, or the touch stick)
    moveSpeed: 4.6,        // walking speed (m/s)
    moveAccel: 30,         // speeding up (m/s²)
    moveStop: 26,          // slowing down when no key is pressed (m/s²)
    aimMoveMult: 0.6,      // walking speed while aiming a kick
    bandDrag: 1.1,         // a fully stretched band tugs Sir towards the pumpkin (m/s)
    stepLength: 0.62,      // metres per footstep (dust puff and armour clank)
  },
  pumpkin: {
    radius: 0.55,
    restLength: 2.4,       // band starts stretching beyond this distance
    maxLength: 12.0,       // hard limit of the band (reach)
    stiffness: 4.6,        // band spring strength
    weakPull: 0.35,        // gentle pull towards Sir at all times
    bandDamping: 0.35,     // damping while stretched
    friction: 0.38,        // rolling resistance (per second)
    minKickSpeed: 9,       // a quick tap
    maxKickSpeed: 52,      // a fully charged kick (hold the button for gesture.chargeTime): it rockets to the end of the band
    chargeSlack: 0.85,     // the band goes slack for a charged kick on the way out (this fraction of its pull is gone) ...
    slackTime: 0.5,        // ... for this long after the kick, so the pumpkin keeps its speed to the end of the band
    chargeDamage: 0.5,     // a full charge hits this much harder (+50 %) for the whole flight
    chargePierce: 0.8,     // ... and loses this much less speed when it hits enemies
    flightTime: 1.25,      // seconds the band lets you steer a kick, then it tires and snaps the pumpkin home
    flightFade: 0.15,      // steering fades out over the last part of flightTime
    tiredReel: 26,         // speed of that snap back (m/s)
    maxSpeed: 56,
    kickCooldown: 0.3,     // after the pumpkin is back, the next kick has to wait this long (no machine-gun clicking)
    pullMinTime: 0.3,      // a pull back works only this long after the kick
    aimMinDrag: 0.45,      // touch: shorter drags cancel the kick
    yankImpulse: 10.5,     // sideways speed added by a yank
    pullSpeed: 20.0,       // speed of a pull back (return strike)
    catchRadius: 1.45,
    baseDamage: 24,        // damage at reference speed
    damageRefSpeed: 13,
    minDamageSpeed: 3.0,   // slower than this only pushes enemies
    returnDamageMult: 2.0, // return strike multiplier
    knockback: 1.0,
    catchShockRadius: 3.4, // power catch shockwave
    catchShockDamage: 18,
    // mouse steering: the flying pumpkin flies to the cursor
    steerAccel: 620,       // strongest sideways push that bends its path (m/s²): even a cannon shot turns sharply
    steerThrust: 210,      // it drives itself towards the cursor this hard when it is slower than wanted (m/s²)
    steerBrake: 420,       // ... and brakes this hard when it arrives (m/s²)
    steerMaxSpeed: 34,     // top speed it drives itself to (m/s) after a tap ...
    steerChargeSpeed: 12,  // ... and this much more after a fully charged kick
    steerDistGain: 8,      // wanted speed per metre left to the cursor (1/s): it slows down and parks on the cursor
    steerGain: 14,         // how tightly the speed follows the wanted speed (1/s)
    steerNear: 1.2,        // full steering from this distance out (gentler right next to Sir)
    steerHome: 1.4,        // the cursor this close to Sir means "come back": no steering, Sir catches it
    steerLead: 0.12,       // it aims this many seconds ahead of a moving cursor (s)
    reelSpeed: 7.5,        // a slow pumpkin inside the slack band is reeled in at this speed
  },
  gesture: {
    steerThreshold: 0.7,   // drag distance (m) before a yank or pull triggers
    steerCooldown: 0.16,   // seconds between repeated yanks in one press
    flickSpeedRef: 16,     // drag speed (m/s) that gives a normal strength yank
    mouseSteer: true,      // mouse only: moving the cursor steers the flying pumpkin
    clickPull: true,       // mouse only: a click while the pumpkin flies pulls it back
    chargeTime: 0.7,       // hold the button this long for a full-power kick (the cursor or drag only aims)
    joystickZone: 0.42,    // touch: a finger that lands on this left part of the screen walks Sir
    joystickRadius: 54,    // touch: stick radius in pixels
  },
  stumble: {
    yankWobble: 0.30,      // wobble added per yank (1.0 = stumble)
    pullWobble: 0.34,
    snapWobble: 0.55,      // band hitting its max length at full speed
    decay: 0.7,            // wobble recovery per second
    duration: 0.75,        // how long a stumble locks the controls
  },
  combo: {
    needed: 5,             // glowing rutabagas that fill the meter: the fifth one calls a Rutabaga Jam
    comboNeeded: 3,        // glowing rutabagas from ONE kick call a Rutabagamageddon (whatever the meter says)
    maxOnField: 3,
    spawnInterval: 4.2,
    lifetime: 20,
    minRadius: 4.0,
    maxRadius: 10.5,
    blastBossDamage: 0.2,  // fraction of boss max HP (the meteor blast of a Rutabagamageddon)
    trioChance: 0.4,       // chance that rutabagas spawn as an arc of three
    // Rutabaga Jam: burning rutabagas rain down for jamTime seconds
    jamTime: 5, jamEvery: 0.13, jamFall: 0.6, jamDamage: 24, jamRadius: 1.8, jamFireLife: 2.4, jamAim: 0.75,
    // Rutabagamageddon: a giant rutabaga meteor (the blast) and the Rutabaga Champion for mageddonTime seconds
    meteorFall: 1.1, mageddonTime: 10,
  },
  // the Rutabaga Champion: the friendly rutabaga knight of the Rutabagamageddon
  champion: {
    model: 'rutabaga_hero', scale: 1.0, radius: 0.85, speed: 6.2, turn: 10,
    slamRange: 2.3, slamRadius: 2.7, slamDamage: 75, slamWindup: 0.24, slamRecover: 0.42, slamEvery: 0.75, slamBoss: 0.04,
    poundEvery: 3.4, poundRadius: 4.4, poundDamage: 50, poundWindup: 0.4, poundRecover: 0.7, poundNeed: 3,
    knock: 15, push: 26, candy: 10,
  },
  night: {
    startHour: 22,         // clock starts at 22:00
    hours: 8,              // ends at dawn 06:00
    secondsPerHour: 60,    // 8 x 60 s = 8 minute night
  },
  xp: { base: 11, perLevel: 8, square: 0.9 },   // candy needed per level (about 30 % fewer level-ups than before)
  candy: {
    corn: { xp: 1, model: 'candy_corn' },
    wrapped: { xp: 3, model: 'candy_wrapped' },
    lolli: { xp: 10, model: 'lollipop' },
    apple: { heal: 20, model: 'candy_apple' },
    appleChance: 0.018,
    magnetDelay: 0.45,
    magnetAccel: 9,
    magnetMax: 15,
  },
  // Enemy types. hp/damage grow with the night (see waves.hpGrowth).
  enemies: {
    // Strength tiers: weak (skeleton, ghost, bat, spiderling) < normal < tough (zombie, werewolf, vampire) < tank (mummy)
    skeleton: { model: 'skeleton', hp: 20, speed: 2.05, radius: 0.42, mass: 1.0, damage: 3, attackRate: 0.9, drops: [['corn', 1]], score: 10, anim: 'walker', sound: 'bones' },
    zombie:   { model: 'zombie', hp: 62, speed: 1.2, radius: 0.5, mass: 2.3, damage: 6, attackRate: 1.15, drops: [['corn', 2]], score: 22, anim: 'shamble', sound: 'squelch' },
    ghost:    { model: 'ghost', hp: 14, speed: 2.7, radius: 0.45, mass: 0.6, damage: 2, attackRate: 0.8, drops: [['corn', 1]], score: 15, anim: 'float', sound: 'ghost', ghost: true },
    mummy:    { model: 'mummy', hp: 125, speed: 0.95, radius: 0.5, mass: 3.0, damage: 8, attackRate: 1.3, drops: [['wrapped', 1], ['corn', 2]], score: 35, anim: 'mummy', sound: 'groan' },
    pumpkin:  { model: 'evil_pumpkin', hp: 34, speed: 2.3, radius: 0.55, mass: 1.4, damage: 4, attackRate: 1.0, drops: [['wrapped', 1]], score: 20, anim: 'hop', sound: 'splat' },
    spider:   { model: 'spider', hp: 26, speed: 3.0, radius: 0.5, mass: 0.9, damage: 4, attackRate: 0.8, drops: [['corn', 2]], score: 25, anim: 'spider', sound: 'hiss' },
    rutabaga: { model: 'evil_rutabaga', hp: 44, speed: 1.65, radius: 0.55, mass: 1.6, damage: 6, attackRate: 1.25, drops: [['wrapped', 1], ['corn', 1]], score: 25, anim: 'root', sound: 'thunk', burrow: true, rutabagaDrop: 0.3 },
    witch:    { model: 'witch', hp: 38, speed: 3.4, radius: 0.55, mass: 1.0, damage: 0, attackRate: 9, drops: [['wrapped', 2]], score: 40, anim: 'witch', sound: 'cackle', flying: true },
    werewolf: { model: 'werewolf', hp: 88, speed: 3.2, radius: 0.55, mass: 2.0, damage: 9, attackRate: 1.0, drops: [['lolli', 1]], score: 45, anim: 'wolf', sound: 'growl' },
    ghoul:    { model: 'ghoul', hp: 30, speed: 3.6, radius: 0.48, mass: 0.9, damage: 4, attackRate: 0.8, drops: [['corn', 2]], score: 20, anim: 'ghoul', sound: 'snarl' },
    scarecrow: { model: 'living_scarecrow', hp: 60, speed: 3.3, radius: 0.5, mass: 1.3, damage: 6, attackRate: 0.95, drops: [['wrapped', 1], ['corn', 2]], score: 45, anim: 'scarecrow', sound: 'caw' },
    vampire:  { model: 'vampire', hp: 80, speed: 2.4, radius: 0.5, mass: 1.4, damage: 6, attackRate: 1.0, drops: [['lolli', 1]], score: 55, anim: 'vampire', sound: 'hissV' },
    banshee:  { model: 'banshee', hp: 46, speed: 2.1, radius: 0.5, mass: 1.0, damage: 3, attackRate: 1.2, drops: [['wrapped', 2]], score: 50, anim: 'banshee', sound: 'wail', ghost: true },
    bat:      { model: 'vampire_bat', hp: 9, speed: 5.0, radius: 0.36, mass: 0.35, damage: 2, attackRate: 0.9, drops: [['corn', 1]], score: 8, anim: 'bat', sound: 'squeak', flying: true, scale: 1.15 },
    egg:      { model: 'egg_sac', hp: 18, speed: 0, radius: 0.48, mass: 4, damage: 0, attackRate: 99, drops: [['corn', 1]], score: 15, anim: 'egg', sound: 'squelch' },
    spiderling: { model: 'spider', hp: 11, speed: 3.7, radius: 0.32, mass: 0.45, damage: 2, attackRate: 0.8, drops: [['corn', 1]], score: 8, anim: 'spider', sound: 'hiss', scale: 0.55 },
    // bosses (one at a time, see bosses.schedule)
    horseman: { model: 'headless_horseman', hp: 900, speed: 6.5, radius: 1.35, mass: 9, damage: 9, attackRate: 1.2, drops: [['lolli', 10]], score: 3000, anim: 'horse', sound: 'neigh', boss: true, nameKey: 'bossHorseman', scale: 1.1 },
    queen:    { model: 'spider_queen', hp: 1400, speed: 1.5, radius: 1.45, mass: 9, damage: 9, attackRate: 1.3, drops: [['lolli', 10]], score: 3000, anim: 'spider', sound: 'hiss', boss: true, nameKey: 'bossQueen' },
    king:     { model: 'king_rutabaga', hp: 1800, speed: 0.95, radius: 1.55, mass: 8, damage: 9, attackRate: 1.8, drops: [['lolli', 12]], score: 2500, anim: 'root', sound: 'thunk', boss: true, nameKey: 'bossName' },
    count:    { model: 'vampire_count', hp: 1450, speed: 2.0, radius: 0.85, mass: 7, damage: 10, attackRate: 1.1, drops: [['lolli', 12]], score: 3500, anim: 'vampire', sound: 'hissV', boss: true, nameKey: 'bossCount', scale: 1.5 },
    reaper:   { model: 'grim_reaper', hp: 1750, speed: 1.9, radius: 0.95, mass: 9, damage: 12, attackRate: 1.4, drops: [['lolli', 15]], score: 5000, anim: 'reaper', sound: 'toll', boss: true, nameKey: 'bossReaper', scale: 1.5 },
  },
  // The bosses arrive one by one (a boss that is due waits until the previous one is down)
  bosses: {
    schedule: [{ key: 'horseman', at: 120 }, { key: 'queen', at: 210 }, { key: 'king', at: 300 }, { key: 'count', at: 360 }, { key: 'reaper', at: 420 }],
    horseman: { rideRadius: 10.5, rideSpeed: 7.2, throwEvery: 3.8, bombFlight: 1.15, bombRadius: 2.0, bombDamage: 5, fireLife: 3.0, chargeEvery: 10, rear: 1.05, chargeSpeed: 15, chargeDamage: 10, trample: 5 },
    queen: { keep: 6, layEvery: 7.5, eggs: 2, hatch: 3.6, spitEvery: 4.6, spitShots: 3, leapEvery: 9.5, leapCrouch: 0.8, leapTime: 0.85, leapDamage: 12, leapRadius: 2.6 },
    count: { swarmEvery: 6.5, swarmSpeed: 10, drainEvery: 9.5, drainRange: 7.5, drainTime: 2.2, drainDamage: 3, drainTick: 0.3, summonEvery: 8.5, bats: 4, clawDamage: 12 },
    reaper: { sweepRange: 3.6, sweepRadius: 4.3, sweepArc: 2.4, sweepWindup: 0.75, sweepDamage: 16, blinkEvery: 7.5, harvestEvery: 11, harvest: 5, soulsEvery: 5.5, souls: 3, soulSpeed: 4.4, soulTurn: 1.6, soulDamage: 6, soulLife: 5.5 },
  },
  // Special moves of the newer enemies
  moves: {
    werewolf: { leapRange: 5.2, crouch: 0.55, leapTime: 0.55, recover: 0.9, cooldown: 2.4, leapDamage: 10, hitRadius: 1.4 },
    witch: { orbit: 7.0, height: 1.25, throwEvery: 4.4, potionFlight: 1.05, puddleRadius: 1.35, puddleLife: 5.5, puddleDamage: 3, puddleTick: 0.55 },
    spider: { shootRange: 8.5, keep: 5.5, shootEvery: 3.6, webSpeed: 10, pumpkinSlow: 2.0, heroSlow: 1.8, patchLife: 6, patchRadius: 1.15 },
    mummy: { unravelAt: 0.4, unravelSpeed: 1.45 },
    ghoul: { leapRange: 3.4, minRange: 1.4, crouch: 0.28, leapTime: 0.38, recover: 0.45, cooldown: 3.0, leapDamage: 4, hitRadius: 1.0, height: 0.7, fromGraves: 14 },
    scarecrow: { wakeRange: 4.6, wakeAfter: 26, sitHeight: 0.38 },
    vampire: { mistEvery: 5.5, mistMin: 4, mistMax: 11, swarmSpeed: 9, lifesteal: 10 },
    banshee: { keep: 6.0, screamEvery: 5.8, windup: 0.9, radius: 7.0, slow: 1.6, damage: 3, pushPumpkin: 9 },
    bat: { height: 1.25, bite: 2, away: 0.9 },
    egg: { hatch: 3.6, spiders: 3 },
    // special abilities of the basic enemies
    skeleton: { reviveChance: 0.3, reviveDelay: 1.4, reviveHp: 0.6,            // may rattle back together once
      throwerChance: 0.25, throwMin: 3.5, throwMax: 9.5, throwEvery: [5.5, 8], // some carry fire bottles...
      flight: 1.0, wallLength: 4.6, wallPieces: 6, wallLife: 4.5, flameR: 0.62 }, // ...that leave a wall of fire across Sir's path
    zombie: { grabSlow: 0.9 },                                                   // a bite grabs Sir: he walks slowly for a moment
    ghost: { rushRange: 6, rushTime: 0.8, rushSpeed: 2.3, rushEvery: [4, 6.5] }, // sudden spooky dash at Sir
    pumpkin: { blastRadius: 2.3, blastDamage: 18, blastHero: 3, heroRadius: 1.5 }, // bursts when smashed, hurting nearby enemies
  },
  enemyScale: 1.375, // size of the normal enemies (1.25 x 1.1)
  bossScale: 1.1,    // size multiplier for the bosses
  enemyBright: 1.18, // colour boost for the enemies (1 = model colours as-is)
  waves: {
    pressureMult: 1.1,     // 10% denser waves; combines with 10% harder hits for about 20% more difficulty
    hpGrowth: 0.16,        // +16 % enemy health per night hour
    eliteChanceMax: 0.13,  // elites (big, tough, lollipop drop) by the end of the night
    // one entry per hour: spawns per second, max enemies alive, type weights
    hours: [
      { rate: 0.5, max: 13, mix: { skeleton: 0.88, scarecrow: 0.12 } },
      { rate: 0.69, max: 19, mix: { skeleton: 0.52, zombie: 0.3, ghoul: 0.12, scarecrow: 0.06 } },
      { rate: 0.9, max: 25, mix: { skeleton: 0.34, zombie: 0.2, ghost: 0.18, mummy: 0.1, ghoul: 0.1, banshee: 0.08 }, event: 'midnight' },
      { rate: 1.06, max: 30, mix: { skeleton: 0.22, zombie: 0.14, ghost: 0.12, mummy: 0.08, pumpkin: 0.14, spider: 0.1, ghoul: 0.1, banshee: 0.05, scarecrow: 0.05 } },
      { rate: 1.23, max: 36, mix: { skeleton: 0.18, zombie: 0.12, ghost: 0.1, mummy: 0.08, pumpkin: 0.1, spider: 0.08, rutabaga: 0.13, ghoul: 0.08, vampire: 0.08, banshee: 0.05 } },
      { rate: 0.84, max: 29, mix: { skeleton: 0.26, zombie: 0.12, ghost: 0.14, pumpkin: 0.1, rutabaga: 0.12, witch: 0.12, vampire: 0.07, ghoul: 0.07 }, event: 'boss' },
      { rate: 1.34, max: 40, mix: { skeleton: 0.18, zombie: 0.12, ghost: 0.1, mummy: 0.08, pumpkin: 0.1, spider: 0.08, rutabaga: 0.08, witch: 0.04, werewolf: 0.08, vampire: 0.07, ghoul: 0.07 }, event: 'moon' },
      { rate: 1.62, max: 49, mix: { skeleton: 0.17, zombie: 0.12, ghost: 0.1, mummy: 0.08, pumpkin: 0.1, spider: 0.08, rutabaga: 0.09, witch: 0.05, werewolf: 0.07, vampire: 0.06, ghoul: 0.06, banshee: 0.04, scarecrow: 0.03 }, event: 'final' },
    ],
    limits: { witch: 3, werewolf: 4, spider: 6, mummy: 6, vampire: 3, banshee: 2, scarecrow: 3, ghoul: 8, bat: 14, egg: 9, spiderling: 14 }, // most of these alive at once
    packChance: 0.18,      // chance that a spawn is a pack from one direction
    ringEvery: 70,         // seconds between "ring" spawns all around the courtyard
    safeDistance: 7,       // enemies never appear closer to Sir than this
  },
  // Castle themes: after every boss the courtyard is swept clean and the castle changes its look
  // (tints of the stone, roofs, floor and grass; torch, moon, fog and sky colours; a new set of
  // decorations; an ambient effect). Theme i is used after the i:th boss, theme 0 at the start.
  themes: [
    { key: 'pumpkin', props: 'pumpkin', ambient: 'leaves', stone: 0xffffff, roof: 0xffffff, floor: 0xc4c0c8, ground: 0xffffff, torch: 0xff8a3a, glow: [1, 0.45, 0.12], lantern: [1, 0.55, 0.15], moon: 0xa8b8ff, hemi: 0x1c1c52, fog: 0x120a1e, bg: 0x0b0714, wisp: [[0.55, 0.5, 0.85], [0.45, 0.65, 0.75]], firefly: [0.6, 1, 0.35], flash: '#fff3d0' },
    { key: 'haunted', props: 'haunted', ambient: 'mist', stone: 0x9cc69c, roof: 0x7a9a80, floor: 0x9cb8a0, ground: 0xa8cca4, torch: 0x6aff5a, glow: [0.35, 1, 0.3], lantern: [0.5, 1, 0.4], moon: 0x9ad8b0, hemi: 0x143c2a, fog: 0x0c1c12, bg: 0x060e08, wisp: [[0.4, 0.9, 0.5], [0.3, 0.7, 0.45]], firefly: [0.5, 1, 0.5], flash: '#c8ffd8' },
    { key: 'spider', props: 'spider', ambient: 'webs', stone: 0xbca8d0, roof: 0x5a4a70, floor: 0xa494b4, ground: 0x8a7aa0, torch: 0xb860ff, glow: [0.7, 0.35, 1], lantern: [0.8, 0.45, 1], moon: 0xc8a0ff, hemi: 0x2c1c52, fog: 0x160a24, bg: 0x0c0616, wisp: [[0.7, 0.45, 0.95], [0.55, 0.35, 0.8]], firefly: [0.85, 0.5, 1], flash: '#e0c8ff' },
    { key: 'blood', props: 'blood', ambient: 'blood', stone: 0xd89898, roof: 0x7a3030, floor: 0xbc8888, ground: 0x8a5a50, torch: 0xff3030, glow: [1, 0.2, 0.12], lantern: [1, 0.3, 0.2], moon: 0xff7060, hemi: 0x3c1420, fog: 0x240a0e, bg: 0x160408, wisp: [[0.9, 0.3, 0.3], [0.7, 0.25, 0.35]], firefly: [1, 0.35, 0.3], flash: '#ffc0c0' },
    { key: 'frost', props: 'frost', ambient: 'snow', stone: 0xd4e8ff, roof: 0xf4f8ff, floor: 0xe4eeff, ground: 0xecf2ff, torch: 0x60c0ff, glow: [0.35, 0.7, 1], lantern: [0.5, 0.8, 1], moon: 0xe0ecff, hemi: 0x2c3c5c, fog: 0x1c2838, bg: 0x0e1622, wisp: [[0.8, 0.9, 1], [0.6, 0.8, 1]], firefly: [0.7, 0.9, 1], flash: '#e8f4ff' },
    { key: 'inferno', props: 'inferno', ambient: 'embers', stone: 0x906860, roof: 0x4a2820, floor: 0x845a50, ground: 0x4e2c20, torch: 0xffa030, glow: [1, 0.5, 0.12], lantern: [1, 0.5, 0.15], moon: 0xffb080, hemi: 0x3c1c10, fog: 0x2a0e06, bg: 0x180804, wisp: [[0.9, 0.45, 0.2], [0.8, 0.3, 0.15]], firefly: [1, 0.6, 0.2], flash: '#ffd0a0' },
  ],
  themeBlend: 1.8,         // seconds the castle takes to change
  bossGrace: 5,            // seconds without new enemies after a boss falls
  // Power-ups: glowing objects that appear in the courtyard (and drop from elites and bosses).
  // Walk over one or hit it with the pumpkin. time = seconds the effect lasts (0 = instant).
  powerups: {
    firstAt: 40, every: [34, 50], maxOnField: 2, life: 18, pickRadius: 1.25,
    eliteDrop: 0.22, bossDrops: 2,
    types: {
      hellfire: { model: 'pu_hellfire', weight: 3, time: 12 },   // the pumpkin burns: harder hits and a trail of fire
      frost:    { model: 'pu_frost', weight: 3, time: 4.5 },     // freezes every enemy (bosses slow down)
      garlic:   { model: 'pu_garlic', weight: 2, time: 9 },      // Sir can't be hurt and a garlic aura pushes enemies away
      bats:     { model: 'vampire_bat', weight: 3, time: 12 },   // bats circle Sir and bite enemies
      mega:     { model: 'pu_mega', weight: 3, time: 12 },       // giant pumpkin
      bomb:     { model: 'pu_bomb', weight: 2, time: 0 },        // a big explosion where it is picked up
      bucket:   { model: 'pu_bucket', weight: 2, time: 0 },      // all candy flies to Sir, plus a candy shower
      triple:   { model: 'pu_triple', weight: 3, time: 12 },     // every kick fires two extra pumpkins in a spread
      ghost:    { model: 'pu_ghost', weight: 3, time: 10 },      // the pumpkin is a ghost: through everything, the band cuts
      lightning: { model: 'pu_lightning', weight: 3, time: 8 },  // lightning strikes enemies near the flying pumpkin
      fangs:    { model: 'pu_fangs', weight: 2, time: 10 },      // every hit heals Sir
      jam:      { model: 'glowing_rutabaga', weight: 0, time: 5, event: true },   // (rutabaga events: shown as chips, never on the field)
      mageddon: { model: 'rutabaga_hero', weight: 0, time: 10, event: true },
    },
    hellfireDamage: 1.6, megaSize: 1.6, megaDamage: 1.35, frostDamage: 1.5,
    garlicRadius: 2.4, garlicDamage: 7, batCount: 5, batDamage: 10, bombRadius: 6.5, bombDamage: 80, bucketCandy: 14,
    tripleSpread: 0.36, tripleDamage: 0.7, tripleReach: 12.5, tripleLife: 1.1,
    ghostDamage: 1.3, boltEvery: 0.42, boltRange: 6.5, boltJump: 3.6, boltChain: 4, boltDamage: 26, boltBoss: 0.012,
    fangsHeal: 0.12,
  },
  // Gravestones rise from the courtyard floor. They block the pumpkin, Sir
  // and walking enemies, and break after a few solid hits.
  graves: {
    firstAt: 45,           // seconds before the first gravestone rises
    every: 15,             // seconds between rises at the start of the night
    everyLate: 10,         // ... and at the end of the night
    max: [1, 2, 3, 3, 4, 3, 4, 5], // most standing at once, per night hour
    warn: 1.4,             // the ground cracks this long before a stone rises
    rise: 0.55,            // rising animation
    minFromSir: 3.2, minApart: 2.8, maxRadius: 13.6, minRadius: 2.5,
    hitSpeed: 5.0,         // slower pumpkins just bounce off without a hit
    bounce: 0.62,          // how much speed the pumpkin keeps when it bounces off
    score: 60,
    types: {
      tombstone: { model: 'tombstone', hits: 3, radius: 0.5, weight: 5, from: 0 },
      cross:     { model: 'grave_cross', hits: 4, radius: 0.45, weight: 3, from: 1 },
      obelisk:   { model: 'grave_obelisk', hits: 6, radius: 0.62, weight: 2, from: 3 },
    },
  },
  // Upgrades offered at level up. Effects are applied in computeStats().
  // icon: emoji used if there is no SVG icon #up-<id> in index.html, theme: card badge colour
  upgrades: [
    { id: 'giant',    icon: '🎃', max: 5, theme: 'purple' },
    { id: 'boot',     icon: '🥾', max: 5, theme: 'orange' },
    { id: 'long',     icon: '📏', max: 4, theme: 'blue' },
    { id: 'snappy',   icon: '〰️', max: 5, theme: 'blue' },
    { id: 'boomer',   icon: '↩️', max: 5, theme: 'blue' },
    { id: 'flame',    icon: '🔥', max: 5, theme: 'purple' },
    { id: 'spectral', icon: '👻', max: 5, theme: 'purple' },
    { id: 'seeds',    icon: '🌰', max: 5, theme: 'purple' },
    { id: 'armor',    icon: '🛡️', max: 5, theme: 'blue' },
    { id: 'steady',   icon: '🦵', max: 4, theme: 'orange' },
    { id: 'magnet',   icon: '🍬', max: 4, theme: 'gold' },
    { id: 'sense',    icon: '✨', max: 3, theme: 'gold' },
    { id: 'sweet',    icon: '🍭', max: 3, theme: 'pink' },
    { id: 'spikes',   icon: '🌵', max: 4, theme: 'purple' },
  ],
  quality: {
    maxPixelRatio: 2,
    mobilePixelRatio: 1.5,
    shadowMap: 2048,
    mobileShadowMap: 1024,
  },
};

// =====================================================================
// 2. ASSETS
// File names inside the assets folder. In Rosebud AI you can replace any
// entry with the full URL of an uploaded asset (https://...).
// Audio files in ASSETS.audio override matching synthesized SFX and provide
// looped title / gameplay / boss music (the procedural score remains a load fallback).
// =====================================================================
const ASSET_BASE = 'assets/';
const ASSETS = {
  models: {
    hero: 'sir_rolls_a_lot.glb',
    pumpkin_ball: 'pumpkin_ball.glb',
    skeleton: 'skeleton.glb',
    zombie: 'zombie.glb',
    ghost: 'ghost.glb',
    evil_pumpkin: 'evil_pumpkin.glb',
    evil_rutabaga: 'evil_rutabaga.glb',
    king_rutabaga: 'king_rutabaga.glb',
    mummy: 'mummy.glb',
    spider: 'spider.glb',
    witch: 'witch.glb',
    werewolf: 'werewolf.glb',
    potion: 'potion.glb',
    tombstone: 'tombstone.glb',
    grave_cross: 'grave_cross.glb',
    grave_obelisk: 'grave_obelisk.glb',
    glowing_rutabaga: 'glowing_rutabaga.glb',
    candy_corn: 'candy_corn.glb',
    candy_wrapped: 'candy_wrapped.glb',
    lollipop: 'lollipop.glb',
    candy_apple: 'candy_apple.glb',
    castle_wall: 'castle_wall.glb',
    castle_tower: 'castle_tower.glb',
    castle_gate: 'castle_gate.glb',
    wall_torch: 'wall_torch.glb',
    jack_o_lantern: 'jack_o_lantern.glb',
    pumpkin_plain: 'pumpkin_plain.glb',
    hay_bale: 'hay_bale.glb',
    gravestone: 'gravestone.glb',
    stone_cross: 'stone_cross.glb',
    cauldron: 'cauldron.glb',
    dead_tree: 'dead_tree.glb',
    scarecrow: 'scarecrow.glb',
    barrel: 'barrel.glb',
    candles: 'candles.glb',
    bone_pile: 'bone_pile.glb',
    iron_fence: 'iron_fence.glb',
    bat: 'bat.glb',
    ghoul: 'ghoul.glb',
    living_scarecrow: 'living_scarecrow.glb',
    vampire: 'vampire.glb',
    banshee: 'banshee.glb',
    vampire_bat: 'vampire_bat.glb',
    egg_sac: 'egg_sac.glb',
    headless_horseman: 'headless_horseman.glb',
    spider_queen: 'spider_queen.glb',
    vampire_count: 'vampire_count.glb',
    grim_reaper: 'grim_reaper.glb',
    pu_hellfire: 'pu_hellfire.glb',
    pu_frost: 'pu_frost.glb',
    pu_garlic: 'pu_garlic.glb',
    pu_mega: 'pu_mega.glb',
    pu_bomb: 'pu_bomb.glb',
    pu_bucket: 'pu_bucket.glb',
    pu_triple: 'pu_triple.glb',
    pu_ghost: 'pu_ghost.glb',
    pu_lightning: 'pu_lightning.glb',
    pu_fangs: 'pu_fangs.glb',
    rutabaga_hero: 'rutabaga_hero.glb',
  },
  textures: {
    floor: 'courtyard_floor.jpg',
    floorNormal: 'courtyard_floor_normal.jpg',
    stone: 'castle_stone.jpg',
    stoneNormal: 'castle_stone_normal.jpg',
    grass: 'ground_grass.jpg',
    roof: 'roof_shingles.png', // wooden shingles of the tower roofs (GLB material "Roof")
    roofNormal: 'roof_shingles_normal.jpg',
  },
  audio: {
    kick: 'pumpkin-kick.mp3',
    bonk: 'pumpkin-impact-candidate-5.mp3',
    candy: 'candy-collect-soft.mp3',
    power: 'powerup-awaken.mp3',
    bossArrival: 'boss-arrival.mp3',
    rumble: 'grave-rise.mp3',
    menuMusic: 'castle-title-loop.mp3',
    music: 'castle-night-loop.mp3',
    bossMusic: 'castle-boss-loop.mp3',
    ambienceWind: 'haunted-courtyard-wind.mp3',
    ambienceRaven: 'distant-raven-call.mp3',
    ambienceWhisper: 'spectral-whisper.mp3',
    ambienceClock: 'distant-clock-chime.mp3',
    ambienceLaugh: 'ghostly-laughter.mp3',
    ambienceRumble: 'tombstone-rumble.mp3',
    ambienceFootsteps: 'phantom-footsteps.mp3',
    ambienceBell: 'midnight-bell-toll.mp3',
    ambienceWitchlight: 'witchlight-sparkle.mp3',
  },
};
// Rosebud's asset picker can expose project media through public, immutable
// storage URLs even when the preview's /assets/<filename> route is not synced.
// Resolve known uploaded media directly so a missing local mirror cannot stall
// or degrade the game. Keep the relative fallback for assets added later.
const ASSET_CDN = {
  'sir_rolls_a_lot.glb': './_remote/82ad724b8ae03f28/34035df5-2c2b-4d34-934a-bf6dc61fb3dd.glb',
  'pumpkin_ball.glb': './_remote/27943acca1429867/e24ce334-b779-4aca-adac-f347b0d8d6e2.glb',
  'skeleton.glb': './_remote/8cee8a42f2dc121d/a64a2898-1145-462b-a59c-da69177b1281.glb',
  'zombie.glb': './_remote/1a0d22857afdd97b/c795d9b2-3298-46e4-849c-b23e39efd0c9.glb',
  'ghost.glb': './_remote/f01d5225837c17c5/5061f5d8-6242-4d3d-a3d0-a1162e0a7da4.glb',
  'evil_pumpkin.glb': './_remote/521cb5a74854e786/fd824c58-7190-47f7-8d01-0bc7fc8b4283.glb',
  'evil_rutabaga.glb': './_remote/b2534155dd259498/ec02c6ca-9ab3-4ef4-acf9-234a9783b304.glb',
  'king_rutabaga.glb': './_remote/70503355ddbebd74/b0b6fefe-f3a1-4d2d-95d5-cf17e23de012.glb',
  'mummy.glb': './_remote/4c22517c36c404d7/4a5cc48a-8c85-497f-8a3d-c9d86a079165.glb',
  'spider.glb': './_remote/7b4a4784bb25ed44/b43bcfef-706b-4ea7-a56d-a11bcf66ea05.glb',
  'witch.glb': './_remote/625a1fc6cd088388/a096d3ea-fa6e-4ff1-8e03-6053fb01a1bb.glb',
  'werewolf.glb': './_remote/f76767fac1e9239c/2fec0e13-1d81-48c7-bf31-3cba54466aa6.glb',
  'potion.glb': './_remote/d6a0771bb229000d/9651d3a1-4b61-43ca-b7bc-bec2a6a73e27.glb',
  'tombstone.glb': './_remote/c60ed394d226b191/237875c3-c491-4b2c-b559-1d78422c69ae.glb',
  'grave_cross.glb': './_remote/30595d09177db7d6/55c18154-7493-48b1-abee-423f345789ac.glb',
  'grave_obelisk.glb': './_remote/7c9dd5b79eab325a/201d824c-24f6-41d1-ae6a-48fc0c6d0309.glb',
  'glowing_rutabaga.glb': './_remote/af1a927876eaeff2/f506ceda-440f-4d64-bf58-93cbea929977.glb',
  'candy_corn.glb': './_remote/5359db7975a16039/3e16aa50-945f-4f6b-ac8c-6d10d5355689.glb',
  'candy_wrapped.glb': './_remote/505bbc602aa26e22/475afcd1-4aa9-4c7b-a0bd-b19a1e5a7762.glb',
  'lollipop.glb': './_remote/8de10458a284ef8b/3449deb2-fdb7-4202-a378-22910ea6d0a9.glb',
  'candy_apple.glb': './_remote/237f7a738b5053c0/b2cb4f88-dc28-42a0-b9a4-7984d6d593c1.glb',
  'castle_wall.glb': './_remote/67ff74556a1613f4/d8d551a5-6160-471c-92c0-22b8786589d0.glb',
  'castle_tower.glb': './_remote/f80028963d900d04/0285717f-c778-4de7-b1bd-43d420783456.glb',
  'castle_gate.glb': './_remote/f1d4cbdcdc8c4730/8351ab52-b2a9-4ab0-8d13-870cb758c55a.glb',
  'wall_torch.glb': './_remote/8bd6b726b0430574/79f115c3-80de-4985-b2f8-67bedadd1a5b.glb',
  'jack_o_lantern.glb': './_remote/ab6ffbcb395339ec/a9b90f8b-1ca5-4687-a199-627cf4c38435.glb',
  'pumpkin_plain.glb': './_remote/99c8c2b46344a797/0babe219-135a-4827-9081-d3669e36d460.glb',
  'hay_bale.glb': './_remote/fc46f27b0738c6fd/bc2d99e2-0622-4678-b14a-1ef709f3b9e5.glb',
  'gravestone.glb': './_remote/dba094ed5a19a95f/5a171c64-8eee-4175-b9f1-7553e5c8fae8.glb',
  'stone_cross.glb': './_remote/5e43e60a88c391e5/25c578c0-e6dc-448b-b386-7718cc28e2cc.glb',
  'cauldron.glb': './_remote/5e96b3e1d3724657/d7283384-1d48-48c8-b5f8-783de36ceb0c.glb',
  'dead_tree.glb': './_remote/97494e675d0c9494/d177ba39-ccdd-4458-b800-5bf30a606ae2.glb',
  'scarecrow.glb': './_remote/819725cd9a2e845f/be58166d-296f-430d-b8cd-0bd75f49bbde.glb',
  'barrel.glb': './_remote/f5d2378612b603bc/fbd64f98-4ffe-41ce-b4e8-d5cd297b428b.glb',
  'candles.glb': './_remote/e4c621b089a7d018/ee02efc0-2641-4801-a6b3-2d13dffb4c5b.glb',
  'bone_pile.glb': './_remote/93a6142352bde58e/cfed6df4-cf09-43b0-85ce-a43367198a94.glb',
  'iron_fence.glb': './_remote/b155a7f6f21e9f5e/32195f90-ea2d-459d-978f-c6175848acec.glb',
  'bat.glb': './_remote/2c7a724d6c005ecb/5a119dc7-c9d2-411d-a799-a45fd96fbff6.glb',
  'ghoul.glb': './_remote/a01a8656cfd051e5/00f2b095-fcd9-478b-ad6c-5e47764d8def.glb',
  'living_scarecrow.glb': './_remote/9492397e79edac35/0ef1bd16-2e9a-47c5-a353-2d71a1caf7a7.glb',
  'vampire.glb': './_remote/004cfa2548bb1e35/ab7fae5d-e34e-400b-9925-8ee78a91364a.glb',
  'banshee.glb': './_remote/e0fb658b2f31244d/3895fcc6-76d4-41ee-af8b-949fed7dc051.glb',
  'vampire_bat.glb': './_remote/ae6442b61bd937ca/158bfaa5-38e9-4be3-be6e-c9468b6e3d5b.glb',
  'egg_sac.glb': './_remote/c23e40a27106d787/cfc01756-7264-4f95-ab92-bfe2c650dcbc.glb',
  'headless_horseman.glb': './_remote/315975183286f071/ce8a9a60-1fd2-4748-8d28-44aacfcefe87.glb',
  'spider_queen.glb': './_remote/1ee39060c3b29362/2a85ea80-fbbb-4d7f-a6d6-2a6d66c4683e.glb',
  'vampire_count.glb': './_remote/0789ef3bef96357a/d48bd49f-e0cb-43bb-9e00-ae6ac3aaf415.glb',
  'grim_reaper.glb': './_remote/d28666e23ae37e5c/4321f324-0fb8-4241-95e9-488d411c587a.glb',
  'pu_hellfire.glb': './_remote/3d80cf7eeaf76128/760edca3-c1c9-4e20-97a1-b76bd773bf23.glb',
  'pu_frost.glb': './_remote/b1db23a1542e3a88/ad413953-0b8e-4308-bba2-8e8ff44e4f75.glb',
  'pu_garlic.glb': './_remote/1be0288a41ccec4d/28e83cdb-7037-4668-8f4a-dcc5a5ba32c4.glb',
  'pu_mega.glb': './_remote/98dc6c1bd68c0c63/fccc54ad-3c89-481b-b275-df0f0dcdc822.glb',
  'pu_bomb.glb': './_remote/a8f606bd430a82c2/49bf34ae-8967-4085-a392-0a51a939875e.glb',
  'pu_bucket.glb': './_remote/b065afeb12d83321/462a661d-8522-47c1-adf8-5d6af7c5c096.glb',
  'pu_triple.glb': './_remote/bac734c01a10c632/0fb756cf-82b1-42ec-84de-00c067af9f04.glb',
  'pu_ghost.glb': './_remote/c67d897e07413b61/bbe1e8c7-f70f-46e5-aa79-da6c1a20f207.glb',
  'pu_lightning.glb': './_remote/336f678bc4550e40/16ee2323-72ac-4497-98ac-790fbcaba934.glb',
  'pu_fangs.glb': './_remote/7dc4ad9ce8beebb3/eb4f342d-7ddb-473a-aa88-219156c3cdc7.glb',
  'rutabaga_hero.glb': './_remote/bd777e47d7a4a1f5/babbb58e-14e7-4bd5-ba68-93cc9fec8792.glb',
  'courtyard_floor.jpg': './_remote/bf2a9f66e65021aa/9ea28903-8ceb-4ea9-be82-a509cb8dc1b2.jpg',
  'courtyard_floor_normal.jpg': './_remote/41689e9c071a04de/25210d82-ff96-4541-b155-2e59f37edebd.jpg',
  'castle_stone.jpg': './_remote/ac85388d56bdf1b1/87098fe7-e19d-4d32-bf74-e1eafc569866.jpg',
  'castle_stone_normal.jpg': './_remote/2638e2c4b70ddc0c/c11774dc-7b19-493a-9c08-085ad456c291.jpg',
  'ground_grass.jpg': './_remote/12384bdaf21c1ea7/7d20f8a9-fc7e-430e-bf25-263ec1604bc6.jpg',
  'roof_shingles.png': './_remote/1b36367eee1cfddc/ec5efeb9-2b02-406a-8c1e-7d67e5a42dc7.png',
  'roof_shingles_normal.jpg': './_remote/23a093f99491f687/8eefd37f-02a1-4919-8387-fac5667c066f.jpg',
  'pumpkin-kick.mp3': './_runtime_resources/161ce537ada11f0f87431469.mp3',
  'pumpkin-impact.mp3': './assets/audio/cac42e8c-c334-440c-a889-5a5891c012e5.mp3',
  'pumpkin-impact-upgrade.mp3': './assets/audio/3121e448-518d-4f0b-adda-78f9e9bb9cb7.mp3',
  'pumpkin-impact-candidate-5.mp3': './_runtime_resources/a4c73b929ab9479d411ac755.mp3',
  'candy-collect-soft.mp3': './_runtime_resources/953e62805eb5b742c568db7c.mp3',
  'powerup-awaken.mp3': './_runtime_resources/9179937fe041ddbba347c296.mp3',
  'boss-arrival.mp3': './_runtime_resources/87be6c8644ff20ab680a66f3.mp3',
  'grave-rise.mp3': './_runtime_resources/c82e1c63e07355677b8fa06d.mp3',
  'haunted-courtyard-wind.mp3': './_runtime_resources/1e24fe153e6ce6bb7b9d7e55.mp3',
  'distant-raven-call.mp3': './_runtime_resources/1f3e4acb1be4ea849189bf8b.mp3',
  'spectral-whisper.mp3': './_runtime_resources/fbd6e6968fc7bc7eacf5988c.mp3',
  'distant-clock-chime.mp3': './_runtime_resources/4394002c1c25fe6ef7c2412f.mp3',
  'ghostly-laughter.mp3': './_runtime_resources/db31d0ded408da18d1f49488.mp3',
  'tombstone-rumble.mp3': './_runtime_resources/c47148f0d42e76a2db4e25f4.mp3',
  'phantom-footsteps.mp3': './_runtime_resources/925a04436a115da0c09e06d8.mp3',
  'midnight-bell-toll.mp3': './_runtime_resources/0b4e749ad9809c6cf37019eb.mp3',
  'witchlight-sparkle.mp3': './_runtime_resources/44e6b6c9960d5e9210718706.mp3',
  'castle-title-loop.mp3': './_runtime_resources/823e11f8de3daf3b1e97d1d1.mp3',
  'castle-night-loop.mp3': './_runtime_resources/361c37c4acc2d23ae0d20c7d.mp3',
  'castle-boss-loop.mp3': './_runtime_resources/270759c8dbdee51b2cdf1df3.mp3',
};
function assetURL(file) {
  if (Embedded[file]) return file; // GLB from the single-file pack
  const emb = window.SRAL_EMBEDDED;
  if (emb && emb[file]) return emb[file];
  if (/^(https?:|data:|blob:)/.test(file)) return file;
  return ASSET_CDN[file.split('/').pop()] || ASSET_BASE + file;
}

// =====================================================================
// 3. TEXTS: every word the player sees (English)
// =====================================================================
const TEXTS = {
  en: {
    subtitle: 'Pumpkin Night at the Castle',
    tagline: 'Survive until dawn. Walk, kick, swing and pull back.',
    play: 'Play',
    howto: 'How to play',
    credits: 'Credits',
    creditsTitle: 'Credits',
    back: 'Back',
    sound: 'Sound',
    on: 'on',
    off: 'off',
    best: 'Best',
    loading: 'Waking up the castle…',
    loadError: 'Loading failed',
    howtoTitle: 'How to play',
    gestureCol: 'Control',
    actionCol: 'Action',
    hk1: 'WASD or arrow keys',
    ak1: 'Walk around the courtyard. The pumpkin follows on its band.',
    hm1: 'Mouse: hold the button',
    am1: 'Aim at the cursor. The longer you hold, the harder the kick.',
    hm2: 'Mouse: let go',
    am2: 'Sir Rolls-A-Lot kicks the pumpkin towards the cursor.',
    hm3: 'Mouse: move the cursor while it flies',
    am3: 'The pumpkin flies to the cursor: move the mouse and it follows.',
    hm4: 'Mouse: click while it flies',
    am4: 'Pull the pumpkin back for a return strike. Keep holding to charge the next kick.',
    ht1: 'Left thumb on the left side',
    at1: 'Walk around the courtyard with the stick.',
    ht2: 'Right thumb: press and drag',
    at2: 'Drag to aim. The longer you hold, the harder the kick. Let go to kick.',
    ht3: 'Drag left or right while it flies',
    at3: 'Yank the rubber band sideways to curve the pumpkin.',
    ht4: 'Drag towards the knight',
    at4: 'Pull the pumpkin back hard. The return strike deals double damage.',
    tip1: 'Every 5 glowing rutabagas call a Rutabaga Jam: burning rutabagas rain on the enemy. Grab 3 in a single kick for a RUTABAGAMAGEDDON!',
    tip2: 'The pumpkin keeps its momentum. More speed means harder hits.',
    tip3: 'Gravestones rise from the ground. They block the pumpkin, and a few solid hits break them.',
    tip4: 'Watch out: werewolves leap, witches throw poison, spiders spit web, banshees shriek and vampires turn into bats.',
    tip5: 'Enemies drop candy. Candy is experience: fill the bar and pick an upgrade.',
    tip6: 'Survive the night, from 22:00 until dawn at 06:00.',
    tip7: 'Scarecrows only pretend to be decorations, and ghouls claw their way out of the gravestones.',
    tip8: 'Glowing objects are power-ups. Walk over one or hit it with the pumpkin.',
    tip9: 'Five bosses haunt the night: the Headless Horseman, the Spider Queen, King Rutabaga, the Vampire Count and the Grim Reaper.',
    level: 'Level',
    score: 'Score',
    kills: 'Kills',
    combo: 'Rutabaga combo',
    pause: 'Paused',
    resume: 'Resume',
    quit: 'Main menu',
    retry: 'Try again',
    menu: 'Menu',
    levelUp: 'Level up!',
    chooseUpgrade: 'Choose an upgrade',
    lvShort: 'level',
    newUpgrade: 'New',
    gameOver: 'Sir has fallen!',
    victory: 'Dawn breaks!',
    victorySub: 'Sir Rolls-A-Lot survived the pumpkin night.',
    lastedUntil: 'You lasted until {t}',
    statTime: 'Time',
    statKills: 'Kills',
    statBlasts: 'Rutabagamageddons',
    statJams: 'Rutabaga jams',
    statScore: 'Score',
    statBest: 'Best',
    newBest: 'New best!',
    hintStart: 'WASD walks. Hold the mouse button to charge a kick, let go to shoot!',
    hintStartTouch: 'Left thumb walks. Right thumb: drag to aim, hold to charge, let go!',
    hintRelease: 'Hold longer for a harder kick. Let go!',
    hintReleaseMouse: 'Hold longer for a harder kick. Let go!',
    hintMove: 'Walk with WASD or the arrow keys!',
    hintMoveTouch: 'Put your left thumb down to walk!',
    hintYank: 'Press again and drag sideways to yank!',
    hintPull: 'Drag towards Sir for a return strike!',
    hintSteerMouse: 'Move the mouse: the pumpkin flies to the cursor!',
    hintPullMouse: 'Click to pull the pumpkin back for a return strike!',
    hintCombo: 'Glowing rutabagas fill the meter: 5 = Rutabaga Jam, 3 in one kick = Rutabagamageddon!',
    midnight: 'Midnight!',
    midnightSub: 'Ghosts, mummies and banshees awaken',
    witching: 'Witching hour!',
    witchingSub: 'Witches take to the sky',
    bossName: 'King Rutabaga',
    bossHorseman: 'The Headless Horseman',
    bossQueen: 'The Spider Queen',
    bossCount: 'The Vampire Count',
    bossReaper: 'The Grim Reaper',
    bossArrive: {
      horseman: 'He rides at midnight!',
      queen: 'Something huge crawls in',
      king: 'King Rutabaga arrives!',
      count: 'The Count rises from the shadows',
      reaper: 'Death itself comes for Sir',
    },
    bossDown: '{n} is defeated!',
    castleChange: 'The castle changes!',
    themes: { pumpkin: 'Pumpkin Night at the Castle', haunted: 'The Haunted Moor', spider: "The Spider's Lair", blood: 'The Blood Court', frost: 'The Frozen Keep', inferno: 'The Infernal Bailey' },
    fullMoon: 'Full moon!',
    fullMoonSub: 'Werewolves on the prowl',
    gravesRise: 'The graves stir!',
    finalHour: 'Final hour!',
    finalSub: 'Hold on until dawn',
    hourPumpkins: 'Pumpkins and spiders creep in',
    hourRutabagas: 'Rutabagas and vampires rise',
    hourZombies: 'Zombies and ghouls crawl in',
    blast: 'Rutabaga blast!',
    jam: 'Rutabaga Jam!',
    jamSub: 'Burning rutabagas rain from the sky',
    mageddon: 'RUTABAGAMAGEDDON!',
    mageddonSub: 'The Rutabaga Champion fights for Sir',
    championGone: 'The Champion salutes and leaves',
    returnStrike: 'Return strike!',
    strike: 'Strike!',
    whoa: 'Whoa!',
    combo2: 'Double!',
    combo3: 'Triple!',
    comboN: '{n}x combo!',
    heal: '+{n} health',
    pops: ['BONK!', 'THWACK!', 'CLONK!', 'WHAM!', 'POW!'],
    splat: 'SPLAT!',
    pu: {
      hellfire: ['Hellfire', 'The pumpkin burns: harder hits and a trail of fire.'],
      frost: ['Frost', 'Every enemy freezes solid. Bosses slow down.'],
      garlic: ['Garlic', "Sir can't be hurt and the smell drives enemies away. Vampires hate it!"],
      bats: ['Bat Swarm', 'Bats circle Sir and bite anything that comes close.'],
      mega: ['Mega Pumpkin', 'A giant pumpkin with harder hits.'],
      bomb: ['Skull Bomb', 'Boom! Blasts everything nearby.'],
      bucket: ['Candy Bucket', 'All the candy flies to Sir, plus a shower of sweets.'],
      triple: ['Triple Pumpkin', 'Every kick fires two extra pumpkins!'],
      ghost: ['Ghost Pumpkin', 'The pumpkin is a ghost: it flies through everything and the band cuts.'],
      lightning: ['Lightning Storm', 'Lightning strikes the enemies around the flying pumpkin.'],
      fangs: ['Vampire Fangs', 'Every hit heals Sir.'],
      jam: ['Rutabaga Jam', 'Burning rutabagas rain from the sky for 5 seconds!'],
      mageddon: ['Rutabagamageddon', 'The Rutabaga Champion smashes enemies for 10 seconds!'],
    },
    up: {
      giant: ['Giant Pumpkin', 'The pumpkin grows: +15% size and damage.'],
      boot: ['Iron Boot', 'Harder kicks: +18% kick damage and speed.'],
      long: ['Longer Band', 'One metre more reach.'],
      snappy: ['Snappier Band', 'Faster returns and swings.'],
      boomer: ['Boomerang', 'Return strike +40% and a bigger catch shockwave.'],
      flame: ['Flaming Pumpkin', 'The pumpkin leaves a burning trail.'],
      spectral: ['Spectral Band', 'The rubber band itself hurts enemies.'],
      seeds: ['Seed Burst', 'Hard hits spray pumpkin seeds.'],
      armor: ['Thick Armour', '+20 max health and heal 30.'],
      steady: ['Steady Legs', 'Less stumbling, +12% yank power.'],
      magnet: ['Candy Magnet', 'Candy flies faster, +12% experience.'],
      sense: ['Rutabaga Sense', 'More glowing rutabagas, a stronger Rutabaga Jam.'],
      sweet: ['Sweet Tooth', 'Every 12th kill heals Sir.'],
      spikes: ['Spiked Rind', 'Less slowdown on hits, +10% damage.'],
      feast: ['Candy Feast', 'Heal 30 health and gain 200 points.'],
    },
  },
};

/* =====================================================================
   4. THREE.JS SETUP
   The renderer look (tone mapping, light falloff), geometry for the round
   courtyard floor, instanced sprite layers for particles and ground
   decals, a reflection map for shiny metal, and asset loaders.
   ===================================================================== */

// Tone mapping: a punchy ACES curve (used with renderer.toneMapping = THREE.CustomToneMapping)
THREE.ShaderChunk.tonemapping_pars_fragment = THREE.ShaderChunk.tonemapping_pars_fragment.replace(
  'vec3 CustomToneMapping( vec3 color ) { return color; }',
  'vec3 CustomToneMapping( vec3 color ) {\n' +
  '  color *= toneMappingExposure;\n' +
  '  return saturate( ( color * ( 2.51 * color + 0.03 ) ) / ( color * ( 2.43 * color + 0.59 ) + 0.14 ) );\n' +
  '}');
// Point lights: inverse square falloff that stays flat inside 1 metre, so the
// lantern light riding on the pumpkin does not burn a white spot into it.
THREE.ShaderChunk.lights_pars_begin = THREE.ShaderChunk.lights_pars_begin.replace(
  'max( pow( lightDistance, decayExponent ), 0.01 )', 'max( pow( lightDistance, decayExponent ), 1.0 )');

if (!THREE.ShaderChunk.tonemapping_pars_fragment.includes('2.51 * color') || !THREE.ShaderChunk.lights_pars_begin.includes('decayExponent ), 1.0 )')) {
  console.warn('Sir Rolls-A-Lot: a shader tweak was not applied. The game still runs but may look different with this three.js version.');
}

// three.js lights are physically based. Light values in this game are written
// as simple numbers times these factors (1.0 = the same brightness for every type).
const LIGHT = { ambient: Math.PI, sun: Math.PI, point: 4 * Math.PI };

// ------------------------------------------------------------------ math helpers
const _euler = new THREE.Euler();
// quaternion from XYZ euler angles (radians)
function quatFromEuler(q, x, y, z) { return q.setFromEuler(_euler.set(x, y, z)); }
// matrix = position * rotation around Y (yaw) * uniform scale
function composeYaw(m, px, py, pz, yaw, s = 1) {
  const c = Math.cos(yaw) * s, sn = Math.sin(yaw) * s;
  return m.set(c, 0, sn, px, 0, s, 0, py, -sn, 0, c, pz, 0, 0, 0, 1);
}

// ------------------------------------------------------------------ ground geometry
// Flat shapes lying on the ground (y = 0) facing up.
// uvFn(x, z) -> [u, v] and colFn(x, z) -> [r, g, b] (vertex colour) are optional.
function flatGeometry(pos, uv, col, idx) {
  const g = new THREE.BufferGeometry();
  const nrm = new Float32Array(pos.length); for (let i = 1; i < nrm.length; i += 3) nrm[i] = 1;
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.BufferAttribute(nrm, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  if (col) g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx);
  return g;
}
function discGeometry(radius, segs = 96, rings = 12, uvFn = null, colFn = null) {
  const pos = [0, 0, 0], uv = [...(uvFn ? uvFn(0, 0) : [0.5, 0.5])], idx = [], col = colFn ? [...colFn(0, 0)] : null;
  for (let r = 1; r <= rings; r++) {
    const rr = radius * r / rings;
    for (let s = 0; s < segs; s++) {
      const a = s / segs * Math.PI * 2, x = Math.cos(a) * rr, z = Math.sin(a) * rr;
      pos.push(x, 0, z); uv.push(...(uvFn ? uvFn(x, z) : [x / radius * 0.5 + 0.5, z / radius * 0.5 + 0.5]));
      if (col) col.push(...colFn(x, z));
    }
  }
  for (let s = 0; s < segs; s++) idx.push(0, 1 + (s + 1) % segs, 1 + s);
  for (let r = 1; r < rings; r++) {
    const a0 = 1 + (r - 1) * segs, b0 = 1 + r * segs;
    for (let s = 0; s < segs; s++) { const s1 = (s + 1) % segs; idx.push(a0 + s, a0 + s1, b0 + s, a0 + s1, b0 + s1, b0 + s); }
  }
  return flatGeometry(pos, uv, col, idx);
}
function ringGeometry(r0, r1, segs = 96, rings = 4, uvFn = null, colFn = null) {
  const pos = [], uv = [], idx = [], col = colFn ? [] : null;
  for (let r = 0; r <= rings; r++) {
    const rr = r0 + (r1 - r0) * r / rings;
    for (let s = 0; s <= segs; s++) {
      const a = s / segs * Math.PI * 2, x = Math.cos(a) * rr, z = Math.sin(a) * rr;
      pos.push(x, 0, z); uv.push(...(uvFn ? uvFn(x, z) : [x, z]));
      if (col) col.push(...colFn(x, z));
    }
  }
  for (let r = 0; r < rings; r++) for (let s = 0; s < segs; s++) {
    const a = r * (segs + 1) + s, b = a + 1, c = a + segs + 1, d = c + 1;
    idx.push(a, b, c, b, d, c);
  }
  return flatGeometry(pos, uv, col, idx);
}

// ------------------------------------------------------------------ sprite layers
// Thousands of particles in one draw call: each sprite is an instance of a
// quad that faces the camera (or lies flat on the ground for decals).
// The texture is an atlas of 4 x 6 cells, `frame` picks the cell.
const SPRITE_VERT = /* glsl */`
attribute vec4 aPosSize;   // xyz position, w size
attribute vec4 aColor;     // rgb tint, a alpha
attribute vec3 aRotFrame;  // rotation, atlas frame, horizontal stretch
uniform float uCols;
uniform float uRows;
uniform float uGround;
varying vec2 vUv;
varying vec4 vColor;
void main() {
  vec2 corner = position.xy;
  float c = cos(aRotFrame.x), s = sin(aRotFrame.x);
  vec2 k = vec2(corner.x * aRotFrame.z, corner.y);
  vec2 r = vec2(c * k.x - s * k.y, s * k.x + c * k.y) * aPosSize.w;
  vec3 right = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
  vec3 up = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);
  vec3 wp = aPosSize.xyz + (uGround > 0.5 ? vec3(r.x, 0.0, -r.y) : right * r.x + up * r.y);
  gl_Position = projectionMatrix * viewMatrix * vec4(wp, 1.0);
  float f = aRotFrame.y + 0.5;
  vec2 cell = vec2(floor(mod(f, uCols)), floor(f / uCols));
  vUv = (cell + vec2(corner.x + 0.5, 0.5 - corner.y)) / vec2(uCols, uRows);
  vColor = aColor;
}`;
const SPRITE_FRAG = /* glsl */`
uniform sampler2D uAtlas;
varying vec2 vUv;
varying vec4 vColor;
void main() {
  vec4 t = texture2D(uAtlas, vUv);
  float a = t.a * vColor.a;
  if (a < 0.003) discard;
  gl_FragColor = vec4(t.rgb * vColor.rgb, a);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

class SpriteLayer {
  // opts: atlas, cols, blending ('additive' | 'normal'), ground (bool), order (draw order), depthTest
  constructor(capacity, opts = {}) {
    this.capacity = capacity; this.count = 0;
    const geo = this.geometry = new THREE.InstancedBufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute([-0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0], 3));
    const attr = (n) => new THREE.InstancedBufferAttribute(new Float32Array(capacity * n), n).setUsage(THREE.DynamicDrawUsage);
    this.posSize = attr(4); this.colors = attr(4); this.rotFrame = attr(3);
    geo.setAttribute('aPosSize', this.posSize); geo.setAttribute('aColor', this.colors); geo.setAttribute('aRotFrame', this.rotFrame);
    geo.instanceCount = 0;
    this.material = new THREE.ShaderMaterial({
      uniforms: { uAtlas: { value: opts.atlas }, uCols: { value: opts.cols || 4 }, uRows: { value: opts.rows || opts.cols || 4 }, uGround: { value: opts.ground ? 1 : 0 } },
      vertexShader: SPRITE_VERT, fragmentShader: SPRITE_FRAG,
      transparent: true, depthWrite: false, depthTest: opts.depthTest !== false, side: THREE.DoubleSide,
      blending: opts.blending === 'normal' ? THREE.NormalBlending : THREE.AdditiveBlending,
    });
    this.mesh = new THREE.Mesh(geo, this.material);
    this.mesh.frustumCulled = false; this.mesh.visible = false;
    // negative orders draw before transparent models (ground decals), positive ones after
    const order = opts.order || 0;
    this.mesh.renderOrder = order < 0 ? order - 10 : order + 10;
  }
  clear() { this.count = 0; }
  push(x, y, z, size, r, g, b, a, rot = 0, frame = 0, stretch = 1) {
    if (this.count >= this.capacity) return;
    const i = this.count++, p = i * 4, q = i * 3;
    const ps = this.posSize.array, c = this.colors.array, rf = this.rotFrame.array;
    ps[p] = x; ps[p + 1] = y; ps[p + 2] = z; ps[p + 3] = size;
    c[p] = r; c[p + 1] = g; c[p + 2] = b; c[p + 3] = a;
    rf[q] = rot; rf[q + 1] = frame; rf[q + 2] = stretch;
  }
  // upload this frame's sprites (called right before rendering)
  flush() {
    const n = this.count;
    this.geometry.instanceCount = n; this.mesh.visible = n > 0;
    if (n === 0) return;
    this.upload(this.posSize, n * 4); this.upload(this.colors, n * 4); this.upload(this.rotFrame, n * 3);
  }
  upload(attr, len) { attr.clearUpdateRanges(); attr.addUpdateRange(0, len); attr.needsUpdate = true; }
}

// ------------------------------------------------------------------ metal reflections
// A soft sky/ground gradient that armour, gold and iron reflect.
function makeGradientEnv(renderer, sky, ground) {
  // 256 x 128 equirect -> 64 px cube faces (PMREM needs at least 16 px for its blur levels)
  const W = 256, H = 128, data = new Uint16Array(W * H * 4), half = THREE.DataUtils.toHalfFloat;
  for (let j = 0; j < H; j++) {
    const t = Math.sin(((j + 0.5) / H - 0.5) * Math.PI) * 0.5 + 0.5;
    const r = half(lerp(ground.r, sky.r, t)), g = half(lerp(ground.g, sky.g, t)), b = half(lerp(ground.b, sky.b, t)), one = half(1);
    for (let i = 0; i < W; i++) { const o = (j * W + i) * 4; data[o] = r; data[o + 1] = g; data[o + 2] = b; data[o + 3] = one; }
  }
  const tex = new THREE.DataTexture(data, W, H, THREE.RGBAFormat, THREE.HalfFloatType);
  tex.mapping = THREE.EquirectangularReflectionMapping; tex.magFilter = tex.minFilter = THREE.LinearFilter; tex.needsUpdate = true;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromEquirectangular(tex).texture;
  pmrem.dispose(); tex.dispose();
  return env;
}

// ------------------------------------------------------------------ loading
// Works with normal URLs and with base64 data: URLs (single-file build).
function dataURLToBytes(url) {
  const comma = url.indexOf(','), meta = url.slice(0, comma);
  if (!/;base64/i.test(meta)) return new TextEncoder().encode(decodeURIComponent(url.slice(comma + 1)));
  const bin = atob(url.slice(comma + 1)), out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
async function loadBytes(url) {
  if (url.startsWith('data:')) return dataURLToBytes(url);
  const res = await fetch(url);
  if (!res.ok) throw new Error('HTTP ' + res.status + ' for ' + url);
  return new Uint8Array(await res.arrayBuffer());
}
// The single-file build packs every GLB into one gzip blob (window.SRAL_PACK):
// unpackEmbedded() inflates it once at start-up into Embedded (file name -> bytes).
const Embedded = {};
async function unpackEmbedded() {
  const pack = window.SRAL_PACK; if (!pack) return;
  const gz = dataURLToBytes('data:application/gzip;base64,' + pack.data);
  const stream = new Blob([gz]).stream().pipeThrough(new DecompressionStream('gzip'));
  const all = new Uint8Array(await new Response(stream).arrayBuffer());
  for (const [name, off, len] of pack.index) Embedded[name] = all.subarray(off, off + len);
  window.SRAL_PACK = null;
}
const gltfLoader = new GLTFLoader();
async function loadGLTF(url) {
  if (Embedded[url]) { const b = Embedded[url]; return gltfLoader.parseAsync(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength), ''); }
  if (url.startsWith('data:')) {
    const b = dataURLToBytes(url);
    return gltfLoader.parseAsync(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength), '');
  }
  return gltfLoader.loadAsync(url);
}
const textureLoader = new THREE.TextureLoader();
async function loadTexture(url, srgb = true) {
  const tex = await textureLoader.loadAsync(url);
  tex.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.flipY = false; // UVs in this game use the glTF convention (v grows downwards in the image)
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

// =====================================================================
// 5. GAME: shared state and helpers
// =====================================================================
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const rand = (a = 0, b = 1) => a + Math.random() * (b - a);
const randi = (a, b) => Math.floor(rand(a, b + 1));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const smooth = (t) => t * t * (3 - 2 * t);
const easeOutBack = (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const damp = (current, target, rate, dt) => lerp(current, target, 1 - Math.exp(-rate * dt));
const angleLerp = (a, b, t) => { let d = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI; if (d < -Math.PI) d += Math.PI * 2; return a + d * t; };
const TAU = Math.PI * 2;

const store = {
  get(key, def) { try { const v = localStorage.getItem('sral_' + key); return v === null ? def : JSON.parse(v); } catch (e) { return def; } },
  set(key, val) { try { localStorage.setItem('sral_' + key, JSON.stringify(val)); } catch (e) { /* storage blocked */ } },
};

// The whole game state lives here.
const G = {
  state: 'loading',
  lang: 'en', // all texts are in English (see TEXTS)
  sound: store.get('sound', true),
  time: 0, realTime: 0, timeScale: 1, slowmo: 0, hitstop: 0,
  hp: 100, maxHp: 100, invuln: 0,
  score: 0, kills: 0, blasts: 0, level: 1, xp: 0, xpNext: 10,
  chain: 0, kickKills: 0, kicks: 0,
  upgrades: {}, stats: null,
  pendingLevels: 0,
  shake: 0, flash: 0,
  tutorial: { kicked: false, yanked: false, pulled: false, comboShown: false, done: store.get('tutorialDone', false) },
  best: store.get('best', { score: 0, time: 0 }),
  mobile: matchMedia('(pointer: coarse)').matches || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent),
  debug: { fps: 0 },
};

function t(key, vars) {
  let s = (TEXTS[G.lang] && TEXTS[G.lang][key]) ?? TEXTS.en[key] ?? key;
  if (vars && typeof s === 'string') for (const k in vars) s = s.replace('{' + k + '}', vars[k]);
  return s;
}

function clockText(seconds) {
  const C = CONFIG.night;
  const hoursF = seconds / C.secondsPerHour;
  let h = C.startHour + Math.floor(hoursF);
  const m = Math.floor((hoursF % 1) * 60);
  h = h % 24;
  return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
}

// Uniform spatial hash for enemy neighbourhood queries
class SpatialGrid {
  constructor(cell = 2) { this.cell = cell; this.map = new Map(); }
  clear() { for (const b of this.map.values()) b.length = 0; }
  key(ix, iz) { return (ix + 512) * 4096 + (iz + 512); }
  insert(obj, x, z) {
    const k = this.key(Math.floor(x / this.cell), Math.floor(z / this.cell));
    let b = this.map.get(k); if (!b) { b = []; this.map.set(k, b); } b.push(obj);
  }
  query(x, z, r, out) {
    out.length = 0;
    const c = this.cell, x0 = Math.floor((x - r) / c), x1 = Math.floor((x + r) / c), z0 = Math.floor((z - r) / c), z1 = Math.floor((z + r) / c);
    for (let ix = x0; ix <= x1; ix++) for (let iz = z0; iz <= z1; iz++) {
      const b = this.map.get(this.key(ix, iz)); if (b) for (let i = 0; i < b.length; i++) out.push(b[i]);
    }
    return out;
  }
}

// scratch objects (avoid allocations in hot loops)
const _v1 = new THREE.Vector3(), _v2 = new THREE.Vector3(), _v3 = new THREE.Vector3();
const _q1 = new THREE.Quaternion(), _q2 = new THREE.Quaternion();
const _m1 = new THREE.Matrix4(), _m2 = new THREE.Matrix4(), _m3 = new THREE.Matrix4();

// =====================================================================
// 6. AUDIO: loaded Halloween music / signature SFX, with synthesized fallback sounds.
// =====================================================================
const SFX = {
  ctx: null, master: null, sfxBus: null, musicBus: null, noise: null, last: {}, buffers: {},
  init() {
    if (this.ctx) { this.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    try { this.ctx = new AC(); } catch (e) { return; }
    const c = this.ctx;
    this.master = c.createGain(); this.master.gain.value = G.sound ? 0.9 : 0;
    const comp = c.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4; comp.attack.value = 0.004; comp.release.value = 0.2;
    this.master.connect(comp); comp.connect(c.destination);
    this.sfxBus = c.createGain(); this.sfxBus.gain.value = 0.75; this.sfxBus.connect(this.master);
    this.musicBus = c.createGain(); this.musicBus.gain.value = 0.3; this.musicBus.connect(this.master);
    const len = c.sampleRate; const buf = c.createBuffer(1, len, c.sampleRate); const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    this.noise = buf;
    for (const name in ASSETS.audio) this.loadFile(name, ASSETS.audio[name]);
    this.resume();
  },
  async loadFile(name, file) {
    try {
      const bytes = await loadBytes(assetURL(file));
      this.buffers[name] = await this.ctx.decodeAudioData(bytes.buffer.slice(0));
      if (name === 'menuMusic' || name === 'music' || name === 'bossMusic') MUSIC.syncTrack();
    } catch (e) { console.warn('audio file failed', name, e); }
  },
  resume() { if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().catch(() => {}); },
  setEnabled(on) { G.sound = on; store.set('sound', on); if (this.master) this.master.gain.setTargetAtTime(on ? 0.9 : 0, this.ctx.currentTime, 0.05); },
  duck(amount = 0.35, time = 1.2) {
    if (!this.ctx) return; const g = this.musicBus.gain, now = this.ctx.currentTime;
    g.cancelScheduledValues(now); g.setValueAtTime(g.value, now); g.linearRampToValueAtTime(0.3 * amount, now + 0.05); g.linearRampToValueAtTime(0.3, now + time);
  },
  // --- building blocks ---
  tone(type, f0, f1, t0, dur, vol, opts = {}) {
    const c = this.ctx; const o = c.createOscillator(); o.type = type;
    o.frequency.setValueAtTime(f0, t0);
    if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t0 + (opts.sweep || dur));
    let node = o;
    if (opts.vibrato) { const l = c.createOscillator(); const lg = c.createGain(); l.frequency.value = opts.vibrato; lg.gain.value = opts.vibDepth || f0 * 0.03; l.connect(lg); lg.connect(o.frequency); l.start(t0); l.stop(t0 + dur + 0.05); }
    if (opts.filter) { const f = c.createBiquadFilter(); f.type = opts.filter; f.frequency.value = opts.ff || 1000; f.Q.value = opts.q || 1; node.connect(f); node = f; }
    const g = c.createGain(); const a = opts.attack || 0.004;
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol), t0 + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    node.connect(g); g.connect(opts.dest || this.sfxBus);
    o.start(t0); o.stop(t0 + dur + 0.05);
    return o;
  },
  hiss(t0, dur, vol, type = 'bandpass', f0 = 1000, f1 = null, q = 1, dest = null, attack = 0.003) {
    const c = this.ctx; const s = c.createBufferSource(); s.buffer = this.noise; s.loop = true;
    const f = c.createBiquadFilter(); f.type = type; f.frequency.setValueAtTime(f0, t0); f.Q.value = q;
    if (f1) f.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t0 + dur);
    const g = c.createGain(); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol), t0 + attack); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    s.connect(f); f.connect(g); g.connect(dest || this.sfxBus);
    s.start(t0, Math.random() * 0.5); s.stop(t0 + dur + 0.05);
  },
  play(name, o = {}) {
    if (!this.ctx || !G.sound) return;
    const now = this.ctx.currentTime;
    const assetGap = name === 'bonk' ? 0.075 : name === 'candy' ? 0.22 : 0;
    const gap = Math.max(o.gap ?? 0.035, assetGap);
    if (this.last[name] && now - this.last[name] < gap) return;
    this.last[name] = now;
    if (this.buffers[name]) {
      const s = this.ctx.createBufferSource(); s.buffer = this.buffers[name];
      const rate = o.rate || (name === 'bonk' ? clamp(o.pitch || 1, 0.8, 1.25) : name === 'candy' ? 1 + (Math.min(4, o.n || 1) - 1) * 0.055 : 1);
      s.playbackRate.value = rate;
      const defaultVolume = name === 'kick' ? 0.72 + (o.power ?? 0.7) * 0.28 : name === 'candy' ? 0.36 : 1;
      const g = this.ctx.createGain(); g.gain.value = o.vol ?? defaultVolume; s.connect(g); g.connect(this.sfxBus); s.start(now); return;
    }
    const fn = this.lib[name]; if (fn) fn.call(this, now, o);
  },
  lib: {
    kick(t, o) { const p = o.power ?? 0.7; this.tone('sine', 150, 42, t, 0.22, 0.9 * (0.55 + p * 0.45)); this.hiss(t, 0.04, 0.35, 'bandpass', 1500, null, 1.2); this.hiss(t + 0.02, 0.28, 0.12 + p * 0.18, 'bandpass', 500, 2200, 2); },
    whoosh(t, o) { this.hiss(t, 0.25, 0.18 * (o.vol ?? 1), 'bandpass', 400, 1800, 3); },
    charge(t, o) { const p = o.pitch || 1; this.tone('triangle', 330 * p, 430 * p, t, 0.07, 0.06, { filter: 'lowpass', ff: 2400 }); },
    chargeFull(t, o) { this.tone('sine', 1320, null, t, 0.4, 0.14); this.tone('sine', 1980, null, t + 0.03, 0.32, 0.07); this.hiss(t, 0.25, 0.08, 'highpass', 5000, null, 1); },
    chargeKick(t, o) { this.tone('sine', 130, 36, t, 0.42, 0.85); this.tone('square', 90, 50, t, 0.18, 0.12, { filter: 'lowpass', ff: 700 }); this.hiss(t, 0.35, 0.4, 'bandpass', 1400, 220, 1); },
    reel(t, o) { this.tone('sawtooth', 320, 110, t, 0.3, 0.07, { filter: 'lowpass', ff: 1300 }); this.hiss(t, 0.26, 0.1, 'bandpass', 2000, 500, 3); },
    swing(t, o) { const v = o.vol ?? 1, p = o.pitch || 1; this.hiss(t, 0.26, 0.12 * v, 'bandpass', 380 * p, 1250 * p, 2.2, null, 0.06); this.tone('sine', 95 * p, 70 * p, t, 0.2, 0.05 * v, { attack: 0.05 }); },
    yank(t, o) { const s = o.strength ?? 1; this.tone('sine', 260, 150, t, 0.3, 0.32 * s, { vibrato: 26, vibDepth: 40 }); this.hiss(t, 0.18, 0.16 * s, 'bandpass', 700, 2600, 2.5); },
    pull(t, o) { this.tone('sawtooth', 110, 460, t, 0.32, 0.18, { filter: 'lowpass', ff: 1400, sweep: 0.25 }); this.tone('sine', 220, 140, t + 0.05, 0.35, 0.3, { vibrato: 18, vibDepth: 35 }); this.hiss(t, 0.3, 0.2, 'bandpass', 300, 2500, 2); },
    creak(t, o) { const v = clamp(o.vol || 1, 0.5, 1.2); this.tone('triangle', 340, 470, t, 0.16, 0.05 * v, { vibrato: 38, vibDepth: 45, filter: 'bandpass', ff: 900, q: 2 }); },
    twang(t, o) { this.tone('triangle', 92, 70, t, 0.4, 0.4 * (o.vol ?? 1), { vibrato: 9, vibDepth: 6 }); this.tone('sine', 184, 140, t, 0.25, 0.15); },
    bonk(t, o) { const v = o.vol ?? 1; this.tone('sine', 190 * (o.pitch || 1), 70, t, 0.14, 0.55 * v); this.hiss(t, 0.06, 0.25 * v, 'lowpass', 1100, 300, 0.7); },
    bones(t, o) { for (let i = 0; i < 4; i++) this.hiss(t + i * 0.028 + Math.random() * 0.01, 0.03, 0.22, 'bandpass', 2400 + Math.random() * 1800, null, 6); this.tone('square', 640, 520, t, 0.05, 0.08, { filter: 'lowpass', ff: 2000 }); },
    squelch(t, o) { this.hiss(t, 0.18, 0.35, 'lowpass', 600, 180, 3); this.tone('sine', 95, 60, t, 0.2, 0.3, { vibrato: 30, vibDepth: 20 }); },
    ghost(t, o) { this.tone('sine', 560, 280, t, 0.5, 0.14, { vibrato: 6, vibDepth: 25, attack: 0.05 }); this.hiss(t, 0.4, 0.07, 'highpass', 2500, null, 0.5, null, 0.05); },
    splat(t, o) { this.hiss(t, 0.2, 0.45, 'lowpass', 1600, 260, 1.5); this.tone('sine', 140, 55, t, 0.18, 0.4); },
    thunk(t, o) { this.tone('square', 170, 90, t, 0.12, 0.16, { filter: 'lowpass', ff: 900 }); this.hiss(t, 0.08, 0.3, 'lowpass', 700, 200, 1); },
    die(t, o) { this.tone('sine', 300, 80, t, 0.25, 0.25); },
    catch(t, o) { this.tone('sine', 120, 60, t, 0.12, 0.45); this.hiss(t, 0.05, 0.15, 'lowpass', 800, null, 1); },
    shock(t, o) { this.tone('sine', 90, 35, t, 0.5, 0.7); this.hiss(t, 0.5, 0.35, 'lowpass', 3000, 100, 0.8); },
    collect(t, o) {
      const n = o.n || 1; const base = [784, 988, 1175, 1568][Math.min(3, n - 1)];
      this.tone('triangle', base, base, t, 0.35, 0.28); this.tone('sine', base * 2, base * 2, t + 0.04, 0.3, 0.12); this.tone('sine', base * 1.5, base * 1.5, t + 0.08, 0.28, 0.08);
    },
    blast(t, o) {
      this.hiss(t, 1.8, 0.95, 'lowpass', 2600, 60, 0.7, null, 0.01); this.tone('sine', 80, 28, t, 1.4, 0.95, { sweep: 1.2 });
      for (const f of [293.7, 370, 440, 587.3]) this.tone('sawtooth', f, f, t + 0.15, 1.6, 0.05, { filter: 'lowpass', ff: 1800, attack: 0.08 });
      for (let i = 0; i < 8; i++) this.tone('sine', 1500 + Math.random() * 2000, null, t + 0.2 + i * 0.07, 0.25, 0.05);
    },
    candy(t, o) { const f = 1300 + Math.random() * 500; this.tone('sine', f, f * 1.3, t, 0.07, 0.12); },
    heal(t, o) { [660, 880, 1100, 1320].forEach((f, i) => this.tone('triangle', f, f, t + i * 0.06, 0.25, 0.14)); },
    hurt(t, o) { this.tone('sawtooth', 190, 105, t, 0.18, 0.2, { filter: 'bandpass', ff: 750, q: 3 }); this.hiss(t, 0.06, 0.25, 'bandpass', 3200, null, 4); this.tone('sine', 1480, 1400, t, 0.25, 0.06); },
    stumble(t, o) { this.tone('sine', 1300, 280, t, 0.6, 0.2, { vibrato: 7, vibDepth: 40, sweep: 0.55 }); },
    levelup(t, o) { [523, 659, 784, 1047, 1319].forEach((f, i) => this.tone('triangle', f, f, t + i * 0.07, 0.4, 0.2)); },
    select(t, o) { this.tone('square', 880, 1320, t, 0.08, 0.08, { filter: 'lowpass', ff: 2500 }); },
    click(t, o) { this.tone('square', 700, 700, t, 0.04, 0.05, { filter: 'lowpass', ff: 1800 }); },
    bell(t, o) {
      const n = o.tolls || 1;
      for (let k = 0; k < n; k++) { const s = t + k * 1.1; [1, 2.0, 2.76, 4.07, 5.4].forEach((m, i) => this.tone('sine', 196 * m, 196 * m, s, 2.6 / (1 + i * 0.5), 0.22 / (1 + i))); }
    },
    roar(t, o) { this.tone('sawtooth', 75, 52, t, 1.4, 0.35, { vibrato: 11, vibDepth: 12, filter: 'lowpass', ff: 700, attack: 0.1 }); this.hiss(t, 1.2, 0.3, 'lowpass', 500, 150, 2, null, 0.1); },
    slam(t, o) { this.tone('sine', 70, 30, t, 0.6, 0.8); this.hiss(t, 0.6, 0.5, 'lowpass', 900, 80, 1); },
    spawn(t, o) { this.hiss(t, 0.35, 0.08, 'lowpass', 300, 120, 1, null, 0.08); },
    seed(t, o) { this.tone('sine', 900 + Math.random() * 300, 700, t, 0.06, 0.07); },
    fire(t, o) { for (let i = 0; i < 3; i++) this.hiss(t + Math.random() * 0.1, 0.04, 0.08, 'bandpass', 1500 + Math.random() * 2000, null, 3); },
    // Sir's armoured footsteps: a soft thud and a tiny clank
    step(t, o) { const p = o.side > 0 ? 1.06 : 0.94; this.tone('sine', 120 * p, 70, t, 0.08, 0.16); this.hiss(t, 0.04, 0.05, 'bandpass', 3400 * p, null, 5); },
    thud(t, o) { this.tone('sine', 85, 38, t, 0.3, 0.6 * (o.vol ?? 1)); this.hiss(t, 0.18, 0.3, 'lowpass', 700, 120, 0.8); },
    groan(t, o) { const p = o.pitch || 1; this.tone('sawtooth', 110 * p, 82 * p, t, 0.9, 0.12, { vibrato: 5, vibDepth: 6, filter: 'lowpass', ff: 600, attack: 0.15 }); this.hiss(t, 0.7, 0.05, 'bandpass', 500, 300, 2, null, 0.2); },
    hiss(t, o) { this.hiss(t, 0.35, 0.16, 'highpass', 4200, 6000, 1, null, 0.04); },
    cackle(t, o) { const p = o.pitch || 1; for (let i = 0; i < 6; i++) this.tone('square', (640 + (i % 2) * 150) * p * (1 - i * 0.04), 520 * p, t + i * 0.09, 0.08, 0.06, { filter: 'bandpass', ff: 1500, q: 2 }); },
    growl(t, o) { this.tone('sawtooth', 70, 58, t, 0.6, 0.22, { vibrato: 24, vibDepth: 9, filter: 'lowpass', ff: 520, attack: 0.05 }); this.hiss(t, 0.5, 0.12, 'lowpass', 400, 200, 2, null, 0.05); },
    howl(t, o) { const p = o.pitch || 1, v = o.vol ?? 1; this.tone('sine', 330 * p, 560 * p, t, 1.5, 0.16 * v, { vibrato: 5, vibDepth: 9, attack: 0.25, sweep: 0.6 }); this.tone('triangle', 660 * p, 1000 * p, t + 0.05, 1.3, 0.05 * v, { vibrato: 5, vibDepth: 15, attack: 0.3, sweep: 0.6 }); },
    glass(t, o) { for (let i = 0; i < 5; i++) this.tone('sine', 2400 + Math.random() * 2600, null, t + i * 0.025, 0.2, 0.06); this.hiss(t, 0.15, 0.3, 'highpass', 3000, null, 0.7); this.hiss(t + 0.03, 0.3, 0.12, 'lowpass', 900, 300, 1); },
    web(t, o) { const p = o.pitch || 1; this.tone('sine', 900 * p, 300 * p, t, 0.12, 0.12); this.hiss(t, 0.1, 0.12, 'bandpass', 2000 * p, 800, 2); },
    rumble(t, o) { this.hiss(t, 1.2, 0.3, 'lowpass', 240, 90, 1, null, 0.3); this.tone('sine', 50, 42, t, 1.2, 0.25, { attack: 0.3, vibrato: 7, vibDepth: 4 }); },
    stone(t, o) { const v = o.vol ?? 1; this.tone('square', 230 + Math.random() * 60, 120, t, 0.08, 0.12 * v, { filter: 'lowpass', ff: 1400 }); this.hiss(t, 0.12, 0.35 * v, 'bandpass', 1700, 700, 1.5); },
    crumble(t, o) { for (let i = 0; i < 6; i++) this.hiss(t + i * 0.05 + Math.random() * 0.03, 0.12, 0.3, 'lowpass', 1200 - i * 120, 250, 1); this.tone('sine', 90, 40, t, 0.4, 0.45); },
    // ---- new night creatures and bosses ----
    snarl(t, o) { const p = o.pitch || 1; this.tone('sawtooth', 130 * p, 90 * p, t, 0.28, 0.16, { vibrato: 30, vibDepth: 12, filter: 'lowpass', ff: 800 }); this.hiss(t, 0.22, 0.1, 'lowpass', 900, 300, 2); },
    caw(t, o) { for (let i = 0; i < 2; i++) this.tone('square', 980 - i * 80, 620, t + i * 0.2, 0.14, 0.07, { filter: 'bandpass', ff: 1300, q: 2, vibrato: 40, vibDepth: 60 }); },
    hissV(t, o) { const p = o.pitch || 1; this.hiss(t, 0.5, 0.2, 'highpass', 3600 * p, 2400 * p, 1.2, null, 0.03); this.tone('sine', 150 * p, 90 * p, t, 0.45, 0.12, { vibrato: 8, vibDepth: 8 }); },
    wail(t, o) { const p = o.pitch || 1, v = o.vol ?? 1; this.tone('sine', 560 * p, 880 * p, t, 1.3, 0.13 * v, { vibrato: 6, vibDepth: 28, attack: 0.25, sweep: 0.7 }); this.tone('triangle', 1120 * p, 1500 * p, t + 0.05, 1.1, 0.04 * v, { vibrato: 6, vibDepth: 40, attack: 0.3, sweep: 0.8 }); },
    scream(t, o) { this.tone('sawtooth', 900, 1500, t, 0.6, 0.12, { filter: 'bandpass', ff: 1800, q: 3, vibrato: 22, vibDepth: 70 }); this.tone('sine', 1800, 2500, t, 0.55, 0.07, { vibrato: 18, vibDepth: 60 }); this.hiss(t, 0.5, 0.22, 'highpass', 2600, 4200, 1, null, 0.02); },
    squeak(t, o) { const v = o.vol ?? 1; for (let i = 0; i < 2; i++) this.tone('sine', 2700 + i * 300, 3500, t + i * 0.07, 0.05, 0.05 * v); },
    flap(t, o) { const v = o.vol ?? 1; for (let i = 0; i < 4; i++) this.hiss(t + i * 0.055, 0.05, 0.14 * v, 'lowpass', 1100, 300, 1); },
    hatch(t, o) { this.tone('sine', 420, 110, t, 0.12, 0.25); this.hiss(t, 0.14, 0.25, 'lowpass', 1400, 300, 2); },
    neigh(t, o) { const p = o.pitch || 1; this.tone('sawtooth', 720 * p, 1150 * p, t, 0.5, 0.12, { filter: 'bandpass', ff: 1500, q: 2, vibrato: 19, vibDepth: 90, sweep: 0.3 }); this.tone('sawtooth', 1100 * p, 480 * p, t + 0.45, 0.5, 0.1, { filter: 'bandpass', ff: 1200, q: 2, vibrato: 16, vibDepth: 70 }); this.hiss(t + 0.85, 0.25, 0.18, 'lowpass', 700, 200, 1); },
    gallop(t, o) { const v = o.vol ?? 1; for (const dt of [0, 0.09, 0.24, 0.33]) { this.tone('sine', 120, 60, t + dt, 0.08, 0.3 * v); this.hiss(t + dt, 0.03, 0.12 * v, 'bandpass', 1800, null, 1.5); } },
    boom(t, o) { this.tone('sine', 95, 30, t, 0.65, 0.9); this.hiss(t, 0.75, 0.5, 'lowpass', 1400, 160, 0.8); this.hiss(t, 0.12, 0.3, 'bandpass', 2500, null, 1); },
    toll(t, o) { this.tone('sine', 98, null, t, 2.6, 0.4); this.tone('sine', 196, null, t, 2.0, 0.16); this.tone('sine', 293, null, t, 1.4, 0.08); this.tone('sine', 469, null, t, 0.8, 0.05); },
    drain(t, o) { this.tone('sawtooth', 70, 130, t, 2.0, 0.08, { filter: 'lowpass', ff: 420, vibrato: 6, vibDepth: 10, attack: 0.3 }); this.hiss(t, 2.0, 0.07, 'bandpass', 500, 900, 3, null, 0.4); },
    scythe(t, o) { const v = o.vol ?? 1, p = o.pitch || 1; this.hiss(t, 0.32, 0.32 * v, 'bandpass', 2600 * p, 500 * p, 3, null, 0.02); this.tone('sine', 1300 * p, 500 * p, t, 0.18, 0.05 * v); },
    power(t, o) { [1047, 1319, 1568, 2093].forEach((f, i) => { this.tone('triangle', f, null, t + i * 0.065, 0.22, 0.12); this.tone('sine', f * 2, null, t + i * 0.065, 0.15, 0.04); }); },
    frost(t, o) { for (let i = 0; i < 9; i++) this.tone('sine', 2000 + Math.random() * 2200, null, t + i * 0.05, 0.3, 0.05); this.hiss(t, 0.7, 0.12, 'highpass', 6000, 3000, 1, null, 0.05); },
    grow(t, o) { this.tone('square', 180, 760, t, 0.5, 0.08, { filter: 'lowpass', ff: 1400, sweep: 0.45 }); this.tone('sine', 360, 1500, t, 0.5, 0.1, { sweep: 0.45 }); },
    sparkle(t, o) { [2400, 3000, 3600].forEach((f, i) => this.tone('sine', f, null, t + i * 0.07, 0.25, 0.05)); },
    gameover(t, o) { [261.6, 246.9, 233.1, 220].forEach((f, i) => this.tone('sawtooth', f, i === 3 ? f * 0.97 : f, t + i * 0.42, i === 3 ? 1.2 : 0.4, 0.16, { filter: 'lowpass', ff: 1100, vibrato: i === 3 ? 5 : 0, vibDepth: 6, attack: 0.03 })); },
    // ---- rutabaga events and the second batch of power-ups ----
    zap(t, o) { const p = o.pitch || 1; this.hiss(t, 0.09, 0.4, 'highpass', 3000 * p, 1200 * p, 0.7); this.tone('square', 1800 * p, 300 * p, t, 0.1, 0.12, { sweep: 0.08 }); this.tone('sawtooth', 90, 60, t, 0.14, 0.18, { filter: 'lowpass', ff: 500 }); },
    thunder(t, o) { this.tone('sine', 60, 32, t, 1.6, 0.5, { sweep: 1.2, attack: 0.02 }); this.hiss(t, 1.4, 0.4, 'lowpass', 900, 90, 0.7, null, 0.02); this.hiss(t + 0.3, 0.9, 0.18, 'lowpass', 500, 80, 0.7, null, 0.2); },
    jam(t, o) { this.tone('sawtooth', 70, 48, t, 1.2, 0.35, { vibrato: 9, vibDepth: 10, filter: 'lowpass', ff: 600, attack: 0.08 }); this.hiss(t, 1.3, 0.3, 'bandpass', 900, 300, 1, null, 0.1); for (let i = 0; i < 6; i++) this.tone('square', 520 + i * 90, 700 + i * 120, t + i * 0.09, 0.18, 0.06, { filter: 'lowpass', ff: 2000 }); },
    meteor(t, o) { this.hiss(t, 1.0, 0.25, 'bandpass', 600, 4000, 2, null, 0.05); this.tone('sine', 220, 900, t, 1.0, 0.1, { sweep: 1.0 }); },
    splash(t, o) { this.tone('sine', 150, 60, t, 0.18, 0.35); this.hiss(t, 0.14, 0.4, 'lowpass', 2200, 300, 1.2); for (let i = 0; i < 3; i++) this.hiss(t + 0.05 + i * 0.04, 0.05, 0.1, 'bandpass', 1800 + Math.random() * 1500, null, 3); },
    fanfare(t, o) { [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => { this.tone('square', f, f, t + i * 0.11, 0.3, 0.12, { filter: 'lowpass', ff: 2800 }); this.tone('triangle', f / 2, f / 2, t + i * 0.11, 0.3, 0.08); }); this.hiss(t, 0.6, 0.08, 'highpass', 4000, null, 1); },
    smash(t, o) { const v = o.vol ?? 1; this.tone('sine', 110, 36, t, 0.35, 0.8 * v); this.hiss(t, 0.22, 0.45 * v, 'lowpass', 1800, 200, 0.8); this.tone('square', 260, 110, t, 0.1, 0.14 * v, { filter: 'lowpass', ff: 1200 }); },
    hup(t, o) { const p = o.pitch || 1; this.tone('sawtooth', 160 * p, 230 * p, t, 0.16, 0.12, { filter: 'lowpass', ff: 900, vibrato: 20, vibDepth: 10 }); },
    ghostOn(t, o) { this.tone('sine', 420, 840, t, 0.6, 0.12, { vibrato: 7, vibDepth: 30, attack: 0.1 }); this.tone('sine', 630, 1260, t + 0.1, 0.6, 0.07, { attack: 0.1 }); this.hiss(t, 0.7, 0.1, 'highpass', 3000, null, 0.5, null, 0.1); },
    fangs(t, o) { this.tone('sine', 880, 1320, t, 0.12, 0.1); this.tone('sine', 1320, 1760, t + 0.08, 0.14, 0.08); },
    victory(t, o) { [392, 523, 659, 784].forEach((f, i) => this.tone('square', f, f, t + i * 0.13, 0.5, 0.1, { filter: 'lowpass', ff: 2600 })); [523, 659, 784, 1047].forEach((f) => this.tone('triangle', f, f, t + 0.6, 1.4, 0.1)); },
  },
};

// --- Music: original minor-key loop with a theremin melody ---------------
const MUSIC = {
  playing: false, step: 0, nextTime: 0, timer: null, intensity: 0, bpm: 116, boss: false, mode: 'game',
  source: null, trackGain: null, activeTrack: null,
  chords: [[50, 53, 57], [46, 50, 53], [43, 46, 50], [45, 49, 52]], // Dm, Bb, Gm, A
  melody: [
    [69, -1, -1, 74, -1, 72, 69, -1], [65, -1, -1, 70, -1, 69, 65, -1],
    [67, -1, 70, -1, 74, -1, 73, -1], [76, -1, -1, 73, -1, -1, 69, -1],
  ],
  startMenu() {
    if (!SFX.ctx) return;
    this.mode = 'menu'; this.boss = false; this.intensity = 0;
    if (!this.playing) { this.playing = true; this.step = 0; this.nextTime = SFX.ctx.currentTime + 0.1; }
    this.syncTrack();
  },
  start(intensity = 0) {
    if (!SFX.ctx) return;
    this.mode = 'game'; this.intensity = intensity;
    if (!this.playing) { this.playing = true; this.step = 0; this.nextTime = SFX.ctx.currentTime + 0.1; }
    this.syncTrack();
  },
  setBoss(on) { this.boss = on; this.syncTrack(); },
  syncTrack() {
    if (!this.playing || !SFX.ctx) return;
    const buffer = this.mode === 'menu'
      ? SFX.buffers.menuMusic
      : this.boss ? (SFX.buffers.bossMusic || SFX.buffers.music) : SFX.buffers.music;
    const trackName = buffer === SFX.buffers.menuMusic ? 'menuMusic'
      : buffer === SFX.buffers.bossMusic ? 'bossMusic' : buffer ? 'music' : null;
    if (!buffer) {
      if (this.source && this.trackGain) {
        const now = SFX.ctx.currentTime;
        this.trackGain.gain.cancelScheduledValues(now);
        this.trackGain.gain.setValueAtTime(Math.max(0.0001, this.trackGain.gain.value), now);
        this.trackGain.gain.linearRampToValueAtTime(0.0001, now + 0.18);
        this.source.stop(now + 0.2);
        this.source = null; this.trackGain = null; this.activeTrack = null;
      }
      if (!this.timer) this.timer = setInterval(() => this.schedule(), 25);
      return;
    }
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
    if (this.source && this.activeTrack === trackName) return;
    const c = SFX.ctx, now = c.currentTime;
    const source = c.createBufferSource(), gain = c.createGain();
    source.buffer = buffer; source.loop = true;
    gain.gain.setValueAtTime(0.0001, now);
    source.connect(gain); gain.connect(SFX.musicBus); source.start(now);
    gain.gain.linearRampToValueAtTime(this.mode === 'menu' ? 0.42 : 0.58, now + 0.45);
    const oldSource = this.source, oldGain = this.trackGain;
    this.source = source; this.trackGain = gain; this.activeTrack = trackName;
    if (oldSource && oldGain) {
      oldGain.gain.cancelScheduledValues(now);
      oldGain.gain.setValueAtTime(Math.max(0.0001, oldGain.gain.value), now);
      oldGain.gain.linearRampToValueAtTime(0.0001, now + 0.45);
      oldSource.stop(now + 0.5);
    }
  },
  stop() {
    this.playing = false;
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    if (this.source && this.trackGain && SFX.ctx) {
      const now = SFX.ctx.currentTime;
      this.trackGain.gain.cancelScheduledValues(now);
      this.trackGain.gain.setValueAtTime(Math.max(0.0001, this.trackGain.gain.value), now);
      this.trackGain.gain.linearRampToValueAtTime(0.0001, now + 0.16);
      this.source.stop(now + 0.18);
    }
    this.source = null; this.trackGain = null; this.activeTrack = null;
  },
  midi(n) { return 440 * Math.pow(2, (n - 69) / 12); },
  schedule() {
    if (!SFX.ctx || !this.playing) return;
    const spb = 60 / (this.boss ? 138 : this.bpm) / 2; // eighth notes
    while (this.nextTime < SFX.ctx.currentTime + 0.15) {
      this.playStep(this.step, this.nextTime, spb);
      this.nextTime += spb; this.step++;
    }
  },
  playStep(step, time, spb) {
    if (!G.sound) return;
    const bar = Math.floor(step / 8) % 4, s = step % 8, cycle = Math.floor(step / 32);
    const ch = this.chords[bar]; const dest = SFX.musicBus;
    const arp = [ch[0] + 12, ch[1] + 12, ch[2] + 12, ch[0] + 24, ch[2] + 12, ch[1] + 12, ch[0] + 12, ch[2]];
    // harpsichord-like arpeggio
    SFX.tone('square', this.midi(arp[s]), null, time, spb * 1.6, 0.05, { filter: 'lowpass', ff: 2200, dest });
    // bass
    if (s === 0 || s === 4) SFX.tone('triangle', this.midi(ch[0] - 12), null, time, spb * 3.5, 0.3, { dest });
    if (s === 7) SFX.tone('triangle', this.midi(ch[2] - 12), null, time, spb * 0.9, 0.2, { dest });
    // theremin melody every other cycle
    if (cycle % 2 === 1 || this.boss) {
      const m = this.melody[bar][s];
      if (m > 0) SFX.tone('sine', this.midi(m), null, time, spb * 2.6, 0.09, { vibrato: 5.5, vibDepth: 6, attack: 0.06, dest });
    }
    // percussion
    if (this.intensity >= 1) {
      if (s === 0 || s === 4) SFX.tone('sine', 70, 40, time, 0.16, 0.45, { dest });
      if (s === 2 || s === 6) SFX.hiss(time, 0.1, 0.12, 'bandpass', 1800, null, 0.8, dest);
      if (this.intensity >= 2 || this.boss) SFX.hiss(time, 0.03, 0.05, 'highpass', 7000, null, 0.7, dest);
    }
    // organ pad on the boss / late night
    if ((this.intensity >= 2 || this.boss) && s === 0) for (const n of ch) SFX.tone('sawtooth', this.midi(n), null, time, spb * 7.5, 0.025, { filter: 'lowpass', ff: 900, attack: 0.2, dest });
  },
};

// =====================================================================
// 7. ASSET LOADING and instanced RIGS
// A rig turns a GLB into THREE.InstancedMesh objects: one draw call per
// mesh piece no matter how many skeletons are on screen. Named part nodes
// (Body, Head, ArmL...) can be rotated per instance for procedural animation.
// =====================================================================
const Assets = { models: {}, textures: {}, failed: [] };
const PART_NAMES = ['Body', 'Head', 'ArmL', 'ArmR', 'LegL', 'LegR', 'WingL', 'WingR', 'Cape', 'Plume', 'Flame', 'Flag', 'Brew', 'Leaves', 'Tail',
  'LegL2', 'LegR2', 'LegL3', 'LegR3', 'LegL4', 'LegR4', 'Jaw', 'Crack', 'Crack2', 'Pole', 'Rider'];

// glTF node name. GLTFLoader keeps the original name in userData.name
// (object.name gets a _1, _2 suffix when several nodes share a name).
const gltfName = (obj) => obj.userData.name;

function fallbackModel() {
  const scene = new THREE.Group();
  const m = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.2, 0.8), new THREE.MeshStandardMaterial({ color: 0xff00ff }));
  m.position.y = 0.6; m.name = 'Body'; m.userData.name = 'Body'; scene.add(m);
  return { scene };
}

async function loadAssets(onProgress) {
  const jobs = [];
  for (const [key, file] of Object.entries(ASSETS.models)) {
    jobs.push(async () => {
      try { Assets.models[key] = await loadGLTF(assetURL(file)); }
      catch (e) { console.error('Model failed', key, e); Assets.failed.push(file); Assets.models[key] = fallbackModel(); }
    });
  }
  for (const [key, file] of Object.entries(ASSETS.textures)) {
    jobs.push(async () => {
      try { Assets.textures[key] = await loadTexture(assetURL(file), !/normal/i.test(key)); }
      catch (e) { console.error('Texture failed', key, e); Assets.failed.push(file); Assets.textures[key] = null; }
    });
  }
  let done = 0;
  await Promise.all(jobs.map(j => j().then(() => { done++; onProgress && onProgress(done / jobs.length); })));
}

class RigTemplate {
  constructor(gltf, opts = {}) {
    const root = gltf.scene;
    root.position.set(0, 0, 0); root.quaternion.identity(); root.scale.set(1, 1, 1);
    root.updateMatrixWorld(true);
    this.parts = []; this.partIndex = {}; this.pieces = [];
    const visit = (n, parentPart) => {
      let myPart = parentPart;
      const name = gltfName(n);
      if (name && PART_NAMES.includes(name)) {
        const idx = this.parts.length;
        const rest = new THREE.Matrix4();
        if (parentPart >= 0) rest.copy(this.parts[parentPart].world).invert().multiply(n.matrixWorld); else rest.copy(n.matrixWorld);
        this.parts.push({ name, parent: parentPart, rest, world: n.matrixWorld.clone() });
        if (!(name in this.partIndex)) this.partIndex[name] = idx;
        myPart = idx;
      }
      if (n.isMesh) {
        const offset = new THREE.Matrix4();
        if (myPart >= 0) offset.copy(this.parts[myPart].world).invert().multiply(n.matrixWorld); else offset.copy(n.matrixWorld);
        const mat = (opts.materialMap && opts.materialMap(n.material)) || n.material;
        const g = n.geometry;
        if (!g.boundingBox) g.computeBoundingBox();
        if (!g.boundingSphere) g.computeBoundingSphere();
        this.pieces.push({ geometry: g, material: mat, part: myPart, offset, restWorld: n.matrixWorld.clone(), center: g.boundingBox.getCenter(new THREE.Vector3()), radius: g.boundingSphere.radius });
      }
      for (const c of n.children) visit(c, myPart);
    };
    visit(root, -1);
    this.nParts = this.parts.length;
    // bounding info for sizing
    let minY = Infinity, maxY = -Infinity, maxR = 0;
    for (const p of this.pieces) {
      const b = p.geometry.boundingBox;
      for (const cx of [b.min.x, b.max.x]) for (const cy of [b.min.y, b.max.y]) for (const cz of [b.min.z, b.max.z]) {
        _v1.set(cx, cy, cz).applyMatrix4(p.restWorld);
        minY = Math.min(minY, _v1.y); maxY = Math.max(maxY, _v1.y); maxR = Math.max(maxR, Math.hypot(_v1.x, _v1.z));
      }
    }
    this.height = maxY - minY; this.minY = minY; this.maxY = maxY; this.radius = maxR;
  }
  part(name) { return name in this.partIndex ? this.partIndex[name] : -1; }
}

// Pose: per part [rx, ry, rz, px, py, pz, sx, sy, sz]
const POSE_STRIDE = 9;
function makePose(tpl) { const p = new Float32Array(Math.max(1, tpl.nParts) * POSE_STRIDE); resetPose(p); return p; }
function resetPose(p) { for (let i = 0; i < p.length; i += POSE_STRIDE) { p[i] = p[i + 1] = p[i + 2] = p[i + 3] = p[i + 4] = p[i + 5] = 0; p[i + 6] = p[i + 7] = p[i + 8] = 1; } }

class RigBatch {
  constructor(tpl, capacity, opts = {}) {
    this.tpl = tpl; this.capacity = capacity;
    this.meshes = tpl.pieces.map((pc) => {
      const im = new THREE.InstancedMesh(pc.geometry, pc.material, capacity);
      im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      // per instance colour multiplies the material colour (hit flash, elite tint)
      im.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(capacity * 3).fill(1), 3).setUsage(THREE.DynamicDrawUsage);
      im.castShadow = opts.castShadow !== false; im.receiveShadow = opts.receiveShadow !== false;
      im.frustumCulled = false; im.count = 0; im.visible = false;
      return im;
    });
    this.world = tpl.parts.map(() => new THREE.Matrix4());
    this.n = 0; this.debris = tpl.pieces.map(() => 0);
    this._t = new THREE.Matrix4(); this._q = new THREE.Quaternion(); this._p = new THREE.Vector3(); this._s = new THREE.Vector3(1, 1, 1);
  }
  addTo(scene) { for (const m of this.meshes) scene.add(m); return this; }
  begin() { this.n = 0; for (let i = 0; i < this.debris.length; i++) this.debris[i] = 0; }
  // Computes part world matrices for a pose; result in this.world
  solve(rootMat, pose) {
    const parts = this.tpl.parts;
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i], W = this.world[i];
      const parentW = p.parent >= 0 ? this.world[p.parent] : rootMat;
      if (pose) {
        const o = i * POSE_STRIDE;
        quatFromEuler(this._q, pose[o], pose[o + 1], pose[o + 2]);
        this._p.set(pose[o + 3], pose[o + 4], pose[o + 5]); this._s.set(pose[o + 6], pose[o + 7], pose[o + 8]);
        this._t.compose(this._p, this._q, this._s);
        W.multiplyMatrices(parentW, p.rest).multiply(this._t);
      } else W.multiplyMatrices(parentW, p.rest);
    }
  }
  pieceMatrix(i, rootMat, out) {
    const pc = this.tpl.pieces[i];
    return out.multiplyMatrices(pc.part >= 0 ? this.world[pc.part] : rootMat, pc.offset);
  }
  setInstance(im, idx, mat, r, g, b) {
    mat.toArray(im.instanceMatrix.array, idx * 16);
    const c = im.instanceColor.array, o = idx * 3; c[o] = r; c[o + 1] = g; c[o + 2] = b;
  }
  push(rootMat, pose, r = 1, g = 1, b = 1) {
    if (this.n >= this.capacity) return -1;
    this.solve(rootMat, pose);
    const idx = this.n++;
    for (let i = 0; i < this.meshes.length; i++) this.setInstance(this.meshes[i], idx, this.pieceMatrix(i, rootMat, _m3), r, g, b);
    return idx;
  }
  // a single loose piece (flying debris of a destroyed enemy)
  pushPiece(i, mat, r = 1, g = 1, b = 1) {
    const idx = this.n + this.debris[i];
    if (idx >= this.capacity) return;
    this.debris[i]++;
    this.setInstance(this.meshes[i], idx, mat, r, g, b);
  }
  end() {
    for (let i = 0; i < this.meshes.length; i++) {
      const im = this.meshes[i], n = Math.min(this.capacity, this.n + this.debris[i]);
      im.count = n; im.visible = n > 0;
      if (n === 0) continue;
      im.instanceMatrix.clearUpdateRanges(); im.instanceMatrix.addUpdateRange(0, n * 16); im.instanceMatrix.needsUpdate = true;
      im.instanceColor.clearUpdateRanges(); im.instanceColor.addUpdateRange(0, n * 3); im.instanceColor.needsUpdate = true;
    }
  }
}

// =====================================================================
// 8. WORLD: renderer, camera, lights and the castle courtyard
// =====================================================================
const World = {
  renderer: null, scene: null, camera: null, canvas: null,
  rigs: {}, statics: [], animated: [], torchLights: [], pumpkinLight: null, cauldronLight: null,
  torches: [], glowSprites: [], bats: [], towers: [], cauldrons: [], wisps: [], leaves: [], lanternGlows: [],
  yardRigs: [], yardGlows: [], yardSpots: [], floorMarks: [], tplCache: {}, themeIndex: 0, themeK: 1, themeCur: null,
  solids: [], // round blockers inside the courtyard: { x, z, r } (towers, cauldron)
  width: 1, height: 1, dpr: 1, viewRadius: 15,
  nightMood: 0,

  init(canvas) {
    this.canvas = canvas;
    const Q = CONFIG.quality;
    const r = this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    r.toneMapping = THREE.CustomToneMapping; // see THREE.JS SETUP
    r.toneMappingExposure = 1.05;
    r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFShadowMap;
    const s = this.scene = new THREE.Scene();
    s.background = new THREE.Color(0x0b0714);
    s.fog = new THREE.Fog(0x120a1e, 34, 70);
    this.camera = new THREE.PerspectiveCamera(CONFIG.camera.fov, 1, 0.5, 260);
    this.camTarget = new THREE.Vector3(0, 0, 0.9);
    // moonlit sky + ground bounce
    this.hemi = new THREE.HemisphereLight(0x5a5aa0, 0x2a1a14, 0.62 * LIGHT.ambient);
    s.add(this.hemi);
    // the moon: the only light that casts shadows
    const moon = this.moon = new THREE.DirectionalLight(0xa8b8ff, 1.25 * LIGHT.sun);
    moon.position.set(-0.38, 1, -0.5).normalize().multiplyScalar(60);
    moon.castShadow = true;
    const sh = moon.shadow, ext = 23, size = G.mobile ? Q.mobileShadowMap : Q.shadowMap;
    sh.mapSize.set(size, size);
    sh.camera.left = -ext; sh.camera.right = ext; sh.camera.top = ext; sh.camera.bottom = -ext; sh.camera.near = 1; sh.camera.far = 140;
    sh.intensity = 0.72;   // shadows keep 28 % of the moonlight
    sh.bias = -0.0006; sh.normalBias = 0.03; sh.radius = 1.6;
    s.add(moon, moon.target);
    this.resize();
    this.makeSpriteAtlas();
    FX.init(s, this.atlas);
  },

  resize() {
    const w = window.innerWidth, h = window.innerHeight;
    const Q = CONFIG.quality;
    const maxDpr = G.mobile ? Q.mobilePixelRatio : Q.maxPixelRatio;
    this.dpr = Math.min(window.devicePixelRatio || 1, maxDpr) * (this.dprScale || 1);
    this.width = w; this.height = h;
    this.renderer.setPixelRatio(this.dpr);
    this.renderer.setSize(w, h);
    this.fitCamera();
  },

  // Find a camera distance that keeps the requested radius of the arena on screen.
  fitCamera() {
    const C = CONFIG.camera, cam = this.camera;
    const aspect = this.width / this.height;
    cam.aspect = aspect; cam.updateProjectionMatrix();
    const tall = clamp((1.25 - aspect) / 0.7, 0, 1);
    // small (phone) screens: show a smaller part of the arena so Sir is big enough; the camera follows him
    const small = clamp((640 - Math.min(this.width, this.height)) / 260, 0, 1);
    const zoom = lerp(1, C.mobileFit, small);
    const rx = lerp(C.fitWide, C.fitTallX, tall) * zoom, rz = lerp(C.fitWide, C.fitTallZ, tall) * zoom;
    const pitch = C.pitch * Math.PI / 180;
    const target = this.camTarget;
    const pts = []; for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; pts.push(new THREE.Vector3(Math.cos(a) * rx, 0.6, Math.sin(a) * rz)); }
    const base = this.camHome || (this.camHome = new THREE.Vector3(0, 0, 0.9));
    const place = (d) => { cam.position.set(0, Math.sin(pitch) * d, Math.cos(pitch) * d).add(base); cam.lookAt(base); cam.updateMatrixWorld(); };
    let lo = 8, hi = 120;
    const topMargin = 1 - 2 * (78 / this.height), botMargin = -1 + 2 * (40 / this.height);
    for (let it = 0; it < 30; it++) {
      const mid = (lo + hi) / 2; place(mid);
      let ok = true;
      for (const p of pts) { _v2.copy(p).project(cam); if (_v2.x < -0.97 || _v2.x > 0.97 || _v2.y > topMargin || _v2.y < botMargin) { ok = false; break; } }
      if (ok) hi = mid; else lo = mid;
    }
    this.camDist = hi; place(hi);
    this.camOffset = cam.position.clone().sub(base);   // camera = look target + offset (+ shake)
    // How much the view follows Sir: enough to keep him followMargin metres inside the visible area
    const reach = CONFIG.arena.innerRadius - 1;
    this.followX = clamp(1 - (rx - C.followMargin) / reach, 0, 1);
    this.followZ = clamp(1 - (rz - C.followMargin) / reach, 0, 1);
    cam.position.copy(target).add(this.camOffset); cam.lookAt(target); cam.updateMatrixWorld();
    // fog starts just behind the arena centre
    this.scene.fog.near = hi + 3; this.scene.fog.far = hi + 3 + 36;
  },
  // the view drifts after Sir when he walks towards the walls
  followCamera(dt) {
    const st = G.state, on = st === 'playing' || st === 'levelup' || st === 'paused' || st === 'dying' || st === 'dawn';
    const tx = on ? Hero.x * this.followX : 0, tz = 0.9 + (on ? Hero.z * this.followZ : 0);
    const k = 1 - Math.exp(-CONFIG.camera.followRate * dt), t = this.camTarget;
    t.x += (tx - t.x) * k; t.z += (tz - t.z) * k;
  },
  // Keeps a round body (radius r) inside the courtyard and out of the towers, the gate
  // and the cauldron. Moves o.x / o.z; returns the push direction (away from the wall) or null.
  solidPush(o, r) {
    const A = CONFIG.arena, out = this._push || (this._push = { x: 0, z: 0 });
    let hit = false;
    const d = Math.hypot(o.x, o.z), lim = A.innerRadius - r;
    if (d > lim) { o.x *= lim / d; o.z *= lim / d; out.x = -o.x / lim; out.z = -o.z / lim; hit = true; }
    for (const s of this.solids) {
      const dx = o.x - s.x, dz = o.z - s.z, dd = Math.hypot(dx, dz), rr = s.r + r;
      if (dd < rr && dd > 1e-6) { o.x = s.x + dx / dd * rr; o.z = s.z + dz / dd * rr; out.x = dx / dd; out.z = dz / dd; hit = true; }
    }
    if (o.z < -15.9 + r && Math.abs(o.x) < 4.6) { o.z = -15.9 + r; out.x = 0; out.z = 1; hit = true; } // gatehouse front
    return hit ? out : null;
  },
  // world point -> normalised screen coords (-1..1)
  project(v, out) { _pv.set(v.x, v.y, v.z).project(this.camera); out.x = _pv.x; out.y = _pv.y; out.z = _pv.z; return out; },
  // normalised screen coords -> ray (origin, direction) into the world
  ray(nx, ny, origin, dir) {
    origin.set(nx, ny, -1).unproject(this.camera);
    dir.set(nx, ny, 1).unproject(this.camera).sub(origin).normalize();
  },

  // Sprite atlas (4 x 8 cells) drawn once on a canvas
  makeSpriteAtlas() {
    const S = 128, N = 4, ROWS = 8; const cv = document.createElement('canvas'); cv.width = S * N; cv.height = S * ROWS;
    const g = cv.getContext('2d');
    const cell = (i, fn) => { const x = (i % N) * S, y = Math.floor(i / N) * S; g.save(); g.translate(x, y); g.beginPath(); g.rect(0, 0, S, S); g.clip(); fn(g, S); g.restore(); };
    const radial = (g2, stops) => { const gr = g2.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2); for (const [o, c] of stops) gr.addColorStop(o, c); g2.fillStyle = gr; g2.fillRect(0, 0, S, S); };
    // 0 soft glow
    cell(0, (g2) => radial(g2, [[0, 'rgba(255,255,255,1)'], [0.25, 'rgba(255,255,255,0.55)'], [0.6, 'rgba(255,255,255,0.12)'], [1, 'rgba(255,255,255,0)']]));
    // 1 dot
    cell(1, (g2) => radial(g2, [[0, 'rgba(255,255,255,1)'], [0.55, 'rgba(255,255,255,1)'], [0.75, 'rgba(255,255,255,0.4)'], [1, 'rgba(255,255,255,0)']]));
    // 2 smoke puff
    cell(2, (g2, s) => { for (let k = 0; k < 9; k++) { const a = k / 9 * TAU, r = s * 0.16; const gr = g2.createRadialGradient(s / 2 + Math.cos(a) * r, s / 2 + Math.sin(a) * r, 0, s / 2 + Math.cos(a) * r, s / 2 + Math.sin(a) * r, s * 0.3); gr.addColorStop(0, 'rgba(255,255,255,0.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g2.fillStyle = gr; g2.fillRect(0, 0, s, s); } radial(g2, [[0, 'rgba(255,255,255,0.5)'], [0.6, 'rgba(255,255,255,0.15)'], [1, 'rgba(255,255,255,0)']]); });
    // 3 spark star
    cell(3, (g2, s) => { radial(g2, [[0, 'rgba(255,255,255,1)'], [0.12, 'rgba(255,255,255,0.6)'], [0.35, 'rgba(255,255,255,0)']]); g2.fillStyle = 'rgba(255,255,255,0.9)'; for (const r of [0, Math.PI / 2]) { g2.save(); g2.translate(s / 2, s / 2); g2.rotate(r); g2.beginPath(); g2.moveTo(-s / 2, 0); g2.quadraticCurveTo(0, -s * 0.04, s / 2, 0); g2.quadraticCurveTo(0, s * 0.04, -s / 2, 0); g2.fill(); g2.restore(); } });
    // 4 thin ring
    cell(4, (g2, s) => { g2.strokeStyle = 'rgba(255,255,255,1)'; g2.lineWidth = s * 0.05; g2.beginPath(); g2.arc(s / 2, s / 2, s * 0.42, 0, TAU); g2.stroke(); g2.globalAlpha = 0.35; g2.lineWidth = s * 0.12; g2.stroke(); });
    // 5 flame
    cell(5, (g2, s) => { const gr = g2.createRadialGradient(s / 2, s * 0.62, 0, s / 2, s * 0.6, s * 0.42); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g2.fillStyle = gr; g2.beginPath(); g2.moveTo(s / 2, s * 0.05); g2.quadraticCurveTo(s * 0.85, s * 0.55, s / 2, s * 0.95); g2.quadraticCurveTo(s * 0.15, s * 0.55, s / 2, s * 0.05); g2.fill(); });
    // 6 leaf
    cell(6, (g2, s) => { g2.translate(s / 2, s / 2); g2.rotate(0.6); g2.fillStyle = 'rgba(255,255,255,1)'; g2.beginPath(); g2.moveTo(0, -s * 0.42); for (let k = 0; k <= 12; k++) { const a = -Math.PI / 2 + k / 12 * TAU; const rr = s * (0.3 + 0.08 * Math.cos(k * 3)); g2.lineTo(Math.cos(a) * rr * 0.75, Math.sin(a) * rr); } g2.fill(); g2.strokeStyle = 'rgba(0,0,0,0.35)'; g2.lineWidth = 3; g2.beginPath(); g2.moveTo(0, -s * 0.38); g2.lineTo(0, s * 0.45); g2.stroke(); });
    // 7 shockwave ring (soft)
    cell(7, (g2) => radial(g2, [[0, 'rgba(255,255,255,0)'], [0.68, 'rgba(255,255,255,0)'], [0.86, 'rgba(255,255,255,0.9)'], [0.93, 'rgba(255,255,255,0.4)'], [1, 'rgba(255,255,255,0)']]));
    // 8 arrow head (points up = -y in cell, i.e. forward)
    cell(8, (g2, s) => { g2.fillStyle = 'rgba(255,255,255,1)'; g2.beginPath(); g2.moveTo(s / 2, s * 0.08); g2.lineTo(s * 0.9, s * 0.85); g2.lineTo(s / 2, s * 0.66); g2.lineTo(s * 0.1, s * 0.85); g2.closePath(); g2.fill(); });
    // 9 dashed target circle
    cell(9, (g2, s) => { g2.strokeStyle = 'rgba(255,255,255,1)'; g2.lineWidth = s * 0.06; g2.setLineDash([s * 0.12, s * 0.08]); g2.beginPath(); g2.arc(s / 2, s / 2, s * 0.42, 0, TAU); g2.stroke(); });
    // 10 seed
    cell(10, (g2, s) => { g2.fillStyle = 'rgba(255,255,255,1)'; g2.beginPath(); g2.ellipse(s / 2, s / 2, s * 0.2, s * 0.34, 0, 0, TAU); g2.fill(); });
    // 11 soft blob shadow
    cell(11, (g2) => radial(g2, [[0, 'rgba(255,255,255,0.9)'], [0.5, 'rgba(255,255,255,0.5)'], [1, 'rgba(255,255,255,0)']]));
    // 12 plus sparkle
    cell(12, (g2, s) => { g2.fillStyle = 'rgba(255,255,255,1)'; g2.fillRect(s * 0.44, s * 0.15, s * 0.12, s * 0.7); g2.fillRect(s * 0.15, s * 0.44, s * 0.7, s * 0.12); radial(g2, [[0, 'rgba(255,255,255,0.6)'], [0.3, 'rgba(255,255,255,0)']]); });
    // 13 crack/scorch blob
    cell(13, (g2, s) => { for (let k = 0; k < 14; k++) { const a = Math.random() * TAU, r = Math.random() * s * 0.25; g2.fillStyle = 'rgba(255,255,255,0.25)'; g2.beginPath(); g2.arc(s / 2 + Math.cos(a) * r, s / 2 + Math.sin(a) * r, s * (0.08 + Math.random() * 0.14), 0, TAU); g2.fill(); } });
    // 14 bone chip
    cell(14, (g2, s) => { g2.fillStyle = 'rgba(255,255,255,1)'; g2.fillRect(s * 0.3, s * 0.45, s * 0.4, s * 0.1); for (const x of [0.28, 0.72]) for (const y of [0.42, 0.58]) { g2.beginPath(); g2.arc(s * x, s * y, s * 0.07, 0, TAU); g2.fill(); } });
    // 15 rune ring
    cell(15, (g2, s) => { g2.strokeStyle = 'rgba(255,255,255,1)'; g2.lineWidth = s * 0.035; g2.beginPath(); g2.arc(s / 2, s / 2, s * 0.44, 0, TAU); g2.stroke(); g2.beginPath(); g2.arc(s / 2, s / 2, s * 0.34, 0, TAU); g2.stroke(); for (let k = 0; k < 10; k++) { const a = k / 10 * TAU; g2.save(); g2.translate(s / 2 + Math.cos(a) * s * 0.39, s / 2 + Math.sin(a) * s * 0.39); g2.rotate(a); g2.fillRect(-s * 0.012, -s * 0.03, s * 0.024, s * 0.06); g2.restore(); } });
    const rnd = mulberry(7);
    // 16 spider web: spokes and a spiral
    cell(16, (g2, s) => {
      g2.translate(s / 2, s / 2); g2.strokeStyle = 'rgba(255,255,255,0.95)'; g2.lineCap = 'round';
      const spokes = 11, ang = []; for (let k = 0; k < spokes; k++) ang.push(k / spokes * TAU + (rnd() - 0.5) * 0.25);
      g2.lineWidth = s * 0.016; for (const a of ang) { g2.beginPath(); g2.moveTo(0, 0); g2.lineTo(Math.cos(a) * s * 0.47, Math.sin(a) * s * 0.47); g2.stroke(); }
      g2.lineWidth = s * 0.011;
      for (let ring = 1; ring <= 7; ring++) { const rr = s * 0.06 * ring; g2.beginPath(); ang.forEach((a, k) => { const r2 = rr * (0.92 + rnd() * 0.12); const x = Math.cos(a) * r2, y = Math.sin(a) * r2; if (k === 0) g2.moveTo(x, y); else g2.quadraticCurveTo(Math.cos(a - 0.3) * r2 * 0.88, Math.sin(a - 0.3) * r2 * 0.88, x, y); }); g2.closePath(); g2.stroke(); }
    });
    // 17 ground cracks (a stone is about to rise here)
    cell(17, (g2, s) => {
      g2.translate(s / 2, s / 2); g2.strokeStyle = 'rgba(255,255,255,1)'; g2.lineCap = 'round'; g2.lineJoin = 'round';
      for (let k = 0; k < 7; k++) {
        let a = k / 7 * TAU + rnd() * 0.5, x = 0, y = 0, w = s * 0.045;
        g2.beginPath(); g2.moveTo(0, 0);
        for (let j = 0; j < 5; j++) { a += (rnd() - 0.5) * 0.9; const st = s * (0.07 + rnd() * 0.04); x += Math.cos(a) * st; y += Math.sin(a) * st; g2.lineWidth = w; g2.lineTo(x, y); w *= 0.75; }
        g2.stroke();
      }
      const gr = g2.createRadialGradient(0, 0, 0, 0, 0, s * 0.2); gr.addColorStop(0, 'rgba(255,255,255,0.8)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g2.fillStyle = gr; g2.fillRect(-s / 2, -s / 2, s, s);
    });
    // 18 splash puddle
    cell(18, (g2, s) => {
      g2.translate(s / 2, s / 2); g2.fillStyle = 'rgba(255,255,255,1)'; g2.beginPath();
      for (let k = 0; k <= 24; k++) { const a = k / 24 * TAU, r2 = s * (0.3 + 0.07 * Math.sin(a * 5 + 1) + 0.04 * Math.sin(a * 9)); if (k === 0) g2.moveTo(Math.cos(a) * r2, Math.sin(a) * r2); else g2.lineTo(Math.cos(a) * r2, Math.sin(a) * r2); }
      g2.fill();
      for (let k = 0; k < 9; k++) { const a = rnd() * TAU, r2 = s * (0.36 + rnd() * 0.1); g2.beginPath(); g2.arc(Math.cos(a) * r2, Math.sin(a) * r2, s * (0.02 + rnd() * 0.035), 0, TAU); g2.fill(); }
    });
    // 19 claw slash: three curved strokes
    cell(19, (g2, s) => {
      g2.strokeStyle = 'rgba(255,255,255,1)'; g2.lineCap = 'round';
      for (let k = -1; k <= 1; k++) { g2.lineWidth = s * 0.06; g2.beginPath(); g2.moveTo(s * (0.22 + k * 0.14), s * 0.12); g2.quadraticCurveTo(s * (0.62 + k * 0.1), s * 0.45, s * (0.48 + k * 0.16), s * 0.9); g2.stroke(); }
    });
    // 20 bandage strip
    cell(20, (g2, s) => {
      g2.fillStyle = 'rgba(255,255,255,1)'; g2.beginPath(); g2.moveTo(s * 0.1, s * 0.4);
      for (let k = 0; k <= 10; k++) g2.lineTo(s * (0.1 + k * 0.08), s * (0.4 + Math.sin(k * 0.9) * 0.08));
      for (let k = 10; k >= 0; k--) g2.lineTo(s * (0.1 + k * 0.08), s * (0.56 + Math.sin(k * 0.9) * 0.08));
      g2.fill();
    });
    // 21 stone chip
    cell(21, (g2, s) => { g2.fillStyle = 'rgba(255,255,255,1)'; g2.beginPath(); g2.moveTo(s * 0.3, s * 0.2); g2.lineTo(s * 0.75, s * 0.32); g2.lineTo(s * 0.82, s * 0.7); g2.lineTo(s * 0.4, s * 0.85); g2.lineTo(s * 0.18, s * 0.55); g2.closePath(); g2.fill(); });
    // 22 bubble
    cell(22, (g2, s) => { g2.strokeStyle = 'rgba(255,255,255,1)'; g2.lineWidth = s * 0.07; g2.beginPath(); g2.arc(s / 2, s / 2, s * 0.36, 0, TAU); g2.stroke(); g2.fillStyle = 'rgba(255,255,255,0.9)'; g2.beginPath(); g2.arc(s * 0.38, s * 0.36, s * 0.08, 0, TAU); g2.fill(); g2.fillStyle = 'rgba(255,255,255,0.25)'; g2.beginPath(); g2.arc(s / 2, s / 2, s * 0.33, 0, TAU); g2.fill(); });
    // 23 target: ring with four ticks
    cell(23, (g2, s) => { g2.strokeStyle = 'rgba(255,255,255,1)'; g2.lineWidth = s * 0.05; g2.beginPath(); g2.arc(s / 2, s / 2, s * 0.4, 0, TAU); g2.stroke(); g2.lineWidth = s * 0.07; for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2; g2.beginPath(); g2.moveTo(s / 2 + Math.cos(a) * s * 0.3, s / 2 + Math.sin(a) * s * 0.3); g2.lineTo(s / 2 + Math.cos(a) * s * 0.47, s / 2 + Math.sin(a) * s * 0.47); g2.stroke(); } });
    // 24 bat silhouette (also the crows)
    cell(24, (g2, s) => {
      g2.fillStyle = 'rgba(255,255,255,1)'; g2.translate(s / 2, s / 2);
      for (const sx of [-1, 1]) {
        g2.beginPath(); g2.moveTo(sx * s * 0.06, -s * 0.06);
        g2.quadraticCurveTo(sx * s * 0.22, -s * 0.24, sx * s * 0.46, -s * 0.12);
        for (let k = 0; k < 3; k++) { const x0 = sx * s * (0.46 - k * 0.13), x1 = sx * s * (0.33 - k * 0.13); g2.quadraticCurveTo((x0 + x1) / 2, s * 0.02, x1, s * 0.1); }
        g2.lineTo(sx * s * 0.05, s * 0.06); g2.closePath(); g2.fill();
      }
      g2.beginPath(); g2.ellipse(0, 0, s * 0.07, s * 0.13, 0, 0, TAU); g2.fill();
      for (const sx of [-1, 1]) { g2.beginPath(); g2.moveTo(sx * s * 0.02, -s * 0.1); g2.lineTo(sx * s * 0.06, -s * 0.21); g2.lineTo(sx * s * 0.07, -s * 0.08); g2.fill(); }
    });
    // 25 snowflake
    cell(25, (g2, s) => {
      g2.strokeStyle = 'rgba(255,255,255,1)'; g2.lineWidth = s * 0.05; g2.lineCap = 'round'; g2.translate(s / 2, s / 2);
      for (let k = 0; k < 6; k++) { g2.save(); g2.rotate(k * Math.PI / 3); g2.beginPath(); g2.moveTo(0, 0); g2.lineTo(0, -s * 0.4); g2.moveTo(0, -s * 0.24); g2.lineTo(-s * 0.1, -s * 0.33); g2.moveTo(0, -s * 0.24); g2.lineTo(s * 0.1, -s * 0.33); g2.stroke(); g2.restore(); }
    });
    // 26 ghostly skull (souls)
    cell(26, (g2, s) => {
      radial(g2, [[0, 'rgba(255,255,255,0.45)'], [0.5, 'rgba(255,255,255,0.12)'], [1, 'rgba(255,255,255,0)']]);
      g2.fillStyle = 'rgba(255,255,255,1)'; g2.beginPath(); g2.arc(s / 2, s * 0.44, s * 0.22, 0, TAU); g2.fill(); g2.fillRect(s * 0.38, s * 0.55, s * 0.24, s * 0.16);
      g2.globalCompositeOperation = 'destination-out';
      for (const x of [0.41, 0.59]) { g2.beginPath(); g2.ellipse(s * x, s * 0.45, s * 0.065, s * 0.075, 0, 0, TAU); g2.fill(); }
      g2.beginPath(); g2.moveTo(s / 2, s * 0.53); g2.lineTo(s * 0.47, s * 0.6); g2.lineTo(s * 0.53, s * 0.6); g2.fill();
      for (let k = 0; k < 3; k++) g2.fillRect(s * (0.43 + k * 0.05), s * 0.65, s * 0.02, s * 0.06);
    });
    // 27 heart
    cell(27, (g2, s) => { g2.fillStyle = 'rgba(255,255,255,1)'; g2.translate(s / 2, s * 0.56); g2.beginPath(); g2.moveTo(0, s * 0.28); g2.bezierCurveTo(-s * 0.5, -s * 0.05, -s * 0.22, -s * 0.42, 0, -s * 0.16); g2.bezierCurveTo(s * 0.22, -s * 0.42, s * 0.5, -s * 0.05, 0, s * 0.28); g2.fill(); });
    // 28 wedge (sweep warning): a soft 140 degree sector pointing up
    cell(28, (g2, s) => {
      const gr = g2.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2); gr.addColorStop(0, 'rgba(255,255,255,0.15)'); gr.addColorStop(0.85, 'rgba(255,255,255,0.55)'); gr.addColorStop(0.97, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g2.fillStyle = gr; g2.beginPath(); g2.moveTo(s / 2, s / 2); g2.arc(s / 2, s / 2, s / 2, -Math.PI / 2 - 1.22, -Math.PI / 2 + 1.22); g2.closePath(); g2.fill();
    });
    // 29 crescent slash
    cell(29, (g2, s) => { g2.fillStyle = 'rgba(255,255,255,1)'; g2.beginPath(); g2.arc(s / 2, s * 0.62, s * 0.42, Math.PI * 1.1, Math.PI * 1.9); g2.arc(s / 2, s * 0.74, s * 0.38, Math.PI * 1.85, Math.PI * 1.15, true); g2.closePath(); g2.fill(); });
    // 30 hoof print
    cell(30, (g2, s) => { g2.fillStyle = 'rgba(255,255,255,1)'; g2.beginPath(); g2.arc(s / 2, s / 2, s * 0.3, Math.PI * 0.85, Math.PI * 2.15); g2.lineTo(s * 0.62, s * 0.62); g2.arc(s / 2, s / 2, s * 0.14, Math.PI * 2.15, Math.PI * 0.85, true); g2.closePath(); g2.fill(); });
    // 31 garlic clove / petal
    cell(31, (g2, s) => { g2.fillStyle = 'rgba(255,255,255,1)'; g2.beginPath(); g2.moveTo(s / 2, s * 0.12); g2.quadraticCurveTo(s * 0.82, s * 0.55, s / 2, s * 0.88); g2.quadraticCurveTo(s * 0.32, s * 0.55, s / 2, s * 0.12); g2.fill(); });
    this.atlas = new THREE.CanvasTexture(cv);
    this.atlas.colorSpace = THREE.SRGBColorSpace; this.atlas.flipY = false;
  },

  // ---------------------------------------------------------------- arena
  build() {
    const s = this.scene, T = Assets.textures, A = CONFIG.arena;
    // floor
    const floorW = 36;
    const floorGeo = discGeometry(A.floorRadius, 128, 24, (x, z) => [x / floorW + 0.5, z / floorW + 0.5], (x, z) => {
      const r = Math.hypot(x, z); const f = 1 - 0.45 * smooth(clamp((r - 14.8) / 2.2, 0, 1)); return [f, f, f];
    });
    const floorMat = this.floorMat = new THREE.MeshStandardMaterial({ name: 'Floor', map: T.floor, normalMap: T.floorNormal, normalScale: new THREE.Vector2(1.05, 1.05), roughness: 0.84, metalness: 0, color: T.floor ? 0xc4c0c8 : 0x6e6862, vertexColors: true });
    this.floor = new THREE.Mesh(floorGeo, floorMat); this.floor.receiveShadow = true; s.add(this.floor);
    // outside ground fading into darkness
    const groundGeo = ringGeometry(A.floorRadius - 0.3, 75, 96, 8, (x, z) => [x / 6, z / 6], (x, z) => { const r = Math.hypot(x, z); const f = clamp(1 - (r - 18) / 40, 0.08, 1); return [f, f, f]; });
    const groundMat = this.groundMat = new THREE.MeshStandardMaterial({ name: 'Ground', map: T.grass, roughness: 1, metalness: 0, color: T.grass ? 0xffffff : 0x22301c, vertexColors: true });
    const ground = new THREE.Mesh(groundGeo, groundMat); ground.position.y = -0.02; ground.receiveShadow = true; s.add(ground);
    // shiny metal (armour, gold, iron) reflects a soft night sky
    this.envMap = makeGradientEnv(this.renderer, new THREE.Color(0x5a5aa0).multiplyScalar(0.62), new THREE.Color(0x2a1a14).multiplyScalar(0.62));
    for (const key in Assets.models) Assets.models[key].scene.traverse((n) => {
      if (n.isMesh && n.material.metalness > 0.3) { n.material.envMap = this.envMap; n.material.envMapIntensity = 1.05; }
    });
    // stone material for castle pieces: every GLB material called "Stone" gets the castle stone texture
    const stoneMats = this.stoneMats = {};
    // tower roofs: every GLB material called "Roof" gets the wooden shingle texture (roof_shingles.png)
    const roofMat = this.roofMat = T.roof ? new THREE.MeshStandardMaterial({ name: 'Roof', map: T.roof, normalMap: T.roofNormal || null, normalScale: new THREE.Vector2(1, 1), roughness: 0.86, metalness: 0, vertexColors: true }) : null;
    const stoneMap = (m) => {
      if (m.name === 'Roof') return roofMat;
      if (m.name !== 'Stone' || !T.stone) return null;
      const vc = m.vertexColors ? 1 : 0;
      return stoneMats[vc] || (stoneMats[vc] = new THREE.MeshStandardMaterial({ name: 'Stone', map: T.stone, normalMap: T.stoneNormal, normalScale: new THREE.Vector2(1.1, 1.1), roughness: 0.88, metalness: 0, vertexColors: !!vc }));
    };
    const tpl = this.tplFn = (key) => this.tplCache[key] || (this.tplCache[key] = new RigTemplate(Assets.models[key], { materialMap: stoneMap }));
    // walls, towers and the gate
    const R = A.wallRadius;
    const wallMats = [], towerMats = [];
    const ringMat = (theta, r, yOff = 0, scale = 1) => {
      const x = Math.cos(theta) * r, z = Math.sin(theta) * r;
      const yaw = Math.atan2(-Math.cos(theta), -Math.sin(theta));
      return composeYaw(new THREE.Matrix4(), x, yOff, z, yaw, scale);
    };
    const deg = Math.PI / 180;
    for (let k = 0; k < 24; k++) {
      const th = k * 15 * deg;
      const d = ((k * 15) % 360 + 360) % 360;
      if (d === 255 || d === 270 || d === 285) continue; // gate
      wallMats.push(ringMat(th, R));
    }
    for (const ta of A.towerAngles) {
      towerMats.push(ringMat(ta * deg, R + 0.25));
      this.solids.push({ x: Math.cos(ta * deg) * (R + 0.25), z: Math.sin(ta * deg) * (R + 0.25), r: 2.3 });
    }
    this.solids.push({ x: Math.cos(150 * deg) * 15.8, z: Math.sin(150 * deg) * 15.8, r: 0.75 }); // cauldron
    this.addStatic('castle_wall', tpl('castle_wall'), wallMats, { castShadow: true });
    this.towerRig = this.addAnimated('castle_tower', tpl('castle_tower'), towerMats, { castShadow: true });
    this.addStatic('castle_gate', tpl('castle_gate'), [ringMat(-90 * deg, R + 0.35)], { castShadow: true });
    // torches on the inner wall face (+ a pair beside the gate)
    const torchAngles = [0, 45, 90, 135, 180, -135, -45, -99, -81];
    const torchMats = torchAngles.map(a => ringMat(a * deg, A.wallRadius - 0.82, 1.75));
    this.torchRig = this.addAnimated('wall_torch', tpl('wall_torch'), torchMats, { castShadow: false });
    this.torches = torchAngles.map((a, i) => {
      const th = a * deg; const r = A.wallRadius - 1.25;
      return { x: Math.cos(th) * r, z: Math.sin(th) * r, y: 2.45, phase: i * 1.7 };
    });
    for (const [i, a] of [[0, 0], [1, 45], [3, 135], [4, 180], [7, -90]]) {
      const th = a * deg, r = A.wallRadius - 2.0;
      const L = new THREE.PointLight(CONFIG.themes[0].torch, 2.4 * LIGHT.point, 10, 2);
      L.position.set(Math.cos(th) * r, 2.6, Math.sin(th) * r);
      L.userData.base = 2.4; L.userData.phase = i * 2.3;
      this.torchLights.push(L); s.add(L);
    }
    // the jack-o'-lantern on Sir's leg lights its surroundings
    this.pumpkinLight = new THREE.PointLight(0xffb347, 1.5 * LIGHT.point, 6.5, 2);
    this.pumpkinLight.position.set(0, 1, 0); s.add(this.pumpkinLight);
    // soft key light on Sir so he stands out from the floor
    this.heroLight = new THREE.PointLight(0xffe2c0, 1.15 * LIGHT.point, 6.5, 2);
    this.heroLight.position.set(0.6, 3.6, 2.2); s.add(this.heroLight);
    // props inside the courtyard: the set belongs to the castle theme (see buildYard)
    const rnd = mulberry(42);
    this.setTheme(0, true);
    this.cauldronRig = this.addAnimated('cauldron', tpl('cauldron'), [composeYaw(new THREE.Matrix4(), Math.cos(150 * deg) * 15.8, 0, Math.sin(150 * deg) * 15.8, 0, 1.1)], { castShadow: true });
    this.cauldronPos = new THREE.Vector3(Math.cos(150 * deg) * 15.8, 1.0, Math.sin(150 * deg) * 15.8);
    this.cauldronLight = new THREE.PointLight(0x5aff4a, 0.9 * LIGHT.point, 5, 2);
    this.cauldronLight.position.copy(this.cauldronPos); s.add(this.cauldronLight);
    // outside: graveyard (east), pumpkin patch (west), dead trees all around
    const outside = (key, n, a0, a1, r0, r1, sc0 = 0.9, sc1 = 1.2, opts = {}) => {
      const mats = [];
      for (let i = 0; i < n; i++) {
        const a = lerp(a0, a1, rnd()) * deg, r = lerp(r0, r1, rnd());
        mats.push(composeYaw(new THREE.Matrix4(), Math.cos(a) * r, 0, Math.sin(a) * r, rnd() * TAU, lerp(sc0, sc1, rnd())));
      }
      return this.addStatic(key, tpl(key), mats, opts);
    };
    outside('gravestone', 14, -40, 45, 21.5, 29, 0.9, 1.3, { castShadow: false });
    outside('stone_cross', 6, -35, 40, 22, 30, 0.9, 1.3, { castShadow: false });
    outside('pumpkin_plain', 22, 145, 215, 20.5, 28, 0.8, 1.4, { castShadow: false });
    outside('jack_o_lantern', 6, 150, 210, 21, 27, 0.9, 1.3, { castShadow: false });
    outside('scarecrow', 2, 160, 200, 23, 26, 1.0, 1.2, { castShadow: false });
    outside('dead_tree', 14, -180, 180, 21.5, 34, 0.9, 1.5, { castShadow: false });
    outside('bone_pile', 4, 40, 140, 20, 26, 1, 1.3, {});
    // graveyard fence along an arc
    const fence = [];
    for (let a = -38; a <= 44; a += 8.2) { const th = a * deg, r = 20.3; fence.push(composeYaw(new THREE.Matrix4(), Math.cos(th) * r, 0, Math.sin(th) * r, Math.atan2(-Math.cos(th), -Math.sin(th)), 1)); }
    this.addStatic('iron_fence', tpl('iron_fence'), fence, { castShadow: false });
    // bats
    const batTpl = tpl('bat');
    this.batRig = new RigBatch(batTpl, 10, { castShadow: false }).addTo(s);
    for (let i = 0; i < 5; i++) this.bats.push({ r: rand(13, 18), a: rand(0, TAU), h: rand(6, 9.5), speed: rand(0.25, 0.5) * (Math.random() < 0.5 ? -1 : 1), flap: rand(0, TAU), wob: rand(0, TAU), pose: makePose(batTpl) });
    this.batTpl = batTpl;
    // wisps (fog) and fireflies
    for (let i = 0; i < 46; i++) {
      const outer = i < 26;
      const a = rand(0, TAU), r = outer ? rand(18, 32) : rand(14.5, 16.8);
      this.wisps.push({ a, r, y: rand(0.2, 1.4), size: outer ? rand(5, 9) : rand(2.6, 4.5), speed: rand(0.01, 0.035) * (Math.random() < 0.5 ? -1 : 1), alpha: outer ? rand(0.05, 0.12) : rand(0.05, 0.1), hue: Math.random() });
    }
    this.fireflies = [];
    for (let i = 0; i < 26; i++) this.fireflies.push({ x: 0, z: 0, a: rand(0, TAU), r: rand(19, 30), y: rand(0.4, 2.2), ph: rand(0, TAU), sp: rand(0.2, 0.6) });
    // fallen leaves on the floor (ground decals that the pumpkin can push)
    for (let i = 0; i < 60; i++) {
      const a = rand(0, TAU), r = Math.sqrt(rand(0.05, 1)) * 15.4;
      const col = pick([[0.62, 0.26, 0.06], [0.5, 0.16, 0.05], [0.6, 0.4, 0.1], [0.38, 0.2, 0.08], [0.5, 0.1, 0.05]]);
      this.leaves.push({ x: Math.cos(a) * r, z: Math.sin(a) * r, y: 0.03, rot: rand(0, TAU), vx: 0, vz: 0, vy: 0, spin: 0, size: rand(0.42, 0.7), col, air: 0 });
    }
  },

  addStatic(key, tpl, mats, opts = {}) {
    const rig = new RigBatch(tpl, mats.length, opts).addTo(this.scene);
    const tint = opts.tint || [1, 1, 1];
    rig.begin(); for (const m of mats) rig.push(m, null, tint[0], tint[1], tint[2]); rig.end();
    (opts.yard ? this.yardRigs : this.statics).push(rig);
    const glows = opts.yard ? this.yardGlows : this.lanternGlows;
    if (key === 'jack_o_lantern' || key === 'candles' || key === 'pu_hellfire') for (const m of mats) { const e = m.elements; glows.push({ x: e[12], y: e[13] + (key === 'candles' ? 0.5 : 0.4) * Math.hypot(e[0], e[2]), z: e[14], s: key === 'candles' ? 1.1 : key === 'pu_hellfire' ? 2.4 : 1.8, ph: Math.random() * TAU, candle: key === 'candles' }); }
    return rig;
  },

  // ---------------------------------------------------------------- castle themes
  // decoration sets inside the courtyard, one per theme (angles avoid the gate, the towers and the cauldron)
  yardSet(name) {
    const sets = {
      pumpkin: [
        ['hay_bale', 4, [15.8, 16.0], [1, 1]], ['jack_o_lantern', 9, [15.6, 16.2], [0.8, 1.05]], ['pumpkin_plain', 6, [15.9, 16.4], [0.8, 1.2]],
        ['barrel', 4, [16.1, 16.3], [1, 1]], ['candles', 4, [15.7, 16.0], [1, 1]], ['bone_pile', 3, [15.9, 16.1], [1, 1]],
        ['gravestone', 4, [15.4, 16.0], [0.9, 1]], ['stone_cross', 1, [16.3, 16.4], [1, 1]], ['scarecrow', 1, [16.0, 16.0], [1, 1]]],
      haunted: [
        ['gravestone', 6, [15.4, 16.1], [0.9, 1.2]], ['stone_cross', 3, [15.8, 16.3], [0.9, 1.2]], ['grave_obelisk', 2, [15.9, 16.2], [0.9, 1]],
        ['candles', 7, [15.6, 16.0], [1, 1.2]], ['bone_pile', 4, [15.8, 16.1], [1, 1.2]], ['dead_tree', 3, [16.0, 16.4], [0.55, 0.7]], ['hay_bale', 1, [15.9, 15.9], [1, 1]]],
      spider: [
        ['egg_sac', 8, [15.5, 16.2], [1.2, 1.7]], ['bone_pile', 5, [15.8, 16.2], [1, 1.3]], ['barrel', 3, [16.1, 16.3], [1, 1]],
        ['dead_tree', 2, [16.0, 16.3], [0.55, 0.65]], ['candles', 3, [15.7, 16.0], [1, 1], [0.8, 0.6, 1]], ['gravestone', 2, [15.5, 16.0], [0.9, 1]]],
      blood: [
        ['candles', 9, [15.6, 16.1], [1, 1.3], [1.3, 0.5, 0.5]], ['bone_pile', 6, [15.8, 16.2], [1, 1.3]], ['barrel', 3, [16.1, 16.3], [1, 1], [0.8, 0.55, 0.5]],
        ['gravestone', 3, [15.5, 16.0], [0.9, 1.1], [0.9, 0.7, 0.7]], ['jack_o_lantern', 5, [15.6, 16.2], [0.85, 1.05], [1.5, 0.5, 0.5]], ['grave_cross', 2, [15.9, 16.2], [0.9, 1]]],
      frost: [
        ['pumpkin_plain', 7, [15.8, 16.4], [0.8, 1.2], [1.3, 1.45, 1.7]], ['hay_bale', 3, [15.8, 16.0], [1, 1], [1.2, 1.3, 1.5]], ['pu_frost', 5, [15.6, 16.1], [2.0, 2.6]],
        ['candles', 3, [15.7, 16.0], [1, 1.1], [0.7, 0.85, 1.2]], ['dead_tree', 3, [16.0, 16.4], [0.55, 0.7], [1.3, 1.4, 1.6]], ['gravestone', 3, [15.5, 16.0], [0.9, 1.1], [1.1, 1.2, 1.4]]],
      inferno: [
        ['jack_o_lantern', 9, [15.6, 16.2], [0.85, 1.1], [1.4, 0.8, 0.5]], ['pu_hellfire', 5, [15.6, 16.1], [2.2, 2.8]], ['barrel', 4, [16.1, 16.3], [1, 1], [0.6, 0.45, 0.4]],
        ['bone_pile', 5, [15.8, 16.2], [1, 1.3], [0.7, 0.55, 0.5]], ['gravestone', 2, [15.5, 16.0], [0.9, 1.1], [0.5, 0.42, 0.4]], ['grave_obelisk', 2, [15.9, 16.2], [0.9, 1], [0.6, 0.5, 0.45]]],
    };
    return sets[name] || sets.pumpkin;
  },
  clearYard() {
    for (const rig of this.yardRigs) for (const m of rig.meshes) { this.scene.remove(m); }
    this.yardRigs.length = 0; this.yardGlows.length = 0; this.yardSpots = [];
  },
  buildYard(name) {
    this.clearYard();
    const deg = Math.PI / 180, A = CONFIG.arena, rnd = mulberry(1000 + name.length * 97 + name.charCodeAt(0));
    const used = [];
    const free = (a) => {
      const d = ((a + 540) % 360) - 180;
      if (Math.abs(d + 90) < 17) return false;                                 // the gate
      if (Math.abs(d - 150) < 9) return false;                                 // the cauldron
      if (A.towerAngles.some(t => Math.abs(((d - t + 540) % 360) - 180) < 7)) return false;
      return used.every(u => Math.abs(((d - u + 540) % 360) - 180) > 4.5);
    };
    const spot = () => { for (let i = 0; i < 40; i++) { const a = rnd() * 360 - 180; if (free(a)) { used.push(a); return a; } } return rnd() * 360 - 180; };
    for (const [key, n, rr, sc, tint] of this.yardSet(name)) {
      if (!Assets.models[key]) continue;
      const mats = [];
      for (let i = 0; i < n; i++) {
        const a = spot(), th = a * deg, r = lerp(rr[0], rr[1], rnd()), x = Math.cos(th) * r, z = Math.sin(th) * r;
        const yaw = Math.atan2(-x, -z) + (rnd() - 0.5) * 1.2, scl = lerp(sc[0], sc[1], rnd());
        mats.push(composeYaw(new THREE.Matrix4(), x, 0, z, yaw, scl));
        this.yardSpots.push({ x, z });
      }
      this.addStatic(key, this.tplFn(key), mats, { castShadow: key !== 'candles' && key !== 'bone_pile', yard: true, tint });
    }
    // webs and lava cracks live on the floor
    const T = CONFIG.themes[this.themeIndex] || CONFIG.themes[0];
    this.floorMarks = [];
    if (T.ambient === 'webs') for (let i = 0; i < 9; i++) { const a = rnd() * TAU, r = 3 + rnd() * 11; this.floorMarks.push({ x: Math.cos(a) * r, z: Math.sin(a) * r, s: 2.2 + rnd() * 2, rot: rnd() * TAU, ph: rnd() * TAU }); }
    if (T.ambient === 'embers') for (let i = 0; i < 10; i++) { const a = rnd() * TAU, r = 2.5 + rnd() * 11.5; this.floorMarks.push({ x: Math.cos(a) * r, z: Math.sin(a) * r, s: 2.6 + rnd() * 2.2, rot: rnd() * TAU, ph: rnd() * TAU }); }
  },
  themeColors(T) {
    return { stone: new THREE.Color(T.stone), roof: new THREE.Color(T.roof), floor: new THREE.Color(T.floor), ground: new THREE.Color(T.ground), torch: new THREE.Color(T.torch),
      moon: new THREE.Color(T.moon), hemi: new THREE.Color(T.hemi), fog: new THREE.Color(T.fog), bg: new THREE.Color(T.bg),
      glow: T.glow.slice(), lantern: T.lantern.slice(), wisp: [T.wisp[0].slice(), T.wisp[1].slice()], firefly: T.firefly.slice() };
  },
  // start the change to theme i (instant at build time)
  setTheme(i, instant = false) {
    const idx = clamp(i, 0, CONFIG.themes.length - 1), T = CONFIG.themes[idx];
    this.themeIndex = idx; this.theme = T;
    this.themeFrom = this.themeCur || this.themeColors(T); this.themeTo = this.themeColors(T);
    if (!this.themeCur) this.themeCur = this.themeColors(T);
    this.themeK = instant ? 1 : 0; this.themeSwapped = instant;
    if (instant) { this.blendTheme(1); this.buildYard(T.props); }
  },
  blendTheme(k) {
    const a = this.themeFrom, b = this.themeTo, c = this.themeCur, t = smooth(clamp(k, 0, 1));
    for (const key of ['stone', 'roof', 'floor', 'ground', 'torch', 'moon', 'hemi', 'fog', 'bg']) c[key].copy(a[key]).lerp(b[key], t);
    for (const key of ['glow', 'lantern', 'firefly']) for (let i = 0; i < 3; i++) c[key][i] = lerp(a[key][i], b[key][i], t);
    for (let w = 0; w < 2; w++) for (let i = 0; i < 3; i++) c.wisp[w][i] = lerp(a.wisp[w][i], b.wisp[w][i], t);
    for (const key in this.stoneMats) this.stoneMats[key].color.copy(c.stone);
    if (this.roofMat) this.roofMat.color.copy(c.roof);
    if (this.floorMat) this.floorMat.color.copy(c.floor);
    if (this.groundMat) this.groundMat.color.copy(c.ground);
    for (const L of this.torchLights) L.color.copy(c.torch);
    if (this.moon) this.setMood(this.moodP || 0, this.dawn || 0);
  },
  themeTick(dt) {
    if (this.themeK >= 1) return;
    this.themeK = Math.min(1, this.themeK + dt / CONFIG.themeBlend);
    this.blendTheme(this.themeK);
    if (!this.themeSwapped && this.themeK >= 0.45) {
      this.themeSwapped = true;
      this.buildYard(this.theme.props);
      for (const sp of this.yardSpots) FX.smoke(sp.x, 0.4, sp.z, 3, { color: [0.6, 0.55, 0.7], size: 1.0, alpha: 0.45, up: 1.5 });
      flashScreen(0.35, this.theme.flash);
    }
  },
  // the ambient effect of the theme: mist, webs, blood fireflies, snow or embers
  themeAmbient(dt, time) {
    const T = this.theme; if (!T) return;
    const c = this.themeCur, dec = FX.decal;
    if (T.ambient === 'mist') {
      if (Math.random() < dt * 7) { const a = rand(0, TAU), r = Math.sqrt(rand(0.05, 1)) * 15.5; FX.emit({ x: Math.cos(a) * r, y: 0.25, z: Math.sin(a) * r, vx: rand(-0.3, 0.3), vy: 0.08, vz: rand(-0.3, 0.3), life: rand(3, 5), size: 2.2, size1: 4.5, color: [0.5, 0.9, 0.6], alpha: 0.11, frame: 2, layer: 1, fadeIn: 0.4, vrot: rand(-0.2, 0.2) }); }
    } else if (T.ambient === 'webs') {
      for (const w of this.floorMarks) dec.push(w.x, 0.05, w.z, w.s, 0.85, 0.8, 1, 0.3 + 0.06 * Math.sin(time * 1.5 + w.ph), w.rot, 16);
      if (Math.random() < dt * 1.2) { const w = pick(this.floorMarks); if (w) FX.emit({ x: w.x + rand(-0.5, 0.5), y: 0.15, z: w.z + rand(-0.5, 0.5), vy: 0.3, life: 1.2, size: 0.18, color: [0.75, 0.5, 1], alpha: 0.8, frame: 3, layer: 0 }); }
    } else if (T.ambient === 'blood') {
      if (Math.random() < dt * 3) { const a = rand(0, TAU), r = rand(15.2, 16.6); FX.emit({ x: Math.cos(a) * r, y: rand(2.5, 4.5), z: Math.sin(a) * r, vy: -2.5, life: 1.4, size: 0.12, size1: 0.2, color: [0.8, 0.05, 0.1], alpha: 0.9, frame: 10, layer: 1, rot: 0 }); }
    } else if (T.ambient === 'snow') {
      const n = Math.floor(dt * 55 + Math.random());
      for (let i = 0; i < n; i++) { const a = rand(0, TAU), r = Math.sqrt(rand(0, 1)) * 19; FX.emit({ x: Math.cos(a) * r, y: rand(7, 10), z: Math.sin(a) * r, vx: rand(-0.6, 0.6), vy: rand(-2.4, -1.6), vz: rand(-0.6, 0.6), life: rand(3.6, 4.6), size: rand(0.12, 0.22), color: [1, 1, 1], alpha: 0.85, frame: 25, layer: 1, vrot: rand(-2, 2), fadeIn: 0.3 }); }
    } else if (T.ambient === 'embers') {
      for (const m of this.floorMarks) dec.push(m.x, 0.05, m.z, m.s, 1, 0.45, 0.08, 0.5 + 0.3 * Math.sin(time * 3 + m.ph), m.rot, 17);
      if (Math.random() < dt * 14) { const m = pick(this.floorMarks); if (m) FX.emit({ x: m.x + rand(-0.8, 0.8), y: 0.1, z: m.z + rand(-0.8, 0.8), vx: rand(-0.4, 0.4), vy: rand(1.2, 2.6), vz: rand(-0.4, 0.4), life: rand(1.2, 2.4), size: 0.14, size1: 0.03, color: [1, 0.5, 0.1], alpha: 1, frame: 1, layer: 0, drag: 0.3 }); }
      if (Math.random() < dt * 2) { const a = rand(0, TAU), r = Math.sqrt(rand(0, 1)) * 16; FX.emit({ x: Math.cos(a) * r, y: 0.2, z: Math.sin(a) * r, vy: rand(0.4, 0.9), life: rand(2, 3.5), size: 0.1, color: [0.3, 0.25, 0.25], alpha: 0.7, frame: 1, layer: 1 }); }
    }
  },
  addAnimated(key, tpl, mats, opts = {}) {
    const rig = new RigBatch(tpl, mats.length, opts).addTo(this.scene);
    const items = mats.map(m => ({ mat: m, pose: makePose(tpl), ph: Math.random() * TAU }));
    this.animated.push({ key, rig, tpl, items });
    return rig;
  },

  // ---------------------------------------------------------------- per frame
  update(dt, time) {
    this.themeTick(dt);
    const TC = this.themeCur;
    // animated props
    for (const a of this.animated) {
      const tp = a.tpl; a.rig.begin();
      for (const it of a.items) {
        resetPose(it.pose);
        if (a.key === 'castle_tower') { const f = tp.part('Flag'); if (f >= 0) { const o = f * POSE_STRIDE; it.pose[o + 1] = Math.sin(time * 2.2 + it.ph) * 0.35; it.pose[o + 2] = Math.sin(time * 5.1 + it.ph) * 0.05; } }
        if (a.key === 'wall_torch') { const f = tp.part('Flame'); if (f >= 0) { const o = f * POSE_STRIDE; const fl = 0.85 + 0.25 * Math.sin(time * 13 + it.ph) + 0.12 * Math.sin(time * 31 + it.ph * 2); it.pose[o + 6] = 0.9 + 0.1 * Math.sin(time * 9 + it.ph); it.pose[o + 7] = fl; it.pose[o + 8] = 0.9 + 0.1 * Math.cos(time * 11 + it.ph); it.pose[o + 2] = Math.sin(time * 7 + it.ph) * 0.12; } }
        if (a.key === 'cauldron') { const f = tp.part('Brew'); if (f >= 0) { const o = f * POSE_STRIDE; it.pose[o + 4] = Math.sin(time * 3) * 0.02; it.pose[o + 1] = time * 0.4; } }
        a.rig.push(it.mat, it.pose);
      }
      a.rig.end();
    }
    // torch lights flicker
    for (const L of this.torchLights) { const u = L.userData; L.intensity = u.base * LIGHT.point * (0.85 + 0.12 * Math.sin(time * 11 + u.phase) + 0.08 * Math.sin(time * 23.7 + u.phase * 3)); }
    this.cauldronLight.intensity = (0.8 + 0.2 * Math.sin(time * 2.3)) * LIGHT.point;
    // bats circle overhead
    const bt = this.batTpl, wl = bt.part('WingL'), wr = bt.part('WingR');
    this.batRig.begin();
    for (const b of this.bats) {
      b.a += b.speed * dt * (1 + 0.3 * Math.sin(time * 0.7 + b.wob));
      const x = Math.cos(b.a) * b.r, z = Math.sin(b.a) * b.r, y = b.h + Math.sin(time * 1.3 + b.wob) * 0.6;
      const yaw = Math.atan2(-Math.sin(b.a) * Math.sign(b.speed), Math.cos(b.a) * Math.sign(b.speed));
      resetPose(b.pose); const fl = Math.sin(time * 14 + b.flap) * 0.9;
      if (wl >= 0) b.pose[wl * POSE_STRIDE + 2] = fl; if (wr >= 0) b.pose[wr * POSE_STRIDE + 2] = -fl;
      composeYaw(_m1, x, y, z, yaw, 1.3);
      this.batRig.push(_m1, b.pose);
    }
    this.batRig.end();
    // ambient sprites: torch glows, lantern glows, fog wisps, fireflies, leaves
    const add = FX.add, alp = FX.alpha, dec = FX.decal;
    const gl = TC.glow, ln = TC.lantern;
    for (const tc of this.torches) {
      const f = 0.8 + 0.2 * Math.sin(time * 12 + tc.phase);
      add.push(tc.x, tc.y, tc.z, 2.6 * f, gl[0], gl[1], gl[2], 0.55, 0, 0);
      add.push(tc.x, tc.y + 0.05, tc.z, 0.8 * f, Math.min(1, gl[0] + 0.3), Math.min(1, gl[1] + 0.35), Math.min(1, gl[2] + 0.3), 0.8, 0, 0);
      if (Math.random() < dt * 2.5) FX.spark(tc.x + rand(-0.1, 0.1), tc.y + 0.2, tc.z + rand(-0.1, 0.1), rand(-0.3, 0.3), rand(0.8, 1.6), rand(-0.3, 0.3), gl, rand(0.6, 1.2), 0.12, -0.5);
    }
    for (const lg of this.lanternGlows) {
      const f = 0.85 + 0.15 * Math.sin(time * (lg.candle ? 9 : 4) + lg.ph);
      add.push(lg.x, lg.y, lg.z, lg.s * f, 1.0, 0.55, 0.15, 0.32, 0, 0);
    }
    for (const lg of this.yardGlows) {
      const f = 0.85 + 0.15 * Math.sin(time * (lg.candle ? 9 : 4) + lg.ph);
      add.push(lg.x, lg.y, lg.z, lg.s * f, ln[0], ln[1], ln[2], 0.32, 0, 0);
    }
    this.themeAmbient(dt, time);
    // cauldron glow + bubbles
    const cp = this.cauldronPos;
    add.push(cp.x, cp.y, cp.z, 2.4, 0.3, 1.0, 0.3, 0.35, 0, 0);
    if (Math.random() < dt * 3) FX.spark(cp.x + rand(-0.3, 0.3), cp.y, cp.z + rand(-0.3, 0.3), 0, rand(0.4, 0.9), 0, [0.4, 1, 0.35], rand(0.8, 1.4), 0.14, -0.2, 1);
    for (const w of this.wisps) {
      w.a += w.speed * dt;
      const x = Math.cos(w.a) * w.r, z = Math.sin(w.a) * w.r;
      const pulse = 0.75 + 0.25 * Math.sin(time * 0.5 + w.hue * 10);
      const col = w.hue < 0.5 ? TC.wisp[0] : TC.wisp[1];
      alp.push(x, w.y, z, w.size, col[0], col[1], col[2], w.alpha * pulse * this.fogAmount(), time * 0.05 + w.hue * 6, 2);
    }
    for (const f of this.fireflies) {
      f.a += f.sp * dt * 0.05; const x = Math.cos(f.a) * f.r + Math.sin(time * f.sp + f.ph) * 0.8, z = Math.sin(f.a) * f.r + Math.cos(time * f.sp * 1.3 + f.ph) * 0.8;
      const blink = Math.max(0, Math.sin(time * 1.7 + f.ph * 3));
      add.push(x, f.y + Math.sin(time + f.ph) * 0.3, z, 0.55, TC.firefly[0], TC.firefly[1], TC.firefly[2], blink * 0.9, 0, 0);
    }
    this.updateLeaves(dt, time);
  },
  fogAmount() { return 1 - (this.dawn || 0) * 0.7; },

  updateLeaves(dt, time) {
    const P = Pumpkin, hs = Math.hypot(Hero.vx, Hero.vz);
    for (const l of this.leaves) {
      // Sir's boots shuffle the leaves
      if (hs > 1.2) {
        const dx = l.x - Hero.x, dz = l.z - Hero.z, d2 = dx * dx + dz * dz;
        if (d2 < 0.55) { const d = Math.sqrt(d2) || 1; l.vx += (dx / d * 0.8 + Hero.vx * 0.25) * 0.5; l.vz += (dz / d * 0.8 + Hero.vz * 0.25) * 0.5; l.vy = Math.max(l.vy, rand(0.6, 1.4)); l.spin = rand(-8, 8); }
      }
      if (P.free) {
        const dx = l.x - P.x, dz = l.z - P.z; const d2 = dx * dx + dz * dz; const r = P.radius + 0.9;
        if (d2 < r * r) {
          const sp = Math.hypot(P.vx, P.vz);
          if (sp > 3) { const d = Math.sqrt(d2) || 1; l.vx += (dx / d * 0.6 + P.vx * 0.12) * (sp * 0.15); l.vz += (dz / d * 0.6 + P.vz * 0.12) * (sp * 0.15); l.vy = Math.max(l.vy, rand(1.5, 3.5)); l.spin = rand(-12, 12); }
        }
      }
      if (l.vx || l.vz || l.vy || l.y > 0.031) {
        l.vy -= 9 * dt; l.y += l.vy * dt;
        if (l.y <= 0.03) { l.y = 0.03; l.vy = 0; l.vx *= 0.5; l.vz *= 0.5; l.spin *= 0.5; }
        const drag = Math.exp(-(l.y > 0.05 ? 1.5 : 6) * dt); l.vx *= drag; l.vz *= drag;
        l.x += l.vx * dt; l.z += l.vz * dt; l.rot += l.spin * dt;
        if (Math.abs(l.vx) + Math.abs(l.vz) < 0.02 && l.y <= 0.031) { l.vx = l.vz = 0; }
        const rr = Math.hypot(l.x, l.z); if (rr > 16.2) { l.x *= 16.2 / rr; l.z *= 16.2 / rr; }
      }
      const layer = l.y > 0.06 ? FX.alpha : FX.decalA;
      layer.push(l.x, l.y, l.z, l.size, l.col[0], l.col[1], l.col[2], 0.95, l.rot, 6);
    }
  },

  setMood(p, dawn) {
    // p: night progress 0..1, dawn: 0..1 sunrise blend; the night colours come from the castle theme
    const s = this.scene, M = MOOD, TC = this.themeCur || this.themeColors(CONFIG.themes[0]);
    const deep = Math.sin(clamp(p, 0, 1) * Math.PI); // darkest mid-night
    this.hemi.color.copy(TC.hemi).multiplyScalar(lerp(1, 0.8, deep)).lerp(M.dawnSky, dawn);
    this.hemi.intensity = lerp(0.62, 0.95, dawn) * LIGHT.ambient;
    this.moon.color.copy(TC.moon).lerp(M.sun, dawn);
    this.moon.intensity = lerp(1.25, 2.6, dawn) * LIGHT.sun;
    s.background.copy(TC.bg).lerp(M.bgDawn, dawn);
    s.fog.color.copy(TC.fog).lerp(M.fogDawn, dawn);
    for (const L of this.torchLights) L.userData.base = lerp(2.4, 0.6, dawn);
    this.moodP = p; this.dawn = dawn;
  },

  // compile every shader up front (hidden enemy and candy meshes too) so the first waves do not stutter
  async warmup() {
    const hidden = [];
    this.scene.traverse((o) => { if (o.isInstancedMesh && !o.visible) { hidden.push(o); o.visible = true; o.count = 1; } });
    try { await this.renderer.compileAsync(this.scene, this.camera); }
    catch (e) { console.warn('shader warmup', e); }
    this.renderer.render(this.scene, this.camera); // also builds the shadow map shaders (hidden behind the loading screen)
    for (const o of hidden) { o.visible = false; o.count = 0; }
  },

  render() {
    this.camera.lookAt(this.camTarget);
    FX.flush();
    this.renderer.render(this.scene, this.camera);
  },
};

const _pv = new THREE.Vector3();
// colours for the night to dawn change
const MOOD = {
  dawnSky: new THREE.Color(0xffb08a), moon: new THREE.Color(0xa8b8ff), sun: new THREE.Color(0xffc890),
  bgNight: new THREE.Color(0x0b0714), bgDawn: new THREE.Color(0x6a4a6a),
  fogNight: new THREE.Color(0x120a1e), fogDawn: new THREE.Color(0x9a6a7a),
};

function mulberry(seed) {
  let s = seed >>> 0;
  return () => { s |= 0; s = (s + 0x6D2B79F5) | 0; let q = Math.imul(s ^ (s >>> 15), 1 | s); q = (q + Math.imul(q ^ (q >>> 7), 61 | q)) ^ q; return ((q ^ (q >>> 14)) >>> 0) / 4294967296; };
}

// =====================================================================
// 9. FX: particles, ground decals, floating texts, shake and flash
// Sprite atlas frames: 0 glow, 1 dot, 2 smoke, 3 spark, 4 ring, 5 flame,
// 6 leaf, 7 shock ring, 8 arrow, 9 dashed circle, 10 seed, 11 blob,
// 12 plus, 13 scorch, 14 bone chip, 15 rune ring, 16 spider web, 17 ground cracks,
// 18 splash puddle, 19 claw slash, 20 bandage strip, 21 stone chip, 22 bubble, 23 target
// =====================================================================
const FX = {
  add: null, alpha: null, decal: null, decalA: null,
  cap: 2600, n: 0,
  init(scene, atlas) {
    this.decalA = new SpriteLayer(900, { atlas, cols: 4, rows: 8, blending: 'normal', ground: true, order: -2 });
    this.decal = new SpriteLayer(700, { atlas, cols: 4, rows: 8, blending: 'additive', ground: true, order: -1 });
    this.alpha = new SpriteLayer(1600, { atlas, cols: 4, rows: 8, blending: 'normal', order: 1 });
    this.add = new SpriteLayer(3200, { atlas, cols: 4, rows: 8, blending: 'additive', order: 2 });
    this.layers = [this.add, this.alpha, this.decal, this.decalA];
    for (const l of this.layers) scene.add(l.mesh);
    const N = this.cap;
    this.p = {
      x: new Float32Array(N), y: new Float32Array(N), z: new Float32Array(N), vx: new Float32Array(N), vy: new Float32Array(N), vz: new Float32Array(N),
      age: new Float32Array(N), life: new Float32Array(N), s0: new Float32Array(N), s1: new Float32Array(N),
      r: new Float32Array(N), g: new Float32Array(N), b: new Float32Array(N), a: new Float32Array(N),
      frame: new Uint8Array(N), grav: new Float32Array(N), drag: new Float32Array(N), layer: new Uint8Array(N),
      rot: new Float32Array(N), vrot: new Float32Array(N), bounce: new Uint8Array(N), fadeIn: new Float32Array(N),
    };
    this.texts = []; this.textPool = [];
    this.textHost = document.getElementById('floaters');
  },
  begin() { for (const l of this.layers) l.clear(); },
  flush() { for (const l of this.layers) l.flush(); },
  emit(o) {
    if (this.n >= this.cap) return;
    const i = this.n++, P = this.p;
    P.x[i] = o.x; P.y[i] = o.y; P.z[i] = o.z; P.vx[i] = o.vx || 0; P.vy[i] = o.vy || 0; P.vz[i] = o.vz || 0;
    P.age[i] = 0; P.life[i] = o.life || 1; P.s0[i] = o.size ?? 0.3; P.s1[i] = o.size1 ?? P.s0[i];
    const c = o.color || [1, 1, 1]; P.r[i] = c[0]; P.g[i] = c[1]; P.b[i] = c[2]; P.a[i] = o.alpha ?? 1;
    P.frame[i] = o.frame ?? 0; P.grav[i] = o.gravity ?? 0; P.drag[i] = o.drag ?? 0; P.layer[i] = o.layer ?? 0;
    P.rot[i] = o.rot ?? Math.random() * TAU; P.vrot[i] = o.vrot ?? 0; P.bounce[i] = o.bounce ? 1 : 0; P.fadeIn[i] = o.fadeIn || 0;
  },
  spark(x, y, z, vx, vy, vz, color, life = 0.6, size = 0.15, gravity = -6, frame = 3) {
    this.emit({ x, y, z, vx, vy, vz, color, life, size, size1: size * 0.3, gravity, frame, drag: 0.5, layer: 0 });
  },
  burst(x, y, z, count, o = {}) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * TAU, sp = rand(o.speedMin ?? 2, o.speed ?? 6), up = rand(o.upMin ?? 1, o.up ?? 5);
      this.emit({ x: x + rand(-0.1, 0.1), y, z: z + rand(-0.1, 0.1), vx: Math.cos(a) * sp, vy: up, vz: Math.sin(a) * sp, life: rand(o.lifeMin ?? 0.4, o.life ?? 0.9), size: rand(o.sizeMin ?? 0.08, o.size ?? 0.2), size1: o.size1 ?? 0.02, color: o.color || [1, 0.7, 0.3], gravity: o.gravity ?? -12, drag: o.drag ?? 1, frame: o.frame ?? 3, layer: o.layer ?? 0, vrot: rand(-8, 8), bounce: o.bounce });
    }
  },
  smoke(x, y, z, count, o = {}) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * TAU, sp = rand(0.3, o.speed ?? 1.6);
      this.emit({ x: x + rand(-0.2, 0.2), y: y + rand(0, 0.3), z: z + rand(-0.2, 0.2), vx: Math.cos(a) * sp, vy: rand(0.3, o.up ?? 1.4), vz: Math.sin(a) * sp, life: rand(0.6, o.life ?? 1.3), size: rand(0.4, o.size ?? 0.9), size1: (o.size ?? 0.9) * 2.2, color: o.color || [0.45, 0.42, 0.5], alpha: o.alpha ?? 0.45, frame: 2, drag: 1.5, layer: 1, vrot: rand(-1, 1) });
    }
  },
  ring(x, z, r0, r1, color, life = 0.5, alpha = 1, frame = 7, layer = 2) {
    this.emit({ x, y: 0.06, z, size: r0 * 2, size1: r1 * 2, color, alpha, life, frame, layer, rot: 0 });
  },
  // a lightning bolt: a jagged chain of bright dots from a to b (n joints), with a glow at both ends
  bolt(x0, y0, z0, x1, y1, z1, n = 8, color = [0.85, 0.92, 1]) {
    const dx = x1 - x0, dy = y1 - y0, dz = z1 - z0, len = Math.hypot(dx, dy, dz) || 1;
    const px = -dz / len, pz = dx / len; // sideways
    let jx = 0, jz = 0;
    for (let i = 0; i <= n; i++) {
      const k = i / n, kk = Math.sin(k * Math.PI);
      if (i > 0 && i < n) { jx = (Math.random() - 0.5) * 0.9 * kk; jz = (Math.random() - 0.5) * 0.9 * kk; } else { jx = 0; jz = 0; }
      const x = x0 + dx * k + px * jx + (Math.random() - 0.5) * 0.3 * kk, y = y0 + dy * k, z = z0 + dz * k + pz * jz + (Math.random() - 0.5) * 0.3 * kk;
      // fill the gap to the previous joint with dots
      if (i > 0) { const q = this._boltPrev; const steps = Math.max(2, Math.round(Math.hypot(x - q[0], y - q[1], z - q[2]) / 0.22)); for (let s2 = 1; s2 <= steps; s2++) { const t = s2 / steps; this.emit({ x: q[0] + (x - q[0]) * t, y: q[1] + (y - q[1]) * t, z: q[2] + (z - q[2]) * t, life: 0.11 + Math.random() * 0.05, size: 0.22, size1: 0.05, color, alpha: 1, frame: 1, layer: 0 }); if (s2 % 2 === 0) this.emit({ x: q[0] + (x - q[0]) * t, y: q[1] + (y - q[1]) * t, z: q[2] + (z - q[2]) * t, life: 0.12, size: 0.7, size1: 0.2, color, alpha: 0.35, frame: 0, layer: 0 }); } }
      this._boltPrev = [x, y, z];
    }
    this.emit({ x: x1, y: y1, z: z1, life: 0.16, size: 1.6, size1: 0.4, color: [1, 1, 1], alpha: 0.9, frame: 0, layer: 0 });
  },
  update(dt) {
    const P = this.p; let n = this.n;
    for (let i = 0; i < n; i++) {
      P.age[i] += dt;
      if (P.age[i] >= P.life[i]) { // swap remove
        n--; for (const k in P) P[k][i] = P[k][n];
        i--; continue;
      }
      const d = Math.exp(-P.drag[i] * dt);
      P.vx[i] *= d; P.vz[i] *= d; P.vy[i] = P.vy[i] * d + P.grav[i] * dt;
      P.x[i] += P.vx[i] * dt; P.y[i] += P.vy[i] * dt; P.z[i] += P.vz[i] * dt;
      if (P.bounce[i] && P.y[i] < 0.05) { P.y[i] = 0.05; P.vy[i] *= -0.35; P.vx[i] *= 0.6; P.vz[i] *= 0.6; P.vrot[i] *= 0.5; }
      P.rot[i] += P.vrot[i] * dt;
    }
    this.n = n;
    for (let i = 0; i < n; i++) {
      const k = P.age[i] / P.life[i];
      const size = P.s0[i] + (P.s1[i] - P.s0[i]) * k;
      let a = P.a[i] * (1 - k * k);
      if (P.fadeIn[i] > 0) a *= Math.min(1, P.age[i] / P.fadeIn[i]);
      this.layers[P.layer[i]].push(P.x[i], P.y[i], P.z[i], size, P.r[i], P.g[i], P.b[i], a, P.rot[i], P.frame[i]);
    }
    this.updateTexts(dt);
  },
  clearParticles() { this.n = 0; },

  // ---------------- floating texts (DOM) ----------------
  text(str, x, y, z, cls = 'pop', life = 0.9) {
    if (!this.textHost) return;
    if (this.texts.length > 18) { const old = this.texts.shift(); old.el.style.display = 'none'; this.textPool.push(old.el); }
    let el = this.textPool.pop();
    if (!el) { el = document.createElement('div'); this.textHost.appendChild(el); }
    el.className = 'floater ' + cls; el.textContent = str; el.style.display = 'block';
    el.style.setProperty('--tilt', G.mobile ? '0deg' : rand(-12, 12).toFixed(1) + 'deg');
    this.texts.push({ el, x, y, z, age: 0, life, vy: 1.4 });
  },
  updateTexts(dt) {
    const W = World.width, H = World.height;
    for (let i = this.texts.length - 1; i >= 0; i--) {
      const tx = this.texts[i]; tx.age += dt; tx.y += tx.vy * dt; tx.vy *= Math.exp(-2 * dt);
      if (tx.age >= tx.life) { tx.el.style.display = 'none'; this.textPool.push(tx.el); this.texts.splice(i, 1); continue; }
      _v1.set(tx.x, tx.y, tx.z); World.project(_v1, _v2);
      const sx = (_v2.x * 0.5 + 0.5) * W, sy = (-_v2.y * 0.5 + 0.5) * H;
      const k = tx.age / tx.life; const sc = k < 0.15 ? easeOutBack(k / 0.15) : 1; const op = k > 0.7 ? 1 - (k - 0.7) / 0.3 : 1;
      tx.el.style.transform = `translate(${sx.toFixed(1)}px, ${sy.toFixed(1)}px) translate(-50%, -50%) rotate(var(--tilt)) scale(${sc.toFixed(3)})`;
      tx.el.style.opacity = op.toFixed(3);
    }
  },
  clearTexts() { for (const tx of this.texts) { tx.el.style.display = 'none'; this.textPool.push(tx.el); } this.texts.length = 0; },
};

// camera shake / flash helpers
function addShake(a) { G.shake = Math.min(1.2, G.shake + a); }
function flashScreen(strength = 0.6, color = '#fff3d0') { G.flash = Math.max(G.flash, strength); const el = document.getElementById('flash'); if (el) el.style.background = color; }
// short freeze on a big hit; small ones are spaced out so a swing through a crowd never stutters
function hitstop(sec) {
  if (sec < 0.07 && G.realTime - (G.hitstopT ?? -9) < 0.3) return;
  G.hitstopT = G.realTime; G.hitstop = Math.max(G.hitstop, sec);
}
function slowmo(sec, scale = 0.35) { G.slowmo = Math.max(G.slowmo, sec); G.slowmoScale = scale; }

// =====================================================================
// 10. HERO: Sir Rolls-A-Lot (procedurally animated GLB parts)
// =====================================================================
const _tint = new THREE.Color();

// Cartoon look for Sir (like Sir Falls-A-Lot): toon shading in three light
// bands, a soft rim light around the edges and ink outlines of constant width.
const TOON = {
  gradient: null, outline: null,
  rim: new THREE.Color(0.42, 0.46, 0.8),   // rim light colour (moonlight)
  outlinePx: 1.7,                          // outline width in screen pixels
  albedo: 0.5,                             // toon colours are darkened so the night lights do not burn them white
  lightClamp: 2.5,                         // no single light can push Sir brighter than this (the pumpkin lantern is very close)
  init() {
    const g = this.gradient = new THREE.DataTexture(new Uint8Array([80, 165, 255]), 3, 1, THREE.RedFormat);
    g.minFilter = g.magFilter = THREE.NearestFilter; g.generateMipmaps = false; g.needsUpdate = true;
    this.outline = new THREE.ShaderMaterial({
      uniforms: { uWidth: { value: 0.004 }, uAspect: { value: 1 }, uColor: { value: new THREE.Color(0x160b16) } },
      vertexShader: /* glsl */`
        uniform float uWidth;
        uniform float uAspect;
        void main() {
          vec4 clip = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          vec2 dir = (projectionMatrix * vec4(normalize(normalMatrix * normal), 0.0)).xy;
          float l = length(dir);
          if (l > 1e-5) clip.xy += dir / l * vec2(uWidth / uAspect, uWidth) * clip.w;
          gl_Position = clip;
        }`,
      fragmentShader: /* glsl */`
        uniform vec3 uColor;
        void main() {
          gl_FragColor = vec4(uColor, 1.0);
          #include <colorspace_fragment>
        }`,
      side: THREE.BackSide,
    });
  },
  // MeshToonMaterial with the same colours as the GLB material, plus the rim light
  material(m) {
    const t = new THREE.MeshToonMaterial({
      name: m.name, color: m.color.clone().multiplyScalar(this.albedo), map: m.map, vertexColors: m.vertexColors, gradientMap: this.gradient,
      emissive: m.emissive.clone(), emissiveIntensity: m.emissiveIntensity, emissiveMap: m.emissiveMap,
      side: m.side, transparent: m.transparent, opacity: m.opacity,
    });
    const clampLight = THREE.ShaderChunk.lights_toon_pars_fragment.replace('* directLight.color;', `* min( directLight.color, vec3( ${this.lightClamp.toFixed(2)} ) );`);
    t.onBeforeCompile = (sh) => {
      sh.uniforms.uRim = { value: this.rim };
      sh.fragmentShader = 'uniform vec3 uRim;\n' + sh.fragmentShader.replace('#include <lights_toon_pars_fragment>', clampLight).replace('#include <opaque_fragment>',
        'outgoingLight += uRim * pow(1.0 - saturate(dot(normal, normalize(vViewPosition))), 2.5) * (0.35 + 0.65 * diffuseColor.rgb);\n#include <opaque_fragment>');
    };
    return t;
  },
  // inverted hull: a black copy of every mesh, pushed outwards and drawn from the inside
  addOutlines(root) {
    const meshes = [];
    root.traverse((n) => { if (n.isMesh && n.material.name !== 'shine') meshes.push(n); });
    for (const m of meshes) {
      const o = new THREE.Mesh(m.geometry, this.outline);
      o.castShadow = false; o.receiveShadow = false;
      m.add(o);
    }
  },
  update() {
    const u = this.outline.uniforms;
    u.uWidth.value = 2 * this.outlinePx / Math.max(1, World.height);
    u.uAspect.value = World.width / Math.max(1, World.height);
  },
};

const Hero = {
  root: null, nodes: {}, rest: {}, meshes: [],
  x: 0, z: 0, vx: 0, vz: 0,            // position and velocity on the courtyard floor
  walkPh: 0, walkAmt: 0, stepAcc: 0, stepSide: 1, walked: 0, slowT: 0,
  yaw: 0, aimPower: 0, aiming: false, aimW: 0,
  tension: 0, wobble: 0, stumbleT: 0,
  kickT: 9, yankT: 9, yankSide: 0, pullT: 9, hurtT: 9, catchT: 9, victoryT: -1, deadT: -1,
  plume: { ax: 0, az: 0, vx: 0, vz: 0 },
  lastBodyRot: [0, 0, 0],
  _o: { x: 0, z: 0 },

  init(scene) {
    this.root = Assets.models.hero.scene.clone();
    scene.add(this.root);
    const names = ['Body', 'Head', 'ArmL', 'ArmR', 'LegL', 'LegR', 'Cape', 'Plume', 'RopeAnchor', 'Eyes', 'EyesX'];
    TOON.init();
    const own = new Map(); // Sir gets his own toon copies of the materials (also used for the red hurt flash)
    this.root.traverse((n) => {
      const nm = gltfName(n);
      if (nm && names.includes(nm) && !this.nodes[nm]) { this.nodes[nm] = n; this.rest[nm] = { p: n.position.clone(), q: n.quaternion.clone(), s: n.scale.clone() }; }
      if (n.isMesh) {
        n.castShadow = true; n.receiveShadow = true; this.meshes.push(n);
        if (!own.has(n.material)) { const m = TOON.material(n.material); m.userData.baseColor = m.color.clone(); own.set(n.material, m); }
        n.material = own.get(n.material);
      }
    });
    TOON.addOutlines(this.root);
    this.materials = [...own.values()];
    this.tinted = false;
    this.sq = { x: 1, v: 0 };            // squash and stretch spring
    this.blinkT = 2; this.lookT = 3; this.look = 0; this.lookTarget = 0;
    this.reset();
  },
  reset() {
    this.yaw = 0; this.aimPower = 0; this.aiming = false; this.aimW = 0; this.tension = 0; this.wobble = 0; this.stumbleT = 0;
    this.kickT = this.yankT = this.pullT = this.hurtT = this.catchT = 9; this.victoryT = -1; this.deadT = -1;
    this.x = this.z = this.vx = this.vz = 0; this.walkPh = 0; this.walkAmt = 0; this.stepAcc = 0; this.walked = 0; this.slowT = 0;
    this.root.position.set(0, 0, 0); this.root.quaternion.identity(); this.targetYaw = 0;
    if (this.sq) { this.sq.x = 1; this.sq.v = 0; }
  },
  get stumbling() { return this.stumbleT > 0; },
  get speed() { return Math.hypot(this.vx, this.vz); },
  facingTo(x, z) { if (x * x + z * z > 0.01) this.targetYaw = Math.atan2(x, z); },
  addWobble(w) {
    if (this.stumbleT > 0 || G.state !== 'playing') return;
    this.wobble += w * G.stats.wobbleMult;
    if (this.wobble >= 1) {
      this.wobble = 0.35; this.stumbleT = CONFIG.stumble.duration;
      SFX.play('stumble'); FX.text(t('whoa'), this.x, 2.6, this.z, 'whoa', 1.0);
      Input.cancelSteer();
    }
  },

  // Walking: WASD / arrow keys or the touch stick (Input.move), blocked by walls, stones and the boss
  move(dt) {
    const C = CONFIG.hero;
    const canMove = G.state === 'playing' && this.stumbleT <= 0 && this.deadT < 0 && this.victoryT < 0;
    const ix = canMove ? Input.move.x : 0, iz = canMove ? Input.move.z : 0;
    this.slowT = Math.max(0, this.slowT - dt);
    const speed = C.moveSpeed * (this.aiming ? C.aimMoveMult : 1) * (this.slowT > 0 ? 0.5 : 1);
    const tvx = ix * speed, tvz = iz * speed;
    const dvx = tvx - this.vx, dvz = tvz - this.vz, dl = Math.hypot(dvx, dvz);
    const rate = (ix || iz ? C.moveAccel : C.moveStop) * dt;
    if (dl <= rate) { this.vx = tvx; this.vz = tvz; } else { this.vx += dvx / dl * rate; this.vz += dvz / dl * rate; }
    let px = this.vx * dt, pz = this.vz * dt;
    // a stretched band tugs Sir towards the pumpkin
    if (Pumpkin.free && G.state === 'playing') {
      const k = clamp((Pumpkin.stretch - 0.35) / 0.65, 0, 1);
      if (k > 0) { const dx = Pumpkin.x - this.x, dz = Pumpkin.z - this.z, d = Math.hypot(dx, dz) || 1; px += dx / d * C.bandDrag * k * dt; pz += dz / d * C.bandDrag * k * dt; }
    }
    const o = this._o; o.x = this.x + px; o.z = this.z + pz;
    const r = C.radius * 0.8;
    const n1 = World.solidPush(o, r), n2 = Obstacles.push(o, r);
    const boss = Enemies.boss;
    if (boss && boss.alive && boss.state !== 'under') {
      const dx = o.x - boss.x, dz = o.z - boss.z, dd = Math.hypot(dx, dz), rr = boss.radius * boss.scale * 0.85 + r;
      if (dd < rr && dd > 1e-4) { o.x = boss.x + dx / dd * rr; o.z = boss.z + dz / dd * rr; }
    }
    // sliding along whatever stopped us: drop the velocity into it
    for (const n of [n1, n2]) if (n) { const vn = this.vx * n.x + this.vz * n.z; if (vn < 0) { this.vx -= n.x * vn; this.vz -= n.z * vn; } }
    const moved = Math.hypot(o.x - this.x, o.z - this.z);
    this.x = o.x; this.z = o.z;
    // walk cycle, footsteps and facing
    const sp = Math.min(Math.hypot(this.vx, this.vz), moved / Math.max(dt, 1e-4));
    this.walkAmt = damp(this.walkAmt, clamp(sp / C.moveSpeed, 0, 1), 10, dt);
    this.walkPh += sp * dt * Math.PI / C.stepLength;
    if (canMove && sp > 0.5) {
      this.walked += sp * dt;
      if (!G.tutorial.moved && this.walked > 2.5) { G.tutorial.moved = true; UI.refreshHint(); }
      this.stepAcc += sp * dt;
      if (this.stepAcc >= C.stepLength) {
        this.stepAcc -= C.stepLength; this.stepSide = -this.stepSide;
        const c = Math.cos(this.yaw), s = Math.sin(this.yaw);
        FX.smoke(this.x - c * 0.14 * this.stepSide, 0.05, this.z + s * 0.14 * this.stepSide, 1, { size: 0.32, alpha: 0.2, up: 0.4, speed: 0.4, color: [0.42, 0.38, 0.4] });
        SFX.play('step', { gap: 0.12, side: this.stepSide });
      }
    }
    if (sp > 0.4 && !this.aiming && !Pumpkin.free) this.facingTo(this.vx, this.vz);
  },
  kick(power) { this.kickT = 0; this.kickPower = power; this.squash(1.12 + 0.12 * power); },
  yank(side) { this.yankT = 0; this.yankSide = side; this.plume.vz += side * 7; this.squash(0.88); },
  pull() { this.pullT = 0; this.plume.vx -= 9; this.squash(0.84); },
  hurt() { this.hurtT = 0; this.squash(0.78); },
  caught() { this.catchT = 0; this.squash(0.82); },
  // cartoon squash (below 1) or stretch (above 1), springs back on its own
  squash(v) { this.sq.x = v; this.sq.v = 0; },
  // world direction -> -1/1 on the hero's left/right axis
  localSide(dx, dz) { const c = Math.cos(this.yaw), s = Math.sin(this.yaw); return Math.sign(dx * c - dz * s) || 1; },

  update(dt) {
    const time = G.realTime;
    this.move(dt);
    if (this.targetYaw !== undefined && this.deadT < 0) this.yaw = angleLerp(this.yaw, this.targetYaw, 1 - Math.exp(-12 * dt));
    this.kickT += dt; this.yankT += dt; this.pullT += dt; this.hurtT += dt; this.catchT += dt;
    if (this.stumbleT > 0) this.stumbleT -= dt;
    this.wobble = Math.max(0, this.wobble - CONFIG.stumble.decay * dt);
    this.aimW = damp(this.aimW, this.aiming ? 1 : 0, 14, dt);
    // squash and stretch spring
    const sq = this.sq, steps = Math.max(1, Math.ceil(dt / 0.012)), h = dt / steps;
    for (let i = 0; i < steps; i++) { sq.v += (260 * (1 - sq.x) - 11 * sq.v) * h; sq.x += sq.v * h; }
    // blinking and looking around while waiting
    this.blinkT -= dt;
    if (this.blinkT < -0.13) this.blinkT = rand(1.8, 4.5);
    const idle = !this.aiming && !Pumpkin.free && this.stumbleT <= 0 && this.deadT < 0 && this.victoryT < 0;
    this.lookT -= dt;
    if (this.lookT <= 0) { this.lookT = rand(1.5, 3.5); this.lookTarget = idle && Math.random() < 0.6 ? rand(-0.55, 0.55) : 0; }
    this.look = damp(this.look, idle ? this.lookTarget : 0, 6, dt);
    // ---- compose pose (euler angles per part) ----
    const P = { Body: [0, 0, 0, 0, 0, 0], Head: [0, 0, 0, 0, 0, 0], ArmL: [0, 0, 0.12, 0, 0, 0], ArmR: [0, 0, -0.12, 0, 0, 0], LegL: [0, 0, 0, 0, 0, 0], LegR: [0, 0, 0, 0, 0, 0], Cape: [0.12, 0, 0, 0, 0, 0] };
    let rootY = 0, rootTiltX = 0;
    const br = Math.sin(time * 2.1);
    P.Body[4] = 0.012 * br; P.ArmL[0] = 0.05 * br; P.ArmR[0] = -0.05 * br; P.Cape[0] += 0.05 * Math.sin(time * 1.6);
    P.Head[1] += this.look; P.Head[2] += this.look * -0.15;
    // walking: swinging legs and arms, a bob and a little waddle
    const wa = this.walkAmt;
    if (wa > 0.01) {
      const wp = this.walkPh, sw = Math.sin(wp), sp = Math.hypot(this.vx, this.vz);
      const fwd = sp > 0.05 ? (this.vx * Math.sin(this.yaw) + this.vz * Math.cos(this.yaw)) / sp : 1; // 1 forwards, -1 backwards
      P.LegL[0] += sw * 0.7 * wa; P.LegR[0] -= sw * 0.7 * wa;
      P.ArmL[0] -= sw * 0.5 * wa; P.ArmR[0] += sw * 0.5 * wa;
      P.Body[2] += sw * 0.07 * wa; P.Body[0] += 0.12 * wa * fwd; P.Head[0] -= 0.06 * wa * fwd;
      P.Cape[0] += 0.3 * wa * Math.max(0, fwd);
      rootY += Math.abs(Math.cos(wp)) * 0.07 * wa;
    }
    // leaning into the band while steering with the mouse
    this.steerLean = damp(this.steerLean || 0, Pumpkin.free ? Pumpkin.steerSide : 0, 10, dt);
    const sl = this.steerLean;
    P.Body[2] -= 0.2 * sl; P.Body[1] += 0.22 * sl; P.LegR[2] += 0.3 * sl; P.ArmL[2] += 0.35 * Math.abs(sl); P.ArmR[2] -= 0.35 * Math.abs(sl);
    // aiming: crouch, wind up the right leg, arms out for balance
    const aw = this.aimW, pw = this.aimPower;
    P.Body[4] -= 0.06 * aw * (0.5 + pw); P.Body[0] += 0.18 * aw;
    P.LegR[0] += 0.95 * aw * pw; P.LegL[0] -= 0.1 * aw;
    P.ArmL[2] += 0.55 * aw; P.ArmR[2] -= 0.55 * aw; P.ArmL[0] -= 0.3 * aw * pw; P.ArmR[0] -= 0.3 * aw * pw;
    // nearly full charge: Sir trembles with effort
    if (aw > 0.5 && pw > 0.8) { const tr = (pw - 0.8) / 0.2; P.Body[2] += Math.sin(time * 47) * 0.035 * tr; P.Head[2] += Math.sin(time * 53) * 0.05 * tr; P.LegL[2] += Math.sin(time * 41) * 0.03 * tr; }
    // kick
    if (this.kickT < 0.4) {
      const k = this.kickT / 0.4; const swing = k < 0.3 ? lerp(0.9 * (this.kickPower || 0.6), -1.35, easeOutCubic(k / 0.3)) : lerp(-1.35, 0, smooth((k - 0.3) / 0.7));
      P.LegR[0] = swing; P.Body[0] -= 0.28 * Math.sin(k * Math.PI); P.ArmL[0] -= 0.7 * Math.sin(k * Math.PI); P.ArmR[0] -= 0.7 * Math.sin(k * Math.PI);
    }
    // band tension: lean back, right foot pulled towards the pumpkin
    const ten = this.tension;
    P.Body[0] -= 0.3 * ten; P.LegR[0] -= 0.55 * ten; P.ArmL[0] -= 0.35 * ten; P.ArmR[0] -= 0.25 * ten; P.ArmL[2] += 0.3 * ten; P.ArmR[2] -= 0.3 * ten;
    P.Body[2] += Math.sin(time * 7) * 0.04 * ten;
    // yank: foot jerk sideways and a body twist
    if (this.yankT < 0.32) {
      const k = Math.sin(this.yankT / 0.32 * Math.PI); const sd = this.yankSide;
      P.LegR[2] += 0.75 * sd * k; P.Body[2] -= 0.28 * sd * k; P.Body[1] += 0.45 * sd * k; P.ArmL[2] += 0.9 * k; P.ArmR[2] -= 0.9 * k;
    }
    // pull back: big heave
    if (this.pullT < 0.5) {
      const k = Math.sin(clamp(this.pullT / 0.5, 0, 1) * Math.PI);
      P.LegR[0] += 1.2 * k; P.Body[0] -= 0.45 * k; P.ArmL[0] -= 2.2 * k; P.ArmR[0] -= 2.2 * k; P.Head[0] -= 0.3 * k;
    }
    // catch: little stomp
    if (this.catchT < 0.3) { const k = Math.sin(this.catchT / 0.3 * Math.PI); P.LegR[0] -= 0.4 * k; P.Body[4] -= 0.06 * k; }
    // wobble warning sway
    const wb = this.wobble;
    P.Body[2] += Math.sin(time * 9) * 0.18 * wb; P.ArmL[2] += 0.6 * wb; P.ArmR[2] -= 0.6 * wb;
    // stumble: slapstick chaos
    if (this.stumbleT > 0) {
      const s = this.stumbleT, tt = time;
      P.Body[2] += Math.sin(tt * 16) * 0.45; P.Body[0] += Math.sin(tt * 11) * 0.3 - 0.1;
      P.ArmL[0] = tt * 15; P.ArmR[0] = tt * 15 + Math.PI; P.ArmL[2] = 0.6; P.ArmR[2] = -0.6;
      P.LegL[0] = -0.7 * Math.abs(Math.sin(tt * 10)); P.LegR[0] = 0.4 * Math.sin(tt * 10);
      P.Head[2] = Math.sin(tt * 21) * 0.3;
      rootY = Math.abs(Math.sin(tt * 10)) * 0.14;
      if (Math.random() < dt * 14) { const a = tt * 6 + Math.random(); FX.spark(this.x + Math.cos(a) * 0.4, 2.35, this.z + Math.sin(a) * 0.4, -Math.sin(a) * 1.5, 0.2, Math.cos(a) * 1.5, [1, 0.9, 0.3], 0.5, 0.22, 0, 12); }
    }
    // hurt flinch + red tint
    const hk = this.hurtT < 0.3 ? 1 - this.hurtT / 0.3 : 0;
    P.Body[0] -= 0.25 * hk;
    if (hk > 0 || this.tinted) {
      for (const m of this.materials) m.color.copy(m.userData.baseColor).multiply(_tint.setRGB(1 + 1.5 * hk, 1 - 0.5 * hk, 1 - 0.5 * hk));
      this.tinted = hk > 0;
    }
    // victory: arms up and hop
    if (this.victoryT >= 0) {
      this.victoryT += dt;
      P.ArmL[0] = -2.7; P.ArmR[0] = -2.7; P.ArmL[2] = 0.4; P.ArmR[2] = -0.4; rootY = Math.abs(Math.sin(this.victoryT * 6)) * 0.35; P.LegL[0] = -0.3 * Math.abs(Math.sin(this.victoryT * 6));
    }
    // defeat: topples over backwards
    if (this.deadT >= 0) {
      this.deadT += dt; const k = easeOutCubic(clamp(this.deadT / 0.9, 0, 1));
      rootTiltX = -1.5 * k; P.ArmL[2] = 1.2 * k; P.ArmR[2] = -1.2 * k; P.LegL[0] = -0.4 * k; P.LegR[0] = -0.6 * k;
      rootY = 0.12 * k + Math.max(0, Math.sin(clamp(this.deadT / 0.9, 0, 1) * Math.PI)) * 0.25;
    }
    // cape reacts to leaning
    P.Cape[0] += Math.max(0, -P.Body[0]) * 0.7 + Math.abs(P.Body[2]) * 0.3;
    // plume spring
    const pl = this.plume;
    const bodyVelX = (P.Body[0] - this.lastBodyRot[0]) / Math.max(dt, 1e-3), bodyVelZ = (P.Body[2] - this.lastBodyRot[2]) / Math.max(dt, 1e-3);
    this.lastBodyRot[0] = P.Body[0]; this.lastBodyRot[2] = P.Body[2];
    pl.vx += (-pl.ax * 60 - pl.vx * 7 - bodyVelX * 2.5) * dt; pl.vz += (-pl.az * 60 - pl.vz * 7 - bodyVelZ * 2.5) * dt;
    pl.ax = clamp(pl.ax + pl.vx * dt, -0.9, 0.9); pl.az = clamp(pl.az + pl.vz * dt, -0.9, 0.9);
    // ---- apply ----
    const hs = CONFIG.hero.scale || 1;
    FX.decal.push(this.x, 0.03, this.z, 4.6, 1, 0.72, 0.38, 0.13, 0, 0);
    if (this.slowT > 0) FX.decalA.push(this.x, 0.035, this.z, 1.7, 0.92, 0.92, 0.95, 0.55 * Math.min(1, this.slowT * 2), G.realTime * 0.3, 16);
    const sx = Math.max(0.6, Math.min(1.4, this.sq.x));
    this.root.scale.set(hs / Math.sqrt(sx), hs * sx, hs / Math.sqrt(sx));
    TOON.update();
    this.root.position.set(this.x, rootY, this.z);
    if (World.heroLight) World.heroLight.position.set(this.x + 0.6, 3.6, this.z + 2.2);
    _q1.setFromAxisAngle(_v1.set(0, 1, 0), this.yaw);
    if (rootTiltX) { _q2.setFromAxisAngle(_v1.set(1, 0, 0), rootTiltX); _q1.multiply(_q2); }
    this.root.quaternion.copy(_q1);
    for (const nm in P) {
      const n = this.nodes[nm]; if (!n) continue; const r = this.rest[nm], a = P[nm];
      quatFromEuler(_q2, a[0], a[1], a[2]);
      n.quaternion.copy(r.q).multiply(_q2);
      n.position.set(r.p.x + a[3], r.p.y + a[4], r.p.z + a[5]);
    }
    const plN = this.nodes.Plume; if (plN) { quatFromEuler(_q2, pl.ax + 0.1 * Math.sin(time * 3), 0, pl.az); plN.quaternion.copy(this.rest.Plume.q).multiply(_q2); }
    // eyes: blink, and X eyes when knocked out
    const eyes = this.nodes.Eyes, xe = this.nodes.EyesX;
    if (eyes) { const r = this.rest.Eyes.s; eyes.scale.set(r.x, r.y * (this.blinkT < 0 ? 0.12 : 1), r.z); eyes.visible = this.deadT < 0; }
    if (xe) { const on = this.deadT >= 0; xe.scale.setScalar(on ? 1 : this.rest.EyesX.s.x); xe.visible = on; }
    this.root.updateMatrixWorld(true);
  },
  anchor(out) {
    const n = this.nodes.RopeAnchor;
    if (n) return out.setFromMatrixPosition(n.matrixWorld);
    return out.set(this.x + Math.cos(this.yaw) * -0.2, 0.18, this.z + Math.sin(this.yaw) * 0.2);
  },
};

// =====================================================================
// 11. PUMPKIN + RUBBER BAND
// The pumpkin is a point mass on an elastic band tied to Sir's ankle:
// free inside restLength, springy beyond it, hard stop at maxLength.
// Sir walks around, so every band force uses the vector from Sir to the pumpkin.
// =====================================================================
const PUMPKIN_LIGHT = new THREE.Color(0xffb347), PUMPKIN_LIGHT_POWER = new THREE.Color(0xff8a3a);
const Pumpkin = {
  x: 0, z: 1, vx: 0, vz: 0, y: 0, vy: 0, radius: 0.55,
  free: false, returning: false, power: false, armed: false, kickT: 0, autoReel: false, tired: false, charge: 0,
  kickCD: 0, // short wait after a catch before the next kick
  spin: new THREE.Quaternion(), node: null, rope: null, ropeWaves: [], snapFlash: 0, stretch: 0,
  aimDir: { x: 0, z: 1 }, trailT: 0, flameT: 0, seedT: 0,
  steerTarget: null, steerAmt: 0, steerSide: 0, steerTime: 0,
  steerE: 0, steerDist: 99, steerOut: false, cvx: 0, cvz: 0, ptx: null, ptz: null, swingT: -9, // mouse steering state
  webT: 0, // wrapped in spider web: slow and sticky

  init(scene) {
    this.node = Assets.models.pumpkin_ball.scene.clone();
    this.node.traverse(n => { if (n.isMesh) { n.castShadow = true; n.receiveShadow = true; } });
    scene.add(this.node);
    this.rope = new RopeMesh(34, 7);
    scene.add(this.rope.mesh);
    this.reset();
  },
  reset() {
    this.free = false; this.returning = false; this.power = false; this.armed = false; this.autoReel = false; this.tired = false; this.charge = 0; this.kickCD = 0;
    this.vx = this.vz = 0; this.y = 0; this.vy = 0; this.kickT = 0; this.ropeWaves.length = 0; this.stretch = 0; this.webT = 0;
    this.steerE = 0; this.steerDist = 99; this.steerOut = false; this.cvx = this.cvz = 0; this.ptx = this.ptz = null;
    this.radius = G.stats ? G.stats.radius : CONFIG.pumpkin.radius;
    this.heldPos(_v1); this.x = _v1.x; this.z = _v1.z;
    this.spin.identity();
  },
  // where the pumpkin rests when held: in front of Sir's right foot
  heldPos(out) {
    const yaw = Hero.yaw, c = Math.cos(yaw), s = Math.sin(yaw);
    const fx = Math.sin(yaw), fz = Math.cos(yaw); // forward
    const rx = -c, rz = s;                        // character's right (-local x)
    const f = 0.62 + this.radius * 0.75, r = 0.22;
    return out.set(Hero.x + fx * f + rx * r, 0, Hero.z + fz * f + rz * r);
  },
  get speed() { return Math.hypot(this.vx, this.vz); },
  // kick speed for a charge of 0 (quick tap) .. 1 (held for gesture.chargeTime)
  kickSpeed(power) { const C = CONFIG.pumpkin; return lerp(C.minKickSpeed, C.maxKickSpeed, power) * G.stats.kickSpeedMult; },
  get dist() { return Math.hypot(this.x - Hero.x, this.z - Hero.z); },

  get canKick() { return !this.free && this.kickCD <= 0; },
  // returns false while the kick is still cooling down
  kick(dx, dz, power) {
    if (this.free || this.kickCD > 0) return false;
    const speed = this.kickSpeed(power);
    this.heldPos(_v1);
    this.x = _v1.x; this.z = _v1.z;
    // the pumpkin keeps most of Sir's walking speed
    this.vx = dx * speed + Hero.vx * 0.8; this.vz = dz * speed + Hero.vz * 0.8;
    this.free = true; this.returning = false; this.power = false; this.armed = false; this.autoReel = false; this.tired = false; this.kickT = 0;
    this.charge = power;
    this.vy = 2.5 + power * 3.5; this.y = 0.02;
    G.chain = 0; G.kickKills = 0; G.kicks++;
    UI.setChain(Rutabaga.meter, false, 0); // the meter keeps its rutabagas, only the one-kick glow goes
    Hero.kick(power);
    SFX.play('kick', { power });
    FX.smoke(this.x, 0.1, this.z, 5, { color: [0.4, 0.36, 0.34], size: 0.6, alpha: 0.35 });
    if (power > 0.75) { // charged: a burst of sparks off the boot
      FX.ring(this.x, this.z, 0.3, 2.2 + power, [1, 0.6, 0.2], 0.35, 0.8, 7, 2);
      FX.burst(this.x, 0.6, this.z, 10 + Math.round(power * 10), { color: [1, 0.7, 0.25], frame: 3, size: 0.18, speed: 7, up: 3, gravity: -8, life: 0.45 });
      if (power > 0.97) SFX.play('chargeKick');
      // launch blast: dust kicked up behind the boot and a shockwave
      for (let i = 0; i < 8; i++) FX.emit({ x: this.x - dx * 0.3, y: 0.15, z: this.z - dz * 0.3, vx: -dx * rand(2, 6) + rand(-3, 3), vy: rand(1, 3), vz: -dz * rand(2, 6) + rand(-3, 3), life: rand(0.4, 0.7), size: 0.5, size1: 1.4, color: [0.5, 0.42, 0.38], alpha: 0.45, frame: 2, layer: 1, drag: 2 });
      FX.add.push(this.x, 0.6, this.z, 4 + 3 * power, 1, 0.7, 0.3, 0.6, 0, 0);
    }
    addShake(0.08 + power * 0.22);
    if (PowerUps.active('triple')) PowerUps.tripleKick(dx, dz, speed, power);
    if (!G.tutorial.kicked) { G.tutorial.kicked = true; UI.refreshHint(); }
    return true;
  },
  // Ghost Pumpkin: swap the pumpkin's materials for see-through glowing ones (and back)
  setGhost(on) {
    if (!this.node || !!this.ghost === !!on) return;
    this.ghost = !!on;
    if (!this.ghostMats) this.ghostMats = new Map();
    this.node.traverse((n) => {
      if (!n.isMesh) return;
      if (on) {
        if (!this.ghostMats.has(n)) {
          const g = n.material.clone(); this.ghostMats.set(n, { orig: n.material, ghost: g });
          g.transparent = true; g.opacity = 0.62; g.depthWrite = false; g.color = new THREE.Color(0.7, 0.86, 1.0);
          if (g.emissive) { g.emissive = new THREE.Color(0.2, 0.4, 0.8); g.emissiveIntensity = 0.5; }
        }
        n.material = this.ghostMats.get(n).ghost; n.castShadow = false;
      } else if (this.ghostMats.has(n)) { n.material = this.ghostMats.get(n).orig; n.castShadow = true; }
    });
  },
  // sideways yank: (sx, sz) is a unit vector perpendicular to the band
  yank(sx, sz, strength) {
    if (!this.free || this.tired) return; // a tired band only snaps home (a pull still works)
    const st = G.stats, C = CONFIG.pumpkin;
    const d = this.dist || 1, ux = (this.x - Hero.x) / d, uz = (this.z - Hero.z) / d;
    const imp = C.yankImpulse * st.yankMult * strength;
    this.vx += sx * imp - ux * imp * 0.12; this.vz += sz * imp - uz * imp * 0.12;
    this.armed = true; this.autoReel = false;
    this.ropeWaves.push({ t: 0, amp: 0.35 + 0.25 * strength, sx, sz });
    if (this.ropeWaves.length > 4) this.ropeWaves.shift();
    Hero.yank(Hero.localSide(sx, sz));
    Hero.addWobble(CONFIG.stumble.yankWobble * strength * (0.6 + 0.4 * clamp(d / st.maxLength, 0, 1)));
    SFX.play('yank', { strength, gap: 0.06 });
    if (!G.tutorial.yanked) { G.tutorial.yanked = true; UI.refreshHint(); }
  },
  pull(strength) {
    if (!this.free || this.kickT < CONFIG.pumpkin.pullMinTime) return false;
    const st = G.stats, C = CONFIG.pumpkin;
    const d = this.dist || 1, ux = (this.x - Hero.x) / d, uz = (this.z - Hero.z) / d;
    const rvx = this.vx - Hero.vx, rvz = this.vz - Hero.vz;
    const vr = rvx * ux + rvz * uz; const tx = rvx - vr * ux, tz = rvz - vr * uz;
    const speed = C.pullSpeed * st.pullMult * (0.88 + 0.24 * strength) * (this.webT > 0 ? 0.6 : 1);
    this.vx = Hero.vx - ux * speed + tx * 0.22; this.vz = Hero.vz - uz * speed + tz * 0.22;
    this.returning = true; this.power = true; this.armed = true; this.autoReel = false;
    this.ropeWaves.push({ t: 0, amp: 0.25, sx: -uz, sz: ux });
    Hero.pull();
    Hero.addWobble(CONFIG.stumble.pullWobble * strength * (0.4 + 0.6 * clamp(d / st.maxLength, 0, 1)));
    SFX.play('pull');
    FX.text(t('returnStrike'), this.x, 1.6, this.z, 'power', 0.8);
    if (!G.tutorial.pulled) { G.tutorial.pulled = true; UI.refreshHint(); }
    return true;
  },
  doCatch() {
    const wasPower = this.power;
    this.free = false; this.returning = false; this.power = false; this.armed = false; this.autoReel = false; this.tired = false; this.charge = 0;
    this.vx = this.vz = 0; this.vy = 0; this.y = 0; this.kickCD = CONFIG.pumpkin.kickCooldown;
    Hero.caught();
    SFX.play('catch');
    if (wasPower) Combat.catchShock();
    FX.smoke(this.x, 0.1, this.z, 3, { size: 0.5, alpha: 0.3 });
  },

  // One physics step of the band (pure function, also used for the aim preview).
  // (ax, az) is Sir's position and (avx, avz) his velocity.
  step(s, h, st, ax, az, avx = 0, avz = 0) {
    const C = CONFIG.pumpkin, web = s.webT > 0;
    const rx = s.x - ax, rz = s.z - az;
    const d = Math.hypot(rx, rz) || 1e-6, ux = rx / d, uz = rz / d;
    let accx = -rx * C.weakPull, accz = -rz * C.weakPull;
    if (d > st.restLength) {
      const vr = (s.vx - avx) * ux + (s.vz - avz) * uz;
      // a charged kick flies on a slack band: it keeps its speed until it hits the end
      const slack = vr > 0 && s.charge > 0 && (s.kickT || 0) < C.slackTime ? 1 - C.chargeSlack * s.charge * s.charge : 1;
      const f = (st.stiffness * (d - st.restLength) + C.bandDamping * vr) * slack;
      accx -= ux * f; accz -= uz * f;
    }
    s.vx += accx * h; s.vz += accz * h;
    const fr = Math.exp(-C.friction * (web ? 3.5 : 1) * h); s.vx *= fr; s.vz *= fr;
    const maxSp = web ? 12 : C.maxSpeed;
    const sp = Math.hypot(s.vx, s.vz); if (sp > maxSp) { s.vx *= maxSp / sp; s.vz *= maxSp / sp; }
    s.x += s.vx * h; s.z += s.vz * h;
    const ex = s.x - ax, ez = s.z - az, d2 = Math.hypot(ex, ez);
    if (d2 > st.maxLength) {
      const nx = ex / d2, nz = ez / d2;
      s.x = ax + nx * st.maxLength; s.z = az + nz * st.maxLength;
      const vr = (s.vx - avx) * nx + (s.vz - avz) * nz;
      if (vr > 0) {
        s.vx -= nx * vr * 1.35; s.vz -= nz * vr * 1.35;
        if (vr > 14) { // a cannon shot hits the end of the band: it comes straight back instead of drifting sideways past Sir
          const rvx = s.vx - avx, rvz = s.vz - avz, rad = rvx * nx + rvz * nz, tx = rvx - nx * rad, tz = rvz - nz * rad;
          s.vx = avx + nx * rad + tx * 0.25; s.vz = avz + nz * rad + tz * 0.25;
        }
        return vr;
      }
    }
    return 0;
  },
  // Mouse steering: the flying pumpkin flies to the cursor. Its heading turns towards the
  // cursor with a bounded sideways push (a cannon shot only curves, a slow ball whips round),
  // it drives itself up to steerMaxSpeed when it is slow, and it brakes and parks on the
  // cursor when it gets there. The band still pulls it in and out and limits the reach.
  steer(h, st) {
    const C = CONFIG.pumpkin, tg = this.steerTarget;
    const tr = Math.hypot(tg.x - Hero.x, tg.z - Hero.z);
    this.steerOut = tr > C.steerHome + 0.8 && !this.tired && !this.power;
    if (tr < C.steerHome || this.power) { this.steerAmt = 0; this.steerE = 0; this.steerDist = 99; return; } // cursor on Sir: let it come home
    // a moving cursor is led a little, so a circling mouse keeps the pumpkin circling instead of cutting corners
    let lx = this.cvx * C.steerLead, lz = this.cvz * C.steerLead; const ll = Math.hypot(lx, lz); if (ll > 3) { lx *= 3 / ll; lz *= 3 / ll; }
    const dx = tg.x + lx - this.x, dz = tg.z + lz - this.z, dist = Math.hypot(dx, dz) || 1e-4, ux = dx / dist, uz = dz / dist;
    this.steerDist = Math.hypot(tg.x - this.x, tg.z - this.z);
    // the band tires at the end of the flight: steering fades out over the last flightFade seconds
    const fade = this.tired ? 0 : 1 - smooth(clamp((this.kickT - (C.flightTime - C.flightFade)) / C.flightFade, 0, 1));
    const grip = st.yankMult * (this.webT > 0 ? 0.5 : 1) * fade * smooth(clamp((this.dist - 0.5) / (C.steerNear - 0.5), 0, 1));
    let vx = this.vx - Hero.vx, vz = this.vz - Hero.vz; const sp = Math.hypot(vx, vz);
    let turn = 0, maxTurn = 1e-6;
    if (sp > 0.4) { // 1. bend the heading towards the cursor
      const fx = vx / sp, fz = vz / sp, ang = Math.atan2(fx * uz - fz * ux, fx * ux + fz * uz);
      maxTurn = Math.max(1e-6, C.steerAccel * grip / sp * h);
      turn = clamp(ang, -maxTurn, maxTurn);
      const c = Math.cos(turn), sn = Math.sin(turn), nx = vx * c - vz * sn, nz = vx * sn + vz * c; vx = nx; vz = nz;
      this.steerE = ang;
    } else this.steerE = 0;
    // 2. speed along the cursor direction: wanted speed shrinks with the distance left, so it arrives and parks
    const want = Math.min(C.steerMaxSpeed + C.steerChargeSpeed * this.charge * this.charge, dist * C.steerDistGain), along = vx * ux + vz * uz;
    const a = clamp((want - along) * C.steerGain, -C.steerBrake, C.steerThrust) * grip * h;
    vx += ux * a; vz += uz * a;
    this.vx = Hero.vx + vx; this.vz = Hero.vz + vz;
    this.steerAmt = clamp(turn / maxTurn, -1, 1) * clamp(Math.abs(this.steerE) * 2, 0, 1);
    this.steerSide = Hero.localSide(-vz * Math.sign(turn), vx * Math.sign(turn)) * Math.min(1, Math.abs(this.steerAmt) * 1.6);
    // flying it somewhere on purpose stops Sir from reeling it in
    if (this.autoReel && !this.tired && dist > 1) { this.autoReel = false; this.returning = false; }
  },
  // return strike: the pumpkin homes in on Sir even when he walks away
  home(h) {
    const rx = Hero.x - this.x, rz = Hero.z - this.z, d = Math.hypot(rx, rz) || 1;
    const sp = Math.hypot(this.vx, this.vz) || 1, k = 1 - Math.exp(-7 * h);
    this.vx += (rx / d * sp - this.vx) * k; this.vz += (rz / d * sp - this.vz) * k;
  },
  obstacles(h) {
    const n = World.solidPush(this, this.radius);
    if (n) {
      const vn = this.vx * n.x + this.vz * n.z;
      if (vn < 0) {
        this.vx -= n.x * vn * 1.6; this.vz -= n.z * vn * 1.6;
        if (vn < -4) { SFX.play('bonk', { vol: 0.6, pitch: 0.7 }); addShake(0.12); FX.smoke(this.x - n.x * this.radius, 0.3, this.z - n.z * this.radius, 4, { size: 0.5 }); }
      }
    }
    if (!this.ghost) Obstacles.hitByPumpkin(this); // a ghost pumpkin floats straight through the gravestones
  },

  update(dt) {
    const st = G.stats;
    // the mega power-up makes it a giant (grows and shrinks smoothly)
    this.radius = damp(this.radius, st.radius * (PowerUps.active('mega') ? CONFIG.powerups.megaSize : 1), 6, dt);
    this.webT = Math.max(0, this.webT - dt);
    if (!this.free) {
      this.heldPos(_v1); this.x = _v1.x; this.z = _v1.z; this.vx = Hero.vx; this.vz = Hero.vz;
      this.stretch = 0; Hero.tension = damp(Hero.tension, 0, 8, dt);
      const wasCooling = this.kickCD > 0;
      this.kickCD = Math.max(0, this.kickCD - dt);
      if (wasCooling && this.kickCD <= 0 && G.state === 'playing') { SFX.play('charge', { pitch: 1.5, vol: 0.5, gap: 0.05 }); FX.ring(Hero.x, Hero.z, 0.6, 1.6, [1, 0.8, 0.4], 0.3, 0.5, 7, 2); }
      // "ready to kick" ring around Sir (it grows back in while the next kick cools down)
      if (G.state === 'playing' && !Hero.aiming && !Hero.stumbling) {
        const pulse = 0.5 + 0.5 * Math.sin(G.realTime * 4), rdy = 1 - this.kickCD / CONFIG.pumpkin.kickCooldown;
        if (this.kickCD > 0) FX.decal.push(Hero.x, 0.05, Hero.z, 1.4 + 1.6 * rdy, 0.8, 0.6, 0.45, 0.16, G.realTime * 0.6, 9);
        else FX.decal.push(Hero.x, 0.05, Hero.z, 3.0 + pulse * 0.25, 1, 0.75, 0.35, 0.28 + pulse * 0.14, G.realTime * 0.6, 9);
      }
    } else {
      this.kickT += dt;
      { const tg = this.steerTarget; // cursor speed (smoothed) for the lead
        if (tg && this.ptx !== null && dt > 0) { const k = 1 - Math.exp(-dt / 0.06); this.cvx += ((tg.x - this.ptx) / dt - this.cvx) * k; this.cvz += ((tg.z - this.ptz) / dt - this.cvz) * k; }
        else { this.cvx = this.cvz = 0; }
        if (tg) { this.ptx = tg.x; this.ptz = tg.z; } else { this.ptx = this.ptz = null; this.steerOut = false; } }
      const steps = Math.max(1, Math.ceil(dt / (1 / 240)));
      const h = dt / steps;
      const ax = Hero.x, az = Hero.z, avx = Hero.vx, avz = Hero.vz; // Sir has already moved this frame
      for (let i = 0; i < steps; i++) {
        if (this.steerTarget && G.state === 'playing') this.steer(h, st);
        if (this.returning && this.power) this.home(h);
        const snap = this.step(this, h, st, ax, az, avx, avz);
        if (snap > 6) {
          SFX.play('twang', { vol: clamp(snap / 18, 0.3, 1) }); this.snapFlash = 1; addShake(0.1);
          Hero.addWobble(CONFIG.stumble.snapWobble * clamp((snap - 6) / 14, 0, 1) * (1 - 0.8 * this.charge));
          const d = this.dist || 1;
          this.ropeWaves.push({ t: 0, amp: 0.2, sx: -(this.z - az) / d, sz: (this.x - ax) / d });
        }
        this.obstacles(h);
        Combat.pumpkinHits(h);
        Pickups.pumpkinTouch();
        if (!this.free) break;
        const rx = this.x - ax, rz = this.z - az, d = Math.hypot(rx, rz);
        if (d > st.restLength + 0.5) this.armed = true;
        const rvx = this.vx - avx, rvz = this.vz - avz;
        const inward = rvx * rx + rvz * rz < 0;
        const wantsOut = this.steerOut && this.steerTarget && !this.returning; // flown past Sir on purpose: no catch
        if (!wantsOut && (this.armed || this.kickT > 0.6) && d < CONFIG.pumpkin.catchRadius + (this.power ? 0.35 : 0) && (inward || Math.hypot(rvx, rvz) < 2)) { this.doCatch(); break; }
      }
      if (!this.steerTarget) { this.steerAmt = 0; this.steerSide = 0; }
      else if (Math.abs(this.steerAmt) > 0.25 && !G.tutorial.yanked) { this.steerTime += dt; if (this.steerTime > 0.6) { G.tutorial.yanked = true; UI.refreshHint(); } }
      if (this.free) {
        const rvx = this.vx - Hero.vx, rvz = this.vz - Hero.vz, relSp = Math.hypot(rvx, rvz);
        const rx = Hero.x - this.x, rz = Hero.z - this.z, rd = Math.hypot(rx, rz) || 1, ix = rx / rd, iz = rz / rd;
        const PC = CONFIG.pumpkin;
        // the band tires after flightTime: no more steering, it reels the pumpkin straight home
        if (!this.tired && !this.power && this.kickT > PC.flightTime) {
          this.tired = true; this.autoReel = true; this.returning = true;
          this.ropeWaves.push({ t: 0, amp: 0.3, sx: -iz, sz: ix });
          SFX.play('reel', { gap: 0.2 });
        }
        // slow inside the slack band and nobody steering it: Sir reels it in
        // (further out the band brings it back by itself, and the mouse can swing it until the band tires)
        if (!this.returning && relSp < 2.2 && this.kickT > 0.7 && rd < st.restLength + 0.4 && (!this.steerTarget || this.steerDist > 90)) {
          this.autoReel = true; this.returning = true;
        }
        if (this.autoReel && !this.power) {
          // only the speed towards Sir is set, so sideways swings keep working until the band tires
          const vin = rvx * ix + rvz * iz, k = 1 - Math.exp(-(this.tired ? 16 : 10) * dt);
          const want = this.tired ? PC.tiredReel : PC.reelSpeed;
          this.vx += ix * (want - vin) * k; this.vz += iz * (want - vin) * k;
          // (a tired band lets a swing carry on as an arc on the way home instead of stopping it dead)
          if (!this.steerTarget || this.tired) { const tx = rvx - vin * ix, tz = rvz - vin * iz, kt = this.tired ? 0.4 : 0.6; this.vx -= tx * k * kt; this.vz -= tz * k * kt; }
        }
        // swing sound: a whoosh when it is bent round at speed
        const vtAbs = Math.abs(rvx * -iz + rvz * ix);
        if (this.steerTarget && vtAbs > 11 && Math.abs(this.steerAmt) > 0.25 && G.realTime - this.swingT > 0.6) {
          this.swingT = G.realTime; SFX.play('swing', { vol: clamp(vtAbs / 19, 0.5, 1), pitch: 0.8 + vtAbs / 45 });
        }
        if (this.power && relSp < 5) this.power = false;
        const d = this.dist;
        this.stretch = clamp((d - st.restLength) / (st.maxLength - st.restLength), 0, 1.2);
        if (this.stretch > 0.8 && this.speed > 3) SFX.play('creak', { gap: 0.45, vol: this.stretch });
        Hero.tension = damp(Hero.tension, clamp(this.stretch * 1.1, 0, 1), 10, dt);
        Hero.facingTo(this.x - Hero.x, this.z - Hero.z);
        this.effects(dt);
      }
    }
    this.updateVisual(dt);
  },

  effects(dt) {
    const sp = this.speed;
    // power return trail
    if (this.power) {
      for (let i = 0; i < 2; i++) FX.emit({ x: this.x + rand(-0.2, 0.2), y: 0.55 + this.y, z: this.z + rand(-0.2, 0.2), vx: -this.vx * 0.05, vy: rand(0.2, 0.8), vz: -this.vz * 0.05, life: 0.35, size: 0.9, size1: 0.2, color: [1, 0.55, 0.15], alpha: 0.8, frame: 0, layer: 0 });
      if (Math.random() < 0.5) FX.spark(this.x, 0.5, this.z, rand(-2, 2), rand(1, 3), rand(-2, 2), [1, 0.8, 0.3], 0.4, 0.18, -6);
    }
    // charged kick: it blazes while it is fast
    if (this.charge > 0.55 && sp > 9 && !this.power) {
      const k = clamp((this.charge - 0.55) / 0.45, 0, 1) * clamp((sp - 9) / 8, 0, 1);
      if (Math.random() < 0.4 + 0.6 * k) FX.emit({ x: this.x + rand(-0.2, 0.2), y: 0.55 + this.y, z: this.z + rand(-0.2, 0.2), vx: -this.vx * 0.06, vy: rand(0.4, 1.4), vz: -this.vz * 0.06, life: 0.3, size: 0.75 + 0.5 * k, size1: 0.15, color: [1, 0.5 + 0.2 * k, 0.15], alpha: 0.5 + 0.4 * k, frame: 5, layer: 0, rot: 0 });
    }
    // speed streak: a faint glow trail when it really flies, a fat orange comet tail at cannon speed
    if (sp > 12 && !this.power) {
      const k = clamp((sp - 12) / 12, 0, 1), hot = clamp((sp - 28) / 20, 0, 1);
      FX.emit({ x: this.x - this.vx * 0.012, y: 0.55 + this.y, z: this.z - this.vz * 0.012, vx: -this.vx * 0.08, vy: 0, vz: -this.vz * 0.08, life: 0.16, size: 1.0 * this.radius / 0.55, size1: 0.35, color: [1, 0.62, 0.25], alpha: 0.12 + 0.2 * k, frame: 0, layer: 0 });
      if (hot > 0) for (let i = 1; i <= 3; i++) FX.emit({ x: this.x - this.vx * 0.012 * i, y: 0.55 + this.y, z: this.z - this.vz * 0.012 * i, vx: -this.vx * 0.03, vy: 0.3, vz: -this.vz * 0.03, life: 0.12 + 0.05 * i, size: (1.9 - 0.3 * i) * this.radius / 0.55, size1: 0.2, color: [1, 0.85 - 0.15 * i, 0.4 - 0.1 * i], alpha: (0.5 - 0.1 * i) * hot, frame: 0, layer: 0 });
    }
    // rolling dust
    if (sp > 8 && this.y < 0.1 && Math.random() < dt * 20) FX.smoke(this.x - this.vx * 0.03, 0.08, this.z - this.vz * 0.03, 1, { size: 0.4, alpha: 0.18, up: 0.4, speed: 0.4 });
    // flaming pumpkin upgrade: leave fire patches
    if (G.stats.flame > 0 && sp > 4) {
      this.flameT -= dt;
      if (this.flameT <= 0) { this.flameT = 0.07; Combat.addFire(this.x, this.z); }
      FX.emit({ x: this.x + rand(-0.25, 0.25), y: 0.6, z: this.z + rand(-0.25, 0.25), vx: rand(-0.4, 0.4), vy: rand(1, 2.2), vz: rand(-0.4, 0.4), life: 0.45, size: 0.6, size1: 0.1, color: [1, 0.45, 0.1], alpha: 0.9, frame: 5, layer: 0, rot: 0 });
    }
  },

  updateVisual(dt) {
    const r = this.radius, sc = r / 0.55;
    // visual hop
    if (this.free || this.y > 0) {
      this.vy -= 28 * dt; this.y += this.vy * dt;
      if (this.y <= 0) { this.y = 0; if (Math.abs(this.vy) > 2.5) { this.vy = -this.vy * 0.35; if (this.free) SFX.play('bonk', { vol: 0.25, pitch: 1.4, gap: 0.12 }); } else this.vy = 0; }
    }
    const node = this.node;
    node.position.set(this.x, r * 0.86 + this.y, this.z);
    node.scale.set(sc, sc, sc);
    if (this.free) {
      const sp = this.speed;
      if (sp > 0.05) {
        _v1.set(this.vz, 0, -this.vx).normalize();
        _q1.setFromAxisAngle(_v1, sp * dt / r);
        this.spin.premultiply(_q1).normalize();
      }
    } else {
      // dribbled at Sir's feet while he walks, face forward again when he stops
      const sp = Math.hypot(Hero.vx, Hero.vz);
      if (sp > 0.6) {
        _v1.set(Hero.vz, 0, -Hero.vx).normalize();
        _q1.setFromAxisAngle(_v1, sp * dt / r);
        this.spin.premultiply(_q1).normalize();
      } else {
        _q1.setFromAxisAngle(_v1.set(0, 1, 0), Hero.yaw);
        this.spin.slerp(_q1, 1 - Math.exp(-10 * dt));
      }
    }
    node.quaternion.copy(this.spin);
    // spider web wrapped around it
    if (this.webT > 0) {
      const k = Math.min(1, this.webT * 2);
      FX.alpha.push(this.x, 0.6 + this.y, this.z, 1.5 * sc, 0.95, 0.95, 1, 0.75 * k, G.realTime * 0.7, 16);
      FX.alpha.push(this.x, 0.5 + this.y, this.z, 1.2 * sc, 0.9, 0.9, 0.95, 0.5 * k, -G.realTime * 0.9 + 1, 16);
    }
    // light + glow
    const L = World.pumpkinLight;
    L.position.set(this.x, 1.1 + this.y, this.z);
    const fl = 0.9 + 0.1 * Math.sin(G.realTime * 17) + 0.06 * Math.sin(G.realTime * 41);
    L.intensity = (this.power ? 2.6 : 1.5) * fl * LIGHT.point; L.color.copy(this.power ? PUMPKIN_LIGHT_POWER : PUMPKIN_LIGHT);
    FX.add.push(this.x, 0.55 + this.y, this.z, (this.power ? 3.4 : 2.4) * sc, 1, 0.55, 0.15, this.power ? 0.6 : 0.35, 0, 0);
    this.updateRope(dt);
  },

  updateRope(dt) {
    const st = G.stats;
    Hero.anchor(_v1);
    const ax = _v1.x, ay = _v1.y, az = _v1.z;
    const dx = this.x - ax, dz = this.z - az; const d = Math.hypot(dx, dz) || 1e-3;
    const ux = dx / d, uz = dz / d;
    const bx = this.x - ux * this.radius * 0.75, bz = this.z - uz * this.radius * 0.75, by = this.radius * 0.86 + this.y + 0.05;
    const len = Math.hypot(bx - ax, bz - az);
    const slack = this.free ? clamp(1 - len / st.restLength, 0, 1) : 1;
    const N = this.rope.segs;
    for (const w of this.ropeWaves) w.t += dt;
    while (this.ropeWaves.length && this.ropeWaves[0].t > 0.6) this.ropeWaves.shift();
    const pts = this.rope.points;
    const time = G.realTime;
    // a fast sideways swing bends the band backwards a little, like a whip
    const vside = this.free ? (this.vx - Hero.vx) * -uz + (this.vz - Hero.vz) * ux : 0;
    this.bow = damp(this.bow || 0, -clamp(vside / 22, -1, 1) * Math.min(len, 9) * 0.075, 12, dt);
    for (let i = 0; i <= N; i++) {
      const s = i / N;
      let x = lerp(ax, bx, s), y = lerp(ay, by, s), z = lerp(az, bz, s);
      if (slack > 0) {
        const droop = Math.sin(Math.PI * s);
        y = lerp(y, 0.05, droop * clamp(slack * 1.6, 0, 1));
        const wig = Math.sin(s * Math.PI * 2 + 0.6) * droop * slack * (this.free ? 0.35 : 0.18);
        x += -uz * wig; z += ux * wig;
      }
      if (this.bow) { const b = this.bow * Math.sin(Math.PI * s) * (0.75 + 0.5 * s); x += -uz * b; z += ux * b; }
      for (const w of this.ropeWaves) {
        const c = w.t / 0.32; const env = Math.exp(-Math.pow((s - c) / 0.14, 2)) * Math.max(0, 1 - w.t / 0.6) * Math.sin(s * Math.PI);
        x += w.sx * w.amp * env; z += w.sz * w.amp * env;
      }
      if (this.stretch > 0.85) { const v = Math.sin(time * 60 + s * 20) * 0.015 * (this.stretch - 0.85) * Math.sin(s * Math.PI); y += v; }
      pts[i].set(x, y, z);
    }
    const thin = this.free ? Math.sqrt(st.restLength / Math.max(len, st.restLength)) : 1;
    this.rope.update(0.085 * Math.max(0.5, thin) * (st.radius / 0.55 * 0.5 + 0.5));
    // colour: hotter when stretched, ghostly with the spectral upgrade
    const m = this.rope.mesh.material;
    this.snapFlash = Math.max(0, this.snapFlash - dt * 4);
    const heat = clamp((this.stretch - 0.6) / 0.5, 0, 1) * 0.6 + this.snapFlash;
    if (st.spectral > 0) m.emissive.setRGB(0.15 + heat * 0.5, 0.6 + heat * 0.3, 0.9);
    else m.emissive.setRGB(0.16 + heat * 1.2, 0.05 + heat * 0.25, 0.01);
  },
};

// Dynamic striped tube for the rubber band
class RopeMesh {
  constructor(segs = 32, radial = 6) {
    this.segs = segs; this.radial = radial;
    this.points = []; for (let i = 0; i <= segs; i++) this.points.push(new THREE.Vector3());
    const nv = (segs + 1) * (radial + 1);
    this.pos = new Float32Array(nv * 3); this.nrm = new Float32Array(nv * 3); const uv = new Float32Array(nv * 2);
    const idx = [];
    for (let i = 0; i <= segs; i++) for (let k = 0; k <= radial; k++) { const v = i * (radial + 1) + k; uv[v * 2] = k / radial; uv[v * 2 + 1] = i / segs * 9; }
    for (let i = 0; i < segs; i++) for (let k = 0; k < radial; k++) {
      const a = i * (radial + 1) + k, b = a + radial + 1;
      idx.push(a, b, a + 1, a + 1, b, b + 1);
    }
    const g = this.geo = new THREE.BufferGeometry();
    this.posAttr = new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage);
    this.nrmAttr = new THREE.BufferAttribute(this.nrm, 3).setUsage(THREE.DynamicDrawUsage);
    g.setAttribute('position', this.posAttr); g.setAttribute('normal', this.nrmAttr); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); g.setIndex(idx);
    // stripe texture: orange and near-black bands
    const cv = document.createElement('canvas'); cv.width = 4; cv.height = 64; const c = cv.getContext('2d');
    const gr = c.createLinearGradient(0, 0, 0, 64);
    gr.addColorStop(0, '#ff7a1a'); gr.addColorStop(0.42, '#ff8f2a'); gr.addColorStop(0.5, '#2a1420'); gr.addColorStop(0.92, '#1e1018'); gr.addColorStop(1, '#ff7a1a');
    c.fillStyle = gr; c.fillRect(0, 0, 4, 64);
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace; tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.flipY = false; tex.anisotropy = 2;
    this.mesh = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.45, metalness: 0, side: THREE.DoubleSide }));
    this.mesh.castShadow = true; this.mesh.receiveShadow = true;
    this.mesh.frustumCulled = false; // the band moves every frame
  }
  update(radius) {
    const P = this.points, N = this.segs, R = this.radial;
    for (let i = 0; i <= N; i++) {
      const a = P[Math.max(0, i - 1)], b = P[Math.min(N, i + 1)];
      let tx = b.x - a.x, ty = b.y - a.y, tz = b.z - a.z; const tl = Math.hypot(tx, ty, tz) || 1; tx /= tl; ty /= tl; tz /= tl;
      // side = T x up
      let sx = -tz, sy = 0, sz = tx; let sl = Math.hypot(sx, sz); if (sl < 1e-4) { sx = 1; sz = 0; sl = 1; } sx /= sl; sz /= sl;
      // up' = side x T
      const ux = sy * tz - sz * ty, uy = sz * tx - sx * tz, uz = sx * ty - sy * tx;
      const taper = 1 - 0.25 * Math.sin(i / N * Math.PI);
      const rr = radius * taper;
      for (let k = 0; k <= R; k++) {
        const ang = k / R * TAU, ca = Math.cos(ang), sa = Math.sin(ang);
        const nx = sx * ca + ux * sa, ny = sy * ca + uy * sa, nz = sz * ca + uz * sa;
        const v = (i * (R + 1) + k) * 3;
        this.pos[v] = P[i].x + nx * rr; this.pos[v + 1] = P[i].y + ny * rr; this.pos[v + 2] = P[i].z + nz * rr;
        this.nrm[v] = nx; this.nrm[v + 1] = ny; this.nrm[v + 2] = nz;
      }
    }
    this.posAttr.needsUpdate = true; this.nrmAttr.needsUpdate = true;
  }
}

// =====================================================================
// 12. INPUT
//   Keyboard: WASD or the arrow keys walk.
//   Mouse:    hold the button to charge a kick towards the cursor, let go to kick
//             (the longer you hold, the harder). While the pumpkin flies it swings
//             towards the cursor; a click pulls it back (keep holding and the next
//             kick starts charging as soon as it is back).
//   Touch:    a finger on the left part of the screen is a walking stick.
//             Elsewhere: press + drag = aim (hold longer = harder), release = kick;
//             while the pumpkin flies, drag sideways = yank, drag towards Sir = pull back.
// =====================================================================
const MOVE_KEYS = { KeyW: [0, -1], ArrowUp: [0, -1], KeyS: [0, 1], ArrowDown: [0, 1], KeyA: [-1, 0], ArrowLeft: [-1, 0], KeyD: [1, 0], ArrowRight: [1, 0] };
const Input = {
  id: null, mode: null, active: false, pointerType: 'mouse',
  start: { x: 0, z: 0 }, cur: { x: 0, z: 0 }, origin: { x: 0, z: 0, t: 0 },
  sStart: { x: 0, y: 0 }, sCur: { x: 0, y: 0 }, sOrigin: { x: 0, y: 0 },
  steerCD: 0, lastAction: null, lastActionT: 0, aimLen: 0, chargeT0: 0, charge: 0, chargeStep: 0, queued: null, pullPending: false,
  usingMouse: false, mouse: { sx: 0, sy: 0, on: false }, press: null, hoverW: { x: 0, z: 0 },
  keys: new Set(), move: { x: 0, z: 0 }, joy: { id: null, ox: 0, oy: 0, x: 0, y: 0 }, bot: null,
  _o: new THREE.Vector3(), _d: new THREE.Vector3(),

  init(canvas) {
    canvas.addEventListener('pointerdown', (e) => this.down(e));
    window.addEventListener('pointermove', (e) => this.onMove(e), { passive: true });
    window.addEventListener('pointerup', (e) => this.up(e));
    window.addEventListener('pointercancel', (e) => this.cancel(e));
    window.addEventListener('keydown', (e) => {
      if (MOVE_KEYS[e.code]) { this.keys.add(e.code); if (G.state === 'playing') e.preventDefault(); }
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') { if (G.state === 'playing') Game.pause(); else if (G.state === 'paused') Game.resume(); }
    });
    window.addEventListener('keyup', (e) => { this.keys.delete(e.code); });
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    // mouse steering needs to know where the cursor is, also when no button is pressed
    document.documentElement.addEventListener('mouseleave', () => { this.mouse.on = false; });
    window.addEventListener('blur', () => { this.mouse.on = false; this.keys.clear(); this.joy.id = null; });
    // Get the keyboard back after visiting another window/tab: any click or tap re-focuses the game
    // (the canvas handler calls preventDefault, which would otherwise stop the browser from moving focus here)
    const refocus = () => {
      const a = document.activeElement;
      if (a && a !== document.body && a.blur && !(a.tagName === 'INPUT' || a.tagName === 'TEXTAREA')) a.blur(); // a hidden menu button must not keep the focus
      try { window.focus(); } catch (_) {}
    };
    window.addEventListener('pointerdown', refocus, true);
    window.addEventListener('focus', () => this.keys.clear());
    document.addEventListener('visibilitychange', () => { this.keys.clear(); if (!document.hidden) refocus(); });
  },
  // client coords -> ground plane (y = 0)
  toWorld(cx, cy, out) {
    const nx = cx / World.width * 2 - 1, ny = 1 - cy / World.height * 2;
    World.ray(nx, ny, this._o, this._d);
    const tt = -this._o.y / (this._d.y || -1e-6);
    out.x = this._o.x + this._d.x * tt; out.z = this._o.z + this._d.z * tt;
    return out;
  },
  down(e) {
    const mouse = e.pointerType === 'mouse';
    this.usingMouse = mouse;
    if (!mouse) this.touchSeen = true;
    if (G.state !== 'playing') return;
    // touch: a finger on the left part of the screen walks Sir
    if (!mouse && this.joy.id === null && e.clientX < World.width * CONFIG.gesture.joystickZone) {
      e.preventDefault(); SFX.resume();
      const j = this.joy; j.id = e.pointerId; j.ox = j.x = e.clientX; j.oy = j.y = e.clientY;
      try { e.target.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      return;
    }
    if (this.id !== null) return;
    e.preventDefault();
    SFX.resume();
    this.id = e.pointerId; this.active = true; this.pointerType = e.pointerType;
    try { e.target.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    this.toWorld(e.clientX, e.clientY, this.start); this.cur.x = this.start.x; this.cur.z = this.start.z;
    this.sStart.x = this.sCur.x = this.sOrigin.x = e.clientX; this.sStart.y = this.sCur.y = this.sOrigin.y = e.clientY;
    this.origin.x = this.start.x; this.origin.z = this.start.z; this.origin.t = performance.now() / 1000;
    this.press = { t: this.origin.t, sx: e.clientX, sy: e.clientY, acted: false };
    this.aimLen = 0;
    if (mouse) { this.mouse.sx = e.clientX; this.mouse.sy = e.clientY; this.mouse.on = true; }
    if (Hero.stumbling) { this.mode = null; return; }
    if (mouse) {
      if (Pumpkin.free) {
        // a click pulls it back (right after the kick it waits a moment, if the button is still held)
        if (CONFIG.gesture.clickPull) { if (Pumpkin.pull(1)) { this.lastAction = 'pull'; this.lastActionT = this.origin.t; } else this.pullPending = true; }
        this.mode = 'hold'; // still holding when it is back = the next kick starts charging right away
      } else { this.mode = 'mouseAim'; this.startCharge(); }
    } else { this.mode = Pumpkin.free ? 'steer' : 'aim'; if (this.mode === 'aim') this.startCharge(); }
  },
  onMove(e) {
    if (e.pointerType === 'mouse') { this.mouse.sx = e.clientX; this.mouse.sy = e.clientY; this.mouse.on = true; this.usingMouse = true; }
    else this.usingMouse = false;
    const j = this.joy;
    if (e.pointerId === j.id) { j.x = e.clientX; j.y = e.clientY; return; }
    if (e.pointerId !== this.id) return;
    this.toWorld(e.clientX, e.clientY, this.cur); this.sCur.x = e.clientX; this.sCur.y = e.clientY;
    if (this.mode === 'steer') this.steer();
  },
  up(e) {
    if (e.pointerId === this.joy.id) { this.joy.id = null; return; }
    if (e.pointerId !== this.id) return;
    this.toWorld(e.clientX, e.clientY, this.cur);
    if (G.state === 'playing' && !Pumpkin.free && !Hero.stumbling) {
      if (this.mode === 'aim') {
        const C = CONFIG.pumpkin; const dx = this.cur.x - this.start.x, dz = this.cur.z - this.start.z; const len = Math.hypot(dx, dz);
        if (len >= C.aimMinDrag) { if (!Pumpkin.kick(dx / len, dz / len, this.chargePower())) this.queued = { x: dx / len, z: dz / len, t: G.realTime }; }
      } else if (this.mode === 'mouseAim') {
        // let go while the kick is still cooling down: it goes off as soon as Sir is ready
        const a = this.mouseAim(); if (a && !Pumpkin.kick(a.x, a.z, this.chargePower())) this.queued = { mouse: true, t: G.realTime };
      }
    }
    this.reset();
  },
  cancel(e) { if (e.pointerId === this.joy.id) this.joy.id = null; else if (e.pointerId === this.id) this.reset(); },
  reset() { this.id = null; this.mode = null; this.active = false; Hero.aiming = false; this.aimLen = 0; this.press = null; this.charge = 0; this.chargeStep = 0; this.pullPending = false; },
  resetAll() { this.reset(); this.joy.id = null; this.keys.clear(); this.queued = null; },
  cancelSteer() { if (this.mode === 'steer' || this.mode === 'aim' || this.mode === 'mouseAim') this.mode = null; Hero.aiming = false; },
  // charging: the longer the button is held, the harder the kick (0 = quick tap, 1 = full)
  startCharge() { this.chargeT0 = G.realTime + Math.max(0, Pumpkin.kickCD); this.charge = 0; this.chargeStep = 0; },
  chargePower() {
    const x = clamp((G.realTime - this.chargeT0 - 0.04) / CONFIG.gesture.chargeTime, 0, 1);
    return x >= 1 ? 1 : 1 - Math.pow(1 - x, 1.6);
  },
  // mouse kick direction: towards the cursor
  mouseAim() {
    this.toWorld(this.mouse.sx, this.mouse.sy, this.hoverW);
    const dx = this.hoverW.x - Hero.x, dz = this.hoverW.z - Hero.z, d = Math.hypot(dx, dz);
    if (d < 0.35) return null;
    return { x: dx / d, z: dz / d, d };
  },
  // charge feedback: rising ticks, a ding when full
  chargeTick() {
    this.charge = this.chargePower();
    const step = Math.floor(this.charge * 8 + 1e-6);
    if (step > this.chargeStep) { this.chargeStep = step; SFX.play(step >= 8 ? 'chargeFull' : 'charge', { pitch: 0.75 + this.charge * 0.9, gap: 0.01 }); if (step >= 8) { Hero.squash(1.08); } }
  },

  // touch: sideways flick = yank, flick towards Sir = pull back
  steer() {
    if (!Pumpkin.free || this.steerCD > 0 || Hero.stumbling || G.state !== 'playing') return;
    const C = CONFIG.gesture;
    const dx = this.cur.x - this.origin.x, dz = this.cur.z - this.origin.z; const dl = Math.hypot(dx, dz);
    if (dl < C.steerThreshold) return;
    const now = performance.now() / 1000;
    let ux = Pumpkin.x - Hero.x, uz = Pumpkin.z - Hero.z; let ul = Math.hypot(ux, uz);
    if (ul < 0.8) { ux = Pumpkin.vx; uz = Pumpkin.vz; ul = Math.hypot(ux, uz); }
    if (ul < 1e-3) { ux = Math.sin(Hero.yaw); uz = Math.cos(Hero.yaw); ul = 1; }
    ux /= ul; uz /= ul;
    const a = dx * ux + dz * uz; const px = dx - a * ux, pz = dz - a * uz; const p = Math.hypot(px, pz);
    const speed = dl / Math.max(0.035, now - this.origin.t);
    const strength = clamp(speed / C.flickSpeedRef, 0.55, 1.4);
    if (a < 0 && -a > p * 0.85) { if (!Pumpkin.pull(strength)) return; this.lastAction = 'pull'; }
    else if (p >= Math.abs(a) * 0.6) { Pumpkin.yank(px / p, pz / p, strength); this.lastAction = 'yank'; this.lastSide = Math.sign(px * -uz + pz * ux); }
    else this.lastAction = null;
    if (this.lastAction) { this.lastActionT = now; this.steerCD = C.steerCooldown; if (this.press) this.press.acted = true; }
    this.origin.x = this.cur.x; this.origin.z = this.cur.z; this.origin.t = now;
    this.sOrigin.x = this.sCur.x; this.sOrigin.y = this.sCur.y;
  },

  update(dt) {
    this.steerCD -= dt;
    // walking direction: keys, the touch stick or the test bot (screen up = -z)
    let mx = 0, mz = 0;
    for (const k of this.keys) { const v = MOVE_KEYS[k]; if (v) { mx += v[0]; mz += v[1]; } }
    const j = this.joy;
    if (j.id !== null) {
      const R = CONFIG.gesture.joystickRadius; let dx = j.x - j.ox, dy = j.y - j.oy; const l = Math.hypot(dx, dy);
      if (l > R) { j.ox = j.x - dx / l * R; j.oy = j.y - dy / l * R; dx = dx / l * R; dy = dy / l * R; } // the stick base follows the thumb
      if (l > 8) { mx += dx / R; mz += dy / R; }
    }
    this.updateTouchUI();
    if (this.bot) { mx += this.bot.x; mz += this.bot.z; }
    const ml = Math.hypot(mx, mz); if (ml > 1) { mx /= ml; mz /= ml; }
    this.move.x = mx; this.move.z = mz;
    // mouse steering: the flying pumpkin swings towards the cursor
    Pumpkin.steerTarget = null;
    if (CONFIG.gesture.mouseSteer && this.usingMouse && this.mouse.on && Pumpkin.free && !Hero.stumbling && (this.id === null || this.pointerType === 'mouse')) {
      Pumpkin.steerTarget = this.toWorld(this.mouse.sx, this.mouse.sy, this.hoverW);
      FX.decal.push(this.hoverW.x, 0.05, this.hoverW.z, 1.1, 1, 0.8, 0.35, 0.32, G.realTime * 1.5, 9);
    }
    if (this.pullPending && this.mode === 'hold' && Pumpkin.free && Pumpkin.kickT >= CONFIG.pumpkin.pullMinTime && G.state === 'playing') {
      this.pullPending = false; if (Pumpkin.pull(1)) { this.lastAction = 'pull'; this.lastActionT = performance.now() / 1000; }
    }
    if (this.queued) { // a kick let go during the cooldown
      const q = this.queued;
      if (Pumpkin.free || G.realTime - q.t > 0.8 || Hero.stumbling) this.queued = null;
      else if (Pumpkin.canKick && G.state === 'playing') {
        this.queued = null;
        if (q.mouse) { const a = this.mouseAim(); if (a) Pumpkin.kick(a.x, a.z, 0); } else Pumpkin.kick(q.x, q.z, 0);
      }
    }
    if (this.mode === 'hold' && !Pumpkin.free && !Hero.stumbling) { this.mode = 'mouseAim'; this.startCharge(); } // it is back and the button is still down
    if (this.mode === 'steer') {
      if (!Pumpkin.free) { this.mode = null; }
      else this.steer();
    }
    if (this.mode === 'aim') {
      if (Pumpkin.free || Hero.stumbling) { this.mode = null; Hero.aiming = false; return; }
      const dx = this.cur.x - this.start.x, dz = this.cur.z - this.start.z; const len = Math.hypot(dx, dz);
      this.aimLen = len; this.chargeTick();
      if (len > 0.2) {
        const pw = this.charge; const ux = dx / len, uz = dz / len;
        Hero.aiming = true; Hero.aimPower = pw; Hero.facingTo(ux, uz);
        if (len >= CONFIG.pumpkin.aimMinDrag) this.drawAim(ux, uz, pw);
        if (!G.tutorial.aimedOnce) { G.tutorial.aimedOnce = true; UI.refreshHint(); }
      } else Hero.aiming = false;
    }
    if (this.mode === 'mouseAim') {
      if (Pumpkin.free || Hero.stumbling) { this.mode = Pumpkin.free ? 'hold' : null; Hero.aiming = false; return; }
      const a = this.mouseAim();
      this.aimLen = a ? a.d : 0; this.chargeTick();
      if (a) { Hero.aiming = true; Hero.aimPower = this.charge; Hero.facingTo(a.x, a.z); this.drawAim(a.x, a.z, this.charge); if (!G.tutorial.aimedOnce) { G.tutorial.aimedOnce = true; UI.refreshHint(); } }
      else Hero.aiming = false;
    }
  },
  // on-screen stick and kick pad, only on touch devices (hidden while a mouse is in use)
  isTouchDevice() {
    if (this._touchDev === undefined) this._touchDev = (window.matchMedia && matchMedia('(pointer: coarse)').matches) || (navigator.maxTouchPoints || 0) > 0;
    return this._touchDev || this.touchSeen;
  },
  updateTouchUI() {
    const u = this._tui || (this._tui = { root: document.getElementById('touch-ui'), stick: document.getElementById('t-stick'), knob: document.getElementById('t-knob'),
      kick: document.getElementById('t-kick'), ico: document.getElementById('t-kick-ico'), sl: document.getElementById('t-stick-label'), kl: document.getElementById('t-kick-label') });
    if (!u.root) return;
    const show = G.state === 'playing' && this.isTouchDevice() && !this.usingMouse;
    if (u.shown !== show) { u.shown = show; u.root.classList.toggle('show', show); }
    if (!show) return;
    const W = World.width, H = World.height, R = CONFIG.gesture.joystickRadius;
    const restY = H - Math.min(130, H * 0.24);
    const place = (el, x, y) => { el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)` + (el.classList.contains('t-label') ? ' translateX(-50%)' : ''); };
    // stick
    const j = this.joy, jOn = j.id !== null;
    const sx = jOn ? j.ox : Math.min(110, W * 0.18), sy = jOn ? j.oy : restY;
    place(u.stick, sx, sy); place(u.sl, sx, sy + 66);
    let kx = 0, ky = 0;
    if (jOn) { kx = j.x - j.ox; ky = j.y - j.oy; const l = Math.hypot(kx, ky); if (l > R) { kx *= R / l; ky *= R / l; } }
    u.knob.style.transform = `translate(${kx.toFixed(1)}px, ${ky.toFixed(1)}px)`;
    u.stick.classList.toggle('active', jOn);
    // kick pad: rests bottom right, jumps under the right thumb while it is down
    const kOn = this.id !== null && this.pointerType !== 'mouse';
    const px = kOn ? this.sStart.x : W - Math.min(110, W * 0.18), py = kOn ? this.sStart.y : restY;
    place(u.kick, px, py); place(u.ico, px, py); place(u.kl, px, py + 66);
    u.kick.classList.toggle('active', kOn);
    u.kick.classList.toggle('steer', kOn && this.mode === 'steer');
    const c = kOn && this.mode === 'aim' ? this.charge : (!kOn && !Pumpkin.free ? 1 - clamp(Pumpkin.kickCD / CONFIG.pumpkin.kickCooldown, 0, 1) : 0);
    const cs = c.toFixed(2); if (u.c !== cs) { u.c = cs; u.kick.style.setProperty('--c', cs); }
    const lbl = Pumpkin.free ? 'Swipe' : 'Kick'; if (u.lbl !== lbl) { u.lbl = lbl; u.kl.textContent = lbl; }
  },
  drawAim(ux, uz, pw) {
    const st = G.stats, dec = FX.decal, hx = Hero.x, hz = Hero.z;
    const col = [1, lerp(0.85, 0.25, pw), lerp(0.3, 0.08, pw)];
    const len = 1.3 + pw * 3.4;
    for (let r = 0.9; r < len; r += 0.34) dec.push(hx + ux * r, 0.05, hz + uz * r, 0.2, col[0], col[1], col[2], 0.9, 0, 1);
    dec.push(hx + ux * len, 0.05, hz + uz * len, 0.95, col[0], col[1], col[2], 1, Math.atan2(-ux, -uz), 8);
    // reach ring
    dec.push(hx, 0.04, hz, st.maxLength * 2, 1, 0.75, 0.4, 0.13, G.realTime * 0.1, 9);
    // predicted path
    Pumpkin.heldPos(_v1);
    const speed = Pumpkin.kickSpeed(pw);
    const s = { x: _v1.x, z: _v1.z, vx: ux * speed + Hero.vx * 0.8, vz: uz * speed + Hero.vz * 0.8, charge: pw, kickT: 0 };
    const h = 1 / 60; let armed = false;
    for (let i = 1; i <= 110; i++) {
      Pumpkin.step(s, h, st, hx, hz); s.kickT += h;
      const d = Math.hypot(s.x - hx, s.z - hz); if (d > st.restLength + 0.5) armed = true;
      if (armed && d < 1.5) break;
      if (i % 3 === 0) { const k = i / 110; dec.push(s.x, 0.05, s.z, 0.17 * (1 - k * 0.5), 1, 0.7, 0.35, 0.75 * (1 - k), 0, 1); }
    }
  },
};

// =====================================================================
// 13. ENEMIES: skeletons, zombies, ghosts, mummies, evil pumpkins, spiders,
// evil rutabagas, witches, werewolves, ghouls, living scarecrows, vampires,
// banshees, bats, spider eggs and the bosses (their brains are in BOSSES).
// Rendered with instanced rigs, animated procedurally. They chase Sir
// wherever he walks.
// =====================================================================
let _poseTarget = null;
const NO_LUNGE = { witch: 1, horse: 1, bat: 1, egg: 1, reaper: 1 };
function poseAdd(part, k, v) { if (part >= 0) _poseTarget[part * POSE_STRIDE + k] += v; }
const Enemies = {
  list: [], tpls: {}, batches: {}, parts: {}, debris: [], grid: new SpatialGrid(2.2), boss: null, nextId: 1,
  _near: [], _mv: { x: 0, z: 0, s: 1 }, _orb: { x: 0, z: 0 },
  init(scene) {
    const caps = { skeleton: 120, zombie: 80, ghost: 80, mummy: 40, pumpkin: 70, spider: 40, rutabaga: 90, witch: 12, werewolf: 16, king: 4,
      ghoul: 50, scarecrow: 12, vampire: 14, banshee: 10, bat: 64, egg: 24, spiderling: 40, horseman: 2, queen: 2, count: 2, reaper: 2 };
    for (const key in CONFIG.enemies) {
      const def = CONFIG.enemies[key];
      const tpl = new RigTemplate(Assets.models[def.model]);
      this.tpls[key] = tpl;
      this.batches[key] = new RigBatch(tpl, caps[key] || 60, { castShadow: true }).addTo(scene);
      const pi = {}; for (const nm of PART_NAMES) pi[nm] = tpl.part(nm);
      this.parts[key] = pi;
      // ghosts: soft blending without depth writes
      if (def.ghost) for (const m of this.batches[key].meshes) if (m.material.transparent) { m.material.depthWrite = false; m.castShadow = false; }
    }
  },
  clear() { this.list.length = 0; this.debris.length = 0; this.boss = null; },
  count(key) { if (!key) return this.list.length; let n = 0; for (const e of this.list) if (e.key === key && e.alive) n++; return n; },
  airborne(e) { return !!(e.def.ghost || e.def.flying); },

  spawn(key, angle, opts = {}) {
    const def = CONFIG.enemies[key]; if (!def) return null;
    const hour = G.time / CONFIG.night.secondsPerHour;
    const elite = !!opts.elite;
    const hpMul = (1 + CONFIG.waves.hpGrowth * hour) * (elite ? 3 : 1);
    const r = opts.radius ?? CONFIG.arena.spawnRadius;
    const x = Math.cos(angle) * r, z = Math.sin(angle) * r;
    const e = {
      id: this.nextId++, key, def, x, z, y: 0,
      yaw: Math.atan2(Hero.x - x, Hero.z - z),
      hp: def.hp * hpMul, maxHp: def.hp * hpMul, radius: def.radius * (elite ? 1.3 : 1), mass: def.mass * (elite ? 2 : 1),
      speed: def.speed * rand(0.9, 1.1) * (elite ? 0.9 : 1), damage: def.damage * (elite ? 1.5 : 1), attackT: rand(0.2, 0.6),
      state: 'rise', stateT: 0, kvx: 0, kvz: 0, hitT: -9, flash: 0, flinch: 0, lunge: 0, chainT: -9, phase: rand(0, TAU),
      elite, scale: (opts.scale || def.scale || 1) * (elite ? 1.35 : 1) * (def.boss ? CONFIG.bossScale : CONFIG.enemyScale), tilt: 0, tiltX: 0, tiltZ: 0, alive: true,
      frozenT: 0, slowT: 0, untouchable: false, mode: null, modeT: 0, vis: 1,
      pose: makePose(this.tpls[key]), burrowCD: rand(4, 7), hop: rand(0, 1), sway: rand(0, TAU), spawnFx: 0,
      cd: rand(1.5, 3), side: Math.random() < 0.5 ? -1 : 1, fx: 0, fz: 1, spinT: 0,
    };
    if (def.ghost) { e.state = 'fade'; e.y = 0; }
    if ((key === 'pumpkin' || key === 'werewolf') && !opts.rise) { e.state = 'jump'; e.fromR = CONFIG.arena.wallRadius + 1.5; e.toR = r; e.angle = angle; }
    if (def.flying) { const fr = CONFIG.arena.wallRadius + 2.5; e.state = 'flyin'; e.x = Math.cos(angle) * fr; e.z = Math.sin(angle) * fr; e.y = 3.4; e.cd = rand(2, 3.5); }
    if (opts.at) { e.x = opts.at.x; e.z = opts.at.z; e.yaw = Math.atan2(Hero.x - e.x, Hero.z - e.z); }
    if (def.boss) { e.state = 'enter'; this.boss = e; e.summonCD = 6; e.slamCD = 5; e.slamT = -1; e.stagger = 0; if (key !== 'king') Bosses.init(e); }
    if (key === 'scarecrow' && !opts.state) { e.state = 'disguise'; e.y = CONFIG.moves.scarecrow.sitHeight; e.yaw = rand(0, TAU); }
    if (key === 'egg') { e.state = 'egg'; e.y = 0; }
    if (key === 'bat') { e.state = 'ai'; e.y = CONFIG.moves.bat.height; e.mode = 'in'; }
    if (key === 'vampire' || key === 'banshee') e.cd = rand(2.5, 4.5);
    if (key === 'skeleton' && Math.random() < CONFIG.moves.skeleton.throwerChance) { e.thrower = true; e.cd = rand(2.5, 4); }
    if (opts.state) e.state = opts.state;
    this.list.push(e);
    if (e.state === 'rise') SFX.play('spawn', { gap: 0.12 });
    if (key === 'werewolf') SFX.play('howl', { gap: 2.5 });
    if (key === 'witch') SFX.play('cackle', { gap: 1.2 });
    if (key === 'banshee') SFX.play('wail', { gap: 1.5, vol: 0.5 });
    return e;
  },

  damage(e, amount, dx, dz, knock, src = 'pumpkin') {
    if (!e.alive || amount <= 0 && knock <= 0) return false;
    if (e.state === 'under' || e.state === 'burrow' || e.untouchable) return false;
    if (e.frozenT > 0) amount *= CONFIG.powerups.frostDamage;
    if (PowerUps.active('garlic') && (e.key === 'vampire' || e.key === 'count' || e.key === 'bat')) amount *= 1.5;
    e.hp -= amount; e.flash = 1; e.flinch = 1;
    if (e.state === 'disguise') { e.state = 'wake'; e.stateT = 0; }          // a scarecrow that gets hit wakes up
    if (e.def.boss && e.key !== 'king') Bosses.onHit(e, amount, src);
    const kb = knock / e.mass;
    e.kvx += dx * kb; e.kvz += dz * kb;
    if (kb > 0 && (dx || dz)) { e.tilt = Math.min(1.1, e.tilt + kb * 0.06); e.tiltX = dx; e.tiltZ = dz; }
    // a solid hit while a werewolf crouches cancels the leap and dazes it
    if (e.key === 'werewolf' && e.state === 'crouch' && amount > 0) { e.state = 'recover'; e.stateT = 0; e.cd = CONFIG.moves.werewolf.cooldown; }
    if (e.key === 'witch' && amount > 0) { e.spinT = 1; e.cd = Math.max(e.cd, 1.2); }
    if (e.key === 'mummy' && amount > 0 && e.hp > 0) FX.burst(e.x, 1.1, e.z, 3, { color: [0.93, 0.87, 0.7], frame: 20, size: 0.4, speed: 3, life: 0.9, gravity: -5, layer: 1 });
    if (e.def.boss) {
      UI.bossHp(e.hp / e.maxHp);
      if (e.key === 'king' && (amount >= 38 || src === 'blast')) {
        const interrupted = e.slamT >= 0; e.slamT = -1;
        e.stagger = Math.max(e.stagger || 0, src === 'blast' ? 2.0 : interrupted ? 1.2 : 0.6);
        e.kvx += dx * (src === 'blast' ? 7 : 3.2); e.kvz += dz * (src === 'blast' ? 7 : 3.2);
        if (interrupted) FX.text('!', e.x, 4.2, e.z, 'big', 0.8);
      }
    }
    if (e.hp <= 0) { this.kill(e, dx, dz, Math.min(18, 4 + kb), src); return true; }
    return false;
  },

  kill(e, dx, dz, force, src) {
    if (!e.alive) return;
    e.alive = false; e.state = 'dead';
    const def = e.def;
    // body parts fly apart
    if (!def.ghost) this.explodeParts(e, dx, dz, force);
    const x = e.x, z = e.z;
    switch (e.key) {
      case 'skeleton': {
        FX.burst(x, 1.0, z, 10, { color: [0.95, 0.92, 0.8], frame: 14, size: 0.28, gravity: -18, bounce: true, life: 1.1, layer: 1 }); SFX.play('bones');
        const S = CONFIG.moves.skeleton;
        if (!e.revived && Math.random() < S.reviveChance) { // the bones rattle back together (once)
          Game.later(S.reviveDelay, () => {
            if (G.state !== 'playing' && G.state !== 'paused') return;
            const s = this.spawn('skeleton', 0, { at: { x, z } });
            if (s) { s.revived = true; s.hp = s.maxHp = s.maxHp * S.reviveHp; FX.text('!', x, 2.6, z, 'pop', 0.7); }
          });
        }
        break;
      }
      case 'zombie': FX.burst(x, 1.0, z, 12, { color: [0.45, 0.75, 0.25], frame: 1, size: 0.22, gravity: -16, layer: 1, life: 0.8 }); FX.emit({ x, y: 0.05, z, size: 1.6, color: [0.25, 0.4, 0.12], alpha: 0.75, life: 6, frame: 13, layer: 3 }); SFX.play('squelch'); break;
      case 'mummy':
        FX.burst(x, 1.1, z, 9, { color: [0.93, 0.87, 0.7], frame: 20, size: 0.55, speed: 4, up: 5, life: 1.3, gravity: -6, layer: 1 });
        FX.smoke(x, 0.6, z, 5, { color: [0.75, 0.68, 0.52], size: 0.8, alpha: 0.4 }); SFX.play('groan', { gap: 0.2, pitch: 1.3 }); break;
      case 'spider':
        FX.burst(x, 0.5, z, 12, { color: [0.55, 0.95, 0.3], frame: 1, size: 0.2, gravity: -14, layer: 1, life: 0.8 });
        FX.emit({ x, y: 0.05, z, size: 1.5, color: [0.3, 0.55, 0.12], alpha: 0.75, life: 6, frame: 18, layer: 3, rot: rand(0, TAU) }); SFX.play('squelch', { gap: 0.05 }); break;
      case 'witch':
        FX.burst(x, e.y + 0.8, z, 18, { color: [0.75, 0.35, 1], frame: 12, size: 0.3, speed: 5, up: 4, life: 0.9, gravity: -4 });
        FX.smoke(x, e.y + 0.5, z, 8, { color: [0.45, 0.2, 0.6], size: 1.0, alpha: 0.5 }); SFX.play('cackle', { gap: 0, pitch: 0.7 }); break;
      case 'werewolf':
        FX.burst(x, 1.0, z, 14, { color: [0.45, 0.36, 0.3], frame: 1, size: 0.24, gravity: -14, layer: 1, life: 0.9 });
        FX.smoke(x, 0.5, z, 4, { size: 0.8, alpha: 0.35 }); SFX.play('howl', { gap: 0, pitch: 1.4, vol: 0.6 }); break;
      case 'ghost':
        for (let i = 0; i < 14; i++) FX.emit({ x: x + rand(-0.4, 0.4), y: rand(0.6, 1.6), z: z + rand(-0.4, 0.4), vx: rand(-1.5, 1.5), vy: rand(1, 3), vz: rand(-1.5, 1.5), life: rand(0.6, 1.1), size: rand(0.4, 0.9), size1: 0.05, color: [0.6, 0.9, 1], alpha: 0.8, frame: 0, layer: 0, drag: 1.5 });
        SFX.play('ghost'); break;
      case 'pumpkin':
        FX.burst(x, 0.7, z, 14, { color: [1, 0.55, 0.12], frame: 1, size: 0.24, gravity: -16, layer: 1, life: 0.9 });
        FX.burst(x, 0.7, z, 8, { color: [1, 0.95, 0.75], frame: 10, size: 0.18, gravity: -16, layer: 1, life: 1.2, bounce: true });
        FX.emit({ x, y: 0.05, z, size: 1.9, color: [0.85, 0.35, 0.05], alpha: 0.7, life: 6, frame: 13, layer: 3 });
        SFX.play('splat'); if (Math.random() < 0.35) FX.text(t('splat'), x, 1.8, z, 'pop', 0.8);
        { // bursts: the splash hurts nearby enemies (and Sir if he stands right next to it)
          const P = CONFIG.moves.pumpkin;
          FX.ring(x, z, 0.4, P.blastRadius, [1, 0.55, 0.12], 0.45, 0.45, 7);
          for (const o of this.list) {
            if (o === e || !o.alive || o.def.boss) continue;
            const ox = o.x - x, oz = o.z - z, od = Math.hypot(ox, oz);
            if (od < P.blastRadius) this.damage(o, P.blastDamage, ox / (od || 1), oz / (od || 1), 6, src);
          }
          if (Math.hypot(Hero.x - x, Hero.z - z) < P.heroRadius) Combat.hurtHero(P.blastHero, null);
        }
        break;
      case 'rutabaga': case 'king':
        FX.burst(x, 0.8, z, e.key === 'king' ? 40 : 12, { color: [0.6, 0.3, 0.7], frame: 1, size: 0.25, gravity: -14, layer: 1, life: 0.9, speed: e.key === 'king' ? 10 : 6 });
        FX.burst(x, 0.8, z, 6, { color: [0.35, 0.7, 0.25], frame: 6, size: 0.35, gravity: -6, layer: 1, life: 1.5 });
        SFX.play('thunk'); break;
      case 'ghoul':
        FX.burst(x, 0.6, z, 12, { color: [0.42, 0.5, 0.36], frame: 1, size: 0.22, gravity: -15, layer: 1, life: 0.8 });
        FX.emit({ x, y: 0.05, z, size: 1.4, color: [0.22, 0.28, 0.16], alpha: 0.7, life: 5, frame: 13, layer: 3 }); SFX.play('snarl', { gap: 0.1, pitch: 1.4 }); break;
      case 'scarecrow':
        FX.burst(x, 1.0, z, 20, { color: [0.92, 0.78, 0.42], frame: 20, size: 0.3, speed: 5, up: 5, life: 1.0, gravity: -8, layer: 1 });
        for (let i = 0; i < 4; i++) FX.emit({ x, y: 1.4, z, vx: rand(-3, 3), vy: rand(2, 4), vz: rand(-3, 3), life: 1.2, size: 0.45, color: [0.08, 0.06, 0.1], alpha: 1, frame: 24, layer: 1, drag: 0.5 }); // crows fly off
        SFX.play('caw', { gap: 0.05 }); break;
      case 'vampire': case 'count':
        for (let i = 0; i < (e.key === 'count' ? 30 : 12); i++) FX.emit({ x: x + rand(-0.3, 0.3), y: rand(0.8, 1.8), z: z + rand(-0.3, 0.3), vx: rand(-4, 4), vy: rand(1, 4), vz: rand(-4, 4), life: rand(0.8, 1.4), size: rand(0.35, 0.55), color: [0.12, 0.08, 0.14], alpha: 1, frame: 24, layer: 1, drag: 0.6 });
        FX.burst(x, 1.2, z, e.key === 'count' ? 30 : 10, { color: [0.85, 0.08, 0.15], frame: 1, size: 0.22, gravity: -10, layer: 1, life: 0.8 });
        SFX.play('hissV', { gap: 0.05, pitch: 0.7 }); break;
      case 'banshee':
        for (let i = 0; i < 16; i++) FX.emit({ x: x + rand(-0.4, 0.4), y: rand(0.6, 1.9), z: z + rand(-0.4, 0.4), vx: rand(-1.6, 1.6), vy: rand(1, 3), vz: rand(-1.6, 1.6), life: rand(0.6, 1.2), size: rand(0.4, 1.0), size1: 0.05, color: [0.7, 0.95, 1], alpha: 0.85, frame: 0, layer: 0, drag: 1.5 });
        SFX.play('wail', { gap: 0, pitch: 1.5, vol: 0.6 }); break;
      case 'bat':
        FX.burst(x, e.y + 0.2, z, 6, { color: [0.2, 0.12, 0.16], frame: 1, size: 0.14, gravity: -12, layer: 1, life: 0.6 }); SFX.play('squeak', { gap: 0.05 }); break;
      case 'egg': case 'spiderling': case 'queen':
        FX.burst(x, 0.5, z, e.key === 'queen' ? 40 : 10, { color: [0.75, 0.35, 1], frame: 1, size: e.key === 'queen' ? 0.35 : 0.2, gravity: -14, layer: 1, life: 0.8, speed: e.key === 'queen' ? 10 : 5 });
        FX.emit({ x, y: 0.05, z, size: e.key === 'queen' ? 4 : 1.3, color: [0.35, 0.15, 0.45], alpha: 0.7, life: 6, frame: 18, layer: 3, rot: rand(0, TAU) }); SFX.play('squelch', { gap: 0.05 }); break;
      case 'horseman':
        FX.burst(x, 1.4, z, 40, { color: [1, 0.55, 0.15], frame: 5, size: 0.5, speed: 8, up: 7, life: 1.0, gravity: -4 });
        FX.smoke(x, 0.8, z, 14, { color: [0.2, 0.16, 0.2], size: 1.6, alpha: 0.5, speed: 3 }); SFX.play('neigh', { gap: 0, pitch: 0.8 }); break;
      case 'reaper':
        for (let i = 0; i < 30; i++) FX.emit({ x: x + rand(-0.5, 0.5), y: rand(0.5, 2.5), z: z + rand(-0.5, 0.5), vx: rand(-3, 3), vy: rand(1, 5), vz: rand(-3, 3), life: rand(0.8, 1.6), size: rand(0.4, 1.0), size1: 0.05, color: [0.45, 1, 0.85], alpha: 0.9, frame: 0, layer: 0, drag: 1 });
        SFX.play('toll', { gap: 0 }); break;
    }
    if (e.elite) FX.burst(x, 1, z, 16, { color: [0.85, 0.5, 1], frame: 3, size: 0.3, life: 0.8 });
    FX.smoke(x, 0.3, z, 3, { size: 0.7, alpha: 0.3 });
    Combat.onKill(e, src);
  },

  explodeParts(e, dx, dz, force) {
    const batch = this.batches[e.key], tpl = this.tpls[e.key];
    this.rootMatrix(e, _m1);
    batch.solve(_m1, e.pose);
    const many = this.debris.length > 220;
    for (let i = 0; i < tpl.pieces.length; i++) {
      if (many && i > 2) break;
      batch.pieceMatrix(i, _m1, _m2);
      const pc = tpl.pieces[i];
      const d = { key: e.key, piece: i, p: new THREE.Vector3(), q: new THREE.Quaternion(), s: new THREE.Vector3(), c: pc.center, life: rand(1.2, 1.9), age: 0 };
      _m2.decompose(d.p, d.q, d.s);
      // world position of the geometry centre
      _v1.copy(pc.center).applyMatrix4(_m2); d.p.copy(_v1);
      const sp = force * rand(0.35, 0.8);
      d.vx = dx * sp + rand(-2.5, 2.5); d.vz = dz * sp + rand(-2.5, 2.5); d.vy = rand(3, 8);
      d.wx = rand(-12, 12); d.wy = rand(-12, 12); d.wz = rand(-12, 12);
      d.ground = Math.max(0.05, pc.radius * d.s.x * 0.5);
      d.tint = e.elite ? [1.2, 0.85, 1.35] : [1, 1, 1];
      this.debris.push(d);
    }
  },

  rootMatrix(e, out) {
    _v3.set(e.x, e.y, e.z);
    _q1.setFromAxisAngle(_v2.set(0, 1, 0), e.yaw);
    if (e.tilt > 0.01 && (e.tiltX || e.tiltZ)) {
      const l = Math.hypot(e.tiltX, e.tiltZ);
      _q2.setFromAxisAngle(_v2.set(e.tiltZ / l, 0, -e.tiltX / l), e.tilt * 0.9);
      _q1.premultiply(_q2);
    }
    if (e.spinT > 0) { _q2.setFromAxisAngle(_v2.set(0, 1, 0), e.spinT * e.spinT * 9); _q1.premultiply(_q2); } // dizzy witch
    _v2.set(e.scale, e.scale, e.scale);
    return out.compose(_v3, _q1, _v2);
  },

  update(dt) {
    const time = G.realTime, M = CONFIG.moves;
    const grid = this.grid; grid.clear();
    for (const e of this.list) if (e.alive && !this.airborne(e) && e.state !== 'under') grid.insert(e, e.x, e.z);
    const heroR = CONFIG.hero.radius, hx = Hero.x, hz = Hero.z;
    for (const e of this.list) {
      if (!e.alive) continue;
      e.stateT += dt; e.flash = Math.max(0, e.flash - dt * 6); e.flinch = Math.max(0, e.flinch - dt * 5); e.lunge = Math.max(0, e.lunge - dt * 3);
      e.tilt = Math.max(0, e.tilt - dt * 2.2); e.cd -= dt; e.spinT = Math.max(0, e.spinT - dt * 1.5);
      e.slowT = Math.max(0, e.slowT - dt);
      const ddx = hx - e.x, ddz = hz - e.z;
      const d = Math.hypot(ddx, ddz) || 1e-3; const tx = ddx / d, tz = ddz / d;
      e.fx = tx; e.fz = tz; // facing: towards Sir unless a move says otherwise
      const reach = heroR + e.radius * e.scale + 0.15;
      let mvx = 0, mvz = 0;
      // frozen solid by the frost power-up: no moving, no attacking (bosses only slow down)
      if (e.frozenT > 0) { e.frozenT -= dt; if (!e.def.boss) { e.fx = Math.sin(e.yaw); e.fz = Math.cos(e.yaw); e.stateT -= dt; } }
      if (!(e.frozenT > 0 && !e.def.boss)) switch (e.state) {
        case 'rise': {
          const k = clamp(e.stateT / 0.85, 0, 1); e.y = -1.7 * (1 - easeOutBack(k)) * (e.def.boss ? 2 : 1);
          if (Math.random() < dt * 25 && k < 0.8) FX.smoke(e.x, 0.05, e.z, 1, { color: [0.35, 0.3, 0.26], size: 0.5, alpha: 0.4, up: 0.8 });
          if (k >= 1) { e.state = 'walk'; e.y = 0; }
          break;
        }
        case 'fade': { const k = clamp(e.stateT / 0.6, 0, 1); e.spawnScale = easeOutBack(k); if (k >= 1) { e.state = 'walk'; e.spawnScale = 1; } break; }
        case 'jump': {
          const k = clamp(e.stateT / 0.9, 0, 1); const r = lerp(e.fromR, e.toR, k);
          e.x = Math.cos(e.angle) * r; e.z = Math.sin(e.angle) * r; e.y = Math.sin(k * Math.PI) * 4.2;
          if (k >= 1) { e.state = 'walk'; e.y = 0; FX.smoke(e.x, 0.1, e.z, 3, { size: 0.6, alpha: 0.35 }); SFX.play('bonk', { vol: 0.3, pitch: 0.8, gap: 0.1 }); }
          break;
        }
        case 'enter': { // boss walks in through the gate
          mvx = tx * e.speed; mvz = tz * e.speed; e.phase += dt * 4;
          if (Math.hypot(e.x, e.z) < 14) { e.state = e.key === 'king' ? 'walk' : 'boss'; }
          break;
        }
        case 'flyin': { // witch: swoops in over the wall
          const o = this.orbitPoint(e, hx, hz); const dx = o.x - e.x, dz = o.z - e.z, dl = Math.hypot(dx, dz) || 1;
          mvx = dx / dl * e.speed; mvz = dz / dl * e.speed; e.fx = dx / dl; e.fz = dz / dl;
          e.y = damp(e.y, M.witch.height, 1.6, dt);
          if (Math.hypot(e.x, e.z) < 14) e.state = 'fly';
          break;
        }
        case 'fly': { const v = this.witchAI(e, dt, hx, hz, d); mvx = v.x; mvz = v.z; break; }
        case 'boss': { const v = Bosses.ai(e, dt, d, tx, tz); mvx = v.x; mvz = v.z; break; }
        case 'ai': { const v = this.batAI(e, dt, d, tx, tz); mvx = v.x; mvz = v.z; break; }
        case 'disguise': { // a scarecrow on its pole, pretending to be a decoration
          const S = M.scarecrow; e.fx = Math.sin(e.yaw); e.fz = Math.cos(e.yaw);
          if (d < S.wakeRange || e.stateT > S.wakeAfter) { e.state = 'wake'; e.stateT = 0; }
          break;
        }
        case 'wake': { // jumps off the pole with a shriek, crows fly off
          const k = clamp(e.stateT / 0.45, 0, 1);
          if (!e.woke) {
            e.woke = true; SFX.play('caw', { gap: 0.1 });
            for (let i = 0; i < 4; i++) FX.emit({ x: e.x, y: 2.0, z: e.z, vx: rand(-3, 3), vy: rand(2.5, 4.5), vz: rand(-3, 3), life: 1.3, size: 0.45, color: [0.08, 0.06, 0.1], alpha: 1, frame: 24, layer: 1, drag: 0.4 });
            FX.smoke(e.x, 0.1, e.z, 4, { size: 0.6, alpha: 0.3 });
          }
          e.y = lerp(M.scarecrow.sitHeight, 0, k) + Math.sin(k * Math.PI) * 0.45;
          if (k >= 1) { e.state = 'walk'; e.y = 0; }
          break;
        }
        case 'egg': { // spider eggs hatch into spiderlings
          if (e.stateT >= M.egg.hatch) {
            e.alive = false; e.state = 'dead';
            FX.burst(e.x, 0.4, e.z, 12, { color: [0.85, 0.75, 1], frame: 1, size: 0.18, gravity: -12, layer: 1, life: 0.7 }); SFX.play('hatch', { gap: 0.05 });
            const n = Math.max(0, Math.min(M.egg.spiders, CONFIG.waves.limits.spiderling - this.count('spiderling')));
            for (let i = 0; i < n; i++) { const a = rand(0, TAU); const s2 = this.spawn('spiderling', 0, { state: 'walk', at: { x: e.x + Math.cos(a) * 0.4, z: e.z + Math.sin(a) * 0.4 } }); if (s2) { s2.kvx = Math.cos(a) * 4; s2.kvz = Math.sin(a) * 4; } }
          }
          break;
        }
        case 'mist': { // vampire dissolves into a cloud of bats
          e.vis = 1 - clamp(e.stateT / 0.35, 0, 1);
          if (e.stateT >= 0.35) {
            e.state = 'swarm'; e.stateT = 0; e.untouchable = true;
            const side = Math.random() < 0.5 ? -1 : 1, a = Math.atan2(e.z - hz, e.x - hx) + side * rand(0.8, 1.6);
            e.gx = clamp(hx + Math.cos(a) * 1.9, -14, 14); e.gz = clamp(hz + Math.sin(a) * 1.9, -14, 14);
            SFX.play('flap', { gap: 0.1 });
          }
          break;
        }
        case 'swarm': { // flies to a spot right next to Sir as bats, can't be hit
          const dx = e.gx - e.x, dz = e.gz - e.z, dl = Math.hypot(dx, dz);
          const sp = M.vampire.swarmSpeed;
          if (dl < 0.35 || e.stateT > 2.2) { e.state = 'form'; e.stateT = 0; e.untouchable = false; }
          else { mvx = dx / dl * sp; mvz = dz / dl * sp; e.fx = dx / dl; e.fz = dz / dl; }
          break;
        }
        case 'form': { // and appears again, claws first
          e.vis = clamp(e.stateT / 0.3, 0, 1);
          if (e.stateT >= 0.3) { e.vis = 1; e.state = d <= reach + 0.3 ? 'attack' : 'walk'; e.stateT = 0; e.attackT = 0.12; e.cd = M.vampire.mistEvery * rand(0.85, 1.2); }
          break;
        }
        case 'scream': { // banshee: wind up, then a shriek wave
          const B = M.banshee, k = clamp(e.stateT / B.windup, 0, 1);
          FX.decal.push(e.x, 0.06, e.z, B.radius * 2 * k, 0.6, 0.9, 1, 0.12 + 0.25 * k, 0, 7);
          if (!e.shot && e.stateT >= B.windup) {
            e.shot = true; SFX.play('scream', { gap: 0.2 }); addShake(0.18);
            FX.ring(e.x, e.z, 0.5, B.radius, [0.65, 0.95, 1], 0.5, 0.9, 7);
            FX.ring(e.x, e.z, 0.3, B.radius * 0.8, [1, 1, 1], 0.4, 0.6, 4);
            if (d < B.radius) { Hero.slowT = Math.max(Hero.slowT, B.slow); Combat.hurtHero(B.damage, e); FX.text('!', hx, 2.8, hz, 'big', 0.6); }
            const P = Pumpkin; if (P.free) { const px = P.x - e.x, pz = P.z - e.z, pd = Math.hypot(px, pz) || 1; if (pd < B.radius) { P.vx += px / pd * B.pushPumpkin; P.vz += pz / pd * B.pushPumpkin; } }
          }
          if (e.stateT >= B.windup + 0.6) { e.state = 'walk'; e.stateT = 0; e.cd = B.screamEvery * rand(0.85, 1.2); }
          break;
        }
        case 'walk': {
          if (e.def.boss && e.stagger > 0) { e.stagger -= dt; break; }
          let sp = e.speed;
          if (e.key === 'mummy' && e.hp < e.maxHp * M.mummy.unravelAt) sp *= M.mummy.unravelSpeed;
          if (e.def.anim === 'hop') {
            e.hop += dt * 1.25 * (e.speed / 2.3); if (e.hop >= 1) { e.hop -= 1; FX.smoke(e.x, 0.05, e.z, 1, { size: 0.4, alpha: 0.25, up: 0.5 }); }
            sp *= e.hop < 0.55 ? 1.9 : 0.12;
            e.y = e.hop < 0.55 ? Math.sin(e.hop / 0.55 * Math.PI) * 0.75 : 0;
          }
          let dirx = tx, dirz = tz;
          if (e.def.ghost) { const sw = Math.sin(time * 1.6 + e.sway) * 0.7; dirx += -tz * sw; dirz += tx * sw; const l = Math.hypot(dirx, dirz); dirx /= l; dirz /= l; }
          if (e.key === 'banshee') { // keeps her distance and circles, then shrieks
            const B = M.banshee;
            if (d < B.keep + 1) { const back = d < B.keep - 1 ? -0.6 : 0.1; dirx = -tz * e.side + tx * back; dirz = tx * e.side + tz * back; const l = Math.hypot(dirx, dirz); dirx /= l; dirz /= l; sp *= 0.7; }
            if (e.cd <= 0 && d < B.radius - 0.5) { e.state = 'scream'; e.stateT = 0; e.shot = false; SFX.play('wail', { gap: 0.5, vol: 0.7 }); break; }
          }
          if (e.key === 'vampire' && e.cd <= 0 && d > M.vampire.mistMin && d < M.vampire.mistMax) { e.state = 'mist'; e.stateT = 0; SFX.play('hissV', { gap: 0.3 }); break; }
          if (e.key === 'ghost') { // spooky dash
            const GH = M.ghost;
            if (!(e.rushT > 0) && e.cd <= 0 && d < GH.rushRange && d > 1.5) { e.rushT = GH.rushTime; e.cd = rand(GH.rushEvery[0], GH.rushEvery[1]); SFX.play('ghost', { gap: 0.4, pitch: 1.3, vol: 0.6 }); }
            if (e.rushT > 0) { e.rushT -= dt; sp *= GH.rushSpeed; dirx = tx; dirz = tz; if (Math.random() < dt * 30) FX.emit({ x: e.x, y: 1.0, z: e.z, vy: 0.5, life: 0.5, size: 0.6, size1: 0.1, color: [0.6, 0.9, 1], alpha: 0.5, frame: 0, layer: 0 }); }
          }
          if (e.thrower) { // fire-bottle skeleton: a little flame burns in its hand
            const SK = M.skeleton;
            if (Math.random() < dt * 8) { _v1.set(0.3, 1.25, 0.15).applyAxisAngle(_v2.set(0, 1, 0), e.yaw); FX.emit({ x: e.x + _v1.x * e.scale, y: _v1.y * e.scale + e.y, z: e.z + _v1.z * e.scale, vy: rand(0.6, 1.2), life: 0.35, size: 0.3, size1: 0.05, color: [1, 0.55, 0.12], alpha: 0.9, frame: 5, layer: 0, rot: 0 }); }
            if (e.cd <= 0 && d > SK.throwMin && d < SK.throwMax && G.state === 'playing') {
              e.cd = rand(SK.throwEvery[0], SK.throwEvery[1]); e.lunge = 1;
              Hazards.throwMolotov(e, hx + Hero.vx * 0.4 || hx, hz + Hero.vz * 0.4 || hz);
            }
          }
          if (e.slowT > 0) sp *= 0.5;
          if (e.key === 'spider') {
            const v = this.spiderAI(e, d, tx, tz);
            if (e.state !== 'walk') break;
            dirx = v.x; dirz = v.z; sp *= v.s;
          }
          mvx = dirx * sp; mvz = dirz * sp;
          e.phase += dt * sp * (e.def.anim === 'shamble' || e.def.anim === 'mummy' ? 3.2 : e.def.anim === 'spider' ? 7 : 4.8);
          if (d <= reach) { e.state = 'attack'; e.stateT = 0; e.attackT = Math.max(e.attackT, CONFIG.hero.attackWindup); }
          else if (e.key === 'werewolf' && e.cd <= 0 && d < M.werewolf.leapRange && d > 2.2) { e.state = 'crouch'; e.stateT = 0; SFX.play('growl', { gap: 0.3 }); }
          else if (e.key === 'ghoul' && e.cd <= 0 && d < M.ghoul.leapRange && d > M.ghoul.minRange) { e.state = 'crouch'; e.stateT = 0; SFX.play('snarl', { gap: 0.25 }); }
          if (e.def.burrow && d > 6) { e.burrowCD -= dt; if (e.burrowCD <= 0) { e.state = 'burrow'; e.stateT = 0; SFX.play('spawn'); } }
          if (e.def.boss) this.bossAI(e, dt, d);
          break;
        }
        case 'attack': {
          if (e.def.boss && e.stagger > 0) { e.stagger -= dt; if (d > reach + 0.35) e.state = 'walk'; break; }
          e.attackT -= dt;
          if (e.attackT <= 0) {
            e.attackT = e.def.attackRate; e.lunge = 1;
            const bit = Combat.hurtHero(e.damage, e);
            if (bit && e.key === 'vampire') { // drinks Sir's blood and heals
              e.hp = Math.min(e.maxHp, e.hp + M.vampire.lifesteal);
              for (let i = 0; i < 5; i++) FX.emit({ x: hx, y: 1.3, z: hz, vx: (e.x - hx) * 2 + rand(-0.5, 0.5), vy: rand(0.5, 1.5), vz: (e.z - hz) * 2 + rand(-0.5, 0.5), life: 0.5, size: 0.28, color: [0.9, 0.1, 0.18], alpha: 1, frame: 27, layer: 0 });
            }
            if (bit && e.key === 'zombie') Hero.slowT = Math.max(Hero.slowT || 0, M.zombie.grabSlow); // grabbed!
            if (e.key === 'werewolf') FX.emit({ x: hx, y: 1.1, z: hz, size: 1.6, color: [1, 0.85, 0.75], alpha: 0.9, life: 0.25, frame: 19, layer: 0, rot: rand(-0.5, 0.5) });
          }
          if (d > reach + 0.35) e.state = 'walk';
          if (e.def.boss) this.bossAI(e, dt, d);
          break;
        }
        case 'crouch': { // werewolf (or ghoul) winds up a leap: the arrow on the ground shows where
          const W = M[e.key], k = clamp(e.stateT / W.crouch, 0, 1), big = e.key === 'werewolf' ? 1 : 0.65;
          FX.decal.push(e.x + tx * 1.4 * big, 0.06, e.z + tz * 1.4 * big, (1.1 + 0.4 * k) * big, 1, 0.2, 0.1, 0.5 + 0.4 * k, Math.atan2(-tx, -tz), 8);
          FX.decal.push(hx, 0.06, hz, (2.2 - 0.6 * k) * big, 1, 0.25, 0.1, 0.35 + 0.4 * k, time * 2, 23);
          if (e.stateT >= W.crouch) {
            e.state = 'leap'; e.stateT = 0; e.lx0 = e.x; e.lz0 = e.z;
            let gx = hx + Hero.vx * 0.22, gz = hz + Hero.vz * 0.22; // aims a little ahead of Sir
            const gd = Math.hypot(gx - e.x, gz - e.z), maxL = W.leapRange + 1.6;
            if (gd > maxL) { gx = e.x + (gx - e.x) / gd * maxL; gz = e.z + (gz - e.z) / gd * maxL; }
            e.lx1 = gx; e.lz1 = gz; SFX.play('whoosh', { vol: 1.2 });
          }
          break;
        }
        case 'leap': {
          const W = M[e.key], k = clamp(e.stateT / W.leapTime, 0, 1);
          e.x = lerp(e.lx0, e.lx1, k); e.z = lerp(e.lz0, e.lz1, k); e.y = Math.sin(k * Math.PI) * (W.height || 1.5);
          const lx = e.lx1 - e.lx0, lz = e.lz1 - e.lz0, ll = Math.hypot(lx, lz) || 1; e.fx = lx / ll; e.fz = lz / ll;
          if (k >= 1) {
            e.y = 0; e.state = 'recover'; e.stateT = 0; e.cd = W.cooldown;
            FX.ring(e.x, e.z, 0.4, 2.2, [1, 0.6, 0.4], 0.35, 0.8, 4); FX.smoke(e.x, 0.1, e.z, 5, { size: 0.7, alpha: 0.35 });
            SFX.play('thud', { gap: 0.05, vol: e.key === 'werewolf' ? 1 : 0.5 }); addShake(e.key === 'werewolf' ? 0.12 : 0.05);
            if (Math.hypot(hx - e.x, hz - e.z) < W.hitRadius) {
              Combat.hurtHero(W.leapDamage * (e.elite ? 1.5 : 1), e);
              FX.emit({ x: hx, y: 1.1, z: hz, size: 2.0, color: [1, 0.8, 0.7], alpha: 1, life: 0.3, frame: 19, layer: 0, rot: rand(-0.5, 0.5) });
            }
          }
          break;
        }
        case 'recover': { // dazed after a leap (or a hit while crouching)
          if (Math.random() < dt * 6) { const a = time * 7; FX.spark(e.x + Math.cos(a) * 0.35, 1.9 * e.scale, e.z + Math.sin(a) * 0.35, -Math.sin(a), 0.2, Math.cos(a), [1, 0.9, 0.3], 0.4, 0.18, 0, 12); }
          if (e.stateT >= M[e.key].recover) e.state = 'walk';
          break;
        }
        case 'shoot': { // spider rears up and spits web at the pumpkin (or at Sir)
          const S = M.spider;
          if (!e.shot && e.stateT >= 0.4) {
            e.shot = true;
            const P = Pumpkin, pd = Math.hypot(P.x - e.x, P.z - e.z);
            if (P.free && pd < S.shootRange) Hazards.shootWeb(e, P.x + P.vx * 0.15, P.z + P.vz * 0.15);
            else Hazards.shootWeb(e, hx + Hero.vx * 0.3, hz + Hero.vz * 0.3);
          }
          if (e.stateT >= 0.75) { e.state = 'walk'; e.cd = S.shootEvery * rand(0.85, 1.2); }
          break;
        }
        case 'burrow': { // sink into the ground
          const k = clamp(e.stateT / 0.45, 0, 1); e.y = -1.6 * k;
          if (Math.random() < dt * 30) FX.smoke(e.x, 0.05, e.z, 1, { color: [0.35, 0.28, 0.22], size: 0.45, alpha: 0.5, up: 0.6 });
          if (k >= 1) { e.state = 'under'; e.stateT = 0; e.underTime = rand(0.9, 1.4); }
          break;
        }
        case 'under': { // travel underground leaving a dirt trail
          mvx = tx * 5.2; mvz = tz * 5.2; e.y = -1.6;
          if (Math.random() < dt * 22) FX.emit({ x: e.x + rand(-0.2, 0.2), y: 0.05, z: e.z + rand(-0.2, 0.2), size: rand(0.5, 0.8), color: [0.22, 0.17, 0.13], alpha: 0.8, life: 1.6, frame: 13, layer: 3 });
          if (e.stateT > e.underTime || d < 4.5) { e.state = 'rise'; e.stateT = 0; e.burrowCD = rand(6, 9); FX.burst(e.x, 0.2, e.z, 8, { color: [0.35, 0.27, 0.2], frame: 1, size: 0.2, gravity: -14, layer: 1 }); }
          break;
        }
      }
      // knockback velocity
      const kd = Math.exp(-5.5 * dt);
      e.kvx *= kd; e.kvz *= kd;
      e.x += (mvx + e.kvx) * dt; e.z += (mvz + e.kvz) * dt;
      // face Sir (or the flight / leap direction)
      if (e.state !== 'under') e.yaw = angleLerp(e.yaw, Math.atan2(e.fx, e.fz), 1 - Math.exp(-(e.def.flying ? 4 : 6) * dt));
      if (e.state === 'jump' || e.state === 'enter' || e.state === 'flyin') continue;
      // keep inside the courtyard and out of the towers
      const n = World.solidPush(e, e.radius);
      if (n) { const vn = e.kvx * n.x + e.kvz * n.z; if (vn < 0) { e.kvx -= n.x * vn * 1.3; e.kvz -= n.z * vn * 1.3; } }
      if (e.state === 'under' || this.airborne(e) || e.state === 'leap' || e.state === 'swarm' || e.untouchable) continue;
      // walkers slide around the gravestones
      Obstacles.push(e, e.radius * e.scale * 0.9);
      // don't walk through Sir
      const dx = e.x - hx, dz = e.z - hz, dd = Math.hypot(dx, dz), minD = heroR + e.radius * e.scale * 0.8;
      if (dd < minD && dd > 1e-4) { e.x = hx + dx / dd * minD; e.z = hz + dz / dd * minD; }
    }
    // separation and bowling chains
    const near = this._near;
    for (const e of this.list) {
      if (!e.alive || this.airborne(e) || e.state === 'under' || e.state === 'jump' || e.state === 'leap' || e.state === 'swarm' || e.untouchable) continue;
      grid.query(e.x, e.z, 2.6, near);
      const kv = Math.hypot(e.kvx, e.kvz);
      for (const o of near) {
        if (o === e || !o.alive || o.state === 'under') continue;
        const dx = o.x - e.x, dz = o.z - e.z; const d2 = dx * dx + dz * dz; const rr = (e.radius * e.scale + o.radius * o.scale) * 0.92;
        if (d2 > rr * rr || d2 < 1e-8) continue;
        const d = Math.sqrt(d2), push = (rr - d) * 0.5; const nx = dx / d, nz = dz / d;
        const fixedE = e.state === 'disguise' || e.state === 'egg', fixedO = o.state === 'disguise' || o.state === 'egg';
        if (fixedO && fixedE) continue;
        const wE = fixedE ? 0 : fixedO ? 1 : o.mass / (e.mass + o.mass), wO = fixedO ? 0 : fixedE ? 1 : e.mass / (e.mass + o.mass);
        e.x -= nx * push * wE; e.z -= nz * push * wE; o.x += nx * push * wO; o.z += nz * push * wO;
        if (kv > 7 && G.time - o.chainT > 0.35 && (e.kvx * nx + e.kvz * nz) > 3) Combat.bowl(e, o, kv, nx, nz);
      }
    }
    // remove dead
    for (let i = this.list.length - 1; i >= 0; i--) if (!this.list[i].alive) this.list.splice(i, 1);
    // debris physics
    for (let i = this.debris.length - 1; i >= 0; i--) {
      const d = this.debris[i]; d.age += dt;
      if (d.age >= d.life) { this.debris.splice(i, 1); continue; }
      d.vy -= 22 * dt; d.p.x += d.vx * dt; d.p.y += d.vy * dt; d.p.z += d.vz * dt;
      if (d.p.y < d.ground) { d.p.y = d.ground; d.vy = Math.abs(d.vy) > 2 ? -d.vy * 0.35 : 0; d.vx *= 0.6; d.vz *= 0.6; d.wx *= 0.6; d.wy *= 0.6; d.wz *= 0.6; }
      const w = Math.hypot(d.wx, d.wy, d.wz);
      if (w > 1e-3) { _q1.setFromAxisAngle(_v1.set(d.wx / w, d.wy / w, d.wz / w), w * dt); d.q.premultiply(_q1).normalize(); }
    }
  },

  // ---------------- special moves ----------------
  // witch: a point on a circle around Sir, a little ahead in her flight direction
  orbitPoint(e, hx, hz) {
    const R = CONFIG.moves.witch.orbit;
    const a = Math.atan2(e.z - hz, e.x - hx) + e.side * 0.7;
    let ox = hx + Math.cos(a) * R, oz = hz + Math.sin(a) * R;
    const r = Math.hypot(ox, oz), lim = 13.8; if (r > lim) { ox *= lim / r; oz *= lim / r; }
    this._orb.x = ox; this._orb.z = oz;
    return this._orb;
  },
  witchAI(e, dt, hx, hz, d) {
    const W = CONFIG.moves.witch;
    const o = this.orbitPoint(e, hx, hz);
    const dx = o.x - e.x, dz = o.z - e.z, dl = Math.hypot(dx, dz) || 1;
    const sp = e.speed * clamp(dl / 2.2, 0.4, 1) * (e.spinT > 0 ? 0.3 : 1);
    e.y = W.height + Math.sin(G.realTime * 2.2 + e.sway) * 0.18 - e.spinT * 0.4;
    e.fx = dx / dl; e.fz = dz / dl;
    if (Math.random() < dt * 0.2) e.side = -e.side; // now and then she turns around
    if (e.cd <= 0 && d < W.orbit + 4 && e.spinT <= 0) {
      e.cd = W.throwEvery * rand(0.85, 1.2); e.lunge = 1;
      const lead = W.potionFlight * 0.5; // aims where Sir is heading
      Hazards.throwPotion(e, clamp(hx + Hero.vx * lead, -14, 14), clamp(hz + Hero.vz * lead, -14, 14));
    }
    const v = this._mv; v.x = dx / dl * sp; v.z = dz / dl * sp;
    return v;
  },
  // spider: zigzags closer, then circles at a distance and spits web
  spiderAI(e, d, tx, tz) {
    const S = CONFIG.moves.spider, v = this._mv;
    const zig = Math.sin(G.realTime * 5 + e.sway) * 0.75;
    let x = tx - tz * zig, z = tz + tx * zig, s = 1;
    if (d < S.keep + 1 && d > 2.3) {
      if (e.cd <= 0) { e.state = 'shoot'; e.stateT = 0; e.shot = false; v.x = 0; v.z = 0; v.s = 0; return v; }
      const back = d < S.keep ? -0.55 : 0.15;
      x = -tz * e.side + tx * back; z = tx * e.side + tz * back; s = 0.75;
    }
    const l = Math.hypot(x, z) || 1; v.x = x / l; v.z = z / l; v.s = s;
    return v;
  },

  // bats: flutter in towards Sir on a wavy path, bite, flit away and come back
  batAI(e, dt, d, tx, tz) {
    const B = CONFIG.moves.bat, v = this._mv;
    e.y = B.height + Math.sin(G.realTime * 7 + e.sway) * 0.18;
    e.phase += dt * 24; e.modeT += dt;
    let x = tx, z = tz, sp = e.speed * (e.slowT > 0 ? 0.5 : 1);
    if (e.mode === 'away') { const w = Math.sin(G.realTime * 3 + e.sway); x = -tx - tz * w; z = -tz + tx * w; sp *= 0.8; if (e.modeT > B.away) e.mode = 'in'; }
    else {
      const w = Math.sin(G.realTime * 5 + e.sway) * 0.8; x = tx - tz * w; z = tz + tx * w;
      if (d < 0.7 + e.radius) { Combat.hurtHero(e.damage, e); e.mode = 'away'; e.modeT = 0; e.lunge = 1; SFX.play('squeak', { gap: 0.15 }); }
    }
    const l = Math.hypot(x, z) || 1; v.x = x / l * sp; v.z = z / l * sp; e.fx = x / l; e.fz = z / l;
    return v;
  },

  bossAI(e, dt, d) {
    if (e.stagger > 0) return;
    e.summonCD -= dt; e.slamCD -= dt;
    if (e.summonCD <= 0) {
      e.summonCD = 7.5;
      SFX.play('roar');
      for (let i = 0; i < 3 + (G.time > 330 ? 1 : 0); i++) {
        const a = Math.atan2(e.z, e.x) + rand(-0.8, 0.8); const r = clamp(Math.hypot(e.x, e.z) + rand(-2, 1), 5, 14);
        this.spawn('rutabaga', a, { radius: r });
      }
    }
    if (e.slamT < 0 && e.slamCD <= 0 && d < 7.5) { e.slamT = 0; SFX.play('roar'); }
    if (e.slamT >= 0) {
      e.slamT += dt;
      const k = e.slamT / 1.4;
      FX.decal.push(e.x, 0.06, e.z, (1.5 + 15 * k), 1, 0.15, 0.1, 0.5 + 0.3 * Math.sin(G.realTime * 20), 0, 15);
      if (e.slamT >= 1.4) { e.slamT = -1; e.slamCD = 6.5; Combat.bossSlam(e); }
    }
  },

  render() {
    const time = G.realTime;
    for (const key in this.batches) this.batches[key].begin();
    for (const e of this.list) {
      if (!e.alive) continue;
      const batch = this.batches[e.key];
      if (e.state === 'swarm' || (e.def.boss && e.key !== 'king' && e.swarm)) { this.renderSwarm(e, time); if (e.state === 'swarm') continue; }
      this.animate(e, time);
      this.rootMatrix(e, _m1);
      if (e.spawnScale !== undefined && e.spawnScale < 1) { const s = Math.max(0.001, e.spawnScale); _m2.makeScale(s, s, s); _m1.multiply(_m2); }
      if (e.vis < 1) { const s = Math.max(0.001, e.vis); _m2.makeScale(s, s, s); _m1.multiply(_m2); }
      const f = e.flash;
      const B = CONFIG.enemyBright; // a little brighter than the dark courtyard so they pop out
      let r = B + f * 2.2, g = B + f * 1.6, b = B + f * 1.2;
      if (e.elite) { r *= 1.2; g *= 0.85; b *= 1.35; }
      if (e.frozenT > 0) { r *= 0.62; g *= 0.92; b *= 1.6; if (Math.random() < 0.06) FX.emit({ x: e.x + rand(-0.4, 0.4), y: rand(0.4, 1.6) * e.scale, z: e.z + rand(-0.4, 0.4), vy: 0.3, life: 0.8, size: 0.22, color: [0.75, 0.95, 1], alpha: 0.9, frame: 25, layer: 0 }); }
      batch.push(_m1, e.pose, r, g, b);
      if (e.key === 'egg') FX.add.push(e.x, 0.4, e.z, 1.4 + 0.3 * Math.sin(time * (6 + e.stateT * 3)), 0.8, 0.35, 1, 0.25, 0, 0);
      if (e.state === 'disguise' && e.stateT > CONFIG.moves.scarecrow.wakeAfter - 3) FX.add.push(e.x, 2.1, e.z, 1.0, 1, 0.7, 0.2, 0.3 + 0.2 * Math.sin(time * 12), 0, 0);
      if (e.def.boss && e.key !== 'king') Bosses.render(e, time);
      // readability: a dark contact shadow and a faint red threat ring under every normal enemy
      if (!e.def.boss && !e.def.flying && e.state !== 'disguise' && e.state !== 'under') {
        const sz = (e.radius * 2 + 0.9) * e.scale;
        FX.decalA.push(e.x, 0.034, e.z, sz * 1.15, 0, 0, 0, 0.5, 0, 11);
        FX.decal.push(e.x, 0.042, e.z, sz, 1, 0.22, 0.12, 0.32 + 0.06 * Math.sin(time * 3 + e.phase), 0, 15);
      }
      // elite aura and ghost glow
      if (e.elite) FX.decal.push(e.x, 0.05, e.z, 2.4 * e.scale, 0.75, 0.3, 1, 0.45, time, 15);
      if (e.def.ghost) FX.add.push(e.x, 1.0 + e.y, e.z, 2.2, 0.4, 0.75, 1, 0.22, 0, 0);
      if (e.def.boss) FX.decal.push(e.x, 0.05, e.z, 5.5, 0.9, 0.5, 1, 0.3, time * 0.5, 15);
      if (e.def.flying) {
        FX.decalA.push(e.x, 0.04, e.z, 1.6, 0, 0, 0, 0.35, 0, 11); // shadow on the floor
        FX.add.push(e.x, e.y + 0.6, e.z, 2.0, 0.6, 0.3, 1, 0.2, 0, 0);
        if (Math.random() < 0.35) FX.emit({ x: e.x - e.fx * 0.8, y: e.y + 0.45, z: e.z - e.fz * 0.8, vy: rand(-0.3, 0.3), life: 0.7, size: 0.22, size1: 0.02, color: [0.55, 1, 0.45], alpha: 0.9, frame: 12, layer: 0 });
      }
      if (e.key === 'werewolf' && e.state !== 'recover') {
        const hy = (e.state === 'crouch' ? 1.25 : 1.55) * e.scale + e.y;
        FX.add.push(e.x + e.fx * 0.3, hy, e.z + e.fz * 0.3, 0.7, 1, 0.75, 0.2, e.state === 'crouch' ? 0.9 : 0.45, 0, 0);
      }
    }
    PowerUps.renderBats(this.batches.bat, this._batPose || (this._batPose = makePose(this.tpls.bat)), time);
    for (const d of this.debris) {
      const batch = this.batches[d.key];
      const k = d.age / d.life; const sc = k > 0.75 ? 1 - (k - 0.75) / 0.25 : 1;
      _v2.copy(d.s).multiplyScalar(Math.max(0.001, sc));
      _m2.compose(d.p, d.q, _v2);
      _m3.makeTranslation(-d.c.x, -d.c.y, -d.c.z);
      _m2.multiply(_m3);
      batch.pushPiece(d.piece, _m2, d.tint[0], d.tint[1], d.tint[2]);
    }
    for (const key in this.batches) this.batches[key].end();
  },

  // a vampire (or the Count) travelling as a cloud of bats
  renderSwarm(e, time) {
    const batch = this.batches.bat, pose = this._batPose || (this._batPose = makePose(this.tpls.bat)), pi = this.parts.bat;
    const n = e.def.boss ? 12 : 7, R = e.def.boss ? 1.1 : 0.7;
    for (let i = 0; i < n; i++) {
      const a = time * (3 + (i % 3)) + i * 2.4, rr = R * (0.5 + 0.5 * Math.sin(i * 1.7 + time * 2));
      const x = e.x + Math.cos(a) * rr, z = e.z + Math.sin(a) * rr, y = 1.0 + Math.sin(time * 6 + i) * 0.4 + (i % 2) * 0.4;
      resetPose(pose); _poseTarget = pose;
      const fl = Math.sin(time * 28 + i * 1.3); poseAdd(pi.WingL, 2, fl * 0.9); poseAdd(pi.WingR, 2, -fl * 0.9);
      _v3.set(x, y, z); _q1.setFromAxisAngle(_v2.set(0, 1, 0), a + Math.PI); _v2.set(0.85, 0.85, 0.85);
      batch.push(_m1.compose(_v3, _q1, _v2), pose, 1, 0.8, 0.9);
    }
    if (Math.random() < 0.3) FX.emit({ x: e.x + rand(-0.5, 0.5), y: rand(0.8, 1.8), z: e.z + rand(-0.5, 0.5), vy: 0.4, life: 0.6, size: 0.6, size1: 0.1, color: [0.35, 0.05, 0.12], alpha: 0.5, frame: 2, layer: 1 });
  },

  // procedural animation -> pose
  animate(e, time) {
    const p = e.pose; resetPose(p); const pi = this.parts[e.key];
    _poseTarget = p; const set = poseAdd;
    const ph = e.phase, id = e.id;
    const moving = e.state === 'walk' || e.state === 'enter' || (e.state === 'boss' && e.moving);
    switch (e.def.anim) {
      case 'walker': {
        const a = moving ? 1 : 0.15;
        set(pi.LegL, 0, Math.sin(ph) * 0.6 * a); set(pi.LegR, 0, -Math.sin(ph) * 0.6 * a);
        set(pi.ArmL, 0, -Math.sin(ph) * 0.5 * a); set(pi.ArmR, 0, Math.sin(ph) * 0.5 * a);
        set(pi.Body, 4, Math.abs(Math.cos(ph)) * 0.04 * a); set(pi.Body, 2, Math.sin(ph) * 0.06 * a);
        set(pi.Head, 2, Math.sin(time * 17 + id) * 0.07); set(pi.Head, 0, Math.sin(time * 9 + id) * 0.05);
        set(pi.Jaw, 0, Math.max(0, Math.sin(time * 11 + id)) * 0.25);
        break;
      }
      case 'shamble': {
        const a = moving ? 1 : 0.3;
        set(pi.LegL, 0, Math.sin(ph) * 0.38 * a); set(pi.LegR, 0, -Math.sin(ph) * 0.38 * a);
        set(pi.Body, 2, Math.sin(ph) * 0.13); set(pi.ArmL, 0, Math.sin(ph * 0.5) * 0.18); set(pi.ArmR, 0, -Math.sin(ph * 0.5 + 1) * 0.18);
        set(pi.Head, 2, Math.sin(ph * 0.5) * 0.22); set(pi.Head, 0, Math.sin(time * 1.3 + id) * 0.1);
        set(pi.Jaw, 0, 0.12 + Math.sin(time * 3 + id) * 0.12);
        break;
      }
      case 'mummy': {
        const a = moving ? 1 : 0.25;
        set(pi.LegL, 0, Math.sin(ph) * 0.3 * a); set(pi.LegR, 0, -Math.sin(ph) * 0.3 * a);
        set(pi.ArmL, 0, Math.sin(ph * 0.5 + 0.5) * 0.14); set(pi.ArmR, 0, Math.sin(ph * 0.5 + 2) * 0.14);
        set(pi.Body, 2, Math.sin(ph) * 0.08 * a); set(pi.Body, 1, Math.sin(ph) * 0.05 * a);
        set(pi.Head, 2, Math.sin(time * 1.1 + id) * 0.16); set(pi.Head, 0, Math.sin(time * 0.7 + id) * 0.08);
        set(pi.Tail, 1, Math.sin(time * 3.2 + id) * 0.45); set(pi.Tail, 0, Math.sin(time * 2.1 + id) * 0.15);
        break;
      }
      case 'float': {
        set(pi.Body, 4, 0.12 + Math.sin(time * 2.5 + id) * 0.14); set(pi.Body, 2, Math.sin(time * 1.7 + id) * 0.12);
        set(pi.ArmL, 2, Math.sin(time * 4 + id) * 0.35); set(pi.ArmR, 2, -Math.sin(time * 4 + id + 1) * 0.35);
        break;
      }
      case 'hop': {
        const air = e.hop < 0.55 && moving; const land = !air && moving ? Math.max(0, 1 - (e.hop - 0.55) / 0.2) : 0;
        set(pi.Body, 7, -0.22 * land + (air ? 0.12 : 0)); set(pi.Body, 6, 0.12 * land); set(pi.Body, 8, 0.12 * land);
        set(pi.LegL, 0, air ? -0.6 : 0); set(pi.LegR, 0, air ? -0.6 : 0);
        set(pi.ArmL, 2, (air ? 0.7 : 0.1) + Math.sin(time * 9 + id) * 0.2); set(pi.ArmR, 2, -(air ? 0.7 : 0.1) - Math.sin(time * 9 + id) * 0.2);
        set(pi.Head, 2, Math.sin(time * 6 + id) * 0.25);
        break;
      }
      case 'spider': {
        const a = moving ? 1 : 0.15;
        const s1 = Math.sin(ph), c1 = Math.cos(ph);
        // two groups of four legs step in turn: L1 R2 L3 R4 and R1 L2 R3 L4
        const groups = [[pi.LegL, 1, 1], [pi.LegR2, -1, 1], [pi.LegL3, 1, 1], [pi.LegR4, -1, 1], [pi.LegR, -1, -1], [pi.LegL2, 1, -1], [pi.LegR3, -1, -1], [pi.LegL4, 1, -1]];
        for (const [part, side, grp] of groups) {
          set(part, 1, s1 * grp * 0.3 * a);                              // swing forwards and back
          set(part, 2, side * Math.max(0, c1 * grp) * 0.35 * a);          // lift while swinging
        }
        set(pi.Body, 4, Math.abs(Math.sin(ph * 2)) * 0.025 * a);
        set(pi.Body, 2, Math.sin(ph) * 0.04 * a);
        if (e.state === 'shoot') { const k = Math.sin(clamp(e.stateT / 0.75, 0, 1) * Math.PI); set(pi.Body, 0, -0.5 * k); set(pi.Body, 4, 0.12 * k); }
        set(pi.Jaw, 1, Math.sin(time * 14 + id) * 0.15);
        break;
      }
      case 'witch': {
        set(pi.LegL, 0, 0.1 + Math.sin(time * 3 + id) * 0.18); set(pi.LegR, 0, 0.1 + Math.sin(time * 3 + id + 1.3) * 0.18);
        set(pi.Cape, 0, 0.35 + Math.sin(time * 9 + id) * 0.14); set(pi.Cape, 2, Math.sin(time * 5 + id) * 0.08);
        set(pi.Head, 2, Math.sin(time * 1.7 + id) * 0.12); set(pi.Head, 1, Math.sin(time * 0.9 + id) * 0.25);
        set(pi.ArmL, 2, Math.sin(time * 2 + id) * 0.08);
        set(pi.Body, 2, Math.sin(time * 1.3 + id) * 0.1);
        if (e.lunge > 0) { const k = Math.sin(e.lunge * Math.PI); set(pi.ArmR, 0, -2.4 * k); set(pi.Body, 1, 0.3 * k); }
        break;
      }
      case 'wolf': {
        const a = moving ? 1 : 0.2;
        set(pi.LegL, 0, Math.sin(ph) * 0.8 * a); set(pi.LegR, 0, -Math.sin(ph) * 0.8 * a);
        set(pi.ArmL, 0, -Math.sin(ph) * 0.85 * a); set(pi.ArmR, 0, Math.sin(ph) * 0.85 * a);
        set(pi.Body, 4, Math.abs(Math.cos(ph)) * 0.07 * a); set(pi.Body, 0, 0.08 * a);
        set(pi.Tail, 1, Math.sin(ph * 0.5 + id) * 0.45); set(pi.Tail, 0, Math.sin(time * 3 + id) * 0.1);
        set(pi.Head, 0, Math.sin(time * 4 + id) * 0.05);
        set(pi.Jaw, 0, 0.15 + Math.max(0, Math.sin(time * 6 + id)) * 0.2);
        if (e.state === 'crouch') {
          const k = smooth(clamp(e.stateT / CONFIG.moves.werewolf.crouch, 0, 1));
          set(pi.Body, 4, -0.22 * k); set(pi.Body, 0, 0.45 * k); set(pi.LegL, 0, -0.6 * k); set(pi.LegR, 0, -0.6 * k);
          set(pi.ArmL, 0, 0.5 * k); set(pi.ArmR, 0, 0.5 * k); set(pi.Head, 0, -0.35 * k); set(pi.Jaw, 0, 0.35 * k);
        }
        if (e.state === 'leap') { set(pi.ArmL, 0, -1.7); set(pi.ArmR, 0, -1.7); set(pi.LegL, 0, 0.8); set(pi.LegR, 0, 0.8); set(pi.Body, 0, 0.35); set(pi.Jaw, 0, 0.45); }
        if (e.state === 'recover') { set(pi.Head, 2, Math.sin(time * 9) * 0.3); set(pi.Body, 2, Math.sin(time * 6) * 0.12); }
        break;
      }
      case 'ghoul': { // gallops on all fours
        const a = moving ? 1 : 0.25;
        set(pi.ArmL, 0, Math.sin(ph) * 0.75 * a); set(pi.ArmR, 0, -Math.sin(ph) * 0.75 * a);
        set(pi.LegL, 0, -Math.sin(ph + 0.6) * 0.6 * a); set(pi.LegR, 0, Math.sin(ph + 0.6) * 0.6 * a);
        set(pi.Body, 4, Math.abs(Math.sin(ph)) * 0.06 * a); set(pi.Body, 0, Math.sin(ph * 2) * 0.05 * a);
        set(pi.Head, 0, Math.sin(ph * 2 + 0.5) * 0.08 * a); set(pi.Head, 2, Math.sin(time * 5 + id) * 0.12);
        set(pi.Jaw, 0, 0.15 + Math.max(0, Math.sin(time * 9 + id)) * 0.3);
        if (e.state === 'crouch') { const k = smooth(clamp(e.stateT / CONFIG.moves.ghoul.crouch, 0, 1)); set(pi.Body, 4, -0.14 * k); set(pi.Head, 0, 0.25 * k); set(pi.Jaw, 0, 0.4 * k); }
        if (e.state === 'leap') { set(pi.ArmL, 0, -1.1); set(pi.ArmR, 0, -1.1); set(pi.LegL, 0, 0.7); set(pi.LegR, 0, 0.7); set(pi.Jaw, 0, 0.5); }
        if (e.state === 'rise') { set(pi.ArmL, 0, -0.9 + Math.sin(time * 14) * 0.4); set(pi.ArmR, 0, -0.9 - Math.sin(time * 14) * 0.4); }
        break;
      }
      case 'scarecrow': {
        const S = e.state;
        if (S === 'disguise') { // arms out along the cross bar, head lolling
          set(pi.ArmL, 2, 1.45); set(pi.ArmR, 2, -1.45); set(pi.Head, 2, 0.35 + Math.sin(time * 0.8 + id) * 0.05);
          set(pi.Body, 2, Math.sin(time * 0.9 + id) * 0.03); set(pi.LegL, 0, 0.1); set(pi.LegR, 0, -0.05);
        } else {
          set(pi.Pole, 6, -0.999); set(pi.Pole, 7, -0.999); set(pi.Pole, 8, -0.999);
          const a = moving ? 1 : 0.3;
          set(pi.LegL, 0, Math.sin(ph) * 0.9 * a); set(pi.LegR, 0, -Math.sin(ph) * 0.9 * a);
          set(pi.ArmL, 0, -Math.sin(ph) * 0.8 * a); set(pi.ArmR, 0, Math.sin(ph) * 0.8 * a); set(pi.ArmL, 2, 0.5); set(pi.ArmR, 2, -0.5);
          set(pi.Head, 2, Math.sin(time * 13 + id) * 0.25); set(pi.Head, 0, Math.sin(time * 7 + id) * 0.15);
          set(pi.Body, 4, Math.abs(Math.cos(ph)) * 0.06 * a); set(pi.Body, 0, 0.15 * a);
          if (S === 'wake') { const k = clamp(e.stateT / 0.45, 0, 1); set(pi.ArmL, 2, 1.45 * (1 - k)); set(pi.ArmR, 2, -1.45 * (1 - k)); }
        }
        break;
      }
      case 'vampire': { // a smooth glide, the cape sways; the Count spreads his cape like bat wings
        const a = moving ? 1 : 0.15;
        set(pi.LegL, 0, Math.sin(ph) * 0.45 * a); set(pi.LegR, 0, -Math.sin(ph) * 0.45 * a);
        set(pi.ArmL, 0, -Math.sin(ph) * 0.2 * a); set(pi.ArmR, 0, Math.sin(ph) * 0.2 * a);
        set(pi.Cape, 0, 0.12 * a + Math.sin(time * 3 + id) * 0.05); set(pi.Cape, 2, Math.sin(time * 2.2 + id) * 0.04);
        set(pi.Head, 1, Math.sin(time * 0.9 + id) * 0.2); set(pi.Jaw, 0, e.lunge > 0 ? 0.3 : 0.04);
        const sp = e.wingSpread || 0, fl = Math.sin(time * 9) * 0.15 * sp;
        set(pi.WingL, 2, 0.95 * sp + fl); set(pi.WingL, 1, -0.5 * sp); set(pi.WingR, 2, -0.95 * sp - fl); set(pi.WingR, 1, 0.5 * sp);
        set(pi.WingL, 0, 0.1 * a + Math.sin(time * 2.6 + id) * 0.05); set(pi.WingR, 0, 0.1 * a + Math.sin(time * 2.6 + id + 1) * 0.05);
        if (e.armsUp) { set(pi.ArmL, 0, -1.6 * e.armsUp); set(pi.ArmR, 0, -1.6 * e.armsUp); set(pi.ArmL, 2, 0.4 * e.armsUp); set(pi.ArmR, 2, -0.4 * e.armsUp); }
        break;
      }
      case 'banshee': {
        const scream = e.state === 'scream' ? clamp(e.stateT / CONFIG.moves.banshee.windup, 0, 1) : 0;
        set(pi.Body, 4, 0.1 + Math.sin(time * 2.2 + id) * 0.12); set(pi.Body, 2, Math.sin(time * 1.3 + id) * 0.08);
        set(pi.ArmL, 0, Math.sin(time * 2.4 + id) * 0.2 - 0.6 * scream); set(pi.ArmR, 0, Math.sin(time * 2.4 + id + 1) * 0.2 - 0.6 * scream);
        set(pi.ArmL, 2, 0.6 * scream); set(pi.ArmR, 2, -0.6 * scream);
        set(pi.Cape, 0, 0.25 + Math.sin(time * 4 + id) * 0.15); set(pi.Cape, 1, Math.sin(time * 2 + id) * 0.2);
        set(pi.Head, 0, -0.45 * scream + (e.shot && e.state === 'scream' ? 0.3 : 0)); set(pi.Jaw, 0, 0.15 + 0.55 * scream + (e.shot && e.state === 'scream' ? 0.3 : 0));
        break;
      }
      case 'bat': {
        const fl = Math.sin(e.phase);
        set(pi.WingL, 2, fl * 1.0); set(pi.WingR, 2, -fl * 1.0); set(pi.Body, 4, -fl * 0.05);
        break;
      }
      case 'egg': {
        const k = clamp(e.stateT / CONFIG.moves.egg.hatch, 0, 1), p2 = Math.sin(time * (5 + k * 14)) * (0.04 + 0.08 * k);
        set(pi.Body, 6, p2); set(pi.Body, 7, -p2); set(pi.Body, 8, p2);
        break;
      }
      case 'horse': Bosses.animHorse(e, pi, set, time, moving); break;
      case 'reaper': Bosses.animReaper(e, pi, set, time); break;
      case 'root': {
        const a = moving ? 1 : 0.2;
        set(pi.LegL, 0, Math.sin(ph) * 0.45 * a); set(pi.LegR, 0, -Math.sin(ph) * 0.45 * a);
        set(pi.ArmL, 0, -Math.sin(ph) * 0.4 * a); set(pi.ArmR, 0, Math.sin(ph) * 0.4 * a);
        set(pi.Body, 2, Math.sin(ph) * 0.1 * a); set(pi.Body, 4, Math.abs(Math.cos(ph)) * 0.05 * a);
        set(pi.Head, 2, Math.sin(time * 3 + id) * 0.16); set(pi.Head, 0, Math.sin(time * 2.2 + id) * 0.1);
        if (e.def.boss && e.slamT >= 0) { const k = clamp(e.slamT / 1.4, 0, 1); set(pi.ArmR, 0, -2.4 * k); set(pi.ArmL, 0, -2.0 * k); set(pi.Body, 0, -0.25 * k); }
        break;
      }
    }
    // attack lunge, hit flinch
    if (e.lunge > 0 && !NO_LUNGE[e.def.anim]) { const k = Math.sin(e.lunge * Math.PI); set(pi.Body, 0, 0.45 * k); set(pi.ArmL, 0, -1.1 * k); set(pi.ArmR, 0, -1.1 * k); set(pi.Jaw, 0, 0.4 * k); }
    if (e.flinch > 0) set(pi.Body, 0, -0.35 * e.flinch);
  },
};

// =====================================================================
// 14. PICKUPS: glowing rutabagas (combo) and candy (experience)
// =====================================================================
const Pickups = {
  rutabagas: [], candies: [], spawnT: 3, rig: null, candyRigs: {},
  init(scene) {
    this.rig = new RigBatch(new RigTemplate(Assets.models.glowing_rutabaga), 12, { castShadow: true }).addTo(scene);
    for (const k of ['corn', 'wrapped', 'lolli', 'apple']) {
      const model = CONFIG.candy[k].model;
      this.candyRigs[k] = new RigBatch(new RigTemplate(Assets.models[model]), k === 'corn' ? 420 : 160, { castShadow: false }).addTo(scene);
    }
  },
  reset() { this.rutabagas.length = 0; this.candies.length = 0; this.spawnT = 2.5; },

  // ---------------- glowing rutabagas ----------------
  maxOnField() { return CONFIG.combo.maxOnField + (G.stats ? G.stats.sense : 0); },
  // a spot around Sir (r0..r1 metres away) inside the courtyard, away from other rutabagas and stones
  freeSpot(r0, r1, tries = 20) {
    for (let i = 0; i < tries; i++) {
      const a = rand(0, TAU), r = rand(r0, r1); const x = Hero.x + Math.cos(a) * r, z = Hero.z + Math.sin(a) * r;
      if (Math.hypot(x, z) > this.maxR) continue;
      if (this.rutabagas.every(o => Math.hypot(o.x - x, o.z - z) > 2.2) && Obstacles.list.every(o => Math.hypot(o.x - x, o.z - z) > 1.5)) return { x, z, a, r };
    }
    return null;
  },
  maxR: 14.6,
  spawnRutabaga(x, z, opts = {}) {
    if (this.rutabagas.length >= this.maxOnField() + (opts.extra ? 3 : 0)) return;
    const rr = Math.hypot(x, z);
    if (rr > this.maxR) { x *= this.maxR / rr; z *= this.maxR / rr; }
    this.rutabagas.push({ x, z, age: 0, life: opts.life || CONFIG.combo.lifetime, spin: rand(0, TAU), ph: rand(0, TAU) });
    FX.burst(x, 0.6, z, 10, { color: [1, 0.85, 0.3], frame: 12, size: 0.25, gravity: -2, life: 0.8, speed: 2.5, up: 2 });
  },
  spawnPattern() {
    const C = CONFIG.combo; const maxR = Math.min(C.maxRadius, G.stats.maxLength - 1.2);
    const room = this.maxOnField() - this.rutabagas.length;
    if (room <= 0) return;
    if (room >= 3 && Math.random() < C.trioChance) {
      // an arc of three around Sir that one swing can collect (an arc that fits inside the courtyard)
      for (let tries = 0; tries < 10; tries++) {
        const a0 = rand(0, TAU), r = rand(Math.max(C.minRadius, 5), maxR), span = rand(0.5, 0.9);
        const pts = [-1, 0, 1].map(i => [Hero.x + Math.cos(a0 + i * span) * r, Hero.z + Math.sin(a0 + i * span) * r]);
        if (pts.some(([x, z]) => Math.hypot(x, z) > this.maxR || Obstacles.list.some(o => Math.hypot(o.x - x, o.z - z) < 1.5))) continue;
        for (const [x, z] of pts) this.spawnRutabaga(x, z);
        break;
      }
    } else {
      const s = this.freeSpot(C.minRadius, maxR); if (s) this.spawnRutabaga(s.x, s.z);
    }
  },
  collectRutabaga(i) {
    const r = this.rutabagas[i]; this.rutabagas.splice(i, 1);
    FX.burst(r.x, 0.7, r.z, 16, { color: [1, 0.85, 0.3], frame: 3, size: 0.3, speed: 5, life: 0.7, gravity: -4 });
    FX.ring(r.x, r.z, 0.3, 2.4, [1, 0.8, 0.3], 0.45, 0.9);
    Rutabaga.collect(r.x, r.z); // fills the meter: Rutabaga Jam, or a Rutabagamageddon for three in one kick
  },

  // ---------------- candy ----------------
  dropCandy(type, x, z, n = 1) {
    for (let i = 0; i < n; i++) {
      if (this.candies.length > 520) { Progress.addXP(CONFIG.candy[type].xp || 0); continue; }
      const a = rand(0, TAU), sp = rand(1.2, 3.2);
      this.candies.push({ type, x, z, y: 0.6, vx: Math.cos(a) * sp, vz: Math.sin(a) * sp, vy: rand(3.5, 6), age: 0, spin: rand(0, TAU), vspin: rand(-6, 6), mag: 0 });
    }
  },
  collectCandy(i) {
    const c = this.candies[i]; this.candies.splice(i, 1);
    if (c.type === 'apple') {
      const heal = CONFIG.candy.apple.heal; Combat.heal(heal);
    } else {
      Progress.addXP(CONFIG.candy[c.type].xp * G.stats.xpMult);
      SFX.play('candy', { gap: 0.03 });
    }
    FX.emit({ x: c.x, y: 0.5, z: c.z, size: 0.7, size1: 0.1, color: c.type === 'apple' ? [1, 0.3, 0.3] : [1, 0.8, 0.5], alpha: 0.9, life: 0.3, frame: 12, layer: 0 });
  },

  // called from the pumpkin physics sub-steps
  pumpkinTouch() {
    const P = Pumpkin, rr = P.radius + 0.45, rr2 = rr * rr;
    for (let i = this.rutabagas.length - 1; i >= 0; i--) {
      const r = this.rutabagas[i]; const dx = r.x - P.x, dz = r.z - P.z;
      if (dx * dx + dz * dz < rr2) this.collectRutabaga(i);
    }
    const cr = (P.radius + 0.3) ** 2;
    for (let i = this.candies.length - 1; i >= 0; i--) {
      const c = this.candies[i]; if (c.age < 0.25) continue;
      const dx = c.x - P.x, dz = c.z - P.z; if (dx * dx + dz * dz < cr) this.collectCandy(i);
    }
  },

  update(dt) {
    const C = CONFIG.combo;
    // spawn glowing rutabagas
    this.spawnT -= dt;
    if (this.spawnT <= 0) { this.spawnT = C.spawnInterval * (1 - 0.18 * G.stats.sense) * rand(0.8, 1.2); this.spawnPattern(); }
    for (let i = this.rutabagas.length - 1; i >= 0; i--) {
      const r = this.rutabagas[i]; r.age += dt; r.spin += dt * 1.6;
      if (r.age > r.life) { FX.burst(r.x, 0.6, r.z, 8, { color: [1, 0.8, 0.3], frame: 12, size: 0.2, speed: 2, gravity: -1 }); this.rutabagas.splice(i, 1); continue; }
      if (Math.random() < dt * 4) FX.emit({ x: r.x + rand(-0.4, 0.4), y: rand(0.3, 1.0), z: r.z + rand(-0.4, 0.4), vy: rand(0.5, 1.2), life: 0.8, size: 0.16, size1: 0.02, color: [1, 0.9, 0.4], frame: 12, layer: 0 });
    }
    // candy physics + magnet
    const M = CONFIG.candy, mag = G.stats.magnet;
    for (let i = this.candies.length - 1; i >= 0; i--) {
      const c = this.candies[i]; c.age += dt; c.spin += c.vspin * dt;
      if (!c.magnet && (c.age < M.magnetDelay || c.y > 0.02)) {
        c.vy -= 18 * dt; c.y += c.vy * dt; c.x += c.vx * dt; c.z += c.vz * dt;
        if (c.y < 0.02) { c.y = 0.02; c.vy = Math.abs(c.vy) > 1.5 ? -c.vy * 0.3 : 0; c.vx *= 0.5; c.vz *= 0.5; }
        const rr = Math.hypot(c.x, c.z); if (rr > 16) { c.x *= 16 / rr; c.z *= 16 / rr; }
      } else {
        const dx = Hero.x - c.x, dz = Hero.z - c.z, d = Math.hypot(dx, dz) || 1e-3;
        c.magnet = true;
        c.mag = Math.min(M.magnetMax * mag, c.mag + M.magnetAccel * mag * dt);
        const step = Math.min(d, c.mag * dt);
        c.x += dx / d * step; c.z += dz / d * step;
        c.y = 0.02 + Math.min(0.6, c.mag * 0.04);
        if (d < 0.8) { this.collectCandy(i); continue; }
      }
    }
  },

  render() {
    const time = G.realTime;
    this.rig.begin();
    for (const r of this.rutabagas) {
      const appear = clamp(r.age / 0.4, 0, 1), fade = r.life - r.age < 3 ? (Math.sin(r.age * 18) > 0 ? 1 : 0.35) : 1;
      const bob = Math.sin(time * 3 + r.ph) * 0.14;
      const s = easeOutBack(appear) * 1.9;
      _q1.setFromAxisAngle(_v1.set(0, 1, 0), r.spin);
      _m1.compose(_v2.set(r.x, 0.75 + bob, r.z), _q1, _v3.set(s, s, s));
      this.rig.push(_m1, null, 1.25 * fade, 1.15 * fade, 1 * fade);
      const pulse = 0.85 + 0.15 * Math.sin(time * 5 + r.ph);
      FX.add.push(r.x, 0.8 + bob, r.z, 3.2 * pulse * appear, 1, 0.62, 0.12, 0.85 * fade, 0, 0);
      FX.add.push(r.x, 0.8 + bob, r.z, 1.2 * appear, 1, 0.95, 0.6, 0.9 * fade, time * 2, 3);
      FX.add.push(r.x, 1.9, r.z, 3.6 * appear, 1, 0.7, 0.2, 0.32 * fade * pulse, 0, 0, 0.16);
      FX.decal.push(r.x, 0.05, r.z, 3.0 * appear, 1, 0.55, 0.08, 0.5 * fade, 0, 0);
      FX.decal.push(r.x, 0.06, r.z, 2.1 * appear, 1, 0.62, 0.1, 0.85 * fade, -time * 0.8, 15);
    }
    this.rig.end();
    for (const k in this.candyRigs) this.candyRigs[k].begin();
    for (const c of this.candies) {
      const rig = this.candyRigs[c.type]; const s = c.type === 'corn' ? 1.9 : c.type === 'apple' ? 1.9 : 1.75;
      _q1.setFromAxisAngle(_v1.set(0, 1, 0), c.spin);
      _m1.compose(_v2.set(c.x, c.y + 0.05, c.z), _q1, _v3.set(s, s, s));
      rig.push(_m1, null);
      if (c.type === 'lolli' || c.type === 'apple') FX.add.push(c.x, c.y + 0.3, c.z, 1.1, 1, 0.5, 0.7, 0.25, 0, 0);
    }
    for (const k in this.candyRigs) this.candyRigs[k].end();
  },
};

// =====================================================================
// 15. COMBAT: hits, knockback, bowling chains, fire, seeds, shockwaves,
// the rutabaga blast and damage to Sir
// =====================================================================
const HIT_COLORS = { skeleton: [1, 0.95, 0.8], zombie: [0.6, 1, 0.4], ghost: [0.6, 0.9, 1], pumpkin: [1, 0.6, 0.2], rutabaga: [0.9, 0.5, 1], king: [0.9, 0.5, 1],
  mummy: [1, 0.93, 0.75], spider: [0.6, 1, 0.35], witch: [0.8, 0.5, 1], werewolf: [1, 0.8, 0.6] };
const Combat = {
  fires: [], seeds: [], blastQueue: [], strikeKick: -1, strikes: 0, lastPopT: 0,
  reset() { this.fires.length = 0; this.seeds.length = 0; this.blastQueue.length = 0; this.strikes = 0; this.strikeKick = -1; },

  pumpkinHits(h) {
    const P = Pumpkin, st = G.stats, C = CONFIG.pumpkin;
    const sp = P.speed;
    for (const e of Enemies.list) {
      if (!e.alive || e.untouchable || e.state === 'under' || e.state === 'burrow' || ((e.state === 'jump' || e.state === 'flyin') && e.y > 1.4) || (e.state === 'leap' && e.y > 1.0) || (e.state === 'rise' && e.stateT < 0.25) || (e.def.boss && e.y > 1.6)) continue;
      const er = e.radius * e.scale;
      const dx = e.x - P.x, dz = e.z - P.z; const rr = P.radius + er;
      const d2 = dx * dx + dz * dz; if (d2 > rr * rr) continue;
      const d = Math.sqrt(d2) || 1e-3; const nx = dx / d, nz = dz / d;
      // push apart (heavier enemies move less)
      const overlap = rr - d;
      if (e.def.boss) { P.x -= nx * overlap; P.z -= nz * overlap; }
      else { e.x += nx * overlap * 0.7; e.z += nz * overlap * 0.7; P.x -= nx * overlap * 0.3; P.z -= nz * overlap * 0.3; }
      if (G.time - e.hitT < 0.16) continue;
      e.hitT = G.time;
      let dirx = sp > 0.5 ? P.vx / sp : nx, dirz = sp > 0.5 ? P.vz / sp : nz;
      // mix in the contact normal so side hits push sideways
      dirx = dirx * 0.7 + nx * 0.3; dirz = dirz * 0.7 + nz * 0.3; const dl = Math.hypot(dirx, dirz) || 1; dirx /= dl; dirz /= dl;
      let dmg = 0;
      const ch = P.charge * P.charge; // a charged kick hits harder for its whole flight
      const PU = CONFIG.powerups, ghost = PowerUps.active('ghost');
      const boost = (PowerUps.active('hellfire') ? PU.hellfireDamage : 1) * (PowerUps.active('mega') ? PU.megaDamage : 1) * (ghost ? PU.ghostDamage : 1);
      if (sp >= C.minDamageSpeed) dmg = C.baseDamage * st.damageMult * clamp(sp / C.damageRefSpeed, 0.35, 2.3) * (P.power ? st.returnMult : 1) * (1 + C.chargeDamage * ch) * boost;
      const knock = (5 + sp * 0.55) * C.knockback * st.knockMult * (P.power ? 1.35 : 1);
      const killed = Enemies.damage(e, dmg, dirx, dirz, knock, 'pumpkin');
      // vampire fangs: every hit heals Sir (hearts fly over from the enemy)
      if (dmg > 0 && PowerUps.active('fangs')) {
        this.heal(Math.max(1, dmg * PU.fangsHeal), true);
        for (let i = 0; i < 2; i++) { const T = 0.45; FX.emit({ x: e.x, y: 1.2, z: e.z, vx: (Hero.x - e.x) / T + rand(-1, 1), vy: (1.4 - 1.2) / T + 1.2, vz: (Hero.z - e.z) / T + rand(-1, 1), life: T, size: 0.32, size1: 0.12, color: [1, 0.3, 0.45], alpha: 1, frame: 27, layer: 1, rot: 0, gravity: -2.6 }); }
        SFX.play('fangs', { gap: 0.12, vol: 0.5 });
      }
      // pumpkin response (a ghost pumpkin flies straight through without slowing down)
      const vn = P.vx * nx + P.vz * nz;
      if (ghost) { if (e.def.boss) P.power = false; }
      else if (e.def.boss) { if (vn > 0) { P.vx -= nx * vn * 1.6; P.vz -= nz * vn * 1.6; } P.power = false; }
      else if (!P.power) {
        const slow = clamp(0.09 * e.mass * st.slowMult, 0.03, 0.4) * (killed ? 0.5 : 1) * (1 - C.chargePierce * ch);
        P.vx *= 1 - slow; P.vz *= 1 - slow;
        if (vn > 0) { P.vx -= nx * vn * 0.25 * st.slowMult; P.vz -= nz * vn * 0.25 * st.slowMult; }
      }
      // feedback
      const big = dmg > 45 || (P.power && dmg > 0);
      const col = ghost ? [0.6, 0.85, 1] : (HIT_COLORS[e.key] || HIT_COLORS.rutabaga);
      FX.burst(P.x + nx * P.radius, 0.7, P.z + nz * P.radius, dmg > 0 ? 7 : 3, { color: col, frame: ghost ? 26 : 3, size: 0.24, speed: 5, life: 0.4, gravity: ghost ? 1 : -6 });
      if (dmg > 0) {
        SFX.play('bonk', { vol: clamp(sp / 18, 0.4, 1), pitch: rand(0.85, 1.2), gap: 0.03 });
        if (!killed) SFX.play(e.def.sound, { gap: 0.08 });
        addShake(big ? 0.16 : 0.05);
        if (big) hitstop(0.045);
        if (G.realTime - this.lastPopT > 0.35 && (big || Math.random() < 0.12)) { this.lastPopT = G.realTime; FX.text(pick(t('pops')), e.x, 2.0, e.z, 'pop', 0.7); }
        if (st.seeds > 0 && sp > 8) this.seedBurst(P.x, P.z, dirx, dirz);
      }
    }
  },

  // Spectral band upgrade: the band hurts enemies it sweeps through
  ropeHits(dt) {
    const st = G.stats, ghost = PowerUps.active('ghost'); if ((st.spectral <= 0 && !ghost) || !Pumpkin.free) return;
    const P = Pumpkin; const d = P.dist; if (d < 1.5) return;
    const hx = Hero.x, hz = Hero.z;
    const ux = (P.x - hx) / d, uz = (P.z - hz) / d; const rvx = P.vx - Hero.vx, rvz = P.vz - Hero.vz;
    const tang = Math.abs(rvx * -uz + rvz * ux);
    if (tang < 3) return;
    const side = Math.sign(rvx * -uz + rvz * ux);
    for (const e of Enemies.list) {
      if (!e.alive || e.state === 'under' || e.state === 'burrow') continue;
      const ex = e.x - hx, ez = e.z - hz;
      const s = ex * ux + ez * uz; if (s < 0.8 || s > d - P.radius) continue;
      const perp = Math.abs(ex * -uz + ez * ux); if (perp > e.radius * e.scale + 0.25) continue;
      if (G.time - (e.ropeT || -9) < 0.4) continue;
      e.ropeT = G.time;
      Enemies.damage(e, (8 + 6 * Math.max(st.spectral, ghost ? 1.5 : 0)) * st.damageMult, -uz * side, ux * side, 6, 'rope');
      FX.burst(e.x, 0.8, e.z, 5, { color: [0.5, 0.9, 1], frame: 3, size: 0.22, speed: 3, life: 0.4 });
    }
  },

  seedBurst(x, z, dx, dz) {
    const n = 2 + G.stats.seeds;
    for (let i = 0; i < n; i++) {
      const a = Math.atan2(dz, dx) + rand(-0.9, 0.9); const sp = rand(9, 14);
      this.seeds.push({ x, z, vx: Math.cos(a) * sp, vz: Math.sin(a) * sp, life: 0.55, age: 0 });
    }
    SFX.play('seed', { gap: 0.05 });
  },
  addFire(x, z) {
    if (this.fires.length > 70) this.fires.shift();
    this.fires.push({ x, z, age: 0, life: 1.0 + 0.3 * G.stats.flame, tick: 0 });
  },

  update(dt) {
    const st = G.stats;
    this.ropeHits(dt);
    // fire patches
    for (let i = this.fires.length - 1; i >= 0; i--) {
      const f = this.fires[i]; f.age += dt; f.tick -= dt;
      if (f.age > f.life) { this.fires.splice(i, 1); continue; }
      const k = 1 - f.age / f.life;
      if (Math.random() < dt * 14) FX.emit({ x: f.x + rand(-0.3, 0.3), y: 0.15, z: f.z + rand(-0.3, 0.3), vy: rand(1, 2.4), life: 0.5, size: 0.55 * k + 0.2, size1: 0.05, color: [1, 0.5, 0.12], alpha: 0.9, frame: 5, layer: 0, rot: 0 });
      FX.decalA.push(f.x, 0.04, f.z, 1.2, 0.08, 0.05, 0.04, 0.35 * k, 0, 13);
      if (f.tick <= 0) {
        f.tick = 0.25;
        for (const e of Enemies.list) {
          if (!e.alive || e.state === 'under') continue;
          const dx = e.x - f.x, dz = e.z - f.z; if (dx * dx + dz * dz > 0.9 * 0.9) continue;
          Enemies.damage(e, (10 + 7 * st.flame) * 0.25 * st.damageMult, 0, 0, 0, 'fire');
        }
      }
    }
    if (this.fires.length && Math.random() < dt * 3) SFX.play('fire', { gap: 0.2 });
    // seeds
    for (let i = this.seeds.length - 1; i >= 0; i--) {
      const s = this.seeds[i]; s.age += dt;
      if (s.age > s.life) { this.seeds.splice(i, 1); continue; }
      s.x += s.vx * dt; s.z += s.vz * dt;
      FX.alpha.push(s.x, 0.5, s.z, 0.22, 1, 0.95, 0.75, 1, Math.atan2(s.vx, s.vz), 10);
      for (const e of Enemies.list) {
        if (!e.alive || e.state === 'under' || e.def.boss && Math.random() < 0.5) continue;
        const dx = e.x - s.x, dz = e.z - s.z; const rr = e.radius * e.scale + 0.15;
        if (dx * dx + dz * dz < rr * rr) { Enemies.damage(e, (6 + 4 * st.seeds) * st.damageMult, s.vx / 12, s.vz / 12, 3, 'seed'); this.seeds.splice(i, 1); FX.burst(s.x, 0.5, s.z, 3, { color: [1, 0.95, 0.7], frame: 1, size: 0.12, speed: 2 }); break; }
      }
    }
    // rutabaga blast ripple
    for (let i = this.blastQueue.length - 1; i >= 0; i--) {
      const q = this.blastQueue[i]; q.t -= dt;
      if (q.t > 0) continue;
      this.blastQueue.splice(i, 1);
      const e = q.e; if (!e.alive) continue;
      const d = Math.hypot(e.x - q.x, e.z - q.z) || 1; const nx = (e.x - q.x) / d, nz = (e.z - q.z) / d;
      if (e.def.boss) Enemies.damage(e, e.maxHp * CONFIG.combo.blastBossDamage * st.blastMult, nx, nz, 4, 'blast');
      else { e.y = Math.max(e.y, 0); e.hp = 0; Enemies.kill(e, nx, nz, 16, 'blast'); }
      FX.burst(e.x, 1.0, e.z, 6, { color: [1, 0.8, 0.3], frame: 3, size: 0.3, speed: 6, life: 0.6 });
    }
  },

  catchShock() {
    const st = G.stats; const R = st.shockRadius;
    const hx = Hero.x, hz = Hero.z;
    FX.ring(hx, hz, 0.5, R, [1, 0.6, 0.2], 0.4, 1);
    FX.ring(hx, hz, 0.3, R * 0.8, [1, 0.9, 0.5], 0.3, 0.8, 4);
    SFX.play('shock'); addShake(0.25);
    for (const e of Enemies.list) {
      if (!e.alive || e.state === 'under') continue;
      const dx = e.x - hx, dz = e.z - hz, d = Math.hypot(dx, dz); if (d > R + e.radius) continue;
      Enemies.damage(e, st.shockDamage * st.damageMult, dx / (d || 1), dz / (d || 1), 11, 'shock');
    }
  },

  bowl(e, o, kv, nx, nz) {
    o.chainT = G.time;
    const st = G.stats;
    Enemies.damage(o, 9 * st.damageMult * (kv / 10), nx, nz, kv * 0.75, 'bowl');
    e.kvx *= 0.65; e.kvz *= 0.65;
    SFX.play('bonk', { vol: 0.4, pitch: 1.3, gap: 0.05 });
    if (this.strikeKick !== G.kicks) { this.strikeKick = G.kicks; this.strikes = 0; }
    this.strikes++;
    if (this.strikes === 3) { FX.text(t('strike'), o.x, 2.4, o.z, 'combo', 1.1); G.score += 100; }
  },

  heal(n, quiet = false) {
    if (G.state !== 'playing' && G.state !== 'levelup') return;
    const before = G.hp; G.hp = Math.min(G.maxHp, G.hp + n);
    if (G.hp > before && !quiet) { FX.text(t('heal', { n: Math.round(G.hp - before) }), Hero.x, 2.8, Hero.z, 'heal', 1.1); SFX.play('heal'); FX.burst(Hero.x, 1, Hero.z, 14, { color: [0.4, 1, 0.5], frame: 12, size: 0.3, speed: 2, up: 3, gravity: -1 }); }
  },

  // returns true when Sir really lost health (garlic and the short invulnerability block it)
  hurtHero(dmg, src, opts = {}) {
    if (G.state !== 'playing' || (G.invuln > 0 && !opts.ignoreInvuln)) return false;
    if (PowerUps.active('garlic')) { if (Math.random() < 0.3) FX.burst(Hero.x, 1.2, Hero.z, 3, { color: [0.95, 1, 0.8], frame: 31, size: 0.25, speed: 2, life: 0.4 }); return false; }
    G.hp -= dmg * CONFIG.hero.damageTakenMult; G.lastHurt = G.time;
    if (opts.soft) { if (UI.hurtT < 0.35) UI.hurtT = 0.35; FX.burst(Hero.x, 1.3, Hero.z, 2, { color: [0.9, 0.1, 0.2], frame: 27, size: 0.25, speed: 1.5, up: 2, life: 0.5 }); }
    else { G.invuln = CONFIG.hero.hurtInvuln; Hero.hurt(); SFX.play('hurt', { gap: 0.1 }); addShake(0.22); UI.hurt(); }
    if (G.hp <= 0) { G.hp = 0; Game.die(); }
    return true;
  },

  bossSlam(e) {
    SFX.play('slam'); addShake(0.7); flashScreen(0.25, '#ff6a4a');
    FX.ring(e.x, e.z, 1, 10, [1, 0.35, 0.2], 0.5, 1);
    FX.ring(e.x, e.z, 0.5, 8, [1, 0.7, 0.3], 0.4, 0.8, 4);
    FX.smoke(e.x, 0.2, e.z, 12, { size: 1.2, speed: 4, alpha: 0.4 });
    const d = Math.hypot(e.x - Hero.x, e.z - Hero.z);
    if (d < 10.5) this.hurtHero(e.damage, e);
    if (Pumpkin.free) { const dx = Pumpkin.x - e.x, dz = Pumpkin.z - e.z, dd = Math.hypot(dx, dz) || 1; if (dd < 10) { Pumpkin.vx += dx / dd * 8; Pumpkin.vz += dz / dd * 8; } }
  },

  rutabagaBlast(x, z, quiet = false) {
    const st = G.stats;
    G.blasts++; G.score += 500;
    SFX.play('blast', { gap: 0 }); SFX.duck(0.25, 2.2);
    flashScreen(0.95, '#fff2c4'); addShake(1.0); slowmo(1.0, 0.32); hitstop(0.08);
    if (!quiet) UI.banner(t('blast'), '', 'blast');
    for (let i = 0; i < 4; i++) Game.later(i * 0.09, () => FX.ring(x, z, 0.5, 34 + i * 6, i % 2 ? [1, 0.55, 0.15] : [1, 0.85, 0.35], 0.9 + i * 0.12, 1, i % 2 ? 4 : 7));
    FX.ring(x, z, 0.5, 8, [1, 1, 0.8], 0.4, 1, 15);
    FX.burst(x, 1, z, 60, { color: [1, 0.8, 0.3], frame: 3, size: 0.45, speed: 16, up: 9, life: 1.2, gravity: -6 });
    FX.burst(x, 1, z, 30, { color: [1, 0.45, 0.1], frame: 0, size: 1.2, speed: 10, up: 6, life: 0.9, gravity: -2 });
    for (let i = 0; i < 24; i++) { const a = i / 24 * TAU; FX.emit({ x: x + Math.cos(a), y: 0.4, z: z + Math.sin(a), vx: Math.cos(a) * 14, vz: Math.sin(a) * 14, vy: 0.5, life: 0.8, size: 2.2, size1: 3.5, color: [1, 0.75, 0.4], alpha: 0.4, frame: 2, layer: 1, drag: 2 }); }
    for (const e of Enemies.list) {
      if (!e.alive) continue;
      const d = Math.hypot(e.x - x, e.z - z);
      this.blastQueue.push({ e, t: d / 36 + 0.05, x, z });
    }
    for (const c of Pickups.candies) { c.mag = Math.max(c.mag, 6); c.magnet = true; }
    Obstacles.blastAll(x, z); Hazards.purge();
  },

  // a boss fell: every enemy in the courtyard goes down in a wave from where it stood
  sweep(x, z) {
    for (const e of Enemies.list) {
      if (!e.alive || e.def.boss) continue;
      const d = Math.hypot(e.x - x, e.z - z);
      this.blastQueue.push({ e, t: d / 28 + 0.15, x, z });
    }
    for (let i = 0; i < 3; i++) Game.later(i * 0.12, () => FX.ring(x, z, 0.5, 36 + i * 4, i % 2 ? [0.8, 0.7, 1] : [1, 1, 1], 1.0 + i * 0.1, 0.8, i % 2 ? 4 : 7));
    for (const c of Pickups.candies) { c.mag = Math.max(c.mag, 6); c.magnet = true; }
    Obstacles.blastAll(x, z);
  },

  onKill(e, src) {
    if (src === 'dawn') { if (e.def.boss) Director.bossDefeated(e); return; }
    G.kills++;
    const st = G.stats;
    if (Pumpkin.free || src === 'shock') G.kickKills++;
    const mult = Math.min(4, 1 + 0.25 * Math.max(0, G.kickKills - 1));
    G.score += Math.round(e.def.score * (e.elite ? 3 : 1) * mult);
    if (src === 'pumpkin' || src === 'rope') {
      if (G.kickKills === 2) FX.text(t('combo2'), e.x, 2.3, e.z, 'combo', 0.9);
      else if (G.kickKills === 3) FX.text(t('combo3'), e.x, 2.3, e.z, 'combo', 0.9);
      else if (G.kickKills >= 5 && G.kickKills % 2 === 1) FX.text(t('comboN', { n: G.kickKills }), e.x, 2.3, e.z, 'combo', 0.9);
    }
    // drops
    for (const [type, n] of e.def.drops) Pickups.dropCandy(type, e.x, e.z, n);
    if (e.elite) { Pickups.dropCandy('lolli', e.x, e.z, 1); if (Math.random() < 0.25) Pickups.dropCandy('apple', e.x, e.z, 1); if (Math.random() < CONFIG.powerups.eliteDrop) PowerUps.drop(e.x, e.z); }
    else if (Math.random() < CONFIG.candy.appleChance) Pickups.dropCandy('apple', e.x, e.z, 1);
    if (e.def.rutabagaDrop && Math.random() < e.def.rutabagaDrop) { const x = e.x, z = e.z; Game.later(0.25, () => Pickups.spawnRutabaga(x, z, { extra: true })); }
    if (st.sweet > 0 && G.kills % 12 === 0) this.heal(1 + 2 * st.sweet);
    if (e.def.boss) Director.bossDefeated(e);
  },
};

// =====================================================================
// 15b. GRAVESTONES and HAZARDS
// Gravestones rise from the courtyard floor during the night. They block
// the pumpkin, Sir and walking enemies, crack with every solid hit and
// crumble after a few. Hazards: the witches' poison potions (green puddles)
// and the spiders' web (sticky shots and patches on the floor).
// =====================================================================
const Obstacles = {
  list: [], tpls: {}, batches: {}, parts: {}, debris: [], timer: 0, announced: false, _push: { x: 0, z: 0 },
  init(scene) {
    for (const key in CONFIG.graves.types) {
      const def = CONFIG.graves.types[key];
      const tpl = new RigTemplate(Assets.models[def.model]);
      this.tpls[key] = tpl;
      this.batches[key] = new RigBatch(tpl, 10, { castShadow: true }).addTo(scene);
      this.parts[key] = { crack: tpl.part('Crack'), crack2: tpl.part('Crack2') };
    }
  },
  reset() { this.list.length = 0; this.debris.length = 0; this.timer = CONFIG.graves.firstAt; this.announced = false; },
  solid(o) { return o.state === 'up' || (o.state === 'rise' && o.t > CONFIG.graves.rise * 0.35); },

  update(dt) {
    const C = CONFIG.graves;
    if (G.state === 'playing') {
      this.timer -= dt;
      if (this.timer <= 0) {
        const f = clamp(G.time / Director.duration(), 0, 1);
        this.timer = lerp(C.every, C.everyLate, f) * rand(0.8, 1.25);
        const h = clamp(Math.floor(G.time / CONFIG.night.secondsPerHour), 0, C.max.length - 1);
        if (this.list.length < C.max[h]) this.spawn(h);
      }
    }
    for (const o of this.list) {
      o.t += dt; o.shake = Math.max(0, o.shake - dt * 5); o.flash = Math.max(0, o.flash - dt * 6);
      if (o.state === 'warn') {
        if (Math.random() < dt * 10) FX.smoke(o.x + rand(-0.4, 0.4), 0.05, o.z + rand(-0.4, 0.4), 1, { color: [0.36, 0.3, 0.26], size: 0.4, alpha: 0.35, up: 0.5 });
        if (Math.random() < dt * 8) FX.spark(o.x + rand(-0.3, 0.3), 0.1, o.z + rand(-0.3, 0.3), rand(-0.5, 0.5), rand(1, 2.5), rand(-0.5, 0.5), [0.45, 0.4, 0.36], 0.6, 0.12, -9, 21);
        if (o.t >= C.warn) this.rise(o);
      } else if (o.state === 'rise') {
        const k = clamp(o.t / C.rise, 0, 1);
        o.y = -o.h * (1 - easeOutBack(k));
        if (k >= 1) { o.state = 'up'; o.y = 0; o.ghoulT = rand(2.5, CONFIG.moves.ghoul.fromGraves); }
      } else if (o.state === 'up' && G.state === 'playing' && G.time > CONFIG.night.secondsPerHour) {
        // a ghoul claws its way out of the grave now and then
        o.ghoulT = (o.ghoulT ?? 5) - dt;
        if (o.ghoulT <= 0) {
          o.ghoulT = CONFIG.moves.ghoul.fromGraves * rand(0.8, 1.3);
          if (Enemies.count('ghoul') < CONFIG.waves.limits.ghoul && Enemies.count() < 60) {
            const a = o.yaw + rand(-0.8, 0.8), r = o.def.radius + 0.75;
            const x = clamp(o.x + Math.sin(a) * r, -14, 14), z = clamp(o.z + Math.cos(a) * r, -14, 14);
            if (Math.hypot(x - Hero.x, z - Hero.z) > 2.5) {
              Enemies.spawn('ghoul', 0, { at: { x, z }, state: 'rise' });
              FX.burst(x, 0.2, z, 10, { color: [0.35, 0.28, 0.22], frame: 1, size: 0.2, gravity: -14, layer: 1 }); o.shake = 0.5;
            }
          }
        }
      }
    }
    for (let i = this.debris.length - 1; i >= 0; i--) {
      const d = this.debris[i]; d.age += dt;
      if (d.age >= d.life) { this.debris.splice(i, 1); continue; }
      d.vy -= 22 * dt; d.p.x += d.vx * dt; d.p.y += d.vy * dt; d.p.z += d.vz * dt;
      if (d.p.y < d.ground) { d.p.y = d.ground; d.vy = Math.abs(d.vy) > 2 ? -d.vy * 0.3 : 0; d.vx *= 0.55; d.vz *= 0.55; d.wx *= 0.5; d.wy *= 0.5; d.wz *= 0.5; }
      const w = Math.hypot(d.wx, d.wy, d.wz);
      if (w > 1e-3) { _q1.setFromAxisAngle(_v1.set(d.wx / w, d.wy / w, d.wz / w), w * dt); d.q.premultiply(_q1).normalize(); }
    }
  },
  spawn(h) {
    const C = CONFIG.graves;
    const types = Object.keys(C.types).filter(k => C.types[k].from <= h);
    let sum = 0; for (const k of types) sum += C.types[k].weight;
    let r = Math.random() * sum, key = types[0];
    for (const k of types) { r -= C.types[k].weight; if (r <= 0) { key = k; break; } }
    const def = C.types[key];
    for (let tries = 0; tries < 24; tries++) {
      const a = rand(0, TAU), rr = Math.sqrt(rand((C.minRadius / C.maxRadius) ** 2, 1)) * C.maxRadius;
      const x = Math.cos(a) * rr, z = Math.sin(a) * rr;
      if (Math.hypot(x - Hero.x, z - Hero.z) < C.minFromSir) continue;
      if (Pumpkin.free && Math.hypot(x - Pumpkin.x, z - Pumpkin.z) < 2) continue;
      if (this.list.some(o => Math.hypot(o.x - x, o.z - z) < C.minApart)) continue;
      if (Pickups.rutabagas.some(p => Math.hypot(p.x - x, p.z - z) < 1.4)) continue;
      if (World.solids.some(s => Math.hypot(s.x - x, s.z - z) < s.r + 1.2)) continue;
      const tpl = this.tpls[key];
      this.list.push({ key, def, x, z, y: -tpl.height, h: tpl.height, yaw: Math.atan2(-x, -z) + rand(-0.6, 0.6), hp: def.hits, state: 'warn', t: 0, shake: 0, flash: 0, hitT: -9, lean: rand(-0.07, 0.07), pose: null });
      SFX.play('rumble', { gap: 0.3 });
      if (!this.announced) { this.announced = true; FX.text(t('gravesRise'), x, 2.0, z, 'whoa', 1.8); }
      return;
    }
  },
  rise(o) {
    o.state = 'rise'; o.t = 0;
    FX.burst(o.x, 0.2, o.z, 14, { color: [0.38, 0.3, 0.24], frame: 21, size: 0.22, speed: 4, up: 6, gravity: -16, layer: 1, life: 1.0, bounce: true });
    FX.smoke(o.x, 0.1, o.z, 6, { color: [0.4, 0.34, 0.3], size: 0.8, alpha: 0.4 });
    SFX.play('thud', { gap: 0.05 }); addShake(0.1);
    // whatever stands on the spot gets tossed aside
    const R = o.def.radius + 0.5;
    for (const e of Enemies.list) {
      if (!e.alive || Enemies.airborne(e) || e.state === 'under') continue;
      const dx = e.x - o.x, dz = e.z - o.z, d = Math.hypot(dx, dz) || 1;
      if (d < R + e.radius) Enemies.damage(e, 12, dx / d, dz / d, 7, 'grave');
    }
  },
  // Pushes a round body (radius r) out of the standing stones. Returns the push direction or null.
  push(p, r) {
    let hit = null;
    for (const o of this.list) {
      if (!this.solid(o)) continue;
      const dx = p.x - o.x, dz = p.z - o.z, rr = o.def.radius + r, d2 = dx * dx + dz * dz;
      if (d2 >= rr * rr) continue;
      const d = Math.sqrt(d2), nx = d > 1e-4 ? dx / d : 1, nz = d > 1e-4 ? dz / d : 0;
      p.x = o.x + nx * rr; p.z = o.z + nz * rr;
      hit = this._push; hit.x = nx; hit.z = nz;
    }
    return hit;
  },
  // pumpkin bounces off; a fast pumpkin chips the stone
  hitByPumpkin(P) {
    const C = CONFIG.graves;
    for (let i = this.list.length - 1; i >= 0; i--) {
      const o = this.list[i];
      if (!this.solid(o)) continue;
      const dx = P.x - o.x, dz = P.z - o.z, rr = o.def.radius + P.radius * 0.9, d2 = dx * dx + dz * dz;
      if (d2 >= rr * rr) continue;
      const d = Math.sqrt(d2) || 1e-4, nx = dx / d, nz = dz / d;
      P.x = o.x + nx * rr; P.z = o.z + nz * rr;
      const vn = P.vx * nx + P.vz * nz;
      if (vn >= 0) continue;
      P.vx -= nx * vn * (1 + C.bounce); P.vz -= nz * vn * (1 + C.bounce);
      if (-vn >= C.hitSpeed && G.time - o.hitT > 0.15) this.hit(o, P.power ? 2 : 1, -nx, -nz, P.x - nx * P.radius, P.z - nz * P.radius);
      else if (-vn > 1.5) SFX.play('stone', { vol: 0.35, gap: 0.08 });
      P.power = false;
    }
  },
  hit(o, n, dx, dz, px, pz) {
    o.hp -= n; o.hitT = G.time; o.shake = 1; o.flash = 1;
    FX.burst(px, 0.8, pz, 8, { color: [0.62, 0.6, 0.56], frame: 21, size: 0.2, speed: 5, up: 4, gravity: -16, layer: 1, life: 0.9, bounce: true });
    FX.smoke(px, 0.6, pz, 2, { color: [0.5, 0.48, 0.45], size: 0.6, alpha: 0.35 });
    SFX.play('stone', { gap: 0.04 }); addShake(0.08);
    if (o.hp <= 0) this.destroy(o, dx, dz);
  },
  destroy(o, dx, dz) {
    const C = CONFIG.graves;
    const i = this.list.indexOf(o); if (i < 0) return;
    this.list.splice(i, 1);
    // the stone breaks into its pieces
    const batch = this.batches[o.key], tpl = this.tpls[o.key];
    this.matrix(o, _m1); batch.solve(_m1, o.pose);
    for (let k = 0; k < tpl.pieces.length; k++) {
      batch.pieceMatrix(k, _m1, _m2);
      const pc = tpl.pieces[k];
      const d = { key: o.key, piece: k, p: new THREE.Vector3(), q: new THREE.Quaternion(), s: new THREE.Vector3(), c: pc.center, life: rand(1.0, 1.6), age: 0 };
      _m2.decompose(d.p, d.q, d.s); _v1.copy(pc.center).applyMatrix4(_m2); d.p.copy(_v1);
      const sp = rand(2, 5);
      d.vx = dx * sp + rand(-2, 2); d.vz = dz * sp + rand(-2, 2); d.vy = rand(2, 6);
      d.wx = rand(-8, 8); d.wy = rand(-8, 8); d.wz = rand(-8, 8);
      d.ground = Math.max(0.05, pc.radius * 0.35);
      this.debris.push(d);
    }
    FX.burst(o.x, 0.8, o.z, 18, { color: [0.6, 0.58, 0.54], frame: 21, size: 0.26, speed: 7, up: 6, gravity: -16, layer: 1, life: 1.1, bounce: true });
    FX.smoke(o.x, 0.5, o.z, 8, { color: [0.5, 0.47, 0.44], size: 1.0, alpha: 0.4 });
    SFX.play('crumble'); addShake(0.2);
    G.score += C.score;
    FX.text('+' + C.score, o.x, 1.9, o.z, 'pop', 0.8);
    Pickups.dropCandy('corn', o.x, o.z, 2);
    if (Math.random() < 0.25) Pickups.dropCandy('wrapped', o.x, o.z, 1);
  },
  // the rutabaga blast flattens every stone that is up
  blastAll(x, z) {
    for (const o of [...this.list]) {
      if (o.state === 'warn') continue;
      const dx = o.x - x, dz = o.z - z, d = Math.hypot(dx, dz) || 1;
      Game.later(d / 36 + 0.06, () => this.destroy(o, dx / d, dz / d));
    }
  },
  matrix(o, out) {
    const sh = o.shake > 0 ? Math.sin(G.realTime * 60) * 0.06 * o.shake : 0;
    const dmg = 1 - o.hp / o.def.hits;
    _v3.set(o.x + sh, o.y, o.z);
    _q1.setFromAxisAngle(_v2.set(0, 1, 0), o.yaw);
    _q2.setFromAxisAngle(_v2.set(1, 0, 0), o.lean + dmg * 0.14 * (o.lean < 0 ? -1 : 1)); _q1.multiply(_q2);
    return out.compose(_v3, _q1, _v2.set(1, 1, 1));
  },
  render() {
    const time = G.realTime, C = CONFIG.graves;
    for (const k in this.batches) this.batches[k].begin();
    for (const o of this.list) {
      if (o.state === 'warn') {
        const k = clamp(o.t / C.warn, 0, 1), s = o.def.radius / 0.5;
        FX.decalA.push(o.x, 0.035, o.z, (0.7 + 1.7 * k) * s, 0.05, 0.035, 0.03, 0.9, o.yaw, 17);
        FX.decal.push(o.x, 0.04, o.z, (0.9 + 1.5 * k) * s, 0.55, 0.3, 1, 0.22 + 0.2 * Math.sin(time * 14), 0, 0);
        continue;
      }
      const batch = this.batches[o.key], pp = this.parts[o.key];
      // cracks show up as the stone takes hits
      let pose = null;
      if (pp.crack >= 0 || pp.crack2 >= 0) {
        pose = o.pose || (o.pose = makePose(this.tpls[o.key])); resetPose(pose);
        const lost = o.def.hits - o.hp;
        if (pp.crack >= 0 && lost < 1) { const b = pp.crack * POSE_STRIDE; pose[b + 6] = pose[b + 7] = pose[b + 8] = 0.001; }
        if (pp.crack2 >= 0 && lost < Math.ceil(o.def.hits / 2)) { const b = pp.crack2 * POSE_STRIDE; pose[b + 6] = pose[b + 7] = pose[b + 8] = 0.001; }
      }
      this.matrix(o, _m1);
      const f = 1 + o.flash * 0.9;
      batch.push(_m1, pose, f, f, f);
      if (o.state === 'rise') FX.decalA.push(o.x, 0.035, o.z, 2.4 * o.def.radius / 0.5, 0.05, 0.035, 0.03, 0.8, o.yaw, 17);
    }
    for (const d of this.debris) {
      const batch = this.batches[d.key];
      const k = d.age / d.life; const sc = k > 0.7 ? 1 - (k - 0.7) / 0.3 : 1;
      _v2.copy(d.s).multiplyScalar(Math.max(0.001, sc));
      _m2.compose(d.p, d.q, _v2); _m3.makeTranslation(-d.c.x, -d.c.y, -d.c.z); _m2.multiply(_m3);
      batch.pushPiece(d.piece, _m2);
    }
    for (const k in this.batches) this.batches[k].end();
  },
};

const Hazards = {
  shots: [], puddles: [], webs: [], souls: [], rig: null, jackRig: null,
  init(scene) {
    this.rig = new RigBatch(new RigTemplate(Assets.models.potion), 16, { castShadow: true }).addTo(scene);
    this.jackRig = new RigBatch(new RigTemplate(Assets.models.jack_o_lantern), 12, { castShadow: true }).addTo(scene);
  },
  reset() { this.shots.length = 0; this.puddles.length = 0; this.webs.length = 0; this.souls.length = 0; },
  purge() { // the rutabaga blast cleans the floor
    for (const p of this.puddles) FX.smoke(p.x, 0.2, p.z, 3, { color: p.kind === 'fire' ? [0.5, 0.3, 0.2] : [0.4, 0.8, 0.3], size: 0.7, alpha: 0.35 });
    for (const o of this.souls) FX.burst(o.x, o.y, o.z, 6, { color: [0.6, 1, 0.9], frame: 3, size: 0.2, speed: 3, life: 0.5 });
    this.puddles.length = 0; this.webs.length = 0; this.souls.length = 0;
    for (let i = this.shots.length - 1; i >= 0; i--) if (this.shots[i].kind === 'bomb' || this.shots[i].kind === 'molotov') this.shots.splice(i, 1);
  },
  // the Headless Horseman's flaming jack-o'-lantern: explodes where it lands and leaves fire
  throwBomb(e, tx, tz) {
    const B = CONFIG.bosses.horseman;
    _v1.set(-0.25, 3.25, -0.04).applyAxisAngle(_v2.set(0, 1, 0), e.yaw);
    this.shots.push({ kind: 'bomb', x0: e.x + _v1.x, y0: 3.2, z0: e.z + _v1.z, tx, tz, x: e.x, y: 3.2, z: e.z, t: 0, T: B.bombFlight, spin: rand(0, TAU) });
    SFX.play('whoosh', { vol: 0.8, gap: 0.05 });
  },
  explode(x, z) {
    const B = CONFIG.bosses.horseman;
    SFX.play('boom', { gap: 0.03 }); addShake(0.25);
    FX.ring(x, z, 0.4, B.bombRadius + 0.6, [1, 0.55, 0.15], 0.4, 1);
    FX.burst(x, 0.5, z, 18, { color: [1, 0.6, 0.15], frame: 5, size: 0.5, speed: 6, up: 5, gravity: -6, life: 0.7 });
    FX.burst(x, 0.5, z, 10, { color: [1, 0.55, 0.12], frame: 1, size: 0.2, speed: 7, up: 6, gravity: -14, layer: 1, life: 0.8 });
    FX.smoke(x, 0.4, z, 6, { color: [0.25, 0.2, 0.18], size: 1.1, alpha: 0.45 });
    if (Math.hypot(Hero.x - x, Hero.z - z) < B.bombRadius) Combat.hurtHero(B.bombDamage, null);
    const P = Pumpkin; if (P.free) { const px = P.x - x, pz = P.z - z, pd = Math.hypot(px, pz) || 1; if (pd < B.bombRadius) { P.vx += px / pd * 7; P.vz += pz / pd * 7; } }
    for (let i = 0; i < 3; i++) { const a = rand(0, TAU), r = rand(0, 1.1); this.puddles.push({ kind: 'fire', x: x + Math.cos(a) * r, z: z + Math.sin(a) * r, age: 0, life: B.fireLife + rand(-0.5, 0.5), tick: 0.3, rot: rand(0, TAU), r: 0.85 }); }
    while (this.puddles.length > 24) this.puddles.shift();
  },
  // the Grim Reaper's souls: slow, they home in on Sir; the pumpkin smashes them
  fireSoul(x, z, dx, dz) {
    const B = CONFIG.bosses.reaper;
    this.souls.push({ x, y: 1.4, z, vx: dx * B.soulSpeed, vz: dz * B.soulSpeed, age: 0, ph: rand(0, TAU) });
    while (this.souls.length > 16) this.souls.shift();
  },
  // fire-bottle skeleton: the bottle bursts into a wall of flames across the throw direction
  throwMolotov(e, tx, tz) {
    const SK = CONFIG.moves.skeleton;
    const dx = tx - e.x, dz = tz - e.z, dl = Math.hypot(dx, dz) || 1;
    this.shots.push({ kind: 'molotov', x0: e.x, y0: 1.4 * e.scale, z0: e.z, tx, tz, nx: -dz / dl, nz: dx / dl, x: e.x, y: 1.4, z: e.z, t: 0, T: SK.flight, spin: rand(0, TAU) });
    SFX.play('whoosh', { vol: 0.6, gap: 0.1 });
  },
  molotovPoints(s, fn) {
    const SK = CONFIG.moves.skeleton, n = SK.wallPieces;
    for (let i = 0; i < n; i++) { const o = (i / (n - 1) - 0.5) * SK.wallLength; fn(clamp(s.tx + s.nx * o, -15, 15), clamp(s.tz + s.nz * o, -15, 15)); }
  },
  ignite(s) {
    const SK = CONFIG.moves.skeleton;
    SFX.play('glass', { gap: 0.05 }); SFX.play('fire', { gap: 0 });
    FX.burst(s.tx, 0.4, s.tz, 14, { color: [1, 0.6, 0.15], frame: 5, size: 0.45, speed: 5, up: 4, gravity: -6, life: 0.6 });
    FX.burst(s.tx, 0.3, s.tz, 8, { color: [0.85, 0.95, 1], frame: 21, size: 0.12, speed: 4, up: 3, gravity: -14, layer: 1, life: 0.6 });
    this.molotovPoints(s, (x, z) => this.puddles.push({ kind: 'fire', wall: true, x, z, age: 0, life: SK.wallLife + rand(-0.4, 0.4), tick: 0.25, rot: rand(0, TAU), r: SK.flameR, ph: rand(0, TAU) }));
    FX.smoke(s.tx, 0.5, s.tz, 6, { color: [0.3, 0.2, 0.15], size: 1.2, alpha: 0.45 }); addShake(0.12);
    while (this.puddles.length > 40) this.puddles.shift();
  },
  throwPotion(e, tx, tz) {
    const W = CONFIG.moves.witch;
    this.shots.push({ kind: 'potion', x0: e.x, y0: e.y + 1.0, z0: e.z, tx, tz, x: e.x, y: e.y + 1, z: e.z, t: 0, T: W.potionFlight, spin: rand(0, TAU) });
    SFX.play('whoosh', { vol: 0.6, gap: 0.1 });
  },
  shootWeb(e, tx, tz) {
    const S = CONFIG.moves.spider;
    const dx = tx - e.x, dz = tz - e.z, d = Math.hypot(dx, dz) || 1;
    this.shots.push({ kind: 'web', x: e.x + dx / d * 0.5, y: 0.6, z: e.z + dz / d * 0.5, vx: dx / d * S.webSpeed, vz: dz / d * S.webSpeed, life: Math.min(1.2, d / S.webSpeed + 0.08), t: 0 });
    SFX.play('web', { gap: 0.05 });
  },
  update(dt) {
    const W = CONFIG.moves.witch, S = CONFIG.moves.spider, P = Pumpkin;
    for (let i = this.shots.length - 1; i >= 0; i--) {
      const s = this.shots[i]; s.t += dt;
      if (s.kind === 'bomb') {
        const k = clamp(s.t / s.T, 0, 1);
        s.x = lerp(s.x0, s.tx, k); s.z = lerp(s.z0, s.tz, k); s.y = lerp(s.y0, 0.3, k) + Math.sin(k * Math.PI) * 2.2;
        s.spin += dt * 7;
        if (Math.random() < 0.8) FX.emit({ x: s.x + rand(-0.15, 0.15), y: s.y + 0.2, z: s.z + rand(-0.15, 0.15), vy: rand(0.5, 1.5), life: 0.4, size: 0.5, size1: 0.1, color: [1, 0.5, 0.12], alpha: 0.9, frame: 5, layer: 0, rot: 0 });
        if (k >= 1) { this.shots.splice(i, 1); this.explode(s.tx, s.tz); }
        continue;
      }
      if (s.kind === 'molotov') {
        const k = clamp(s.t / s.T, 0, 1);
        s.x = lerp(s.x0, s.tx, k); s.z = lerp(s.z0, s.tz, k); s.y = lerp(s.y0, 0.15, k) + Math.sin(k * Math.PI) * 2.4;
        s.spin += dt * 10;
        if (Math.random() < 0.8) FX.emit({ x: s.x, y: s.y + 0.15, z: s.z, vy: rand(0.4, 1), life: 0.35, size: 0.35, size1: 0.05, color: [1, 0.5, 0.12], alpha: 0.9, frame: 5, layer: 0, rot: 0 });
        if (k >= 1) { this.shots.splice(i, 1); this.ignite(s); }
        continue;
      }
      if (s.kind === 'potion') {
        const k = clamp(s.t / s.T, 0, 1);
        s.x = lerp(s.x0, s.tx, k); s.z = lerp(s.z0, s.tz, k); s.y = lerp(s.y0, 0.15, k) + Math.sin(k * Math.PI) * 2.6;
        s.spin += dt * 9;
        if (Math.random() < 0.6) FX.emit({ x: s.x, y: s.y, z: s.z, vy: 0.3, life: 0.45, size: 0.3, size1: 0.05, color: [0.5, 1, 0.4], alpha: 0.7, frame: 0, layer: 0 });
        if (k >= 1) { this.shots.splice(i, 1); this.shatter(s.tx, s.tz); }
        continue;
      }
      // web shot
      s.x += s.vx * dt; s.z += s.vz * dt;
      let hit = false;
      if (P.free && Math.hypot(P.x - s.x, P.z - s.z) < P.radius + 0.3) { P.webT = Math.max(P.webT, S.pumpkinSlow); hit = true; }
      else if (Math.hypot(Hero.x - s.x, Hero.z - s.z) < 0.75) { Hero.slowT = Math.max(Hero.slowT, S.heroSlow); hit = true; }
      if (hit) {
        FX.burst(s.x, 0.6, s.z, 8, { color: [0.95, 0.95, 1], frame: 1, size: 0.14, speed: 3, up: 2, gravity: -8, life: 0.5 });
        SFX.play('web', { gap: 0.05, pitch: 0.7 });
        this.shots.splice(i, 1);
      } else if (s.t >= s.life) {
        this.shots.splice(i, 1);
        this.webs.push({ x: s.x, z: s.z, age: 0, life: S.patchLife, rot: rand(0, TAU) });
        if (this.webs.length > 10) this.webs.shift();
      }
    }
    // poison puddles (and the Horseman's fires) hurt Sir while he stands in them
    for (let i = this.puddles.length - 1; i >= 0; i--) {
      const p = this.puddles[i]; p.age += dt; p.tick -= dt;
      if (p.age > p.life) { this.puddles.splice(i, 1); continue; }
      const fire = p.kind === 'fire', R = fire ? p.r : W.puddleRadius;
      if (fire && p.wall) { // fire wall: tall, licking flames with a dark smoke top
        const k = p.age / p.life, h = clamp(p.age / 0.3, 0, 1) * (k > 0.8 ? 1 - (k - 0.8) / 0.2 : 1);
        const n = Math.floor(dt * 70 * h + Math.random());
        for (let j = 0; j < n; j++) {
          const big = Math.random() < 0.45;
          FX.emit({ x: p.x + rand(-0.6, 0.6) * R, y: rand(0.1, 0.4), z: p.z + rand(-0.6, 0.6) * R, vx: rand(-0.3, 0.3), vy: rand(2.6, 4.4) * h, vz: rand(-0.3, 0.3),
            life: rand(0.45, 0.75), size: big ? rand(0.8, 1.15) : rand(0.45, 0.7), size1: 0.1, color: big ? [1, 0.42, 0.08] : [1, 0.78, 0.25], alpha: 0.95, frame: 5, layer: 0, rot: rand(-0.4, 0.4), drag: 0.6 });
        }
        if (Math.random() < dt * 4 * h) FX.emit({ x: p.x + rand(-0.3, 0.3), y: 2.2, z: p.z + rand(-0.3, 0.3), vy: rand(0.8, 1.4), vx: rand(-0.3, 0.3), life: rand(1, 1.6), size: 0.9, size1: 2.0, color: [0.15, 0.1, 0.08], alpha: 0.35, frame: 2, layer: 1 });
        if (Math.random() < dt * 6 * h) FX.emit({ x: p.x + rand(-0.4, 0.4), y: rand(0.5, 1.5), z: p.z + rand(-0.4, 0.4), vx: rand(-1, 1), vy: rand(3, 5), vz: rand(-1, 1), life: rand(0.6, 1), size: 0.12, size1: 0.02, color: [1, 0.85, 0.4], alpha: 1, frame: 3, layer: 0 });
      } else if (fire) { if (Math.random() < dt * 16) FX.emit({ x: p.x + rand(-0.6, 0.6) * R, y: 0.12, z: p.z + rand(-0.6, 0.6) * R, vy: rand(1, 2.2), life: 0.5, size: rand(0.35, 0.6), size1: 0.05, color: [1, 0.5, 0.12], alpha: 0.9, frame: 5, layer: 0, rot: 0 }); }
      else if (Math.random() < dt * 5) FX.emit({ x: p.x + rand(-1, 1) * R * 0.7, y: 0.08, z: p.z + rand(-1, 1) * R * 0.7, vy: rand(0.2, 0.5), life: rand(0.4, 0.8), size: rand(0.12, 0.25), size1: 0.3, color: [0.55, 1, 0.4], alpha: 0.8, frame: 22, layer: 0 });
      if (G.state === 'playing' && Math.hypot(Hero.x - p.x, Hero.z - p.z) < R * 0.85 + 0.25 && p.tick <= 0) {
        p.tick = W.puddleTick; Combat.hurtHero(W.puddleDamage, null);
        FX.burst(Hero.x, 0.8, Hero.z, 5, { color: fire ? [1, 0.6, 0.2] : [0.5, 1, 0.35], frame: fire ? 5 : 22, size: 0.18, speed: 1.5, up: 2, gravity: -2, life: 0.6 });
      }
    }
    if (this.puddles.some(p => p.kind === 'fire') && Math.random() < dt * 3) SFX.play('fire', { gap: 0.25 });
    // souls home in on Sir
    const RB = CONFIG.bosses.reaper;
    for (let i = this.souls.length - 1; i >= 0; i--) {
      const o = this.souls[i]; o.age += dt;
      if (o.age > RB.soulLife) { FX.burst(o.x, o.y, o.z, 5, { color: [0.6, 1, 0.9], frame: 3, size: 0.18, speed: 2, life: 0.4 }); this.souls.splice(i, 1); continue; }
      const dx = Hero.x - o.x, dz = Hero.z - o.z, dl = Math.hypot(dx, dz) || 1;
      const cur = Math.atan2(o.vz, o.vx), want = Math.atan2(dz, dx);
      let da = want - cur; da = Math.atan2(Math.sin(da), Math.cos(da));
      const a = cur + clamp(da, -RB.soulTurn * dt, RB.soulTurn * dt), sp = RB.soulSpeed;
      o.vx = Math.cos(a) * sp; o.vz = Math.sin(a) * sp; o.x += o.vx * dt; o.z += o.vz * dt; o.y = 1.3 + Math.sin(G.realTime * 4 + o.ph) * 0.15;
      if (dl < 0.65) { Combat.hurtHero(RB.soulDamage, null); FX.burst(o.x, o.y, o.z, 10, { color: [0.6, 1, 0.9], frame: 3, size: 0.22, speed: 3, life: 0.5 }); SFX.play('ghost', { gap: 0.1, pitch: 1.6 }); this.souls.splice(i, 1); continue; }
      if (P.free && P.speed > 3 && Math.hypot(P.x - o.x, P.z - o.z) < P.radius + 0.4) {
        FX.burst(o.x, o.y, o.z, 14, { color: [0.7, 1, 0.95], frame: 3, size: 0.25, speed: 4, life: 0.6 }); SFX.play('glass', { gap: 0.05, vol: 0.5 });
        G.score += 15; FX.text('+15', o.x, 2.0, o.z, 'pop', 0.6); this.souls.splice(i, 1);
      }
    }
    // web on the floor: sticky for Sir and the pumpkin (a fast pumpkin tears it)
    for (let i = this.webs.length - 1; i >= 0; i--) {
      const w = this.webs[i]; w.age += dt;
      if (w.age > w.life) { this.webs.splice(i, 1); continue; }
      const R = S.patchRadius;
      if (Math.hypot(Hero.x - w.x, Hero.z - w.z) < R) Hero.slowT = Math.max(Hero.slowT, 0.25);
      if (P.free && Math.hypot(P.x - w.x, P.z - w.z) < R + P.radius * 0.5) {
        if (P.speed > 14) { this.webs.splice(i, 1); FX.burst(w.x, 0.3, w.z, 10, { color: [0.95, 0.95, 1], frame: 1, size: 0.12, speed: 4, up: 2, gravity: -6, life: 0.6 }); }
        else P.webT = Math.max(P.webT, 0.35);
      }
    }
  },
  shatter(x, z) {
    const W = CONFIG.moves.witch;
    this.puddles.push({ x, z, age: 0, life: W.puddleLife, tick: 0.2, rot: rand(0, TAU) });
    FX.burst(x, 0.3, z, 14, { color: [0.6, 1, 0.45], frame: 1, size: 0.18, speed: 5, up: 4, gravity: -14, layer: 1, life: 0.7 });
    FX.burst(x, 0.3, z, 8, { color: [0.85, 0.95, 1], frame: 21, size: 0.12, speed: 4, up: 3, gravity: -14, layer: 1, life: 0.6 });
    FX.smoke(x, 0.2, z, 4, { color: [0.35, 0.75, 0.3], size: 0.8, alpha: 0.4 });
    SFX.play('glass');
  },
  render() {
    const time = G.realTime, W = CONFIG.moves.witch, S = CONFIG.moves.spider;
    this.rig.begin(); this.jackRig.begin();
    for (const s of this.shots) {
      if (s.kind === 'bomb') {
        _q1.setFromAxisAngle(_v1.set(1, 0, 0.4).normalize(), s.spin);
        _m1.compose(_v2.set(s.x, s.y - 0.3, s.z), _q1, _v3.set(0.9, 0.9, 0.9));
        this.jackRig.push(_m1, null, 1.4, 1.2, 1);
        FX.add.push(s.x, s.y, s.z, 1.8, 1, 0.55, 0.15, 0.5, 0, 0);
        const k = clamp(s.t / s.T, 0, 1), B = CONFIG.bosses.horseman;
        FX.decal.push(s.tx, 0.05, s.tz, B.bombRadius * 2 * (1.25 - 0.25 * k), 1, 0.45, 0.1, 0.35 + 0.45 * k, time * 1.5, 23);
      } else if (s.kind === 'molotov') {
        _q1.setFromAxisAngle(_v1.set(1, 0, 0.3).normalize(), s.spin);
        _m1.compose(_v2.set(s.x, s.y, s.z), _q1, _v3.set(0.85, 0.85, 0.85));
        this.rig.push(_m1, null, 1.5, 0.8, 0.5);
        FX.add.push(s.x, s.y + 0.2, s.z, 1.0, 1, 0.55, 0.15, 0.5, 0, 0);
        const k = clamp(s.t / s.T, 0, 1), R = CONFIG.moves.skeleton.flameR * 2; // landing warning: a line of orange marks
        this.molotovPoints(s, (x, z) => FX.decal.push(x, 0.05, z, R * (1.25 - 0.25 * k), 1, 0.45, 0.1, 0.3 + 0.45 * k, time * 1.5, 23));
      } else if (s.kind === 'potion') {
        _q1.setFromAxisAngle(_v1.set(1, 0, 0.3).normalize(), s.spin);
        _m1.compose(_v2.set(s.x, s.y, s.z), _q1, _v3.set(1, 1, 1));
        this.rig.push(_m1, null);
        const k = clamp(s.t / s.T, 0, 1); // landing warning
        FX.decal.push(s.tx, 0.05, s.tz, W.puddleRadius * 2 * (1.3 - 0.3 * k), 0.4, 1, 0.3, 0.35 + 0.4 * k, time * 1.5, 23);
      } else {
        FX.alpha.push(s.x, s.y, s.z, 0.6, 0.95, 0.95, 1, 0.95, time * 6, 16);
        FX.add.push(s.x, s.y, s.z, 0.7, 0.6, 0.6, 0.7, 0.3, 0, 0);
      }
    }
    this.rig.end(); this.jackRig.end();
    for (const p of this.puddles) {
      const k = p.age / p.life, grow = clamp(p.age / 0.25, 0, 1), fade = k > 0.8 ? 1 - (k - 0.8) / 0.2 : 1;
      if (p.kind === 'fire') {
        const R = p.r * 2 * (0.6 + 0.4 * grow);
        FX.decalA.push(p.x, 0.036, p.z, R, 0.08, 0.05, 0.04, 0.6 * fade, p.rot, 13);
        FX.decal.push(p.x, 0.04, p.z, R * 1.2, 1, 0.45, 0.1, 0.4 * fade * (0.8 + 0.2 * Math.sin(time * 9 + p.rot)), p.rot, 0);
        if (p.wall) { // a glowing column of heat so the wall reads tall from above
          const fl = 0.85 + 0.15 * Math.sin(time * 13 + p.ph);
          FX.add.push(p.x, 0.8, p.z, 2.6 * grow, 1, 0.45, 0.1, 0.5 * fade * fl, 0, 0);
          FX.add.push(p.x, 1.7, p.z, 2.0 * grow, 1, 0.6, 0.2, 0.3 * fade * fl, 0, 0);
          FX.decal.push(p.x, 0.045, p.z, R * 1.8, 1, 0.35, 0.05, 0.3 * fade * fl, p.rot, 0);
        }
        continue;
      }
      const R = W.puddleRadius * 2 * (0.6 + 0.4 * grow);
      FX.decalA.push(p.x, 0.036, p.z, R, 0.16, 0.38, 0.08, 0.85 * fade, p.rot, 18);
      FX.decal.push(p.x, 0.04, p.z, R * 1.05, 0.25, 0.9, 0.2, 0.3 * fade * (0.8 + 0.2 * Math.sin(time * 6 + p.rot)), p.rot, 18);
    }
    for (const o of this.souls) {
      const fade = clamp((CONFIG.bosses.reaper.soulLife - o.age) / 0.5, 0, 1);
      FX.add.push(o.x, o.y, o.z, 1.5, 0.45, 1, 0.85, 0.55 * fade, 0, 0);
      FX.alpha.push(o.x, o.y, o.z, 0.75, 0.8, 1, 0.95, 0.95 * fade, Math.sin(time * 3 + o.ph) * 0.2, 26);
      if (Math.random() < 0.5) FX.emit({ x: o.x, y: o.y, z: o.z, vx: -o.vx * 0.1, vy: 0.2, vz: -o.vz * 0.1, life: 0.5, size: 0.4, size1: 0.05, color: [0.5, 1, 0.85], alpha: 0.6, frame: 0, layer: 0 });
    }
    for (const w of this.webs) {
      const k = w.age / w.life, fade = k > 0.8 ? 1 - (k - 0.8) / 0.2 : 1, grow = clamp(w.age / 0.15, 0, 1);
      FX.decalA.push(w.x, 0.037, w.z, S.patchRadius * 2.1 * grow, 0.92, 0.92, 0.96, 0.7 * fade, w.rot, 16);
    }
  },
};

// =====================================================================
// 15c. POWER-UPS: glowing objects in the courtyard (and drops from elites
// and bosses). Walk over one or hit it with the pumpkin.
//   hellfire  the pumpkin burns: harder hits and a trail of fire
//   frost     every enemy freezes (bosses slow down) and takes extra damage
//   garlic    Sir can't be hurt, a garlic aura pushes enemies away
//   bats      bats circle Sir and bite whatever comes close
//   mega      a giant pumpkin
//   bomb      a big explosion where it was picked up
//   bucket    every candy flies to Sir, plus a shower of candy
//   triple    every kick fires two extra pumpkins in a spread (no band, they burst at the end)
//   ghost     the pumpkin is a ghost: through enemies and gravestones without slowing, the band cuts
//   lightning lightning strikes the enemies around the flying pumpkin and chains between them
//   fangs     every hit heals Sir
// The rutabaga events (jam, mageddon) only use the timers and the HUD chips; see 56_rutabaga.js.
// Tuning: CONFIG.powerups.
// =====================================================================
const PowerUps = {
  items: [], timers: {}, batches: {}, spawnT: 0, batPhase: 0, batHit: new Map(), garlicTick: 0, hellT: 0, chips: {},
  extra: [], extraBatch: null, boltT: 0, thunderT: 0, heartT: 0,
  init(scene) {
    for (const [key, def] of Object.entries(CONFIG.powerups.types)) {
      if (def.event) continue;
      this.batches[key] = new RigBatch(new RigTemplate(Assets.models[def.model]), 4, { castShadow: true }).addTo(scene);
    }
    this.extraBatch = new RigBatch(new RigTemplate(Assets.models.pumpkin_ball), 8, { castShadow: true }).addTo(scene);
  },
  reset() {
    this.items.length = 0; this.timers = {}; this.spawnT = CONFIG.powerups.firstAt; this.bats = null; this.garlicTick = 0; this.hellT = 0;
    this.extra.length = 0; this.boltT = 0; this.thunderT = 0; Pumpkin.setGhost(false);
  },
  active(key) { return (this.timers[key] || 0) > 0; },
  left(key) { return Math.max(0, this.timers[key] || 0); },
  randomKey() {
    const T = CONFIG.powerups.types; let sum = 0;
    for (const k in T) if (!T[k].event) sum += T[k].weight;
    let r = Math.random() * sum;
    for (const k in T) { if (T[k].event) continue; r -= T[k].weight; if (r <= 0 && T[k].weight > 0) return k; }
    return 'bomb';
  },
  // a free spot 4..10 m from Sir, inside the courtyard, clear of stones and towers
  freeSpot() {
    const probe = this._probe || (this._probe = { x: 0, z: 0 });
    for (let i = 0; i < 30; i++) {
      const a = rand(0, TAU), r = rand(4, 10), x = Hero.x + Math.cos(a) * r, z = Hero.z + Math.sin(a) * r;
      if (Math.hypot(x, z) > 12.8) continue;
      if (Obstacles.list.some(o => Math.hypot(o.x - x, o.z - z) < 1.8)) continue;
      probe.x = x; probe.z = z; if (World.solidPush(probe, 0.7)) continue;
      return { x, z };
    }
    return { x: rand(-5, 5), z: rand(-5, 5) };
  },
  spawnAt(key, x, z) {
    this.items.push({ key, x, z, age: 0, life: CONFIG.powerups.life, ph: rand(0, TAU) });
    FX.ring(x, z, 0.2, 1.6, [1, 0.9, 0.5], 0.5, 0.8, 7);
    SFX.play('sparkle', { gap: 0.1 });
  },
  drop(x, z) { this.spawnAt(this.randomKey(), clamp(x, -12.5, 12.5), clamp(z, -12.5, 12.5)); },

  update(dt) {
    const C = CONFIG.powerups;
    for (const k in this.timers) if (this.timers[k] > 0) { this.timers[k] -= dt; if (this.timers[k] <= 0) this.expire(k); }
    if (G.state === 'playing') {
      this.spawnT -= dt;
      if (this.spawnT <= 0) {
        this.spawnT = rand(C.every[0], C.every[1]);
        if (this.items.length < C.maxOnField) { const p = this.freeSpot(); this.spawnAt(this.randomKey(), p.x, p.z); }
      }
    }
    const P = Pumpkin;
    for (let i = this.items.length - 1; i >= 0; i--) {
      const it = this.items[i]; it.age += dt;
      if (it.age > it.life) { FX.smoke(it.x, 0.5, it.z, 4, { size: 0.6, alpha: 0.3 }); this.items.splice(i, 1); continue; }
      const bySir = Math.hypot(Hero.x - it.x, Hero.z - it.z) < C.pickRadius;
      const byPumpkin = P.free && Math.hypot(P.x - it.x, P.z - it.z) < P.radius + 0.55;
      if ((bySir || byPumpkin) && G.state === 'playing') { this.items.splice(i, 1); this.activate(it.key, it.x, it.z); }
    }
    this.effects(dt);
  },

  activate(key, x, z) {
    const C = CONFIG.powerups, def = C.types[key];
    G.powerups = (G.powerups || 0) + 1;
    SFX.play('power', { gap: 0 });
    FX.text(t('pu')[key][0] + '!', Hero.x, 3.2, Hero.z, 'combo', 1.3);
    FX.burst(x, 0.8, z, 18, { color: [1, 0.9, 0.5], frame: 3, size: 0.3, speed: 5, up: 4, life: 0.7 });
    UI.powerToast(key);
    if (def.time > 0) this.timers[key] = Math.max(this.timers[key] || 0, def.time);
    if (key === 'frost') {
      SFX.play('frost', { gap: 0 }); flashScreen(0.35, '#bfe8ff');
      FX.ring(Hero.x, Hero.z, 0.5, 14, [0.55, 0.8, 1], 0.7, 0.55, 7);
      for (const e of Enemies.list) {
        if (!e.alive) continue;
        if (e.def.boss) e.slowT = Math.max(e.slowT, def.time); else e.frozenT = Math.max(e.frozenT, def.time);
        FX.burst(e.x, 1, e.z, 4, { color: [0.75, 0.95, 1], frame: 25, size: 0.3, speed: 2, life: 0.8, gravity: -2 });
      }
    } else if (key === 'bomb') this.bomb(x, z);
    else if (key === 'bucket') {
      SFX.play('candy', { gap: 0 });
      for (const c of Pickups.candies) { c.mag = Math.max(c.mag, 8); c.magnet = true; }
      for (let i = 0; i < C.bucketCandy; i++) Pickups.dropCandy(i % 5 === 0 ? 'wrapped' : 'corn', x, z, 1);
      Combat.heal(10);
    } else if (key === 'mega') { SFX.play('grow', { gap: 0 }); FX.ring(Pumpkin.x, Pumpkin.z, 0.5, 4, [1, 0.85, 0.3], 0.5, 1); }
    else if (key === 'garlic') { SFX.play('heal', { gap: 0 }); FX.ring(Hero.x, Hero.z, 0.5, C.garlicRadius * 2, [0.9, 1, 0.75], 0.6, 1); }
    else if (key === 'hellfire') { SFX.play('fire', { gap: 0 }); FX.burst(Pumpkin.x, 0.7, Pumpkin.z, 20, { color: [1, 0.5, 0.12], frame: 5, size: 0.5, speed: 4, up: 4, life: 0.6 }); }
    else if (key === 'bats') { SFX.play('flap', { gap: 0 }); SFX.play('squeak', { gap: 0 }); }
    else if (key === 'triple') { SFX.play('grow', { gap: 0, pitch: 1.3 }); for (let i = 0; i < 3; i++) FX.ring(Hero.x, Hero.z, 0.3 + i * 0.3, 2.6 + i * 0.6, [1, 0.6, 0.2], 0.45, 0.8, 7); }
    else if (key === 'ghost') { SFX.play('ghostOn', { gap: 0 }); Pumpkin.setGhost(true); FX.burst(Pumpkin.x, 0.7, Pumpkin.z, 24, { color: [0.6, 0.85, 1], frame: 26, size: 0.3, speed: 3, up: 3, life: 0.9, gravity: 1 }); }
    else if (key === 'lightning') { SFX.play('thunder', { gap: 0 }); flashScreen(0.45, '#e8f0ff'); this.boltT = 0.15; this.thunderT = 2.5; }
    else if (key === 'fangs') { SFX.play('fangs', { gap: 0 }); for (let i = 0; i < 10; i++) FX.emit({ x: Hero.x + rand(-0.5, 0.5), y: 1.2 + rand(0, 0.8), z: Hero.z + rand(-0.5, 0.5), vy: rand(1, 2.5), life: 0.9, size: 0.3, color: [1, 0.25, 0.4], alpha: 1, frame: 27, layer: 1, rot: 0 }); }
  },
  expire(key) {
    if (key === 'mega') FX.smoke(Pumpkin.x, 0.6, Pumpkin.z, 6, { size: 0.8, alpha: 0.35 });
    if (key === 'ghost') { Pumpkin.setGhost(false); FX.burst(Pumpkin.x, 0.7, Pumpkin.z, 10, { color: [0.6, 0.85, 1], frame: 26, size: 0.25, speed: 2, up: 2, life: 0.7, gravity: 1 }); }
    if (key === 'bats') for (let i = 0; i < 6; i++) FX.emit({ x: Hero.x + rand(-2, 2), y: 1.4, z: Hero.z + rand(-2, 2), vx: rand(-4, 4), vy: rand(2, 4), vz: rand(-4, 4), life: 1, size: 0.45, color: [0.15, 0.08, 0.2], alpha: 1, frame: 24, layer: 1 });
  },
  bomb(x, z) {
    const C = CONFIG.powerups, R = C.bombRadius, st = G.stats;
    SFX.play('boom', { gap: 0 }); SFX.play('blast', { gap: 0, vol: 0.6 }); addShake(0.7); flashScreen(0.5, '#ffd8a0'); hitstop(0.07);
    for (let i = 0; i < 2; i++) Game.later(i * 0.08, () => FX.ring(x, z, 0.5, R * (1.05 + i * 0.25), i % 2 ? [1, 0.55, 0.15] : [1, 0.85, 0.4], 0.5, 0.7, i % 2 ? 4 : 7));
    FX.burst(x, 1, z, 40, { color: [1, 0.7, 0.25], frame: 3, size: 0.4, speed: 12, up: 8, life: 1, gravity: -6 });
    FX.burst(x, 1, z, 20, { color: [1, 0.45, 0.1], frame: 0, size: 1.2, speed: 8, up: 5, life: 0.8, gravity: -2 });
    FX.smoke(x, 0.5, z, 12, { size: 1.4, speed: 5, alpha: 0.45 });
    for (const e of Enemies.list) {
      if (!e.alive) continue;
      const dx = e.x - x, dz = e.z - z, d = Math.hypot(dx, dz) || 1; if (d > R + e.radius) continue;
      const dmg = e.def.boss ? e.maxHp * 0.08 : C.bombDamage * st.damageMult;
      Enemies.damage(e, dmg, dx / d, dz / d, 14, 'bomb');
    }
    for (const o of Obstacles.list.slice()) if (Obstacles.solid(o) && Math.hypot(o.x - x, o.z - z) < R) Obstacles.hit(o, 2, o.x - x, o.z - z, o.x, o.z);
  },

  effects(dt) {
    const C = CONFIG.powerups, P = Pumpkin, hx = Hero.x, hz = Hero.z;
    if (this.extra.length) this.updateExtra(dt);
    if (this.active('lightning') && G.state === 'playing') this.lightning(dt);
    // vampire fangs: hearts drift around Sir
    if (this.active('fangs') && Math.random() < dt * 5) FX.emit({ x: hx + rand(-0.8, 0.8), y: 0.6, z: hz + rand(-0.8, 0.8), vy: rand(0.8, 1.6), life: 1.0, size: 0.22, size1: 0.05, color: [1, 0.3, 0.45], alpha: 0.9, frame: 27, layer: 1, rot: 0 });
    // hellfire: the rolling pumpkin leaves fire behind
    if (this.active('hellfire') && P.free && P.speed > 4) { this.hellT -= dt; if (this.hellT <= 0) { this.hellT = 0.06; Combat.addFire(P.x, P.z); } }
    // garlic: an aura that pushes enemies away and hurts them (vampires a lot)
    if (this.active('garlic')) {
      this.garlicTick -= dt; const tick = this.garlicTick <= 0; if (tick) this.garlicTick = 0.5;
      const R = C.garlicRadius;
      for (const e of Enemies.list) {
        if (!e.alive || e.untouchable || e.state === 'under') continue;
        const dx = e.x - hx, dz = e.z - hz, d = Math.hypot(dx, dz) || 1; if (d > R + e.radius * e.scale) continue;
        if (!e.def.boss) { e.kvx += dx / d * 30 * dt; e.kvz += dz / d * 30 * dt; }
        const vamp = e.key === 'vampire' || e.key === 'count' || e.key === 'bat';
        if (tick) { Enemies.damage(e, C.garlicDamage * (vamp ? 3 : 1), dx / d, dz / d, 3, 'garlic'); FX.burst(e.x, 1, e.z, 3, { color: [0.95, 1, 0.8], frame: 31, size: 0.25, speed: 2, life: 0.5 }); }
      }
    }
    // bats: circle Sir, dive at enemies that come close and bite them
    if (this.active('bats')) {
      this.batPhase += dt * 2.6;
      const bats = this.bats || (this.bats = []);
      for (let i = 0; i < C.batCount; i++) {
        const b = bats[i] || (bats[i] = { dive: 0, cd: i * 0.12, target: null });
        b.cd -= dt;
        if (b.dive > 0) {
          const prev = b.dive; b.dive -= dt;
          const e = b.target;
          if (prev > 0.12 && b.dive <= 0.12 && e && e.alive && !e.untouchable) { // the bite, half way through the dive
            Enemies.damage(e, C.batDamage * G.stats.damageMult, (e.x - hx) / 3, (e.z - hz) / 3, 3, 'bats');
            FX.emit({ x: e.x, y: 1.1, z: e.z, size: 1.0, color: [0.8, 0.5, 1], alpha: 0.9, life: 0.2, frame: 19, layer: 0, rot: rand(-0.5, 0.5) });
            SFX.play('squeak', { gap: 0.1, vol: 0.5 });
          }
          if (b.dive <= 0) { b.target = null; b.cd = 0.3; }
        } else if (b.cd <= 0) {
          let best = null, bd = 3.8;
          for (const e of Enemies.list) {
            if (!e.alive || e.untouchable || e.state === 'under' || e.state === 'disguise') continue;
            if (bats.some(o => o !== b && o.target === e)) continue;
            const d = Math.hypot(e.x - hx, e.z - hz); if (d < bd) { bd = d; best = e; }
          }
          if (best) { b.target = best; b.dive = 0.26; } else b.cd = 0.15;
        }
      }
    }
  },
  // ---- Triple Pumpkin: two extra pumpkins per kick, no band, they burst at the end of their run ----
  tripleKick(dx, dz, speed, power) {
    const C = CONFIG.powerups;
    for (const side of [-1, 1]) {
      const a = Math.atan2(dz, dx) + side * C.tripleSpread, ux = Math.cos(a), uz = Math.sin(a);
      this.extra.push({ x: Hero.x + ux * 0.9 - uz * side * 0.15, z: Hero.z + uz * 0.9 + ux * side * 0.15, vx: ux * speed + Hero.vx * 0.8, vz: uz * speed + Hero.vz * 0.8, y: 0.05, vy: 2 + power * 3,
        age: 0, ch: power, radius: Pumpkin.radius * 0.8, spin: new THREE.Quaternion(), power: false });
    }
    SFX.play('kick', { power: power * 0.8, gap: 0 });
  },
  extraHits(p, h) {
    const C = CONFIG.pumpkin, PU = CONFIG.powerups, st = G.stats, sp = Math.hypot(p.vx, p.vz);
    const boost = (this.active('hellfire') ? PU.hellfireDamage : 1) * (this.active('mega') ? PU.megaDamage : 1);
    for (const e of Enemies.list) {
      if (!e.alive || e.untouchable || e.state === 'under' || e.state === 'burrow' || (Enemies.airborne(e) && e.y > 1.4) || (e.state === 'leap' && e.y > 1.0) || (e.def.boss && e.y > 1.6)) continue;
      const er = e.radius * e.scale, dx = e.x - p.x, dz = e.z - p.z, rr = p.radius + er;
      const d2 = dx * dx + dz * dz; if (d2 > rr * rr) continue;
      if (G.time - e.hitT < 0.16) continue;
      e.hitT = G.time;
      const d = Math.sqrt(d2) || 1e-3, nx = dx / d, nz = dz / d;
      let dirx = sp > 0.5 ? p.vx / sp : nx, dirz = sp > 0.5 ? p.vz / sp : nz;
      dirx = dirx * 0.7 + nx * 0.3; dirz = dirz * 0.7 + nz * 0.3; const dl = Math.hypot(dirx, dirz) || 1; dirx /= dl; dirz /= dl;
      const dmg = sp >= C.minDamageSpeed ? C.baseDamage * st.damageMult * clamp(sp / C.damageRefSpeed, 0.35, 2.3) * (1 + C.chargeDamage * p.ch * p.ch) * PU.tripleDamage * boost : 0;
      const knock = (5 + sp * 0.55) * C.knockback * st.knockMult * 0.8;
      Enemies.damage(e, dmg, dirx, dirz, knock, 'pumpkin');
      if (!e.def.boss) { p.vx *= 0.9; p.vz *= 0.9; } else { const vn = p.vx * nx + p.vz * nz; if (vn > 0) { p.vx -= nx * vn * 1.6; p.vz -= nz * vn * 1.6; } }
      FX.burst(p.x + nx * p.radius, 0.6, p.z + nz * p.radius, 5, { color: HIT_COLORS[e.key] || HIT_COLORS.rutabaga, frame: 3, size: 0.22, speed: 4, life: 0.4, gravity: -6 });
      if (dmg > 0) SFX.play('bonk', { vol: clamp(sp / 18, 0.3, 0.8), pitch: rand(1.0, 1.3), gap: 0.03 });
    }
  },
  updateExtra(dt) {
    const C = CONFIG.powerups, PC = CONFIG.pumpkin;
    for (let i = this.extra.length - 1; i >= 0; i--) {
      const p = this.extra[i]; p.age += dt;
      const steps = Math.max(1, Math.ceil(dt / (1 / 120))), h = dt / steps;
      for (let k = 0; k < steps; k++) {
        const fr = Math.exp(-PC.friction * 1.4 * h); p.vx *= fr; p.vz *= fr;
        p.x += p.vx * h; p.z += p.vz * h;
        p.vy -= 28 * h; p.y += p.vy * h; if (p.y <= 0) { p.y = 0; p.vy = Math.abs(p.vy) > 2.5 ? -p.vy * 0.35 : 0; }
        const n = World.solidPush(p, p.radius);
        if (n) { const vn = p.vx * n.x + p.vz * n.z; if (vn < 0) { p.vx -= n.x * vn * 1.6; p.vz -= n.z * vn * 1.6; } }
        Obstacles.hitByPumpkin(p);
        this.extraHits(p, h);
      }
      const sp = Math.hypot(p.vx, p.vz), d = Math.hypot(p.x - Hero.x, p.z - Hero.z);
      _q1.setFromAxisAngle(_v1.set(-p.vz, 0, p.vx).normalize(), sp * dt / Math.max(0.2, p.radius)); p.spin.premultiply(_q1);
      if (sp > 10) FX.emit({ x: p.x - p.vx * 0.012, y: 0.4 + p.y, z: p.z - p.vz * 0.012, vx: -p.vx * 0.08, vz: -p.vz * 0.08, life: 0.14, size: 0.8, size1: 0.3, color: [1, 0.62, 0.25], alpha: 0.2, frame: 0, layer: 0 });
      if (p.age > C.tripleLife || d > C.tripleReach || sp < 3) { // burst into seeds and pulp
        FX.burst(p.x, 0.5, p.z, 14, { color: [1, 0.6, 0.2], frame: 1, size: 0.22, speed: 6, up: 5, gravity: -14, layer: 1, life: 0.8 });
        FX.smoke(p.x, 0.3, p.z, 4, { color: [0.9, 0.5, 0.2], size: 0.7, alpha: 0.4 });
        FX.ring(p.x, p.z, 0.3, 2.2, [1, 0.65, 0.25], 0.35, 0.7, 7);
        Combat.seedBurst(p.x, p.z, p.vx || 1, p.vz || 0); Combat.seedBurst(p.x, p.z, -(p.vx || 1), -(p.vz || 0));
        SFX.play('splat', { gap: 0.05 });
        this.extra.splice(i, 1);
      }
    }
  },
  // ---- Lightning Storm: bolts from the sky onto the enemies around the pumpkin, chaining between them ----
  lightning(dt) {
    const C = CONFIG.powerups, P = Pumpkin, st = G.stats;
    this.thunderT -= dt;
    if (this.thunderT <= 0) { this.thunderT = rand(2.2, 3.4); SFX.play('thunder', { gap: 0.5, vol: 0.5 }); flashScreen(0.18, '#dfe8ff'); }
    this.boltT -= dt; if (this.boltT > 0) return;
    const ox = P.free ? P.x : Hero.x, oz = P.free ? P.z : Hero.z, range = P.free ? C.boltRange : C.boltRange * 0.7;
    let first = null, bd = range;
    for (const e of Enemies.list) {
      if (!e.alive || e.untouchable || e.state === 'under' || e.state === 'burrow' || e.state === 'disguise') continue;
      const d = Math.hypot(e.x - ox, e.z - oz); if (d < bd) { bd = d; first = e; }
    }
    if (!first) { this.boltT = 0.12; return; }
    this.boltT = C.boltEvery;
    const hit = [first];
    while (hit.length < C.boltChain) {
      const last = hit[hit.length - 1]; let next = null, nd = C.boltJump;
      for (const e of Enemies.list) {
        if (!e.alive || e.untouchable || e.state === 'under' || e.state === 'burrow' || e.state === 'disguise' || hit.includes(e)) continue;
        const d = Math.hypot(e.x - last.x, e.z - last.z); if (d < nd) { nd = d; next = e; }
      }
      if (!next) break; hit.push(next);
    }
    // the sky bolt onto the first one, then arcs between the rest
    FX.bolt(first.x + rand(-1, 1), 9, first.z + rand(-1, 1), first.x, 1.0 * first.scale, first.z, 14);
    for (let i = 0; i < hit.length; i++) {
      const e = hit[i];
      if (i > 0) { const a = hit[i - 1]; FX.bolt(a.x, 1.0 * a.scale, a.z, e.x, 1.0 * e.scale, e.z, 7); }
      const dmg = e.def.boss ? e.maxHp * C.boltBoss + C.boltDamage * 0.5 * st.damageMult : C.boltDamage * st.damageMult * (1 - 0.12 * i);
      const dx = e.x - ox, dz = e.z - oz, d = Math.hypot(dx, dz) || 1;
      Enemies.damage(e, dmg, dx / d, dz / d, 4, 'lightning');
      FX.burst(e.x, 1.0, e.z, 8, { color: [0.9, 0.95, 1], frame: 3, size: 0.3, speed: 5, up: 4, life: 0.5, gravity: -8 });
      FX.add.push(e.x, 0.8, e.z, 3.2, 0.8, 0.9, 1, 0.8, 0, 0);
      FX.decal.push(e.x, 0.05, e.z, 2.6, 0.8, 0.9, 1, 0.7, 0, 1);
      if (!e.def.boss) { e.slowT = Math.max(e.slowT, 0.6); e.flinch = 1; }
    }
    SFX.play('zap', { gap: 0.05, pitch: rand(0.85, 1.2) }); addShake(0.12);
  },
  batPos(i) {
    const C = CONFIG.powerups, o = this._bp || (this._bp = { x: 0, y: 0, z: 0, a: 0 });
    const a = this.batPhase + i / C.batCount * TAU, r = 2.1 + 0.45 * Math.sin(this.batPhase * 1.7 + i * 2);
    o.x = Hero.x + Math.cos(a) * r; o.z = Hero.z + Math.sin(a) * r; o.y = 1.3 + Math.sin(this.batPhase * 3 + i) * 0.3; o.a = a;
    const b = this.bats && this.bats[i];
    if (b && b.dive > 0 && b.target) { // swoop down onto the target and back
      const k = Math.sin((1 - b.dive / 0.26) * Math.PI);
      o.x = lerp(o.x, b.target.x, k); o.z = lerp(o.z, b.target.z, k); o.y = lerp(o.y, 0.9, k);
    }
    return o;
  },
  // friendly bats go into the enemy bat batch with a warm tint
  renderBats(batch, pose, time) {
    if (!this.active('bats')) return;
    const pi = Enemies.parts.bat, C = CONFIG.powerups, fade = clamp(this.left('bats') / 0.6, 0, 1);
    for (let i = 0; i < C.batCount; i++) {
      const b = this.batPos(i);
      resetPose(pose); _poseTarget = pose; const fl = Math.sin(time * 26 + i * 1.4);
      poseAdd(pi.WingL, 2, fl); poseAdd(pi.WingR, 2, -fl);
      _v3.set(b.x, b.y, b.z); _q1.setFromAxisAngle(_v2.set(0, 1, 0), -b.a); _v2.set(fade, fade, fade);
      batch.push(_m1.compose(_v3, _q1, _v2), pose, 1.6, 1.15, 0.7);
      FX.add.push(b.x, b.y, b.z, 0.8, 1, 0.6, 0.25, 0.25, 0, 0);
    }
  },
  render() {
    const time = G.realTime;
    for (const k in this.batches) this.batches[k].begin();
    for (const it of this.items) {
      const batch = this.batches[it.key], blink = it.life - it.age < 4 ? (Math.sin(time * 18) > 0 ? 1 : 0.25) : 1;
      const grow = clamp(it.age / 0.4, 0, 1), y = 0.55 + Math.sin(time * 2.6 + it.ph) * 0.15;
      _q1.setFromAxisAngle(_v1.set(0, 1, 0), time * 1.8 + it.ph);
      const s = (it.key === 'bats' ? 2.2 : 1.95) * easeOutBack(grow);
      _m1.compose(_v2.set(it.x, y + (it.key === 'bats' ? 0.5 : 0), it.z), _q1, _v3.set(s, s, s));
      batch.push(_m1, null, 1.25 * blink + 0.1, 1.2 * blink + 0.1, 1.1 * blink + 0.1);
      // glow ring on the floor and a soft beam of light
      FX.decal.push(it.x, 0.05, it.z, 2.4 + 0.2 * Math.sin(time * 4 + it.ph), 1, 0.85, 0.4, 0.45 * blink, time + it.ph, 9);
      FX.add.push(it.x, 1.0, it.z, 2.6, 1, 0.8, 0.45, 0.22 * blink, 0, 11);
      if (Math.random() < 0.15) FX.emit({ x: it.x + rand(-0.4, 0.4), y: rand(0.3, 1.2), z: it.z + rand(-0.4, 0.4), vy: 0.6, life: 0.8, size: 0.2, color: [1, 0.9, 0.5], alpha: 0.9, frame: 3, layer: 0 });
    }
    for (const k in this.batches) this.batches[k].end();
    // the extra pumpkins of Triple Pumpkin
    this.extraBatch.begin();
    for (const p of this.extra) {
      const sc = p.radius / 0.55;
      _m1.compose(_v2.set(p.x, p.y + p.radius, p.z), p.spin, _v3.set(sc, sc, sc));
      this.extraBatch.push(_m1, null, 1.1, 1.05, 1);
      FX.decalA.push(p.x, 0.04, p.z, 1.6 * sc, 0, 0, 0, 0.3, 0, 11);
      FX.add.push(p.x, p.y + p.radius, p.z, 2.2 * sc, 1, 0.6, 0.2, 0.25, 0, 0);
    }
    this.extraBatch.end();
    // running effects
    const P = Pumpkin;
    if (this.active('ghost')) {
      const fade = clamp(this.left('ghost') / 0.6, 0, 1), pulse = 0.8 + 0.2 * Math.sin(time * 9);
      FX.add.push(P.x, 0.55 + P.y, P.z, 2.4 * P.radius / 0.55 * pulse, 0.45, 0.7, 1, 0.22 * fade, 0, 0);
      if (Math.random() < 0.5) FX.emit({ x: P.x + rand(-0.4, 0.4), y: 0.3 + P.y + rand(0, 0.6), z: P.z + rand(-0.4, 0.4), vx: -P.vx * 0.05, vy: rand(0.6, 1.4), vz: -P.vz * 0.05, life: 0.6, size: 0.35, size1: 0.1, color: [0.6, 0.85, 1], alpha: 0.6 * fade, frame: 26, layer: 0, rot: rand(-0.3, 0.3) });
    }
    if (this.active('lightning')) {
      if (Math.random() < 0.35) { const a = rand(0, TAU), r = rand(0.5, 1.2) * P.radius / 0.55; FX.emit({ x: P.x + Math.cos(a) * r, y: 0.5 + P.y + rand(-0.3, 0.5), z: P.z + Math.sin(a) * r, life: 0.1, size: 0.25, color: [0.85, 0.92, 1], alpha: 1, frame: 3, layer: 0 }); }
      FX.add.push(P.x, 0.6 + P.y, P.z, 2.4 * P.radius / 0.55, 0.7, 0.8, 1, 0.2 + 0.1 * Math.sin(time * 30), 0, 0);
    }
    if (this.active('garlic')) {
      const R = CONFIG.powerups.garlicRadius, fade = clamp(this.left('garlic') / 0.6, 0, 1);
      FX.decal.push(Hero.x, 0.05, Hero.z, R * 2, 0.85, 1, 0.65, 0.35 * fade, time * 0.8, 15);
      if (Math.random() < 0.4) { const a = rand(0, TAU); FX.emit({ x: Hero.x + Math.cos(a) * R, y: rand(0.3, 1.4), z: Hero.z + Math.sin(a) * R, vy: 0.4, life: 0.8, size: 0.22, color: [0.95, 1, 0.85], alpha: 0.9, frame: 31, layer: 0, rot: rand(0, TAU) }); }
    }
    if (this.active('hellfire')) {
      for (let i = 0; i < 2; i++) FX.emit({ x: P.x + rand(-0.3, 0.3) * P.radius * 2, y: 0.4 + P.y + rand(0, 0.4), z: P.z + rand(-0.3, 0.3) * P.radius * 2, vx: -P.vx * 0.05, vy: rand(1.2, 2.6), vz: -P.vz * 0.05, life: 0.4, size: 0.6 * P.radius / 0.55, size1: 0.1, color: [1, 0.45, 0.1], alpha: 0.9, frame: 5, layer: 0, rot: 0 });
      FX.add.push(P.x, 0.6 + P.y, P.z, 3.2 * P.radius / 0.55, 1, 0.45, 0.1, 0.35, 0, 0);
    }
    if (this.active('mega') && Math.random() < 0.3) FX.emit({ x: P.x + rand(-1, 1) * P.radius, y: 0.4 + P.y + rand(0, 1) * P.radius, z: P.z + rand(-1, 1) * P.radius, vy: 0.8, life: 0.5, size: 0.25, color: [1, 0.85, 0.3], alpha: 0.9, frame: 3, layer: 0 });
  },
};

// =====================================================================
// 14b. BOSSES: the Headless Horseman, the Spider Queen, the Vampire Count
// and the Grim Reaper (King Rutabaga's moves are in ENEMIES.bossAI).
// A boss runs one move at a time (e.mode) and shows what is coming on the
// floor first. Tuning: CONFIG.bosses.
// =====================================================================
const Bosses = {
  _v: { x: 0, z: 0 },
  init(e) {
    const B = CONFIG.bosses[e.key];
    e.mode = 'idle'; e.modeT = 0; e.stagger = 0; e.moving = false; e.attackT = 1;
    e.t1 = 2.5; e.t2 = 4; e.t3 = 6; e.t4 = 3.5; e.trampleCD = 0;
    if (e.key === 'horseman') { e.mode = 'ride'; e.dir = Math.random() < 0.5 ? 1 : -1; e.t1 = 3; e.t2 = B.chargeEvery * 0.8; }
    if (e.key === 'queen') { e.mode = 'stalk'; e.t1 = 4; e.t2 = 2.5; e.t3 = B.leapEvery * 0.7; }
    if (e.key === 'count') { e.mode = 'arrive'; e.vis = 0; e.swarm = true; e.untouchable = true; e.t1 = B.swarmEvery * 0.8; e.t2 = 5; e.t3 = 3.5; }
    if (e.key === 'reaper') { e.mode = 'arrive'; e.vis = 0; e.untouchable = true; e.t1 = 1.5; e.t2 = B.blinkEvery; e.t3 = 4; e.t4 = 2.5; }
  },
  slow(e) { return e.frozenT > 0 || e.slowT > 0 ? 0.5 : 1; },
  angry(e) { return e.hp < e.maxHp * 0.5; },         // second phase: faster and meaner
  set(e, m) { e.mode = m; e.modeT = 0; },
  // a solid hit can interrupt a dangerous move
  onHit(e, amount, src) {
    if (e.key === 'horseman' && e.mode === 'rear' && (amount >= 30 || src === 'blast')) { this.set(e, 'ride'); e.stagger = 1.1; e.t2 = 5; FX.text('!', e.x, 4.6, e.z, 'big', 0.8); }
    if (e.key === 'count' && (e.mode === 'drain' || e.mode === 'drainUp') && amount > 0) { this.set(e, 'stalk'); e.stagger = 0.6; e.armsUp = 0; e.wingSpread = 0; FX.text('!', e.x, 3.8, e.z, 'big', 0.7); }
    if (e.key === 'reaper' && e.mode === 'windup' && (amount >= 40 || src === 'blast')) { this.set(e, 'recover'); e.stagger = 0.8; FX.text('!', e.x, 4.2, e.z, 'big', 0.8); }
    if (src === 'blast') e.stagger = Math.max(e.stagger, 1.6);
  },

  ai(e, dt, d, tx, tz) {
    const v = this._v; v.x = 0; v.z = 0; e.moving = false;
    e.modeT += dt; e.t1 -= dt; e.t2 -= dt; e.t3 -= dt; e.t4 -= dt; e.trampleCD -= dt; e.attackT -= dt;
    if (e.stagger > 0) { e.stagger -= dt; if (Math.random() < dt * 6) { const a = G.realTime * 7; FX.spark(e.x + Math.cos(a) * 0.6, 3.2 * e.scale, e.z + Math.sin(a) * 0.6, -Math.sin(a), 0.2, Math.cos(a), [1, 0.9, 0.3], 0.4, 0.2, 0, 12); } return v; }
    switch (e.key) {
      case 'horseman': this.horseman(e, dt, d, tx, tz, v); break;
      case 'queen': this.queen(e, dt, d, tx, tz, v); break;
      case 'count': this.count(e, dt, d, tx, tz, v); break;
      case 'reaper': this.reaper(e, dt, d, tx, tz, v); break;
    }
    const sl = this.slow(e); v.x *= sl; v.z *= sl;
    return v;
  },
  // close enough for a melee hit
  melee(e, d, dmg) {
    const reach = CONFIG.hero.radius + e.radius * e.scale + 0.35;
    if (d <= reach && e.attackT <= 0) { e.attackT = e.def.attackRate; e.lunge = 1; return Combat.hurtHero(dmg ?? e.damage, e); }
    return false;
  },
  steer(e, gx, gz, sp, v) {
    const dx = gx - e.x, dz = gz - e.z, dl = Math.hypot(dx, dz);
    if (dl < 0.05) return dl;
    v.x = dx / dl * sp; v.z = dz / dl * sp; e.fx = dx / dl; e.fz = dz / dl; e.moving = true;
    return dl;
  },

  // ---------------- the Headless Horseman ----------------
  // rides around the courtyard throwing flaming pumpkins; now and then he rears
  // up and charges straight across (the arrows on the floor show the line)
  horseman(e, dt, d, tx, tz, v) {
    const B = CONFIG.bosses.horseman, angry = this.angry(e), hx = Hero.x, hz = Hero.z;
    e.phase += dt * (e.mode === 'charge' ? 13 : e.mode === 'ride' ? 9 : 2);
    if (e.mode === 'ride') {
      const R = B.rideRadius, sp = B.rideSpeed * (angry ? 1.2 : 1);
      if (e.rideA === undefined) e.rideA = Math.atan2(e.z, e.x);
      e.rideA += e.dir * sp / R * dt;
      const gx = Math.cos(e.rideA) * R, gz = Math.sin(e.rideA) * R;
      this.steer(e, gx + Math.cos(e.rideA + e.dir * Math.PI / 2) * 2, gz + Math.sin(e.rideA + e.dir * Math.PI / 2) * 2, sp, v);
      if (Math.random() < dt * 8) FX.smoke(e.x - e.fx * 0.8, 0.05, e.z - e.fz * 0.8, 1, { color: [0.3, 0.25, 0.22], size: 0.6, alpha: 0.3, up: 0.4 });
      if (Math.random() < dt * 3) SFX.play('gallop', { gap: 0.3, vol: 0.6 });
      if (e.t1 <= 0) { // throw a flaming pumpkin (two when angry)
        e.t1 = B.throwEvery * rand(0.8, 1.2) * (angry ? 0.75 : 1); e.throwT = 0; e.lunge = 1;
        const lead = B.bombFlight * 0.6, n = angry ? 2 : 1;
        for (let i = 0; i < n; i++) {
          const off = (i - (n - 1) / 2) * 2.2;
          Hazards.throwBomb(e, clamp(hx + Hero.vx * lead - tz * off, -14, 14), clamp(hz + Hero.vz * lead + tx * off, -14, 14));
        }
      }
      if (d < e.radius * e.scale + 0.7 && e.trampleCD <= 0) { e.trampleCD = 1; Combat.hurtHero(B.trample, e); }
      if (e.t2 <= 0 && Math.hypot(e.x, e.z) > 6) { // rear up, then charge through where Sir stands
        this.set(e, 'rear'); SFX.play('neigh', { gap: 0.5 });
        const dx = hx - e.x, dz = hz - e.z, dl = Math.hypot(dx, dz) || 1, ux = dx / dl, uz = dz / dl;
        // where the line leaves the courtyard on the other side
        const b = e.x * ux + e.z * uz, c = e.x * e.x + e.z * e.z - 14.5 * 14.5, t = -b + Math.sqrt(Math.max(0, b * b - c));
        e.cx = ux; e.cz = uz; e.cLen = Math.max(dl + 3, t);
        e.fx = ux; e.fz = uz;
      }
    } else if (e.mode === 'rear') {
      e.fx = e.cx; e.fz = e.cz;
      const k = clamp(e.modeT / B.rear, 0, 1), pulse = 0.5 + 0.5 * Math.sin(G.realTime * 18);
      for (let r = 1.5; r < e.cLen; r += 1.3) FX.decal.push(e.x + e.cx * r, 0.06, e.z + e.cz * r, 1.0, 1, 0.25, 0.1, (0.3 + 0.4 * pulse) * k, Math.atan2(-e.cx, -e.cz), 8);
      if (e.modeT >= B.rear * (angry ? 0.8 : 1)) { this.set(e, 'charge'); e.chargeHit = false; e.cx0 = e.x; e.cz0 = e.z; SFX.play('whoosh', { vol: 1.4 }); addShake(0.15); }
    } else if (e.mode === 'charge') {
      const sp = B.chargeSpeed; v.x = e.cx * sp; v.z = e.cz * sp; e.fx = e.cx; e.fz = e.cz; e.moving = true;
      if (Math.random() < dt * 30) FX.smoke(e.x - e.cx * 0.9, 0.05, e.z - e.cz * 0.9, 1, { color: [0.35, 0.28, 0.24], size: 0.8, alpha: 0.4, up: 0.6 });
      if (Math.random() < dt * 10) FX.emit({ x: e.x, y: 0.03, z: e.z, size: 0.5, color: [0.1, 0.08, 0.08], alpha: 0.7, life: 3, frame: 30, layer: 3, rot: Math.atan2(e.cx, e.cz) });
      if (!e.chargeHit && d < e.radius * e.scale + 0.9) { e.chargeHit = true; Combat.hurtHero(B.chargeDamage * (e.elite ? 1.5 : 1), e); addShake(0.3); }
      // tramples his own minions too
      for (const o of Enemies.list) {
        if (o === e || !o.alive || o.def.boss || Enemies.airborne(o) || o.state === 'under') continue;
        const ox = o.x - e.x, oz = o.z - e.z; if (ox * ox + oz * oz > 2.0) continue;
        const side = Math.sign(ox * -e.cz + oz * e.cx) || 1;
        Enemies.damage(o, 45, -e.cz * side, e.cx * side, 14, 'trample');
      }
      const gone = Math.hypot(e.x - e.cx0, e.z - e.cz0);
      if (gone >= e.cLen || e.modeT > 2.2 || Math.hypot(e.x, e.z) > 15) { this.set(e, 'skid'); SFX.play('thud', { gap: 0.1 }); }
    } else if (e.mode === 'skid') {
      const k = 1 - clamp(e.modeT / 0.5, 0, 1); v.x = e.cx * B.chargeSpeed * 0.3 * k; v.z = e.cz * B.chargeSpeed * 0.3 * k;
      if (e.modeT > 0.9) { this.set(e, 'ride'); e.t2 = B.chargeEvery * rand(0.85, 1.15) * (angry ? 0.75 : 1); e.rideA = Math.atan2(e.z, e.x); e.dir = -e.dir; }
    }
  },

  // ---------------- the Spider Queen ----------------
  // keeps her distance, lays eggs that hatch into spiderlings, spits webs
  // and leaps at Sir (a ring on the floor shows where she lands)
  queen(e, dt, d, tx, tz, v) {
    const B = CONFIG.bosses.queen, angry = this.angry(e), hx = Hero.x, hz = Hero.z, M = e.mode;
    if (M === 'stalk') {
      let x = tx, z = tz, sp = e.speed * (angry ? 1.25 : 1);
      if (d < B.keep + 1.5) { const back = d < B.keep - 1 ? -0.5 : 0.1; x = -tz * e.side + tx * back; z = tx * e.side + tz * back; sp *= 0.8; }
      const l = Math.hypot(x, z) || 1; v.x = x / l * sp; v.z = z / l * sp; e.moving = true; e.fx = tx; e.fz = tz;
      e.phase += dt * sp * 4;
      if (Math.random() < dt * 0.15) e.side = -e.side;
      this.melee(e, d);
      if (e.t1 <= 0) { this.set(e, 'lay'); e.t1 = B.layEvery * (angry ? 0.8 : 1); e.laid = false; }
      else if (e.t2 <= 0 && d < 12) { this.set(e, 'spit'); e.t2 = B.spitEvery * rand(0.85, 1.15) * (angry ? 0.8 : 1); e.shot = false; }
      else if (e.t3 <= 0 && d > 3.5 && d < 12.5) { this.set(e, 'crouch'); e.lx1 = clamp(hx, -13.5, 13.5); e.lz1 = clamp(hz, -13.5, 13.5); SFX.play('hiss', { gap: 0.2, pitch: 0.6 }); }
    } else if (M === 'lay') {
      if (!e.laid && e.modeT > 0.6) {
        e.laid = true; SFX.play('squelch', { gap: 0.05, pitch: 0.7 });
        const n = Math.min(B.eggs + (angry ? 1 : 0), CONFIG.waves.limits.egg - Enemies.count('egg'));
        for (let i = 0; i < n; i++) {
          const a = Math.atan2(-e.fz, -e.fx) + (i - (n - 1) / 2) * 0.9, r = 1.9 * e.scale * 0.5 + 0.9;
          const x = clamp(e.x + Math.cos(a) * r, -13.5, 13.5), z = clamp(e.z + Math.sin(a) * r, -13.5, 13.5);
          const egg = Enemies.spawn('egg', 0, { at: { x, z } }); if (egg) { egg.kvx = Math.cos(a) * 3; egg.kvz = Math.sin(a) * 3; }
        }
      }
      if (e.modeT > 1.0) this.set(e, 'stalk');
    } else if (M === 'spit') {
      e.fx = tx; e.fz = tz;
      if (!e.shot && e.modeT > 0.35) {
        e.shot = true; const n = B.spitShots + (angry ? 2 : 0), base = Math.atan2(hz - e.z, hx - e.x);
        for (let i = 0; i < n; i++) { const a = base + (i - (n - 1) / 2) * 0.28; Hazards.shootWeb(e, e.x + Math.cos(a) * d, e.z + Math.sin(a) * d); }
      }
      if (e.modeT > 0.7) this.set(e, 'stalk');
    } else if (M === 'crouch') {
      const k = clamp(e.modeT / B.leapCrouch, 0, 1), pulse = 0.5 + 0.5 * Math.sin(G.realTime * 16);
      FX.decal.push(e.lx1, 0.06, e.lz1, B.leapRadius * 2, 1, 0.25, 0.6, (0.25 + 0.35 * pulse) * k, G.realTime, 23);
      FX.decal.push(e.lx1, 0.05, e.lz1, B.leapRadius * 2 * k, 0.8, 0.2, 0.7, 0.25, 0, 11);
      if (e.modeT >= B.leapCrouch) { this.set(e, 'leap'); e.lx0 = e.x; e.lz0 = e.z; SFX.play('whoosh', { vol: 1.3 }); }
    } else if (M === 'leap') {
      const k = clamp(e.modeT / B.leapTime, 0, 1);
      e.x = lerp(e.lx0, e.lx1, k); e.z = lerp(e.lz0, e.lz1, k); e.y = Math.sin(k * Math.PI) * 3.0;
      const dx = e.lx1 - e.lx0, dz = e.lz1 - e.lz0, dl = Math.hypot(dx, dz) || 1; e.fx = dx / dl; e.fz = dz / dl;
      if (k >= 1) {
        e.y = 0; this.set(e, 'land'); e.t3 = B.leapEvery * rand(0.85, 1.15) * (angry ? 0.8 : 1);
        SFX.play('slam'); addShake(0.5);
        FX.ring(e.x, e.z, 0.6, B.leapRadius + 1.5, [0.8, 0.4, 1], 0.45, 1); FX.smoke(e.x, 0.1, e.z, 10, { size: 1.0, speed: 3, alpha: 0.4 });
        if (Math.hypot(hx - e.x, hz - e.z) < B.leapRadius) Combat.hurtHero(B.leapDamage, e);
        const P = Pumpkin; if (P.free) { const px = P.x - e.x, pz = P.z - e.z, pd = Math.hypot(px, pz) || 1; if (pd < B.leapRadius + 2) { P.vx += px / pd * 9; P.vz += pz / pd * 9; } }
      }
    } else if (M === 'land') { if (e.modeT > 0.9) this.set(e, 'stalk'); }
  },

  // ---------------- the Vampire Count ----------------
  // turns into a swarm of bats and appears right next to Sir, drains his
  // blood (hit him to break it) and calls bats from under his cape
  count(e, dt, d, tx, tz, v) {
    const B = CONFIG.bosses.count, angry = this.angry(e), hx = Hero.x, hz = Hero.z, M = e.mode;
    e.wingSpread = damp(e.wingSpread || 0, M === 'summon' || M === 'drain' || M === 'drainUp' || M === 'mist' ? 1 : 0, 6, dt);
    e.armsUp = damp(e.armsUp || 0, M === 'drainUp' || M === 'drain' ? 1 : 0, 8, dt);
    if (M === 'arrive') { // bats gather into the Count
      if (e.modeT > 1.2) { this.set(e, 'form'); e.swarm = false; SFX.play('hissV', { gap: 0, pitch: 0.7 }); }
    } else if (M === 'form') {
      e.vis = clamp(e.modeT / 0.4, 0, 1);
      if (e.modeT >= 0.4) { e.vis = 1; e.untouchable = false; this.set(e, 'stalk'); if (e.clawNext) { e.clawNext = false; e.attackT = 0; if (this.melee(e, d - 0.6, B.clawDamage)) FX.emit({ x: hx, y: 1.2, z: hz, size: 2.0, color: [1, 0.3, 0.35], alpha: 1, life: 0.3, frame: 19, layer: 0, rot: rand(-0.5, 0.5) }); } }
    } else if (M === 'stalk') {
      const sp = e.speed * (angry ? 1.25 : 1);
      if (d > 1.4) { v.x = tx * sp; v.z = tz * sp; e.moving = true; }
      e.phase += dt * sp * 3.2;
      this.melee(e, d);
      if (e.t1 <= 0 && d > 3) { this.set(e, 'mist'); e.t1 = B.swarmEvery * rand(0.85, 1.15) * (angry ? 0.75 : 1); SFX.play('hissV', { gap: 0.3 }); }
      else if (e.t2 <= 0 && d < B.drainRange && !PowerUps.active('garlic')) { this.set(e, 'drainUp'); e.t2 = B.drainEvery * rand(0.85, 1.15); }
      else if (e.t3 <= 0) { this.set(e, 'summon'); e.t3 = B.summonEvery * (angry ? 0.75 : 1); e.shot = false; }
    } else if (M === 'mist') {
      e.vis = 1 - clamp(e.modeT / 0.4, 0, 1);
      if (e.modeT >= 0.4) {
        this.set(e, 'swarm'); e.swarm = true; e.untouchable = true; SFX.play('flap', { gap: 0.1 });
        const P = Pumpkin, away = P.free ? Math.atan2(P.z - hz, P.x - hx) + Math.PI : rand(0, TAU); // the side away from the pumpkin
        e.ox = Math.cos(away) * 2.4; e.oz = Math.sin(away) * 2.4;
      }
    } else if (M === 'swarm') {
      const dl = this.steer(e, clamp(hx + e.ox, -13.5, 13.5), clamp(hz + e.oz, -13.5, 13.5), B.swarmSpeed, v); e.moving = false; // follows Sir
      if (Math.random() < dt * 4) SFX.play('flap', { gap: 0.2, vol: 0.6 });
      if (dl < 0.4 || e.modeT > 2.5) { this.set(e, 'form'); e.swarm = false; e.clawNext = true; }
    } else if (M === 'drainUp') {
      e.fx = tx; e.fz = tz;
      if (e.modeT > 0.5) { this.set(e, 'drain'); e.tick = 0; SFX.play('drain', { gap: 0.3 }); }
    } else if (M === 'drain') {
      e.fx = tx; e.fz = tz; e.tick -= dt;
      // a red stream from Sir to the Count
      for (let i = 0; i < 2; i++) { const k = Math.random(); FX.emit({ x: lerp(hx, e.x, k), y: lerp(1.2, 2.2, k), z: lerp(hz, e.z, k), vx: (e.x - hx) * 1.2, vy: 0, vz: (e.z - hz) * 1.2, life: 0.35, size: 0.3, color: [0.95, 0.12, 0.2], alpha: 0.9, frame: i ? 27 : 0, layer: 0 }); }
      if (e.tick <= 0) {
        e.tick = B.drainTick;
        if (Combat.hurtHero(B.drainDamage, e, { soft: true, ignoreInvuln: true })) { e.hp = Math.min(e.maxHp, e.hp + B.drainDamage * 2); UI.bossHp(e.hp / e.maxHp); }
      }
      if (e.modeT > B.drainTime || d > B.drainRange + 1.5 || PowerUps.active('garlic')) { this.set(e, 'stalk'); }
    } else if (M === 'summon') {
      if (!e.shot && e.modeT > 0.4) {
        e.shot = true; SFX.play('flap', { gap: 0 }); SFX.play('squeak', { gap: 0 });
        const n = Math.min(B.bats + (angry ? 2 : 0), CONFIG.waves.limits.bat - Enemies.count('bat'));
        for (let i = 0; i < n; i++) { const a = rand(0, TAU); const b = Enemies.spawn('bat', 0, { at: { x: e.x + Math.cos(a) * 0.6, z: e.z + Math.sin(a) * 0.6 } }); if (b) { b.kvx = Math.cos(a) * 6; b.kvz = Math.sin(a) * 6; b.y = 2.2; } }
      }
      if (e.modeT > 0.9) this.set(e, 'stalk');
    }
  },

  // ---------------- the Grim Reaper ----------------
  // floats after Sir and sweeps his scythe (the red wedge on the floor shows
  // where), vanishes and appears behind Sir, raises skeletons and sends
  // homing souls (the pumpkin can smash them)
  reaper(e, dt, d, tx, tz, v) {
    const B = CONFIG.bosses.reaper, angry = this.angry(e), hx = Hero.x, hz = Hero.z, M = e.mode;
    e.y = 0.12 + Math.sin(G.realTime * 1.8) * 0.08;
    if (M === 'arrive') {
      e.vis = clamp(e.modeT / 1.2, 0, 1);
      if (e.modeT >= 1.2) { e.vis = 1; e.untouchable = false; this.set(e, 'float'); }
    } else if (M === 'float') {
      const sp = e.speed * (angry ? 1.25 : 1);
      if (d > 2.2) { v.x = tx * sp; v.z = tz * sp; e.moving = true; }
      if (d < B.sweepRange && e.t1 <= 0) this.windup(e, tx, tz, B.sweepWindup * (angry ? 0.8 : 1));
      else if (e.t2 <= 0 && d > 4.5) { this.set(e, 'fadeOut'); e.t2 = B.blinkEvery * rand(0.85, 1.15) * (angry ? 0.8 : 1); SFX.play('ghost', { gap: 0.2, pitch: 0.6 }); }
      else if (e.t3 <= 0) { this.set(e, 'raise'); e.t3 = B.harvestEvery * (angry ? 0.8 : 1); e.shot = false; SFX.play('toll', { gap: 0.5 }); }
      else if (e.t4 <= 0 && d > 3) { this.set(e, 'cast'); e.t4 = B.soulsEvery * rand(0.85, 1.15) * (angry ? 0.8 : 1); e.shot = false; }
    } else if (M === 'windup') {
      e.fx = e.sx; e.fz = e.sz;
      const k = clamp(e.modeT / e.wind, 0, 1), pulse = 0.5 + 0.5 * Math.sin(G.realTime * 20);
      FX.decal.push(e.x, 0.06, e.z, B.sweepRadius * 2, 1, 0.12, 0.12, (0.25 + 0.35 * pulse) * k, Math.atan2(-e.sx, -e.sz), 28);
      if (e.modeT >= e.wind) { this.set(e, 'sweep'); this.sweep(e); }
    } else if (M === 'sweep') {
      e.fx = e.sx; e.fz = e.sz;
      if (e.modeT > 0.3) { this.set(e, 'recover'); e.t1 = angry ? 1.0 : 1.5; }
    } else if (M === 'recover') { if (e.modeT > 0.6) this.set(e, 'float'); }
    else if (M === 'fadeOut') {
      e.vis = 1 - clamp(e.modeT / 0.4, 0, 1);
      if (e.modeT >= 0.4) {
        e.untouchable = true;
        // appear behind Sir: the side away from where he is walking (or from the pumpkin)
        let ax = -Math.sin(Hero.yaw), az = -Math.cos(Hero.yaw);
        const hv = Math.hypot(Hero.vx, Hero.vz); if (hv > 0.5) { ax = -Hero.vx / hv; az = -Hero.vz / hv; }
        e.x = clamp(hx + ax * 2.6, -13.5, 13.5); e.z = clamp(hz + az * 2.6, -13.5, 13.5);
        this.set(e, 'fadeIn'); FX.smoke(e.x, 0.3, e.z, 6, { color: [0.15, 0.3, 0.28], size: 1.0, alpha: 0.4 });
      }
    } else if (M === 'fadeIn') {
      e.vis = clamp(e.modeT / 0.3, 0, 1);
      if (e.modeT >= 0.3) { e.vis = 1; e.untouchable = false; const dx = hx - e.x, dz = hz - e.z, dl = Math.hypot(dx, dz) || 1; this.windup(e, dx / dl, dz / dl, 0.55); }
    } else if (M === 'raise') { // skeletons crawl out of the ground all around Sir
      if (!e.shot && e.modeT > 0.6) {
        e.shot = true; const n = B.harvest + (angry ? 2 : 0), a0 = rand(0, TAU);
        for (let i = 0; i < n; i++) {
          const a = a0 + i / n * TAU, x = hx + Math.cos(a) * 4.5, z = hz + Math.sin(a) * 4.5;
          if (Math.hypot(x, z) > 13.8) continue;
          Enemies.spawn('skeleton', 0, { at: { x, z }, state: 'rise' });
        }
        FX.ring(hx, hz, 4.5, 5.5, [0.45, 1, 0.8], 0.6, 0.8, 7);
      }
      if (e.modeT > 1.1) this.set(e, 'float');
    } else if (M === 'cast') {
      e.fx = tx; e.fz = tz;
      if (!e.shot && e.modeT > 0.3) {
        e.shot = true; const n = B.souls + (angry ? 2 : 0);
        for (let i = 0; i < n; i++) { const a = Math.atan2(tz, tx) + (i - (n - 1) / 2) * 0.55; Hazards.fireSoul(e.x + tx * 0.8, e.z + tz * 0.8, Math.cos(a), Math.sin(a)); }
        SFX.play('ghost', { gap: 0, pitch: 1.4 });
      }
      if (e.modeT > 0.6) this.set(e, 'float');
    }
  },
  windup(e, dx, dz, t) { this.set(e, 'windup'); e.wind = t; e.sx = dx; e.sz = dz; SFX.play('scythe', { gap: 0.2, vol: 0.6, pitch: 0.7 }); },
  sweep(e) {
    const B = CONFIG.bosses.reaper, R = B.sweepRadius, half = B.sweepArc / 2;
    SFX.play('scythe', { gap: 0 }); addShake(0.2);
    const inWedge = (x, z) => { const dx = x - e.x, dz = z - e.z, dl = Math.hypot(dx, dz); if (dl > R || dl < 1e-3) return dl < 1e-3; return Math.acos(clamp((dx * e.sx + dz * e.sz) / dl, -1, 1)) <= half; };
    for (let i = 0; i <= 10; i++) { const a = Math.atan2(e.sz, e.sx) + (i / 10 - 0.5) * B.sweepArc; FX.emit({ x: e.x + Math.cos(a) * R * 0.75, y: 1.0, z: e.z + Math.sin(a) * R * 0.75, vx: -Math.sin(a) * 6, vy: 0, vz: Math.cos(a) * 6, life: 0.3, size: 1.2, color: [0.85, 1, 0.95], alpha: 0.9, frame: 29, layer: 0, rot: -a }); }
    if (inWedge(Hero.x, Hero.z)) Combat.hurtHero(B.sweepDamage * (e.elite ? 1.5 : 1), e);
    const P = Pumpkin; if (P.free && inWedge(P.x, P.z)) { const px = P.x - e.x, pz = P.z - e.z, pd = Math.hypot(px, pz) || 1; P.vx += px / pd * 12; P.vz += pz / pd * 12; }
    for (const o of Enemies.list) if (o !== e && o.alive && !o.def.boss && inWedge(o.x, o.z)) Enemies.damage(o, 999, o.x - e.x, o.z - e.z, 8, 'scythe'); // reaps his own too
  },

  // ---------------- looks ----------------
  render(e, time) {
    if (e.key === 'horseman') {
      _v1.set(-0.25, 3.25, -0.04).applyAxisAngle(_v2.set(0, 1, 0), e.yaw);
      const fx = e.x + _v1.x * e.scale, fz = e.z + _v1.z * e.scale, fy = 3.3 * e.scale + e.y;
      FX.add.push(fx, fy, fz, 2.6, 1, 0.55, 0.15, 0.55 + 0.1 * Math.sin(time * 17), 0, 0);
      if (Math.random() < 0.6) FX.emit({ x: fx + rand(-0.15, 0.15), y: fy + 0.3, z: fz + rand(-0.15, 0.15), vy: rand(1.2, 2.4), life: 0.45, size: 0.55, size1: 0.1, color: [1, 0.5, 0.12], alpha: 0.9, frame: 5, layer: 0, rot: 0 });
      for (const s of [-1, 1]) { _v1.set(s * 0.12, 2.0, 1.45).applyAxisAngle(_v2.set(0, 1, 0), e.yaw); FX.add.push(e.x + _v1.x * e.scale, _v1.y * e.scale, e.z + _v1.z * e.scale, 0.45, 1, 0.25, 0.1, 0.6, 0, 0); }
    } else if (e.key === 'queen') {
      FX.decalA.push(e.x, 0.04, e.z, 4.2 * e.scale * 0.5 + 2, 0, 0, 0, 0.35, 0, 11);
      if (Math.random() < 0.2) FX.emit({ x: e.x + rand(-1, 1), y: 0.6, z: e.z + rand(-1, 1), vy: 0.4, life: 1, size: 0.4, color: [0.75, 0.3, 1], alpha: 0.6, frame: 0, layer: 0 });
    } else if (e.key === 'count') {
      FX.add.push(e.x, 1.3 * e.scale, e.z, 3.4 * e.vis, 0.9, 0.12, 0.25, 0.22, 0, 0);
      if (e.mode === 'drain' || e.mode === 'drainUp') FX.add.push(e.x, 1.8 * e.scale, e.z, 3.2, 1, 0.1, 0.2, 0.35 + 0.15 * Math.sin(time * 12), 0, 0);
      if (e.vis > 0.5) for (const s of [-1, 1]) { _v1.set(s * 0.05, 2.23, 0.16).applyAxisAngle(_v2.set(0, 1, 0), e.yaw); FX.add.push(e.x + _v1.x * e.scale, _v1.y * e.scale + e.y, e.z + _v1.z * e.scale, 0.35, 1, 0.15, 0.15, 0.7, 0, 0); }
    } else if (e.key === 'reaper') {
      FX.add.push(e.x, 1.4 * e.scale + e.y, e.z, 3.6 * e.vis, 0.3, 0.9, 0.75, 0.2, 0, 0);
      if (Math.random() < 0.5 * e.vis) FX.emit({ x: e.x + rand(-0.6, 0.6), y: 0.15, z: e.z + rand(-0.6, 0.6), vy: rand(0.2, 0.6), vx: rand(-0.4, 0.4), life: 1.4, size: 1.2, size1: 2.2, color: [0.18, 0.4, 0.36], alpha: 0.28, frame: 2, layer: 1 });
      for (const s of [-1, 1]) { _v1.set(s * 0.062, 2.0, 0.22).applyAxisAngle(_v2.set(0, 1, 0), e.yaw); FX.add.push(e.x + _v1.x * e.scale, _v1.y * e.scale + e.y, e.z + _v1.z * e.scale, 0.4 * e.vis, 0.45, 1, 0.85, 0.75, 0, 0); }
    }
  },
  animHorse(e, pi, set, time, moving) {
    const ph = e.phase, a = moving ? 1 : 0.12, run = e.mode === 'charge' ? 1.25 : 1;
    set(pi.LegL, 0, Math.sin(ph) * 0.65 * a * run); set(pi.LegR, 0, Math.sin(ph + 0.5) * 0.65 * a * run);
    set(pi.LegL2, 0, -Math.sin(ph + 1.4) * 0.55 * a * run); set(pi.LegR2, 0, -Math.sin(ph + 1.9) * 0.55 * a * run);
    set(pi.Body, 0, Math.sin(ph) * 0.05 * a); set(pi.Body, 4, Math.abs(Math.sin(ph)) * 0.08 * a);
    set(pi.Head, 0, Math.sin(ph + 0.6) * 0.1 * a); set(pi.Tail, 0, -0.35 * a + Math.sin(time * 3) * 0.08); set(pi.Tail, 1, Math.sin(time * 2.4) * 0.25);
    set(pi.Rider, 4, Math.abs(Math.cos(ph)) * 0.06 * a); set(pi.Rider, 0, -Math.sin(ph) * 0.05 * a);
    set(pi.Cape, 0, 0.25 * a * run + Math.sin(time * 9) * 0.1); set(pi.Cape, 2, Math.sin(time * 5) * 0.06);
    set(pi.ArmR, 2, Math.sin(time * 2) * 0.08); set(pi.Flame, 7, Math.sin(time * 23) * 0.15);
    if (e.throwT !== undefined && e.throwT < 0.45) { e.throwT += 1 / 60; const k = Math.sin(clamp(e.throwT / 0.45, 0, 1) * Math.PI); set(pi.ArmR, 0, 1.4 * k); }
    if (e.mode === 'rear') { // rears up on the hind legs, front hooves kicking
      const k = smooth(clamp(e.modeT / 0.35, 0, 1));
      set(pi.Body, 0, -0.55 * k); set(pi.Body, 4, 0.25 * k);
      set(pi.LegL, 0, -0.9 * k + Math.sin(time * 14) * 0.5 * k); set(pi.LegR, 0, -0.9 * k + Math.sin(time * 14 + 1) * 0.5 * k);
      set(pi.LegL2, 0, 0.45 * k); set(pi.LegR2, 0, 0.45 * k); set(pi.Head, 0, -0.3 * k); set(pi.Rider, 0, 0.45 * k);
    }
  },
  animReaper(e, pi, set, time) {
    const M = e.mode;
    set(pi.Body, 2, Math.sin(time * 1.2) * 0.05); set(pi.Cape, 0, 0.25 + Math.sin(time * 3) * 0.12); set(pi.Cape, 1, Math.sin(time * 1.7) * 0.15);
    set(pi.Head, 1, Math.sin(time * 0.7) * 0.15); set(pi.Jaw, 0, Math.max(0, Math.sin(time * 3)) * 0.12);
    set(pi.ArmL, 0, Math.sin(time * 1.5) * 0.1); set(pi.ArmR, 0, Math.sin(time * 1.3) * 0.08);
    if (M === 'windup') { const k = smooth(clamp(e.modeT / (e.wind || 0.7), 0, 1)); set(pi.ArmR, 0, -1.0 * k); set(pi.ArmR, 1, 1.1 * k); set(pi.Body, 1, 0.5 * k); set(pi.Jaw, 0, 0.3 * k); }
    if (M === 'sweep') { const k = clamp(e.modeT / 0.22, 0, 1); set(pi.ArmR, 0, -1.0 + 0.6 * k); set(pi.ArmR, 1, lerp(1.1, -1.5, easeOutCubic(k))); set(pi.Body, 1, lerp(0.5, -0.6, k)); }
    if (M === 'recover') { const k = 1 - clamp(e.modeT / 0.6, 0, 1); set(pi.ArmR, 1, -1.5 * k); set(pi.Body, 1, -0.6 * k); }
    if (M === 'raise') { const k = Math.sin(clamp(e.modeT / 1.1, 0, 1) * Math.PI); set(pi.ArmL, 0, -2.4 * k); set(pi.ArmR, 0, -1.4 * k); set(pi.Head, 0, -0.3 * k); }
    if (M === 'cast') { const k = Math.sin(clamp(e.modeT / 0.6, 0, 1) * Math.PI); set(pi.ArmL, 0, -1.3 * k); }
  },
};

// =====================================================================
// 15e. RUTABAGA EVENTS: the glowing rutabagas fill a three-slot meter.
//   The third one calls a RUTABAGA JAM: burning rutabagas rain down on the
//   enemies for a few seconds and leave fire behind.
//   Three from ONE kick call a RUTABAGAMAGEDDON: a giant rutabaga meteor
//   crashes down (the courtyard-wide blast) and the Rutabaga Champion climbs
//   out of the crater to smash enemies with his mallet for ten seconds.
// Tuning: CONFIG.combo (jam*, meteorFall, mageddonTime) and CONFIG.champion.
// =====================================================================
const Rutabaga = {
  meter: 0, jamT: 0, dropT: 0, rain: [], meteor: null, champ: null,
  rigRain: null, rigMeteor: null, rigHero: null, heroParts: null, heroPose: null,
  init(scene) {
    const rt = new RigTemplate(Assets.models.glowing_rutabaga);
    this.rigRain = new RigBatch(rt, 48, { castShadow: false }).addTo(scene);
    this.rigMeteor = new RigBatch(rt, 1, { castShadow: true }).addTo(scene);
    const tpl = new RigTemplate(Assets.models[CONFIG.champion.model]);
    this.heroTpl = tpl;
    this.rigHero = new RigBatch(tpl, 1, { castShadow: true }).addTo(scene);
    const pi = {}; for (const nm of PART_NAMES) pi[nm] = tpl.part(nm);
    this.heroParts = pi; this.heroPose = makePose(tpl);
  },
  reset() { this.meter = 0; this.jamT = 0; this.dropT = 0; this.rain.length = 0; this.meteor = null; this.champ = null; },

  // a glowing rutabaga was collected at (x, z): the meter counts every one (Rutabaga Jam at needed),
  // the chain counts the ones from this kick (Rutabagamageddon at comboNeeded, whatever the meter says)
  collect(x, z) {
    const C = CONFIG.combo;
    G.chain++; this.meter++;
    SFX.play('collect', { n: Math.min(4, G.chain), gap: 0 });
    if (G.chain >= C.comboNeeded) {
      G.chain = 0; this.meter = 0; UI.setChain(0, false, 0); UI.chainResetT = 0;
      this.mageddon(x, z);
      return;
    }
    if (G.chain >= 2) FX.text('COMBO ' + G.chain + '/' + C.comboNeeded + '!', x, 2.2, z, 'combo', 1.1);
    else FX.text(this.meter + ' / ' + C.needed, x, 1.8, z, 'chain', 0.9);
    if (this.meter >= C.needed) {
      this.meter = 0; UI.setChain(0, false, 0); UI.chainResetT = 0;
      this.jam(x, z);
      return;
    }
    UI.setChain(this.meter, true, G.chain);
  },

  // ---------------- Rutabaga Jam ----------------
  jam(x, z) {
    const C = CONFIG.combo;
    G.jams = (G.jams || 0) + 1; G.score += 250;
    this.jamT = C.jamTime; this.dropT = 0.1;
    PowerUps.timers.jam = C.jamTime;
    SFX.play('jam', { gap: 0 }); SFX.duck(0.4, 1.2);
    flashScreen(0.5, '#ffd8a0'); addShake(0.45); slowmo(0.35, 0.4);
    UI.banner(t('jam'), t('jamSub'), 'blast'); UI.powerToast('jam');
    FX.ring(x, z, 0.5, 9, [1, 0.6, 0.15], 0.6, 1, 7);
    FX.burst(x, 1, z, 30, { color: [1, 0.55, 0.15], frame: 5, size: 0.5, speed: 7, up: 8, life: 0.9, gravity: -4 });
  },
  dropTarget() {
    const C = CONFIG.combo, alive = [];
    for (const e of Enemies.list) if (e.alive && e.state !== 'under' && !e.untouchable && Math.hypot(e.x, e.z) < 14.5) alive.push(e);
    if (alive.length && Math.random() < C.jamAim) { const e = pick(alive); return { x: e.x + rand(-0.8, 0.8), z: e.z + rand(-0.8, 0.8) }; }
    const a = rand(0, TAU), r = rand(1.5, 10);
    let x = Hero.x + Math.cos(a) * r, z = Hero.z + Math.sin(a) * r; const d = Math.hypot(x, z);
    if (d > 14) { x *= 14 / d; z *= 14 / d; }
    return { x, z };
  },
  impact(x, z, big) {
    const C = CONFIG.combo, st = G.stats, R = C.jamRadius * (big ? 1.6 : 1);
    SFX.play('splash', { gap: 0.04, vol: big ? 1 : 0.7 }); addShake(big ? 0.22 : 0.09);
    FX.ring(x, z, 0.3, R * 2, [1, 0.6, 0.2], 0.4, 0.9, 7);
    FX.burst(x, 0.4, z, big ? 24 : 12, { color: [1, 0.55, 0.15], frame: 5, size: 0.45, speed: 5, up: 6, life: 0.6, gravity: -8 });
    FX.burst(x, 0.5, z, 8, { color: [0.75, 0.4, 0.85], frame: 1, size: 0.22, speed: 7, up: 6, gravity: -16, layer: 1, life: 0.8 });
    FX.smoke(x, 0.3, z, 4, { color: [0.4, 0.25, 0.2], size: 0.9, alpha: 0.4 });
    for (const e of Enemies.list) {
      if (!e.alive || e.state === 'under' || e.untouchable) continue;
      const dx = e.x - x, dz = e.z - z, d = Math.hypot(dx, dz); if (d > R + e.radius * e.scale) continue;
      const dmg = (e.def.boss ? e.maxHp * 0.012 + C.jamDamage * 0.5 : C.jamDamage) * st.blastMult * st.damageMult * (big ? 1.5 : 1);
      Enemies.damage(e, dmg, dx / (d || 1), dz / (d || 1), big ? 12 : 7, 'jam');
    }
    for (const o of Obstacles.list.slice()) if (Obstacles.solid(o) && Math.hypot(o.x - x, o.z - z) < R) Obstacles.hit(o, 1, o.x - x, o.z - z, o.x, o.z);
    // the rutabaga keeps burning on the floor for a while
    const n = big ? 5 : 3;
    for (let i = 0; i < n; i++) { const a = rand(0, TAU), r = i ? rand(0.3, 0.9) : 0; Combat.fires.push({ x: x + Math.cos(a) * r, z: z + Math.sin(a) * r, age: 0, life: C.jamFireLife + rand(-0.4, 0.6), tick: rand(0, 0.25) }); }
    while (Combat.fires.length > 90) Combat.fires.shift();
  },

  // ---------------- Rutabagamageddon ----------------
  mageddon(x, z) {
    const C = CONFIG.combo;
    const r = Math.hypot(x, z); if (r > 12) { x *= 12 / r; z *= 12 / r; }
    this.meteor = { x, z, t: 0, T: C.meteorFall, y0: 26 };
    SFX.play('meteor', { gap: 0 }); SFX.play('thunder', { gap: 0, vol: 0.6 });
    flashScreen(0.3, '#e8c8ff'); addShake(0.3);
    UI.banner(t('mageddon'), t('mageddonSub'), 'blast');
    FX.text('!!!', x, 2.5, z, 'big', 1.0);
  },
  land() {
    const m = this.meteor, C = CONFIG.combo, CH = CONFIG.champion;
    this.meteor = null;
    Combat.rutabagaBlast(m.x, m.z, true);
    SFX.play('smash', { gap: 0 });
    for (let i = 0; i < 30; i++) { const a = rand(0, TAU), sp = rand(6, 16); FX.emit({ x: m.x, y: 0.6, z: m.z, vx: Math.cos(a) * sp, vy: rand(5, 13), vz: Math.sin(a) * sp, life: rand(0.8, 1.4), size: rand(0.25, 0.5), color: i % 3 ? [0.6, 0.3, 0.7] : [0.95, 0.85, 0.5], alpha: 1, frame: 21, layer: 1, gravity: -22, bounce: true, vrot: rand(-8, 8) }); }
    FX.emit({ x: m.x, y: 0.05, z: m.z, size: 7, color: [0.25, 0.15, 0.2], alpha: 0.75, life: 14, frame: 13, layer: 3 }); // the crater
    // the Champion climbs out of the crater
    const a = Math.atan2(Hero.x - m.x, Hero.z - m.z);
    this.champ = { x: m.x, z: m.z, y: -2.2, yaw: a, fx: Math.sin(a), fz: Math.cos(a), vx: 0, vz: 0, t: 0, life: C.mageddonTime, mode: 'rise', modeT: 0, phase: 0,
      slamCD: 0.6, poundCD: 2.2, retargetT: 0, target: null, moving: false, radius: CH.radius, scale: CH.scale, hitT: -9, bounce: 0 };
    PowerUps.timers.mageddon = C.mageddonTime;
    UI.powerToast('mageddon');
    Game.later(0.5, () => { SFX.play('fanfare', { gap: 0 }); SFX.play('hup', { gap: 0, pitch: 0.8 }); });
  },

  update(dt) {
    const C = CONFIG.combo;
    // rain of burning rutabagas
    if (this.jamT > 0) {
      this.jamT -= dt; this.dropT -= dt;
      if (this.dropT <= 0 && G.state === 'playing') { this.dropT = C.jamEvery; const p = this.dropTarget(); this.rain.push({ x: p.x, z: p.z, t: 0, T: C.jamFall * rand(0.85, 1.15), spin: rand(0, TAU), big: Math.random() < 0.12 }); }
    }
    for (let i = this.rain.length - 1; i >= 0; i--) {
      const d = this.rain[i]; d.t += dt;
      if (d.t >= d.T) { this.impact(d.x, d.z, d.big); this.rain.splice(i, 1); }
    }
    // the meteor
    if (this.meteor) {
      const m = this.meteor; m.t += dt;
      if (m.t >= m.T) this.land();
    }
    if (this.champ) this.updateChampion(dt);
  },

  // ---------------- the Rutabaga Champion ----------------
  champPos(y = 0.6) { const c = this.champ; return { x: c.x + c.fx * 1.4, z: c.z + c.fz * 1.4, y }; },
  pickTarget() {
    const c = this.champ, hx = Hero.x, hz = Hero.z; let best = null, bs = 1e9;
    for (const e of Enemies.list) {
      if (!e.alive || e.untouchable || e.state === 'under' || e.state === 'burrow' || e.state === 'disguise' || (Enemies.airborne(e) && e.key === 'witch')) continue;
      const dh = Math.hypot(e.x - hx, e.z - hz); if (dh > 15) continue;
      const sc = Math.hypot(e.x - c.x, e.z - c.z) + dh * 0.6 - (e.def.boss ? 3 : 0);
      if (sc < bs) { bs = sc; best = e; }
    }
    return best;
  },
  updateChampion(dt) {
    const c = this.champ, CH = CONFIG.champion, st = G.stats;
    c.t += dt; c.modeT += dt; c.slamCD -= dt; c.poundCD -= dt; c.retargetT -= dt; c.moving = false;
    const M = c.mode;
    if (M === 'rise') {
      const k = clamp(c.modeT / 0.55, 0, 1); c.y = -2.2 * (1 - smooth(k));
      if (Math.random() < dt * 30) FX.smoke(c.x + rand(-1, 1), 0.2, c.z + rand(-1, 1), 1, { color: [0.4, 0.28, 0.3], size: 0.9, alpha: 0.4, up: 1.5 });
      if (k >= 1) { c.y = 0; this.setMode('hunt'); addShake(0.2); FX.ring(c.x, c.z, 0.5, 5, [1, 0.85, 0.3], 0.5, 0.9, 7); SFX.play('thud', { gap: 0 }); }
      return;
    }
    if (M === 'leave') {
      const k = clamp(c.modeT / 0.9, 0, 1);
      c.y = Math.sin(k * Math.PI) * 3.5 + k * k * 12; c.yaw += dt * 9;
      if (k >= 1) {
        for (let i = 0; i < CH.candy; i++) Pickups.dropCandy(i % 4 === 0 ? 'wrapped' : 'corn', c.x, c.z, 1);
        FX.burst(c.x, 1, c.z, 20, { color: [1, 0.85, 0.35], frame: 3, size: 0.35, speed: 6, up: 6, life: 0.8 });
        SFX.play('power', { gap: 0 }); this.champ = null;
      }
      return;
    }
    if (c.t >= c.life && M === 'hunt') { this.setMode('leave'); SFX.play('hup', { gap: 0, pitch: 1.2 }); FX.text(t('championGone'), c.x, 3.2, c.z, 'combo', 1.1); return; }
    // a target to chase
    if (!c.target || !c.target.alive || c.retargetT <= 0) { c.target = this.pickTarget(); c.retargetT = 0.35; }
    const tg = c.target;
    if (M === 'hunt') {
      let gx, gz, stopAt;
      if (tg) { gx = tg.x; gz = tg.z; stopAt = CH.slamRange * 0.8 + tg.radius * tg.scale; }
      else { const a = Math.atan2(c.z - Hero.z, c.x - Hero.x); gx = Hero.x + Math.cos(a) * 2.4; gz = Hero.z + Math.sin(a) * 2.4; stopAt = 0.4; }
      const dx = gx - c.x, dz = gz - c.z, d = Math.hypot(dx, dz) || 1e-3;
      if (d > stopAt) {
        const sp = CH.speed * clamp((d - stopAt) / 1.2 + 0.3, 0.3, 1);
        c.vx = damp(c.vx, dx / d * sp, 12, dt); c.vz = damp(c.vz, dz / d * sp, 12, dt); c.moving = true;
      } else { c.vx = damp(c.vx, 0, 16, dt); c.vz = damp(c.vz, 0, 16, dt); }
      if (tg) { const fa = Math.atan2(dx, dz); c.yaw = angleLerp(c.yaw, fa, 1 - Math.exp(-CH.turn * dt)); }
      else if (c.moving) c.yaw = angleLerp(c.yaw, Math.atan2(c.vx, c.vz), 1 - Math.exp(-CH.turn * dt));
      c.fx = Math.sin(c.yaw); c.fz = Math.cos(c.yaw);
      // slam a target in reach, ground-pound a crowd
      let near = 0; for (const e of Enemies.list) if (e.alive && !e.untouchable && e.state !== 'under' && Math.hypot(e.x - c.x, e.z - c.z) < CH.poundRadius) near++;
      if (c.poundCD <= 0 && near >= CH.poundNeed) { this.setMode('pound'); SFX.play('hup', { gap: 0, pitch: 0.7 }); }
      else if (tg && c.slamCD <= 0 && d <= CH.slamRange + tg.radius * tg.scale) { this.setMode('slam'); SFX.play('hup', { gap: 0 }); }
    } else if (M === 'slam') {
      c.vx = damp(c.vx, 0, 14, dt); c.vz = damp(c.vz, 0, 14, dt);
      if (tg && c.modeT < CH.slamWindup) { const fa = Math.atan2(tg.x - c.x, tg.z - c.z); c.yaw = angleLerp(c.yaw, fa, 1 - Math.exp(-14 * dt)); c.fx = Math.sin(c.yaw); c.fz = Math.cos(c.yaw); }
      if (!c.hit && c.modeT >= CH.slamWindup) { c.hit = true; this.smash(c.x + c.fx * 1.5, c.z + c.fz * 1.5, CH.slamRadius, CH.slamDamage, CH.slamBoss, false); }
      if (c.modeT >= CH.slamWindup + CH.slamRecover) { this.setMode('hunt'); c.slamCD = CH.slamEvery; }
    } else if (M === 'pound') {
      c.vx = damp(c.vx, 0, 14, dt); c.vz = damp(c.vz, 0, 14, dt);
      const k = clamp(c.modeT / CH.poundWindup, 0, 1); c.y = Math.sin(k * Math.PI) * 1.4;
      if (!c.hit && c.modeT >= CH.poundWindup) { c.hit = true; c.y = 0; this.smash(c.x, c.z, CH.poundRadius, CH.poundDamage, CH.slamBoss * 1.5, true); }
      if (c.modeT >= CH.poundWindup + CH.poundRecover) { this.setMode('hunt'); c.poundCD = CH.poundEvery; }
    }
    // move, stay inside the walls, smash the gravestones in the way, shoulder enemies aside
    c.x += c.vx * dt; c.z += c.vz * dt;
    World.solidPush(c, c.radius);
    for (const o of Obstacles.list.slice()) {
      if (!Obstacles.solid(o)) continue;
      const dx = c.x - o.x, dz = c.z - o.z, d = Math.hypot(dx, dz); if (d > o.def.radius + c.radius) continue;
      if (G.time - o.hitT > 0.3) Obstacles.hit(o, 3, -dx, -dz, o.x, o.z); c.x = o.x + dx / (d || 1) * (o.def.radius + c.radius);
    }
    for (const e of Enemies.list) {
      if (!e.alive || e.def.boss || e.untouchable || e.state === 'under' || Enemies.airborne(e)) continue;
      const dx = e.x - c.x, dz = e.z - c.z, d = Math.hypot(dx, dz), rr = c.radius + e.radius * e.scale; if (d > rr || d < 1e-4) continue;
      e.kvx += dx / d * CH.push * dt; e.kvz += dz / d * CH.push * dt;
    }
    { const dx = Hero.x - c.x, dz = Hero.z - c.z, d = Math.hypot(dx, dz), rr = c.radius + 0.6; if (d < rr && d > 1e-4) { c.x -= dx / d * (rr - d); c.z -= dz / d * (rr - d); } }
    if (c.moving) { c.phase += dt * 9; if (Math.random() < dt * 6) FX.smoke(c.x - c.fx * 0.5, 0.1, c.z - c.fz * 0.5, 1, { color: [0.4, 0.3, 0.3], size: 0.6, alpha: 0.3, up: 0.6 }); }
    else c.phase += dt * 2;
  },
  setMode(m) { const c = this.champ; c.mode = m; c.modeT = 0; c.hit = false; },
  smash(x, z, R, dmg, bossFrac, pound) {
    const st = G.stats, c = this.champ;
    SFX.play('smash', { gap: 0, vol: pound ? 1.2 : 0.9 }); addShake(pound ? 0.5 : 0.28); if (pound) hitstop(0.05);
    FX.ring(x, z, 0.4, R * 2, [1, 0.8, 0.3], 0.45, 1, 7);
    if (pound) FX.ring(x, z, 0.3, R * 1.6, [1, 1, 0.8], 0.3, 0.8, 4);
    FX.burst(x, 0.5, z, pound ? 26 : 14, { color: [0.75, 0.6, 0.5], frame: 21, size: 0.22, speed: 7, up: 6, gravity: -18, layer: 1, life: 0.8, bounce: true });
    FX.smoke(x, 0.3, z, pound ? 10 : 5, { color: [0.45, 0.35, 0.3], size: 1.0, alpha: 0.4 });
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; FX.emit({ x: x + Math.cos(a) * 0.5, y: 0.1, z: z + Math.sin(a) * 0.5, vx: Math.cos(a) * 9, vz: Math.sin(a) * 9, life: 0.4, size: 1.0, size1: 1.8, color: [0.9, 0.7, 0.4], alpha: 0.35, frame: 2, layer: 1, drag: 3 }); }
    let n = 0;
    for (const e of Enemies.list) {
      if (!e.alive || e.untouchable || e.state === 'under' || e.state === 'burrow') continue;
      const dx = e.x - x, dz = e.z - z, d = Math.hypot(dx, dz) || 1; if (d > R + e.radius * e.scale) continue;
      const amount = e.def.boss ? e.maxHp * bossFrac + dmg * 0.4 * st.damageMult : dmg * st.damageMult;
      Enemies.damage(e, amount, dx / d, dz / d, CONFIG.champion.knock * (pound ? 1.3 : 1), 'champion'); n++;
    }
    for (const o of Obstacles.list.slice()) if (Obstacles.solid(o) && Math.hypot(o.x - x, o.z - z) < R) Obstacles.hit(o, pound ? 6 : 2, o.x - x, o.z - z, o.x, o.z);
    if (n >= 3 && G.realTime - Combat.lastPopT > 0.4) { Combat.lastPopT = G.realTime; FX.text(pick(t('pops')), x, 2.2, z, 'pop', 0.8); }
    const P = Pumpkin; if (P.free) { const px = P.x - x, pz = P.z - z, pd = Math.hypot(px, pz) || 1; if (pd < R) { P.vx += px / pd * 6; P.vz += pz / pd * 6; } }
  },

  render() {
    const time = G.realTime, C = CONFIG.combo;
    // falling burning rutabagas with their shadows on the floor
    this.rigRain.begin();
    for (const d of this.rain) {
      const k = clamp(d.t / d.T, 0, 1), y = 16 * (1 - k) * (1 - k) + 0.3, s = d.big ? 3.8 : 2.7;
      _q1.setFromAxisAngle(_v1.set(0.6, 0.3, 0.74).normalize(), d.spin + d.t * 14);
      _m1.compose(_v2.set(d.x, y, d.z), _q1, _v3.set(s, s, s));
      this.rigRain.push(_m1, null, 1.6, 0.8, 0.4);
      FX.add.push(d.x, y, d.z, 0.9 * s, 1, 0.5, 0.12, 0.45, 0, 0);
      for (let i = 0; i < 2; i++) FX.emit({ x: d.x + rand(-0.25, 0.25), y: y + rand(0.2, 1.4), z: d.z + rand(-0.25, 0.25), vy: rand(2, 5), life: 0.32, size: 0.7 * (d.big ? 1.5 : 1), size1: 0.15, color: [1, 0.55 - 0.2 * i, 0.12], alpha: 0.95, frame: 5, layer: 0, rot: 0 });
      if (Math.random() < 0.6) FX.emit({ x: d.x, y: y + 0.8, z: d.z, vy: 1.5, life: 0.5, size: 0.5, size1: 1.2, color: [0.3, 0.2, 0.2], alpha: 0.35, frame: 2, layer: 1 });
      FX.decal.push(d.x, 0.05, d.z, (0.8 + 2.4 * k) * (d.big ? 1.6 : 1), 1, 0.45, 0.1, 0.25 + 0.6 * k, 0, 15);
      FX.decalA.push(d.x, 0.04, d.z, 1.2 * (0.4 + 0.6 * k), 0, 0, 0, 0.3 * k, 0, 11);
    }
    this.rigRain.end();
    // the meteor: a huge glowing rutabaga roaring down onto a growing shadow
    this.rigMeteor.begin();
    if (this.meteor) {
      const m = this.meteor, k = clamp(m.t / m.T, 0, 1), y = m.y0 * (1 - k) * (1 - k) + 0.8, s = 8.5;
      _q1.setFromAxisAngle(_v1.set(0.3, 1, 0.2).normalize(), m.t * 5);
      _m1.compose(_v2.set(m.x, y, m.z), _q1, _v3.set(s, s, s));
      this.rigMeteor.push(_m1, null, 1.8, 1.0, 0.5);
      FX.add.push(m.x, y, m.z, 6, 1, 0.55, 0.15, 0.35, 0, 0);
      for (let i = 0; i < 5; i++) FX.emit({ x: m.x + rand(-1.4, 1.4), y: y + rand(0.5, 4), z: m.z + rand(-1.4, 1.4), vy: rand(4, 10), life: 0.4, size: 2.0, size1: 0.4, color: [1, 0.5 - 0.1 * (i % 2), 0.12], alpha: 0.9, frame: 5, layer: 0, rot: 0 });
      for (let i = 0; i < 2; i++) FX.emit({ x: m.x + rand(-1, 1), y: y + rand(2, 5), z: m.z + rand(-1, 1), vy: 2, life: 0.8, size: 1.5, size1: 3.5, color: [0.3, 0.2, 0.25], alpha: 0.4, frame: 2, layer: 1 });
      const pulse = 0.5 + 0.5 * Math.sin(time * 26);
      FX.decal.push(m.x, 0.05, m.z, 4 + 30 * k, 1, 0.3, 0.1, 0.35 + 0.45 * pulse, time * 0.5, 15);
      FX.decal.push(m.x, 0.06, m.z, (4 + 30 * k) * 0.6, 1, 0.8, 0.3, 0.35 * k, 0, 7);
      FX.decalA.push(m.x, 0.04, m.z, 2 + 12 * k, 0, 0, 0, 0.45 * k, 0, 11);
    }
    this.rigMeteor.end();
    // the Champion
    this.rigHero.begin();
    if (this.champ) this.renderChampion(time);
    this.rigHero.end();
  },
  renderChampion(time) {
    const c = this.champ, CH = CONFIG.champion, pi = this.heroParts, p = this.heroPose;
    resetPose(p); _poseTarget = p; const set = poseAdd, ph = c.phase, M = c.mode;
    const a = c.moving ? 1 : 0.2;
    set(pi.LegL, 0, Math.sin(ph) * 0.5 * a); set(pi.LegR, 0, -Math.sin(ph) * 0.5 * a);
    set(pi.ArmL, 0, -Math.sin(ph) * 0.35 * a); set(pi.ArmR, 0, Math.sin(ph) * 0.3 * a);
    set(pi.Body, 2, Math.sin(ph) * 0.08 * a); set(pi.Body, 4, Math.abs(Math.cos(ph)) * 0.06 * a);
    set(pi.Head, 2, Math.sin(time * 2.6) * 0.1); set(pi.Head, 0, Math.sin(time * 1.9) * 0.06);
    set(pi.Cape, 0, 0.25 + (c.moving ? 0.35 : 0) + Math.sin(time * 7 + 1) * 0.12); set(pi.Cape, 2, Math.sin(time * 4.5) * 0.08);
    if (M === 'slam') {
      const w = CH.slamWindup, k = c.modeT < w ? c.modeT / w : 1 - clamp((c.modeT - w) / 0.1, 0, 1) * 1.25;
      set(pi.ArmR, 0, -2.6 * clamp(k, -0.25, 1)); set(pi.Body, 0, c.modeT < w ? -0.25 * k : 0.35); set(pi.ArmL, 2, 0.6 * clamp(k, 0, 1));
    } else if (M === 'pound') {
      const w = CH.poundWindup, k = clamp(c.modeT / w, 0, 1), down = c.modeT >= w;
      set(pi.ArmR, 0, down ? 0.4 : -2.8 * k); set(pi.ArmL, 0, down ? 0.4 : -2.4 * k); set(pi.Body, 0, down ? 0.3 : -0.2 * k);
      if (down) set(pi.Body, 7, 0.9); // squashed on landing
    } else if (M === 'rise') { set(pi.ArmL, 0, -1.4); set(pi.ArmR, 0, -1.6); }
    else if (M === 'leave') { set(pi.ArmL, 0, -2.4); set(pi.ArmR, 0, -2.2); }
    _v3.set(c.x, c.y, c.z); _q1.setFromAxisAngle(_v2.set(0, 1, 0), c.yaw); _v2.set(c.scale, c.scale, c.scale);
    this.rigHero.push(_m1.compose(_v3, _q1, _v2), p, 1.15, 1.1, 1);
    // hero aura, sparkles and a shadow
    const left = c.life - c.t, blink = left < 2.5 && M !== 'leave' ? (Math.sin(time * 14) > 0 ? 1 : 0.4) : 1;
    FX.decal.push(c.x, 0.05, c.z, 5.2, 1, 0.8, 0.3, 0.4 * blink, time * 0.7, 15);
    FX.decal.push(c.x, 0.06, c.z, 3.4, 1, 0.9, 0.5, 0.25 * blink, -time * 0.4, 9);
    FX.decalA.push(c.x, 0.04, c.z, 2.6, 0, 0, 0, 0.4, 0, 11);
    FX.add.push(c.x, 1.3 + Math.max(0, c.y), c.z, 4.5, 1, 0.75, 0.3, 0.2 * blink, 0, 0);
    if (Math.random() < 0.5) FX.emit({ x: c.x + rand(-0.9, 0.9), y: Math.max(0, c.y) + rand(0.2, 2.2), z: c.z + rand(-0.9, 0.9), vy: rand(0.5, 1.4), life: 0.8, size: 0.22, size1: 0.03, color: [1, 0.9, 0.5], alpha: 0.9, frame: 12, layer: 0 });
  },
};

// =====================================================================
// 16. DIRECTOR: the night clock, enemy waves, events and the bosses
// =====================================================================
const Director = {
  acc: 0, ringT: 0, lastHour: -1, bossNext: 0, bossesDown: 0, graceT: 0,
  reset() { this.acc = 0; this.ringT = 0; this.lastHour = -1; this.bossNext = 0; this.bossesDown = 0; this.lastMood = -1; this.graceT = 0; },
  duration() { return CONFIG.night.hours * CONFIG.night.secondsPerHour; },
  wave(h) { const H = CONFIG.waves.hours; return H[clamp(h, 0, H.length - 1)]; },
  // random type by weight; types that already have their maximum alive (waves.limits) are skipped
  pickType(mix) {
    const lim = CONFIG.waves.limits;
    let sum = 0; for (const k in mix) if (!lim[k] || Enemies.count(k) < lim[k]) sum += mix[k];
    let r = Math.random() * sum;
    for (const k in mix) { if (lim[k] && Enemies.count(k) >= lim[k]) continue; r -= mix[k]; if (r <= 0) return k; }
    return 'skeleton';
  },
  eliteChance() { return CONFIG.waves.eliteChanceMax * clamp((G.time / this.duration() - 0.25) / 0.75, 0, 1); },
  spawnAt(key, angle, opts = {}) {
    if (Math.random() < this.eliteChance() && !CONFIG.enemies[key].boss) opts.elite = true;
    if (key === 'scarecrow' && !opts.at) opts.at = this.scarecrowSpot(); // scarecrows stand in the courtyard like decorations
    return Enemies.spawn(key, angle, opts);
  },
  scarecrowSpot() {
    const probe = this._probe || (this._probe = { x: 0, z: 0 });
    for (let i = 0; i < 30; i++) {
      const a = rand(0, TAU), r = rand(5, 12.5), x = Math.cos(a) * r, z = Math.sin(a) * r;
      if (Math.hypot(x - Hero.x, z - Hero.z) < 6.5) continue;
      if (Obstacles.list.some(o => Math.hypot(o.x - x, o.z - z) < 2)) continue;
      if (Enemies.list.some(o => o.key === 'scarecrow' && Math.hypot(o.x - x, o.z - z) < 3)) continue;
      probe.x = x; probe.z = z; if (World.solidPush(probe, 0.8)) continue;
      return { x, z };
    }
    return { x: -Hero.x * 0.5, z: -Hero.z * 0.5 + 6 };
  },
  // avoid spawning on top of the towers and right next to Sir
  goodAngle(radius = CONFIG.arena.spawnRadius) {
    const safe = CONFIG.waves.safeDistance;
    for (let i = 0; i < 14; i++) {
      const a = rand(0, TAU); const deg = a * 180 / Math.PI;
      if (CONFIG.arena.towerAngles.some(ta => Math.abs(((deg - ta + 540) % 360) - 180) < 7)) continue;
      if (Math.hypot(Math.cos(a) * radius - Hero.x, Math.sin(a) * radius - Hero.z) < safe) continue;
      return a;
    }
    // Sir hugs the wall: use the far side of the courtyard
    return Math.atan2(-Hero.z, -Hero.x) + rand(-1, 1);
  },

  update(dt) {
    G.time += dt;
    if (G.time >= this.duration()) { Game.win(); return; }
    // bosses arrive one at a time on the schedule
    const S = CONFIG.bosses.schedule[this.bossNext];
    if (S && G.time >= S.at && !(Enemies.boss && Enemies.boss.alive)) { this.bossNext++; this.spawnBoss(S.key); }
    const SPH = CONFIG.night.secondsPerHour;
    const hourF = G.time / SPH; const h = Math.floor(hourF);
    if (h !== this.lastHour) { this.lastHour = h; this.onHour(h); }
    const mood = G.time / this.duration();
    if (Math.abs(mood - (this.lastMood ?? -1)) > 0.002) { this.lastMood = mood; World.setMood(mood, 0); }
    MUSIC.intensity = h >= 6 ? 2 : 1;
    // spawn rate
    const cur = this.wave(h), next = this.wave(h + 1);
    const f = hourF - h;
    let rate = cur.event === 'boss' || next.event === 'boss' ? cur.rate : lerp(cur.rate, next.rate, f * 0.6);
    let max = Math.round(lerp(cur.max, next.max, f * 0.5));
    if (Enemies.boss && Enemies.boss.alive) { rate *= 0.55; max = Math.round(max * 0.7); }
    rate *= CONFIG.waves.pressureMult;
    max = Math.round(max * CONFIG.waves.pressureMult);
    if (G.time < 4) rate = 0; // short breather at start
    if (this.graceT > 0) { this.graceT -= dt; rate = 0; } // ... and after a boss, while the castle changes
    this.acc += rate * dt;
    while (this.acc >= 1) {
      this.acc -= 1;
      if (Enemies.count() >= max) { this.acc = 0; break; }
      const key = this.pickType(cur.mix);
      if (Math.random() < CONFIG.waves.packChance && h >= 1 && !CONFIG.waves.limits[key]) {
        const a0 = this.goodAngle(); const n = randi(3, 3 + Math.min(3, h));
        for (let i = 0; i < n; i++) this.spawnAt(key, a0 + rand(-0.28, 0.28), { radius: CONFIG.arena.spawnRadius - rand(0, 1.2) });
        this.acc -= n * 0.5;
      } else this.spawnAt(key, this.goodAngle());
    }
    // ring spawns all around Sir
    if (h >= 2) {
      this.ringT += dt;
      if (this.ringT >= CONFIG.waves.ringEvery) { this.ringT = 0; this.ring(6 + h, cur.mix); }
    }
  },
  // a ring of enemies all around the courtyard (none right next to Sir)
  ring(n, mix, key = null, radius = 13.5) {
    const a0 = rand(0, TAU), safe = CONFIG.waves.safeDistance;
    for (let i = 0; i < n; i++) {
      const a = a0 + i / n * TAU;
      if (Math.hypot(Math.cos(a) * radius - Hero.x, Math.sin(a) * radius - Hero.z) < safe) continue;
      this.spawnAt(key || this.pickType(mix), a, { radius });
    }
  },
  onHour(h) {
    UI.setHour(h);
    if (h === 0) return;
    const w = this.wave(h);
    SFX.play('bell', { tolls: h === 2 ? 3 : 1, gap: 0 });
    if (w.event === 'midnight') { UI.banner(t('midnight'), t('midnightSub'), 'event'); this.ring(9, null, 'skeleton', 13.5); }
    else if (w.event === 'boss') {
      UI.banner(t('witching'), t('witchingSub'), 'event');
      Game.later(9, () => { if (G.state === 'playing') this.spawnAt('witch', this.goodAngle()); });
    }
    else if (w.event === 'moon') { UI.banner(t('fullMoon'), t('fullMoonSub'), 'event'); for (let i = 0; i < 2; i++) Game.later(1.2 + i * 2.5, () => { if (G.state === 'playing') this.spawnAt('werewolf', this.goodAngle()); }); }
    else if (w.event === 'final') { UI.banner(t('finalHour'), t('finalSub'), 'event'); this.ring(11, w.mix, null, 14); }
    else if (h === 1) UI.banner(clockText(G.time), t('hourZombies'), 'hour');
    else if (h === 3) UI.banner(clockText(G.time), t('hourPumpkins'), 'hour');
    else if (h === 4) UI.banner(clockText(G.time), t('hourRutabagas'), 'hour');
    else UI.banner(clockText(G.time), '', 'hour');
  },
  spawnBoss(key) {
    if (G.state !== 'playing') return null;
    const def = CONFIG.enemies[key];
    let e;
    if (key === 'count' || key === 'reaper') { // they appear inside the courtyard, away from Sir
      const a = Math.atan2(-Hero.z, -Hero.x) + rand(-0.6, 0.6), r = 7.5;
      const x = clamp(Hero.x + Math.cos(a) * r, -11, 11), z = clamp(Hero.z + Math.sin(a) * r, -11, 11);
      e = Enemies.spawn(key, 0, { at: { x, z }, state: 'boss' });
    } else e = Enemies.spawn(key, -Math.PI / 2, { radius: 20.5, state: 'enter' }); // through the gate
    UI.banner(t(def.nameKey), t('bossArrive')[key] || '', 'boss');
    SFX.play('bossArrival', { gap: 0, vol: 0.72 });
    SFX.play(key === 'horseman' ? 'neigh' : key === 'reaper' ? 'toll' : key === 'count' ? 'hissV' : key === 'queen' ? 'hiss' : 'roar', { gap: 0 });
    addShake(0.5);
    MUSIC.setBoss(true);
    UI.bossShow(true, t(def.nameKey)); UI.bossHp(1);
    return e;
  },
  bossDefeated(e) {
    this.bossesDown++; MUSIC.setBoss(false);
    UI.bossShow(false);
    if (G.state !== 'playing') return;
    UI.banner(t('bossDown', { n: t(e.def.nameKey) }), '', 'blast');
    flashScreen(0.7); addShake(0.9); slowmo(1.2, 0.3);
    SFX.play('blast', { gap: 0 });
    for (let i = 0; i < 3; i++) { const a = i / 3 * TAU; Pickups.spawnRutabaga(e.x * 0.7 + Math.cos(a) * 2.2, e.z * 0.7 + Math.sin(a) * 2.2, { extra: true }); }
    Pickups.dropCandy('apple', e.x, e.z, 2);
    for (let i = 0; i < CONFIG.powerups.bossDrops; i++) { const a = rand(0, TAU); PowerUps.drop(e.x * 0.8 + Math.cos(a) * 1.8, e.z * 0.8 + Math.sin(a) * 1.8); }
    // the courtyard is swept clean and the castle changes its look
    Combat.sweep(e.x, e.z); Hazards.purge();
    this.graceT = CONFIG.bossGrace;
    const next = Math.min(this.bossesDown, CONFIG.themes.length - 1);
    Game.later(1.7, () => {
      if (G.state !== 'playing' && G.state !== 'levelup') return;
      World.setTheme(next);
      UI.banner(t('castleChange'), t('themes')[CONFIG.themes[next].key], 'event');
      SFX.play('toll', { gap: 0 }); SFX.play('thunder', { gap: 0, vol: 0.5 }); addShake(0.35);
    });
  },
};

// =====================================================================
// 17. PROGRESSION: candy experience, level ups and upgrade effects
// =====================================================================
const Progress = {
  reset() { G.level = 1; G.xp = 0; G.xpNext = this.xpFor(1); G.upgrades = {}; G.pendingLevels = 0; this.computeStats(); },
  xpFor(level) { const X = CONFIG.xp; return Math.round(X.base + X.perLevel * level + X.square * level * level); },
  addXP(v) {
    if (G.state !== 'playing' && G.state !== 'levelup') return;
    G.xp += v;
    while (G.xp >= G.xpNext) { G.xp -= G.xpNext; G.level++; G.xpNext = this.xpFor(G.level); G.pendingLevels++; }
  },
  lv(id) { return G.upgrades[id] || 0; },
  offers() {
    const avail = CONFIG.upgrades.filter(u => this.lv(u.id) < u.max);
    const out = [];
    while (out.length < 3 && avail.length) { const i = Math.floor(Math.random() * avail.length); out.push(avail.splice(i, 1)[0]); }
    while (out.length < 3) out.push({ id: 'feast', icon: '🍭', max: 99, theme: 'blue' });
    return out;
  },
  apply(id) {
    if (id === 'feast') { Combat.heal(30); G.score += 200; return; }
    G.upgrades[id] = this.lv(id) + 1;
    const oldMax = G.maxHp;
    this.computeStats();
    if (id === 'armor') { G.hp = Math.min(G.maxHp, G.hp + (G.maxHp - oldMax) + 30); }
  },
  computeStats() {
    const L = (id) => this.lv(id), C = CONFIG.pumpkin;
    const restLength = C.restLength + 0.2 * L('long');
    const maxLength = C.maxLength + 1.0 * L('long');
    const stiffness = C.stiffness * (1 + 0.16 * L('snappy'));
    const reachScale = (maxLength - restLength) / (C.maxLength - C.restLength);
    G.stats = {
      radius: C.radius * (1 + 0.15 * L('giant')),
      damageMult: (1 + 0.15 * L('giant')) * (1 + 0.18 * L('boot')) * (1 + 0.1 * L('spikes')),
      kickSpeedMult: (1 + 0.05 * L('boot')) * reachScale * Math.sqrt(stiffness / C.stiffness),
      restLength, maxLength, stiffness,
      yankMult: (1 + 0.08 * L('snappy')) * (1 + 0.12 * L('steady')),
      pullMult: 1 + 0.06 * L('snappy'),
      returnMult: C.returnDamageMult + 0.4 * L('boomer'),
      shockRadius: C.catchShockRadius + 0.6 * L('boomer'),
      shockDamage: C.catchShockDamage + 10 * L('boomer'),
      flame: L('flame'), spectral: L('spectral'), seeds: L('seeds'),
      wobbleMult: 1 - 0.18 * L('steady'),
      magnet: 1 + 0.4 * L('magnet'), xpMult: 1 + 0.12 * L('magnet'),
      sense: L('sense'), blastMult: 1 + 0.25 * L('sense'),
      sweet: L('sweet'),
      slowMult: 1 - 0.22 * L('spikes'),
      knockMult: 1 + 0.08 * L('giant'),
    };
    G.maxHp = CONFIG.hero.maxHp + 20 * L('armor');
    G.hp = Math.min(G.hp, G.maxHp);
  },
};

// =====================================================================
// 18. UI: HUD, menus, banners and the touch / off-screen overlay
// =====================================================================
const UI = {
  el: {}, bannerT: 0, hintKey: null, hintT: 0, hurtT: 0, lastHint: 0, offers: [],
  $(id) { return this.el[id] || (this.el[id] = document.getElementById(id)); },
  init() {
    const unlockMenuMusic = () => {
      if (G.state !== 'title') return;
      SFX.init(); MUSIC.startMenu();
      document.removeEventListener('pointerdown', unlockMenuMusic);
      document.removeEventListener('keydown', unlockMenuMusic);
    };
    document.addEventListener('pointerdown', unlockMenuMusic);
    document.addEventListener('keydown', unlockMenuMusic);
    const on = (id, fn) => { const b = this.$(id); if (b) b.addEventListener('click', (e) => { e.preventDefault(); SFX.init(); SFX.play('click'); fn(); }); };
    on('btn-play', () => Game.start());
    on('btn-howto', () => this.show('howto'));
    on('btn-credits', () => this.show('credits'));
    on('btn-credits-back', () => this.show('title'));
    on('btn-howto-back', () => this.show(G.state === 'paused' ? 'pause' : 'title'));
    on('btn-sound', () => { SFX.setEnabled(!G.sound); this.applyLang(); });
    on('btn-sound2', () => { SFX.setEnabled(!G.sound); this.applyLang(); });
    on('btn-pause', () => Game.pause());
    on('btn-resume', () => Game.resume());
    on('btn-pause-howto', () => this.show('howto'));
    on('btn-quit', () => Game.toTitle());
    on('btn-retry', () => Game.start());
    on('btn-menu', () => Game.toTitle());
    window.addEventListener('keydown', (e) => {
      if (G.state === 'levelup' && ['1', '2', '3'].includes(e.key)) this.choose(+e.key - 1);
      if (G.state === 'title' && !this.$('screen-credits').hidden && e.key === 'Escape') this.show('title');
      const titleReady = G.state === 'title' && !this.$('screen-title').hidden;
      if ((titleReady || G.state === 'over') && (e.key === 'Enter' || e.key === ' ')) Game.start();
    });
    this.overlay = this.$('overlay'); this.octx = this.overlay.getContext('2d');
    this.applyLang();
  },
  show(name) {
    for (const s of document.querySelectorAll('.screen')) s.hidden = s.id !== 'screen-' + name;
    if (name === 'title' && SFX.ctx) MUSIC.startMenu();
  },
  hideScreens() { for (const s of document.querySelectorAll('.screen')) s.hidden = true; },
  applyLang() {
    document.documentElement.lang = G.lang; this._hud = {}; this._lastScore = -1;
    for (const n of document.querySelectorAll('[data-t]')) n.textContent = t(n.dataset.t);
    const snd = t('sound') + ': ' + (G.sound ? t('on') : t('off'));
    for (const id of ['btn-sound', 'btn-sound2']) { const b = this.$(id); if (b) b.textContent = snd; }
    const best = this.$('title-best'); if (best) best.textContent = G.best.score > 0 ? t('best') + ': ' + G.best.score.toLocaleString(G.lang) + ' · ' + clockText(G.best.time) : '';
    if (G.state === 'levelup') this.renderCards();
  },
  resizeOverlay() {
    const c = this.overlay, d = Math.min(2, window.devicePixelRatio || 1);
    c.width = Math.round(window.innerWidth * d); c.height = Math.round(window.innerHeight * d); this.odpr = d;
    c.style.width = window.innerWidth + 'px'; c.style.height = window.innerHeight + 'px';
  },

  // ---------------- HUD ----------------
  hudSet(id, prop, val) {
    const c = this._hud || (this._hud = {}); const k = id + prop;
    if (c[k] === val) return; c[k] = val;
    const el = this.$(id); if (prop === 'text') el.textContent = val; else el.style[prop] = val;
  },
  updateHUD(dt) {
    const hpF = clamp(G.hp / G.maxHp, 0, 1);
    this.hudSet('hp-fill', 'transform', `scaleX(${hpF.toFixed(3)})`);
    this.hudSet('hp-text', 'text', Math.ceil(G.hp) + ' / ' + G.maxHp);
    this.hudSet('clock', 'text', clockText(G.time));
    this.hudSet('xp-fill', 'transform', `scaleX(${clamp(G.xp / G.xpNext, 0, 1).toFixed(3)})`);
    this.hudSet('level', 'text', t('level') + ' ' + G.level);
    if (G.score !== this._lastScore) { this._lastScore = G.score; this.hudSet('score', 'text', G.score.toLocaleString(G.lang)); }
    this.hudSet('kills', 'text', String(G.kills));
    // low health pulse
    this.hurtT = Math.max(0, this.hurtT - dt * 2.5);
    const low = hpF < 0.3 && G.state === 'playing' ? (0.25 + 0.15 * Math.sin(G.realTime * 6)) : 0;
    this.hudSet('vignette', 'opacity', Math.max(this.hurtT, low).toFixed(2));
    // flash
    G.flash = Math.max(0, G.flash - dt * 2.2);
    this.hudSet('flash', 'opacity', G.flash.toFixed(2));
    // banner timeout
    if (this.bannerT > 0) { this.bannerT -= dt; if (this.bannerT <= 0) this.$('banner').classList.remove('show'); }
    if (this.chainResetT > 0) { this.chainResetT -= dt; if (this.chainResetT <= 0) this.setChain(Rutabaga.meter, false, G.chain); }
    // hints
    this.lastHint += dt; if (this.lastHint > 0.4) { this.lastHint = 0; this.refreshHint(); }
    this.updatePowerups(dt);
  },
  // power-up chips (time left as a ring) and the pickup toast
  updatePowerups(dt) {
    const host = this.$('pu-chips'); if (!host) return;
    this.chips = this.chips || {};
    const show = G.state === 'playing' || G.state === 'levelup' || G.state === 'paused';
    for (const [key, def] of Object.entries(CONFIG.powerups.types)) {
      if (!def.time) continue;
      let c = this.chips[key];
      if (!c) { c = document.createElement('div'); c.className = 'pu-chip'; c.hidden = true; c.innerHTML = `<svg viewBox="0 0 64 64" aria-hidden="true"><use href="#pu-${key}"></use></svg>`; host.appendChild(c); this.chips[key] = c; }
      const left = PowerUps.left(key), on = show && left > 0;
      if (c.hidden === on) c.hidden = !on;
      if (on) { const p = (left / def.time).toFixed(2); if (c._p !== p) { c._p = p; c.style.setProperty('--p', p); } c.classList.toggle('ending', left < 2); }
    }
    if (this.toastT > 0) { this.toastT -= dt; if (this.toastT <= 0) this.$('pu-toast').classList.remove('show'); }
  },
  powerToast(key) {
    const el = this.$('pu-toast'); if (!el) return;
    const [name, desc] = (TEXTS[G.lang].pu || TEXTS.en.pu)[key];
    el.querySelector('use').setAttribute('href', '#pu-' + key);
    el.querySelector('b').textContent = name; el.querySelector('span').textContent = desc;
    el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
    this.toastT = 2.8;
  },
  hurt() { this.hurtT = 0.85; },
  // the rutabaga meter: n slots lit, the last `hot` of them from the current kick (all three hot = Rutabagamageddon)
  setChain(n, pulse, hot = 0) {
    if (!pulse) this.chainResetT = 0;
    const slots = this.$('chain').querySelectorAll('.slot');
    slots.forEach((s, i) => { s.classList.toggle('on', i < n); s.classList.toggle('hot', i < n && i >= n - hot); });
    if (pulse && n > 0) { const s = slots[n - 1]; if (s) { s.classList.remove('pop'); void s.offsetWidth; s.classList.add('pop'); } }
  },
  setHour(h) { const c = this.$('clock-pill'); if (c) { c.classList.remove('tick'); void c.offsetWidth; c.classList.add('tick'); } },
  mouseSteer() { return Input.usingMouse && CONFIG.gesture.mouseSteer; },
  touchControls() { return !Input.usingMouse && (G.mobile || Input.pointerType === 'touch'); },
  refreshHint() {
    const T = G.tutorial; let key = null;
    if (!T.done && G.state === 'playing') {
      const touch = this.touchControls();
      if (!T.kicked) key = touch ? (Input.mode === 'aim' && Input.aimLen > 0.5 ? 'hintRelease' : 'hintStartTouch') : (Input.mode === 'mouseAim' ? 'hintReleaseMouse' : 'hintStart');
      else if (!T.yanked) key = Pumpkin.free ? (this.mouseSteer() ? 'hintSteerMouse' : 'hintYank') : null;
      else if (!T.pulled) key = Pumpkin.free ? (this.mouseSteer() ? 'hintPullMouse' : 'hintPull') : null;
      else if (!T.moved) key = touch ? 'hintMoveTouch' : 'hintMove';
      else if (!T.comboShown) {
        key = 'hintCombo';
        if (!T.comboStart) T.comboStart = G.realTime;
        if (G.realTime - T.comboStart > 7) { T.comboShown = true; T.done = true; store.set('tutorialDone', true); key = null; }
      }
    }
    if (key !== this.hintKey) {
      this.hintKey = key; const h = this.$('hint');
      if (key) { h.textContent = t(key); h.classList.add('show'); } else h.classList.remove('show');
    }
  },
  banner(title, sub, kind = 'event') {
    const b = this.$('banner');
    b.className = 'kind-' + kind;
    this.$('banner-title').textContent = title; this.$('banner-sub').textContent = sub || '';
    void b.offsetWidth; b.classList.add('show');
    this.bannerT = kind === 'hour' ? 1.8 : 2.6;
  },
  bossShow(on, name) { const b = this.$('bossbar'); b.hidden = !on; if (name) this.$('boss-name').textContent = name; },
  bossHp(f) { this.$('boss-fill').style.transform = `scaleX(${clamp(f, 0, 1).toFixed(3)})`; },

  // ---------------- level up ----------------
  openLevelUp() {
    this.levelOpenT = performance.now();
    this.offers = Progress.offers();
    this.renderCards();
    this.show('levelup');
    SFX.play('levelup');
  },
  renderCards() {
    const host = this.$('cards'); host.innerHTML = '';
    const tilts = [-2.2, 1.6, -1.2];
    this.offers.forEach((u, i) => {
      const lv = Progress.lv(u.id); const [name, desc] = (TEXTS[G.lang].up[u.id] || TEXTS.en.up[u.id]);
      const b = document.createElement('button'); b.type = 'button';
      b.className = 'card t-' + (u.theme || 'orange');
      b.style.setProperty('--tilt', tilts[i % tilts.length] + 'deg'); b.style.setProperty('--i', i);
      const pips = u.id === 'feast' ? '' : '<span class="pips">' + Array.from({ length: u.max }, (_, k) => `<i class="${k < lv ? 'got' : k === lv ? 'next' : ''}"></i>`).join('') + '</span>';
      const art = document.getElementById('up-' + u.id)
        ? `<svg class="card-art" viewBox="0 0 64 64" aria-hidden="true"><use href="#up-${u.id}"></use></svg>`
        : `<span class="card-emoji" aria-hidden="true">${u.icon}</span>`;
      const isNew = lv === 0 && u.id !== 'feast';
      b.innerHTML = `<span class="card-key">${i + 1}</span>${isNew ? `<span class="card-new">${t('newUpgrade')}!</span>` : ''}`
        + `<span class="card-badge"><span class="card-rays"></span>${art}</span>`
        + `<span class="card-text"><span class="card-name">${name}</span>${pips}<span class="card-desc">${desc}</span></span>`;
      b.addEventListener('click', (e) => { e.preventDefault(); this.choose(i); });
      host.appendChild(b);
    });
  },
  choose(i) {
    const u = this.offers[i]; if (!u || G.state !== 'levelup') return;
    if (performance.now() - (this.levelOpenT || 0) < 350) return;
    SFX.play('select');
    Progress.apply(u.id);
    G.pendingLevels = Math.max(0, G.pendingLevels - 1);
    if (G.pendingLevels > 0) this.openLevelUp(); else Game.resume(0.6);
  },

  // ---------------- end screens ----------------
  showOver(victory) {
    const best = G.best; const isBest = G.score > best.score;
    if (isBest) { G.best = { score: G.score, time: G.time }; store.set('best', G.best); }
    this.$('over-title').textContent = victory ? t('victory') : t('gameOver');
    this.$('over-sub').textContent = victory ? t('victorySub') : t('lastedUntil', { t: clockText(G.time) });
    const rows = [[t('statTime'), clockText(G.time)], [t('statKills'), G.kills], [t('statJams'), G.jams || 0], [t('statBlasts'), G.blasts], [t('statScore'), G.score.toLocaleString(G.lang)]];
    this.$('over-stats').innerHTML = rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
    this.$('over-bestline').textContent = t('statBest') + ': ' + G.best.score.toLocaleString(G.lang) + ' · ' + clockText(G.best.time);
    this.$('over-best').hidden = !isBest;
    this.$('screen-over').classList.toggle('win', victory);
    this.show('over');
  },

  // ---------------- 2D overlay ----------------
  drawOverlay() {
    const c = this.octx, d = this.odpr || 1, W = World.width, H = World.height;
    c.setTransform(d, 0, 0, d, 0, 0); c.clearRect(0, 0, W, H);
    if (G.state !== 'playing' && G.state !== 'levelup' && G.state !== 'paused') return;
    // off-screen enemy arrows
    const top = 74, m = 16;
    let drawn = 0;
    for (const e of Enemies.list) {
      if (!e.alive || drawn > 30) continue;
      _v1.set(e.x, 0.8, e.z); World.project(_v1, _v2);
      const sx = (_v2.x * 0.5 + 0.5) * W, sy = (-_v2.y * 0.5 + 0.5) * H;
      if (sx > m && sx < W - m && sy > top && sy < H - m) continue;
      const cx = W / 2, cy = H / 2; let dx = sx - cx, dy = sy - cy;
      const kx = dx !== 0 ? ((dx > 0 ? W - m : m) - cx) / dx : Infinity, ky = dy !== 0 ? ((dy > 0 ? H - m : top) - cy) / dy : Infinity;
      const k = Math.min(kx, ky); const px = cx + dx * k, py = cy + dy * k; const ang = Math.atan2(dy, dx);
      c.save(); c.translate(px, py); c.rotate(ang);
      c.fillStyle = e.def.boss ? 'rgba(200,120,255,0.95)' : e.elite ? 'rgba(220,150,255,0.9)' : 'rgba(255,90,70,0.85)';
      const s = e.def.boss ? 14 : 8;
      c.beginPath(); c.moveTo(s, 0); c.lineTo(-s * 0.7, s * 0.75); c.lineTo(-s * 0.7, -s * 0.75); c.closePath(); c.fill();
      c.restore(); drawn++;
    }
    // touch walking stick (a faint one shows where to put the thumb)
    // (the stick itself is drawn by the DOM #touch-ui, so nothing is painted here)
    const I = Input;
    // kick charge gauge above Sir
    if (Hero.aiming && (I.mode === 'aim' || I.mode === 'mouseAim') && G.state === 'playing') {
      _v1.set(Hero.x, 3.6, Hero.z); World.project(_v1, _v2);
      const sx = (_v2.x * 0.5 + 0.5) * W, sy = (-_v2.y * 0.5 + 0.5) * H - 10, ch = I.charge, R = 18, full = ch >= 1;
      c.lineCap = 'round'; c.lineWidth = 7; c.strokeStyle = 'rgba(20,10,30,0.6)';
      c.beginPath(); c.arc(sx, sy, R, 0, TAU); c.stroke();
      c.lineWidth = 5;
      if (Pumpkin.kickCD > 0) { // still cooling down after the catch: a grey ring fills up first
        c.strokeStyle = 'rgba(200,190,215,0.75)';
        c.beginPath(); c.arc(sx, sy, R * 0.62, -Math.PI / 2, -Math.PI / 2 + TAU * Math.max(0.03, 1 - Pumpkin.kickCD / CONFIG.pumpkin.kickCooldown)); c.stroke();
      } else {
        c.strokeStyle = full ? `rgb(255,${Math.round(235 + 20 * Math.sin(G.realTime * 22))},190)` : `rgb(255,${Math.round(215 - 140 * ch)},${Math.round(70 - 50 * ch)})`;
        c.beginPath(); c.arc(sx, sy, R, -Math.PI / 2, -Math.PI / 2 + TAU * Math.max(0.03, ch)); c.stroke();
      }
      if (full) { c.lineWidth = 2; c.strokeStyle = 'rgba(255,230,170,0.85)'; c.beginPath(); c.arc(sx, sy, R + 7 + 2 * Math.sin(G.realTime * 18), 0, TAU); c.stroke(); }
      c.lineCap = 'butt';
    }
    // touch feedback
    if (I.active && I.mode === 'steer') {
      const recent = performance.now() / 1000 - I.lastActionT < 0.22;
      const col = recent ? (I.lastAction === 'pull' ? 'rgba(255,110,60,0.95)' : 'rgba(255,215,90,0.95)') : 'rgba(255,240,220,0.55)';
      c.strokeStyle = col; c.lineWidth = 3; c.beginPath(); c.arc(I.sOrigin.x, I.sOrigin.y, 22, 0, TAU); c.stroke();
      c.beginPath(); c.moveTo(I.sOrigin.x, I.sOrigin.y); c.lineTo(I.sCur.x, I.sCur.y); c.stroke();
      c.fillStyle = col; c.beginPath(); c.arc(I.sCur.x, I.sCur.y, 7, 0, TAU); c.fill();
    } else if (I.active && I.mode === 'aim') {
      c.strokeStyle = 'rgba(255,200,120,0.5)'; c.lineWidth = 2; c.setLineDash([6, 6]);
      c.beginPath(); c.moveTo(I.sStart.x, I.sStart.y); c.lineTo(I.sCur.x, I.sCur.y); c.stroke(); c.setLineDash([]);
      c.beginPath(); c.arc(I.sStart.x, I.sStart.y, 16, 0, TAU); c.stroke();
    }
  },
};

// =====================================================================
// 19. GAME STATE + MAIN LOOP
// =====================================================================
const Game = {
  last: 0, stateT: 0, perf: { acc: 0, frames: 0, slow: 0, fast: 0 }, timers: [],
  ambienceT: 0, ambienceRavenCooldown: 0,
  ambienceCues: [
    { key: 'ambienceWind', weight: 5, vol: 0.16, minRate: 0.96, maxRate: 1.04 },
    { key: 'ambienceWhisper', weight: 1, vol: 0.10, minRate: 0.97, maxRate: 1.03 },
    { key: 'ambienceClock', weight: 1, vol: 0.09, minRate: 0.98, maxRate: 1.02 },
    { key: 'ambienceLaugh', weight: 1, vol: 0.09, minRate: 0.97, maxRate: 1.03 },
    { key: 'ambienceRumble', weight: 1, vol: 0.10, minRate: 0.96, maxRate: 1.02 },
    { key: 'ambienceFootsteps', weight: 1, vol: 0.10, minRate: 0.96, maxRate: 1.04 },
    { key: 'ambienceBell', weight: 1, vol: 0.09, minRate: 0.97, maxRate: 1.03 },
    { key: 'ambienceWitchlight', weight: 1, vol: 0.10, minRate: 0.96, maxRate: 1.04 },
  ],
  // run fn after `delay` seconds of game time (cleared when a new run starts)
  later(delay, fn) { this.timers.push({ t: delay, fn }); },
  tickTimers(dt) {
    for (let i = this.timers.length - 1; i >= 0; i--) {
      const tm = this.timers[i]; tm.t -= dt;
      if (tm.t <= 0) { this.timers.splice(i, 1); tm.fn(); }
    }
  },
  updateAmbienceAudio(dt) {
    if (G.state !== 'playing' || !G.sound || !SFX.ctx || SFX.ctx.state !== 'running') return;
    this.ambienceT -= dt;
    this.ambienceRavenCooldown = Math.max(0, this.ambienceRavenCooldown - dt);
    if (this.ambienceT > 0) return;
    const readyCues = [];
    let totalWeight = 0;
    for (const cue of this.ambienceCues) {
      if (!SFX.buffers[cue.key]) continue;
      readyCues.push(cue);
      totalWeight += cue.weight;
    }
    const ravenReady = !!SFX.buffers.ambienceRaven;
    if (!ravenReady && totalWeight === 0) { this.ambienceT = 2; return; }
    const useRaven = ravenReady && this.ambienceRavenCooldown <= 0 && Math.random() < 0.35;
    if (useRaven) {
      SFX.play('ambienceRaven', { vol: 0.13, rate: rand(0.94, 1.06), gap: 12 });
      this.ambienceRavenCooldown = rand(68, 98);
    } else if (totalWeight > 0) {
      let roll = Math.random() * totalWeight;
      let cue = readyCues[readyCues.length - 1];
      for (const option of readyCues) {
        roll -= option.weight;
        if (roll <= 0) { cue = option; break; }
      }
      SFX.play(cue.key, { vol: cue.vol, rate: rand(cue.minRate, cue.maxRate), gap: 12 });
    }
    this.ambienceT = rand(24, 41);
  },
  async boot() {
    UI.init();
    UI.show('loading');
    const canvas = document.getElementById('game');
    try { World.init(canvas); }
    catch (e) { console.error(e); document.getElementById('loading-text').textContent = 'WebGL2 is not available on this device.'; return; }
    UI.resizeOverlay();
    Input.init(canvas);
    const bar = document.getElementById('loading-fill');
    try { await unpackEmbedded(); } catch (e) { console.error('Unpacking the embedded models failed', e); }
    await loadAssets((p) => { bar.style.transform = `scaleX(${p.toFixed(3)})`; });
    if (Assets.failed.length) console.warn('Missing assets:', Assets.failed.join(', '));
    Progress.reset();
    World.build();
    Hero.init(World.scene);
    Pumpkin.init(World.scene);
    Enemies.init(World.scene);
    Pickups.init(World.scene);
    Obstacles.init(World.scene);
    Hazards.init(World.scene);
    PowerUps.init(World.scene);
    Rutabaga.init(World.scene);
    World.setMood(0, 0);
    await World.warmup();
    const onResize = () => { World.resize(); UI.resizeOverlay(); };
    window.addEventListener('resize', onResize);
    // phones report the new size a moment after rotating: re-fit a few times
    const onRotate = () => { onResize(); setTimeout(onResize, 150); setTimeout(onResize, 450); };
    window.addEventListener('orientationchange', onRotate);
    if (screen.orientation && screen.orientation.addEventListener) screen.orientation.addEventListener('change', onRotate);
    if (window.visualViewport) window.visualViewport.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', () => { if (document.hidden && G.state === 'playing') this.pause(); });
    G.state = 'title'; UI.show('title'); UI.applyLang();
    document.body.classList.add('ready');
    // first frame
    this.last = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  },

  start() {
    SFX.init();
    this.timers.length = 0;
    this.ambienceT = rand(18, 30);
    this.ambienceRavenCooldown = rand(42, 70);
    Enemies.clear(); Pickups.reset(); Combat.reset(); Director.reset(); Obstacles.reset(); Hazards.reset(); PowerUps.reset(); Rutabaga.reset(); FX.clearParticles(); FX.clearTexts();
    G.time = 0; G.score = 0; G.kills = 0; G.blasts = 0; G.jams = 0; G.chain = 0; G.kickKills = 0; G.kicks = 0; G.powerups = 0;
    G.hp = CONFIG.hero.maxHp; G.invuln = 0; G.lastHurt = -99; G.slowmo = 0; G.hitstop = 0; G.shake = 0; G.flash = 0;
    const done = G.tutorial.done; G.tutorial = { kicked: false, yanked: false, pulled: false, moved: false, comboShown: false, done };
    Progress.reset(); G.hp = G.maxHp;
    Hero.reset(); Pumpkin.reset(); Input.resetAll();
    World.setTheme(0, true); World.setMood(0, 0);
    UI.setChain(0); UI.bossShow(false); UI.hideScreens(); document.getElementById('hud').hidden = false;
    G.state = 'playing'; this.stateT = 0;
    MUSIC.setBoss(false); MUSIC.start(1);
    UI.banner(clockText(0), t('subtitle'), 'hour');
  },
  pause() {
    if (G.state !== 'playing') return;
    G.state = 'paused'; Input.resetAll(); UI.show('pause'); MUSIC.stop();
  },
  resume(invuln = 0) {
    if (G.state !== 'paused' && G.state !== 'levelup') return;
    G.state = 'playing'; UI.hideScreens(); G.invuln = Math.max(G.invuln, invuln); Input.resetAll();
    // the clicked menu button is hidden now: hand the keyboard back to the game
    if (document.activeElement && document.activeElement !== document.body && document.activeElement.blur) document.activeElement.blur();
    try { window.focus(); } catch (_) {}
    MUSIC.start(MUSIC.intensity || 1);
  },
  die() {
    if (G.state !== 'playing') return;
    G.state = 'dying'; this.stateT = 0; Hero.deadT = 0; Input.reset();
    slowmo(1.6, 0.4); MUSIC.stop(); SFX.play('gameover', { gap: 0 }); addShake(0.6);
    Pumpkin.free = false;
  },
  win() {
    if (G.state !== 'playing') return;
    G.state = 'dawn'; this.stateT = 0; Hero.victoryT = 0; Input.reset(); MUSIC.stop();
    if (Pumpkin.free) { Pumpkin.free = false; Pumpkin.power = false; Pumpkin.returning = false; Pumpkin.vx = Pumpkin.vz = 0; }
    SFX.play('victory', { gap: 0 });
    UI.banner(t('victory'), '06:00', 'blast');
    for (const e of Enemies.list) e.dawnT = Math.hypot(e.x - Hero.x, e.z - Hero.z) / 9 + rand(0.2, 0.8);
    for (const o of Obstacles.list) Game.later(rand(0.4, 2.2), () => Obstacles.destroy(o, 0, 0));
    Hazards.purge(); PowerUps.items.length = 0; Rutabaga.rain.length = 0; Rutabaga.meteor = null;
    G.score += 1000;
  },
  toTitle() {
    this.timers.length = 0;
    Enemies.clear(); Pickups.reset(); Combat.reset(); Obstacles.reset(); Hazards.reset(); PowerUps.reset(); Rutabaga.reset(); FX.clearParticles(); FX.clearTexts();
    Hero.reset(); Pumpkin.reset(); Input.resetAll(); MUSIC.stop(); MUSIC.setBoss(false);
    World.setTheme(0, true); World.setMood(0, 0);
    document.getElementById('hud').hidden = true; UI.bossShow(false);
    G.state = 'title'; UI.show('title'); UI.applyLang();
  },

  loop(now) {
    requestAnimationFrame((t) => this.loop(t));
    const raw = Math.min(0.05, Math.max(0, (now - this.last) / 1000)); this.last = now;
    if (window.SRAL && window.SRAL.manual) return;
    this.frame(raw);
  },
  frame(raw, draw = true) {
    G.realTime += raw;
    let scale = 1;
    if (G.hitstop > 0) { G.hitstop -= raw; scale = 0; }
    else if (G.slowmo > 0) { G.slowmo -= raw; scale = G.slowmoScale || 0.35; }
    const dt = raw * scale;
    const st = G.state;
    if (st === 'playing') this.update(dt, raw);
    else if (st === 'dying' || st === 'dawn') this.updateEnding(dt, raw);
    else if (st === 'title' || st === 'over') this.updateAmbient(raw);
    // camera: follows Sir a little, plus shake
    G.shake = Math.max(0, G.shake - raw * 1.9);
    const cam = World.camera, off = World.camOffset;
    if (off) {
      World.followCamera(raw);
      const tg = World.camTarget, s = G.shake * G.shake * 0.55, tt = G.realTime * 40;
      cam.position.set(tg.x + off.x + Math.sin(tt * 1.1) * s, tg.y + off.y + Math.sin(tt * 1.7 + 1) * s * 0.6, tg.z + off.z + Math.cos(tt * 1.3) * s);
      if (st === 'title') cam.position.x += Math.sin(G.realTime * 0.25) * 0.8;
    }
    if (draw) World.render();
    if (st !== 'loading') { UI.updateHUD(raw); if (draw) UI.drawOverlay(); }
    if (draw) this.adapt(raw);
  },
  update(dt, raw) {
    this.stateT += dt;
    this.updateAmbienceAudio(dt);
    Director.update(dt);
    if (G.state !== 'playing') return;
    FX.begin();
    this.tickTimers(dt);
    Input.update(dt);
    Hero.update(dt);
    Pumpkin.update(dt);
    Enemies.update(dt);
    Pickups.update(dt);
    Combat.update(dt);
    Obstacles.update(dt);
    Hazards.update(dt);
    PowerUps.update(dt);
    Rutabaga.update(dt);
    World.update(dt, G.realTime);
    FX.update(dt);
    Enemies.render(); Pickups.render(); Obstacles.render(); Hazards.render(); PowerUps.render(); Rutabaga.render();
    G.invuln = Math.max(0, G.invuln - dt);
    if (G.time - (G.lastHurt ?? -99) > CONFIG.hero.regenDelay && G.hp < G.maxHp) G.hp = Math.min(G.maxHp, G.hp + CONFIG.hero.regen * dt);
    if (G.pendingLevels > 0 && G.state === 'playing' && G.hitstop <= 0) { G.state = 'levelup'; Input.resetAll(); UI.openLevelUp(); }
  },
  updateEnding(dt, raw) {
    this.stateT += raw;
    FX.begin();
    this.tickTimers(dt);
    Hero.update(dt);
    Pumpkin.update(dt);
    if (G.state === 'dawn') {
      const k = clamp(this.stateT / 3.0, 0, 1);
      World.setMood(1, smooth(k));
      for (const e of Enemies.list) {
        if (!e.alive) continue;
        if (e.dawnT === undefined) e.dawnT = rand(0.3, 0.9);
        e.dawnT -= raw;
        if (Math.random() < raw * 6) FX.smoke(e.x, 0.8, e.z, 1, { color: [0.9, 0.7, 0.5], size: 0.6, alpha: 0.4 });
        if (e.dawnT <= 0) { e.y = Math.max(e.y, 0); e.hp = 0; Enemies.kill(e, rand(-1, 1), rand(-1, 1), 3, 'dawn'); }
      }
    }
    Enemies.update(dt);
    Pickups.update(dt);
    Obstacles.update(dt);
    Hazards.update(dt);
    PowerUps.update(dt);
    Rutabaga.update(dt);
    World.update(dt, G.realTime);
    FX.update(dt);
    Enemies.render(); Pickups.render(); Obstacles.render(); Hazards.render(); PowerUps.render(); Rutabaga.render();
    if (this.stateT > (G.state === 'dawn' ? 3.6 : 2.4)) { const win = G.state === 'dawn'; G.state = 'over'; UI.showOver(win); document.getElementById('hud').hidden = true; }
  },
  updateAmbient(raw) {
    FX.begin();
    Hero.update(raw);
    Pumpkin.update(raw);
    World.update(raw, G.realTime);
    FX.update(raw);
    Enemies.render(); Pickups.render(); Obstacles.render(); Hazards.render(); PowerUps.render(); Rutabaga.render();
  },
  // dynamic resolution: keep the frame rate smooth on slower phones
  adapt(raw) {
    if (G.state !== 'playing') return;
    const p = this.perf; p.acc += raw; p.frames++;
    if (p.acc < 2) return;
    const avg = p.acc / p.frames; p.acc = 0; p.frames = 0;
    const cur = World.dprScale || 1;
    if (avg > 0.038 && cur > 0.55) { World.dprScale = Math.max(0.55, cur - 0.15); World.resize(); }
    else if (avg < 0.0135 && cur < 1) { World.dprScale = Math.min(1, cur + 0.1); World.resize(); }
  },
};

// Debug / testing hooks (also handy in Rosebud's console)
window.SRAL = { G, CONFIG, Game, World, Hero, Pumpkin, Enemies, Pickups, Combat, Director, Progress, Input, UI, FX, SFX, Obstacles, Hazards, PowerUps, Bosses, Rutabaga,
  manual: false,
  step(dt = 1 / 60, n = 1, drawAll = false) { for (let i = 0; i < n; i++) Game.frame(dt, drawAll || i === n - 1); },
  tick(dt = 1 / 60) { Game.frame(dt, false); },
};

Game.boot();