import { tryOnBeforeUnmount, useDocumentVisibility, useIntervalFn } from '@vueuse/core'
import type { Fn } from '@vueuse/core'
import { provide, ref, watch } from 'vue'
import { dayjs } from '@/utils'

/**
 * 自动刷新间隔
 */
const AUTO_REFRESH_INTERVAL = 60 * 1000

export type RefreshType = 'interval' | 'manually'

/**
 * refresh 的来源等一些信息，如果是手动调用，也可以不传
 * 如果是定时任务，就一定会有这个信息
 */
export interface RefreshOptions {
  refreshType: RefreshType
}

type RefreshFunction = (options?: RefreshOptions) => Promise<void>

const refreshFunctions = ref<RefreshFunction[]>([])
const isRefreshing = ref(false)
const lastRefreshedAt = ref<dayjs.Dayjs>()
const abortController = ref(new AbortController())
const visibility = useDocumentVisibility()

const setRefresh = (funcs: RefreshFunction[]): void => {
  // setRefresh 不能被多个组件同时调用，除非上一个调用的组件已经销毁
  if (refreshFunctions.value.length) {
    throw new Error('setRefresh() has already been called in current view')
  }

  // 设置刷新函数
  refreshFunctions.value = funcs

  provide('refreshing', isRefreshing)
  tryOnBeforeUnmount(() => {
    // 清空之前设置的刷新函数
    refreshFunctions.value = []

    // 结束当前正在进行的刷新操作
    isRefreshing.value = false
    abortController.value.abort()
    abortController.value = new AbortController()
  })
}
const refresh = async (options?: RefreshOptions): Promise<void> => {
  if (refreshFunctions.value.length === 0) return

  // 获取当前请求开始时的 abort signal
  const { signal } = abortController.value
  if (signal?.aborted) return

  if (isRefreshing.value) return
  // 如果页面不可见，跳过刷新
  if (visibility.value === 'hidden') return

  isRefreshing.value = true

  // 注意这里用 allSettled，部分请求失败不影响刷新状态
  await Promise.allSettled(refreshFunctions.value.map((item) => item(options)))

  // 请求完成后如果已经 aborted 则跳过后续操作
  if (signal?.aborted) return

  lastRefreshedAt.value = dayjs()
  isRefreshing.value = false
}

const { pause: pauseAutoRefresh, resume: resumeAutoRefresh } = useIntervalFn(
  () =>
    refresh({
      refreshType: 'interval',
    }),
  AUTO_REFRESH_INTERVAL,
  {
    immediate: false,
    immediateCallback: false,
  },
)

watch(visibility, (current, previous) => {
  if (current === 'visible' && previous === 'hidden') {
    // 从不可见到可见，需要立即刷新一次页面
    refresh({
      refreshType: 'manually',
    })
  }
  if (current === 'hidden' && previous === 'visible') {
    // 从可见到不可见，结束当前正在进行的刷新操作
    isRefreshing.value = false
    abortController.value.abort()
    abortController.value = new AbortController()
  }
})

export const useRefresh = (): {
  refresh: typeof refresh
  setRefresh: typeof setRefresh
  pauseAutoRefresh: Fn
  resumeAutoRefresh: Fn
  isRefreshing: typeof isRefreshing
  lastRefreshedAt: typeof lastRefreshedAt
} => ({
  refresh,
  setRefresh,
  pauseAutoRefresh,
  resumeAutoRefresh,
  isRefreshing,
  lastRefreshedAt,
})
