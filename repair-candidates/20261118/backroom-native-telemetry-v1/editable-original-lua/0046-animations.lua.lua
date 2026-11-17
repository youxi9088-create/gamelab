local M = {}

function M.gui_button_press(node_url, base_factor, scale_factor)
	gui.cancel_animations(node_url, gui.PROP_SCALE)
	if not base_factor then base_factor = 1 end
	if not scale_factor then scale_factor = 0.15 end
	local sign_x = gui.get_scale(node_url).x > 0 and 1 or -1
	local sign_y = gui.get_scale(node_url).y > 0 and 1 or -1

	gui.animate(node_url, gui.PROP_SCALE, vmath.vector3((base_factor - scale_factor) * sign_x, (base_factor - scale_factor) * sign_y, 1.), gui.EASING_INOUTSINE, 0.1, 0, function()
		gui.animate(node_url, gui.PROP_SCALE, vmath.vector3(base_factor * sign_x, base_factor * sign_y, 1.), gui.EASING_OUTBACK, 0.1)
	end)
end

function M.gui_tint_flash(node_url, color_base, color_tint, duration, iterations)
	local loops = tonumber(iterations) or 0

	gui.cancel_animations(node_url, gui.PROP_COLOR)
	gui.set_color(node_url, color_base)

	local function animate_once(remaining)
		gui.animate(node_url, gui.PROP_COLOR, color_tint, gui.EASING_INOUTSINE, duration, 0, function()
			gui.animate(node_url, gui.PROP_COLOR, color_base, gui.EASING_INOUTSINE, duration, 0, function()
				if remaining == 0 then
					animate_once(0)
				elseif remaining > 1 then
					animate_once(remaining - 1)
				elseif remaining == 1 then
					gui.set_color(node_url, color_base)
				end
			end)
		end)
	end

	animate_once(loops)
end

function M.gui_stretch_loop(node_url, scale_base, scale_factor, duration, iterations)
	local loops = tonumber(iterations) or 0

	local function animate_once(remaining)
		gui.animate(node_url, gui.PROP_SCALE, vmath.vector3(scale_base + scale_factor, scale_base - scale_factor, 1), gui.EASING_INOUTSINE, duration, 0, function()
			gui.animate(node_url, gui.PROP_SCALE, vmath.vector3(scale_base - scale_factor, scale_base + scale_factor, 1), gui.EASING_INOUTSINE, duration, 0, function()
				if remaining == 0 then
					animate_once(0)
				elseif remaining > 1 then
					animate_once(remaining - 1)
				elseif remaining == 1 then
					gui.set_scale(node_url, vmath.vector3(scale_base, scale_base, 1))
				end
			end)
		end)
	end

	animate_once(loops)
end

function M.gui_big_small_loop(node_url, scale_base, scale_factor, duration, iterations, start_delay)
	local loops = tonumber(iterations) or 0

	local function animate_once(remaining, delay)
		gui.animate(node_url, gui.PROP_SCALE, vmath.vector3(scale_base + scale_factor, scale_base + scale_factor, 1), gui.EASING_INOUTSINE, duration, delay or 0, function()
			gui.animate(node_url, gui.PROP_SCALE, vmath.vector3(scale_base - scale_factor, scale_base - scale_factor, 1), gui.EASING_INOUTSINE, duration, 0, function()
				if remaining == 0 then
					animate_once(0)
				elseif remaining > 1 then
					animate_once(remaining - 1)
				elseif remaining == 1 then
					gui.set_scale(node_url, vmath.vector3(scale_base, scale_base, 1))
				end
			end)
		end)
	end

	animate_once(loops, start_delay)
end

function M.gui_appear_scale(nodes_url, scale_base, scale_factor, duration, on_done)
	for i_node, node in pairs(nodes_url) do
		local start_scale = gui.get_scale(node) * scale_base

		gui.cancel_animations(node, gui.PROP_SCALE)
		gui.set_scale(node, start_scale)
		gui.set_enabled(node, true)
		gui.animate(node, gui.PROP_SCALE, scale_factor, gui.EASING_OUTCUBIC, duration, 0, function()
			if on_done and i_node == #nodes_url then
				on_done()
			end
		end)
	end
end

function M.gui_float_loop(node_url, amplitude, duration, playback)
	if playback == nil then
		playback = gui.PLAYBACK_LOOP_PINGPONG
	end
	gui.cancel_animations(node_url, gui.PROP_POSITION)
	local init_pos = gui.get_position(node_url)
	gui.animate(node_url, gui.PROP_POSITION, init_pos + amplitude, gui.EASING_INOUTSINE, duration, 0, nil, playback)
end

function M.go_float_loop(node_url, amplitude, duration)
	go.cancel_animations(node_url, "position.y")
	local init_pos = go.get_position(node_url)
	go.animate(node_url, "position.y", go.PLAYBACK_LOOP_PINGPONG, init_pos.y + amplitude, go.EASING_INOUTSINE, duration)
end

function M.go_stretch_loop(node_url, scale_base, scale_factor, duration)
	go.animate(node_url, "scale", go.PLAYBACK_ONCE_FORWARD, vmath.vector3(scale_base + scale_factor, scale_base - scale_factor, 1), go.EASING_INOUTSINE, duration, 0, function()
		go.animate(node_url, "scale", go.PLAYBACK_ONCE_FORWARD, vmath.vector3(scale_base - scale_factor, scale_base + scale_factor, 1), go.EASING_INOUTSINE, duration, 0, function()
			M.go_stretch_loop(node_url, scale_base, scale_factor, duration)
		end)
	end)
end

function M.go_tint_loop(node_url, color_base, color_tint, duration)
	go.cancel_animations(node_url, "tint")
	go.set(node_url, "tint", color_base)
	go.animate(node_url, "tint", go.PLAYBACK_LOOP_PINGPONG, color_tint, go.EASING_LINEAR, duration, 0)
end

return M