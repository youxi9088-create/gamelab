"""Backfill evidence-backed provenance through the existing admin API.

Does not change rights, approval, publication or game code. Saves an audit copy.
"""
import hashlib
import http.cookiejar
import json
import urllib.request
from datetime import datetime, timezone, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RECORDS = {
    'game-d87e999a40ae': dict(
        code_origin='Amition/minigame-engine 开源工程；固定上游提交 2b0b8125309f1394d15206cd1b5b043981a7f4e3，增加 Web 沙箱适配；完整工程位于 game-library/projects/wechat-fruit。',
        assets_origin='随上游工程交付的水果画面与音频；本地保留 LICENSE 和来源记录。',
        license_basis='本地 LICENSE：MIT，Copyright (c) 2026 Ambition。',
        use_scope='按随包 MIT 许可处理，保留版权声明与许可文本；本次未发现独立素材授权清单。',
        unresolved='素材逐项权属未单独审计；微信开发者工具与真机未验证。',
        files=['production-inputs/wechat-fruit/provenance.json', 'production-inputs/wechat-fruit/LICENSE']),
    'game-1ce7c59452f3': dict(
        code_origin='本工作区 AI 编码代理独立编写的寒冬生存核心玩法；未反编译无尽冬日客户端，未复用其代码。',
        assets_origin='原创程序化 Canvas 画面与 CSS；交付记录明确未下载原游戏素材。',
        license_basis='provenance.json 记录为本工作区原创交付，未引入第三方代码；没有声明为开源。',
        use_scope='本工作区交付的原创核心玩法项目；不代表取得原游戏品牌或原游戏内容的许可。',
        unresolved='不含原版英雄、联盟、PvP、内购、服务端及完整客户端。',
        files=['production-inputs/frost-hearth/provenance.json', 'production-inputs/frost-hearth/README.md']),
    'game-dcc5130f5732': dict(
        code_origin='微信缓存 wx7cf63abbc0f6fb7d 恢复的 LayaAir 2.12 发布脚本，增加浏览器适配；5 个包、482 个文件、11 个游戏模块；不是原始开发工程。',
        assets_origin='同一微信缓存包内的原游戏关卡及素材，共 20 个关卡。',
        license_basis='交付 provenance.json 明确记录 rights=unknown，未提供原代码或素材的许可凭据。',
        use_scope='当前为本地恢复运行包；尚无已核实的代码、素材使用范围。',
        unresolved='原代码与素材使用范围未核实；不能由“可运行”推定已授权。',
        files=['F:/youxi/game01/platform-package/provenance.json']),
    'game-57b413a1db70': dict(
        code_origin='本机微信缓存中的 Cocos Creator 3.5.1 引擎、编译后业务脚本，经浏览器兼容与无广告适配；非原始 TypeScript 编辑工程。',
        assets_origin='缓存内原游戏场景与资源，完整运行目录打包在 web-runtime.zip。',
        license_basis='交付 README 明确记录使用范围未确认；现有交付未提供代码或素材授权凭据。',
        use_scope='当前为本地网页适配运行包；代码和素材的使用范围尚未核实。',
        unresolved='原代码、素材许可凭据缺失；完整后续经营流程仍待验收。',
        files=['F:/youxi/4k99-5760-reverse/platform-package/README.md']),
    'game-e7f887db6795': dict(
        code_origin='CrazyGames 上 Frost Land 的 Unity WebGL 发布资源本地托管与修改；不是完整 Unity/C# 源工程恢复。',
        assets_origin='原版角色、建筑、音频等仍保留；23 个树木、树桩、岩石模型替换为 Synty 素材，详见替换报告。',
        license_basis='交付 README 与版本报告均标记整体使用范围待确认；本次未在所查交付记录中找到原游戏授权或 Synty 购买/许可凭据。',
        use_scope='当前为本地 Synty 树石替换及无广告测试运行包；整体使用范围未核实。',
        unresolved='原游戏代码和保留素材的授权，以及 Synty 素材对应许可凭据尚缺。',
        files=['F:/youxi/ad game/delivery/frost-land-synty-full-review/README.md', 'F:/youxi/ad game/delivery/frost-land-synty-full-review/full-replacement-report.json']),
    'game-213e6bc06f76': dict(
        code_origin='平台自建 Orbit Catch 测试样例。', assets_origin='自建测试画面。',
        license_basis='本工作区自建验证样例记录。', use_scope='仅作为系统自检样例，继续隐藏，不计作第三方复刻成果。',
        unresolved='无新增授权声明。', files=['executors/fixtures/orbit-catch/README.md']),
}

def main():
    base = 'http://127.0.0.1:8765'
    client = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
    csrf = json.load(client.open(base + '/api/session'))['csrf']
    def state(): return json.load(client.open(base + '/api/state'))
    before = state()
    audit = []
    for c in before['candidates']:
        if c['id'] not in RECORDS: continue
        p = dict(RECORDS[c['id']])
        p['checked_at'] = datetime.now(timezone(timedelta(hours=8))).isoformat(timespec='seconds')
        p['source_url'] = c['url']
        p['cover_origin'] = '平台 AI 生成概念封面，非实机截图；生成记录位于 web/assets/covers。' if not c.get('observations', {}).get('catalog_hidden') else '自检样例原始画面。'
        p['evidence'] = []
        for name in p.pop('files'):
            path = Path(name)
            if not path.is_absolute(): path = ROOT / path
            p['evidence'].append(dict(path=str(path), sha256=hashlib.sha256(path.read_bytes()).hexdigest()))
        observations = dict(c.get('observations') or {})
        observations['provenance'] = p
        req = urllib.request.Request(base + '/api/candidates/' + c['id'] + '/update', data=json.dumps(dict(observations=observations)).encode(), headers={'Content-Type':'application/json', 'X-CSRF-Token':csrf})
        updated = json.load(client.open(req))['candidate']
        assert updated['rights'] == c['rights'] and updated['status'] == c['status']
        assert updated['observations']['provenance'] == p
        audit.append(dict(candidate_id=c['id'], title=c['title'], previous_observations=c.get('observations'), provenance=p))
    out = ROOT / 'docs' / 'game-provenance-audit.json'
    out.write_text(json.dumps(audit, ensure_ascii=False, indent=2), encoding='utf-8')
    after = state()
    assert before['versions'] == after['versions'], 'Version state changed during backfill; inspect concurrent work'
    print(json.dumps({'updated':len(audit), 'audit':str(out), 'version_states_unchanged':True}, ensure_ascii=False))

if __name__ == '__main__': main()
