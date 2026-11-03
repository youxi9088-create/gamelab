'use strict';

// A route handler can be waiting for the browser request it services. Waiting
// for every handler before closing that browser creates a shutdown cycle.
async function cleanupVerification(context, browser, server) {
  const errors=[];
  try { if(context) await context.unrouteAll({behavior:'ignoreErrors'}); }
  catch(error) { errors.push(error); }
  try { if(browser) await browser.close(); }
  catch(error) { errors.push(error); }
  try {
    if(server) await new Promise((resolve,reject)=>{
      server.close(error=>error ? reject(error) : resolve());
      // Only this verifier's private HTTP server is owned here. Idle HTTP
      // connections must not keep its close callback waiting indefinitely.
      server.closeAllConnections?.();
    });
  } catch(error) { errors.push(error); }
  if(errors.length) throw new AggregateError(errors,'Verification infrastructure cleanup failed');
}

module.exports={cleanupVerification};
