local analytics = require("_services.analytics")
local level_editor = require("_modules.level_editor.level_editor")
local gamemanager = require("_modules.gamemanager")
local utility = require("_modules.utility")
local remote_config = require("_modules.remote_config.remote_config")
local savemanager = require("_modules.savemanager")
local soundmanager = require("_modules.soundmanager")

local block_uploaded_entries = false
local all_entry_data = {}
local row_pool = {}
local row_pool_initialized = false
local empty_entry_clones = {}
local show_uploaded_only = false
local empty_entry_base_position = nil
local entry_base_position = nil
local max_scroll_distance = 0
local content_height = 0
local scroll_entry_count = 0
local scroll_entry_height = 0
local scroll_entry_step = 0
local scroll_padding = 0
local SCROLL_DRAG_THRESHOLD = 10
local SCROLL_BAR_THUMB_MIN_HEIGHT = 8
local SCROLL_BAR_HITBOX_WIDTH = 64
local uploaded_entries = 0
local ROW_POOL_BUFFER = 2
local is_loading = false

local function lvlselection_hoveranim(node)
    gui.cancel_animations(node, "position.y")
    gui.animate(node, "position.y", 317.5 + 27.5, gui.EASING_LINEAR, 0.4, 0,
        function()
            gui.animate(node, "position.y", 317.5, gui.EASING_LINEAR, 0.4, 0,
                function()
                    lvlselection_hoveranim(node) 
                end)
        end)
end

local function init_scroll_entry_metrics(template_id, padding)
	local base_position = gui.get_position(gui.get_node(template_id))
	scroll_padding = padding
	scroll_entry_height = gui.get_size(gui.get_node(template_id)).y
	scroll_entry_step = math.abs(base_position.y * 2 - padding)
end

local function row_y_at_index(row_index)
	return entry_base_position.y + (entry_base_position.y * 2 - scroll_padding) * row_index
end

local function refresh_scroll_metrics(entry_count)
	scroll_entry_count = entry_count
	if entry_count <= 0 then
		content_height = 0
		max_scroll_distance = 0
		return
	end

	content_height = scroll_entry_height + scroll_entry_step * math.max(0, entry_count - 1)
	local viewport_height = gui.get_size(gui.get_node("scroll_view")).y
	max_scroll_distance = math.max(0, (content_height - viewport_height) + scroll_padding)
end

local function get_scroll_bar_thumb_metrics()
	local track_height = gui.get_size(gui.get_node("scroll_bar_track")).y
	local thumb_height = track_height * (gui.get_size(gui.get_node("scroll_view")).y / content_height)
	thumb_height = math.max(SCROLL_BAR_THUMB_MIN_HEIGHT, math.min(thumb_height, track_height))
	return thumb_height, track_height - thumb_height
end

local function update_scroll_bar(scroll_offset)
	local track = gui.get_node("scroll_bar_track")
	local thumb = gui.get_node("scroll_bar_thumb")
	local track_hitbox = gui.get_node("scroll_bar_track_hitbox")
	local thumb_hitbox = gui.get_node("scroll_bar_thumb_hitbox")

	if max_scroll_distance <= 0 or scroll_entry_count <= 0 then
		gui.set_enabled(track, false)
		gui.set_enabled(track_hitbox, false)
		return
	end

	gui.set_enabled(track, true)
	gui.set_enabled(track_hitbox, true)
	local thumb_height, max_thumb_travel = get_scroll_bar_thumb_metrics()
	local track_height = gui.get_size(track).y

	gui.set_size(thumb, vmath.vector3(gui.get_size(thumb).x, thumb_height, 0))
	gui.set_size(track_hitbox, vmath.vector3(SCROLL_BAR_HITBOX_WIDTH, track_height, 0))
	gui.set_size(thumb_hitbox, vmath.vector3(SCROLL_BAR_HITBOX_WIDTH, thumb_height, 0))

	local thumb_y = (scroll_offset / max_scroll_distance) * max_thumb_travel
	gui.set_position(thumb, vmath.vector3(0, -thumb_y, 0))
end

