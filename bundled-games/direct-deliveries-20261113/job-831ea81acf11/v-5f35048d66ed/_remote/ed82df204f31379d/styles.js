/**
 * The single stylesheet the HUD injects.
 *
 * The Remix tokens are literal values, not an import of
 * `@farcade/design-tokens`: this package publishes to npm, and the repo rule is
 * that a public package must not carry a `workspace:` dependency.
 *
 * Fonts are named, not embedded. Outfit is the design system's body face and
 * resolves in the Remix shell and the desktop preview; the fallback stack keeps
 * a bare-file build from rendering in a serif. Embedding a subset would remove
 * the fallback risk entirely at ~55 KB — see AGENTS.md.
 */
export const HUD_CSS = `
.rx-hud {
  --rx-black: #060b0f;
  --rx-white: #fafafa;
  --rx-lime: #b6ff00;
  --rx-section: #171717;
  --rx-secondary: #27272a;
  --rx-muted: #a1a1aa;
  --rx-font: 'Outfit', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  --rx-hud-scale: 1;
  --rx-safe-top: 0px;
  --rx-safe-right: 0px;
  --rx-safe-bottom: 0px;
  --rx-safe-left: 0px;

  position: absolute;
  inset: 0;
  display: grid;
  grid-template-rows: auto 1fr auto;
  grid-template-columns: auto 1fr auto;
  grid-template-areas:
    'top-left top top-right'
    'left center right'
    'bottom-left bottom bottom-right';
  /* env() first so the notch is respected from frame one, then the platform's
     own contentSafeAreaInset lands ~a few frames later and transitions in. The
     150ms makes the correction read as motion instead of a snap. */
  padding-top: max(var(--rx-safe-top), env(safe-area-inset-top, 0px));
  padding-right: max(var(--rx-safe-right), env(safe-area-inset-right, 0px));
  padding-bottom: max(var(--rx-safe-bottom), env(safe-area-inset-bottom, 0px));
  padding-left: max(var(--rx-safe-left), env(safe-area-inset-left, 0px));
  transition: padding 150ms ease-out;
  pointer-events: none;
  user-select: none;
  -webkit-user-select: none;
  font-family: var(--rx-font);
  color: var(--rx-white);
  z-index: 10;
}

.rx-hud-layer {
  display: flex;
  flex-direction: column;
  gap: calc(8px * var(--rx-hud-scale));
  padding: calc(12px * var(--rx-hud-scale));
  pointer-events: none;
}
.rx-hud-layer[data-interactive='true'] { pointer-events: auto; }

.rx-hud-layer[data-anchor^='top'] { align-self: start; }
.rx-hud-layer[data-anchor^='bottom'] { align-self: end; }
.rx-hud-layer[data-anchor$='left'] { align-items: flex-start; justify-self: start; }
.rx-hud-layer[data-anchor$='right'] { align-items: flex-end; justify-self: end; }
.rx-hud-layer[data-anchor='top'],
.rx-hud-layer[data-anchor='bottom'],
.rx-hud-layer[data-anchor='center'] { align-items: center; justify-self: center; }
.rx-hud-layer[data-anchor='left'] { align-items: flex-start; align-self: center; }
.rx-hud-layer[data-anchor='right'] { align-items: flex-end; align-self: center; }
.rx-hud-layer[data-anchor='center'] { align-self: center; }

.rx-hud-score {
  font-size: calc(40px * var(--rx-hud-scale));
  font-weight: 600;
  line-height: 1;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
}

.rx-hud-chip {
  font-size: calc(14px * var(--rx-hud-scale));
  font-weight: 500;
  line-height: 1;
  padding: calc(6px * var(--rx-hud-scale)) calc(10px * var(--rx-hud-scale));
  border-radius: calc(6px * var(--rx-hud-scale));
  background: color-mix(in srgb, var(--rx-black) 60%, transparent);
  border: 1px solid var(--rx-secondary);
  color: var(--rx-white);
}

.rx-hud-button {
  font-family: var(--rx-font);
  font-size: calc(16px * var(--rx-hud-scale));
  font-weight: 600;
  line-height: 1;
  padding: calc(12px * var(--rx-hud-scale)) calc(20px * var(--rx-hud-scale));
  border-radius: calc(6px * var(--rx-hud-scale));
  border: none;
  background: var(--rx-white);
  color: var(--rx-black);
  pointer-events: auto;
  cursor: pointer;
  touch-action: manipulation;
  transition: transform 150ms ease-out, opacity 150ms ease-out;
  /* 44px is the smallest reliable touch target; scaled type must not shrink
     below it or the button becomes a coin flip on a phone. */
  min-height: calc(44px * var(--rx-hud-scale));
}
.rx-hud-button:active { transform: scale(0.98); }
.rx-hud-button[data-variant='cta'] { background: var(--rx-lime); color: var(--rx-black); }
.rx-hud-button[data-variant='ghost'] {
  background: transparent;
  color: var(--rx-white);
  border: 1px solid var(--rx-secondary);
}

.rx-hud-banner {
  grid-area: center;
  align-self: center;
  justify-self: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: calc(8px * var(--rx-hud-scale));
  padding: calc(24px * var(--rx-hud-scale));
  border-radius: calc(16px * var(--rx-hud-scale));
  background: color-mix(in srgb, var(--rx-section) 92%, transparent);
  border: 1px solid var(--rx-secondary);
  text-align: center;
  pointer-events: auto;
}
.rx-hud-banner-title {
  font-size: calc(30px * var(--rx-hud-scale));
  font-weight: 600;
  line-height: 1.25;
}
.rx-hud-banner-subtitle {
  font-size: calc(16px * var(--rx-hud-scale));
  color: var(--rx-muted);
}
`;
