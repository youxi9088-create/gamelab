import { ACESFilmicToneMapping, Color, SRGBColorSpace, Scene, WebGLRenderer, } from '../43b35e11ca3eada7/three.module.min.js';
import { createAssets } from '../8199703a3d16d4dc/assets.js';
import { createAudio } from '../91c6399ee02fd48c/audio.js';
import { portraitRig } from '../a47ab3be7d5222ae/camera.js';
import { createHud } from '../88f1e85ec8df09ee/index.js';
import { createInput } from '../b7a48fe07e8a3fee/index.js';
import { stepClock } from '../65ea2d4de01c9644/loop.js';
import { createLocalPlatform } from '../f8a95a1dfbf93b88/index.js';
import { DisposalScope } from '../db685f09d64f5de6/dispose.js';
import { createViewport } from '../dcd1d51ac5cfa7eb/viewport.js';
/**
 * The one bootstrap call. A game never constructs a `WebGLRenderer` itself,
 * because every one of the settings below is a decision that only looks
 * cosmetic until it costs 30 fps on a phone.
 */
/** Frames between the loop's own checks that something was drawn (about once a second). */
const BOOT_CHECK_EVERY = 60;
export async function createGame(options) {
    const container = options.container ?? document.body;
    const fixedStep = options.fixedStep ?? 1 / 60;
    const maxStepsPerFrame = options.maxStepsPerFrame ?? 5;
    prepareContainer(container);
    const canvas = document.createElement('canvas');
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    container.append(canvas);
    const viewport = createViewport(canvas, {
        design: options.design,
        fit: options.fit,
        maxPixelRatio: options.maxPixelRatio ?? 2,
        host: container,
    });
    const renderer = new WebGLRenderer({
        canvas,
        // Antialiasing is redundant once the DPR is above 1 — the downsample
        // already does it — and it costs a multisampled framebuffer.
        antialias: viewport.pixelRatio < 2,
        stencil: false,
        powerPreference: 'high-performance',
        alpha: false,
    });
    renderer.outputColorSpace = SRGBColorSpace;
    // ACES is what carries the look without post-processing: it keeps emissives
    // and bright lights from clipping to flat white.
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    const scene = new Scene();
    if (options.background !== null) {
        scene.background =
            options.background === undefined
                ? new Color(0x060b0f)
                : typeof options.background === 'object'
                    ? options.background
                    : new Color(options.background);
    }
    const rig = options.camera ?? portraitRig();
    const audio = createAudio({ sound: (key) => assets.sound(key) });
    const assets = createAssets({ decodeAudio: (data) => audio.decode(data) });
    const hud = createHud(container, viewport);
    const input = createInput(canvas, viewport, rig, scene);
    const platform = createLocalPlatform();
    function applyViewport() {
        renderer.setPixelRatio(viewport.pixelRatio);
        renderer.setSize(viewport.width, viewport.height, false);
        rig.resize(viewport);
    }
    const offResize = viewport.on('resize', applyViewport);
    applyViewport();
    const transient = new DisposalScope(assets.owned);
    const time = { elapsed: 0, delta: 0, frame: 0 };
    let accumulator = 0;
    let lastTime = 0;
    let running = false;
    let disposed = false;
    const game = {
        renderer,
        scene,
        rig,
        get camera() {
            return rig.camera;
        },
        viewport,
        input,
        assets,
        audio,
        hud,
        platform,
        transient,
        time,
        get running() {
            return running;
        },
        gameOver(score, levelAttempt) {
            platform.gameOver(score, levelAttempt);
            // The loop keeps rendering — a frozen canvas behind the host's game-over
            // sheet looks broken — but simulation stops.
            running = false;
        },
        restart(data) {
            // Order matters: free the previous run's GPU resources BEFORE the game
            // builds the next one, or peak memory is two levels wide.
            transient.dispose();
            // The HUD half of the same rule. `setup` built the score, the scene and
            // the lights once, and a restart rebuilds a *run*, not the game — so it
            // drops only what the run added. Clearing the whole HUD here is what left
            // the flagship kit writing its score into a detached node from the first
            // play-again onwards.
            hud.resetRun();
            platform.rearm();
            accumulator = 0;
            time.elapsed = 0;
            time.frame = 0;
            running = true;
            options.restart?.(game, data);
        },
        pause() {
            running = false;
        },
        resume() {
            lastTime = performance.now();
            running = true;
        },
        dispose() {
            if (disposed)
                return;
            disposed = true;
            renderer.setAnimationLoop(null);
            offResize();
            offPlayAgain();
            offMute();
            offInfo();
            document.removeEventListener('visibilitychange', onVisibility);
            transient.dispose();
            input.dispose();
            hud.dispose();
            audio.dispose();
            viewport.dispose();
            renderer.dispose();
            canvas.remove();
        },
    };
    // The first press is the only moment a mobile browser will let us start
    // audio, so it is wired here rather than left to every game to remember.
    input.on('press', () => {
        void audio.unlock();
    });
    const offPlayAgain = platform.onPlayAgain((data) => game.restart(data));
    const offMute = platform.attachAudio({
        channels: ['music', 'sfx'],
        apply: (settings) => audio.setHostAudio(settings),
    });
    const offInfo = platform.onGameInfo((info) => viewport.setSafeArea(info.contentSafeAreaInset));
    const onVisibility = () => {
        if (document.visibilityState === 'hidden') {
            running = false;
        }
        else {
            // Reset the clock: without this the accumulator sees the whole
            // backgrounded interval as one frame.
            lastTime = performance.now();
            running = true;
        }
    };
    document.addEventListener('visibilitychange', onVisibility);
    if (options.assets)
        await assets.load(options.assets, options.onProgress);
    const info = await platform.ready();
    viewport.setSafeArea(info.contentSafeAreaInset);
    await options.setup(game);
    // Everything the game built during `setup` — HUD included — outlives a run.
    hud.sealSetup();
    lastTime = performance.now();
    running = true;
    let warnedNaN = false;
    let warnedEmpty = false;
    const checkFrame = () => {
        const camera = rig.camera;
        const p = camera.position;
        const q = camera.quaternion;
        const finite = Number.isFinite(p.x + p.y + p.z) && Number.isFinite(q.x + q.y + q.z + q.w);
        if (!finite) {
            if (!warnedNaN) {
                warnedNaN = true;
                console.error('[remix] the camera position or rotation is NaN — nothing renders. A camera helper was called with the wrong arguments, or a lerp/lookAt read undefined. Fix the call in game-main.ts or the camera system before anything else.');
            }
            return;
        }
        warnedNaN = false;
        const drew = renderer.info.render.triangles + renderer.info.render.points + renderer.info.render.lines;
        if (drew === 0) {
            if (!warnedEmpty) {
                warnedEmpty = true;
                console.error('[remix] the renderer drew nothing this frame — the scene is empty, everything is outside the camera frustum, or the camera sits inside geometry. Check that the world is added to game.scene and that the camera is placed where it can see it.');
            }
            return;
        }
        warnedEmpty = false;
    };
    renderer.setAnimationLoop((now) => {
        const dt = Math.max((now - lastTime) / 1000, 0);
        lastTime = now;
        time.delta = dt;
        let alpha = 1;
        if (running) {
            const result = stepClock(accumulator, dt, fixedStep, maxStepsPerFrame);
            accumulator = result.accumulator;
            alpha = result.alpha;
            for (let i = 0; i < result.steps; i++) {
                time.elapsed += fixedStep;
                options.update?.(game, fixedStep);
            }
        }
        rig.update(dt);
        options.render?.(game, dt, alpha);
        renderer.render(scene, rig.camera);
        time.frame++;
        // A SILENT BLACK FRAME IS THE WORST FAILURE A BUILDER CAN LEAVE. A camera
        // fed NaN (a helper called with the wrong arguments, a lerp on undefined)
        // draws nothing and throws nothing; a scene nothing was added to is the
        // same. A ten-hour run ended black with a clean console (StumbleQuest 64,
        // 2026-09-04) and the one-line fix took seconds once someone looked. So
        // the loop checks itself once a second and says so, in the console the
        // build tools read, once per failure.
        if (time.frame % BOOT_CHECK_EVERY === 0)
            checkFrame();
    });
    return game;
}
/** Full-bleed, non-scrolling, non-selectable — the shape a game needs. */
function prepareContainer(container) {
    const style = document.documentElement.style;
    style.setProperty('height', '100%');
    document.body.style.margin = '0';
    document.body.style.height = '100%';
    document.body.style.overflow = 'hidden';
    document.body.style.overscrollBehavior = 'none';
    document.body.style.userSelect = 'none';
    document.body.style.setProperty('-webkit-tap-highlight-color', 'transparent');
    if (container === document.body) {
        container.style.position = 'relative';
        return;
    }
    container.style.position = 'relative';
    container.style.width = '100%';
    container.style.height = '100%';
}
