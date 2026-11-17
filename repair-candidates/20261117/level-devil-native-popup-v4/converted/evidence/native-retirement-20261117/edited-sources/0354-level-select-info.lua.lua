local savemanager = require("_modules.savemanager")

local M = {}

M.PORTAL_START = savemanager.BONUS_PORTAL_START
M.PORTAL_COUNT = 5
M.internet_check_callback = nil

M.sublevels = {
    C1_1 = {
        background = "c1_sublevel_background",
        portal_layout = "c1_1",
        levels = 5,
        chapter = 1,
        portal_start = 100,
        portal_unlock_requirement = 10
    },
    C2_1 = {
        background = "c2_sublevel1_background",
        portal_layout = "c2_1",
        levels = 5,
        chapter = 2,
        portal_start = 100,
        portal_unlock_requirement = 2
    },
    C2_2 = {
        background = "c2_sublevel2_background",
        portal_layout = "c2_2",
        levels = 5,
        chapter = 2,
        portal_start = 101,
        portal_unlock_requirement = 8
    },
    C3_1 = {
        background = "c3_sublevel1_background",
        portal_layout = "c3_1",
        levels = 5,
        chapter = 3,
        portal_start = 100,
        portal_unlock_requirement = 6
    },
    C3_2 = {
        background = "c3_sublevel2_background",
        portal_layout = "c3_2",
        levels = 5,
        chapter = 3,
        portal_start = 101,
        portal_unlock_requirement = 13
    },
}

M.current_selected_door = nil
M.current_sublevel = nil
M.current_chapter = 1

function M.is_sublevel_portal_conquered(sublevel_id, level_index)
    return savemanager.get_bonus_portal_conquered(sublevel_id, level_index)
end

function M.set_sublevel_portal_conquered(sublevel_id, level_index, conquered)
    savemanager.set_bonus_portal_conquered(sublevel_id, level_index, conquered)
end

function M.sublevel_has_watched_ad(sublevel_id,level_index)
    return html5 and true or savemanager.get_bonus_portal_ad_watched(sublevel_id, level_index)
end

function M.set_sublevel_ad_watched(sublevel_id, level_index, has_watched)
    return savemanager.set_bonus_portal_ad_watched(sublevel_id, level_index, has_watched)
end

function M.get_sublevel_ad_watched(sublevel_id,level_index)
    return html5 and true or savemanager.get_bonus_portal_ad_watched(sublevel_id,level_index)
end

function M.is_sublevel_portal_unlocked(sublevel_id, level_index)
    return savemanager.is_bonus_portal_unlocked(sublevel_id, level_index)
end

function M.get_highest_unlocked_sublevel_portal(sublevel_id, portal_start, count)
    count = count or M.PORTAL_COUNT
    return savemanager.get_highest_unlocked_bonus_portal(sublevel_id, count)
end

function M.get_highest_completed_sublevel_portal(sublevel_id, portal_start, count)
    count = count or M.PORTAL_COUNT
    return savemanager.get_highest_completed_bonus_portal(sublevel_id, count)
end






function M.check_internet_connection(callback)
    
-- Local edition: this boundary has no remote/provider success response.
if type(callback) == "function" then callback(false) end
end

return M
