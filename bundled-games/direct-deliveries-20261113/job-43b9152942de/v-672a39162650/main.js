// BirthdayTale: The Quest for the Lost Presents
// A cozy, original birthday RPG built for a crisp 640x480 canvas.
const W = 640;
const H = 480;
const TILE = 32;
const GIFT_CLUES = [
    'Present #1: Look inside the living room behind the pillows!',
    'Present #2: Look in the cupboards!',
    'Present #3: Hidden behind the kitchen door!',
    'Present #4: Where we sleep, cuddle, and share our sweetest moments!',
];

const canvas = document.createElement('canvas');
canvas.width = W;
canvas.height = H;
canvas.setAttribute('aria-label', 'BirthdayTale game canvas');
canvas.tabIndex = 0;
document.getElementById('game-container').appendChild(canvas);
const ctx = canvas.getContext('2d', { alpha: false });
ctx.imageSmoothingEnabled = false;

function resizeCanvas() {
    const scale = Math.min(window.innerWidth / W, window.innerHeight / H);
    canvas.style.width = `${Math.floor(W * scale)}px`;
    canvas.style.height = `${Math.floor(H * scale)}px`;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Personal character sheets supplied for this birthday adventure.
function loadImage(path) {
    const img = new Image();
    img.src = path;
    return img;
}
function cutSprite(img, sx, sy, sw, sh) {
    const out = document.createElement('canvas');
    out.width = 72;
    out.height = 96;
    const c = out.getContext('2d');
    c.imageSmoothingEnabled = false;
    if (img.complete && img.naturalWidth) c.drawImage(img, sx, sy, sw, sh, 4, 2, 64, 88);
    const pixels = c.getImageData(0, 0, out.width, out.height);
    for (let i = 0; i < pixels.data.length; i += 4) {
        const r = pixels.data[i];
        const g = pixels.data[i + 1];
        const b = pixels.data[i + 2];
        if (r > 242 && g > 242 && b > 242) pixels.data[i + 3] = 0;
    }
    c.putImageData(pixels, 0, 0);
    return out;
}
const husbandSheet = loadImage('assets/gemini_generated_image_ib4or0ib4or0ib4o1.jpeg');
const wifeSheet = loadImage('assets/gemini_generated_image_lbuy4clbuy4clbuy1.jpeg');
const art = {
    husband: null,
    wife: null,
};
// The smaller standing characters are cropped from the right side of each supplied sheet.
husbandSheet.onload = () => { art.husband = cutSprite(husbandSheet, 680, 350, 195, 292); };
wifeSheet.onload = () => { art.wife = cutSprite(wifeSheet, 675, 360, 202, 282); };

// ---------- Audio ----------
const music = new Audio('assets/audio/partyville-memory-theme.mp3');
music.loop = true;
music.volume = 0.24;
const hurtSound = new Audio('assets/audio/hurt.mp3');
const jingleSound = new Audio('assets/audio/jingle.mp3');
let muted = false;
let audioContext = null;
function unlockAudio() {
    if (!audioContext) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) audioContext = new AudioContextClass();
    }
    if (audioContext?.state === 'suspended') audioContext.resume().catch(() => {});
    if (!muted && music.paused) music.play().catch(() => {});
}
function playClip(audio) {
    if (muted) return;
    audio.currentTime = 0;
    audio.play().catch(() => {});
}
function beep(frequency = 480, duration = 0.045, type = 'square', volume = 0.045) {
    if (!audioContext || muted) return;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, audioContext.currentTime);
    gain.gain.setValueAtTime(volume, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);
    osc.connect(gain).connect(audioContext.destination);
    osc.start();
    osc.stop(audioContext.currentTime + duration);
}

// ---------- Input ----------
const keys = Object.create(null);
const pressed = Object.create(null);
const padHeld = { left: false, right: false, up: false, down: false, cancel: false };
const padWas = { confirm: false, cancel: false, start: false };
function pollGamepad() {
    let gamepad = null;
    try { gamepad = navigator.getGamepads?.()[0] || null; } catch (_) { gamepad = null; }
    const buttonDown = (index) => Boolean(gamepad?.buttons?.[index]?.pressed);
    const axes = gamepad?.axes || [];
    padHeld.left = buttonDown(14) || (axes[0] ?? 0) < -0.45;
    padHeld.right = buttonDown(15) || (axes[0] ?? 0) > 0.45;
    padHeld.up = buttonDown(12) || (axes[1] ?? 0) < -0.45;
    padHeld.down = buttonDown(13) || (axes[1] ?? 0) > 0.45;
    padHeld.cancel = buttonDown(1);
    const confirm = buttonDown(0);
    const cancel = buttonDown(1);
    const start = buttonDown(9);
    if (confirm && !padWas.confirm) pressed.z = true;
    if (cancel && !padWas.cancel) pressed.x = true;
    if (start && !padWas.start) pressed.c = true;
    padWas.confirm = confirm;
    padWas.cancel = cancel;
    padWas.start = start;
}
function keyName(key) {
    if (key === ' ') return 'space';
    return key.toLowerCase();
}
function keyboardKey(event) {
    const byCode = {
        ArrowUp: 'arrowup', ArrowDown: 'arrowdown', ArrowLeft: 'arrowleft', ArrowRight: 'arrowright',
        KeyW: 'w', KeyA: 'a', KeyS: 's', KeyD: 'd', KeyZ: 'z', KeyX: 'x', KeyC: 'c', KeyM: 'm',
        Enter: 'enter', Space: 'space', ShiftLeft: 'shift', ShiftRight: 'shift', Escape: 'escape', Tab: 'tab',
    };
    return byCode[event.code] || keyName(event.key);
}
const browserControlKeys = new Set([
    'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd',
    'z', 'enter', 'space', 'x', 'shift', 'c', 'escape', 'tab', 'm',
]);
document.addEventListener('keydown', (event) => {
    unlockAudio();
    const key = keyboardKey(event);
    if (!keys[key]) pressed[key] = true;
    keys[key] = true;
    if (browserControlKeys.has(key)) event.preventDefault();
}, { capture: true });
document.addEventListener('keyup', (event) => { keys[keyboardKey(event)] = false; }, { capture: true });
function clearHeldKeys() {
    for (const key in keys) keys[key] = false;
    for (const key in pressed) delete pressed[key];
}
window.addEventListener('blur', clearHeldKeys);
document.addEventListener('visibilitychange', () => { if (document.hidden) clearHeldKeys(); });
canvas.focus({ preventScroll: true });
const confirmPressed = () => pressed.z || pressed.enter || pressed.space;
const cancelPressed = () => pressed.x || pressed.shift;
const cancelHeld = () => keys.x || keys.shift || padHeld.cancel;
const pausePressed = () => pressed.c || pressed.escape;
const moveAxis = () => ({
    x: (keys.arrowright || keys.d || padHeld.right ? 1 : 0) - (keys.arrowleft || keys.a || padHeld.left ? 1 : 0),
    y: (keys.arrowdown || keys.s || padHeld.down ? 1 : 0) - (keys.arrowup || keys.w || padHeld.up ? 1 : 0),
});

function pointerPoint(event) {
    const rect = canvas.getBoundingClientRect();
    return { x: (event.clientX - rect.left) * W / rect.width, y: (event.clientY - rect.top) * H / rect.height };
}
canvas.addEventListener('pointerdown', (event) => {
    unlockAudio();
    canvas.focus();
    const point = pointerPoint(event);
    handlePointer(point.x, point.y);
});

// ---------- Game data ----------
const state = {
    mode: 'title', room: 0, dialog: null, battle: null, previousMode: 'world',
    latestClearedRoom: 0, pauseSelection: 0, gameOverSelection: 0,
    hp: 20, maxHp: 20, gifts: 0, giftFlags: [false, false, false, false], level: 1,
    inventory: [
        { name: 'Pizza Slice', heal: 10, count: 1, color: '#ed7452' },
        { name: 'Hot Chocolate', heal: 12, count: 1, color: '#a56741' },
        { name: 'Orange Juice', heal: 15, count: 1, color: '#ffb534' },
        { name: 'Biscuit', heal: 20, count: 1, color: '#d9b77b' },
    ],
    prologueReady: false, prologueSpoken: false,
    baskets: [
        { color: 'red', x: 5, y: 10, plateX: 5, plateY: 5 },
        { color: 'blue', x: 9, y: 10, plateX: 9, plateY: 5 },
        { color: 'yellow', x: 13, y: 10, plateX: 13, plateY: 5 },
    ],
    laundrySolved: false, petDefeated: false, petFriend: false, chest1: false,
    datePlatesSolved: false, wifeHold: false, waiterDefeated: false, cafeShortcut: false, chest2: false,
    junctions: [1, 0, 1], circuitSolved: false, golemDefeated: false, golemRepair: false, golemRepairNode: -1, chest3: false,
    wifeBattleComplete: false, chest4: false,
    crt: true, idleFrames: 0, complimentIndex: 0, complimentBubble: '', complimentTime: 0,
    time: 0, endTime: 0, toast: '', toastTime: 0,
};
const player = { x: 86, y: 382, dx: 0, dy: -1, walk: 0 };
const companion = { x: 56, y: 382, dx: 1, dy: 0, walk: 0, walking: false, trail: [], hearts: [], reaction: '', reactionTime: 0, celebrateTime: 0 };
for (let i = 0; i < 15; i++) companion.trail.push({ x: player.x, y: player.y });

const rooms = [
    { name: 'THE MONOCHROME MORNING', theme: 'home' },
    { name: 'THE RUINED LIVING ROOM', theme: 'living' },
    { name: 'THE FROSTY DATE CAFÉ', theme: 'snow' },
    { name: 'THE HECTIC TECH JUNGLE', theme: 'tech' },
    { name: 'THE HEART OF THE UNDERGROUND', theme: 'stars' },
];
const landmarkNames = ['HOME', 'LIVING ROOM', 'DATE CAFÉ', 'TECH JUNGLE', 'STAR BRIDGE'];
const encounterData = {
    pet: {
        name: 'Pet Sentry', kind: 'pet', hp: 4, atk: 2,
        intro: '* The Pet Sentry blocks the path, tail wagging furiously!',
        bubbles: ['SQUEAK! SQUEAK!', 'The tail is a blur!', 'A rubber duck takes flight!'],
    },
    waiter: {
        name: 'Memory Keeper', kind: 'waiter', hp: 5, atk: 2,
        intro: '* The Memory Keeper demands relationship trivia validation!',
        bubbles: ['Halt! Answer the sacred history of your relationship!', 'Where did we meet?', 'What is your favorite cozy drink?'],
    },
    golem: {
        name: 'Flat-Pack Golem', kind: 'golem', hp: 5, atk: 3,
        intro: '* A wild Unassembled Desk threatens your sanity!',
        bubbles: ['STEP 1: identify the screws.', 'The instructions are upside-down!', 'Some bolts are left over...'],
    },
    wife: {
        name: 'WIFE', kind: 'wife', hp: 99, atk: 0,
        intro: '* WIFE is overflowing with love and determination.',
        bubbles: ['Ready for the final round?', 'BEST HUSBAND EVER!', 'HAPPY BIRTHDAY!'],
    },
};
const basketColors = { red: '#ed5364', blue: '#55b8e8', yellow: '#f5c94f' };

// ---------- Canvas utilities ----------
function text(str, x, y, size = 16, color = '#fff', align = 'left') {
    ctx.fillStyle = color;
    ctx.font = `${size}px "Courier New", monospace`;
    ctx.textAlign = align;
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(str, x, y);
}
function pixelText(str, x, y, size = 14, color = '#fff', align = 'left') {
    text(str, Math.round(x), Math.round(y), size, color, align);
}
function wrapLines(str, maxChars) {
    const result = [];
    for (const paragraph of String(str).split('\n')) {
        let line = '';
        for (const word of paragraph.split(' ')) {
            if (line && (line + ' ' + word).length > maxChars) {
                result.push(line);
                line = word;
            } else line += (line ? ' ' : '') + word;
        }
        result.push(line);
    }
    return result;
}
function wrapTextToWidth(str, maxWidth, fontSize = 15) {
    const previousFont = ctx.font;
    ctx.font = `${fontSize}px "Courier New", monospace`;
    const lines = [];
    for (const paragraph of String(str).split('\n')) {
        const words = paragraph.trim().split(/\s+/).filter(Boolean);
        let line = '';
        for (const word of words) {
            const candidate = line ? `${line} ${word}` : word;
            if (ctx.measureText(candidate).width <= maxWidth) {
                line = candidate;
                continue;
            }
            if (line) { lines.push(line); line = ''; }
            if (ctx.measureText(word).width <= maxWidth) {
                line = word;
                continue;
            }
            let piece = '';
            for (const character of word) {
                if (piece && ctx.measureText(piece + character).width > maxWidth) {
                    lines.push(piece);
                    piece = character;
                } else piece += character;
            }
            line = piece;
        }
        lines.push(line);
    }
    ctx.font = previousFont;
    return lines;
}
function panel(x, y, w, h, fill = '#000', border = '#fff', thick = 4) {
    ctx.fillStyle = fill;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = border;
    ctx.lineWidth = thick;
    ctx.strokeRect(x + thick / 2, y + thick / 2, w - thick, h - thick);
}
function drawHeart(x, y, color = '#ff274b', scale = 1) {
    const s = scale;
    ctx.fillStyle = color;
    ctx.fillRect(x - 7 * s, y - 5 * s, 5 * s, 5 * s);
    ctx.fillRect(x + 2 * s, y - 5 * s, 5 * s, 5 * s);
    ctx.fillRect(x - 7 * s, y - 2 * s, 14 * s, 4 * s);
    ctx.fillRect(x - 5 * s, y + 2 * s, 10 * s, 3 * s);
    ctx.fillRect(x - 2 * s, y + 5 * s, 4 * s, 3 * s);
}
function drawPixelPerson(image, x, y, w = 24, h = 32, fallback = '#e6d5bb') {
    if (image) ctx.drawImage(image, Math.round(x - w / 2), Math.round(y - h), w, h);
    else {
        ctx.fillStyle = '#382744'; ctx.fillRect(x - 8, y - h, 16, 13);
        ctx.fillStyle = fallback; ctx.fillRect(x - 6, y - h + 2, 12, 10);
        ctx.fillStyle = '#272333'; ctx.fillRect(x - 8, y - h + 13, 16, 12);
        ctx.fillStyle = '#faf1d7'; ctx.fillRect(x - 8, y - 5, 6, 5); ctx.fillRect(x + 2, y - 5, 6, 5);
    }
}
function drawGiftIcon(x, y, color = '#ff6689', size = 20) {
    const p = size / 10;
    const px = (gx, gy, gw, gh, fill) => {
        ctx.fillStyle = fill;
        ctx.fillRect(Math.round(x + gx * p), Math.round(y + gy * p), Math.ceil(gw * p), Math.ceil(gh * p));
    };
    px(1, 9, 8, 1, '#30213a');
    px(1, 5, 8, 4, '#30213a');
    px(1, 6, 8, 3, color);
    px(0, 4, 10, 2, '#30213a');
    px(1, 4, 8, 1, '#ffe590');
    px(4, 4, 2, 5, '#30213a');
    px(4, 5, 2, 4, '#fff0a6');
    px(2, 2, 2, 1, '#30213a'); px(6, 2, 2, 1, '#30213a');
    px(1, 3, 3, 1, '#30213a'); px(6, 3, 3, 1, '#30213a');
    px(2, 2, 2, 1, '#fff0a6'); px(6, 2, 2, 1, '#fff0a6');
    px(4, 2, 2, 2, '#30213a'); px(4, 3, 2, 1, '#ffe590');
    px(2, 6, 1, 2, 'rgba(255,255,255,.42)');
}
function drawItemIcon(name, x, y, size = 20) {
    const designs = {
        'Pizza Slice': {
            rows: ['..........','..kkkkkk..','..kcccck..','..kcwwwk..','...kcck...','...kcck...','....kk....','....kk....','.....k....','..........'],
            colors: { k: '#56333b', c: '#f2bc5a', w: '#fff0a2' },
        },
        'Hot Chocolate': {
            rows: ['...kkkk...','..kwwwwk..','..kccckkk.','..kccck..k','..kccckkk.','..kccck..k','..kccckkk.','..kccck..k','...kkkkkk.','..........'],
            colors: { k: '#392c3b', w: '#f7ddad', c: '#a96746' },
        },
        'Orange Juice': {
            rows: ['....kk....','....kk....','...kkkk...','..kwwwwk..','..koooook.','..koooook.','..koooook.','..koooook.','...kkkkk..','..........'],
            colors: { k: '#44606a', w: '#d8ffff', o: '#ffad32' },
        },
        Biscuit: {
            rows: ['..........','...kkkk...','..kbbbbk..','.kbbbbbbk.','.kbybbybk.','.kbbbbbbk.','.kbbbybbk.','..kbbbbk..','...kkkk...','..........'],
            colors: { k: '#654638', b: '#d9b77b', y: '#f1dba2' },
        },
    };
    const design = designs[name];
    if (!design) return;
    const cell = size / 10;
    design.rows.forEach((row, gy) => {
        for (let gx = 0; gx < row.length; gx++) {
            const color = design.colors[row[gx]];
            if (!color) continue;
            ctx.fillStyle = color;
            ctx.fillRect(Math.round(x + gx * cell), Math.round(y + gy * cell), Math.ceil(cell), Math.ceil(cell));
        }
    });
}
function drawScanlines() {
    if (!state.crt) return;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    for (let y = 1; y < H; y += 4) ctx.fillRect(0, y, W, 1);
}
function setToast(message) {
    state.toast = message;
    state.toastTime = 150;
}
function triggerCompanionReaction(line, level = 1) {
    companion.reaction = line;
    companion.reactionTime = 220;
    companion.celebrateTime = 84;
    const colors = ['#ff8db3', '#ffd76e', '#fff2f7', '#dfa0ff'];
    const count = 3 + Math.min(4, level);
    for (let i = 0; i < count; i++) {
        const spread = i - (count - 1) / 2;
        companion.hearts.push({
            x: companion.x + spread * 8,
            y: companion.y - 34 - (i % 2) * 5,
            life: 58 + (i % 3) * 6,
            rise: 0.6 + (i % 3) * 0.14,
            drift: spread * 0.035,
            color: colors[i % colors.length],
            size: 0.68 + (i % 2) * 0.12,
        });
    }
    beep(760 + Math.min(4, level) * 35, 0.12, 'triangle', 0.05);
}

