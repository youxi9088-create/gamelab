export const COLORS = {
    BACKGROUND: 0x0a0e11,
    NODE_CONTROLLED: 0x22c55e,
    NODE_NEUTRAL: 0x718096,
    NODE_ENEMY: 0xef4444,
    NODE_NEUTRALIZED: 0xeab308,
    LINK: 0x2d3748,
    LINK_ACTIVE: 0x4ade80,
    TEXT_MAIN: 0xffffff,
    TEXT_SUB: 0xa0aec0
};

// ═══════════════════════════════════════
//  THE ELEVEN STANDARD ALIGNMENTS
// ═══════════════════════════════════════
// Opposed = -4 penalty, Tension = -2 penalty, Matching = +4 bonus.
// Only the ATTACKING group's alignments are compared vs the target.

export const ALIGNMENT_OPPOSED = {
    'Government': 'Criminal',
    'Criminal': 'Government',
    'Corporate': 'Activist',
    'Activist': 'Corporate',
    'Techno-Utopian': 'Legacy',
    'Legacy': 'Techno-Utopian',
    'Populist': 'Academic',
    'Academic': 'Populist',
    'Media': 'Weird',
    'Weird': 'Media',
    'Cultural': 'Financial',
    'Financial': 'Cultural'
};

export const ALIGNMENT_TENSION = {
    'Government': 'Techno-Utopian',
    'Techno-Utopian': 'Government',
    'Corporate': 'Populist',
    'Populist': 'Corporate',
    'Cultural': 'Media',
    'Media': 'Cultural',
    'Activist': 'Academic',
    'Academic': 'Activist',
    'Criminal': 'Financial',
    'Financial': 'Criminal',
    'Weird': 'Legacy',
    'Legacy': 'Weird'
};

// Keep legacy export name for compatibility
export const ALIGNMENT_OPPOSITES = ALIGNMENT_OPPOSED;

// Alignment metadata for the reference panel
export const ALIGNMENT_INFO = {
    'Government':       { icon: '🏛️', color: '#60a5fa', desc: 'Bureaucracies, regulators, state agencies.' },
    'Corporate':        { icon: '🏢', color: '#a78bfa', desc: 'Mega-corps, conglomerates, boards of directors.' },
    'Techno-Utopian': { icon: '🚀', color: '#34d399', desc: 'Silicon dreamers, AI evangelists, transhumanists.' },
    'Populist':         { icon: '✊', color: '#fb923c', desc: 'Grassroots movements, rabble-rousers, unions.' },
    'Activist':         { icon: '📢', color: '#f472b6', desc: 'NGOs, watchdogs, social justice orgs.' },
    'Criminal':         { icon: '🕵️', color: '#ef4444', desc: 'Syndicates, cartels, dark-web operators.' },
    'Media':            { icon: '📺', color: '#38bdf8', desc: 'News networks, influencers, propaganda mills.' },
    'Cultural':         { icon: '🎭', color: '#e879f9', desc: 'Entertainment empires, religious orgs, trend-setters.' },
    'Financial':        { icon: '💰', color: '#facc15', desc: 'Banks, hedge funds, crypto exchanges.' },
    'Weird':            { icon: '✨', color: '#a3e635', desc: 'Conspiracy theorists, cults, fringe science.' },
    'Legacy':           { icon: '🏰', color: '#94a3b8', desc: 'Old money, secret societies, ancient institutions.' },
    'Academic':         { icon: '🎓', color: '#22d3ee', desc: 'Universities, researchers, think tanks, intellectuals.' }
};

/**
 * Calculate alignment modifier between attacker and target.
 * Only the ATTACKING group's alignments are checked vs target.
 * +4 per matching alignment, -4 per opposed, -2 per tension.
 * Groups with 2+ alignments can stack multiple bonuses/penalties.
 */
export function getAlignmentPenalty(attackerAlignments = [], targetAlignments = []) {
    let modifier = 0;
    for (const aAlign of attackerAlignments) {
        // Check for matching alignment (+4)
        if (targetAlignments.includes(aAlign)) {
            modifier += 4;
        }
        // Check for opposed alignment (-4)
        const opposed = ALIGNMENT_OPPOSED[aAlign];
        if (opposed && targetAlignments.includes(opposed)) {
            modifier -= 4;
        }
        // Check for tension alignment (-2)
        const tension = ALIGNMENT_TENSION[aAlign];
        if (tension && targetAlignments.includes(tension)) {
            modifier -= 2;
        }
    }
    return modifier;
}

/**
 * Break down alignment modifier into readable components for UI display.
 */
export function getAlignmentBreakdown(attackerAlignments = [], targetAlignments = []) {
    const parts = [];
    for (const aAlign of attackerAlignments) {
        if (targetAlignments.includes(aAlign)) {
            parts.push({ type: 'match', attacker: aAlign, target: aAlign, value: +4 });
        }
        const opposed = ALIGNMENT_OPPOSED[aAlign];
        if (opposed && targetAlignments.includes(opposed)) {
            parts.push({ type: 'opposed', attacker: aAlign, target: opposed, value: -4 });
        }
        const tension = ALIGNMENT_TENSION[aAlign];
        if (tension && targetAlignments.includes(tension)) {
            parts.push({ type: 'tension', attacker: aAlign, target: tension, value: -2 });
        }
    }
    return parts;
}

// ═══════════════════════════════════════
    //  AI ARCHETYPES
    // ═══════════════════════════════════════
    export const AI_ARCHETYPES = {
        DEFAULT: {
            name: "Pragmatic Expansionist",
            capturePreference: 1.0,
            neutralizePreference: 0.5,
            hoardPreference: 0.5,
            disruptPreference: 0.5
        },
        CRYPTO_CULT: {
            name: "Aggressive Speculator",
            capturePreference: 0.8,
            neutralizePreference: 0.3,
            hoardPreference: 1.5,
            disruptPreference: 0.4
        },
        NATIONAL_SECURITY: {
            name: "Totalitarian Enforcer",
            capturePreference: 0.7,
            neutralizePreference: 1.5,
            hoardPreference: 0.4,
            disruptPreference: 0.8
        },
        CULTURE_WAR: {
            name: "Chaos Architect",
            capturePreference: 1.2,
            neutralizePreference: 0.8,
            hoardPreference: 0.3,
            disruptPreference: 1.5
        }
    };

    export const FACTION_AI_ARCHETYPES = {
        'f_algo': AI_ARCHETYPES.DEFAULT,
        'f_corp': AI_ARCHETYPES.DEFAULT,
        'f_natsec': AI_ARCHETYPES.NATIONAL_SECURITY,
        'f_cult': AI_ARCHETYPES.CULTURE_WAR,
        'f_crypto': AI_ARCHETYPES.CRYPTO_CULT,
        'f_underground': AI_ARCHETYPES.NATIONAL_SECURITY
    };

    // ─── FACTIONS (always 4 outgoing arrows) ───
// Re-aligned to the 12-alignment system
export const FACTIONS = {
    f_algo: {
        id: "f_algo", name: "Algorithmic Overlords",
        power: 8, transferPower: 8, resistance: 15, income: 3, arrows: 4,
        alignments: ["Corporate", "Techno-Utopian"],
        desc: "We don’t manipulate people. We just optimise them.", icon: "💻",
        logo: "assets/logo_f_algo.webp",
        image: "assets/faction_algo.webp",
        winDesc: "Control 6 Media or Techno-Utopian groups total, with a continuous chain of at least 4.",
        passive: {
            name: "Feed Tuning",
            desc: "During your turn, you can freely rearrange the network of other players.",
            icon: "🔄"
        },
        active: {
            name: "Predictive Manipulation",
            desc: "Once per turn, reduce the Resistance of a Media or Techno-Utopian group by 2 before rolling.",
            flavour: "Our model has determined you were going to lose that roll. We fixed it.",
            icon: "🔮"
        }
    },
    f_corp: {
        id: "f_corp", name: "Corporate Megabloc",
        power: 9, transferPower: 9, resistance: 15, income: 4, arrows: 4,
        alignments: ["Corporate", "Financial"],
        desc: "Competition is healthy. For everyone else.", icon: "🏢",
        logo: "assets/logo_corporate_megabloc-png.webp",
        image: "assets/faction_corp.webp",
        winDesc: "Control 6 Corporate or Financial groups AND generate at least ₿20 total Income.",
        passive: {
            name: "Vertical Integration",
            desc: "If you control 3+ Corporate groups (including this), gain +₿1 at the start of your turn.",
            icon: "📈"
        },
        passive2: {
            name: "Acquisition Surge",
            desc: "Triggered: when you take control of a Corporate or Financial group, gain +₿3.",
            flavour: "Congratulations on your acquisition. Please enjoy this complimentary market advantage.",
            icon: "📊"
        },
        active: null
    },
    f_natsec: {
        id: "f_natsec", name: "National Security Apparatus",
        power: 10, transferPower: 10, resistance: 15, income: 2, arrows: 4,
        alignments: ["Government", "Legacy"],
        desc: "Your privacy is important to us. That’s why we keep it.", icon: "👁️",
        logo: "assets/logo_f_natsec.webp",
        image: "assets/faction_natsec.webp",
        winDesc: "Control 10 groups total, including at least one of each: Techno-Utopian, Media, Government, Criminal, and Financial.",
        passive: {
            name: "Surveillance State",
            desc: "All groups you control gain +1 Resistance.",
            icon: "📡"
        },
        active: {
            name: "Plausible Deniability Protocol",
            desc: "Once per turn, when a group you control is successfully attacked, you may pay ₿5 to cancel the attack.",
            flavour: "That operation never happened. You never saw this card.",
            icon: "🕶️"
        }
    },
    f_cult: {
        id: "f_cult", name: "Culture-War Architects",
        power: 7, transferPower: 7, resistance: 15, income: 1, arrows: 4,
        alignments: ["Cultural", "Populist"],
        desc: "If it divides people, it’s content.", icon: "🎭",
        logo: "assets/logo_f_cult.webp",
        image: "assets/faction_cult.webp",
        winDesc: "Control 8 groups total, with at least 5 having a base Resistance of 2 or lower.",
        passive: {
            name: "Viral Backlash",
            desc: "Whenever you reduce a group to 0 Resistance, gain +2 Power.",
            icon: "💥"
        },
        active: {
            name: "Narrative Agitation",
            desc: "Once per turn, reduce any group’s Resistance by 1. If the target is already at 1 or lower, your faction root gains +1 Power.",
            flavour: "If it can be turned into a scandal, it will be.",
            icon: "📢"
        }
    },
    f_crypto: {
        id: "f_crypto", name: "The Crypto Cult",
        power: 6, transferPower: 6, resistance: 15, income: 5, arrows: 4,
        alignments: ["Techno-Utopian", "Weird", "Financial"],
        desc: "Decentralised. Disruptive. Definitely not a pyramid scheme.", icon: "🪙",
        logo: "assets/logo_f_crypto.webp",
        image: "assets/faction_crypto_v2.webp",
        winDesc: "Accumulate at least ₿40 in your faction root, and control at least 2 Financial and 2 Techno-Utopian groups.",
        passive: {
            name: "Decentralised Liquidity",
            desc: "You may move ₿ freely between any groups you control at any time.",
            icon: "🌐"
        },
        active: {
            name: "Volatility Spike",
            desc: "Once per turn, gain +₿5. Lose ₿7 at the start of your next turn.",
            flavour: "Value flows freely through the blockchain. Mostly into our pockets.",
            icon: "⛓️"
        }
    },
    f_underground: {
        id: "f_underground", name: "The Hidden Hand",
        power: 8, transferPower: 8, resistance: 15, income: 3, arrows: 4,
        alignments: ["Criminal", "Legacy"],
        desc: "We were here before the network. We'll be here after it burns.", icon: "🦇",
        logo: "assets/logo_hidden_hand_v2-png.webp",
        image: "assets/faction_underground.webp",
        winDesc: "Complete one of three paths: 1) Hoard ₿50, 2) Control 8 Criminal or Legacy groups, or 3) Destroy 5 enemy groups.",
        passive: {
            name: "Entrenched Corruption",
            desc: "Whenever you destroy a group, gain +₿2 and draw 1 card.",
            icon: "💼"
        },
        active: {
            name: "Permanent Network",
            desc: "Once per turn, reduce any group’s Resistance by 1. If that group reaches 0 Resistance, you may destroy it.",
            flavour: "Favours, threats, bribes, and concrete shoes. The classics.",
            icon: "🕴️"
        }
    }
};

// ═══════════════════════════════════════
//  FACTION ABILITY HELPERS
// ═══════════════════════════════════════

/**
 * Algorithmic Overlords: Predictive Manipulation Engine
 * Replaced by active ability. Keep for compatibility to return 0.
 */
export function getAlgoManipulationBonus(factionId, targetAlignments = []) {
    return 0;
}

/**
 * Corporate Megabloc: Acquisition Surge (Active)
 * Returns true if the newly controlled group has Corporate or Financial alignment.
 */
export function shouldTriggerVerticalIntegration(factionId, groupAlignments = []) {
    if (factionId !== 'f_corp') return false;
    return groupAlignments.includes('Corporate') || groupAlignments.includes('Financial');
}

/**
 * National Security Apparatus: Plausible Deniability Protocol
 * Handled in main.js
 */
export function hasPlausibleDeniability(factionId) {
    return factionId === 'f_natsec';
}

/**
 * Culture-War Architects: Narrative Agitation / Outrage Cascade
 * Apply: target loses 1 Resistance. If already ≤ 1, attacker gains +1 Power on faction root instead.
 */
export function applyNarrativeAgitation(nodes, targetNodeId, casterPlayerId) {
    const target = nodes[targetNodeId];
    if (!target) return null;
    
    if (target.resistance <= 1) {
        // Already fragile — gain +1 Power on caster's root
        const root = Object.values(nodes).find(n => n.owner === casterPlayerId && n.type === 'root');
        if (root) root.power = (root.power || 0) + 1;
        return { type: 'power', targetName: target.name, targetIcon: target.icon || '🌐' };
    } else {
        target.resistance -= 1;
        return { type: 'resistance', targetName: target.name, targetIcon: target.icon || '🌐', newRes: target.resistance };
    }
}

/**
 * Crypto Cult: Decentralised Liquidity
 * Moves all BTC from source node to destination node (ignores adjacency).
 */
export function applyFluidTokenomics(nodes, fromNodeId, toNodeId, playerId, amountStr = 'ALL') {
    const from = nodes[fromNodeId];
    const to = nodes[toNodeId];
    if (!from || !to || from.owner !== playerId || to.owner !== playerId) return 0;
    
    let amount = 0;
    if (amountStr === 'ALL') {
        amount = from.btc || 0;
    } else {
        amount = Math.min(from.btc || 0, parseInt(amountStr, 10));
    }
    
    if (amount <= 0 || isNaN(amount)) return 0;
    
    from.btc -= amount;
    to.btc = (to.btc || 0) + amount;
    return amount;
}

