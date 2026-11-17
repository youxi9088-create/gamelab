local M = {}

M.enemies_init_pos = {}
M.enemies_chasing = {}

M.map_init_x = 0
M.map_init_y = 0

M.ending_boost = 0

M.player_lives = 3
M.player_captured_enemies = 0
M.player_speed = 0

M.player_regenerating = false
M.player_regen_time_left = 0

M.lock_input = false
M.lock_update = false


M.end_game_unlocked = false
M.tutorial_finished = false
M.opened_map = false
M.album_unlocked = false

M.load_end = false


M.level_str = ""
M.prev_level_str = ""
M.first_load = true
M.first_input_received = false
M.resources_loaded = false
M.sounds_loaded = false
M.sound_on = true
M.music_on = true
M.debugger_hidden = true
M.gui_hidden = false


function M.game_reset()
	M.ending_boost = 0

	M.prev_level_str = ""

	M.end_game_unlocked = false
	M.tutorial_finished = false
	M.opened_map = false
	M.album_unlocked = false

	M.load_end = false

	M.player_lives = 3
	M.player_regenerating = false
	M.player_regen_time_left = 0

	M.level_reset()
end

function M.level_reset()
	M.enemies_init_pos = {}
	M.enemies_chasing = {}

	M.debugger_hidden = true

	M.player_captured_enemies = 0
	M.player_speed = 0

	M.lock_input = false
	M.lock_update = false
end

return M
