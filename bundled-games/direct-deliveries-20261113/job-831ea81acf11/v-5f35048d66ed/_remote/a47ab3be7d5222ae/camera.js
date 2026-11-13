import { MathUtils, OrthographicCamera, PerspectiveCamera, Sphere, Vector3 } from '../43b35e11ca3eada7/three.module.min.js';
/**
 * Shared machinery of the fixed perspective rigs: frame the design box's height
 * with exactly `fov` at the design aspect, then let `resize` absorb any other
 * aspect. Orientation lives entirely in the defaults the public rigs pick.
 */
function perspectiveRig(options, defaults) {
    const fov = options.fov ?? defaults.fov;
    const position = options.position ?? defaults.position;
    const target = options.lookAt ?? defaults.lookAt;
    const camera = new PerspectiveCamera(fov, 1, options.near ?? 0.1, options.far ?? 300);
    camera.position.copy(position);
    camera.lookAt(target);
    const distance = Math.max(position.distanceTo(target), 1e-3);
    const baseHeight = 2 * distance * Math.tan(MathUtils.degToRad(fov) / 2);
    return {
        camera,
        resize(viewport) {
            camera.aspect = viewport.aspect;
            // Widen the vertical FOV by scale.y. When the window is wider than the
            // design box scale.y is 1 and the extra width comes free from `aspect`.
            const visibleHeight = baseHeight * viewport.scale.y;
            camera.fov = MathUtils.radToDeg(2 * Math.atan(visibleHeight / (2 * distance)));
            camera.updateProjectionMatrix();
        },
        update() { },
    };
}
/**
 * The default: a perspective camera looking slightly down at the origin, framed
 * so the design box's height is exactly what `fov` covers at the design aspect.
 */
export function portraitRig(options = {}) {
    return perspectiveRig(options, {
        fov: 50,
        position: new Vector3(0, 6, 14),
        lookAt: new Vector3(0, 1.5, 0),
    });
}
/**
 * `portraitRig`'s landscape complement, for desktop-target games on the
 * 1280x720 `LANDSCAPE_DESIGN` box: same frustum math, but a lower, farther
 * camera with a narrower vertical FOV, so a short-and-wide frame composes
 * horizontally instead of stacking depth into a tall column. Not the default —
 * `createGame` still assumes portrait; pass it explicitly as `camera`.
 */
export function landscapeRig(options = {}) {
    return perspectiveRig(options, {
        fov: 40,
        position: new Vector3(0, 5, 18),
        lookAt: new Vector3(0, 1, 0),
    });
}
/** Orthographic rig. Isometric is this rig with `heading: Math.PI / 4`. */
export function orthoRig(options = {}) {
    const frustumHeight = options.frustumHeight ?? 14;
    const heading = options.heading ?? 0;
    const pitch = options.pitch ?? 0.22;
    const distance = options.distance ?? 40;
    const target = options.lookAt ?? new Vector3();
    const camera = new OrthographicCamera(-1, 1, 1, -1, options.near ?? 0.1, options.far ?? 200);
    camera.position
        .set(Math.sin(heading) * Math.cos(pitch), Math.sin(pitch), Math.cos(heading) * Math.cos(pitch))
        .multiplyScalar(distance)
        .add(target);
    camera.lookAt(target);
    return {
        camera,
        resize(viewport) {
            const height = frustumHeight * viewport.scale.y;
            const width = height * viewport.aspect;
            camera.top = height / 2;
            camera.bottom = -height / 2;
            camera.right = width / 2;
            camera.left = -width / 2;
            camera.updateProjectionMatrix();
        },
        update() { },
    };
}
/** Perspective camera that chases an object with frame-rate-independent easing. */
export function followRig(target, options = {}) {
    const offset = options.offset ?? new Vector3(0, 9, 12);
    const lookOffset = options.lookOffset ?? new Vector3(0, 1, 0);
    const smoothing = options.smoothing ?? 0.18;
    const fov = options.fov ?? 50;
    const camera = new PerspectiveCamera(fov, 1, options.near ?? 0.1, options.far ?? 300);
    const focus = target.position.clone();
    const desired = new Vector3();
    const lookTarget = new Vector3();
    const distance = Math.max(offset.length(), 1e-3);
    const baseHeight = 2 * distance * Math.tan(MathUtils.degToRad(fov) / 2);
    focus.copy(target.position);
    if (options.bounds)
        options.bounds.clampPoint(focus, focus);
    camera.position.copy(focus).add(offset);
    camera.lookAt(lookTarget.copy(focus).add(lookOffset));
    return {
        camera,
        resize(viewport) {
            camera.aspect = viewport.aspect;
            camera.fov = MathUtils.radToDeg(2 * Math.atan((baseHeight * viewport.scale.y) / (2 * distance)));
            camera.updateProjectionMatrix();
        },
        update(dt) {
            desired.copy(target.position);
            if (options.bounds)
                options.bounds.clampPoint(desired, desired);
            // Exponential smoothing on dt, not a fixed lerp factor: a fixed factor
            // makes the camera lag differently at 60 Hz and 120 Hz.
            const alpha = smoothing > 0 ? 1 - Math.exp(-dt / smoothing) : 1;
            focus.lerp(desired, Math.min(alpha, 1));
            camera.position.copy(focus).add(offset);
            camera.lookAt(lookTarget.copy(focus).add(lookOffset));
        },
    };
}
/**
 * Places `camera` so `bounds` fits on screen at the current viewport, along the
 * camera's existing view direction. Call it after `rig.resize`.
 */
export function fitBounds(camera, bounds, viewport, options = {}) {
    const padding = options.padding ?? 1.1;
    const sphere = bounds.getBoundingSphere(new Sphere());
    const center = options.lookAt ?? sphere.center;
    const radius = Math.max(sphere.radius * padding, 1e-3);
    if (camera instanceof OrthographicCamera) {
        const halfHeight = (camera.top - camera.bottom) / 2;
        const halfWidth = (camera.right - camera.left) / 2;
        camera.zoom = Math.min(halfHeight / radius, halfWidth / radius);
        camera.updateProjectionMatrix();
        camera.lookAt(center);
        return;
    }
    const vFov = MathUtils.degToRad(camera.fov);
    // The horizontal half-angle is derived from the vertical one and the aspect;
    // taking the max of the two required distances is what keeps a wide object
    // from spilling off the sides of a narrow phone.
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * viewport.aspect);
    const distance = Math.max(radius / Math.sin(vFov / 2), radius / Math.sin(hFov / 2));
    const direction = camera.position.clone().sub(center);
    if (direction.lengthSq() < 1e-8)
        direction.set(0, 0.4, 1);
    camera.position.copy(center).addScaledVector(direction.normalize(), distance);
    camera.lookAt(center);
}
