import { AilabServerApiName } from '@hai-platform/client-ailab-server'
import { i18n, i18nKeys } from '@hai-platform/i18n'
import { Tooltip2 } from '@hai-ui/popover2/lib/esm'
import dayjs from 'dayjs'
import React, { useContext, useEffect } from 'react'
import { useEffectOnce } from 'react-use/esm'
import { GrootStatus, useGroot } from 'use-groot'
import { GlobalAilabServerClient } from '../../../api/ailabServer'
import { HFPanelContext, LoadingStatus } from '../../../components/HFPanel'
import { WebEventsKeys, hfEventEmitter } from '../../../modules/event'
import { TOPIC_DEFAULT_AVATAR_SRC } from '../../../utils'
import './index.scss'

export const UserInfoBlock = () => {
  const panelCTX = useContext(HFPanelContext)

  const { data, status, refresh } = useGroot({
    fetcher: () => {
      return GlobalAilabServerClient.request(AilabServerApiName.TRAININGS_ABOUT_ME_INFO)
    },
    auto: true,
  })

  useEffect(() => {
    if (status === GrootStatus.success) {
      panelCTX.setLoadingStatus(LoadingStatus.success)
    } else if (status === GrootStatus.error) {
      panelCTX.setLoadingStatus(LoadingStatus.error)
    } else {
      panelCTX.setLoadingStatus(LoadingStatus.loading)
    }
  }, [status, panelCTX])

  useEffectOnce(() => {
    const slientFetch = (): void => {
      refresh()
    }
    hfEventEmitter.on(WebEventsKeys.refreshDashboard, slientFetch)
    return () => {
      hfEventEmitter.off(WebEventsKeys.refreshDashboard, slientFetch)
    }
  })

  return (
    <div className="user-info-block-container">
      <div className="row">
        <Tooltip2 content={i18n.t(i18nKeys.biz_about_me_avatar_edit_prompt)} position="top">
          <img className="avatar" src={data?.avatar ?? TOPIC_DEFAULT_AVATAR_SRC} alt="" />
        </Tooltip2>
        <div className="desc">
          <div className="name">{data?.userName}</div>
          <Tooltip2 content={i18n.t(i18nKeys.biz_about_me_group_desc)} position="top">
            <div className="group">{data?.sharedGroup}</div>
          </Tooltip2>
        </div>
      </div>
      {data?.accountCreateTime && (
        <div className="day-count">
          {i18n.t(i18nKeys.biz_about_me_days_count, {
            days: String(dayjs().diff(dayjs(data.accountCreateTime), 'day')),
          })}
        </div>
      )}
    </div>
  )
}
