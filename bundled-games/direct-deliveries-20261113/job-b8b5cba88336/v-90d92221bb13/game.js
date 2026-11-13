// Game states, main loop, cameras, rules and the guardian fight. Entry point (bottom of the file).
import { CONFIG } from './config.js';
import { Renderer, Node, Mesh, BasicMaterial, Camera, plane, Vec3, clamp, damp, dampAngle, angleDiff, wrapAngle, lerp } from './engine.js';
import { makeTextures, makeMaterials, makeBillboardMaterial, FX } from './graphics.js';
import { generateLevel, Tower, World, PATH, R, polar, setPathRadius } from './tower.js';
import { KnightModel, SwordTrail, Player } from './hero.js';
import { Items, createEnemy, Fireball } from './enemies.js';
import { BossArena, ARENA_RP, CANNON_RELOAD, CRATE_RESPAWN, bombModel } from './arena.js';
import { createBoss, Telegraph, Runner, Faller, Shot, Pool, Missile } from './bosses.js';
import { Input, UI } from './ui.js';
import { AudioManager } from './audio.js';

// ======================================================================
// GAME
// ======================================================================
// Sir Falls-A-Lot: Castle Climber. Game state machine, loop, camera and gameplay rules.
// Flow: climb the tower -> unlock the gate -> fight the tower's guardian in its hall -> next tower.

const CAUSES = {
    lava: 'THE LAVA CONSUMED YOU',
    skeleton: 'CUT DOWN BY A SKELETON',
    rat: 'GNAWED BY A PLAGUE RAT',
    bat: 'DRAINED BY A BAT',
    spider: 'BITTEN BY A TOWER SPIDER',
    fire: 'BURNED BY DRAGONFIRE'
};
const KILL_TEXT = ['CRUSHED BY THE BONE TYRANT', 'DEVOURED BY THE BROOD MOTHER', 'BURNED BY THE ASH WYRM'];
const RAGE_TEXT = ['THE TYRANT IS ENRAGED', 'THE BROOD MOTHER SHRIEKS', 'THE WYRM IS ENRAGED'];
const NOINPUT = { x: 0, jumpPressed: false, jumpHeld: false, attackPressed: false, enterPressed: false, down: false, downPressed: false };
const ARENA_FOV = 62 * Math.PI / 180;
// damage dealt to a guardian
const DMG = { hit: 2, reflect: 3, bomb: 4, cannon: 6, smash: 4, megaSmash: 6 };
// combo: every 4 chained actions raise the multiplier (max x8)
const COMBO_TIME = 2.6, COMBO_STEP = 4, COMBO_MAX = 8;
const COMBO_WORDS = ['', '', 'NICE!', 'GREAT!', 'AWESOME!', 'EPIC!', 'LEGENDARY!', 'GODLIKE!', 'SIR SMASH-A-LOT!'];
const SPLAT_WORDS = ['OUCH!', 'BONK!', 'OOF!', 'SPLAT!', 'CLANG!', 'THUD!', 'MY NOSE!'];
const INTRO_END = 6.7;
const FALL_VOICE_MIN_DROP = 9; // only speak on a genuinely high fall

export class Game {
    constructor() {
        this.audio = AudioManager;
        try { if (localStorage.getItem('sfal-muted') === '1') this.audio.setMuted(true); } catch (_) { }
        this.input = new Input();
        this.canvas = document.getElementById('gl');
        this.ui = new UI(this);
        try {
            this.renderer = new Renderer(this.canvas, { post: true });
        } catch (e) {
            this.ui.error('This device or browser does not support WebGL 2, which the 3D tower needs. Try a recent Chrome, Safari or Firefox.');
            return;
        }
        this.mobile = this.ui.touchMode;
        this.quality = this.mobile ? 0 : 1;
        this.dpr = Math.min(window.devicePixelRatio || 1, this.mobile ? 1.5 : 1.5);
        this.camera = new Camera(CONFIG.FOV, 0.3, 1600);
        this.baseFov = CONFIG.FOV * Math.PI / 180;
        this.state = 'loading';
        this.time = 0;
        this.shake = 0;
        this.hitstop = 0;
        this.slowmo = 0;
        this.best = 0;
        try { this.best = +(localStorage.getItem('sfal-best') || 0); } catch (_) { }
        this._frameTimes = [];
        this._tmp = new Vec3(); this._tmp2 = new Vec3(); this._tmp3 = new Vec3();
        this.onResize = () => this.resize();
        window.addEventListener('resize', this.onResize);
        window.visualViewport?.addEventListener('resize', this.onResize);
        if (window.ResizeObserver) {
            this.resizeObserver = new ResizeObserver(this.onResize);
            this.resizeObserver.observe(document.getElementById('app'));
        }
        document.addEventListener('visibilitychange', () => { if (document.hidden && (this.state === 'play' || this.state === 'boss')) this.pause(); });
        this.input.onAnyKey = (e) => {
            if (this.state === 'menu' && (e.code === 'Enter' || e.code === 'Space') && document.getElementById('howto').classList.contains('hidden') && document.getElementById('credits').classList.contains('hidden')) this.startGame();
            else if (this.state === 'deadScreen' && (e.code === 'Enter' || e.code === 'Space')) this.retry();
            else if (this.state === 'winScreen' && (e.code === 'Enter' || e.code === 'Space')) this.nextLevel();
            else if (this.state === 'paused' && (e.code === 'Escape' || e.code === 'KeyP')) this.resume();
            else if (this.state === 'intro' && !e.repeat && this.introT > 0.5) this._skipIntro = true;
        };
        document.addEventListener('pointerdown', () => { if (this.state === 'intro' && this.introT > 0.5) this._skipIntro = true; });
        requestAnimationFrame(() => setTimeout(() => this._init(), 20));
    }

    _init() {
        this.resize();
        this.T = makeTextures(this.quality);
        this.M = makeMaterials(this.T);
        this.scene = new Node();
        this.world = new World(this.renderer, this.T, this.M, this.quality);
        this.world.onThunder = () => this.audio.sfx('thunder');
        this.scene.add(this.world.root);
        this.fireGlow = makeBillboardMaterial(this.T.glow, [1.0, 0.45, 0.12], 'fireglow');
        this.fireGlow.uniforms.uStrength = 1.3;
        Telegraph.beamTex = this.T.beam;
        this._ringGeo = plane(1, 1); this._ringGeo.shared = true;
        this.runFalls = 0; this.runFallM = 0;
        this._applyTowerEnv();
        this.level = 1; this.score = 0; this.lives = CONFIG.START_LIVES;
        this.toMenu();
        this.ui.loaded();
        this.ui.setBest(this.best);
        this.last = performance.now();
        const loop = (now) => { requestAnimationFrame(loop); this.frame(now); };
        requestAnimationFrame(loop);
    }

    // dark, blood-lit night around the tower
    _applyTowerEnv() {
        const e = this.renderer.env;
        e.fogColor = [0.115, 0.028, 0.032];
        e.fogDensity = 0.0115;
        e.hemiSky = [0.04, 0.035, 0.065];
        e.hemiGround = [0.06, 0.022, 0.016];
        e.dirColor = [0.15, 0.115, 0.2];
        e.envTop = [0.1, 0.08, 0.14];
        e.envBottom = [0.45, 0.13, 0.04];
        e.rimColor = [0.42, 0.16, 0.22];
        e.lavaGlow = [0.9, 0.26, 0.05];
        e.exposure = 1.1;
        this.renderer.clearColor = [0.08, 0.02, 0.02];
        const pp = this.renderer.post;
        pp.vignette = 0.46; pp.saturation = 1.1; pp.contrast = 1.07; pp.lift = [0.012, 0.0, 0.025]; pp.gain = [1.04, 0.98, 0.96];
        this.world.root.visible = true;
    }
    // the guardian's hall: black air, fire bowls, a glowing pit
    _applyArenaEnv(theme) {
        const e = this.renderer.env;
        e.fogColor = [0.05, 0.012, 0.02];
        e.fogDensity = 0.0125;
        e.hemiSky = [0.05, 0.04, 0.075];
        e.hemiGround = [0.07, 0.02, 0.02];
        e.dirColor = [0.14, 0.11, 0.2];
        e.envTop = [0.08, 0.06, 0.12];
        e.envBottom = [0.3, 0.08, 0.05];
        e.rimColor = [theme.glow[0] * 0.45, theme.glow[1] * 0.45, theme.glow[2] * 0.45];
        e.lavaGlow = [theme.glow[0] * 0.55, theme.glow[1] * 0.55, theme.glow[2] * 0.55];
        e.lavaY = -7;
        e.exposure = 1.1;
        this.renderer.clearColor = [0.03, 0.008, 0.012];
        const pp = this.renderer.post;
        pp.vignette = 0.55; pp.saturation = 1.12; pp.contrast = 1.08;
        this.world.root.visible = false;
    }

    resize() {
        // Use the displayed canvas dimensions, not the browser's layout viewport:
        // these can differ on mobile and inside an embedded game frame.
        const { width: w, height: h } = this.canvas.getBoundingClientRect();
        if (this.renderer && w > 0 && h > 0) {
            this.renderer.setSize(w, h, this.dpr);
            this.renderer.post.inkPx = clamp(this.dpr * 0.95, 1, 1.6);
            this._applyResponsiveFov();
        }
    }

    _setBaseFov(fov) {
        this.baseFov = fov;
        this._applyResponsiveFov();
    }

    _applyResponsiveFov() {
        if (!this.camera || !this.renderer || !this.baseFov) return;
        const aspect = this.renderer.width / Math.max(1, this.renderer.height);
        // Ultra-tall screens need a tighter vertical crop: compensating the full
        // aspect ratio reveals too much tower above and below the action.
        const compensation = clamp(Math.sqrt((9 / 16) / aspect), 1, 1.3);
        this.camera.fov = 2 * Math.atan(Math.tan(this.baseFov / 2) * compensation);
    }

    // ---------------------------------------------------------------- level
    // free the GPU buffers of something removed from the scene mid-level
    _disposeTree(node) {
        const seen = new Set();
        node.traverse(n => {
            this.renderer.disposeObject(n);
            if (n.geometry && !n.geometry.shared && !seen.has(n.geometry)) { seen.add(n.geometry); this.renderer.disposeGeometry(n.geometry); }
        });
    }

    _disposeLevel() {
        if (!this.levelRoot) return;
        this.scene.remove(this.levelRoot);
        const seen = new Set();
        this.levelRoot.traverse(n => {
            this.renderer.disposeObject(n);
            if (n.geometry && !n.geometry.shared && !seen.has(n.geometry)) { seen.add(n.geometry); this.renderer.disposeGeometry(n.geometry); }
        });
        this.levelRoot = null;
        this.ui.clearFloaters();
    }

    _addShadowTo(en) {
        if (en.kind !== 'skeleton' && en.kind !== 'rat') return;
        const sh = new Mesh(plane(1, 1), this.M.shadow);
        sh.rotation.x = -Math.PI / 2; sh.position.y = 0.03;
        const s = en.kind === 'rat' ? 0.9 : 0.8;
        sh.scale.set(s, s * 0.8, 1);
        en.root.add(sh);
    }

    _addKnight(root) {
        this.knight = new KnightModel();
        this.knight.root.scale.set(1.1, 1.1, 1.1);
        root.add(this.knight.root);
        this.trail = new SwordTrail(12);
        root.add(this.trail.mesh);
        this.shadow = new Mesh(plane(1, 1), this.M.shadow);
        this.shadow.frustumCulled = false;
        root.add(this.shadow);
        // soft silhouette cast onto the tower wall behind the knight
        this.wallShadow = new Mesh(plane(1, 1), this.M.shadow);
        this.wallShadow.frustumCulled = false;
        root.add(this.wallShadow);
        this.knight.onClonk = () => this.audio.sfx('clang');
    }

    _buildLevel(level, seed) {
        this._endBoss();
        this._disposeLevel();
        setPathRadius(CONFIG.PATH_RADIUS);
        this._setBaseFov(CONFIG.FOV * Math.PI / 180);
        this.seed = seed;
        const desc = this.desc = generateLevel(level, seed);
        const root = this.levelRoot = new Node();
        this.tower = new Tower(desc, this.M, this.T);
        this.stage = this.tower;
        this.items = new Items(desc, this.M, this.T);
        // enemies must stand on the tower's runtime ledges (not the generator's copies)
        const byId = new Map(this.tower.platforms.map(p => [p.id, p]));
        this.enemies = desc.enemies.map(s => createEnemy(s.platform ? Object.assign({}, s, { platform: byId.get(s.platform.id) }) : s, this.M)).filter(Boolean);
        this.fireballs = [];
        this.fx = new FX(root);
        root.add(this.tower.root, this.items.root);
        for (const en of this.enemies) { root.add(en.root); this._addShadowTo(en); }
        this._addKnight(root);
        this.scene.add(root);
        this.player = new Player(desc.startTheta, 0);
        this.player.platform = this.tower.platforms.find(p => p.type === 'ground');
        this.tower.onCrumble = (p) => {
            const c = polar(p.theta, R + 0.9, p.y - 0.3);
            this.fx.chunk(c, 10, [0.62, 0.5, 0.45], 0.16, 3);
            this.fx.burst('dust', c, 12, { radius: 0.6 });
            this.audio.sfx('crumble');
        };
        this.lavaY = CONFIG.LAVA_START_Y;
        this.lavaActive = false;
        this.greed = 0; this.keys = 0; this.timeStop = 0;
        this.stats = { coins: 0, chests: 0, kills: 0, falls: 0, fallM: 0, bestCombo: 0 };
        this._resetJuice();
        this.camTheta = this.player.theta;
        this.camY = 1;
        this.warnT = 0;
        this.dreadT = 12 + Math.random() * 10;
        this.lockedWarned = false;
        this.tower.exit.unlocked = false;
    }

