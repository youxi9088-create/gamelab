import { Cache, LoaderUtils } from '../43b35e11ca3eada7/three.module.min.js';
// Match FileLoader's URL deduplication without retaining bodies when Three's cache is off.
const pending = new Map();
function modelBody(loader, url) {
    const manager = loader.manager;
    const key = `file:${url}`;
    const cached = Cache.get(key);
    if (cached !== undefined) {
        manager.itemStart(url);
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(cached);
                manager.itemEnd(url);
            }, 0);
        });
    }
    const existing = pending.get(url);
    if (existing)
        return existing;
    manager.itemStart(url);
    const request = fetch(url, {
        headers: loader.requestHeader,
        credentials: loader.withCredentials ? 'include' : 'same-origin',
        signal: manager.abortController.signal,
    })
        .then(async (response) => {
        if (response.status !== 200 && response.status !== 0) {
            throw Object.assign(new Error(`fetch for "${response.url}" responded with ${response.status}: ${response.statusText}`), { response });
        }
        // Consume the native body directly. FileLoader's replacement progress stream can
        // report ERR_ABORTED after a complete GLB during immediate, heavy browser setup.
        const data = await response.arrayBuffer();
        Cache.add(key, data);
        return data;
    })
        .catch((error) => {
        manager.itemError(url);
        throw error;
    })
        .finally(() => {
        pending.delete(url);
        manager.itemEnd(url);
    });
    pending.set(url, request);
    return request;
}
/** Keep the model item active until its relative buffers/textures have also parsed. */
export async function loadModel(loader, url) {
    const manager = loader.manager;
    const base = LoaderUtils.extractUrlBase(url);
    const resourcePath = loader.resourcePath || (loader.path ? LoaderUtils.resolveURL(base, loader.path) : base);
    const requestURL = manager.resolveURL(loader.path + url);
    manager.itemStart(url);
    try {
        return await loader.parseAsync(await modelBody(loader, requestURL), resourcePath);
    }
    catch (error) {
        manager.itemError(url);
        throw error;
    }
    finally {
        manager.itemEnd(url);
    }
}
