const container = document.getElementById('game-container');

container.innerHTML = `
  <main class="app" aria-label="Shedoku: Sudoku in the Shed">
    <section class="shed-scene" id="shed-scene" aria-label="Knott's cluttered garden shed">
      <div class="scene-door" aria-hidden="true"></div>
      <div class="scene-brand"><h1>SHEDOKU</h1><p>Sudoku in the shed</p></div>
      <div class="scene-records" id="scene-records">Puzzles: <b id="scene-done">0</b> · PB: <b id="scene-best">—</b></div>
      <div class="sound-console" aria-label="Sound controls">
        <div class="sound-top"><span class="radio-label">♫ SHED FM · 1999</span><button class="mute-button" id="mute-button" type="button" aria-pressed="false">SOUND ON</button></div>
        <label class="sound-row">MUSIC <input id="music-volume" type="range" min="0" max="1" step="0.01" value="0.28" aria-label="Music volume"></label>
        <label class="sound-row">SFX <input id="sfx-volume" type="range" min="0" max="1" step="0.01" value="0.72" aria-label="Sound effects volume"></label>
      </div>
      <button class="shed-radio" id="radio-prop" type="button" aria-label="Click the old radio"><span>SHED FM</span><div class="radio-grille"></div><span>98.6</span></button>
      <img class="scene-prop" id="tools" src="assets/tools.webp" alt="Knott's old garden tools" title="Click the tools" tabindex="0">
      <img class="scene-prop" id="pots" src="assets/pots.webp" alt="A stack of empty plant pots" title="Click the pots" tabindex="0">
      <img class="scene-prop" id="mower" src="assets/lawnmower.webp" alt="A rather unreliable old lawnmower" title="Click the lawnmower" tabindex="0">
      <div class="scene-junk" aria-label="Shed clutter">
        <button class="mug" id="tea-prop" type="button" aria-label="Click Knott's mug of tea" title="A proper cuppa">☕</button>
        <div class="cardboard" title="Box of mysterious cables"></div>
        <div class="ashtray" id="ashtray" title="A tiny smoky shed-side gag" aria-label="Ashtray with a little drifting cartoon smoke">
          <span class="rolled-item"></span><i class="smoke one"></i><i class="smoke two"></i>
        </div>
      </div>
      <div class="knott-wrap" id="knott-wrap">
        <img id="knott" src="assets/knott-shed-character.webp" alt="Knott, a bearded man with thick black-framed glasses, sitting on a folding chair and playing Sudoku on his phone">
        <span id="emotion" aria-hidden="true"></span>
      </div>
      <div class="speech-bubble" id="speech-bubble" aria-live="polite"></div>
      <div class="sister-entry" id="sister-entry" aria-label="Knott's adult step-sister">
        <img class="sister-image" id="sister-image" src="assets/step-sister-glam.webp" alt="Knott's adult step-sister, a curvy brunette in a stylish red top and plum skirt">
      </div>
      <div class="distraction-card" id="distraction-card" role="status" aria-live="polite">
        <strong>Distraction!</strong>
        <p id="sister-line"></p>
        <p class="reply" id="knott-reply"></p>
        <button class="distraction-dismiss" id="dismiss-distraction" type="button">Back to Sudoku</button>
      </div>
      <div class="ambient-event" id="ambient-event" aria-live="polite"></div>
      <div class="mum-toast" id="mum-toast" aria-live="polite"></div>
      <span class="phone-note" id="phone-note" aria-live="polite"></span>
      <span class="door-cat" id="door-cat" aria-hidden="true" hidden>🐈</span>
      <span class="mouse-run" id="mouse-run" aria-hidden="true" hidden>🐭</span>
    </section>
    <section class="game-side" aria-label="Sudoku game">
      <div class="phone-shell"><div class="phone-screen">
        <header class="panel-heading">
          <div><span class="panel-kicker">Mum said do something useful</span><h2>Shedoku</h2></div>
          <button class="retro-button" id="new-game" type="button">NEW PUZZLE ↻</button>
        </header>
        <div class="difficulty-row" role="group" aria-label="Choose puzzle difficulty">
          <span class="difficulty-label">Difficulty</span>
          <button class="difficulty-btn" type="button" data-difficulty="0">EASY</button>
          <button class="difficulty-btn" type="button" data-difficulty="1">MEDIUM</button>
          <button class="difficulty-btn" type="button" data-difficulty="2">HARD</button>
          <button class="difficulty-btn" type="button" data-difficulty="3">EXPERT</button>
        </div>
        <div class="metrics" aria-label="Game statistics">
          <div class="metric"><span class="metric-label">Time</span><span class="metric-value" id="time">00:00</span></div>
          <div class="metric"><span class="metric-label">Score</span><span class="metric-value score-value" id="score">0</span></div>
          <div class="metric"><span class="metric-label">High score</span><span class="metric-value" id="high-score">0</span></div>
          <div class="metric"><span class="metric-label">Solved</span><span class="metric-value" id="completed">0</span></div>
        </div>
        <div class="record-line">Personal best time: <b id="best-time">—</b> <span aria-hidden="true">·</span> <span id="level-caption">Puzzle 1</span></div>
        <div class="sudoku-grid" id="sudoku-grid" role="grid" aria-label="Sudoku puzzle"></div>
        <div class="digit-pad" id="digit-pad" aria-label="Number pad"></div>
        <div class="game-status" id="game-status" data-kind="normal" aria-live="polite">Pick an empty square, then enter a number.</div>
        <footer class="panel-foot"><span>Keys 1–9 · arrows move · ⌫ clears · M mutes</span><span id="streak-label">Ready when you are, Knott.</span></footer>
      </div></div>
    </section>
  </main>`;

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const pick = items => items[Math.floor(Math.random() * items.length)];
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const fmtTime = seconds => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
const difficultyNames = ['Easy', 'Medium', 'Hard', 'Expert'];
// Each step removes more clues while keeping exactly one valid solution.
const blankTargets = [36, 42, 48, 54];

