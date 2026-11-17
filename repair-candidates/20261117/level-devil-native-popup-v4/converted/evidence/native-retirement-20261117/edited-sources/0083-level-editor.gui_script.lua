local level_editor = require("_modules.level_editor.level_editor")
local utility = require("_modules.utility")
local gamemanager = require("_modules.gamemanager")

local preset_buttons = {
}

local ctrl_pressed = false
local save_mode = nil
local TOOLTIP_HOLD_DURATION = 0.4
local current_pressed_button = nil
local MIN_CHARACTERS = 3
local MAX_CHARACTERS = 22
local is_loading = false
local PLACEHOLDER_NAME = "unnamed level"
local CARET_BLINK_INTERVAL = 0.5

local tooltip_button_order = {
	"erase_button",
	"select_button",
	"link_button",
	"cursor_button",
	"clear_button",
	"undo_button",
	"redo_button",
}

local tooltip_button_text = {
	erase_button = "Erase",
	select_button = "Multiselect",
	link_button = "Link",
	cursor_button = "Layers",
	clear_button = "Clear grid",
	undo_button = "Undo",
	redo_button = "Redo",
}

local function color_buttons(button_to_activate)
	if current_pressed_button == button_to_activate then return end
	local asset_bar_pressed_color = utility.tiled_hex_to_rgba("#595959")
	local asset_bar_default_color = utility.tiled_hex_to_rgba("#7b7b7b")
	local pressed_color = utility.tiled_hex_to_rgba("#383838")
	local default_color = utility.tiled_hex_to_rgba("#d9d9d9")
	local pressed_icon_color = default_color 
	local default_icon_color = pressed_color
	local current_pressed_button_temp = current_pressed_button 

	local function set_active(base_name,value)
		local button = gui.get_node(base_name .. "_button")
		local bottom = gui.get_node(base_name .. "_button_bottom")
		local icon = gui.get_node(base_name .. "_icon")
		if not value then
			if base_name == "link" then
				gui.play_flipbook(icon, "linking_icon")
			else 
				gui.set_color(icon, default_icon_color)
			end
			gui.set_color(button, default_color)
			gui.set_visible(bottom, true)
			if current_pressed_button_temp == base_name then
				local pos = gui.get_position(button)
				pos.y = pos.y + 4
				gui.set_position(button, pos)
			end
		else 
			if base_name == "link" then
				gui.play_flipbook(icon, "linking_icon_selected")
			else 
				gui.set_color(icon, pressed_icon_color)
			end
			gui.set_color(button, pressed_color)
			gui.set_visible(bottom, false)
			local pos = gui.get_position(button)
			pos.y = pos.y - 4
			gui.set_position(button, pos)
			current_pressed_button = base_name
		end
	end

	local function set_active_asset_bar(name,nodes,value) 
		
		local button = nodes["preset_button_template"]
		local bottom = nodes["preset_button_template_bottom"]
		local under_text = nodes["preset_button_template_text"]
		if not value then
			gui.set_color(button, asset_bar_default_color)
			gui.set_visible(bottom, true)
			if current_pressed_button_temp == name then
				local pos = gui.get_position(button)
				pos.y = pos.y + 4
				gui.set_position(button, pos)
				local text_pos = gui.get_position(under_text)
				text_pos.y = text_pos.y - 4
				gui.set_position(under_text, text_pos)
			end
		else
			gui.set_color(button, asset_bar_pressed_color)
			gui.set_visible(bottom, false)

			local pos = gui.get_position(button)
			pos.y = pos.y - 4
			gui.set_position(button, pos)
			
			local text_pos = gui.get_position(under_text)
			text_pos.y = text_pos.y + 4
			gui.set_position(under_text, text_pos)

			current_pressed_button = name
		end
	end

	for _, value in pairs(preset_buttons) do
		set_active_asset_bar(value.preset_index, value.tree, value.preset_index == button_to_activate)
	end

	set_active("erase", button_to_activate == "erase")
	set_active("select", button_to_activate == "select")
	set_active("link", button_to_activate == "link")
	set_active("cursor", button_to_activate == "cursor")
end

local function cancel_tooltip_hold(self)
	if self.tooltip_hold_timer then
		timer.cancel(self.tooltip_hold_timer)
		self.tooltip_hold_timer = nil
	end
end

local function pick_tooltip_button(x, y)
	for _, button_id in ipairs(tooltip_button_order) do
		if gui.pick_node(gui.get_node(button_id), x, y) then
			return button_id
		end
	end
end

local function animate_tooltip(self, display_text)
	if self.is_tooltip_animating then return end
	local text_node = gui.get_node("tooltip_box_text")
	local tooltip_box = gui.get_node("tooltip_box")
	gui.set_enabled(tooltip_box, true)
	gui.set_text(text_node, display_text)
	self.is_tooltip_animating = true
	gui.animate(tooltip_box, "position.y", -35, gui.EASING_LINEAR, .2)
	timer.delay(1.5, false, function ()
		gui.animate(tooltip_box, "position.y", 25, gui.EASING_LINEAR, .2,0,function ()
			gui.set_enabled(tooltip_box, false)
		end)
		self.is_tooltip_animating = false
	end)
end



