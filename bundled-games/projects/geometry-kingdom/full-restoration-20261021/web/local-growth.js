/* Original protocol and cost tables; explicitly reconstructed offline growth and draw rules.
 * No network, engine or DOM dependency. Clock, persistence and hero factory are injected. */
(function(root){
  'use strict';
  function createGrowth({config,hero,save,clock}) {
    const ok=data=>({errcode:0,data:JSON.parse(JSON.stringify(data))});
    const fail=message=>({errcode:409,errmsg:message});
    const pool=[101,401,202,303];
    function grant(p,rewards){
      for(const [key,n] of Object.entries(rewards))p.resource[key]=(p.resource[key]||0)+n;
      while(p.roleLevel<config.roleLevels.length && p.resource.prestige>=config.roleLevels[p.roleLevel].prestige){
        p.resource.prestige-=config.roleLevels[p.roleLevel].prestige;p.roleLevel++;
      }
    }
    function gearStats(level,pos){
      // Observed sword 6:48/50 and 7:54/56; other levels/slots are local interpolation.
      return {level,...(pos===1?{damage:12+6*level,defense:14+6*level}:pos===2?{defense:14+6*level,life:120+60*level}:pos===3?{damage:12+6*level,life:120+60*level}:{defense:14+6*level,life:120+60*level})};
    }
    function recalculate(h){
      const fresh=hero(h.uuid),star=config.heroStars.find(r=>r.level===h.s)||config.heroStars[0];
      const a=fresh.attrs,scale=1+.03*(h.l-1);
      for(const k of ['life','physicsDamage','magicDamage','defense'])a[k]=Math.round(a[k]*scale*(star[k==='life'?'life':k==='defense'?'defense':'damage']));
      for(const [pos,e] of Object.entries(h.e)){
        if(h.l < config.equipUnlocks.find(r=>r.equipType===Number(pos)).equipUnlockCondition)continue;
        const stats=gearStats(e.l,Number(pos));
        a.life+=stats.life||0;a.defense+=stats.defense||0;
        a[fresh.attrs.magicDamage?'magicDamage':'physicsDamage']+=stats.damage||0;
      }
      h.attrs=a;h.power=Math.round(a.life/10+a.physicsDamage+a.magicDamage+a.defense);
    }
    function summon(p){
      const day=Math.floor((clock()+8*3600000)/86400000);
      if(!p.localSummon)p.localSummon={day,used:0,draws:0,score:0};
      if(day>p.localSummon.day){p.localSummon.day=day;p.localSummon.used=0;}
      const s=p.localSummon;
      return {remainCount:Math.max(0,5-s.used),cooldownTime:0,freeDot:s.used<5?1:0,summonScore:s.score,
        initFloor:0,regularFloor:0,wishListRate:0,wishListUnlockRemain:9999,wishListHero:{},seniorTip:false,ancestorFree:0,ancestorExchangeScore:0};
    }
    function dispatch(route,args,p,authenticated){
      if(!route.startsWith('/summon/')&&!route.startsWith('/hero/equip-')&&route!=='/hero/star')return null;
      if(!authenticated)return {errcode:401,errmsg:'本地会话无效'};
      if(p.localBattle?.started&&!p.localBattle.settled)return fail('请先完成当前战斗');
      if(route.startsWith('/summon/')){
        const info=summon(p);
        if(route==='/summon/show'){save(p);return ok({summonInfo:info});}
        if(route==='/summon/record')return ok({summonRecord:p.localSummon.records||[]});
        if(!['/summon/ordinary','/summon/senior'].includes(route))return {errcode:501,errmsg:'此招募功能尚未开放'};
        const normal=route.endsWith('ordinary'),count=normal?1:args.get('buy10')==='true'?10:1;
        if(normal){if(args.get('buyType')!=='0'||!info.remainCount)return fail('今日免费招募次数已用完');}
        else {
          const type=Number(args.get('buyType')),table=config.seniorSummons[0],index=table.buyType.indexOf(type);
          if(index<0)return fail('无效招募方式');
          const cost=(count===10?table.price10:table.price)[index],key=type===2?'diamond':'recruitRoll';
          if((p.resource[key]||0)<cost)return fail('招募资源不足');
          p.resource[key]-=cost;
        }
        const rewards={};
        // Repeatable local rotation, not the unavailable original random pool/probabilities.
        for(let i=0;i<count;i++){
          const uuid=pool[(p.localSummon.draws++ + 2)%pool.length],owned=p.heroInfo.heroes.some(h=>h.uuid===uuid);
          if(!owned)p.heroInfo.heroes.push(hero(uuid));
          else grant(p,{['fragment_'+uuid]:20});
          const key='hero_'+uuid+'+'+i;rewards[key]=owned?20:1;
        }
        if(normal)p.localSummon.used++;
        p.localSummon.score+=normal?0:count;
        p.localSummon.records=[{type:normal?'ordinary':'senior',at:Math.floor(clock()/1000),rewards},...(p.localSummon.records||[])].slice(0,100);
        save(p);return ok({heroInfo:p.heroInfo,resource:p.resource,summonInfo:summon(p),rewards,rewardsOrder:Object.keys(rewards)});
      }
      const h=p.heroInfo.heroes.find(h=>h.uuid===Number(args.get('h')));
      if(!h)return fail('无效英雄');
      if(route==='/hero/star'){
        const next=config.heroStars.find(r=>r.level===h.s+1),key='fragment_'+h.uuid;
        if(!next)return fail('已达到最高星级');
        if((p.resource[key]||0)<next.costCard)return fail('英雄碎片不足');
        p.resource[key]-=next.costCard;h.s++;recalculate(h);save(p);
        return ok({heroInfo:p.heroInfo,resource:p.resource});
      }
      const pos=Number(args.get('p')),unlock=config.equipUnlocks.find(r=>r.equipType===pos);
      if(!Number.isInteger(pos)||pos<1||pos>4||!unlock)return fail('无效装备部位');
      const threshold=unlock.equipUnlockCondition;
      if(h.l<threshold)return fail('英雄等级尚未解锁该装备');
      const equip=h.e[pos];
      const preview=()=>({now:gearStats(equip.l,pos),next:config.equipUpgradeCosts.some(r=>r.equipLevel===equip.l+1)?gearStats(equip.l+1,pos):null,attrs:[]});
      if(route==='/hero/equip-level-preview')return ok(preview());
      if(route!=='/hero/equip-level')return {errcode:501,errmsg:'此装备功能尚未开放'};
      const row=config.equipUpgradeCosts.find(r=>r.equipLevel===equip.l+1);
      if(!row||equip.l>=Math.max(10,p.roleLevel))return fail('装备已达当前等级上限');
      if(row.type.some((key,i)=>(p.resource[key]||0)<row.num[i]))return fail('装备升级资源不足');
      row.type.forEach((key,i)=>p.resource[key]-=row.num[i]);equip.l++;recalculate(h);save(p);
      return ok({heroInfo:p.heroInfo,resource:p.resource,...preview()});
    }
    return {dispatch,recalculate,grant};
  }
  root.createLocalGrowth=createGrowth;
  if(typeof module!=='undefined')module.exports={createGrowth};
})(typeof window==='undefined'?globalThis:window);
