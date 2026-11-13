// Textured medieval miniatures with a procedural fallback while their GLBs load.
import * as THREE from './_remote/0d0e081c7ee3d520/three@0.184.0.js';
import { GLTFLoader } from './_remote/3dd32535ca8fbea1/GLTFLoader.js';
import { clone as cloneSkeleton } from './_remote/4ad49cb7c7b531d9/SkeletonUtils.js';

const SKIN = 0xe9b0a2;
const SURFACE_KINDS = ['cloth', 'leather', 'stone', 'steel', 'skin', 'wood', 'gold'];

function makeSurfaceMaps(kind) {
    const size = 256;
    const settings = {
        cloth: [247, 54, 236, 34],
        leather: [241, 64, 218, 54],
        stone: [239, 58, 230, 48],
        steel: [250, 38, 232, 48],
        skin: [247, 34, 240, 28],
        wood: [239, 60, 219, 56],
        gold: [250, 38, 234, 40],
    }[kind];
    let seed = [...kind].reduce((value, char) => (value * 31 + char.charCodeAt(0)) >>> 0, 17);
    const random = () => {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        return seed / 4294967296;
    };
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const context = canvas.getContext('2d');
    const image = context.createImageData(size, size);
    const roughData = new Uint8ClampedArray(size * size * 4);
    const [colorBase, colorSpread, roughBase, roughSpread] = settings;
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const index = (y * size + x) * 4;
            const grain = kind === 'wood'
                ? Math.sin(y * 0.22 + Math.sin(x * 0.07) * 1.3) * 5
                : kind === 'steel'
                    ? Math.sin(x * 0.72 + Math.sin(y * 0.13)) * 2.2
                    : Math.sin(x * 0.16 + y * 0.12) * 2.5;
            const cloud = kind === 'stone' || kind === 'skin'
                ? Math.sin(x * 0.09 + 0.7) * Math.sin(y * 0.12) * 4
                : 0;
            const shade = value => Math.max(0, Math.min(255, Math.round(value)));
            const albedo = shade(colorBase + (random() - 0.5) * colorSpread + grain + cloud);
            const roughness = shade(roughBase + (random() - 0.5) * roughSpread + Math.abs(grain) * 1.4);
            image.data[index] = Math.min(255, albedo + 2);
            image.data[index + 1] = albedo;
            image.data[index + 2] = Math.max(0, albedo - 3);
            image.data[index + 3] = 255;
            roughData[index] = roughness;
            roughData[index + 1] = roughness;
            roughData[index + 2] = roughness;
            roughData[index + 3] = 255;
        }
    }
    const colorCanvas = document.createElement('canvas');
    colorCanvas.width = colorCanvas.height = size;
    colorCanvas.getContext('2d').putImageData(image, 0, 0);
    const roughCanvas = document.createElement('canvas');
    roughCanvas.width = roughCanvas.height = size;
    const roughContext = roughCanvas.getContext('2d');
    const roughImage = roughContext.createImageData(size, size);
    roughImage.data.set(roughData);
    roughContext.putImageData(roughImage, 0, 0);

    const color = new THREE.CanvasTexture(colorCanvas);
    color.colorSpace = THREE.SRGBColorSpace;
    const roughness = new THREE.CanvasTexture(roughCanvas);
    for (const texture of [color, roughness]) {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.generateMipmaps = true;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
    }

    const detail = colorCanvas.getContext('2d');
    detail.globalAlpha = 0.075;
    detail.lineWidth = 1;
    if (kind === 'cloth') {
        detail.strokeStyle = '#594735';
        for (let i = 0; i < size; i += 5) {
            detail.beginPath(); detail.moveTo(i, 0); detail.lineTo(i, size); detail.stroke();
            detail.beginPath(); detail.moveTo(0, i); detail.lineTo(size, i); detail.stroke();
        }
    } else if (kind === 'wood') {
        detail.strokeStyle = '#624224';
        for (let i = 0; i < 10; i++) {
            const y = random() * size;
            detail.beginPath();
            detail.moveTo(0, y);
            detail.bezierCurveTo(size * 0.3, y - 5, size * 0.65, y + 5, size, y - 2);
            detail.stroke();
        }
    } else if (kind === 'leather') {
        detail.fillStyle = '#59402b';
        for (let i = 0; i < 70; i++) {
            detail.beginPath();
            detail.ellipse(random() * size, random() * size, 1 + random() * 2, 1, random(), 0, Math.PI * 2);
            detail.fill();
        }
    } else if (kind === 'stone') {
        detail.fillStyle = '#584c3c';
        for (let i = 0; i < 90; i++) {
            const x = random() * size, y = random() * size;
            detail.fillRect(x, y, 1 + random() * 2, 1 + random() * 2);
        }
    } else if (kind === 'steel') {
        detail.strokeStyle = '#65707a';
        for (let i = 0; i < 14; i++) {
            const x = random() * size, y = random() * size;
            detail.beginPath(); detail.moveTo(x, y); detail.lineTo(x + 7 + random() * 12, y - 1); detail.stroke();
        }
    } else if (kind === 'skin') {
        detail.fillStyle = '#805d4b';
        for (let i = 0; i < 36; i++) {
            detail.beginPath(); detail.arc(random() * size, random() * size, 1 + random(), 0, Math.PI * 2); detail.fill();
        }
    } else {
        detail.strokeStyle = '#715927';
        for (let i = 0; i < 12; i++) {
            const x = random() * size, y = random() * size;
            detail.beginPath(); detail.moveTo(x, y); detail.lineTo(x + 3, y + 2); detail.stroke();
        }
    }
    color.needsUpdate = true;
    return { color, roughness };
}

const surfaceMaps = Object.fromEntries(SURFACE_KINDS.map(kind => [kind, makeSurfaceMaps(kind)]));

function applySurfaceFinish(material, kind, addColorMap = true) {
    if (kind === 'polished') return material;
    const maps = surfaceMaps[kind] || surfaceMaps.leather;
    if (addColorMap && !material.map) material.map = maps.color;
    if (!material.roughnessMap) material.roughnessMap = maps.roughness;
    material.needsUpdate = true;
    return material;
}

function finishForModelMaterial(material, pieceType, meshName = '') {
    const name = `${material.name || ''} ${meshName}`.toLowerCase();
    if (pieceType === 'b' && /beard|facial.?hair|mustache|moustache|hair/.test(name)) return 'beard';
    if (/skin|flesh|face|head|hand|ear|nose/.test(name)) return 'skin';
    if (/leather|hide|saddle|boot|belt/.test(name)) return 'leather';
    if (/wood|timber|handle/.test(name)) return 'wood';
    if (/stone|rock|mortar|masonry/.test(name) || (pieceType === 'r' && material.metalness < 0.3 && material.roughness > 0.78)) return 'stone';
    if (/gold|brass|bronze/.test(name)) return 'gold';
    if (/cloth|fabric|robe|dress|gown|tunic|cape|coat|garment|sleeve|skirt|shirt|surcoat|gambeson|mantle|vestment|linen|wool|embroider/.test(name)) return 'cloth';
    if (/steel|iron|armor|armour|metal|chain.?mail|helmet|helm|plate|blade|buckle/.test(name) || material.metalness > 0.35) return 'steel';
    return 'cloth';
}

function makeContactShadowTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 128;
    const context = canvas.getContext('2d');
    const gradient = context.createRadialGradient(64, 64, 7, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(30, 19, 11, 0.34)');
    gradient.addColorStop(0.42, 'rgba(30, 19, 11, 0.22)');
    gradient.addColorStop(0.76, 'rgba(30, 19, 11, 0.07)');
    gradient.addColorStop(1, 'rgba(30, 19, 11, 0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 128, 128);
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    return texture;
}

const contactShadowGeometry = new THREE.PlaneGeometry(1.5, 1.5);
const contactShadowMaterial = new THREE.MeshBasicMaterial({
    map: makeContactShadowTexture(),
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
    toneMapped: false,
});

const modelPaths = {
    p: 'assets/models/medieval-pawn.glb',
    n: 'assets/models/realistic-medieval-knight.glb',
    b: 'assets/models/elderly-white-bearded-bishop.glb',
    r: 'assets/models/weathered-medieval-rook-tower.glb',
    q: 'assets/models/bow-gown-medieval-queen.glb',
    k: 'assets/models/realistic-medieval-king.glb',
};
const loader = new GLTFLoader();
const modelLoads = {};
let modelLoadQueue = Promise.resolve();

async function loadPieceModel(type, path) {
    const url = new URL(path, import.meta.url).href;
    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            return await loader.loadAsync(url);
        } catch (error) {
            if (error?.name === 'AbortError' && attempt < 2) {
                // Browser fetches can be transiently cancelled while several large
                // GLBs compete during startup. Retry briefly before using the fallback.
                await new Promise(resolve => window.setTimeout(resolve, 180 * (attempt + 1)));
                continue;
            }
            if (error?.name !== 'AbortError') {
                console.warn(`Could not load medieval ${type} model; using its procedural miniature instead.`, error);
            }
            return null;
        }
    }
    return null;
}

