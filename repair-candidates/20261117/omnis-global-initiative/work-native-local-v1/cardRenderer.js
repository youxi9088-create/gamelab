import { getBasePortLayout } from './portUtils.js';
import { CARD_FLAVOURS } from './cardFlavours.js';

const ALIGNMENT_CARD_COLORS = {
    'Government': '#60a5fa',
    'Corporate': '#a78bfa',
    'Techno-Utopian': '#34d399',
    'Populist': '#fb923c',
    'Activist': '#f472b6',
    'Criminal': '#ef4444',
    'Media': '#38bdf8',
    'Cultural': '#e879f9',
    'Financial': '#facc15',
    'Weird': '#a3e635',
    'Legacy': '#94a3b8',
    'Academic': '#22d3ee'
};

function getAlignmentColor(alignment) {
    return ALIGNMENT_CARD_COLORS[alignment] || '#64748b';
}

function getAlignmentCardStyle(card, isAction) {
    if (isAction || !Array.isArray(card.alignments) || card.alignments.length === 0) return '';
    const colors = card.alignments.slice(0, 3).map(getAlignmentColor);
    let background = '';
    if (colors.length === 1) {
        background = `linear-gradient(135deg, ${colors[0]} 0%, ${colors[0]} 100%)`;
    } else if (colors.length === 2) {
        background = `linear-gradient(90deg, ${colors[0]} 0%, ${colors[0]} 50%, ${colors[1]} 50%, ${colors[1]} 100%)`;
    } else {
        background = `linear-gradient(90deg, ${colors[0]} 0%, ${colors[0]} 33.333%, ${colors[1]} 33.333%, ${colors[1]} 66.666%, ${colors[2]} 66.666%, ${colors[2]} 100%)`;
    }
    const borderColor = colors.length === 1 ? colors[0] : '#f8fafc';
    return `background:${background};border-color:${borderColor};box-shadow:2px 4px 10px rgba(0,0,0,0.55), inset 0 0 0 999px rgba(6,10,18,0.72);`;
}

export function getPlayingCardStyle(card, isAction = false) {
    return getAlignmentCardStyle(card, isAction);
}

