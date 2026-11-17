local M = {}

M.PLAYER_SPEED = 330
M.PLAYER_ENDING_SPEED_BOOST = 70
M.PLAYER_JOYSTICK_DEADZONE = 40
M.PLAYER_IMMUNITY_TIME = 1.8
M.PLAYER_REGEN_TIME = 25

M.ENEMY_ACTIVATION_DELAY = 0.8
M.ENEMY_ACTIVATION_DELAY_HITBOX = 1.5
M.ENEMY_PUSH_FORCE = 200
M.ENEMY_RADIUS = 850

M.LEVEL_DATA = {
    level1 = {
        enemies = {"enemy_1", "enemy_2", "enemy_3", "enemy_4", "enemy_5", "enemy_6", "enemy_7", "enemy_8", "enemy_9", "enemy_10"},
        collectibles = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11},
        doors = {"level2", "level3", "level4", "level5", "level6", "level7", "level8", "level9"}, 
        puzzle_pieces = {1, 2, 5, 8, 10, 12, 15, 16, 20, 22},
    },
    level2 = {
        enemies = {"enemy_11", "enemy_12", "enemy_13", "enemy_14"},
        collectibles = {12, 13, 14, 15},
        doors = {"level1", "level4", "level5"},
        puzzle_pieces = {3, 7, 19},
    },
    level3 = {
        enemies = {"enemy_16"},
        collectibles = {16},
        doors = {"level1", "level5"},
        puzzle_pieces = {14},
    },
    level4 = {
        enemies = {"enemy_15", "enemy_17"},
        collectibles = {17, 18, 19},
        doors = {"level1", "level2", "level7"},
        puzzle_pieces = {13, 17, 23},
    },
    level5 = {
        enemies = {"enemy_18", "enemy_19", "enemy_20"},
        collectibles = {20, 21, 22, 23},
        doors = {"level1", "level2", "level3"},
        puzzle_pieces = {11, 18, 24},
    },
    level6 = {
        enemies = {"enemy_21", "enemy_22"},
        collectibles = {24, 25, 26},
        doors = {"level1", "level7", "level8"},
        puzzle_pieces = {6, 21},
    },
    level7 = {
        enemies = {"enemy_23", "enemy_24", "enemy_25"},
        collectibles = {27, 28, 29, 30},
        doors = {"level1", "level4", "level6"},
        puzzle_pieces = {4, 9},
    },
    level8 = {
        enemies = {"enemy_26"},
        collectibles = {31, 32},
        doors = {"level1", "level6"},
        puzzle_pieces = {25},
    },
    level9 = {
        enemies = {"enemy_27", "enemy_28", "enemy_29", "enemy_30"},
        collectibles = {33, 34, 35, 36, 37},
        doors = {"level1"},
        puzzle_pieces = {},
    },
}
M.N_PUZZLE_PIECES = 25

M.TRAP_MENU_CAPTURE_TIME = 5

M.TURBO_SPEED = 400
M.TURBO_DURATION = 10

M.TILE_SIZE = {64, 128}

M.MINIMAP_MAX_SIZE = 300
M.MINIMAP_TILE_SIZE = {5, 10}

M.Z_INDEX_BACKGROUND = -2
M.Z_INDEX_FLOOR = -1
M.Z_INDEX_DECORS_BEHIND_WALL = -0.6
M.Z_INDEX_WALLS = -0.5
M.Z_INDEX_DECORS_ABOVE_WALL = -0.3
M.Z_INDEX_ENEMIES_DOWN = -0.1
M.Z_INDEX_PLAYER = 0.0
M.Z_INDEX_ENEMIES_UP = 0.1
M.Z_INDEX_DECORS_ABOVE_PLAYER = 0.5
M.Z_INDEX_MINIMAP = 5.0

M.GUI_RENDER_ORDER_LEVEL = 0
M.GUI_RENDER_ORDER_GUI = 1

M.SAVE_DEFAULT_DATA = {
    version = sys.get_config_string("project.version"),
    loaded_games = 0,
    tutorial_finished = false,
    resources_loaded = false,

    opened_map = false,
    album_unlocked = false,

    entered_level1 = false,
    entered_level2 = false,
    entered_level3 = false,
    entered_level4 = false,
    entered_level5 = false,
    entered_level6 = false,
    entered_level7 = false,
    entered_level8 = false,
    entered_level9 = false,

    end_game_unlocked = false,
    end_1 = false,
    end_2 = false,

    level1_ghosts_found = {},
    level1_objects_found = {},

    level2_ghosts_found = {},
    level2_objects_found = {},

    level3_ghosts_found = {},
    level3_objects_found = {},

    level4_ghosts_found = {},
    level4_objects_found = {},

    level5_ghosts_found = {},
    level5_objects_found = {},

    level6_ghosts_found = {},
    level6_objects_found = {},

    level7_ghosts_found = {},
    level7_objects_found = {},

    level8_ghosts_found = {},
    level8_objects_found = {},

    level9_ghosts_found = {},
    level9_objects_found = {},

    puzzle_found = {},
}
M.SAVE_FILENAME = "HauntedHouse"
M.SAVE_FORCE_DELETE = false
M.RESOURCES_FORCE_DELETE = false

M.LOADING_SCREEN_TIME = 0.2

return M