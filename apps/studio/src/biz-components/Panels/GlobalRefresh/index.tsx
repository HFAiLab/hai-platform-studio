import { i18n, i18nKeys } from '@hai-platform/i18n'
import { RefreshBtn } from '@hai-platform/studio-pages/lib/ui-components/refresh'
import dayjs from 'dayjs'
import React, { useState } from 'react'
import useEffectOnce from 'react-use/esm/useEffectOnce'
import { WebEventsKeys, hfEventEmitter } from '../../../modules/event'
import './index.scss'

export const GlobalRefresh = () => {
  const getCurrentDateStr = () => dayjs().format('YYYY-MM-DD HH:mm:ss')
  const [updateDateStr, setUpdateStr] = useState(getCurrentDateStr())

  const updateStr = () => {
    setUpdateStr(getCurrentDateStr())
  }

  useEffectOnce(() => {
    hfEventEmitter.on(WebEventsKeys.slientRefreshDashboard, updateStr)
    return () => {
      hfEventEmitter.off(WebEventsKeys.slientRefreshDashboard, updateStr)
    }
  })

  return (
    <div className="global-refresh">
      <p>
        {i18n.t(i18nKeys.biz_update_time)}: {updateDateStr}
      </p>
      <RefreshBtn
        className="refresh-btn"
        onClick={() => {
          setUpdateStr(getCurrentDateStr())
          hfEventEmitter.emit(WebEventsKeys.refreshDashboard, null)
        }}
      />
    </div>
  )
}
