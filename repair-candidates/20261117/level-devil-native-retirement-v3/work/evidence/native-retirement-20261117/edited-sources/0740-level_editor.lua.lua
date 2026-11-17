local utility = require("_modules.utility")
local default_values = require("_modules.tiled.default_values")
local levelmanager = require("_modules.levelmanager")
local gamemanager = require("_modules.gamemanager")
local remote_config = require("_modules.remote_config.remote_config")

local level_has_hero = false


local M = {}

M.new_save = false
M.recieved_file = nil
M.browser_share_level_code = nil
M.share_level_code = nil


M.ready_for_upload = false
M.tile_pool_amount = 500
M.tile_pool = {}
M.preview_pool = {}
M.ghost_pool = {}
M.dotted_line_pool = {}

M.bounds = {
    start_x = 4,
    start_y = 7,
    width = 27,
    height = 15,
}
M.TILESIZE = 16

M.UNDOABLE_ACTIONS = {
    move = "move",
    multi_place = "multi_place",
    multi_erase = "multi_erase"
}

M.STATES = {
    PLACING = "placing",
    ERASE = "erase",
    SELECT = "select",
    LINKING = "linking",
    SINGLE_SELECT = "single_select"
}

M.SPRITES = {
    tile = "tile",
    hero = "hero",
    door = "door",
    spike = "spike",
    spring = "spring",
    trigger = "trigger",
    sawblade = "sawblade",
    spike_single = "spike_single",
    coin = "coin",
    onewayplatform = "onewayplatform",
    cross_spike = "revolve_follower",
}

M.OBJECT_TYPES = {
    TILEMAP = {
        create = function(object)
            local count = 0
            for _, _ in pairs(object.values) do
                count = count + 1
            end
            if object.values.sprite and object.values.collision_effect and object.values.sprite == M.SPRITES.tile and object.values.collision_effect == "ground" and count <= 2 then 
                local tilemap_url = msg.url(nil, "tilemap", "level")
                tilemap.set_tile(tilemap_url, "level", object.grid_pos.x, object.grid_pos.y, 1)
            
            
            
            else 
                M.place_trap(object)
            end
        end,
        id = "tilemap"
    },
    OBJECT = {
        create = function(object)
            M.place_trap(object)
        end,
        id = "object"
    },
    HERO = {
        create = function(object)
            M.place_hero(object)
        end,
        id = "hero"
    },
    TRIGGER = {
        create = function(object)
            M.place_trigger(object)
        end,
        id = "trigger"
    }
}



M.TILE_PRESETS = {
    [1] = {
        type = M.OBJECT_TYPES.TILEMAP,
        values = {
            sprite = M.SPRITES.tile,
            collision_effect = "ground",
        },
    },
    [2] = {
        type = M.OBJECT_TYPES.OBJECT,
        limit = 32,
        values = {
            collision_effect = "door",
            sprite = M.SPRITES.door,
            collider_height = 10,
            collider_width = 8,
        },
    },
    [3] = {
        type = M.OBJECT_TYPES.HERO,
        limit = 8,
        values = {
            sprite = M.SPRITES.hero,
        },
    },
    [4] = {
        type = M.OBJECT_TYPES.OBJECT,
        values = {
            collision_effect = "death",
            sprite = M.SPRITES.spike,
            collider_height = 4,
            collider_width = 8,
            collider_alignment = "south",
        }
    },
    [5] = {
        type = M.OBJECT_TYPES.OBJECT,
        values = {
            collision_effect = "death",
            sprite = M.SPRITES.sawblade,
            rotate_sprite = 360,
            collider_radius = 6,
            x_starting_scale = .9,
            y_starting_scale = .9,
        }
    },
    [6] = {
        type = M.OBJECT_TYPES.OBJECT,
        values = {
            collision_effect = "spring",
            sprite = M.SPRITES.spring,
            collider_height = 2,
            collider_width = 12,
            collider_alignment = "south"
        }
    },
    [7] = {
        type = M.OBJECT_TYPES.TRIGGER,
        values = {
            sprite = M.SPRITES.trigger,
            traps_to_activate = "",
            connections = {},
        }
    },
    [8] = {
        type = M.OBJECT_TYPES.OBJECT,
        values = {
            collision_effect = "death",
            sprite = M.SPRITES.spike_single,
            collider_height = 3,
            collider_width = 4,
            collider_alignment = "south",
            display_name = "Small spike"
        }
    },
    [9] = {
        type = M.OBJECT_TYPES.OBJECT,
        values = {
            collision_effect = "coin",
            sprite = M.SPRITES.coin,
            collider_height = 6,
            collider_width = 6,
            collider_alignment = "none",
        }
    },
    [10] = {
        type = M.OBJECT_TYPES.OBJECT,
        values = {
            collision_effect = "onewayplatform",
            sprite = M.SPRITES.onewayplatform,
            collider_height = 2,
            collider_width = 14,
            collider_alignment = "north",
            display_name = "One-way"
        }
    },
    [11] = {
        type = M.OBJECT_TYPES.OBJECT,
        values = {
            collision_effect = "death",
            sprite = M.SPRITES.cross_spike,
            collider_radius = 7,
            collider_alignment = "none",
            display_name = "Cross spike"
        }
    },
}

