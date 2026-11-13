import * as THREE from './_remote/0d0e081c7ee3d520/three@0.184.0.js';
import { initialBoard, legalMoves, applyMove, inCheck, checkingPieces, chooseAiMove, getGameResult, getClaimableDraws, positionKey } from './chess.js';
import { buildPiece, animateRig } from './pieces.js';
import { LANGUAGES, translate } from './locales.js';

let PIECE_SCALE = 0.9;
const boardViewStorageKey = 'battleChessBoardView';
let boardZoom = 1;
let savedBoardShift = { x: 0, y: 0, z: 0 };
try {
    const savedBoardView = JSON.parse(window.localStorage.getItem(boardViewStorageKey) || '{}');
    if (Number.isFinite(savedBoardView.zoom)) boardZoom = THREE.MathUtils.clamp(savedBoardView.zoom, 0.7, 1.25);
    if (savedBoardView.shift && ['x', 'y', 'z'].every(axis => Number.isFinite(savedBoardView.shift[axis]))) {
        savedBoardShift = { ...savedBoardView.shift };
    }
} catch {}
let colorBlindMode = false;
try {
    colorBlindMode = window.localStorage.getItem('battleChessColorBlindMode') === 'true';
} catch {}
function loadAudioPreference(key) {
    try {
        return window.localStorage.getItem(key) !== 'false';
    } catch {
        return true;
    }
}

let musicEnabled = loadAudioPreference('battleChessMusicEnabled');
let battleSoundsEnabled = loadAudioPreference('battleChessBattleSoundsEnabled');

const container = document.getElementById('game-container');
const statusEl = document.getElementById('status');
const checkAlert = document.getElementById('check-alert');
const checkAlertMessage = document.getElementById('check-alert-message');
const colorPicker = document.getElementById('color-picker');
const pickerTitle = document.getElementById('picker-title');
const pickerCopy = document.getElementById('picker-copy');
const skillCopy = document.getElementById('skill-copy');
const clockPanel = document.getElementById('clock-panel');
const claimDrawButton = document.getElementById('claim-draw');
const resetGameButton = document.getElementById('reset-game');
const backToSetupButton = document.getElementById('back-to-setup');
const soundControls = document.getElementById('sound-controls');
const gameMenu = document.getElementById('game-menu');
const boardSizeInput = document.getElementById('board-size');
const boardSizeReadout = document.getElementById('board-size-readout');
const boardArrangeButton = document.getElementById('board-arrange');
const boardArrangeHint = document.getElementById('board-arrange-hint');
const boardResetViewButton = document.getElementById('board-reset-view');
const colorBlindToggle = document.getElementById('colorblind-toggle');
const promotionPicker = document.getElementById('promotion-picker');
const introScreen = document.getElementById('intro-screen');
const enterGameButton = document.getElementById('enter-game');
const whiteClockEl = document.getElementById('white-clock');
const blackClockEl = document.getElementById('black-clock');
const languageSelect = document.getElementById('language-select');
languageSelect.replaceChildren(...LANGUAGES.map(({ code, label }) => {
    const option = document.createElement('option');
    option.value = code;
    option.textContent = label;
    return option;
}));
languageSelect.value = 'en';
const musicToggle = document.getElementById('music-toggle');
const clashToggle = document.getElementById('clash-toggle');
function syncAudioControls() {
    musicToggle.setAttribute('aria-pressed', String(musicEnabled));
    clashToggle.setAttribute('aria-pressed', String(battleSoundsEnabled));
}
const battlePanel = document.getElementById('battle-panel');
const battleLogSetting = document.getElementById('battle-log-setting');
const battleLogToggle = document.getElementById('battle-log-toggle');
const playAgainOptions = document.getElementById('play-again-options');
const playAgainYesButton = document.getElementById('play-again-yes');
const playAgainNoButton = document.getElementById('play-again-no');
const computerSetup = document.getElementById('computer-setup');
const clockSection = colorPicker.querySelector('.clock-section');
const battleTurnMini = document.getElementById('battle-turn-mini');
const battleActive = document.getElementById('battle-active');
const battleCheck = document.getElementById('battle-check');
const battleMoves = document.getElementById('battle-moves');
const whiteCapturedEl = document.getElementById('white-captured');
const blackCapturedEl = document.getElementById('black-captured');
const tutorialOverlay = document.getElementById('tutorial');
const tutorialOpenButton = document.getElementById('tutorial-open');
const tutorialCloseButton = document.getElementById('tutorial-close');
const statusMessageEl = document.getElementById('status-message');
let language = languageSelect.value || 'en';
let checkAlertColor = null;
let statusKey = 'chooseToBegin';
let statusValues = {};
let pickerTitleKey = 'chooseSide';
let pickerCopyKey = 'pickerCopy';
let pickerCopyValues = {};
const tr = (key, values = {}) => translate(language, key, values);
function renderCheckAlert() {
    const visible = hasStarted && checkAlertColor !== null && !gameOver;
    checkAlert.classList.toggle('hidden', !visible);
    checkAlert.setAttribute('aria-hidden', String(!visible));
    checkAlert.classList.toggle('check-alert-white', checkAlertColor === 'w');
    checkAlert.classList.toggle('check-alert-black', checkAlertColor === 'b');
    if (!visible) return;

    const messageKey = checkAlertColor === playerColor
        ? 'checkAlertYourKing'
        : checkAlertColor === 'w' ? 'checkAlertWhiteKing' : 'checkAlertBlackKing';
    checkAlertMessage.textContent = tr(messageKey);
    requestAnimationFrame(clampSavedUiPositions);
}
function textFor(key, values = {}) {
    const resolved = { ...values };
    if (values.loserColor) resolved.loser = tr(values.loserColor === 'w' ? 'white' : 'black');
    if (values.winnerColor) resolved.winner = tr(values.winnerColor === 'w' ? 'white' : 'black');
    return tr(key, resolved);
}
function applyLanguage() {
    language = languageSelect.value || 'en';
    document.documentElement.lang = language;
    document.documentElement.dir = ['ar', 'ur', 'fa'].includes(language) ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-i18n]').forEach(element => {
        element.textContent = tr(element.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(element => {
        element.setAttribute('aria-label', tr(element.dataset.i18nAria));
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        element.setAttribute('placeholder', tr(element.dataset.i18nPlaceholder));
    });
    document.getElementById('skill-copy').textContent = tr(`skillCopy${aiSkill[0].toUpperCase()}${aiSkill.slice(1)}`);
    const gameClockCopy = document.getElementById('clock-copy');
    gameClockCopy.textContent = tr('clockCopy');
    document.getElementById('picker-title').textContent = tr(pickerTitleKey);
    const pickerValues = pickerCopyKey === 'playAgainCopy'
        ? { ...pickerCopyValues, message: textFor(pickerCopyValues.messageKey, pickerCopyValues.messageValues) }
        : pickerCopyValues;
    document.getElementById('picker-copy').textContent = tr(pickerCopyKey, pickerValues);
    statusMessageEl.textContent = textFor(statusKey, statusValues);
    renderCheckAlert();
    tutorialOverlay.dir = document.documentElement.dir;
    setMoveGripLabels();
    if (movableUi.length) requestAnimationFrame(clampSavedUiPositions);
}
let playerColor = 'w';
let aiSkill = 'intermediate';
let battleLogEnabled = true;
let hasStarted = false;
let boardPlacementMode = false;
let boardPlacementDrag = null;

const uiPositionStorageKey = 'battleChessUiPositions';
let uiPositions = {};
try {
    const storedPositions = JSON.parse(window.localStorage.getItem(uiPositionStorageKey) || '{}');
    if (storedPositions && typeof storedPositions === 'object' && !Array.isArray(storedPositions)) {
        uiPositions = storedPositions;
    }
} catch {}

const movableUi = [];
const movableUiById = new Map();

function persistUiPositions() {
    try {
        window.localStorage.setItem(uiPositionStorageKey, JSON.stringify(uiPositions));
    } catch {}
}

function applyUiPosition(entry, left, top, persist = false) {
    const rect = entry.element.getBoundingClientRect();
    const maxLeft = Math.max(0, window.innerWidth - rect.width);
    const maxTop = Math.max(0, window.innerHeight - rect.height);
    const x = Math.max(0, Math.min(maxLeft, left));
    const y = Math.max(0, Math.min(maxTop, top));
    entry.element.style.position = 'fixed';
    entry.element.style.left = `${x}px`;
    entry.element.style.top = `${y}px`;
    entry.element.style.right = 'auto';
    entry.element.style.bottom = 'auto';
    entry.element.style.transform = 'none';
    uiPositions[entry.id] = { x, y };
    if (persist) persistUiPositions();
}

function restoreUiPosition(entry) {
    const saved = uiPositions[entry.id];
    if (!saved || !Number.isFinite(saved.x) || !Number.isFinite(saved.y)) return;
    entry.element.style.position = 'fixed';
    entry.element.style.left = `${saved.x}px`;
    entry.element.style.top = `${saved.y}px`;
    entry.element.style.right = 'auto';
    entry.element.style.bottom = 'auto';
    entry.element.style.transform = 'none';
}

