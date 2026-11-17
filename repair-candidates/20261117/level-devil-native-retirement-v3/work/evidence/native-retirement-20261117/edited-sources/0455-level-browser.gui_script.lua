local level_editor = require("_modules.level_editor.level_editor")
local gamemanager = require("_modules.gamemanager")
local utility = require("_modules.utility")
local remote_config = require("_modules.remote_config.remote_config")
local platform = require("_services.platform")
local monarch = require("monarch.monarch")
local infinite_mode = require("_modules.infinite_mode")
local levelmanager = require("_modules.levelmanager")
local soundmanager = require("_modules.soundmanager")

local all_entry_data = {}
local cached_levels = {}
local row_pool = {}
local row_pool_initialized = false
local entry_base_position = nil
local empty_entry_base_position = nil
local PAGE_LIMIT = 50 
local API_MAX_LIMIT = 100 
local loaded_pages = 0
local has_more = false
local is_loading_more = false
local max_scroll_distance = 0
local content_height = 0
local scroll_entry_count = 0
local scroll_entry_height = 0
local scroll_entry_step = 0
local scroll_padding = 0
local SCROLL_DRAG_THRESHOLD = 10
local SCROLL_BAR_THUMB_MIN_HEIGHT = 8
local SCROLL_BAR_HITBOX_WIDTH = 64
local ROW_POOL_BUFFER = 2
local padding = 10
local is_loading = false
local MIN_CHARACTERS = 3
local MAX_CHARACTERS = 22
local CARET_BLINK_INTERVAL = 0.5

local function get_page_limit()
	return math.min(PAGE_LIMIT, API_MAX_LIMIT)
end

local function get_curated_cache_filename()
	return sys.get_save_file("leveldevil", "curated_levels")
end

local function save_curated_cache(date)
	sys.save(get_curated_cache_filename(), {
		levels = cached_levels,
		date = date,
		loaded_pages = loaded_pages,
		has_more = has_more,
	})
end

local function restore_pagination_from_cache(data)
	cached_levels = data.levels or {}
	local level_count = #cached_levels
	local page_limit = get_page_limit()
	if data.loaded_pages then
		loaded_pages = data.loaded_pages
	else
		loaded_pages = math.max(1, math.ceil(level_count / page_limit))
	end
	if data.has_more ~= nil then
		has_more = data.has_more
	else
		has_more = level_count >= page_limit
	end
end

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

local function search_popup_set_error_state(is_error, error_text)
	error_text = error_text or ""

	if is_error then
		gui.set_enabled(gui.get_node("search_popup_error_text"), true)
		gui.set_text(gui.get_node("search_popup_error_text"), error_text)
		gui.set_color(gui.get_node("search_popup_header_box"), utility.tiled_hex_to_rgba("#6d1102"))
		gui.set_color(gui.get_node("search_popup_close_button"), utility.tiled_hex_to_rgba("#c57d17"))
		gui.set_color(gui.get_node("search_popup_close_button_bottom"), utility.tiled_hex_to_rgba("#945e11"))
	else
		gui.set_enabled(gui.get_node("search_popup_error_text"), false)
		gui.set_text(gui.get_node("search_popup_error_text"), "")
		gui.set_color(gui.get_node("search_popup_header_box"), utility.tiled_hex_to_rgba("#a2650f"))
		gui.set_color(gui.get_node("search_popup_close_button"), utility.tiled_hex_to_rgba("#6d1102"))
		gui.set_color(gui.get_node("search_popup_close_button_bottom"), utility.tiled_hex_to_rgba("#2c0701"))
	end
end

local function search_popup_display_error(error_text, callback)
	search_popup_set_error_state(true, error_text)
	timer.delay(2, false, function()
		search_popup_set_error_state(false)
		if type(callback) == "function" then
			callback()
		end
	end)
end

local function stop_search_popup_caret_blink(self)
	if self.search_popup_caret_timer then
		timer.cancel(self.search_popup_caret_timer)
		self.search_popup_caret_timer = nil
	end
	gui.set_enabled(gui.get_node("search_popup_input_field_caret"), false)
	self.search_popup_caret_visible = false
end