    // ---------------------------------------------------------------- states
    toMenu() {
        this.ui.hideAllScreens();
        this.ui.setHudVisible(false);
        this.ui.fade(false, 0.01);
        this._buildLevel(1, CONFIG.FIRST_TOWER_SEED);
        this.state = 'menu';
        this.menuT = 0;
        this.ui.show('menu');
        this.ui.setBest(this.best);
        this.audio.playMenuMusic();
        this.input.reset();
    }
    startGame() {
        this.level = 1; this.score = 0; this.lives = CONFIG.START_LIVES;
        this.runFalls = 0; this.runFallM = 0;
        // the opening cinematic plays once per visit; later games start with the countdown
        const intro = !this._introSeen;
        this._introSeen = true;
        this.startLevel(CONFIG.FIRST_TOWER_SEED, intro);
    }
    _seedFor(level) { return (level * 7919 + Math.floor(Math.random() * 100000)) >>> 0; }
    startLevel(seed, intro) {
        this.slowmo = 0; this.hitstop = 0;
        this.bossTries = 0;
        this.ui.hideAllScreens();
        this.ui.hideToast();
        this.ui.fade(false, 0.35);
        this._buildLevel(this.level, seed);
        this.levelStartScore = this.score;
        this.ui.setHudVisible(true);
        this.ui.setBossMode(false);
        this.ui.setLevel(this.level);
        this.ui.setScore(this.score);
        this.ui.setGreed(0);
        this.ui.setHearts(this.player.hp);
        this.ui.setLives(this.lives);
        this.ui.setKey(false);
        this.ui.setFrost(false);
        this.ui.setLavaWarning(false);
        this.ui.setDoorPrompt(false);
        this.ui.setFalls(this.runFalls);
        this.ui.clearPop();
        this.input.reset();
        if (intro) { this._startIntro(); return; }
        this.state = 'countdown';
        this.countT = 3.0;
        this._lastCount = 4;
        this.audio.playGameMusic(this.level);
        this._snapCamera();
    }
    retry() {
        if (this.lives <= 0) { this.startGame(); return; }
        if (this.inBoss) {
            // try the guardian again (the tower stays conquered)
            this.score = this.bossStartScore;
            this.stats = Object.assign({}, this.bossStartStats);
            this.ui.hideAllScreens();
            this._startBossFight();
            return;
        }
        this.score = this.levelStartScore;
        this.startLevel(this.seed);
    }
    nextLevel() {
        this.level++;
        this.startLevel(this._seedFor(this.level));
    }
    pause() {
        if (this.state !== 'play' && this.state !== 'countdown' && this.state !== 'boss' && this.state !== 'bossIntro') return;
        this._prevState = this.state;
        this.state = 'paused';
        this.ui.show('pause');
        this.ui.updateMuteIcons();
        this.audio.duckMusic(true);
    }
    resume() {
        if (this.state !== 'paused') return;
        this.ui.hide('pause'); this.ui.hide('confirm');
        this.state = this._prevState || 'play';
        this.audio.duckMusic(false);
        this.input.reset();
        this.last = performance.now();
    }

    // ---------------------------------------------------------------- loop
    frame(now) {
        let dt = Math.min(0.05, (now - this.last) / 1000);
        this.last = now;
        if (dt <= 0) return;
        this._adaptQuality(dt);
        if (this.state === 'paused') { this.input.endFrame(); return; }
        if (this.hitstop > 0) { this.hitstop -= dt; dt *= 0.08; }
        else if (this.slowmo > 0) { this.slowmo -= dt; dt *= 0.3; }
        this.time += dt;
        this.update(dt);
        this.render(dt);
        this.input.endFrame();
    }

    _adaptQuality(dt) {
        const ft = this._frameTimes;
        ft.push(dt);
        if (ft.length < 90) return;
        const avg = ft.reduce((a, b) => a + b, 0) / ft.length;
        ft.length = 0;
        const pp = this.renderer.post;
        // shed the cheapest-to-lose quality first: AO, then resolution, then AA, then all post
        if (avg > 0.024 && pp.ao > 0) { pp.ao = 0; return; }
        if (avg > 0.026 && this.dpr > 1.0) { this.dpr = Math.max(1.0, this.dpr - 0.25); this.resize(); }
        else if (avg > 0.03 && this.dpr > 0.8) { this.dpr = Math.max(0.8, this.dpr - 0.1); this.resize(); }
        else if (avg > 0.034 && pp.aa > 0) { pp.aa = 0; }
        else if (avg > 0.04 && pp.enabled) { pp.enabled = false; this.renderer._freeTargets(); }
    }

    update(dt) {
        const st = this.state;
        const P = this.player;
        if (st === 'menu') { this._updateMenu(dt); return; }
        if (st === 'intro') { this._updateIntro(dt); return; }
        if (st === 'countdown') {
            this.countT -= dt;
            const n = Math.ceil(this.countT);
            if (n !== this._lastCount && n > 0) { this._lastCount = n; this.ui.center(String(n)); this.audio.sfx('beep', 0); }
            if (this.countT <= 0) {
                this.state = 'play';
                this.ui.center('GO!', false, 0.7);
                this.audio.sfx('beep', 1);
                this.ui.sub('MOVE TO START');
            }
            this._updateWorld(dt, true);
            return;
        }
        if (st === 'play') {
            if (this.input.pausePressed) { this.pause(); return; }
            this._updatePlay(dt);
            return;
        }
        if (st === 'toBoss') { this._updateToBoss(dt); return; }
        if (st === 'bossIntro') {
            if (this.input.pausePressed) { this.pause(); return; }
            this._updateBossIntro(dt);
            return;
        }
        if (st === 'boss') {
            if (this.input.pausePressed) { this.pause(); return; }
            this._updateBoss(dt);
            return;
        }
        if (st === 'bossDying') { this._updateBossDying(dt); return; }
        if (st === 'dying') {
            this.dieT += dt;
            const ev = [];
            P.update(dt, NOINPUT, this.stage, ev);
            if (P.lava && Math.random() < 0.6) {
                const c = polar(P.theta, PATH.r, P.y + 0.5 + Math.random() * 0.6);
                this.fx.emit('fire', c.x, c.y, c.z, (Math.random() - 0.5), 1.5, (Math.random() - 0.5), 1.4);
                if (Math.random() < 0.3) this.fx.emit('smoke', c.x, c.y + 0.5, c.z, 0, 1.2, 0, 1.5);
            }
            if (this.inBoss) this._updateBossScene(dt, true);
            else this._updateWorld(dt, false);
            if (this.dieT > 1.8) this._showDeath();
            return;
        }
        // deadScreen / winScreen: keep the world alive in the background
        if (this.inBoss) this._updateBossScene(dt, false);
        else this._updateWorld(dt, false);
    }

    _updateMenu(dt) {
        this.menuT += dt;
        const t = this.menuT;
        const P = this.player;
        P.facing = 1;
        this.tower.update(dt, this.time);
        const k = this.knight;
        k.root.position.copy(polar(0, PATH.r, 0));
        k.root.rotation.y = Math.sin(t * 0.4) * 0.5;
        k.animate(dt, { speed: 0, grounded: true, vy: 0, attack: (t % 6) > 5 ? ((t % 6) - 5) / CONFIG.ATTACK_TIME * 0.34 : -1, hurt: 0, dead: false, win: false });
        this.shadow.position.copy(polar(0, PATH.r, 0.03));
        this.shadow.rotation.x = -Math.PI / 2; this.shadow.scale.set(0.9, 0.9, 1);
        const ctx = this._ctx(dt, { theta: Math.PI, y: -50, alive: false });
        for (const en of this.enemies) { en.update(dt, ctx); this._cullEnemy(en); }
        this.items.update(dt, this.time, this.camTheta);
        this.fx.update(dt);
        // orbiting camera that climbs and descends along the tower
        const a = 0.35 + t * 0.09;
        const ch = 2.5 + (1 - Math.cos(t * 0.07)) * 0.5 * (this.tower.H * 0.7);
        this.camTheta = a;
        const D = this._camDist() + 4;
        this.camera.position.copy(polar(a, D, ch + 3.2));
        this.camera.target.copy(polar(a, 0.5, ch + 1.2));
        this.camY = ch;
        this._updateEnv(dt, ch);
    }

    _ctx(dt, playerLike) {
        const frozen = this.timeStop > 0;
        return {
            time: this.time, dt,
            player: playerLike || { theta: this.player.theta, y: this.player.y, alive: this.player.alive && !this.player.door },
            enemySpeed: frozen ? 0.12 : this.desc.params.enemySpeed * (1 + this.greed * 0.003),
            fx: this.fx, audio: this.audio, camTheta: this.camTheta, lavaY: this.lavaY,
            spawnFireball: (pos, pl, speed) => this._spawnFireball(pos, pl, speed)
        };
    }

    _spawnFireball(pos, pl, speed) {
        const target = polar(pl.theta, PATH.r, pl.y + 0.8);
        const fb = new Fireball(pos, target, this.fireGlow, this.M, speed);
        this.fireballs.push(fb);
        this.levelRoot.add(fb.root);
        this.audio.sfx('fire');
    }

    lavaSpeed() {
        const LP = this.desc.params;
        return Math.min(CONFIG.MAX_LAVA_SPEED, LP.lavaSpeed + this.greed * LP.greedLava);
    }

    _updatePlay(dt) {
        const P = this.player, I = this.input, ui = this.ui;
        if (!this.lavaActive && P.moved) { this.lavaActive = true; ui.sub(null); }
        this.timeStop = Math.max(0, this.timeStop - dt);
        const frozen = this.timeStop > 0;
        if (this.lavaActive && !frozen) this.lavaY += this.lavaSpeed() * dt;
        this.tower.update(dt, this.time);

        const ev = [];
        P.update(dt, I, this.tower, ev);
        for (const e of ev) this._onPlayerEvent(e);
        for (const p of this.tower.platforms) {
            if (p.type === 'crumble' && p.state === 'shaking' && Math.random() < dt * 14) {
                const th = p.theta + (Math.random() - 0.5) * p.half * 2;
                this.fx.burst('dust', polar(th, R + 0.4 + Math.random() * 1.2, p.y - p.thick), 1, { radius: 0.1, speed: 0.4, vy: -1 });
            }
        }

        // lava
        // touching the lava costs a heart and bounces the knight up; only sinking deep (or the last heart) kills
        if (!P.dead && !P.door) {
            if (P.y < this.lavaY - 1.2) {
                P.kill('lava', true);
                this._onDeath('lava');
            } else if (P.y < this.lavaY - 0.18) {
                if (P.invuln <= 0) {
                    const res = P.lavaHit();
                    if (res === 'dead') this._onDeath('lava');
                    else if (res === 'hurt') {
                        this._comboBreak();
                        if (this._screaming) { this._screaming = false; this.audio.screamStop(); }
                        this.audio.playVoice('lava');
                        this.audio.sfx('burn'); this.audio.sfx('hurt');
                        this.knight.hit();
                        this.ui.setHearts(Math.max(0, P.hp), true);
                        this.ui.damageFlash();
                        this.shake = Math.max(this.shake, 0.35);
                        this.hitstop = 0.04;
                        const c = polar(P.theta, PATH.r, P.y + 0.35);
                        this.fx.burst('fire', c, 16, { speed: 1.3, vy: 2.2 });
                        this.fx.burst('spark', c, 12, { speed: 1.5, vy: 2.5 });
                        this.ui.floater(c, '-1 ♥', '#ff4d2e');
                    }
                } else if (P.vy < 0) P.vy = Math.max(P.vy, 5.5); // keep bobbing out while blinking
            }
        }

        // items
        const got = this.items.collect(P.theta, P.y, []);
        for (const it of got) this._onCollect(it);

        // enemies
        const ctx = this._ctx(dt);
        for (const en of this.enemies) { if (en.alive) en.update(dt, ctx); this._cullEnemy(en); }
        this._combat();
        // fireballs
        for (let i = this.fireballs.length - 1; i >= 0; i--) {
            const fb = this.fireballs[i];
            if (fb.alive && !frozen) fb.update(dt, ctx);
            if (fb.alive && P.alive && !P.door) {
                const pc = polar(P.theta, PATH.r, P.y + 0.75, this._tmp);
                if (pc.distanceTo(fb.pos) < 0.72) {
                    fb.explode(ctx);
                    this._hurtPlayer(Math.atan2(fb.pos.x, fb.pos.z), 'fire');
                }
            }
            if (!fb.alive) { this.levelRoot.remove(fb.root); this._disposeTree(fb.root); this.fireballs.splice(i, 1); }
        }

        // exit gate: the guardian waits behind it
        const ex = this.tower.exit;
        const atGate = P.grounded && P.platform && P.platform.type === 'top' && Math.abs(angleDiff(P.theta, ex.theta)) * PATH.r < 0.8;
        if (atGate && !P.dead) {
            if (this.keys > 0) this._enterGate();
            else if (!this.lockedWarned) { this.lockedWarned = true; ui.toast('The gate is locked. <b>Find the key</b> on the tower!'); this.audio.sfx('door'); }
        } else if (!atGate) this.lockedWarned = false;

        // door prompt
        ui.setDoorPrompt(!!P.availableDoor());

        // lava warning
        const lavaGap = P.y - this.lavaY;
        const warn = this.lavaActive && lavaGap < 4.5 && !P.dead;
        ui.setLavaWarning(warn);
        if (warn) { this.warnT -= dt; if (this.warnT <= 0) { this.warnT = 0.7; this.audio.sfx('lava'); } }
        ui.setFrost(frozen);
        this._dread(dt);

        if (this.state === 'play') this._updateWorld(dt, false);
        ui.setMeter(P.y / this.tower.H, (this.lavaY - CONFIG.LAVA_START_Y) / (this.tower.H - CONFIG.LAVA_START_Y), this._keyFrac());
    }

    // distant bells, whispers and a racing heart when the knight is nearly dead
    _dread(dt, ambient = true) {
        const P = this.player;
        this.dreadT -= dt;
        if (ambient && this.dreadT <= 0) {
            this.dreadT = 16 + Math.random() * 18;
            this.audio.sfx(Math.random() < 0.55 ? 'bell' : 'whisper');
        }
        if (P.hp === 1 && !P.dead) {
            this._beatT = (this._beatT || 0) - dt;
            if (this._beatT <= 0) { this._beatT = 0.95; this.audio.sfx('heartbeat'); }
        }
    }

