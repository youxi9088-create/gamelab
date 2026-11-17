local config = require("_services.config")
local analytics = require("_services.analytics")
local utility = require("_modules.utility")
local sound = require("_modules.soundmanager")
local pausemanager = require("_modules.pausemanager")
local gamemanager = require("_modules.gamemanager")
local soundmanager = require("_modules.soundmanager")
local levelmanager = require("_modules.levelmanager")
local level_editor = require("_modules.level_editor.level_editor")
local ads = require("_services.ads")
local poki = require("_services.poki")
local infinite_mode = require("_modules.infinite_mode")
local devicestore = require("_services.devicestore")

local pausing_allowed = true
local awaiting_close = false
local button_hold_dur = .35
local button_hold_timer = nil
local stick_deadzone = 0.5

local url_speedrun = "speedrun:/gui#speedrun"
local colors = {base = vmath.vector3(109/255, 17/255, 2/255), dark = vmath.vector3(44/255, 7/255, 1/255)}
local startup_delay = {initial = .85, reload = 0.35}


local function infinitemode_free_skip_amount()
	return gamemanager.remote_parameters.infinitemode_free_skip_amount or 4
end

local function do_skip()
	msg.post("main:/GUIs#pause", "use_skip")
end

local function set_button_pressed(self, node, is_big_button)
	
	local press_depth = is_big_button and -4 or -2
	gui.set_color(node.base, colors.dark)
	gui.set_enabled(node.bottom, false)
	msg.post(sound.audioref, sound.triggers.sfx_play, {name = sound.sfx_components.ui_click})

	gui.set(node.root, "position.y", node.rootpos.y + press_depth)
	timer.delay(.75, false, function()
		gui.set(node.root, "position.y", node.rootpos.y)
		gui.set_color(node.base, self.color_main)
		gui.set_enabled(node.bottom, true)
	end)
end

local function move_selection(self)
	self.selected_button_index = vmath.clamp(self.selected_button_index, 1, 3)
	for index, node in ipairs(self.nodes.selection) do
		if index == self.selected_button_index then
			gui.set_enabled(node, true)
		else
			gui.set_enabled(node, false)
		end
	end
end

local function initialize(self, startup_delay)
	
	gui.set_enabled(self.nodes.pausemenu, false)	
	gui.set_enabled(self.nodes.btn_skip.root, false)
	self.selected_button_index = 1

	if gamemanager.currentlevel.chapter == -1 and gamemanager.currentlevel.portal == -1 then
		gui.set_enabled(self.nodes.btn_pause.root, false)
		gui.set_enabled(self.nodes.btn_edit.root, true)
		gui.set_enabled(self.nodes.btn_share_link.root, false)
	elseif gamemanager.currentlevel.chapter == -1 and (gamemanager.currentlevel.portal == -2 or gamemanager.currentlevel.portal == -3 or gamemanager.currentlevel.portal == -4) then
		gui.set_enabled(self.nodes.btn_share_link.root, false)
		gui.set_enabled(self.nodes.btn_pause.root, true)
		gui.set_enabled(self.nodes.btn_edit.root, false)
	else
		gui.set_enabled(self.nodes.btn_share_link.root, false)
		gui.set_enabled(self.nodes.btn_pause.root, true)
		gui.set_enabled(self.nodes.btn_edit.root, false)
	end

	if gamemanager.currentlevel.chapter == -1 and gamemanager.currentlevel.portal == -4 then
		gui.set_text(gui.get_node("level_name"), gamemanager.browser_level_name or "")
	else 
		gui.set_text(gui.get_node("level_name"), "")
	end

	if self.initialdelay_timer ~= nil then timer.cancel(self.initialdelay_timer) end

	
	gui.set_enabled(self.nodes.root, false)
	if not gamemanager.current_collection_is_gameplay() or (gamemanager.is_results_level == true) then
		pausing_allowed = false
		return
	end

	
	self.initialdelay_timer = timer.delay(startup_delay, false, function ()

		self.initialdelay_timer = nil
		gui.set_enabled(self.nodes.root, true)
		pausing_allowed = true
		self.transition_active = false

		
		
		local show_skip = false

		
		if (gamemanager.currentlevel.chapter == -1 and gamemanager.currentlevel.portal == -4) then
			
			if _IS_MOBILEAPP then
				
				if gamemanager.ad_variables.infinitemode_skip_amount >= infinitemode_free_skip_amount() then
					local is_ad_ready = (gamemanager.remote_parameters.infinitemode_skip_is_interstitial == 1 and ads.is_interstitial_ready or ads.is_rewarded_ready)()
					show_skip = is_ad_ready
					if is_ad_ready == false then
						ads.preload_ads()
					end
				
				else
					show_skip = true
					ads.preload_ads()	
				end
			else
				show_skip = true
			end
		
		elseif gamemanager.currentlevel.chapter ~= -1 and self.may_show_skip == true then
			if _IS_MOBILEAPP then
				
				if ads.is_rewarded_ready() then
					show_skip = true
				else
					ads.preload_ads()
				end
			
			else
				show_skip = true
			end
		end
		gui.set_enabled(self.nodes.btn_skip.root, false)
	end)
