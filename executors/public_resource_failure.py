"""A bounded public GET transport failure is not a game-code defect."""
import hashlib
from urllib.parse import urlsplit

class PublicResourceTransportError(ConnectionError):
    def __init__(self,url,attempts):
        source=urlsplit(url)
        self.resource_transport_failure={'host':source.hostname,'path':source.path,
            'url_sha256':hashlib.sha256(url.encode()).hexdigest(),'attempts':attempts,
            'scope':'Public static GET transport unavailable; HTTP status and file absence are not established'}
        super().__init__('公开资源传输受阻（'+str(attempts)+'次）：'+str(source.hostname)+source.path+'；需来源恢复或可用下载通道后续接，不修改游戏逻辑冒充修复')