function clampSavedUiPositions() {
    for (const entry of movableUi) {
        const saved = uiPositions[entry.id];
        if (!saved || entry.element.classList.contains('hidden')) continue;
        if (entry.id === 'tutorial' && !entry.element.classList.contains('is-game-control')) continue;
        const rect = entry.element.getBoundingClientRect();
        if (!rect.width || !rect.height) continue;
        applyUiPosition(entry, saved.x, saved.y);
    }
}

function setMoveGripLabels() {
    for (const entry of movableUi) {
        entry.grip.setAttribute('aria-label', tr('moveControl'));
        entry.grip.title = tr('moveControl');
    }
}

function registerMovableUi(id, element, handleParent = element) {
    const grip = document.createElement('span');
    grip.className = 'move-grip';
    grip.textContent = '⠿';
    grip.tabIndex = 0;
    grip.setAttribute('aria-label', tr('moveControl'));
    grip.title = tr('moveControl');
    if (element.tagName !== 'BUTTON') grip.setAttribute('role', 'button');
    handleParent.append(grip);

    const entry = { id, element, grip };
    movableUi.push(entry);
    movableUiById.set(id, entry);
    if (id !== 'tutorial' || element.classList.contains('is-game-control')) restoreUiPosition(entry);

    let pointerStart = null;
    grip.addEventListener('pointerdown', event => {
        if (event.button !== 0 || (id === 'tutorial' && !element.classList.contains('is-game-control'))) return;
        event.preventDefault();
        event.stopPropagation();
        const rect = element.getBoundingClientRect();
        pointerStart = { id: event.pointerId, x: event.clientX, y: event.clientY, left: rect.left, top: rect.top, moved: false };
        grip.setPointerCapture(event.pointerId);
    });
    grip.addEventListener('pointermove', event => {
        if (!pointerStart || event.pointerId !== pointerStart.id) return;
        event.preventDefault();
        const dx = event.clientX - pointerStart.x;
        const dy = event.clientY - pointerStart.y;
        if (!pointerStart.moved && Math.hypot(dx, dy) < 3) return;
        pointerStart.moved = true;
        applyUiPosition(entry, pointerStart.left + dx, pointerStart.top + dy);
    });
    const finishPointerMove = event => {
        if (!pointerStart || event.pointerId !== pointerStart.id) return;
        if (pointerStart.moved) persistUiPositions();
        pointerStart = null;
    };
    grip.addEventListener('pointerup', finishPointerMove);
    grip.addEventListener('pointercancel', finishPointerMove);
    grip.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
    });
    grip.addEventListener('keydown', event => {
        const directions = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
        const direction = directions[event.key];
        if (!direction || (id === 'tutorial' && !element.classList.contains('is-game-control'))) return;
        event.preventDefault();
        event.stopPropagation();
        const rect = element.getBoundingClientRect();
        const saved = uiPositions[id];
        const step = event.shiftKey ? 4 : 16;
        applyUiPosition(
            entry,
            (saved?.x ?? rect.left) + direction[0] * step,
            (saved?.y ?? rect.top) + direction[1] * step,
            true,
        );
    });
}

registerMovableUi('status', statusEl);
registerMovableUi('check-alert', checkAlert);
registerMovableUi('battle-log', battlePanel, battlePanel.querySelector('summary'));
registerMovableUi('clock', clockPanel);
registerMovableUi('game-menu', gameMenu, gameMenu.querySelector('summary'));
window.addEventListener('resize', clampSavedUiPositions);
window.visualViewport?.addEventListener('resize', clampSavedUiPositions);
battlePanel.addEventListener('toggle', () => requestAnimationFrame(clampSavedUiPositions));
gameMenu.addEventListener('toggle', () => requestAnimationFrame(clampSavedUiPositions));

function syncBattleLogOption() {
    const available = aiSkill !== 'beginner';
    battleLogSetting.classList.toggle('hidden', !available);
    battleLogToggle.disabled = !available;
    battleLogToggle.setAttribute('aria-pressed', String(battleLogEnabled));
}

function closeTutorial() {
    tutorialOverlay.classList.add('hidden');
}
function setTutorialButtonContext(inGame) {
    tutorialOpenButton.classList.toggle('is-game-control', inGame);
    if (inGame) tutorialOpenButton.classList.remove('hidden');
}
tutorialOpenButton.addEventListener('click', () => tutorialOverlay.classList.remove('hidden'));
tutorialCloseButton.addEventListener('click', closeTutorial);
tutorialOverlay.addEventListener('click', event => {
    if (event.target === tutorialOverlay) closeTutorial();
});
document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (!tutorialOverlay.classList.contains('hidden')) closeTutorial();
    else if (boardPlacementMode) setBoardPlacementMode(false);
});
languageSelect.addEventListener('change', () => {
    applyLanguage();
    if (hasStarted) renderBattlePanel();
});
applyLanguage();
syncAudioControls();

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a120a);
scene.fog = new THREE.Fog(0x1a120a, 27, 48);
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
const baseCameraPosition = new THREE.Vector3();
const baseCameraTarget = new THREE.Vector3();
const cameraGoalPosition = new THREE.Vector3();
const cameraGoalTarget = new THREE.Vector3();
const boardViewOffset = new THREE.Vector3(savedBoardShift.x, savedBoardShift.y, savedBoardShift.z);
let rigs = [];
const cameraLookTarget = new THREE.Vector3();
let cameraReady = false;
let cameraMode = 'board';
let battleFocus = null;
let battleSpan = 0;
let battleImpactZoom = 0;

function updateBattleCameraGoal() {
    if (!battleFocus) return;
    const aspect = camera.aspect || 1;
    const viewSide = playerColor === 'b' ? -1 : 1;
    const distance = Math.max(4.1, (battleSpan + 1.7) / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * aspect))
        * (1 - battleImpactZoom * 0.08);
    cameraGoalPosition.copy(battleFocus).add(new THREE.Vector3(0, distance * 0.55, distance * viewSide));
    cameraGoalTarget.copy(battleFocus).setY(0.62);
}

function updateBoardCameraGoal() {
    cameraGoalPosition.copy(baseCameraPosition).add(boardViewOffset);
    cameraGoalTarget.copy(baseCameraTarget).add(boardViewOffset);
}

function persistBoardView() {
    try {
        window.localStorage.setItem(boardViewStorageKey, JSON.stringify({
            zoom: boardZoom,
            shift: { x: boardViewOffset.x, y: boardViewOffset.y, z: boardViewOffset.z },
        }));
    } catch {}
}

function fitCamera() {
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const aspect = width / height;
    camera.aspect = aspect;
    const portrait = aspect < 0.8;
    camera.fov = portrait ? 43 : 45;
    const cameraDistance = portrait ? 12.0 / aspect : Math.max(12.1, 13.0 / aspect);
    const distance = cameraDistance / Math.hypot(0.85, 0.75) / boardZoom;
    const viewSide = playerColor === 'b' ? -1 : 1;
    baseCameraPosition.set(0, distance * 0.85, distance * 0.75 * viewSide);
    const portraitLift = portrait ? THREE.MathUtils.clamp((1 - aspect) / 0.55, 0, 1) * 0.5 : 0;
    baseCameraTarget.set(0, -portraitLift, 0.3 * viewSide);
    PIECE_SCALE = portrait ? 1.08 : 0.9;
    if (cameraMode !== 'battle') {
        for (const rig of rigs) rig.root.scale.setScalar(PIECE_SCALE);
    }
    renderer.shadowMap.enabled = !portrait;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    if (cameraMode === 'battle') updateBattleCameraGoal();
    else updateBoardCameraGoal();
    if (!cameraReady) {
        camera.position.copy(cameraGoalPosition);
        cameraLookTarget.copy(cameraGoalTarget);
        camera.lookAt(cameraLookTarget);
        cameraReady = true;
    }
}

function startBattleCamera(attacker, defender) {
    setBoardPlacementMode(false);
    const separation = attacker.root.position.distanceTo(defender.root.position);
    battleSpan = Math.max(0, separation - 1);
    battleImpactZoom = 0;
    battleFocus = attacker.root.position.clone().add(defender.root.position).multiplyScalar(0.5);
    cameraMode = 'battle';
    battlePanel.open = false;
    battlePanel.classList.add('hidden');
    updateBattleCameraGoal();
}

function restoreBoardCamera() {
    cameraMode = 'board';
    battleFocus = null;
    battleSpan = 0;
    battleImpactZoom = 0;
    updateBoardCameraGoal();
}

fitCamera();
window.addEventListener('resize', fitCamera);
window.visualViewport?.addEventListener('resize', fitCamera);

function boardScreenBasis() {
    camera.updateMatrixWorld(true);
    const height = renderer.domElement.clientHeight || container.clientHeight || window.innerHeight;
    return {
        right: new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0).normalize(),
        up: new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1).normalize(),
        unitsPerPixel: 2 * camera.position.distanceTo(cameraLookTarget)
            * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) / Math.max(1, height),
    };
}