    _keyFrac() {
        if (this.keys > 0) return null;
        const k = this.items.list.find(o => o.type === 'key' && o.alive);
        return k ? k.y / this.tower.H : null;
    }

    _onPlayerEvent(e) {
        const P = this.player;
        const feet = polar(P.theta, PATH.r, P.y + 0.05, this._tmp);
        switch (e.type) {
            case 'jump':
                this.audio.sfx('jump');
                this.knight.jump();
                this.fx.burst('dust', feet, 6, { radius: 0.2, speed: 0.8 });
                break;
            case 'diveStart':
                this.audio.screamStop(); this._screaming = false;
                this.audio.sfx('dive');
                this.fx.burst('puff', polar(P.theta, PATH.r, P.y + 0.8), 8, { radius: 0.3, speed: 0.6 });
                break;
            case 'smash': this._smash(e); break;
            case 'splat': this._splat(e); break;
            case 'land':
                if (this._screaming) { this._screaming = false; this.audio.screamStop(); }
                this.audio.sfx('land', e.speed);
                this.knight.land(e.speed);
                this.fx.burst('dust', feet, Math.min(16, 4 + Math.floor(e.speed * 0.6)), { radius: 0.25, speed: 0.6 + e.speed * 0.05 });
                if (e.speed > 16) this.shake = Math.max(this.shake, 0.25);
                break;
            case 'step': this.audio.sfx('step'); if (Math.random() < 0.5) this.fx.burst('dust', feet, 1, { radius: 0.1, speed: 0.3, size: 0.7 }); break;
            case 'swing': this.audio.sfx('swing'); this.knight.swing(); if (this.inBoss) this._aimSwing(); break;
            case 'crumbleStart': this.audio.sfx('crumble'); break;
            case 'doorEnter': this.audio.sfx('door'); break;
            case 'doorSwap': this.audio.sfx('door'); break;
        }
    }

    _onCollect(it) {
        const P = this.player, ui = this.ui, C = CONFIG;
        const pos = this.items.worldPos(it, new Vec3());
        this._comboAdd(it.type === 'chest' ? 2 : 1);
        const mult = this.combo.mult;
        switch (it.type) {
            case 'coin': {
                const v = Math.round(C.SCORE_COIN * (1 + this.greed / 100) * mult);
                this.score += v; this.greed += C.GREED_COIN; this.stats.coins++;
                this.audio.sfx('coin', Math.min(10, this.stats.coins % 12));
                this.fx.burst('gold', pos, 8);
                ui.floater(pos, '+' + Math.floor(v));
                break;
            }
            case 'key':
                this.keys++; this.score += C.SCORE_KEY; this.greed += C.GREED_KEY;
                this.tower.exit.unlocked = true;
                this.audio.sfx('key'); this.audio.sfx('gate');
                this.fx.burst('gold', pos, 30, { speed: 1.4 });
                ui.setKey(true);
                ui.toast('<b>Key found!</b> The gate at the top is open. Something waits inside.', 3.2);
                ui.floater(pos, '+' + C.SCORE_KEY);
                break;
            case 'chest': {
                const v = C.SCORE_TREASURE * mult;
                this.score += v; this.greed += C.GREED_TREASURE; this.stats.chests++;
                this.audio.sfx('treasure');
                this.fx.burst('gold', pos, 40, { speed: 1.3, vy: 2 });
                ui.floater(pos, '+' + v, '#ffd36e');
                ui.toast('Treasure! Your <b>greed</b> grows, and so does the lava.', 2.4);
                break;
            }
            case 'hourglass':
                this.score += C.SCORE_HOURGLASS; this.timeStop = C.TIME_STOP_SECONDS;
                this.audio.sfx('hourglass');
                this.fx.burst('magic', pos, 30, { speed: 1.2 });
                ui.center('TIME STOPS', true, 1.2);
                ui.floater(pos, '+' + C.SCORE_HOURGLASS, '#9ff0ff');
                break;
            case 'heart':
                P.hp = Math.min(C.MAX_HP, P.hp + 1); this.score += 100;
                this.audio.sfx('heart');
                this.fx.burst('heal', pos, 24);
                ui.setHearts(P.hp);
                ui.floater(pos, '+1 ♥', '#ff8a9a');
                break;
        }
        ui.setScore(this.score);
        if (!this.inBoss) ui.setGreed(this.greed, it.type !== 'hourglass' && it.type !== 'heart');
    }

    _combat() {
        const P = this.player;
        if (P.dead || P.door) return;
        const C = CONFIG;
        // sword hits
        if (P.attackActive && !P.attackHit) {
            let hitAny = false;
            for (const en of this.enemies) {
                if (!en.alive || !en.killable) continue;
                const hb = en.hitbox();
                if (!hb) continue;
                const d = angleDiff(hb.theta, P.theta) * PATH.r * P.facing;
                if (d > -0.45 && d < C.ATTACK_RANGE + hb.half && hb.y1 > P.y - 0.3 && hb.y0 < P.y + 2.0) {
                    en.kill(this._ctx(0));
                    hitAny = true;
                    const c = en.root.position.clone(); c.y = en.y + 0.9;
                    this._killScore(en, c);
                    this.fx.burst('spark', c, 10);
                }
            }
            // parry fireballs
            const tip = polar(P.theta + P.facing * 0.9 / PATH.r, PATH.r, P.y + 1.0, this._tmp2);
            for (const fb of this.fireballs) {
                if (fb.alive && fb.pos.distanceTo(tip) < 1.35) {
                    fb.explode(this._ctx(0), true);
                    this._comboAdd(1);
                    const v = C.SCORE_FIREBALL * this.combo.mult;
                    this.score += v;
                    this.ui.floater(fb.pos, 'PARRY +' + v, '#ffb070');
                    hitAny = true;
                }
            }
            if (hitAny) {
                P.attackHit = true;
                this.hitstop = 0.06;
                this.shake = Math.max(this.shake, 0.12);
                this.audio.sfx('hit');
                this.ui.setScore(this.score);
            }
        }
        // a diving knight flattens whatever he falls on
        this._diveContact();
        // contact damage
        if (P.invuln > 0) return;
        for (const en of this.enemies) {
            if (!en.alive || en.harmless) continue;
            const hb = en.hitbox();
            if (!hb) continue;
            const d = Math.abs(angleDiff(P.theta, hb.theta)) * PATH.r;
            if (d < hb.half + C.PLAYER_HALF_W * 0.8 && P.y < hb.y1 - 0.05 && P.y + 1.3 > hb.y0) {
                this._hurtPlayer(hb.theta, en.kind);
                break;
            }
        }
    }

    // score a slain foe (with the combo multiplier)
    _killScore(en, pos, extra) {
        this._comboAdd(1);
        const base = en.kind === 'rat' ? 100 : en.kind === 'bat' ? 120 : CONFIG.SCORE_KILL;
        const v = base * this.combo.mult;
        this.score += v; this.stats.kills++;
        this.ui.floater(pos, (extra || '') + '+' + v, '#f0e4c9');
        this.ui.setScore(this.score);
        return v;
    }

    _diveContact() {
        const P = this.player;
        if (!P.diving || P.dead) return;
        for (const en of this.enemies) {
            if (!en.alive || !en.killable || en.harmless) continue;
            const hb = en.hitbox();
            if (!hb) continue;
            const d = angleDiff(hb.theta, P.theta) * PATH.r;
            if (Math.abs(d) < hb.half + CONFIG.PLAYER_HALF_W + 0.25 && P.y < hb.y1 + 0.35 && P.y + 1.3 > hb.y0) {
                this._launchEnemy(en, d, 0.7, 'STOMP ');
                this._stompBounce();
                return;
            }
        }
    }
    _stompBounce() {
        const P = this.player;
        P.bounce(10.5);
        this.knight.jump();
        this.hitstop = Math.max(this.hitstop, 0.06);
        this.shake = Math.max(this.shake, 0.25);
        this.audio.sfx('hit');
        this.fx.burst('spark', polar(P.theta, PATH.r, P.y + 0.2), 14, { speed: 1.4 });
    }

    _hurtPlayer(fromTheta, cause) {
        const P = this.player;
        if (!P.hurt(fromTheta, cause)) return;
        this._comboBreak();
        if (this._screaming) { this._screaming = false; this.audio.screamStop(); }
        if (this.inBoss && P.bomb) this._dropBomb();
        this.audio.sfx('hurt');
        this.knight.hit();
        this.ui.setHearts(Math.max(0, P.hp), true);
        this.ui.damageFlash();
        this.shake = Math.max(this.shake, 0.3);
        this.hitstop = 0.05;
        const c = polar(P.theta, PATH.r, P.y + 0.9);
        this.fx.burst('spark', c, 12);
        if (P.dead) this._onDeath(cause);
    }

    _onDeath(cause) {
        if (this.state === 'dying') return;
        this.state = 'dying';
        this.dieT = 0;
        this.deathCause = cause;
        this.lives--;
        this.ui.setLives(this.lives);
        this.ui.setLavaWarning(false);
        this.ui.setDoorPrompt(false);
        this.ui.setActionMode('sword');
        this.ui.setSiegeHint(0);
        this.ui.sub(null);
        this.shake = 0.4;
        this._comboBreak();
        this.ui.setDiveReady(false);
        if (this._screaming) { this._screaming = false; this.audio.screamStop(); }
        if (cause === 'lava') { this.audio.playVoice('lava'); this.audio.sfx('burn'); this.audio.sfx('die'); } else this.audio.sfx('die');
    }

