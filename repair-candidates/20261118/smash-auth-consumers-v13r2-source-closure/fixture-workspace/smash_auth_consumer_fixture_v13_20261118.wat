;; Own fixture only: singleton initialization must survive consumer retirement.
(module
  (import "fixture" "base" (func $base (param i32 i32)))
  (import "fixture" "auth_read" (func $read (result i32)))
  (import "fixture" "auth_configure" (func $configure (param i32 i32)))
  (import "fixture" "resume_cloud" (func $resume (param i32 i32)))
  (global $pause (export "pause_clock") (mut i32) (i32.const 0))
  (global $focus (export "focus_clock") (mut i32) (i32.const 0))
  (func (export "awake") (param $self i32)
    local.get $self i32.const 17 call $base
    call $read i32.const 0 call $configure)
  (func (export "pause") (param $self i32) (param $paused i32)
    global.get $pause i32.const 1 i32.add global.set $pause
    local.get $self local.get $paused call $resume
    global.get $pause i32.const 1 i32.add global.set $pause)
  (func (export "focus") (param $self i32) (param $focused i32)
    global.get $focus i32.const 1 i32.add global.set $focus
    local.get $self local.get $focused call $resume
    global.get $focus i32.const 1 i32.add global.set $focus))
