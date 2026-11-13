/**
 * Pure pointer-gesture state machine. No DOM, no three, no clock of its own —
 * every decision is a function of the samples you feed it, which is what makes
 * the thresholds testable instead of aspirational.
 *
 * Coordinates are DESIGN units (720x1080), so the thresholds mean the same
 * physical distance on every screen.
 */
export const DEFAULT_THRESHOLDS = {
    tapMaxMs: 250,
    tapMaxTravel: 12,
    dragMinTravel: 8,
    swipeMinTravel: 60,
    swipeMinSpeed: 200,
};
export function createGestureState() {
    return { pointers: [], pinchStart: null, pinchLast: null };
}
function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
}
function directionOf(dx, dy) {
    if (Math.abs(dx) >= Math.abs(dy))
        return dx >= 0 ? 'right' : 'left';
    return dy >= 0 ? 'down' : 'up';
}
/**
 * Folds one pointer sample into the gesture state.
 *
 * Returns a new state — the input is never mutated, so a caller can replay
 * samples in a test without the previous run bleeding through.
 */
export function reduceGestures(state, sample, thresholds = DEFAULT_THRESHOLDS) {
    const pointers = state.pointers.map((p) => ({ ...p }));
    const events = [];
    const index = pointers.findIndex((p) => p.id === sample.id);
    if (sample.phase === 'down') {
        // A duplicate `down` for a live id means we missed the `up` (pointer
        // capture lost, view swapped). Restart the pointer rather than tracking two.
        if (index >= 0)
            pointers.splice(index, 1);
        pointers.push({
            id: sample.id,
            x: sample.x,
            y: sample.y,
            dx: 0,
            dy: 0,
            startX: sample.x,
            startY: sample.y,
            startTime: sample.time,
            duration: 0,
            travel: 0,
            dragging: false,
        });
        events.push({
            type: 'press',
            data: { pointerId: sample.id, x: sample.x, y: sample.y, duration: 0 },
        });
    }
    else if (index >= 0) {
        const pointer = pointers[index];
        const dx = sample.x - pointer.x;
        const dy = sample.y - pointer.y;
        pointer.x = sample.x;
        pointer.y = sample.y;
        pointer.dx = dx;
        pointer.dy = dy;
        pointer.travel += Math.hypot(dx, dy);
        pointer.duration = sample.time - pointer.startTime;
        const displacement = Math.hypot(pointer.x - pointer.startX, pointer.y - pointer.startY);
        if (sample.phase === 'move') {
            if (!pointer.dragging && displacement > thresholds.dragMinTravel)
                pointer.dragging = true;
            if (pointer.dragging) {
                events.push({
                    type: 'drag',
                    data: {
                        pointerId: pointer.id,
                        x: pointer.x,
                        y: pointer.y,
                        dx,
                        dy,
                        totalX: pointer.x - pointer.startX,
                        totalY: pointer.y - pointer.startY,
                    },
                });
            }
        }
        else {
            // Native views and trackpads may coalesce a short drag into a down/up
            // pair whose endpoints differ. Preserve that terminal movement: without
            // it a control built on `input.on('drag')` receives no drag at all even
            // though the pointer travelled across the game.
            if (sample.phase === 'up' &&
                displacement > thresholds.dragMinTravel &&
                (dx !== 0 || dy !== 0)) {
                events.push({
                    type: 'drag',
                    data: {
                        pointerId: pointer.id,
                        x: pointer.x,
                        y: pointer.y,
                        dx,
                        dy,
                        totalX: pointer.x - pointer.startX,
                        totalY: pointer.y - pointer.startY,
                    },
                });
            }
            pointers.splice(index, 1);
            const tapLike = {
                pointerId: pointer.id,
                x: pointer.x,
                y: pointer.y,
                duration: pointer.duration,
            };
            events.push({ type: 'release', data: tapLike });
            // A cancel is the system taking the pointer away (a call, a system
            // gesture). It must never read as intent.
            if (sample.phase === 'up') {
                const speed = pointer.duration > 0 ? (displacement / pointer.duration) * 1000 : 0;
                if (displacement >= thresholds.swipeMinTravel && speed >= thresholds.swipeMinSpeed) {
                    events.push({
                        type: 'swipe',
                        data: {
                            pointerId: pointer.id,
                            x: pointer.x,
                            y: pointer.y,
                            dx: pointer.x - pointer.startX,
                            dy: pointer.y - pointer.startY,
                            direction: directionOf(pointer.x - pointer.startX, pointer.y - pointer.startY),
                            speed,
                        },
                    });
                }
                else if (pointer.duration <= thresholds.tapMaxMs &&
                    pointer.travel <= thresholds.tapMaxTravel) {
                    events.push({ type: 'tap', data: tapLike });
                }
            }
        }
    }
    let pinchStart = state.pinchStart;
    let pinchLast = state.pinchLast;
    const [first, second] = pointers;
    if (first && second && pointers.length === 2) {
        const current = distance(first, second);
        if (pinchStart === null || pinchLast === null) {
            pinchStart = current;
            pinchLast = current;
        }
        else if (sample.phase === 'move') {
            events.push({
                type: 'pinch',
                data: {
                    scale: pinchStart > 0 ? current / pinchStart : 1,
                    delta: pinchLast > 0 ? current / pinchLast : 1,
                    distance: current,
                    centerX: (first.x + second.x) / 2,
                    centerY: (first.y + second.y) / 2,
                },
            });
            pinchLast = current;
        }
    }
    else {
        pinchStart = null;
        pinchLast = null;
    }
    return { state: { pointers, pinchStart, pinchLast }, events };
}
