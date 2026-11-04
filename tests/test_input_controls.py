import sys
import unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'executors'))
from discovered_web import validate_control_batch


class InputControlsTests(unittest.TestCase):
    def test_pointer_coordinates_use_current_viewport_before_execution(self):
        valid={'type':'click','x':560,'y':700,'hold_ms':120}
        validate_control_batch([valid],{'width':1000,'height':760})
        for change in ({'y':825},{'x':float('nan')},{'x':True},{'x':-1}):
            with self.assertRaisesRegex(ValueError,'动作尚未执行'):validate_control_batch([{**valid,**change}],{'width':1000,'height':760})
        validate_control_batch([{'type':'click','x':300,'y':825}],{'width':390,'height':844})
        with self.assertRaises(ValueError):validate_control_batch([{'type':'drag','x':10,'y':10,'to_x':400,'to_y':20}],{'width':390,'height':844})
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