// Sudoku generator: randomized full solution, then remove clues only when uniqueness remains.
function shuffle(items) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}
function candidates(board, index) {
  const row = Math.floor(index / 9);
  const col = index % 9;
  const used = new Set();
  for (let n = 0; n < 9; n++) {
    used.add(board[row * 9 + n]);
    used.add(board[n * 9 + col]);
  }
  const rowBase = Math.floor(row / 3) * 3;
  const colBase = Math.floor(col / 3) * 3;
  for (let r = rowBase; r < rowBase + 3; r++) {
    for (let c = colBase; c < colBase + 3; c++) used.add(board[r * 9 + c]);
  }
  const options = [];
  for (let n = 1; n <= 9; n++) if (!used.has(n)) options.push(n);
  return options;
}
function bestEmptyCell(board) {
  let bestIndex = -1;
  let bestOptions = null;
  for (let i = 0; i < 81; i++) {
    if (board[i] !== 0) continue;
    const options = candidates(board, i);
    if (options.length === 0) return { index: i, options };
    if (bestOptions === null || options.length < bestOptions.length) {
      bestIndex = i;
      bestOptions = options;
      if (options.length === 1) break;
    }
  }
  return { index: bestIndex, options: bestOptions || [] };
}
function solveFirst(board, randomize = false) {
  const choice = bestEmptyCell(board);
  if (choice.index === -1) return true;
  const values = randomize ? shuffle(choice.options) : choice.options;
  for (const value of values) {
    board[choice.index] = value;
    if (solveFirst(board, randomize)) return true;
    board[choice.index] = 0;
  }
  return false;
}
function countSolutions(board, limit = 2, count = { value: 0, nodes: 0 }) {
  count.nodes++;
  // If uniqueness is expensive to prove, keep the clue rather than risk an ambiguous puzzle.
  if (count.nodes > 40000) return true;
  const choice = bestEmptyCell(board);
  if (choice.index === -1) {
    count.value++;
    return count.value >= limit;
  }
  for (const value of choice.options) {
    board[choice.index] = value;
    const reachedLimit = countSolutions(board, limit, count);
    board[choice.index] = 0;
    if (reachedLimit) return true;
  }
  return false;
}
function generatePuzzle(targetBlanks) {
  const solution = new Array(81).fill(0);
  solveFirst(solution, true);
  const puzzle = solution.slice();
  let removed = 0;
  for (const index of shuffle(Array.from({ length: 81 }, (_, i) => i))) {
    if (removed >= targetBlanks) break;
    if (puzzle[index] === 0) continue;
    const previous = puzzle[index];
    puzzle[index] = 0;
    // false means the one known solution remains unique; true rejects ambiguous or unproven removals.
    if (!countSolutions(puzzle.slice())) removed++;
    else puzzle[index] = previous;
  }
  return { solution, puzzle };
}

