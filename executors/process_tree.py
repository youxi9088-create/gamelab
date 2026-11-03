"""Terminate an owned, still-live browser host together with its descendants."""
import os
import subprocess


def terminate_owned_process(process):
    if process.poll() is not None:
        return
    if os.name == 'nt':
        subprocess.run(['taskkill', '/PID', str(process.pid), '/T', '/F'],
                       capture_output=True, timeout=20,
                       creationflags=subprocess.CREATE_NO_WINDOW)
    if process.poll() is None:
        process.kill()
    process.wait(timeout=8)
