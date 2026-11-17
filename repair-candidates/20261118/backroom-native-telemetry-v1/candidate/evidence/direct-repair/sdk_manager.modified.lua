local PARAMS = require "game.globals.params"
local HASHES = require "game.globals.hashes"
local SM = require "game.globals.sound_manager"
local LM = require "game.globals.level_manager"
local DEFSAVE = require "defsave.defsave"
local CONFIG = require "game.globals.config"

local M = {}

M.opened_menus = {}

M.is_debug = sys.get_engine_info().is_debug
M.is_poki = sys.get_config_string("SDK.is_poki") == "true"
M.is_crazygames = sys.get_config_string("SDK.is_crazygames") == "true"
M.is_itch = sys.get_config_string("SDK.is_itch") == "true"

M.save_print_debug = false

M.gameplay_started = false

M.commercial_break_pending = false
M.rewarded_break_pending = false


function M.get_version_string(node)
    local project_version = sys.get_config_string("project.version") or ""
    local build_date_tag = sys.get_config_string("SDK.build_date_tag") or ""
	local platform = M.is_poki and "PK" or M.is_crazygames and "CG" or M.is_itch and "IT" or "XX"
	local defold_version = sys.get_engine_info().version or ""
	local rel_debug = M.is_debug and "debug" or "release"
	local device = M.get_device() or "unknown"

    return project_version .. "(" .. platform .. ")" .. "(" .. build_date_tag .. ")" .. "(" .. defold_version .. ")" .. "(" .. rel_debug .. ")" .. "(" .. device .. ")"
end

function M.is_action_click_or_touch(action_id)
	return (action_id == HASHES.CLICK and M.get_device() == "desktop") or action_id == HASHES.TOUCH
end

local function SDK_debugger(msg)
	if M.is_debug and not html5 then
		print("SDKDebugger: ".. msg)
	end
end

function M.print_in_error_console(msg)
	local version = sys.get_config_string("project.version")
	local name_tag = sys.get_config_string("SDK.name_tag")
	local print_msg = string.format("%s [%s]: %s", name_tag, version, msg)

	if html5 then
		html5.run("console.error('" .. print_msg .. "')")
	else
		print(print_msg)
	end
end

function M.get_device()
	if M.is_poki and poki_sdk then
		return poki_sdk.get_device_info().category 
	else
		local user_agent = sys.get_sys_info().user_agent

		
		
		
		
		local is_mobile_or_tablet = user_agent:find("Android") or user_agent:find("iPhone") or user_agent:find("iPad") or user_agent:find("Mobile")
		if is_mobile_or_tablet then
			return "mobile"
		else
			return "desktop"
		end
	end
end

function M.init()
	if (M.is_poki and poki_sdk) or M.is_debug or M.is_itch then
		M.setup_save()
	end

	if (M.is_poki and poki_sdk) or M.is_debug then
		M.print_in_error_console("Game started")
		M.poki_send_beacon("game_started")
		M.poki_print_time()
	end

	if M.is_poki and poki_sdk then
		poki_sdk.move_pill(0, 0)
	end
end

function M.gameplay_start()
	if M.gameplay_started then
		return
	end

	if next(M.opened_menus) ~= nil then
		return
	end

	SDK_debugger("> gameplayStart")
	M.gameplay_started = true

	if M.is_poki and poki_sdk then
		poki_sdk.gameplay_start()
	elseif M.is_crazygames and crazygames then
		crazygames.gameplay_start()
	end
end

function M.gameplay_stop()
	if not M.gameplay_started then
		return
	end

	SDK_debugger("< gameplayStop")
	M.gameplay_started = false

	if M.is_poki and poki_sdk then
		poki_sdk.gameplay_stop()
	elseif M.is_crazygames and crazygames then
		crazygames.gameplay_stop()
	end
end

local function poki_prev_break()
	SM.mute_all()
	M.gameplay_stop()

	LM.lock_input = true
	LM.lock_update = true
end

local function poki_after_break()
	SM.unmute_all()

	if next(M.opened_menus) ~= nil then
		return
	end

	M.gameplay_start()

	LM.lock_input = false
	LM.lock_update = false
end

