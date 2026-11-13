import * as Phaser from './_remote/9e73b21cb6ba014a/phaser.esm.js';

const W = 720;
const H = 1280;
const MAX_LEVEL = 50;
const DRAW_TIME = 30;
const SURVIVE_TIME = 15;
const INK_MAX = 1400;

const THEMES = [
  { name: 'Meadow', sky: [0x8fd8ff, 0xe6f8ff], hill: 0x6cc24a, ground: 0x4e9a2f },
  { name: 'Desert', sky: [0xffc46b, 0xfff0c9], hill: 0xe8b060, ground: 0xc98a3c },
  { name: 'Snow', sky: [0xa8c8e8, 0xf2f8ff], hill: 0xffffff, ground: 0xd8e6f2 },
  { name: 'Night', sky: [0x151a45, 0x3b3f8a], hill: 0x2c4a3a, ground: 0x1f3328 },
  { name: 'Sunset', sky: [0xff6f61, 0xffd28a], hill: 0x9a4f6a, ground: 0x6a3450 },
  { name: 'Candy', sky: [0xffb6e1, 0xfff0fa], hill: 0xff7ac4, ground: 0xd9579f },
  { name: 'Forest', sky: [0x5aa37a, 0xcdeccf], hill: 0x2f7a3e, ground: 0x245c2e },
  { name: 'Volcano', sky: [0x3a1010, 0xa83a1a], hill: 0x4a2a22, ground: 0x2a1812 },
  { name: 'Ocean', sky: [0x2aa8d8, 0xb8f0ff], hill: 0xf2dca0, ground: 0xd9b870 },
  { name: 'Space', sky: [0x05030f, 0x2a1850], hill: 0x6a6a80, ground: 0x44445a },
];

const SKINS = [
  { id: 'yellow', name: 'Classic Yellow', cost: 0, color: null },
  { id: 'blue', name: 'Blue', cost: 250, color: [48, 139, 255] },
  { id: 'red', name: 'Red', cost: 400, color: [244, 55, 65] },
  { id: 'green', name: 'Green', cost: 600, color: [53, 194, 79] },
  { id: 'orange', name: 'Orange', cost: 1000, color: [255, 139, 37] },
  { id: 'gold', name: 'Gold', cost: null, color: [255, 204, 35] },
];

const ACHIEVEMENTS = [
  { id: 'beginner', name: 'Beginner', description: 'Complete 10 levels', target: 10, reward: 25 },
  { id: 'pro', name: 'Pro', description: 'Complete 25 levels', target: 25, reward: 50 },
  { id: 'gameMaster', name: 'Game Master', description: 'Complete all 50 levels', target: 50, reward: 100 },
  { id: 'skinLover', name: 'Skin Lover', description: 'Purchase 3 balloon skins', target: 3, reward: 50 },
  { id: 'rich', name: 'Rich', description: 'Earn 1,000 coins total', target: 1000, reward: 50 },
  { id: 'survivor', name: 'Survivor', description: 'Survive 300 seconds total', target: 300, reward: 100 },
];

