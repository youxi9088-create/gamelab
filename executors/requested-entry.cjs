// Recover a public SPA deep link after a portal redirects to ?next=.
function returnLink(requested,current){
 try{const a=new URL(requested),b=new URL(current),next=b.searchParams.get('next');
  if(a.origin!==b.origin||a.pathname===b.pathname||!next)return null;
  const target=new URL(next,b);
  return target.origin===a.origin&&target.pathname===a.pathname&&target.search===a.search?a.href:null;
 }catch{return null;}
}
async function recoverRequestedEntry(page,requested,timeout){
 const before=page.url(),target=returnLink(requested,before);
 if(!target)return {attempted:false};
 const links=page.locator('a[href]');
 const count=await links.count();
 for(let i=0;i<count;i++){
  if(await links.nth(i).evaluate(a=>a.href)!==target)continue;
  // Follow only an observed exact target link, never a promoted game's Play button.
  await links.nth(i).evaluate(a=>a.click());
  await page.waitForURL(u=>u.origin+u.pathname+u.search===target,{timeout});
  return {attempted:true,before,after:page.url(),evidence:'exact-requested-link'};
 }
 throw Error('入口重定向到门户，未发现原请求地址对应的链接');
}
module.exports={returnLink,recoverRequestedEntry};
