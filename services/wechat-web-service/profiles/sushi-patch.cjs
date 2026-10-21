const acorn=require('../vendor/acorn.cjs');
module.exports=function(source){
const ast=acorn.parse(source,{ecmaVersion:'latest'}),edits=[],changed=[];
const starts=[...source.matchAll(/System.register\("chunks:\/\/\/_virtual\/([^" ]+)/g)].map(m=>({offset:m.index,name:m[1]}));
if(starts.length<50)throw Error('Module boundaries not found');
function moduleAt(p){return starts.findLast(x=>x.offset<=p)?.name||'';}
const disabled=new Set(['showBannerAd','showBannerAd$','showBanner','createBanner','showNativeBanner','clickNativeBanner','showInterstitialAd','showIntertitalAd','popupInterstitialAd','showNativeAd','createNativeAd','clickNativeAd','showBlockAd','showBlockAd$','showBlockBanner','showBlocksAd','showCustemAd','showCustemAd1','showCustemAd2','showCustemInsert','showCustomBanner','showCustomBannerAd','showPortal','showPortal$','forceVideo','loopForceAds','loopQQVideoAd','loopVivoCusInsertAd','loopWxMoreGame','loopInterst','AD_IMPRESSION','AD_PLACEMENT','showUIAirDropAni','hideUIAirDropAni']);
function walk(n){if(!n||typeof n!=='object')return;
 if(n.type==='AssignmentExpression'&&n.left.type==='MemberExpression'&&n.right.type==='FunctionExpression'){
  const name=n.left.property.name,mod=moduleAt(n.start);let body;
  if(disabled.has(name))body='{}';
  if(name==='rewardVideo'&&mod==='AdsManager.ts')body='{return Promise.resolve({count:1,adFree:true})}';
  if(/^rewardVideo(?:Mul\d*)?$/.test(name)&&/^Platform|^BasePlatform/.test(mod))body='{return Promise.resolve({count:1,adFree:true})}';
  if(name==='rewardVideo'&&mod==='BasePanel.ts')body='{return sm.ads.rewardVideo(this.panelId).then(function(){return '+n.right.params[0].name+'&&'+n.right.params[0].name+'({count:1,adFree:true})})}';
  if(mod==='NativeAds.ts'&&['onLoad','show','refresh','update','setVisible','clickNative'].includes(name))body='{this.node.active=false}';
  if(body!==undefined){edits.push({start:n.right.body.start,end:n.right.body.end,text:body});changed.push(mod+':'+name);return;}
 }
 for(const value of Object.values(n))if(Array.isArray(value))value.forEach(walk);else if(value&&typeof value==='object')walk(value);
}
walk(ast);let patched=source;for(const e of edits.sort((a,b)=>b.start-a.start))patched=patched.slice(0,e.start)+e.text+patched.slice(e.end);
patched=patched.replace('t._videoInstance.destroy()&&t._videoInstance.destroy,t._videoInstance=null,','');
acorn.parse(patched,{ecmaVersion:'latest'});

return patched;
};