local function update_search_popup_caret_position(self)
	local text_node = gui.get_node("search_popup_input_field_text")
	local caret_node = gui.get_node("search_popup_input_field_caret")
	local text = self.input_text or ""
	local text_pos = gui.get_position(text_node)
	local caret_x = text_pos.x
	if text ~= "" then
		local font_resource = gui.get_font_resource(gui.get_font(text_node))
		local metrics = resource.get_text_metrics(font_resource, text)
		local scale = gui.get_scale(text_node)
		caret_x = text_pos.x + metrics.width * scale.x
	end
	gui.set_position(caret_node, vmath.vector3(caret_x, text_pos.y+3, text_pos.z))
end

local function start_search_popup_caret_blink(self)
	stop_search_popup_caret_blink(self)
	local caret_node = gui.get_node("search_popup_input_field_caret")
	update_search_popup_caret_position(self)
	gui.set_enabled(caret_node, true)
	self.search_popup_caret_visible = true
	self.search_popup_caret_timer = timer.delay(CARET_BLINK_INTERVAL, true, function()
		self.search_popup_caret_visible = not self.search_popup_caret_visible
		gui.set_enabled(caret_node, self.search_popup_caret_visible)
	end)
end

local function refresh_search_popup_caret(self)
	if not self.input_clicked then
		stop_search_popup_caret_blink(self)
		return
	end
	update_search_popup_caret_position(self)
	local caret_node = gui.get_node("search_popup_input_field_caret")
	gui.set_enabled(caret_node, true)
	self.search_popup_caret_visible = true
	if self.search_popup_caret_timer then
		timer.cancel(self.search_popup_caret_timer)
		self.search_popup_caret_timer = nil
	end
	self.search_popup_caret_timer = timer.delay(CARET_BLINK_INTERVAL, true, function()
		self.search_popup_caret_visible = not self.search_popup_caret_visible
		gui.set_enabled(caret_node, self.search_popup_caret_visible)
	end)
end

local function set_search_popup_input_text(self, text)
	self.input_text = text or ""
	gui.set_text(gui.get_node("search_popup_input_field_text"), self.input_text)
	refresh_search_popup_caret(self)
end

local function select_search_popup_input_field(self)
	self.input_clicked = true
	gui.set_color(gui.get_node("search_popup_input_field"), utility.tiled_hex_to_rgba("#fce3a8"))
	gui.set_color(gui.get_node("search_popup_bottom1"), utility.tiled_hex_to_rgba("#c57d17"))
	local submit_button = gui.get_node("search_popup_submit_button")
	local submit_button_bottom = gui.get_node("search_popup_submit_button_bottom")
	local submit_icon = gui.get_node("search_popup_submit_icon")
	gui.set_color(submit_button, utility.tiled_hex_to_rgba("#6d1102"))
	gui.set_color(submit_button_bottom, utility.tiled_hex_to_rgba("#2c0701"))
	gui.set_color(submit_icon, utility.tiled_hex_to_rgba("#fcf965"))
	start_search_popup_caret_blink(self)
end

local function deselect_search_popup_input_field(self)
	self.input_clicked = false
	gui.set_color(gui.get_node("search_popup_input_field"), utility.tiled_hex_to_rgba("#c57d17"))
	gui.set_color(gui.get_node("search_popup_bottom1"), utility.tiled_hex_to_rgba("#945e11"))
	stop_search_popup_caret_blink(self)
end

local function validate_search_popup_input(self)
	self.input_clicked = false
	stop_search_popup_caret_blink(self)

	local submit_button = gui.get_node("search_popup_submit_button")
	local submit_button_bottom = gui.get_node("search_popup_submit_button_bottom")
	local submit_icon = gui.get_node("search_popup_submit_icon")
	local input_text = self.input_text or ""

	if #input_text < MIN_CHARACTERS then
		gui.set_color(submit_button, utility.tiled_hex_to_rgba("#c56d1f"))
		gui.set_color(submit_button_bottom, utility.tiled_hex_to_rgba("#ab691f"))
		gui.set_color(submit_icon, utility.tiled_hex_to_rgba("#feca47"))
		search_popup_set_error_state(true, "More than 3 characters are required.")
		return false
	elseif #input_text > MAX_CHARACTERS then
		gui.set_color(submit_button, utility.tiled_hex_to_rgba("#c56d1f"))
		gui.set_color(submit_button_bottom, utility.tiled_hex_to_rgba("#ab691f"))
		gui.set_color(submit_icon, utility.tiled_hex_to_rgba("#feca47"))
		search_popup_set_error_state(true, "Code must be under 22 characters.")
		return false
	else
		gui.set_color(submit_button, utility.tiled_hex_to_rgba("#6d1102"))
		gui.set_color(submit_button_bottom, utility.tiled_hex_to_rgba("#2c0701"))
		gui.set_color(submit_icon, utility.tiled_hex_to_rgba("#fcf965"))
		search_popup_set_error_state(false)
		return true
	end
