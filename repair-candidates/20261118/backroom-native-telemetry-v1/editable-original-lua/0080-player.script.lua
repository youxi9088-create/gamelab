local lib = require "game.globals.library_manager"

local do_movements, do_animations, get_animation_direction, hurt, kill, immunity, turbo

function init(self)
	msg.post(".", lib.HASHES.ACQUIRE_INPUT_FOCUS)

	self.move_direction = vmath.vector3()
	self.velocity = vmath.vector3()
	self.animation_direction = "idle_down"
	self.touch_init_action = vmath.vector3()
	self.astar_enabled = false
	self.correction = vmath.vector3()
	self.lock_update = false
	self.safe_zone_first = false
	self.is_in_debugger = false

	self.sprite = msg.url("#sprite")
	self.player_extra = msg.url("#player_extra")
	self.player_hurtbox = msg.url("#player_hurtbox")

	local player_pos = go.get_position()
	player_pos.z = lib.PARAMS.Z_INDEX_PLAYER
	go.set_position(player_pos)

	lib.LM.player_speed = lib.PARAMS.PLAYER_SPEED + lib.LM.ending_boost

	self.turbo_timer = timer.delay(0, false, function() end)
end

function update(self, dt)
	if lib.LM.lock_update then
		lib.SM.stop_sound("fx/steps")

		self.move_direction = vmath.vector3()
		self.velocity = vmath.vector3()

		self.animation_direction = string.gsub(self.animation_direction, "run", "idle")
		sprite.play_flipbook(self.sprite, self.animation_direction)
		return
	end

	if self.lock_update then
		return
	end

	self.correction = vmath.vector3()

	do_movements(self, dt)
	do_animations(self)

	if self.astar_enabled then
		msg.post("/script", lib.HASHES.ACTIVATE_ASTAR)

		if next(lib.LM.enemies_chasing) == nil and lib.LM.player_pictures > 0 then
			self.astar_enabled = false
			msg.post("/script", lib.HASHES.DEACTIVATE_ASTAR)
		end
	end
end

function late_update(self, dt)
	self.move_direction = vmath.vector3()
end

function on_message(self, message_id, message, sender)
	local player_pos = go.get_position()

	
	if message_id == lib.HASHES.CONTACT_POINT_RESPONSE and message.own_group == lib.HASHES.PLAYER_PHYSICS and
		(message.group == lib.HASHES.WALL or message.group == lib.HASHES.OBJECT) and message.distance > 0 then
		local proj = vmath.dot(self.correction, message.normal)
		local comp = (message.distance - proj) * message.normal
		comp.z = 0

		go.set_position(player_pos + comp)
		self.correction = self.correction + comp
	end

	
	if message_id == lib.HASHES.ACTIVATE_ASTAR then
		self.astar_enabled = true
	end

	
	if message_id == lib.HASHES.PLAYER_KILLED then
		kill(self)
	end

	
	if message_id == lib.HASHES.PLAYER_HURT then
		hurt(self)
	end

	
	if message_id == lib.HASHES.PLAYER_IMMUNITY then
		immunity(self)
	end

	
	if message_id == lib.HASHES.TURBO then
		turbo(self)
	end

	
	if message_id == lib.HASHES.DEBUG_FLY and not self.is_in_debugger then
		self.is_in_debugger = true
		msg.post("#player_hurtbox", lib.HASHES.DISABLE)
		msg.post("#player_physics", lib.HASHES.DISABLE)
		msg.post("/camera#script", "zoom_to", { zoom = 0.5 })
		lib.LM.player_speed = (lib.PARAMS.PLAYER_SPEED + lib.LM.ending_boost) * 2
	elseif message_id == lib.HASHES.DEBUG_FLY and self.is_in_debugger then
		self.is_in_debugger = false
		msg.post("#player_hurtbox", lib.HASHES.ENABLE)
		msg.post("#player_physics", lib.HASHES.ENABLE)
		msg.post("/script", lib.HASHES.WINDOWS_RESIZED)
		lib.LM.player_speed = lib.PARAMS.PLAYER_SPEED + lib.LM.ending_boost
	end
end