// ---------- Dialogue ----------
function startDialogue(lines, onDone = null) {
    const sourcePages = Array.isArray(lines) ? lines : [lines];
    const pages = [];
    for (const page of sourcePages) {
        const wrapped = wrapTextToWidth(page, 540, 15);
        for (let i = 0; i < wrapped.length; i += 4) pages.push(wrapped.slice(i, i + 4).join('\n'));
    }
    state.dialog = { pages, index: 0, chars: 0, onDone, returnMode: state.mode, fast: false };
    state.mode = 'dialog';
}
function finishDialogue() {
    const d = state.dialog;
    state.mode = d.returnMode;
    state.dialog = null;
    if (d.onDone) d.onDone();
}
function updateDialogue() {
    const d = state.dialog;
    if (!d) return;
    const current = d.pages[d.index] || '';
    const speed = cancelHeld() ? 4 : 0.72;
    if (d.chars < current.length) {
        const before = Math.floor(d.chars);
        d.chars = Math.min(current.length, d.chars + speed);
        const now = Math.floor(d.chars);
        if (now > before && current[now - 1] !== ' ' && now % 3 === 0) beep(430 + Math.random() * 90, 0.025, 'square', 0.025);
        if (confirmPressed() || cancelPressed()) d.chars = current.length;
    } else if (confirmPressed() || cancelPressed()) {
        beep(680, 0.04);
        d.index++;
        d.chars = 0;
        if (d.index >= d.pages.length) finishDialogue();
    }
}
function drawDialogue() {
    const d = state.dialog;
    if (!d) return;
    const isBattle = d.returnMode === 'battle';
    const boxY = isBattle ? 218 : 330;
    const boxH = isBattle ? 118 : 130;
    panel(24, boxY, W - 48, boxH, '#050509', '#fff', 4);
    const current = (d.pages[d.index] || '').slice(0, Math.floor(d.chars));
    const lines = wrapTextToWidth(current, W - 96, 15).slice(0, 4);
    ctx.save();
    ctx.beginPath();
    ctx.rect(34, boxY + 12, W - 68, boxH - 36);
    ctx.clip();
    lines.forEach((line, i) => pixelText(line, W / 2, boxY + 31 + i * (isBattle ? 18 : 20), 15, '#fff9ed', 'center'));
    ctx.restore();
    if (d.chars >= (d.pages[d.index] || '').length && Math.floor(state.time / 22) % 2 === 0) {
        pixelText('▼', W - 48, boxY + boxH - 14, 13, '#ffdb57', 'center');
    }
    pixelText('Z / ENTER: NEXT      X: FAST TEXT', W / 2, boxY + boxH - 12, 10, '#b5b2c0', 'center');
}

// ---------- Room layout and collisions ----------
function dist(x1, y1, x2, y2) { return Math.hypot(x1 - x2, y1 - y2); }
function closeTo(x, y, radius) { return dist(player.x, player.y, x, y) <= radius; }
function roomColliders() {
    let blocks = [];
    if (state.room === 0) blocks.push([38, 82, 104, 73], [166, 115, 84, 54], [425, 125, 142, 48], [270, 140, 108, 56]);
    if (state.room === 1) {
        blocks.push([230, 72, 182, 65]);
        if (!state.laundrySolved) blocks.push([492, 106, 48, 60]);
        if (!state.laundrySolved) blocks.push(...state.baskets.map(b => [b.x * TILE + 3, b.y * TILE + 3, 26, 26]));
    }
    if (state.room === 2) blocks.push([80, 92, 48, 64], [180, 80, 48, 64], [490, 105, 52, 72]);
    if (state.room === 3) {
        blocks.push([86, 102, 54, 68], [486, 132, 74, 50]);
        if (!state.circuitSolved) blocks.push([505, 74, 48, 45]);
    }
    if (state.room === 4) {
        // The star bridge is the only safe walking lane.
        blocks.push([0, 0, W, 155], [0, 322, W, H - 322]);
    }
    if (state.room === 1 && !state.laundrySolved) {
        blocks = blocks.filter((b) => !(b[0] >= 150 && b[0] < 470 && b[1] > 250));
        // Baskets are checked separately so they can be pushed.
    }
    return blocks;
}
function inExitDoorway(y) { return y > 380 && y < 458; }
function collidesAt(x, y) {
    const r = 8;
    if (x < 12 || y < 12 || y > H - 12) return true;
    if (x > W - 12 && !(state.room > 0 && state.room < 4 && inExitDoorway(y))) return true;
    for (const [bx, by, bw, bh] of roomColliders()) {
        if (x + r > bx && x - r < bx + bw && y + r > by && y - r < by + bh) return true;
    }
    if (state.room === 1 && !state.laundrySolved && Math.abs(x - 516) < 30 && y < 180) return true;
    if (state.room === 1) {
        for (const basket of state.baskets) {
            if (x + r > basket.x * TILE && x - r < basket.x * TILE + TILE && y + r > basket.y * TILE && y - r < basket.y * TILE + TILE) return true;
        }
    }
    return false;
}
function moveCompanion() {
    const oldX = companion.x;
    const oldY = companion.y;
    const movement = moveAxis();
    const playerIsMoving = movement.x !== 0 || movement.y !== 0;
    companion.trail.unshift({ x: player.x, y: player.y });
    companion.trail.length = 15;
    if (state.room === 2 && state.datePlatesSolved && state.wifeHold) {
        companion.x += (250 - companion.x) * 0.22;
        companion.y += (272 - companion.y) * 0.22;
    } else if (playerIsMoving) {
        const target = companion.trail[12] || { x: player.x - player.dx * TILE, y: player.y - player.dy * TILE };
        companion.x += (target.x - companion.x) * 0.45;
        companion.y += (target.y - companion.y) * 0.45;
    } else {
        // When he stops, let her settle shoulder-to-shoulder instead of merging into his trail.
        let side = player.dx < 0 ? 1 : -1;
        let targetX = player.x + side * 32;
        if (targetX < 20 || targetX > W - 20) targetX = player.x - side * 32;
        companion.x += (targetX - companion.x) * 0.45;
        companion.y += (player.y - companion.y) * 0.45;
    }
    if (Math.abs(player.dx) + Math.abs(player.dy) < 0.1) {
        const towardX = player.x - companion.x;
        const towardY = player.y - companion.y;
        if (Math.abs(towardX) > Math.abs(towardY)) companion.dx = Math.sign(towardX);
        else companion.dy = Math.sign(towardY);
    } else {
        companion.dx = player.dx;
        companion.dy = player.dy;
    }
    const moved = dist(oldX, oldY, companion.x, companion.y);
    companion.walking = moved > 0.12;
    if (companion.walking) companion.walk += moved * 0.14;
    if (moved > 0.1) state.idleFrames = 0;
}
function checkLaundry() {
    if (state.laundrySolved) return;
    const solved = state.baskets.every(b => b.x === b.plateX && b.y === b.plateY);
    if (solved) {
        state.laundrySolved = true;
        triggerCompanionReaction('WIFE: Every chore is better with you!', 1);
        beep(880, 0.2, 'triangle', 0.08);
        playClip(jingleSound);
        startDialogue(['* The three laundry baskets settle onto their matching plates!', '* WIFE: "You solved that so fast! Smart AND handsome!"', '* A gate clicks open. A present chest is waiting beyond it.']);
    }
}
function tryPushBasket(dx, dy) {
    if (state.room !== 1 || state.laundrySolved) return false;
    const dirLength = Math.hypot(dx, dy) || 1;
    const ux = dx / dirLength;
    const uy = dy / dirLength;
    const b = state.baskets.find(item => dist(player.x + ux * 18, player.y + uy * 18, item.x * TILE + 16, item.y * TILE + 16) < 17);
    if (!b) return false;
    const nx = b.x + Math.sign(ux);
    const ny = b.y + Math.sign(uy);
    if (nx < 1 || nx > 18 || ny < 1 || ny > 13) return true;
    if (state.baskets.some(other => other !== b && other.x === nx && other.y === ny)) return true;
    if (roomColliders().some(([x, y, w, h]) => nx * TILE < x + w && nx * TILE + TILE > x && ny * TILE < y + h && ny * TILE + TILE > y)) return true;
    b.x = nx;
    b.y = ny;
    beep(260, 0.035, 'square', 0.03);
    checkLaundry();
    return true;
}

// ---------- World interaction and story ----------
function beginGame() {
    state.mode = 'world';
    state.room = 0;
    state.hp = state.maxHp;
    state.prologueReady = false;
    state.prologueSpoken = false;
    startDialogue([
        '* It is a quiet, monochrome birthday morning.',
        '* Your presents have vanished into a birthday anomaly!',
        '* Walk with the arrow keys or WASD. Z talks; X lets you run.',
        '* Press TAB to view your journey map. C or ESC pauses.',
        '* Your wife is right beside you.'],
    );
}
function positionAtRoomEntrance(room) {
    if (room === 0) { player.x = 86; player.y = 382; }
    else if (room < 4) { player.x = 62; player.y = 388; }
    else { player.x = 78; player.y = 238; }
    player.dx = 1;
    player.dy = 0;
    companion.x = player.x - 30;
    companion.y = player.y;
    companion.trail = Array.from({ length: 15 }, () => ({ x: player.x, y: player.y }));
    state.idleFrames = 0;
}
function travelTo(room) {
    if (room > state.room) state.latestClearedRoom = Math.max(state.latestClearedRoom, state.room);
    state.room = room;
    positionAtRoomEntrance(room);
    beep(740, 0.12, 'triangle');
    const intro = {
        1: ['* A portal of confetti drops you into a familiar living room.', '* Three laundry baskets block a mysterious gate. The matching plates are upstairs.', '* Push each basket onto the plate of the same color.'],
        2: ['* Snow crunches beneath your shoes at the Frosty Date Café.', '* The Memory Keeper guards the next present. The café door opens with a Z press.'],
        3: ['* Neon vines wrap around the Hectic Tech Jungle.', '* Three junctions need reconnecting. Team up with the golem before finishing the circuit and it can repair one for you.'],
        4: ['* The stars make a bridge over a quiet, endless night.', '* Your wife is waiting at the far end. There is no danger here—only love.'],
    }[room];
    if (intro) startDialogue(intro);
}
function restartCurrentRoom() {
    const room = state.room;
    state.dialog = null;
    state.battle = null;
    if (room === 0) {
        state.prologueReady = false;
        state.prologueSpoken = false;
    } else if (room === 1) {
        state.baskets = [
            { color: 'red', x: 5, y: 10, plateX: 5, plateY: 5 },
            { color: 'blue', x: 9, y: 10, plateX: 9, plateY: 5 },
            { color: 'yellow', x: 13, y: 10, plateX: 13, plateY: 5 },
        ];
        state.laundrySolved = false;
        state.petDefeated = false;
        state.petFriend = false;
    } else if (room === 2) {
        state.datePlatesSolved = false;
        state.wifeHold = false;
        state.waiterDefeated = false;
        state.cafeShortcut = false;
    } else if (room === 3) {
        state.junctions = [1, 0, 1];
        state.circuitSolved = false;
        state.golemDefeated = false;
        state.golemRepair = false;
        state.golemRepairNode = -1;
    } else if (room === 4) {
        state.wifeBattleComplete = false;
    }
    state.hp = state.maxHp;
    state.previousMode = 'world';
    state.mode = 'world';
    positionAtRoomEntrance(room);
    setToast('Room reset. Your presents are safe.');
    beep(520, 0.1, 'triangle');
}
function returnToLatestClearedLandmark() {
    const destination = Math.max(0, Math.min(rooms.length - 1, state.latestClearedRoom));
    state.dialog = null;
    state.battle = null;
    state.hp = state.maxHp;
    state.room = destination;
    state.previousMode = 'world';
    state.mode = 'world';
    positionAtRoomEntrance(destination);
    setToast('Back at a cleared landmark. Presents are safe.');
    beep(520, 0.1, 'triangle');
}
function checkRoomTransitions() {
    if (state.room === 0 && state.prologueReady && closeTo(320, 218, 20)) {
        travelTo(1);
        return;
    }
    if (state.room === 1 && closeTo(603, 420, 27)) {
        if (state.chest1 && state.petDefeated && state.laundrySolved) travelTo(2);
        else startDialogue(['* The doorway to the café is still sealed.', `* Laundry puzzle: ${state.laundrySolved ? 'solved' : 'not solved'}.`, `* Pet Sentry: ${state.petDefeated ? 'calm' : 'still guarding'}.`, `* Present #1: ${state.chest1 ? 'collected' : 'in the chest'}.`]);
    }
    if (state.room === 2 && closeTo(603, 420, 27)) {
        const cafeRouteOpen = state.datePlatesSolved || state.cafeShortcut;
        if (state.chest2 && state.waiterDefeated && cafeRouteOpen) travelTo(3);
        else startDialogue(['* The next trail is beyond the café.', `* Matching date plates: ${state.datePlatesSolved ? 'active' : state.cafeShortcut ? 'bypassed by the service shortcut' : 'not active'}.`, `* Memory Keeper: ${state.waiterDefeated ? 'satisfied' : 'still quizzing'}.`, `* Present #2: ${state.chest2 ? 'collected' : 'in the café'}.`]);
    }
    if (state.room === 3 && closeTo(603, 420, 27)) {
        if (state.chest3 && state.golemDefeated && state.circuitSolved) travelTo(4);
        else startDialogue(['* A cable gate blocks the star bridge.', `* Cable matrix: ${state.circuitSolved ? 'connected' : state.golemRepair ? 'partly repaired' : 'disconnected'}.`, `* Flat-Pack Golem: ${state.golemDefeated ? 'assembled enough' : 'still in the way'}.`, `* Present #3: ${state.chest3 ? 'collected' : 'in the cabinet'}.`]);
    }
}
function startEncounter(key) {
    const template = encounterData[key];
    const battle = {
        key, enemy: template, hp: template.hp, canSpare: false, phase: 'flash',
        selected: 0, sub: 0, t: 0, attackX: 0, attackDir: 1, heart: { x: 320, y: 265 },
        bullets: [], invuln: 0, bubble: '', question: 0, rightAnswers: 0,
        love: 0, acted: new Set(), pacified: key === 'wife', lastDamage: 0, hitFlash: 0,
        actMercy: false, spared: false, didDamage: false,
        petAssistCharge: state.petFriend && key !== 'pet' ? 1 : 0,
        supportMessage: '', supportMessageTime: 0,
        encounterObject: key, runaway: false,
    };
    state.battle = battle;
    state.mode = 'battle';
    state.hp = Math.max(1, state.hp);
    beep(150, 0.28, 'sawtooth', 0.075);
}
function takeGift(number) {
    const key = `chest${number}`;
    if (state[key]) {
        startDialogue(['* The chest is empty now, but it still smells like a happy memory.']);
        return;
    }
    if (number === 1 && !state.laundrySolved) {
        startDialogue(['* The gate is locked. Match the laundry baskets to the floor plates first.']);
        return;
    }
    if (number === 1 && !state.petDefeated) {
        startDialogue(['* The Pet Sentry is keeping this chest company.']);
        return;
    }
    if (number === 2 && ((!state.datePlatesSolved && !state.cafeShortcut) || !state.waiterDefeated)) {
        startDialogue([state.cafeShortcut
            ? '* The café shortcut is open, but the Memory Keeper must still be satisfied.'
            : '* The café cabinet unlocks after the waiter quiz and either the date plates or the Memory Keeper’s shortcut.']);
        return;
    }
    if (number === 3 && (!state.circuitSolved || !state.golemDefeated)) {
        startDialogue(['* The present is behind the circuit gate. Reconnect the cable and calm the golem.']);
        return;
    }
    if (number === 4 && !state.wifeBattleComplete) {
        startDialogue(['* The golden chest appears after the final round.']);
        return;
    }
    state[key] = true;
    state.giftFlags[number - 1] = true;
    state.gifts = state.giftFlags.filter(Boolean).length;
    const giftReactions = [
        'WIFE: Our first treasure together!',
        'WIFE: Another favorite memory!',
        'WIFE: We make a pretty great team!',
        'WIFE: My favorite gift is this life with you.',
    ];
    triggerCompanionReaction(giftReactions[number - 1], number);
    playClip(jingleSound);
    beep(940, 0.16, 'triangle', 0.075);
    const chestText = {
        1: '* You found Present #1! WIFE: "You are my favorite cozy gift and the music to my soul."',
        2: '* You found Present #2! WIFE: "Did you have something to drink? Here is some hot chocolate to keep you cozy!"',
        3: '* You found Present #3! WIFE: "I know you have loved your favorite game and show since you were little, so I picked this just for you!"',
        4: '* You found the Golden Birthday Chest and a pack of warm biscuits! WIFE: "One last surprise is waiting in our room... you will find out soon!"',
    }[number];
    startDialogue([chestText, `* Presents gathered: ${state.gifts}/4.`], () => {
        if (number === 4) {
            state.mode = 'ending';
            state.endTime = 0;
            music.pause();
        }
    });
}
function handleWorldInteract() {
    if (state.room === 0) {
        if (closeTo(205, 138, 55)) {
            startDialogue(['* You check the wardrobe.', '* Empty... No presents here.']);
            return;
        }
        if (state.prologueReady && closeTo(320, 218, 48)) { travelTo(1); return; }
        if (closeTo(480, 196, 68) && !state.prologueSpoken) {
            state.prologueSpoken = true;
            startDialogue([
                '* WIFE: "Happy Birthday to my favorite human in the world!"',
                '* WIFE: "You look extra cute today, but oh no... A birthday anomaly has scattered your presents across our memories!"',
                '* WIFE: "Take your DETERMINATION and follow me, handsome!"',
                '* A purple portal sparkles into view in the middle of the room.',
            ], () => { state.prologueReady = true; playClip(jingleSound); });
            return;
        }
        if (closeTo(480, 196, 70)) {
            startDialogue(['* WIFE: "The portal is waiting, birthday boy!"']);
            return;
        }
        startDialogue(['* The house is quiet, cozy, and very suspiciously present-free.']);
        return;
    }
    if (state.room === 1) {
        if (closeTo(520, 136, 48)) {
            if (state.laundrySolved) takeGift(1);
            else startDialogue(['* Three colorful baskets and three matching plates.', '* Push each basket north onto its matching plate.']);
            return;
        }
        if (closeTo(595, 420, 36)) { checkRoomTransitions(); return; }
        startDialogue(['* The living room is full of cushions, plants, and unfinished chores.']);
        return;
    }
    if (state.room === 2) {
        if (closeTo(520, 174, 55)) {
            if (!state.waiterDefeated) startEncounter('waiter');
            else startDialogue(['MEMORY KEEPER: "Your answers were impeccable. The café is yours."']);
            return;
        }
        if (closeTo(520, 325, 48)) { takeGift(2); return; }
        if (closeTo(272, 272, 48)) {
            const onA = closeTo(224, 272, 24);
            if (onA && !state.datePlatesSolved) {
                state.wifeHold = true;
                state.datePlatesSolved = true;
                triggerCompanionReaction('WIFE: We always find our rhythm!', 2);
                beep(760, 0.16, 'triangle');
                startDialogue(['* You stand on Plate A. WIFE glides onto Plate B!', '* WIFE: "Look at those smooth ice-skating skills!"', '* The lower gate vanishes in a puff of snow.']);
            } else if (state.datePlatesSolved) startDialogue(['* Both date plates glow softly beneath the snow.']);
            else startDialogue(['* Two plates shimmer on the ice. Stand on Plate A and your wife will take Plate B.']);
            return;
        }
        if (closeTo(595, 420, 36)) { checkRoomTransitions(); return; }
        startDialogue(['* The snowfield remembers the warmest moments.']);
        return;
    }
    if (state.room === 3) {
        const nodes = [{ x: 210, y: 180 }, { x: 320, y: 180 }, { x: 430, y: 180 }];
        const nodeIndex = nodes.findIndex(n => closeTo(n.x, n.y, 40));
        if (nodeIndex >= 0) {
            state.junctions[nodeIndex] = (state.junctions[nodeIndex] + 1) % 2;
            beep(350 + nodeIndex * 100, 0.08, 'square');
            if (state.junctions.every(v => v === 0) && !state.circuitSolved) {
                state.circuitSolved = true;
                triggerCompanionReaction('WIFE: My favorite problem-solver!', 3);
                playClip(jingleSound);
                startDialogue(['* The red, green, and blue junctions snap into alignment!', '* WIFE: "Is there anything you can\'t build or fix? You\'re amazing!"', '* The arcade cabinet lights up and the gate slides away.']);
            } else startDialogue([`* Junction ${['RED', 'GREEN', 'BLUE'][nodeIndex]} turned ${state.junctions[nodeIndex] ? 'vertical' : 'horizontal'}.`, '* Z rotates each junction between vertical and horizontal.']);
            return;
        }
        if (closeTo(520, 180, 52)) { takeGift(3); return; }
        if (closeTo(500, 350, 64)) {
            if (!state.golemDefeated) startEncounter('golem');
            else startDialogue(['* The Flat-Pack Golem is peacefully holding the instruction sheet.']);
            return;
        }
        if (closeTo(595, 420, 36)) { checkRoomTransitions(); return; }
        startDialogue(['* Circuit traces blink below the jungle vines.', '* Three junctions need to be turned horizontal.']);
        return;
    }
    if (state.room === 4) {
        if (closeTo(520, 238, 52)) { takeGift(4); return; }
        if (closeTo(495, 238, 58) && !state.wifeBattleComplete) { startEncounter('wife'); return; }
        startDialogue(["* WIFE: \"The bridge is beautiful, isn't it? Let's finish our adventure together.\""]);
    }
}

