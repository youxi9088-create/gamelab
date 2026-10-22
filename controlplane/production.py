"""Read-only production inventory and operational status."""
import json
import os
import shutil
from pathlib import Path


def status(service):
    root=Path(os.environ.get('GAMELAB_SHARED_ROOT',service.data_dir.parent))
    def read(name):
        try:return json.loads((root/name).read_text('utf-8'))
        except (OSError,ValueError):return None
    with service.store.tx() as db:
        maintenance=service.store.get(db,'settings','maintenance') or {}
        audit=service.store.all(db,'audit')[:200]
    disk=shutil.disk_usage(root)
    return dict(shared_root=str(root),data_directory=str(service.data_dir),game_repository=str(service.repo.root),
        release=read('release.json'),backup=read('backup-status.json'),monitor=read('monitor-status.json'),
        draining=bool(maintenance.get('draining')),disk_free_bytes=disk.free,disk_total_bytes=disk.total,audit=audit,
        note='项目数据共享；角色限制操作权限。生产文件与数据库统一保存在服务器，代码发布不覆盖生产数据。')
