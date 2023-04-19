import type { App } from 'vue'
import { bootstrapEcharts } from './echarts'
import { bootstrapPinia } from './pinia'
import { bootstrapRouter } from './router'
import { bootstrapVirtualScroller } from './virtual-scroller'

export const bootstrap = (app: App): void => {
  bootstrapEcharts(app)
  bootstrapPinia(app)
  bootstrapRouter(app)
  bootstrapVirtualScroller(app)
}
