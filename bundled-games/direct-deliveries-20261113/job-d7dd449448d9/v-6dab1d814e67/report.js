// End-of-shift report: grade, working style, ledger and next-step choices.

export function gradeShift(d) {
  const { stats } = d;
  const quotaPts = (Math.min(d.money / d.quota, 1.5) / 1.5) * 45;
  const goalPts = (d.goalsHit / d.goalsTotal) * 20;
  const eventPts = Math.max(0, Math.min(stats.events, 3) * 3.4 - stats.eventsMissed * 1.5);
  const safetyPts = Math.max(0, 15 - stats.crashes * 4 - stats.tickets * 4);
  const weatherPts = d.weatherType === 'clear' ? 10 : Math.max(0, Math.min(10, 7 + Math.min(stats.smooth, 4) - stats.skids * 3));
  const score = Math.round(quotaPts + goalPts + eventPts + safetyPts + weatherPts);
  const letter = score >= 90 ? 'S' : score >= 80 ? 'A' : score >= 68 ? 'B' : score >= 55 ? 'C' : score >= 40 ? 'D' : 'F';
  const color = { S: '#ffd23f', A: '#9e5', B: '#7fd4ff', C: '#c9a6ff', D: '#ffb347', F: '#ff6b6b' }[letter];
  const blurb = {
    S: 'Legendary route. The whole town noticed.',
    A: 'Excellent shift. The council is impressed.',
    B: 'Solid, dependable work.',
    C: 'Got the job done, with room to grow.',
    D: 'A rough day on the route.',
    F: 'The boss wants a word…',
  }[letter];
  return { score, letter, color, blurb, parts: { quotaPts, goalPts, eventPts, safetyPts, weatherPts } };
}

export function workingStyle(d) {
  const s = d.stats;
  const clean = s.crashes + s.tickets === 0 && s.pickups >= 8;
  const styles = [
    { id: 'dumpster', icon: '🏋️', name: 'Dumpster Specialist', score: s.dumpsters * 3.2, why: `${s.dumpsters} dumpsters lifted`, tip: 'Market Row is your gold mine.' },
    { id: 'curbside', icon: '🗑', name: 'Curbside Grinder', score: s.pickups * 0.9, why: `${s.pickups} stops cleared`, tip: 'A Bigger Hopper means fewer landfill runs.' },
    { id: 'hauler', icon: '🚛', name: 'Speed Hauler', score: s.loads * 5, why: `${s.loads} landfill trips`, tip: 'Turbo Engine makes those runs even faster.' },
    { id: 'event', icon: '🦝', name: 'Event Hero', score: s.events * 7.5, why: `${s.events} roadside events cleared`, tip: 'Chase every beacon; they pay big.' },
    { id: 'weather', icon: '🌦', name: 'Weather Pro', score: d.weatherType === 'clear' ? 0 : s.smooth * 3.2 - s.skids * 2, why: `${s.smooth} smooth hazard runs`, tip: 'Your careful driving pays in rough cities.' },
    { id: 'combo', icon: '🔥', name: 'Combo Machine', score: s.bestCombo * 2.4, why: `best combo x${s.bestCombo}`, tip: 'Tight routes keep the chain going.' },
    { id: 'rush', icon: '⭐', name: 'Rush Runner', score: s.rush * 6.5, why: `${s.rush} rush pickups`, tip: 'Quick detours add up.' },
    { id: 'safe', icon: '🛡', name: 'Safe Driver', score: clean ? 20 : 0, why: 'no crashes or tickets', tip: 'Insurance loves you. Keep it clean.' },
  ];
  styles.sort((a, b) => b.score - a.score);
  return styles[0].score > 0 ? styles[0] : { icon: '🧢', name: 'New Recruit', why: 'just getting started', tip: 'Stop beside trash and keep the truck moving.' };
}

const money = n => `${n < 0 ? '−' : ''}$${Math.abs(n)}`;

