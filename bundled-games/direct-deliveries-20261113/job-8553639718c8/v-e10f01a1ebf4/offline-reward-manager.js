export const OFFLINE_REWARD_CONFIG = Object.freeze({
  maxAccumulationMs: 8 * 60 * 60 * 1000,
  minimumAwayMs: 30 * 60 * 1000,
  baseXp: 3,
  bonusXpPerHour: 2,
  maxXp: 18,
  firstMaterialAfterMs: 30 * 60 * 1000,
  extraMaterialEveryMs: 3 * 60 * 60 * 1000,
  maxDistinctMaterials: 3,
});

export class OfflineRewardManager {
  constructor(config = OFFLINE_REWARD_CONFIG) {
    this.config = config;
  }

  sanitize(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const xp = Math.max(0, Math.min(this.config.maxXp, Math.floor(Number(raw.xp) || 0)));
    const items = Array.isArray(raw.items)
      ? raw.items.filter((item) => item && typeof item.id === 'string')
        .slice(0, this.config.maxDistinctMaterials)
        .map((item) => ({ id: item.id.slice(0, 80), quantity: Math.max(1, Math.min(2, Math.floor(Number(item.quantity) || 1))) }))
      : [];
    const elapsedMs = Math.max(0, Math.min(this.config.maxAccumulationMs, Math.floor(Number(raw.elapsedMs) || 0)));
    return xp || items.length ? { elapsedMs, xp, items } : null;
  }

  collect(world, eligibleMaterialIds, now = Date.now()) {
    const lastActiveAt = Number(world.lastActiveAt || world.offlineRewardTimestamp) || now;
    const elapsedMs = Math.max(0, now - lastActiveAt);
    world.offlineRewardTimestamp = now;
    world.lastActiveAt = now;
    if (elapsedMs < this.config.minimumAwayMs) return null;

    const cappedElapsed = Math.min(elapsedMs, this.config.maxAccumulationMs);
    const xp = Math.min(this.config.maxXp, this.config.baseXp + Math.floor(cappedElapsed / (60 * 60 * 1000)) * this.config.bonusXpPerHour);
    const materialCount = Math.min(
      this.config.maxDistinctMaterials,
      1 + Math.floor(Math.max(0, cappedElapsed - this.config.firstMaterialAfterMs) / this.config.extraMaterialEveryMs),
    );
    const candidates = [...new Set(eligibleMaterialIds)].filter((id) => typeof id === 'string');
    const items = [];
    if (candidates.length) {
      const start = Math.floor(now / this.config.minimumAwayMs) % candidates.length;
      for (let index = 0; index < Math.min(materialCount, candidates.length); index++) {
        items.push({ id: candidates[(start + index) % candidates.length], quantity: 1 });
      }
    }
    return this.sanitize({ elapsedMs: cappedElapsed, xp, items });
  }
}
