(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory;
  else root.createLocalContentLoader = factory;
})(typeof globalThis === "object" ? globalThis : this, function (dependencies) {
  "use strict";
  const fetchResource = dependencies.fetch;
  const digest = dependencies.sha256;
  const base = new URL(dependencies.base);
  const completed = new Set();
  const active = new Map();
  const identities = new Map();
  if (!["http:", "https:"].includes(base.protocol)) throw new Error("Local content requires HTTP");
  function resolveLocal(path) {
    if (typeof path !== "string" || !path || /[\\:?#]/.test(path) || path.startsWith("/") || path.split("/").some(p => !p || p === "." || p === "..")) throw new Error("Invalid content path");
    const url = new URL(path.split("/").map(encodeURIComponent).join("/"), base);
    if (url.origin !== base.origin || !url.pathname.startsWith(base.pathname)) throw new Error("External content is not allowed");
    return url.href;
  }
  async function verify(group) {
    if (!group || typeof group.name !== "string" || !Array.isArray(group.files) || group.files.length === 0) throw new Error("Empty local package");
    const seen = new Set();
    for (const file of group.files) {
      resolveLocal(file.path);
      if (seen.has(file.path) || !Number.isSafeInteger(file.bytes) || file.bytes < 0 || !/^[a-f0-9]{64}$/.test(file.sha256)) throw new Error("Invalid local package entry");
      seen.add(file.path);
    }
    let cursor = 0;
    await Promise.all(Array.from({ length: Math.min(6, group.files.length) }, async () => {
      while (cursor < group.files.length) {
        const file = group.files[cursor++];
        const response = await fetchResource(resolveLocal(file.path), { credentials: "same-origin", redirect: "error" });
        if (!response.ok) throw new Error("Missing local content: " + file.path);
        const bytes = await response.arrayBuffer();
        if (bytes.byteLength !== file.bytes || await digest(bytes) !== file.sha256) throw new Error("Local content differs: " + file.path);
      }
    }));
    completed.add(group.name);
    return group.name;
  }
  return {
    load(group) {
      if (!group || typeof group.name !== "string") return Promise.reject(new Error("Missing package identity"));
      const identity = JSON.stringify(group.files);
      if (identities.has(group.name) && identities.get(group.name) !== identity) return Promise.reject(new Error("Package identity changed"));
      identities.set(group.name, identity);
      if (completed.has(group.name)) return Promise.resolve(group.name);
      if (!active.has(group.name)) {
        const promise = verify(group);
        active.set(group.name, promise);
        promise.catch(() => active.delete(group.name));
      }
      return active.get(group.name);
    },
    isReady(name) { return completed.has(name); }
  };
});