local function is_uploaded_entry(entry_value)
	return entry_value.type == "uploaded" or entry_value.type == "upload"
end

local function date_sort_key(date)
	date = date or {}
	local minute = date.min or date.minute or 0
	return (date.year or 0) * 100000000
		+ (date.month or 0) * 1000000
		+ (date.day or 0) * 10000
		+ (date.hour or 0) * 100
		+ minute
end

local function build_date_or_code_text(value)
	local date_or_code_text

	if value.type == "local" then
		date_or_code_text = "Last saved: "
	else
		date_or_code_text = "Uploaded: "
	end

	local current_date = os.date("*t")
	local save_date = value.date or {}
	if not next(save_date) then
		save_date.day = 0
		save_date.month = 0
		save_date.year = 0000
	end

	if current_date.day == save_date.day and current_date.month == save_date.month and current_date.year == save_date.year then
		date_or_code_text = date_or_code_text .. utility.hour_minute_format(save_date.hour, save_date.min)
	else
		date_or_code_text = date_or_code_text .. utility.date_key(save_date.year, save_date.month, save_date.day)
	end

	return date_or_code_text
end

local function apply_entry_to_row(slot, entry)
	local node = slot.node
	local date_or_code_text = entry.date_or_code_text

	if entry.type == "local" then
		gui.set_enabled(node["copy_button"], false)
		gui.set_enabled(node["play_button_edit_icon"], true)
		gui.set_enabled(node["play_button_edit_icon_shadow"], true)
		gui.set_enabled(node["play_button_play_icon"], false)
		gui.set_color(node["entry_template_background"], utility.tiled_hex_to_rgba("#c57d17"))
		gui.set_color(node["entry_template_background_shadow"], utility.tiled_hex_to_rgba("#945e11"))
	else
		gui.set_enabled(node["copy_button"], true)
		gui.set_enabled(node["play_button_edit_icon"], false)
		gui.set_enabled(node["play_button_edit_icon_shadow"], false)
		gui.set_enabled(node["play_button_play_icon"], true)
		gui.set_color(node["entry_template_background"], utility.tiled_hex_to_rgba("#e36821"))
		gui.set_color(node["entry_template_background_shadow"], utility.tiled_hex_to_rgba("#3b0800"))
	end

	gui.set_text(node["level_name_text"], string.upper(entry.name))
	gui.set_text(node["level_code_text"], date_or_code_text)
	gui.set_enabled(node["level_entry_template"], true)
if slot.copy_button then gui.set_enabled(slot.copy_button, false) end

end

local function disable_row_pool()
	for _, slot in ipairs(row_pool) do
		gui.set_enabled(slot.node["level_entry_template"], false)
		slot.data_index = nil
	end
end

local function ensure_row_pool()
	if row_pool_initialized then
		return
	end

	local padding = 2.5
	init_scroll_entry_metrics("level_entry_template", padding)
	entry_base_position = gui.get_position(gui.get_node("level_entry_template"))

	local viewport_height = gui.get_size(gui.get_node("scroll_view")).y
	local pool_size = math.ceil(viewport_height / scroll_entry_step) + ROW_POOL_BUFFER

	for _ = 1, pool_size do
		local node = gui.clone_tree(gui.get_node("level_entry_template"))
		gui.set_enabled(node["level_entry_template"], false)
		table.insert(row_pool, {
			node = node,
			button = node["play_button"],
			edit_icon = node["play_button_edit_icon"],
			edit_icon_shadow = node["play_button_edit_icon_shadow"],
			play_icon = node["play_button_play_icon"],
			copy_button = node["copy_button"],
			data_index = nil,
		})
	end

	row_pool_initialized = true
end