local function show_linking_tooltip(self,version)
	local root = gui.get_node("tooltip_box_linking")
	if not self.popup_shown then
		self.popup_shown = true
		gui.animate(root, "position.y", -35, gui.EASING_LINEAR, .2)
	end
	if self.tooltip_linking_timer then
		timer.cancel(self.tooltip_linking_timer)
		self.tooltip_linking_timer = nil
	end

	local text_node = gui.get_node("tooltip_box_linking_text")
	local base_node = gui.get_node("tooltip_box_linking_base")
	local text = ""

	if version == 1 then 
		text = "Select a trigger"
	elseif version == 2 then 
		text = "Select an object to connect its movement."
	elseif version == 3 then 
		text = "Hero not allowed"
		gui.set_color(base_node, utility.tiled_hex_to_rgba("#6d1102"))
		gui.set_color(text_node, utility.tiled_hex_to_rgba("#FCF965"))
		self.tooltip_linking_timer = timer.delay(1, false, function ()
			gui.set_color(base_node, utility.tiled_hex_to_rgba("#2c0701"))
			gui.set_color(text_node, utility.tiled_hex_to_rgba("#e89621"))
			text = "Select an object to connect its movement."
			gui.set_text(text_node, text)
		end)
	end

	gui.set_text(text_node, text)
	gui.set_enabled(root, true)
end

local function hide_linking_tooltip(self)
	self.popup_shown = false
	local root = gui.get_node("tooltip_box_linking")
	gui.set_enabled(root, false)
	gui.set_position(root, vmath.vector3(854/2,25,0))
end

local function execute_tooltip_button_action(button_id)
	if button_id == "erase_button" then
		level_editor.CURRENT_STATE = level_editor.STATES.ERASE
		level_editor.CURRENT_TILE = 0
		color_buttons("erase")
	elseif button_id == "select_button" then
		level_editor.CURRENT_STATE = level_editor.STATES.SELECT
		level_editor.CURRENT_TILE = 0
		color_buttons("select")
	elseif button_id == "link_button" then
		level_editor.CURRENT_STATE = level_editor.STATES.LINKING
		level_editor.CURRENT_TILE = 0
		msg.post(msg.url(nil,"GUI","level-editor-gui"), "show_linking_tooltip",{version = 1})
		color_buttons("link")
	elseif button_id == "cursor_button" then
		level_editor.CURRENT_STATE = level_editor.STATES.SINGLE_SELECT
		level_editor.CURRENT_TILE = 0
		color_buttons("cursor")
		
		
		
	elseif button_id == "clear_button" then
		utility.button_press_animation("clear")
		gui.set_enabled(gui.get_node("clear_warning_popup"), true)
		msg.post(msg.url(nil, "level-editor", "level-editor"), "on_popup_openend", { is_open = gui.is_enabled(gui.get_node("clear_warning_popup")) })
	elseif button_id == "undo_button" then
		utility.button_press_animation("undo")
		msg.post(msg.url(nil, "level-editor", "level-editor"), "undo")
	elseif button_id == "redo_button" then
		utility.button_press_animation("redo")
		msg.post(msg.url(nil, "level-editor", "level-editor"), "redo")
	end
end

local function start_tooltip_hold(self, button_id)
	cancel_tooltip_hold(self)
	self.tooltip_hold_button = button_id
	self.tooltip_hold_consumed = false
	self.tooltip_hold_timer = timer.delay(TOOLTIP_HOLD_DURATION, false, function()
		self.tooltip_hold_timer = nil
		if self.tooltip_hold_button == button_id then
			self.tooltip_hold_consumed = true
			animate_tooltip(self, tooltip_button_text[button_id])
		end
	end)
end

local function finish_tooltip_hold(self)
	if not self.tooltip_hold_button then
		return false
	end
	local button_id = self.tooltip_hold_button
	local consumed = self.tooltip_hold_consumed
	cancel_tooltip_hold(self)
	self.tooltip_hold_button = nil
	self.tooltip_hold_consumed = false
	if not consumed then
		execute_tooltip_button_action(button_id)
	end
	return true
end

local function upload_display_error(error_text,callback)
	gui.set_enabled(gui.get_node("upload_popup_error_text"), true)
	gui.set_text(gui.get_node("upload_popup_error_text"), "A problem occured, try again.")
	gui.set_color(gui.get_node("upload_popup_header_box"), utility.tiled_hex_to_rgba("#6d1102"))
	gui.set_color(gui.get_node("upload_popup_close_button"), utility.tiled_hex_to_rgba("#c57d17"))
	gui.set_color(gui.get_node("upload_popup_close_button_bottom"), utility.tiled_hex_to_rgba("#945e11"))
	timer.delay(2, false, function ()
		gui.set_enabled(gui.get_node("upload_popup_error_text"), false)
		gui.set_text(gui.get_node("upload_popup_error_text"), "")
		gui.set_color(gui.get_node("upload_popup_header_box"), utility.tiled_hex_to_rgba("#a2650f"))
		gui.set_color(gui.get_node("upload_popup_close_button"), utility.tiled_hex_to_rgba("#6d1102"))
		gui.set_color(gui.get_node("upload_popup_close_button_bottom"), utility.tiled_hex_to_rgba("#2c0701"))
		if type(callback) == "function" then
		callback()
		end
	end)
end

