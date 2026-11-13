// Sir Falls-A-Lot: Castle Climber. Gameplay tuning (tower size, physics, scoring, difficulty curve).
export const CONFIG = {
    // Tower geometry (world units)
    TOWER_RADIUS: 3.6,
    LEDGE_DEPTH: 1.6,
    PATH_RADIUS: 4.4,          // where the knight and ledge enemies walk
    TOWER_BASE_HEIGHT: 46,     // level 1 tower height
    TOWER_LEVEL_HEIGHT: 9,     // extra height per level
    TOWER_MAX_HEIGHT: 110,
    FIRST_TOWER_SEED: 1462,    // tower 1 is always this layout (early chest, secret passage, dragon)

    // Knight physics
    GRAVITY: 30,
    FALL_GRAVITY: 40,
    PLAYER_SPEED: 5.0,
    PLAYER_ACCEL: 42,
    AIR_ACCEL: 30,
    JUMP_VELOCITY: 11.4,
    JUMP_CUT: 0.55,
    MAX_FALL: 24,
    COYOTE: 0.11,
    JUMP_BUFFER: 0.15,
    PLAYER_HALF_W: 0.3,
    PLAYER_HEIGHT: 1.45,
    ATTACK_TIME: 0.34,
    ATTACK_COOLDOWN: 0.12,
    ATTACK_RANGE: 1.75,
    INVULN_TIME: 1.4,
    MAX_HP: 3,
    START_LIVES: 3,

    // Lava + greed
    LAVA_START_Y: -3.2,
    LAVA_BASE_SPEED: 0.34,
    LAVA_LEVEL_SPEED: 0.06,
    GREED_LAVA_MULT: 0.0065,
    MAX_LAVA_SPEED: 2.3,
    TIME_STOP_SECONDS: 4,

    // Scoring
    SCORE_COIN: 100,
    SCORE_KEY: 500,
    SCORE_TREASURE: 1000,
    SCORE_HOURGLASS: 200,
    SCORE_KILL: 150,
    SCORE_FIREBALL: 50,
    LEVEL_BONUS: 2000,
    GREED_COIN: 2,
    GREED_KEY: 10,
    GREED_TREASURE: 25,

    // Rendering
    FOV: 55,
    MAX_TORCH_LIGHTS: 5,

    // Difficulty curve: every value slides from EASY (tower 1) to HARD (tower RAMP_LEVELS + 1).
    // Features switch on from the tower number given in *_FROM.
    DIFFICULTY: {
        RAMP_LEVELS: 8,
        EASY: {
            height: 34, dyMin: 0.95, dyMax: 1.35, gapMax: 1.0, widthMin: 2.9, widthMax: 4.3,
            crumbleChance: 0.05, crumbleDelay: 1.3, liftChance: 0.05, flipChance: 0.12,
            ledgeEnemy: 0.09, spiderChance: 0.05, bats: 1, fireEvery: 7, fireSpeed: 6.0,
            lavaSpeed: 0.2, greedLava: 0.0028, enemySpeed: 0.75
        },
        HARD: {
            height: 90, dyMin: 1.2, dyMax: 1.8, gapMax: 2.0, widthMin: 2.0, widthMax: 3.2,
            crumbleChance: 0.2, crumbleDelay: 0.55, liftChance: 0.12, flipChance: 0.24,
            ledgeEnemy: 0.32, spiderChance: 0.13, bats: 7, fireEvery: 3, fireSpeed: 9.5,
            lavaSpeed: 0.55, greedLava: 0.0068, enemySpeed: 1.25
        },
        CRUMBLE_FROM: 2,
        LIFT_FROM: 2,
        SPIDER_FROM: 3,
        DRAGON_FIRE_FROM: 2
    }
};