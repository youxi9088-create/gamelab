"use strict";
// All native functions below are self-authored mocks. No original game is instantiated.
const fs = require("node:fs"), assert = require("node:assert/strict"), path = require("node:path");
const adapter = require("./smash_local_transport_v11_20261118.js");
const uidText = "local:00000000-0000-4000-8000-000000000001";
async function fixture(overrides = {}) {
  const memory = new WebAssembly.Memory({ initial: 1 });
  const stack = new WebAssembly.Global({ value: "i32", mutable: true }, 60000);
  const v = new DataView(memory.buffer), calls = [];
  const ds = 1024, uid = 2048, player = 4096, other = 6144, cfg = 8192, app = 9216;
  function str(ptr, text) { v.setInt32(ptr + 8, text.length, true); [...text].forEach((c, i) => v.setUint16(ptr + 12 + i * 2, c.charCodeAt(0), true)); }
  function text(ptr) { if (!ptr) return null; let s = ""; for (let i = 0; i < v.getInt32(ptr + 8, true); i++) s += String.fromCharCode(v.getUint16(ptr + 12 + i * 2, true)); return s; }
  const s = Object.assign({ context: ds, core: 1, data: 1, complete: 1, loading: 0, local: 1, rawState: 0, offline: 0, room: 0, settings: cfg, app, player, playerId: 0, uid: uidText, connectResult: 1, activate: true }, overrides);
  str(uid, s.uid); str(other, "another-player"); v.setInt32(ds + 20, uid, true); v.setUint8(ds + 16, s.complete); v.setUint8(ds + 140, s.loading);
  v.setUint8(player + 16, s.local); v.setInt32(player + 24, s.playerId, true); v.setInt32(cfg + 12, s.app, true);
  const native = {
    memory, stack, context() { return s.context; }, core_ready(mi) { assert.equal(mi, 0); return s.core; },
    data_ready(ptr, mi) { assert.equal(ptr, ds); assert.equal(mi, 0); return s.data; },
    offline(mi) { assert.equal(mi, 0); return s.offline; },
    client_state(mi) { assert.equal(mi, 0); return s.offline ? (s.room ? 9 : 15) : s.rawState; },
    settings(mi) { assert.equal(mi, 0); return s.settings; }, player(mi) { assert.equal(mi, 0); return s.player; },
    player_id(ptr, mi) { assert.equal(ptr, player); assert.equal(mi, 0); return v.getInt32(ptr + 24, true); },
    set_player_id(ptr, id, mi) { assert.equal(ptr, player); assert.equal(id, uid); assert.equal(mi, 0); calls.push("actual-local-identity"); v.setInt32(player + 24, id, true); },
    equal(a, b, mi) { assert.equal(mi, 0); return text(a) === text(b) ? 1 : 0; },
    connect_local(ptr, offline, mi) { assert.equal(ptr, app); assert.equal(offline, 1); assert.equal(mi, 0); assert.equal(v.getInt32(player + 24, true), uid); calls.push("original-offline-connect"); if (s.trap) throw new Error("own fixture original-call failure"); if (s.activate && s.connectResult) s.offline = 1; return s.connectResult; }
  };
  const { instance } = await WebAssembly.instantiate(fs.readFileSync(path.join(__dirname, "smash_local_transport_v11_20261118.wasm")), { native });
  return { api: instance.exports, s, calls, v, stack, ds, uid, player, other, cfg, app };
}
function timers(Module, overrides = {}) {
  let fn, clock = 0, clears = 0, sets = 0; const errors = [];
  const controller = adapter.attach(Module, Object.assign({ setInterval(f, delay) { assert.equal(delay, 250); fn = f; sets++; return 42; }, clearInterval(id) { assert.equal(id, 42); clears++; }, now() { return clock; }, onError(e) { errors.push(e.message); } }, overrides));
  return { controller, tick() { fn(); }, time(n) { clock = n; }, get clears() { return clears; }, get sets() { return sets; }, errors };
}
(async function () {
  const checks = [];
  { const f = await fixture(); const before = Buffer.from(f.v.buffer); assert.equal(f.api.gamelab_local_transport_prepare(), 1); assert.deepEqual(f.calls, ["actual-local-identity", "original-offline-connect"]); const after = Buffer.from(f.v.buffer); for (let i = 0; i < after.length; i++) if (before[i] !== after[i]) assert.ok(i >= f.player + 24 && i < f.player + 28); assert.equal(f.stack.value, 60000); assert.equal(f.api.gamelab_local_transport_prepare(), 1); assert.equal(f.calls.length, 2); checks.push("real local identity and original local transport; only actual Player.UserId mutated; idempotent"); }
  { for (const args of [{ context: 0 }, { core: 0 }, { data: 0 }, { complete: 0 }, { loading: 1 }]) { const f = await fixture(args); assert.equal(f.api.gamelab_local_transport_prepare(), 0); assert.equal(f.calls.length, 0); } checks.push("missing or incomplete real core/local content cannot start transport"); }
  { for (const uid of ["server-user", "other:" + uidText.slice(6), uidText.slice(0, -1)]) { const f = await fixture({ uid }); assert.equal(f.api.gamelab_local_transport_prepare(), -1); assert.equal(f.calls.length, 0); } checks.push("foreign or malformed identity rejected without auth/provider mutation"); }
  { const f = await fixture({ local: 0 }); assert.equal(f.api.gamelab_local_transport_prepare(), -1); assert.equal(f.calls.length, 0); checks.push("nonlocal Photon actor never taken over"); }
  { const f = await fixture({ playerId: 6144 }); assert.equal(f.api.gamelab_local_transport_prepare(), -1); assert.equal(f.v.getInt32(f.player + 24, true), f.other); assert.equal(f.calls.length, 0); checks.push("existing foreign Player.UserId preserved"); }
  { for (const rawState of [4, 9, 15]) { const f = await fixture({ rawState }); assert.equal(f.api.gamelab_local_transport_prepare(), -1); assert.equal(f.calls.length, 0); } const f = await fixture({ rawState: 14 }); assert.equal(f.api.gamelab_local_transport_prepare(), 1); checks.push("existing online connection refused; only original idle/disconnected states eligible"); }
  { for (const args of [{ settings: 0 }, { app: 0 }, { player: 0 }]) { const f = await fixture(args); assert.equal(f.api.gamelab_local_transport_prepare(), 0); assert.equal(f.calls.length, 0); } checks.push("real settings/AppSettings/local actor required; no substitute settings"); }
  { for (const args of [{ connectResult: 0 }, { activate: false }]) { const f = await fixture(args), t = timers({ asm: f.api }); t.tick(); assert.ok(t.controller.error); assert.equal(t.controller.ready, false); assert.equal(t.clears, 1); t.tick(); assert.equal(f.calls.filter(x => x === "original-offline-connect").length, 1); } checks.push("failed original connect or absent actual offline state stops owner after one attempt"); }
  { const f = await fixture({ offline: 1, room: 1, playerId: 2048 }); assert.equal(f.api.gamelab_local_transport_prepare(), 1); assert.equal(f.api.gamelab_local_transport_client_state(1234), 9); assert.equal(f.calls.length, 0); f.s.room = 0; assert.equal(f.api.gamelab_local_transport_client_state(0), 15); f.s.offline = 0; f.s.rawState = 14; assert.equal(f.api.gamelab_local_transport_client_state(0), 14); checks.push("original real local room/lobby/online state retained; no constant-connected result"); }
  { const f = await fixture(), Module = { asm: f.api }, t = timers(Module); assert.equal(adapter.attach(Module), t.controller); assert.equal(t.sets, 1); t.tick(); assert.equal(t.controller.ready, true); assert.equal(t.clears, 1); t.tick(); assert.equal(f.calls.length, 2); checks.push("bounded JS ownership, repeat attach idempotent and successful timer cleaned"); }
  { const f = await fixture({ core: 0 }), t = timers({ asm: f.api }); t.tick(); assert.equal(t.controller.error, null); t.time(90001); t.tick(); assert.equal(t.clears, 1); assert.match(t.controller.error.message, /90 seconds/); assert.equal(f.calls.length, 0); checks.push("waiting for actual data is bounded and reports terminal timeout"); }
  { const f = await fixture({ trap: true }), t = timers({ asm: f.api }); t.tick(); t.tick(); assert.equal(t.clears, 1); assert.equal(t.errors.length, 1); assert.equal(t.controller.ready, false); assert.equal(f.stack.value, 60000); assert.equal(f.calls.filter(x => x === "original-offline-connect").length, 1); checks.push("native-call failure not reported as success or retried; no own stack allocation"); }
  const result = { own_fixture_only: true, game_executed: false, original_game_functions_invoked: false, passed: checks.length, checks };
  fs.writeFileSync(path.join(__dirname, "smash-local-transport-fixture-result-v11-20261118.json"), JSON.stringify(result, null, 2)); console.log(JSON.stringify(result));
})().catch(e => { console.error(e.stack); process.exitCode = 1; });
