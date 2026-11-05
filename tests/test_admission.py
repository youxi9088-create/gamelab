import copy
import unittest
from controlplane.admission import validate,MECHANISMS,INSTRUCTIONS

class AdmissionTests(unittest.TestCase):
    def setUp(self):
        self.item={'url':'https://example.org/play','gameplay':'Tap to fly. Short rounds. Restart to beat your best score. No further goals after two minutes.'}
        self.baselines=[{'id':'version-real'}]
        self.proposal={'mechanisms':{k:{'value':'短局可重玩追求最高分','quote':'Restart to beat your best score.'} for k in MECHANISMS},
                       'gates':{k:{'status':'pass','reason':'有实际机制依据；累计时长为推断','quotes':['Tap to fly.']} for k in ('originality','completeness','loop')}}
        self.proposal['gates']['originality'].update(baseline_id='version-real',interaction_changed=True,ui_changed=False,gameplay_changed=False)

    def test_short_rounds_replay_and_ui_or_interaction_change_remain_eligible(self):
        a=validate(self.item,self.proposal,self.baselines)
        self.assertEqual(a['status'],'eligible')
        self.assertEqual(a['quality']['status'],'not_tested')

    def test_one_failed_gate_filters_with_reason_and_quotes(self):
        self.proposal['gates']['completeness'].update(status='fail',failure_kind='exhausted_without_replay',reason='明确两分钟后没有继续目标',quotes=['No further goals after two minutes.'])
        a=validate(self.item,self.proposal,self.baselines)
        self.assertEqual(a['status'],'filtered')
        self.assertEqual(a['gates']['completeness']['quotes'],['No further goals after two minutes.'])

    def test_missing_evidence_and_fabricated_quotes_do_not_reject(self):
        for quote in ('','not in actual source'):
            p=copy.deepcopy(self.proposal)
            for gate in p['gates'].values():gate.update(status='fail',quotes=[quote])
            self.assertEqual(validate(self.item,p,self.baselines)['status'],'unknown')

    def test_same_genre_or_unknown_template_cannot_prove_reskin(self):
        g=self.proposal['gates']['originality'];g.update(status='fail',failure_kind='exact_reskin',baseline_id='imaginary',interaction_changed=False,ui_changed=False,gameplay_changed=False)
        self.assertEqual(validate(self.item,self.proposal,self.baselines)['status'],'unknown')
        g['baseline_id']='version-real';g['ui_changed']=True
        self.assertEqual(validate(self.item,self.proposal,self.baselines)['status'],'unknown')
        g['ui_changed']=False
        self.assertEqual(validate(self.item,self.proposal,self.baselines)['status'],'filtered')

    def test_missing_mechanisms_cannot_pass_from_information_score(self):
        self.proposal['mechanisms']={}
        self.item['selection_score']={'value':100}
        self.assertEqual(validate(self.item,self.proposal,self.baselines)['status'],'unknown')

    def test_engineering_failure_is_not_an_admission_veto(self):
        self.item['gameplay']='The game failed to load.'
        self.proposal['gates']={'loop':{'status':'fail','failure_kind':'loading_error','reason':'加载失败','quotes':['failed to load']}}
        self.assertEqual(validate(self.item,self.proposal,self.baselines)['status'],'unknown')