function on_input(self, action_id, action)
	if lib.LM.lock_input then
		return
	end

	if lib.SDK.is_action_click_or_touch(action_id) then
		if not action.pressed and not action.released then
			local screen_width, screen_height = window.get_size()
			local direction

			if action_id == lib.HASHES.TOUCH then
				direction = vmath.vector3((action.x - self.touch_init_action.x) * screen_width / lib.CONFIG.display_w,
				(action.y - self.touch_init_action.y) * screen_height / lib.CONFIG.display_h, 0)
			else
				local zoom = camera.get_orthographic_zoom("/camera#camera")
				local screen_center = vmath.vector3(screen_width / 2 / zoom, screen_height / 2 / zoom, 0)
				local player_rel_pos = go.get_position() - go.get_world_position("/camera") + screen_center
				player_rel_pos = player_rel_pos * zoom

				direction = vmath.vector3(action.x * screen_width / lib.CONFIG.display_w - player_rel_pos.x,
				(action.y * screen_height / lib.CONFIG.display_h - player_rel_pos.y), 0)
			end

			self.move_direction = direction
		elseif action.pressed then
			self.touch_init_action = action
		elseif action.released then
			self.move_direction = vmath.vector3()
		end
	elseif action_id == lib.HASHES.PLAYER_UP and self.move_direction.y <= 0 then
		self.move_direction.y = self.move_direction.y + lib.PARAMS.PLAYER_JOYSTICK_DEADZONE * 1.1
	elseif action_id == lib.HASHES.PLAYER_DOWN and self.move_direction.y >= 0 then
		self.move_direction.y = self.move_direction.y - lib.PARAMS.PLAYER_JOYSTICK_DEADZONE * 1.1
	elseif action_id == lib.HASHES.PLAYER_LEFT and self.move_direction.x >= 0 then
		self.move_direction.x = self.move_direction.x - lib.PARAMS.PLAYER_JOYSTICK_DEADZONE * 1.1
	elseif action_id == lib.HASHES.PLAYER_RIGHT and self.move_direction.x <= 0 then
		self.move_direction.x = self.move_direction.x + lib.PARAMS.PLAYER_JOYSTICK_DEADZONE * 1.1
	end
end

function do_movements(self, dt)
	self.velocity = vmath.vector3()

	if vmath.length(self.move_direction) > lib.PARAMS.PLAYER_JOYSTICK_DEADZONE then
		self.velocity = vmath.normalize(self.move_direction)
	end

	if vmath.length(self.velocity) == 0 then
		return
	end

	self.velocity = vmath.normalize(self.velocity) * lib.LM.player_speed
	self.velocity.z = 0

	local pos = go.get_position()
	pos = pos + self.velocity * dt
	go.set_position(pos)
end

function do_animations(self)
	local prev_animation_direction = self.animation_direction

	if vmath.length(self.velocity) > 0 then
		sprite.set_hflip(self.sprite, self.velocity.x > 0)
		self.animation_direction = "run_" .. get_animation_direction(self)

		lib.SM.play_sound("fx/steps", true)
	else
		self.animation_direction = string.gsub(prev_animation_direction, "run", "idle")

		lib.SM.stop_sound("fx/steps")
	end

	if prev_animation_direction ~= self.animation_direction then
		sprite.play_flipbook(self.sprite, self.animation_direction)
	end
end

function get_animation_direction(self)
	local norm_vel = vmath.normalize(self.velocity)

	if norm_vel.y > 0.92 then
		return "up"
	elseif norm_vel.y < -0.92 then
		return "down"
	elseif norm_vel.x > 0.92 or norm_vel.x < -0.92 then
		return "side"
	elseif norm_vel.y > 0 then
		return "side_up"
	else
		return "side_down"
	end
end

function hurt(self)
	lib.LM.player_lives = lib.LM.player_lives - 1

	if lib.LM.player_lives <= 0 then
		lib.LM.player_regenerating = false
		lib.LM.player_regen_time_left = 0
		msg.post("/trap_menu", lib.HASHES.SHOW_MENU)
		return
	end

	lib.SM.play_sound("fx/hit")

	lib.LM.player_regenerating = true
	lib.LM.player_regen_time_left = lib.PARAMS.PLAYER_REGEN_TIME

	msg.post("/gui", lib.HASHES.PLAYER_HURT)

	immunity(self)

	for enemy in pairs(lib.LM.enemies_chasing) do
        msg.post(enemy, lib.HASHES.ENEMY_PUSH)
    end
end

function kill(self)
	lib.LM.lock_input = true
	lib.LM.lock_update = true

	msg.post("/gui", lib.HASHES.HEAL_FULL)

	lib.LM.prev_level_str = lib.LM.level_str
	msg.post("game_controller:/script#game_controller", lib.HASHES.LOAD_LEVEL, { level = lib.LM.level_str })
end

function immunity(self)
	msg.post(self.player_hurtbox, lib.HASHES.DISABLE)
	lib.ANIM.go_tint_loop(self.sprite, vmath.vector4(1, 1, 1, 1), vmath.vector4(1, 1, 1, 0.3), 0.2)

	timer.delay(lib.PARAMS.PLAYER_IMMUNITY_TIME, false, function()
		msg.post(self.player_hurtbox, lib.HASHES.ENABLE)
		go.cancel_animations(self.sprite)
		go.set(self.sprite, "tint", vmath.vector4(1, 1, 1, 1))
	end)
end

function turbo(self)
	lib.LM.player_speed = lib.PARAMS.TURBO_SPEED + lib.LM.ending_boost
	timer.cancel(self.turbo_timer)
	self.turbo_timer = timer.delay(lib.PARAMS.TURBO_DURATION, false, function()
		lib.LM.player_speed = lib.PARAMS.PLAYER_SPEED + lib.LM.ending_boost
	end)
end