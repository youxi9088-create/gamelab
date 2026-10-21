/* Editable local campaign service. Original server algorithms were not recovered.
 * Uses original client combat and static hero attributes. No multiplayer anti-cheat.
 * Shared browser/Node implementation: transport, storage and clock are injected.
 */
(function (root) {
  'use strict';
  const createGrowth = typeof module !== 'undefined' ? require('./local-growth.js').createGrowth : root.createLocalGrowth;
  const clone = value => JSON.parse(JSON.stringify(value));
  function createCampaign({config, template, storage, clock = Date.now, id = () => crypto.randomUUID()}) {
    // Separate restoration saves from the previous gold-based prototype.
    const key = 'geometry-full-restoration-v1';
    const barriers = Object.fromEntries(Array.from({length: 21}, (_, n) => [n + 1, [{
      id: n + 1, chapter: Math.floor(n / 5) + 1, largeLevel: n % 5 + 1,
      difficulty: 1, map: '本地试炼', sceneIcon: 1, heroId: [101], bossBodyRatio: [1]
    }]]));
    function hero(uuid, scale = 1) {
      const cfg = config.hero.find(row => row.uuid === uuid);
      if (!cfg) throw Error('Missing original hero configuration: ' + uuid);
      const attrs = Object.fromEntries(Object.entries(cfg).filter(([, value]) => typeof value === 'number'));
      for (const name of ['life', 'physicsDamage', 'magicDamage', 'defense'])
        attrs[name] = Math.round((attrs[name] || 0) * scale);
      return {uuid, l: 1, s: 0, q: cfg.quality, attrs,
        power: Math.round(attrs.life / 10 + attrs.physicsDamage + attrs.magicDamage),
        atf: {u: 0, l: 0, s: 0}, g: [], wl: 0, energy: 0, cs: 0, hs: [],
        e: Object.fromEntries([1, 2, 3, 4].map(i => [i, {l: 0, cl: 0, gs: {}}]))};
    }
    const save = player => storage.setItem(key, JSON.stringify(player));
    function player() {
      const saved = storage.getItem(key);
      if (saved) return JSON.parse(saved);
      const result = Object.assign(clone(template), {
        localRuleset: 'full-restoration-local-v1', token: 'local-' + id(), uid: 'local-player',
        name: '本地玩家', headImg: 101, roleLevel: 1, zone: 1, mergeZone: 1,
        isMusic: 0, isSoundEffects: 0, newUser: true, clientData: {'12000': 1},
        channel: 'local', shareConfigs: [], shareCode: '', guildId: 0, noticeDot: 0,
        hasNewbieGift: 0, autoFight: 0, starUpTip: 0, first: true, createDay: 1,
        zoneDay: 1, statueLevel: 0, envConf: {privacyPopUp: 0, updateConfig: 0},
        resource: {gold: 0, exp: 0, prestige: 0, diamond: 0, recruitRoll: 0}, heroInitialQuality: Object.fromEntries(config.hero.filter(h => h.uuid < 500).map(h => [h.uuid,h.quality])),
        localHangupAt: clock(),
        hangupInfo: {currentIndex: 0, hangupTime: 0, hangupTimeLimit: 6, freeQuickRemainNum: 0},
        returnActInfo: {autoNew: false}, gameClubInfo: {taskInfo: {}},
        barrierConfigs: barriers,
        heroInfo: {heroes: [hero(101), hero(401)], elf: {}, dot: 0, illustrateGot: [], ancestorSkill: []},
        barrierInfo: {barrierId: 1, troop: {1: [401, 101, 0, 0, 0], 2: [0,0,0,0,0], 3: [0,0,0,0,0]},
          progress: {}, full: false, nextChapter: false, nextDifficult: false}
      });
      save(result);
      return result;
    }
    const growth = createGrowth({config, hero, save, clock});
    const ok = data => ({errcode: 0, data: clone(data)});
    const error = (errcode, errmsg) => ({errcode, errmsg});
    function hangup(p) {
      // Original UI displays 60*mExp/mGold/mPrestige per hour. Six-hour cap
      // and rounding policy are local reconstruction, not recovered server rules.
      const row = config.hangupRewards.find(r => r.id === 1);
      const seconds = Math.min(21600, Math.max(0, Math.floor((clock() - p.localHangupAt) / 1000)));
      const rewards = Object.fromEntries([['gold','mGold'],['exp','mExp'],['prestige','mPrestige']]
        .map(([name,field]) => [name, Math.floor(seconds * row[field] / 60)]));
      return {hangupInfo: {...p.hangupInfo, hangupTime: seconds}, rewards};
    }
    function dispatch(route, query = '', origin = '') {
      const args = new URLSearchParams(query), p = player(), info = p.barrierInfo;
      const local = () => args.get('local_session') === p.token;
      if (route === '/basic/hook') return ok({url: origin + '/api'});
      if (route === '/basic/login') return ok({...p, hangupInfo: hangup(p).hangupInfo, openId: p.uid, unix: Math.floor(clock()/1000),
        configUrl: origin + '/local-config.json'});
      if (route === '/basic/unix') return ok({unix: Math.floor(clock()/1000)});
      if (['/basic/log','/player/log','/player/tga-log'].includes(route)) return ok({recorded: false, mode: 'local'});
      if (route === '/pay/check') return ok({orderNo: [], available: false});
      if (route === '/tower/config') return ok({towers: [], big: [], available: false});
      if (route === '/player/set-client-data') {
        if (!local()) return error(401, '本地会话无效');
        const k = args.get('key');
        if (!k || k.length > 100) return error(400, '无效存档字段');
        let value = args.get('val');
        try { value = JSON.parse(value); } catch {}
        p.clientData[k] = value; save(p); return ok({clientData: p.clientData});
      }
      if (route === '/hangup/show' || route === '/hangup/get') {
        if (!local()) return error(401, '本地会话无效');
        const result = hangup(p);
        if (route === '/hangup/show') return ok(result);
        if (result.hangupInfo.hangupTime < 1) return error(409, '暂无可领取收益');
        growth.grant(p, result.rewards);
        p.localHangupAt = Math.max(p.localHangupAt, clock());
        p.hangupInfo = {...result.hangupInfo, hangupTime: 0};
        save(p);
        return ok({roleLevel: p.roleLevel, hangupInfo: p.hangupInfo, resource: p.resource, rewards: result.rewards});
      }
      const handled = growth.dispatch(route, args, p, local());
      if (handled) return handled;
      if (route === '/hero/level') {
        if (!local()) return error(401, '本地会话无效');
        if (p.localBattle?.started && !p.localBattle.settled) return error(409, '战斗中不能升级');
        const target = p.heroInfo.heroes.find(h => h.uuid === Number(args.get('h')));
        if (!target) return error(400, '无效英雄');
        const cost = config.heroLevelCosts?.find(row => row.level === target.l + 1);
        if (!cost || target.l >= Math.max(p.roleLevel, 10)) return error(409, '已达当前队伍等级允许的上限');
        if (cost.upgradeConsumeType.length !== 1 || cost.upgradeConsumeType[0] !== 'exp' ||
            !Number.isSafeInteger(cost.upgradeConsumeNum[0]) || cost.upgradeConsumeNum[0] <= 0)
          return error(500, '本地升级配置无效');
        const price = cost.upgradeConsumeNum[0];
        if (p.resource.exp < price) return error(409, '经验不足');
        p.resource.exp -= price;
        target.l++;
        growth.recalculate(target);
        save(p);
        return ok({heroInfo: p.heroInfo, resource: p.resource});
      }
      if (!route.startsWith('/barrier/')) return error(501, '本地版本未实现此功能');
      if (!local()) return error(401, '本地会话无效');
      if (route === '/barrier/clear-record') {
        delete p.localBattle; save(p); return ok({barrierInfo: info});
      }
      if (route === '/barrier/fight-show') {
        if (info.full || info.nextChapter) return error(409, '请返回地图进入下一关');
        if ((args.get('small') || '1') !== '1') return error(400, '本地关卡只有一波');
        const enemy = hero(info.barrierId % 3 === 0 ? 401 : 101, .55 + .12 * (info.barrierId - 1));
        p.localBattle = {id: id(), stage: info.barrierId, started: false, settled: false};
        save(p);
        return ok({enemyHeroes: {heroes: [enemy], elf: {}, ancestorSkill: [],
          power: enemy.power, battleId: p.localBattle.id}});
      }
      if (route === '/barrier/update-troop') {
        let slots;
        try { slots = JSON.parse(args.get('troop'))['1']; } catch {}
        const owned = p.heroInfo.heroes.map(h => h.uuid);
        if (!Array.isArray(slots) || slots.length !== 5 || !slots.some(Boolean) ||
            slots.some(h => !Number.isInteger(h) || h !== 0 && !owned.includes(h)) ||
            new Set(slots.filter(Boolean)).size !== slots.filter(Boolean).length)
          return error(400, '无效阵容');
        if (!p.localBattle || p.localBattle.stage !== info.barrierId || p.localBattle.settled)
          return error(409, '请先读取当前敌方队伍');
        info.troop = {1: slots, 2: [0,0,0,0,0], 3: [0,0,0,0,0]};
        p.localBattle.started = true; save(p); return ok({barrierInfo: info});
      }
      if (route === '/barrier/fight-end') {
        const battle = p.localBattle;
        if (!battle || !battle.started || args.get('battleId') !== battle.id)
          return error(409, '没有对应的已开始战斗');
        if (args.get('id') !== String(battle.stage) || !['true','false'].includes(args.get('win')))
          return error(400, '无效战斗结果');
        if (battle.settled) return ok(battle.result);
        const win = args.get('win') === 'true';
        if (win) {
          info.progress = {1: true}; info.nextChapter = true; growth.grant(p, {gold: 300, exp: 250, prestige: 250, recruitRoll: 1, ["fragment_" + (info.barrierId % 2 ? 401 : 101)]: 10});
        }
        battle.result = clone({barrierInfo: info, rewards: win ? {gold: 300, exp: 250, prestige: 250, recruitRoll: 1, ["fragment_" + (info.barrierId % 2 ? 401 : 101)]: 10} : {},
          resource: p.resource, roleLevel: p.roleLevel, localRuleset: p.localRuleset, win});
        battle.settled = true; save(p); return ok(battle.result);
      }
      if (route === '/barrier/next-chapter') {
        if (!info.nextChapter) return error(409, '当前关卡尚未完成');
        if (info.barrierId >= 20) info.full = true;
        else { info.barrierId++; info.progress = {}; }
        info.nextChapter = false; save(p); return ok({barrierInfo: info});
      }
      return error(501, '本地版本未实现此功能');
    }
    return {dispatch};
  }
  root.createLocalCampaign = createCampaign;
  if (typeof module !== 'undefined') module.exports = {createCampaign};
})(typeof window === 'undefined' ? globalThis : window);