function updateBoardViewByScreenPixels(dx, dy, persist = true) {
    if (cameraMode !== 'board') return false;
    const { right, up, unitsPerPixel } = boardScreenBasis();
    boardViewOffset.addScaledVector(right, -dx * unitsPerPixel);
    boardViewOffset.addScaledVector(up, dy * unitsPerPixel);
    updateBoardCameraGoal();
    if (persist) persistBoardView();
    return true;
}

function setBoardPlacementMode(enabled) {
    boardPlacementMode = Boolean(enabled) && cameraMode === 'board';
    boardPlacementDrag = null;
    boardArrangeButton.setAttribute('aria-pressed', String(boardPlacementMode));
    boardArrangeHint.classList.toggle('hidden', !boardPlacementMode);
    container.classList.toggle('is-board-placement', boardPlacementMode);
}

function updateBoardSizeReadout() {
    boardSizeReadout.textContent = `${Math.round(boardZoom * 100)}%`;
}

boardSizeInput.value = String(Math.round(boardZoom * 100));
updateBoardSizeReadout();
boardSizeInput.addEventListener('input', () => {
    boardZoom = THREE.MathUtils.clamp(Number(boardSizeInput.value) / 100, 0.7, 1.25);
    updateBoardSizeReadout();
    fitCamera();
    persistBoardView();
});
boardArrangeButton.addEventListener('click', () => setBoardPlacementMode(!boardPlacementMode));
boardArrangeButton.addEventListener('keydown', event => {
    const directions = { ArrowLeft: [-16, 0], ArrowRight: [16, 0], ArrowUp: [0, -16], ArrowDown: [0, 16] };
    const direction = directions[event.key];
    if (!boardPlacementMode || !direction) return;
    event.preventDefault();
    updateBoardViewByScreenPixels(direction[0] * (event.shiftKey ? 3 : 1), direction[1] * (event.shiftKey ? 3 : 1));
});
boardResetViewButton.addEventListener('click', () => {
    boardZoom = 1;
    boardViewOffset.set(0, 0, 0);
    boardSizeInput.value = '100';
    updateBoardSizeReadout();
    setBoardPlacementMode(false);
    fitCamera();
    persistBoardView();
});

scene.add(new THREE.HemisphereLight(0xfff4df, 0x65513b, 2.05));
const sun = new THREE.DirectionalLight(0xffe4bd, 2.2);
sun.position.set(4, 10, 5);
sun.castShadow = true;
sun.shadow.camera.left = sun.shadow.camera.bottom = -6;
sun.shadow.camera.right = sun.shadow.camera.top = 6;
sun.shadow.camera.near = 0.5;
sun.shadow.camera.far = 24;
sun.shadow.bias = -0.0003;
sun.shadow.normalBias = 0.018;
sun.shadow.radius = 2;
sun.shadow.mapSize.set(1024, 1024);
scene.add(sun);
const fillLight = new THREE.DirectionalLight(0xdce8ff, 0.75);
fillLight.position.set(-5, 6, 4);
scene.add(fillLight);

// Board
const toWorld = (x, y) => new THREE.Vector3(x - 3.5, 0.06, 3.5 - y);
const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x59391f, roughness: 0.62 });
const frame = new THREE.Mesh(new THREE.BoxGeometry(9, 0.4, 9), frameMaterial);
frame.position.y = -0.21;
frame.receiveShadow = true;
scene.add(frame);
const squares = [];
const sepia = new THREE.MeshStandardMaterial({ color: 0xe8d2a2, roughness: 0.82 });
const black = new THREE.MeshStandardMaterial({ color: 0x35271c, roughness: 0.58 });
for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
        const sq = new THREE.Mesh(new THREE.BoxGeometry(1, 0.08, 1), (x + y) % 2 ? sepia : black);
        sq.position.copy(toWorld(x, y)).setY(0.025);
        sq.receiveShadow = true;
        sq.userData = { x, y };
        scene.add(sq);
        squares.push(sq);
    }
}
const boardTrim = new THREE.MeshStandardMaterial({ color: 0xd1a84e, metalness: 0.62, roughness: 0.36 });
for (const z of [-4.08, 4.08]) {
    const trim = new THREE.Mesh(new THREE.BoxGeometry(8.24, 0.026, 0.045), boardTrim);
    trim.position.set(0, 0.067, z);
    trim.castShadow = false;
    scene.add(trim);
}
for (const x of [-4.08, 4.08]) {
    const trim = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.026, 8.24), boardTrim);
    trim.position.set(x, 0.067, 0);
    trim.castShadow = false;
    scene.add(trim);
}
const markerMat = new THREE.MeshBasicMaterial({ color: 0x7fe08a, transparent: true, opacity: 0.55 });
const selectMat = new THREE.MeshBasicMaterial({ color: 0xffd34d, transparent: true, opacity: 0.6 });
const markers = new THREE.Group();
scene.add(markers);

// A short-lived gold wash and outline mark the destination after every move.
const moveGlowGeometry = new THREE.PlaneGeometry(0.96, 0.96);
const moveGlowEdges = new THREE.EdgesGeometry(moveGlowGeometry);
const moveSquareGlowPool = [];
for (let i = 0; i < 4; i++) {
    const group = new THREE.Group();
    const fill = new THREE.Mesh(moveGlowGeometry, new THREE.MeshBasicMaterial({
        color: 0xffc45e,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
        side: THREE.DoubleSide,
    }));
    fill.rotation.x = -Math.PI / 2;
    fill.position.z = 0.002;
    const outline = new THREE.LineSegments(moveGlowEdges, new THREE.LineBasicMaterial({
        color: 0xffe2a0,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        toneMapped: false,
    }));
    outline.rotation.x = -Math.PI / 2;
    outline.position.z = 0.004;
    group.add(fill, outline);
    group.visible = false;
    scene.add(group);
    moveSquareGlowPool.push({ group, fill, outline, startedAt: -Infinity, duration: 1.1 });
}

// A quiet floor glow and small, outlined arrows keep check readable without covering a king.
const checkThreatGroup = new THREE.Group();
checkThreatGroup.visible = false;
scene.add(checkThreatGroup);
const checkGlowMaterial = new THREE.MeshBasicMaterial({
    color: 0xc86e4d,
    transparent: true,
    opacity: 0.15,
    depthWrite: false,
    toneMapped: false,
    side: THREE.DoubleSide,
});
const checkGlow = new THREE.Mesh(new THREE.PlaneGeometry(0.94, 0.94), checkGlowMaterial);
checkGlow.rotation.x = -Math.PI / 2;
checkGlow.position.y = 0.009;
checkThreatGroup.add(checkGlow);
const threatArrowShape = new THREE.Shape();
threatArrowShape.moveTo(-0.24, -0.026);
threatArrowShape.lineTo(0.09, -0.026);
threatArrowShape.lineTo(0.09, -0.105);
threatArrowShape.lineTo(0.25, 0);
threatArrowShape.lineTo(0.09, 0.105);
threatArrowShape.lineTo(0.09, 0.026);
threatArrowShape.lineTo(-0.24, 0.026);
threatArrowShape.closePath();
const threatArrowGeometry = new THREE.ShapeGeometry(threatArrowShape);
const threatArrowEdgeMaterial = new THREE.MeshBasicMaterial({
    color: 0xffdda0,
    transparent: true,
    opacity: 0.82,
    depthWrite: false,
    toneMapped: false,
    side: THREE.DoubleSide,
});
const threatArrowFillMaterial = new THREE.MeshBasicMaterial({
    color: 0xa94e3b,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    toneMapped: false,
    side: THREE.DoubleSide,
});
const checkThreatArrows = [];
for (let i = 0; i < 8; i++) {
    const arrowRoot = new THREE.Group();
    arrowRoot.rotation.x = -Math.PI / 2;
    const edge = new THREE.Mesh(threatArrowGeometry, threatArrowEdgeMaterial);
    edge.position.z = 0.004;
    const fill = new THREE.Mesh(threatArrowGeometry, threatArrowFillMaterial);
    fill.position.z = 0.006;
    fill.scale.setScalar(0.76);
    arrowRoot.add(edge, fill);
    checkThreatGroup.add(arrowRoot);
    checkThreatArrows.push({ root: arrowRoot, edge, fill });
}