local function update_visible_rows(scroll_offset)
	if #all_entry_data == 0 or not entry_base_position then
		disable_row_pool()
		return
	end

	local first_row = math.max(0, math.floor(scroll_offset / scroll_entry_step))
	local start_row = math.max(0, first_row - 1)

	for slot_index, slot in ipairs(row_pool) do
		local row_index = start_row + slot_index - 1
		local data_index = row_index + 1

		if data_index <= #all_entry_data then
			local entry = all_entry_data[data_index]
			apply_entry_to_row(slot, entry)
			local position = vmath.vector3(
				entry_base_position.x,
				row_y_at_index(row_index),
				entry_base_position.z
			)
			gui.set_position(slot.node["level_entry_template"], position)
			slot.data_index = data_index
		else
			gui.set_enabled(slot.node["level_entry_template"], false)
			slot.data_index = nil
		end
	end
end

local function set_scroll_offset(scroll_offset)
	local content = gui.get_node("scroll_view_content")
	local pos = gui.get_position(content)
	scroll_offset = vmath.clamp(scroll_offset, 0, max_scroll_distance)
	gui.set_position(content, vmath.vector3(pos.x, scroll_offset, 0))
	update_scroll_bar(scroll_offset)
	update_visible_rows(scroll_offset)
end

local function scroll_to_track_position(screen_x, screen_y)
	local thumb_height, max_thumb_travel = get_scroll_bar_thumb_metrics()
	if max_thumb_travel <= 0 then
		return
	end

	local track = gui.get_node("scroll_bar_track")
	local local_pos = gui.screen_to_local(track, vmath.vector3(screen_x, screen_y, 0))
	local thumb_y = vmath.clamp(-local_pos.y - thumb_height * 0.5, 0, max_thumb_travel)
	set_scroll_offset((thumb_y / max_thumb_travel) * max_scroll_distance)
end

local function clear_empty_entry_clones()
	for _, node in ipairs(empty_entry_clones) do
		pcall(gui.delete_node, node["empty_entry_template"])
	end
	empty_entry_clones = {}
end

local function reset_empty_entry_template()
	local empty_entry = gui.get_tree(gui.get_node("empty_entry_template"))
	gui.set_enabled(empty_entry["empty_entry_template"], false)
	if empty_entry["empty_entry_text"] then
		gui.set_enabled(empty_entry["empty_entry_text"], false)
	end
	if empty_entry_base_position then
		gui.set_position(empty_entry["empty_entry_template"], empty_entry_base_position)
	end
end

local function reset_scroll_view()
	disable_row_pool()
	clear_empty_entry_clones()
	reset_empty_entry_template()

	local scroll_content = gui.get_node("scroll_view_content")
	local scroll_pos = gui.get_position(scroll_content)
	gui.set_position(scroll_content, vmath.vector3(scroll_pos.x, 0, scroll_pos.z))
end

local function build_all_entry_data()
	all_entry_data = {}
	uploaded_entries = 0

	local sortable_entries = {}
	for slot_index, value in pairs(level_editor.save_slots) do
		if type(value) == "table" and next(value) then
			if not show_uploaded_only or is_uploaded_entry(value) then
				if block_uploaded_entries then
					if value.type == "local" then 
						table.insert(sortable_entries, { slot_index = slot_index, value = value })
					end
				else 
					table.insert(sortable_entries, { slot_index = slot_index, value = value })
				end
			end
		end
	end

	
	

	
	
	

	table.sort(sortable_entries, function(a, b)
		return date_sort_key(a.value.date) > date_sort_key(b.value.date)
	end)

	for _, entry in ipairs(sortable_entries) do
		local value = entry.value
		if value.type ~= "local" then
			uploaded_entries = uploaded_entries + 1
		end

		local name = value.name
		name = name == "" and "unnamed level" or name

		table.insert(all_entry_data, {
			name = name,
			date_or_code_text = build_date_or_code_text(value),
			level_data = value.data,
			level_code = value.code,
			type = value.type,
			save_slot_index = entry.slot_index,
		})
	end
end

