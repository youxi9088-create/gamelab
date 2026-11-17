local savemanager = require("_modules.savemanager")
local config = require("_services.config")
local analytics = require("_services.analytics")
local iap
do
    local ok
    ok, iap = pcall(require, "iap")
    if not ok then iap = nil end
end


local M = {}

local iap_ready = false
local on_initialize_done = nil

local buy_in_process = false
local pending_analytics_tx = nil


local on_purchase_success = nil
local on_purchase_failure = nil
local on_restore = nil


local cb_list
local cb_listener
local provider_is_apple
local finish_or_acknowledge
local complete_purchase

local android_json
local grants_entitlement
local mark_gross_sent
local is_gross_sent
local try_analytics
local track_IAP_GROSS_ADDED
local track_UNIQUE_FIRST_IAP
local safe_call


M.products = {}             
M.products_by_id = {}       
local product_ids_googleplay = {
    remove_ads = config.iap_product_remove_ads,
}
local product_ids_devicestore = {
    remove_ads = config.iap_product_remove_ads,
}



function M.init()                                   
    if (not iap) then return end

    
    iap.set_listener(cb_listener)
    iap.list(M.get_product_ids(), cb_list)
end

cb_list = function(self, products, error)
    if (not iap) then return end
    if error then
        if pending_analytics_tx then
            pending_analytics_tx = nil
            buy_in_process = false
        end
        return
    end

    
    
    M.products = products or {}
    M.products_by_id = {}
    for _, product in pairs(M.products) do
        if type(product) == "table" and product.ident then
            M.products_by_id[product.ident] = product
        end
    end

    
    for _, id in pairs(M.get_product_ids()) do
        savemanager.set_purchase(id, false)
    end
    if provider_is_apple() then iap.restore()
    elseif iap.process_pending_transactions then iap.process_pending_transactions() end

    
    if pending_analytics_tx then
        try_analytics(pending_analytics_tx)
        pending_analytics_tx = nil
        buy_in_process = false
    end
    if iap_ready == false then
        safe_call(on_initialize_done)
        iap_ready = true
    end
end

cb_listener = function(self, transaction, error)
    if not iap then return end
    if not transaction then
        if buy_in_process then
            buy_in_process = false
            safe_call(on_purchase_failure)
        end
        return
    end
    if error then
        if buy_in_process then
            buy_in_process = false
            safe_call(on_purchase_failure)
        end
        return
    end

    local state = transaction.state
    
    if state == iap.TRANS_STATE_PURCHASED then
        complete_purchase(self, transaction)
    
    elseif state == iap.TRANS_STATE_RESTORED then
        if grants_entitlement(transaction) then
            finish_or_acknowledge(transaction)
            savemanager.set_purchase(transaction.ident, true)
            if buy_in_process then
                
                safe_call(on_purchase_success)
                if not pending_analytics_tx then buy_in_process = false end
            else
                safe_call(on_restore)
            end
        end
    
    elseif state == iap.TRANS_STATE_FAILED then
        
        if buy_in_process then
            if provider_is_apple() then
                finish_or_acknowledge(transaction)
            end
            safe_call(on_purchase_failure)
            buy_in_process = false
        end
    
    elseif state == iap.TRANS_STATE_UNVERIFIED then
    end
end



function M.buy(id, on_success, on_fail)
    
-- Local edition: this boundary has no remote/provider success response.
if type(on_fail) == "function" then on_fail() end
end


function M.restore()
    if not iap then return end
    iap.restore()
end



function M.get_product_ids()
    return (provider_is_apple()) and product_ids_devicestore or product_ids_googleplay
end
function M.get_product_by_id(id)
    return M.products_by_id[id]
end
function M.has_remove_ads()
    if not iap then return false end
    local id = M.get_product_ids().remove_ads
    return id and savemanager.data.purchases and savemanager.data.purchases[id] == true
end



complete_purchase = function(self, transaction)
    if (not iap) or (not transaction) or (not transaction.ident) then return end
    if not grants_entitlement(transaction) then
        if buy_in_process then
            buy_in_process = false
            safe_call(on_purchase_failure) end
        return
    end

    finish_or_acknowledge(transaction)
    savemanager.set_purchase(transaction.ident, true)
    
    if buy_in_process == true then
        try_analytics(transaction)
        safe_call(on_purchase_success)
        if not pending_analytics_tx then buy_in_process = false end
    end
end

finish_or_acknowledge = function(transaction)
    if not iap then return end
    if provider_is_apple() then
        iap.finish(transaction)
    else
        iap.acknowledge(transaction)
    end
end

provider_is_apple = function()
    if not iap then return false end
    local provider_is_apple = (iap.get_provider_id() == iap.PROVIDER_ID_APPLE)
    return provider_is_apple
end


android_json = function(transaction)        
    if provider_is_apple() or not transaction or not transaction.original_json then return nil end
    local ok, d = pcall(json.decode, transaction.original_json)
    if not ok or type(d) ~= "table" then return nil end
    return d
end
grants_entitlement = function(transaction)  
    if not iap or not transaction then return false end
    if transaction.state ~= iap.TRANS_STATE_PURCHASED and transaction.state ~= iap.TRANS_STATE_RESTORED then return false end
    if provider_is_apple() then return true end
    local d = android_json(transaction)
    if not d then return true end
    local s = d.purchaseState or d.purchase_state
    if type(s) == "string" then s = tonumber(s) end
    return s ~= 1 and s ~= 2  
end



try_analytics = function(transaction)
    if not buy_in_process then return end
    local product = M.products_by_id[transaction.ident]
    if not product or not product.price or not product.currency_code then
        pending_analytics_tx = transaction
        return
    end
    track_IAP_GROSS_ADDED(product, transaction)
end

is_gross_sent = function(product_id)
    return savemanager.get_iap_gross_sent(product_id)
end
mark_gross_sent = function(product_id)
    savemanager.set_iap_gross_sent(product_id, true)
end

local function is_consumable(product_id)
    return product_id and config.iap_product_consumable and config.iap_product_consumable[product_id] == true
end

track_IAP_GROSS_ADDED = function(product, transaction)
    if not product or not product.price then return end
    local product_id = transaction.ident
    
    if not is_consumable(product_id) and is_gross_sent(product_id) then return end
    local d = android_json(transaction)
    local token = d and (d.purchaseToken or d.purchase_token) or nil
    analytics.track_IAP_GROSS_ADDED(product.price, product.currency_code, transaction.trans_ident, product_id, token)
    if not is_consumable(product_id) then
        mark_gross_sent(product_id)
    end
    track_UNIQUE_FIRST_IAP()
end
track_UNIQUE_FIRST_IAP = function()
    analytics.track_UNIQUE_FIRST_IAP()
end


safe_call = function(f)
    if f and type(f) == "function" then
        f()
    end
end
function M.get_iap_ready()
    return iap_ready
end
function M.set_on_initialize_done(new_function)
    LOG_INFO("Devicestore initialization complete")
    on_initialize_done = new_function
end
function M.set_on_restore(new_function)
    on_restore = new_function
end

return M