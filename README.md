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
├── index.html            入口 HTML
├── package.json
├── vite.config.js        注意 base: './'
├── src/
│   ├── main.jsx          React 挂载入口
│   ├── App.jsx           页面主体（计数器 / 主题切换 / 实时时间）
│   ├── App.css           组件样式
│   └── index.css         全局样式与主题变量
├── public/               静态资源原样拷贝
├── dist/                 构建产物（已生成）
└── deploy/               部署脚本与说明
    ├── deploy-react.sh       服务器端一键发布
    ├── hello-molly-dist.tar.gz  产物打包
    └── README-hello-molly.md    详细文档
```

## 部署到 mymolly.online

```bash
# 1. 上传（Mac 终端）
cd /Users/a1234/Documents/ai项目学习/hello-molly/deploy
scp hello-molly-dist.tar.gz deploy-react.sh root@116.62.177.154:/root/

# 2. 服务器发布
ssh root@116.62.177.154
cd /root && bash deploy-react.sh

# 3. 访问
#    https://mymolly.online/hello-molly/
```

## 重要配置

`vite.config.js` 中的 `base: './'` 必须保留。Vite 默认 `base: '/'` 会生成
`/assets/index-xxx.js` 绝对路径引用，部署到子目录时资源全部 404，页面白屏。

## 页面功能

- 计数器（`useState`）—— 验证 React 交互
- 深色 / 浅色主题切换（写入 `<html data-theme>`）
- 实时钟表（`useEffect` + `setInterval`）
- 响应式布局，移动端自适应
