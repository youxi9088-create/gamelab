import os,unittest

@unittest.skipUnless(os.name=='nt','Windows scheduler regression')
class ControlPriorityTests(unittest.TestCase):
 def test_inherited_background_priority_is_corrected_in_isolated_test_process(self):
  import ctypes
  from ctypes import wintypes
  from controlplane.process_priority import prioritize_control_plane
  kernel=ctypes.WinDLL('kernel32',use_last_error=True)
  kernel.GetCurrentProcess.restype=wintypes.HANDLE
  kernel.GetPriorityClass.argtypes=[wintypes.HANDLE]
  kernel.SetPriorityClass.argtypes=[wintypes.HANDLE,wintypes.DWORD]
  process=kernel.GetCurrentProcess();original=kernel.GetPriorityClass(process)
  try:
   self.assertTrue(kernel.SetPriorityClass(process,0x4000))
   self.assertEqual(prioritize_control_plane(),0x8000)
   self.assertEqual(prioritize_control_plane(),0x8000)
  finally:kernel.SetPriorityClass(process,original)
