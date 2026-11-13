// Champions of The Keep - single lane MOBA

const W = 1920;
const H = 1080;
const WORLD_W = 4800;
const LANE_Y = 540;
const container = document.getElementById('game-container');
const canvas = document.createElement('canvas');
canvas.width = W;
canvas.height = H;
container.appendChild(canvas);
const ctx = canvas.getContext('2d');

function resize() {
    const s = Math.min(innerWidth / W, innerHeight / H);
    canvas.style.width = W * s + 'px';
    canvas.style.height = H * s + 'px';
}
addEventListener('resize', resize);
resize();

function loadImg(src) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;
    return img;
}
const IMG = {
    ground: loadImg('assets/ground-tile.webp'),
    knight: loadImg('assets/hero-knight.webp'),
    mage: loadImg('assets/hero-mage.webp'),
    ranger: loadImg('assets/hero-ranger.webp'),
    cleric: loadImg('assets/hero-cleric.webp'),
    assassin: loadImg('assets/hero-assassin.webp'),
    minionBlue: loadImg('assets/minion-blue.webp'),
    minionRed: loadImg('assets/minion-red.webp'),
    tower: loadImg('assets/tower.webp'),
    nexus: loadImg('assets/nexus.webp'),
};

// ---------- Audio ----------
let muted = false;
const music = new Audio('assets/audio/battle-music.mp3');
music.loop = true;
music.volume = 0.35;
function sfx(name, vol = 0.5) {
    if (muted) return;
    const a = new Audio(`assets/audio/${name}.mp3`);
    a.volume = vol;
    a.play().catch(() => {});
}

// ---------- Ranked ----------
const TIERS = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];
const DIVS = ['IV', 'III', 'II', 'I'];
const RANK_COUNT = TIERS.length * DIVS.length;
const RANK_LP_VERSION = 2;
function lpRequiredForDivision(index) {
    return 100 + index * 25;
}
function lpAtDivision(index) {
    let total = 0;
    for (let i = 0; i < Math.min(index, RANK_COUNT); i++) total += lpRequiredForDivision(i);
    return total;
}
function rankInfo(lp) {
    let remaining = Math.max(0, Math.floor(Number(lp) || 0));
    let floor = 0;
    for (let index = 0; index < RANK_COUNT; index++) {
        const required = lpRequiredForDivision(index);
        if (remaining < required) return { index, progress: remaining, required, floor, master: false };
        remaining -= required;
        floor += required;
    }
    return { index: RANK_COUNT, progress: remaining, required: 0, floor, master: true };
}
function convertLegacyLp(lp) {
    const value = Math.max(0, Math.floor(Number(lp) || 0));
    const oldDivision = Math.floor(value / 100);
    if (oldDivision >= RANK_COUNT) return lpAtDivision(RANK_COUNT) + value - RANK_COUNT * 100;
    return lpAtDivision(oldDivision) + value % 100;
}
function loadRank() {
    const r = JSON.parse(localStorage.getItem('rol-rank') || '{"lp":0,"w":0,"l":0}');
    if ((r.rankSystemVersion || 1) < RANK_LP_VERSION) {
        r.lp = convertLegacyLp(r.lp);
        if (Number.isFinite(r.peak)) r.peak = convertLegacyLp(r.peak);
        r.rankSystemVersion = RANK_LP_VERSION;
        localStorage.setItem('rol-rank', JSON.stringify(r));
    }
    return r;
}
function saveRank(r) {
    r.rankSystemVersion = RANK_LP_VERSION;
    localStorage.setItem('rol-rank', JSON.stringify(r));
}
function rankName(lp) {
    const info = rankInfo(lp);
    if (info.master) return `Master ${info.progress} LP`;
    return `${TIERS[Math.floor(info.index / DIVS.length)]} ${DIVS[info.index % DIVS.length]} — ${info.progress} / ${info.required} LP`;
}
function difficulty() {
    const info = rankInfo(loadRank().lp);
    const rankSteps = info.index + (info.master ? Math.floor(info.progress / 100) : 0);
    return 1 + rankSteps * 0.06;
}

// ---------- Hero definitions ----------
const HEROES = {
    knight: { name: 'Knight', img: 'knight', hp: 900, atk: 50, range: 90, speed: 300, desc: 'Tanky bruiser. Q: Shield Throw, W: Fortify, E: Charge, R: Judgement' },
    mage: { name: 'Mage', img: 'mage', hp: 600, atk: 52, range: 380, speed: 290, desc: 'Burst caster. Q: Fire Bolt, W: Mana Ward, E: Blink, R: Meteor' },
    ranger: { name: 'Ranger', img: 'ranger', hp: 650, atk: 44, range: 450, speed: 310, desc: 'Sustained DPS. Q: Piercing Arrow, W: Second Wind, E: Tumble, R: Arrow Rain' },
    cleric: { name: 'Cleric', img: 'cleric', hp: 720, atk: 38, range: 340, speed: 295, desc: 'Support healer. Q: Holy Smite, W: Blessing (heals allies), E: Sanctuary Step, R: Divine Light' },
    assassin: { name: 'Assassin', img: 'assassin', hp: 580, atk: 42, range: 85, speed: 330, desc: 'Burst diver. Q: Shadow Dagger, W: Smoke Veil, E: Shadowstep, R: Death Mark' },
};
// Attacker kind -> kind it deals bonus damage to
const COUNTERS = { knight: 'ranger', ranger: 'assassin', assassin: 'mage', mage: 'knight' };
const COUNTER_MULT = 1.5;
// ---------- Economy & shop ----------
const START_GOLD = 500;
const GOLD_PER_SEC = 3;
const GOLD = { minion: 22, champion: 300, assist: 120, tower: 200 };
const MAX_SLOTS = 6;
const SELL_RATE = 0.7;
const ITEMS = [
    { id: 'potion', name: 'Health Potion', icon: '🧪', cost: 60, consumable: true, desc: 'Instantly restore 35% HP', apply: (h) => (h.hp = Math.min(h.maxHp, h.hp + h.maxHp * 0.35)) },
    { id: 'sword', name: 'Long Sword', icon: '🗡️', cost: 350, desc: '+12 Attack', stats: { atk: 12 } },
    { id: 'ruby', name: 'Ruby Crystal', icon: '❤️', cost: 400, desc: '+150 Max HP', stats: { maxHp: 150 } },
    { id: 'boots', name: 'Swift Boots', icon: '👢', cost: 300, unique: true, desc: '+45 Move Speed (unique)', stats: { speed: 45 } },
    { id: 'dagger', name: 'Quick Dagger', icon: '🔪', cost: 300, desc: '+15% Attack Speed', stats: { rateMult: 0.87 } },
    { id: 'tome', name: 'Arcane Tome', icon: '📘', cost: 450, desc: '+20% Ability Damage', stats: { abilMult: 0.2 } },
    { id: 'vest', name: 'Chain Vest', icon: '🛡️', cost: 450, desc: '-10% Damage Taken (max 50%)', stats: { armor: 0.1 } },
    { id: 'charm', name: 'Haste Charm', icon: '⏳', cost: 500, desc: '-10% Ability Cooldowns (max 40%)', stats: { cdr: 0.1 } },
    { id: 'heart', name: 'Troll Heart', icon: '💚', cost: 550, desc: 'Regenerate 1.5% Max HP / sec', stats: { regen: 0.015 } },
    { id: 'blade', name: 'Infinity Blade', icon: '⚔️', cost: 1400, combineCost: 750, recipe: ['sword', 'dagger'], desc: '+57 Attack, +28% Attack Speed', stats: { atk: 57, rateMult: 0.783 } },
    { id: 'plate', name: "Titan's Plate", icon: '🏰', cost: 1500, combineCost: 650, recipe: ['ruby', 'vest'], desc: '+700 Max HP, -20% Damage Taken', stats: { maxHp: 700, armor: 0.2 } },
    { id: 'cap', name: 'Deathcap', icon: '🎩', cost: 1600, combineCost: 650, recipe: ['tome', 'charm'], desc: '+65% Ability Damage, -20% Cooldowns', stats: { abilMult: 0.65, cdr: 0.2 } },
    { id: 'crown', name: 'Crown of the First King', icon: '👑', cost: 6300, combineCost: 1800, recipe: ['blade', 'plate', 'cap'], unique: true, legendary: true, desc: '+127 ATK · +1900 HP · +60 speed · +41% attack speed · +125% ability damage · 35% armor · 35% cooldown reduction · 3.5% HP regen', stats: { atk: 127, maxHp: 1900, speed: 60, rateMult: 0.58725, abilMult: 1.25, armor: 0.35, cdr: 0.35, regen: 0.035 } },
];
const ITEM_BY_ID = Object.fromEntries(ITEMS.map((i) => [i.id, i]));

