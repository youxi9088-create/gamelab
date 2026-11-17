// ═══════════════════════════════════════
//  OMNIS GLOBAL INITIATIVE — SCRIPTED TUTORIAL
// ═══════════════════════════════════════
// A fully-guided 7-turn tutorial against 1 AI opponent.
// Teaches all core mechanics progressively with a
// tutorial-specific win condition (control 3 groups).
//
// IMPORTANT: This tutorial assumes the new "shared market" paradigm:
//   • Players DRAW only Action Cards into their private hand.
//   • Group Cards spawn DIRECTLY into the Uncontrolled Zone (centre of board).
//   • Players FIGHT over groups in the shared market — they don't "play" them.
//   • Action Cards are private; Groups are public from the moment they appear.

const TUTORIAL_WIN_GROUPS = 3;

// ─── Tutorial Faction (simplified for teaching) ───
const TUTORIAL_FACTION_ID = 'f_natsec'; // National Security — high power, simple
const TUTORIAL_AI_FACTION_ID = 'f_cult'; // Culture-War Architects — clear foil

// ─── Tutorial-curated seeded groups (placed pre-game in Uncontrolled Zone) ───
// These groups spawn into the central market at game start so the player has
// 4 known targets to fight over during the scripted opening.
//   • g_drone   — player target on T1 (Government+Corporate, R2; NSA gets +4 alignment match)
//   • n_tabloid — player target on T2 (Media+Populist, R1, easy and neutral alignment)
//   • n_podcast — AI capture target on T1 end (Resistance 1)
//   • n_meme    — AI capture target on T2 end (Resistance 1)
const TUTORIAL_SEEDED_NEUTRALS = ['g_drone', 'n_tabloid', 'n_podcast', 'n_meme'];

// ─── Tutorial market refill order (Group cards spawned via end-of-turn refill) ───
// One card is popped from this list each time the deck would normally surface a
// Group card during hand refill. Keeping this curated guarantees the same cards
// appear in the market every play-through. Variety of mid-resistance options
// ensure T4–T7 always have viable targets.
const TUTORIAL_MARKET_REFILL_ORDER = [
    'n_esports',    // R1, low — easy T4 capture
    'n_astro',      // R1, low — backup T4
    'n_charity',    // R3 — mid difficulty
    'n_biotech',    // R1 — easy
    'n_fashion',    // R2 — mid
    'n_thinktank',  // R3 — hub w/ 3 arrows
    'n_smuggle',    // R2 — high income
    'n_bureau',     // R5 — challenge target
];

// ─── Tutorial-curated hand (Action Cards only — Groups never go into hands) ───
// Tutorial only forces an action card into the human's hand on Turn 6.
const TUTORIAL_PLAYER_HAND_T6 = ['act_token_airdrop'];

// ─── Tutorial market size ───
// Smaller than the regular game's market (≈ playerCount + 4) so the tutorial
// stage feels intimate and every visible card is meaningful.
const TUTORIAL_MARKET_SIZE = 4;

// ─── AI's intended captures (so it builds a network for player to attack on T5) ───
const TUTORIAL_AI_CAPTURES = ['n_podcast', 'n_meme'];

