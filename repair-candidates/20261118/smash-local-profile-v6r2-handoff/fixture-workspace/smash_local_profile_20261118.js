/* Original native JSON + separate browser-local storage. No SDK/provider emulation. */
(function (root) {
  'use strict';
  const KEY = 'gamelab.smash.local-profile.v1';
  const META = '01fcf80701368d9cfd840da074171b85e422f8a3bd440e2f21f635cfb3b3a0c7';
  const UUID = /^local:[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const attached = new WeakMap();
  function fail(message) { throw new Error(message); }
  function objectJson(raw) {
    if (typeof raw !== 'string') fail('本地存档的数据类型不正确。');
    const value = JSON.parse(raw);
    if (!value || typeof value !== 'object' || Array.isArray(value)) fail('本地存档的数据格式不正确。');
    return raw;
  }
  function payload(value) {
    if (!value || value.schema !== 1 || value.nativeMetadataSha256 !== META || !UUID.test(value.localId))
      fail('本地存档版本或身份不匹配，旧档已保留。');
    return {schema: 1, nativeMetadataSha256: META, localId: value.localId,
      userData: objectJson(value.userData), readOnly: objectJson(value.readOnly)};
  }
  // Accidental-corruption checksum only; this is neither authentication nor a server signature.
  function checksum(text) {
    const bytes = new TextEncoder().encode(text); let a = 1, b = 0;
    for (let start = 0; start < bytes.length; start += 5552) {
      const end = Math.min(start + 5552, bytes.length);
      for (let i = start; i < end; i++) { a += bytes[i]; b += a; }
      a %= 65521; b %= 65521;
    }
    return (((b << 16) | a) >>> 0).toString(16).padStart(8, '0');
  }
  function encode(value) {
    const p = payload(value), text = JSON.stringify(p);
    return JSON.stringify({payload: p, checksum_adler32: checksum(text)});
  }
  function decode(raw) {
    const record = JSON.parse(raw), p = payload(record.payload);
    if (record.checksum_adler32 !== checksum(JSON.stringify(p))) fail('本地存档校验失败，未重置旧档。');
    return p;
  }
  function store(storage) {
    let expected = storage.getItem(KEY);
    const loaded = expected === null ? null : decode(expected);
    return {
      loaded,
      commit(value) {
        const raw = encode(value);
        if (storage.getItem(KEY) !== expected) fail('存档已被另一页面更新，请保留当前页面后重新载入。');
        if (raw === expected) return false;
        // Preserve the previous complete envelope; failed backup/current writes propagate.
        if (expected !== null) storage.setItem(KEY + '.previous', expected);
        storage.setItem(KEY, raw);
        if (storage.getItem(KEY) !== raw) fail('本地存档写入后核对失败，上一份存档已保留。');
        expected = raw;
        return true;
      }
    };
  }
  function nativeBridge(Module) {
    const e = Module && Module.asm;
    for (const name of ['gamelab_profile_context', 'gamelab_profile_user_json',
      'gamelab_profile_readonly_json', 'gamelab_profile_identity', 'gamelab_profile_apply']) {
      if (!e || typeof e[name] !== 'function') fail('本地存档模块与当前游戏版本不匹配。');
    }
    function text(ptr) {
      ptr >>>= 0;
      if (!ptr) fail('原生存档尚未生成。');
      const count = Module.HEAP32[(ptr + 8) >>> 2];
      if (count < 0 || ptr + 12 + count * 2 > Module.HEAPU16.byteLength) fail('原生存档文本长度无效。');
      const start = (ptr + 12) >>> 1; let result = '';
      for (let i = 0; i < count; i += 4096)
        result += String.fromCharCode(...Module.HEAPU16.subarray(start + i, start + Math.min(count, i + 4096)));
      return result;
    }
    return {
      ready: () => !!e.gamelab_profile_context(),
      identity: () => { const ptr = e.gamelab_profile_identity(); return ptr ? text(ptr) : null; },
      snapshot: () => ({userData: text(e.gamelab_profile_user_json()), readOnly: text(e.gamelab_profile_readonly_json())}),
      apply(value) {
        const buffers = [], args = [];
        try {
          for (const str of [value.userData, value.readOnly, value.localId]) {
            const ptr = Module._malloc((str.length + 1) * 2);
            if (!ptr) fail('本地存档读取时内存不足。');
            buffers.push(ptr);
            for (let i = 0; i < str.length; i++) Module.HEAPU16[(ptr >>> 1) + i] = str.charCodeAt(i);
            Module.HEAPU16[(ptr >>> 1) + str.length] = 0;
            args.push(ptr, str.length);
          }
          const stack = Module.stackSave();
          try { e.gamelab_profile_apply(...args); }
          finally { Module.stackRestore(stack); }
        } finally { for (const ptr of buffers) Module._free(ptr); }
      }
    };
  }
  function session(storage, bridge, randomUUID) {
    const disk = store(storage);
    let value = disk.loaded;
    if (!value) {
      value = payload({schema: 1, nativeMetadataSha256: META,
        localId: 'local:' + randomUUID(), ...bridge.snapshot()});
      disk.commit(value);
    }
    bridge.apply(value);
    if (bridge.identity() !== value.localId) fail('原生本地身份写入核对失败，旧档已保留。');
    return {
      localId: value.localId,
      save() {
        if (bridge.identity() !== value.localId) fail('原生身份已经改变，停止覆盖本地存档。');
        const next = payload({...value, ...bridge.snapshot()});
        const changed = disk.commit(next); value = next;
        return changed;
      }
    };
  }
  function showFailure(error) {
    console.error('GameLab local profile failed:', error);
    let panel = document.getElementById('gamelab-local-profile-failure');
    if (!panel) {
      panel = document.createElement('div'); panel.id = 'gamelab-local-profile-failure';
      panel.setAttribute('role', 'alert');
      panel.style.cssText = 'position:fixed;left:12px;right:12px;bottom:12px;z-index:2147483647;background:#331919;color:#fff;padding:14px;border:1px solid #e69b9b;border-radius:8px;font:16px sans-serif';
      document.body.appendChild(panel);
    }
    panel.textContent = '本地存档未能完成，旧档没有被清除。请保留此页面并检查浏览器存储空间。';
  }
  async function attachOnce(instance) {
    const bridge = nativeBridge(instance.Module);
    const deadline = Date.now() + 60000;
    while (!bridge.ready()) {
      if (Date.now() >= deadline) fail('原生用户数据初始化超时，尚未读写本地存档。');
      await new Promise(resolve => setTimeout(resolve, 250));
    }
    const current = session(root.localStorage, bridge, () => root.crypto.randomUUID());
    let stopped = false, timer;
    function save() {
      if (stopped) return;
      try { current.save(); }
      catch (error) { stopped = true; clearInterval(timer); showFailure(error); }
    }
    timer = setInterval(save, 5000);
    root.addEventListener('pagehide', save);
    const visibility = () => { if (document.visibilityState === 'hidden') save(); };
    document.addEventListener('visibilitychange', visibility);
    // Local-profile completion is separate from original account/service readiness.
    root.dispatchEvent(new CustomEvent('gamelab-local-profile-loaded', {detail: {localId: current.localId}}));
    return {save, stop() { stopped = true; clearInterval(timer); root.removeEventListener('pagehide', save);
      document.removeEventListener('visibilitychange', visibility); }};
  }
  function attach(instance) {
    if (attached.has(instance)) return attached.get(instance);
    const promise = attachOnce(instance); attached.set(instance, promise); return promise;
  }
  const api = {KEY, META, checksum, encode, decode, store, nativeBridge, session, attach, showFailure};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.GameLabLocalProfile = api;
})(globalThis);
