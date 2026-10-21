"""Export Unity fish skinning and sampled original animation tracks without target execution."""
import os,sys,json,zlib,struct,math,hashlib
from pathlib import Path
sys.path.insert(0,os.environ.get('REPLICA_UNITYPY_PATH','F:/youxi/ad game/analysis/unity-tools'))
import UnityPy
from UnityPy.helpers.MeshHelper import MeshHandler

def export(path,out):
 raw_bundle=path.read_bytes()
 env=UnityPy.load(raw_bundle);objects={o.path_id:o for o in env.objects};transforms={o.path_id:o.read() for o in env.objects if o.type.name=='Transform'}
 ids=list(transforms);lookup={pid:i for i,pid in enumerate(ids)};bones=[];hashes={}
 def fullpath(pid):
  t=transforms[pid];name=t.m_GameObject.deref_parse_as_object().m_Name;parent=t.m_Father.path_id
  return fullpath(parent)+'/'+name if parent in transforms else name
 def vec(v):return [v.x,v.y,v.z]
 for pid,t in transforms.items():
  p=fullpath(pid);parts=p.split('/')
  for i in range(len(parts)):hashes[zlib.crc32('/'.join(parts[i:]).encode())]=lookup[pid]
  bones.append({'name':'bone'+str(lookup[pid]),'source_name':t.m_GameObject.deref_parse_as_object().m_Name,'parent':lookup.get(t.m_Father.path_id,-1),'position':vec(t.m_LocalPosition),'quaternion':vec(t.m_LocalRotation)+[t.m_LocalRotation.w],'scale':vec(t.m_LocalScale)})
 meshes=[]
 for obj in env.objects:
  if obj.type.name!='SkinnedMeshRenderer':continue
  renderer=obj.read();mesh=renderer.m_Mesh.deref_parse_as_object();h=MeshHandler(mesh);h.process()
  weights=[]
  for row in (h.m_BoneWeights or [(1.0,)]*len(h.m_Vertices)):
   row=list(row)+[0.]*(4-len(row))
   if row[3]<0:row[3]=1-sum(row[:3])
   assert all(-1e-5<=w<=1.00001 for w in row) and abs(sum(row)-1)<.001
   weights.extend(row)
  meshes.append({'name':mesh.m_Name,'skinIndices':[int(v) for row in h.m_BoneIndices for v in list(row)+[0]*(4-len(row))],'skinWeights':weights,'boneOrder':[lookup[p.path_id] for p in renderer.m_Bones],'bindPoses':[[getattr(m,f'e{r}{c}') for c in range(4) for r in range(4)] for m in mesh.m_BindPose]})
 clips=[]
 for obj in env.objects:
  if obj.type.name!='AnimationClip':continue
  d=obj.read_typetree()
  if d['m_Name'] not in ['idle','move','speedUp','attack']:continue
  data=d['m_MuscleClip']['m_Clip']['data'];stream=data['m_StreamedClip'];dense=data['m_DenseClip'];constant=data['m_ConstantClip']['data'];duration=d['m_MuscleClip']['m_StopTime'];sc=stream['curveCount'];dc=dense['m_CurveCount'];curves=[[] for _ in range(sc)]
  raw=struct.pack('<'+'I'*len(stream['data']),*stream['data']);offset=0
  while offset<len(raw):
   time,count=struct.unpack_from('<fI',raw,offset);offset+=8
   for _ in range(count):
    index,a,b,c,v=struct.unpack_from('<Iffff',raw,offset);offset+=20;curves[index].append((time,a,b,c,v))
  def value(index,time):
   if index<sc:
    curve=curves[index];key=next((k for k in reversed(curve) if k[0]<=time),curve[0]);delta=time-key[0] if math.isfinite(key[0]) and key[0]>-1e30 else 0
    return ((key[1]*delta+key[2])*delta+key[3])*delta+key[4]
   if index<sc+dc:
    frame=min(dense['m_FrameCount']-1,round((time-dense['m_BeginTime'])*dense['m_SampleRate']));return dense['m_SampleArray'][max(0,frame)*dc+index-sc]
   return constant[index-sc-dc]
  times=[i/30 for i in range(round(duration*30)+1)];tracks=[];index=0;unknown=[]
  for binding in d['m_ClipBindingConstant']['genericBindings']:
   attr=binding['attribute'];size=4 if attr==2 else 3 if attr in (1,3,4) else 1
   bone=hashes.get(binding['path']);prop={1:'position',2:'quaternion',3:'scale',4:'rotation'}.get(attr)
   if bone is not None and prop and binding['typeID']==4:
    values=[value(index+k,t)*(math.pi/180 if attr==4 else 1) for t in times for k in range(size)]
    tracks.append({'name':'bone'+str(bone)+'.'+prop,'type':'quaternion' if attr==2 else 'vector','times':times,'values':values})
   else:unknown.append(binding)
   index+=size
  assert index==sc+dc+len(constant),(index,sc,dc,len(constant))
  print('unmapped bindings',len(unknown))
  clips.append({'name':d['m_Name'],'duration':duration,'tracks':tracks,'unmapped_bindings':unknown})
 result={'bones':bones,'meshes':meshes,'clips':clips,'source_sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'source_bundle':path.name,'animation_sampling_hz':30}
 out.write_text(json.dumps(result,separators=(',',':')),'utf-8');print(path.name,len(bones),[(x['name'],len(x['tracks'])) for x in clips])
if __name__=='__main__':
 root=Path(sys.argv[1]);out=Path(sys.argv[2]);out.mkdir(parents=True,exist_ok=True)
 for fid in ['3002','3004','3012']:export(next(root.glob('battlefish_assets_f_'+fid+'_*.bundle')),out/('fish-'+fid+'-rig.json'))
