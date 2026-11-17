poki_sdk = poki_sdk

local utility = require("_modules.utility")
local level_editor = require("_modules.level_editor.level_editor")
local gamemanager = require("_modules.gamemanager")
local savemanager = require("_modules.savemanager")

local interappcommunication = require("_modules.interappcommunication")

local M = {}

function M.on_game_boot()

	if _IS_POKI or html5 then
		local params = {}
		if (_IS_CURATOR or _IS_VIEWER) or not _IS_POKI then
			params = utility.get_query_parameters()
		else
			params = utility.get_query_parameters()
		end

		if params.level_editor and params.level_editor ~= "" then
			level_editor.get_level_from_id(params.level_editor, function (response)
				local colname = gamemanager.collections.modeselect
				if response then
					gamemanager.recieved_file = response
					gamemanager.currentlevel.chapter = -1 
					gamemanager.currentlevel.portal = -2
					gamemanager.currentlevel.level = -1
					colname = gamemanager.collections.level
				end
				msg.post(".", "load_collection", {collectionname = colname})
				msg.post(gamemanager.url_transition, "anim_openmouth")
			end)
		else
			msg.post(".", "load_collection", {collectionname = gamemanager.collections.modeselect})
			msg.post(gamemanager.url_transition, "anim_openmouth")
		end

	elseif _IS_ANDROID or _IS_IOS then

		timer.delay(0.5, false, function ()
			
			local colname = (savemanager.first_boot == true) and gamemanager.collections.level or gamemanager.collections.levelselect
			if interappcommunication.send_to_level_editor then
				pprint("Sending to level editor")
				level_editor.get_level_from_id(interappcommunication.cold_start_level_code, function (response)
					pprint("Cold start")
					pprint(response)
					pprint(interappcommunication.cold_start_level_code)
					gamemanager.recieved_file = response
					gamemanager.browser_share_level_code = interappcommunication.cold_start_level_code
	
					gamemanager.currentlevel.chapter = -1 
					gamemanager.currentlevel.portal = -2
					gamemanager.currentlevel.level = -1
					colname = gamemanager.collections.level
					interappcommunication.game_initialized = true
	
					if response == nil then
						colname = (savemanager.first_boot == true) and gamemanager.collections.modeselect or gamemanager.collections.modeselect
					end
	
					msg.post(".", "load_collection", {collectionname = colname})
					msg.post(gamemanager.url_transition, "anim_openmouth")
				end)
				return
			end
			
			interappcommunication.game_initialized = true
			msg.post(".", "load_collection", {collectionname = colname})
			msg.post(gamemanager.url_transition, "anim_openmouth")

			if savemanager.first_boot == true then
				gamemanager.portalstarted()
			end
		end)
	else
		local colname = (savemanager.first_boot == true) and gamemanager.collections.level or gamemanager.collections.levelselect
		msg.post(".", "load_collection", {collectionname = colname})
		msg.post(gamemanager.url_transition, "anim_openmouth")
	end
end

return M