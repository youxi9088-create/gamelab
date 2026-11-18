(module
  (import "native" "streaming_assets_path" (func $path (param i32) (result i32)))
  (import "native" "string_ctor" (func $string (param i32 i32 i32 i32) (result i32)))
  (import "native" "concat2" (func $concat (param i32 i32 i32) (result i32)))
  (import "native" "memory" (memory 1))
  (import "native" "stack" (global $stack (mut i32)))
  ;; Original tutorial bytes are downloaded and parsed by the unchanged native service.
  (func (export "gamelab_ftue_local_url") (result i32)
    (local $frame i32) (local $result i32)
    global.get $stack i32.const 80 i32.sub local.tee $frame global.set $stack
    local.get $frame i32.const 0 call $path i32.store
    local.get $frame i32.const 6357039 i32.store offset=16
    local.get $frame i32.const 3080289 i32.store offset=20
    local.get $frame i32.const 7602278 i32.store offset=24
    local.get $frame i32.const 6619253 i32.store offset=28
    local.get $frame i32.const 7733293 i32.store offset=32
    local.get $frame i32.const 3014708 i32.store offset=36
    local.get $frame i32.const 7471215 i32.store offset=40
    local.get $frame i32.const 6750313 i32.store offset=44
    local.get $frame i32.const 7209065 i32.store offset=48
    local.get $frame i32.const 7077985 i32.store offset=52
    local.get $frame i32.const 6946862 i32.store offset=56
    local.get $frame i32.const 7274611 i32.store offset=60
    local.get $frame i32.const 110 i32.store offset=64
    local.get $frame
    local.get $frame i32.const 16 i32.add i32.const 0 i32.const 25 i32.const 0 call $string
    i32.store offset=4
    local.get $frame i32.load local.get $frame i32.load offset=4 i32.const 0 call $concat local.set $result
    local.get $frame i32.const 80 i32.add global.set $stack
    local.get $result))
