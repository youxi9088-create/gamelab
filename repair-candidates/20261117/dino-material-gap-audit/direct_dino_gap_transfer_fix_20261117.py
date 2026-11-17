from pathlib import Path
import zipfile
b=Path(__file__).parent;old=b/'direct_dino_material_gap_evidence_20261117.pyz';new=b/'direct_dino_material_gap_evidence_v2_20261117.pyz';assert not new.exists()
with zipfile.ZipFile(old)as src:
 main=src.read('__main__.py').decode();needle="before['version_id']is None";assert needle in main;main=main.replace(needle,"before.get('version_id')is None");compile(main,'dino-gap-null-version-key','exec')
 with zipfile.ZipFile(new,'w',zipfile.ZIP_DEFLATED)as dst:
  for name in src.namelist():dst.writestr(name,main.encode()if name=='__main__.py'else src.read(name))
print('Preserved original zipapp; v2 handles absent optional version_id. Evidence payload and source bindings unchanged.')
