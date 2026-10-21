const cache={};
function normalize(name){const p=[];for(const part of name.split('/'))if(part==='..')p.pop();else if(part&&part!=='.')p.push(part);return p.join('/');}
function requireModule(name,parent=''){
 let id=normalize(name.startsWith('.')?parent.substring(0,parent.lastIndexOf('/')+1)+name:name);
 if(!__modules[id]&&__modules[id+'.js'])id+='.js';
 if(!__modules[id]&&__modules['engine/'+id])id='engine/'+id;
 if(!__modules[id]&&__modules['engine/'+id+'.js'])id='engine/'+id+'.js';
 if(cache[id])return cache[id].exports;
 if(!__modules[id])throw Error('Missing module: '+id);
 const mod=cache[id]={exports:{}};__modules[id](n=>requireModule(n,id),mod,mod.exports);return mod.exports;
}
window.require=name=>requireModule(name,document.currentScript?.src?new URL(document.currentScript.src).pathname.slice(1):'');
(async()=>{
 requireModule('src/polyfills.bundle.js');requireModule('src/system.bundle.js');
 System.warmup({importMap:requireModule('src/import-map.js').default,importMapUrl:'src/import-map.js',defaultHandler:p=>requireModule(p),handlers:{'plugin:':p=>requireModule('engine/'+p.replace(/^cocos\//,''))}});
 const app=await(await System.import('./application.js')).createApplication({loadJsListFile:p=>requireModule(p),fetchWasm:p=>'cocos-js/'+p});
 await app.import('cc');const cc=window.cc;
 if(window.WEB_CONFIG.adFree)window.installAdFreeUI({...cc,...await app.import('cc')});
 const loadScript=(url,options,done)=>{try{requireModule(url.replace(/^\//,''));done(null)}catch(e){done(e)}};
 cc.assetManager.downloader.register('.js',loadScript);
 cc.assetManager.downloader.downloadScript=loadScript;
 cc.assetManager.downloader.register('.ccon',(url,options,done)=>fetch(url.replace(/\.ccon$/,'.json')).then(r=>r.json()).then(async json=>{const parsed=cc.internal.parseCCONJson(json);const chunks=await Promise.all(parsed.chunks.map(s=>fetch(url.replace(/\.ccon$/,s)).then(r=>r.arrayBuffer()).then(b=>new Uint8Array(b))));done(null,new cc.internal.CCON(parsed.document,chunks))}).catch(done));
 await app.start({findCanvas:()=>({frame:document.getElementById('GameDiv'),container:document.getElementById('Cocos3dGameContainer'),canvas:window.canvas})});
 cc.debug.setDisplayStats(false);
 document.getElementById('status').textContent='';
})().catch(e=>{console.error(e);document.getElementById('status').textContent=e.stack||e;});
