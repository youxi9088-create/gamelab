local lib = require "game.globals.library_manager"

local update_gui, toggle_sound, update_sounds_gui, windows_resized


function init(self)
	msg.post(".", lib.HASHES.ACQUIRE_INPUT_FOCUS)

	self.circle_in = gui.get_node("circle_in")
	self.circle_out = gui.get_node("circle_out")

	self.sound = gui.get_node("sound")

	self.is_dragging = false
	self.is_touch = false

	self.zoom_scale = 1

	gui.set_render_order(lib.PARAMS.GUI_RENDER_ORDER_GUI)
	update_gui(self)
	update_sounds_gui(self)
end

function on_message(self, message_id, message, sender)
	if message_id == lib.HASHES.LAYOUT_CHANGED or message_id == lib.HASHES.UPDATE_GUI then
		update_gui(self)
	end

	if message_id == lib.HASHES.WINDOWS_RESIZED then
		windows_resized(self)
	end
end

function on_input(self, action_id, action)
	if lib.LM.lock_input then
		return
	end

	if lib.SDK.is_action_click_or_touch(action_id) or
		action_id == lib.HASHES.PLAYER_UP or
		action_id == lib.HASHES.PLAYER_DOWN or
		action_id == lib.HASHES.PLAYER_LEFT or
		action_id == lib.HASHES.PLAYER_RIGHT or
		action_id == lib.HASHES.PLAYER_SHOOT then
		if not lib.LM.first_input_received and action.pressed then
			lib.LM.first_input_received = true
			lib.SDK.gameplay_start()
		end
	end

	if lib.SDK.is_action_click_or_touch(action_id) then
		msg.post(".", lib.HASHES.ACQUIRE_INPUT_FOCUS)
		if gui.pick_node(self.sound, action.x, action.y) then
			if action.pressed then
				lib.ANIM.gui_button_press(self.sound, 1./self.zoom_scale, 0.15/self.zoom_scale)
				toggle_sound(self)
			end
			if not self.is_dragging then
				return true
			end
		end
	end

	if lib.SDK.is_action_click_or_touch(action_id) then
		local screen_width, screen_height = window.get_size()
		local layout_width = gui.get_width()
		local layout_height = gui.get_height()
		local pos_x, pos_y = action.x, action.y

		if screen_width > screen_height then
			pos_x = pos_x * layout_width / lib.CONFIG.display_w
		else
			pos_y = pos_y * layout_height / lib.CONFIG.display_h
		end
		local pos = vmath.vector3(pos_x, pos_y, 0)

		if not action.pressed and not action.released then
			gui.set_position(self.circle_in, pos)
		elseif action.pressed then
			self.is_dragging = true

			local scale_x = lib.CONFIG.window_scale * layout_width / screen_width
			local scale_y = lib.CONFIG.window_scale * layout_height / screen_height

			gui.set_scale(self.circle_in, vmath.vector3(scale_x, scale_y, 1))
			gui.set_scale(self.circle_out, vmath.vector3(scale_x, scale_y, 1))

			gui.set_position(self.circle_in, pos)
			gui.set_enabled(self.circle_in, true)

			if action_id == hash(lib.HASHES.TOUCH) then
				gui.set_position(self.circle_out, pos)
				gui.set_enabled(self.circle_out, true)
				self.is_touch = true
			else
				self.is_touch = false
			end
		elseif action.released then
			self.is_dragging = false

			gui.set_enabled(self.circle_in, false)
			gui.set_enabled(self.circle_out, false)
		end
	end
end

function update_gui(self)
	gui.set_enabled(self.circle_in, self.is_dragging)
	gui.set_enabled(self.circle_out, self.is_touch and self.is_dragging)
end

function toggle_sound(self)
	lib.LM.sound_on = not lib.LM.sound_on
	lib.LM.music_on = not lib.LM.music_on

	if lib.LM.sound_on then
		lib.SM.unmute_group("fx")
	else
		lib.SM.mute_group("fx")
	end

	if lib.LM.music_on then
		lib.SM.unmute_group("music")
	else
		lib.SM.mute_group("music")
	end

	update_sounds_gui(self)
end

function update_sounds_gui(self)
	if lib.LM.sound_on then
		gui.play_flipbook(self.sound, "sound_on")
	else
		gui.play_flipbook(self.sound, "sound_off")
	end

	
	
	
	
	
end

function windows_resized(self)
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

	self.zoom_scale = math.max(factor_w, factor_h)
	self.zoom_scale = math.min(self.zoom_scale, 2.)

	if lib.SDK.get_device() ~= "desktop" then
		self.zoom_scale = 1.0
	end

	gui.set_scale(self.sound, vmath.vector3(1.0/self.zoom_scale, 1.0/self.zoom_scale, 1))
end