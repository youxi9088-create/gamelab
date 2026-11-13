// ================= Starblades: turn-based tactical battles (space & ground) =================
// Self-contained DOM/canvas overlay. main.js builds squads and awaits tacticalBattle().

// Unit catalogue shared with main.js. pow = auto-resolve strength per unit.
// tags: fighter (ignores most shields), heavy (armor), arty (no fire after moving), dark (starts cloaked),
// ram (hyperspace ram), ion (ion burst), hero, melee, jump (ignores terrain), swarm, heal, cloak (can go dark)
export const UNITS = {
  // --- base space hulls (derived from ship counts) ---
  corvette: { n: 'Corvettes', k: 'space', ic: '▲', pow: 10, hp: 30, sh: 10, atk: 8, rng: 3, mv: 4, tags: ['cloak'] },
  frigate: { n: 'Frigates', k: 'space', ic: '◆', pow: 10, hp: 60, sh: 25, atk: 12, rng: 4, mv: 3, tags: ['ion', 'cloak'] },
  cruiser: { n: 'Flagship Cruiser', k: 'space', ic: '⬢', pow: 10, hp: 150, sh: 60, atk: 22, rng: 5, mv: 2, tags: ['ram', 'cloak'] },
  station: { n: 'Orbital Station', k: 'space', ic: '🛰', pow: 35, hp: 230, sh: 90, atk: 26, rng: 5, mv: 0, tags: ['heavy'] },
  // --- base ground (derived from legions/elite/general) ---
  legion: { n: 'Legionaries', k: 'land', ic: '⛨', pow: 8, hp: 40, atk: 10, rng: 3, mv: 3, tags: [] },
  elite: { n: 'Elite Guard', k: 'land', ic: '✪', pow: 25, hp: 75, atk: 18, rng: 2, mv: 3, tags: ['melee'] },
  hero: { n: 'General', k: 'land', ic: '⚔', pow: 0, hp: 90, atk: 22, rng: 1, mv: 4, tags: ['hero', 'melee'] },
  bunker: { n: 'Bunker Line', k: 'land', ic: '▣', pow: 0, hp: 160, atk: 14, rng: 4, mv: 0, tags: ['heavy'] },
  // --- mercenary guild ---
  droidLegion: { n: 'AI War-Legion', k: 'land', ic: '🤖', c: 110, up: 3, pow: 9, hp: 45, atk: 9, rng: 3, mv: 3, tags: ['swarm'], guild: 'Artificial Intelligence Alliance', d: 'Cheap, relentless machine soldiers run by a single AI mind. Never break.' },
  droidStarfighters: { n: 'AI Strikecraft', k: 'space', ic: '✈', c: 120, up: 3, pow: 10, hp: 22, sh: 0, atk: 11, rng: 1, mv: 6, tags: ['fighter', 'swarm'], guild: 'Artificial Intelligence Alliance', d: 'Pilotless swarm fighters flown by AI. Bypass shields.' },
  droidDreadnought: { n: 'AI Dreadnought', k: 'space', ic: '⬣', c: 420, up: 10, pow: 45, hp: 200, sh: 70, atk: 26, rng: 5, mv: 2, tags: ['heavy'], guild: 'Artificial Intelligence Alliance', d: 'A capital ship with an AI for a captain and no crew at all.' },
  cloneTroopers: { n: 'Vat Legionaries', k: 'land', ic: '⛑', c: 140, up: 4, pow: 16, hp: 55, atk: 14, rng: 3, mv: 3, tags: [], guild: 'The Cloning Guild', d: 'Vat-grown, disciplined, identical.' },
  cloneCommandos: { n: 'Clone Commandos', k: 'land', ic: '🎯', c: 220, up: 6, pow: 28, hp: 60, atk: 22, rng: 4, mv: 4, tags: ['jump'], guild: 'The Cloning Guild', d: 'Jump-packs. Ignore terrain.' },
  syndicateGunships: { n: 'Syndicate Gunships', k: 'space', ic: '♦', c: 180, up: 5, pow: 20, hp: 50, sh: 15, atk: 15, rng: 3, mv: 5, tags: ['cloak'], guild: 'The Spice Syndicate', d: 'Fast smuggler gunboats.' },
  corsairs: { n: 'Pirate Corsairs', k: 'space', ic: '☠', c: 130, up: 3, pow: 13, hp: 35, sh: 8, atk: 12, rng: 2, mv: 5, tags: ['cloak'], guild: 'The Pirate Elect', d: 'Hit-and-run raiders.' },
  // --- planet-specific (alien & local) ---
  wyrmRiders: { n: 'Sand Wyrm Riders', k: 'land', ic: '🐛', c: 260, up: 6, pow: 34, hp: 140, atk: 24, rng: 1, mv: 4, tags: ['melee', 'heavy'], d: 'Desert nomads riding colossal burrowing wyrms.' },
  duneStalkers: { n: 'Dune Stalkers', k: 'land', ic: '🏜', c: 180, up: 4, pow: 24, hp: 55, atk: 18, rng: 3, mv: 4, tags: ['jump'], d: 'Stillsuited desert warriors. Move freely over any ground.' },
  kashariBerserkers: { n: 'Kashari Berserkers', k: 'land', ic: '🦍', c: 200, up: 5, pow: 28, hp: 95, atk: 24, rng: 1, mv: 3, tags: ['melee'], d: 'Towering furred aliens who tear war-machines apart.' },
  marshShields: { n: 'Marsh Shieldbearers', k: 'land', ic: '🛡', c: 150, up: 4, pow: 18, hp: 110, atk: 8, rng: 2, mv: 2, tags: ['heavy'], d: 'Amphibious aliens with energy shields.' },
  siegeWalkers: { n: 'Siege Walkers', k: 'land', ic: '🦿', c: 280, up: 7, pow: 36, hp: 150, atk: 22, rng: 4, mv: 2, tags: ['heavy'], d: 'Four-legged armored walkers.' },
  plasmaArtillery: { n: 'Plasma Artillery', k: 'land', ic: '🎇', c: 220, up: 5, pow: 26, hp: 40, atk: 30, rng: 7, mv: 1, tags: ['arty'], d: 'Long-range bombardment. Cannot fire after moving.' },
  abyssalCruiser: { n: 'Abyssal Cruiser', k: 'space', ic: '🐙', c: 380, up: 9, pow: 42, hp: 170, sh: 90, atk: 22, rng: 4, mv: 2, tags: ['heavy'], d: 'Organic alien warship with regenerating shields.' },
  voidWasps: { n: 'Void Wasps', k: 'space', ic: '🐝', c: 150, up: 3, pow: 14, hp: 20, sh: 0, atk: 12, rng: 1, mv: 7, tags: ['fighter', 'swarm'], d: 'Insectoid living starfighters.' },
  ionLancers: { n: 'Ion Lancers', k: 'space', ic: '⚡', c: 200, up: 5, pow: 20, hp: 45, sh: 20, atk: 9, rng: 5, mv: 4, tags: ['ion'], d: 'Corvettes built to strip shields.' },
  ghostRunners: { n: 'Ghost Runners', k: 'space', ic: '👻', c: 230, up: 5, pow: 22, hp: 45, sh: 15, atk: 18, rng: 3, mv: 5, tags: ['dark', 'cloak'], d: 'Stealth raiders that begin battle running dark.' },
  // --- faction uniques ---
  templars: { n: 'Templar Knights', k: 'land', ic: '✠', c: 260, up: 6, pow: 34, hp: 90, atk: 26, rng: 1, mv: 4, tags: ['melee', 'hero'], d: 'Starblade-wielding knights of the Nameless.' },
  blackLegion: { n: 'Black Legionnaires', k: 'land', ic: '🖤', c: 120, up: 3, pow: 14, hp: 60, atk: 12, rng: 2, mv: 3, tags: ['melee'], d: 'Exiles with nothing left to lose.' },
  starDestroyer: { n: 'Authority Lancer', k: 'space', ic: '🔺', c: 480, up: 12, pow: 55, hp: 230, sh: 90, atk: 30, rng: 6, mv: 2, tags: ['heavy', 'ram'], d: 'A spear-hulled battleship, the pride of the Space Authority.' },
  pathfinders: { n: 'Navigator Pathfinders', k: 'space', ic: '🧭', c: 200, up: 5, pow: 18, hp: 40, sh: 25, atk: 10, rng: 4, mv: 7, tags: ['cloak'], d: 'Guild ships that fold space mid-battle.' },
  liberators: { n: 'Liberator Gunships', k: 'space', ic: '🕊', c: 220, up: 5, pow: 24, hp: 70, sh: 30, atk: 16, rng: 3, mv: 4, tags: [], d: 'Gunships of the Unchained, crewed by freed slaves.' },
  ashBerserkers: { n: 'Ash Berserkers', k: 'land', ic: '🔥', c: 140, up: 3, pow: 20, hp: 65, atk: 20, rng: 1, mv: 4, tags: ['melee'], d: 'Clansmen painted in the ash of dead worlds.' },
  dominionWalkers: { n: 'Dominion Walkers', k: 'land', ic: '🦾', c: 300, up: 7, pow: 38, hp: 160, atk: 22, rng: 4, mv: 2, tags: ['heavy'], d: 'Machine-cult war-frames.' },
  hexSisters: { n: 'Hex Sisters', k: 'land', ic: '🔮', c: 210, up: 5, pow: 24, hp: 50, atk: 20, rng: 4, mv: 3, tags: ['heal'], d: 'Witchmaiden battle-seers who mend allies.' },
  militiaStarhawks: { n: 'Militia Starhawks', k: 'space', ic: '🦅', c: 130, up: 3, pow: 12, hp: 22, sh: 5, atk: 11, rng: 1, mv: 6, tags: ['fighter'], d: 'Free Planets volunteer pilots.' },
  zithariWarblades: { n: 'Zithari Warblades', k: 'land', ic: '☯', c: 240, up: 6, pow: 32, hp: 80, atk: 26, rng: 1, mv: 4, tags: ['melee', 'hero'], d: 'Red-bladed dark duelists.' },
  grayWardens: { n: 'Gray Wardens', k: 'land', ic: '🗡', c: 200, up: 5, pow: 26, hp: 85, atk: 18, rng: 2, mv: 3, tags: ['heavy'], d: 'Silent guardians of the Gray Order.' },
  corsairSwarm: { n: 'Corsair Swarm', k: 'space', ic: '💀', c: 140, up: 3, pow: 14, hp: 22, sh: 0, atk: 12, rng: 1, mv: 6, tags: ['fighter', 'swarm'], d: 'A cloud of patched-together fighters.' },
  ghostDreadnought: { n: 'Ghost Dreadnought', k: 'space', ic: '⚓', c: 450, up: 11, pow: 50, hp: 210, sh: 70, atk: 28, rng: 5, mv: 2, tags: ['dark', 'cloak', 'ram'], d: 'A lost Old Empire warship, still running silent.' },
  raiderHorde: { n: 'Raider Horde', k: 'land', ic: '🪓', c: 90, up: 2, pow: 11, hp: 50, atk: 11, rng: 1, mv: 4, tags: ['melee', 'swarm'], d: 'Howling barbarian boarders.' },
  junkGunboats: { n: 'Junk Gunboats', k: 'space', ic: '🔧', c: 90, up: 2, pow: 9, hp: 35, sh: 5, atk: 9, rng: 3, mv: 4, tags: [], d: 'Scrap ships held together with hope.' },
};
export const PLANET_SPECIALS = ['wyrmRiders', 'duneStalkers', 'kashariBerserkers', 'marshShields', 'siegeWalkers', 'plasmaArtillery', 'abyssalCruiser', 'voidWasps', 'ionLancers', 'ghostRunners'];
export const FACTION_UNIQUE = {
  'The Nameless': 'templars', 'The Nightfleet': 'blackLegion', 'The Pirate Elect': 'corsairs', 'The Spice Syndicate': 'wyrmRiders', 'The Hyperspacing Guild': 'pathfinders',
  'The Cloning Guild': 'cloneCommandos', 'United Planets Space Authority': 'starDestroyer', 'Artificial Intelligence Alliance': 'droidDreadnought', 'The Antislavers': 'liberators', 'The Unchained': 'liberators',
  'The Ashen Clans': 'ashBerserkers', 'The Dominion': 'dominionWalkers', 'The Witchmaidens': 'hexSisters', 'The Free Planets': 'militiaStarhawks', 'Cult of Zithari': 'zithariWarblades',
  'The Gray Order': 'grayWardens', 'The Free Pirates': 'corsairSwarm', 'The Forgotten Fleet': 'ghostDreadnought', 'Barbarians': 'raiderHorde', 'Generic Pirates': 'junkGunboats',
};

