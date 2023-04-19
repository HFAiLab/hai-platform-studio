import type { GetReportDataBody } from '@hai-platform/client-ailab-server'
import { AilabServerApiName } from '@hai-platform/client-ailab-server'
import { DatePeriod, ReportTaskType } from '@hai-platform/shared'
import { useRefState } from '@hai-platform/studio-pages/lib/hooks/useRefState'
import React, { useContext, useEffect } from 'react'
import { useUpdateEffect } from 'react-use/esm'
import { GrootStatus, useGroot } from 'use-groot'
import { GlobalAilabServerClient } from '../../../api/ailabServer'
import { conn } from '../../../api/serverConnection'
import { HFPanelContext, LoadingStatus } from '../../../components/HFPanel'
import { UsageRankRender } from './render'

import './index.scss'

export const UsageRank = (): JSX.Element => {
  const panelCTX = useContext(HFPanelContext)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [period, periodRef, setPeriod] = useRefState<DatePeriod>(DatePeriod.daily)
  const [currentTaskType] = useRefState<ReportTaskType>(ReportTaskType.gpu)

  const { data, status, req, refresh } = useGroot({
    fetcher: (p: GetReportDataBody) => {
      return GlobalAilabServerClient.request(
        AilabServerApiName.TRAININGS_GET_REPORT_DATA,
        undefined,
        {
          data: p,
        },
      )
    },
    swr: true,
    cacheKey: (params: GetReportDataBody) => conn.getReportDataCacheKey(params),
    auto: false,
  })

  useEffect(() => {
    req({
      DatePeriod: period,
      dateType: 'last',
      taskType: currentTaskType,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, currentTaskType])

  useEffect(() => {
    if (status === GrootStatus.pending || status === GrootStatus.init)
      panelCTX.setLoadingStatus(LoadingStatus.loading)
    if (status === GrootStatus.error) panelCTX.setLoadingStatus(LoadingStatus.error)
    if (status === GrootStatus.success) panelCTX.setLoadingStatus(LoadingStatus.success)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  // 手动 refresh
  useUpdateEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panelCTX.retryFlag])

  return <UsageRankRender reportDataResponse={data} period={period} setPeriod={setPeriod} />
}
