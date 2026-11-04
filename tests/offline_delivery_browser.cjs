// Isolated fixture only: real browser, requests, interaction and saved score.
const fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const {chromium}=require('../executors/node_modules/playwright');
(async()=>{
 const [root,shot]=process.argv.slice(2),external=[];
 const server=http.createServer((req,res)=>{const name=req.url==='/'?'index.html':req.url.slice(1);const p=path.join(root,name);if(!fs.existsSync(p)){res.writeHead(404);return res.end();}res.setHeader('Content-Type',name.endsWith('.js')?'text/javascript':'text/html');res.end(fs.readFileSync(p));});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 let browser;
 try{
  browser=await chromium.launch({headless:true,executablePath:process.env.OFFLINE_TEST_CHROME});
  const page=await browser.newPage({viewport:{width:800,height:500}});
  const origin=`http://127.0.0.1:${server.address().port}`;
  await page.route('**/*',route=>{if(!route.request().url().startsWith(origin+'/')){external.push(route.request().url());return route.abort();}return route.continue();});
  await page.goto(origin);await page.getByRole('button',{name:'Play',exact:true}).click();
  await page.getByRole('button',{name:'Play',exact:true}).click();
  if(await page.locator('#score').innerText()!=='2')throw Error('Actual scoring failed');
  if(await page.getByRole('button',{name:'Watch ad',exact:true}).count())throw Error('Advertising entry remains');
  await page.reload();if(await page.locator('#score').innerText()!=='2')throw Error('Save restore failed');
  await page.screenshot({path:shot});
  if(external.length)throw Error('External request remains');
  console.log(JSON.stringify({passed:true,environment:'deployment',actions:[{type:'click'},{type:'click'},{type:'reload'}],external,score:2,save_restored:true,screenshot:shot}));
 }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e.message);process.exitCode=1;});
