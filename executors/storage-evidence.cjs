// Read-only evidence from the isolated game page. Never writes/imports saves.
async function storageEvidence(page){
 try{return await page.evaluate(async()=>{
  const result={scope:'isolated-page-web-storage',origin:location.origin,observed_at:new Date().toISOString(),areas:{},
   limitation:'Storage presence/hash does not prove game progress was loaded. IndexedDB and in-memory state are not inspected.'};
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
  return result;
 });}catch(e){return {scope:'isolated-page-web-storage',available:false,error:String(e.name||'StorageObservationError')};}
}
module.exports={storageEvidence};
