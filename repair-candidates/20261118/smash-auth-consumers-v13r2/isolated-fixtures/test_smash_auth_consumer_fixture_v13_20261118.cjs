"use strict";
const fs = require("node:fs"), path = require("node:path"), assert = require("node:assert/strict");
(async function () {
  const calls = [], oldCalls = [];
  const original = (await WebAssembly.instantiate(fs.readFileSync(path.join(__dirname, "smash_auth_consumer_fixture_v13_20261118.wasm")), { fixture: { base(...a) { oldCalls.push(["base", ...a]); }, auth_read() { oldCalls.push(["read"]); return 42; }, auth_configure(...a) { oldCalls.push(["configure", ...a]); }, resume_cloud(...a) { oldCalls.push(["resume", ...a]); } } })).instance.exports;
  const retired = (await WebAssembly.instantiate(fs.readFileSync(path.join(__dirname, "smash_auth_consumer_fixture_v13_retired_20261118.wasm")), { fixture: { base(...a) { calls.push(["base", ...a]); }, auth_read() { throw new Error("Retired auth read"); }, auth_configure() { throw new Error("Retired auth configure"); }, resume_cloud() { throw new Error("Retired cloud refresh"); } } })).instance.exports;
  original.awake(128); retired.awake(128);
  assert.deepEqual(calls, [["base", 128, 17]]); assert.equal(oldCalls.filter(x => x[0] === "read").length, 1); assert.equal(oldCalls.filter(x => x[0] === "configure").length, 1);
  const checks = ["original singleton initialization executes exactly once with original arguments; no auth read/configure afterward"];
  for (const [fn, counter] of [["pause", "pause_clock"], ["focus", "focus_clock"]]) {
    for (const value of [0, 1]) { original[fn](128, value); retired[fn](128, value); assert.equal(original[counter].value, retired[counter].value); }
    assert.equal(retired[counter].value, 4); assert.equal(calls.length, 1); checks.push(fn + " retains before/after local clock work while neither cloud refresh nor readiness reset is invoked");
  }
  assert.equal(oldCalls.filter(x => x[0] === "resume").length, 4);
  const result = { passed: 3, own_fixture_only: true, original_game_code_executed: false, auth_or_permission_success_fabricated: false, checks };
  fs.writeFileSync(path.join(__dirname, "smash-auth-consumer-fixture-result-v13-20261118.json"), JSON.stringify(result, null, 2)); console.log(JSON.stringify(result));
})().catch(e => { console.error(e.stack); process.exitCode = 1; });
