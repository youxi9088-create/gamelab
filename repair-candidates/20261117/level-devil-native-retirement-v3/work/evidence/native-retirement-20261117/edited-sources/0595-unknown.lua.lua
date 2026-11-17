local uuid4 = uuid4                             
local config = require("_services.config")
local geo = require("_services.geo")
local utility = require("_modules.utility")
local savemanager = require("_modules.savemanager")

local M = {}


local get_session_id
local make_insert_id
local get_state
local load_state
local save_state
local get_day_after_install
local amplitude_httprequest_listener
local get_user_properties


local device_id = nil
local media_source = "unknown"
local first_launch_date = "unknown"
local first_launch_timestamp
M.idfa_gaid = "00000000-0000-0000-0000-000000000000"

local function is_meaningful_media_source(value)
    return type(value) == "string" and value:match("%S") ~= nil and value ~= "unknown"
end


local function create_event(name)
    return { name = name, properties = {}, }
end
_AMP_EVENTS = {
    INSTALL_LAUNCHED =                          create_event("INSTALL_LAUNCHED"),
    SESSION_STARTED =                           create_event("SESSION_STARTED"),
    SESSION_COMPLETED =                         create_event("SESSION_COMPLETED"),
    LEVEL_STARTED =                             create_event("LEVEL_STARTED"),
    LEVEL_COMPLETED =                           create_event("LEVEL_COMPLETED"),
    SUBLEVEL_STARTED =                          create_event("SUBLEVEL_STARTED"),
    SUBLEVEL_COMPLETED =                        create_event("SUBLEVEL_COMPLETED"),
    MULTILEVEL_STARTED =                        create_event("MULTILEVEL_STARTED"),
    MULTILEVEL_COMPLETED =                      create_event("MULTILEVEL_COMPLETED"),
    MULTISUBLEVEL_STARTED =                     create_event("MULTISUBLEVEL_STARTED"),
    CUSTOMEDIT_OPENED =                         create_event("CUSTOMEDIT_OPENED"),
    CUSTOMEDIT_STARTED =                        create_event("CUSTOMEDIT_STARTED"),
    CUSTOMLEVEL_SAVED =                         create_event("CUSTOMLEVEL_SAVED"),
    CUSTOMLEVEL_STARTED =                       create_event("CUSTOMLEVEL_STARTED"),
    CUSTOMLEVEL_COMPLETED =                     create_event("CUSTOMLEVEL_COMPLETED"),
    PORTAL_OPENED =                             create_event("PORTAL_OPENED"),
    PORTAL_LEVEL_STARTED =                      create_event("PORTAL_LEVEL_STARTED"),
    PORTAL_LEVEL_COMPLETED =                    create_event("PORTAL_LEVEL_COMPLETED"),
    IAP_PURCHASE =                              create_event("IAP_PURCHASE"),
    IAP_PRESSED =                               create_event("IAP_PRESSED"),
    AD_STARTED =                                create_event("AD_STARTED"),
    AD_WATCHED =                                create_event("AD_WATCHED"),
    
}

M._install_id = nil
M._event_counter = 0
local session_id = nil


function M.initialize(callback)
    
-- Local edition: this boundary has no remote/provider success response.
if type(callback) == "function" then callback(false) end
end




function M.set_media_source(value)
    if not is_meaningful_media_source(value) then
        return false
    end

    media_source = value
    local state = load_state()
    if state.media_source ~= value then
        state.media_source = value
        if not save_state(state) then
            LOG_ERROR("[AMPLITUDE]: Failed to persist media source")
            return false
        end
    end
    LOG_INFO("[AMPLITUDE]: Media source updated to '" .. value .. "'.")
    return true
end


get_state = function()
    return sys.get_save_file(config.amplitude_savelocation.folder, config.amplitude_savelocation.file)
end
load_state = function()
    local ok, data = pcall(function()
        return sys.load(get_state())
    end)
    if ok and type(data) == "table" then
        return data
    end
    LOG_INFO("[AMPLITUDE]: Failed to load Save", data)
    return {}
