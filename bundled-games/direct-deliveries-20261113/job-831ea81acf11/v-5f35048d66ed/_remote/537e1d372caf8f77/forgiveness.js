/**
 * Input forgiveness: act on the player's intent, not their timing.
 *
 * A finger on glass is a noisy signal. Reaction time, display latency and the
 * physical travel of a tap all blur *when* the player meant to act, and a game
 * that demands the exact frame punishes the hardware more than the player.
 * The fix is two tiny windows, invisible when they work:
 *
 * - a GRACE WINDOW forgives acting slightly late — the jump pressed a few
 *   frames after running off the ledge still counts ("coyote time");
 * - an INPUT BUFFER forgives acting slightly early — the jump pressed just
 *   before landing fires on the exact frame it becomes legal.
 *
 * Both are countdowns stepped by the fixed timestep, so the forgiveness is the
 * same number of milliseconds on every display. 0.08–0.15s is the useful
 * range; below it nobody is helped, above it inputs visibly fire "on their
 * own". Players never notice these windows — they notice their absence, as
 * "the controls ate my tap".
 */
/**
 * Coyote time, generalised: "was the condition true within the last N
 * seconds" as a first-class object.
 *
 *     const coyote = createGraceWindow(0.1)
 *     update(game, step) {
 *       coyote.update(step)
 *       if (grounded) coyote.refresh()
 *     }
 *     game.input.on('tap', () => {
 *       if (coyote.consume()) jump()
 *     })
 */
export function createGraceWindow(seconds) {
    if (!(seconds > 0))
        throw new Error(`createGraceWindow: seconds must be > 0, got ${seconds}`);
    let remaining = 0;
    return {
        refresh() {
            remaining = seconds;
        },
        update(step) {
            remaining = Math.max(remaining - step, 0);
        },
        get active() {
            return remaining > 0;
        },
        consume() {
            const wasActive = remaining > 0;
            remaining = 0;
            return wasActive;
        },
    };
}
/**
 * The other half: remember a too-early input and fire it the frame it becomes
 * legal, instead of throwing it away.
 *
 *     const jumpBuffer = createInputBuffer(0.12)
 *     game.input.on('tap', () => jumpBuffer.press())
 *     update(game, step) {
 *       jumpBuffer.update(step)
 *       if (grounded && jumpBuffer.consume()) jump()
 *     }
 */
export function createInputBuffer(seconds) {
    if (!(seconds > 0))
        throw new Error(`createInputBuffer: seconds must be > 0, got ${seconds}`);
    let remaining = 0;
    return {
        press() {
            remaining = seconds;
        },
        update(step) {
            remaining = Math.max(remaining - step, 0);
        },
        consume() {
            const wasPending = remaining > 0;
            remaining = 0;
            return wasPending;
        },
        get pending() {
            return remaining > 0;
        },
    };
}