// ─── Step definitions ───
// Each step has: turn, phase, id, title, text, highlight (CSS selector or null),
// waitFor (condition key), position, optional requiredCard / waitLabel / offsetX/Y / noOverlayDim
// IMPORTANT — Step authoring conventions for the curated tutorial:
//   • Use noOverlayDim: true on EVERY step where the player must click something
//     other than the tooltip's NEXT button. The dim overlay would otherwise visually
//     obscure the very target the player is supposed to interact with.
//   • The 'highlight' selector draws a glowing pulse ring around the target —
//     it's pointer-events: none, so it never blocks clicks.
//   • The four seeded neutrals are guaranteed to spawn: g_drone, n_tabloid,
//     n_podcast, n_meme. Refills then surface n_esports, n_astro, n_charity,
//     n_biotech, ... in that exact order.
//   • Card border colours: GREEN = yours, RED = enemy, DARK/UNCOLOURED = neutral.
//     The selection halo is GOLD/YELLOW (not cyan).
//   • Camera pan: WASD / Arrow keys, or LEFT-CLICK & DRAG empty space.
const STEPS = [
    // ═══════════════════════════════════════════════════════════════════
    // TURN 1 — Onboarding: faction, UI, the shared market, first capture
    // ═══════════════════════════════════════════════════════════════════
    {
        turn: 1, phase: 'pre', id: 'welcome',
        title: '👁️ WELCOME, OPERATIVE',
        text: `Welcome to <strong>OMNIS Global Initiative</strong> — a covert war over the world's power networks.<br><br>
        For this training you'll command the <strong>National Security Apparatus</strong>: a high-power faction built around dominance through force.<br><br>
        Your opponent is the <strong>Culture-War Architects</strong>, an asymmetric foil with very different abilities.<br><br>
        I'll guide you through 7 turns. Just follow the green prompts.`,
        highlight: null, waitFor: 'click_next', position: 'center'
    },
    {
        turn: 1, phase: 'pre', id: 'faction_intro',
        title: '🏛️ YOUR FACTION CARD',
        text: `The <strong>large card glowing GREEN on the LEFT side of the board</strong> is your <strong>Faction Card</strong> — the root of your network.<br><br>
        On it you'll see:<br>
        • 🛡️ <strong>Power 10</strong> (Bottom-Left) — your raw attack strength<br>
        • 💰 <strong>Income ₿2</strong> (Bottom-Right) — how much money you earn each turn<br>
        • 🟡 <strong>Stored ₿TC</strong> (Top-Left) — your current spendable balance<br>
        • <strong>4 outgoing arrows</strong> — open slots to attach captured groups<br><br>
        Every group you control must <em>physically connect</em> to your faction via these arrows, forming a tree-like network.`,
        highlight: '#phaser-container', waitFor: 'click_next', position: 'right',
        noOverlayDim: true,
        panToPlayer: 'human',
        panDuration: 800
    },
    {
        turn: 1, phase: 'pre', id: 'enemy_root_intro',
        title: '🎭 YOUR OPPONENT',
        text: `Now look at the card glowing <strong>RED</strong> — the <strong>Culture-War Architects</strong> faction. That's the enemy root, and the camera is panning over to it now.<br><br>
        They'll capture neutral groups and attach them to <em>their</em> network. Captured groups inherit their owner's colour, so enemy territory always glows red at a glance.<br><br>
        💡 <strong>Card border / glow at a glance:</strong><br>
        • 🟢 <strong>Green outline</strong> = yours<br>
        • 🔴 <strong>Red outline</strong> = enemy<br>
        • ⬛ <strong>Dark / no coloured glow</strong> = neutral (fair game)<br>
        • 🟡 <strong>Gold halo</strong> = currently selected card`,
        highlight: '#phaser-container', waitFor: 'click_next', position: 'left',
        noOverlayDim: true,
        panToPlayer: 'ai',
        panDuration: 1100
    },
    {
        turn: 1, phase: 'pre', id: 'market_intro',
        title: '🌐 THE UNCONTROLLED ZONE',
        text: `Camera panning back to the centre of the board…<br><br>
        Look at the <strong>4 neutral cards floating between the two factions</strong>. That's the <strong>Uncontrolled Zone</strong> — a shared global market.<br><br>
        💡 <strong>Key concept:</strong> Group Cards never enter players' hands. The deck spawns them <strong>directly into this shared market</strong> for everyone to fight over.<br><br>
        Whoever wins the bidding war over a neutral group attaches it to their network. <strong>If you don't fight for them, your rivals will.</strong>`,
        highlight: '#phaser-container', waitFor: 'click_next', position: 'center',
        noOverlayDim: true,
        panToNode: 'g_drone',
        panZoom: 0.55,
        panDuration: 1100
    },
    {
        turn: 1, phase: 'pre', id: 'income_explain',
        title: '💰 INCOME vs. STORED ₿TC',
        text: `Each turn begins with <strong>Income Collection</strong>. Every group you control generates ₿TC, which is stored <em>directly on that card</em>.<br><br>
        💡 <strong>Understand the difference:</strong><br>
        • <strong>Income (Bottom-Right)</strong>: This is the card's <em>earning rate</em> per turn.<br>
        • <strong>Stored ₿TC (Top-Left Pill)</strong>: This is the card's <em>current bank balance</em>.<br><br>
        ₿TC is your most important resource. You'll spend it to:<br>
        • <strong>Boost attacks</strong> during bidding wars<br>
        • <strong>Defend</strong> against enemy attacks<br>
        • <strong>Fuel special abilities</strong><br><br>
        Your faction card just collected <strong>₿2</strong> — look at the <strong>yellow pill in the top-left corner</strong> of your green faction card.`,
        highlight: '#phaser-container', waitFor: 'click_next', position: 'right',
        noOverlayDim: true
    },
    {
        turn: 1, phase: 'pre', id: 'ui_overview',
        title: '📡 INTEL FEED',
        text: `The <strong>left sidebar</strong> is your <strong>Intel Feed</strong> — a live log of every meaningful action: captures, attacks, ability triggers, global events, etc.<br><br>
        Use it to:<br>
        • Track what just happened during enemy turns<br>
        • Catch ability triggers you might have missed<br>
        • Review the flow of the round<br><br>
        Above it you'll find the <strong>POWER STRUCTURE</strong>, <strong>VICTORY PROGRESS</strong> and <strong>ASSETS</strong> nav buttons — we'll use them later.`,
        highlight: '#sidebar', waitFor: 'click_next', position: 'right',
        noOverlayDim: true
    },
    {
        turn: 1, phase: 'pre', id: 'hand_intro',
        title: '🃏 YOUR PRIVATE HAND',
        text: `At the <strong>bottom of the screen</strong> is <strong>Your Hand</strong> — currently empty.<br><br>
        💡 <strong>Important:</strong> Your hand only ever contains <strong>Action Cards</strong> (yellow border) — one-time effects you play privately.<br><br>
        <strong>Group Cards never enter hands</strong> in OMNIS. They spawn into the Uncontrolled Zone for everyone to fight over.<br><br>
        We'll see your first Action Card on Turn 6. For now, let's grab a group from the shared market.`,
        highlight: '.hand-container', waitFor: 'click_next', position: 'top',
        offsetY: -60,
        noOverlayDim: true
    },
    {
        turn: 1, phase: 'pre', id: 'first_target',
        title: '🎯 PICK YOUR FIRST TARGET',
        text: `Time for your first capture. We'll grab the <strong>🛩️ Drone Operations Bureau</strong> — a Government + Corporate group that's <em>perfectly aligned</em> with your National Security faction.<br><br>
        💡 <strong>Why this card?</strong> Its <strong>Government</strong> alignment matches one of yours — that gives you a <strong>+4 attack bonus</strong>. Combined with your Power 10 vs its Resistance 2, this capture is a near-certainty.<br><br>
        It's the card pulsing <strong>bright green</strong> on the board now. <strong>Click it</strong> to target it.<br><br>
        <em>Tip: hover any card (or long-press on mobile) to see its full stats.</em>`,
        highlight: '#phaser-container', waitFor: 'select_neutral_node', position: 'top',
        requiredNeutralId: 'g_drone',
        tutorialHighlightNodeId: 'g_drone',
        panToNode: 'g_drone',
        panZoom: 0.7,
        panDuration: 700,
        noOverlayDim: true,
        waitLabel: '⏳ CLICK THE GLOWING DRONE OPERATIONS BUREAU CARD...'
    },
    {
        turn: 1, phase: 'action', id: 'attack_to_control',
        title: '🎯 ATTACK TO CONTROL',
        text: `Drone Operations Bureau is selected — see the <strong>gold halo</strong> around it.<br><br>
        Look at the <strong>right-side Operations Panel</strong>. The big green button labelled <strong>"🎯 ATTACK TO CONTROL"</strong> shows your success percentage.<br><br>
        Attacks cost <strong>1 action</strong>, and you get <strong>2 actions per turn</strong> — spend them wisely.<br><br>
        With your Power 10 + alignment bonus vs. Resistance 2, success should be near 100%. <strong>Click "🎯 ATTACK TO CONTROL"</strong> now!`,
        highlight: '#btn-attack-control', waitFor: 'attack_control_clicked', position: 'left',
        noOverlayDim: true
    },
    {
        turn: 1, phase: 'bidding', id: 'bidding_explain',
        title: '💰 TACTICAL BIDDING',
        text: `Welcome to the <strong>Tactical Bidding</strong> panel — the heart of OMNIS combat.<br><br>
        During a bidding war, players spend ₿TC to influence the outcome:<br>
        • <strong>Attacker</strong> spends ₿TC to boost attack strength<br>
        • <strong>Defender</strong> spends ₿TC to boost resistance<br>
        • <strong>Other players</strong> can SUPPORT or OPPOSE!<br><br>
        Since the Drone Bureau is uncontrolled (no defender), nobody will fight back. <strong>Just click PASS</strong> — your success is already near 100%.<br><br>
        ⚠️ <strong>Once you PASS, you cannot re-enter this bidding round.</strong>`,
        highlight: '#bidding-war-panel', waitFor: 'bidding_resolved', position: 'left',
        noOverlayDim: true,
        offsetX: -20
    },
    {
        turn: 1, phase: 'post_attack', id: 'first_capture_done',
        title: '🔗 CONNECTED TO YOUR NETWORK!',
        text: `Excellent! The Drone Bureau is now <strong>yours</strong> — notice it now glows <strong>green</strong> like your faction, with an <strong>arrow physically connecting it</strong> to your root card.<br><br>
        💡 <strong>Why is the card rotated?</strong> The game automatically finds the best port-to-port match between your faction's outgoing arrow and the captured card's incoming port — it rotates the card so the arrows physically line up.<br><br>
        Glance at the <strong>Intel Feed</strong> on the left — your capture was logged there. Next round, this new group will generate income for you too.<br><br>
        Now <strong>click "END TURN"</strong> at the bottom-right to let the AI take its turn.`,
        highlight: '#btn-end-turn', waitFor: 'end_turn', position: 'top',
        noOverlayDim: true
    },
    {
        turn: 1, phase: 'bidding', id: 'observe_ai_attack',
        title: '🚨 ENEMY ACTIVITY DETECTED',
        text: `The <strong>Culture-War Architects</strong> are taking their turn — and they're attacking a neutral group too!<br><br>
        This is the <strong>Tactical Bidding</strong> panel from your perspective as a non-participant. You can:<br>
        • <strong>SUPPORT</strong> the attacker (rare — usually only to weaken whoever's leading)<br>
        • <strong>OPPOSE</strong> the attacker (block them from gaining ground)<br>
        • <strong>PASS</strong> — stay out of it<br><br>
        For now, <strong>click PASS</strong> to observe how AI combat plays out.`,
        highlight: '#bidding-war-panel', waitFor: 'bidding_resolved', position: 'left',
        noOverlayDim: true,
        offsetX: -20
    },

    // ═══════════════════════════════════════════════════════════════════
    // TURN 2 — Capture #2, learn the "Attacking With" dropdown
    // ═══════════════════════════════════════════════════════════════════
    {
        turn: 2, phase: 'pre', id: 'turn2_intro',
        title: '⚔️ ROUND 2 BEGINS',
        text: `A new round! Income has been collected — every card you control just earned its income, stored on the card itself.<br><br>
        Notice the AI now controls a group glowing <strong>red</strong> on the right side — the Culture-War Architects are building their network too.<br><br>
        Time to keep pace. Let's grab the <strong>📰 Tabloid Printers</strong> from the shared market — it's the card pulsing <strong>bright green</strong> on the board now.<br><br>
        <strong>Click the glowing Tabloid Printers card</strong>.`,
        highlight: '#phaser-container', waitFor: 'select_neutral_node', position: 'bottom',
        requiredNeutralId: 'n_tabloid',
        tutorialHighlightNodeId: 'n_tabloid',
        panToNode: 'n_tabloid',
        panZoom: 0.7,
        panDuration: 800,
        noOverlayDim: true,
        waitLabel: '⏳ CLICK THE GLOWING TABLOID PRINTERS CARD...'
    },
    {
        turn: 2, phase: 'action', id: 'turn2_attack',
        title: '🎯 SECOND CAPTURE',
        text: `Tabloid Printers is selected (gold halo). Now look at the <strong>Operations Panel</strong> on the right.<br><br>
        Notice the <strong>"ATTACKING WITH"</strong> dropdown — you can attack from your <strong>National Security Apparatus</strong> (faction root) or your newly-captured <strong>Drone Operations Bureau</strong>.<br><br>
        💡 <strong>Why does the attacker matter?</strong><br>
        • Each attacker has its own <strong>Power</strong> stat<br>
        • <strong>Alignment bonuses</strong>: matching tags give +4, opposed tags give -4, tension gives -2<br>
        • You can only spend <strong>₿TC stored on the attacking card</strong><br><br>
        Tabloid is Media + Populist (no overlap with your alignments — neutral 0 modifier), so stick with your faction root for raw Power 10. Click <strong>"🎯 ATTACK TO CONTROL"</strong>.`,
        highlight: '#btn-attack-control', waitFor: 'attack_control_clicked', position: 'left',
        noOverlayDim: true
    },
    {
        turn: 2, phase: 'bidding', id: 'turn2_bidding',
        title: '💰 BIDDING ROUND 2',
        text: `The bidding panel is open again.<br><br>
        Tabloid is uncontrolled — no defender. <strong>Just click PASS</strong> if your success % is already high.<br><br>
        ⚠️ Remember: <strong>passing is FINAL</strong>.`,
        highlight: '#bidding-war-panel', waitFor: 'bidding_resolved', position: 'left',
        noOverlayDim: true,
        offsetX: -20
    },
    {
        turn: 2, phase: 'post_attack', id: 'turn2_done',
        title: '✅ TWO GROUPS CONTROLLED',
        text: `You now control <strong>two groups</strong>! Your network is growing.<br><br>
        💡 <strong>Tip — your network is fully reorganisable:</strong><br>
        • <strong>Drag any card</strong> directly on the board to physically reposition it<br>
        • Use <strong>🔀 MOVE GROUP</strong> (free action) to re-attach a group to a different parent's arrow slot<br><br>
        Why bother? Many group abilities buff <em>connected/adjacent</em> cards (e.g. "+1 Power to neighbours"). Stacking the right groups next to each other unlocks combo bonuses — and a tidy layout opens fresh arrow slots for future captures.<br><br>
        Click <strong>END TURN</strong> when ready.`,
        highlight: '#btn-end-turn', waitFor: 'end_turn', position: 'top',
        noOverlayDim: true
    },

    // ═══════════════════════════════════════════════════════════════════
    // TURN 3 — Action economy: Transfer ₿TC, Move Group
    // ═══════════════════════════════════════════════════════════════════
    {
        turn: 3, phase: 'pre', id: 'turn3_intro',
        title: '🔀 TURN 3 — ACTION ECONOMY',
        text: `Each turn you get <strong>2 actions</strong>. Attacks and Move Group each cost <strong>1 action</strong>.<br><br>
        Some things stay free: <strong>your first 2 ₿TC transfers</strong>, playing <strong>Action Cards</strong>, and using <strong>faction abilities</strong>. (A 3rd+ ₿TC transfer in the same turn costs an action.)<br><br>
        Let's explore. <strong>Click one of your green-glowing groups</strong> on the board (NOT your faction root on the left — pick one of the captured groups).`,
        highlight: '#phaser-container', waitFor: 'select_own_node', position: 'top',
        noOverlayDim: true,
        waitLabel: '⏳ CLICK ONE OF YOUR GREEN-GLOWING CAPTURED GROUPS...'
    },
    {
        turn: 3, phase: 'action', id: 'free_actions_explain',
        title: '⚡ AVAILABLE FREE ACTIONS',
        text: `With your group selected, look at the <strong>FREE ACTIONS</strong> section in the Operations Panel:<br><br>
        <strong>💱 TRANSFER ₿TC</strong> — Move money from this card to a connected (adjacent) card. Useful for stacking ₿TC on a card you plan to attack with.<br><br>
        <strong>🔀 MOVE GROUP</strong> — Relocate this group to a different parent's arrow slot. Opens new attachment slots and improves your layout.<br><br>
        <strong>⚡ PLAY ACTION CARD</strong> — Only enabled when an action card is selected from your hand.<br><br>
        Try one if you like, or just <strong>click END TURN</strong> when ready.`,
        highlight: '.details-panel', waitFor: 'end_turn', position: 'left',
        noOverlayDim: true
    },

    // ═══════════════════════════════════════════════════════════════════
    // TURN 4 — Aggressive expansion: capture a third neutral
    // ═══════════════════════════════════════════════════════════════════
    {
        turn: 4, phase: 'pre', id: 'turn4_alignment_primer',
        title: '🧭 ALIGNMENTS — THE BACKBONE OF COMBAT',
        text: `Before your next capture, a quick lesson on <strong>Alignments</strong>. Every group has 1–3 of these tags. They drive every attack roll modifier.<br><br>
        <strong>The 12 alignments:</strong><br>
        🏛️ Government · 💼 Corporate · 🤖 Techno-Utopian · 💰 Financial · 🏰 Legacy · 📺 Media · 📣 Populist · 🎭 Cultural · ✊ Activist · 🎓 Academic · 🦹 Criminal · 🌀 Weird<br><br>
        <strong>Combat modifiers:</strong><br>
        • Match an alignment → <strong>+4 attack</strong><br>
        • <strong>Opposed</strong> alignment → <strong>−4 attack</strong> (e.g. Government vs Criminal, Legacy vs Techno-Utopian)<br>
        • <strong>Tension</strong> alignment → <strong>−2 attack</strong> (e.g. Government vs Techno-Utopian)<br><br>
        These stack, so a 2-tag attacker hitting a 2-tag target can swing by ±8 or more.`,
        highlight: null, waitFor: 'click_next', position: 'center'
    },
    {
        turn: 4, phase: 'pre', id: 'turn4_natsec_alignments',
        title: '🎖️ YOUR ALIGNMENTS: GOVERNMENT + LEGACY',
        text: `Your <strong>National Security Apparatus</strong> root is <strong>Government + Legacy</strong>.<br><br>
        <strong>Friendly territory (look for these tags):</strong><br>
        ✅ Government, Legacy — direct +4 matches<br>
        ✅ Corporate, Academic — common neighbours, often neutral<br><br>
        <strong>Avoid these — they fight back hard:</strong><br>
        ❌ <strong>Criminal</strong> (opposes Government, −4)<br>
        ❌ <strong>Techno-Utopian</strong> (opposes Legacy <em>and</em> tensions Government, −6 total!)<br>
        ❌ <strong>Weird</strong> (tensions Legacy, −2)<br><br>
        <em>This is why the Drone Bureau (Government+Corporate) was easy on T1, and why Gig Economy / Crypto Exchange would be brutal: they're Techno-Utopian.</em>`,
        highlight: null, waitFor: 'click_next', position: 'center'
    },
    {
        turn: 4, phase: 'pre', id: 'turn4_intro',
        title: '🌍 TURN 4 — PICK A FRIENDLY TARGET',
        text: `Look at the <strong>Uncontrolled Zone</strong> — fresh neutrals have spawned in.<br><br>
        <strong>Pick a target whose alignments match yours</strong>. Hover any card to see its tags. Good picks for NSA:<br>
        • Anything tagged <strong>Government</strong>, <strong>Legacy</strong>, <strong>Academic</strong>, or <strong>Corporate</strong><br>
        • Avoid Techno-Utopian, Criminal, and Weird unless you're using ₿TC to muscle through<br><br>
        <strong>Click any neutral card</strong> in the market to target it.<br><br>
        💡 <em>Camera tips: scroll/pinch to zoom · WASD / Arrow Keys or Left-click & drag empty space to pan.</em>`,
        highlight: '#phaser-container', waitFor: 'select_neutral_node', position: 'top',
        noOverlayDim: true,
        waitLabel: '⏳ CLICK ANY NEUTRAL CARD ON THE BOARD...'
    },
    {
        turn: 4, phase: 'action', id: 'turn4_attack',
        title: '⚔️ THIRD CAPTURE',
        text: `Group selected. Check the <strong>success %</strong> on the ATTACK TO CONTROL button — that number already factors in alignment bonuses/penalties.<br><br>
        💡 If the % is low, try the <strong>"ATTACKING WITH"</strong> dropdown to switch attackers — your captured groups have <em>different</em> alignments to your faction root, so a different attacker may have a better matchup. (Or use ₿TC in the bidding war to brute-force a tough target.)<br><br>
        When ready, click <strong>"🎯 ATTACK TO CONTROL"</strong>.`,
        highlight: '#btn-attack-control', waitFor: 'attack_control_clicked', position: 'left',
        noOverlayDim: true
    },
    {
        turn: 4, phase: 'bidding', id: 'turn4_bidding',
        title: '💰 BIDDING',
        text: `Bidding war underway.<br><br>
        Adjust the slider, then <strong>COMMIT</strong> or <strong>PASS</strong>. If success is high already, PASS works fine.`,
        highlight: '#bidding-war-panel', waitFor: 'bidding_resolved', position: 'left',
        noOverlayDim: true,
        offsetX: -20
    },
    {
        turn: 4, phase: 'post_attack', id: 'turn4_done',
        title: '📊 KEEP MOMENTUM',
        text: `Whether the attack succeeded or failed, that was <strong>1 action</strong> spent. You may still have a 2nd attack in you this turn — or pass.<br><br>
        Free things (action cards, your first 2 ₿TC transfers, faction ability) stay open. When ready, click <strong>END TURN</strong>.`,
        highlight: '#btn-end-turn', waitFor: 'end_turn', position: 'top',
        noOverlayDim: true
    },

    // ═══════════════════════════════════════════════════════════════════
    // TURN 5 — Attack the AI directly
    // ═══════════════════════════════════════════════════════════════════
    {
        turn: 5, phase: 'pre', id: 'turn5_intro',
        title: '💥 TURN 5 — GO ON THE OFFENSIVE',
        text: `So far you've only captured neutral groups. Now let's <strong>attack the enemy directly</strong>.<br><br>
        The Culture-War Architects control at least one <strong>red-glowing group</strong> on the board. I'll pan the camera over to show you. Click NEXT to continue.`,
        highlight: null, waitFor: 'click_next', position: 'center'
    },
    {
        turn: 5, phase: 'pre', id: 'turn5_attack_types',
        title: '⚔️ THREE WAYS TO ATTACK',
        text: `When attacking an enemy group, you'll see three options:<br><br>
        • <strong>🎯 CONTROL</strong> — steal it for yourself (needs a free arrow on your attacker)<br>
        • <strong>💫 NEUTRALIZE</strong> — strip it from the enemy back to neutral. <strong>Half resistance</strong>, easier!<br>
        • <strong>💀 DESTROY</strong> — remove it from the game entirely. <strong>2× resistance</strong>, harder.<br><br>
        Different attacks suit different goals — Control to grow, Neutralize to weaken, Destroy to permanently remove threats.`,
        highlight: null, waitFor: 'click_next', position: 'center'
    },
    {
        turn: 5, phase: 'pre', id: 'turn5_select_enemy',
        title: '🎯 SELECT AN ENEMY GROUP',
        text: `<strong>Click any red-glowing card</strong> on the board — that's an enemy group owned by the Culture-War Architects.<br><br>
        💡 If you can't see one, the camera should have panned to the AI's network. Look for the <strong>red glow</strong>!`,
        highlight: '#phaser-container', waitFor: 'select_enemy_node', position: 'top',
        noOverlayDim: true,
        waitLabel: '⏳ CLICK A RED-GLOWING ENEMY GROUP...'
    },
    {
        turn: 5, phase: 'action', id: 'turn5_attack',
        title: '⚔️ CHOOSE YOUR ATTACK',
        text: `Enemy selected! The Operations Panel now shows <strong>three attack buttons</strong>.<br><br>
        💡 <strong>Recommendation:</strong> Try <strong>"💫 NEUTRALIZE"</strong> — it has the highest success rate (half resistance) and weakens the AI without you needing a free arrow.<br><br>
        <strong>Click any of the three attack buttons</strong> to begin combat!`,
        highlight: '.details-panel', waitFor: 'attack_control_clicked', position: 'left',
        noOverlayDim: true
    },
    {
        turn: 5, phase: 'bidding', id: 'turn5_bidding',
        title: '💰 ATTACKING A LIVE OPPONENT',
        text: `This time the <strong>defender will fight back</strong> — the AI may spend ₿TC to boost its resistance.<br><br>
        Use the <strong>₿TC slider</strong> to invest in your attack, or <strong>PASS</strong> if you're happy with the success %.<br><br>
        Remember: ₿TC is spent from the <strong>attacking card only</strong>.`,
        highlight: '#bidding-war-panel', waitFor: 'bidding_resolved', position: 'left',
        noOverlayDim: true,
        offsetX: -20
    },
    {
        turn: 5, phase: 'post_attack', id: 'turn5_result',
        title: '📊 ATTACK RESOLVED',
        text: `Check the result above. Win or lose, that was <strong>1 of your 2 actions</strong> for this turn.<br><br>
        End the turn so we can see the AI strike back. Click <strong>END TURN</strong>.`,
        highlight: '#btn-end-turn', waitFor: 'end_turn', position: 'top',
        noOverlayDim: true
    },
    {
        turn: 5, phase: 'bidding', id: 'ai_attack_human',
        title: '🚨 INCOMING ATTACK!',
        text: `The Culture-War Architects are <strong>attacking one of your groups</strong>!<br><br>
        You're the <strong>Defender</strong> now — you could spend ₿TC to boost resistance, but your faction has a secret weapon.<br><br>
        <strong>Click PASS</strong> to let the attack land — and watch what happens.`,
        highlight: '#bidding-war-panel', waitFor: 'bidding_resolved', position: 'left',
        noOverlayDim: true,
        offsetX: -20
    },
    {
        turn: 5, phase: 'bidding', id: 'ai_attack_human_result',
        title: '💥 BRACE FOR IMPACT',
        text: `The dice favored the enemy — but watch carefully. Click <strong>NEXT</strong> to see what your faction does.`,
        highlight: null, waitFor: 'click_next', position: 'center'
    },

    // ═══════════════════════════════════════════════════════════════════
    // TURN 6 — Faction Ability Reveal + Action Cards
    // ═══════════════════════════════════════════════════════════════════
    {
        turn: 6, phase: 'pre', id: 'nsa_ability_reveal',
        title: '🕶️ PLAUSIBLE DENIABILITY',
        text: `Did you see that? The AI's attack <strong>succeeded on the dice</strong> — but your group is still standing!<br><br>
        That's your faction's special ability: <strong>🕶️ Plausible Deniability Protocol</strong>.<br><br>
        It <strong>automatically cancels the first successful attack against your network each round</strong>. Free, automatic, no ₿TC cost — the attack is simply "erased from the record."<br><br>
        The highlighted <strong>FACTION ABILITIES panel</strong> at the bottom of the screen shows your passive + active powers and their current status. Each faction has its own unique power — and knowing your enemies' abilities is half the battle.`,
        highlight: '#faction-ability-panel', waitFor: 'click_next', position: 'top',
        noOverlayDim: true
    },
    {
        turn: 6, phase: 'pre', id: 'turn6_action_card_intro',
        title: '🪂 ACTION CARDS',
        text: `Look at your hand at the <strong>bottom of the screen</strong> — you should now see a card with <strong>yellow "ACTION CARD" text</strong> called <strong>🪂 Token Airdrop Frenzy</strong>.<br><br>
        💡 <strong>Action Cards</strong> are private one-time effects:<br>
        • Played as a <strong>Free Action</strong> — they don't cost any of your 2 actions<br>
        • Effects include power boosts, resistance debuffs, ₿TC injection, sabotage, and more<br>
        • Some need a target; others activate instantly<br><br>
        <strong>Click the Token Airdrop card</strong> in your hand to select it.`,
        highlight: '.hand-container', waitFor: 'select_hand_card', position: 'top',
        offsetY: -60,
        requiredCard: 'act_token_airdrop',
        noOverlayDim: true,
        waitLabel: '⏳ CLICK THE TOKEN AIRDROP CARD IN YOUR HAND...'
    },
    {
        turn: 6, phase: 'action', id: 'turn6_play_action',
        title: '⚡ PLAY THE ACTION CARD',
        text: `With Token Airdrop selected, look at the <strong>Operations Panel</strong> on the right.<br><br>
        You'll see a button labelled <strong>"⚡ PLAY ACTION"</strong>. Token Airdrop instantly drops <strong>₿6+</strong> straight onto your faction card — completely free, doesn't cost an action!<br><br>
        <strong>Click "⚡ PLAY ACTION"</strong> now.`,
        highlight: '.details-panel', waitFor: 'action_card_played', position: 'left',
        noOverlayDim: true,
        waitLabel: '⏳ CLICK "PLAY ACTION" IN THE RIGHT PANEL...'
    },
    {
        turn: 6, phase: 'pre', id: 'turn6_layout_tips',
        title: '🖱️ BOARD CONTROLS',
        text: `Nice — free ₿TC, no actions spent!<br><br>
        Some quick board controls before we wrap up:<br>
        • <strong>Drag cards</strong> to reposition your network for a cleaner layout<br>
        • <strong>Hover</strong> any card (or long-press on mobile) for a detailed tooltip<br>
        • <strong>Scroll/pinch</strong> to zoom in and out<br>
        • <strong>WASD / Arrow Keys</strong> or <strong>Left-click & drag empty space</strong> to pan the camera<br><br>
        Both of your <strong>2 actions</strong> are still available. Capture a group, attack the AI (up to 2x), or just click <strong>END TURN</strong>.`,
        highlight: '#phaser-container', waitFor: 'end_turn_or_attack', position: 'bottom',
        noOverlayDim: true,
        waitLabel: '⏳ ATTACK OR CLICK END TURN...'
    },

    // ═══════════════════════════════════════════════════════════════════
    // TURN 7 — Victory conditions + final mission briefing
    // ═══════════════════════════════════════════════════════════════════
    {
        turn: 7, phase: 'pre', id: 'turn7_intro',
        title: '🏆 TURN 7 — VICTORY CONDITIONS',
        text: `Final lesson. Let's talk about <strong>winning</strong>.<br><br>
        In a full game, <strong>each faction has a unique victory condition</strong> — some need to control specific groups, others need raw power, economic dominance, or cultural influence.<br><br>
        For this training, your goal is simple: <strong>Control ${TUTORIAL_WIN_GROUPS} groups</strong> (not counting your faction card).<br><br>
        To check standings, <strong>click the highlighted "🏆 VICTORY PROGRESS"</strong> button in the left sidebar.`,
        highlight: '#btn-nav-victory', waitFor: 'click_next', position: 'right',
        noOverlayDim: true
    },
    {
        turn: 7, phase: 'pre', id: 'victory_intel',
        title: '🔍 INTEL GATHERING',
        text: `The <strong>Victory Progress</strong> view (or the dedicated <strong>Victory Tracker</strong> modal) lets you <strong>click any player's name</strong> to inspect their:<br>
        • Unique victory condition & current progress<br>
        • Faction ability<br>
        • Network composition<br><br>
        Watching opponents is critical — if someone gets close to winning, you need to <strong>neutralize or destroy</strong> their key groups to slow them down.<br><br>
        OMNIS is a <strong>political game</strong>: alliances, threats, and bluffs all shape the table.`,
        highlight: null, waitFor: 'click_next', position: 'center'
    },
    {
        turn: 7, phase: 'pre', id: 'spatial_constraints',
        title: '🧱 SPATIAL AWARENESS',
        text: `One last note about the <strong>physical layout</strong>:<br><br>
        • Groups connect via <strong>directional port arrows</strong> on each card's N/E/S/W sides<br>
        • Cards <strong>rotate</strong> to make their ports face the correct way<br>
        • <strong>Cards cannot overlap</strong> — plan your layout carefully<br>
        • Use <strong>🔀 MOVE GROUP</strong> to relocate cards to better slots<br>
        • <strong>Drag cards</strong> directly to fine-tune positions<br><br>
        Hub cards with 3+ outward arrows are gold — they let you branch your network wide.`,
        highlight: null, waitFor: 'click_next', position: 'center'
    },
    {
        turn: 7, phase: 'action', id: 'final_push',
        title: '🎯 FINAL MISSION',
        text: `You now know all the fundamentals of OMNIS!<br><br>
        <strong>Quick Reference:</strong><br>
        1. <strong>Group Cards</strong> spawn into the shared Uncontrolled Zone — fight over them!<br>
        2. <strong>Click a neutral or enemy card</strong> to target it<br>
        3. <strong>Attack to Control / Neutralize / Destroy</strong> (1 action each — you get 2 per turn)<br>
        4. <strong>Bid ₿TC</strong> in bidding wars to tip the odds<br>
        5. <strong>Action Cards</strong> are free. <strong>Move Group</strong> costs 1 action. First 2 <strong>₿TC transfers</strong> are free per turn.<br>
        6. Watch the Victory Tracker to know when to push or sabotage<br><br>
        <strong>Your mission:</strong> Control <strong>${TUTORIAL_WIN_GROUPS} groups</strong> to graduate.<br><br>
        <strong>Good luck, Chairman. The network awaits.</strong>`,
        highlight: null, waitFor: 'click_next', position: 'center'
    }
];