local function initialize_entries()
	reset_scroll_view()
	ensure_row_pool()

	local padding = 2.5
	if not entry_base_position then
		init_scroll_entry_metrics("level_entry_template", padding)
		entry_base_position = gui.get_position(gui.get_node("level_entry_template"))
	end

	if not empty_entry_base_position then
		empty_entry_base_position = gui.get_position(gui.get_node("empty_entry_template"))
	end

	local filename = sys.get_save_file("leveldevil", "save_slots")
	local data = sys.load(filename)
	if data then
		level_editor.save_slots = data
	end

	build_all_entry_data()

	if uploaded_entries == 0 then
		gui.set_color(gui.get_node("uploaded_levels_button"), utility.tiled_hex_to_rgba("#e89928"))
		gui.set_color(gui.get_node("uploaded_levels_button_bottom"), utility.tiled_hex_to_rgba("#da8f25"))
	end

	pprint("Number of Entries: " .. #all_entry_data)

	if #all_entry_data == 0 then
		for index = 1, 3 do
			local node = gui.clone_tree(gui.get_node("empty_entry_template"))
			local position = vmath.vector3(entry_base_position.x, row_y_at_index(index - 1), entry_base_position.z)
			gui.set_position(node["empty_entry_template"], position)
			gui.set_enabled(node["empty_entry_template"], true)

			if index == 1 and not show_uploaded_only then
				gui.set_enabled(node["empty_entry_text"], true)
			end

			table.insert(empty_entry_clones, node)
		end
		init_scroll_entry_metrics("empty_entry_template", padding)
		refresh_scroll_metrics(3)
	else
		local empty_entry = gui.get_tree(gui.get_node("empty_entry_template"))
		local position = vmath.vector3(entry_base_position.x, row_y_at_index(#all_entry_data), entry_base_position.z)
		gui.set_position(empty_entry["empty_entry_template"], position)
		gui.set_enabled(empty_entry["empty_entry_template"], true)
		refresh_scroll_metrics(#all_entry_data + 1)
	end

	set_scroll_offset(0)

	
	gui.set_enabled(gui.get_node("loading_screen_icon"), false)
	gui.set_enabled(gui.get_node("loading_screen_overlay"), false)
	is_loading = false
	gui.play_flipbook(gui.get_node("loading_screen_icon"),"loading_icon_1")

end

local function animate_copy_to_clipboard_popup()
	gui.set_enabled(gui.get_node("copy_to_clipboard_popup_outline"), true)
	gui.animate(gui.get_node("copy_to_clipboard_popup_outline"), "position.y", -435, gui.EASING_LINEAR, .2)
	timer.delay(5, false, function ()
		gui.animate(gui.get_node("copy_to_clipboard_popup_outline"), "position.y", -500, gui.EASING_LINEAR, .2,0,function ()
			gui.set_enabled(gui.get_node("copy_to_clipboard_popup_outline"), false)
		end)
	end)
end

function init(self)
	
	gui.set_enabled(gui.get_node("loading_screen_icon"), true)
	gui.set_enabled(gui.get_node("loading_screen_overlay"), true)
	gui.play_flipbook(gui.get_node("loading_screen_icon"),"loading_animation")
	is_loading = true
	msg.post(soundmanager.audioref, soundmanager.triggers.music_play, { name = soundmanager.music_components.theme, fadetime = 1 })
	remote_config.check_editor_blocked(function (block_editor)
		block_uploaded_entries = block_editor
		initialize_entries()
		msg.post(".", "acquire_input_focus")
	end)
	
	gui.set_render_order(gamemanager.gui_render_orders.menu_level_editor_saves)
end

 



  



function on_message(self, message_id, message, sender)
	if message_id == hash("show_uploaded_only") then
		show_uploaded_only = message.enabled ~= false
		initialize_entries()
	end
end

function on_input(self, action_id, action)

	local cursorpos = gamemanager.get_cursorpos()
	if cursorpos == vmath.vector3() then
		cursorpos = vmath.vector3(action.x or 0,action.y or 0,0)
	end

	action.x = cursorpos.x or 0
	action.y = cursorpos.y or 0

	local pressed = (action_id == hash("WIPTOUCH") or action_id == hash("select") or action_id == hash("space") or action_id == hash("touch")) and action.pressed
	local released = (action_id == hash("WIPTOUCH") or action_id == hash("select") or action_id == hash("space") or action_id == hash("touch")) and action.released

	if pressed then
		self.did_scroll = false
		self.touch_start_pos = vmath.vector3(action.x, action.y, 0)

		if gui.pick_node(gui.get_node("exit_button"), action.x, action.y) then
			msg.post(soundmanager.audioref, soundmanager.triggers.sfx_play, { name = soundmanager.sfx_components.ui_click })
			utility.button_press_animation("exit")
			local data = {collection_to_load = gamemanager.collections.levelselect_c1}
			msg.post(gamemanager.url_transition, "do_anim", data)
		end
		if gui.is_enabled(gui.get_node("back_button")) and gui.pick_node(gui.get_node("back_button"), action.x, action.y) then
			msg.post(soundmanager.audioref, soundmanager.triggers.sfx_play, { name = soundmanager.sfx_components.ui_click })
			utility.button_press_animation("back")
			local data = {collection_to_load = gamemanager.collections.level_editor_modeselect}
			msg.post(gamemanager.url_transition, "do_anim", data)
		end
		if gui.pick_node(gui.get_node("browser_button"), action.x, action.y) then
			msg.post(soundmanager.audioref, soundmanager.triggers.sfx_play, { name = soundmanager.sfx_components.ui_click })
			gui.play_flipbook(gui.get_node("browser_button"), "browser_door_selected")
			timer.delay(.3, false, function ()
				gui.play_flipbook(gui.get_node("browser_button"), "browser_door_default")
			end)
			local data = {collection_to_load = gamemanager.collections.level_browser}
			msg.post(gamemanager.url_transition, "do_anim", data)
		end
		if gui.pick_node(gui.get_node("create_new_save_button"), action.x, action.y) then
			msg.post(soundmanager.audioref, soundmanager.triggers.sfx_play, { name = soundmanager.sfx_components.ui_click })
			utility.button_press_animation("create_new_save")
			
			level_editor.save_slot_to_load = #level_editor.save_slots + 1
			level_editor.new_save = true
			local data = {collection_to_load = gamemanager.collections.level_editor}
			msg.post(gamemanager.url_transition, "do_anim", data)

		end
		if gui.pick_node(gui.get_node("all_levels_button"), action.x, action.y) then
			msg.post(soundmanager.audioref, soundmanager.triggers.sfx_play, { name = soundmanager.sfx_components.ui_click })
			msg.post(".", "show_uploaded_only", { enabled = false })
			gui.set_color(gui.get_node("all_levels_button"), utility.tiled_hex_to_rgba("#6d1102"))
			gui.set_color(gui.get_node("all_levels_button_bottom"), utility.tiled_hex_to_rgba("#2c0701"))
			gui.set_color(gui.get_node("uploaded_levels_button"), utility.tiled_hex_to_rgba("#c57d17"))
			gui.set_color(gui.get_node("uploaded_levels_button_bottom"), utility.tiled_hex_to_rgba("#945e11"))
		end
		if gui.pick_node(gui.get_node("uploaded_levels_button"), action.x, action.y) and uploaded_entries ~= 0 then
			msg.post(soundmanager.audioref, soundmanager.triggers.sfx_play, { name = soundmanager.sfx_components.ui_click })
			msg.post(".", "show_uploaded_only", { enabled = true })
			gui.set_color(gui.get_node("uploaded_levels_button"), utility.tiled_hex_to_rgba("#6d1102"))
			gui.set_color(gui.get_node("uploaded_levels_button_bottom"), utility.tiled_hex_to_rgba("#2c0701"))
			gui.set_color(gui.get_node("all_levels_button"), utility.tiled_hex_to_rgba("#c57d17"))
			gui.set_color(gui.get_node("all_levels_button_bottom"), utility.tiled_hex_to_rgba("#945e11"))
		end
	
	
	
	
	
	
	
	
	
	
	
	end

	if pressed and max_scroll_distance > 0 then
		if gui.pick_node(gui.get_node("scroll_bar_thumb_hitbox"), action.x, action.y) then
			self.scroll_bar_drag_started = true
			self.scroll_bar_start_pos = vmath.vector3(action.x, action.y, 0)
			self.scroll_bar_start_offset = gui.get_position(gui.get_node("scroll_view_content")).y
			self.did_scroll = true
		elseif gui.pick_node(gui.get_node("scroll_bar_track_hitbox"), action.x, action.y) then
			self.did_scroll = true
			scroll_to_track_position(action.x, action.y)
		end
	end

	if pressed and not self.scroll_bar_drag_started and gui.pick_node(gui.get_node("scroll_view"), action.x, action.y) then
		self.scroll_view_drag_started = true
		self.scroll_view_start_pos = vmath.vector3(action.x, action.y, 0)
		self.dragbox_basepos = gui.get_position(gui.get_node("scroll_view_content"))
	elseif released then
		if not self.did_scroll then
			for _, slot in ipairs(row_pool) do
				if slot.data_index then
					local value = all_entry_data[slot.data_index]

					if gui.pick_node(slot.button, action.x, action.y) and not self.is_loading_level then
						msg.post(soundmanager.audioref, soundmanager.triggers.sfx_play, { name = soundmanager.sfx_components.ui_click })
						utility.button_press_animation("play", { tree_ref = slot.node, node_overrides = {
							icon = value.type == "upload" and slot.play_icon or slot.edit_icon,
							icon_shadow = value.type == "upload" and nil or slot.edit_icon_shadow,
						} })
						local data

						if value.type == "upload" then
							gamemanager.recieved_file = value.level_data
							gamemanager.browser_share_level_code = value.level_code
							gamemanager.currentlevel.chapter = -1
							gamemanager.currentlevel.portal = -3
							gamemanager.currentlevel.level = -1
							gamemanager.is_versusmode = false
							pprint("Attempting to start self-uploaded level with levelcode: " .. value.level_code)
							data = {collection_to_load = gamemanager.collections.level}
						else
							self.is_loading_level = true
							level_editor.save_slot_to_load = value.save_slot_index
							level_editor.new_save = false
							pprint("Save file selected with index: " .. value.save_slot_index)
							data = {collection_to_load = gamemanager.collections.level_editor}
						end

						
						if data.collection_to_load == gamemanager.collections.level_editor then
							analytics.track_AMPLITUDE_EVENT(_AMP_EVENTS.CUSTOMEDIT_STARTED)
						end
						msg.post(gamemanager.url_transition, "do_anim", data)
					elseif gui.pick_node(slot.copy_button, action.x, action.y) and gui.is_enabled(slot.copy_button) then
						do return end
					end
				end
			end
		end
		self.scroll_view_drag_started = false
		self.scroll_view_start_pos = nil
		self.scroll_bar_drag_started = false
		self.scroll_bar_start_pos = nil
		self.touch_start_pos = nil
	end

	if max_scroll_distance > 0 and action.pressed then
		local scroll_offset = gui.get_position(gui.get_node("scroll_view_content")).y
		if action_id == hash("wheel_down") then
			set_scroll_offset(scroll_offset + scroll_entry_step)
			return true
		elseif action_id == hash("wheel_up") then
			set_scroll_offset(scroll_offset - scroll_entry_step)
			return true
		end
	end

	if self.scroll_bar_drag_started and self.scroll_bar_start_pos ~= nil then
		self.did_scroll = true
		local _, max_thumb_travel = get_scroll_bar_thumb_metrics()
		if max_thumb_travel > 0 then
			local delta_y = action.y - self.scroll_bar_start_pos.y
			local scroll_delta = -(delta_y / max_thumb_travel) * max_scroll_distance
			set_scroll_offset(self.scroll_bar_start_offset + scroll_delta)
		end
	elseif self.scroll_view_drag_started and self.scroll_view_start_pos ~= nil then
		local current_pos = vmath.vector3(action.x, action.y, 0)
		if self.touch_start_pos and vmath.length(current_pos - self.touch_start_pos) > SCROLL_DRAG_THRESHOLD then
			self.did_scroll = true
		end
		local offset = current_pos - self.scroll_view_start_pos + self.dragbox_basepos
		set_scroll_offset(offset.y)
	end
end

 


