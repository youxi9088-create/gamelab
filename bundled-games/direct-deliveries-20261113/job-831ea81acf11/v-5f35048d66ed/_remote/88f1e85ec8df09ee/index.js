import { HUD_CSS } from '../ed82df204f31379d/styles.js';
const STYLE_ID = 'rx-hud-style';
/** Marks a node as belonging to the current run rather than to `setup`. */
const RUN_ATTRIBUTE = 'data-rx-run';
export function createHud(container, viewport) {
    if (!document.getElementById(STYLE_ID)) {
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = HUD_CSS;
        document.head.append(style);
    }
    const root = document.createElement('div');
    root.className = 'rx-hud';
    container.append(root);
    const layers = new Map();
    let sealed = false;
    /**
     * Ownership is an attribute on the node, not a list held here. A game removes
     * HUD elements by hand (`banner.dismiss()`, `el.remove()`), and a list would
     * keep every one of those detached nodes alive until the next restart.
     */
    function own(el) {
        if (sealed)
            el.setAttribute(RUN_ATTRIBUTE, '');
        return el;
    }
    function sync() {
        const { safeArea, hudScale } = viewport;
        root.style.setProperty('--rx-safe-top', `${safeArea.top}px`);
        root.style.setProperty('--rx-safe-right', `${safeArea.right}px`);
        root.style.setProperty('--rx-safe-bottom', `${safeArea.bottom}px`);
        root.style.setProperty('--rx-safe-left', `${safeArea.left}px`);
        // The HUD scales with the rendered design box, so a 900px-wide desktop
        // window and a 393px phone show the same layout at proportional size.
        root.style.setProperty('--rx-hud-scale', hudScale.toFixed(4));
    }
    sync();
    const offResize = viewport.on('resize', sync);
    function layerFor(anchor, options = {}) {
        const existing = layers.get(anchor);
        if (existing) {
            if (options.interactive)
                existing.dataset.interactive = 'true';
            return existing;
        }
        const layer = own(document.createElement('div'));
        layer.className = 'rx-hud-layer';
        layer.dataset.anchor = anchor;
        layer.style.gridArea = anchor;
        if (options.interactive)
            layer.dataset.interactive = 'true';
        root.append(layer);
        layers.set(anchor, layer);
        return layer;
    }
    return {
        root,
        layer: layerFor,
        score(options = {}) {
            const format = options.format ?? ((value) => String(Math.floor(value)));
            const el = own(document.createElement('div'));
            el.className = 'rx-hud-score';
            el.textContent = format(0);
            layerFor(options.anchor ?? 'top').append(el);
            return {
                el,
                set(value) {
                    const next = format(value);
                    // Guard the write: assigning identical text still invalidates layout,
                    // and this runs every frame in most games.
                    if (el.textContent !== next)
                        el.textContent = next;
                },
            };
        },
        chip(text, options = {}) {
            const el = own(document.createElement('div'));
            el.className = 'rx-hud-chip';
            el.textContent = text;
            layerFor(options.anchor ?? 'top-left').append(el);
            return {
                el,
                set(next) {
                    if (el.textContent !== next)
                        el.textContent = next;
                },
            };
        },
        button(label, onTap, options = {}) {
            const el = own(document.createElement('button'));
            el.type = 'button';
            el.className = 'rx-hud-button';
            el.dataset.variant = options.variant ?? 'default';
            el.textContent = label;
            // pointerup, not click: a click fires ~300ms later on some mobile
            // WebViews and after the game has already moved on.
            el.addEventListener('pointerup', (event) => {
                event.preventDefault();
                event.stopPropagation();
                onTap();
            });
            layerFor(options.anchor ?? 'bottom', { interactive: true }).append(el);
            return el;
        },
        banner(title, subtitle) {
            const el = own(document.createElement('div'));
            el.className = 'rx-hud-banner';
            const titleEl = document.createElement('div');
            titleEl.className = 'rx-hud-banner-title';
            titleEl.textContent = title;
            el.append(titleEl);
            if (subtitle) {
                const subtitleEl = document.createElement('div');
                subtitleEl.className = 'rx-hud-banner-subtitle';
                subtitleEl.textContent = subtitle;
                el.append(subtitleEl);
            }
            root.append(el);
            return { el, dismiss: () => el.remove() };
        },
        sealSetup() {
            sealed = true;
        },
        resetRun() {
            for (const el of Array.from(root.querySelectorAll(`[${RUN_ATTRIBUTE}]`)))
                el.remove();
            for (const [anchor, layer] of layers) {
                if (layer.hasAttribute(RUN_ATTRIBUTE))
                    layers.delete(anchor);
            }
        },
        clear() {
            root.replaceChildren();
            layers.clear();
        },
        dispose() {
            offResize();
            root.remove();
            layers.clear();
        },
    };
}
