<script setup lang="ts">
import { HAI_FOOT_STATEMENT_CN, HAI_FOOT_STATEMENT_EN } from '@hai-platform/shared'
import { Divider } from 'ant-design-vue'
import { useVersionStore } from '../../stores'

const buildVersion = import.meta.env.VITE_BUILD_VERSION

const checkUpdate = (): void => {
  useVersionStore().checkHasNewVersion()
}
</script>

<template>
  <footer>
    <Divider />
    <div class="flex flex-row justify-center color-gray">
      <div class="flex flex-col gap-1 items-center">
        <div>{{ HAI_FOOT_STATEMENT_CN }} &copy; {{ HAI_FOOT_STATEMENT_EN }}</div>
        <div>
          <span class="cursor-pointer" title="点击检查更新" @click="checkUpdate">
            Version: {{ buildVersion }}
          </span>
          <a href="/assets/txt/ThirdPartyLicenses.txt" download> DISCLAIMER.</a>
        </div>
      </div>
    </div>
  </footer>
</template>
