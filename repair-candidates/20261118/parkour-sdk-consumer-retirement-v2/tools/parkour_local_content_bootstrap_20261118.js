const packages = window.localGameContent;
if (!Array.isArray(packages) || packages.length !== 3) throw new Error("Missing local content manifest");
const loader = window.createLocalContentLoader({
  base: new URL("./", window.location.href).href,
  fetch: window.fetch.bind(window),
  sha256: async bytes => Array.from(new Uint8Array(await window.crypto.subtle.digest("SHA-256", bytes)), value => value.toString(16).padStart(2, "0")).join("")
});
const flags = { scenes: "Scene1PackageLoaded", levels: "LevelPackageLoaded", audios: "AudioPackageLoaded" };
const identities = new Set(packages.map(group => group.name));
if (identities.size !== 3 || ["scenes", "levels", "audios"].some(name => !identities.has(name))) throw new Error("Invalid local content groups");
Promise.all(packages.map(group => loader.load(group).then(() => { N[flags[group.name]] = true; })))
  .then(() => n["PlayStream"]("audios/music.mp3"))
  .catch(error => {
    N["LocalContentError"] = String(error);
    const message = document.querySelector("#loading small");
    if (message) message.textContent = "本地内容加载失败，请重新打开游戏";
    console.error(error);
  });
