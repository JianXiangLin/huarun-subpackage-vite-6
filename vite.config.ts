import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
// @ts-ignore
import eslintPlugin from 'vite-plugin-eslint'
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
    }),
    eslintPlugin({
      cache: false,
      failOnWarning: false,
      failOnError: false,
      include: ['src/**/*.vue', 'src/**/*.ts', 'src/**/*.tsx'] // 检查的文件
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