export function buildReport(d) {
  const g = gradeShift(d);
  const style = workingStyle(d);
  const s = d.stats;
  const L = d.ledger;
  const pct = Math.min(100, Math.round((d.money / d.quota) * 100));
  const row = (label, value, cls = '') => `<div class="r-row ${cls}"><span>${label}</span><b>${value}</b></div>`;

  const work = [
    row('🗑 Stops cleared', s.pickups),
    row('📦 Units loaded', s.units),
    row('🏋️ Dumpsters lifted', s.dumpsters),
    row('🚛 Landfill trips', s.loads),
    row('⭐ Rush pickups', s.rush),
    row('🔥 Best combo', `x${s.bestCombo}`),
  ].join('');
  const skill = [
    row('🦝🎉 Events cleared', `${s.events}${s.eventsMissed ? ` <small>(${s.eventsMissed} missed)</small>` : ''}`),
    d.weatherType === 'clear'
      ? row('🌤 Weather', 'Clear skies')
      : row('🌦 Weather skill', `${s.smooth} smooth · ${s.skids} skid${s.skids === 1 ? '' : 's'}`, s.skids > 1 ? 'bad' : 'good'),
    row('💥 Crashes', s.crashes, s.crashes ? 'bad' : 'good'),
    row('🚓 Tickets', s.tickets, s.tickets ? 'bad' : 'good'),
    row('🎯 Goals', `${d.goalsHit}/${d.goalsTotal}`),
  ].join('');

  const lines = [
    ['Landfill dumps', L.dumps],
    ['Combo bonuses', L.combo],
    ['Rush pickups', L.rush],
    ['Roadside events', L.events],
    ['Smooth driving', L.smooth],
    ['Daily goals', L.goals],
    ['Safe-driver bonus', d.safeBonus],
    ['Weather-pro bonus', d.weatherBonus],
    ['Crash damage', -L.crashes],
    ['Traffic fines', -L.fines],
  ].filter(([, v]) => v !== 0);
  const ledger = lines.map(([k, v]) => row(k, money(v), v < 0 ? 'bad' : '')).join('') +
    row('Shift earnings', money(d.money), 'total') +
    (d.crewPay ? row(`👷 Crew trucks (${d.crewCount})`, `+$${d.crewPay}`, 'good') : '') +
    row('🏦 Company bank', `$${d.bank}`, 'bank');

  const choices = d.choices.map(c =>
    `<button class="r-choice ${c.primary ? 'primary' : ''}" data-act="${c.act}" ${c.disabled ? 'disabled' : ''}><span>${c.icon}</span><div><b>${c.title}</b><small>${c.desc}</small></div></button>`).join('');

  return `
  <div class="r-head">
    <div class="r-grade" style="--g:${g.color}"><b>${g.letter}</b><small>${g.score}/100</small></div>
    <div class="r-title">
      <div class="r-eyebrow">${d.cityName.toUpperCase()} · ${d.difficultyLabel} · SHIFT REPORT</div>
      <div class="r-verdict ${d.won ? 'good' : 'bad'}">${d.won ? '📜 Contract won!' : '❌ Quota missed'}</div>
      <div class="r-blurb">${g.blurb}</div>
      <div class="r-quota"><div style="width:${pct}%;background:${d.won ? '#9e5' : '#ffb347'}"></div></div>
      <small>${money(d.money)} of ${money(d.quota)} quota${d.won ? '' : ` · short by ${money(d.quota - d.money)}`}</small>
    </div>
  </div>
  <div class="r-style"><span>${style.icon}</span><div><small>EARL'S STRONGEST STYLE</small><b>${style.name}</b><em>${style.why}. ${style.tip}</em></div></div>
  <div class="r-grid">
    <div class="r-card"><h4>The Route</h4>${work}</div>
    <div class="r-card"><h4>Skill &amp; Safety</h4>${skill}</div>
    <div class="r-card wide"><h4>Earnings &amp; Bonuses</h4>${ledger}</div>
  </div>
  ${d.storyLine ? `<div class="r-story">${d.storyLine}</div>` : ''}
  <div class="r-next"><h4>What's next for Earl's Hauling Co.?</h4>${choices}</div>`;
}
