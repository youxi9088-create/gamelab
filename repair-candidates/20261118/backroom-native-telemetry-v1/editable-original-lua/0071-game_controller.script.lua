local lib = require "game.globals.library_manager"

local load_level, load_current_level, load_resources, after_resources_loaded, windows_resized
local generate_fake_save, print_hash_error

function init(self)
	
	lib.SDK.init()

	
	local addr_entropy = tonumber(tostring({}):match("0x(.*)"), 16) or 0
	math.randomseed(os.time() + addr_entropy)
    math.random()
    math.random()
    math.random()

	
	lib.LANG.init({
		{ id = "en", path = "/translations/translations.csv" },
		{ id = "fr", path = "/translations/translations.csv" },
		{ id = "it", path = "/translations/translations.csv" },
		{ id = "de", path = "/translations/translations.csv" },
		{ id = "es", path = "/translations/translations.csv" },
		{ id = "tr", path = "/translations/translations.csv" },
		{ id = "zh", path = "/translations/translations.csv" },
		{ id = "ja", path = "/translations/translations.csv" },
		{ id = "ko", path = "/translations/translations.csv" },
		{ id = "pt", path = "/translations/translations.csv" },
		{ id = "ru", path = "/translations/translations.csv" },
	})

	
	if not lib.SDK.is_debug and go.exists("debugger") then
		go.delete("debugger")
	end

	self.current_level = nil
	load_resources()

	if lib.SDK.is_debug then
		generate_fake_save()
		print_hash_error()
	end

	local resources_loaded_fast = lib.SDK.save_get_bool("resources_loaded") or false
	if resources_loaded_fast then
		load_level(self, "level1")
	else
		load_level(self, "pretutorial")
	end
end

function on_message(self, message_id, message, sender)
	if message_id == lib.HASHES.LOAD_LEVEL then
		load_level(self, message.level)
	end

	if message_id == lib.HASHES.PROXY_LOADED then
		if sender.path == lib.HASHES.SOUNDS then
			msg.post(sender, lib.HASHES.INIT)
			msg.post(sender, lib.HASHES.ENABLE)
			lib.LM.sounds_loaded = true
			lib.SM.init()
		else
			lib.LM.level_reset()
			msg.post(sender, lib.HASHES.INIT)
			msg.post(sender, lib.HASHES.ENABLE)
			msg.post(sender, lib.HASHES.ACQUIRE_INPUT_FOCUS)
			msg.post("/loading_screen#loading_screen", lib.HASHES.FADE_OUT)
		end
	end

	if message_id == lib.HASHES.PROXY_UNLOADED then
		load_current_level(self)
	end

	if message_id == lib.HASHES.WINDOWS_RESIZED then
		windows_resized(self)
	end
end

function load_level(self, level_to_load)
	lib.LM.level_str = level_to_load

	msg.post("/loading_screen#loading_screen", lib.HASHES.FADE_IN)
	timer.delay(lib.PARAMS.LOADING_SCREEN_TIME , false, function()
		lib.SM.stop_sound("fx/steps")

		if self.current_level == nil then
			self.current_level = level_to_load
			load_current_level(self)
		else
			local _current_level = self.current_level
			self.current_level = level_to_load
			msg.post("/levels#" .. _current_level, lib.HASHES.DISABLE)
			msg.post("/levels#" .. _current_level, lib.HASHES.UNLOAD)
		end
	end)
end

function load_current_level(self)
	local function try_load()
		if lib.LM.resources_loaded or self.current_level == "pretutorial" then
			msg.post("/levels#" .. self.current_level, lib.HASHES.LOAD)
		else
			timer.delay(0.1, false, try_load)
		end
	end

	try_load()
end

function load_resources()
	local resource_version = lib.CONFIG.split(sys.get_config_string("project.version"), ".")[4]
	local zip_filename = "resources_" .. resource_version .. ".zip"

	if html5 and liveupdate and (not lib.RESZIP.version_match(zip_filename) or lib.PARAMS.RESOURCES_FORCE_DELETE) then
		lib.RESZIP.load_and_mount_zip(zip_filename, {
			filename = zip_filename,
			delete_old_file = true,
			on_finish = after_resources_loaded
		})
	else
		after_resources_loaded()
	end
end

function after_resources_loaded()
	lib.LM.resources_loaded = true
	msg.post(lib.HASHES.SOUNDS, lib.HASHES.LOAD)
	lib.SDK.save_set_bool("resources_loaded", true)
end

function windows_resized(self)
	if self.current_level then
		msg.post(self.current_level .. ":/script", lib.HASHES.WINDOWS_RESIZED)
	end
end

function generate_fake_save(self)
	
	

	
	
	

	
	
	
	
	
	
	
	

	
	

	
	

	
	

	
	

	
	

	
	

	
	

	
	

	
end

function print_hash_error(err_str)
	
	
	
	
	
	

	
	
	
	
	
end