local function save_popup_set_error_state(is_error, error_text)
	local update_button = gui.get_node("save_popup_update_button")
	local update_button_bottom = gui.get_node("save_popup_update_button_bottom")
	local update_icon = gui.get_node("save_popup_update_icon")

	local savecopy_button = gui.get_node("save_popup_savecopy_button")
	local savecopy_button_bottom = gui.get_node("save_popup_savecopy_button_bottom")
	local savecopy_icon = gui.get_node("save_popup_savecopy_icon")

	local submit_button = gui.get_node("save_popup_submit_button")
	local submit_button_bottom = gui.get_node("save_popup_submit_button_bottom")
	local submit_icon = gui.get_node("save_popup_submit_icon")
	error_text = error_text or ""

	if is_error then
		gui.set_enabled(gui.get_node("save_popup_error_text"), true)
		gui.set_text(gui.get_node("save_popup_error_text"), error_text)
		gui.set_color(gui.get_node("save_popup_header_box"), utility.tiled_hex_to_rgba("#6d1102"))
		gui.set_color(gui.get_node("save_popup_close_button"), utility.tiled_hex_to_rgba("#c57d17"))
		gui.set_color(gui.get_node("save_popup_close_button_bottom"), utility.tiled_hex_to_rgba("#945e11"))
	else
		gui.set_enabled(gui.get_node("save_popup_error_text"), false)
		gui.set_text(gui.get_node("save_popup_error_text"), "")
		gui.set_color(gui.get_node("save_popup_header_box"), utility.tiled_hex_to_rgba("#a2650f"))
		gui.set_color(gui.get_node("save_popup_close_button"), utility.tiled_hex_to_rgba("#6d1102"))
		gui.set_color(gui.get_node("save_popup_close_button_bottom"), utility.tiled_hex_to_rgba("#2c0701"))

		gui.set_color(update_button, utility.tiled_hex_to_rgba("#6d1102"))
		gui.set_color(update_button_bottom, utility.tiled_hex_to_rgba("#2c0701"))
		gui.set_color(update_icon, utility.tiled_hex_to_rgba("#fcf965"))

		gui.set_color(savecopy_button, utility.tiled_hex_to_rgba("#6d1102"))
		gui.set_color(savecopy_button_bottom, utility.tiled_hex_to_rgba("#2c0701"))
		gui.set_color(savecopy_icon, utility.tiled_hex_to_rgba("#fcf965"))

		gui.set_color(submit_button, utility.tiled_hex_to_rgba("#6d1102"))
		gui.set_color(submit_button_bottom, utility.tiled_hex_to_rgba("#2c0701"))
		gui.set_color(submit_icon, utility.tiled_hex_to_rgba("#fcf965"))
	end
end

local function upload_popup_set_error_state(is_error, error_text)

	error_text = error_text or ""

	if is_error then
		gui.set_enabled(gui.get_node("upload_popup_error_text"), true)
		gui.set_text(gui.get_node("upload_popup_error_text"), error_text)
		gui.set_color(gui.get_node("upload_popup_header_box"), utility.tiled_hex_to_rgba("#6d1102"))
		gui.set_color(gui.get_node("upload_popup_close_button"), utility.tiled_hex_to_rgba("#c57d17"))
		gui.set_color(gui.get_node("upload_popup_close_button_bottom"), utility.tiled_hex_to_rgba("#945e11"))
	else
		gui.set_enabled(gui.get_node("upload_popup_error_text"), false)
		gui.set_text(gui.get_node("upload_popup_error_text"), "")
		gui.set_color(gui.get_node("upload_popup_header_box"), utility.tiled_hex_to_rgba("#a2650f"))
		gui.set_color(gui.get_node("upload_popup_close_button"), utility.tiled_hex_to_rgba("#6d1102"))
		gui.set_color(gui.get_node("upload_popup_close_button_bottom"), utility.tiled_hex_to_rgba("#2c0701"))
	end
end

local function stop_save_popup_caret_blink(self)
	if self.save_popup_caret_timer then
		timer.cancel(self.save_popup_caret_timer)
		self.save_popup_caret_timer = nil
	end
	gui.set_enabled(gui.get_node("save_popup_input_field_caret"), false)
	self.save_popup_caret_visible = false
end

local function update_save_popup_caret_position(self)
	local text_node = gui.get_node("save_popup_input_field_text")
	local caret_node = gui.get_node("save_popup_input_field_caret")
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

local function start_save_popup_caret_blink(self)
	stop_save_popup_caret_blink(self)
	local caret_node = gui.get_node("save_popup_input_field_caret")
	update_save_popup_caret_position(self)
	gui.set_enabled(caret_node, true)
	self.save_popup_caret_visible = true
	self.save_popup_caret_timer = timer.delay(CARET_BLINK_INTERVAL, true, function()
		self.save_popup_caret_visible = not self.save_popup_caret_visible
		gui.set_enabled(caret_node, self.save_popup_caret_visible)
	end)
end

local function refresh_save_popup_caret(self)
	if not self.input_clicked then
		stop_save_popup_caret_blink(self)
		return
	end
	update_save_popup_caret_position(self)
	local caret_node = gui.get_node("save_popup_input_field_caret")
	gui.set_enabled(caret_node, true)
	self.save_popup_caret_visible = true
	if self.save_popup_caret_timer then
		timer.cancel(self.save_popup_caret_timer)
		self.save_popup_caret_timer = nil
	end
	self.save_popup_caret_timer = timer.delay(CARET_BLINK_INTERVAL, true, function()
		self.save_popup_caret_visible = not self.save_popup_caret_visible
		gui.set_enabled(caret_node, self.save_popup_caret_visible)
	end)
end

local function set_save_popup_input_text(self, text)
	self.input_text = text or ""
	gui.set_text(gui.get_node("save_popup_input_field_text"), self.input_text)
	refresh_save_popup_caret(self)
end

local function select_save_popup_input_field(self)
	self.input_clicked = true
	gui.set_color(gui.get_node("save_popup_input_field"), utility.tiled_hex_to_rgba("#fce3a8"))
	gui.set_color(gui.get_node("save_popup_bottom1"), utility.tiled_hex_to_rgba("#c57d17"))
	start_save_popup_caret_blink(self)
end

local function deselect_save_popup_input_field(self)
	self.input_clicked = false
	gui.set_color(gui.get_node("save_popup_input_field"), utility.tiled_hex_to_rgba("#c57d17"))
	gui.set_color(gui.get_node("save_popup_bottom1"), utility.tiled_hex_to_rgba("#945e11"))
	stop_save_popup_caret_blink(self)
end

