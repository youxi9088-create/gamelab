const EMPTY = new Set();
function isTexture(value) {
    return (typeof value === 'object' &&
        value !== null &&
        value.isTexture === true);
}
function disposeMaterial(material, skip, seen) {
    if (skip.has(material) || seen.has(material))
        return;
    seen.add(material);
    // Enumerate rather than list the slots: three has ~20 map properties and
    // MeshPhysicalMaterial keeps adding them, so a hardcoded list is a slow leak
    // waiting for the next release.
    for (const value of Object.values(material)) {
        if (!isTexture(value) || skip.has(value) || seen.has(value))
            continue;
        seen.add(value);
        value.dispose();
    }
    material.dispose();
}
function disposeGeometry(geometry, skip, seen) {
    if (skip.has(geometry) || seen.has(geometry))
        return;
    seen.add(geometry);
    geometry.dispose();
}
/**
 * Recursively disposes every geometry, material and texture under `object`.
 *
 * Shared resources are visited once, and anything in `skip` (pass
 * `assets.owned`) is left alone — cached assets live for the whole session and
 * disposing one would blank every other object that clones it.
 */
export function disposeObject(object, options = {}) {
    const skip = options.skip ?? EMPTY;
    const seen = new Set();
    object.traverse((node) => {
        const renderable = node;
        if (renderable.geometry)
            disposeGeometry(renderable.geometry, skip, seen);
        const material = renderable.material;
        if (!material)
            return;
        if (Array.isArray(material)) {
            for (const entry of material)
                disposeMaterial(entry, skip, seen);
        }
        else {
            disposeMaterial(material, skip, seen);
        }
    });
}
/** Detach from the scene graph and dispose. The normal way to remove a thing. */
export function destroy(object, options = {}) {
    object.removeFromParent();
    disposeObject(object, options);
}
/**
 * A bag of things to free together.
 *
 * `game.transient` is a scope cleared on every `restart()`, which is why a game
 * only has to remember rule 8 — register what you create after setup — instead
 * of tracking individual resources.
 */
export class DisposalScope {
    items = [];
    skip = EMPTY;
    /** @param skip resources this scope must never dispose (`assets.owned`). */
    constructor(skip) {
        if (skip)
            this.skip = skip;
    }
    add(item) {
        this.items.push(item);
        return item;
    }
    /** Removes without disposing — for an object that was handed off elsewhere. */
    forget(item) {
        const index = this.items.indexOf(item);
        if (index >= 0)
            this.items.splice(index, 1);
    }
    get size() {
        return this.items.length;
    }
    dispose() {
        // Reverse order so a child registered after its parent is freed first.
        for (let i = this.items.length - 1; i >= 0; i--) {
            const item = this.items[i];
            if (this.skip.has(item))
                continue;
            if (isObject3D(item))
                destroy(item, { skip: this.skip });
            else if (isDisposable(item))
                item.dispose();
        }
        this.items.length = 0;
    }
}
function isObject3D(value) {
    return (typeof value === 'object' &&
        value !== null &&
        value.isObject3D === true);
}
function isDisposable(value) {
    return typeof value?.dispose === 'function';
}
