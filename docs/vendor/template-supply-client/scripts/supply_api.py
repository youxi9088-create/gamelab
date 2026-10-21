#!/usr/bin/env python3
"""AI 游戏平台「模板供货」开放接口的标准库客户端：推送游戏 zip、查进度、查问题、撤回、轮询提醒。

凭据只从环境变量读取：SUPPLY_APP_ID、SUPPLY_APP_SECRET；平台基址 SUPPLY_PLATFORM_BASE（缺省见 DEFAULT_BASE）。
只用 Python 标准库；生产集成可把签名逻辑迁到你方后端语言，但原始 body、规范查询串与签名顺序必须一致。
"""

from __future__ import annotations

import argparse
import hashlib
import hmac
import json
import os
import re
import secrets
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

DEFAULT_BASE = "https://ai-game.new.ndhy.com"
PREFIX = "/v0.1/apecv/gameagent/supply/open"
# 推送请求里平台同步下载你的包（≤100MB、最长 300 秒），读超时要留余量
SUBMIT_TIMEOUT = 330
QUERY_TIMEOUT = 30

# watch 的轮询节奏（秒）：人工环节查勤了没用，在机器上跑时一分钟一次
POLL_INTERVAL = {
    "queued": 300, "received": 300,
    "analyzing": 60, "building": 60,
    "awaiting_platform_review": 1800, "template_ready": 1800, "certifying": 1800,
}
TERMINAL = {"published", "rejected", "failed", "canceled", "needs_your_fix"}


def required_env(name: str) -> str:
    value = os.environ.get(name, "").strip()
    if not value:
        raise SystemExit(f"缺少环境变量 {name}")
    return value


def credentials() -> tuple[str, str, str]:
    return (
        os.environ.get("SUPPLY_PLATFORM_BASE", DEFAULT_BASE).rstrip("/"),
        required_env("SUPPLY_APP_ID"),
        required_env("SUPPLY_APP_SECRET"),
    )


def fingerprint(secret: str) -> str:
    return hashlib.sha256(secret.encode()).hexdigest()[:12]


def encode_body(payload: dict[str, object] | None) -> bytes:
    if payload is None:
        return b""
    return json.dumps(payload, ensure_ascii=False, separators=(",", ":")).encode("utf-8")


def canonical_query(query: dict[str, str] | None) -> str:
    """与平台一致：键按字典序、application/x-www-form-urlencoded 编码、空值不发。"""
    items = sorted((k, str(v)) for k, v in (query or {}).items() if str(v) != "")
    return urllib.parse.urlencode(items)


def signing_string(app_id: str, timestamp: str, nonce: str, method: str, signed_path: str, body: bytes) -> str:
    return "\n".join([app_id, timestamp, nonce, method.upper(), signed_path, hashlib.sha256(body).hexdigest()])


def sign(secret: str, signing: str) -> str:
    return hmac.new(secret.encode(), signing.encode(), hashlib.sha256).hexdigest()


def signed_headers(app_id: str, secret: str, method: str, signed_path: str, body: bytes) -> dict[str, str]:
    timestamp = str(int(time.time()))
    nonce = secrets.token_hex(16)  # 每个请求新生成，重试也换新的
    return {
        "Content-Type": "application/json",
        "X-Supply-App-Id": app_id,
        "X-Supply-Timestamp": timestamp,
        "X-Supply-Nonce": nonce,
        "X-Supply-Signature": sign(secret, signing_string(app_id, timestamp, nonce, method, signed_path, body)),
    }


class SupplyError(Exception):
    def __init__(self, http_status: int, detail: dict[str, object]):
        super().__init__(json.dumps(detail, ensure_ascii=False))
        self.http_status = http_status
        self.detail = detail


def parse_error(http_status: int, raw: str) -> SupplyError:
    """平台错误体形如 {"Code":"0","Message":"rpc error: code = Code(413) desc = {\"code\":...}"}：
    取 Message 里那段 JSON 对象才是结构化原因（code / message / suggestion / retry_after）。"""
    detail: dict[str, object] = {"code": "HTTP_" + str(http_status), "message": raw[:500]}
    try:
        outer = json.loads(raw)
    except json.JSONDecodeError:
        return SupplyError(http_status, detail)
    message = str(outer.get("Message") or outer.get("message") or "")
    match = re.search(r"\{.*\}", message, re.S)
    if match:
        try:
            inner = json.loads(match.group(0))
            if isinstance(inner, dict) and inner.get("code"):
                return SupplyError(http_status, inner)
        except json.JSONDecodeError:
            pass
    detail["message"] = message or raw[:500]
    return SupplyError(http_status, detail)


