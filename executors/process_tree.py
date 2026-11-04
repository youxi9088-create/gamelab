"""Terminate an owned, still-live browser host together with its descendants."""
import os
import subprocess
import warnings


def terminate_owned_process(process):
    if process.poll() is not None:
        return
    if os.name == 'nt':
        try:
            subprocess.run(['taskkill', '/PID', str(process.pid), '/T', '/F'],
                           capture_output=True, timeout=20,
                           creationflags=subprocess.CREATE_NO_WINDOW)
        except subprocess.TimeoutExpired:
            # taskkill may hang after already terminating the tree. Recheck the
            # owned Popen handle before attempting any further PID-based action.
            if process.poll() is None:
                try:
                    subprocess.run(['taskkill', '/PID', str(process.pid), '/T', '/F'],
                                   capture_output=True, timeout=8,
                                   creationflags=subprocess.CREATE_NO_WINDOW)
                except subprocess.TimeoutExpired:
                    warnings.warn('Owned browser tree cleanup timed out twice; descendant termination unconfirmed', RuntimeWarning)
    if process.poll() is None:
        process.kill()
    process.wait(timeout=8)