local function validate_save_popup_input(self)
	self.input_clicked = false
	stop_save_popup_caret_blink(self)
	local update_button = gui.get_node("save_popup_update_button")
	local update_button_bottom = gui.get_node("save_popup_update_button_bottom")
	local update_icon = gui.get_node("save_popup_update_icon")

	local savecopy_button = gui.get_node("save_popup_savecopy_button")
	local savecopy_button_bottom = gui.get_node("save_popup_savecopy_button_bottom")
	local savecopy_icon = gui.get_node("save_popup_savecopy_icon")

	local submit_button = gui.get_node("save_popup_submit_button")
	local submit_button_bottom = gui.get_node("save_popup_submit_button_bottom")
	local submit_icon = gui.get_node("save_popup_submit_icon")

	local min_character_check = self.input_text:gsub(" ", "")

	if #min_character_check < MIN_CHARACTERS then
		gui.set_color(submit_button, utility.tiled_hex_to_rgba("#c56d1f"))
		gui.set_color(submit_button_bottom, utility.tiled_hex_to_rgba("#ab691f"))
		gui.set_color(submit_icon, utility.tiled_hex_to_rgba("#feca47"))

		gui.set_color(update_button, utility.tiled_hex_to_rgba("#c56d1f"))
		gui.set_color(update_button_bottom, utility.tiled_hex_to_rgba("#ab691f"))
		gui.set_color(update_icon, utility.tiled_hex_to_rgba("#feca47"))

		gui.set_color(savecopy_button, utility.tiled_hex_to_rgba("#c56d1f"))
		gui.set_color(savecopy_button_bottom, utility.tiled_hex_to_rgba("#ab691f"))
		gui.set_color(savecopy_icon, utility.tiled_hex_to_rgba("#feca47"))

		save_popup_set_error_state(true,"More than 3 characters are required.")
		return false
	elseif #self.input_text > MAX_CHARACTERS then
		gui.set_color(submit_button, utility.tiled_hex_to_rgba("#c56d1f"))
		gui.set_color(submit_button_bottom, utility.tiled_hex_to_rgba("#ab691f"))
		gui.set_color(submit_icon, utility.tiled_hex_to_rgba("#feca47"))

		gui.set_color(update_button, utility.tiled_hex_to_rgba("#c56d1f"))
		gui.set_color(update_button_bottom, utility.tiled_hex_to_rgba("#ab691f"))
		gui.set_color(update_icon, utility.tiled_hex_to_rgba("#feca47"))

		gui.set_color(savecopy_button, utility.tiled_hex_to_rgba("#c56d1f"))
		gui.set_color(savecopy_button_bottom, utility.tiled_hex_to_rgba("#ab691f"))
		gui.set_color(savecopy_icon, utility.tiled_hex_to_rgba("#feca47"))

		save_popup_set_error_state(true,"Name must be under 22 characters.")
		return false
	else 
		gui.set_color(submit_button, utility.tiled_hex_to_rgba("#6d1102"))
		gui.set_color(submit_button_bottom, utility.tiled_hex_to_rgba("#2c0701"))
		gui.set_color(submit_icon, utility.tiled_hex_to_rgba("#fcf965"))

		gui.set_color(update_button, utility.tiled_hex_to_rgba("#6d1102"))
		gui.set_color(update_button_bottom, utility.tiled_hex_to_rgba("#2c0701"))
		gui.set_color(update_icon, utility.tiled_hex_to_rgba("#fcf965"))

		gui.set_color(savecopy_button, utility.tiled_hex_to_rgba("#6d1102"))
		gui.set_color(savecopy_button_bottom, utility.tiled_hex_to_rgba("#2c0701"))
		gui.set_color(savecopy_icon, utility.tiled_hex_to_rgba("#fcf965"))

		save_popup_set_error_state(false)
		return true
	end
end

local function stop_upload_popup_caret_blink(self)
	if self.upload_popup_caret_timer then
		timer.cancel(self.upload_popup_caret_timer)
		self.upload_popup_caret_timer = nil
	end
	gui.set_enabled(gui.get_node("upload_popup_input_field_caret"), false)
	self.upload_popup_caret_visible = false
end

local function update_upload_popup_caret_position(self)
	local text_node = gui.get_node("upload_popup_input_field_text")
	local caret_node = gui.get_node("upload_popup_input_field_caret")
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

local function start_upload_popup_caret_blink(self)
	stop_upload_popup_caret_blink(self)
	local caret_node = gui.get_node("upload_popup_input_field_caret")
	update_upload_popup_caret_position(self)
	gui.set_enabled(caret_node, true)
	self.upload_popup_caret_visible = true
	self.upload_popup_caret_timer = timer.delay(CARET_BLINK_INTERVAL, true, function()
		self.upload_popup_caret_visible = not self.upload_popup_caret_visible
		gui.set_enabled(caret_node, self.upload_popup_caret_visible)
	end)
end

local function refresh_upload_popup_caret(self)
	if not self.input_clicked then
		stop_upload_popup_caret_blink(self)
		return
	end
	update_upload_popup_caret_position(self)
	local caret_node = gui.get_node("upload_popup_input_field_caret")
	gui.set_enabled(caret_node, true)
	self.upload_popup_caret_visible = true
	if self.upload_popup_caret_timer then
		timer.cancel(self.upload_popup_caret_timer)
		self.upload_popup_caret_timer = nil
	end
	self.upload_popup_caret_timer = timer.delay(CARET_BLINK_INTERVAL, true, function()
		self.upload_popup_caret_visible = not self.upload_popup_caret_visible
		gui.set_enabled(caret_node, self.upload_popup_caret_visible)
	end)
end

local function set_upload_popup_input_text(self, text)
	self.input_text = text or ""
	gui.set_text(gui.get_node("upload_popup_input_field_text"), self.input_text)
	refresh_upload_popup_caret(self)
end

local function select_upload_popup_input_field(self)
	self.input_clicked = true
	gui.set_color(gui.get_node("upload_popup_input_field"), utility.tiled_hex_to_rgba("#fce3a8"))
	gui.set_color(gui.get_node("upload_popup_bottom1"), utility.tiled_hex_to_rgba("#c57d17"))
	start_upload_popup_caret_blink(self)