function gearBonuses(itemIds, legacy = false) {
    const b = { atk: 0, maxHp: 0, speed: 0, rateMult: 1, abilMult: 0, armor: 0, cdr: 0, regen: 0 };
    const legacyStats = {
        blade: { atk: 45, rateMult: 0.9 },
        plate: { maxHp: 550, armor: 0.1 },
        cap: { abilMult: 0.45, cdr: 0.1 },
    };
    for (const id of itemIds || []) {
        const stats = legacy && legacyStats[id] ? legacyStats[id] : ITEM_BY_ID[id]?.stats;
        if (!stats) continue;
        b.atk += stats.atk || 0;
        b.maxHp += stats.maxHp || 0;
        b.speed += stats.speed || 0;
        b.rateMult *= stats.rateMult || 1;
        b.abilMult += stats.abilMult || 0;
        b.armor += stats.armor || 0;
        b.cdr += stats.cdr || 0;
        b.regen += stats.regen || 0;
    }
    b.armor = Math.min(0.5, b.armor);
    b.cdr = Math.min(0.4, b.cdr);
    return b;
}
function applyGearChange(h, before, after) {
    h.atk += after.atk - before.atk;
    const hpGain = after.maxHp - before.maxHp;
    h.maxHp += hpGain;
    h.hp = hpGain > 0 ? Math.min(h.maxHp, h.hp + hpGain) : Math.min(h.hp, h.maxHp);
    h.speed += after.speed - before.speed;
    h.rate = h.rate / before.rateMult * after.rateMult;
    h.abilMult = (h.abilMult ?? 1) + after.abilMult - before.abilMult;
    h.armor = Math.max(0, Math.min(0.5, (h.armor || 0) + after.armor - before.armor));
    h.cdr = Math.max(0, Math.min(0.4, (h.cdr || 0) + after.cdr - before.cdr));
    h.regen = (h.regen || 0) + after.regen - before.regen;
}
function giveGold(h, amount, x, y) {
    if (!h || h.type !== 'hero') return;
    h.gold = (h.gold || 0) + amount;
    if (h === player) texts.push({ x: x ?? h.x, y: (y ?? h.y) - 70, t: 1.1, s: `+${Math.round(amount)}g`, c: '#ffd84d' });
}
function canShop(h) {
    return !alive(h) || Math.abs(h.x - h.homeX) < 450;
}
function buyReason(h, item) {
    h.items ||= [];
    if (item.recipe) return 'Combine the listed components to craft this item';
    if ((h.gold || 0) < item.cost) return 'Not enough gold';
    if (item.unique && h.items.includes(item.id)) return 'Already owned';
    if (!item.consumable && h.items.length >= MAX_SLOTS) return 'Inventory full';
    if (h.isPlayer && !canShop(h)) return 'Return to base (or buy while dead)';
    return null;
}
function craftReason(h, item) {
    h.items ||= [];
    if (!item.recipe) return 'This item has no recipe';
    if (h.isPlayer && !canShop(h)) return 'Return to base (or craft while dead)';
    if ((h.gold || 0) < item.combineCost) return `Need ${item.combineCost} gold to combine`;
    if (item.unique && h.items.includes(item.id)) return 'Already owned';
    const available = [...h.items];
    for (const component of item.recipe) {
        const index = available.indexOf(component);
        if (index < 0) return `Requires ${item.recipe.map((id) => ITEM_BY_ID[id].name).join(' + ')}`;
        available.splice(index, 1);
    }
    if (available.length + 1 > MAX_SLOTS) return 'Inventory full';
    return null;
}
function buyItem(h, id) {
    const item = ITEM_BY_ID[id];
    if (!item || buyReason(h, item)) return false;
    if (item.consumable) {
        h.gold -= item.cost;
        item.apply(h);
    } else {
        const before = gearBonuses(h.items);
        h.gold -= item.cost;
        h.items.push(item.id);
        applyGearChange(h, before, gearBonuses(h.items));
    }
    if (h === player) {
        sfx('cast', 0.3);
        addBanner(`Purchased ${item.name}`);
    }
    return true;
}
function craftItem(h, id) {
    const item = ITEM_BY_ID[id];
    if (!item || craftReason(h, item)) return false;
    const before = gearBonuses(h.items);
    for (const component of item.recipe) h.items.splice(h.items.indexOf(component), 1);
    h.gold -= item.combineCost;
    h.items.push(item.id);
    applyGearChange(h, before, gearBonuses(h.items));
    if (h === player) {
        sfx('cast', 0.4);
        addBanner(`Crafted ${item.legendary ? 'Legendary: ' : ''}${item.name}`);
    }
    return true;
}
function sellItem(h, index) {
    h.items ||= [];
    const item = ITEM_BY_ID[h.items[index]];
    if (!item || item.consumable || (h.isPlayer && !canShop(h))) return false;
    const before = gearBonuses(h.items);
    const refund = Math.floor(item.cost * SELL_RATE);
    h.items.splice(index, 1);
    h.gold = (h.gold || 0) + refund;
    applyGearChange(h, before, gearBonuses(h.items));
    if (h === player) {
        sfx('cast', 0.25);
        addBanner(`Sold ${item.name} · +${refund} gold`);
    }
    return true;
}
// AI champions shop and combine their gear whenever they're back at base
function aiShop(h) {
    const pool = ITEMS.filter((i) => !i.consumable && !i.recipe);
    for (let tries = 0; tries < 6; tries++) {
        const craftable = ITEMS.filter((i) => i.recipe && !craftReason(h, i));
        if (craftable.length && Math.random() < 0.7) {
            craftItem(h, craftable[Math.floor(Math.random() * craftable.length)].id);
            continue;
        }
        const affordable = pool.filter((i) => !buyReason(h, i));
        if (!affordable.length) {
            if (craftable.length) craftItem(h, craftable[0].id);
            else break;
            continue;
        }
        const pricey = affordable.filter((i) => i.cost >= 1000);
        const choice = pricey.length && Math.random() < 0.7 ? pricey : affordable;
        buyItem(h, choice[Math.floor(Math.random() * choice.length)].id);
    }
}

const ABIL_CD = { q: 5, w: 12, e: 9, r: 45 };

// ---------- State ----------
let units = [];
let projectiles = [];
let effects = [];
let texts = [];
let player = null;
let camX = 0;
let game = { running: false, time: 0, waveTimer: 2, over: false };
const keys = {};
const mouse = { x: 0, y: 0 };

function makeUnit(o) {
    return Object.assign({ cd: 0, vx: 0, vy: 0, dead: false, shield: 0, level: 1, xp: 0, face: 1, flash: 0, animTime: Math.random() * Math.PI * 2, animMove: 0, attackAnim: 0, castAnim: 0, hitAnim: 0 }, o, { maxHp: o.hp });
}

function makeHero(kind, team, x, isPlayer) {
    const d = HEROES[kind];
    const mult = team === 'red' ? difficulty() : 1;
    return makeUnit({
        type: 'hero', kind, team, x, y: LANE_Y + (Math.random() - 0.5) * 200,
        hp: d.hp * mult, atk: d.atk * mult, range: d.range, speed: d.speed, r: 34,
        img: d.img, isPlayer, abil: { q: 0, w: 0, e: 0, r: 0 }, respawn: 0,
        gold: START_GOLD, items: [], abilMult: 1, armor: 0, cdr: 0, regen: 0,
        homeX: team === 'blue' ? 200 : WORLD_W - 200, rate: 0.8,
    });
}

function startMatch(kind) {
    units = [];
    projectiles = [];
    effects = [];
    texts = [];
    game = { running: true, time: 0, waveTimer: 2, over: false, stats: { kills: 0, deaths: 0, assists: 0, towers: 0, shutdowns: 0, bestStreak: 0, minionIncome: 0, minionLastHits: 0, damageDealt: 0, towerDamage: 0, healing: 0, shielding: 0 } };
    announcements = [];
    const add = (u) => units.push(u);
    // Structures
    for (const [team, xs, nx] of [['blue', [1000, 1800], 350], ['red', [WORLD_W - 1000, WORLD_W - 1800], WORLD_W - 350]]) {
        for (const x of xs) {
            add(makeUnit({ type: 'tower', team, x, y: LANE_Y - 40, hp: 2500, atk: 120, range: 480, speed: 0, r: 60, rate: 1.1 }));
        }
        add(makeUnit({ type: 'nexus', team, x: nx, y: LANE_Y, hp: 4000, atk: 0, range: 0, speed: 0, r: 90 }));
    }
    player = makeHero(kind, 'blue', 250, true);
    add(player);
    const shuffle = (a) => a.sort(() => Math.random() - 0.5);
    const others = shuffle(Object.keys(HEROES).filter((k) => k !== kind));
    add(makeHero(others[0], 'blue', 250, false));
    add(makeHero(others[1], 'blue', 250, false));
    const all = shuffle(Object.keys(HEROES));
    for (let i = 0; i < 3; i++) {
        add(makeHero(all[i], 'red', WORLD_W - 250, false));
    }
    document.getElementById('menu').classList.add('hidden');
    document.getElementById('end').classList.add('hidden');
    if (!muted) music.play().catch(() => {});
    saveMatch();
}

// ---------- Save state (mid-match) ----------
const SAVE_KEY = 'rol-save';
const REF_FIELDS = ['attackTarget', 'aggro', 'currentTarget', 'threatTarget'];
function saveMatch() {
    if (!game.running || game.over || !player) return;
    try {
        const idx = new Map(units.map((u, i) => [u, i]));
        const data = units.map((u) => {
            const o = { ...u };
            for (const f of REF_FIELDS) o[f] = u[f] && idx.has(u[f]) ? idx.get(u[f]) : null;
            return o;
        });
        const g = { ...game, paused: false };
        localStorage.setItem(SAVE_KEY, JSON.stringify({ v: 2, units: data, game: g, player: idx.get(player), camX, savedAt: Date.now() }));
    } catch (e) {
        console.warn('Save failed', e);
    }
}
function hasSave() {
    return !!localStorage.getItem(SAVE_KEY);
}
function clearSave() {
    localStorage.removeItem(SAVE_KEY);
}
function loadMatch() {
    try {
        const s = JSON.parse(localStorage.getItem(SAVE_KEY));
        if (!s || !Array.isArray(s.units)) return false;
        units = s.units;
        for (const u of units) {
            for (const f of REF_FIELDS) u[f] = typeof u[f] === 'number' ? units[u[f]] || null : null;
        }
        player = units[s.player];
        if (!player) throw new Error('no player');
        if ((s.v || 1) < 2) {
            for (const h of units) {
                if (h.type !== 'hero') continue;
                h.items ||= [];
                applyGearChange(h, gearBonuses(h.items, true), gearBonuses(h.items));
            }
        }
        game = { ...s.game, running: true, over: false, paused: false };
        camX = s.camX || 0;
        projectiles = [];
        effects = [];
        texts = [];
        announcements = [];
        menu.classList.add('hidden');
        endScreen.classList.add('hidden');
        addBanner('Match resumed');
        if (!muted) music.play().catch(() => {});
        return true;
    } catch (e) {
        console.warn('Load failed', e);
        clearSave();
        return false;
    }
}
addEventListener('pagehide', saveMatch);
document.addEventListener('visibilitychange', () => {
    if (document.hidden) saveMatch();
});

function setPaused(p) {
    if (!game.running || game.over) return;
    game.paused = p;
    pauseScreen.classList.toggle('hidden', !p);
    if (p) saveMatch();
}

function spawnWave() {
    for (const team of ['blue', 'red']) {
        const base = team === 'blue' ? 450 : WORLD_W - 450;
        const dir = team === 'blue' ? 1 : -1;
        const mult = team === 'red' ? difficulty() : 1;
        for (let i = 0; i < 5; i++) {
            const ranged = i >= 3;
            units.push(makeUnit({
                type: 'minion', team, x: base - dir * i * 50, y: LANE_Y + (i % 3 - 1) * 60,
                hp: (ranged ? 220 : 320) * mult, atk: (ranged ? 18 : 14) * mult, range: ranged ? 300 : 60,
                speed: 170, r: 22, rate: 1.1, img: team === 'blue' ? 'minionBlue' : 'minionRed',
            }));
        }
    }
}

// ---------- Helpers ----------
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
// Minions/towers have no respawn field; only a respawning hero counts as not alive
const alive = (u) => !!u && !u.dead && !(u.respawn > 0);
function enemiesOf(u) {
    return units.filter((o) => o.team !== u.team && alive(o) && !o.untargetable);
}
function structureProtected(u) {
    if (u.type === 'nexus') return units.some((o) => o.type === 'tower' && o.team === u.team && !o.dead);
    if (u.type === 'tower') {
        const own = units.filter((o) => o.type === 'tower' && o.team === u.team && !o.dead);
        const outer = own.reduce((m, o) => (Math.abs(o.x - (u.team === 'blue' ? 0 : WORLD_W)) > Math.abs(m.x - (u.team === 'blue' ? 0 : WORLD_W)) ? o : m), own[0]);
        return outer !== u;
    }
    return false;
}
function nearestEnemy(u, range) {
    let best = null;
    let bd = range;
    for (const o of enemiesOf(u)) {
        const d = dist(u, o) - o.r;
        // Priority: minions/heroes before protected structures
        if (structureProtected(o)) continue;
        if (d < bd) {
            bd = d;
            best = o;
        }
    }
    return best;
}

function restoreHealth(target, amount, source) {
    if (!target || !alive(target) || amount <= 0) return 0;
    const restored = Math.min(amount, Math.max(0, target.maxHp - target.hp));
    target.hp += restored;
    if (restored > 0 && source === player && target.team === player.team) {
        game.stats.healing = (game.stats.healing || 0) + restored;
    }
    return restored;
}

function setShield(target, amount, source) {
    const previous = target.shield || 0;
    target.shield = amount;
    const added = Math.max(0, amount - previous);
    if (added > 0 && source === player && target.team === player.team) {
        game.stats.shielding = (game.stats.shielding || 0) + added;
    }
}

