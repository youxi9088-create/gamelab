"""User-authorized feature removal in a version-bound working copy."""
from pathlib import Path
from runtime_source_patch import RuntimeSourcePatch, sha
from controlplane.offline_delivery import FEATURES


class OfflineSourcePatch(RuntimeSourcePatch):
    def __init__(self,run,budget,baseline):
        super().__init__(run,budget);self.baseline=Path(baseline).resolve()

    def candidates(self):
        result={}
        for working in self.target.rglob('*'):
            relative=working.relative_to(self.target)
            if working.suffix.lower() not in ('.js','.mjs') or set(relative.parts)&{'vendor','assets','node_modules','_runtime_resources','evidence','verification','screenshots','platform-delivery','supply-delivery'}:continue
            original=self.baseline/relative
            if working.is_symlink() or original.is_symlink() or not original.is_file() or not working.is_file():continue
            if not working.resolve().is_relative_to(self.target) or not original.resolve().is_relative_to(self.baseline):continue
            if not 0<working.stat().st_size<=2_000_000 or original.stat().st_size>2_000_000:continue
            name='converted/'+relative.as_posix()
            result[name]={'path':name,'sha256':sha(working.read_bytes()),'original_sha256':sha(original.read_bytes()),'bytes':working.stat().st_size}
        return result

    def prepare(self,arguments):
        if not isinstance(arguments,dict) or arguments.get('feature') not in FEATURES:
            raise ValueError('offline_edits 必须指定 leaderboard/multiplayer/advertising/payments 中的一项')
        evidence=arguments.get('evidence')
        if not isinstance(evidence,str) or not evidence.strip():raise ValueError('必须说明已读取源码中的入口、调用及删除范围')
        return super().prepare(arguments)

    def apply(self,arguments):
        result=super().apply(arguments)
        self.purpose='单机功能移除：'+arguments['feature']+'；'+arguments['evidence'][:600]+'；'+self.purpose
        result['scope']='User-authorized offline feature removal in working copy; actual reverification required'
        return result
