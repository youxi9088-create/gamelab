const fs=require('node:fs'),path=require('node:path');
module.exports = function browserOptions(engine,configFile=path.resolve(__dirname,'../data/browser-runtime.json')) {
  const config=fs.existsSync(configFile)?JSON.parse(fs.readFileSync(configFile,'utf8')):{};
  const opts = {headless:!['0','false','no'].includes(String(process.env.BROWSER_HEADLESS??config.headless??'true').toLowerCase())};
  const executable=process.env.BROWSER_EXECUTABLE||config.executablePath;
  if (executable) opts.executablePath = executable;
  if(engine==='ruffle' && process.env.RUFFLE_BROWSER_EXECUTABLE){
    opts.executablePath=process.env.RUFFLE_BROWSER_EXECUTABLE;
    opts.args=['--enable-unsafe-swiftshader'];
  }
  return opts;
};