function setColorBlindPalette(enabled = colorBlindMode) {
    colorBlindMode = Boolean(enabled);
    document.documentElement.classList.toggle('colorblind-mode', colorBlindMode);
    colorBlindToggle.setAttribute('aria-pressed', String(colorBlindMode));

    frameMaterial.color.setHex(colorBlindMode ? 0x263b4c : 0x59391f);
    boardTrim.color.setHex(colorBlindMode ? 0xe69f00 : 0xd1a84e);
    sepia.color.setHex(colorBlindMode ? 0xe1edf5 : 0xe8d2a2);
    black.color.setHex(colorBlindMode ? 0x344b5e : 0x35271c);
    markerMat.color.setHex(colorBlindMode ? 0x0072b2 : 0x7fe08a);
    markerMat.opacity = colorBlindMode ? 0.68 : 0.55;
    selectMat.color.setHex(colorBlindMode ? 0xe69f00 : 0xffd34d);
    selectMat.opacity = colorBlindMode ? 0.72 : 0.6;
    for (const glow of moveSquareGlowPool) {
        glow.fill.material.color.setHex(colorBlindMode ? 0x56b4e9 : 0xffc45e);
        glow.outline.material.color.setHex(colorBlindMode ? 0xf0f8ff : 0xffe2a0);
    }
    checkGlowMaterial.color.setHex(colorBlindMode ? 0xd55e00 : 0xc86e4d);
    threatArrowEdgeMaterial.color.setHex(colorBlindMode ? 0xf0e442 : 0xffdda0);
    threatArrowFillMaterial.color.setHex(colorBlindMode ? 0xd55e00 : 0xa94e3b);
}

colorBlindToggle.addEventListener('click', () => {
    setColorBlindPalette(!colorBlindMode);
    try {
        window.localStorage.setItem('battleChessColorBlindMode', String(colorBlindMode));
    } catch {}
});
setColorBlindPalette();

// Harp, Latin guitar, and clearly audible but restrained drums bring measured, heroic momentum to each chess battle.
const music = new Audio('assets/audio/harp-latin-guitar-chess-theme-with-drums.mp3');
music.loop = true;
music.preload = 'auto';
music.volume = 0;
const clash = new Audio('assets/audio/sword-clash.mp3');
clash.preload = 'auto';
clash.volume = 0;
const SETUP_MUSIC_LEVEL = 0.12;
const GAME_MUSIC_LEVEL = 0.2;
let musicSceneLevel = SETUP_MUSIC_LEVEL;
let clashReleaseTimer = 0;
const audioRampTokens = new WeakMap();

function fadeAudioVolume(media, target, duration, pauseAtSilence = false) {
    const boundedTarget = Math.max(0, Math.min(1, target));
    const token = (audioRampTokens.get(media) || 0) + 1;
    audioRampTokens.set(media, token);
    const from = Math.max(0, Math.min(1, media.volume));
    const start = performance.now();
    const update = now => {
        if (audioRampTokens.get(media) !== token) return;
        const progress = duration <= 0 ? 1 : Math.min(1, (now - start) / duration);
        const eased = progress * progress * (3 - 2 * progress);
        media.volume = Math.max(0, Math.min(1, from + (boundedTarget - from) * eased));
        if (progress < 1) requestAnimationFrame(update);
        else if (pauseAtSilence && boundedTarget === 0) media.pause();
    };
    requestAnimationFrame(update);
}

function startMusicPlayback() {
    if (!musicEnabled) return;
    if (music.paused) music.play().catch(() => {});
}

function transitionMusic(level, duration = 700) {
    musicSceneLevel = Math.max(0, Math.min(1, level));
    if (musicEnabled && musicSceneLevel > 0) startMusicPlayback();
    fadeAudioVolume(music, musicEnabled ? musicSceneLevel : 0, duration, !musicEnabled);
}

function playClash() {
    if (!battleSoundsEnabled) return;
    if (clashReleaseTimer) window.clearTimeout(clashReleaseTimer);
    if (!clash.paused) clash.pause();
    clash.currentTime = 0;
    fadeAudioVolume(clash, 0, 0);
    clash.play().catch(() => {});
    fadeAudioVolume(clash, 0.9, 55);
    fadeAudioVolume(music, musicEnabled ? musicSceneLevel * 0.48 : 0, 120, !musicEnabled);
    clashReleaseTimer = window.setTimeout(() => {
        clashReleaseTimer = 0;
        fadeAudioVolume(clash, 0, 540, true);
        fadeAudioVolume(music, musicEnabled ? musicSceneLevel : 0, 420, !musicEnabled);
    }, 390);
}

function saveAudioPreference(key, enabled) {
    try {
        window.localStorage.setItem(key, String(enabled));
    } catch {}
}

musicToggle.addEventListener('click', () => {
    musicEnabled = !musicEnabled;
    saveAudioPreference('battleChessMusicEnabled', musicEnabled);
    syncAudioControls();
    transitionMusic(musicSceneLevel, 560);
});

clashToggle.addEventListener('click', () => {
    battleSoundsEnabled = !battleSoundsEnabled;
    saveAudioPreference('battleChessBattleSoundsEnabled', battleSoundsEnabled);
    syncAudioControls();
    if (!battleSoundsEnabled) {
        if (clashReleaseTimer) window.clearTimeout(clashReleaseTimer);
        clashReleaseTimer = 0;
        fadeAudioVolume(clash, 0, 200, true);
        fadeAudioVolume(music, musicEnabled ? musicSceneLevel : 0, 420, !musicEnabled);
    }
});

enterGameButton.addEventListener('click', () => {
    introScreen.classList.add('hidden');
    colorPicker.classList.remove('hidden');
    tutorialOpenButton.classList.remove('hidden');
    syncBattleLogOption();
    transitionMusic(SETUP_MUSIC_LEVEL, 900);
});

// Game state
let board = initialBoard();
let turn = 'w';
let selected = null;
let pendingPromotion = null;
let positionCounts = new Map();
let busy = false;
let gameOver = false;
let gameSession = 0;
let clockConfig = { baseSeconds: 0, incrementSeconds: 0 };
let clockRemaining = { w: 0, b: 0 };
let moveHistory = [];
let capturedPieces = { w: [], b: [] };
const effects = [];

function rigAt(x, y) {
    return rigs.find(r => r.x === x && r.y === y && !r.dead);
}

function updateCheckWarning() {
    if (!hasStarted) {
        checkThreatGroup.visible = false;
        checkAlertColor = null;
        renderCheckAlert();
        return;
    }

    let king = null;
    for (let y = 0; y < 8 && !king; y++) {
        for (let x = 0; x < 8; x++) {
            const piece = board[y][x];
            if (piece?.t === 'k' && piece.c === turn) {
                king = { x, y };
                break;
            }
        }
    }
    const attackers = king ? checkingPieces(board, turn) : [];
    if (!king || attackers.length === 0) {
        checkThreatGroup.visible = false;
        checkAlertColor = null;
        renderCheckAlert();
        return;
    }

    checkAlertColor = turn;
    renderCheckAlert();
    checkThreatGroup.position.copy(toWorld(king.x, king.y));
    checkThreatGroup.position.y = 0.06;
    checkThreatGroup.visible = true;
    for (let i = 0; i < checkThreatArrows.length; i++) {
        const arrow = checkThreatArrows[i];
        const attacker = attackers[i];
        arrow.root.visible = Boolean(attacker);
        if (!attacker) continue;
        const fileDelta = king.x - attacker.x;
        const rankDelta = king.y - attacker.y;
        const length = Math.hypot(fileDelta, rankDelta) || 1;
        const dx = fileDelta / length;
        const dy = rankDelta / length;
        arrow.root.position.set(-dx * 0.52, 0.022, dy * 0.52);
        const angle = Math.atan2(rankDelta, fileDelta);
        arrow.edge.rotation.z = angle;
        arrow.fill.rotation.z = angle;
    }
}

function clearMoveSquareGlows() {
    for (const glow of moveSquareGlowPool) {
        glow.group.visible = false;
        glow.fill.material.opacity = 0;
        glow.outline.material.opacity = 0;
    }
}

function glowMovedSquare(x, y) {
    const now = performance.now() / 1000;
    const glow = moveSquareGlowPool.find(entry => !entry.group.visible)
        || moveSquareGlowPool.reduce((oldest, entry) => entry.startedAt < oldest.startedAt ? entry : oldest);
    glow.group.position.copy(toWorld(x, y));
    glow.group.position.y = 0.071;
    glow.startedAt = now;
    glow.group.visible = true;
}

function boardFacingRotation(color) {
    // Orient the player's army away from the camera toward its opponent;
    // the computer's army looks back toward the player.
    const playerForward = playerColor === 'w' ? Math.PI : 0;
    return color === playerColor ? playerForward : playerForward + Math.PI;
}

function spawnRig(t, c, x, y) {
    const rig = buildPiece(t, c);
    rig.baseY = 0.06;
    rig.x = x;
    rig.y = y;
    rig.color = c;
    rig.mode = 'idle';
    rig.root.position.copy(toWorld(x, y));
    rig.root.rotation.y = boardFacingRotation(c);
    rig.root.scale.setScalar(PIECE_SCALE);
    rig.contactShadow.position.set(rig.root.position.x, 0.071, rig.root.position.z);
    scene.add(rig.contactShadow);
    scene.add(rig.root);
    rigs.push(rig);
    return rig;
}

