const assert = require('node:assert/strict');
const {fitViewport} = require('../executors/adapters/runtime-viewport.js');
for (const [width, height] of [[750,1000],[750,1334],[390,844],[1920,1080],[844,390]]) {
  const fit = fitViewport(width,height,750,1334);
  assert.ok(fit.width <= width && fit.height <= height);
  assert.ok(fit.width / fit.height <= 750 / 1334, 'Never activate the original wide-screen branch');
  assert.ok(Math.abs(fit.width / fit.height - 750 / 1334) < .003);
}
assert.deepEqual(fitViewport(750,1334,750,1334),{width:750,height:1334});
assert.throws(()=>fitViewport(0,1000,750,1334));
assert.throws(()=>fitViewport(750,1000,Infinity,1334));
console.log('Runtime viewport geometry passed');