// ═══════════════════════════════════════
//  TUTORIAL ENGINE
// ═══════════════════════════════════════

class TutorialEngine {
    constructor() {
        this.active = false;
        this.stepIndex = 0;
        this.currentTurn = 1;
        this.waitingFor = null;
        this.onResolve = null;
        this.tooltipEl = null;
        this.overlayEl = null;
        this.highlightEl = null;
        this.pulseEls = [];
        this._boundKeyHandler = this._handleKey.bind(this);
        this._runningPhase = null; // guard against concurrent _runStepsForPhase
        this._gameApi = null;
        this.nsaAbilityFired = false;
        this.onSkipCallback = null;
    }

    init(gameApi) {
        this._gameApi = gameApi;
        this.active = true;
        this.stepIndex = 0;
        this.currentTurn = 1;
        this.nsaAbilityFired = false;
        this.onSkipCallback = gameApi.onSkip || null;
        document.addEventListener('keydown', this._boundKeyHandler);
        this._createElements();
    }

    destroy() {
        this.active = false;
        this.waitingFor = null;
        if (this.onResolve) {
            const r = this.onResolve;
            this.onResolve = null;
            r();
        }
        this._runningPhase = null;
        if (this._gameApi?.setTutorialHighlight) {
            try { this._gameApi.setTutorialHighlight(null); } catch (e) {}
        }
        document.removeEventListener('keydown', this._boundKeyHandler);
        this._removeElements();
    }