// Load one model at a time to avoid overwhelming startup with simultaneous GLB
// and texture requests. Each piece still has its procedural miniature meanwhile.
for (const [type, path] of Object.entries(modelPaths)) {
    modelLoads[type] = modelLoadQueue.then(() => loadPieceModel(type, path));
    modelLoadQueue = modelLoads[type].then(() => undefined);
}

function clearPlaceholder(root) {
    for (const child of [...root.children]) {
        root.remove(child);
        child.traverse(object => {
            if (!object.isMesh) return;
            object.geometry?.dispose();
            const materials = Array.isArray(object.material) ? object.material : [object.material];
            materials.forEach(material => material?.dispose());
        });
    }
}

function addQueenDress(parent, side) {
    const white = side === 'w';
    const fabric = applySurfaceFinish(new THREE.MeshStandardMaterial({
        color: white ? 0xfffdf7 : 0x947235,
        roughness: 0.9,
        metalness: 0.02,
        side: THREE.DoubleSide,
    }), 'cloth');
    const hemProfile = [
        new THREE.Vector2(0.275, 0.045),
        new THREE.Vector2(0.27, 0.065),
        new THREE.Vector2(0.235, 0.15),
        new THREE.Vector2(0.195, 0.28),
        new THREE.Vector2(0.155, 0.42),
        new THREE.Vector2(0.125, 0.55),
        new THREE.Vector2(0.112, 0.67),
    ];
    const skirt = new THREE.Mesh(new THREE.LatheGeometry(hemProfile, 32), fabric);
    skirt.castShadow = true;
    skirt.receiveShadow = true;
    parent.add(skirt);

    const trim = mat(white ? 0xd5d9dc : 0xc5a04e, 0.48, 0.42, white ? 'steel' : 'gold');
    for (const [radius, y, thickness] of [[0.267, 0.065, 0.008], [0.115, 0.65, 0.006]]) {
        const band = new THREE.Mesh(new THREE.TorusGeometry(radius, thickness, 6, 32), trim);
        band.rotation.x = Math.PI / 2;
        band.position.y = y;
        band.castShadow = true;
        parent.add(band);
    }

    // Subtle front pleats give the full-length silhouette a clear gown shape.
    const pleat = mat(white ? 0xf0efea : 0x6f5428, 0.04, 0.88, 'cloth');
    for (const offset of [-1, 0, 1]) {
        line(parent, [
            [offset * 0.04, 0.63, 0.105],
            [offset * 0.075, 0.4, 0.145],
            [offset * 0.12, 0.16, 0.205],
            [offset * 0.14, 0.075, 0.225],
        ], pleat, 0.003);
    }
}

const brightTeamMaps = new WeakMap();

function brightenTeamMap(texture) {
    if (!texture?.image) return texture;
    const cached = brightTeamMaps.get(texture);
    if (cached) return cached;

    const image = texture.image;
    const width = image.width || image.naturalWidth || image.videoWidth;
    const height = image.height || image.naturalHeight || image.videoHeight;
    if (!width || !height) return texture;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) return texture;
    try {
        context.drawImage(image, 0, 0, width, height);
    } catch {
        return texture;
    }
    context.globalCompositeOperation = 'source-atop';
    context.globalAlpha = 0.42;
    context.fillStyle = '#fff4dd';
    context.fillRect(0, 0, width, height);

    const bright = new THREE.CanvasTexture(canvas);
    bright.name = `${texture.name || 'piece-albedo'}-ivory-team`;
    bright.colorSpace = texture.colorSpace;
    bright.mapping = texture.mapping;
    bright.channel = texture.channel;
    bright.wrapS = texture.wrapS;
    bright.wrapT = texture.wrapT;
    bright.magFilter = texture.magFilter;
    bright.minFilter = texture.minFilter;
    bright.anisotropy = texture.anisotropy;
    bright.generateMipmaps = texture.generateMipmaps;
    bright.flipY = texture.flipY;
    bright.premultiplyAlpha = texture.premultiplyAlpha;
    bright.unpackAlignment = texture.unpackAlignment;
    bright.offset.copy(texture.offset);
    bright.repeat.copy(texture.repeat);
    bright.center.copy(texture.center);
    bright.rotation = texture.rotation;
    bright.matrixAutoUpdate = texture.matrixAutoUpdate;
    bright.matrix.copy(texture.matrix);
    bright.needsUpdate = true;
    brightTeamMaps.set(texture, bright);
    return bright;
}

function installTexturedModel(rig, side, gltf) {
    if (!gltf || rig.root.userData.texturedModelInstalled) return;
    rig.root.userData.texturedModelInstalled = true;
    const model = cloneSkeleton(gltf.scene);
    model.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(model);
    const size = bounds.getSize(new THREE.Vector3());
    const footprint = Math.max(size.x, size.z);
    if (size.y <= 0 || footprint <= 0) return;

    // Keep every miniature comfortably inside its square while giving the figures
    // enough height to read clearly from the board camera.
    const widthLimit = rig.type === 'n' ? 0.9 : rig.type === 'r' ? 0.76 : 0.74;
    const targetHeight = rig.type === 'r' ? 1.12 : rig.type === 'n' ? 1.18 : 1.2;
    const horizontalScale = Math.min(1.25, widthLimit / footprint);
    const verticalScale = targetHeight / size.y;
    model.scale.set(horizontalScale, verticalScale, horizontalScale);
    const center = bounds.getCenter(new THREE.Vector3());
    model.position.set(-center.x * horizontalScale, -bounds.min.y * verticalScale, -center.z * horizontalScale);

    // Keep a restrained team palette in the material base color. Maps remain
    // untouched, so their surface detail still drives the finished appearance.
    const teamPalette = side === 'w'
        ? { cloth: 0xf4f1e9, steel: 0xd7dee5, stone: 0xd8d2c6, leather: 0x806044, wood: 0x79532f, gold: 0xb99a5c, skin: SKIN, beard: 0xe8e5dc }
        : { cloth: 0xa68139, steel: 0x484d55, stone: 0x514638, leather: 0x30251e, wood: 0x33251b, gold: 0xc5a04e, skin: SKIN, beard: 0xe8e5dc };
    // Supply subtle procedural material texture only where an imported surface
    // has no authored map; never replace authored albedo, normal, or roughness maps.
    model.traverse(object => {
        if (!object.isMesh) return;
        object.castShadow = true;
        object.receiveShadow = true;
        const addTextureFallback = material => {
            if (!material) return material;
            const finish = finishForModelMaterial(material, rig.type, object.name);
            const textured = material.clone();
            if (textured.color) {
                const skinOrBeard = finish === 'skin' || finish === 'beard';
                const whiteTint = { cloth: 0.92, steel: 0.9, stone: 0.9, leather: 0.55, wood: 0.55, gold: 0.62 };
                const blackTint = { cloth: 0.82, steel: 0.92, stone: 0.88, leather: 0.78, wood: 0.78, gold: 0.72 };
                const tintStrength = skinOrBeard ? 0.08 : (side === 'w' ? whiteTint[finish] : blackTint[finish]) ?? 0.8;
                textured.color.lerp(new THREE.Color(teamPalette[finish] ?? teamPalette.cloth), tintStrength);
                if (!skinOrBeard) textured.color.multiplyScalar(side === 'w' ? 1.38 : 0.58);
            }
            if ('map' in textured && !textured.map) {
                textured.map = surfaceMaps[finish]?.color || surfaceMaps.cloth.color;
            }
            if (side === 'w' && finish !== 'skin' && finish !== 'beard' && textured.map) {
                textured.map = brightenTeamMap(textured.map);
            }
            if ('roughnessMap' in textured && !textured.roughnessMap) {
                textured.roughnessMap = surfaceMaps[finish]?.roughness || surfaceMaps.leather.roughness;
            }
            textured.needsUpdate = true;
            return textured;
        };
        object.material = Array.isArray(object.material)
            ? object.material.map(addTextureFallback)
            : addTextureFallback(object.material);
    });

    // Give even static source models a subtle battle-ready gait. Rigged models
    // play their authored clips inside this pivot; the pivot adds a restrained
    // whole-body weight shift for mounted and non-rigged miniatures.
    clearPlaceholder(rig.root);
    const motionRoot = new THREE.Group();
    motionRoot.add(model);
    rig.root.add(motionRoot);
    rig.modelMotion = motionRoot;
    rig.legs = [];
    addTexturedAttackPose(rig, motionRoot, side === 'w');
    rig.horse = null;
    rig.shield = null;
    rig.weapon = null;

    if (gltf.animations.length) {
        const mixer = new THREE.AnimationMixer(model);
        const wanted = new Set([
            'Idle', 'Sword_Idle', 'Idle_Shield_Loop', 'Idle_Torch_Loop', 'Walk', 'Walk_Formal_Loop',
            'Walk_Carry_Loop', 'Run', 'Sprint_Loop', 'Sword_Regular_A', 'Sword_Regular_C', 'Sword_Regular_Combo', 'Sword_Attack',
            'Sword_Heavy_Combo', 'Sword_Block', 'Shield_Dash', 'Hit_Chest', 'Hit_Head',
            'Spell_Simple_Enter', 'Spell_Simple_Shoot', 'Spell_Simple_Idle_Loop', 'Yes', 'Interact',
            'Pistol_Aim_Neutral', 'Pistol_Shoot',
        ]);
        const actions = new Map();
        for (const clip of gltf.animations) {
            const name = clip.name.replace(/_(?:L|R)$/, '');
            if (wanted.has(name) && !actions.has(name)) actions.set(name, mixer.clipAction(clip));
        }
        rig.modelAnimation = { mixer, actions, activeName: null, lastTime: null };
    }
}


