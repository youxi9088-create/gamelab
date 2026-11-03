import sys
import unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'executors'))
from discovered_web import validate_control_batch


class InputControlsTests(unittest.TestCase):
    def test_wheel_real_input_protocol_and_bounds(self):
        action={'type':'wheel','x':500,'y':400,'delta_y':-100,'ticks':9}
        validate_control_batch([action])
        for patch in ({'ticks':13},{'ticks':True},{'delta_y':float('nan')},{'delta_y':0},{'x':-1},{'delta_y':1201}):
            with self.assertRaises(ValueError):validate_control_batch([{**action,**patch}])
        with self.assertRaises(ValueError):validate_control_batch([{'type':'reload'},action])
    def test_general_game_keys_and_invalid_batch(self):
        for key in ('e','q','f','h','1','W','Tab','ArrowUp'):
            validate_control_batch([{'type':'key','key':key}])
        for action in ({'type':'key','key':'Control+R'},{'type':'keyDown','key':'w'},None):
            with self.assertRaises(ValueError):validate_control_batch([action])
        with self.assertRaises(ValueError):validate_control_batch([{'type':'reload'},{'type':'key','key':'w'}])
