"""补上 Kimi（Moonshot）单价，并回填已有调用的费用。

背景：平台在每次调用时就按当时的单价算好 estimated_cost，汇总时直接读该字段。
所以"现在才补单价"不会自动回填历史——必须把历史记录一起重算，否则看板上
那 109 次 Kimi 调用会永远显示"费用未知"。

单价取自 Kimi 开放平台官方定价（kimi-k2.7-code，262,144 上下文）：
  输入（缓存未命中）¥6.50 / MTok · 输入（缓存命中）¥1.30 / MTok · 输出 ¥27.00 / MTok
K2 系列官方未单列缓存写入价，因此不填 cache_write_per_million——按 usage.estimate
的口径，未配置的价格字段不参与计算，不会误判成 0。

用法：python tools/backfill_kimi_pricing.py [--apply]
不加 --apply 只做演练，打印将要写入的内容。
"""
import json
import sqlite3
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(r'F:/youxi/door')
sys.path.insert(0, str(ROOT))
from controlplane.usage import estimate, validate_pricing  # noqa: E402

DB = ROOT / 'data' / 'platform.sqlite3'
KIMI_KEY = 'api:kimi-k2.7-code'
KIMI_RATE = {'currency': 'CNY', 'input_per_million': 6.5,
             'output_per_million': 27, 'cached_input_per_million': 1.3}


def backup(connection, destination):
    target = sqlite3.connect(str(destination))
    try:
        connection.backup(target)
    finally:
        target.close()


def main():
    apply_changes = '--apply' in sys.argv
    connection = sqlite3.connect(str(DB), timeout=30)
    connection.row_factory = sqlite3.Row
    try:
        row = connection.execute(
            "SELECT data FROM records WHERE kind='settings' AND id='ai_pricing'").fetchone()
        rates = json.loads(row['data']).get('rates', {}) if row else {}
        print('现有点价:', json.dumps(rates, ensure_ascii=False)[:300])

        updated = dict(rates)
        updated[KIMI_KEY] = KIMI_RATE
        # 走平台自己的校验，避免写进一个前端读不出来的形状。
        validated = validate_pricing(updated)
        print('写入后:', json.dumps(validated[KIMI_KEY], ensure_ascii=False))

        usage = connection.execute(
            "SELECT id, data FROM records WHERE kind='ai_usage'").fetchall()
        targets = []
        for item in usage:
            data = json.loads(item['data'])
            key = f"{data.get('provider')}:{data.get('model')}"
            if key != KIMI_KEY or data.get('estimated_cost') is not None:
                continue
            priced = estimate(data, validated[KIMI_KEY])
            targets.append((item['id'], priced, data))
        total = sum(t[1]['estimated_cost'] or 0 for t in targets)
        unknown = [t for t in targets if t[1]['cost_unknown_reason']]
        print(f'待回填 {len(targets)} 条 · 合计 ¥{total:.4f} · 仍未知 {len(unknown)} 条')
        for tid, priced, data in unknown[:3]:
            print('  仍未知:', tid, priced['cost_unknown_reason'],
                  {k: data.get(k) for k in ('input_tokens', 'output_tokens',
                                            'cached_input_tokens', 'cache_write_tokens')})

        if not apply_changes:
            print('\n演练结束，未写入。确认无误后加 --apply。')
            return 0

        stamp = datetime.now(timezone.utc).strftime('%Y%m%d-%H%M%S')
        backup_path = DB.with_name(DB.name + f'.bak-{stamp}')
        backup(connection, backup_path)
        print('已备份:', backup_path)

        connection.execute(
            "UPDATE records SET data=? WHERE kind='settings' AND id='ai_pricing'",
            (json.dumps({'id': 'ai_pricing', 'rates': validated,
                         'updated_at': datetime.now(timezone.utc).isoformat()},
                        ensure_ascii=False),))
        changed = 0
        for tid, priced, data in targets:
            data.update({k: v for k, v in priced.items() if k != 'pricing'})
            connection.execute("UPDATE records SET data=? WHERE kind='ai_usage' AND id=?",
                               (json.dumps(data, ensure_ascii=False), tid))
            changed += 1
        connection.commit()
        print(f'已写入单价并回填 {changed} 条 · 合计 ¥{total:.4f}')
        return 0
    finally:
        connection.close()


if __name__ == '__main__':
    sys.exit(main())
