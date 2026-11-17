local remote_config = require("_modules.remote_config.remote_config")
local utility       = require("_modules.utility")

local M = {}

M.curated_level_list = {}
M.played_list = {}
M.stats = {}
M.curated_list_current_offset = 0
M.curated_list_page_limit = 10
M.last_recorded_count = -1
local filename = sys.get_save_file("leveldevil", "infinite_mode")

function M.load_from_savefile()
    LOG_INFO("Loading infinite mode played table") 
	local data = sys.load(filename)
    if data then
        M.played_list = data.list or {}
        M.curated_list_current_offset = data.offset or 0
        LOG_INFO("Loading infinite mode played table success",data)
    end
end

function M.save_file()
    LOG_INFO("Saving infinite mode played",M.played_list)
	sys.save(filename, { list = M.played_list, offset = M.curated_list_current_offset})
end

function M.initialize(callback)
    
-- Local edition: this boundary has no remote/provider success response.
if type(callback) == "function" then callback(nil) end
end

function M.populate_curated_level_list(entries)
    M.curated_level_list = {}
    M.played_list = {}
    
    for index, value in ipairs(entries) do
        
        M.curated_level_list[value.id] = {
            played = false,
            id = value.id,
            level_string = value.level_data.level_string,
            name = value.name,
            index = index + math.max(M.curated_list_current_offset - M.curated_list_page_limit,0),
        }
        M.played_list[index + math.max(M.curated_list_current_offset - M.curated_list_page_limit,0)] = {
            played = false,
            level_code = value.id
        }
    end
    M.save_file()
    pprint(M.curated_level_list)
end

function M.select_random_from_unplayed(callback)
    local dupe = utility.deep_copy(M.curated_level_list)
    local unplayed = {}

    for _, value in pairs(M.played_list) do
        pprint(value)
        if value.played == false then
            table.insert(unplayed, dupe[value.level_code])
        end
    end

    pprint(#unplayed)

    if not next(unplayed) then
        M.get_levels(function (response)
            if not response then
                callback(nil)
            else 
                M.select_random_from_unplayed(callback)
            end
        end, M.curated_list_page_limit, M.curated_list_current_offset)
    else
        local random_entry = unplayed[math.random(1, #unplayed)]
        if callback then
            callback(random_entry)
        end
    end    
end

function M.reset_played_state()
    for _, value in pairs(M.curated_level_list) do
        value.played = false
    end
    M.played_list = {}
    M.curated_list_current_offset = 0
    M.curated_list_page_limit = 10
    M.save_file()
end

function M.set_played(level_code)
    M.curated_level_list[level_code].played = true
    for _, value in pairs(M.played_list) do
        if value.level_code == level_code then
            value.played = true
        end
    end
    
    
    
    M.save_file()
end

function M.get_play_state(level_code)
    return M.curated_level_list[level_code].played
end




function M.reset_stats()
    M.stats = {
        deaths = 0,
        time = 0,
        level_streak = 0,
        skips_used = 0,
    }
end
M.reset_stats()

function M.add_death()
    M.stats.deaths = M.stats.deaths + 1
end

function M.set_time(time)
    M.stats.time = time
end

function M.increment_level_streak()
    M.stats.level_streak = M.stats.level_streak + 1
end

function M.increment_skip_usage()
    M.stats.skips_used = M.stats.skips_used + 1
end

local BASE_URL = "libinj9yai"

function M.get_levels(callback,limit,offset)
    
-- Local edition: this boundary has no remote/provider success response.
if type(callback) == "function" then callback(nil) end
end


return M