// ─── DECK ───
// Each card: arrows = outgoing control slots (1-3), alignments from the 12-alignment system
// transferPower = power lent upward to groups attacking through this node
export const DECK = [
    { id: "n_stream",   name: "OmniStream Prime+",      alignments: ["Media", "Corporate"], power: 4, transferPower: 2, resistance: 2, income: 1, arrows: 2, desc: "+1 Power when attacking Entertainment.", icon: "📺", image: "assets/n_stream-png.webp" },
    { id: "n_tabloid",  name: "Tabloid Printers",        alignments: ["Media", "Populist"], power: 3, transferPower: 1, resistance: 1, income: 2, arrows: 1, desc: "When an Event is played, gain +1 Income.", icon: "📰", image: "assets/n_tabloid-png.webp" },
    { id: "n_meme",     name: "Meme Aggregators",          alignments: ["Media", "Weird", "Cultural"], power: 1, transferPower: 1, resistance: 1, income: 0, arrows: 1, desc: "Once per turn, reduce any group's Resistance by 1.", icon: "📱", image: "assets/n_meme.webp" },
    { id: "n_bank",     name: "The Bank of Everywhere",  alignments: ["Financial", "Government"], power: 5, transferPower: 4, resistance: 4, income: 5, arrows: 2, desc: "Convert 1 Income into +1 Resistance.", icon: "🏦", image: "assets/n_bank-png.webp" },
    { id: "n_hedge",    name: "Quantum-Optimised Hedge Wizards",      alignments: ["Financial", "Corporate"], power: 3, transferPower: 2, resistance: 2, income: 5, arrows: 2, desc: "Roll +1 modifier when attacking groups with Income ≥ 3.", icon: "📈", image: "assets/n_hedge.webp" },
    { id: "n_payday",   name: "InstantCash Predatory Solutions",             alignments: ["Financial", "Criminal"], power: 2, transferPower: 1, resistance: 1, income: 6, arrows: 1, desc: "When you gain Income, gain +1 extra.", icon: "💸", image: "assets/n_payday.webp" },
    { id: "n_bureau",   name: "Bureau of Bureaucratic Oversight", alignments: ["Government", "Legacy"], power: 1, transferPower: 2, resistance: 5, income: 0, arrows: 3, desc: "High Resistance, many control slots.", icon: "🏛️", image: "assets/n_bureau.webp" },
    { id: "n_diplo",    name: "The United Nations",  alignments: ["Government", "Activist"], power: 3, transferPower: 2, resistance: 4, income: 0, arrows: 2, desc: "Connected groups cannot be targeted by Events.", icon: "🤝", image: "assets/n_diplo.webp" },
    { id: "n_health",   name: "National Wellness Compliance Authority",      alignments: ["Government", "Academic"], power: 2, transferPower: 1, resistance: 4, income: 0, arrows: 2, desc: "When a crisis Event fires, gain +1 Power.", icon: "🏥", image: "assets/n_health.webp" },
    { id: "n_ai",       name: "AI Ethics Advisory Panel",                alignments: ["Activist", "Academic"], power: 1, transferPower: 1, resistance: 3, income: 0, arrows: 1, desc: "Cancel a passive ability of any Tech group.", icon: "🤖", image: "assets/n_ai.webp" },
    { id: "n_mod",      name: "Social Media Moderation Hub",    alignments: ["Media", "Corporate"], power: 3, transferPower: 2, resistance: 3, income: 0, arrows: 2, desc: "-1 Resistance when attacking Media groups.", icon: "🛡️", image: "assets/n_mod.webp" },
    { id: "n_biotech",  name: "Biotech Startup Incubator",      alignments: ["Techno-Utopian", "Financial"], power: 2, transferPower: 1, resistance: 1, income: 1, arrows: 2, desc: "When you Control a group, gain +1 Power.", icon: "🧬", image: "assets/n_biotech.webp" },
    { id: "n_church",   name: "Mega-Church Network", alignments: ["Populist", "Legacy"], power: 5, transferPower: 4, resistance: 3, income: 4, arrows: 3, desc: "High power hub. Connected groups gain +1 Power.", icon: "⛪", image: "assets/n_church.webp" },
    { id: "n_esports",  name: "Esports Franchise League",       alignments: ["Media", "Weird"], power: 2, transferPower: 1, resistance: 1, income: 1, arrows: 1, desc: "Once per turn, reroll a die.", icon: "🎮", image: "assets/n_esports.webp" },
    { id: "n_charity",  name: "Celebrity Philanthropy Foundation", alignments: ["Academic", "Activist"], power: 1, transferPower: 1, resistance: 3, income: 3, arrows: 1, desc: "When you gain Income, gain +1 Resistance.", icon: "🌟", image: "assets/n_charity.webp" },
    { id: "n_darkweb",  name: "Dark Web Marketplace",           alignments: ["Techno-Utopian", "Criminal"], power: 4, transferPower: 2, resistance: 2, income: 4, arrows: 2, desc: "Ignore Resistance bonuses when attacking.", icon: "🕸️", image: "assets/n_darkweb.webp" },
    { id: "n_smuggle",  name: "International Smuggling Syndicate", alignments: ["Criminal", "Financial"], power: 3, transferPower: 3, resistance: 2, income: 4, arrows: 2, desc: "Connected groups gain +1 Income.", icon: "🚢", image: "assets/n_smuggle.webp" },
    { id: "n_broker",   name: "Offshore Intelligence Broker",   alignments: ["Financial", "Criminal"], power: 2, transferPower: 2, resistance: 3, income: 2, arrows: 1, desc: "Look at a random card in opponent's hand.", icon: "🕵️", image: "assets/n_broker.webp" },
    { id: "n_space",    name: "Billionaire Space Tourists", alignments: ["Techno-Utopian", "Corporate", "Weird"], power: 2, transferPower: 1, resistance: 3, income: 0, arrows: 2, desc: "Immune to Earth-based Events.", icon: "🚀", image: "assets/n_space.webp" },
    { id: "n_astro",    name: "Astrology Influencers", alignments: ["Populist", "Weird"], power: 1, transferPower: 1, resistance: 1, income: 2, arrows: 1, desc: "Add +1 or -1 to any die roll.", icon: "✨", image: "assets/n_astro.webp" },
    // Faction-aligned groups
    { id: "g_inf_scroll", name: "Infi-Scroll Media Corp",   alignments: ["Media", "Corporate"], power: 4, transferPower: 3, resistance: 1, income: 1, arrows: 2, desc: "Algorithmic Overlords aligned.", icon: "📱", image: "assets/g_inf_scroll-png.webp" },
    { id: "g_pe",       name: "Vulture Capital Extraction Group",      alignments: ["Financial", "Corporate", "Legacy"], power: 4, transferPower: 3, resistance: 3, income: 4, arrows: 2, desc: "Corporate Megabloc aligned.", icon: "💼", image: "assets/g_pe.webp" },
    { id: "g_drone",    name: "Drone Operations Bureau",        alignments: ["Government", "Corporate"], power: 6, transferPower: 4, resistance: 2, income: 0, arrows: 1, desc: "National Security aligned.", icon: "🛩️", image: "assets/g_natsec_drone-png.webp" },
    { id: "g_meme_war", name: "Memetic Warfare Division",          alignments: ["Media", "Criminal", "Weird"], power: 3, transferPower: 2, resistance: 1, income: 0, arrows: 1, desc: "Culture-War aligned.", icon: "🤡", image: "assets/g_meme_war.webp" },
    { id: "g_nft",      name: "NFT Visionary Collective",       alignments: ["Techno-Utopian", "Weird"], power: 2, transferPower: 1, resistance: 1, income: 3, arrows: 2, desc: "Crypto Cult aligned.", icon: "🖼️", image: "assets/g_nft.webp" },
    // Additional groups for variety
    { id: "n_pharma",   name: "Big Pharma Conglomerate",        alignments: ["Financial", "Corporate"], power: 4, transferPower: 3, resistance: 4, income: 5, arrows: 2, desc: "Wealthy and entrenched. Hard to shake loose.", icon: "💊", image: "assets/n_pharma.webp" },
    { id: "n_union",    name: "Global Workers' Union",          alignments: ["Populist", "Activist"], power: 3, transferPower: 2, resistance: 3, income: 0, arrows: 2, desc: "Solidarity is power. +1 R when adjacent to another Activist.", icon: "✊", image: "assets/n_union.webp" },
    { id: "n_thinktank", name: "Shadowy Think Tank",            alignments: ["Academic", "Legacy"], power: 2, transferPower: 2, resistance: 3, income: 1, arrows: 3, desc: "Low profile, high influence. 3 control slots.", icon: "🏛️", image: "assets/n_thinktank.webp" },
    { id: "n_delivery", name: "Gig Economy Network",   alignments: ["Corporate", "Techno-Utopian"], power: 2, transferPower: 1, resistance: 1, income: 3, arrows: 1, desc: "Low resistance, high income. Easy to grab, easy to lose.", icon: "📦", image: "assets/n_delivery-png.webp" },
    { id: "n_podcast",  name: "Conspiracy Podcast Empire",      alignments: ["Media", "Populist"], power: 1, transferPower: 1, resistance: 1, income: 2, arrows: 1, desc: "Maximum income. Resistance 1 = easy target.", icon: "🎙️", image: "assets/n_podcast.webp" },
    { id: "n_pmc",      name: "Private Military Contractors",    alignments: ["Government", "Corporate"], power: 6, transferPower: 4, resistance: 3, income: 0, arrows: 1, desc: "Pure muscle. High power, low slots.", icon: "🎖️", image: "assets/n_pmc-png.webp" },
    { id: "n_crypto_ex", name: "Offshore Crypto Exchange",      alignments: ["Techno-Utopian", "Financial"], power: 2, transferPower: 1, resistance: 2, income: 6, arrows: 1, desc: "Volatile but lucrative. Top income earner.", icon: "⛓️", image: "assets/n_crypto_ex.webp" },
    { id: "n_fashion",  name: "Fast Fashion Empire",            alignments: ["Corporate", "Cultural"], power: 2, transferPower: 1, resistance: 2, income: 2, arrows: 2, desc: "Consumer engine. Steady income, two slots.", icon: "👗", image: "assets/n_fashion.webp" },

    // ═══════════════════════════════════════
    //  DECK EXPANSION — 50 NEW CARDS
    // ═══════════════════════════════════════

    // ─── 📰 MEDIA & INFORMATION (1–10) ───
    { id: "x_factcheck",    name: "Algorithmic Truth Verificators",  alignments: ["Media", "Activist"], power: 2, transferPower: 1, resistance: 2, income: 0, arrows: 1, desc: "Cancel a passive of any Populist group once per turn.", icon: "📰", image: "assets/x_factcheck.webp" },
    { id: "x_infpodcast",   name: "Infinite Podcast Network",            alignments: ["Media", "Cultural"], power: 3, transferPower: 2, resistance: 1, income: 1, arrows: 2, desc: "Draw +1 card whenever you gain Income.", icon: "🎧", image: "assets/x_infpodcast.webp" },
    { id: "x_ainews",       name: "AI News Anchors",            alignments: ["Media", "Techno-Utopian"], power: 3, transferPower: 2, resistance: 2, income: 1, arrows: 2, desc: "When you play an Action, gain +1 Power.", icon: "🤖", image: "assets/x_ainews.webp" },
    { id: "x_viralclip",    name: "Viral Clip Harvesters",               alignments: ["Media"], power: 2, transferPower: 1, resistance: 1, income: 2, arrows: 3, desc: "When an opponent fails an Attack, gain +₿1.", icon: "📹", image: "assets/x_viralclip.webp" },
    { id: "x_memeweather",  name: "Memetic Weather Service",         alignments: ["Media", "Weird"], power: 1, transferPower: 1, resistance: 1, income: 0, arrows: 1, desc: "Reroll any die showing a 1 once per turn.", icon: "🌦️", image: "assets/x_memeweather.webp" },
    { id: "x_subbundle",    name: "Subscription Bundle Cartel",          alignments: ["Media", "Corporate"], power: 2, transferPower: 1, resistance: 2, income: 3, arrows: 2, desc: "Connected groups gain +1 Income.", icon: "📦", image: "assets/x_subbundle.webp" },
    { id: "x_citizenj",     name: "Citizen Journalists",            alignments: ["Media", "Populist"], power: 2, transferPower: 1, resistance: 2, income: 0, arrows: 1, desc: "When an Event is played, gain +1 Resistance.", icon: "📱", image: "assets/x_citizenj.webp" },
    { id: "x_deepdive",     name: "Deep-Dive Documentaries",    alignments: ["Media", "Cultural"], power: 3, transferPower: 2, resistance: 3, income: 0, arrows: 1, desc: "Reduce any Corporate group's Power by 1 once per turn.", icon: "🎬", image: "assets/x_deepdive.webp" },
    { id: "x_aiscript",     name: "AI Scriptwriter Guild",               alignments: ["Media", "Techno-Utopian"], power: 2, transferPower: 1, resistance: 2, income: 1, arrows: 2, desc: "Discard a card when drawing to gain +1 Power.", icon: "✍️", image: "assets/x_aiscript.webp" },
    { id: "x_attmetrics",   name: "Global Attention Metrics Exchange",   alignments: ["Media", "Financial"], power: 3, transferPower: 2, resistance: 1, income: 4, arrows: 3, desc: "Whenever any player gains Income, gain +₿1.", icon: "👁️", image: "assets/x_attmetrics.webp" },

    // ─── 💰 FINANCE & ECONOMY (11–20) ───
    { id: "x_esg",          name: "ESG Ratings Conglomerate",            alignments: ["Corporate", "Academic"], power: 2, transferPower: 1, resistance: 3, income: 3, arrows: 1, desc: "Connected groups gain +1 Resistance.", icon: "🌿", image: "assets/x_esg.webp" },
    { id: "x_taxavoid",     name: "AI-Optimised Tax Minimisation Toolkit",       alignments: ["Financial", "Techno-Utopian", "Corporate"], power: 2, transferPower: 1, resistance: 2, income: 5, arrows: 2, desc: "Your Income cannot be reduced by Events.", icon: "🧾", image: "assets/x_taxavoid.webp" },
    { id: "x_microinvest",  name: "Micro-Investment Swarm",       alignments: ["Financial", "Populist"], power: 1, transferPower: 1, resistance: 1, income: 4, arrows: 2, desc: "When you Control a group, gain +₿1.", icon: "📊", image: "assets/x_microinvest.webp" },
    { id: "x_ubdividend",   name: "Universal Basic Dividends™ Program",       alignments: ["Financial", "Activist"], power: 1, transferPower: 1, resistance: 3, income: 4, arrows: 1, desc: "Convert 1 Income → +1 Resistance once per turn.", icon: "💳", image: "assets/x_ubdividend.webp" },
    { id: "x_loyaltypts",   name: "Loyalty Points Exchange",   alignments: ["Financial", "Corporate"], power: 2, transferPower: 1, resistance: 1, income: 4, arrows: 3, desc: "Treat Income as Power for one Attack per turn.", icon: "🎁", image: "assets/x_loyaltypts.webp" },
    { id: "x_hedgedao",     name: "Auto Hedge Fund DAO",           alignments: ["Financial", "Techno-Utopian"], power: 2, transferPower: 2, resistance: 1, income: 5, arrows: 2, desc: "On doubles, gain +₿2M.", icon: "🤑", image: "assets/x_hedgedao.webp" },
    { id: "x_shipfutures",  name: "Global Shipping Futures Market",      alignments: ["Financial", "Corporate"], power: 3, transferPower: 2, resistance: 2, income: 4, arrows: 2, desc: "Connected groups gain +1 Income.", icon: "🚢", image: "assets/x_shipfutures.webp" },
    { id: "x_instloan",     name: "Instant Loan Approval AI",            alignments: ["Financial", "Techno-Utopian"], power: 2, transferPower: 1, resistance: 1, income: 5, arrows: 1, desc: "When you gain Income, gain +1 Power.", icon: "⚡", image: "assets/x_instloan.webp" },
    { id: "x_carbonarb",    name: "Carbon Credit Arbitrage Syndicate",   alignments: ["Financial", "Activist"], power: 2, transferPower: 1, resistance: 3, income: 3, arrows: 2, desc: "Reduce any Corporate group's Income by 1 once per turn.", icon: "🌍", image: "assets/x_carbonarb.webp" },
    { id: "x_luxauth",      name: "Luxury Goods Authentication Bureau",  alignments: ["Cultural", "Corporate"], power: 1, transferPower: 1, resistance: 3, income: 4, arrows: 1, desc: "Connected groups gain +1 Resistance.", icon: "💎", image: "assets/x_luxauth.webp" },

    // ─── 🏛️ GOVERNMENT & INSTITUTIONS (21–30) ───
    { id: "x_algofair",     name: "Ministry of Algorithmic Fairness",    alignments: ["Government", "Activist"], power: 3, transferPower: 2, resistance: 4, income: 0, arrows: 1, desc: "Cancel a Corporate passive once per turn.", icon: "⚖️", image: "assets/x_algofair.webp" },
    { id: "x_infraai",      name: "National Infrastructure Delay Commission",  alignments: ["Government"], power: 4, transferPower: 3, resistance: 3, income: 0, arrows: 2, desc: "Connected groups gain +1 Income.", icon: "🏗️", image: "assets/x_infraai.webp" },
    { id: "x_datatrans",    name: "Public Data Transparency Office",     alignments: ["Government", "Legacy"], power: 2, transferPower: 1, resistance: 4, income: 0, arrows: 1, desc: "Reveal a random card from an opponent's hand once per turn.", icon: "🔍", image: "assets/x_datatrans.webp" },
    { id: "x_pandemic",     name: "Global Pandemic Preparedness Board",  alignments: ["Government", "Activist"], power: 3, transferPower: 2, resistance: 5, income: 0, arrows: 2, desc: "Gain +1 Power when a crisis Event fires.", icon: "🦠", image: "assets/x_pandemic.webp" },
    { id: "x_zoning",       name: "Urban Zoning Hyper-Commission",         alignments: ["Government"], power: 2, transferPower: 2, resistance: 4, income: 1, arrows: 1, desc: "Connected groups gain +1 Resistance.", icon: "🏙️", image: "assets/x_zoning.webp" },
    { id: "x_tribunal",     name: "International Arbitration Tribunal",  alignments: ["Government", "Legacy"], power: 4, transferPower: 3, resistance: 3, income: 0, arrows: 2, desc: "Reduce any Criminal group's Power by 1 once per turn.", icon: "🔨", image: "assets/x_tribunal.webp" },
    { id: "x_cybershield",  name: "National Cybersecurity Shield",       alignments: ["Government", "Techno-Utopian"], power: 3, transferPower: 2, resistance: 5, income: 0, arrows: 3, desc: "Block one Action targeting you per turn.", icon: "🛡️", image: "assets/x_cybershield.webp" },
    { id: "x_edreform",     name: "Public Education Reform Board",       alignments: ["Government", "Academic"], power: 2, transferPower: 1, resistance: 3, income: 0, arrows: 1, desc: "Connected groups gain +1 Power.", icon: "📚", image: "assets/x_edreform.webp" },
    { id: "x_waterrights",  name: "Global Water Rights Authority",       alignments: ["Government", "Financial"], power: 3, transferPower: 2, resistance: 3, income: 2, arrows: 2, desc: "Convert 1 Income → +1 Power once per turn.", icon: "💧", image: "assets/x_waterrights.webp" },
    { id: "x_dronereg",     name: "National Drone Regulation Office",    alignments: ["Government"], power: 3, transferPower: 2, resistance: 4, income: 0, arrows: 1, desc: "Reduce any Techno-Utopian group's Power by 1.", icon: "📋", image: "assets/x_dronereg.webp" },

    // ─── 🧪 TECH & SCIENCE (31–40) ───
    { id: "x_synthfood",    name: "Synthetic Food Megalab",              alignments: ["Techno-Utopian", "Corporate"], power: 2, transferPower: 1, resistance: 2, income: 2, arrows: 2, desc: "Connected groups gain +1 Income.", icon: "🧫", image: "assets/x_synthfood.webp" },
    { id: "x_robotwork",    name: "Autonomous Robot Workforce",          alignments: ["Techno-Utopian", "Corporate"], power: 4, transferPower: 3, resistance: 2, income: 2, arrows: 3, desc: "Reduce Resistance of groups you attack by 1.", icon: "🦾", image: "assets/x_robotwork.webp" },
    { id: "x_emotionlab",   name: "AI Emotion Simulation Lab",           alignments: ["Techno-Utopian", "Weird"], power: 2, transferPower: 1, resistance: 2, income: 0, arrows: 1, desc: "Swap Power/Resistance of a connected group once per turn.", icon: "🧠", image: "assets/x_emotionlab.webp" },
    { id: "x_climateeng",   name: "Climate Engineering Consortium",      alignments: ["Techno-Utopian", "Activist"], power: 3, transferPower: 2, resistance: 3, income: 0, arrows: 2, desc: "Gain +1 Power when a crisis Event fires.", icon: "🌡️", image: "assets/x_climateeng.webp" },
    { id: "x_dreamad",      name: "Neural Dream Advertising Division",   alignments: ["Techno-Utopian", "Media"], power: 3, transferPower: 2, resistance: 1, income: 3, arrows: 3, desc: "When you gain Income, gain +1 Power.", icon: "💭", image: "assets/x_dreamad.webp" },
    { id: "x_aifashion",    name: "AI-Generated Fashion House",          alignments: ["Techno-Utopian", "Cultural", "Corporate"], power: 2, transferPower: 1, resistance: 2, income: 2, arrows: 2, desc: "Connected groups gain +1 Income.", icon: "👗", image: "assets/x_aifashion.webp" },
    { id: "x_predpolice",   name: "Predictive Policing Engine",          alignments: ["Techno-Utopian", "Government"], power: 5, transferPower: 4, resistance: 3, income: 0, arrows: 2, desc: "Reduce any Criminal group's Resistance by 1.", icon: "🔮", image: "assets/x_predpolice.webp" },
    { id: "x_autovehicle",  name: "Autonomous Vehicle Grid",             alignments: ["Techno-Utopian", "Corporate"], power: 3, transferPower: 2, resistance: 2, income: 2, arrows: 3, desc: "Connected groups gain +1 Power.", icon: "🚗", image: "assets/x_autovehicle.webp" },
    { id: "x_aimedical",    name: "AI-Enhanced Medical Diagnostics Hub", alignments: ["Techno-Utopian", "Academic"], power: 2, transferPower: 1, resistance: 3, income: 1, arrows: 1, desc: "When you Control a group, gain +1 Resistance.", icon: "🩺", image: "assets/x_aimedical.webp" },
    { id: "x_quantumbox",   name: "Quantum Encryption Blackbox",         alignments: ["Techno-Utopian", "Weird"], power: 1, transferPower: 1, resistance: 5, income: 0, arrows: 2, desc: "Immune to the first Action played against it each turn.", icon: "🔐", image: "assets/x_quantumbox.webp" },

    // ─── 🎭 CULTURE & SOCIETY (41–50) ───
    { id: "x_vrpark",       name: "Hyper-Immersive Reality Parks",   alignments: ["Techno-Utopian", "Corporate"], power: 2, transferPower: 1, resistance: 2, income: 2, arrows: 3, desc: "Connected groups gain +1 Income.", icon: "🎢", image: "assets/x_vrpark.webp" },
    { id: "x_wellness",     name: "Wellness Retreats",     alignments: ["Cultural", "Populist", "Weird"], power: 1, transferPower: 1, resistance: 1, income: 3, arrows: 2, desc: "When you gain Income, gain +1 Power.", icon: "🧘", image: "assets/x_wellness.webp" },
    { id: "x_fandom",       name: "International Fandom Union",          alignments: ["Media", "Cultural", "Populist"], power: 3, transferPower: 2, resistance: 2, income: 0, arrows: 1, desc: "Adjust any group's Resistance by ±1 once per turn.", icon: "💫", image: "assets/x_fandom.webp" },
    { id: "x_celclone",     name: "Celebrity AI Clone Agency",           alignments: ["Techno-Utopian", "Cultural", "Media"], power: 2, transferPower: 1, resistance: 2, income: 1, arrows: 2, desc: "Copy a connected Cultural passive.", icon: "🌟", image: "assets/x_celclone.webp" },
    { id: "x_esportsbet",   name: "Esports Betting Syndicate",    alignments: ["Criminal", "Cultural"], power: 3, transferPower: 2, resistance: 1, income: 4, arrows: 3, desc: "On successful Attack, steal ₿1M.", icon: "🎰", image: "assets/x_esportsbet.webp" },
    { id: "x_streetfood",   name: "Street Food Vendors", alignments: ["Cultural", "Legacy"], power: 1, transferPower: 1, resistance: 2, income: 1, arrows: 1, desc: "Connected groups gain +1 Resistance.", icon: "🍜", image: "assets/x_streetfood.webp" },
    { id: "x_nostalgia",    name: "Nostalgia Preservation Society", alignments: ["Media", "Cultural", "Legacy"], power: 2, transferPower: 1, resistance: 4, income: 0, arrows: 1, desc: "Treat any discarded card as if in your hand once per turn.", icon: "📼", image: "assets/x_nostalgia.webp" },
    { id: "x_virtualidol",  name: "Virtual Idol Talent Agency",          alignments: ["Cultural", "Techno-Utopian"], power: 3, transferPower: 2, resistance: 1, income: 2, arrows: 2, desc: "Gain +₿1M when an Event is played.", icon: "🎤", image: "assets/x_virtualidol.webp" },
    { id: "x_memeolympics", name: "International Meme Olympics", alignments: ["Media", "Weird", "Populist"], power: 2, transferPower: 1, resistance: 2, income: 0, arrows: 2, desc: "Reroll any opponent's die once per turn.", icon: "🏅", image: "assets/x_memeolympics.webp" },
    { id: "x_happiness",    name: "Global Happiness Index Bureau",        alignments: ["Government", "Cultural"], power: 1, transferPower: 1, resistance: 3, income: 0, arrows: 1, desc: "Connected groups gain +1 Resistance.", icon: "😊", image: "assets/x_happiness.webp" },

    // ─── ⚖️ BALANCE EXPANSION (51–62) ───
    { id: "y_research",      name: "Global Research Consortium",   alignments: ["Academic", "Corporate"], power: 2, transferPower: 2, resistance: 3, income: 2, arrows: 2, desc: "Connected groups gain +1 Power.", icon: "🔬", image: "assets/y_research.webp" },
    { id: "y_flashmob",      name: "Viral Protest Flashmob",       alignments: ["Populist", "Activist"], power: 3, transferPower: 2, resistance: 1, income: 0, arrows: 2, desc: "Reduce any group's Resistance by 1 once per turn.", icon: "📱", image: "assets/y_flashmob.webp" },
    { id: "y_protection",    name: "Mafia Protection Racket",     alignments: ["Criminal", "Legacy"], power: 3, transferPower: 2, resistance: 3, income: 3, arrows: 1, desc: "Connected groups gain +1 Resistance.", icon: "🛡️", image: "assets/y_protection.webp" },
    { id: "y_aibrokers",     name: "AI Information Brokers",       alignments: ["Criminal", "Techno-Utopian"], power: 2, transferPower: 1, resistance: 2, income: 4, arrows: 2, desc: "Convert 1 Income into +1 Power once per turn.", icon: "🤖", image: "assets/y_aibrokers.webp" },
    { id: "y_climatestrike", name: "Climate Strike Organisers",    alignments: ["Activist", "Populist"], power: 2, transferPower: 2, resistance: 4, income: 0, arrows: 2, desc: "Reduce any Corporate group's Income by 1 once per turn.", icon: "🌍", image: "assets/y_climatestrike.webp" },
    { id: "y_conspiracy",    name: "Conspiracy Board Hub",         alignments: ["Weird", "Academic"], power: 1, transferPower: 1, resistance: 1, income: 1, arrows: 1, desc: "Reduce any Government group's Power by 1 once per turn.", icon: "🕵️", image: "assets/y_conspiracy.webp" },
    { id: "y_digitalrights", name: "Digital Rights Defenders",     alignments: ["Activist", "Techno-Utopian"], power: 2, transferPower: 1, resistance: 3, income: 1, arrows: 1, desc: "Block one Action targeting you per turn.", icon: "🔐", image: "assets/y_digitalrights.webp" },
    { id: "y_endowment",     name: "Elite University Endowment",   alignments: ["Academic", "Financial"], power: 1, transferPower: 1, resistance: 4, income: 5, arrows: 2, desc: "When you gain Income, gain +1 Resistance.", icon: "🏛️", image: "assets/y_endowment.webp" },
    { id: "y_lottery",       name: "Underground Lottery Syndicate", alignments: ["Criminal", "Financial"], power: 3, transferPower: 2, resistance: 2, income: 4, arrows: 2, desc: "Connected groups gain +1 Income.", icon: "🎟️", image: "assets/y_lottery.webp" },
    { id: "y_open",          name: "Open Source Evangelists",      alignments: ["Academic", "Techno-Utopian"], power: 2, transferPower: 2, resistance: 2, income: 0, arrows: 3, desc: "Discard 1 random hand card to gain +1 Power.", icon: "🔓", image: "assets/y_open.webp" },
    { id: "y_peer",          name: "Peer-to-Peer Smugglers",       alignments: ["Criminal", "Populist"], power: 4, transferPower: 3, resistance: 1, income: 3, arrows: 2, desc: "Reduce any Media group's Power by 1 once per turn.", icon: "🏴‍☠️", image: "assets/y_peer.webp" },
    { id: "y_shell",         name: "Offshore Shell Network",       alignments: ["Criminal", "Corporate"], power: 1, transferPower: 2, resistance: 5, income: 4, arrows: 1, desc: "Income cannot be reduced by Events.", icon: "🏢", image: "assets/y_shell.webp" }
];

