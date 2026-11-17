local gamemanager = require "_modules.gamemanager"
local devicestore = require("_services.devicestore")
local chapterinfo = require "_modules.chapterinfo"
local utility = require "_modules.utility"
local savemanager = require "_modules.savemanager"
local soundmanager = require "_modules.soundmanager"
local localization_helper = require "_modules.localization.localization_helper"
local device = require "_modules.devices"
local level_select_info = require "_modules.level-select.level-select-info"
local remote_config = require("_modules.remote_config.remote_config")
local ads           = require("_services.ads")
local monarch		= require("monarch.monarch")
local platform		= require("_services.platform")
local infinite_mode = require("_modules.infinite_mode")
local analytics		= require("_services.analytics")

local portals = {}
local chapter_buttons = {}
local highest_index_portal = {}
local ui_buttons = {
	"settings","quit","remove_ads","speedrun","two_player","editor","closeapp",
}

local CHAPTER_X_OFFSET = 1040

local worldnames_by_chapter = {
	chapterinfo.worldnames_c1,
	chapterinfo.worldnames_c2,
	chapterinfo.worldnames_c3,
}

local function get_worldname(chapter, index)
	return worldnames_by_chapter[chapter][index] or ""
end

local function set_speedrun_time() 
	local speedrun_root = gui.get_node("speedrun_button")
	local speedrun_text = gui.get_node("speedrun_text")
	local current_chapter_conquered = savemanager.get_conquered_state_by_chapter(level_select_info.current_chapter) == true
	local speedrun_best_time = savemanager.get_speedrun_best_by_chapter(level_select_info.current_chapter)    
    local has_speedran = (speedrun_best_time > 0)
    gui.set_enabled(speedrun_root, current_chapter_conquered)
	gui.set_text(speedrun_text, " --:--")
    if current_chapter_conquered == true then
        if has_speedran == false then
            gui.set_text(speedrun_text, " --:--")
			
        else
            gui.set_text(speedrun_text, utility.to_mmssmmm(speedrun_best_time))
        end
    end
end

local function get_portal_node(portal, suffix)
	return portal.tree[portal.id .. "/" .. suffix]
end

local function get_portal_node_position(portal, suffix)
	local root = portal.tree[portal.id .. "/root"]
	local node = get_portal_node(portal, suffix)
	return gui.get_position(root) + gui.get_position(node)
end

local STANDARD_PORTAL_SIZE = 36

local function get_portal_button_position(portal)
	return get_portal_node_position(portal, "button_hitbox")
end

local function get_selection_positions(portal)
	local border = get_portal_node(portal, "border")
	local border_size = gui.get_size(border)
	local scale = border_size.y / STANDARD_PORTAL_SIZE
	local text_offset_x = 20 + (border_size.x - STANDARD_PORTAL_SIZE) * (8 / STANDARD_PORTAL_SIZE)

	if border_size.x == STANDARD_PORTAL_SIZE and border_size.y == STANDARD_PORTAL_SIZE then
		local anchor = get_portal_button_position(portal)
		return anchor + vmath.vector3(1, 32, 0),
			anchor + vmath.vector3(-text_offset_x, -18, 0),
			2
	end

	local border_pos = get_portal_node_position(portal, "border")
	local anchor = vmath.vector3(
		border_pos.x + border_size.x * 0.5,
		border_pos.y - border_size.y * 0.5,
		0
	)
	return anchor + vmath.vector3(-1 * scale, 16 * scale, 0),
		anchor + vmath.vector3(-text_offset_x, -18 * scale, 0),
		2 * scale
end

