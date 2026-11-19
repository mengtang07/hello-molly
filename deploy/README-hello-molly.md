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

线上地址：**https://mymolly.online/**（根目录）

```bash
# 一键（本地）
bash deploy-now.sh

# 分步
npm run build && tar -czf hello-molly-dist.tar.gz -C dist .
scp hello-molly-dist.tar.gz deploy-root.sh root@116.62.177.154:/root/
ssh root@116.62.177.154 'bash /root/deploy-root.sh /var/www/html /root/hello-molly-dist.tar.gz'
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

---

## 附:国家队 ETF 流向报表(`/etf/`)

站内 `https://www.mymolly.online/etf/` 是一份**自动更新的自包含报表**,与主页是两套独立的发布流程。

### 架构

```
/opt/etf/                 ← 服务端工作目录(不在 /var/www/html, 不会被站点发布冲掉)
├── refresh.py            ← 抓数主脚本(已打 akshare 改名兼容补丁)
├── make_offline.py       ← 把 ECharts CDN 外链内联成离线单文件
├── branding.py           ← 注入 Molly 品牌(favicon / 标题前缀 / 页面 logo)
├── publish.sh            ← 抓数 → 重算 → 离线化 → 注入 logo → 原子发布
├── echarts.min.js        ← 内联用的 ECharts
├── _etf_shares_cache.json ← 份额缓存(约 5 年基线, 不要删)
├── _kline_cache.json     ← K 线缓存
└── web/                  ← ← Apache Alias 指向这里
    ├── index.html        ← 对外提供 /etf/
    ├── molly-logo.svg    ← 页面内 logo
    ├── favicon.svg       ← 浏览器标签页图标
    ├── favicon-32.png
    ├── favicon-16.png
    ├── apple-touch-icon.png
    └── icon-512.png

/etc/httpd/conf.d/ssl.conf  ← Alias /etf/ /opt/etf/web/
```

> ⚠️ **站点发布脚本会清空 `/var/www/html`**。报表目录放在 `/opt/etf/web/` 并用
> Apache `Alias` 映射到 `/etf/`,所以 `deploy-now.sh` 不会影响报表。

### 自动更新

crontab(服务器时区 = 北京时间),用 `flock` 防重入:

```
30 8,12 * * *  /usr/bin/flock -n /opt/etf/refresh.lock /opt/etf/publish.sh
0  19,21,23 * * *  /usr/bin/flock -n /opt/etf/refresh.lock /opt/etf/publish.sh
```

交易所晚间公布当日份额,所以晚上多跑几次;每次约 15 秒。

### 常用操作

```bash
# 手动刷新一次
ssh root@116.62.177.154 '/opt/etf/publish.sh'

# 看日志
ssh root@116.62.177.154 'tail -f /opt/etf/refresh.log'

# 改发布路径 / 时间
ssh root@116.62.177.154 'crontab -l'      # 编辑后 crontab -e 覆盖
```

### 注意

- 服务器系统 Python 只有 3.6,跑不了新版 akshare;已用 yum 装 `python3.11`,虚拟环境在 `/opt/etf/.venv`
- 装包必须走阿里云镜像(直连 PyPI 只有 ~13 KB/s,镜像 ~1.4 MB/s):
  `pip install -i https://mirrors.aliyun.com/pypi/simple/ --trusted-host mirrors.aliyun.com ...`
- 上游 `refresh.py` 调 `ak.tool_trade_date_hist_sina`,akshare 1.20.45 已改名,
  本地补丁改用 `calendar_trade_date_hist_sina`(列名不变)

### 品牌注入(`branding.py`)

报表页原本**没有任何 favicon 声明**(标签页显示浏览器默认地球图标)，
也没有站点品牌。`branding.py` 作为**部署后处理**补上三样东西, 不改上游模板:

| 注入内容 | 效果 |
|---|---|
| `<link rel="icon">` ×4 + `apple-touch-icon` + `theme-color` | 浏览器标签页 / 手机主屏显示 Molly 图标 |
| `<title>` 前缀 `Molly · ` | 标签页标题 `Molly · 国家队ETF每日净买入卖出报表` |
| 页头 logo + "Molly" 链接 | 页面左上角品牌条, 点击回首页 |

图标全部用**相对路径**放在 `web/` 下, `/etf/` 目录自包含, 不依赖站点发布目录。

### 首页入口

导航栏 logo 右侧有一个**隐藏链接**(无可见文字,悬停/聚焦时浮现小圆点),
指向 `/etf/`,配置在 `src/data/site.js` 的 `brandLink`。