// ─── ATTACK TYPES ───
export const ATTACK_TYPES = {
    CONTROL: 'control',
    NEUTRALIZE: 'neutralize',
    DESTROY: 'destroy'
};

export function roll2d6() {
    return Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1;
}

/**
 * Attack resolution — OMNIS 2.0
 * 
 * Formula: Success = 2d6 ≤ Final Attack Strength
 *   Final Attack Strength = attackerPower + transferPower + btcSpent 
 *                          - targetResistance - defenderBtcSpent 
 *                          + alignmentModifier + abilityMods
 *
 * options.canReroll = true allows one reroll (Esports ability).
 * options.dieModifier = +/-1 adjusts final roll (Astrology ability).
 */
export function calculateAttack(finalStrength, attackType = 'control', options = {}) {
    let rerolled = false;
    let rolledDoubles = false;

    // Roll 2d6 tracking individual dice for doubles detection
    let d1 = Math.floor(Math.random() * 6) + 1;
    let d2 = Math.floor(Math.random() * 6) + 1;
    let roll = d1 + d2;
    rolledDoubles = (d1 === d2);

    // Astrology die modifier: applied to roll (negative = easier to succeed since we need roll ≤ strength)
    const dieModifier = options.dieModifier || 0;
    let adjustedRoll = roll + dieModifier;

    // Esports reroll: if enabled and first roll fails, reroll once
    if (options.canReroll && adjustedRoll > finalStrength) {
        const reDie1 = Math.floor(Math.random() * 6) + 1;
        const reDie2 = Math.floor(Math.random() * 6) + 1;
        roll = reDie1 + reDie2;
        rolledDoubles = (reDie1 === reDie2);
        adjustedRoll = roll + dieModifier;
        rerolled = true;
    }

    // Meme Olympics reroll: if defender has it and attack succeeded, force reroll once
    let forcedReroll = false;
    if (options.defenderHasMemeOlympics && adjustedRoll <= finalStrength && !rerolled) {
        const reDie1 = Math.floor(Math.random() * 6) + 1;
        const reDie2 = Math.floor(Math.random() * 6) + 1;
        roll = reDie1 + reDie2;
        rolledDoubles = (reDie1 === reDie2);
        adjustedRoll = roll + dieModifier;
        forcedReroll = true;
    }

    const success = adjustedRoll <= finalStrength;
    return { roll: adjustedRoll, finalStrength, success, rerolled, forcedReroll, dieModifier, rolledDoubles, d1, d2 };
}

/**
 * Compute the net attack strength before the roll.
 * attackerPower + transferable + btcSpent + abilityMod + alignmentMod 
 *   - targetResistance - defenderBtcSpent - distanceBonus
 */
export function computeAttackStrength({
    attackerPower = 0, transferPower = 0, btcSpent = 0,
    targetResistance = 0, defenderBtcSpent = 0,
    alignmentModifier = 0, attackAbilityMod = 0, defenseAbilityMod = 0,
    loyaltyBonus = 0, isEndgame = false,
    distanceBonus = 0
} = {}) {
    let str = attackerPower + transferPower + btcSpent + alignmentModifier 
              + attackAbilityMod + loyaltyBonus
              - targetResistance - defenderBtcSpent - defenseAbilityMod - distanceBonus;
    if (isEndgame) str += 1;
    return str;
}

/**
 * Get success chance (% probability that 2d6 ≤ finalStrength).
 * 2d6 range is 2–12. P(2d6 ≤ N):
 */
export function getSuccessChance(finalStrength) {
    // P(2d6 ≤ N) lookup
    const chances = { 
        1: 0, 2: 2.8, 3: 8.3, 4: 16.7, 5: 27.8, 6: 41.7, 
        7: 58.3, 8: 72.2, 9: 83.3, 10: 91.7, 11: 97.2, 12: 100 
    };
    if (finalStrength >= 12) return 100;
    if (finalStrength < 2) return 0;
    return chances[Math.floor(finalStrength)] || 0;
}

// ─── TREE HELPERS ───

/**
 * Get the chain of ancestors from a node up to the root (inclusive).
 */
export function getAncestorChain(nodes, nodeId) {
    const chain = [];
    let current = nodeId;
    const visited = new Set();
    while (current && !visited.has(current)) {
        visited.add(current);
        const node = nodes[current];
        if (!node) break;
        chain.push(node);
        current = node.parentId || null;
    }
    return chain;
}

/**
 * Calculate transferable power for an attacking node.
 */
/**
 * OMNIS RULES: Only the attacking group's own Power counts.
 * No ancestor/connected group Power is pooled.
 * Connections matter for control arrows, income flow, and interference — NOT shared Power.
 */
export function getAttackStrength(nodes, attackerNodeId, networkBlackout = false) {
    const attacker = nodes[attackerNodeId];
    if (!attacker) return 0;
    
    let basePow = attacker.power || 0;
    let baseRes = attacker.resistance || 0;
    
    // AI Emotion Simulation Lab: Swap Power/Resistance if beneficial for attack
    if (!networkBlackout && baseRes > basePow && attacker.owner) {
        const hasEmotionLab = Object.values(nodes).some(n => 
            n.owner === attacker.owner && n.id === 'x_emotionlab' && 
            (n.parentId === attacker.id || attacker.parentId === n.id)
        );
        if (hasEmotionLab) {
            basePow = baseRes;
        }
    }
    
    return basePow;
}

export function getChildCount(nodes, nodeId) {
    return Object.values(nodes).filter(n => n.parentId === nodeId).length;
}

export function getFreeArrows(nodes, nodeId) {
    const node = nodes[nodeId];
    if (!node) return 0;
    const maxArrows = node.arrows || (node.type === 'root' ? 4 : 1);
    return maxArrows - getChildCount(nodes, nodeId);
}

