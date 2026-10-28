import sys
import unittest
from pathlib import Path
from unittest import mock

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'executors'))
from acquisition import _run_acquire  # noqa: E402


class Completed:
    def __init__(self, returncode, stderr=b''):
        self.returncode = returncode
        self.stderr = stderr


class AcquisitionRetryTest(unittest.TestCase):
    def _run(self, results):
        with mock.patch('acquisition.time.sleep'), \
             mock.patch('acquisition.subprocess.run', side_effect=results) as runner:
            result, detail = _run_acquire(['node'], 'https://example.org/g', Path('d'), {}, 240)
        return result, detail, runner.call_count

    def test_network_flake_is_retried(self):
        result, detail, calls = self._run([Completed(1, b'page.goto: net::ERR_CONNECTION_CLOSED at https://poki.com/zh/g/x')] * 3)
        self.assertEqual(1, result.returncode)
        self.assertIn('ERR_CONNECTION_CLOSED', detail)
        self.assertEqual(3, calls, '网络抖动应该重试，而不是第一轮就交给人工')

    def test_recovered_after_retry_returns_success(self):
        result, detail, calls = self._run([Completed(1, b'net::ERR_CONNECTION_RESET'), Completed(0)])
        self.assertEqual(0, result.returncode)
        self.assertEqual('', detail)
        self.assertEqual(2, calls)

    def test_non_network_failure_is_not_retried(self):
        result, detail, calls = self._run([Completed(1, '入口已取得，运行契约尚未配置 at detect'.encode())] * 3)
        self.assertEqual(1, result.returncode)
        self.assertEqual(1, calls, '能力类失败重试没有意义，不要白跑')

    def test_slow_failure_is_not_retried(self):
        """慢失败更像是站点真的连不上，重试只会吃掉整轮预算。"""
        def slow(*args, **kwargs):
            with mock.patch('acquisition.time.monotonic', side_effect=[0, 500]):
                pass
            return Completed(1, b'net::ERR_CONNECTION_CLOSED')

        with mock.patch('acquisition.time.sleep'), \
             mock.patch('acquisition.time.monotonic', side_effect=[0, 500, 500, 900, 900, 1300]), \
             mock.patch('acquisition.subprocess.run', side_effect=[Completed(1, b'net::ERR_CONNECTION_CLOSED')] * 3) as runner:
            result, detail = _run_acquire(['node'], 'https://example.org/g', Path('d'), {}, 240)
        self.assertEqual(1, runner.call_count)
        self.assertEqual(1, result.returncode)
