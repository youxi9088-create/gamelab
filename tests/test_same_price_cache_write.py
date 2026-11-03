import unittest
from controlplane.usage import estimate,cost_bounds

class SamePriceCacheWriteTests(unittest.TestCase):
 def test_missing_cache_bounds_preserve_unknown_count(self):
  row={'input_tokens':1000,'output_tokens':100,'cached_input_tokens':None,'cache_write_tokens':None}
  rate={'currency':'CNY','input_per_million':6.5,'output_per_million':27,'cached_input_per_million':1.3}
  bounds=cost_bounds(row,rate);self.assertAlmostEqual(bounds['lower'],.004);self.assertAlmostEqual(bounds['upper'],.0092)
  self.assertTrue(bounds['cache_assumed']);self.assertIsNone(row['cached_input_tokens'])
 def test_unknown_write_split_does_not_change_total_if_same_price(self):
  rate={'currency':'CNY','input_per_million':20,'output_per_million':100,'cached_input_per_million':2,'cache_write_per_million':20}
  base={'input_tokens':1000,'output_tokens':100,'cached_input_tokens':200,'cache_write_tokens':None}
  unknown=estimate(base,rate)
  self.assertAlmostEqual(unknown['estimated_cost'],.0264)
  self.assertTrue(unknown['cache_write_billed_at_input_rate']);self.assertIsNone(base['cache_write_tokens'])
  for writes in (0,100,800):self.assertAlmostEqual(estimate({**base,'cache_write_tokens':writes},rate)['estimated_cost'],unknown['estimated_cost'])
 def test_different_write_price_still_requires_evidence(self):
  rate={'currency':'CNY','input_per_million':20,'output_per_million':100,'cache_write_per_million':25}
  row={'input_tokens':1000,'output_tokens':100,'cache_write_tokens':None}
  self.assertIsNone(estimate(row,rate)['estimated_cost'])
 def test_unknown_discounted_read_or_usage_stays_unknown(self):
  rate={'currency':'CNY','input_per_million':20,'output_per_million':100,'cached_input_per_million':2,'cache_write_per_million':20}
  self.assertIsNone(estimate({'input_tokens':1000,'output_tokens':100,'cached_input_tokens':None,'cache_write_tokens':None},rate)['estimated_cost'])
  self.assertIsNone(estimate({'input_tokens':None,'output_tokens':100,'cached_input_tokens':0,'cache_write_tokens':None},rate)['estimated_cost'])

if __name__=='__main__':unittest.main()
