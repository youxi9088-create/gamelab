local lib = require "game.globals.library_manager"

local load_save_game, window_resized
local setup_controls, remove_controls, controls_loop, setup_astar, show_optimal_way, hide_optimal_way
local check_end, check_room_complete, unlock_end, mark_end_unlocked
local setup_halloween

function init(self)
	msg.post(".", lib.HASHES.ACQUIRE_INPUT_FOCUS)

	lib.LM.lock_input = false
	lib.LM.lock_update = false

	self.controls_removed = false
	self.own_level_str = lib.LM.level_str

	self.walls = msg.url("/walls")
	self.floors = msg.url("/floors")

	self.init_x = 0
	self.init_y = 0
	self.map_width = 0
	self.map_height = 0

	lib.CONFIG.set_Z_index(self.floors, lib.PARAMS.Z_INDEX_FLOOR)
	lib.CONFIG.set_Z_index(self.walls, lib.PARAMS.Z_INDEX_WALLS)

	lib.CONFIG.set_Z_index(msg.url("/decors_behind_wall"), lib.PARAMS.Z_INDEX_DECORS_BEHIND_WALL)
	lib.CONFIG.set_Z_index(msg.url("/decors_above_wall"), lib.PARAMS.Z_INDEX_DECORS_ABOVE_WALL)
	lib.CONFIG.set_Z_index(msg.url("/decors_above_player"), lib.PARAMS.Z_INDEX_DECORS_ABOVE_PLAYER)
	for _, level in pairs({ "level1", "level2", "level3", "level4", "level5", "level6", "level7", "level8"}) do
		if go.exists("/exit_" .. level) then
			lib.CONFIG.set_Z_index(msg.url("/exit_" .. level), lib.PARAMS.Z_INDEX_DECORS_ABOVE_WALL)
		end
	end

	if lib.LM.level_str == "pretutorial" then
		msg.post(".", lib.HASHES.ACQUIRE_INPUT_FOCUS)
		setup_controls(self)
	end

	if lib.LM.level_str ~= "pretutorial" then
		load_save_game(self)
	end

	if lib.LM.prev_level_str == "" or lib.LM.prev_level_str == "pretutorial" then
		local spawn = go.get_position("exit_" .. lib.LM.level_str) + go.get_position("player_spawn_" .. lib.LM.level_str)
		spawn.z = lib.PARAMS.Z_INDEX_PLAYER
		go.set_position(spawn, "/player/player")
	else
		local spawn = go.get_position("exit_" .. lib.LM.prev_level_str) + go.get_position("player_spawn_" .. lib.LM.prev_level_str)
		spawn.z = lib.PARAMS.Z_INDEX_PLAYER
		go.set_position(spawn, "/player/player")
	end

	msg.post("/camera", hash("follow"), { target = "/player/player", lerp = 0.15 })

	if lib.LM.level_str ~= "pretutorial" then
		msg.post("/minimap/script", lib.HASHES.HIDE_MINIMAP, { from_init = true })
	end

	msg.post("/gui#gui", lib.HASHES.UPDATE_GUI)

	if not lib.SDK.is_debug and go.exists("/debugger") then
		go.delete("/debugger")
	end

	if lib.LM.level_str ~= "pretutorial" and lib.SDK.save_get_bool("entered_" .. lib.LM.level_str) == false then
		lib.SDK.poki_measure("enter_level", lib.LM.level_str, "custom")
		lib.SDK.save_set_bool("entered_" .. lib.LM.level_str, true)
	end

	if lib.LM.level_str == "level1" then
		setup_halloween(self)

		msg.post("/exit_level_end", lib.HASHES.DISABLE)
		if lib.LM.load_end or (not lib.LM.end_game_unlocked and check_end(self)) then
			timer.delay(0.2, false, function()
				lib.LM.lock_update = true
				lib.LM.lock_input = true
			end)

			lib.LM.load_end = false
			mark_end_unlocked(self)
			unlock_end(self)
		elseif lib.LM.end_game_unlocked then
			msg.post("/exit_level_end", lib.HASHES.ENABLE)
			msg.post("/exit_level_end#boom", lib.HASHES.DISABLE)
		end
	end

	window_resized(self)
	setup_astar(self)
end

