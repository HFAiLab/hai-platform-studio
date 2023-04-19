# @hai-platform/icons

> 公共图标 Package

## 图标加入规范

- 不需要指定 svg 的宽高
- 如果颜色有特殊意义，并且不跟随主题变化，可以写死 fill 属性到 svg 中，否则不建议写 fill 属性。

## Usage

```sh
pnpm i @hai-platform/icons
```

### 配合 vite-svg-loader 使用

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import svgLoader from 'vite-svg-loader'

export default defineConfig({
  plugins: [svgLoader()],
})
```

```vue
<!-- Foo.vue -->
<script setup lang="ts">
import Logo from '@hai-platform/icons/logo/high-flyer-ai.svg'
</script>

<template>
  <Logo />
</template>
```

### 配合 unocss icons preset 使用

```ts
// vite.config.ts
import { FileSystemIconLoader } from '@iconify/utils/lib/loader/node-loaders'
import { defineConfig } from 'vite'
import { presetIcons } from 'unocss'
import unocssPlugin from 'unocss/vite'

export default defineConfig({
  plugins: [
    unocssPlugin({
      include: [/\.vue$/, /\.vue\?vue/, /\.ts$/],
      presets: [
        presetIcons({
          collections: {
            'hai-platform-priority': FileSystemIconLoader(
              path.resolve(require.resolve('@hai-platform/icons/package.json'), '../priority'),
            ),
          },
        }),
      ],
    }),
  ],
})
```
