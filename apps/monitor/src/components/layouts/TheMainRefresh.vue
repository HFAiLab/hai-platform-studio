<script setup lang="ts">
import { Tooltip } from 'ant-design-vue'
import { watch } from 'vue'
import { useConfig, useRefresh } from '@/composables'
import { DAYJS_FORMAT } from '@/constants'

const { shouldAutoRefresh } = useConfig()
const { refresh, pauseAutoRefresh, resumeAutoRefresh, isRefreshing, lastRefreshedAt } = useRefresh()

const onClickRefresh = (): void => {
  refresh({
    refreshType: 'manually',
  })
}

const onClickAutoRefresh = (): void => {
  shouldAutoRefresh.value = !shouldAutoRefresh.value
}

watch(
  shouldAutoRefresh,
  (val) => {
    if (val) resumeAutoRefresh()
    else pauseAutoRefresh()
  },
  {
    immediate: true,
  },
)
</script>

<template>
  <div class="flex flex-row items-center justify-between gap-4 text-secondary">
    <Transition mode="out-in" enter-from-class="opacity-0" leave-to-class="opacity-0">
      <div
        v-if="!isRefreshing"
        class="flex flex-row items-center justify-between gap-2 transition-opacity"
      >
        <span>最近更新</span>
        <span>{{ lastRefreshedAt?.format(DAYJS_FORMAT.DATE_H_M_S) }}</span>
      </div>
      <div v-else class="transition-opacity">
        <span>正在更新数据 ...</span>
      </div>
    </Transition>

    <div class="flex flex-row items-center justify-between gap-2 text-1.2rem">
      <div
        class="i-ant-design:sync-outlined cursor-pointer"
        title="立即更新数据"
        @click="onClickRefresh"
      ></div>

      <Tooltip placement="bottomRight">
        <template #title>
          <span>每分钟刷新</span>
        </template>
        <div
          class="cursor-pointer"
          :class="
            shouldAutoRefresh
              ? 'i-mdi:timer-refresh-outline text-primary'
              : 'i-mdi:timer-pause-outline'
          "
          :title="shouldAutoRefresh ? '正在自动更新' : '已关闭自动更新'"
          @click="onClickAutoRefresh"
        ></div>
      </Tooltip>
    </div>
  </div>
</template>