function mat(color, metal = 0.1, rough = 0.6, finish = null) {
    const material = new THREE.MeshStandardMaterial({ color, metalness: metal, roughness: rough });
    const inferredFinish = finish || (metal > 0.65 ? 'steel' : metal > 0.3 ? 'gold' : rough > 0.85 ? 'cloth' : rough < 0.5 ? 'polished' : 'leather');
    return applySurfaceFinish(material, inferredFinish);
}

function part(parent, geo, material, x, y, z) {
    const mesh = new THREE.Mesh(geo, material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    parent.add(mesh);
    return mesh;
}

function armGroup(parent, x, y) {
    const arm = new THREE.Group();
    arm.position.set(x, y, 0);
    parent.add(arm);
    return arm;
}

function line(parent, points, material, radius = 0.006) {
    const curve = new THREE.CatmullRomCurve3(points.map(([x, y, z]) => new THREE.Vector3(x, y, z)));
    return part(parent, new THREE.TubeGeometry(curve, Math.max(8, points.length * 4), radius, 5, false), material, 0, 0, 0);
}

function addCape(parent, color, trimColor) {
    const shape = new THREE.Shape();
    shape.moveTo(-0.105, 0.82);
    shape.lineTo(0.105, 0.82);
    shape.quadraticCurveTo(0.13, 0.54, 0.18, 0.17);
    shape.quadraticCurveTo(0, 0.11, -0.18, 0.17);
    shape.quadraticCurveTo(-0.13, 0.54, -0.105, 0.82);
    const cloth = applySurfaceFinish(new THREE.MeshStandardMaterial({ color, roughness: 0.92, side: THREE.DoubleSide }), 'cloth');
    part(parent, new THREE.ShapeGeometry(shape, 8), cloth, 0, 0, -0.13);
    line(parent, [[-0.105, 0.81, -0.124], [-0.13, 0.49, -0.124], [-0.17, 0.18, -0.124]], trimColor, 0.006);
    line(parent, [[0.105, 0.81, -0.124], [0.13, 0.49, -0.124], [0.17, 0.18, -0.124]], trimColor, 0.006);
    line(parent, [[-0.16, 0.18, -0.124], [0, 0.145, -0.124], [0.16, 0.18, -0.124]], trimColor, 0.007);
}

function addSkirt(parent, color, trimColor, long = false) {
    const top = long ? 0.53 : 0.47;
    const hem = long ? 0.08 : 0.16;
    const width = long ? 0.2 : 0.17;
    const shape = new THREE.Shape();
    shape.moveTo(-0.115, top);
    shape.lineTo(0.115, top);
    shape.lineTo(width, hem);
    shape.quadraticCurveTo(0, hem - 0.015, -width, hem);
    shape.closePath();
    const cloth = applySurfaceFinish(new THREE.MeshStandardMaterial({ color, roughness: 0.88, side: THREE.DoubleSide }), 'cloth');
    part(parent, new THREE.ShapeGeometry(shape), cloth, 0, 0, 0.035);
    line(parent, [[-width, hem + 0.012, 0.043], [0, hem - 0.003, 0.043], [width, hem + 0.012, 0.043]], trimColor, 0.008);
    if (long) {
        for (const x of [-0.09, 0.09]) {
            line(parent, [[x * 0.55, top - 0.015, 0.044], [x * 0.78, 0.31, 0.044], [x, hem + 0.035, 0.044]], trimColor, 0.0035);
        }
    }
}

function addBelt(parent, leather, gold, y = 0.48) {
    const belt = part(parent, new THREE.TorusGeometry(0.135, 0.017, 6, 24), leather, 0, y, 0);
    belt.rotation.x = Math.PI / 2;
    part(parent, new THREE.BoxGeometry(0.052, 0.065, 0.025), gold, 0, y, 0.14);
    part(parent, new THREE.BoxGeometry(0.023, 0.035, 0.012), leather, 0, y, 0.156);
    part(parent, new THREE.SphereGeometry(0.012, 8, 6), gold, 0.057, y, 0.118);
}

function addCuirass(parent, steel, gold) {
    const plate = part(parent, new THREE.SphereGeometry(0.13, 14, 12), steel, 0, 0.62, 0.085);
    plate.scale.set(0.94, 1.22, 0.48);
    const center = part(parent, new THREE.SphereGeometry(0.075, 10, 8), mat(0xffffff, 0.72, 0.3), 0, 0.64, 0.141);
    center.scale.set(0.72, 1.18, 0.18);
    line(parent, [[-0.07, 0.73, 0.144], [0, 0.77, 0.15], [0.07, 0.73, 0.144]], gold, 0.004);
    for (const side of [-1, 1]) {
        const pauldron = part(parent, new THREE.SphereGeometry(0.07, 10, 8), steel, side * 0.145, 0.77, 0.005);
        pauldron.scale.set(1.1, 0.72, 1.15);
        part(parent, new THREE.SphereGeometry(0.012, 7, 6), gold, side * 0.145, 0.79, 0.073);
        part(parent, new THREE.SphereGeometry(0.009, 7, 6), gold, side * 0.09, 0.7, 0.139);
    }
}

function addHelmet(parent, steel, gold, plumeColor = null) {
    part(parent, new THREE.SphereGeometry(0.105, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), steel, 0, 1.005, -0.004);
    const rim = part(parent, new THREE.TorusGeometry(0.096, 0.012, 6, 20), gold, 0, 1.0, 0);
    rim.rotation.x = Math.PI / 2;
    part(parent, new THREE.BoxGeometry(0.018, 0.12, 0.027), steel, 0, 0.91, 0.111);
    for (const side of [-1, 1]) {
        const cheek = part(parent, new THREE.BoxGeometry(0.036, 0.105, 0.035), steel, side * 0.081, 0.892, 0.039);
        cheek.rotation.z = side * -0.12;
        part(parent, new THREE.SphereGeometry(0.008, 6, 5), gold, side * 0.08, 0.87, 0.065);
    }
    if (plumeColor !== null) {
        const plume = part(parent, new THREE.ConeGeometry(0.038, 0.2, 7), mat(plumeColor, 0.04, 0.8, 'cloth'), 0, 1.135, -0.055);
        plume.rotation.x = -0.34;
        part(parent, new THREE.SphereGeometry(0.035, 8, 6), mat(plumeColor, 0.04, 0.8), 0, 1.06, -0.025);
    }
}

function sword(arm, length, steel, gold = steel) {
    const blade = part(arm, new THREE.BoxGeometry(0.028, length, 0.052), steel, 0, -0.2, 0.1 + length / 2);
    blade.rotation.x = Math.PI / 2;
    const guard = part(arm, new THREE.BoxGeometry(0.16, 0.025, 0.035), gold, 0, -0.2, 0.105);
    guard.rotation.z = -0.08;
    const grip = part(arm, new THREE.CylinderGeometry(0.016, 0.018, 0.12, 8), mat(0x49301c, 0.05, 0.78, 'leather'), 0, -0.2, 0.035);
    grip.rotation.x = Math.PI / 2;
    part(arm, new THREE.SphereGeometry(0.025, 8, 6), gold, 0, -0.2, -0.025);
    const tip = part(arm, new THREE.ConeGeometry(0.022, 0.09, 4), steel, 0, -0.2, 0.1 + length + 0.025);
    tip.rotation.x = Math.PI / 2;
}

function addTexturedAttackPose(rig, parent, white) {
    if (rig.type !== 'q' && rig.type !== 'n') return;
    const pose = new THREE.Group();
    pose.name = rig.type === 'q' ? 'queen-bow-attack-pose' : 'mounted-knight-sword-attack-pose';
    pose.position.set(0.19, rig.type === 'q' ? 0.76 : 0.72, rig.type === 'q' ? 0.04 : 0.14);
    pose.visible = false;
    parent.add(pose);
    rig.attackPose = pose;

    if (rig.type === 'q') {
        const wood = mat(white ? 0x80552f : 0x543a20, 0.02, 0.82, 'wood');
        const string = mat(white ? 0xe4dbca : 0xc5a04e, 0.02, 0.78, white ? 'cloth' : 'gold');
        const steel = mat(white ? 0xd7dee5 : 0x484d55, 0.5, 0.4, 'steel');
        line(pose, [[-0.07, -0.26, 0.14], [0.035, -0.23, 0.14], [0.13, -0.11, 0.14], [0.17, 0.015, 0.14], [0.12, 0.15, 0.14], [0.02, 0.2, 0.14]], wood, 0.012);
        line(pose, [[-0.07, -0.26, 0.14], [0.02, 0.2, 0.14]], string, 0.003);
        const arrowX = 0.045;
        const arrowY = -0.025;
        const shaft = part(pose, new THREE.CylinderGeometry(0.006, 0.008, 0.34, 6), wood, arrowX, arrowY, 0.29);
        shaft.rotation.x = Math.PI / 2;
        const arrowTip = part(pose, new THREE.ConeGeometry(0.014, 0.055, 5), steel, arrowX, arrowY, 0.47);
        arrowTip.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1));
        const fletching = mat(white ? 0x8f3c32 : 0xb8944e, 0.02, 0.82, white ? 'cloth' : 'gold');
        line(pose, [[arrowX, arrowY, 0.17], [arrowX - 0.035, arrowY + 0.025, 0.105], [arrowX, arrowY, 0.21]], fletching, 0.005);
        line(pose, [[arrowX, arrowY, 0.17], [arrowX + 0.035, arrowY - 0.025, 0.105], [arrowX, arrowY, 0.21]], fletching, 0.005);
        rig.attackArrowOrigin = new THREE.Vector3(arrowX, arrowY, 0.29);
    } else {
        const steel = mat(white ? 0xd7dee5 : 0x484d55, 0.72, 0.34, 'steel');
        const gold = mat(white ? 0xe7e9e8 : 0xc5a04e, 0.58, 0.34, white ? 'steel' : 'gold');
        sword(pose, 0.48, steel, gold);
    }
}