end

local function deselect_upload_popup_input_field(self)
	self.input_clicked = false
	gui.set_color(gui.get_node("upload_popup_input_field"), utility.tiled_hex_to_rgba("#c57d17"))
	gui.set_color(gui.get_node("upload_popup_bottom1"), utility.tiled_hex_to_rgba("#945e11"))
	stop_upload_popup_caret_blink(self)
end

local function validate_upload_popup_input(self)
	self.input_clicked = false
	stop_upload_popup_caret_blink(self)

	local submit_button = gui.get_node("upload_popup_submit_button")
	local submit_button_bottom = gui.get_node("upload_popup_submit_button_bottom")
	local submit_icon = gui.get_node("upload_popup_submit_icon")

	local min_character_check = self.input_text:gsub(" ", "")

	if #min_character_check < MIN_CHARACTERS then
		gui.set_color(submit_button, utility.tiled_hex_to_rgba("#c56d1f"))
		gui.set_color(submit_button_bottom, utility.tiled_hex_to_rgba("#ab691f"))
		gui.set_color(submit_icon, utility.tiled_hex_to_rgba("#feca47"))
		upload_popup_set_error_state(true,"More than 3 characters are required.")
		return false
	elseif #self.input_text > MAX_CHARACTERS then
		gui.set_color(submit_button, utility.tiled_hex_to_rgba("#c56d1f"))
		gui.set_color(submit_button_bottom, utility.tiled_hex_to_rgba("#ab691f"))
		gui.set_color(submit_icon, utility.tiled_hex_to_rgba("#feca47"))
		upload_popup_set_error_state(true,"Name must be under 22 characters.")
		return false
	elseif self.upload_blocker then
		gui.set_color(submit_button, utility.tiled_hex_to_rgba("#c56d1f"))
		gui.set_color(submit_button_bottom, utility.tiled_hex_to_rgba("#ab691f"))
		gui.set_color(submit_icon, utility.tiled_hex_to_rgba("#feca47"))
		upload_popup_set_error_state(true,"This level has already been uploaded")
		return false
	else
		gui.set_color(submit_button, utility.tiled_hex_to_rgba("#6d1102"))
		gui.set_color(submit_button_bottom, utility.tiled_hex_to_rgba("#2c0701"))
		gui.set_color(submit_icon, utility.tiled_hex_to_rgba("#fcf965"))
		upload_popup_set_error_state(false)
		return true
	end
end

function init(self)
	msg.post(".", "acquire_input_focus")
	gui.set_render_order(gamemanager.gui_render_orders.level_editor_gui)

	for key, value in ipairs(level_editor.TILE_PRESETS) do
		
		local new_button = gui.clone_tree(gui.get_node('preset_button_template'))
		gui.play_flipbook(new_button["preset_button_icon_template"], value.sprite_override or value.values.sprite)
		local position = gui.get_position(new_button["preset_button_template"])
		position.x = position.x + (60 * (key - 1))
		gui.set_position(new_button["preset_button_template"], position)
		table.insert(preset_buttons, key, {
			node = new_button["preset_button_template"],
			tree = new_button,
			preset_index = key,
		})
		gui.set_enabled(new_button["preset_button_template"], true)
		gui.set_text(new_button["preset_button_template_text"], value.values.display_name and utility.firstToUpper(value.values.display_name) or utility.firstToUpper(value.values.sprite))
	end
	
	gui.set_color(gui.get_node("upload_button"), gamemanager.level_editor_level_complete and utility.tiled_hex_to_rgba("#d9d9d9") or utility.tiled_hex_to_rgba("#a1a1a1"))
	gui.play_flipbook(gui.get_node("layer_button"), level_editor.CURRENT_LAYER == 2 and "layer-1" or "layer-2")
	gui.play_flipbook(gui.get_node("layer_button_shadow"), level_editor.CURRENT_LAYER == 2 and "layer-1" or "layer-2")
gui.set_enabled(gui.get_node("upload_button"), false)
gui.set_enabled(gui.get_node("upload_popup_submit_button"), false)
gui.set_enabled(gui.get_node("upload_popup_share_button"), false)

end

function on_message(self, message_id, message, sender)

	if message_id == hash("show_linking_tooltip") then 
		show_linking_tooltip(self, message.version)
	elseif message_id == hash("hide_linking_tooltip") then
		hide_linking_tooltip(self)
	end

	if message_id == hash("show_tooltip") then 
		if message.display_text then 
			animate_tooltip(self, message.display_text)
		end
	end

	if message_id == hash("show_clipboard_message") then
		gui.set_enabled(gui.get_node("clipboard_text"), true)

		timer.delay(10, false, function ()
			gui.set_enabled(gui.get_node("clipboard_text"), false)
			self.upload_blocker = false
		end)
	end
	if message_id == hash("show_hero_error_message") then
		gui.set_enabled(gui.get_node("hero_warning_text"), true)

		timer.delay(3, false, function ()
			gui.set_enabled(gui.get_node("hero_warning_text"), false)
			self.upload_blocker = false
		end)
	end
	if message_id == hash("disable_upload_button") then
		gui.set_color(gui.get_node("upload_button"), gamemanager.level_editor_level_complete and utility.tiled_hex_to_rgba("#d9d9d9") or utility.tiled_hex_to_rgba("#a1a1a1"))
	end
	if message_id == hash("upload_success") then
		gui.set_enabled(gui.get_node("upload_popup_upload_screen"), false)
		gui.set_enabled(gui.get_node("upload_popup_congrats_screen"), true)
		self.disable_input = false
		self.input_text = ""

		if is_loading then
			
			gui.set_enabled(gui.get_node("loading_screen_icon"), false)
			gui.set_enabled(gui.get_node("loading_screen_overlay"), false)
			is_loading = false
			gui.play_flipbook(gui.get_node("loading_screen_icon"),"loading_icon_1")
		end

	end
	if message_id == hash("upload_fail") then 
		upload_display_error("A problem occured, try again.", function ()
			self.disable_input = false
			self.upload_blocker = false
		end)
		if is_loading then
			
			gui.set_enabled(gui.get_node("loading_screen_icon"), false)
			gui.set_enabled(gui.get_node("loading_screen_overlay"), false)
			is_loading = false
			gui.play_flipbook(gui.get_node("loading_screen_icon"),"loading_icon_1")
		end
	end