export function getDescendants(nodes, nodeId) {
    const descendants = [];
    const queue = [nodeId];
    const visited = new Set();
    while (queue.length > 0) {
        const curr = queue.shift();
        if (visited.has(curr)) continue;
        visited.add(curr);
        Object.values(nodes).forEach(n => {
            if (n.parentId === curr && !visited.has(n.id)) {
                descendants.push(n.id);
                queue.push(n.id);
            }
        });
    }
    return descendants;
}

export const TURN_PHASES = {
    INCOME: 'income',
    ACTION: 'action',
    INTERFERENCE: 'interference',
    FREE_ACTIONS: 'free_actions',
    END: 'end'
};

// ═══════════════════════════════════════
//  PASSIVE ABILITIES
// ═══════════════════════════════════════

/**
 * AI Ethics Board cancels Tech group passives
 */
export function isAbilityCancelled(nodes, targetNode) {
    if (!targetNode) return false;
    if (targetNode.abilityCancelled) return true; // Handled by active targeted abilities
    if (!targetNode.alignments || !targetNode.alignments.includes('Techno-Utopian')) return false;
    // Check if any opponent owns AI Ethics Board
    return Object.values(nodes).some(n =>
        n.id === 'n_ai' && n.owner && n.owner !== targetNode.owner
    );
}

// ─── ACTIVE GROUP ABILITIES CONFIG ───
export const ACTIVE_GROUP_ABILITIES = {
    'n_meme': {
        name: "Meme Aggregation",
        desc: "Reduce any group's Resistance by 1.",
        icon: "📱",
        needsTarget: true,
        filter: (n) => n.type !== 'root',
        execute: (nodes, casterId, targetId) => {
            const t = nodes[targetId];
            t.resistance = Math.max(1, t.resistance - 1);
            return `Reduced ${t.name}'s Resistance to ${t.resistance}!`;
        }
    },
    'x_fandom': {
        name: "Fandom Raid",
        desc: "Reduce any group's Resistance by 1.",
        icon: "💫",
        needsTarget: true,
        filter: (n) => n.type !== 'root',
        execute: (nodes, casterId, targetId) => {
            const t = nodes[targetId];
            t.resistance = Math.max(1, t.resistance - 1);
            return `Fandom reduced ${t.name}'s Resistance to ${t.resistance}!`;
        }
    },
    'x_factcheck': {
        name: "Fact-Check",
        desc: "Cancel a passive of any Populist group until end of turn.",
        icon: "📰",
        needsTarget: true,
        filter: (n) => n.type !== 'root' && n.alignments?.includes('Populist'),
        execute: (nodes, casterId, targetId) => {
            nodes[targetId].abilityCancelled = true;
            return `Cancelled ${nodes[targetId].name}'s passive!`;
        }
    },
    'x_algofair': {
        name: "Algorithmic Audit",
        desc: "Cancel a Corporate passive until end of turn.",
        icon: "⚖️",
        needsTarget: true,
        filter: (n) => n.type !== 'root' && n.alignments?.includes('Corporate'),
        execute: (nodes, casterId, targetId) => {
            nodes[targetId].abilityCancelled = true;
            return `Cancelled ${nodes[targetId].name}'s passive!`;
        }
    },
    'x_deepdive': {
        name: "Deep-Dive Exposé",
        desc: "Reduce any Corporate group's Power by 1.",
        icon: "🎬",
        needsTarget: true,
        filter: (n) => n.type !== 'root' && n.alignments?.includes('Corporate') && (n.power || 0) > 0,
        execute: (nodes, casterId, targetId) => {
            nodes[targetId].power -= 1;
            return `Reduced ${nodes[targetId].name}'s Power to ${nodes[targetId].power}!`;
        }
    },
    'x_carbonarb': {
        name: "Carbon Audit",
        desc: "Reduce any Corporate group's Income by 1.",
        icon: "🌍",
        needsTarget: true,
        filter: (n) => n.type !== 'root' && n.alignments?.includes('Corporate') && (n.income || 0) > 0,
        execute: (nodes, casterId, targetId) => {
            nodes[targetId].income -= 1;
            return `Reduced ${nodes[targetId].name}'s Income to ${nodes[targetId].income}!`;
        }
    },
    'x_tribunal': {
        name: "Arbitration",
        desc: "Reduce any Criminal group's Power by 1.",
        icon: "🔨",
        needsTarget: true,
        filter: (n) => n.type !== 'root' && n.alignments?.includes('Criminal') && (n.power || 0) > 0,
        execute: (nodes, casterId, targetId) => {
            nodes[targetId].power -= 1;
            return `Reduced ${nodes[targetId].name}'s Power to ${nodes[targetId].power}!`;
        }
    },
    'x_dronereg': {
        name: "Drone Regulation",
        desc: "Reduce any Techno-Utopian group's Power by 1.",
        icon: "📋",
        needsTarget: true,
        filter: (n) => n.type !== 'root' && n.alignments?.includes('Techno-Utopian') && (n.power || 0) > 0,
        execute: (nodes, casterId, targetId) => {
            nodes[targetId].power -= 1;
            return `Reduced ${nodes[targetId].name}'s Power to ${nodes[targetId].power}!`;
        }
    },
    'x_emotionlab': {
        name: "Emotion Swap",
        desc: "Swap Power and Resistance of a connected group.",
        icon: "🧠",
        needsTarget: true,
        filter: (n, casterNode) => n.id === casterNode.parentId || n.parentId === casterNode.id,
        execute: (nodes, casterId, targetId) => {
            const t = nodes[targetId];
            const p = t.power || 0;
            const r = t.resistance || 0;
            t.power = r;
            t.resistance = p;
            return `Swapped ${t.name}'s P/R (Now P:${t.power} R:${t.resistance})!`;
        }
    },
    'x_waterrights': {
        name: "Monetize Water",
        desc: "Convert 1 Income into +1 Power.",
        icon: "💧",
        needsTarget: false,
        execute: (nodes, casterId, targetId, casterNodeId) => {
            const c = nodes[casterNodeId];
            if ((c.income || 0) > 0) {
                c.income -= 1;
                c.power = (c.power || 0) + 1;
                return `Converted 1 Income to Power (Now P:${c.power})!`;
            }
            return null;
        }
    },
    'x_ubdividend': {
        name: "UBI Payment",
        desc: "Convert 1 Income into +1 Resistance.",
        icon: "💳",
        needsTarget: false,
        execute: (nodes, casterId, targetId, casterNodeId) => {
            const c = nodes[casterNodeId];
            if ((c.income || 0) > 0) {
                c.income -= 1;
                c.resistance = (c.resistance || 0) + 1;
                return `Converted 1 Income to Resistance (Now R:${c.resistance})!`;
            }
            return null;
        }
    },
    'n_bank': {
        name: "Central Advisory",
        desc: "Convert 1 Income into +1 Resistance.",
        icon: "🏦",
        needsTarget: false,
        execute: (nodes, casterId, targetId, casterNodeId) => {
            const c = nodes[casterNodeId];
            if ((c.income || 0) > 0) {
                c.income -= 1;
                c.resistance = (c.resistance || 0) + 1;
                return `Converted 1 Income to Resistance (Now R:${c.resistance})!`;
            }
            return null;
        }
    },
    'x_aiscript': {
        name: "Discard Draft",
        desc: "Discard 1 random hand card to gain +1 Power.",
        icon: "✍️",
        needsTarget: false,
        execute: (nodes, casterId, targetId, casterNodeId, G) => {
            const p = G.players[casterId];
            if (p && p.hand && p.hand.length > 0) {
                const idx = Math.floor(Math.random() * p.hand.length);
                const discarded = p.hand.splice(idx, 1)[0];
                G.discardPile.push(discarded);
                const c = nodes[casterNodeId];
                c.power = (c.power || 0) + 1;
                return `Discarded ${discarded.name} for +1 Power!`;
            }
            return null; // Failed
        }
    },
    'y_flashmob': {
        name: "Flashmob Swarm",
        desc: "Reduce any group's Resistance by 1.",
        icon: "📱",
        needsTarget: true,
        filter: (n) => n.type !== 'root',
        execute: (nodes, casterId, targetId) => {
            const t = nodes[targetId];
            t.resistance = Math.max(1, t.resistance - 1);
            return `Flashmob reduced ${t.name}'s Resistance to ${t.resistance}!`;
        }
    },
    'y_aibrokers': {
        name: "Sell Data",
        desc: "Convert 1 Income into +1 Power.",
        icon: "🤖",
        needsTarget: false,
        execute: (nodes, casterId, targetId, casterNodeId) => {
            const c = nodes[casterNodeId];
            if ((c.income || 0) > 0) {
                c.income -= 1;
                c.power = (c.power || 0) + 1;
                return `Converted 1 Income to Power (Now P:${c.power})!`;
            }
            return null;
        }
    },
    'y_climatestrike': {
        name: "Blockade",
        desc: "Reduce any Corporate group's Income by 1.",
        icon: "🌍",
        needsTarget: true,
        filter: (n) => n.type !== 'root' && n.alignments?.includes('Corporate') && (n.income || 0) > 0,
        execute: (nodes, casterId, targetId) => {
            nodes[targetId].income -= 1;
            return `Reduced ${nodes[targetId].name}'s Income to ${nodes[targetId].income}!`;
        }
    },
    'y_conspiracy': {
        name: "Expose Secrets",
        desc: "Reduce any Government group's Power by 1.",
        icon: "🕵️",
        needsTarget: true,
        filter: (n) => n.type !== 'root' && n.alignments?.includes('Government') && (n.power || 0) > 0,
        execute: (nodes, casterId, targetId) => {
            nodes[targetId].power -= 1;
            return `Reduced ${nodes[targetId].name}'s Power to ${nodes[targetId].power}!`;
        }
    },
    'y_open': {
        name: "Code Sprint",
        desc: "Discard 1 random hand card to gain +1 Power.",
        icon: "🔓",
        needsTarget: false,
        execute: (nodes, casterId, targetId, casterNodeId, G) => {
            const p = G.players[casterId];
            if (p && p.hand && p.hand.length > 0) {
                const idx = Math.floor(Math.random() * p.hand.length);
                const discarded = p.hand.splice(idx, 1)[0];
                G.discardPile.push(discarded);
                const c = nodes[casterNodeId];
                c.power = (c.power || 0) + 1;
                return `Discarded ${discarded.name} for +1 Power!`;
            }
            return null; // Failed
        }
    },
    'y_peer': {
        name: "Piracy",
        desc: "Reduce any Media group's Power by 1.",
        icon: "🏴‍☠️",
        needsTarget: true,
        filter: (n) => n.type !== 'root' && n.alignments?.includes('Media') && (n.power || 0) > 0,
        execute: (nodes, casterId, targetId) => {
            nodes[targetId].power -= 1;
            return `Reduced ${nodes[targetId].name}'s Power to ${nodes[targetId].power}!`;
        }
    }
};

export function getOnControlEffects(nodes, controllerPlayerId) {
    const effects = { powerBonus: 0, btcBonus: 0 };
    Object.values(nodes).forEach(n => {
        if (n.owner !== controllerPlayerId) return;
        // Biotech Startup: +1 Power on control
        if (n.id === 'n_biotech' && !isAbilityCancelled(nodes, n)) effects.powerBonus += 1;
        // Global Micro-Investment Swarm: +₿1M on control
        if (n.id === 'x_microinvest') effects.btcBonus += 1;
    });
    return effects;
}

/**
 * Check if the attacking player has Esports Franchise League (n_esports) — allows one reroll per turn.
 * Cancelled if AI Ethics Board is owned by an opponent.
 */
export function hasEsportsReroll(nodes, playerId) {
    return Object.values(nodes).some(n => n.owner === playerId && n.id === 'n_esports' && !isAbilityCancelled(nodes, n));
}

/**
 * Check if the defending player has International Meme Olympics Committee (x_memeolympics).
 * Forces an attacking opponent to reroll a successful attack.
 */
export function hasMemeOlympicsReroll(nodes, playerId) {
    return Object.values(nodes).some(n => n.owner === playerId && n.id === 'x_memeolympics');
}

/**
 * Check if the attacking player has Astrology Influencer Network (n_astro) — +1 to die roll.
 */
export function getAstrologyModifier(nodes, playerId) {
    return Object.values(nodes).some(n => n.owner === playerId && n.id === 'n_astro') ? 1 : 0;
}

/**
 * Celebrity AI Clone Agency (x_celclone) helper.
 * Returns true if the node matches the targetId OR if it's x_celclone connected to a Cultural node with targetId.
 */
export function hasPassiveAlias(nodes, node, targetId) {
    if (node.id === targetId) return true;
    // Celebrity AI Clone Agency: copy passives of connected Cultural groups
    if (node.id === 'x_celclone') {
        const neighbors = Object.values(nodes).filter(n => 
            n.owner === node.owner && 
            (n.parentId === node.id || node.parentId === n.id) &&
            n.alignments?.includes('Cultural')
        );
        if (neighbors.some(n => n.id === targetId)) return true;
    }
    // Deepfake Identity Theft: faction root copies a chosen group's passive for the turn
    if (node.type === 'root' && node._copiedPassiveFrom === targetId) return true;
    return false;
}

export function getIncomeBonus(nodes, cardNode, networkBlackout = false) {
    let bonus = 0;
    const pid = cardNode.owner;
    if (!pid) return 0;
    // Self-bonus: Payday Loan Empire
    if (hasPassiveAlias(nodes, cardNode, 'n_payday')) bonus += 1;
    // Parent-based: Connected groups gain +1 Income
    if (!networkBlackout && cardNode.parentId) {
        const parent = nodes[cardNode.parentId];
        if (parent && parent.owner === pid) {
            const incomeParents = ['n_smuggle', 'x_subbundle', 'x_shipfutures', 'x_infraai', 'x_synthfood', 'x_aifashion', 'x_vrpark', 'y_lottery'];
            if (incomeParents.some(id => hasPassiveAlias(nodes, parent, id))) bonus += 1;
        }
    }
    return bonus;
}

export function getAttackAbilityModifier(nodes, attackerNode, targetNode, networkBlackout = false) {
    let mod = 0;
    const cancelled = isAbilityCancelled(nodes, attackerNode);
    if (hasPassiveAlias(nodes, attackerNode, 'n_stream') && !cancelled) {
        if (targetNode.alignments && (targetNode.alignments.includes('Media') || targetNode.alignments.includes('Consumer'))) mod += 1;
    }
    if (hasPassiveAlias(nodes, attackerNode, 'n_hedge')) {
        if (targetNode.income >= 3) mod += 1;
    }
    if (hasPassiveAlias(nodes, attackerNode, 'n_mod') && !cancelled) {
        if (targetNode.alignments && targetNode.alignments.includes('Media')) mod += 1;
    }
    if (hasPassiveAlias(nodes, attackerNode, 'x_robotwork') && !cancelled) mod += 1;
    if (hasPassiveAlias(nodes, attackerNode, 'x_predpolice') && !cancelled) {
        if (targetNode.alignments && targetNode.alignments.includes('Criminal')) mod += 1;
    }
    if (!networkBlackout && attackerNode.parentId) {
        const parent = nodes[attackerNode.parentId];
        if (parent && parent.owner === attackerNode.owner) {
            const powerParents = ['n_church', 'x_autovehicle', 'x_edreform', 'y_research'];
            if (powerParents.some(id => hasPassiveAlias(nodes, parent, id))) mod += 1;
        }
    }
    return mod;
}

