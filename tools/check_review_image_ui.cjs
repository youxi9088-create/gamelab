const {chromium}=require('../executors/node_modules/playwright');
const fs=require('node:fs');
(async()=>{
  const browser=await chromium.launch({channel:'msedge',headless:true});
  try {
    const page=await browser.newPage();
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    let dimensions=[390,844];
    await page.route('**/fixture-shot.svg',async route=>{
      const [w,h]=dimensions;
      const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="100%" height="100%" fill="#244660"/><rect width="100%" height="60" fill="#eebd44"/><rect y="${h-60}" width="100%" height="60" fill="#46d998"/><text x="20" y="40" font-size="28">TOP / ${w} x ${h}</text><text x="20" y="${h-20}" font-size="28">BOTTOM</text><circle cx="${w/2}" cy="${h/2}" r="100" fill="#95bdd9"/></svg>`;
      await route.fulfill({contentType:'image/svg+xml',body:svg});
    });
    await page.route('**/api/state',async route=>{
      const response=await route.fetch(), state=await response.json();
      for(const v of state.versions){v.cover='/fixture-shot.svg';v.screenshots=[v.cover];v.preview={zoom:3.6};}
      await route.fulfill({response,json:state});
    });
    fs.mkdirSync('qa-output/review-image',{recursive:true});
    for(const viewport of [{width:1280,height:800},{width:390,height:844}]){
      await page.setViewportSize(viewport);
      for(dimensions of [[390,844],[1200,675]]){
        await page.goto(process.argv[2]+'/#reviews');
        await page.reload();
        await page.locator('.review-cards button[data-review]').first().click();
        const img=page.locator('.review-shot-full img');
        await img.evaluate(el=>el.decode());
        const bounds=await img.evaluate(el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);return {width:r.width,height:r.height,fit:s.objectFit,transform:s.transform,nw:el.naturalWidth,nh:el.naturalHeight};});
        if(bounds.nw!==dimensions[0]||bounds.nh!==dimensions[1])throw Error('Wrong fixture image');
        if(bounds.fit!=='contain'||bounds.transform!=='matrix(1, 0, 0, 1, 0, 0)'||bounds.height>Math.min(viewport.height*.6,640)+1||bounds.width>viewport.width)throw Error(JSON.stringify(bounds));
        await page.screenshot({path:`qa-output/review-image/${viewport.width}-${dimensions[0]}.png`});
        await page.getByRole('button',{name:'关闭',exact:true}).click();
      }
    }
    if(errors.length)throw Error(errors.join('\n'));
    console.log('Portrait/landscape review images fit desktop/mobile; thumbnail zoom does not crop evidence.');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