function addBishopBeard(parent) {
    const beard = mat(0xe8e4db, 0.01, 0.9, 'cloth');
    const shape = new THREE.Shape();
    shape.moveTo(-0.068, 0.87);
    shape.quadraticCurveTo(-0.096, 0.83, -0.074, 0.78);
    shape.lineTo(-0.047, 0.65);
    shape.quadraticCurveTo(-0.018, 0.68, 0, 0.605);
    shape.quadraticCurveTo(0.02, 0.68, 0.05, 0.65);
    shape.lineTo(0.074, 0.78);
    shape.quadraticCurveTo(0.096, 0.83, 0.068, 0.87);
    shape.quadraticCurveTo(0, 0.846, -0.068, 0.87);
    part(parent, new THREE.ShapeGeometry(shape, 12), beard, 0, 0, 0.112);
    for (const side of [-1, 1]) {
        const moustache = part(parent, new THREE.SphereGeometry(0.029, 10, 8), beard, side * 0.025, 0.86, 0.119);
        moustache.scale.set(1.05, 0.52, 0.34);
    }
}

function addQueenBow(arm, white, steel) {
    const wood = mat(white ? 0x80552f : 0x543a20, 0.02, 0.82, 'wood');
    const string = mat(white ? 0xe4dbca : 0xc5a04e, 0.02, 0.78, white ? 'cloth' : 'gold');
    line(arm, [[-0.07, -0.26, 0.14], [0.035, -0.23, 0.14], [0.13, -0.11, 0.14], [0.17, 0.015, 0.14], [0.12, 0.15, 0.14], [0.02, 0.2, 0.14]], wood, 0.012);
    line(arm, [[-0.07, -0.26, 0.14], [0.02, 0.2, 0.14]], string, 0.003);

    // The nocked arrow aims out through the bow toward the opposing side of the board.
    const arrowX = 0.045;
    const arrowY = -0.025;
    const shaft = part(arm, new THREE.CylinderGeometry(0.006, 0.008, 0.34, 6), wood,
        arrowX, arrowY, 0.29);
    shaft.rotation.x = Math.PI / 2;
    const arrowTip = part(arm, new THREE.ConeGeometry(0.014, 0.055, 5), steel,
        arrowX, arrowY, 0.47);
    arrowTip.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1));
    const fletching = mat(white ? 0x8f3c32 : 0xb8944e, 0.02, 0.82, white ? 'cloth' : 'gold');
    line(arm, [[arrowX, arrowY, 0.17], [arrowX - 0.035, arrowY + 0.025, 0.105], [arrowX, arrowY, 0.21]], fletching, 0.005);
    line(arm, [[arrowX, arrowY, 0.17], [arrowX + 0.035, arrowY - 0.025, 0.105], [arrowX, arrowY, 0.21]], fletching, 0.005);
}

function crown(parent, y, gold, jewelColor = 0x8f252a) {
    const band = part(parent, new THREE.CylinderGeometry(0.112, 0.105, 0.075, 12, 1, true), gold, 0, y, 0);
    band.material.side = THREE.DoubleSide;
    const lower = part(parent, new THREE.TorusGeometry(0.105, 0.012, 6, 20), gold, 0, y - 0.027, 0);
    lower.rotation.x = Math.PI / 2;
    for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2;
        const point = part(parent, new THREE.ConeGeometry(0.024, 0.075, 5), gold,
            Math.cos(a) * 0.09, y + 0.067, Math.sin(a) * 0.09);
        point.rotation.z = -Math.cos(a) * 0.18;
        point.rotation.x = Math.sin(a) * 0.18;
    }
    for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        part(parent, new THREE.SphereGeometry(0.012, 7, 6), mat(0xf1dfb5, 0.35, 0.32),
            Math.cos(a) * 0.106, y + 0.005, Math.sin(a) * 0.106);
    }
    part(parent, new THREE.SphereGeometry(0.026, 10, 8), mat(jewelColor, 0.3, 0.24), 0, y + 0.02, 0.103);
}

