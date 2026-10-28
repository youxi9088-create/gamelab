"""No-progress signals are diagnostic evidence, never gameplay acceptance."""
import hashlib
import json

def action_signature(actions):
    return json.dumps([{k:v for k,v in a.items() if k in ('type','x','y','to_x','to_y','key','hold_ms')} for a in actions if a.get('type') in ('click','key','drag')],sort_keys=True)

class ReviewProgress:
    def __init__(self):self.previous=None;self.count=0;self.action_count=0;self.repeated='';self.stalls=0
    def observe(self,runtime,image):
        actions=runtime.get('actions',[]);fresh=actions[self.action_count:];self.action_count=len(actions)
        signature=action_signature(fresh)
        frame=hashlib.sha256(image.read_bytes()).hexdigest() if image and image.is_file() else None
        current=(frame,signature)
        repeated=bool(frame and signature!='[]' and current==self.previous)
        self.count=self.count+1 if repeated else 0
        self.previous=current
        stalled=self.count>=2
        self.repeated=signature if stalled else ''
        if stalled:self.stalls+=1
        return {'suspected_stuck':stalled,'unchanged_repetitions':self.count,'frame_sha256':frame,
                'reason':'相同交互连续出现且截图完全相同；应检查遮挡、输入方式和运行错误' if stalled else '',
                'scope':'Exact screenshot comparison only; animation can hide a stall, and visual change is not success'}
    def repeats_stalled_action(self,actions):
        return bool(self.repeated and action_signature(actions)==self.repeated)
