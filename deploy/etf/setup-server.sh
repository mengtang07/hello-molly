#!/bin/bash
# ============================================================
#  在服务器上从零搭建 /opt/etf 报表服务 + Apache /etf/ 路由
#  用法: bash setup-server.sh            # 需 root
#  幂等: 已装过的部分会跳过
# ============================================================
set -euo pipefail
WORK=/opt/etf
WEB="$WORK/web"
HERE="$(cd "$(dirname "$0")" && pwd)"
SERVER="${1:-root@116.62.177.154}"

echo "▶ [1/6] 系统 Python 3.11 (系统自带的 3.6 装不了新版 akshare)"
ssh "$SERVER" 'yum install -y python3.11 python3.11-pip >/dev/null 2>&1 && python3.11 -V'

echo "▶ [2/6] 虚拟环境 + 依赖 (必须走阿里云镜像, 直连 PyPI 只有 ~13KB/s)"
ssh "$SERVER" "mkdir -p $WORK && cd $WORK && python3.11 -m venv .venv && \
  ./.venv/bin/pip install -q --upgrade pip && \
  ./.venv/bin/pip install -i https://mirrors.aliyun.com/pypi/simple/ --trusted-host mirrors.aliyun.com \
    akshare pandas requests && ./.venv/bin/python -c 'import akshare;print(\"akshare\",akshare.__version__)'"

echo "▶ [3/6] 上游脚本 + 缓存 + 品牌/移动端资源"
scp -q "$HERE/../etf/branding.py" "$HERE/../etf/mobile.css" "$HERE/../etf/mobile.js" "$SERVER:$WORK/"
scp -q "$HERE/../etf/publish.sh" "$SERVER:$WORK/"
scp -q "$SERVER:/opt/etf/refresh.py" /dev/null 2>/dev/null || true   # refresh.py 来自上游仓库, 见 README
# 上游的 refresh.py / make_offline.py / echarts.min.js / 份额缓存 需要单独准备:
#   curl -L -o $WORK/refresh.py       https://raw.githubusercontent.com/wwww1998/national-team-etf-flow/main/refresh.py
#   curl -L -o $WORK/make_offline.py  https://raw.githubusercontent.com/wwww1998/national-team-etf-flow/main/refresh.py  (或从本地 Application Support 拷)
#   curl -L -o $WORK/_etf_shares_cache.json  .../main/_etf_shares_cache.json
#   curl -L -o $WORK/_kline_cache.json       .../main/_kline_cache.json
#   并对 refresh.py 打 akshare 改名补丁 (见 README「本地补丁」一节)

echo "▶ [4/6] Apache Alias: /etf/ -> $WEB/"
ssh "$SERVER" "mkdir -p $WEB && grep -q 'Alias /etf/' /etc/httpd/conf.d/ssl.conf || python3 - <<'PY'
import io
p='/etc/httpd/conf.d/ssl.conf'
s=io.open(p,encoding='utf-8').read()
anchor='ServerName mymolly.online:443\n'
block='''
# --- 国家队ETF报表: 独立于站点发布目录 ---
Alias /etf/ /opt/etf/web/
<Directory \"/opt/etf/web\">
    Options -Indexes +FollowSymLinks
    AllowOverride All
    Require all granted
</Directory>
'''
s=s.replace(anchor, anchor+block, 1)
io.open(p,'w',encoding='utf-8').write(s)
PY
httpd -t && systemctl restart httpd"

echo "▶ [5/6] 定时任务 (flock 防重入)"
ssh "$SERVER" "crontab -l 2>/dev/null | grep -v 'opt/etf/publish.sh' > /tmp/etf.cron || true
cat >> /tmp/etf.cron <<'CRON'
30 8,12 * * * /usr/bin/flock -n /opt/etf/refresh.lock /opt/etf/publish.sh >> /dev/null 2>&1
0 19,21,23 * * * /usr/bin/flock -n /opt/etf/refresh.lock /opt/etf/publish.sh >> /dev/null 2>&1
30 0,2 * * * /usr/bin/flock -n /opt/etf/refresh.lock /opt/etf/publish.sh >> /dev/null 2>&1
CRON
crontab /tmp/etf.cron && crontab -l"

echo "▶ [6/6] 首次发布"
ssh "$SERVER" "cd $WORK && ./publish.sh"

echo
echo "✓ 完成。访问: https://www.mymolly.online/etf/"
