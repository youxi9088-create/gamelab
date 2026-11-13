const W = 1920;
const H = 1080;
const GROUND = 950;
const PLAYER_BASE_X = 140;
const ENEMY_BASE_X = W - 140;
const BASE_HP = 1500;

const container = document.getElementById('game-container');
const canvas = document.createElement('canvas');
canvas.width = W;
canvas.height = H;
container.appendChild(canvas);
const ctx = canvas.getContext('2d');

function resize() {
    const s = Math.min(innerWidth / W, innerHeight / H);
    canvas.style.width = `${W * s}px`;
    canvas.style.height = `${H * s}px`;
    canvas.style.margin = `${(innerHeight - H * s) / 2}px auto 0`;
}
addEventListener('resize', resize);
resize();

function loadImage(src) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;
    return img;
}

const images = {
    bg: loadImage('assets/battlefield.webp'),
    base: loadImage('assets/fortress.webp'),
};

const ERAS = [
    { name: 'Stone Age', sprite: loadImage('assets/caveman.webp'), color: '#a0703c', xpNext: 250, special: 'Meteor Shower', attack: 'meteor' },
    { name: 'Bronze Age', sprite: loadImage('assets/bronze-warrior.webp'), color: '#d08a3c', xpNext: 600, special: 'Flaming Boulders', attack: 'meteor' },
    { name: 'Medieval', sprite: loadImage('assets/knight.webp'), color: '#8899aa', xpNext: 1100, special: 'Arrow Rain', attack: 'arrows' },
    { name: 'Renaissance', sprite: loadImage('assets/renaissance-musketeer.webp'), color: '#d7b36b', xpNext: 1800, special: 'Volley Fire', attack: 'arrows' },
    { name: 'Industrial', sprite: loadImage('assets/industrial-infantry.webp'), color: '#738553', xpNext: 2700, special: 'Bomber Run', attack: 'airstrike' },
    { name: 'Modern', sprite: loadImage('assets/soldier.webp'), color: '#5a7a3a', xpNext: 3900, special: 'Airstrike', attack: 'airstrike' },
    { name: 'Cyber Age', sprite: loadImage('assets/cyber-soldier.webp'), color: '#4ad7de', xpNext: 5400, special: 'Orbital Sweep', attack: 'orbital' },
    { name: 'Future', sprite: loadImage('assets/cyborg.webp'), color: '#33bbff', xpNext: Infinity, special: 'Orbital Laser', attack: 'orbital' },
];

const UNIT_TYPES = [
    { key: '1', label: 'Melee', cost: 15, hp: 60, dmg: 12, range: 40, speed: 70, scale: 1, cooldown: 0.8 },
    { key: '2', label: 'Ranged', cost: 25, hp: 40, dmg: 9, range: 260, speed: 60, scale: 0.9, cooldown: 1.0 },
    { key: '3', label: 'Heavy', cost: 60, hp: 180, dmg: 28, range: 50, speed: 45, scale: 1.35, cooldown: 1.3 },
];

const DEFENSE_WEAPONS = [
    { name: 'Rock Sling', color: '#efb45e', mountColor: '#75472c', barrelColor: '#b8874a', range: 640, dmg: 34, cooldown: 2.4, speed: 760, splash: 44 },
    { name: 'Bronze Ballista', color: '#e6b65f', mountColor: '#725337', barrelColor: '#c49a55', range: 670, dmg: 43, cooldown: 2.25, speed: 840, splash: 42 },
    { name: 'Castle Ballista', color: '#d9e4ed', mountColor: '#67707a', barrelColor: '#c4a36e', range: 710, dmg: 62, cooldown: 2.0, speed: 1000, splash: 38 },
    { name: 'Renaissance Cannon', color: '#eacb86', mountColor: '#625341', barrelColor: '#c99c58', range: 745, dmg: 78, cooldown: 1.85, speed: 1080, splash: 48 },
    { name: 'Steam Cannon', color: '#c9a76c', mountColor: '#51443a', barrelColor: '#aa8150', range: 780, dmg: 94, cooldown: 1.7, speed: 1120, splash: 54 },
    { name: 'Fortress Cannon', color: '#ff9a4a', mountColor: '#43513f', barrelColor: '#68766c', range: 815, dmg: 115, cooldown: 1.55, speed: 1200, splash: 58 },
    { name: 'Cyber Sentry', color: '#4ad7de', mountColor: '#193e59', barrelColor: '#29bfe0', range: 850, dmg: 145, cooldown: 1.4, speed: 1350, splash: 64 },
    { name: 'Plasma Sentry', color: '#49eaff', mountColor: '#193e59', barrelColor: '#29bfe0', range: 890, dmg: 180, cooldown: 1.25, speed: 1450, splash: 70 },
];

const TOWER_SLOT_X = [300, 420, 540, 660, 780, 900];
const TOWER_OPTIONS = [
    [
        { name: 'Flint Repeater', role: 'Rapid', cost: 75, dmg: 11, range: 360, cooldown: 0.52, speed: 1180, splash: 24, color: '#d8aa6a' },
        { name: 'Bone Ballista', role: 'Siege', cost: 120, dmg: 34, range: 550, cooldown: 1.55, speed: 1050, splash: 44, color: '#e8d2a0' },
        { name: 'Ember Pit', role: 'Blast', cost: 145, dmg: 54, range: 460, cooldown: 2.55, speed: 760, splash: 82, color: '#ff8945' },
    ],
    [
        { name: 'Bronze Repeater', role: 'Rapid', cost: 88, dmg: 13, range: 380, cooldown: 0.50, speed: 1240, splash: 25, color: '#e5ab59' },
        { name: 'War Ballista', role: 'Siege', cost: 138, dmg: 39, range: 575, cooldown: 1.5, speed: 1120, splash: 46, color: '#f0ca79' },
        { name: 'Firepot Mortar', role: 'Blast', cost: 165, dmg: 61, range: 480, cooldown: 2.5, speed: 790, splash: 86, color: '#ff7438' },
    ],
    [
        { name: 'Crossbow Nest', role: 'Rapid', cost: 102, dmg: 15, range: 400, cooldown: 0.48, speed: 1320, splash: 26, color: '#d8e4ee' },
        { name: 'Castle Ballista', role: 'Siege', cost: 158, dmg: 46, range: 600, cooldown: 1.45, speed: 1190, splash: 48, color: '#b6c8da' },
        { name: 'Trebuchet', role: 'Blast', cost: 188, dmg: 70, range: 500, cooldown: 2.45, speed: 820, splash: 92, color: '#d4b578' },
    ],
    [
        { name: 'Arquebus Battery', role: 'Rapid', cost: 116, dmg: 17, range: 420, cooldown: 0.46, speed: 1410, splash: 27, color: '#f0d294' },
        { name: 'Field Cannon', role: 'Siege', cost: 180, dmg: 53, range: 625, cooldown: 1.4, speed: 1280, splash: 51, color: '#dbb867' },
        { name: 'Bombard Mortar', role: 'Blast', cost: 215, dmg: 80, range: 520, cooldown: 2.4, speed: 850, splash: 98, color: '#e88b4d' },
    ],
    [
        { name: 'Steam Repeater', role: 'Rapid', cost: 132, dmg: 20, range: 440, cooldown: 0.44, speed: 1500, splash: 28, color: '#c9a76c' },
        { name: 'Rail Cannon', role: 'Siege', cost: 205, dmg: 62, range: 650, cooldown: 1.35, speed: 1390, splash: 54, color: '#d9b878' },
        { name: 'Shrapnel Mortar', role: 'Blast', cost: 245, dmg: 94, range: 540, cooldown: 2.35, speed: 900, splash: 104, color: '#c97c48' },
    ],
    [
        { name: 'Autocannon', role: 'Rapid', cost: 150, dmg: 23, range: 460, cooldown: 0.42, speed: 1620, splash: 29, color: '#9fb57d' },
        { name: 'AT Cannon', role: 'Siege', cost: 232, dmg: 72, range: 680, cooldown: 1.3, speed: 1510, splash: 57, color: '#ff9a4a' },
        { name: 'Rocket Battery', role: 'Blast', cost: 278, dmg: 108, range: 560, cooldown: 2.3, speed: 970, splash: 112, color: '#ff713b' },
    ],
    [
        { name: 'Pulse Turret', role: 'Rapid', cost: 170, dmg: 27, range: 480, cooldown: 0.40, speed: 1780, splash: 31, color: '#4ad7de' },
        { name: 'Rail Sentry', role: 'Siege', cost: 260, dmg: 84, range: 710, cooldown: 1.25, speed: 1680, splash: 60, color: '#5fe7ee' },
        { name: 'Arc Mortar', role: 'Blast', cost: 310, dmg: 125, range: 590, cooldown: 2.25, speed: 1080, splash: 120, color: '#62eaff' },
    ],
    [
        { name: 'Beam Array', role: 'Rapid', cost: 190, dmg: 32, range: 500, cooldown: 0.38, speed: 1950, splash: 33, color: '#8fffff' },
        { name: 'Singularity Cannon', role: 'Siege', cost: 290, dmg: 98, range: 740, cooldown: 1.2, speed: 1810, splash: 64, color: '#65f3ff' },
        { name: 'Nova Mortar', role: 'Blast', cost: 345, dmg: 145, range: 620, cooldown: 2.2, speed: 1180, splash: 128, color: '#a38cff' },
    ],
];

