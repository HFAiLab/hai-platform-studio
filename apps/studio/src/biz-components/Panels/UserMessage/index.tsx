import { AilabServerApiName } from '@hai-platform/client-ailab-server'
import type { ClusterUserMessageSchema } from '@hai-platform/shared'
import { MessageItem } from '@hai-platform/studio-pages/lib/biz-components/message'
import { LevelLogger } from '@hai-platform/studio-toolkit'
import React, { useContext, useRef, useState } from 'react'
import useEffectOnce from 'react-use/esm/useEffectOnce'
import useUpdateEffect from 'react-use/esm/useUpdateEffect'
import { GlobalAilabServerClient } from '../../../api/ailabServer'
import './index.scss'
import { NoData } from '../../../components/Errors/NoData'
import { HFPanelContext, LoadingStatus } from '../../../components/HFPanel'
import { WebEventsKeys, hfEventEmitter } from '../../../modules/event'
import { DashBoardConfig } from '../../../pages/home/config'

export const UserMessage = () => {
  const panelCTX = useContext(HFPanelContext)
  const [messages, setMessages] = useState<ClusterUserMessageSchema[]>([])
  const requestTimeRef = useRef<number | null>(null)

  const fetchData = (slient?: boolean) => {
    if (panelCTX.loadingStatus === LoadingStatus.loading) return
    if (!slient) panelCTX.setLoadingStatus(LoadingStatus.loading)

    if (
      requestTimeRef.current &&
      Date.now() - requestTimeRef.current < DashBoardConfig.userMessageRefreshInterval
    ) {
      panelCTX.setLoadingStatus(LoadingStatus.success)
      return
    }

    requestTimeRef.current = Date.now()
    GlobalAilabServerClient.request(AilabServerApiName.CLUSTER_MESSAGE)
      .then((res) => {
        setMessages(res.messages)
        panelCTX.setLoadingStatus(LoadingStatus.success)
      })
      .catch((e) => {
        LevelLogger.error('UserMessage get Error:', e)
        panelCTX.setLoadingStatus(LoadingStatus.error)
      })
  }

  useEffectOnce(() => {
    fetchData()
    const slientFetch = () => {
      fetchData(true)
    }
    hfEventEmitter.on(WebEventsKeys.slientRefreshDashboard, slientFetch)
    return () => {
      hfEventEmitter.off(WebEventsKeys.slientRefreshDashboard, slientFetch)
    }
  })

  useUpdateEffect(() => {
    fetchData()
  }, [panelCTX.retryFlag])

  return (
    <div className="message-container">
      {messages.map((m) => (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <MessageItem key={m.messageId} {...m} closeable={false} />
      ))}
      {!messages.length && <NoData />}
    </div>
  )
}
