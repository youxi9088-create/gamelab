const assert=require('node:assert/strict');
const {returnLink}=require('../executors/requested-entry.cjs');
assert.equal(returnLink('https://example.org/g/a','https://example.org/?next=%2Fg%2Fa'),'https://example.org/g/a');
assert.equal(returnLink('https://example.org/g/a','https://example.org/?next=%2Fg%2Fb'),null);
assert.equal(returnLink('https://example.org/g/a','https://other.org/?next=%2Fg%2Fa'),null);
assert.equal(returnLink('https://example.org/g/a','https://example.org/g/a'),null);
console.log('requested entry checks passed');
