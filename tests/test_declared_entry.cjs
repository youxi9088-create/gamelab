const test=require('node:test'),assert=require('node:assert/strict');
const {declaredEntries}=require('../executors/declared-entry.cjs');
test('literal loader URL remains an unverified lead and preserves query parameters',()=>{
 const source='var options = {"loader":"html5","loaderOptions":{"url":"https://cdn.example/game/index.html?v=31&lang=en"},"title":"a } brace"};';
 assert.deepEqual(declaredEntries([source,source],'https://example.org/wrapper'),[{url:'https://cdn.example/game/index.html?v=31&lang=en',evidence:'literal-html5-loader-url'}]);
 assert.equal(declaredEntries(['const cfg={"loader":"html5","loaderOptions":{"url":"../game/"}};'],'https://example.org/wrapper/index.html')[0].url,'https://example.org/game/');
});
test('loader extraction does not execute expressions or accept private endpoints',()=>{
 for(const value of [
  'var a={"loader":"html5","loaderOptions":{"url":evil()}};',
  'var a={"loader":"html5","loaderOptions":{"url":"http://127.0.0.1/admin"}};',
  'var a={"loader":"html5","loaderOptions":{"url":"https://user:pass@example.org/"}};',
  'var a={"loader":"unknown","loaderOptions":{"url":"https://cdn.example/game"}};'
 ])assert.deepEqual(declaredEntries([value],'https://example.org'),[]);
});