// ---------- Overworld update ----------
function updateWorld() {
    const room = state.room;
    const axis = moveAxis();
    const moving = axis.x !== 0 || axis.y !== 0;
    const running = cancelHeld();
    const speed = running ? 3.5 : 2;
    let dx = axis.x;
    let dy = axis.y;
    const length = Math.hypot(dx, dy) || 1;
    dx = dx / length * speed;
    dy = dy / length * speed;
    if (moving) {
        player.dx = axis.x;
        player.dy = axis.y;
        if (!collidesAt(player.x + dx, player.y)) player.x += dx;
        else if (Math.abs(dx) > 0.1) tryPushBasket(dx, 0);
        if (!collidesAt(player.x, player.y + dy)) player.y += dy;
        else if (Math.abs(dy) > 0.1) tryPushBasket(0, dy);
        player.walk += 0.22;
        state.idleFrames = 0;
    } else {
        state.idleFrames++;
    }
    moveCompanion();
    if (state.idleFrames > 300 && state.complimentTime <= 0) {
        const compliments = ['* WIFE: "You\'re doing amazing, handsome!"', '* WIFE: "Looking good, birthday boy!"'];
        state.complimentBubble = compliments[state.complimentIndex % compliments.length];
        state.complimentIndex++;
        state.complimentTime = 210;
        companion.hearts.push({ x: companion.x + 10, y: companion.y - 48, life: 55 });
        beep(820, 0.11, 'triangle', 0.055);
        state.idleFrames = 0;
    }
    if (state.complimentTime > 0) state.complimentTime--;
    if (companion.reactionTime > 0) companion.reactionTime--;
    if (companion.celebrateTime > 0) companion.celebrateTime--;
    companion.hearts.forEach(h => {
        h.y -= h.rise ?? 0.45;
        h.x += h.drift ?? 0;
        h.life--;
    });
    companion.hearts = companion.hearts.filter(h => h.life > 0);

    if (room === 0 && closeTo(480, 196, 38) && !state.prologueSpoken) {
        state.prologueSpoken = true;
        startDialogue([
            '* WIFE: "Happy Birthday to my favorite human in the world!"',
            '* WIFE: "You look extra cute today, but oh no... A birthday anomaly has scattered your presents across our memories!"',
            '* WIFE: "Take your DETERMINATION and follow me, handsome!"',
            '* A purple portal sparkles into view in the middle of the room.',
        ], () => { state.prologueReady = true; playClip(jingleSound); });
        return;
    }
    if (room === 0 && state.prologueReady && closeTo(320, 218, 20)) { travelTo(1); return; }

    if (room === 1) {
        checkLaundry();
        if (!state.petDefeated && state.laundrySolved && closeTo(520, 350, 48)) {
            startEncounter('pet');
            return;
        }
    }
    if (room === 2 && !state.datePlatesSolved && closeTo(224, 272, 22)) {
        state.wifeHold = true;
        state.datePlatesSolved = true;
        triggerCompanionReaction('WIFE: We always find our rhythm!', 2);
        beep(760, 0.16, 'triangle');
        startDialogue(['* You hold Plate A while WIFE glides onto Plate B!', '* WIFE: "Look at those smooth ice-skating skills!"', '* The lower gate vanishes in a puff of snow.']);
        return;
    }
    if (room === 3 && !state.golemDefeated && closeTo(500, 350, 42)) {
        startEncounter('golem');
        return;
    }
    if (room === 4 && !state.wifeBattleComplete && closeTo(495, 238, 46)) {
        startEncounter('wife');
        return;
    }
    if (confirmPressed()) handleWorldInteract();
    if (room > 0 && room < 4 && closeTo(603, 420, 24)) checkRoomTransitions();
}

