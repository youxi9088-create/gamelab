async function boundedSettle(tasks,timeout){
 let timer;
 try{return await Promise.race([
  Promise.allSettled(tasks).then(()=>({timed_out:false})),
  new Promise(resolve=>{timer=setTimeout(()=>resolve({timed_out:true}),Math.max(1,timeout))})
 ])}finally{clearTimeout(timer)}
}
module.exports={boundedSettle};