function fighterFace(parent, y, style = 'warrior') {
    const queen = style === 'queen';
    const king = style === 'king';
    const skin = mat(SKIN, 0, 0.62, 'skin');
    const earShade = mat(0x9e6854, 0, 0.75, 'skin');
    const socket = mat(queen ? 0x553443 : king ? 0x49352f : 0x49302b, 0, 0.65);
    const brow = mat(queen ? 0x50323a : king ? 0x38251f : 0x38231f, 0, 0.7);
    const eyeWhite = mat(0xffead6, 0, 0.34);
    const iris = mat(queen ? 0x39776c : 0x487ca0, 0.05, 0.32);
    const pupil = mat(0x171313, 0, 0.3);
    const mouth = mat(queen ? 0x9f3f56 : king ? 0x653b32 : 0x301619, 0, 0.6);
    const teeth = mat(0xffe8c3, 0, 0.45);

    // Facial features remain on the front of the face; army orientation is handled by the board.
    for (const side of [-1, 1]) {
        part(parent, new THREE.SphereGeometry(0.032, 10, 8), skin, side * 0.105, y, 0)
            .scale.set(0.58, 0.9, 0.55);
        part(parent, new THREE.SphereGeometry(0.016, 8, 6), earShade, side * 0.108, y, 0.014)
            .scale.set(0.5, 0.75, 0.4);
    }

    for (const side of [-1, 1]) {
        part(parent, new THREE.SphereGeometry(0.027, 10, 8), socket, side * 0.041, y + 0.014, 0.094)
            .scale.set(1, 0.86, 0.48);
        part(parent, new THREE.SphereGeometry(0.021, 10, 8), eyeWhite, side * 0.041, y + 0.014, 0.106)
            .scale.set(0.92, 0.84, 0.58);
        if (queen || king) {
            part(parent, new THREE.SphereGeometry(0.011, 8, 6), iris, side * 0.041, y + 0.011, 0.119)
                .scale.set(0.9, 1, 0.65);
        }
        part(parent, new THREE.SphereGeometry(0.0065, 8, 6), pupil, side * 0.041, y + 0.011, 0.127)
            .scale.set(0.88, 1, 0.65);
        const browBar = part(parent,
            new THREE.BoxGeometry(queen ? 0.069 : 0.074, queen ? 0.012 : 0.016, 0.022),
            brow, side * 0.041, y + 0.048, 0.095);
        browBar.rotation.z = queen ? -side * 0.13 : king ? -side * 0.08 : side * 0.34;
        if (queen) {
            const lash = part(parent, new THREE.BoxGeometry(0.021, 0.005, 0.008), brow,
                side * 0.068, y + 0.013, 0.108);
            lash.rotation.z = -side * 0.5;
            part(parent, new THREE.SphereGeometry(0.016, 8, 6), mat(0xd78383, 0, 0.8),
                side * 0.066, y - 0.032, 0.095).scale.set(0.72, 0.42, 0.22);
        }
    }

    const noseSize = queen ? 0.018 : king ? 0.021 : 0.024;
    part(parent, new THREE.SphereGeometry(noseSize, 10, 8), skin, 0, y - 0.016, 0.105)
        .scale.set(0.74, 1.05, 0.78);
    if (queen || king) {
        const smile = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-0.026, y - 0.057, 0.12),
            new THREE.Vector3(0, y - (queen ? 0.064 : 0.068), 0.126),
            new THREE.Vector3(0.026, y - 0.057, 0.12),
        ]);
        part(parent, new THREE.TubeGeometry(smile, 8, queen ? 0.0035 : 0.0028, 5, false), mouth, 0, 0, 0);
        if (queen) part(parent, new THREE.SphereGeometry(0.012, 8, 6), mouth, 0, y - 0.067, 0.12)
            .scale.set(1.3, 0.3, 0.25);
    } else {
        part(parent, new THREE.SphereGeometry(0.027, 10, 8), mouth, 0, y - 0.061, 0.103)
            .scale.set(1.08, 0.4, 0.42);
        part(parent, new THREE.BoxGeometry(0.044, 0.006, 0.007), teeth, 0, y - 0.052, 0.122);
    }
}

function humanoid(g, cloth, height = 1, faceStyle = 'warrior', type = 'p') {
    const legs = [];
    addCape(g, cloth.cape, cloth.trim);
    for (const side of [-1, 1]) {
        const leg = armGroup(g, side * 0.08, 0.4 * height);
        part(leg, new THREE.CylinderGeometry(0.045, 0.04, 0.38 * height, 10), cloth.dark, 0, -0.19 * height, 0);
        part(leg, new THREE.SphereGeometry(0.052, 9, 7), cloth.leather, 0, -0.36 * height, 0.035)
            .scale.set(1.25, 0.48, 1.65);
        part(leg, new THREE.SphereGeometry(0.047, 8, 6), cloth.steel, 0, -0.1 * height, 0.015)
            .scale.set(1.05, 0.68, 0.8);
        legs.push(leg);
    }
    part(g, new THREE.CylinderGeometry(0.14, 0.17, 0.42 * height, 14), cloth.main, 0, 0.6 * height, 0);
    part(g, new THREE.SphereGeometry(0.11, 12, 10), mat(SKIN, 0, 0.62, 'skin'), 0, 0.92 * height, 0);
    addBelt(g, cloth.leather, cloth.trim, 0.48 * height);

    if (type === 'p' || type === 'n' || type === 'k') {
        addCuirass(g, cloth.steel, cloth.trim);
        addSkirt(g, cloth.dark, cloth.trim, false);
    } else {
        addSkirt(g, cloth.main, cloth.trim, true);
        const collar = part(g, new THREE.TorusGeometry(0.105, 0.018, 6, 16), cloth.trim, 0, 0.79, 0);
        collar.rotation.x = Math.PI / 2;
    }
    fighterFace(g, 0.92 * height, faceStyle);
    return legs;
}

function addShield(arm, heraldry, steel, gold) {
    const shield = part(arm, new THREE.CylinderGeometry(0.135, 0.12, 0.035, 12), heraldry, 0, -0.1, 0.1);
    shield.rotation.x = Math.PI / 2;
    const rim = part(arm, new THREE.TorusGeometry(0.125, 0.009, 5, 16), gold, 0, -0.1, 0.123);
    part(arm, new THREE.SphereGeometry(0.025, 8, 6), steel, 0, -0.1, 0.139);
    part(arm, new THREE.BoxGeometry(0.024, 0.11, 0.008), gold, 0, -0.1, 0.14);
    part(arm, new THREE.BoxGeometry(0.08, 0.022, 0.008), gold, 0, -0.1, 0.14);
    rim.rotation.z = 0;
}

function makeArchedWindow(width, height) {
    const shape = new THREE.Shape();
    shape.moveTo(-width / 2, 0);
    shape.lineTo(-width / 2, height * 0.68);
    shape.quadraticCurveTo(-width / 2, height, 0, height);
    shape.quadraticCurveTo(width / 2, height, width / 2, height * 0.68);
    shape.lineTo(width / 2, 0);
    shape.closePath();
    return new THREE.ShapeGeometry(shape, 10);
}

const rookWindowFrameGeometry = makeArchedWindow(0.145, 0.24);
const rookWindowPaneGeometry = makeArchedWindow(0.092, 0.184);
const rookWindowFrameMaterials = [
    new THREE.MeshBasicMaterial({ color: 0xe1ddd3, side: THREE.DoubleSide }),
    new THREE.MeshBasicMaterial({ color: 0x44464c, side: THREE.DoubleSide }),
];
const rookWindowPaneMaterial = new THREE.MeshBasicMaterial({ color: 0xe9a94f, side: THREE.DoubleSide });
const rookWindowMullionMaterial = new THREE.MeshBasicMaterial({ color: 0x332316, side: THREE.DoubleSide });
const rookWindowBarGeometry = new THREE.BoxGeometry(0.008, 0.17, 0.009);
const rookWindowCrossbarGeometry = new THREE.BoxGeometry(0.078, 0.008, 0.009);

function addCastleWindows(parent, white) {
    const frames = rookWindowFrameMaterials[white ? 0 : 1];
    for (let faceIndex = 0; faceIndex < 4; faceIndex++) {
        const face = new THREE.Group();
        face.rotation.y = faceIndex * Math.PI / 2;
        for (const offset of [-0.105, 0.105]) {
            const frame = new THREE.Mesh(rookWindowFrameGeometry, frames);
            frame.position.set(offset, 0.41, 0.392);
            const pane = new THREE.Mesh(rookWindowPaneGeometry, rookWindowPaneMaterial);
            pane.position.set(offset, 0.438, 0.399);
            const mullion = new THREE.Mesh(rookWindowBarGeometry, rookWindowMullionMaterial);
            mullion.position.set(offset, 0.526, 0.405);
            const crossbar = new THREE.Mesh(rookWindowCrossbarGeometry, rookWindowMullionMaterial);
            crossbar.position.set(offset, 0.49, 0.405);
            face.add(frame, pane, mullion, crossbar);
        }
        parent.add(face);
    }
}

