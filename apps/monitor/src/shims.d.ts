declare module '*.vue' {
  import type { Component } from 'vue'

  const component: Component

  export default component
}

declare module '*.svg' {
  import type { Component } from 'vue'

  const component: Component
  export default component
}

declare module 'echarts/lib/theme/dark' {
  import type { registerTheme } from 'echarts'

  const darkTheme: Parameters<typeof registerTheme>[1]
  export default darkTheme
}

declare module 'dayjs/esm/constant' {
  export const SECONDS_A_HOUR: number
}

declare module 'cytoscape-fcose'
declare module 'cytoscape-popper'
declare module 'vue-virtual-scroller'