def call(method: str, route: str, payload: dict[str, object] | None = None,
         query: dict[str, str] | None = None, timeout: int = QUERY_TIMEOUT) -> dict[str, object]:
    base, app_id, secret = credentials()
    path = f"{PREFIX}/{route}"
    qs = canonical_query(query) if method.upper() == "GET" else ""
    signed_path = path + (f"?{qs}" if qs else "")
    body = encode_body(payload) if method.upper() != "GET" else b""
    request = urllib.request.Request(
        base + signed_path,
        data=body if method.upper() != "GET" else None,
        method=method.upper(),
        headers=signed_headers(app_id, secret, method, signed_path, body),
    )
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            raw = response.read().decode("utf-8")
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as error:
        raise parse_error(error.code, error.read().decode("utf-8", errors="replace")) from error
    except urllib.error.URLError as error:
        raise SupplyError(0, {"code": "NETWORK_ERROR", "message": str(error.reason)}) from error


def file_sha256(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def load_json(value: str) -> dict[str, object]:
    if value.startswith("@"):
        with open(value[1:], "r", encoding="utf-8") as file:
            value = file.read()
    data = json.loads(value)
    if not isinstance(data, dict):
        raise SystemExit("JSON 必须是对象")
    return data


def selftest() -> None:
    """离线校验签名实现：与平台服务端单测钉住的同一组向量比对（不是拿自己验自己）。"""
    app_id, secret = "sup_0123456789abcdef", "0123456789abcdef" * 4
    ts, nonce = "1760000000", "nonce000000000000000001"
    body = b'{"submission_id":"demo-0000000000000001"}'
    post = sign(secret, signing_string(app_id, ts, nonce, "POST", f"{PREFIX}/extraction/submit", body))
    assert post == "e97806d91bb849a7ceceb913eab5303df903f2ae62dc3eec2a4a7dd0bee7a560", post
    qs = canonical_query({"submission_id": "demo-0000000000000001", "since_seq": "3"})
    assert qs == "since_seq=3&submission_id=demo-0000000000000001", qs
    get = sign(secret, signing_string(app_id, ts, nonce, "GET", f"{PREFIX}/extraction/issues?{qs}", b""))
    assert get == "3ca0df4e3037f539e47ab83b3b4013ecdc9408930b8fa5b641ba7c4e601ca6e7", get
    assert fingerprint(secret) == "a8ae6e6ee929"
    sample = parse_error(413, json.dumps({"Code": "0", "Message": 'rpc error: code = Code(413) desc = {"code":"ARCHIVE_TOO_LARGE","message":"包超过 100MB 上限","suggestion":"剔除未使用素材"}'}))
    assert sample.detail["code"] == "ARCHIVE_TOO_LARGE"
    print("SELFTEST: PASS")


def show(result: object) -> None:
    print(json.dumps(result, ensure_ascii=False, indent=2))


def show_error(err: SupplyError) -> None:
    out = {"http_status": err.http_status, **err.detail}
    print(json.dumps(out, ensure_ascii=False, indent=2), file=sys.stderr)


def cmd_submit(args: argparse.Namespace) -> dict[str, object]:
    payload = load_json(args.json) if args.json else {}
    if args.zip:
        payload.setdefault("archive_sha256", file_sha256(args.zip))
    for key, value in (("submission_id", args.submission_id), ("archive_url", args.archive_url),
                       ("game_name", args.game_name)):
        if value:
            payload[key] = value
    if args.owner:
        payload["license_declaration"] = {"distributable": "yes", "owner": args.owner}
    missing = [k for k in ("submission_id", "archive_url", "archive_sha256", "game_name", "license_declaration") if not payload.get(k)]
    if missing:
        raise SystemExit("缺少字段：" + "、".join(missing))
    return call("POST", "extraction/submit", payload, timeout=SUBMIT_TIMEOUT)


def target(args: argparse.Namespace) -> dict[str, str]:
    if bool(args.submission_id) == bool(args.extraction_id):
        raise SystemExit("--submission-id 与 --extraction-id 须给且只给一个")
    return {"submission_id": args.submission_id or "", "extraction_id": args.extraction_id or ""}


def watch(submission_id: str, max_hours: float) -> int:
    """按状态分档轮询；等你改包时打印提醒与全部 blocker、退出码 2；到终态退出码 0；超时退出码 3。"""
    deadline = time.time() + max_hours * 3600
    last = None
    while True:
        try:
            st = call("GET", "extraction/status", query={"submission_id": submission_id})
        except SupplyError as err:
            if err.http_status in (0, 429, 502, 503, 504):
                time.sleep(int(err.detail.get("retry_after") or 60))
                continue
            show_error(err)
            return 1
        state = str(st.get("state"))
        if state != last:
            print(f"[{time.strftime('%H:%M:%S')}] {state}：{st.get('state_text')}" +
                  (f"（排第 {st['queue_position']} 位）" if st.get("queue_position") else ""))
            if st.get("notice"):
                print("  提醒：" + str(st["notice"]))
            last = state
        if st.get("next_action") == "supplier":
            issues = call("GET", "extraction/issues", query={"submission_id": submission_id, "severity": "blocker"})
            print("需要你修改：" + str(st.get("notice") or st.get("state_text")))
            for it in issues.get("items", []):
                print(f"  - [{it.get('code')}] {it.get('title')}：{it.get('detail', '')}")
                print(f"    怎么改：{it.get('suggestion', '')}")
            return 2
        if state in TERMINAL:
            show(st)
            return 0
        if time.time() > deadline:
            print("等待超时（仍在 " + state + "），稍后再查")
            return 3
        time.sleep(POLL_INTERVAL.get(state, 300))


def parser() -> argparse.ArgumentParser:
    root = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = root.add_subparsers(dest="command", required=True)
    sub.add_parser("selftest", help="离线校验签名实现（必须 SELFTEST: PASS）")
    sub.add_parser("fingerprint", help="当前 SUPPLY_APP_SECRET 的 12 位指纹（应与平台管理页一致）")
    sub.add_parser("whoami", help="向平台核对身份、授权码指纹、配额与允许的下载主机")
    sha = sub.add_parser("sha256", help="算 zip 文件的 SHA-256（推送必填）")
    sha.add_argument("file")

    s = sub.add_parser("submit", help="推送一个游戏包（JSON 可用 @file.json，命令行参数覆盖同名字段）")
    s.add_argument("--json", default="")
    s.add_argument("--submission-id", default="")
    s.add_argument("--archive-url", default="")
    s.add_argument("--zip", default="", help="本地 zip 路径，只用来算 archive_sha256（不会上传）")
    s.add_argument("--game-name", default="")
    s.add_argument("--owner", default="", help="权利人；给了即声明 distributable=yes")

    for name, helptext in (("status", "查进度"), ("issues", "查问题清单")):
        p = sub.add_parser(name, help=helptext)
        p.add_argument("--submission-id", default="")
        p.add_argument("--extraction-id", default="")
        if name == "issues":
            p.add_argument("--since-seq", default="")
            p.add_argument("--severity", default="", choices=["", "blocker", "warning", "info"])
            p.add_argument("--limit", default="")

    c = sub.add_parser("cancel", help="撤回（排队中或处理中；已进入打包的不能撤回）")
    c.add_argument("--submission-id", required=True)
    c.add_argument("--reason", required=True)

    ls = sub.add_parser("list", help="列我推过的")
    ls.add_argument("--state", default="")
    ls.add_argument("--limit", default="")
    ls.add_argument("--offset", default="")

    w = sub.add_parser("watch", help="按状态分档轮询：等你改包时提醒并以退出码 2 结束，终态 0，超时 3")
    w.add_argument("--submission-id", required=True)
    w.add_argument("--max-hours", type=float, default=72)
    return root


def main() -> int:
    args = parser().parse_args()
    if args.command == "selftest":
        selftest()
        return 0
    if args.command == "fingerprint":
        print(fingerprint(required_env("SUPPLY_APP_SECRET")))
        return 0
    if args.command == "sha256":
        print(file_sha256(args.file))
        return 0
    try:
        if args.command == "watch":
            return watch(args.submission_id, args.max_hours)
        if args.command == "whoami":
            show(call("GET", "whoami"))
        elif args.command == "submit":
            show(cmd_submit(args))
        elif args.command == "status":
            show(call("GET", "extraction/status", query=target(args)))
        elif args.command == "issues":
            q = target(args)
            q.update({"since_seq": args.since_seq, "severity": args.severity, "limit": args.limit})
            show(call("GET", "extraction/issues", query=q))
        elif args.command == "cancel":
            show(call("POST", "extraction/cancel", {"submission_id": args.submission_id, "reason": args.reason}))
        elif args.command == "list":
            show(call("GET", "extraction/list", query={"state": args.state, "limit": args.limit, "offset": args.offset}))
    except SupplyError as err:
        show_error(err)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
