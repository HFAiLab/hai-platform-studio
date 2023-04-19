import type { App } from 'vue'
import VueVirtualScroller from 'vue-virtual-scroller'

export const bootstrapVirtualScroller = (app: App): void => {
  app.use(VueVirtualScroller)
}
