import { createPinia } from 'pinia'
import type { App } from 'vue'

export const bootstrapPinia = (app: App): void => {
  app.use(createPinia())
}
