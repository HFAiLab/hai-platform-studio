import { FileSystemIconLoader } from '@iconify/utils/lib/loader/node-loaders'
import legacy from '@vitejs/plugin-legacy'
import vuePlugin from '@vitejs/plugin-vue'
import path from 'node:path'
import { presetIcons, presetUno } from 'unocss'
import unocssPlugin from 'unocss/vite'
import type { PluginOption } from 'vite'
import { defineConfig } from 'vite'
import { createHtmlPlugin } from 'vite-plugin-html'
import svgLoader from 'vite-svg-loader'
import { getConfig } from './scripts/getConfig.mjs'

export default defineConfig(() => {
  // 将当前构建版本注入到环境变量
  // eslint-disable-next-line import/no-dynamic-require, global-require, @typescript-eslint/no-var-requires
  const pkgVersion = require(path.join(__dirname, 'package.json')).version
  const version = (pkgVersion.split('-').length > 1 ? pkgVersion.split('-')[1] : pkgVersion).split(
    '.',
  )[1]

  process.env.VITE_BUILD_VERSION = version

  return {
    // hint: 根据部署方式，按需修改
    base: '/monitor',
    build: {
      rollupOptions: {
        input: {
          index: path.resolve(__dirname, 'hai_monitor.html'),
        },
        output: {
          manualChunks: {
            'vendor-vue': ['@vueuse/core', 'pinia', 'vue', 'vue-echarts', 'vue-router'],
            'vendor-antd': ['ant-design-vue'],
            'vendor': [
              '@hai-platform/client-ailab-server',
              '@hai-platform/client-api-server',
              '@hai-platform/shared',
              'dayjs',
              'echarts',
              'filesize',
              'workbox-window',
            ],
          },
        },
      },
    },
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
        },
      },
    },
    optimizeDeps: {
      include: ['axios', 'ant-design-vue', 'dayjs', 'echarts', 'query-string'],
      exclude: ['vue-echarts', '@hai-platform/client-api-server', '@hai-platform/shared'],
    },
    plugins: [
      createHtmlPlugin({
        minify: false,
        entry: 'src/main.ts',
        template: 'hai_monitor.html',
        inject: {
          data: {
            monitor_config_json_script:
              process.env.NODE_ENV === 'production'
                ? // 在生产环境下，默认是不替换的，但如果需要独立部署，可以选择在这里指定一个 js 路径，
                  // 或者在 shared/shared/src/public/utils/url 中补全线上的 url 信息
                  `<script>/* monitor_config_json_script */</script>`
                : `<script src=${getConfig(
                    'ailab-server',
                    'bff_url',
                  )}/hai/html/hai_config.js></script>`,
          },
        },
      }),
      svgLoader(),
      unocssPlugin({
        include: [/\.vue$/, /\.vue\?vue/, /\.ts$/],
        presets: [
          presetUno(),
          presetIcons({
            collections: {
              ...Object.fromEntries(
                ['ant-design', 'carbon', 'mdi', 'tabler'].map((item) => [
                  item,
                  FileSystemIconLoader(require.resolve(`@iconify-json/${item}/icons.json`)),
                ]),
              ),
              'hai-platform-priority': FileSystemIconLoader(
                path.resolve(require.resolve('@hai-platform/icons/package.json'), '../priority'),
              ),
              'hai-platform-status': FileSystemIconLoader(
                path.resolve(require.resolve('@hai-platform/icons/package.json'), '../status'),
              ),
            },
          }),
        ],
        rules: [
          ['b-base', { 'border-color': 'var(--border-color-base)' }],
          ['b-split', { 'border-color': 'var(--border-color-split)' }],
          ['bg-hover', { 'background-color': 'var(--item-hover-bg)' }],
          ['bg-hover-light', { 'background-color': 'var(--item-hover-bg-light)' }],
          ['mt-header', { 'margin-top': 'var(--layout-header-height)' }],
          ['text-primary', { color: 'var(--primary-color)' }],
          ['text-main', { color: 'var(--text-color)' }],
          ['text-secondary', { color: 'var(--text-color-secondary)' }],
        ],
      }),
      vuePlugin(),
      legacy({
        targets: ['defaults', 'not IE 11'],
      }),
    ] as PluginOption[],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        'vue-echarts': require.resolve('vue-echarts/dist/index.esm.js'),
      },
    },
  }
})
