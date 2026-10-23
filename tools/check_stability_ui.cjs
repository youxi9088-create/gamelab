const {chromium}=require('../executors/node_modules/playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const origin=process.argv[2];
if(!/^http:\/\/127\.0\.0\.1:\d+$/.test(origin))throw Error('Only isolated loopback fixture servers are allowed');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 page.setDefaultTimeout(10000);
 const errors=[],audit=[],requests=[];let polls=0,opsPolls=0,failState=false;
 page.on('pageerror',e=>errors.push(e.message));
 page.on('requestfailed',r=>{if(!r.failure()?.errorText.includes('ERR_ABORTED'))requests.push(r.url());});
 async function login(username,password){
  await page.locator('#portal-username').fill(username);await page.locator('#portal-password').fill(password);
  await page.locator('#portal-login button').click();await page.locator('.site-nav').waitFor();
 }
 async function navigate(route){await page.locator(`.site-nav [data-nav="${route}"]`).click();await page.waitForFunction(r=>document.querySelector('.main')?.dataset.page===r,route);await page.evaluate(()=>scrollTo(0,0));}
 async function tick(){const n=polls;await page.evaluate(()=>window.dispatchEvent(new Event('focus')));await page.waitForFunction(n=>window.__uiPoll>n,n);await page.waitForTimeout(100);}
 try{
  await page.route('**/api/state',async route=>{
   if(failState)return route.fulfill({status:503,json:{error:'isolated connection interruption'}});
   const response=await route.fetch(),state=await response.json();state.ui_fixture_heartbeat=++polls;
   for(const v of state.versions||[]){v.preview_url=origin+'/ui-fixture.html';v.preview_mode='iframe';}
   await route.fulfill({response,json:state});
  });
  await page.route('**/api/operations',async route=>{
   const response=await route.fetch(),ops=await response.json();ops.note='隔离运维更新 '+(++opsPolls);
   await new Promise(r=>setTimeout(r,180));await route.fulfill({response,json:ops});
  });
  await page.route('**/ui-fixture.html',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><html><body style="background:#142c42;color:white"><h1>隔离试玩夹具</h1><button onclick="this.textContent=++window.count">0</button><script>window.count=0;window.started=performance.timeOrigin;</script></body></html>'}));
  await page.addInitScript(()=>{window.__uiPoll=0;const f=window.fetch;window.fetch=async(...args)=>{const r=await f(...args);if(String(args[0]).endsWith('/api/state')&&r.ok)window.__uiPoll=(await r.clone().json()).ui_fixture_heartbeat;return r;};});
  await page.goto(origin+'/#administration');await login('ui-admin','isolated-ui-password');
  await page.locator('#toggle-drain').waitFor();
  const patchChecks=await page.evaluate(async()=>{
   const {patchHTML}=await import('/dom-sync.js'),root=document.createElement('div');document.body.append(root);
   patchHTML(root,'<button id="a">A</button><button id="b">B</button><input id="draft"><details><summary>证据</summary>一</details>');
   const a=root.querySelector('#a'),b=root.querySelector('#b'),input=root.querySelector('input');input.value='草稿';root.querySelector('details').open=true;
   patchHTML(root,'<button id="b">B2</button><button id="a">A</button><input id="draft"><details><summary>证据</summary>二</details>');
   const ok=root.firstChild===b&&root.children[1]===a&&input.value==='草稿'&&root.querySelector('details').open;
   patchHTML(root,'<button id="a">A3</button>');const removed=root.children.length===1&&root.firstChild===a&&a.textContent==='A3';root.remove();return ok&&removed;
  });assert(patchChecks);audit.push({check:'keyed reorder, removal, input and disclosure preservation',passed:true});
  // Real timer cycles and requestAnimationFrame observation: animations are deliberately enabled.
  await page.locator('#account-form [name="username"]').fill('draft-stays');
  await page.locator('#account-form [name="password"]').fill('draft-password-123');
  await page.locator('#account-form [name="role"]').selectOption('operator');
  await page.evaluate(()=>{
   window.__stable={form:document.querySelector('#account-form'),button:document.querySelector('#toggle-drain'),removed:0,invisible:0,frames:0};
   const s=window.__stable;
   s.observer=new MutationObserver(records=>{for(const r of records)for(const n of r.removedNodes)if(n===s.button||n.contains?.(s.button)||n===s.form||n.contains?.(s.form))s.removed++;});
   s.observer.observe(document.querySelector('#app'),{childList:true,subtree:true});
   s.active=true;const sample=()=>{if(!s.active)return;s.frames++;if(!s.button.isConnected||getComputedStyle(s.button).display==='none'||getComputedStyle(s.button).opacity==='0')s.invisible++;requestAnimationFrame(sample);};sample();
   document.querySelector('#account-form [name="username"]').focus();window.scrollTo(0,300);s.scroll=scrollY;
  });
  const start=polls;await page.waitForFunction(n=>window.__uiPoll>=n+5,start,{timeout:22000});
  assert(opsPolls>=2,'operations actually refreshed');
  assert.equal(await page.locator('#account-form [name="username"]').inputValue(),'draft-stays');
  assert.equal(await page.locator('#account-form [name="password"]').inputValue(),'draft-password-123');
  assert.equal(await page.locator('#account-form [name="role"]').inputValue(),'operator');
  const stable=await page.evaluate(()=>{const s=window.__stable;s.active=false;s.observer.disconnect();return {same:s.button===document.querySelector('#toggle-drain')&&s.form===document.querySelector('#account-form'),removed:s.removed,invisible:s.invisible,frames:s.frames,focus:document.activeElement.name,scroll:Math.abs(scrollY-s.scroll)};});
  assert(stable.same);assert.equal(stable.removed,0);assert.equal(stable.invisible,0);assert.equal(stable.focus,'username');assert(stable.scroll<=1);audit.push({check:'five real polling cycles',...stable});
  await page.screenshot({path:'qa-output/stability-admin-desktop.png',fullPage:true});
  // Isolated account creation, cancellation, and role restrictions.
  await page.locator('#account-clear').click();await page.waitForFunction(()=>document.querySelector('#account-form [name="username"]').value==='');
  await page.locator('#account-form [name="username"]').fill('ui-viewer');
  await page.locator('#account-form [name="password"]').fill('isolated-viewer-password');
  await page.locator('#account-form .primary').click();await page.locator('#admin-account-list').getByText(/ui-viewer/).waitFor();
  await page.locator('#admin-account-list .kv').filter({hasText:'ui-viewer'}).getByRole('button').click();
  await tick();assert(await page.locator('#account-form [name="username"]').evaluate(e=>e.readOnly));
  assert.equal(await page.locator('#account-form [name="username"]').inputValue(),'ui-viewer');
  // Toggle only the isolated queue; click handler must fire once.
  let posts=0;page.on('request',r=>{if(r.method()==='POST'&&r.url().endsWith('/api/operations/drain'))posts++;});
  await page.locator('#toggle-drain').click();await page.waitForFunction(()=>document.querySelector('#toggle-drain').textContent==='恢复领取任务');
  await page.locator('#toggle-drain').click();await page.waitForFunction(()=>document.querySelector('#toggle-drain').textContent==='暂停领取新任务');assert.equal(posts,2);
  for(const width of [1440,390]){
   await page.setViewportSize({width,height:width===390?844:1000});
   for(const route of ['overview','candidates','library','jobs','reviews','discovery','tools','settings','administration']){
    await navigate(route);if(route==='administration')await page.locator('#toggle-drain').waitFor();
    const nodes=await page.locator('#page button:visible').elementHandles();
    await tick();
    for(const node of nodes){assert(await node.evaluate(e=>e.isConnected),'button replaced during '+route+' sync');await node.dispose();}
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${route} overflow ${width}`);
    const buttons=await page.locator('#page button:visible').count();audit.push({route,width,buttons});
    await page.screenshot({path:`qa-output/site-${route}-${width}.png`,fullPage:true});
   }
  }
  // Open and cancel configuration dialogs without invoking external services.
  for(const [route,selectors] of [
   ['tools',['[data-service-config="ai"]','[data-service-config="wechat"]','[data-supply-config]','[data-supply-report]']],
   ['settings',['[data-action="new-source"]']],
   ['discovery',['[data-discovery-settings]']],
   ['overview',['[data-action="ai-pricing"]','[data-action="new-candidate"]']]
  ]){
   await navigate(route);
   for(const selector of selectors){assert.equal(await page.locator(selector).count(),1);await page.locator(selector).click();await page.locator('.modal').waitFor();await tick();await page.locator('.modal .close').click();assert.equal(await page.locator('.modal').count(),0);audit.push({check:'open and cancel '+selector,passed:true});}
  }
  await page.setViewportSize({width:1440,height:1000});await navigate('jobs');
  await page.locator('[data-job]').first().click();await page.locator('[data-task-section="conversation"]').click();
  await page.locator('#task-message').fill('未发送的测试草稿');
  const message=await page.locator('#task-message').elementHandle();
  for(let i=0;i<5;i++){await tick();assert(await message.evaluate(e=>e.isConnected));assert.equal(await page.locator('#task-message').inputValue(),'未发送的测试草稿');}
  await page.locator('[data-task-section="versions"]').click();await page.locator('[data-task-play]').first().click();
  await page.frameLocator('iframe').getByRole('button').click();
  const frame=page.frames().find(f=>f.url().endsWith('/ui-fixture.html'));const started=await frame.evaluate(()=>window.started);
  for(let i=0;i<5;i++){await tick();assert.equal(await frame.evaluate(()=>window.started),started);assert.equal(await frame.getByRole('button').innerText(),'1');}
  await page.locator('.modal .close').click();await navigate('reviews');await page.locator('[data-review]').first().click();
  await page.locator('#review-form [name="reason"]').fill('验收草稿，禁止提交');
  await page.locator('#review-form [name="gameplay"]').check();
  const reviewSubmit=await page.locator('#review-form [type="submit"]').elementHandle();
  for(let i=0;i<5;i++){await tick();assert(await reviewSubmit.evaluate(e=>e.isConnected));}
  assert.equal(await page.locator('#review-form [name="reason"]').inputValue(),'验收草稿，禁止提交');
  assert(await page.locator('#review-form [name="gameplay"]').isChecked());
  audit.push({check:'task draft and iframe across five changing state responses',passed:true});
  await page.locator('#review-form [name="reason"]').focus();await page.keyboard.press('Escape');assert.equal(await page.locator('.modal').count(),0);
  await navigate('jobs');
  // Interrupted polling must preserve the page and recover on the next request.
  failState=true;await page.evaluate(()=>window.dispatchEvent(new Event('focus')));await page.getByText('连接中断，正在重试',{exact:true}).waitFor();
  assert(await page.locator('[data-job]').first().isVisible());failState=false;await tick();await page.getByText('自动同步中',{exact:true}).waitFor();
  await page.locator('[data-action="logout"]').click();await login('ui-viewer','isolated-viewer-password');
  assert.equal(await page.locator('[data-nav="administration"]').count(),0);
  const denied=await page.evaluate(async()=>{const r=await fetch('/api/operations');return r.status;});assert.equal(denied,403);
  assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);
  fs.writeFileSync('qa-output/site-stability-audit.json',JSON.stringify({audit,errors,requests,polls,opsPolls},null,2));
  console.log(JSON.stringify({passed:true,polls,opsPolls,checks:audit.length}));
 }catch(e){await page.screenshot({path:'qa-output/stability-failure.png',fullPage:true});throw e;}
 finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
