/**
 * OMNIS SFX — Procedural sound effects using Tone.js
 * Dark, techy, surveillance-themed audio cues
 */
import * as Tone from './_remote/e761a2424dc7fdba/tone@14.7.77.js';

let initialized = false;
let sfxVolume = -12; // dB
let muted = false;

const masterGain = new Tone.Gain(0.5);
// Music filter: starts bright (~3500Hz) so early-game BGM is audible and clear,
// then opens up further as tension rises. Filter sweep handled by setMusicIntensity.
const musicFilter = new Tone.Filter(3500, 'lowpass').toDestination();
masterGain.connect(musicFilter); 

async function ensureStarted() {
    if (!initialized) {
        await Tone.start();
        initialized = true;
    }
}

export function setVolume(val) {
    // val: 0-1 range
    sfxVolume = val === 0 ? -Infinity : Tone.gainToDb(val * 0.6);
    masterGain.gain.value = val * 0.6;
}

export function setMuted(m) {
    muted = m;
    masterGain.gain.value = m ? 0 : Tone.dbToGain(sfxVolume);
}

// ═══════════════════════════════════
//  SOUND EFFECTS
// ═══════════════════════════════════

/** Click / UI selection — short crisp blip */
export async function playClick() {
    if (muted) return;
    await ensureStarted();
    const synth = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.005, decay: 0.08, sustain: 0, release: 0.05 }
    }).connect(masterGain);
    synth.triggerAttackRelease('C6', '32n');
    setTimeout(() => synth.dispose(), 300);
}

/** Node select — electronic ping */
export async function playNodeSelect() {
    if (muted) return;
    await ensureStarted();
    const synth = new Tone.Synth({
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.01, decay: 0.15, sustain: 0, release: 0.1 }
    }).connect(masterGain);
    synth.triggerAttackRelease('E5', '16n');
    setTimeout(() => synth.dispose(), 400);
}

/** Attack initiated — tense ascending sweep */
export async function playAttackInit() {
    if (muted) return;
    await ensureStarted();
    const synth = new Tone.Synth({
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 0.02, decay: 0.3, sustain: 0.1, release: 0.2 }
    }).connect(new Tone.Filter(2000, 'lowpass').connect(masterGain));
    synth.triggerAttackRelease('D3', '8n');
    setTimeout(() => {
        const synth2 = new Tone.Synth({
            oscillator: { type: 'sawtooth' },
            envelope: { attack: 0.02, decay: 0.3, sustain: 0.1, release: 0.2 }
        }).connect(new Tone.Filter(2500, 'lowpass').connect(masterGain));
        synth2.triggerAttackRelease('A3', '8n');
        setTimeout(() => synth2.dispose(), 600);
    }, 120);
    setTimeout(() => synth.dispose(), 600);
}

/** Attack success — triumphant chord burst */
export async function playSuccess() {
    if (muted) return;
    await ensureStarted();
    const notes = ['C4', 'E4', 'G4', 'C5'];
    notes.forEach((note, i) => {
        setTimeout(() => {
            const synth = new Tone.Synth({
                oscillator: { type: 'triangle' },
                envelope: { attack: 0.01, decay: 0.3, sustain: 0.05, release: 0.4 }
            }).connect(masterGain);
            synth.triggerAttackRelease(note, '8n');
            setTimeout(() => synth.dispose(), 800);
        }, i * 80);
    });
}

/** Attack failure — descending buzz */
export async function playFailure() {
    if (muted) return;
    await ensureStarted();
    const synth = new Tone.Synth({
        oscillator: { type: 'square' },
        envelope: { attack: 0.01, decay: 0.4, sustain: 0, release: 0.3 }
    }).connect(new Tone.Filter(1200, 'lowpass').connect(masterGain));
    synth.triggerAttackRelease('E3', '4n');
    setTimeout(() => {
        const synth2 = new Tone.Synth({
            oscillator: { type: 'square' },
            envelope: { attack: 0.01, decay: 0.5, sustain: 0, release: 0.3 }
        }).connect(new Tone.Filter(800, 'lowpass').connect(masterGain));
        synth2.triggerAttackRelease('Bb2', '4n');
        setTimeout(() => synth2.dispose(), 900);
    }, 150);
    setTimeout(() => synth.dispose(), 700);
}

