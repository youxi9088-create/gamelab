export const TICKET_CONFIG = Object.freeze({
  maxTicketStorage: 20,
  startingTickets: 3,
  passiveTicketIntervalMs: 5 * 60 * 1000,
  dailyActiveTicketCap: 20,
  testingMode: true,
  testingDailyActiveTicketCap: 200,
  expeditionRewardEvery: 3,
  activeRewards: Object.freeze({
    discovery: 1,
    crafting: 1,
    visit: 1,
    commerce: 1,
    expeditionMilestone: 2,
  }),
  transactionHistoryLimit: 40,
});

function localDayKey(timestamp) {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function nextLocalMidnight(timestamp) {
  const date = new Date(timestamp);
  date.setHours(24, 0, 0, 0);
  return date.getTime();
}

function wholeAmount(value) {
  return Math.max(0, Math.floor(Number(value) || 0));
}

export class TicketManager {
  constructor({ debug = false } = {}) {
    this.debug = Boolean(debug);
    this.transactions = [];
  }

  activeDailyCap() {
    return TICKET_CONFIG.testingMode
      ? TICKET_CONFIG.testingDailyActiveTicketCap
      : TICKET_CONFIG.dailyActiveTicketCap;
  }

  activeRewardAmount(event) {
    return wholeAmount(TICKET_CONFIG.activeRewards[event]);
  }

  expeditionRewardAmount(completedExpeditions) {
    const every = Math.max(1, wholeAmount(TICKET_CONFIG.expeditionRewardEvery));
    const completed = wholeAmount(completedExpeditions);
    return completed > 0 && completed % every === 0
      ? this.activeRewardAmount('expeditionMilestone')
      : 0;
  }

  createState(now = Date.now()) {
    return {
      tickets: TICKET_CONFIG.startingTickets,
      ticketUpdatedAt: now,
      activeTicketsEarnedToday: 0,
      activeTicketDay: localDayKey(now),
      dailyResetTimestamp: nextLocalMidnight(now),
    };
  }

  sanitizeWorld(world, raw = {}, now = Date.now()) {
    const defaults = this.createState(now);
    const balance = Number(raw.tickets);
    const updatedAt = Number(raw.ticketUpdatedAt);
    const activeEarned = Number(raw.activeTicketsEarnedToday);
    const activeCap = this.activeDailyCap();
    world.tickets = Number.isFinite(balance)
      ? Math.max(0, Math.min(TICKET_CONFIG.maxTicketStorage, Math.floor(balance)))
      : defaults.tickets;
    world.ticketUpdatedAt = Number.isFinite(updatedAt) && updatedAt > 0 ? updatedAt : now;
    world.activeTicketDay = typeof raw.activeTicketDay === 'string' ? raw.activeTicketDay : defaults.activeTicketDay;
    world.activeTicketsEarnedToday = Number.isFinite(activeEarned)
      ? Math.max(0, Math.min(activeCap, Math.floor(activeEarned)))
      : 0;
    world.dailyResetTimestamp = Number.isFinite(Number(raw.dailyResetTimestamp)) && Number(raw.dailyResetTimestamp) > 0
      ? Number(raw.dailyResetTimestamp)
      : defaults.dailyResetTimestamp;
    return world;
  }

  recordTransaction(type, amount, previousBalance, newBalance, source, timestamp) {
    const transaction = {
      type,
      amount,
      previousBalance,
      newBalance,
      timestamp,
      source: String(source || 'gameplay').slice(0, 80),
    };
    this.transactions.push(transaction);
    if (this.transactions.length > TICKET_CONFIG.transactionHistoryLimit) this.transactions.shift();
    if (this.debug) console.debug('[Pocketwild ticket transaction]', transaction);
    return transaction;
  }

  latestTransaction() {
    return this.transactions.at(-1) || null;
  }

  syncDailyState(world, now = Date.now()) {
    const day = localDayKey(now);
    if (world.activeTicketDay !== day) {
      world.activeTicketDay = day;
      world.activeTicketsEarnedToday = 0;
    }
    world.dailyResetTimestamp = nextLocalMidnight(now);
  }

  refresh(world, now = Date.now()) {
    this.syncDailyState(world, now);
    const cap = TICKET_CONFIG.maxTicketStorage;
    world.tickets = Math.max(0, Math.min(cap, Math.floor(Number(world.tickets) || 0)));
    if (world.tickets >= cap) {
      // Full storage discards passive time; spending from full starts a fresh interval.
      world.ticketUpdatedAt = now;
      return 0;
    }

    const savedTimestamp = Number(world.ticketUpdatedAt);
    const previousTimestamp = Number.isFinite(savedTimestamp) && savedTimestamp > 0 ? savedTimestamp : now;
    const elapsed = Math.max(0, now - previousTimestamp);
    const earned = Math.floor(elapsed / TICKET_CONFIG.passiveTicketIntervalMs);
    if (earned <= 0) return 0;

    const before = world.tickets;
    world.tickets = Math.min(cap, world.tickets + earned);
    const granted = world.tickets - before;
    // Preserve only unspent partial time below capacity; never bank time at capacity.
    world.ticketUpdatedAt = world.tickets >= cap
      ? now
      : previousTimestamp + earned * TICKET_CONFIG.passiveTicketIntervalMs;
    if (granted > 0) this.recordTransaction('PASSIVE_REGEN', granted, before, world.tickets, 'timer', now);
    return granted;
  }

  spend(world, amount = 1, { now = Date.now(), source = 'gameplay' } = {}) {
    this.refresh(world, now);
    const cost = wholeAmount(amount);
    if (!cost || world.tickets < cost) return false;
    const before = world.tickets;
    world.tickets -= cost;
    this.recordTransaction('SPEND', -cost, before, world.tickets, source, now);
    return true;
  }

  canAwardActive(world, amount = 1, now = Date.now()) {
    this.refresh(world, now);
    const requested = wholeAmount(amount);
    const allowance = Math.max(0, this.activeDailyCap() - world.activeTicketsEarnedToday);
    const room = Math.max(0, TICKET_CONFIG.maxTicketStorage - world.tickets);
    return Math.min(requested, allowance, room);
  }

  awardActive(world, amount = 1, { now = Date.now(), requireFull = false, source = 'gameplay' } = {}) {
    const requested = wholeAmount(amount);
    if (!requested) return { granted: 0, requested: 0, blockedBy: null };
    const available = this.canAwardActive(world, requested, now);
    const allowanceBefore = Math.max(0, this.activeDailyCap() - world.activeTicketsEarnedToday);
    const roomBefore = Math.max(0, TICKET_CONFIG.maxTicketStorage - world.tickets);
    const blockedBy = allowanceBefore < requested && allowanceBefore <= roomBefore
      ? 'daily-cap'
      : roomBefore < requested ? 'storage' : null;
    if (requireFull && available < requested) {
      return { granted: 0, requested, blockedBy: blockedBy || 'unavailable' };
    }
    if (available > 0) {
      const before = world.tickets;
      world.tickets += available;
      world.activeTicketsEarnedToday += available;
      if (world.tickets >= TICKET_CONFIG.maxTicketStorage) world.ticketUpdatedAt = now;
      this.recordTransaction('ACTIVE_REWARD', available, before, world.tickets, source, now);
    }
    return {
      granted: available,
      requested,
      blockedBy: available < requested ? blockedBy || 'daily-cap' : null,
    };
  }

  debugSetBalance(world, balance, { now = Date.now(), source = 'debug control' } = {}) {
    const before = Math.max(0, Math.min(TICKET_CONFIG.maxTicketStorage, wholeAmount(world.tickets)));
    const next = Math.max(0, Math.min(TICKET_CONFIG.maxTicketStorage, wholeAmount(balance)));
    world.tickets = next;
    world.ticketUpdatedAt = now;
    if (next !== before) {
      this.recordTransaction('DEBUG_ADJUST', next - before, before, next, source, now);
    }
    return next;
  }

  resetRegenerationTimer(world, now = Date.now()) {
    world.ticketUpdatedAt = now;
  }

  nextTicketAt(world, now = Date.now()) {
    this.refresh(world, now);
    if (world.tickets >= TICKET_CONFIG.maxTicketStorage) return null;
    const updatedAt = Number(world.ticketUpdatedAt);
    return (Number.isFinite(updatedAt) && updatedAt > 0 ? updatedAt : now) + TICKET_CONFIG.passiveTicketIntervalMs;
  }

  dailyAllowance(world, now = Date.now()) {
    this.syncDailyState(world, now);
    return Math.max(0, this.activeDailyCap() - world.activeTicketsEarnedToday);
  }
}

export function runTicketManagerChecks() {
  const manager = new TicketManager();
  const now = 1_700_000_000_000;
  const checks = [];
  const test = (name, run) => {
    try {
      run();
      checks.push({ name, passed: true });
    } catch (error) {
      checks.push({ name, passed: false, error: error?.message || String(error) });
    }
  };
  const assert = (condition, message) => {
    if (!condition) throw new Error(message);
  };

  test('Spend from full starts a real five-minute interval', () => {
    const world = manager.createState(now);
    world.tickets = TICKET_CONFIG.maxTicketStorage;
    world.ticketUpdatedAt = now - 24 * 60 * 60 * 1000;
    assert(manager.spend(world, 1, { now, source: 'acceptance test' }), 'A ticket should be spendable.');
    assert(world.tickets === 19 && world.ticketUpdatedAt === now, '20 → 19 should anchor regeneration at spend time.');
    assert(manager.refresh(world, now + TICKET_CONFIG.passiveTicketIntervalMs - 1) === 0 && world.tickets === 19, 'No ticket should return before five full minutes.');
    assert(manager.refresh(world, now + TICKET_CONFIG.passiveTicketIntervalMs) === 1 && world.tickets === 20, 'One ticket should return after five full minutes.');
  });

  test('Full capacity never banks a regeneration backlog', () => {
    const world = manager.createState(now);
    world.tickets = TICKET_CONFIG.maxTicketStorage;
    world.ticketUpdatedAt = now - 10 * TICKET_CONFIG.passiveTicketIntervalMs;
    manager.refresh(world, now);
    assert(world.ticketUpdatedAt === now, 'Full storage should discard old regeneration time.');
    assert(manager.spend(world, 1, { now, source: 'acceptance test' }), 'A full pouch should allow a spend.');
    assert(manager.refresh(world, now + TICKET_CONFIG.passiveTicketIntervalMs - 1) === 0 && world.tickets === 19, 'A full-pouch backlog must not refill a new spend.');
  });

  test('Repeated spends can reach 17 tickets', () => {
    const world = manager.createState(now);
    world.tickets = TICKET_CONFIG.maxTicketStorage;
    assert(manager.spend(world, 1, { now, source: 'acceptance test' }), 'First spend failed.');
    assert(manager.spend(world, 1, { now, source: 'acceptance test' }), 'Second spend failed.');
    assert(manager.spend(world, 1, { now, source: 'acceptance test' }), 'Third spend failed.');
    assert(world.tickets === 17, 'Three spends at the same time should leave 17 tickets.');
  });

  test('Active reward is separate from passive regeneration', () => {
    const world = manager.createState(now);
    world.tickets = 17;
    const anchor = now - 60_000;
    world.ticketUpdatedAt = anchor;
    const result = manager.awardActive(world, 1, { now, source: 'acceptance discovery' });
    assert(result.granted === 1 && world.tickets === 18, 'An active +1 reward should grant exactly one ticket.');
    assert(world.ticketUpdatedAt === anchor, 'An active reward below capacity must not alter the passive timer.');
  });

  test('Ticket balance remains capped at 20', () => {
    const world = manager.createState(now);
    world.tickets = 20;
    manager.refresh(world, now + 60 * TICKET_CONFIG.passiveTicketIntervalMs);
    const reward = manager.awardActive(world, 5, { now: now + 60 * TICKET_CONFIG.passiveTicketIntervalMs, source: 'acceptance cap check' });
    assert(world.tickets === 20 && reward.granted === 0, 'Passive or active tickets must not exceed the storage cap.');
  });

  test('Immediate save/load preserves a spent balance and timestamp', () => {
    const world = manager.createState(now);
    world.tickets = 20;
    assert(manager.spend(world, 1, { now, source: 'acceptance test' }), 'Spend failed.');
    const loaded = manager.sanitizeWorld({}, JSON.parse(JSON.stringify(world)), now + 1);
    assert(loaded.tickets === 19 && loaded.ticketUpdatedAt === now, 'Reload should preserve 19 tickets and the spend anchor.');
    assert(manager.refresh(loaded, now + 1) === 0 && loaded.tickets === 19, 'Reload must not award a ticket early.');
  });

  test('Existing saved balance is preserved instead of reset to full', () => {
    const saved = { tickets: 7, ticketUpdatedAt: now - 30_000, activeTicketsEarnedToday: 4 };
    const loaded = manager.sanitizeWorld({}, saved, now);
    assert(loaded.tickets === 7 && loaded.ticketUpdatedAt === saved.ticketUpdatedAt, 'Existing ticket state should remain intact.');
  });

  test('Long elapsed time grants full intervals and caps at 20', () => {
    const world = manager.createState(now);
    world.tickets = 15;
    world.ticketUpdatedAt = now - 14 * TICKET_CONFIG.passiveTicketIntervalMs;
    const granted = manager.refresh(world, now);
    assert(granted === 5 && world.tickets === 20, 'Elapsed intervals should be awarded, capped at storage maximum.');
    assert(world.ticketUpdatedAt === now, 'A capped regeneration should clear leftover time.');
  });

  return { passed: checks.every((entry) => entry.passed), checks };
}