export function buildPiece(type, color) {
    const white = color === 'w';
    const cloth = {
        main: mat(white ? 0xfaf8f1 : 0x60471f, 0.02, 0.87, 'cloth'),
        dark: mat(white ? 0xe7e4dc : 0x17191d, 0.03, 0.9, 'cloth'),
        accent: mat(white ? 0xfffdf6 : 0x735315, 0.04, 0.82, 'cloth'),
        cape: white ? 0xfffcf4 : 0x51401f,
        leather: mat(white ? 0x896746 : 0x241a14, 0.02, 0.8, 'leather'),
        steel: mat(white ? 0xe1e5e8 : 0x272b32, 0.38, 0.48, 'steel'),
        trim: mat(white ? 0xe7e9e8 : 0x997532, 0.48, 0.42, white ? 'steel' : 'gold'),
    };
    const steel = mat(white ? 0xe1e5e8 : 0x272b32, 0.38, 0.48, 'steel');
    const gold = cloth.trim;
    const g = new THREE.Group();
    const contactShadow = new THREE.Mesh(contactShadowGeometry, contactShadowMaterial);
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.y = 0.008;
    contactShadow.scale.setScalar(type === 'n' ? 0.98 : type === 'r' ? 0.82 : 0.72);
    contactShadow.castShadow = false;
    contactShadow.receiveShadow = false;
    contactShadow.raycast = () => {};
    const rig = { root: g, contactShadow, legs: [], weapon: null, shield: null, horse: null, type };

    if (type === 'r') {
        // A compact, carved stone keep with a timber portcullis and crenellated parapet.
        const stone = mat(white ? 0xf4f2ec : 0x292a2d, 0.03, 0.88, 'stone');
        const mortar = mat(white ? 0xe5e2da : 0x19191b, 0, 0.96, 'stone');
        const muscle = mat(SKIN, 0, 0.72, 'skin');
        const base = part(g, new THREE.CylinderGeometry(0.3, 0.32, 0.12, 12), stone, 0, 0.12, 0);
        const baseRim = part(g, new THREE.TorusGeometry(0.27, 0.016, 6, 20), gold, 0, 0.2, 0);
        baseRim.rotation.x = Math.PI / 2;
        const tower = part(g, new THREE.CylinderGeometry(0.24, 0.28, 0.62, 12), stone, 0, 0.61, 0);
        for (const y of [-0.18, 0.02, 0.22]) {
            const course = part(tower, new THREE.TorusGeometry(0.245, 0.009, 5, 18), mortar, 0, y, 0);
            course.rotation.x = Math.PI / 2;
        }
        for (let i = 0; i < 8; i++) {
            const a = (i / 8) * Math.PI * 2;
            const merlon = part(tower, new THREE.BoxGeometry(0.085, 0.13, 0.09), stone,
                Math.cos(a) * 0.215, 0.36, Math.sin(a) * 0.215);
            merlon.rotation.y = -a;
        }
        part(g, new THREE.BoxGeometry(0.115, 0.2, 0.024), mat(0x342217, 0.04, 0.9, 'wood'), 0, 0.49, 0.266);
        for (const x of [-0.028, 0, 0.028]) {
            part(g, new THREE.BoxGeometry(0.007, 0.18, 0.008), cloth.leather, x, 0.49, 0.281);
        }
        part(g, new THREE.BoxGeometry(0.012, 0.14, 0.02), mortar, 0, 0.79, 0.248);
        for (const side of [-1, 1]) {
            const leg = armGroup(g, side * 0.13, 0.35);
            part(leg, new THREE.SphereGeometry(0.09, 9, 8), muscle, 0, -0.08, 0).scale.set(1, 1.5, 1);
            part(leg, new THREE.BoxGeometry(0.14, 0.06, 0.22), cloth.steel, 0, -0.32, 0.04);
            rig.legs.push(leg);
        }
        const arm = armGroup(g, 0.3, 0.8);
        part(arm, new THREE.SphereGeometry(0.08, 9, 8), muscle, 0, -0.15, 0).scale.set(1, 2, 1);
        part(arm, new THREE.BoxGeometry(0.16, 0.16, 0.16), stone, 0, -0.35, 0);
        part(arm, new THREE.CylinderGeometry(0.02, 0.02, 0.28, 8), cloth.leather, 0, -0.42, 0.1).rotation.x = Math.PI / 2;
        part(arm, new THREE.SphereGeometry(0.075, 8, 6), steel, 0, -0.42, 0.26);
        const shieldArm = armGroup(g, -0.3, 0.8);
        part(shieldArm, new THREE.SphereGeometry(0.08, 9, 8), muscle, 0, -0.15, 0).scale.set(1, 2, 1);
        part(shieldArm, new THREE.BoxGeometry(0.16, 0.16, 0.16), stone, 0, -0.35, 0);
        const towerShield = part(shieldArm, new THREE.BoxGeometry(0.2, 0.26, 0.045), cloth.accent, 0, -0.42, 0.11);
        towerShield.rotation.z = 0.05;
        rig.weapon = arm;
        rig.shield = shieldArm;
                modelLoads[type].then(gltf => installTexturedModel(rig, color, gltf));
        return rig;
    }

    let rider = g;
    if (type === 'n') {
        // Sculpted fallback destrier: fuller body, articulated limbs, expressive head,
        // and properly fitted tack remain convincing even if the knight GLB is unavailable.
        const horseMat = mat(white ? 0x855238 : 0x514c50, 0.02, 0.82, 'leather');
        const horseHighlight = mat(white ? 0x9b6545 : 0x625c60, 0.02, 0.8, 'leather');
        const horseFaceShade = mat(white ? 0x5c3929 : 0x332e32, 0.02, 0.72, 'skin');
        const maneMat = mat(white ? 0x35231c : 0x201e22, 0.02, 0.84, 'leather');
        const hoofMat = mat(white ? 0x38281f : 0x242126, 0.03, 0.76, 'leather');
        const horseEye = mat(0xe9d8bd, 0.02, 0.4, 'skin');
        const bridle = mat(white ? 0x321e15 : 0x211b1d, 0.08, 0.7, 'leather');
        const horse = new THREE.Group();
        g.add(horse);

        const barrel = part(horse, new THREE.SphereGeometry(0.17, 16, 12), horseMat, 0, 0.46, -0.015);
        barrel.scale.set(0.95, 0.88, 1.48);
        const hindquarter = part(horse, new THREE.SphereGeometry(0.145, 14, 11), horseHighlight, 0, 0.46, -0.2);
        hindquarter.scale.set(1.04, 1.04, 1.12);
        const shoulder = part(horse, new THREE.SphereGeometry(0.135, 14, 11), horseMat, 0, 0.47, 0.17);
        shoulder.scale.set(1.02, 1.14, 1.08);
        const chest = part(horse, new THREE.SphereGeometry(0.12, 12, 10), horseHighlight, 0, 0.37, 0.19);
        chest.scale.set(1.02, 1.2, 0.94);
        const neck = part(horse, new THREE.CapsuleGeometry(0.078, 0.27, 5, 10), horseMat, 0, 0.625, 0.225);
        neck.rotation.x = 0.44;
        const head = part(horse, new THREE.SphereGeometry(0.078, 14, 11), horseMat, 0, 0.755, 0.36);
        head.scale.set(0.92, 1.05, 1.32);
        const muzzle = part(horse, new THREE.SphereGeometry(0.055, 12, 9), horseHighlight, 0, 0.704, 0.465);
        muzzle.scale.set(0.88, 0.76, 1.22);
        part(horse, new THREE.SphereGeometry(0.044, 10, 8), horseFaceShade, 0, 0.665, 0.438)
            .scale.set(0.95, 0.7, 0.8);

        for (const side of [-1, 1]) {
            const ear = part(horse, new THREE.ConeGeometry(0.025, 0.13, 7), horseMat,
                side * 0.043, 0.862, 0.309);
            ear.rotation.z = -side * 0.18;
            const eye = part(horse, new THREE.SphereGeometry(0.018, 10, 8), horseEye,
                side * 0.069, 0.78, 0.398);
            eye.scale.set(1, 0.82, 0.65);
            part(horse, new THREE.SphereGeometry(0.009, 8, 6), hoofMat,
                side * 0.07, 0.779, 0.411);
            part(horse, new THREE.SphereGeometry(0.009, 7, 6), hoofMat,
                side * 0.031, 0.709, 0.514).scale.set(0.8, 0.65, 0.6);
            line(horse, [[side * 0.055, 0.814, 0.375], [side * 0.076, 0.747, 0.434], [side * 0.046, 0.679, 0.478]], bridle, 0.008);
            line(horse, [[side * 0.075, 0.744, 0.435], [side * 0.01, 0.729, 0.49], [-side * 0.075, 0.744, 0.435]], bridle, 0.006);
            line(horse, [[side * 0.062, 0.754, 0.43], [side * 0.085, 0.65, 0.29], [side * 0.12, 0.595, 0.06]], bridle, 0.006);
        }
        line(horse, [[-0.065, 0.812, 0.378], [0, 0.83, 0.39], [0.065, 0.812, 0.378]], bridle, 0.007);
        line(horse, [[-0.06, 0.58, 0.25], [-0.083, 0.68, 0.2], [-0.07, 0.79, 0.285]], maneMat, 0.018);
        line(horse, [[0.06, 0.58, 0.25], [0.083, 0.68, 0.2], [0.07, 0.79, 0.285]], maneMat, 0.018);
        for (let i = 0; i < 5; i++) {
            const tuft = part(horse, new THREE.ConeGeometry(0.023, 0.1, 6), maneMat,
                0, 0.798 - i * 0.046, 0.29 - i * 0.033);
            tuft.rotation.x = -0.6;
        }
        line(horse, [[0, 0.51, -0.25], [0.012, 0.43, -0.34], [0.014, 0.31, -0.39]], maneMat, 0.025);
        const tailTassel = part(horse, new THREE.ConeGeometry(0.039, 0.14, 7), maneMat, 0.014, 0.29, -0.39);
        tailTassel.rotation.x = -0.16;

        // A shaped saddle, under-pad, girth and embroidered hanging cloth.
        const saddlePad = part(horse, new THREE.SphereGeometry(0.145, 12, 9), cloth.accent, 0, 0.589, -0.005);
        saddlePad.scale.set(1.02, 0.26, 1.34);
        const saddle = part(horse, new THREE.SphereGeometry(0.105, 12, 9), cloth.leather, 0, 0.625, -0.005);
        saddle.scale.set(1.1, 0.3, 1.16);
        const caparisonShape = new THREE.Shape();
        caparisonShape.moveTo(-0.18, 0.54);
        caparisonShape.quadraticCurveTo(0, 0.58, 0.18, 0.54);
        caparisonShape.lineTo(0.2, 0.24);
        caparisonShape.quadraticCurveTo(0.05, 0.2, -0.18, 0.24);
        caparisonShape.closePath();
        const caparisonMaterial = applySurfaceFinish(new THREE.MeshStandardMaterial({
            color: white ? 0xe7ddc6 : 0x947235,
            roughness: 0.88,
            side: THREE.DoubleSide,
        }), 'cloth');
        for (const side of [-1, 1]) {
            const caparison = part(horse, new THREE.ShapeGeometry(caparisonShape, 8), caparisonMaterial,
                side * 0.145, 0, 0);
            caparison.rotation.y = side * Math.PI / 2;
            part(horse, new THREE.SphereGeometry(0.022, 8, 6), gold, side * 0.158, 0.397, 0.015);
            line(horse, [[side * 0.157, 0.25, -0.17], [side * 0.157, 0.225, 0], [side * 0.157, 0.25, 0.17]], gold, 0.004);
        }
        const girth = part(horse, new THREE.TorusGeometry(0.15, 0.012, 6, 24), bridle, 0, 0.48, 0);
        girth.rotation.x = Math.PI / 2;

        for (const [lx, lz] of [[-0.095, 0.19], [0.095, 0.19], [-0.105, -0.19], [0.105, -0.19]]) {
            const leg = armGroup(horse, lx, 0.39);
            leg.position.z = lz;
            part(leg, new THREE.CapsuleGeometry(0.031, 0.14, 3, 8), horseMat, 0, -0.09, 0);
            part(leg, new THREE.SphereGeometry(0.034, 9, 7), horseHighlight, 0, -0.2, 0);
            part(leg, new THREE.CylinderGeometry(0.023, 0.027, 0.15, 9), horseMat, 0, -0.285, 0);
            part(leg, new THREE.CylinderGeometry(0.035, 0.039, 0.065, 9), hoofMat, 0, -0.38, 0.012);
            rig.legs.push(leg);
        }
        rig.horse = horse;
        rider = new THREE.Group();
        rider.position.y = 0.35;
        rider.scale.setScalar(0.75);
        g.add(rider);
    }

    const faceStyle = type === 'q' ? 'queen' : type === 'k' ? 'king' : 'warrior';
    const legs = humanoid(rider, cloth, 1, faceStyle, type);
    if (type !== 'n') rig.legs.push(...legs);
    const arm = armGroup(rider, 0.19, 0.76);
    part(arm, new THREE.CylinderGeometry(0.035, 0.035, 0.3, 10), cloth.main, 0, -0.15, 0);
    part(arm, new THREE.CylinderGeometry(0.039, 0.039, 0.075, 10), cloth.steel, 0, -0.29, 0.012);
    rig.weapon = arm;

    if (type === 'p' || type === 'n') {
        addHelmet(rider, steel, gold, type === 'n' ? cloth.accent.color.getHex() : null);
        if (type === 'n') {
            // A small lance-like sword for the mounted knight.
            sword(arm, 0.48, steel, gold);
        } else {
            part(rider, new THREE.SphereGeometry(0.125, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), steel, 0, 0.94, 0);
            part(rider, new THREE.CylinderGeometry(0.15, 0.17, 0.25, 12), cloth.steel, 0, 0.65, 0);
            sword(arm, 0.35, steel, gold);
            const shieldArm = armGroup(rider, -0.2, 0.7);
            addShield(shieldArm, cloth.accent, steel, gold);
            rig.shield = shieldArm;
        }
    }
    if (type === 'b') {
        part(rider, new THREE.CylinderGeometry(0.17, 0.26, 0.5, 14), cloth.main, 0, 0.4, 0);
        part(rider, new THREE.ConeGeometry(0.105, 0.34, 8), cloth.main, 0, 1.12, 0);
        const mitreBand = part(rider, new THREE.TorusGeometry(0.086, 0.012, 5, 14), gold, 0, 1.0, 0);
        mitreBand.rotation.x = Math.PI / 2;
        line(rider, [[0, 1.0, 0.09], [0, 1.16, 0.055], [0, 1.27, 0]], gold, 0.006);
        part(rider, new THREE.SphereGeometry(0.026, 8, 6), mat(0x8f252a, 0.28, 0.3), 0, 1.09, 0.09);
        addBishopBeard(rider);
        // A narrow embroidered stole and the bishop's crozier.
        const stole = part(rider, new THREE.BoxGeometry(0.055, 0.46, 0.014), cloth.accent, 0, 0.49, 0.142);
        stole.rotation.z = -0.08;
        line(rider, [[-0.025, 0.7, 0.153], [0.025, 0.7, 0.153]], gold, 0.004);
        part(arm, new THREE.CylinderGeometry(0.014, 0.014, 0.9, 8), gold, 0, -0.08, 0.08);
        part(arm, new THREE.TorusGeometry(0.064, 0.012, 5, 12, Math.PI * 1.5), gold, 0, 0.39, 0.08).rotation.z = -Math.PI / 2;
        part(arm, new THREE.SphereGeometry(0.023, 8, 6), mat(0x8f252a, 0.28, 0.3), 0, 0.39, 0.08);
        part(arm, new THREE.BoxGeometry(0.1, 0.018, 0.018), gold, 0, 0.22, 0.08);
    }
    if (type === 'q') {
        addQueenDress(rider, color);
        part(rider, new THREE.SphereGeometry(0.115, 10, 8), mat(0x6a422d, 0, 0.8), 0, 0.95, -0.035);
        for (const side of [-1, 1]) {
            part(rider, new THREE.SphereGeometry(0.046, 9, 7), mat(0x6a422d, 0, 0.8), side * 0.09, 0.91, -0.005)
                .scale.set(0.7, 1.5, 0.8);
        }
        crown(rider, 1.04, gold, 0x34735d);
        addQueenBow(arm, white, steel);
    }
    if (type === 'k') {
        part(rider, new THREE.CylinderGeometry(0.2, 0.24, 0.35, 14), cloth.accent, 0, 0.55, -0.02);
        crown(rider, 1.04, gold, 0x2f6480);
        // Small cross finial and gilded clasps distinguish the sovereign's crown and mantle.
        part(rider, new THREE.BoxGeometry(0.025, 0.1, 0.025), gold, 0, 1.17, 0);
        part(rider, new THREE.BoxGeometry(0.09, 0.022, 0.025), gold, 0, 1.19, 0);
        part(rider, new THREE.SphereGeometry(0.019, 8, 6), mat(0x2f6480, 0.3, 0.24), 0, 0.83, -0.11);
        sword(arm, 0.45, steel, gold);
    }
        modelLoads[type].then(gltf => installTexturedModel(rig, color, gltf));
    return rig;
}

