function isSimulatedPlayerId(value) {
  return typeof value === 'string' && value.startsWith('sim_');
}

function mergeProfiles(...lists) {
  const byId = new Map();
  for (const list of lists) {
    for (const profile of list || []) {
      const id = profile?.uid || profile?.simulatedPlayerId;
      if (id) byId.set(id, profile);
    }
  }
  return [...byId.values()];
}

function realProfiles(profiles) {
  return (profiles || []).map((profile) => ({ ...profile, accountType: 'real' }));
}

/**
 * Provider-neutral doorway for social profile and room reads. Simulated data
 * stays local; real player operations are delegated to the existing Firebase
 * social provider and are never written into its player-save documents.
 */
export class PocketwildPlayerService {
  constructor({ simulatedPlayers, realPlayers, getUser = () => null } = {}) {
    this.simulatedPlayers = simulatedPlayers;
    this.realPlayers = realPlayers;
    this.getUser = getUser;
  }

  viewerKey() {
    const user = this.getUser();
    return this.simulatedPlayers.viewerKey(user?.uid || null);
  }

  isSimulated(playerOrId) {
    return playerOrId?.accountType === 'simulated'
      || isSimulatedPlayerId(typeof playerOrId === 'string' ? playerOrId : playerOrId?.uid);
  }

  async profile(playerId) {
    if (this.isSimulated(playerId)) return this.simulatedPlayers.getPlayer(playerId?.uid || playerId?.simulatedPlayerId || playerId);
    if (!playerId || !this.realPlayers || !this.getUser()) return null;
    const profile = await this.realPlayers.profile(playerId);
    return profile ? { ...profile, accountType: 'real' } : null;
  }

  async getRoom(playerId) {
    const profile = await this.profile(playerId);
    return profile?.room || null;
  }

  async directory() {
    const simulated = this.simulatedPlayers.listPlayers();
    if (!this.getUser() || !this.realPlayers) return simulated;
    try {
      return mergeProfiles(simulated, realProfiles(await this.realPlayers.directory()));
    } catch {
      return simulated;
    }
  }

  async searchPlayers(name) {
    const simulated = this.simulatedPlayers.searchPlayers(name);
    if (!this.getUser() || !this.realPlayers) return simulated;
    try {
      return mergeProfiles(simulated, realProfiles(await this.realPlayers.searchPlayers(name))).slice(0, 16);
    } catch {
      return simulated;
    }
  }

  async friends() {
    const simulated = this.simulatedPlayers.friends(this.viewerKey());
    if (!this.getUser() || !this.realPlayers) return simulated;
    try {
      return mergeProfiles(simulated, realProfiles(await this.realPlayers.friends()));
    } catch {
      return simulated;
    }
  }

  async addFriend(profile) {
    if (!profile?.uid) throw new Error('That Pocketwild profile could not be found.');
    if (this.isSimulated(profile)) return this.simulatedPlayers.addFriend(profile.uid, this.viewerKey());
    if (!this.realPlayers || !this.getUser()) throw new Error('Connect a Pocketwild account to send a friend hello to a real player.');
    return this.realPlayers.sendFriendRequest(profile);
  }

  async removeFriend(playerId) {
    if (!this.isSimulated(playerId)) throw new Error('Real-player friendships are managed by your Pocketwild account.');
    return this.simulatedPlayers.removeFriend(playerId, this.viewerKey());
  }

  async isFriend(playerId) {
    if (this.isSimulated(playerId)) return this.simulatedPlayers.isFriend(playerId, this.viewerKey());
    if (!this.realPlayers || !this.getUser()) return false;
    return this.realPlayers.isFriend(playerId);
  }

  async hasLikedRoom(playerId) {
    if (this.isSimulated(playerId)) return this.simulatedPlayers.hasLikedRoom(playerId, this.viewerKey());
    if (!this.realPlayers || !this.getUser()) return false;
    return this.realPlayers.hasLikedRoom(playerId);
  }

  async likeRoom(playerId, ownerName = '') {
    if (this.isSimulated(playerId)) return this.simulatedPlayers.likeRoom(playerId, this.viewerKey());
    if (!this.realPlayers || !this.getUser()) throw new Error('Connect an account to leave a room like for a real player.');
    return this.realPlayers.likeRoom(playerId, ownerName);
  }

  async visitRoom(playerId) {
    if (this.isSimulated(playerId)) return this.simulatedPlayers.recordVisit(playerId, this.viewerKey());
    if (!this.realPlayers || !this.getUser()) throw new Error('That player room is not available on this device.');
    const profile = await this.realPlayers.profile(playerId);
    if (!profile) return null;
    await this.realPlayers.recordVisit(playerId);
    return { ...profile, accountType: 'real' };
  }

  async visitShop(playerId) {
    if (this.isSimulated(playerId)) return this.simulatedPlayers.getPlayer(playerId);
    if (!this.realPlayers || !this.getUser()) throw new Error('That player shop is not available on this device.');
    const profile = await this.realPlayers.profile(playerId);
    if (!profile) return null;
    await this.realPlayers.recordVisit(playerId, true);
    return { ...profile, accountType: 'real' };
  }

  async recentRooms() {
    const simulated = this.simulatedPlayers.recentRooms(this.viewerKey());
    if (!this.getUser() || !this.realPlayers) return simulated;
    try {
      return mergeProfiles(simulated, realProfiles(await this.realPlayers.recentRooms()));
    } catch {
      return simulated;
    }
  }
}

export { isSimulatedPlayerId };