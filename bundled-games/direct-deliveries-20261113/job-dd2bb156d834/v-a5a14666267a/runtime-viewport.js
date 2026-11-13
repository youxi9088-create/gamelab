/* Opt-in, engine-independent viewport. Dimensions come from version metadata.
 * Install before boot; the canvas parent becomes the Cocos browser frame.
 * Keep original scene coordinates, textures, camera and input transforms intact.
 */
(function (root) {
  'use strict';
  function fitViewport(width, height, designWidth, designHeight) {
    if (![width, height, designWidth, designHeight].every(n => Number.isFinite(n) && n > 0))
      throw new Error('Viewport dimensions must be positive finite numbers');
    const scale = Math.min(width / designWidth, height / designHeight);
    const fittedWidth = Math.max(1, Math.floor(designWidth * scale));
    const fittedHeight = Math.min(height, Math.ceil(fittedWidth * designHeight / designWidth));
    return {width: fittedWidth, height: fittedHeight};
  }
  function mount(canvas, config) {
    if (!canvas || !canvas.parentNode || config.fit !== 'contain')
      throw new Error('A canvas and contain viewport metadata are required');
    const frame = document.createElement('div');
    frame.id = 'ReplicaGameFrame';
    frame.style.cssText = 'position:absolute;overflow:hidden;';
    canvas.parentNode.insertBefore(frame, canvas);
    frame.appendChild(canvas);
    function resize() {
      const size = fitViewport(root.innerWidth, root.innerHeight, config.width, config.height);
      Object.assign(frame.style, {width: size.width + 'px', height: size.height + 'px',
        left: Math.floor((root.innerWidth - size.width) / 2) + 'px',
        top: Math.floor((root.innerHeight - size.height) / 2) + 'px'});
    }
    resize();
    // Registered before the engine so it reads the resized frame, not stale bounds.
    root.addEventListener('resize', resize);
    return {frame, getSize: () => ({width: frame.clientWidth, height: frame.clientHeight})};
  }
  root.ReplicaRuntimeViewport = {fitViewport, mount};
  if (typeof module !== 'undefined') module.exports = {fitViewport};
})(typeof window === 'undefined' ? globalThis : window);
