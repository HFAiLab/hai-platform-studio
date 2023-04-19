import type { BasicFetion, FetionAlertParams } from '../schema'

export const FETION_NOTICE_GROUPS = {
  PREPUB_DEV: '',
  ONLINE_DEV: '',
  ONLINE_PUBLIC: '',
}

/**
 * 自定义的监控函数：
 * 默认的 CustomFetion 仅示例，实际生产中最好填充实际的业务逻辑
 */
export class CustomFetion {
  // eslint-disable-next-line require-await
  alert = async (params: FetionAlertParams) => {
    const msg = `${params.namespace}:${params.type} ${params.msg} @${params.assign}`
    // hint: 这里可以自行扩展更多功能
    console.info('[FETION]', msg)
  }
}

export function getFetionClient(): BasicFetion {
  return new CustomFetion()
}
