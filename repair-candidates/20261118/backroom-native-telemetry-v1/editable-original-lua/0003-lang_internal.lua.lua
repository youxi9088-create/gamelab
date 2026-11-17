local csv = require("lang.csv")









local M = {}

M.SYSTEM_LANG = sys.get_sys_info().language






function M.split(s, sep)
	sep = sep or "%s"
	local t = {}
	local i = 1
	for str in string.gmatch(s, "([^" .. sep .. "]+)") do
		t[i] = str
		i = i + 1
	end
	return t
end



local EMPTY_FUNCTION = function(_, message, context) end


M.empty_logger = {
	trace = EMPTY_FUNCTION,
	debug = EMPTY_FUNCTION,
	info = EMPTY_FUNCTION,
	warn = EMPTY_FUNCTION,
	error = EMPTY_FUNCTION,
}


M.logger = {
	trace = function(_, msg, data) print("TRACE:", msg, data) end,
	debug = function(_, msg, data) print("DEBUG:", msg, data) end,
	info = function(_, msg, data) print("INFO:", msg, data) end,
	warn = function(_, msg, data) print("WARN:", msg, data) end,
	error = function(_, msg, data) print("ERROR:", msg, data) end
}






function M.load_json(json_path)
	local resource, is_error = sys.load_resource(json_path)
	if is_error or not resource then
		return nil
	end

	return json.decode(resource)
end






function M.load_csv(csv_path)
	local resource, is_error = sys.load_resource(csv_path)
	if is_error or not resource then
		return nil
	end

	local data = {}
	local f = csv.openstring(resource)
	local headers = nil

	
	for fields in f:lines() do
		if not headers then
			
			headers = fields
			
			for i = 2, #headers do
				data[headers[i]] = {}
			end
		else
			
			local key = fields[1] 
			if key then
				
				for i = 2, #headers do
					if fields[i] then
						
						local value = fields[i]:gsub("\\n", "\n"):gsub("\\t", "\t"):gsub("\\r", "\r")
						data[headers[i]][key] = value
					end
				end
			end
		end
	end

	return data
end






function M.index_of(t, value)
	for i, v in ipairs(t) do
		if v == value then
			return i
		end
	end
	return nil
end


return M
