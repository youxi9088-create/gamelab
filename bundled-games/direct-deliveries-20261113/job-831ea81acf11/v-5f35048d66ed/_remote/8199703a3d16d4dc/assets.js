import { SRGBColorSpace, TextureLoader, } from '../43b35e11ca3eada7/three.module.min.js';
import { GLTFLoader } from '../cfa298074405147e/GLTFLoader.js';
import { clone as cloneSkinned } from '../25d34982f8c393b4/SkeletonUtils.js';
import { loadModel as loadModelData } from '../7ba22f5f7f1f2c8c/model-loader.js';
export function createAssets(options = {}) {
    const loaded = {
        textures: new Map(),
        models: new Map(),
        audio: new Map(),
        json: new Map(),
    };
    const owned = new Set();
    const textureLoader = new TextureLoader();
    const gltfLoader = new GLTFLoader();
    function require(map, key, kind) {
        const value = map.get(key);
        if (value === undefined) {
            throw new Error(`Asset '${key}' is not a loaded ${kind}. Add it to the manifest passed to createGame.`);
        }
        return value;
    }
    function ownResources(root) {
        root.traverse((node) => {
            const renderable = node;
            if (renderable.geometry)
                owned.add(renderable.geometry);
            const material = renderable.material;
            if (!material)
                return;
            for (const entry of Array.isArray(material) ? material : [material]) {
                owned.add(entry);
                for (const value of Object.values(entry)) {
                    if (value?.isTexture)
                        owned.add(value);
                }
            }
        });
    }
    async function loadTexture(key, url) {
        const texture = await textureLoader.loadAsync(url);
        // Colour textures are authored in sRGB; leaving three's default linear
        // interpretation is why untagged textures look washed out.
        texture.colorSpace = SRGBColorSpace;
        texture.anisotropy = 4;
        loaded.textures.set(key, texture);
        owned.add(texture);
    }
    async function loadModel(key, url) {
        // No Draco or KTX2: their decoders are side-loaded .wasm/.js files, and a
        // published Remix game is a single self-contained HTML document.
        const gltf = await loadModelData(gltfLoader, url);
        loaded.models.set(key, { scene: gltf.scene, animations: gltf.animations });
        ownResources(gltf.scene);
    }
    async function loadAudio(key, url) {
        if (!options.decodeAudio)
            return;
        const response = await fetch(url);
        if (!response.ok)
            throw new Error(`Failed to load audio '${key}' from ${url}`);
        loaded.audio.set(key, await options.decodeAudio(await response.arrayBuffer()));
    }
    async function loadJson(key, url) {
        const response = await fetch(url);
        if (!response.ok)
            throw new Error(`Failed to load json '${key}' from ${url}`);
        loaded.json.set(key, await response.json());
    }
    return {
        texture: (key) => require(loaded.textures, key, 'texture'),
        model(key) {
            const entry = require(loaded.models, key, 'model');
            // SkeletonUtils.clone, not Object3D.clone: the plain clone shares the
            // skeleton, so two clones of a rigged model animate as one.
            return cloneSkinned(entry.scene);
        },
        animations: (key) => require(loaded.models, key, 'model').animations,
        sound: (key) => require(loaded.audio, key, 'sound'),
        json: (key) => require(loaded.json, key, 'json'),
        async load(manifest, onProgress) {
            const jobs = [];
            for (const [key, url] of Object.entries(manifest.textures ?? {}))
                jobs.push(() => loadTexture(key, url));
            for (const [key, url] of Object.entries(manifest.models ?? {}))
                jobs.push(() => loadModel(key, url));
            for (const [key, url] of Object.entries(manifest.audio ?? {}))
                jobs.push(() => loadAudio(key, url));
            for (const [key, url] of Object.entries(manifest.json ?? {}))
                jobs.push(() => loadJson(key, url));
            const total = jobs.length;
            let done = 0;
            onProgress?.(0, total);
            await Promise.all(jobs.map(async (job) => {
                await job();
                done++;
                onProgress?.(done, total);
            }));
        },
        owned,
    };
}
