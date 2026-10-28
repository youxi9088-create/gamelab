const fs=require('fs'),path=require('path');
function blockedPackagedResources(report,root,origin){
 return (report.browser_extension?.client_blocked_requests||[]).filter(row=>{
  // A cancelled/probed request followed by a completed load is not a missing
  // runtime dependency. Preserve the failure trace without rejecting recovery.
  const loaded=report.browser_extension?.runtime_resource_loaded?.[row.url];
  if(row.at && loaded>row.at)return false;
  try{const u=new URL(row.url);if(u.origin!==origin)return false;const target=path.resolve(root,decodeURIComponent(u.pathname).replace(/^\/+/,''));return target.startsWith(path.resolve(root)+path.sep)&&/\.(swf|wasm)$/i.test(target)&&fs.statSync(target).isFile();}catch{return false;}
 }).map(row=>'Packaged runtime resource blocked by browser: '+row.url);
}
module.exports={blockedPackagedResources};
