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
    const page=await context.newPage(), scripts=[], pending=[], popupTasks=[], errors=[], failed=[], documents=[], popups=[];
    let bytes=0;
    page.on('pageerror',e=>errors.push(e.message.slice(0,300)));
    page.on('requestfailed',r=>{if(failed.length<50)failed.push({url:r.url().split('?')[0],reason:r.failure()?.errorText});});
    page.on('response',r=>{if(r.request().resourceType()==='document'&&documents.length<60)documents.push({url:r.url(),status:r.status()});});
    page.on('popup',popup=>{
      if(popups.length>=10)return;
      const record={url:popup.url(),title:'',canvas_count:0};popups.push(record);
      popupTasks.push((async()=>{try{await popup.waitForLoadState('domcontentloaded',{timeout:10000});record.url=popup.url();record.title=(await popup.title()).slice(0,300);record.canvas_count=await popup.locator('canvas').count()}catch{record.url=popup.url()}})());
    });
    page.on('response',r=>{
      if(!r.ok()||r.request().resourceType()!=='script'||scripts.length>=15)return;
      const task=(async()=>{try{const body=await r.body();if(body.length>1000000||bytes+body.length>2000000||scripts.length>=15)return;bytes+=body.length;const name=`script-${scripts.length}.js`;scripts.push({url:r.url(),file:name,sha256:crypto.createHash('sha256').update(body).digest('hex')});fs.writeFileSync(path.join(dir,name),body);}catch{}})();pending.push(task);
    });
    const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:45000});
    if(!response||!response.ok())throw Error('Source returned HTTP '+response?.status());
    // Client-rendered hosts may reveal an explicit ad-skip control after a countdown.
    // Only activate a visible, non-link control whose own label explicitly says to skip/close an ad.
    const skipInfo=()=>page.evaluate(()=>{
      const visible=n=>{const r=n.getBoundingClientRect(),s=getComputedStyle(n);return r.width>0&&r.height>0&&s.display!=='none'&&s.visibility!=='hidden'};
      const re=/(跳过广告|关闭广告|可直接跳过广告|skip\s+ad|close\s+ad)/i;
      const nodes=[...document.querySelectorAll('button,[role="button"],input[type="button"],input[type="submit"],[title],[aria-label],[class*="close"],[class*="skip"],[class*="countdown"]')];
      const n=nodes.find(x=>visible(x)&&!x.closest('a[href]')&&re.test([x.getAttribute('aria-label'),x.getAttribute('title'),x.innerText].filter(Boolean).join(' ').replace(/\s+/g,' ')));
      if(!n)return null;
      const countdown=Number(n.getAttribute('data-countdown')||n.closest('[data-countdown]')?.getAttribute('data-countdown')||0);
      return {countdown:Number.isFinite(countdown)?Math.max(0,Math.min(30,countdown)):0};
    });
    let ad_skip={found:false,clicked:false};
    let skip=await skipInfo();
    if(skip){
      ad_skip.found=true;
      if(skip.countdown>0)await page.waitForTimeout(skip.countdown*1000+300);
      ad_skip.clicked=await page.evaluate(()=>{
        const visible=n=>{const r=n.getBoundingClientRect(),s=getComputedStyle(n);return r.width>0&&r.height>0&&s.display!=='none'&&s.visibility!=='hidden'};
        const re=/(跳过广告|关闭广告|可直接跳过广告|skip\s+ad|close\s+ad)/i;
        const n=[...document.querySelectorAll('button,[role="button"],input[type="button"],input[type="submit"],[title],[aria-label],[class*="close"],[class*="skip"],[class*="countdown"]')].find(x=>visible(x)&&!x.closest('a[href]')&&re.test([x.getAttribute('aria-label'),x.getAttribute('title'),x.innerText].filter(Boolean).join(' ').replace(/\s+/g,' ')));
        if(!n)return false;
        n.click();return true;
      });
      if(ad_skip.clicked)await page.waitForTimeout(1000);
    }
    // Activate only one explicit game-start button in the main document.
    // Links and ambiguous, ad, consent, privacy, or authentication controls are never clicked.
    const controls=page.locator('button,[role="button"],input[type="button"],input[type="submit"]');
    const launchCandidates=await controls.evaluateAll(nodes=>{
      const start=/^(开始游戏|立即游戏|立即开始|开始玩|start game|play game|play now|start playing)$/i;
      const excluded=/(^|[^a-z])(ad|ads|advert|reward|login|sign.?in|consent|cookie|privacy|agree|accept|auth)([^a-z]|$)|广告|登录|同意|隐私/i;
      const visible=n=>{const r=n.getBoundingClientRect(),s=getComputedStyle(n);return r.width>0&&r.height>0&&s.display!=='none'&&s.visibility!=='hidden'};
      return nodes.map((n,index)=>({index,label:(n.innerText||n.getAttribute('aria-label')||n.value||n.title||'').trim().replace(/\s+/g,' ').slice(0,160),identity:[n.id,n.className,n.getAttribute('name'),n.getAttribute('aria-label'),n.title].join(' ')}))
        .filter(x=>visible(nodes[x.index])&&start.test(x.label)&&!excluded.test(x.identity));
    });
    const launch_action={attempted:launchCandidates.length===1,clicked:false,label:launchCandidates.length===1?launchCandidates[0].label:'',method:'mouse',reason:launchCandidates.length>1?'ambiguous start controls':''};
    if(launch_action.attempted){
      try{await controls.nth(launchCandidates[0].index).click({timeout:2500,noWaitAfter:true});launch_action.clicked=true;await page.waitForTimeout(1200)}
      catch(e){
        const activated=await controls.nth(launchCandidates[0].index).evaluate(node=>{if(!node.isConnected||node.disabled)return false;node.click();return true}).catch(()=>false);
        if(activated){launch_action.clicked=true;launch_action.method='dom-click-fallback';await page.waitForTimeout(1200)}
        else launch_action.reason=String(e.message||e).slice(0,200);
      }
    }
    // Embedded game shells can take several seconds to finish loading after launch.
    // Wait for a canvas in any bounded page frame, never for an arbitrary ad iframe.
    if(launch_action.clicked){
      const deadline=Date.now()+20000;
      while(Date.now()<deadline){
        const activeFrames=page.frames().slice(0,30);
        const counts=await Promise.all(activeFrames.map(frame=>frame.locator('canvas').count().catch(()=>0)));
        if(counts.some(count=>count>0))break;
        await page.waitForTimeout(500);
      }
    }
    // An ad frame can satisfy this check early; the ad-skip step above is independent of it.
    await page.waitForFunction(()=>document.querySelector('canvas')||[...document.querySelectorAll('iframe')].some(f=>f.getBoundingClientRect().width>200&&f.getBoundingClientRect().height>150),null,{timeout:20000}).catch(()=>{});
    await page.waitForTimeout(1500);
    await Promise.allSettled([...pending,...popupTasks]);
    const html=await page.content();
    fs.writeFileSync(path.join(dir,'source.html'),html.slice(0,2000000));
    const frames=[];
    for(const frame of page.frames().slice(0,30)){
      try{frames.push({url:frame.url(),referer:frame.parentFrame()?.url()||url,text:(await frame.locator('body').innerText({timeout:3000})).slice(0,24000),canvas_count:await frame.locator('canvas').count()});}catch{}
    }
    await page.screenshot({path:path.join(dir,'source.png')});
    const metadata=await page.locator('meta[name="description"],meta[property="og:description"]').evaluateAll(nodes=>nodes.map(n=>n.content));
    const inline=await page.locator('script:not([src])').allTextContents();
    fs.writeFileSync(path.join(dir,'inline.js'),inline.join('\n').slice(0,500000));
    const iframe_hints=await page.locator('iframe').evaluateAll(nodes=>nodes.map(n=>({url:n.src||n.getAttribute('data-url')||n.getAttribute('data-src')||'',evidence:n.src?'iframe-src':n.hasAttribute('data-url')?'iframe-data-url':n.hasAttribute('data-src')?'iframe-data-src':'iframe',width:n.getBoundingClientRect().width,height:n.getBoundingClientRect().height})).filter(n=>n.url||n.width>200&&n.height>150).slice(0,10));
    const iframe_probes=[];
    for(const lead of iframe_hints.filter(item=>['iframe-data-url','iframe-data-src'].includes(item.evidence)&&/^https?:\/\//i.test(item.url)).slice(0,2)){
      const probe=await context.newPage();let status=null;
      probe.on('response',response=>{if(response.request().resourceType()==='document'&&response.url()===lead.url)status=response.status()});
      try{
        await probe.goto(lead.url,{waitUntil:'domcontentloaded',timeout:12000}).catch(()=>{});
        await probe.waitForFunction(()=>document.querySelector('canvas'),null,{timeout:8000}).catch(()=>{});
        iframe_probes.push({declared_url:lead.url,final_url:probe.url(),http_status:status,title:await probe.title().catch(()=>''),canvas_count:await probe.locator('canvas').count().catch(()=>0)});
      }catch(error){iframe_probes.push({declared_url:lead.url,error:String(error.message||error).slice(0,200),canvas_count:0})}
      finally{await probe.close().catch(()=>{})}
    }
    const launch_links=await page.locator('a[href]').evaluateAll(nodes=>nodes.map(n=>({url:n.href,label:(n.innerText||n.getAttribute('aria-label')||n.title||'').trim().replace(/\s+/g,' ').slice(0,160),visible:!!(n.getClientRects().length&&getComputedStyle(n).visibility!=='hidden')})).filter(n=>n.visible&&/^https?:/.test(n.url)).slice(0,80));
    const launch_controls=await page.locator('button,[role="button"],input[type="button"],input[type="submit"]').evaluateAll(nodes=>nodes.map(n=>({label:(n.innerText||n.getAttribute('aria-label')||n.value||n.title||'').trim().replace(/\s+/g,' ').slice(0,160),visible:!!(n.getClientRects().length&&getComputedStyle(n).visibility!=='hidden')})).filter(n=>n.visible&&n.label).slice(0,40));
    const entries=[...frames.filter(f=>f.canvas_count>0&&/^https?:/.test(f.url)).map(f=>({url:f.url,referer:f.referer,evidence:'rendered-canvas',canvas_count:f.canvas_count})),...popups.filter(p=>p.canvas_count>0&&/^https?:/.test(p.url)).map(p=>({url:p.url,referer:url,evidence:'popup-rendered-canvas',canvas_count:p.canvas_count})),...iframe_probes.filter(p=>p.canvas_count>0&&/^https?:/.test(p.final_url)).map(p=>({url:p.final_url,referer:url,evidence:'declared-iframe-rendered-canvas',canvas_count:p.canvas_count}))];
    const result={url,final_url:page.url(),title:await page.title(),metadata,frames,scripts,page_errors:errors,
      web_discovery:{entries,iframe_hints,iframe_probes,launch_links,launch_controls,launch_action,popups,documents,failed_requests:failed,ad_skip,scope:'Only pages that actually render a canvas are confirmed entries; declared iframe URLs, links, controls and popups remain leads until probed'},
      appids:(()=>{const match=html.match(/game_code["']?\s*:\s*["'](wx[0-9a-f]{16})/);return match?[match[1]]:[...new Set(html.match(/wx[0-9a-f]{16}/g)||[])].slice(0,1)})(),
      limitation:'Read-only page observation; no claim that original gameplay has been played.'};
    fs.writeFileSync(path.join(dir,'observation.json'),JSON.stringify(result,null,2));
  }finally{await browser.close();}
}
main().catch(e=>{console.error(e.message);process.exitCode=1});
