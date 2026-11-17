local utility = require "_modules.utility"
local offline_localization = require('_modules.localization.offline_localization')
local platform = require("_services.platform")

local M = {}


M.callback = nil


M.request_count = 0

M.translations = { }

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





function M.load_localization(callback)

	
-- Local edition: this boundary has no remote/provider success response.
M.callback = callback
M.translations = json.decode(offline_localization.translations_json)
if type(callback) == "function" then callback() end
end

return M