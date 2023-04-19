/* eslint-disable camelcase */
/* eslint-disable import/no-extraneous-dependencies */
import child_process from 'child_process'
import path from 'path'
import react from '@vitejs/plugin-react'
import _visualizer from 'rollup-plugin-visualizer'
import { defineConfig } from 'vite'
import _ViteCodeReplace from 'vite-code-replace'
import { createHtmlPlugin } from 'vite-plugin-html'
import notifier from 'vite-plugin-notifier'
import { replaceCodePlugin } from 'vite-plugin-replace'
import svgLoader from 'vite-svg-loader'
import customFunc from './sass-custom-functions.mjs'
import { getConfig } from './scripts/getConfig.mjs'

const ViteCodeReplace = _ViteCodeReplace.default
const visualizer = _visualizer.default

function getUserName() {
  const uname = `${child_process.execSync('whoami')}`.replace(/[\n\s]/g, '')
  return uname
}

const plugins = [
  ViteCodeReplace({
    replaces: [],
  }),
  react(),
  svgLoader(),
  createHtmlPlugin({
    minify: false,
    entry: 'src/apps/studio/main.tsx',
    template: 'hai_studio.html',
    inject: {
      data: {
        studio_config_json_script:
          process.env.NODE_ENV === 'production'
            ? // 在生产环境下，默认是不替换的，但如果需要独立部署，可以选择在这里指定一个 js 路径，
              // 或者在 shared/shared/src/public/utils/url 中补全线上的 url 信息
              `<script>/* studio_config_json_script */</script>`
            : `<script src=${getConfig(
                'ailab-server',
                'bff_url',
              )}/hai/html/hai_config.js></script>`,
      },
    },
  }),
  replaceCodePlugin({
    replacements: [
      {
        from: './iconSvgPaths',
        // src/svgReplace/iconSvgReplacePath.js gzip 前有 400+ kB，动态加载能减少大部分
        to: `${path.resolve(__dirname, 'src/svgReplace/iconSvgReplacePath.js')}`,
      },
    ],
  }),
  notifier(),
]

if (process.env.NODE_ENV === 'production') {
  console.info('push visualizer plugins')
  // 打包依赖展示
  plugins.push(
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  )
}

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  console.info(`vite command: ${command}, mode: ${mode}`)
  return {
    base: './',
    plugins,
    server: {
      port: 9600,
      host: '0.0.0.0',
    },
    // swiper issue 5294
    optimizeDeps: { exclude: ['swiper/types'] },
    css: {
      preprocessorOptions: {
        scss: {
          functions: customFunc,
          // 这样可以保证 pages 用的时候不报错
          additionalData:
            '@import "./src/style/variables.scss"; @import "./src/style/function.scss";',
        },
      },
    },
    build: {
      sourcemap: true,
      rollupOptions: {
        input: {
          index: path.resolve(__dirname, 'hai_studio.html'),
        },
      },
    },
    define: {
      'process.env': {
        BLUEPRINT_NAMESPACE: 'hai-ui',
        HF_FE_ENV: command === 'serve' ? 'development' : 'production',
        DEBUG_USER_NAME: getUserName(),
      },
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.mjs', '.svg', 'scss', '.d.ts'],
      alias: [
        {
          find: /^~/,
          replacement: '',
        },
        {
          find: '@',
          replacement: path.resolve(__dirname, 'src'),
        },
      ],
    },
  }
})
