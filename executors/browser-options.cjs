module.exports = function browserOptions(engine) {
  const opts = {headless:true};
  if (process.env.BROWSER_EXECUTABLE) opts.executablePath = process.env.BROWSER_EXECUTABLE;
  if(engine==='ruffle' && process.env.RUFFLE_BROWSER_EXECUTABLE){
    opts.executablePath=process.env.RUFFLE_BROWSER_EXECUTABLE;
    opts.args=['--enable-unsafe-swiftshader'];
  }
  return opts;
};
