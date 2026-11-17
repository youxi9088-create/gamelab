local poki_sdk = poki_sdk

local M = {}
M.remove_ads = false
M.gameplay_stopped = true

M.stats_to_measure = {
    level = "level",
}

function M.commercial_break(callback)
    
-- Local edition: this boundary has no remote/provider success response.
if type(callback) == "function" then callback() end
end

function M.rewarded_break(callback,failed_callback)
    
-- Local edition: this boundary has no remote/provider success response.
if type(failed_callback) == "function" then failed_callback() end
end

function M.gameplay_state_changed(newstate)
    
-- Local edition: this boundary has no remote/provider success response.
if newstate == "start" then M.gameplay_stopped = false elseif newstate == "stop" then M.gameplay_stopped = true end
end

function M.exists() return poki_sdk end

function M.measure(category, what, action, info)
    
-- Local edition: this boundary has no remote/provider success response.
return
end

return M