function M.poki_commercial_break(callback)
	if M.commercial_break_pending then
		return
	end

	SDK_debugger("-- commercial break")
	M.commercial_break_pending = true

	local after_commercial_break = function(_, status)
		if status == poki_sdk.COMMERCIAL_BREAK_START then
			poki_prev_break()
		else 
			M.commercial_break_pending = false
			poki_after_break()
			if callback then
				callback()
			end
		end
	end

	if poki_sdk then
		poki_sdk.commercial_break(after_commercial_break)
	else
		poki_prev_break()
		M.commercial_break_pending = false
		poki_after_break()
		if callback then
			callback()
		end
	end
end

function M.poki_rewarded_break(callback)
	if M.rewarded_break_pending then
		return
	end

	SDK_debugger("-- rewarded break")
	M.rewarded_break_pending = true

	local after_rewarded_break = function(_, status)
		if not poki_sdk then
			M.rewarded_break_pending = false
			if callback then
				callback()
			end
		elseif status == poki_sdk.REWARDED_BREAK_START  then
			poki_prev_break()
		elseif status == poki_sdk.REWARDED_BREAK_SUCCESS  then
			M.rewarded_break_pending = false
			poki_after_break()
			if callback then
				callback()
			end
		elseif status == poki_sdk.REWARDED_BREAK_ERROR then
			M.rewarded_break_pending = false
			poki_after_break()
		else
			M.rewarded_break_pending = false
			poki_after_break()
		end
	end

	if poki_sdk then
		poki_sdk.rewarded_break(after_rewarded_break)
	else
		poki_prev_break()
		after_rewarded_break()
		poki_after_break()
	end
end

function M.poki_send_beacon(msg)
	-- Platform telemetry is retired in the standalone package.
end

function M.poki_measure(category, what, action)
	if category == nil or category == "" then
		category = "unknown"
		if M.is_debug then
			print("Measure category empty")
		end
	end
	if what == nil or what == "" then
		what = "unknown"
		if M.is_debug then
			print("Measure what empty")
		end
	end
	if action == nil or action == "" then
		action = "unknown"
		if M.is_debug then
			print("Measure action empty")
		end
	end

	if M.is_poki and poki_sdk then
		poki_sdk.measure(category, what, action)
	else
		print("Poki measure: " .. category .. " " .. what .. " " .. action)
	end
end

function M.save_get_bool(key)
	if M.save_print_debug then
		SDK_debugger("-- save_get_bool " .. key)
	end

	if M.is_crazygames and crazygames then
		local value = crazygames.get_item(key)
		if value == "true" then
			return true
		elseif value == true then
			return true
		elseif value == "false" then
			return false
		elseif value == false then
			return false
		else
			return nil
		end
	elseif M.is_poki or M.is_debug or M.is_itch then
		return DEFSAVE.get("save", key)
	end

	return nil
end

function M.save_set_bool(key, value)
	if M.save_print_debug then
		SDK_debugger("-- save_set_bool " .. key .. " = " .. tostring(value))
	end

	if M.is_crazygames and crazygames then
		if value == true then
			crazygames.set_item(key, "true")
		else
			crazygames.set_item(key, "false")
		end
	elseif M.is_poki or M.is_debug or M.is_itch then
		DEFSAVE.set("save", key, value)
		DEFSAVE.save("save")
	end
end

function M.save_get_number(key)
	if M.save_print_debug then
		SDK_debugger("-- save_get_number " .. key)
	end

	if M.is_crazygames and crazygames then
		local value = crazygames.get_item(key)
		if value ~= nil then
			return tonumber(value)
		else
			return nil
		end
	elseif M.is_poki or M.is_debug or M.is_itch then
		return DEFSAVE.get("save", key)
	end

	return nil
end

function M.save_set_number(key, value)
	if M.save_print_debug then
		SDK_debugger("-- save_set_number " .. key .. " = " .. tostring(value))
	end

	if M.is_crazygames and crazygames then
		crazygames.set_item(key, tostring(value))
	elseif M.is_poki or M.is_debug or M.is_itch then
		DEFSAVE.set("save", key, value)
		DEFSAVE.save("save")
	end
end

function M.save_get_array_string(key)
	if M.save_print_debug then
		SDK_debugger("-- save_get_array_string " .. key)
	end

	if M.is_crazygames and crazygames then
		local value = crazygames.get_item(key)
		if value ~= nil then
			return CONFIG.split(value, ",")
		else
			return nil
		end
	elseif M.is_poki or M.is_debug or M.is_itch then
		return DEFSAVE.get("save", key)
	end

	return nil