const store = {
  get level() { return Math.min(MAX_LEVEL, parseInt(localStorage.getItem('stb_level') || '1', 10)); },
  set level(v) { localStorage.setItem('stb_level', String(v)); },
  get sound() { return localStorage.getItem('stb_sound') !== '0'; },
  set sound(v) { localStorage.setItem('stb_sound', v ? '1' : '0'); },
  get coins() {
    const value = Number.parseInt(localStorage.getItem('stb_coins') || '0', 10);
    return Number.isFinite(value) ? Math.max(0, value) : 0;
  },
  set coins(v) { localStorage.setItem('stb_coins', String(Math.max(0, Math.floor(Number(v) || 0)))); },
  get owned() {
    try {
      const saved = JSON.parse(localStorage.getItem('stb_owned_skins') || '[]');
      const valid = Array.isArray(saved) ? saved.filter((id) => SKINS.some((skin) => skin.id === id)) : [];
      return [...new Set(['yellow', ...valid])];
    } catch {
      return ['yellow'];
    }
  },
  set owned(ids) { localStorage.setItem('stb_owned_skins', JSON.stringify([...new Set(['yellow', ...ids])])); },
  get achievements() {
    try {
      const saved = JSON.parse(localStorage.getItem('stb_achievements') || '[]');
      return Array.isArray(saved) ? [...new Set(saved.filter((id) => ACHIEVEMENTS.some((item) => item.id === id)))] : [];
    } catch {
      return [];
    }
  },
  set achievements(ids) { localStorage.setItem('stb_achievements', JSON.stringify([...new Set(ids)])); },
  get survivedSeconds() {
    const value = Number.parseInt(localStorage.getItem('stb_survived_seconds') || '0', 10);
    return Number.isFinite(value) ? Math.max(0, value) : 0;
  },
  set survivedSeconds(value) { localStorage.setItem('stb_survived_seconds', String(Math.max(0, Math.floor(Number(value) || 0)))); },
  get totalCoinsEarned() {
    const saved = localStorage.getItem('stb_total_coins_earned');
    if (saved === null) return this.coins;
    const value = Number.parseInt(saved, 10);
    return Number.isFinite(value) ? Math.max(0, value) : this.coins;
  },
  set totalCoinsEarned(value) { localStorage.setItem('stb_total_coins_earned', String(Math.max(0, Math.floor(Number(value) || 0)))); },
  get pendingAchievements() {
    try {
      const saved = JSON.parse(localStorage.getItem('stb_pending_achievements') || '[]');
      return Array.isArray(saved) ? saved.filter((id) => ACHIEVEMENTS.some((item) => item.id === id)) : [];
    } catch {
      return [];
    }
  },
  set pendingAchievements(ids) { localStorage.setItem('stb_pending_achievements', JSON.stringify(ids)); },
  earnCoins(amount) {
    const coins = Math.max(0, Math.floor(Number(amount) || 0));
    const lifetimeTotal = this.totalCoinsEarned;
    this.coins += coins;
    this.totalCoinsEarned = lifetimeTotal + coins;
  },
  get completed() { return localStorage.getItem('stb_completed') === '1'; },
  set completed(v) { localStorage.setItem('stb_completed', v ? '1' : '0'); },
  get rewardedLevels() {
    const claimed = new Set();
    try {
      const saved = JSON.parse(localStorage.getItem('stb_rewarded_levels') || '[]');
      if (Array.isArray(saved)) {
        saved.forEach((level) => {
          if (Number.isInteger(level) && level >= 1 && level <= MAX_LEVEL) claimed.add(level);
        });
      }
    } catch {
      // Older saves have no reward history; infer completed levels below progress.
    }
    for (let level = 1; level < this.level; level++) claimed.add(level);
    if (this.completed) {
      for (let level = 1; level <= MAX_LEVEL; level++) claimed.add(level);
    }
    return [...claimed].sort((a, b) => a - b);
  },
  set rewardedLevels(levels) {
    const valid = Array.isArray(levels)
      ? levels.filter((level) => Number.isInteger(level) && level >= 1 && level <= MAX_LEVEL)
      : [];
    localStorage.setItem('stb_rewarded_levels', JSON.stringify([...new Set(valid)]));
  },
  isOwned(id) { return id === 'yellow' || (id === 'gold' && this.completed) || this.owned.includes(id); },
  get equipped() {
    const saved = localStorage.getItem('stb_equipped_skin') || 'yellow';
    return this.isOwned(saved) ? saved : 'yellow';
  },
  set equipped(id) {
    if (this.isOwned(id)) localStorage.setItem('stb_equipped_skin', id);
  },
};

function ballTextureFor(skinId) {
  return skinId === 'yellow' ? 'ball' : `ball-skin-${skinId}`;
}

function ensureBallSkinTextures(scene) {
  const source = scene.textures.get('ball').getSourceImage();
  const width = source.naturalWidth || source.width;
  const height = source.naturalHeight || source.height;
  SKINS.filter((skin) => skin.color).forEach((skin) => {
    const key = ballTextureFor(skin.id);
    if (scene.textures.exists(key)) return;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.drawImage(source, 0, 0, width, height);
    const image = context.getImageData(0, 0, width, height);
    const pixels = image.data;
    const [red, green, blue] = skin.color;
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      if (pixels[i + 3] > 0 && r > 115 && g > 78 && b < 145 && r > b * 1.35 && g > b * 1.2) {
        const shade = Math.min(1.18, Math.max(0.42, (r * 0.3 + g * 0.59 + b * 0.11) / 224));
        pixels[i] = Math.min(255, Math.round(red * shade));
        pixels[i + 1] = Math.min(255, Math.round(green * shade));
        pixels[i + 2] = Math.min(255, Math.round(blue * shade));
      }
    }
    context.putImageData(image, 0, 0);
    scene.textures.addCanvas(key, canvas);
  });
}

function makeButton(scene, x, y, label, color, onClick, width = 300, fontSize = '40px') {
  const box = scene.add.rectangle(0, 0, width, 90, color).setStrokeStyle(6, 0x222222);
  const text = scene.add.text(0, 0, label, {
    fontFamily: 'Inter', fontSize, fontStyle: '800', color: '#fff', stroke: '#222', strokeThickness: 6,
  }).setOrigin(0.5);
  const btn = scene.add.container(x, y, [box, text]).setSize(width, 90).setDepth(50);
  btn.setInteractive({ useHandCursor: true });
  btn.on('pointerdown', (p, lx, ly, ev) => {
    ev.stopPropagation();
    scene.tweens.add({ targets: btn, scale: 0.9, duration: 70, yoyo: true });
    onClick();
  });
  btn.label = text;
  return btn;
}

