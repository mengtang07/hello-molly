# Hello Molly — Vite + React

一个用 Vite + React 19 写的简单页面，构建为静态文件后由 Apache 直接托管。
**服务器上不需要装 Node.js**，只需本地构建 + 上传静态产物。

## 目录

```
hello-molly/            ← 源码
├── index.html
├── package.json
├── vite.config.js      ← 注意 base: './'
└── src/
    ├── main.jsx
    ├── App.jsx         ← 页面主体
    ├── App.css
    └── index.css       ← 主题变量（浅色/深色）

hello-molly-dist/      ← 构建产物（已构建好，可直接部署）
├── index.html
└── assets/
    ├── index-*.js     ← 221 KB (gzip 69 KB)
    └── index-*.css    ← 2.9 KB (gzip 1.2 KB)

hello-molly-dist.tar.gz  ← 产物打包
deploy-react.sh           ← 服务器端一键发布脚本
```

## 本地开发

```bash
cd hello-molly
npm install
npm run dev      # http://localhost:5173
```

## 重新构建

```bash
npm run build    # 产物在 dist/
```

## 部署到服务器

```bash
# 1. 上传（Mac 终端）
cd /Users/a1234/Documents/Codex/2026-11-03/https-www-mymolly-online-https-www/outputs
scp hello-molly-dist.tar.gz deploy-react.sh root@116.62.177.154:/root/

# 2. 服务器上发布
ssh root@116.62.177.154
cd /root && bash deploy-react.sh

# 3. 访问
#    https://mymolly.online/hello-molly/
```

## 以后更新

```bash
cd hello-molly
# 改代码...
npm run build
cd ..
rm -f hello-molly-dist.tar.gz
tar -czf hello-molly-dist.tar.gz -C hello-molly-dist .
scp hello-molly-dist.tar.gz root@116.62.177.154:/root/
ssh root@116.62.177.154 'cd /root && bash deploy-react.sh'
```

静态文件替换即生效，无需重启 Apache。

## 关键配置

`vite.config.js` 里的 `base: './'` 很关键 —— Vite 默认 `base: '/'` 会生成
`/assets/index-xxx.js` 这样的绝对路径，部署到子目录时会 404。改成 `'./'` 后
引用变成 `./assets/index-xxx.js`，任意子目录都能正常工作。

## 常见问题

| 现象 | 原因 |
|---|---|
| 页面空白，Console 报 404 | `base` 没设成 `'./'` |
| 样式丢失 | 同上，或 CSS 引用路径写错 |
| 访问 404 | WordPress 重写拦截，改用独立 vhost |
| 刷新子路由 404 | 需要 `.htaccess` 的 SPA 回退（脚本已自动写入） |
