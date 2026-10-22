module.exports = function browserOptions() {
  const opts = {headless:true};
  if (process.env.BROWSER_EXECUTABLE) opts.executablePath = process.env.BROWSER_EXECUTABLE;
  return opts;
};