function readProgress() {
  const defaults = { done: 0, best: null, score: 0, highScore: 0, difficulty: null };
  try {
    const saved = JSON.parse(localStorage.getItem('shedoku') || '{}');
    return {
      done: Number.isFinite(Number(saved.done)) ? Math.max(0, Number(saved.done)) : 0,
      best: Number.isFinite(Number(saved.best)) && saved.best !== null ? Number(saved.best) : null,
      score: Number.isFinite(Number(saved.score)) ? Math.max(0, Number(saved.score)) : 0,
      highScore: Number.isFinite(Number(saved.highScore)) ? Math.max(0, Number(saved.highScore)) : 0,
      difficulty: Number.isInteger(saved.difficulty) ? clamp(saved.difficulty, 0, 3) : null
    };
  } catch {
    return defaults;
  }
}
const progress = readProgress();
let difficulty = progress.difficulty ?? Math.min(3, Math.floor(progress.done / 2));
let puzzleNumber = progress.done + 1;
let score = progress.score;
let solution = [];
let board = [];
let givens = [];
let selected = -1;
let startedAt = 0;
let elapsedTime = 0;
let isPlaying = false;
let completedCells = 0;
let streak = 0;
let mistakes = 0;
let bubbleTimeout;
let eventTimeout;
let sisterTimeout;
let notificationTimeout;
let ambientTimeout;
let audioContext = null;
let audioUnlocked = false;
let muted = false;
let audioFlourishTimeout;

const grid = $('#sudoku-grid');
const cells = [];
for (let index = 0; index < 81; index++) {
  const cell = document.createElement('button');
  const row = Math.floor(index / 9);
  const col = index % 9;
  cell.type = 'button';
  cell.className = 'sudoku-cell';
  cell.setAttribute('role', 'gridcell');
  cell.setAttribute('aria-label', `Row ${row + 1}, column ${col + 1}`);
  if (col === 2 || col === 5) cell.classList.add('block-right');
  if (row === 2 || row === 5) cell.classList.add('block-bottom');
  cell.addEventListener('click', () => selectCell(index));
  grid.appendChild(cell);
  cells.push(cell);
}
const digitPad = $('#digit-pad');
for (let n = 1; n <= 9; n++) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'digit-button';
  button.textContent = String(n);
  button.setAttribute('aria-label', `Enter ${n}`);
  button.addEventListener('click', () => enterNumber(n));
  digitPad.appendChild(button);
}
const eraseButton = document.createElement('button');
eraseButton.type = 'button';
eraseButton.className = 'digit-button erase';
eraseButton.textContent = '⌫ CLEAR';
eraseButton.setAttribute('aria-label', 'Clear selected cell');
eraseButton.addEventListener('click', () => enterNumber(0));
digitPad.appendChild(eraseButton);

const speech = $('#speech-bubble');
const emotion = $('#emotion');
const knottWrap = $('#knott-wrap');
const shed = $('#shed-scene');
const status = $('#game-status');
function say(line, face = '') {
  speech.textContent = line;
  speech.classList.add('visible');
  clearTimeout(bubbleTimeout);
  bubbleTimeout = setTimeout(() => speech.classList.remove('visible'), 2700);
  if (face) {
    emotion.textContent = face;
    emotion.classList.remove('show');
    void emotion.offsetWidth;
    emotion.classList.add('show');
  }
}
function animateKnott(kind) {
  knottWrap.classList.remove('happy', 'grumpy', 'party', 'wave-smoke');
  void knottWrap.offsetWidth;
  knottWrap.classList.add(kind);
  setTimeout(() => knottWrap.classList.remove(kind), kind === 'party' ? 2600 : 1500);
}
function setStatus(message, kind = 'normal') {
  status.textContent = message;
  status.dataset.kind = kind;
}

