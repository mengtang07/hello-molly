#!/bin/bash
# ============================================================
#  Molly 静态站点 —— 发布到网站根目录
#  目标: https://mymolly.online/
#  用法（在服务器上执行）: bash deploy-root.sh [目标目录] [tar 包]
#  默认: /var/www/html   /root/hello-molly-dist.tar.gz
# ============================================================
set -euo pipefail

TARGET="${1:-/var/www/html}"
TARBALL="${2:-/root/hello-molly-dist.tar.gz}"
STAMP="$(date +%Y%m%d-%H%M%S)"

ok()   { echo -e "  \033[1;32m✓\033[0m $1"; }
warn() { echo -e "  \033[1;33m!\033[0m $1"; }
err()  { echo -e "  \033[1;31m✗\033[0m $1"; }

echo -e "\033[1;36m▶ 前置检查\033[0m"
[ -f "$TARBALL" ] || { err "找不到 tar 包: $TARBALL"; exit 1; }
[ -d "$TARGET" ] || { err "找不到目标目录: $TARGET"; exit 1; }
ok "tar 包就绪 ($(du -h "$TARBALL" | cut -f1))"

echo -e "\033[1;36m▶ 备份现有站点\033[0m"
# 备份放在 docroot 之外，避免 WP 的 PHP 文件仍可被 Web 访问
BACKUP="${TARGET%/}.bak.${STAMP}"
if [ -n "$(ls -A "$TARGET" 2>/dev/null)" ]; then
  mv "$TARGET" "$BACKUP"
  ok "已备份 -> $BACKUP"
else
  ok "目标目录本来就是空的，无需备份"
fi
mkdir -p "$TARGET"

echo -e "\033[1;36m▶ 发布\033[0m"
tar -xzf "$TARBALL" -C "$TARGET"
ok "产物已解压"

# 保留 certbot 的 ACME 校验目录 —— 否则 SSL 证书将无法自动续期
if [ -d "$BACKUP/.well-known" ]; then
  mkdir -p "$TARGET/.well-known"
  cp -a "$BACKUP/.well-known/." "$TARGET/.well-known/" 2>/dev/null || true
  chown -R apache:apache "$TARGET/.well-known" 2>/dev/null || chown -R root:root "$TARGET/.well-known"
  ok "已保留 .well-known (certbot 续期目录)"
fi

# 权限 / SELinux
chown -R root:root "$TARGET"
find "$TARGET" -type d -exec chmod 755 {} \;
find "$TARGET" -type f -exec chmod 644 {} \;
command -v restorecon >/dev/null 2>&1 && restorecon -R "$TARGET" 2>/dev/null || true
# 旧 WordPress 的重写规则不要带过来
rm -f "$TARGET/.htaccess"
ok "权限与重写规则已处理"

echo -e "\033[1;36m▶ 自检\033[0m"
sleep 1
CODE="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 15 https://mymolly.online/ 2>/dev/null || echo 000)"
if [ "$CODE" = "200" ]; then
  ok "HTTP 200 —— 部署成功"
  echo -e "\n  访问地址:  \033[1;36mhttps://mymolly.online/\033[0m"
  echo -e "  回滚方法:  mv '$BACKUP' '$TARGET'"
else
  warn "HTTP $CODE"
  echo "  排查: tail -20 /var/log/httpd/error_log"
  echo "  回滚:    mv '$BACKUP' '$TARGET' && chown -R root:root '$TARGET'"
fi
