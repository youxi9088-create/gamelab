// Keyboard + touch input and the DOM HUD, menus and overlays.
import { CONFIG } from './config.js';

// ======================================================================
// INPUT
// ======================================================================
// Keyboard + multi-touch buttons. "Pressed" flags last one frame.
export class Input {
    constructor() {
        this.keys = new Set();
        this.touch = { left: false, right: false, jump: false, attack: false, down: false };
        this._pressed = { jump: false, attack: false, enter: false, pause: false, down: false };
        this.onAnyKey = null;
        window.addEventListener('keydown', (e) => {
            const k = e.code;
            if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(k)) e.preventDefault();
            if (!this.keys.has(k)) {
                if (k === 'Space' || k === 'ArrowUp' || k === 'KeyW') this._pressed.jump = true;
                if (k === 'KeyJ' || k === 'KeyK' || k === 'KeyX' || k === 'KeyZ' || k === 'KeyF' || k === 'ShiftLeft' || k === 'ShiftRight') this._pressed.attack = true;
                if (k === 'KeyE' || k === 'Enter') this._pressed.enter = true;
                if (k === 'Escape' || k === 'KeyP') this._pressed.pause = true;
                if (k === 'ArrowDown' || k === 'KeyS') this._pressed.down = true;
            }
            this.keys.add(k);
            if (this.onAnyKey) this.onAnyKey(e);
        });
        window.addEventListener('keyup', (e) => this.keys.delete(e.code));
        window.addEventListener('blur', () => { this.keys.clear(); this.reset(); });
    }

    bindJoystick(el) {
        let pointer = null;
        const knob = el.querySelector('#joystick-knob');
        const center = () => {
            pointer = null;
            this.touch.left = this.touch.right = false;
            knob.style.setProperty('--stick-x', '0px');
            knob.style.setProperty('--stick-y', '0px');
            el.classList.remove('active');
        };
        const move = (e) => {
            const rect = el.getBoundingClientRect();
            const max = rect.width * 0.28;
            const dx = e.clientX - (rect.left + rect.width / 2);
            const dy = e.clientY - (rect.top + rect.height / 2);
            const length = Math.hypot(dx, dy);
            const scale = length > max ? max / length : 1;
            knob.style.setProperty('--stick-x', (dx * scale) + 'px');
            knob.style.setProperty('--stick-y', (dy * scale) + 'px');
            this.touch.left = dx < -max * 0.25;
            this.touch.right = dx > max * 0.25;
        };
        el.addEventListener('pointerdown', (e) => {
            if (pointer !== null) return;
            e.preventDefault();
            pointer = e.pointerId;
            try { el.setPointerCapture(pointer); } catch (_) { }
            el.classList.add('active');
            move(e);
        });
        el.addEventListener('pointermove', (e) => { if (e.pointerId === pointer) { e.preventDefault(); move(e); } });
        for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
            el.addEventListener(type, (e) => { if (e.pointerId === pointer) center(); });
        }
        el.addEventListener('contextmenu', (e) => e.preventDefault());
        this.centerJoystick = center;
    }

    bindButton(el, name) {
        const active = new Set();
        const down = (e) => {
            e.preventDefault();
            try { el.setPointerCapture(e.pointerId); } catch (_) { }
            active.add(e.pointerId);
            if (!this.touch[name]) {
                if (name === 'jump') this._pressed.jump = true;
                if (name === 'attack') this._pressed.attack = true;
                if (name === 'enter') this._pressed.enter = true;
                if (name === 'down') this._pressed.down = true;
            }
            this.touch[name] = true;
            el.classList.add('on');
            if (navigator.vibrate && (name === 'attack' || name === 'jump' || name === 'down')) { try { navigator.vibrate(8); } catch (_) { } }
        };
        const up = (e) => {
            active.delete(e.pointerId);
            if (active.size === 0) { this.touch[name] = false; el.classList.remove('on'); }
        };
        el.addEventListener('pointerdown', down);
        el.addEventListener('pointerup', up);
        el.addEventListener('pointercancel', up);
        el.addEventListener('lostpointercapture', up);
        el.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    get x() {
        const l = this.keys.has('ArrowLeft') || this.keys.has('KeyA') || this.touch.left;
        const r = this.keys.has('ArrowRight') || this.keys.has('KeyD') || this.touch.right;
        return (r ? 1 : 0) - (l ? 1 : 0);
    }
    get jumpHeld() { return this.keys.has('Space') || this.keys.has('ArrowUp') || this.keys.has('KeyW') || this.touch.jump; }
    get down() { return this.keys.has('ArrowDown') || this.keys.has('KeyS') || this.touch.down; }
    get jumpPressed() { return this._pressed.jump; }
    get attackPressed() { return this._pressed.attack; }
    get enterPressed() { return this._pressed.enter; }
    get pausePressed() { return this._pressed.pause; }
    get downPressed() { return this._pressed.down; }
    anyActive() { return this.x !== 0 || this.jumpHeld || this._pressed.jump || this._pressed.attack; }
    endFrame() { for (const k in this._pressed) this._pressed[k] = false; }
    reset() { this.endFrame(); for (const k in this.touch) this.touch[k] = false; if (this.centerJoystick) this.centerJoystick(); }
}