end

function init(self)
	msg.post(".", "acquire_input_focus")
	gui.set_render_order(gamemanager.gui_render_orders.pausemenu)

	self.nodes = {		
		root = gui.get_node("root"),
		pausemenu = gui.get_node("menu_pause"),
		btn_pause = {
			root = gui.get_node("btn_pause"),
			base = gui.get_node("img_pause-base"),
			bottom = gui.get_node("img_pause-bottom")
		},
		btn_edit = {
			root = gui.get_node("btn_edit"),
			base = gui.get_node("img_edit-base"),
			bottom = gui.get_node("img_edit-bottom"),
			icon = gui.get_node("img_edit-icon")
		},
		btn_reload = {
			root = gui.get_node("btn_reload"),
			base = gui.get_node("img_reload-base"),
			bottom = gui.get_node("img_reload-bottom"),
			icon = gui.get_node("img_reload-icon")
		},
		btn_share_link = {
			root = gui.get_node("btn_share_link"),
			base = gui.get_node("btn_share_link_button"),
			bottom = gui.get_node("btn_share_link_button_bottom"),
			icon = gui.get_node("btn_share_link_icon")
		},
		btn_skip = {
			root = gui.get_node("btn_skip"),
			img_skip_base = gui.get_node("img_skip-base"),
			img_skip_bottom = gui.get_node("img_skip-bottom"),
			has_ads_true = gui.get_node("has_ads_true"),
			has_ads_false = gui.get_node("has_ads_false"),
		},
		btn_continue = {
			root = gui.get_node("btn_continue"),
			base = gui.get_node("img_continue-base"),
			bottom = gui.get_node("img_continue-bottom"),
			select = gui.get_node("select_continue"),
			icon = gui.get_node("img_continue-icon")
		},
		btn_retry = {
			root = gui.get_node("btn_retry"),
			base = gui.get_node("img_retry-base"),
			bottom = gui.get_node("img_retry-bottom"),
			select = gui.get_node("select_retry"),
			icon = gui.get_node("img_retry-icon")
		},
		btn_leave = {
			root = gui.get_node("btn_leave"),
			base = gui.get_node("img_leave-base"),
			bottom = gui.get_node("img_leave-bottom"),
			select = gui.get_node("select_leave"),
			icon = gui.get_node("img_leave-icon")
		}
	}
	self.nodes.selection = {
		self.nodes.btn_continue.select,
		self.nodes.btn_retry.select,
		self.nodes.btn_leave.select
	}
	self.nodes.btn_pause.rootpos = gui.get_position(self.nodes.btn_pause.root)
	self.nodes.btn_reload.rootpos =  gui.get_position(self.nodes.btn_reload.root)
	self.nodes.btn_continue.rootpos = gui.get_position(self.nodes.btn_continue.root)
	self.nodes.btn_retry.rootpos = gui.get_position(self.nodes.btn_retry.root)
	self.nodes.btn_leave.rootpos = gui.get_position(self.nodes.btn_leave.root)
	self.nodes.btn_skip.rootpos = gui.get_position(self.nodes.btn_skip.root)
	initialize(self, startup_delay.reload)
