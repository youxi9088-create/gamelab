(module
  (import "native" "streaming_assets_path" (func (param i32) (result i32)))
  (import "native" "string_ctor" (func (param i32 i32 i32 i32) (result i32)))
  (import "native" "concat2" (func (param i32 i32 i32) (result i32)))
  (memory (export "memory") 2)
  (global (export "stack") (mut i32) (i32.const 64000))
  (func (export "fixture_anchor") (result i32) i32.const 42))
