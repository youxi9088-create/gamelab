import { id } from './id.js';

export const CARD_SUITS = ['hearts', 'diamonds', 'clubs', 'spades'];
export const CARD_RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
export const ACE_CHOICES = [0, 1, 11];
export const JOKER_VALUES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
export const ANCHOR_MAX_SCORE = 180;

export function createDeck(jokerCount = 2) {
    const deck = [];
    const totalJokers = Number(jokerCount) === 4 ? 4 : 2;
    for (const suit of CARD_SUITS) {
        for (const rank of CARD_RANKS) deck.push({ id: id(), type: 'standard', suit, rank });
    }
    for (let i = 0; i < totalJokers; i += 1) {
        deck.push({ id: id(), type: 'joker', rank: 'Joker', suit: null });
    }
    for (let i = deck.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

export function numericCardValue(card, aceValue = 1, jokerValue = 0) {
    if (!card) return 0;
    if (card.type === 'joker') return Number(jokerValue);
    if (card.rank === 'A') return Number(aceValue);
    if (['J', 'Q', 'K'].includes(card.rank)) return 10;
    return Number(card.rank) || 0;
}

export function getCardPegValue(card, aceValue = 1, jokerValue = 0) {
    return numericCardValue(card, aceValue, jokerValue);
}

function combinations(items, size) {
    const result = [];
    const walk = (start, chosen) => {
        if (chosen.length === size) {
            result.push(chosen.slice());
            return;
        }
        for (let i = start; i <= items.length - (size - chosen.length); i += 1) {
            chosen.push(items[i]);
            walk(i + 1, chosen);
            chosen.pop();
        }
    };
    walk(0, []);
    return result;
}

function subsetCanMakeTarget(subset, target) {
    const walk = (index, sum) => {
        if (index === subset.length) return sum === target;
        return subset[index].values.some((value) => walk(index + 1, sum + value));
    };
    return walk(0, 0);
}

function resolveCard(card, choices = {}) {
    const choice = choices[card.id] || {};
    if (card.type === 'joker') {
        const rank = CARD_RANKS.includes(choice.rank) ? choice.rank : null;
        const rawValue = choice.value;
        const chosenValue = Number(rawValue);
        const valueIsValid = rank === 'A'
            ? ACE_CHOICES.includes(chosenValue)
            : Boolean(rank) && chosenValue === (['J', 'Q', 'K'].includes(rank) ? 10 : Number(rank));
        return {
            value: rank && rawValue !== null && rawValue !== undefined && rawValue !== '' && valueIsValid ? chosenValue : null,
            rank,
            suit: 'all'
        };
    }
    if (card.rank === 'A') {
        const rawValue = choice.value;
        const chosenAceValue = Number(rawValue);
        return {
            value: rawValue !== null && rawValue !== undefined && rawValue !== '' && ACE_CHOICES.includes(chosenAceValue) ? chosenAceValue : null,
            rank: card.rank,
            suit: card.suit
        };
    }
    return {
        value: numericCardValue(card, 1),
        rank: card.rank,
        suit: card.suit
    };
}

function normalizeAceContextChoices(cards, choices = {}, isCrib = false) {
    const normalized = { ...(choices || {}) };
    const handCards = isCrib ? cards.slice(0, 4) : cards.slice(0, Math.min(4, cards.length));
    const naturalAces = handCards.filter((card) => card?.type !== 'joker' && card?.rank === 'A');
    const upCard = isCrib ? cards[4] : null;
    const upCardValue = upCard?.type !== 'joker' && upCard?.rank === 'A'
        ? (() => {
            const rawValue = normalized[upCard.id]?.value;
            if (rawValue === null || rawValue === undefined || rawValue === '') return null;
            const value = Number(rawValue);
            return ACE_CHOICES.includes(value) ? value : null;
        })()
        : null;
    const selectedValue = upCardValue ?? naturalAces
        .map((card) => {
            const rawValue = normalized[card.id]?.value;
            if (rawValue === null || rawValue === undefined || rawValue === '') return null;
            const value = Number(rawValue);
            return ACE_CHOICES.includes(value) ? value : null;
        })
        .find((value) => value !== null);

    // Natural Aces are separate physical cards, but scoring normalizes each
    // context to one linked value. In the crib, the selected natural upcard
    // Ace is the authoritative value for every crib Ace. Pegging establishes
    // the separate hand link when the first natural Ace is successfully played.
    if (selectedValue !== undefined && selectedValue !== null) {
        naturalAces.forEach((card) => {
            normalized[card.id] = { ...(normalized[card.id] || {}), value: selectedValue };
        });
    }
    return normalized;
}

function suitsMatch(first, second) {
    return first === 'all' || second === 'all' || first === second;
}

function itemSuit(item) {
    // A Joker is always every suit during pegging, regardless of which suit a
    // stale client or display layer may have attached to the played object.
    return item?.type === 'joker' ? 'all' : (item?.resolvedSuit || item?.suit);
}

function isFlush(items) {
    if (!items.length) return false;
    // A joker can stand for whichever one suit the rest of the group uses,
    // but it cannot bridge two different ordinary suits.
    return CARD_SUITS.some((suit) => items.every((item) => suitsMatch(suit, itemSuit(item))));
}

function itemRank(item) {
    return item?.resolvedRank || item?.rank;
}

function itemValue(item) {
    return item?.pegValue ?? item?.value;
}

function aceRunValue(item) {
    if (itemRank(item) !== 'A') return null;
    const value = Number(itemValue(item));
    return ACE_CHOICES.includes(value) ? value : null;
}

function runRank(item) {
    const rank = itemRank(item);
    const aceValue = aceRunValue(item);
    // Ace 11 is high, immediately above the king. Ace 1 is low. A zero Ace
    // uses the separate circular order handled by isRun below.
    if (aceValue !== null) return aceValue === 11 ? 14 : 1;
    return CARD_RANKS.indexOf(rank) + 1;
}

function zeroAceRunPosition(item) {
    if (aceRunValue(item) === 0) return 0;
    const rank = itemRank(item);
    const rankIndex = CARD_RANKS.indexOf(rank);
    // The circular order is A(0), 2, 3, ..., K. A zero Ace is the bridge
    // between King and 2; the run may extend beyond that bridge on either
    // side, but it must contain both the King and the 2.
    return rankIndex >= 1 ? rankIndex : null;
}

function jokerRunPositions(item, circular = false) {
    const value = Number(itemValue(item));
    const declaredRank = itemRank(item);
    const hasDeclaredRank = CARD_RANKS.includes(declaredRank);

    // A Joker's selected rank is its identity for runs. In particular, a
    // Joker declared as K may count as 10 for pegging, but it cannot silently
    // move into the J or Q slot just because all three face ranks have value
    // 10. Keep the broad value fallback only for legacy played-card snapshots
    // that predate resolvedRank/declaration data.
    if (hasDeclaredRank) {
        if (declaredRank === 'A') {
            if (circular) return [0];
            if (value === 1) return [1];
            if (value === 11) return [14];
            return [];
        }
        const rankIndex = CARD_RANKS.indexOf(declaredRank);
        if (circular) return [rankIndex];
        return [rankIndex + 1];
    }

    if (!Number.isFinite(value)) return circular
        ? Array.from({ length: 13 }, (_, index) => index)
        : Array.from({ length: 14 }, (_, index) => index + 1);

    if (circular) {
        if (value === 0 || value === 1 || value === 11) return [0];
        if (value === 10) return [9, 10, 11, 12];
        if (value >= 2 && value <= 9) return [value - 1];
        return [];
    }

    if (value === 0) return [];
    if (value === 1) return [1];
    if (value === 11) return [14];
    if (value >= 2 && value <= 9) return [value];
    if (value === 10) return [10, 11, 12, 13];
    return [];
}

function canAssignJokersToSlots(jokers, slots, circular = false) {
    if (jokers.length !== slots.length) return false;
    const options = jokers.map((joker) => jokerRunPositions(joker, circular)
        .filter((position) => slots.includes(position)));
    if (options.some((positions) => !positions.length)) return false;

    const walk = (index, used) => {
        if (index === options.length) return true;
        return options[index].some((position) => !used.has(position)
            && walk(index + 1, new Set([...used, position])));
    };
    return walk(0, new Set());
}

function isRun(items, wildJokers = false) {
    const jokers = wildJokers ? items.filter((item) => item?.type === 'joker') : [];
    const rankItems = wildJokers ? items.filter((item) => item?.type !== 'joker') : items;
    if (rankItems.some((item) => !CARD_RANKS.includes(itemRank(item))
        || itemValue(item) === null
        || itemValue(item) === undefined
        || itemValue(item) === ''
        || !Number.isFinite(Number(itemValue(item))))) return false;
    const aceItems = rankItems.filter((item) => itemRank(item) === 'A');
    // Never silently reinterpret an unassigned/invalid Ace as low. Scoring
    // callers must provide the same selected Ace state used by pegging.
    if (aceItems.some((item) => aceRunValue(item) === null)) return false;

    const zeroAceItems = [
        ...aceItems.filter((item) => aceRunValue(item) === 0),
        ...jokers.filter((item) => itemRank(item) === 'A' && aceRunValue(item) === 0)
    ];
    if (zeroAceItems.length) {
        // A zero Ace is only valid as the K-A(0)-2 bridge. A Joker declared
        // as Ace(0) is the same fixed zero-Ace bridge, not a free wildcard;
        // this is what lets K-Joker(A0)-2 score as a run of three while still
        // requiring the natural King and 2 that establish the bridge.
        const hasKingBridge = rankItems.some((item) => itemRank(item) === 'K')
            || jokers.some((item) => itemRank(item) === 'K' && jokerRunPositions(item, true).includes(12));
        const hasTwoBridge = rankItems.some((item) => itemRank(item) === '2');
        if (zeroAceItems.length !== 1 || !hasKingBridge || !hasTwoBridge) return false;
        const fixedRunItems = [
            ...rankItems,
            ...zeroAceItems.filter((item) => item?.type === 'joker')
        ];
        const positions = fixedRunItems.map(zeroAceRunPosition);
        if (positions.some((position) => position === null) || new Set(positions).size !== fixedRunItems.length) return false;
        const positionSet = new Set(positions);
        const remainingJokers = jokers.filter((item) => !zeroAceItems.includes(item));
        return Array.from({ length: 13 }, (_, start) => {
            const window = Array.from({ length: items.length }, (_, offset) => (start + offset) % 13);
            const slots = window.filter((position) => !positionSet.has(position));
            return positions.every((position) => window.includes(position))
                && canAssignJokersToSlots(remainingJokers, slots, true);
        }).some(Boolean);
    }

    if (!jokers.length) {
        const ranks = items.map(runRank).sort((a, b) => a - b);
        return new Set(ranks).size === items.length
            && ranks.every((rank, index) => index === 0 || rank === ranks[index - 1] + 1);
    }

    const positions = rankItems.map(runRank);
    if (positions.some((position) => !Number.isFinite(position)) || new Set(positions).size !== positions.length) return false;
    for (let start = 1; start <= 14 - items.length + 1; start += 1) {
        const window = Array.from({ length: items.length }, (_, offset) => start + offset);
        if (!positions.every((position) => window.includes(position))) continue;
        const slots = window.filter((position) => !positions.includes(position));
        if (canAssignJokersToSlots(jokers, slots)) return true;
    }
    return false;
}

function itemType(item) {
    return item?.card?.type || item?.type;
}

function jokerCanPairWith(joker, target) {
    const jokerRank = itemRank(joker);
    const targetRank = itemRank(target);
    if (!jokerRank || !targetRank || jokerRank !== targetRank) return false;

    // A Joker's declared rank is its identity for pairs. Aces also need the
    // same selected counting value; this keeps Ace(1), Ace(11), and Ace(0)
    // distinct while preventing a Joker-K from pairing with a Queen merely
    // because both face cards count as 10.
    if (jokerRank !== 'A') return true;
    const jokerValue = Number(itemValue(joker));
    const targetValue = Number(itemValue(target));
    return Number.isFinite(jokerValue)
        && Number.isFinite(targetValue)
        && jokerValue === targetValue;
}

function pairMatches(first, second, wildJokers = false) {
    if (wildJokers && itemType(first) === 'joker' && itemType(second) === 'joker') {
        return jokerCanPairWith(first, second);
    }
    if (wildJokers && itemType(first) === 'joker') return jokerCanPairWith(first, second);
    if (wildJokers && itemType(second) === 'joker') return jokerCanPairWith(second, first);

    const firstRank = itemRank(first);
    const secondRank = itemRank(second);
    if (!firstRank || !secondRank || firstRank !== secondRank) return false;

    // Aces are only a pair when their selected rank and counting value both
    // match. Other ranks remain rank-based because their counting value is
    // fixed by the rank.
    if (firstRank !== 'A') return true;
    const rawFirstValue = itemValue(first);
    const rawSecondValue = itemValue(second);
    if ([rawFirstValue, rawSecondValue].some((value) => value === null || value === undefined || value === '')) return false;
    const firstValue = Number(rawFirstValue);
    const secondValue = Number(rawSecondValue);
    return Number.isFinite(firstValue)
        && Number.isFinite(secondValue)
        && firstValue === secondValue;
}

function turboPairMatches(first, second) {
    return itemType(first) === 'joker'
        && itemType(second) === 'joker'
        && pairMatches(first, second, true);
}

function pairScoreForGroup(items) {
    let turboPairs = 0;
    let normalPairs = 0;
    for (let i = 0; i < items.length; i += 1) {
        for (let j = i + 1; j < items.length; j += 1) {
            if (!pairMatches(items[i], items[j], true)) continue;
            if (turboPairMatches(items[i], items[j])) turboPairs += 1;
            else normalPairs += 1;
        }
    }
    return {
        turboPairs,
        normalPairs,
        totalPairs: turboPairs + normalPairs,
        points: turboPairs * 3 + normalPairs * 2
    };
}

function pairGroupLabel(summary, cardCount, inflation = false) {
    const prefix = inflation ? 'Inflation · ' : '';
    if (summary.totalPairs === 1) return `${prefix}${summary.turboPairs ? 'Turbo Pair' : 'Pair'}`;
    if (summary.turboPairs === summary.totalPairs) return `${prefix}${summary.turboPairs} Turbo Pairs`;
    if (summary.normalPairs === summary.totalPairs) return `${prefix}${cardCount} of a kind`;
    return `${prefix}${summary.turboPairs} Turbo Pairs + ${summary.normalPairs} Pairs`;
}

export function calculateCribbageScore(cards, choices = {}, isCrib = false, options = {}) {
    const inflation = Boolean(options?.inflation);
    const normalizedChoices = normalizeAceContextChoices(cards.filter(Boolean), choices, isCrib);
    const resolved = cards.filter(Boolean).map((card) => ({ card, ...resolveCard(card, normalizedChoices) }));
    if (resolved.length === 0) return { total: 0, details: [] };
    const details = [];
    const idsFor = (items) => items.map((item) => item.card.id).filter(Boolean);
    const fifteenCards = resolved
        .filter((item) => Number.isFinite(Number(item.value)))
        .map((item) => ({ values: [item.value], card: item.card }));
    for (let size = 2; size <= fifteenCards.length; size += 1) {
        combinations(fifteenCards, size).forEach((combo) => {
            if (subsetCanMakeTarget(combo, 15)) {
                details.push({ label: 'Fifteen', points: 2, cardIds: idsFor(combo) });
            }
        });
    }

    for (let i = 0; i < resolved.length; i += 1) {
        for (let j = i + 1; j < resolved.length; j += 1) {
            const first = resolved[i];
            const second = resolved[j];
            if (!pairMatches(first, second, true)) continue;
            const turbo = turboPairMatches(first, second);
            const pairRank = first.card.type === 'joker' ? second.rank : first.rank;
            details.push({
                label: turbo ? 'Turbo Pair' : `Pair of ${pairRank}s`,
                points: turbo ? 3 : 2,
                cardIds: idsFor([first, second])
            });
        }
    }

    let bestRunLength = 0;
    let bestRuns = [];
    for (let size = 3; size <= resolved.length; size += 1) {
        const runs = combinations(resolved, size).filter((combo) => isRun(combo, true));
        if (!runs.length) continue;
        if (size > bestRunLength) {
            bestRunLength = size;
            bestRuns = runs;
        } else if (size === bestRunLength) {
            bestRuns.push(...runs);
        }
    }
    bestRuns.forEach((run) => {
        details.push({ label: `Run of ${bestRunLength}`, points: bestRunLength, cardIds: idsFor(run) });
    });

    const handCards = isCrib ? resolved.slice(0, 4) : resolved.slice(0, Math.min(4, resolved.length));
    const upCard = isCrib ? resolved[4] || null : resolved.length > 4 ? resolved[resolved.length - 1] : null;
    if (handCards.length === 4 && isFlush(handCards)) {
        const allFlushCards = upCard ? [...handCards, upCard] : handCards;
        const upCardExtendsFlush = Boolean(upCard && isFlush(allFlushCards));
        const flushCards = upCardExtendsFlush ? allFlushCards : handCards;
        const flushLabel = isCrib ? 'Crib flush' : 'Flush';
        // Inflation keeps the ordinary four-card flush and its upcard extension
        // together as one five-point combination. The upcard is explicit in the
        // extension detail so hand, crib, and pegging logs all identify the same
        // physical scoring event.
        if (inflation && upCardExtendsFlush && flushCards.length === 5) {
            details.push({ label: flushLabel, points: 4, cardIds: idsFor(handCards) });
            details.push({
                label: 'Inflation · Flush extension · 5 cards',
                points: 1,
                inflation: true,
                cardIds: idsFor(flushCards)
            });
        } else {
            details.push({
                label: flushLabel,
                points: flushCards.length,
                cardIds: idsFor(flushCards)
            });
        }
    }
    if (upCard) {
        // Nobs is scored once for every Jack in the hand or crib that matches
        // the upcard suit. Jokers are every suit, including when declared as
        // Jacks, and a Joker upcard matches every Jack as well.
        const nobsCards = handCards.filter((item) => itemRank(item) === 'J'
            && suitsMatch(itemSuit(item), itemSuit(upCard)));
        nobsCards.forEach((nobsCard) => {
            details.push({ label: 'Nobs', points: 1, cardIds: idsFor([nobsCard, upCard]) });
        });
    }
    return { total: details.reduce((sum, item) => sum + item.points, 0), details };
}

export function calculateHandScore(cards, upCard, choices = {}, options = {}) {
    return calculateCribbageScore([...cards, upCard].filter(Boolean), choices, false, options).total;
}

function resolveInflationUpCard(options = {}) {
    if (!options?.inflation || !options.upCard) return null;
    const card = options.upCard;
    const choice = options.upCardChoice
        || options.upCardChoices?.[options.inflationSide || options.side]
        || null;

    // Joker and rank/value Ace inflation use only this scoring player's
    // declaration. A natural Ace may still participate in a flush by its fixed
    // suit before that declaration exists.
    if (card.type === 'joker') {
        const rank = CARD_RANKS.includes(choice?.rank) ? choice.rank : null;
        const value = Number(choice?.value);
        const expectedValue = rank === 'A'
            ? ACE_CHOICES.includes(value)
            : Boolean(rank) && value === (['J', 'Q', 'K'].includes(rank) ? 10 : Number(rank));
        if (!rank || !expectedValue) return null;
        return {
            ...card,
            pegValue: value,
            resolvedRank: rank,
            // Jokers are all suits regardless of their declared rank/value.
            resolvedSuit: 'all'
        };
    }

    if (card.rank === 'A') {
        const value = Number(choice?.value);
        if (ACE_CHOICES.includes(value)) {
            return {
                ...card,
                pegValue: value,
                resolvedRank: 'A',
                resolvedSuit: card.suit
            };
        }
        // A natural Ace has a fixed suit even before its counting value is
        // declared. Keep it available for flush-only Inflation, but hide its
        // rank/value so an undeclared upcard cannot create a pair or run.
        return {
            ...card,
            pegValue: null,
            resolvedRank: '__undeclared_ace__',
            resolvedSuit: card.suit
        };
    }

    if (card.type !== 'standard' || !CARD_RANKS.includes(card.rank)) return null;
    return {
        ...card,
        pegValue: numericCardValue(card, 1),
        resolvedRank: card.rank,
        resolvedSuit: card.suit
    };
}

export function peggingPoints(stack, newTotal, options = {}) {
    const details = [];
    if (newTotal === 15) details.push({ label: 'Fifteen', points: 2 });
    if (newTotal === 31) details.push({ label: 'Thirty-one', points: 2 });

    // Inflation extends live pegging combinations with the upcard. Ordinary
    // upcards are always fixed; Joker and rank/value Ace scoring use the
    // scoring player's own declaration supplied for this event, while a
    // natural Ace's fixed suit remains available for flush-only scoring.
    const inflationUpCard = resolveInflationUpCard(options);

    if (stack.length >= 1) {
        const lastCard = stack[stack.length - 1];
        const matchingCards = [lastCard];
        for (let i = stack.length - 2; i >= 0 && pairMatches(stack[i], lastCard, true); i -= 1) {
            matchingCards.unshift(stack[i]);
        }
        const same = matchingCards.length;
        // Inflation may extend a pair, but it cannot create one from the
        // upcard plus a single played card. At least two matching cards must
        // already have been laid consecutively in this live pegging count.
        const inflationPair = Boolean(inflationUpCard && same >= 2 && pairMatches(inflationUpCard, lastCard, true));
        const pairCards = inflationPair ? [...matchingCards, inflationUpCard] : matchingCards;
        const pairSummary = pairScoreForGroup(pairCards);
        if (pairSummary.totalPairs > 0) {
            details.push({
                label: pairGroupLabel(pairSummary, pairCards.length, inflationPair),
                points: pairSummary.points,
                ...(inflationPair ? { inflation: true } : {})
            });
        }
    }

    let runLength = 0;
    for (let size = stack.length; size >= 3; size -= 1) {
        const suffix = stack.slice(-size);
        if (isRun(suffix, true)) {
            runLength = size;
            break;
        }
    }
    let inflationRunLength = 0;
    // Inflation and upcard bridges require four cards total: at least three
    // cards must have been played in this one live count before the upcard can
    // extend or bridge that run.
    if (inflationUpCard && stack.length >= 3) {
        for (let size = stack.length; size >= 3; size -= 1) {
            const suffix = [...stack.slice(-size), inflationUpCard];
            if (isRun(suffix, true)) {
                inflationRunLength = suffix.length;
                break;
            }
        }
    }
    if (inflationRunLength > runLength) {
        details.push({ label: `Inflation · Run of ${inflationRunLength}`, points: inflationRunLength, inflation: true });
    } else if (runLength) {
        details.push({ label: `Run of ${runLength}`, points: runLength });
    }

    // A pegging count is the current stack, which resets after 31 or a
    // completed GO. Only the trailing same-suit sequence can become a new
    // flush when this card lands; an earlier off-suit card does not cancel a
    // later four-card run. Like a run, a completed flush awards its full
    // current length when the scoring card lands.
    let flushLength = 0;
    for (let start = stack.length - 1; start >= 0; start -= 1) {
        const candidate = stack.slice(start);
        if (!isFlush(candidate)) break;
        flushLength = candidate.length;
    }
    let inflationFlushLength = 0;
    // A Joker upcard has a suit for flush-only Inflation even before its
    // rank/value is declared. Keep that suit-only use separate from the
    // declaration-gated upcard used for Inflation pairs and runs.
    const inflationFlushUpCard = options?.inflation && options.upCard?.type === 'joker'
        ? { ...options.upCard, resolvedSuit: 'all' }
        : inflationUpCard;
    // Unlike an inflation run, an inflation flush needs four cards actually
    // played in the current count before the upcard can extend it. The upcard
    // is not one of the four-card minimum for this rule, so it can never
    // create the initial flush on its own.
    if (inflationFlushUpCard && stack.length >= 4) {
        for (let start = stack.length - 4; start >= 0; start -= 1) {
            const candidate = [...stack.slice(start), inflationFlushUpCard];
            if (!isFlush(candidate)) break;
            inflationFlushLength = candidate.length;
        }
    }
    if (flushLength >= 4) {
        details.push({
            label: flushLength === 4 ? 'Flush of 4' : `Flush extension · ${flushLength} cards`,
            points: flushLength
        });
    }
    if (inflationFlushLength >= 5) {
        // The ordinary four-card flush award remains intact. Once four cards
        // have been played in this count, a matching upcard adds one inflation
        // point as the next same-suit extension.
        if (inflationFlushLength > flushLength) {
            details.push({ label: `Inflation · Flush extension · ${inflationFlushLength} cards`, points: 1, inflation: true });
        }
    }
    return details;
}

export function advanceScore(scoreInput, opponentScoreInput, events, goal, options = {}) {
    const target = Number(goal) || 181;
    const configuredAnchorLimit = Number(options?.anchorLimit);
    const anchorLimit = Number.isFinite(configuredAnchorLimit)
        ? Math.min(target, Math.max(0, configuredAnchorLimit))
        : Math.min(target, ANCHOR_MAX_SCORE);
    const score = {
        galleon: Math.min(target, Math.max(0, Number(scoreInput?.galleon) || 0)),
        anchor: Math.min(anchorLimit, Math.max(0, Number(scoreInput?.anchor ?? scoreInput?.screw) || 0)),
        nextMarker: scoreInput?.nextMarker || 'galleon'
    };
    const opponentScore = {
        galleon: Math.min(target, Math.max(0, Number(opponentScoreInput?.galleon) || 0)),
        anchor: Math.min(anchorLimit, Math.max(0, Number(opponentScoreInput?.anchor ?? opponentScoreInput?.screw) || 0)),
        nextMarker: opponentScoreInput?.nextMarker || 'galleon'
    };
    let nextMarker = score.nextMarker || 'galleon';
    for (const event of events) {
        const points = Math.max(0, Number(event.points) || 0);
        if (!points) continue;

        // Cribbage uses two pegs on one track. The rear peg leaps over the
        // front peg to the new running score, then becomes the front peg.
        // On a tied start, nextMarker chooses which physical peg moves first.
        const rearMarker = score.galleon === score.anchor
            ? nextMarker
            : score.galleon < score.anchor ? 'galleon' : 'anchor';
        const runningScore = Math.max(score.galleon, score.anchor);
        const markerLimit = rearMarker === 'anchor' ? anchorLimit : target;
        score[rearMarker] = Math.min(markerLimit, runningScore + points);
        nextMarker = rearMarker === 'galleon' ? 'anchor' : 'galleon';
    }
    score.nextMarker = nextMarker;
    return { score, opponentScore };
}

export function cardLabel(card) {
    if (!card) return '';
    return card.type === 'joker' ? 'JOKER' : `${card.rank}${card.suit ? ` ${card.suit}` : ''}`;
}
