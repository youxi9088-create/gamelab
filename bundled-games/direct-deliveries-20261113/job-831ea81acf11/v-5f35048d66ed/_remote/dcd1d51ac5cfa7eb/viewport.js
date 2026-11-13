import { Vector2 } from '../43b35e11ca3eada7/three.module.min.js';
import { ZERO_SAFE_AREA_INSET } from '../83ae9c063e3b7483/sdk-contract.js';
export const DEFAULT_DESIGN = { width: 720, height: 1080 };
/** The landscape design box for desktop-target games. Pair with `landscapeRig()`. */
export const LANDSCAPE_DESIGN = { width: 1280, height: 720 };
/**
 * The reference density: the design box rendered on a 393 CSS-px-wide phone.
 * The HUD scales against this so 16px reads as 16px on the target device and
 * grows proportionally on a wider window.
 */
const REFERENCE_PX_PER_UNIT = 393 / 720;
/**
 * Pure: how far the frustum has to open to satisfy `mode` at `aspect`.
 * Exactly one axis is unscaled; the other absorbs the mismatch.
 */
export function fitFrustum(design, aspect, mode) {
    const designAspect = design.width / design.height;
    const wider = aspect > designAspect;
    // `crop` shrinks the visible region inside the design box instead of growing
    // past it: nothing bleeds, but the edges of the box are cut off.
    const scaleX = mode === 'crop' ? (wider ? 1 : aspect / designAspect) : wider ? aspect / designAspect : 1;
    const scaleY = mode === 'crop' ? (wider ? designAspect / aspect : 1) : wider ? 1 : designAspect / aspect;
    return {
        scaleX,
        scaleY,
        overscanX: (design.width * scaleX - design.width) / 2,
        overscanY: (design.height * scaleY - design.height) / 2,
    };
}
/**
 * Pure: the rect, in design units, that is both on-screen and outside the
 * platform's content safe-area inset — clipped to the guaranteed design box.
 * Anything the player must see or tap belongs in here.
 *
 * @param inset in CSS pixels, as `contentSafeAreaInset` delivers it
 */
export function safeRectOf(design, fit, clientWidth, clientHeight, inset) {
    const visibleWidth = design.width * fit.scaleX;
    const visibleHeight = design.height * fit.scaleY;
    const originX = (design.width - visibleWidth) / 2;
    const originY = (design.height - visibleHeight) / 2;
    const unitsPerPxX = clientWidth > 0 ? visibleWidth / clientWidth : 0;
    const unitsPerPxY = clientHeight > 0 ? visibleHeight / clientHeight : 0;
    const left = Math.max(originX + inset.left * unitsPerPxX, 0);
    const right = Math.min(originX + visibleWidth - inset.right * unitsPerPxX, design.width);
    const top = Math.max(originY + inset.top * unitsPerPxY, 0);
    const bottom = Math.min(originY + visibleHeight - inset.bottom * unitsPerPxY, design.height);
    return {
        x: left,
        y: top,
        width: Math.max(right - left, 0),
        height: Math.max(bottom - top, 0),
    };
}
export function createViewport(canvas, options = {}) {
    const design = options.design ?? DEFAULT_DESIGN;
    const mode = options.fit ?? 'expand';
    const maxPixelRatio = options.maxPixelRatio ?? 2;
    const host = options.host ?? canvas.parentElement;
    const listeners = new Set();
    let safeArea = ZERO_SAFE_AREA_INSET;
    let width = 1;
    let height = 1;
    let fit = fitFrustum(design, 1, mode);
    let safeRect = safeRectOf(design, fit, 1, 1, safeArea);
    let hudScale = 1;
    // DPR is capped, not honoured: an iPhone's DPR 3 means 9x the fragments of
    // DPR 1 for a difference nobody can see at arm's length.
    let pixelRatio = Math.min(devicePixelRatioOf(), maxPixelRatio);
    function measure() {
        const rect = host?.getBoundingClientRect();
        width = Math.max(Math.round(rect?.width ?? window.innerWidth), 1);
        height = Math.max(Math.round(rect?.height ?? window.innerHeight), 1);
        fit = fitFrustum(design, width / height, mode);
        safeRect = safeRectOf(design, fit, width, height, safeArea);
        hudScale = width / (design.width * fit.scaleX) / REFERENCE_PX_PER_UNIT;
    }
    function emit() {
        for (const cb of [...listeners])
            cb(viewport);
    }
    function toFraction(clientX, clientY) {
        const rect = canvas.getBoundingClientRect();
        return {
            fx: rect.width > 0 ? (clientX - rect.left) / rect.width : 0,
            fy: rect.height > 0 ? (clientY - rect.top) / rect.height : 0,
        };
    }
    const viewport = {
        design,
        get width() {
            return width;
        },
        get height() {
            return height;
        },
        get aspect() {
            return width / height;
        },
        get pixelRatio() {
            return pixelRatio;
        },
        get scale() {
            return { x: fit.scaleX, y: fit.scaleY };
        },
        get overscan() {
            return { x: fit.overscanX, y: fit.overscanY };
        },
        get safeArea() {
            return safeArea;
        },
        get safeRect() {
            return safeRect;
        },
        get hudScale() {
            return hudScale;
        },
        toDesign(clientX, clientY, out = new Vector2()) {
            const { fx, fy } = toFraction(clientX, clientY);
            const visibleWidth = design.width * fit.scaleX;
            const visibleHeight = design.height * fit.scaleY;
            return out.set((design.width - visibleWidth) / 2 + fx * visibleWidth, (design.height - visibleHeight) / 2 + fy * visibleHeight);
        },
        toNdc(clientX, clientY, out = new Vector2()) {
            const { fx, fy } = toFraction(clientX, clientY);
            return out.set(fx * 2 - 1, -(fy * 2 - 1));
        },
        designToNdc(x, y, out = new Vector2()) {
            const visibleWidth = design.width * fit.scaleX;
            const visibleHeight = design.height * fit.scaleY;
            const fx = (x - (design.width - visibleWidth) / 2) / visibleWidth;
            const fy = (y - (design.height - visibleHeight) / 2) / visibleHeight;
            return out.set(fx * 2 - 1, -(fy * 2 - 1));
        },
        on(_event, cb) {
            listeners.add(cb);
            return () => {
                listeners.delete(cb);
            };
        },
        setSafeArea(inset) {
            safeArea = inset;
            measure();
            emit();
        },
        setPixelRatio(ratio) {
            pixelRatio = Math.max(Math.min(ratio, maxPixelRatio), 1);
            emit();
        },
        refresh() {
            measure();
            emit();
        },
        dispose() {
            listeners.clear();
            window.removeEventListener('resize', onResize);
            window.removeEventListener('orientationchange', onResize);
            window.visualViewport?.removeEventListener('resize', onResize);
        },
    };
    const onResize = () => {
        // DPR changes when the window moves between displays, so re-read it.
        pixelRatio = Math.min(devicePixelRatioOf(), maxPixelRatio);
        measure();
        emit();
    };
    measure();
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    window.visualViewport?.addEventListener('resize', onResize);
    return viewport;
}
function devicePixelRatioOf() {
    const ratio = typeof devicePixelRatio === 'number' ? devicePixelRatio : 1;
    return ratio > 0 ? ratio : 1;
}
