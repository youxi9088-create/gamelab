;; Entirely self-authored fixture: no game code/data or original functions.
(module
  (import "native" "metadata_init" (func (param i32)))
  (import "native" "has_instance" (func (param i32) (result i32)))
  (import "native" "get_instance" (func (param i32) (result i32)))
  (import "native" "serialize" (func (param i32 i32) (result i32)))
  (import "native" "deserialize" (func (param i32 i32) (result i32)))
  (import "native" "string_ctor" (func (param i32 i32 i32 i32) (result i32)))
  (import "native" "string_equal" (func (param i32 i32 i32) (result i32)))
  (memory (export "memory") 128)
  (global (export "stack") (mut i32) (i32.const 7600000))
  (func (export "fixture_original") (result i32) i32.const 123)
  (func (param i32 i32 i32 i32 i32 i32)))