M.CURRENT_STATE = M.STATES.PLACING
M.CURRENT_TILE = 1
M.CURRENT_LAYER = 1

M.LAYER_COUNT = 2

M.tilemap_data = {}
M.inactive_maps = {}
M.active_ghosts = {}
M.active_dotted_lines = {}

M.preview_data = {}
M.inactive_layer_preview = {}
M.save_slot_to_load = 1
M.MAX_SAVE_SLOTS = 3
M.save_slots = {}

function M.change_input_focus(new_focus)
    if utility.contains(M.INPUT_FOCUS_TYPES, new_focus) then
        M.current_input_focus = new_focus
    end
end

function M.get_cell(index)
    for y, column in pairs(M.tilemap_data) do
        for x, cell in pairs(column) do
            if cell.index == index then
                return cell
            end
        end
    end
    return nil
end

function M.get_cell_xy(index)
    for y, column in pairs(M.tilemap_data) do
        for x, cell in pairs(column) do
            if cell.index == index then
                return x,y
            end
        end
    end
    return nil
end

function M.modify_activation_effect(object_index,effect_index,effect)
    
    local x,y = M.get_cell_xy(object_index)
    if not M.tilemap_data[y][x].values.activation_effects then
        M.tilemap_data[y][x].values.activation_effects = {}
    end
    M.tilemap_data[y][x].values.activation_effects[effect_index] = effect
    
    msg.post(msg.url(nil, "level-editor", "level-editor"), "on_object_modified",{object_index = object_index})
end

function M.save_modules(object_index,modules)
    modules = utility.deep_copy(modules)
	for _, value in ipairs(modules) do
		value.node = {}
        for _, value in ipairs(value.entries) do
            value.tree = {}
        end
        
	end
    local x,y = M.get_cell_xy(object_index)
    M.tilemap_data[y][x].property_window_modules = modules
    msg.post(msg.url(nil, "level-editor", "level-editor"), "on_object_modified",{object_index = object_index})
end

function M.modify_object_values(object_index,properties)
    
    local x,y = M.get_cell_xy(object_index)
    for key, value in pairs(properties) do
        M.tilemap_data[y][x].values[key] = value
    end
    msg.post(msg.url(nil, "level-editor", "level-editor"), "on_object_modified",{object_index = object_index})
end

function M.read_data(file)
    pprint(file)
    if not file then
        level_has_hero = false
        pprint(M.tilemap_data)    
        M.inactive_maps[M.CURRENT_LAYER] = utility.deep_copy(M.tilemap_data)
        for map_index, map in ipairs(M.inactive_maps) do
            for y, column in pairs(map) do
                for x, cell in pairs(column) do
                    local object = {
                        grid_pos = { x = x, y = y },
                        pos = { x = x * 16, y = y * 16 }, 
                        values = cell.values,
                        width = 16,
                        height = 16,
                        index = cell.index or -1,
                        layer = map_index or 1
                    }
                    
                    if cell.type then
                        cell.type.create(object)
                    end
                end
            end
        end
            
        
    else
        local table = file
        if type(file) == "string" then
            table = json.decode(file)
        end
        if table then
            for key, value in pairs(table) do
                
                local type_key = "TILEMAP"

                for key, type in pairs(M.OBJECT_TYPES) do
                    if type.id == value.t then
                        type_key = key
                    end
                end

                local grid_pos = {x = value.g.x,y = value.g.y}

                local object = {
                    width = 16,
                    height = 16,
                    index = value.i or -1,
                    values = value.v,
                    grid_pos = grid_pos,
                    pos = {x = grid_pos.x * 16,y = grid_pos.y * 16},
                    layer = value.l
                }

                if M.OBJECT_TYPES[type_key] then
                   M.OBJECT_TYPES[type_key].create(object)
                end

            end
        end
    end
    if not level_has_hero then
        M.place_hero({ pos = { x = 300, y = 470 } }) 
        pprint("[LEVEL EDITOR] WARNING, no hero found in tilemap_data, placing one manually at 300,470")
    end
end

function M.place_hero(object) 
    local newpos = vmath.vector3(object.pos.x, object.pos.y, 2)
    newpos = vmath.vector3(newpos.x - 8, newpos.y - 8, newpos.z)
    local transform = { pos = newpos, rot = nil, scale = vmath.vector3(1, 1, 1) }

    local properties = utility.overlay_default_values({}, default_values.HERO)
    properties.tiled = { name = "hero", pos = { x = object.pos.x, y = object.pos.y }, id = 99 }
    levelmanager.LEVELSETUP_HERO(transform, properties)
    level_has_hero = true
end