function resetGame() {
    gameSession += 1;
    if (clashReleaseTimer) window.clearTimeout(clashReleaseTimer);
    clashReleaseTimer = 0;
    fadeAudioVolume(clash, 0, 180, true);
    restoreBoardCamera();
    rigs.forEach(r => {
        scene.remove(r.root);
        scene.remove(r.contactShadow);
    });
    rigs = [];
    board = initialBoard();
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            if (board[y][x]) spawnRig(board[y][x].t, board[y][x].c, x, y);
        }
    }
    turn = 'w';
    moveHistory = [];
    capturedPieces = { w: [], b: [] };
    positionCounts = new Map();
    positionCounts.set(positionKey(board, turn), 1);
    clockRemaining = { w: clockConfig.baseSeconds, b: clockConfig.baseSeconds };
    gameOver = false;
    busy = false;
    pendingPromotion = null;
    promotionPicker.classList.add('hidden');
    clearMarkers();
    clearMoveSquareGlows();
    updateCheckWarning();
    setStatus('yourMove');
    renderBattlePanel(false);
    renderClock();
    renderClaimButton();
}

function setStatus(key, values = {}) {
    statusKey = key;
    statusValues = values;
    statusMessageEl.textContent = textFor(key, values);
}

function formatClock(seconds) {
    const wholeSeconds = Math.ceil(Math.max(0, seconds));
    const minutes = Math.floor(wholeSeconds / 60);
    const remainder = wholeSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
}

function renderClaimButton() {
    const claims = hasStarted && !gameOver && !busy && !pendingPromotion && turn === playerColor
        ? getClaimableDraws(board, turn, positionCounts)
        : [];
    claimDrawButton.classList.toggle('hidden', claims.length === 0);
    claimDrawButton.title = claims.length ? `Available: ${claims.join(' and ')}` : '';
}

function renderClock() {
    const hidden = clockConfig.baseSeconds <= 0 || !hasStarted || gameOver;
    clockPanel.classList.toggle('hidden', hidden);
    clockPanel.setAttribute('aria-hidden', String(hidden));
    whiteClockEl.textContent = formatClock(clockRemaining.w);
    blackClockEl.textContent = formatClock(clockRemaining.b);
    for (const [color, element] of [['w', whiteClockEl.parentElement], ['b', blackClockEl.parentElement]]) {
        const active = !hidden && !busy && tutorialOverlay.classList.contains('hidden') && turn === color;
        element.classList.toggle('is-active', active);
        element.classList.toggle('low-time', active && clockRemaining[color] <= 30);
    }
}

const capturedGlyphs = {
    w: { p: '♙', n: '♘', b: '♗', r: '♖', q: '♕', k: '♔' },
    b: { p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚' },
};
const pieceNameKeys = { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king' };

function renderCapturedIcons(side, element) {
    element.replaceChildren();
    const lostPieces = capturedPieces[side];
    if (!lostPieces.length) {
        const none = document.createElement('span');
        none.className = 'captured-none';
        none.textContent = tr('noCaptures');
        element.append(none);
        return;
    }
    for (const piece of lostPieces) {
        const icon = document.createElement('span');
        const accessibleName = `${tr(pieceNameKeys[piece.t])} — ${tr(side)}`;
        icon.className = 'captured-icon';
        icon.textContent = capturedGlyphs[side][piece.t] || '·';
        icon.title = accessibleName;
        icon.setAttribute('aria-label', accessibleName);
        element.append(icon);
    }
}

function renderBattlePanel(isCheck = inCheck(board, turn)) {
    const visible = hasStarted && cameraMode !== 'battle' && aiSkill !== 'beginner' && battleLogEnabled;
    battlePanel.classList.toggle('hidden', !visible);
    if (!visible) battlePanel.open = false;
    battleTurnMini.textContent = tr(turn);
    battleTurnMini.setAttribute('aria-label', `${tr('activeSide')}: ${tr(turn)}`);
    battleTurnMini.title = `${tr('activeSide')}: ${tr(turn)}`;
    battleActive.textContent = tr(turn);
    battleCheck.textContent = tr(isCheck ? 'inCheck' : 'kingSafe');
    battleCheck.classList.toggle('is-check', isCheck);
    battleMoves.replaceChildren();

    const recentRows = moveHistory.slice(-8);
    if (!recentRows.length) {
        const empty = document.createElement('li');
        empty.className = 'battle-empty';
        empty.textContent = tr('noMoves');
        battleMoves.append(empty);
    } else {
        for (const row of recentRows) {
            const item = document.createElement('li');
            const number = document.createElement('span');
            const whiteMove = document.createElement('span');
            const blackMove = document.createElement('span');
            item.className = 'battle-move';
            number.className = 'battle-move-number';
            whiteMove.className = 'battle-move-san';
            blackMove.className = 'battle-move-san';
            number.textContent = `${row.number}.`;
            whiteMove.textContent = row.white || '—';
            blackMove.textContent = row.black || '—';
            item.setAttribute('aria-label', `${row.number}. ${row.white || '—'} ${row.black || '—'}`);
            item.append(number, whiteMove, blackMove);
            battleMoves.append(item);
        }
        battleMoves.scrollTop = battleMoves.scrollHeight;
    }
    renderCapturedIcons('w', whiteCapturedEl);
    renderCapturedIcons('b', blackCapturedEl);
}

function squareName(x, y) {
    return `${'abcdefgh'[x]}${y + 1}`;
}

function moveSan(sourceBoard, move, candidates, result) {
    const piece = sourceBoard[move.fy]?.[move.fx];
    if (!piece) return '—';
    const suffix = result.type === 'checkmate' ? '#' : result.inCheck ? '+' : '';
    if (move.castle) return `${move.castle === 'k' ? 'O-O' : 'O-O-O'}${suffix}`;

    const capture = Boolean(move.enPassant || sourceBoard[move.ty]?.[move.tx]);
    let san = '';
    if (piece.t === 'p') {
        if (capture) san += 'abcdefgh'[move.fx];
    } else {
        san += ({ n: 'N', b: 'B', r: 'R', q: 'Q', k: 'K' })[piece.t] || '';
        const competitors = candidates.filter(candidate => {
            if (candidate.fx === move.fx && candidate.fy === move.fy) return false;
            if (candidate.tx !== move.tx || candidate.ty !== move.ty) return false;
            const other = sourceBoard[candidate.fy]?.[candidate.fx];
            return other?.c === piece.c && other.t === piece.t;
        });
        if (competitors.length) {
            const sharesFile = competitors.some(candidate => candidate.fx === move.fx);
            const sharesRank = competitors.some(candidate => candidate.fy === move.fy);
            if (!sharesFile) san += 'abcdefgh'[move.fx];
            else if (!sharesRank) san += String(move.fy + 1);
            else san += squareName(move.fx, move.fy);
        }
    }
    if (capture) san += 'x';
    san += squareName(move.tx, move.ty);
    if (move.promoteTo) san += `=${move.promoteTo.toUpperCase()}`;
    return `${san}${suffix}`;
}

function recordBattleMove(sourceBoard, move, mover, captured, candidates, result) {
    const number = sourceBoard.fullmoveNumber || 1;
    let row = moveHistory.find(entry => entry.number === number);
    if (!row) {
        row = { number, white: '', black: '' };
        moveHistory.push(row);
    }
    row[mover === 'w' ? 'white' : 'black'] = moveSan(sourceBoard, move, candidates, result);
    if (captured) capturedPieces[captured.c].push({ ...captured });
    renderBattlePanel(result.inCheck);
}

function expireOnTime(color) {
    if (gameOver) return;
    finishMatch('timeExpiredTitle', 'timeExpired', { loserColor: color, winnerColor: color === 'w' ? 'b' : 'w' });
}

function showColorPicker(titleKey, copyKey = 'pickerCopy', values = {}, showReplayChoice = false) {
    soundControls.classList.add('hidden');
    pickerTitleKey = titleKey;
    pickerCopyKey = copyKey;
    pickerCopyValues = values;
    pickerTitle.textContent = tr(titleKey);
    const resolvedValues = copyKey === 'playAgainCopy'
        ? { ...values, message: textFor(values.messageKey, values.messageValues) }
        : values;
    pickerCopy.textContent = tr(copyKey, resolvedValues);
    playAgainOptions.classList.toggle('hidden', !showReplayChoice);
    computerSetup.classList.toggle('hidden', showReplayChoice);
    clockSection.classList.toggle('hidden', showReplayChoice);
    tutorialOpenButton.classList.toggle('hidden', showReplayChoice);
    setTutorialButtonContext(false);
    resetGameButton.classList.add('hidden');
    backToSetupButton.classList.add('hidden');
    colorPicker.classList.remove('hidden');
    if (showReplayChoice) playAgainYesButton.focus();
}

function returnToSetup() {
    closeTutorial();
    hasStarted = false;
    promotionPicker.classList.add('hidden');
    resetGame();
    battlePanel.open = false;
    battlePanel.classList.add('hidden');
    setStatus('chooseToBegin');
    showColorPicker('chooseSide', 'pickerCopy');
    transitionMusic(SETUP_MUSIC_LEVEL, 700);
    document.querySelector(`[data-skill="${aiSkill}"]`)?.focus();
}

function finishMatch(titleKey, messageKey, messageValues = {}) {
    gameOver = true;
    checkAlertColor = null;
    renderCheckAlert();
    busy = false;
    pendingPromotion = null;
    battlePanel.open = false;
    battlePanel.classList.add('hidden');
    if (clashReleaseTimer) window.clearTimeout(clashReleaseTimer);
    clashReleaseTimer = 0;
    fadeAudioVolume(clash, 0, 320, true);
    transitionMusic(SETUP_MUSIC_LEVEL, 1100);
    promotionPicker.classList.add('hidden');
    clearMarkers();
    setStatus(messageKey, messageValues);
    renderClock();
    renderClaimButton();
    showColorPicker(titleKey, 'playAgainCopy', { messageKey, messageValues }, true);
}

function finishFromResult(result) {
    if (result.type === 'checkmate') {
        const messageKey = result.winner === playerColor ? 'checkmateWin' : 'checkmateLoss';
        finishMatch('checkmate', messageKey);
        return true;
    }
    if (result.type === 'stalemate') {
        finishMatch('stalemate', 'stalemate');
        return true;
    }
    if (result.type === 'draw') {
        const messageKey = {
            'insufficient-material': 'drawInsufficient',
            'fivefold-repetition': 'drawFivefold',
            'seventy-five-move-rule': 'drawSeventyFive',
        }[result.reason] || 'draw';
        finishMatch('draw', messageKey);
        return true;
    }
    return false;
}

function startGame(color) {
    playerColor = color;
    hasStarted = true;
    soundControls.classList.remove('hidden');
    syncBattleLogOption();
    colorPicker.classList.add('hidden');
    resetGameButton.classList.remove('hidden');
    backToSetupButton.classList.remove('hidden');
    setTutorialButtonContext(true);
    fitCamera();
    resetGame();
    transitionMusic(GAME_MUSIC_LEVEL, 850);
    if (turn !== playerColor) void runComputerTurn();
    else {
        setStatus('yourMove');
        renderClaimButton();
    }
}

resetGameButton.addEventListener('click', () => {
    if (!hasStarted) return;
    startGame(playerColor);
});

playAgainYesButton.addEventListener('click', () => {
    if (!hasStarted || !gameOver) return;
    startGame(playerColor);
});

playAgainNoButton.addEventListener('click', () => {
    if (!hasStarted || !gameOver) return;
    returnToSetup();
});

backToSetupButton.addEventListener('click', () => {
    if (!hasStarted) return;
    returnToSetup();
});

document.querySelectorAll('[data-skill]').forEach(button => {
    button.addEventListener('click', () => {
        aiSkill = button.dataset.skill;
        skillCopy.textContent = tr(`skillCopy${aiSkill[0].toUpperCase()}${aiSkill.slice(1)}`);
        document.querySelectorAll('[data-skill]').forEach(option => {
            option.setAttribute('aria-pressed', String(option === button));
        });
        syncBattleLogOption();
        renderBattlePanel();
    });
});

battleLogToggle.addEventListener('click', () => {
    if (aiSkill === 'beginner') return;
    battleLogEnabled = !battleLogEnabled;
    syncBattleLogOption();
    renderBattlePanel();
});

document.querySelectorAll('[data-clock-base]').forEach(button => {
    button.addEventListener('click', () => {
        clockConfig = {
            baseSeconds: Number(button.dataset.clockBase),
            incrementSeconds: Number(button.dataset.clockIncrement),
        };
        document.querySelectorAll('[data-clock-base]').forEach(option => {
            option.setAttribute('aria-pressed', String(option === button));
        });
        renderClock();
    });
});

document.querySelectorAll('[data-player-color]').forEach(button => {
    button.addEventListener('click', () => startGame(button.dataset.playerColor));
});

claimDrawButton.addEventListener('click', () => {
    if (!hasStarted || busy || gameOver || turn !== playerColor) return;
    const claims = getClaimableDraws(board, turn, positionCounts);
    if (!claims.length) return;
    finishMatch('draw', 'drawClaimed');
});

document.querySelectorAll('[data-promotion]').forEach(button => {
    button.addEventListener('click', () => {
        if (!pendingPromotion || gameOver) return;
        const move = { ...pendingPromotion, promoteTo: button.dataset.promotion };
        pendingPromotion = null;
        promotionPicker.classList.add('hidden');
        busy = false;
        void performMove(move);
    });
});

function clearMarkers() {
    markers.clear();
    selected = null;
}

function showMarkers(x, y) {
    clearMarkers();
    selected = { x, y };
    const add = (sx, sy, material) => {
        const m = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), material);
        m.rotation.x = -Math.PI / 2;
        m.position.copy(toWorld(sx, sy)).setY(0.075);
        markers.add(m);
    };
    add(x, y, selectMat);
    const destinations = new Set();
    for (const move of legalMoves(board, playerColor)) {
        if (move.fx !== x || move.fy !== y) continue;
        const key = `${move.tx},${move.ty}`;
        if (destinations.has(key)) continue;
        destinations.add(key);
        add(move.tx, move.ty, markerMat);
    }
}

