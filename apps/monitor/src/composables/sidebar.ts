import { computed, ref } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import { LAYOUT } from '@/constants'

const isCollapsed = ref(false)
const width = computed(() =>
  isCollapsed.value ? LAYOUT.SIDEBAR_WIDTH_COLLAPSED : LAYOUT.SIDEBAR_WIDTH,
)

export const useSidebar = (): {
  isCollapsed: Ref<boolean>
  width: ComputedRef<number>
} => ({
  isCollapsed,
  width,
})
