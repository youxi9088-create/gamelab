local soundmanager = require("_modules.soundmanager")
local monarch = require("monarch.monarch")
local devicestore = require("_services.devicestore")
local gamemanager = require("_modules.gamemanager")
local localization_helper = require('_modules.localization.localization_helper')
local utility = require("_modules.utility")
local infinite_mode = require("_modules.infinite_mode")
local remote_config = require("_modules.remote_config.remote_config")
local level_editor = require("_modules.level_editor.level_editor")


local my_screen_id = hash("INFINITEMODE")
local monarchdata

local product_id


function init(self)

	
	monarchdata = monarch.data(my_screen_id)

	
	self.nodes = {
		title = gui.get_node("title"),
		yes_button = gui.get_node("yes_button"),
		no_button = gui.get_node("no_button"),
	}

	
	msg.post(".", "acquire_input_focus")
	gui.set_render_order(gamemanager.gui_render_orders.popup_menu)
end


local function close_popup()
	msg.post(".", "release_input_focus")
	timer.delay(0.5, false, function ()
		monarch.back()
	end)
end

function on_input(self, action_id, action)

	if not action.pressed then return end
	local x, y = action.x, action.y


	if action_id == hash("touch") then
		if gui.pick_node(self.nodes.yes_button, x, y) then
			-- Retired online offer follows the existing cancel path.
close_popup()
			
		elseif gui.pick_node(self.nodes.no_button, x, y) then
			msg.post(soundmanager.audioref, soundmanager.triggers.sfx_play, { name = soundmanager.sfx_components.ui_click })
			utility.button_press_animation("no")
			close_popup()
		end
	end
end


function final(self)

	if monarchdata then
		monarchdata.on_close()
	end
end

function on_message(self, message_id, message, sender)
	if message_id == hash("close") then
		close_popup()
	end
end