// ---------- Overworld art ----------
function themePalette() {
    return {
        home: ['#c8c7c3', '#b8b7b3', '#73747b', '#f1eee6'],
        living: ['#a8765d', '#b88668', '#66464b', '#eacb9b'],
        snow: ['#b9dce8', '#d4edf2', '#6c98aa', '#f4fbff'],
        tech: ['#202c40', '#29384a', '#00a88c', '#a9f16d'],
        stars: ['#151126', '#201a36', '#70508f', '#eed0ff'],
    }[rooms[state.room].theme];
}
function drawFloor(t) {
    const colors = themePalette();
    ctx.fillStyle = colors[0];
    ctx.fillRect(0, 0, W, H);
    for (let y = 0; y < H; y += TILE) for (let x = 0; x < W; x += TILE) {
        const tx = x / TILE;
        const ty = y / TILE;
        const alt = ((tx + ty) & 1) === 0;
        ctx.fillStyle = alt ? colors[0] : colors[1];
        ctx.fillRect(x, y, TILE, TILE);
        if (state.room === 0) {
            ctx.fillStyle = 'rgba(255,255,255,.12)';
            ctx.fillRect(x + 3, y + 3, 24, 1);
            ctx.fillRect(x + 3, y + 3, 1, 24);
            ctx.fillStyle = 'rgba(70,72,78,.2)';
            ctx.fillRect(x + 31, y, 1, TILE);
            ctx.fillRect(x, y + 31, TILE, 1);
            if ((tx * 3 + ty * 5) % 7 === 0) {
                ctx.fillStyle = '#e9e7e1';
                ctx.fillRect(x + 20, y + 18, 3, 2);
            }
        } else if (state.room === 1) {
            const plank = (ty + (tx % 2)) % 2;
            ctx.fillStyle = plank ? 'rgba(91,49,47,.22)' : 'rgba(255,218,163,.13)';
            ctx.fillRect(x + 2, y + 10, 28, 2);
            ctx.fillRect(x + 2, y + 23, 28, 1);
            ctx.fillStyle = 'rgba(75,43,43,.23)';
            ctx.fillRect(x + (plank ? 8 : 23), y + 1, 1, 9);
            ctx.fillRect(x + (plank ? 23 : 8), y + 12, 1, 10);
            if ((tx + ty) % 5 === 0) {
                ctx.fillStyle = 'rgba(255,229,183,.25)';
                ctx.fillRect(x + 13, y + 5, 5, 1);
            }
        } else if (state.room === 2) {
            ctx.strokeStyle = 'rgba(91,145,166,.42)';
            ctx.lineWidth = 1;
            ctx.strokeRect(x + 1, y + 1, TILE - 2, TILE - 2);
            ctx.fillStyle = '#effaff';
            if ((tx * 7 + ty * 3) % 4 === 0) {
                ctx.fillRect(x + 6, y + 8, 8, 2);
                ctx.fillRect(x + 10, y + 5, 2, 8);
            }
            if ((tx + ty * 2) % 9 === 0) {
                ctx.fillStyle = 'rgba(87,151,174,.38)';
                ctx.fillRect(x + 22, y + 24, 5, 2);
            }
        } else if (state.room === 3) {
            ctx.strokeStyle = 'rgba(92,239,182,.2)';
            ctx.lineWidth = 1;
            ctx.strokeRect(x + 3, y + 3, TILE - 6, TILE - 6);
            ctx.fillStyle = 'rgba(92,239,182,.36)';
            ctx.fillRect(x + 5, y + 5, 2, 2);
            if ((tx * 2 + ty) % 4 === 0) {
                ctx.fillStyle = '#466277';
                ctx.fillRect(x + 22, y + 20, 4, 2);
                ctx.fillStyle = '#a9f16d';
                ctx.fillRect(x + 25, y + 19, 2, 2);
            }
        } else {
            ctx.fillStyle = 'rgba(245,226,255,.38)';
            if ((tx * 7 + ty * 3) % 5 === 0) ctx.fillRect(x + 14, y + 13, 2, 2);
            if ((tx * 3 + ty * 11) % 13 === 0) ctx.fillRect(x + 24, y + 25, 2, 2);
        }
    }
    if (state.room !== 4) {
        // A low pixel-art wall and baseboard make each room read as a place, not a flat tile sheet.
        ctx.fillStyle = colors[2]; ctx.fillRect(0, 0, W, 35);
        for (let x = 0; x < W; x += 32) {
            ctx.fillStyle = x % 64 === 0 ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.1)';
            ctx.fillRect(x + 2, 4, 27, 25);
            ctx.fillStyle = 'rgba(255,255,255,.13)'; ctx.fillRect(x + 5, 7, 21, 2);
        }
        ctx.fillStyle = colors[3]; ctx.fillRect(0, 35, W, 4);
        ctx.fillStyle = 'rgba(36,25,35,.3)'; ctx.fillRect(0, 39, W, 2);
        ctx.fillStyle = colors[2]; ctx.fillRect(0, 0, 10, H);
        ctx.fillRect(W - 10, 0, 10, H);
        ctx.fillStyle = colors[3]; ctx.fillRect(10, 38, 2, H - 76);
        ctx.fillRect(W - 12, 38, 2, H - 76);
        ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.fillRect(0, H - 12, W, 12);
        ctx.fillStyle = colors[3]; ctx.fillRect(10, H - 15, W - 20, 3);
    }
    if (state.room === 4) {
        // A broken star bridge, built from broad pixel slabs and a lit walkable ribbon.
        ctx.fillStyle = '#33294f'; ctx.fillRect(0, 178, W, 118);
        ctx.fillStyle = '#4b3a72'; ctx.fillRect(0, 182, W, 108);
        for (let x = 0; x < W; x += 32) {
            ctx.fillStyle = x % 64 === 0 ? '#705b91' : '#604b82';
            ctx.fillRect(x + 2, 192, 28, 88);
            ctx.fillStyle = 'rgba(229,196,255,.2)'; ctx.fillRect(x + 4, 196, 20, 2);
            if (x % 3 === 0) {
                ctx.fillStyle = '#b994d8'; ctx.fillRect(x + 27, 228, 2, 2);
            }
        }
        ctx.fillStyle = '#8267ac'; ctx.fillRect(0, 184, W, 5);
        ctx.fillStyle = '#d9a9ff'; ctx.fillRect(0, 288, W, 4);
        ctx.fillStyle = 'rgba(15,10,30,.55)'; ctx.fillRect(0, 296, W, 14);
        for (let i = 0; i < 10; i++) {
            const sx = (i * 71 + 24) % W;
            ctx.fillStyle = '#ffe5a4';
            ctx.fillRect(sx, 203 + (i % 4) * 20, 3, 3);
            ctx.fillRect(sx + 4, 204 + (i % 4) * 20, 2, 2);
        }
    }
}
function drawHomeFurniture() {
    // A neatly made single bed with a carved headboard, layered quilt and soft shadow.
    ctx.fillStyle = 'rgba(32,31,35,.22)'; ctx.fillRect(38, 145, 108, 12);
    ctx.fillStyle = '#45464b'; ctx.fillRect(33, 77, 114, 78);
    ctx.fillStyle = '#a4a4a2'; ctx.fillRect(38, 82, 104, 68);
    ctx.fillStyle = '#deddd8'; ctx.fillRect(42, 87, 96, 59);
    ctx.fillStyle = '#77797d'; ctx.fillRect(43, 92, 94, 48);
    // Pillows with piped seams and natural creases.
    ctx.fillStyle = '#55575d'; ctx.fillRect(49, 91, 39, 24); ctx.fillRect(91, 91, 39, 24);
    ctx.fillStyle = '#f0efeb'; ctx.fillRect(51, 92, 35, 20); ctx.fillRect(93, 92, 35, 20);
    ctx.fillStyle = '#c6c5c1'; ctx.fillRect(54, 95, 28, 2); ctx.fillRect(96, 95, 28, 2);
    ctx.fillStyle = '#b1b1b0'; ctx.fillRect(80, 96, 3, 11); ctx.fillRect(121, 96, 3, 11);
    // Quilted duvet, folded edge, stitch lines, and a tucked-in corner.
    ctx.fillStyle = '#6a6c71'; ctx.fillRect(43, 116, 94, 27);
    ctx.fillStyle = '#d1d0cb'; ctx.fillRect(46, 118, 88, 22);
    ctx.fillStyle = '#efeee9'; ctx.fillRect(46, 118, 88, 4);
    ctx.fillStyle = '#a1a1a0';
    for (let x = 54; x < 130; x += 18) { ctx.fillRect(x, 124, 1, 12); ctx.fillRect(x + 1, 124, 7, 1); }
    ctx.fillStyle = '#77797d'; ctx.fillRect(41, 145, 7, 12); ctx.fillRect(132, 145, 7, 12);
    ctx.fillStyle = '#dad9d4'; ctx.fillRect(35, 79, 110, 4); ctx.fillRect(39, 84, 102, 2);

    // Interactive wardrobe: paneled doors, deep side shading, brass handles and a top cornice.
    ctx.fillStyle = 'rgba(27,25,28,.26)'; ctx.fillRect(164, 158, 89, 8);
    ctx.fillStyle = '#39383c'; ctx.fillRect(164, 103, 89, 61);
    ctx.fillStyle = '#727174'; ctx.fillRect(168, 106, 81, 54);
    ctx.fillStyle = '#8c8b89'; ctx.fillRect(168, 106, 81, 5);
    ctx.fillStyle = '#55555a'; ctx.fillRect(172, 113, 35, 42); ctx.fillRect(210, 113, 35, 42);
    ctx.fillStyle = '#a6a5a1'; ctx.fillRect(174, 115, 31, 38); ctx.fillRect(212, 115, 31, 38);
    ctx.fillStyle = '#c2c0ba'; ctx.fillRect(177, 118, 25, 2); ctx.fillRect(215, 118, 25, 2);
    ctx.fillStyle = '#77777a'; ctx.fillRect(178, 122, 23, 27); ctx.fillRect(216, 122, 23, 27);
    ctx.fillStyle = '#ded0a7'; ctx.fillRect(204, 130, 3, 6); ctx.fillRect(210, 130, 3, 6);
    ctx.fillStyle = '#f3e0a8'; ctx.fillRect(204, 130, 1, 2); ctx.fillRect(210, 130, 1, 2);
    ctx.fillStyle = '#444449'; ctx.fillRect(170, 158, 8, 5); ctx.fillRect(239, 158, 8, 5);

    // A small vintage sideboard adds a grounded focal point opposite the bed.
    ctx.fillStyle = 'rgba(30,27,33,.2)'; ctx.fillRect(270, 188, 108, 9);
    ctx.fillStyle = '#48494e'; ctx.fillRect(272, 138, 104, 54);
    ctx.fillStyle = '#77787b'; ctx.fillRect(268, 134, 112, 8);
    ctx.fillStyle = '#c8c7c2'; ctx.fillRect(271, 135, 106, 3);
    ctx.fillStyle = '#616267'; ctx.fillRect(278, 146, 43, 35); ctx.fillRect(327, 146, 43, 35);
    ctx.fillStyle = '#898a8c'; ctx.fillRect(281, 149, 37, 29); ctx.fillRect(330, 149, 37, 29);
    ctx.fillStyle = '#5b5c62'; ctx.fillRect(285, 153, 29, 21); ctx.fillRect(334, 153, 29, 21);
    ctx.fillStyle = '#d6c594'; ctx.fillRect(298, 157, 4, 4); ctx.fillRect(347, 157, 4, 4);
    ctx.fillStyle = '#44454a'; ctx.fillRect(279, 190, 8, 6); ctx.fillRect(360, 190, 8, 6);
    // A little framed photograph on the sideboard.
    ctx.fillStyle = '#414146'; ctx.fillRect(306, 111, 26, 23);
    ctx.fillStyle = '#d8d6d0'; ctx.fillRect(309, 114, 20, 17);
    ctx.fillStyle = '#9a9b9d'; ctx.fillRect(311, 117, 7, 7); ctx.fillRect(320, 116, 6, 9);
    ctx.fillStyle = '#66676c'; ctx.fillRect(309, 127, 20, 4);

    // Woven rug with a soft border and repeating diamond medallions.
    ctx.fillStyle = 'rgba(35,32,35,.24)'; ctx.fillRect(249, 377, 151, 8);
    ctx.fillStyle = '#77787b'; ctx.fillRect(246, 298, 154, 84);
    ctx.fillStyle = '#b8b7b2'; ctx.fillRect(251, 303, 144, 74);
    ctx.fillStyle = '#77787b'; ctx.fillRect(255, 307, 136, 66);
    ctx.fillStyle = '#a09f9c'; ctx.fillRect(258, 310, 130, 60);
    ctx.strokeStyle = '#e6e4dc'; ctx.lineWidth = 2; ctx.strokeRect(261, 313, 124, 54);
    ctx.fillStyle = '#77787b';
    for (let x = 270; x < 382; x += 18) {
        ctx.fillRect(x, 330, 4, 4); ctx.fillRect(x + 4, 334, 4, 4); ctx.fillRect(x, 338, 4, 4); ctx.fillRect(x - 4, 334, 4, 4);
    }
    ctx.fillStyle = '#e6e4dc'; ctx.fillRect(246, 315, 4, 50); ctx.fillRect(396, 315, 4, 50);

    // Kitchen run: stone worktop, paneled cupboards, pulls, kettle and a toast rack.
    ctx.fillStyle = 'rgba(25,24,28,.22)'; ctx.fillRect(425, 165, 140, 9);
    ctx.fillStyle = '#55565a'; ctx.fillRect(426, 128, 138, 39);
    ctx.fillStyle = '#d5d4ce'; ctx.fillRect(422, 121, 146, 10);
    ctx.fillStyle = '#f2f1ec'; ctx.fillRect(425, 122, 140, 3);
    ctx.fillStyle = '#96969a'; ctx.fillRect(430, 133, 129, 29);
    for (const x of [432, 474, 516]) {
        ctx.fillStyle = '#5c5d62'; ctx.fillRect(x, 135, 38, 25);
        ctx.fillStyle = '#85868a'; ctx.fillRect(x + 2, 137, 34, 20);
        ctx.fillStyle = '#5c5d62'; ctx.fillRect(x + 17, 140, 2, 13);
        ctx.fillStyle = '#ded7c1'; ctx.fillRect(x + 16, 144, 4, 3);
    }
    // Kettle and toaster on the counter bring scale and lived-in detail.
    ctx.fillStyle = '#55565b'; ctx.fillRect(440, 108, 23, 13); ctx.fillRect(444, 103, 14, 6);
    ctx.fillStyle = '#c8c8c4'; ctx.fillRect(442, 108, 18, 10); ctx.fillRect(446, 104, 10, 3);
    ctx.fillStyle = '#68696e'; ctx.fillRect(437, 111, 5, 3); ctx.fillRect(461, 110, 4, 2);
    ctx.fillStyle = '#77787b'; ctx.fillRect(488, 111, 28, 10);
    ctx.fillStyle = '#d4d3ce'; ctx.fillRect(490, 108, 24, 10);
    ctx.fillStyle = '#626367'; ctx.fillRect(495, 106, 2, 5); ctx.fillRect(507, 106, 2, 5);
    ctx.fillStyle = '#77787b'; ctx.fillRect(499, 113, 5, 2);

    if (state.prologueReady) {
        ctx.fillStyle = 'rgba(190,80,255,.3)'; ctx.beginPath(); ctx.ellipse(320, 220, 37, 15 + Math.sin(state.time / 10) * 4, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#ca72ff'; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(320, 213, 19, 32, 0, 0, Math.PI * 2); ctx.stroke();
        for (let i = 0; i < 5; i++) {
            ctx.fillStyle = '#ffdb61'; ctx.fillRect(302 + (i * 21 + state.time / 3) % 38, 185 + ((i * 31 + state.time) % 62), 3, 3);
        }
    }
}
function drawPlant(x, y) {
    // Layered foliage, individual leaf highlights and a glazed ceramic planter.
    ctx.fillStyle = 'rgba(22,30,26,.25)'; ctx.fillRect(x - 18, y + 23, 38, 5);
    ctx.fillStyle = '#573b38'; ctx.fillRect(x - 12, y + 7, 25, 18);
    ctx.fillStyle = '#9c684d'; ctx.fillRect(x - 11, y + 9, 22, 14);
    ctx.fillStyle = '#c58b65'; ctx.fillRect(x - 14, y + 6, 29, 5);
    ctx.fillStyle = '#e3ae81'; ctx.fillRect(x - 11, y + 7, 22, 2);
    ctx.fillStyle = '#513b36'; ctx.fillRect(x - 7, y + 18, 15, 3);
    ctx.fillStyle = '#265840'; ctx.fillRect(x - 3, y - 10, 7, 20);
    ctx.fillStyle = '#286347';
    ctx.fillRect(x - 19, y - 10, 13, 10); ctx.fillRect(x + 6, y - 14, 13, 11);
    ctx.fillRect(x - 14, y - 22, 12, 11); ctx.fillRect(x + 2, y - 25, 12, 12);
    ctx.fillRect(x - 5, y - 31, 10, 14); ctx.fillRect(x - 23, y - 3, 12, 9);
    ctx.fillStyle = '#4d9a62';
    ctx.fillRect(x - 15, y - 10, 8, 3); ctx.fillRect(x + 8, y - 13, 8, 3);
    ctx.fillRect(x - 11, y - 21, 7, 3); ctx.fillRect(x + 4, y - 24, 7, 3);
    ctx.fillRect(x - 2, y - 30, 4, 7); ctx.fillRect(x - 20, y - 2, 7, 3);
    ctx.fillStyle = '#79b86b'; ctx.fillRect(x - 1, y - 31, 2, 5); ctx.fillRect(x + 10, y - 12, 2, 4);
}
function drawLivingRoom() {
    // Deep, cushioned three-seat sofa with piping, tufting, wood feet and a folded throw.
    ctx.fillStyle = 'rgba(34,20,31,.26)'; ctx.fillRect(231, 130, 180, 12);
    ctx.fillStyle = '#492d3b'; ctx.fillRect(228, 68, 184, 69);
    ctx.fillStyle = '#754459'; ctx.fillRect(232, 70, 176, 61);
    ctx.fillStyle = '#97566c'; ctx.fillRect(239, 73, 162, 48);
    ctx.fillStyle = '#b36c7c'; ctx.fillRect(243, 76, 154, 4);
    // Back cushions and seam piping.
    ctx.fillStyle = '#713e54'; ctx.fillRect(241, 78, 52, 44); ctx.fillRect(295, 78, 52, 44); ctx.fillRect(349, 78, 49, 44);
    ctx.fillStyle = '#bd7984'; ctx.fillRect(244, 81, 46, 37); ctx.fillRect(298, 81, 46, 37); ctx.fillRect(352, 81, 43, 37);
    ctx.fillStyle = '#d49697'; ctx.fillRect(247, 83, 38, 3); ctx.fillRect(301, 83, 38, 3); ctx.fillRect(355, 83, 35, 3);
    ctx.fillStyle = '#90576a'; ctx.fillRect(291, 81, 3, 39); ctx.fillRect(345, 81, 3, 39);
    ctx.fillStyle = '#78465c'; ctx.fillRect(260, 104, 3, 3); ctx.fillRect(314, 104, 3, 3); ctx.fillRect(368, 104, 3, 3);
    // Seat deck, individual seat pads and front welt.
    ctx.fillStyle = '#60364b'; ctx.fillRect(239, 117, 162, 17);
    ctx.fillStyle = '#a95f74'; ctx.fillRect(243, 116, 154, 14);
    ctx.fillStyle = '#d0898b'; ctx.fillRect(248, 118, 44, 2); ctx.fillRect(300, 118, 44, 2); ctx.fillRect(352, 118, 39, 2);
    ctx.fillStyle = '#81465b'; ctx.fillRect(294, 118, 3, 12); ctx.fillRect(346, 118, 3, 12);
    ctx.fillStyle = '#492d3b'; ctx.fillRect(235, 127, 169, 7);
    ctx.fillStyle = '#d59a82'; ctx.fillRect(242, 129, 154, 2);
    // Broad padded arms with rounded stepped edges and inset seams.
    ctx.fillStyle = '#62394e'; ctx.fillRect(228, 82, 22, 48); ctx.fillRect(390, 82, 22, 48);
    ctx.fillStyle = '#a35b70'; ctx.fillRect(231, 78, 17, 48); ctx.fillRect(392, 78, 17, 48);
    ctx.fillStyle = '#cf8589'; ctx.fillRect(233, 80, 12, 3); ctx.fillRect(394, 80, 12, 3);
    ctx.fillStyle = '#754257'; ctx.fillRect(235, 87, 2, 31); ctx.fillRect(398, 87, 2, 31);
    ctx.fillStyle = '#d6b38a'; ctx.fillRect(242, 133, 8, 8); ctx.fillRect(391, 133, 8, 8);
    ctx.fillStyle = '#7b4d4b'; ctx.fillRect(243, 137, 6, 3); ctx.fillRect(392, 137, 6, 3);
    // Two plump accent pillows, with corner tassels, creases and embroidered motifs.
    ctx.fillStyle = '#704455'; ctx.fillRect(258, 87, 34, 28); ctx.fillRect(354, 87, 34, 28);
    ctx.fillStyle = '#f0c6a8'; ctx.fillRect(261, 88, 28, 23); ctx.fillRect(357, 88, 28, 23);
    ctx.fillStyle = '#fff0d4'; ctx.fillRect(264, 90, 22, 3); ctx.fillRect(360, 90, 22, 3);
    ctx.fillStyle = '#d28c84'; ctx.fillRect(273, 95, 4, 4); ctx.fillRect(369, 95, 4, 4);
    ctx.fillRect(270, 99, 10, 2); ctx.fillRect(366, 99, 10, 2);
    ctx.fillStyle = '#f8dfbf'; ctx.fillRect(260, 87, 3, 3); ctx.fillRect(287, 110, 3, 3); ctx.fillRect(356, 87, 3, 3); ctx.fillRect(383, 110, 3, 3);
    // A casually draped knitted blanket over one end makes the room feel lived in.
    ctx.fillStyle = '#624568'; ctx.fillRect(378, 83, 15, 30); ctx.fillRect(372, 108, 22, 17);
    ctx.fillStyle = '#8c6790'; ctx.fillRect(381, 85, 9, 26); ctx.fillRect(375, 110, 16, 11);
    ctx.fillStyle = '#c8a8c1'; ctx.fillRect(383, 87, 2, 22); ctx.fillRect(377, 113, 11, 2);
    ctx.fillStyle = '#604565'; ctx.fillRect(374, 122, 3, 5); ctx.fillRect(381, 123, 3, 5); ctx.fillRect(388, 122, 3, 5);

    drawPlant(60, 112); drawPlant(575, 250); drawPlant(85, 320);
    // Low oak coffee table on a bordered rug; visible controller and a small coaster.
    ctx.fillStyle = 'rgba(32,22,32,.22)'; ctx.fillRect(250, 241, 135, 9);
    ctx.fillStyle = '#493542'; ctx.fillRect(258, 224, 7, 24); ctx.fillRect(374, 224, 7, 24);
    ctx.fillStyle = '#6d4d4d'; ctx.fillRect(250, 212, 135, 17);
    ctx.fillStyle = '#b27b58'; ctx.fillRect(247, 208, 141, 9);
    ctx.fillStyle = '#d6a274'; ctx.fillRect(251, 209, 133, 3);
    ctx.fillStyle = '#825944'; ctx.fillRect(254, 215, 126, 2);
    // Woven runner visible under the tabletop.
    ctx.fillStyle = '#594255'; ctx.fillRect(263, 219, 109, 5);
    ctx.fillStyle = '#c4a1bb'; ctx.fillRect(269, 220, 8, 2); ctx.fillRect(359, 220, 7, 2);
    // Tiny ceramic coaster and a low-profile game controller.
    ctx.fillStyle = '#e0d0b8'; ctx.fillRect(269, 204, 18, 4); ctx.fillStyle = '#a96d5d'; ctx.fillRect(273, 202, 10, 3);
    ctx.fillStyle = '#302a48'; ctx.fillRect(311, 203, 34, 12); ctx.fillRect(316, 200, 24, 16);
    ctx.fillStyle = '#8374a3'; ctx.fillRect(314, 204, 28, 9); ctx.fillStyle = '#c5b3dc'; ctx.fillRect(318, 206, 9, 2);
    ctx.fillStyle = '#f4e8d5'; ctx.fillRect(319, 204, 3, 6); ctx.fillRect(317, 206, 7, 2);
    ctx.fillStyle = '#ef9eaa'; ctx.fillRect(334, 205, 3, 3); ctx.fillRect(338, 208, 3, 3);
    text('GAME NIGHT', 317, 255, 9, '#49364e', 'center');
    // Laundry plates and baskets (puzzle positions and input behavior are unchanged).
    const plates = state.baskets;
    plates.forEach((b) => {
        const x = b.plateX * TILE, y = b.plateY * TILE;
        const placed = b.x === b.plateX && b.y === b.plateY;
        ctx.fillStyle = placed ? 'rgba(255,247,194,.25)' : 'rgba(35,24,42,.2)';
        ctx.fillRect(x + 2, y + 2, 28, 28);
        ctx.fillStyle = `${basketColors[b.color]}66`;
        ctx.fillRect(x + 5, y + 5, 22, 22);
        ctx.strokeStyle = basketColors[b.color]; ctx.lineWidth = 2; ctx.strokeRect(x + 4, y + 4, 24, 24);
        ctx.fillStyle = 'rgba(255,255,255,.52)';
        ctx.fillRect(x + 8, y + 7, 2, 2); ctx.fillRect(x + 22, y + 23, 2, 2);
        if (placed) {
            ctx.fillStyle = '#fff9cf'; ctx.fillRect(x + 11, y + 11, 10, 10);
            ctx.fillStyle = basketColors[b.color]; ctx.fillRect(x + 14, y + 14, 4, 4);
        }
        const bx = b.x * TILE, by = b.y * TILE;
        ctx.fillStyle = 'rgba(45,27,39,.28)'; ctx.fillRect(bx + 3, by + 25, 27, 5);
        ctx.fillStyle = '#493344'; ctx.fillRect(bx + 3, by + 8, 26, 21);
        ctx.fillStyle = basketColors[b.color]; ctx.fillRect(bx + 5, by + 10, 22, 17);
        ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fillRect(bx + 7, by + 12, 2, 12);
        ctx.fillStyle = 'rgba(67,37,52,.32)';
        ctx.fillRect(bx + 10, by + 12, 2, 13); ctx.fillRect(bx + 17, by + 12, 2, 13); ctx.fillRect(bx + 24, by + 12, 2, 13);
        ctx.fillStyle = '#f4e1d4'; ctx.fillRect(bx + 7, by + 9, 18, 4);
        ctx.fillStyle = '#fff7e8'; ctx.fillRect(bx + 8, by + 8, 14, 3); ctx.fillRect(bx + 12, by + 5, 9, 5);
        ctx.fillStyle = '#493344'; ctx.fillRect(bx + 10, by + 6, 2, 4); ctx.fillRect(bx + 21, by + 6, 2, 4);
        ctx.fillStyle = '#fff'; ctx.fillRect(bx + 13, by + 4, 5, 3);
    });
    if (!state.laundrySolved) {
        ctx.fillStyle = '#49304b'; ctx.fillRect(492, 105, 48, 60); ctx.fillStyle = '#f5cf61'; ctx.fillRect(494, 108, 4, 53); ctx.fillRect(505, 108, 4, 53); ctx.fillRect(516, 108, 4, 53); ctx.fillRect(527, 108, 4, 53);
        text('GATE', 516, 178, 9, '#52364a', 'center');
    }
    drawChest(520, 136, !state.chest1 && state.laundrySolved, '#e45568');
    if (!state.petDefeated) drawPet(520, 348, Math.sin(state.time / 10));
    drawDoor(603, 420, 'CAFÉ');
}
function drawSnowRoom() {
    // Pines and lamps
    for (const [x, y] of [[48,80],[143,245],[590,83],[565,305]]) {
        ctx.fillStyle = 'rgba(36,71,78,.28)'; ctx.fillRect(x - 23, y + 27, 46, 5);
        ctx.fillStyle = '#345c64'; ctx.fillRect(x - 4, y - 1, 8, 31);
        ctx.fillStyle = '#315a63';
        ctx.fillRect(x - 6, y - 38, 12, 9);
        ctx.fillRect(x - 11, y - 29, 22, 9);
        ctx.fillRect(x - 16, y - 20, 32, 10);
        ctx.fillRect(x - 22, y - 10, 44, 11);
        ctx.fillStyle = '#427d7b';
        ctx.fillRect(x - 4, y - 36, 8, 6);
        ctx.fillRect(x - 9, y - 27, 18, 6);
        ctx.fillRect(x - 14, y - 18, 28, 6);
        ctx.fillRect(x - 19, y - 8, 38, 6);
        ctx.fillStyle = '#fff';
        ctx.fillRect(x - 9, y - 22, 12, 3); ctx.fillRect(x - 16, y - 11, 10, 2);
        ctx.fillRect(x + 3, y - 31, 6, 2);
    }
    for (const x of [194, 472]) {
        ctx.fillStyle = 'rgba(28,52,65,.23)'; ctx.fillRect(x - 6, 135, 18, 5);
        ctx.fillStyle = '#415e6b'; ctx.fillRect(x, 78, 5, 62); ctx.fillStyle = '#5b7580'; ctx.fillRect(x - 2, 81, 2, 55);
        ctx.fillStyle = '#b6a67e'; ctx.fillRect(x - 6, 68, 17, 16); ctx.fillStyle = '#ffe7a0'; ctx.fillRect(x - 4, 70, 13, 12);
        ctx.fillStyle = '#fff4cf'; ctx.fillRect(x - 1, 73, 7, 6);
        ctx.fillStyle = 'rgba(255,226,153,.18)'; ctx.fillRect(x - 13, 83, 30, 12);
    }
    // A welcoming little café front: striped awning, framed window and paneled door.
    ctx.fillStyle = 'rgba(34,60,71,.22)'; ctx.fillRect(478, 177, 82, 8);
    ctx.fillStyle = '#355969'; ctx.fillRect(478, 97, 80, 86);
    ctx.fillStyle = '#79a5ad'; ctx.fillRect(481, 100, 74, 80);
    ctx.fillStyle = '#ecf5f5'; ctx.fillRect(484, 104, 68, 27);
    ctx.fillStyle = '#375d70'; ctx.fillRect(487, 107, 62, 21);
    ctx.fillStyle = '#b5e0df'; ctx.fillRect(490, 110, 56, 15);
    ctx.fillStyle = '#e9f6eb'; ctx.fillRect(493, 111, 18, 12); ctx.fillRect(515, 111, 27, 12);
    ctx.fillStyle = '#456c7c'; ctx.fillRect(512, 108, 3, 20); ctx.fillRect(487, 125, 62, 3);
    ctx.fillStyle = '#fff'; ctx.fillRect(493, 112, 12, 2); ctx.fillRect(518, 112, 19, 2);
    ctx.fillStyle = '#734e5b'; ctx.fillRect(482, 132, 72, 8);
    for (let i = 0; i < 6; i++) {
        ctx.fillStyle = i % 2 ? '#f3d8b7' : '#d88688';
        ctx.fillRect(484 + i * 11, 132, 11, 7);
        ctx.fillStyle = i % 2 ? '#d88688' : '#f3d8b7';
        ctx.fillRect(484 + i * 11, 139, 11, 4);
    }
    ctx.fillStyle = '#ecdfc5'; ctx.fillRect(488, 144, 28, 34);
    ctx.fillStyle = '#9b6b59'; ctx.fillRect(491, 147, 22, 31);
    ctx.fillStyle = '#d8b182'; ctx.fillRect(494, 150, 16, 25);
    ctx.fillStyle = '#55404a'; ctx.fillRect(515, 143, 29, 37);
    ctx.fillStyle = '#936f65'; ctx.fillRect(518, 146, 23, 31);
    ctx.fillStyle = '#bb9577'; ctx.fillRect(521, 149, 17, 26);
    ctx.fillStyle = '#443743'; ctx.fillRect(525, 152, 9, 26);
    ctx.fillStyle = '#f5d78b'; ctx.fillRect(536, 163, 3, 3);
    ctx.fillStyle = '#fff0d3'; ctx.fillRect(523, 151, 6, 2);
    // A menu board and little wall sconce make the café read as a cozy place.
    ctx.fillStyle = '#493c4a'; ctx.fillRect(487, 86, 62, 10);
    ctx.fillStyle = '#f2d69e'; ctx.fillRect(490, 88, 56, 6);
    text('FROSTY CAFE', 518, 94, 8, '#375467', 'center');
    drawPad(224, 272, state.datePlatesSolved, '#63e4ee', 'A');
    drawPad(256, 272, state.datePlatesSolved, '#f3c6ef', 'B');
    if (!state.datePlatesSolved) {
        ctx.strokeStyle = '#a8f3fb'; ctx.setLineDash([3, 4]); ctx.strokeRect(192, 252, 96, 42); ctx.setLineDash([]);
        if (state.cafeShortcut) {
            ctx.strokeStyle = 'rgba(255,226,157,.8)'; ctx.lineWidth = 4; ctx.setLineDash([7, 5]);
            ctx.beginPath(); ctx.moveTo(286, 286); ctx.lineTo(316, 314); ctx.lineTo(560, 314); ctx.lineTo(586, 385); ctx.stroke();
            ctx.setLineDash([]);
            text('SERVICE WAY', 444, 307, 9, '#fff0bd', 'center');
        }
    } else {
        ctx.fillStyle = 'rgba(120,240,230,.15)'; ctx.fillRect(306, 351, 262, 10);
    }
    drawDoor(520, 174, 'CAFÉ');
    drawChest(520, 325, !state.chest2 && (state.datePlatesSolved || state.cafeShortcut) && state.waiterDefeated, '#8c75d6');
    if (!state.waiterDefeated) drawWaiter(366, 165);
    drawDoor(603, 420, state.cafeShortcut && !state.datePlatesSolved ? 'SHORTCUT' : 'JUNGLE');
    for (let i = 0; i < 12; i++) {
        const x = (i * 59 + 12) % W; const y = (i * 47 + Math.floor(state.time / 3)) % H;
        ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fillRect(x, y, 2, 2);
    }
}
function drawTechRoom() {
    // fiber-optic traces, compact workstation, arcade cabinet and potted cyber-ferns
    for (let y = 210; y < 410; y += 46) {
        ctx.strokeStyle = 'rgba(98,255,179,.5)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(130, y); ctx.lineTo(488, y); ctx.stroke();
        ctx.fillStyle = '#e7ff75'; ctx.fillRect(139, y - 3, 6, 6); ctx.fillRect(476, y - 3, 6, 6);
    }
    drawPlant(62, 185); drawPlant(577, 291);
    // Modular power station with a metal casing, inset glass readout and indicator lamps.
    ctx.fillStyle = 'rgba(9,18,27,.35)'; ctx.fillRect(82, 165, 58, 8);
    ctx.fillStyle = '#202a39'; ctx.fillRect(80, 100, 57, 70);
    ctx.fillStyle = '#516478'; ctx.fillRect(83, 103, 51, 64);
    ctx.fillStyle = '#7d8e9b'; ctx.fillRect(84, 104, 49, 3);
    ctx.fillStyle = '#293848'; ctx.fillRect(87, 108, 43, 23);
    ctx.fillStyle = '#537887'; ctx.fillRect(90, 111, 37, 17);
    ctx.fillStyle = '#87e2b6'; ctx.fillRect(93, 114, 24, 3); ctx.fillRect(93, 120, 17, 2);
    ctx.fillStyle = '#a9f16d'; ctx.fillRect(120, 114, 3, 3); ctx.fillStyle = '#ffcf68'; ctx.fillRect(120, 121, 3, 3);
    ctx.fillStyle = '#334253'; ctx.fillRect(88, 136, 40, 24);
    ctx.fillStyle = '#687888'; ctx.fillRect(91, 138, 34, 3);
    for (let i = 0; i < 5; i++) { ctx.fillStyle = i % 2 ? '#283545' : '#91a2aa'; ctx.fillRect(92 + i * 6, 145, 3, 9); }
    ctx.fillStyle = '#9cff87'; ctx.fillRect(95, 157, 4, 2); ctx.fillRect(102, 157, 4, 2);
    text('POWER', 109, 180, 9, '#9cff87', 'center');
    // Chunky arcade cabinet with lit marquee, glass screen, controls and coin slot.
    ctx.fillStyle = 'rgba(8,12,23,.38)'; ctx.fillRect(487, 178, 75, 8);
    ctx.fillStyle = '#1c2535'; ctx.fillRect(486, 130, 75, 53);
    ctx.fillStyle = '#465267'; ctx.fillRect(489, 133, 69, 47);
    ctx.fillStyle = '#222a3c'; ctx.fillRect(493, 136, 61, 36);
    ctx.fillStyle = state.circuitSolved ? '#98ff6d' : '#a73f77'; ctx.fillRect(496, 140, 55, 28);
    ctx.fillStyle = state.circuitSolved ? '#d9ff9f' : '#ef99ca'; ctx.fillRect(499, 143, 49, 2);
    ctx.fillStyle = '#232b3a'; ctx.fillRect(499, 146, 49, 17);
    ctx.fillStyle = state.circuitSolved ? '#baff76' : '#69395f'; ctx.fillRect(503, 149, 42, 11);
    ctx.fillStyle = '#efffac'; ctx.fillRect(508, 152, 7, 3); ctx.fillRect(525, 150, 10, 2);
    ctx.fillStyle = '#f35c9a'; ctx.fillRect(536, 156, 4, 3); ctx.fillStyle = '#53e8c5'; ctx.fillRect(518, 156, 3, 3);
    ctx.fillStyle = '#131b29'; ctx.fillRect(494, 169, 59, 9);
    ctx.fillStyle = '#8f7da4'; ctx.fillRect(499, 171, 15, 2);
    ctx.fillStyle = '#eb6a9f'; ctx.fillRect(526, 171, 4, 4); ctx.fillStyle = '#79eab5'; ctx.fillRect(534, 171, 4, 4);
    ctx.fillStyle = '#313f50'; ctx.fillRect(501, 179, 5, 5); ctx.fillRect(543, 179, 5, 5);
    text('ARCADE', 523, 126, 8, '#c6ffd2', 'center');
    // cable traces between rotatable junctions
    const nodeX = [210, 320, 430];
    ctx.strokeStyle = state.circuitSolved ? '#a3ff6c' : '#6d8e8d'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(139, 180); ctx.lineTo(488, 180); ctx.stroke();
    nodeX.forEach((x, i) => {
        const horizontal = state.junctions[i] === 0;
        ctx.fillStyle = i === 0 ? '#fb5775' : i === 1 ? '#5be9ac' : '#6a9dff';
        ctx.fillRect(x - 13, 167, 26, 26);
        ctx.fillStyle = '#111a27';
        if (horizontal) ctx.fillRect(x - 10, 178, 20, 4); else ctx.fillRect(x - 2, 170, 4, 20);
        ctx.fillStyle = '#fff'; ctx.fillRect(x - 2, 178, 4, 4);
        text(['RED','GREEN','BLUE'][i], x, 210, 8, '#d8ffe8', 'center');
        text(horizontal ? 'H' : 'V', x + 19, 174, 9, '#fff');
        if (state.golemRepairNode === i) {
            ctx.strokeStyle = '#ffe187'; ctx.lineWidth = 2; ctx.strokeRect(x - 16, 164, 32, 32);
            text('TEAM FIX', x, 222, 8, '#ffe187', 'center');
        }
    });
    if (!state.golemDefeated) drawGolem(500, 350, 0);
    drawChest(520, 180, !state.chest3 && state.circuitSolved && state.golemDefeated, '#79dc71');
    drawDoor(603, 420, 'STAR BRIDGE');
}
function drawStarRoom() {
    for (let i = 0; i < 52; i++) {
        const x = (i * 137 + 31) % W;
        const y = (i * 71 + 12) % 165;
        const twinkle = (Math.floor(state.time / 20) + i) % 3;
        ctx.fillStyle = twinkle === 0 ? '#fff4c9' : '#bca8ee';
        ctx.fillRect(x, y, twinkle === 0 ? 3 : 2, twinkle === 0 ? 3 : 2);
    }
    pixelText('THE LAST BRIDGE', 320, 90, 16, '#e9c6ff', 'center');
    drawPixelPerson(art.wife, 495, 263, 42, 60, '#403142');
    if (state.wifeBattleComplete) drawChest(520, 238, !state.chest4, '#e6bd4d');
}
function drawChest(x, y, visible, lidColor) {
    if (!visible) return;
    // Deep shadow and chunky wood silhouette keep the present chest legible on every floor.
    ctx.fillStyle = 'rgba(23,16,33,.38)'; ctx.fillRect(x - 19, y + 11, 38, 5);
    ctx.fillStyle = '#302137'; ctx.fillRect(x - 19, y - 8, 38, 23);
    ctx.fillStyle = '#754352'; ctx.fillRect(x - 16, y - 6, 32, 18);
    ctx.fillStyle = '#9b5b53'; ctx.fillRect(x - 13, y - 4, 26, 5);
    ctx.fillStyle = '#633b4c'; ctx.fillRect(x - 15, y + 2, 30, 3);
    ctx.fillStyle = '#8c514d'; ctx.fillRect(x - 14, y + 6, 28, 4);
    // Bright lid with a stepped lip and a tiny pixel highlight.
    ctx.fillStyle = '#302137'; ctx.fillRect(x - 19, y - 13, 38, 9);
    ctx.fillStyle = lidColor; ctx.fillRect(x - 16, y - 12, 32, 6);
    ctx.fillStyle = 'rgba(255,255,255,.34)'; ctx.fillRect(x - 13, y - 11, 11, 2);
    ctx.fillStyle = '#302137'; ctx.fillRect(x - 19, y - 5, 38, 4);
    ctx.fillStyle = '#d9ad5d'; ctx.fillRect(x - 16, y - 4, 32, 2);
    // Gold corner caps, center clasp, and readable dark pixel outlines.
    ctx.fillStyle = '#302137'; ctx.fillRect(x - 15, y - 5, 4, 17); ctx.fillRect(x + 11, y - 5, 4, 17);
    ctx.fillStyle = '#e9bd60'; ctx.fillRect(x - 14, y - 4, 2, 14); ctx.fillRect(x + 12, y - 4, 2, 14);
    ctx.fillStyle = '#302137'; ctx.fillRect(x - 4, y - 5, 8, 12);
    ctx.fillStyle = '#ffd968'; ctx.fillRect(x - 2, y - 4, 4, 8);
    ctx.fillStyle = '#fff0a6'; ctx.fillRect(x - 1, y - 3, 2, 2);
    if (Math.floor(state.time / 18) % 3 === 0) {
        ctx.fillStyle = '#fff1a6';
        ctx.fillRect(x + 22, y - 15, 2, 2);
        ctx.fillRect(x + 20, y - 13, 2, 2);
        ctx.fillRect(x + 24, y - 13, 2, 2);
        ctx.fillRect(x - 24, y - 1, 2, 2);
    }
}
function drawDoor(x, y, label) {
    ctx.fillStyle = '#422d48'; ctx.fillRect(x - 15, y - 29, 30, 40);
    ctx.fillStyle = '#9b6b8a'; ctx.fillRect(x - 11, y - 25, 22, 36);
    ctx.fillStyle = '#ffe078'; ctx.fillRect(x + 5, y - 8, 3, 3);
    text(label, x - 4, y + 22, 8, '#fff', 'center');
}
function drawPad(x, y, active, color, label) {
    ctx.fillStyle = active ? '#f7ffe8' : color; ctx.fillRect(x - 14, y - 14, 28, 28);
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.strokeRect(x - 13, y - 13, 26, 26);
    text(label, x, y + 5, 13, active ? '#3a5862' : '#243447', 'center');
}
function drawPet(x, y, bob) {
    ctx.fillStyle = '#edcc76'; ctx.fillRect(x - 17, y - 19 + bob, 34, 26); ctx.fillRect(x - 20, y - 25 + bob, 13, 13); ctx.fillRect(x + 7, y - 25 + bob, 13, 13);
    ctx.fillStyle = '#fff'; ctx.fillRect(x - 9, y - 11 + bob, 5, 5); ctx.fillRect(x + 4, y - 11 + bob, 5, 5);
    ctx.fillStyle = '#382e34'; ctx.fillRect(x - 7, y - 10 + bob, 2, 4); ctx.fillRect(x + 6, y - 10 + bob, 2, 4);
    ctx.fillStyle = '#9b5f62'; ctx.fillRect(x - 4, y - 2 + bob, 8, 4);
    ctx.strokeStyle = '#bd7c77'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x + 14, y - 3 + bob); ctx.lineTo(x + 25, y - 10 + Math.sin(state.time / 3) * 5); ctx.stroke();
}
function drawWaiter(x, y) {
    ctx.fillStyle = '#51355c'; ctx.fillRect(x - 13, y - 30, 26, 34); ctx.fillStyle = '#e9d8cc'; ctx.fillRect(x - 9, y - 25, 18, 15);
    ctx.fillStyle = '#111'; ctx.fillRect(x - 5, y - 20, 3, 3); ctx.fillRect(x + 3, y - 20, 3, 3);
    ctx.fillStyle = '#e4b55d'; ctx.fillRect(x - 16, y - 31, 32, 5); ctx.fillRect(x - 5, y - 37, 10, 7);
    ctx.fillStyle = '#d49a68'; ctx.fillRect(x - 8, y - 7, 16, 11);
}
function drawGolem(x, y, bob) {
    ctx.fillStyle = '#a98764'; ctx.fillRect(x - 20, y - 32 + bob, 40, 28); ctx.fillStyle = '#6f503e'; ctx.fillRect(x - 16, y - 27 + bob, 32, 6);
    ctx.fillStyle = '#eee2c2'; ctx.fillRect(x - 10, y - 18 + bob, 5, 4); ctx.fillRect(x + 5, y - 18 + bob, 5, 4);
    ctx.fillStyle = '#73543d'; ctx.fillRect(x - 22, y - 3 + bob, 14, 19); ctx.fillRect(x + 8, y - 3 + bob, 14, 19);
    ctx.fillStyle = '#d7b88c'; ctx.fillRect(x - 26, y + 13 + bob, 19, 8); ctx.fillRect(x + 7, y + 13 + bob, 19, 8);
    ctx.fillStyle = '#f3d78e'; ctx.fillRect(x - 4, y - 6 + bob, 8, 6);
}
function drawCompanionReaction() {
    if (companion.reactionTime <= 0) return;
    const boxW = 216;
    const boxH = 42;
    const x = Math.max(8, Math.min(W - boxW - 8, companion.x - boxW / 2));
    const y = Math.max(42, Math.min(H - boxH - 44, companion.y - 88));
    panel(x, y, boxW, boxH, '#fff8f0', '#d96699', 2);
    const tailX = Math.max(x + 18, Math.min(x + boxW - 18, companion.x));
    ctx.fillStyle = '#fff8f0';
    ctx.beginPath();
    ctx.moveTo(tailX - 5, y + boxH - 1);
    ctx.lineTo(tailX + 5, y + boxH - 1);
    ctx.lineTo(tailX, y + boxH + 7);
    ctx.fill();
    wrapTextToWidth(companion.reaction, boxW - 18, 10).slice(0, 2).forEach((line, i) => {
        pixelText(line, x + boxW / 2, y + 17 + i * 13, 10, '#5a3447', 'center');
    });
}
function drawWorld() {
    drawFloor(state.time);
    if (state.room === 0) drawHomeFurniture();
    if (state.room === 1) drawLivingRoom();
    if (state.room === 2) drawSnowRoom();
    if (state.room === 3) drawTechRoom();
    if (state.room === 4) drawStarRoom();

    // Animate the companion's steps while she moves, then settle into a gentle idle bob.
    const celebrationBounce = companion.celebrateTime > 0 ? Math.abs(Math.sin(companion.celebrateTime / 5)) * 7 : 0;
    const wifeWalking = state.mode === 'world' && companion.walking;
    const wifeBob = wifeWalking ? Math.abs(Math.sin(companion.walk * 2)) * 1.35 : Math.sin(state.time / 15) * 0.6;
    const wifeSway = wifeWalking ? Math.sin(companion.walk) * 0.65 : 0;
    drawPixelPerson(art.wife, companion.x + wifeSway, companion.y + wifeBob - celebrationBounce, 24, 34, '#302a36');
    if (companion.celebrateTime > 0 && Math.floor(companion.celebrateTime / 6) % 2 === 0) {
        drawHeart(companion.x + 15, companion.y - 44 - celebrationBounce, '#ff8db3', 0.55);
    }
    companion.hearts.forEach(h => {
        text('♥', h.x, h.y, Math.round(13 * (h.size ?? 1)), h.color ?? '#ff8bb3', 'center');
    });
    drawPixelPerson(art.husband, player.x, player.y + Math.sin(player.walk) * (player.walk ? 1.5 : 0), 23, 34, '#e8ddc8');
    drawCompanionReaction();

    // Friendly idle speech bubble
    if (state.complimentTime > 0) {
        panel(110, 278, 420, 36, '#101019', '#ffd87b', 2);
        pixelText(state.complimentBubble, 320, 301, 13, '#ffe3f1', 'center');
    }
    const roomName = rooms[state.room].name;
    ctx.fillStyle = 'rgba(0,0,0,.66)'; ctx.fillRect(8, 8, 340, 27);
    pixelText(roomName, 18, 27, 12, '#fff4dc');
    ctx.fillStyle = 'rgba(0,0,0,.68)'; ctx.fillRect(354, 8, 70, 27);
    pixelText('TAB: MAP', 389, 26, 10, '#ffe28a', 'center');
    ctx.fillStyle = 'rgba(0,0,0,.72)'; ctx.fillRect(430, 8, 202, 27);
    pixelText(`HP ${state.hp}/${state.maxHp}   PRESENTS ${state.gifts}/4`, 531, 27, 12, '#fff4dc', 'center');
    if (state.toastTime > 0) {
        panel(146, 42, 348, 29, '#15101d', '#ffe17b', 2);
        pixelText(state.toast, 320, 61, 12, '#fff', 'center');
        state.toastTime--;
    }
    if (state.room === 1) pixelText('X + direction: run / push a basket', 320, 463, 11, '#fff4d6', 'center');
    else if (state.room === 2) pixelText(state.cafeShortcut && !state.datePlatesSolved ? 'MEMORY SHORTCUT OPEN — DATE PLATES OPTIONAL' : 'Stand on Plate A; your wife will take Plate B', 320, 463, 11, '#f2fcff', 'center');
    else if (state.room === 3) pixelText(state.golemRepair && !state.circuitSolved ? 'TEAMWORK REPAIRED ONE JUNCTION — FINISH THE CIRCUIT' : 'Z at a junction rotates it: connect every cable horizontally', 320, 463, 11, '#d9ffb5', 'center');
    else pixelText('ARROWS / WASD move   Z talk   X run   TAB map   C / ESC pause', 320, 463, 10, '#fff4d6', 'center');
}

