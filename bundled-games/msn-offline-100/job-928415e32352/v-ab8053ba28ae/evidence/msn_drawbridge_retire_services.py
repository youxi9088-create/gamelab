"""Retire real Construct event consumers, preserving native level/physics data."""
from pathlib import Path
import copy, hashlib, json, re, subprocess

b = Path(__file__).parent / 'msn-capture-100'
src = b / 'msn-en-us/originals/9nvq40981t9r'
out = b / 'source-analysis/drawbridge'
out.mkdir(exist_ok=True)
original = json.loads((src / 'data.json').read_text(encoding='utf-8'))
adapted = copy.deepcopy(original)
p = adapted['project']
assert len(p) == 50 and len(p[3]) == 64 and len(p[5]) == 93
assert [x[0] for x in p[6]] == ['Game_Sheet', 'LevelsSelection', 'Menu', 'Ads']
ads = next(x for x in p[6] if x[0] == 'Ads')
ad_vars = {e[6]: e[1] for e in ads[1] if e[0] == 1}
assert set(ad_vars.values()) == {'Ads', 'adActive', 'adReward', 'GiveReward', 'canReward'}
ads_sid = next(sid for sid, name in ad_vars.items() if name == 'Ads')
assert all(e[3] == 0 for e in ads[1] if e[0] == 1)
refs = json.loads((out / 'object-reference-table.json').read_text(encoding='utf-8'))
script_slots = {i: ref for i, ref in enumerate(refs) if ref.startswith('C3.ScriptsInEvents.')}
assert len(refs) == 129 and len(script_slots) == 10
assert refs[34] == 'C3.Plugins.System.Cnds.CompareVar'
assert refs[119] == 'C3.Plugins.Browser.Acts.GoToURLWindow'
removed_events = []
removed_actions = []
removed_guards = []

def has_sid(v, sid):
    if isinstance(v, list):
        return any(has_sid(x, sid) for x in v)
    return type(v) is int and v == sid

def events(rows, sheet, parent=()):
    result = []
    for index, item in enumerate(rows):
        e = copy.deepcopy(item)
        location = [sheet, *parent, index]
        if e[0] == 2:
            assert e[1] == 'Ads'
            removed_events.append({'path': location, 'kind': 'Ads sheet inclusion', 'original': e})
            continue
        if e[0] == 1:
            result.append(e)
            continue
        assert e[0] in [0, 3], ('Unreviewed event opcode', location, e[0])
        assert len(e) in [8, 9]
        if sheet == 'Game_Sheet' and e[5] in [76, 77, 78, 79, 80]:
            assert any(has_sid(e, sid) for sid in ad_vars)
            removed_events.append({'path': location, 'kind': 'Ad request/reward-only event', 'original': e})
            continue
        conditions = []
        for condition in e[6]:
            if has_sid(condition, ads_sid):
                # This is the original Ads==0 navigation/sound pause gate,
                # with no altered level, money, tutorial or progress condition.
                assert condition[:7] == [-1, 34, None, 0, False, False, False]
                assert condition[9] == [[11, ads_sid], [8, 0], [7, [1]]]
                removed_guards.append({'path': location, 'event': e[5], 'original': condition})
            else:
                conditions.append(condition)
        e[6] = conditions
        actions = []
        for action in e[7]:
            if action[0] == -3:
                assert action[1] in script_slots
                removed_actions.append({'path': location, 'event': e[5], 'kind': script_slots[action[1]], 'original': action})
                continue
            if action[:2] == [40, 119]:
                removed_actions.append({'path': location, 'event': e[5], 'kind': 'External browser navigation', 'original': action})
                continue
            actions.append(action)
        e[7] = actions
        if len(e) == 9:
            e[8] = events(e[8], sheet, (*parent, index, 8))
        if not e[7] and (len(e) < 9 or not e[8]) and item[7] and all(a[0] == -3 or a[:2] == [40, 119] for a in item[7]):
            removed_events.append({'path': location, 'kind': 'External-only event with no native action', 'original': item})
            continue
        assert not any(has_sid(e[:8], sid) for sid in ad_vars), location
        result.append(e)
    return result

p[6] = [[sh[0], events(sh[1], sh[0])] for sh in p[6] if sh[0] != 'Ads']
for sid in ad_vars:
    assert not has_sid(p[6], sid), ('Surviving retired service variable', sid)

ui_types = {50: 'adButton', 51: 'reward_txt', 53: 'Adtext', 54: 'Btn_rate', 55: 'adclick'}
for i, name in ui_types.items():
    assert p[3][i][0] == name
