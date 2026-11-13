const MUSIC_SETTINGS_KEY = 'turbocrib-music-settings';
const DEFAULT_MUSIC_VOLUME = 0.4;
const DEFAULT_EFFECTS_VOLUME = 1;
const activeEffects = new Set();

function clampVolume(value, fallback) {
    const volume = Number(value);
    return Math.round(Math.max(0, Math.min(1, Number.isFinite(volume) ? volume : fallback)) * 100) / 100;
}

function loadMusicSettings() {
    try {
        const stored = JSON.parse(localStorage.getItem(MUSIC_SETTINGS_KEY) || '{}');
        return {
            musicVolume: clampVolume(stored.musicVolume, DEFAULT_MUSIC_VOLUME),
            musicMuted: typeof stored.musicMuted === 'boolean' ? stored.musicMuted : true,
            effectsVolume: clampVolume(stored.effectsVolume, DEFAULT_EFFECTS_VOLUME),
            effectsMuted: typeof stored.effectsMuted === 'boolean' ? stored.effectsMuted : false
        };
    } catch (error) {
        return {
            musicVolume: DEFAULT_MUSIC_VOLUME,
            musicMuted: true,
            effectsVolume: DEFAULT_EFFECTS_VOLUME,
            effectsMuted: false
        };
    }
}

const settings = loadMusicSettings();
const player = new Audio('assets/the-galleons-gambit.mp3');
player.loop = true;
player.preload = 'auto';
player.volume = settings.musicVolume;
player.muted = settings.musicMuted || settings.musicVolume === 0;

let playPending = false;

function saveMusicSettings() {
    try {
        localStorage.setItem(MUSIC_SETTINGS_KEY, JSON.stringify({
            musicVolume: settings.musicVolume,
            musicMuted: settings.musicMuted,
            effectsVolume: settings.effectsVolume,
            effectsMuted: settings.effectsMuted
        }));
    } catch (error) {
        // Audio remains controllable when browser storage is unavailable.
    }
}

function start() {
    if (isMuted() || !player.paused || playPending) return;
    playPending = true;
    let playRequest;
    try {
        playRequest = player.play();
    } catch (error) {
        playPending = false;
        return;
    }
    Promise.resolve(playRequest).catch(() => {}).finally(() => {
        playPending = false;
    });
}

function isMuted() {
    return settings.musicMuted || settings.musicVolume === 0;
}

function isEffectsMuted() {
    return settings.effectsMuted || settings.effectsVolume === 0;
}

function applyEffectsVolume(entry) {
    entry.audio.volume = Math.max(0, Math.min(1, entry.baseVolume * settings.effectsVolume));
    entry.audio.muted = isEffectsMuted();
}

function updateActiveEffects() {
    activeEffects.forEach((entry) => applyEffectsVolume(entry));
}

export const backgroundMusic = Object.freeze({
    player,
    settings,
    start,
    isMuted,
    isEffectsMuted,
    setVolume(volume) {
        settings.musicVolume = clampVolume(volume, DEFAULT_MUSIC_VOLUME);
        if (settings.musicVolume > 0) settings.musicMuted = false;
        player.volume = settings.musicVolume;
        player.muted = isMuted();
        saveMusicSettings();
        if (!isMuted()) start();
    },
    toggleMute() {
        settings.musicMuted = !settings.musicMuted;
        player.muted = isMuted();
        saveMusicSettings();
        if (!isMuted()) start();
    },
    setEffectsVolume(volume) {
        settings.effectsVolume = clampVolume(volume, DEFAULT_EFFECTS_VOLUME);
        if (settings.effectsVolume > 0) settings.effectsMuted = false;
        updateActiveEffects();
        saveMusicSettings();
    },
    toggleEffectsMute() {
        settings.effectsMuted = !settings.effectsMuted;
        updateActiveEffects();
        saveMusicSettings();
    },
    trackEffectsAudio(audio, baseVolume) {
        const entry = { audio, baseVolume: clampVolume(baseVolume, 1) };
        activeEffects.add(entry);
        applyEffectsVolume(entry);
        const remove = () => activeEffects.delete(entry);
        audio.addEventListener('ended', remove, { once: true });
        audio.addEventListener('error', remove, { once: true });
        return remove;
    }
});

// Keep playback available on genuine user gestures for saved-on preferences,
// without attempting autoplay when the page or a game screen loads.
document.addEventListener('pointerdown', start, { capture: true, passive: true });
document.addEventListener('keydown', start, { capture: true });