end


function do_pause(self)
		
	gamemanager.reset_all_inputs(true)
	set_button_pressed(self, self.nodes.btn_pause, true)

	
	gui.set_enabled(self.nodes.pausemenu, true)
	gui.set_render_order(gamemanager.gui_render_orders.pausemenu)

	self.selected_button_index = 1
	move_selection(self)
	pausemanager.set_paused(true)
	awaiting_close = false
	if gamemanager.is_speedrunmode then msg.post(url_speedrun, "timer_pause") end
end

local function stop_pause(self, close_index)
					
	awaiting_close = true
		
	
	timer.delay(.3, false, function()		
		gui.set_enabled(self.nodes.pausemenu, false)
		poki.gameplay_state_changed(gamemanager.poki_gameplay_states.STOP)
		if close_index == 1 then
			msg.post("level:/inputs#inputs", "unblock_reload")
			
		
		elseif close_index == 2 then
			msg.post("level:/inputs#inputs", "block_reload")
			
			pausing_allowed = false
			poki.commercial_break(function ()
				pausemanager.set_paused(false)
				levelmanager.RESET_LEVEL()
				pausing_allowed = true
				gamemanager.reset_all_inputs()
			end)

			
			if not gamemanager.is_speedrunmode and not gamemanager.is_versusmode then
				local pos_x, pos_y = utility.get_pos_on_screen(levelmanager.heroes[1].position)
				local pokidata = {
					pos_xy = tostring(pos_x) .. "_" ..  tostring(pos_y),
				}
				if poki ~= nil then
					poki.measure(poki.stats_to_measure.level, gamemanager.get_currentlevel_as_string(), "fail", pokidata)
				end
			end
		
		elseif close_index == 3 then			
			msg.post("level:/inputs#inputs", "block_reload")
			local levelselect_to_load = gamemanager.collections.levelselect_c1
			if gamemanager.currentlevel.chapter == 2 then
				levelselect_to_load = gamemanager.collections.levelselect_c2
			elseif gamemanager.currentlevel.chapter == 3 then
				levelselect_to_load = gamemanager.collections.levelselect_c3
			end

			
			local data = {collection_to_load = levelselect_to_load}
			if gamemanager.currentlevel.chapter == 1 and gamemanager.currentlevel.portal == 0 and gamemanager.currentlevel.level == 1 then
				data = {collection_to_load = gamemanager.collections.levelselect}
			end  
			if gamemanager.currentlevel.chapter == -1 then
				data = {collection_to_load = gamemanager.currentlevel.portal == -1 and gamemanager.collections.level_editor or (gamemanager.currentlevel.portal == -2 and gamemanager.collections.level_browser or gamemanager.collections.level_editor_saves)}
				if gamemanager.currentlevel.portal == -4 then
					data.collection_to_load = gamemanager.collections.levelselect
				end
			end
			if gamemanager.currentlevel.portal >= 100 then 
				data = {collection_to_load = gamemanager.collections.sublevels}
			end
			if gamemanager.currentlevel.chapter == -1 and gamemanager.currentlevel.portal == -4 then
				if gamemanager.infinite_mode_send_to_browser then
					data = {collection_to_load = gamemanager.collections.level_browser}
				else
					data = {collection_to_load = gamemanager.collections.levelselect}
				end
				gamemanager.infinite_mode_send_to_browser = false
			end

			
			if gamemanager.is_versusmode then
				data = {collection_to_load = gamemanager.collections.modeselect}
			end
			msg.post("level:/hud#countdown", "set_disabled")
			
			
			if gamemanager.is_speedrunmode == false then
				if gamemanager.is_versusmode == false then
					
					if gamemanager.currentlevel.chapter == -1 then
						_AMP_EVENTS.CUSTOMLEVEL_COMPLETED.properties.result = "loss"
						analytics.track_AMPLITUDE_EVENT(_AMP_EVENTS.CUSTOMLEVEL_COMPLETED)
						if gamemanager.currentlevel.portal ~= -1 then
							msg.post(soundmanager.audioref, soundmanager.triggers.music_stop, {name = nil, fadetime = 1})
						end
					else
						msg.post(soundmanager.audioref, soundmanager.triggers.music_stop, {name = nil, fadetime = 1})
						
						if gamemanager.currentlevel.portal <= 99 then
							_AMP_EVENTS.SUBLEVEL_COMPLETED.properties.result = "loss"
							analytics.track_AMPLITUDE_EVENT(_AMP_EVENTS.SUBLEVEL_COMPLETED)
						end
					end
				end
			end
			
			gamemanager.is_speedrunmode = false
			msg.post(gamemanager.url_transition, "do_anim", data)			
			levelmanager.CANCEL_LEVEL()
		end
		pausemanager.set_paused(false,close_index == 1 and true or false)
	end)