end

local function open_search_popup(self)
	gui.set_enabled(gui.get_node("search_popup"), true)
	gui.set_enabled(gui.get_node("search_popup_upload_screen"), true)
	self.input_text = ""
	gui.set_text(gui.get_node("search_popup_input_field_text"), "")
	search_popup_set_error_state(false)
	select_search_popup_input_field(self)
	gui.show_keyboard(gui.KEYBOARD_TYPE_DEFAULT, false)
end

local function stop_search_loading()
	gui.set_enabled(gui.get_node("loading_screen_icon"), false)
	gui.set_enabled(gui.get_node("loading_screen_overlay"), false)
	gui.play_flipbook(gui.get_node("loading_screen_icon"), "loading_icon_1")
end

local function start_search_loading()
	gui.set_enabled(gui.get_node("loading_screen_icon"), true)
	gui.set_enabled(gui.get_node("loading_screen_overlay"), true)
	gui.play_flipbook(gui.get_node("loading_screen_icon"), "loading_animation")
end

local function load_level_from_search(self, level_code, level_string)
	gamemanager.browser_share_level_code = level_code
	gamemanager.recieved_file = level_string
	gamemanager.currentlevel.chapter = -1
	gamemanager.currentlevel.portal = -2
	gamemanager.currentlevel.level = -1
	gamemanager.is_versusmode = false
	msg.post(soundmanager.audioref, soundmanager.triggers.music_stop, { name = soundmanager.music_components.theme, fadetime = 1 })
	msg.post(gamemanager.url_transition, "do_anim", { collection_to_load = gamemanager.collections.level })
	gui.set_enabled(gui.get_node("search_popup"), false)
	self.input_text = ""
	deselect_search_popup_input_field(self)
	self.search_blocker = false
	self.disable_input = false
	gui.hide_keyboard()
end

local function url_decode(value)
	return value:gsub("%%(%x%x)", function(hex)
		return string.char(tonumber(hex, 16))
	end)
end

local function extract_level_editor_code(text)
	if not text or text == "" then
		return nil
	end

	text = text:match("^%s*(.-)%s*$")

	local query_code = text:match("[?&]level_editor=([^&%s#]+)")
	if query_code and query_code ~= "" then
		return url_decode(query_code)
	end

	local path_code = text:match("/level_editor/([^%?&#%s/]+)")
	if path_code and path_code ~= "" then
		return url_decode(path_code)
	end

	local adj_code = text:match("[?&]adj_adgroup=([^&%s#]+)")
	if adj_code and adj_code ~= "" and text:match("^https?://") then
		return url_decode(adj_code)
	end

	if text:match("^https?://") or text:find("?", 1, true) or text:find("&", 1, true) then
		return nil
	end

	return text
end

local function apply_search_input_text(self, text)
	local code = extract_level_editor_code(text)
	if not code or code == "" then
		return false
	end

	set_search_popup_input_text(self, code)
	search_popup_set_error_state(false)
	return true
end

local function paste_into_search_popup(self)
	local pasted_text = clipboard and clipboard.paste() or nil
	if not pasted_text or pasted_text == "" then
		search_popup_set_error_state(true, "Nothing to copy")
		return
	end

	local code = extract_level_editor_code(pasted_text)
	if not code or code == "" then
		search_popup_set_error_state(true, "Nothing to copy")
		return
	end

	apply_search_input_text(self, pasted_text)
end

local function init_scroll_entry_metrics(template_id, entry_padding)
	local base_position = gui.get_position(gui.get_node(template_id))
	scroll_padding = entry_padding
	scroll_entry_height = gui.get_size(gui.get_node(template_id)).y
	scroll_entry_step = math.abs(base_position.y * 2 - entry_padding)
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

