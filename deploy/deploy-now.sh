#!/bin/bash
# ============================================================
#  本地一键部署: 上传产物 -> 服务器发布 -> 打开网站
#  用法: bash deploy-now.sh [服务器] [目标目录]
#  默认: root@116.62.177.154   /var/www/html
# ============================================================
set -euo pipefail

SERVER="${1:-root@116.62.177.154}"
TARGET="${2:-/var/www/html}"
HERE="$(cd "$(dirname "$0")" && pwd)"
TARBALL="$HERE/hello-molly-dist.tar.gz"

echo "▶ 本地构建"
(cd "$HERE/.." && npm run build)
rm -f "$TARBALL"
tar -czf "$TARBALL" -C "$HERE/../dist" .
echo "  产物: $TARBALL ($(du -h "$TARBALL" | cut -f1))"

echo "▶ 上传到服务器"
scp -o StrictHostKeyChecking=accept-new "$TARBALL" "$HERE/deploy-root.sh" "$SERVER:/root/"

echo "▶ 服务器发布"
ssh -o StrictHostKeyChecking=accept-new "$SERVER" "bash /root/deploy-root.sh '$TARGET' /root/hello-molly-dist.tar.gz"

echo "▶ 打开网站"
open "https://mymolly.online/"
