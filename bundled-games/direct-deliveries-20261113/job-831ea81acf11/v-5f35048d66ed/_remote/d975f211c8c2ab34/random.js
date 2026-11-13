/**
 * Randomness that feels fair.
 *
 * `Math.random()` is stateless, and stateless rolls streak: a 25% crit chance
 * misses eight times in a row for one player in ten thousand attacks, and that
 * player experiences a broken game, not an unlucky one. Players expect random
 * events to self-correct over a handful of trials — real independence does not —
 * so a repeated player-facing roll wants a distribution that is *guaranteed*
 * over a short cycle and merely *shuffled* within it.
 *
 * That is the shuffle bag (the "marble bag"): fill a bag with the outcomes in
 * their intended ratio, draw without replacement, refill and reshuffle when it
 * empties. A 1-in-4 crit is then exactly one crit in every four attacks, the
 * worst possible drought is bounded by construction (2 × (cycle − 1) misses,
 * when a crit opens one cycle and closes the next), and the ratio is still
 * honest over any long run.
 *
 * This lives in the SDK rather than in prompt prose because every game that
 * hand-rolls it gets a different one — usually with the `sort(() => r - 0.5)`
 * shuffle, which is biased on every engine — and because an injectable RNG is
 * what makes game logic deterministic under test and daily-challenge seeds
 * reproducible across players.
 */
/**
 * A pool of outcomes drawn without replacement, refilled when empty.
 *
 * Values are generic, so bags nest: a bag whose values are themselves bags
 * first decides the category, then the category's own bag decides the item —
 * which is how "rare letters are not only rare but spaced out" is built.
 *
 * Use it for every repeated player-facing roll: crits, drops, obstacle types.
 * One-off cosmetic jitter keeps using the plain RNG; nobody counts particles.
 */
export function createShuffleBag(entries, options = {}) {
    const rng = options.rng ?? Math.random;
    const cycle = [];
    for (const entry of entries) {
        if (!Number.isInteger(entry.count) || entry.count <= 0) {
            throw new Error(`createShuffleBag: count must be a positive integer, got ${entry.count}`);
        }
        for (let i = 0; i < entry.count; i++)
            cycle.push(entry.value);
    }
    if (cycle.length === 0)
        throw new Error('createShuffleBag: entries must not be empty');
    const bag = [];
    const refill = () => {
        bag.length = 0;
        bag.push(...cycle);
        // Fisher–Yates. `sort(() => rng() - 0.5)` — the shuffle an LLM reaches for
        // first — is measurably biased under every engine's sort, which quietly
        // un-randomises exactly the distribution the bag exists to guarantee.
        for (let i = bag.length - 1; i > 0; i--) {
            const j = Math.floor(rng() * (i + 1));
            const swap = bag[i];
            bag[i] = bag[j];
            bag[j] = swap;
        }
    };
    return {
        draw() {
            if (bag.length === 0)
                refill();
            return bag.pop();
        },
        get remaining() {
            return bag.length;
        },
        size: cycle.length,
        reset() {
            bag.length = 0;
        },
    };
}
/**
 * A rare event with a guaranteed ceiling: independent rolls, but the Nth
 * attempt after a hit always hits.
 *
 * The shuffle bag is the wrong tool for the genuinely rare — a 1-in-50 drop
 * means a 50-item bag, and the guarantee it offers ("exactly one per 50") is
 * more rigid than a drop wants to feel. The pity timer keeps every roll
 * independent and honest, and only intervenes at the tail: the player who
 * would have gone 80 drops dry is the one player it touches, and that player
 * was about to quit.
 */
export function createPityTimer(options) {
    const { chance, guaranteedBy } = options;
    const rng = options.rng ?? Math.random;
    if (!(chance >= 0 && chance <= 1)) {
        throw new Error(`createPityTimer: chance must be in 0..1, got ${chance}`);
    }
    if (!Number.isInteger(guaranteedBy) || guaranteedBy <= 0) {
        throw new Error(`createPityTimer: guaranteedBy must be a positive integer, got ${guaranteedBy}`);
    }
    let misses = 0;
    return {
        roll() {
            const hit = misses + 1 >= guaranteedBy || rng() < chance;
            misses = hit ? 0 : misses + 1;
            return hit;
        },
        get misses() {
            return misses;
        },
        reset() {
            misses = 0;
        },
    };
}
/**
 * A probability that climbs with every miss and resets on a hit — the
 * pseudo-random distribution behind "25%" crits in Dota and Warcraft 3.
 *
 * Softer than the pity timer: there is no hard ceiling, just pressure toward
 * the mean from both sides. Streaks of misses get rapidly less likely, and
 * back-to-back hits do too, because a hit drops the odds back to `start`.
 * `start: 0.05, step: 0.1` feels like roughly a fifth and never insults the
 * player with an eight-miss run.
 */
export function createEscalatingChance(options) {
    const { start, step } = options;
    const rng = options.rng ?? Math.random;
    if (!(start >= 0 && start <= 1)) {
        throw new Error(`createEscalatingChance: start must be in 0..1, got ${start}`);
    }
    if (!(step > 0))
        throw new Error(`createEscalatingChance: step must be > 0, got ${step}`);
    let chance = start;
    return {
        roll() {
            const hit = rng() < chance;
            chance = hit ? start : Math.min(chance + step, 1);
            return hit;
        },
        get chance() {
            return chance;
        },
        reset() {
            chance = start;
        },
    };
}
/**
 * mulberry32: a seeded drop-in for `Math.random`, returning [0, 1).
 *
 * Not cryptographic and not meant to be — it exists so a sequence can be
 * replayed. Same seed, same sequence, on every engine, which is what makes a
 * shuffle bag assertable in a unit test and a daily challenge identical for
 * every player who types the same date.
 */
export function seededRandom(seed) {
    let state = seed >>> 0;
    return () => {
        state = (state + 0x6d2b79f5) >>> 0;
        let t = state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