const UPGRADE_CARDS = [
    { id: 'supplies', title: 'Field Supplies', description: 'Troop deployment costs 8% less.', color: '#ffd24a' },
    { id: 'drills', title: 'Rapid Drills', description: 'Train queued troops 12% faster.', color: '#8fe38a' },
    { id: 'fortress', title: 'Fortress Retrofit', description: '+320 maximum fortress HP, fully repaired.', color: '#a9c9ff' },
    { id: 'towerDamage', title: 'Overcharged Towers', description: 'All your tower damage increases by 18%.', color: '#ff9a4a' },
    { id: 'towerSlots', title: 'Expanded Gunline', description: 'Unlock one more tower build slot.', color: '#f2d48d' },
    { id: 'special', title: 'Specialist Munitions', description: 'Special attack cooldown reduced by 12%.', color: '#d49bff' },
    { id: 'veterans', title: 'Veteran Training', description: 'All future troops gain 10% HP and damage.', color: '#ff8e8e' },
    { id: 'gold', title: 'Captured Stores', description: 'Immediately gain 250 gold.', color: '#ffe36a' },
];

function eraMultiplier(era) {
    return Math.pow(1.38, era);
}

// ---------- Audio ----------
const music = new Audio('assets/audio/battle-music.mp3');
music.loop = true;
music.volume = 0.4;
let muted = false;
let audioStarted = false;

function playSfx(src, vol = 0.5) {
    if (muted) {
        return;
    }
    const a = new Audio(src);
    a.volume = vol;
    a.play().catch(() => {});
}

// ---------- State ----------
let state;

function newSide(isPlayer) {
    return {
        isPlayer,
        hp: BASE_HP,
        maxHp: BASE_HP,
        gold: 175,
        xp: 0,
        era: 0,
        specialCd: 0,
        queue: [],
        queueTimer: 0,
        defenseCycle: 0,
        defenseFlash: 0,
        defenseTarget: null,
        towers: [],
        maxTowers: isPlayer ? 4 : 3,
        upgrades: {
            troopDiscount: 0,
            queueSpeed: 0,
            towerDamage: 0,
            specialCooldown: 0,
            unitPower: 0,
        },
        buildTowerKind: null,
        upgradeChoices: null,
    };
}

function resetGame() {
    state = {
        player: newSide(true),
        enemy: newSide(false),
        units: [],
        projectiles: [],
        defenseShots: [],
        defenseImpacts: [],
        particles: [],
        meteors: [],
        specialArrows: [],
        airstrikes: [],
        airstrikeBombs: [],
        orbitalLasers: [],
        texts: [],
        over: null,
        started: false,
        aiTimer: 2,
        aiTowerTimer: 18,
        time: 0,
        shake: 0,
    };
}
resetGame();

// ---------- Spawning ----------
function trySpawn(side, typeIndex) {
    const type = UNIT_TYPES[typeIndex];
    const cost = Math.round(type.cost * eraMultiplier(side.era) * (1 - side.upgrades.troopDiscount));
    if (side.gold < cost || side.queue.length >= 5) {
        return false;
    }
    side.gold -= cost;
    side.queue.push(typeIndex);
    return true;
}

function spawnUnit(side, typeIndex) {
    const type = UNIT_TYPES[typeIndex];
    const m = eraMultiplier(side.era);
    state.units.push({
        side,
        type,
        era: side.era,
        x: side.isPlayer ? PLAYER_BASE_X + 60 : ENEMY_BASE_X - 60,
        hp: type.hp * m * (1 + side.upgrades.unitPower),
        maxHp: type.hp * m * (1 + side.upgrades.unitPower),
        dmg: type.dmg * m * (1 + side.upgrades.unitPower),
        atkTimer: 0,
        bob: Math.random() * 6,
        reward: Math.round(type.cost * m * 1.4),
    });
}

function availableUpgradeCards(side) {
    return UPGRADE_CARDS.filter((card) => {
        if (card.id === 'supplies') return side.upgrades.troopDiscount < 0.32;
        if (card.id === 'drills') return side.upgrades.queueSpeed < 0.48;
        if (card.id === 'towerDamage') return side.upgrades.towerDamage < 0.72;
        if (card.id === 'towerSlots') return side.maxTowers < 6;
        if (card.id === 'special') return side.upgrades.specialCooldown < 0.36;
        if (card.id === 'veterans') return side.upgrades.unitPower < 0.4;
        return true;
    });
}

function createUpgradeChoices(side) {
    const available = availableUpgradeCards(side);
    const shuffle = (cards) => {
        const shuffled = [...cards];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };
    const towerCards = shuffle(available.filter((card) => card.id === 'towerDamage' || card.id === 'towerSlots'));
    const choices = towerCards.length ? [towerCards[0]] : [];
    const rest = shuffle(available.filter((card) => !choices.includes(card)));
    while (choices.length < 3 && rest.length) choices.push(rest.pop());
    return choices;
}

function applyUpgrade(side, card) {
    if (card.id === 'supplies') side.upgrades.troopDiscount = Math.min(0.32, side.upgrades.troopDiscount + 0.08);
    if (card.id === 'drills') side.upgrades.queueSpeed = Math.min(0.48, side.upgrades.queueSpeed + 0.12);
    if (card.id === 'fortress') {
        side.maxHp += 320;
        side.hp = Math.min(side.maxHp, side.hp + 320);
    }
    if (card.id === 'towerDamage') side.upgrades.towerDamage = Math.min(0.72, side.upgrades.towerDamage + 0.18);
    if (card.id === 'towerSlots') side.maxTowers = Math.min(6, side.maxTowers + 1);
    if (card.id === 'special') side.upgrades.specialCooldown = Math.min(0.36, side.upgrades.specialCooldown + 0.12);
    if (card.id === 'veterans') side.upgrades.unitPower = Math.min(0.4, side.upgrades.unitPower + 0.1);
    if (card.id === 'gold') side.gold += 250;
}

function chooseUpgrade(index) {
    const side = state.player;
    const card = side.upgradeChoices && side.upgradeChoices[index];
    if (!card) return;
    applyUpgrade(side, card);
    side.upgradeChoices = null;
    addText(W / 2, 285, `${card.title.toUpperCase()} SELECTED`, card.color, 34);
    evolve(side);
}

function evolve(side) {
    if (side.isPlayer && side.upgradeChoices) return;
    const era = ERAS[side.era];
    if (side.xp >= era.xpNext && side.era < ERAS.length - 1) {
        side.era += 1;
        side.maxHp += 800;
        side.hp += 800;
        addText(
            side.isPlayer ? PLAYER_BASE_X + 220 : ENEMY_BASE_X - 220,
            GROUND - 430,
            `${DEFENSE_WEAPONS[side.era].name} ONLINE`,
            DEFENSE_WEAPONS[side.era].color,
            32,
        );
        if (side.isPlayer) {
            side.upgradeChoices = createUpgradeChoices(side);
            addText(W / 2, 300, `STAGE ${side.era + 1} — ${ERAS[side.era].name}!`, '#ffd24a', 60);
        }
    }
}

