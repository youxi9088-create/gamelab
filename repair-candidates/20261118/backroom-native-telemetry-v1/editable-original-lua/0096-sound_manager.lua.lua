local HASHES = require "game.globals.hashes"
local LM = require "game.globals.level_manager"

local M = {}

function M.init()
	if LM.music_on then
		M.unmute_group("music")
	else
		M.mute_group("music")
	end
    if LM.sound_on then
		M.unmute_group("fx")
	else
		M.mute_group("fx")
	end

	M.play_sound("music/music")
end

function M.play_sound(sound, only_if_not_playing)
	if only_if_not_playing == nil then
		only_if_not_playing = false
	end
	if LM.sounds_loaded then
		msg.post("sound_controller:/script#sound_controller", HASHES.PLAY_SOUND, { sound = sound, only_if_not_playing = only_if_not_playing })
	end
end

function M.stop_sound(sound)
	if LM.sounds_loaded then
		msg.post("sound_controller:/script#sound_controller", HASHES.STOP_SOUND, { sound = sound })
	end
end

function M.stop_group(group)
	if LM.sounds_loaded then
		msg.post("sound_controller:/script#sound_controller", HASHES.STOP_GROUP, { group = group })
	end
end

function M.set_sound_gain(sound, gain)
	if LM.sounds_loaded then
		msg.post("sound_controller:/script#sound_controller", HASHES.SET_SOUND_GAIN, { sound = sound, gain = gain })
	end
end

function M.set_group_gain(group, gain)
	if LM.sounds_loaded then
		msg.post("sound_controller:/script#sound_controller", HASHES.SET_GROUP_GAIN, { group = group, gain = gain })
	end
end

function M.mute_group(group)
	if LM.sounds_loaded then
		msg.post("sound_controller:/script#sound_controller", HASHES.MUTE_GROUP, { group = group })
	end
end

function M.unmute_group(group)
	if LM.sounds_loaded then
		msg.post("sound_controller:/script#sound_controller", HASHES.UNMUTE_GROUP, { group = group })
	end
end

function M.mute_all(all)
	if LM.sounds_loaded then
		msg.post("sound_controller:/script#sound_controller", HASHES.MUTE_ALL)
	end
end

function M.unmute_all(all)
	if LM.sounds_loaded then
		msg.post("sound_controller:/script#sound_controller", HASHES.UNMUTE_ALL)
	end
end

return M