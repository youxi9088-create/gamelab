local lib = require "game.globals.library_manager"


function init(self)
	self.overlay = gui.get_node("overlay")
	self.loading = gui.get_node("loading")

	gui.set_enabled(self.overlay, false)
	gui.set_enabled(self.loading, false)

	gui.animate(self.loading, "euler.z", -360, gui.EASING_LINEAR, 1.5, 0, nil, gui.PLAYBACK_LOOP_FORWARD)

	gui.set_render_order(3)
end

function on_message(self, message_id, message, sender)
	if message_id == lib.HASHES.FADE_IN then
		gui.set_alpha(self.overlay, 0)
		gui.set_alpha(self.loading, 0)

		gui.set_enabled(self.overlay, true)
		gui.set_enabled(self.loading, true)

		gui.animate(self.loading, "color.w", 1., gui.EASING_LINEAR, lib.PARAMS.LOADING_SCREEN_TIME)
		gui.animate(self.overlay, "color.w", 1., gui.EASING_LINEAR, lib.PARAMS.LOADING_SCREEN_TIME)
	elseif message_id == lib.HASHES.FADE_OUT then
		gui.animate(self.loading, "color.w", 0., gui.EASING_LINEAR, lib.PARAMS.LOADING_SCREEN_TIME)
		gui.animate(self.overlay, "color.w", 0., gui.EASING_LINEAR, lib.PARAMS.LOADING_SCREEN_TIME, 0, function()
			gui.set_enabled(self.overlay, false)
			gui.set_enabled(self.loading, false)
		end)
	end
end