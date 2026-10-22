import io
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
from controlplane.usage import record, validate_pricing, aggregate
from controlplane.store import Store
from controlplane.ai_provider import _complete, USAGE_SINK


class TieredPricingTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory();self.addCleanup(self.tmp.cleanup)
        self.store=Store(Path(self.tmp.name)/'isolated.sqlite')
        self.job={'id':'fixture','candidate_id':'fixture','round':1}
        self.rates=validate_pricing({'api:fixture':{'currency':'USD','input_per_million':10,
            'output_per_million':50,'cached_input_per_million':1,'cache_write_per_million':12.5,
            'long_context':{'threshold':272000,'input_per_million':20,'output_per_million':75,
                            'cached_input_per_million':2,'cache_write_per_million':25}}})

    def save(self, **extra):
        value={'call_id':str(extra),'provider':'api','model':'fixture','input_tokens':100000,
               'output_tokens':1000,'cached_input_tokens':20000,'cache_write_tokens':10000,**extra}
        with self.store.tx() as db:return record(self.store,db,self.job,value,self.rates)

    def test_cache_partition_threshold_entire_request_and_snapshot(self):
        self.assertAlmostEqual(self.save()['estimated_cost'],.895)
        normal=self.save(input_tokens=272000)
        self.assertEqual(normal['pricing_band'],'standard')
        long=self.save(input_tokens=272001)
        self.assertEqual(long['pricing_band'],'long_context')
        self.assertAlmostEqual(long['estimated_cost'],(242001*20+20000*2+10000*25+1000*75)/1e6)
        self.assertEqual(sum(long['cost_breakdown'].values()),long['estimated_cost'])
        with self.store.tx() as db:
            original=record(self.store,db,self.job,{'call_id':'immutable','provider':'api','model':'fixture','input_tokens':100,'output_tokens':1,'cached_input_tokens':0,'cache_write_tokens':0},self.rates)
            self.assertEqual(record(self.store,db,self.job,{'call_id':'immutable'},{}),original)

    def test_missing_is_unknown_and_invalid_partition_rejected(self):
        for field in ('cached_input_tokens','cache_write_tokens','input_tokens','output_tokens'):
            self.assertIsNone(self.save(**{field:None})['estimated_cost'])
        self.assertIsNone(self.save(service_tier='priority')['estimated_cost'])
        with self.assertRaises(ValueError):self.save(cached_input_tokens=95000)
        with self.assertRaises(ValueError):self.save(cache_write_tokens=True)
        bad=json.loads(json.dumps(self.rates));del bad['api:fixture']['long_context']['cache_write_per_million']
        with self.assertRaises(ValueError):validate_pricing(bad)

    def test_period_totals_do_not_add_cache_to_input(self):
        row=self.save()
        for period in ('day','week','month'):
            total=aggregate([row],period)[0]
            self.assertEqual((total['input_tokens'],total['output_tokens'],total['cached_input_tokens'],total['cache_write_tokens']),(100000,1000,20000,10000))
            self.assertEqual(total['cache_known_calls'],1)
            self.assertAlmostEqual(total['costs']['USD'],.895)

    def test_response_and_chat_usage_preserve_cache_even_on_parse_failure(self):
        for protocol in ('responses','chat_completions'):
            for valid in (True,False):
                text='{"ok":true}' if valid else 'bad-json'
                details={'cached_tokens':30,'cache_write_tokens':20}
                envelope=({'output':[{'content':[{'type':'output_text','text':text}]}],
                    'usage':{'input_tokens':100,'output_tokens':5,'input_tokens_details':details}}
                    if protocol=='responses' else {'choices':[{'message':{'content':text}}],
                    'usage':{'prompt_tokens':100,'completion_tokens':5,'prompt_tokens_details':details}})
                envelope['service_tier']='default'
                response=io.BytesIO(json.dumps(envelope).encode());response.headers={'Content-Type':'application/json'}
                rows=[];token=USAGE_SINK.set(rows.append)
                try:
                    with patch('urllib.request.build_opener') as opener:
                        opener.return_value.open.return_value=response
                        config={'backend':'api','base_url':'https://example.org','model':'fixture','api_key':'fixture','wire_api':protocol}
                        if valid:self.assertTrue(_complete([],config)[0]['ok'])
                        else:
                            with self.assertRaises(RuntimeError):_complete([],config)
                finally:USAGE_SINK.reset(token)
                self.assertEqual(len(rows),1)
                self.assertEqual((rows[0]['input_tokens'],rows[0]['cached_input_tokens'],rows[0]['cache_write_tokens']),(100,30,20))
