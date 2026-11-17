local lib = require "game.globals.library_manager"

 
 
 
 

local teleport

function init(self)
	if self.level == 9 then
		msg.post("#sprite", lib.HASHES.DISABLE)
	end
end

function on_message(self, message_id, message, sender)
	if message_id == lib.HASHES.TRIGGER_RESPONSE and
	message.group == lib.HASHES.PLAYER_EXTRA and message.own_group == lib.HASHES.GRABBABLE then
		if message.enter then
			lib.LM.lock_input = true

			if lib.LM.level_str == "pretutorial" or self.is_end or self.is_end_1 or self.is_end_2 then
				teleport(self)
			else
				lib.SDK.poki_commercial_break(function() teleport(self) end)
			end
		end
	end
end

function teleport(self)
	lib.LM.lock_input = true

	if self.is_end_1 or self.is_end_2 then
		msg.post("/script", lib.HASHES.GAME_END, { i_end = self.is_end_1 and 1 or 2 })
		return
	end

	local level = "pretutorial"
	if self.level ~= 0 then
		level = "level" .. self.level
	end

	if self.is_end then
		level = "level_end"
	end

	lib.LM.prev_level_str = lib.LM.level_str
	msg.post("game_controller:/script#game_controller", lib.HASHES.LOAD_LEVEL, { level = level })
end