local function swap_door_sprites(portal_entry)
	local border = portal_entry.tree[portal_entry.id .. "/border"]
	local fill = portal_entry.tree[portal_entry.id .. "/fill"]
	local floor = portal_entry.tree[portal_entry.id .. "/floor"]
	local button = portal_entry.tree[portal_entry.id .. "/button_hitbox"]
	local size = gui.get_size(border)
	local position = gui.get_position(portal_entry.tree[portal_entry.id .. "/root"])

	if portal_entry.index == -1 then 
		gui.play_flipbook(border, "bonus_door_border")
		gui.play_flipbook(fill, portal_entry.chapter == 3 and "bonus_door_fill2" or "bonus_door_fill")
		gui.set_color(fill, utility.tiled_hex_to_rgba("#FFFFFF"))
	elseif portal_entry.index == 0 then 
	
		gui.play_flipbook(border, 'ui_secret_C_Door_outline')
		gui.play_flipbook(fill, 'ui_secret_C_door_fill')
	
		local keyamount = savemanager.get_keyamount({chapter = 2})
		if keyamount == 10 then
			
			gui.play_flipbook(fill,"ui-levelportal-fill")
			gui.set_color(fill, utility.tiled_hex_to_rgba("#fbf865"))
			gui.set_color(border, utility.tiled_hex_to_rgba("#4e0d69"))
		end
		
		local offset = vmath.vector3(-4,14,0)
		gui.set_position(border, offset)
		gui.set_size(border, vmath.vector3(44,50,0))
	elseif portal_entry.chapter == 1 then
		gui.play_flipbook(border, "c" .. portal_entry.chapter .. "_bossportal_border")
		gui.play_flipbook(fill, "c" .. portal_entry.chapter .. "_bossportal_fill")
		gui.set_size(border, vmath.vector3(size.x * 2,size.x * 2,0))
		gui.set_size(fill, vmath.vector3(size.x * 2,size.x * 2,0))
		gui.set_size(button, vmath.vector3(size.x * 2,size.x * 2,0))
		position.x = position.x - size.x
		position.y = position.y + size.x
		gui.set_enabled(floor, false)
	elseif portal_entry.chapter == 2 then
		gui.play_flipbook(border, "c" .. portal_entry.chapter .. "_bossportal_border")
		gui.play_flipbook(fill, "c" .. portal_entry.chapter .. "_bossportal_fill")
		gui.set_size(border, vmath.vector3(size.x * 2,size.x * 2,0))
		gui.set_size(fill, vmath.vector3(size.x * 2,size.x * 2,0))
		gui.set_size(button, vmath.vector3(size.x * 2,size.x * 2,0))
		gui.set_position(fill, vmath.vector3(0,-2,0))
		position.x = position.x - size.x
		position.y = position.y + size.x
		gui.set_enabled(floor, false)
	elseif portal_entry.chapter == 3 and portal_entry.index == 8 then
		gui.play_flipbook(border, "c3_minibossportal_border")
		gui.set_size(border, vmath.vector3(40,48,0))
		gui.set_position(border, vmath.vector3(-2,12,0))
	elseif portal_entry.chapter == 3 and portal_entry.index == 16 then
		gui.play_flipbook(border, "c" .. portal_entry.chapter .. "_bossportal_border")
		gui.play_flipbook(fill, "c" .. portal_entry.chapter .. "_bossportal_fill")
		gui.set_size(border, vmath.vector3(size.x * 2.5,size.x * 2.5,0))
		gui.set_size(fill, vmath.vector3(size.x * 2.5,size.x * 2.5,0))
		gui.set_size(button, vmath.vector3(size.x * 2.5,size.x * 2.5,0))
		position.x = position.x - size.x*2.5/2
		position.y = position.y + size.x*2.5/2
		gui.set_enabled(floor, false)
	end
	gui.set_position(portal_entry.tree[portal_entry.id .. "/root"], position)
end

local function lvlselection_hoveranim(self)
	local amplitude = self.lvlselection_hover_amplitude or 2
	gui.cancel_animations(self.node_img_lvlselection, "position.y")
	gui.animate(self.node_img_lvlselection, "position.y", self.initpos_lvlselection.y + amplitude, gui.EASING_LINEAR, 0.25, 0,
		function()
			gui.animate(self.node_img_lvlselection, "position.y", self.initpos_lvlselection.y, gui.EASING_LINEAR, 0.25, 0,
				function()
					lvlselection_hoveranim(self)
				end)
		end)
end

local function show_selection_at_portal(self, portal, color)
	local arrow_pos, text_pos, hover_amplitude = get_selection_positions(portal)
	gui.set_color(self.node_img_lvlselection, color)
	gui.set_enabled(self.node_img_lvlselection, true)
	gui.set_enabled(self.node_text_pressspace, true)

	self.lvlselection_hover_amplitude = hover_amplitude
	self.initpos_lvlselection = arrow_pos
	gui.set_position(self.node_img_lvlselection, self.initpos_lvlselection)
	if self.node_text_pressspace then
		gui.set_position(self.node_text_pressspace, text_pos)
	end
	lvlselection_hoveranim(self)
end

local function set_nextlevel_highlight(self)
	local chapter = level_select_info.current_chapter
	local portal_amount = chapterinfo.portal_count_by_chapter(chapter)
	local highest = highest_index_portal[chapter]
	local portal_to_check = { chapter = chapter, portal = highest, level = 5 }

	if highest == portal_amount then
		if savemanager.get_conquered_state_by_portal(portal_to_check) == false then
			for _, portal in ipairs(portals) do
				if portal.chapter == chapter and portal.index == highest then
					gui.set_color(get_portal_node(portal, "fill"), chapterinfo.color_autohighlight)
					show_selection_at_portal(self, portal, chapterinfo.color_autohighlight)
					break
				end
			end
		end
	elseif highest > 0 then
		if savemanager.get_conquered_state_by_portal(portal_to_check) == false then
			for _, portal in ipairs(portals) do
				if portal.chapter == chapter and portal.index == highest then
					gui.set_color(get_portal_node(portal, "fill"), chapterinfo.color_autohighlight)
					show_selection_at_portal(self, portal, chapterinfo.color_autohighlight)
					break
				end
			end
		end
	end
end

local function clear_selection_ui(self)
	gui.set_enabled(self.node_img_lvlselection, false)
	if self.node_text_pressspace then
		gui.set_enabled(self.node_text_pressspace, false)
	end
	gui.cancel_animations(self.node_img_lvlselection, "position.y")
end

local function set_death_counters()
	for i = 1, 3 do
		gui.set_text(gui.get_node("txt_deathcount_c" .. i), savemanager.get_deaths())
	end
end


local function popups()
	local my_url = msg.url()
	local function acquire_input_focus() msg.post(my_url, "acquire_input_focus") end
	local function release_input_focus() msg.post(my_url, "release_input_focus") end

    local popup_opened = false
    if _IS_IOS or _IS_ANDROID then
        if savemanager.data.stats.popup_rateme == 0 then
            
            local min_levels = gamemanager.remote_parameters.rateme_minimum_level_amount or 5
            if gamemanager.currentlevel.chapter == 1 and (gamemanager.currentlevel.level > 1) and savemanager.get_amount_of_completed_levels() >= min_levels then
    
                
                timer.delay(0.5, false, function()
                    monarch.show(hash("RATEME"), nil, {
                        on_close = function ()
                            acquire_input_focus()
                        end,
                    })
                end)
                popup_opened = true
                release_input_focus()
            end
        end
    end

	-- Offline edition: do not schedule the retired community promotion.


    if popup_opened == false then
        timer.delay(0.5, false, function()
			acquire_input_focus()
        end)
    end