export function getDefenseAbilityModifier(nodes, defenderNode, networkBlackout = false) {
    // PR Meltdown / Freeze Order: target is "Scandalised" / locked and cannot
    // benefit from any defense ability bonuses this round.
    if (defenderNode && defenderNode._cannotDefendThisRound) return 0;

    let mod = 0;
    
    // Faction Passive: Surveillance State (National Security Apparatus)
    if (defenderNode.owner) {
        const root = Object.values(nodes).find(n => n.owner === defenderNode.owner && n.type === 'root');
        if (root) {
            // Find faction by name
            const faction = Object.values(FACTIONS).find(f => f.name === root.name);
            if (faction && faction.id === 'f_natsec') {
                mod += 1;
            }
        }
    }
    
    if (hasPassiveAlias(nodes, defenderNode, 'n_bank') && defenderNode.income > 0) mod += 1;
    if (!networkBlackout && defenderNode.parentId) {
        const parent = nodes[defenderNode.parentId];
        if (parent && parent.owner === defenderNode.owner) {
            if (hasPassiveAlias(nodes, parent, 'n_diplo')) mod += 1;
            const resParents = ['x_esg', 'x_luxauth', 'x_zoning', 'x_streetfood', 'x_happiness', 'y_protection'];
            if (resParents.some(id => hasPassiveAlias(nodes, parent, id))) mod += 1;
        }
    }
    if (hasPassiveAlias(nodes, defenderNode, 'x_quantumbox')) mod += 2;
    if (hasPassiveAlias(nodes, defenderNode, 'x_cybershield')) mod += 2;
    if (hasPassiveAlias(nodes, defenderNode, 'y_digitalrights')) mod += 2;
    // Global Workers' Union: +1 R when adjacent to another Activist
    if (!networkBlackout && hasPassiveAlias(nodes, defenderNode, 'n_union') && defenderNode.owner) {
        const adjacent = Object.values(nodes).filter(n =>
            n.owner === defenderNode.owner && n.id !== defenderNode.id &&
            (n.parentId === defenderNode.id || n.id === defenderNode.parentId) &&
            n.alignments?.includes('Activist')
        );
        if (adjacent.length > 0) mod += 1;
    }
    return mod;
}
export function brokerPeek(nodes, players, playerId) {
    const hasPeek = Object.values(nodes).some(n => n.owner === playerId && (n.id === 'n_broker' || n.id === 'x_datatrans'));
    if (!hasPeek) return null;
    // Pick a random opponent with cards in hand
    const opponents = Object.entries(players).filter(([pid, p]) => pid !== playerId && p.hand && p.hand.length > 0);
    if (opponents.length === 0) return null;
    const [opId, op] = opponents[Math.floor(Math.random() * opponents.length)];
    const card = op.hand[Math.floor(Math.random() * op.hand.length)];
    return { card, opponentName: op.name };
}

/**
 * Autonomous Hedge Fund DAO (x_hedgedao): On doubles, gain +₿2M.
 * Returns the BTC bonus if doubles were rolled and player owns the DAO.
 */
export function getDoublesBonus(nodes, playerId, rolledDoubles) {
    if (!rolledDoubles) return 0;
    const hasDAO = Object.values(nodes).some(n => n.owner === playerId && n.id === 'x_hedgedao');
    return hasDAO ? 2 : 0;
}

/**
 * Income phase triggers.
 * Wellness Retreat, Neural Dream Ad, Instant Loan Approval AI, Celebrity Philanthropy Foundation:
 * These permanently increase stats (Power or Resistance).
 */
export function getIncomePhaseBonuses(nodes, playerId) {
    const bonuses = [];
    
    // Faction Passive: Corporate Megabloc - Vertical Integration
    // If you control 3+ Corporate groups (including this), gain +₿1 at the start of your turn.
    const root = Object.values(nodes).find(n => n.owner === playerId && n.type === 'root');
    if (root) {
        const faction = Object.values(FACTIONS).find(f => f.name === root.name);
        if (faction && faction.id === 'f_corp') {
            const corpCount = Object.values(nodes).filter(n => n.owner === playerId && n.alignments?.includes('Corporate')).length;
            if (corpCount >= 3) {
                root.btc = (root.btc || 0) + 1;
                bonuses.push({ nodeId: root.id, name: "Vertical Integration", icon: "📈", type: "btc", amount: 1, reason: "controlled 3+ Corporate groups" });
            }
        }
    }
    
    Object.values(nodes).forEach(n => {
        if (n.owner !== playerId) return;
        // Wellness Retreat Pyramid Scheme: when you gain income, gain +1 Power
        if (hasPassiveAlias(nodes, n, 'x_wellness') && n.income > 0) {
            n.power = (n.power || 0) + 1;
            bonuses.push({ nodeId: n.id, name: n.name, icon: n.icon || '🧘', type: 'power', amount: 1, reason: 'wellness boost' });
        }
        // Neural Dream Advertising Division: when you gain income, gain +1 Power
        if (hasPassiveAlias(nodes, n, 'x_dreamad') && n.income > 0) {
            n.power = (n.power || 0) + 1;
            bonuses.push({ nodeId: n.id, name: n.name, icon: n.icon || '💭', type: 'power', amount: 1, reason: 'dream ad revenue' });
        }
        // Instant Loan Approval AI: when you gain income, gain +1 Power
        if (hasPassiveAlias(nodes, n, 'x_instloan') && n.income > 0) {
            n.power = (n.power || 0) + 1;
            bonuses.push({ nodeId: n.id, name: n.name, icon: n.icon || '⚡', type: 'power', amount: 1, reason: 'loan processing' });
        }
        // Celebrity Philanthropy Foundation / Elite University Endowment: when you gain income, gain +1 Resistance
        if ((hasPassiveAlias(nodes, n, 'n_charity') || hasPassiveAlias(nodes, n, 'y_endowment')) && n.income > 0) {
            n.resistance = (n.resistance || 0) + 1;
            bonuses.push({ nodeId: n.id, name: n.name, icon: n.icon || '🌟', type: 'resistance', amount: 1, reason: 'philanthropy PR' });
        }
    });
    return bonuses;
}

/**
 * Corporate Loyalty Points Exchange (x_loyaltypts): Treat Income as Power for one Attack per turn.
 * Returns the income-as-power bonus if player owns the card and target has income.
 */
export function getLoyaltyPointsBonus(nodes, playerId) {
    const loyalty = Object.values(nodes).find(n => n.owner === playerId && n.id === 'x_loyaltypts');
    if (!loyalty) return 0;
    return loyalty.income || 0; // Use the loyalty card's own income as extra attack power
}

/**
 * Get the control path from a node up to (and including) the faction root.
 * Returns an array of node IDs: [actingNodeId, parentId, ..., factionRootId].
 * BTC can only be spent from nodes on this path.
 */
export function getControlPath(nodes, nodeId) {
    const path = [];
    let current = nodeId;
    const visited = new Set();
    while (current && !visited.has(current)) {
        visited.add(current);
        const node = nodes[current];
        if (!node) break;
        path.push(current);
        if (node.parentId === null) break; // reached faction root
        current = node.parentId;
    }
    return path;
}

/**
 * Get total BTC available on the control path above (and including) a given node.
 * Per OMNIS rules: BTC can only be spent from the acting group, groups above it,
 * and the faction card. NOT from groups below or on other branches.
 */
export function getControlPathBtc(nodes, nodeId) {
    const path = getControlPath(nodes, nodeId);
    let total = 0;
    for (const nid of path) {
        const node = nodes[nid];
        if (node) total += (node.btc || 0);
    }
    return total;
}

/**
 * Spend BTC from the control path of a given node.
 * Spends from the acting node first, then upward through ancestors to the faction root.
 * Returns true if the full amount was spent.
 */
export function spendControlPathBtc(nodes, nodeId, amount) {
    const path = getControlPath(nodes, nodeId);
    let remaining = amount;
    for (const nid of path) {
        if (remaining <= 0) break;
        const node = nodes[nid];
        if (!node || (node.btc || 0) <= 0) continue;
        const take = Math.min(node.btc || 0, remaining);
        node.btc -= take;
        remaining -= take;
    }
    return remaining <= 0.001;
}

/**
 * Get the distance of a node to its root (Faction card).
 * Faction card has distance 0.
 * A node connected directly to Faction has distance 1.
 */
export function getDistanceToFaction(nodes, nodeId) {
    if (!nodeId) return 0;
    let dist = 0;
    let curr = nodeId;
    while (curr) {
        const node = nodes[curr];
        if (!node) break;
        if (node.parentId === null) {
            break; // Reached the root
        }
        dist++;
        curr = node.parentId;
    }
    return dist;
}

export function getEffectiveResistance(nodes, nodeId, networkBlackout = false) {
    const node = nodes[nodeId];
    if (!node) return 0;
    
    let baseRes = node.resistance;
    let basePow = node.power || 0;
    
    // Apply temporary debuffs from Events
    if (node._tempResDebuff) {
        baseRes = Math.max(1, baseRes - node._tempResDebuff);
    }
    
    // AI Emotion Simulation Lab (x_emotionlab): Swap Power/Resistance if beneficial for defense
    // Check if a connected group (parent or child) is x_emotionlab owned by the same player
    if (!networkBlackout && basePow > baseRes && node.owner) {
        const hasEmotionLab = Object.values(nodes).some(n => 
            n.owner === node.owner && n.id === 'x_emotionlab' && 
            (n.parentId === node.id || node.parentId === n.id)
        );
        if (hasEmotionLab) {
            baseRes = basePow;
        }
    }
    
    return baseRes + getDefenseAbilityModifier(nodes, node, networkBlackout);
}

/**
 * Full Event immunity — node ignores EVERY global event effect targeting it.
 *  - n_space (Billionaire Space Tourists): "Immune to Earth-based Events."
 *  - children of n_diplo (United Nations) owned by the same player.
 */
export function hasEventImmunity(nodes, nodeId) {
    const node = nodes[nodeId];
    if (!node) return false;
    if (node.id === 'n_space') return true;
    if (node.parentId) {
        const parent = nodes[node.parentId];
        if (parent && parent.id === 'n_diplo' && parent.owner === node.owner) return true;
    }
    return false;
}

/**
 * Income-only Event immunity — node's Income cannot be reduced/altered by Events.
 *  - x_taxavoid (AI Tax Minimisation): "Your Income cannot be reduced by Events."
 *  - y_shell (Offshore Shell Network): "Income cannot be reduced by Events."
 *  - Anything with full event immunity is also income-immune.
 */
export function hasEventIncomeImmunity(nodes, nodeId) {
    const node = nodes[nodeId];
    if (!node) return false;
    if (node.id === 'x_taxavoid' || node.id === 'y_shell') return true;
    return hasEventImmunity(nodes, nodeId);
}