function on_input(self, action_id, action)
	if (lib.SDK.is_action_click_or_touch(action_id) or
		action_id == lib.HASHES.PLAYER_UP or
		action_id == lib.HASHES.PLAYER_DOWN or
		action_id == lib.HASHES.PLAYER_LEFT or
		action_id == lib.HASHES.PLAYER_RIGHT)
		and action.pressed and self.own_level_str == "pretutorial" and not self.controls_removed then
		self.controls_removed = true
		remove_controls(self)
	end

	if action_id == lib.HASHES.DEBUGGER and action.pressed and lib.LM.debugger_hidden and lib.SDK.is_debug then
		msg.post("/debugger", lib.HASHES.SHOW_MENU)
	elseif action_id == lib.HASHES.DEBUGGER and action.pressed and not lib.LM.debugger_hidden and lib.SDK.is_debug then
		msg.post("/debugger", lib.HASHES.HIDE_MENU)
	end

	if action_id == lib.HASHES.HIDE_GUI and action.pressed and lib.LM.gui_hidden and lib.SDK.is_debug then
		lib.LM.gui_hidden = false
		msg.post("/gui", lib.HASHES.HIDE_GUI)
	elseif action_id == lib.HASHES.HIDE_GUI and action.pressed and not lib.LM.gui_hidden and lib.SDK.is_debug then
		lib.LM.gui_hidden = true
		msg.post("/gui", lib.HASHES.HIDE_GUI)
	end
end

function on_message(self, message_id, message, sender)
	if message_id == lib.HASHES.WINDOWS_RESIZED then
		window_resized(self)
	end

	if message_id == lib.HASHES.ACTIVATE_ASTAR then
		show_optimal_way(self)
	end

	if message_id == lib.HASHES.DEACTIVATE_ASTAR then
		hide_optimal_way(self)
	end

	if message_id == lib.HASHES.CHECK_END then
		if check_end(self) then
			lib.LM.lock_update = true
			lib.LM.lock_input = true

			mark_end_unlocked(self)

			if lib.LM.level_str == "level1" then
				unlock_end(self)
			else
				lib.LM.load_end = true
				lib.LM.prev_level_str = ""
				timer.delay(0.5, false, function()
					msg.post("game_controller:/script#game_controller", lib.HASHES.LOAD_LEVEL, { level = "level1" })
				end)
			end
		elseif check_room_complete(self) then
			msg.post("/room_complete", lib.HASHES.SHOW_MENU)
		end
	end
end

function load_save_game(self)
	for _, enemy in pairs(lib.PARAMS.LEVEL_DATA[lib.LM.level_str].enemies) do
		lib.LM.enemies_init_pos[enemy] = go.get_position(enemy)
	end

	local ghosts_found = lib.SDK.save_get_array_string(lib.LM.level_str .. "_ghosts_found") or {}
	if ghosts_found then
		for _, ghost_name in pairs(ghosts_found) do
			go.delete(msg.url(ghost_name))
		end
	end

	local objects_found = lib.SDK.save_get_array_number(lib.LM.level_str .. "_objects_found") or {}
	if objects_found then
		for _, collectible_idx in pairs(objects_found) do
			go.delete(msg.url("/collectible_" .. collectible_idx))
		end
	end

	local puzzle_found = lib.SDK.save_get_array_number("puzzle_found") or {}
	if puzzle_found then
		for _, puzzle_idx in pairs(puzzle_found) do
			if go.exists("/puzzle_" .. puzzle_idx) then
				go.delete(msg.url("/puzzle_" .. puzzle_idx))
			end
		end
	end

	lib.LM.opened_map = lib.SDK.save_get_bool("opened_map") or false
	lib.LM.album_unlocked = lib.SDK.save_get_bool("album_unlocked") or false
	lib.LM.player_captured_enemies = #ghosts_found
	lib.LM.end_game_unlocked = lib.SDK.save_get_bool("end_game_unlocked") or false

	if lib.SDK.save_get_bool("end_1") or  lib.SDK.save_get_bool("end_2") then
		lib.LM.ending_boost = lib.PARAMS.PLAYER_ENDING_SPEED_BOOST
		lib.LM.player_speed = lib.PARAMS.PLAYER_SPEED + lib.LM.ending_boost
	else
		lib.LM.ending_boost = 0
		lib.LM.player_speed = lib.PARAMS.PLAYER_SPEED + lib.LM.ending_boost
	end
end

function setup_controls(self)
	go.animate("/circle_int", "position.y", go.PLAYBACK_LOOP_PINGPONG, 950.0, go.EASING_LINEAR, 2.)

	if lib.SDK.get_device() ~= "desktop" then
		msg.post("/keys", lib.HASHES.DISABLE)
		msg.post("/keys_arrows", lib.HASHES.DISABLE)
		msg.post("/keys_french", lib.HASHES.DISABLE)
	else
		self.controls_step = 1
		controls_loop(self)
		self.controls_timer = timer.delay(1.0, true, function()
			controls_loop(self)
		end)
	end
end