end



local function move_pausebutton_selection(self, action_id)
	
	
	if action_id == gamemanager.inputs.p1.left or action_id == gamemanager.inputs.p2.left
	or action_id == gamemanager.inputs.gamepad.dpad_left then									
		self.selected_button_index = self.selected_button_index + 1
		move_selection(self)		
				
	
	elseif action_id == gamemanager.inputs.p1.right or action_id == gamemanager.inputs.p2.right
	or action_id == gamemanager.inputs.gamepad.dpad_right then
		self.selected_button_index = self.selected_button_index - 1
		move_selection(self)

	
	elseif (action_id == hash("select") or action_id == hash("space")) then
		if self.selected_button_index == 1 then
			stop_pause(self, 1)
			set_button_pressed(self, self.nodes.btn_continue, false)
			if gamemanager.is_speedrunmode then msg.post(url_speedrun, "timer_start") end
		elseif self.selected_button_index == 2 then
			stop_pause(self, 2)
			set_button_pressed(self, self.nodes.btn_retry, false)
			if gamemanager.is_speedrunmode then msg.post(url_speedrun, "timer_start") end
		elseif self.selected_button_index == 3 then
			stop_pause(self, 3)
			set_button_pressed(self, self.nodes.btn_leave, false)
			if gamemanager.is_speedrunmode then msg.post(url_speedrun, "timer_stop") end
		end
	end	
end

