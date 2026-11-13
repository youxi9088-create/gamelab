const CONTEXT_LIMITS = Object.freeze({
  PLAYER_NAME: { min: 2, max: 16, kind: 'name' },
  ROOM_NAME: { min: 2, max: 24, kind: 'name' },
  PET_NAME: { min: 2, max: 16, kind: 'name' },
  PUBLIC_TEXT: { min: 1, max: 300, kind: 'text' },
});

// Keep this list private to the validator. Callers receive a generic reason so
// no screen teaches players which words or spellings the filter recognizes.
const BLOCKED_TERMS = Object.freeze([
  'fuck', 'fucker', 'fuckers', 'fucking', 'fucked', 'fuckface',
  'shit', 'shits', 'shitty', 'shitting', 'bullshit', 'horseshit',
  'bitch', 'bitches', 'bitchy', 'bastard', 'bastards', 'asshole', 'assholes',
  'asswipe', 'dick', 'dicks', 'dickhead', 'prick', 'pricks', 'cock', 'cocks',
  'cunt', 'cunts', 'pussy', 'pussies', 'slut', 'sluts', 'whore', 'whores',
  'piss', 'pissed', 'pissing', 'porn', 'porno', 'nudes', 'nude', 'horny',
  'rape', 'rapist', 'nazi', 'slur',
]);

function cleanText(value) {
  let text = String(value ?? '');
  try { text = text.normalize('NFKC'); } catch { /* Use the browser's original text. */ }
  return text
    .replace(/[\u200B-\u200F\u202A-\u202E\u2060\uFEFF]/g, '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '')
    .replace(/\s+/gu, ' ')
    .trim();
}

function safetyForm(value) {
  let text = String(value ?? '').toLocaleLowerCase();
  try { text = text.normalize('NFKD'); } catch { /* Keep normalized casing when available. */ }
  return text
    .replace(/\p{M}/gu, '')
    .replace(/[@4]/g, 'a')
    .replace(/[3]/g, 'e')
    .replace(/[1!|]/g, 'i')
    .replace(/[0]/g, 'o')
    .replace(/[5$]/g, 's')
    .replace(/[7]/g, 't')
    .replace(/[8]/g, 'b')
    .replace(/[9]/g, 'g')
    .replace(/[2]/g, 'z');
}

function hasBlockedTerm(text) {
  const normalized = safetyForm(text);
  return BLOCKED_TERMS.some((term) => {
    const flexibleTerm = term.split('').map((character) => `${character}+`).join('[^a-z0-9]*');
    const boundaryPattern = new RegExp(`(?:^|[^a-z0-9])${flexibleTerm}(?:$|[^a-z0-9])`, 'i');
    if (boundaryPattern.test(normalized)) return true;
    // Longer terms are safe to catch inside compounds such as “bullshit”,
    // while short ambiguous words use boundaries to avoid ordinary false hits.
    return term.length >= 5 && new RegExp(flexibleTerm, 'i').test(normalized);
  });
}

/**
 * Normalize and validate player-created text for its display context.
 * Returns { allowed, reason, text, context }; rejected text is never rewritten
 * into an apparently acceptable name.
 */
export function validateUserText(value, context = 'PUBLIC_TEXT') {
  const safeContext = Object.hasOwn(CONTEXT_LIMITS, context) ? context : 'PUBLIC_TEXT';
  const limits = CONTEXT_LIMITS[safeContext];
  const text = cleanText(value);
  const length = Array.from(text).length;
  const result = (allowed, reason = '') => ({ allowed, reason, text, context: safeContext });

  if (!text) return result(false, limits.kind === 'name' ? 'empty_name' : 'empty_text');
  if (length < limits.min) return result(false, 'too_short');
  if (length > limits.max) return result(false, 'too_long');
  if (limits.kind === 'name' && !/^[\p{L}\p{N}][\p{L}\p{N} '\u2019.,!&-]*[\p{L}\p{N}]$/u.test(text)) {
    return result(false, 'invalid_characters');
  }
  if (hasBlockedTerm(text)) {
    return result(false, limits.kind === 'name' ? 'inappropriate_name' : 'inappropriate_text');
  }
  return result(true);
}

export function safeUserText(value, context, fallback = '') {
  const result = validateUserText(value, context);
  return result.allowed ? result.text : fallback;
}

export function normalizeUserText(value) {
  return cleanText(value);
}
