"""Read-only source/assets preflight; no gameplay or gate results fabricated."""
from pathlib import Path
import json,sys,hashlib,datetime,base64,struct,zlib
b=Path(__file__).parent;r=b/'direct-games/job-e402fd36800c';p=r/'work-local-completion-v3-20261118'
sys.path.insert(0,str(b.parent/'gamelab'))
from controlplane.offline_delivery import inspect
from controlplane.conversion_delivery_checks import inspect as delivery
plan={'acceptance_actions':[{'type':'click','selector':'.playButtonContainer','executed':False}],'scope':'Proposed native player step, not a result'}
offline=inspect(p);checks=delivery(p,plan)
assert not offline['findings']and not checks['findings'],checks['findings']
base=json.loads((p/'resources/base.580.json').read_text(encoding='utf8'));images=json.loads((p/'resources/images.580.json').read_text(encoding='utf8'))
assert len(base)==616 and len(images)==617 and set(base)<=set(images)
integrity=[]
for key,value in images.items():
 raw=base64.b64decode(value,validate=True);assert raw[:8]==b'\x89PNG\r\n\x1a\n',key
 width,height=struct.unpack('>II',raw[16:24]);assert 0<width<=4096 and 0<height<=4096
 offset=8;ended=False
 while offset<len(raw):
  length=struct.unpack('>I',raw[offset:offset+4])[0];end=offset+12+length;assert end<=len(raw),key
  kind=raw[offset+4:offset+8];body=raw[offset+4:offset+8+length];crc=struct.unpack('>I',raw[offset+8+length:end])[0];assert zlib.crc32(body)&0xffffffff==crc,key
  offset=end
  if kind==b'IEND':ended=True;break
 assert ended and offset==len(raw),key
 integrity.append({'id':key,'bytes':len(raw),'width':width,'height':height,'sha256':hashlib.sha256(raw).hexdigest()})
names=json.loads((p/'offline/resources/en/names.580.json').read_text(encoding='utf8'));assert [1,2]in base['5']['parents']and base['1']['prime']and base['2']['prime']
out={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source_only':True,'game_executed':False,'prior_ui_steps':5,'new_ui_authorization':False,'offline_static':offline,'delivery_static':checks,'static_clear_is_not_runtime_or_admission':True,'base_records':616,'inline_images':617,'all_png_chunks_crc_valid':True,'all_base_ids_have_original_images':True,'base_sha256':hashlib.sha256((p/'resources/base.580.json').read_bytes()).hexdigest(),'images_sha256':hashlib.sha256((p/'resources/images.580.json').read_bytes()).hexdigest(),'representative_recipe':{'input_ids':[1,2],'output_id':5,'names':{str(i):names[str(i)]for i in [1,2,5]},'original_parents':base['5']['parents']},'five_step_proposal':['Start exact revision on remote52','Click native PLAY','Drag native water from library into workspace','Drag native fire onto water, observe native steam discovery and progress','Refresh and observe earned library/progress restoration'],'not_verified':['Actual revised UI','Drag/drop and steam discovery','Earned save/reload','Complete runtime resource/error observation'],'ready_review':False}
(p/'evidence/direct-repair/v3-static-readiness.json').write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf8')
(p/'evidence/direct-repair/original-inline-png-integrity.json').write_text(json.dumps({'source_only':True,'images_json_sha256':out['images_sha256'],'items':integrity},indent=2),encoding='utf8')
print(json.dumps(out,ensure_ascii=False))
