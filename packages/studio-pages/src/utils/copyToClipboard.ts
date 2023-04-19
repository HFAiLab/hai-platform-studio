import { i18n, i18nKeys } from '@hai-platform/i18n'
import { copyToClipboard } from '@hai-platform/studio-toolkit/lib/esm/utils/copyToClipboard'
import type { IToaster } from '@hai-ui/core'

export function simpleCopy(text: string, name?: string, toaster?: IToaster | null) {
  const copySuccess = copyToClipboard(text)

  if (!toaster) {
    return
  }

  if (copySuccess) {
    toaster.show({
      message: i18n.t(i18nKeys.biz_simple_copy_success, { name: name ?? '' }),
      intent: 'success',
      icon: 'tick',
    })
  } else {
    toaster.show({
      message: i18n.t(i18nKeys.biz_simple_copy_failed, { name: name ?? '' }),
      intent: 'warning',
      icon: 'warning-sign',
    })
  }
}
