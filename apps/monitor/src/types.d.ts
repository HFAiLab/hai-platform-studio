// ref: https://blog.csdn.net/HermitSun/article/details/104104762
import type { HaiConfig } from '@hai-platform/shared'

export {}

declare global {
  interface Window {
    haiConfig?: HaiConfig
  }
}
