export function leaderboardRefusalReply(refusal) {
    return { accepted: false, reason: refusal.reason, code: refusal.code };
}
/** A host that predates refusal codes sends none; its refusal reads as `unavailable`. */
export function fromLeaderboardWriteReply(reply) {
    return reply.accepted
        ? { ok: true, score: reply.score, subscore: reply.subscore, numScore: reply.numScore }
        : { ok: false, code: reply.code ?? 'unavailable', reason: reply.reason };
}
const object = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);
const nullableString = (value) => value === null || typeof value === 'string';
const REFUSAL_CODES = {
    invalid: true,
    not_found: true,
    conflict: true,
    throttled: true,
    unavailable: true,
};
/** Accepts every host's reply: `rank` may be a number from a host that predates this one. */
export function isLeaderboardWriteReply(value) {
    if (!object(value))
        return false;
    if (value.accepted === false)
        return (typeof value.reason === 'string' &&
            (value.code === undefined || REFUSAL_CODES[value.code] === true));
    return (value.accepted === true &&
        [value.score, value.subscore, value.numScore].every(Number.isSafeInteger) &&
        (value.rank === null || Number.isSafeInteger(value.rank)));
}
export function isLeaderboardListResult(value) {
    if (!object(value) || !object(value.leaderboard) || !Array.isArray(value.records))
        return false;
    const info = value.leaderboard;
    return (typeof info.key === 'string' &&
        typeof info.name === 'string' &&
        (info.sortOrder === 'asc' || info.sortOrder === 'desc') &&
        ['best', 'set', 'incr', 'decr'].includes(String(info.operator)) &&
        (info.metadata === null || object(info.metadata)) &&
        (value.rankingUpdatedAt === undefined || nullableString(value.rankingUpdatedAt)) &&
        (value.ownerRank === undefined ||
            value.ownerRank === null ||
            Number.isSafeInteger(value.ownerRank)) &&
        value.records.every((row) => object(row) &&
            [row.rank, row.score, row.subscore].every(Number.isSafeInteger) &&
            nullableString(row.username) &&
            nullableString(row.imageUrl) &&
            typeof row.isOwner === 'boolean'));
}
/**
 * Each request `sdk.leaderboards` sends, the reply type that answers it, and
 * the guard that reply's `result` must pass (`null`, "no answer", always does).
 * Hosts and the SDK both route and validate replies from this table.
 */
export const LEADERBOARD_REPLIES = {
    leaderboard_record_write: {
        reply: 'leaderboard_write_result',
        isResult: isLeaderboardWriteReply,
    },
    leaderboard_records_list: { reply: 'leaderboard_records', isResult: isLeaderboardListResult },
};
/** Seven-day idempotency window; retain the complete ID when retrying an action. */
export const LEADERBOARD_RETRY_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
export function createLeaderboardSubmissionId(now = Date.now()) {
    const nonce = globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
    return `${now}:${nonce}`;
}
export function isCurrentLeaderboardSubmissionId(id, now) {
    const match = /^(\d{13}):[a-zA-Z0-9_-]{1,100}$/.exec(id);
    if (!match)
        return false;
    const age = now - Number(match[1]);
    return age >= -5 * 60 * 1000 && age <= LEADERBOARD_RETRY_WINDOW_MS;
}