end



local function initialize(self)
	for chapter = 1, 3 do
		local highest = savemanager.get_furthest_conquered_portal_by_chapter(chapter)
		local portal_amount = chapterinfo.portal_count_by_chapter(chapter)

		if highest == 0 then
			highest = 1
		elseif highest < portal_amount then
			highest = highest + 1
		end
		highest_index_portal[chapter] = highest
	end

	for _, portal in ipairs(portals) do
		local chapter = portal.chapter
		local index = portal.index
		local fill = get_portal_node(portal, "fill")
		local border = get_portal_node(portal, "border")
		local floor = get_portal_node(portal, "floor")

		if index <= highest_index_portal[chapter] then
			local newcolor = chapterinfo.get_color_by_chapter(chapter, "portal_fill_idle", index)
			if portal.index == 0 and savemanager.get_keyamount({chapter = 2}) ~= 10 then newcolor = utility.tiled_hex_to_rgba("#FFFFFF") end
			gui.set_color(fill, newcolor)
			gui.set_color(border, chapterinfo.get_color_by_chapter(chapter, "portal_fill_border", index))
		else
			gui.set_color(border, chapterinfo.get_color_by_chapter(chapter, "portal_floor_color"))
			gui.set_color(fill, chapterinfo.get_color_by_chapter(chapter, "portal_fill_locked"))
		end

		gui.set_color(floor, chapterinfo.get_color_by_chapter(chapter, "portal_floor_color"))

		if get_worldname(chapter, index) == "" then
			swap_door_sprites(portal)
		end
	end

	for key, value in pairs(level_select_info.sublevels) do

		local farthest = savemanager.get_furthest_conquered_portal_by_chapter(value.chapter)
		local warp_tree = gui.get_tree(gui.get_node("level-select-warp_" .. value.portal_layout .. "/root"))

		gui.set_enabled(warp_tree["level-select-warp_" .. value.portal_layout .. "/warp_fill_top"], farthest >= value.portal_unlock_requirement)
		local colors = chapterinfo.warp_colors[value.chapter]
		gui.set_color(warp_tree["level-select-warp_" .. value.portal_layout .. "/warp_fill"], farthest >= value.portal_unlock_requirement and colors.base or colors.inactive)

		local counter = gui.get_node("sublevel_counter_" .. value.portal_layout)
		gui.set_enabled(counter, farthest >= value.portal_unlock_requirement)
		local counter_text = gui.get_node("txt_keys_" .. value.portal_layout)
		local completed = level_select_info.get_highest_completed_sublevel_portal(value.portal_layout, value.portal_start, value.levels)
		gui.set_text(counter_text, completed .. "/" .. value.levels)
	end

	
	gui.set_enabled(gui.get_node(ui_buttons[7] .. "_button"), _IS_STEAM)

	set_speedrun_time()

	set_death_counters()

	set_nextlevel_highlight(self)

	popups()
gui.set_enabled(gui.get_node("infinite_mode_button"), false)

end

local function chapter_button_hover(self,action_id,action)
	for _, value in ipairs(chapter_buttons) do
		local newcolor
		if gui.pick_node(value.node, action.x, action.y) then
			newcolor = value.chapter ~= 2 and chapterinfo.colors_chapterbuttons.to_c2.hover or (value.is_forward and chapterinfo.colors_chapterbuttons.to_c3.hover or chapterinfo.colors_chapterbuttons.to_c1.hover)
		else 
			newcolor = value.chapter ~= 2 and chapterinfo.colors_chapterbuttons.to_c2.idle or (value.is_forward and chapterinfo.colors_chapterbuttons.to_c3.idle or chapterinfo.colors_chapterbuttons.to_c1.idle)
		end
		gui.set_color(value.fill, newcolor)
	end
end

