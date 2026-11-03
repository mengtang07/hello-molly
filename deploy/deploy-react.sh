#!/bin/bash
# ============================================================
#  Hello Molly (Vite + React) 部署脚本 —— 在服务器上执行
#  用法: bash deploy-react.sh [目标目录]
#  默认: /var/www/html/hello-molly  →  https://mymolly.online/hello-molly/
# ============================================================
set -euo pipefail

TARGET="${1:-/var/www/html/hello-molly}"
TARBALL="${TARBALL:-/root/hello-molly-dist.tar.gz}"
DOMAIN="mymolly.online"

banner(){ echo -e "\n\033[1;36m▶ $1\033[0m"; }
ok(){    echo -e "  \033[0;32m✓ $1\033[0m"; }
warn(){  echo -e "  \033[0;33m! $1\033[0m"; }
err(){   echo -e "  \033[0;31m✗ $1\033[0m"; }

banner "前置检查"
[ "$(id -u)" -eq 0 ] || { err "请用 root 执行"; exit 1; }
[ -f "$TARBALL" ] || { err "找不到 $TARBALL，请先把 hello-molly-dist.tar.gz 上传到 /root/"; exit 1; }
ok "环境检查通过"

banner "备份旧版本"
if [ -d "$TARGET" ]; then
  BK="${TARGET}.bak.$(date +%Y%m%d-%H%M%S)"
  mv "$TARGET" "$BK"
  ok "已备份 -> $BK"
fi

banner "发布"
mkdir -p "$TARGET"
tar -xzf "$TARBALL" -C "$TARGET"
chown -R root:root "$TARGET"
find "$TARGET" -type d -exec chmod 755 {} \;
find "$TARGET" -type f -exec chmod 644 {} \;
ok "已发布到 $TARGET"

# SPA 路由回退（如果以后加了前端路由，需要这行）
cat > "$TARGET/.htaccess" <<'EOF'
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
EOF
chmod 644 "$TARGET/.htaccess"
ok "已写入 SPA 回退规则 .htaccess"

banner "自检"
sleep 1
CODE=$(curl -sS -o /dev/null -w '%{http_code}' --max-time 15 \
        --resolve "${DOMAIN}:443:127.0.0.1" "https://${DOMAIN}${TARGET#/var/www/html}/" 2>/dev/null || echo "000")
if [ "$CODE" = "200" ]; then
  ok "HTTP ${CODE} —— 部署成功"
  echo ""
  echo "  访问地址:  https://${DOMAIN}${TARGET#/var/www/html}/"
else
  warn "HTTP ${CODE}"
  echo "     排查: tail -20 /var/log/httpd/error_log"
  echo "     若被 WordPress 重写拦截，改用独立 vhost 方案"
fi

banner "完成"
