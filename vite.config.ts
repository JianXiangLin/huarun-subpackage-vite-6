import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { loadEnv } from 'vite'
import { resolve } from 'path'
import { viteMockServe } from 'vite-plugin-mock'
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import PurgeIcons from 'vite-plugin-purge-icons'
import { createStyleImportPlugin, ElementPlusResolve } from 'vite-plugin-style-import'
import UnoCSS from 'unocss/vite'


// @ts-ignore
import eslintPlugin from 'vite-plugin-eslint'
const packageName = require('./package.json').name
import qiankun from 'vite-plugin-qiankun'
// https://vite.dev/config/
const root = process.cwd()
function pathResolve(dir: string) {
  return resolve(root, '.', dir)
}
export default defineConfig(({ command, mode }) => {
  let env = {} as any
  const isBuild = command === 'build'
  if (!isBuild) {
    env = loadEnv(process.argv[3] === '--mode' ? process.argv[4] : process.argv[3], root)
  } else {
    env = loadEnv(mode, root)
  }
  return {
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
      }),
      VueI18nPlugin({
        runtimeOnly: true,
        compositionOnly: true,
        include: [resolve(__dirname, 'src/locales/**')]
      }),
      viteMockServe({
        ignore: /^\_/,
        mockPath: 'mock',
        enable: env.VITE_USE_ALL_ELEMENT_PLUS_STYLE === 'true'
      }),
      vueJsx(),
      UnoCSS(),
      env.VITE_USE_ALL_ELEMENT_PLUS_STYLE === 'false'
      ? createStyleImportPlugin({
          resolves: [ElementPlusResolve()],
          libs: [
            {
              libraryName: 'element-plus',
              esModule: true,
              resolveStyle: (name) => {
                if (name === 'click-outside') {
                  return ''
                }
                return `element-plus/es/components/${name.replace(/^el-/, '')}/style/css`
              }
            }
          ]
        })
      : undefined,
      createSvgIconsPlugin({
        iconDirs: [pathResolve('src/assets/svgs')],
        symbolId: 'icon-[dir]-[name]',
        svgoOptions: true
      }),
      PurgeIcons()
    ],
    css: {
      preprocessorOptions: {
        less: {
          additionalData: '@import "./src/styles/variables.module.less";',
          javascriptEnabled: true
        }
      }
    },
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
        'Access-Control-Allow-Origin': '*'
      },
      // proxy: {
      //   '/api': {
      //     target: 'https://test.hlsports.net',
      //     changeOrigin: true,
      //     secure: false
      //     // rewrite: (path) => path.replace(/^\/api/, '')
      //   }
      // }
    },
    esbuild: {
      pure: env.VITE_DROP_CONSOLE === 'true' ? ['console.log'] : undefined,
      drop: env.VITE_DROP_DEBUGGER === 'true' ? ['debugger'] : undefined
    },
    build: {
      outDir: env.VITE_OUT_DIR || 'dist',
      sourcemap: env.VITE_SOURCEMAP === 'true',
      cssCodeSplit: !(env.VITE_USE_CSS_SPLIT === 'false')
    }
  }
})