function drawMapLandmark(theme, x, y) {
    const pixel = (dx, dy, w, h, color) => {
        ctx.fillStyle = color;
        ctx.fillRect(x + dx, y + dy, w, h);
    };
    pixel(-16, -10, 32, 20, '#090a13');
    pixel(-14, 7, 28, 2, 'rgba(255,255,255,.12)');
    if (theme === 'home') {
        pixel(-11, -4, 22, 12, '#e5ded1'); pixel(-14, -6, 28, 4, '#59455c');
        pixel(-10, -8, 20, 3, '#a87683'); pixel(-3, 2, 6, 6, '#6c5261');
        pixel(-9, -2, 4, 4, '#a4dbe0'); pixel(5, -2, 4, 4, '#a4dbe0');
    } else if (theme === 'living') {
        pixel(-12, 0, 24, 8, '#784557'); pixel(-10, -5, 20, 6, '#bd7181');
        pixel(-8, -3, 7, 4, '#f1c5a8'); pixel(1, -3, 7, 4, '#f1c5a8');
        pixel(-14, 5, 3, 5, '#e2b47e'); pixel(11, 5, 3, 5, '#e2b47e');
    } else if (theme === 'snow') {
        pixel(-12, 6, 24, 3, '#526f86'); pixel(-10, 2, 9, 2, '#67a59e');
        pixel(-8, -3, 13, 2, '#67a59e'); pixel(-5, -7, 8, 3, '#83c6bc');
        pixel(4, -2, 8, 11, '#8eb6c7'); pixel(6, 0, 4, 4, '#ffebb4');
        pixel(-8, 4, 2, 2, '#fff'); pixel(-4, -1, 2, 2, '#fff');
    } else if (theme === 'tech') {
        pixel(-13, -6, 26, 13, '#273d4c'); pixel(-10, -3, 20, 2, '#4ae6ae');
        pixel(-7, 1, 14, 2, '#f15e83'); pixel(-3, -6, 2, 13, '#6a9dff');
        pixel(8, -7, 3, 3, '#bcff75'); pixel(-12, 5, 3, 3, '#bcff75');
    } else {
        pixel(-14, 3, 28, 5, '#4b3a72'); pixel(-11, 1, 22, 2, '#c694f0');
        pixel(-9, -7, 3, 3, '#ffe5a4'); pixel(6, -5, 2, 2, '#ffe5a4');
        pixel(-2, -9, 4, 4, '#fff3c3'); pixel(-1, -5, 2, 6, '#a98bd1');
    }
}
function drawWorldMap() {
    drawWorld();
    ctx.fillStyle = 'rgba(5, 4, 14, .82)';
    ctx.fillRect(0, 0, W, H);
    panel(28, 42, 584, 396, '#0b0a15', '#e7c9ff', 4);
    ctx.strokeStyle = 'rgba(255,226,138,.48)';
    ctx.lineWidth = 1;
    ctx.strokeRect(38, 52, 564, 376);
    for (let i = 0; i < 24; i++) {
        const sx = 44 + (i * 73) % 550;
        const sy = 116 + (i * 41) % 292;
        ctx.fillStyle = i % 3 === 0 ? '#70618f' : '#332b48';
        ctx.fillRect(sx, sy, i % 4 === 0 ? 3 : 2, i % 4 === 0 ? 3 : 2);
    }
    pixelText('PARTYVILLE & BEYOND', 320, 80, 22, '#ffe28a', 'center');
    pixelText('A LITTLE MAP OF THE PLACES IN YOUR STORY', 320, 101, 10, '#cbb8dc', 'center');

    const nodes = [
        { x: 86, y: 250, label: 'HOME', theme: 'home' },
        { x: 202, y: 197, label: 'LIVING ROOM', theme: 'living' },
        { x: 320, y: 250, label: 'DATE CAFE', theme: 'snow' },
        { x: 438, y: 197, label: 'TECH JUNGLE', theme: 'tech' },
        { x: 554, y: 250, label: 'STAR BRIDGE', theme: 'stars' },
    ];
    for (let i = 0; i < nodes.length - 1; i++) {
        const from = nodes[i];
        const to = nodes[i + 1];
        const complete = i < state.room;
        const controlX = (from.x + to.x) / 2;
        const controlY = (from.y + to.y) / 2 + (i % 2 ? 20 : -20);
        for (let step = 0; step <= 40; step += 2) {
            const p = step / 40;
            const q = 1 - p;
            const px = Math.round((q * q * from.x + 2 * q * p * controlX + p * p * to.x) / 4) * 4;
            const py = Math.round((q * q * from.y + 2 * q * p * controlY + p * p * to.y) / 4) * 4;
            ctx.fillStyle = '#171321'; ctx.fillRect(px - 4, py - 4, 8, 8);
            ctx.fillStyle = complete ? '#95d9a6' : '#54465e'; ctx.fillRect(px - 2, py - 2, 4, 4);
            if (step % 8 === 0) {
                ctx.fillStyle = complete ? '#e6f0b4' : '#8b779b';
                ctx.fillRect(px - 1, py - 1, 2, 2);
            }
        }
    }
    nodes.forEach((node, i) => {
        const current = i === state.room;
        const cleared = i < state.room;
        const border = current ? '#ffe17a' : cleared ? '#93e6a4' : '#756981';
        const cardFill = current ? '#30243e' : cleared ? '#15251f' : '#15111e';
        panel(node.x - 53, node.y - 31, 106, 62, cardFill, border, current ? 3 : 2);
        drawMapLandmark(node.theme, node.x, node.y - 14);
        pixelText(node.label, node.x, node.y + 5, 9, current ? '#fff0b1' : cleared ? '#c8f5cf' : '#d0c4d7', 'center');
        pixelText(current ? 'YOU ARE HERE' : cleared ? 'CLEARED' : 'UP NEXT', node.x, node.y + 22, 8, border, 'center');
        if (i > 0 && state.giftFlags[i - 1]) drawGiftIcon(node.x + 39, node.y - 28, '#f5c94f', 10);
        if (current) drawHeart(node.x, node.y - 42 + Math.sin(state.time / 8) * 2, '#ff315a', 0.55);
    });

    pixelText(`PRESENTS FOUND: ${state.gifts} / 4`, 320, 348, 14, '#ffe38b', 'center');
    pixelText('Follow the stitched path from one memory to the next.', 320, 374, 11, '#efe4f5', 'center');
    pixelText('TAB / Z: CLOSE     X: CLOSE     C / ESC: CLOSE', 320, 414, 10, '#b7a8c3', 'center');
}

