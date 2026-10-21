"""Online SQLite backup before upgrading conversation state."""
import sqlite3
from datetime import datetime
from pathlib import Path
root=Path(__file__).resolve().parents[1]
dest=root/'data/backups'/('before-conversations-'+datetime.now().strftime('%Y%m%d-%H%M%S')+'.sqlite3')
dest.parent.mkdir(exist_ok=True)
with sqlite3.connect(root/'data/platform.sqlite3') as source, sqlite3.connect(dest) as target:
    source.backup(target)
print(dest)
