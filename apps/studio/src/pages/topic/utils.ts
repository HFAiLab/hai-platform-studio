// 话题页面通用一些杂项

import { createDialog } from '@hai-platform/studio-pages/lib/ui-components/dialog'

/**
 * 鼓励用户补充用户信息
 */
export const promptUpdateNickName = async () => {
  const res = await createDialog({
    body: '初次发帖前，请将用户信息补充完整',
    title: '用户信息补充提示',
    intent: 'primary',
    confirmText: '去补充',
    cancelText: '取消',
  })
  return res
}
