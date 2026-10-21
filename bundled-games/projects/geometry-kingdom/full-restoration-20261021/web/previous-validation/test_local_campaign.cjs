const assert = require('node:assert/strict');
const {createCampaign} = require('../local-campaign.js');
const config = {hero: [101,401].map(uuid => ({uuid, quality:1, life:1000, physicsDamage:100, magicDamage:0}))};
config.heroLevelCosts = Array.from({length:5},(_,i)=>({level:i+1,upgradeConsumeType:['gold'],upgradeConsumeNum:[i?50+50*i:0]}));
const memory = new Map();
const storage = {getItem:k=>memory.get(k),setItem:(k,v)=>memory.set(k,v)};
let next = 0;
const options = {config, template:{}, storage, id:()=>String(++next), clock:()=>100000};
let service = createCampaign(options);
let token = service.dispatch('/basic/login').data.token;
const call = (route, data={}) => service.dispatch(route,new URLSearchParams({local_session:token,...data}).toString());
assert.equal(service.dispatch('/barrier/fight-show').errcode,401);
assert.equal(call('/barrier/next-chapter').errcode,409);
assert.equal(call('/pay/create').errcode,501);
assert.equal(call('/player/set-client-data',{key:'guide-step',val:'3'}).errcode,0);
for (let stage=1;stage<=5;stage++) {
  const battleId = call('/barrier/fight-show',{small:'1'}).data.enemyHeroes.battleId;
  assert.equal(call('/barrier/fight-end',{id:stage,win:'true',battleId}).errcode,409);
  for (const invalid of [[101,101,0,0,0],[123,0,0,0,0],[0,0,0,0,0],[true,0,0,0,0]]) {
    assert.equal(call('/barrier/update-troop',{troop:JSON.stringify({1:invalid})}).errcode,400);
  }
  assert.equal(call('/barrier/update-troop',{troop:JSON.stringify({1:[101,401,0,0,0]})}).errcode,0);
  assert.equal(call('/barrier/fight-end',{id:stage,win:'true',battleId:'bad'}).errcode,409);
  const result = call('/barrier/fight-end',{id:stage,win:'true',battleId});
  assert.equal(result.data.resource.gold,stage*100);
  assert.deepEqual(call('/barrier/fight-end',{id:stage,win:'true',battleId}),result);
  // Reconstruct service using persisted state; results and next-stage gate survive.
  service=createCampaign(options);
  assert.equal(service.dispatch('/basic/login').data.clientData['guide-step'],3);
  assert.equal(call('/barrier/fight-show').errcode,409);
  assert.equal(call('/barrier/next-chapter').errcode,0);
}
assert.equal(service.dispatch('/basic/login').data.barrierInfo.full,true);
assert.equal(call('/barrier/fight-show').errcode,409);
assert.equal(service.dispatch('/basic/login').data.resource.gold,500);
assert.equal(service.dispatch('/hero/level','h=101').errcode,401);
assert.equal(call('/hero/level',{h:999}).errcode,400);
const upgraded=call('/hero/level',{h:101}).data;
assert.equal(upgraded.resource.gold,400);
assert.equal(upgraded.heroInfo.heroes.find(h=>h.uuid===101).attrs.life,1200);
assert.equal(upgraded.heroInfo.heroes.find(h=>h.uuid===101).l,2);
service=createCampaign(options);
assert.equal(service.dispatch('/basic/login').data.heroInfo.heroes.find(h=>h.uuid===101).l,2);
assert.equal(call('/hero/level',{h:101}).data.resource.gold,250);
assert.equal(call('/hero/level',{h:101}).data.resource.gold,50);
assert.equal(call('/hero/level',{h:101}).errcode,409);
assert.equal(service.dispatch('/basic/login').data.resource.gold,50);
// A separate profile verifies loss/retry without affecting the winning campaign.
const isolated = new Map();
service=createCampaign({...options,storage:{getItem:k=>isolated.get(k),setItem:(k,v)=>isolated.set(k,v)}});
token=service.dispatch('/basic/login').data.token;
const battleId=call('/barrier/fight-show').data.enemyHeroes.battleId;
call('/barrier/update-troop',{troop:JSON.stringify({1:[101,0,0,0,0]})});
assert.equal(call('/hero/level',{h:101}).errcode,409);
assert.equal(call('/barrier/fight-end',{id:1,win:'false',battleId}).data.resource.gold,0);
assert.equal(call('/barrier/next-chapter').errcode,409);
assert.equal(call('/barrier/fight-show').errcode,0);
console.log('PASS: five-stage progression, persisted reload, idempotent rewards, invalid requests, defeat/retry');
