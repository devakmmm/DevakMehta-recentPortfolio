import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { PROFILE } from './src/data/profile'
import { renderMinimal } from './src/minimal/render'

// The minimalist page (minimal/index.html) is plain HTML: its body is rendered here, at build time and
// in dev, from the same profile the desk uses, so it needs no script at all.
function minimalPage(): Plugin {
  return {
    name: 'minimal-page',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        return html.includes('<!--minimal-->') ? html.replace('<!--minimal-->', renderMinimal(PROFILE)) : html
      },
    },
  }
}

export default defineConfig({
  // 打包后资源用相对路径（dist/index.html 引用 ./assets/...，可放任意子目录/直接打开）
  base: './',
  plugins: [react(), minimalPage()],
  // two pages: the desk at /, the minimalist version at /minimal/
  build: { rollupOptions: { input: { main: 'index.html', minimal: 'minimal/index.html' } } },
  server: { host: true, port: 5173 },
})
