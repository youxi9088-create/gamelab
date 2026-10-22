import os
import unittest
from unittest.mock import patch, Mock
from controlplane.runtime import node_binary
from controlplane.executor import Executor


class RuntimeReadinessTest(unittest.TestCase):
    def test_invalid_explicit_node_does_not_fall_back(self):
        with patch.dict(os.environ, {'NODE_BINARY':'missing-node-12345'}), patch('controlplane.runtime.shutil.which', return_value=None):
            self.assertIsNone(node_binary())

    def test_alive_worker_without_node_is_not_ready(self):
        executor=Executor(None,8765)
        executor.process=Mock();executor.process.poll.return_value=None
        with patch('controlplane.runtime.node_binary',return_value=None):
            result=executor.health()
        self.assertFalse(result['ready'])
        self.assertFalse(result['checks']['node'])

    def test_browser_failure_blocks_readiness(self):
        executor=Executor(None,8765)
        executor.process=Mock();executor.process.poll.return_value=None
        result=Mock(stdout='{"checks":{"rea":true,"playwright":true,"browser":false}}',returncode=0)
        with patch('controlplane.runtime.node_binary',return_value='node'),patch('controlplane.executor.subprocess.run',return_value=result):
            self.assertFalse(executor.health()['ready'])

    def test_native_rea_analysis_failure_blocks_readiness(self):
        executor=Executor(None,8765)
        executor.process=Mock();executor.process.poll.return_value=None
        result=Mock(stdout='{"checks":{"rea":true,"rea-analysis":false,"playwright":true,"browser":true}}',returncode=0)
        with patch('controlplane.runtime.node_binary',return_value='node'),patch('controlplane.executor.subprocess.run',return_value=result):
            status=executor.health()
        self.assertFalse(status['ready'])
        self.assertFalse(status['checks']['rea-analysis'])

    def test_incomplete_probe_cannot_report_ready(self):
        executor=Executor(None,8765)
        executor.process=Mock();executor.process.poll.return_value=None
        result=Mock(stdout='{"checks":{}}',returncode=0)
        with patch('controlplane.runtime.node_binary',return_value='node'),patch('controlplane.executor.subprocess.run',return_value=result):
            self.assertFalse(executor.health()['ready'])
