/** Export a top-level registration; call asset.create() wherever the game needs it. */
export function defineAsset(definition) {
    return Object.freeze({ ...definition });
}
