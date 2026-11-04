from pathlib import Path
import sys
import os
import tempfile
import unittest
from unittest.mock import Mock,patch
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'executors'))
from auto_repair import CHAT,guarded
from infrastructure_recovery import classify,recover


class Budget:
    calls=5
    def remaining(self,n):return n


class InfrastructureRecoveryTests(unittest.TestCase):
    def test_webgl_context_failure_gets_bounded_session_recovery_without_game_edits(self):
        with tempfile.TemporaryDirectory() as tmp:
            error=RuntimeError('Runtime script error: Error: Error creating WebGL context.')
            attempt=Mock(side_effect=error)
            model=Mock(side_effect=AssertionError('Do not modify game for graphics context failure'))
            token=CHAT.set(model)
            try:
                for _ in range(2):
                    with self.assertRaises(RuntimeError):guarded(attempt,Path(tmp),Budget())
            finally:CHAT.reset(token)
            self.assertEqual(attempt.call_count,3);model.assert_not_called()
            self.assertEqual(error.infrastructure_failure['kind'],'verifier_webgl_context_failure')
    def test_public_transfer_failure_retains_resource_identity_without_game_edits(self):
        import json
        from public_resource_failure import PublicResourceTransportError
        error=PublicResourceTransportError('https://assets.example/game/model.glb?token=private',3)
        model=Mock(side_effect=AssertionError('Cannot repair a network path by editing a game'))
        with tempfile.TemporaryDirectory() as tmp:
            attempt=Mock(side_effect=error);token=CHAT.set(model)
            try:
                with self.assertRaises(PublicResourceTransportError):guarded(attempt,Path(tmp),Budget())
            finally:CHAT.reset(token)
        model.assert_not_called();self.assertEqual(attempt.call_count,1)
        self.assertEqual(error.infrastructure_failure['owner'],'source_access')
        self.assertNotIn('private',str(error)+json.dumps(error.resource_transport_failure))
    def test_only_internal_deployment_navigation_is_a_verifier_timeout(self):
        self.assertEqual(classify(RuntimeError('page.goto: Timeout 30000ms navigating to https://replica-runtime.invalid/')),'verifier_navigation_timeout')
        self.assertIsNone(classify(RuntimeError('page.goto: Timeout 30000ms navigating to https://public.example/game/')))
    def test_capture_recovery_scopes_browser_mode_to_its_owned_session(self):
        with tempfile.TemporaryDirectory() as tmp,patch.dict(os.environ,{'BROWSER_HEADLESS':'false','BROWSER_WEBGL_BACKEND':'swiftshader'}):
            error=RuntimeError('Viewport screenshot timed out')
            value=recover(error,tmp,Budget(),lambda:(os.environ['BROWSER_HEADLESS'],os.environ['BROWSER_WEBGL_BACKEND']))
            self.assertEqual(value,(True,('true','default')))
            self.assertEqual(os.environ['BROWSER_HEADLESS'],'false')
            self.assertEqual(os.environ['BROWSER_WEBGL_BACKEND'],'swiftshader')
    def test_only_endpoint_bound_timeouts_are_control_plane_failures(self):
        error=TimeoutError('timed out')
        self.assertIsNone(classify(error))
        error.platform_request_path='jobs/example/events'
        self.assertEqual(classify(error),'control_plane_timeout')
        with tempfile.TemporaryDirectory() as tmp:
            retry=Mock(side_effect=AssertionError('Do not multiply write retries'))
            self.assertEqual(recover(error,tmp,Budget(),retry),(False,None))
            retry.assert_not_called()
            self.assertEqual(error.infrastructure_failure['endpoint'],'jobs/example/events')
    def test_fresh_verification_can_recover_without_model_or_game_edits(self):
        with tempfile.TemporaryDirectory() as tmp:
            fn=Mock(side_effect=[RuntimeError('Web verify: Viewport screenshot timed out'),'actual runtime result'])
            model=Mock(side_effect=AssertionError('Must not send verifier failure to game repair'))
            token=CHAT.set(model)
            try:self.assertEqual(guarded(fn,Path(tmp),Budget()),'actual runtime result')
            finally:CHAT.reset(token)
            self.assertEqual(fn.call_count,2);model.assert_not_called()

    def test_persistent_capture_failure_has_one_durable_retry_and_stays_blocked(self):
        with tempfile.TemporaryDirectory() as tmp:
            fn=Mock(side_effect=RuntimeError('Viewport screenshot timed out'))
            model=Mock(side_effect=AssertionError('Must not patch game'))
            token=CHAT.set(model)
            try:
                for _ in range(2):
                    with self.assertRaises(RuntimeError) as caught:guarded(fn,Path(tmp),Budget())
                    self.assertEqual(caught.exception.infrastructure_failure['owner'],'platform')
            finally:CHAT.reset(token)
            self.assertEqual(fn.call_count,3);model.assert_not_called()
