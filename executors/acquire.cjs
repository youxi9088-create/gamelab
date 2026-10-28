// Read public game evidence in an isolated browser. No user browser cookies.
const {chromium}=require('playwright');
const fs=require('fs'), path=require('path'), crypto=require('crypto');
const {declaredEntries}=require('./declared-entry.cjs');

// 广告与统计域是采集超时的主要来源：4k99 详情页首字节就要 6–9 秒，挂上
// 百度/doubleclick/mediav/recaptcha 之后 90 秒预算根本不够。它们也与游戏
// 入口无关，直接断掉，既提速又减少 iframe 候选里的噪声。
const AD_HOST=/(^|\.)(doubleclick\.net|googlesyndication\.com|adservice\.google\.com|googleadservices\.com|pos\.baidu\.com|mediav\.com|adnxs\.com|criteo\.com|amazon-adsystem\.com|google-analytics\.com|googletagmanager\.com|hm\.baidu\.com)$/;

// 总时长由调用方给出（budget.remaining），留 8 秒收尾后作为内部 deadline。
// 早先卡在某个 wait 上就整个进程被 kill，observation.json 一个字节都不写，
// 下游只能看到"采集失败"四个字。现在即使中途卡住也把已收集到的证据落盘。
const BUDGET_MS=Number(process.env.GAMELAB_ACQUIRE_TIMEOUT_MS||180000);
const deadline=Date.now()+Math.max(20000,BUDGET_MS-8000);
const left=()=>deadline-Date.now();
const within=(ms)=>Math.max(1000,Math.min(ms,left()));