// Tween helpers
const wait = ms => new Promise(r => setTimeout(r, ms));

async function runComputerTurn() {
    if (!hasStarted || gameOver || busy || turn === playerColor) return;
    const session = gameSession;
    const claims = getClaimableDraws(board, turn, positionCounts);
    if (claims.length) {
        finishMatch('draw', 'drawClaimed');
        return;
    }
    setStatus('opponentThinking');
    renderClaimButton();
    await wait(500);
    while (session === gameSession && !tutorialOverlay.classList.contains('hidden') && !gameOver) await wait(100);
    if (session !== gameSession || !hasStarted || gameOver || busy || turn === playerColor) return;
    const move = chooseAiMove(board, turn, aiSkill, positionCounts);
    if (move) {
        await performMove(move);
        return;
    }
    finishFromResult(getGameResult(board, turn, positionCounts));
}

function tween(duration, onUpdate) {
    return new Promise(resolve => {
        effects.push({ t: 0, duration, onUpdate, resolve });
    });
}

function faceTowards(rig, target) {
    const d = target.clone().sub(rig.root.position);
    rig.root.rotation.y = Math.atan2(d.x, d.z);
}

async function walk(rig, to) {
    const from = rig.root.position.clone();
    faceTowards(rig, to);
    rig.mode = 'walk';
    const duration = Math.max(0.62, from.distanceTo(to) * 0.48);
    await tween(duration, k => {
        const stride = k * k * (3 - 2 * k);
        rig.root.position.lerpVectors(from, to, stride);
    });
    rig.root.position.y = rig.baseY;
}

function launchQueenArrow(attacker, target) {
    attacker.root.updateMatrixWorld(true);
    const from = attacker.attackPose && attacker.attackArrowOrigin
        ? attacker.attackPose.localToWorld(attacker.attackArrowOrigin.clone())
        : attacker.weapon
            ? attacker.weapon.localToWorld(new THREE.Vector3(0.045, -0.025, 0.29))
            : attacker.root.position.clone().add(new THREE.Vector3(0, 0.78, 0));
    const to = target.clone().setY(0.72);
    const arcHeight = 0.14;
    const pointAt = progress => from.clone().lerp(to, progress)
        .add(new THREE.Vector3(0, Math.sin(Math.PI * progress) * arcHeight, 0));

    // Build a visible wooden arrow with a steel point and fletching, aligned downrange.
    const arrow = new THREE.Group();
    const shaftMaterial = new THREE.MeshStandardMaterial({ color: 0x80552f, roughness: 0.82 });
    const headMaterial = new THREE.MeshStandardMaterial({ color: 0xb8c0c6, metalness: 0.62, roughness: 0.34 });
    const featherMaterial = new THREE.MeshBasicMaterial({ color: 0x9b3e32, side: THREE.DoubleSide });
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.012, 0.48, 7), shaftMaterial);
    shaft.rotation.x = Math.PI / 2;
    const point = new THREE.Mesh(new THREE.ConeGeometry(0.024, 0.1, 5), headMaterial);
    point.position.z = 0.28;
    point.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1));
    const featherGeometry = new THREE.BufferGeometry();
    featherGeometry.setAttribute('position', new THREE.Float32BufferAttribute([
        0, 0, -0.15, 0.045, 0, -0.24, 0, 0, -0.24,
        0, 0, -0.15, -0.045, 0, -0.24, 0, 0, -0.24,
        0, 0, -0.15, 0, 0.045, -0.24, 0, 0, -0.24,
        0, 0, -0.15, 0, -0.045, -0.24, 0, 0, -0.24,
    ], 3));
    const feathers = new THREE.Mesh(featherGeometry, featherMaterial);
    arrow.add(shaft, point, feathers);
    arrow.position.copy(from);
    scene.add(arrow);

    const localForward = new THREE.Vector3(0, 0, 1);
    const worldUp = new THREE.Vector3(0, 1, 0);
    return tween(0.24, progress => {
        arrow.position.copy(pointAt(progress));
        const tangent = to.clone().sub(from)
            .addScaledVector(worldUp, arcHeight * Math.PI * Math.cos(Math.PI * progress))
            .normalize();
        arrow.quaternion.setFromUnitVectors(localForward, tangent);
    }).then(() => {
        scene.remove(arrow);
        shaft.geometry.dispose();
        point.geometry.dispose();
        featherGeometry.dispose();
        shaftMaterial.dispose();
        headMaterial.dispose();
        featherMaterial.dispose();
    });
}

