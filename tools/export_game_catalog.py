"""Export a portable AI catalog and game documents without rerunning games."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from controlplane.service import Service
from controlplane.game_catalog import export

if __name__ == '__main__':
    root = Path(__file__).resolve().parents[1]
    service = Service(root/'data', root/'game-library', 'http://127.0.0.1:8766')
    state = service.state()
    result = export(service.repo.root, state['candidates'], state['versions'])
    print('Exported', len(result['games']), 'game entries; incomplete:',
          sum(r['profile_status'] != 'complete' for r in result['games']))
