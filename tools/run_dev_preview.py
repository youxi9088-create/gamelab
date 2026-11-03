"""Start the development UI and playback without background production queues."""
import sys
import threading
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from server import build_server
from controlplane.service import Service

if __name__ == '__main__':
    service = Service(ROOT / 'data', ROOT / 'game-library', 'http://127.0.0.1:7101')
    admin = build_server(service, 7100)
    play = build_server(service, 7101, True)
    threading.Thread(target=play.serve_forever, daemon=True).start()
    print('Development: http://127.0.0.1:7100/\nPlayback: http://127.0.0.1:7101/', flush=True)
    try:
        admin.serve_forever()
    finally:
        admin.server_close()
        play.server_close()
