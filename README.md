# Hello Molly

用 **Vite + React 19** 写的个人页面，构建为纯静态文件后由 Apache 直接托管在
`https://mymolly.online/hello-molly/`。

> 服务器上不需要安装 Node.js —— 本地构建好，把 `dist/` 传上去即可。

## 快速开始

```bash
cd /Users/a1234/Documents/ai项目学习/hello-molly

npm install     # 依赖已装好，通常可跳过
npm run dev     # http://localhost:5173
```

## 构建

```bash
npm run build   # 产物输出到 dist/
npm run preview # 本地预览构建产物
```

## 目录结构

```
hello-molly/
├── index.html            入口 HTML（SEO / favicon / 结构化数据）
├── package.json
├── vite.config.js        注意 base: './'
├── src/
│   ├── main.jsx          React 挂载入口
│   ├── App.jsx           页面组装（导航 / 首屏 / 关于 / 项目 / 笔记 / 页脚）
│   ├── App.css           页面布局样式
│   ├── index.css         设计令牌（配色 / 圆角 / 阴影 / 字体）与基础样式
│   ├── data/
│   │   └── site.js       ★ 全站文案 / 项目 / 文章的唯一数据源
│   ├── components/
│   │   ├── Navbar.jsx        顶部导航（吸顶 / 移动端折叠 / 主题切换）
│   │   ├── Hero.jsx          首屏（标题 / 副标题 / CTA / 轨道装饰）
│   │   ├── About.jsx         关于我（文案 + 信息卡）
│   │   ├── Projects.jsx      精选项目卡片
│   │   ├── Notes.jsx         最近笔记列表
│   │   ├── Footer.jsx        页脚
│   │   ├── SectionHeading.jsx 统一区块标题
│   │   ├── Reveal.jsx        滚动进场动画
│   │   └── MollyLogo.jsx     矢量 Logo（深/浅色自动切换）
│   └── assets/           矢量 Logo（SVG，深色 / 浅色两版）
│       ├── molly-logo.svg
│       └── molly-logo-light.svg
├── public/               静态资源原样拷贝（favicon / apple-touch-icon / manifest）
├── dist/                 构建产物（已生成）
└── deploy/               部署脚本与说明
    ├── deploy-react.sh       服务器端一键发布
    ├── hello-molly-dist.tar.gz  产物打包
    └── README-hello-molly.md    详细文档
```

> **改内容只需要改 `src/data/site.js`**，组件全部从这份配置读取。

## 部署到 mymolly.online

线上地址：**https://mymolly.online/**（网站根目录）

```bash
# 一键部署（本地执行：构建 → 打包 → 上传 → 服务器发布 → 打开网站）
cd /Users/a1234/Documents/ai项目学习/hello-molly/deploy
bash deploy-now.sh

# 或分步执行
npm run build
tar -czf deploy/hello-molly-dist.tar.gz -C dist .
scp deploy/hello-molly-dist.tar.gz deploy/deploy-root.sh root@116.62.177.154:/root/
ssh root@116.62.177.154 'bash /root/deploy-root.sh /var/www/html /root/hello-molly-dist.tar.gz'
```

`deploy-root.sh` 的行为：

1. 把现有 docroot 整目录备份到 `/var/www/html.bak.<时间戳>`（**在 docroot 之外**，WP 的 PHP 不会被 Web 访问）
2. 解压新产物到 `/var/www/html`
3. **保留 `.well-known/acme-challenge`** —— certbot 用它做续期校验，删掉会导致 SSL 证书无法自动续期
4. 统一权限，清理旧的 WordPress 重写规则
5. 自检 HTTP 状态码

回滚：

```bash
mv /var/www/html.bak.<时间戳> /var/www/html
```

## 重要配置

`vite.config.js` 中的 `base: './'` 必须保留。Vite 默认 `base: '/'` 会生成
`/assets/index-xxx.js` 绝对路径引用，部署到子目录时资源全部 404，页面白屏。

## 页面结构

| 区域 | 说明 |
| --- | --- |
| 顶部导航 | Logo + Home / About / Projects / Blog，吸顶、滚动加毛玻璃，移动端折叠为下拉菜单 |
| Hero 首屏 | 大标题、副标题、个人简介、Explore My Work / Get in Touch 双按钮、轨道与星光装饰 |
| About Me | 左侧个人介绍，右侧 2×2 信息卡 |
| Featured Projects | 3 张项目卡片，含简介、技术栈标签与外链，Hover 上浮 + 顶部渐变描边 |
| Latest Notes | 最近笔记列表（日期 / 标题 / 摘要 / 阅读入口） |
| Footer | 品牌标识、社交入口、版权信息 |

## 设计规范

| Token | 值 | 用途 |
| --- | --- | --- |
| `--navy` | `#0B0645` | 主色：标题、按钮、深色区块 |
| `--lavender` | `#8B5CF6` | 辅助色：标签、点缀、渐变 |
| `--lavender-wash` | `#F5F1FF` | 淡紫背景、标签底色 |
| `--ink / --muted` | `#17133C` / `#6F6A8C` | 正文 / 次级文字 |
| `--line` | `#EBE7F7` | 细边框 |
| 圆角 | 12 / 18 / 26px | 标签 / 卡片 / 大卡片 |
| 阴影 | `--shadow-xs ~ --shadow-lg` | 柔和投影 |

- 字体：系统现代无衬线（Inter → SF Pro → PingFang SC），无外链字体请求
- 紫色渐变只用于点缀（标题强调、按钮、卡片顶部描边、卡片装饰光晕）
- 尊重 `prefers-reduced-motion`，动画会自动降级

## 交互

- 深色 / 浅色主题切换（写入 `<html data-theme>`，全站 Token 联动）
- 滚动进场动画（IntersectionObserver，仅淡入 + 上移）
- 平滑滚动、锚点自动避开吸顶导航
- 卡片 / 按钮 Hover 反馈，导航下划线动画