// ═══════════════════════════════════════
//  ACTION CARDS (One-Use, played from hand)
// ═══════════════════════════════════════
export const ACTION_CARDS = [
    // ─── 📢 RESISTANCE WARFARE (1–10) ───
    {
        id: 'act_outrage_supernova', name: 'Outrage Supernova', type: 'action', icon: '🌋',
        desc: 'Reduce any group\'s Resistance by 4.',
        flavour: 'It started as a tweet. It ended as a movement.',
        category: 'resistance',
        needsTarget: true,
        filter: (n) => n.type !== 'root',
        image: 'assets/act_outrage_supernova.webp',
        execute: (nodes, playerId, targetId) => {
            const t = nodes[targetId];
            const old = t.resistance;
            t.resistance = Math.max(0, t.resistance - 4);
            return `🌋 Outrage Supernova: ${t.name}'s Resistance was reduced from ${old} to ${t.resistance}.`;
        }
    },
    {
        id: 'act_scandal_machine', name: 'Weaponised Scandal Machine', type: 'action', icon: '🗞️',
        desc: 'Pick any Media, Corporate, or Governmental group: Resistance becomes 0 until end of turn.',
        flavour: 'We found the receipts. We printed more.',
        category: 'resistance',
        needsTarget: true,
        filter: (n) => n.type !== 'root' && n.alignments?.some(a => ['Media', 'Corporate', 'Government'].includes(a)),
        image: 'assets/act_scandal_machine.webp',
        execute: (nodes, playerId, targetId) => {
            const t = nodes[targetId];
            const old = t.resistance;
            t._savedRes = old;
            t.resistance = 0;
            t._restoreResEndOfTurn = true;
            return `🗞️ Weaponised Scandal Machine: ${t.name}'s Resistance was suppressed to 0 until the end of the turn.`;
        }
    },
    {
        id: 'act_algo_mob', name: 'Algorithmic Mob Swarm', type: 'action', icon: '🤖',
        desc: 'Choose a Populist or Cultural group: Resistance –5.',
        flavour: 'Twelve million angry strangers can\'t be wrong.',
        category: 'resistance',
        needsTarget: true,
        filter: (n) => n.type !== 'root' && n.alignments?.some(a => ['Populist', 'Cultural'].includes(a)),
        image: 'assets/act_algo_mob.webp',
        execute: (nodes, playerId, targetId) => {
            const t = nodes[targetId];
            const old = t.resistance;
            t.resistance = Math.max(0, t.resistance - 5);
            return `🤖 Algorithmic Mob Swarm: ${t.name}'s Resistance was reduced from ${old} to ${t.resistance}.`;
        }
    },
    {
        id: 'act_cancel_cascade', name: 'Cancel-Culture Cascade', type: 'action', icon: '🚫',
        desc: 'Pick any group: R–3. If it has Legacy, R–5 instead.',
        flavour: 'History is cancelled for violating the terms of service.',
        category: 'resistance',
        needsTarget: true,
        filter: (n) => n.type !== 'root',
        image: 'assets/act_cancel_cascade.webp',
        execute: (nodes, playerId, targetId) => {
            const t = nodes[targetId];
            const old = t.resistance;
            const reduction = t.alignments?.includes('Legacy') ? 5 : 3;
            t.resistance = Math.max(0, t.resistance - reduction);
            return `🚫 Cancel-Culture Cascade: ${t.name}'s Resistance was reduced from ${old} to ${t.resistance}${reduction === 5 ? ' (including the Legacy penalty)' : ''}.`;
        }
    },
    {
        id: 'act_rivalry_frenzy', name: 'Manufactured Rivalry Frenzy', type: 'action', icon: '⚡',
        desc: 'Pick two connected groups: Both lose 2 Resistance and cannot use passives next turn.',
        flavour: 'We just nudged them a little. The rest was human nature.',
        category: 'resistance',
        needsTarget: 'two_connected',
        filter: (n) => n.type !== 'root',
        image: 'assets/act_rivalry_frenzy.webp',
        execute: (nodes, playerId, targetId, secondTargetId) => {
            const t1 = nodes[targetId], t2 = nodes[secondTargetId];
            const old1 = t1.resistance, old2 = t2.resistance;
            t1.resistance = Math.max(0, t1.resistance - 2);
            t2.resistance = Math.max(0, t2.resistance - 2);
            t1.abilityCancelled = true;
            t2.abilityCancelled = true;
            return `⚡ Manufactured Rivalry Frenzy: Instigated conflict between ${t1.name} and ${t2.name}. Both lost 2 Resistance and had their passive abilities disabled for this round.`;
        }
    },
    {
        id: 'act_crisis_broadcast', name: 'Crisis-of-the-Hour Broadcast', type: 'action', icon: '📡',
        desc: 'All Media groups lose 1 Resistance. All Populist groups lose 2 Resistance.',
        flavour: 'Breaking news: everything is terrible again.',
        category: 'resistance',
        needsTarget: false,
        image: 'assets/act_crisis_broadcast.webp',
        execute: (nodes, playerId) => {
            let affected = 0;
            Object.values(nodes).forEach(n => {
                if (n.type === 'root') return;
                if (n.alignments?.includes('Media')) { n.resistance = Math.max(0, n.resistance - 1); affected++; }
                if (n.alignments?.includes('Populist')) { n.resistance = Math.max(0, n.resistance - 2); affected++; }
            });
            return `📡 Crisis Broadcast: Panic spread across the network, reducing Resistance on ${affected} Media and Populist groups.`;
        }
    },
    {
        id: 'act_deepfake_assassin', name: 'Deepfake Character Assassination', type: 'action', icon: '🎭',
        desc: 'Pick any group: R–4. If it has Media, also lose its passive next turn.',
        flavour: 'We made a video of them saying it. Good enough.',
        category: 'resistance',
        needsTarget: true,
        filter: (n) => n.type !== 'root',
        image: 'assets/act_deepfake_assassin.webp',
        execute: (nodes, playerId, targetId) => {
            const t = nodes[targetId];
            const old = t.resistance;
            t.resistance = Math.max(0, t.resistance - 4);
            let extra = '';
            if (t.alignments?.includes('Media')) { t.abilityCancelled = true; extra = ' Their passive ability was also disabled.'; }
            return `🎭 Deepfake Character Assassination: Released a fabricated scandal targeting ${t.name}. Their Resistance was reduced from ${old} to ${t.resistance}.${extra}`;
        }
    },
    {
        id: 'act_manufactured_panic', name: 'Manufactured Panic', type: 'action', icon: '😱',
        desc: 'All groups with Legacy or Governmental alignment lose 2 Resistance.',
        flavour: 'The public demands action. Any action.',
        category: 'resistance',
        needsTarget: false,
        image: 'assets/act_manufactured_panic.webp',
        execute: (nodes, playerId) => {
            let affected = 0;
            Object.values(nodes).forEach(n => {
                if (n.type === 'root') return;
                if (n.alignments?.some(a => ['Legacy', 'Government'].includes(a))) {
                    n.resistance = Math.max(0, n.resistance - 2);
                    affected++;
                }
            });
            return `😱 Manufactured Panic: Hysteria gripped the establishment, reducing Resistance on ${affected} Legacy and Governmental groups.`;
        }
    },
    {
        id: 'act_meme_meltdown', name: 'Meme-Driven Meltdown', type: 'action', icon: '💥',
        desc: 'Pick any group: R–3. Roll 1d6: on 4–6, Resistance becomes 0 instead.',
        flavour: 'The meme was funny. The consequences were not.',
        category: 'resistance',
        needsTarget: true,
        filter: (n) => n.type !== 'root',
        image: 'assets/act_meme_meltdown.webp',
        execute: (nodes, playerId, targetId) => {
            const t = nodes[targetId];
            const old = t.resistance;
            const roll = Math.floor(Math.random() * 6) + 1;
            if (roll >= 4) {
                t.resistance = 0;
                return `💥 Meme-Driven Meltdown: A viral hit! (Rolled ${roll}). ${t.name} was utterly humiliated, crushing their Resistance from ${old} to 0!`;
            } else {
                t.resistance = Math.max(0, t.resistance - 3);
                return `💥 Meme-Driven Meltdown: A moderate viral spread (Rolled ${roll}). ${t.name}'s Resistance was reduced from ${old} to ${t.resistance}.`;
            }
        }
    },
    {
        id: 'act_culture_flashpoint', name: 'Culture-War Flashpoint', type: 'action', icon: '🔥',
        desc: 'Pick any Cultural group: Resistance becomes 1. You gain +3 Power this turn.',
        flavour: 'We didn\'t start the fire. We just poured petrol on it.',
        category: 'resistance',
        needsTarget: true,
        filter: (n) => n.type !== 'root' && n.alignments?.includes('Cultural'),
        image: 'assets/act_culture_flashpoint.webp',
        execute: (nodes, playerId, targetId) => {
            const t = nodes[targetId];
            const old = t.resistance;
            t.resistance = 1;
            // Grant +3 power to faction root
            const root = Object.values(nodes).find(n => n.owner === playerId && n.type === 'root');
            if (root) root.power = (root.power || 0) + 3;
            return `🔥 Culture-War Flashpoint: Ignited a divisive debate around ${t.name}, stripping their Resistance down to 1. Your Faction gained +3 Power for this turn.`;
        }
    },

    // ─── ⚔️ POWER SURGE ACTIONS (11–18) ───
    {
        id: 'act_hostile_takeover', name: 'Hostile Takeover Blitz', type: 'action', icon: '💼',
        desc: 'Add +8 Power to your next Attack.',
        flavour: 'We prefer acquisitions to negotiations.',
        category: 'power',
        needsTarget: false,
        image: 'assets/act_hostile_takeover.webp',
        execute: (nodes, playerId, targetId, secondTargetId, G) => {
            if (!G._actionBuffs) G._actionBuffs = {};
            if (!G._actionBuffs[playerId]) G._actionBuffs[playerId] = {};
            G._actionBuffs[playerId].nextAttackPower = (G._actionBuffs[playerId].nextAttackPower || 0) + 8;
            return `💼 Hostile Takeover Blitz: Capital mobilised. Your next attack this turn will receive a massive +8 Power bonus.`;
        }
    },
    {
        id: 'act_black_budget', name: 'Black-Budget Overload', type: 'action', icon: '🔒',
        desc: 'Choose any Governmental or Techno-Utopian group: It gains +6 Power this turn.',
        flavour: 'Officially classified. Unofficially terrifying.',
        category: 'power',
        needsTarget: true,
        filter: (n) => n.type !== 'root' && n.alignments?.some(a => ['Government', 'Techno-Utopian'].includes(a)),
        image: 'assets/act_black_budget.webp',
        execute: (nodes, playerId, targetId) => {
            const t = nodes[targetId];
            t.power = (t.power || 0) + 6;
            t._tempPowerBuff = (t._tempPowerBuff || 0) + 6;
            return `🔒 Black-Budget Overload: Funnelled untraceable funds into ${t.name}, granting them +6 Power for this turn.`;
        }
    },
    {
        id: 'act_viral_frenzy', name: 'Viral Frenzy Surge', type: 'action', icon: '📈',
        desc: 'If attacking a Media group: +7 Power. Otherwise: +3 Power.',
        flavour: 'The algorithm has chosen violence.',
        category: 'power',
        needsTarget: false,
        image: 'assets/act_viral_frenzy.webp',
        execute: (nodes, playerId, targetId, secondTargetId, G) => {
            if (!G._actionBuffs) G._actionBuffs = {};
            if (!G._actionBuffs[playerId]) G._actionBuffs[playerId] = {};
            G._actionBuffs[playerId].viralFrenzy = true;
            return `📈 Viral Frenzy Surge: The algorithm is weaponised! Your next attack gains +7 Power if targeting a Media group, or +3 Power otherwise.`;
        }
    },
    {
        id: 'act_nostalgia_bomb', name: 'Nostalgia Bomb', type: 'action', icon: '📼',
        desc: 'Add +5 Power when attacking a Legacy or Cultural group.',
        flavour: 'Remember when things made sense? Neither do we.',
        category: 'power',
        needsTarget: false,
        image: 'assets/act_nostalgia_bomb.webp',
        execute: (nodes, playerId, targetId, secondTargetId, G) => {
            if (!G._actionBuffs) G._actionBuffs = {};
            if (!G._actionBuffs[playerId]) G._actionBuffs[playerId] = {};
            G._actionBuffs[playerId].nostalgiaBomb = true;
            return `📼 Nostalgia Bomb: Rose-tinted memories deployed. Your next attack gains +5 Power if targeting a Legacy or Cultural group.`;
        }
    },
    {
        id: 'act_flash_mob', name: 'Flash-Mob Siege', type: 'action', icon: '✊',
        desc: 'Pick any Populist group: It gains +6 Power this turn.',
        flavour: 'Democracy is loudest when uninvited.',
        category: 'power',
        needsTarget: true,
        filter: (n) => n.type !== 'root' && n.alignments?.includes('Populist'),
        image: 'assets/act_flash_mob.webp',
        execute: (nodes, playerId, targetId) => {
            const t = nodes[targetId];
            t.power = (t.power || 0) + 6;
            t._tempPowerBuff = (t._tempPowerBuff || 0) + 6;
            return `✊ Flash-Mob Siege: Rapidly orchestrated a massive crowd, boosting ${t.name}'s Power by +6 for this turn.`;
        }
    },
    {
        id: 'act_quantum_spike', name: 'Quantum Probability Spike', type: 'action', icon: '🎲',
        desc: 'Roll a die: 1–2: +3 Power, 3–4: +6 Power, 5–6: +10 Power.',
        flavour: 'The universe briefly agrees with you.',
        category: 'power',
        needsTarget: false,
        image: 'assets/act_quantum_spike.webp',
        execute: (nodes, playerId, targetId, secondTargetId, G) => {
            const roll = Math.floor(Math.random() * 6) + 1;
            let bonus = roll <= 2 ? 3 : roll <= 4 ? 6 : 10;
            if (!G._actionBuffs) G._actionBuffs = {};
            if (!G._actionBuffs[playerId]) G._actionBuffs[playerId] = {};
            G._actionBuffs[playerId].nextAttackPower = (G._actionBuffs[playerId].nextAttackPower || 0) + bonus;
            return `🎲 Quantum Probability Spike: Favorable timeline secured (Rolled ${roll}). Your next attack gains +${bonus} Power!`;
        }
    },
    {
        id: 'act_weapon_virality', name: 'Weaponised Virality', type: 'action', icon: '🦠',
        desc: 'Pick any group: It gains +4 Power and –2 Resistance.',
        flavour: 'Going viral is a double-edged sword.',
        category: 'power',
        needsTarget: true,
        filter: (n) => n.type !== 'root',
        image: 'assets/act_weapon_virality.webp',
        execute: (nodes, playerId, targetId) => {
            const t = nodes[targetId];
            t.power = (t.power || 0) + 4;
            t.resistance = Math.max(0, t.resistance - 2);
            return `🦠 Weaponised Virality: Thrust ${t.name} into the relentless spotlight. They gained +4 Power but lost 2 Resistance in the exposure.`;
        }
    },
    {
        id: 'act_influence_surge', name: 'Coordinated Influence Surge', type: 'action', icon: '🌊',
        desc: 'All your connected groups gain +2 Power this turn.',
        flavour: 'A rising tide lifts all conspiracies.',
        category: 'power',
        needsTarget: false,
        image: 'assets/act_influence_surge.webp',
        execute: (nodes, playerId) => {
            let count = 0;
            Object.values(nodes).forEach(n => {
                if (n.owner === playerId) {
                    n.power = (n.power || 0) + 2;
                    n._tempPowerBuff = (n._tempPowerBuff || 0) + 2;
                    count++;
                }
            });
            return `🌊 Coordinated Influence Surge: Network synchronised! All ${count} of your controlled groups gained +2 Power for this turn.`;
        }
    },

    // ─── 💰 ECONOMIC WARFARE (19–24) ───
    {
        id: 'act_creative_accounting', name: 'Creative Accounting Black-Ops', type: 'action', icon: '🧮',
        desc: 'Convert up to 5 Income → equal Power this turn.',
        flavour: 'We moved some numbers. Don\'t worry about it.',
        category: 'economic',
        needsTarget: false,
        image: 'assets/act_creative_accounting.webp',
        execute: (nodes, playerId) => {
            let converted = 0;
            const owned = Object.values(nodes).filter(n => n.owner === playerId && n.income > 0);
            owned.sort((a, b) => b.income - a.income);
            let remaining = 5;
            for (const n of owned) {
                if (remaining <= 0) break;
                const take = Math.min(n.income, remaining);
                n.power = (n.power || 0) + take;
                n._tempPowerBuff = (n._tempPowerBuff || 0) + take;
                converted += take;
                remaining -= take;
            }
            return `🧮 Creative Accounting Black-Ops: Shifted funds through shell accounts, converting ₿${converted} of passive Income into +${converted} Power across your network.`;
        }
    },
    {
        id: 'act_market_implosion', name: 'Market Implosion Event', type: 'action', icon: '📉',
        desc: 'All opponents lose 2 Income. You gain +2 Income for each opponent affected.',
        flavour: 'The invisible hand just punched everyone else.',
        category: 'economic',
        needsTarget: false,
        image: 'assets/act_market_implosion.webp',
        execute: (nodes, playerId) => {
            let affectedCount = 0;
            const opponents = new Set();
            Object.values(nodes).forEach(n => {
                if (n.owner && n.owner !== playerId && n.type !== 'root' && n.income > 0) {
                    opponents.add(n.owner);
                    n.income = Math.max(0, n.income - 2);
                }
            });
            affectedCount = opponents.size;
            const root = Object.values(nodes).find(n => n.owner === playerId && n.type === 'root');
            if (root) root.income = (root.income || 0) + affectedCount * 2;
            return `📉 Market Implosion Event: Triggered a localized crash. Stripped Income from ${affectedCount} rival players, while your Faction absorbed ₿${affectedCount * 2} in short-selling profits!`;
        }
    },
    {
        id: 'act_token_airdrop', name: 'Token Airdrop Frenzy', type: 'action', icon: '🪂',
        desc: 'Gain +6 Income. If you control a Techno-Utopian group, gain +2 more.',
        flavour: 'Free money! Totally not a trap.',
        category: 'economic',
        needsTarget: false,
        image: 'assets/act_token_airdrop.webp',
        execute: (nodes, playerId) => {
            let bonus = 6;
            const hasTech = Object.values(nodes).some(n => n.owner === playerId && n.alignments?.includes('Techno-Utopian'));
            if (hasTech) bonus += 2;
            const root = Object.values(nodes).find(n => n.owner === playerId && n.type === 'root');
            if (root) root.btc = (root.btc || 0) + bonus;
            return `🪂 Token Airdrop Frenzy: Manufactured artificial hype! Your Faction vault immediately gained ₿${bonus}${hasTech ? ' (including a +₿2 Techno-Utopian synergy bonus)' : ''}.`;
        }
    },
    {
        id: 'act_surge_pricing', name: 'Surge Pricing Apocalypse', type: 'action', icon: '💲',
        desc: 'Pick any group: Its Income becomes 7 this turn.',
        flavour: 'Demand is high. Morals are low.',
        category: 'economic',
        needsTarget: true,
        filter: (n) => n.type !== 'root',
        image: 'assets/act_surge_pricing.webp',
        execute: (nodes, playerId, targetId) => {
            const t = nodes[targetId];
            const old = t.income;
            t._savedIncome = old;
            t.income = 7;
            t._restoreIncomeEndOfTurn = true;
            return `💲 Surge Pricing Apocalypse: Manipulated supply algorithms for ${t.name}, temporarily inflating their Income from ₿${old} to a massive ₿7 for this turn.`;
        }
    },
    {
        id: 'act_ransomware', name: 'Ransomware Jackpot', type: 'action', icon: '💻',
        desc: 'Pick any opponent group: Steal ₿3 from its owner. If they can\'t pay, disable its passive.',
        flavour: 'Pay up or your files get very, very public.',
        category: 'economic',
        needsTarget: true,
        filter: (n) => n.type !== 'root' && n.owner,
        image: 'assets/act_ransomware.webp',
        execute: (nodes, playerId, targetId) => {
            const t = nodes[targetId];
            if (!t.owner || t.owner === playerId) return 'Invalid target.';
            let stolen = 0;
            const ownerNodes = Object.values(nodes).filter(n => n.owner === t.owner && (n.btc || 0) > 0).sort((a,b) => (b.btc||0)-(a.btc||0));
            let rem = 3;
            for (const n of ownerNodes) {
                if (rem <= 0) break;
                const take = Math.min(n.btc || 0, rem);
                n.btc -= take; rem -= take; stolen += take;
            }
            const myRoot = Object.values(nodes).find(n => n.owner === playerId && n.type === 'root');
            if (myRoot) myRoot.btc = (myRoot.btc || 0) + stolen;
            if (stolen < 3) { t.abilityCancelled = true; }
            return `💻 Ransomware Jackpot: Breached ${t.name}'s systems! Siphoned ₿${stolen} directly into your Faction vault.${stolen < 3 ? ' They couldn\'t pay the full ransom, so their passive ability was disabled.' : ''}`;
        }
    },
    {
        id: 'act_pump_dump', name: 'Crypto Pump-and-Dump', type: 'action', icon: '📊',
        desc: 'Pick any group: Income becomes 6 next turn, then R–3.',
        flavour: 'The chart went vertical. Then it went very vertical.',
        category: 'economic',
        needsTarget: true,
        filter: (n) => n.type !== 'root',
        image: 'assets/act_pump_dump.webp',
        execute: (nodes, playerId, targetId) => {
            const t = nodes[targetId];
            const oldInc = t.income, oldRes = t.resistance;
            t.income = 6;
            t.resistance = Math.max(0, t.resistance - 3);
            return `📊 Crypto Pump-and-Dump: Orchestrated a market bubble on ${t.name}. Their Income spiked to ₿6, but the resulting crash shattered their Resistance from ${oldRes} to ${t.resistance}.`;
        }
    },

    // ─── 🃏 SPECIAL & HYBRID ACTIONS (25–30) ───
    {
        id: 'act_narrative_rewrite', name: 'Narrative Rewrite Protocol', type: 'action', icon: '✏️',
        desc: 'Swap Power and Resistance of ANY group for the rest of the turn.',
        flavour: 'Reality is a draft. We\'re just editing.',
        category: 'special',
        needsTarget: true,
        filter: (n) => n.type !== 'root',
        image: 'assets/act_narrative_rewrite.webp',
        execute: (nodes, playerId, targetId) => {
            const t = nodes[targetId];
            const oldP = t.power, oldR = t.resistance;
            t.power = oldR;
            t.resistance = oldP;
            t._swappedStats = true;
            return `✏️ Narrative Rewrite Protocol: Deployed aggressive gaslighting on ${t.name}. Their stats have been inverted for the turn: Power is now ${t.power} and Resistance is ${t.resistance}.`;
        }
    },
    {
        id: 'act_deepfake_theft', name: 'Deepfake Identity Theft', type: 'action', icon: '🎪',
        desc: 'Copy any group\'s passive for the rest of the turn (applied to your faction root).',
        flavour: 'Authenticity is optional.',
        category: 'special',
        needsTarget: true,
        filter: (n) => n.type !== 'root',
        image: 'assets/act_deepfake_theft.webp',
        execute: (nodes, playerId, targetId) => {
            const t = nodes[targetId];
            const root = Object.values(nodes).find(n => n.owner === playerId && n.type === 'root');
            if (root && t.id) {
                root._copiedPassiveFrom = t.id;
            }
            return `🎪 Deepfake Identity Theft: Cloned ${t.name}'s signature operations. Your Faction successfully copied their passive ability for the rest of the turn.`;
        }
    },
    {
        id: 'act_regulatory_kabuki', name: 'Regulatory Kabuki Theatre', type: 'action', icon: '🏛️',
        desc: 'Pick any Corporate or Financial group: Resistance becomes 6 this turn.',
        flavour: 'We held a hearing. Nothing changed.',
        category: 'special',
        needsTarget: true,
        filter: (n) => n.type !== 'root' && n.alignments?.some(a => ['Corporate', 'Financial'].includes(a)),
        image: 'assets/act_regulatory_kabuki.webp',
        execute: (nodes, playerId, targetId) => {
            const t = nodes[targetId];
            const old = t.resistance;
            t._savedRes = old;
            t.resistance = 6;
            t._restoreResEndOfTurn = true;
            return `🏛️ Regulatory Kabuki Theatre: Called a high-profile, meaningless hearing for ${t.name}, temporarily overriding their Resistance to 6 until the end of the turn.`;
        }
    },
    {
        id: 'act_manufactured_consensus', name: 'Manufactured Consensus', type: 'action', icon: '🗳️',
        desc: 'Pick any group: Resistance becomes 1 until end of turn. You gain +2 Power.',
        flavour: 'Everyone agrees. Or else.',
        category: 'special',
        needsTarget: true,
        filter: (n) => n.type !== 'root',
        image: 'assets/act_manufactured_consensus.webp',
        execute: (nodes, playerId, targetId) => {
            const t = nodes[targetId];
            const old = t.resistance;
            t._savedRes = old;
            t.resistance = 1;
            t._restoreResEndOfTurn = true;
            const root = Object.values(nodes).find(n => n.owner === playerId && n.type === 'root');
            if (root) { root.power = (root.power || 0) + 2; root._tempPowerBuff = (root._tempPowerBuff || 0) + 2; }
            return `🗳️ Manufactured Consensus: Flooded the zone with bot-driven agreement. ${t.name}'s Resistance collapsed to 1 for the turn, and your Faction gained +2 Power.`;
        }
    },
    {
        id: 'act_meme_distortion', name: 'Meme-Driven Reality Distortion', type: 'action', icon: '🌀',
        desc: 'Pick any group: +3 Power, –3 Resistance, and cannot use its passive next turn.',
        flavour: 'The meme was funny. The fallout was catastrophic.',
        category: 'special',
        needsTarget: true,
        filter: (n) => n.type !== 'root',
        image: 'assets/act_meme_distortion.webp',
        execute: (nodes, playerId, targetId) => {
            const t = nodes[targetId];
            t.power = (t.power || 0) + 3;
            const oldR = t.resistance;
            t.resistance = Math.max(0, t.resistance - 3);
            t.abilityCancelled = true;
            return `🌀 Reality Distortion: Engulfed ${t.name} in a chaotic viral narrative. They gained +3 Power, but lost 3 Resistance and had their passive ability disabled.`;
        }
    },
    {
        id: 'act_deck_rigging', name: 'Algorithmic Deck-Rigging', type: 'action', icon: '🃏',
        desc: 'Look at the top 5 cards of the central deck. Reorder them however you like.',
        flavour: 'We\'re not cheating. We\'re optimising.',
        category: 'special',
        needsTarget: 'deck_peek',
        image: 'assets/act_deck_rigging.webp',
        execute: (nodes, playerId, targetId, secondTargetId, G) => {
            // The actual reordering is handled by the UI modal
            return `🃏 Algorithmic Deck-Rigging: Successfully penetrated the network architecture and manipulated the top 5 cards of the central deck.`;
        }
    }
];

