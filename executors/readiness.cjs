// Probe only trusted installed tools, never a game or user browser profile.
const fs = require('node:fs');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
(async () => {
  const checks = {};
  const rea = path.join(__dirname,'node_modules/rea-agents/scripts/rea.mjs');
  checks.rea = fs.existsSync(rea);
  checks['rea-analysis'] = false;
  if (checks.rea) {
    try {
      const fixture = path.join(__dirname,'fixtures/orbit-catch');
      const result = spawnSync(process.execPath,[rea,'analyze-javascript-application',fixture,'--format','json','--full-output'],{
        encoding:'utf8',timeout:30000,windowsHide:true,maxBuffer:4*1024*1024,
      });
      const lines = (result.stdout || '').trim().split(/\r?\n/);
      let envelope = null;
      for (let start=lines.length-1; start>=0; start--) {
        if (!lines[start].trimStart().startsWith('{')) continue;
        try {
          const value = JSON.parse(lines.slice(start).join('\n'));
          if (value && typeof value==='object' && typeof value.ok==='boolean') {
            envelope = value;
            break;
          }
        } catch {}
      }
      checks['rea-analysis'] = result.status===0 && envelope?.ok===true && Boolean(envelope.data?.evidence_id);
    } catch { checks['rea-analysis'] = false; }
  }
  let browser;
  try {
    const {chromium} = require('playwright');
    checks.playwright = true;
    browser = await chromium.launch({...require('./browser-options.cjs')(), timeout:10000});
    checks.browser = true;
  } catch { checks.browser = false; }
  finally { if(browser) await browser.close(); }
  console.log(JSON.stringify({ok:checks.rea && checks['rea-analysis'] && checks.playwright && checks.browser,checks}));
})().catch(()=>process.exit(1));
