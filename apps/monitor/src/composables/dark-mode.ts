import { useDark } from '@vueuse/core'
import { computed } from 'vue'
import type { ComputedRef, WritableComputedRef } from 'vue'

type IsDarkModeRef = WritableComputedRef<boolean>
type ThemeRef = ComputedRef<'dark' | 'light'>

const isDarkMode = useDark()
const theme = computed(() => (isDarkMode.value ? 'dark' : 'light'))

export const useIsDarkMode = (): IsDarkModeRef => isDarkMode
export const useTheme = (): ThemeRef => theme