end

function M.save_get_array_number(key)
	if M.save_print_debug then
		SDK_debugger("-- save_get_array_number " .. key)
	end

	if M.is_crazygames and crazygames then
		local value = crazygames.get_item(key)
		if value ~= nil then
			local split = CONFIG.split(value, ",")
			for i = 1, #split do
				split[i] = tonumber(split[i])
			end
			return split
		else
			return nil
		end
	elseif M.is_poki or M.is_debug or M.is_itch then
		return DEFSAVE.get("save", key)
	end

	return nil
end

function M.save_set_array(key, value)
	if M.save_print_debug then
		SDK_debugger("-- save_set_array " .. key .. " = " .. CONFIG.join(value, ","))
	end

	if M.is_crazygames and crazygames then
		crazygames.set_item(key, CONFIG.join(value, ","))
	elseif M.is_poki or M.is_debug or M.is_itch then
		DEFSAVE.set("save", key, value)
		DEFSAVE.save("save")
	end
end

function M.save_get_string(key)
	if M.save_print_debug then
		SDK_debugger("-- save_get_string " .. key)
	end

	if M.is_crazygames and crazygames then
		local value = crazygames.get_item(key)
		if value ~= nil then
			return value
		else
			return nil
		end
	elseif M.is_poki or M.is_debug or M.is_itch then
		return DEFSAVE.get("save", key)
	end

	return nil
end

function M.save_set_string(key, value)
	if M.save_print_debug then
		SDK_debugger("-- save_set_string " .. key .. " = " .. tostring(value))
	end

	if M.is_crazygames and crazygames then
		crazygames.set_item(key, value)
	elseif M.is_poki or M.is_debug or M.is_itch then
		DEFSAVE.set("save", key, value)
		DEFSAVE.save("save")
	end
end

function M.save_clear_data()
	if M.save_print_debug then
		SDK_debugger("-- save_clear_data")
	end

	if M.is_crazygames and crazygames then
		crazygames.clear_data()
	elseif M.is_poki or M.is_debug or M.is_itch then
		DEFSAVE.reset_to_default("save")
		DEFSAVE.save("save")
	end
end

function M.setup_save()
	DEFSAVE.verbose = false
	DEFSAVE.appname = PARAMS.SAVE_FILENAME
	DEFSAVE.default_data = { save = PARAMS.SAVE_DEFAULT_DATA }

	DEFSAVE.load("save")

	local game_save_version = CONFIG.split(sys.get_config_string("project.version"), ".")
	local defsave_save_version = CONFIG.split(DEFSAVE.get("save", "version"), ".")

	if  PARAMS.SAVE_FORCE_DELETE or
		#game_save_version ~= #defsave_save_version or
		game_save_version[3] ~= defsave_save_version[3] then
			DEFSAVE.reset_to_default("save")
			DEFSAVE.save("save")
	else
			M.repair_savegame()
	end

	DEFSAVE.set("save", "version", sys.get_config_string("project.version"))

	local loaded_games = DEFSAVE.get("save", "loaded_games")
	DEFSAVE.set("save", "loaded_games", loaded_games + 1)
	DEFSAVE.save("save")

	M.poki_measure("loaded_games", tostring(loaded_games + 1), "custom")
end

function M.repair_savegame()
	for var, _ in pairs(PARAMS.SAVE_DEFAULT_DATA) do
		if not DEFSAVE.key_exists("save", var) then
			DEFSAVE.set("save", var, PARAMS.SAVE_DEFAULT_DATA[var])
		end
	end

	for var, _ in pairs(DEFSAVE.loaded["save"].data) do
		if PARAMS.SAVE_DEFAULT_DATA[var] == nil then
			DEFSAVE.set("save", var, PARAMS.SAVE_DEFAULT_DATA[var])
		end
	end

	DEFSAVE.save("save")
end

function M.poki_print_time()
	if not (M.is_poki or M.is_debug) then
		return
	end

	local last_announced_minute = 0
	M.poki_measure("minutes_played", tostring(last_announced_minute + 1), "start")

	timer.delay(60, true, function()
		last_announced_minute = last_announced_minute + 1
		M.poki_measure("minutes_played", tostring(last_announced_minute), "complete")
		M.poki_measure("minutes_played", tostring(last_announced_minute + 1), "start")
	end)
end

return M