function getSpecialTargetCenter(side) {
    const enemies = state.units.filter((unit) => !unit.dead && unit.side !== side);
    if (enemies.length === 0) return side.isPlayer ? 1320 : 600;

    const front = enemies.reduce((closest, unit) => {
        if (!closest) return unit;
        return side.isPlayer ? (unit.x < closest.x ? unit : closest) : (unit.x > closest.x ? unit : closest);
    }, null);
    const cluster = enemies.filter((unit) => Math.abs(unit.x - front.x) <= 280);
    return Math.max(300, Math.min(W - 300, cluster.reduce((sum, unit) => sum + unit.x, 0) / cluster.length));
}

function useSpecial(side) {
    if (side.specialCd > 0) return;

    side.specialCd = 45 * (1 - side.upgrades.specialCooldown);
    const era = side.era;
    const stage = ERAS[era];
    const multiplier = eraMultiplier(era);
    const center = getSpecialTargetCenter(side);
    const dir = side.isPlayer ? 1 : -1;
    const colors = { meteor: '#ff9a35', arrows: '#e7d6a0', airstrike: '#ff7642', orbital: '#55f5ff' };
    addText(center, GROUND - 330, stage.special.toUpperCase(), colors[stage.attack], 34);
    playSfx('assets/audio/boom.mp3', era >= 6 ? 0.42 : 0.32);

    if (stage.attack === 'meteor') {
        // Later prehistoric stages send a denser, more destructive barrage.
        const count = era === 0 ? 9 : 13;
        for (let i = 0; i < count; i++) {
            const x = Math.max(260, Math.min(W - 260, center + (i - (count - 1) / 2) * 52 + (Math.random() - 0.5) * 20));
            state.meteors.push({
                side,
                x: x - dir * 90,
                y: -100 - (i % 4) * 105,
                tx: x,
                vy: 880 + Math.random() * 180,
                dmg: (era === 0 ? 38 : 46) * multiplier,
                radius: 92,
                specialColor: era === 0 ? '#ff8a2a' : '#ffc04d',
            });
        }
    } else if (stage.attack === 'arrows') {
        // Renaissance musketeers add extra shots to the medieval arrow rain.
        const count = era === 2 ? 15 : 19;
        for (let i = 0; i < count; i++) {
            const x = Math.max(240, Math.min(W - 240, center + (i - (count - 1) / 2) * 37 + (Math.random() - 0.5) * 18));
            state.specialArrows.push({
                side,
                x,
                y: -80 - (i % 5) * 112,
                speed: 1500 + Math.random() * 180,
                delay: i * 0.035,
                dmg: (era === 2 ? 26 : 32) * multiplier,
                radius: 34,
                color: era === 2 ? '#e8d19a' : '#f2bb58',
            });
        }
    } else if (stage.attack === 'airstrike') {
        state.airstrikes.push({
            side,
            center,
            dir,
            x: center - dir * 350,
            endX: center + dir * 350,
            y: GROUND - 320,
            speed: 760,
            dropTimer: 0.08,
            bombsDropped: 0,
            maxBombs: era === 4 ? 6 : 8,
            dmg: (era === 4 ? 30 : 36) * multiplier,
            radius: 78,
        });
    } else {
        state.orbitalLasers.push({
            side,
            center,
            startX: center - dir * 330,
            endX: center + dir * 330,
            charge: 0.72,
            duration: 1.05,
            elapsed: 0,
            dmg: (era === 6 ? 140 : 175) * multiplier,
            hitUnits: new Set(),
        });
    }
}

// ---------- Helpers ----------
function addText(x, y, text, color, size = 28) {
    state.texts.push({ x, y, text, color, size, life: 1.5 });
}

function burst(x, y, color, n = 10) {
    for (let i = 0; i < n; i++) {
        state.particles.push({ x, y, vx: (Math.random() - 0.5) * 400, vy: -Math.random() * 400, life: 0.6, color });
    }
}

function damageUnit(u, dmg, attackerSide) {
    u.hp -= dmg;
    if (u.hp <= 0 && !u.dead) {
        u.dead = true;
        attackerSide.gold += u.reward;
        attackerSide.xp += u.reward * 1.2;
        burst(u.x, GROUND - 60, '#c22', 16);
        if (attackerSide.isPlayer) {
            addText(u.x, GROUND - 160, `+${u.reward}g`, '#ffd24a');
        }
        evolve(attackerSide);
    }
}

function damageBase(side, dmg) {
    side.hp -= dmg;
    state.shake = Math.max(state.shake, 6);
    if (side.hp <= 0 && !state.over) {
        side.hp = 0;
        state.over = side.isPlayer ? 'DEFEAT' : 'VICTORY';
        playSfx('assets/audio/boom.mp3', 0.8);
    }
}

// ---------- Update ----------
function updateSide(side, dt) {
    side.gold += dt * (4 + side.era * 3);
    side.specialCd = Math.max(0, side.specialCd - dt);
    if (side.queue.length > 0) {
        side.queueTimer += dt;
        if (side.queueTimer >= 1.2 * (1 - side.upgrades.queueSpeed)) {
            side.queueTimer = 0;
            spawnUnit(side, side.queue.shift());
        }
    }
}

function updateAI(dt) {
    const ai = state.enemy;
    state.aiTimer -= dt;
    if (state.aiTimer <= 0) {
        state.aiTimer = 1.5 + Math.random() * 2;
        const r = Math.random();
        trySpawn(ai, r < 0.5 ? 0 : r < 0.8 ? 1 : 2);
    }
    state.aiTowerTimer -= dt;
    if (state.aiTowerTimer <= 0) {
        state.aiTowerTimer = 28 + Math.random() * 12;
        tryBuildAITower(ai);
    }
    ai.xp += dt * 10;
    evolve(ai);
    const threat = state.units.some((u) => u.side.isPlayer && u.x > W * 0.6);
    if (threat && ai.specialCd <= 0 && state.time > 60) {
        useSpecial(ai);
    }
}

function updateUnits(dt) {
    const units = state.units;
    for (const u of units) {
        const dir = u.side.isPlayer ? 1 : -1;
        let target = null;
        let targetDist = Infinity;
        for (const o of units) {
            if (o.side !== u.side && !o.dead) {
                const d = (o.x - u.x) * dir;
                if (d > -10 && d < targetDist) {
                    targetDist = d;
                    target = o;
                }
            }
        }
        const baseX = u.side.isPlayer ? ENEMY_BASE_X - 70 : PLAYER_BASE_X + 70;
        const baseDist = (baseX - u.x) * dir;
        const ally = units.find((o) => o !== u && o.side === u.side && !o.dead && (o.x - u.x) * dir > 0 && (o.x - u.x) * dir < 55);
        u.atkTimer -= dt;
        const inRange = (target && targetDist <= u.type.range) || baseDist <= u.type.range;
        if (inRange) {
            if (u.atkTimer <= 0) {
                u.atkTimer = u.type.cooldown;
                u.lunge = 0.15;
                const hitsUnit = target && targetDist <= u.type.range;
                if (u.type.range > 100) {
                    state.projectiles.push({ side: u.side, x: u.x, y: GROUND - 80, vx: dir * 700, dmg: u.dmg, color: ERAS[u.era].color });
                } else if (hitsUnit) {
                    damageUnit(target, u.dmg, u.side);
                    playSfx('assets/audio/hit.mp3', 0.25);
                    burst(target.x, GROUND - 70, '#fff', 4);
                } else {
                    damageBase(u.side.isPlayer ? state.enemy : state.player, u.dmg);
                }
            }
        } else if (!ally || (ally && u.type.range > 100 && false)) {
            u.x += dir * u.type.speed * dt;
        }
        u.lunge = Math.max(0, (u.lunge || 0) - dt);
    }
    state.units = units.filter((u) => !u.dead);
}