function hostOf(value){
  try{return new URL(value).hostname.toLowerCase()}catch{return ''}
}
/** 入口候选打分：面积是主信号，广告域直接出局，够大的容器加权。 */
function scoreFrame(url,width,height,viewport){
  const host=hostOf(url);
  if(!host||AD_HOST.test(host))return -1;
  let score=Math.min(width,viewport.width)*Math.min(height,viewport.height);
  if(width>=200&&height>=150)score*=1.5;
  return Math.round(score);
}
async function main(){
  const [url,dir]=process.argv.slice(2);
  const parsed=new URL(url); if(!['http:','https:'].includes(parsed.protocol)||parsed.username||parsed.password)throw Error('Invalid source URL');
  fs.mkdirSync(dir,{recursive:true});
  const observation={url,final_url:url,title:'',metadata:[],frames:[],scripts:[],page_errors:[],
    web_discovery:{entries:[],iframe_hints:[],iframe_probes:[],loader_hints:[],launch_links:[],
      launch_controls:[],launch_action:{attempted:false,clicked:false,label:'',method:'mouse',reason:'',candidate_count:0},
      popups:[],documents:[],failed_requests:[],ad_skip:{found:false,clicked:false},blocked_ad_hosts:[],
      scope:'Only pages that actually render a canvas are confirmed entries; declared loader URLs, iframe URLs, links, controls and popups remain leads until probed'},
    appids:[],limitation:'Read-only page observation; no claim that original gameplay has been played.'};
  const browser=await chromium.launch(require('./browser-options.cjs')());
  try{
    const context=await browser.newContext({serviceWorkers:'block',acceptDownloads:false,viewport:{width:1000,height:760}});
    // Public pages cannot use this collector to probe local control-plane endpoints.
    const local=/^(localhost|127\.0\.0\.1|\[::1\])$/i.test(parsed.hostname);
    const blockedAds=new Set();
    await context.route('**/*',route=>{
      const u=new URL(route.request().url());
      if(!['http:','https:','data:','blob:'].includes(u.protocol))return route.abort();
      if(!local && /^(localhost|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|\[)/i.test(u.hostname))return route.abort();
      if(local && u.origin!==parsed.origin && /^(localhost|127\.|\[::1\])/i.test(u.hostname))return route.abort();
      if(AD_HOST.test(u.hostname)){blockedAds.add(u.hostname);return route.abort()}
      return route.continue();
    });
    const page=await context.newPage(), scripts=[], pending=[], popupTasks=[], errors=[], failed=[], documents=[], popups=[];
    let bytes=0;
    let lastRequestAt=Date.now();
    page.on('request',()=>{lastRequestAt=Date.now();});
    page.on('pageerror',e=>errors.push(e.message.slice(0,300)));
    page.on('requestfailed',r=>{if(failed.length<50)failed.push({url:r.url().split('?')[0],reason:r.failure()?.errorText});});
    page.on('response',r=>{if(r.request().resourceType()==='document'&&documents.length<60)documents.push({url:r.url(),status:r.status()});});
    page.on('popup',popup=>{
      if(popups.length>=10)return;
      const record={url:popup.url(),title:'',canvas_count:0};popups.push(record);
      popupTasks.push((async()=>{try{await popup.waitForLoadState('domcontentloaded',{timeout:within(10000)});record.url=popup.url();record.title=(await popup.title()).slice(0,300);record.canvas_count=await popup.locator('canvas').count()}catch{record.url=popup.url()}})());
    });
    page.on('response',r=>{
      if(!r.ok()||r.request().resourceType()!=='script'||scripts.length>=15)return;
      const task=(async()=>{try{const body=await r.body();if(body.length>1000000||bytes+body.length>2000000||scripts.length>=15)return;bytes+=body.length;const name=`script-${scripts.length}.js`;scripts.push({url:r.url(),file:name,sha256:crypto.createHash('sha256').update(body).digest('hex')});fs.writeFileSync(path.join(dir,name),body);}catch{}})();pending.push(task);
    });
    const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:within(45000)});
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
      if(skip.countdown>0)await page.waitForTimeout(Math.min(skip.countdown*1000+300,within(30000)));
      ad_skip.clicked=await page.evaluate(()=>{
        const visible=n=>{const r=n.getBoundingClientRect(),s=getComputedStyle(n);return r.width>0&&r.height>0&&s.display!=='none'&&s.visibility!=='hidden'};
        const re=/(跳过广告|关闭广告|可直接跳过广告|skip\s+ad|close\s+ad)/i;
        const n=[...document.querySelectorAll('button,[role="button"],input[type="button"],input[type="submit"],[title],[aria-label],[class*="close"],[class*="skip"],[class*="countdown"]')].find(x=>visible(x)&&!x.closest('a[href]')&&re.test([x.getAttribute('aria-label'),x.getAttribute('title'),x.innerText].filter(Boolean).join(' ').replace(/\s+/g,' ')));
        if(!n)return false;
        n.click();return true;
      });
      if(ad_skip.clicked)await page.waitForTimeout(1000);
    }
    // 采样必须在点击之前：早先 launch_controls 是点完再取，
    // 复盘时看不到当时页面上到底有哪些候选按钮。
    const controlSnapshot=await page.locator('button,[role="button"],input[type="button"],input[type="submit"]').evaluateAll(nodes=>{
      const visible=n=>{const r=n.getBoundingClientRect(),s=getComputedStyle(n);return r.width>0&&r.height>0&&s.display!=='none'&&s.visibility!=='hidden'};
      return nodes.map((n,index)=>{
        const rect=n.getBoundingClientRect();
        return {index,label:(n.innerText||n.getAttribute('aria-label')||n.value||n.title||'').trim().replace(/\s+/g,' ').slice(0,160),
          identity:[n.id,n.className,n.getAttribute('name'),n.getAttribute('aria-label'),n.title].join(' '),
          area:Math.round(rect.width*rect.height),visible:visible(n)};
      }).filter(x=>x.visible);
    });
    observation.web_discovery.launch_controls=controlSnapshot.map(x=>({label:x.label,visible:x.visible,area:x.area})).slice(0,40);
    // Activate one explicit game-start control. Links and ambiguous, ad, consent,
    // privacy, or authentication controls are never clicked.
    // 早先是全等正则，文案多一个字就失配；且候选多于 1 个就整个放弃
    // （reason 记 ambiguous）。改为包含匹配 + 按面积择优。
    const start=/开始游戏|立即游戏|立即开始|开始玩|开始挑战|进入游戏|免费玩|play\s*game|play\s*now|start\s*game|start\s*playing|play\s*free/i;
    const excluded=/(^|[^a-z])(ad|ads|advert|reward|login|sign.?in|consent|cookie|privacy|agree|accept|auth)([^a-z]|$)|广告|登录|同意|隐私/i;
    const launchCandidates=controlSnapshot.filter(x=>start.test(x.label)&&!excluded.test(x.identity))
      .sort((a,b)=>b.area-a.area);
    const launch_action={attempted:launchCandidates.length>0,clicked:false,
      label:launchCandidates.length?launchCandidates[0].label:'',method:'mouse',
      candidate_count:launchCandidates.length,
      reason:launchCandidates.length>1?`页面有多个启动控件，已选面积最大的“${launchCandidates[0].label}”`:''};
    const controls=page.locator('button,[role="button"],input[type="button"],input[type="submit"]');
    if(launch_action.attempted){
      try{await controls.nth(launchCandidates[0].index).click({timeout:within(2500),noWaitAfter:true});launch_action.clicked=true;await page.waitForTimeout(1200)}
      catch(e){
        const activated=await controls.nth(launchCandidates[0].index).evaluate(node=>{if(!node.isConnected||node.disabled)return false;node.click();return true}).catch(()=>false);
        if(activated){launch_action.clicked=true;launch_action.method='dom-click-fallback';await page.waitForTimeout(1200)}
        else launch_action.reason=String(e.message||e).slice(0,200);
      }
    }
    observation.web_discovery.launch_action=launch_action;
    // 内嵌游戏壳层要几秒才渲染完；astrocade 的 srcdoc iframe 约 10 秒才出 canvas。
    // 早先这段只在"点过启动按钮"后才等，没有可点按钮的站点（如 astrocade）就会在
    // 游戏渲染完成前收尾，看起来像"没有入口"。改成一律在预算内等待。
    {
      const stop=Date.now()+Math.min(within(25000),25000);
      while(Date.now()<stop){
        const activeFrames=page.frames().slice(0,30);
        const counts=await Promise.all(activeFrames.map(frame=>frame.locator('canvas').count().catch(()=>0)));
        if(counts.some(count=>count>0))break;
        await page.waitForTimeout(500);
      }
    }
    // An ad frame can satisfy this check early; the ad-skip step above is independent of it.
    await page.waitForFunction(()=>document.querySelector('canvas')||[...document.querySelectorAll('iframe')].some(f=>f.getBoundingClientRect().width>200&&f.getBoundingClientRect().height>150),null,{timeout:within(20000)}).catch(()=>{});
    // canvas 只代表引擎就绪（Splash 画面）；主菜单/玩法的资源在随后几十秒内
    // 才会按需加载（Cocos 的 Config、预制体、语言包等）。在这里等"请求静默"
    // （连续 5s 无新请求）再收尾，一次性抓全运行时资源；否则 reconstruct
    // 阶段要靠 verify 端数百次小批量回源补齐，还可能因资源不完整被阻断。
    {
      const deadline=Date.now()+Math.min(within(90000),90000);
      while(Date.now()<deadline){
        if(Date.now()-lastRequestAt>5000)break;
        await page.waitForTimeout(500);
      }
    }
    await page.waitForTimeout(1500);
    await Promise.allSettled([...pending,...popupTasks]);
    const html=await page.content();
    fs.writeFileSync(path.join(dir,'source.html'),html.slice(0,2000000));
    const viewport=page.viewportSize()||{width:1000,height:760};
    const frames=[];
    const srcdocs=[];
    for(const frame of page.frames().slice(0,30)){
      if(left()<3000)break;
      try{
        const record={url:frame.url(),referer:frame.parentFrame()?.url()||url,
          text:(await frame.locator('body').innerText({timeout:3000})).slice(0,24000),
          canvas_count:await frame.locator('canvas').count()};
        // srcdoc iframe 没有自己的 URL（frame.url() 恒为 about:srcdoc），但游戏本体
        // 就写在它的文档里。不留档的话这条线索会直接丢失，astrocade 就是这种情况。
        if(record.url==='about:srcdoc'&&record.canvas_count>0){
          try{
            const doc=await frame.content();
            const file='srcdoc-'+(srcdocs.length+1)+'.html';
            fs.writeFileSync(path.join(dir,file),doc.slice(0,2000000));
            record.srcdoc_file=file;record.srcdoc_bytes=Math.min(doc.length,2000000);
            srcdocs.push({file,bytes:record.srcdoc_bytes,canvas_count:record.canvas_count});
          }catch{}
        }
        frames.push(record);
      }catch{}
    }
    if(srcdocs.length)observation.web_discovery.srcdoc_frames=srcdocs;
    await page.screenshot({path:path.join(dir,'source.png'),timeout:within(15000)}).catch(()=>{});
    observation.metadata=await page.locator('meta[name="description"],meta[property="og:description"]').evaluateAll(nodes=>nodes.map(n=>n.content));
    const inline=await page.locator('script:not([src])').allTextContents();
    observation.web_discovery.loader_hints=declaredEntries(inline,page.url());
    fs.writeFileSync(path.join(dir,'inline.js'),inline.join('\n').slice(0,500000));
    // 静态 src 属性可能为空：srcdoc、JS 动态注入、或跨域壳层（astrocade 就是这样）。
    // 这时 frame 其实已经载入了真实地址，必须用运行时的 frame.url() 回填，
    // 否则线索直接丢失、后续无从探测，看起来就像"站点没有入口"。
    const rawHints=[];
    for(const handle of (await page.locator('iframe').elementHandles()).slice(0,10)){
      if(left()<2500)break;
      const info=await handle.evaluate(n=>({url:(()=>{const raw=n.getAttribute('src')||n.getAttribute('data-url')||n.getAttribute('data-src');try{return raw?new URL(raw,document.baseURI).href:''}catch{return ''}})(),evidence:n.src?'iframe-src':n.hasAttribute('data-url')?'iframe-data-url':n.hasAttribute('data-src')?'iframe-data-src':'iframe',width:n.getBoundingClientRect().width,height:n.getBoundingClientRect().height})).catch(()=>null);
      if(!info)continue;
      if(!info.url){
        const frame=await handle.contentFrame().catch(()=>null);
        const runtime=frame&&typeof frame.url==='function'?(frame.url()||''):'';
        if(runtime&&runtime!=='about:blank'&&runtime!=='about:srcdoc'){info.url=runtime;info.evidence='iframe-runtime-url'}
      }
      rawHints.push(info);
    }
    const filtered=rawHints.filter(n=>n.url||n.width>200&&n.height>150);
    // 按"像不像游戏容器"排序，而不是 DOM 顺序：4k99 详情页头两个 iframe 是百度广告。
    observation.web_discovery.iframe_hints=filtered.map(n=>({...n,ad:AD_HOST.test(hostOf(n.url)),
      score:scoreFrame(n.url,n.width,n.height,viewport)}))
      .sort((a,b)=>b.score-a.score)
      .map(n=>({url:n.url,evidence:n.evidence,width:n.width,height:n.height,ad:n.ad,score:n.score}));
    const iframe_probes=[];
    // 早先只探测 data-url/data-src 型，而 4k99 的真实入口 c.17yoo.cn/playbox/<id>/
    // 恰恰是 iframe-src 型，从不进入探测。改为按打分取非广告候选，两种类型都探。
    for(const lead of observation.web_discovery.iframe_hints.filter(item=>!item.ad&&/^https?:\/\//i.test(item.url)).slice(0,3)){
      if(left()<6000)break;
      const probe=await context.newPage();let status=null;
      probe.on('response',response=>{if(response.request().resourceType()==='document'&&response.url()===lead.url)status=response.status()});
      try{
        await probe.goto(lead.url,{waitUntil:'domcontentloaded',timeout:within(12000)}).catch(()=>{});
        await probe.waitForFunction(()=>document.querySelector('canvas'),null,{timeout:within(8000)}).catch(()=>{});
        iframe_probes.push({declared_url:lead.url,final_url:probe.url(),http_status:status,evidence:lead.evidence,score:lead.score,title:await probe.title().catch(()=>''),canvas_count:await probe.locator('canvas').count().catch(()=>0)});
      }catch(error){iframe_probes.push({declared_url:lead.url,evidence:lead.evidence,error:String(error.message||error).slice(0,200),canvas_count:0})}
      finally{await probe.close().catch(()=>{})}
    }
    observation.web_discovery.iframe_probes=iframe_probes;
    observation.web_discovery.launch_links=await page.locator('a[href]').evaluateAll(nodes=>nodes.map(n=>({url:n.href,label:(n.innerText||n.getAttribute('aria-label')||n.title||'').trim().replace(/\s+/g,' ').slice(0,160),visible:!!(n.getClientRects().length&&getComputedStyle(n).visibility!=='hidden')})).filter(n=>n.visible&&/^https?:/.test(n.url)).slice(0,80));
    observation.final_url=page.url();
    observation.title=await page.title();
    observation.frames=frames;
    observation.scripts=scripts;
    observation.page_errors=errors;
    observation.web_discovery.entries=[...frames.filter(f=>f.canvas_count>0&&/^https?:/.test(f.url)).map(f=>({url:f.url,referer:f.referer,evidence:'rendered-canvas',canvas_count:f.canvas_count})),...frames.filter(f=>f.canvas_count>0&&f.srcdoc_file).map(f=>({url:f.referer||url,referer:f.referer,evidence:'srcdoc-rendered-canvas',canvas_count:f.canvas_count,srcdoc_file:f.srcdoc_file})),...popups.filter(p=>p.canvas_count>0&&/^https?:/.test(p.url)).map(p=>({url:p.url,referer:url,evidence:'popup-rendered-canvas',canvas_count:p.canvas_count})),...iframe_probes.filter(p=>p.canvas_count>0&&/^https?:/.test(p.final_url)).map(p=>({url:p.final_url,referer:url,evidence:'declared-iframe-rendered-canvas',canvas_count:p.canvas_count}))];
    observation.web_discovery.popups=popups;
    observation.web_discovery.documents=documents;
    observation.web_discovery.failed_requests=failed;
    observation.web_discovery.ad_skip=ad_skip;
    observation.web_discovery.blocked_ad_hosts=[...blockedAds].slice(0,20);
    observation.appids=(()=>{const match=html.match(/game_code["']?\s*:\s*["'](wx[0-9a-f]{16})/);return match?[match[1]]:[...new Set(html.match(/wx[0-9a-f]{16}/g)||[])].slice(0,1)})();
  }finally{
    // 无论成功还是中途卡住，都把已收集到的证据落盘。
    try{fs.writeFileSync(path.join(dir,'observation.json'),JSON.stringify(observation,null,2))}catch{}
    await browser.close().catch(()=>{});
  }
}
main().catch(e=>{console.error(e.message);process.exitCode=1});