// ======================================================================
// UI
// ======================================================================
// DOM HUD, menus and overlays.

const $ = (id) => document.getElementById(id);

const HEART = '<svg viewBox="0 0 24 22"><path d="M12 21 C5 15 1 11.5 1 7 A5.5 5.5 0 0 1 12 4.5 A5.5 5.5 0 0 1 23 7 C23 11.5 19 15 12 21 Z" fill="#e8322a" stroke="#ffb3a0" stroke-width="1.2"/><path d="M6 6.5 A2.5 2.5 0 0 1 9 5" stroke="#ffd6cc" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>';
const HELM = '<svg viewBox="0 0 16 16"><path d="M3 15 V7 A5 5 0 0 1 13 7 V15 Z" fill="#c9d0db" stroke="#6a6f7a" stroke-width="1"/><rect x="4" y="8" width="8" height="1.6" fill="#1a1216"/><path d="M8 2 C10 0 12 1 13 2" stroke="#e24a2a" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';
const SOUND_ON = '<svg viewBox="0 0 24 24"><path d="M3 9 H7 L12 5 V19 L7 15 H3 Z" fill="#ffe2a0"/><path d="M15.5 8.5 A5 5 0 0 1 15.5 15.5 M18 6 A8.5 8.5 0 0 1 18 18" stroke="#ffe2a0" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';
const SOUND_OFF = '<svg viewBox="0 0 24 24"><path d="M3 9 H7 L12 5 V19 L7 15 H3 Z" fill="#ffe2a0"/><path d="M16 9 L22 15 M22 9 L16 15" stroke="#ff8a6a" stroke-width="2.2" stroke-linecap="round"/></svg>';

// the action button changes in the guardian's hall: sword, fire a cannon, throw a bomb
const ACTION_ICON = {
    sword: '<svg viewBox="0 0 24 24"><path d="M19 3 L21 5 L10 16 L8 14 Z" fill="#ffe2a0"/><path d="M5 13 L11 19 M4 20 L7 17" stroke="#ffb070" stroke-width="2.4" stroke-linecap="round"/></svg>',
    fire: '<svg viewBox="0 0 24 24"><path d="M2.5 15.5 L13.5 8.5 L16.5 13 L5.5 20 Z" fill="#ffe2a0"/><circle cx="7.5" cy="18.5" r="3" fill="#6a3a1a" stroke="#ffe2a0" stroke-width="1.6"/><path d="M17.5 6.5 L20 4 M18.5 10 L22.5 9.5 M15.5 5 L15.8 1.5" stroke="#ff8a3a" stroke-width="2.2" stroke-linecap="round"/></svg>',
    throw: '<svg viewBox="0 0 24 24"><circle cx="10" cy="14" r="7" fill="#ffe2a0"/><path d="M14 8 Q16 5 19 5" stroke="#ffb070" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M20 2 L20.8 4.2 L23 5 L20.8 5.8 L20 8 L19.2 5.8 L17 5 L19.2 4.2 Z" fill="#ff8a3a"/></svg>'
};

