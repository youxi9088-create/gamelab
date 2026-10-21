// Probe only trusted installed tools, never a game or user browser profile.
const fs = require('node:fs');
const path = require('node:path');
(async () => {
  const checks = {};
  checks.rea = fs.existsSync(path.join(__dirname,'node_modules/rea-agents/scripts/rea.mjs'));
  let browser;
  try {
    const {chromium} = require('playwright');
    checks.playwright = true;
    browser = await chromium.launch({...require('./browser-options.cjs')(), timeout:10000});
    checks.browser = true;
  } catch { checks.browser = false; }
  finally { if(browser) await browser.close(); }
  console.log(JSON.stringify({ok:checks.rea && checks.playwright && checks.browser,checks}));
})().catch(()=>process.exit(1));