function updateProjectiles(dt) {
    for (const p of state.projectiles) {
        p.x += p.vx * dt;
        const hit = state.units.find((u) => u.side !== p.side && Math.abs(u.x - p.x) < 25);
        if (hit) {
            damageUnit(hit, p.dmg, p.side);
            p.dead = true;
            continue;
        }
        const enemyBase = p.side.isPlayer ? ENEMY_BASE_X - 60 : PLAYER_BASE_X + 60;
        if ((p.vx > 0 && p.x >= enemyBase) || (p.vx < 0 && p.x <= enemyBase)) {
            damageBase(p.side.isPlayer ? state.enemy : state.player, p.dmg);
            p.dead = true;
        }
    }
    state.projectiles = state.projectiles.filter((p) => !p.dead);
}

function towerSlotsFor(side) {
    return TOWER_SLOT_X.map((x) => side.isPlayer ? x : W - x);
}

function towerSpecFor(side, kind) {
    const spec = TOWER_OPTIONS[side.era][kind];
    return {
        ...spec,
        range: spec.range + side.era * 12,
        dmg: spec.dmg * eraMultiplier(side.era) * 0.65 * (1 + side.upgrades.towerDamage),
    };
}

function towerCostFor(side, kind) {
    return Math.round(TOWER_OPTIONS[side.era][kind].cost * (1 + side.era * 0.18));
}

function addTower(side, slot, kind) {
    side.towers.push({ side, slot, kind, cooldown: 0, flash: 0, target: null });
}

function tryBuildAITower(side) {
    if (side.towers.length >= side.maxTowers) return;
    const occupied = new Set(side.towers.map((tower) => tower.slot));
    const slot = towerSlotsFor(side).findIndex((_, index) => !occupied.has(index));
    if (slot < 0) return;
    const kind = Math.floor(Math.random() * 3);
    const cost = towerCostFor(side, kind);
    if (side.gold < cost) return;
    side.gold -= cost;
    addTower(side, slot, kind);
    addText(ENEMY_BASE_X - 180, GROUND - 360, 'ENEMY TOWER BUILT', TOWER_OPTIONS[side.era][kind].color, 24);
}

function buildPlayerTowerAt(x) {
    const side = state.player;
    const kind = side.buildTowerKind;
    if (kind === null) return false;
    if (side.towers.length >= side.maxTowers) {
        addText(PLAYER_BASE_X + 330, GROUND - 230, 'NO OPEN TOWER SLOTS', '#ff9b77', 24);
        return false;
    }
    if (x <= PLAYER_BASE_X + 100 || x >= W / 2 - 25) return false;
    const slots = towerSlotsFor(side);
    const occupied = new Set(side.towers.map((tower) => tower.slot));
    let slot = -1;
    let distance = Infinity;
    for (let i = 0; i < slots.length; i++) {
        if (occupied.has(i)) continue;
        const nextDistance = Math.abs(slots[i] - x);
        if (nextDistance < distance) {
            distance = nextDistance;
            slot = i;
        }
    }
    if (slot < 0 || distance > 68) return false;
    const cost = towerCostFor(side, kind);
    if (side.gold < cost) {
        addText(x, GROUND - 210, 'NOT ENOUGH GOLD', '#ff9b77', 24);
        return false;
    }
    side.gold -= cost;
    addTower(side, slot, kind);
    addText(slots[slot], GROUND - 145, `${TOWER_OPTIONS[side.era][kind].name.toUpperCase()} ONLINE`, TOWER_OPTIONS[side.era][kind].color, 22);
    return true;
}

function fireTowerWeapon(tower, target, weapon) {
    const side = tower.side;
    const direction = side.isPlayer ? 1 : -1;
    const x = towerSlotsFor(side)[tower.slot];
    state.defenseShots.push({
        side,
        target,
        x: x + direction * 23,
        y: GROUND - 94,
        speed: weapon.speed,
        dmg: weapon.dmg,
        splash: weapon.splash,
        color: weapon.color,
    });
    tower.flash = 0.18;
    tower.cooldown = 0;
}

function fireBaseWeapon(side, target, weapon) {
    const direction = side.isPlayer ? 1 : -1;
    const baseX = side.isPlayer ? PLAYER_BASE_X : ENEMY_BASE_X;
    const origin = {
        x: baseX + direction * 38,
        y: GROUND - 258,
    };
    state.defenseShots.push({
        side,
        target,
        x: origin.x + direction * 35,
        y: origin.y,
        speed: weapon.speed,
        dmg: weapon.dmg,
        splash: weapon.splash,
        color: weapon.color,
    });
    side.defenseFlash = 0.16;
    side.defenseCycle = 0;
}

function updateDefenses(dt) {
    for (const side of [state.player, state.enemy]) {
        const weapon = DEFENSE_WEAPONS[side.era];
        side.defenseCycle = Math.min(weapon.cooldown, side.defenseCycle + dt);
        side.defenseFlash = Math.max(0, side.defenseFlash - dt);

        const candidates = state.units.filter((unit) => {
            if (unit.dead || unit.side === side) return false;
            const distance = side.isPlayer
                ? unit.x - (PLAYER_BASE_X + 60)
                : (ENEMY_BASE_X - 60) - unit.x;
            return distance >= 0 && distance <= weapon.range;
        });
        candidates.sort((a, b) => side.isPlayer ? a.x - b.x : b.x - a.x);
        const target = candidates[0] || null;
        side.defenseTarget = target;
        if (target && side.defenseCycle >= weapon.cooldown) {
            fireBaseWeapon(side, target, weapon);
        }

        const direction = side.isPlayer ? 1 : -1;
        for (const tower of side.towers) {
            const towerWeapon = towerSpecFor(side, tower.kind);
            tower.cooldown = Math.min(towerWeapon.cooldown, tower.cooldown + dt);
            tower.flash = Math.max(0, tower.flash - dt);
            const towerX = towerSlotsFor(side)[tower.slot];
            const targets = state.units.filter((unit) => {
                if (unit.dead || unit.side === side) return false;
                const distance = (unit.x - towerX) * direction;
                return distance >= 0 && distance <= towerWeapon.range;
            });
            targets.sort((a, b) => side.isPlayer ? a.x - b.x : b.x - a.x);
            tower.target = targets[0] || null;
            if (tower.target && tower.cooldown >= towerWeapon.cooldown) {
                fireTowerWeapon(tower, tower.target, towerWeapon);
            }
        }
    }
}

function impactDefenseShot(shot) {
    const x = shot.target.x;
    const y = GROUND - 78;
    const radius = shot.splash;
    state.defenseImpacts.push({ x, y, radius, color: shot.color, life: 0.52, maxLife: 0.52 });
    burst(x, y, shot.color, 12);
    state.shake = Math.max(state.shake, 2.5);
    playSfx('assets/audio/hit.mp3', 0.16);
    for (const unit of state.units) {
        if (!unit.dead && unit.side !== shot.side && Math.abs(unit.x - x) <= radius) {
            damageUnit(unit, unit === shot.target ? shot.dmg : shot.dmg * 0.55, shot.side);
        }
    }
}

function updateDefenseShots(dt) {
    for (const shot of state.defenseShots) {
        if (!shot.target || shot.target.dead) {
            shot.dead = true;
            continue;
        }
        const targetX = shot.target.x;
        const targetY = GROUND - 78;
        shot.prevX = shot.x;
        shot.prevY = shot.y;
        const dx = targetX - shot.x;
        const dy = targetY - shot.y;
        const distance = Math.hypot(dx, dy);
        const step = shot.speed * dt;
        if (distance <= step + 14) {
            shot.x = targetX;
            shot.y = targetY;
            impactDefenseShot(shot);
            shot.dead = true;
        } else {
            shot.x += (dx / distance) * step;
            shot.y += (dy / distance) * step;
        }
    }
    state.defenseShots = state.defenseShots.filter((shot) => !shot.dead);
    for (const impact of state.defenseImpacts) impact.life -= dt;
    state.defenseImpacts = state.defenseImpacts.filter((impact) => impact.life > 0);
}