const COLS = 9, ROWS = 12;
const rnd = a => a[Math.floor(Math.random() * a.length)];
const cheb = (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));

// Squad: one counter on the board representing `n` units of one type.
export function mkSquad(key, n, side, mult = 1, extra = {}) {
  const U = UNITS[key];
  const hp = Math.round(U.hp * Math.max(1, n) * (key === 'cruiser' || key === 'station' || key === 'hero' || key === 'bunker' ? 1 : 0.55));
  const sh = Math.round((U.sh || 0) * Math.max(1, n) * (key === 'cruiser' || key === 'station' ? 1 : 0.55));
  return { key, n, side, name: U.n, ic: U.ic, hp, maxhp: hp, sh, maxsh: sh, atk: U.atk * Math.max(1, n) * (key === 'cruiser' || key === 'station' || key === 'hero' || key === 'bunker' ? 1 : 0.55) * mult, rng: U.rng, mv: U.mv, tags: [...U.tags], dark: U.tags.includes('dark'), moved: false, acted: false, dug: false, alpha: false, rammed: false, ...extra };
}

function genMap(kind) {
  const t = [];
  for (let y = 0; y < ROWS; y++) {
    t.push([]);
    for (let x = 0; x < COLS; x++) t[y].push('.');
  }
  const blob = (ch, n, r) => { for (let i = 0; i < n; i++) { const cx = 1 + Math.floor(Math.random() * (COLS - 2)), cy = 3 + Math.floor(Math.random() * (ROWS - 6)); for (let y = cy - r; y <= cy + r; y++) for (let x = cx - r; x <= cx + r; x++) if (t[y]?.[x] && Math.random() < 0.7) t[y][x] = ch; } };
  if (kind === 'space') { blob('a', 3, 1); blob('n', 2, 1); }
  else { blob('f', 3, 1); blob('h', 2, 1); blob('r', 2, 0); blob('w', 1, 0); }
  return t;
}
const TERR = {
  '.': { c: '#071426' }, a: { c: '#3a3226', n: 'Asteroids', cover: 0.4, cost: 2 }, n: { c: '#3a1450', n: 'Nebula', hide: 1, cost: 1 },
  f: { c: '#123a1a', n: 'Forest', cover: 0.35, cost: 2 }, h: { c: '#4a3a1a', n: 'Hills', rngB: 1, cost: 2 }, r: { c: '#3a3a44', n: 'Ruins', cover: 0.45, cost: 2 }, w: { c: '#0a2a5a', n: 'Water', block: 1 },
};

