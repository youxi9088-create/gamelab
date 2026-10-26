"""Actual stage executions, including failed attempts and nested recovery."""
from contextvars import ContextVar
from collections import Counter
import uuid

TRACE = ContextVar('execution_trace', default=None)


class ExecutionTrace:
    def __init__(self, emit):
        self.emit = emit
        self.counts = Counter()
        self.stack = []
        self.last_failed_node = None

    def event(self, status, message):
        if self.stack:
            self.emit(**self.stack[-1], node_status=status, message=message)

    def run(self, node, fn, recovery=None):
        from controlplane.pipeline_presentation import STAGE_WORK
        from auto_repair import safe
        parent = self.stack[-1]['node'] if self.stack else None
        def attempt():
            self.counts[node] += 1
            frame = dict(node=node, execution_id=uuid.uuid4().hex,
                         node_attempt=self.counts[node], parent_node=parent)
            self.stack.append(frame)
            self.event('running', '正在'+STAGE_WORK[node][0])
            try:
                result = fn()
            except Exception as exc:
                self.last_failed_node = node
                self.event('failed', safe(exc))
                raise
            else:
                self.event('succeeded', STAGE_WORK[node][0]+'：本次操作完成，验证范围见记录。')
                return result
            finally:
                self.stack.pop()
        try:
            try:
                return attempt()
            except Exception as exc:
                if recovery is None or getattr(exc, 'auto_repair_attempted', False):
                    raise
                # No execution id: diagnosis is not another execution attempt.
                frame = dict(node=node, parent_node=parent)
                self.stack.append(frame)
                self.event('repairing', '本次执行异常，正在诊断；尚未重新执行。')
                try:
                    def retry():
                        self.event('retrying', '开始重新执行并验证；此前失败记录保留。')
                        return attempt()
                    recovered, result = recovery(exc, retry)
                    if recovered:
                        return result
                    self.event('failed', '修复未解除阻断：'+safe(exc))
                    exc.auto_repair_attempted = True
                    raise exc
                finally:
                    self.stack.pop()
        finally:
            if self.stack:
                self.event('resumed', '子步骤已结束，返回本步骤继续处理。')


def run_stage(node, fn, recovery=None):
    trace = TRACE.get()
    if trace:
        return trace.run(node, fn, recovery)
    return fn()