function sparks(pos) {
    const colors = [0xfff5cf, 0xffd45e, 0xffa83a];
    for (let i = 0; i < 12; i++) {
        const size = i < 4 ? 0.045 : 0.034;
        const geometry = new THREE.SphereGeometry(size, 5, 4);
        const material = new THREE.MeshBasicMaterial({
            color: colors[i % colors.length],
            transparent: true,
            opacity: 1,
            toneMapped: false,
        });
        const spark = new THREE.Mesh(geometry, material);
        const dir = new THREE.Vector3(Math.random() - 0.5, 0.35 + Math.random(), Math.random() - 0.5)
            .multiplyScalar(1.35);
        spark.position.copy(pos);
        scene.add(spark);
        const start = spark.position.clone();
        void tween(0.32, k => {
            spark.position.copy(start).addScaledVector(dir, k);
            spark.scale.setScalar(1 - k);
            material.opacity = 1 - k;
        }).then(() => {
            scene.remove(spark);
            geometry.dispose();
            material.dispose();
        });
    }
}

function impactFlash(pos) {
    const ringGeometry = new THREE.TorusGeometry(0.12, 0.018, 6, 24);
    const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xffd36b, transparent: true, opacity: 1, toneMapped: false });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    const coreGeometry = new THREE.SphereGeometry(0.045, 8, 6);
    const coreMaterial = new THREE.MeshBasicMaterial({ color: 0xfff2c4, transparent: true, opacity: 1, toneMapped: false });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    const towardCamera = camera.position.clone().sub(pos).normalize();
    ring.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), towardCamera);
    ring.position.copy(pos);
    core.position.copy(pos);
    scene.add(ring, core);
    void tween(0.3, k => {
        ring.scale.setScalar(0.45 + k * 1.45);
        ringMaterial.opacity = 1 - k;
        core.scale.setScalar(1 + k * 0.8);
        coreMaterial.opacity = 1 - k;
    }).then(() => {
        scene.remove(ring, core);
        ringGeometry.dispose();
        ringMaterial.dispose();
        coreGeometry.dispose();
        coreMaterial.dispose();
    });
}

function triggerImpactBeat(point) {
    if (battleFocus) {
        battleFocus.lerp(point, 0.35);
        battleFocus.y = 0.06;
    }
    battleImpactZoom = 0;
    updateBattleCameraGoal();
    void tween(0.34, k => {
        battleImpactZoom = Math.sin(k * Math.PI);
        updateBattleCameraGoal();
    }).then(() => {
        battleImpactZoom = 0;
        updateBattleCameraGoal();
    });
    impactFlash(point);
    sparks(point);
}

async function fight(attacker, defender) {
    const session = gameSession;
    const target = defender.root.position.clone();
    const dir = target.clone().sub(attacker.root.position).normalize();
    const reachByPiece = { n: 0.88, b: 0.82, r: 0.72, q: 2.2, k: 0.78, p: 0.42 };
    const reach = reachByPiece[attacker.type] ?? 0.75;
    const stand = attacker.root.position.distanceTo(target) > reach ? target.clone().addScaledVector(dir, -reach) : attacker.root.position.clone();
    startBattleCamera(attacker, defender);
    await walk(attacker, stand);
    if (session !== gameSession) return;
    const attackerHome = attacker.root.position.clone();
    const defenderHome = defender.root.position.clone();
    const combatDir = target.clone().sub(attackerHome).normalize();
    battleFocus = attackerHome.clone().add(defenderHome).multiplyScalar(0.5);
    battleSpan = Math.max(0, attackerHome.distanceTo(defenderHome) - 1);
    updateBattleCameraGoal();
    faceTowards(attacker, target);
    faceTowards(defender, attacker.root.position);
    attacker.fightFacingY = attacker.root.rotation.y;
    attacker.mode = 'fight';
    defender.mode = 'fight';
    attacker.fightRole = 'attacker';
    defender.fightRole = 'defender';
    attacker.phase = 0;
    defender.phase = 0;
    if (attacker.type === 'q') {
        attacker.root.updateMatrixWorld(true);
        const bowOrigin = attacker.attackPose
            ? attacker.attackPose.getWorldPosition(new THREE.Vector3())
            : attacker.weapon?.getWorldPosition(new THREE.Vector3());
        if (bowOrigin) {
            const aimTarget = target.clone().setY(0.72);
            const horizontalDistance = Math.hypot(aimTarget.x - bowOrigin.x, aimTarget.z - bowOrigin.z);
            attacker.fightAimX = Math.atan2(bowOrigin.y - aimTarget.y, Math.max(0.1, horizontalDistance));
        } else {
            attacker.fightAimX = 0;
        }
    }

    const impactAt = { n: 0.52, b: 0.58, r: 0.56, q: 0.61, k: 0.59, p: 0.5 }[attacker.type] ?? 0.55;
    const impactDelay = attacker.type === 'q' ? 0.24 / 1.12 : 0;
    const contactAt = impactAt + impactDelay;
    const driveDistance = { n: 0.38, b: 0.09, r: 0.27, q: 0.015, k: 0.16, p: 0.24 }[attacker.type] ?? 0.12;
    let impacted = false;
    await tween(1.12, k => {
        attacker.phase = k;
        defender.phase = k;
        const strikeProgress = THREE.MathUtils.clamp((k - 0.18) / 0.62, 0, 1);
        const strike = Math.sin(strikeProgress * Math.PI);
        attacker.root.position.copy(attackerHome).addScaledVector(combatDir, driveDistance * strike);
        const hitPulse = k >= contactAt ? Math.max(0, 1 - (k - contactAt) / 0.2) : 0;
        const sharedPulse = k >= contactAt
            ? Math.sin(THREE.MathUtils.clamp((k - contactAt) / 0.15, 0, 1) * Math.PI)
            : 0;
        attacker.root.scale.set(
            PIECE_SCALE * (1 + sharedPulse * 0.035),
            PIECE_SCALE * (1 - sharedPulse * 0.04),
            PIECE_SCALE * (1 + sharedPulse * 0.035),
        );
        defender.root.scale.set(
            PIECE_SCALE * (1 - sharedPulse * 0.025),
            PIECE_SCALE * (1 + sharedPulse * 0.03),
            PIECE_SCALE * (1 - sharedPulse * 0.025),
        );
        defender.root.position.copy(defenderHome).addScaledVector(combatDir, -hitPulse * 0.15);

        if (!impacted && k >= impactAt) {
            impacted = true;
            if (attacker.type === 'q') {
                void launchQueenArrow(attacker, target).then(() => {
                    if (session !== gameSession) return;
                    triggerImpactBeat(target.clone().setY(0.72));
                    playClash();
                });
            } else {
                const contactPoint = target.clone().lerp(attacker.root.position, 0.35).setY(0.72);
                triggerImpactBeat(contactPoint);
                playClash();
            }
        }
    });
    if (session !== gameSession) return;

    attacker.root.position.copy(attackerHome);
    attacker.root.scale.setScalar(PIECE_SCALE);
    attacker.root.rotation.x = 0;
    attacker.root.rotation.z = 0;
    attacker.root.rotation.y = attacker.fightFacingY;
    attacker.mode = 'idle';
    defender.root.position.copy(defenderHome);
    defender.root.scale.setScalar(PIECE_SCALE);
    defender.mode = 'fall';
    defender.dead = true;
    if (defender.type === 'r') {
        await tween(0.42, k => {
            defender.root.scale.set(PIECE_SCALE * (1 + k * 0.14), PIECE_SCALE * (1 - k), PIECE_SCALE * (1 + k * 0.14));
            defender.root.position.x = target.x + Math.sin(k * 28) * 0.025;
        });
        if (session !== gameSession) return;
        sparks(target);
    } else {
        const fallDirection = Math.sign(defenderHome.x - attackerHome.x) || 1;
        await tween(0.46, k => {
            defender.root.rotation.z = fallDirection * k * 0.92;
            defender.root.rotation.x = k * 0.18;
            defender.root.position.x = defenderHome.x + fallDirection * 0.08 * k;
            defender.root.position.y = defenderHome.y - 0.035 * k;
            defender.root.scale.setScalar(PIECE_SCALE * (1 - k * 0.1));
        });
        if (session !== gameSession) return;
    }
    scene.remove(defender.root);
    scene.remove(defender.contactShadow);
    rigs = rigs.filter(r => r !== defender);
    restoreBoardCamera();
}

