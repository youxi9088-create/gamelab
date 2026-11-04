import unittest,tempfile
from pathlib import Path
from controlplane.resource_audit import javascript_requests,audit
class TemplateReferencesTests(unittest.TestCase):
 def test_regex_quotes_do_not_corrupt_following_html_template(self):
  text="const clean=s=>s.replace(/[&<>\"']/g,''); const html=`<input id=\"save-import\" accept=\".json\">`;fetch('missing.json');"
  self.assertEqual([r['reference'] for r in javascript_requests(text)],['missing.json'])
 def test_nested_templates_are_not_imports(self):
  text='const html=`${items.map(x=>`<i>${x}</i>`).join("")}<input id="save-import" accept=".json"><button data-action="import">TUO</button>`;'
  self.assertEqual(javascript_requests(text),[])
 def test_requests_inside_template_expressions_remain_audited(self):
  refs=javascript_requests('const html=`${fetch("/api/scores")} ${`nested ${import("./real.js")}`}`;')
  self.assertEqual({r['reference'] for r in refs},{'/api/scores','./real.js'})
 def test_literal_templates_and_real_missing_files_still_block(self):
  with tempfile.TemporaryDirectory() as d:
   p=Path(d);(p/'index.html').write_text('<script src="main.js"></script>');(p/'main.js').write_text('fetch(`assets/missing.mp3`);')
   self.assertEqual(audit(p)['missing'][0]['reference'],'assets/missing.mp3')
 def test_dynamic_template_is_not_a_literal_directory_request(self):
  self.assertEqual(javascript_requests('fetch(`assets/audio/${name}.mp3`);'),[])

 def test_concatenated_directory_prefix_is_not_a_file(self):
  self.assertEqual(javascript_requests('new Audio("assets/audio/"+name+".mp3");'),[])
 def test_literal_first_argument_with_options_remains_checked(self):
  self.assertEqual(javascript_requests('fetch("missing.json", {cache:"reload"});')[0]['reference'],'missing.json')

class SupplyFeedbackInputTests(unittest.TestCase):
 def test_feedback_is_scoped_and_not_written_to_history(self):
  from controlplane.service import Service
  with tempfile.TemporaryDirectory() as d:
   p=Path(d);s=Service(p/'data',p/'repo','http://127.0.0.1:8766')
   with s.store.tx() as db:
    s.store.put(db,'supply',{'id':'old','candidate_id':'game','status':'blocked','error_code':'MISSING_LOCAL_RESOURCE','notice':'missing audio'})
    s.store.put(db,'supply',{'id':'other','candidate_id':'other','status':'blocked','notice':'unrelated'})
    result=s.continuation_input(db,{'candidate_id':'game'},{'id':'game'})
    self.assertIn('missing audio',result['conversation'][-1]['text'])
    self.assertNotIn('unrelated',result['conversation'][-1]['text'])
    self.assertEqual(s.store.all(db,'messages'),[])