function soundToggle(scene, x, y) {
  const btn = makeButton(scene, x, y, store.sound ? '🔊' : '🔇', 0x555577, () => {
    store.sound = !store.sound;
    scene.sound.mute = !store.sound;
    btn.label.setText(store.sound ? '🔊' : '🔇');
  }, 100);
  scene.sound.mute = !store.sound;
  return btn;
}

function achievementProgress(id) {
  if (id === 'beginner' || id === 'pro' || id === 'gameMaster') return store.rewardedLevels.length;
  if (id === 'skinLover') {
    return store.owned.filter((skinId) => {
      const skin = SKINS.find((item) => item.id === skinId);
      return skin && skin.cost > 0;
    }).length;
  }
  if (id === 'rich') return store.totalCoinsEarned;
  if (id === 'survivor') return store.survivedSeconds;
  return 0;
}

function flushAchievementNotifications(scene) {
  if (scene.achievementToastActive) return;
  const pending = store.pendingAchievements;
  if (!pending.length) return;
  const achievement = ACHIEVEMENTS.find((item) => item.id === pending[0]);
  if (!achievement) {
    store.pendingAchievements = pending.slice(1);
    flushAchievementNotifications(scene);
    return;
  }

  scene.achievementToastActive = true;
  const panel = scene.add.rectangle(0, 0, 650, 126, 0x22243a, 0.97).setStrokeStyle(5, 0xffd34b);
  const title = scene.add.text(0, -34, 'ACHIEVEMENT UNLOCKED!', {
    fontFamily: 'Orbitron', fontSize: '27px', fontStyle: '700', color: '#ffe23d',
    stroke: '#171722', strokeThickness: 5,
  }).setOrigin(0.5);
  const detail = scene.add.text(0, 15, `${achievement.name}  ·  +${achievement.reward} coins`, {
    fontFamily: 'Inter', fontSize: '29px', fontStyle: '800', color: '#fff',
    stroke: '#171722', strokeThickness: 5,
  }).setOrigin(0.5);
  const toast = scene.add.container(W / 2, 375, [panel, title, detail]).setDepth(110);
  toast.setAlpha(0);
  scene.tweens.add({
    targets: toast, alpha: 1, y: 390, duration: 220, ease: 'Back.Out',
    onComplete: () => scene.time.delayedCall(5000, () => {
      scene.tweens.add({
        targets: toast, alpha: 0, y: 360, duration: 220,
        onComplete: () => {
          toast.destroy();
          const currentQueue = store.pendingAchievements;
          if (currentQueue[0] === achievement.id) store.pendingAchievements = currentQueue.slice(1);
          scene.achievementToastActive = false;
          flushAchievementNotifications(scene);
        },
      });
    }),
  });
}

function checkAchievements(scene = null) {
  let unlockedAny = true;
  while (unlockedAny) {
    unlockedAny = false;
    const earned = store.achievements;
    for (const achievement of ACHIEVEMENTS) {
      if (earned.includes(achievement.id) || achievementProgress(achievement.id) < achievement.target) continue;
      earned.push(achievement.id);
      store.achievements = earned;
      store.earnCoins(achievement.reward);
      store.pendingAchievements = [...store.pendingAchievements, achievement.id];
      unlockedAny = true;
    }
  }
  if (scene) flushAchievementNotifications(scene);
}

function drawBackground(scene, theme, groundY) {
  const g = scene.add.graphics();
  g.fillGradientStyle(theme.sky[0], theme.sky[0], theme.sky[1], theme.sky[1], 1);
  g.fillRect(0, 0, W, H);
  if (theme.name === 'Night' || theme.name === 'Space') {
    g.fillStyle(0xffffff, 0.9);
    for (let i = 0; i < 60; i++) {
      g.fillCircle(Phaser.Math.Between(0, W), Phaser.Math.Between(0, groundY - 200), Phaser.Math.Between(1, 3));
    }
  } else {
    g.fillStyle(0xffffff, 0.8);
    [[150, 220], [520, 320], [340, 150]].forEach(([cx, cy]) => {
      g.fillCircle(cx, cy, 40);
      g.fillCircle(cx + 45, cy - 15, 50);
      g.fillCircle(cx + 95, cy, 40);
    });
  }
  g.fillStyle(theme.hill, 1);
  g.fillEllipse(150, groundY, 600, 380);
  g.fillEllipse(600, groundY, 700, 300);
  g.fillStyle(theme.ground, 1);
  g.fillRect(0, groundY, W, H - groundY);
  g.lineStyle(6, 0x222222, 1);
  g.lineBetween(0, groundY, W, groundY);
}

