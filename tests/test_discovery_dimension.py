import unittest
from controlplane.discovery_scan import dimension_evidence,Page
class DimensionTests(unittest.TestCase):
 def test_game_evidence(self):
  self.assertEqual(dimension_evidence({},'A 2D platformer'),'2d')
  self.assertEqual(dimension_evidence({},'2D controls in a 3D world'),'3d')
  self.assertEqual(dimension_evidence({},'platformer'),'unknown')
  self.assertEqual(Page('<nav>2D games</nav><meta name="description" content="puzzle">').game_metadata()['dimension'],'unknown')
if __name__=='__main__':unittest.main()
