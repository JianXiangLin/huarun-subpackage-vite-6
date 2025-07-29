import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
const packageName = require('./package.json').name
import qiankun from 'vite-plugin-qiankun'
// https://vite.dev/config/
const root = process.cwd()
function pathResolve(dir: string) {
  return resolve(root, '.', dir)
}
export default defineConfig({
  plugins: [
    vue(),
    qiankun(packageName, {
      useDevMode: true
    })
  ],
  resolve: {
    alias: [
      {
        find: /\@\//,
        replacement: `${pathResolve('src')}/`
      }
    ]
  },
  server: {
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  }
})
