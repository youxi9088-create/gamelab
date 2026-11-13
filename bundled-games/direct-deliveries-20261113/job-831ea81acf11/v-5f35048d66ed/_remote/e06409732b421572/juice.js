/**
 * The curated set. Linear motion everywhere is the tell of an untweened game —
 * real objects accelerate — but a menagerie of forty easings is choice with no
 * information. These seven cover the moves portrait games make: `quadOut` for
 * almost everything that moves on screen, `backOut` for pops that overshoot,
 * `elasticOut` for the rare springy emphasis, the rest for symmetry and ramps.
 */
export const easings = {
    linear: (t) => t,
    quadIn: (t) => t * t,
    quadOut: (t) => t * (2 - t),
    quadInOut: (t) => (t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t)),
    cubicOut: (t) => 1 + (t - 1) ** 3,
    backOut: (t) => 1 + 2.70158 * (t - 1) ** 3 + 1.70158 * (t - 1) ** 2,
    elasticOut: (t) => t === 0 || t === 1 ? t : 2 ** (-10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1,
};
/** Absorbs accumulated step error in "has this timer elapsed" comparisons. */
const EPSILON = 1e-9;
const resolveEasing = (easing) => {
    if (easing === undefined)
        return easings.quadOut;
    if (typeof easing === 'function')
        return easing;
    const found = easings[easing];
    if (!found)
        throw new Error(`unknown easing '${String(easing)}'`);
    return found;
};
/**
 * A tween runner stepped by the game's own fixed timestep.
 *
 * Stepped, not clocked: it advances only when `update(step)` is called, so
 * tweens pause with the simulation (including during hit-stop, which is the
 * behaviour that reads as impact), run identically on 60 Hz and 120 Hz
 * displays, and are deterministic under test.
 *
 * Create it once at module scope, call `tweens.update(step)` first thing in
 * the game's update, and `tweens.cancelAll()` from the run reset — a tween
 * from the previous run landing on a freshly reset object is a classic ghost.
 */
export function createTweens() {
    let live = [];
    return {
        to(target, to, options) {
            if (!(options.duration >= 0)) {
                throw new Error(`tween duration must be >= 0, got ${options.duration}`);
            }
            const record = target;
            const keys = Object.keys(to);
            const tween = {
                target: record,
                keys,
                from: keys.map((key) => {
                    const value = record[key];
                    if (typeof value !== 'number') {
                        throw new Error(`tween target property '${key}' is not a number`);
                    }
                    return value;
                }),
                to: keys.map((key) => to[key]),
                easing: resolveEasing(options.easing),
                duration: options.duration,
                yoyo: options.yoyo ?? false,
                elapsed: 0,
                cancelled: false,
                onUpdate: options.onUpdate,
                onComplete: options.onComplete,
            };
            live.push(tween);
            return {
                cancel() {
                    tween.cancelled = true;
                },
                get done() {
                    return tween.cancelled || tween.elapsed + EPSILON >= tween.duration * (tween.yoyo ? 2 : 1);
                },
            };
        },
        update(step) {
            if (live.length === 0)
                return;
            const finished = [];
            for (const tween of live) {
                if (tween.cancelled)
                    continue;
                tween.elapsed += step;
                const total = tween.duration * (tween.yoyo ? 2 : 1);
                // The epsilon absorbs accumulated float error: thirty 1/60 steps sum
                // to a hair under 0.5, and without it every tween runs one extra frame.
                const landed = tween.elapsed + EPSILON >= total;
                if (landed) {
                    // Snap to the exact destination rather than trusting easing(1) —
                    // curves like backOut miss their endpoint by float noise, and a
                    // scale meant to return to 1 must be 1, not 1 ± 2e-16, forever.
                    const finals = tween.yoyo ? tween.from : tween.to;
                    for (let i = 0; i < tween.keys.length; i++) {
                        tween.target[tween.keys[i]] = finals[i];
                    }
                }
                else {
                    const t = tween.elapsed / total;
                    // The yoyo leg mirrors progress; easing applies per leg so the
                    // return trip decelerates the same way the outbound one did.
                    const leg = tween.yoyo ? 1 - Math.abs(1 - 2 * t) : t;
                    const eased = tween.easing(leg);
                    for (let i = 0; i < tween.keys.length; i++) {
                        const from = tween.from[i];
                        tween.target[tween.keys[i]] = from + (tween.to[i] - from) * eased;
                    }
                }
                tween.onUpdate?.();
                if (landed)
                    finished.push(tween);
            }
            if (finished.length > 0 || live.some((tween) => tween.cancelled)) {
                live = live.filter((tween) => !tween.cancelled && !finished.includes(tween));
                // Callbacks run after the list is settled, so an onComplete that starts
                // the next tween (a squash chaining into a stretch) is not swept away.
                for (const tween of finished)
                    tween.onComplete?.();
            }
        },
        cancelAll() {
            for (const tween of live)
                tween.cancelled = true;
            live = [];
        },
        get active() {
            return live.filter((tween) => !tween.cancelled).length;
        },
    };
}
/**
 * Wraps any camera rig with trauma-based screen shake.
 *
 * A decorator, because ownership is the entire problem: rigs own the camera
 * transform, and `followRig` rewrites it every frame while `portraitRig` never
 * touches it after boot. Adding an offset directly therefore either vanishes
 * next frame or accumulates forever, depending on which rig the game picked.
 * The wrapper removes last frame's offset, lets the inner rig do its work,
 * then applies a fresh one — correct against both behaviours.
 *
 * Trauma-squared with linear decay (Squirrel Eiserloh's model): shake feels
 * proportional to events this way, and it composes — two quick hits raise
 * trauma additively instead of restarting a fixed animation.
 *
 * Shake runs on render time (`rig.update(dt)`), so it keeps moving during
 * hit-stop and after `gameOver` — a dead-still camera over a game-over sheet
 * reads as a hang, and shake-through-freeze is the classic impact combo.
 *
 *     const rig = shakeRig(portraitRig())
 *     await createGame({ camera: rig, ... })
 *     rig.shake(0.4)
 */