end
save_state = function(data)
    local ok, error_message = pcall(function()
        sys.save(get_state(), data)
    end)
    if not ok then
        LOG_ERROR("[AMPLITUDE]: Failed to save State", error_message)
    end
    return ok
end



function M.track(name, properties, options)
    
-- Local edition: this boundary has no remote/provider success response.
return
end
amplitude_httprequest_listener = function (self, id, response)
    if sys.get_engine_info().is_debug then  
        LOG_INFO("[AMPLITUDE]: Response received with status " .. response.status .. ":", response.response)
    end
end

get_user_properties = function ()
    return {
        levels_played =                 savemanager.data.stats.total_portals_started or 0,
        sublevels_played =              savemanager.data.stats.total_levels_started or 0,
        levels_won =                    savemanager.data.stats.total_portals_completed or 0,
        deaths =                        savemanager.data.stats.deaths or 0,
        multiplayer_games_played =      savemanager.data.stats.total_versus_started or 0,
        multiplayer_games_completed =   savemanager.data.stats.total_versus_completed or 0,
        time_spent =                    savemanager.data.stats.total_session_time or 0,
        session_count =                 savemanager.get_session_number() or 0,
        forced_ads_watched =            savemanager.data.stats.total_interstitials_watched or 0,
        rewarded_ads_watched =          savemanager.data.stats.total_rewarded_watched or 0,
        no_ads_active =                 savemanager.get_purchase(config.iap_product_remove_ads) == true,
        sound_on =                      (savemanager.get_mute_state() == 1),     
        iap_purchases_made =            savemanager.get_iap_purchases_made(),
        money_spent =                   savemanager.get_money_spent(),
        media_source =                  media_source,
        install_date =                  first_launch_date,
        day_after_install =             get_day_after_install(first_launch_timestamp),
        custom_levels_created =         savemanager.data.stats.total_levels_made,
        custom_levels_played =          savemanager.data.stats.total_custom_levels_started,
        custom_levels_approved_played = savemanager.data.stats.total_curated_levels_started,
        portal_levels_played =          savemanager.data.stats.total_bonuslevels_started,
        idfa_gaid =                     M.idfa_gaid or "00000000-0000-0000-0000-000000000000",
    }
end


local function is_valid_install_id(value)
    return type(value) == "string" and #value >= 5
end
function M.get_install_id()
    LOG_INFO("[AMPLITUDE]: Retrieving Install ID")
    if M._install_id then
        return M._install_id
    end
    local state = load_state()
    
    if is_valid_install_id(state.install_id) then
        M._install_id = state.install_id
        return M._install_id
    end

    LOG_INFO("[AMPLITUDE]: Creating new Install ID")
    local ok, install_id = pcall(uuid4.generate)
    if not ok or not is_valid_install_id(install_id) then
        LOG_INFO("[AMPLITUDE]: uuid4.generate() failed, using fallback Install ID")
        local template = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
        install_id = string.gsub(template, "[xy]", function(c)
            local v
            if c == "x" then
                v = math.random(0, 15)
            else
                v = math.random(8, 11)  
            end
            return string.format("%x", v)
        end)
    end
    state.install_id = install_id
    if not save_state(state) then
        LOG_ERROR("[AMPLITUDE]: Failed to persist Install ID")
        return nil
    end
    M._install_id = install_id
    return M._install_id
end

get_day_after_install = function(timestamp)
    local seconds_since_install = os.time() - timestamp
    return math.max(0, math.floor(seconds_since_install / 86400))
end



make_insert_id = function(dedup_key)
    if dedup_key then
        return string.format("%s-%s", M.get_install_id(), dedup_key)
    end
    M._event_counter = M._event_counter + 1
    return string.format("%s-%d-%d", M.get_install_id(), utility.now_ms(), M._event_counter)
end

get_session_id = function ()
    return session_id or utility.now_ms()
end

return M