local function portal_button_hover(self, action_id, action)
	local chapter = level_select_info.current_chapter
	local portal_amount = chapterinfo.portal_count_by_chapter(chapter)
	local highest = highest_index_portal[chapter]
	local level_name_node = self.level_name_nodes[chapter]
	action.x = action.x or 0
	action.y = action.y or 0

	for _, portal in ipairs(portals) do
		if portal.chapter == chapter then
			local index = portal.index
			local hitbox = get_portal_node(portal, "button_hitbox")
			local fill = get_portal_node(portal, "fill")

			if gui.is_enabled(hitbox) and gui.pick_node(hitbox, action.x, action.y) then
				if self.currenthover == nil then
					if portal.index == 0 and savemanager.get_keyamount({chapter = 2}) ~= 10 then
						return
					end
					if index <= highest then
						local portalname = get_worldname(chapter, index)
						gui.set_text(level_name_node, portalname)
						localization_helper.init({ txt_levelname = "level_name_display_chapter_" .. chapter .. "/txt_levelname" })
						local position = gui.get_position(level_name_node)
						if savemanager.get_language() == "简体中文" or savemanager.get_language() == "繁體中文" or savemanager.get_language() == "日本語" then
							position.y = -20
						else
							position.y = -18
						end
						gui.set_position(level_name_node, position)
					end
					self.currenthover = portal

					if index <= highest then
						local selection_color = chapterinfo.get_color_by_chapter(chapter, "portal_fill_hover")
						

						if portal.index == 0 and savemanager.get_keyamount({chapter = 2}) ~= 10 then
							gui.set_enabled(self.node_img_lvlselection, false)
							gui.set_enabled(self.node_text_pressspace, false)
						else
							show_selection_at_portal(self, portal, selection_color)
						end
						gui.set_color(fill, portal.index == -1 and utility.tiled_hex_to_rgba("#FFFFFF") or selection_color)

						if index ~= highest and highest ~= portal_amount and highest > 0 then
							for _, highlight_portal in ipairs(portals) do
								if highlight_portal.chapter == chapter and highlight_portal.index == highest then
									local doorcolors = chapterinfo.doorcolors["c" .. chapter]
									gui.set_color(get_portal_node(highlight_portal, "fill"), doorcolors[highest].back)
									break
								end
							end
						end
					end
				end
			elseif self.currenthover == portal then
				local newcolor = (index <= highest)
					and chapterinfo.get_color_by_chapter(chapter, "portal_fill_idle", index)
					or chapterinfo.get_color_by_chapter(chapter, "portal_fill_locked")

				if portal.index == 0 and savemanager.get_keyamount({chapter = 2}) ~= 10 then newcolor = utility.tiled_hex_to_rgba("#FFFFFF") end
				gui.set_color(fill, newcolor)
				clear_selection_ui(self)
				self.currenthover = nil

				set_nextlevel_highlight(self)
			end
		end
	end

	if self.currenthover == nil then
		local portal_to_check = { chapter = chapter, portal = highest, level = 1 }
		if savemanager.get_conquered_state_by_portal(portal_to_check) == true then
			clear_selection_ui(self)
		end
		gui.set_text(level_name_node, "")
	end
end

local function on_chapter_changed(self,no_anim)
	local duration = no_anim and 0 or .8
	clear_selection_ui(self)
	self.currenthover = nil
	for _, level_name_node in ipairs(self.level_name_nodes) do
		gui.set_text(level_name_node, "")
	end
	gamemanager.currentlevel.chapter = level_select_info.current_chapter

	
	gui.animate(gui.get_node("GAMESCREEN"), "position.x", -(CHAPTER_X_OFFSET * level_select_info.current_chapter - CHAPTER_X_OFFSET), gui.EASING_OUTEXPO, duration,0,function ()
		self.input_disabled = false
		set_nextlevel_highlight(self)
	end)

	gui.animate(gui.get_node("speedrun_text"), "color.w", 0, gui.EASING_LINEAR, duration*.25, 0, function ()
		
		gui.animate(gui.get_node("speedrun_text"), "color.w", 1, gui.EASING_LINEAR, duration*.75)
	end)

	set_speedrun_time()

	gui.animate(gui.get_node("title_suffix_c2"), "color.w", level_select_info.current_chapter == 2 and 1 or 0, gui.EASING_LINEAR, duration*.5)
	gui.animate(gui.get_node("title_suffix_c3"), "color.w", level_select_info.current_chapter == 3 and 1 or 0, gui.EASING_LINEAR, duration*.5)
	gui.animate(gui.get_node("title_text"), "color", chapterinfo.title_colors[level_select_info.current_chapter], gui.EASING_LINEAR, duration*.5)

	for i = 1, 3 do
		local left_border = gui.get_tree(gui.get_node("left_cloud_border_" .. i))
		local right_border = gui.get_tree(gui.get_node("right_cloud_border_" .. i))
		local backdrop_left = gui.get_node("clouds_backdrop_left")
		local backdrop_right = gui.get_node("clouds_backdrop_right")
		local left_background = left_border["background_left_" .. i]
		local right_background = right_border["background_right_" .. i]
		local left_layer_1 = left_border["cloud_layer_1_left_" .. i]
		local left_layer_2 = left_border["cloud_layer_2_left_" .. i]
		local right_layer_1 = right_border["cloud_layer_1_right_" .. i]
		local right_layer_2 = right_border["cloud_layer_2_right_" .. i]

		local cloud_animation_duration = no_anim and 0 or .4

		gui.animate(left_background, "color", chapterinfo.cloud_colors[level_select_info.current_chapter].background, gui.EASING_INOUTCIRC, cloud_animation_duration)
		gui.animate(right_background, "color", chapterinfo.cloud_colors[level_select_info.current_chapter].background, gui.EASING_INOUTCIRC, cloud_animation_duration)
		gui.animate(backdrop_left, "color", chapterinfo.cloud_colors[level_select_info.current_chapter].background, gui.EASING_INOUTCIRC, cloud_animation_duration)
		gui.animate(backdrop_right, "color", chapterinfo.cloud_colors[level_select_info.current_chapter].background, gui.EASING_INOUTCIRC, cloud_animation_duration)
		
		gui.animate(left_layer_1, "color", chapterinfo.cloud_colors[level_select_info.current_chapter].layer_1, gui.EASING_INOUTCIRC, cloud_animation_duration)
		gui.animate(right_layer_1, "color", chapterinfo.cloud_colors[level_select_info.current_chapter].layer_1, gui.EASING_INOUTCIRC, cloud_animation_duration)

		gui.animate(left_layer_2, "color", chapterinfo.cloud_colors[level_select_info.current_chapter].layer_2, gui.EASING_INOUTCIRC, cloud_animation_duration)
		gui.animate(right_layer_2, "color", chapterinfo.cloud_colors[level_select_info.current_chapter].layer_2, gui.EASING_INOUTCIRC, cloud_animation_duration)
	end


	msg.post(gamemanager.url_letterbox, "set_color", {color = chapterinfo.sublevel_colors[level_select_info.current_chapter].background, mult = 1 })
	msg.post("@render:", "clear_color", { color = chapterinfo.sublevel_colors[level_select_info.current_chapter].background})

	for _, ui_button_entry in ipairs(ui_buttons) do
		if ui_button_entry == ui_buttons[7] then return end			
		local tree = gui.get_tree(gui.get_node(ui_button_entry .. "_button"))
		local background = tree[ui_button_entry .. "_button"]
		local shadow = tree[ui_button_entry .. "_button_bottom"]

		gui.animate(background, "color", chapterinfo.button_colors[level_select_info.current_chapter].background, gui.EASING_LINEAR, duration*.5)
		gui.animate(shadow, "color", chapterinfo.button_colors[level_select_info.current_chapter].shadow, gui.EASING_LINEAR, duration*.5)
	end

	msg.post(gamemanager.url_transition, "do_color", { chapter_index = level_select_info.current_chapter})
