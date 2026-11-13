import { disposeObject } from '../db685f09d64f5de6/dispose.js';
/**
 * Fixed-capacity object pool.
 *
 * Allocating a mesh mid-game is not the cost — the GC pause when a hundred of
 * them die at once is, and on a phone that pause is a visible hitch. A pool
 * built during `setup` means gameplay never allocates.
 *
 * The capacity is hard on purpose: `acquire()` returning null tells you the
 * budget was wrong, where silent growth would just get slower.
 */
export class Pool {
    items = [];
    idle = [];
    live = [];
    capacity;
    parent;
    reset;
    constructor(factory, options = {}) {
        this.capacity = Math.max(options.size ?? 32, 0);
        this.parent = options.parent;
        this.reset = options.reset;
        for (let i = 0; i < this.capacity; i++) {
            const item = factory();
            item.visible = false;
            this.items.push(item);
            this.idle.push(item);
        }
    }
    get active() {
        return this.live;
    }
    get free() {
        return this.idle.length;
    }
    acquire() {
        const item = this.idle.pop();
        if (!item)
            return null;
        item.visible = true;
        this.live.push(item);
        if (this.parent && item.parent !== this.parent)
            this.parent.add(item);
        return item;
    }
    release(item) {
        const index = this.live.indexOf(item);
        if (index < 0)
            return;
        this.live.splice(index, 1);
        item.visible = false;
        this.reset?.(item);
        this.idle.push(item);
    }
    releaseAll() {
        // Iterate a copy: `release` splices the live list.
        for (const item of [...this.live])
            this.release(item);
    }
    /** Frees every item's GPU resources. The pool is unusable afterwards. */
    dispose() {
        this.releaseAll();
        for (const item of this.items) {
            item.removeFromParent();
            disposeObject(item);
        }
        this.items.length = 0;
        this.idle.length = 0;
    }
}
