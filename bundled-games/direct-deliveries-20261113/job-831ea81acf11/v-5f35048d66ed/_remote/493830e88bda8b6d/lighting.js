import { CircleGeometry, Color, DirectionalLight, Fog, HemisphereLight, Mesh, MeshBasicMaterial, PCFSoftShadowMap, Vector3, } from '../43b35e11ca3eada7/three.module.min.js';
const PRESETS = {
    studio: {
        background: 0x11161d,
        hemiSky: 0xffffff,
        hemiGround: 0x4a5568,
        hemiIntensity: 1.1,
        keyColor: 0xffffff,
        keyIntensity: 2.2,
        keyPosition: [5, 10, 7],
        fog: null,
    },
    sunset: {
        background: 0x2b1b33,
        hemiSky: 0xffb98a,
        hemiGround: 0x2a1a3a,
        hemiIntensity: 1.0,
        keyColor: 0xffd0a0,
        keyIntensity: 2.6,
        keyPosition: [-6, 6, 4],
        fog: [0x2b1b33, 18, 60],
    },
    night: {
        background: 0x060b0f,
        hemiSky: 0xbfd4ff,
        hemiGround: 0x0a0f14,
        hemiIntensity: 0.9,
        keyColor: 0xffffff,
        keyIntensity: 1.2,
        keyPosition: [4, 8, 6],
        fog: [0x060b0f, 14, 40],
    },
};
export function applyLighting(scene, preset, options = {}) {
    const spec = PRESETS[preset];
    scene.background = new Color(spec.background);
    scene.fog = spec.fog ? new Fog(spec.fog[0], spec.fog[1], spec.fog[2]) : null;
    const fill = new HemisphereLight(spec.hemiSky, spec.hemiGround, spec.hemiIntensity);
    const key = new DirectionalLight(spec.keyColor, spec.keyIntensity);
    key.position.set(...spec.keyPosition);
    scene.add(fill, key);
    if (options.shadows) {
        // Exactly one shadow-casting light. A second one doubles the depth passes
        // for a difference nobody sees on a 6-inch screen.
        key.castShadow = true;
        key.shadow.mapSize.set(1024, 1024);
        if (options.renderer) {
            options.renderer.shadowMap.enabled = true;
            options.renderer.shadowMap.type = PCFSoftShadowMap;
        }
        const bounds = options.shadowBounds;
        if (bounds) {
            const size = bounds.getSize(new Vector3());
            const radius = Math.max(size.x, size.z) / 2 + 1;
            const camera = key.shadow.camera;
            camera.left = -radius;
            camera.right = radius;
            camera.top = radius;
            camera.bottom = -radius;
            camera.near = 0.5;
            camera.far = Math.max(size.y * 2 + radius * 4, 50);
            camera.updateProjectionMatrix();
            key.target.position.copy(bounds.getCenter(new Vector3()));
            scene.add(key.target);
        }
    }
    return {
        key,
        fill,
        dispose() {
            key.removeFromParent();
            key.target.removeFromParent();
            fill.removeFromParent();
            key.dispose();
            fill.dispose();
            scene.fog = null;
        },
    };
}
/**
 * A flat translucent disc that tracks an object's ground position.
 *
 * On a small screen this reads better than a real shadow map and costs one
 * draw call instead of a depth pass — the same trick the Remix avatar already
 * uses in `packages/ui/src/lib/avatar-three.ts`.
 */
export function blobShadow(target, options = {}) {
    const radius = options.radius ?? 0.72;
    const groundY = options.groundY ?? 0;
    const geometry = new CircleGeometry(radius, 24);
    const material = new MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: options.opacity ?? 0.15,
        depthWrite: false,
    });
    const mesh = new Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.renderOrder = -1;
    const world = new Vector3();
    return {
        mesh,
        update() {
            target.getWorldPosition(world);
            mesh.position.set(world.x, groundY + 0.01, world.z);
            // Fade and shrink with height so a jump reads as a jump.
            const height = Math.max(world.y - groundY, 0);
            const falloff = Math.max(1 - height / 8, 0.15);
            mesh.scale.setScalar(falloff);
            material.opacity = (options.opacity ?? 0.15) * falloff;
        },
        dispose() {
            mesh.removeFromParent();
            geometry.dispose();
            material.dispose();
        },
    };
}
