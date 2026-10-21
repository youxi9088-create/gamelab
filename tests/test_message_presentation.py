import unittest
from controlplane.conversations import message_presentation


class MessagePresentationTest(unittest.TestCase):
    def test_classification_is_evidence_based_and_read_only(self):
        original = dict(role='assistant', job_id='j', text='请提供登录接口')
        self.assertEqual(message_presentation(original, [], [], []), 'legacy')
        self.assertEqual(message_presentation(original, [dict(id='j',question=original['text'])], [], []), 'question')
        self.assertEqual(message_presentation(original, [], [dict(job_id='j',stage='work-log',message=original['text'])], []), 'progress')
        self.assertNotIn('presentation', original)
        self.assertEqual(message_presentation(dict(original,kind='reply'), [], [], []), 'reply')
        self.assertEqual(message_presentation(dict(original,role='user'), [], [], []), 'request')
        self.assertEqual(message_presentation(original, [], [dict(job_id='other',stage='work-log',message=original['text'])], []), 'legacy')

    def test_old_question_survives_continuation(self):
        message=dict(role='assistant', job_id='j', text='需要哪种操作？')
        rounds=[dict(original_job_id='j',question=message['text'])]
        self.assertEqual(message_presentation(message,[],[],rounds),'question')
