import { i18n, i18nKeys } from '@hai-platform/i18n'
import React from 'react'

export const Exp2EditTip = (props: { value: string; isLock: boolean }) => {
  return (
    <div
      className="edit-tip"
      title={i18n.t(i18nKeys.biz_exp_draft_local_changed_to, {
        value: props.value,
      })}
    >
      {props.isLock ? '**' : '*'}
    </div>
  )
}
