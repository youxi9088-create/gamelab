'use strict';
// Execute only our own bridge linked to this self-authored fixture and JS mocks.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const api = require('./smash_local_profile_20261118.js');
const ID = 'local:00000000-0000-4000-8000-000000000001';
let passed = [];
function check(name, test) { test(); passed.push(name); }
function storage() {
  const map = new Map();
  return {map, failAt: null, getItem(k) { return map.has(k) ? map.get(k) : null; },
    setItem(k, v) { if (k === this.failAt) throw new Error('fixture quota exceeded'); map.set(k, v); }};
}
const sample = () => ({schema: 1, nativeMetadataSha256: api.META, localId: ID,
  userData: '{"name":"自编测试🌱","input":"keyboard"}', readOnly: '{"fixtureCoins":3,"paid":false}'});
check('Adler32 standard vectors', () => {
  assert.equal(api.checksum(''), '00000001');
  assert.equal(api.checksum('Wikipedia'), '11e60398');
});
check('Unicode snapshot preserves exact original JSON strings', () => {
  const value = sample(); assert.deepEqual(api.decode(api.encode(value)), value);
});
check('Corruption fails without deleting or resetting the previous snapshot', () => {
  const disk = storage(), raw = api.encode(sample()).replace('keyboard', 'gamepad');
  disk.setItem(api.KEY, raw); assert.throws(() => api.store(disk), /校验失败/); assert.equal(disk.getItem(api.KEY), raw);
});
check('Incompatible schema is rejected without clearing existing data', () => {
  const disk = storage(), raw = JSON.stringify({payload: {...sample(), schema: 2}});
  disk.setItem(api.KEY, raw); assert.throws(() => api.store(disk), /版本/); assert.equal(disk.getItem(api.KEY), raw);
});
check('Fresh save failure never publishes native profile or fake readiness', () => {
  const disk = storage(); disk.failAt = api.KEY; let applied = 0;
  assert.throws(() => api.session(disk, {snapshot: () => sample(), apply() { applied++; }}, () => ID.slice(6)), /quota/);
  assert.equal(applied, 0); assert.equal(disk.getItem(api.KEY), null);
});
check('Atomic envelope retains previous generation when current write fails', () => {
  const disk = storage(), first = sample(), raw = api.encode(first); disk.setItem(api.KEY, raw);
  const writer = api.store(disk); disk.failAt = api.KEY;
  assert.throws(() => writer.commit({...first, userData: '{"newFixtureValue":1}'}), /quota/);
  assert.equal(disk.getItem(api.KEY), raw); assert.equal(disk.getItem(api.KEY + '.previous'), raw);
});
check('Concurrent page changes cannot be silently overwritten', () => {
  const disk = storage(); disk.setItem(api.KEY, api.encode(sample())); const writer = api.store(disk);
  const other = api.encode({...sample(), userData: '{"otherFixturePage":true}'}); disk.setItem(api.KEY, other);
  assert.throws(() => writer.commit(sample()), /另一页面/); assert.equal(disk.getItem(api.KEY), other);
});
check('No-change autosave writes nothing; changed save has a recoverable prior snapshot', () => {
  const disk = storage(), first = sample(); disk.setItem(api.KEY, api.encode(first)); const writer = api.store(disk);
  assert.equal(writer.commit(first), false); assert.equal(disk.getItem(api.KEY + '.previous'), null);
  assert.equal(writer.commit({...first, userData: '{"changedFixtureValue":7}'}), true);
  assert.deepEqual(api.decode(disk.getItem(api.KEY + '.previous')), first);
});
const fixturePath = path.join(__dirname, 'smash_local_profile_linked_fixture_20261118.wasm');
assert.equal(path.basename(fixturePath), 'smash_local_profile_linked_fixture_20261118.wasm');
const moduleBytes = fs.readFileSync(fixturePath), ownModule = new WebAssembly.Module(moduleBytes);
function nativeFixture(options = {}) {
  let memory, stack, Module, stringNext = 1000000, rawNext = 2000000, objectNext = 3000000, getCalls = 0, readyCalls = 0, eventCalls = 0;
  const objects = new Map([[70000, {fixture: 'user', name: '测试🌱'}], [71000, {fixture: 'readonly', fixtureCoins: 3}]]);
  const view = () => new DataView(memory.buffer);
  const stringAt = ptr => {
    const n = view().getInt32(ptr + 8, true); let text = '';
    for (let i = 0; i < n; i++) text += String.fromCharCode(view().getUint16(ptr + 12 + i * 2, true));
    return text;
  };
  const putString = text => {
    const ptr = stringNext; stringNext += 16 + text.length * 2; stringNext = (stringNext + 7) & ~7;
    view().setInt32(ptr + 8, text.length, true);
    for (let i = 0; i < text.length; i++) view().setUint16(ptr + 12 + i * 2, text.charCodeAt(i), true);
    return ptr;
  };
  const imports = {metadata_init(address) {
    const ids = new Map([[5669964, 99], [5669972, 98], [5690436, 101], [5690440, 102], [5673040, 103]]);
    assert(ids.has(address)); view().setInt32(address, ids.get(address), true);
  }, has_instance(method) { assert.equal(method, 99); return options.absent ? 0 : 1; },
  get_instance(method) { assert.equal(method, 98); getCalls++; return 65536; },
  serialize(ptr) { assert(objects.has(ptr)); return putString(JSON.stringify(objects.get(ptr))); },
  deserialize(ptr, method) {
    assert([101, 102].includes(method));
    if (options.readOnlyNull && method === 102) return 0;
    const value = JSON.parse(stringAt(ptr)); assert.equal(value.fixture, method === 101 ? 'user' : 'readonly');
    const result = objectNext; objectNext += 256; objects.set(result, value); return result;
  }, string_ctor(ptr, start, length) {
    let text = ''; for (let i = 0; i < length; i++) text += String.fromCharCode(view().getUint16(ptr + (start + i) * 2, true));
    return putString(text);
  }, string_equal(a, b) { return stringAt(a) === stringAt(b) ? 1 : 0; },
  set_user_ready(service, value) {
    assert.equal(service, 65536); assert.equal(value, 1);
    assert(objects.has(view().getInt32(service + 12, true))); assert(objects.has(view().getInt32(service + 32, true)));
    assert(stringAt(view().getInt32(service + 68, true)).startsWith('local:'));
    view().setUint8(service + 80, value); readyCalls++;
  }, invoke_user_changed(event, value, method) {
    assert.equal(event, 72000); assert.equal(value, 1); assert.equal(method, 103);
    assert.equal(view().getUint8(65536 + 80), 1); eventCalls++;
  }};
  const instance = new WebAssembly.Instance(ownModule, {native: imports}); memory = instance.exports.memory; stack = instance.exports.stack;
  assert.equal(instance.exports.fixture_original(), 123);
  view().setUint8(65536 + 8, 1); view().setInt32(65536 + 12, 70000, true); view().setInt32(65536 + 32, 71000, true);
  view().setInt32(65536 + 72, 72000, true);
  view().setUint8(65536 + 80, options.readySentinel === undefined ? 17 : options.readySentinel);
  view().setUint8(65536 + 82, 37); view().setUint8(65536 + 83, 41);
  Module = {asm: instance.exports, HEAP32: new Int32Array(memory.buffer), HEAPU16: new Uint16Array(memory.buffer),
    _malloc(n) { const ptr = rawNext; rawNext += (n + 7) & ~7; return ptr; }, _free() {},
    stackSave: () => stack.value, stackRestore: value => { stack.value = value; }};
  return {Module, bridge: api.nativeBridge(Module), view, getCalls: () => getCalls, readyCalls: () => readyCalls,
    eventCalls: () => eventCalls, stack,
    objects, stringAt, putString, instance};
}
check('Native context probe does not create an absent service', () => {
  const f = nativeFixture({absent: true}); assert.equal(f.bridge.ready(), false); assert.equal(f.getCalls(), 0);
});
check('Typed native restoration publishes both objects and distinct local identity, preserving ready', () => {
  const f = nativeFixture(), disk = storage(); const session = api.session(disk, f.bridge, () => ID.slice(6));
  assert.equal(session.localId, ID); assert.equal(f.view().getUint8(65536 + 80), 17);
  assert.equal(f.stringAt(f.view().getInt32(65536 + 68, true)), ID);
  assert.deepEqual(f.bridge.snapshot(), {userData: JSON.stringify({fixture: 'user', name: '测试🌱'}),
    readOnly: JSON.stringify({fixture: 'readonly', fixtureCoins: 3})});
  assert.equal(f.stack.value, 7600000); assert.equal(session.save(), false);
});
check('Failed second typed parse publishes neither profile and restores owned stack', () => {
  const f = nativeFixture({readOnlyNull: true}), before = f.bridge.snapshot();
  assert.throws(() => f.bridge.apply({...sample(), ...before}), WebAssembly.RuntimeError);
  assert.equal(f.view().getInt32(65536 + 12, true), 70000); assert.equal(f.view().getInt32(65536 + 32, true), 71000);
  assert.equal(f.view().getInt32(65536 + 68, true), 0); assert.equal(f.view().getUint8(65536 + 80), 17);
  assert.equal(f.stack.value, 7600000);
});
check('A conflicting native identity is rejected without replacing current native objects', () => {
  const f = nativeFixture(), before = f.bridge.snapshot();
  f.view().setInt32(65536 + 68, f.putString('external-fixture-identity'), true);
  assert.throws(() => f.bridge.apply({...sample(), ...before}), WebAssembly.RuntimeError);
  assert.equal(f.view().getInt32(65536 + 12, true), 70000); assert.equal(f.view().getInt32(65536 + 32, true), 71000);
  assert.equal(f.view().getUint8(65536 + 80), 17);
});
check('Autosave rejects a native identity change without touching the local snapshot', () => {
  const f = nativeFixture(), disk = storage(), s = api.session(disk, f.bridge, () => ID.slice(6));
  const saved = disk.getItem(api.KEY); f.view().setInt32(65536 + 68, f.putString('external-fixture-identity'), true);
  assert.throws(() => s.save(), /身份已经改变/); assert.equal(disk.getItem(api.KEY), saved);
});
check('Local user completion follows successful persistence/restoration and emits once without changing other flags', () => {
  const f = nativeFixture({readySentinel: 0}), disk = storage();
  api.session(disk, f.bridge, () => ID.slice(6));
  assert(disk.getItem(api.KEY)); assert.equal(f.view().getUint8(65536 + 80), 1);
  assert.equal(f.view().getUint8(65536 + 82), 37); assert.equal(f.view().getUint8(65536 + 83), 41);
  assert.equal(f.readyCalls(), 1); assert.equal(f.eventCalls(), 1);
  f.bridge.complete(ID); assert.equal(f.readyCalls(), 1); assert.equal(f.eventCalls(), 1);
});
check('Wrong local completion identity emits nothing and leaves native user unready', () => {
  const f = nativeFixture({readySentinel: 0});
  f.bridge.apply({...sample(), ...f.bridge.snapshot()});
  assert.throws(() => f.bridge.complete('local:00000000-0000-4000-8000-000000000002'), WebAssembly.RuntimeError);
  assert.equal(f.view().getUint8(65536 + 80), 0); assert.equal(f.readyCalls(), 0); assert.equal(f.eventCalls(), 0);
  assert.equal(f.stack.value, 7600000);
});
check('Canonical native snapshot persistence failure prevents local user completion', () => {
  const disk = storage(); const set = disk.setItem.bind(disk); let writes = 0, complete = 0, snapshots = 0;
  disk.setItem = (key, value) => { if (key === api.KEY && ++writes === 2) throw new Error('fixture second write failed'); set(key, value); };
  const bridge = {snapshot: () => ({...sample(), userData: ++snapshots === 1 ? '{"first":true}' : '{"normalized":true}'}),
    apply() {}, identity: () => ID, complete() { complete++; }};
  assert.throws(() => api.session(disk, bridge, () => ID.slice(6)), /second write/);
  assert.equal(complete, 0); assert.equal(api.decode(disk.getItem(api.KEY)).userData, '{"first":true}');
});
async function finish() {
  const names = ['localStorage', 'document', 'addEventListener', 'removeEventListener', 'dispatchEvent'];
  const before = Object.fromEntries(names.map(n => [n, Object.getOwnPropertyDescriptor(globalThis, n)]));
  const windowEvents = new Map(), documentEvents = new Map(); let controller;
  try {
    Object.defineProperty(globalThis, 'localStorage', {value: storage(), configurable: true});
    globalThis.document = {visibilityState: 'visible', addEventListener: (n, f) => documentEvents.set(n, f),
      removeEventListener: n => documentEvents.delete(n)};
    globalThis.addEventListener = (n, f) => windowEvents.set(n, f);
    globalThis.removeEventListener = n => windowEvents.delete(n);
    globalThis.dispatchEvent = () => true;
    const f = nativeFixture(), instance = {Module: f.Module};
    const first = api.attach(instance), second = api.attach(instance); assert.equal(first, second);
    controller = await first; assert.equal(windowEvents.size, 1); assert.equal(documentEvents.size, 1);
    controller.stop(); controller = null; assert.equal(windowEvents.size, 0); assert.equal(documentEvents.size, 0);
    passed.push('Repeated attachment shares one session and owned listeners/timer stop cleanly');
  } finally {
    if (controller) controller.stop();
    for (const n of names) { if (before[n]) Object.defineProperty(globalThis, n, before[n]); else delete globalThis[n]; }
  }
  const result = {passed: passed.length, checks: passed, fixture_only: true,
    original_game_code_executed: false, original_game_data_used: false};
  fs.writeFileSync(path.join(__dirname, 'smash-local-profile-fixture-result-20261118.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result));
}
finish().catch(error => { console.error(error); process.exitCode = 1; });
