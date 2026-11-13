export function renderVictoryResultsMarkup({
    result,
    winnerSide,
    loserName,
    skunkStatus,
    finishLane,
    target,
    rankingNotice,
    skunkImagePath,
    escapeHtml
}) {
    const skunkMarkup = skunkStatus
        ? `<div class="victory-skunk-result" role="note" aria-label="${escapeHtml(loserName)} was ${skunkStatus.label.toLowerCase()}"><div class="victory-skunk-images">${Array.from({ length: skunkStatus.imageCount }, (_, index) => `<img src="${escapeHtml(skunkImagePath)}" alt="${index === 0 ? `${skunkStatus.label} skunk` : ''}"${index > 0 ? ' aria-hidden="true"' : ''}>`).join('')}</div><div class="victory-skunk-copy"><strong>${skunkStatus.label}</strong><span>${escapeHtml(loserName)} did not exceed ${skunkStatus.threshold} points with either peg before the win.</span></div></div>`
        : '';
    const extensionMarkup = result.extensionEnabled
        ? `<section class="victory-extension-stat" aria-label="Extensions played"><span>EXTENSIONS PLAYED</span><strong>${result.extensionsPlayed}</strong></section>`
        : '';

    return `<section class="victory-screen" role="dialog" aria-modal="true" aria-labelledby="victory-title" aria-describedby="victory-sub">
        <div class="victory-scroll">
            <div class="victory-nautical-mark" aria-hidden="true"><span>⚓</span></div>
            <header class="victory-heading">
                <img class="victory-ship-logo" src="assets/turbocrib-ship-logo-no-bg-no-text.png" alt="TurboCrib sailing ship">
                <p class="victory-kicker"><span aria-hidden="true">⚓</span> THE VOYAGE IS WON <span aria-hidden="true">⚓</span></p>
                <h1 class="victory-title" id="victory-title"><span class="victory-winner">${escapeHtml(result.winnerName)}</span><span class="victory-title-suffix">WINS</span></h1>
                <div class="victory-rule" aria-hidden="true"><i></i></div>
            </header>
            <section class="victory-scoreline" aria-label="Final scores">
                <article class="victory-score ${winnerSide === 'p1' ? 'winner-score' : ''}" aria-label="${escapeHtml(result.player1Name)}, final score ${result.player1Score}">
                    <span>${escapeHtml(result.player1Name)}’S SCORE</span><strong>${result.player1Score}</strong>
                </article>
                <div class="victory-score-divider" aria-hidden="true">VS</div>
                <article class="victory-score ${winnerSide === 'p2' ? 'winner-score' : ''}" aria-label="${escapeHtml(result.player2Name)}, final score ${result.player2Score}">
                    <span>${escapeHtml(result.player2Name)}’S SCORE</span><strong>${result.player2Score}</strong>
                </article>
            </section>
            <section class="victory-records" aria-label="Highest single score for both players">
                <h2 class="victory-section-heading">HIGHEST SINGLE SCORE <span>OF THE VOYAGE</span></h2>
                <div class="victory-details">
                    <article><b>${escapeHtml(result.player1Name)}</b><strong>${result.player1HighSingleScore}</strong><small>${escapeHtml(result.player1HighSingleLabel)}</small></article>
                    <article><b>${escapeHtml(result.player2Name)}</b><strong>${result.player2HighSingleScore}</strong><small>${escapeHtml(result.player2HighSingleLabel)}</small></article>
                </div>
            </section>
            ${extensionMarkup}
            <section class="victory-tally" aria-label="Current match tally">
                <span>CURRENT TALLY</span>
                <strong>${result.tallyPlayer1}<i>—</i>${result.tallyPlayer2}</strong>
                <small>${escapeHtml(result.player1Name)} <i>·</i> ${escapeHtml(result.player2Name)}</small>
            </section>
            ${skunkMarkup}
            <p class="victory-sub" id="victory-sub">${escapeHtml(finishLane)} reached ${target} · celebration complete · ${escapeHtml(rankingNotice)}</p>
            <div class="action-row victory-actions" aria-label="Victory actions">
                <button type="button" class="action-btn secondary victory-close-results" data-action="close-victory">CLOSE RESULTS</button>
                <button type="button" class="action-btn victory-play-again" data-action="new-round">PLAY AGAIN</button>
            </div>
        </div>
    </section>`;
}