function applySpecialImpact(side, x, dmg, radius, color, shake = 3) {
    const y = GROUND - 24;
    state.defenseImpacts.push({ x, y, radius, color, life: 0.56, maxLife: 0.56 });
    burst(x, y, color, 10);
    state.shake = Math.max(state.shake, shake);
    for (const unit of state.units) {
        if (!unit.dead && unit.side !== side && Math.abs(unit.x - x) <= radius) {
            damageUnit(unit, dmg, side);
        }
    }
}

function updateMeteors(dt) {
    for (const meteor of state.meteors) {
        meteor.y += meteor.vy * dt;
        meteor.x += (meteor.tx - meteor.x) * Math.min(1, dt * 5);
        if (meteor.y >= GROUND - 20) {
            meteor.dead = true;
            meteor.x = meteor.tx;
            applySpecialImpact(meteor.side, meteor.x, meteor.dmg, meteor.radius, meteor.specialColor, 10);
        }
    }
    state.meteors = state.meteors.filter((meteor) => !meteor.dead);
}

function updateSpecialAttacks(dt) {
    for (const arrow of state.specialArrows) {
        arrow.delay -= dt;
        if (arrow.delay > 0) continue;
        arrow.y += arrow.speed * dt;
        if (arrow.y >= GROUND - 26) {
            arrow.dead = true;
            applySpecialImpact(arrow.side, arrow.x, arrow.dmg, arrow.radius, arrow.color, 2);
        }
    }
    state.specialArrows = state.specialArrows.filter((arrow) => !arrow.dead);

    for (const plane of state.airstrikes) {
        plane.x += plane.dir * plane.speed * dt;
        plane.dropTimer -= dt;
        if (plane.bombsDropped < plane.maxBombs && plane.dropTimer <= 0) {
            state.airstrikeBombs.push({
                side: plane.side,
                x: plane.x,
                y: plane.y + 38,
                vy: 40,
                dmg: plane.dmg,
                radius: plane.radius,
                color: '#ff713b',
            });
            plane.bombsDropped += 1;
            plane.dropTimer = 0.13;
        }
        const passedEnd = plane.dir > 0 ? plane.x >= plane.endX : plane.x <= plane.endX;
        if (passedEnd || plane.bombsDropped >= plane.maxBombs) plane.dead = true;
    }
    state.airstrikes = state.airstrikes.filter((plane) => !plane.dead);

    for (const bomb of state.airstrikeBombs) {
        bomb.vy += 1750 * dt;
        bomb.y += bomb.vy * dt;
        if (bomb.y >= GROUND - 22) {
            bomb.dead = true;
            applySpecialImpact(bomb.side, bomb.x, bomb.dmg, bomb.radius, bomb.color, 6);
        }
    }
    state.airstrikeBombs = state.airstrikeBombs.filter((bomb) => !bomb.dead);

    for (const laser of state.orbitalLasers) {
        if (laser.charge > 0) {
            laser.charge = Math.max(0, laser.charge - dt);
            continue;
        }
        laser.elapsed += dt;
        const progress = Math.min(1, laser.elapsed / laser.duration);
        laser.x = laser.startX + (laser.endX - laser.startX) * progress;
        for (const unit of state.units) {
            if (unit.dead || unit.side === laser.side || laser.hitUnits.has(unit)) continue;
            if (Math.abs(unit.x - laser.x) <= 52) {
                laser.hitUnits.add(unit);
                damageUnit(unit, laser.dmg, laser.side);
                state.defenseImpacts.push({ x: unit.x, y: GROUND - 35, radius: 66, color: '#51efff', life: 0.48, maxLife: 0.48 });
                burst(unit.x, GROUND - 60, '#8fffff', 12);
                state.shake = Math.max(state.shake, 5);
            }
        }
        if (progress >= 1) laser.dead = true;
    }
    state.orbitalLasers = state.orbitalLasers.filter((laser) => !laser.dead);
}

function update(dt) {
    if (!state.started || state.over || state.player.upgradeChoices) {
        return;
    }
    state.time += dt;
    updateSide(state.player, dt);
    updateSide(state.enemy, dt);
    updateAI(dt);
    updateUnits(dt);
    updateProjectiles(dt);
    updateMeteors(dt);
    updateSpecialAttacks(dt);
    updateDefenses(dt);
    updateDefenseShots(dt);
    for (const p of state.particles) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 900 * dt;
        p.life -= dt;
    }
    state.particles = state.particles.filter((p) => p.life > 0);
    for (const t of state.texts) {
        t.y -= 50 * dt;
        t.life -= dt;
    }
    state.texts = state.texts.filter((t) => t.life > 0);
    state.shake *= 0.9;
}

// ---------- Render ----------
function drawImageFit(img, x, y, h, flip) {
    if (!img.complete || !img.naturalWidth) {
        return;
    }
    const w = h * (img.naturalWidth / img.naturalHeight);
    ctx.save();
    ctx.translate(x, y);
    if (flip) {
        ctx.scale(-1, 1);
    }
    ctx.drawImage(img, -w / 2, -h, w, h);
    ctx.restore();
}

function drawBar(x, y, w, h, frac, color) {
    ctx.fillStyle = '#000a';
    ctx.fillRect(x - 2, y - 2, w + 4, h + 4);
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w * Math.max(0, frac), h);
}