    // Game hooks call this when things happen
    notify(eventType, data = {}) {
        if (!this.active || !this.waitingFor) return;

        const step = STEPS[this.stepIndex];
        if (!step) return;

        switch (this.waitingFor) {
            case 'select_hand_card':
                if (eventType === 'hand_card_selected') {
                    if (step.requiredCard && data.cardId !== step.requiredCard) {
                        this._showMiniHint(`Select the required Action Card highlighted in your hand.`);
                        return;
                    }
                    this._advance();
                }
                break;
            case 'attack_control_clicked':
                if (eventType === 'attack_control' || eventType === 'attack_neutralize' || eventType === 'attack_destroy') {
                    this._advance();
                }
                break;
            case 'bidding_resolved':
                if (eventType === 'bidding_done') {
                    this._advance();
                }
                break;
            case 'select_neutral_node':
                if (eventType === 'node_selected' && data.node && !data.node.owner && data.node.type !== 'root') {
                    if (step.requiredNeutralId && data.node.id !== step.requiredNeutralId) {
                        this._showMiniHint(`Select the specific neutral group highlighted in the instructions.`);
                        return;
                    }
                    this._advance();
                }
                break;
            case 'select_attackable_node':
                if (eventType === 'node_selected' && data.node && data.node.type !== 'root' && data.node.owner !== data.humanId) {
                    this._advance();
                }
                break;
            case 'select_own_node':
                if (eventType === 'node_selected' && data.node && data.node.owner === data.humanId && data.node.type !== 'root') {
                    this._advance();
                }
                break;
            case 'select_enemy_node':
                if (eventType === 'node_selected' && data.node && data.node.owner && data.node.owner !== data.humanId) {
                    this._advance();
                }
                break;
            case 'end_turn':
                if (eventType === 'turn_ended') {
                    this._advance();
                }
                break;
            case 'end_turn_or_attack':
                if (eventType === 'turn_ended' || eventType === 'attack_control' || eventType === 'attack_neutralize' || eventType === 'attack_destroy') {
                    this._advance();
                }
                break;
            case 'action_card_played':
                if (eventType === 'action_card_played') {
                    this._advance();
                }
                break;
        }
    }