// ---------- Battle engine ----------
const BATTLE_BOX = { x: 170, y: 190, w: 300, h: 150 };
const actionNames = ['FIGHT', 'ACT', 'ITEM', 'MERCY'];
function speakBattle(lines, callback) {
    startDialogue(lines, callback);
}
function toEnemyTurn(bubbleOverride = '') {
    const b = state.battle;
    if (!b) return;
    b.phase = 'enemyTalk';
    b.t = 0;
    const options = b.enemy.bubbles;
    b.bubble = bubbleOverride || options[(Math.random() * options.length) | 0];
}
function beginDodge() {
    const b = state.battle;
    b.phase = 'dodge';
    b.t = 0;
    b.bullets = [];
    const centerX = BATTLE_BOX.x + BATTLE_BOX.w / 2;
    const centerY = BATTLE_BOX.y + BATTLE_BOX.h / 2;
    b.heart = b.key === 'waiter'
        ? { x: centerX, y: centerY - 56 }
        : { x: centerX, y: centerY };
    b.patternAngle = 0;
    b.clockHands = b.key === 'waiter' ? [
        { angle: 0, length: 62, speed: 0.025, color: '#f3d27c', width: 5 },
        { angle: Math.PI, length: 44, speed: -0.038, color: '#d9c3ff', width: 4 },
    ] : [];
}
function endDodge() {
    const b = state.battle;
    if (!b) return;
    b.bullets = [];
    if (b.key === 'wife' && b.love >= 100) finishWifeRound();
    else b.phase = 'menu';
}
function drawBattleEnemy(t) {
    const b = state.battle;
    const bob = Math.sin(t / 240) * 3;
    const x = 320;
    const y = 142 + bob;
    if (b.key === 'pet') drawPet(x, y, bob);
    else if (b.key === 'waiter') drawWaiter(x, y + 6);
    else if (b.key === 'golem') drawGolem(x, y + 5, bob);
    else if (art.wife) drawPixelPerson(art.wife, x, y + 9, 75, 103, '#342b36');
    else drawPixelPerson(null, x, y + 8, 66, 80, '#28222c');
    if (b.key === 'pet') {
        ctx.fillStyle = '#f6d66d'; ctx.fillRect(288, 155 + bob, 64, 22); ctx.fillStyle = '#4a3950'; ctx.fillRect(303, 162 + bob, 5, 5); ctx.fillRect(332, 162 + bob, 5, 5);
    }
    if (b.key === 'golem') {
        ctx.fillStyle = '#c19b68'; ctx.fillRect(284, 154 + bob, 72, 17); ctx.strokeStyle = '#eed2a4'; ctx.lineWidth = 3; ctx.strokeRect(284, 154 + bob, 72, 17);
    }
}
function spawnProjectile(x, y, vx, vy, type = 'normal', color = '#fff') {
    state.battle.bullets.push({ x, y, vx, vy, type, color, life: 360, angle: 0 });
}
function spawnPattern() {
    const b = state.battle;
    const t = b.t;
    const box = BATTLE_BOX;
    if (b.key === 'pet') {
        if (t % 22 === 0) {
            const startX = t % 44 === 0 ? box.x - 8 : box.x + box.w + 8;
            const startY = box.y + 14 + Math.random() * (box.h - 28);
            spawnProjectile(startX, startY, startX < box.x ? 2.3 : -2.3, (Math.random() - 0.5) * 1.7, 'duck', '#f8de77');
        }
        if (t % 49 === 0) spawnProjectile(box.x + Math.random() * box.w, box.y - 8, (Math.random() - .5) * 1.1, 2.1, 'bone', '#eee4cc');
    } else if (b.key === 'golem') {
        if (t % 23 === 0) {
            const side = Math.random() < .5;
            spawnProjectile(side ? box.x - 8 : box.x + box.w + 8, box.y + 12 + Math.random() * 125, side ? 2.6 : -2.6, (Math.random() - .5) * 1, 'wrench', '#d8d5c7');
        }
        if (t % 35 === 0) spawnProjectile(box.x + 20 + Math.random() * 260, box.y - 8, 0, 2.4, 'dowel', '#c69b69');
    } else if (b.key === 'wife') {
        if (t % 23 === 0) {
            const type = (t / 23) % 3 === 0 ? 'text' : (t / 23) % 2 === 0 ? 'star' : 'love';
            const x = box.x + 15 + Math.random() * (box.w - 30);
            spawnProjectile(x, box.y - 9, (Math.random() - .5) * 1.1, 1.25 + Math.random() * .6, type, type === 'love' ? '#ff91c2' : '#fff0a4');
            const newest = b.bullets[b.bullets.length - 1];
            if (type === 'text') newest.label = ['YOU\'RE AMAZING!', 'BEST HUSBAND!', 'HAPPY BIRTHDAY!'][(Math.random() * 3) | 0];
        }
    }
}
function projectileHitsHeart(p, heart) {
    const radius = p.type === 'text' ? 16 : p.type === 'wrench' ? 9 : 8;
    return Math.abs(p.x - heart.x) < radius + 5 && Math.abs(p.y - heart.y) < radius + 5;
}
function distanceToSegment(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lengthSquared = dx * dx + dy * dy;
    const along = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (lengthSquared || 1)));
    return Math.hypot(px - (x1 + along * dx), py - (y1 + along * dy));
}
function updateBattle() {
    const b = state.battle;
    if (!b) return;
    b.t++;
    if (b.invuln > 0) b.invuln--;
    if (b.supportMessageTime > 0) b.supportMessageTime--;
    if (b.phase === 'flash') {
        if (b.t >= 36) speakBattle([b.enemy.intro], () => { if (state.battle) state.battle.phase = 'menu'; });
        return;
    }
    if (b.phase === 'enemyTalk') {
        if (b.t >= 150) beginDodge();
        return;
    }
    if (b.phase === 'menu') {
        if (pressed.arrowleft || pressed.a) { b.selected = (b.selected + 3) % 4; beep(540); }
        if (pressed.arrowright || pressed.d) { b.selected = (b.selected + 1) % 4; beep(620); }
        if (confirmPressed()) chooseBattleAction(b.selected);
        return;
    }
    if (b.phase === 'act' || b.phase === 'item' || b.phase === 'mercy') {
        const list = currentSubOptions(b);
        const cols = b.phase === 'act' ? 2 : 1;
        if (pressed.arrowleft || pressed.a) b.sub = (b.sub + list.length - 1) % list.length;
        if (pressed.arrowright || pressed.d) b.sub = (b.sub + 1) % list.length;
        if (cols === 2 && (pressed.arrowup || pressed.w || pressed.arrowdown || pressed.s)) {
            const row = b.sub < 2 ? 0 : 1;
            b.sub = (b.sub + (row === 0 ? 2 : -2) + list.length) % list.length;
        }
        if (cancelPressed() || pressed.escape) { b.phase = 'menu'; b.sub = 0; beep(340); return; }
        if (confirmPressed()) chooseSubOption();
        return;
    }
    if (b.phase === 'attack') {
        const barMin = BATTLE_BOX.x + 22;
        const barMax = BATTLE_BOX.x + BATTLE_BOX.w - 22;
        b.attackX += b.attackDir * 5.1;
        if (b.attackX >= barMax - barMin) { b.attackX = barMax - barMin; b.attackDir = -1; }
        if (b.attackX <= 0) { b.attackX = 0; b.attackDir = 1; }
        if (confirmPressed() || b.t > 300) {
            const impactX = barMin + b.attackX;
            const center = BATTLE_BOX.x + BATTLE_BOX.w / 2;
            const accuracy = Math.abs(impactX - center);
            const damage = accuracy <= 18 ? 1 : 0;
            b.hp = Math.max(0, b.hp - damage);
            if (damage > 0) b.didDamage = true;
            b.lastDamage = damage;
            b.hitFlash = 25;
            b.phase = 'attackResult';
            beep(damage ? 180 : 330, 0.16, damage ? 'sawtooth' : 'square', 0.07);
            if (b.hp === 0) b.canSpare = true;
            speakBattle([damage ? '* A perfectly-timed birthday bonk! 1 damage!' : '* A playful near miss. 0 damage!', damage ? `* ${b.enemy.name} wobbles with a grin.` : '* The target says: try for the very center!'], () => {
                if (b.key === 'wife') { b.love = Math.min(100, b.love + 10); toEnemyTurn('A warm hug.'); }
                else toEnemyTurn();
            });
        }
        return;
    }
    if (b.phase === 'dodge') updateDodge();
}
function currentSubOptions(b) {
    if (b.phase === 'act') {
        if (b.key === 'pet') return ['Check', 'Offer Treat', 'Tell a Joke', 'Scratch Ears'];
        if (b.key === 'waiter') {
            if (b.question === 0) return ['At the playground', 'At the movies', 'At a restaurant', 'At work'];
            if (b.question === 1) return ['Hot Chocolate', 'Coffee', 'Tea', 'Apple Cider'];
            return ['Both answers correct!'];
        }
        if (b.key === 'golem') return ['Check', 'Call Wife for Help', 'Read Instructions', 'Encourage'];
        return ['Reminisce', 'Compliment', 'Proclaim Love'];
    }
    if (b.phase === 'item') return state.inventory.map(item => `${item.name} x${item.count}`);
    if (b.phase === 'mercy') return ['Spare', 'Flee'];
    return [];
}
function chooseBattleAction(index) {
    const b = state.battle;
    if (b.key === 'wife' && index === 0) {
        b.love = Math.min(100, b.love + 10);
        speakBattle(['* You embrace her tightly. High-quality warmth!', '* WIFE: "You give the coziest hugs."'], () => toEnemyTurn('A warm hug.'));
        return;
    }
    if (index === 0) {
        b.phase = 'attack'; b.attackX = 0; b.attackDir = 1; b.t = 0;
        beep(720, .05);
    } else if (index === 1) { b.phase = 'act'; b.sub = 0; }
    else if (index === 2) { b.phase = 'item'; b.sub = 0; }
    else { b.phase = 'mercy'; b.sub = 0; }
}
function chooseSubOption() {
    const b = state.battle;
    const options = currentSubOptions(b);
    const option = options[b.sub];
    beep(760, .04);
    if (b.phase === 'act') chooseAct(option);
    else if (b.phase === 'item') chooseItem(b.sub);
    else if (b.phase === 'mercy') chooseMercy(option);
}
function chooseAct(option) {
    const b = state.battle;
    if (b.key === 'pet') {
        if (option === 'Offer Treat') {
            b.canSpare = true;
            b.actMercy = true;
            speakBattle(['* You offer the Pet Sentry a little birthday treat.', 'PET SENTRY: "Woof! (Yummy!)"', '* Its name turns golden. You may spare it.'], () => toEnemyTurn('Woof! (Yummy!)'));
        } else if (option === 'Check') {
            speakBattle(['* PET SENTRY - ATK 2 DEF 1.', '* It loves squeaky toys, snacks, and enthusiastic people.'], () => toEnemyTurn());
        } else {
            speakBattle([option === 'Tell a Joke' ? '* You tell a joke about a bone.' : '* You scratch behind its ears.', '* Its tail makes a dangerously fast circle.'], () => toEnemyTurn());
        }
        return;
    }
    if (b.key === 'waiter') {
        if (b.question >= 2) {
            speakBattle(['* The Memory Keeper has no more questions. Your answers were impeccable.'], () => toEnemyTurn('A perfect memory!'));
            return;
        }
        const answers = ['At the playground', 'Hot Chocolate'];
        if (option === answers[b.question]) {
            const answeredQuestion = b.question;
            b.rightAnswers++;
            b.question++;
            const quizComplete = b.question >= answers.length;
            if (quizComplete) {
                b.canSpare = true;
                b.actMercy = true;
            }
            const lines = quizComplete
                ? ['MEMORY KEEPER: "Correct! Your favorite cozy drink is Hot Chocolate!"', '* Both answers are right. The Memory Keeper’s name turns yellow. Choose MERCY, then SPARE.']
                : ['MEMORY KEEPER: "Correct! We met at the playground."', '* Last question: what is your favorite cozy drink?'];
            speakBattle(lines, () => toEnemyTurn(quizComplete ? 'Your answers were impeccable!' : 'One more memory...'));
        } else {
            speakBattle([`* ${option}...`, '* The Memory Keeper taps the clock. That is not quite right.'], () => toEnemyTurn('Try another memory.'));
        }
        return;
    }
    if (b.key === 'golem') {
        if (option === 'Call Wife for Help') {
            b.canSpare = true;
            b.actMercy = true;
            speakBattle(['* You call your wife into the arena.', '* She winks, hands you a hammer, and helps the golem find the correct page.', 'WIFE: "Teamwork makes the dream work, handsome!"', '* The golem sets down its wrench. Its name turns golden.'], () => toEnemyTurn('The instructions make sense now!'));
        } else {
            speakBattle(option === 'Check'
                ? ['* FLAT-PACK GOLEM - ATK 3 DEF 2.', '* It has 47 screws and one mysterious extra dowel.']
                : [option === 'Read Instructions' ? '* You turn the instruction sheet right-side up.' : '* You encourage it to take its time.', '* The golem looks a little less stressed.'], () => toEnemyTurn());
        }
        return;
    }
    if (b.key === 'wife') {
        const acts = {
            Reminisce: ['* You remember your first kiss at the park and all those lovely pizza nights together.', 'WIFE: "My favorite memories are the ones I get to share with you."'],
            Compliment: ['* You tell her she looks stunning today.', 'WIFE: "Look who\'s talking! Have you seen yourself in the mirror?"'],
            'Proclaim Love': ['* You declare your love loudly!', 'WIFE: "I loved you yesterday, I love you today, and I\'ll love you forever!"'],
        };
        const hadAct = b.acted.has(option);
        b.acted.add(option);
        if (!hadAct) b.love = Math.min(100, b.love + 25);
        speakBattle(acts[option].concat([`* LOVE METER +${hadAct ? '0' : '25'}%`]), () => toEnemyTurn());
    }
}
function chooseItem(index) {
    const b = state.battle;
    const item = state.inventory[index];
    if (!item || item.count <= 0) {
        speakBattle(['* That part of your inventory is empty.'], () => { b.phase = 'menu'; });
        return;
    }
    if (state.hp >= state.maxHp) {
        speakBattle(['* You are already at full HP. Save it for a cozier moment.'], () => { b.phase = 'menu'; });
        return;
    }
    item.count--;
    state.hp = Math.min(state.maxHp, state.hp + item.heal);
    playClip(jingleSound);
    let line;
    if (item.name === 'Pizza Slice') line = '* You ate a slice of cheesy Pizza! Tastes like gaming night.';
    else if (item.name === 'Hot Chocolate') line = '* You drank warm Hot Chocolate! Cozy vibes restored.';
    else if (item.name === 'Orange Juice') line = '* You drank a glass of fresh Orange Juice! Pure energy boost.';
    else line = '* You ate a sweet buttery Biscuit! Max comfort achieved.';
    speakBattle([line, `* HP restored. (${state.hp}/${state.maxHp})`], () => toEnemyTurn());
}
function chooseMercy(option) {
    const b = state.battle;
    if (option === 'Flee') {
        speakBattle(['* You step out of the battle for now.', '* You can return when you are ready.'], () => {
            if (b.key === 'pet') state.petDefeated = false;
            if (b.key === 'waiter') state.waiterDefeated = false;
            if (b.key === 'golem') state.golemDefeated = false;
            if (b.key === 'wife') state.wifeBattleComplete = false;
            state.battle = null;
            state.mode = 'world';
        });
        return;
    }
    if (b.key === 'wife' && b.love >= 100) { finishWifeRound(); return; }
    if (b.canSpare) {
        b.spared = true;
        const mercyLine = b.didDamage ? '* You stop before the fight can go any further.' : '* You chose understanding over a final hit.';
        speakBattle([`* You spare ${b.enemy.name}.`, mercyLine], () => winEncounter());
    } else {
        speakBattle([`* ${b.enemy.name} is not ready to stop just yet.`], () => toEnemyTurn());
    }
}
function spendPetAssist(b) {
    if (b.petAssistCharge <= 0) return false;
    b.petAssistCharge--;
    b.supportMessage = 'Your puppy pal swats the hit away!';
    b.supportMessageTime = 110;
    beep(1040, 0.13, 'triangle', 0.065);
    return true;
}
function updateDodge() {
    const b = state.battle;
    const axis = moveAxis();
    const speed = 3;
    const length = Math.hypot(axis.x, axis.y) || 1;
    b.heart.x += axis.x / length * speed;
    b.heart.y += axis.y / length * speed;
    b.heart.x = Math.max(BATTLE_BOX.x + 9, Math.min(BATTLE_BOX.x + BATTLE_BOX.w - 9, b.heart.x));
    b.heart.y = Math.max(BATTLE_BOX.y + 9, Math.min(BATTLE_BOX.y + BATTLE_BOX.h - 9, b.heart.y));
    if (b.key === 'waiter') {
        b.clockHands.forEach(hand => { hand.angle += hand.speed; });
    } else {
        spawnPattern();
    }
    for (const bullet of b.bullets) {
        bullet.x += bullet.vx;
        bullet.y += bullet.vy;
        bullet.life--;
        if (bullet.type === 'clock') bullet.angle += 0.05;
        if (!projectileHitsHeart(bullet, b.heart)) continue;
        if (spendPetAssist(b)) {
            bullet.dead = true;
            continue;
        }
        if (b.key === 'wife') {
            b.love = Math.min(100, b.love + 5);
            state.hp = Math.min(state.maxHp, state.hp + 2);
            bullet.dead = true;
            beep(940, .07, 'triangle', .045);
        } else if (b.invuln === 0) {
            state.hp = Math.max(0, state.hp - b.enemy.atk);
            b.invuln = 60;
            bullet.dead = true;
            playClip(hurtSound);
            beep(110, .18, 'sawtooth', .09);
            if (state.hp <= 0) {
                state.mode = 'gameover';
                state.gameOverSelection = 0;
                state.endTime = 0;
                return;
            }
        }
    }
    if (b.key === 'waiter' && b.invuln === 0) {
        const centerX = BATTLE_BOX.x + BATTLE_BOX.w / 2;
        const centerY = BATTLE_BOX.y + BATTLE_BOX.h / 2;
        const hitByClock = b.clockHands.some(hand => {
            const endX = centerX + Math.cos(hand.angle) * hand.length;
            const endY = centerY + Math.sin(hand.angle) * hand.length;
            return distanceToSegment(b.heart.x, b.heart.y, centerX, centerY, endX, endY) < hand.width / 2 + 6;
        });
        if (hitByClock) {
            if (spendPetAssist(b)) {
                b.invuln = 24;
            } else {
                state.hp = Math.max(0, state.hp - b.enemy.atk);
                b.invuln = 60;
                playClip(hurtSound);
                beep(110, .18, 'sawtooth', .09);
                if (state.hp <= 0) {
                    state.mode = 'gameover';
                    state.gameOverSelection = 0;
                    state.endTime = 0;
                    return;
                }
            }
        }
    }
    b.bullets = b.bullets.filter(p => !p.dead && p.life > 0 && p.x > BATTLE_BOX.x - 35 && p.x < BATTLE_BOX.x + BATTLE_BOX.w + 35 && p.y > BATTLE_BOX.y - 35 && p.y < BATTLE_BOX.y + BATTLE_BOX.h + 35);
    if (b.key === 'wife' && b.love >= 100) { finishWifeRound(); return; }
    if (b.t >= 300) endDodge();
}
function finishWifeRound() {
    const b = state.battle;
    if (!b || b.key !== 'wife' || b.phase === 'finale') return;
    b.phase = 'finale';
    speakBattle([
        '* WIFE: "You really remember everything! You\'re truly my favorite person in the entire universe."',
        '* She gives you a long, loving hug. The stars turn warm pink.',
        '* WIFE chooses SPARE. A golden chest drops onto the bridge!'], () => {
        state.wifeBattleComplete = true;
        state.battle = null;
        state.mode = 'world';
        triggerCompanionReaction('WIFE: My forever favorite adventure.', 4);
        state.hp = Math.min(state.maxHp, state.hp + 5);
        playClip(jingleSound);
    });
}
function winEncounter() {
    const b = state.battle;
    if (!b) return;
    const key = b.key;
    const peacefulAct = b.spared && b.actMercy && !b.didDamage;
    let repairedJunction = -1;
    state.battle = null;
    state.mode = 'world';
    if (key === 'pet') {
        state.petDefeated = true;
        if (peacefulAct) state.petFriend = true;
    }
    if (key === 'waiter') {
        state.waiterDefeated = true;
        if (peacefulAct) state.cafeShortcut = true;
    }
    if (key === 'golem') {
        state.golemDefeated = true;
        if (peacefulAct) {
            state.golemRepair = true;
            if (!state.circuitSolved) {
                repairedJunction = state.junctions.lastIndexOf(1);
                if (repairedJunction >= 0) {
                    state.junctions[repairedJunction] = 0;
                    state.golemRepairNode = repairedJunction;
                }
                state.circuitSolved = state.junctions.every(value => value === 0);
            }
        }
    }
    state.level = Math.max(state.level, key === 'pet' ? 2 : key === 'waiter' ? 3 : 4);
    const guardianReactions = peacefulAct ? {
        pet: 'WIFE: You cared for him, and now he cares for you!',
        waiter: 'WIFE: You remembered the little things. So did he!',
        golem: 'WIFE: Our teamwork fixed more than a desk!',
    } : {
        pet: 'WIFE: We made it through together!',
        waiter: 'WIFE: You got through the café quiz!',
        golem: 'WIFE: We made it through the tech jungle!',
    };
    triggerCompanionReaction(guardianReactions[key] || 'WIFE: We make a great team!', state.level);
    playClip(jingleSound);
    beep(880, .24, 'triangle', .08);
    if (key === 'pet' && peacefulAct) {
        startDialogue(['* The Pet Sentry bounds beside you, tail thumping.', '* WIFE: "You were so gentle with him. Your new puppy pal will swat away one hit in each future guardian battle!"']);
    } else if (key === 'pet') startDialogue(['* The Pet Sentry rolls over, tail thumping.', '* WIFE: "We made it through together. The chest is all yours."']);
    else if (key === 'waiter' && peacefulAct) {
        startDialogue(['* The Memory Keeper smiles at how carefully you remembered.', '* He unlocks a café service shortcut: the date plates are optional on the way to the next room.', '* WIFE: "All those little things matter. I love that you remembered them."']);
    } else if (key === 'waiter') startDialogue(['* The Memory Keeper nods, satisfied with your story.', '* The café cabinet clicks open.']);
    else if (key === 'golem' && peacefulAct) {
        const repairedName = repairedJunction >= 0 ? ['RED', 'GREEN', 'BLUE'][repairedJunction] : '';
        const repairLine = repairedJunction >= 0
            ? `* The three of you reconnect the ${repairedName} junction. One less cable to fix!`
            : '* The golem helps your team double-check the circuit. Every connection is ready!';
        startDialogue(['* You chose teamwork over a bonk, and your wife joins the golem at the wiring.', repairLine, '* WIFE: "We fix everything better together, handsome."']);
    } else startDialogue(['* The Flat-Pack Golem lowers its hammer.', '* Together, you finally understand the instruction sheet.']);
}
function drawSpeechBubble(message) {
    panel(414, 48, 210, 55, '#fffdf1', '#352a3b', 2);
    ctx.fillStyle = '#fffdf1'; ctx.beginPath(); ctx.moveTo(416, 91); ctx.lineTo(399, 105); ctx.lineTo(424, 99); ctx.fill();
    const lines = wrapTextToWidth(message || '...', 188, 11).slice(0, 3);
    lines.forEach((line, i) => pixelText(line, 519, 67 + i * 14, 11, '#221e29', 'center'));
}
function drawBattleProjectile(p) {
    if (p.type === 'duck') {
        ctx.fillStyle = p.color; ctx.beginPath(); ctx.ellipse(p.x, p.y, 8, 6, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#e88940'; ctx.fillRect(p.x + (p.vx > 0 ? 6 : -9), p.y - 1, 4, 3); ctx.fillStyle = '#222'; ctx.fillRect(p.x - 2, p.y - 2, 2, 2);
    } else if (p.type === 'bone' || p.type === 'dowel') {
        ctx.fillStyle = p.color; ctx.fillRect(p.x - 3, p.y - 9, 6, 18); ctx.fillRect(p.x - 6, p.y - 9, 4, 5); ctx.fillRect(p.x + 2, p.y - 9, 4, 5); ctx.fillRect(p.x - 6, p.y + 4, 4, 5); ctx.fillRect(p.x + 2, p.y + 4, 4, 5);
    } else if (p.type === 'wrench') {
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(Math.atan2(p.vy, p.vx));
        ctx.fillStyle = p.color; ctx.fillRect(-3, -10, 6, 18); ctx.fillRect(-8, -12, 6, 5); ctx.fillRect(2, -12, 6, 5); ctx.restore();
    } else if (p.type === 'clock') {
        ctx.fillStyle = p.color; ctx.fillRect(p.x - 3, p.y - 3, 6, 6); ctx.fillRect(p.x - 1, p.y - 8, 2, 5);
    } else if (p.type === 'love') {
        text('♥', p.x, p.y + 5, 17, '#ff8dbd', 'center');
    } else if (p.type === 'star') {
        text('★', p.x, p.y + 5, 16, '#fff19c', 'center');
    } else if (p.type === 'text') {
        ctx.font = '9px "Courier New", monospace'; ctx.textAlign = 'center';
        const width = ctx.measureText(p.label || 'HAPPY BIRTHDAY').width + 8;
        ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.fillRect(p.x - width / 2, p.y - 8, width, 15);
        text(p.label || 'HAPPY BIRTHDAY', p.x, p.y + 3, 8, '#70456c', 'center');
    }
}
function drawBattleClockHand(hand, centerX, centerY) {
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(hand.angle);
    ctx.fillStyle = '#352b3d';
    ctx.fillRect(-1, -hand.width / 2 - 1, hand.length + 2, hand.width + 2);
    ctx.fillStyle = hand.color;
    ctx.fillRect(0, -hand.width / 2, hand.length, hand.width);
    ctx.fillStyle = '#fff4c2';
    ctx.fillRect(hand.length - 7, -1, 5, 2);
    ctx.restore();
}
function drawSwordIcon(x, y, color) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(-Math.PI / 4); ctx.fillStyle = color;
    ctx.fillRect(-2, -12, 4, 22); ctx.fillRect(-6, -15, 12, 6); ctx.fillRect(-2, 10, 4, 7); ctx.restore();
}
function drawActionIcon(index, x, y, color, battleKey = '') {
    if (index === 0 && battleKey === 'wife') {
        ctx.fillStyle = color;
        ctx.fillRect(x - 8, y - 9, 6, 6); ctx.fillRect(x + 2, y - 9, 6, 6);
        ctx.fillRect(x - 9, y - 2, 8, 13); ctx.fillRect(x + 1, y - 2, 8, 13);
        ctx.fillRect(x - 4, y - 5, 9, 4); ctx.fillRect(x - 2, y - 1, 5, 11);
    } else if (index === 0) drawSwordIcon(x, y, color);
    else if (index === 1) {
        ctx.fillStyle = color; ctx.fillRect(x - 2, y - 2, 4, 4); ctx.fillRect(x - 8, y - 7, 2, 14); ctx.fillRect(x + 6, y - 7, 2, 14); ctx.fillRect(x - 13, y - 11, 2, 22); ctx.fillRect(x + 11, y - 11, 2, 22);
    } else if (index === 2) {
        ctx.fillStyle = color; ctx.fillRect(x - 8, y - 4, 16, 13); ctx.fillRect(x - 5, y - 9, 10, 6); ctx.fillStyle = '#18131c'; ctx.fillRect(x - 2, y - 4, 4, 13);
    } else drawHeart(x, y, '#ff274b', 0.75);
}
function drawBattleSubmenu(b) {
    const options = currentSubOptions(b);
    const grid = b.phase === 'act';
    panel(180, 196, 280, 138, '#000', '#fff', 3);
    if (b.phase === 'act' && b.key === 'waiter') {
        const question = b.question === 0 ? 'WHERE DID WE MEET?'
            : b.question === 1 ? 'FAVORITE COZY DRINK?'
                : 'BOTH ANSWERS CORRECT!';
        pixelText(question, 320, 214, 11, '#d6d0ff', 'center');
    }
    options.forEach((option, index) => {
        const x = grid ? (index % 2 === 0 ? 190 : 320) : 201;
        const y = grid ? (index < 2 ? 247 : 294) : 225 + index * 26;
        const selected = index === b.sub;
        if (grid) {
            if (selected) drawHeart(x + 11, y - 5, '#ff274b', 0.72);
            wrapTextToWidth(option, 100, 10).slice(0, 2).forEach((line, lineIndex) => {
                pixelText(line, x + 80, y + lineIndex * 12, 10, selected ? '#ffe978' : '#fff', 'center');
            });
        } else {
            const label = option.length > 19 ? option.slice(0, 18) + '…' : option;
            if (b.phase === 'item') {
                const item = state.inventory[index];
                drawItemIcon(item.name, x + 14, y - 17, 20);
                pixelText(`* ${label}`, x + 39, y, 12, selected ? '#ffe978' : '#fff');
                pixelText(`+${item.heal} HP`, 427, y, 10, item.count ? '#9bebc1' : '#777');
            } else {
                if (selected) drawHeart(x - 4, y - 5, '#ff274b', 0.72);
                pixelText(`* ${label}`, x + 10, y, 12, selected ? '#ffe978' : '#fff');
            }
        }
    });
    pixelText('X / SHIFT: BACK', 320, 328, 9, '#9c9ca8', 'center');
}
function drawBattle() {
    const b = state.battle;
    if (b.phase === 'flash') {
        ctx.fillStyle = Math.floor(b.t / 6) % 2 === 0 ? '#fff' : '#000';
        ctx.fillRect(0, 0, W, H);
        if (Math.floor(b.t / 6) % 2 === 0) drawHeart(320, 265, '#ff274b', 1.2);
        return;
    }
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    drawBattleEnemy(state.time);
    drawSpeechBubble(b.bubble || (b.key === 'wife' ? 'Ready for the final round?' : '...'));
    if (b.petAssistCharge > 0) pixelText('PUPPY GUARD: READY', 20, 25, 10, '#ffd67b');
    if (b.key === 'waiter') {
        pixelText(b.enemy.name.toUpperCase(), 320, 184, 11, b.canSpare ? '#ffe94a' : '#f2edff', 'center');
    }
    if (b.key === 'wife') {
        const filled = Math.floor(b.love / 5);
        pixelText('LOVE METER', 320, 22, 12, '#ffe9aa', 'center');
        ctx.fillStyle = '#381a2b'; ctx.fillRect(217, 29, 206, 13);
        ctx.fillStyle = '#ff9abd'; ctx.fillRect(220, 32, filled * 10, 7);
        ctx.strokeStyle = '#fff1dd'; ctx.strokeRect(217, 29, 206, 13);
        pixelText(`${b.love}%`, 430, 40, 11, '#fff', 'left');
    }
    // Requested 300x150 bullet box, rendered at exact positions.
    panel(BATTLE_BOX.x, BATTLE_BOX.y, BATTLE_BOX.w, BATTLE_BOX.h, '#000', '#fff', 4);
    if (b.phase === 'dodge') {
        if (b.key === 'waiter') {
            const centerX = BATTLE_BOX.x + BATTLE_BOX.w / 2;
            const centerY = BATTLE_BOX.y + BATTLE_BOX.h / 2;
            b.clockHands.forEach(hand => drawBattleClockHand(hand, centerX, centerY));
            ctx.fillStyle = '#fff0ae';
            ctx.beginPath(); ctx.arc(centerX, centerY, 5, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#43354b';
            ctx.fillRect(centerX - 1, centerY - 2, 2, 5);
        }
        b.bullets.forEach(drawBattleProjectile);
        if (b.invuln === 0 || Math.floor(b.invuln / 5) % 2 === 0) drawHeart(b.heart.x, b.heart.y, '#ff1e42');
        if (b.supportMessageTime > 0) pixelText(b.supportMessage, 320, 355, 10, '#ffd67b', 'center');
        else if (b.key === 'wife') pixelText('HEARTS & STARS RESTORE HP + LOVE', 320, 355, 10, '#ffd0e1', 'center');
        else if (b.key === 'waiter') pixelText('ORBIT THE CENTER TO DODGE THE CLOCK HANDS', 320, 355, 10, '#e0d3f2', 'center');
        else pixelText('MOVE: ARROWS / WASD     DODGE!', 320, 355, 10, '#c5bdc8', 'center');
    } else if (b.phase === 'attack') {
        ctx.fillStyle = '#17121d'; ctx.fillRect(190, 246, 260, 36);
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.strokeRect(190, 246, 260, 36);
        ctx.fillStyle = '#49825d'; ctx.fillRect(302, 248, 36, 32);
        ctx.fillStyle = '#fff'; ctx.fillRect(190 + b.attackX, 242, 4, 44);
        pixelText(b.key === 'wife' ? 'HUG! PRESS Z NEAR CENTER' : 'PRESS Z NEAR THE CENTER', 320, 309, 12, '#fff', 'center');
    } else if (b.phase === 'act' || b.phase === 'item' || b.phase === 'mercy') {
        drawBattleSubmenu(b);
    } else {
        const description = b.key === 'wife' ? 'A lifetime of birthday memories shines between you.' : b.canSpare ? `${b.enemy.name} seems ready to make peace.` : `${b.enemy.name} is waiting for your next move.`;
        const lines = wrapTextToWidth(description, BATTLE_BOX.w - 44, 12).slice(0, 3);
        const centerX = BATTLE_BOX.x + BATTLE_BOX.w / 2;
        const centerY = BATTLE_BOX.y + BATTLE_BOX.h / 2 + 4;
        lines.forEach((line, i) => pixelText(line, centerX, centerY + (i - (lines.length - 1) / 2) * 20, 12, b.canSpare ? '#ffed74' : '#fff', 'center'));
        if (b.phase === 'enemyTalk') {
            ctx.strokeStyle = '#ffdf80'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(BATTLE_BOX.x + BATTLE_BOX.w / 2, BATTLE_BOX.y + BATTLE_BOX.h / 2, 15 + Math.sin(b.t / 5) * 2, 0, Math.PI * 2); ctx.stroke();
        }
    }

    // Exact husband / LV / HP status row.
    pixelText('HUSBAND', 170, 375, 14, '#fff');
    pixelText(`LV ${state.level}`, 290, 375, 14, '#fff');
    pixelText('HP', 370, 375, 14, '#fff');
    ctx.fillStyle = '#7d141b'; ctx.fillRect(398, 362, 100, 13);
    ctx.fillStyle = '#ff0000'; ctx.fillRect(398, 362, 100, 13);
    ctx.fillStyle = '#ffff00'; ctx.fillRect(398, 362, Math.max(0, 100 * state.hp / state.maxHp), 13);
    pixelText(`${state.hp} / ${state.maxHp}`, 506, 375, 12, '#fff');

    actionNames.forEach((baseName, i) => {
        const x = 20 + i * 155;
        const selected = b.selected === i && (b.phase === 'menu' || b.phase === 'attack');
        const pacified = i === 3 && b.canSpare;
        const pulse = pacified && Math.floor(state.time / 18) % 2 === 0;
        const color = selected || pulse ? '#ffff00' : '#ff9900';
        const label = b.key === 'wife' && i === 0 ? 'HUG' : baseName;
        ctx.fillStyle = '#000'; ctx.fillRect(x, 400, 110, 42);
        ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.strokeRect(x + 1, 401, 108, 40);
        if (selected && b.phase === 'menu') drawHeart(x + 15, 421, '#ff0000', .75);
        else drawActionIcon(i, x + 17, 421, color, b.key);
        pixelText(label, x + 64, 427, 14, color, 'center');
    });
}

// ---------- Pause/settings UI ----------
function updateMap() {
    if (confirmPressed() || cancelPressed() || pausePressed()) {
        state.mode = 'world';
        beep(520, 0.04, 'triangle', 0.035);
    }
}
function togglePause() {
    if (state.mode === 'world' || state.mode === 'battle') {
        state.previousMode = state.mode;
        state.pauseSelection = 0;
        state.mode = 'pause';
    } else if (state.mode === 'pause') state.mode = state.previousMode;
}
function applyPauseChoice(index) {
    if (index === 0) state.mode = state.previousMode;
    else if (index === 1) restartCurrentRoom();
    else if (index === 2) returnToLatestClearedLandmark();
    else if (index === 3) state.crt = !state.crt;
}
function pauseChoiceDescription(index) {
    if (index === 0) return 'Continue exactly where you left off.';
    if (index === 1) return 'Only this room restarts; collected presents stay safe.';
    if (index === 2) return `Return to ${landmarkNames[state.latestClearedRoom]}; this room’s progress stays saved.`;
    return 'Toggle the scanline effect. Sound is toggled with M.';
}
function drawPause() {
    if (state.previousMode === 'battle') drawBattle(); else drawWorld();
    ctx.fillStyle = 'rgba(0,0,0,.78)'; ctx.fillRect(0, 0, W, H);
    panel(96, 45, 448, 390, '#08080d', '#fff', 4);
    pixelText('PAUSED', 320, 83, 24, '#ffe176', 'center');
    pixelText('Your presents and cleared landmarks are safe.', 320, 107, 11, '#d9d2df', 'center');
    const options = [
        'RESUME ADVENTURE',
        'RESTART THIS ROOM',
        `RETURN TO ${landmarkNames[state.latestClearedRoom]}`,
        `CRT SCANLINES: ${state.crt ? 'ON' : 'OFF'}`,
    ];
    options.forEach((label, index) => {
        const y = 124 + index * 40;
        const selected = index === state.pauseSelection;
        panel(130, y, 380, 34, selected ? '#282036' : '#111018', selected ? '#ffe176' : '#77717f', 2);
        pixelText(label, 320, y + 22, 12, selected ? '#ffe176' : '#fff', 'center');
    });
    panel(120, 292, 400, 54, '#100e17', '#655878', 2);
    wrapTextToWidth(pauseChoiceDescription(state.pauseSelection), 374, 11).slice(0, 2).forEach((line, index) => {
        pixelText(line, 320, 314 + index * 14, 11, '#e8dfef', 'center');
    });
    pixelText(`SOUND: ${muted ? 'MUTED' : 'ON'}   (M TO TOGGLE)`, 320, 371, 11, '#bfb6c9', 'center');
    pixelText('UP / DOWN: CHOOSE    Z / ENTER: SELECT', 320, 399, 10, '#aaa', 'center');
    pixelText('X / SHIFT: RESUME    C / ESC: RESUME', 320, 418, 10, '#aaa', 'center');
}
function handlePointer(x, y) {
    if (state.mode === 'title') { beginGame(); return; }
    if (state.mode === 'dialog') { pressed.enter = true; return; }
    if (state.mode === 'map') { state.mode = 'world'; return; }
    if (state.mode === 'pause') {
        if (x >= 130 && x <= 510 && y >= 124 && y < 278) {
            const index = Math.floor((y - 124) / 40);
            if (y < 124 + index * 40 + 34) {
                state.pauseSelection = index;
                applyPauseChoice(index);
            }
            return;
        }
        if (y >= 350 && y <= 384) {
            muted = !muted;
            if (muted) music.pause(); else music.play().catch(() => {});
        }
        return;
    }
    if (state.mode === 'gameover') {
        if (x >= 110 && x <= 530 && y >= 224 && y < 362) {
            const index = Math.floor((y - 224) / 46);
            if (y < 224 + index * 46 + 36) {
                state.gameOverSelection = index;
                chooseGameOver(index);
            }
        }
        return;
    }
    if (state.mode === 'battle' && state.battle) {
        const b = state.battle;
        if (y >= 398 && y <= 448) {
            const index = Math.max(0, Math.min(3, Math.floor((x - 20) / 155)));
            b.selected = index;
            if (b.phase === 'menu') chooseBattleAction(index);
            else if (b.phase === 'attack' && index === 0) pressed.z = true;
            return;
        }
        if (b.phase === 'attack') { pressed.z = true; return; }
        if (['act','item','mercy'].includes(b.phase)) {
            const options = currentSubOptions(b);
            if (y > 218 && y < 326) {
                if (b.phase === 'act') {
                    const col = x < 320 ? 0 : 1;
                    const row = y < 273 ? 0 : 1;
                    b.sub = Math.min(options.length - 1, row * 2 + col);
                } else b.sub = Math.max(0, Math.min(options.length - 1, Math.floor((y - 218) / 26)));
                chooseSubOption();
            }
        } else if (b.phase === 'menu' && x > 150 && x < 480 && y > 190 && y < 340) {
            chooseBattleAction(1);
        }
        return;
    }
    if (state.mode === 'world') {
        if (x > 0 && y > 0) handleWorldInteract();
    }
}

// ---------- Title, game over and epilogue ----------
function drawTitle() {
    ctx.fillStyle = '#09070d'; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 45; i++) {
        ctx.fillStyle = i % 3 ? '#d4a95e' : '#ff84b6';
        const x = (i * 139 + 31) % W;
        const y = (i * 61 + Math.floor(state.time / 2)) % H;
        ctx.fillRect(x, y, 2 + i % 3, 2 + i % 3);
    }
    pixelText('A BIRTHDAY QUEST', 320, 92, 14, '#ffb2d0', 'center');
    pixelText('BIRTHDAYTALE', 320, 156, 42, '#ffe16c', 'center');
    pixelText('THE QUEST FOR THE LOST PRESENTS', 320, 190, 17, '#fff', 'center');
    drawPixelPerson(art.husband, 267, 344, 47, 68, '#d9d0bf');
    drawPixelPerson(art.wife, 369, 344, 47, 68, '#372b39');
    drawHeart(320, 279 + Math.sin(state.time / 14) * 4, '#ff315a', 1.2);
    panel(205, 378, 230, 42, '#100c17', '#ffdc73', 3);
    pixelText('PRESS Z / ENTER', 320, 405, 16, '#fff2bc', 'center');
    pixelText('ARROWS / WASD MOVE  •  Z TALK  •  X RUN  •  C PAUSE', 320, 458, 10, '#9a939e', 'center');
}
function gameOverChoiceDescription(index) {
    if (index === 0) return 'Retry this battle with full HP; room progress stays saved.';
    if (index === 1) return 'Restart this memory room. Collected presents stay safe.';
    return `Return to ${landmarkNames[state.latestClearedRoom]}; room progress and presents stay safe.`;
}
function drawGameOver() {
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    pixelText('THE PARTY IS NOT OVER', 320, 88, 27, '#fff', 'center');
    drawHeart(320, 142, state.time % 40 < 20 ? '#ff2449' : '#791c35', 1.1);
    pixelText('Take a breath. Your presents and cleared landmarks are safe.', 320, 197, 11, '#ffd7e4', 'center');
    const options = ['RETRY THIS BATTLE', 'RESTART THIS ROOM', `RETURN TO ${landmarkNames[state.latestClearedRoom]}`];
    options.forEach((label, index) => {
        const y = 224 + index * 46;
        const selected = index === state.gameOverSelection;
        panel(110, y, 420, 36, selected ? '#282036' : '#111018', selected ? '#ffe176' : '#77717f', 2);
        pixelText(label, 320, y + 23, 12, selected ? '#ffe176' : '#fff', 'center');
    });
    panel(80, 373, 480, 50, '#100e17', '#655878', 2);
    wrapTextToWidth(gameOverChoiceDescription(state.gameOverSelection), 450, 11).slice(0, 2).forEach((line, index) => {
        pixelText(line, 320, 394 + index * 14, 11, '#e8dfef', 'center');
    });
    pixelText('UP / DOWN: CHOOSE     Z / ENTER: SELECT', 320, 451, 10, '#aaa', 'center');
}
function startEnding() {
    state.mode = 'ending';
    state.endTime = 0;
}
function drawEnding() {
    state.endTime++;
    const progress = Math.min(1, state.endTime / 100);
    const r = Math.round(255 * progress);
    const g = Math.round(182 * progress);
    const b = Math.round(193 * progress);
    ctx.fillStyle = `rgb(${r},${g},${b})`; ctx.fillRect(0, 0, W, H);
    // pixel confetti, continuously falling
    for (let i = 0; i < 74; i++) {
        const x = (i * 97 + (state.endTime * (1 + i % 3)) * (i % 2 ? 1 : -1) + W * 4) % W;
        const y = (i * 43 + state.endTime * (1 + i % 4)) % H;
        ctx.fillStyle = ['#fff6c4', '#f85e89', '#55b8e8', '#a17ad4', '#68c987'][i % 5];
        ctx.fillRect(x, y, 5 + i % 3, 4 + i % 2);
    }
    ctx.fillStyle = 'rgba(41,19,43,.89)'; ctx.fillRect(25, 20, 590, 440);
    ctx.strokeStyle = '#ffe38b'; ctx.lineWidth = 4; ctx.strokeRect(27, 22, 586, 436);
    pixelText('HAPPY BIRTHDAY!', 320, 61, 28, '#ffe38b', 'center');
    drawPixelPerson(art.husband, 283, 164, 42, 56, '#d9d0bf');
    drawPixelPerson(art.wife, 355, 164, 42, 56, '#332b38');
    text('♥', 319, 140, 18, '#ff6eaa', 'center');
    pixelText('CONGRATULATIONS, YOU WON!', 320, 194, 17, '#fff', 'center');
    pixelText('The digital quest is over, but your real birthday search begins now!', 320, 222, 11, '#ffe6f0', 'center');
    pixelText('Use the clues from our journey to find your actual gifts at home:', 320, 243, 11, '#ffe6f0', 'center');
    GIFT_CLUES.forEach((clue, i) => {
        const y = 252 + i * 33;
        const color = ['#ed5364','#8c75d6','#79dc71','#e6bd4d'][i];
        drawGiftIcon(61, y + 6, color, 16);
        panel(78, y, 520, 28, 'rgba(15,12,24,.82)', color, 2);
        wrapTextToWidth(clue, 492, 11).slice(0, 1).forEach(line => {
            pixelText(line, 338, y + 18, 11, '#fff', 'center');
        });
    });
    pixelText('I LOVE YOU SO MUCH! HAPPY BIRTHDAY!', 320, 416, 15, '#ffe38b', 'center');
    pixelText('Z / ENTER: CELEBRATE AGAIN', 320, 440, 9, '#d3c5df', 'center');
}

