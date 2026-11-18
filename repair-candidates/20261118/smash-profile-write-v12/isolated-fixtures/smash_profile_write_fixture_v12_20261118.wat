;; Own fixture only. Exercises mixed argument evaluation, two branches and existing notification order.
(module
  (import "fixture" "full" (func $full (param i32 i32 i32 i32 i32 i32 f32 i32)))
  (import "fixture" "delta" (func $delta (param i32 i32 i32 i32 i32 i32 f32 i32)))
  (global $args (export "arguments_evaluated") (mut i32) (i32.const 0))
  (global $data (export "local_data") (mut i32) (i32.const 0))
  (global $baseline (export "baseline") (mut i32) (i32.const 0))
  (global $events (export "events") (mut i32) (i32.const 0))
  (func $arg (param $v i32) (result i32)
    global.get $args i32.const 1 i32.add global.set $args local.get $v)
  (func $float (result f32)
    global.get $args i32.const 1 i32.add global.set $args f32.const -1)
  (func (export "save") (param $mode i32) (param $value i32)
    local.get $value global.set $data
    local.get $mode i32.const 1 i32.eq
    if
      i32.const 1 call $arg i32.const 2 call $arg local.get $value call $arg
      i32.const 4 call $arg i32.const 5 call $arg i32.const 6 call $arg call $float i32.const 0 call $arg call $full
    end
    local.get $mode i32.const 2 i32.eq
    if
      i32.const 1 call $arg i32.const 2 call $arg local.get $value call $arg
      i32.const 4 call $arg i32.const 5 call $arg i32.const 6 call $arg call $float i32.const 0 call $arg call $delta
    end
    global.get $data i32.const 17 i32.add global.set $baseline
    global.get $events i32.const 1 i32.add global.set $events))