    // Called at the start of each turn
    async onTurnStart(turnNumber, playerId, humanId) {
        if (!this.active) return;
        this.currentTurn = turnNumber;

        // Turn 5+: pan camera to show enemy groups so the player can find them
        if (turnNumber >= 5 && this._gameApi?.focusCameraOnPlayerNetwork && this._gameApi?.getAIPlayerId) {
            const aiId = this._gameApi.getAIPlayerId();
            if (aiId) {
                this._gameApi.focusCameraOnPlayerNetwork(aiId, { duration: 1200 });
                await new Promise(r => setTimeout(r, 2000));
            }
        }

        await this._runStepsForPhase('pre', turnNumber, humanId);

        // Pan back after pre-steps
        if (turnNumber >= 5 && this._gameApi?.focusCameraOnPlayerNetwork) {
            this._gameApi.focusCameraOnPlayerNetwork(humanId, { duration: 900 });
            await new Promise(r => setTimeout(r, 1000));
        }
    }

    // Called when bidding war opens
    async onBiddingStart() {
        if (!this.active) return;
        const stepsRan = await this._runStepsForPhase('bidding', this.currentTurn);

        if (!stepsRan && this._gameApi) {
            const gameState = this._gameApi.getGameState();
            const humanId = this._gameApi.getHumanId();
            if (gameState) {
                const isActivePlayer = gameState.playerOrder[gameState.activePlayerIndex] === humanId;

                if (!isActivePlayer) {
                    await this._showStep({
                        turn: this.currentTurn, phase: 'bidding', id: 'ai_generic_attack',
                        title: '🚨 ENEMY ACTIVITY',
                        text: `The AI is attacking!<br><br>
                        <strong>Click PASS</strong> to skip bidding and let the attack resolve.<br><br>
                        (In a real game, you could spend ₿TC to interfere — SUPPORT or OPPOSE the attacker.)`,
                        highlight: '#bidding-war-panel', waitFor: 'bidding_resolved', position: 'left',
                        noOverlayDim: true, offsetX: -20
                    });

                    if (this.active) {
                        await this._showStep({
                            turn: this.currentTurn, phase: 'bidding', id: 'ai_generic_result',
                            title: '⏳ ENEMY PROCESSING',
                            text: `The AI's attack has resolved. Watch what it does next!<br><br>
                            It will finish its actions and end its turn shortly. <strong>Click NEXT</strong> to continue observing.`,
                            highlight: null, waitFor: 'click_next', position: 'center'
                        });
                    }
                } else {
                    await this._showStep({
                        turn: this.currentTurn, phase: 'bidding', id: 'human_generic_attack',
                        title: '💰 TACTICAL BIDDING',
                        text: `You've launched an attack!<br><br>
                        Use the <strong>₿TC slider</strong> to invest money for a stronger attack, or <strong>click PASS</strong> if the success % is already high enough.<br><br>
                        Remember: ₿TC is spent from the <strong>attacking card only</strong>.`,
                        highlight: '#bidding-war-panel', waitFor: 'bidding_resolved', position: 'left',
                        noOverlayDim: true, offsetX: -20
                    });
                }
            }
        }
    }