end



local function open_save_menu(self)
	gui.set_enabled(gui.get_node("save_popup"), true)
	local text_to_set = "Save Level"
	if level_editor.save_slots[level_editor.save_slot_to_load] then
		text_to_set = "Save Level"
		gui.set_enabled(gui.get_node("save_popup_submit_button"), false)
		gui.set_enabled(gui.get_node("save_popup_update_button"), true)
		gui.set_enabled(gui.get_node("save_popup_savecopy_button"), true)
		self.input_text = level_editor.save_slots[level_editor.save_slot_to_load].name or ""
	else 
		text_to_set = "New Level"
		self.input_text = self.input_text or ""
		gui.set_enabled(gui.get_node("save_popup_submit_button"), true)
		gui.set_enabled(gui.get_node("save_popup_update_button"), false)
		gui.set_enabled(gui.get_node("save_popup_savecopy_button"), false)
	end
	gui.set_text(gui.get_node("save_popup_input_field_text"), self.input_text or "")
	select_save_popup_input_field(self)

	
	
	

	
	
	

	
	
	

	

	
	
	
	

	
	
	

	
	
	

	
	
	
	
	

	
	
	

	
	
	

	
	
	
	
	

	
	
	

	
	
	

	
	

	gui.set_text(gui.get_node("save_popup_header"), text_to_set)
	msg.post(msg.url(nil, "level-editor", "level-editor"), "on_popup_openend",{is_open = true})
	timer.delay(.5, false, function ()
		self.is_save_popup_open = true
	end)
end