end

local function chapter_button_press(self,action_id,action)
	for _, chapter_button_entry in ipairs(chapter_buttons) do
		if gui.pick_node(chapter_button_entry.node, action.x, action.y) then
			self.input_disabled = true
			
			level_select_info.current_chapter = chapter_button_entry.is_forward and level_select_info.current_chapter + 1 or level_select_info.current_chapter - 1
			msg.post(soundmanager.audioref, soundmanager.triggers.sfx_play, { name = soundmanager.sfx_components.ui_click })

			on_chapter_changed(self)
			return true
		end
	end
end

local function portal_button_press(self, action_id, action)
	for _, portal in ipairs(portals) do
		local chapter = level_select_info.current_chapter
		if chapter == level_select_info.current_chapter then
			local hitbox = get_portal_node(portal, "button_hitbox")
			if gui.is_enabled(hitbox) and gui.pick_node(hitbox, action.x, action.y) and portal.index <= highest_index_portal[chapter] then
				if chapter == 2 and portal.index == 0 and savemanager.get_keyamount({chapter = 2}) ~= 10 then return end

				local last_sublevel_in_portal = savemanager.get_last_played_level({chapter = chapter, portal = portal.index})
				local to_load = {chapter, portal.index, last_sublevel_in_portal}
				if portal.index == -1 then
					to_load = chapterinfo.ending_levels[chapter]
				end

				gamemanager.currentlevel.chapter = to_load[1]
				gamemanager.currentlevel.portal = to_load[2]
				gamemanager.currentlevel.level = to_load[3]

				msg.post(soundmanager.audioref, soundmanager.triggers.sfx_play, { name = soundmanager.sfx_components.ui_click })
				msg.post(soundmanager.audioref, soundmanager.triggers.music_stop, { name = soundmanager.music_components.theme, fadetime = 1 })
				msg.post(".", "release_input_focus")
				msg.post(gamemanager.url_transition, "do_anim", { collection_to_load = gamemanager.collections.level, chapter_index = chapter})
				gamemanager.is_versusmode = false
				gamemanager.is_speedrunmode = false
				gamemanager.portalstarted()
				return true
			end
		end
	end
end

