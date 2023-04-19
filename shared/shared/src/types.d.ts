import type { HaiConfig } from './common'

declare global {
  interface Window {
    _hf_user_if_in?: boolean // 快速判断是否是内部用户
    haiConfig?: HaiConfig
  }
}
