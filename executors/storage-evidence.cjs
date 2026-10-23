// Read-only evidence from the isolated game page. Never writes/imports saves.
async function storageEvidence(page){
 try{return await page.evaluate(async()=>{
  const result={scope:'isolated-page-web-storage',origin:location.origin,observed_at:new Date().toISOString(),areas:{},
   limitation:'Storage presence/hash does not prove game progress was loaded. IndexedDB is read-only and bounded; in-memory state is not inspected.'};
  const digest=async value=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))),b=>b.toString(16).padStart(2,'0')).join('');
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
           const value=JSON.stringify(c.value,(k,v)=>ArrayBuffer.isView(v)?{typed:v.constructor.name,bytes:Array.from(new Uint8Array(v.buffer,v.byteOffset,v.byteLength))}:v instanceof ArrayBuffer?{bytes:Array.from(new Uint8Array(v))}:v);
           const key=JSON.stringify(c.key);const size=(value||'').length+key.length;
           if(++entries>100){store.limit_reached=true;resolve(records);return;}
           if(bytes+size>4_000_000){store.limit_reached=true;store.skipped_entries=(store.skipped_entries||0)+1;c.continue();return;}
           bytes+=size;records.push({key,value:value||'null'});c.continue();
          }catch(e){reject(e);}
         };
        });
        for(const v of values)store.entries.push({key:v.key.slice(0,160),key_sha256:await digest(v.key),characters:v.value.length,sha256:await digest(v.value)});
        if(!store.complete)item.complete=false;
       }
      })(),new Promise((resolve,reject)=>{timer=setTimeout(()=>reject(Error('ReadTimeout')),3000);})]);
     }catch(e){item.complete=false;item.error=String(e.name||'IndexedDBReadError');}
     finally{clearTimeout(timer);if(db)db.close();}
     if(!item.complete)idb.complete=false;
    }
   }catch(e){idb.complete=false;idb.error=String(e.name||'IndexedDBReadError');}
  }
  return result;
 });}catch(e){return {scope:'isolated-page-web-storage',available:false,error:String(e.name||'StorageObservationError')};}
}
module.exports={storageEvidence};