export function createPlayingCardHTML(card, isAction = false, isRoot = false) {
    const catIcons = { resistance: '📢', power: '⚔️', economic: '💰', special: '🃏' };
    const cardStyle = getAlignmentCardStyle(card, isAction);
    
    // Check if card has BTC (we no longer need extra margin since the pill is moving to top-left)
    const hasBtc = card.btc && card.btc > 0;
    const statsMargin = '';

    // Generate inner structure depending on card type
    let titleHtml = '';
    let statsHtml = '';
    let arrowHtml = '';
    let alignmentsHtml = '';
    let categoryHtml = '';

    if (isAction) {
        categoryHtml = `<div style="font-size:10px;color:var(--accent-yellow);font-weight:bold;margin-bottom:4px;text-align:center;text-shadow:1px 1px 0 #000;">ACTION CARD</div>`;
        titleHtml = `<div class="card-title" style="color:var(--accent-yellow);">${card.name}</div>`;
        statsHtml = `<div class="card-footer" style="margin-top:auto;">"${card.flavour || ''}"</div>`;
    } else {
        titleHtml = `<div class="card-title">${card.name}</div>`;
        
        if (card.alignments && card.alignments.length > 0) {
            const alignmentPills = card.alignments.map(a => {
                const color = getAlignmentColor(a);
                return `<span style="color:${color};text-shadow:1px 1px 0 #000, 0 0 6px ${color}88;font-weight:bold;">${a}</span>`;
            }).join(' <span style="color:#64748b;font-weight:normal;">·</span> ');
            alignmentsHtml = `<div class="card-alignments-label">${alignmentPills}</div>`;
        }
        
        if (isRoot) {
            statsHtml = `
                <div class="card-stats-row" style="margin-top: 4px; ${statsMargin}">
                    <div class="card-stats-power"><span class="power-label">POWER</span>${card.power || 0}</div>
                    <div class="card-stats-power" style="align-items:flex-end;"><span class="power-label">INCOME</span>₿${card.income || 0}</div>
                </div>
            `;
        } else {
            const flavourText = CARD_FLAVOURS[card.id] ? `<div class="card-flavour-text">"${CARD_FLAVOURS[card.id]}"</div>` : '';
            
            // Render modifiers if present
            const isBoardNode = card.id && card.parentId !== undefined; // basic check if it's placed on the board
            
            let displayPower = card.power || 0;
            let displayResistance = card.resistance || 0;
            let displayIncome = card.income || 0;
            
            let powerStyle = '';
            let resStyle = '';
            let incStyle = '';
            
            if (isBoardNode) {
                // Find base card from either DECK or ACTION_CARDS depending on type, fallback to assuming it's in DECK
                const baseCard = window.DECK?.find(c => c.id === card.id) || 
                                 window.G?.deck?.find(c => c.id === card.id);
                                 
                if (baseCard) {
                    if (displayPower > (baseCard.power || 0)) powerStyle = 'color: var(--accent-green);';
                    else if (displayPower < (baseCard.power || 0)) powerStyle = 'color: var(--accent-red);';
                    
                    if (displayResistance > (baseCard.resistance || 0)) resStyle = 'color: var(--accent-green);';
                    else if (displayResistance < (baseCard.resistance || 0)) resStyle = 'color: var(--accent-red);';
                    
                    if (displayIncome > (baseCard.income || 0)) incStyle = 'color: var(--accent-green);';
                    else if (displayIncome < (baseCard.income || 0)) incStyle = 'color: var(--accent-red);';
                }
            }

            statsHtml = `
                <div class="card-stats-row" style="${statsMargin}">
                    <div class="card-stats-power" style="${powerStyle}"><span class="power-label">POWER</span>${displayPower}</div>
                    <div class="card-stats-res" style="${resStyle}"><span class="res-label">RESISTANCE</span>${displayResistance}</div>
                    <div class="card-stats-power" style="align-items:flex-end; ${incStyle}"><span class="power-label">INCOME</span>₿${displayIncome}</div>
                </div>
                ${flavourText}
            `;
        }
    }

    // Default image if not provided
    let imageSrc = 'assets/s-l400.jpg';
    if (card.image) imageSrc = card.image;
    else if (card.logo) imageSrc = card.logo;
    else if (isAction) imageSrc = 'assets/screenshot-2026-04-30-195714.png';
    else if (isRoot) imageSrc = 'assets/2063bd94-1ad3-4c79-9f45-19eb71fbed47.png';
    else imageSrc = 'assets/s-l400-2.jpg';

    // Transfer power badge
    let tpBadgeHtml = '';
    if (card.transferPower && card.transferPower > 0) {
        tpBadgeHtml = `<div style="position:absolute; top:-10px; right:-10px; background:#a855f7; color:#fff; border:2px solid #111; border-radius:50%; width:34px; height:34px; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:16px; box-shadow:2px 2px 5px rgba(0,0,0,0.5); z-index:10;">↑${card.transferPower}</div>`;
    }
    
    let btcBadgeHtml = '';
    if (hasBtc) {
        btcBadgeHtml = `<div style="position:absolute; top:-12px; left:-12px; background:#eab308; color:#000; border:2px solid #111; border-radius:8px; padding:2px 10px; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:16px; box-shadow:2px 2px 5px rgba(0,0,0,0.5); z-index:10; white-space:nowrap;">₿${Math.floor(card.btc)}</div>`;
    }

    // Draw HTML arrows mapping to the generic layout
    // CSS uses absolute positioning mapped to 0 (top), 1 (right), 2 (bottom), 3 (left)
    const baseLayout = getBasePortLayout(card);
    const htmlArrowOutClasses = { 0: 'arrow-top', 1: 'arrow-right', 2: 'arrow-bottom', 3: 'arrow-left' };
    const htmlArrowInClasses = { 0: 'arrow-in-top', 1: 'arrow-in-right', 2: 'arrow-in-bottom', 3: 'arrow-in-left' };
    
    if (!isAction && baseLayout) {
        if (baseLayout.outgoing && Array.isArray(baseLayout.outgoing)) {
            baseLayout.outgoing.forEach(side => {
                arrowHtml += `<div class="control-arrow ${htmlArrowOutClasses[side]}"></div>`;
            });
        }
        if (baseLayout.incoming !== null && baseLayout.incoming !== undefined) {
            arrowHtml += `<div class="control-arrow ${htmlArrowInClasses[baseLayout.incoming]}"></div>`;
        }
    }

    let descHtml = `<div class="card-desc-box">\n            ${card.desc || ''}\n        </div>`;

    if (isRoot) {
        const winConditionHtml = `<div style="font-size:9px; color:#f8fafc; font-weight:bold; text-align:center; padding:4px 0; border-top:1px solid rgba(255,255,255,0.15); border-bottom:1px solid rgba(255,255,255,0.15); margin:4px 0;">WIN: ${card.winDesc || ''}</div>`;
        const abilityHtml = card.ability ? `
            <div style="font-size:8px; line-height:1.2; color:#cbd5e0; text-align:left;">
                <strong style="color:#f8fafc;">${card.ability.icon || ''} ${card.ability.name}:</strong> ${card.ability.desc}
            </div>
        ` : '';

        descHtml = `
            <div class="card-desc-box" style="padding: 6px; display:flex; flex-direction:column; margin-top:4px;">
                <div style="font-style:italic; color:#cbd5e0; font-size:8px; text-align:center; margin-bottom:4px;">"${card.desc || ''}"</div>
                ${winConditionHtml}
                ${abilityHtml}
            </div>
        `;
    }

    return `
        ${cardStyle ? `<div class="card-alignment-style" data-card-style="${cardStyle.replace(/"/g, '&quot;')}"></div>` : ''}
        ${tpBadgeHtml}
        ${btcBadgeHtml}
        ${categoryHtml}
        ${titleHtml}
        ${alignmentsHtml}
        <img class="card-image" src="${imageSrc}" alt="Card Art">
        ${descHtml}
        ${statsHtml}
        ${arrowHtml}
    `;
}