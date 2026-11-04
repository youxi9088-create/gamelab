import os
from pathlib import Path
import subprocess
import sys
import tempfile
import time
import unittest
from unittest.mock import patch, Mock

sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'executors'))
from process_tree import terminate_owned_process
from acquisition import _browser_run


@unittest.skipUnless(os.name=='nt','Windows executor process tree')
class BrowserProcessTreeTests(unittest.TestCase):
    def test_taskkill_timeout_after_tree_exit_preserves_original_failure(self):
        host=Mock(pid=123)
        host.poll.side_effect=[None,0,0]
        with patch('process_tree.subprocess.run',side_effect=subprocess.TimeoutExpired('taskkill',20)) as run:
            terminate_owned_process(host)
        self.assertEqual(run.call_count,1)
        host.kill.assert_not_called()
        host.wait.assert_called_once_with(timeout=8)

    def test_taskkill_timeout_retries_tree_before_host_fallback(self):
        host=Mock(pid=123)
        host.poll.return_value=None
        with patch('process_tree.subprocess.run',side_effect=subprocess.TimeoutExpired('taskkill',20)) as run:
            terminate_owned_process(host)
        self.assertEqual(run.call_count,2)
        self.assertIn('/T',run.call_args.args[0])
        host.kill.assert_called_once()
        host.wait.assert_called_once_with(timeout=8)

    def test_timeout_cleanup_terminates_owned_host_and_child(self):
        import ctypes
        kernel=ctypes.WinDLL('kernel32',use_last_error=True)
        kernel.OpenProcess.restype=ctypes.c_void_p
        kernel.WaitForSingleObject.argtypes=[ctypes.c_void_p,ctypes.c_uint32]
        kernel.CloseHandle.argtypes=[ctypes.c_void_p]
        with tempfile.TemporaryDirectory() as tmp:
            marker=Path(tmp)/'child.pid'
            code='import subprocess,sys,time;from pathlib import Path;p=subprocess.Popen([sys.executable,"-c","import time;time.sleep(60)"]);marker=Path(sys.argv[1]+".tmp");marker.write_text(str(p.pid));marker.replace(sys.argv[1]);time.sleep(60)'
            host=subprocess.Popen([sys.executable,'-c',code,str(marker)],creationflags=subprocess.CREATE_NO_WINDOW)
            child=None
            try:
                end=time.monotonic()+10
                while not marker.exists() and time.monotonic()<end:time.sleep(.05)
                self.assertTrue(marker.exists())
                child=kernel.OpenProcess(0x00100000,False,int(marker.read_text()))
                self.assertTrue(child)
                real_popen=subprocess.Popen
                def owned_process(command,**kwargs):
                    return host if command==['owned-fixture'] else real_popen(command,**kwargs)
                with patch('acquisition.subprocess.Popen',side_effect=owned_process):
                    with self.assertRaises(subprocess.TimeoutExpired) as caught:
                        _browser_run(['owned-fixture'],env=dict(os.environ),timeout=.05)
                self.assertEqual(caught.exception.infrastructure_failure['kind'],'acquisition_process_timeout')
                self.assertIsNotNone(host.poll())
                self.assertEqual(kernel.WaitForSingleObject(child,5000),0)
            finally:
                if host.poll() is None:terminate_owned_process(host)
                if child:kernel.CloseHandle(child)