local function ui_button_press(self,action_id,action)
	for index, value in ipairs(ui_buttons) do
		if gui.pick_node(gui.get_node(value .. "_button"), action.x, action.y) and gui.is_enabled(gui.get_node(value .. "_button")) then
			utility.button_press_animation(value)

			if value == ui_buttons[1] then 
				local my_url = msg.url()
				local function acquire_input_focus() msg.post(my_url, "acquire_input_focus") end
				local function release_input_focus() msg.post(my_url, "release_input_focus") end

				monarch.show(hash("MENU-SETTINGS"), nil, {
                        on_close = function ()
                            acquire_input_focus()
                        end,
                    })
				release_input_focus()
				msg.post(soundmanager.audioref, soundmanager.triggers.sfx_play, { name = soundmanager.sfx_components.ui_click })
				
			elseif value == ui_buttons[2] then 
				msg.post(gamemanager.url_transition, "do_color", { chapter_index = 1})
				msg.post(soundmanager.audioref, soundmanager.triggers.sfx_play, { name = soundmanager.sfx_components.ui_click })
				msg.post(gamemanager.url_transition, "do_anim", { collection_to_load = gamemanager.collections.modeselect })
			
			elseif value == ui_buttons[3] then 
				
				msg.post(soundmanager.audioref, soundmanager.triggers.sfx_play, { name = soundmanager.sfx_components.ui_click })
				utility.button_press_animation("remove_ads")

				local my_url = msg.url()
				
				local function on_success()
					msg.post(my_url, "disable_removeads")
				end
				
				if devicestore.has_remove_ads() then
					on_success()
					return
				end
				
				
				timer.delay(0.25, false, function ()
					devicestore.buy(devicestore.get_product_ids().remove_ads, on_success)
				end)

				
				_AMP_EVENTS.IAP_PRESSED.properties.purchase_id = devicestore.get_product_ids().remove_ads or "unknown"
				_AMP_EVENTS.IAP_PRESSED.properties.source = "level_select"
				analytics.track_AMPLITUDE_EVENT(_AMP_EVENTS.IAP_PRESSED)
				return
			elseif value == ui_buttons[4] then 
				msg.post(soundmanager.audioref, soundmanager.triggers.sfx_play, { name = soundmanager.sfx_components.ui_click })
				msg.post(".", "release_input_focus")

				gamemanager.currentlevel.chapter = level_select_info.current_chapter
				gamemanager.currentlevel.portal = 1
				gamemanager.currentlevel.level = 1
				gamemanager.is_versusmode = false
				gamemanager.is_speedrunmode = true

				local data = { collection_to_load = gamemanager.collections.level }
				msg.post(gamemanager.url_transition, "do_anim", data)
				msg.post("speedrun:/gui#speedrun", "timer_start")
				return
			elseif value == ui_buttons[5] then 
				msg.post(soundmanager.audioref, soundmanager.triggers.sfx_play, { name = soundmanager.sfx_components.ui_click })
				msg.post(soundmanager.audioref, soundmanager.triggers.music_stop, { name = soundmanager.music_components.theme, fadetime = 1 })
        		msg.post(soundmanager.audioref, soundmanager.triggers.music_play, {name = soundmanager.music_components.versus1, fadetime = 1})

				msg.post(gamemanager.url_letterbox, "set_color", {color = chapterinfo.sublevel_colors[1].background, mult = 1 })
				msg.post(gamemanager.url_transition, "do_color", { chapter_index = 1})
				gamemanager.is_versusmode = true
				gamemanager.prep_random_versus_level()
				local data = {collection_to_load = gamemanager.collections.level}
				msg.post(gamemanager.url_transition, "do_anim", data)

			elseif value == ui_buttons[6] then 
				gui.set_enabled(gui.get_node("LOADING_OVERLAY"), true)
				gui.play_flipbook(gui.get_node("loading_screen_icon"), "loading_animation")
				msg.post(soundmanager.audioref, soundmanager.triggers.sfx_play, { name = soundmanager.sfx_components.ui_click })

				local my_url = msg.url()
				local function acquire_input_focus() msg.post(my_url, "acquire_input_focus") end
				local function release_input_focus() msg.post(my_url, "release_input_focus") end
				release_input_focus()
				remote_config.check_editor_blocked(
					function (block_editor)
						if block_editor then
							timer.delay(1, false, function ()
								gui.set_enabled(gui.get_node("LOADING_OVERLAY"), false)
								gui.play_flipbook(gui.get_node("loading_screen_icon"), "loading_icon_1")
								gui.set_enabled(gui.get_node("editor_available_popup"), true)
							end)
							acquire_input_focus()
						else
							msg.post(gamemanager.url_letterbox, "set_color", {color = chapterinfo.sublevel_colors[1].background, mult = 1 })
							msg.post(gamemanager.url_transition, "do_color", { chapter_index = 1})
							local data = { collection_to_load = gamemanager.collections.level_browser}
							gamemanager.is_versusmode = false
							msg.post(gamemanager.url_transition, "do_anim", data)
							
							
							analytics.track_AMPLITUDE_EVENT(_AMP_EVENTS.CUSTOMEDIT_OPENED)
						end
					end
				)
			elseif value == ui_buttons[7] then
				sys.exit(0)
			end

			return true
		end
	end

	if gui.pick_node(gui.get_node("infinite_mode_button"), action.x, action.y) then
		do return end
	end

	if gui.is_enabled(gui.get_node("editor_available_popup")) then
		if gui.pick_node(gui.get_node("editor_available_button"), action.x, action.y) then
			utility.button_press_animation("editor_available")
			timer.delay(.3, false, function ()
				gui.set_enabled(gui.get_node("editor_available_popup"), false)
			end)
		end
	end

	if gui.is_enabled(gui.get_node("no_internet_popup")) then
		if gui.pick_node(gui.get_node("no_internet_button"), action.x, action.y) then
			utility.button_press_animation("no_internet")
			timer.delay(.3, false, function ()
				gui.set_enabled(gui.get_node("no_internet_popup"), false)
			end)
		end
	end
end

local function setup_key_counters(chapter)
	local key_text = utility.safe_get_node("txt_keys_c" .. chapter)
	local icon = utility.safe_get_node("img_key_c" .. chapter)
	local keyamount = savemanager.get_keyamount({chapter = chapter})
	local max_keys = savemanager.get_max_keys({chapter = chapter})
	if key_text and icon then
		gui.set_text(key_text,  keyamount .. "/" .. max_keys)
		gui.set_color(key_text, chapterinfo.key_colors[chapter])
		gui.set_color(icon, chapterinfo.key_colors[chapter])
	end
end

local function setup_ending_doors(chapter)
	local did_conquer = savemanager.get_conquered_state_by_chapter(chapter)
	gui.set_enabled(gui.get_node("ending_cover_c" .. chapter), not did_conquer)
	gui.set_enabled(gui.get_node(chapter .. "-ENDING/button_hitbox"), did_conquer)
	gui.set_enabled(gui.get_node(chapter .. "-ENDING/root"), did_conquer)
	if chapter == 1 then
		gui.set_enabled(gui.get_node("txt_keys_c" .. chapter), did_conquer)
		gui.set_enabled(gui.get_node("img_key_c" .. chapter), did_conquer)
	end
end