function drawHive(scene, x, y) {
  const g = scene.add.graphics().setDepth(4);
  g.fillStyle(0x3b2918, 0.28);
  g.fillEllipse(x, y + 37, 100, 20);
  g.fillStyle(0x765027, 1);
  g.fillEllipse(x, y + 13, 88, 50);
  g.fillStyle(0xd29a43, 1);
  g.fillEllipse(x, y + 10, 78, 43);
  g.fillStyle(0x765027, 1);
  g.fillEllipse(x, y - 3, 70, 34);
  g.fillStyle(0xe4ad52, 1);
  g.fillEllipse(x, y - 6, 60, 29);
  g.fillStyle(0x765027, 1);
  g.fillEllipse(x, y - 17, 51, 27);
  g.fillStyle(0xe8b85f, 1);
  g.fillEllipse(x, y - 20, 41, 22);
  g.fillStyle(0x765027, 1);
  g.fillEllipse(x, y - 29, 30, 19);
  g.fillStyle(0xefc66e, 1);
  g.fillEllipse(x, y - 31, 21, 13);
  g.lineStyle(3, 0x9a692d, 0.9);
  g.lineBetween(x - 32, y + 4, x + 32, y + 4);
  g.lineBetween(x - 36, y + 17, x + 36, y + 17);
  g.fillStyle(0x3c2516, 1);
  g.fillEllipse(x, y + 22, 19, 13);
  g.fillStyle(0xffd36b, 0.9);
  g.fillCircle(x - 27, y - 7, 2);
  g.fillCircle(x + 27, y - 7, 2);
  return { x, y };
}

class MenuScene extends Phaser.Scene {
  constructor() { super('menu'); }

  preload() {
    this.load.image('ball', 'assets/ball-face.webp');
    this.load.image('bee', 'assets/bee.webp');
    this.load.audio('music', 'assets/audio/menu-music.mp3');
    this.load.audio('win', 'assets/audio/win-jingle.mp3');
    this.load.audio('lose', 'assets/audio/lose-sting.mp3');
  }

