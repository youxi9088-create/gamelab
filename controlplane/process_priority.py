"""Protect control-plane callbacks from CPU-bound software rendering on Windows."""
import os

def prioritize_control_plane():
    if os.name!='nt':return None
    import ctypes
    from ctypes import wintypes
    kernel=ctypes.WinDLL('kernel32',use_last_error=True)
    kernel.GetCurrentProcess.restype=wintypes.HANDLE
    kernel.GetPriorityClass.argtypes=[wintypes.HANDLE]
    kernel.GetPriorityClass.restype=wintypes.DWORD
    kernel.SetPriorityClass.argtypes=[wintypes.HANDLE,wintypes.DWORD]
    kernel.SetPriorityClass.restype=wintypes.BOOL
    process=kernel.GetCurrentProcess();current=kernel.GetPriorityClass(process)
    if not current:raise ctypes.WinError(ctypes.get_last_error())
    if current in (0x8000,0x80,0x100):return current
    if not kernel.SetPriorityClass(process,0x8000):raise ctypes.WinError(ctypes.get_last_error())
    return kernel.GetPriorityClass(process)
