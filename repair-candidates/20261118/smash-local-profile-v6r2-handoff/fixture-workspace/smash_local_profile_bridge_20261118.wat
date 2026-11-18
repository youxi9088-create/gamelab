;; Own local profile bridge. Native targets are hash/ABI-bound during linking.
;; It never sets UserService.ready or authenticated/provider flags.
(module
  (import "native" "metadata_init" (func $meta (param i32)))
  (import "native" "has_instance" (func $has (param i32) (result i32)))
  (import "native" "get_instance" (func $get (param i32) (result i32)))
  (import "native" "serialize" (func $serialize (param i32 i32) (result i32)))
  (import "native" "deserialize" (func $deserialize (param i32 i32) (result i32)))
  (import "native" "string_ctor" (func $string (param i32 i32 i32 i32) (result i32)))
  (import "native" "string_equal" (func $equal (param i32 i32 i32) (result i32)))
  (import "native" "memory" (memory 1))
  (import "native" "stack" (global $stack (mut i32)))
  (func $service (result i32)
    i32.const 5669964 call $meta
    i32.const 5669964 i32.load call $has
    if (result i32)
      i32.const 5669972 call $meta
      i32.const 5669972 i32.load call $get
    else i32.const 0 end)
  (func $context (export "gamelab_profile_context") (result i32)
    (local $s i32)
    call $service local.tee $s i32.eqz
    if i32.const 0 return end
    local.get $s i32.load8_u offset=8 i32.eqz
    if i32.const 0 return end
    local.get $s i32.load offset=12 i32.eqz
    if i32.const 0 return end
    local.get $s i32.load offset=32 i32.eqz i32.eqz)
  (func $user (export "gamelab_profile_user_json") (result i32)
    (local $s i32)
    call $context i32.eqz if i32.const 0 return end
    call $service local.set $s
    local.get $s i32.load offset=12 i32.const 0 call $serialize)
  (func $readonly (export "gamelab_profile_readonly_json") (result i32)
    (local $s i32)
    call $context i32.eqz if i32.const 0 return end
    call $service local.set $s
    local.get $s i32.load offset=32 i32.const 0 call $serialize)
  (func $identity (export "gamelab_profile_identity") (result i32)
    call $context i32.eqz if i32.const 0 return end
    call $service i32.load offset=68)
  (func $apply (export "gamelab_profile_apply")
    (param $u i32) (param $un i32) (param $r i32) (param $rn i32)
    (param $id i32) (param $idn i32)
    (local $frame i32) (local $s i32) (local $old_id i32)
    call $context i32.eqz if unreachable end
    call $service local.set $s
    global.get $stack i32.const 32 i32.sub local.tee $frame global.set $stack
    ;; Managed references stay in the native linear shadow stack across allocations.
    local.get $frame local.get $s i32.store offset=24
    local.get $frame
    local.get $u i32.const 0 local.get $un i32.const 0 call $string
    i32.store
    local.get $frame
    local.get $r i32.const 0 local.get $rn i32.const 0 call $string
    i32.store offset=4
    local.get $frame
    local.get $id i32.const 0 local.get $idn i32.const 0 call $string
    i32.store offset=8
    i32.const 5690436 call $meta
    local.get $frame
    local.get $frame i32.load
    i32.const 5690436 i32.load call $deserialize
    i32.store offset=12
    i32.const 5690440 call $meta
    local.get $frame
    local.get $frame i32.load offset=4
    i32.const 5690440 i32.load call $deserialize
    i32.store offset=16
    local.get $frame i32.load offset=12 i32.eqz if unreachable end
    local.get $frame i32.load offset=16 i32.eqz if unreachable end
    local.get $s i32.load offset=68 local.tee $old_id
    if
      local.get $old_id local.get $frame i32.load offset=8 i32.const 0 call $equal
      i32.eqz if unreachable end
    end
    ;; Publish only after both typed restorations succeed. No auth/readiness writes.
    local.get $s local.get $frame i32.load offset=12 i32.store offset=12
    local.get $s local.get $frame i32.load offset=16 i32.store offset=32
    local.get $s local.get $frame i32.load offset=8 i32.store offset=68
    local.get $frame i32.const 32 i32.add global.set $stack))
