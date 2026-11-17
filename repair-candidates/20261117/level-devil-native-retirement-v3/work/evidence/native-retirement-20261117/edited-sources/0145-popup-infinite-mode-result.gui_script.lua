local soundmanager = require("_modules.soundmanager")
local monarch = require("monarch.monarch")
local devicestore = require("_services.devicestore")
local gamemanager = require("_modules.gamemanager")
local localization_helper = require('_modules.localization.localization_helper')
local utility = require("_modules.utility")
local infinite_mode = require("_modules.infinite_mode")
local remote_config = require("_modules.remote_config.remote_config")
local level_editor = require("_modules.level_editor.level_editor")
local poki = require("_services.poki")
local ads = require("_services.ads")


local my_screen_id = hash("RESULTS_PAGE")
local monarchdata

local product_id

local function animate_copy_to_clipboard_popup()
	gui.set_enabled(gui.get_node("tooltip"), true)
	gui.animate(gui.get_node("tooltip"), "position.y", -435, gui.EASING_LINEAR, .2)
	timer.delay(5, false, function ()
		gui.animate(gui.get_node("tooltip"), "position.y", -500, gui.EASING_LINEAR, .2,0,function ()
			gui.set_enabled(gui.get_node("tooltip"), false)
		end)
	end)
end

function init(self)
	gamemanager.is_complete_popup_open = true
	
	monarchdata = monarch.data(my_screen_id)

	
	self.nodes = {
		share_link_button = gui.get_node("share_link_button"),
		continue_button = gui.get_node("continue_button"),
		level_name = gui.get_node("level_name"),
	}

	if self.nodes.level_name and monarchdata.name then
		gui.set_text(self.nodes.level_name, monarchdata.name)
	end

	
	msg.post(".", "acquire_input_focus")
	gui.set_render_order(gamemanager.gui_render_orders.popup_menu)
gui.set_enabled(self.nodes.share_link_button, false)

end

local function do_close()
	monarch.back()
	msg.post(gamemanager.url_transition, "do_anim", {collection_to_load = gamemanager.collections.level})
end

local function close_popup()
	gamemanager.is_complete_popup_open = false
	msg.post(".", "release_input_focus")
	timer.delay(0.5, false, function ()
		if gamemanager.ad_variables.infinitemode_timer > gamemanager.remote_parameters.infinitemode_seconds_until_interstitial then
			if devicestore.has_remove_ads() == false then
				if html5 then poki.commercial_break(do_close)
				else ads.show_ad(ads.ad.interstitial, do_close, do_close, "infinite_mode_level_completion") end
				gamemanager.ad_variables.infinitemode_timer = 0
			else
				do_close()
			end
		else
			do_close()
		end
	end)
end

function on_input(self, action_id, action)

	if not action.pressed then return end
	local x, y = action.x, action.y


	if action_id == hash("touch") then
		if gui.pick_node(self.nodes.share_link_button, x, y) then
			do return end
		end
		if gui.pick_node(self.nodes.continue_button, x, y) then
			msg.post(soundmanager.audioref, soundmanager.triggers.sfx_play, { name = soundmanager.sfx_components.ui_click })
			msg.post(soundmanager.audioref, soundmanager.triggers.music_stop, {name = nil, fadetime = 0})
			utility.button_press_animation("continue")
			close_popup()
		end
	end
end


 


function on_message(self, message_id, message, sender)
	if message_id == hash("close") then
		close_popup()
	end
end