function on_input(self, action_id, action)

	if self.is_animating then return end

	local cursorpos = gamemanager.get_cursorpos()
	if cursorpos == vmath.vector3() then
		cursorpos = vmath.vector3(action.x or 0,action.y or 0,0)
	end
	local is_pointer_action = action_id == hash("touch") or (action_id == hash("select") or action_id == hash("space") and not self.input_clicked)
	local pressed = is_pointer_action and action.pressed
	local released = is_pointer_action and action.released

	action.x = cursorpos.x or 0
	action.y = cursorpos.y or 0

	if released then
		if finish_tooltip_hold(self) then
			return true
		end
	end

	if pressed then
		local tooltip_button = pick_tooltip_button(action.x, action.y)
		if tooltip_button then
			start_tooltip_hold(self, tooltip_button)
			return true
		elseif gui.pick_node(gui.get_node("save_button"), action.x, action.y) then
			utility.button_press_animation("save")
			open_save_menu(self)
		elseif gui.pick_node(gui.get_node("upload_button"), action.x, action.y) then
			do return end
		elseif gui.pick_node(gui.get_node("copy_button"), action.x, action.y) then
			msg.post(msg.url(nil,"level-editor","level-editor"),"copy")
		elseif gui.pick_node(gui.get_node("exit_button"), action.x, action.y) then
			utility.button_press_animation("exit")

			if level_editor.new_save then 
				
				local found_node = false
				pprint("EHM?")
				
				for py, row in pairs(level_editor.tilemap_data) do
					for px, _ in pairs(row) do
						for i = 1, level_editor.LAYER_COUNT do
							
							
							local layer_cell = level_editor.inactive_maps[i][py][px]
							local cell = level_editor.tilemap_data[py][px]

							if next(cell) or next(layer_cell) then 
								pprint(cell)
								found_node = true
							end
						end
					end
				end

				if found_node then
					gui.set_enabled(gui.get_node("save_changes_popup"), true)
					msg.post(msg.url(nil, "level-editor", "level-editor"), "on_popup_openend",{is_open = true})
				else 
					level_editor.new_save = false
					
					local data = { collection_to_load = gamemanager.collections.level_editor_saves}
					msg.post(gamemanager.url_transition, "do_anim", data)
				end
			else 
				
				gui.set_enabled(gui.get_node("save_changes_popup"), true)
				msg.post(msg.url(nil, "level-editor", "level-editor"), "on_popup_openend",{is_open = true})
			end

		elseif gui.pick_node(gui.get_node("play_button"), action.x, action.y) then
			msg.post(msg.url(nil, "level-editor", "level-editor"), "save",{save_slot_index = level_editor.save_slot_to_load, name = level_editor.save_slots[level_editor.save_slot_to_load] and level_editor.save_slots[level_editor.save_slot_to_load].name or PLACEHOLDER_NAME})
			msg.post(msg.url(nil, "level-editor", "level-editor"), "on_play_button")
			return true

		elseif gui.pick_node(gui.get_node("layer_button"), action.x, action.y) then
			gui.play_flipbook(gui.get_node("layer_button"), level_editor.CURRENT_LAYER == 1 and "layer-1" or "layer-2")
			gui.play_flipbook(gui.get_node("layer_button_shadow"), level_editor.CURRENT_LAYER == 1 and "layer-1" or "layer-2")
			msg.post(msg.url(nil, "level-editor", "level-editor"), "change_layer", { new_layer = level_editor.CURRENT_LAYER == 1 and 2 or 1 })
		end

		
		for _, value in pairs(preset_buttons) do
			if gui.pick_node(value.node, action.x, action.y) then
				level_editor.CURRENT_STATE = level_editor.STATES.PLACING
				level_editor.CURRENT_TILE = value.preset_index
				color_buttons(value.preset_index)
			end
		end

		if gui.is_enabled(gui.get_node("save_popup")) then
			local min_character_check = self.input_text:gsub(" ", "")

			if level_editor.save_slots[level_editor.save_slot_to_load] then
				if gui.pick_node(gui.get_node("save_popup_update_button"), action.x, action.y) and validate_save_popup_input(self)  then
					utility.button_press_animation("save_popup_update")
					self.is_animating = true
					msg.post(msg.url(nil, "level-editor", "level-editor"), "save",{save_slot_index = level_editor.save_slot_to_load,name = self.input_text})
					self.input_text = ""
					self.input_clicked = false
					timer.delay(.2, false, function ()
						msg.post(msg.url(nil, "level-editor", "level-editor"), "on_popup_openend",{is_open = false})
						gui.set_enabled(gui.get_node("save_popup"), false)
						self.is_animating = false
						gui.hide_keyboard()
					end)
				end
				if gui.pick_node(gui.get_node("save_popup_savecopy_button"), action.x, action.y) and validate_save_popup_input(self)  then
					utility.button_press_animation("save_popup_savecopy")
					self.is_animating = true
					msg.post(msg.url(nil, "level-editor", "level-editor"), "save",{save_slot_index = #level_editor.save_slots + 1,name = self.input_text})
					self.input_text = ""
					self.input_clicked = false
					timer.delay(.2, false, function ()
						msg.post(msg.url(nil, "level-editor", "level-editor"), "on_popup_openend",{is_open = false})
						gui.set_enabled(gui.get_node("save_popup"), false)
						self.is_animating = false
						gui.hide_keyboard()
					end)
				end
			else
				
				if gui.pick_node(gui.get_node("save_popup_submit_button"), action.x, action.y) and validate_save_popup_input(self)  then
					utility.button_press_animation("save_popup_submit")
					self.is_animating = true
					msg.post(msg.url(nil, "level-editor", "level-editor"), "save",{save_slot_index = level_editor.save_slot_to_load,name = self.input_text})
					self.input_text = ""
					self.input_clicked = false
					timer.delay(.2, false, function ()
						msg.post(msg.url(nil, "level-editor", "level-editor"), "on_popup_openend",{is_open = false})
						gui.set_enabled(gui.get_node("save_popup"), false)
						self.is_animating = false
						gui.hide_keyboard()

						if self.do_quit_after_saving then 
							self.do_quit_after_saving = false
							local data = { collection_to_load = gamemanager.collections.level_editor_saves}
							msg.post(gamemanager.url_transition, "do_anim", data)	
						end
					end)
				end
			end

			
			
			
			
			
			
			
			
			
			
			
			
			pprint()
		end

		if gui.is_enabled(gui.get_node("save_popup")) then
			pprint(self.input_clicked)
			pprint(action_id)
			if gui.pick_node(gui.get_node("save_popup_input_field"), action.x, action.y) then
				gui.show_keyboard(gui.KEYBOARD_TYPE_DEFAULT,false)
				save_popup_set_error_state(false)
				gui.set_text(gui.get_node("save_popup_input_field_text"), self.input_text or "")
				select_save_popup_input_field(self)
				pprint(self.input_clicked)
			elseif self.is_save_popup_open then 
				gui.hide_keyboard()
				deselect_save_popup_input_field(self)
			end

			if gui.pick_node(gui.get_node("save_popup_close_button"), action.x, action.y) then
				utility.button_press_animation("save_popup_close")
				self.is_animating = true
				self.do_quit_after_saving = false
				timer.delay(.2, false, function ()
					self.is_save_popup_open = false
					deselect_save_popup_input_field(self)
					gui.set_enabled(gui.get_node("save_popup"), false)
					self.is_animating = false
					msg.post(msg.url(nil, "level-editor", "level-editor"), "on_popup_openend",{is_open = false})
					self.input_text = ""
					gui.hide_keyboard()
				end)
			end
		end

		if gui.is_enabled(gui.get_node("upload_popup")) then
			pprint(self.input_clicked)
			pprint(action_id)

			if gui.is_enabled(gui.get_node("upload_popup_upload_screen")) and not self.disable_input then
				if gui.pick_node(gui.get_node("upload_popup_submit_button"), action.x, action.y) and validate_upload_popup_input(self) then
					do return end
				end

				if gui.pick_node(gui.get_node("upload_popup_input_field"), action.x, action.y) then
					gui.show_keyboard(gui.KEYBOARD_TYPE_DEFAULT,false)
					upload_popup_set_error_state(false)
					gui.set_text(gui.get_node("upload_popup_input_field_text"), self.input_text or "")
					select_upload_popup_input_field(self)
					pprint(self.input_clicked)
				elseif self.is_upload_popup_open then
					gui.hide_keyboard()
					deselect_upload_popup_input_field(self)
				end
			elseif gui.is_enabled(gui.get_node("upload_popup_congrats_screen")) then
				if gui.pick_node(gui.get_node("upload_popup_share_button"), action.x, action.y) then
					do return end
				end
			end

			

			if gui.pick_node(gui.get_node("upload_popup_close_button"), action.x, action.y) then
				utility.button_press_animation("upload_popup_close")
				timer.delay(.2, false, function ()
					self.is_upload_popup_open = false
					deselect_upload_popup_input_field(self)
					gui.set_enabled(gui.get_node("upload_popup"), false)
					msg.post(msg.url(nil, "level-editor", "level-editor"), "on_popup_openend",{is_open = false})
					gui.hide_keyboard()
				end)
			end
		end

		if gui.is_enabled(gui.get_node("clear_warning_popup")) then
			if gui.pick_node(gui.get_node("clear_confirmation_button"), action.x, action.y) then
				utility.button_press_animation("clear_confirmation")
				self.is_animating = true
				timer.delay(.2, false, function ()
					gui.set_enabled(gui.get_node("clear_warning_popup"), false)
					self.is_animating = false
					msg.post(msg.url(nil, "level-editor", "level-editor"), "clear_tilemap")
					msg.post(msg.url(nil, "level-editor", "level-editor"), "on_popup_openend",{is_open = gui.is_enabled(gui.get_node("clear_warning_popup"))})
				end)
			end
			if gui.pick_node(gui.get_node("clear_warning_cancel_button"), action.x, action.y) then
				utility.button_press_animation("clear_warning_cancel")
				self.is_animating = true
				timer.delay(.2, false, function ()
					gui.set_enabled(gui.get_node("clear_warning_popup"), false)
					self.is_animating = false
					msg.post(msg.url(nil, "level-editor", "level-editor"), "on_popup_openend",{is_open = gui.is_enabled(gui.get_node("clear_warning_popup"))})
				end)
			end
		end
		
		if gui.is_enabled(gui.get_node("save_changes_popup")) then
			if gui.pick_node(gui.get_node("save_changes_popup_yes_button"), action.x, action.y) then
				utility.button_press_animation("save_changes_popup_yes")
				self.is_animating = true
				timer.delay(.2, false, function ()
					if level_editor.save_slots[level_editor.save_slot_to_load] then
						msg.post(msg.url(nil, "level-editor", "level-editor"), "save",{save_slot_index = level_editor.save_slot_to_load, name = level_editor.save_slots[level_editor.save_slot_to_load].name or ""})
						local data = { collection_to_load = gamemanager.collections.level_editor_saves}
						msg.post(gamemanager.url_transition, "do_anim", data)
					else 
						gui.set_enabled(gui.get_node("save_changes_popup"), false)
						self.do_quit_after_saving = true
						open_save_menu(self)
					end	
					self.is_animating = false
				end)
			end
			if gui.pick_node(gui.get_node("save_changes_popup_no_button"), action.x, action.y) then
				utility.button_press_animation("save_changes_popup_no")
				self.is_animating = true
				timer.delay(.2, false, function ()
					local data = { collection_to_load = gamemanager.collections.level_editor_saves}
					msg.post(gamemanager.url_transition, "do_anim", data)	
					self.is_animating = false
				end)
			end
			if gui.pick_node(gui.get_node("save_changes_popup_cancel_button"), action.x, action.y) then
				utility.button_press_animation("save_changes_popup_cancel")
				self.is_animating = true
				timer.delay(.2, false, function ()
					msg.post(msg.url(nil, "level-editor", "level-editor"), "on_popup_openend",{is_open = false})
					gui.set_enabled(gui.get_node("save_changes_popup"), false)
					self.is_animating = false
				end)
			end
		end
	end

	if gui.is_enabled(gui.get_node("save_popup")) then

		local is_modified = false

		if self.input_clicked and action_id == hash("type") then
			pprint(action.text)
			local new_text = self.input_text or ""
			if #self.input_text < 40 then
				new_text = (self.input_text or "") .. string.upper(action.text)
			end
			set_save_popup_input_text(self, new_text)
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

		if self.backspace_held and self.input_clicked and action_id == hash('backspace') then
			if not self.backspace_timer then 
				self.backspace_timer = timer.delay(.05, true, function ()
					set_save_popup_input_text(self, self.input_text:sub(1, #self.input_text-1))
				end)
			end
			
			
		end

		

		if self.input_clicked and action_id == hash("backspace") and action.pressed then
			self.backspace_initial_timer = timer.delay(.4, false, function ()
				self.backspace_held = true
			end)
			set_save_popup_input_text(self, self.input_text:sub(1, #self.input_text-1))
			is_modified = true
		end

		

		

		if is_modified then
			save_popup_set_error_state(false)
			
			
			

			
			
			

			
			
			

			

			
			
			
			

			
			
			

			
			
			

			
			
			
			
			

			
			
			

			
			
			

			
			
			
			
			

			
			
			

			
			
			

			
			
		end
	end

	if gui.is_enabled(gui.get_node("upload_popup")) then
		local is_modified = false
		if self.input_clicked and action_id == hash("type") then
			pprint(action.text)
			local new_text = self.input_text or ""
			if #self.input_text < 40 then
				new_text = (self.input_text or "") .. string.upper(action.text)
			end
			set_upload_popup_input_text(self, new_text)
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

		if self.backspace_held and self.input_clicked and action_id == hash('backspace') then
			if not self.backspace_timer then 
				self.backspace_timer = timer.delay(.05, true, function ()
					set_upload_popup_input_text(self, self.input_text:sub(1, #self.input_text-1))
				end)
			end
		end

		if self.input_clicked and action_id == hash("backspace") and action.pressed then
			self.backspace_initial_timer = timer.delay(.4, false, function ()
				self.backspace_held = true
			end)
			set_upload_popup_input_text(self, self.input_text:sub(1, #self.input_text-1))
			is_modified = true
		end

		if is_modified then
			upload_popup_set_error_state(false)
			
			
			

			

			
			
			
			
			
			
			
			
			
			
			
			
			
			
			
			
			
			
			
			
			
		end
	end
	
	
	
	
	
	
	
	

	if ctrl_pressed then
		if action_id == hash("debugkey_z") and action.pressed then
			msg.post(msg.url(nil, "level-editor", "level-editor"), "undo")
		elseif action_id == hash("debugkey_y") and action.pressed then
			msg.post(msg.url(nil, "level-editor", "level-editor"), "redo")
		
		
		
		
		
		
		end
	end

	ctrl_pressed = action_id == hash("ctrl") and not action.released

	
	
	
	
	
end
