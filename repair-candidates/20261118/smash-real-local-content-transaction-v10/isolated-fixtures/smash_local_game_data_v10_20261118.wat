;; Self-authored adapter for real original local content, not a Firebase provider.
(module
  (import "native" "metadata_init" (func $meta (param i32)))
  (import "native" "class_metadata_init" (func $class_init (param i32) (result i32)))
  (import "native" "has_instance" (func $has (param i32) (result i32)))
  (import "native" "get_instance" (func $get (param i32) (result i32)))
  (import "native" "serialize" (func $serialize (param i32 i32) (result i32)))
  (import "native" "deserialize" (func $deserialize (param i32 i32) (result i32)))
  (import "native" "string_ctor" (func $string (param i32 i32 i32 i32) (result i32)))
  (import "native" "string_equal" (func $equal (param i32 i32 i32) (result i32)))
  (import "native" "game_data_ready" (func $ready (param i32 i32) (result i32)))
  (import "native" "apply_original_game_data" (func $apply (param i32 i32 i32)))
  (import "native" "memory" (memory 1))
  (import "native" "stack" (global $stack (mut i32)))
  (func $existing (param $has_addr i32) (param $get_addr i32) (result i32)
    local.get $has_addr call $meta
    local.get $has_addr i32.load call $has i32.eqz if i32.const 0 return end
    local.get $get_addr call $meta
    local.get $get_addr i32.load call $get)
  (func $class_ready (param $klass i32) (result i32)
    local.get $klass i32.load8_u offset=189 i32.const 1 i32.and
    if (result i32) local.get $klass else local.get $klass call $class_init end)
  (func $catalog (result i32)
    ;; Original Get<Cust> MethodInfo identifies the declaring class. Do not call Get or invent Has<Cust>.
    i32.const 5669832 call $meta
    i32.const 5669832 i32.load i32.load offset=16 call $class_ready
    i32.load offset=96 i32.load offset=8 call $class_ready
    i32.load offset=92 i32.load)
  (func $context (export "gamelab_game_data_context") (result i32)
    (local $s i32) (local $u i32) (local $c i32)
    i32.const 5669868 i32.const 5669876 call $existing local.tee $s i32.eqz if i32.const 0 return end
    i32.const 5669964 i32.const 5669972 call $existing local.tee $u i32.eqz if i32.const 0 return end
    local.get $s i32.load8_u offset=8 i32.eqz if i32.const 0 return end
    local.get $u i32.load8_u offset=80 i32.eqz if i32.const 0 return end
    local.get $s i32.load offset=12 i32.eqz if i32.const 0 return end
    local.get $s i32.load offset=20 i32.eqz if i32.const 0 return end
    local.get $u i32.load offset=68 i32.eqz if i32.const 0 return end
    local.get $s i32.load offset=20 local.get $u i32.load offset=68 i32.const 0 call $equal
    i32.eqz if i32.const 0 return end
    call $catalog local.tee $c i32.eqz if i32.const 0 return end
    local.get $c i32.load8_u offset=8 i32.eqz if i32.const 0 return end
    local.get $c i32.load offset=12 i32.eqz if i32.const 0 return end
    local.get $c i32.load offset=16 i32.eqz if i32.const 0 return end
    local.get $c i32.load offset=20 i32.eqz if i32.const 0 return end
    local.get $s)
  (func (export "gamelab_game_data_state") (result i32)
    (local $s i32)
    call $context local.tee $s i32.eqz if i32.const 0 return end
    local.get $s i32.load8_u offset=140 if i32.const 1 return end
    local.get $s i32.const 0 call $ready if i32.const 2 return end
    i32.const 0)
  (func (export "gamelab_game_data_presets_json") (result i32)
    call $context i32.eqz if i32.const 0 return end
    call $context i32.load offset=12 i32.const 0 call $serialize)
  (func (export "gamelab_game_data_groups_json") (result i32)
    call $context i32.eqz if i32.const 0 return end
    call $catalog i32.load offset=16 i32.const 0 call $serialize)
  (func (export "gamelab_game_data_identity") (result i32)
    call $context i32.eqz if i32.const 0 return end
    call $context i32.load offset=20)
  (func (export "gamelab_game_data_item_count") (result i32)
    call $context i32.eqz if i32.const 0 return end
    ;; Offset12 is proved by the original closed List<ItemData> population loops, not generic placeholder offsets.
    call $catalog i32.load offset=20 i32.load offset=12)
  (func $begin (export "gamelab_game_data_begin") (param $s i32) (param $force i32) (param $mi i32)
    local.get $s i32.eqz if unreachable end
    call $context local.get $s i32.eq i32.eqz if unreachable end
    ;; This is a real queued local load, not data-ready or a provider callback.
    local.get $s i32.const 1 i32.store8 offset=140)
  (func (export "gamelab_game_data_apply") (param $json i32) (param $len i32) (param $id i32) (param $idn i32)
    (local $s i32) (local $frame i32)
    call $context local.tee $s i32.eqz if unreachable end
    local.get $s i32.load8_u offset=140 i32.eqz if unreachable end
    global.get $stack i32.const 32 i32.sub local.tee $frame global.set $stack
    local.get $frame local.get $s i32.store offset=12
    local.get $frame local.get $json i32.const 0 local.get $len i32.const 0 call $string i32.store
    local.get $frame local.get $id i32.const 0 local.get $idn i32.const 0 call $string i32.store offset=4
    local.get $s i32.load offset=20 local.get $frame i32.load offset=4 i32.const 0 call $equal
    i32.eqz if unreachable end
    i32.const 5690372 call $meta
    local.get $frame local.get $frame i32.load i32.const 5690372 i32.load call $deserialize i32.store offset=8
    local.get $frame i32.load offset=8 i32.eqz if unreachable end
    ;; Normal original typed data application supplies actual objects/protected fields and emits its own completion event.
    local.get $s local.get $frame i32.load offset=8 i32.const 0 call $apply
    local.get $s i32.const 0 call $ready i32.eqz if unreachable end
    local.get $s i32.load8_u offset=16 i32.eqz if unreachable end
    local.get $s i32.load8_u offset=140 if unreachable end
    local.get $frame i32.const 32 i32.add global.set $stack))
