import unittest
from controlplane.pipeline import timeline
class WorkflowDisplayTests(unittest.TestCase):
 def test_revision_hides_unused_steps_and_keeps_reuse(self):
  job=dict(id='j',stage='reconstruct',status='running',continuation=True,round=2,conversion_plan={'route':'revision'})
  events=[dict(id='e',job_id='j',node='acquire',node_status='reused',round=2),dict(id='a',job_id='j',node='adapt',node_status='running',round=2)]
  p=timeline(job,events,[]);keys=[n['key'] for n in p['visible_nodes']]
  self.assertNotIn('identify',keys);self.assertNotIn('repair',keys);self.assertNotIn('publish',keys)
  self.assertIn('acquire',keys);self.assertIn('test',keys)
  self.assertEqual(p['presentation']['current_title'],'继续修复与适配已有版本')
 def test_actual_repair_never_hidden(self):
  j=dict(id='j',stage='rea',status='running',round=1,conversion_plan={'route':'discovered-web'})
  p=timeline(j,[dict(id='e',job_id='j',node='repair',node_status='running',round=1,parent_node='test')],[])
  self.assertIn('repair',[n['key'] for n in p['visible_nodes']])
 def test_import_does_not_invent_conversion_work(self):
  p=timeline(dict(id='j',stage='packaging',status='review',version_id='v'),[],[dict(id='v',job_id='j',status='review')])
  self.assertEqual([n['key'] for n in p['visible_nodes']],['delivery','review'])
 def test_original_package_is_not_ai_creation(self):
  j=dict(id='j',stage='reconstruct',status='running',conversion_plan={'route':'discovered-web'})
  p=timeline(j,[],[])
  self.assertEqual(p['presentation']['current_title'],'适配原包运行环境')
 def test_old_repair_not_current_requirement(self):
  j=dict(id='j',stage='reconstruct',status='queued',continuation=True,round=2)
  p=timeline(j,[dict(id='e',job_id='j',node='repair',node_status='failed',round=1)],[])
  self.assertNotIn('repair',[n['key'] for n in p['visible_nodes']])
  self.assertTrue(next(n for n in p['nodes'] if n['key']=='repair')['records'])
