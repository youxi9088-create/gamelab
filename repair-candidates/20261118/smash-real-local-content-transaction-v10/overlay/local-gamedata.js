(function(root) {
  'use strict';
  const KEY='gamelab.smash.local-content.v1',attached=new WeakMap();
  const fail=message=>{throw new Error(message);};
  const plain=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
  const identity=value=>typeof value==='string'&&/^local:[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
  function dateUTC(clock) { const value=clock(); if(!(value instanceof Date)||!Number.isFinite(value.getTime()))fail('本机日历无效'); return value.toISOString().slice(0,10); }
  function validatePlan(plan) {
    if(!plain(plan)||plan.schema!==1||plan.source!=='original-native-defaults'||!plain(plan.sourceHashes)||
       !Object.values(plan.sourceHashes).every(h=>typeof h==='string'&&/^[a-f0-9]{64}$/.test(h))||Object.keys(plan.sourceHashes).length<3||
       !Number.isInteger(plan.itemCount)||plan.itemCount<1||!Number.isInteger(plan.groupCount)||plan.groupCount<1||
       !plain(plan.arenas)||Object.keys(plan.arenas).length!==7)fail('原内容清单无效');
    const slots=['default1','default2','default3','default4','special1','special2','special3'];
    if(!slots.every(s=>typeof plan.arenas[s]==='string'&&plan.arenas[s]))fail('原生预设清单缺项');
    return plan;
  }
  function presets(raw,plan) {
    if(typeof raw!=='string'||raw.length>131072)fail('原生预设快照无效');
    let data;try{data=JSON.parse(raw);}catch{fail('原生预设JSON无效');}
    if(!plain(data))fail('原生预设不是对象');
    const expected=[...Object.keys(plan.arenas),'defaultsEndTime','special1EndTime','special2EndTime','special3EndTime'];
    if(Object.keys(data).length!==expected.length||!expected.every(k=>Object.hasOwn(data,k)))fail('原生预设字段不完整');
    for(const [slot,arena]of Object.entries(plan.arenas)) {
      const value=data[slot];
      if(!plain(value)||value.arenaName!==arena||typeof value.isTeams!=='boolean'||
         !['gameMode','arenaIndex','rules','weaponsBitmask'].every(k=>Number.isInteger(value[k])&&value[k]>=-2147483648&&value[k]<=2147483647))fail('原生地图或规则不完整：'+slot);
    }
    for(const k of expected.filter(k=>k.endsWith('EndTime')))if(!Number.isFinite(data[k])||!Number.isInteger(data[k]))fail('原生预设时限无效');
    return raw; // Retain the original exact string; never re-encode native long values through JS numbers.
  }
  function snapshot(value,plan) {
    validatePlan(plan);
    if(!plain(value)||!identity(value.localId)||value.itemCount!==plan.itemCount)fail('本地身份或原生物品目录未就绪');
    let groups;try{groups=JSON.parse(value.groupsJson);}catch{fail('原生分组JSON无效');}
    if(!plain(groups)||Object.keys(groups).length!==plan.groupCount||!Object.values(groups).every(plain))fail('原生内容分组缺失');
    return {localId:value.localId,playOptionsJSON:presets(value.playOptionsJSON,plan)};
  }
  function record(value,plan,utcDate) {
    if(!/^\d{4}-\d{2}-\d{2}$/.test(utcDate))fail('本地UTC日期无效');
    return {schema:1,source:'gamelab-native-local-content',dayIdOrigin:'local-utc-calendar',utcDate,localId:value.localId,
      sourceHashes:{...plan.sourceHashes},playOptionsJSON:value.playOptionsJSON};
  }
  function validateRecord(value,plan) {
    if(!plain(value)||value.schema!==1||value.source!=='gamelab-native-local-content'||value.dayIdOrigin!=='local-utc-calendar'||
       !identity(value.localId)||!/^\d{4}-\d{2}-\d{2}$/.test(value.utcDate)||
       JSON.stringify(value.sourceHashes)!==JSON.stringify(plan.sourceHashes))fail('本地内容记录版本或来源不符');
    presets(value.playOptionsJSON,plan);return value;
  }
  function disk(storage,plan,checksum) {
    let expected=storage.getItem(KEY),current=null;
    if(expected!==null) {
      let envelope;try{envelope=JSON.parse(expected);}catch{fail('本地内容记录损坏，原记录保留');}
      if(!plain(envelope)||typeof envelope.payload!=='string'||checksum(envelope.payload)!==envelope.checksum)fail('本地内容记录校验失败，原记录保留');
      current=validateRecord(JSON.parse(envelope.payload),plan);
    }
    return {get current(){return current;},commit(value) {
      validateRecord(value,plan);const payload=JSON.stringify(value),raw=JSON.stringify({payload,checksum:checksum(payload)});
      if(storage.getItem(KEY)!==expected)fail('另一页面已修改本地内容记录');
      if(raw===expected)return false;
      if(expected!==null)storage.setItem(KEY+'.previous',expected);
      storage.setItem(KEY,raw);if(storage.getItem(KEY)!==raw)fail('本地内容写后读回不一致');
      expected=raw;current=value;return true;
    }};
  }
  function applyRequest(storage,bridge,plan,checksum,clock=()=>new Date()) {
    validatePlan(plan);const writer=disk(storage,plan,checksum),live=snapshot(bridge.snapshot(),plan);
    if(writer.current&&writer.current.localId!==live.localId)fail('本地内容记录属于另一身份');
    const value=record(live,plan,dateUTC(clock));writer.commit(value);
    // This is an actual locally derived dataset passed directly to the legacy typed consumer;
    // it is not an intercepted Firebase response or a simulated SDK success callback.
    const payload=JSON.stringify({dayId:value.utcDate,playOptions:value.playOptionsJSON});
    if(bridge.identity()!==value.localId)fail('原生身份在内容保存后改变');
    bridge.apply(payload,value.localId);
    if(bridge.state()!==2)fail('原生本地内容应用未完成');
    return value;
  }
  function nativeBridge(Module) {
    const e=Module.asm;if(!e||!Module.HEAPU16||typeof Module._malloc!=='function'||typeof Module._free!=='function')fail('原生内容模块接口缺失');
    for(const n of ['context','state','presets_json','groups_json','identity','item_count','begin','apply'])if(typeof e['gamelab_game_data_'+n]!=='function')fail('原生内容桥接缺失');
    function text(ptr){if(!ptr)fail('原生内容字符串不存在');const n=Module.HEAP32[(ptr+8)>>2];if(n<0||n>2097152||(ptr+12+2*n)>Module.HEAPU16.byteLength)fail('原生内容字符串越界');let value='';for(let i=0;i<n;i+=8192)value+=String.fromCharCode(...Module.HEAPU16.subarray(((ptr+12)>>1)+i,((ptr+12)>>1)+Math.min(n,i+8192)));return value;}
    function withText(values,action){const stack=Module.stackSave(),buffers=[];try{const args=[];for(const value of values){const ptr=Module._malloc((value.length+1)*2);if(!ptr)fail('原生内容缓冲分配失败');buffers.push(ptr);for(let i=0;i<value.length;i++)Module.HEAPU16[(ptr>>1)+i]=value.charCodeAt(i);Module.HEAPU16[(ptr>>1)+value.length]=0;args.push(ptr,value.length);}return action(args);}finally{Module.stackRestore(stack);for(const p of buffers)Module._free(p);}}
    return {state:()=>e.gamelab_game_data_state(),identity:()=>text(e.gamelab_game_data_identity()),
      snapshot:()=>({localId:text(e.gamelab_game_data_identity()),playOptionsJSON:text(e.gamelab_game_data_presets_json()),groupsJson:text(e.gamelab_game_data_groups_json()),itemCount:e.gamelab_game_data_item_count()}),
      apply:(payload,id)=>withText([payload,id],args=>e.gamelab_game_data_apply(...args)),
      request:()=>{const p=e.gamelab_game_data_context();if(!p)fail('原生本地内容上下文未就绪');e.gamelab_game_data_begin(p,1,0);}};
  }
  function showFailure(error) { console.error('[GameLab local content]',error);let panel=document.getElementById('gamelab-local-content-failure');if(!panel){panel=document.createElement('div');panel.id='gamelab-local-content-failure';panel.style.cssText='position:fixed;inset:16px 16px auto;z-index:2147483647;background:#531d24;color:white;padding:16px;border-radius:8px;font:16px sans-serif';document.body.appendChild(panel);}panel.textContent='离线内容未能完成加载，原存档已保留。请保留此页面。'; }
  async function attachOnce(instance) {
    const response=await fetch('local-gamedata-plan.json',{cache:'no-store'});if(!response.ok)fail('原内容清单读取失败');
    const plan=validatePlan(await response.json()),bridge=nativeBridge(instance.Module),deadline=Date.now()+90000;
    while(bridge.state()!==1){if(Date.now()>=deadline)fail('等待原生本地内容请求超时');await new Promise(resolve=>setTimeout(resolve,250));}
    const api=root.GameLabLocalProfile;if(!api||typeof api.checksum!=='function')fail('本地存档校验模块缺失');
    let last=applyRequest(root.localStorage,bridge,plan,api.checksum),stopped=false,timer;
    console.info('[GameLab local content] original typed transaction applied; seven presets and original catalogs validated; day source=local UTC');
    function tick(){if(stopped)return;try{if(bridge.state()===2&&dateUTC(()=>new Date())!==last.utcDate)bridge.request();if(bridge.state()===1)last=applyRequest(root.localStorage,bridge,plan,api.checksum);}catch(error){stopped=true;clearInterval(timer);showFailure(error);}}
    timer=setInterval(tick,1000);return {stop(){stopped=true;clearInterval(timer);}};
  }
  function attach(instance){if(attached.has(instance))return attached.get(instance);const promise=attachOnce(instance);attached.set(instance,promise);return promise;}
  const api={KEY,validatePlan,presets,snapshot,record,validateRecord,disk,applyRequest,nativeBridge,attach,showFailure};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.GameLabLocalGameData=api;
})(globalThis);
