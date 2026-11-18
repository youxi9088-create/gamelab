"""Read the existing complete outcome; never replay the observation or ledger write."""
from pathlib import Path
import json
p=Path('D:/GameLab/temp/direct-smash-resources-localized-v1-20261118/validation-resources-v1-20261118/observation-v4/step3-outcome.json')
d=json.loads(p.read_bytes());assert d['complete']and d['ui_steps_used']==3 and d['events']==40
print(json.dumps(d,ensure_ascii=False))
