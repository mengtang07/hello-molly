#!/bin/bash
# 国家队ETF报表: 抓数 -> 重算 -> 内联ECharts -> 原子发布到 /opt/etf/web (Apache Alias -> /etf/)
set -uo pipefail
cd /opt/etf
LOG=/opt/etf/refresh.log
WEB=/opt/etf/web

echo "===== $(date '+%F %T') 开始 =====" >> "$LOG"

# 1) 抓取交易所份额/净值/K线并重算
./.venv/bin/python -u refresh.py >> "$LOG" 2>&1
RC=$?
if [ $RC -ne 0 ]; then
  echo "===== $(date '+%F %T') refresh.py 失败 rc=$RC, 保留原有报表 =====" >> "$LOG"
  exit 1
fi

# 2) 内联 ECharts, 产出完全离线的单文件
./.venv/bin/python make_offline.py "国家队ETF每日净买入卖出报表.html" /opt/etf/index.new.html >> "$LOG" 2>&1
if [ ! -s /opt/etf/index.new.html ]; then
  echo "===== $(date '+%F %T') 离线化失败, 保留原有报表 =====" >> "$LOG"
  exit 1
fi

# 3) 注入 Molly 品牌(favicon / 标题前缀 / 页面 logo), 部署后处理, 不改上游模板
./.venv/bin/python branding.py /opt/etf/index.new.html /opt/etf/index.brand.html >> "$LOG" 2>&1
if [ -s /opt/etf/index.brand.html ]; then
  mv -f /opt/etf/index.brand.html /opt/etf/index.new.html
else
  echo "  品牌注入失败, 使用未注入版本" >> "$LOG"
fi

# 4) 原子替换(先写临时文件再 mv, 避免中途被访问到半个文件)
mv -f /opt/etf/index.new.html "$WEB/index.html"
cp -f /opt/etf/molly-logo.svg "$WEB/molly-logo.svg"
cp -f /opt/etf/favicon.svg /opt/etf/favicon-32.png /opt/etf/favicon-16.png \
      /opt/etf/apple-touch-icon.png /opt/etf/icon-512.png "$WEB/"
chmod 644 "$WEB/index.html" "$WEB/molly-logo.svg" "$WEB"/favicon* \
      "$WEB/apple-touch-icon.png" "$WEB/icon-512.png"

DATADAY=$(grep -o '数据日 <b>[0-9]*' "$WEB/index.html" | head -1 | sed 's/.*<b>//')
UPDATED=$(grep -o '20[0-9][0-9]-[0-9][0-9]-[0-9][0-9] [0-9:]*' "$WEB/index.html" | head -1)
echo "===== $(date '+%F %T') 完成: 数据日 $DATADAY | 更新时间 $UPDATED | $(du -h "$WEB/index.html" | cut -f1) =====" >> "$LOG"
