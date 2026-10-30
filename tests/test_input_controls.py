import sys
import unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'executors'))
from discovered_web import validate_control_batch


class InputControlsTests(unittest.TestCase):
    def test_general_game_keys_and_invalid_batch(self):
        for key in ('e','q','f','h','1','W','Tab','ArrowUp'):
            validate_control_batch([{'type':'key','key':key}])
        for action in ({'type':'key','key':'Control+R'},{'type':'keyDown','key':'w'},None):
            with self.assertRaises(ValueError):validate_control_batch([action])
        with self.assertRaises(ValueError):validate_control_batch([{'type':'reload'},{'type':'key','key':'w'}])