  create() {
    checkAchievements(this);
    ensureBallSkinTextures(this);
    drawBackground(this, THEMES[0], 1000);
    this.add.text(W / 2, 260, 'SAVE THE BALL\nFROM BEES', {
      fontFamily: 'Orbitron', fontSize: '64px', fontStyle: '700', color: '#ffe23d',
      stroke: '#222', strokeThickness: 12, align: 'center',
    }).setOrigin(0.5);
    const ball = this.add.image(W / 2, 560, ballTextureFor(store.equipped)).setDisplaySize(200, 200);
    this.tweens.add({ targets: ball, y: 540, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    for (let i = 0; i < 3; i++) {
      const bee = this.add.image(W / 2, 560, 'bee').setDisplaySize(90, 90);
      this.tweens.addCounter({
        from: 0, to: Math.PI * 2, duration: 3000, repeat: -1,
        onUpdate: (t) => {
          const a = t.getValue() + i * 2.1;
          bee.setPosition(W / 2 + Math.cos(a) * 220, 560 + Math.sin(a) * 120);
          bee.setFlipX(Math.sin(a) > 0);
        },
      });
    }
    const lvl = store.level;
    this.add.text(W / 2, 760, `Progress: Level ${lvl}/${MAX_LEVEL}`, {
      fontFamily: 'Inter', fontSize: '36px', fontStyle: '800', color: '#fff', stroke: '#222', strokeThickness: 6,
    }).setOrigin(0.5);
    this.add.text(W / 2, 810, `Coins: ${store.coins}  🪙`, {
      fontFamily: 'Inter', fontSize: '32px', fontStyle: '800', color: '#ffe56b', stroke: '#222', strokeThickness: 6,
    }).setOrigin(0.5);
    makeButton(this, W / 2, 890, lvl > 1 ? 'CONTINUE' : 'PLAY', 0x3cb04a, () => this.startGame(lvl), 360);
    makeButton(this, W / 2, 990, 'BALL SHOP', 0x386fd1, () => this.openShop(), 320, '34px');
    makeButton(this, W / 2, 1090, 'ACHIEVEMENTS', 0x9b59b6, () => this.openAchievements(), 360, '31px');
    makeButton(this, W / 2, 1190, 'RESET', 0xd04848, () => this.confirmReset(), 240);
    soundToggle(this, W - 90, 90);

    const playMusic = () => {
      if (!this.music) {
        this.music = this.sound.add('music', { loop: true, volume: 0.5 });
        this.music.play();
      }
    };
    if (this.sound.locked) {
      this.sound.once('unlocked', playMusic);
    } else {
      playMusic();
    }
  }

  confirmReset() {
    if (this.resetDialog) return;
    const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.72)
      .setDepth(60).setInteractive();
    const panel = this.add.rectangle(W / 2, 640, 660, 420, 0x29283d, 0.98)
      .setStrokeStyle(6, 0xffd34b).setDepth(61);
    const title = this.add.text(W / 2, 500, 'RESET PROGRESS?', {
      fontFamily: 'Orbitron', fontSize: '40px', fontStyle: '700', color: '#ffe23d',
      stroke: '#171722', strokeThickness: 8,
    }).setOrigin(0.5).setDepth(62);
    const message = this.add.text(W / 2, 605,
      'Delete saved level progress and return to Level 1?\nCoins and owned skins will be kept.\nCleared levels will not pay coins again.', {
        fontFamily: 'Inter', fontSize: '23px', fontStyle: '700', color: '#fff',
        stroke: '#171722', strokeThickness: 4, align: 'center', lineSpacing: 8,
      }).setOrigin(0.5).setDepth(62);
    const confirm = makeButton(this, 205, 755, 'YES, RESET', 0xd04848, () => {
      this.closeResetDialog();
      store.level = 1;
      this.scene.restart();
    }, 260, '27px').setDepth(70);
    const cancel = makeButton(this, 515, 755, 'CANCEL', 0x555577, () => this.closeResetDialog(), 260, '28px')
      .setDepth(70);
    this.resetDialog = [overlay, panel, title, message, confirm, cancel];
  }

  closeResetDialog() {
    if (!this.resetDialog) return;
    this.resetDialog.forEach((object) => object.destroy());
    this.resetDialog = null;
  }

  openAchievements() {
    if (this.achievementsDialog) return;
    checkAchievements(this);
    const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.78)
      .setDepth(60).setInteractive();
    const panel = this.add.rectangle(W / 2, 640, 680, 1010, 0x29283d, 0.99)
      .setStrokeStyle(6, 0xffd34b).setDepth(61);
    const title = this.add.text(W / 2, 205, 'ACHIEVEMENTS', {
      fontFamily: 'Orbitron', fontSize: '42px', fontStyle: '700', color: '#ffe23d',
      stroke: '#171722', strokeThickness: 8,
    }).setOrigin(0.5).setDepth(62);
    const subtitle = this.add.text(W / 2, 260, `EARN COINS · BALANCE: ${store.coins} 🪙`, {
      fontFamily: 'Inter', fontSize: '24px', fontStyle: '800', color: '#fff',
      stroke: '#171722', strokeThickness: 5,
    }).setOrigin(0.5).setDepth(62);
    const items = [overlay, panel, title, subtitle];

    ACHIEVEMENTS.forEach((achievement, index) => {
      const y = 340 + index * 105;
      const unlocked = store.achievements.includes(achievement.id);
      const row = this.add.rectangle(W / 2, y, 630, 90, unlocked ? 0x315b3b : 0x414157, 0.98)
        .setStrokeStyle(3, unlocked ? 0x8dff91 : 0x8888a5).setDepth(62);
      const name = this.add.text(72, y - 19, `${unlocked ? '★ ' : ''}${achievement.name}`, {
        fontFamily: 'Inter', fontSize: '27px', fontStyle: '800', color: unlocked ? '#aaffad' : '#fff',
        stroke: '#20202a', strokeThickness: 3,
      }).setOrigin(0, 0.5).setDepth(63);
      const description = this.add.text(72, y + 19, achievement.description, {
        fontFamily: 'Inter', fontSize: '20px', fontStyle: '600', color: '#e4e4f2',
      }).setOrigin(0, 0.5).setDepth(63);
      const progress = Math.min(achievement.target, achievementProgress(achievement.id));
      const status = this.add.text(645, y - 15, unlocked ? 'DONE ✓' : `${progress}/${achievement.target}`, {
        fontFamily: 'Inter', fontSize: '19px', fontStyle: '800', color: unlocked ? '#aaffad' : '#ffe56b',
      }).setOrigin(1, 0.5).setDepth(63);
      const reward = this.add.text(645, y + 19, `+${achievement.reward} 🪙`, {
        fontFamily: 'Inter', fontSize: '18px', fontStyle: '800', color: '#ffe56b',
      }).setOrigin(1, 0.5).setDepth(63);
      items.push(row, name, description, status, reward);
    });

    const close = makeButton(this, W / 2, 1040, 'BACK', 0x555577, () => this.closeAchievements(), 320, '32px')
      .setDepth(70);
    items.push(close);
    this.achievementsDialog = items;
  }

  closeAchievements() {
    if (!this.achievementsDialog) return;
    this.achievementsDialog.forEach((object) => object.destroy());
    this.achievementsDialog = null;
  }

  openShop() {
    this.sound.stopByKey('music');
    this.scene.start('shop');
  }

  startGame(level) {
    this.sound.stopByKey('music');
    this.scene.start('game', { level });
  }
}

class ShopScene extends Phaser.Scene {
  constructor() { super('shop'); }

