











local lang_internal = require("lang.lang_internal")
local lang_debug_page = require("lang.lang_debug_page")


local M = {}











local LANG_DICT = nil



M.state = nil



local LANGS_ORDER = nil



local AVAILABLE_LANGS_MAP = nil


function M.reset_state()
	M.state = {
		lang = lang_internal.SYSTEM_LANG,
	}
	LANG_DICT = {}
	LANGS_ORDER = {}
	AVAILABLE_LANGS_MAP = {}
end
M.reset_state()





local function is_lang_available(lang_id)
	return AVAILABLE_LANGS_MAP[lang_id] ~= nil
end





local function get_lang_data(lang_id)
	return AVAILABLE_LANGS_MAP[lang_id]
end





function M.init(available_langs, lang_on_start)
	if not available_langs or #available_langs == 0 then
		lang_internal.logger:error("No available languages provided to init")
		return
	end

	
	LANGS_ORDER = {}
	AVAILABLE_LANGS_MAP = {}
	LANG_DICT = {}

	
	local default_lang = nil
	for index, lang_data in ipairs(available_langs) do
		table.insert(LANGS_ORDER, lang_data.id)
		AVAILABLE_LANGS_MAP[lang_data.id] = lang_data
		default_lang = default_lang or lang_data.id
	end

	
	local system_lang = lang_internal.SYSTEM_LANG
	if not is_lang_available(system_lang) then
		system_lang = nil
	end

	
	local target_lang = lang_on_start or M.state.lang or system_lang or default_lang

	
	if not is_lang_available(target_lang) then
		lang_internal.logger:warn("Target language not available, falling back to default", {
			target_lang = target_lang,
			default_lang = default_lang
		})
		target_lang = default_lang
	end

	M.set_lang(target_lang)
end




function M.set_logger(logger_instance)
	lang_internal.logger = logger_instance or lang_internal.empty_logger
end





function M.set_lang(lang_id)
	if not lang_id then
		lang_internal.logger:error("Language id cannot be nil")
		return false
	end

	local previous_lang = M.state.lang
	local previous_loaded_lang = previous_lang or nil

	
	if not is_lang_available(lang_id) then
		lang_internal.logger:error("Lang not found", lang_id)
		return false
	end

	
	local lang_data = get_lang_data(lang_id)
	if not lang_data then
		lang_internal.logger:error("Lang data not found", lang_id)
		return false
	end

	local is_lua = type(lang_data.path) == "table"
	
	local path_str = type(lang_data.path) == "string" and lang_data.path  or nil
	local is_csv = not is_lua and path_str and string.find(path_str, ".csv")
	local is_json = not is_lua and path_str and string.find(path_str, ".json")

	if is_lua then
		M.set_lang_table(lang_data.path)
		M.state.lang = lang_id
	elseif is_csv and path_str then
		M.load_from_csv(path_str, lang_id)
	elseif is_json and path_str then
		M.load_from_json(path_str, lang_id)
	else
		lang_internal.logger:error("Lang format not supported", lang_data.path or "unknown")
		return false
	end

	lang_internal.logger:info("Lang changed", { previous_lang = previous_loaded_lang, lang = lang_id })
	return true
end







function M.load_from_json(lang_path, locale_id)
	locale_id = locale_id or M.state.lang or lang_internal.SYSTEM_LANG

	local is_parsed, lang_data = pcall(lang_internal.load_json, lang_path)
	if not is_parsed then
		lang_internal.logger:error("Can't load or parse lang file. Check the JSON file is valid", lang_path)
		return nil
	end
	if not lang_data then
		lang_internal.logger:error("Lang file not found", lang_path)
		return nil
	end

	M.set_lang_table(lang_data)
	M.state.lang = locale_id

	return lang_data
end







function M.load_from_csv(csv_path, locale_id)
	locale_id = locale_id or M.state.lang or lang_internal.SYSTEM_LANG

	local langs_data = lang_internal.load_csv(csv_path)
	if not langs_data then
		lang_internal.logger:error("Can't load or parse lang file. Check the CSV file is valid", csv_path)
		return nil
	end

	if not langs_data[locale_id] then
		lang_internal.logger:error("Lang code not found", locale_id)
		return nil
	end

	M.set_lang_table(langs_data[locale_id])
	M.state.lang = locale_id

	return langs_data[locale_id]
end


function M.set_lang_table(lang_table)
	LANG_DICT = lang_table
end




function M.set_next_lang()
	M.set_lang(M.get_next_lang())

	return M.get_lang()
end




function M.get_next_lang()
	local current_lang = M.get_lang()
	local all_langs = M.get_langs()
	local current_index = lang_internal.index_of(all_langs, current_lang) or 1

	local next_index = current_index + 1
	if next_index > #all_langs then
		next_index = 1
	end

	return all_langs[next_index]
end




function M.get_lang()
	return M.state.lang
end




function M.get_default_lang()
	return lang_internal.SYSTEM_LANG
end





function M.txt(text_id)
	return LANG_DICT[text_id] or text_id or ""
end





function M.txr(text_id)
	local texts = lang_internal.split(LANG_DICT[text_id], "\n")
	return texts[math.random(1, #texts)]
end






function M.txp(text_id, ...)
	return string.format(M.txt(text_id), ...)
end





function M.is_exist(text_id)
	return (not not LANG_DICT[text_id])
end




function M.get_langs()
	return LANGS_ORDER
end




function M.get_lang_table()
	return LANG_DICT
end





function M.is_lang_available(lang_id)
	return is_lang_available(lang_id)
end





function M.render_properties_panel(druid, properties_panel)
	lang_debug_page.render_properties_panel(M, druid, properties_panel)
end


return M
