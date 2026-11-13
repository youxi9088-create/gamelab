/**
 * Pure fixed-timestep accumulator. Extracted from the render loop so the timing
 * rules are unit-testable with zero DOM and zero WebGL.
 */
/**
 * A frame gap longer than this is a stall, not gameplay: a backgrounded tab, a
 * GC pause, or a paused debugger. Clamping it is what stops the game from
 * burst-simulating minutes of physics in a single frame when the player comes
 * back.
 */
export const MAX_FRAME_DELTA = 0.25;
/**
 * @param accumulator seconds carried over from the previous frame
 * @param dt seconds of wall clock since the previous frame
 * @param step fixed simulation step in seconds (1/60)
 * @param maxSteps hard ceiling on steps per frame — the spiral-of-death guard
 */
export function stepClock(accumulator, dt, step, maxSteps) {
    if (!(step > 0))
        throw new Error(`stepClock: step must be > 0, got ${step}`);
    const total = accumulator + Math.min(Math.max(dt, 0), MAX_FRAME_DELTA);
    const steps = Math.min(Math.floor(total / step), Math.max(0, Math.floor(maxSteps)));
    // `total % step` serves both cases. In the normal case it equals
    // `total - steps * step`. When we hit `maxSteps` it additionally DROPS the
    // backlog we refused to simulate — keeping it would guarantee we hit the cap
    // again next frame and never catch up (the spiral of death), while the
    // remainder preserves sub-step phase so motion stays smooth.
    const remainder = total % step;
    return { steps, alpha: remainder / step, accumulator: remainder };
}