export class UI {
    constructor(game) {
        this.g = game;
        this.touchMode = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || matchMedia('(pointer: coarse)').matches;
        this.floaters = [];
        this._toastT = 0; this._centerT = 0;
        const I = game.input;
        I.bindJoystick($('joystick'));
        I.bindButton($('btn-jump'), 'jump');
        I.bindButton($('btn-attack'), 'attack');
        I.bindButton($('btn-enter'), 'enter');
        I.bindButton($('btn-dive'), 'down');
        const click = (id, fn) => $(id).addEventListener('click', (e) => { e.preventDefault(); game.audio.sfx('ui'); fn(); });
        click('play-btn', () => game.startGame());
        click('howto-btn', () => this.show('howto'));
        click('credits-btn', () => this.show('credits'));
        document.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => { game.audio.sfx('ui'); this.hide(b.dataset.close); }));
        click('pause-btn', () => game.pause());
        click('resume-btn', () => game.resume());
        click('exit-btn', () => { this.hide('pause'); this.show('confirm'); });
        click('confirm-yes', () => { this.hide('confirm'); game.toMenu(); });
        click('confirm-no', () => { this.hide('confirm'); if (game.state === 'paused') this.show('pause'); });
        click('retry-btn', () => game.retry());
        click('dead-menu-btn', () => game.toMenu());
        click('next-btn', () => game.nextLevel());
        click('mute-btn', () => this.toggleMute());
        click('pause-mute-btn', () => this.toggleMute());
        this.updateMuteIcons();
        // hearts
        this.hearts = $('hearts');
        this.hearts.innerHTML = HEART.repeat(CONFIG.MAX_HP);
    }

    toggleMute() {
        const m = !this.g.audio.muted;
        this.g.audio.setMuted(m);
        try { localStorage.setItem('sfal-muted', m ? '1' : '0'); } catch (_) { }
        this.updateMuteIcons();
    }
    updateMuteIcons() {
        const m = this.g.audio.muted;
        $('mute-btn').innerHTML = m ? SOUND_OFF : SOUND_ON;
        $('pause-mute-btn').textContent = m ? 'SOUND: OFF' : 'SOUND: ON';
    }

    show(id) { $(id).classList.remove('hidden'); }
    hide(id) { $(id).classList.add('hidden'); }
    hideAllScreens() { ['menu', 'howto', 'credits', 'pause', 'confirm', 'dead', 'win', 'loading'].forEach(s => this.hide(s)); }

    setHudVisible(v) {
        $('hud').classList.toggle('hidden', !v);
        $('touch').classList.toggle('hidden', !(v && this.touchMode));
        $('kb-hint').classList.toggle('hidden', !(v && !this.touchMode));
    }

    setScore(s) { $('score').textContent = Math.floor(s).toLocaleString('en-US'); }
    setLevel(l) { $('level-tag').textContent = 'TOWER ' + l; }
    setGreed(g, pulse) {
        $('greed-fill').style.width = Math.min(100, g) + '%';
        $('greed-pct').textContent = Math.floor(g) + '%';
        if (pulse) { const el = $('greed'); el.classList.remove('pulse'); void el.offsetWidth; el.classList.add('pulse'); }
    }
    setHearts(hp, hit) {
        const svgs = this.hearts.querySelectorAll('svg');
        svgs.forEach((s, i) => s.classList.toggle('lost', i >= hp));
        if (hit) { this.hearts.classList.remove('hit'); void this.hearts.offsetWidth; this.hearts.classList.add('hit'); }
    }
    setLives(n) { $('lives').innerHTML = HELM.repeat(Math.max(0, n)); }
    setKey(have) { $('key-slot').classList.toggle('have', have); }
    setMeter(knightFrac, lavaFrac, keyFrac) {
        $('meter-knight').style.bottom = (Math.max(0, Math.min(1, knightFrac)) * 100) + '%';
        $('meter-lava').style.height = (Math.max(0, Math.min(1, lavaFrac)) * 100) + '%';
        const k = $('meter-key');
        if (keyFrac === null) k.classList.add('hidden');
        else { k.classList.remove('hidden'); k.style.bottom = (keyFrac * 100) + '%'; }
    }
    setDoorPrompt(v) { $('btn-enter').classList.toggle('hidden', !v); if (!this.touchMode && v) this.toastOnce('door', 'Press <b>E</b> to enter the passage'); }
    setFrost(on) { $('frost').classList.toggle('on', on); }
    setLavaWarning(on) { $('damage').classList.toggle('lava', on); }
    damageFlash() {
        const d = $('damage');
        d.classList.add('hit');
        setTimeout(() => d.classList.remove('hit'), 120);
    }

    center(text, small, time = 0.9) {
        const el = $('center-msg');
        el.textContent = text;
        el.classList.toggle('small', !!small);
        el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
        this._centerT = time;
    }
    clearCenter() { $('center-msg').classList.remove('show'); this._centerT = 0; }
    sub(text) {
        const el = $('sub-msg');
        if (text) { el.textContent = text; el.classList.add('show'); } else el.classList.remove('show');
    }
    toast(html, time = 2.6) {
        const el = $('toast');
        el.innerHTML = html;
        el.classList.add('show');
        this._toastT = time;
    }
    hideToast() { this._toastT = 0; document.getElementById('toast').classList.remove('show'); }
    toastOnce(key, html) {
        this._once = this._once || {};
        if (this._once[key]) return;
        this._once[key] = true;
        this.toast(html);
    }

    floater(worldPos, text, color) {
        const el = document.createElement('div');
        el.className = 'floater';
        const sp = document.createElement('span');
        sp.textContent = text;
        el.appendChild(sp);
        if (color) el.style.color = color;
        $('floaters').appendChild(el);
        this.floaters.push({ el, pos: worldPos.clone(), t: 0 });
    }

    update(dt, camera) {
        if (this._toastT > 0) { this._toastT -= dt; if (this._toastT <= 0) $('toast').classList.remove('show'); }
        if (this._centerT > 0) { this._centerT -= dt; if (this._centerT <= 0) $('center-msg').classList.remove('show'); }
        const w = window.innerWidth, h = window.innerHeight;
        const o = {};
        for (let i = this.floaters.length - 1; i >= 0; i--) {
            const f = this.floaters[i];
            f.t += dt;
            if (f.t > 1.0) { f.el.remove(); this.floaters.splice(i, 1); continue; }
            f.pos.y += dt * 1.2;
            camera.project(f.pos, o);
            if (o.w <= 0) { f.el.style.display = 'none'; continue; }
            f.el.style.display = '';
            f.el.style.left = ((o.x * 0.5 + 0.5) * w) + 'px';
            f.el.style.top = ((-o.y * 0.5 + 0.5) * h) + 'px';
            f.el.style.opacity = String(Math.min(1, (1 - f.t) * 2.5));
        }
    }
    clearFloaters() { for (const f of this.floaters) f.el.remove(); this.floaters.length = 0; }

    // ---- ground-pound, combo, falls, intro
    setFalls(n, bump) {
        $('falls-n').textContent = String(n);
        if (bump) { const el = $('falls-tag'); el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
    }
    setDiveReady(on) {
        if (this._diveReady === on) return;
        this._diveReady = on;
        $('btn-dive').classList.toggle('ready', on);
    }
    // n: combo count, mult: multiplier, frac: time left 0..1 (n = 0 hides the meter)
    setCombo(n, mult, frac, bump) {
        const el = $('combo');
        const show = n > 0 && mult > 1;
        if (show !== this._comboShown) { this._comboShown = show; el.classList.toggle('show', show); }
        if (!show) return;
        if (this._comboMult !== mult) {
            this._comboMult = mult;
            const m = $('combo-mult');
            m.textContent = 'x' + mult;
            m.classList.toggle('hot', mult >= 5);
        }
        if (bump) { const m = $('combo-mult'); m.classList.remove('bump'); void m.offsetWidth; m.classList.add('bump'); }
        if (this._comboN !== n) { this._comboN = n; $('combo-n').textContent = n + ' COMBO'; }
        $('combo-fill').style.width = Math.round(Math.max(0, Math.min(1, frac)) * 100) + '%';
    }
    // big shout across the screen: SMASH x4!, EPIC!, AAAH...
    pop(text, cls) {
        const el = $('pop');
        el.textContent = text;
        el.className = cls || '';
        void el.offsetWidth;
        el.classList.add('go');
        clearTimeout(this._popTo);
        this._popTo = setTimeout(() => el.classList.remove('go'), 1100);
    }
    clearPop() { const el = $('pop'); el.className = ''; clearTimeout(this._popTo); }
    introTitle(mode) {
        const el = $('intro-title');
        el.classList.remove('show', 'out');
        if (mode) { void el.offsetWidth; el.classList.add(mode); }
    }
    setIntro(on) {
        $('letterbox').classList.toggle('on', on);
        const h = $('skip-hint');
        h.textContent = this.touchMode ? 'TAP TO SKIP' : 'PRESS ANY KEY TO SKIP';
        h.classList.toggle('hidden', !on);
        if (!on) this.introTitle(null);
    }

    showDead(title, rows, gameOver, bossRetry, fallLine) {
        $('dead-title').textContent = title;
        $('dead-falls').textContent = fallLine || '';
        $('dead-falls').classList.toggle('hidden', !fallLine);
        $('dead-stats').innerHTML = rows.map(([a, b, cls]) => `<span class="${cls || ''}">${a}</span><span class="${cls || ''}">${b}</span>`).join('');
        $('retry-btn').textContent = gameOver ? 'PLAY AGAIN' : bossRetry ? 'FIGHT AGAIN' : 'TRY AGAIN';
        this.show('dead');
    }

    // ---- guardian fight
    setActionMode(mode) {
        if (this._actMode === mode) return;
        this._actMode = mode;
        const b = $('btn-attack');
        b.innerHTML = ACTION_ICON[mode] || ACTION_ICON.sword;
        b.classList.toggle('fire', mode === 'fire');
        b.classList.toggle('throw', mode === 'throw');
        b.setAttribute('aria-label', mode === 'fire' ? 'Fire cannon' : mode === 'throw' ? 'Throw bomb' : 'Sword');
        const p = $('act-prompt');
        p.classList.toggle('touch', this.touchMode);
        if (this.touchMode) p.textContent = mode === 'fire' ? 'FIRE!' : 'THROW!';
        else p.innerHTML = '<b>J</b> ' + (mode === 'fire' ? 'FIRE THE CANNON' : 'THROW THE BOMB');
        p.classList.toggle('show', mode === 'fire' || mode === 'throw');
    }
    // arrow at the screen edge toward the nearest loaded cannon (-1 left, 1 right, 0 none)
    setSiegeHint(dir) {
        if (this._siegeDir === dir) return;
        this._siegeDir = dir;
        $('siege-left').classList.toggle('show', dir < 0);
        $('siege-right').classList.toggle('show', dir > 0);
    }
    setBossMode(on) {
        $('hud').classList.toggle('boss', on);
        $('bossbar').classList.toggle('hidden', !on);
        if (!on) { this.setActionMode('sword'); this.setSiegeHint(0); }
        if (!on) { $('bossbar').classList.remove('rage'); $('boss-title').classList.remove('show'); }
    }
    setBoss(name, frac, rage, hit) {
        $('boss-name').textContent = name;
        const w = Math.max(0, Math.min(1, frac)) * 100 + '%';
        $('boss-fill').style.width = w;
        $('boss-lag').style.width = w;
        const bar = $('bossbar');
        bar.classList.toggle('rage', !!rage);
        if (hit) { bar.classList.remove('hit'); void bar.offsetWidth; bar.classList.add('hit'); }
    }
    bossTitle(name, sub) {
        const el = $('boss-title');
        el.querySelector('.bt-name').textContent = name;
        el.querySelector('.bt-sub').textContent = sub;
        el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
    }
    fade(on, time = 0.6) {
        const f = $('fader');
        f.style.transitionDuration = time + 's';
        f.classList.toggle('on', on);
    }
    rageFlash(white) {
        const d = $('flash');
        d.classList.toggle('white', !!white);
        d.classList.remove('go'); void d.offsetWidth; d.classList.add('go');
    }
    showWin(title, rows) {
        $('win-title').textContent = title;
        $('win-stats').innerHTML = rows.map(([a, b, cls]) => `<span class="${cls || ''}">${a}</span><span class="${cls || ''}">${b}</span>`).join('');
        this.show('win');
    }
    setBest(b) { $('best').textContent = Math.floor(b).toLocaleString('en-US'); $('best-line').classList.toggle('hidden', b <= 0); }
    loaded() { this.hide('loading'); }
    error(msg) { $('error-text').textContent = msg; this.show('error'); this.hide('loading'); }
}