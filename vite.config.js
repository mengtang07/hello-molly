import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' —— 生成相对路径的资源引用，
// 这样构建产物放到任意子目录（如 /var/www/html/mysite/）都能正常工作
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
})