function on_input(self, action_id, action)

	if not gui.is_enabled(self.nodes.root) or not pausing_allowed or not gamemanager.current_collection_is_gameplay() or (self.transition_active == true) or gamemanager.is_results_level or gamemanager.is_complete_popup_open then
		return
	end	

	if action.pressed then
		
		if not pausemanager.is_paused() then
			if action_id == hash("touch") then
				
				if gui.is_enabled(self.nodes.btn_pause.root) and gui.pick_node(self.nodes.btn_pause.base, action.x, action.y) then
					do_pause(self)
				
				elseif gui.is_enabled(self.nodes.btn_reload.root) and gui.pick_node(self.nodes.btn_reload.base, action.x, action.y) then
					set_button_pressed(self, self.nodes.btn_reload, true)
					timer.delay(.3, false, function ()
						msg.post("level:/inputs#inputs", "block_reload")
						poki.gameplay_state_changed(gamemanager.poki_gameplay_states.STOP)
						pausing_allowed = false
						poki.commercial_break(function ()
							pausemanager.set_paused(false)
							levelmanager.RESET_LEVEL()
							pausing_allowed = true
						end)
						
						if poki ~= nil then
							if not gamemanager.is_speedrunmode and not gamemanager.is_versusmode then
								local pos_x, pos_y = utility.get_pos_on_screen(levelmanager.heroes[1].position)
								local pokidata = {
									pos_xy = tostring(pos_x) .. "_" ..  tostring(pos_y),
								}
								poki.measure(poki.stats_to_measure.level, gamemanager.get_currentlevel_as_string(), "fail", pokidata)
							end
						end
					end)
				
				elseif gui.is_enabled(self.nodes.btn_skip.root) and gui.pick_node(self.nodes.btn_skip.root, action.x, action.y) then
					do return end
				elseif gui.is_enabled(self.nodes.btn_edit.root) and gui.pick_node(self.nodes.btn_edit.base, action.x, action.y) then 
					if gamemanager.currentlevel.chapter == -1 then
						local data = {collection_to_load = gamemanager.currentlevel.portal == -1 and gamemanager.collections.level_editor or (gamemanager.currentlevel.portal == -2 and gamemanager.collections.level_browser or gamemanager.collections.level_editor_saves)}
						msg.post(gamemanager.url_transition, "do_anim", data)
					end
				elseif gui.is_enabled(self.nodes.btn_share_link.root) and gui.pick_node(self.nodes.btn_share_link.base, action.x, action.y) then
					do return end

					
					
					
				end
			end			
			if action_id == hash("pause") or (action_id == hash("touch") and gui.is_enabled(self.nodes.btn_pause.root) and gui.pick_node(self.nodes.btn_pause.base, action.x, action.y)) then
				do_pause(self)
			end
		elseif not awaiting_close then
			if action_id == hash("touch") then
				
				if gui.pick_node(self.nodes.btn_continue.base, action.x, action.y) then
					set_button_pressed(self, self.nodes.btn_continue, false)
					stop_pause(self, 1)
					if gamemanager.is_speedrunmode then msg.post(url_speedrun, "timer_start") end
				
				elseif gui.pick_node(self.nodes.btn_retry.base, action.x, action.y) then
					set_button_pressed(self, self.nodes.btn_retry, false)
					stop_pause(self, 2)
					if gamemanager.is_speedrunmode then msg.post(url_speedrun, "timer_start") end
				
				elseif gui.pick_node(self.nodes.btn_leave.base, action.x, action.y) then
					set_button_pressed(self, self.nodes.btn_leave, false)
					stop_pause(self, 3)
					if gamemanager.is_speedrunmode then msg.post(url_speedrun, "timer_stop") end					
				end
			elseif (action_id == hash("pause") or action_id == hash("back")) and gui.is_enabled(self.nodes.pausemenu) then
				set_button_pressed(self, self.nodes.btn_continue, false)
				stop_pause(self, 1)
				if gamemanager.is_speedrunmode then msg.post(url_speedrun, "timer_start") end
			end								
			move_pausebutton_selection(self, action_id)
		end	
	elseif pausemanager.is_paused() and not awaiting_close and button_hold_timer == nil then

		if (action_id == gamemanager.inputs.gamepad.s_left or action_id == gamemanager.inputs.gamepad.s_right)
			and action.value > stick_deadzone then 
			
			
			if action_id == gamemanager.inputs.gamepad.s_left then
				self.selected_button_index = self.selected_button_index + 1
				move_selection(self)
				button_hold_timer =  timer.delay(button_hold_dur, false, function()
					button_hold_timer = nil
				end)
			
			elseif action_id == gamemanager.inputs.gamepad.s_right then
				self.selected_button_index = self.selected_button_index - 1
				move_selection(self)
				button_hold_timer =  timer.delay(button_hold_dur, false, function()
					button_hold_timer = nil
				end)
			end
		end
	end
end