local function warp_button_press(self,action_id,action)
	for key, value in pairs(level_select_info.sublevels) do
		if value.chapter == level_select_info.current_chapter then
			local farthest = savemanager.get_furthest_conquered_portal_by_chapter(value.chapter)

			local base = "level-select-warp_" ..  value.portal_layout
			local tree = gui.get_tree(gui.get_node(base .. "/root"))
			if gui.is_enabled(tree[base .. "/root"]) and gui.pick_node(tree[base .. "/warp_base"], action.x, action.y) and farthest >= value.portal_unlock_requirement then
				level_select_info.current_sublevel = value
				if (not ads.ads_initialized) and (_IS_MOBILEAPP) and (_IS_DEFOLDEDITOR == false) then
					gui.set_enabled(gui.get_node("no_internet_popup"), true)
				else
					msg.post(soundmanager.audioref, soundmanager.triggers.sfx_play, { name = soundmanager.sfx_components.ui_click })
					local data = { collection_to_load = gamemanager.collections.sublevels, chapter_index = level_select_info.current_chapter }
					msg.post(gamemanager.url_transition, "do_anim", data)

					
					local portal_number = (value.portal_start - 99) + (value.chapter == 2 and 1 or value.chapter == 3 and 3 or 0)
					_AMP_EVENTS.PORTAL_OPENED.properties.map_number = value.chapter
					_AMP_EVENTS.PORTAL_OPENED.properties.portal_number = portal_number
					_AMP_EVENTS.PORTAL_LEVEL_STARTED.properties.portal_number = portal_number
					_AMP_EVENTS.PORTAL_LEVEL_COMPLETED.properties.portal_number = portal_number
					analytics.track_AMPLITUDE_EVENT(_AMP_EVENTS.PORTAL_OPENED)
				end
				return true
			end
		end
	end
end

local function warp_button_hover(self,action_id,action)
	for key, value in pairs(level_select_info.sublevels) do
		if value.chapter == level_select_info.current_chapter then
			local farthest = savemanager.get_furthest_conquered_portal_by_chapter(value.chapter)
			local base = "level-select-warp_" ..  value.portal_layout
			local tree = gui.get_tree(gui.get_node(base .. "/root"))
			local warp_base = tree[base .. "/warp_base"]
			local warp_top = tree[base .. "/warp_fill_top"]
			if gui.is_enabled(warp_base) and gui.pick_node(warp_base, action.x, action.y) and farthest >= value.portal_unlock_requirement then
				if gui.get_flipbook(warp_top) ~= hash("warp_selected") then
					gui.play_flipbook(warp_top, "warp_selected")
					gui.set_color(warp_base, chapterinfo.warp_colors[level_select_info.current_chapter].selected)
				end
			else 
				if gui.get_flipbook(warp_top) ~= hash("warp_idle") then
					gui.play_flipbook(warp_top, "warp_idle")
					gui.set_color(warp_base, chapterinfo.warp_colors[level_select_info.current_chapter].base)
				end
			end
		end
	end
end

