import { useWindowSize } from '@vueuse/core'
import type { ComputedRef } from 'vue'
import { computed } from 'vue'

const { width } = useWindowSize()
const isVertical = computed(() => width.value < 1400)

export const useIsVertical = (): ComputedRef<boolean> => isVertical
