import { ECONOMY_CONFIG } from './economy-data.js';
const FIREBASE_VERSION = '11.10.0';
const MAX_HISTORY = 40;
const MAX_STACK = 999999;
const DAY_MS = 86400000;
function copy(value) {
  return JSON.parse(JSON.stringify(value));
}
function integer(value, minimum = 0, maximum = Number.MAX_SAFE_INTEGER) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(minimum, Math.min(maximum, Math.floor(parsed))) : minimum;
}
function timestampMillis(value) {
  return value?.toMillis?.() || integer(value);
}
function pairKey(first, second) {
  return [String(first), String(second)].sort().join('_');
}
function safeText(value, maximum = 80) {
  return String(value || '').trim().slice(0, maximum);
}
function saveWorld(game) {
  if (!game || typeof game !== 'object' || !game.world || typeof game.world !== 'object') {
    throw new Error('Your cloud save is not ready for a market transaction.');
  }
  return game.world;
}
function recordMarketEvent(world, event) {
  const history = Array.isArray(world.marketHistory) ? world.marketHistory : [];
  history.unshift({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: safeText(event.type, 24),
    title: safeText(event.title, 100),
    itemId: safeText(event.itemId, 48),
    quantity: integer(event.quantity, 0, MAX_STACK),
    gold: integer(event.gold, 0, 999999999),
    at: Date.now()
  });
  world.marketHistory = history.slice(0, MAX_HISTORY);
}
function plainSaveRecord(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error('Your cloud save could not be read. Nothing was taken from your bag.');
  }
  const hasLegacyEnvelope = raw.data && typeof raw.data === 'object' && !Array.isArray(raw.data);
  const game = hasLegacyEnvelope ? copy(raw.data) : Object.fromEntries(Object.entries(raw).filter(([key]) => !['saveVersion', 'revision', 'lastUpdated', 'lastSynced', 'userId', 'playerId'].includes(key)));
  if (!game || typeof game !== 'object' || Array.isArray(game)) {
    throw new Error('Your cloud save could not be read. Nothing was taken from your bag.');
  }
  return {
    saveVersion: integer(raw.saveVersion, 1, 10),
    revision: integer(raw.revision),
    lastUpdated: integer(raw.lastUpdated),
    lastSynced: integer(raw.lastSynced),
    userId: raw.userId,
    game
  };
}
function makeCloudRecord(record, game) {
  const now = Date.now();
  return {
    ...copy(game),
    saveVersion: 1,
    revision: record.revision + 1,
    lastUpdated: Math.max(now, record.lastUpdated + 1),
    lastSynced: now,
    userId: record.userId
  };
}
function normalizeOffer(raw) {
  const itemId = safeText(raw?.itemId, 48);
  const quantity = integer(raw?.quantity, 0, MAX_STACK);
  const gold = integer(raw?.gold, 0, 999999999);
  if ((!itemId || quantity < 1) && gold < 1) throw new Error('Offer at least one discovered item or a little Gold.');
  if (Boolean(itemId) !== quantity > 0) throw new Error('Choose an item and quantity together, or leave both empty.');
  return {
    itemId: itemId || null,
    quantity,
    gold
  };
}
export class PocketwildMarketplace {
  constructor({
    config = null,
    getUser = () => null,
    getCloudReady = () => true,
    getItem = () => null,
    flushSave = async () => {},
    onSaveChanged = () => {},
    getPlayerName = () => 'Wanderer'
  } = {}) {
    this.config = null;
    this.getUser = getUser;
    this.getCloudReady = getCloudReady;
    this.getItem = getItem;
    this.flushSave = flushSave;
    this.onSaveChanged = onSaveChanged;
    this.getPlayerName = getPlayerName;
    this.sdk = null;
    this.auth = null;
    this.db = null;
    this.initPromise = null;
  }
  async initialize() {
    throw new Error("Online social and trading are retired in this local edition. Original local NPC play remains available.");
  }
  async requireUser() {
    const uid = this.getUser()?.uid;
    if (!uid) throw new Error('Sign in to browse listings and meet other players. Guest play stays available.');
    if (!this.getCloudReady()) throw new Error('Your account cloud save is not ready, so market transfers are paused.');
    await this.initialize();
    if (this.auth.currentUser?.uid !== uid) throw new Error('Your account session changed. Reopen the market before trading.');
    return uid;
  }
  async readyForMutation() {
    const uid = await this.requireUser();
    await this.flushSave();
    return uid;
  }
  ref(path, ...parts) {
    return this.sdk.doc(this.db, path, ...parts);
  }
  async readSave(transaction, uid) {
    const ref = this.ref('players', uid);
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists()) throw new Error('A verified cloud save is required before a market transfer.');
    const record = plainSaveRecord(snapshot.data());
    if (record.userId !== uid) throw new Error('This save belongs to a different account.');
    return {
      ref,
      record
    };
  }
  writeSave(transaction, uid, ref, record, game) {
    const envelope = makeCloudRecord(record, game);
    transaction.set(ref, envelope);
    return envelope;
  }
  publishSave(envelope) {
    this.onSaveChanged(envelope);
  }
  item(itemId) {
    const item = this.getItem(itemId);
    if (!item) throw new Error('That item is not part of Pocketwild’s collection.');
    return item;
  }
  assertDiscovered(world, itemId) {
    if (!Array.isArray(world.collection) || !world.collection.includes(itemId)) {
      throw new Error('Discover this find on an outing before buying or trading it. The market cannot write new pages in your journal.');
    }
  }
  assertStack(world, itemId, amount) {
    const current = integer(world.inventory?.[itemId], 0, MAX_STACK);
    if (current < amount) throw new Error('Those pieces are no longer in your bag. Refresh and check your inventory.');
  }
  assertGold(world, amount) {
    if (integer(world.gold, 0, 999999999) < amount) throw new Error('There is not quite enough Gold in your pocket.');
  }
  adjustInventory(world, itemId, delta) {
    const current = integer(world.inventory?.[itemId], 0, MAX_STACK);
    const next = current + delta;
    if (next < 0 || next > MAX_STACK) throw new Error('That item stack changed. Refresh your bag and try again.');
    world.inventory ||= {};
    if (next === 0) delete world.inventory[itemId];else world.inventory[itemId] = next;
  }
  appendHistory(world, event) {
    recordMarketEvent(world, event);
  }
  async browse() {
    const uid = await this.requireUser();
    const {
      collection,
      getDocs,
      limit,
      query,
      where
    } = this.sdk;
    const [listingSnapshot, tradeSnapshot, blockSnapshot] = await Promise.all([getDocs(query(collection(this.db, 'marketListings'), where('state', '==', 'open'), limit(100))), getDocs(query(collection(this.db, 'marketTrades'), where('memberIds', 'array-contains', uid), limit(60))), getDocs(collection(this.db, 'marketBlocks', uid, 'players'))]);
    const blocked = new Set(blockSnapshot.docs.map(entry => entry.id));
    const blockedBy = new Set();
    for (const entry of blockSnapshot.docs) {
      if (entry.data().blockedUid) blockedBy.add(entry.data().blockedUid);
    }
    const now = Date.now();
    const listings = listingSnapshot.docs.map(entry => ({
      id: entry.id,
      ...entry.data()
    })).filter(listing => listing.sellerUid !== uid && !blocked.has(listing.sellerUid) && !blockedBy.has(listing.sellerUid)).map(listing => ({
      ...listing,
      expiresAtMs: listing.expiresAt?.toMillis?.() || Number(listing.expiresAtMs) || 0,
      endsAtMs: listing.endsAt?.toMillis?.() || Number(listing.endsAtMs) || 0
    })).filter(listing => listing.kind === 'auction' ? listing.endsAtMs > now || listing.highestBidderUid === uid : listing.expiresAtMs > now);
    const trades = tradeSnapshot.docs.map(entry => ({
      id: entry.id,
      ...entry.data()
    })).map(trade => ({
      ...trade,
      blocked: trade.memberIds.some(member => member !== uid && (blocked.has(member) || blockedBy.has(member)))
    }));
    const dailyCounts = await this.dailyUsage([...new Set(listings.filter(entry => entry.kind === 'fixed').map(entry => entry.itemId))]);
    return {
      listings,
      trades,
      blocked: [...blocked],
      dailyCounts
    };
  }
  async dailyUsage(itemIds) {
    const uid = await this.requireUser();
    const uniqueIds = [...new Set((itemIds || []).filter(id => typeof id === 'string' && id))].slice(0, 40);
    const {
      doc,
      getDoc
    } = this.sdk;
    const values = await Promise.all(uniqueIds.map(async itemId => {
      const snapshot = await getDoc(doc(this.db, 'marketDaily', uid, 'items', itemId));
      const data = snapshot.exists() ? snapshot.data() : null;
      const active = data && timestampMillis(data.windowStartedAt) + DAY_MS > Date.now();
      return [itemId, active ? integer(data.count, 0, 1000) : 0];
    }));
    return Object.fromEntries(values);
  }
  async myProceeds() {
    const uid = await this.requireUser();
    const {
      collection,
      getDocs,
      limit,
      query
    } = this.sdk;
    const result = await getDocs(query(collection(this.db, 'marketProceeds', uid, 'entries'), limit(50)));
    return result.docs.map(entry => ({
      id: entry.id,
      ...entry.data()
    })).sort((a, b) => Number(b.updatedAt || 0) - Number(a.updatedAt || 0));
  }
  async myBidHolds() {
    const uid = await this.requireUser();
    const {
      collection,
      doc,
      getDoc,
      getDocs,
      limit,
      query
    } = this.sdk;
    const result = await getDocs(query(collection(this.db, 'marketBidHolds', uid, 'entries'), limit(50)));
    return Promise.all(result.docs.map(async entry => {
      const hold = {
        id: entry.id,
        ...entry.data()
      };
      const listing = await getDoc(doc(this.db, 'marketListings', hold.id));
      return listing.exists() ? {
        ...hold,
        listing: {
          id: listing.id,
          ...listing.data(),
          endsAtMs: listing.data().endsAt?.toMillis?.() || 0
        }
      } : hold;
    }));
  }
  async myListings() {
    const uid = await this.requireUser();
    const {
      collection,
      getDocs,
      limit,
      query,
      where
    } = this.sdk;
    const result = await getDocs(query(collection(this.db, 'marketListings'), where('sellerUid', '==', uid), limit(60)));
    return result.docs.map(entry => ({
      id: entry.id,
      ...entry.data()
    })).map(listing => ({
      ...listing,
      expiresAtMs: listing.expiresAt?.toMillis?.() || 0,
      endsAtMs: listing.endsAt?.toMillis?.() || 0
    })).sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));
  }
  async createFixedListing({
    itemId,
    quantity,
    unitPrice,
    durationMs = DAY_MS
  }) {
    const uid = await this.readyForMutation();
    const item = this.item(itemId);
    const amount = integer(quantity, 1, 99);
    const price = integer(unitPrice, 1, 999999);
    const duration = integer(durationMs, 3600000, 7 * DAY_MS);
    if (!item.expansion?.marketplaceEligible || !item.expansion?.tradeEligible) throw new Error('That find belongs in your journal, not the marketplace.');
    const commonRaw = item.rarity === 'Common' && ECONOMY_CONFIG.marketplace.commonRawItemIds.includes(itemId);
    const uncommonRaw = item.rarity === 'Uncommon' && ['Materials', 'Fungi'].includes(item.category);
    if (!commonRaw && !uncommonRaw) {
      throw new Error('Instant shelves are for discovered common and uncommon raw materials. List rarer finds as an auction.');
    }
    const {
      collection,
      doc,
      runTransaction
    } = this.sdk;
    const listingRef = doc(collection(this.db, 'marketListings'));
    const result = await runTransaction(this.db, async transaction => {
      const {
        ref: saveRef,
        record
      } = await this.readSave(transaction, uid);
      const game = record.game;
      const world = saveWorld(game);
      this.assertDiscovered(world, itemId);
      this.assertStack(world, itemId, amount);
      this.adjustInventory(world, itemId, -amount);
      this.appendHistory(world, {
        type: 'listed',
        title: `Listed ${item.name} on the instant shelf`,
        itemId,
        quantity: amount,
        gold: price
      });
      const now = Date.now();
      transaction.set(listingRef, {
        sellerUid: uid,
        sellerName: safeText(this.getPlayerName(), 16) || 'Wanderer',
        kind: 'fixed',
        state: 'open',
        itemId,
        itemName: item.name,
        emoji: item.emoji,
        rarity: item.rarity,
        category: item.category,
        quantity: amount,
        remainingQuantity: amount,
        unitPrice: price,
        currency: 'gold',
        createdAt: now,
        expiresAt: this.sdk.Timestamp.fromMillis(now + duration)
      });
      return this.writeSave(transaction, uid, saveRef, record, game);
    });
    this.publishSave(result);
    return true;
  }
  async createAuction({
    itemId,
    quantity = 1,
    startingBid,
    durationMs = 86400000
  }) {
    const uid = await this.readyForMutation();
    const item = this.item(itemId);
    const amount = integer(quantity, 1, 20);
    const start = integer(startingBid, 1, 999999999);
    const duration = integer(durationMs, 3600000, 7 * DAY_MS);
    if (!item.expansion?.marketplaceEligible || !item.expansion?.tradeEligible) throw new Error('That find cannot be listed for trade.');
    if (!ECONOMY_CONFIG.marketplace.auctionRarities.includes(item.rarity)) throw new Error('Auctions are for discovered rare and high-value finds.');
    const {
      collection,
      doc,
      runTransaction
    } = this.sdk;
    const listingRef = doc(collection(this.db, 'marketListings'));
    const result = await runTransaction(this.db, async transaction => {
      const {
        ref: saveRef,
        record
      } = await this.readSave(transaction, uid);
      const game = record.game;
      const world = saveWorld(game);
      this.assertDiscovered(world, itemId);
      this.assertStack(world, itemId, amount);
      this.adjustInventory(world, itemId, -amount);
      this.appendHistory(world, {
        type: 'auction',
        title: `Started an auction for ${item.name}`,
        itemId,
        quantity: amount,
        gold: start
      });
      const now = Date.now();
      transaction.set(listingRef, {
        sellerUid: uid,
        sellerName: safeText(this.getPlayerName(), 16) || 'Wanderer',
        kind: 'auction',
        state: 'open',
        itemId,
        itemName: item.name,
        emoji: item.emoji,
        rarity: item.rarity,
        category: item.category,
        quantity: amount,
        remainingQuantity: amount,
        startingBid: start,
        highestBid: 0,
        highestBidderUid: null,
        highestBidderName: null,
        currency: 'gold',
        createdAt: now,
        endsAt: this.sdk.Timestamp.fromMillis(now + duration)
      });
      return this.writeSave(transaction, uid, saveRef, record, game);
    });
    this.publishSave(result);
    return true;
  }
  async buyFixedListing(listingId, quantity = 1) {
    const uid = await this.readyForMutation();
    const amount = integer(quantity, 1, 99);
    const {
      collection,
      doc,
      runTransaction
    } = this.sdk;
    const listingRef = doc(this.db, 'marketListings', listingId);
    const result = await runTransaction(this.db, async transaction => {
      const listingSnapshot = await transaction.get(listingRef);
      if (!listingSnapshot.exists()) throw new Error('That shelf has already gone quiet.');
      const listing = listingSnapshot.data();
      const now = Date.now();
      if (listing.kind !== 'fixed' || listing.state !== 'open' || !listing.sellerUid || listing.sellerUid === uid || listing.expiresAt?.toMillis?.() <= now) throw new Error('This listing is no longer available.');
      const [ownBlock, sellerBlock] = await Promise.all([transaction.get(doc(this.db, 'marketBlocks', uid, 'players', listing.sellerUid)), transaction.get(doc(this.db, 'marketBlocks', listing.sellerUid, 'players', uid))]);
      if (ownBlock.exists() || sellerBlock.exists()) throw new Error('A block is in place, so this listing cannot be purchased.');
      if (amount > integer(listing.remainingQuantity, 0, 99)) throw new Error('There are not that many pieces left on this shelf.');
      const item = this.item(listing.itemId);
      const isCommonRaw = item.rarity === 'Common' && ECONOMY_CONFIG.marketplace.commonRawItemIds.includes(listing.itemId);
      const isUncommonRaw = item.rarity === 'Uncommon' && ['Materials', 'Fungi'].includes(item.category);
      const unitCap = isCommonRaw ? ECONOMY_CONFIG.marketplace.dailyInstantBuyLimits.Common : isUncommonRaw ? ECONOMY_CONFIG.marketplace.dailyInstantBuyLimits.Uncommon : 0;
      if (!unitCap) throw new Error('Only common and uncommon raw finds use instant purchases.');
      const dailyRef = doc(this.db, 'marketDaily', uid, 'items', listing.itemId);
      const saleId = `${listingId}_${uid}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const proceedsRef = doc(this.db, 'marketProceeds', listing.sellerUid, 'entries', saleId);
      const [{
        ref: saveRef,
        record
      }, dailySnapshot] = await Promise.all([this.readSave(transaction, uid), transaction.get(dailyRef)]);
      const game = record.game;
      const world = saveWorld(game);
      this.assertDiscovered(world, listing.itemId);
      const dayNow = Date.now();
      const currentWindow = dailySnapshot.exists() ? dailySnapshot.data() : null;
      const freshWindow = !currentWindow || timestampMillis(currentWindow.windowStartedAt) + DAY_MS <= dayNow;
      const priorCount = freshWindow ? 0 : integer(currentWindow.count, 0, 1000);
      if (priorCount + amount > unitCap) {
        const remaining = Math.max(0, unitCap - priorCount);
        throw new Error(`Daily shelf limit: ${remaining} ${item.name}${remaining === 1 ? '' : 's'} left in this 24-hour window.`);
      }
      const price = integer(listing.unitPrice, 1, 999999) * amount;
      this.assertGold(world, price);
      if (integer(world.inventory?.[listing.itemId], 0, MAX_STACK) + amount > MAX_STACK) throw new Error('Your bag is too full for that many pieces.');
      world.gold = integer(world.gold, 0, 999999999) - price;
      this.adjustInventory(world, listing.itemId, amount);
      this.appendHistory(world, {
        type: 'purchase',
        title: `Bought ${item.name} from ${listing.sellerName || 'a player'}`,
        itemId: listing.itemId,
        quantity: amount,
        gold: price
      });
      const remaining = integer(listing.remainingQuantity, 0, 99) - amount;
      transaction.update(listingRef, {
        remainingQuantity: remaining,
        state: remaining === 0 ? 'sold' : 'open',
        lastBuyerUid: uid,
        lastSaleEntryId: saleId,
        updatedAt: dayNow
      });
      transaction.set(dailyRef, {
        buyerUid: uid,
        itemId: listing.itemId,
        lastListingId: listingId,
        lastPurchasedQuantity: amount,
        windowStartedAt: freshWindow ? this.sdk.Timestamp.fromMillis(dayNow) : currentWindow.windowStartedAt,
        count: priorCount + amount,
        updatedAt: dayNow
      });
      transaction.set(proceedsRef, {
        sellerUid: listing.sellerUid,
        listingId,
        currency: 'gold',
        amount: price,
        lastBuyerUid: uid,
        lastSaleAmount: price,
        updatedAt: dayNow
      });
      return this.writeSave(transaction, uid, saveRef, record, game);
    });
    this.publishSave(result);
    return true;
  }
  async placeBid(listingId, amount) {
    const uid = await this.readyForMutation();
    const bid = integer(amount, 1, 999999999);
    const {
      doc,
      runTransaction
    } = this.sdk;
    const listingRef = doc(this.db, 'marketListings', listingId);
    const holdRef = doc(this.db, 'marketBidHolds', uid, 'entries', listingId);
    const result = await runTransaction(this.db, async transaction => {
      const [listingSnapshot, holdSnapshot] = await Promise.all([transaction.get(listingRef), transaction.get(holdRef)]);
      if (!listingSnapshot.exists()) throw new Error('That auction has already ended.');
      const listing = listingSnapshot.data();
      const endAt = listing.endsAt?.toMillis?.() || 0;
      if (listing.kind !== 'auction' || listing.state !== 'open' || !listing.sellerUid || listing.sellerUid === uid || endAt <= Date.now()) throw new Error('Bidding is closed for this auction.');
      const [ownBlock, sellerBlock] = await Promise.all([transaction.get(doc(this.db, 'marketBlocks', uid, 'players', listing.sellerUid)), transaction.get(doc(this.db, 'marketBlocks', listing.sellerUid, 'players', uid))]);
      if (ownBlock.exists() || sellerBlock.exists()) throw new Error('A block is in place, so this auction cannot be bid on.');
      const item = this.item(listing.itemId);
      const topBid = integer(listing.highestBid, 0, 999999999);
      const startingBid = integer(listing.startingBid, 1, 999999999);
      const minimum = topBid > 0 ? topBid + Math.max(1, Math.ceil(topBid * 0.05)) : startingBid;
      if (bid < minimum) throw new Error(`The next bid needs to be at least ${minimum.toLocaleString()} Gold.`);
      const [{
        ref: saveRef,
        record
      }] = await Promise.all([this.readSave(transaction, uid)]);
      const game = record.game;
      const world = saveWorld(game);
      this.assertDiscovered(world, listing.itemId);
      const existingHold = holdSnapshot.exists() ? holdSnapshot.data() : null;
      const amountAlreadyHeld = integer(existingHold?.amount, 0, 999999999);
      const additionalGold = Math.max(0, bid - amountAlreadyHeld);
      this.assertGold(world, additionalGold);
      world.gold = integer(world.gold, 0, 999999999) - additionalGold;
      this.appendHistory(world, {
        type: 'bid',
        title: `Bid ${bid.toLocaleString()} Gold on ${item.name}`,
        itemId: listing.itemId,
        quantity: listing.quantity,
        gold: bid
      });
      const now = Date.now();
      transaction.update(listingRef, {
        highestBid: bid,
        highestBidderUid: uid,
        highestBidderName: safeText(this.getPlayerName(), 16) || 'Wanderer',
        updatedAt: now
      });
      transaction.set(holdRef, {
        bidderUid: uid,
        listingId,
        itemId: listing.itemId,
        amount: bid,
        updatedAt: now
      });
      return this.writeSave(transaction, uid, saveRef, record, game);
    });
    this.publishSave(result);
    return true;
  }
  async cancelListing(listingId) {
    const uid = await this.readyForMutation();
    const {
      doc,
      runTransaction
    } = this.sdk;
    const listingRef = doc(this.db, 'marketListings', listingId);
    const result = await runTransaction(this.db, async transaction => {
      const listingSnapshot = await transaction.get(listingRef);
      if (!listingSnapshot.exists()) throw new Error('That listing is already gone.');
      const listing = listingSnapshot.data();
      if (listing.sellerUid !== uid || listing.state !== 'open') throw new Error('Only an open listing of yours can be cancelled.');
      if (listing.kind === 'auction' && integer(listing.highestBid) > 0) throw new Error('An auction with a bid cannot be cancelled. Its closing bid is protected.');
      const {
        ref: saveRef,
        record
      } = await this.readSave(transaction, uid);
      const game = record.game;
      const world = saveWorld(game);
      const returned = integer(listing.remainingQuantity, 0, 99);
      if (returned && integer(world.inventory?.[listing.itemId], 0, MAX_STACK) + returned > MAX_STACK) throw new Error('Your bag has no room to return this listing yet.');
      if (returned) this.adjustInventory(world, listing.itemId, returned);
      this.appendHistory(world, {
        type: 'cancel',
        title: `Returned ${listing.itemName || 'your find'} from a listing`,
        itemId: listing.itemId,
        quantity: returned,
        gold: 0
      });
      transaction.update(listingRef, {
        state: 'cancelled',
        remainingQuantity: 0,
        cancelledAt: Date.now()
      });
      return this.writeSave(transaction, uid, saveRef, record, game);
    });
    this.publishSave(result);
    return true;
  }
  async claimProceeds(listingId) {
    const uid = await this.readyForMutation();
    const {
      doc,
      runTransaction
    } = this.sdk;
    const proceedsRef = doc(this.db, 'marketProceeds', uid, 'entries', listingId);
    const result = await runTransaction(this.db, async transaction => {
      const proceedsSnapshot = await transaction.get(proceedsRef);
      if (!proceedsSnapshot.exists()) throw new Error('There is no Gold waiting in this listing yet.');
      const proceeds = proceedsSnapshot.data();
      if (proceeds.sellerUid !== uid) throw new Error('Those sale proceeds belong to another player.');
      const amount = integer(proceeds.amount, 1, 999999999);
      const {
        ref: saveRef,
        record
      } = await this.readSave(transaction, uid);
      const game = record.game;
      const world = saveWorld(game);
      if (integer(world.gold, 0, 999999999) + amount > 999999999) throw new Error('Make room in your Gold pouch before collecting these proceeds.');
      world.gold = integer(world.gold, 0, 999999999) + amount;
      this.appendHistory(world, {
        type: 'sale',
        title: 'Collected player-market sale proceeds',
        itemId: '',
        quantity: 0,
        gold: amount
      });
      transaction.delete(proceedsRef);
      return this.writeSave(transaction, uid, saveRef, record, game);
    });
    this.publishSave(result);
    return true;
  }
  async claimBidRefund(listingId) {
    const uid = await this.readyForMutation();
    const {
      doc,
      runTransaction
    } = this.sdk;
    const holdRef = doc(this.db, 'marketBidHolds', uid, 'entries', listingId);
    const listingRef = doc(this.db, 'marketListings', listingId);
    const result = await runTransaction(this.db, async transaction => {
      const [holdSnapshot, listingSnapshot] = await Promise.all([transaction.get(holdRef), transaction.get(listingRef)]);
      if (!holdSnapshot.exists()) throw new Error('There is no Gold hold to return.');
      const hold = holdSnapshot.data();
      if (hold.bidderUid !== uid) throw new Error('That bid hold belongs to another player.');
      if (listingSnapshot.exists()) {
        const listing = listingSnapshot.data();
        if (listing.state === 'open' && listing.highestBidderUid === uid) throw new Error('Your bid is still leading. Its Gold stays safely held until the auction ends.');
      }
      const amount = integer(hold.amount, 1, 999999999);
      const {
        ref: saveRef,
        record
      } = await this.readSave(transaction, uid);
      const game = record.game;
      const world = saveWorld(game);
      if (integer(world.gold, 0, 999999999) + amount > 999999999) throw new Error('Make room in your Gold pouch before returning this bid.');
      world.gold = integer(world.gold, 0, 999999999) + amount;
      this.appendHistory(world, {
        type: 'refund',
        title: 'Returned an outbid auction hold',
        itemId: hold.itemId,
        quantity: 0,
        gold: amount
      });
      transaction.delete(holdRef);
      return this.writeSave(transaction, uid, saveRef, record, game);
    });
    this.publishSave(result);
    return true;
  }
  async claimAuctionWin(listingId) {
    const uid = await this.readyForMutation();
    const {
      doc,
      runTransaction
    } = this.sdk;
    const listingRef = doc(this.db, 'marketListings', listingId);
    const holdRef = doc(this.db, 'marketBidHolds', uid, 'entries', listingId);
    const result = await runTransaction(this.db, async transaction => {
      const [listingSnapshot, holdSnapshot] = await Promise.all([transaction.get(listingRef), transaction.get(holdRef)]);
      if (!listingSnapshot.exists() || !holdSnapshot.exists()) throw new Error('That auction win is no longer waiting for you.');
      const listing = listingSnapshot.data();
      const endsAt = listing.endsAt?.toMillis?.() || 0;
      if (listing.kind !== 'auction' || listing.state !== 'open' || listing.highestBidderUid !== uid || endsAt > Date.now()) throw new Error('The auction has not finished with your bid in the lead.');
      const hold = holdSnapshot.data();
      const bid = integer(listing.highestBid, 1, 999999999);
      if (hold.bidderUid !== uid || integer(hold.amount) !== bid) throw new Error('Your protected bid hold does not match this auction.');
      const item = this.item(listing.itemId);
      const proceedsRef = doc(this.db, 'marketProceeds', listing.sellerUid, 'entries', listingId);
      const {
        ref: saveRef,
        record
      } = await this.readSave(transaction, uid);
      const game = record.game;
      const world = saveWorld(game);
      this.assertDiscovered(world, listing.itemId);
      const quantity = integer(listing.quantity, 1, 20);
      if (integer(world.inventory?.[listing.itemId], 0, MAX_STACK) + quantity > MAX_STACK) throw new Error('Make room in your bag before claiming this auction find.');
      this.adjustInventory(world, listing.itemId, quantity);
      this.appendHistory(world, {
        type: 'auction-win',
        title: `Won ${item.name} at auction`,
        itemId: listing.itemId,
        quantity,
        gold: bid
      });
      const now = Date.now();
      transaction.update(listingRef, {
        state: 'sold',
        remainingQuantity: 0,
        settledAt: now
      });
      transaction.delete(holdRef);
      transaction.set(proceedsRef, {
        sellerUid: listing.sellerUid,
        listingId,
        currency: 'gold',
        amount: bid,
        lastBuyerUid: uid,
        lastSaleAmount: bid,
        auctionSale: true,
        updatedAt: now
      });
      return this.writeSave(transaction, uid, saveRef, record, game);
    });
    this.publishSave(result);
    return true;
  }
  async createTrade({
    friendUid,
    offer
  }) {
    const uid = await this.readyForMutation();
    if (!friendUid || friendUid === uid) throw new Error('Choose one of your Pocketwild friends.');
    const normalized = normalizeOffer(offer);
    const memberIds = [uid, friendUid].sort();
    const side = memberIds[0] === uid ? 'a' : 'b';
    const otherSide = side === 'a' ? 'b' : 'a';
    const {
      collection,
      doc,
      runTransaction
    } = this.sdk;
    const tradeRef = doc(collection(this.db, 'marketTrades'));
    const friendshipRef = doc(this.db, 'friendships', pairKey(uid, friendUid));
    const blockOwnRef = doc(this.db, 'marketBlocks', uid, 'players', friendUid);
    const blockOtherRef = doc(this.db, 'marketBlocks', friendUid, 'players', uid);
    const result = await runTransaction(this.db, async transaction => {
      const [friendship, blockOwn, blockOther] = await Promise.all([transaction.get(friendshipRef), transaction.get(blockOwnRef), transaction.get(blockOtherRef)]);
      if (!friendship.exists() || !(friendship.data().members || []).includes(uid) || !(friendship.data().members || []).includes(friendUid)) throw new Error('Player trades are only for accepted Pocketwild friends.');
      if (blockOwn.exists() || blockOther.exists()) throw new Error('A block is in place, so a new trade cannot be opened.');
      const {
        ref: saveRef,
        record
      } = await this.readSave(transaction, uid);
      const game = record.game;
      const world = saveWorld(game);
      this.validateTradeOffer(world, normalized);
      this.reserveOffer(world, normalized);
      this.appendHistory(world, {
        type: 'trade-offer',
        title: 'Opened a friend trade',
        itemId: normalized.itemId || '',
        quantity: normalized.quantity,
        gold: normalized.gold
      });
      const offers = {
        a: {
          itemId: null,
          quantity: 0,
          gold: 0
        },
        b: {
          itemId: null,
          quantity: 0,
          gold: 0
        }
      };
      offers[side] = normalized;
      transaction.set(tradeRef, {
        memberIds,
        memberNames: {
          [side]: safeText(this.getPlayerName(), 16) || 'Wanderer',
          [otherSide]: ''
        },
        offers,
        escrowed: {
          [side]: true,
          [otherSide]: false
        },
        confirmed: {
          a: 0,
          b: 0
        },
        claimed: {
          a: false,
          b: false
        },
        returned: {
          a: false,
          b: false
        },
        revision: 1,
        state: 'open',
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      const envelope = this.writeSave(transaction, uid, saveRef, record, game);
      return {
        envelope,
        tradeId: tradeRef.id
      };
    });
    this.publishSave(result.envelope);
    return result.tradeId;
  }
  validateTradeOffer(world, offer) {
    if (offer.itemId) {
      const item = this.item(offer.itemId);
      if (!item.expansion?.tradeEligible) throw new Error('That item is not open for player trading.');
      this.assertDiscovered(world, offer.itemId);
      this.assertStack(world, offer.itemId, offer.quantity);
    }
    this.assertGold(world, offer.gold);
  }
  reserveOffer(world, offer) {
    if (offer.itemId) this.adjustInventory(world, offer.itemId, -offer.quantity);
    if (offer.gold) world.gold = integer(world.gold, 0, 999999999) - offer.gold;
  }
  releaseOffer(world, offer) {
    if (offer.itemId && offer.quantity) {
      if (integer(world.inventory?.[offer.itemId], 0, MAX_STACK) + offer.quantity > MAX_STACK) throw new Error('Make room in your bag before returning your offered items.');
      this.adjustInventory(world, offer.itemId, offer.quantity);
    }
    if (offer.gold) {
      if (integer(world.gold, 0, 999999999) + offer.gold > 999999999) throw new Error('Make room in your Gold pouch before returning your offer.');
      world.gold = integer(world.gold, 0, 999999999) + offer.gold;
    }
  }
  async setTradeOffer(tradeId, rawOffer) {
    const uid = await this.readyForMutation();
    const offer = normalizeOffer(rawOffer);
    const {
      doc,
      runTransaction
    } = this.sdk;
    const tradeRef = doc(this.db, 'marketTrades', tradeId);
    const result = await runTransaction(this.db, async transaction => {
      const tradeSnapshot = await transaction.get(tradeRef);
      if (!tradeSnapshot.exists()) throw new Error('That friend trade could not be found.');
      const trade = tradeSnapshot.data();
      if (trade.state !== 'open' || !trade.memberIds?.includes(uid)) throw new Error('This trade is locked or is not yours to change.');
      const otherUid = trade.memberIds.find(member => member !== uid);
      const [ownBlock, otherBlock] = await Promise.all([transaction.get(doc(this.db, 'marketBlocks', uid, 'players', otherUid)), transaction.get(doc(this.db, 'marketBlocks', otherUid, 'players', uid))]);
      if (ownBlock.exists() || otherBlock.exists()) throw new Error('A block is in place, so this offer cannot be changed.');
      const side = trade.memberIds[0] === uid ? 'a' : 'b';
      const previous = trade.offers?.[side] || {
        itemId: null,
        quantity: 0,
        gold: 0
      };
      const escrowed = Boolean(trade.escrowed?.[side]);
      const {
        ref: saveRef,
        record
      } = await this.readSave(transaction, uid);
      const game = record.game;
      const world = saveWorld(game);
      if (escrowed) this.releaseOffer(world, previous);
      this.validateTradeOffer(world, offer);
      this.reserveOffer(world, offer);
      this.appendHistory(world, {
        type: 'trade-change',
        title: 'Changed a friend-trade offer',
        itemId: offer.itemId || '',
        quantity: offer.quantity,
        gold: offer.gold
      });
      const nextOffers = copy(trade.offers || {
        a: {},
        b: {}
      });
      nextOffers[side] = offer;
      const nextEscrowed = {
        a: Boolean(trade.escrowed?.a),
        b: Boolean(trade.escrowed?.b)
      };
      nextEscrowed[side] = true;
      const revision = integer(trade.revision, 1, 999999) + 1;
      transaction.update(tradeRef, {
        offers: nextOffers,
        escrowed: nextEscrowed,
        revision,
        confirmed: {
          a: 0,
          b: 0
        },
        updatedAt: Date.now()
      });
      const envelope = this.writeSave(transaction, uid, saveRef, record, game);
      return {
        envelope,
        revision
      };
    });
    this.publishSave(result.envelope);
    return result.revision;
  }
  async confirmTrade(tradeId, expectedRevision) {
    const uid = await this.readyForMutation();
    const {
      doc,
      runTransaction
    } = this.sdk;
    const tradeRef = doc(this.db, 'marketTrades', tradeId);
    await runTransaction(this.db, async transaction => {
      const tradeSnapshot = await transaction.get(tradeRef);
      if (!tradeSnapshot.exists()) throw new Error('That friend trade could not be found.');
      const trade = tradeSnapshot.data();
      if (trade.state !== 'open' || !trade.memberIds?.includes(uid)) throw new Error('This trade is already locked, finished, or not yours.');
      const side = trade.memberIds[0] === uid ? 'a' : 'b';
      const otherSide = side === 'a' ? 'b' : 'a';
      const ownOffer = trade.offers?.[side];
      const otherOffer = trade.offers?.[otherSide];
      if (!trade.escrowed?.[side] || !trade.escrowed?.[otherSide]) throw new Error('Both players need to set aside their exact offer before confirming.');
      const friendshipRef = doc(this.db, 'friendships', pairKey(...trade.memberIds));
      const ownBlockRef = doc(this.db, 'marketBlocks', uid, 'players', trade.memberIds.find(member => member !== uid));
      const otherUid = trade.memberIds.find(member => member !== uid);
      const otherBlockRef = doc(this.db, 'marketBlocks', otherUid, 'players', uid);
      const [friendship, ownBlock, otherBlock, {
        record
      }] = await Promise.all([transaction.get(friendshipRef), transaction.get(ownBlockRef), transaction.get(otherBlockRef), this.readSave(transaction, uid)]);
      if (!friendship.exists() || ownBlock.exists() || otherBlock.exists()) throw new Error('This trade can no longer be confirmed.');
      const world = saveWorld(record.game);
      if (otherOffer?.itemId) this.assertDiscovered(world, otherOffer.itemId);
      if (ownOffer?.itemId) this.assertDiscovered(world, ownOffer.itemId);
      const revision = integer(trade.revision, 1, 999999);
      if (integer(expectedRevision, 0, 999999) !== revision) throw new Error('The offer changed while it was open. Review the new exact exchange before confirming.');
      const confirmed = {
        a: integer(trade.confirmed?.a),
        b: integer(trade.confirmed?.b)
      };
      confirmed[side] = revision;
      const finalLock = confirmed.a === revision && confirmed.b === revision;
      transaction.update(tradeRef, {
        confirmed,
        state: finalLock ? 'locked' : 'open',
        lockedAt: finalLock ? Date.now() : null,
        updatedAt: Date.now()
      });
    });
    return true;
  }
  async cancelTrade(tradeId) {
    const uid = await this.readyForMutation();
    const {
      doc,
      runTransaction
    } = this.sdk;
    const tradeRef = doc(this.db, 'marketTrades', tradeId);
    await runTransaction(this.db, async transaction => {
      const tradeSnapshot = await transaction.get(tradeRef);
      if (!tradeSnapshot.exists()) throw new Error('That friend trade could not be found.');
      const trade = tradeSnapshot.data();
      if (!trade.memberIds?.includes(uid) || trade.state !== 'open') throw new Error('A locked trade cannot be cancelled; its agreed items are protected.');
      transaction.update(tradeRef, {
        state: 'cancelled',
        cancelledBy: uid,
        cancelledAt: Date.now(),
        updatedAt: Date.now()
      });
    });
    return true;
  }
  async claimTrade(tradeId) {
    const uid = await this.readyForMutation();
    const {
      doc,
      runTransaction
    } = this.sdk;
    const tradeRef = doc(this.db, 'marketTrades', tradeId);
    const result = await runTransaction(this.db, async transaction => {
      const tradeSnapshot = await transaction.get(tradeRef);
      if (!tradeSnapshot.exists()) throw new Error('That friend trade could not be found.');
      const trade = tradeSnapshot.data();
      if (!trade.memberIds?.includes(uid)) throw new Error('This trade belongs to its two participants.');
      const side = trade.memberIds[0] === uid ? 'a' : 'b';
      const otherSide = side === 'a' ? 'b' : 'a';
      const {
        ref: saveRef,
        record
      } = await this.readSave(transaction, uid);
      const game = record.game;
      const world = saveWorld(game);
      if (trade.state === 'cancelled') {
        if (!trade.escrowed?.[side] || trade.returned?.[side]) throw new Error('Your offer has already been returned.');
        this.releaseOffer(world, trade.offers?.[side] || {});
        const returned = {
          a: Boolean(trade.returned?.a),
          b: Boolean(trade.returned?.b)
        };
        returned[side] = true;
        const complete = returned.a && returned.b;
        transaction.update(tradeRef, {
          returned,
          state: complete ? 'complete' : 'cancelled',
          updatedAt: Date.now()
        });
        this.appendHistory(world, {
          type: 'trade-refund',
          title: 'Returned your cancelled friend-trade offer',
          itemId: trade.offers?.[side]?.itemId || '',
          quantity: trade.offers?.[side]?.quantity || 0,
          gold: trade.offers?.[side]?.gold || 0
        });
      } else if (trade.state === 'locked') {
        if (trade.claimed?.[side]) throw new Error('Your agreed exchange has already arrived.');
        const incoming = trade.offers?.[otherSide] || {};
        if (incoming.itemId) {
          this.assertDiscovered(world, incoming.itemId);
          const item = this.item(incoming.itemId);
          if (!item.expansion?.tradeEligible) throw new Error('That item is not open for player trading.');
          if (integer(world.inventory?.[incoming.itemId], 0, MAX_STACK) + integer(incoming.quantity) > MAX_STACK) throw new Error('Make room in your bag before receiving this trade.');
          this.adjustInventory(world, incoming.itemId, integer(incoming.quantity, 1, MAX_STACK));
        }
        const gold = integer(incoming.gold, 0, 999999999);
        if (integer(world.gold, 0, 999999999) + gold > 999999999) throw new Error('Make room in your Gold pouch before receiving this trade.');
        world.gold = integer(world.gold, 0, 999999999) + gold;
        const claimed = {
          a: Boolean(trade.claimed?.a),
          b: Boolean(trade.claimed?.b)
        };
        claimed[side] = true;
        const complete = claimed.a && claimed.b;
        transaction.update(tradeRef, {
          claimed,
          state: complete ? 'complete' : 'locked',
          updatedAt: Date.now()
        });
        this.appendHistory(world, {
          type: 'trade-complete',
          title: 'Received your confirmed friend trade',
          itemId: incoming.itemId || '',
          quantity: incoming.quantity || 0,
          gold
        });
      } else {
        throw new Error('This trade is not ready to return or exchange.');
      }
      return this.writeSave(transaction, uid, saveRef, record, game);
    });
    this.publishSave(result);
    return true;
  }
  async blockPlayer(playerUid) {
    const uid = await this.readyForMutation();
    if (!playerUid || playerUid === uid) throw new Error('You cannot block yourself.');
    const {
      doc,
      setDoc
    } = this.sdk;
    await setDoc(doc(this.db, 'marketBlocks', uid, 'players', playerUid), {
      blockedUid: playerUid,
      createdAt: Date.now()
    });
    return true;
  }
  async unblockPlayer(playerUid) {
    const uid = await this.requireUser();
    const {
      deleteDoc,
      doc
    } = this.sdk;
    await deleteDoc(doc(this.db, 'marketBlocks', uid, 'players', playerUid));
    return true;
  }
  async reportListing(listingId, reason = 'suspicious-listing') {
    const uid = await this.requireUser();
    const {
      addDoc,
      collection,
      doc,
      getDoc
    } = this.sdk;
    const listing = await getDoc(doc(this.db, 'marketListings', listingId));
    if (!listing.exists() || listing.data().sellerUid === uid) throw new Error('That listing cannot be reported from this account.');
    await addDoc(collection(this.db, 'marketReports'), {
      reporterUid: uid,
      targetType: 'listing',
      targetId: listingId,
      targetUid: listing.data().sellerUid,
      reason: safeText(reason, 40),
      createdAt: Date.now()
    });
    return true;
  }
  async reportTrade(tradeId, reason = 'suspicious-trade') {
    const uid = await this.requireUser();
    const {
      addDoc,
      collection,
      doc,
      getDoc
    } = this.sdk;
    const tradeSnapshot = await getDoc(doc(this.db, 'marketTrades', tradeId));
    if (!tradeSnapshot.exists() || !tradeSnapshot.data().memberIds?.includes(uid)) throw new Error('Only a trade participant can report this trade.');
    const targetUid = tradeSnapshot.data().memberIds.find(member => member !== uid);
    await addDoc(collection(this.db, 'marketReports'), {
      reporterUid: uid,
      targetType: 'trade',
      targetId: tradeId,
      targetUid,
      reason: safeText(reason, 40),
      createdAt: Date.now()
    });
    return true;
  }
}
export { MAX_HISTORY, pairKey };