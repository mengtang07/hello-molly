#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""盘中资金流(估算) —— 交易时段每 5 分钟刷新一次。

口径说明(重要):
    用「分钟级量价方向」推算主动买卖:
        每分钟成交额 × sign(该分钟价格相对上一时点的涨跌方向) → 主动买入为正、主动卖出为负
    这与日终报表的「份额变动 × 单位净值」口径**不是一回事**:
        前者是盘中成交行为估算, 后者是日终份额口径的净申赎, 两者方向可能背离。
    仅作盘中参考, 不构成投资建议。

数据源: 腾讯分时行情 (web.ifzq.gtimg.cn/appstock/app/minute/query)
        备用: 东方财富分时 (push2his stock/trends2)
输出:   /opt/etf/web/intraday.json   (页面 fetch 轮询)
"""
import io, json, os, threading, time
from datetime import datetime, timezone, timedelta

import requests

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "web", "intraday.json")

CST = timezone(timedelta(hours=8))
HEADERS = {"User-Agent": "Mozilla/5.0"}
# requests.Session 不是线程安全的, 并发共用会把连接池搞坏 -> 用线程局部实例
_local = threading.local()


def session():
    s = getattr(_local, "s", None)
    if s is None:
        s = requests.Session()
        s.trust_env = False          # 绕过系统代理, 直连行情源
        _local.s = s
    return s

# 老域名 web.ifzq.gtimg.cn 会被腾讯 WAF 拦成 501 跳转页, 必须用新域名
# (与 refresh.py 里腾讯 K 线接口用的同一套新域名)
TX_MINUTE = "https://proxy.finance.qq.com/ifzqgtimg/appstock/app/minute/query?code={code}"
EM_TRENDS = ("https://push2his.eastmoney.com/api/qt/stock/trends2/get?secid={secid}"
             "&fields1=f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f11,f12,f13"
             "&fields2=f51,f52,f53,f54,f55,f56,f57,f58&iscr=0&ndays=1")

# 与 refresh.py 的 TARGETS 保持一致(34 只核心宽基 ETF)
BASKET = [
    ("510300", "sh"), ("510310", "sh"), ("510330", "sh"), ("159919", "sz"),
    ("515330", "sh"), ("510050", "sh"), ("510100", "sh"), ("510500", "sh"),
    ("512500", "sh"), ("159922", "sz"), ("512100", "sh"), ("159845", "sz"),
    ("560010", "sh"), ("159629", "sz"), ("159633", "sz"), ("159915", "sz"),
    ("159952", "sz"), ("159977", "sz"), ("588080", "sh"), ("588050", "sh"),
    ("588000", "sh"), ("563360", "sh"), ("512050", "sh"), ("563800", "sh"),
    ("563220", "sh"), ("159338", "sz"), ("159352", "sz"), ("159361", "sz"),
    ("159351", "sz"), ("510180", "sh"), ("510230", "sh"), ("159901", "sz"),
    ("515800", "sh"), ("560050", "sh"),
]
INDEX = ("sh000985", "中证全指")


def _in_session(t):
    """只保留 09:30~11:30 / 13:00~15:00"""
    return ("0930" <= t <= "1130") or ("1300" <= t <= "1500")


def fetch_tx(code):
    """腾讯分时 -> (date, rows[(t, price, cumVol, cumAmt)], preClose) ; 失败 None

    code 形如 sh510300 / sz159919(必须带市场前缀, 否则接口返回 46 字节的错误 JSON)。
    腾讯对并发请求会直接返回空响应体, 所以整体串行 + 退避重试。
    """
    for attempt in range(4):
        try:
            r = session().get(TX_MINUTE.format(code=code), headers=HEADERS, timeout=15)
            if not r.content or not r.content.strip():
                raise ValueError("空响应体(被限流)")
            j = r.json()
            node = (j.get("data") or {}).get(code) or {}
            data = node.get("data") or {}
            date = str(data.get("date") or "")
            raw = data.get("data") or []
            qt = (node.get("qt") or {}).get(code) or []
            pre = float(qt[4]) if len(qt) > 4 and qt[4] else 0.0
            rows = []
            for line in raw:
                p = line.split()
                if len(p) < 4:
                    continue
                t = p[0]
                if not _in_session(t):
                    continue
                rows.append((t, float(p[1]), float(p[2]), float(p[3])))
            if not rows or not date:
                return None
            return date, rows, pre
        except Exception as e:
            time.sleep(0.5 * (attempt + 1))
    return None


def fetch_em(code, mkt):
    """东财分时(备用) -> 同上"""
    try:
        secid = ("1." if mkt == "sh" else "0.") + code
        j = session().get(EM_TRENDS.format(secid=secid), headers=HEADERS, timeout=15).json()
        d = j.get("data") or {}
        tr = d.get("trends") or []
        if not tr:
            return None
        date = ""
        rows = []
        for r in tr:
            p = r.split(",")
            date = p[0].split(" ")[0]
            t = p[0].split(" ")[1]
            if not _in_session(t):
                continue
            rows.append((t, float(p[7]), float(p[6]), 0.0))
        if not rows:
            return None
        return date, rows, float(d.get("preClose") or 0)
    except Exception:
        return None


def fetch_one(tx_code, mkt, raw_code):
    """先腾讯(带前缀的 tx_code), 失败再东财(raw_code + mkt)"""
    r = fetch_tx(tx_code)
    if r:
        return r
    time.sleep(0.4)
    return fetch_em(raw_code, mkt)


def session_state(now, market):
    """交易状态: trading / closed / pre"""
    hm = now.hour * 100 + now.minute
    if now.weekday() >= 5:
        return "closed"
    if 930 <= hm <= 1130 or 1300 <= hm <= 1500:
        return "trading"
    if hm < 930:
        return "pre"
    return "closed"


def _session_state_for(date, now):
    """状态以"数据日期是否为今天"为准, 这样节假日不会误显示"交易中"。"""
    if date != now.strftime("%Y%m%d"):
        return "closed"
    st = session_state(now, None)
    if st == "trading" and now.hour * 100 + now.minute > 1500:
        return "closed"
    return st


def build():
    now = datetime.now(CST)
    # 串行抓取: 腾讯/东财对并发都会掐连接, 35 个标的串行约 15~20 秒
    # 腾讯代码 = 市场前缀 + 代码; 东财 secid = 1.(沪)/0.(深) + 代码
    jobs = [(m + c, c, m) for c, m in BASKET] + [(INDEX[0], INDEX[0], "sh")]
    results = []
    for i, (tx_code, raw_code, mkt) in enumerate(jobs):
        results.append(fetch_one(tx_code, mkt, raw_code))
        if i < len(jobs) - 1:
            time.sleep(0.15)

    idx_res = results[-1]
    ok = [r for r in results[:-1] if r]
    if not ok:
        print("分时数据获取失败, 保留旧文件")
        return

    date = ok[0][0]
    per = {}          # t -> [净流入, 成交额, 加权涨跌分子, 加权涨跌分母]
    for _, rows, pre in ok:
        prev = pre
        prev_v = prev_a = 0.0
        for t, price, cumv, cuma in rows:
            amt = cuma - prev_a
            prev_a = cuma
            if amt <= 0:
                prev = price
                continue
            ref = prev if prev else price
            prev = price
            d = (price - ref) / ref if ref else 0
            flow = amt * (1 if d > 0 else (-1 if d < 0 else 0))
            slot = per.setdefault(t, [0.0, 0.0, 0.0, 0.0])
            slot[0] += flow
            slot[1] += amt
            slot[2] += d * amt
            slot[3] += amt

    series, cum, tot_amt = [], 0.0, 0.0
    for t in sorted(per.keys()):
        flow, amt, wnum, wden = per[t]
        cum += flow
        tot_amt += amt
        series.append({
            "t": t,
            "m": round(flow / 1e8, 4),
            "c": round(cum / 1e8, 4),
            "a": round(amt / 1e8, 4),
            "p": round(wnum / wden * 100, 4) if wden else 0.0,
        })

    idx_series = []
    if idx_res:
        _, irows, ipre = idx_res
        for t, price, cumv, cuma in irows:
            idx_series.append({"t": t, "p": round((price - ipre) / ipre * 100, 3) if ipre else 0.0})

    payload = {
        "date": date,
        "updated": now.strftime("%Y-%m-%d %H:%M:%S"),
        "session": _session_state_for(date, now),
        "basket": {
            "n": len(ok),
            "net": round(cum / 1e8, 2),
            "amount": round(tot_amt / 1e8, 1),
            "series": series,
        },
        "index": {"name": INDEX[1], "series": idx_series},
    }
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    tmp = OUT + ".tmp"
    io.open(tmp, "w", encoding="utf-8").write(json.dumps(payload, ensure_ascii=False))
    os.replace(tmp, OUT)
    print("盘中资金流已更新: 数据日 %s | 状态 %s | 成功 %d/%d 只 | 估算净流入 %+.2f 亿 | 成交额 %.1f 亿 | %d 个分钟点"
          % (date, payload["session"], len(ok), len(BASKET), cum / 1e8, tot_amt / 1e8, len(series)))


if __name__ == "__main__":
    build()