local function apply_entry_to_row(slot, entry)
	local node = slot.node
	gui.set_text(node["level_name_text"], string.upper(entry.name))
	gui.set_text(node["level_code_text"], entry.level_code)
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

local function update_load_more_entry()
	local empty_entry = gui.get_tree(gui.get_node("empty_entry_template"))
	if has_more and #all_entry_data > 0 then
		local position = vmath.vector3(entry_base_position.x, row_y_at_index(#all_entry_data), entry_base_position.z)
		gui.set_position(empty_entry["empty_entry_template"], position)
		gui.set_enabled(empty_entry["empty_entry_template"], true)
		gui.set_text(empty_entry["empty_entry_text"], "LOAD MORE")
		gui.set_enabled(empty_entry["empty_entry_text"], true)
		refresh_scroll_metrics(#all_entry_data + 1)
	else
		gui.set_enabled(empty_entry["empty_entry_template"], false)
		gui.set_enabled(empty_entry["empty_entry_text"], false)
		refresh_scroll_metrics(#all_entry_data)
	end
end

local function reset_scroll_view()
	disable_row_pool()
	reset_empty_entry_template()

	local scroll_content = gui.get_node("scroll_view_content")
	local scroll_pos = gui.get_position(scroll_content)
	gui.set_position(scroll_content, vmath.vector3(scroll_pos.x, 0, scroll_pos.z))
end

local function build_all_entry_data(levels)
	all_entry_data = {}

	for _, value in ipairs(levels or {}) do
		local name = value.name
		name = name == "" and "unnamed level" or name

		table.insert(all_entry_data, {
			name = name,
			level_code = value.id,
			level_string = value.level_data and value.level_data.level_string,
		})
	end
end

local function initialize_entries(response, requested_limit, append)
	if not append then
		reset_scroll_view()
	else
		reset_empty_entry_template()
	end
	ensure_row_pool()

	if not entry_base_position then
		init_scroll_entry_metrics("level_entry_template", padding)
		entry_base_position = gui.get_position(gui.get_node("level_entry_template"))
	end

	if not empty_entry_base_position then
		empty_entry_base_position = gui.get_position(gui.get_node("empty_entry_template"))
	end

	local levels = response and response.levels
	if append and levels then
		for _, level in ipairs(levels) do
			table.insert(cached_levels, level)
		end
	elseif levels then
		cached_levels = levels
	elseif not append then
		cached_levels = {}
	end

	build_all_entry_data(cached_levels)

	if requested_limit then
		has_more = levels ~= nil and #levels >= requested_limit
	end

	update_load_more_entry()
	if not append then
		set_scroll_offset(0)
	end
	
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
	local filename = get_curated_cache_filename()
	local data = sys.load(filename)
	local time = os.date("*t")
	local date = data.date or {day = 0,month = 0,year = 0}
	local is_same_day = date.day == time.day and date.month == time.month and date.year == time.year
	local page_limit = get_page_limit()

	
	gui.set_enabled(gui.get_node("loading_screen_icon"), true)
	gui.set_enabled(gui.get_node("loading_screen_overlay"), true)
	gui.play_flipbook(gui.get_node("loading_screen_icon"),"loading_animation")
	is_loading = true

	msg.post(soundmanager.audioref, soundmanager.triggers.music_play, { name = soundmanager.music_components.theme, fadetime = 1 })

	gui.set_enabled(gui.get_node("search_button"), _IS_STEAM)
	if not _IS_STEAM then
		gui.set_position(gui.get_node("infinite_mode_button"), gui.get_position(gui.get_node("search_button")))
	end

	remote_config.check_editor_blocked(function (block_editor)
		if not block_editor then 
			if not is_same_day then
				level_editor.get_levels(function(response)
					if response then
						loaded_pages = 1
						initialize_entries(response, page_limit)
						save_curated_cache(time)
					else
						pprint("[BROWSER] Error in fetching levels")
						gui.set_enabled(gui.get_node("loading_screen_overlay"), false)
						gui.set_enabled(gui.get_node("loading_screen_icon"), false)
					end
				end, page_limit, 0)
			else
				restore_pagination_from_cache(data)
				initialize_entries(data)
			end
		else
			pprint("[BROWSER] Error in fetching levels")
			gui.set_enabled(gui.get_node("loading_screen_overlay"), false)
			gui.set_enabled(gui.get_node("loading_screen_icon"), false)
		end
	end)
	

	gui.set_render_order(gamemanager.gui_render_orders.menu_level_browser)
	msg.post(".", "acquire_input_focus")
gui.set_enabled(gui.get_node("search_button"), false)
gui.set_enabled(gui.get_node("infinite_mode_button"), false)

end

function on_input(self, action_id, action)
	if self.is_animating then
		return
	end

	local cursorpos = gamemanager.get_cursorpos()
	if cursorpos == vmath.vector3() then
		cursorpos = vmath.vector3(action.x or 0,action.y or 0,0)
	end

	action.x = cursorpos.x or 0
	action.y = cursorpos.y or 0

	local pressed = (action_id == hash("WIPTOUCH") or action_id == hash("select") or action_id == hash("space") or action_id == hash("touch")) and action.pressed
	local released = (action_id == hash("WIPTOUCH") or action_id == hash("select") or action_id == hash("space") or action_id == hash("touch")) and action.released

	if gui.is_enabled(gui.get_node("search_popup")) then
		if pressed then
			if gui.is_enabled(gui.get_node("search_popup_upload_screen")) and not self.disable_input then
				if gui.pick_node(gui.get_node("search_popup_paste_button"), action.x, action.y) then
					utility.button_press_animation("search_popup_paste")
					paste_into_search_popup(self)
				elseif gui.pick_node(gui.get_node("search_popup_input_field"), action.x, action.y) then
					gui.show_keyboard(gui.KEYBOARD_TYPE_DEFAULT, false)
					search_popup_set_error_state(false)
					gui.set_text(gui.get_node("search_popup_input_field_text"), self.input_text or "")
					select_search_popup_input_field(self)
				else
					gui.hide_keyboard()
					deselect_search_popup_input_field(self)
				end

				if gui.pick_node(gui.get_node("search_popup_submit_button"), action.x, action.y)
					and not self.search_blocker
					and validate_search_popup_input(self) then
					utility.button_press_animation("search_popup_submit")
					self.search_blocker = true
					self.disable_input = true
					self.is_animating = true
					start_search_loading()
					local level_code = self.input_text
					timer.delay(0.2, false, function()
						level_editor.get_level_from_id(level_code, function(response)
							stop_search_loading()
							self.is_animating = false
							if response then
								load_level_from_search(self, level_code, response)
							else
								search_popup_display_error("Level not found.", function()
									self.search_blocker = false
									self.disable_input = false
								end)
							end
						end)
						gui.hide_keyboard()
					end)
				end
			end

			if gui.pick_node(gui.get_node("search_popup_close_button"), action.x, action.y) then
				utility.button_press_animation("search_popup_close")
				self.is_animating = true
				timer.delay(0.2, false, function()
					gui.set_enabled(gui.get_node("search_popup"), false)
					self.input_text = ""
					deselect_search_popup_input_field(self)
					self.search_blocker = false
					self.disable_input = false
					self.is_animating = false
					gui.hide_keyboard()
				end)
			end
		end

		local is_modified = false

		if self.input_clicked and action_id == hash("type") then
			local new_text = self.input_text
			if #self.input_text < 37 then
				new_text = (self.input_text or "") .. action.text
			end
			if new_text:match("^https?://")
				or new_text:find("level_editor=", 1, true)
				or new_text:find("/level_editor/", 1, true) then
				local code = extract_level_editor_code(new_text)
				if code then
					new_text = code
				end
			end
			set_search_popup_input_text(self, new_text)
			is_modified = true
		end

		if action_id == hash("backspace") and self.backspace_held and action.released then
			self.backspace_held = false
			if self.backspace_timer then
				timer.cancel(self.backspace_timer)
				self.backspace_timer = nil
			end
			if self.backspace_initial_timer then
				timer.cancel(self.backspace_initial_timer)
				self.backspace_initial_timer = nil
			end
		end

		if self.backspace_held and self.input_clicked and action_id == hash("backspace") then
			if not self.backspace_timer then
				self.backspace_timer = timer.delay(.05, true, function()
					set_search_popup_input_text(self, self.input_text:sub(1, #self.input_text - 1))
				end)
			end
		end

		if self.input_clicked and action_id == hash("backspace") and action.pressed then
			self.backspace_initial_timer = timer.delay(.4, false, function()
				self.backspace_held = true
			end)
			set_search_popup_input_text(self, (self.input_text or ""):sub(1, #(self.input_text or "") - 1))
			is_modified = true
		end

		if is_modified then
			search_popup_set_error_state(false)
		end

		return
	end

	if pressed then
		self.did_scroll = false
		self.touch_start_pos = vmath.vector3(action.x, action.y, 0)

		if gui.pick_node(gui.get_node("exit_button"), action.x, action.y) then
			msg.post(soundmanager.audioref, soundmanager.triggers.sfx_play, { name = soundmanager.sfx_components.ui_click })
			local data = {collection_to_load = gamemanager.collections.levelselect_c1}
			msg.post(gamemanager.url_transition, "do_anim", data)
			utility.button_press_animation("exit")
		end
		if gui.is_enabled(gui.get_node("back_button")) and gui.pick_node(gui.get_node("back_button"), action.x, action.y) then
			msg.post(soundmanager.audioref, soundmanager.triggers.sfx_play, { name = soundmanager.sfx_components.ui_click })
			local data = {collection_to_load = gamemanager.collections.level_editor_modeselect}
			msg.post(gamemanager.url_transition, "do_anim", data)
			utility.button_press_animation("back")
		end
		if gui.pick_node(gui.get_node("search_button"), action.x, action.y) and gui.is_enabled(gui.get_node("search_button")) then
			do return end
		end
		if gui.pick_node(gui.get_node("infinite_mode_button"), action.x, action.y) then
			do return end
		end
		if gui.pick_node(gui.get_node("editor_button"), action.x, action.y) then
			msg.post(soundmanager.audioref, soundmanager.triggers.sfx_play, { name = soundmanager.sfx_components.ui_click })
			gui.play_flipbook(gui.get_node("editor_button"), "editor_door_selected")
			timer.delay(.3, false, function ()
				gui.play_flipbook(gui.get_node("editor_button"), "editor_door_default")
			end)

			local colname = {collection_to_load = gamemanager.collections.level_editor_saves}
			local filename = sys.get_save_file("leveldevil", "save_slots")
			local data = sys.load(filename)
			
			if data and next(data) then
				colname.collection_to_load = gamemanager.collections.level_editor_saves
			else 
				level_editor.save_slot_to_load = 1
				colname.collection_to_load = gamemanager.collections.level_editor
			end
			
			msg.post(gamemanager.url_transition, "do_anim", colname)
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
						utility.button_press_animation("play", { tree_ref = slot.node })
						gamemanager.browser_share_level_code = value.level_code
						gamemanager.recieved_file = value.level_string
						levelmanager.mapsize_in_units = vmath.vector3(528,336,0)
						local data = {collection_to_load = gamemanager.collections.level}
						gamemanager.currentlevel.chapter = -1
						gamemanager.currentlevel.portal = -2
						gamemanager.currentlevel.level = -1
						gamemanager.is_versusmode = false
						gamemanager.is_current_level_curated = true
						msg.post(soundmanager.audioref, soundmanager.triggers.music_stop, { name = soundmanager.music_components.theme, fadetime = 1 })
						msg.post(gamemanager.url_transition, "do_anim", data)
						self.is_loading_level = false
					elseif gui.pick_node(slot.copy_button, action.x, action.y) then
						do return end
					end
				end
			end

			if has_more and not is_loading_more then
				local empty_entry = gui.get_node("empty_entry_template")
				if gui.pick_node(empty_entry, action.x, action.y) then
					msg.post(soundmanager.audioref, soundmanager.triggers.sfx_play, { name = soundmanager.sfx_components.ui_click })
					is_loading_more = true
					local page_limit = get_page_limit()
					local next_growing_limit = page_limit * (loaded_pages + 1)
					local use_offset_append = next_growing_limit > API_MAX_LIMIT
					local request_limit = use_offset_append and page_limit or next_growing_limit
					local request_offset = use_offset_append and #cached_levels or 0

					level_editor.get_levels(function(response)
						is_loading_more = false
						if response then
							local scroll_y = gui.get_position(gui.get_node("scroll_view_content")).y
							loaded_pages = loaded_pages + 1
							initialize_entries(response, request_limit, use_offset_append)
							set_scroll_offset(scroll_y)
							save_curated_cache(os.date("*t"))
						end
					end, request_limit, request_offset)
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

 