    // Called after an attack resolves
    async onPostAttack() {
        if (!this.active) return;
        const stepsRan = await this._runStepsForPhase('post_attack', this.currentTurn);

        if (!stepsRan && this._gameApi) {
            const gameState = this._gameApi.getGameState();
            const humanId = this._gameApi.getHumanId();
            if (gameState && gameState.playerOrder[gameState.activePlayerIndex] === humanId) {
                await this._showStep({
                    turn: this.currentTurn, phase: 'post_attack', id: 'human_generic_result',
                    title: '📊 ATTACK RESULT',
                    text: `The dice have been rolled. Whether you won or lost, that was <strong>1 of your 2 actions</strong> this turn.<br><br>
                    You can still play action cards, do your first 2 ₿TC transfers free, and (if you have an action left) attack again or move a group. Click <strong>END TURN</strong> when you're ready.`,
                    highlight: '#btn-end-turn', waitFor: 'end_turn', position: 'top'
                });
            }
        }
    }

    onFreeActionPhase() {
        if (!this.active) return;
        this._runStepsForPhase('free', this.currentTurn);
    }

    onActionPhase() {
        if (!this.active) return;
        this._runStepsForPhase('action', this.currentTurn);
    }

    checkTutorialWin(humanId, nodes) {
        if (!this.active) return false;
        const owned = Object.values(nodes).filter(n => n.owner === humanId && n.type !== 'root');
        return owned.length >= TUTORIAL_WIN_GROUPS;
    }

    isActive() {
        return this.active;
    }

    getTutorialWinGroups() {
        return TUTORIAL_WIN_GROUPS;
    }

    getTutorialFactionId() {
        return TUTORIAL_FACTION_ID;
    }

    getTutorialAIFactionId() {
        return TUTORIAL_AI_FACTION_ID;
    }

    /**
     * Get a curated hand for the human player on a given turn.
     * Returns a list of CARD IDs (action cards only) that should be in the hand.
     * Returns null to leave the hand alone (use whatever was drawn naturally).
     *
     * In the new paradigm, hands ONLY contain Action Cards. Group Cards spawn
     * into the Uncontrolled Zone, not into hands.
     */
    getCuratedHand(turn) {
        if (turn === 6) return [...TUTORIAL_PLAYER_HAND_T6];
        return null; // Default: empty hand or whatever was drawn
    }

    /**
     * Get groups that should be pre-seeded into the Uncontrolled Zone at game start.
     * This guarantees the player has known targets to fight over during the
     * scripted tutorial turns (g_drone on T1, n_tabloid on T2, etc.).
     */
    getSeededNeutrals() {
        return [...TUTORIAL_SEEDED_NEUTRALS];
    }

    /**
     * The tutorial uses a tighter Uncontrolled Zone than the regular game so
     * every visible card matters during teaching.
     */
    getMarketSize() {
        return TUTORIAL_MARKET_SIZE;
    }

    /**
     * Curated order in which Group cards should resurface in the Uncontrolled
     * Zone whenever the deck would normally spawn one. Ensures the player sees
     * the same shared market every play-through.
     */
    getMarketRefillOrder() {
        return [...TUTORIAL_MARKET_REFILL_ORDER];
    }

    /**
     * Tutorial action lock: returns null if action allowed, or hint string if blocked.
     */
    isActionBlocked(action, data = {}) {
        if (!this.active) return null;
        const step = STEPS[this.stepIndex];
        if (!step) return null;
        const sid = step.id;

        // ─── ATTACK (main action) ───
        if (action === 'attack') {
            const attackSteps = [
                'attack_to_control',     // T1
                'turn2_attack',          // T2
                'turn4_attack',          // T4
                'turn5_attack',          // T5
                'turn6_layout_tips',     // T6 free play
                'final_push'             // T7 free play
            ];
            if (!attackSteps.includes(sid) && step.waitFor !== 'end_turn_or_attack') {
                return '⚠️ Follow the tutorial instructions before attacking!';
            }
            return null;
        }

        // ─── END TURN ───
        if (action === 'end_turn') {
            const endSteps = [
                'first_capture_done',   // T1
                'turn2_done',           // T2
                'free_actions_explain', // T3
                'turn4_done',           // T4
                'turn5_result',         // T5
                'turn6_layout_tips',    // T6
                'final_push'            // T7
            ];
            if (!endSteps.includes(sid) && step.waitFor !== 'end_turn' && step.waitFor !== 'end_turn_or_attack') {
                return '⚠️ Complete the current tutorial step first!';
            }
            return null;
        }

        // ─── PLAY ACTION CARD ───
        if (action === 'play_action') {
            const playSteps = ['turn6_play_action', 'turn6_layout_tips', 'final_push'];
            if (!playSteps.includes(sid)) {
                return '⚠️ Wait for the tutorial to introduce action cards!';
            }
            return null;
        }

        return null;
    }

    /**
     * Tutorial AI scripting: should the AI skip attacking a target entirely?
     * Protects the player's scripted targets so they're always available.
     */
    shouldAISkipTarget(targetId, turnNumber) {
        // T1: don't let AI grab g_drone — player needs it on T1.
        if (turnNumber === 1 && targetId === 'g_drone') return true;
        // T2: don't let AI grab n_tabloid — player needs it on T2.
        if (turnNumber <= 2 && targetId === 'n_tabloid') return true;
        return false;
    }

    /**
     * Tutorial AI scripting: list of preferred targets in priority order.
     * The AI's targeting heuristic should bias towards these so the demo
     * unfolds the same way every play-through (AI grabs n_podcast on T1,
     * n_meme on T2). Returning [] means "no preference; use normal scoring".
     */
    getAIPreferredTargets(turnNumber) {
        if (turnNumber === 1) return ['n_podcast'];
        if (turnNumber === 2) return ['n_meme'];
        return [];
    }

    /**
     * Tutorial AI scripting: should the AI attack the player's groups?
     */
    shouldAIAttackPlayer(turnNumber) {
        // T5+: force the AI to attempt an attack so NSA Plausible Deniability can fire
        return turnNumber >= 5;
    }

    /**
     * Record that the NSA ability fired during this tutorial
     */
    recordNSAAbilityFired() {
        this.nsaAbilityFired = true;
    }

    /**
     * Deterministic attack results for the tutorial.
     * Returns true to force success, false to force failure, null for normal dice.
     */
    shouldForceAttackResult(attackerId, targetId, turnNumber, humanId) {
        const isAI = attackerId !== humanId;

        // Player attacks during scripted turns (1-4): always succeed
        if (!isAI && turnNumber <= 4) {
            return true;
        }

        // AI captures from market on early turns: always succeed so it builds a
        // network for the player to attack on Turn 5
        if (isAI && turnNumber <= 3) {
            return true;
        }

        // AI forced neutralize on Turn 5+: always succeed
        // This triggers Plausible Deniability which the tutorial explains on Turn 6
        if (isAI && turnNumber >= 5) {
            return true;
        }

        return null; // normal dice
    }