// Short, staged capture poses read clearly at the board camera's mobile scale.
export function animateRig(rig, time, mode, phase = 0) {
    const progress = THREE.MathUtils.clamp(phase, 0, 1);
    const smooth = (from, to, value) => {
        const t = THREE.MathUtils.clamp((value - from) / (to - from), 0, 1);
        return t * t * (3 - 2 * t);
    };
    const strike = Math.sin(Math.PI * THREE.MathUtils.clamp((progress - 0.18) / 0.62, 0, 1));
    const windup = 1 - smooth(0.02, 0.34, progress);
    const guard = smooth(0.02, 0.22, progress) * (1 - smooth(0.72, 0.96, progress));
    const gaitRate = rig.type === 'n' ? 16 : 12;
    const gaitPhase = time * gaitRate;
    const horseGallop = mode === 'fight' && rig.type === 'n' ? Math.sin(progress * Math.PI * 4) * 0.9 : 0;
    const swing = mode === 'walk' ? Math.sin(gaitPhase) * 0.72 : horseGallop;

    if (rig.modelAnimation) {
        const animation = rig.modelAnimation;
        let choices;
        if (mode === 'walk') {
            choices = ['Walk', 'Walk_Formal_Loop', 'Walk_Carry_Loop', 'Run', 'Sprint_Loop', 'Idle'];
        } else if (mode === 'fight' && rig.fightRole === 'defender') {
            choices = ['Sword_Block', 'Idle_Shield_Loop', 'Hit_Chest', 'Hit_Head', 'Idle'];
        } else if (mode === 'fight' && rig.type === 'q') {
            choices = progress < 0.48
                ? ['Pistol_Aim_Neutral', 'Idle']
                : ['Pistol_Shoot', 'Pistol_Aim_Neutral', 'Idle'];
        } else if (mode === 'fight' && rig.type === 'p') {
            choices = ['Sword_Regular_Combo', 'Sword_Regular_A', 'Sword_Regular_C', 'Sword_Attack', 'Sword_Heavy_Combo', 'Idle'];
        } else if (mode === 'fight' && rig.type === 'k') {
            choices = ['Sword_Heavy_Combo', 'Sword_Attack', 'Sword_Regular_C', 'Idle'];
        } else if (mode === 'fight') {
            choices = ['Sword_Regular_C', 'Sword_Attack', 'Sword_Regular_A', 'Sword_Heavy_Combo', 'Idle'];
        } else {
            // Favor guarded or weapon-ready idles over a relaxed standing pose.
            choices = ['Sword_Idle', 'Idle_Shield_Loop', 'Idle_Torch_Loop', 'Idle'];
        }
        const nextName = choices.find(name => animation.actions.has(name));
        if (nextName && nextName !== animation.activeName) {
            const next = animation.actions.get(nextName);
            const previous = animation.actions.get(animation.activeName);
            const oneShot = mode === 'fight' && rig.fightRole !== 'defender'
                && !['Idle', 'Sword_Idle', 'Idle_Shield_Loop'].includes(nextName);
            next.reset();
            next.setLoop(oneShot ? THREE.LoopOnce : THREE.LoopRepeat, oneShot ? 1 : Infinity);
            next.clampWhenFinished = oneShot;
            next.play();
            if (previous) previous.crossFadeTo(next, 0.12, true);
            animation.activeName = nextName;
        }
        const elapsed = animation.lastTime === null ? 0 : THREE.MathUtils.clamp(time - animation.lastTime, 0, 0.08);
        animation.mixer.update(elapsed);
        animation.lastTime = time;
    }

    rig.legs.forEach((leg, i) => {
        if (rig.type === 'n' && rig.horse) {
            // The mount moves in diagonal trot pairs instead of a human walk.
            leg.rotation.x = i === 0 || i === 3 ? swing : -swing;
        } else {
            leg.rotation.x = i % 2 ? swing : -swing;
        }
    });

    const gait = Math.sin(gaitPhase);
    if (rig.horse) {
        const trot = mode === 'walk' ? Math.abs(Math.sin(gaitPhase * 2)) : mode === 'fight' ? Math.abs(Math.sin(progress * Math.PI * 8)) : 0;
        rig.horse.position.y = trot * 0.028;
        rig.horse.rotation.x = mode === 'fight' ? Math.sin(progress * Math.PI * 4) * 0.065 : mode === 'walk' ? gait * 0.028 : 0;
        rig.horse.rotation.z = mode === 'walk' ? Math.sin(gaitPhase + Math.PI / 2) * 0.018 : 0;
    }

    if (rig.modelMotion) {
        const motion = rig.modelMotion;
        if (mode === 'walk') {
            motion.rotation.x = rig.type === 'n' ? 0.025 + Math.sin(gaitPhase * 2) * 0.035 : -0.025 + Math.sin(gaitPhase * 2) * 0.012;
            motion.rotation.z = Math.sin(gaitPhase) * (rig.type === 'n' ? 0.02 : 0.012);
        } else if (mode === 'fight') {
            motion.rotation.x = rig.fightRole === 'attacker' ? -0.045 + strike * 0.025 : 0.02 + guard * 0.012;
            motion.rotation.z = Math.sin(progress * Math.PI) * (rig.fightRole === 'attacker' ? -0.016 : 0.018);
        } else if (mode !== 'fall') {
            motion.rotation.x = -0.018 + Math.sin(time * 1.8) * 0.008;
            motion.rotation.z = Math.sin(time * 1.35) * 0.01;
        }
    }

    if (mode === 'fight') {
        const baseFacing = rig.fightFacingY ?? rig.root.rotation.y;
        if (rig.fightRole === 'defender') {
            if (rig.weapon) rig.weapon.rotation.set(-0.42 + guard * 0.12, 0, 0);
            if (rig.shield) rig.shield.rotation.x = -0.9 - guard * 0.25;
            rig.root.rotation.x = 0.025 + guard * 0.035;
            rig.root.rotation.z = Math.sin(progress * Math.PI) * 0.018;
        } else {
            if (rig.attackPose) {
                rig.attackPose.visible = true;
                if (rig.type === 'q') {
                    rig.attackPose.rotation.set((rig.fightAimX ?? 0) - windup * 0.62, -windup * 0.12 + strike * 0.08, 0.025 + windup * 0.08 - strike * 0.04);
                } else if (rig.type === 'n') {
                    rig.attackPose.rotation.set(-0.24 - windup * 0.82 + strike * 1.08, -0.12 - windup * 0.82 + strike * 1.55, 0.06 + windup * 0.24 - strike * 0.42);
                }
            }
            if (rig.weapon) {
                rig.weapon.rotation.y = 0;
                switch (rig.type) {
                    case 'n':
                        rig.weapon.rotation.x = -0.78 - windup * 0.62 + strike * 1.12;
                        rig.weapon.rotation.y = -0.12 - windup * 0.72 + strike * 1.3;
                        break;
                    case 'b':
                        rig.weapon.rotation.x = -0.05 + strike * 0.58;
                        rig.weapon.rotation.z = 0.08 + strike * 0.72;
                        break;
                    case 'q':
                        rig.weapon.rotation.x = (rig.fightAimX ?? 0) - windup * 0.56;
                        break;
                    case 'k':
                        rig.weapon.rotation.x = -0.4 - windup * 0.74 + strike * 1.2;
                        break;
                    case 'p':
                        rig.weapon.rotation.x = -0.12 - windup * 0.42 + strike * 0.74;
                        break;
                    default:
                        rig.weapon.rotation.x = 0;
                }
            }
            if (rig.shield) {
                rig.shield.rotation.x = rig.type === 'k'
                    ? -0.9 - windup * 0.2 + strike * 0.12
                    : -0.82 - windup * 0.24 + strike * 0.14;
            }
            rig.root.rotation.y = baseFacing + (rig.type === 'b' ? strike * 0.16 : 0);
            rig.root.rotation.x = rig.type === 'r'
                ? -0.025 - strike * 0.12
                : rig.type === 'k' ? -0.025 - strike * 0.08 : -strike * 0.045;
            rig.root.rotation.z = rig.type === 'b' ? -strike * 0.045 : Math.sin(progress * Math.PI) * 0.018;
        }
    } else if (mode !== 'fall') {
        if (rig.attackPose) rig.attackPose.visible = false;
        if (rig.weapon) {
            rig.weapon.rotation.x = rig.type === 'n'
                ? -0.78 + Math.sin(time * 1.7) * 0.035 + swing * 0.12
                : Math.sin(time * 2) * 0.08 + (mode === 'walk' ? swing * 0.5 : 0);
            rig.weapon.rotation.y = 0;
            rig.weapon.rotation.z = 0;
        }
        if (rig.shield) rig.shield.rotation.x = mode === 'walk' ? -swing * 0.5 : 0;
        rig.root.rotation.x = 0;
        rig.root.rotation.z = 0;
    }
    if (mode !== 'fall') {
        const verticalMotion = mode === 'walk'
            ? (rig.type === 'n' ? 0.018 + Math.abs(Math.sin(gaitPhase * 2)) * 0.034 : Math.abs(Math.sin(gaitPhase * 2)) * 0.014)
            : mode === 'fight'
                ? (rig.type === 'n' ? Math.abs(Math.sin(progress * Math.PI * 8)) * 0.018 : strike * 0.006)
                : 0.008 + Math.abs(Math.sin(time * 2)) * 0.006;
        rig.root.position.y = rig.baseY + verticalMotion;
    }
}
