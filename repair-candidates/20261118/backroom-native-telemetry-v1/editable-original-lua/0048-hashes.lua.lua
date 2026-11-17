local M = {}


M.CLICK = hash("click")
M.TOUCH = hash("touch")
M.TRANSLATE = hash("translate")


M.TRIGGER_RESPONSE = hash("trigger_response")
M.CONTACT_POINT_RESPONSE = hash("contact_point_response")
M.DISABLE = hash("disable")
M.ENABLE = hash("enable")
M.RELEASE_INPUT_FOCUS = hash("release_input_focus")
M.ACQUIRE_INPUT_FOCUS = hash("acquire_input_focus")
M.LAYOUT_CHANGED = hash("layout_changed")
M.WINDOWS_RESIZED = hash("_windows_resized")


M.INIT = hash("init")
M.LOAD = hash("load")
M.UNLOAD = hash("unload")
M.LOAD_LEVEL = hash("load_level")
M.LOAD_LEVEL_SELECTOR = hash("load_level_selector")
M.PROXY_LOADED = hash("proxy_loaded")
M.PROXY_UNLOADED = hash("proxy_unloaded")


M.SOUNDS = hash("/sound_controller")
M.LEVEL_SELECTOR = hash("/level_selector")
M.UPDATE_GUI = hash("update_gui")
M.LEVEL_COMPLETE = hash("level_complete")
M.SET_TIME_STEP = hash("set_time_step")


M.PLAY_SOUND = hash("_play_sound")
M.SOUND_DONE = hash("sound_done")
M.STOP_SOUND = hash("_stop_sound")
M.STOP_GROUP = hash("_stop_group")
M.SET_GROUP_GAIN = hash("_set_group_gain")
M.SET_SOUND_GAIN = hash("_set_sound_gain")
M.MUTE_GROUP = hash("mute_group")
M.UNMUTE_GROUP = hash("unmute_group")
M.MUTE_ALL = hash("mute_all")
M.UNMUTE_ALL = hash("unmute_all")


M.SHOW_LEVEL_SELECTOR = hash("show_level_selector")
M.HIDE_LEVEL_SELECTOR = hash("hide_level_selector")
M.SHOW_MENU = hash("show_menu")
M.HIDE_MENU = hash("hide_menu")
M.FADE_IN = hash("fade_in")
M.FADE_OUT = hash("fade_out")




M.WALL = hash("wall")
M.OBJECT = hash("object")
M.PLAYER_PHYSICS = hash("player_physics")
M.PLAYER_HURTBOX = hash("player_hurtbox")
M.PLAYER_EXTRA = hash("player_extra")
M.ENEMY = hash("enemy")
M.GRABBABLE = hash("grabbable")


M.PLAYER_UP = hash("player_up")
M.PLAYER_DOWN = hash("player_down")
M.PLAYER_LEFT = hash("player_left")
M.PLAYER_RIGHT = hash("player_right")
M.PLAYER_SHOOT = hash("player_shoot")


M.TUTORIAL_DISABLE = hash("tutorial_disable")
M.TUTORIAL_START = hash("tutorial_start")
M.TUTORIAL_END = hash("tutorial_end")
M.TUTORIAL_PLAYER_DIED = hash("tutorial_player_died")
M.TUTORIAL_PLAYER_REVIVED = hash("tutorial_player_revived")
M.TUTORIAL_ENEMY_FLASHED = hash("tutorial_enemy_flashed")
M.TUTORIAL_ENEMY_KILLED = hash("tutorial_enemy_killed")
M.TUTORIAL_OBJECT_FOUND = hash("tutorial_object_found")

M.ALBUM_UNLOCKED = hash("album_unlocked")

M.ENEMY_SPOTTED = hash("enemy_spotted")
M.ENEMY_UNSPOTTED = hash("enemy_unspotted")
M.ACTIVATE = hash("activate")
M.DEACTIVATE = hash("deactivate")
M.ENEMY_KILLED = hash("enemy_killed")
M.ENABLE_ARROW = hash("enable_arrow")
M.DISABLE_ARROW = hash("disable_arrow")
M.UNLOCK_DOOR = hash("unlock_door")
M.ENEMY_PUSH = hash("enemy_push")
M.ENEMY_RESTORE = hash("enemy_restore")
M.ENEMY_AD_CAPTURE = hash("enemy_ad_capture")
M.CONVERT_TO_GHOST = hash("convert_to_ghost")
M.CONVERT_TO_HUMAN = hash("convert_to_human")
M.PICTURE_MENU = hash("picture_menu")
M.UPDATE_LEVEL_ZONE = hash("update_level_zone")
M.TELEPORT_TO_PORTAL = hash("teleport_to_portal")
M.ACTIVATE_ASTAR = hash("activate_astar")
M.DEACTIVATE_ASTAR = hash("deactivate_astar")
M.DEBUGGER = hash("debugger")
M.PLAYER_APPEAR = hash("player_appear")
M.PLAYER_DISAPPEAR = hash("player_disappear")
M.DELETE_ARROWS = hash("delete_arrows")
M.PLAYER_KILLED = hash("player_killed")
M.PLAYER_IMMUNITY = hash("player_immunity")

M.TURBO = hash("turbo")
M.SHOW_MINIMAP = hash("show_minimap")
M.HIDE_MINIMAP = hash("hide_minimap")
M.ALBUM_HIGHLIGHT = hash("album_highlight")
M.DEBUG_FLY = hash("debug_fly")
M.PLAYER_HURT = hash("player_hurt")
M.HEAL_FULL = hash("heal_full")
M.CHECK_END = hash("check_end")
M.GAME_END = hash("game_end")
M.HIDE_GUI = hash("hide_gui")

M.LANGUAGE = hash("language")

return M