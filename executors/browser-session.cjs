// 人工授权的登录态复用。
//
// 采集默认"无 cookie 的全新上下文"（见 acquire.cjs 首行），这是有意的隔离设计。
// 但有些站点（如 4k99）启动游戏前强制登录，不登录就拿不到可运行入口。这里的
// 做法是：由账号持有者本人在有头浏览器里登录一次，把 storageState 存到
// data/browser-sessions/<host>.json，采集时按域名自动带上。
//
// 平台不自动注册、不伪造登录态；没有存档文件就与以前完全一致。
const fs=require('fs'), path=require('path');

const DIR=path.resolve(__dirname,'..','data','browser-sessions');

function hostOf(value){
  try{return new URL(value).hostname.toLowerCase().replace(/^www\./,'')}catch{return ''}
}

/** 返回可展开进 newContext / request.newContext 的选项；无存档时为空对象。 */
function sessionOptions(url){
  const host=hostOf(url);
  if(!host)return {};
  for(const name of [host+'.json','www.'+host+'.json']){
    const file=path.join(DIR,name);
    if(!fs.existsSync(file))continue;
    try{
      JSON.parse(fs.readFileSync(file,'utf-8'));
      return {storageState:file};
    }catch(e){
      console.error('登录态文件损坏，已忽略：'+file);
    }
  }
  return {};
}

module.exports={sessionOptions,DIR};
