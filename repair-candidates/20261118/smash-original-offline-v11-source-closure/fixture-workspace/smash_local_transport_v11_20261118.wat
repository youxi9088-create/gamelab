;; Own adapter for the original Photon local transport. No provider responses or auth objects.
(module
  (import "native" "context" (func $context (result i32)))
  (import "native" "core_ready" (func $core (param i32) (result i32)))
  (import "native" "data_ready" (func $data (param i32 i32) (result i32)))
  (import "native" "offline" (func $offline (param i32) (result i32)))
  (import "native" "client_state" (func $state (param i32) (result i32)))
  (import "native" "settings" (func $settings (param i32) (result i32)))
  (import "native" "player" (func $player (param i32) (result i32)))
  (import "native" "player_id" (func $get_id (param i32 i32) (result i32)))
  (import "native" "set_player_id" (func $set_id (param i32 i32 i32)))
  (import "native" "equal" (func $equal (param i32 i32 i32) (result i32)))
  (import "native" "connect_local" (func $connect (param i32 i32 i32) (result i32)))
  (import "native" "memory" (memory 1))
  (import "native" "stack" (global $stack (mut i32)))
  (func $prepare (export "gamelab_local_transport_prepare") (result i32)
    (local $s i32) (local $uid i32) (local $p i32) (local $id i32) (local $cfg i32)
    call $context local.tee $s i32.eqz if i32.const 0 return end
    i32.const 0 call $core i32.eqz if i32.const 0 return end
    local.get $s i32.const 0 call $data i32.eqz if i32.const 0 return end
    local.get $s i32.load8_u offset=16 i32.eqz if i32.const 0 return end
    local.get $s i32.load8_u offset=140 if i32.const 0 return end
    local.get $s i32.load offset=20 local.tee $uid i32.eqz if i32.const 0 return end
    ;; Only the actual persisted adapter identity (local:UUID) is eligible.
    local.get $uid i32.load offset=8 i32.const 42 i32.eq i32.eqz if i32.const -1 return end
    local.get $uid i32.load offset=12 i32.const 7274604 i32.eq i32.eqz if i32.const -1 return end
    local.get $uid i32.load offset=16 i32.const 6357091 i32.eq i32.eqz if i32.const -1 return end
    local.get $uid i32.load offset=20 i32.const 3801196 i32.eq i32.eqz if i32.const -1 return end
    i32.const 0 call $offline i32.eqz
    if
      ;; Never take over an existing network connection or forcibly disconnect it.
      i32.const 0 call $state local.tee $cfg
      if local.get $cfg i32.const 14 i32.eq i32.eqz if i32.const -1 return end end
    end
    i32.const 0 call $player local.tee $p i32.eqz if i32.const 0 return end
    local.get $p i32.load8_u offset=16 i32.eqz if i32.const -1 return end
    local.get $p i32.const 0 call $get_id local.tee $id
    if
      local.get $id i32.load offset=8
      if
        local.get $id local.get $uid i32.const 0 call $equal i32.eqz if i32.const -1 return end
      end
    end
    i32.const 0 call $offline i32.eqz
    if
      i32.const 0 call $settings local.tee $cfg i32.eqz if i32.const 0 return end
      local.get $cfg i32.load offset=12 local.tee $cfg i32.eqz if i32.const 0 return end
      local.get $p local.get $uid i32.const 0 call $set_id
      ;; Call the original ConnectUsingSettings(AppSettings, startInOfflineMode=true).
      ;; It creates the genuine local transport actor and dispatches its own callbacks.
      local.get $cfg i32.const 1 i32.const 0 call $connect i32.eqz if i32.const -1 return end
    end
    i32.const 0 call $offline i32.eqz if i32.const -1 return end
    local.get $p i32.const 0 call $get_id local.get $uid i32.const 0 call $equal
    if (result i32) i32.const 1 else i32.const -1 end)
  (func (export "gamelab_local_transport_client_state") (param $client i32) (result i32)
    ;; Replace raw online-client field reads with the original mode-aware getter.
    ;; Its real values remain 15 (local lobby), 9 (local room), or the original online state.
    i32.const 0 call $state))
