from pathlib import Path
b=Path(__file__).parent;p=b/'direct_smash_observation_server_startup_v2_20261118.py';assert not p.exists()
s=(b/'direct_smash_observation_server_resources_v1_20261118.py').read_text(encoding='utf8')
old="assert root==Path('D:/GameLab/temp/direct-smash-resources-localized-v1-20261118/candidate').resolve()"
new="assert root==Path('D:/GameLab/temp/direct-smash-startup-settings-v2-20261118/candidate').resolve()\nassert evidence==Path('D:/GameLab/temp/direct-smash-resources-localized-v1-20261118/validation-resources-v1-20261118').resolve()"
assert s.count(old)==1;s=s.replace(old,new);compile(s,'new-candidate-root-observer','exec');p.write_bytes(s.encode());print(p)
