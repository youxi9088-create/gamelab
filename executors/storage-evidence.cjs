// Read-only evidence from the isolated game page. Never writes/imports saves.
async function storageEvidence(page){
 try{return await page.evaluate(async()=>{
  const result={scope:'isolated-page-web-storage',origin:location.origin,observed_at:new Date().toISOString(),areas:{},
   limitation:'Storage hashes do not prove game progress was loaded. IndexedDB and exposed WASM /data files are read-only snapshots, not an atomic cross-store snapshot. Save bodies are never returned.'};
  const digest=async value=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))),b=>b.toString(16).padStart(2,'0')).join('');
  const binary=v=>ArrayBuffer.isView(v)?new Uint8Array(v.buffer,v.byteOffset,v.byteLength):v instanceof ArrayBuffer?new Uint8Array(v):null;
  const rawHash=async v=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',v)),b=>b.toString(16).padStart(2,'0')).join('');
  const sizeOf=(v,seen=new Set(),depth=0)=>{
   if(depth>20||seen.has(v))throw Error('UnsupportedStructuredValue');
   const b=binary(v);if(b)return b.byteLength;
   if(typeof Blob!=='undefined'&&v instanceof Blob)return v.size;
   if(v instanceof Date)return 24;
   if(typeof v==='string')return v.length*2;
   if(v&&typeof v==='object'){seen.add(v);let n=0;for(const k of Object.keys(v)){n+=k.length*2+sizeOf(v[k],seen,depth+1);}seen.delete(v);return n;}
   return 16;
  };
  const summarize=async v=>{
   const b=binary(v);if(b)return {type:v.constructor.name,bytes:b.byteLength,sha256:await rawHash(b)};
   if(typeof Blob!=='undefined'&&v instanceof Blob)return {type:'Blob',bytes:v.size,sha256:await rawHash(await v.arrayBuffer())};
   if(v instanceof Date)return {type:'Date',value:v.toISOString()};
   if(v&&typeof v==='object'){const r=Array.isArray(v)?[]:{};for(const k of Object.keys(v).sort())r[k]=await summarize(v[k]);return r;}
   return v;
  };
  for(const area of ['localStorage','sessionStorage']){
   const evidence={available:false,complete:false,entries:[]};result.areas[area]=evidence;
   try{
    const storage=window[area],count=storage.length,items=[];let chars=0;
    evidence.available=true;evidence.total_entries=count;
    for(let i=0;i<Math.min(count,100);i++){
     const key=storage.key(i);if(key===null){evidence.changed_during_read=true;continue;}
     const value=storage.getItem(key);if(value===null){evidence.changed_during_read=true;continue;}
     if(chars+key.length+value.length>4_000_000){evidence.limit_reached=true;break;}
     chars+=key.length+value.length;items.push({key,value});
    }
    for(const {key,value} of items)evidence.entries.push({key:key.slice(0,160),key_sha256:await digest(key),characters:value.length,sha256:await digest(value)});
    evidence.entries.sort((a,b)=>a.key_sha256.localeCompare(b.key_sha256));
    evidence.complete=!evidence.changed_during_read&&!evidence.limit_reached&&items.length===count&&storage.length===count;
   }catch(e){evidence.error=String(e.name||'StorageReadError');}
  }
  const idb={available:false,complete:false,databases:[]};result.areas.indexedDB=idb;
  if(window.indexedDB?.databases){
   try{
    const databases=await window.indexedDB.databases();idb.available=true;idb.total_databases=databases.length;
    let bytes=0,entries=0;idb.complete=databases.length<=8;
    for(const info of databases.slice(0,8)){
     const item={name:info.name,version:info.version,stores:[],complete:false};idb.databases.push(item);
     let db,timer;
     try{
      await Promise.race([(async()=>{
       db=await new Promise((resolve,reject)=>{const r=window.indexedDB.open(info.name,info.version);r.onupgradeneeded=()=>{r.transaction.abort();reject(Error('DatabaseChanged'));};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.onblocked=()=>reject(Error('DatabaseBlocked'));});
       const names=[...db.objectStoreNames];item.complete=names.length<=16;
       for(const name of names.slice(0,16)){
        const store={name,entries:[],complete:false};item.stores.push(store);
        const values=await new Promise((resolve,reject)=>{
         const tx=db.transaction(name,'readonly'),records=[];const cursor=tx.objectStore(name).openCursor();
         cursor.onerror=()=>reject(cursor.error);tx.onabort=()=>reject(tx.error||Error('ReadAborted'));
         cursor.onsuccess=()=>{
          const c=cursor.result;if(!c){store.complete=!store.limit_reached;resolve(records);return;}
          try{
           const key=JSON.stringify(c.key);const size=sizeOf(c.value)+key.length;
           if(++entries>100){store.limit_reached=true;resolve(records);return;}
           if(bytes+size>64*1024*1024){store.limit_reached=true;store.skipped_entries=(store.skipped_entries||0)+1;(store.omitted??=[]).push({key:key.slice(0,160),bytes:size,reason:'byte-limit'});c.continue();return;}
           bytes+=size;records.push({key,value:c.value,bytes:size});c.continue();
          }catch(e){reject(e);}
         };
        });
        for(const v of values){
         const summary=await summarize(v.value),content=summary?.contents;
         store.entries.push({key:v.key.slice(0,160),key_sha256:await digest(v.key),bytes:v.bytes,
          sha256:await digest(JSON.stringify(summary)),hash_format:'structured-binary-sha256-v1',
          ...(content?.sha256?{content_sha256:content.sha256,content_bytes:content.bytes}:{}),
          ...(typeof v.value?.mode==='number'?{mode:v.value.mode}:{}),
          ...(v.value?.timestamp instanceof Date?{modified_at:v.value.timestamp.toISOString()}:{}),
         });
        }
        if(!store.complete)item.complete=false;
       }
      })(),new Promise((resolve,reject)=>{timer=setTimeout(()=>reject(Error('ReadTimeout')),3000);})]);
     }catch(e){item.complete=false;item.error=String(e.name||'IndexedDBReadError');}
     finally{clearTimeout(timer);if(db)db.close();}
     if(!item.complete)idb.complete=false;
    }
   }catch(e){idb.complete=false;idb.error=String(e.name||'IndexedDBReadError');}
  }
  const wasm={available:false,complete:false,root:'/data',entries:[]};result.areas.wasmFS=wasm;
  const filesystem=window.Module?.FS||(typeof FS!=='undefined'?FS:null);
  if(filesystem?.readdir&&filesystem?.lstat&&filesystem?.readFile){
   try{
    let total=0;wasm.available=true;wasm.complete=true;const pending=['/data'];
    while(pending.length){
     if(wasm.entries.length>=100){wasm.complete=false;wasm.limit_reached=true;break;}
     const name=pending.shift(),s=filesystem.lstat(name),item={path:name,bytes:s.size,mode:s.mode};
     wasm.entries.push(item);
     if(filesystem.isLink(s.mode)){item.skipped='symlink';wasm.complete=false;continue;}
     if(filesystem.isDir(s.mode)){
      for(const child of filesystem.readdir(name).sort())if(child!=='.'&&child!=='..'&&!child.includes('/'))pending.push(name+'/'+child);
     }else if(filesystem.isFile(s.mode)){
      if(total+s.size>64*1024*1024){item.skipped='byte-limit';wasm.complete=false;continue;}
      const data=filesystem.readFile(name);total+=data.byteLength;item.content_sha256=await rawHash(data);
      if(filesystem.lstat(name).mtime?.getTime()!==s.mtime?.getTime()){item.changed_during_read=true;wasm.complete=false;}
     }
    }
   }catch(e){wasm.complete=false;wasm.error=String(e.name||'FileSystemReadError');}
  }
  return result;
 });}catch(e){return {scope:'isolated-page-web-storage',available:false,error:String(e.name||'StorageObservationError')};}
}
module.exports={storageEvidence};
