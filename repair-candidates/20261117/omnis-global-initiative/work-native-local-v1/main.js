import Phaser from './_remote/b8c86383a79f25ec/phaser@3.70.0.js';
import GameGraph from './GameGraph.js';
import { createPlayingCardHTML, getPlayingCardStyle } from './cardRenderer.js';
import { findAttachmentSolution, findAllAttachmentSolutions, getResolvedParentPortSide, getNodeRotation, getWorldIncomingSide, getWorldOutgoingSides, getOccupiedWorldOutgoingSides, getPortWorldOffset, getPortWorldTipOffset, computeRotationForIncomingSide, oppositeSide, nodesOverlap, rotateVector } from './portUtils.js';
import { FACTIONS, DECK, COLORS, ATTACK_TYPES, TURN_PHASES, ALIGNMENT_OPPOSITES, ALIGNMENT_OPPOSED, ALIGNMENT_TENSION, ALIGNMENT_INFO, EVENT_DECK, AI_ARCHETYPES, FACTION_AI_ARCHETYPES, calculateAttack, computeAttackStrength, getSuccessChance, getAlignmentPenalty, getAlignmentBreakdown, getAttackStrength, getAncestorChain, getChildCount, getFreeArrows, getDescendants, roll2d6, getIncomeBonus, getAttackAbilityModifier, getDefenseAbilityModifier, getOnControlEffects, getEffectiveResistance, hasEventImmunity, hasEventIncomeImmunity, hasEsportsReroll, hasMemeOlympicsReroll, getAstrologyModifier, isAbilityCancelled, brokerPeek, getDoublesBonus, getIncomePhaseBonuses, getLoyaltyPointsBonus, hasPassiveAlias, getDistanceToFaction, getControlPath, getControlPathBtc, getAlgoManipulationBonus, shouldTriggerVerticalIntegration, hasPlausibleDeniability, applyNarrativeAgitation, applyFluidTokenomics, ACTIVE_GROUP_ABILITIES, ACTION_CARDS } from './gameLogic.js';
import * as SFX from './sfx.js';
import tutorial, { TUTORIAL_WIN_GROUPS } from './tutorial.js';
import { CARD_FLAVOURS } from './cardFlavours.js';

// ═══════════════════════════════════════
//  ASSET PRELOADING
// ═══════════════════════════════════════
const PRELOAD_ASSETS = ['assets/2063bd94-1ad3-4c79-9f45-19eb71fbed47-3.png', 'assets/logo_corporate_megabloc-png.webp', 'assets/logo_hidden_hand_v2-png.webp', ...Object.values(FACTIONS).map(f => f.logo)];
PRELOAD_ASSETS.forEach(src => {
  if (src) {
    const img = new Image();
    img.src = src;
  }
});

// ═══════════════════════════════════════
//  BTC SPENDING / BIDDING WAR HELPER
// ═══════════════════════════════════════

/**
 * For an AI player acting in a role, pick the best node to use as their acting group
 * for BTC spending. Bidding only uses BTC stored on that single card.
 */
function pickAIActingNode(playerId, role, attackerNodeId, targetNodeId) {
  const owned = Object.values(G.nodes).filter(n => n.owner === playerId && !n.hasActedThisRound);
  if (owned.length === 0) return null;
  if (role === 'attacker') {
    // Attacker uses the attacking node
    return G.nodes[attackerNodeId] || owned[0];
  }
  if (role === 'defender') {
    // Defender uses the defending node (the target being attacked)
    return G.nodes[targetNodeId] || owned[0];
  }
  // Interferer: pick the node with the most BTC on the card itself
  let best = null,
    bestBtc = -1;
  for (const n of owned) {
    const cardBtc = n.btc || 0;
    if (cardBtc > bestBtc) {
      bestBtc = cardBtc;
      best = n;
    }
  }
  return best;
}

/**
 * Runs a sequential bidding war where the attacker, defender, and other players
 * can bid ₿TC from a single chosen card until they pass.
 * 
 * BTC CARD RULES:
 * - Attacker spends only BTC stored on the attacking card
 * - Defender spends only BTC stored on the defending card
 * - Interferers choose one card and spend only BTC stored on that card
 */
function runBiddingWar({
  attackerId,
  attackerNodeId,
  targetNode,
  baseAttackPower,
  targetResistance,
  alignMod,
  atkAbility,
  defAbility,
  loyaltyBonus,
  isEndgame,
  dieMod,
  hasReroll,
  distanceBonus,
  attackType = null,
  resistancePenalty = 0,
  ignoreDefenseAbility = false,
  warId = null
}) {
  const biddingWarId = warId || `${attackerId}:${attackerNodeId}:${targetNode?.id}:${Date.now()}:${Math.random().toString(36).slice(2, 7)}`;
  window._activeBiddingWarId = biddingWarId;
  console.log('[biddingWar] Starting. warId=' + biddingWarId + ' attackerId=' + attackerId + ' targetNode=' + targetNode?.id + ' isLocalAttacker=' + (attackerId === HUMAN_ID));
  // ⚡ Mark a bidding war as active so the multiplayer state-sync layer defers
  // any incoming state writes until the war resolves. This prevents the
  // defender's screen from freezing if the attacker's syncState arrives mid-war.
  window._biddingWarActive = true;
  return new Promise(resolve => {
    const targetOwnerId = targetNode.owner;
    const isHumanAttacker = attackerId === HUMAN_ID;
    let bids = {};
    let stances = {};
    G.playerOrder.forEach(pid => {
      bids[pid] = 0;
      // Default stance: attacker supports, defender defends, everyone else
      // (interferers) starts at 'support' because the rules now reserve
      // the defending action for the defender alone.
      stances[pid] = pid === targetOwnerId && pid !== attackerId ? 'defend' : 'support';
    });
    let cancelled = false;

    // ─── Split treasury bookkeeping (attacker + defender) ───
    // Attacker may bid from the attacking Group treasury (+1 P per ₿) and
    // from the Faction (root) treasury (+1 P per ₿). No other Groups in
    // the attacker's power structure can chip in.
    // Defender may bid from the defending Group treasury (+2 R per ₿) and
    // from their Faction (root) treasury (+1 R per ₿). No other groups
    // can participate in defence.
    const attackerSpent = {
      group: 0,
      faction: 0
    };
    const defenderSpent = {
      group: 0,
      faction: 0
    };
    const attackerFactionNodeId = G.players[attackerId]?.rootNodeId || null;
    const defenderFactionNodeId = targetOwnerId && targetOwnerId !== attackerId ? G.players[targetOwnerId]?.rootNodeId || null : null;
    function getAttackerEffectiveBtc() {
      return attackerSpent.group + attackerSpent.faction;
    }
    function getDefenderEffectiveBtc() {
      // 1:1 subtractor passed to computeAttackStrength.
      return defenderSpent.group * 2 + defenderSpent.faction * 1;
    }
    function getRootBtc(playerId) {
      const rid = G.players[playerId]?.rootNodeId;
      if (!rid) return 0;
      const n = G.nodes[rid];
      if (!n) return 0;
      if (n._cannotSupportAttacksThisRound) return 0;
      return n.btc || 0;
    }
    // Spend from a player's root (faction treasury). Returns true on success.
    function spendFactionBtc(playerId, amount) {
      if (amount <= 0) return true;
      const rid = G.players[playerId]?.rootNodeId;
      const node = rid ? G.nodes[rid] : null;
      if (!node) return false;
      if ((node.btc || 0) < amount) return false;
      node.btc -= amount;
      return true;
    }

    // Track each participant's acting node (for control-path BTC)
    const actingNodes = {};
    actingNodes[attackerId] = attackerNodeId;
    if (targetOwnerId && targetOwnerId !== attackerId) {
      actingNodes[targetOwnerId] = targetNode.id; // Defender uses the defending group
    }

    // Build order: Attacker, then Defender (if any).
    // Per OMNIS spending rules, only the attacker and the defending player
    // can put money into a bidding war. Other players are spectators.
    const order = [attackerId];
    if (targetOwnerId && targetOwnerId !== attackerId) order.push(targetOwnerId);

    // Helper: get available BTC for a participant from their single acting card
    // Nodes flagged with _cannotSupportAttacksThisRound (Political Scandal,
    // Satellite Failure, Supply Chain Collapse) cannot contribute their BTC
    // to a bidding war this round — they appear as ₿0.
    function getParticipantAvailBtc(playerId) {
      const actNodeId = actingNodes[playerId];
      if (!actNodeId) return 0;
      const node = G.nodes[actNodeId];
      if (!node) return 0;
      if (node._cannotSupportAttacksThisRound) return 0;
      return node.btc || 0;
    }

    // Helper: spend BTC from a participant's chosen card only
    function spendParticipantBtc(playerId, amount) {
      const actNodeId = actingNodes[playerId];
      const actNode = actNodeId ? G.nodes[actNodeId] : null;
      if (!actNode || amount <= 0) return false;
      if ((actNode.btc || 0) < amount) return false;
      actNode.btc -= amount;
      return true;
    }

    // Build single-card display for a node
    function getPathDisplay(nodeId) {
      const n = G.nodes[nodeId];
      if (!n) return '?';
      return `${n.icon || '🌐'}${n.name.substring(0, 18)}(₿${n.btc || 0})`;
    }
    const detailsPanel = document.getElementById('details-panel');
    // (Legacy details panel left untouched — the new bidding war renders as
    // a center-screen modal on its own backdrop element.)

    // Attacker / defender card-local BTC info
    const atkPathBtc = G.nodes[attackerNodeId]?.btc || 0;
    const atkNode = G.nodes[attackerNodeId];
    const defPathBtc = targetOwnerId && targetOwnerId !== attackerId ? G.nodes[targetNode.id]?.btc || 0 : 0;
    const isShadowVeil = G._shadowVeilActive;

    // Faction info for both sides (alignment color tints the side card).
    const atkPlayer = G.players[attackerId];
    const atkFac = FACTIONS[atkPlayer.factionId];
    const atkAlignColor = atkFac?.alignments?.[0] && ALIGNMENT_INFO[atkFac.alignments[0]]?.color || '#22c55e';
    const tgtOwnerId = targetNode.owner;
    const defPlayer = tgtOwnerId && tgtOwnerId !== attackerId ? G.players[tgtOwnerId] : null;
    const defFac = defPlayer ? FACTIONS[defPlayer.factionId] : null;
    const defAlignColor = defFac?.alignments?.[0] && ALIGNMENT_INFO[defFac.alignments[0]]?.color || '#ef4444';
    let targetOwnerText = "NEUTRAL";
    if (tgtOwnerId === HUMAN_ID) {
      targetOwnerText = "YOURS";
    } else if (tgtOwnerId && defFac) {
      targetOwnerText = `${defFac.icon} ${defFac.name}`;
    }

    // Attack-type badge text
    let attackTypeBadge = '';
    let attackTypeClass = 'control';
    if (attackType === ATTACK_TYPES.NEUTRALIZE) {
      attackTypeBadge = 'NEUTRALIZE';
      attackTypeClass = 'neutralize';
    } else if (attackType === ATTACK_TYPES.DESTROY) {
      attackTypeBadge = 'DESTROY';
      attackTypeClass = 'destroy';
    } else if (attackType === ATTACK_TYPES.CONTROL) {
      attackTypeBadge = 'CONTROL';
      attackTypeClass = 'control';
    } else {
      attackTypeBadge = 'ATTACK';
      attackTypeClass = 'control';
    }

    // Defender (right side) renders even when target is NEUTRAL — show a
    // ghost panel so the layout stays symmetric.
    const defenderHasOwner = !!defPlayer;
    const defSideFactionName = isShadowVeil ? '???' : defFac ? `${defFac.icon} ${defFac.name}` : '🏴 NEUTRAL';
    const defSideCardName = isShadowVeil ? '???' : `🎯 ${targetNode.name}`;
    const atkSideFactionName = isShadowVeil ? '???' : `${atkFac.icon} ${atkFac.name}`;
    const atkSideCardName = isShadowVeil ? '???' : `⚔️ ${atkNode?.name || atkPlayer.name}`;

    // Available BTC at war-open (shown in pool boxes, then live-updated).
    const atkGroupAvail0 = atkNode?.btc || 0;
    const atkRootId = atkPlayer?.rootNodeId;
    const atkFactionAvail0 = atkRootId && G.nodes[atkRootId] ? G.nodes[atkRootId].btc || 0 : 0;
    const atkFactionOwnRoot = atkNode && atkRootId === atkNode.id; // if attacking from root, faction == group
    const defGroupAvail0 = defenderHasOwner ? G.nodes[targetNode.id]?.btc || 0 : 0;
    const defRootId = defPlayer?.rootNodeId;
    const defFactionAvail0 = defenderHasOwner && defRootId && G.nodes[defRootId] ? G.nodes[defRootId].btc || 0 : 0;
    const defFactionOwnRoot = defenderHasOwner && defRootId === targetNode.id;

    // Build the center-screen modal: backdrop + modal.
    const overlay = document.createElement('div');
    overlay.id = 'bidding-war-panel';
    overlay.className = 'bw-modal-backdrop';
    overlay.innerHTML = `
            <div class="bw-modal" role="dialog" aria-label="Tactical Bidding">
                <div class="bw-header">
                    <h3>⚔️ TACTICAL BIDDING</h3>
                    <div class="bw-header-badges">
                        <span class="bw-badge ${attackTypeClass}">${attackTypeBadge}</span>
                        ${isShadowVeil ? '<span class="bw-badge" style="color:var(--accent-purple);border-color:var(--accent-purple);">🕳 SHADOW VEIL</span>' : ''}
                        ${G.isEndgame ? '<span class="bw-badge" style="color:var(--accent-yellow);border-color:var(--accent-yellow);">ENDGAME</span>' : ''}
                        <button id="bw-minimize-btn" class="bw-min-btn" title="Minimize — view board">▁</button>
                    </div>
                </div>

                <div class="bw-target-strip">
                    <div>
                        <span class="label">TARGET</span>
                        <span class="name" style="margin-left:8px;">${isShadowVeil ? '???' : targetNode.name}</span>
                        <span style="color:#64748b;margin-left:6px;">${targetOwnerText}</span>
                    </div>
                    <div id="bw-warid-mini" style="font-size:9px;color:#475569;letter-spacing:1px;">WAR · ${biddingWarId.slice(-6).toUpperCase()}</div>
                </div>

                <div class="bw-scroll">
                <div class="bw-body">
                    <!-- ATTACKER SIDE -->
                    <div id="bw-side-attacker" class="bw-side attacker" style="--side-accent:${atkAlignColor};">
                        <div class="bw-side-header">
                            <div class="bw-side-icon" style="color:${atkAlignColor};">${atkFac?.icon || '⚔️'}</div>
                            <div class="bw-side-titles">
                                <div class="bw-side-role">ATTACKER</div>
                                <div class="bw-side-faction">${atkSideFactionName}</div>
                                <div class="bw-side-card">${atkSideCardName}</div>
                            </div>
                        </div>
                        <div class="bw-card-wrap" id="bw-card-attacker">
                            ${isShadowVeil ? '<div class="bw-card-hidden">???</div>' : atkNode ? `<div class="bw-card-frame"><div class="playing-card" style="${getPlayingCardStyle(atkNode, false)}">${createPlayingCardHTML(atkNode, false, atkRootId === atkNode.id)}</div></div>` : ''}
                        </div>
                        <div class="bw-pools">
                            <div class="bw-pool" id="bw-pool-atk-group">
                                <div class="bw-pool-label">GROUP ₿</div>
                                <div class="bw-pool-row">₿<span id="bw-atk-group-avail">${atkGroupAvail0}</span></div>
                                <div class="bw-pool-spent" id="bw-atk-group-spent">&nbsp;</div>
                                <div class="bw-pool-mult">×1 → +P</div>
                            </div>
                            <div class="bw-pool" id="bw-pool-atk-faction" style="${atkFactionOwnRoot ? 'opacity:0.5;' : ''}">
                                <div class="bw-pool-label">FACTION ₿</div>
                                <div class="bw-pool-row">₿<span id="bw-atk-faction-avail">${atkFactionOwnRoot ? '—' : atkFactionAvail0}</span></div>
                                <div class="bw-pool-spent" id="bw-atk-faction-spent">&nbsp;</div>
                                <div class="bw-pool-mult">×1 → +P</div>
                            </div>
                        </div>
                        <div class="bw-contribution">
                            <div class="bw-contribution-label">POWER CONTRIBUTION</div>
                            <div class="bw-contribution-value">
                                <span id="bw-atk-base">${isShadowVeil ? '?' : baseAttackPower}</span>
                                <span style="color:var(--accent-yellow);font-size:14px;"> + <span id="bw-atk-bid">0</span></span>
                            </div>
                            <div style="font-size:9px;color:#64748b;margin-top:2px;">BASE + BID</div>
                        </div>
                    </div>

                    <!-- CENTER PYLON -->
                    <div class="bw-center">
                        <div class="bw-vs">VS</div>
                        <div class="bw-strength-disc str-breakdown-trigger" id="bw-strength-disc" tabindex="0" title="Hover for full breakdown">
                            <div class="bw-disc-label">STRENGTH</div>
                            <div class="bw-disc-strength" id="bw-disc-strength">0</div>
                            <div class="bw-disc-chance" id="bw-disc-chance">0%</div>
                        </div>
                        <div class="bw-mods" id="bw-mods"></div>
                        <!-- Legacy elements preserved as hidden anchors for code that still touches them -->
                        <span id="bw-header-base-str" style="display:none;">${isShadowVeil ? '?' : baseAttackPower}</span>
                        <span id="bw-header-target-res" style="display:none;">${isShadowVeil ? '?' : targetResistance}</span>
                        <div id="bidding-preview" style="display:none;"></div>
                    </div>

                    <!-- DEFENDER SIDE -->
                    <div id="bw-side-defender" class="bw-side defender" style="--side-accent:${defenderHasOwner ? defAlignColor : '#475569'};">
                        <div class="bw-side-header">
                            <div class="bw-side-icon" style="color:${defenderHasOwner ? defAlignColor : '#475569'};">${defFac?.icon || '🏴'}</div>
                            <div class="bw-side-titles">
                                <div class="bw-side-role">DEFENDER</div>
                                <div class="bw-side-faction">${defSideFactionName}</div>
                                <div class="bw-side-card">${defSideCardName}</div>
                            </div>
                        </div>
                        <div class="bw-card-wrap" id="bw-card-defender">
                            ${isShadowVeil ? '<div class="bw-card-hidden">???</div>' : `<div class="bw-card-frame"><div class="playing-card" style="${getPlayingCardStyle(targetNode, false)}">${createPlayingCardHTML(targetNode, false, defRootId === targetNode.id)}</div></div>`}
                        </div>
                        <div class="bw-pools">
                            <div class="bw-pool" id="bw-pool-def-group" style="${defenderHasOwner ? '' : 'opacity:0.4;'}">
                                <div class="bw-pool-label">GROUP ₿</div>
                                <div class="bw-pool-row">₿<span id="bw-def-group-avail">${defenderHasOwner ? defGroupAvail0 : '—'}</span></div>
                                <div class="bw-pool-spent" id="bw-def-group-spent">&nbsp;</div>
                                <div class="bw-pool-mult">×2 → +R</div>
                            </div>
                            <div class="bw-pool" id="bw-pool-def-faction" style="${!defenderHasOwner || defFactionOwnRoot ? 'opacity:0.4;' : ''}">
                                <div class="bw-pool-label">FACTION ₿</div>
                                <div class="bw-pool-row">₿<span id="bw-def-faction-avail">${!defenderHasOwner ? '—' : defFactionOwnRoot ? '—' : defFactionAvail0}</span></div>
                                <div class="bw-pool-spent" id="bw-def-faction-spent">&nbsp;</div>
                                <div class="bw-pool-mult">×1 → +R</div>
                            </div>
                        </div>
                        <div class="bw-contribution">
                            <div class="bw-contribution-label">RESISTANCE</div>
                            <div class="bw-contribution-value">
                                <span id="bw-def-base">${isShadowVeil ? '?' : targetResistance}</span>
                                <span style="color:var(--accent-yellow);font-size:14px;"> + <span id="bw-def-bid">0</span></span>
                            </div>
                            <div style="font-size:9px;color:#64748b;margin-top:2px;">BASE + BID</div>
                        </div>
                    </div>
                </div>

                <div id="bidding-log" class="bw-log">
                    <!-- bidding log filled here -->
                </div>
                </div><!-- /.bw-scroll -->

                <div class="bw-controls-area">
                    <!-- Human Controls -->
                    <div id="human-controls" style="display:none;">
                        <div class="bw-your-turn-banner">
                            <div class="bw-your-turn-title">⚡ YOUR TURN TO BID</div>
                            <div id="human-role-info" class="bw-your-turn-sub"></div>
                        </div>
                        <div id="human-interfere-select" style="display:none;margin-bottom:10px;">
                            <select id="interfere-node-select" class="transfer-input" style="margin-top:0;height:32px;font-size:13px;padding:4px 8px;"></select>
                        </div>
                        <div id="human-stance-select" style="margin-bottom:10px;display:none;gap:15px;justify-content:center;background:rgba(0,0,0,0.3);padding:6px;border-radius:4px;border:1px solid #1a202c;">
                            <label style="font-size:13px;color:var(--accent-green);display:flex;align-items:center;gap:6px;cursor:pointer;">
                                <input type="radio" name="bid-stance" value="support" checked> ⚔️ SUPPORT
                            </label>
                        </div>
                        <div class="bw-sliders-grid">
                            <div class="bw-slider-block">
                                <label id="btc-bid-label">
                                    <span id="btc-bid-label-text">FROM GROUP TREASURY</span>
                                    <span class="bw-pool-pill">Available: <span id="human-btc-avail" style="font-weight:bold;color:var(--text-white);">₿0</span></span>
                                </label>
                                <div class="bw-slider-row">
                                    <input id="btc-bid-input" type="range" min="0" max="0" step="1" value="0" style="accent-color:var(--accent-yellow);">
                                    <button id="bw-max-group" class="bw-max-btn" type="button" title="Bid maximum from this pool">MAX</button>
                                </div>
                                <div class="bw-slider-readout" style="color:var(--accent-yellow);">
                                    +<span id="btc-bid-val">0</span> ₿TC <span id="btc-bid-val-mult" style="font-size:11px;color:#94a3b8;margin-left:6px;"></span>
                                </div>
                            </div>
                            <div id="btc-bid-faction-row" class="bw-slider-block" style="display:none;">
                                <label>
                                    <span>FROM FACTION TREASURY <span style="color:#64748b;font-size:10px;">(×1)</span></span>
                                    <span class="bw-pool-pill">Available: <span id="human-faction-btc-avail" style="font-weight:bold;color:var(--text-white);">₿0</span></span>
                                </label>
                                <div class="bw-slider-row">
                                    <input id="btc-bid-input-faction" type="range" min="0" max="0" step="1" value="0" style="accent-color:var(--accent-blue);">
                                    <button id="bw-max-faction" class="bw-max-btn" type="button" title="Bid maximum from this pool">MAX</button>
                                </div>
                                <div class="bw-slider-readout" style="color:var(--accent-blue);">
                                    +<span id="btc-bid-val-faction">0</span> ₿TC <span style="font-size:11px;color:#94a3b8;margin-left:6px;">= -<span id="btc-bid-val-faction-mult">0</span> Str</span>
                                </div>
                            </div>
                        </div>
                        <div class="bw-btn-row">
                            <button id="btc-bid-commit" class="action-btn bw-btn-commit">✅ COMMIT BID</button>
                            <button id="btc-bid-pass" class="action-btn bw-btn-pass">PASS (FINAL)</button>
                            <button id="btc-bid-cancel" class="action-btn bw-btn-cancel" style="display:none;">CANCEL ATTACK</button>
                        </div>
                        <div style="text-align:center;font-size:9px;color:#475569;margin-top:6px;letter-spacing:1px;">PASS IS FINAL · YOU CANNOT RE-ENTER</div>
                    </div>

                    <div id="ai-controls" class="bw-ai-area" style="display:none;">
                        <span class="bidding-pulse" style="font-size:13px;letter-spacing:1.5px;color:#cbd5e0;">⏳ <span id="active-player-name" style="color:var(--text-white);font-weight:bold;">Player</span> is deciding...</span>
                        <div class="bw-ai-progress"><div class="bw-ai-progress-bar" id="bw-ai-progress-bar"></div></div>
                        <div id="bidding-timer" style="display:none;margin-top:8px;font-size:11px;color:var(--accent-yellow);"></div>
                    </div>
                </div>
            </div>
        `;
    let turnIdx = 0;
    let isFirstRound = true;
    let lastChanceClass = null; // Track class for SFX feedback

    // ═══ PASS IS FINAL: once a player passes, they are permanently out ═══
    const passedPlayers = new Set();
    // ═══ Track who has had at least one bid turn. The bidding war cannot
    // conclude until every participant in `order` has acted at least once
    // — this guarantees the defender always gets an opportunity to respond,
    // even when the attacker commits with 0 BTC on the first tick.
    const playersWhoHaveBid = new Set();
    const logEl = overlay.querySelector('#bidding-log');
    const preview = overlay.querySelector('#bidding-preview');
    const humanControls = overlay.querySelector('#human-controls');
    const aiControls = overlay.querySelector('#ai-controls');
    const activeName = overlay.querySelector('#active-player-name');
    const humanRoleInfo = overlay.querySelector('#human-role-info');
    const interfereSelect = overlay.querySelector('#human-interfere-select');
    const interfereNodeSelect = overlay.querySelector('#interfere-node-select');
    const slider = overlay.querySelector('#btc-bid-input');
    const valDisplay = overlay.querySelector('#btc-bid-val');
    const valDisplayMult = overlay.querySelector('#btc-bid-val-mult');
    const bidLabelText = overlay.querySelector('#btc-bid-label-text');
    const availDisplay = overlay.querySelector('#human-btc-avail');
    const factionRow = overlay.querySelector('#btc-bid-faction-row');
    const factionSlider = overlay.querySelector('#btc-bid-input-faction');
    const factionVal = overlay.querySelector('#btc-bid-val-faction');
    const factionValMult = overlay.querySelector('#btc-bid-val-faction-mult');
    const factionAvail = overlay.querySelector('#human-faction-btc-avail');
    const commitBtn = overlay.querySelector('#btc-bid-commit');
    const passBtn = overlay.querySelector('#btc-bid-pass');
    const cancelBtn = overlay.querySelector('#btc-bid-cancel');

    // ─── Multiplayer bid-event queue ───
    // Topic delivery can race ahead of the local runLoop. Keep unmatched
    // bid/cancel events instead of dropping them so a future bidder turn can
    // consume the event deterministically.
    if (!Array.isArray(window._biddingWarEventQueue)) window._biddingWarEventQueue = [];
    function isEventForThisWar(event) {
      return !!event?.warId && event.warId === biddingWarId;
    }
    function getEventTurnIdx(event) {
      const idx = Number(event?.turnIdx);
      return Number.isInteger(idx) ? idx : null;
    }
    function isEventStaleForCurrentTurn(event) {
      const eventTurnIdx = getEventTurnIdx(event);
      return eventTurnIdx !== null && eventTurnIdx < turnIdx;
    }
    function isEventFutureForCurrentTurn(event) {
      const eventTurnIdx = getEventTurnIdx(event);
      return eventTurnIdx !== null && eventTurnIdx > turnIdx;
    }
    function takeQueuedBidFor(playerId) {
      for (let i = 0; i < window._biddingWarEventQueue.length; i++) {
        const ev = window._biddingWarEventQueue[i];
        if (!ev || !isEventForThisWar(ev)) continue;
        if (isEventStaleForCurrentTurn(ev)) {
          console.warn('[biddingWar] Dropping stale queued bid event:', ev);
          window._biddingWarEventQueue.splice(i, 1);
          i--;
          continue;
        }
        if (isEventFutureForCurrentTurn(ev)) continue;
        if (ev.type === 'cancel' || ev.playerId === playerId) {
          return window._biddingWarEventQueue.splice(i, 1)[0];
        }
      }
      return null;
    }
    function isEventForExpectedActivePlayer(event, expectedPlayerId) {
      if (!event?.activePlayerId) return true;
      return event.activePlayerId === expectedPlayerId;
    }
    function queueUnmatchedBidEvent(event) {
      if (!event || !isEventForThisWar(event)) return;
      if (isEventStaleForCurrentTurn(event)) {
        console.warn('[biddingWar] Dropping stale unmatched bid event:', event);
        return;
      }
      const duplicateIdx = window._biddingWarEventQueue.findIndex(ev => ev && ev.warId === event.warId && ev.type === event.type && ev.playerId === event.playerId && ev.turnIdx === event.turnIdx);
      if (duplicateIdx !== -1) {
        window._biddingWarEventQueue[duplicateIdx] = event;
        return;
      }
      window._biddingWarEventQueue.push(event);
      if (window._biddingWarEventQueue.length > 24) window._biddingWarEventQueue.shift();
    }
    function getParticipantRole(playerId) {
      if (playerId === attackerId) return 'attacker';
      if (playerId === targetOwnerId) return 'defender';
      return 'interferer';
    }
    function isLegalInterfererNode(playerId, nodeId) {
      const node = nodeId ? G.nodes[nodeId] : null;
      return !!node && node.owner === playerId && !node.hasActedThisRound;
    }
    function getLegalActingNodeId(playerId, proposedNodeId = null) {
      const role = getParticipantRole(playerId);
      if (role === 'attacker') return attackerNodeId;
      if (role === 'defender') return targetNode.id;
      if (isLegalInterfererNode(playerId, proposedNodeId)) return proposedNodeId;
      if (isLegalInterfererNode(playerId, actingNodes[playerId])) return actingNodes[playerId];
      const fallbackNode = pickAIActingNode(playerId, role, attackerNodeId, targetNode.id);
      return fallbackNode?.id || null;
    }
    function getLegalStance(playerId, proposedStance = null) {
      const role = getParticipantRole(playerId);
      if (role === 'attacker') return 'support';
      return proposedStance === 'support' || proposedStance === 'defend' ? proposedStance : stances[playerId] || 'defend';
    }
    function normalizeAuthoritativeBidEvent(event, expectedPlayerId) {
      const safeActingNodeId = getLegalActingNodeId(expectedPlayerId, event?.actingNodeId || null);
      const safeStance = getLegalStance(expectedPlayerId, event?.stance || null);
      actingNodes[expectedPlayerId] = safeActingNodeId;
      stances[expectedPlayerId] = safeStance;
      const requestedAmount = Math.max(0, parseInt(event?.amount) || 0);
      const available = getParticipantAvailBtc(expectedPlayerId);
      const amount = Math.min(requestedAmount, available);
      if (requestedAmount !== amount) {
        console.warn('[biddingWar] Clamped remote bid amount to local card BTC availability:', {
          requestedAmount,
          amount,
          available,
          event
        });
      }
      // Faction-pool clamp — only meaningful for attacker / defender.
      let factionAmount = 0;
      if (expectedPlayerId === attackerId || expectedPlayerId === targetOwnerId && expectedPlayerId !== attackerId) {
        const requestedFaction = Math.max(0, parseInt(event?.factionAmount) || 0);
        const rootAvail = getRootBtc(expectedPlayerId);
        factionAmount = Math.min(requestedFaction, rootAvail);
        if (requestedFaction !== factionAmount) {
          console.warn('[biddingWar] Clamped remote bid factionAmount to local root BTC availability:', {
            requestedFaction,
            factionAmount,
            rootAvail,
            event
          });
        }
      }
      return {
        amount,
        factionAmount,
        actingNodeId: safeActingNodeId,
        stance: safeStance
      };
    }
    function pruneStalePendingBids() {
      Object.keys(pendingBids).forEach(pid => {
        const pendingTurnIdx = Number.isInteger(pendingBids[pid]?.turnIdx) ? pendingBids[pid].turnIdx : null;
        if (pendingTurnIdx !== null && pendingTurnIdx < turnIdx) delete pendingBids[pid];
      });
    }

    // ─── Optimistic Sync ───
    const pendingBids = {}; // Map of playerId -> { amount, turnIdx, stance, actingNodeId, seq }
    const pendingPreviewQueue = [];
    let pendingPreviewSeq = 0;
    function queuePendingPreviewEvent(event) {
      if (!event || !isEventForThisWar(event)) return;
      if (isEventStaleForCurrentTurn(event)) {
        delete pendingBids[event.playerId];
        return;
      }
      const duplicateIdx = pendingPreviewQueue.findIndex(ev => ev && ev.warId === event.warId && ev.playerId === event.playerId && ev.turnIdx === event.turnIdx && ev.activePlayerId === event.activePlayerId);
      if (duplicateIdx !== -1) {
        const existingSeq = Number(pendingPreviewQueue[duplicateIdx]?.seq) || 0;
        const incomingSeq = Number(event.seq) || 0;
        if (incomingSeq >= existingSeq) pendingPreviewQueue[duplicateIdx] = event;
      } else pendingPreviewQueue.push(event);
      if (pendingPreviewQueue.length > 24) pendingPreviewQueue.shift();
    }
    function applyPendingPreviewEvent(event) {
      if (!isEventForThisWar(event)) return false;
      if (isEventStaleForCurrentTurn(event)) {
        delete pendingBids[event.playerId];
        return false;
      }
      if (isEventFutureForCurrentTurn(event)) {
        queuePendingPreviewEvent(event);
        return false;
      }
      const currentActive = order[turnIdx % order.length];
      if (event.activePlayerId && event.activePlayerId !== currentActive) return false;
      if (event.playerId === HUMAN_ID || event.playerId !== currentActive) return false;
      const incomingSeq = Number(event.seq) || 0;
      const currentSeq = Number(pendingBids[event.playerId]?.seq) || 0;
      if (currentSeq && incomingSeq && incomingSeq < currentSeq) return false;
      const safeActingNodeId = getLegalActingNodeId(event.playerId, event.actingNodeId || null);
      const safeStance = getLegalStance(event.playerId, event.stance || null);
      const previousActingNodeId = actingNodes[event.playerId];
      actingNodes[event.playerId] = safeActingNodeId;
      const available = getParticipantAvailBtc(event.playerId);
      actingNodes[event.playerId] = previousActingNodeId;
      // For defenders, also clamp the faction-treasury preview amount to
      // their current root BTC.
      let pendingFaction = 0;
      if (event.playerId === targetOwnerId && event.playerId !== attackerId && safeStance === 'defend') {
        const rootId = G.players[event.playerId]?.rootNodeId;
        const rootBtc = rootId ? G.nodes[rootId]?.btc || 0 : 0;
        pendingFaction = Math.min(Math.max(0, parseInt(event.factionAmount) || 0), rootBtc);
      }
      pendingBids[event.playerId] = {
        amount: Math.min(Math.max(0, parseInt(event.amount) || 0), available),
        factionAmount: pendingFaction,
        turnIdx: getEventTurnIdx(event),
        stance: safeStance,
        actingNodeId: safeActingNodeId,
        seq: incomingSeq
      };
      updatePreview();
      return true;
    }
    function drainPendingPreviewQueueForCurrentTurn() {
      for (let i = 0; i < pendingPreviewQueue.length; i++) {
        const event = pendingPreviewQueue[i];
        if (!event || !isEventForThisWar(event) || isEventStaleForCurrentTurn(event)) {
          pendingPreviewQueue.splice(i, 1);
          i--;
          continue;
        }
        if (isEventFutureForCurrentTurn(event)) continue;
        pendingPreviewQueue.splice(i, 1);
        i--;
        applyPendingPreviewEvent(event);
      }
    }
    let lastBroadcastTime = 0;
    function broadcastPendingBid(amount) {
      return;
    }
    window._onBiddingWarPending = event => {
      if (!isEventForThisWar(event)) return;
      applyPendingPreviewEvent(event);
    };
    if (Array.isArray(window._earlyBiddingPending)) {
      window._earlyBiddingPending = window._earlyBiddingPending.filter(event => {
        if (event?.warId !== biddingWarId) return true;
        applyPendingPreviewEvent(event);
        return false;
      });
    }

    // Center-screen modal: attach to body for proper z-index / viewport coverage.
    document.body.appendChild(overlay);

    // ─── Minimize / restore behaviour ───
    // While minimized, the modal is hidden and a floating pill near the
    // bottom of the screen lets the player re-open it. The bidding-war
    // state machine continues to run in the background; only the UI is
    // hidden so the board can be inspected.
    let minimizePill = null;
    function setMinimized(min) {
      if (min) {
        overlay.classList.add('minimized');
        if (!minimizePill) {
          minimizePill = document.createElement('div');
          minimizePill.className = 'bw-min-pill';
          minimizePill.id = 'bw-min-pill';
          minimizePill.innerHTML = '⚔️ <span>RETURN TO BIDDING</span>';
          minimizePill.onclick = () => setMinimized(false);
          document.body.appendChild(minimizePill);
        }
      } else {
        overlay.classList.remove('minimized');
        if (minimizePill && minimizePill.parentNode) {
          minimizePill.parentNode.removeChild(minimizePill);
        }
        minimizePill = null;
      }
    }
    const minBtn = overlay.querySelector('#bw-minimize-btn');
    if (minBtn) minBtn.onclick = () => setMinimized(true);

    // Highlight the attacker node on the board (OMNIS: only attacker's own power counts)
    if (gameGraphScene) {
      if (G._shadowVeilActive) {
        gameGraphScene.setBiddingWarHighlights([], null);
      } else {
        gameGraphScene.setBiddingWarHighlights([attackerNodeId], targetNode.id);
      }
    }
    function cleanup() {
      console.log('[biddingWar] cleanup() called. attackerId=' + attackerId + ' isLocalAttacker=' + (attackerId === HUMAN_ID) + ' hasPendingState=' + !!window._pendingMultiplayerState);
      window._onBiddingWarPending = null;
      window.onBiddingWarBid = null;
      window.updateBiddingWarPreview = null;
      commitBtn.onclick = null;
      passBtn.onclick = null;
      cancelBtn.onclick = null;
      window._biddingWarEventQueue = (window._biddingWarEventQueue || []).filter(ev => ev?.warId && ev.warId !== biddingWarId);
      window._earlyBiddingBids = (window._earlyBiddingBids || []).filter(ev => ev?.warId && ev.warId !== biddingWarId);
      window._earlyBiddingPending = (window._earlyBiddingPending || []).filter(ev => ev?.warId && ev.warId !== biddingWarId);
      pendingPreviewQueue.length = 0;
      if (window._activeBiddingWarId === biddingWarId) window._activeBiddingWarId = null;
      // Drop minimize pill if it's still up.
      if (minimizePill && minimizePill.parentNode) {
        minimizePill.parentNode.removeChild(minimizePill);
        minimizePill = null;
      }
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      if (gameGraphScene) {
        gameGraphScene.setBiddingWarHighlights([], null);
      }

      // ⚡ Clear bidding-war-active flag and flush any deferred multiplayer state.
      window._biddingWarActive = false;
      if (window._pendingMultiplayerState) {
        const pending = window._pendingMultiplayerState;
        window._pendingMultiplayerState = null;
        // Slight delay so the post-attack UI on the attacker's side has time
        // to render before the state replaces everything.
        console.log('[biddingWar] Scheduling deferred-state flush in 50ms (pending v' + (pending._stateVersion || '?') + ' from ' + pending._lastWriterId + ')');
        setTimeout(() => applyIncomingMultiplayerState(pending), 50);
      }
    }
    function addLog(msg, color = 'white', borderColor = 'transparent') {
      const div = document.createElement('div');
      div.className = 'bidding-log-entry';
      div.style.color = color;
      if (borderColor !== 'transparent') {
        div.style.borderLeftColor = borderColor;
      }
      div.innerHTML = msg;
      logEl.appendChild(div);
      logEl.scrollTop = logEl.scrollHeight;
    }

    // Get the list of players still active (haven't passed)
    function getActivePlayers() {
      return order.filter(pid => !passedPlayers.has(pid));
    }
    function updateGraphBidders(tempBids) {
      if (!gameGraphScene) return;
      const chainIds = G._shadowVeilActive ? [] : [attackerNodeId]; // OMNIS: only attacker node, no ancestor chain
      const activeBidders = [];
      Object.entries(tempBids).forEach(([pid, amt]) => {
        if (passedPlayers.has(pid)) return; // Stop glowing if they passed

        // Only show interferers if they have actually bid > 0
        if (amt > 0 && pid !== attackerId && pid !== targetOwnerId) {
          activeBidders.push({
            id: actingNodes[pid],
            role: 'interferer',
            stance: stances[pid]
          });
        }
        // Always show defender if they have bid > 0
        if (amt > 0 && pid === targetOwnerId && pid !== attackerId) {
          if (!G._shadowVeilActive) {
            activeBidders.push({
              id: actingNodes[pid],
              role: 'defender',
              stance: stances[pid]
            });
          }
        }
      });

      // Render temporary BTC deduction from each chosen bidding card only
      const tempNodes = JSON.parse(JSON.stringify(G.nodes));
      Object.entries(tempBids).forEach(([pid, amt]) => {
        if (amt > 0 && actingNodes[pid] && tempNodes[actingNodes[pid]]) {
          tempNodes[actingNodes[pid]].btc = Math.max(0, (tempNodes[actingNodes[pid]].btc || 0) - amt);
        }
      });
      gameGraphScene.updateGraph({
        nodes: tempNodes,
        links: buildLinksFromTree()
      }, HUMAN_ID);
      gameGraphScene.setBiddingWarHighlights(chainIds, G._shadowVeilActive ? null : targetNode.id, activeBidders);
    }
    function updatePreview() {
      const activePlayers = getActivePlayers();
      let tempBids = {
        ...bids
      };

      // Only the attacker and defender can put BTC into the war. Their
      // committed contributions are pre-aggregated by the split-pool
      // helpers; the raw `bids[]` map is now only used for highlight VFX.
      let previewAtt = getAttackerEffectiveBtc();
      let previewDef = getDefenderEffectiveBtc();
      // Track pending mid-bid amounts so we can show the breakdown.
      let pendingAtkGroup = 0;
      let pendingAtkFaction = 0;
      let pendingDefGroup = 0;
      let pendingDefFaction = 0;
      if (activePlayers.length > 0) {
        let activePlayer = order[turnIdx % order.length];
        // Fast-forward to current valid player for preview if somehow out of sync
        let tempIdx = turnIdx;
        while (passedPlayers.has(activePlayer) && tempIdx < turnIdx + order.length) {
          tempIdx++;
          activePlayer = order[tempIdx % order.length];
        }
        for (const [pid, pending] of Object.entries(pendingBids)) {
          const pendingTurnIdx = Number.isInteger(pending?.turnIdx) ? pending.turnIdx : null;
          if (pendingTurnIdx !== null && pendingTurnIdx !== turnIdx) {
            delete pendingBids[pid];
            continue;
          }
          if (pid !== activePlayer || pid === HUMAN_ID) continue;
          const pendingAmount = Math.max(0, parseInt(pending.amount) || 0);
          // Remote attacker / defender split bids carry a faction amount.
          const pendingFactionAmount = Math.max(0, parseInt(pending.factionAmount) || 0);
          const pendingStance = pending.stance || stances[pid];
          if (pending.actingNodeId) actingNodes[pid] = pending.actingNodeId;
          tempBids[pid] = (tempBids[pid] || 0) + pendingAmount + pendingFactionAmount;
          if (pid === targetOwnerId && pid !== attackerId && pendingStance === 'defend') {
            // Defender pending: group ₿ ×2, faction ₿ ×1
            pendingDefGroup += pendingAmount;
            pendingDefFaction += pendingFactionAmount;
            previewDef += pendingAmount * 2 + pendingFactionAmount;
          } else if (pid === attackerId) {
            // Attacker pending: group ₿ ×1, faction ₿ ×1
            pendingAtkGroup += pendingAmount;
            pendingAtkFaction += pendingFactionAmount;
            previewAtt += pendingAmount + pendingFactionAmount;
          }
        }
        if (humanControls.style.display !== 'none' && activePlayer === HUMAN_ID) {
          const role = activePlayer === attackerId ? 'attacker' : activePlayer === targetNode.owner ? 'defender' : 'interferer';
          if (role === 'defender') {
            // Defender split-slider UI. Read both pools.
            const grp = parseInt(slider.value) || 0;
            const fac = parseInt(factionSlider?.value) || 0;
            tempBids[HUMAN_ID] = (tempBids[HUMAN_ID] || 0) + grp + fac;
            pendingDefGroup += grp;
            pendingDefFaction += fac;
            previewDef += grp * 2 + fac;
          } else if (role === 'attacker') {
            // Attacker split-slider UI. Both pools count 1:1.
            const grp = parseInt(slider.value) || 0;
            const fac = parseInt(factionSlider?.value) || 0;
            tempBids[HUMAN_ID] = (tempBids[HUMAN_ID] || 0) + grp + fac;
            pendingAtkGroup += grp;
            pendingAtkFaction += fac;
            previewAtt += grp + fac;
          }
          // Interferer role is now spectator-only — ignored.
        }
      }

      // Live stat recalculation in case action cards were played mid-bid
      const liveAtkNode = G.nodes[attackerNodeId];
      const liveTgtNode = G.nodes[targetNode.id];
      let liveBaseAttack = baseAttackPower;
      let liveTargetRes = targetResistance;
      const totalAtkGroup = attackerSpent.group + pendingAtkGroup;
      const totalAtkFaction = attackerSpent.faction + pendingAtkFaction;
      const totalDefGroup = defenderSpent.group + pendingDefGroup;
      const totalDefFaction = defenderSpent.faction + pendingDefFaction;
      let breakdown = {
        attackerPower: baseAttackPower,
        btcSpent: previewAtt,
        attackerGroupBtc: totalAtkGroup,
        attackerFactionBtc: totalAtkFaction,
        targetResistance: targetResistance,
        defenderBtcSpent: previewDef,
        defenderGroupBtc: totalDefGroup,
        defenderFactionBtc: totalDefFaction,
        alignmentModifier: alignMod,
        isEndgame: G.isEndgame,
        distanceBonus: distanceBonus
      };
      if (liveAtkNode && liveTgtNode) {
        const liveDefAbility = ignoreDefenseAbility ? 0 : getDefenseAbilityModifier(G.nodes, liveTgtNode, G._networkBlackout);
        const rawAtkPower = getAttackStrength(G.nodes, liveAtkNode.id, G._networkBlackout) + getAttackAbilityModifier(G.nodes, liveAtkNode, liveTgtNode, G._networkBlackout) + loyaltyBonus;
        let rawTgtRes = getEffectiveResistance(G.nodes, liveTgtNode.id, G._networkBlackout) - resistancePenalty - liveDefAbility;
        if (attackType === ATTACK_TYPES.NEUTRALIZE) rawTgtRes = Math.ceil(rawTgtRes / 2);else if (attackType === ATTACK_TYPES.DESTROY && liveTgtNode.owner) rawTgtRes *= 2;
        let actionBuffs = 0;
        const buffs = G._actionBuffs?.[attackerId];
        if (buffs) {
          if (buffs.nextAttackPower) actionBuffs += buffs.nextAttackPower;
          if (buffs.viralFrenzy) actionBuffs += liveTgtNode.alignments?.includes('Media') ? 7 : 3;
          if (buffs.nostalgiaBomb && liveTgtNode.alignments?.some(a => ['Legacy', 'Cultural'].includes(a))) actionBuffs += 5;
        }

        // ═══ Global event bonuses (must match the values baked into baseAttackPower) ═══
        // Global Panic: +2 Power to all attacks
        // Viral Thread: +5 Power to Media attackers (consumed at attack start —
        //   re-check by comparing `baseAttackPower` against what we'd compute
        //   without it; we just take whichever is larger to avoid drift).
        let eventBonus = 0;
        if (G._globalPanicActive) eventBonus += 2;
        // Note: Viral Thread is single-use & already consumed before runBiddingWar
        // was called, so we can't recompute it from G state — use the delta.

        liveBaseAttack = rawAtkPower + actionBuffs + eventBonus;

        // Safety: if the caller's baseAttackPower exceeds our recomputed value
        // (e.g., from Viral Thread bonus that's already been consumed), respect
        // the original. This prevents the preview from under-counting strength
        // at war start time and triggering a false 0% display.
        if (baseAttackPower > liveBaseAttack) {
          liveBaseAttack = baseAttackPower;
        }
        liveTargetRes = rawTgtRes;
        // Symmetric safety: if the caller's targetResistance is LOWER than our
        // recomputed value (e.g., faction-ability resistance reduction was already
        // applied at war start and the faction-ability cooldown flag has since
        // flipped back), keep the lower (more favourable-for-attacker) number.
        if (targetResistance < liveTargetRes) {
          liveTargetRes = targetResistance;
        }

        // Update breakdown with live stats
        breakdown.attackerPower = liveBaseAttack;
        breakdown.targetResistance = liveTargetRes;
        breakdown.loyaltyBonus = loyaltyBonus;
        breakdown.actionBuffs = actionBuffs;
      }
      const finalStr = computeAttackStrength({
        attackerPower: liveBaseAttack,
        transferPower: 0,
        btcSpent: previewAtt,
        targetResistance: liveTargetRes,
        defenderBtcSpent: previewDef,
        alignmentModifier: alignMod,
        attackAbilityMod: 0,
        defenseAbilityMod: 0,
        loyaltyBonus: 0,
        isEndgame: G.isEndgame,
        distanceBonus
      });
      const chance = getSuccessChance(finalStr + (dieMod ? -dieMod : 0));
      const rerollNote = hasReroll ? ' 🎮' : '';
      const dieNote = dieMod ? ` ✨${dieMod > 0 ? '-' : '+'}${Math.abs(dieMod)} roll` : '';
      const distNote = distanceBonus ? ` 📍${distanceBonus > 0 ? `<span style="color:var(--accent-red)">-${distanceBonus}</span>` : `<span style="color:var(--accent-green)">+${Math.abs(distanceBonus)}</span>`}` : '';
      const passedCount = passedPlayers.size;
      const statusNote = passedCount > 0 ? ` · <span style="color:#718096">${passedCount} out</span>` : '';
      const isLocalDefender = HUMAN_ID === targetOwnerId && HUMAN_ID !== attackerId;

      // Attacker wants high chance (green), Defender wants low chance (green).
      let chanceColor = 'var(--text-white)';
      let chanceClass = ''; // 'good', 'bad', 'neutral'
      if (chance >= 70) {
        chanceClass = isLocalDefender ? 'bad' : 'good';
        chanceColor = isLocalDefender ? 'var(--accent-red)' : 'var(--accent-green)';
      } else if (chance <= 30) {
        chanceClass = isLocalDefender ? 'good' : 'bad';
        chanceColor = isLocalDefender ? 'var(--accent-green)' : 'var(--accent-red)';
      } else {
        chanceClass = 'neutral';
        chanceColor = 'var(--accent-yellow)';
      }

      // 🎵 SFX: play sound if we just shifted into the "good" zone
      if (chanceClass === 'good' && lastChanceClass !== 'good') {
        SFX.playSuccessShift();
      }
      lastChanceClass = chanceClass;
      if (isShadowVeil) {
        preview.innerHTML = `<span style="color:var(--accent-purple);font-weight:bold;">🕳️ SHADOW VEIL ACTIVE</span>${statusNote}`;
        preview.style.color = 'var(--accent-purple)';
      } else {
        preview.innerHTML = `<span class="str-breakdown-trigger" style="cursor:help; border-bottom: 1px dotted rgba(255,255,255,0.3);">Str: <strong>${finalStr}</strong></span> → <strong>${chance.toFixed(0)}%</strong>${rerollNote}${dieNote}${distNote}${statusNote}`;
        preview.style.color = chanceColor;
      }

      // ═══ Update the central strength disc (new modal) ═══
      const discStr = overlay.querySelector('#bw-disc-strength');
      const discChance = overlay.querySelector('#bw-disc-chance');
      const discEl = overlay.querySelector('#bw-strength-disc');
      if (discStr && discChance && discEl) {
        if (isShadowVeil) {
          discStr.textContent = '?';
          discChance.textContent = '???';
          discEl.className = 'bw-strength-disc str-breakdown-trigger';
          discChance.className = 'bw-disc-chance';
        } else {
          discStr.textContent = finalStr;
          discChance.textContent = chance >= 100 ? 'GUARANTEED' : `${chance.toFixed(0)}%`;
          discEl.className = `bw-strength-disc str-breakdown-trigger ${chanceClass}`;
          discChance.className = `bw-disc-chance ${chanceClass}`;
        }
      }

      // Modifier chips (alignment / distance / endgame / die / reroll)
      const modsEl = overlay.querySelector('#bw-mods');
      if (modsEl) {
        const chips = [];
        if (!isShadowVeil) {
          if (alignMod !== 0) {
            chips.push(`<span class="bw-mod ${alignMod > 0 ? 'pos' : 'neg'}">ALIGN ${alignMod > 0 ? '+' : ''}${alignMod}</span>`);
          }
          if (distanceBonus) {
            chips.push(`<span class="bw-mod ${distanceBonus > 0 ? 'neg' : 'pos'}">DIST ${distanceBonus > 0 ? '-' : '+'}${Math.abs(distanceBonus)}</span>`);
          }
          if (G.isEndgame) chips.push(`<span class="bw-mod pos">ENDGAME +1</span>`);
          if (dieMod) chips.push(`<span class="bw-mod ${dieMod > 0 ? 'neg' : 'pos'}">DIE ${dieMod > 0 ? '-' : '+'}${Math.abs(dieMod)}</span>`);
          if (hasReroll) chips.push(`<span class="bw-mod pos">🎮 REROLL</span>`);
          if (passedCount > 0) chips.push(`<span class="bw-mod">${passedCount} OUT</span>`);
        }
        modsEl.innerHTML = chips.join('');
      }

      // ═══ Live side-panel population ═══
      // Attacker pools — live BTC balances + currently-staked amounts
      const setText = (id, val) => {
        const el = overlay.querySelector(id);
        if (el) el.textContent = val;
      };
      const setHTML = (id, val) => {
        const el = overlay.querySelector(id);
        if (el) el.innerHTML = val;
      };

      // Attacker Group ₿
      const liveAtkGroupBtc = atkNode ? atkNode.btc || 0 : 0;
      const liveAtkRoot = atkRootId ? G.nodes[atkRootId] : null;
      const liveAtkFactionBtc = liveAtkRoot && !atkFactionOwnRoot ? liveAtkRoot.btc || 0 : 0;
      setText('#bw-atk-group-avail', liveAtkGroupBtc);
      setHTML('#bw-atk-group-spent', totalAtkGroup > 0 ? `<span style="color:var(--accent-yellow);">−₿${totalAtkGroup} staked</span>` : '&nbsp;');
      if (!atkFactionOwnRoot) {
        setText('#bw-atk-faction-avail', liveAtkFactionBtc);
        setHTML('#bw-atk-faction-spent', totalAtkFaction > 0 ? `<span style="color:var(--accent-yellow);">−₿${totalAtkFaction} staked</span>` : '&nbsp;');
      }

      // Defender pools
      if (defenderHasOwner) {
        const liveDefNode = G.nodes[targetNode.id];
        const liveDefGroupBtc = liveDefNode ? liveDefNode.btc || 0 : 0;
        const liveDefRoot = defRootId ? G.nodes[defRootId] : null;
        const liveDefFactionBtc = liveDefRoot && !defFactionOwnRoot ? liveDefRoot.btc || 0 : 0;
        setText('#bw-def-group-avail', liveDefGroupBtc);
        setHTML('#bw-def-group-spent', totalDefGroup > 0 ? `<span style="color:var(--accent-yellow);">−₿${totalDefGroup} staked</span>` : '&nbsp;');
        if (!defFactionOwnRoot) {
          setText('#bw-def-faction-avail', liveDefFactionBtc);
          setHTML('#bw-def-faction-spent', totalDefFaction > 0 ? `<span style="color:var(--accent-yellow);">−₿${totalDefFaction} staked</span>` : '&nbsp;');
        }
      }

      // Base + Bid contribution numbers
      if (!isShadowVeil) {
        setText('#bw-atk-base', liveBaseAttack);
        setText('#bw-atk-bid', previewAtt);
        setText('#bw-def-base', liveTargetRes);
        setText('#bw-def-bid', previewDef);
      } else {
        setText('#bw-atk-base', '?');
        setText('#bw-atk-bid', '?');
        setText('#bw-def-base', '?');
        setText('#bw-def-bid', '?');
      }

      // Active-turn glow on whichever side is currently bidding
      const activePid = order[turnIdx % order.length];
      const atkSideEl = overlay.querySelector('#bw-side-attacker');
      const defSideEl = overlay.querySelector('#bw-side-defender');
      if (atkSideEl && defSideEl) {
        atkSideEl.classList.toggle('active-turn', activePid === attackerId);
        defSideEl.classList.toggle('active-turn', activePid === targetOwnerId && activePid !== attackerId);
      }

      // ═══ Live header refresh — reflect mid-bid stat changes ═══
      // (Action cards like Narrative Rewrite, Outrage Supernova, Black Budget,
      // Influence Storm etc. can mutate attacker Power or target Resistance
      // while the war is active. Update the header so the bidding panel
      // never shows stale stats.)
      if (!isShadowVeil) {
        const baseStrEl = overlay.querySelector('#bw-header-base-str');
        const tgtResEl = overlay.querySelector('#bw-header-target-res');
        if (baseStrEl) {
          baseStrEl.textContent = liveBaseAttack;
          if (liveBaseAttack !== baseAttackPower) {
            baseStrEl.style.textShadow = `0 0 6px var(--accent-yellow)`;
            baseStrEl.title = `Updated mid-bid (was ${baseAttackPower})`;
          } else {
            baseStrEl.style.textShadow = 'none';
            baseStrEl.title = '';
          }
        }
        if (tgtResEl) {
          tgtResEl.textContent = liveTargetRes;
          if (liveTargetRes !== targetResistance) {
            tgtResEl.style.textShadow = `0 0 6px var(--accent-yellow)`;
            tgtResEl.title = `Updated mid-bid (was ${targetResistance})`;
          } else {
            tgtResEl.style.textShadow = 'none';
            tgtResEl.title = '';
          }
        }
      }

      // Add hover breakdown listeners (attached to the new strength disc)
      const trigger = overlay.querySelector('#bw-strength-disc');
      if (trigger) {
        trigger.onmouseenter = e => {
          if (!cardTooltip) return;
          cardTooltip.innerHTML = `
                        <div style="background:var(--bg-panel); border:1px solid var(--accent-yellow); padding:15px; border-radius:8px; font-family:var(--font-mono); box-shadow:0 0 20px rgba(0,0,0,0.8); min-width:220px;">
                            <div style="color:var(--accent-yellow); font-size:12px; margin-bottom:10px; border-bottom:1px solid rgba(234,179,8,0.3); padding-bottom:5px; font-weight:bold;">STRENGTH CALCULATION</div>
                            <div style="display:flex; justify-content:space-between; margin-bottom:4px; font-size:13px;"><span>BASE POWER</span> <span style="color:white;">${breakdown.attackerPower}</span></div>
                            <div style="display:flex; justify-content:space-between; margin-bottom:4px; font-size:13px;"><span>BTC SUPPORT</span> <span style="color:var(--accent-green);">+${breakdown.btcSpent}</span></div>
                            ${breakdown.attackerGroupBtc || breakdown.attackerFactionBtc ? `
                            <div style="font-size:11px; color:#94a3b8; padding-left:12px; margin-bottom:4px; line-height:1.4;">
                                ${breakdown.attackerGroupBtc ? `<div>↳ Group ₿${breakdown.attackerGroupBtc} <span style="color:#64748b">× 1 = +${breakdown.attackerGroupBtc}</span></div>` : ''}
                                ${breakdown.attackerFactionBtc ? `<div>↳ Faction ₿${breakdown.attackerFactionBtc} <span style="color:#64748b">× 1 = +${breakdown.attackerFactionBtc}</span></div>` : ''}
                            </div>` : ''}
                            <div style="display:flex; justify-content:space-between; margin-bottom:4px; font-size:13px;"><span>ALIGNMENT</span> <span style="color:${breakdown.alignmentModifier >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'};">${breakdown.alignmentModifier >= 0 ? '+' : ''}${breakdown.alignmentModifier}</span></div>
                            <div style="display:flex; justify-content:space-between; margin-bottom:4px; font-size:13px;"><span>DISTANCE</span> <span style="color:${breakdown.distanceBonus > 0 ? 'var(--accent-red)' : 'var(--accent-green)'};">${breakdown.distanceBonus > 0 ? '-' : '+'}${Math.abs(breakdown.distanceBonus)}</span></div>
                            <div style="display:flex; justify-content:space-between; margin-bottom:4px; font-size:13px;"><span>TARGET RES</span> <span style="color:var(--accent-red);">- ${breakdown.targetResistance}</span></div>
                            <div style="display:flex; justify-content:space-between; margin-bottom:4px; font-size:13px;"><span>BTC DEFENSE</span> <span style="color:var(--accent-red);">- ${breakdown.defenderBtcSpent}</span></div>
                            ${breakdown.defenderGroupBtc || breakdown.defenderFactionBtc ? `
                            <div style="font-size:11px; color:#94a3b8; padding-left:12px; margin-bottom:4px; line-height:1.4;">
                                ${breakdown.defenderGroupBtc ? `<div>↳ Group ₿${breakdown.defenderGroupBtc} <span style="color:#64748b">× 2 = -${breakdown.defenderGroupBtc * 2}</span></div>` : ''}
                                ${breakdown.defenderFactionBtc ? `<div>↳ Faction ₿${breakdown.defenderFactionBtc} <span style="color:#64748b">× 1 = -${breakdown.defenderFactionBtc}</span></div>` : ''}
                            </div>` : ''}
                            ${G.isEndgame ? `<div style="display:flex; justify-content:space-between; margin-bottom:4px; font-size:13px;"><span>ENDGAME</span> <span style="color:var(--accent-green);">+1</span></div>` : ''}
                            <div style="border-top:1px solid rgba(255,255,255,0.1); margin-top:8px; padding-top:8px; display:flex; justify-content:space-between; font-weight:bold; font-size:15px; color:var(--accent-yellow);">
                                <span>TOTAL</span>
                                <span>${finalStr}</span>
                            </div>
                        </div>
                    `;
          cardTooltip.style.display = 'block';
          cardTooltip.style.opacity = '1';
          const rect = trigger.getBoundingClientRect();
          _positionTooltip(rect.left, rect.top);
        };
        trigger.onmousemove = e => _positionTooltip(e.clientX, e.clientY);
        trigger.onmouseleave = () => onNodeUnhovered();
      }
      updateGraphBidders(tempBids);
    }
    window.updateBiddingWarPreview = updatePreview;
    slider.addEventListener('input', () => {
      valDisplay.textContent = slider.value;
      // Live ×2 hint when defending from the group treasury
      if (valDisplayMult) {
        const isDefender = stances[HUMAN_ID] === 'defend' && order[turnIdx % order.length] === HUMAN_ID && targetOwnerId === HUMAN_ID;
        if (isDefender) {
          const grp = parseInt(slider.value) || 0;
          valDisplayMult.textContent = grp > 0 ? `× 2 = -${grp * 2} Str` : '';
        } else {
          valDisplayMult.textContent = '';
        }
      }
      broadcastPendingBid(slider.value);
      updatePreview();
    });
    if (factionSlider) {
      factionSlider.addEventListener('input', () => {
        if (factionVal) factionVal.textContent = factionSlider.value;
        if (factionValMult) factionValMult.textContent = factionSlider.value;
        broadcastPendingBid(slider.value);
        updatePreview();
      });
    }

    // ─── MAX shortcut buttons ───
    const maxGroupBtn = overlay.querySelector('#bw-max-group');
    const maxFactionBtn = overlay.querySelector('#bw-max-faction');
    if (maxGroupBtn) {
      maxGroupBtn.onclick = () => {
        SFX.playClick();
        slider.value = slider.max;
        valDisplay.textContent = slider.value;
        if (valDisplayMult) {
          const isDefender = stances[HUMAN_ID] === 'defend' && order[turnIdx % order.length] === HUMAN_ID && targetOwnerId === HUMAN_ID;
          const grp = parseInt(slider.value) || 0;
          valDisplayMult.textContent = isDefender ? grp > 0 ? `× 2 = -${grp * 2} Str` : '' : '';
        }
        broadcastPendingBid(slider.value);
        updatePreview();
      };
    }
    if (maxFactionBtn && factionSlider) {
      maxFactionBtn.onclick = () => {
        SFX.playClick();
        factionSlider.value = factionSlider.max;
        if (factionVal) factionVal.textContent = factionSlider.value;
        if (factionValMult) factionValMult.textContent = factionSlider.value;
        broadcastPendingBid(slider.value);
        updatePreview();
      };
    }
    const stanceRadios = overlay.querySelectorAll('input[name="bid-stance"]');
    stanceRadios.forEach(r => r.addEventListener('change', () => {
      if (r.checked) {
        stances[HUMAN_ID] = r.value;
        broadcastPendingBid(slider.value);
        updatePreview();
      }
    }));

    // When human selects a different interfere node, update available BTC
    if (interfereNodeSelect) {
      interfereNodeSelect.addEventListener('change', () => {
        actingNodes[HUMAN_ID] = interfereNodeSelect.value;
        const avail = getParticipantAvailBtc(HUMAN_ID);
        slider.max = avail;
        slider.value = Math.min(parseInt(slider.value) || 0, avail);
        valDisplay.textContent = slider.value;
        availDisplay.textContent = `₿${avail}`;
        broadcastPendingBid(slider.value);
        updatePreview();
      });
    }

    // True once every participant in `order` has had at least one bid turn.
    // Used to gate early-exit so the defender can never be skipped.
    function allHaveBidAtLeastOnce() {
      return order.every(pid => playersWhoHaveBid.has(pid));
    }

    // ═══════════════════════════════════════
    //  END OF BIDDING WAR
    // ═══════════════════════════════════════
    function concludeBidding(logMsg, logColor) {
      addLog(logMsg, logColor, logColor);

      // Trigger Bidding Resolution VFX & SFX
      if (gameGraphScene) {
        // Determine the winner (the one with the highest bid)
        let winningPid = null;
        let maxBid = -1;
        Object.entries(bids).forEach(([pid, amt]) => {
          if (amt > maxBid) {
            maxBid = amt;
            winningPid = pid;
          }
        });

        // Get winner color
        let winHex = 0xfacc15;
        if (winningPid && G.players[winningPid]) {
          const fId = G.players[winningPid].factionId;
          const f = FACTIONS[fId];
          if (f && f.alignments && f.alignments[0]) {
            const alignColor = ALIGNMENT_INFO[f.alignments[0]]?.color;
            if (alignColor) winHex = parseInt(alignColor.replace('#', '0x'), 16);
          }
        }

        // Blast the target node with winner's color
        gameGraphScene.playBiddingBlast(targetNode.id, winHex);

        // Also blast every participating bidder with their OWN faction color to show commitment
        Object.entries(bids).forEach(([pid, amt]) => {
          if (amt > 0 && actingNodes[pid]) {
            let pCol = 0xfacc15;
            const pfId = G.players[pid]?.factionId;
            const pf = FACTIONS[pfId];
            if (pf && pf.alignments && pf.alignments[0]) {
              const pAlignColor = ALIGNMENT_INFO[pf.alignments[0]]?.color;
              if (pAlignColor) pCol = parseInt(pAlignColor.replace('#', '0x'), 16);
            }
            gameGraphScene.playBiddingBlast(actingNodes[pid], pCol);
          }
        });
      }
      SFX.playBiddingResolution();
      setTimeout(() => {
        Object.entries(actingNodes).forEach(([pid, nodeId]) => {
          const node = G.nodes[nodeId];
          if (!node) return;
          // Attacker honors Riot Season's "attack twice" flag
          if (pid === attackerId) {
            node._attackCountThisRound = (node._attackCountThisRound || 0) + 1;
            const allowedAttacks = node._canAttackTwiceThisRound ? 2 : 1;
            if (node._attackCountThisRound >= allowedAttacks) {
              node.hasActedThisRound = true;
              node._canAttackTwiceThisRound = false;
            }
          } else {
            // Defenders and interferers always tire after a bidding war.
            node.hasActedThisRound = true;
          }
        });
        cleanup();
        resolve({
          // attackerBtcSpent feeds straight into computeAttackStrength
          // (group ₿ + faction ₿, both ×1).
          attackerBtcSpent: getAttackerEffectiveBtc(),
          // defenderBtcSpent is the 1:1 SUBTRACTOR that
          // computeAttackStrength uses. It already encodes the
          // asymmetric multiplier: group ₿ ×2 + faction ₿ ×1.
          defenderBtcSpent: getDefenderEffectiveBtc(),
          attackerSplit: {
            group: attackerSpent.group,
            faction: attackerSpent.faction
          },
          defenderSplit: {
            group: defenderSpent.group,
            faction: defenderSpent.faction
          },
          interferers: []
        });
      }, 1500);
    }
    async function runLoop() {
      if (cancelled) return;

      // Get players still in the bidding
      const activePlayers = getActivePlayers();
      const currentActive = order[turnIdx % order.length];
      console.log('[biddingWar] runLoop tick. turnIdx=' + turnIdx + ' currentActive=' + currentActive + ' activePlayers=' + JSON.stringify(activePlayers) + ' isFirstRound=' + isFirstRound + ' allHaveBid=' + allHaveBidAtLeastOnce() + ' order=' + JSON.stringify(order));

      // Bidding ends when ALL players have passed (everyone is out)
      if (activePlayers.length === 0) {
        concludeBidding('--- Bidding closed (all passed) ---', 'var(--accent-yellow)');
        return;
      }

      // If only one player is left and EVERY participant has had at least
      // one bid turn, we can end early.
      if (activePlayers.length === 1 && allHaveBidAtLeastOnce()) {
        const lastPlayer = activePlayers[0];
        concludeBidding(`--- Bidding concluded: ${G.players[lastPlayer].name} holds final bid ---`, 'var(--accent-green)');
        return;
      }

      // Loop through original order, skipping anyone who passed
      let activePlayer = order[turnIdx % order.length];
      while (passedPlayers.has(activePlayer)) {
        turnIdx++;
        activePlayer = order[turnIdx % order.length];
        // Safety check if somehow everyone passed during loop
        if (getActivePlayers().length === 0) {
          return runLoop();
        }
      }
      drainPendingPreviewQueueForCurrentTurn();
      const p = G.players[activePlayer];
      if (p.isAI) {
        humanControls.style.display = 'none';
        aiControls.style.display = 'block';
        activeName.innerText = p.name;
        updatePreview();

        // Animated AI thinking bar — gives the player a visible
        // sense of when the AI will decide. Bar drains over ~1.2s.
        const AI_THINK_MS = 1200;
        const aiBar = overlay.querySelector('#bw-ai-progress-bar');
        if (aiBar) {
          aiBar.style.transition = 'none';
          aiBar.style.transform = 'scaleX(1)';
          // Force reflow so the next transition takes effect.
          void aiBar.offsetWidth;
          aiBar.style.transition = `transform ${AI_THINK_MS}ms linear`;
          aiBar.style.transform = 'scaleX(0)';
        }
        await new Promise(r => setTimeout(r, AI_THINK_MS));

        // Determine AI role and acting node
        let aiRole = 'interferer';
        if (activePlayer === attackerId) aiRole = 'attacker';else if (activePlayer === targetOwnerId) aiRole = 'defender';

        // Pick acting node if not already set
        if (!actingNodes[activePlayer]) {
          const aiNode = pickAIActingNode(activePlayer, aiRole, attackerNodeId, targetNode.id);
          if (aiNode) actingNodes[activePlayer] = aiNode.id;
        }
        const pathAvail = getParticipantAvailBtc(activePlayer); // card BTC
        const rootAvail = aiRole === 'attacker' || aiRole === 'defender' ? getRootBtc(activePlayer) : 0;
        const bankBalance = pathAvail + rootAvail;

        // Will be a two-bucket plan { group, faction } summed to wantSpend.
        let aiGroupSpend = 0;
        let aiFactionSpend = 0;
        let chosenStance = 'defend'; // Default for AI, except attacker
        if (aiRole === 'attacker') chosenStance = 'support';
        const currentFinalStr = computeAttackStrength({
          attackerPower: baseAttackPower,
          transferPower: 0,
          btcSpent: getAttackerEffectiveBtc(),
          targetResistance,
          defenderBtcSpent: getDefenderEffectiveBtc(),
          alignmentModifier: alignMod,
          attackAbilityMod: 0,
          defenseAbilityMod: 0,
          loyaltyBonus: 0,
          isEndgame,
          distanceBonus
        });

        // Heuristic for how important this node is
        const nodeValue = (targetNode.income || 0) * 2 + (targetNode.power || 0) + (targetNode.resistance || 0);
        const isCriticalNode = nodeValue >= 8 || isEndgame;
        if (activePlayer === attackerId) {
          // Target strength based on wealth and importance
          let targetStr = 7; // ~58% success
          if (bankBalance >= 8 || isCriticalNode) targetStr = 8; // ~72%
          if (bankBalance >= 15 || isCriticalNode) targetStr = 9; // ~83%

          const deficit = targetStr - currentFinalStr;
          if (deficit > 0) {
            let maxFraction = bankBalance >= 10 ? 0.8 : 0.5;
            if (isCriticalNode) maxFraction = 1.0;

            // Both pools count ×1 for the attacker. Spend from the
            // group treasury first (keeps the faction vault for
            // later income / defence), then top up from faction.
            const cap = Math.floor(bankBalance * maxFraction);
            const wantTotal = Math.min(deficit, cap);
            aiGroupSpend = Math.min(wantTotal, pathAvail);
            aiFactionSpend = Math.min(wantTotal - aiGroupSpend, rootAvail);
          }
        } else if (activePlayer === targetOwnerId) {
          // Safe strength (from defender's perspective, lower is safer)
          let safeStr = 5; // ~27% success chance for attacker
          if (bankBalance >= 8 || isCriticalNode) safeStr = 4; // ~16%
          if (bankBalance >= 15 || isCriticalNode) safeStr = 3; // ~8%

          const excess = currentFinalStr - safeStr; // resistance units we need

          // If attacker is pushing extremely hard, cut losses unless critical
          if (currentFinalStr >= 10 && !isCriticalNode && bankBalance < 20) {
            aiGroupSpend = 0;
            aiFactionSpend = 0;
          } else if (excess > 0) {
            let maxFraction = bankBalance >= 10 ? 0.7 : 0.4;
            if (isCriticalNode) maxFraction = 1.0;

            // Group BTC gives ×2 R per ₿; faction gives ×1. So use
            // group first to minimise ₿ spent for the same R buff.
            const overallCap = Math.floor(bankBalance * maxFraction);
            let resNeeded = excess;

            // Greedy: spend group ₿ (cap at half of resNeeded rounded up).
            const desiredGroup = Math.min(Math.ceil(resNeeded / 2), pathAvail, overallCap);
            aiGroupSpend = Math.max(0, desiredGroup);
            resNeeded -= aiGroupSpend * 2;
            if (resNeeded > 0) {
              const factionCap = Math.max(0, overallCap - aiGroupSpend);
              aiFactionSpend = Math.min(resNeeded, rootAvail, factionCap);
            }

            // Cap defensive spending on non-critical nodes so AI doesn't go bankrupt
            if (!isCriticalNode && aiGroupSpend + aiFactionSpend > 3) {
              // Trim faction first (keep cheap ×2 group BTC).
              let over = aiGroupSpend + aiFactionSpend - 3;
              const trimFaction = Math.min(over, aiFactionSpend);
              aiFactionSpend -= trimFaction;
              over -= trimFaction;
              if (over > 0) aiGroupSpend = Math.max(0, aiGroupSpend - over);
            }
          }
        } else {
          // Interferers no longer participate in bidding wars under
          // the new spending rules — they just pass.
          aiGroupSpend = 0;
          aiFactionSpend = 0;
        }
        const aiTotalSpend = aiGroupSpend + aiFactionSpend;
        if (aiTotalSpend > 0) {
          stances[activePlayer] = chosenStance;
          if (aiGroupSpend > 0) spendParticipantBtc(activePlayer, aiGroupSpend);
          if (aiFactionSpend > 0) spendFactionBtc(activePlayer, aiFactionSpend);
          bids[activePlayer] += aiTotalSpend;
          if (aiRole === 'attacker') {
            attackerSpent.group += aiGroupSpend;
            attackerSpent.faction += aiFactionSpend;
          } else if (aiRole === 'defender') {
            defenderSpent.group += aiGroupSpend;
            defenderSpent.faction += aiFactionSpend;
          }
          const actNode = G.nodes[actingNodes[activePlayer]];
          const roleLabel = activePlayer === attackerId ? 'ATK' : activePlayer === targetOwnerId ? 'DEF' : `INT(${chosenStance === 'support' ? 'SUP' : 'DEF'})`;
          const color = chosenStance === 'support' ? 'var(--accent-green)' : 'var(--accent-red)';
          const dispName = isShadowVeil && (activePlayer === attackerId || activePlayer === targetOwnerId) ? '???' : p.name;
          const dispNode = isShadowVeil ? '???' : actNode?.name?.substring(0, 15) || '?';
          let splitLabel = `+₿${aiTotalSpend}`;
          if (aiGroupSpend > 0 && aiFactionSpend > 0) splitLabel = `+₿${aiGroupSpend} group · +₿${aiFactionSpend} faction`;else if (aiFactionSpend > 0) splitLabel = `+₿${aiFactionSpend} (faction)`;
          addLog(`[${dispName}] ${roleLabel} via ${dispNode}: ${splitLabel}`, color, color);
        } else {
          // PASS IS FINAL — this player is permanently out of this bidding war
          passedPlayers.add(activePlayer);
          const dispName = isShadowVeil && (activePlayer === attackerId || activePlayer === targetOwnerId) ? '???' : p.name;
          addLog(`[${dispName}] passes (out).`, '#718096', '#4a5568');
        }
        playersWhoHaveBid.add(activePlayer);
        isFirstRound = false;
        turnIdx++;
        pruneStalePendingBids();
        drainPendingPreviewQueueForCurrentTurn();
        runLoop();
      } else {
        // Local Human's turn
        humanControls.style.display = 'block';
        aiControls.style.display = 'none';

        // Determine role
        let role = 'interferer';
        let roleIcon = '🔁';
        let roleLabel = 'INTERFERING';
        if (activePlayer === attackerId) {
          role = 'attacker';
          roleIcon = '⚔️';
          roleLabel = 'ATTACKING';
        } else if (activePlayer === targetOwnerId) {
          role = 'defender';
          roleIcon = '🛡';
          roleLabel = 'DEFENDING';
        }

        // Interferers no longer participate at all under the new rules,
        // so the interferer node selector and stance radios are always
        // hidden during normal play. We keep the elements in the DOM
        // for backwards compat / future card effects.
        const stanceSelectEl = document.getElementById('human-stance-select');
        interfereSelect.style.display = 'none';
        stanceSelectEl.style.display = 'none';

        // Both attacker and defender now have a split-pool UI:
        //   - Slider #1 ("Group ₿") bids from their acting card.
        //   - Slider #2 ("Faction ₿") bids from their faction root.
        // Defender's group ₿ counts ×2 toward Resistance; everything
        // else counts ×1.
        const isHumanAttacker = role === 'attacker';
        const isHumanDefender = role === 'defender';
        const isSplitPoolRole = isHumanAttacker || isHumanDefender;
        const actNodeId = actingNodes[activePlayer];
        const actNode = actNodeId ? G.nodes[actNodeId] : null;
        const isRootNode = actNode && actNode.id === G.players[HUMAN_ID]?.rootNodeId;
        const groupAvail = getParticipantAvailBtc(activePlayer);
        const factionAvail = isSplitPoolRole && !isRootNode ? getRootBtc(HUMAN_ID) : 0;

        // Configure the primary slider (always the Group/Card pool).
        slider.max = groupAvail;
        slider.value = 0;
        valDisplay.textContent = "0";
        if (valDisplayMult) {
          valDisplayMult.textContent = isHumanDefender ? '× 2 = -0 Str' : '';
        }
        if (bidLabelText) {
          if (isRootNode) {
            bidLabelText.textContent = isHumanDefender ? 'FROM FACTION ROOT (+2 R per ₿)' : 'FROM FACTION ROOT (+1 P per ₿)';
          } else {
            bidLabelText.textContent = isHumanDefender ? 'FROM DEFENDING GROUP (+2 R per ₿)' : isHumanAttacker ? 'FROM ATTACKING GROUP (+1 P per ₿)' : 'ADD ₿TC TO BID';
          }
        }
        availDisplay.textContent = `₿${groupAvail}`;

        // Configure the faction (root) slider — only shown when the
        // role can use it and it's NOT the root node itself attacking/defending.
        if (factionRow && factionSlider) {
          if (isSplitPoolRole && !isRootNode) {
            factionRow.style.display = 'block';
            factionSlider.max = factionAvail;
            factionSlider.value = 0;
            factionSlider.disabled = factionAvail <= 0;
            if (factionAvail <= 0) factionRow.style.opacity = '0.5';else factionRow.style.opacity = '1';
            if (factionVal) factionVal.textContent = '0';
            if (factionValMult) factionValMult.textContent = '0';
            const factionAvailEl = overlay.querySelector('#human-faction-btc-avail');
            if (factionAvailEl) factionAvailEl.textContent = `₿${factionAvail}`;
          } else {
            factionRow.style.display = 'none';
            factionSlider.value = 0;
          }
        }

        // Compact, friendly turn-hint for the YOUR-TURN banner.
        const roleVerb = isHumanDefender ? 'Defend with ₿TC' : isHumanAttacker ? 'Boost the attack with ₿TC' : 'Bid ₿TC';
        const groupHint = isHumanDefender ? `Group ₿ counts <strong style="color:#fff">×2</strong> toward Resistance` : isHumanAttacker ? `Group ₿ counts <strong style="color:#fff">×1</strong> toward Power` : '';
        humanRoleInfo.innerHTML = `${roleIcon} ${roleVerb}. ${groupHint}`;
        cancelBtn.style.display = isFirstRound && activePlayer === attackerId ? 'block' : 'none';
        broadcastPendingBid(0);
        updatePreview();
        let forcedAutoPassed = false;
        const result = await new Promise(r => {
          commitBtn.onclick = () => {
            SFX.playClick();
            // Stance is now fully implied by role (attacker→support,
            // defender→defend); the radio set is hidden.
            stances[HUMAN_ID] = isHumanDefender ? 'defend' : 'support';
            r({
              group: parseInt(slider.value) || 0,
              faction: parseInt(factionSlider?.value) || 0,
              type: 'commit'
            });
          };
          passBtn.onclick = () => {
            SFX.playClick();
            r({
              group: 0,
              faction: 0,
              type: 'pass'
            });
          };
          cancelBtn.onclick = () => {
            SFX.playClick();
            r({
              type: 'cancel'
            });
          };

          // Allow external cancel/forced auto-pass while we are deciding.
          window.onBiddingWarBid = event => {
            if (!isEventForThisWar(event)) return;
            if (isEventStaleForCurrentTurn(event)) return;
            if (isEventFutureForCurrentTurn(event)) {
              queueUnmatchedBidEvent(event);
              return;
            }
            if (!isEventForExpectedActivePlayer(event, activePlayer)) {
              queueUnmatchedBidEvent(event);
              return;
            }
            if (event.type === 'cancel') r({
              type: 'cancel'
            });
            if (event.forcedAutoPass && event.playerId === HUMAN_ID) {
              forcedAutoPassed = true;
              r({
                group: 0,
                faction: 0,
                type: 'pass'
              });
            } else if (event.type === 'bid' && event.playerId !== HUMAN_ID) {
              queueUnmatchedBidEvent(event);
            }
          };
        });
        window.onBiddingWarBid = null; // clean up

        if (result?.type === 'cancel') {
          cancelled = true;
          cleanup();
          resolve(null);
          return;
        }

        // Clamp split amounts to currently-available pools.
        const cardAvail = getParticipantAvailBtc(HUMAN_ID);
        const rootAvail = HUMAN_ID === attackerId || HUMAN_ID === targetOwnerId ? getRootBtc(HUMAN_ID) : 0;
        const localGroup = Math.min(Math.max(0, parseInt(result.group) || 0), cardAvail);
        const localFaction = Math.min(Math.max(0, parseInt(result.faction) || 0), rootAvail);
        const localAmount = localGroup + localFaction;
        if (localAmount > 0) {
          if (localGroup > 0) spendParticipantBtc(HUMAN_ID, localGroup);
          if (localFaction > 0) spendFactionBtc(HUMAN_ID, localFaction);
          bids[HUMAN_ID] += localAmount;
          if (isHumanAttacker) {
            attackerSpent.group += localGroup;
            attackerSpent.faction += localFaction;
          } else if (isHumanDefender) {
            defenderSpent.group += localGroup;
            defenderSpent.faction += localFaction;
          }
          const actNodeName = actingNodes[HUMAN_ID] ? G.nodes[actingNodes[HUMAN_ID]]?.name?.substring(0, 15) : '';
          const dispNode = isShadowVeil ? '???' : actNodeName;
          let displayRole = roleLabel;
          if (isHumanDefender) displayRole = `${roleLabel}(DEF)`;else if (isHumanAttacker) displayRole = `${roleLabel}(SUP)`;
          const color = stances[HUMAN_ID] === 'support' ? 'var(--accent-green)' : 'var(--accent-red)';
          const dispName = isShadowVeil && (HUMAN_ID === attackerId || HUMAN_ID === targetOwnerId) ? '???' : 'YOU';
          let splitLabel = `+₿${localAmount}`;
          if (localFaction > 0 && localGroup > 0) splitLabel = `+₿${localGroup} group · +₿${localFaction} faction`;else if (localFaction > 0) splitLabel = `+₿${localFaction} (faction)`;
          addLog(`[${dispName}] ${displayRole} via ${dispNode}: ${splitLabel}`, color, color);
        } else {
          // PASS IS FINAL — human player is permanently out
          passedPlayers.add(HUMAN_ID);
          const dispName = isShadowVeil && (HUMAN_ID === attackerId || HUMAN_ID === targetOwnerId) ? '???' : 'YOU';
          addLog(forcedAutoPassed ? `[${dispName}] timed out — auto-pass (out of bidding).` : `[${dispName}] pass (out of bidding).`, forcedAutoPassed ? '#ef4444' : '#718096', forcedAutoPassed ? '#ef4444' : '#4a5568');
        }
        playersWhoHaveBid.add(HUMAN_ID);
        isFirstRound = false;
        turnIdx++;
        pruneStalePendingBids();
        drainPendingPreviewQueueForCurrentTurn();
        runLoop();
      }
    }
    const displayTargetName = isShadowVeil ? '???' : targetNode.name;
    addLog(`--- Attack Declared on ${displayTargetName} ---`, 'var(--accent-blue)', 'var(--accent-blue)');
    addLog(`₿TC comes from one chosen card only · That card may bid repeatedly until it passes.`, '#ffffff', '#4a5568');
    runLoop();
  });
}

// ═══════════════════════════════════════
//  GAME STATE & MULTIPLAYER
// ═══════════════════════════════════════

let room = null;
let currentRoomId = null; // The user-typed room name (e.g. "lobby"). Used for matching.
let currentRoomUuid = null; // Deterministic UUID derived from currentRoomId; used as the InstantDB entity ID.

// ─────────────────────────────────────────────────────────────────────────────
// roomNameToUuid: Convert a user-typed room name into a stable, deterministic
// RFC-4122-formatted UUID string. InstantDB requires entity IDs to be valid
// UUIDs, but we want all clients joining the same room name to write to the
// SAME entity without needing a schema-declared unique attribute. We hash the
// room name (FNV-1a, two passes for 128 bits) and format it as a UUIDv5-ish
// string. Same input -> same output on every client, always.
// ─────────────────────────────────────────────────────────────────────────────

let myPlayerId = 'human_' + Math.random().toString(36).slice(2, 9);
let players = {};
let isMultiplayer = false;
let isTutorialMode = false;

// Alias HUMAN_ID to myPlayerId so existing local logic mostly works
let HUMAN_ID = myPlayerId;
let G = null;
function newGameState() {
  return {
    nodes: {},
    // Each node: { id, parentId, owner, arrows, power, transferPower, ... }
    deck: [...DECK, ...ACTION_CARDS].sort(() => Math.random() - 0.5),
    discardPile: [],
    eventDeck: [...EVENT_DECK].sort(() => Math.random() - 0.5),
    players: {},
    playerOrder: [],
    activePlayerIndex: 0,
    turnNumber: 1,
    turnPhase: TURN_PHASES.INCOME,
    // Multi-action turn economy. Each turn the active player has
    // `actionsPerTurn` total actions to spend. CONTROL/NEUTRALIZE/DESTROY
    // attacks, Move Group, and BTC transfers beyond the first 2 free
    // each consume one action.
    actionsUsed: 0,
    actionsPerTurn: 2,
    transfersUsedThisTurn: 0,
    isEndgame: false,
    winner: null,
    lastEventTurn: 0,
    factionAbilityUsed: {},
    // Track once-per-turn abilities: { playerId: true }
    history: [] // Full session log: [{ turn, text, type, timestamp }]
  };
}

/**
 * Multi-action turn economy helpers.
 * Old single-action gate (G.mainActionUsed) is replaced by an actions counter.
 */
function actionsRemaining() {
  if (!G) return 0;
  const cap = typeof G.actionsPerTurn === 'number' ? G.actionsPerTurn : 2;
  const used = G.actionsUsed || 0;
  return Math.max(0, cap - used);
}
function canSpendAction() {
  return actionsRemaining() > 0;
}
function spendAction() {
  G.actionsUsed = (G.actionsUsed || 0) + 1;
}
/**
 * BTC transfers: first 2 per turn are free, after that each transfer costs
 * an action. Returns true if the transfer is permitted and any required
 * action has been consumed.
 */
function tryConsumeTransfer() {
  const used = G.transfersUsedThisTurn || 0;
  if (used < 2) {
    G.transfersUsedThisTurn = used + 1;
    return true;
  }
  if (!canSpendAction()) return false;
  spendAction();
  G.transfersUsedThisTurn = used + 1;
  return true;
}
function transfersFreeRemaining() {
  return Math.max(0, 2 - (G.transfersUsedThisTurn || 0));
}

/**
 * Build links array from parentId tree structure for rendering.
 */
function buildLinksFromTree() {
  const links = [];
  Object.values(G.nodes).forEach(n => {
    if (n.parentId && G.nodes[n.parentId]) {
      links.push({
        source: n.parentId,
        target: n.id
      });
    }
  });
  return links;
}

// ═══════════════════════════════════════
//  DOM ELEMENTS
// ═══════════════════════════════════════
const elName = document.getElementById('player-name');
const elDeckCount = document.getElementById('deck-count');
const handContainer = document.getElementById('hand-container');
const btnEndTurn = document.getElementById('btn-end-turn');
const turnStatus = document.getElementById('turn-status');
const phaseIndicator = document.getElementById('phase-indicator');
const panelPlaceholder = document.getElementById('panel-placeholder');
const nodeDetails = document.getElementById('node-details');
const targetName = document.getElementById('target-name');
const targetDesc = document.getElementById('target-desc');
const targetPower = document.getElementById('target-power');
const targetResistance = document.getElementById('target-resistance');
const targetIncome = document.getElementById('target-income');
const targetOwnerEl = document.getElementById('target-owner');
const targetBtcEl = document.getElementById('target-btc');
const attackSection = document.getElementById('attack-section');
const attackResult = document.getElementById('attack-result');
const eventLog = document.getElementById('event-log');
const btnAttackControl = document.getElementById('btn-attack-control');
const btnAttackNeutralize = document.getElementById('btn-attack-neutralize');
const btnAttackDestroy = document.getElementById('btn-attack-destroy');
const btnTransferBtc = document.getElementById('btn-transfer-btc');
const btnMoveGroup = document.getElementById('btn-move-group');
const btnFactionAbility = document.getElementById('btn-faction-ability');
const btnGroupAbility = document.getElementById('btn-group-ability');

// Assets modal elements
const btnAssets = document.getElementById('btn-assets');
const assetsModal = document.getElementById('assets-modal');
const assetsClose = document.getElementById('assets-close');
const assetsSearch = document.getElementById('assets-search');
const assetsFilter = document.getElementById('assets-filter');
const assetsList = document.getElementById('assets-list');

// View navigation logic
const btnNavVictory = document.getElementById('btn-nav-victory');
const victoryTrackerModal = document.getElementById('victory-tracker-modal');
const victoryTrackerClose = document.getElementById('victory-tracker-close');
if (btnNavVictory && victoryTrackerModal) {
  btnNavVictory.addEventListener('click', e => {
    e.preventDefault();
    victoryTrackerModal.style.display = 'flex';
    updateVictoryTracker(); // ensure latest data is shown
  });
}
if (victoryTrackerClose) {
  victoryTrackerClose.onclick = () => {
    victoryTrackerModal.style.display = 'none';
  };
}
const victoryIntelModal = document.getElementById('victory-intel-modal');
const victoryIntelClose = document.getElementById('v-intel-close');
if (victoryIntelClose) {
  victoryIntelClose.onclick = () => {
    victoryIntelModal.style.display = 'none';
    victoryTrackerModal.style.display = 'flex';
    updateVictoryTracker();
  };
}
function showVictoryIntel(playerId) {
  if (!G || !G.players[playerId]) return;
  const p = G.players[playerId];
  const f = FACTIONS[p.factionId];
  if (!f) return;
  const {
    desc: progressLabel,
    progressPct
  } = getWinProgress(playerId);
  document.getElementById('v-intel-logo').src = f.logo;
  document.getElementById('v-intel-name').innerText = f.name.toUpperCase();
  document.getElementById('v-intel-aligns').innerText = f.alignments.join(' · ');
  document.getElementById('v-intel-desc').innerText = f.desc;
  document.getElementById('v-intel-win-desc').innerText = f.winDesc;
  const fill = document.getElementById('v-intel-progress-fill');
  fill.style.width = '0%'; // reset for animation
  setTimeout(() => {
    fill.style.width = `${progressPct}%`;
  }, 50);
  document.getElementById('v-intel-progress-text').innerText = `${Math.floor(progressPct)}% COMPLETE · ${progressLabel}`;
  const abil = f.active || f.passive;
  if (abil) {
    document.getElementById('v-intel-ability-name').innerText = abil.name;
    document.getElementById('v-intel-ability-desc').innerText = abil.desc;
  } else {
    document.getElementById('v-intel-ability-name').innerText = 'None';
    document.getElementById('v-intel-ability-desc').innerText = 'No specialized abilities detected.';
  }
  victoryIntelModal.style.display = 'flex';
  SFX.playClick();
}
if (btnAssets) {
  btnAssets.addEventListener('click', e => {
    e.preventDefault();
    assetsModal.style.display = 'flex';
    renderAssets();
  });
}
if (assetsClose) assetsClose.addEventListener('click', () => assetsModal.style.display = 'none');
if (assetsSearch) assetsSearch.addEventListener('input', renderAssets);
if (assetsFilter) assetsFilter.addEventListener('change', renderAssets);
function renderAssets() {
  if (!assetsList) return;
  const filter = assetsFilter.value;
  const query = assetsSearch.value.toLowerCase();
  assetsList.innerHTML = '';
  const items = [];

  // Add Factions
  if (filter === 'all' || filter === 'faction') {
    Object.values(FACTIONS).forEach(f => {
      items.push({
        type: 'faction',
        name: f.name,
        searchStr: `${f.name} ${f.desc} ${f.alignments.join(' ')} ${f.active?.name} ${f.passive?.name}`.toLowerCase(),
        html: `
                    <div style="background: rgba(34, 197, 94, 0.05); border: 1px solid var(--accent-green); border-radius: 8px; padding: 15px; display: flex; flex-direction: column; gap: 10px;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <img src="${f.logo}" style="width: 40px; height: 40px; object-fit: contain;">
                            <div style="font-family: var(--font-mono); color: var(--accent-green); font-size: 16px; font-weight: bold;">${f.icon} ${f.name}</div>
                        </div>
                        <div style="font-family: var(--font-mono); font-size: 11px; color: #a0aec0;">${f.alignments.join(' · ')}</div>
                        <div style="font-size: 12px; color: #cbd5e0; font-style: italic;">"${f.desc}"</div>
                        <div style="font-family: var(--font-mono); font-size: 11px; background: rgba(0,0,0,0.4); padding: 6px; border-radius: 4px;">
                            <span style="color:var(--accent-red)">P${f.power}</span> | <span style="color:var(--accent-green)">R${f.resistance}</span> | <span style="color:var(--accent-yellow)">I${f.income}</span> | <span style="color:var(--accent-blue)">🔗${f.arrows}</span>
                        </div>
                        <div style="background: rgba(168,85,247,0.1); border: 1px solid rgba(168,85,247,0.3); padding: 8px; border-radius: 6px;">
                            <div style="font-family: var(--font-mono); color: var(--accent-purple); font-size: 11px; font-weight: bold; margin-bottom: 4px;">⚡ ${f.active?.name || 'Active'}</div>
                            <div style="font-size: 11px; color: #a0aec0;">${f.active?.desc || 'No active ability.'}</div>
                        </div>
                        <div style="background: rgba(234,179,8,0.1); border: 1px solid rgba(234,179,8,0.3); padding: 8px; border-radius: 6px;">
                            <div style="font-family: var(--font-mono); color: var(--accent-yellow); font-size: 11px; font-weight: bold; margin-bottom: 4px;">🔄 ${f.passive?.name || 'Passive'}</div>
                            <div style="font-size: 11px; color: #a0aec0;">${f.passive?.desc || 'No passive ability.'}</div>
                        </div>
                        <div style="font-size: 11px; color: var(--accent-yellow); margin-top: auto;">🏆 ${f.winDesc}</div>
                    </div>
                `
      });
    });
  }

  // Add Groups
  if (filter === 'all' || filter === 'group') {
    DECK.forEach(g => {
      const activeAbility = ACTIVE_GROUP_ABILITIES[g.id];
      let searchStr = `${g.name} ${g.desc} ${g.alignments?.join(' ') || ''}`.toLowerCase();
      let abilityHtml = '';
      if (activeAbility) {
        searchStr += ` ${activeAbility.name} ${activeAbility.desc}`;
        abilityHtml = `
                    <div style="background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.3); padding: 8px; border-radius: 6px; margin-top: 8px;">
                        <div style="font-family: var(--font-mono); color: var(--accent-blue); font-size: 11px; font-weight: bold; margin-bottom: 4px;">📢 ${activeAbility.name}</div>
                        <div style="font-size: 11px; color: #a0aec0;">${activeAbility.desc}</div>
                    </div>
                `;
      }
      items.push({
        type: 'group',
        name: g.name,
        searchStr,
        html: `
                    <div style="background: rgba(0, 0, 0, 0.4); border: 1px solid var(--border-color); border-radius: 8px; padding: 15px; display: flex; flex-direction: column; gap: 8px;">
                        <div style="font-family: var(--font-mono); color: var(--text-main); font-size: 14px; font-weight: bold;">${g.icon} ${g.name}</div>
                        ${g.alignments ? `<div style="font-family: var(--font-mono); font-size: 10px; color: #718096;">${g.alignments.join(' · ')}</div>` : ''}
                        <div style="font-family: var(--font-mono); font-size: 11px; background: rgba(0,0,0,0.4); padding: 6px; border-radius: 4px; border: 1px solid #1a202c;">
                            <span style="color:var(--accent-red)">P${g.power}</span> | <span style="color:var(--accent-green)">R${g.resistance}</span> | <span style="color:var(--accent-yellow)">I${g.income || 0}</span> | <span style="color:var(--accent-purple)">↑${g.transferPower || 0}</span> | <span style="color:var(--accent-blue)">🔗${g.arrows}</span>
                        </div>
                        <div style="font-size: 12px; color: #cbd5e0;">${g.desc}</div>
                        ${abilityHtml}
                        ${CARD_FLAVOURS[g.id] ? `<div style="font-size: 10px; color: #718096; font-style: italic; margin-top: auto; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.05);">"${CARD_FLAVOURS[g.id]}"</div>` : ''}
                    </div>
                `
      });
    });
  }

  // Add Actions
  if (filter === 'all' || filter === 'action') {
    ACTION_CARDS.forEach(a => {
      const catColors = {
        resistance: 'var(--accent-red)',
        power: 'var(--accent-green)',
        economic: 'var(--accent-yellow)',
        special: 'var(--accent-purple)'
      };
      const catColor = catColors[a.category] || 'var(--text-main)';
      items.push({
        type: 'action',
        name: a.name,
        searchStr: `${a.name} ${a.desc} ${a.flavour || ''} ${a.category}`.toLowerCase(),
        html: `
                    <div style="background: rgba(234,179,8,0.05); border: 1px solid var(--accent-yellow); border-radius: 8px; padding: 15px; display: flex; flex-direction: column; gap: 8px;">
                        <div style="font-family: var(--font-mono); font-size: 9px; color: ${catColor}; font-weight: bold; text-transform: uppercase;">${a.category} ACTION</div>
                        <div style="font-family: var(--font-mono); color: var(--text-highlight); font-size: 14px; font-weight: bold;">${a.icon} ${a.name}</div>
                        <div style="font-size: 12px; color: #cbd5e0; margin-top: 4px;">${a.desc}</div>
                        ${a.flavour ? `<div style="font-size: 11px; color: #718096; font-style: italic; margin-top: auto; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.05);">"${a.flavour}"</div>` : ''}
                    </div>
                `
      });
    });
  }

  // Add Events
  if (filter === 'all' || filter === 'event') {
    EVENT_DECK.forEach(e => {
      items.push({
        type: 'event',
        name: e.name,
        searchStr: `${e.name} ${e.desc}`.toLowerCase(),
        html: `
                    <div style="background: rgba(59,130,246,0.05); border: 1px solid var(--accent-blue); border-radius: 8px; padding: 15px; display: flex; flex-direction: column; gap: 8px;">
                        <div style="font-family: var(--font-mono); font-size: 9px; color: var(--accent-blue); font-weight: bold; text-transform: uppercase;">GLOBAL EVENT</div>
                        <div style="font-family: var(--font-mono); color: var(--accent-blue); font-size: 14px; font-weight: bold;">${e.icon} ${e.name}</div>
                        <div style="font-size: 12px; color: #cbd5e0; margin-top: 4px;">${e.desc}</div>
                    </div>
                `
      });
    });
  }
  items.forEach(item => {
    if (query && !item.searchStr.includes(query)) return;
    const div = document.createElement('div');
    div.innerHTML = item.html;
    assetsList.appendChild(div.firstElementChild);
  });
}

// ─── New: attacker selection ───
let selectedAttackerNodeId = null; // Which of YOUR nodes is attacking
let selectedAttackerLocked = false; // True when the player explicitly chose the attacker

// ═══════════════════════════════════════
//  AUDIO
// ═══════════════════════════════════════
SFX.initMusic('assets/dark-mode-control.mp3');
const btnMute = document.getElementById('btn-mute');
const volumeSlider = document.getElementById('volume-slider');
let isMuted = false;
btnMute.addEventListener('click', () => {
  isMuted = !isMuted;
  SFX.setMuted(isMuted);
  btnMute.innerText = isMuted ? '🔇' : '🔊';
});
volumeSlider.addEventListener('input', e => {
  const vol = parseFloat(e.target.value);
  SFX.setVolume(vol);
  if (vol > 0 && isMuted) {
    isMuted = false;
    SFX.setMuted(false);
    btnMute.innerText = '🔊';
  } else if (vol === 0) {
    isMuted = true;
    SFX.setMuted(true);
    btnMute.innerText = '🔇';
  }
});
const startAudio = () => {
  SFX.startBGM();
  document.removeEventListener('click', startAudio);
};
document.addEventListener('click', startAudio);

// ═══════════════════════════════════════
//  PHASER
// ═══════════════════════════════════════
let gameGraphScene = null;
let mySelectedNodeId = null;
let mySelectedHandCardIndex = null;
let rearrangePreviewState = null;
let suppressHandClickUntil = 0;
let activeReveal = null;
let revealQueue = [];
let lastRenderedHandKeys = null;
const recentHandDrawKeys = new Map();
const HAND_DRAW_ANIM_MS = 900;
const DRAG_SNAP_DISTANCE = 190;
const DRAG_MAGNET_DISTANCE = 240;
const config = {
  type: Phaser.AUTO,
  parent: 'phaser-container',
  width: 1920,
  height: 1080,
  transparent: true,
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [GameGraph],
  dom: {
    createContainer: true
  }
};
const phaserGame = new Phaser.Game(config);
phaserGame.events.on('ready', () => {
  gameGraphScene = phaserGame.scene.getScene('GameGraph');
  gameGraphScene.setCallbacks(onNodeSelected, onNodeDragged, onNodeHovered, onNodeUnhovered, onNodeHoverMoved);
});
document.querySelector('#phaser-container').addEventListener('wheel', e => e.preventDefault(), {
  passive: false
});

// ═══════════════════════════════════════
//  CARD TOOLTIP
// ═══════════════════════════════════════
const cardTooltip = document.getElementById('card-tooltip');
const TOOLTIP_SCALE = 1.4;
const TOOLTIP_W = 240 * TOOLTIP_SCALE;
const TOOLTIP_H = 340 * TOOLTIP_SCALE;
function _positionTooltip(x, y) {
  let fx = x + 30,
    fy = y - 50;
  if (fx + TOOLTIP_W > window.innerWidth) fx = x - TOOLTIP_W - 30;
  if (fy + TOOLTIP_H > window.innerHeight) fy = window.innerHeight - TOOLTIP_H - 20;
  if (fy < 10) fy = 10;
  if (fx < 10) fx = 10;
  cardTooltip.style.left = fx + 'px';
  cardTooltip.style.top = fy + 'px';
}
function onNodeHovered(node, x, y) {
  if (!node || !cardTooltip) return;
  if (gameGraphScene && gameGraphScene.isDragging) return;
  const isRoot = node.type === 'root';
  const isAction = node.type === 'action';
  cardTooltip.innerHTML = `<div class="playing-card" style="${getPlayingCardStyle(node, isAction)}transform:scale(${TOOLTIP_SCALE});transform-origin:top left;width:240px;height:340px;box-shadow:0 0 40px rgba(0,0,0,0.9),0 0 20px rgba(59,130,246,0.6);pointer-events:none;">${createPlayingCardHTML(node, isAction, isRoot)}</div>`;
  cardTooltip.style.display = 'block';
  cardTooltip.style.opacity = '1';
  _positionTooltip(x, y);
}
function onNodeHoverMoved(node, x, y) {
  if (!node || !cardTooltip || cardTooltip.style.display !== 'block') return;
  _positionTooltip(x, y);
}
function onNodeUnhovered() {
  if (!cardTooltip) return;
  cardTooltip.style.display = 'none';
  cardTooltip.style.opacity = '0';
  cardTooltip.innerHTML = '';
}
function getCardRenderKey(card) {
  if (!card) return 'unknown-card';
  return `${card.id || card.name || 'card'}:${card.type || 'group'}`;
}
function rememberHandDraw(card) {
  const key = getCardRenderKey(card);
  recentHandDrawKeys.set(key, Date.now() + HAND_DRAW_ANIM_MS);
}
function shouldAnimateHandCard(card) {
  const key = getCardRenderKey(card);
  const expiresAt = recentHandDrawKeys.get(key) || 0;
  if (Date.now() > expiresAt) {
    recentHandDrawKeys.delete(key);
    return false;
  }
  recentHandDrawKeys.delete(key);
  return true;
}

// ═══════════════════════════════════════
//  EVENT LOG
// ═══════════════════════════════════════
function logEvent(msg, type = 'success', nodeId = null) {
  const li = document.createElement('li');
  li.innerHTML = `${msg} <span class="percent" style="color:${type === 'success' ? '#4ade80' : type === 'warning' ? '#eab308' : '#ef4444'}">${new Date().toLocaleTimeString()}</span>`;
  if (nodeId) {
    li.style.cursor = 'pointer';
    li.onclick = () => {
      const n = G.nodes[nodeId];
      if (n && gameGraphScene) {
        gameGraphScene.centerCameraOn(n.x, n.y);
        gameGraphScene.selectNode(nodeId);
        onNodeSelected(nodeId);
      }
    };
  }
  eventLog.prepend(li);
  if (eventLog.children.length > 8) eventLog.removeChild(eventLog.lastChild);

  // Also add to persistent history if game is running
  if (G && G.history) {
    G.history.push({
      turn: G.turnNumber,
      text: msg,
      type: type,
      timestamp: Date.now(),
      nodeId: nodeId
    });
  }
}
const btnHistory = document.getElementById('btn-history');
const historyModal = document.getElementById('history-modal');
const historyClose = document.getElementById('history-close');
const historyList = document.getElementById('history-list');
if (btnHistory && historyModal) {
  btnHistory.onclick = e => {
    e.preventDefault();
    renderHistory();
    historyModal.style.display = 'flex';
  };
}
if (historyClose) historyClose.onclick = () => historyModal.style.display = 'none';
function renderHistory() {
  if (!historyList || !G || !G.history) return;
  historyList.innerHTML = '';

  // Group history by turn
  const turns = {};
  G.history.forEach(entry => {
    if (!turns[entry.turn]) turns[entry.turn] = [];
    turns[entry.turn].push(entry);
  });
  Object.keys(turns).sort((a, b) => b - a).forEach(turnNum => {
    const turnDiv = document.createElement('div');
    turnDiv.style.marginBottom = '20px';
    turnDiv.innerHTML = `<div style="color:var(--accent-yellow); border-bottom: 1px solid rgba(234,179,8,0.3); padding-bottom: 5px; margin-bottom: 10px; font-weight: bold; letter-spacing: 1px;">ROUND ${turnNum}</div>`;
    const entriesDiv = document.createElement('div');
    entriesDiv.style.display = 'flex';
    entriesDiv.style.flexDirection = 'column';
    entriesDiv.style.gap = '6px';
    turns[turnNum].forEach(entry => {
      const row = document.createElement('div');
      row.className = 'history-log-row';
      row.style.padding = '8px';
      row.style.background = 'rgba(255,255,255,0.03)';
      row.style.borderRadius = '4px';
      row.style.borderLeft = `3px solid ${entry.type === 'success' ? '#22c55e' : entry.type === 'warning' ? '#eab308' : '#ef4444'}`;
      if (entry.nodeId && G.nodes[entry.nodeId]) {
        row.style.cursor = 'pointer';
        row.title = 'Click to view location';
        row.onclick = () => {
          const n = G.nodes[entry.nodeId];
          if (n && gameGraphScene) {
            gameGraphScene.centerCameraOn(n.x, n.y);
            gameGraphScene.selectNode(entry.nodeId);
            onNodeSelected(entry.nodeId);
            historyModal.style.display = 'none'; // Close modal to show location
          }
        };
      }
      const time = new Date(entry.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      row.innerHTML = `<span style="color:#718096; font-size:10px; margin-right:8px;">[${time}]</span> ${entry.text}${entry.nodeId ? ' <span style="font-size:10px; color:var(--accent-blue);">[VIEW]</span>' : ''}`;
      entriesDiv.appendChild(row);
    });
    turnDiv.appendChild(entriesDiv);
    historyList.appendChild(turnDiv);
  });
  if (G.history.length === 0) {
    historyList.innerHTML = '<div style="text-align:center; color:#718096; padding:40px; font-style:italic;">No intelligence reports recorded yet.</div>';
  }
}

// Flavour events removed per request

document.getElementById('btn-mode-tutorial').addEventListener('click', () => {
  document.getElementById('mode-modal').style.display = 'none';
  isMultiplayer = false;
  isTutorialMode = true;
  logEvent("🎓 Training Protocol Activated.", "success");
  startTutorialGame();
});
document.getElementById('btn-mode-local').addEventListener('click', () => {
  document.getElementById('mode-modal').style.display = 'none';
  isMultiplayer = false;
  isTutorialMode = false;
  logEvent("System Initialized in Local Simulation Mode.", "success");

  // Setup AI simulation options
  document.getElementById('ai-setup-modal').style.display = 'flex';
  updateAiSelectionUI();
});
document.getElementById('ai-count').addEventListener('change', updateAiSelectionUI);
document.getElementById('win-con-generic-threshold').addEventListener('input', e => {
  document.getElementById('win-con-generic-val').innerText = e.target.value;
});
document.getElementById('win-con-generic').addEventListener('change', e => {
  document.getElementById('generic-win-threshold-container').style.opacity = e.target.checked ? '1' : '0.5';
  document.getElementById('win-con-generic-threshold').disabled = !e.target.checked;
});
document.getElementById('btn-ai-setup-default').addEventListener('click', () => {
  document.getElementById('ai-count').value = "3";
  updateAiSelectionUI();

  // Set all to random
  for (let i = 0; i < 3; i++) {
    document.getElementById(`ai-select-${i}`).value = "random";
  }
  document.getElementById('win-con-faction').checked = true;
  document.getElementById('win-con-generic').checked = true;
  document.getElementById('win-con-generic-threshold').value = 10;
  document.getElementById('win-con-generic-threshold').disabled = false;
  document.getElementById('generic-win-threshold-container').style.opacity = '1';
  document.getElementById('win-con-generic-val').innerText = "10";
});

// Run default setup on modal open
const observerAI = new MutationObserver(mutations => {
  for (const m of mutations) {
    if (m.type === 'attributes' && m.attributeName === 'style') {
      const aiSetupModal = document.getElementById('ai-setup-modal');
      if (aiSetupModal && aiSetupModal.style.display === 'flex' && !aiSetupModal._initialized) {
        document.getElementById('btn-ai-setup-default').click();
        aiSetupModal._initialized = true;
      }
    }
  }
});
const aiSetupModal = document.getElementById('ai-setup-modal');
if (aiSetupModal) observerAI.observe(aiSetupModal, {
  attributes: true
});
function updateAiSelectionUI() {
  const count = parseInt(document.getElementById('ai-count').value);
  const container = document.getElementById('ai-selection-container');
  container.innerHTML = '';

  // Sort factions alphabetically for the dropdown
  const factionOptions = Object.entries(FACTIONS).sort((a, b) => a[1].name.localeCompare(b[1].name)).map(([fid, f]) => {
    return `<option value="${fid}">${f.icon} ${f.name}</option>`;
  }).join('');
  for (let i = 0; i < count; i++) {
    container.innerHTML += `
            <div>
                <label style="font-family: var(--font-mono); font-size: 11px; color: #718096; display: block; margin-bottom: 3px;">OPPONENT ${i + 1}</label>
                <select id="ai-select-${i}" class="transfer-input" style="width: 100%;">
                    <option value="random">🎲 Random Faction</option>
                    ${factionOptions}
                </select>
            </div>
        `;
  }
}
document.getElementById('btn-cancel-ai-sim').addEventListener('click', () => {
  document.getElementById('ai-setup-modal').style.display = 'none';
  document.getElementById('mode-modal').style.display = 'flex';
});
document.getElementById('btn-start-ai-sim').addEventListener('click', () => {
  const count = parseInt(document.getElementById('ai-count').value);
  const selectedAIs = [];
  for (let i = 0; i < count; i++) {
    selectedAIs.push(document.getElementById(`ai-select-${i}`).value);
  }
  const allowFactionWin = document.getElementById('win-con-faction').checked;
  const allowGenericWin = document.getElementById('win-con-generic').checked;
  const genericWinThreshold = parseInt(document.getElementById('win-con-generic-threshold').value) || 10;

  // Ensure at least one win condition is selected
  if (!allowFactionWin && !allowGenericWin) {
    alert("You must select at least one victory condition.");
    return;
  }
  window.aiSimulationConfig = {
    count,
    opponents: selectedAIs,
    allowFactionWin,
    allowGenericWin,
    genericWinThreshold
  };
  document.getElementById('ai-setup-modal').style.display = 'none';
  showFactionSelection();
});
// ═══════════════════════════════════════
//  MULTIPLAYER LOBBY
// ═══════════════════════════════════════
// Lobby state is held outside showLobbyModal so all the helper functions
// (presence handler, ready toggle, settings sync) can share it cleanly.
let lobbySettings = {
  allowFactionWin: true,
  allowGenericWin: true,
  genericWinThreshold: 10
};

// ─────────────────────────────────────────────────────────────────────────────
// LOBBY CHAT
// Persistent message buffer survives lobby re-opens (e.g. rematch flow) so the
// conversation isn't wiped between matches. Capped to MAX_LOBBY_CHAT entries
// to keep memory bounded.
// ─────────────────────────────────────────────────────────────────────────────
const MAX_LOBBY_CHAT = 80;
const _lobbyChatLog = []; // [{ playerId, name, text, ts, kind }]

function _appendLobbyChat(entry) {
  _lobbyChatLog.push(entry);
  while (_lobbyChatLog.length > MAX_LOBBY_CHAT) _lobbyChatLog.shift();
  renderLobbyChat();
}
function renderLobbyChat() {
  const logEl = document.getElementById('lobby-chat-log');
  if (!logEl) return;
  if (_lobbyChatLog.length === 0) {
    logEl.innerHTML = `<div class="lobby-chat-empty" style="color: #4a5568; font-style: italic; text-align: center; padding: 10px;">Channel is quiet. Say hello to your fellow operatives.</div>`;
    return;
  }
  // Track whether we were scrolled near the bottom before rendering so we
  // can preserve "stick to bottom" UX without yanking the user if they
  // scrolled up to read history.
  const wasNearBottom = logEl.scrollHeight - logEl.scrollTop - logEl.clientHeight < 30;
  logEl.innerHTML = '';
  for (const entry of _lobbyChatLog) {
    const row = document.createElement('div');
    if (entry.kind === 'system') {
      row.style.cssText = 'color: #718096; font-style: italic; padding: 2px 0;';
      row.textContent = `※ ${entry.text}`;
    } else {
      const isMe = entry.playerId === HUMAN_ID;
      const nameColor = isMe ? 'var(--accent-green)' : 'var(--accent-purple)';
      row.style.cssText = 'padding: 2px 0; line-height: 1.4; word-wrap: break-word;';
      const time = entry.ts ? new Date(entry.ts).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      }) : '';
      row.innerHTML = `<span style="color:#4a5568; font-size:9px;">[${time}]</span> <strong style="color:${nameColor};">${escapeHTML(entry.name || '?')}:</strong> <span>${escapeHTML(entry.text)}</span>`;
    }
    logEl.appendChild(row);
  }
  if (wasNearBottom) logEl.scrollTop = logEl.scrollHeight;
}
// Small util used in the lobby render
function escapeHTML(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[c]);
}

// ═══════════════════════════════════════
//  FACTION SELECTION
// ═══════════════════════════════════════
function showFactionSelection(isMulti = false) {
  const modal = document.getElementById('faction-modal');
  const list = document.getElementById('faction-list');
  list.innerHTML = '';
  Object.entries(FACTIONS).forEach(([fid, f]) => {
    const div = document.createElement('div');
    div.className = 'faction-card';
    div.style.position = 'relative';
    div.style.overflow = 'hidden';
    div.innerHTML = `
            <div class="faction-card-main" style="display:flex;flex-direction:column;align-items:center;height:100%;padding:10px 0;">
                <div class="faction-logo-container" style="flex-shrink:0;width:100px;height:100px;background:rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:12px;display:flex;align-items:center;justify-content:center;margin-bottom:15px;">
                    <img src="${f.logo}" style="width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 0 5px rgba(255,255,255,0.2));">
                </div>
                <div class="info" style="width:100%;text-align:center;">
                    <h3 style="display:flex;align-items:center;justify-content:center;gap:8px;font-size:22px;margin-bottom:12px;">${f.icon} ${f.name}</h3>
                    <p style="margin-bottom:20px;color:#cbd5e0;"><i>"${f.desc}"</i></p>
                    <div style="font-family:var(--font-mono);font-size:12px;margin-bottom:15px;display:flex;justify-content:center;gap:12px;background:rgba(0,0,0,0.4);padding:8px;border-radius:6px;border:1px solid #1a202c;">
                        <span style="color:var(--accent-red)">POW:${f.power}</span> |
                        <span style="color:var(--accent-yellow)">INC:₿${f.income}</span> |
                        <span style="color:var(--accent-blue)">🔗${f.arrows} SLOTS</span>
                    </div>
                    <div style="font-family:var(--font-mono);font-size:11px;color:#718096;">ALIGNMENTS:<br><span style="color:#a0aec0;font-size:12px;">${f.alignments.join(' · ')}</span></div>
                </div>
            </div>
            
            <div class="faction-card-hover" style="position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(10,14,17,0.95);backdrop-filter:blur(4px);padding:20px;display:flex;flex-direction:column;justify-content:center;opacity:0;transition:opacity 0.3s;box-sizing:border-box;pointer-events:none;">
                <div class="win-con" style="text-align:center;margin-bottom:15px;">
                    <div style="font-family:var(--font-mono);color:var(--accent-yellow);font-weight:bold;margin-bottom:6px;font-size:13px;letter-spacing:1px;">🏆 VICTORY CONDITION</div>
                    <div style="font-size:12px;color:#cbd5e0;line-height:1.4;">${f.winDesc}</div>
                </div>
                ${f.passive ? `
                <div style="background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.3);border-radius:6px;padding:12px;margin-bottom:10px;">
                    <div style="font-family:var(--font-mono);font-size:12px;color:var(--accent-green);font-weight:bold;margin-bottom:6px;text-align:center;">${f.passive.icon} PASSIVE: ${f.passive.name}</div>
                    <div style="font-size:11px;color:#a0aec0;line-height:1.4;text-align:center;">${f.passive.desc}</div>
                </div>` : ''}
                ${f.active ? `
                <div style="background:rgba(168,85,247,0.1);border:1px solid rgba(168,85,247,0.3);border-radius:6px;padding:12px;">
                    <div style="font-family:var(--font-mono);font-size:12px;color:var(--accent-purple);font-weight:bold;margin-bottom:6px;text-align:center;">${f.active.icon} ACTIVE: ${f.active.name}</div>
                    <div style="font-size:11px;color:#a0aec0;line-height:1.4;text-align:center;">${f.active.desc}</div>
                    ${f.active.flavour ? `<div style="font-size:10px;color:#4a5568;font-style:italic;margin-top:6px;text-align:center;">"${f.active.flavour}"</div>` : ''}
                </div>` : ''}
            </div>
        `;
    div.onmouseenter = () => {
      div.querySelector('.faction-card-hover').style.opacity = '1';
    };
    div.onmouseleave = () => {
      div.querySelector('.faction-card-hover').style.opacity = '0';
    };
    div.onclick = () => {
      startGame(fid);
    };
    list.appendChild(div);
  });

  // Check if everyone has chosen a faction to actually start the game

  modal.style.display = 'flex';
}

/**
 * Helper to draw a hand ensuring at least one Group card is present.
 */
function drawInitialHand(deck, count = 4) {
  const hand = [];
  for (let i = 0; i < count; i++) {
    if (deck.length > 0) hand.push(deck.pop());
  }

  // Replace any Group cards with Action cards if possible, 
  // sending groups back into the deck to be shuffled.
  let groups = hand.filter(c => c.type !== 'action');
  while (groups.length > 0) {
    const actionIdx = deck.findIndex(c => c.type === 'action');
    if (actionIdx !== -1) {
      const actionCard = deck.splice(actionIdx, 1)[0];
      const groupIdx = hand.findIndex(c => c.type !== 'action');
      const groupCard = hand.splice(groupIdx, 1)[0];
      hand.push(actionCard);
      deck.push(groupCard);
      groups = hand.filter(c => c.type !== 'action');
    } else {
      break; // No more action cards in deck
    }
  }
  deck.sort(() => Math.random() - 0.5); // Re-shuffle
  return hand;
}

/**
 * Finds a coordinate near (startX, startY) that is at least minDistance away from all existing nodes.
 */
function findEmptySpot(startX, startY, minDistance = 350, ignoreNodeIds = []) {
  const ignored = new Set(ignoreNodeIds || []);
  let radius = minDistance;
  const maxRadius = 1500;
  const searchStep = 20; // degrees — finer sweep

  while (radius <= maxRadius) {
    const angles = [];
    for (let a = 0; a < 360; a += searchStep) angles.push(a);
    angles.sort(() => Math.random() - 0.5);
    for (const angle of angles) {
      const rad = angle * (Math.PI / 180);
      const tx = startX + Math.cos(rad) * radius;
      const ty = startY + Math.sin(rad) * radius;
      let collision = false;
      for (const node of Object.values(G.nodes)) {
        if (!node || ignored.has(node.id)) continue;
        // Card bounding box collision: 200w x 280h + 50 padding
        const dx = Math.abs(tx - node.x);
        const dy = Math.abs(ty - node.y);
        if (dx < 250 && dy < 330) {
          collision = true;
          break;
        }
      }
      if (!collision) return {
        x: tx,
        y: ty
      };
    }
    radius += 80;
  }
  // Final fallback
  return {
    x: startX + (Math.random() - 0.5) * 500,
    y: startY + (Math.random() - 0.5) * 500
  };
}
function isLooseNeutralNode(node) {
  return !!node && node.type !== 'root' && !node.owner && !node.parentId;
}
function getNeutralZoneCenter() {
  const roots = Object.values(G?.nodes || {}).filter(n => n.type === 'root');
  if (roots.length === 0) return {
    x: 960,
    y: 540
  };
  const sum = roots.reduce((acc, n) => ({
    x: acc.x + n.x,
    y: acc.y + n.y
  }), {
    x: 0,
    y: 0
  });
  return {
    x: sum.x / roots.length,
    y: sum.y / roots.length
  };
}
function getNeutralZoneSpot(preferredX = null, preferredY = null, ignoreNodeIds = []) {
  const center = getNeutralZoneCenter();
  let anchorX = center.x;
  let anchorY = center.y;
  if (Number.isFinite(preferredX) && Number.isFinite(preferredY)) {
    const dx = preferredX - center.x;
    const dy = preferredY - center.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxRadius = 460;
    const scale = dist > maxRadius && dist > 0 ? maxRadius / dist : 1;
    anchorX = center.x + dx * scale;
    anchorY = center.y + dy * scale;
  }
  return findEmptySpot(anchorX, anchorY, 320, ignoreNodeIds);
}
function populateNeutralZone(playerCount) {
  const numCards = playerCount + 4;
  let placed = 0;

  // We only want to place Group cards (not Action cards)
  let groupsInDeck = G.deck.filter(c => c.type !== 'action');
  while (placed < numCards && groupsInDeck.length > 0) {
    const deckIdx = G.deck.findIndex(c => c.type !== 'action');
    if (deckIdx !== -1) {
      const card = G.deck.splice(deckIdx, 1)[0];
      const spawnSpot = getNeutralZoneSpot(null, null, [card.id]);
      card.owner = null;
      card.parentId = null;
      card.parentPortSide = null;
      card.rotationSteps = 0;
      card.btc = 0;
      card.x = spawnSpot.x;
      card.y = spawnSpot.y;
      G.nodes[card.id] = {
        ...card
      };
      placed++;
      groupsInDeck = G.deck.filter(c => c.type !== 'action');
    } else {
      break;
    }
  }
}
function getBoardWorldFromClient(clientX, clientY) {
  if (!gameGraphScene || !phaserGame?.canvas) return null;
  const cam = gameGraphScene.cameras.main;
  const rect = phaserGame.canvas.getBoundingClientRect();
  const scaleX = cam.width / rect.width;
  const scaleY = cam.height / rect.height;
  const canvasX = (clientX - rect.left) * scaleX;
  const canvasY = (clientY - rect.top) * scaleY;
  return {
    x: canvasX / cam.zoom + cam.worldView.x,
    y: canvasY / cam.zoom + cam.worldView.y
  };
}
function isClientPointOverBoard(clientX, clientY) {
  const graphEl = document.getElementById('phaser-container');
  if (!graphEl) return false;
  const rect = graphEl.getBoundingClientRect();
  return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
}
function getNeutralZoneGuideElements() {
  const guide = document.getElementById('neutral-zone-guide');
  if (!guide) return null;
  return {
    guide,
    ring: guide.querySelector('.neutral-zone-guide__ring'),
    label: guide.querySelector('.neutral-zone-guide__label')
  };
}
function updateNeutralZoneGuide(dropWorld = null, forceVisible = false) {
  const els = getNeutralZoneGuideElements();
  if (!els) return;
  const {
    guide,
    ring,
    label
  } = els;
  const shouldShow = !!forceVisible || !!dropWorld;
  guide.classList.toggle('visible', shouldShow);
  if (!shouldShow) {
    guide.classList.remove('ready');
    return;
  }
  const centerWorld = getNeutralZoneCenter();
  const graphEl = document.getElementById('phaser-container');
  if (!graphEl || !gameGraphScene || !phaserGame?.canvas) return;
  const cam = gameGraphScene.cameras.main;
  const rect = phaserGame.canvas.getBoundingClientRect();
  const graphRect = graphEl.getBoundingClientRect();
  const scaleX = rect.width / cam.width;
  const scaleY = rect.height / cam.height;
  const screenX = rect.left + (centerWorld.x - cam.worldView.x) * cam.zoom * scaleX;
  const screenY = rect.top + (centerWorld.y - cam.worldView.y) * cam.zoom * scaleY;
  const localX = screenX - graphRect.left;
  const localY = screenY - graphRect.top;
  if (ring) {
    ring.style.left = `${localX}px`;
    ring.style.top = `${localY}px`;
  }
  if (label) {
    label.style.left = `${localX}px`;
    label.style.top = `${localY}px`;
  }
  let isReady = false;
  if (dropWorld) {
    const dx = dropWorld.x - centerWorld.x;
    const dy = dropWorld.y - centerWorld.y;
    isReady = Math.sqrt(dx * dx + dy * dy) <= NEUTRAL_ZONE_DROP_RADIUS;
  }
  guide.classList.toggle('ready', isReady);
}
function hideNeutralZoneGuide() {
  updateNeutralZoneGuide(null, false);
}
const CORNER_POSITIONS = [{
  x: 320,
  y: 180
},
// Top Left
{
  x: 1600,
  y: 900
},
// Bottom Right
{
  x: 1600,
  y: 180
},
// Top Right
{
  x: 320,
  y: 900
},
// Bottom Left
{
  x: 960,
  y: 180
},
// Top Center
{
  x: 960,
  y: 900
},
// Bottom Center
{
  x: 320,
  y: 540
},
// Middle Left
{
  x: 1600,
  y: 540
} // Middle Right
];
function getSpawnPositions(playerCount) {
  const positions = [];
  const cx = 960;
  const cy = 540;
  // For 2 players: radius ~800. For 8 players: radius ~2400.
  const radius = Math.max(800, playerCount * 300);
  // Random rotation so it's not always aligned the same way
  const angleOffset = Math.random() * Math.PI * 2;
  for (let i = 0; i < playerCount; i++) {
    const angle = angleOffset + i / playerCount * Math.PI * 2;
    positions.push({
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius
    });
  }
  // Shuffle so spawn order doesn't dictate clockwise assignment
  return positions.sort(() => Math.random() - 0.5);
}
/**
 * Apply an incoming multiplayer state to the local client. Used by the
 * subscribeQuery callback as well as the deferred-state flush after a bidding
 * war ends. Handles turn transitions and triggers `beginTurn` if the active
 * player just became us.
 */
function applyIncomingMultiplayerState(incomingState) {
  if (!incomingState) return false;

  // ⚡ Version & echo guard: never apply a state that is older than what we
  // already have, and never apply our own echo. This is critical for the
  // deferred-flush path coming out of a bidding war: by the time the 50ms
  // timer fires, a newer state may already be in place locally and we must
  // not regress to the queued (older) one.
  const incomingVer = incomingState._stateVersion || 0;
  const incomingWriter = incomingState._lastWriterId;
  const myVer = G?._stateVersion || 0;
  if (_isOwnEcho(incomingVer, incomingWriter)) {
    console.log('[multiplayer] Suppressing own-echo state v' + incomingVer);
    return false;
  }
  if (incomingVer < myVer) {
    console.log('[multiplayer] Suppressing stale state v' + incomingVer + ' (have v' + myVer + ')');
    return false;
  }
  const wasActivePlayer = G ? getActivePlayerId() : null;
  const incomingActivePlayer = incomingState.playerOrder[incomingState.activePlayerIndex];
  const transitionedToMe = wasActivePlayer !== HUMAN_ID && incomingActivePlayer === HUMAN_ID;
  const activePlayerChanged = wasActivePlayer !== incomingActivePlayer;
  console.log('[multiplayer] Applying incoming state v' + incomingVer, {
    from: incomingWriter,
    wasActive: wasActivePlayer,
    nowActive: incomingActivePlayer,
    transitionedToMe,
    activePlayerChanged,
    actionsUsed: incomingState.actionsUsed,
    actionsPerTurn: incomingState.actionsPerTurn,
    transfersUsedThisTurn: incomingState.transfersUsedThisTurn,
    turnPhase: incomingState.turnPhase
  });

  // Re-attach functions (execute/filter) onto every card in the incoming
  // state — they were stripped by JSON serialization on the wire.
  rehydrateGameState(incomingState);
  G = incomingState;
  refreshAll();
  if (transitionedToMe) {
    beginTurn(HUMAN_ID);
  } else if (activePlayerChanged && incomingActivePlayer) {
    // The turn passed to someone else (typically the remote opponent).
    // Snap our camera to their network so we can watch what they do.
    // beginTurn() handles local-player turn initialization above.
    console.log('[multiplayer] Turn changed to remote player ' + incomingActivePlayer + ' — snapping camera to their network.');
    scheduleCameraFocusOnPlayerNetwork(incomingActivePlayer, {
      snap: true,
      duration: 850,
      initialDelay: 40
    });
  }
  return true;
}
// Track our own recent state-version writes so we can suppress echoes that come
// back from InstantDB. We keep a small ring of recent versions instead of just
// comparing against the latest version, because (a) writes can echo out-of-order
// and (b) a remote write could legitimately arrive at the same version we just
// wrote on a race.
// ─────────────────────────────────────────────────────────────────────────────
// rehydrateGameState: InstantDB / JSON-based state sync strips all functions
// from card objects (execute, filter, etc.) because JSON has no concept of
// functions. After receiving remote state we walk every card-like reference
// in G and merge back the original definitions from DECK + ACTION_CARDS,
// keyed by id. Without this, action cards crash with
// `TypeError: card.execute is not a function` after the first sync.
// ─────────────────────────────────────────────────────────────────────────────
const _CARD_DEFS_BY_ID = (() => {
  const map = Object.create(null);
  for (const c of DECK) map[c.id] = c;
  for (const c of ACTION_CARDS) map[c.id] = c;
  return map;
})();
function _rehydrateCardInPlace(card) {
  if (!card || typeof card !== 'object' || !card.id) return card;
  const def = _CARD_DEFS_BY_ID[card.id];
  if (!def) return card; // unknown id — leave it alone
  // Re-attach every function-typed property from the canonical definition.
  // We don't clone the card — we mutate it in place so existing references
  // (e.g. G.nodes[id] pointing into G after assignment) stay correct.
  for (const key of Object.keys(def)) {
    if (typeof def[key] === 'function' && typeof card[key] !== 'function') {
      card[key] = def[key];
    }
  }
  return card;
}
function rehydrateGameState(state) {
  if (!state || typeof state !== 'object') return state;
  // Decks / discards
  if (Array.isArray(state.deck)) state.deck.forEach(_rehydrateCardInPlace);
  if (Array.isArray(state.discard)) state.discard.forEach(_rehydrateCardInPlace);
  // Player hands
  if (state.players) {
    for (const pid of Object.keys(state.players)) {
      const hand = state.players[pid]?.hand;
      if (Array.isArray(hand)) hand.forEach(_rehydrateCardInPlace);
    }
  }
  // Nodes — group cards on the board may also carry filter/execute methods
  if (state.nodes) {
    for (const nid of Object.keys(state.nodes)) {
      _rehydrateCardInPlace(state.nodes[nid]);
    }
  }
  return state;
}
const _myRecentWrites = new Set();
function _markOwnWrite(version) {
  _myRecentWrites.add(version);
  // Keep the set bounded
  if (_myRecentWrites.size > 64) {
    const oldest = Math.min(...Array.from(_myRecentWrites));
    _myRecentWrites.delete(oldest);
  }
}
function _isOwnEcho(version, writerId) {
  if (writerId === HUMAN_ID && _myRecentWrites.has(version)) return true;
  return false;
}
function publishTurnAdvanced(snapshot) {
  return;
}

// Wrapper for sending state updates if in multiplayer.
// Bumps a monotonically increasing version stamp so receivers can ignore
// echoes of their own writes and prevent stale overwrites.
function syncState() {
  return Promise.resolve(null);
}

// Wrapper for logging events that should be broadcasted
function networkLog(msg, type = 'success') {
  logEvent(msg, type);
}

// Wrapper for broadcasting VFX
function networkVfx(nodeId, vfxType) {
  if (gameGraphScene) gameGraphScene.playNodeEffect(nodeId, vfxType);
}

// Wrapper for broadcasting SFX
function networkSfx(sfxName) {
  if (sfxName === 'success') SFX.playSuccess();
  if (sfxName === 'failure') SFX.playFailure();
  if (sfxName === 'attack') SFX.playAttack();
  if (sfxName === 'capture') SFX.playCapture();
  if (sfxName === 'power') SFX.playActionPower();
  if (sfxName === 'debuff') SFX.playActionDebuff();
  if (sfxName === 'economy') SFX.playActionEconomy();
  if (sfxName === 'special') SFX.playActionSpecial();
}
function startGame(factionId) {
  lastRenderedHandKeys = null;
  recentHandDrawKeys.clear();
  if (gameGraphScene) gameGraphScene._hasRenderedGraphOnce = false;
  G = newGameState();

  // Attach simulation config if present (for win conditions)
  if (window.aiSimulationConfig) {
    G.simConfig = {
      ...window.aiSimulationConfig
    };
  } else {
    // Default values if not set
    G.simConfig = {
      allowFactionWin: true,
      allowGenericWin: true,
      genericWinThreshold: 10
    };
  }
  const myFac = FACTIONS[factionId];
  const rootId = `root_${HUMAN_ID}`;
  let myHand = drawInitialHand(G.deck, 4);

  // AI opponents
  let aiCount = 3;
  let selectedOpponentIds = [];
  const others = Object.keys(FACTIONS).filter(f => f !== factionId);
  if (window.aiSimulationConfig) {
    aiCount = window.aiSimulationConfig.count;
    const configOpponents = window.aiSimulationConfig.opponents;

    // Track used factions to prevent duplicates when picking 'random'
    let availableFactions = [...others].sort(() => Math.random() - 0.5);
    for (let i = 0; i < aiCount; i++) {
      let choice = configOpponents[i];
      if (choice === 'random' || !FACTIONS[choice]) {
        if (availableFactions.length > 0) {
          choice = availableFactions.shift();
        } else {
          // If we run out of unique factions, just pick a random one
          choice = others[Math.floor(Math.random() * others.length)];
        }
      } else {
        // If a specific faction was chosen, remove it from available for random picks
        availableFactions = availableFactions.filter(f => f !== choice);
      }
      selectedOpponentIds.push(choice);
    }
  } else {
    const sortedOthers = [...others].sort(() => Math.random() - 0.5);
    aiCount = Math.min(3, sortedOthers.length);
    selectedOpponentIds = sortedOthers.slice(0, aiCount);
  }
  const positions = getSpawnPositions(aiCount + 1);
  const myPos = positions.pop();
  G.playerOrder.push(HUMAN_ID);
  G.players[HUMAN_ID] = {
    funds: 0,
    name: "CHAIRMAN",
    factionId,
    rootNodeId: rootId,
    hand: myHand,
    isAI: false,
    stolenCount: 0,
    destroyedOwners: []
  };
  G.nodes[rootId] = {
    id: rootId,
    name: myFac.name,
    type: "root",
    power: myFac.power,
    transferPower: myFac.transferPower,
    resistance: myFac.resistance,
    income: myFac.income,
    arrows: 4,
    alignments: myFac.alignments || [],
    desc: myFac.desc,
    icon: myFac.icon,
    owner: HUMAN_ID,
    image: myFac.image,
    logo: myFac.logo,
    winDesc: myFac.winDesc,
    ability: myFac.ability,
    parentId: null,
    btc: 10,
    x: myPos.x,
    y: myPos.y
  };
  for (let i = 0; i < aiCount; i++) {
    const aiFid = selectedOpponentIds[i];
    const aiFac = FACTIONS[aiFid];
    const aiId = `ai_${aiFid}`;
    const aiRootId = `root_${aiId}`;
    let aiHand = drawInitialHand(G.deck, 4);
    const aiPos = positions.pop();
    G.playerOrder.push(aiId);
    G.players[aiId] = {
      funds: 0,
      name: aiFac.name,
      factionId: aiFid,
      rootNodeId: aiRootId,
      hand: aiHand,
      isAI: true,
      stolenCount: 0,
      destroyedOwners: []
    };
    G.nodes[aiRootId] = {
      id: aiRootId,
      name: aiFac.name,
      type: "root",
      power: aiFac.power,
      transferPower: aiFac.transferPower,
      resistance: aiFac.resistance,
      income: aiFac.income,
      arrows: 4,
      alignments: aiFac.alignments || [],
      desc: aiFac.desc,
      icon: aiFac.icon,
      owner: aiId,
      image: aiFac.image,
      logo: aiFac.logo,
      winDesc: aiFac.winDesc,
      ability: aiFac.ability,
      parentId: null,
      btc: 10,
      x: aiPos.x,
      y: aiPos.y
    };
  }
  document.getElementById('faction-modal').style.display = 'none';
  networkLog(`Identity Confirmed: CHAIRMAN of ${myFac.name}.`, "success");
  networkLog(`${aiCount} rival factions detected.`, "failure");

  // Seed Neutral Zone
  populateNeutralZone(aiCount + 1);
  syncState();

  // In multiplayer, the host already started the turn in initMultiplayerGame
  // For local, we start the turn manually here

  // Center camera on Neutral Zone and zoom out
  setTimeout(() => {
    const center = getNeutralZoneCenter();
    if (gameGraphScene) {
      gameGraphScene.centerCameraOn(center.x, center.y);
      gameGraphScene.cameras.main.zoomTo(0.45, 500, 'Power2');
    }
  }, 300);
  beginTurn(G.playerOrder[0]);
}

// ═══════════════════════════════════════
//  TUTORIAL GAME INIT
// ═══════════════════════════════════════
function startTutorialGame() {
  const factionId = tutorial.getTutorialFactionId();
  const aiFactionId = tutorial.getTutorialAIFactionId();
  G = newGameState();
  const myFac = FACTIONS[factionId];
  const aiFac = FACTIONS[aiFactionId];
  const rootId = `root_${HUMAN_ID}`;

  // ─── Tutorial deck curation ─────────────────────────────────────────────
  // The shared-market paradigm means Group cards live on the board, not in
  // hands. For the tutorial, we curate exactly which groups appear so the
  // experience is identical every time:
  //   1. Pull the 4 SEEDED neutrals → place into the Uncontrolled Zone now.
  //   2. Pull the curated REFILL order → stage on top of deck (popped in order
  //      whenever end-of-turn refill would surface a Group card).
  //   3. Strip ALL remaining Group cards from the deck so refills only ever
  //      surface curated tutorial groups.
  //   4. Strip noisy Action cards we don't want fired during teaching.
  const seededIds = tutorial.getSeededNeutrals();
  const refillIds = tutorial.getMarketRefillOrder();
  const tutorialGroupIds = new Set([...seededIds, ...refillIds]);
  const seededCards = [];
  for (const cid of seededIds) {
    const idx = G.deck.findIndex(c => c.id === cid);
    if (idx !== -1) seededCards.push(G.deck.splice(idx, 1)[0]);
  }
  const refillCards = [];
  for (const cid of refillIds) {
    const idx = G.deck.findIndex(c => c.id === cid);
    if (idx !== -1) refillCards.push(G.deck.splice(idx, 1)[0]);
  }
  // Remove any non-curated Group cards from the deck entirely.
  G.deck = G.deck.filter(c => c.type === 'action' || tutorialGroupIds.has(c.id));
  // Stage refill order at the END of the deck so deck.pop() yields refillCards[0]
  // first, then refillCards[1], etc. (Cards are popped from deck end.)
  // Push in reverse so the first ID in refillIds ends up on top of the deck.
  for (let i = refillCards.length - 1; i >= 0; i--) {
    G.deck.push(refillCards[i]);
  }
  const positions = [{
    x: 400,
    y: 500
  },
  // Human — left-center
  {
    x: 1500,
    y: 500
  } // AI — right-center
  ];
  G.playerOrder.push(HUMAN_ID);
  G.players[HUMAN_ID] = {
    funds: 0,
    name: "CHAIRMAN",
    factionId,
    rootNodeId: rootId,
    // Empty hand — Group cards live in the Uncontrolled Zone now; action cards
    // get curated in via tutorial.getCuratedHand() on Turn 6.
    hand: [],
    isAI: false,
    stolenCount: 0,
    destroyedOwners: []
  };
  G.nodes[rootId] = {
    id: rootId,
    name: myFac.name,
    type: "root",
    power: myFac.power,
    transferPower: myFac.transferPower,
    resistance: myFac.resistance,
    income: myFac.income,
    arrows: 4,
    alignments: myFac.alignments || [],
    desc: myFac.desc,
    icon: myFac.icon,
    owner: HUMAN_ID,
    image: myFac.image,
    logo: myFac.logo,
    winDesc: myFac.winDesc,
    ability: myFac.ability,
    parentId: null,
    btc: 10,
    x: positions[0].x,
    y: positions[0].y
  };

  // Single AI opponent (only 1 for tutorial clarity)
  const aiId = `ai_${aiFactionId}`;
  const aiRootId = `root_${aiId}`;
  // AI starts with an empty hand — it doesn't need Group cards (they're shared)
  // and we don't want it firing random Action cards mid-tutorial. The AI's
  // teaching moves are scripted around capturing seeded neutrals.
  G.playerOrder.push(aiId);
  G.players[aiId] = {
    funds: 0,
    name: aiFac.name,
    factionId: aiFactionId,
    rootNodeId: aiRootId,
    hand: [],
    isAI: true,
    stolenCount: 0,
    destroyedOwners: []
  };
  G.nodes[aiRootId] = {
    id: aiRootId,
    name: aiFac.name,
    type: "root",
    power: aiFac.power,
    transferPower: aiFac.transferPower,
    resistance: aiFac.resistance,
    income: aiFac.income,
    arrows: 4,
    alignments: aiFac.alignments || [],
    desc: aiFac.desc,
    icon: aiFac.icon,
    owner: aiId,
    image: aiFac.image,
    logo: aiFac.logo,
    winDesc: aiFac.winDesc,
    ability: aiFac.ability,
    parentId: null,
    btc: 6,
    // Less starting BTC for tutorial AI
    x: positions[1].x,
    y: positions[1].y
  };

  // Reduce AI power slightly for tutorial (make it beatable)
  G.nodes[aiRootId].power = Math.max(4, aiFac.power - 2);
  document.getElementById('faction-modal').style.display = 'none';
  networkLog(`🎓 Training Protocol: CHAIRMAN of ${myFac.name}.`, "success");
  networkLog(`🎓 Training opponent: ${aiFac.name}.`, "warning");
  networkLog(`🎓 Objective: Control ${TUTORIAL_WIN_GROUPS} groups to complete training.`, "success");

  // ─── Seed the Uncontrolled Zone ──────────────────────────────────────────
  // Place the 4 curated neutrals onto the board between the two roots so the
  // player sees a tight, intimate market on T1.
  const seedAnchor = {
    x: 950,
    y: 500
  }; // midway between roots
  const seedOffsets = [{
    x: -180,
    y: -120
  }, {
    x: 180,
    y: -120
  }, {
    x: -180,
    y: 120
  }, {
    x: 180,
    y: 120
  }];
  seededCards.forEach((card, i) => {
    const off = seedOffsets[i] || {
      x: 0,
      y: 0
    };
    const spot = getNeutralZoneSpot(seedAnchor.x + off.x, seedAnchor.y + off.y, [card.id]);
    card.owner = null;
    card.parentId = null;
    card.parentPortSide = null;
    card.rotationSteps = 0;
    card.btc = 0;
    card.x = spot.x;
    card.y = spot.y;
    G.nodes[card.id] = {
      ...card
    };
  });
  networkLog(`🌐 Uncontrolled Zone seeded with ${seededCards.length} groups for training.`, 'success');

  // Initialize tutorial engine with game API hooks
  tutorial.init({
    focusCameraOnPlayerNetwork,
    focusCameraOnNode: (nodeId, opts = {}) => {
      if (!gameGraphScene || !G?.nodes?.[nodeId]) return;
      const n = G.nodes[nodeId];
      gameGraphScene.centerCameraOn(n.x, n.y, opts.duration ?? 700);
      if (opts.zoom !== undefined) {
        gameGraphScene.zoomCameraTo(opts.zoom, opts.duration ?? 700);
      }
    },
    setTutorialHighlight: nodeId => {
      if (gameGraphScene?.setTutorialHighlight) gameGraphScene.setTutorialHighlight(nodeId);
    },
    getAIPlayerId: () => G.playerOrder.find(pid => pid !== HUMAN_ID),
    getHumanId: () => HUMAN_ID,
    getGameState: () => G,
    getSelectedNode: () => mySelectedNodeId ? G.nodes[mySelectedNodeId] : null,
    getSelectedHandCard: () => mySelectedHandCardIndex !== null ? G.players[HUMAN_ID].hand[mySelectedHandCardIndex] : null,
    onSkip: () => {
      // Provide a graceful exit when the player skips the tutorial mid-game
      resetGameForNewSession();
      document.getElementById('mode-modal').style.display = 'flex';
      networkLog("Tutorial aborted. Returning to secure network hub.", "warning");
    }
  });

  // Center camera on the seeded market so the player sees both roots and all
  // 4 neutral targets at once.
  setTimeout(() => {
    if (gameGraphScene) {
      gameGraphScene.centerCameraOn(seedAnchor.x, seedAnchor.y);
      gameGraphScene.cameras.main.zoomTo(0.55, 500, 'Power2');
    }
  }, 300);
  refreshAll();
  beginTurn(G.playerOrder[0]);
}

// ═══════════════════════════════════════
//  TURN STRUCTURE
// ═══════════════════════════════════════

function drawTurnCard(playerId) {
  if (G.deck.length === 0) return;
  const p = G.players[playerId];
  if (!p) return;

  // In tutorial mode, we skip drawing so we don't mess up scripted hands/board
  if (isTutorialMode && tutorial.isActive()) return;
  const drawnCard = G.deck.pop();
  if (drawnCard.type === 'action') {
    p.hand.push(drawnCard);
    if (playerId === HUMAN_ID) {
      rememberHandDraw(drawnCard);
      logEvent(`🃏 Drew Action Card: ${drawnCard.name}`, 'success');
    }
  } else {
    // Group card goes to the Neutral Zone (board)
    const spawnSpot = getNeutralZoneSpot(null, null, [drawnCard.id]);
    drawnCard.owner = null;
    drawnCard.parentId = null;
    drawnCard.parentPortSide = null;
    drawnCard.rotationSteps = 0;
    drawnCard.btc = 0;
    drawnCard.x = spawnSpot.x;
    drawnCard.y = spawnSpot.y;
    G.nodes[drawnCard.id] = {
      ...drawnCard
    };
    networkLog(`🌐 Market Update: ${drawnCard.name} entered the Uncontrolled Zone.`, 'warning');
    if (gameGraphScene) {
      const center = getNeutralZoneCenter();
      gameGraphScene.neutralZoneIndicator.setPosition(center.x, center.y);
      gameGraphScene.neutralZoneIndicator.setVisible(true);

      // Broadcast to remote clients

      setTimeout(() => {
        if (gameGraphScene && gameGraphScene.neutralZoneIndicator) {
          gameGraphScene.neutralZoneIndicator.setVisible(false);
        }
      }, 3000);
    }
  }
}
function beginTurn(playerId) {
  G.turnPhase = TURN_PHASES.INCOME;
  G.actionsUsed = 0;
  if (typeof G.actionsPerTurn !== 'number') G.actionsPerTurn = 2;
  G.transfersUsedThisTurn = 0;
  selectedAttackerNodeId = null;
  clearRearrangePreview();
  Object.values(G.nodes).forEach(n => {
    if (n.owner === playerId) {
      n.hasActedThisRound = false;
      n.abilityUsedThisTurn = false;
      n._tempResDebuff = 0;
    }
  });

  // Reset faction ability usage for this player's turn
  G.factionAbilityUsed[playerId] = false;

  // ─── Tutorial: inject curated hand cards for scripted turns ───
  if (isTutorialMode && tutorial.isActive() && playerId === HUMAN_ID) {
    const curatedCards = tutorial.getCuratedHand(G.turnNumber);
    if (curatedCards) {
      const p = G.players[HUMAN_ID];
      // Find the curated cards from the deck/action pool and inject them into hand
      curatedCards.forEach(cardId => {
        // Don't add if already in hand
        if (p.hand.some(c => c.id === cardId)) return;
        // Try to find it in the deck
        const deckIdx = G.deck.findIndex(c => c.id === cardId);
        if (deckIdx !== -1) {
          p.hand.push(G.deck.splice(deckIdx, 1)[0]);
        } else {
          // Card might be in discard or not drawn yet — find from DECK or ACTION_CARDS
          const templateCard = DECK.find(c => c.id === cardId) || ACTION_CARDS.find(c => c.id === cardId);
          if (templateCard && !G.nodes[cardId]) {
            p.hand.push({
              ...templateCard
            });
          }
        }
      });
    }
  }

  // Fire a global event every turn after turn 1
  // (Suppressed during tutorial — surprise events would derail the scripted demo.)
  const tutorialSuppressEvents = isTutorialMode && tutorial.isActive();
  if (G.activePlayerIndex === 0 && G.turnNumber > 1 && !tutorialSuppressEvents) {
    fireGlobalEvent();
  }
  const overlayTitle = document.getElementById('turn-overlay-title');
  const overlaySubtitle = document.getElementById('turn-overlay-subtitle');
  const overlay = document.getElementById('turn-overlay');
  const overlayLogo = document.getElementById('turn-overlay-logo');
  if (overlayTitle && overlaySubtitle && overlay) {
    const p = G.players[playerId];
    const faction = FACTIONS[p?.factionId];
    if (overlayLogo && faction?.logo) {
      overlayLogo.src = faction.logo;
      overlayLogo.style.display = 'block';
    } else if (overlayLogo) {
      overlayLogo.style.display = 'none';
    }
    if (playerId === HUMAN_ID) {
      overlayTitle.innerText = "YOUR TURN";
      overlayTitle.style.color = "var(--accent-green)";
      overlaySubtitle.innerText = "INITIATING OPERATIONS...";
    } else {
      overlayTitle.innerText = `${p?.name || 'OPERATIVE'}'S TURN`;
      overlayTitle.style.color = "var(--accent-red)";
      overlaySubtitle.innerText = "MONITORING NETWORK TRAFFIC...";
    }
    overlay.style.display = 'flex';
    overlay.style.opacity = 1;
    setTimeout(() => {
      overlay.style.opacity = 0;
      setTimeout(() => {
        overlay.style.display = 'none';
      }, 500);
    }, 2000);
  }
  drawTurnCard(playerId);
  collectIncome(playerId);
  G.turnPhase = TURN_PHASES.ACTION;
  if (playerId === HUMAN_ID) {
    SFX.playTurnStart();
    scheduleCameraFocusOnPlayerNetwork(HUMAN_ID, {
      snap: false,
      duration: 850,
      initialDelay: 80
    });
    // Broker peek: reveal a random card from an opponent's hand
    const peek = brokerPeek(G.nodes, G.players, HUMAN_ID);
    if (peek) {
      logEvent(`🕵️ Broker intel: ${peek.opponentName} holds ${peek.card.icon} ${peek.card.name} (P${peek.card.power} R${peek.card.resistance}).`, 'warning');
    }
    // Show active ability reminders
    const hasReroll = hasEsportsReroll(G.nodes, HUMAN_ID);
    const hasDieMod = getAstrologyModifier(G.nodes, HUMAN_ID);
    if (hasReroll) logEvent('🎮 Esports: auto-reroll on failed dice.', 'success');
    if (hasDieMod) logEvent('✨ Astrology: +1 to all dice rolls.', 'success');
    // Faction ability reminder
    const myFac = FACTIONS[G.players[HUMAN_ID].factionId];
    if (myFac?.active) {
      logEvent(`⭐ ${myFac.active.icon} ${myFac.active.name} ready.`, 'success');
    } else if (myFac?.passive2) {
      logEvent(`⭐ ${myFac.passive2.icon} ${myFac.passive2.name} online.`, 'success');
    }
  }
  syncState();
  refreshAll();

  // ─── Tutorial hooks ───
  if (isTutorialMode && tutorial.isActive() && playerId === HUMAN_ID) {
    // Suppress global events in tutorial
    G.lastEventTurn = G.turnNumber;
    // Give tutorial steps time to run after the turn overlay fades
    setTimeout(async () => {
      await tutorial.onTurnStart(G.turnNumber, playerId, HUMAN_ID);
      // After pre-turn steps, fire action phase steps
      await tutorial.onActionPhase();
    }, 2200);
  }
  if (G.players[playerId]?.isAI && !G.winner) {
    if (window.activeProcessAITurnTimeout) {
      clearTimeout(window.activeProcessAITurnTimeout);
    }
    window.activeProcessAITurnTimeout = setTimeout(() => {
      window.activeProcessAITurnTimeout = null;
      processAITurn(playerId);
    }, isTutorialMode ? 2000 : 1500);
  }
}
function fireGlobalEvent() {
  if (!G.eventDeck || G.eventDeck.length === 0) {
    G.eventDeck = [...EVENT_DECK].sort(() => Math.random() - 0.5);
  }
  const event = G.eventDeck.pop();
  if (!event || !event.effect) return;
  G.currentEvent = event;

  // ═══ Event Immunity Snapshot ═══
  // Some cards explicitly grant immunity to global events:
  //   - n_space (Billionaire Space Tourists) — immune to all earth-based events
  //   - children of n_diplo (United Nations) — same player only
  //   - x_taxavoid / y_shell — income cannot be reduced by events
  // We capture pre-event state for these nodes and restore the protected fields
  // afterward so events never touch them, regardless of which fields the
  // event happened to mutate.
  const protectedSnapshot = {};
  Object.values(G.nodes).forEach(n => {
    if (n.type === 'root') return;
    const fullImmune = hasEventImmunity(G.nodes, n.id);
    const incomeImmune = hasEventIncomeImmunity(G.nodes, n.id);
    if (!fullImmune && !incomeImmune) return;
    protectedSnapshot[n.id] = {
      full: fullImmune,
      income: incomeImmune,
      data: {
        power: n.power,
        resistance: n.resistance,
        income: n.income,
        btc: n.btc,
        alignments: n.alignments ? [...n.alignments] : [],
        _cannotAttackThisRound: n._cannotAttackThisRound,
        _cannotDefendThisRound: n._cannotDefendThisRound,
        _cannotTransferThisRound: n._cannotTransferThisRound,
        _cannotSupportAttacksThisRound: n._cannotSupportAttacksThisRound,
        _untargetableThisRound: n._untargetableThisRound,
        _canAttackTwiceThisRound: n._canAttackTwiceThisRound,
        _tempPowerBuff: n._tempPowerBuff,
        _tempResBuff: n._tempResBuff,
        _tempResDebuff: n._tempResDebuff,
        _savedRes: n._savedRes,
        _savedPow: n._savedPow,
        _savedInc: n._savedInc,
        _restoreResEndOfRound: n._restoreResEndOfRound,
        _restorePowEndOfRound: n._restorePowEndOfRound,
        _restoreIncomeEndOfRound: n._restoreIncomeEndOfRound,
        _tempAlignments: n._tempAlignments ? [...n._tempAlignments] : undefined,
        _removedAlignments: n._removedAlignments ? [...n._removedAlignments] : undefined,
        abilityCancelled: n.abilityCancelled
      }
    };
  });
  const msg = event.effect(G);

  // ═══ Roll back changes on immune nodes ═══
  let immuneTriggered = [];
  Object.entries(protectedSnapshot).forEach(([nid, snap]) => {
    const node = G.nodes[nid];
    if (!node) return;
    const before = snap.data;
    let touched = false;
    if (snap.full) {
      // Full immunity — restore every tracked field if anything changed.
      const fields = ['power', 'resistance', 'income', 'btc', '_cannotAttackThisRound', '_cannotDefendThisRound', '_cannotTransferThisRound', '_cannotSupportAttacksThisRound', '_untargetableThisRound', '_canAttackTwiceThisRound', '_tempPowerBuff', '_tempResBuff', '_tempResDebuff', '_savedRes', '_savedPow', '_savedInc', '_restoreResEndOfRound', '_restorePowEndOfRound', '_restoreIncomeEndOfRound', 'abilityCancelled'];
      fields.forEach(f => {
        if (node[f] !== before[f]) {
          node[f] = before[f];
          touched = true;
        }
      });
      // Restore alignments arrays exactly
      if (JSON.stringify(node.alignments || []) !== JSON.stringify(before.alignments)) {
        node.alignments = [...before.alignments];
        touched = true;
      }
      if (JSON.stringify(node._tempAlignments || []) !== JSON.stringify(before._tempAlignments || [])) {
        node._tempAlignments = before._tempAlignments ? [...before._tempAlignments] : node._tempAlignments;
        touched = true;
      }
      if (JSON.stringify(node._removedAlignments || []) !== JSON.stringify(before._removedAlignments || [])) {
        node._removedAlignments = before._removedAlignments ? [...before._removedAlignments] : node._removedAlignments;
        touched = true;
      }
    } else if (snap.income) {
      // Income-only immunity — restore Income & related saved fields only.
      if (node.income !== before.income) {
        node.income = before.income;
        touched = true;
      }
      if (node._savedInc !== before._savedInc) {
        node._savedInc = before._savedInc;
        touched = true;
      }
      if (node._restoreIncomeEndOfRound !== before._restoreIncomeEndOfRound) {
        node._restoreIncomeEndOfRound = before._restoreIncomeEndOfRound;
        touched = true;
      }
    }
    if (touched) immuneTriggered.push(node.name);
  });
  if (immuneTriggered.length > 0) {
    logEvent(`🛡️ Event immunity protected: ${immuneTriggered.join(', ')}.`, 'success');
  }
  logEvent(msg, 'warning');
  updateEventTicker(`${event.icon} ${event.name}: ${event.desc} --- `);
  showGlobalEventRevealOverlay(event, msg);

  // If a player's hand was revealed (e.g. Whistleblower), log it for transparency
  Object.entries(G.players).forEach(([pid, p]) => {
    if (p._handRevealed && p.hand.length > 0) {
      const cardNames = p.hand.map(c => `${c.icon} ${c.name}`).join(', ');
      logEvent(`📂 REVEALED INTEL: ${p.name}'s hand contains [${cardNames}]`, 'warning');
    }
  });

  // Event-triggered passive abilities
  Object.values(G.nodes).forEach(n => {
    if (!n.owner) return;
    const isHuman = n.owner === HUMAN_ID;
    // Public Health Directorate & Pandemic Preparedness & Climate Engineering: crisis event +1 Power
    if (n.id === 'n_health' || n.id === 'x_pandemic' || n.id === 'x_climateeng') {
      n.power = (n.power || 0) + 1;
      if (isHuman) logEvent(`🏥 ${n.name}: crisis response +1 Power.`, 'success');
    }
    // Tabloid Outrage Factory: event = +1 Income
    if (n.id === 'n_tabloid') {
      n.income = (n.income || 0) + 1;
      if (isHuman) logEvent(`📰 ${n.name}: outrage = profit (+1 Income).`, 'success');
    }
    // Virtual Idol Talent Agency: event = +₿1
    if (n.id === 'x_virtualidol') {
      n.btc = (n.btc || 0) + 1;
      if (isHuman) logEvent(`🎤 ${n.name}: event buzz +₿1.`, 'success');
    }
    // Citizen Journalism Swarm: event = +1 Resistance
    if (n.id === 'x_citizenj') {
      n.resistance = (n.resistance || 0) + 1;
      if (isHuman) logEvent(`📱 ${n.name}: covering the event, +1 Resistance.`, 'success');
    }
  });
}
function updateEventTicker(text) {
  const elTicker = document.getElementById('top-ticker-text');
  if (!elTicker) return;
  elTicker.innerText = (text + ' ').repeat(4);
}
function collectIncome(playerId) {
  const p = G.players[playerId];
  if (!p) return;
  let totalIncome = 0;
  let bonusTotal = 0;
  Object.values(G.nodes).forEach(n => {
    if (n.owner === playerId && n.income > 0) {
      const bonus = getIncomeBonus(G.nodes, n, G._networkBlackout);
      const amount = n.income + bonus;
      n.btc = (n.btc || 0) + amount;
      totalIncome += n.income;
      bonusTotal += bonus;
    }
  });

  // Income phase bonuses: Wellness, Dream Ad, Instant Loan, Charity
  const phaseBonuses = getIncomePhaseBonuses(G.nodes, playerId);
  let powTotal = 0;
  let resTotal = 0;
  phaseBonuses.forEach(b => {
    if (b.type === 'power') powTotal += b.amount;
    if (b.type === 'resistance') resTotal += b.amount;
    if (playerId === HUMAN_ID) logEvent(`✨ ${b.icon} ${b.name}: +${b.amount} ${b.type} (${b.reason}).`, 'success');
  });

  // Global Attention Metrics Exchange: gains +₿1 whenever ANY player collects income
  Object.values(G.nodes).forEach(n => {
    if (n.id === 'x_attmetrics' && n.owner && n.owner !== playerId) {
      n.btc = (n.btc || 0) + 1;
      if (n.owner === HUMAN_ID) logEvent(`👁️ Attention Metrics: +₿1 from ${G.players[playerId]?.name}'s income.`, 'success');
    }
  });

  // Infinite Podcast Network: draw +1 card on income collection
  const hasPodNet = Object.values(G.nodes).some(n => n.owner === playerId && n.id === 'x_infpodcast' && !isAbilityCancelled(G.nodes, n));
  if (hasPodNet && G.deck.length > 0) {
    if (playerId === HUMAN_ID) {
      logEvent('🎧 Podcast Network: drawing bonus card...', 'success');
    }
    drawTurnCard(playerId);
  }
  let debtStr = '';
  if (p.volatilityDebt > 0) {
    const debt = p.volatilityDebt;
    spendBtc(playerId, debt);
    p.volatilityDebt = 0;
    debtStr = ` (paid ₿${debt} debt)`;
  }
  const bonusStr = bonusTotal > 0 ? ` (+₿${bonusTotal} links)` : '';
  const phaseStr = powTotal > 0 || resTotal > 0 ? ` (+${powTotal}P/+${resTotal}R passives)` : '';
  if (playerId === HUMAN_ID) {
    logEvent(`📥 Turn begins. Collected ₿${totalIncome}${bonusStr}${phaseStr}${debtStr}.`, 'success');
    if (totalIncome > 0) SFX.playIncome();
  } else {
    logEvent(`📥 ${p.name}: collected ₿${totalIncome}${bonusStr}${phaseStr}${debtStr}.`, 'success');
  }
}
function getPlayerTotalBtc(playerId) {
  let total = 0;
  Object.values(G.nodes).forEach(n => {
    if (n.owner === playerId) total += n.btc || 0;
  });
  return total;
}
function spendBtc(playerId, amount) {
  let remaining = amount;
  const myNodes = Object.values(G.nodes).filter(n => n.owner === playerId && (n.btc || 0) > 0).sort((a, b) => (b.btc || 0) - (a.btc || 0));
  for (const node of myNodes) {
    if (remaining <= 0) break;
    const take = Math.min(node.btc || 0, remaining);
    node.btc -= take;
    remaining -= take;
  }
  return remaining <= 0.001;
}
function getPlayerTotalPower(playerId) {
  let power = 0;
  Object.values(G.nodes).forEach(n => {
    if (n.owner === playerId) power += n.power || 0;
  });
  return power;
}
function getPlayerIncome(playerId) {
  let inc = 0;
  Object.values(G.nodes).forEach(n => {
    if (n.owner === playerId) inc += n.income || 0;
  });
  return inc;
}
function getActivePlayerId() {
  return G.playerOrder[G.activePlayerIndex];
}
function isMyTurn() {
  return G && getActivePlayerId() === HUMAN_ID;
}

// ─── FREE ACTION: Transfer BTC ───
function transferBtc(playerId, fromNodeId, toNodeId, amount) {
  const from = G.nodes[fromNodeId];
  const to = G.nodes[toNodeId];
  if (!from || !to || from.owner !== playerId || to.owner !== playerId) return false;
  if ((from.btc || 0) < amount) return false;
  // Cyber Attack / Supply Chain Collapse — high-income or Corporate groups
  // are flagged as transfer-locked for the round.
  if (from._cannotTransferThisRound) {
    if (playerId === HUMAN_ID) logEvent(`🖥️ ${from.name}: BTC transfer locked by global event this round.`, 'failure');
    return false;
  }
  if (to._cannotTransferThisRound) {
    if (playerId === HUMAN_ID) logEvent(`🖥️ ${to.name}: cannot receive BTC this round (event lock).`, 'failure');
    return false;
  }
  from.btc -= amount;
  to.btc = (to.btc || 0) + amount;
  return true;
}

// ═══════════════════════════════════════
//  ATTACKER HELPERS
// ═══════════════════════════════════════

/**
 * Get all of a player's nodes that have free outgoing arrow slots (can accept a new child).
 */
function getNodesWithFreeSlots(playerId) {
  return Object.values(G.nodes).filter(n => n.owner === playerId && !n.hasActedThisRound && getFreeArrows(G.nodes, n.id) > 0);
}

/**
 * Get all of a player's nodes that haven't acted yet.
 */
function getAllOwnedNodes(playerId) {
  return Object.values(G.nodes).filter(n => n.owner === playerId && !n.hasActedThisRound);
}
function canAttachNodeToParent(card, parentNode, options = {}) {
  if (!card || !parentNode) return null;
  return findAttachmentSolution(G.nodes, parentNode, card, options);
}
function getControlAttackOptionForTarget(target, attackerNodeId, playerId = HUMAN_ID) {
  if (!target || !attackerNodeId) return null;
  const node = G.nodes[attackerNodeId];
  if (!node || node.owner !== playerId || node.hasActedThisRound) return null;
  if (getFreeArrows(G.nodes, node.id) <= 0) return null;
  const attachment = canAttachNodeToParent(target, node, {
    ignoreNodeIds: [target.id],
    collisionPadding: -4
  });
  if (!attachment) return null;
  const attackStrength = getAttackStrength(G.nodes, node.id, G._networkBlackout);
  const alignPenalty = getAlignmentPenalty(node.alignments || [], target.alignments || []);
  const abilityMod = getAttackAbilityModifier(G.nodes, node, target, G._networkBlackout);
  const score = attackStrength + alignPenalty + abilityMod;
  return {
    node,
    attachment,
    score
  };
}
function getBestControlAttackerForTarget(target, preferredAttackerId = null) {
  if (!target) return null;
  const candidates = getNodesWithFreeSlots(HUMAN_ID).map(node => {
    const option = getControlAttackOptionForTarget(target, node.id);
    if (!option) return null;
    return {
      ...option,
      preferred: preferredAttackerId && node.id === preferredAttackerId
    };
  }).filter(Boolean).sort((a, b) => {
    if (a.preferred && !b.preferred) return -1;
    if (!a.preferred && b.preferred) return 1;
    return b.score - a.score;
  });
  return candidates[0] || null;
}
function getSubtreeNodeIds(rootId) {
  return [rootId, ...getDescendants(G.nodes, rootId)];
}
function computeSubtreeDelta(nodeId, solution) {
  const node = G.nodes[nodeId];
  if (!node || !solution) return null;
  return {
    dx: solution.x - node.x,
    dy: solution.y - node.y,
    rotationDelta: (((solution.rotationSteps || 0) - (node.rotationSteps || 0)) % 4 + 4) % 4
  };
}

/**
 * Transform a subtree's positions for a given root solution.
 * When rotationDelta != 0, descendants must rotate around the root's pivot,
 * not just translate by dx/dy. This prevents multi-level subtrees from ending
 * up in wrong positions when the root card changes rotation.
 */
function computeSubtreeTransformedNodes(nodeId, solution) {
  const node = G.nodes[nodeId];
  if (!node || !solution) return null;
  const subtreeIds = getSubtreeNodeIds(nodeId);
  const transform = computeSubtreeDelta(nodeId, solution);
  if (!transform) return null;
  const oldRootX = node.x;
  const oldRootY = node.y;
  const newRootX = solution.x;
  const newRootY = solution.y;
  const result = {};
  subtreeIds.forEach(id => {
    const current = G.nodes[id];
    if (!current) return;
    const next = {
      ...current
    };
    if (id === nodeId) {
      // Root node gets the exact solution placement
      next.x = newRootX;
      next.y = newRootY;
      next.rotationSteps = solution.rotationSteps;
      next.parentPortSide = solution.parentPortSide;
      next.parentId = solution.parentId ?? next.parentId;
    } else {
      // Descendants: compute position relative to old root, rotate around pivot, then translate
      const relX = current.x - oldRootX;
      const relY = current.y - oldRootY;
      if (transform.rotationDelta !== 0) {
        // Rotate the relative offset around the root pivot
        const rotated = rotateVector({
          x: relX,
          y: relY
        }, transform.rotationDelta);
        next.x = newRootX + rotated.x;
        next.y = newRootY + rotated.y;
      } else {
        // No rotation change — simple translation
        next.x = current.x + transform.dx;
        next.y = current.y + transform.dy;
      }
      next.rotationSteps = (((current.rotationSteps || 0) + transform.rotationDelta) % 4 + 4) % 4;
    }
    result[id] = next;
  });
  return result;
}
function getSubtreePreviewNodes(nodeId, solution) {
  return computeSubtreeTransformedNodes(nodeId, solution);
}
function subtreeWouldOverlap(nodeId, solution, options = {}) {
  const node = G.nodes[nodeId];
  if (!node || !solution) return true;
  const ignoreNodeIds = new Set(options.ignoreNodeIds || []);
  const subtreeIds = new Set(getSubtreeNodeIds(nodeId));
  const rotatedNodes = computeSubtreeTransformedNodes(nodeId, solution);
  if (!rotatedNodes) return true;

  // Allow callers to use relaxed padding for move/rearrange (default: 0 for tight packing).
  // This matches the reduced padding used in findAllAttachmentSolutions for moves.
  const padding = options.collisionPadding ?? 0;
  for (const movingId of subtreeIds) {
    const movingNode = rotatedNodes[movingId];
    if (!movingNode) continue;
    for (const other of Object.values(G.nodes)) {
      if (!other) continue;
      if (subtreeIds.has(other.id) || ignoreNodeIds.has(other.id)) continue;
      if (nodesOverlap(movingNode, other, padding)) return true;
    }
  }
  return false;
}
function applyAttachmentSolution(node, parentNode, solution, playerId = node.owner) {
  if (!node || !parentNode || !solution) return false;
  node.x = solution.x;
  node.y = solution.y;
  node.rotationSteps = solution.rotationSteps;
  node.parentPortSide = solution.parentPortSide;
  node.parentId = parentNode.id;
  if (playerId !== undefined) node.owner = playerId;
  return true;
}
function moveSubtreeWithAttachment(nodeId, parentNode, solution, playerId) {
  const node = G.nodes[nodeId];
  if (!node || !parentNode || !solution) return false;
  const movingOwner = node.owner;
  const targetParentOwner = parentNode.owner;

  // Rearrangement can only happen within the node owner's existing network.
  // Feed Tuning allows moving rival cards, but never into a different owner's tree.
  if (movingOwner !== targetParentOwner) return false;
  if (playerId !== undefined && playerId !== movingOwner) return false;

  // Must ignore the parent — the child is supposed to be adjacent/touching
  if (subtreeWouldOverlap(nodeId, {
    ...solution,
    parentId: parentNode.id
  }, {
    ignoreNodeIds: [nodeId, parentNode.id]
  })) return false;

  // Use the same pivot-rotation transform as preview/overlap checks
  const transformedNodes = computeSubtreeTransformedNodes(nodeId, {
    ...solution,
    parentId: parentNode.id
  });
  if (!transformedNodes) return false;

  // Apply the computed positions to the real game state
  Object.entries(transformedNodes).forEach(([id, transformed]) => {
    const current = G.nodes[id];
    if (!current) return;
    current.x = transformed.x;
    current.y = transformed.y;
    current.rotationSteps = transformed.rotationSteps;
    if (id === nodeId) {
      current.parentPortSide = solution.parentPortSide;
      current.parentId = parentNode.id;
      current.owner = movingOwner;
    }
  });
  return true;
}

/**
 * Place a newly controlled card as a child of attackerNode.
 */
function placeCardUnderAttacker(card, attackerNode, playerId) {
  const solution = canAttachNodeToParent(card, attackerNode);
  if (!solution) return false;
  card.btc = 0;
  applyAttachmentSolution(card, attackerNode, solution, playerId);
  G.nodes[card.id] = {
    ...card
  };
  return true;
}

/**
 * When a node is neutralized/destroyed, detach all its descendants.
 * Orphaned nodes become uncontrolled and lose their parentId.
 */
function detachSubtree(nodeId) {
  const descendants = getDescendants(G.nodes, nodeId);
  const detached = [];
  for (const descId of descendants) {
    const n = G.nodes[descId];
    if (n) {
      n.owner = null;
      n.parentId = null;
      n.parentPortSide = null;
      n.rotationSteps = n.rotationSteps || 0;
      n.btc = 0;
      detached.push(n.name);
    }
  }
  return detached;
}

// ═══════════════════════════════════════
//  AI INTERFERENCE (Legacy — now handled via runBiddingWar control-path rules)
// ═══════════════════════════════════════
function calculateAIInterference(attackerId, target) {
  let totalInterference = 0;
  for (const pid of G.playerOrder) {
    if (pid === attackerId) continue;
    const p = G.players[pid];
    if (!p || !p.isAI) continue;

    // Pick the acting node for control-path BTC
    let actingNodeId;
    if (target.owner === pid) {
      // Defender uses the target node
      actingNodeId = target.id;
    } else {
      // Interferer picks best node
      const aiNode = pickAIActingNode(pid, 'interferer', null, target.id);
      actingNodeId = aiNode?.id;
    }
    if (!actingNodeId) continue;
    const pathBtc = getControlPathBtc(G.nodes, actingNodeId);
    if (target.owner === pid && pathBtc >= 1) {
      const spend = Math.min(2, Math.floor(pathBtc * 0.5));
      if (spend > 0) {
        spendControlPathBtc(G.nodes, actingNodeId, spend);
        totalInterference += spend;
        logEvent(`🛡️ ${p.name} spent ₿${spend} defending ${target.name} (via ${G.nodes[actingNodeId]?.name || '?'})!`, 'warning');
      }
    } else if (!target.owner && pathBtc >= 1 && Math.random() < 0.2) {
      spendControlPathBtc(G.nodes, actingNodeId, 1);
      totalInterference += 1;
      logEvent(`🛡️ ${p.name} interfered to protect ${target.name}!`, 'warning');
    }
  }
  return totalInterference;
}

// ═══════════════════════════════════════
//  END TURN
// ═══════════════════════════════════════
async function endCurrentTurn() {
  if (_endTurnInProgress) {
    console.warn('[turn] endCurrentTurn ignored: handoff already in progress.');
    return;
  }
  _endTurnInProgress = true;
  try {
    window._isAiThinking = false;
    const pid = getActivePlayerId();
    const p = G.players[pid];

    // Only the active player can end their turn (or host if active player is AI, though in multi we won't use AI yet)

    // ═══ COMPREHENSIVE END-OF-TURN CLEANUP ═══
    Object.values(G.nodes).forEach(n => {
      // Clear standard per-turn flags
      if (n.owner === pid) {
        n.abilityUsedThisTurn = false;
        n.hasActedThisRound = false;
        n._tempResDebuff = 0;
      }
      // These can affect ANY node (action cards target opponent nodes too)
      n.abilityCancelled = false;

      // Restore saved Resistance (from Scandal Machine, Regulatory Kabuki, Manufactured Consensus)
      if (n._restoreResEndOfTurn && n._savedRes !== undefined) {
        n.resistance = n._savedRes;
        delete n._savedRes;
        delete n._restoreResEndOfTurn;
      }

      // Restore saved Income (from Surge Pricing Apocalypse)
      if (n._restoreIncomeEndOfTurn && n._savedIncome !== undefined) {
        n.income = n._savedIncome;
        delete n._savedIncome;
        delete n._restoreIncomeEndOfTurn;
      }

      // Remove temporary Power buffs (from Black-Budget, Flash-Mob, Influence Surge, Creative Accounting, etc.)
      if (n._tempPowerBuff) {
        n.power = Math.max(0, (n.power || 0) - n._tempPowerBuff);
        delete n._tempPowerBuff;
      }

      // Clear swapped stats flag (Narrative Rewrite — stats already swapped, just clear flag)
      if (n._swappedStats) {
        delete n._swappedStats;
      }

      // Clear copied passive (Deepfake Identity Theft)
      if (n._copiedPassiveFrom) {
        delete n._copiedPassiveFrom;
      }
    });

    // Clear action card deferred buffs for this player
    if (G._actionBuffs && G._actionBuffs[pid]) {
      delete G._actionBuffs[pid];
    }
    checkWinConditions();
    if (G.winner) {
      let winnerSnapshot = null;
      try {
        winnerSnapshot = await syncState();
      } catch (syncErr) {
        console.error('[turn] syncState failed while publishing winner:', syncErr);
        try {
          winnerSnapshot = JSON.parse(JSON.stringify(G));
        } catch (_) {
          winnerSnapshot = null;
        }
      }
      return;
    }
    G.activePlayerIndex = (G.activePlayerIndex + 1) % G.playerOrder.length;
    if (G.activePlayerIndex === 0) {
      G.turnNumber++;
      // End of round cleanup
      G._networkBlackout = false;
      G._cannotPlayActionCardsThisRound = false;
      G._viralThreadActive = false;
      G._ceasefireActive = false;
      G._shadowVeilActive = false;
      G._hostileMoratoriumActive = false;
      G._globalPanicActive = false;
      if (G._calmStormNextRoundBuff) {
        Object.values(G.nodes).forEach(n => {
          if (n.type !== 'root') {
            n.power = (n.power || 0) + 1;
            n._tempPowerBuff = (n._tempPowerBuff || 0) + 1;
          }
        });
        G._calmStormNextRoundBuff = false;
      }
      G._noAttacksThisRound = false;
      Object.values(G.nodes).forEach(n => {
        n._cannotAttackThisRound = false;
        n._cannotDefendThisRound = false;
        n._cannotTransferThisRound = false;
        n._cannotSupportAttacksThisRound = false;
        n._untargetableThisRound = false;
        n._canAttackTwiceThisRound = false;
        n._attackCountThisRound = 0;
        if (n._restoreResEndOfRound && n._savedRes !== undefined) {
          n.resistance = n._savedRes;
          delete n._savedRes;
          delete n._restoreResEndOfRound;
        }
        if (n._restoreRes2EndOfRound && n._savedRes2 !== undefined) {
          n.resistance = n._savedRes2;
          delete n._savedRes2;
          delete n._restoreRes2EndOfRound;
        }
        if (n._restoreIncomeEndOfRound && n._savedIncome !== undefined) {
          n.income = n._savedIncome;
          delete n._savedIncome;
          delete n._restoreIncomeEndOfRound;
        }
        if (n._restorePowEndOfRound && n._savedPow !== undefined) {
          n.power = n._savedPow;
          delete n._savedPow;
          delete n._restorePowEndOfRound;
        }
        if (n._restorePow2EndOfRound && n._savedPow2 !== undefined) {
          n.power = n._savedPow2;
          delete n._savedPow2;
          delete n._restorePow2EndOfRound;
        }
        if (n._removedAlignments) {
          n.alignments = n.alignments || [];
          n._removedAlignments.forEach(a => {
            if (!n.alignments.includes(a)) n.alignments.push(a);
          });
          delete n._removedAlignments;
        }
        if (n._tempAlignments) {
          n.alignments = n.alignments || [];
          n.alignments = n.alignments.filter(a => !n._tempAlignments.includes(a));
          delete n._tempAlignments;
        }
      });
      Object.values(G.players).forEach(p => {
        p._handRevealed = false;
      });

      // Reset once-per-turn faction abilities for everyone
      G.factionAbilityUsed = {};
    }
    const nextActivePlayerId = getActivePlayerId();

    // In multiplayer we must refresh and move the ending player's own camera
    // immediately; their DB echo is suppressed by design, so no incoming-state
    // callback will run locally for this handoff.

    let syncedSnapshot = null;
    try {
      syncedSnapshot = await syncState();
    } catch (syncErr) {
      // Keep the UI/recovery topic moving even if the persistence promise reports
      // late failure; the local G has already advanced and can still serve as a
      // recovery snapshot for peers while the user retries if needed.
      console.error('[turn] syncState failed during handoff:', syncErr);
      try {
        syncedSnapshot = JSON.parse(JSON.stringify(G));
      } catch (_) {
        syncedSnapshot = null;
      }
    }
    // ─── Tutorial notification ───
    if (isTutorialMode && tutorial.isActive()) {
      tutorial.notify('turn_ended', {});
    }

    // In local mode, immediately trigger the next turn

    beginTurn(nextActivePlayerId);
  } catch (err) {
    console.error('[turn] endCurrentTurn failed:', err);
    if (typeof logEvent === 'function') logEvent('Turn handoff failed to sync. Please try End Turn again.', 'failure');
  } finally {
    _endTurnInProgress = false;
  }
}

// ═══════════════════════════════════════
//  AI LOGIC
// ═══════════════════════════════════════
async function evaluateAIActionCards(aiId, intendedTargetId = null) {
  if (G.winner || G._cannotPlayActionCardsThisRound) return;
  const ai = G.players[aiId];
  if (!ai) return;

  // ─── Tutorial: suppress AI action-card plays entirely ───
  // The tutorial is highly scripted; surprise random action cards from the AI
  // would confuse new players and break the predictable demo. We re-enable
  // them only in normal/free-play games.
  if (isTutorialMode && tutorial.isActive()) return;
  const actionCardsInHand = ai.hand.filter(c => c.type === 'action');

  // Find who is currently winning (has most BTC/networks) to target them
  const playersArr = Object.values(G.players);
  let winningPlayerId = null;
  let maxScore = -1;
  for (const p of playersArr) {
    if (p.id === aiId) continue;
    const btc = getPlayerTotalBtc(p.id);
    const netSize = Object.values(G.nodes).filter(n => n.owner === p.id).length;
    const score = btc * 2 + netSize;
    if (score > maxScore && score > 15) {
      // Only consider someone "winning" if they have a decent score
      maxScore = score;
      winningPlayerId = p.id;
    }
  }
  for (const actionCard of actionCardsInHand) {
    const cardIdx = ai.hand.indexOf(actionCard);
    if (cardIdx === -1) continue;
    let shouldPlay = false;
    let targetId = null;
    let secondTargetId = null;

    // ═══ AI SCORING: Decide if this action card is worth playing ═══
    if (actionCard.category === 'resistance') {
      // Resistance warfare: play to weaken intended capture target, OR to hurt winning player
      if (actionCard.needsTarget === true && actionCard.filter) {
        if (intendedTargetId && actionCard.filter(G.nodes[intendedTargetId])) {
          // Soften up the target we are about to attack
          targetId = intendedTargetId;
          shouldPlay = true;
        } else if (winningPlayerId) {
          // Try to hurt the winning player
          const validTargets = Object.values(G.nodes).filter(n => actionCard.filter(n) && n.owner === winningPlayerId);
          if (validTargets.length > 0) {
            validTargets.sort((a, b) => (b.resistance || 0) - (a.resistance || 0));
            targetId = validTargets[0].id;
            shouldPlay = true;
          }
        }
      } else if (actionCard.needsTarget === 'two_connected') {
        if (winningPlayerId) {
          const validTargets = Object.values(G.nodes).filter(n => actionCard.filter(n) && n.owner === winningPlayerId);
          for (const t1 of validTargets) {
            const connected = validTargets.find(t2 => t2.id !== t1.id && (t2.parentId === t1.id || t1.parentId === t2.id));
            if (connected) {
              targetId = t1.id;
              secondTargetId = connected.id;
              shouldPlay = true;
              break;
            }
          }
        }
      } else if (actionCard.needsTarget === false) {
        // AoE resistance — play if winning player is a threat, or just to soften up market
        if (winningPlayerId || intendedTargetId) shouldPlay = true;
      }
    } else if (actionCard.category === 'power') {
      // Power surge: play if AI is about to attack
      if (intendedTargetId) {
        // Pending buff snapshot — used to prevent stacking redundant "next attack power" boosts
        // on the same upcoming attack. Burning two +8s when one would already crush the target
        // wastes the second card.
        const pendingBuffs = G._actionBuffs?.[aiId] || {};
        const pendingNextAttackPower = pendingBuffs.nextAttackPower || 0;
        const alreadyHasViralFrenzy = !!pendingBuffs.viralFrenzy;
        const alreadyHasNostalgia = !!pendingBuffs.nostalgiaBomb;
        if (actionCard.needsTarget === false) {
          // Check if conditional buffs actually apply to the intended target
          const tgtNode = G.nodes[intendedTargetId];
          if (actionCard.id === 'act_nostalgia_bomb') {
            // Only worth playing if target is Legacy or Cultural AND we don't already have it queued
            if (!alreadyHasNostalgia && tgtNode && tgtNode.alignments?.some(a => ['Legacy', 'Cultural'].includes(a))) {
              shouldPlay = true;
            }
          } else if (actionCard.id === 'act_viral_frenzy') {
            // Always at least +3, much better on Media. Don't restack if already queued.
            if (!alreadyHasViralFrenzy) shouldPlay = true;
          } else if (actionCard.id === 'act_hostile_takeover') {
            // +8 Power next attack. Don't stack on top of an already-large boost.
            if (pendingNextAttackPower < 8) shouldPlay = true;
          } else if (actionCard.id === 'act_quantum_spike') {
            // Random +3/+6/+10. Don't stack on top of an already-large boost.
            if (pendingNextAttackPower < 6) shouldPlay = true;
          } else {
            shouldPlay = true; // Unconditional power buff
          }
        } else if (actionCard.needsTarget === true && actionCard.filter) {
          const ownTargets = Object.values(G.nodes).filter(n => actionCard.filter(n) && n.owner === aiId);
          if (ownTargets.length > 0) {
            targetId = ownTargets[0].id; // Buff own group
            shouldPlay = true;
          } else if (actionCard.id === 'act_weapon_virality' && actionCard.filter(G.nodes[intendedTargetId])) {
            targetId = intendedTargetId; // Target the node we are about to capture to lower its R
            shouldPlay = true;
          }
        }
      }
    } else if (actionCard.category === 'economic') {
      // Economic warfare: play selectively
      if (actionCard.needsTarget === false) {
        // AoE economic is usually good
        shouldPlay = true;
      } else if (actionCard.needsTarget === true && actionCard.filter) {
        const validTargets = Object.values(G.nodes).filter(n => actionCard.filter(n));
        if (actionCard.id === 'act_ransomware' && winningPlayerId) {
          const enemies = validTargets.filter(n => n.owner === winningPlayerId);
          if (enemies.length > 0) {
            targetId = enemies[0].id;
            shouldPlay = true;
          }
        } else if (actionCard.id === 'act_surge_pricing') {
          const own = validTargets.filter(n => n.owner === aiId);
          if (own.length > 0) {
            targetId = own[0].id;
            shouldPlay = true;
          }
        } else if (actionCard.id === 'act_pump_dump' && winningPlayerId) {
          const enemies = validTargets.filter(n => n.owner === winningPlayerId);
          if (enemies.length > 0) {
            targetId = enemies[0].id;
            shouldPlay = true;
          }
        }
      }
    } else if (actionCard.category === 'special') {
      if (actionCard.needsTarget === false) {
        // Most specials are situational. Deck rig is good.
        shouldPlay = true;
      } else if (actionCard.needsTarget === 'deck_peek') {
        shouldPlay = true;
      } else if (actionCard.needsTarget === true && actionCard.filter) {
        if (actionCard.id === 'act_manufactured_consensus' && intendedTargetId && actionCard.filter(G.nodes[intendedTargetId])) {
          targetId = intendedTargetId; // Drop R to 1 and gain power! Perfect for attacking
          shouldPlay = true;
        } else if (actionCard.id === 'act_narrative_rewrite' && intendedTargetId && actionCard.filter(G.nodes[intendedTargetId])) {
          const t = G.nodes[intendedTargetId];
          if ((t.power || 0) > (t.resistance || 0) + 2) {
            targetId = intendedTargetId; // Swap P/R to make it easier to capture
            shouldPlay = true;
          }
        } else if (winningPlayerId) {
          // Try to use specials against the winning player
          const enemies = Object.values(G.nodes).filter(n => actionCard.filter(n) && n.owner === winningPlayerId);
          if (actionCard.id === 'act_deepfake_theft' && enemies.length > 0) {
            targetId = enemies[0].id;
            shouldPlay = true;
          } else if (actionCard.id === 'act_meme_distortion' && enemies.length > 0) {
            targetId = enemies[0].id;
            shouldPlay = true;
          }
        }
      }
    }
    if (shouldPlay) {
      // Execute the card
      let msg;
      if (actionCard.needsTarget === 'deck_peek') {
        // AI looks at the event deck
        const peekCount = Math.min(5, G.eventDeck.length);
        const upcoming = G.eventDeck.slice(-peekCount);
        if (upcoming.some(e => e.id === 'ev_market_crash')) {
          ai._predictedCrash = true;
        }
        msg = `Algorithmic Deck-Rigging! ${ai.name} predicts the future.`;
      } else if (actionCard.needsTarget === 'two_connected' && targetId && secondTargetId) {
        msg = actionCard.execute(G.nodes, aiId, targetId, secondTargetId, G);
      } else if (targetId) {
        msg = actionCard.execute(G.nodes, aiId, targetId, null, G);
      } else {
        msg = actionCard.execute(G.nodes, aiId, null, null, G);
      }
      if (msg) {
        const targetInfo = buildActionTargetInfo(targetId, secondTargetId);
        // Queue dramatic reveal so chained AI plays don't overwrite each other
        showActionCardRevealOverlay(actionCard, ai.name, msg, targetInfo);

        // Broadcast for multiplayer sync

        playActionCardEffects(actionCard, targetId, secondTargetId);
        logEvent(`⚡ ${ai.name}: ${msg}`, 'warning', targetId || secondTargetId);
        // Discard the card
        ai.hand.splice(cardIdx, 1);
        G.discardPile.push(actionCard);
        syncState();
        refreshAll();
        const revealDuration = 3250 + Math.floor(Math.random() * 650);
        await new Promise(r => setTimeout(r, revealDuration));
      }
    }
  }
}
async function processAITurn(aiId) {
  if (G.winner) return;
  const ai = G.players[aiId];
  const aiFac = FACTIONS[ai.factionId];
  const totalBtc = getPlayerTotalBtc(aiId);
  let acted = false;
  const archetype = FACTION_AI_ARCHETYPES[ai.factionId] || AI_ARCHETYPES.DEFAULT;
  window._isAiThinking = true;
  refreshAll();

  // Find nodes with free slots to attach new cards
  const slotsAvail = getNodesWithFreeSlots(aiId);

  // AI will try to expand if it has free slots and (cards in hand or neutrals on table)
  const groupCardsInHand = ai.hand.filter(c => c.type !== 'action');
  let neutralsOnTable = Object.values(G.nodes).filter(n => !n.owner && n.type !== 'root');

  // ─── Tutorial AI scripting: skip certain targets ───
  if (isTutorialMode && tutorial.isActive()) {
    neutralsOnTable = neutralsOnTable.filter(n => !tutorial.shouldAISkipTarget(n.id, G.turnNumber));
  }

  // ═══ AI EVENT AWARENESS: Skip attacking entirely under no-attack events ═══
  const aiAttacksForbidden = G._noAttacksThisRound;
  const aiKnowsPanic = G._globalPanicActive;
  const aiKnowsCeasefire = G._ceasefireActive;

  // Score hand cards and neutrals — AI spatial awareness: also score proximity
  const scoredTargets = [];
  const aiRoot = G.nodes[ai.rootNodeId];
  const aiBaseX = aiRoot ? aiRoot.x : 960;
  const aiBaseY = aiRoot ? aiRoot.y : 540;

  // Filter out untargetable neutrals (e.g. Firewall Protocol protects Techno-Utopian groups)
  neutralsOnTable = neutralsOnTable.filter(n => !n._untargetableThisRound);
  let finalAttacker = null;
  let finalTargetNode = null;
  let finalBestTargetInfo = null;

  // ═══ AI EVENT AWARENESS: Hostile Moratorium prevents CONTROL attacks (still allows neutralize/destroy) ═══
  const aiControlForbidden = G._hostileMoratoriumActive;
  if (!aiAttacksForbidden && !aiControlForbidden && slotsAvail.length > 0 && (groupCardsInHand.length > 0 || neutralsOnTable.length > 0)) {
    // Score hand cards (only group cards, not action cards)
    groupCardsInHand.forEach(c => {
      const i = ai.hand.indexOf(c); // Get real index in hand
      let score = (10 - c.resistance) * archetype.capturePreference;
      const aligns = c.alignments || [];
      if (ai.factionId === 'f_algo' && (aligns.includes('Media') || aligns.includes('Techno-Utopian'))) score += 5;
      if (ai.factionId === 'f_corp') {
        if (aligns.includes('Corporate') || aligns.includes('Financial')) score += 5;
        if (c.income > 0) score += c.income * 2; // Prioritize income
      }
      if (ai.factionId === 'f_natsec') score += 3;
      if (ai.factionId === 'f_cult' && c.resistance <= 1) score += 8;
      if (ai.factionId === 'f_crypto' && c.income >= 3) score += 5;

      // Archetype specific bonuses
      if (archetype === AI_ARCHETYPES.CRYPTO_CULT && c.income >= 4) score += 10;
      if (archetype === AI_ARCHETYPES.NATIONAL_SECURITY && c.resistance >= 4) score += 8;
      scoredTargets.push({
        card: c,
        source: 'hand',
        index: i,
        score
      });
    });
    const tutorialPreferredTargets = isTutorialMode && tutorial.isActive() ? tutorial.getAIPreferredTargets(G.turnNumber) : [];

    // Score neutrals on table — factor in proximity (closer to AI root = easier to manage)
    neutralsOnTable.forEach(c => {
      let score = (10 - c.resistance) * archetype.capturePreference;
      const aligns = c.alignments || [];
      if (ai.factionId === 'f_algo' && (aligns.includes('Media') || aligns.includes('Techno-Utopian'))) score += 5;
      if (ai.factionId === 'f_corp') {
        if (aligns.includes('Corporate') || aligns.includes('Financial')) score += 5;
        if (c.income > 0) score += c.income * 2; // Prioritize income
      }
      if (ai.factionId === 'f_natsec') score += 3;
      if (ai.factionId === 'f_cult' && c.resistance <= 1) score += 8;
      if (ai.factionId === 'f_crypto' && c.income >= 3) score += 5;

      // Archetype specific bonuses
      if (archetype === AI_ARCHETYPES.CRYPTO_CULT && c.income >= 4) score += 10;
      if (archetype === AI_ARCHETYPES.NATIONAL_SECURITY && c.resistance >= 4) score += 8;

      // Proximity bonus: prefer neutrals closer to AI territory
      const dist = Math.sqrt(Math.pow(c.x - aiBaseX, 2) + Math.pow(c.y - aiBaseY, 2));
      if (dist < 800) score += 5; // Near territory
      else if (dist > 2500) score -= 5; // Very far

      const prefIdx = tutorialPreferredTargets.indexOf(c.id);
      if (prefIdx !== -1) score += 1000 - prefIdx; // first entry beats second
      scoredTargets.push({
        card: c,
        source: 'table',
        score
      });
    });
    scoredTargets.sort((a, b) => b.score - a.score);

    // Find the first target that actually has a valid attacker
    for (const targetInfo of scoredTargets) {
      let tempTargetNode = targetInfo.card;
      const possibleAttackers = slotsAvail.filter(n => !n._cannotAttackThisRound).map(n => {
        const strength = getAttackStrength(G.nodes, n.id, G._networkBlackout);
        const penalty = getAlignmentPenalty(n.alignments || [], tempTargetNode.alignments || []);
        const attachment = canAttachNodeToParent(tempTargetNode, n, {
          ignoreNodeIds: [tempTargetNode.id]
        });
        if (!attachment) return null;
        const dist = Math.sqrt(Math.pow(n.x - tempTargetNode.x, 2) + Math.pow(n.y - tempTargetNode.y, 2));
        const proximityBonus = dist < 500 ? 2 : dist > 1500 ? -2 : 0;
        return {
          node: n,
          strength,
          penalty,
          proximityBonus,
          total: strength + penalty + proximityBonus,
          attachment
        };
      }).filter(Boolean).sort((a, b) => b.total - a.total);
      if (possibleAttackers.length > 0) {
        finalBestTargetInfo = targetInfo;
        finalAttacker = possibleAttackers[0];
        finalTargetNode = tempTargetNode;
        break;
      }
    }
  }

  // ═══ AI ACTION CARD USAGE (Free Actions — played before main action) ═══
  await evaluateAIActionCards(aiId, finalTargetNode?.id);

  // ═══ AI STRATEGIC BTC HOARDING: Move BTC off Financial nodes if a crash is coming ═══
  if (ai._predictedCrash || archetype.hoardPreference > 1.2) {
    const financialNodes = Object.values(G.nodes).filter(n => n.owner === aiId && n.id !== ai.rootNodeId && (n.btc || 0) > 0);
    if (financialNodes.length > 0) {
      const safeNode = Object.values(G.nodes).find(n => n.owner === aiId && !n.alignments?.includes('Financial')) || aiRoot;
      if (safeNode) {
        financialNodes.forEach(f => {
          const amount = f.btc || 0;
          if (transferBtc(aiId, f.id, safeNode.id, amount)) {
            logEvent(`📉 ${ai.name} hoarded ₿${amount} from ${f.name} to ${safeNode.name}!`, 'warning', safeNode.id);
          }
        });
      }
    }
  }
  if (!aiAttacksForbidden && !aiControlForbidden && slotsAvail.length > 0 && (groupCardsInHand.length > 0 || neutralsOnTable.length > 0)) {
    if (!finalBestTargetInfo || !finalAttacker) {
      logEvent(`${ai.name} consolidated resources.`, 'success');
    } else {
      let targetCard = finalBestTargetInfo.card;

      // If it's from hand, play to table first (free action)
      if (finalBestTargetInfo.source === 'hand') {
        ai.hand.splice(finalBestTargetInfo.index, 1);
        targetCard.owner = null;
        targetCard.parentId = null;
        targetCard.btc = 0;
        const spot = getNeutralZoneSpot();
        targetCard.x = spot.x;
        targetCard.y = spot.y;
        targetCard.rotationSteps = targetCard.rotationSteps || 0;
        targetCard.parentPortSide = null;
        G.nodes[targetCard.id] = {
          ...targetCard
        };
        logEvent(`🃏 ${ai.name} played ${targetCard.name} to the table.`, 'warning', targetCard.id);
        syncState();
        refreshAll();
        await new Promise(r => setTimeout(r, 1200));
        finalTargetNode = G.nodes[targetCard.id];
        const attachment = canAttachNodeToParent(finalTargetNode, finalAttacker.node, {
          ignoreNodeIds: [finalTargetNode.id]
        });
        if (attachment) {
          finalAttacker.attachment = attachment;
        } else {
          logEvent(`${ai.name} failed to attach ${finalTargetNode.name} after playing it.`, 'failure', finalTargetNode.id);
          refreshAll();
          setTimeout(() => {
            if (!G.winner) endCurrentTurn();
          }, 1200);
          return;
        }
      }

      // Calculate attack parameters
      const strength = finalAttacker.strength;
      const penalty = finalAttacker.penalty;
      const aiAtkMod = getAttackAbilityModifier(G.nodes, finalAttacker.node, finalTargetNode, G._networkBlackout);
      let aiDefMod = getDefenseAbilityModifier(G.nodes, finalTargetNode, G._networkBlackout);
      const aiNReroll = hasEsportsReroll(G.nodes, aiId);
      const aiNDieMod = getAstrologyModifier(G.nodes, aiId);
      const hasDarkWeb = hasPassiveAlias(G.nodes, finalAttacker.node, 'n_darkweb') && !isAbilityCancelled(G.nodes, finalAttacker.node);
      if (hasDarkWeb && aiDefMod > 0) aiDefMod = 0;
      let aiTargetRes = getEffectiveResistance(G.nodes, finalTargetNode.id, G._networkBlackout) - aiDefMod;
      const aiAlgoBonus = !G.factionAbilityUsed[aiId] ? getAlgoManipulationBonus(ai.factionId, finalTargetNode.alignments || []) : 0;
      if (aiAlgoBonus > 0) {
        G.factionAbilityUsed[aiId] = true;
        aiTargetRes -= aiAlgoBonus;
        logEvent(`🔮 ${ai.name}: Predictive Manipulation — target R-${aiAlgoBonus}!`, 'warning', finalTargetNode.id);
      }
      let nBaseStr = strength + aiAtkMod;
      if (aiKnowsPanic) nBaseStr += 2;
      let usedViralThread = false;
      if (G._viralThreadActive && finalAttacker.node.alignments?.includes('Media')) {
        nBaseStr += 5;
        G._viralThreadActive = false;
        usedViralThread = true;
        logEvent(`🧵 ${ai.name}: Viral Thread — ${finalAttacker.node.name} surges with +5 Power!`, 'warning', finalAttacker.node.id);
      }
      const aiBuffs = G._actionBuffs?.[aiId];
      if (aiBuffs) {
        if (aiBuffs.nextAttackPower) nBaseStr += aiBuffs.nextAttackPower;
        if (aiBuffs.viralFrenzy) nBaseStr += finalTargetNode.alignments?.includes('Media') ? 7 : 3;
        if (aiBuffs.nostalgiaBomb && finalTargetNode.alignments?.some(a => ['Legacy', 'Cultural'].includes(a))) nBaseStr += 5;
        // Don't delete G._actionBuffs[aiId] here, so the live stat recalculation can access it
      }
      if (isTutorialMode && tutorial.isActive()) {
        setTimeout(() => tutorial.onBiddingStart(), 500);
      }
      const bidResult = await runBiddingWar({
        attackerId: aiId,
        attackerNodeId: finalAttacker.node.id,
        targetNode: finalTargetNode,
        baseAttackPower: nBaseStr,
        targetResistance: aiTargetRes,
        alignMod: penalty,
        atkAbility: aiAtkMod,
        defAbility: aiDefMod,
        loyaltyBonus: 0,
        isEndgame: G.isEndgame,
        dieMod: aiNDieMod,
        hasReroll: aiNReroll,
        distanceBonus: 0,
        attackType: ATTACK_TYPES.CONTROL,
        resistancePenalty: aiAlgoBonus,
        ignoreDefenseAbility: hasDarkWeb
      });
      window.updateBiddingWarPreview = null;
      if (isTutorialMode && tutorial.isActive()) {
        tutorial.notify('bidding_done', {});
      }
      if (bidResult) {
        const liveAtkNode = G.nodes[finalAttacker.node.id];
        const liveTgtNode = G.nodes[finalTargetNode.id];
        if (!liveAtkNode || !liveTgtNode) {
          logEvent('Nodes removed during bidding war.', 'failure');
          refreshAll();
          return;
        }
        let liveAbilityDef = getDefenseAbilityModifier(G.nodes, liveTgtNode, G._networkBlackout);
        if (hasDarkWeb) liveAbilityDef = 0;
        let liveTargetRes = getEffectiveResistance(G.nodes, liveTgtNode.id, G._networkBlackout) - aiAlgoBonus - liveAbilityDef;
        let liveAbilityAtk = getAttackAbilityModifier(G.nodes, liveAtkNode, liveTgtNode, G._networkBlackout);
        let liveBaseAttack = getAttackStrength(G.nodes, liveAtkNode.id, G._networkBlackout) + liveAbilityAtk;
        let liveActionBuffApplied = 0;
        const liveAiBuffs = G._actionBuffs?.[aiId];
        if (liveAiBuffs) {
          if (liveAiBuffs.nextAttackPower) liveActionBuffApplied += liveAiBuffs.nextAttackPower;
          if (liveAiBuffs.viralFrenzy) liveActionBuffApplied += liveTgtNode.alignments?.includes('Media') ? 7 : 3;
          if (liveAiBuffs.nostalgiaBomb && liveTgtNode.alignments?.some(a => ['Legacy', 'Cultural'].includes(a))) liveActionBuffApplied += 5;
          liveBaseAttack += liveActionBuffApplied;
          delete G._actionBuffs[aiId];
        }
        if (G._globalPanicActive) liveBaseAttack += 2;
        if (usedViralThread) liveBaseAttack += 5;
        const nFinalStr = computeAttackStrength({
          attackerPower: liveBaseAttack,
          btcSpent: bidResult.attackerBtcSpent,
          targetResistance: liveTargetRes,
          defenderBtcSpent: bidResult.defenderBtcSpent,
          defenseAbilityMod: 0,
          alignmentModifier: penalty,
          isEndgame: G.isEndgame,
          distanceBonus: 0
        });
        const defMemeOlym = finalTargetNode.owner ? hasMemeOlympicsReroll(G.nodes, finalTargetNode.owner) : false;
        let result = calculateAttack(nFinalStr, ATTACK_TYPES.CONTROL, {
          canReroll: aiNReroll,
          dieModifier: aiNDieMod,
          defenderHasMemeOlympics: defMemeOlym
        });

        // Trigger Glitch VFX
        if (gameGraphScene && (result.rerolled || result.forcedReroll)) {
          gameGraphScene.playGlitchEffect(finalTargetNode.id);
        }
        if (isTutorialMode && tutorial.isActive()) {
          const forced = tutorial.shouldForceAttackResult(aiId, finalTargetNode.id, G.turnNumber, HUMAN_ID);
          if (forced === true && !result.success) {
            result = {
              ...result,
              success: true,
              roll: 2,
              finalStrength: Math.max(nFinalStr, 12)
            };
          } else if (forced === false && result.success) {
            result = {
              ...result,
              success: false,
              roll: 12,
              finalStrength: Math.max(nFinalStr, 1)
            };
          }
        }
        if (result.success) {
          const attachSolution = canAttachNodeToParent(finalTargetNode, finalAttacker.node, {
            ignoreNodeIds: [finalTargetNode.id]
          }) || finalAttacker.attachment;
          if (!attachSolution) {
            logEvent(`❌ ${ai.name} controlled ${finalTargetNode.name} but no legal port attachment existed.`, 'success', finalTargetNode.id);
            refreshAll();
          } else {
            finalTargetNode.btc = 0;
            applyAttachmentSolution(finalTargetNode, finalAttacker.node, attachSolution, aiId);
            if (gameGraphScene) {
              gameGraphScene.centerCameraOn(finalTargetNode.x, finalTargetNode.y);
            }
            logEvent(`✅ ${ai.name} seized control of ${finalTargetNode.name}!`, 'failure', finalTargetNode.id);
            SFX.playEnemyAction();
            applyPostAttackSuccessEffects(aiId, result.rolledDoubles, finalTargetNode.id);
          }
        } else {
          logEvent(`❌ ${ai.name} failed to control ${finalTargetNode.name}.`, 'success', finalTargetNode.id);
          applyPostAttackFailureEffects(aiId);
        }
        acted = true;
        refreshAll();
        syncState();
      }
    }
  }

  // Try to neutralize an enemy node
  const aiRootPathBtc = aiRoot ? getControlPathBtc(G.nodes, aiRoot.id) : 0;
  const tutorialForceAttack = isTutorialMode && tutorial.isActive() && tutorial.shouldAIAttackPlayer(G.turnNumber);
  const aiCanAttackPlayers = !aiAttacksForbidden && !aiKnowsCeasefire;
  const aiRootCanAttack = aiRoot && !aiRoot._cannotAttackThisRound;

  // Archetype neutralization preference
  const neutBtcThreshold = archetype === AI_ARCHETYPES.NATIONAL_SECURITY ? 1 : 4;

  // Multi-action turn: AI gets 2 actions per turn. CONTROL above counts as
  // action #1; this NEUTRALIZE block is action #2 and may run even if CONTROL
  // already happened. We still skip it if the AI already attacked twice this
  // turn (acted twice) or if the tutorial isn't forcing it.
  const aiActionsTaken = acted ? 1 : 0; // CONTROL block sets `acted = true` after one attack
  const aiActionsCapReached = aiActionsTaken >= (G.actionsPerTurn || 2);
  if (tutorialForceAttack || !aiActionsCapReached && aiRootPathBtc >= neutBtcThreshold && aiCanAttackPlayers && aiRootCanAttack) {
    let targets = Object.values(G.nodes).filter(n => n.owner && n.owner !== aiId && n.type !== 'root');
    targets = targets.filter(n => !n._untargetableThisRound);
    if (isTutorialMode && tutorial.isActive()) {
      targets = targets.filter(n => n.owner === HUMAN_ID);
    }
    if (targets.length > 0) {
      let highestProgress = 0;
      let winningPlayerId = null;
      G.playerOrder.forEach(pid => {
        if (pid === aiId) return;
        const prog = getWinProgress(pid).progressPct;
        if (prog > highestProgress) {
          highestProgress = prog;
          winningPlayerId = pid;
        }
      });
      if (highestProgress >= 50 && winningPlayerId) {
        const priorityTargets = targets.filter(n => n.owner === winningPlayerId);
        if (priorityTargets.length > 0) targets = priorityTargets;
      }
      targets.sort((a, b) => a.resistance - b.resistance);
      const target = targets[0];
      const strength = getAttackStrength(G.nodes, aiRoot.id, G._networkBlackout);
      const penalty = getAlignmentPenalty(aiRoot.alignments || [], target.alignments || []);
      const aiAtkMod = getAttackAbilityModifier(G.nodes, aiRoot, target, G._networkBlackout);
      let aiDefMod = getDefenseAbilityModifier(G.nodes, target, G._networkBlackout);
      const aiNReroll = hasEsportsReroll(G.nodes, aiId);
      const aiNDieMod = getAstrologyModifier(G.nodes, aiId);
      let aiDistBonus = target.owner ? (getDistanceToFaction(G.nodes, target.id) - getDistanceToFaction(G.nodes, aiRoot.id)) * 5 : 0;
      const hasDarkWeb = hasPassiveAlias(G.nodes, aiRoot, 'n_darkweb') && !isAbilityCancelled(G.nodes, aiRoot);
      if (hasDarkWeb) {
        if (aiDefMod > 0) aiDefMod = 0;
        if (aiDistBonus > 0) aiDistBonus = 0;
      }
      const aiAlgoBonus = !G.factionAbilityUsed[aiId] ? getAlgoManipulationBonus(ai.factionId, target.alignments || []) : 0;
      if (aiAlgoBonus > 0) {
        G.factionAbilityUsed[aiId] = true;
        logEvent(`🔮 ${ai.name}: Predictive Manipulation — target R-${aiAlgoBonus}!`, 'warning', target.id);
      }

      // ═══ AI ACTION CARD USAGE: re-evaluate now that we have a NEUTRALIZE target ═══
      // The earlier evaluation (before the CONTROL phase) only considered the control target.
      // Buffs like Hostile Takeover Blitz, Nostalgia Bomb, Viral Frenzy must also reach
      // neutralize attacks, so give the AI a chance to play them against this target.
      // Called BEFORE resistance is calculated so resistance-reducing cards (Weaponised Virality)
      // also take effect for the initial preview number.
      await evaluateAIActionCards(aiId, target.id);
      const aiTargetRes = getEffectiveResistance(G.nodes, target.id, G._networkBlackout) - aiAlgoBonus - aiDefMod;
      let nBaseStr = strength + aiAtkMod;
      if (aiKnowsPanic) nBaseStr += 2;
      let usedViralThread = false;
      if (G._viralThreadActive && aiRoot.alignments?.includes('Media')) {
        nBaseStr += 5;
        G._viralThreadActive = false;
        usedViralThread = true;
        logEvent(`🧵 ${ai.name}: Viral Thread — ${aiRoot.name} surges with +5 Power!`, 'warning', aiRoot.id);
      }
      const initialAiBuffs = G._actionBuffs?.[aiId];
      if (initialAiBuffs) {
        if (initialAiBuffs.nextAttackPower) nBaseStr += initialAiBuffs.nextAttackPower;
        if (initialAiBuffs.viralFrenzy) nBaseStr += target.alignments?.includes('Media') ? 7 : 3;
        if (initialAiBuffs.nostalgiaBomb && target.alignments?.some(a => ['Legacy', 'Cultural'].includes(a))) nBaseStr += 5;
        // Don't delete G._actionBuffs[aiId] here, so the live stat recalculation can access it
      }
      if (isTutorialMode && tutorial.isActive()) {
        setTimeout(() => tutorial.onBiddingStart(), 500);
      }
      const bidResult = await runBiddingWar({
        attackerId: aiId,
        attackerNodeId: aiRoot.id,
        targetNode: target,
        baseAttackPower: nBaseStr,
        targetResistance: aiTargetRes,
        alignMod: penalty,
        atkAbility: aiAtkMod,
        defAbility: aiDefMod,
        loyaltyBonus: 0,
        isEndgame: G.isEndgame,
        dieMod: aiNDieMod,
        hasReroll: aiNReroll,
        distanceBonus: aiDistBonus,
        attackType: ATTACK_TYPES.NEUTRALIZE,
        resistancePenalty: aiAlgoBonus,
        ignoreDefenseAbility: hasDarkWeb
      });
      window.updateBiddingWarPreview = null;
      if (bidResult) {
        const liveAtkNode = G.nodes[aiRoot.id];
        const liveTgtNode = G.nodes[target.id];
        if (!liveAtkNode || !liveTgtNode) {
          logEvent('Nodes removed during bidding war.', 'failure');
          refreshAll();
          return;
        }
        let liveAbilityDef = getDefenseAbilityModifier(G.nodes, liveTgtNode, G._networkBlackout);
        let liveDistBonus = liveTgtNode.owner ? (getDistanceToFaction(G.nodes, liveTgtNode.id) - getDistanceToFaction(G.nodes, liveAtkNode.id)) * 5 : 0;
        if (hasDarkWeb) {
          liveAbilityDef = 0;
          liveDistBonus = 0;
        }
        let liveTargetRes = getEffectiveResistance(G.nodes, liveTgtNode.id, G._networkBlackout) - aiAlgoBonus - liveAbilityDef;
        liveTargetRes = Math.ceil(liveTargetRes / 2); // Neutralize halves resistance

        let liveAbilityAtk = getAttackAbilityModifier(G.nodes, liveAtkNode, liveTgtNode, G._networkBlackout);
        let liveBaseAttack = getAttackStrength(G.nodes, liveAtkNode.id, G._networkBlackout) + liveAbilityAtk;
        let liveActionBuffApplied = 0;
        const liveAiBuffs = G._actionBuffs?.[aiId];
        if (liveAiBuffs) {
          if (liveAiBuffs.nextAttackPower) liveActionBuffApplied += liveAiBuffs.nextAttackPower;
          if (liveAiBuffs.viralFrenzy) liveActionBuffApplied += liveTgtNode.alignments?.includes('Media') ? 7 : 3;
          if (liveAiBuffs.nostalgiaBomb && liveTgtNode.alignments?.some(a => ['Legacy', 'Cultural'].includes(a))) liveActionBuffApplied += 5;
          liveBaseAttack += liveActionBuffApplied;
          delete G._actionBuffs[aiId];
        }
        if (G._globalPanicActive) liveBaseAttack += 2;
        if (usedViralThread) liveBaseAttack += 5;
        const nFinalStr = computeAttackStrength({
          attackerPower: liveBaseAttack,
          btcSpent: bidResult.attackerBtcSpent,
          targetResistance: liveTargetRes,
          defenderBtcSpent: bidResult.defenderBtcSpent,
          defenseAbilityMod: 0,
          alignmentModifier: penalty,
          isEndgame: G.isEndgame,
          distanceBonus: liveDistBonus
        });
        if (nFinalStr >= 2 || tutorialForceAttack) {
          const defMemeOlym = target.owner ? hasMemeOlympicsReroll(G.nodes, target.owner) : false;
          let result = calculateAttack(Math.max(nFinalStr, 2), ATTACK_TYPES.NEUTRALIZE, {
            canReroll: aiNReroll,
            dieModifier: aiNDieMod,
            defenderHasMemeOlympics: defMemeOlym
          });
          if (gameGraphScene && (result.rerolled || result.forcedReroll)) {
            gameGraphScene.playGlitchEffect(target.id);
          }
          if (isTutorialMode && tutorial.isActive()) {
            const forced = tutorial.shouldForceAttackResult(aiId, target.id, G.turnNumber, HUMAN_ID);
            if (forced === true && !result.success) {
              result = {
                ...result,
                success: true,
                roll: 2,
                finalStrength: Math.max(nFinalStr, 12)
              };
            } else if (forced === false && result.success) {
              result = {
                ...result,
                success: false,
                roll: 12,
                finalStrength: Math.max(nFinalStr, 1)
              };
            }
          }
          let aiDeniabilityCancelled = false;
          if (result.success && target.owner) {
            const defP = G.players[target.owner];
            if (defP && hasPlausibleDeniability(defP.factionId) && !G.factionAbilityUsed[target.owner]) {
              G.factionAbilityUsed[target.owner] = true;
              aiDeniabilityCancelled = true;
              logEvent(`🕶️ PLAUSIBLE DENIABILITY: ${ai.name}'s attack on ${target.name} erased!`, 'success', target.id);
              if (isTutorialMode && tutorial.isActive()) {
                tutorial.recordNSAAbilityFired();
              }
            }
          }
          if (result.success && !aiDeniabilityCancelled) {
            const detached = detachSubtree(target.id);
            target.owner = null;
            target.parentId = null;
            target.btc = 0;
            logEvent(`💥 ${ai.name} neutralized your ${target.name}!${detached.length > 0 ? ' ' + detached.length + ' orphaned!' : ''}`, 'failure', target.id);
            SFX.playEnemyAction();
            applyPostAttackSuccessEffects(aiId, result.rolledDoubles, target.id);
          } else if (aiDeniabilityCancelled) {
            logEvent(`🕶️ ${target.name} protected by Plausible Deniability Protocol.`, 'success', target.id);
          } else {
            logEvent(`🛡️ ${ai.name} tried to neutralize ${target.name} — FAILED.`, 'success', target.id);
            applyPostAttackFailureEffects(aiId);
          }
          acted = true;
          refreshAll();
          syncState();
        }
      }
    }
  }

  // ═══ AI FACTION ABILITY USAGE ═══
  // Note: AI faction abilities are split between active abilities (once per turn) and passive effects.

  const aiFid = ai.factionId;

  // --- Passives ---
  if (aiFid === 'f_corp' && acted) {
    const lastDeployed = Object.values(G.nodes).find(n => n.owner === aiId && n.type !== 'root' && !n._viChecked);
    if (lastDeployed && shouldTriggerVerticalIntegration(aiFid, lastDeployed.alignments || [])) {
      lastDeployed.btc = (lastDeployed.btc || 0) + 3;
      logEvent(`📊 ${ai.name}: Acquisition Surge — +₿3 added to ${lastDeployed.name}.`, 'warning', lastDeployed.id);
      lastDeployed._viChecked = true;
    } else if (lastDeployed) {
      lastDeployed._viChecked = true;
    }
  }
  if (aiFid === 'f_algo' && Math.random() > archetype.disruptPreference) {
    // Feed Tuning (Passive): Maliciously rearrange an opponent's network
    const opponents = G.playerOrder.filter(pid => pid !== aiId);
    if (opponents.length > 0) {
      const targetPid = opponents[Math.floor(Math.random() * opponents.length)];
      const theirNodes = Object.values(G.nodes).filter(n => n.owner === targetPid && n.type !== 'root');
      const attachedToRoot = theirNodes.filter(n => n.parentId === G.players[targetPid].rootNodeId);
      if (attachedToRoot.length > 0) {
        attachedToRoot.sort((a, b) => (b.income || 0) - (a.income || 0) || getChildCount(G.nodes, b.id) - getChildCount(G.nodes, a.id));
        const nodeToMove = attachedToRoot[0];
        const candidateParents = theirNodes.filter(parent => parent.id !== nodeToMove.id && parent.id !== nodeToMove.parentId && !isDescendantOf(nodeToMove.id, parent.id) && getFreeArrows(G.nodes, parent.id) > 0 && parent.owner === targetPid);
        if (candidateParents.length > 0) {
          candidateParents.sort((a, b) => getDistanceToFaction(G.nodes, b.id) - getDistanceToFaction(G.nodes, a.id));
          const worstParent = candidateParents[0];
          const solutions = getAttachmentSolutionsForParent(nodeToMove, worstParent, {
            ignoreNodeIds: [nodeToMove.id],
            excludeCurrentPortSide: false,
            collisionPadding: 0
          });
          if (solutions.length > 0) {
            moveSubtreeWithAttachment(nodeToMove.id, worstParent, solutions[0], targetPid);
            logEvent(`💻 ${ai.name}: Feed Tuning — maliciously rearranged ${G.players[targetPid].name}'s network!`, 'warning', nodeToMove.id);
          }
        }
      }
    }
  }

  // --- Actives ---
  if (!G.factionAbilityUsed[aiId]) {
    if (aiFid === 'f_underground' && Math.random() < archetype.disruptPreference) {
      const enemies = Object.values(G.nodes).filter(n => n.owner && n.owner !== aiId && n.type !== 'root' && (n.resistance || 0) > 0);
      if (enemies.length > 0) {
        enemies.sort((a, b) => a.resistance - b.resistance);
        const target = enemies[0];
        target.resistance -= 1;
        let msg = `🕴️ ${ai.name}: Permanent Network reduced ${target.name}'s Resistance to ${target.resistance}.`;
        if (target.resistance <= 0) {
          const detached = detachSubtree(target.id);
          if (!G.players[aiId].destroyedNodes) G.players[aiId].destroyedNodes = 0;
          G.players[aiId].destroyedNodes++;
          if (DECK.find(c => c.id === target.id)) {
            const baseCard = DECK.find(c => c.id === target.id);
            G.discardPile.push(baseCard);
          }
          delete G.nodes[target.id];
          msg = `🕴️ ${ai.name}: Permanent Network destroyed ${target.name}!`;
        }
        logEvent(msg, 'warning', target.id);
        G.factionAbilityUsed[aiId] = true;
      }
    }
    if (aiFid === 'f_cult') {
      const outrageTargets = Object.values(G.nodes).filter(n => n.type !== 'root' && n.owner !== aiId);
      if (outrageTargets.length > 0) {
        outrageTargets.sort((a, b) => a.resistance - b.resistance);
        const target = outrageTargets[0];
        const result = applyNarrativeAgitation(G.nodes, target.id, aiId);
        G.factionAbilityUsed[aiId] = true;
        if (result) {
          if (result.type === 'resistance') {
            logEvent(`📢 ${ai.name}: Narrative Agitation on ${result.targetIcon} ${result.targetName} — R reduced to ${result.newRes}!`, 'warning', target.id);
          } else {
            logEvent(`📢 ${ai.name}: Narrative Agitation on ${result.targetIcon} ${result.targetName} — gained +1 Power!`, 'warning', target.id);
          }
        }
      }
    }
    if (aiFid === 'f_algo' && Math.random() < archetype.disruptPreference) {
      const targets = Object.values(G.nodes).filter(n => n.owner && n.owner !== aiId && n.type !== 'root' && n.alignments && (n.alignments.includes('Media') || n.alignments.includes('Techno-Utopian')) && (n.resistance || 0) > 0);
      if (targets.length > 0) {
        targets.sort((a, b) => a.resistance - b.resistance);
        const target = targets[0];
        target.resistance = Math.max(0, target.resistance - 2);
        G.factionAbilityUsed[aiId] = true;
        logEvent(`🔮 ${ai.name}: Predictive Manipulation reduced ${target.icon || '🌐'} ${target.name}'s Resistance by 2!`, 'warning', target.id);
      }
    }
    if (aiFid === 'f_crypto') {
      const aiOwnedNodes = Object.values(G.nodes).filter(n => n.owner === aiId && n.id !== ai.rootNodeId && (n.btc || 0) > 0);

      // Decentralised Liquidity (Passive)
      if (aiOwnedNodes.length > 0 && Math.random() < archetype.hoardPreference) {
        aiOwnedNodes.sort((a, b) => (b.btc || 0) - (a.btc || 0));
        const source = aiOwnedNodes[0];
        const amount = applyFluidTokenomics(G.nodes, source.id, ai.rootNodeId, aiId);
        // Fluid tokenomics is passive, it does NOT consume the active faction ability use.
        if (amount > 0) {
          logEvent(`⛓️ ${ai.name}: Fluid Tokenomics — ₿${amount} teleported to faction vault.`, 'warning', ai.rootNodeId);
        }
      }

      // Volatility Spike (Active)
      if (!G.factionAbilityUsed[aiId] && Math.random() < 0.5) {
        // 50% chance to use the active
        const myRoot = G.nodes[ai.rootNodeId];
        if (myRoot) {
          myRoot.btc = (myRoot.btc || 0) + 5;
          ai.volatilityDebt = (ai.volatilityDebt || 0) + 7;
          G.factionAbilityUsed[aiId] = true;
          logEvent(`⛓️ ${ai.name}: Volatility Spike! Gained ₿5.`, 'warning', ai.rootNodeId);
        }
      }
    }
  }

  // ═══ AI ACTIVE GROUP ABILITIES USAGE ═══
  Object.values(G.nodes).forEach(n => {
    if (n.owner === aiId && !n.abilityUsedThisTurn && !isAbilityCancelled(G.nodes, n) && ACTIVE_GROUP_ABILITIES[n.id]) {
      const ability = ACTIVE_GROUP_ABILITIES[n.id];
      if (!ability.needsTarget) {
        const result = ability.execute(G.nodes, aiId, null, n.id, G);
        if (result) {
          n.abilityUsedThisTurn = true;
          acted = true;
          logEvent(`⚙️ ${ai.name}'s ${n.name}: ${result}`, 'warning', n.id);
        }
      } else {
        const possibleTargets = Object.values(G.nodes).filter(t => ability.filter(t, n));
        if (possibleTargets.length > 0) {
          let target = null;
          if (n.id === 'x_emotionlab') {
            target = possibleTargets.find(t => (t.resistance || 0) > (t.power || 0)) || possibleTargets[0];
          } else {
            const enemyTargets = possibleTargets.filter(t => t.owner !== aiId);
            if (enemyTargets.length > 0) {
              enemyTargets.sort((a, b) => (b.power || 0) - (a.power || 0) || (b.resistance || 0) - (a.resistance || 0));
              target = enemyTargets[0];
            }
          }
          if (target) {
            const result = ability.execute(G.nodes, aiId, target.id, n.id, G);
            if (result) {
              n.abilityUsedThisTurn = true;
              acted = true;
              logEvent(`⚙️ ${ai.name}'s ${n.name}: ${result}`, 'warning', target.id);
            }
          }
        }
      }
    }
  });
  if (!acted) logEvent(`${ai.name} consolidated resources.`, 'success');
  refreshAll();

  // Only queue end turn if we aren't already waiting to process the AI turn again
  // (A second loop can happen if the AI takes an action but hasn't run out of things to do yet)
  if (!window.activeProcessAITurnTimeout) {
    setTimeout(() => {
      if (!G.winner) endCurrentTurn();
    }, 2000);
  }
}

// ═══════════════════════════════════════
//  WIN CONDITIONS
// ═══════════════════════════════════════
function showTutorialVictory() {
  tutorial.destroy();
  G.winner = HUMAN_ID;
  const victoryModal = document.getElementById('victory-modal');
  const winnerName = document.getElementById('winner-name');
  const winnerDesc = document.getElementById('winner-desc');
  const winnerTitle = victoryModal.querySelector('h1');
  const victoryButtons = document.getElementById('victory-buttons');
  const victoryStats = document.getElementById('victory-stats');

  // Set theme to green
  const modalContent = document.querySelector('#victory-modal .title-content > div:nth-child(2)');
  const eyebrow = document.querySelector('#victory-modal .title-eyebrow');
  const title = document.getElementById('victory-title-h1');
  const bgLayer = document.querySelector('#victory-modal .title-bg-layer');
  if (modalContent) {
    modalContent.style.borderColor = 'var(--accent-green)';
    modalContent.style.boxShadow = '0 0 30px rgba(34, 197, 94, 0.2)';
  }
  if (eyebrow) eyebrow.style.color = 'var(--accent-green)';
  if (title) {
    title.style.color = 'var(--accent-green)';
    title.style.textShadow = '0 0 15px var(--accent-green)';
    title.innerHTML = '🎓 TRAINING COMPLETE';
  }
  if (bgLayer) bgLayer.style.filter = 'grayscale(80%) sepia(20%) hue-rotate(90deg) brightness(0.6)';
  if (winnerName) winnerName.textContent = 'CHAIRMAN — NATIONAL SECURITY APPARATUS';
  if (winnerDesc) winnerDesc.innerHTML = `
        Congratulations, Operative! You've mastered the fundamentals of OMNIS Global Initiative.<br><br>
        <strong>Skills Learned:</strong><br>
        ✅ Power structure & network building<br>
        ✅ Income collection & ₿TC management<br>
        ✅ Attacking to Control, Neutralize, and Destroy<br>
        ✅ Interference & bidding wars<br>
        ✅ Reorganization & spatial planning<br>
        ✅ Victory conditions & table politics<br><br>
        <em>You're ready for the real thing.</em>
    `;
  if (victoryStats) victoryStats.style.display = 'none';

  // Replace buttons with tutorial-specific options
  if (victoryButtons) {
    victoryButtons.innerHTML = `
            <button class="title-btn title-btn--primary" id="btn-start-real-game" style="width: 100%;">
                <div class="title-btn-icon">⚔️</div>
                <div class="title-btn-body">
                    <div class="title-btn-label">START REAL GAME</div>
                    <div class="title-btn-desc">Play a full simulation against AI opponents.</div>
                </div>
            </button>
            <button class="title-btn title-btn--standard" id="btn-start-multiplayer-post" disabled title="Online mode unavailable in the offline edition" style="width: 100%;">
                <div class="title-btn-icon">🌐</div>
                <div class="title-btn-body">
                    <div class="title-btn-label">MULTIPLAYER LOBBY</div>
                    <div class="title-btn-desc">Connect with other operatives online.</div>
                </div>
            </button>
            <button class="title-btn title-btn--standard" id="btn-replay-tutorial" style="width: 100%; border-color: #4a5568;">
                <div class="title-btn-icon" style="color: #718096;">🔄</div>
                <div class="title-btn-body">
                    <div class="title-btn-label" style="color: #a0aec0;">REPLAY TUTORIAL</div>
                    <div class="title-btn-desc">Review the basic training simulation.</div>
                </div>
            </button>
        `;
    document.getElementById('btn-start-real-game').addEventListener('click', () => {
      victoryModal.style.display = 'none';
      resetGameForNewSession();
      showFactionSelection();
    });
    document.getElementById('btn-replay-tutorial').addEventListener('click', () => {
      victoryModal.style.display = 'none';
      resetGameForNewSession();
      isTutorialMode = true;
      startTutorialGame();
    });
  }
  victoryModal.style.display = 'flex';
  SFX.playSuccess();
  networkLog('🎓 Training Protocol Complete! All objectives achieved.', 'success');
}

/**
 * Resets all global game state to allow a fresh game to start
 * without a full page reload. Cleans up tutorial, multiplayer,
 * and graph state.
 */
function resetGameForNewSession() {
  // Destroy tutorial if still active
  if (tutorial.isActive()) tutorial.destroy();

  // Reset flags and network state
  isTutorialMode = false;
  isMultiplayer = false;
  currentRoomId = null;
  currentRoomUuid = null;
  G = null;
  mySelectedNodeId = null;
  mySelectedHandCardIndex = null;
  lastRenderedHandKeys = null;
  recentHandDrawKeys.clear();
  selectedAttackerNodeId = null;
  selectedAttackerLocked = false;
  rearrangePreviewState = null;
  window._isAiThinking = false;

  // Clear the graph visuals
  if (gameGraphScene) {
    gameGraphScene.updateGraph({
      nodes: {},
      links: []
    }, HUMAN_ID);
    gameGraphScene._hasRenderedGraphOnce = false;
    gameGraphScene.selectNode(null);
    if (gameGraphScene.clearRearrangePreview) gameGraphScene.clearRearrangePreview();
    gameGraphScene.setBiddingWarHighlights([], null);
  }

  // Reset hand and panels
  handContainer.innerHTML = '';
  if (panelPlaceholder) panelPlaceholder.style.display = 'flex';
  if (nodeDetails) nodeDetails.style.display = 'none';
  if (attackResult) {
    attackResult.style.display = 'none';
    attackResult.className = 'attack-result';
  }
  if (eventLog) eventLog.innerHTML = '';

  // Reset victory modal buttons to default for non-tutorial wins
  const victoryButtons = document.getElementById('victory-buttons');
  if (victoryButtons) {
    victoryButtons.innerHTML = `
            <button class="title-btn title-btn--secondary" id="btn-view-board" onclick="viewBoardAtEnd()">
                <div class="title-btn-icon">👁️</div>
                <div class="title-btn-body">
                    <div class="title-btn-label">VIEW BOARD</div>
                    <div class="title-btn-desc">Examine the final state of the network.</div>
                </div>
            </button>
            <button class="title-btn title-btn--primary" id="btn-victory-default" onclick="window.location.reload()">
                <div class="title-btn-icon">🔌</div>
                <div class="title-btn-body">
                    <div class="title-btn-label">RECONNECT TO SECURE NETWORK</div>
                    <div class="title-btn-desc">End session and return to main interface.</div>
                </div>
            </button>
        `;
  }
  // Reset victory modal title
  const victoryTitle = document.getElementById('victory-title-h1');
  if (victoryTitle) victoryTitle.innerHTML = 'GLOBAL CONTROL ACHIEVED';

  // Reset stats
  const victoryStats = document.getElementById('victory-stats');
  if (victoryStats) {
    victoryStats.style.display = 'none';
    victoryStats.innerHTML = '';
  }
}
function checkWinConditions() {
  if (!G || G.winner) return;

  // Tutorial mode: simplified win condition
  if (isTutorialMode) {
    const owned = Object.values(G.nodes).filter(n => n.owner === HUMAN_ID && n.type !== 'root');
    if (owned.length >= TUTORIAL_WIN_GROUPS) {
      showTutorialVictory();
      return;
    }
    // Don't check normal AI win conditions in tutorial
    return;
  }

  // Default configs if missing
  const simConfig = G.simConfig || {
    allowFactionWin: true,
    allowGenericWin: true,
    genericWinThreshold: 10
  };
  for (const pid of G.playerOrder) {
    const p = G.players[pid];
    const fid = p.factionId;
    const owned = Object.values(G.nodes).filter(n => n.owner === pid && n.type !== 'root');
    const isEnd = G.isEndgame;
    let won = false;

    // 1. Check generic win condition
    if (simConfig.allowGenericWin && owned.length >= simConfig.genericWinThreshold) {
      won = true;
    }

    // 2. Check faction win condition
    if (!won && simConfig.allowFactionWin) {
      function getConnectedComponent(startId, validIds) {
        let visited = new Set(),
          queue = [startId];
        while (queue.length > 0) {
          let curr = queue.shift();
          if (!visited.has(curr)) {
            visited.add(curr);
            // Walk tree links both ways
            Object.values(G.nodes).forEach(n => {
              if (n.parentId === curr && validIds.has(n.id) && !visited.has(n.id)) queue.push(n.id);
              const currNode = G.nodes[curr];
              if (currNode?.parentId && validIds.has(currNode.parentId) && !visited.has(currNode.parentId)) queue.push(currNode.parentId);
            });
          }
        }
        return visited;
      }
      if (fid === 'f_algo') {
        const need = isEnd ? 5 : 6,
          connNeed = isEnd ? 3 : 4;
        const valid = owned.filter(n => n.alignments && (n.alignments.includes('Media') || n.alignments.includes('Techno-Utopian')));
        if (valid.length >= need) {
          const ids = new Set(valid.map(n => n.id));
          let maxComp = 0;
          ids.forEach(id => {
            const c = getConnectedComponent(id, ids);
            if (c.size > maxComp) maxComp = c.size;
          });
          if (maxComp >= connNeed) won = true;
        }
      } else if (fid === 'f_corp') {
        const reqGroups = isEnd ? 5 : 6;
        const reqIncome = isEnd ? 15 : 20;
        const validGroups = owned.filter(n => n.alignments && (n.alignments.includes('Corporate') || n.alignments.includes('Financial')));
        // Include faction root in income calculation (though it typically has some base income)
        const allOwned = Object.values(G.nodes).filter(n => n.owner === pid);
        const totalIncome = allOwned.reduce((sum, n) => sum + (n.income || 0) + getIncomeBonus(G.nodes, n), 0);
        if (validGroups.length >= reqGroups && totalIncome >= reqIncome) {
          won = true;
        }
      } else if (fid === 'f_natsec') {
        const reqTotal = isEnd ? 8 : 10;
        const reqCat = isEnd ? 4 : 5;
        if (owned.length >= reqTotal) {
          let has = {
            'Techno-Utopian': false,
            Media: false,
            Government: false,
            Criminal: false,
            Financial: false
          };
          owned.forEach(n => {
            if (n.alignments) {
              n.alignments.forEach(a => {
                if (a === 'Techno-Utopian') has['Techno-Utopian'] = true;
                if (a === 'Media') has.Media = true;
                if (a === 'Government') has.Government = true;
                if (a === 'Criminal') has.Criminal = true;
                if (a === 'Financial') has.Financial = true;
              });
            }
          });
          const catCount = Object.values(has).filter(v => v).length;
          if (catCount >= reqCat) won = true;
        }
      } else if (fid === 'f_cult') {
        const reqTotal = isEnd ? 6 : 8;
        const reqLowRes = isEnd ? 4 : 5;
        if (owned.length >= reqTotal) {
          if (owned.filter(n => n.resistance <= 2).length >= reqLowRes) won = true;
        }
      } else if (fid === 'f_crypto') {
        const root = G.nodes[p.rootNodeId];
        const reqBtc = 40;
        const reqFin = isEnd ? 1 : 2;
        const reqTech = isEnd ? 1 : 2;
        let finCount = 0,
          techCount = 0;
        owned.forEach(n => {
          if (n.alignments) {
            if (n.alignments.includes('Financial')) finCount++;
            if (n.alignments.includes('Techno-Utopian')) techCount++;
          }
        });
        if ((root.btc || 0) >= reqBtc && finCount >= reqFin && techCount >= reqTech) won = true;
      } else if (fid === 'f_underground') {
        const reqBtc = isEnd ? 40 : 50;
        const reqCrimLeg = isEnd ? 6 : 8;
        const reqDest = isEnd ? 4 : 5;
        const totalBtc = getPlayerTotalBtc(pid);
        let crimLegCount = 0;
        owned.forEach(n => {
          if (n.alignments && (n.alignments.includes('Criminal') || n.alignments.includes('Legal') || n.alignments.includes('Underworld'))) {
            crimLegCount++;
          }
        });
        const destCount = p.destroyedNodes || 0;
        if (totalBtc >= reqBtc || crimLegCount >= reqCrimLeg || destCount >= reqDest) won = true;
      } else if (fid === 'f_hiddenhand') {
        const req = isEnd ? 4 : 5;
        const valid = owned.filter(n => n.alignments && n.alignments.includes('Ideological'));
        const totalPow = getPlayerTotalPower(pid);
        const reqPow = isEnd ? 15 : 20;
        if (valid.length >= req && totalPow >= reqPow) won = true;
      } else if (fid === 'f_syndicate') {
        const req = isEnd ? 4 : 5;
        const valid = owned.filter(n => n.alignments && n.alignments.includes('Criminal'));
        const btc = p.funds || 0;
        if (valid.length >= req && btc >= 10) won = true;
      }
    }
    if (!G.isEndgame && owned.length >= 12) {
      G.isEndgame = true;
      logEvent("⚠ ENDGAME: Global destabilization. Thresholds reduced. +1 Power.", 'failure');
    }
    if (won) {
      G.winner = pid;
      showVictoryScreen(pid);
      return;
    }
  }
}
function showVictoryScreen(winnerId) {
  const p = G.players[winnerId];
  const fac = FACTIONS[p.factionId];

  // Check if human won
  const isHumanWin = winnerId === HUMAN_ID;

  // Update theme colors based on win/loss
  const modalContent = document.querySelector('#victory-modal .title-content > div:nth-child(2)');
  const eyebrow = document.querySelector('#victory-modal .title-eyebrow');
  const title = document.getElementById('victory-title-h1');
  const bgLayer = document.querySelector('#victory-modal .title-bg-layer');
  if (isHumanWin) {
    if (modalContent) {
      modalContent.style.borderColor = 'var(--accent-green)';
      modalContent.style.boxShadow = '0 0 30px rgba(34, 197, 94, 0.2)';
    }
    if (eyebrow) eyebrow.style.color = 'var(--accent-green)';
    if (title) {
      title.style.color = 'var(--accent-green)';
      title.style.textShadow = '0 0 15px var(--accent-green)';
      title.innerHTML = 'GLOBAL CONTROL ACHIEVED';
    }
    if (bgLayer) bgLayer.style.filter = 'grayscale(80%) sepia(20%) hue-rotate(90deg) brightness(0.6)'; // Green tint
  } else {
    if (modalContent) {
      modalContent.style.borderColor = 'var(--accent-red)';
      modalContent.style.boxShadow = '0 0 30px rgba(239, 68, 68, 0.2)';
    }
    if (eyebrow) eyebrow.style.color = 'var(--accent-red)';
    if (title) {
      title.style.color = 'var(--accent-red)';
      title.style.textShadow = '0 0 15px var(--accent-red)';
      title.innerHTML = 'NETWORK COMPROMISED';
    }
    if (bgLayer) bgLayer.style.filter = 'grayscale(80%) sepia(50%) hue-rotate(330deg) brightness(0.4)'; // Red tint
  }

  // Set text content
  document.getElementById('winner-name').innerHTML = `${fac.icon} ${fac.name.toUpperCase()} <span style="color: ${isHumanWin ? 'var(--accent-green)' : 'var(--accent-red)'}">WINS</span>`;
  document.getElementById('winner-desc').innerHTML = `<em>"${fac.desc}"</em><br><br><span style="color: var(--accent-yellow);">Victory Condition Met:</span> ${fac.winDesc}`;

  // Build stats block
  const statsContainer = document.getElementById('victory-stats');
  if (statsContainer) {
    statsContainer.style.display = 'flex';
    statsContainer.innerHTML = '';

    // Gather endgame stats
    const totalTurns = G.turnNumber || 0;
    const myGroups = Object.values(G.nodes).filter(n => n.owner === winnerId && n.type !== 'root').length;
    const myBtc = getPlayerTotalBtc(winnerId);
    const stats = [{
      label: 'TOTAL GROUPS',
      value: myGroups,
      icon: '🕸️'
    }, {
      label: 'TOTAL ₿TC',
      value: `₿${myBtc}`,
      icon: '🪙'
    }, {
      label: 'ROUNDS PLAYED',
      value: totalTurns,
      icon: '⏳'
    }, {
      label: 'STANDING',
      value: isHumanWin ? 'VICTORIOUS' : 'DEFEATED',
      icon: isHumanWin ? '🏆' : '💀',
      color: isHumanWin ? 'var(--accent-green)' : 'var(--accent-red)'
    }];
    stats.forEach(stat => {
      const div = document.createElement('div');
      div.style.flex = '1 1 40%';
      div.style.minWidth = '120px';
      div.style.background = 'rgba(0,0,0,0.4)';
      div.style.padding = '10px';
      div.style.border = '1px solid rgba(255,255,255,0.1)';
      div.style.borderRadius = '4px';
      div.innerHTML = `
                <div style="font-family: var(--font-mono); font-size: 10px; color: #718096; margin-bottom: 5px;">${stat.icon} ${stat.label}</div>
                <div style="font-family: var(--font-mono); font-size: 18px; color: ${stat.color || 'var(--text-white)'};">${stat.value}</div>
            `;
      statsContainer.appendChild(div);
    });
  }
  const victoryModal = document.getElementById('victory-modal');
  if (victoryModal) victoryModal.style.display = 'flex';

  // ─── Multiplayer: offer "Return to Lobby" for a quick rematch ───────────
  // In multiplayer we keep the room joined so players can re-pick factions
  // and settings without re-entering the room code.
  injectReturnToLobbyButton();
  if (isHumanWin) {
    SFX.playVictory();
  } else {
    SFX.playFailure();
  }
}
window.viewBoardAtEnd = () => {
  document.getElementById('victory-modal').style.display = 'none';
  let floatingBtn = document.getElementById('btn-floating-victory');
  if (!floatingBtn) {
    floatingBtn = document.createElement('button');
    floatingBtn.id = 'btn-floating-victory';
    floatingBtn.innerHTML = '🏆 SHOW VICTORY RESULTS';
    floatingBtn.style.position = 'absolute';
    floatingBtn.style.top = '20px';
    floatingBtn.style.right = '20px';
    floatingBtn.style.zIndex = '99999';
    floatingBtn.className = 'title-btn title-btn--primary';
    floatingBtn.style.padding = '10px 20px';
    floatingBtn.style.fontSize = '14px';
    floatingBtn.style.width = 'auto';
    floatingBtn.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.4)';
    floatingBtn.onclick = () => {
      document.getElementById('victory-modal').style.display = 'flex';
      floatingBtn.style.display = 'none';
    };
    document.body.appendChild(floatingBtn);
  }
  floatingBtn.style.display = 'block';
};

// ═══════════════════════════════════════
//  RETURN TO LOBBY (multiplayer rematch)
// ═══════════════════════════════════════
function injectReturnToLobbyButton() {
  const victoryButtons = document.getElementById('victory-buttons');
  if (!victoryButtons) return;

  // Remove any existing rematch button so we don't dupe it across multiple
  // calls (e.g. when showVictoryScreen runs again for an updated result).
  const existing = document.getElementById('btn-return-to-lobby');
  if (existing) existing.remove();

  // Only show in multiplayer with a live room
  return;
}

/**
 * Tears down the current game (G state, board visuals, selections) but KEEPS
 * the InstantDB room joined and the lobby roster intact. Resets each player's
 * ready/faction state in presence so the lobby's start-gate is re-armed.
 * Re-shows the lobby modal pre-populated with the existing connected players.
 */

/**
 * Re-renders the lobby modal assuming we're already in a room. Skips the
 * join step and goes straight to the setup section.
 */

// ═══════════════════════════════════════
//  REFRESH / UPDATE UI
// ═══════════════════════════════════════
function refreshAll() {
  if (!G) return;
  checkWinConditions();
  updateUI();
  if (gameGraphScene) {
    gameGraphScene.updateGraph({
      nodes: G.nodes,
      links: buildLinksFromTree()
    }, HUMAN_ID);
    if (mySelectedNodeId) gameGraphScene.selectNode(mySelectedNodeId);
    if (rearrangePreviewState?.nodeId) {
      gameGraphScene.setRearrangePreview(rearrangePreviewState);
    } else if (gameGraphScene.clearRearrangePreview) {
      gameGraphScene.clearRearrangePreview();
    }
  }
  // If a bidding war is active, ensure its live preview updates to reflect new buffs/stats
  if (window.updateBiddingWarPreview) {
    window.updateBiddingWarPreview();
  }
}

/**
 * Calculate global tension based on how close players are to victory
 * and update the BGM intensity accordingly.
 */
function updateGlobalMusicIntensity() {
  if (!G) return;
  let maxProgress = 0;
  G.playerOrder.forEach(pid => {
    const {
      progressPct
    } = getWinProgress(pid);
    if (progressPct > maxProgress) maxProgress = progressPct;
  });

  // Scale intensity: 0-60% progress = base, 60-100% = ramping up
  let intensity = 0;
  if (maxProgress > 60) {
    intensity = (maxProgress - 60) / 40;
  }
  if (G.isEndgame) intensity = Math.max(intensity, 0.8);
  SFX.setMusicIntensity(intensity);
}
function updateUI() {
  if (!G) return;
  updateGlobalMusicIntensity();
  if (G.currentEvent) {
    updateEventTicker(`${G.currentEvent.icon} ${G.currentEvent.name}: ${G.currentEvent.desc} --- `);
  }
  elDeckCount.innerText = `DECK: ${G.deck.length}`;
  const rd = document.getElementById('round-display');
  if (rd) rd.innerText = `ROUND ${G.turnNumber}`;
  const myP = G.players[HUMAN_ID];
  if (!myP) return;
  const currentHandKeys = (myP.hand || []).map(getCardRenderKey);
  const previousHandCounts = new Map();
  const newlyRenderedHandSlots = new Set();
  if (lastRenderedHandKeys) {
    lastRenderedHandKeys.forEach(key => previousHandCounts.set(key, (previousHandCounts.get(key) || 0) + 1));
    currentHandKeys.forEach((key, index) => {
      const remaining = previousHandCounts.get(key) || 0;
      if (remaining > 0) previousHandCounts.set(key, remaining - 1);else newlyRenderedHandSlots.add(index);
    });
  }
  lastRenderedHandKeys = currentHandKeys;
  const myFac = FACTIONS[myP.factionId];
  if (myFac && elName) elName.innerText = myFac.name.toUpperCase();
  const myPwr = getPlayerTotalPower(HUMAN_ID);
  const myInc = getPlayerIncome(HUMAN_ID);
  const myBtc = getPlayerTotalBtc(HUMAN_ID);
  let myNodes = 0,
    totalNodes = Object.keys(G.nodes).length;
  Object.values(G.nodes).forEach(n => {
    if (n.owner === HUMAN_ID && n.type !== 'root') myNodes++;
  });
  const globalControlStr = (myNodes / Math.max(1, totalNodes) * 100).toFixed(1) + '%';

  // Sidebar Overview
  const elOverview = document.getElementById('sidebar-overview');
  if (elOverview) elOverview.style.display = 'block';
  const elRound = document.getElementById('overview-round');
  if (elRound) elRound.innerText = G.turnNumber;
  const elControl = document.getElementById('overview-control');
  if (elControl) {
    elControl.innerText = globalControlStr;
    if (G.isEndgame) {
      elControl.innerText += ' [ENDGAME]';
      elControl.style.color = 'var(--accent-red)';
    } else elControl.style.color = 'var(--accent-blue)';
  }
  const oInc = document.getElementById('overview-income');
  if (oInc) oInc.innerText = '₿' + myInc;
  const oFunds = document.getElementById('overview-funds');
  if (oFunds) oFunds.innerText = '₿' + myBtc;
  const oPwr = document.getElementById('overview-power');
  if (oPwr) oPwr.innerText = myPwr;
  const oGrps = document.getElementById('overview-groups');
  if (oGrps) oGrps.innerText = myNodes;

  // Phase indicator
  if (phaseIndicator) {
    if (isMyTurn()) {
      const pn = {
        [TURN_PHASES.INCOME]: '📥 INCOME',
        [TURN_PHASES.ACTION]: '⚔️ ACTION',
        [TURN_PHASES.FREE_ACTIONS]: '💱 FREE',
        [TURN_PHASES.END]: '✅ END'
      };
      const ps = [TURN_PHASES.INCOME, TURN_PHASES.ACTION, TURN_PHASES.FREE_ACTIONS, TURN_PHASES.END];
      phaseIndicator.innerHTML = ps.map(p => {
        const active = G.turnPhase === p;
        const done = ps.indexOf(G.turnPhase) > ps.indexOf(p);
        return `<span class="${active ? 'phase-step active' : done ? 'phase-step done' : 'phase-step'}">${pn[p] || p}</span>`;
      }).join('<span class="phase-arrow">→</span>');
    } else {
      if (window._isAiThinking) {
        phaseIndicator.innerHTML = `<span class="phase-step waiting">OPPONENT IS THINKING<span class="dots"></span></span>`;
      } else {
        phaseIndicator.innerHTML = '<span class="phase-step waiting">OPPONENT\'S TURN</span>';
      }
    }
  }

  // Hand
  handContainer.innerHTML = '';
  const hasNostalgia = Object.values(G.nodes).some(n => n.owner === HUMAN_ID && n.id === 'x_nostalgia');
  (myP.hand || []).forEach((card, index) => {
    const isAction = card.type === 'action';
    const div = document.createElement('div');
    const animateDraw = newlyRenderedHandSlots.has(index) || shouldAnimateHandCard(card);
    div.className = 'playing-card' + (mySelectedHandCardIndex === index ? ' selected' : '') + (animateDraw ? ' hand-card-drawing' : '');
    if (isAction) div.style.borderColor = 'var(--accent-yellow)';else div.style.cssText += getPlayingCardStyle(card, isAction);
    div.innerHTML = createPlayingCardHTML(card, isAction, false);
    div.draggable = false;
    div.onmouseenter = e => {
      onNodeHovered(card, e.clientX, e.clientY);
    };
    div.onmousemove = e => {
      onNodeHoverMoved(card, e.clientX, e.clientY);
    };
    div.onmouseleave = () => {
      onNodeUnhovered();
    };
    div.ondragstart = e => {
      e.preventDefault();
    };
    div.onclick = () => {
      if (Date.now() < suppressHandClickUntil) return;
      mySelectedHandCardIndex = index;
      mySelectedNodeId = null;
      selectedAttackerNodeId = null;
      if (gameGraphScene) gameGraphScene.selectNode(null);
      updateDetailsPanel();
      updateUI();
      SFX.playClick();
      // Tutorial notification
      if (isTutorialMode && tutorial.isActive()) {
        tutorial.notify('hand_card_selected', {
          cardId: card.id,
          index
        });
        // After selecting a hand card, surface any action-phase guidance immediately
        setTimeout(() => tutorial.onActionPhase(), 120);
      }
    };
    handContainer.appendChild(div);
  });
  if (hasNostalgia && G.discardPile && G.discardPile.length > 0) {
    const topDiscard = G.discardPile[G.discardPile.length - 1];
    const discardIndex = 999;
    const div = document.createElement('div');
    div.className = 'playing-card' + (mySelectedHandCardIndex === discardIndex ? ' selected' : '');
    const discardIsAction = topDiscard.type === 'action';
    if (!discardIsAction) div.style.cssText += getPlayingCardStyle(topDiscard, discardIsAction);
    div.style.borderColor = 'var(--accent-purple)';
    div.innerHTML = createPlayingCardHTML(topDiscard, discardIsAction, false);
    // Prepend NOSTALGIA banner
    div.innerHTML = `<div style="font-size:11px;color:var(--accent-purple);margin-bottom:4px;font-weight:bold;text-align:center;">📼 NOSTALGIA</div>` + div.innerHTML;
    div.onmouseenter = e => {
      onNodeHovered(topDiscard, e.clientX, e.clientY);
    };
    div.onmousemove = e => {
      onNodeHoverMoved(topDiscard, e.clientX, e.clientY);
    };
    div.onmouseleave = () => {
      onNodeUnhovered();
    };
    div.onclick = () => {
      mySelectedHandCardIndex = discardIndex;
      mySelectedNodeId = null;
      selectedAttackerNodeId = null;
      if (gameGraphScene) gameGraphScene.selectNode(null);
      updateDetailsPanel();
      updateUI();
      SFX.playClick();
    };
    handContainer.appendChild(div);
  }

  // Turn status
  if (isMyTurn()) {
    const cap = G.actionsPerTurn || 2;
    const used = G.actionsUsed || 0;
    const remaining = Math.max(0, cap - used);
    let label;
    if (remaining === 0) label = 'NO ACTIONS LEFT — END TURN';else if (used === 0) label = `CHOOSE YOUR ACTION (${cap} available)`;else label = `${remaining} OF ${cap} ACTIONS LEFT`;
    turnStatus.innerText = `ROUND ${G.turnNumber} — ${label}`;
    turnStatus.className = "turn-status";
    btnEndTurn.disabled = false;
    btnEndTurn.innerText = remaining === 0 ? '✅ END TURN' : '⏭️ PASS & END TURN';
  } else {
    const ap = G.players[getActivePlayerId()];
    turnStatus.innerText = `${ap ? ap.name.toUpperCase() : 'AI'}'S TURN`;
    turnStatus.className = "turn-status waiting";
    btnEndTurn.disabled = true;
    btnEndTurn.innerText = 'END TURN';
  }

  // Victory Tracker (formerly Rivals also integrated here)
  updateVictoryTracker();
  updateFactionAbilityPanel();
  if (mySelectedNodeId || mySelectedHandCardIndex !== null) updateDetailsPanel();
}
function updateFactionAbilityPanel() {
  const panel = document.getElementById('faction-ability-panel');
  const pNameEl = document.getElementById('f-ability-passive-name');
  const pDescEl = document.getElementById('f-ability-passive-desc');
  const aNameEl = document.getElementById('f-ability-active-name');
  const aDescEl = document.getElementById('f-ability-active-desc');
  const statusEl = document.getElementById('f-ability-status');
  if (!panel || !pNameEl || !pDescEl || !statusEl || !G) return;
  const myP = G.players[HUMAN_ID];
  if (!myP) return;
  const fac = FACTIONS[myP.factionId];
  if (!fac) {
    panel.style.display = 'none';
    return;
  }
  panel.style.display = 'flex';
  if (fac.passive) {
    pNameEl.textContent = `${fac.passive.icon} ${fac.passive.name} (Passive)`;
    pDescEl.textContent = fac.passive.desc;
  }

  // Handle secondary passive (e.g. Corporate Megabloc's Acquisition Surge)
  if (fac.passive2) {
    aNameEl.textContent = `${fac.passive2.icon} ${fac.passive2.name} (Passive)`;
    aDescEl.textContent = fac.passive2.desc;
  } else if (fac.active) {
    aNameEl.textContent = `${fac.active.icon} ${fac.active.name} (Active)`;
    aDescEl.textContent = fac.active.desc;
  } else {
    aNameEl.textContent = '';
    aDescEl.textContent = 'No Active Ability';
  }
  const used = G.factionAbilityUsed[HUMAN_ID];
  const isCrypto = fac.id === 'f_crypto';
  const hasActive = !!fac.active;
  const canUse = isMyTurn() && !used && hasActive || isCrypto;
  if (!hasActive && !isCrypto) {
    statusEl.innerHTML = 'PASSIVE ONLY';
    statusEl.style.color = '#718096';
    statusEl.style.borderColor = '#4a5568';
    statusEl.style.background = 'rgba(0,0,0,0.3)';
    panel.style.opacity = '1'; // Keep readable
    panel.style.pointerEvents = 'none';
  } else if (used && !isCrypto) {
    statusEl.innerHTML = 'USED THIS TURN';
    statusEl.style.color = '#718096';
    statusEl.style.borderColor = '#4a5568';
    statusEl.style.background = 'rgba(0,0,0,0.3)';
    panel.style.opacity = '0.6';
    panel.style.pointerEvents = 'none';
  } else if (isMyTurn() || isCrypto) {
    statusEl.innerHTML = '⚡ ACTIVATE';
    statusEl.style.color = 'var(--accent-purple)';
    statusEl.style.borderColor = 'var(--accent-purple)';
    statusEl.style.background = 'rgba(168,85,247,0.1)';
    panel.style.opacity = '1';
    panel.style.pointerEvents = 'auto';
  } else {
    statusEl.innerHTML = 'WAITING...';
    statusEl.style.color = '#4a5568';
    statusEl.style.borderColor = '#2d3748';
    statusEl.style.background = 'rgba(0,0,0,0.2)';
    panel.style.opacity = '0.6';
    panel.style.pointerEvents = 'none';
  }
  panel.onclick = () => {
    if (!canUse) return;
    const myFac = G.players[HUMAN_ID]?.factionId;
    if (myFac === 'f_crypto') {
      // Fluid Tokenomics is now integrated into standard transfers.
      // When they click the ability panel, they just want Volatility Spike.
      showFactionActiveModal('f_crypto');
    } else {
      showFactionActiveModal(myFac);
    }
    SFX.playClick();
  };
}
function showFactionActiveModal(factionId) {
  const modal = document.getElementById('faction-active-modal');
  if (!modal) return;
  const titleEl = document.getElementById('fa-modal-title');
  const descEl = document.getElementById('fa-modal-desc');
  const bodyEl = document.getElementById('fa-modal-body');
  const confirmBtn = document.getElementById('fa-modal-confirm');
  const cancelBtn = document.getElementById('fa-modal-cancel');
  bodyEl.innerHTML = '';
  const fac = FACTIONS[factionId];
  if (!fac || !fac.active) return;
  titleEl.textContent = `${fac.active.icon} ${fac.active.name.toUpperCase()}`;
  descEl.textContent = fac.active.desc;
  let onConfirm = null;
  if (factionId === 'f_algo') {
    const targets = Object.values(G.nodes).filter(n => n.type !== 'root' && n.alignments && (n.alignments.includes('Media') || n.alignments.includes('Techno-Utopian')));
    if (targets.length === 0) {
      logEvent("No Media or Techno-Utopian groups available.", "warning");
      return;
    }
    const select = document.createElement('select');
    select.className = 'transfer-input';
    targets.forEach(n => {
      const opt = document.createElement('option');
      opt.value = n.id;
      opt.textContent = `${n.icon || '🌐'} ${n.name} (Res: ${n.resistance})`;
      select.appendChild(opt);
    });
    bodyEl.appendChild(select);
    onConfirm = () => {
      const tId = select.value;
      const target = G.nodes[tId];
      if (target) {
        target.resistance -= 2;
        G.factionAbilityUsed[HUMAN_ID] = true;
        networkLog(`🔮 Predictive Manipulation: ${target.name} Resistance reduced by 2!`, "success");
        networkSfx('debuff');
      }
    };
  } else if (factionId === 'f_cult') {
    const targets = Object.values(G.nodes).filter(n => n.type !== 'root');
    if (targets.length === 0) return;
    const select = document.createElement('select');
    select.className = 'transfer-input';
    targets.forEach(n => {
      const opt = document.createElement('option');
      opt.value = n.id;
      const ownerName = n.owner ? n.owner === HUMAN_ID ? 'YOU' : G.players[n.owner]?.name || '?' : 'Neutral';
      const rLabel = n.resistance <= 1 ? `R:${n.resistance} → +1P!` : `R:${n.resistance} → R:${n.resistance - 1}`;
      opt.textContent = `${n.icon || '🌐'} ${n.name} (${rLabel}) [${ownerName}]`;
      select.appendChild(opt);
    });
    bodyEl.appendChild(select);
    onConfirm = () => {
      const tId = select.value;
      const target = G.nodes[tId];
      if (target) {
        const result = applyNarrativeAgitation(G.nodes, target.id, HUMAN_ID);
        G.factionAbilityUsed[HUMAN_ID] = true;
        if (result) {
          if (result.type === 'resistance') {
            networkLog(`📢 Outrage Cascade: ${result.targetIcon} ${result.targetName} Resistance reduced to ${result.newRes}!`, 'success');
            networkSfx('attack');
          } else {
            networkLog(`📢 Outrage Cascade: ${result.targetIcon} ${result.targetName} already fragile — +1 Power gained!`, 'success');
            networkSfx('success');
          }
        }
      }
    };
  } else if (factionId === 'f_crypto') {
    bodyEl.innerHTML = `
            <div style="text-align:center; font-family: var(--font-sans); font-size: 13px; color: #cbd5e0;">
                Instantly inject <strong style="color:var(--accent-yellow)">+₿5</strong> into your faction vault.<br><br>
                <span style="color:var(--accent-red)">Warning:</span> You will automatically lose <strong style="color:var(--accent-red)">₿7</strong> at the start of your next turn.
            </div>
        `;
    onConfirm = () => {
      const p = G.players[HUMAN_ID];
      const myRoot = G.nodes[p.rootNodeId];
      if (myRoot) {
        myRoot.btc = (myRoot.btc || 0) + 5;
        p.volatilityDebt = (p.volatilityDebt || 0) + 7;
        G.factionAbilityUsed[HUMAN_ID] = true;
        networkLog(`⛓️ Volatility Spike! Gained ₿5. (Debt of ₿7 added for next turn).`, 'success');
        networkSfx('economy');
      }
    };
  } else if (factionId === 'f_underground') {
    const targets = Object.values(G.nodes).filter(n => n.type !== 'root');
    if (targets.length === 0) return;
    const select = document.createElement('select');
    select.className = 'transfer-input';
    targets.forEach(n => {
      const opt = document.createElement('option');
      opt.value = n.id;
      opt.textContent = `${n.icon || '🌐'} ${n.name} (Res: ${n.resistance})`;
      select.appendChild(opt);
    });
    bodyEl.appendChild(select);
    onConfirm = () => {
      const tId = select.value;
      const target = G.nodes[tId];
      if (target) {
        target.resistance -= 1;
        let msg = `🕴️ Permanent Network: ${target.name} Resistance reduced to ${target.resistance}.`;
        if (target.resistance <= 0) {
          const detached = detachSubtree(target.id);
          if (!G.players[HUMAN_ID].destroyedNodes) G.players[HUMAN_ID].destroyedNodes = 0;
          G.players[HUMAN_ID].destroyedNodes++;
          if (DECK.find(c => c.id === target.id)) {
            const baseCard = DECK.find(c => c.id === target.id);
            G.discardPile.push(baseCard);
          }
          delete G.nodes[target.id];
          msg = `🕴️ Permanent Network: ${target.name} reached 0 Resistance and was DESTROYED!`;
        }
        G.factionAbilityUsed[HUMAN_ID] = true;
        networkLog(msg, "success");
        networkSfx('debuff');
      }
    };
  } else {
    logEvent('This active ability triggers automatically under specific conditions.', 'warning');
    return;
  }
  modal.style.display = 'flex';
  const doConfirm = () => {
    if (onConfirm) onConfirm();
    closeModal();
    refreshAll();
    syncState();
  };
  const closeModal = () => {
    modal.style.display = 'none';
    confirmBtn.removeEventListener('click', doConfirm);
    cancelBtn.removeEventListener('click', closeModal);
  };
  confirmBtn.addEventListener('click', doConfirm);
  cancelBtn.addEventListener('click', closeModal);
}
function getWinProgress(playerId) {
  const p = G.players[playerId];
  if (!p) return {
    desc: '',
    progressPct: 0
  };
  const fid = p.factionId;
  const owned = Object.values(G.nodes).filter(n => n.owner === playerId && n.type !== 'root');
  const isEnd = G.isEndgame;
  let progressPct = 0;
  let desc = '';

  // Tutorial: simplified progress for human player
  if (isTutorialMode && playerId === HUMAN_ID) {
    const count = owned.length;
    progressPct = Math.min(100, count / TUTORIAL_WIN_GROUPS * 100);
    desc = `Groups: ${count}/${TUTORIAL_WIN_GROUPS}`;
    return {
      desc,
      progressPct
    };
  }

  // Default configs if missing
  const simConfig = G.simConfig || {
    allowFactionWin: true,
    allowGenericWin: true,
    genericWinThreshold: 10
  };

  // Generic win condition progress
  let genericProgress = 0;
  let genericDesc = '';
  if (simConfig.allowGenericWin) {
    const count = owned.length;
    const target = simConfig.genericWinThreshold;
    genericProgress = Math.min(100, count / target * 100);
    genericDesc = `Groups: ${count}/${target}`;
  }

  // Faction specific win condition progress
  let factionProgress = 0;
  let factionDesc = '';
  if (simConfig.allowFactionWin) {
    // Approximations for UI progress bars based on checkWinConditions()
    if (fid === 'f_algo') {
      const need = isEnd ? 5 : 6;
      const valid = owned.filter(n => n.alignments && (n.alignments.includes('Media') || n.alignments.includes('Techno-Utopian')));
      factionDesc = `Media/Tech: ${valid.length}/${need}`;
      factionProgress = Math.min(100, valid.length / need * 100);
    } else if (fid === 'f_corp') {
      const reqGroups = isEnd ? 5 : 6;
      const reqIncome = isEnd ? 15 : 20;
      const validGroups = owned.filter(n => n.alignments && (n.alignments.includes('Corporate') || n.alignments.includes('Financial')));
      const allOwned = Object.values(G.nodes).filter(n => n.owner === playerId);
      const totalIncome = allOwned.reduce((sum, n) => sum + (n.income || 0) + getIncomeBonus(G.nodes, n), 0);
      factionDesc = `Groups: ${Math.min(validGroups.length, reqGroups)}/${reqGroups} · Income: ₿${Math.min(totalIncome, reqIncome)}/₿${reqIncome}`;
      const groupPct = Math.min(100, validGroups.length / reqGroups * 100);
      const incPct = Math.min(100, totalIncome / reqIncome * 100);
      factionProgress = groupPct * 0.5 + incPct * 0.5;
    } else if (fid === 'f_natsec') {
      const req = isEnd ? 8 : 10;
      let has = {
        Tech: false,
        Media: false,
        Government: false,
        Criminal: false,
        Financial: false
      };
      owned.forEach(n => {
        if (n.alignments) n.alignments.forEach(a => {
          if (a === 'Techno-Utopian') has.Tech = true;
          if (a === 'Media') has.Media = true;
          if (a === 'Government') has.Government = true;
          if (a === 'Criminal') has.Criminal = true;
          if (a === 'Financial') has.Financial = true;
        });
      });
      const catCount = Object.values(has).filter(v => v).length;
      factionDesc = `Groups: ${owned.length}/${req} · Types: ${catCount}/5`;
      factionProgress = Math.min(100, owned.length / req * 50 + catCount / 5 * 50);
    } else if (fid === 'f_cult') {
      const totalReq = isEnd ? 6 : 8;
      const lowRReq = isEnd ? 4 : 5;
      const lowR = owned.filter(n => n.resistance <= 2).length;
      factionDesc = `Total: ${owned.length}/${totalReq} · Low-R: ${lowR}/${lowRReq}`;
      factionProgress = Math.min(100, owned.length / totalReq * 50 + lowR / lowRReq * 50);
    } else if (fid === 'f_crypto') {
      const rootNode = Object.values(G.nodes).find(n => n.owner === playerId && n.type === 'root');
      const btcReq = 40;
      const reqFin = isEnd ? 1 : 2;
      const reqTech = isEnd ? 1 : 2;
      const vaultBtc = rootNode ? rootNode.btc || 0 : 0;
      let finCount = 0,
        techCount = 0;
      owned.forEach(n => {
        if (n.alignments) {
          if (n.alignments.includes('Financial')) finCount++;
          if (n.alignments.includes('Techno-Utopian')) techCount++;
        }
      });
      factionDesc = `Vault ₿${vaultBtc}/${btcReq} · Fin ${finCount}/${reqFin} Tech ${techCount}/${reqTech}`;
      const btcProg = Math.min(1, vaultBtc / btcReq);
      const catProg = (Math.min(reqFin, finCount) + Math.min(reqTech, techCount)) / (reqFin + reqTech);
      factionProgress = Math.min(100, btcProg * 60 + catProg * 40);
    } else if (fid === 'f_underground') {
      const reqBtc = isEnd ? 40 : 50;
      const reqCrimLeg = isEnd ? 6 : 8;
      const reqDest = isEnd ? 4 : 5;
      const totalBtc = getPlayerTotalBtc(playerId);
      let crimLegCount = 0;
      owned.forEach(n => {
        if (n.alignments && (n.alignments.includes('Criminal') || n.alignments.includes('Legacy'))) {
          crimLegCount++;
        }
      });
      const destCount = p.destroyedNodes || 0;
      const btcProg = Math.min(100, totalBtc / reqBtc * 100);
      const crimLegProg = Math.min(100, crimLegCount / reqCrimLeg * 100);
      const destProg = Math.min(100, destCount / reqDest * 100);
      factionProgress = Math.max(btcProg, crimLegProg, destProg); // Path with highest completion

      if (factionProgress === btcProg) {
        factionDesc = `Hoard: ₿${totalBtc}/₿${reqBtc}`;
      } else if (factionProgress === crimLegProg) {
        factionDesc = `Crim/Legacy: ${crimLegCount}/${reqCrimLeg}`;
      } else {
        factionDesc = `Destroyed: ${destCount}/${reqDest}`;
      }
    }
  }

  // Choose the progress that is closest to winning
  if (simConfig.allowGenericWin && (!simConfig.allowFactionWin || genericProgress > factionProgress)) {
    progressPct = genericProgress;
    desc = genericDesc;
  } else {
    progressPct = factionProgress;
    desc = factionDesc;
  }
  return {
    desc,
    progressPct
  };
}
function updateVictoryTracker() {
  const container = document.getElementById('victory-players-container');
  if (!container || !G) return;
  container.innerHTML = '';
  G.playerOrder.forEach(pid => {
    const p = G.players[pid];
    const isHuman = pid === HUMAN_ID;
    const {
      desc,
      progressPct
    } = getWinProgress(pid);
    const fac = FACTIONS[p.factionId];

    // Rival stats
    const oc = Object.values(G.nodes).filter(n => n.owner === pid && n.type !== 'root').length;
    const tb = getPlayerTotalBtc(pid);
    const tp = Object.values(G.nodes).filter(n => n.owner === pid).reduce((s, n) => s + (n.power || 0), 0);
    const isAct = getActivePlayerId() === pid;
    const playerDiv = document.createElement('div');
    playerDiv.style.marginBottom = '8px';
    playerDiv.style.padding = '12px';
    playerDiv.style.borderRadius = '6px';
    playerDiv.style.cursor = 'pointer';
    playerDiv.style.transition = 'all 0.2s';
    playerDiv.classList.add('victory-item');
    if (isAct) playerDiv.style.borderColor = 'var(--accent-red) !important';
    playerDiv.addEventListener('mouseenter', () => {
      if (gameGraphScene) gameGraphScene.setPlayerHighlight(pid);
    });
    playerDiv.addEventListener('mouseleave', () => {
      if (gameGraphScene) gameGraphScene.setPlayerHighlight(null);
    });
    playerDiv.addEventListener('click', () => {
      victoryTrackerModal.style.display = 'none';
      showVictoryIntel(pid);
    });

    // Header: Icon + Name
    const headerDiv = document.createElement('div');
    headerDiv.style.display = 'flex';
    headerDiv.style.alignItems = 'center';
    headerDiv.style.gap = '6px';
    headerDiv.style.marginBottom = '4px';
    const iconSpan = document.createElement('span');
    iconSpan.textContent = fac?.icon || '👤';
    iconSpan.style.fontSize = '14px';
    const nameSpan = document.createElement('span');
    nameSpan.style.fontFamily = 'var(--font-mono)';
    nameSpan.style.fontSize = '12px';
    nameSpan.style.fontWeight = isHuman ? 'bold' : 'normal';
    nameSpan.style.color = isHuman ? 'var(--accent-green)' : '#cbd5e0';
    nameSpan.style.flex = '1';
    nameSpan.style.whiteSpace = 'nowrap';
    nameSpan.style.overflow = 'hidden';
    nameSpan.style.textOverflow = 'ellipsis';
    nameSpan.textContent = p.name;
    const pctSpan = document.createElement('span');
    pctSpan.style.fontFamily = 'var(--font-mono)';
    pctSpan.style.fontSize = '11px';
    pctSpan.style.color = progressPct >= 90 ? 'var(--accent-yellow)' : '#718096';
    pctSpan.textContent = `${Math.floor(progressPct)}%`;
    headerDiv.appendChild(iconSpan);
    headerDiv.appendChild(nameSpan);
    headerDiv.appendChild(pctSpan);

    // Stats Row (Replacing the bottom rivals panel)
    const statsDiv = document.createElement('div');
    statsDiv.style.display = 'flex';
    statsDiv.style.gap = '8px';
    statsDiv.style.fontFamily = 'var(--font-mono)';
    statsDiv.style.fontSize = '9px';
    statsDiv.style.color = 'var(--accent-yellow)';
    statsDiv.style.marginBottom = '4px';
    statsDiv.innerHTML = `<span>${oc}⬡</span> <span>P${tp}</span> <span>₿${tb}</span>`;

    // Progress bar container
    const barContainer = document.createElement('div');
    barContainer.className = 'victory-bar-container';
    barContainer.style.height = '4px';
    barContainer.style.marginTop = '2px';
    const barFill = document.createElement('div');
    barFill.className = 'victory-bar-fill';
    barFill.style.width = `${progressPct}%`;
    if (progressPct >= 90) {
      barFill.style.background = 'linear-gradient(90deg, var(--accent-yellow), #facc15)';
      barFill.style.boxShadow = '0 0 8px rgba(234, 179, 8, 0.6)';
    } else if (isHuman) {
      barFill.style.background = 'linear-gradient(90deg, #22c55e, #4ade80)';
    } else {
      barFill.style.background = 'linear-gradient(90deg, #4a5568, #718096)';
    }
    barContainer.appendChild(barFill);

    // Victory Details (shows progress info without needing to click)
    const detailsDiv = document.createElement('div');
    detailsDiv.style.marginTop = '8px';
    detailsDiv.style.fontSize = '10px';
    detailsDiv.style.color = '#cbd5e0';
    detailsDiv.style.fontFamily = 'var(--font-sans)';
    detailsDiv.style.lineHeight = '1.3';
    const winDescHtml = fac?.winDesc ? `<div style="color:#a0aec0; margin-bottom:3px; font-size:9px;">Goal: ${fac.winDesc}</div>` : '';
    detailsDiv.innerHTML = `${winDescHtml}<div style="font-family:var(--font-mono); color:var(--accent-yellow); letter-spacing:0.5px;">PROGRESS: ${desc}</div>`;
    playerDiv.appendChild(headerDiv);
    playerDiv.appendChild(statsDiv);
    playerDiv.appendChild(barContainer);
    playerDiv.appendChild(detailsDiv);
    container.appendChild(playerDiv);
  });
}
function onNodeSelected(nodeId) {
  SFX.playNodeSelect();
  const node = G.nodes[nodeId];
  if (!node) return;

  // Check if player is selecting an attacker
  if (isMyTurn() && node.owner === HUMAN_ID) {
    selectedAttackerNodeId = nodeId;
  }

  // If player is selecting an attacker vs a target (Hand card)
  if (isMyTurn() && canSpendAction() && mySelectedHandCardIndex !== null) {
    if (node.owner === HUMAN_ID && getFreeArrows(G.nodes, nodeId) > 0) {
      updateDetailsPanel();
      updateUI();
      return;
    }
  }
  mySelectedNodeId = nodeId;
  mySelectedHandCardIndex = null;

  // Auto-select attacker if clicking enemy/neutral node
  if (isMyTurn() && canSpendAction()) {
    const node = G.nodes[nodeId];
    if (node && node.owner !== HUMAN_ID) {
      // Keep selected attacker if valid, otherwise clear it to auto-pick
      if (selectedAttackerNodeId && G.nodes[selectedAttackerNodeId] && G.nodes[selectedAttackerNodeId].owner === HUMAN_ID) {
        // Valid attacker already selected
      } else {
        selectedAttackerNodeId = null; // will be auto-picked
      }
    } else if (node && node.owner === HUMAN_ID) {
      selectedAttackerNodeId = node.id; // viewing own node, set as attacker
    }
  }
  refreshAll();

  // ─── Tutorial notification ───
  if (isTutorialMode && tutorial.isActive()) {
    tutorial.notify('node_selected', {
      node,
      humanId: HUMAN_ID
    });
  }
}

/**
 * Called when a node is drag-released on the graph.
 * During drag (previewOnly: true) — compute and return the snap preview.
 * On release (previewOnly: false) — commit the last known preview to game state.
 */
function onNodeDragged(nodeId, newX, newY, options = {}) {
  if (!G || !G.nodes[nodeId]) return null;
  const node = G.nodes[nodeId];

  // Loose Neutral Cards can be moved freely by anyone to organize the board
  const isLooseNeutral = !node.owner && !node.parentId && node.type !== 'root';

  // Check if player has Feed Tuning passive (Algorithmic Overlords)
  const myFactionId = G.players[HUMAN_ID]?.factionId;
  const hasFeedTuning = myFactionId === 'f_algo';

  // Normal rule: must own the node. Feed Tuning exception: can rearrange a rival node,
  // but only within that rival's own network.
  const canMoveNode = node.owner === HUMAN_ID || hasFeedTuning;
  const isOwnedMovable = isMyTurn() && canMoveNode && node.type !== 'root';
  const isLegalDrag = isOwnedMovable || isLooseNeutral;
  if (!isLegalDrag) {
    clearRearrangePreview();
    refreshAll();
    return null;
  }

  // Handle Loose Neutral Free Movement
  if (isLooseNeutral) {
    if (options.previewOnly) {
      // Free movement preview - no snapping
      return {
        nodeId,
        snapped: false,
        previewNodes: {
          [nodeId]: {
            ...node,
            x: newX,
            y: newY
          }
        }
      };
    } else {
      // Commit free movement
      node.x = newX;
      node.y = newY;
      refreshAll();
      syncState();
      return null; // Return null since it's not a snap solution
    }
  }

  // During drag: compute preview
  if (options.previewOnly) {
    return updateRearrangePreview(nodeId, newX, newY);
  }

  // On release: use the last computed preview state (from the most recent drag frame)
  const preview = rearrangePreviewState;
  if (!preview || preview.nodeId !== nodeId) {
    // Try one more time at the release position
    const freshPreview = updateRearrangePreview(nodeId, newX, newY);
    if (!freshPreview) {
      clearRearrangePreview();
      logEvent('No legal port slot available there — try another arrow with more room.', 'failure');
      refreshAll();
      return null;
    }
  }
  const finalPreview = rearrangePreviewState;
  if (!finalPreview || !finalPreview.solution || !finalPreview.snapped) {
    clearRearrangePreview();
    if (finalPreview && !finalPreview.snapped) {
      // Card wasn't close enough to snap — just reset to original position
    } else {
      logEvent('No legal port slot available — drag closer to a free arrow.', 'failure');
    }
    refreshAll();
    return null;
  }
  const parentNode = G.nodes[finalPreview.parentId];
  if (!parentNode) {
    clearRearrangePreview();
    refreshAll();
    return null;
  }

  // Don't commit if it's the same parent and same port (no-op)
  const currentParentPortSide = node.parentPortSide;
  const isSameSlot = finalPreview.parentId === node.parentId && finalPreview.solution.parentPortSide === currentParentPortSide;
  if (isSameSlot && !finalPreview.cascade) {
    clearRearrangePreview();
    refreshAll();
    return finalPreview;
  }
  let backupNodes = null;
  if (finalPreview.cascade) {
    backupNodes = JSON.parse(JSON.stringify(G.nodes));
    // Execute the sibling move first
    const sib = finalPreview.cascade.siblingToMove;
    const sibSol = finalPreview.cascade.siblingSolution;

    // Propagate transforms to sibling's children before moving sibling itself
    const dRot = sibSol.rotationSteps - (sib.rotationSteps || 0);
    const transformStack = [{
      node: sib,
      prevX: sib.x,
      prevY: sib.y,
      dRot
    }];

    // Execute sibling move
    sib.x = sibSol.x;
    sib.y = sibSol.y;
    sib.rotationSteps = sibSol.rotationSteps;
    sib.parentPortSide = sibSol.parentPortSide;
    while (transformStack.length > 0) {
      const {
        node,
        prevX,
        prevY,
        dRot
      } = transformStack.pop();
      const children = Object.values(G.nodes).filter(c => c.parentId === node.id);
      for (const child of children) {
        const childOldX = child.x;
        const childOldY = child.y;
        const childOldRot = child.rotationSteps || 0;
        const dx = childOldX - prevX;
        const dy = childOldY - prevY;
        const angle = dRot * (Math.PI / 2);
        child.x = node.x + (dx * Math.cos(angle) - dy * Math.sin(angle));
        child.y = node.y + (dx * Math.sin(angle) + dy * Math.cos(angle));
        child.rotationSteps = (childOldRot + dRot + 4) % 4;
        transformStack.push({
          node: child,
          prevX: childOldX,
          prevY: childOldY,
          dRot
        });
      }
    }
    logEvent(`🔀 Cascade Move: ${sib.name} nudged to make room.`, 'info');
  }
  const moved = moveSubtreeWithAttachment(nodeId, parentNode, finalPreview.solution, node.owner);
  if (!moved) {
    if (backupNodes) {
      G.nodes = backupNodes; // Restore from cascade mutation
    }
    clearRearrangePreview();
    logEvent('That rearrangement is not legal there.', 'failure');
    refreshAll();
    return null;
  }
  if (node.owner !== HUMAN_ID) {
    const attackerName = G.players[HUMAN_ID]?.name || 'Unknown';
    const targetName = G.players[node.owner]?.name || 'rival';
    networkLog(`💻 Feed Tuning: ${attackerName} maliciously re-routed ${node.name} within ${targetName}'s network!`, 'warning');
  } else {
    logEvent(`🔀 Re-routed ${node.name} to ${parentNode.name}.`, 'success');
  }
  clearRearrangePreview();
  mySelectedNodeId = nodeId;
  selectedAttackerNodeId = node.owner === HUMAN_ID ? nodeId : null;
  refreshAll();
  syncState();
  return finalPreview;
}

// ═══════════════════════════════════════
//  DETAILS PANEL
// ═══════════════════════════════════════
function updateDetailsPanel() {
  if (!G) return;
  let node = null,
    isHandCard = false;
  if (mySelectedHandCardIndex !== null) {
    if (mySelectedHandCardIndex === 999) {
      node = G.discardPile[G.discardPile.length - 1];
    } else {
      node = G.players[HUMAN_ID]?.hand[mySelectedHandCardIndex];
    }
    isHandCard = true;
  } else if (mySelectedNodeId) {
    node = G.nodes[mySelectedNodeId];
  }
  if (!node) return;

  // Automatically open the right panel when a node/card is selected
  const rightPanel = document.getElementById('details-panel');
  const toggleRightBtn = document.getElementById('toggle-right-panel');
  if (rightPanel && rightPanel.classList.contains('collapsed')) {
    rightPanel.classList.remove('collapsed');
    if (toggleRightBtn) toggleRightBtn.innerText = '▶';
    setTimeout(() => {
      if (phaserGame && phaserGame.scale) phaserGame.scale.resize(phaserGame.scale.parentSize.width, phaserGame.scale.parentSize.height);
    }, 310);
  }
  panelPlaceholder.style.display = 'none';
  nodeDetails.style.display = 'block';
  targetName.innerText = `${node.name.toUpperCase()}`;
  const alignStr = node.alignments?.length ? `⚖️ ${node.alignments.join(', ')} ` : '';
  // Show ability status for owned nodes
  let abilityStatus = '';
  if (!isHandCard && node.owner) {
    const defMod = getDefenseAbilityModifier(G.nodes, node, G._networkBlackout);
    if (defMod > 0) abilityStatus += `<span style="color:var(--accent-red);">🛡️ Def +${defMod}</span> `;
  }
  // Show "DEPLOYED" indicator for nodes that have acted this round
  let deployedBadge = '';
  if (!isHandCard && node.hasActedThisRound && node.owner === HUMAN_ID) {
    deployedBadge = `<div style="font-family:var(--font-mono);font-size:11px;color:#718096;background:rgba(255,255,255,0.05);border:1px solid #4a5568;border-radius:4px;padding:3px 8px;display:inline-block;margin-bottom:4px;">⏳ DEPLOYED THIS ROUND</div><br/>`;
  }
  targetDesc.innerHTML = `${deployedBadge}${alignStr}${abilityStatus}<br/><span style="color:#718096">${node.desc || ''}</span>`;

  // Calculate effective stats vs base to color code
  const isBoardNode = node.id && node.parentId !== undefined;
  const baseCard = isBoardNode ? DECK.find(c => c.id === node.id) || node : node;
  let powStr = node.power || 0;
  if (isBoardNode && powStr > (baseCard.power || 0)) powStr = `<span style="color:var(--accent-green); cursor:help;" title="Base Power: ${baseCard.power || 0}">${powStr} ▲</span>`;else if (isBoardNode && powStr < (baseCard.power || 0)) powStr = `<span style="color:var(--accent-red); cursor:help;" title="Base Power: ${baseCard.power || 0}">${powStr} ▼</span>`;
  let resStr = node.resistance || 0;
  if (isBoardNode && resStr > (baseCard.resistance || 0)) resStr = `<span style="color:var(--accent-green); cursor:help;" title="Base Resistance: ${baseCard.resistance || 0}">${resStr} ▲</span>`;else if (isBoardNode && resStr < (baseCard.resistance || 0)) resStr = `<span style="color:var(--accent-red); cursor:help;" title="Base Resistance: ${baseCard.resistance || 0}">${resStr} ▼</span>`;
  let incStr = `₿${node.income || 0}`;
  if (isBoardNode && (node.income || 0) > (baseCard.income || 0)) incStr = `<span style="color:var(--accent-green); cursor:help;" title="Base Income: ₿${baseCard.income || 0}">${incStr} ▲</span>`;else if (isBoardNode && (node.income || 0) < (baseCard.income || 0)) incStr = `<span style="color:var(--accent-red); cursor:help;" title="Base Income: ₿${baseCard.income || 0}">${incStr} ▼</span>`;
  targetPower.innerHTML = powStr;
  targetResistance.innerHTML = resStr;
  targetIncome.innerHTML = incStr;

  // Target Owner & BTC info
  if (node.type === 'root') {
    const p = G.players[node.owner];
    targetOwnerEl.innerText = p ? p.name.toUpperCase() : 'UNKNOWN';
    targetOwnerEl.style.color = node.owner === HUMAN_ID ? 'var(--accent-green)' : 'var(--accent-red)';
    targetBtcEl.innerHTML = `Path ₿TC: <span style="color:var(--accent-yellow);">₿${getControlPathBtc(G.nodes, node.id)}</span>`;
  } else {
    if (isHandCard) {
      targetOwnerEl.innerText = 'IN YOUR HAND';
      targetOwnerEl.style.color = '#718096';
      targetBtcEl.innerHTML = `Play to table first`;
    } else if (node.owner) {
      const p = G.players[node.owner];
      targetOwnerEl.innerText = p ? p.name.toUpperCase() : 'UNKNOWN';
      targetOwnerEl.style.color = node.owner === HUMAN_ID ? 'var(--accent-green)' : 'var(--accent-red)';
      const pathBtc = getControlPathBtc(G.nodes, node.id);
      targetBtcEl.innerHTML = `Path ₿TC: <span style="color:var(--accent-yellow);">₿${pathBtc}</span>`;
    } else {
      targetOwnerEl.innerText = 'UNCONTROLLED';
      targetOwnerEl.style.color = '#718096';
      targetBtcEl.innerHTML = `Path ₿TC: <span style="color:var(--accent-yellow);">₿0</span>`;
    }
  }

  // Determine attacker options based on target
  const isOwned = !isHandCard && node.owner === HUMAN_ID;
  const isEnemyOwned = !isHandCard && node.owner && node.owner !== HUMAN_ID;
  const isNeutral = !isHandCard && !node.owner;
  const isRoot = node.type === 'root';

  // Buttons
  btnAttackControl.style.display = 'none';
  btnAttackNeutralize.style.display = 'none';
  btnAttackDestroy.style.display = 'none';
  btnTransferBtc.style.display = 'none';
  btnMoveGroup.style.display = 'none';
  btnGroupAbility.style.display = 'none';
  let attackStrength = 0;
  let alignPenalty = 0;
  const myBtc = getPlayerTotalBtc(HUMAN_ID);

  // Get all of my nodes that could potentially attack
  const allOwned = Object.values(G.nodes).filter(n => n.owner === HUMAN_ID);
  const slotsAvail = allOwned.filter(n => getFreeArrows(G.nodes, n.id) > 0);

  // For control attacks: need free slots. For neutralize/destroy: any owned node works.
  const slotsAvailForAttack = getNodesWithFreeSlots(HUMAN_ID);
  const allOwnedForAttack = getAllOwnedNodes(HUMAN_ID);
  // Use allOwnedForAttack for enemy targets (neutralize/destroy don't need slots), slotsAvailForAttack for hand cards & neutral
  const attackerCandidatesFinal = isHandCard || isNeutral ? slotsAvailForAttack : isEnemyOwned ? allOwnedForAttack : slotsAvailForAttack;
  let finalChosenAttacker = null;

  // ═══ SINGLE-PASS ATTACKER RESOLUTION ═══
  // Resolve the attacker ONCE so all UI elements (buttons, dropdown, info) use the same source of truth.
  if (isHandCard || isEnemyOwned || isNeutral) {
    if (selectedAttackerNodeId && G.nodes[selectedAttackerNodeId]?.owner === HUMAN_ID) {
      finalChosenAttacker = G.nodes[selectedAttackerNodeId];
    } else if (attackerCandidatesFinal.length > 0) {
      // Auto-pick best attacker (highest own Power + alignment) ONLY if user hasn't selected one
      const ranked = attackerCandidatesFinal.map(n => ({
        node: n,
        str: getAttackStrength(G.nodes, n.id, G._networkBlackout),
        pen: getAlignmentPenalty(n.alignments || [], node.alignments || [])
      })).sort((a, b) => b.str + b.pen - (a.str + a.pen));
      finalChosenAttacker = ranked[0].node;
      if (finalChosenAttacker) {
        selectedAttackerNodeId = finalChosenAttacker.id;
      }
    }
    if (finalChosenAttacker && isMyTurn() && canSpendAction()) {
      attackStrength = getAttackStrength(G.nodes, finalChosenAttacker.id, G._networkBlackout);
      alignPenalty = getAlignmentPenalty(finalChosenAttacker.alignments || [], node.alignments || []);
    }
  }
  if (isHandCard && node.type === 'action') {
    // Action card — show Play Action button (FREE ACTION — can be played ANYTIME)
    btnAttackControl.style.display = 'block';
    btnAttackControl.className = 'action-btn';

    // Show pending buff info if any
    const pendingBuffs = G._actionBuffs?.[HUMAN_ID];
    let buffInfo = '';
    if (pendingBuffs) {
      const parts = [];
      if (pendingBuffs.nextAttackPower) parts.push(`+${pendingBuffs.nextAttackPower}P`);
      if (pendingBuffs.viralFrenzy) parts.push('📈 Viral');
      if (pendingBuffs.nostalgiaBomb) parts.push('📼 Nostalgia');
      if (parts.length > 0) buffInfo = ` · Buffs: ${parts.join(', ')}`;
    }
    btnAttackControl.innerHTML = `⚡ PLAY ACTION <span class="btn-meta">Instant Action · Discarded After${buffInfo}</span>`;
    btnAttackControl.disabled = false;
    btnAttackControl.style.borderColor = 'var(--accent-yellow)';
    btnAttackControl.style.color = 'var(--accent-yellow)';
    btnAttackControl.style.background = 'rgba(234,179,8,0.1)';
  } else if (isHandCard) {
    btnAttackControl.style.display = 'block';
    btnAttackControl.className = 'action-btn';
    if (isMyTurn() && canSpendAction()) {
      const remaining = actionsRemaining();
      btnAttackControl.innerHTML = `🎯 PLAY TO TABLE <span class="btn-meta">Costs 1 action · ${remaining} left · enters as neutral</span>`;
      btnAttackControl.disabled = false;
    } else if (isMyTurn()) {
      btnAttackControl.innerHTML = `🎯 PLAY TO TABLE <span class="btn-meta">No actions left this turn</span>`;
      btnAttackControl.disabled = true;
    } else {
      btnAttackControl.innerHTML = `🎯 PLAY TO TABLE <span class="btn-meta">Waiting for turn</span>`;
      btnAttackControl.disabled = true;
    }
  } else if (isEnemyOwned || isNeutral) {
    const hasControlSlots = finalChosenAttacker ? getFreeArrows(G.nodes, finalChosenAttacker.id) > 0 : false;
    const hasAnyAttacker = finalChosenAttacker !== null;
    updateAttackButton(btnAttackControl, {
      label: '🎯 ATTACK TO CONTROL',
      attackType: ATTACK_TYPES.CONTROL,
      node,
      isHandCard,
      isOwned,
      isEnemyOwned,
      isNeutral,
      isRoot,
      attackStrength,
      alignPenalty,
      myBtc,
      hasSlots: hasControlSlots,
      chosenAttacker: finalChosenAttacker
    });
    updateAttackButton(btnAttackNeutralize, {
      label: '💫 NEUTRALIZE',
      attackType: ATTACK_TYPES.NEUTRALIZE,
      node,
      isHandCard,
      isOwned,
      isEnemyOwned,
      isNeutral,
      isRoot,
      attackStrength,
      alignPenalty,
      myBtc,
      hasSlots: hasAnyAttacker,
      chosenAttacker: finalChosenAttacker
    });
    updateAttackButton(btnAttackDestroy, {
      label: '💀 DESTROY',
      attackType: ATTACK_TYPES.DESTROY,
      node,
      isHandCard,
      isOwned,
      isEnemyOwned,
      isNeutral,
      isRoot,
      attackStrength,
      alignPenalty,
      myBtc,
      hasSlots: hasAnyAttacker,
      chosenAttacker: finalChosenAttacker
    });
  }
  if (isOwned) {
    // Crypto Cult passive: free unlimited transfers
    const myFac = G.players[HUMAN_ID]?.factionId;
    const isCryptoPassive = myFac === 'f_crypto';
    if ((node.btc || 0) > 0) {
      btnTransferBtc.style.display = 'block';
      const freeLeft = transfersFreeRemaining();
      const actionsLeft = actionsRemaining();
      if (isCryptoPassive) {
        btnTransferBtc.innerHTML = `💱 TRANSFER ₿TC <span class="btn-meta">Free (Fluid Tokenomics)</span>`;
        btnTransferBtc.disabled = false;
      } else if (freeLeft > 0) {
        btnTransferBtc.innerHTML = `💱 TRANSFER ₿TC <span class="btn-meta">Free · ${freeLeft} free left</span>`;
        btnTransferBtc.disabled = false;
      } else if (actionsLeft > 0) {
        btnTransferBtc.innerHTML = `💱 TRANSFER ₿TC <span class="btn-meta">Costs 1 action · ${actionsLeft} left</span>`;
        btnTransferBtc.disabled = !isMyTurn();
      } else {
        btnTransferBtc.innerHTML = `💱 TRANSFER ₿TC <span class="btn-meta">No actions left</span>`;
        btnTransferBtc.disabled = true;
      }
    }
    if (!isRoot) {
      btnMoveGroup.style.display = 'block';
      const actionsLeft = actionsRemaining();
      if (!isMyTurn()) {
        btnMoveGroup.innerHTML = `🔀 MOVE GROUP <span class="btn-meta">Waiting for turn</span>`;
        btnMoveGroup.disabled = true;
      } else if (actionsLeft > 0) {
        btnMoveGroup.innerHTML = `🔀 MOVE GROUP <span class="btn-meta">Costs 1 action · ${actionsLeft} left</span>`;
        btnMoveGroup.disabled = false;
      } else {
        btnMoveGroup.innerHTML = `🔀 MOVE GROUP <span class="btn-meta">No actions left</span>`;
        btnMoveGroup.disabled = true;
      }
    }
    if (isMyTurn() && ACTIVE_GROUP_ABILITIES[node.id]) {
      const activeAbility = ACTIVE_GROUP_ABILITIES[node.id];
      btnGroupAbility.style.display = 'block';
      if (node.abilityUsedThisTurn) {
        btnGroupAbility.innerHTML = `📢 ABILITY USED <span class="btn-meta">${activeAbility.name}</span>`;
        btnGroupAbility.disabled = true;
        btnGroupAbility.style.borderColor = '#4a5568';
        btnGroupAbility.style.color = '#718096';
      } else if (isAbilityCancelled(G.nodes, node)) {
        btnGroupAbility.innerHTML = `🚫 CANCELLED <span class="btn-meta">Sabotaged this turn</span>`;
        btnGroupAbility.disabled = true;
        btnGroupAbility.style.borderColor = 'var(--accent-red)';
        btnGroupAbility.style.color = 'var(--accent-red)';
      } else {
        btnGroupAbility.innerHTML = `📢 ACTIVE ABILITY <span class="btn-meta">${activeAbility.icon} ${activeAbility.name}</span>`;
        btnGroupAbility.disabled = false;
        btnGroupAbility.style.borderColor = 'var(--accent-purple)';
        btnGroupAbility.style.color = 'var(--accent-purple)';
      }
    }
  }

  // Build helper text to explain what's going on
  const opsDesc = document.getElementById('ops-desc');
  if (isHandCard) {
    if (opsDesc) opsDesc.innerHTML = `<span style="font-size:11px;color:var(--accent-yellow);">Play this card to the table as an uncontrolled group to interact with it.</span>`;
  } else if (isRoot) {
    if (opsDesc) opsDesc.innerHTML = `Faction roots cannot be directly attacked.`;
  } else if (isOwned) {
    const chainStr = getAncestorChain(G.nodes, node.id).map(n => n.name).join(' → ');
    if (opsDesc) opsDesc.innerHTML = `Transfer Power: <strong>${node.transferPower || 0}</strong> · Attack Str: <strong>${getAttackStrength(G.nodes, node.id, G._networkBlackout)}</strong><br/><span style="font-size:10px;color:#4a5568;">${chainStr}</span>`;
  } else if ((isEnemyOwned || isNeutral) && finalChosenAttacker) {
    const breakdown = getAlignmentBreakdown(finalChosenAttacker.alignments || [], node.alignments || []);
    let bStr = '';
    if (breakdown.length > 0) {
      bStr = '<br/><span style="font-size:10px;">Alignments: ' + breakdown.map(b => {
        const color = b.value > 0 ? 'var(--accent-green)' : 'var(--accent-red)';
        const sign = b.value > 0 ? '+' : '';
        return `<span style="color:${color}">${b.attacker} vs ${b.target} (${sign}${b.value})</span>`;
      }).join(' | ') + '</span>';
    }
    let algoStr = '';
    if (G.players[HUMAN_ID].factionId === 'f_algo' && !G.factionAbilityUsed[HUMAN_ID]) {
      const bonus = getAlgoManipulationBonus('f_algo', node.alignments || []);
      if (bonus > 0) algoStr = `<br/><span style="font-size:10px;color:var(--accent-purple);">🔮 Predictive Manipulation: R-${bonus}</span>`;
    }

    // Show pending action buffs
    let buffStr = '';
    const pendBuffs = G._actionBuffs?.[HUMAN_ID];
    if (pendBuffs) {
      const parts = [];
      if (pendBuffs.nextAttackPower) parts.push(`+${pendBuffs.nextAttackPower}P`);
      if (pendBuffs.viralFrenzy) {
        const isMedia = node.alignments?.includes('Media');
        parts.push(`📈 Viral ${isMedia ? '+7' : '+3'}`);
      }
      if (pendBuffs.nostalgiaBomb) {
        const isLC = node.alignments?.some(a => ['Legacy', 'Cultural'].includes(a));
        parts.push(`📼 Nostalgia ${isLC ? '+5' : '(no match)'}`);
      }
      if (parts.length > 0) buffStr = `<br/><span style="font-size:10px;color:var(--accent-yellow);">⚡ Action Buffs: ${parts.join(', ')}</span>`;
    }
    if (opsDesc) opsDesc.innerHTML = `Attacking with: <strong style="color:var(--accent-blue);cursor:pointer;" onclick="onNodeSelected('${finalChosenAttacker.id}')">${finalChosenAttacker.name}</strong>${bStr}${algoStr}${buffStr}`;
  } else {
    if (opsDesc) opsDesc.innerHTML = `No valid attacking groups.`;
  }
  const arrowsEl = document.getElementById('target-arrows');
  if (arrowsEl) {
    if (isHandCard) {
      const slots = node.arrows || 1;
      const dots = '●'.repeat(slots) + '○'.repeat(Math.max(0, 4 - slots));
      arrowsEl.innerHTML = `🔗 ${slots} control slot${slots > 1 ? 's' : ''} <span style="letter-spacing:2px;">${dots}</span>`;
    } else {
      const used = getChildCount(G.nodes, node.id);
      const max = node.arrows || (node.type === 'root' ? 4 : 1);
      const free = max - used;
      const dots = `<span style="color:var(--accent-green)">${'●'.repeat(used)}</span><span style="color:#4a5568">${'○'.repeat(free)}</span>`;
      arrowsEl.innerHTML = `🔗 ${used}/${max} slots <span style="letter-spacing:2px;">${dots}</span>${free > 0 ? ` <span style="color:var(--accent-green);font-size:10px;">(${free} free)</span>` : ` <span style="color:var(--accent-red);font-size:10px;">(FULL)</span>`}`;
    }
  }

  // Owner
  if (targetOwnerEl) {
    if (isHandCard) {
      targetOwnerEl.innerText = 'IN YOUR HAND';
      targetOwnerEl.style.color = '#718096';
    } else if (node.owner === HUMAN_ID) {
      targetOwnerEl.innerText = 'YOU CONTROL THIS';
      targetOwnerEl.style.color = 'var(--accent-green)';
    } else if (node.owner) {
      const op = G.players[node.owner];
      targetOwnerEl.innerText = `CONTROLLED BY: ${op?.name || 'UNKNOWN'}`;
      targetOwnerEl.style.color = 'var(--accent-red)';
    } else {
      targetOwnerEl.innerText = 'UNCONTROLLED';
      targetOwnerEl.style.color = '#718096';
    }
  }

  // BTC
  if (targetBtcEl) {
    if (!isHandCard && node.owner === HUMAN_ID) {
      const pathBtc = getControlPathBtc(G.nodes, node.id);
      targetBtcEl.style.display = 'block';
      targetBtcEl.innerHTML = `₿${node.btc || 0} on this card · <span style="color:var(--accent-yellow);">₿${pathBtc} path available</span>`;
    } else targetBtcEl.style.display = 'none';
  }

  // ─── ATTACKER SELECTION UI ───
  // (Attacker was already resolved in the single-pass block above)
  const attackerSelectEl = document.getElementById('attacker-select');
  const attackerInfoEl = document.getElementById('attacker-info');

  // Show attacker selector
  if (attackerSelectEl) {
    if ((isHandCard || isEnemyOwned || isNeutral) && attackerCandidatesFinal.length > 0 && isMyTurn() && canSpendAction()) {
      attackerSelectEl.style.display = 'block';
      attackerSelectEl.innerHTML = '<label style="font-family:var(--font-mono);font-size:11px;color:#718096;">ATTACKING WITH:</label>';
      const sel = document.createElement('select');
      sel.className = 'transfer-input';
      sel.style.marginTop = '4px';
      sel.style.marginBottom = '8px';
      // Show all owned for enemy targets, only free-slot nodes for hand/neutral
      const listForSelect = isEnemyOwned ? allOwnedForAttack : slotsAvailForAttack;
      listForSelect.forEach(n => {
        const str = getAttackStrength(G.nodes, n.id, G._networkBlackout);
        const pen = getAlignmentPenalty(n.alignments || [], node.alignments || []);
        const free = getFreeArrows(G.nodes, n.id);
        const abilMod = getAttackAbilityModifier(G.nodes, n, node, G._networkBlackout);
        const cpBtc = getControlPathBtc(G.nodes, n.id);
        const opt = document.createElement('option');
        opt.value = n.id;
        const penLabel = pen > 0 ? ` +${pen}⚖` : pen < 0 ? ` ${pen}⚖` : '';
        const lockLabel = n._cannotAttackThisRound ? '🔒 LOCKED ' : '';
        opt.textContent = `${lockLabel}${n.icon || '🌐'} ${n.name} (Str:${str}${abilMod > 0 ? '+' + abilMod + '⚡' : ''}${penLabel} | ${free}🔗 | ₿${cpBtc}path)`;
        if (n._cannotAttackThisRound) opt.style.color = '#718096';
        if (finalChosenAttacker && finalChosenAttacker.id === n.id) {
          opt.selected = true;
        }
        sel.appendChild(opt);
      });
      sel.onchange = () => {
        selectedAttackerNodeId = sel.value;
        // We must refresh so updateAttackButton recalculates attackStrength properly
        refreshAll();
      };
      attackerSelectEl.appendChild(sel);

      // Show attacker info — OMNIS rules: only attacker's own Power counts
      // IMPORTANT: Use appendChild with a DOM element instead of innerHTML += 
      // because innerHTML += would destroy the <select> and its onchange handler.
      if (finalChosenAttacker) {
        const abilMod = getAttackAbilityModifier(G.nodes, finalChosenAttacker, node);
        const abilText = abilMod > 0 ? ` <span style="color:var(--accent-purple)">+${abilMod}⚡ ability</span>` : '';
        // Global combat bonuses (Esports, Astrology, Global Events)
        const gReroll = hasEsportsReroll(G.nodes, HUMAN_ID);
        const gDieMod = getAstrologyModifier(G.nodes, HUMAN_ID);
        const gPanic = G._globalPanicActive;
        const gViral = G._viralThreadActive && finalChosenAttacker.alignments?.includes('Media');
        const globalBonuses = gReroll || gDieMod || gPanic || gViral ? ` ${gReroll ? '🎮reroll' : ''}${gDieMod ? ' ✨+1die' : ''}${gPanic ? ' 😱+2P' : ''}${gViral ? ' 🧵+5P' : ''}` : '';
        // Alignment breakdown
        const alignBD = getAlignmentBreakdown(finalChosenAttacker.alignments || [], node.alignments || []);
        let alignHtml = '';
        if (alignBD.length > 0) {
          const parts = alignBD.map(p => {
            if (p.type === 'match') return `<span style="color:#4ade80">+4 ${p.attacker}✓</span>`;
            if (p.type === 'opposed') return `<span style="color:#ef4444">-4 ${p.attacker}↔${p.target}</span>`;
            return `<span style="color:#eab308">-2 ${p.attacker}⚡${p.target}</span>`;
          });
          alignHtml = ` Align: ${parts.join(' ')} = <span style="color:${alignPenalty >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'}">${alignPenalty > 0 ? '+' : ''}${alignPenalty}</span>`;
        }
        // Control-path BTC available for this attacker
        const chain = getAncestorChain(G.nodes, finalChosenAttacker.id);
        const cpBtc = getControlPathBtc(G.nodes, finalChosenAttacker.id);
        const cpBtcHtml = `<br/>💰 Path ₿TC: <span style="color:var(--accent-yellow)">${cpBtc}</span> <span style="color:#4a5568">(${chain.map(n => `${n.name.substring(0, 8)}:₿${n.btc || 0}`).join(' → ')})</span>`;
        const infoDiv = document.createElement('div');
        infoDiv.style.fontSize = '10px';
        infoDiv.style.color = '#718096';
        infoDiv.style.marginBottom = '8px';
        infoDiv.innerHTML = `Attacker: <strong>${finalChosenAttacker.name}</strong> (P:${finalChosenAttacker.power || 0})<br/>Own Power: <span style="color:var(--accent-green)">${attackStrength}</span>${abilText}${alignHtml}${cpBtcHtml}${globalBonuses ? `<br/><span style="color:var(--accent-purple)">${globalBonuses.trim()}</span>` : ''}`;
        attackerSelectEl.appendChild(infoDiv);
      }
    } else {
      attackerSelectEl.style.display = 'none';
    }
  }
  attackResult.style.display = 'none';
  attackResult.className = 'attack-result';
}
function updateAttackButton(btn, opts) {
  if (!btn) return;
  const {
    label,
    attackType,
    node,
    isHandCard,
    isOwned,
    isEnemyOwned,
    isNeutral,
    isRoot,
    attackStrength,
    alignPenalty,
    myBtc,
    hasSlots,
    chosenAttacker
  } = opts;
  // Include passive ability modifiers in the displayed chance
  const atkAbility = chosenAttacker ? getAttackAbilityModifier(G.nodes, chosenAttacker, node, G._networkBlackout) : 0;
  let defAbility = !isHandCard && node.id ? getDefenseAbilityModifier(G.nodes, node, G._networkBlackout) : 0;
  const loyaltyPts = getLoyaltyPointsBonus(G.nodes, HUMAN_ID);
  let distBonus = !isHandCard && chosenAttacker && node.owner ? (getDistanceToFaction(G.nodes, node.id) - getDistanceToFaction(G.nodes, chosenAttacker.id)) * 5 : 0;

  // Dark Web Marketplace: Ignore Resistance bonuses when attacking
  const hasDarkWeb = chosenAttacker ? hasPassiveAlias(G.nodes, chosenAttacker, 'n_darkweb') && !isAbilityCancelled(G.nodes, chosenAttacker) : false;
  if (hasDarkWeb) {
    if (defAbility > 0) defAbility = 0;
    if (distBonus > 0) distBonus = 0;
  }

  // Faction ability: Algo Predictive Manipulation Engine preview
  const myFacId = G.players[HUMAN_ID]?.factionId;
  const algoPreview = !G.factionAbilityUsed[HUMAN_ID] ? getAlgoManipulationBonus(myFacId, node.alignments || []) : 0;

  // Compute final strength with 0 BTC spent (base preview)
  let targetBaseRes = getEffectiveResistance(G.nodes, node.id, G._networkBlackout) - defAbility - algoPreview;
  if (attackType === ATTACK_TYPES.NEUTRALIZE) {
    targetBaseRes = Math.ceil(targetBaseRes / 2);
  } else if (attackType === ATTACK_TYPES.DESTROY && node.owner) {
    targetBaseRes *= 2;
  }

  // ═══ Global Event Combat Modifiers (Button Preview) ═══
  let eventBonus = 0;
  if (G._globalPanicActive) eventBonus += 2;
  if (G._viralThreadActive && chosenAttacker && chosenAttacker.alignments?.includes('Media')) eventBonus += 5;
  const finalStr = computeAttackStrength({
    attackerPower: attackStrength + atkAbility + loyaltyPts + eventBonus,
    targetResistance: targetBaseRes,
    defenseAbilityMod: 0,
    // already handled in targetBaseRes
    alignmentModifier: alignPenalty,
    isEndgame: G.isEndgame,
    distanceBonus: distBonus
  });
  // Factor in Astrology die modifier for displayed chance
  const btnDieMod = getAstrologyModifier(G.nodes, HUMAN_ID);
  const chance = getSuccessChance(finalStr + (btnDieMod ? -btnDieMod : 0));
  const btnHasReroll = hasEsportsReroll(G.nodes, HUMAN_ID);
  let canAttack = false,
    btnText = label,
    show = true;
  if (!isMyTurn()) {
    btnText = 'WAIT';
  } else if (!canSpendAction()) {
    btnText = 'NO ACTIONS LEFT';
  } else if (isHandCard) {
    if (attackType !== ATTACK_TYPES.CONTROL) {
      show = false;
    } else if (!hasSlots) {
      btnText = 'NO FREE 🔗 SLOTS';
    } else {
      canAttack = true;
    }
  } else if (isOwned) {
    show = false;
  } else if (isRoot) {
    show = attackType !== ATTACK_TYPES.CONTROL;
    canAttack = false;
    btnText = 'FACTION ROOT: IMMUNE';
  } else if (isEnemyOwned) {
    if (G._noAttacksThisRound) {
      canAttack = false;
      btnText = 'CEASEFIRE (EVENT)';
    } else if (G._ceasefireActive) {
      canAttack = false;
      btnText = 'PVP BANNED (EVENT)';
    } else if (node._untargetableThisRound) {
      canAttack = false;
      btnText = '🛡️ FIREWALL (EVENT)';
    } else {
      if (attackType === ATTACK_TYPES.CONTROL) {
        if (G._hostileMoratoriumActive) {
          canAttack = false;
          btnText = 'MORATORIUM (EVENT)';
        } else {
          canAttack = hasSlots;
          if (!canAttack) btnText = 'NO FREE 🔗 SLOTS';
        }
      } else {
        canAttack = true;
      }
      if (canAttack && !chosenAttacker) {
        canAttack = false;
        btnText = 'NO ATTACKER';
      }
      if (canAttack && chosenAttacker && chosenAttacker._cannotAttackThisRound) {
        canAttack = false;
        btnText = '🔒 ATTACKER LOCKED (EVENT)';
      }
    }
  } else if (isNeutral) {
    if (G._noAttacksThisRound) {
      canAttack = false;
      btnText = 'CEASEFIRE (EVENT)';
    } else if (node._untargetableThisRound) {
      canAttack = false;
      btnText = '🛡️ FIREWALL (EVENT)';
    } else {
      if (attackType !== ATTACK_TYPES.CONTROL) {
        show = false;
      } else {
        canAttack = hasSlots;
        if (!canAttack) btnText = 'NO FREE 🔗 SLOTS';
      }
      if (canAttack && !chosenAttacker) {
        canAttack = false;
        btnText = 'NO ATTACKER';
      }
      if (canAttack && chosenAttacker && chosenAttacker._cannotAttackThisRound) {
        canAttack = false;
        btnText = '🔒 ATTACKER LOCKED (EVENT)';
      }
    }
  }
  btn.style.display = show ? 'block' : 'none';
  btn.disabled = !canAttack;
  if (isHandCard && attackType === ATTACK_TYPES.CONTROL) {
    btn.innerHTML = canAttack ? `🚀 DEPLOY GROUP<span class="btn-meta">Uncontested Placement</span>` : btnText;
  } else {
    const effectiveStr = attackStrength + atkAbility + loyaltyPts + eventBonus;
    const abilStr = atkAbility > 0 ? `+${atkAbility}⚡` : '';
    const loyaltyStr = loyaltyPts > 0 ? `+${loyaltyPts}💳` : '';
    const eventStr = eventBonus > 0 ? ` <span style="color:var(--accent-red)">+${eventBonus}🌐</span>` : '';
    const defStr = defAbility > 0 ? ` vs R+${defAbility}🛡` : '';
    const alignStr2 = alignPenalty > 0 ? ` <span style="color:#4ade80">⚖+${alignPenalty}</span>` : alignPenalty < 0 ? ` <span style="color:#ef4444">⚖${alignPenalty}</span>` : '';
    const distStr = distBonus > 0 ? ` <span style="color:#ef4444">📍-${distBonus}</span>` : distBonus < 0 ? ` <span style="color:#4ade80">📍+${Math.abs(distBonus)}</span>` : '';
    const bonusIcons = (btnDieMod ? ' ✨' : '') + (btnHasReroll ? ' 🎮' : '');
    const algoStr = algoPreview > 0 ? ` <span style="color:var(--accent-purple)">🔮R-${algoPreview}</span>` : '';
    // Show control-path BTC available for the chosen attacker
    const pathBtc = chosenAttacker ? getControlPathBtc(G.nodes, chosenAttacker.id) : 0;
    const pathBtcStr = pathBtc > 0 ? ` <span style="color:var(--accent-yellow)">₿${pathBtc}path</span>` : '';
    let typeStr = '';
    if (attackType === ATTACK_TYPES.NEUTRALIZE) typeStr = ' <span style="color:#f59e0b">(R/2)</span>';
    if (attackType === ATTACK_TYPES.DESTROY && isEnemyOwned) typeStr = ' <span style="color:#ef4444">(Rx2)</span>';
    btn.innerHTML = canAttack ? `${label}<span class="btn-meta">${chance.toFixed(0)}% base${bonusIcons} · Str ${effectiveStr}${abilStr}${loyaltyStr}${eventStr}${defStr}${alignStr2}${distStr}${algoStr}${typeStr}${pathBtcStr}</span>` : btnText;
  }
}

// ═══════════════════════════════════════
//  ACTION CARD EXECUTION PIPELINE
// ═══════════════════════════════════════

/**
 * Play an action card from the player's hand.
 * Routes through target selection if needed, then executes the card's effect and discards.
 * Action cards are FREE actions — they don't consume the main action.
 */
function playActionCard(card, handIndex) {
  if (G._cannotPlayActionCardsThisRound) {
    logEvent('🧠 Cognitive Overload! Action cards disabled this round.', 'warning');
    return;
  }
  if (!card || card.type !== 'action') return;

  // Defensive rehydration — if this card came through a sync but the rehydrate
  // step somehow missed it (e.g. id mismatch), re-attach methods now so we
  // don't crash on `card.execute`.
  if (typeof card.execute !== 'function') {
    _rehydrateCardInPlace(card);
    if (typeof card.execute !== 'function') {
      console.error('[playActionCard] Card lacks execute() and could not be rehydrated:', card);
      logEvent('⚠️ Could not play card — definition missing.', 'failure');
      return;
    }
  }

  // ═══ DECK PEEK SPECIAL CASE ═══
  if (card.needsTarget === 'deck_peek') {
    showDeckPeekModal(card, handIndex);
    return;
  }

  // ═══ NO TARGET NEEDED — Execute immediately ═══
  if (!card.needsTarget) {
    const msg = card.execute(G.nodes, HUMAN_ID, null, null, G);
    if (msg) {
      networkVfx(null, null); // We don't have targetId, just standard effects handling
      playActionCardEffects(card, null, null);

      // Broadcast the action card play to other players so they see the overlay

      networkLog(`⚡ ${msg}`, 'success');
      showActionCardResult(card, msg);
      // Also show full-screen overlay for local player too
      showActionCardRevealOverlay(card, G.players[HUMAN_ID].name, msg);
    }
    discardActionCard(handIndex);
    mySelectedHandCardIndex = null;
    // ─── Tutorial: notify action card played ───
    if (isTutorialMode && tutorial.isActive()) {
      tutorial.notify('action_card_played', {
        cardId: card.id
      });
    }
    refreshAll();
    syncState();
    return;
  }

  // ═══ TWO_CONNECTED SPECIAL CASE ═══
  if (card.needsTarget === 'two_connected') {
    showTwoConnectedTargetModal(card, handIndex);
    return;
  }

  // ═══ SINGLE TARGET — Show target selection modal ═══
  showActionCardTargetModal(card, handIndex);
}

/**
 * Show a quick result banner for action card effects.
 */
function showActionCardResult(card, msg, targetInfo = null) {
  const targetText = formatActionTargetInfo(targetInfo);
  const targetLine = targetText ? `<br/><span style="color:var(--accent-blue);font-size:12px;font-family:var(--font-mono);">IMPACTED: ${targetText}</span>` : '';
  attackResult.innerHTML = `<span style="color:var(--accent-yellow);font-size:14px;">⚡ ACTION CARD PLAYED</span><br/><span style="color:var(--text-white);">${card.icon} ${card.name}</span>${targetLine}<br/>${msg}<br/><span style="font-size:10px;color:#4a5568;font-style:italic;">"${card.flavour}"</span>`;
  attackResult.className = 'attack-result success';
  attackResult.style.display = 'block';
  setTimeout(() => {
    attackResult.style.display = 'none';
  }, 4000);
}
function buildActionTargetInfo(targetId, secondTargetId = null) {
  const ids = [targetId, secondTargetId].filter(Boolean);
  const groups = ids.map(nodeId => {
    const node = G?.nodes?.[nodeId];
    if (!node) return null;
    const ownerName = node.owner ? node.owner === HUMAN_ID ? 'YOU' : G.players[node.owner]?.name || 'Unknown' : 'Neutral';
    return {
      id: node.id,
      icon: node.icon || '🌐',
      name: node.name || 'Unknown Group',
      ownerName,
      power: node.power || 0,
      resistance: node.resistance || 0
    };
  }).filter(Boolean);
  return groups.length ? {
    groups
  } : null;
}
function formatActionTargetInfo(targetInfo) {
  const groups = targetInfo?.groups || [];
  if (!groups.length) return '';
  return groups.map(g => `${escapeHTML(g.icon || '🌐')} ${escapeHTML(g.name || 'Unknown Group')} <span style="color:#718096;">[${escapeHTML(g.ownerName || 'Neutral')}]</span>`).join(' <span style="color:#718096;">+</span> ');
}

// ═══════════════════════════════════════
//  ACTION CARD & GLOBAL EVENT REVEAL OVERLAYS
// ═══════════════════════════════════════
function queueRevealOverlay(type, data) {
  revealQueue.push({
    type,
    data
  });
  if (activeReveal) return;
  const showNextQueuedReveal = () => {
    if (activeReveal || revealQueue.length === 0) return;
    const nextReveal = revealQueue.shift();
    if (!nextReveal) return;
    SFX.playSuccess(); // Optional: might want a different sound for Global Event if available

    const overlay = document.createElement('div');
    overlay.className = 'card-reveal-overlay';
    overlay.setAttribute('role', 'dialog');
    let ariaLabel = '';
    if (nextReveal.type === 'actionCard') {
      ariaLabel = `${nextReveal.data.playerName} plays ${nextReveal.data.card?.name || 'an action card'}`;
    } else if (nextReveal.type === 'globalEvent') {
      ariaLabel = `Global Event: ${nextReveal.data.event?.name}`;
    }
    overlay.setAttribute('aria-label', ariaLabel);
    const dismiss = () => {
      if (!activeReveal || activeReveal.overlay !== overlay) return;
      if (activeReveal.dismissed) return;
      activeReveal.dismissed = true;
      if (activeReveal.cleanup) activeReveal.cleanup();
      if (activeReveal.autoTimer) clearTimeout(activeReveal.autoTimer);
      overlay.classList.add('dismissing');
      setTimeout(() => {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        if (activeReveal?.overlay === overlay) {
          activeReveal = null;
        }
        setTimeout(showNextQueuedReveal, 120);
      }, 420);
    };
    let innerContent = '';
    if (nextReveal.type === 'actionCard') {
      const {
        card: queuedCard,
        playerName: queuedPlayerName,
        effectText: queuedEffectText,
        targetInfo: queuedTargetInfo
      } = nextReveal.data;

      // Build full card visuals for each impacted Group so the player can see
      // exactly which group(s) on the board are being affected, alongside the
      // action card itself. We look up the live node so stats reflect the
      // post-effect state where applicable.
      const impactedGroups = queuedTargetInfo?.groups || [];
      const groupCardsHtml = impactedGroups.map(g => {
        const node = G?.nodes?.[g.id];
        if (!node) return '';
        const isAction = node.type === 'action';
        const isRoot = node.type === 'root';
        const ownerLabel = node.owner ? node.owner === HUMAN_ID ? 'YOU' : G.players[node.owner]?.name || 'Unknown' : 'Neutral';
        return `
                    <div class="card-reveal-impacted-card">
                        <div class="card-reveal-impacted-owner">${escapeHTML(ownerLabel)}</div>
                        <div class="playing-card card-reveal-card card-reveal-card--impacted" style="${getPlayingCardStyle(node, isAction)}margin:0;">
                            ${createPlayingCardHTML(node, isAction, isRoot)}
                        </div>
                    </div>
                `;
      }).filter(Boolean).join('');
      const impactedBlockHtml = groupCardsHtml ? `
                <div class="card-reveal-impacted-label">
                    ⮕ IMPACTED GROUP${impactedGroups.length > 1 ? 'S' : ''}
                </div>
                <div class="card-reveal-impacted-row">
                    ${groupCardsHtml}
                </div>
            ` : '';
      innerContent = `
                <div class="card-reveal-player">${queuedPlayerName} PLAYS ACTION CARD</div>

                <div class="card-reveal-cards-stage${groupCardsHtml ? ' has-impacted' : ''}">
                    <div class="card-reveal-card-wrapper">
                        <div class="playing-card card-reveal-card" style="${getPlayingCardStyle(queuedCard, true)}margin:0;">
                            ${createPlayingCardHTML(queuedCard, true)}
                        </div>
                    </div>
                    ${impactedBlockHtml}
                </div>

                <div class="card-reveal-effect">
                    ${queuedEffectText || ''}
                </div>
            `;
    } else if (nextReveal.type === 'globalEvent') {
      const {
        event: queuedEvent,
        effectText: queuedEffectText
      } = nextReveal.data;
      const evImage = queuedEvent.image || 'assets/s-l400.jpg';
      innerContent = `
                <div class="card-reveal-player" style="color: var(--accent-red); font-size: 24px; margin-bottom: 20px; letter-spacing: 4px; text-shadow: 0 0 10px rgba(239,68,68,0.8);">🚨 GLOBAL EVENT 🚨</div>
                
                <div class="card-reveal-card-wrapper" style="box-shadow: 0 0 50px rgba(239, 68, 68, 0.4); border-radius: 12px; margin-top: 10px; margin-bottom: 10px;">
                    <div class="playing-card card-reveal-card" style="margin:0; border-color: var(--accent-red); background: linear-gradient(180deg, #2a0d0d 0%, #1a0808 100%);">
                        <div style="font-size:10px; color: var(--accent-red); font-weight:bold; margin-bottom:4px; text-align:center; text-shadow:1px 1px 0 #000; letter-spacing:2px;">⚠️ GLOBAL EVENT</div>
                        <div class="card-title" style="color: var(--accent-red);">${queuedEvent.name}</div>
                        <img class="card-image" src="${evImage}" alt="${queuedEvent.name}" onerror="this.style.display='none'">
                        <div class="card-desc-box" style="border-color: rgba(239,68,68,0.4); background: rgba(239,68,68,0.08); color:#fef2f2;">
                            ${queuedEvent.desc || ''}
                        </div>
                        <div class="card-footer" style="color: var(--accent-red); text-align:center; display:block; margin-top:auto; font-style:italic;">— EVENT IN EFFECT —</div>
                    </div>
                </div>
                
                <div class="card-reveal-effect" style="border-left-color: var(--accent-red); background: rgba(239,68,68,0.1);">
                    ${queuedEffectText || ''}
                </div>
            `;
    }
    const isEvent = nextReveal.type === 'globalEvent';
    let hintText = 'Click anywhere to dismiss';
    let autoTimer = null;
    let countdown = 0;
    let countdownInterval = null;
    overlay.innerHTML = `
            <div class="card-reveal-bg"></div>
            <div class="card-reveal-scanline"></div>
            <div class="card-reveal-flash"></div>
            
            <button class="card-reveal-dismiss" type="button" aria-label="Dismiss reveal">✕</button>
            <div class="card-reveal-hint" id="card-reveal-hint">${hintText}</div>
            ${innerContent}
        `;
    overlay.addEventListener('click', dismiss);
    overlay.querySelector('.card-reveal-card-wrapper')?.addEventListener('click', e => {
      e.stopPropagation();
      dismiss();
    });
    overlay.querySelector('.card-reveal-dismiss')?.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      dismiss();
    });
    document.body.appendChild(overlay);
    // Hook cleanup into the dismiss function
    const originalDismiss = dismiss;
    activeReveal = {
      overlay,
      dismissed: false,
      autoTimer,
      cleanup: () => {
        if (countdownInterval) clearInterval(countdownInterval);
      }
    };
  };
  showNextQueuedReveal();
}

/**
 * Show a dramatic full-screen reveal when any player plays an action card.
 */
function showActionCardRevealOverlay(card, playerName, effectText, targetInfo = null) {
  if (!card) return;
  queueRevealOverlay('actionCard', {
    card,
    playerName,
    effectText,
    targetInfo
  });
}

/**
 * Show a dramatic full-screen reveal when a Global Event fires.
 */
function showGlobalEventRevealOverlay(event, effectText) {
  if (!event) return;
  queueRevealOverlay('globalEvent', {
    event,
    effectText
  });
}

/**
 * Play appropriate audio and visual effects for an action card.
 */
/**
 * Effects that trigger whenever a player plays an Action card.
 * Call this once per Action card play, regardless of whether it needed a target.
 */
function applyOnActionPlayEffects(playerId) {
  if (!G || !G.players[playerId]) return;
  // AI News Anchor Syndicate: When you play an Action, gain +1 Power.
  Object.values(G.nodes).forEach(n => {
    if (n.owner === playerId && n.id === 'x_ainews' && !isAbilityCancelled(G.nodes, n)) {
      n.power = (n.power || 0) + 1;
      if (playerId === HUMAN_ID) logEvent(`🤖 ${n.name}: action coverage +1 Power.`, 'success');
    }
  });
}
function playActionCardEffects(card, targetId, secondTargetId) {
  // Trigger on-Action-play passives for the local player
  applyOnActionPlayEffects(HUMAN_ID);

  // SFX based on category
  let sfxName = 'success';
  switch (card.category) {
    case 'power':
      sfxName = 'power';
      break;
    case 'resistance':
      sfxName = 'debuff';
      break;
    case 'economic':
      sfxName = 'economy';
      break;
    case 'special':
      sfxName = 'special';
      break;
  }
  networkSfx(sfxName);

  // Particles if targets exist
  let effectType = 'buff';
  if (card.category === 'resistance') effectType = 'debuff';
  if (card.category === 'power') effectType = 'attack';
  if (card.category === 'economic') effectType = 'economy';
  if (card.category === 'special') effectType = 'special';
  if (targetId) {
    networkVfx(targetId, effectType);
  }
  if (secondTargetId) {
    networkVfx(secondTargetId, effectType);
  }
}

/**
 * Discard an action card from hand and add it to the discard pile.
 */
function discardActionCard(handIndex) {
  const p = G.players[HUMAN_ID];
  if (!p) return;
  const card = p.hand[handIndex];
  if (card) {
    p.hand.splice(handIndex, 1);
    G.discardPile.push(card);
  }
}

/**
 * Single-target action card modal.
 */
function showActionCardTargetModal(card, handIndex) {
  const modal = document.getElementById('action-card-modal');
  const list = document.getElementById('action-card-targets');
  const confirmBtn = document.getElementById('action-card-confirm');
  const cancelBtn = document.getElementById('action-card-cancel');
  const secondContainer = document.getElementById('action-card-second-target-container');
  document.getElementById('action-card-title').innerHTML = `${card.name.toUpperCase()}`;
  document.getElementById('action-card-desc').innerText = card.desc;
  secondContainer.style.display = 'none';
  list.innerHTML = '';
  const targets = Object.values(G.nodes).filter(n => card.filter(n));
  if (targets.length === 0) {
    logEvent('No valid targets for this action card.', 'failure');
    return;
  }
  targets.forEach(n => {
    const opt = document.createElement('option');
    opt.value = n.id;
    const ownerName = n.owner ? n.owner === HUMAN_ID ? 'YOU' : G.players[n.owner]?.name || '?' : 'Neutral';
    opt.textContent = `${n.icon || '🌐'} ${n.name} (P:${n.power} R:${n.resistance}) [${ownerName}]`;
    list.appendChild(opt);
  });
  modal.style.display = 'flex';
  const doPlay = () => {
    const targetId = list.value;
    if (!targetId) {
      modal.style.display = 'none';
      cleanup();
      return;
    }
    const msg = card.execute(G.nodes, HUMAN_ID, targetId, null, G);
    if (msg) {
      const targetInfo = buildActionTargetInfo(targetId, null);
      playActionCardEffects(card, targetId, null);
      networkLog(`⚡ ${msg}`, 'success');
      showActionCardResult(card, msg, targetInfo);
      showActionCardRevealOverlay(card, G.players[HUMAN_ID].name, msg, targetInfo);
    }
    discardActionCard(handIndex);
    mySelectedHandCardIndex = null;
    if (isTutorialMode && tutorial.isActive()) {
      tutorial.notify('action_card_played', {
        cardId: card.id
      });
    }
    modal.style.display = 'none';
    cleanup();
    refreshAll();
    syncState();
  };
  const doCancel = () => {
    modal.style.display = 'none';
    cleanup();
  };
  function cleanup() {
    confirmBtn.removeEventListener('click', doPlay);
    cancelBtn.removeEventListener('click', doCancel);
  }
  confirmBtn.addEventListener('click', doPlay);
  cancelBtn.addEventListener('click', doCancel);
}

/**
 * Two-connected-target action card modal (e.g., Manufactured Rivalry Frenzy).
 * Player picks first target, then picks second target from connected nodes.
 */
function showTwoConnectedTargetModal(card, handIndex) {
  const modal = document.getElementById('action-card-modal');
  const list = document.getElementById('action-card-targets');
  const secondList = document.getElementById('action-card-second-targets');
  const secondContainer = document.getElementById('action-card-second-target-container');
  const confirmBtn = document.getElementById('action-card-confirm');
  const cancelBtn = document.getElementById('action-card-cancel');
  document.getElementById('action-card-title').innerHTML = `${card.name.toUpperCase()}`;
  document.getElementById('action-card-desc').innerText = card.desc;
  secondContainer.style.display = 'block';

  // Get all valid first targets
  const allTargets = Object.values(G.nodes).filter(n => card.filter(n));
  if (allTargets.length < 2) {
    logEvent('Need at least 2 connected valid targets.', 'failure');
    return;
  }
  list.innerHTML = '';
  allTargets.forEach(n => {
    const opt = document.createElement('option');
    opt.value = n.id;
    const ownerName = n.owner ? n.owner === HUMAN_ID ? 'YOU' : G.players[n.owner]?.name || '?' : 'Neutral';
    opt.textContent = `${n.icon || '🌐'} ${n.name} (P:${n.power} R:${n.resistance}) [${ownerName}]`;
    list.appendChild(opt);
  });
  function updateSecondTargets() {
    secondList.innerHTML = '';
    const firstId = list.value;
    if (!firstId) return;
    const firstNode = G.nodes[firstId];
    if (!firstNode) return;

    // Find connected nodes (parent or children) that are also valid targets
    const connected = allTargets.filter(n => {
      if (n.id === firstId) return false;
      return n.parentId === firstId || firstNode.parentId === n.id;
    });
    connected.forEach(n => {
      const opt = document.createElement('option');
      opt.value = n.id;
      const ownerName = n.owner ? n.owner === HUMAN_ID ? 'YOU' : G.players[n.owner]?.name || '?' : 'Neutral';
      opt.textContent = `${n.icon || '🌐'} ${n.name} (P:${n.power} R:${n.resistance}) [${ownerName}]`;
      secondList.appendChild(opt);
    });
  }
  updateSecondTargets();
  list.addEventListener('change', updateSecondTargets);
  modal.style.display = 'flex';
  const doPlay = () => {
    const targetId = list.value;
    const secondTargetId = secondList.value;
    if (!targetId || !secondTargetId) {
      logEvent('Select both targets!', 'failure');
      return;
    }
    const msg = card.execute(G.nodes, HUMAN_ID, targetId, secondTargetId, G);
    if (msg) {
      const targetInfo = buildActionTargetInfo(targetId, secondTargetId);
      playActionCardEffects(card, targetId, secondTargetId);
      networkLog(`⚡ ${msg}`, 'success');
      showActionCardResult(card, msg, targetInfo);
      showActionCardRevealOverlay(card, G.players[HUMAN_ID].name, msg, targetInfo);
    }
    discardActionCard(handIndex);
    mySelectedHandCardIndex = null;
    if (isTutorialMode && tutorial.isActive()) {
      tutorial.notify('action_card_played', {
        cardId: card.id
      });
    }
    modal.style.display = 'none';
    cleanup();
    refreshAll();
    syncState();
  };
  const doCancel = () => {
    modal.style.display = 'none';
    cleanup();
  };
  function cleanup() {
    confirmBtn.removeEventListener('click', doPlay);
    cancelBtn.removeEventListener('click', doCancel);
    list.removeEventListener('change', updateSecondTargets);
  }
  confirmBtn.addEventListener('click', doPlay);
  cancelBtn.addEventListener('click', doCancel);
}

/**
 * Deck Peek modal — shows top 5 cards and lets player reorder them.
 */
function showDeckPeekModal(card, handIndex) {
  const modal = document.getElementById('deck-peek-modal');
  const cardsContainer = document.getElementById('deck-peek-cards');
  const confirmBtn = document.getElementById('deck-peek-confirm');
  const cancelBtn = document.getElementById('deck-peek-cancel');

  // Peek at top 5 cards
  const peekCount = Math.min(5, G.deck.length);
  if (peekCount === 0) {
    logEvent('Deck is empty!', 'failure');
    return;
  }

  // Take from end of array (top of deck)
  const peekedCards = G.deck.splice(G.deck.length - peekCount, peekCount);
  let orderedCards = [...peekedCards];
  function renderCards() {
    cardsContainer.innerHTML = '';
    orderedCards.forEach((c, i) => {
      const div = document.createElement('div');
      div.style.cssText = 'display:flex;align-items:center;gap:10px;padding:8px 12px;background:rgba(0,0,0,0.5);border:1px solid var(--border-color);border-radius:6px;font-family:var(--font-mono);font-size:12px;color:var(--text-white);cursor:grab;user-select:none;';
      if (c.type === 'action') div.style.borderColor = 'var(--accent-yellow)';
      const posLabel = i === 0 ? '🔝 NEXT' : `#${i + 1}`;
      const isAction = c.type === 'action';
      div.innerHTML = `
                <span style="color:#718096;min-width:55px;font-size:10px;">${posLabel}</span>
                <span>${c.icon} ${c.name}</span>
                ${isAction ? '<span style="color:var(--accent-yellow);font-size:10px;">ACTION</span>' : `<span style="font-size:10px;color:#718096;">P${c.power} R${c.resistance} ₿${c.income}</span>`}
                <span style="margin-left:auto;display:flex;gap:4px;">
                    ${i > 0 ? '<button class="peek-up" style="background:none;border:1px solid #4a5568;color:#a0aec0;border-radius:3px;padding:2px 6px;cursor:pointer;font-size:10px;">▲</button>' : ''}
                    ${i < orderedCards.length - 1 ? '<button class="peek-down" style="background:none;border:1px solid #4a5568;color:#a0aec0;border-radius:3px;padding:2px 6px;cursor:pointer;font-size:10px;">▼</button>' : ''}
                </span>
            `;

      // Move up/down buttons
      const upBtn = div.querySelector('.peek-up');
      const downBtn = div.querySelector('.peek-down');
      if (upBtn) upBtn.addEventListener('click', e => {
        e.stopPropagation();
        [orderedCards[i - 1], orderedCards[i]] = [orderedCards[i], orderedCards[i - 1]];
        renderCards();
      });
      if (downBtn) downBtn.addEventListener('click', e => {
        e.stopPropagation();
        [orderedCards[i], orderedCards[i + 1]] = [orderedCards[i + 1], orderedCards[i]];
        renderCards();
      });
      cardsContainer.appendChild(div);
    });
  }
  renderCards();
  modal.style.display = 'flex';
  const doConfirm = () => {
    // Put cards back on deck in new order (reverse because deck pops from end)
    orderedCards.reverse().forEach(c => G.deck.push(c));
    const msg = `🃏 Deck-Rigging! Top ${peekCount} cards reordered.`;
    playActionCardEffects(card, null, null);
    networkLog(`⚡ ${msg}`, 'success');
    showActionCardResult(card, msg);
    showActionCardRevealOverlay(card, G.players[HUMAN_ID].name, msg);
    discardActionCard(handIndex);
    mySelectedHandCardIndex = null;
    if (isTutorialMode && tutorial.isActive()) {
      tutorial.notify('action_card_played', {
        cardId: card.id
      });
    }
    modal.style.display = 'none';
    cleanup();
    refreshAll();
    syncState();
  };
  const doCancel = () => {
    // Put cards back as they were
    peekedCards.reverse().forEach(c => G.deck.push(c));
    modal.style.display = 'none';
    cleanup();
  };
  function cleanup() {
    confirmBtn.removeEventListener('click', doConfirm);
    cancelBtn.removeEventListener('click', doCancel);
  }
  confirmBtn.addEventListener('click', doConfirm);
  cancelBtn.addEventListener('click', doCancel);
}

// ═══════════════════════════════════════
//  ATTACK HANDLERS
// ═══════════════════════════════════════
// ═══════════════════════════════════════
//  POST-ATTACK RESOLUTION PIPELINE
// ═══════════════════════════════════════

/**
 * Shared logic for effects that trigger after a SUCCESSFUL attack.
 */
function applyPostAttackSuccessEffects(playerId, rolledDoubles, targetNodeId) {
  const p = G.players[playerId];
  if (!p) return;

  // 1. (AI News Anchor Syndicate has been moved — it triggers on Action card play
  //    via applyOnActionPlayEffects(), not on attack success. This matches the
  //    card description: "When you play an Action, gain +1 Power.")

  // 2. Doubles bonus (Autonomous Hedge Fund DAO)
  const doublesBonus = getDoublesBonus(G.nodes, playerId, rolledDoubles);
  if (doublesBonus > 0) {
    const root = G.nodes[p.rootNodeId];
    if (root) {
      root.btc = (root.btc || 0) + doublesBonus;
      if (playerId === HUMAN_ID) logEvent(`🤑 DAO Synergy: Rolled doubles! +₿${doublesBonus} generated.`, 'success');
    }
  }

  // 3. Esports Betting Syndicate: Steal ₿1 on success
  const hasEBet = Object.values(G.nodes).some(n => n.owner === playerId && n.id === 'x_esportsbet');
  if (hasEBet) {
    const targetNode = G.nodes[targetNodeId];
    // Note: targetNode.owner is null by this point if it was seized/neutralized,
    // but the bidding war logic might have tracked the original owner.
    // For simplicity, we check if the target HAD an owner that isn't the attacker.
    // In OMNIS, this is usually tracked via G._lastTargetOwner before the seized logic.
    const stolenFrom = G._lastTargetOwner;
    if (stolenFrom && stolenFrom !== playerId) {
      let stolen = 0;
      const ownerNodes = Object.values(G.nodes).filter(n => n.owner === stolenFrom && (n.btc || 0) > 0).sort((a, b) => (b.btc || 0) - (a.btc || 0));
      if (ownerNodes.length > 0) {
        const n = ownerNodes[0];
        n.btc -= 1;
        stolen = 1;
        const root = G.nodes[p.rootNodeId];
        if (root) root.btc = (root.btc || 0) + 1;
        if (playerId === HUMAN_ID) logEvent(`🎰 Esports Betting: Seized ₿1 from ${G.players[stolenFrom]?.name || 'opponent'}.`, 'success');
      }
    }
  }
}

/**
 * Shared logic for effects that trigger after a FAILED attack.
 */
function applyPostAttackFailureEffects(attackerId) {
  // 1. Viral Clip Harvesters: If defender has it and attacker fails, defender gains ₿1
  Object.values(G.nodes).forEach(n => {
    if (n.id === 'x_viralclip' && n.owner && n.owner !== attackerId) {
      n.btc = (n.btc || 0) + 1;
      if (n.owner === HUMAN_ID) logEvent(`📹 Viral Clip: Opponent failure captured! +₿1 income.`, 'success');
    }
  });
}
async function handleAttack(attackType) {
  if (!G || G.winner) return;
  let target = null,
    isHandCard = false;
  if (mySelectedHandCardIndex !== null) {
    if (mySelectedHandCardIndex === 999) {
      target = G.discardPile[G.discardPile.length - 1];
    } else {
      target = G.players[HUMAN_ID].hand[mySelectedHandCardIndex];
    }
    isHandCard = true;
  } else if (mySelectedNodeId) {
    target = G.nodes[mySelectedNodeId];
  }
  if (!target) return;

  // ═══ ACTION CARD INTERCEPTION ═══
  // Action cards are played as a FREE action — they can be played at ANY time
  if (isHandCard && target.type === 'action') {
    playActionCard(target, mySelectedHandCardIndex);
    return;
  }

  // Everything else requires it to be your turn
  if (!isMyTurn()) return;

  // Regular attacks require an unspent action this turn
  if (!canSpendAction()) {
    logEvent('No actions left this turn — end your turn to continue.', 'warning');
    return;
  }
  if (G._noAttacksThisRound) {
    logEvent('🧘 Ceasefire: No attacks allowed this round.', 'warning');
    return;
  }
  if (G._ceasefireActive && target.owner) {
    logEvent('🛑 Ceasefire Protocol: Player-vs-player attacks banned this round.', 'warning');
    return;
  }
  if (attackType === ATTACK_TYPES.CONTROL && G._hostileMoratoriumActive) {
    logEvent('🧨 Moratorium: Cannot control groups this round.', 'warning');
    return;
  }

  // ═══ EVENT ENFORCEMENT: Untargetable target (Firewall Protocol) ═══
  if (!isHandCard && target._untargetableThisRound) {
    logEvent('🛡️ Firewall Protocol: This group is protected and cannot be targeted this round.', 'warning');
    return;
  }

  // Resolve attacker
  let attackerNode = selectedAttackerNodeId ? G.nodes[selectedAttackerNodeId] : null;
  if (!attackerNode || attackerNode.owner !== HUMAN_ID) {
    logEvent('No valid attacker selected.', 'failure');
    return;
  }

  // ═══ EVENT ENFORCEMENT: Attacker locked down (Freeze Order, Market Crash, Riot Season, PR Meltdown) ═══
  if (attackerNode._cannotAttackThisRound) {
    logEvent(`🔒 ${attackerNode.name} is locked down by a Global Event and cannot attack this round.`, 'warning');
    return;
  }
  let pendingAttachmentSolution = null;

  // For control: use the explicitly selected attacker. Do NOT silently swap to a different node.
  if (attackType === ATTACK_TYPES.CONTROL) {
    // First try the user's explicitly selected attacker
    const preferredControlOption = attackerNode ? getControlAttackOptionForTarget(target, attackerNode.id) : null;
    if (preferredControlOption) {
      // User's chosen attacker can control-attach the target — use it
      pendingAttachmentSolution = preferredControlOption.attachment;
    } else {
      // User's chosen attacker can't physically attach the target.
      // Report why, rather than silently switching to a different attacker.
      const freeSlots = getFreeArrows(G.nodes, attackerNode.id);
      if (freeSlots <= 0) {
        logEvent(`${attackerNode.name} has no free control slots! Select a different attacker.`, 'failure');
      } else {
        logEvent(`${attackerNode.name} can't physically attach ${target.name} (port collision). Try a different attacker.`, 'failure');
      }
      return;
    }
  }

  // ─── Tutorial: block attack if tutorial isn't ready ───
  if (isTutorialMode && tutorial.isActive()) {
    const blocked = tutorial.isActionBlocked('attack', {
      targetId: target.id
    });
    if (blocked) {
      logEvent(blocked, 'failure');
      return;
    }
  }
  const attackStr = getAttackStrength(G.nodes, attackerNode.id, G._networkBlackout);
  const alignPen = getAlignmentPenalty(attackerNode.alignments || [], target.alignments || []);
  const abilityAtk = getAttackAbilityModifier(G.nodes, attackerNode, target, G._networkBlackout);
  let abilityDef = getDefenseAbilityModifier(G.nodes, target, G._networkBlackout);
  const loyaltyBonus = getLoyaltyPointsBonus(G.nodes, HUMAN_ID);
  const canReroll = hasEsportsReroll(G.nodes, HUMAN_ID);
  const dieMod = getAstrologyModifier(G.nodes, HUMAN_ID);
  let distBonus = target.owner && attackerNode ? (getDistanceToFaction(G.nodes, target.id) - getDistanceToFaction(G.nodes, attackerNode.id)) * 5 : 0;

  // Dark Web Marketplace: Ignore Resistance bonuses when attacking
  const hasDarkWeb = hasPassiveAlias(G.nodes, attackerNode, 'n_darkweb') && !isAbilityCancelled(G.nodes, attackerNode);
  if (hasDarkWeb) {
    if (abilityDef > 0) abilityDef = 0;
    if (distBonus > 0) distBonus = 0;
  }
  const myBtc = getPlayerTotalBtc(HUMAN_ID);
  const myFactionId = G.players[HUMAN_ID].factionId;

  // Faction ability: Algorithmic Overlords — Predictive Manipulation
  let algoBonus = 0;
  if (!G.factionAbilityUsed[HUMAN_ID]) {
    algoBonus = getAlgoManipulationBonus(myFactionId, target.alignments || []);
  }

  // Calculate final target resistance directly inline so it matches runBiddingWar's expectations
  let targetRes = getEffectiveResistance(G.nodes, target.id, G._networkBlackout) - abilityDef - algoBonus;
  if (attackType === ATTACK_TYPES.NEUTRALIZE) {
    targetRes = Math.ceil(targetRes / 2); // Neutralize halves resistance (rounded up)
  } else if (attackType === ATTACK_TYPES.DESTROY && target.owner) {
    targetRes *= 2; // Destroy doubles resistance if controlled by a rival
  }
  let baseAttackPower = attackStr + abilityAtk + loyaltyBonus;

  // ═══ Apply Action Card Deferred Buffs ═══
  let actionBuffApplied = 0;
  const myBuffs = G._actionBuffs?.[HUMAN_ID];
  if (myBuffs) {
    // Flat power bonus (Hostile Takeover Blitz, Quantum Probability Spike)
    if (myBuffs.nextAttackPower) {
      actionBuffApplied += myBuffs.nextAttackPower;
      logEvent(`💼 Action Buff: +${myBuffs.nextAttackPower} Power applied!`, 'success');
    }
    // Viral Frenzy: +7 vs Media, +3 vs others
    if (myBuffs.viralFrenzy) {
      const isMedia = target.alignments?.includes('Media');
      const viralBonus = isMedia ? 7 : 3;
      actionBuffApplied += viralBonus;
      logEvent(`📈 Viral Frenzy: +${viralBonus} Power${isMedia ? ' (Media target!)' : ''}!`, 'success');
    }
    // Nostalgia Bomb: +5 vs Legacy/Cultural
    if (myBuffs.nostalgiaBomb) {
      const isLegacyCultural = target.alignments?.some(a => ['Legacy', 'Cultural'].includes(a));
      if (isLegacyCultural) {
        actionBuffApplied += 5;
        logEvent(`📼 Nostalgia Bomb: +5 Power (Legacy/Cultural target)!`, 'success');
      }
    }
    baseAttackPower += actionBuffApplied;
    // Don't delete G._actionBuffs yet! Wait until the attack fully resolves so live stat recalculations can access them.
  }

  // ═══ Global Event Combat Modifiers (Human) ═══
  // Global Panic: +2 Power to all attacks
  if (G._globalPanicActive) {
    baseAttackPower += 2;
    logEvent(`😱 Global Panic: +2 Power to your attack!`, 'success');
  }
  // Viral Thread: First Media attacker gets +5 Power (then consume flag)
  let usedViralThread = false;
  if (G._viralThreadActive && attackerNode.alignments?.includes('Media')) {
    baseAttackPower += 5;
    G._viralThreadActive = false; // Consumed — only the first Media attacker benefits
    usedViralThread = true;
    logEvent(`🧵 Viral Thread: ${attackerNode.name} surges with +5 Power!`, 'success');
  }
  const biddingWarId = `${HUMAN_ID}:${attackerNode.id}:${target.id}:${G.turnNumber}:${Date.now()}:${Math.random().toString(36).slice(2, 7)}`;
  const bidParams = {
    attackerNodeId: attackerNode.id,
    baseAttackPower,
    targetResistance: targetRes,
    alignMod: alignPen,
    atkAbility: abilityAtk,
    defAbility: abilityDef,
    loyaltyBonus,
    isEndgame: G.isEndgame,
    dieMod,
    hasReroll: canReroll,
    distanceBonus: distBonus,
    attackType,
    resistancePenalty: algoBonus,
    ignoreDefenseAbility: hasDarkWeb
  };
  // Show BTC spending modal
  // ─── Tutorial: notify bidding started ───
  if (isTutorialMode && tutorial.isActive()) {
    // Fire bidding steps with a slight delay so the panel renders first
    setTimeout(() => tutorial.onBiddingStart(), 500);
  }
  const bidResult = await runBiddingWar({
    attackerId: HUMAN_ID,
    attackerNodeId: attackerNode.id,
    targetNode: target,
    ...bidParams,
    warId: biddingWarId
  });

  // Clean up global hook
  window.updateBiddingWarPreview = null;

  // ─── Tutorial: notify bidding resolved ───
  if (isTutorialMode && tutorial.isActive()) {
    tutorial.notify('bidding_done', {});
  }
  if (!bidResult) return; // Player cancelled

  const {
    attackerBtcSpent,
    defenderBtcSpent
  } = bidResult;

  // Now officially use the faction ability if it contributed to this attack
  if (algoBonus > 0) {
    G.factionAbilityUsed[HUMAN_ID] = true;
    logEvent(`🔮 Predictive Manipulation: target R-${algoBonus} enforced!`, 'warning', target.id);
  }

  // ═══ RE-EVALUATE LIVE STATS IN CASE ACTION CARDS WERE PLAYED ═══
  const liveAtkNode = G.nodes[attackerNode.id];
  const liveTgtNode = G.nodes[target.id];
  if (!liveAtkNode || !liveTgtNode) {
    logEvent('Attack target or attacker destroyed during bidding war.', 'failure');
    refreshAll();
    return;
  }
  let liveAbilityDef = getDefenseAbilityModifier(G.nodes, liveTgtNode, G._networkBlackout);
  if (hasDarkWeb) liveAbilityDef = 0;
  let liveTargetRes = getEffectiveResistance(G.nodes, liveTgtNode.id, G._networkBlackout) - algoBonus - liveAbilityDef;
  if (attackType === ATTACK_TYPES.NEUTRALIZE) liveTargetRes = Math.ceil(liveTargetRes / 2);else if (attackType === ATTACK_TYPES.DESTROY && liveTgtNode.owner) liveTargetRes *= 2;
  let liveAbilityAtk = getAttackAbilityModifier(G.nodes, liveAtkNode, liveTgtNode, G._networkBlackout);
  let liveBaseAttackPower = getAttackStrength(G.nodes, liveAtkNode.id, G._networkBlackout) + liveAbilityAtk + loyaltyBonus;

  // Apply deferred buffs
  let liveActionBuffApplied = 0;
  const liveMyBuffs = G._actionBuffs?.[HUMAN_ID];
  if (liveMyBuffs) {
    if (liveMyBuffs.nextAttackPower) liveActionBuffApplied += liveMyBuffs.nextAttackPower;
    if (liveMyBuffs.viralFrenzy) liveActionBuffApplied += liveTgtNode.alignments?.includes('Media') ? 7 : 3;
    if (liveMyBuffs.nostalgiaBomb && liveTgtNode.alignments?.some(a => ['Legacy', 'Cultural'].includes(a))) liveActionBuffApplied += 5;
    liveBaseAttackPower += liveActionBuffApplied;
    delete G._actionBuffs[HUMAN_ID]; // Now consume it safely
  }

  // ═══ Global Event Combat Modifiers (Live re-evaluation) ═══
  // Global Panic: +2 Power (re-check in case state changed during bidding)
  if (G._globalPanicActive) liveBaseAttackPower += 2;
  // Viral Thread: re-apply if it was used initially
  if (usedViralThread) liveBaseAttackPower += 5;

  // Compute final attack strength using LIVE stats
  const finalStr = computeAttackStrength({
    attackerPower: liveBaseAttackPower,
    btcSpent: attackerBtcSpent,
    targetResistance: liveTargetRes,
    defenderBtcSpent,
    alignmentModifier: alignPen,
    isEndgame: G.isEndgame,
    distanceBonus: distBonus
  });
  const btcSpent = attackerBtcSpent;
  spendAction();
  // Mark the attacking node as having acted this round.
  // EXCEPTION — Riot Season grants Populist/Cultural groups a second attack.
  // We track usage with _attackCountThisRound so the second attack still
  // marks the node as acted on its second use.
  if (attackerNode) {
    attackerNode._attackCountThisRound = (attackerNode._attackCountThisRound || 0) + 1;
    const allowedAttacks = attackerNode._canAttackTwiceThisRound ? 2 : 1;
    if (attackerNode._attackCountThisRound >= allowedAttacks) {
      attackerNode.hasActedThisRound = true;
      // Used the bonus attack — clear the flag so it can't be re-extended.
      attackerNode._canAttackTwiceThisRound = false;
    } else {
      // Riot Season free re-attack — keep the node ready, but the main
      // action for THIS turn still counts as used.
      logEvent(`🧨 ${attackerNode.name}: Riot Season — second attack still available this round!`, 'success');
    }
  }
  SFX.playAttackInit();
  await new Promise(r => setTimeout(r, 400));
  SFX.playDiceRoll();
  const defMemeOlym = target.owner ? hasMemeOlympicsReroll(G.nodes, target.owner) : false;
  let result = calculateAttack(finalStr, attackType, {
    canReroll,
    dieModifier: dieMod,
    defenderHasMemeOlympics: defMemeOlym
  });

  // Trigger Glitch VFX if a reroll happened (Esports or Meme Olympics)
  if (gameGraphScene && (result.rerolled || result.forcedReroll)) {
    gameGraphScene.playGlitchEffect(target.id);
  }

  // ─── Tutorial: deterministic attack results ───
  if (isTutorialMode && tutorial.isActive()) {
    const forced = tutorial.shouldForceAttackResult(HUMAN_ID, target.id, G.turnNumber, HUMAN_ID);
    if (forced === true && !result.success) {
      result = {
        ...result,
        success: true,
        roll: 2,
        finalStrength: Math.max(finalStr, 12)
      };
    } else if (forced === false && result.success) {
      result = {
        ...result,
        success: false,
        roll: 12,
        finalStrength: Math.max(finalStr, 1)
      };
    }
  }
  attackResult.style.display = 'block';
  const intText = defenderBtcSpent > 0 ? `<br/>Defender ₿TC: -${defenderBtcSpent}` : '';
  const spentText = btcSpent > 0 ? `<br/>₿TC invested: +${btcSpent}` : '';
  // Rich alignment breakdown
  const alignBreakdown = getAlignmentBreakdown(attackerNode.alignments || [], target.alignments || []);
  let penText = '';
  if (alignBreakdown.length > 0) {
    const parts = alignBreakdown.map(p => {
      if (p.type === 'match') return `<span style="color:var(--accent-green)">+4 (${p.attacker} match)</span>`;
      if (p.type === 'opposed') return `<span style="color:var(--accent-red)">-4 (${p.attacker}↔${p.target})</span>`;
      return `<span style="color:var(--accent-yellow)">-2 (${p.attacker}⚡${p.target})</span>`;
    });
    penText = `<br/>Alignment: ${parts.join(' ')} = ${alignPen > 0 ? '+' : ''}${alignPen}`;
  }
  const abilityText = abilityAtk !== 0 || abilityDef !== 0 || loyaltyBonus > 0 ? `<br/>Abilities: ${abilityAtk > 0 ? '+' + abilityAtk + ' atk' : ''}${loyaltyBonus > 0 ? ' +' + loyaltyBonus + '💳' : ''}${abilityDef > 0 ? ' +' + abilityDef + ' def' : ''}` : '';
  const distText = distBonus !== 0 ? `<br/>Proximity: ${distBonus > 0 ? `<span style="color:var(--accent-red)">-${distBonus}</span>` : `<span style="color:var(--accent-green)">+${Math.abs(distBonus)}</span>`}` : '';
  const rerollText = result.rerolled ? `<br/><span style="color:var(--accent-purple)">🎮 Esports reroll activated!</span>` : '';
  const dieModText = result.dieModifier ? `<br/><span style="color:var(--accent-purple)">✨ Astrology: ${result.dieModifier > 0 ? '+' : ''}${result.dieModifier} to roll</span>` : '';
  const doublesText = result.rolledDoubles ? `<br/><span style="color:var(--accent-yellow)">🎲 Doubles!</span>` : '';
  const memeOlymText = result.forcedReroll ? `<br/><span style="color:var(--accent-red)">🏅 Defender MemeOlympics forced reroll!</span>` : '';
  const rollDisplay = `<div style="color:var(--text-white);background:rgba(0,0,0,0.4);padding:4px;border-radius:4px;margin:4px 0;border:1px solid #2d3748;">PHASE 2 (2d6 ROLL): <strong>${result.roll}</strong> ${result.success ? '≤' : '>'} TARGET <strong>${result.finalStrength}</strong></div>`;

  // Global Event combat modifier display
  let eventModText = '';
  if (G._globalPanicActive) eventModText += `<br/><span style="color:var(--accent-red)">😱 Global Panic: +2 Power</span>`;
  await new Promise(r => setTimeout(r, 350));

  // ═══ Faction Ability: National Security Apparatus — Plausible Deniability Protocol ═══
  // If the defender is NatSec and hasn't used it this turn, a successful attack is cancelled
  let deniabilityCancelled = false;
  if (result.success && target.owner) {
    const defPlayer = G.players[target.owner];
    if (defPlayer && hasPlausibleDeniability(defPlayer.factionId) && !G.factionAbilityUsed[target.owner]) {
      G.factionAbilityUsed[target.owner] = true;
      deniabilityCancelled = true;
      logEvent(`🕶️ ${defPlayer.name}: PLAUSIBLE DENIABILITY — Attack on ${target.name} erased from the record!`, 'warning');
    }
  }

  // Capture target owner for post-success theft logic (e.g. Esports Betting)
  G._lastTargetOwner = target.owner;

  // Publish attack result for remote clients

  if (result.success && !deniabilityCancelled) {
    SFX.playSuccess();
    attackResult.innerHTML = `<span style="color:var(--accent-green);font-size:16px;">SUCCESS!</span><br>${rollDisplay}${spentText}${intText}${penText}${abilityText}${distText}${eventModText}${rerollText}${dieModText}${doublesText}${memeOlymText}`;

    // Apply shared post-success effects (DAO, Syndicate, BTC theft, etc.)
    applyPostAttackSuccessEffects(HUMAN_ID, result.rolledDoubles, target.id);
    if (attackType === ATTACK_TYPES.CONTROL) {
      // Steal: detach from old owner, re-parent under attacker
      const prevOwner = target.owner;
      if (prevOwner) {
        const orphaned = detachSubtree(target.id);
        if (orphaned.length > 0) logEvent(`💥 ${orphaned.length} groups orphaned from ${G.players[prevOwner]?.name}!`, 'warning');
      }
      const attachSolution = pendingAttachmentSolution || canAttachNodeToParent(G.nodes[target.id], attackerNode, {
        ignoreNodeIds: [target.id]
      });
      if (!attachSolution) {
        attackResult.innerHTML = `<span style="color:var(--accent-red);font-size:16px;font-weight:bold;">PORT LOCKOUT</span><br/>Attack succeeded, but no legal outflow → inflow attachment exists.`;
        attackResult.className = 'attack-result failure';
        logEvent(`❌ ${target.name} could not be connected to ${attackerNode.name}; operation aborted.`, 'failure');
        refreshAll();
        syncState();
        return;
      }
      G.nodes[target.id].btc = 0;
      applyAttachmentSolution(G.nodes[target.id], attackerNode, attachSolution, HUMAN_ID);

      // Camera Feedback for successful capture
      if (gameGraphScene) {
        gameGraphScene.cameras.main.zoomTo(0.45, 1000, 'Power2');
        gameGraphScene.centerCameraOn(G.nodes[target.id].x, G.nodes[target.id].y);
        setTimeout(() => {
          if (gameGraphScene) gameGraphScene.cameras.main.zoomTo(0.65, 800, 'Power2');
        }, 1200);
      }

      // On-control effects (e.g., Biotech, Micro-Investment)
      const ctrlFx = getOnControlEffects(G.nodes, HUMAN_ID);
      let fxMsg = '';
      if (ctrlFx.powerBonus > 0) fxMsg += `<br/>🧬 Biotech synergy: +${ctrlFx.powerBonus} power boost!`;
      if (ctrlFx.btcBonus > 0) {
        if (G.nodes[target.id]) G.nodes[target.id].btc = (G.nodes[target.id].btc || 0) + ctrlFx.btcBonus;
        fxMsg += `<br/>📊 Micro-Investment: +₿${ctrlFx.btcBonus} on control!`;
      }

      // ═══ Faction Ability: Corporate Megabloc — Acquisition Surge ═══
      if (shouldTriggerVerticalIntegration(myFactionId, target.alignments || [])) {
        // Award +₿3 to the newly captured node
        if (G.nodes[target.id]) {
          G.nodes[target.id].btc = (G.nodes[target.id].btc || 0) + 3;
          fxMsg += `<br/>📊 <span style="color:var(--accent-purple)">Acquisition Surge: +₿3 liquidity injection!</span>`;
          logEvent(`📊 Acquisition Surge: Strategic acquisition — +₿3 added to ${target.name}!`, 'success');
        }
      }
      attackResult.innerHTML = `<span style="color:var(--accent-green);font-size:16px;font-weight:bold;">✅ CONTROL SEIZED!</span><br/>${rollDisplay}${spentText}${intText}${penText}${abilityText}${distText}${eventModText}${rerollText}${dieModText}${doublesText}${fxMsg}<br/>Via ${attackerNode.name} → ${target.name}`;
      attackResult.className = 'attack-result success';
      logEvent(`⚔️ Chairman seized ${target.name} via ${attackerNode.name}.`, 'success');
    } else if (attackType === ATTACK_TYPES.NEUTRALIZE) {
      const orphaned = detachSubtree(target.id);
      G.nodes[target.id].owner = null;
      G.nodes[target.id].parentId = null;
      G.nodes[target.id].btc = 0;
      attackResult.innerHTML = `<span style="color:var(--accent-green);font-size:16px;font-weight:bold;">💫 NEUTRALIZED!</span><br/>${rollDisplay}${spentText}${intText}${penText}${abilityText}${distText}${eventModText}${rerollText}${dieModText}${doublesText}<br/>${target.name} is uncontrolled.${orphaned.length > 0 ? ' ' + orphaned.length + ' groups orphaned!' : ''}`;
      attackResult.className = 'attack-result success';
      logEvent(`💫 Neutralized ${target.name}.${orphaned.length > 0 ? ' ' + orphaned.length + ' orphaned!' : ''}`, 'success');
    } else if (attackType === ATTACK_TYPES.DESTROY) {
      const orphaned = detachSubtree(target.id);
      // Track destroyed nodes for the Underground win condition
      if (!G.players[HUMAN_ID].destroyedNodes) G.players[HUMAN_ID].destroyedNodes = 0;
      G.players[HUMAN_ID].destroyedNodes++;

      // Move destroyed node back to deck discard if it has a deck origin
      if (DECK.find(c => c.id === target.id)) {
        const baseCard = DECK.find(c => c.id === target.id);
        G.discardPile.push(baseCard);
      }
      delete G.nodes[target.id];
      mySelectedNodeId = null;
      attackResult.innerHTML = `<span style="color:var(--accent-green);font-size:16px;font-weight:bold;">💀 DESTROYED!</span><br/>${rollDisplay}${spentText}${intText}${penText}${abilityText}${distText}${eventModText}${rerollText}${dieModText}${doublesText}<br/>${target.name} eliminated.${orphaned.length > 0 ? ' ' + orphaned.length + ' groups orphaned!' : ''}`;
      attackResult.className = 'attack-result success';
      logEvent(`💀 Destroyed ${target.name}.`, 'success');
    }
  } else if (deniabilityCancelled) {
    // Plausible Deniability negated the attack
    SFX.playFailure();
    attackResult.innerHTML = `<span style="color:var(--accent-purple);font-size:16px;">🕶️ DENIED</span><br/>${rollDisplay}${spentText}${intText}${penText}${abilityText}${distText}${eventModText}${rerollText}${dieModText}${doublesText}${memeOlymText}<br/><span style="color:var(--accent-purple)">Plausible Deniability Protocol activated — attack erased from the record.</span>`;
    attackResult.className = 'attack-result failure';
    logEvent(`🕶️ Attack on ${target.name} denied by Plausible Deniability!`, 'failure');
  } else {
    SFX.playFailure();
    attackResult.innerHTML = `<span style="color:var(--accent-red);font-size:16px;">FAILED</span><br>${rollDisplay}${spentText}${intText}${penText}${abilityText}${distText}${eventModText}${rerollText}${dieModText}${doublesText}${memeOlymText}`;
    attackResult.className = 'attack-result failure';
    logEvent(`❌ Attack on ${target.name} failed.`, 'failure');

    // Shared failure effects (e.g. Viral Clip Harvesters)
    applyPostAttackFailureEffects(HUMAN_ID);
  }
  G.turnPhase = TURN_PHASES.FREE_ACTIONS;
  console.log('[handleAttack] Post-attack state BEFORE refreshAll/syncState:', {
    actionsUsed: G.actionsUsed,
    actionsPerTurn: G.actionsPerTurn,
    turnPhase: G.turnPhase,
    activePlayerIndex: G.activePlayerIndex,
    activePlayerId: getActivePlayerId(),
    HUMAN_ID,
    isMyTurn: isMyTurn(),
    stateVersion: G._stateVersion
  });
  try {
    refreshAll();
    console.log('[handleAttack] refreshAll completed.');
  } catch (e) {
    console.error('[handleAttack] refreshAll threw:', e);
  }
  try {
    syncState(); // ⚡ CRITICAL MULTIPLAYER FIX: persist post-attack state so opponents see the capture
    console.log('[handleAttack] After syncState. New version:', G._stateVersion);
  } catch (e) {
    console.error('[handleAttack] syncState threw:', e);
  }

  // Broadcast the discrete attack result for instant remote UI feedback

  setTimeout(() => {
    attackResult.style.display = 'none';
  }, 5000);

  // ─── Tutorial hooks: post-attack and free actions ───
  if (isTutorialMode && tutorial.isActive()) {
    // Check tutorial win condition
    if (tutorial.checkTutorialWin(HUMAN_ID, G.nodes)) {
      showTutorialVictory();
      return;
    }
    setTimeout(async () => {
      await tutorial.onPostAttack();
      await tutorial.onFreeActionPhase();
    }, 1500);
  }

  // AI evaluates action cards off-turn to simulate playing them at any time

  for (const pid of G.playerOrder) {
    if (pid !== HUMAN_ID && G.players[pid].isAI) {
      evaluateAIActionCards(pid);
    }
  }
}

// ─── ACTIVE GROUP ABILITIES ───
function showGroupAbilityModal(node) {
  const ability = ACTIVE_GROUP_ABILITIES[node.id];
  if (!ability) return;
  if (!ability.needsTarget) {
    // Execute immediately
    const msg = ability.execute(G.nodes, HUMAN_ID, null, node.id, G);
    if (msg) {
      networkLog(`✅ ${msg}`, 'success');
      node.abilityUsedThisTurn = true;
      refreshAll();
      syncState();
    }
    return;
  }
  const modal = document.getElementById('group-ability-modal');
  const list = document.getElementById('group-ability-targets');
  const confirmBtn = document.getElementById('group-ability-confirm');
  const cancelBtn = document.getElementById('group-ability-cancel');
  document.getElementById('group-ability-title').innerHTML = `${ability.icon} ${ability.name.toUpperCase()}`;
  document.getElementById('group-ability-desc').innerText = ability.desc;
  list.innerHTML = '';
  const targets = Object.values(G.nodes).filter(n => ability.filter(n, node));
  if (targets.length === 0) {
    logEvent('No valid targets for this ability.', 'failure');
    return;
  }
  targets.forEach(n => {
    const opt = document.createElement('option');
    opt.value = n.id;
    const ownerName = n.owner ? n.owner === HUMAN_ID ? 'YOU' : G.players[n.owner]?.name || '?' : 'Neutral';
    opt.textContent = `${n.icon || '🌐'} ${n.name} [${ownerName}]`;
    list.appendChild(opt);
  });
  modal.style.display = 'flex';
  const doAbility = () => {
    const targetId = list.value;
    if (!targetId) {
      modal.style.display = 'none';
      cleanup();
      return;
    }
    const msg = ability.execute(G.nodes, HUMAN_ID, targetId, node.id, G);
    if (msg) {
      networkLog(`✅ ${msg}`, 'success');
      node.abilityUsedThisTurn = true;
    }
    modal.style.display = 'none';
    cleanup();
    refreshAll();
    syncState();
  };
  const doCancel = () => {
    modal.style.display = 'none';
    cleanup();
  };
  function cleanup() {
    confirmBtn.removeEventListener('click', doAbility);
    cancelBtn.removeEventListener('click', doCancel);
  }
  confirmBtn.addEventListener('click', doAbility);
  cancelBtn.addEventListener('click', doCancel);
}
if (btnGroupAbility) {
  btnGroupAbility.addEventListener('click', () => {
    if (!G || !isMyTurn() || !mySelectedNodeId) return;
    const node = G.nodes[mySelectedNodeId];
    if (!node || node.owner !== HUMAN_ID) return;
    showGroupAbilityModal(node);
  });
}
if (btnAttackControl) btnAttackControl.addEventListener('click', () => {
  if (isTutorialMode && tutorial.isActive()) tutorial.notify('attack_control', {});
  handleAttack(ATTACK_TYPES.CONTROL);
});
if (btnAttackNeutralize) btnAttackNeutralize.addEventListener('click', () => {
  if (isTutorialMode && tutorial.isActive()) tutorial.notify('attack_neutralize', {});
  handleAttack(ATTACK_TYPES.NEUTRALIZE);
});
if (btnAttackDestroy) btnAttackDestroy.addEventListener('click', () => {
  if (isTutorialMode && tutorial.isActive()) tutorial.notify('attack_destroy', {});
  handleAttack(ATTACK_TYPES.DESTROY);
});
if (btnTransferBtc) {
  btnTransferBtc.addEventListener('click', () => {
    if (!G || !isMyTurn()) return;
    const node = mySelectedNodeId ? G.nodes[mySelectedNodeId] : null;
    if (!node || node.owner !== HUMAN_ID) return;
    // Block opening the modal entirely when there's no free transfer
    // available AND no action to spend on a paid one.
    const myFac = G.players[HUMAN_ID]?.factionId;
    const isCryptoPassive = myFac === 'f_crypto';
    if (!isCryptoPassive && transfersFreeRemaining() === 0 && !canSpendAction()) {
      logEvent('No actions left this turn for a 3rd+ BTC transfer.', 'warning');
      return;
    }
    showTransferModal(node);
  });
}
function showTransferModal(fromNode) {
  const modal = document.getElementById('transfer-modal');
  if (!modal) return;
  const myNodes = Object.values(G.nodes).filter(n => n.owner === HUMAN_ID && n.id !== fromNode.id);
  const list = document.getElementById('transfer-targets');
  const amountInput = document.getElementById('transfer-amount');
  const myFac = G.players[HUMAN_ID]?.factionId;
  const isCryptoPassive = myFac === 'f_crypto';
  const freeLeft = transfersFreeRemaining();
  const willCostAction = !isCryptoPassive && freeLeft === 0;
  const actionsLeft = actionsRemaining();
  const maxLabel = document.getElementById('transfer-max');
  if (maxLabel) {
    let costNote = '';
    if (isCryptoPassive) {
      costNote = ` · ✓ Free (Fluid Tokenomics)`;
    } else if (willCostAction) {
      costNote = actionsLeft > 0 ? ` · ⚠ Costs 1 action (${actionsLeft} left)` : ` · ❌ No actions left — cannot transfer`;
    } else {
      costNote = ` · ✓ Free (${freeLeft} free transfer${freeLeft === 1 ? '' : 's'} left)`;
    }
    maxLabel.innerText = `Available: ₿${fromNode.btc || 0}${costNote}`;
  }
  amountInput.max = fromNode.btc || 0;
  amountInput.min = 1;
  amountInput.step = 1;
  amountInput.value = Math.min(1, fromNode.btc || 0);
  list.innerHTML = '';
  myNodes.forEach(n => {
    const opt = document.createElement('option');
    opt.value = n.id;
    opt.textContent = `${n.name} (₿${n.btc || 0})`;
    list.appendChild(opt);
  });
  modal.style.display = 'flex';
  const confirmBtn = document.getElementById('transfer-confirm'),
    cancelBtn = document.getElementById('transfer-cancel');
  // Block confirm if a paid transfer is requested but no actions remain.
  if (confirmBtn) confirmBtn.disabled = willCostAction && actionsLeft === 0;
  const doTransfer = () => {
    const tid = list.value;
    const amt = parseInt(amountInput.value);
    if (!tid || !(amt > 0)) {
      modal.style.display = 'none';
      confirmBtn.removeEventListener('click', doTransfer);
      cancelBtn.removeEventListener('click', doCancel);
      return;
    }
    // Reserve the transfer slot / spend an action BEFORE moving BTC so a
    // failed transferBtc (e.g. event-locked node) doesn't burn the action.
    const stateBefore = {
      transfers: G.transfersUsedThisTurn || 0,
      actions: G.actionsUsed || 0
    };
    if (!isCryptoPassive && !tryConsumeTransfer()) {
      logEvent('No actions left this turn for a 3rd+ BTC transfer.', 'warning');
      modal.style.display = 'none';
      confirmBtn.removeEventListener('click', doTransfer);
      cancelBtn.removeEventListener('click', doCancel);
      return;
    }
    if (transferBtc(HUMAN_ID, fromNode.id, tid, amt)) {
      const note = willCostAction ? ' (cost 1 action)' : '';
      networkLog(`💱 Transferred ₿${amt} to ${G.nodes[tid].name}.${note}`, 'success');
    } else {
      // Rollback the transfer/action consumption since transferBtc refused.
      if (!isCryptoPassive) {
        G.transfersUsedThisTurn = stateBefore.transfers;
        G.actionsUsed = stateBefore.actions;
      }
    }
    modal.style.display = 'none';
    confirmBtn.removeEventListener('click', doTransfer);
    cancelBtn.removeEventListener('click', doCancel);
    refreshAll();
    syncState();
  };
  const doCancel = () => {
    modal.style.display = 'none';
    confirmBtn.removeEventListener('click', doTransfer);
    cancelBtn.removeEventListener('click', doCancel);
  };
  confirmBtn.addEventListener('click', doTransfer);
  cancelBtn.addEventListener('click', doCancel);
}

// ═══════════════════════════════════════
//  MOVE GROUP (Costs 1 Action)
// ═══════════════════════════════════════
/**
 * Check if 'candidateId' is a descendant of 'nodeId' (to prevent circular moves).
 */
function isDescendantOf(nodeId, candidateId) {
  const descs = getDescendants(G.nodes, nodeId);
  return descs.includes(candidateId);
}

/**
 * Probe legal attachment slots for a parent by biasing placement toward each side.
 * This lets the move UI expose alternate slots on the same parent, not just a new parent.
 */
function getAttachmentSolutionsForParent(nodeToMove, parentNode, options = {}) {
  if (!nodeToMove || !parentNode) return [];
  const currentParentPortSide = parentNode.id === nodeToMove.parentId ? getResolvedParentPortSide(G.nodes, nodeToMove) : null;

  // Must ignore the entire subtree being moved for the initial per-slot collision check,
  // because descendants are still at their old positions and would falsely block the new placement.
  const subtreeIds = getSubtreeNodeIds(nodeToMove.id);
  const ignoreIds = [...new Set([...subtreeIds, ...(options.ignoreNodeIds || [])])];

  // Use reduced collision padding for move/rearrange operations.
  // Dense networks legitimately have cards placed adjacent to non-parent neighbors
  // (e.g., two children of the same root on adjacent ports). The default padding of 8
  // can block valid placements where the old parent or its siblings are nearby.
  // A padding of 0 still prevents actual pixel-overlap while allowing tight packing.
  const allSolutions = findAllAttachmentSolutions(G.nodes, parentNode, nodeToMove, {
    ignoreNodeIds: ignoreIds,
    collisionPadding: options.collisionPadding ?? 0
  });
  const afterExclude = allSolutions.filter(solution => !(options.excludeCurrentPortSide && currentParentPortSide !== null && solution.parentPortSide === currentParentPortSide));
  const afterOverlap = afterExclude.filter(solution => {
    // Must ignore the parent node — the child is SUPPOSED to be adjacent/touching the parent
    const overlaps = subtreeWouldOverlap(nodeToMove.id, {
      ...solution,
      parentId: parentNode.id
    }, {
      ignoreNodeIds: [nodeToMove.id, parentNode.id]
    });
    return !overlaps;
  });
  return afterOverlap.sort((a, b) => a.parentPortSide - b.parentPortSide || a.score - b.score);
}
function getValidMoveOptions(playerId, nodeId) {
  const node = G.nodes[nodeId];
  if (!node) return [];
  const options = [];

  // Use the core collision padding logic so it matches the board scale.
  // Moving requires slightly looser tolerance so cards can slide past neighbors.
  const padding = 0;
  Object.values(G.nodes).forEach(parent => {
    if (parent.owner !== playerId) return;
    if (parent.id === nodeId) return;
    if (isDescendantOf(nodeId, parent.id)) return;
    // Even if full, we might be able to cascade rearrange
    // if (getFreeArrows(G.nodes, parent.id) <= 0 && parent.id !== node.parentId) return;

    const solutions = getAttachmentSolutionsForParent(node, parent, {
      ignoreNodeIds: [node.id],
      excludeCurrentPortSide: parent.id === node.parentId,
      collisionPadding: padding
    });
    solutions.forEach(solution => {
      options.push({
        parent,
        solution
      });
    });

    // AUTO-REARRANGING (CASCADING MOVES) CHECK
    // If there's a port occupied by a sibling, see if we can push that sibling to another port
    // to make room for this move.
    if (parent.id !== node.parentId) {
      const occupied = getOccupiedWorldOutgoingSides(G.nodes, parent.id, [node.id]);
      const allSides = getWorldOutgoingSides(parent);

      // Only try cascade if there's at least one occupied port AND at least one free port
      if (occupied.size > 0 && occupied.size < allSides.length) {
        for (const targetSide of occupied) {
          const cascadeResult = tryPushSiblings(parent, node, targetSide, new Set(getSubtreeNodeIds(node.id)));
          if (cascadeResult) {
            options.push({
              parent,
              solution: cascadeResult.newNodeSolution,
              cascade: cascadeResult
            });
          }
        }
      }
    }
  });
  return options;
}

// ═══════════════════════════════════════
// NEW: AUTO-REARRANGING (CASCADING MOVES)
// ═══════════════════════════════════════

function tryPushSiblings(parentNode, newNode, targetPortSide, excludeSubtreeIds) {
  // Find the sibling currently occupying this port
  let occupyingSibling = null;
  for (const child of Object.values(G.nodes)) {
    if (child.parentId === parentNode.id && !excludeSubtreeIds.has(child.id)) {
      const side = getResolvedParentPortSide(G.nodes, child);
      if (side === targetPortSide) {
        occupyingSibling = child;
        break;
      }
    }
  }
  if (!occupyingSibling) return null;
  const occupied = getOccupiedWorldOutgoingSides(G.nodes, parentNode.id, [occupyingSibling.id, ...excludeSubtreeIds]);
  const availableSides = getWorldOutgoingSides(parentNode).filter(side => side !== targetPortSide && !occupied.has(side));
  if (availableSides.length === 0) return null;

  // Try to find a valid placement for the sibling on one of the other ports
  for (const altSide of availableSides) {
    const sibSubtreeIds = new Set(getSubtreeNodeIds(occupyingSibling.id));
    const combinedIgnoreIds = new Set([...excludeSubtreeIds, ...sibSubtreeIds, parentNode.id]);
    const desiredIncoming = oppositeSide(altSide);
    const rotationSteps = computeRotationForIncomingSide(occupyingSibling, desiredIncoming);
    const tipPos = getPortWorldTipOffset(parentNode, altSide);
    const newSibPos = {
      x: parentNode.x + tipPos.x,
      y: parentNode.y + tipPos.y
    };
    const trialSib = {
      ...occupyingSibling,
      x: newSibPos.x,
      y: newSibPos.y,
      rotationSteps
    };
    let sibCollision = false;
    for (const other of Object.values(G.nodes)) {
      if (combinedIgnoreIds.has(other.id)) continue;
      if (nodesOverlap(trialSib, other, 0)) {
        sibCollision = true;
        break;
      }
    }
    if (!sibCollision) {
      const newDesiredIncoming = oppositeSide(targetPortSide);
      const newRotation = computeRotationForIncomingSide(newNode, newDesiredIncoming);
      const newTipPos = getPortWorldTipOffset(parentNode, targetPortSide);
      const newTargetPos = {
        x: parentNode.x + newTipPos.x,
        y: parentNode.y + newTipPos.y
      };
      const trialNewNode = {
        ...newNode,
        x: newTargetPos.x,
        y: newTargetPos.y,
        rotationSteps: newRotation
      };
      let newCollision = false;
      for (const other of Object.values(G.nodes)) {
        if (excludeSubtreeIds.has(other.id) || parentNode.id === other.id || sibSubtreeIds.has(other.id)) continue;
        if (nodesOverlap(trialNewNode, other, 0)) {
          newCollision = true;
          break;
        }
      }
      if (!newCollision && nodesOverlap(trialNewNode, trialSib, 0)) {
        newCollision = true;
      }
      if (!newCollision) {
        return {
          siblingToMove: occupyingSibling,
          siblingSolution: {
            x: trialSib.x,
            y: trialSib.y,
            rotationSteps: trialSib.rotationSteps,
            parentPortSide: altSide,
            incomingSide: desiredIncoming
          },
          newNodeSolution: {
            x: trialNewNode.x,
            y: trialNewNode.y,
            rotationSteps: trialNewNode.rotationSteps,
            parentPortSide: targetPortSide,
            incomingSide: newDesiredIncoming
          }
        };
      }
    }
  }
  return null;
}

/**
 * Get valid parent targets for moving a node.
 * A valid target must: be owned by the player, have a legal free slot,
 * NOT be the node itself, and NOT be a descendant of the node.
 * The current parent is allowed if another port on that same parent is available.
 */
function getValidMoveTargets(playerId, nodeId) {
  const moveOptions = getValidMoveOptions(playerId, nodeId);
  const seen = new Set();
  return moveOptions.filter(option => {
    if (seen.has(option.parent.id)) return false;
    seen.add(option.parent.id);
    return true;
  }).map(option => option.parent);
}
function clearRearrangePreview() {
  rearrangePreviewState = null;
  if (gameGraphScene?.clearRearrangePreview) {
    gameGraphScene.clearRearrangePreview();
  }
}
function getBoundsForNodes(nodes) {
  const list = Array.isArray(nodes) ? nodes : Object.values(nodes || {});
  if (list.length === 0) return null;
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  list.forEach(node => {
    if (!node) return;
    const rotation = getNodeRotation(node);
    const halfWidth = rotation % 2 === 1 ? 140 : 100;
    const halfHeight = rotation % 2 === 1 ? 100 : 140;
    minX = Math.min(minX, node.x - halfWidth);
    maxX = Math.max(maxX, node.x + halfWidth);
    minY = Math.min(minY, node.y - halfHeight);
    maxY = Math.max(maxY, node.y + halfHeight);
  });
  if (!Number.isFinite(minX)) return null;
  return {
    minX,
    maxX,
    minY,
    maxY
  };
}
function getBranchBoundsFromPreview(previewNodes) {
  return getBoundsForNodes(previewNodes);
}
function previewFitsBoard(previewNodes, padding = 80) {
  // Don't restrict to viewport — the board is infinite.  Just validate it's not absurdly far away.
  return true;
}

/**
 * Get ALL drag-snap targets for a node, including its current port (snap-back).
 * Unlike getValidMoveOptions (used by the Move Group modal which excludes current port),
 * this includes every legal attachment slot.
 */
function getDragSnapOptions(nodeId) {
  const node = G.nodes[nodeId];
  if (!node) return [];
  const results = [];
  const allNodes = Object.values(G.nodes);
  const candidateParents = allNodes.filter(parent => {
    // Feed Tuning allows dragging other players' nodes, but they must stay in their owner's network
    if (parent.owner !== node.owner) return false;
    if (parent.id === nodeId) return false;
    if (isDescendantOf(nodeId, parent.id)) return false;
    return true;
  });
  candidateParents.forEach(parent => {
    const solutions = getAttachmentSolutionsForParent(node, parent, {
      ignoreNodeIds: [node.id],
      excludeCurrentPortSide: false,
      collisionPadding: 0
    });
    solutions.forEach(solution => {
      results.push({
        parent,
        solution
      });
    });

    // AUTO-REARRANGING (CASCADING MOVES) CHECK
    if (parent.id !== node.parentId) {
      const occupied = getOccupiedWorldOutgoingSides(G.nodes, parent.id, [node.id]);
      const allSides = getWorldOutgoingSides(parent);
      if (occupied.size > 0 && occupied.size < allSides.length) {
        for (const targetSide of occupied) {
          const cascadeResult = tryPushSiblings(parent, node, targetSide, new Set(getSubtreeNodeIds(node.id)));
          if (cascadeResult) {
            results.push({
              parent,
              solution: cascadeResult.newNodeSolution,
              cascade: cascadeResult
            });
          }
        }
      }
    }
  });
  return results;
}
function updateRearrangePreview(nodeId, dragX, dragY) {
  if (!G || !G.nodes[nodeId] || !gameGraphScene?.setRearrangePreview) return null;
  const node = G.nodes[nodeId];
  const dragOptions = getDragSnapOptions(nodeId);
  let best = null;
  dragOptions.forEach(option => {
    const resolvedSolution = option.solution;
    if (!resolvedSolution) return;
    // Must ignore both the moving subtree (auto) and the target parent (adjacent/touching is expected)
    if (subtreeWouldOverlap(nodeId, {
      ...resolvedSolution,
      parentId: option.parent.id
    }, {
      ignoreNodeIds: [nodeId, option.parent.id]
    })) return;
    const previewNodes = getSubtreePreviewNodes(nodeId, {
      ...resolvedSolution,
      parentId: option.parent.id
    });
    if (!previewNodes) return;
    if (!previewFitsBoard(previewNodes)) return;

    // Measure distance from the drag point to the card's snap position center
    const placedRoot = previewNodes[nodeId] || {
      ...node,
      ...resolvedSolution
    };
    const dx = placedRoot.x - dragX;
    const dy = placedRoot.y - dragY;
    const score = dx * dx + dy * dy;
    const magnetic = score <= DRAG_MAGNET_DISTANCE * DRAG_MAGNET_DISTANCE;
    const snapped = score <= DRAG_SNAP_DISTANCE * DRAG_SNAP_DISTANCE;
    if (!best || score < best.score) {
      best = {
        parent: option.parent,
        solution: {
          ...resolvedSolution,
          parentId: option.parent.id
        },
        score,
        snapped,
        magnetic,
        previewNodes,
        cascade: option.cascade
      };
    }
  });
  if (!best) {
    clearRearrangePreview();
    return null;
  }
  rearrangePreviewState = {
    nodeId,
    parentId: best.parent.id,
    solution: best.solution,
    score: best.score,
    snapped: best.snapped,
    magnetic: best.magnetic,
    previewNodes: best.previewNodes,
    cascade: best.cascade
  };
  gameGraphScene.setRearrangePreview(rearrangePreviewState);
  return rearrangePreviewState;
}
function focusCameraOnPlayerNetwork(playerId, options = {}) {
  if (!G || !gameGraphScene || !playerId) return false;
  const player = G.players?.[playerId];
  const rootId = player?.rootNodeId || `root_${playerId}`;
  const root = G.nodes[rootId];
  const owned = Object.values(G.nodes || {}).filter(n => n.owner === playerId);
  const networkIds = new Set(root ? [root.id, ...getDescendants(G.nodes, root.id)] : owned.map(n => n.id));
  let networkNodes = [...networkIds].map(id => G.nodes[id]).filter(Boolean);

  // If the root is missing or ownership data is mid-sync, still focus on any
  // owned cards rather than silently leaving the camera on the previous player.
  if (networkNodes.length === 0) networkNodes = owned;
  if (networkNodes.length === 0) {
    console.warn('[camera] Unable to focus player network — no nodes found for', playerId);
    return false;
  }
  const bounds = getBoundsForNodes(networkNodes);
  if (!bounds) return false;
  const cx = (bounds.minX + bounds.maxX) / 2;
  const cy = (bounds.minY + bounds.maxY) / 2;
  const width = Math.max(900, bounds.maxX - bounds.minX + 620);
  const height = Math.max(700, bounds.maxY - bounds.minY + 520);
  const cam = gameGraphScene.cameras.main;
  const zoomX = cam.width / width;
  const zoomY = cam.height / height;
  const rawZoom = options.zoom ?? Math.min(zoomX, zoomY);
  const targetZoom = Phaser.Math.Clamp(rawZoom, 0.38, 0.95);
  const duration = options.duration ?? 700;

  // Snap immediately on multiplayer handoff to defeat stale in-flight pan/zoom
  // effects and guarantee every client lands on the incoming active network.
  if (options.snap && gameGraphScene.snapCameraTo) {
    gameGraphScene.snapCameraTo(cx, cy, targetZoom);
  } else {
    if (cam.panEffect?.isRunning) cam.panEffect.reset();
    if (cam.zoomEffect?.isRunning) cam.zoomEffect.reset();
    gameGraphScene.centerCameraOn(cx, cy, duration);
    gameGraphScene.zoomCameraTo(targetZoom, duration);
  }
  console.log('[camera] Focused network', {
    playerId,
    nodes: networkNodes.length,
    cx,
    cy,
    targetZoom,
    snap: !!options.snap
  });
  return true;
}
function scheduleCameraFocusOnPlayerNetwork(playerId, options = {}) {
  const attempts = options.attempts ?? 5;
  const delay = options.delay ?? 80;
  let remaining = attempts;
  const tryFocus = () => {
    const focused = focusCameraOnPlayerNetwork(playerId, options);
    remaining--;
    if (!focused && remaining > 0) {
      setTimeout(tryFocus, delay);
    }
  };
  setTimeout(tryFocus, options.initialDelay ?? 0);
}
function showMoveGroupModal(nodeToMove) {
  const modal = document.getElementById('move-modal');
  if (!modal) return;
  const list = document.getElementById('move-targets');
  const warning = document.getElementById('move-warning');
  const sourceInfo = document.getElementById('move-source-info');
  const actionsLeft = actionsRemaining();
  sourceInfo.innerText = `Moving: ${nodeToMove.icon || '🌐'} ${nodeToMove.name}  ·  ⚠ Costs 1 action (${actionsLeft} left)`;
  const moveOptions = getValidMoveOptions(HUMAN_ID, nodeToMove.id);
  const sideNames = ['N', 'E', 'S', 'W'];
  list.innerHTML = '';
  moveOptions.forEach(option => {
    const free = getFreeArrows(G.nodes, option.parent.id);
    const sameParent = option.parent.id === nodeToMove.parentId;
    const opt = document.createElement('option');
    opt.value = `${option.parent.id}|${option.solution.parentPortSide}`;
    opt.textContent = `${option.parent.icon || '🌐'} ${option.parent.name} (${sameParent ? 'same parent' : `${free} free 🔗`} · port ${sideNames[option.solution.parentPortSide] || '?'})`;
    list.appendChild(opt);
  });

  // Show warning about subtree moving with the node
  const descendants = getDescendants(G.nodes, nodeToMove.id);
  if (descendants.length > 0) {
    warning.style.display = 'block';
    warning.innerText = `⚠ ${descendants.length} child group${descendants.length > 1 ? 's' : ''} will move with this node.`;
  } else {
    warning.style.display = 'none';
  }
  modal.style.display = 'flex';
  const confirmBtn = document.getElementById('move-confirm');
  const cancelBtn = document.getElementById('move-cancel');
  const doMove = () => {
    const selectedValue = list.value;
    const [newParentId, portSideRaw] = selectedValue.split('|');
    if (!newParentId || !G.nodes[newParentId]) {
      modal.style.display = 'none';
      cleanup();
      return;
    }
    const newParent = G.nodes[newParentId];
    const desiredPortSide = Number(portSideRaw);
    const option = getValidMoveOptions(HUMAN_ID, nodeToMove.id).find(o => o.parent.id === newParentId && o.solution.parentPortSide === desiredPortSide);
    if (!option) {
      logEvent('That slot is no longer available.', 'failure');
      modal.style.display = 'none';
      cleanup();
      refreshAll();
      return;
    }
    if (option.cascade) {
      // Execute the sibling move first
      const sib = option.cascade.siblingToMove;
      const sibSol = option.cascade.siblingSolution;
      sib.x = sibSol.x;
      sib.y = sibSol.y;
      sib.rotationSteps = sibSol.rotationSteps;
      sib.parentPortSide = sibSol.parentPortSide;

      // Propagate transforms to sibling's children
      const sibSubtreeIds = new Set(getSubtreeNodeIds(sib.id));
      sibSubtreeIds.delete(sib.id);
      const transformStack = [{
        node: sib,
        prevX: G.nodes[sib.id].x,
        prevY: G.nodes[sib.id].y,
        dRot: sibSol.rotationSteps - (G.nodes[sib.id].rotationSteps || 0)
      }];
      while (transformStack.length > 0) {
        const {
          node,
          prevX,
          prevY,
          dRot
        } = transformStack.pop();
        const children = Object.values(G.nodes).filter(c => c.parentId === node.id);
        for (const child of children) {
          const childOldX = child.x;
          const childOldY = child.y;
          const childOldRot = child.rotationSteps || 0;
          const dx = childOldX - prevX;
          const dy = childOldY - prevY;
          const angle = dRot * (Math.PI / 2);
          child.x = node.x + (dx * Math.cos(angle) - dy * Math.sin(angle));
          child.y = node.y + (dx * Math.sin(angle) + dy * Math.cos(angle));
          child.rotationSteps = (childOldRot + dRot + 4) % 4;
          transformStack.push({
            node: child,
            prevX: childOldX,
            prevY: childOldY,
            dRot
          });
        }
      }
      logEvent(`🔀 Cascade Move: ${sib.name} nudged to make room.`, 'info');
    }

    // Re-check action availability at confirm time in case state changed
    // (e.g. an attack got resolved between opening and confirming the modal).
    if (!canSpendAction()) {
      logEvent('No actions left this turn — move cancelled.', 'warning');
      modal.style.display = 'none';
      cleanup();
      refreshAll();
      return;
    }
    const moved = moveSubtreeWithAttachment(nodeToMove.id, newParent, option.solution, HUMAN_ID);
    if (!moved) {
      logEvent('That move would cause a collision in the network.', 'failure');
      modal.style.display = 'none';
      cleanup();
      refreshAll();
      return;
    }
    spendAction();
    networkLog(`🔀 Moved ${nodeToMove.name} to ${newParent.name} on port ${sideNames[option.solution.parentPortSide] || '?'}. (cost 1 action)`, 'success');
    modal.style.display = 'none';
    cleanup();
    refreshAll();
    syncState();
  };
  const doCancel = () => {
    modal.style.display = 'none';
    cleanup();
  };
  function cleanup() {
    confirmBtn.removeEventListener('click', doMove);
    cancelBtn.removeEventListener('click', doCancel);
  }
  confirmBtn.addEventListener('click', doMove);
  cancelBtn.addEventListener('click', doCancel);
}
if (btnMoveGroup) {
  btnMoveGroup.addEventListener('click', () => {
    if (!G || !isMyTurn()) return;
    if (!canSpendAction()) {
      logEvent('No actions left this turn — cannot move a group.', 'warning');
      return;
    }
    const node = mySelectedNodeId ? G.nodes[mySelectedNodeId] : null;
    if (!node || node.owner !== HUMAN_ID || node.type === 'root') return;
    const targets = getValidMoveTargets(HUMAN_ID, node.id);
    if (targets.length === 0) {
      // Give a more descriptive error — distinguish "no free slots anywhere" from "slots exist but collision blocks"
      const ownedWithSlots = Object.values(G.nodes).filter(n => n.owner === HUMAN_ID && n.id !== node.id && !getDescendants(G.nodes, node.id).includes(n.id) && (getFreeArrows(G.nodes, n.id) > 0 || n.id === node.parentId));
      if (ownedWithSlots.length === 0) {
        logEvent('No valid parent nodes with free slots.', 'failure');
      } else {
        logEvent('Free slots exist, but all placements are blocked by adjacent cards. Try rearranging nearby groups first.', 'failure');
      }
      return;
    }
    showMoveGroupModal(node);
  });
}

// ═══════════════════════════════════════
//  FACTION ABILITY HANDLERS
// ═══════════════════════════════════════

function showOutrageCascadeModal() {
  const modal = document.getElementById('outrage-modal');
  if (!modal) return;
  const list = document.getElementById('outrage-targets');
  list.innerHTML = '';

  // Can target any group on the board that's not a faction root
  const targets = Object.values(G.nodes).filter(n => n.type !== 'root');
  targets.sort((a, b) => a.resistance - b.resistance); // Show weakest first

  targets.forEach(n => {
    const opt = document.createElement('option');
    opt.value = n.id;
    const ownerName = n.owner ? n.owner === HUMAN_ID ? 'YOU' : G.players[n.owner]?.name || '?' : 'Neutral';
    const rLabel = n.resistance <= 1 ? `R:${n.resistance} → +1P!` : `R:${n.resistance} → R:${n.resistance - 1}`;
    opt.textContent = `${n.icon || '🌐'} ${n.name} (${rLabel}) [${ownerName}]`;
    list.appendChild(opt);
  });
  modal.style.display = 'flex';
  const confirmBtn = document.getElementById('outrage-confirm');
  const cancelBtn = document.getElementById('outrage-cancel');
  const doOutrage = () => {
    const targetId = list.value;
    if (!targetId) {
      modal.style.display = 'none';
      cleanup();
      return;
    }
    const result = applyNarrativeAgitation(G.nodes, targetId, HUMAN_ID);
    G.factionAbilityUsed[HUMAN_ID] = true;
    if (result) {
      if (result.type === 'resistance') {
        networkLog(`📢 Outrage Cascade: ${result.targetIcon} ${result.targetName} Resistance reduced to ${result.newRes}!`, 'success');
        networkSfx('attack');
      } else {
        networkLog(`📢 Outrage Cascade: ${result.targetIcon} ${result.targetName} already fragile — +1 Power gained!`, 'success');
        networkSfx('success');
      }
    }
    modal.style.display = 'none';
    cleanup();
    refreshAll();
    syncState();
  };
  const doCancel = () => {
    modal.style.display = 'none';
    cleanup();
  };
  function cleanup() {
    confirmBtn.removeEventListener('click', doOutrage);
    cancelBtn.removeEventListener('click', doCancel);
  }
  confirmBtn.addEventListener('click', doOutrage);
  cancelBtn.addEventListener('click', doCancel);
}
function showPermanentNetworkModal() {
  const modal = document.getElementById('permanent-network-modal');
  if (!modal) return;
  const btnUndermine = document.getElementById('pn-btn-undermine');
  const btnExtract = document.getElementById('pn-btn-extract');
  const btnErase = document.getElementById('pn-btn-erase');
  const btnEntrench = document.getElementById('pn-btn-entrench');
  const targetSection = document.getElementById('pn-target-section');
  const targetSelect = document.getElementById('pn-target-select');
  const targetLabel = document.getElementById('pn-target-label');
  const confirmBtn = document.getElementById('pn-confirm');
  const cancelBtn = document.getElementById('pn-cancel');
  let selectedOp = null;

  // Reset UI
  targetSection.style.display = 'none';
  confirmBtn.style.display = 'none';
  [btnUndermine, btnExtract, btnErase, btnEntrench].forEach(btn => {
    btn.style.opacity = '1';
    btn.style.boxShadow = 'none';
  });
  const highlightBtn = activeBtn => {
    [btnUndermine, btnExtract, btnErase, btnEntrench].forEach(btn => {
      btn.style.opacity = btn === activeBtn ? '1' : '0.5';
      btn.style.boxShadow = btn === activeBtn ? `0 0 15px ${window.getComputedStyle(btn).borderColor}` : 'none';
    });
    confirmBtn.style.display = 'block';
  };
  btnUndermine.onclick = () => {
    selectedOp = 'undermine';
    highlightBtn(btnUndermine);
    const enemies = Object.values(G.nodes).filter(n => n.owner && n.owner !== HUMAN_ID && n.type !== 'root' && (n.resistance || 0) > 0);
    targetSelect.innerHTML = '';
    enemies.forEach(n => {
      const opt = document.createElement('option');
      opt.value = n.id;
      opt.textContent = `${n.icon || '🌐'} ${n.name} (R:${n.resistance})`;
      targetSelect.appendChild(opt);
    });
    targetLabel.innerText = 'SELECT ENEMY TARGET (R > 0)';
    targetSection.style.display = enemies.length > 0 ? 'block' : 'none';
    confirmBtn.disabled = enemies.length === 0;
  };
  btnExtract.onclick = () => {
    selectedOp = 'extract';
    highlightBtn(btnExtract);
    targetSection.style.display = 'none';
    confirmBtn.disabled = false;
  };
  btnErase.onclick = () => {
    selectedOp = 'erase';
    highlightBtn(btnErase);
    targetSection.style.display = 'none';
    confirmBtn.disabled = G.deck.length === 0;
  };
  btnEntrench.onclick = () => {
    selectedOp = 'entrench';
    highlightBtn(btnEntrench);
    const allies = Object.values(G.nodes).filter(n => n.owner === HUMAN_ID && n.type !== 'root');
    targetSelect.innerHTML = '';
    allies.forEach(n => {
      const opt = document.createElement('option');
      opt.value = n.id;
      opt.textContent = `${n.icon || '🌐'} ${n.name} (R:${n.resistance})`;
      targetSelect.appendChild(opt);
    });
    targetLabel.innerText = 'SELECT ALLIED TARGET';
    targetSection.style.display = allies.length > 0 ? 'block' : 'none';
    confirmBtn.disabled = allies.length === 0;
  };
  const doExecute = () => {
    if (!selectedOp) return;
    G.factionAbilityUsed[HUMAN_ID] = true;
    let p = G.players[HUMAN_ID];
    if (selectedOp === 'undermine') {
      const targetId = targetSelect.value;
      if (targetId && G.nodes[targetId]) {
        G.nodes[targetId].resistance = Math.max(0, (G.nodes[targetId].resistance || 0) - 1);
        logEvent(`🕴️ Permanent Network: Undermined ${G.nodes[targetId].name} (-1 R).`, 'success');
      }
    } else if (selectedOp === 'extract') {
      const myRoot = G.nodes[p.rootNodeId];
      if (myRoot) {
        myRoot.btc = (myRoot.btc || 0) + 2;
        logEvent(`🕴️ Permanent Network: Extracted funds (+₿2 to Vault).`, 'success');
      }
    } else if (selectedOp === 'erase') {
      if (G.deck.length > 0) {
        logEvent(`🕴️ Permanent Network: Erasing tracks...`, 'success');
        drawTurnCard(HUMAN_ID);
      }
    } else if (selectedOp === 'entrench') {
      const targetId = targetSelect.value;
      if (targetId && G.nodes[targetId]) {
        G.nodes[targetId].resistance = (G.nodes[targetId].resistance || 0) + 1;
        logEvent(`🕴️ Permanent Network: Entrenched ${G.nodes[targetId].name} (+1 R).`, 'success');
      }
    }
    modal.style.display = 'none';
    cleanup();
    refreshAll();
    syncState();
  };
  const doCancel = () => {
    modal.style.display = 'none';
    cleanup();
  };
  function cleanup() {
    confirmBtn.removeEventListener('click', doExecute);
    cancelBtn.removeEventListener('click', doCancel);
  }
  confirmBtn.addEventListener('click', doExecute);
  cancelBtn.addEventListener('click', doCancel);
  modal.style.display = 'flex';
}
function showFluidTokenomicsModal() {
  const modal = document.getElementById('tokenomics-modal');
  if (!modal) return;
  const sourceList = document.getElementById('tokenomics-source');
  const destList = document.getElementById('tokenomics-dest');
  const myNodes = Object.values(G.nodes).filter(n => n.owner === HUMAN_ID);
  const sources = myNodes.filter(n => (n.btc || 0) > 0);
  sourceList.innerHTML = '';
  sources.forEach(n => {
    const opt = document.createElement('option');
    opt.value = n.id;
    opt.textContent = `${n.icon || '🌐'} ${n.name} (₿${n.btc || 0})`;
    sourceList.appendChild(opt);
  });
  function updateDest() {
    destList.innerHTML = '';
    const srcId = sourceList.value;
    myNodes.filter(n => n.id !== srcId).forEach(n => {
      const opt = document.createElement('option');
      opt.value = n.id;
      opt.textContent = `${n.icon || '🌐'} ${n.name} (₿${n.btc || 0})`;
      destList.appendChild(opt);
    });
  }
  updateDest();
  sourceList.addEventListener('change', updateDest);
  modal.style.display = 'flex';
  const confirmBtn = document.getElementById('tokenomics-confirm');
  const cancelBtn = document.getElementById('tokenomics-cancel');
  const doTokenomics = () => {
    const fromId = sourceList.value;
    const toId = destList.value;
    if (!fromId || !toId) {
      modal.style.display = 'none';
      cleanup();
      return;
    }
    const amount = applyFluidTokenomics(G.nodes, fromId, toId, HUMAN_ID);
    G.factionAbilityUsed[HUMAN_ID] = true;
    if (amount > 0) {
      const fromNode = G.nodes[fromId];
      const toNode = G.nodes[toId];
      networkLog(`⛓️ Fluid Tokenomics: ₿${amount} teleported from ${fromNode?.name || '?'} → ${toNode?.name || '?'}!`, 'success');
      networkSfx('economy');
    } else {
      networkLog(`⛓️ Fluid Tokenomics: No ₿TC to transfer.`, 'warning');
    }
    modal.style.display = 'none';
    cleanup();
    refreshAll();
    syncState();
  };
  const doCancel = () => {
    modal.style.display = 'none';
    cleanup();
  };
  function cleanup() {
    confirmBtn.removeEventListener('click', doTokenomics);
    cancelBtn.removeEventListener('click', doCancel);
    sourceList.removeEventListener('change', updateDest);
  }
  confirmBtn.addEventListener('click', doTokenomics);
  cancelBtn.addEventListener('click', doCancel);
}
let _endTurnInProgress = false;
btnEndTurn.addEventListener('click', () => {
  console.log('[ui] End Turn clicked. G:', !!G, 'isMyTurn:', G ? isMyTurn() : null, 'winner:', G?.winner, 'activePlayerIndex:', G?.activePlayerIndex, 'HUMAN_ID:', HUMAN_ID, 'activePlayerId:', G ? getActivePlayerId() : null);
  if (_endTurnInProgress) {
    console.warn('[ui] End Turn ignored: handoff already in progress.');
    return;
  }
  if (!G) {
    console.warn('[ui] End Turn aborted: no G state.');
    return;
  }
  if (!isMyTurn()) {
    console.warn('[ui] End Turn aborted: not my turn (active is', getActivePlayerId(), ').');
    return;
  }
  if (G.winner) {
    console.warn('[ui] End Turn aborted: game already won.');
    return;
  }
  // ─── Tutorial: block end turn if tutorial isn't ready ───
  if (isTutorialMode && tutorial.isActive()) {
    const blocked = tutorial.isActionBlocked('end_turn');
    if (blocked) {
      logEvent(blocked, 'failure');
      return;
    }
  }
  endCurrentTurn();
});
document.getElementById('btn-reset').addEventListener('click', () => {
  if (confirm("Reset the entire network?")) {
    G = null;
    mySelectedNodeId = null;
    mySelectedHandCardIndex = null;
    selectedAttackerNodeId = null;
    if (tutorial.isActive()) tutorial.destroy();
    isTutorialMode = false;
    if (gameGraphScene) {
      Object.values(gameGraphScene.nodeGraphics).forEach(g => g.container.destroy());
      Object.values(gameGraphScene.linkGraphics).forEach(g => g.destroy());
      gameGraphScene.nodeGraphics = {};
      gameGraphScene.linkGraphics = {};
    }
    // Show mode selection again instead of faction selection
    document.getElementById('mode-modal').style.display = 'flex';
  }
});

// ═══════════════════════════════════════
//  MOBILE SIDEBAR TOGGLE
// ═══════════════════════════════════════
const sidebarToggle = document.getElementById('sidebar-toggle');
const sidebarOverlay = document.getElementById('sidebar-overlay');
const sidebar = document.getElementById('sidebar');
if (sidebarToggle && sidebar && sidebarOverlay) {
  sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    sidebarOverlay.classList.toggle('active');
  });
  sidebarOverlay.addEventListener('click', () => {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('active');
  });
}

// ═══════════════════════════════════════
//  DESKTOP PANEL TOGGLES
// ═══════════════════════════════════════
const leftPanel = document.getElementById('sidebar');
const rightPanel = document.getElementById('details-panel');
const toggleLeftBtn = document.getElementById('toggle-left-panel');
const toggleRightBtn = document.getElementById('toggle-right-panel');
if (toggleLeftBtn && leftPanel) {
  toggleLeftBtn.addEventListener('click', () => {
    leftPanel.classList.toggle('collapsed');
    const isCollapsed = leftPanel.classList.contains('collapsed');
    toggleLeftBtn.innerText = isCollapsed ? '▶' : '◀';
    setTimeout(() => {
      if (phaserGame && phaserGame.scale) phaserGame.scale.resize(phaserGame.scale.parentSize.width, phaserGame.scale.parentSize.height);
    }, 310);
  });
}
if (toggleRightBtn && rightPanel) {
  toggleRightBtn.addEventListener('click', () => {
    rightPanel.classList.toggle('collapsed');
    const isCollapsed = rightPanel.classList.contains('collapsed');
    toggleRightBtn.innerText = isCollapsed ? '◀' : '▶';
    setTimeout(() => {
      if (phaserGame && phaserGame.scale) phaserGame.scale.resize(phaserGame.scale.parentSize.width, phaserGame.scale.parentSize.height);
    }, 310);
  });
}

// ═══════════════════════════════════════
//  ALIGNMENT REFERENCE MODAL
// ═══════════════════════════════════════
function buildAlignmentRefPanel() {
  const modal = document.getElementById('alignment-modal');
  const grid = document.getElementById('alignment-grid');
  const btn = document.getElementById('btn-alignment-ref');
  const closeBtn = document.getElementById('alignment-close');
  if (!modal || !grid || !btn) return;

  // Build the alignment cards into the grid
  let html = '';
  Object.entries(ALIGNMENT_INFO).forEach(([name, info]) => {
    const opposed = ALIGNMENT_OPPOSED[name];
    const tension = ALIGNMENT_TENSION[name];
    const opposedInfo = opposed ? ALIGNMENT_INFO[opposed] : null;
    const tensionInfo = tension ? ALIGNMENT_INFO[tension] : null;
    html += `
        <div style="background: rgba(10,14,17,0.85); border: 1px solid ${info.color}55; border-left: 4px solid ${info.color}; border-radius: 6px; padding: 14px; display: flex; flex-direction: column; gap: 8px; box-shadow: 0 0 12px ${info.color}11;">
            <div style="display:flex; align-items:center; gap:10px;">
                <span style="font-size: 26px; line-height: 1; filter: drop-shadow(0 0 6px ${info.color}88);">${info.icon}</span>
                <span style="font-family: var(--font-mono); font-size: 16px; color: ${info.color}; font-weight: bold; letter-spacing: 1px;">${name.toUpperCase()}</span>
            </div>
            <div style="font-size: 12px; color: #a0aec0; line-height: 1.4; min-height: 34px;">${info.desc}</div>
            <div style="border-top: 1px solid rgba(255,255,255,0.06); padding-top: 8px; display: flex; flex-direction: column; gap: 4px; font-family: var(--font-mono); font-size: 11px;">
                ${opposed ? `<div style="display:flex; align-items:center; gap:6px;"><span style="color: var(--accent-red); font-weight: bold; min-width: 70px;">OPPOSED −4</span><span style="color: ${opposedInfo?.color || '#fff'};">${opposedInfo?.icon || ''} ${opposed}</span></div>` : ''}
                ${tension ? `<div style="display:flex; align-items:center; gap:6px;"><span style="color: var(--accent-yellow); font-weight: bold; min-width: 70px;">TENSION −2</span><span style="color: ${tensionInfo?.color || '#fff'};">${tensionInfo?.icon || ''} ${tension}</span></div>` : ''}
                <div style="display:flex; align-items:center; gap:6px;"><span style="color: var(--accent-green); font-weight: bold; min-width: 70px;">MATCH +4</span><span style="color: ${info.color};">${info.icon} ${name} (mirror)</span></div>
            </div>
        </div>`;
  });
  grid.innerHTML = html;
  const open = () => {
    modal.style.display = 'flex';
    SFX.playClick();
  };
  const close = () => {
    modal.style.display = 'none';
    SFX.playClick();
  };
  btn.addEventListener('click', e => {
    e.preventDefault();
    open();
  });
  if (closeBtn) closeBtn.addEventListener('click', close);

  // Click on dim background closes the modal
  modal.addEventListener('click', e => {
    if (e.target === modal) close();
  });
}
buildAlignmentRefPanel();

// ═══════════════════════════════════════
//  ONBOARDING TUTORIAL
// ═══════════════════════════════════════
const TUTORIAL_STEPS = [{
  target: '#phaser-container',
  title: '🕸️ POWER STRUCTURE',
  text: 'This is your power network. Your faction root is the green node. Drag nodes to rearrange. Scroll to zoom, drag background to pan.',
  position: 'center'
}, {
  target: '.hand-container',
  title: '🃏 YOUR HAND',
  text: 'Groups in your hand can be deployed. Select a card, then pick an attacker node with a free slot (○) to attempt control. You get one main attack action per turn.',
  position: 'top'
}, {
  target: '.details-panel',
  title: '⚔️ OPERATIONS PANEL',
  text: 'When you select a target, you\'ll see attack buttons with success probabilities. Alignment matching provides huge bonuses to your attack strength.',
  position: 'left'
}, {
  target: '#phaser-container',
  title: '🪙 BITCOIN PIPELINES',
  text: 'There is no global bank. Groups generate ₿TC during the Income phase. To spend ₿TC in an attack, it must flow through connected arrows from the groups you control to the attacker.',
  position: 'center'
}, {
  target: '#faction-ability-panel',
  title: '⚡ FACTION ABILITIES',
  text: 'Your faction has unique active and passive abilities. Check them here to gain an edge over your rivals.',
  position: 'top'
}, {
  target: '#top-ticker-container',
  title: '🌍 GLOBAL EVENTS',
  text: 'Global events shift the rules of the game each round. Keep an eye on this ticker to adapt your strategy.',
  position: 'bottom'
}, {
  target: '#btn-nav-victory',
  title: '🏆 VICTORY CONDITIONS',
  text: 'Click here to track your unique victory condition progress. Each faction wins differently. Good luck, Chairman!',
  position: 'right'
}, {
  target: '#btn-end-turn',
  title: '⏭️ END TURN',
  text: 'When your actions are complete, or you want to pass, click here. Your turn will also auto-end if you run out of valid moves.',
  position: 'top'
}];
let tutorialStep = 0;
let tutorialActive = false;
function showTutorial() {
  if (localStorage.getItem('omnis_tutorial_done')) return;
  if (isTutorialMode) return; // Scripted tutorial handles its own guidance
  tutorialActive = true;
  tutorialStep = 0;
  showTutorialStep();
}
function showTutorialStep() {
  // Remove existing tooltip
  const existing = document.querySelector('.tutorial-tooltip');
  if (existing) existing.remove();
  const existingOverlay = document.querySelector('.tutorial-overlay');
  if (existingOverlay) existingOverlay.remove();
  if (tutorialStep >= TUTORIAL_STEPS.length) {
    tutorialActive = false;
    localStorage.setItem('omnis_tutorial_done', '1');
    return;
  }
  const step = TUTORIAL_STEPS[tutorialStep];

  // Overlay
  const overlay = document.createElement('div');
  overlay.className = 'tutorial-overlay';
  document.body.appendChild(overlay);

  // Tooltip
  const tooltip = document.createElement('div');
  tooltip.className = 'tutorial-tooltip';
  tooltip.innerHTML = `
        <div class="tutorial-title">${step.title}</div>
        <div class="tutorial-text">${step.text}</div>
        <div class="tutorial-nav">
            <span class="tutorial-counter">${tutorialStep + 1}/${TUTORIAL_STEPS.length}</span>
            <div class="tutorial-buttons">
                ${tutorialStep > 0 ? '<button class="tutorial-btn tutorial-back">← BACK</button>' : ''}
                <button class="tutorial-btn tutorial-skip">SKIP</button>
                <button class="tutorial-btn tutorial-next">${tutorialStep === TUTORIAL_STEPS.length - 1 ? 'FINISH ✓' : 'NEXT →'}</button>
            </div>
        </div>
    `;
  document.body.appendChild(tooltip);

  // Position near target
  const targetEl = document.querySelector(step.target);
  if (targetEl) {
    const rect = targetEl.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    if (step.position === 'center') {
      tooltip.style.left = Math.max(10, rect.left + rect.width / 2 - tooltipRect.width / 2) + 'px';
      tooltip.style.top = Math.max(10, rect.top + rect.height / 2 - tooltipRect.height / 2) + 'px';
    } else if (step.position === 'top') {
      tooltip.style.left = Math.max(10, rect.left + rect.width / 2 - tooltipRect.width / 2) + 'px';
      tooltip.style.top = Math.max(10, rect.top - tooltipRect.height - 15) + 'px';
    } else if (step.position === 'bottom') {
      tooltip.style.left = Math.max(10, rect.left + rect.width / 2 - tooltipRect.width / 2) + 'px';
      tooltip.style.top = rect.bottom + 15 + 'px';
    } else if (step.position === 'left') {
      tooltip.style.left = Math.max(10, rect.left - tooltipRect.width - 15) + 'px';
      tooltip.style.top = Math.max(10, rect.top + rect.height / 2 - tooltipRect.height / 2) + 'px';
    } else if (step.position === 'right') {
      tooltip.style.left = rect.right + 15 + 'px';
      tooltip.style.top = Math.max(10, rect.top + rect.height / 2 - tooltipRect.height / 2) + 'px';
    }

    // Keep on screen
    const finalRect = tooltip.getBoundingClientRect();
    if (finalRect.right > window.innerWidth) tooltip.style.left = window.innerWidth - finalRect.width - 10 + 'px';
    if (finalRect.bottom > window.innerHeight) tooltip.style.top = window.innerHeight - finalRect.height - 10 + 'px';
    if (finalRect.left < 0) tooltip.style.left = '10px';
    if (finalRect.top < 0) tooltip.style.top = '10px';
  }

  // Event listeners
  tooltip.querySelector('.tutorial-next').addEventListener('click', () => {
    tutorialStep++;
    showTutorialStep();
  });
  tooltip.querySelector('.tutorial-skip').addEventListener('click', () => {
    tutorialStep = TUTORIAL_STEPS.length;
    showTutorialStep();
  });
  const backBtn = tooltip.querySelector('.tutorial-back');
  if (backBtn) backBtn.addEventListener('click', () => {
    tutorialStep--;
    showTutorialStep();
  });
  overlay.addEventListener('click', () => {
    tutorialStep++;
    showTutorialStep();
  });
}

// Show tutorial 1.5s after game starts (on first turn only)
let tutorialShown = false;

// We need a simpler approach — just call it directly after startGame completes
// We'll add a postStart hook via a monkey-patch on the existing flow.
// Actually simplest: just trigger after faction modal closes with a delay.
const factionModal = document.getElementById('faction-modal');
const observer = new MutationObserver(mutations => {
  for (const m of mutations) {
    if (m.type === 'attributes' && m.attributeName === 'style') {
      if (factionModal.style.display === 'none' && !tutorialShown && G) {
        tutorialShown = true;
        setTimeout(showTutorial, 1500);
      }
    }
  }
});
observer.observe(factionModal, {
  attributes: true
});

// Mode selection triggers Faction selection.