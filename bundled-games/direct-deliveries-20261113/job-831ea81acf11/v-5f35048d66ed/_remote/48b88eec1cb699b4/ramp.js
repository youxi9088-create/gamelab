import { easings } from '../e06409732b421572/juice.js';
/**
 * A pure function of progress: `speed(game.time.elapsed)`.
 *
 *     const speed = createRamp({ from: 8, to: 22, over: 75 })
 *     update(game, step) {
 *       player.position.z -= speed(game.time.elapsed) * step
 *     }
 *
 * Drive it by elapsed time, distance, or score — anything monotonic. Several
 * ramps can share one input: speed on 75s, spawn density on 90s, gap width
 * shrinking on 60s, so the pressure arrives in layers instead of all at once.
 */
export function createRamp(options) {
    if (!(options.over > 0))
        throw new Error(`createRamp: over must be > 0, got ${options.over}`);
    const curve = typeof options.curve === 'function' ? options.curve : easings[options.curve ?? 'quadIn'];
    if (!curve)
        throw new Error(`createRamp: unknown easing '${String(options.curve)}'`);
    return (progress) => {
        const t = Math.min(Math.max(progress / options.over, 0), 1);
        return options.from + (options.to - options.from) * curve(t);
    };
}
