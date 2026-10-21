"""One-time migration of legacy display adjustments into version metadata."""
import json,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT))
from controlplane.store import Store
from controlplane.presentation import preview_settings
store=Store(ROOT/'data/platform.sqlite3')
count=0
with store.tx() as db:
    for version in store.all(db,'versions'):
        if 'preview' in version:continue
        cover=version.get('cover','') or ''
        zoom=2.34 if '/artifact-1d443b84ae9c/screenshots/gameplay.png' in cover else 3.6 if '/frost-land-synty-full.png' in cover else 1
        version['preview']=preview_settings({'preview':{'zoom':zoom}})
        store.put(db,'versions',version);count+=1
print(json.dumps({'migrated_versions':count}))