    // ─── Private ───

    async _runStepsForPhase(phase, turn) {
        const phaseKey = `${phase}_${turn}`;
        if (this._runningPhase === phaseKey) return false;
        this._runningPhase = phaseKey;

        let stepsRan = false;
        try {
            while (this.active && this.stepIndex < STEPS.length) {
                const step = STEPS[this.stepIndex];
                if (!step) break;
                if (step.turn > turn) break;
                if (step.turn < turn) { this.stepIndex++; continue; }
                if (step.phase !== phase) break;

                stepsRan = true;
                await this._showStep(step);
                if (!this.active) break;
                this.stepIndex++;
            }
        } finally {
            this._runningPhase = null;
        }
        return stepsRan;
    }

    _showStep(step) {
        return new Promise((resolve) => {
            // Auto-resolve check
            if (this._gameApi) {
                const node = this._gameApi.getSelectedNode ? this._gameApi.getSelectedNode() : null;
                const handCard = this._gameApi.getSelectedHandCard ? this._gameApi.getSelectedHandCard() : null;
                const humanId = this._gameApi.getHumanId ? this._gameApi.getHumanId() : null;
                const gameState = this._gameApi.getGameState ? this._gameApi.getGameState() : null;

                let shouldAutoResolve = false;

                if (step.waitFor === 'select_neutral_node' && node && !node.owner && node.type !== 'root') {
                    if (!step.requiredNeutralId || node.id === step.requiredNeutralId) {
                        shouldAutoResolve = true;
                    }
                } else if (step.waitFor === 'select_hand_card' && handCard) {
                    if (!step.requiredCard || handCard.id === step.requiredCard) {
                        shouldAutoResolve = true;
                    }
                } else if (step.waitFor === 'select_own_node' && node && node.owner === humanId && node.type !== 'root') {
                    shouldAutoResolve = true;
                } else if (step.waitFor === 'select_enemy_node' && node && node.owner && node.owner !== humanId) {
                    shouldAutoResolve = true;
                } else if (step.waitFor === 'attack_control_clicked' && gameState && (gameState.actionsUsed || 0) >= 1) {
                    shouldAutoResolve = true;
                }

                if (shouldAutoResolve) {
                    resolve();
                    return;
                }
            }

            this._clearHighlights();
            this._showTooltip(step);

            if (step.highlight) {
                this._addHighlight(step.highlight);
            }

            // Tutorial board highlight — pulse a specific in-game node green
            if (this._gameApi?.setTutorialHighlight) {
                this._gameApi.setTutorialHighlight(step.tutorialHighlightNodeId || null);
            }

            // Camera panning instructions on the step itself
            if (step.panToNode && this._gameApi?.focusCameraOnNode) {
                this._gameApi.focusCameraOnNode(step.panToNode, {
                    duration: step.panDuration ?? 900,
                    zoom: step.panZoom
                });
            } else if (step.panToPlayer && this._gameApi?.focusCameraOnPlayerNetwork) {
                const target = step.panToPlayer === 'human'
                    ? (this._gameApi.getHumanId ? this._gameApi.getHumanId() : null)
                    : (step.panToPlayer === 'ai' && this._gameApi.getAIPlayerId
                        ? this._gameApi.getAIPlayerId()
                        : step.panToPlayer);
                if (target) {
                    this._gameApi.focusCameraOnPlayerNetwork(target, { duration: step.panDuration ?? 900 });
                }
            }

            if (step.waitFor === 'click_next') {
                this.waitingFor = null;
                this.onResolve = resolve;
            } else {
                this.waitingFor = step.waitFor;
                this.onResolve = resolve;
            }
        });
    }

    _advance() {
        this.waitingFor = null;
        this._hideTooltip();
        this._clearHighlights();
        if (this._gameApi?.setTutorialHighlight) {
            this._gameApi.setTutorialHighlight(null);
        }
        if (this.onResolve) {
            const r = this.onResolve;
            this.onResolve = null;
            r();
        }
    }

    _handleKey(e) {
        if (e.key === 'Escape') {
            if (this.active) {
                if (confirm('Skip the rest of the tutorial?')) {
                    this._advance();
                    const skipCb = this.onSkipCallback;
                    this.destroy();
                    if (skipCb) skipCb();
                }
            }
        }
        if (e.key === 'Enter' || e.key === ' ') {
            if (this.onResolve && !this.waitingFor) {
                e.preventDefault();
                this._advance();
            }
        }
    }

    _createElements() {
        this.overlayEl = document.createElement('div');
        this.overlayEl.id = 'tutorial-engine-overlay';
        this.overlayEl.style.cssText = `
            position: fixed; inset: 0; z-index: 10000;
            background: rgba(0,0,0,0.45);
            pointer-events: none; display: none;
            transition: opacity 0.3s ease;
        `;
        document.body.appendChild(this.overlayEl);

        this.tooltipEl = document.createElement('div');
        this.tooltipEl.id = 'tutorial-engine-tooltip';
        this.tooltipEl.style.cssText = `
            position: fixed; z-index: 10002;
            max-width: 500px; min-width: 360px;
            background: linear-gradient(135deg, rgba(10,14,20,0.97), rgba(20,28,40,0.97));
            border: 2px solid var(--accent-green);
            border-radius: 12px;
            padding: 0;
            box-shadow: 0 0 40px rgba(34,197,94,0.25), 0 8px 32px rgba(0,0,0,0.6);
            display: none;
            pointer-events: auto;
            font-family: var(--font-sans);
            animation: tutorialPulseIn 0.35s ease-out;
        `;
        document.body.appendChild(this.tooltipEl);
    }

    _removeElements() {
        if (this.overlayEl) { this.overlayEl.remove(); this.overlayEl = null; }
        if (this.tooltipEl) { this.tooltipEl.remove(); this.tooltipEl = null; }
        this._clearHighlights();
        const hint = document.getElementById('tutorial-mini-hint');
        if (hint) hint.remove();
    }