  create() {
    checkAchievements(this);
    ensureBallSkinTextures(this);
    drawBackground(this, THEMES[0], 1110);
    this.add.text(W / 2, 88, 'BALL SKIN SHOP', {
      fontFamily: 'Orbitron', fontSize: '44px', fontStyle: '700', color: '#ffe23d',
      stroke: '#222', strokeThickness: 10,
    }).setOrigin(0.5);
    this.balanceText = this.add.text(W / 2, 158, `YOUR COINS: ${store.coins}  🪙`, {
      fontFamily: 'Inter', fontSize: '32px', fontStyle: '800', color: '#fff',
      stroke: '#222', strokeThickness: 6,
    }).setOrigin(0.5);
    this.statusText = this.add.text(W / 2, 1080, '', {
      fontFamily: 'Inter', fontSize: '25px', fontStyle: '800', color: '#fff',
      stroke: '#222', strokeThickness: 5,
    }).setOrigin(0.5);

    SKINS.forEach((skin, index) => {
      const y = 255 + index * 145;
      this.add.rectangle(W / 2, y, 650, 122, 0xffffff, 0.82)
        .setStrokeStyle(5, 0x222222).setDepth(3);
      this.add.image(95, y, ballTextureFor(skin.id)).setDisplaySize(82, 82).setDepth(5);
      this.add.text(160, y - 22, skin.name, {
        fontFamily: 'Inter', fontSize: '32px', fontStyle: '800', color: '#20202a',
      }).setOrigin(0, 0.5).setDepth(6);

      let detail;
      if (skin.id === 'yellow') detail = 'Classic skin · FREE';
      else if (skin.id === 'gold') detail = 'Clear all 50 levels to unlock';
      else detail = `Price: ${skin.cost} coins`;
      this.add.text(160, y + 22, detail, {
        fontFamily: 'Inter', fontSize: '22px', fontStyle: '600', color: '#353545',
      }).setOrigin(0, 0.5).setDepth(6);

      const owned = store.isOwned(skin.id);
      const equipped = store.equipped === skin.id;
      let label;
      let color;
      if (equipped) {
        label = 'EQUIPPED';
        color = 0x319951;
      } else if (owned) {
        label = 'EQUIP';
        color = 0x386fd1;
      } else if (skin.id === 'gold') {
        label = 'LOCKED';
        color = 0x777777;
      } else if (store.coins >= skin.cost) {
        label = `BUY · ${skin.cost}`;
        color = 0x3cb04a;
      } else {
        label = `NEED ${skin.cost}`;
        color = 0x9b7040;
      }
      makeButton(this, 545, y, label, color, () => this.selectSkin(skin), 220, '24px');
    });

    makeButton(this, W / 2, 1170, 'BACK TO MENU', 0x555577, () => this.scene.start('menu'), 360, '32px');
    soundToggle(this, W - 80, 55);
  }

  selectSkin(skin) {
    if (store.isOwned(skin.id)) {
      store.equipped = skin.id;
      this.scene.restart();
      return;
    }
    if (skin.id === 'gold') {
      this.statusText.setText('Complete all 50 levels to unlock Gold!');
      return;
    }
    if (store.coins < skin.cost) {
      this.statusText.setText(`You need ${skin.cost - store.coins} more coins for ${skin.name}.`);
      return;
    }
    store.coins -= skin.cost;
    store.owned = [...store.owned, skin.id];
    store.equipped = skin.id;
    checkAchievements();
    this.scene.restart();
  }
}

class GameScene extends Phaser.Scene {
  constructor() { super('game'); }

  init(data) {
    this.level = data.level;
    this.phase = 'draw';
    this.timeLeft = DRAW_TIME;
    this.ink = INK_MAX;
    this.strokes = [];
    this.bees = [];
    this.current = null;
  }

  create() {
    checkAchievements(this);
    ensureBallSkinTextures(this);
    const groundY = 1080;
    this.theme = THEMES[Math.floor((this.level - 1) / 5) % 10];
    drawBackground(this, this.theme, groundY);

    this.hives = [drawHive(this, 88, 430), drawHive(this, W / 2, 320), drawHive(this, W - 88, 430)];
    this.matter.world.engine.positionIterations = 8;
    this.matter.world.engine.velocityIterations = 6;
    this.matter.world.setBounds(0, -400, W, groundY + 400, 60, true, true, false, true);
    this.ball = this.matter.add.image(W / 2, groundY - 70, ballTextureFor(store.equipped), null, {
      shape: { type: 'circle', radius: 60 }, restitution: 0.48, friction: 0.55, frictionAir: 0.01, label: 'ball',
    });
    this.ball.setDisplaySize(120, 120);
    this.ball.setStatic(true);

    this.shieldGfx = this.add.graphics().setDepth(5);
    this.previewGfx = this.add.graphics().setDepth(6);

    const txt = (x, y, size) => this.add.text(x, y, '', {
      fontFamily: 'Inter', fontSize: size, fontStyle: '800', color: '#fff', stroke: '#222', strokeThickness: 7,
    }).setOrigin(0.5).setDepth(40);
    this.levelText = txt(W / 2, 90, '40px').setText(`Level ${this.level}/${MAX_LEVEL} · ${this.theme.name}`);
    this.timerText = txt(W / 2, 160, '48px');
    this.inkBar = this.add.graphics().setDepth(40);
    this.hint = txt(W / 2, 400, '34px').setText('Draw a shield around the ball!');

    makeButton(this, 90, 90, '↻', 0xe08a2a, () => this.scene.restart({ level: this.level }), 100);
    makeButton(this, 90, 210, '☰', 0x555577, () => this.scene.start('menu'), 100);
    soundToggle(this, W - 90, 90);
    this.readyBtn = makeButton(this, W / 2, 1190, 'READY', 0x3cb04a, () => this.startAttack(), 320);

    this.input.on('pointerdown', (p) => this.beginStroke(p));
    this.input.on('pointermove', (p) => this.extendStroke(p));
    this.input.on('pointerup', () => this.endStroke());
    this.input.on('pointerupoutside', () => this.endStroke());

    this.matter.world.on('collisionstart', (ev) => {
      ev.pairs.forEach(({ bodyA, bodyB }) => {
        const labels = [bodyA.label, bodyB.label, bodyA.parent.label, bodyB.parent.label];
        if (labels.includes('ball') && labels.includes('bee')) {
          this.endLevel(false);
        }
      });
    });

    this.timerEvent = this.time.addEvent({ delay: 1000, loop: true, callback: () => this.tick() });
    this.updateTimerText();
  }

