// Music playlist, generated boss music, ambience and sound effects.
/**
 * AudioManager for Sir Falls-A-Lot: Castle Climber
 *  - Music: HTMLAudioElement (assets/audio/tower-music.mp3 in the menu, assets/music1..6.mp3 in game)
 *  - SFX: procedural Web Audio (no extra assets, works offline)
 */

class AudioManagerClass {
    constructor() {
        this.ctx = null;
        this.master = null;
        this.sfxGain = null;
        this.muted = false;
        this._menuTrack = null;
        this._gameTrack = null;
        this._musicTracks = new Set();
        this._musicTransitionId = 0;
        this._playlist = ['assets/music2.mp3', 'assets/music3.mp3', 'assets/music4.mp3', 'assets/music5.mp3'];
        this._level = 1;
        this._gameTrackSrc = null;
        this._gameTrackIsBoss = false;
        this._musicVolume = 0.42;
        this._want = null; // 'menu' | 'game' | 'boss'
        this._unlocked = false;
        this._last = {};
        this._noise = null;
        this._voiceFiles = {
            fall: [
                'assets/audio/fall-misplaced-wall-2.mp3',
                'assets/audio/fall-feet-independence.mp3',
                'assets/audio/fall-tall-misunderstanding.mp3',
                'assets/audio/fall-theoretical-landing-2.mp3',
                'assets/audio/fall-not-dressed-descent.mp3',
                'assets/audio/fall-rude-castle-2.mp3',
                'assets/audio/fall-longer-rope.mp3',
                'assets/audio/fall-softest-rock.mp3',
                'assets/audio/fall-dramatic-exit.mp3',
                'assets/audio/fall-posture-trajectory.mp3'
            ],
            lava: [
                'assets/audio/lava-greaves-boiling.mp3',
                'assets/audio/lava-not-that-bath-2.mp3',
                'assets/audio/lava-cold-dungeon.mp3',
                'assets/audio/lava-wearable-oven.mp3',
                'assets/audio/lava-medium-rare.mp3',
                'assets/audio/lava-personal-grudge.mp3',
                'assets/audio/lava-toes-resigned.mp3',
                'assets/audio/lava-marshmallow.mp3',
                'assets/audio/lava-warm-welcome.mp3',
                'assets/audio/lava-fiery-career-choice.mp3'
            ]
        };
        this._voiceBag = {};
        this._voiceLastLine = {};
        this._voiceCooldown = {};
        this._voicePlayer = null;
        this._onGesture = this._onGesture.bind(this);
        ['pointerdown', 'touchstart', 'keydown', 'click'].forEach(e => document.addEventListener(e, this._onGesture, { passive: true }));
    }

    _onGesture() {
        if (!this.ctx) {
            try {
                const AC = window.AudioContext || window.webkitAudioContext;
                this.ctx = new AC();
                this.master = this.ctx.createGain();
                this.master.gain.value = this.muted ? 0 : 0.8;
                const comp = this.ctx.createDynamicsCompressor();
                comp.threshold.value = -14; comp.ratio.value = 4;
                this.master.connect(comp); comp.connect(this.ctx.destination);
                this.sfxGain = this.ctx.createGain();
                this.sfxGain.gain.value = 0.9;
                this.sfxGain.connect(this.master);
                const len = this.ctx.sampleRate * 1.5;
                this._noise = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
                const d = this._noise.getChannelData(0);
                for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
            } catch (e) { this.ctx = null; }
        }
        if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
        if (!this._unlocked) {
            this._unlocked = true;
            if (this._want === 'menu') this.playMenuMusic();
            else if (this._want === 'game') this.playGameMusic();
            else if (this._want === 'boss') this.playBossMusic(this._bossKind);
        }
        if (this.ctx && this._wantDrone && !this._drone) this.startDrone();
    }

    setMuted(m) {
        this.muted = m;
        if (this.master) this.master.gain.value = m ? 0 : 0.8;
        [...this._musicTracks, this._voicePlayer].forEach(a => { if (a) a.muted = m; });
    }

    // Short character voice clips; use a shuffle bag so each fall or lava hit varies.
    playVoice(kind) {
        const files = this._voiceFiles[kind];
        if (!files || !this._unlocked || this.muted) return false;
        const now = performance.now();
        const gap = kind === 'lava' ? 900 : 700;
        if (now - (this._voiceCooldown[kind] || 0) < gap) return false;

        const player = this._voicePlayer;
        // Let the current spoken line finish; never interrupt or overlap character dialogue.
        if (player && !player.paused && !player.ended) return false;

        let bag = this._voiceBag[kind];
        if (!bag || bag.length === 0) {
            bag = files.map((_, i) => i);
            for (let i = bag.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [bag[i], bag[j]] = [bag[j], bag[i]];
            }
            const previous = this._voiceLastLine[kind];
            if (files.length > 1 && files[bag[0]] === previous) [bag[0], bag[1]] = [bag[1], bag[0]];
            this._voiceBag[kind] = bag;
        }
        const src = files[bag.pop()];
        this._voiceLastLine[kind] = src;
        this._voiceCooldown[kind] = now;
        const voice = this._voicePlayer || (this._voicePlayer = new Audio());
        voice.pause();
        voice.src = src;
        voice.preload = 'auto';
        voice.volume = 0.78;
        voice.muted = this.muted;
        voice.play().catch(() => { });
        return true;
    }
    stopVoice() {
        if (!this._voicePlayer) return;
        this._voicePlayer.pause();
        this._voicePlayer.currentTime = 0;
    }