function init(self)
	gui.set_render_order(gamemanager.gui_render_orders.menu_levelselect)
	gamemanager.set_current_collection(gamemanager.collections.levelselect)
	msg.post(".", "acquire_input_focus")
	msg.post(soundmanager.audioref, soundmanager.triggers.music_play, { name = soundmanager.music_components.theme, fadetime = 1 })

	gamemanager.currentlevel.chapter = level_select_info.current_chapter
	
	gui.animate(gui.get_node("GAMESCREEN"), "position.x", -(CHAPTER_X_OFFSET * level_select_info.current_chapter - CHAPTER_X_OFFSET), gui.EASING_OUTEXPO, 0,0,function ()
		set_nextlevel_highlight(self)
	end)

	table.insert(chapter_buttons, {
		node = gui.get_node("chapter_1_button_forward/button"),
		arrow = gui.get_node("chapter_1_button_forward/img-chapterbutton-arrow"),
		fill = gui.get_node("chapter_1_button_forward/img-chapterbutton-fill"),
		chapter = 1,
		is_forward = true,
	})
	table.insert(chapter_buttons, {
		node = gui.get_node("chapter_2_button_backward/button"),
		arrow = gui.get_node("chapter_2_button_backward/img-chapterbutton-arrow"),
		fill = gui.get_node("chapter_2_button_backward/img-chapterbutton-fill"),
		chapter = 2,
		is_forward = false,
	})
	table.insert(chapter_buttons, {
		node = gui.get_node("chapter_2_button_forward/button"),
		arrow = gui.get_node("chapter_2_button_forward/img-chapterbutton-arrow"),
		fill = gui.get_node("chapter_2_button_forward/img-chapterbutton-fill"),
		chapter = 2,
		is_forward = true,
	})
	table.insert(chapter_buttons, {
		node = gui.get_node("chapter_3_button_backward/button"),
		arrow = gui.get_node("chapter_3_button_backward/img-chapterbutton-arrow"),
		fill = gui.get_node("chapter_3_button_backward/img-chapterbutton-fill"),
		chapter = 3,
		is_forward = false,
	})

	local function blink(node)
        if node == nil then return end
	    gui.set_enabled(node, false) timer.delay(0.15, false, function() gui.set_enabled(node, true) timer.delay(2, false, function() blink(node) end) end)
    end

	local function infinite_mode_blink(tree)

	    gui.set_enabled(tree["infinite_mode_text_shadow_1"], false) 
	    gui.set_enabled(tree["infinite_mode_text_shadow_2"], false) 
	    gui.set_enabled(tree["infinite_mode_text_1"], false) 
	    gui.set_enabled(tree["infinite_mode_text_2"], false) 
		gui.play_flipbook(tree["infinite_mode_icon"], "shuffledoor_idle")
		timer.delay(0.4, false, function() 
			gui.set_enabled(tree["infinite_mode_text_shadow_1"], true) 
			gui.set_enabled(tree["infinite_mode_text_shadow_2"], true) 
			gui.set_enabled(tree["infinite_mode_text_1"], true) 
			gui.set_enabled(tree["infinite_mode_text_2"], true) 
			gui.play_flipbook(tree["infinite_mode_icon"], "shuffledoor_alt")
			timer.delay(1.5, false, function() 
				infinite_mode_blink(tree) 
			end) 

		end)
    end

	for _, value in ipairs(chapter_buttons) do
		blink(value.arrow)
	end
	timer.delay(1, false, function ()
		infinite_mode_blink(gui.get_tree(gui.get_node("infinite_mode_button")))
	end)

	for chapter = 1, 3 do
		for i = 1, chapterinfo.portal_count_by_chapter(chapter) do
			local id = chapter .. "-" .. i
			local root = utility.safe_get_node(id .. "/root")
			if root then
				table.insert(portals, {
					tree = gui.get_tree(root),
					id = id,
					chapter = chapter,
					index = i,
				})
			end
		end

		local id = chapter .. "-ENDING"
		local root = utility.safe_get_node(id .. "/root")
		if root then
			table.insert(portals, {
				tree = gui.get_tree(root),
				id = id,
				chapter = chapter,
				index = -1,
			})
		end

		setup_key_counters(chapter)
		setup_ending_doors(chapter)
	end

	table.insert(portals, {
		tree = gui.get_tree(utility.safe_get_node("2-0/root")),
		id = "2-0",
		chapter = 2,
		index = 0,
	})

	self.level_name_nodes = {
		gui.get_node("level_name_display_chapter_1/txt_levelname"),
		gui.get_node("level_name_display_chapter_2/txt_levelname"),
		gui.get_node("level_name_display_chapter_3/txt_levelname"),
	}

	self.node_img_lvlselection = gui.get_node("img_lvlselection")
	self.node_text_pressspace = utility.safe_get_node("txt_press_space")
	gui.set_enabled(self.node_img_lvlselection, false)
	gui.set_color(self.node_img_lvlselection, chapterinfo.get_color_by_chapter(level_select_info.current_chapter, "portal_fill_hover"))
	if self.node_text_pressspace and ((not device.desktop()) or (_IS_STEAMDECK)) then
		gui.set_visible(self.node_text_pressspace, false)
	end

	
	
	
	
	
	
	
	gui.set_enabled(gui.get_node("quit_button"), false)


	msg.post(gamemanager.url_letterbox, "set_color", {color = chapterinfo.sublevel_colors[level_select_info.current_chapter].background, mult = 1 })

	self.currenthover = nil
	initialize(self)
	on_chapter_changed(self,true)

	
	
	
	
	
	

	local show_ads = (devicestore.has_remove_ads() == false)
    gui.set_enabled(gui.get_node("remove_ads_button"), (not html5 and _IS_STEAM == false) and show_ads)
end

  



function on_message(self, message_id, message, sender)
    if message_id == hash("disable_removeads") then
        gui.set_enabled(gui.get_node("remove_ads_button"), false)
	elseif message_id == hash("popup_infinitemode") then
		gui.set_enabled(gui.get_node("editor_available_popup"), true)
    end
end

function on_input(self, action_id, action)

	if self.input_disabled then return end

	local cursorpos = gamemanager.get_cursorpos()
	if cursorpos == vmath.vector3() then
		cursorpos = vmath.vector3(action.x or 0,action.y or 0,0)
	end
	local is_pointer_action = action_id == hash("touch") or (action_id == hash("select")) or action_id == hash("space")
	local pressed = is_pointer_action and action.pressed
	local released = is_pointer_action and action.released
	local pressed_space = action.released and action_id == hash("space")

	action.x = cursorpos.x or 0
	action.y = cursorpos.y or 0

	if released then
		if chapter_button_press(self,action_id,action) then return true end
		
		if warp_button_press(self,action_id,action) then return true end
		if portal_button_press(self, action_id, action) then return true end
	elseif pressed then
		if ui_button_press(self,action_id,action) then 
			
			
			
			
			return true 	
		end
	else
		chapter_button_hover(self,action_id,action)
		portal_button_hover(self,action_id,action)
		warp_button_hover(self,action_id,action)
	end
	

	if pressed_space and self.current_hover == nil and not savemanager.get_conquered_state_by_chapter(level_select_info.current_chapter) then
		local highest_portal = highest_index_portal[level_select_info.current_chapter]
		local to_load = {level_select_info.current_chapter,highest_portal,savemanager.get_last_played_level({ chapter = level_select_info.current_chapter, portal = highest_portal })}

		gamemanager.currentlevel.chapter = to_load[1]
		gamemanager.currentlevel.portal = to_load[2]
		gamemanager.currentlevel.level = to_load[3]

		
		
		

		msg.post(soundmanager.audioref, soundmanager.triggers.sfx_play, { name = soundmanager.sfx_components.ui_click })
		msg.post(soundmanager.audioref, soundmanager.triggers.music_stop, { name = soundmanager.music_components.theme, fadetime = 1 })
		msg.post(".", "release_input_focus")
		msg.post(gamemanager.url_transition, "do_anim", { collection_to_load = gamemanager.collections.level })
		gamemanager.is_versusmode = false
		gamemanager.is_speedrunmode = false
		gamemanager.portalstarted()
	end
end