// ---------- Pointer and frame update ----------
function updatePause() {
    if (cancelPressed()) { state.mode = state.previousMode; return; }
    if (pressed.arrowup || pressed.w) state.pauseSelection = (state.pauseSelection + 3) % 4;
    if (pressed.arrowdown || pressed.s) state.pauseSelection = (state.pauseSelection + 1) % 4;
    if (confirmPressed()) applyPauseChoice(state.pauseSelection);
}
function chooseGameOver(index) {
    if (index === 0) {
        const key = state.battle?.key;
        state.hp = state.maxHp;
        if (key) startEncounter(key);
        else { state.mode = 'world'; state.battle = null; }
    } else if (index === 1) restartCurrentRoom();
    else returnToLatestClearedLandmark();
}
function updateGameOver() {
    state.endTime++;
    if (pressed.arrowup || pressed.w) state.gameOverSelection = (state.gameOverSelection + 2) % 3;
    if (pressed.arrowdown || pressed.s) state.gameOverSelection = (state.gameOverSelection + 1) % 3;
    if (confirmPressed()) chooseGameOver(state.gameOverSelection);
}
function fixedUpdate() {
    pollGamepad();
    state.time++;
    if (pressed.m) {
        muted = !muted;
        if (muted) music.pause(); else music.play().catch(() => {});
    }
    if (pausePressed()) {
        if (state.mode === 'world' || state.mode === 'battle') togglePause();
        else if (state.mode === 'pause') state.mode = state.previousMode;
    }
    if (pressed.tab && (state.mode === 'world' || state.mode === 'map')) {
        state.mode = state.mode === 'map' ? 'world' : 'map';
        for (const key in pressed) delete pressed[key];
        return;
    }
    if (state.mode === 'title') {
        if (confirmPressed()) beginGame();
    } else if (state.mode === 'world') updateWorld();
    else if (state.mode === 'dialog') updateDialogue();
    else if (state.mode === 'map') updateMap();
    else if (state.mode === 'battle') updateBattle();
    else if (state.mode === 'pause') updatePause();
    else if (state.mode === 'gameover') updateGameOver();
    else if (state.mode === 'ending') {
        state.endTime++;
        if (confirmPressed() && state.endTime > 90) state.endTime = 0;
    }
    for (const key in pressed) delete pressed[key];
}
function drawFrame() {
    if (state.mode === 'title') drawTitle();
    else if (state.mode === 'world') drawWorld();
    else if (state.mode === 'map') drawWorldMap();
    else if (state.mode === 'battle') drawBattle();
    else if (state.mode === 'dialog') {
        if (state.dialog?.returnMode === 'battle' && state.battle) drawBattle();
        else drawWorld();
        drawDialogue();
    } else if (state.mode === 'pause') drawPause();
    else if (state.mode === 'gameover') drawGameOver();
    else if (state.mode === 'ending') drawEnding();
    drawScanlines();
}
let previousTime = 0;
let accumulator = 0;
const STEP_MS = 1000 / 60;
function frame(now) {
    if (!previousTime) previousTime = now;
    const elapsed = Math.min(100, now - previousTime);
    previousTime = now;
    accumulator += elapsed;
    let steps = 0;
    while (accumulator >= STEP_MS && steps < 5) {
        fixedUpdate();
        accumulator -= STEP_MS;
        steps++;
    }
    drawFrame();
    requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