function M.place_trap(object)
    
    local transform = { pos = vmath.vector3(object.pos.x - object.width * .5, object.pos.y - object.height * .5, 0 ), scale = vmath.vector3(1,1,1), rot = vmath.euler_to_quat(0,0,object.values.rotation or 0) }
    local values = object.values
    values._TRAP_INDEX = object.index + (object.layer * M.tile_pool_amount)
    local properties = utility.overlay_default_values(values or {}, default_values.OBJECT)
    properties.sprite = properties.sprite == M.SPRITES.tile and "ground" or properties.sprite
    properties.z_position = object.layer and math.abs(object.layer - (M.LAYER_COUNT + 1)) or 0

    transform.scale.x = object.values.x_starting_scale or 1
    transform.scale.y = object.values.y_starting_scale or 1
    levelmanager.LEVELSETUP_TRAP(transform, properties)
end

function M.place_trigger(object)
    
    local transform = { pos = vmath.vector3(object.pos.x - object.width * .5, object.pos.y - object.height * .5, 0) }
    local values = object.values
    values._TRIGGER_INDEX = object.index + (object.layer * M.tile_pool_amount)
    values.is_enabled = false
    local properties = utility.overlay_default_values(values or {}, default_values.TRIGGER)
    
    local trap_string_split = utility.split_string(properties.traps_to_activate, ",")
    local new_string = ""
    for index, value in ipairs(trap_string_split) do
        new_string = new_string .. "," .. tonumber(value) + (object.layer * M.tile_pool_amount)
    end
    properties.traps_to_activate = new_string

    

    levelmanager.LEVELSETUP_TRIGGER(transform, properties)

    local values_button = {
        is_visible = false,
        _TRAP_INDEX = object.index + (object.layer * M.tile_pool_amount),
        sprite = "button",
        collision_effect = "button",
        special_effects = {
            [1] = {
                effect = "button",
                parameters = {
                    sfx_cooldown_done = "none",
                    allowed_activators = "hero",
                    is_visible = true,
                    delay_per_trigger = "0",
                    triggers_to_activate = tostring(object.index + (object.layer * M.tile_pool_amount)),
                    reset_cooldown = 0,
                    sfx_pressed = "button"
                }
            }
        },
    }
    local properties_button = utility.overlay_default_values(values_button, default_values.OBJECT)

    levelmanager.LEVELSETUP_TRAP(transform, properties_button)
end


local COLLECTION_GROUP_ID = "levels2"


local BASE_URL = "libinj9yai"

















function M.get_level_from_id(id,callback)
    
-- Local edition: this boundary has no remote/provider success response.
if type(callback) == "function" then callback(nil) end
end
























function M.get_levels(callback,limit,offset)
    
-- Local edition: this boundary has no remote/provider success response.
if type(callback) == "function" then callback(nil) end
end

function M.copy_text(text_to_copy)
    pprint("Copying text to clipboard: ",text_to_copy)
    if html5 then
        local result = html5.run("navigator.clipboard")
        print(result)
        if result == "[object Clipboard]" then
            print("Trying to access clipboard")
            html5.run("clipboard_copy('" .. text_to_copy .. "')")
        else
            print("Can't access clipboard")
        end
        
        local escaped = text_to_copy:gsub("\\", "\\\\"):gsub("'", "\\'")
        local run_me = ""
        .. "var t = document.createElement('textarea');"
        .. "t.value = '" .. escaped .. "';"
        .. "t.setAttribute('readonly', '');"
        .. "t.style.position = 'absolute';"
        .. "t.style.left = '-9999px';"
        .. "t.style.top = (window.pageYOffset || document.documentElement.scrollTop) + 'px';"
        .. "t.style.fontSize = '12pt';"
        .. "document.body.appendChild(t);"
        .. "if (/ipad|iphone|ipod/i.test(navigator.userAgent)) {"
        .. "var r = document.createRange();"
        .. "r.selectNodeContents(t);"
        .. "var s = window.getSelection();"
        .. "s.removeAllRanges();"
        .. "s.addRange(r);"
        .. "t.setSelectionRange(0, 999999);"
        .. "} else {"
        .. "t.focus();"
        .. "t.setSelectionRange(0, t.value.length);"
        .. "}"
        .. "document.execCommand('copy');"
        .. "document.body.removeChild(t);"
        html5.run(run_me)
    
    elseif share then 
        share.text(text_to_copy)
    elseif clipboard then
        clipboard.copy(text_to_copy)
    else
        pprint("Unable to find suitable copy functionality")
        pprint("Text to copy: ", text_to_copy)
    end
end

















        





                

















function M.submit_level(level_data, name, callback)
    
-- Local edition: this boundary has no remote/provider success response.
if type(callback) == "function" then callback(0, nil) end
end

function M.set_browser_share_level_code(code)
    M.browser_share_level_code = code
    _AMP_EVENTS.CUSTOMLEVEL_STARTED.properties.id = code
    _AMP_EVENTS.CUSTOMLEVEL_COMPLETED.properties.id = code
end


function M.patch_level(level_data,code,callback)
    
-- Local edition: this boundary has no remote/provider success response.
return false
end

return M
