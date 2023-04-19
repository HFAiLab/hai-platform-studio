import { i18nKeys } from '@hai-platform/i18n'
import { copyToClipboard } from '@hai-platform/studio-toolkit/lib/esm'
import { Intent } from '@hai-ui/core'
import { t } from './lan'
import { AppToaster } from './toast'

export const copyWithTip = (content: string, succMsg?: string, errMsg?: string): void => {
  if (copyToClipboard(content)) {
    AppToaster.show({
      message: succMsg || t(i18nKeys.biz_ssh_copy_common_success),
      intent: Intent.SUCCESS,
    })
  } else {
    AppToaster.show({
      message: errMsg || t(i18nKeys.biz_ssh_copy_failed),
      intent: Intent.WARNING,
    })
  }
}