    // ---------------- music ----------------
    _audio(src, loop) {
        const a = new Audio();
        a.src = src; a.loop = loop; a.volume = this._musicVolume; a.preload = 'auto'; a.muted = this.muted;
        this._musicTracks.add(a);
        return a;
    }
    _fade(a, to, ms, done) {
        if (!a) return;
        clearInterval(a._fadeIv);
        const from = a.volume, steps = 20;
        let i = 0;
        a._fadeIv = setInterval(() => {
            i++;
            a.volume = Math.max(0, Math.min(1, from + (to - from) * (i / steps)));
            if (i >= steps) { clearInterval(a._fadeIv); a._fadeIv = null; done && done(); }
        }, ms / steps);
    }
    _startMusicTrack(track, transitionId) {
        if (!track || transitionId !== this._musicTransitionId) return;
        if (!track.paused) {
            this._fade(track, this._musicVolume, 300);
            return;
        }
        track.volume = 0;
        track.play().then(() => {
            if (transitionId !== this._musicTransitionId) return;
            this._fade(track, this._musicVolume, 800);
        }).catch(() => { });
    }
    // Fade the old track to silence and pause it before starting another.
    // This deliberately avoids crossfades, so only one music source can play at once.
    _switchMusicTo(next, fadeMs = 500) {
        const transitionId = ++this._musicTransitionId;
        const outgoing = [...this._musicTracks].filter(track => track !== next);
        const playing = outgoing.filter(track => !track.paused);

        // If this target was already playing alongside another source, stop it too;
        // it will restart only after every outgoing track has been paused.
        if (next && !next.paused && playing.length) {
            next.pause();
            clearInterval(next._fadeIv);
            next._fadeIv = null;
            next.volume = 0;
        }
        outgoing.filter(track => track.paused).forEach(track => {
            track.pause();
            clearInterval(track._fadeIv);
            track._fadeIv = null;
            if (track !== this._menuTrack && track !== this._gameTrack) this._musicTracks.delete(track);
        });
        if (!playing.length) {
            if (next) this._startMusicTrack(next, transitionId);
            return;
        }

        let remaining = playing.length;
        playing.forEach(track => this._fade(track, 0, fadeMs, () => {
            track.pause();
            if (track !== this._menuTrack && track !== this._gameTrack) this._musicTracks.delete(track);
            if (transitionId !== this._musicTransitionId) return;
            remaining--;
            if (remaining === 0 && next) this._startMusicTrack(next, transitionId);
        }));
    }
    playMenuMusic() {
        this._want = 'menu';
        this.stopBossMusic(false, true);
        this.stopDrone();
        if (!this._unlocked) return;
        if (!this._menuTrack) this._menuTrack = this._audio('assets/audio/tower-music.mp3', true);
        this._switchMusicTo(this._menuTrack, 600);
    }
    playGameMusic(level = this._level) {
        if (Number.isFinite(level)) this._level = Math.max(1, Math.floor(level));
        this._want = 'game';
        this.stopBossMusic(false, true);
        this.startDrone();
        if (!this._unlocked) return;
        const src = this._level === 1 ? 'assets/music1.mp3' : this._playlist[(this._level - 2) % this._playlist.length];
        this._playGameTrack(src, false);
    }
    _playGameTrack(src, isBoss) {
        const current = this._gameTrack;
        if (current && this._gameTrackSrc === src) {
            this._gameTrackIsBoss = isBoss;
            current.loop = true;
            this._switchMusicTo(current, 300);
            return;
        }
        const next = this._audio(src, true);
        this._gameTrack = next;
        this._gameTrackSrc = src;
        this._gameTrackIsBoss = isBoss;
        this._switchMusicTo(next, 600);
    }
    // Silence every music track for a cinematic beat; the next play*Music call restores one.
    fadeOutMusic() {
        this._want = null;
        this._switchMusicTo(null, 700);
    }
    duckMusic(on) {
        const a = this._want === 'game' || this._want === 'boss' ? this._gameTrack : this._menuTrack;
        if (a && !a.paused) this._fade(a, on ? this._musicVolume * 0.35 : this._musicVolume, 300);
        if (this._boss && this.ctx) this._boss.out.gain.setTargetAtTime(on ? 0.12 : 0.5, this.ctx.currentTime, 0.1);
    }

