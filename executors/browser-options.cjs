const fs = require('node:fs');
module.exports = function browserOptions() {
  const opts = {headless:true};
  if (process.env.BROWSER_EXECUTABLE) opts.executablePath = process.env.BROWSER_EXECUTABLE;
  else if (process.platform === 'win32') {
    const candidates = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe'];
    const found = candidates.find(p => fs.existsSync(p));
    if (found) opts.executablePath = found;
  }
  return opts;
};