removed_instances = []
for li, layout in enumerate(p[5]):
    for layer_index, layer in enumerate(layout[9]):
        instances = []
        for inst in layer[14]:
            if inst[1] in ui_types:
                removed_instances.append({'layout': layout[0], 'layer': layer[0], 'type': ui_types[inst[1]], 'uid': inst[2]})
            else:
                instances.append(inst)
        layer[14] = instances
        original_layer = original['project'][5][li][9][layer_index]
        assert layer[:14] == original_layer[:14] and layer[15:] == original_layer[15:]
        assert layer[14] == [v for v in original_layer[14] if v[1] not in ui_types]
assert len(removed_instances) == 93
for i, v in enumerate(p):
    if i not in [5, 6]:
        assert v == original['project'][i]
assert [l[0] for l in p[5]] == [l[0] for l in original['project'][5]]
assert {str(n) for n in range(1, 91)} <= {l[0] for l in p[5]}
(out / 'offline-data.json').write_text(json.dumps(adapted, separators=(',', ':'), ensure_ascii=False), encoding='utf-8')

# Retire references as null slots, preserving every other engine/reference index.
# No callable stub, provider object, state packet, reward or SDK response exists.
engine = (src / 'scripts/c3runtime.js').read_text(encoding='utf-8')
new_engine = engine
for slot, ref in script_slots.items():
    assert new_engine.count(ref) == 1
    new_engine = new_engine.replace(ref, 'null')
assert 'C3.ScriptsInEvents.' not in new_engine
before = engine[engine.rindex('self.C3_GetObjectRefTable ='):]
after = new_engine[new_engine.rindex('self.C3_GetObjectRefTable ='):]
for ref in script_slots.values():
    before = before.replace(ref, 'null')
assert before == after
assert engine[:engine.rindex('self.C3_GetObjectRefTable =')] == new_engine[:new_engine.rindex('self.C3_GetObjectRefTable =')]
(out / 'offline-c3runtime.js').write_text(new_engine, encoding='utf-8', newline='')

main = (src / 'scripts/main.js').read_text(encoding='utf-8')
old = 'projectScripts:[["scripts/project/scriptsInEvents.js"]]'
assert main.count(old) == 1
new_main = main.replace(old, 'projectScripts:[]')
(out / 'offline-main.js').write_text(new_main, encoding='utf-8', newline='')
html = (src / 'index.html').read_text(encoding='utf-8')
html, count = re.subn(r'\s*<script src="scripts/(?:offlineclient|register-sw)\.js" type="module"></script>', '', html)
assert count == 2
html, count = re.subn(r'\s*<link rel="manifest" href="manifest\.json">', '', html)
assert count == 1
(out / 'offline-index.html').write_text(html, encoding='utf-8', newline='')
for n in ['offline-main.js', 'offline-c3runtime.js']:
    result = subprocess.run(['node', '--check', str(out / n)], capture_output=True, text=True)
    assert result.returncode == 0, result.stderr[:1200]

report = {'source_only': True, 'native_or_SDK_executed': False, 'UI_inputs': 0,
          'original_data_sha256': hashlib.sha256((src / 'data.json').read_bytes()).hexdigest(),
          'offline_data_sha256': hashlib.sha256((out / 'offline-data.json').read_bytes()).hexdigest(),
          'native_layouts_preserved': len(p[5]), 'original_numbered_levels_preserved': 90,
          'all_non_ad_initial_instances_and_physics_exact': True,
          'all_other_project_fields_deep_equal': True,
          'removed_instances': removed_instances, 'removed_events': removed_events,
          'removed_actions': removed_actions, 'removed_ad_pause_guards': removed_guards,
          'original_Ads_event_sheet_removed': True,
          'retired_script_reference_slots': script_slots,
          'all_other_engine_and_reference_bytes_exact': True,
          'gameplay_core_engine_and_Box2D_not_replaced': True,
          'no_reward_or_readiness_success_synthesis': True,
          'no_project_service_script_loaded': True,
          'main_only_change': 'Remove original service-only project script from native bootstrap list.',
          'runtime_verified': False}
(out / 'services-retirement-proof.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps({'layouts': len(p[5]), 'native_numbered_levels': 90,
                  'removed_ad_link_instances': len(removed_instances), 'removed_service_events': len(removed_events),
                  'removed_script_link_actions': len(removed_actions), 'removed_native_ad_pause_guards': len(removed_guards),
                  'retired_uncallable_reference_slots': len(script_slots), 'UI': 0}))
