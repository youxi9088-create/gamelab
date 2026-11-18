"use strict";
const fs = require("node:fs"), path = require("node:path"), assert = require("node:assert/strict");
(async function () {
  const checks = [];
  for (const mode of [0, 1, 2]) {
    const counts = [0, 0], trace = [];
    const original = (await WebAssembly.instantiate(fs.readFileSync(path.join(__dirname, "smash_profile_write_fixture_v12_20261118.wasm")), { fixture: { full(...args) { counts[0]++; trace.push(args); }, delta(...args) { counts[1]++; trace.push(args); } } })).instance.exports;
    const retired = (await WebAssembly.instantiate(fs.readFileSync(path.join(__dirname, "smash_profile_write_fixture_v12_retired_20261118.wasm")), { fixture: { full() { throw new Error("Retired full upload called"); }, delta() { throw new Error("Retired delta upload called"); } } })).instance.exports;
    for (const value of [23, 51]) {
      original.save(mode, value); retired.save(mode, value);
      for (const field of ["arguments_evaluated", "local_data", "baseline", "events"]) assert.equal(retired[field].value, original[field].value);
    }
    assert.deepEqual(counts, mode === 1 ? [2, 0] : mode === 2 ? [0, 2] : [0, 0]);
    assert.equal(retired.events.value, 2); assert.equal(retired.local_data.value, 51); assert.equal(retired.baseline.value, 68);
    if (mode) { assert.equal(retired.arguments_evaluated.value, 16); assert.deepEqual(trace[0], [1, 2, 23, 4, 5, 6, -1, 0]); }
    checks.push({ mode, local_data_and_baseline_preserved: true, original_notification_count_preserved: true, all_eight_mixed_arguments_evaluated: mode ? true : null, cloud_calls_retired: true });
  }
  const result = { passed: 3, own_fixture_only: true, original_game_code_executed: false, fake_remote_callbacks: false, checks };
  fs.writeFileSync(path.join(__dirname, "smash-profile-write-fixture-result-v12-20261118.json"), JSON.stringify(result, null, 2)); console.log(JSON.stringify(result));
})().catch(error => { console.error(error.stack); process.exitCode = 1; });