function drawDefenseWeapon(side, baseX) {
    const era = side.era;
    const weapon = DEFENSE_WEAPONS[era];
    const direction = side.isPlayer ? 1 : -1;
    const mountX = baseX + direction * 38;
    const mountY = GROUND - 258;
    const target = side.defenseTarget && !side.defenseTarget.dead ? side.defenseTarget : null;
    const aimAngle = target
        ? Math.atan2(GROUND - 78 - mountY, Math.max(1, (target.x - mountX) * direction))
        : 0.16;
    const progress = Math.min(1, side.defenseCycle / weapon.cooldown);
    const barrelLength = [37, 43, 56, 62, 68, 73, 80, 88][era];

    ctx.save();
    ctx.translate(mountX, mountY);
    ctx.scale(direction, 1);
    ctx.fillStyle = '#211d1b';
    ctx.beginPath();
    ctx.ellipse(0, 15, 31, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = weapon.mountColor;
    ctx.fillRect(-23, 2, 46, 16);
    ctx.strokeStyle = '#171a1b';
    ctx.lineWidth = 4;
    ctx.strokeRect(-23, 2, 46, 16);

    ctx.save();
    ctx.rotate(aimAngle);
    ctx.fillStyle = weapon.barrelColor;
    ctx.strokeStyle = '#182126';
    ctx.lineWidth = 5;
    ctx.fillRect(-5, -11, barrelLength, 19);
    ctx.strokeRect(-5, -11, barrelLength, 19);
    ctx.fillStyle = era < 4 ? '#47352b' : era < 6 ? '#29332c' : '#b9ffff';
    ctx.fillRect(barrelLength - 10, -9, 9, 15);

    if (era === 0) {
        ctx.strokeStyle = '#49301f';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(1, -11);
        ctx.lineTo(5, -25);
        ctx.lineTo(13, -11);
        ctx.stroke();
        ctx.fillStyle = '#d3b18a';
        ctx.beginPath();
        ctx.arc(barrelLength + 5, -2, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#725b46';
        ctx.lineWidth = 2;
        ctx.stroke();
    } else if (era === 1) {
        ctx.strokeStyle = '#735837';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(10, -23);
        ctx.lineTo(10, 2);
        ctx.moveTo(6, -19);
        ctx.lineTo(52, -19);
        ctx.stroke();
        ctx.fillStyle = '#f0d28d';
        ctx.fillRect(47, -23, 13, 4);
    } else if (era < 4) {
        ctx.strokeStyle = '#735837';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(10, -24);
        ctx.lineTo(10, 3);
        ctx.moveTo(6, -20);
        ctx.lineTo(barrelLength - 4, -20);
        ctx.stroke();
        ctx.fillStyle = '#d9e4ed';
        ctx.fillRect(barrelLength - 12, -24, 14, 5);
    } else if (era < 6) {
        ctx.fillStyle = '#252d2a';
        ctx.fillRect(8, -15, 12, 28);
        ctx.fillRect(barrelLength - 21, -15, 12, 28);
        ctx.fillStyle = weapon.color;
        ctx.fillRect(10, -4, 5, 5);
    } else {
        ctx.shadowColor = weapon.color;
        ctx.shadowBlur = 15;
        ctx.fillStyle = '#73ffff';
        ctx.fillRect(20, -15, 5, 27);
        ctx.fillRect(barrelLength - 23, -15, 5, 27);
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#d9ffff';
        ctx.beginPath();
        ctx.arc(barrelLength + 3, -2, 5, 0, Math.PI * 2);
        ctx.fill();
    }
    if (side.defenseFlash > 0) {
        ctx.globalAlpha = side.defenseFlash / 0.16;
        ctx.fillStyle = weapon.color;
        ctx.shadowColor = weapon.color;
        ctx.shadowBlur = 22;
        ctx.beginPath();
        ctx.arc(barrelLength + 9, -2, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
    ctx.restore();

    ctx.strokeStyle = '#182126';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(0, 0, 27, -Math.PI / 2, Math.PI * 1.5);
    ctx.stroke();
    ctx.strokeStyle = weapon.color;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(0, 0, 27, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = 'bold 16px Inter';
    ctx.fillStyle = weapon.color;
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 5;
    ctx.fillText(weapon.name, mountX, mountY - 36);
    ctx.restore();
}

function drawBase(side, x) {
    drawImageFit(images.base, x, GROUND + 20, 360, !side.isPlayer);
    drawDefenseWeapon(side, x);
    drawBar(x - 100, GROUND - 380, 200, 16, side.hp / side.maxHp, side.isPlayer ? '#3c3' : '#d33');
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 22px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.ceil(side.hp)}  •  ${ERAS[side.era].name}`, x + (side.isPlayer ? 60 : -60), GROUND - 395);
}

function drawTowerPads() {
    const side = state.player;
    const slots = towerSlotsFor(side);
    const occupied = new Set(side.towers.map((tower) => tower.slot));
    for (let i = 0; i < slots.length; i++) {
        if (occupied.has(i)) continue;
        ctx.save();
        ctx.globalAlpha = side.buildTowerKind === null ? 0.32 : 0.78;
        ctx.fillStyle = side.buildTowerKind === null ? '#303a3c' : '#d6bf77';
        ctx.strokeStyle = side.buildTowerKind === null ? '#95a29b' : '#fff0a0';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(slots[i], GROUND + 2, 34, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }
}

function drawTower(tower) {
    const side = tower.side;
    const spec = towerSpecFor(side, tower.kind);
    const x = towerSlotsFor(side)[tower.slot];
    const direction = side.isPlayer ? 1 : -1;
    const mountY = GROUND - 38;
    const aimAngle = tower.target && !tower.target.dead
        ? Math.atan2(16, Math.max(1, (tower.target.x - x) * direction))
        : 0.08;
    const bodyColor = side.era >= 6 ? '#173f55' : side.era >= 4 ? '#485247' : '#554538';

    ctx.save();
    ctx.translate(x, mountY);
    ctx.scale(direction, 1);
    ctx.fillStyle = '#171b1b';
    ctx.beginPath();
    ctx.ellipse(0, 36, 37, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = bodyColor;
    ctx.strokeStyle = '#141719';
    ctx.lineWidth = 5;
    ctx.fillRect(-27, -26, 54, 60);
    ctx.strokeRect(-27, -26, 54, 60);
    ctx.fillStyle = spec.color;
    ctx.fillRect(-25, -27, 50, 9);
    ctx.fillStyle = '#111719';
    ctx.fillRect(-18, 19, 36, 9);

    ctx.save();
    ctx.translate(0, -16);
    ctx.rotate(aimAngle);
    ctx.fillStyle = spec.color;
    ctx.strokeStyle = '#171b1b';
    ctx.lineWidth = 4;
    if (tower.kind === 0) {
        ctx.fillRect(0, -10, 43, 8);
        ctx.strokeRect(0, -10, 43, 8);
        ctx.fillRect(0, 3, 43, 8);
        ctx.strokeRect(0, 3, 43, 8);
    } else if (tower.kind === 1) {
        ctx.fillRect(-2, -9, 57, 18);
        ctx.strokeRect(-2, -9, 57, 18);
        ctx.fillStyle = '#172027';
        ctx.fillRect(48, -5, 12, 10);
    } else {
        ctx.fillRect(-1, -12, 39, 24);
        ctx.strokeRect(-1, -12, 39, 24);
        ctx.fillStyle = '#182024';
        ctx.fillRect(31, -8, 11, 16);
        ctx.fillStyle = spec.color;
        ctx.beginPath();
        ctx.arc(8, -15, 5, 0, Math.PI * 2);
        ctx.fill();
    }
    if (tower.flash > 0) {
        ctx.globalAlpha = tower.flash / 0.18;
        ctx.shadowColor = spec.color;
        ctx.shadowBlur = 22;
        ctx.fillStyle = '#fff8cf';
        ctx.beginPath();
        ctx.arc(tower.kind === 1 ? 60 : 43, 0, 9, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
    ctx.restore();

    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = 'bold 15px Inter';
    ctx.fillStyle = spec.color;
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 5;
    ctx.fillText(spec.name, x, GROUND - 108);
    ctx.restore();
}

function drawUnit(u) {
    const flip = !u.side.isPlayer;
    const h = 140 * u.type.scale;
    const lungeOff = (u.lunge > 0 ? 12 : 0) * (flip ? -1 : 1);
    const bob = Math.sin(state.time * 10 + u.bob) * 3;
    ctx.fillStyle = '#0004';
    ctx.beginPath();
    ctx.ellipse(u.x, GROUND + 5, 35 * u.type.scale, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    drawImageFit(ERAS[u.era].sprite, u.x + lungeOff, GROUND + 5 + bob, h, flip);
    drawBar(u.x - 30, GROUND - h - 10, 60, 6, u.hp / u.maxHp, u.side.isPlayer ? '#3c3' : '#d33');
    if (u.type.label === 'Ranged') {
        ctx.fillStyle = u.side.isPlayer ? '#4af' : '#f64';
        ctx.fillRect(u.x - 4, GROUND - h - 24, 8, 8);
    }
}

function drawHUD() {
    const p = state.player;
    ctx.fillStyle = '#000b';
    ctx.fillRect(0, 0, W, 130);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffd24a';
    ctx.font = 'bold 36px Orbitron';
    ctx.fillText(`Gold ${Math.floor(p.gold)}`, 30, 55);
    ctx.fillStyle = '#9cf';
    const next = ERAS[p.era].xpNext;
    ctx.font = 'bold 26px Inter';
    ctx.fillText(next === Infinity
        ? `STAGE ${p.era + 1}/${ERAS.length} • ${ERAS[p.era].name} (MAX)`
        : `STAGE ${p.era + 1}/${ERAS.length} • XP ${Math.floor(p.xp)} / ${next}`,
    30, 105);
    ctx.fillStyle = '#26313a';
    ctx.fillRect(30, 115, 500, 7);
    ctx.fillStyle = '#69d8ff';
    ctx.fillRect(30, 115, 500 * (next === Infinity ? 1 : Math.min(1, p.xp / next)), 7);
    const m = eraMultiplier(p.era);
    UNIT_TYPES.forEach((t, i) => {
        const x = 600 + i * 260;
        const cost = Math.round(t.cost * m * (1 - p.upgrades.troopDiscount));
        ctx.fillStyle = p.gold >= cost ? '#2a5a2a' : '#442222';
        ctx.fillRect(x, 20, 240, 90);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 26px Inter';
        ctx.fillText(`[${t.key}] ${t.label}`, x + 14, 58);
        ctx.fillStyle = '#ffd24a';
        ctx.fillText(`${cost}g`, x + 14, 95);
    });
    const sx = 1400;
    ctx.fillStyle = p.specialCd > 0 ? '#333' : '#8a3a00';
    ctx.fillRect(sx, 20, 300, 90);
    ctx.fillStyle = '#fff';
    ctx.fillText(`[Q] ${ERAS[p.era].special}`, sx + 14, 58);
    ctx.fillText(p.specialCd > 0 ? `${Math.ceil(p.specialCd)}s` : 'READY', sx + 14, 95);
    ctx.font = '20px Inter';
    ctx.fillText(`Queue: ${p.queue.length}/5   M: mute`, 1730, 70);
}

function drawTowerBuildHUD() {
    const p = state.player;
    ctx.fillStyle = '#101719eF';
    ctx.fillRect(0, 974, W, H - 974);
    ctx.textAlign = 'left';
    for (let i = 0; i < 3; i++) {
        const spec = TOWER_OPTIONS[p.era][i];
        const x = 390 + i * 330;
        const cost = towerCostFor(p, i);
        const selected = p.buildTowerKind === i;
        ctx.fillStyle = selected ? '#55451f' : p.gold >= cost ? '#22352f' : '#302928';
        ctx.fillRect(x, 985, 310, 78);
        ctx.strokeStyle = selected ? '#ffda6a' : spec.color;
        ctx.lineWidth = selected ? 4 : 2;
        ctx.strokeRect(x, 985, 310, 78);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 21px Inter';
        ctx.fillText(spec.name, x + 14, 1016);
        ctx.fillStyle = spec.color;
        ctx.font = '17px Inter';
        ctx.fillText(`[${i + 4}] ${spec.role}  •  ${cost}g`, x + 14, 1047);
    }
    ctx.fillStyle = '#f1dfaa';
    ctx.font = 'bold 20px Inter';
    ctx.fillText(`TOWERS ${p.towers.length}/${p.maxTowers}`, 1415, 1010);
    ctx.font = '17px Inter';
    ctx.fillStyle = p.buildTowerKind === null ? '#b6c1bd' : '#ffdf74';
    ctx.fillText(p.buildTowerKind === null ? 'Choose a design, then click a lane pad.' : 'Click a glowing pad on your side to build.', 1415, 1042);
}

function drawUpgradeOverlay() {
    const cards = state.player.upgradeChoices;
    ctx.fillStyle = 'rgba(4, 8, 13, 0.88)';
    ctx.fillRect(0, 0, W, H);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd24a';
    ctx.font = 'bold 54px Orbitron';
    ctx.fillText(`STAGE ${state.player.era + 1} UNLOCKED`, W / 2, 230);
    ctx.fillStyle = '#d9e6ec';
    ctx.font = '26px Inter';
    ctx.fillText(`${ERAS[state.player.era].name} • Choose one upgrade to resume the battle`, W / 2, 280);

    cards.forEach((card, i) => {
        const x = 260 + i * 480;
        const y = 340;
        ctx.fillStyle = '#17212a';
        ctx.fillRect(x, y, 440, 360);
        ctx.strokeStyle = card.color;
        ctx.lineWidth = 4;
        ctx.strokeRect(x, y, 440, 360);
        ctx.fillStyle = card.color;
        ctx.font = 'bold 31px Inter';
        ctx.fillText(card.title, x + 220, y + 82);
        ctx.fillStyle = '#e9f0f2';
        ctx.font = '24px Inter';
        const words = card.description.split(' ');
        const lines = [];
        let line = '';
        for (const word of words) {
            const next = line ? `${line} ${word}` : word;
            if (ctx.measureText(next).width > 350 && line) {
                lines.push(line);
                line = word;
            } else {
                line = next;
            }
        }
        if (line) lines.push(line);
        lines.forEach((text, lineIndex) => ctx.fillText(text, x + 220, y + 155 + lineIndex * 36));
        ctx.fillStyle = '#ffd24a';
        ctx.font = 'bold 22px Inter';
        ctx.fillText(`[${i + 1}] CHOOSE`, x + 220, y + 300);
    });
    ctx.fillStyle = '#c4d0d7';
    ctx.font = '20px Inter';
    ctx.fillText('The battle is paused. Click a card or press 1, 2, or 3.', W / 2, 770);
}

function drawOverlay(title, sub) {
    ctx.fillStyle = '#000a';
    ctx.fillRect(0, 0, W, H);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd24a';
    ctx.font = 'bold 110px Orbitron';
    ctx.fillText(title, W / 2, H / 2 - 40);
    ctx.fillStyle = '#fff';
    ctx.font = '34px Inter';
    ctx.fillText(sub, W / 2, H / 2 + 40);
    ctx.fillText('Keys 1/2/3 send troops • Q special attack • earn XP to evolve', W / 2, H / 2 + 100);
}

function drawSpecialAttacks() {
    for (const meteor of state.meteors) {
        ctx.save();
        ctx.strokeStyle = '#ff6c22aa';
        ctx.lineWidth = 20;
        ctx.lineCap = 'round';
        ctx.shadowColor = '#ff5b20';
        ctx.shadowBlur = 26;
        ctx.beginPath();
        ctx.moveTo(meteor.x - (meteor.tx - meteor.x) * 0.05, meteor.y - 64);
        ctx.lineTo(meteor.x, meteor.y + 4);
        ctx.stroke();
        ctx.fillStyle = '#fff1a1';
        ctx.beginPath();
        ctx.arc(meteor.x, meteor.y, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    for (const arrow of state.specialArrows) {
        if (arrow.delay > 0) continue;
        ctx.save();
        ctx.strokeStyle = '#51381f';
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(arrow.x, arrow.y - 30);
        ctx.lineTo(arrow.x, arrow.y + 18);
        ctx.stroke();
        ctx.fillStyle = arrow.color;
        ctx.beginPath();
        ctx.moveTo(arrow.x, arrow.y + 28);
        ctx.lineTo(arrow.x - 7, arrow.y + 10);
        ctx.lineTo(arrow.x + 7, arrow.y + 10);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#fff0be';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(arrow.x, arrow.y - 25);
        ctx.lineTo(arrow.x - 9, arrow.y - 34);
        ctx.moveTo(arrow.x, arrow.y - 25);
        ctx.lineTo(arrow.x + 9, arrow.y - 34);
        ctx.stroke();
        ctx.restore();
    }

    for (const plane of state.airstrikes) {
        ctx.save();
        ctx.translate(plane.x, plane.y + Math.sin(state.time * 12) * 4);
        ctx.scale(plane.dir, 1);
        ctx.fillStyle = '#252c31';
        ctx.strokeStyle = '#c7d0d2';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-62, -5);
        ctx.lineTo(43, -5);
        ctx.lineTo(67, 2);
        ctx.lineTo(43, 9);
        ctx.lineTo(-58, 9);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#4e5d5d';
        ctx.beginPath();
        ctx.moveTo(-8, -5);
        ctx.lineTo(18, -33);
        ctx.lineTo(36, -31);
        ctx.lineTo(27, -5);
        ctx.lineTo(49, 6);
        ctx.lineTo(12, 6);
        ctx.lineTo(-7, 28);
        ctx.lineTo(-17, 27);
        ctx.lineTo(-13, 6);
        ctx.lineTo(-49, 6);
        ctx.lineTo(-30, -5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#ff934f';
        ctx.fillRect(-54, -1, 15, 4);
        ctx.restore();
    }

    for (const bomb of state.airstrikeBombs) {
        ctx.save();
        ctx.strokeStyle = '#ff8a42';
        ctx.lineWidth = 7;
        ctx.shadowColor = '#ff652c';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.moveTo(bomb.x, bomb.y - 28);
        ctx.lineTo(bomb.x, bomb.y - 8);
        ctx.stroke();
        ctx.fillStyle = '#30373b';
        ctx.beginPath();
        ctx.ellipse(bomb.x, bomb.y, 10, 18, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffcf70';
        ctx.beginPath();
        ctx.arc(bomb.x, bomb.y + 7, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    for (const laser of state.orbitalLasers) {
        if (laser.charge > 0) {
            const pulse = 0.42 + Math.sin(state.time * 24) * 0.14;
            ctx.save();
            ctx.globalAlpha = pulse;
            ctx.fillStyle = '#38eaff';
            ctx.fillRect(Math.min(laser.startX, laser.endX), GROUND - 140, Math.abs(laser.endX - laser.startX), 140);
            ctx.strokeStyle = '#a9fbff';
            ctx.lineWidth = 3;
            ctx.setLineDash([16, 13]);
            ctx.strokeRect(Math.min(laser.startX, laser.endX), GROUND - 140, Math.abs(laser.endX - laser.startX), 140);
            ctx.setLineDash([]);
            ctx.fillStyle = '#e7ffff';
            ctx.shadowColor = '#4df4ff';
            ctx.shadowBlur = 28;
            ctx.beginPath();
            ctx.arc(laser.center, GROUND - 45, 22 + Math.sin(state.time * 24) * 7, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            continue;
        }
        const progress = Math.min(1, laser.elapsed / laser.duration);
        const laserX = laser.startX + (laser.endX - laser.startX) * progress;
        const beam = ctx.createLinearGradient(laserX - 48, 0, laserX + 48, 0);
        beam.addColorStop(0, 'rgba(45, 235, 255, 0)');
        beam.addColorStop(0.45, 'rgba(45, 235, 255, 0.72)');
        beam.addColorStop(0.5, 'rgba(255, 255, 255, 0.98)');
        beam.addColorStop(0.55, 'rgba(45, 235, 255, 0.72)');
        beam.addColorStop(1, 'rgba(45, 235, 255, 0)');
        ctx.save();
        ctx.globalAlpha = 0.72 + Math.sin(state.time * 42) * 0.2;
        ctx.fillStyle = beam;
        ctx.shadowColor = '#5ff6ff';
        ctx.shadowBlur = 36;
        ctx.fillRect(laserX - 48, 115, 96, GROUND - 115);
        ctx.fillStyle = '#fff';
        ctx.fillRect(laserX - 5, 115, 10, GROUND - 115);
        ctx.restore();
    }
}

function render() {
    ctx.save();
    ctx.translate((Math.random() - 0.5) * state.shake, (Math.random() - 0.5) * state.shake);
    if (images.bg.complete && images.bg.naturalWidth) {
        ctx.drawImage(images.bg, -20, -20, W + 40, H + 40);
    } else {
        ctx.fillStyle = '#6ac';
        ctx.fillRect(0, 0, W, H);
    }
    ctx.fillStyle = '#6b4a2a88';
    ctx.fillRect(0, GROUND, W, H - GROUND);
    drawBase(state.player, PLAYER_BASE_X);
    drawBase(state.enemy, ENEMY_BASE_X);
    drawTowerPads();
    for (const tower of [...state.enemy.towers, ...state.player.towers]) drawTower(tower);
    const sorted = [...state.units].sort((a, b) => a.type.scale - b.type.scale);
    sorted.forEach(drawUnit);
    for (const shot of state.defenseShots) {
        const aim = shot.target && !shot.target.dead
            ? Math.atan2((GROUND - 78) - shot.y, shot.target.x - shot.x)
            : 0;
        ctx.save();
        ctx.strokeStyle = shot.color;
        ctx.lineWidth = 7;
        ctx.lineCap = 'round';
        ctx.shadowColor = shot.color;
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.moveTo(shot.x - Math.cos(aim) * 30, shot.y - Math.sin(aim) * 30);
        ctx.lineTo(shot.x, shot.y);
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(shot.x, shot.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
    for (const impact of state.defenseImpacts) {
        const progress = 1 - impact.life / impact.maxLife;
        const alpha = Math.max(0, impact.life / impact.maxLife);
        const radius = 10 + impact.radius * 1.65 * progress;
        ctx.save();
        ctx.globalAlpha = alpha * 0.22;
        ctx.fillStyle = impact.color;
        ctx.beginPath();
        ctx.arc(impact.x, impact.y, radius * 0.72, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = '#fff2c4';
        ctx.lineWidth = 5 * alpha + 1;
        ctx.shadowColor = impact.color;
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.arc(impact.x, impact.y, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }
    for (const pr of state.projectiles) {
        ctx.fillStyle = pr.color;
        ctx.fillRect(pr.x - 12, pr.y - 3, 24, 6);
    }
    drawSpecialAttacks();
    for (const p of state.particles) {
        ctx.globalAlpha = Math.max(0, p.life / 0.6);
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - 4, p.y - 4, 8, 8);
    }
    ctx.globalAlpha = 1;
    ctx.textAlign = 'center';
    for (const t of state.texts) {
        ctx.globalAlpha = Math.min(1, t.life);
        ctx.fillStyle = t.color;
        ctx.font = `bold ${t.size}px Inter`;
        ctx.fillText(t.text, t.x, t.y);
    }
    ctx.globalAlpha = 1;
    ctx.restore();
    drawHUD();
    drawTowerBuildHUD();
    if (!state.started) {
        drawOverlay('AGE OF BATTLE', 'Click or press any key to start');
    } else if (state.player.upgradeChoices) {
        drawUpgradeOverlay();
    } else if (state.over) {
        drawOverlay(state.over, 'Click or press R to play again');
    }
}

// ---------- Input ----------
function startOrRestart() {
    if (!audioStarted) {
        audioStarted = true;
        if (!muted) {
            music.play().catch(() => {});
        }
    }
    if (state.over) {
        resetGame();
        state.started = true;
        return true;
    }
    if (!state.started) {
        state.started = true;
        return true;
    }
    return false;
}

addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if (k === 'm') {
        muted = !muted;
        muted ? music.pause() : music.play().catch(() => {});
        return;
    }
    if (state.player.upgradeChoices) {
        if (k === '1' || k === '2' || k === '3') chooseUpgrade(Number(k) - 1);
        return;
    }
    if (startOrRestart()) {
        return;
    }
    if (k === '4' || k === '5' || k === '6') {
        state.player.buildTowerKind = Number(k) - 4;
        addText(PLAYER_BASE_X + 320, GROUND - 230, `SELECTED: ${TOWER_OPTIONS[state.player.era][state.player.buildTowerKind].name}`, TOWER_OPTIONS[state.player.era][state.player.buildTowerKind].color, 22);
        return;
    }
    const idx = UNIT_TYPES.findIndex((t) => t.key === k);
    if (idx >= 0) {
        trySpawn(state.player, idx);
    } else if (k === 'q') {
        useSpecial(state.player);
    }
});

canvas.addEventListener('pointerdown', (e) => {
    if (startOrRestart()) {
        return;
    }
    const r = canvas.getBoundingClientRect();
    const x = (e.clientX - r.left) * (W / r.width);
    const y = (e.clientY - r.top) * (H / r.height);

    if (state.player.upgradeChoices) {
        if (y >= 340 && y <= 700) {
            const index = Math.floor((x - 260) / 480);
            const cardX = 260 + index * 480;
            if (index >= 0 && index < 3 && x >= cardX && x <= cardX + 440) chooseUpgrade(index);
        }
        return;
    }

    if (y >= 978 && y <= 1070) {
        const index = Math.floor((x - 390) / 330);
        const cardX = 390 + index * 330;
        if (index >= 0 && index < 3 && x >= cardX && x <= cardX + 310) {
            state.player.buildTowerKind = index;
            addText(PLAYER_BASE_X + 320, GROUND - 230, `SELECTED: ${TOWER_OPTIONS[state.player.era][index].name}`, TOWER_OPTIONS[state.player.era][index].color, 22);
        }
        return;
    }

    if (state.player.buildTowerKind !== null && y >= 130 && y <= GROUND + 24) {
        if (buildPlayerTowerAt(x)) return;
    }
    if (y < 20 || y > 110) {
        return;
    }
    UNIT_TYPES.forEach((t, i) => {
        const bx = 600 + i * 260;
        if (x >= bx && x <= bx + 240) {
            trySpawn(state.player, i);
        }
    });
    if (x >= 1400 && x <= 1700) {
        useSpecial(state.player);
    }
});

let last = performance.now();
function loop(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    update(dt);
    render();
    requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
