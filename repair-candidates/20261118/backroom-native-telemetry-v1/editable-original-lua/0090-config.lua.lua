local M = {}

M.recommended_long = 1031
M.recommended_short = 580
M.display_w = sys.get_config_int("display.width")
M.display_h = sys.get_config_int("display.height")
M.window_scale = window.get_display_scale()



function M.set_Z_index(url, z)
	local pos = go.get_position(url)
	pos.z = z
	go.set_position(pos, url)
end

function M.split(text, char)
	local parts = {}

	for p in string.gmatch(text, "[^" .. char .. "]+") do
		table.insert(parts, p)
	end

	return parts
end

function M.is_in_table(value, tbl)
	if tbl == nil then
		return false
	end

	for _, v in pairs(tbl) do
		if v == value then
			return true
		end
	end

	return false
end

function M.join(parts, char)
	if parts == nil then
		return ""
	end

	local text_parts = {}
	for i, value in ipairs(parts) do
		text_parts[i] = tostring(value)
	end

	return table.concat(text_parts, char or "")
end

function M.sign(x)
    return x > 0 and 1 or (x < 0 and -1 or 0)
end

return M