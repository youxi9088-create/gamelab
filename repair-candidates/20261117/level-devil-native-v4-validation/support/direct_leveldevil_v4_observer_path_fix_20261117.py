from pathlib import Path
import zipfile,json
b=Path(__file__).parent;old=b/'direct_leveldevil_v4_authorized_observer_20261117.pyz';new=b/'direct_leveldevil_v4_authorized_observer_pathfix_20261117.pyz';assert not new.exists()
builder=(b/'direct_leveldevil_v4_authorized_observer_build_20261117.py').read_text(encoding='utf8')
start=builder.index(' code=r"""');end=builder.index('\n"""',start)+4;block=builder[start:end]
assert not any(c in block for c in ['\r','\v','\t']) and 'D:\\GameLab\\runtime\\python\\python.exe'in block
with zipfile.ZipFile(old)as z:
 files={n:z.read(n)for n in z.namelist()};main=files['__main__.py'].decode();a=main.index(' code=r"""');zpos=main.index('\n"""',a)+4
 fixed=main[:a]+block+main[zpos:];assert fixed!=main;compile(fixed,'fixed-v4-observer','exec');files['__main__.py']=fixed.encode()
with zipfile.ZipFile(new,'w',zipfile.ZIP_DEFLATED)as z:
 for n,v in files.items():z.writestr(n,v)
print(json.dumps({'prepared':True,'fix':'Only generated PowerShell path literals; original XML registration rejected before game start/work-log. Authorization/server/ledger payload bytes unchanged.','path':str(new)}))