// All audio starts after a real user gesture. Original Eurodance cues rotate with gentle crossfades.
const musicTracks = [
  'assets/audio/shed-rave-loop.mp3',
  'assets/audio/shedoku-eurodance-lime-rave.mp3',
  'assets/audio/shedoku-eurodance-cheese-dream.mp3',
  'assets/audio/shedoku-eurodance-neon-kettle.mp3'
].map(source => {
  const track = new Audio(source);
  track.preload = 'auto';
  track.loop = false;
  track.volume = 0;
  return track;
});
let currentTrackIndex = Math.floor(Math.random() * musicTracks.length);
let fadingTrackIndex = -1;
let fadeStartedAt = 0;
let fadeTimer = null;
const trackFadeDuration = 1800;
const wrongSound = new Audio('assets/audio/wrong.mp3');
wrongSound.preload = 'auto';
function musicPlaybackRate() {
  return streak >= 4 ? 1.08 : streak >= 2 ? 1.035 : 1;
}
function updateMusicVolumes(progress = 0) {
  const baseVolume = muted || !audioUnlocked ? 0 : clamp(Number($('#music-volume').value), 0, 1);
  musicTracks.forEach((track, index) => {
    let mix = index === currentTrackIndex ? 1 : 0;
    if (fadingTrackIndex >= 0) {
      if (index === currentTrackIndex) mix = 1 - progress;
      else if (index === fadingTrackIndex) mix = progress;
    }
    track.volume = clamp(baseVolume * mix, 0, 1);
  });
}
function setMusicVolume() {
  updateMusicVolumes(fadingTrackIndex >= 0 ? clamp((performance.now() - fadeStartedAt) / trackFadeDuration, 0, 1) : 0);
}
function setSfxVolume() {
  wrongSound.volume = clamp(Number($('#sfx-volume').value), 0, 1);
}
function finishMusicTransition() {
  if (fadingTrackIndex < 0) return;
  clearInterval(fadeTimer);
  fadeTimer = null;
  musicTracks[currentTrackIndex].pause();
  musicTracks[currentTrackIndex].currentTime = 0;
  currentTrackIndex = fadingTrackIndex;
  fadingTrackIndex = -1;
  musicTracks[currentTrackIndex].playbackRate = musicPlaybackRate();
  updateMusicVolumes();
}
function advanceMusicTransition() {
  if (fadingTrackIndex < 0) return;
  const progress = clamp((performance.now() - fadeStartedAt) / trackFadeDuration, 0, 1);
  updateMusicVolumes(progress);
  if (progress >= 1) finishMusicTransition();
}
function startMusicTransition() {
  if (fadingTrackIndex >= 0 || muted || !audioUnlocked) return;
  fadingTrackIndex = (currentTrackIndex + 1) % musicTracks.length;
  fadeStartedAt = performance.now();
  const incoming = musicTracks[fadingTrackIndex];
  incoming.currentTime = 0;
  incoming.playbackRate = musicPlaybackRate();
  updateMusicVolumes(0);
  incoming.play().catch(() => {
    clearInterval(fadeTimer);
    fadeTimer = null;
    fadingTrackIndex = -1;
    updateMusicVolumes();
  });
  clearInterval(fadeTimer);
  fadeTimer = setInterval(advanceMusicTransition, 50);
}
function syncMusic() {
  const shouldPlay = !muted && audioUnlocked;
  if (!shouldPlay) {
    musicTracks.forEach(track => track.pause());
    updateMusicVolumes();
    return;
  }
  musicTracks.forEach(track => { track.playbackRate = musicPlaybackRate(); });
  updateMusicVolumes(fadingTrackIndex >= 0 ? clamp((performance.now() - fadeStartedAt) / trackFadeDuration, 0, 1) : 0);
  musicTracks[currentTrackIndex].play().catch(() => {});
  if (fadingTrackIndex >= 0) musicTracks[fadingTrackIndex].play().catch(() => {});
}
setInterval(() => {
  if (muted || !audioUnlocked || fadingTrackIndex >= 0) return;
  const current = musicTracks[currentTrackIndex];
  if (current.ended || (Number.isFinite(current.duration) && current.duration - current.currentTime <= 2.2)) {
    startMusicTransition();
  }
}, 250);
function unlockAudio() {
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) audioContext = new AudioContextClass();
  }
  if (audioContext && audioContext.state === 'suspended') audioContext.resume().catch(() => {});
  audioUnlocked = true;
  setSfxVolume();
  syncMusic();
}
document.addEventListener('pointerdown', unlockAudio, { once: true });
document.addEventListener('keydown', unlockAudio, { once: true });
function playTone(frequency, duration = 0.15, wave = 'sine', volume = 0.14, delay = 0) {
  if (muted || !audioContext || Number($('#sfx-volume').value) <= 0) return;
  const start = audioContext.currentTime + delay;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = wave;
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(Math.max(0.001, volume * Number($('#sfx-volume').value)), start);
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start(start);
  oscillator.stop(start + duration);
}
function happyFlourish() {
  [[523, 0], [659, .07], [784, .14]].forEach(([note, delay]) => playTone(note, .19, 'triangle', .09, delay));
}
function danceSting() {
  [[392, 0], [523, .09], [659, .18], [784, .29]].forEach(([note, delay]) => playTone(note, .28, 'square', .065, delay));
}
function playWrongSound() {
  if (muted) return;
  wrongSound.volume = clamp(Number($('#sfx-volume').value), 0, 1);
  wrongSound.currentTime = 0;
  wrongSound.play().catch(() => {
    playTone(190, .28, 'sawtooth', .12);
    playTone(145, .36, 'sawtooth', .1, .18);
  });
}
$('#music-volume').addEventListener('input', () => { setMusicVolume(); });
$('#sfx-volume').addEventListener('input', setSfxVolume);
$('#mute-button').addEventListener('click', () => {
  muted = !muted;
  $('#mute-button').textContent = muted ? 'SOUND OFF' : 'SOUND ON';
  $('#mute-button').setAttribute('aria-pressed', String(muted));
  syncMusic();
});

