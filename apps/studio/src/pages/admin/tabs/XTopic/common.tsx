import { NotificationSpecialReceiver } from '@hai-platform/shared'
import React from 'react'

export const recMap = new Map<NotificationSpecialReceiver | 'custom', string>([
  [NotificationSpecialReceiver.INTERNAL, '内部用户'],
  [NotificationSpecialReceiver.EXTERNAL, '外部用户'],
  [NotificationSpecialReceiver.PUBLIC, '全部用户'],
  ['custom', '特定用户'],
])

export const getReceiverOptions = (ignoreCustom = false) => {
  const ret = []
  for (const [key, v] of recMap.entries()) {
    if (key === 'custom' && ignoreCustom) {
      continue
    }
    ret.push(
      <option value={key} key={key}>
        {v}
      </option>,
    )
  }
  return ret
}
