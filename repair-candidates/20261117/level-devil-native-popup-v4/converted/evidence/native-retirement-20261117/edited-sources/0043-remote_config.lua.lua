local utility = require "_modules.utility"
local savemanager = require("_modules.savemanager")

local M = {}

M.callback = nil


M.request_count = 0
M.amount_of_retries = 1


M.values = {}
M.parse_table = {
	number = tonumber,
	boolean = function (value)
		return string.lower(value) == "true" and 1 or 0
	end
}

local function parseCSVLine(line, sep)
	local values = {}
	local pos = 1
	local sep = sep or ","

	while true do
		local c = string.sub(line, pos, pos)
		

		
		if c == "" then break end

		
		
		
		local f = nil
		if c == "\"" then
			pos = pos + 1
			f = "\""
		else
			f = sep
		end

		local startp = pos

		
		
		while true do
			local c = string.sub(line, pos, pos)

			if c == "" or c == f then
				break
			end

			pos = pos + 1
		end

		
		local v = string.sub(line, startp, pos - 1)
		table.insert(values, v)
		

		
		pos = pos + 1

		
		if f == "\"" then
			pos = pos + 1
		end
	end

	return values
end





function M.load_remote_config(callback)
	
	
-- Local edition: this boundary has no remote/provider success response.
M.callback = callback
if type(callback) == "function" then callback() end
end

function M.check_editor_blocked(callback,optional_flag)
	LOG_INFO("Checking if editor is blocked")
	
	if M.override_kill_switch == true or html5 or _IS_STEAM then
		LOG_INFO("Kill switch override or platform without killswitch detected")
		if callback and type(callback) == "function" then
			callback(false)
		end
		return
	end
	
	
	if M.values and M.values.is_level_editor_active and M.values.is_level_editor_active == 0 then
		LOG_INFO("Killswitch was blocked to an earlier call to the remote config, blocking editor")
		if callback and type(callback) == "function" then
			callback(true)
		end
		return
	end

	M.load_remote_config(function ()
		local block_editor = false
		

		if M.values and M.values.is_level_editor_active then
			LOG_INFO("Value found in remote config, setting editor blocked to " .. (M.values.is_level_editor_active == 0 and "true" or "false"))
			block_editor = M.values.is_level_editor_active == 0
			savemanager.save_level_editor_state(M.values.is_level_editor_active)
		else
			LOG_INFO("Value found in savemanager, setting editor blocked to " .. (savemanager.get_level_editor_state() == 0 and "true" or "false"))
			
			if optional_flag then
				block_editor = true
			else
				block_editor = savemanager.get_level_editor_state() == 0
			end
		end

		if callback and type(callback) == "function" then
			callback(block_editor)
		end
	end)
end

return M