export function tacticalBattle(o) {
  // o: { kind, title, A:{name,color,squads}, D:{...}, player:'A'|'D' }
  return new Promise(resolve => {
    const kind = o.kind, map = genMap(kind), me = o.player, foe = me === 'A' ? 'D' : 'A';
    const all = [];
    const place = (side, list) => {
      const rows = side === 'D' ? [1, 0, 2] : [ROWS - 2, ROWS - 1, ROWS - 3];
      let i = 0;
      list.forEach(s => {
        let ok = false;
        for (let tries = 0; tries < 60 && !ok; tries++) {
          const y = rows[Math.floor(i / COLS) % 3], x = (i * 3 + 1 + tries) % COLS;
          if (!all.some(q => q.x === x && q.y === y) && !TERR[map[y][x]].block) { s.x = x; s.y = y; ok = true; }
        }
        if (!ok) { s.x = 0; s.y = rows[0]; }
        map[s.y][s.x] = '.';
        all.push(s);
        i++;
      });
    };
    const centerFirst = l => [...l].sort((a, b) => (b.maxhp - a.maxhp));
    place('D', centerFirst(o.D.squads));
    place('A', centerFirst(o.A.squads));
    const start = { A: o.A.squads.reduce((t, s) => t + s.maxhp, 0) || 1, D: o.D.squads.reduce((t, s) => t + s.maxhp, 0) || 1 };
    let round = 1, sel = null, mode = 'move', busy = false, logLines = [];
    const MAXR = 12;

    // ---------- DOM ----------
    const wrap = document.createElement('div');
    wrap.id = 'tac';
    wrap.innerHTML = `<div class="tac-top"><b>${o.title}</b><span id="tacR"></span></div><canvas id="tacC"></canvas><div id="tacInfo"></div><div id="tacBtns"></div><div id="tacLog"></div>`;
    document.body.appendChild(wrap);
    const cv = wrap.querySelector('#tacC'), g = cv.getContext('2d');
    const info = wrap.querySelector('#tacInfo'), btns = wrap.querySelector('#tacBtns'), logEl = wrap.querySelector('#tacLog');
    let cs = 32;
    const resize = () => {
      const w = Math.min(innerWidth - 8, 560), h = innerHeight * 0.56;
      cs = Math.floor(Math.min(w / COLS, h / ROWS));
      const dpr = Math.min(2, devicePixelRatio || 1);
      cv.width = cs * COLS * dpr; cv.height = cs * ROWS * dpr;
      cv.style.width = cs * COLS + 'px'; cv.style.height = cs * ROWS + 'px';
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    };
    const say = m => { logLines.unshift(m); logLines = logLines.slice(0, 4); logEl.innerHTML = logLines.map(l => `<div>${l}</div>`).join(''); };

    // ---------- rules ----------
    const alive = side => all.filter(s => s.side === side && s.hp > 0);
    const at = (x, y) => all.find(s => s.hp > 0 && s.x === x && s.y === y);
    const terr = s => TERR[map[s.y][s.x]];
    // Visibility: dark ships and nebula-hidden ships are only seen at close range.
    const seen = (s, by) => {
      if (s.side === by) return true;
      const near = alive(by).some(e => cheb(e, s) <= (s.dark ? 2 : 1));
      if (s.dark) return near;
      if (terr(s).hide) return near;
      return true;
    };
    const reach = s => {
      if (s.mv <= 0 || s.moved) return new Map();
      const out = new Map([[s.x + ',' + s.y, 0]]), q = [[s.x, s.y, 0]];
      while (q.length) {
        const [x, y, c] = q.shift();
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]) {
          const nx = x + dx, ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS) continue;
          const T = TERR[map[ny][nx]];
          if (T.block && !s.tags.includes('jump')) continue;
          const nc = c + (s.tags.includes('jump') ? 1 : T.cost || 1);
          if (nc > s.mv) continue;
          const k = nx + ',' + ny;
          if (out.has(k) && out.get(k) <= nc) continue;
          const occ = at(nx, ny);
          if (occ && occ.side !== s.side) continue;
          out.set(k, nc);
          q.push([nx, ny, nc]);
        }
      }
      for (const k of [...out.keys()]) { const [x, y] = k.split(',').map(Number); if (at(x, y) && !(x === s.x && y === s.y)) out.delete(k); }
      return out;
    };
    const range = s => s.rng + (terr(s).rngB || 0);
    const canFire = s => !s.acted && !s.dark && !(s.tags.includes('arty') && s.moved) && s.atk > 0;
    const targets = s => (canFire(s) ? alive(s.side === 'A' ? 'D' : 'A').filter(e => seen(e, s.side) && cheb(s, e) <= range(s)) : []);
    function damage(src, dst, k = 1, opts = {}) {
      let d = src.atk * (0.55 + 0.45 * src.hp / src.maxhp) * (0.8 + Math.random() * 0.4) * k;
      if (src.alpha) { d *= 2; src.alpha = false; say(`💥 ${src.name} unmasks with an alpha strike!`); }
      if (cheb(src, dst) > 1 && terr(dst).cover) d *= 1 - terr(dst).cover;
      if (dst.dug) d *= 0.6;
      if (dst.tags.includes('heavy') && !src.tags.includes('heavy') && !src.tags.includes('arty')) d *= 0.75;
      if (src.tags.includes('melee') && cheb(src, dst) === 1) d *= 1.3;
      if (dst.tags.includes('hero') && Math.random() < 0.3) { d *= 0.3; say(`✨ ${dst.name} deflects the fire with a Starblade!`); }
      if (opts.ion) { const s0 = dst.sh; dst.sh = 0; say(`⚡ Ion burst strips ${Math.round(s0)} shields from ${dst.name}.`); return; }
      // Fighters slip most of their damage under the shields
      const pierce = src.tags.includes('fighter') ? 0.75 : 0;
      if (dst.sh > 0) { const absorb = Math.min(dst.sh, d * (1 - pierce)); dst.sh -= absorb; d -= absorb; }
      d = Math.max(0, d);
      dst.hp -= d;
      if (dst.dark) { dst.dark = false; }
      if (dst.hp <= 0) { dst.hp = 0; say(`☠ ${dst.name} ${kind === 'space' ? 'is destroyed' : 'is wiped out'}!`); }
      else if (!opts.quiet) say(`${src.ic} ${src.name} hits ${dst.name} for ${Math.round(d)}.`);
    }
    function attack(src, dst) {
      damage(src, dst);
      src.acted = true;
      // return fire at close range (not from artillery/stations being bombarded at range)
      if (dst.hp > 0 && !dst.dark && cheb(src, dst) <= range(dst) && cheb(src, dst) <= 2 && dst.atk > 0) damage(dst, src, 0.5, { quiet: true });
    }
    function ram(src, dst) {
      say(`🌠 ${src.name} jumps to lightspeed straight through ${dst.name}!`);
      dst.hp -= src.maxhp * 1.6 + src.hp;
      all.filter(e => e.hp > 0 && e !== dst && e.side === dst.side && cheb(e, dst) <= 1).forEach(e => { e.hp -= src.maxhp * 0.4; if (e.hp <= 0) { e.hp = 0; say(`☠ ${e.name} is torn apart in the wake.`); } });
      if (dst.hp <= 0) { dst.hp = 0; say(`☠ ${dst.name} is annihilated!`); }
      src.hp = 0; src.rammed = true;
    }
    const abilities = s => {
      const a = [];
      if (s.hp <= 0 || s.side !== me) return a;
      if (kind === 'space') {
        if (s.tags.includes('cloak') && !s.acted) a.push(s.dark ? ['🌑 Light Up', 'unmask; next shot is an alpha strike'] : ['🌑 Go Dark', 'cut power: invisible beyond 2 tiles, no shields, no firing']);
        if (s.maxsh > 0 && !s.acted && !s.dark) a.push(['🛡 Divert to Shields', 'restore 50% shields']);
        if (s.tags.includes('ion') && !s.acted && !s.dark) a.push(['⚡ Ion Burst', 'strip a target\'s shields (range)']);
        if (s.tags.includes('ram') && !s.acted) a.push(['🌠 Hyperspace Ram', 'sacrifice this ship to obliterate a target']);
      } else {
        if (!s.acted && !s.dug && s.mv > 0) a.push(['⛏ Dig In', '-40% damage taken until it moves']);
        if (s.tags.includes('melee') && !s.acted && !s.moved) a.push(['⚡ Charge', 'move +1 then strike in melee at x1.5']);
        if (s.tags.includes('heal') && !s.acted) a.push(['✚ Mend', 'heal adjacent allies']);
        if (s.tags.includes('hero') && !s.acted) a.push(['⚔ Duel', 'challenge an adjacent enemy hero/unit to single combat']);
      }
      return a;
    };

    // ---------- drawing ----------
    function draw() {
      const W = cs * COLS, H = cs * ROWS;
      g.clearRect(0, 0, W, H);
      for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
        const T = TERR[map[y][x]];
        g.fillStyle = T.c; g.fillRect(x * cs, y * cs, cs, cs);
        g.strokeStyle = 'rgba(80,160,255,.12)'; g.strokeRect(x * cs + 0.5, y * cs + 0.5, cs - 1, cs - 1);
        if (map[y][x] === 'a') { g.fillStyle = '#6a5a44'; for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(x * cs + cs * (0.25 + 0.25 * i), y * cs + cs * (0.3 + 0.2 * (i % 2)), cs * 0.1, 0, 7); g.fill(); } }
        if (map[y][x] === 'f') { g.fillStyle = '#1f6a2a'; g.beginPath(); g.arc(x * cs + cs / 2, y * cs + cs / 2, cs * 0.3, 0, 7); g.fill(); }
        if (map[y][x] === 'r') { g.fillStyle = '#5a5a66'; g.fillRect(x * cs + cs * 0.2, y * cs + cs * 0.3, cs * 0.25, cs * 0.5); g.fillRect(x * cs + cs * 0.55, y * cs + cs * 0.45, cs * 0.25, cs * 0.35); }
      }
      if (kind === 'space') { g.fillStyle = 'rgba(255,255,255,.5)'; for (let i = 0; i < 40; i++) g.fillRect((i * 97) % W, (i * 53) % H, 1, 1); }
      if (sel && sel.side === me && sel.hp > 0) {
        if (mode === 'move' || mode === 'charge') {
          const r = reach(sel);
          if (mode === 'charge') { sel.mv++; const r2 = reach(sel); sel.mv--; r2.forEach((v, k) => r.set(k, v)); }
          g.fillStyle = 'rgba(80,255,140,.18)';
          r.forEach((v, k) => { const [x, y] = k.split(',').map(Number); g.fillRect(x * cs, y * cs, cs, cs); });
        }
        const tg = mode === 'ion' ? alive(foe).filter(e => seen(e, me) && cheb(sel, e) <= range(sel)) : mode === 'ram' ? alive(foe).filter(e => seen(e, me)) : mode === 'duel' ? alive(foe).filter(e => cheb(sel, e) === 1) : targets(sel);
        g.strokeStyle = mode === 'ram' ? '#ff9a2a' : '#ff4a4a'; g.lineWidth = 2;
        tg.forEach(e => g.strokeRect(e.x * cs + 2, e.y * cs + 2, cs - 4, cs - 4));
        g.lineWidth = 1;
      }
      all.forEach(s => {
        if (s.hp <= 0) return;
        const vis = seen(s, me);
        if (!vis) return;
        const cx = s.x * cs + cs / 2, cy = s.y * cs + cs / 2;
        g.globalAlpha = s.dark ? 0.45 : 1;
        g.fillStyle = s.side === 'A' ? o.A.color : o.D.color;
        g.beginPath(); g.arc(cx, cy, cs * 0.42, 0, 7); g.fill();
        g.strokeStyle = s === sel ? '#fff' : s.side === me ? '#9fe0ff' : '#ff8080'; g.lineWidth = s === sel ? 3 : 1.5; g.stroke(); g.lineWidth = 1;
        if (s.sh > 0) { g.strokeStyle = 'rgba(120,200,255,.8)'; g.beginPath(); g.arc(cx, cy, cs * 0.48, 0, 7 * (s.sh / s.maxsh)); g.stroke(); }
        g.font = `${Math.floor(cs * 0.48)}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#fff';
        g.fillText(s.ic, cx, cy + 1);
        g.globalAlpha = 1;
        g.fillStyle = '#300'; g.fillRect(s.x * cs + 3, s.y * cs + cs - 6, cs - 6, 4);
        g.fillStyle = s.hp / s.maxhp > 0.5 ? '#4f4' : s.hp / s.maxhp > 0.25 ? '#fd4' : '#f44';
        g.fillRect(s.x * cs + 3, s.y * cs + cs - 6, (cs - 6) * s.hp / s.maxhp, 4);
        if (s.side === me && (s.acted || (s.moved && !targets(s).length))) { g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(s.x * cs, s.y * cs, cs, cs); }
        if (s.dug) { g.fillStyle = '#ffd76a'; g.font = `${Math.floor(cs * 0.3)}px sans-serif`; g.fillText('⛏', s.x * cs + cs * 0.82, s.y * cs + cs * 0.2); }
      });
      const hpA = alive('A').reduce((t, s) => t + s.hp, 0), hpD = alive('D').reduce((t, s) => t + s.hp, 0);
      wrap.querySelector('#tacR').textContent = `Round ${round}/${MAXR} · ${me === 'A' ? 'You' : 'Enemy'} ${Math.round(hpA / start.A * 100)}% · ${me === 'D' ? 'You' : 'Enemy'} ${Math.round(hpD / start.D * 100)}%`;
    }
    function panel() {
      btns.innerHTML = '';
      const b = (t, fn, cls) => { const e = document.createElement('button'); e.textContent = t; if (cls) e.className = cls; e.onclick = () => { if (!busy) fn(); }; btns.appendChild(e); };
      if (sel && sel.hp > 0) {
        const T = terr(sel);
        info.innerHTML = `<b>${sel.ic} ${sel.name}</b>${sel.n > 1 ? ' ×' + sel.n : ''} · HP ${Math.round(sel.hp)}/${sel.maxhp}${sel.maxsh ? ` · 🛡 ${Math.round(sel.sh)}/${sel.maxsh}` : ''} · ATK ${Math.round(sel.atk)} · RNG ${range(sel)} · MV ${sel.mv}${T.n ? ' · on ' + T.n : ''}${sel.dark ? ' · 🌑 RUNNING DARK' : ''}${sel.side !== me ? ' · <span style="color:#f88">enemy</span>' : ''}`;
        if (sel.side === me) {
          abilities(sel).forEach(([n, d]) => b(n, () => useAbility(sel, n)));
          if (mode !== 'move') b('↩ Cancel', () => { mode = 'move'; draw(); panel(); });
        }
      } else info.innerHTML = kind === 'space'
        ? '<small>Tap a ship, then a green tile to move or a red-ringed enemy to fire. 🌑 Go Dark hides ships beyond 2 tiles (and grants an alpha strike when they light up). Nebulae hide ships; asteroids give cover. 🌠 Ram sacrifices a capital ship.</small>'
        : '<small>Tap a unit, then a green tile to move or a red-ringed enemy to fire. Forest & ruins give cover, hills extend range, water blocks. Dig in to hold; charge with melee troops.</small>';
      b('⏭ End Turn', endTurn, 'tac-end');
      b('⚙ Auto-Finish', () => autoFinish());
      b('🏳 Retreat', () => finish(true));
    }
    function useAbility(s, n) {
      if (n.includes('Go Dark')) { s.dark = true; s.sh = 0; s.acted = true; say(`🌑 ${s.name} cuts power and vanishes from sensors.`); }
      else if (n.includes('Light Up')) { s.dark = false; s.alpha = true; say(`🌕 ${s.name} powers up — weapons hot.`); }
      else if (n.includes('Shields')) { s.sh = Math.min(s.maxsh, s.sh + s.maxsh * 0.5); s.acted = true; say(`🛡 ${s.name} diverts power to shields.`); }
      else if (n.includes('Dig In')) { s.dug = true; s.acted = true; s.moved = true; say(`⛏ ${s.name} digs in.`); }
      else if (n.includes('Mend')) { all.filter(e => e.hp > 0 && e.side === s.side && cheb(e, s) <= 1).forEach(e => { e.hp = Math.min(e.maxhp, e.hp + e.maxhp * 0.2); }); s.acted = true; say(`✚ ${s.name} mends nearby allies.`); }
      else if (n.includes('Ion')) mode = 'ion';
      else if (n.includes('Ram')) mode = 'ram';
      else if (n.includes('Charge')) mode = 'charge';
      else if (n.includes('Duel')) mode = 'duel';
      draw(); panel(); check();
    }
    function tap(ev) {
      if (busy) return;
      const r = cv.getBoundingClientRect();
      const x = Math.floor((ev.clientX - r.left) / cs), y = Math.floor((ev.clientY - r.top) / cs);
      if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return;
      const u = at(x, y);
      if (sel && sel.side === me && sel.hp > 0) {
        if (mode === 'ion' && u && u.side === foe && seen(u, me) && cheb(sel, u) <= range(sel)) { damage(sel, u, 1, { ion: true }); sel.acted = true; mode = 'move'; return after(); }
        if (mode === 'ram' && u && u.side === foe && seen(u, me)) { ram(sel, u); mode = 'move'; sel = null; return after(); }
        if (mode === 'duel' && u && u.side === foe && cheb(sel, u) === 1) {
          const win = Math.random() < 0.5 + (sel.atk - u.atk / Math.max(1, u.n)) * 0.01;
          if (win) { u.hp -= u.maxhp * 0.6; say(`⚔ ${sel.name} wins the duel! The enemy line wavers.`); if (u.hp <= 0) { u.hp = 0; say(`☠ ${u.name} falls.`); } }
          else { sel.hp -= sel.maxhp * 0.45; say(`⚔ ${sel.name} is wounded in the duel.`); if (sel.hp <= 0) sel.hp = 0; }
          sel.acted = true; mode = 'move'; return after();
        }
        if (u && u.side === foe && targets(sel).includes(u)) { if (mode === 'charge') { damage(sel, u, 1.5); sel.acted = true; mode = 'move'; } else attack(sel, u); return after(); }
        if (!u && (mode === 'move' || mode === 'charge')) {
          let rch = reach(sel);
          if (mode === 'charge') { sel.mv++; rch = reach(sel); sel.mv--; }
          if (rch.has(x + ',' + y)) {
            sel.x = x; sel.y = y; sel.moved = true; sel.dug = false;
            if (mode === 'charge') { const adj = alive(foe).filter(e => cheb(e, sel) === 1 && seen(e, me)); if (adj.length) { damage(sel, rnd(adj), 1.5); } sel.acted = true; mode = 'move'; }
            return after();
          }
        }
      }
      if (u && (u.side === me || seen(u, me))) { sel = u; mode = 'move'; }
      else { sel = null; mode = 'move'; }
      draw(); panel();
    }
    function after() { draw(); panel(); check(); }
    function check() {
      if (!alive('A').length || !alive('D').length) { setTimeout(() => finish(false), 600); return true; }
      return false;
    }

    // ---------- enemy AI ----------
    async function aiSide(side) {
      const enemy = side === 'A' ? 'D' : 'A';
      for (const s of alive(side)) {
        if (s.hp <= 0) continue;
        if (!alive(enemy).length) break;
        const vis = alive(enemy).filter(e => seen(e, side));
        // Running dark: wait until a target drifts close, then light up for the alpha strike
        if (s.dark) {
          if (vis.some(e => cheb(e, s) <= range(s) + 1) || Math.random() < 0.25) { s.dark = false; s.alpha = true; }
          else continue;
        }
        if (kind === 'space' && s.tags.includes('cloak') && s.hp < s.maxhp * 0.3 && Math.random() < 0.3) { s.dark = true; s.sh = 0; say(`🌑 An enemy ship goes dark…`); continue; }
        if (s.tags.includes('ram') && s.hp < s.maxhp * 0.3 && vis.length && Math.random() < 0.35) { ram(s, vis.sort((a, b) => b.hp - a.hp)[0]); draw(); await wait(450); continue; }
        if (!vis.length) { // search toward the enemy deployment zone
          const r = reach(s); let best = null, bd = 1e9;
          r.forEach((v, k) => { const [x, y] = k.split(',').map(Number); const d = Math.abs(y - (side === 'D' ? ROWS - 1 : 0)) + Math.random(); if (d < bd) { bd = d; best = [x, y]; } });
          if (best) { s.x = best[0]; s.y = best[1]; s.moved = true; }
          continue;
        }
        let tgt = vis.sort((a, b) => cheb(s, a) - cheb(s, b) || a.hp - b.hp)[0];
        if (s.tags.includes('ion') && tgt.sh > tgt.maxsh * 0.5 && cheb(s, tgt) <= range(s) && Math.random() < 0.4) { damage(s, tgt, 1, { ion: true }); s.acted = true; draw(); await wait(350); continue; }
        if (!targets(s).length && s.mv > 0 && !(s.tags.includes('arty') && targets(s).length)) {
          const r = reach(s); let best = null, bd = 1e9;
          r.forEach((v, k) => {
            const [x, y] = k.split(',').map(Number);
            const p = { x, y };
            let d = Math.abs(cheb(p, tgt) - Math.max(1, Math.min(range(s), s.tags.includes('melee') ? 1 : range(s))));
            d -= (TERR[map[y][x]].cover || 0) * 1.5;
            if (d < bd) { bd = d; best = [x, y]; }
          });
          if (best && (best[0] !== s.x || best[1] !== s.y)) { s.x = best[0]; s.y = best[1]; s.moved = true; s.dug = false; draw(); await wait(220); }
        }
        const tg = targets(s);
        if (tg.length) { tgt = tg.sort((a, b) => a.hp - b.hp)[0]; attack(s, tgt); draw(); await wait(320); }
        else if (s.maxsh && s.sh < s.maxsh * 0.5) { s.sh = Math.min(s.maxsh, s.sh + s.maxsh * 0.5); }
        else if (kind === 'land' && !s.moved && s.mv > 0 && Math.random() < 0.3) s.dug = true;
      }
    }
    const wait = ms => new Promise(r => setTimeout(r, ms));
    async function endTurn() {
      busy = true; sel = null; mode = 'move';
      await aiSide(foe);
      if (check()) return;
      round++;
      all.forEach(s => { s.moved = false; s.acted = false; if (s.key === 'abyssalCruiser' && s.hp > 0) s.sh = Math.min(s.maxsh, s.sh + s.maxsh * 0.25); });
      busy = false;
      if (round > MAXR) return finish(false);
      draw(); panel();
    }
    async function autoFinish() {
      busy = true; sel = null;
      while (round <= MAXR && alive('A').length && alive('D').length) {
        await aiSide(me); if (!alive(foe).length) break;
        await aiSide(foe);
        round++;
        all.forEach(s => { s.moved = false; s.acted = false; });
        draw();
        await wait(120);
      }
      finish(false);
    }
    let done = false;
    function finish(retreat) {
      if (done) return;
      done = true;
      const hp = side => alive(side).reduce((t, s) => t + s.hp, 0);
      let aF = hp('A') / start.A, dF = hp('D') / start.D;
      if (retreat) { if (me === 'A') aF *= 0.85; else dF *= 0.85; }
      const win = retreat ? me === 'D' : (dF <= 0.001 ? true : aF <= 0.001 ? false : aF > dF * 1.1);
      const genLost = side => all.some(s => s.side === side && s.hp <= 0 && (s.key === 'hero' || s.flag));
      const youWon = (me === 'A') === win;
      wrap.querySelector('#tacBtns').innerHTML = '';
      info.innerHTML = `<h3>${retreat ? 'RETREAT' : youWon ? 'VICTORY' : 'DEFEAT'}</h3>`;
      const ok = document.createElement('button'); ok.textContent = 'Continue';
      ok.onclick = () => { removeEventListener('resize', resize); wrap.remove(); resolve({ win, a: Math.max(0, Math.min(1, aF)), d: Math.max(0, Math.min(1, dF)), aGenLost: genLost('A'), dGenLost: genLost('D'), retreat }); };
      btns.appendChild(ok);
    }
    cv.addEventListener('pointerdown', tap);
    addEventListener('resize', resize);
    resize(); panel();
    say(kind === 'space' ? '⚔ Battle stations! The enemy fleet closes.' : '⚔ Troops deployed. The enemy line approaches.');
  });
}
