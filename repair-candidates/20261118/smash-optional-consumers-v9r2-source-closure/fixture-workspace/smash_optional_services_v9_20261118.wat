(module
  (import "native" "metadata_init" (func $meta (param i32)))
  (import "native" "has_instance" (func $has (param i32) (result i32)))
  (import "native" "get_instance" (func $get (param i32) (result i32)))
  (import "native" "game_data_ready" (func $ready (param i32 i32) (result i32)))
  (import "native" "component_game_object" (func $object (param i32 i32) (result i32)))
  (import "native" "set_active" (func $active (param i32 i32 i32)))
  (import "native" "memory" (memory 1))
  (import "native" "stack" (global $stack (mut i32)))
  (func $core (result i32)
    i32.const 5669884 call $meta
    i32.const 5669884 i32.load call $has i32.eqz if i32.const 0 return end
    i32.const 5669892 call $meta
    i32.const 5669892 i32.load call $get i32.load8_u offset=21
    i32.eqz if i32.const 0 return end
    i32.const 5669964 call $meta
    i32.const 5669964 i32.load call $has i32.eqz if i32.const 0 return end
    i32.const 5669972 call $meta
    i32.const 5669972 i32.load call $get i32.load8_u offset=80
    i32.eqz if i32.const 0 return end
    i32.const 5669852 call $meta
    i32.const 5669852 i32.load call $has i32.eqz if i32.const 0 return end
    i32.const 5669860 call $meta
    i32.const 5669860 i32.load call $get i32.load8_u offset=20
    i32.eqz if i32.const 0 return end
    i32.const 1)
  ;; First phase still requires actual settings/user/tutorial; real GameData must be absent/not loading/not complete.
  (func (export "gamelab_need_core_game_data") (result i32)
    (local $s i32)
    call $core i32.eqz if i32.const 0 return end
    i32.const 5669868 call $meta
    i32.const 5669868 i32.load call $has
    if
      i32.const 5669876 call $meta
      i32.const 5669876 i32.load call $get local.set $s
      local.get $s i32.const 0 call $ready if i32.const 0 return end
      local.get $s i32.load8_u offset=140 i32.eqz return
    end
    i32.const 1)
  ;; Final phase still delegates completeness to the original GameData getter, not a readiness override.
  (func (export "gamelab_core_game_data_complete") (result i32)
    call $core i32.eqz if i32.const 0 return end
    i32.const 5669868 call $meta
    i32.const 5669868 i32.load call $has i32.eqz if i32.const 0 return end
    i32.const 5669876 call $meta
    i32.const 5669876 i32.load call $get i32.const 0 call $ready)
  ;; Retire actual online presentation components; no fake news, friends, promo or success callback.
  (func (export "gamelab_retire_optional_component") (param $component i32) (param $mi i32)
    local.get $component i32.const 0 call $object i32.const 0 i32.const 0 call $active))