function controls_loop(self)
	if self.controls_step == 1 then
		msg.post("/keys", lib.HASHES.ENABLE)
		msg.post("/keys_arrows", lib.HASHES.DISABLE)
		msg.post("/keys_french", lib.HASHES.DISABLE)
		self.controls_step = 2
	elseif self.controls_step == 2 then
		msg.post("/keys", lib.HASHES.DISABLE)
		msg.post("/keys_arrows", lib.HASHES.ENABLE)
		msg.post("/keys_french", lib.HASHES.DISABLE)
		self.controls_step = 3
	else
		msg.post("/keys", lib.HASHES.DISABLE)
		msg.post("/keys_arrows", lib.HASHES.DISABLE)
		msg.post("/keys_french", lib.HASHES.ENABLE)
		self.controls_step = 1
	end
end

function remove_controls(self)
	if self.controls_timer then
		timer.cancel(self.controls_timer)
		self.controls_timer = nil
	end

	go.animate("/keys#sprite", "tint.w", go.PLAYBACK_ONCE_FORWARD, 0, go.EASING_LINEAR, 1.)
	go.animate("/keys_arrows#sprite", "tint.w", go.PLAYBACK_ONCE_FORWARD, 0, go.EASING_LINEAR, 1.)
	go.animate("/keys_french#sprite", "tint.w", go.PLAYBACK_ONCE_FORWARD, 0, go.EASING_LINEAR, 1.)
	go.animate("/circle_ext#sprite", "tint.w", go.PLAYBACK_ONCE_FORWARD, 0, go.EASING_LINEAR, 1.)
	go.animate("/circle_int#sprite", "tint.w", go.PLAYBACK_ONCE_FORWARD, 0, go.EASING_LINEAR, 1., 0, function()
		msg.post("/keys", lib.HASHES.DISABLE)
		msg.post("/keys_arrows", lib.HASHES.DISABLE)
		msg.post("/keys_french", lib.HASHES.DISABLE)
		msg.post("/circle_int", lib.HASHES.DISABLE)
		msg.post("/circle_ext", lib.HASHES.DISABLE)
	end)
end

function window_resized(self)
	local screen_width, screen_height = window.get_size()
	local is_landscape = screen_width > screen_height

	local factor_w, factor_h
	if is_landscape then
		factor_w = (screen_width / lib.CONFIG.recommended_long) / lib.CONFIG.window_scale
		factor_h = (screen_height / lib.CONFIG.recommended_short) / lib.CONFIG.window_scale
	else
		factor_w = (screen_width / lib.CONFIG.recommended_short) / lib.CONFIG.window_scale
		factor_h = (screen_height / lib.CONFIG.recommended_long) / lib.CONFIG.window_scale
	end

	local zoom = math.max(factor_w, factor_h)
	if lib.SDK.get_device() ~= "desktop" then
		zoom = 0.8
	end

	msg.post("/camera#script", "zoom_to", { zoom = zoom })

	msg.post("/gui#gui", lib.HASHES.WINDOWS_RESIZED)
	if lib.LM.level_str ~= "pretutorial" then
		msg.post("/minimap/script", lib.HASHES.WINDOWS_RESIZED)
	end
end

function setup_astar(self)
	self.astar_map = {}
	lib.LM.map_init_x, lib.LM.map_init_y, self.map_width, self.map_height = tilemap.get_bounds("/walls#level_walls")

	for y = 1, self.map_height do
		for x = 1, self.map_width do
			local tile = tilemap.get_tile("/walls#level_walls", hash("walls"), x + lib.LM.map_init_x - 1, y + lib.LM.map_init_y - 1)
			table.insert(self.astar_map, tile)
		end
	end

	local direction        = astar.DIRECTION_EIGHT
	local allocate         = self.map_width * self.map_height
	local typical_adjacent = 8
	local use_cache        = true 
	local use_zero         = false 
	local flip_map         = false 

	astar.setup(self.map_width, self.map_height, direction, allocate, typical_adjacent, use_cache, use_zero, flip_map)
	astar.set_map(self.astar_map)

	local costs = {
		[0] = {
			1.0, 
			1.0, 
			1.0, 
			1.0, 
			1.0, 
			1.0, 
			1.0, 
			1.0 
		},
	}

	astar.set_costs(costs)
end