    // ---------------- boss music: use the dedicated looping boss-level track ----------------
    playBossMusic(kind) {
        this._want = 'boss';
        this._bossKind = kind || 0;
        this.stopDrone();
        if (!this._unlocked) return;
        this._playGameTrack('assets/music6.mp3', true);
    }
    bossRage(on) { if (this._boss) { this._boss.rage = on; this._boss.bpm = on ? 148 : 128; } }
    stopBossMusic(now, keepMusic = false) {
        const b = this._boss;
        if (b) {
            this._boss = null;
            clearInterval(b.iv);
            if (this.ctx) {
                const t = this.ctx.currentTime;
                b.out.gain.cancelScheduledValues(t);
                b.out.gain.setValueAtTime(Math.max(0.0001, b.out.gain.value), t);
                b.out.gain.exponentialRampToValueAtTime(0.0001, t + (now ? 0.05 : 1.6));
                setTimeout(() => { try { b.out.disconnect(); } catch (_) { } }, now ? 200 : 1800);
            }
        }
        if (this._gameTrackIsBoss) {
            this._gameTrackIsBoss = false;
            if (!keepMusic) this._switchMusicTo(null, now ? 50 : 500);
        }
    }
    _bossTick() {
        const b = this._boss, c = this.ctx;
        if (!b || !c) return;
        const spb = 60 / b.bpm / 2;
        if (b.next < c.currentTime - 0.5) b.next = c.currentTime + 0.05;
        while (b.next < c.currentTime + 0.25) {
            this._bossStep(b, b.step, b.next, spb);
            b.next += spb; b.step++;
        }
    }
    _bossStep(b, i, t, spb) {
        const c = this.ctx, out = b.out;
        const bar = Math.floor(i / 16) % 4, s = i % 16;
        const root = b.roots[bar];
        // war drums
        const kick = (s === 0 || s === 3 || s === 6 || s === 8 || s === 11 || (b.rage && (s === 13 || s === 14)));
        if (kick) this._drum(t, s === 0 || s === 8 ? 1 : 0.7, out);
        if (s === 4 || s === 12) this._snare(t, out);
        if (s % 2 === 1) this._shaker(t, b.rage ? 0.05 : 0.03, out);
        // bass ostinato
        if (s % 2 === 0) {
            const f = root * (s === 6 || s === 14 ? 1.5 : s === 10 ? 1.189 : 1);
            this._bass(t, f, spb * 1.7, out);
        }
        // brass stab (power chord) each bar, answered on beat 3 in the last bar
        if (s === 0 || (bar === 3 && s === 8)) this._stab(t, root * 2, spb * (s === 0 ? 5 : 3), out, b.rage);
        // high tension strings in the second half
        if ((bar === 2 || bar === 3) && s === 0) this._tension(t, root * 8, spb * 16, out);
    }
    _drum(t, v, out) {
        const c = this.ctx;
        const o = c.createOscillator(), g = c.createGain();
        o.type = 'sine'; o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.22);
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.9 * v, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
        o.connect(g); g.connect(out); o.start(t); o.stop(t + 0.45);
        const s = c.createBufferSource(); s.buffer = this._noise;
        const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 700;
        const g2 = c.createGain(); g2.gain.setValueAtTime(0.0001, t); g2.gain.exponentialRampToValueAtTime(0.35 * v, t + 0.004); g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
        s.connect(f); f.connect(g2); g2.connect(out); s.start(t, Math.random()); s.stop(t + 0.15);
    }
    _snare(t, out) {
        const c = this.ctx;
        const s = c.createBufferSource(); s.buffer = this._noise;
        const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1400; f.Q.value = 0.8;
        const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.32, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
        s.connect(f); f.connect(g); g.connect(out); s.start(t, Math.random()); s.stop(t + 0.25);
        const o = c.createOscillator(), g2 = c.createGain();
        o.type = 'triangle'; o.frequency.setValueAtTime(220, t); o.frequency.exponentialRampToValueAtTime(120, t + 0.1);
        g2.gain.setValueAtTime(0.0001, t); g2.gain.exponentialRampToValueAtTime(0.2, t + 0.004); g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
        o.connect(g2); g2.connect(out); o.start(t); o.stop(t + 0.14);
    }
    _shaker(t, v, out) {
        const c = this.ctx;
        const s = c.createBufferSource(); s.buffer = this._noise;
        const f = c.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 6000;
        const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
        s.connect(f); f.connect(g); g.connect(out); s.start(t, Math.random()); s.stop(t + 0.07);
    }
    _bass(t, f0, dur, out) {
        const c = this.ctx;
        const f = c.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = 4;
        f.frequency.setValueAtTime(900, t); f.frequency.exponentialRampToValueAtTime(160, t + dur);
        const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.28, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        f.connect(g); g.connect(out);
        for (const d of [-6, 6]) {
            const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f0; o.detune.value = d;
            o.connect(f); o.start(t); o.stop(t + dur + 0.05);
        }
    }
    _stab(t, f0, dur, out, rage) {
        const c = this.ctx;
        const f = c.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = 2;
        f.frequency.setValueAtTime(400, t); f.frequency.exponentialRampToValueAtTime(rage ? 2600 : 1800, t + 0.06); f.frequency.exponentialRampToValueAtTime(350, t + dur);
        const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.13, t + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        f.connect(g); g.connect(out);
        for (const m of [1, 1.5, 2, rage ? 1.06 : 2.0]) {
            const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f0 * m; o.detune.value = (Math.random() - 0.5) * 12;
            o.connect(f); o.start(t); o.stop(t + dur + 0.05);
        }
    }
    _tension(t, f0, dur, out) {
        const c = this.ctx;
        const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.025, t + dur * 0.4); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        g.connect(out);
        const lfo = c.createOscillator(), lg = c.createGain(); lfo.frequency.value = 7; lg.gain.value = 0.012; lfo.connect(lg); lg.connect(g.gain);
        lfo.start(t); lfo.stop(t + dur + 0.05);
        for (const m of [1, 1.0595]) {
            const o = c.createOscillator(); o.type = 'triangle'; o.frequency.value = f0 * m;
            o.connect(g); o.start(t); o.stop(t + dur + 0.05);
        }
    }

    // ---------------- ambience: a low drone under the tower, bells and whispers on cue ----------------
    startDrone() {
        this._wantDrone = true;
        if (!this.ctx || this._drone) return;
        const c = this.ctx, t = c.currentTime;
        const out = c.createGain(); out.gain.setValueAtTime(0.0001, t); out.gain.exponentialRampToValueAtTime(0.05, t + 3);
        const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 220; f.Q.value = 3;
        const lfo = c.createOscillator(), lg = c.createGain(); lfo.frequency.value = 0.07; lg.gain.value = 110; lfo.connect(lg); lg.connect(f.frequency);
        const oscs = [];
        for (const [fr, type] of [[55, 'sawtooth'], [55.4, 'sawtooth'], [82.4, 'triangle'], [27.5, 'sine']]) {
            const o = c.createOscillator(); o.type = type; o.frequency.value = fr; o.connect(f); o.start(); oscs.push(o);
        }
        f.connect(out); out.connect(this.master);
        lfo.start();
        this._drone = { out, oscs: oscs.concat([lfo]) };
    }
    stopDrone() {
        this._wantDrone = false;
        const d = this._drone;
        if (!d || !this.ctx) return;
        this._drone = null;
        const t = this.ctx.currentTime;
        d.out.gain.cancelScheduledValues(t);
        d.out.gain.setValueAtTime(Math.max(0.0001, d.out.gain.value), t);
        d.out.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
        setTimeout(() => { d.oscs.forEach(o => { try { o.stop(); } catch (_) { } }); try { d.out.disconnect(); } catch (_) { } }, 1400);
    }
    _bell(vol, f0) {
        const c = this.ctx, t = c.currentTime;
        const partials = [[0.5, 0.5, 4.5], [1, 1, 3.5], [1.19, 0.6, 2.6], [1.5, 0.45, 2.2], [2.0, 0.4, 1.8], [2.74, 0.22, 1.3], [3.76, 0.12, 0.9]];
        const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 2400;
        f.connect(this.sfxGain);
        for (const [m, a, d] of partials) {
            const o = c.createOscillator(), g = c.createGain();
            o.type = 'sine'; o.frequency.value = f0 * m;
            g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol * a, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
            o.connect(g); g.connect(f); o.start(t); o.stop(t + d + 0.1);
        }
    }
    _whisper() {
        const c = this.ctx, t = c.currentTime;
        for (let k = 0; k < 3; k++) {
            const s = c.createBufferSource(); s.buffer = this._noise;
            const f = c.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 9;
            const f0 = 900 + Math.random() * 1600;
            f.frequency.setValueAtTime(f0, t + k * 0.35); f.frequency.linearRampToValueAtTime(f0 * (0.7 + Math.random() * 0.6), t + k * 0.35 + 0.6);
            const g = c.createGain(); g.gain.setValueAtTime(0.0001, t + k * 0.35); g.gain.exponentialRampToValueAtTime(0.12, t + k * 0.35 + 0.2); g.gain.exponentialRampToValueAtTime(0.0001, t + k * 0.35 + 0.7);
            const p = c.createStereoPanner ? c.createStereoPanner() : null;
            s.connect(f); f.connect(g);
            if (p) { p.pan.value = (Math.random() - 0.5) * 1.6; g.connect(p); p.connect(this.sfxGain); } else g.connect(this.sfxGain);
            s.start(t + k * 0.35, Math.random()); s.stop(t + k * 0.35 + 0.8);
        }
    }

    // ---------------- sfx helpers ----------------
    _ok(name, gap) {
        if (!this.ctx || this.muted) return false;
        const now = performance.now();
        if (now - (this._last[name] || 0) < gap) return false;
        this._last[name] = now;
        return true;
    }
    _env(g, t, a, peak, d, sustain = 0) {
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(peak, t + a);
        g.gain.exponentialRampToValueAtTime(Math.max(0.0001, sustain || 0.0001), t + a + d);
    }
    _tone(type, f0, f1, dur, vol, t0 = 0, dest) {
        const c = this.ctx, t = c.currentTime + t0;
        const o = c.createOscillator(), g = c.createGain();
        o.type = type;
        o.frequency.setValueAtTime(f0, t);
        if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
        this._env(g, t, 0.005, vol, dur);
        o.connect(g); g.connect(dest || this.sfxGain);
        o.start(t); o.stop(t + dur + 0.05);
    }
    _noiseHit(filterType, f0, f1, q, dur, vol, t0 = 0, attack = 0.005) {
        const c = this.ctx, t = c.currentTime + t0;
        const s = c.createBufferSource(); s.buffer = this._noise;
        s.playbackRate.value = 1;
        const f = c.createBiquadFilter(); f.type = filterType; f.Q.value = q;
        f.frequency.setValueAtTime(f0, t);
        f.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + dur);
        const g = c.createGain();
        this._env(g, t, attack, vol, dur);
        s.connect(f); f.connect(g); g.connect(this.sfxGain);
        s.start(t, Math.random() * 0.5); s.stop(t + dur + attack + 0.05);
    }

    sfx(name, arg) {
        switch (name) {
            case 'jump': if (this._ok(name, 60)) { this._tone('triangle', 260, 520, 0.14, 0.18); this._noiseHit('highpass', 1800, 3000, 0.7, 0.08, 0.05); } break;
            case 'land': if (this._ok(name, 80)) { const v = Math.min(0.45, 0.12 + (arg || 0) * 0.015); this._tone('sine', 120, 45, 0.16, v); this._noiseHit('lowpass', 900, 200, 0.8, 0.12, v * 0.5); } break;
            case 'step': if (this._ok(name, 90)) { this._noiseHit('bandpass', 700 + Math.random() * 300, 400, 2, 0.05, 0.05); this._tone('sine', 90, 60, 0.05, 0.05); } break;
            case 'swing': if (this._ok(name, 80)) { this._noiseHit('bandpass', 700, 3200, 1.5, 0.22, 0.28, 0, 0.04); } break;
            case 'hit': if (this._ok(name, 40)) { this._tone('square', 320, 90, 0.12, 0.12); this._noiseHit('bandpass', 2500, 800, 1.5, 0.12, 0.22); } break;
            case 'clang': if (this._ok(name, 60)) { this._tone('triangle', 1250, 1150, 0.35, 0.16); this._tone('sine', 2480, 2400, 0.3, 0.08); this._noiseHit('highpass', 4000, 3000, 1, 0.1, 0.15); } break;
            case 'bones': if (this._ok(name, 60)) { for (let i = 0; i < 6; i++) this._noiseHit('bandpass', 1800 + Math.random() * 1600, 900, 6, 0.05, 0.16, i * 0.045 + Math.random() * 0.02); } break;
            case 'squeak': if (this._ok(name, 80)) { this._tone('sine', 1900, 2600, 0.08, 0.12); this._tone('sine', 2400, 1500, 0.1, 0.1, 0.09); } break;
            case 'screech': if (this._ok(name, 80)) { this._tone('sawtooth', 3200, 1900, 0.18, 0.06); this._noiseHit('highpass', 5000, 3000, 2, 0.15, 0.08); } break;
            case 'squish': if (this._ok(name, 80)) { this._noiseHit('lowpass', 1200, 200, 3, 0.18, 0.3); this._tone('sine', 200, 60, 0.15, 0.15); } break;
            case 'coin': if (this._ok(name, 35)) { const b = 1 + (arg || 0) * 0.02; this._tone('square', 988 * b, 988 * b, 0.07, 0.07); this._tone('square', 1319 * b, 1319 * b, 0.18, 0.07, 0.06); } break;
            case 'key': if (this._ok(name, 200)) { [523, 659, 784, 1047, 1319].forEach((f, i) => this._tone('triangle', f, f, 0.35, 0.14, i * 0.07)); } break;
            case 'treasure': if (this._ok(name, 200)) { this._noiseHit('lowpass', 600, 200, 1, 0.3, 0.25); [392, 523, 659, 784, 1047].forEach((f, i) => { this._tone('triangle', f, f, 0.45, 0.13, 0.12 + i * 0.06); this._tone('sine', f * 2, f * 2, 0.3, 0.05, 0.12 + i * 0.06); }); } break;
            case 'hourglass': if (this._ok(name, 200)) { for (let i = 0; i < 8; i++) this._tone('sine', 1800 - i * 150, 1700 - i * 150, 0.3, 0.07, i * 0.04); this._tone('sine', 200, 80, 1.2, 0.15); } break;
            case 'heart': if (this._ok(name, 200)) { [659, 784, 988].forEach((f, i) => this._tone('sine', f, f, 0.3, 0.14, i * 0.08)); } break;
            case 'hurt': if (this._ok(name, 150)) { this._tone('sawtooth', 300, 90, 0.3, 0.2); this._noiseHit('lowpass', 1800, 300, 1, 0.25, 0.25); } break;
            case 'die': if (this._ok(name, 300)) { this._tone('sawtooth', 392, 60, 0.9, 0.22); this._tone('square', 196, 40, 1.0, 0.1, 0.05); this._noiseHit('lowpass', 800, 100, 1, 0.8, 0.2); } break;
            case 'burn': if (this._ok(name, 300)) { this._noiseHit('lowpass', 3000, 300, 0.5, 1.2, 0.4, 0, 0.05); this._tone('sawtooth', 300, 50, 1.0, 0.15); } break;
            case 'win': if (this._ok(name, 400)) { [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => { this._tone('triangle', f, f, 0.3, 0.15, i * 0.11); this._tone('sine', f / 2, f / 2, 0.3, 0.08, i * 0.11); }); } break;
            case 'lava': if (this._ok(name, 500)) { this._tone('sine', 55, 35, 0.5, 0.35); this._noiseHit('lowpass', 300, 80, 1, 0.5, 0.25); } break;
            case 'crumble': if (this._ok(name, 120)) { for (let i = 0; i < 4; i++) this._noiseHit('lowpass', 900, 150, 1, 0.2, 0.22, i * 0.06); this._tone('sine', 80, 40, 0.3, 0.2); } break;
            case 'roar': if (this._ok(name, 700)) { this._noiseHit('bandpass', 380, 140, 2.5, 0.9, 0.35, 0, 0.08); this._tone('sawtooth', 110, 60, 0.9, 0.12, 0, null); this._tone('sawtooth', 165, 70, 0.8, 0.07, 0.05); } break;
            case 'fire': if (this._ok(name, 100)) { this._noiseHit('lowpass', 2000, 400, 0.7, 0.4, 0.2, 0, 0.03); } break;
            case 'boom': if (this._ok(name, 80)) { this._tone('sine', 110, 35, 0.45, 0.35); this._noiseHit('lowpass', 1500, 120, 0.8, 0.45, 0.35); } break;
            case 'door': if (this._ok(name, 300)) { this._noiseHit('lowpass', 400, 120, 2, 0.8, 0.25, 0, 0.1); this._tone('sawtooth', 70, 55, 0.8, 0.06); } break;
            case 'gate': if (this._ok(name, 500)) { this._noiseHit('lowpass', 500, 150, 3, 1.4, 0.3, 0, 0.2); [262, 392, 523].forEach((f, i) => this._tone('triangle', f, f, 0.9, 0.1, 0.3 + i * 0.15)); } break;
            case 'thunder': if (this._ok(name, 1500)) { this._noiseHit('lowpass', 300, 40, 0.5, 2.2, 0.35, 0.25, 0.02); this._noiseHit('lowpass', 1200, 100, 0.5, 0.6, 0.15, 0.2); } break;
            case 'beep': if (this._ok(name, 200)) { this._tone('square', arg ? 1046 : 523, arg ? 1046 : 523, arg ? 0.35 : 0.14, 0.12); } break;
            case 'ui': if (this._ok(name, 60)) { this._tone('triangle', 660, 880, 0.08, 0.1); } break;
            // ---- guardians
            case 'growl': if (this._ok(name, 300)) { this._noiseHit('bandpass', 260, 130, 3, 0.75, 0.4, 0, 0.08); this._tone('sawtooth', 82, 58, 0.7, 0.13); this._tone('sawtooth', 123, 80, 0.6, 0.06, 0.05); } break;
            case 'bossroar': if (this._ok(name, 700)) { this._noiseHit('bandpass', 520, 120, 2.2, 1.5, 0.55, 0, 0.12); this._tone('sawtooth', 130, 52, 1.4, 0.2); this._tone('sawtooth', 196, 70, 1.2, 0.1, 0.04); this._tone('sine', 62, 34, 1.5, 0.35); } break;
            case 'summon': if (this._ok(name, 600)) { this._tone('sine', 180, 720, 1.3, 0.12); this._tone('sine', 190, 760, 1.3, 0.1, 0.05); this._noiseHit('highpass', 1200, 5000, 1, 1.2, 0.12, 0, 0.4); this._tone('sawtooth', 55, 50, 1.4, 0.12); } break;
            case 'slam': if (this._ok(name, 120)) { this._tone('sine', 95, 28, 0.7, 0.6); this._noiseHit('lowpass', 2200, 90, 0.8, 0.6, 0.55); this._tone('square', 60, 30, 0.25, 0.12); for (let i = 0; i < 4; i++) this._noiseHit('lowpass', 900, 150, 1, 0.18, 0.15, 0.08 + i * 0.07); } break;
            case 'hiss': if (this._ok(name, 250)) { this._noiseHit('highpass', 2800, 5200, 1.2, 0.6, 0.3, 0, 0.08); } break;
            case 'stab': if (this._ok(name, 100)) { this._noiseHit('bandpass', 1600, 400, 2, 0.14, 0.4); this._tone('sine', 160, 45, 0.25, 0.4); } break;
            case 'screechBig': if (this._ok(name, 500)) { this._tone('sawtooth', 1900, 850, 0.6, 0.12); this._tone('sawtooth', 2500, 1100, 0.55, 0.08, 0.03); this._noiseHit('highpass', 4000, 2500, 2, 0.5, 0.15); } break;
            case 'web': if (this._ok(name, 90)) { this._noiseHit('lowpass', 3200, 400, 1, 0.16, 0.3); this._tone('sine', 700, 180, 0.12, 0.1); } break;
            case 'hatch': if (this._ok(name, 90)) { for (let i = 0; i < 3; i++) this._noiseHit('bandpass', 2600, 1200, 5, 0.05, 0.25, i * 0.05); this._noiseHit('lowpass', 1000, 200, 3, 0.2, 0.25, 0.12); } break;
            case 'enrage': if (this._ok(name, 1500)) { this._noiseHit('bandpass', 600, 110, 2, 1.8, 0.6, 0, 0.15); [110, 116.5, 155.6, 164.8].forEach((f, i) => this._tone('sawtooth', f, f * 0.8, 1.6, 0.08, i * 0.03)); this._tone('sine', 55, 30, 1.8, 0.4); } break;
            case 'fireblast': if (this._ok(name, 300)) { this._noiseHit('lowpass', 1800, 500, 0.8, 1.4, 0.45, 0, 0.12); this._noiseHit('bandpass', 700, 300, 1.5, 1.2, 0.2, 0.1, 0.1); } break;
            case 'shock': if (this._ok(name, 150)) { this._tone('square', 900, 180, 0.3, 0.08); this._noiseHit('highpass', 3000, 1500, 2, 0.25, 0.15); } break;
            case 'bosshit': if (this._ok(name, 50)) { this._tone('square', 190, 60, 0.16, 0.2); this._noiseHit('lowpass', 1500, 180, 1, 0.22, 0.45); this._noiseHit('bandpass', 3200, 1400, 3, 0.08, 0.2); } break;
            case 'reflect': if (this._ok(name, 80)) { this._tone('triangle', 1400, 2100, 0.2, 0.14); this._tone('sine', 2800, 2700, 0.35, 0.06); this._noiseHit('highpass', 4500, 3000, 1, 0.15, 0.12); } break;
            case 'bossdie': if (this._ok(name, 2000)) { this._noiseHit('bandpass', 480, 60, 1.8, 3.2, 0.6, 0, 0.1); this._tone('sawtooth', 150, 28, 3.0, 0.2); this._tone('sawtooth', 224, 40, 2.6, 0.1, 0.1); this._tone('sine', 58, 22, 3.4, 0.45); this._noiseHit('lowpass', 900, 50, 0.5, 3.5, 0.35, 0.5, 0.2); } break;
            case 'victory': if (this._ok(name, 1000)) { [262, 330, 392, 523, 392, 523, 659, 784].forEach((f, i) => { this._tone('triangle', f, f, 0.45, 0.14, 0.2 + i * 0.13); this._tone('sawtooth', f / 2, f / 2, 0.4, 0.04, 0.2 + i * 0.13); }); this._bell(0.12, 262); } break;
            // ---- dread
            case 'bell': if (this._ok(name, 2500) && this.ctx) { this._bell(arg || 0.09, 98); } break;
            case 'whisper': if (this._ok(name, 4000) && this.ctx) { this._whisper(); } break;
            case 'heartbeat': if (this._ok(name, 500)) { this._tone('sine', 62, 38, 0.14, 0.45); this._tone('sine', 58, 36, 0.12, 0.32, 0.2); } break;
            // siege weapons in the guardian's hall
            case 'cannon': if (this._ok(name, 150)) { this._tone('sine', 75, 24, 0.9, 0.75); this._noiseHit('lowpass', 2600, 70, 0.7, 0.9, 0.7, 0, 0.004); this._noiseHit('bandpass', 900, 200, 1.2, 0.35, 0.35, 0.02); this._tone('square', 48, 30, 0.3, 0.15); } break;
            case 'fuse': if (this._ok(name, 120)) { this._noiseHit('highpass', 5200, 7000, 1.5, 0.32, 0.18, 0, 0.01); this._noiseHit('bandpass', 3400, 2200, 4, 0.3, 0.1, 0.05); } break;
            case 'pickup': if (this._ok(name, 120)) { this._tone('triangle', 330, 660, 0.12, 0.16); this._tone('triangle', 494, 988, 0.14, 0.12, 0.07); this._noiseHit('bandpass', 1200, 900, 3, 0.08, 0.1); } break;
            case 'throw': if (this._ok(name, 100)) { this._noiseHit('bandpass', 500, 2400, 1.2, 0.28, 0.3, 0, 0.05); this._tone('sine', 240, 420, 0.2, 0.08); } break;
            case 'explosion': if (this._ok(name, 70)) { this._tone('sine', 90, 22, 1.1, 0.8); this._noiseHit('lowpass', 3200, 60, 0.6, 1.2, 0.75, 0, 0.004); this._noiseHit('bandpass', 1400, 250, 1, 0.5, 0.35, 0.03); for (let i = 0; i < 5; i++) this._noiseHit('lowpass', 1200, 200, 1, 0.12, 0.12, 0.15 + i * 0.09 + Math.random() * 0.04); } break;
            case 'reload': if (this._ok(name, 400)) { this._noiseHit('bandpass', 2200, 1600, 6, 0.06, 0.25); this._tone('square', 700, 700, 0.05, 0.08, 0.08); this._noiseHit('bandpass', 1500, 900, 6, 0.08, 0.28, 0.14); } break;
            // ---- ground-pound, slapstick falls, combo, title
            case 'dive': if (this._ok(name, 120)) { this._tone('triangle', 520, 1100, 0.12, 0.12); this._noiseHit('bandpass', 2400, 500, 1.2, 0.35, 0.3, 0.1, 0.12); } break;
            case 'smash': if (this._ok(name, 80)) {
                const p = Math.min(1.4, arg || 0.5);
                this._tone('sine', 120, 26, 0.6 + p * 0.5, 0.55 + p * 0.25);
                this._noiseHit('lowpass', 2600 + p * 1200, 70, 0.7, 0.5 + p * 0.5, 0.5 + p * 0.25, 0, 0.003);
                this._tone('square', 70, 32, 0.25, 0.14);
                for (let i = 0; i < 3 + Math.round(p * 4); i++) this._noiseHit('lowpass', 1100, 160, 1, 0.14, 0.14, 0.08 + i * 0.07 + Math.random() * 0.03);
                if (p > 0.6) this._tone('triangle', 1250, 1150, 0.4, 0.07, 0.02);
            } break;
            case 'splat': if (this._ok(name, 120)) { this._tone('sine', 150, 40, 0.25, 0.45); this._noiseHit('lowpass', 1400, 150, 1, 0.22, 0.4); this._tone('triangle', 1350, 1200, 0.45, 0.1, 0.03); this._tone('sine', 2650, 2600, 0.4, 0.05, 0.03); } break;
            case 'oof': if (this._ok(name, 300)) { this._voice([[310, 0], [180, 0.22]], 0.26, 0.22, [[600, 8], [1000, 9], [2400, 10]], 0.04); } break;
            case 'scream': if (this._ok(name, 900) && !this._scream) { this._scream = this._voice([[420, 0], [470, 0.25], [440, 0.9], [360, 1.6]], 1.7, 0.2, [[820, 7], [1250, 8], [2600, 10]], 0.12, 7); } break;
            case 'combo': if (this._ok(name, 90)) { const l = Math.max(2, Math.min(8, arg || 2)); const b = 440 * Math.pow(1.122, l - 2); [1, 1.26, 1.5, 2].forEach((m, i) => this._tone('square', b * m, b * m, 0.12, 0.06, i * 0.045)); this._tone('triangle', b * 2, b * 2, 0.3, 0.08, 0.18); } break;
            case 'titleSlam': if (this._ok(name, 800)) { this._tone('sine', 90, 24, 1.3, 0.8); this._noiseHit('lowpass', 3000, 60, 0.6, 1.2, 0.6, 0, 0.004); [131, 196, 262, 330].forEach((f, i) => { this._tone('sawtooth', f, f, 1.6, 0.06, 0.02 + i * 0.01); }); this._bell(0.1, 131); } break;
            case 'whoosh': if (this._ok(name, 300)) { this._noiseHit('bandpass', 300, 2600, 1.4, 0.9, 0.32, 0, 0.35); } break;
        }
    }

    // a formant-filtered "voice": pitch points [[f, time]], vowel formants [[freq, Q]]
    _voice(pitch, dur, vol, formants, attack, vib = 5) {
        if (!this.ctx) return null;
        const c = this.ctx, t = c.currentTime;
        const src = c.createOscillator(); src.type = 'sawtooth';
        src.frequency.setValueAtTime(pitch[0][0], t);
        for (let i = 1; i < pitch.length; i++) src.frequency.linearRampToValueAtTime(pitch[i][0], t + pitch[i][1]);
        const lfo = c.createOscillator(), lg = c.createGain(); lfo.frequency.value = vib; lg.gain.value = pitch[0][0] * 0.035;
        lfo.connect(lg); lg.connect(src.frequency);
        const out = c.createGain();
        out.gain.setValueAtTime(0.0001, t);
        out.gain.exponentialRampToValueAtTime(vol, t + attack);
        out.gain.setValueAtTime(vol, t + Math.max(attack, dur - 0.25));
        out.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        formants.forEach(([f, q], i) => {
            const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = f; bp.Q.value = q;
            const g = c.createGain(); g.gain.value = [1, 0.6, 0.25][i] || 0.2;
            src.connect(bp); bp.connect(g); g.connect(out);
        });
        out.connect(this.sfxGain);
        src.start(t); lfo.start(t); src.stop(t + dur + 0.05); lfo.stop(t + dur + 0.05);
        const v = { out, src, end: t + dur };
        src.onended = () => { if (this._scream === v) this._scream = null; try { out.disconnect(); } catch (_) { } };
        return v;
    }
    // cut the scream short when the knight hits the ground
    screamStop() {
        const v = this._scream;
        if (!v || !this.ctx) { this._scream = null; return; }
        this._scream = null;
        const t = this.ctx.currentTime;
        if (t >= v.end) return;
        v.out.gain.cancelScheduledValues(t);
        v.out.gain.setValueAtTime(Math.max(0.0001, v.out.gain.value), t);
        v.out.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
        try { v.src.stop(t + 0.08); } catch (_) { }
    }
    get screaming() { return !!this._scream; }
}

export const AudioManager = new AudioManagerClass();