// ═══════════════════════════════════════
//  EVENT CARDS
// ═══════════════════════════════════════
export const EVENT_DECK = [
    {
        id: 'ev_market_crash', name: 'Market Crash', type: 'event', icon: '💥',
        desc: 'All Financial groups instantly drop to 0 BTC stored and cannot attack this round.',
        image: 'assets/ev_market_crash-2.webp',
        effect: (G) => {
            const msgs = [];
            Object.values(G.nodes).forEach(n => {
                if (n.alignments?.includes('Financial') && n.owner && n.type !== 'root') {
                    const lost = n.btc || 0;
                    n.btc = 0;
                    n._cannotAttackThisRound = true;
                    msgs.push(`${n.name} (₿${lost} lost)`);
                }
            });
            return msgs.length > 0 ? `💥 Market Crash! ${msgs.join(', ')}.` : '💥 Market Crash — no Financial groups affected.';
        }
    },
    {
        id: 'ev_data_breach', name: 'Data Breach', type: 'event', icon: '🕵️',
        desc: 'All Techno‑Utopian groups have their Resistance set to 1 for this entire round. Media groups gain +₿2.',
        image: 'assets/ev_data_breach.webp',
        effect: (G) => {
            const msgs = [];
            Object.values(G.nodes).forEach(n => {
                if (n.alignments?.includes('Techno-Utopian') && n.type !== 'root') {
                    n._savedRes = n.resistance;
                    n.resistance = 1;
                    n._restoreResEndOfRound = true;
                    msgs.push(`${n.name} exposed`);
                }
                if (n.alignments?.includes('Media') && n.owner && n.type !== 'root') {
                    n.btc = (n.btc || 0) + 2;
                }
            });
            return msgs.length > 0 ? `🕵️ Data Breach! ${msgs.join(', ')}. Media profits.` : '🕵️ Data Breach — minimal impact.';
        }
    },
    {
        id: 'ev_scandal', name: 'Political Scandal', type: 'event', icon: '🏛️',
        desc: 'A random Government group becomes uncontrolled. All Government groups lose their outgoing links until end of round.',
        image: 'assets/ev_political_scandal.webp',
        effect: (G) => {
            const govNodes = Object.values(G.nodes).filter(n =>
                n.alignments?.includes('Government') && n.owner && n.type !== 'root'
            );
            
            Object.values(G.nodes).forEach(n => {
                if (n.alignments?.includes('Government') && n.type !== 'root') {
                    n._cannotSupportAttacksThisRound = true;
                }
            });

            if (govNodes.length === 0) return '🏛️ Political Scandal — Government weakened, but none toppled.';
            
            const target = govNodes[Math.floor(Math.random() * govNodes.length)];
            const prevOwner = target.owner;
            const descs = [];
            Object.values(G.nodes).forEach(n => {
                if (n.parentId === target.id) {
                    n.owner = null; n.parentId = null; n.parentPortSide = null; n.rotationSteps = n.rotationSteps || 0; n.btc = 0;
                    descs.push(n.name);
                }
            });
            target.owner = null; target.parentId = null; target.parentPortSide = null; target.rotationSteps = target.rotationSteps || 0; target.btc = 0;
            return `🏛️ Political Scandal! ${target.name} toppled from ${G.players[prevOwner]?.name || 'unknown'}!${descs.length > 0 ? ' ' + descs.length + ' orphaned.' : ''} Government links disabled.`;
        }
    },
    {
        id: 'ev_boom', name: 'Economic Boom', type: 'event', icon: '📈',
        desc: 'All players gain +₿3. Corporate groups gain +₿2. All Income values are doubled this round.',
        image: 'assets/ev_boom.webp',
        effect: (G) => {
            Object.values(G.players).forEach(p => {
                const root = G.nodes[p.rootNodeId];
                if (root) root.btc = (root.btc || 0) + 3;
            });
            Object.values(G.nodes).forEach(n => {
                if (n.alignments?.includes('Corporate') && n.owner && n.type !== 'root') {
                    n.btc = (n.btc || 0) + 2;
                }
                if (n.income > 0) {
                    n._savedIncome = n.income;
                    n.income *= 2;
                    n._restoreIncomeEndOfRound = true;
                }
            });
            return '📈 Economic Boom! All factions gain ₿3. Corporate gains ₿2. Income DOUBLED.';
        }
    },
    {
        id: 'ev_whistleblower', name: 'Whistleblower', type: 'event', icon: '💣',
        desc: 'The player with the most groups loses ₿5 and must reveal their entire hand. The player with the fewest groups gains ₿5.',
        image: 'assets/ev_whistleblower-2.webp',
        effect: (G) => {
            let most = null, mostCount = -1, least = null, leastCount = 999;
            G.playerOrder.forEach(pid => {
                const count = Object.values(G.nodes).filter(n => n.owner === pid && n.type !== 'root').length;
                if (count > mostCount) { mostCount = count; most = pid; }
                if (count < leastCount) { leastCount = count; least = pid; }
            });
            
            let mostRevealed = false;
            if (most) {
                let rem = 5;
                Object.values(G.nodes).filter(n => n.owner === most && (n.btc||0) > 0).sort((a,b) => (b.btc||0)-(a.btc||0)).forEach(n => {
                    if (rem <= 0) return;
                    const take = Math.min(n.btc||0, rem); n.btc -= take; rem -= take;
                });
                
                // Set flag to reveal hand
                const pMost = G.players[most];
                if (pMost && pMost.hand && pMost.hand.length > 0) {
                    pMost._handRevealed = true;
                    mostRevealed = true;
                }
            }
            if (least) {
                const root = G.nodes[G.players[least]?.rootNodeId];
                if (root) root.btc = (root.btc || 0) + 5;
            }
            return `💣 Whistleblower! ${G.players[most]?.name || '?'} loses ₿5${mostRevealed ? ' and HAND REVEALED' : ''}. ${G.players[least]?.name || '?'} gains ₿5.`;
        }
    },
    {
        id: 'ev_cyber_attack', name: 'Cyber Attack', type: 'event', icon: '🖥️',
        desc: 'All groups with Income ≥ 4 cannot transfer BTC or use abilities this round.',
        image: 'assets/ev_cyber_attack-2.webp',
        effect: (G) => {
            let count = 0;
            Object.values(G.nodes).forEach(n => {
                if (n.income >= 4 && n.type !== 'root') {
                    n._cannotTransferThisRound = true;
                    n.abilityCancelled = true;
                    count++;
                }
            });
            return count > 0 ? `🖥️ Cyber Attack! ${count} high-income groups disabled.` : '🖥️ Cyber Attack — no high-income targets.';
        }
    },
    {
        id: 'ev_network_blackout', name: 'Network Blackout', type: 'event', icon: '🧬',
        desc: 'All adjacency bonuses are disabled this round. Groups act as if they have no outgoing links.',
        image: 'assets/ev_network_blackout.webp',
        effect: (G) => {
            G._networkBlackout = true;
            return '🧬 Network Blackout! All adjacency bonuses disabled this round.';
        }
    },
    {
        id: 'ev_satellite_failure', name: 'Satellite Failure', type: 'event', icon: '🛰️',
        desc: 'All Techno‑Utopian groups lose their outgoing links. They cannot support attacks this round.',
        image: 'assets/ev_satellite_failure.webp',
        effect: (G) => {
            let count = 0;
            Object.values(G.nodes).forEach(n => {
                if (n.alignments?.includes('Techno-Utopian') && n.type !== 'root') {
                    n._cannotSupportAttacksThisRound = true;
                    count++;
                }
            });
            return count > 0 ? `🛰️ Satellite Failure! ${count} Techno-Utopian groups blinded.` : '🛰️ Satellite Failure — no Techno-Utopian targets.';
        }
    },
    {
        id: 'ev_conspiracy_surge', name: 'Conspiracy Surge', type: 'event', icon: '🧿',
        desc: 'All Weird groups gain +2 Resistance and +₿2. All Media groups lose 1 Resistance.',
        image: 'assets/ev_conspiracy_surge.webp',
        effect: (G) => {
            let wCount = 0, mCount = 0;
            Object.values(G.nodes).forEach(n => {
                if (n.alignments?.includes('Weird') && n.type !== 'root') {
                    n.resistance = (n.resistance || 0) + 2;
                    n._tempResBuff = (n._tempResBuff || 0) + 2;
                    if (n.owner) n.btc = (n.btc || 0) + 2;
                    wCount++;
                }
                if (n.alignments?.includes('Media') && n.type !== 'root') {
                    n.resistance = Math.max(0, (n.resistance || 0) - 1);
                    mCount++;
                }
            });
            return `🧿 Conspiracy Surge! ${wCount} Weird groups buffed. ${mCount} Media groups weakened.`;
        }
    },
    {
        id: 'ev_supply_collapse', name: 'Supply Chain Collapse', type: 'event', icon: '🧩',
        desc: 'Corporate groups cannot transfer BTC or support attacks this round.',
        image: 'assets/ev_supply_collapse.webp',
        effect: (G) => {
            let count = 0;
            Object.values(G.nodes).forEach(n => {
                if (n.alignments?.includes('Corporate') && n.type !== 'root') {
                    n._cannotTransferThisRound = true;
                    n._cannotSupportAttacksThisRound = true;
                    count++;
                }
            });
            return count > 0 ? `🧩 Supply Chain Collapse! ${count} Corporate groups bottlenecked.` : '🧩 Supply Chain Collapse — no Corporate targets.';
        }
    },
    {
        id: 'ev_celeb_scandal', name: 'Celebrity Scandal', type: 'event', icon: '🎭',
        desc: 'The highest‑Power Media or Cultural group on the board loses 3 Resistance.',
        image: 'assets/ev_celeb_scandal.webp',
        effect: (G) => {
            let target = null;
            let maxPow = -1;
            Object.values(G.nodes).forEach(n => {
                if (n.type !== 'root' && n.alignments?.some(a => ['Media', 'Cultural'].includes(a))) {
                    if ((n.power || 0) > maxPow) {
                        maxPow = n.power || 0;
                        target = n;
                    }
                }
            });
            if (target) {
                target.resistance = Math.max(0, target.resistance - 3);
                return `🎭 Celebrity Scandal! ${target.name} takes the fall, loses 3 Resistance.`;
            }
            return '🎭 Celebrity Scandal — nobody famous enough to care.';
        }
    },
    {
        id: 'ev_breakthrough', name: 'Experimental Breakthrough', type: 'event', icon: '🧪',
        desc: 'A random Academic group becomes “Enhanced”: +3 Power, +1 Income, +1 Resistance for this round only.',
        image: 'assets/ev_breakthrough.webp',
        effect: (G) => {
            const academics = Object.values(G.nodes).filter(n => n.alignments?.includes('Academic') && n.type !== 'root');
            if (academics.length === 0) return '🧪 Experimental Breakthrough — no Academics funded.';
            
            const target = academics[Math.floor(Math.random() * academics.length)];
            
            target._savedPow = target.power;
            target.power = (target.power || 0) + 3;
            target._restorePowEndOfRound = true;
            
            target._savedInc = target.income;
            target.income = (target.income || 0) + 1;
            target._restoreIncEndOfRound = true;
            
            target._savedRes2 = target.resistance;
            target.resistance = (target.resistance || 0) + 1;
            target._restoreRes2EndOfRound = true;
            
            return `🧪 Experimental Breakthrough! ${target.name} massively enhanced this round.`;
        }
    },
    {
        id: 'ev_wellness_craze', name: 'Wellness Craze', type: 'event', icon: '🧘',
        desc: 'All Cultural groups gain +₿2. All Techno‑Utopian groups lose 1 Power and 1 Resistance.',
        image: 'assets/ev_wellness_craze.webp',
        effect: (G) => {
            let cCount = 0, tCount = 0;
            Object.values(G.nodes).forEach(n => {
                if (n.alignments?.includes('Cultural') && n.owner && n.type !== 'root') {
                    n.btc = (n.btc || 0) + 2;
                    cCount++;
                }
                if (n.alignments?.includes('Techno-Utopian') && n.type !== 'root') {
                    n.power = Math.max(0, (n.power || 0) - 1);
                    n.resistance = Math.max(0, (n.resistance || 0) - 1);
                    tCount++;
                }
            });
            return `🧘 Wellness Craze! ${cCount} Cultural groups profit. ${tCount} Tech groups weakened.`;
        }
    },
    {
        id: 'ev_black_budget_leak', name: 'Black Budget Leak', type: 'event', icon: '🕳️',
        desc: 'All Government groups lose ₿3. All Criminal groups gain ₿2.',
        image: 'assets/ev_black_budget_leak.webp',
        effect: (G) => {
            let gCount = 0, cCount = 0;
            Object.values(G.nodes).forEach(n => {
                if (n.alignments?.includes('Government') && n.owner && n.type !== 'root') {
                    n.btc = Math.max(0, (n.btc || 0) - 3);
                    gCount++;
                }
                if (n.alignments?.includes('Criminal') && n.owner && n.type !== 'root') {
                    n.btc = (n.btc || 0) + 2;
                    cCount++;
                }
            });
            return `🕳️ Black Budget Leak! ${gCount} Government groups bled. ${cCount} Criminal syndicates profit.`;
        }
    },
    {
        id: 'ev_pr_meltdown', name: 'PR Meltdown', type: 'event', icon: '🧯',
        desc: 'The group with the highest Power on the board becomes “Scandalised”: It cannot attack or defend this round.',
        image: 'assets/ev_pr_meltdown.webp',
        effect: (G) => {
            let target = null;
            let maxPow = -1;
            Object.values(G.nodes).forEach(n => {
                if (n.type !== 'root') {
                    if ((n.power || 0) > maxPow) {
                        maxPow = n.power || 0;
                        target = n;
                    }
                }
            });
            if (target) {
                target._cannotAttackThisRound = true;
                target._cannotDefendThisRound = true;
                return `🧯 PR Meltdown! ${target.name} (Power ${maxPow}) Scandalised — completely sidelined this round.`;
            }
            return '🧯 PR Meltdown — no valid targets.';
        }
    },
    {
        id: 'ev_outrage_wave', name: 'Global Outrage Wave', type: 'event', icon: '🧨',
        desc: 'Populist groups gain +3 Power this round. Corporate groups lose 2 Resistance.',
        image: 'assets/ev_outrage_wave.webp',
        effect: (G) => {
            let pCount = 0, cCount = 0;
            Object.values(G.nodes).forEach(n => {
                if (n.alignments?.includes('Populist') && n.type !== 'root') {
                    n.power = (n.power || 0) + 3;
                    n._tempPowerBuff = (n._tempPowerBuff || 0) + 3;
                    pCount++;
                }
                if (n.alignments?.includes('Corporate') && n.type !== 'root') {
                    n.resistance = Math.max(0, (n.resistance || 0) - 2);
                    cCount++;
                }
            });
            return `🧨 Outrage Wave! ${pCount} Populist groups enraged. ${cCount} Corporate groups destabilised.`;
        }
    },
    {
        id: 'ev_cog_overload', name: 'Cognitive Overload', type: 'event', icon: '🧠',
        desc: 'Players cannot play Action cards this round.',
        image: 'assets/ev_cog_overload.webp',
        effect: (G) => {
            G._cannotPlayActionCardsThisRound = true;
            return '🧠 Cognitive Overload! Action cards disabled for all players this round.';
        }
    },
    {
        id: 'ev_viral_thread', name: 'Viral Thread', type: 'event', icon: '🧵',
        desc: 'The first Media group to attack this round gets +5 Power. All other Media groups get –1 Resistance.',
        image: 'assets/ev_viral_thread.webp',
        effect: (G) => {
            G._viralThreadActive = true;
            let mCount = 0;
            Object.values(G.nodes).forEach(n => {
                if (n.alignments?.includes('Media') && n.type !== 'root') {
                    n.resistance = Math.max(0, (n.resistance || 0) - 1);
                    mCount++;
                }
            });
            return `🧵 Viral Thread! ${mCount} Media groups weakened. First Media attacker will gain +5 Power.`;
        }
    },
    {
        id: 'ev_flash_arbitrage', name: 'Flash Market Arbitrage', type: 'event', icon: '🧮',
        desc: 'All BTC on the board is instantly redistributed: Each group keeps 1 BTC; the rest is pooled and split evenly among all players.',
        image: 'assets/ev_flash_arbitrage.webp',
        effect: (G) => {
            let pool = 0;
            Object.values(G.nodes).forEach(n => {
                if (n.owner && (n.btc || 0) > 1) {
                    pool += (n.btc - 1);
                    n.btc = 1;
                }
            });
            if (pool > 0) {
                const perPlayer = Math.floor(pool / G.playerOrder.length);
                G.playerOrder.forEach(pid => {
                    const root = G.nodes[G.players[pid]?.rootNodeId];
                    if (root) root.btc = (root.btc || 0) + perPlayer;
                });
                return `🧮 Flash Arbitrage! ₿${pool} swept and redistributed (₿${perPlayer} each). All groups reset to ₿1.`;
            }
            return '🧮 Flash Arbitrage — markets too dry, no BTC to redistribute.';
        }
    },
    {
        id: 'ev_ceasefire', name: 'Ceasefire Protocol', type: 'event', icon: '🛑',
        desc: 'Players cannot attack other players’ networks this round. Neutral groups can still be attacked.',
        image: 'assets/ev_ceasefire.webp',
        effect: (G) => {
            G._ceasefireActive = true;
            return '🛑 Ceasefire Protocol Enforced! Player-vs-player attacks banned this round.';
        }
    },
    {
        id: 'ev_freeze_order', name: 'Freeze Order', type: 'event', icon: '🧊',
        desc: 'All groups with Power ≥ 4 cannot attack, defend, or use abilities this round.',
        image: 'assets/ev_freeze_order.webp',
        effect: (G) => {
            let count = 0;
            Object.values(G.nodes).forEach(n => {
                if ((n.power || 0) >= 4 && n.type !== 'root') {
                    n._cannotAttackThisRound = true;
                    n._cannotDefendThisRound = true;
                    n.abilityCancelled = true;
                    count++;
                }
            });
            return count > 0 ? `🧊 Freeze Order! ${count} high-power groups completely locked down.` : '🧊 Freeze Order — no high-power targets.';
        }
    },
    {
        id: 'ev_shadow_veil', name: 'Shadow Veil', type: 'event', icon: '🕳️',
        desc: 'All attacks this round are hidden: Players do not see who is attacking whom until resolution.',
        image: 'assets/ev_shadow_veil.webp',
        effect: (G) => {
            G._shadowVeilActive = true;
            return '🕳️ Shadow Veil descended. Attacks are hidden this round.';
        }
    },
    {
        id: 'ev_hostile_moratorium', name: 'Hostile Takeover Moratorium', type: 'event', icon: '🧨',
        desc: 'Players cannot take control of groups this round — only destroy them.',
        image: 'assets/ev_hostile_moratorium.webp',
        effect: (G) => {
            G._hostileMoratoriumActive = true;
            return '🧨 Moratorium! You cannot CONTROL groups this round — only DESTROY.';
        }
    },
    {
        id: 'ev_influence_storm', name: 'Influence Storm', type: 'event', icon: '🌀',
        desc: 'All Power values are doubled this round.',
        image: 'assets/ev_influence_storm.webp',
        effect: (G) => {
            Object.values(G.nodes).forEach(n => {
                if (n.power > 0 && n.type !== 'root') {
                    n._savedPow2 = n.power;
                    n.power *= 2;
                    n._restorePow2EndOfRound = true;
                }
            });
            return '🌀 Influence Storm! ALL Power values DOUBLED this round.';
        }
    },
    {
        id: 'ev_firewall', name: 'Firewall Protocol', type: 'event', icon: '🧱',
        desc: 'Techno‑Utopian groups cannot be targeted by attacks this round. All other groups are unaffected.',
        image: 'assets/ev_firewall.webp',
        effect: (G) => {
            let count = 0;
            Object.values(G.nodes).forEach(n => {
                if (n.alignments?.includes('Techno-Utopian') && n.type !== 'root') {
                    n._untargetableThisRound = true;
                    count++;
                }
            });
            return `🧱 Firewall Protocol! ${count} Techno-Utopian groups are immune to attacks this round.`;
        }
    },
    {
        id: 'ev_riot_season', name: 'Riot Season', type: 'event', icon: '🧨',
        desc: 'Populist and Cultural groups can attack twice this round. Corporate groups cannot attack.',
        image: 'assets/ev_riot_season.webp',
        effect: (G) => {
            let pcCount = 0, cCount = 0;
            Object.values(G.nodes).forEach(n => {
                if (n.alignments?.some(a => ['Populist', 'Cultural'].includes(a)) && n.type !== 'root') {
                    n._canAttackTwiceThisRound = true;
                    pcCount++;
                }
                if (n.alignments?.includes('Corporate') && n.type !== 'root') {
                    n._cannotAttackThisRound = true;
                    cCount++;
                }
            });
            return `🧨 Riot Season! ${pcCount} Populist/Cultural groups enraged. ${cCount} Corporate groups locked down.`;
        }
    },
    {
        id: 'ev_calm', name: 'Calm Before the Storm', type: 'event', icon: '🧘',
        desc: 'No attacks allowed this round. At the start of next round, all groups gain +1 Power for one turn.',
        image: 'assets/ev_calm_storm.webp',
        effect: (G) => {
            G._noAttacksThisRound = true;
            G._calmStormNextRoundBuff = true;
            return '🧘 Calm Before the Storm. Ceasefire engaged. Tensions rising...';
        }
    },
    {
        id: 'ev_panic', name: 'Global Panic', type: 'event', icon: '🧯',
        desc: 'Every group loses 1 Resistance. Every attack this round gains +2 Power.',
        image: 'assets/ev_global_panic.webp',
        effect: (G) => {
            G._globalPanicActive = true;
            let count = 0;
            Object.values(G.nodes).forEach(n => {
                if (n.type !== 'root') {
                    n.resistance = Math.max(0, (n.resistance || 0) - 1);
                    count++;
                }
            });
            return `🧯 Global Panic! ${count} groups destabilised. All attacks gain +2 Power!`;
        }
    },
    {
        id: 'ev_rebranding', name: 'Mass Rebranding', type: 'event', icon: '🧠',
        desc: 'All Media groups temporarily gain the Populist alignment.',
        image: 'assets/ev_mass_rebranding.webp',
        effect: (G) => {
            let count = 0;
            Object.values(G.nodes).forEach(n => {
                if (n.alignments?.includes('Media') && !n.alignments?.includes('Populist') && n.type !== 'root') {
                    n.alignments.push('Populist');
                    if (!n._tempAlignments) n._tempAlignments = [];
                    n._tempAlignments.push('Populist');
                    count++;
                }
            });
            return `🧠 Mass Rebranding! ${count} Media groups embraced Populism this round.`;
        }
    },
    {
        id: 'ev_techno_conversion', name: 'Techno-Conversion', type: 'event', icon: '🧪',
        desc: 'A random non‑Techno‑Utopian group in each player’s network becomes Techno‑Utopian this round.',
        image: 'assets/ev_techno_conversion.webp',
        effect: (G) => {
            let count = 0;
            G.playerOrder.forEach(pid => {
                const candidates = Object.values(G.nodes).filter(n => n.owner === pid && n.type !== 'root' && !n.alignments?.includes('Techno-Utopian'));
                if (candidates.length > 0) {
                    const target = candidates[Math.floor(Math.random() * candidates.length)];
                    target.alignments.push('Techno-Utopian');
                    if (!target._tempAlignments) target._tempAlignments = [];
                    target._tempAlignments.push('Techno-Utopian');
                    count++;
                }
            });
            return `🧪 Techno-Conversion! ${count} groups forcibly assimilated.`;
        }
    },
    {
        id: 'ev_deep_cover', name: 'Deep Cover', type: 'event', icon: '🕵️',
        desc: 'All Criminal groups lose the Criminal alignment this round and gain Legacy instead.',
        image: 'assets/ev_deep_cover.webp',
        effect: (G) => {
            let count = 0;
            Object.values(G.nodes).forEach(n => {
                if (n.alignments?.includes('Criminal') && n.type !== 'root') {
                    n.alignments = n.alignments.filter(a => a !== 'Criminal');
                    if (!n._removedAlignments) n._removedAlignments = [];
                    n._removedAlignments.push('Criminal');
                    
                    if (!n.alignments.includes('Legacy')) {
                        n.alignments.push('Legacy');
                        if (!n._tempAlignments) n._tempAlignments = [];
                        n._tempAlignments.push('Legacy');
                    }
                    count++;
                }
            });
            return `🕵️ Deep Cover! ${count} Criminal syndicates went legitimate (Legacy).`;
        }
    },
    {
        id: 'ev_outrage_polar', name: 'Outrage Polarisation', type: 'event', icon: '🔥',
        desc: 'All Cultural groups gain Populist for this round. All Populist groups gain +1 Power.',
        image: 'assets/ev_outrage_polarisation.webp',
        effect: (G) => {
            let cCount = 0, pCount = 0;
            Object.values(G.nodes).forEach(n => {
                if (n.alignments?.includes('Cultural') && !n.alignments?.includes('Populist') && n.type !== 'root') {
                    n.alignments.push('Populist');
                    if (!n._tempAlignments) n._tempAlignments = [];
                    n._tempAlignments.push('Populist');
                    cCount++;
                }
                if (n.alignments?.includes('Populist') && n.type !== 'root') {
                    n.power = (n.power || 0) + 1;
                    n._tempPowerBuff = (n._tempPowerBuff || 0) + 1;
                    pCount++;
                }
            });
            return `🔥 Outrage Polarisation! ${cCount} Cultural groups radicalised. ${pCount} Populist groups empowered.`;
        }
    },
    {
        id: 'ev_conspiracy_bloom', name: 'Conspiracy Bloom', type: 'event', icon: '🧿',
        desc: 'All Weird groups gain a second random alignment for this round.',
        image: 'assets/ev_conspiracy_bloom.webp',
        effect: (G) => {
            const allAlignments = ['Government', 'Corporate', 'Techno-Utopian', 'Financial', 'Legacy', 'Media', 'Populist', 'Cultural', 'Activist', 'Criminal', 'Academic'];
            let count = 0;
            Object.values(G.nodes).forEach(n => {
                if (n.alignments?.includes('Weird') && n.type !== 'root') {
                    const available = allAlignments.filter(a => !n.alignments.includes(a));
                    if (available.length > 0) {
                        const newAlign = available[Math.floor(Math.random() * available.length)];
                        n.alignments.push(newAlign);
                        if (!n._tempAlignments) n._tempAlignments = [];
                        n._tempAlignments.push(newAlign);
                        count++;
                    }
                }
            });
            return `🧿 Conspiracy Bloom! ${count} Weird groups mutated new alignments.`;
        }
    },
    {
        id: 'ev_greenwashing', name: 'Corporate Greenwashing', type: 'event', icon: '🧬',
        desc: 'All Corporate groups gain the Activist alignment this round.',
        image: 'assets/ev_greenwashing.webp',
        effect: (G) => {
            let count = 0;
            Object.values(G.nodes).forEach(n => {
                if (n.alignments?.includes('Corporate') && !n.alignments?.includes('Activist') && n.type !== 'root') {
                    n.alignments.push('Activist');
                    if (!n._tempAlignments) n._tempAlignments = [];
                    n._tempAlignments.push('Activist');
                    count++;
                }
            });
            return `🧬 Corporate Greenwashing! ${count} Megablocs rebranded as Activists.`;
        }
    },
    {
        id: 'ev_alignment_collapse', name: 'Alignment Collapse', type: 'event', icon: '🧨',
        desc: 'All groups lose one random alignment for this round.',
        image: 'assets/ev_alignment_collapse.webp',
        effect: (G) => {
            let count = 0;
            Object.values(G.nodes).forEach(n => {
                if (n.alignments?.length > 0 && n.type !== 'root') {
                    const idx = Math.floor(Math.random() * n.alignments.length);
                    const lost = n.alignments[idx];
                    n.alignments.splice(idx, 1);
                    if (!n._removedAlignments) n._removedAlignments = [];
                    n._removedAlignments.push(lost);
                    count++;
                }
            });
            return `🧨 Alignment Collapse! ${count} groups lost their primary identity.`;
        }
    },
    {
        id: 'ev_identity_crisis', name: 'Identity Crisis', type: 'event', icon: '🧩',
        desc: 'Each player has one group’s alignments completely rerolled for the round.',
        image: 'assets/ev_identity_crisis.webp',
        effect: (G) => {
            const allAlignments = ['Government', 'Corporate', 'Techno-Utopian', 'Financial', 'Legacy', 'Media', 'Populist', 'Cultural', 'Activist', 'Criminal', 'Academic', 'Weird'];
            let count = 0;
            G.playerOrder.forEach(pid => {
                const candidates = Object.values(G.nodes).filter(n => n.owner === pid && n.type !== 'root' && n.alignments?.length > 0);
                if (candidates.length > 0) {
                    const target = candidates[Math.floor(Math.random() * candidates.length)];
                    const oldAligns = [...target.alignments];
                    
                    target._removedAlignments = [...target.alignments];
                    target.alignments = [];
                    
                    if (!target._tempAlignments) target._tempAlignments = [];
                    
                    for (let i = 0; i < oldAligns.length; i++) {
                        const newA = allAlignments[Math.floor(Math.random() * allAlignments.length)];
                        if (!target.alignments.includes(newA)) {
                            target.alignments.push(newA);
                            target._tempAlignments.push(newA);
                        }
                    }
                    count++;
                }
            });
            return `🧩 Identity Crisis! ${count} groups experienced complete ideological whiplash.`;
        }
    },
    {
        id: 'ev_cultural_renaissance', name: 'Cultural Renaissance', type: 'event', icon: '🧘',
        desc: 'All Cultural groups gain +1 Resistance and gain the Academic alignment this round.',
        image: 'assets/ev_cultural_renaissance.webp',
        effect: (G) => {
            let count = 0;
            Object.values(G.nodes).forEach(n => {
                if (n.alignments?.includes('Cultural') && n.type !== 'root') {
                    n.resistance = (n.resistance || 0) + 1;
                    n._tempResBuff = (n._tempResBuff || 0) + 1;
                    if (!n.alignments.includes('Academic')) {
                        n.alignments.push('Academic');
                        if (!n._tempAlignments) n._tempAlignments = [];
                        n._tempAlignments.push('Academic');
                    }
                    count++;
                }
            });
            return `🧘 Cultural Renaissance! ${count} Cultural groups enlightened.`;
        }
    }
];