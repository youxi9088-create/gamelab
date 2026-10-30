// Bounded retries for idempotent resource transfers only.
async function transfer(fetch,{method='GET',wait=ms=>new Promise(r=>setTimeout(r,ms))}={}){
 for(let attempt=0;;attempt++){
  try{return await fetch();}catch(error){
   if(method!=='GET'||attempt>=2||!/ECONNRESET|ETIMEDOUT|socket hang up|connection.*closed/i.test(error.message))throw error;
   await wait(300*(attempt+1));
  }
 }
}
module.exports={transfer};