function show_optimal_way(self)
	local global_coord_to_tilemap_coord = function(global_x, global_y)
		local tile_x = math.ceil(global_x / 64) - lib.LM.map_init_x + 1
		local tile_y = math.ceil(global_y / 128) - lib.LM.map_init_y + 1
		return tile_x, tile_y
	end

	local tilemap_coord_to_global_coord = function(tile_x, tile_y)
		local global_x = (tile_x + lib.LM.map_init_x - 1.5) * 64
		local global_y = (tile_y + lib.LM.map_init_y - 1.5) * 128
		return global_x, global_y
	end

	local start = go.get_position("/player/player")
	local final = go.get_position("/safe_zone")

	local start_tile_x, start_tile_y = global_coord_to_tilemap_coord(start.x, start.y)
	local final_tile_x, final_tile_y = global_coord_to_tilemap_coord(final.x, final.y)

	local status, size, _, path = astar.solve(start_tile_x, start_tile_y, final_tile_x, final_tile_y)

	if status ~= astar.SOLVED then
		hide_optimal_way(self)
		return
	end

	for i = 1, 10 do
		if i + 1 > size then
			go.set_position(vmath.vector3(0, 0, 0), "/astar_mark_" .. i)
		else
			local mark_position_x, mark_position_y = tilemap_coord_to_global_coord(path[i + 1].x, path[i + 1].y)
			local mark_vector = vmath.vector3(mark_position_x, mark_position_y, 4)
			go.set_position(mark_vector, "/astar_mark_" .. i)

			local target_vector
			if i + 2 <= size then
				local target_x, target_y = tilemap_coord_to_global_coord(path[i + 2].x, path[i + 2].y)
				target_vector = vmath.vector3(target_x, target_y, 4)
			else
				target_vector = final
			end

			local dir = target_vector - mark_vector
			if vmath.length_sqr(dir) > 0 then
				local angle = math.atan2(dir.y, dir.x) - math.pi / 2
				go.set_rotation(vmath.quat_rotation_z(angle), "/astar_mark_" .. i)
			end
		end
	end
end

function hide_optimal_way(self)
	for i = 1, 10 do
		go.set_position(vmath.vector3(0, 0, 0), "/astar_mark_" .. i)
	end
end


function check_end(self)
	local puzzle_found = lib.SDK.save_get_array_number("puzzle_found") or {}
	if puzzle_found and #puzzle_found ~= lib.PARAMS.N_PUZZLE_PIECES then
		return false
	end

	for _, level in pairs({ "level1", "level2", "level3", "level4", "level5", "level6", "level7", "level8"}) do
		local ghosts_found = lib.SDK.save_get_array_string(level .. "_ghosts_found") or {}
		local objects_found = lib.SDK.save_get_array_number(level .. "_objects_found") or {}

		if ghosts_found and #ghosts_found ~= #lib.PARAMS.LEVEL_DATA[level].enemies then
			return false
		end

		if objects_found and #objects_found ~= #lib.PARAMS.LEVEL_DATA[level].collectibles then
			return false
		end
	end

	return true
end

function check_room_complete(self)
	local level = lib.LM.level_str
	local level_data = lib.PARAMS.LEVEL_DATA[level]
	if not level_data then
		return false
	end

	local ghosts_found = lib.SDK.save_get_array_string(level .. "_ghosts_found") or {}
	if #ghosts_found ~= #level_data.enemies then
		return false
	end

	local objects_found = lib.SDK.save_get_array_number(level .. "_objects_found") or {}
	if #objects_found ~= #level_data.collectibles then
		return false
	end

	local puzzle_found = lib.SDK.save_get_array_number("puzzle_found") or {}
	for _, puzzle_idx in pairs(level_data.puzzle_pieces) do
		if not lib.CONFIG.is_in_table(puzzle_idx, puzzle_found) then
			return false
		end
	end

	return true
end

function mark_end_unlocked(self)
	if lib.LM.end_game_unlocked then
		return
	end

	lib.LM.end_game_unlocked = true
	lib.SDK.save_set_bool("end_game_unlocked", true)
	lib.SDK.poki_measure("unlock_end", "unlock_end", "custom")
end

function unlock_end(self)
	lib.SM.stop_sound("fx/steps")
	msg.post("/camera", hash("unfollow"))
	go.animate("/camera", "position", go.PLAYBACK_ONCE_FORWARD, go.get_position("/exit_level_end"), go.EASING_LINEAR, 1.0, 0.5, function()
		timer.delay(0.5, false, function()
			msg.post("/exit_level_end", lib.HASHES.ENABLE)
			msg.post("/exit_level_end#boom", lib.HASHES.ENABLE)
			sprite.play_flipbook("/exit_level_end#boom", "boom", function()
				msg.post("/exit_level_end#boom", lib.HASHES.DISABLE)
				msg.post("/camera", hash("follow"), { target = "/player/player", lerp = 0.15 })
				lib.LM.lock_update = false
				lib.LM.lock_input = false
			end)
		end)
	end)
end

function setup_halloween(self)
	for i = 1, 17 do
		go.set("/decors_behind_wall#halloween_calabaza_" .. i, "tint", vmath.vector4(0.4, 0.4, 0.4, 1))
		go.set("/decors_behind_wall#halloween_flecha_" .. i, "tint", vmath.vector4(0.4, 0.4, 0.4, 1))
	end
end