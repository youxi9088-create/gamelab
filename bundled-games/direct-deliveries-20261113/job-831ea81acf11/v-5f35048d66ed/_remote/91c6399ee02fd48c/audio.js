export function createAudio(options) {
    let graph = null;
    let musicSource = null;
    let musicVolume = 0.6;
    let sfxVolume = 1;
    let muted = false;
    let host = { master: 1, muted: false, music: 1, sfx: 1 };
    const isMuted = () => muted || host.muted;
    const masterLevel = () => (isMuted() ? 0 : host.master);
    function ensure() {
        if (graph)
            return graph;
        const Ctor = window.AudioContext ??
            window.webkitAudioContext;
        if (!Ctor)
            throw new Error('Web Audio is unavailable in this runtime');
        const context = new Ctor();
        const master = context.createGain();
        const music = context.createGain();
        const sfx = context.createGain();
        const playerMusic = context.createGain();
        const playerSfx = context.createGain();
        master.gain.value = masterLevel();
        playerMusic.gain.value = host.music;
        playerSfx.gain.value = host.sfx;
        music.gain.value = musicVolume;
        sfx.gain.value = sfxVolume;
        music.connect(playerMusic).connect(master);
        sfx.connect(playerSfx).connect(master);
        master.connect(context.destination);
        graph = { context, master, music, sfx, playerMusic, playerSfx };
        return graph;
    }
    function applyHost() {
        if (!graph)
            return;
        const { context, master, playerMusic, playerSfx } = graph;
        for (const [node, value] of [
            [master, masterLevel()],
            [playerMusic, host.music],
            [playerSfx, host.sfx],
        ]) {
            // Capture the rendered value before cancelling. These player-only nodes
            // own no authored fades, and this works without cancelAndHoldAtTime.
            const current = node.gain.value;
            node.gain.cancelScheduledValues(context.currentTime);
            node.gain.setValueAtTime(current, context.currentTime);
            node.gain.linearRampToValueAtTime(value, context.currentTime + 0.05);
        }
    }
    const onVisibility = () => {
        if (!graph)
            return;
        // Suspending on hide is not politeness: an iOS WebView that keeps an active
        // context in the background gets its audio session killed outright.
        if (document.visibilityState === 'hidden')
            void graph.context.suspend();
        else if (!isMuted())
            void graph.context.resume();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return {
        async unlock() {
            const { context } = ensure();
            if (context.state !== 'running')
                await context.resume();
        },
        decode(data) {
            return ensure().context.decodeAudioData(data);
        },
        playSfx(key, sfxOptions = {}) {
            const buffer = options.sound(key);
            if (!buffer || isMuted())
                return;
            const { context, sfx } = ensure();
            if (context.state !== 'running')
                return;
            const source = context.createBufferSource();
            source.buffer = buffer;
            source.playbackRate.value = sfxOptions.rate ?? 1;
            const gain = context.createGain();
            gain.gain.value = sfxOptions.volume ?? 1;
            if (sfxOptions.pan !== undefined && context.createStereoPanner) {
                const panner = context.createStereoPanner();
                panner.pan.value = Math.max(-1, Math.min(1, sfxOptions.pan));
                source.connect(gain).connect(panner).connect(sfx);
            }
            else {
                source.connect(gain).connect(sfx);
            }
            source.start();
            // One-shots are fire-and-forget; without this the nodes stay referenced.
            source.onended = () => {
                source.disconnect();
                gain.disconnect();
            };
        },
        playMusic(key, musicOptions = {}) {
            const buffer = options.sound(key);
            if (!buffer)
                return;
            const { context, music } = ensure();
            this.stopMusic(0);
            const source = context.createBufferSource();
            source.buffer = buffer;
            source.loop = musicOptions.loop ?? true;
            source.connect(music);
            const target = musicOptions.volume ?? musicVolume;
            const fade = musicOptions.fadeIn ?? 0;
            if (fade > 0) {
                music.gain.cancelScheduledValues(context.currentTime);
                music.gain.setValueAtTime(0, context.currentTime);
                music.gain.linearRampToValueAtTime(target, context.currentTime + fade);
            }
            else {
                music.gain.value = target;
            }
            source.start();
            musicSource = source;
        },
        stopMusic(fadeOut = 0) {
            const source = musicSource;
            if (!source || !graph)
                return;
            musicSource = null;
            if (fadeOut <= 0) {
                source.stop();
                source.disconnect();
                return;
            }
            const { context, music } = graph;
            music.gain.cancelScheduledValues(context.currentTime);
            music.gain.setValueAtTime(music.gain.value, context.currentTime);
            music.gain.linearRampToValueAtTime(0, context.currentTime + fadeOut);
            source.stop(context.currentTime + fadeOut);
            source.onended = () => source.disconnect();
        },
        get musicVolume() {
            return musicVolume;
        },
        set musicVolume(value) {
            musicVolume = Math.max(0, value);
            if (graph)
                graph.music.gain.value = musicVolume;
        },
        get sfxVolume() {
            return sfxVolume;
        },
        set sfxVolume(value) {
            sfxVolume = Math.max(0, value);
            if (graph)
                graph.sfx.gain.value = sfxVolume;
        },
        get muted() {
            return isMuted();
        },
        setMuted(next) {
            muted = next;
            applyHost();
        },
        setHostAudio(settings) {
            if (![settings.master, settings.music, settings.sfx].every((n) => Number.isFinite(n) && n >= 0 && n <= 1))
                return;
            host = { ...settings };
            applyHost();
        },
        dispose() {
            document.removeEventListener('visibilitychange', onVisibility);
            this.stopMusic(0);
            void graph?.context.close();
            graph = null;
        },
    };
}