  beginStroke(p) {
    if (this.phase !== 'draw' || this.ink <= 0 || p.y > 1130) return;
    this.hint.setVisible(false);
    this.current = [{ x: p.x, y: p.y }];
  }

  extendStroke(p) {
    if (!this.current || !p.isDown) return;
    const last = this.current[this.current.length - 1];
    const d = Phaser.Math.Distance.Between(last.x, last.y, p.x, p.y);
    if (d < 12 || this.ink <= 0) return;
    // Avoid drawing through the ball
    if (Phaser.Math.Distance.Between(p.x, p.y, this.ball.x, this.ball.y) < 78) return;
    this.current.push({ x: p.x, y: p.y });
    this.ink -= d;
    this.drawPreview();
  }

  drawPreview() {
    const g = this.previewGfx;
    g.clear();
    if (!this.current) return;
    g.lineStyle(16, 0x222222, 1);
    g.strokePoints(this.current, false);
    g.lineStyle(10, 0x8a5a2b, 1);
    g.strokePoints(this.current, false);
  }

  endStroke() {
    const pts = this.current;
    this.current = null;
    this.previewGfx.clear();
    if (!pts || pts.length < 2) return;
    const parts = [];
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1];
      const b = pts[i];
      const len = Phaser.Math.Distance.Between(a.x, a.y, b.x, b.y);
      const ang = Math.atan2(b.y - a.y, b.x - a.x);
      const rect = this.matter.bodies.rectangle((a.x + b.x) / 2, (a.y + b.y) / 2, len + 10, 14, { angle: ang });
      parts.push(rect);
    }
    const body = this.matter.body.create({ parts, friction: 0.72, frictionAir: 0.035, restitution: 0.32, label: 'shield' });
    this.matter.world.add(body);
    this.strokes.push(body);
  }

  tick() {
    if (this.phase === 'done') return;
    if (this.phase === 'attack') {
      store.survivedSeconds += 1;
      checkAchievements(this);
    }
    this.timeLeft -= 1;
    if (this.timeLeft <= 0) {
      if (this.phase === 'draw') {
        this.startAttack();
      } else {
        this.endLevel(true);
      }
      return;
    }
    this.updateTimerText();
  }

  updateTimerText() {
    const label = this.phase === 'draw' ? 'Time to draw' : 'Survive';
    this.timerText.setText(`${label}: ${this.timeLeft}`);
  }

  startAttack() {
    if (this.phase !== 'draw') return;
    this.endStroke();
    this.phase = 'attack';
    this.timeLeft = SURVIVE_TIME;
    this.readyBtn.setVisible(false);
    this.hint.setVisible(false);
    this.ball.setStatic(false);
    this.updateTimerText();
    this.timerText.setColor('#ffdd33');

    const count = 2 + this.level;
    this.beeSpeed = 1.7 + Math.min(this.level, 30) * 0.065;
    const spawnInterval = Math.max(260, 650 - this.level * 8);
    for (let i = 0; i < count; i++) {
      this.time.delayedCall(i * spawnInterval, () => this.spawnBee(i));
    }
  }

  spawnBee(index = 0) {
    if (this.phase !== 'attack') return;
    const hive = this.hives[index % this.hives.length];
    const x = hive.x + Phaser.Math.Between(-12, 12);
    const y = hive.y + 22;
    const puff = this.add.circle(x, y, 7, 0xffd36b, 0.75).setDepth(7);
    this.tweens.add({
      targets: puff, scale: 2.6, alpha: 0, duration: 260,
      onComplete: () => puff.destroy(),
    });
    const bee = this.matter.add.image(x, y, 'bee', null, {
      shape: { type: 'circle', radius: 24 }, frictionAir: 0.015, label: 'bee', restitution: 0.85,
    });
    bee.setDisplaySize(64, 64);
    bee.setAlpha(0.25);
    this.tweens.add({ targets: bee, alpha: 1, duration: 180 });
    bee.setIgnoreGravity(true);
    bee.setFixedRotation();
    bee.wobble = Math.random() * 10;
    this.bees.push(bee);
  }

  update(time) {
    if (this.phase === 'attack') {
      this.bees.forEach((bee) => {
        const dx = this.ball.x - bee.x;
        const dy = this.ball.y - bee.y;
        const dist = Math.hypot(dx, dy) || 1;
        const s = this.beeSpeed;
        const wob = Math.sin(time / 150 + bee.wobble) * 0.38;
        const tx = (dx / dist) * s - (dy / dist) * wob;
        const ty = (dy / dist) * s + (dx / dist) * wob;
        const v = bee.body.velocity;
        bee.setVelocity(v.x + (tx - v.x) * 0.075, v.y + (ty - v.y) * 0.075);
        bee.setFlipX(dx > 0);
      });
    }
    this.renderShields();
    this.renderInk();
  }

  renderShields() {
    const g = this.shieldGfx;
    g.clear();
    this.strokes.forEach((body) => {
      const parts = body.parts.length > 1 ? body.parts.slice(1) : body.parts;
      parts.forEach((part) => {
        g.fillStyle(0x222222, 1);
        g.fillPoints(part.vertices, true);
      });
      parts.forEach((part) => {
        g.fillStyle(0x8a5a2b, 1);
        g.fillCircle(part.position.x, part.position.y, 4);
      });
    });
  }

  renderInk() {
    const g = this.inkBar;
    g.clear();
    if (this.phase !== 'draw') return;
    g.fillStyle(0x222222, 1).fillRoundedRect(W / 2 - 160, 205, 320, 26, 12);
    g.fillStyle(0x3cb0ff, 1).fillRoundedRect(W / 2 - 156, 209, 312 * Math.max(0, this.ink / INK_MAX), 18, 9);
  }

  endLevel(won) {
    if (this.phase === 'done') return;
    this.phase = 'done';
    this.timerEvent.remove();
    this.bees.forEach((b) => b.setVelocity(0, 0).setStatic(true));
    this.sound.play(won ? 'win' : 'lose');
    const rewardEarned = won && !store.rewardedLevels.includes(this.level);
    if (won) {
      if (rewardEarned) {
        store.rewardedLevels = [...store.rewardedLevels, this.level];
        store.earnCoins(50);
      }
      store.level = Math.max(store.level, Math.min(MAX_LEVEL, this.level + 1));
      if (this.level >= MAX_LEVEL) store.completed = true;
      checkAchievements(this);
      this.tweens.add({ targets: this.ball, scale: this.ball.scale * 1.2, yoyo: true, duration: 200, repeat: 2 });
    } else {
      this.cameras.main.shake(300, 0.015);
      this.ball.setTint(0xff6666);
    }
    const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.5).setDepth(45);
    overlay.setInteractive();
    const done = won && this.level === MAX_LEVEL;
    const title = done ? 'ALL 50 CLEARED!' : won ? 'BALL SAVED!' : 'STUNG!';
    this.add.text(W / 2, 480, title, {
      fontFamily: 'Orbitron', fontSize: '68px', fontStyle: '700', color: won ? '#7dff6a' : '#ff5a5a',
      stroke: '#222', strokeThickness: 10,
    }).setOrigin(0.5).setDepth(50);
    if (won) {
      this.add.text(W / 2, 555, rewardEarned ? '+50 COINS' : 'LEVEL CLEARED · NO COINS', {
        fontFamily: 'Inter', fontSize: rewardEarned ? '34px' : '27px', fontStyle: '800',
        color: rewardEarned ? '#ffe56b' : '#d9e6ff', stroke: '#222', strokeThickness: 6,
      }).setOrigin(0.5).setDepth(50);
    }
    if (won && !done) {
      makeButton(this, W / 2, 640, 'NEXT LEVEL', 0x3cb04a, () => this.scene.restart({ level: this.level + 1 }), 380);
    }
    makeButton(this, W / 2, won && !done ? 770 : 640, 'RETRY', 0xe08a2a, () => this.scene.restart({ level: this.level }), 380);
    makeButton(this, W / 2, won && !done ? 900 : 770, 'MENU', 0x555577, () => this.scene.start('menu'), 380);
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game-container',
  width: W,
  height: H,
  backgroundColor: '#050505',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  physics: { default: 'matter', matter: { gravity: { y: 0.8 } } },
  scene: [MenuScene, ShopScene, GameScene],
});
