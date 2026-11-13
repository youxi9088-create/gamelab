import { safeUserText, validateUserText } from './content-safety.js';
import { MASTER_COLLECTOR_LEVEL } from './progression-data.js';
const FIREBASE_VERSION = '11.10.0';
const DISCOVERY_KEY = 'pocketwild-social-preferences-v1';
const RECENT_KEY = 'pocketwild-recent-rooms-v1';
const ONLINE_WINDOW_MS = 5 * 60 * 1000;
function pairKey(first, second) {
  return [String(first), String(second)].sort().join('_');
}
function copy(value) {
  return JSON.parse(JSON.stringify(value));
}
function requireSafeText(value, context, message) {
  const result = validateUserText(value, context);
  if (!result.allowed) throw new Error(message);
  return result.text;
}
function safePublicCopy(value, fallback = '') {
  return safeUserText(value, 'PUBLIC_TEXT', fallback);
}
const SAFE_ID = /^[^/\u0000-\u001f\u007f]{1,512}$/u;
const ROOM_THEMES = Object.freeze({
  'starter-room': 'Starter Room',
  'forest-cabin': 'Forest Cabin',
  'mushroom-cottage': 'Mushroom Cottage',
  'moonlit-room': 'Moonlit Room',
  'swamp-shack': 'Swamp Shack',
  'magical-observatory': 'Magical Observatory',
  'beach-house': 'Beach House',
  'canopy-sanctuary': 'Canopy Sanctuary'
});
const RARITIES = new Set(['Common', 'Uncommon', 'Rare', 'Super Rare', 'Ultra Rare', 'Epic', 'Legendary', 'Unique']);
const ACHIEVEMENTS = new Set(['First little find', 'A growing journal', 'Curious collector', 'A page for every place']);
const SOCIAL_BADGE = Object.freeze({
  id: 'master-collector',
  name: 'Master Collector',
  icon: '✦'
});
function safeDocumentId(value) {
  return typeof value === 'string' && SAFE_ID.test(value) ? value : '';
}
function safeCount(value, maximum = 1000000) {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.min(maximum, Math.floor(value))) : 0;
}
function safePublicLabel(value, fallback = '', maximum = 80) {
  if (typeof value !== 'string') return fallback;
  const shortened = Array.from(value).slice(0, maximum).join('');
  return safePublicCopy(shortened, fallback);
}
function safeName(value, context, fallback) {
  return typeof value === 'string' ? safeUserText(value, context, fallback) : fallback;
}
function safeIcon(value, fallback = '✦') {
  if (typeof value !== 'string') return fallback;
  return safePublicLabel(value, fallback, 8);
}
function sanitizeAvatar(raw) {
  const limits = {
    body: 3,
    skin: 4,
    hair: 4,
    hairColor: 4,
    eyes: 4,
    outfit: 4,
    accessory: 4
  };
  const avatar = {};
  for (const [key, count] of Object.entries(limits)) {
    const value = raw && typeof raw === 'object' ? raw[key] : null;
    avatar[key] = Number.isInteger(value) && value >= 0 && value < count ? value : 0;
  }
  return avatar;
}
function sanitizeSummaryItems(value, maximum = 4) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, maximum).flatMap(raw => {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return [];
    const id = safeDocumentId(raw.id);
    const name = safePublicLabel(raw.name, '', 80);
    if (!id || !name) return [];
    return [{
      id,
      name,
      emoji: safeIcon(raw.emoji),
      rarity: RARITIES.has(raw.rarity) ? raw.rarity : 'Common'
    }];
  });
}
function sanitizeReceivedProfile(raw, documentId = '') {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const uid = safeDocumentId(documentId) || safeDocumentId(raw.uid);
  if (!uid) return null;
  const displayName = safeName(raw.displayName, 'PLAYER_NAME', 'Wanderer');
  const rawRoom = raw.room && typeof raw.room === 'object' && !Array.isArray(raw.room) ? raw.room : {};
  const themeId = Object.hasOwn(ROOM_THEMES, rawRoom.themeId) ? rawRoom.themeId : 'starter-room';
  const rawPet = raw.pet && typeof raw.pet === 'object' && !Array.isArray(raw.pet) ? raw.pet : null;
  const validPetIds = new Set(['mango', 'beans', 'trash', 'luna']);
  const petId = rawPet && validPetIds.has(rawPet.id) ? rawPet.id : '';
  const pet = petId ? {
    id: petId,
    name: safeName(rawPet.name, 'PET_NAME', 'Pocketwild friend'),
    species: safePublicLabel(rawPet.species, 'Companion', 40),
    temperament: safePublicLabel(rawPet.temperament, 'Curious', 40)
  } : null;
  const collection = Array.isArray(raw.collection) ? [...new Set(raw.collection.map(safeDocumentId).filter(Boolean))].slice(0, 200) : [];
  const rawBadge = Array.isArray(raw.badges) ? raw.badges.find(badge => badge?.id === SOCIAL_BADGE.id) : null;
  const hasMasterBadge = raw.masterCollector === true || rawBadge?.id === SOCIAL_BADGE.id || rawRoom.masterBadge?.id === SOCIAL_BADGE.id;
  const room = {
    name: safeName(rawRoom.name, 'ROOM_NAME', 'A little room'),
    themeId,
    themeName: ROOM_THEMES[themeId],
    wallColor: typeof rawRoom.wallColor === 'string' && /^#[0-9a-f]{6}$/i.test(rawRoom.wallColor) ? rawRoom.wallColor : '#d8bd91',
    floorColor: typeof rawRoom.floorColor === 'string' && /^#[0-9a-f]{6}$/i.test(rawRoom.floorColor) ? rawRoom.floorColor : '#96694a'
  };
  const rawShop = raw.shop && typeof raw.shop === 'object' && !Array.isArray(raw.shop) ? raw.shop : {};
  const offers = Array.isArray(rawShop.offers) ? rawShop.offers.slice(0, 24).flatMap(offer => {
    if (!offer || typeof offer !== 'object' || Array.isArray(offer)) return [];
    return [{
      name: safePublicLabel(offer.name, 'A little keepsake', 80),
      description: safePublicLabel(offer.description, 'A little something for your room.', 240),
      emoji: safeIcon(offer.emoji),
      currency: offer.currency === 'stardust' ? 'stardust' : 'gold',
      price: safeCount(offer.price, 999999999)
    }];
  }) : [];
  const rawSignals = raw.signals && typeof raw.signals === 'object' && !Array.isArray(raw.signals) ? raw.signals : {};
  const signals = {
    eventParticipation: safeCount(rawSignals.eventParticipation),
    visitors: safeCount(rawSignals.visitors),
    likes: safeCount(rawSignals.likes),
    shopVisits: safeCount(rawSignals.shopVisits)
  };
  const profile = {
    uid,
    accountType: 'real',
    displayName,
    nameLower: displayName.toLocaleLowerCase(),
    avatar: sanitizeAvatar(raw.avatar),
    level: Math.max(1, Math.min(MASTER_COLLECTOR_LEVEL, safeCount(raw.level, 1000000))),
    xp: safeCount(raw.xp, Number.MAX_SAFE_INTEGER),
    xpProgress: safeCount(raw.xpProgress, 100),
    masterCollector: hasMasterBadge,
    badges: hasMasterBadge ? [{
      ...SOCIAL_BADGE
    }] : [],
    collection,
    collectionCount: Math.max(safeCount(raw.collectionCount), collection.length),
    collectionPercent: safeCount(raw.collectionPercent, 100),
    collectionAchievements: Array.isArray(raw.collectionAchievements) ? [...new Set(raw.collectionAchievements.filter(label => ACHIEVEMENTS.has(label)))].slice(0, 4) : [],
    collectionHighlights: sanitizeSummaryItems(raw.collectionHighlights),
    favoriteItems: sanitizeSummaryItems(raw.favoriteItems, 3),
    favoriteDiscovery: sanitizeSummaryItems(raw.favoriteDiscovery ? [raw.favoriteDiscovery] : [], 1)[0] || null,
    profileBio: safePublicLabel(raw.profileBio, '', 300),
    discoverable: raw.discoverable === true,
    lastSeenAt: Math.min(Date.now(), safeCount(raw.lastSeenAt, Number.MAX_SAFE_INTEGER)),
    signals,
    room,
    pet,
    shop: {
      name: safePublicLabel(rawShop.name, 'A cozy little shop', 80),
      offers
    }
  };
  return profile;
}
function validateProfileForPublication(profile) {
  if (!profile || typeof profile !== 'object' || Array.isArray(profile)) throw new Error('Your profile could not be shared just now.');
  const displayName = requireSafeText(profile.displayName, 'PLAYER_NAME', 'Please choose a different display name before sharing your room.');
  const room = profile.room && typeof profile.room === 'object' && !Array.isArray(profile.room) ? profile.room : {};
  const roomName = requireSafeText(room.name, 'ROOM_NAME', 'Please choose a different room name before sharing your room.');
  const result = {
    ...profile,
    displayName,
    nameLower: displayName.toLocaleLowerCase(),
    room: {
      ...room,
      name: roomName
    }
  };
  if (profile.profileBio !== undefined && profile.profileBio !== null && String(profile.profileBio).trim()) {
    result.profileBio = requireSafeText(profile.profileBio, 'PUBLIC_TEXT', 'Please change that profile note before sharing it.');
  } else {
    delete result.profileBio;
  }
  return result;
}
export class PocketwildSocial {
  constructor({
    config = null,
    getUser = () => null
  } = {}) {
    this.config = null;
    this.getUser = getUser;
    this.sdk = null;
    this.auth = null;
    this.db = null;
    this.initPromise = null;
    this.writeTimer = 0;
    this.presenceTimer = 0;
    this.pendingProfile = null;
    this.lastPublicProfile = null;
    this.lastProfileWrite = 0;
    this.lastSignalRefresh = 0;
    this.cachedSignals = {
      visitors: 0,
      likes: 0,
      shopVisits: 0
    };
  }
  userId() {
    return this.getUser()?.uid || null;
  }
  async initialize() {
    throw new Error("Online social and trading are retired in this local edition. Original local NPC play remains available.");
  }
  async requireUser() {
    const uid = this.userId();
    if (!uid) throw new Error('Create or log in to an account whenever you feel like meeting other players.');
    await this.initialize();
    if (this.auth.currentUser?.uid !== uid) throw new Error('Your account session changed. Please open the social corner again.');
    return uid;
  }
  preferences() {
    const uid = this.userId();
    if (!uid) return {
      discoverable: false
    };
    try {
      const all = JSON.parse(localStorage.getItem(DISCOVERY_KEY) || '{}');
      return {
        discoverable: Boolean(all?.[uid]?.discoverable)
      };
    } catch {
      return {
        discoverable: false
      };
    }
  }
  setDiscoverable(value) {
    const uid = this.userId();
    if (!uid) return;
    try {
      const all = JSON.parse(localStorage.getItem(DISCOVERY_KEY) || '{}');
      all[uid] = {
        discoverable: Boolean(value)
      };
      localStorage.setItem(DISCOVERY_KEY, JSON.stringify(all));
    } catch (error) {
      console.warn('[Pocketwild social] Could not save the room-sharing preference locally.', error);
    }
  }
  async publishProfile(profile, immediate = false, {
    allowPrivateUpdate = false
  } = {}) {
    if (!profile || !this.userId() || profile.discoverable !== true && !allowPrivateUpdate) return;
    this.pendingProfile = copy(validateProfileForPublication(profile));
    if (this.writeTimer) clearTimeout(this.writeTimer);
    this.writeTimer = 0;
    if (immediate) {
      await this.flushProfile({
        refreshSignals: profile.discoverable === true
      });
      return;
    }
    const wait = Math.max(800, 60000 - (Date.now() - this.lastProfileWrite));
    this.writeTimer = setTimeout(() => {
      this.writeTimer = 0;
      this.flushProfile().catch(error => console.warn('[Pocketwild social] Profile sync paused; your game save is still safe.', error));
    }, wait);
  }
  async refreshSignals(uid) {
    const {
      collection,
      getCountFromServer
    } = this.sdk;
    const paths = [collection(this.db, 'roomVisits', uid, 'visitors'), collection(this.db, 'roomLikes', uid, 'visitors'), collection(this.db, 'roomShopVisits', uid, 'visitors')];
    const counts = await Promise.all(paths.map(async path => {
      try {
        return (await getCountFromServer(path)).data().count || 0;
      } catch {
        return 0;
      }
    }));
    this.cachedSignals = {
      visitors: counts[0],
      likes: counts[1],
      shopVisits: counts[2]
    };
    this.lastSignalRefresh = Date.now();
  }
  async flushProfile({
    refreshSignals = true
  } = {}) {
    const profile = this.pendingProfile;
    const uid = await this.requireUser();
    if (!profile) return;
    if (refreshSignals && Date.now() - this.lastSignalRefresh > 5 * 60 * 1000) await this.refreshSignals(uid);
    const {
      doc,
      setDoc
    } = this.sdk;
    const record = {
      ...profile,
      uid,
      displayName: profile.displayName,
      nameLower: profile.displayName.toLocaleLowerCase(),
      discoverable: Boolean(profile.discoverable),
      lastSeenAt: Date.now(),
      updatedAt: Date.now(),
      signals: {
        ...this.cachedSignals,
        eventParticipation: Math.max(0, Math.floor(Number(profile.signals?.eventParticipation) || 0))
      }
    };
    await setDoc(doc(this.db, 'publicProfiles', uid), record, {
      merge: true
    });
    this.lastPublicProfile = {
      ...record
    };
    this.lastProfileWrite = Date.now();
    if (this.pendingProfile === profile) this.pendingProfile = null;
  }
  startPresence(getProfile) {
    this.stopPresence();
    if (!this.preferences().discoverable) return;
    this.presenceTimer = setInterval(() => {
      if (!this.userId() || !this.preferences().discoverable || document.visibilityState === 'hidden') return;
      this.publishProfile(getProfile(), true);
    }, 60000);
  }
  stopPresence() {
    if (this.presenceTimer) clearInterval(this.presenceTimer);
    this.presenceTimer = 0;
  }
  online(profile) {
    return Date.now() - Number(profile?.lastSeenAt || 0) < ONLINE_WINDOW_MS;
  }
  async directory() {
    await this.requireUser();
    const {
      collection,
      getDocs,
      limit,
      query,
      where
    } = this.sdk;
    const result = await getDocs(query(collection(this.db, 'publicProfiles'), where('discoverable', '==', true), limit(60)));
    return result.docs.map(entry => sanitizeReceivedProfile(entry.data(), entry.id)).filter(profile => profile && profile.uid !== this.userId());
  }
  async searchPlayers(name) {
    const uid = await this.requireUser();
    const validation = validateUserText(name, 'PLAYER_NAME');
    if (!validation.allowed) throw new Error('Please enter a player name with at least two letters.');
    const search = validation.text.toLocaleLowerCase();
    const {
      collection,
      getDocs,
      limit,
      query,
      where
    } = this.sdk;
    const result = await getDocs(query(collection(this.db, 'publicProfiles'), where('discoverable', '==', true), where('nameLower', '==', search), limit(8)));
    return result.docs.map(entry => sanitizeReceivedProfile(entry.data(), entry.id)).filter(profile => profile && profile.uid !== uid);
  }
  async profile(uid) {
    const viewer = await this.requireUser();
    const safeUid = safeDocumentId(uid);
    if (!safeUid || safeUid === viewer) return null;
    const {
      doc,
      getDoc
    } = this.sdk;
    const result = await getDoc(doc(this.db, 'publicProfiles', safeUid));
    return result.exists() ? sanitizeReceivedProfile(result.data(), result.id) : null;
  }
  async friends() {
    const uid = await this.requireUser();
    const {
      collection,
      doc,
      getDocs,
      limit,
      query,
      where,
      getDoc
    } = this.sdk;
    const result = await getDocs(query(collection(this.db, 'friendships'), where('members', 'array-contains', uid), limit(50)));
    return Promise.all(result.docs.map(async entry => {
      const members = Array.isArray(entry.data().members) ? entry.data().members : [];
      const memberId = safeDocumentId(members.find(candidate => candidate !== uid));
      if (!memberId) return null;
      const snap = await getDoc(doc(this.db, 'publicProfiles', memberId));
      const profile = snap.exists() ? sanitizeReceivedProfile(snap.data(), snap.id) : null;
      return profile ? {
        ...profile,
        friendshipId: safeDocumentId(entry.id)
      } : {
        uid: memberId,
        accountType: 'real',
        displayName: 'Pocketwild friend',
        avatar: sanitizeAvatar(null),
        friendshipId: safeDocumentId(entry.id)
      };
    })).then(rows => rows.filter(row => row?.friendshipId));
  }
  async requests() {
    const uid = await this.requireUser();
    const {
      collection,
      getDocs,
      limit,
      query,
      where
    } = this.sdk;
    const [incoming, outgoing] = await Promise.all([getDocs(query(collection(this.db, 'friendRequests'), where('toId', '==', uid), limit(40))), getDocs(query(collection(this.db, 'friendRequests'), where('fromId', '==', uid), limit(40)))]);
    const cleanRequest = entry => {
      const request = entry.data();
      const id = safeDocumentId(entry.id);
      const fromId = safeDocumentId(request.fromId);
      const toId = safeDocumentId(request.toId);
      if (!id || !fromId || !toId) return null;
      return {
        id,
        fromId,
        toId,
        status: request.status === 'pending' ? 'pending' : '',
        fromName: safeName(request.fromName, 'PLAYER_NAME', 'A Pocketwild player'),
        toName: safeName(request.toName, 'PLAYER_NAME', 'A Pocketwild player'),
        createdAt: safeCount(request.createdAt, Number.MAX_SAFE_INTEGER)
      };
    };
    const pendingRequests = snapshot => snapshot.docs.map(cleanRequest).filter(request => request?.status === 'pending');
    return {
      incoming: pendingRequests(incoming),
      outgoing: pendingRequests(outgoing)
    };
  }
  async hasLikedRoom(ownerUid) {
    const viewer = await this.requireUser();
    const safeOwnerUid = safeDocumentId(ownerUid);
    if (!safeOwnerUid || safeOwnerUid === viewer) return false;
    const {
      collection,
      doc,
      getDoc
    } = this.sdk;
    return (await getDoc(doc(collection(this.db, 'roomLikes', safeOwnerUid, 'visitors'), viewer))).exists();
  }
  async isFriend(uid) {
    const viewer = await this.requireUser();
    const safeUid = safeDocumentId(uid);
    if (!safeUid || safeUid === viewer) return false;
    const {
      doc,
      getDoc
    } = this.sdk;
    return (await getDoc(doc(this.db, 'friendships', pairKey(viewer, safeUid)))).exists();
  }
  async sendFriendRequest(profile) {
    const uid = await this.requireUser();
    const recipientUid = safeDocumentId(profile?.uid);
    if (!recipientUid || recipientUid === uid) throw new Error('That little room belongs to you.');
    if (await this.isFriend(recipientUid)) return {
      alreadyFriends: true
    };
    const existing = await this.requests();
    if (existing.outgoing.some(request => request.toId === recipientUid)) return {
      pending: true
    };
    if (existing.incoming.some(request => request.fromId === recipientUid)) return {
      incomingPending: true
    };
    const {
      addDoc,
      collection
    } = this.sdk;
    await addDoc(collection(this.db, 'friendRequests'), {
      fromId: uid,
      fromName: safeUserText(this.pendingProfile?.displayName || this.lastPublicProfile?.displayName || 'Wanderer', 'PLAYER_NAME', 'Wanderer'),
      toId: recipientUid,
      toName: safeName(profile.displayName, 'PLAYER_NAME', 'Pocketwild player'),
      status: 'pending',
      createdAt: Date.now()
    });
    return {
      sent: true
    };
  }
  async respondToRequest(requestId, accept) {
    const uid = await this.requireUser();
    const safeRequestId = safeDocumentId(requestId);
    if (!safeRequestId) throw new Error('That friend note has already gone quiet.');
    const {
      doc,
      runTransaction
    } = this.sdk;
    const requestRef = doc(this.db, 'friendRequests', safeRequestId);
    await runTransaction(this.db, async transaction => {
      const snapshot = await transaction.get(requestRef);
      if (!snapshot.exists()) throw new Error('That friend note has already gone quiet.');
      const request = snapshot.data();
      if (request.toId !== uid || request.status !== 'pending') throw new Error('This friend request is no longer waiting.');
      const friendshipRef = doc(this.db, 'friendships', pairKey(request.fromId, request.toId));
      const friendshipSnapshot = accept ? await transaction.get(friendshipRef) : null;
      transaction.update(requestRef, {
        status: accept ? 'accepted' : 'declined',
        respondedAt: Date.now()
      });
      if (accept) {
        if (!friendshipSnapshot.exists()) {
          transaction.set(friendshipRef, {
            members: [request.fromId, request.toId].sort(),
            acceptedRequestId: requestId,
            createdAt: Date.now()
          });
        }
        transaction.set(doc(this.db, 'users', request.fromId, 'socialNotifications', `friend-${request.toId}`), {
          type: 'friend-accepted',
          actorId: uid,
          actorName: safeUserText(request.toName, 'PLAYER_NAME', 'A new friend'),
          requestId,
          createdAt: Date.now(),
          read: false
        });
      }
    });
  }
  readRecentIds() {
    const uid = this.userId();
    if (!uid) return [];
    try {
      const all = JSON.parse(localStorage.getItem(RECENT_KEY) || '{}');
      return Array.isArray(all?.[uid]) ? all[uid].flatMap(row => {
        const safeUid = safeDocumentId(row?.uid);
        const at = Number(row?.at);
        return safeUid && Number.isFinite(at) && at >= 0 ? [{
          uid: safeUid,
          at: Math.floor(at)
        }] : [];
      }).slice(0, 20) : [];
    } catch {
      return [];
    }
  }
  async recordVisit(roomUid, shop = false) {
    const uid = await this.requireUser();
    const safeRoomUid = safeDocumentId(roomUid);
    if (!safeRoomUid || safeRoomUid === uid) return;
    const recent = this.readRecentIds().filter(row => row.uid !== safeRoomUid);
    recent.unshift({
      uid: safeRoomUid,
      at: Date.now()
    });
    try {
      const all = JSON.parse(localStorage.getItem(RECENT_KEY) || '{}');
      all[uid] = recent.slice(0, 20);
      localStorage.setItem(RECENT_KEY, JSON.stringify(all));
    } catch (error) {
      console.warn('[Pocketwild social] Could not save room visits on this device.', error);
    }
    const {
      collection,
      doc,
      getDoc,
      setDoc
    } = this.sdk;
    const root = shop ? 'roomShopVisits' : 'roomVisits';
    const ref = doc(collection(this.db, root, safeRoomUid, 'visitors'), uid);
    const previous = await getDoc(ref);
    const now = Date.now();
    await setDoc(ref, previous.exists() ? {
      lastVisitedAt: now
    } : {
      visitorId: uid,
      createdAt: now,
      lastVisitedAt: now
    });
  }
  async recentRooms() {
    const rows = this.readRecentIds();
    return Promise.all(rows.map(async entry => {
      try {
        const profile = await this.profile(entry.uid);
        return profile ? {
          ...profile,
          visitedAt: entry.at
        } : null;
      } catch {
        return null;
      }
    })).then(profiles => profiles.filter(Boolean));
  }
  async likeRoom(ownerUid, ownerName) {
    const uid = await this.requireUser();
    const safeOwnerUid = safeDocumentId(ownerUid);
    if (!safeOwnerUid || safeOwnerUid === uid) throw new Error('You already have the coziest seat in your own room.');
    const {
      collection,
      doc,
      getDoc,
      writeBatch
    } = this.sdk;
    const likeRef = doc(collection(this.db, 'roomLikes', safeOwnerUid, 'visitors'), uid);
    if ((await getDoc(likeRef)).exists()) return {
      alreadyLiked: true
    };
    const now = Date.now();
    const batch = writeBatch(this.db);
    batch.set(likeRef, {
      visitorId: uid,
      createdAt: now
    });
    const noticeRef = doc(this.db, 'users', safeOwnerUid, 'socialNotifications', `like-${uid}`);
    batch.set(noticeRef, {
      type: 'room-like',
      actorId: uid,
      actorName: safeUserText(this.pendingProfile?.displayName || this.lastPublicProfile?.displayName || 'A visitor', 'PLAYER_NAME', 'A visitor'),
      roomName: safeUserText(ownerName, 'ROOM_NAME', 'A little room'),
      createdAt: now,
      read: false
    });
    await batch.commit();
    return {
      liked: true
    };
  }
  async threads() {
    const uid = await this.requireUser();
    const {
      collection,
      getDocs,
      limit,
      query,
      where
    } = this.sdk;
    const result = await getDocs(query(collection(this.db, 'friendConversations'), where('members', 'array-contains', uid), limit(40)));
    return result.docs.map(entry => {
      const raw = entry.data();
      const members = Array.isArray(raw.members) ? raw.members.map(safeDocumentId).filter(Boolean).slice(0, 2) : [];
      return {
        id: safeDocumentId(entry.id),
        members,
        lastMessage: safeUserText(raw.lastMessage, 'PUBLIC_TEXT', ''),
        lastSenderId: safeDocumentId(raw.lastSenderId),
        lastSenderName: safeName(raw.lastSenderName, 'PLAYER_NAME', 'A Pocketwild friend'),
        updatedAt: safeCount(raw.updatedAt, Number.MAX_SAFE_INTEGER)
      };
    }).filter(thread => thread.id).sort((a, b) => b.updatedAt - a.updatedAt);
  }
  async messages(friendUid) {
    const uid = await this.requireUser();
    const safeFriendUid = safeDocumentId(friendUid);
    if (!safeFriendUid || !(await this.isFriend(safeFriendUid))) throw new Error('Messages are just for friends.');
    const {
      collection,
      getDocs,
      limit,
      orderBy,
      query
    } = this.sdk;
    const conversationId = pairKey(uid, safeFriendUid);
    const result = await getDocs(query(collection(this.db, 'friendConversations', conversationId, 'messages'), orderBy('createdAt', 'desc'), limit(40)));
    return result.docs.map(entry => {
      const raw = entry.data();
      return {
        id: safeDocumentId(entry.id),
        authorId: safeDocumentId(raw.authorId),
        text: safeUserText(raw.text, 'PUBLIC_TEXT', 'A note could not be shown.'),
        authorName: safeName(raw.authorName, 'PLAYER_NAME', 'A Pocketwild friend'),
        createdAt: safeCount(raw.createdAt, Number.MAX_SAFE_INTEGER)
      };
    }).filter(message => message.id).reverse();
  }
  async sendMessage(friend, text) {
    const uid = await this.requireUser();
    const body = requireSafeText(text, 'PUBLIC_TEXT', 'That note could not be shared. Please try a different note.');
    const friendUid = safeDocumentId(friend?.uid);
    if (!friendUid || !(await this.isFriend(friendUid))) throw new Error('Add each other as friends before sending a note.');
    const conversationId = pairKey(uid, friendUid);
    const {
      collection,
      doc,
      writeBatch
    } = this.sdk;
    const conversationRef = doc(this.db, 'friendConversations', conversationId);
    const messageRef = doc(collection(this.db, 'friendConversations', conversationId, 'messages'));
    const now = Date.now();
    const senderName = safeUserText(this.pendingProfile?.displayName || 'Wanderer', 'PLAYER_NAME', 'Wanderer');
    const batch = writeBatch(this.db);
    batch.set(conversationRef, {
      members: [uid, friendUid].sort(),
      lastMessage: body,
      lastSenderId: uid,
      lastSenderName: senderName,
      updatedAt: now
    }, {
      merge: true
    });
    batch.set(messageRef, {
      authorId: uid,
      authorName: senderName,
      text: body,
      createdAt: now
    });
    const noteRef = doc(this.db, 'users', friendUid, 'socialNotifications', `message-${uid}`);
    batch.set(noteRef, {
      type: 'message',
      actorId: uid,
      actorName: senderName,
      preview: body,
      conversationId,
      messageId: messageRef.id,
      createdAt: now,
      read: false
    }, {
      merge: true
    });
    await batch.commit();
    return true;
  }
  async socialNotifications() {
    const uid = await this.requireUser();
    const {
      collection,
      getDocs,
      limit,
      query
    } = this.sdk;
    const result = await getDocs(query(collection(this.db, 'users', uid, 'socialNotifications'), limit(60)));
    const allowedTypes = new Set(['room-like', 'message', 'friend-accepted']);
    return result.docs.map(entry => {
      const raw = entry.data();
      return {
        id: safeDocumentId(entry.id),
        type: allowedTypes.has(raw.type) ? raw.type : '',
        actorId: safeDocumentId(raw.actorId),
        actorName: safeName(raw.actorName, 'PLAYER_NAME', 'A Pocketwild friend'),
        roomName: safeName(raw.roomName, 'ROOM_NAME', 'a little room'),
        preview: safeUserText(raw.preview, 'PUBLIC_TEXT', ''),
        createdAt: safeCount(raw.createdAt, Number.MAX_SAFE_INTEGER),
        read: raw.read === true
      };
    }).filter(note => note.id && note.type).sort((a, b) => b.createdAt - a.createdAt);
  }
  async markNotificationsRead(notifications) {
    const uid = await this.requireUser();
    const unread = (notifications || []).filter(entry => !entry.read).map(entry => safeDocumentId(entry.id)).filter(Boolean).slice(0, 450);
    if (!unread.length) return;
    const {
      doc,
      writeBatch
    } = this.sdk;
    const batch = writeBatch(this.db);
    for (const id of unread) batch.update(doc(this.db, 'users', uid, 'socialNotifications', id), {
      read: true
    });
    await batch.commit();
  }
}
export { pairKey };