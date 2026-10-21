// Read public game evidence in an isolated browser. No user browser cookies.
const {chromium}=require('playwright');
const fs=require('fs'), path=require('path'), crypto=require('crypto');
async function main(){
  const [url,dir]=process.argv.slice(2);
  const parsed=new URL(url); if(!['http:','https:'].includes(parsed.protocol)||parsed.username||parsed.password)throw Error('Invalid source URL');
  fs.mkdirSync(dir,{recursive:true});
  const browser=await chromium.launch(require('./browser-options.cjs')());
  try{
    const context=await browser.newContext({serviceWorkers:'block',acceptDownloads:false,viewport:{width:1000,height:760}});
    // Public pages cannot use this collector to probe local control-plane endpoints.
    const local=/^(localhost|127\.0\.0\.1|\[::1\])$/i.test(parsed.hostname);
    await context.route('**/*',route=>{
      const u=new URL(route.request().url());
      if(!['http:','https:','data:','blob:'].includes(u.protocol))return route.abort();
      if(!local && /^(localhost|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|\[)/i.test(u.hostname))return route.abort();
      if(local && u.origin!==parsed.origin && /^(localhost|127\.|\[::1\])/i.test(u.hostname))return route.abort();
      return route.continue();
    });
    const page=await context.newPage(), scripts=[], pending=[], errors=[], failed=[], documents=[];
    let bytes=0;
    page.on('pageerror',e=>errors.push(e.message.slice(0,300)));
    page.on('requestfailed',r=>{if(failed.length<50)failed.push({url:r.url().split('?')[0],reason:r.failure()?.errorText});});
    page.on('response',r=>{if(r.request().resourceType()==='document'&&documents.length<20)documents.push({url:r.url(),status:r.status()});});
    page.on('response',r=>{
      if(!r.ok()||r.request().resourceType()!=='script'||scripts.length>=15)return;
      const task=(async()=>{try{const body=await r.body();if(body.length>1000000||bytes+body.length>2000000||scripts.length>=15)return;bytes+=body.length;const name=`script-${scripts.length}.js`;scripts.push({url:r.url(),file:name,sha256:crypto.createHash('sha256').update(body).digest('hex')});fs.writeFileSync(path.join(dir,name),body);}catch{}})();pending.push(task);
    });
    const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:45000});
    if(!response||!response.ok())throw Error('Source returned HTTP '+response?.status());
    // Client-rendered hosting pages often insert their game iframe after hydration.
    // Observe only: never click ads, authentication or consent controls automatically.
    await page.waitForFunction(()=>document.querySelector('canvas')||[...document.querySelectorAll('iframe')].some(f=>f.getBoundingClientRect().width>200&&f.getBoundingClientRect().height>150),null,{timeout:20000}).catch(()=>{});
    await page.waitForTimeout(1500);
    await Promise.allSettled(pending);
    const html=await page.content();
    fs.writeFileSync(path.join(dir,'source.html'),html.slice(0,2000000));
    const frames=[];
    for(const frame of page.frames().slice(0,5)){
      try{frames.push({url:frame.url(),text:(await frame.locator('body').innerText({timeout:3000})).slice(0,24000),canvas_count:await frame.locator('canvas').count()});}catch{}
    }
    await page.screenshot({path:path.join(dir,'source.png')});
    const metadata=await page.locator('meta[name="description"],meta[property="og:description"]').evaluateAll(nodes=>nodes.map(n=>n.content));
    const inline=await page.locator('script:not([src])').allTextContents();
    fs.writeFileSync(path.join(dir,'inline.js'),inline.join('\n').slice(0,500000));
    const iframe_hints=await page.locator('iframe').evaluateAll(nodes=>nodes.map(n=>({url:n.src,width:n.getBoundingClientRect().width,height:n.getBoundingClientRect().height})).filter(n=>n.width>200&&n.height>150).slice(0,10));
    const entries=frames.filter(f=>f.canvas_count>0&&/^https?:/.test(f.url)).map(f=>({url:f.url,evidence:'rendered-canvas',canvas_count:f.canvas_count}));
    const result={url,final_url:page.url(),title:await page.title(),metadata,frames,scripts,page_errors:errors,
      web_discovery:{entries,iframe_hints,documents,failed_requests:failed,scope:'Rendered canvases and visible iframe hints; not proof of playable or complete resources'},
      appids:(()=>{const match=html.match(/game_code["']?\s*:\s*["'](wx[0-9a-f]{16})/);return match?[match[1]]:[...new Set(html.match(/wx[0-9a-f]{16}/g)||[])].slice(0,1)})(),
      limitation:'Read-only page observation; no claim that original gameplay has been played.'};
    fs.writeFileSync(path.join(dir,'observation.json'),JSON.stringify(result,null,2));
  }finally{await browser.close();}
}
main().catch(e=>{console.error(e.message);process.exitCode=1});
