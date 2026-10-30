// Player-facing guidance; technical evidence remains in the specification.
export function reviewControls(version,{esc}) {
 const controls=version.game_profile?.controls||version.report?.game_profile?.controls;
 if(typeof controls!=='string'||!controls.trim())return '';
 const lines=controls.split(/\n+/).map(s=>s.trim()).filter(Boolean);
 return `<section class="review-controls"><h3>操作说明</h3><ul>${lines.map(line=>`<li>${esc(line)}</li>`).join('')}</ul><p class="tiny muted">按本次交付范围试玩；未验证内容见下方核对项和规格说明。</p></section>`;
}

export function reviewHandoff(version,{esc}) {
 return version.report?.review_mode==='ai_operation_limit'?`<section class="notice"><strong>待验收 · AI 操作受限</strong><p>已验证：${esc((version.report.manual_review?.verified||[]).join('；'))}</p><p>操作限制：${esc(version.report.manual_review?.reason||'')}</p><p>请人工核对：</p><ul>${(version.report.manual_review?.checks||[]).map(item=>`<li>${esc(item)}</li>`).join('')}</ul><label class="checkrow"><input type="checkbox" name="manual_review" required>已实际完成上述操作，并确认反馈符合预期</label></section>`:'';
}