    _showDeath() {
        this.state = 'deadScreen';
        const over = this.lives <= 0;
        if (over && this.score > this.best) { this.best = this.score; try { localStorage.setItem('sfal-best', String(Math.floor(this.best))); } catch (_) { } }
        let rows, title;
        if (this.inBoss) {
            const B = this.boss;
            title = KILL_TEXT[(this.level - 1) % 3];
            rows = [
                ['Tower', String(this.level)],
                ['Guardian', B.name.replace('THE ', '').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())],
                ['Guardian health', Math.ceil(B.hp) + ' / ' + B.maxHp],
                ['Lives left', String(Math.max(0, this.lives))],
                ['Score', Math.floor(this.score).toLocaleString('en-US'), 'total']
            ];
            if (over) rows.splice(4, 0, ['Best', Math.floor(this.best).toLocaleString('en-US')]);
            this.audio.stopBossMusic();
        } else {
            title = CAUSES[this.deathCause] || 'YOU FELL';
            rows = [
                ['Tower', String(this.level)],
                ['Height reached', Math.floor(Math.max(0, this.player.y)) + ' / ' + Math.floor(this.tower.H) + ' m'],
                ['Lives left', String(Math.max(0, this.lives))],
                ['Score', Math.floor(this.score).toLocaleString('en-US'), 'total']
            ];
            if (over) rows.splice(3, 0, ['Best', Math.floor(this.best).toLocaleString('en-US')]);
        }
        const n = this.runFalls, m = Math.round(this.runFallM);
        const fallLine = n === 0 ? 'Not a single fall. Suspicious.' : 'Fell ' + (n === 1 ? 'once' : n + ' times') + ', ' + m + ' meters total';
        this.ui.showDead(over ? 'GAME OVER' : title, rows, over, this.inBoss && !over, fallLine);
        this.ui.setHudVisible(false);
    }



    // ---------------------------------------------------------------- opening cinematic (first game of a visit)
    // lightning, the camera climbs the tower, a dragon roars past, the title slams in, then down to the knight
    _startIntro() {
        const P = this.player;
        this.state = 'intro';
        this.introT = 0;
        this._skipIntro = false;
        this._ifl = {};
        this._flashK = 0;
        this.ui.setHudVisible(false);
        this.ui.setIntro(true);
        this.ui.fade(false, 1.0);
        this.audio.fadeOutMusic();
        const d = createEnemy({ type: 'dragon', theta: 0, y: 8, dir: 1, phase: 0, fire: false }, this.M);
        if (d) { d.scaleNode.scale.set(1.15, 1.15, 1.15); d.root.visible = false; this.levelRoot.add(d.root); }
        this.cineDragon = d;
        this.shake = 0;
        this._updateIntroCamera(0);
    }

    _updateIntro(dt) {
        const P = this.player, f = this._ifl;
        const t = (this.introT += dt);
        if (this._skipIntro || this.input.pausePressed) { this._endIntro(); return; }
        const bolt = () => { this.world.nextFlash = 0; this._flashK = 1; };
        if (t > 0.15 && !f.bolt1) { f.bolt1 = true; bolt(); }
        if (t > 0.32 && !f.bolt1b) { f.bolt1b = true; this._flashK = 0.7; }
        if (t > 1.1 && !f.whoosh) { f.whoosh = true; this.audio.sfx('whoosh'); }
        if (t > 1.7 && !f.roar) { f.roar = true; this.audio.sfx('roar'); this.audio.sfx('growl'); this.shake = Math.max(this.shake, 0.55); }
        if (t > 3.3 && !f.title) {
            f.title = true; bolt();
            this.audio.sfx('titleSlam');
            this.ui.introTitle('show');
            this.shake = Math.max(this.shake, 0.75);
            this.audio.playGameMusic(this.level);
        }
        if (t > 4.9 && !f.dive) { f.dive = true; this.ui.introTitle('out'); this.audio.sfx('whoosh'); }
        this._flashK = Math.max(0, this._flashK - dt * 3.5);
        this.renderer.env.exposure = 1.1 + this._flashK * 2.4;
        this.tower.update(dt, this.time);
        const ctx = this._ctx(dt, { theta: P.theta + Math.PI, y: -50, alive: false });
        for (const en of this.enemies) { if (en.alive) en.update(dt, ctx); this._cullEnemy(en); }
        this._updateKnight(dt);
        this.items.update(dt, this.time, this.camTheta);
        this._updateIntroCamera(dt);
        this._updateCineDragon(dt, ctx);
        this._lavaFx(dt);
        this.fx.update(dt);
        this._updateEnv(dt, this.camY);
        if (t >= INTRO_END) this._endIntro();
    }

    _updateIntroCamera(dt) {
        const P = this.player, T = this.tower, t = this.introT;
        const H = T.H, ex = T.exit.theta;
        const sm = (a, b) => { const u = clamp((t - a) / (b - a), 0, 1); return u * u * (3 - 2 * u); };
        const D = this._camDist();
        // climb from the lava-lit base to the gate, circling the tower
        const e1 = sm(0, 3.5);
        const thA = ex - 2.3 * (1 - e1) + Math.max(0, t - 3.5) * 0.05;
        const distA = lerp(D * 0.62, D + 3.5, e1);
        const posYA = lerp(0.9, H + 3.6, e1);
        const lookYA = lerp(7.5, H + 1.8, e1);
        // then plunge down to the knight, where play begins
        const e3 = sm(4.9, 6.6);
        const lookYG = P.y + 1.1;
        const th = thA + angleDiff(P.theta, thA) * e3;
        const dist = lerp(distA, D, e3);
        const posY = lerp(posYA, lookYG + 2.4, e3);
        const lookY = lerp(lookYA, lookYG + 0.9, e3);
        const lookR = lerp(0, 1.5, e3);
        let sx = 0, sy = 0;
        if (this.shake > 0) {
            this.shake = Math.max(0, this.shake - dt * 1.6);
            const s = this.shake * this.shake * 1.2;
            sx = (Math.random() - 0.5) * s; sy = (Math.random() - 0.5) * s;
        }
        this.camera.position.set(Math.sin(th) * dist + Math.cos(th) * sx, posY + sy, Math.cos(th) * dist - Math.sin(th) * sx);
        this.camera.target.set(Math.sin(th) * lookR, lookY, Math.cos(th) * lookR);
        this.camTheta = th;
        this.camY = lerp(lookYA, lookYG, e3);
    }

    // the dragon crosses right in front of the lens, roaring fire
    _updateCineDragon(dt, ctx) {
        const d = this.cineDragon;
        if (!d) return;
        const t = this.introT, u = (t - 0.95) / 1.9;
        if (u < 0 || u > 1) { d.root.visible = false; return; }
        d.root.visible = true;
        d.update(dt, ctx);
        const C = this.camera.position;
        const f = this._tmp.copy(this.camera.target).sub(C).normalize();
        const rl = Math.hypot(f.x, f.z) || 1, rx = -f.z / rl, rz = f.x / rl;
        // cross the frame at a pace that reads on a narrow portrait screen too
        const fwd = 7.5;
        const halfW = fwd * Math.tan(this.camera.fov / 2) * (this.renderer.width / this.renderer.height);
        const side = lerp(-(halfW + 5), halfW + 5, u), upo = -1.6 + u * 2.6 - Math.sin(u * Math.PI) * 0.6;
        d.root.position.set(C.x + f.x * fwd + rx * side, C.y + f.y * fwd + upo, C.z + f.z * fwd + rz * side);
        d.root.rotation.set(-0.1, Math.atan2(rx, rz), -0.35);
        if (t > 1.65 && t < 2.35) {
            d.jaw.rotation.x = 0.75;
            d.head.rotation.y = -0.75;
            d.mouthGlow.scale.set(1.6, 1.6, 1.6);
            d.root.updateWorld(null);
            const h = d.head.worldPosition(this._tmp2);
            for (let i = 0; i < 3; i++) {
                const s = 5 + Math.random() * 4;
                this.fx.emit('fire', h.x, h.y, h.z, rx * s - f.x * 2 + (Math.random() - 0.5) * 2, (Math.random() - 0.3) * 2, rz * s - f.z * 2 + (Math.random() - 0.5) * 2, 1.8);
            }
        }
    }

    _endIntro() {
        const P = this.player;
        if (this.state !== 'intro') return;
        this.ui.setIntro(false);
        if (this.cineDragon) { this.levelRoot.remove(this.cineDragon.root); this._disposeTree(this.cineDragon.root); this.cineDragon = null; }
        this.renderer.env.exposure = 1.1; this._flashK = 0;
        this.ui.setHudVisible(true);
        this.state = 'play';
        this.ui.center('GO!', false, 0.7);
        this.audio.sfx('beep', 1);
        this.ui.sub('MOVE TO START');
        if (!this._ifl.title) this.audio.playGameMusic(this.level);
        this.input.reset();
        this.shake = 0;
        this.camY = P.y + 1.1;
        this._updateCamera(0);
    }

    // ---------------------------------------------------------------- ground-pound, slapstick falls, combo
    _resetJuice() {
        this.rings = [];
        this.flyers = [];
        this.combo = { n: 0, t: 0, mult: 1 };
        this.flail = false;
        this._fallVoicePlayed = false;
        if (this._screaming) this.audio.screamStop();
        this._screaming = false;
        if (this.ui) { this.ui.setCombo(0, 1, 0); this.ui.setDiveReady(false); }
    }

    _comboAdd(k) {
        const c = this.combo;
        c.n += k; c.t = COMBO_TIME;
        const m = Math.min(COMBO_MAX, 1 + Math.floor(c.n / COMBO_STEP));
        let bump = false;
        if (m > c.mult) {
            c.mult = m; bump = true;
            this.ui.pop(COMBO_WORDS[m] + ' x' + m, 'combo');
            this.audio.sfx('combo', m);
        }
        if (c.n > (this.stats.bestCombo || 0)) this.stats.bestCombo = c.n;
        this.ui.setCombo(c.n, c.mult, 1, bump);
    }
    _comboBreak() {
        const c = this.combo;
        if (!c || c.n === 0) return;
        c.n = 0; c.t = 0; c.mult = 1;
        this.ui.setCombo(0, 1, 0);
    }

    _countFall(h) {
        this.runFalls++; this.runFallM += h;
        this.stats.falls = (this.stats.falls || 0) + 1;
        this.stats.fallM = (this.stats.fallM || 0) + h;
        this.ui.setFalls(this.runFalls, true);
    }

    // a long fall without a ground-pound: faceplant, helmet pops off, stars
    _splat(e) {
        const P = this.player;
        this._screaming = false; this.audio.screamStop();
        this.knight.splat();
        this.audio.sfx('splat'); this.audio.sfx('oof');
        const feet = polar(P.theta, PATH.r, P.y + 0.05);
        this.fx.burst('dust', feet, Math.round(16 + Math.min(20, e.h * 2)), { radius: 0.45, speed: 1.1 + Math.min(1, e.h * 0.06) });
        this.fx.chunk(feet, 5, [0.55, 0.48, 0.44], 0.1, 3);
        this.shake = Math.max(this.shake, 0.3 + Math.min(0.45, e.h * 0.03));
        this.hitstop = Math.max(this.hitstop, 0.05);
        this.ui.floater(polar(P.theta, PATH.r, P.y + 1.7), SPLAT_WORDS[Math.floor(Math.random() * SPLAT_WORDS.length)], '#ffb08a');
        if (e.h >= 9) this.ui.pop(Math.round(e.h) + ' M FALL!', 'fall');
        this._countFall(e.h);
    }

    // ground-pound impact: shockwave, flying foes, loose gold, a big shout
    _smash(e) {
        const P = this.player, C = CONFIG, h = e.h;
        this._screaming = false; this.audio.screamStop();
        const power = clamp(h / 8, 0.15, 1.4);
        const radius = clamp(1.3 + h * 0.34, 1.5, 4.8);
        const feet = polar(P.theta, PATH.r, P.y + 0.05);
        this.knight.smashLand();
        this._shockRing(P.theta, P.y, radius, power);
        this.fx.burst('dust', feet, Math.round(14 + power * 26), { radius: 0.5, speed: 1.2 + power * 1.6 });
        this.fx.burst('spark', feet, Math.round(8 + power * 18), { speed: 1.4 + power });
        this.fx.chunk(feet, Math.round(5 + power * 9), [0.55, 0.48, 0.44], 0.12, 3 + power * 3);
        if (h > 5) this.fx.burst('fire', feet, Math.round(power * 22), { speed: 1.8, size: 1.2 });
        this.shake = Math.max(this.shake, 0.3 + power * 0.55);
        this.hitstop = Math.max(this.hitstop, 0.04 + power * 0.06);
        this.audio.sfx('smash', power);
        if (this.inBoss) this._flashLight(feet, [2 + power * 5, 1 + power * 2.4, 0.6], 8 + power * 6, 0.3);
        this._comboAdd(h > 6 ? 2 : 1);
        let kills = 0, hitBoss = false;
        // foes in reach are blown off the tower
        for (const en of this.enemies) {
            if (!en.alive || !en.killable) continue;
            const hb = en.hitbox();
            if (!hb) continue;
            const d = angleDiff(hb.theta, P.theta) * PATH.r;
            if (Math.abs(d) - hb.half < radius && hb.y1 > P.y - 0.6 && hb.y0 < P.y + 2.4) { this._launchEnemy(en, d, power); kills++; }
        }
        if (this.inBoss) {
            const ctx = this._bossCtx(0);
            for (const r of this.hz.runners) {
                if (!r.alive || !r.killable) continue;
                if (Math.abs(angleDiff(r.theta, P.theta)) * PATH.r < radius + r.half && Math.abs(r.y - P.y) < 1.6) {
                    r.kill(ctx); kills++;
                    this._comboAdd(1);
                    const v = 60 * this.combo.mult;
                    this.score += v;
                    this.ui.floater(polar(r.theta, PATH.r, r.y + 1), '+' + v, '#f0e4c9');
                }
            }
            // straight onto a planted weak spot: double damage
            const B = this.boss;
            if (B && this.state === 'boss' && B.state === 'fight') {
                for (const w of B.weakPoints()) {
                    if (Math.abs(angleDiff(w.theta, P.theta)) * PATH.r < w.half + 0.8 && Math.abs(w.y0 - P.y) < 0.7) {
                        // a proper drop does double damage (more from high up); a tiny bounce-hop only a sword's worth
                        const dmg = h > 5 ? DMG.megaSmash : h >= 1.8 ? DMG.smash : DMG.hit;
                        hitBoss = this._damageBoss(dmg, polar(w.theta, PATH.r, w.y0 + 0.8), 'smash');
                        break;
                    }
                }
            }
        } else {
            // coins and loot shaken loose
            const got = this.items.collectNear(P.theta, P.y, radius * 0.8, []);
            for (const it of got) this._onCollect(it);
            if (got.length) this.fx.burst('gold', feet, Math.min(40, 10 + got.length * 4), { speed: 1.6, vy: 3 });
            // fireballs in the blast pop harmlessly
            const ctx = this._ctx(0);
            for (const fb of this.fireballs) if (fb.alive && fb.pos.distanceTo(feet) < radius + 0.6) { fb.explode(ctx, true); this._comboAdd(1); this.score += C.SCORE_FIREBALL * this.combo.mult; }
        }
        const pts = Math.round(h * 20 + 10) * this.combo.mult;
        this.score += pts;
        this.ui.setScore(this.score);
        // the shout
        const mult = this.combo.mult;
        let word = h >= 10 ? 'METEOR' : h >= 6.5 ? 'EARTHQUAKE' : h >= 3.5 ? 'MEGA SMASH' : 'SMASH';
        if (hitBoss) word = h > 5 ? 'CRUSHING BLOW' : 'WEAK SPOT SMASH';
        if (kills >= 3 && !hitBoss) word = kills >= 5 ? 'MASSACRE' : 'TRIPLE SMASH';
        if (hitBoss || kills > 0 || h >= 3.5 || mult > 1) this.ui.pop(word + (mult > 1 ? ' x' + mult : '') + '!', h >= 6.5 || hitBoss || kills >= 3 ? 'mega' : '');
        else this.ui.floater(polar(P.theta, PATH.r, P.y + 1.6), 'SMASH!', '#ffd36e');
        if (h >= 4.2) this._countFall(h);
        // hitting something throws the knight back up for another dive
        if (kills > 0 || hitBoss) P.bounce(8.5 + Math.min(3, kills) * 0.8);
    }

    _shockRing(theta, y, radius, power) {
        const col = [1, 0.72 + power * 0.1, 0.4];
        const mk = () => new BasicMaterial({ map: this.T.shock, color: col, transparent: true, blending: 'additive', depthWrite: false, side: 'double', renderOrder: 6 });
        const flat = new Mesh(this._ringGeo, mk());
        flat.rotation.x = -Math.PI / 2;
        flat.position.copy(polar(theta, PATH.r, y + 0.07));
        const up = new Mesh(this._ringGeo, mk());
        up.position.copy(polar(theta, PATH.r + 0.4, y + 0.45));
        up.rotation.y = theta;
        flat.frustumCulled = false; up.frustumCulled = false;
        this.levelRoot.add(flat, up);
        this.rings.push({ flat, up, t: 0, life: 0.42 + power * 0.12, size: radius * 2.3, alpha: 0.7 + power * 0.3 });
    }

    // blow a foe off the tower: it spins away and bursts
    _launchEnemy(en, d, power, label) {
        const node = en.root;
        const pos = node.position.clone(); pos.y = en.y + 0.9;
        en.root = new Node();   // the foe is finished; its model now belongs to the flight
        en.root.visible = false;
        en.alive = false; en.dead = true;
        if (en.silk) en.silk.visible = false;
        node.traverse(n => { if (n.material === this.M.shadow) n.visible = false; });
        node.visible = true;
        const dir = d >= 0 ? 1 : -1;
        const th = Math.atan2(node.position.x, node.position.z);
        const out = 2.5 + power * 3, side = dir * (3 + power * 4), upv = 7 + power * 5;
        this.flyers.push({
            node, t: 0,
            vx: Math.sin(th) * out + Math.cos(th) * side, vy: upv, vz: Math.cos(th) * out - Math.sin(th) * side,
            sx: (Math.random() - 0.5) * 12, sz: dir * (8 + Math.random() * 6)
        });
        this._killScore(en, pos, label);
        this.fx.burst('spark', pos, 10, { speed: 1.2 });
        this.audio.sfx(en.kind === 'skeleton' ? 'bones' : en.kind === 'rat' ? 'squeak' : 'screech');
    }

    _updateJuice(dt) {
        const P = this.player;
        // shockwave rings
        for (let i = this.rings.length - 1; i >= 0; i--) {
            const r = this.rings[i];
            r.t += dt;
            const u = r.t / r.life;
            if (u >= 1) { this.levelRoot.remove(r.flat); this.levelRoot.remove(r.up); this.rings.splice(i, 1); continue; }
            const e = 1 - Math.pow(1 - u, 3);
            const s = r.size * (0.2 + 0.8 * e);
            r.flat.scale.set(s, s, 1);
            r.up.scale.set(s * 0.9, s * 0.55, 1);
            const a = r.alpha * (1 - u) * (1 - u);
            r.flat.material.opacity = a; r.up.material.opacity = a * 0.8;
        }
        // foes flying off the tower
        for (let i = this.flyers.length - 1; i >= 0; i--) {
            const f = this.flyers[i], n = f.node;
            f.t += dt;
            f.vy -= 24 * dt;
            n.position.x += f.vx * dt; n.position.y += f.vy * dt; n.position.z += f.vz * dt;
            n.rotation.x += f.sx * dt; n.rotation.z += f.sz * dt;
            if (Math.random() < 0.5) this.fx.emit('dust', n.position.x, n.position.y + 0.5, n.position.z, 0, 0.3, 0, 0.8);
            if (f.t > 1.05) {
                const c = n.position.clone(); c.y += 0.5;
                this.fx.burst('puff', c, 12, { radius: 0.4 });
                this.fx.burst('soul', c, 8);
                this.fx.chunk(c, 6, [0.9, 0.86, 0.75], 0.1, 3);
                this.levelRoot.remove(n); this._disposeTree(n);
                this.flyers.splice(i, 1);
            }
        }
        const live = this.state === 'play' || this.state === 'boss';
        // combo timer: only runs while the knight is on the ground
        const c = this.combo;
        if (c.n > 0 && live) {
            if (P.grounded && !P.door) c.t -= dt;
            if (c.t <= 0) {
                if (c.mult >= 3) this.ui.floater(polar(P.theta, PATH.r, P.y + 2.2), c.n + ' COMBO!', '#9ff0ff');
                this._comboBreak();
            } else this.ui.setCombo(c.n, c.mult, c.t / COMBO_TIME);
        }
        // a long plunge: arms windmill, AAAAH!
        const falling = live && !P.grounded && !P.diving && !P.dead && !P.door && P.vy < -9 && P.peakY - P.y > 3;
        this.flail = falling;
        if (falling) {
            if (!this._screaming) { this._screaming = true; this._aaT = 0; this._aaN = 0; }
            if (!this._fallVoicePlayed && P.peakY - P.y >= FALL_VOICE_MIN_DROP) {
                this._fallVoicePlayed = true;
                this.audio.playVoice('fall');
            }
            this._aaT -= dt;
            if (this._aaT <= 0) {
                this._aaT = 0.3; this._aaN++;
                this.ui.floater(polar(P.theta, PATH.r, P.y + 2.1), 'A'.repeat(2 + Math.min(6, this._aaN)) + 'H!', '#ffe2c0');
            }
        } else if (this._screaming && (P.grounded || P.dead)) { this._screaming = false; this.audio.screamStop(); }
        if (P.grounded || P.dead) this._fallVoicePlayed = false;
        // dive trail
        if (P.diving && P.diveT > 0.16) {
            const k = polar(P.theta, PATH.r, P.y + 0.6);
            this.fx.emit('spark', k.x + (Math.random() - 0.5) * 0.4, k.y, k.z + (Math.random() - 0.5) * 0.4, 0, 3 + Math.random() * 3, 0, 1.1);
            if (Math.random() < 0.5) this.fx.emit('puff', k.x, k.y + 0.4, k.z, 0, 2, 0, 0.8);
        }
        this.ui.setDiveReady(live && !P.grounded && !P.diving && !P.dead && !P.door);
    }

    // ---------------------------------------------------------------- the guardian
    _enterGate() {
        if (this.state !== 'play') return;
        const P = this.player;
        this.state = 'toBoss';
        this.gateT = 0;
        this._faded = false;
        P.win = true; P.vx = 0;
        this.audio.sfx('gate');
        this.audio.sfx('bell', 0.14);
        this.ui.setDoorPrompt(false);
        this.ui.setLavaWarning(false);
        this.ui.setFrost(false);
        this.ui.sub(null);
        this.ui.center('THE GUARDIAN AWAITS', true, 1.8);
        // the tower itself is conquered: bank its bonus now
        this.levelBonus = CONFIG.LEVEL_BONUS + Math.floor(this.greed * 100);
        this.score += this.levelBonus;
        this.ui.setScore(this.score);
        this.bossStartScore = this.score;
        this.bossStartStats = Object.assign({}, this.stats);
    }

    _updateToBoss(dt) {
        const P = this.player;
        this.gateT += dt;
        const u = clamp(this.gateT / 1.25, 0, 1);
        P.radius = lerp(PATH.r, R - 0.4, u * u);
        P.theta = dampAngle(P.theta, this.tower.exit.theta, 6, dt);
        this.timeStop = 0;
        this._updateWorld(dt, false);
        if (this.gateT > 0.8 && !this._faded) { this._faded = true; this.ui.fade(true, 0.6); }
        if (this.gateT > 1.55) this._startBossFight();
    }

    _startBossFight() {
        this.slowmo = 0; this.hitstop = 0;
        this._disposeLevel();
        this.inBoss = true;
        // the hall is far wider than the tower: the knight walks a bigger ring
        setPathRadius(ARENA_RP);
        this._setBaseFov(ARENA_FOV);
        const root = this.levelRoot = new Node();
        const boss = this.boss = createBoss(this.level);
        const arena = this.arena = new BossArena(this.M, this.T, boss.theme);
        arena.splatH = 6.0;   // hopping off the hall's slabs should not end in a faceplant every time
        this.stage = arena;
        root.add(arena.root, boss.root);
        this.items = new Items({ items: [] }, this.M, this.T);
        root.add(this.items.root);
        this.fx = new FX(root);
        this.enemies = [];
        this.fireballs = [];
        this.hz = { teles: [], runners: [], fallers: [], shots: [], pools: [] };
        this.missiles = [];
        this.flashLights = [];
        this.heldBomb = null;
        this.actT = -1; this.attackIn = false;
        this._reloadMsgT = 0;
        this._resetJuice();
        this._addKnight(root);
        this.scene.add(root);
        // start between a bomb crate and a floor cannon
        const start = 1.3;
        this.player = new Player(start, 0);
        this.player.platform = arena.ground;
        this.player.hp = CONFIG.MAX_HP;
        this.player.facing = 1;
        this.player.bomb = false;
        boss.yaw = start;
        this.timeStop = 0;
        this.lavaY = -100;
        this.heartT = 24;
        this._roared = false; this._titled = false; this._fought = false;
        this.audio.stopVoice();
        this.camTheta = start;
        this.camY = 2;
        this._applyArenaEnv(boss.theme);
        this.state = 'bossIntro';
        this.introT = 0;
        // a retry skips most of the entrance
        this.bossTries = (this.bossTries || 0) + 1;
        this._bossIntroEnd = 4.2;
        if (this.bossTries > 1) {
            this.introT = 2.2; this._roared = true; this._titled = true;
            boss.introT = 2.0;
        }
        this.ui.setHudVisible(true);
        this.ui.setBossMode(true);
        this.ui.setBoss(boss.name, 1, false);
        this.ui.setHearts(this.player.hp);
        this.ui.setLives(this.lives);
        this.ui.setScore(this.score);
        this.ui.setLavaWarning(false);
        this.ui.setFrost(false);
        this.ui.setDoorPrompt(false);
        this.ui.sub(null);
        this.ui.clearCenter();
        this.ui.fade(false, 0.9);
        this.audio.stopDrone();
        this.audio.playBossMusic((this.level - 1) % 3);
        this.input.reset();
        this._updateBossCamera(0);
    }

    _endBoss() {
        if (!this.inBoss) return;
        this.inBoss = false;
        this.boss = null; this.arena = null; this.hz = null;
        this.missiles = []; this.flashLights = []; this.heldBomb = null;
        setPathRadius(CONFIG.PATH_RADIUS);
        this._setBaseFov(CONFIG.FOV * Math.PI / 180);
        this.ui.setBossMode(false);
        this.audio.stopBossMusic();
        this._applyTowerEnv();
    }

    _bossCtx(dt) {
        if (!this._bctx) {
            const self = this;
            this._bctx = {
                dt: 0, time: 0, player: null, fx: null, audio: this.audio,
                telegraph: (theta, dur, size, color, y) => { const t = new Telegraph(self.levelRoot, self.T.warn, theta, dur, size, color, y || 0); self.hz.teles.push(t); return t; },
                runner: (o) => { const r = new Runner(self.levelRoot, o); self.hz.runners.push(r); if (o.kind === 'shock') self.audio.sfx('shock'); return r; },
                faller: (o) => { const f = new Faller(self.levelRoot, self.T.warn, o); self.hz.fallers.push(f); return f; },
                shot: (o) => { const s = new Shot(self.levelRoot, self.fireGlow, o); self.hz.shots.push(s); self.audio.sfx(o.kind === 'web' ? 'web' : 'fire'); return s; },
                pool: (o) => { const p = new Pool(self.levelRoot, self.T.warn, o); self.hz.pools.push(p); return p; },
                minion: (kind, theta) => self._spawnMinion(kind, theta),
                minionCount: () => self.enemies.filter(e => e.alive).length,
                impact: (theta, half, height, cause, y0) => self._bossImpact(theta, half, height, cause, y0 || 0),
                shake: (s) => { self.shake = Math.max(self.shake, s); },
                groundAt: (theta) => self.arena ? self.arena.groundAt(theta) : 0,
                strikeTarget: (theta) => self._strikeTarget(theta),
                onEnrage: (b) => self._onEnrage(b)
            };
        }
        const c = this._bctx;
        c.dt = dt; c.time = this.time; c.player = this.player; c.fx = this.fx;
        return c;
    }
    _minionCtx(dt) {
        const cyc = this.boss ? this.boss.cycle : 0;
        return { time: this.time, dt, player: this.player, enemySpeed: 1 + cyc * 0.12, fx: this.fx, audio: this.audio, camTheta: this.camTheta, lavaY: -100 };
    }

    // where a guardian's blow lands: the slab the knight stands on, or open floor
    // (never through a slab, so the planted weak spot is always reachable)
    _strikeTarget(theta) {
        const P = this.player, A = this.arena;
        const standY = P.grounded && P.platform ? P.platform.y : A.groundAt(P.theta, P.y + 0.05);
        if (standY > 0.5 && !(P.platform && P.platform.moving)) {
            const s = A.platforms.find(p => p.type === 'stone' && !p.moving && Math.abs(p.y - standY) < 0.05 && Math.abs(angleDiff(P.theta, p.theta)) <= p.half + 0.12);
            if (s) {
                const off = clamp(angleDiff(theta, s.theta), -s.half * 0.6, s.half * 0.6);
                return { theta: wrapAngle(s.theta + off), gy: s.y };
            }
        }
        const pad = 0.6 / PATH.r;
        for (const p of A.platforms) {
            if (p.type !== 'stone') continue;
            const off = angleDiff(theta, p.theta);
            if (Math.abs(off) < p.half + pad) return { theta: wrapAngle(p.theta + (off >= 0 ? 1 : -1) * (p.half + pad)), gy: 0 };
        }
        return { theta, gy: 0 };
    }

    _spawnMinion(kind, theta) {
        const en = createEnemy({ type: 'skeleton', platform: this.arena.ground, theta: wrapAngle(theta), chase: true, rise: true }, this.M);
        if (!en) return null;
        this.levelRoot.add(en.root);
        this._addShadowTo(en);
        this.enemies.push(en);
        const p = polar(theta, PATH.r, 0.1);
        this.fx.burst('soul', p, 16, { col: this.boss.theme.glow, col2: [0.2, 0.02, 0.02] });
        this.fx.burst('dust', p, 10, { radius: 0.4 });
        this.audio.sfx('bones');
        return en;
    }

    _bossImpact(theta, half, height, cause, y0) {
        const P = this.player;
        if (!P.dead && P.invuln <= 0) {
            const d = Math.abs(angleDiff(P.theta, theta)) * PATH.r;
            if (d < half + CONFIG.PLAYER_HALF_W && P.y >= y0 - 0.25 && P.y < y0 + height) this._hurtPlayer(theta, cause);
        }
        // the guardian's blows crush its own servants too
        const mctx = this._minionCtx(0);
        for (const en of this.enemies) {
            if (en.alive && !en.harmless && Math.abs(angleDiff(en.theta, theta)) * PATH.r < half && Math.abs(en.y - y0) < 0.5) en.kill(mctx);
        }
    }

    _damageBoss(n, pos, how) {
        const B = this.boss;
        if (!B.damage(n, this._bossCtx(0), how)) return false;
        this._comboAdd(how === 'smash' ? 2 : 1);
        this.score += 100 * n * this.combo.mult;
        this.stats.bossHits = (this.stats.bossHits || 0) + 1;
        this.ui.setScore(this.score);
        this.ui.setBoss(B.name, B.hpFrac, B.phase === 2, true);
        const g = B.theme.glow;
        this.fx.burst('spark', pos, 20, { speed: 1.5 });
        this.fx.burst('soul', pos, 14, { col: g, col2: [g[0] * 0.3, g[1] * 0.3, g[2] * 0.3] });
        this.fx.chunk(pos, 7, B.chunkColor || [0.9, 0.86, 0.75], 0.13, 4.5);
        this.audio.sfx('bosshit');
        this.shake = Math.max(this.shake, 0.35);
        this.hitstop = Math.max(this.hitstop, 0.09);
        const LABEL = { reflect: ['REFLECTED!', '#9ff0ff'], cannon: ['CANNON HIT!', '#ffd36e'], bomb: ['BOMB HIT!', '#ffb04a'], smash: ['DOUBLE DAMAGE!', '#ffe07a'] };
        const lb = LABEL[how] || ['HIT!', '#ff9a6a'];
        this.ui.floater(pos, lb[0], lb[1]);
        if (how === 'cannon' || how === 'bomb' || how === 'smash') { this.hitstop = Math.max(this.hitstop, 0.12); this.shake = Math.max(this.shake, 0.75); }
        if (B.defeated) this._onBossDefeated();
        return true;
    }

    _onEnrage(B) {
        this.ui.center(RAGE_TEXT[(this.level - 1) % 3], true, 1.8);
        this.ui.rageFlash();
        this.shake = Math.max(this.shake, 0.8);
        this.audio.bossRage(true);
        // a crystal heart appears on a high slab
        const P = this.player;
        const highs = this.arena.platforms.filter(p => p.type === 'stone' && !p.moving);
        highs.sort((a, b) => Math.abs(angleDiff(a.theta, P.theta)) - Math.abs(angleDiff(b.theta, P.theta)));
        if (highs.length && P.hp < CONFIG.MAX_HP) {
            const h = highs[Math.min(1, highs.length - 1)];
            this.items.spawn('heart', h.theta, h.y + 0.9);
            this.ui.toast('A <b>heart</b> appeared on a floating slab!', 2.4);
        }
    }

    _onBossDefeated() {
        if (this.state !== 'boss') return;
        this.state = 'bossDying';
        this.ui.setActionMode('sword');
        this.ui.setSiegeHint(0);
        this.bossDieT = 0;
        this.hitstop = 0.3;
        this.slowmo = 1.4;
        this.shake = 1.0;
        this.audio.sfx('bossdie');
        this.audio.stopBossMusic();
        this._clearHazards();
        const mctx = this._minionCtx(0);
        for (const en of this.enemies) if (en.alive) en.kill(mctx);
        this.player.invuln = 99;
        this.bossBonus = 3000 + 1500 * this.boss.cycle;
        this.score += this.bossBonus;
        this.stats.bosses = (this.stats.bosses || 0) + 1;
        this.ui.setScore(this.score);
        this.ui.setBoss(this.boss.name, 0, false, true);
        this.ui.rageFlash(true);
        if (this.score > this.best) { this.best = this.score; try { localStorage.setItem('sfal-best', String(Math.floor(this.best))); } catch (_) { } }
    }

    _clearHazards() {
        const H = this.hz, ctx = this._bossCtx(0);
        if (!H) return;
        for (const t of H.teles) t.remove();
        for (const f of H.fallers) f.remove();
        for (const r of H.runners) { if (r.alive) this.fx.burst('puff', r.root.position, 8, { radius: 0.2 }); r.remove(); this._disposeTree(r.root); }
        for (const s of H.shots) { if (s.alive) s.explode(ctx, false); s.remove(); this._disposeTree(s.root); }
        for (const f of H.fallers) this._disposeTree(f.root);
        for (const p of H.pools) p.remove();
        H.teles.length = 0; H.fallers.length = 0; H.runners.length = 0; H.shots.length = 0; H.pools.length = 0;
        for (const m of this.missiles) { if (m.alive) this.fx.burst('smoke', m.pos, 6); m.remove(); this._disposeTree(m.root); }
        this.missiles.length = 0;
    }

    _updateHazards(dt, ctx, lethal) {
        const P = this.player, H = this.hz;
        const canHurt = lethal && !P.dead;
        for (let i = H.teles.length - 1; i >= 0; i--) { const t = H.teles[i]; if (t.update(dt)) { t.remove(); H.teles.splice(i, 1); } }
        for (let i = H.fallers.length - 1; i >= 0; i--) { const f = H.fallers[i]; f.update(dt, ctx); if (!f.alive) { f.remove(); this._disposeTree(f.root); H.fallers.splice(i, 1); } }
        for (let i = H.runners.length - 1; i >= 0; i--) {
            const r = H.runners[i];
            if (!r) continue;
            if (r.alive) r.update(dt, ctx);
            if (r.alive && canHurt && r.hits(P)) {
                if (P.diving && r.killable && r.armed) {
                    // stomped from above
                    r.kill(ctx);
                    this._comboAdd(1);
                    const v = 60 * this.combo.mult;
                    this.score += v; this.ui.setScore(this.score);
                    this.ui.floater(polar(r.theta, PATH.r, r.y + 1), 'STOMP +' + v, '#f0e4c9');
                    this._stompBounce();
                } else if (P.invuln <= 0) {
                    this._hurtPlayer(r.theta, r.kind === 'spiderling' ? 'spider' : 'boss');
                    if (r.killable) r.kill(ctx);
                }
            }
            if (!r.alive) { r.remove(); this._disposeTree(r.root); H.runners.splice(i, 1); }
        }
        for (let i = H.shots.length - 1; i >= 0; i--) {
            const s = H.shots[i];
            if (!s) continue;
            if (s.alive) {
                if (s.reflected) s.target = this.boss.aimPoint(s.target || new Vec3());
                s.update(dt, ctx);
                if (s.hitBoss) { s.hitBoss = false; if (this.state === 'boss') this._damageBoss(DMG.reflect, s.pos.clone(), 'reflect'); }
                if (H.shots[i] !== s) continue;
            }
            if (s.alive && !s.reflected && canHurt) {
                const pc = polar(P.theta, PATH.r, P.y + 0.75, this._tmp);
                if (pc.distanceTo(s.pos) < 0.72) {
                    s.explode(ctx, false);
                    if (s.kind === 'web') {
                        P.slowT = 2.2;
                        this.fx.burst('puff', pc, 12, { col: [0.9, 0.92, 0.92], col2: [0.6, 0.6, 0.65] });
                        this.ui.toastOnce('web', 'Webbed! <b>Slash</b> the webs before they reach you.');
                    } else if (P.invuln <= 0) this._hurtPlayer(Math.atan2(s.pos.x, s.pos.z), 'boss');
                }
            }
            if (!s.alive) { s.remove(); this._disposeTree(s.root); H.shots.splice(i, 1); }
        }
        for (let i = H.pools.length - 1; i >= 0; i--) {
            const p = H.pools[i];
            p.update(dt, ctx);
            if (p.alive && canHurt && P.invuln <= 0 && p.hits(P)) this._hurtPlayer(p.theta, 'boss');
            if (!p.alive) { p.remove(); H.pools.splice(i, 1); }
        }
    }

    // The sword swing picks its own direction in the hall: along the ring at a weak spot,
    // servant or skull within reach, otherwise straight in at the guardian (parries its shots).
    _aimSwing() {
        const P = this.player, B = this.boss, C = CONFIG;
        let best = null, bestGap = 1e9;
        const consider = (theta, half, y0, y1) => {
            const d = angleDiff(theta, P.theta) * PATH.r;
            const gap = Math.abs(d) - half;
            if (gap < C.ATTACK_RANGE + 0.35 && y1 > P.y - 0.3 && y0 < P.y + 2.0 && gap < bestGap) { bestGap = gap; best = d; }
        };
        if (B) for (const w of B.weakPoints()) consider(w.theta, w.half, w.y0, w.y1);
        for (const en of this.enemies) {
            if (!en.alive || !en.killable) continue;
            const hb = en.hitbox();
            if (hb) consider(hb.theta, hb.half, hb.y0, hb.y1);
        }
        for (const r of this.hz.runners) if (r.alive && r.killable && r.armed) consider(r.theta, r.half, r.y, r.y + r.h);
        if (best !== null) {
            if (Math.abs(best) > 0.12) P.facing = best > 0 ? 1 : -1;
            this.attackIn = false;
            return;
        }
        // nothing beside him: running swings go ahead, a standing swing meets the guardian head on
        this.attackIn = this.input.x === 0;
    }

    _bossCombat(ctx) {
        const P = this.player, B = this.boss, C = CONFIG;
        if (P.dead) return;
        if (P.attackActive && !P.attackHit) {
            let hitAny = false;
            const inward = this.attackIn;
            const inReach = (theta, half) => {
                const d = angleDiff(theta, P.theta) * PATH.r;
                if (inward) return Math.abs(d) - half < 0.9;
                const df = d * P.facing;
                return df + half > -0.45 && df - half < C.ATTACK_RANGE;
            };
            // exposed weak spots (planted hands, legs, the wyrm's head)
            for (const w of B.weakPoints()) {
                if (inReach(w.theta, w.half) && w.y1 > P.y - 0.3 && w.y0 < P.y + 2.0) {
                    this._damageBoss(DMG.hit, polar(w.theta, PATH.r, w.y0 + 0.8), 'hit');
                    hitAny = true;
                    break;
                }
            }
            // risen dead
            const mctx = this._minionCtx(0);
            for (const en of this.enemies) {
                if (!en.alive || !en.killable) continue;
                const hb = en.hitbox();
                if (!hb) continue;
                if (inReach(hb.theta, hb.half) && hb.y1 > P.y - 0.3 && hb.y0 < P.y + 2.0) {
                    en.kill(mctx);
                    hitAny = true;
                    const c = en.root.position.clone(); c.y = en.y + 0.9;
                    this._killScore(en, c);
                    this.fx.burst('spark', c, 10);
                }
            }
            // skulls and spiderlings on the ring
            for (const r of this.hz.runners) {
                if (!r.alive || !r.killable || !r.armed) continue;
                if (inReach(r.theta, r.half) && P.y < r.y + r.h + 0.6 && P.y + 2.0 > r.y) {
                    r.kill(ctx);
                    hitAny = true;
                    this._comboAdd(1);
                    const v = 60 * this.combo.mult;
                    this.score += v;
                    const c = r.root.position.clone(); c.y += 0.5;
                    this.ui.floater(c, '+' + v, '#f0e4c9');
                }
            }
            // parry: fireballs and soul skulls fly back at the guardian, webs are cut
            const tip = inward ? polar(P.theta, PATH.r - 1.1, P.y + 1.0, this._tmp2) : polar(P.theta + P.facing * 0.9 / PATH.r, PATH.r, P.y + 1.0, this._tmp2);
            const reach = inward ? 1.75 : 1.45;
            for (const s of this.hz.shots) {
                if (!s.alive || s.reflected) continue;
                if (s.pos.distanceTo(tip) < reach) {
                    if (s.reflectable) {
                        s.reflect(B.aimPoint(new Vec3()));
                        this.audio.sfx('reflect');
                        this.ui.floater(s.pos, 'PARRY!', '#9ff0ff');
                        this.fx.burst('spark', s.pos, 14, { speed: 1.3 });
                    } else {
                        s.explode(ctx, true);
                        this.ui.floater(s.pos, 'CUT!', '#f0e4c9');
                    }
                    this._comboAdd(1);
                    this.score += C.SCORE_FIREBALL * this.combo.mult;
                    hitAny = true;
                }
            }
            if (hitAny) {
                P.attackHit = true;
                this.hitstop = Math.max(this.hitstop, 0.06);
                this.shake = Math.max(this.shake, 0.14);
                this.audio.sfx('hit');
                this.ui.setScore(this.score);
            }
        }
        this._diveContact();
        // contact damage from risen skeletons
        if (P.invuln > 0) return;
        for (const en of this.enemies) {
            if (!en.alive || en.harmless) continue;
            const hb = en.hitbox();
            if (!hb) continue;
            const d = Math.abs(angleDiff(P.theta, hb.theta)) * PATH.r;
            if (d < hb.half + C.PLAYER_HALF_W * 0.8 && P.y < hb.y1 - 0.05 && P.y + 1.3 > hb.y0) {
                this._hurtPlayer(hb.theta, 'skeleton');
                break;
            }
        }
    }

    // ---------------------------------------------------------------- siege weapons in the hall
    _fireCannon(c) {
        c.ready = false;
        c.reload = CANNON_RELOAD;
        c.fuseT = 0.32;
        this.actT = 0; this.attackIn = true;
        this._reloadMsgT = 5;
        this.audio.sfx('fuse');
        this.ui.toastOnce('cannon', 'Cannons need <b>' + CANNON_RELOAD + ' seconds</b> to reload. Run to the next one!');
    }
    _cannonBoom(c) {
        const A = this.arena, B = this.boss;
        const m = A.muzzle(c, new Vec3());
        c.recoil = 1;
        this.fx.burst('fire', m, 26, { speed: 2.4, size: 1.4 });
        this.fx.burst('smoke', m, 12, { speed: 1.4, size: 1.3 });
        this.fx.burst('spark', m, 16, { speed: 1.8 });
        this.shake = Math.max(this.shake, 0.55);
        this.audio.sfx('cannon');
        this._flashLight(m, [7, 3.4, 1.0], 11, 0.28);
        if (B && !B.defeated && !B.gone) {
            this.missiles.push(new Missile(this.levelRoot, {
                kind: 'ball', from: m, aim: (out) => B.bodyPoint(out), dur: 0.5, arc: 1.0,
                damage: DMG.cannon, stagger: 1.0, glowMat: this.fireGlow
            }));
        }
    }
    _pickBomb(cr) {
        const P = this.player;
        cr.hasBomb = false; cr.respawn = CRATE_RESPAWN; cr.bomb.visible = false;
        P.bomb = true;
        this.heldBomb = bombModel(this.M);
        this.levelRoot.add(this.heldBomb);
        this._placeHeldBomb();
        this.audio.sfx('pickup');
        this.fx.burst('spark', this.heldBomb.position, 10, { speed: 0.8 });
        this.ui.toastOnce('bomb', 'Got a <b>bomb</b>! Press the glowing button to hurl it at the guardian.');
    }
    _placeHeldBomb() {
        const P = this.player, h = this.heldBomb;
        if (!h) return;
        h.position.copy(polar(P.theta, PATH.r, P.y + 2.0 + Math.sin(this.time * 7) * 0.04));
        h.rotation.set(0, this.time * 1.5, Math.sin(this.time * 5) * 0.15);
        if (Math.random() < 0.6) this.fx.emit('spark', h.position.x, h.position.y + 0.42, h.position.z, (Math.random() - 0.5) * 1.2, 1.5, (Math.random() - 0.5) * 1.2, 0.8);
    }
    _throwBomb() {
        const P = this.player, B = this.boss;
        if (!P.bomb || !this.heldBomb) return;
        P.bomb = false;
        this.actT = 0; this.attackIn = true;
        this.audio.sfx('throw');
        const from = this.heldBomb.position.clone();
        this.missiles.push(new Missile(this.levelRoot, {
            kind: 'bomb', from, model: this.heldBomb, aim: (out) => B.bodyPoint(out), dur: 0.85, arc: 3.2,
            damage: DMG.bomb, stagger: 0.6
        }));
        this.levelRoot.remove(this.heldBomb);
        this.heldBomb = null;
    }
    _dropBomb() {
        const P = this.player;
        if (!P.bomb || !this.heldBomb) return;
        P.bomb = false;
        const from = this.heldBomb.position.clone();
        const gy = Math.max(0, this.arena.groundBelow(P.theta, P.y + 0.05));
        this.missiles.push(new Missile(this.levelRoot, { kind: 'drop', from, model: this.heldBomb, groundY: gy, vy: 3, fuse: 0.85 }));
        this.levelRoot.remove(this.heldBomb);
        this.heldBomb = null;
        this.ui.floater(from, 'DROPPED!', '#ffb04a');
    }
    _flashLight(pos, color, range, life) {
        this.flashLights.push({ light: { pos: pos.clone(), color: color.slice(), range }, base: color.slice(), t: 0, life });
    }
    _explosion(pos, big) {
        this.fx.burst('fire', pos, Math.round(30 * big), { speed: 2.6 * big, size: 1.6 * big });
        this.fx.burst('spark', pos, 22, { speed: 2.2 });
        this.fx.burst('smoke', pos, 10, { speed: 1.4, size: 1.6 });
        this.fx.chunk(pos, 6, [0.25, 0.22, 0.26], 0.14, 5);
        this.audio.sfx('explosion');
        this.shake = Math.max(this.shake, 0.55 * big);
        this._flashLight(pos, [9, 4.5, 1.4], 13, 0.4);
    }
    _missileHit(m) {
        const p = m.pos.clone();
        this._explosion(p, m.kind === 'ball' ? 1.15 : 1.0);
        if (m.kind === 'drop') {
            // a dropped bomb still clears the knight's surroundings
            const th = Math.atan2(p.x, p.z), mctx = this._minionCtx(0), ctx = this._bossCtx(0);
            for (const en of this.enemies) if (en.alive && Math.abs(angleDiff(en.theta, th)) * PATH.r < 2.4 && Math.abs(en.y - (p.y - 0.28)) < 1.2) { en.kill(mctx); this.stats.kills++; }
            for (const r of this.hz.runners) if (r.alive && r.killable && Math.abs(angleDiff(r.theta, th)) * PATH.r < 2.4) r.kill(ctx);
            return;
        }
        const B = this.boss;
        if (B && this.state === 'boss' && B.state === 'fight') {
            this._damageBoss(m.damage, p, m.kind === 'ball' ? 'cannon' : 'bomb');
            if (!B.defeated && B.stagger(this._bossCtx(0), m.stagger)) {
                this.audio.sfx('growl');
                this.ui.floater(new Vec3(p.x, p.y + 1.2, p.z), 'STAGGERED!', '#ffffff');
            }
        }
    }
    _updateSiege(dt) {
        const A = this.arena, ctx = this._bossCtx(dt);
        for (const c of A.cannons) {
            if (c.fuseT > 0) {
                c.fuseT -= dt;
                const hole = polar(c.theta, PATH.r - 0.95 + 0.62, c.y + 1.2);
                if (Math.random() < 0.9) this.fx.emit('spark', hole.x, hole.y, hole.z, (Math.random() - 0.5) * 2, 2.5, (Math.random() - 0.5) * 2, 1.0);
                if (c.fuseT <= 0) { c.fuseT = 0; this._cannonBoom(c); }
            }
            if (c.justLoaded) {
                c.justLoaded = false;
                if (this.state === 'boss' && Math.abs(angleDiff(c.theta, this.camTheta)) < 1.1) {
                    this.ui.floater(polar(c.theta, PATH.r, c.y + 2.4), 'CANNON READY', '#ffd36e');
                    this.audio.sfx('reload');
                }
            }
        }
        const list = this.missiles;
        for (let i = list.length - 1; i >= 0; i--) {
            const m = list[i];
            if (!m) continue;
            if (m.alive) m.update(dt, ctx);
            if (m.hit) { m.hit = false; this._missileHit(m); }
            if (list[i] !== m) continue;   // the fight ended while handling the hit
            if (!m.alive) { m.remove(); this._disposeTree(m.root); list.splice(i, 1); }
        }
        for (let i = this.flashLights.length - 1; i >= 0; i--) {
            const f = this.flashLights[i];
            f.t += dt;
            const k = Math.max(0, 1 - f.t / f.life);
            f.light.color[0] = f.base[0] * k; f.light.color[1] = f.base[1] * k; f.light.color[2] = f.base[2] * k;
            if (f.t >= f.life) this.flashLights.splice(i, 1);
        }
        if (this.player.bomb) this._placeHeldBomb();
    }

    // everything in the hall that runs regardless of the fight's phase
    _updateBossScene(dt, lethal) {
        const B = this.boss;
        const ctx = this._bossCtx(dt);
        if (B && !B.gone) B.update(dt, ctx);
        if (B && B.gone) B.root.visible = false;
        this.arena.update(dt, this.time, B && B.phase === 2 && !B.defeated, B && !B.gone ? B.bodyPoint(this._tmp3).y : undefined);
        this._updateHazards(dt, ctx, lethal);
        this._updateSiege(dt);
        const mctx = this._minionCtx(dt);
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const en = this.enemies[i];
            if (en.alive) en.update(dt, mctx);
            else if (en.dead) { this.levelRoot.remove(en.root); this._disposeTree(en.root); this.enemies.splice(i, 1); }
        }
        this._updateKnight(dt);
        this._updateJuice(dt);
        this.items.update(dt, this.time, this.camTheta);
        this.fx.update(dt);
        this._pitFx(dt);
        this._updateBossCamera(dt);
        this._updateBossEnv(dt);
    }

    _pitFx(dt) {
        this._pitT = (this._pitT || 0) - dt;
        if (this._pitT > 0) return;
        this._pitT = 0.05;
        const g = this.boss ? this.boss.theme.glow : [1, 0.3, 0.1];
        const a = Math.random() * Math.PI * 2, r = Math.random() * 4.4;
        this.fx.emit('spark', Math.sin(a) * r, -1.5, Math.cos(a) * r, 0, 3 + Math.random() * 3, 0, 1.2);
        if (Math.random() < 0.3) {
            const a2 = Math.random() * Math.PI * 2;
            this.fx.burst('soul', new Vec3(Math.sin(a2) * 2, -0.5, Math.cos(a2) * 2), 1, { col: g, col2: [g[0] * 0.2, g[1] * 0.2, g[2] * 0.2], vy: 2 });
        }
    }

    _updateBossIntro(dt) {
        const P = this.player, B = this.boss;
        this.introT += dt;
        B.cool = Math.max(B.cool, 1.2);
        P.update(dt, NOINPUT, this.arena, []);
        if (this.introT > 0.5 && !this._roared) {
            this._roared = true;
            this.audio.sfx('bossroar');
            this.shake = Math.max(this.shake, 0.7);
        }
        if (this.introT > 1.0 && !this._titled) {
            this._titled = true;
            this.ui.bossTitle(B.name, B.subtitle);
        }
        this._updateBossScene(dt, false);
        if (this.introT > this._bossIntroEnd && B.state === 'fight') {
            this.state = 'boss';
            this.ui.center('FIGHT!', false, 0.8);
            this.audio.sfx('beep', 1);
            if (!this._taught) { this._taught = true; this.ui.toast('Fire the <b>cannons</b>, throw <b>bombs</b> and strike the <b>glowing weak spots</b> after its blows!', 5); }
        }
    }

    _updateBoss(dt) {
        const P = this.player, I = this.input, B = this.boss, A = this.arena;
        const ev = [];
        // the action button fires a cannon or throws a bomb instead of swinging when it can
        const cannon = P.grounded && !P.dead ? A.cannonAt(P.theta, P.y) : null;
        const mode = cannon ? 'fire' : P.bomb ? 'throw' : 'sword';
        this.ui.setActionMode(mode);
        if (I.attackPressed && mode !== 'sword' && P.stun <= 0 && !P.dead) {
            I._pressed.attack = false;
            if (mode === 'fire') this._fireCannon(cannon); else this._throwBomb();
        }
        P.update(dt, I, A, ev);
        for (const e of ev) this._onPlayerEvent(e);
        if (!P.bomb && !P.dead && P.grounded) {
            const cr = A.crateAt(P.theta, P.y);
            if (cr) this._pickBomb(cr);
        }
        // arrow toward the nearest loaded cannon when it is off screen
        let hint = 0;
        if (!P.dead && !cannon) {
            let best = 1e9;
            for (const c of A.cannons) {
                if (!c.ready) continue;
                const d = angleDiff(c.theta, P.theta) * PATH.r;
                if (Math.abs(d) < Math.abs(best)) best = d;
            }
            if (Math.abs(best) > 4.2 && Math.abs(best) < 1e8) hint = best > 0 ? 1 : -1;
        }
        this.ui.setSiegeHint(hint);
        // standing at a cannon that is still reloading
        this._reloadMsgT = Math.max(0, this._reloadMsgT - dt);
        if (!cannon && P.grounded && this._reloadMsgT <= 0) {
            const c = A.cannons.find(k => !k.ready && k.fuseT <= 0 && Math.abs(angleDiff(P.theta, k.theta)) * PATH.r < 1.0 && Math.abs(P.y - k.y) < 0.4);
            if (c) { this._reloadMsgT = 2.5; this.ui.floater(polar(c.theta, PATH.r, c.y + 2.2), 'RELOADING ' + Math.ceil(c.reload) + 's', '#c9b89a'); }
        }
        this._bossCombat(this._bossCtx(dt));
        const got = this.items.collect(P.theta, P.y, []);
        for (const it of got) this._onCollect(it);
        // a heart now and then when the knight is hurt
        this.heartT -= dt;
        if (this.heartT <= 0) {
            this.heartT = 26;
            if (P.hp < CONFIG.MAX_HP && !this.items.list.some(o => o.alive && o.type === 'heart')) {
                const slabs = this.arena.platforms.filter(p => p.type === 'stone' && !p.moving);
                const s = slabs[Math.floor(Math.random() * slabs.length)];
                this.items.spawn('heart', s.theta, s.y + 0.9);
            }
        }
        this._dread(dt, false);
        // point out the first exposed weak spots
        const wps = B.weakPoints();
        if (wps.length && !this._wpShown && (this._strikeHints || 0) < 3) {
            this._strikeHints = (this._strikeHints || 0) + 1;
            this.ui.floater(polar(wps[0].theta, PATH.r, wps[0].y0 + 2.3), 'STRIKE IT!', '#ffd36e');
        }
        this._wpShown = wps.length > 0;
        if (this.state === 'boss') this._updateBossScene(dt, true);
    }

    _updateBossDying(dt) {
        const P = this.player, B = this.boss;
        this.bossDieT += dt;
        P.update(dt, NOINPUT, this.arena, []);
        if (this.bossDieT > 1.0 && !this._slainShown) {
            this._slainShown = true;
            this.ui.center('GUARDIAN SLAIN', true, 2.6);
            this.audio.sfx('victory');
        }
        if (this.bossDieT > 3.6 && !P.win) { P.win = true; P.vx = 0; }
        this._updateBossScene(dt, false);
        if (this.bossDieT > 5.4) { this._slainShown = false; this._showBossWin(); }
    }

    _showBossWin() {
        this.state = 'winScreen';
        this.ui.setHudVisible(false);
        this.ui.showWin('Tower ' + this.level + ' conquered', [
            ['Gold coins', String(this.stats.coins)],
            ['Chests', String(this.stats.chests)],
            ['Foes slain', String(this.stats.kills)],
            ['Best combo', String(this.stats.bestCombo || 0)],
            ['Falls', (this.stats.falls || 0) + ' (' + Math.round(this.stats.fallM || 0) + ' m)'],
            ['Greed', Math.floor(this.greed) + '%'],
            ['Tower bonus', '+' + this.levelBonus.toLocaleString('en-US')],
            ['Guardian slain', '+' + this.bossBonus.toLocaleString('en-US')],
            ['Score', Math.floor(this.score).toLocaleString('en-US'), 'total']
        ]);
        this.audio.playGameMusic(this.level);
    }

    // Behind the knight, outside the ring, looking across at the guardian in the middle:
    // the knight sits low in the frame, the guardian fills the top.
    _updateBossCamera(dt) {
        const P = this.player, B = this.boss;
        const aspect = this.renderer.width / this.renderer.height;
        const tanH = Math.tan(this.camera.fov / 2);
        const D = clamp(PATH.r + (aspect < 1 ? 3.8 : 4.8) / (tanH * aspect), aspect < 1 ? 19 : 22, 25.5);
        this.camTheta = dt > 0 ? dampAngle(this.camTheta, P.theta, 3.0, dt) : P.theta;
        this.camY = dt > 0 ? damp(this.camY, P.y, 2.5, dt) : P.y;
        let dist = D, camH = 9.5 + this.camY * 0.55, lookY = 2.2 + this.camY * 0.5, lookR = 0, side = 0;
        if (this.state === 'bossIntro') {
            // low angle from beside the knight on the rising guardian, then pull back to the fight view
            const u = clamp((this.introT - 2.7) / 1.3, 0, 1), e = u * u * (3 - 2 * u);
            dist = lerp(D * 0.62, D, e); camH = lerp(1.9, camH, e); lookY = lerp(7.2, lookY, e); side = lerp(0.32, 0, e);
        } else if (this.state === 'bossDying' || (this.state === 'winScreen' && B)) {
            const u = clamp((this.bossDieT || 0) / 3, 0, 1);
            dist = lerp(D, D * 0.8, u); camH = lerp(camH, 5.6, u); lookY = lerp(lookY, 5.0, u);
        }
        const th = this.camTheta + side;
        let sx = 0, sy = 0;
        if (this.shake > 0) {
            this.shake = Math.max(0, this.shake - dt * 1.6);
            const s = this.shake * this.shake * 1.5;
            sx = (Math.random() - 0.5) * s; sy = (Math.random() - 0.5) * s;
        }
        this.camera.position.set(Math.sin(th) * dist + Math.cos(th) * sx, camH + sy, Math.cos(th) * dist - Math.sin(th) * sx);
        this.camera.target.set(Math.sin(th) * lookR, lookY, Math.cos(th) * lookR);
    }

    _updateBossEnv(dt) {
        const env = this.renderer.env, B = this.boss, A = this.arena;
        const th = this.camTheta;
        env.dirDir.set(Math.sin(th - 0.9) * 0.55, 0.62, Math.cos(th - 0.9) * 0.55).normalize();
        const pts = [];
        if (B && !B.gone) {
            // the guardian's own light sits in front of it
            B.light.pos.copy(B.aimPoint(this._tmp3));
            B.light.pos.x *= 0.7; B.light.pos.z *= 0.7;
            B.light.range = 24;
            pts.push(B.light);
        }
        if (!this._pitLight) this._pitLight = { pos: new Vec3(0, -1.5, 0), color: [0, 0, 0], range: 16 };
        const g = B ? B.theme.glow : [1, 0.3, 0.1];
        const fl = 0.85 + 0.15 * Math.sin(this.time * 3.3);
        const rage = B && B.phase === 2 && !B.defeated ? 1.5 : 1;
        this._pitLight.color = [g[0] * 6 * fl * rage, g[1] * 6 * fl * rage, g[2] * 6 * fl * rage];
        pts.push(this._pitLight);
        // explosions, cannonballs and glowing hazards
        for (const f of this.flashLights) if (pts.length < 4) pts.push(f.light);
        for (const m of this.missiles) if (m.light && m.alive && pts.length < 5) pts.push(m.light);
        for (const r of this.hz.runners) if (r.light && r.alive && pts.length < 5) { r.light.pos.copy(r.root.position); r.light.pos.y += 0.8; pts.push(r.light); }
        for (const s of this.hz.shots) if (s.light && s.alive && pts.length < 6) pts.push(s.light);
        // nearest fire bowls
        const bowls = A.bowls.slice().sort((a, b) => Math.abs(angleDiff(a.theta, th)) - Math.abs(angleDiff(b.theta, th)));
        for (const b of bowls) { if (pts.length >= 8) break; pts.push(b.light); }
        env.points = pts;
    }

    // ---------------------------------------------------------------- world, knight, camera, lights (tower)
    _cullEnemy(en) {
        if (!en.alive) { en.root.visible = false; return; }
        const th = en.kind === 'dragon' ? en.phi : en.theta;
        const lim = en.kind === 'dragon' ? 2.5 : 1.9;
        en.root.visible = Math.abs(angleDiff(th, this.camTheta)) < lim && Math.abs(en.y - this.camY) < 22;
    }

    _updateWorld(dt, frozenPlayer) {
        if (this.state !== 'play') {
            const ctx = this._ctx(dt);
            if (this.state !== 'countdown') this.tower.update(dt, this.time);
            for (const en of this.enemies) { if (en.alive) en.update(dt, ctx); this._cullEnemy(en); }
            for (let i = this.fireballs.length - 1; i >= 0; i--) {
                const fb = this.fireballs[i];
                if (fb.alive) fb.update(dt, ctx);
                if (!fb.alive) { this.levelRoot.remove(fb.root); this._disposeTree(fb.root); this.fireballs.splice(i, 1); }
            }
        }
        this._updateKnight(dt);
        this._updateJuice(dt);
        this.items.update(dt, this.time, this.camTheta);
        this._lavaFx(dt);
        this.fx.update(dt);
        this._updateCamera(dt);
        this._updateEnv(dt, this.camY);
    }

    _lavaFx(dt) {
        if (this.camY - this.lavaY > 16) return;
        this._popT = (this._popT || 0) - dt;
        if (this._popT > 0) return;
        this._popT = 0.07 + Math.random() * 0.14;
        const a = this.camTheta + (Math.random() - 0.5) * 1.4;
        const r = 5.2 + Math.random() * 9;
        const pos = new Vec3(Math.sin(a) * r, this.lavaY + 0.05, Math.cos(a) * r);
        this.fx.burst('spark', pos, 2 + Math.floor(Math.random() * 4), { speed: 0.5, vy: 2.5 });
        if (Math.random() < 0.35) this.fx.burst('fire', pos, 2, { speed: 0.3, size: 1.6 });
        if (Math.random() < 0.12) this.fx.burst('smoke', pos, 1, { size: 1.5 });
    }

    _updateKnight(dt) {
        const P = this.player, k = this.knight;
        P.faceSmooth = damp(P.faceSmooth, P.facing, 11, dt);
        let yaw = P.theta + P.faceSmooth * (Math.PI / 2 - 0.72);
        let attack = P.attackProgress;
        if (this.inBoss) {
            // cannon lighting and bomb throws reuse the swing animation
            if (this.actT >= 0) {
                this.actT += dt;
                attack = Math.max(attack, this.actT / CONFIG.ATTACK_TIME);
                if (this.actT >= CONFIG.ATTACK_TIME) this.actT = -1;
            }
            // in the hall the knight squares up to the guardian whenever he is not running
            if (!P.dead && !P.win) {
                const running = Math.abs(P.vx) > 1.2;
                let aimT = P.grounded ? (running ? 0.3 : 1) : 0.55;
                let rate = 12;
                if (P.attackT >= 0) { aimT = this.attackIn ? 1 : 0; rate = 28; }
                if (this.actT >= 0) { aimT = 1; rate = 28; }
                P.aim = damp(P.aim === undefined ? 1 : P.aim, aimT, rate, dt);
                const want = P.facing * (Math.PI / 2) * (1 + P.aim);
                P.relYaw = P.relYaw === undefined ? want : dampAngle(P.relYaw, want, rate, dt);
            }
            if (P.relYaw !== undefined) yaw = P.theta + P.relYaw;
        }
        const entering = this.state === 'toBoss';
        if (P.door) {
            const into = !P.doorSwapped;
            yaw = P.theta + (into ? Math.PI : 0);
        }
        if (entering) yaw = P.theta + Math.PI;
        else if (P.win) yaw = P.theta + Math.PI * 0.08;
        k.root.position.copy(polar(P.theta, P.radius, P.y));
        k.root.rotation.y = yaw;
        const spd = P.door || entering ? 2.5 : P.vx;
        k.animate(dt, {
            speed: spd, grounded: P.grounded || !!P.door || entering, vy: P.vy,
            attack, hurt: P.hurtT, dead: P.dead, lava: P.lava, win: P.win && !entering,
            dive: P.diving, diveT: P.diveT, flail: this.flail && !P.dead
        });
        // visibility, flashes
        const blink = P.invuln > 0 && P.invuln < 50 && !P.dead && Math.floor(this.time * 18) % 2 === 0;
        k.root.visible = !blink && (P.doorFade > 0.08);
        if (P.lava && P.dead) {
            const u = Math.min(1, this.dieT / 1.2);
            k.setFlash(0.35 + u * 0.5, [1, 0.35, 0.05]);
        } else if (P.hurtT > 0) k.setFlash(P.hurtT / 0.35 * 0.65, [1, 0.15, 0.1]);
        else if (P.door) k.setFlash((1 - P.doorFade) * 0.9, [0.02, 0.01, 0.01]);
        else if (entering) k.setFlash(clamp((PATH.r - P.radius) / (PATH.r - R + 0.4), 0, 1) * 0.95, [0.02, 0.01, 0.01]);
        else if (P.slowT > 0) k.setFlash(0.35, [0.85, 0.88, 0.9]);
        else k.setFlash(0);
        // sword trail
        k.root.updateWorld(null);
        k.bladeWorld(this._tmp, this._tmp2);
        const u = P.attackProgress;
        this.trail.push(this._tmp, this._tmp2, (u > 0.25 && u < 0.62) || (P.diving && P.diveT > 0.14));
        // blob shadow
        const gy = this.stage.groundBelow(P.theta, P.y);
        if (gy > -1e6 && !P.door && !entering) {
            const h = P.y - gy;
            const s = clamp(1 - h * 0.12, 0.35, 1) * 0.95;
            this.shadow.visible = true;
            this.shadow.position.copy(polar(P.theta, PATH.r, gy + 0.03));
            this.shadow.rotation.set(-Math.PI / 2, 0, 0);
            this.shadow.scale.set(s, s * 0.85, 1);
        } else this.shadow.visible = false;
        // wall shadow: light comes from the camera side, slightly up and to one side,
        // so the shadow peeks out lower-right of the knight onto the bricks
        const ws = this.wallShadow;
        if (ws) {
            const show = !this.inBoss && !P.door && !entering && k.root.visible;
            ws.visible = show;
            if (show) {
                const air = clamp((P.y - (gy > -1e6 ? gy : P.y)) * 0.08, 0, 0.35);
                const th = P.theta + 0.34 / R;
                ws.position.copy(polar(th, R + 0.06, P.y + 0.72 - air * 0.5));
                ws.rotation.set(0, th, -0.12);
                const sw = 0.95 * (1 + air), sh = 1.7 * (1 + air * 0.6);
                ws.scale.set(sw, sh, 1);
            }
        }
    }

    _camDist() {
        const aspect = this.renderer.width / this.renderer.height;
        const tanH = Math.tan(this.camera.fov / 2);
        // Frame the playable front of the tower tightly on narrow phones.
        const portrait = aspect < 1;
        const halfW = portrait ? 3.8 : 5.0;
        return clamp(halfW / (tanH * aspect), portrait ? 12.5 : 14.5, 24);
    }

    _snapCamera() {
        const P = this.player;
        this.camTheta = this.state === 'countdown' ? this.tower.exit.theta : P.theta;
        this.camY = P.y + 1.1;
        this._updateCamera(0);
    }

    _updateCamera(dt) {
        const P = this.player;
        if (this.state === 'menu') return;
        const moving = Math.abs(P.vx) > 0.5;
        const lead = P.door ? 0 : (P.facing * (moving ? 0.85 : 0.45)) / PATH.r;
        const k = P.door ? 3.4 : 6.5;
        if (this.state === 'toBoss') this.camTheta = dampAngle(this.camTheta, this.tower.exit.theta, 4, dt);
        else if (this.state !== 'countdown') this.camTheta = dt > 0 ? dampAngle(this.camTheta, P.theta + lead, k, dt) : P.theta + lead;
        const lookY = P.y + 1.1 + clamp(P.vy * 0.05, -1.4, 0.5);
        if (this.state === 'countdown') {
            // opening sweep: start at the gate on top, glide down to the knight
            const u = clamp(1 - this.countT / 3, 0, 1);
            const e = u * u * (3 - 2 * u);
            this.camY = lerp(this.tower.H + 1.5, lookY, e);
            this.camTheta = dampAngle(this.camTheta, lerp(this.tower.exit.theta, P.theta, e), 20, Math.max(dt, 0.016));
        } else this.camY = dt > 0 ? damp(this.camY, lookY, P.vy < -10 ? 6 : 3.5, dt) : lookY;
        const D = this._camDist();
        const th = this.camTheta;
        let sx = 0, sy = 0;
        if (this.shake > 0) {
            this.shake = Math.max(0, this.shake - dt * 1.6);
            const s = this.shake * this.shake * 1.2;
            sx = (Math.random() - 0.5) * s; sy = (Math.random() - 0.5) * s;
        }
        const gateZoom = this.state === 'toBoss' ? Math.min(1, this.gateT / 1.4) * 5 : 0;
        const deathZoom = this.state === 'dying' ? Math.min(1, this.dieT / 1.5) * 3 : 0;
        const d = D - gateZoom - deathZoom;
        this.camera.position.set(Math.sin(th) * d + Math.cos(th) * sx, this.camY + 2.4 + sy, Math.cos(th) * d - Math.sin(th) * sx);
        this.camera.target.set(Math.sin(th) * 1.5, this.camY + 0.9, Math.cos(th) * 1.5);
    }

    _updateEnv(dt, focusY) {
        const env = this.renderer.env;
        const th = this.camTheta;
        env.lavaY = this.lavaY;
        env.dirDir.set(Math.sin(th - 0.9) * 0.55, 0.62, Math.cos(th - 0.9) * 0.55).normalize();
        const flash = this.world.flash;
        env.hemiSky = [0.04 + flash * 0.25, 0.035 + flash * 0.23, 0.065 + flash * 0.32];
        const heat = clamp(1 - (focusY - this.lavaY) / 20, 0, 1);
        env.hemiGround = [0.06 + heat * 0.12, 0.022 + heat * 0.035, 0.016];
        const extra = [];
        for (const fb of this.fireballs) if (fb.alive) extra.push(fb.light);
        for (const l of this.items.lights) extra.push(l);
        if (this.tower.exit.unlocked) {
            if (!this._gateLight) this._gateLight = { pos: new Vec3(), color: [4, 1.1, 0.4], range: 9 };
            this._gateLight.pos.copy(polar(this.tower.exit.theta, R + 1.4, this.tower.H + 1.4));
            if (Math.abs(this._gateLight.pos.y - focusY) < 14) extra.push(this._gateLight);
        }
        this.world.assignLights(env, { y: focusY }, th, this.tower.torches, extra, this.lavaY);
        this.world._freezeTarget = this.timeStop > 0 ? 1 : 0;
        this.world.update(dt, this.camera, focusY, this.lavaY, clamp(this.greed / 100, 0, 1));
    }

    render(dt) {
        this.ui.update(dt, this.camera);
        this.renderer.time = this.time;
        this.renderer.render(this.scene, this.camera);
    }
}

// ======================================================================
// START
// ======================================================================

window.addEventListener('error', (e) => { console.error('Game error:', e.message); });
window.sirFallsALot = new Game();