const wrongLines = ["Oh, come on!", "That's definitely not right.", "For God's sake, Knott.", "I knew that was wrong.", "Why did I put that?", "Bloody phone's got it in for me."];
const rightLines = ['YES! Get in!', 'I knew that one.', 'Easy.', 'Absolute genius.', 'That was obvious.', 'Mensa, ring me.'];
const propLines = {
  tools: ["Dad's spade. Last used in 1998.", 'That rake has claimed three slippers.', 'The shed tool retirement home.'],
  pots: ['Mum says tomatoes. It is currently February.', 'Empty pots. Big plans, Knott.', 'A tasteful collection of nothing.'],
  mower: ['Brrrm. No. Still not starting.', 'Mum wants the lawn done. Mum can wait.', 'That mower has one speed: ominous.'],
  tea: ["Tea: the shed's finest operating system.", 'Careful, it has gone the colour of the carpet.', 'A good cuppa and one tiny Sudoku mistake.']
};
function showAmbient(message, duration = 2300) {
  const event = $('#ambient-event');
  event.textContent = message;
  event.classList.add('visible');
  clearTimeout(ambientTimeout);
  ambientTimeout = setTimeout(() => event.classList.remove('visible'), duration);
}
function setTemporaryToast(element, message, duration = 2600) {
  element.textContent = message;
  element.classList.add('visible');
  clearTimeout(notificationTimeout);
  notificationTimeout = setTimeout(() => element.classList.remove('visible'), duration);
}
function wobbleProp(element) {
  element.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-9deg)' }, { transform: 'rotate(8deg)' }, { transform: 'rotate(0)' }], { duration: 430, easing: 'ease-in-out' });
}
function makePropInteractive(id, key) {
  const element = document.getElementById(id);
  const activate = () => {
    wobbleProp(element);
    say(pick(propLines[key]));
    playTone(260 + Math.random() * 180, .12, 'triangle', .06);
  };
  element.addEventListener('click', activate);
  if (element.tagName === 'IMG') element.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); activate(); }
  });
}
makePropInteractive('tools', 'tools');
makePropInteractive('pots', 'pots');
makePropInteractive('mower', 'mower');
makePropInteractive('tea-prop', 'tea');
$('#radio-prop').addEventListener('click', () => {
  showAmbient(muted ? 'The radio is off. A rare moment of peace.' : '♫ SHED FM: more bangers, less gardening.', 2100);
  playTone(380, .11, 'square', .035);
  playTone(580, .12, 'square', .03, .09);
});
$('#knott').addEventListener('click', () => {
  say(pick(['Concentrating. This is my concentrating face.', 'No, I cannot do the bins right now.', 'I have nearly got this. Probably.', 'The phone is absolutely tiny.']), '😤');
});
$('#ashtray').addEventListener('click', () => {
  $('#ashtray').classList.add('smoke-gone');
  animateKnott('wave-smoke');
  say('Knott waves away a little wisp and gets back to it.', '😶');
  setTimeout(() => $('#ashtray').classList.remove('smoke-gone'), 8000);
});

