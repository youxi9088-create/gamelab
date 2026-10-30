import unittest
from controlplane.source_routing import modular_candidate,hidden_frame_urls


class HiddenFrameRoutingTests(unittest.TestCase):
    def test_hidden_portal_excluded_but_ambiguity_preserved(self):
        a='https://g-main.games.remix.gg/versions/one'
        b='https://g-portal.games.remix.gg/versions/two'
        d=dict(iframe_hints=[dict(url=u,evidence='iframe-src',width=800,height=600) for u in (a,b)])
        o={'web_discovery':d}
        self.assertIsNone(modular_candidate(o))
        d['iframe_states']=[dict(url=a,visible=True),dict(url=b,visible=False)]
        self.assertEqual(modular_candidate(o),a)
        d['iframe_states'].append(dict(url=b,visible=True))
        self.assertEqual(hidden_frame_urls(o),set())
        self.assertIsNone(modular_candidate(o))
        d['iframe_states']=[dict(url=a,visible=False),dict(url=b,visible=False)]
        self.assertIsNone(modular_candidate(o))