    _showTooltip(step) {
        if (!this.tooltipEl || !this.overlayEl) return;

        const isClickNext = step.waitFor === 'click_next';
        const isEndTurn = step.waitFor === 'end_turn';
        const isEndTurnOrAttack = step.waitFor === 'end_turn_or_attack';
        const stepNum = this.stepIndex + 1;
        const totalSteps = STEPS.length;

        let waitLabel = step.waitLabel || '⏳ WAITING FOR ACTION...';
        if (!step.waitLabel) {
            if (step.waitFor === 'select_hand_card') waitLabel = '⏳ SELECT A CARD IN YOUR HAND...';
            else if (step.waitFor === 'attack_control_clicked') waitLabel = '⏳ CLICK THE ATTACK BUTTON...';
            else if (step.waitFor === 'bidding_resolved') waitLabel = '⏳ COMPLETE THE BIDDING WAR...';
            else if (step.waitFor === 'select_neutral_node') waitLabel = '⏳ CLICK A GREY-BORDERED CARD ON THE BOARD...';
            else if (step.waitFor === 'select_attackable_node') waitLabel = '⏳ CLICK A NEUTRAL OR ENEMY CARD ON THE BOARD...';
            else if (step.waitFor === 'select_own_node') waitLabel = '⏳ CLICK ONE OF YOUR GREEN-BORDERED CARDS...';
            else if (step.waitFor === 'select_enemy_node') waitLabel = '⏳ CLICK A RED-BORDERED ENEMY CARD...';
            else if (step.waitFor === 'action_card_played') waitLabel = '⏳ PLAY THE ACTION CARD...';
            else if (isEndTurn) waitLabel = '⏳ CLICK END TURN...';
            else if (isEndTurnOrAttack) waitLabel = '⏳ ATTACK OR END TURN...';
        }

        this.tooltipEl.innerHTML = `
            <div style="padding: 20px 20px 0; border-bottom: 1px solid rgba(74,222,128,0.15); margin-bottom: 0;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                    <div style="font-family: var(--font-mono); font-size: 18px; color: var(--accent-green); font-weight: bold; letter-spacing: 1px; text-shadow: 0 0 10px rgba(74,222,128,0.4);">
                        ${step.title}
                    </div>
                    <div style="font-family: var(--font-mono); font-size: 10px; color: #4a5568; background: rgba(0,0,0,0.4); padding: 3px 8px; border-radius: 10px;">
                        ${stepNum}/${totalSteps}
                    </div>
                </div>
            </div>
            <div style="padding: 16px 20px; font-size: 13px; color: #cbd5e0; line-height: 1.65; max-height: 320px; overflow-y: auto;">
                ${step.text}
            </div>
            <div style="padding: 12px 20px; border-top: 1px solid rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
                <div style="flex: 1; height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; margin-right: 16px; overflow: hidden; min-width: 60px;">
                    <div style="width: ${(stepNum / totalSteps) * 100}%; height: 100%; background: var(--accent-green); border-radius: 2px; transition: width 0.3s ease;"></div>
                </div>
                <div style="display: flex; gap: 8px; align-items: center; flex-shrink: 0;">
                    <button id="tut-skip-btn" style="
                        background: transparent; border: 1px solid #4a5568; color: #718096;
                        font-family: var(--font-mono); font-size: 11px; padding: 6px 12px;
                        border-radius: 6px; cursor: pointer; transition: all 0.2s;
                    ">SKIP ALL</button>
                    ${isClickNext ? `
                    <button id="tut-next-btn" style="
                        background: linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.1));
                        border: 1px solid var(--accent-green); color: var(--accent-green);
                        font-family: var(--font-mono); font-size: 12px; padding: 6px 16px;
                        border-radius: 6px; cursor: pointer; font-weight: bold;
                        transition: all 0.2s; text-shadow: 0 0 5px rgba(74,222,128,0.3);
                    ">NEXT →</button>` : `
                    <div style="font-family: var(--font-mono); font-size: 10px; color: var(--accent-yellow); padding: 6px 12px; border: 1px dashed rgba(234,179,8,0.4); border-radius: 6px; animation: tutorialBlink 1.5s ease-in-out infinite;">
                        ${waitLabel}
                    </div>`}
                </div>
            </div>
        `;

        this.overlayEl.style.background = step.noOverlayDim ? 'transparent' : 'rgba(0,0,0,0.45)';
        this.overlayEl.style.display = 'block';
        this.overlayEl.style.opacity = '1';

        this.tooltipEl.style.visibility = 'hidden';
        this.tooltipEl.style.display = 'block';
        this.tooltipEl.style.animation = 'none';

        this._positionTooltip(step);

        this.tooltipEl.style.visibility = 'visible';
        void this.tooltipEl.offsetWidth;
        this.tooltipEl.style.animation = 'tutorialPulseIn 0.35s ease-out';

        const nextBtn = this.tooltipEl.querySelector('#tut-next-btn');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this._advance());
            nextBtn.addEventListener('mouseenter', () => {
                nextBtn.style.background = 'linear-gradient(135deg, rgba(34,197,94,0.35), rgba(34,197,94,0.2))';
                nextBtn.style.boxShadow = '0 0 15px rgba(34,197,94,0.3)';
            });
            nextBtn.addEventListener('mouseleave', () => {
                nextBtn.style.background = 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.1))';
                nextBtn.style.boxShadow = 'none';
            });
        }

        const skipBtn = this.tooltipEl.querySelector('#tut-skip-btn');
        if (skipBtn) {
            skipBtn.addEventListener('click', () => {
                if (confirm('Skip the rest of the tutorial?')) {
                    this._advance();
                    const skipCb = this.onSkipCallback;
                    this.destroy();
                    if (skipCb) skipCb();
                }
            });
            skipBtn.addEventListener('mouseenter', () => {
                skipBtn.style.borderColor = 'var(--accent-red)';
                skipBtn.style.color = 'var(--accent-red)';
            });
            skipBtn.addEventListener('mouseleave', () => {
                skipBtn.style.borderColor = '#4a5568';
                skipBtn.style.color = '#718096';
            });
        }
    }

    _hideTooltip() {
        if (this.tooltipEl) this.tooltipEl.style.display = 'none';
        if (this.overlayEl) {
            this.overlayEl.style.opacity = '0';
            setTimeout(() => { if (this.overlayEl) this.overlayEl.style.display = 'none'; }, 300);
        }
    }

    _positionTooltip(step) {
        if (!this.tooltipEl) return;

        const pos = step.position || 'center';
        const tt = this.tooltipEl;
        const isMobile = window.innerWidth <= 768;

        tt.style.left = '';
        tt.style.top = '';
        tt.style.right = '';
        tt.style.bottom = '';
        tt.style.transform = '';

        const ttRect = tt.getBoundingClientRect();

        if (pos === 'center') {
            tt.style.left = (window.innerWidth / 2 - ttRect.width / 2) + 'px';
            tt.style.top = (window.innerHeight / 2 - ttRect.height / 2) + 'px';
            tt.style.transform = 'none';
            return;
        }

        const target = step.highlight ? document.querySelector(step.highlight) : null;
        if (!target) {
            tt.style.left = (window.innerWidth / 2 - ttRect.width / 2) + 'px';
            tt.style.top = (window.innerHeight / 2 - ttRect.height / 2) + 'px';
            tt.style.transform = 'none';
            return;
        }

        if (isMobile) {
            const rect = target.getBoundingClientRect();
            const margin = 8;
            tt.style.left = `${Math.max(margin, (window.innerWidth - ttRect.width) / 2)}px`;
            tt.style.transform = 'none';
            const targetMidY = rect.top + rect.height / 2;
            if (targetMidY < window.innerHeight / 2) {
                const y = Math.min(rect.bottom + 12, window.innerHeight - ttRect.height - margin);
                tt.style.top = `${Math.max(margin, y)}px`;
            } else {
                const y = Math.max(margin, rect.top - ttRect.height - 12);
                tt.style.top = `${y}px`;
            }
            return;
        }

        const rect = target.getBoundingClientRect();
        const offsetX = step.offsetX || 0;
        const offsetY = step.offsetY || 0;
        let x, y;

        switch (pos) {
            case 'right':
                x = rect.right + 16;
                y = rect.top + rect.height / 2 - ttRect.height / 2;
                break;
            case 'left':
                x = rect.left - ttRect.width - 16;
                y = rect.top + rect.height / 2 - ttRect.height / 2;
                break;
            case 'bottom':
                x = rect.left + rect.width / 2 - ttRect.width / 2;
                y = rect.bottom + 16;
                break;
            case 'top':
                x = rect.left + rect.width / 2 - ttRect.width / 2;
                y = rect.top - ttRect.height - 16;
                break;
            default:
                x = window.innerWidth / 2 - ttRect.width / 2;
                y = window.innerHeight / 2 - ttRect.height / 2;
        }

        x += offsetX;
        y += offsetY;

        x = Math.max(10, Math.min(x, window.innerWidth - ttRect.width - 10));
        y = Math.max(10, Math.min(y, window.innerHeight - ttRect.height - 10));

        tt.style.left = x + 'px';
        tt.style.top = y + 'px';
        tt.style.transform = 'none';
    }

    _addHighlight(selector) {
        const el = document.querySelector(selector);
        if (!el) return;

        const pulse = document.createElement('div');
        pulse.className = 'tutorial-highlight-pulse';
        const rect = el.getBoundingClientRect();
        pulse.style.cssText = `
            position: fixed;
            left: ${rect.left - 4}px;
            top: ${rect.top - 4}px;
            width: ${rect.width + 8}px;
            height: ${rect.height + 8}px;
            border: 2px solid var(--accent-green);
            border-radius: 8px;
            box-shadow: 0 0 20px rgba(74,222,128,0.3), inset 0 0 20px rgba(74,222,128,0.05);
            pointer-events: none;
            z-index: 10001;
            animation: tutorialHighlightPulse 2s ease-in-out infinite;
        `;
        document.body.appendChild(pulse);
        this.pulseEls.push(pulse);
    }

    _clearHighlights() {
        this.pulseEls.forEach(el => el.remove());
        this.pulseEls = [];
    }

    _showMiniHint(text) {
        let hint = document.getElementById('tutorial-mini-hint');
        if (!hint) {
            hint = document.createElement('div');
            hint.id = 'tutorial-mini-hint';
            hint.style.cssText = `
                position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
                z-index: 10003; background: rgba(234,179,8,0.15);
                border: 1px solid var(--accent-yellow); color: var(--accent-yellow);
                font-family: var(--font-mono); font-size: 12px;
                padding: 8px 20px; border-radius: 8px;
                pointer-events: none; animation: tutorialFadeIn 0.3s ease-out;
            `;
            document.body.appendChild(hint);
        }
        hint.textContent = text;
        hint.style.display = 'block';
        clearTimeout(hint._timeout);
        hint._timeout = setTimeout(() => { hint.style.display = 'none'; }, 3000);
    }
}

// Singleton
const tutorial = new TutorialEngine();
export default tutorial;
export { TUTORIAL_WIN_GROUPS, TUTORIAL_FACTION_ID, TUTORIAL_AI_FACTION_ID };