function refreshDifficultyButtons() {
  $$('.difficulty-btn').forEach(button => {
    const active = Number(button.dataset.difficulty) === difficulty;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  $('#level-caption').textContent = `${difficultyNames[difficulty]} · Puzzle ${puzzleNumber}`;
}
$$('.difficulty-btn').forEach(button => button.addEventListener('click', () => {
  difficulty = Number(button.dataset.difficulty);
  progress.difficulty = difficulty;
  refreshDifficultyButtons();
  persistProgress();
  newPuzzle();
}));

function persistProgress() {
  progress.score = score;
  progress.highScore = Math.max(progress.highScore, score);
  progress.difficulty = difficulty;
  try { localStorage.setItem('shedoku', JSON.stringify(progress)); } catch { /* The game still works when storage is unavailable. */ }
}
function refreshMetrics() {
  $('#time').textContent = fmtTime(isPlaying ? Math.floor((performance.now() - startedAt) / 1000) : Math.floor(elapsedTime));
  $('#score').textContent = String(score);
  $('#high-score').textContent = String(progress.highScore);
  $('#completed').textContent = String(progress.done);
  $('#scene-done').textContent = String(progress.done);
  $('#best-time').textContent = progress.best === null ? '—' : fmtTime(progress.best);
  $('#scene-best').textContent = progress.best === null ? '—' : fmtTime(progress.best);
  $('#level-caption').textContent = `${difficultyNames[difficulty]} · Puzzle ${puzzleNumber}`;
}
function renderBoard() {
  const selectedRow = selected < 0 ? -1 : Math.floor(selected / 9);
  const selectedCol = selected < 0 ? -1 : selected % 9;
  const selectedValue = selected < 0 ? 0 : board[selected];
  cells.forEach((cell, index) => {
    const row = Math.floor(index / 9);
    const col = index % 9;
    const value = board[index];
    cell.textContent = value ? String(value) : '';
    cell.classList.toggle('given', Boolean(givens[index]));
    cell.classList.toggle('related', selected >= 0 && (row === selectedRow || col === selectedCol || (Math.floor(row / 3) === Math.floor(selectedRow / 3) && Math.floor(col / 3) === Math.floor(selectedCol / 3))));
    cell.classList.toggle('same-number', Boolean(selectedValue && value === selectedValue && index !== selected));
    cell.classList.toggle('selected', index === selected);
    cell.classList.toggle('correct-entry', Boolean(value && !givens[index] && value === solution[index]));
    cell.classList.toggle('wrong-entry', Boolean(value && !givens[index] && value !== solution[index]));
    cell.setAttribute('aria-label', `Row ${row + 1}, column ${col + 1}${value ? `, ${givens[index] ? 'given' : 'entered'} ${value}` : ', blank'}${index === selected ? ', selected' : ''}`);
    cell.setAttribute('aria-selected', String(index === selected));
  });
  refreshMetrics();
}
function selectCell(index) {
  selected = index;
  renderBoard();
  if (!givens[index]) cells[index].focus({ preventScroll: true });
}
function enterNumber(number) {
  if (!isPlaying || selected < 0 || givens[selected]) {
    if (selected < 0) setStatus('Pick an empty square first, Knott.');
    return;
  }
  const oldValue = board[selected];
  if (number === 0) {
    board[selected] = 0;
    renderBoard();
    setStatus('Cleared. A fresh start, like the shed never happened.');
    return;
  }
  if (oldValue === number) return;
  const wasCorrect = oldValue === solution[selected];
  board[selected] = number;
  if (number === solution[selected]) {
    if (!wasCorrect) {
      score += 10 * (difficulty + 1) + Math.min(streak, 5) * 2;
      completedCells++;
      streak++;
    }
    setStatus(pick(rightLines), 'success');
    say(pick(rightLines), pick(['🙂', '😏', '🤓', '✨']));
    animateKnott('happy');
    happyFlourish();
    if (streak >= 3) {
      $('#streak-label').textContent = `${streak} in a row! The beat is picking up.`;
      syncMusic();
    } else {
      $('#streak-label').textContent = 'Lovely stuff, Knott.';
    }
    if (Math.random() < .08) {
      $('#ashtray').classList.add('smoke-gone');
      animateKnott('wave-smoke');
      setTimeout(() => $('#ashtray').classList.remove('smoke-gone'), 6500);
    }
  } else {
    mistakes++;
    streak = 0;
    score = Math.max(0, score - 5 * (difficulty + 1));
    $('#streak-label').textContent = mistakes ? `${mistakes} ${mistakes === 1 ? 'blunder' : 'blunders'} · still in the game` : 'Steady on.';
    setStatus(`${pick(wrongLines)} The red number can be changed.`, 'wrong');
    say(pick(wrongLines), pick(['😑', '😖', '🙄', '💢']));
    animateKnott('grumpy');
    playWrongSound();
    if (streak >= 4) syncMusic();
  }
  persistProgress();
  renderBoard();
  if (board.every((value, index) => value === solution[index])) finishPuzzle();
}
function finishPuzzle() {
  const seconds = (performance.now() - startedAt) / 1000;
  elapsedTime = seconds;
  isPlaying = false;
  const bonus = Math.max(0, Math.round((difficulty + 1) * 900 - seconds * 2));
  score += bonus;
  progress.done++;
  progress.best = progress.best === null ? seconds : Math.min(progress.best, seconds);
  progress.highScore = Math.max(progress.highScore, score);
  puzzleNumber = progress.done + 1;
  difficulty = Math.min(3, difficulty + 1);
  setStatus(`SOLVED in ${fmtTime(seconds)}! +${bonus} bonus. Go on, Knott!`, 'success');
  $('#streak-label').textContent = 'Mum! I actually did something useful!';
  say("Mum! I actually did something useful!", '😎');
  animateKnott('party');
  danceSting();
  persistProgress();
  refreshDifficultyButtons();
  refreshMetrics();
  setTimeout(() => {
    if (!isPlaying) $('#new-game').classList.add('celebrate-button');
  }, 150);
}
function newPuzzle() {
  const generated = generatePuzzle(blankTargets[difficulty]);
  solution = generated.solution;
  board = generated.puzzle.slice();
  givens = board.map(value => value !== 0);
  selected = -1;
  completedCells = 0;
  mistakes = 0;
  streak = 0;
  elapsedTime = 0;
  startedAt = performance.now();
  isPlaying = true;
  $('#new-game').classList.remove('celebrate-button');
  $('#streak-label').textContent = 'Ready when you are, Knott.';
  setStatus(`${difficultyNames[difficulty]} puzzle: ${board.filter(value => value === 0).length} empty squares.`, 'normal');
  refreshDifficultyButtons();
  persistProgress();
  renderBoard();
  syncMusic();
}
$('#new-game').addEventListener('click', newPuzzle);

const distractionLines = [
  ['Still playing Sudoku, Shrek?', 'Knott: I am literally in the middle of a row.'],
  ['Just put a seven there, Shrek. Trust me.', 'Knott: That is not how Sudoku works!'],
  ['Mum says the shed needs a tidy. Again.', 'Knott: Tell Mum I’m on a very important puzzle.'],
  ['Finish this before I come back, then, Shrek.', 'Knott: I’ve got… some of it under control.'],
  ['Is this the fun phone game with all the little squares?', 'Knott: It’s a puzzle. There are rules. Sort of.'],
  ['That one looks like a five. I have excellent instincts.', 'Knott: You have excellent confidence, I’ll give you that.']
];
let sisterVisible = false;
function dismissSister() {
  if (!sisterVisible) return;
  sisterVisible = false;
  clearTimeout(sisterTimeout);
  $('#distraction-card').classList.remove('visible');
  $('#sister-entry').classList.add('walk-out');
  setTimeout(() => {
    $('#sister-entry').classList.remove('visible', 'walk-out');
  }, 700);
}
function showSister() {
  if (sisterVisible) return;
  sisterVisible = true;
  const [line, reply] = pick(distractionLines);
  const outfit = Math.floor(Math.random() * 4);
  const image = $('#sister-image');
  image.classList.remove('outfit-1', 'outfit-2', 'outfit-3');
  if (outfit) image.classList.add(`outfit-${outfit}`);
  $('#sister-line').textContent = line;
  $('#knott-reply').textContent = reply;
  $('#sister-entry').classList.add('visible');
  $('#distraction-card').classList.add('visible');
  $('#sudoku-grid').classList.remove('wobble');
  void $('#sudoku-grid').offsetWidth;
  $('#sudoku-grid').classList.add('wobble');
  say(line);
  danceSting();
  sisterTimeout = setTimeout(dismissSister, 6500);
}
$('#dismiss-distraction').addEventListener('click', dismissSister);
$('#sister-entry').addEventListener('click', () => {
  say('What? I’m helping. Put a seven there.', '😉');
  $('#sudoku-grid').classList.remove('wobble');
  void $('#sudoku-grid').offsetWidth;
  $('#sudoku-grid').classList.add('wobble');
});

function runRandomEvent() {
  const roll = Math.random();
  if (roll < .24) {
    showSister();
  } else if (roll < .42) {
    setTemporaryToast($('#mum-toast'), pick(['KNOTT! The bins are still out!', 'KNOTT! Your tea is getting cold!', 'Has anybody seen the good scissors?', 'KNOTT! I can hear that radio!']), 2600);
    say('I heard that, Mum!');
  } else if (roll < .57) {
    const mouse = $('#mouse-run');
    mouse.hidden = false;
    mouse.style.animation = 'none';
    void mouse.offsetWidth;
    mouse.style.animation = '';
    setTimeout(() => { mouse.hidden = true; }, 2900);
    showAmbient('A mouse just legged it past the compost.', 2100);
  } else if (roll < .69) {
    shed.classList.add('scene-rain-heavy');
    showAmbient('The rain has started absolutely hammering down.', 2500);
    setTimeout(() => shed.classList.remove('scene-rain-heavy'), 3500);
  } else if (roll < .79) {
    const cat = $('#door-cat');
    cat.hidden = false;
    cat.style.animation = 'none';
    void cat.offsetWidth;
    cat.style.animation = '';
    showAmbient('A garden cat has come to judge your technique.', 2200);
    setTimeout(() => { cat.hidden = true; }, 4200);
  } else if (roll < .88) {
    shed.classList.add('lights-flicker');
    setTimeout(() => shed.classList.remove('lights-flicker'), 800);
    showAmbient('The shed light flickers. Probably the wiring.', 2100);
  } else if (roll < .95) {
    wobbleProp($('#tools'));
    showAmbient('A garden tool falls over. Nobody saw a thing.', 2200);
  } else {
    $('#phone-note').textContent = pick(['MUM: get the washing in!', 'Battery: 12% · Sudoku priority: high', 'New notification: still raining.', 'Unknown number: probably the allotment.']);
    $('#phone-note').classList.add('visible');
    setTimeout(() => $('#phone-note').classList.remove('visible'), 3000);
    showAmbient('The phone has made an unnecessary noise.', 1800);
  }
  eventTimeout = setTimeout(runRandomEvent, 18000 + Math.random() * 17000);
}
function occasionalSmokeWave() {
  if (Math.random() < .62) {
    $('#ashtray').classList.add('smoke-gone');
    animateKnott('wave-smoke');
    setTimeout(() => $('#ashtray').classList.remove('smoke-gone'), 7000);
  }
  setTimeout(occasionalSmokeWave, 28000 + Math.random() * 22000);
}
eventTimeout = setTimeout(runRandomEvent, 17000 + Math.random() * 9000);
setTimeout(occasionalSmokeWave, 26000 + Math.random() * 13000);

function moveSelection(key) {
  if (selected < 0) {
    selectCell(40);
    return;
  }
  let row = Math.floor(selected / 9);
  let col = selected % 9;
  if (key === 'ArrowUp') row = Math.max(0, row - 1);
  if (key === 'ArrowDown') row = Math.min(8, row + 1);
  if (key === 'ArrowLeft') col = Math.max(0, col - 1);
  if (key === 'ArrowRight') col = Math.min(8, col + 1);
  selectCell(row * 9 + col);
}
window.addEventListener('keydown', event => {
  if (event.repeat) return;
  const target = event.target;
  const isRange = target instanceof HTMLInputElement;
  if (isRange) return;
  if (/^[1-9]$/.test(event.key)) {
    event.preventDefault();
    enterNumber(Number(event.key));
  } else if (event.key === 'Backspace' || event.key === 'Delete' || event.key === '0') {
    event.preventDefault();
    enterNumber(0);
  } else if (event.key.startsWith('Arrow')) {
    event.preventDefault();
    moveSelection(event.key);
  } else if (event.key.toLowerCase() === 'm') {
    muted = !muted;
    $('#mute-button').textContent = muted ? 'SOUND OFF' : 'SOUND ON';
    $('#mute-button').setAttribute('aria-pressed', String(muted));
    syncMusic();
  }
});

setInterval(() => {
  if (isPlaying) refreshMetrics();
}, 250);
refreshDifficultyButtons();
newPuzzle();