export function shakeRig(rig, options = {}) {
    const maxOffset = options.maxOffset ?? 0.35;
    const maxRoll = options.maxRoll ?? 0.04;
    const decay = options.decay ?? 1.5;
    const rng = options.rng ?? Math.random;
    let trauma = 0;
    let appliedX = 0;
    let appliedY = 0;
    let appliedRoll = 0;
    // Inverse in reverse order: the roll changed the local axes the offsets
    // were applied along, so it unwinds first or the translation comes back
    // along the wrong basis and the camera drifts a little every frame.
    const remove = () => {
        rig.camera.rotateZ(-appliedRoll);
        rig.camera.translateY(-appliedY);
        rig.camera.translateX(-appliedX);
        appliedX = 0;
        appliedY = 0;
        appliedRoll = 0;
    };
    return {
        get camera() {
            return rig.camera;
        },
        resize(viewport) {
            rig.resize(viewport);
        },
        update(dt) {
            remove();
            rig.update(dt);
            trauma = Math.max(trauma - decay * dt, 0);
            const shake = trauma * trauma;
            if (shake > 0) {
                appliedX = maxOffset * shake * (rng() * 2 - 1);
                appliedY = maxOffset * shake * (rng() * 2 - 1);
                appliedRoll = maxRoll * shake * (rng() * 2 - 1);
                rig.camera.translateX(appliedX);
                rig.camera.translateY(appliedY);
                rig.camera.rotateZ(appliedRoll);
            }
        },
        shake(amount) {
            trauma = Math.min(trauma + Math.max(amount, 0), 1);
        },
        get trauma() {
            return trauma;
        },
    };
}
/**
 * Hit-stop: the few-frame freeze that sells an impact.
 *
 * It cannot be a sleep and cannot skip rendering — the loop keeps drawing the
 * frozen state, which is exactly the effect. What stops is simulation, and the
 * game owns its update, so this is a countdown the game gates on rather than
 * something the SDK can impose.
 *
 * Keep it short and rare: 0.05–0.12s, on the few biggest moments (a death, a
 * heavy hit). On every minor event it stops reading as impact and starts
 * reading as jank. Screen shake keeps moving through it (see `shakeRig`) —
 * freeze-plus-shake is the combination that reads as force.
 */
export function createHitStop() {
    let remaining = 0;
    return {
        trigger(seconds) {
            remaining = Math.max(remaining, seconds);
        },
        frozen(step) {
            // The epsilon keeps three 1/60 steps from leaving 5e-18s of freeze that
            // buys a whole extra frozen frame.
            if (remaining <= EPSILON) {
                remaining = 0;
                return false;
            }
            remaining -= step;
            return true;
        },
        get active() {
            return remaining > EPSILON;
        },
    };
}