/** Event banner — ominous alarm sweep */
export async function playEventAlert() {
    if (muted) return;
    await ensureStarted();
    const synth = new Tone.FMSynth({
        modulationIndex: 8,
        envelope: { attack: 0.05, decay: 0.6, sustain: 0.1, release: 0.5 },
        modulation: { type: 'square' }
    }).connect(new Tone.Filter(3000, 'lowpass').connect(masterGain));
    synth.triggerAttackRelease('A3', '4n');
    setTimeout(() => {
        const s2 = new Tone.FMSynth({
            modulationIndex: 6,
            envelope: { attack: 0.05, decay: 0.5, sustain: 0.05, release: 0.4 },
            modulation: { type: 'square' }
        }).connect(new Tone.Filter(2500, 'lowpass').connect(masterGain));
        s2.triggerAttackRelease('F3', '4n');
        setTimeout(() => s2.dispose(), 800);
    }, 300);
    setTimeout(() => synth.dispose(), 1000);
}

/** Victory — epic ascending fanfare */
export async function playVictory() {
    if (muted) return;
    await ensureStarted();
    const chords = [
        ['C4', 'E4', 'G4'],
        ['D4', 'F#4', 'A4'],
        ['E4', 'G#4', 'B4'],
        ['C5', 'E5', 'G5']
    ];
    chords.forEach((chord, ci) => {
        setTimeout(() => {
            chord.forEach((note, ni) => {
                setTimeout(() => {
                    const synth = new Tone.Synth({
                        oscillator: { type: 'triangle' },
                        envelope: { attack: 0.02, decay: 0.6, sustain: 0.2, release: 0.8 }
                    }).connect(masterGain);
                    synth.triggerAttackRelease(note, '4n');
                    setTimeout(() => synth.dispose(), 1500);
                }, ni * 40);
            });
        }, ci * 250);
    });
}

/** Turn start — subtle notification chime */
export async function playTurnStart() {
    if (muted) return;
    await ensureStarted();
    const synth = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.15 }
    }).connect(masterGain);
    synth.triggerAttackRelease('G5', '16n');
    setTimeout(() => {
        const s2 = new Tone.Synth({
            oscillator: { type: 'sine' },
            envelope: { attack: 0.01, decay: 0.25, sustain: 0, release: 0.2 }
        }).connect(masterGain);
        s2.triggerAttackRelease('C6', '16n');
        setTimeout(() => s2.dispose(), 500);
    }, 100);
    setTimeout(() => synth.dispose(), 400);
}

/** Income collected — coin/cash register sound */
export async function playIncome() {
    if (muted) return;
    await ensureStarted();
    const synth = new Tone.MetalSynth({
        frequency: 400,
        envelope: { attack: 0.001, decay: 0.15, release: 0.1 },
        harmonicity: 5.1,
        modulationIndex: 16,
        resonance: 4000,
        octaves: 1.5
    }).connect(new Tone.Gain(0.15).connect(masterGain));
    synth.triggerAttackRelease('16n');
    setTimeout(() => synth.dispose(), 500);
}

/** Dice roll — rapid clicking */
export async function playDiceRoll() {
    if (muted) return;
    await ensureStarted();
    for (let i = 0; i < 6; i++) {
        setTimeout(() => {
            const noise = new Tone.NoiseSynth({
                noise: { type: 'white' },
                envelope: { attack: 0.001, decay: 0.03, sustain: 0, release: 0.01 }
            }).connect(new Tone.Filter(5000, 'bandpass').connect(new Tone.Gain(0.2).connect(masterGain)));
            noise.triggerAttackRelease('32n');
            setTimeout(() => noise.dispose(), 200);
        }, i * 50);
    }
}

/** Enemy action — dark warning tone */
export async function playEnemyAction() {
    if (muted) return;
    await ensureStarted();
    const synth = new Tone.Synth({
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 0.05, decay: 0.3, sustain: 0.05, release: 0.2 }
    }).connect(new Tone.Filter(1500, 'lowpass').connect(masterGain));
    synth.triggerAttackRelease('D#3', '8n');
    setTimeout(() => synth.dispose(), 600);
}

// ═══════════════════════════════════
//  ACTION CARD SOUND EFFECTS
// ═══════════════════════════════════

/** Action Card: Attack/Power Buff — aggressive synth burst */
export async function playActionPower() {
    if (muted) return;
    await ensureStarted();
    const synth = new Tone.FMSynth({
        modulationIndex: 12,
        envelope: { attack: 0.01, decay: 0.4, sustain: 0.1, release: 0.3 },
        modulation: { type: 'square' }
    }).connect(new Tone.Filter(1500, 'bandpass').connect(masterGain));
    synth.triggerAttackRelease('C2', '8n');
    setTimeout(() => synth.dispose(), 800);
}

