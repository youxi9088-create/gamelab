import { Raycaster, Vector2, Vector3 } from '../43b35e11ca3eada7/three.module.min.js';
import { DEFAULT_THRESHOLDS, createGestureState, reduceGestures, } from '../3728ad5838540a2c/gestures.js';
/** A press this long ago still justifies a stand-in lock — the browser's own transient-activation window. */
const LOCK_GESTURE_WINDOW_MS = 5_000;
export function createInput(canvas, viewport, rig, scene, options = {}) {
    const thresholds = options.thresholds
        ? { ...DEFAULT_THRESHOLDS, ...options.thresholds }
        : undefined;
    const listeners = new Map();
    const raycaster = new Raycaster();
    const ndc = new Vector2();
    const design = new Vector2();
    const lookOrigin = new Vector2();
    const lookUnit = new Vector2();
    let state = createGestureState();
    let enabled = true;
    /** The SDK is standing in for a lock the browser refused (see the header). */
    let soft = false;
    let lastDownAt = Number.NEGATIVE_INFINITY;
    /** The last `lock` value the game heard, so a real lock replacing a stand-in is not announced twice. */
    let announced = false;
    const nowMs = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
    const doc = options.document !== undefined
        ? options.document
        : typeof document === 'undefined'
            ? null
            : document;
    // Without `touch-action: none` the browser eats the second pointermove of
    // every drag to decide whether it is a scroll.
    canvas.style.touchAction = 'none';
    // `onDown` cancels pointerdown, and a cancelled pointerdown never moves
    // focus. Inside a frame on another page (the remix.gg arena, an embed) that
    // left the keyboard on the host: the click reached the canvas and every key
    // after it went to the page around the game. Focusable with no tab stop, so
    // `onDown` can hand the frame the keyboard on the same click.
    canvas.tabIndex = -1;
    canvas.style.outline = 'none';
    function emit(type, data) {
        const set = listeners.get(type);
        if (!set)
            return;
        for (const cb of [...set])
            cb(data);
    }
    function dispatch(sample) {
        const result = reduceGestures(state, sample, thresholds);
        state = result.state;
        for (const event of result.events)
            emit(event.type, event.data);
    }
    const reallyLocked = () => doc !== null && doc.pointerLockElement === canvas;
    const isLocked = () => reallyLocked() || soft;
    /** The cursor the game had set before a stand-in hid it; restored when the stand-in ends. */
    let cursorBefore = '';
    const announce = () => {
        const next = isLocked();
        if (next === announced)
            return;
        announced = next;
        emit('lock', { locked: next });
    };
    const standIn = () => {
        if (soft || reallyLocked())
            return;
        soft = true;
        cursorBefore = canvas.style.cursor ?? '';
        canvas.style.cursor = 'none';
        announce();
    };
    const endStandIn = () => {
        if (!soft)
            return;
        soft = false;
        canvas.style.cursor = cursorBefore;
        announce();
    };
    /** Ask the browser for the real lock; true once it is held, false however it says no. */
    const askBrowser = () => {
        const request = canvas.requestPointerLock;
        if (doc === null || typeof request !== 'function')
            return Promise.resolve(false);
        if (reallyLocked())
            return Promise.resolve(true);
        return new Promise((resolve) => {
            const settle = (held) => {
                doc.removeEventListener('pointerlockchange', onChange);
                doc.removeEventListener('pointerlockerror', onError);
                resolve(held);
            };
            const onChange = () => settle(reallyLocked());
            const onError = () => settle(false);
            doc.addEventListener('pointerlockchange', onChange);
            doc.addEventListener('pointerlockerror', onError);
            try {
                // Newer browsers answer a promise; older ones return nothing and
                // report through the two events either way.
                const answer = request.call(canvas);
                answer?.catch?.(() => settle(false));
            }
            catch {
                settle(false);
            }
        });
    };
    /**
     * Relative motion under a lock, in design units. The browser reports
     * `movementX`/`movementY` in CSS pixels; one CSS pixel is however many
     * design units the viewport currently maps it to, read off `toDesign` so a
     * resized window keeps the same feel as the fit changes.
     */
    function look(event) {
        const dxPx = event.movementX || 0;
        const dyPx = event.movementY || 0;
        if (dxPx === 0 && dyPx === 0)
            return;
        viewport.toDesign(0, 0, lookOrigin);
        viewport.toDesign(1, 1, lookUnit);
        emit('look', {
            dx: dxPx * (lookUnit.x - lookOrigin.x),
            dy: dyPx * (lookUnit.y - lookOrigin.y),
        });
    }
    function sampleOf(event, phase) {
        viewport.toDesign(event.clientX, event.clientY, design);
        return { id: event.pointerId, x: design.x, y: design.y, time: event.timeStamp, phase };
    }
    function capture(pointerId) {
        try {
            canvas.setPointerCapture?.(pointerId);
        }
        catch {
            // Desktop's emulated cross-origin preview recreates the pointer event in
            // the game document. Chromium correctly refuses native capture for that
            // synthetic id, but the preview host already owns the real capture and
            // continues forwarding the stream, so tracking must still begin here.
        }
    }
    function releaseCapture(pointerId) {
        try {
            canvas.releasePointerCapture?.(pointerId);
        }
        catch {
            // Losing capture is already the requested end state.
        }
    }
    const onDown = (event) => {
        if (!enabled)
            return;
        event.preventDefault();
        canvas.focus?.({ preventScroll: true });
        lastDownAt = nowMs();
        // A stand-in asks the browser again on every press: the view may have
        // focus now when it did not a click ago, and a real lock is better.
        if (soft && !reallyLocked())
            void askBrowser();
        // Capture so a finger that slides off the canvas keeps reporting; without
        // it a drag that leaves the edge sticks forever in the "down" state.
        capture(event.pointerId);
        dispatch(sampleOf(event, 'down'));
    };
    const onMove = (event) => {
        if (!enabled)
            return;
        // Under a lock the cursor is pinned: every sample has the same x and y,
        // so the reducer sees no drag, and the motion arrives as `look` instead.
        if (isLocked()) {
            look(event);
            return;
        }
        dispatch(sampleOf(event, 'move'));
    };
    const onLockChange = () => {
        // A real lock replaces a stand-in silently; the game already holds one.
        if (reallyLocked() && soft) {
            soft = false;
            canvas.style.cursor = cursorBefore;
        }
        announce();
    };
    // Escape ends a stand-in the way the browser ends a real lock.
    const onKey = (event) => {
        if (event?.key === 'Escape')
            endStandIn();
    };
    const onUp = (event) => {
        if (!enabled)
            return;
        releaseCapture(event.pointerId);
        dispatch(sampleOf(event, 'up'));
    };
    const onCancel = (event) => {
        if (!enabled)
            return;
        dispatch(sampleOf(event, 'cancel'));
    };
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onCancel);
    doc?.addEventListener('pointerlockchange', onLockChange);
    doc?.addEventListener('keydown', onKey);
    function resolve(pointer) {
        return pointer ?? state.pointers[0] ?? null;
    }
    function aim(pointer) {
        viewport.designToNdc(pointer.x, pointer.y, ndc);
        raycaster.setFromCamera(ndc, rig.camera);
    }
    return {
        get pointers() {
            return state.pointers;
        },
        get primary() {
            return state.pointers[0] ?? null;
        },
        get locked() {
            return isLocked();
        },
        get enabled() {
            return enabled;
        },
        set enabled(value) {
            enabled = value;
            // Dropping the tracked pointers matters: re-enabling mid-drag would
            // otherwise emit a drag with a huge delta from a stale origin.
            if (!value)
                state = createGestureState();
        },
        on(event, cb) {
            let set = listeners.get(event);
            if (!set) {
                set = new Set();
                listeners.set(event, set);
            }
            const entry = cb;
            set.add(entry);
            return () => {
                set?.delete(entry);
            };
        },
        pick(objects, pointer) {
            const active = resolve(pointer);
            if (!active)
                return [];
            aim(active);
            return objects
                ? raycaster.intersectObjects(objects, true)
                : raycaster.intersectObjects(scene.children, true);
        },
        pickPlane(plane, out, pointer) {
            const active = resolve(pointer);
            if (!active)
                return null;
            aim(active);
            return raycaster.ray.intersectPlane(plane, out ?? new Vector3());
        },
        lockPointer() {
            if (isLocked())
                return Promise.resolve(true);
            if (doc === null)
                return Promise.resolve(false);
            const fromPress = nowMs() - lastDownAt <= LOCK_GESTURE_WINDOW_MS;
            return askBrowser().then((held) => {
                if (held)
                    return true;
                if (!fromPress)
                    return false;
                standIn();
                return true;
            });
        },
        unlockPointer() {
            if (reallyLocked())
                doc?.exitPointerLock?.();
            else
                endStandIn();
        },
        dispose() {
            canvas.removeEventListener('pointerdown', onDown);
            canvas.removeEventListener('pointermove', onMove);
            canvas.removeEventListener('pointerup', onUp);
            canvas.removeEventListener('pointercancel', onCancel);
            doc?.removeEventListener('pointerlockchange', onLockChange);
            doc?.removeEventListener('keydown', onKey);
            if (soft) {
                soft = false;
                canvas.style.cursor = cursorBefore;
            }
            listeners.clear();
            state = createGestureState();
        },
    };
}
