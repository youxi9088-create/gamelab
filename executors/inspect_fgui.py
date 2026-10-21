import struct,json
from pathlib import Path
from PIL import Image
class Buffer:
 def __init__(self,data):self.data=data;self.pos=0;self.strings=[]
 def n(self,fmt):v=struct.unpack_from('>'+fmt,self.data,self.pos)[0];self.pos+=struct.calcsize(fmt);return v
 def string(self):n=self.n('H');v=self.data[self.pos:self.pos+n].decode('utf-8');self.pos+=n;return v
 def s(self):i=self.n('H');return None if i==65534 else '' if i==65533 else self.strings[i]
 def seek(self,base,block):
  self.pos=base;count=self.n('B');short=self.n('B');self.pos+=block*(2 if short else 4);offset=self.n('H' if short else 'I');self.pos=base+offset;return offset>0
p=Path('production-inputs/GameMain_fui.bytes');b=Buffer(p.read_bytes());print(hex(b.n('I')),b.n('I'),b.n('B'));print(b.string(),b.string());b.pos+=20;base=b.pos;b.seek(base,4);b.strings=[b.string() for _ in range(b.n('I'))];b.seek(base,1);items={}
for _ in range(b.n('H')):
 end=b.n('I')+b.pos;kind=b.n('B');id=b.s();name=b.s();path=b.s();file=b.s();exported=b.n('B');w=b.n('I');h=b.n('I');items[id]={'type':kind,'name':name,'file':file,'width':w,'height':h};b.pos=end
print('items',len(items));print('components',[(id,x['name'],x['width'],x['height']) for id,x in items.items() if x['type']==3][:90]);print('atlases',[(id,x['file']) for id,x in items.items() if x['type']==4])
b.seek(base,2);sprites={}
for _ in range(b.n('H')):
 end=b.n('H')+b.pos;id=b.s();atlas=b.s();rect=[b.n('i') for _ in range(4)];rotated=b.n('B');trim=None
 if b.pos<end and b.n('B'):trim=[b.n('i') for _ in range(4)]
 sprites[id]={'atlas':atlas,'rect':rect,'rotated':rotated,'trim':trim};b.pos=end
Path('production-inputs/fish-fgui-index.json').write_text(json.dumps({'items':items,'sprites':sprites},ensure_ascii=False,indent=2),'utf-8');print('sprites',len(sprites))

import io,base64,shutil
out=Path('F:/youxi/4k99-5113-web/assets/ui');images={};cache={}
for id,s in sprites.items():
 atlas=s['atlas']
 if atlas not in cache:cache[atlas]=Image.open(out/('GameMain_'+items[atlas]['file']))
 x,y,w,h=s['rect'];image=cache[atlas].crop((x,y,x+w,y+h))
 if s['rotated']:image=image.transpose(Image.Transpose.ROTATE_90)
 if s['trim']:
  ox,oy,ow,oh=s['trim'];full=Image.new('RGBA',(ow,oh));full.paste(image,(ox,oy));image=full
 data=io.BytesIO();image.save(data,format='PNG');images[id]='data:image/png;base64,'+base64.b64encode(data.getvalue()).decode()
(out/'sprites.json').write_text(json.dumps(images),'utf-8');shutil.copyfile(p,out/'package.xml')