/** Action Card: Debuff/Resistance Drop — destructive glitch sound */
export async function playActionDebuff() {
    if (muted) return;
    await ensureStarted();
    const synth = new Tone.MetalSynth({
        frequency: 200,
        envelope: { attack: 0.01, decay: 0.5, release: 0.2 },
        harmonicity: 8.1,
        modulationIndex: 20,
        resonance: 800,
        octaves: 1.5
    }).connect(new Tone.Filter(1000, 'lowpass').connect(masterGain));
    synth.triggerAttackRelease('8n');
    setTimeout(() => synth.dispose(), 800);
}

/** Action Card: Economy/Transfer — high-tech data transfer hum */
export async function playActionEconomy() {
    if (muted) return;
    await ensureStarted();
    const synth = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.1, decay: 0.1, sustain: 0.8, release: 0.4 }
    }).connect(masterGain);
    
    // Quick ascending arpeggio
    const notes = ['E5', 'G5', 'B5', 'E6'];
    notes.forEach((note, i) => {
        setTimeout(() => synth.triggerAttackRelease(note, '32n'), i * 50);
    });
    setTimeout(() => synth.dispose(), 600);
}

// ═══════════════════════════════════
//  MUSIC LAYERING & ATMOSPHERE
// ═══════════════════════════════════

let bgmPlayer = null;
let currentIntensity = 0; // 0 to 1

export async function initMusic(url) {
    if (bgmPlayer) return;
    await ensureStarted();
    bgmPlayer = new Tone.Player({
        url: url,
        loop: true,
        autostart: false,
        volume: -10
    }).connect(masterGain);
}

export async function startBGM() {
    await ensureStarted();
    if (bgmPlayer && bgmPlayer.state !== 'started') {
        bgmPlayer.start();
    }
}

export function stopBGM() {
    if (bgmPlayer) {
        bgmPlayer.stop();
    }
}

/** 
 * Shift BGM intensity based on global tension / win progress 
 * @param {number} intensity - 0 (calm) to 1 (critical)
 */
export function setMusicIntensity(intensity) {
    currentIntensity = Math.max(0, Math.min(1, intensity));
    // Open up the filter as intensity increases.
    // Baseline 3500Hz keeps early-game BGM bright and audible; opens to 14000Hz at peak tension.
    const frequency = 3500 + (currentIntensity * 10500);
    musicFilter.frequency.rampTo(frequency, 1);
}

/** Action Card: Special/Manipulation — mysterious eerie sweep */
export async function playActionSpecial() {
    if (muted) return;
    await ensureStarted();
    const synth = new Tone.FMSynth({
        modulationIndex: 2,
        envelope: { attack: 0.2, decay: 0.5, sustain: 0.2, release: 1 },
        modulation: { type: 'sine' }
    }).connect(new Tone.Filter(800, 'highpass').connect(masterGain));
    synth.triggerAttackRelease('A4', '2n');
    setTimeout(() => {
        synth.frequency.rampTo('E5', 0.5);
    }, 50);
    setTimeout(() => synth.dispose(), 2000);
}

/** Bidding Resolution — sharp digital impact */
export async function playBiddingResolution() {
    if (muted) return;
    await ensureStarted();
    const noise = new Tone.NoiseSynth({
        noise: { type: 'pink' },
        envelope: { attack: 0.005, decay: 0.3, sustain: 0, release: 0.1 }
    }).connect(new Tone.Filter(1000, 'lowpass').connect(masterGain));
    
    const synth = new Tone.MembraneSynth({
        pitchDecay: 0.05,
        octaves: 4,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 0.4 }
    }).connect(masterGain);

    noise.triggerAttackRelease('8n');
    synth.triggerAttackRelease('C2', '4n');
    
    setTimeout(() => {
        noise.dispose();
        synth.dispose();
    }, 1000);
}

/** Success Shift — satisfying digital chime when hitting green zone */
export async function playSuccessShift() {
    if (muted) return;
    await ensureStarted();
    const synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0.1 }
    }).connect(new Tone.Filter(2000, 'lowpass').connect(masterGain));
    
    synth.triggerAttackRelease(['C5', 'E5', 'G5'], '32n');
    setTimeout(() => synth.dispose(), 500);
}

/** Legacy alias support for attack/capture sounds */
export async function playAttack() {
    await playAttackInit();
}

export async function playCapture() {
    await playSuccess();
}

