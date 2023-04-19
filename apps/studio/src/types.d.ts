import type HFLogger from '@hai-platform/logger'
import type { HaiConfig } from '@hai-platform/shared'
import type { CountlyReport } from '@hai-platform/studio-toolkit/lib/esm/countly'
import type CountlyEventKey from './utils/countly'

declare global {
  interface Window {
    ailabCountly: CountlyReport<CountlyEventKey>
    HFLogger: HFLogger
    externalHashInit: boolean
    haiConfig?: HaiConfig
    is_hai_studio: boolean
  }
}
