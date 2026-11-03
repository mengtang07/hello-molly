/**
 * 全站内容配置 —— 修改这里即可更新页面文案 / 项目 / 文章。
 * 所有组件都只从这里读取数据，不写死内容。
 */
export const site = {
  name: 'Molly',
  role: 'Developer · Creator · Lifelong learner',
  email: 'hello@mymolly.online',
  url: 'https://mymolly.online',

  nav: [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'Projects', href: '#projects' },
    { label: 'Blog', href: '#notes' },
  ],

  hero: {
    eyebrow: 'Hi there 👋',
    titleLead: 'Hello, I’m',
    titleAccent: 'Molly.',
    subtitle: 'A developer, creator and lifelong learner.',
    intro:
      '我热爱把想法变成能跑起来的东西 —— 前端界面、交互细节、产品体验，也乐于折腾一些新奇的 AI 小项目。这里记录我的作品、思考与实验。',
    primaryCta: { label: 'Explore My Work', href: '#projects' },
    secondaryCta: { label: 'Get in Touch', href: '#contact' },
    chips: ['React', 'TypeScript', 'Design Systems', 'AI × UI'],
    status: 'Currently building something delightful ✦',
  },

  about: {
    label: 'About Me',
    title: '一半工程师，一半创作者',
    lead: '我用代码表达想法，也用设计打磨体验。',
    paragraphs: [
      '你好，我是 Molly —— 一个喜欢把复杂问题拆解成简单界面的开发者。日常写前端、做组件体系、折腾交互细节，偶尔也写点后端让想法跑得更完整。',
      '我相信好的产品既需要扎实的工程能力，也需要一点点审美坚持。空闲时间我会读设计书、拆解优秀的产品、写下踩坑记录，也喜欢尝试新的 AI 工具并把它们用到真实工作流里。',
    ],
    facts: [
      { label: '主攻方向', value: '前端工程 & 设计系统' },
      { label: '正在探索', value: 'AI × UI / Agent 工具链' },
      { label: '常用语言', value: 'TypeScript · Python · CSS' },
      { label: '所在地', value: '中国 · 远程协作' },
    ],
  },

  projects: [
    {
      name: 'Hello Molly',
      summary:
        '一个用 Vite + React 19 构建的极简个人主页，纯静态产物部署在 Apache 上，强调轻量、可维护与品牌感。',
      tags: ['React', 'Vite', 'CSS'],
      links: [
        { label: 'Live', href: 'https://mymolly.online/' },
        { label: 'Source', href: 'https://github.com/' },
      ],
    },
    {
      name: 'Orbit UI',
      summary:
        '一套面向仪表盘场景的组件库与设计令牌系统，支持深浅色主题切换，专注无障碍与键盘可达性。',
      tags: ['Design System', 'Accessibility', 'Tokens'],
      links: [
        { label: 'Live', href: '#' },
        { label: 'Source', href: 'https://github.com/' },
      ],
    },
    {
      name: 'Prompt Lab',
      summary:
        '一个用于比较和评测不同模型输出的实验性工作台，把提示词迭代变成可视化、可回溯的流程。',
      tags: ['AI', 'Playground', 'Vite'],
      links: [
        { label: 'Live', href: '#' },
        { label: 'Source', href: 'https://github.com/' },
      ],
    },
  ],

  notes: [
    {
      title: 'Why I stopped designing in the browser window',
      date: '2026-10-18',
      summary: '当页面越来越复杂，先定好节奏再动手写代码，往往能省下两倍的时间。',
      href: '#notes',
    },
    {
      title: 'A tiny habit that makes UI work faster',
      date: '2026-09-02',
      summary: '在动手实现之前，先把交互状态列成一张表 —— 包括空态、加载态和错误态。',
      href: '#notes',
    },
    {
      title: 'Notes on building with AI agents',
      date: '2026-07-21',
      summary: '把 AI 接进日常开发流程后，真正省时间的不是写代码，而是写清楚需求与边界。',
      href: '#notes',
    },
  ],

  footer: {
    tagline: 'Designed and built with care. Shipped as static HTML.',
    socials: [
      { label: 'GitHub', href: 'https://github.com/' },
      { label: 'Email', href: 'mailto:hello@mymolly.online' },
      { label: 'RSS', href: '#' },
    ],
    copyright: '© 2026 Molly. All rights reserved.',
  },
}