function damage(target, amount, source) {
    if (!alive(target) || structureProtected(target)) return;
    // Champion counters: bonus damage vs the countered class
    let counter = false;
    if (source && source.type === 'hero' && target.type === 'hero' && COUNTERS[source.kind] === target.kind) {
        amount *= COUNTER_MULT;
        counter = true;
    }
    if (target.armor) amount *= 1 - target.armor;
    let absorbed = 0;
    if (target.shield > 0) {
        absorbed = Math.min(target.shield, amount);
        target.shield -= absorbed;
        amount -= absorbed;
    }
    const hpBefore = target.hp;
    target.hp -= amount;
    const healthDamage = Math.min(Math.max(0, hpBefore), amount);
    if (source === player && target.team !== player.team) {
        const dealt = absorbed + healthDamage;
        game.stats.damageDealt = (game.stats.damageDealt || 0) + dealt;
        if (target.type === 'tower') game.stats.towerDamage = (game.stats.towerDamage || 0) + dealt;
    }
    target.flash = 0.12;
    target.hitAnim = 0.16;
    target.hitDir = source ? (source.x < target.x ? 1 : -1) : 0;
    // Tower aggro: enemy champion hurting a friendly champion near a tower draws its fire
    if (source && source.type === 'hero' && target.type === 'hero' && source.team !== target.team) {
        for (const t of units) {
            if (t.type === 'tower' && !t.dead && t.team === target.team && dist(t, source) <= t.range && dist(t, target) <= t.range) {
                t.aggro = source;
            }
        }
    }
    if (amount >= 1) texts.push({ x: target.x, y: target.y - target.r - 20, t: 0.8, s: Math.round(amount) + (counter ? '!' : ''), c: counter ? '#ffb020' : target.team === 'blue' ? '#f66' : '#fff' });
    if (source === player || target === player) {
        if (Math.random() < 0.5) sfx('hit', 0.25);
    }
    if (target.hp <= 0) killUnit(target, source);
}

function killUnit(u, source) {
    if (u.type === 'hero') {
        u.respawn = 6 + u.level * 1.5;
        u.hp = 0;
        effects.push({ type: 'ring', x: u.x, y: u.y, t: 0.6, max: 0.6, r: 120, c: '#fff' });
        handleChampionTakedown(u, source);
        if (u === player) {
            game.stats.deaths++;
        } else if (source === player) {
            game.stats.kills++;
        } else if (u.team === 'red' && alive(player) && dist(player, u) < 800) game.stats.assists++;
    } else {
        u.dead = true;
        effects.push({ type: 'ring', x: u.x, y: u.y, t: 0.5, max: 0.5, r: u.r * 2.5, c: '#fa4' });
        if (u.type === 'tower' && u.team === 'red' && alive(player) && dist(player, u) < 900) game.stats.towers++;
        if (u.type === 'minion' && source && source.type === 'hero' && source.team !== u.team) {
            if (source === player) {
                game.stats.minionIncome = (game.stats.minionIncome || 0) + GOLD.minion;
                game.stats.minionLastHits = (game.stats.minionLastHits || 0) + 1;
            }
            giveGold(source, GOLD.minion, u.x, u.y);
        }
        if (u.type === 'tower') {
            // Tower gold is shared by the whole enemy team
            for (const h of units) if (h.type === 'hero' && h.team !== u.team) giveGold(h, GOLD.tower, h === player ? u.x : undefined, h === player ? u.y : undefined);
        }
        if (u.type === 'tower') addBanner(`${u.team === 'blue' ? 'Your' : 'An enemy'} tower has fallen!`);
        if (u.type === 'nexus') endMatch(u.team === 'red');
    }
    const xp = u.type === 'hero' ? 120 : u.type === 'tower' ? 150 : 30;
    for (const h of units) {
        if (h.type === 'hero' && h.team !== u.team && alive(h) && dist(h, u) < 900) gainXp(h, xp);
    }
}

function gainXp(h, xp) {
    h.xp += xp;
    const need = 100 + h.level * 60;
    if (h.xp >= need && h.level < 18) {
        h.xp -= need;
        h.level++;
        h.maxHp *= 1.08;
        h.hp = Math.min(h.maxHp, h.hp + h.maxHp * 0.15);
        h.atk *= 1.07;
        if (h === player) addBanner(`Level ${h.level}!`);
    }
}

let banner = { text: '', t: 0 };
function addBanner(text) {
    banner = { text, t: 2.2 };
}

// ---------- Kill streaks & shutdowns ----------
const STREAK_TITLES = [
    [8, 'LEGENDARY', '#ff4df0'],
    [7, 'GODLIKE', '#ff3b3b'],
    [6, 'UNSTOPPABLE', '#ff7a1a'],
    [5, 'DOMINATING', '#ffb020'],
    [4, 'RAMPAGE', '#ffd84d'],
    [3, 'KILLING SPREE', '#fff08a'],
];
function streakTitle(n) {
    return STREAK_TITLES.find(([min]) => n >= min) || null;
}
// Bounty a streaking champion is worth when shut down
function shutdownBounty(streak) {
    return streak >= 3 ? 150 + (streak - 3) * 75 : 0;
}
let announcements = [];
function announce(title, sub, color, big = false) {
    announcements.push({ title, sub, color, big, t: big ? 3.6 : 2.8, max: big ? 3.6 : 2.8 });
    if (announcements.length > 3) announcements.shift();
}
function heroLabel(h) {
    const name = HEROES[h.kind].name;
    if (h === player) return `YOU (${name})`;
    return `${h.team === 'blue' ? 'Ally' : 'Enemy'} ${name}`;
}
function handleChampionTakedown(victim, source) {
    const killer = source && source.type === 'hero' && source.team !== victim.team ? source : null;
    const victimStreak = victim.streak || 0;
    const bounty = shutdownBounty(victimStreak);
    victim.streak = 0;
    const killerColor = killer ? (killer.team === 'blue' ? '#6cf' : '#ff6b6b') : '#ccc';

    if (!killer) {
        // Executed by minion/tower - no streak credit, but bounty is lost
        if (bounty) announce('SHUTDOWN', `${heroLabel(victim)}'s ${victimStreak}-kill streak was ended by the lane`, '#ccc', true);
        else announce('EXECUTED', `${heroLabel(victim)} fell to ${source?.type || 'the lane'}`, '#aaa');
        return;
    }
    killer.streak = (killer.streak || 0) + 1;
    // Kill gold (+ shutdown bounty as gold), assist gold for nearby allies
    giveGold(killer, GOLD.champion + bounty, victim.x, victim.y);
    for (const a of units) {
        if (a !== killer && a.type === 'hero' && a.team === killer.team && alive(a) && dist(a, victim) < 900) giveGold(a, GOLD.assist);
    }
    if (killer === player) game.stats.bestStreak = Math.max(game.stats.bestStreak || 0, killer.streak);

    const wasFirstBlood = !game.firstBlood;
    if (wasFirstBlood) {
        game.firstBlood = true;
        gainXp(killer, 80);
        announce('FIRST BLOOD', `${heroLabel(killer)} drew first blood  ·  +80 XP`, '#ff4040', true);
        if (killer === player) game.stats.firstBlood = true;
        shake = Math.max(shake, 10);
    }

    if (bounty) {
        // Shutdown: bonus XP to killer, half to nearby allies, and a heal for the killer
        gainXp(killer, bounty);
        restoreHealth(killer, killer.maxHp * 0.2, killer);
        for (const a of units) {
            if (a !== killer && a.type === 'hero' && a.team === killer.team && alive(a) && dist(a, victim) < 900) gainXp(a, bounty / 2);
        }
        if (killer === player) game.stats.shutdowns = (game.stats.shutdowns || 0) + 1;
        announce('SHUTDOWN!', `${heroLabel(killer)} ended ${heroLabel(victim)}'s ${victimStreak}-kill streak  ·  +${bounty} XP & +${GOLD.champion + bounty}g bounty`, killerColor, true);
        effects.push({ type: 'ring', x: victim.x, y: victim.y, t: 0.9, max: 0.9, r: 260, c: '#ffd84d' });
        shake = Math.max(shake, 16);
    } else if (!wasFirstBlood && killer.streak < 3) {
        announce(killer.team === 'blue' ? 'ENEMY SLAIN' : 'ALLY SLAIN', `${heroLabel(killer)} took down ${heroLabel(victim)}  ·  +${GOLD.champion}g`, killerColor);
    }

    const st = streakTitle(killer.streak);
    if (st) {
        const [, title, color] = st;
        const worth = shutdownBounty(killer.streak);
        announce(title, `${heroLabel(killer)} · ${killer.streak} takedowns in a row · bounty ${worth} XP`, color, killer.streak >= 5);
        effects.push({ type: 'ring', x: killer.x, y: killer.y, t: 0.8, max: 0.8, r: 160, c: color, follow: killer });
    }
    if (killer === player || victim === player || bounty) sfx('cast', 0.35);
}

