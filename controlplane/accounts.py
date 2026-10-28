"""Project-shared accounts and persistent, revocable sessions."""
import hashlib
import hmac
import re
import secrets
import time
from .store import ident, now

ROLES={'admin','operator','viewer'}


def public(user):
    return {k:user[k] for k in ('id','username','role','enabled','created_at')}


def password_hash(password,salt=None):
    salt=salt or secrets.token_hex(16)
    return salt+':'+hashlib.pbkdf2_hmac('sha256',password.encode(),salt.encode(),600000).hex()


class Accounts:
    def __init__(self,store,username='',password=''):
        self.store=store
        with store.tx() as db:
            if username and not store.all(db,'users'):
                store.put(db,'users',dict(id=ident('user'),username=username,role='admin',enabled=True,
                    password_hash=password_hash(password),revision=1,created_at=now()))

    def enabled(self):
        with self.store.tx() as db:return bool(self.store.all(db,'users'))

    def login(self,username,password):
        if not isinstance(username,str) or not isinstance(password,str) or len(password)>1024:return None
        with self.store.tx() as db:
            user=next((u for u in self.store.all(db,'users') if u['username']==username),None)
            hashed=user['password_hash'] if user else password_hash('unavailable')
            valid=hmac.compare_digest(password_hash(password,hashed.split(':')[0]),hashed)
            if not user or not user['enabled'] or not valid:return None
            token=secrets.token_urlsafe(32)
            row=dict(id=hashlib.sha256(token.encode()).hexdigest(),user_id=user['id'],revision=user['revision'],
                csrf=secrets.token_urlsafe(24),expires=time.time()+43200,authenticated=True)
            self.store.put(db,'portal_sessions',row)
            self.store.event(db,'用户登录',actor_id=user['id'],actor_name=user['username'],stage='auth')
            return token,{**row,'user':public(user)}

    def session(self,token):
        if not token:return None
        with self.store.tx() as db:
            row=self.store.get(db,'portal_sessions',hashlib.sha256(token.encode()).hexdigest())
            if not row or row['expires']<=time.time():return None
            user=self.store.get(db,'users',row['user_id'])
            if not user or not user['enabled'] or user['revision']!=row['revision']:return None
            return {**row,'user':public(user)}

    def logout(self,token):
        if token:
            with self.store.tx() as db:db.execute("DELETE FROM records WHERE kind='portal_sessions' AND id=?",(hashlib.sha256(token.encode()).hexdigest(),))

    def list(self):
        with self.store.tx() as db:return [public(u) for u in self.store.all(db,'users')]

    def save(self,body,actor):
        from .service import require
        with self.store.tx() as db:
            users=self.store.all(db,'users')
            old=self.store.get(db,'users',body.get('id','')) if body.get('id') else None
            require(not body.get('id') or old,'账号不存在',404)
            username=(old or {}).get('username') or str(body.get('username','')).strip()
            require(bool(re.fullmatch(r'[A-Za-z0-9_.@-]{3,80}',username)),'账号须为3至80位字母、数字或 . _ @ -')
            require(not any(u['username']==username and u['id']!=(old or {}).get('id') for u in users),'账号已存在',409)
            role=body.get('role',(old or {}).get('role','viewer'));require(role in ROLES,'角色无效')
            enabled=body.get('enabled',(old or {}).get('enabled',True));require(type(enabled)==bool,'启用状态无效')
            password=body.get('password','');require(isinstance(password,str),'密码格式无效')
            require(old or password,'请设置初始密码')
            if password:require(12<=len(password)<=256,'密码长度应为12至256位')
            if old and old['role']=='admin' and old['enabled'] and (role!='admin' or not enabled):
                require(any(u['id']!=old['id'] and u['role']=='admin' and u['enabled'] for u in users),'至少保留一名启用的管理员')
            row={**(old or {}),'id':(old or {}).get('id',ident('user')),'username':username,'role':role,'enabled':enabled,
                 'revision':(old or {}).get('revision',0)+1,'created_at':(old or {}).get('created_at',now())}
            if password:row['password_hash']=password_hash(password)
            self.store.put(db,'users',row)
            self.store.event(db,'更新账号' if old else '创建账号',stage='accounts',actor_id=actor['id'],target_user_id=row['id'])
            return public(row)


def authorize(user,path,mutation=False):
    from .service import require
    role=user.get('role','viewer')
    if path=='/api/auth/logout':return
    if role=='admin':return
    if not mutation:
        require(not path.startswith('/api/accounts') and path!='/api/operations','需要管理员权限',403)
        return
    require(role=='operator','只读账号不能修改数据',403)
    parts=path.strip('/').split('/')
    discovery_actions=path in ('/api/discovery/decision','/api/discovery/approve','/api/discovery/reject','/api/discovery/dispatch')
    allowed=path=='/api/conversions' or (len(parts)==4 and parts[1]=='jobs' and parts[3] in ('message','retry')) or (
        len(parts)==4 and parts[1]=='batches' and parts[3] in ('start','pause','resume','stop','retry')) or discovery_actions
    require(allowed,'此操作需要管理员权限',403)
