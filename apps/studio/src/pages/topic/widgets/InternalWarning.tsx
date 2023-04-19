import { i18n, i18nKeys } from '@hai-platform/i18n'
import { Callout } from '@hai-ui/core/lib/esm'
import React from 'react'

export const InternalWarningLine = () => {
  return window._hf_user_if_in ? (
    <Callout intent="warning">
      请注意：
      {i18n.t(i18nKeys.biz_xtopic_nav)}
      外部用户可以访问，发表内容之前请斟酌是否合规，有无泄密风险，并留意截图之类的细节中包含的信息。
    </Callout>
  ) : null
}