local function on_collection_load(self)

	local is_active = gamemanager.current_collection_is_gameplay() and (gamemanager.is_results_level == false)	
	gui.set_enabled(self.nodes.root, is_active)
	
	if gamemanager.is_versusmode == true then
		gui.set_enabled(self.nodes.btn_reload.root, false)
	else
		gui.set_enabled(self.nodes.btn_reload.root, true)
	end
	
	self.color_main = gamemanager.currentlevel.chapter == 2 and utility.rgb(50, 15, 112, 255) or utility.rgb(109, 17, 2, 255)
	self.color_icon = gamemanager.currentlevel.chapter == 2 and utility.rgb(175, 154, 245) or utility.rgb(252, 249, 101)
	
	local show_ads = true	
	if _IS_STEAM or _IS_SWITCH then
		show_ads = false
	elseif _IS_MOBILEAPP or _IS_POKI or html5 then
		show_ads = true
		local is_infinitemode = (gamemanager.currentlevel.chapter == -1 and gamemanager.currentlevel.portal == -4)
		if is_infinitemode and (gamemanager.ad_variables.infinitemode_skip_amount < infinitemode_free_skip_amount()) then
			show_ads = false
		end
	end
	gui.set_color(self.nodes.btn_skip.img_skip_base, self.color_main)
	gui.set_enabled(self.nodes.btn_skip.has_ads_true, show_ads)
	gui.set_enabled(self.nodes.btn_skip.has_ads_false, not show_ads)
	
	gui.set_color(self.nodes.btn_pause.base, self.color_main)
	gui.set_color(self.nodes.btn_reload.base, self.color_main)

	gui.set_color(self.nodes.btn_continue.base, self.color_main)
	gui.set_color(self.nodes.btn_retry.base, self.color_main)
	gui.set_color(self.nodes.btn_leave.base, self.color_main)

	gui.set_color(self.nodes.btn_continue.icon, self.color_icon)
	gui.set_color(self.nodes.btn_retry.icon, self.color_icon)
	gui.set_color(self.nodes.btn_leave.icon, self.color_icon)
	gui.set_color(self.nodes.btn_reload.icon, self.color_icon)

	gamemanager.ad_variables.level_death_counter = 0	

	self.may_show_skip = false
	initialize(self, startup_delay.initial)
end


function on_message(self, message_id, message)
	if message_id == hash("pressed") then
		do_pause(self)

	elseif message_id == hash("pause_disable") then
		pausing_allowed = false
		if self.initialdelay_timer ~= nil then
			timer.cancel(self.initialdelay_timer)
			self.initialdelay_timer = nil
		end
		gui.set_enabled(self.nodes.pausemenu, false)
		gui.set_enabled(self.nodes.root, false)

	elseif message_id == hash("on_collection_load") then
		on_collection_load(self)

	elseif message_id == hash("do_reload") then
		initialize(self, startup_delay.initial)

	elseif message_id == hash("transition_start") then		
		
		if gamemanager.DEBUG_fastmode_active == true then
			self.transition_active = false
			return
		end
		self.transition_active = true

	elseif message_id == hash("transition_end") then
		gui.set_render_order(gamemanager.gui_render_orders.pausemenu)
		self.transition_active = false

	elseif message_id == hash("may_show_skip") then
		self.may_show_skip = true
		
		

	elseif message_id == hash("use_skip") then
		if gamemanager.currentlevel.chapter == -1 and gamemanager.currentlevel.portal == -4 then
			infinite_mode.increment_skip_usage()
		end

		gamemanager.ad_variables.general_timer = 0
		gamemanager.ad_variables.level_timer = 0
		gamemanager.ad_variables.interstitial_ad_immunity = gamemanager.ad_variables.interstitial_ad_immunity + 1
		gui.set_enabled(gui.get_node("btn_skip"),false)
		levelmanager.DEBUG_COMPLETE_LEVEL()
	end
end