function renderAnnouncements(dt) {
    let y = 118;
    for (const a of announcements) {
        a.t -= dt;
        const age = a.max - a.t;
        const alpha = Math.min(1, a.t * 1.5, age * 6);
        const pop = age < 0.18 ? 1 + (0.18 - age) * 2.2 : 1;
        const titleSize = a.big ? 58 : 40;
        const boxH = a.big ? 108 : 82;
        ctx.save();
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.translate(W / 2, y + boxH / 2);
        ctx.scale(pop, pop);
        const boxW = a.big ? 940 : 760;
        const grad = ctx.createLinearGradient(-boxW / 2, 0, boxW / 2, 0);
        grad.addColorStop(0, 'rgba(8,10,24,0)');
        grad.addColorStop(0.2, 'rgba(8,10,24,0.88)');
        grad.addColorStop(0.8, 'rgba(8,10,24,0.88)');
        grad.addColorStop(1, 'rgba(8,10,24,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(-boxW / 2, -boxH / 2, boxW, boxH);
        ctx.fillStyle = a.color;
        ctx.fillRect(-boxW * 0.3, -boxH / 2, boxW * 0.6, 3);
        ctx.fillRect(-boxW * 0.3, boxH / 2 - 3, boxW * 0.6, 3);
        ctx.textAlign = 'center';
        ctx.font = `900 ${titleSize}px Orbitron`;
        ctx.lineWidth = 6;
        ctx.strokeStyle = '#000';
        ctx.strokeText(a.title, 0, a.big ? 8 : 4);
        ctx.fillStyle = a.color;
        ctx.shadowColor = a.color;
        ctx.shadowBlur = 18;
        ctx.fillText(a.title, 0, a.big ? 8 : 4);
        ctx.shadowBlur = 0;
        ctx.font = '700 19px Inter';
        ctx.fillStyle = '#fff';
        ctx.fillText(a.sub, 0, boxH / 2 - 14);
        ctx.restore();
        y += boxH + 8;
    }
    announcements = announcements.filter((a) => a.t > 0);
}

// ---------- Abilities ----------
function castAbility(h, key, tx, ty) {
    if (!alive(h) || h.abil[key] > 0) return false;
    const kind = h.kind;
    const ang = Math.atan2(ty - h.y, tx - h.x);
    const pow = h.atk * (h.abilMult || 1);
    if (key === 'q') {
        const cfg = { knight: [700, 2.6, '#cde'], mage: [900, 3.6, '#f73'], ranger: [1100, 2.4, '#9f6'], cleric: [800, 2.0, '#ffe680'], assassin: [650, 2.4, '#b6f'] }[kind];
        projectiles.push({ x: h.x, y: h.y, vx: Math.cos(ang) * 1300, vy: Math.sin(ang) * 1300, life: cfg[0] / 1300, dmg: pow * cfg[1], team: h.team, src: h, color: cfg[2], pierce: kind === 'ranger', hit: new Set(), r: 18 });
    } else if (key === 'w') {
        if (kind === 'knight') setShield(h, h.maxHp * 0.3, h);
        if (kind === 'mage') setShield(h, h.maxHp * 0.25, h);
        if (kind === 'assassin') setShield(h, h.maxHp * 0.15, h);
        restoreHealth(h, h.maxHp * (kind === 'ranger' ? 0.3 : 0.1), h);
        h.haste = kind === 'assassin' ? 4 : 2.5;
        if (kind === 'cleric') {
            for (const a of units) {
                if (a.type === 'hero' && a.team === h.team && alive(a) && dist(a, h) < 400) {
                    restoreHealth(a, a.maxHp * 0.25, h);
                    effects.push({ type: 'ring', x: a.x, y: a.y, t: 0.5, max: 0.5, r: 70, c: '#ffe680', follow: a });
                }
            }
        }
        effects.push({ type: 'ring', x: h.x, y: h.y, t: 0.5, max: 0.5, r: 90, c: '#6cf', follow: h });
    } else if (key === 'e') {
        const d = Math.min(kind === 'mage' || kind === 'assassin' ? 420 : 340, Math.hypot(tx - h.x, ty - h.y));
        const nx = h.x + Math.cos(ang) * d;
        const ny = h.y + Math.sin(ang) * d;
        effects.push({ type: 'line', x: h.x, y: h.y, x2: nx, y2: ny, t: 0.3, max: 0.3, c: '#fff' });
        h.x = clampX(nx);
        h.y = clampY(ny);
        if (kind === 'knight' || kind === 'assassin') {
            for (const o of enemiesOf(h)) if (dist(o, h) < 150) damage(o, pow * (kind === 'assassin' ? 1.4 : 1.8), h);
        }
        if (kind === 'cleric') restoreHealth(h, h.maxHp * 0.08, h);
        h.moveTarget = null;
    } else if (key === 'r') {
        const selfCentered = kind === 'knight' || kind === 'cleric';
        const cx = selfCentered ? h.x : tx;
        const cy = selfCentered ? h.y : ty;
        const rad = kind === 'knight' ? 260 : kind === 'cleric' ? 320 : kind === 'assassin' ? 170 : 220;
        const rMult = { mage: 6, knight: 5.5, ranger: 4.5, assassin: 4.5, cleric: 3 }[kind];
        effects.push({ type: 'telegraph', x: cx, y: cy, r: rad, t: 0.7, max: 0.7, c: h.team === 'blue' ? '#6af' : '#f55', onEnd: () => {
            effects.push({ type: 'ring', x: cx, y: cy, t: 0.5, max: 0.5, r: rad * 1.2, c: '#fd6' });
            shake = 14;
            for (const o of units) {
                if (!alive(o) || Math.hypot(o.x - cx, o.y - cy) >= rad + o.r) continue;
                if (o.team !== h.team) damage(o, pow * rMult, h);
                else if (kind === 'cleric' && o.type === 'hero') restoreHealth(o, o.maxHp * 0.4, h);
            }
        } });
    }
    h.castAnim = 0.42;
    h.abil[key] = ABIL_CD[key] * (h.isPlayer ? 1 : 1.3) * (1 - (h.cdr || 0));
    if (h.isPlayer || dist(h, player) < 900) sfx('cast', h.isPlayer ? 0.4 : 0.15);
    return true;
}

const clampX = (x) => Math.max(40, Math.min(WORLD_W - 40, x));
const clampY = (y) => Math.max(200, Math.min(880, y));

// ---------- Update ----------
function basicAttack(u, target) {
    u.cd = u.rate;
    if (u.type === 'tower') u.currentTarget = target;
    u.attackAnim = 0.3;
    u.face = target.x > u.x ? 1 : -1;
    if (u.range > 150) {
        projectiles.push({ x: u.x, y: u.y - 20, target, speed: u.type === 'tower' ? 1100 : 900, dmg: u.atk, team: u.team, src: u, color: u.type === 'tower' ? '#8ef' : u.team === 'blue' ? '#9cf' : '#f97', r: u.type === 'tower' ? 12 : 7 });
    } else {
        damage(target, u.atk, u);
        effects.push({ type: 'slash', x: target.x, y: target.y, t: 0.15, max: 0.15, c: '#fff' });
    }
}

function moveToward(u, tx, ty, dt) {
    const dx = tx - u.x;
    const dy = ty - u.y;
    const d = Math.hypot(dx, dy);
    if (d < 4) return true;
    const sp = u.speed * (u.haste > 0 ? 1.4 : 1) * dt;
    u.x = clampX(u.x + (dx / d) * Math.min(sp, d));
    u.y = clampY(u.y + (dy / d) * Math.min(sp, d));
    if (Math.abs(dx) > 2) u.face = dx > 0 ? 1 : -1;
    return false;
}

// First living enemy structure ahead of a unit in its push direction
function frontStructure(u) {
    const dir = u.team === 'blue' ? 1 : -1;
    let best = null;
    for (const o of units) {
        if (o.dead || o.team === u.team || (o.type !== 'tower' && o.type !== 'nexus')) continue;
        if (!best || o.x * dir < best.x * dir) best = o;
    }
    return best;
}

function updateMinion(u, dt) {
    const dir = u.team === 'blue' ? 1 : -1;
    const wall = frontStructure(u);
    // Siege mode: once near the enemy's front structure, stay and hit it until it (or the minion) dies
    if (wall && (wall.x - u.x) * dir < 520) {
        u.sieging = true;
        // Only peel for enemies that are right on top of us; never chase away from the tower
        const close = enemiesOf(u).filter((o) => (o.type === 'minion' || o.type === 'hero') && dist(o, u) - o.r <= u.range + 10);
        close.sort((a, b) => dist(a, u) - dist(b, u));
        const target = close[0] || (!structureProtected(wall) ? wall : null);
        if (target) {
            if (dist(u, target) - target.r <= u.range) {
                if (u.cd <= 0) basicAttack(u, target);
                return;
            }
        }
        // Advance on the structure (range check above halts them once in reach) - never walk past it
        if (structureProtected(wall)) {
            const holdX = wall.x - dir * (wall.r + 140);
            if ((holdX - u.x) * dir > 0) moveToward(u, holdX, u.y, dt);
        } else {
            moveToward(u, wall.x, wall.y + 30, dt);
        }
        if ((u.x - wall.x) * dir > 0) u.x = wall.x - dir * 5;
        return;
    }
    u.sieging = false;
    const target = nearestEnemy(u, 420);
    if (target) {
        if (dist(u, target) - target.r <= u.range) {
            if (u.cd <= 0) basicAttack(u, target);
        } else {
            moveToward(u, target.x, target.y, dt);
        }
    } else {
        moveToward(u, u.team === 'blue' ? WORLD_W : 0, LANE_Y + (u.y - LANE_Y) * 0.99, dt);
    }
}

function updateTower(u, dt) {
    // Drop aggro if the champion died or left range; retain its marker briefly for a fade-out.
    if (u.aggro && (!alive(u.aggro) || dist(u.aggro, u) > u.range)) u.aggro = null;
    if (u.aggro) u.currentTarget = u.aggro;
    if (u.currentTarget && (!alive(u.currentTarget) || dist(u.currentTarget, u) > u.range)) u.currentTarget = null;

    const focusedHero = u.currentTarget?.type === 'hero' && u.currentTarget.team !== u.team ? u.currentTarget : null;
    if (u.team === 'red' && focusedHero?.team === 'blue') {
        u.threatTarget = focusedHero;
        u.threatAlpha = Math.min(1, (u.threatAlpha || 0) + dt * 7);
    } else {
        u.threatAlpha = Math.max(0, (u.threatAlpha || 0) - dt * 1.35);
        if (u.threatAlpha <= 0.01) {
            u.threatAlpha = 0;
            u.threatTarget = null;
        }
    }

    if (u.cd > 0) return;
    if (u.aggro) {
        basicAttack(u, u.aggro);
        return;
    }
    // Default: closest enemy minion or champion
    const inRange = enemiesOf(u).filter((o) => (o.type === 'minion' || o.type === 'hero') && dist(o, u) < u.range);
    if (!inRange.length) {
        u.currentTarget = null;
        return;
    }
    inRange.sort((a, b) => dist(a, u) - dist(b, u));
    basicAttack(u, inRange[0]);
}

function towerThreats() {
    return units
        .filter((u) => u.type === 'tower' && u.team === 'red' && !u.dead && u.threatAlpha > 0.01 && u.threatTarget?.team === 'blue')
        .sort((a, b) => {
            const aTargetsPlayer = a.threatTarget === player;
            const bTargetsPlayer = b.threatTarget === player;
            if (aTargetsPlayer !== bTargetsPlayer) return aTargetsPlayer ? -1 : 1;
            return b.threatAlpha - a.threatAlpha;
        });
}

function updateAIHero(h, dt) {
    const dir = h.team === 'blue' ? 1 : -1;
    if (h.hp < h.maxHp * 0.25) h.retreating = true;
    if (h.retreating) {
        moveToward(h, h.homeX, LANE_Y, dt);
        if (h.hp > h.maxHp * 0.9) h.retreating = false;
        return;
    }
    const target = nearestEnemy(h, 550);
    // Avoid diving enemy towers without minion cover
    const enemyTower = enemiesOf(h).find((o) => o.type === 'tower' && !structureProtected(o) && dist(o, h) < o.range + 60);
    const alliedMinionsNear = units.filter((o) => o.type === 'minion' && o.team === h.team && !o.dead && enemyTower && dist(o, enemyTower) < enemyTower.range).length;
    if (enemyTower && alliedMinionsNear === 0 && (!target || target.type !== 'tower')) {
        moveToward(h, h.x - dir * 200, h.y, dt);
        return;
    }
    if (target) {
        const d = dist(h, target);
        if (target.type === 'hero') {
            if (d < 700) castAbility(h, 'q', target.x, target.y);
            if (d < 250 && Math.random() < 0.01) castAbility(h, 'r', target.x, target.y);
        }
        if (h.hp < h.maxHp * 0.5) castAbility(h, 'w', h.x, h.y);
        if (d - target.r <= h.range) {
            if (h.cd <= 0) basicAttack(h, target);
        } else {
            moveToward(h, target.x, target.y, dt);
        }
    } else {
        // Follow the frontmost allied minion
        const minions = units.filter((o) => o.type === 'minion' && o.team === h.team && !o.dead);
        let front = null;
        for (const m of minions) if (!front || m.x * dir > front.x * dir) front = m;
        const goalX = front ? front.x - dir * 120 : h.x + dir * 100;
        moveToward(h, goalX, LANE_Y + Math.sin(game.time + h.x) * 80, dt);
    }
}

function updatePlayer(h, dt) {
    let mx = 0;
    let my = 0;
    if (keys['KeyA'] || keys['ArrowLeft']) mx -= 1;
    if (keys['KeyD'] || keys['ArrowRight']) mx += 1;
    if (keys['KeyS'] || keys['ArrowDown']) my += 1;
    if (keys['KeyW'] && false) my -= 1;
    if (keys['ArrowUp']) my -= 1;
    if (mx || my) {
        h.moveTarget = null;
        h.attackTarget = null;
        moveToward(h, h.x + mx * 100, h.y + my * 100, dt);
        return;
    }
    if (leftHeld) {
        h.attackTarget = null;
        h.moveTarget = { x: clampX(mouse.x), y: clampY(mouse.y) };
    }
    if (h.attackTarget && !alive(h.attackTarget)) h.attackTarget = null;
    if (h.attackTarget) {
        const t = h.attackTarget;
        if (dist(h, t) - t.r <= h.range) {
            if (h.cd <= 0) basicAttack(h, t);
        } else {
            moveToward(h, t.x, t.y, dt);
        }
    } else if (h.moveTarget) {
        if (moveToward(h, h.moveTarget.x, h.moveTarget.y, dt)) h.moveTarget = null;
    } else {
        // Auto-attack nearby enemies when idle
        const t = nearestEnemy(h, h.range);
        if (t && h.cd <= 0) basicAttack(h, t);
    }
}

function updateHeroCommon(h, dt) {
    if (h.respawn > 0) {
        h.respawn -= dt;
        if (h.respawn <= 0) {
            h.hp = h.maxHp;
            h.x = h.homeX;
            h.y = LANE_Y;
            h.retreating = false;
            h.moveTarget = null;
            h.attackTarget = null;
            if (!h.isPlayer) aiShop(h);
        }
        return false;
    }
    if (!h.isPlayer && Math.abs(h.x - h.homeX) < 300 && h.gold >= 300) aiShop(h);
    if (h.regen) h.hp = Math.min(h.maxHp, h.hp + h.maxHp * h.regen * dt);
    for (const k in h.abil) h.abil[k] = Math.max(0, h.abil[k] - dt);
    h.haste = (h.haste || 0) - dt;
    // Fountain healing
    if (Math.abs(h.x - h.homeX) < 250) h.hp = Math.min(h.maxHp, h.hp + h.maxHp * 0.15 * dt);
    else h.hp = Math.min(h.maxHp, h.hp + h.maxHp * 0.004 * dt);
    return true;
}

let shake = 0;
function update(dt) {
    for (const u of units) {
        if (u.type === 'hero' || u.type === 'minion') {
            u.animPrevX = u.x;
            u.animPrevY = u.y;
        }
    }
    game.time += dt;
    game.waveTimer -= dt;
    // Passive income for every champion
    for (const u of units) if (u.type === 'hero') u.gold = (u.gold || 0) + GOLD_PER_SEC * dt;
    if (shopOpen) refreshShop();
    if (game.waveTimer <= 0) {
        spawnWave();
        game.waveTimer = 25;
    }
    for (const u of units) {
        if (u.dead) continue;
        u.cd -= dt;
        u.flash -= dt;
        if (u.type === 'minion') updateMinion(u, dt);
        else if (u.type === 'tower') updateTower(u, dt);
        else if (u.type === 'hero') {
            if (!updateHeroCommon(u, dt)) continue;
            if (u.isPlayer) updatePlayer(u, dt);
            else updateAIHero(u, dt);
        }
    }
    separate();
    for (const u of units) {
        if (u.type !== 'hero' && u.type !== 'minion') continue;
        const moved = Math.hypot(u.x - u.animPrevX, u.y - u.animPrevY);
        const stride = Math.min(1, moved / Math.max(2, (u.speed || 170) * dt * 0.7));
        const blend = Math.min(1, dt * (stride > (u.animMove || 0) ? 18 : 10));
        u.animMove = (u.animMove || 0) + (stride - (u.animMove || 0)) * blend;
        u.animTime = (u.animTime || 0) + dt * (2.4 + u.animMove * (u.type === 'hero' ? 9 : 11));
        u.attackAnim = Math.max(0, (u.attackAnim || 0) - dt);
        u.castAnim = Math.max(0, (u.castAnim || 0) - dt);
        u.hitAnim = Math.max(0, (u.hitAnim || 0) - dt);
    }
    updateProjectiles(dt);
    for (const e of effects) {
        e.t -= dt;
        if (e.t <= 0 && e.onEnd) {
            e.onEnd();
            e.onEnd = null;
        }
    }
    effects = effects.filter((e) => e.t > 0);
    texts.forEach((t) => {
        t.t -= dt;
        t.y -= 40 * dt;
    });
    texts = texts.filter((t) => t.t > 0);
    units = units.filter((u) => !u.dead || u.type !== 'minion');
    banner.t -= dt;
    shake *= 0.88;
    const targetCam = Math.max(0, Math.min(WORLD_W - W, player.x - W / 2));
    camX += (targetCam - camX) * Math.min(1, dt * 6);
}

function separate() {
    const movers = units.filter((u) => alive(u) && u.speed > 0);
    for (let i = 0; i < movers.length; i++) {
        for (let j = i + 1; j < movers.length; j++) {
            const a = movers[i];
            const b = movers[j];
            const d = dist(a, b) || 1;
            const min = (a.r + b.r) * 0.8;
            if (d < min) {
                const push = (min - d) / 2;
                const nx = (a.x - b.x) / d;
                const ny = (a.y - b.y) / d;
                a.x += nx * push;
                a.y = clampY(a.y + ny * push);
                b.x -= nx * push;
                b.y = clampY(b.y - ny * push);
            }
        }
    }
}

function updateProjectiles(dt) {
    for (const p of projectiles) {
        if (p.target) {
            if (!alive(p.target)) {
                p.done = true;
                continue;
            }
            const dx = p.target.x - p.x;
            const dy = p.target.y - p.y;
            const d = Math.hypot(dx, dy);
            if (d < p.speed * dt + 10) {
                damage(p.target, p.dmg, p.src);
                p.done = true;
            } else {
                p.x += (dx / d) * p.speed * dt;
                p.y += (dy / d) * p.speed * dt;
            }
        } else {
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= dt;
            if (p.life <= 0) p.done = true;
            for (const o of units) {
                if (o.team === p.team || !alive(o) || p.hit.has(o) || o.type === 'nexus') continue;
                if (Math.hypot(o.x - p.x, o.y - p.y) < o.r + p.r) {
                    damage(o, p.dmg, p.src);
                    p.hit.add(o);
                    effects.push({ type: 'ring', x: p.x, y: p.y, t: 0.25, max: 0.25, r: 50, c: p.color });
                    if (!p.pierce) {
                        p.done = true;
                        break;
                    }
                }
            }
        }
    }
    projectiles = projectiles.filter((p) => !p.done);
}

// ---------- Render ----------
function drawSprite(img, x, y, h, face) {
    if (!img.complete || !img.naturalWidth) return;
    const w = h * (img.naturalWidth / img.naturalHeight);
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(face, 1);
    ctx.drawImage(img, -w / 2, -h * 0.85, w, h);
    ctx.restore();
}

function drawAnimatedSprite(img, u, h, face) {
    if (!img.complete || !img.naturalWidth) return;
    const w = h * (img.naturalWidth / img.naturalHeight);
    const moving = Math.max(0, Math.min(1, u.animMove || 0));
    const phase = u.animTime || 0;
    const direction = u.face || face || 1;
    const attack = Math.sin((1 - Math.max(0, Math.min(0.3, u.attackAnim || 0)) / 0.3) * Math.PI);
    const cast = Math.max(0, Math.min(1, (u.castAnim || 0) / 0.42));
    const hit = Math.max(0, Math.min(1, (u.hitAnim || 0) / 0.16));
    const bob = Math.sin(phase) * (1.1 + moving * (u.type === 'hero' ? 3.6 : 2.4)) + moving * 1.2;
    const stepSquash = Math.sin(phase * 2) * moving * 0.018;
    const lunge = attack * (u.type === 'hero' ? 13 : 6);
    const lean = direction * moving * 0.032 + Math.sin(phase * 0.5) * 0.008 + (u.hitDir || 0) * hit * 0.035;

    if (moving > 0.2) {
        const footfall = (Math.sin(phase * 2) + 1) * 0.5;
        ctx.save();
        ctx.globalAlpha = moving * (0.08 + footfall * 0.08);
        ctx.fillStyle = u.team === 'blue' ? '#a9dfff' : '#ffaaa0';
        ctx.beginPath();
        ctx.ellipse(u.x - direction * (12 + footfall * 5), u.y + 4, 7 + footfall * 3, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    ctx.save();
    ctx.translate(u.x + direction * (lunge + hit * 2), u.y + bob);
    ctx.rotate(lean - attack * direction * 0.055);
    ctx.scale(face * (1 + stepSquash - hit * 0.012), 1 - stepSquash + hit * 0.02);
    if (cast > 0) {
        ctx.shadowColor = u.team === 'blue' ? '#75cfff' : '#ff766f';
        ctx.shadowBlur = 16 * cast;
    }
    ctx.drawImage(img, -w / 2, -h * 0.85, w, h);
    ctx.restore();
}

function drawBar(x, y, w, frac, color, shieldFrac = 0) {
    ctx.fillStyle = '#000a';
    ctx.fillRect(x - w / 2 - 2, y - 2, w + 4, 10);
    ctx.fillStyle = color;
    ctx.fillRect(x - w / 2, y, w * Math.max(0, frac), 6);
    if (shieldFrac > 0) {
        ctx.fillStyle = '#eee';
        ctx.fillRect(x - w / 2 + w * frac, y, w * Math.min(shieldFrac, 1 - frac), 6);
    }
}

function render() {
    ctx.save();
    ctx.translate(-camX + (Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
    // Ground
    if (IMG.ground.complete && IMG.ground.naturalWidth) {
        const pat = ctx.createPattern(IMG.ground, 'repeat');
        ctx.fillStyle = pat;
    } else ctx.fillStyle = '#2d5a2a';
    ctx.fillRect(0, 0, WORLD_W, H);
    // Lane path
    ctx.fillStyle = 'rgba(150,120,80,0.45)';
    ctx.fillRect(0, 300, WORLD_W, 480);
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(0, 0, WORLD_W, 200);
    ctx.fillRect(0, 880, WORLD_W, 200);
    // Bases
    ctx.fillStyle = 'rgba(60,120,255,0.18)';
    ctx.fillRect(0, 200, 450, 680);
    ctx.fillStyle = 'rgba(255,60,60,0.18)';
    ctx.fillRect(WORLD_W - 450, 200, 450, 680);

    // Telegraphs under units
    for (const e of effects) {
        if (e.type === 'telegraph') {
            ctx.strokeStyle = e.c;
            ctx.fillStyle = e.c + '33';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(e.x, e.y, e.r * (1 - e.t / e.max), 0, Math.PI * 2);
            ctx.fill();
        }
    }
    // Tower range when player near
    for (const u of units) {
        if (u.type === 'tower' && !u.dead && u.team === 'red' && Math.abs(u.x - player.x) < 900) {
            ctx.strokeStyle = 'rgba(255,80,80,0.35)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(u.x, u.y, u.range, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    const sorted = units.filter((u) => !u.dead && (u.type !== 'hero' || u.respawn <= 0)).sort((a, b) => a.y - b.y);
    for (const u of sorted) {
        const teamColor = u.team === 'blue' ? '#4af' : '#f44';
        const walkBlend = u.type === 'hero' || u.type === 'minion' ? Math.max(0, Math.min(1, u.animMove || 0)) : 0;
        const animPhase = u.animTime || 0;
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.beginPath();
        ctx.ellipse(u.x, u.y + 2, u.r * (1 + walkBlend * 0.1 + Math.sin(animPhase * 2) * walkBlend * 0.025), u.r * 0.4 * (1 - walkBlend * 0.08), 0, 0, Math.PI * 2);
        ctx.fill();
        if (u.type === 'hero') {
            ctx.strokeStyle = u.isPlayer ? '#fd4' : teamColor;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.ellipse(u.x, u.y, u.r + 6, (u.r + 6) * 0.4, 0, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.globalAlpha = structureProtected(u) ? 0.85 : 1;
        if (u.flash > 0) ctx.filter = 'brightness(2)';
        let h = 0;
        if (u.type === 'hero') {
            h = 110;
            drawAnimatedSprite(IMG[u.img], u, h, u.face);
        } else if (u.type === 'minion') {
            h = 62;
            drawAnimatedSprite(IMG[u.img], u, h, u.team === 'blue' ? u.face : -u.face);
        } else if (u.type === 'tower') {
            h = 230;
            drawSprite(IMG.tower, u.x, u.y, h, 1);
        } else {
            h = 240;
            drawSprite(IMG.nexus, u.x, u.y, h, 1);
        }
        ctx.filter = 'none';
        ctx.globalAlpha = 1;
        if (u.type !== 'minion') {
            ctx.fillStyle = teamColor + '55';
            ctx.beginPath();
            ctx.arc(u.x, u.y - h * 0.85 - 4, 0, 0, 0);
        }
        const bw = u.type === 'minion' ? 50 : u.type === 'hero' ? 90 : 140;
        const by = u.y - h * 0.85 - 16;
        drawBar(u.x, by, bw, u.hp / u.maxHp, u.team === 'blue' ? (u.isPlayer ? '#5e5' : '#4af') : '#e33', u.shield / u.maxHp);
        if (u.type === 'hero') {
            ctx.fillStyle = '#fff';
            ctx.font = '700 16px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(`${u.level}  ${HEROES[u.kind].name}`, u.x, by - 8);
            const sTitle = streakTitle(u.streak || 0);
            if (sTitle) {
                // Bounty badge: flame + streak count + shutdown value
                const pulse = 1 + Math.sin(game.time * 8) * 0.08;
                ctx.save();
                ctx.translate(u.x, by - 34);
                ctx.scale(pulse, pulse);
                ctx.fillStyle = 'rgba(0,0,0,0.75)';
                ctx.fillRect(-62, -16, 124, 24);
                ctx.strokeStyle = sTitle[2];
                ctx.lineWidth = 2;
                ctx.strokeRect(-62, -16, 124, 24);
                ctx.fillStyle = sTitle[2];
                ctx.font = '800 14px Inter';
                ctx.fillText(`🔥${u.streak}  ·  ${shutdownBounty(u.streak)} XP`, 0, 1);
                ctx.restore();
            }
        }
        if (structureProtected(u)) {
            ctx.font = '700 22px Inter';
            ctx.fillStyle = '#fff';
            ctx.fillText('🛡', u.x, by - 12);
        }
    }

    for (const p of projectiles) {
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.shadowBlur = 0;
    for (const e of effects) {
        const k = e.t / e.max;
        if (e.follow) {
            e.x = e.follow.x;
            e.y = e.follow.y;
        }
        ctx.globalAlpha = k;
        ctx.strokeStyle = e.c;
        ctx.lineWidth = 5;
        if (e.type === 'ring') {
            ctx.beginPath();
            ctx.arc(e.x, e.y, e.r * (1.2 - k), 0, Math.PI * 2);
            ctx.stroke();
        } else if (e.type === 'line') {
            ctx.lineWidth = 14;
            ctx.beginPath();
            ctx.moveTo(e.x, e.y);
            ctx.lineTo(e.x2, e.y2);
            ctx.stroke();
        } else if (e.type === 'slash') {
            ctx.beginPath();
            ctx.arc(e.x, e.y - 20, 28, -1, 1);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
    }
    for (const t of texts) {
        ctx.globalAlpha = Math.min(1, t.t * 2);
        ctx.fillStyle = t.c;
        ctx.font = '800 22px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(t.s, t.x, t.y);
    }
    ctx.globalAlpha = 1;
    // Hover / attack target highlight
    const hover = game.running && !game.paused ? pickEnemyLoose(mouse) : null;
    for (const t of [hover, player.attackTarget]) {
        if (!t || !alive(t)) continue;
        ctx.strokeStyle = t === player.attackTarget ? '#f33' : '#faa';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(t.x, t.y, t.r + 10, (t.r + 10) * 0.45, 0, 0, Math.PI * 2);
        ctx.stroke();
    }
    canvas.style.cursor = hover ? 'crosshair' : 'default';
    // Move target marker
    if (player.moveTarget) {
        ctx.strokeStyle = '#5f5';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(player.moveTarget.x, player.moveTarget.y, 14, 0, Math.PI * 2);
        ctx.stroke();
    }
    // A pulsing ground lock and overhead tag make the focused ally readable in the lane.
    for (const tower of towerThreats()) {
        const target = tower.threatTarget;
        if (!alive(target)) continue;
        const pulse = (Math.sin(game.time * 8) + 1) * 0.5;
        ctx.save();
        ctx.globalAlpha = tower.threatAlpha * (0.78 + pulse * 0.22);
        ctx.strokeStyle = '#ff4b55';
        ctx.shadowColor = '#ff2638';
        ctx.shadowBlur = 14;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.ellipse(target.x, target.y + 8, target.r + 17 + pulse * 5, (target.r + 12 + pulse * 4) * 0.48, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
        const tagY = target.y - 145;
        ctx.fillStyle = 'rgba(75,10,18,0.94)';
        ctx.fillRect(target.x - 47, tagY - 11, 94, 21);
        ctx.strokeStyle = '#ff6a70';
        ctx.lineWidth = 2;
        ctx.strokeRect(target.x - 47, tagY - 11, 94, 21);
        ctx.fillStyle = '#fff';
        ctx.font = '800 12px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('TOWER LOCK', target.x, tagY + 4);
        ctx.restore();
    }
    ctx.restore();
    renderHud();
}

function renderTowerThreatCue() {
    const threats = towerThreats().slice(0, 2);
    const x = W - 500;
    const y0 = 112;
    const w = 480;
    const rowH = 62;

    threats.forEach((tower, index) => {
        const target = tower.threatTarget;
        const alpha = Math.max(0, Math.min(1, tower.threatAlpha));
        if (!target || alpha <= 0.01) return;
        const active = tower.currentTarget === target && alive(target) && dist(tower, target) <= tower.range;
        const shotIn = Math.max(0, tower.cd || 0);
        const shotLabel = active
            ? (shotIn <= 0.08 ? 'READY' : `${shotIn.toFixed(1)}s`)
            : 'LOCK FADING';
        const charge = active ? Math.max(0, Math.min(1, 1 - shotIn / Math.max(0.01, tower.rate || 1))) : 0;
        const y = y0 + index * (rowH + 7);
        const accent = target === player ? '#ff5963' : '#ffc45e';
        const towerSide = structureProtected(tower) ? 'INNER' : 'OUTER';

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = 'rgba(8,12,22,0.94)';
        ctx.fillRect(x, y, w, rowH);
        ctx.strokeStyle = target === player ? 'rgba(255,86,96,0.95)' : 'rgba(255,196,94,0.82)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, rowH);
        ctx.fillStyle = accent;
        ctx.fillRect(x, y, 5, rowH);

        ctx.beginPath();
        ctx.arc(x + 20, y + 24, 10, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,76,88,0.2)';
        ctx.fill();
        ctx.strokeStyle = accent;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.font = '900 14px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('!', x + 20, y + 29);

        ctx.textAlign = 'left';
        ctx.fillStyle = target === player ? '#ff9ba0' : '#ffe0a0';
        ctx.font = '800 14px Inter';
        ctx.fillText(`ENEMY ${towerSide} TOWER → ${heroLabel(target).toUpperCase()}`, x + 38, y + 25);
        ctx.fillStyle = active ? '#dce5f4' : '#b6a4a7';
        ctx.font = '700 11px Inter';
        ctx.fillText(active ? 'NEXT SHOT' : 'TOWER LOCK LOST', x + 38, y + 45);
        ctx.textAlign = 'right';
        ctx.fillStyle = active && shotIn <= 0.08 ? '#ffe39a' : '#fff';
        ctx.font = '900 13px Inter';
        ctx.fillText(shotLabel, x + w - 14, y + 45);

        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.fillRect(x + 38, y + 53, w - 52, 3);
        ctx.fillStyle = accent;
        ctx.fillRect(x + 38, y + 53, (w - 52) * charge, 3);
        ctx.restore();
    });
}

function renderHud() {
    // Ability bar
    const keysList = ['q', 'w', 'e', 'r'];
    const names = {
        knight: ['Shield Throw', 'Fortify', 'Charge', 'Judgement'],
        mage: ['Fire Bolt', 'Mana Ward', 'Blink', 'Meteor'],
        ranger: ['Pierce Arrow', 'Second Wind', 'Tumble', 'Arrow Rain'],
        cleric: ['Holy Smite', 'Blessing', 'Sanct. Step', 'Divine Light'],
        assassin: ['Shadow Dagger', 'Smoke Veil', 'Shadowstep', 'Death Mark'],
    }[player.kind];
    const startX = W / 2 - 220;
    ctx.fillStyle = 'rgba(10,14,30,0.85)';
    ctx.fillRect(startX - 20, H - 150, 480, 140);
    keysList.forEach((k, i) => {
        const x = startX + i * 115;
        const y = H - 130;
        ctx.fillStyle = '#223';
        ctx.fillRect(x, y, 95, 80);
        const cd = player.abil[k];
        if (cd > 0) {
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.fillRect(x, y, 95, 80 * (cd / ABIL_CD[k]));
        }
        ctx.strokeStyle = cd > 0 ? '#556' : '#f3c95c';
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, 95, 80);
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.font = '800 30px Orbitron';
        ctx.fillText(cd > 0 ? Math.ceil(cd) : k.toUpperCase(), x + 47, y + 45);
        ctx.font = '600 13px Inter';
        ctx.fillText(names[i], x + 47, y + 70);
    });
    // HP/XP
    drawBar(W / 2, H - 38, 440, player.hp / player.maxHp, '#5e5', player.shield / player.maxHp);
    // Gold + inventory panel (right of ability bar)
    const invX = W / 2 + 270;
    ctx.fillStyle = 'rgba(10,14,30,0.85)';
    ctx.fillRect(invX, H - 150, 300, 140);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffd84d';
    ctx.font = '800 26px Orbitron';
    ctx.fillText(`💰 ${Math.floor(player.gold || 0)}`, invX + 14, H - 118);
    ctx.font = '600 13px Inter';
    ctx.fillStyle = '#cbd';
    ctx.fillText(`+${GOLD_PER_SEC}/s · B: Shop${canShop(player) ? ' (open)' : ''}`, invX + 160, H - 122);
    for (let i = 0; i < MAX_SLOTS; i++) {
        const sx = invX + 14 + (i % 3) * 94;
        const sy = H - 104 + Math.floor(i / 3) * 46;
        ctx.fillStyle = '#1b2440';
        ctx.fillRect(sx, sy, 84, 40);
        ctx.strokeStyle = '#445';
        ctx.lineWidth = 2;
        ctx.strokeRect(sx, sy, 84, 40);
        const it = ITEM_BY_ID[player.items?.[i]];
        if (it) {
            ctx.font = '24px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(it.icon, sx + 42, sy + 29);
            ctx.textAlign = 'left';
        }
    }
    ctx.fillStyle = '#a7f';
    ctx.fillRect(W / 2 - 220, H - 22, 440 * (player.xp / (100 + player.level * 60)), 5);

    // Top info
    ctx.fillStyle = 'rgba(10,14,30,0.8)';
    ctx.fillRect(W / 2 - 260, 10, 520, 56);
    ctx.fillStyle = '#fff';
    ctx.font = '700 24px Orbitron';
    ctx.textAlign = 'center';
    const m = Math.floor(game.time / 60);
    const s = Math.floor(game.time % 60).toString().padStart(2, '0');
    const bt = units.filter((u) => u.type === 'tower' && u.team === 'blue' && !u.dead).length;
    const rt = units.filter((u) => u.type === 'tower' && u.team === 'red' && !u.dead).length;
    ctx.fillText(`🔵 Towers ${bt}   ${m}:${s}   Towers ${rt} 🔴`, W / 2, 48);
    ctx.font = '600 16px Inter';
    ctx.textAlign = 'left';
    const st = game.stats || { kills: 0, deaths: 0, assists: 0 };
    ctx.fillText(`${rankName(loadRank().lp)}   ·   K/D/A ${st.kills}/${st.deaths}/${st.assists}`, 20, 36);
    ctx.fillText('Left-click/hold: move · Right-click/hold: attack · QWER: abilities · Arrows/AD/S: move · M: mute · Esc: pause/save', 20, 60);

    // Minimap
    const mmW = 480;
    const mmX = W - mmW - 20;
    const mmY = 20;
    ctx.fillStyle = 'rgba(10,20,10,0.85)';
    ctx.fillRect(mmX, mmY, mmW, 80);
    const sx = mmW / WORLD_W;
    for (const u of units) {
        if (!alive(u)) continue;
        ctx.fillStyle = u.team === 'blue' ? '#4af' : '#f44';
        if (u.isPlayer) ctx.fillStyle = '#fd4';
        const r = u.type === 'minion' ? 2 : u.type === 'hero' ? 5 : 7;
        ctx.fillRect(mmX + u.x * sx - r, mmY + 40 + (u.y - LANE_Y) * 0.06 - r, r * 2, r * 2);
    }
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(mmX + camX * sx, mmY, W * sx, 80);
    renderTowerThreatCue();

    if (player.respawn > 0) {
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#fff';
        ctx.font = '700 48px Orbitron';
        ctx.textAlign = 'center';
        ctx.fillText(`Respawning in ${Math.ceil(player.respawn)}`, W / 2, H / 2);
    }
    if (banner.t > 0) {
        ctx.globalAlpha = Math.min(1, banner.t);
        ctx.fillStyle = '#f3c95c';
        ctx.font = '800 34px Orbitron';
        ctx.textAlign = 'center';
        ctx.fillText(banner.text, W / 2, H - 190);
        ctx.globalAlpha = 1;
    }
    renderAnnouncements(game.running && !game.paused ? hudDt : 0);
}

// ---------- Input ----------
function toWorld(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: ((e.clientX - rect.left) / rect.width) * W + camX,
        y: ((e.clientY - rect.top) / rect.height) * H,
    };
}
// Pick the enemy whose sprite is under the cursor; minions/heroes win over structures
function spriteHeight(u) {
    return u.type === 'hero' ? 110 : u.type === 'minion' ? 62 : u.type === 'tower' ? 230 : 240;
}
function pickEnemy(p) {
    if (!player) return null;
    let best = null;
    let bestScore = Infinity;
    for (const o of enemiesOf(player)) {
        const h = spriteHeight(o);
        const halfW = Math.max(o.r + 15, h * 0.35);
        const top = o.y - h * 0.85 - 10;
        const bottom = o.y + 20;
        if (p.x < o.x - halfW || p.x > o.x + halfW || p.y < top || p.y > bottom) continue;
        const cy = (top + bottom) / 2;
        const score = Math.hypot(o.x - p.x, cy - p.y) + (o.type === 'tower' || o.type === 'nexus' ? 1000 : 0);
        if (score < bestScore) {
            bestScore = score;
            best = o;
        }
    }
    return best;
}
// Forgiving target pick: exact sprite hit first, else nearest enemy champion/minion near the cursor
function pickEnemyLoose(p) {
    const exact = pickEnemy(p);
    if (exact) return exact;
    let best = null;
    let bd = 90;
    for (const o of enemiesOf(player)) {
        if (o.type !== 'hero' && o.type !== 'minion') continue;
        const d = Math.hypot(o.x - p.x, o.y - 30 - p.y);
        if (d < bd) {
            bd = d;
            best = o;
        }
    }
    return best;
}
let leftHeld = false;
let rightHeld = false;
function updateMouse(e) {
    const p = toWorld(e);
    mouse.x = p.x;
    mouse.y = p.y;
    return p;
}
function issueMove(p, showMarker = true) {
    if (!game.running || !player || game.paused) return;
    player.attackTarget = null;
    player.moveTarget = { x: clampX(p.x), y: clampY(p.y) };
    if (showMarker) effects.push({ type: 'ring', x: p.x, y: p.y, t: 0.25, max: 0.25, r: 30, c: '#5f5' });
}
function issueAttack(p) {
    if (!game.running || !player || game.paused) return;
    const target = pickEnemyLoose(p);
    if (!target || structureProtected(target)) return;
    if (player.attackTarget !== target) {
        effects.push({ type: 'ring', x: target.x, y: target.y, t: 0.3, max: 0.3, r: target.r + 30, c: '#f33', follow: target });
    }
    player.attackTarget = target;
    player.moveTarget = null;
}
canvas.addEventListener('contextmenu', (e) => e.preventDefault());
canvas.addEventListener('pointermove', (e) => {
    const p = updateMouse(e);
    if (leftHeld) issueMove(p, false);
    if (rightHeld) issueAttack(p);
});
canvas.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 && e.button !== 2) return;
    e.preventDefault();
    if (!game.running || !player || game.paused) return;
    const p = updateMouse(e);
    if (e.button === 0) {
        leftHeld = true;
        issueMove(p);
    } else {
        rightHeld = true;
        issueAttack(p);
    }
    if (canvas.setPointerCapture) canvas.setPointerCapture(e.pointerId);
});
addEventListener('pointerup', (e) => {
    if (e.button === 0) leftHeld = false;
    if (e.button === 2) rightHeld = false;
});
addEventListener('pointercancel', () => {
    leftHeld = false;
    rightHeld = false;
});
addEventListener('blur', () => {
    leftHeld = false;
    rightHeld = false;
});
addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.code === 'KeyB' && game.running && !game.paused) {
        toggleShop();
        return;
    }
    if (e.code === 'KeyM') {
        muted = !muted;
        if (muted) music.pause();
        else if (game.running) music.play().catch(() => {});
    }
    if (e.code === 'Escape' || e.code === 'KeyP') {
        setPaused(!game.paused);
        return;
    }
    if (!game.running || !player || game.paused) return;
    const map = { KeyQ: 'q', KeyW: 'w', KeyE: 'e', KeyR: 'r' };
    if (map[e.code]) castAbility(player, map[e.code], mouse.x, mouse.y);
});
addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

// ---------- Menus ----------
const menu = document.createElement('div');
menu.id = 'menu';
menu.className = 'overlay';
const endScreen = document.createElement('div');
endScreen.id = 'end';
endScreen.className = 'overlay hidden';
const pauseScreen = document.createElement('div');
pauseScreen.className = 'overlay hidden';
pauseScreen.innerHTML = `
    <h1>PAUSED</h1>
    <p>Your match is saved automatically.</p>
    <button id="resume-btn">Resume</button>
    <button id="savequit-btn">Save &amp; Quit to Menu</button>
    <button id="forfeit-btn" style="background:#c44;color:#fff">Surrender (counts as loss)</button>`;
container.append(menu, endScreen, pauseScreen);
pauseScreen.querySelector('#resume-btn').onclick = () => setPaused(false);
pauseScreen.querySelector('#savequit-btn').onclick = () => {
    saveMatch();
    game.running = false;
    game.paused = false;
    pauseScreen.classList.add('hidden');
    music.pause();
    player = null;
    showMenu();
};
pauseScreen.querySelector('#forfeit-btn').onclick = () => {
    game.paused = false;
    pauseScreen.classList.add('hidden');
    endMatch(false);
};

// ---------- Shop panel ----------
const shopBtn = document.createElement('button');
shopBtn.className = 'shop-btn hidden';
shopBtn.textContent = '🛒 Shop (B)';
const shopPanel = document.createElement('div');
shopPanel.className = 'shop hidden';
container.append(shopBtn, shopPanel);
let shopOpen = false;
shopBtn.onclick = () => toggleShop();
function toggleShop(force) {
    shopOpen = force ?? !shopOpen;
    shopPanel.classList.toggle('hidden', !shopOpen);
    if (shopOpen) buildShop();
}
function shopCard(i) {
    const recipe = i.recipe ? `🧩 ${i.recipe.map((id) => ITEM_BY_ID[id].name).join(' + ')}` : '';
    const price = i.recipe ? `🔨 Combine · ${i.combineCost}g` : `💰 ${i.cost}g`;
    return `<button class="shop-item${i.legendary ? ' legendary' : ''}" data-id="${i.id}">
        <span class="si-icon">${i.icon}</span>
        <span class="si-name">${i.legendary ? '✦ ' : ''}${i.name}</span>
        <span class="si-desc">${i.desc}</span>
        ${recipe ? `<span class="si-recipe">${recipe}</span>` : ''}
        <span class="si-cost">${price}</span>
    </button>`;
}
function buildShop() {
    shopPanel.innerHTML = `
        <div class="shop-head"><h3>🛒 Item Shop</h3><span id="shop-gold"></span><button class="shop-close">✕</button></div>
        <div id="shop-note"></div>
        <div class="shop-grid">
            <div class="shop-subhead">Gear &amp; Components</div>
            ${ITEMS.filter((i) => !i.recipe).map(shopCard).join('')}
            <div class="shop-subhead">Combination Recipes</div>
            ${ITEMS.filter((i) => i.recipe).map(shopCard).join('')}
        </div>
        <div class="shop-inv-head"><strong>Your inventory</strong><small>Click an item to sell it for ${Math.round(SELL_RATE * 100)}% gold</small></div>
        <div class="shop-inv" id="shop-inv"></div>`;
    shopPanel.querySelector('.shop-close').onclick = () => toggleShop(false);
    shopPanel.querySelectorAll('.shop-item').forEach((b) => {
        b.onclick = () => {
            const item = ITEM_BY_ID[b.dataset.id];
            if (player && item) item.recipe ? craftItem(player, item.id) : buyItem(player, item.id);
            refreshShop();
        };
    });
    shopPanel.querySelector('#shop-inv').onclick = (e) => {
        const slot = e.target.closest('[data-sell-index]');
        if (!slot || !player) return;
        sellItem(player, Number(slot.dataset.sellIndex));
        refreshShop();
    };
    refreshShop();
}
function refreshShop() {
    if (!shopOpen || !player) return;
    const g = shopPanel.querySelector('#shop-gold');
    if (!g) return;
    g.textContent = `💰 ${Math.floor(player.gold || 0)}`;
    player.items ||= [];
    shopPanel.querySelector('#shop-note').textContent = canShop(player)
        ? 'At base — buy components, then combine recipes. Potions are consumed on purchase.'
        : '⚠ Return to your base (or wait until respawn) to buy, craft, or sell.';
    shopPanel.querySelectorAll('.shop-item').forEach((b) => {
        const item = ITEM_BY_ID[b.dataset.id];
        const reason = item.recipe ? craftReason(player, item) : buyReason(player, item);
        b.classList.toggle('disabled', !!reason);
        b.title = reason || (item.recipe ? 'Click to combine components' : 'Click to buy');
    });
    shopPanel.querySelector('#shop-inv').innerHTML = Array.from({ length: MAX_SLOTS }, (_, i) => {
        const it = ITEM_BY_ID[player.items[i]];
        if (!it) return '<span class="shop-slot empty" title="Empty inventory slot">—</span>';
        const refund = Math.floor(it.cost * SELL_RATE);
        return `<button class="shop-slot" data-sell-index="${i}" title="Sell ${it.name} for ${refund} gold">
            <span>${it.icon}</span><small>SELL ${refund}g</small>
        </button>`;
    }).join('');
    shopPanel.querySelector('#shop-inv').querySelectorAll('[data-sell-index]').forEach((slot) => {
        slot.disabled = player.isPlayer && !canShop(player);
    });
}

function winRate(r) {
    return r.w + r.l ? Math.round((r.w / (r.w + r.l)) * 100) : 0;
}
function lpBar(lp) {
    const info = rankInfo(lp);
    const pct = info.master ? 100 : (info.progress / info.required) * 100;
    const label = info.master ? 'MASTER' : `${info.progress} / ${info.required} LP`;
    return `<div class="lpbar"><div style="width:${pct}%"></div><span>${label}</span></div>`;
}
function showMenu() {
    const r = loadRank();
    menu.innerHTML = `
        <h1>CHAMPIONS OF THE KEEP</h1>
        <div class="rank">Ranked Season 1 · ${rankName(r.lp)}</div>
        ${lpBar(r.lp)}
        <div>${r.w}W ${r.l}L · ${winRate(r)}% win rate · Peak: ${rankName(r.peak || r.lp)}${r.streak ? ` · Streak ${r.streak > 0 ? r.streak + 'W' : -r.streak + 'L'}` : ''}</div>
        <div class="history">${(r.history || []).map((m) => `<span class="${m.v ? 'pos' : 'neg'}" title="${HEROES[m.hero]?.name || ''} ${m.k}/${m.de}/${m.a}">${m.v ? 'W' : 'L'} ${m.d > 0 ? '+' : ''}${m.d}</span>`).join('') || '<small>No matches played yet</small>'}</div>
        <p>Destroy the enemy towers, then their Nexus. Enemies grow stronger as you climb.</p>
        <div class="heroes">
            ${Object.entries(HEROES).map(([k, h]) => `
                <div class="card" data-hero="${k}">
                    <img src="assets/hero-${k}.webp" alt="${h.name}">
                    <h2>${h.name}</h2>
                    <small>${h.desc}</small>
                    <div class="counter">${COUNTERS[k] ? `⚔ Strong vs ${HEROES[COUNTERS[k]].name}` : '✚ Neutral (no counters)'}<br>${(() => { const w = Object.keys(COUNTERS).find((a) => COUNTERS[a] === k); return w ? `🛡 Weak vs ${HEROES[w].name}` : ''; })()}</div>
                </div>`).join('')}
        </div>
        <small>Pick a hero to enter ranked queue</small>
        ${hasSave() ? '<button id="resume-save">▶ Resume Saved Match</button>' : ''}
`;
    menu.classList.remove('hidden');
    const resumeBtn = menu.querySelector('#resume-save');
    if (resumeBtn) resumeBtn.onclick = () => {
        if (!loadMatch()) showMenu();
    };
    menu.querySelectorAll('.card').forEach((c) => {
        c.onclick = () => startMatch(c.dataset.hero);
    });
}

function endMatch(victory) {
    if (game.over) return;
    game.over = true;
    game.running = false;
    const r = loadRank();
    r.streak = r.streak || 0;
    r.history = r.history || [];
    const before = rankName(r.lp);
    const oldTier = rankInfo(r.lp).index;
    const st = game.stats;
    const fmt = (value) => Math.round(value || 0).toLocaleString();
    const bestStreak = st.bestStreak || 0;
    const bestStreakLabel = bestStreak >= 3
        ? `${streakTitle(bestStreak)?.[1] || 'HOT STREAK'} ×${bestStreak}`
        : `${bestStreak} ${bestStreak === 1 ? 'takedown' : 'takedowns'}`;
    const roleSpotlight = {
        knight: { role: 'Frontliner', focus: `${fmt(st.damageDealt)} damage · ${fmt(st.shielding)} protection` },
        mage: { role: 'Spellcaster', focus: `${fmt(st.damageDealt)} total damage dealt` },
        ranger: { role: 'Marksman', focus: `${fmt(st.damageDealt)} total damage dealt` },
        cleric: { role: 'Field medic', focus: `${fmt(st.healing)} healing · ${fmt(st.shielding)} shielding` },
        assassin: { role: 'Skirmisher', focus: `${st.kills || 0} takedowns · ${bestStreakLabel} best streak` },
    }[player.kind];
    const recapCard = (title, icon, rows) => `<article class="recap-card"><h3><span>${icon}</span>${title}</h3>${rows.map(([label, value]) => `<div class="recap-row"><span>${label}</span><strong>${value}</strong></div>`).join('')}</article>`;
    const contributionMarkup = `
        <section class="result-recap" aria-label="Match contribution recap">
            <div class="recap-head"><div><small>YOUR MATCH IMPACT</small><h2>Contribution recap</h2></div><span class="role-chip">${roleSpotlight.role}</span></div>
            <div class="recap-spotlight"><span>ROLE SPOTLIGHT</span><strong>${roleSpotlight.focus}</strong></div>
            <div class="recap-grid">
                ${recapCard('Combat', '⚔', [['Champion takedowns', st.kills || 0], ['Assists', st.assists || 0], ['Damage dealt', fmt(st.damageDealt)]])}
                ${recapCard('Lane economy', '◈', [['Minion last hits', st.minionLastHits || 0], ['Minion gold earned', `${fmt(st.minionIncome)}g`]])}
                ${recapCard('Objective pressure', '♜', [['Damage to towers', fmt(st.towerDamage)], ['Enemy towers destroyed', st.towers || 0]])}
                ${recapCard('Teamplay & streak', '✦', [['Healing restored', fmt(st.healing)], ['Shielding applied', fmt(st.shielding)], ['Best takedown streak', bestStreakLabel]])}
            </div>
        </section>`;
    // Streak: positive = wins in a row, negative = losses in a row
    r.streak = victory ? Math.max(1, r.streak + 1) : Math.min(-1, r.streak - 1);
    const lines = [];
    let delta;
    if (victory) {
        lines.push(['Victory', 22]);
        if (r.streak >= 2) lines.push([`Win streak x${r.streak}`, Math.min(10, (r.streak - 1) * 2)]);
    } else {
        lines.push(['Defeat', -20]);
        if (r.streak <= -3) lines.push([`Loss streak x${-r.streak}`, -Math.min(6, (-r.streak - 2) * 2)]);
    }
    const kdBonus = Math.max(-4, Math.min(6, st.kills * 2 - st.deaths));
    if (kdBonus) lines.push([`Performance (${st.kills}/${st.deaths}/${st.assists})`, kdBonus]);
    if (st.towers) lines.push([`Towers destroyed x${st.towers}`, st.towers * 2]);
    if (st.shutdowns) lines.push([`Shutdowns x${st.shutdowns}`, Math.min(6, st.shutdowns * 2)]);
    if ((st.bestStreak || 0) >= 3) lines.push([`Best streak: ${streakTitle(st.bestStreak)[1]}`, Math.min(5, st.bestStreak - 2)]);
    if (st.firstBlood) lines.push(['First Blood', 1]);
    if (victory && game.time < 600) lines.push(['Fast win (<10 min)', 3]);
    delta = lines.reduce((s, l) => s + l[1], 0);
    if (victory) delta = Math.max(12, delta);
    else delta = Math.min(-8, delta);
    // Demotion shield: can't drop below a division floor on the first loss
    const floor = rankInfo(r.lp).floor;
    if (!victory && r.lp + delta < floor && r.lp > floor && r.lp - floor >= 0 && !r.shieldUsed) {
        delta = floor - r.lp;
        lines.push(['Demotion shield', 0]);
        r.shieldUsed = true;
    } else if (victory) r.shieldUsed = false;
    r.lp = Math.max(0, r.lp + delta);
    if (victory) r.w++;
    else r.l++;
    const newTier = rankInfo(r.lp).index;
    r.history.unshift({ v: victory, d: delta, hero: player.kind, k: st.kills, de: st.deaths, a: st.assists });
    r.history = r.history.slice(0, 10);
    r.peak = Math.max(r.peak || 0, r.lp);
    saveRank(r);
    clearSave();
    const tierMsg = newTier > oldTier ? '<div class="promo up">⬆ PROMOTED!</div>' : newTier < oldTier ? '<div class="promo down">⬇ Demoted</div>' : '';
    endScreen.innerHTML = `
        <h1 style="color:${victory ? '#f3c95c' : '#f55'}">${victory ? 'VICTORY' : 'DEFEAT'}</h1>
        <div class="lp-delta ${delta > 0 ? 'pos' : 'neg'}">${delta > 0 ? '+' : ''}${delta} LP</div>
        <table class="lp-table">${lines.map(([n, v]) => `<tr><td>${n}</td><td class="${v >= 0 ? 'pos' : 'neg'}">${v > 0 ? '+' : ''}${v}</td></tr>`).join('')}</table>
        ${contributionMarkup}
        ${tierMsg}
        <p>${before} → <b>${rankName(r.lp)}</b></p>
        ${lpBar(r.lp)}
        <p>Season record: ${r.w}W ${r.l}L · ${winRate(r)}% win rate · Streak ${r.streak > 0 ? r.streak + 'W' : -r.streak + 'L'}</p>
        <button id="again">Play Again</button>`;
    endScreen.classList.remove('hidden');
    document.getElementById('again').onclick = () => {
        endScreen.classList.add('hidden');
        showMenu();
    };
}

showMenu();

// ---------- Loop ----------
let last = performance.now();
var hudDt = 0;
function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    hudDt = dt;
    const inMatch = !!player && game.running;
    shopBtn.classList.toggle('hidden', !inMatch);
    if (!inMatch && shopOpen) toggleShop(false);
    if (player) {
        if (game.running && !game.paused) {
            update(dt);
            game.saveTimer = (game.saveTimer || 0) + dt;
            if (game.saveTimer > 5) {
                game.saveTimer = 0;
                saveMatch();
            }
        }
        render();
    } else {
        ctx.fillStyle = '#0a1020';
        ctx.fillRect(0, 0, W, H);
    }
    requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