async function performMove(move) {
    if (!move || gameOver) return;
    const session = gameSession;
    const mover = turn;
    const sourceBoard = board;
    const candidates = legalMoves(sourceBoard, mover);
    const capturedPiece = move.enPassant
        ? sourceBoard[move.fy]?.[move.tx]
        : sourceBoard[move.ty]?.[move.tx];
    busy = true;
    renderClaimButton();
    if (clockConfig.baseSeconds > 0) clockRemaining[mover] += clockConfig.incrementSeconds;
    clearMarkers();
    const rig = rigAt(move.fx, move.fy);
    if (!rig) {
        busy = false;
        return;
    }
    const capturedX = move.tx;
    const capturedY = move.enPassant ? move.fy : move.ty;
    const defender = rigAt(capturedX, capturedY);
    const moved = board[move.fy][move.fx];
    const dest = toWorld(move.tx, move.ty);
    if (defender) await fight(rig, defender);
    if (session !== gameSession) return;

    let rookRig = null;
    if (move.castle) {
        const rookFromX = move.castle === 'k' ? 7 : 0;
        const rookToX = move.castle === 'k' ? 5 : 3;
        rookRig = rigAt(rookFromX, move.fy);
        const walks = [walk(rig, dest)];
        if (rookRig) walks.push(walk(rookRig, toWorld(rookToX, move.fy)));
        await Promise.all(walks);
        if (session !== gameSession) return;
        if (rookRig) {
            glowMovedSquare(rookToX, move.fy);
            rookRig.mode = 'idle';
            rookRig.root.rotation.y = boardFacingRotation(rookRig.color);
            rookRig.x = rookToX;
            rookRig.y = move.fy;
        }
    } else {
        await walk(rig, dest);
        if (session !== gameSession) return;
    }

    glowMovedSquare(move.tx, move.ty);
    rig.mode = 'idle';
    rig.root.rotation.y = boardFacingRotation(rig.color);
    rig.x = move.tx;
    rig.y = move.ty;

    board = applyMove(board, move);
    const promotedPiece = board[move.ty][move.tx];
    if (moved.t === 'p' && promotedPiece.t !== 'p') {
        scene.remove(rig.root);
        scene.remove(rig.contactShadow);
        rigs = rigs.filter(existingRig => existingRig !== rig);
        spawnRig(promotedPiece.t, moved.c, move.tx, move.ty);
    }

    turn = turn === 'w' ? 'b' : 'w';
    updateCheckWarning();
    const key = positionKey(board, turn);
    positionCounts.set(key, (positionCounts.get(key) || 0) + 1);
    const result = getGameResult(board, turn, positionCounts);
    recordBattleMove(sourceBoard, move, mover, capturedPiece, candidates, result);
    if (finishFromResult(result)) return;
    if (gameOver) {
        busy = false;
        return;
    }

    busy = false;
    renderClock();
    if (turn === playerColor) {
        setStatus(result.inCheck ? 'checkYourMove' : 'yourMove');
        renderClaimButton();
    } else {
        setStatus(result.inCheck ? 'checkOpponent' : 'opponentThinking');
        await runComputerTurn();
        renderClaimButton();
    }
}

// Input
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
renderer.domElement.addEventListener('pointermove', event => {
    if (!boardPlacementDrag || event.pointerId !== boardPlacementDrag.pointerId) return;
    event.preventDefault();
    const dx = event.clientX - boardPlacementDrag.startX;
    const dy = event.clientY - boardPlacementDrag.startY;
    if (!boardPlacementDrag.moved && Math.hypot(dx, dy) < 3) return;
    boardPlacementDrag.moved = true;
    boardViewOffset.copy(boardPlacementDrag.startOffset)
        .addScaledVector(boardPlacementDrag.right, -dx * boardPlacementDrag.unitsPerPixel)
        .addScaledVector(boardPlacementDrag.up, dy * boardPlacementDrag.unitsPerPixel);
    updateBoardCameraGoal();
});
const finishBoardPlacementDrag = event => {
    if (!boardPlacementDrag || event.pointerId !== boardPlacementDrag.pointerId) return;
    if (boardPlacementDrag.moved) persistBoardView();
    boardPlacementDrag = null;
};
renderer.domElement.addEventListener('pointerup', finishBoardPlacementDrag);
renderer.domElement.addEventListener('pointercancel', finishBoardPlacementDrag);
renderer.domElement.addEventListener('pointerdown', e => {
    if (boardPlacementMode) {
        if (e.button !== 0) return;
        e.preventDefault();
        const basis = boardScreenBasis();
        boardPlacementDrag = {
            pointerId: e.pointerId,
            startX: e.clientX,
            startY: e.clientY,
            startOffset: boardViewOffset.clone(),
            ...basis,
            moved: false,
        };
        renderer.domElement.setPointerCapture(e.pointerId);
        return;
    }
    if (!hasStarted || busy || pendingPromotion || gameOver || turn !== playerColor) return;
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const pickables = [...squares, ...rigs.map(r => r.root)];
    const hit = raycaster.intersectObjects(pickables, true)[0];
    if (!hit) return;
    let obj = hit.object;
    let sq = null;
    if (obj.userData.x !== undefined) {
        sq = obj.userData;
    } else {
        const rig = rigs.find(r => {
            let o = obj;
            while (o) {
                if (o === r.root) return true;
                o = o.parent;
            }
            return false;
        });
        if (rig) sq = { x: rig.x, y: rig.y };
    }
    if (!sq) return;
    if (selected) {
        const matchingMoves = legalMoves(board, playerColor).filter(m => m.fx === selected.x && m.fy === selected.y && m.tx === sq.x && m.ty === sq.y);
        if (matchingMoves.length) {
            if (matchingMoves[0].promoteTo) {
                pendingPromotion = matchingMoves[0];
                clearMarkers();
                promotionPicker.classList.remove('hidden');
                setStatus('choosePromotion');
                renderClock();
                renderClaimButton();
            } else {
                void performMove(matchingMoves[0]);
            }
            return;
        }
    }
    const piece = board[sq.y][sq.x];
    if (piece && piece.c === playerColor) showMarkers(sq.x, sq.y);
    else clearMarkers();
});

resetGame();
setStatus('chooseToBegin');

const timer = new THREE.Timer();
renderer.setAnimationLoop(time => {
    timer.update(time);
    const dt = Math.min(timer.getDelta(), 0.05);
    const now = time / 1000;
    if (checkThreatGroup.visible) {
        const shimmer = 0.5 + Math.sin(now * 1.8) * 0.5;
        checkGlowMaterial.opacity = 0.12 + shimmer * 0.045;
        threatArrowEdgeMaterial.opacity = 0.72 + shimmer * 0.12;
        threatArrowFillMaterial.opacity = 0.78 + shimmer * 0.1;
    }
    for (const glow of moveSquareGlowPool) {
        if (!glow.group.visible) continue;
        const progress = (now - glow.startedAt) / glow.duration;
        if (progress >= 1) {
            glow.group.visible = false;
            glow.fill.material.opacity = 0;
            glow.outline.material.opacity = 0;
            continue;
        }
        const envelope = Math.sin(Math.max(0, progress) * Math.PI) ** 0.72;
        const pulse = 0.82 + 0.18 * Math.sin(now * 17);
        glow.fill.material.opacity = envelope * pulse * 0.34;
        glow.outline.material.opacity = envelope * 0.95;
    }
    if (clockConfig.baseSeconds > 0 && hasStarted && !gameOver && !busy && tutorialOverlay.classList.contains('hidden')) {
        clockRemaining[turn] = Math.max(0, clockRemaining[turn] - dt);
        if (clockRemaining[turn] === 0) expireOnTime(turn);
    }
    renderClock();
    for (let i = effects.length - 1; i >= 0; i--) {
        if (!tutorialOverlay.classList.contains('hidden')) break;
        const fx = effects[i];
        fx.t += dt;
        const k = Math.min(fx.t / fx.duration, 1);
        fx.onUpdate(k, dt);
        if (k >= 1) {
            effects.splice(i, 1);
            fx.resolve();
        }
    }
    for (const rig of rigs) {
        if (rig.dead) continue;
        const arrivalPhase = rig.mode === 'arrival'
            ? Math.min(1, Math.max(0, (now - rig.arrivalStartedAt) / PROMOTION_FLOURISH_DURATION))
            : rig.phase || 0;
        animateRig(rig, now + rig.x * 0.3, rig.mode, arrivalPhase);
        if (rig.mode === 'arrival' && arrivalPhase >= 1) rig.mode = 'idle';
        rig.contactShadow.position.set(rig.root.position.x, 0.071, rig.root.position.z);
    }
    const cameraEase = 1 - Math.exp(-dt * 3.2);
    camera.position.lerp(cameraGoalPosition, cameraEase);
    cameraLookTarget.lerp(cameraGoalTarget, cameraEase);
    camera.lookAt(cameraLookTarget);
    renderer.render(scene, camera);
});
