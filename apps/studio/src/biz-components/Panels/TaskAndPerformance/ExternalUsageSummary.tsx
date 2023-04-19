import type { DataUsageSummaryParams } from '@hai-platform/client-ailab-server'
import { AilabServerApiName } from '@hai-platform/client-ailab-server'
import { i18n, i18nKeys } from '@hai-platform/i18n'
import { HTMLSelect } from '@hai-ui/core/lib/esm'
import React, { useEffect, useState } from 'react'
import { GrootStatus, useGroot } from 'use-groot'
import { GlobalAilabServerClient } from '../../../api/ailabServer'
import { DefaultMetricStyle, MetricItem, NO_DATA_TAG } from '../../../components/MetricItem'
import { numberToWanOrThousands } from '../../../utils/convert'

export const ExternalUsageSummary = () => {
  const [summaryType, setSummaryType] = useState('user')
  const { data, refresh, status } = useGroot({
    fetcher: (params: DataUsageSummaryParams) => {
      return GlobalAilabServerClient.request(AilabServerApiName.DATA_USAGE_SUMMARY, {
        ...params,
      })
    },
    auto: false,
  })

  useEffect(() => {
    refresh({ type: summaryType as 'user' | 'group' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summaryType])

  return (
    <div className="external-usage-summary">
      <div className="sub-title">
        {i18n.t(i18nKeys.biz_perf_total_usage_statistics)}
        {data?.data?.shared_group ? ` —— ${data?.data.shared_group}` : null}
      </div>
      <div className="row">
        <div className="main">
          {status === GrootStatus.success ? (
            <>
              <MetricItem
                flex={2}
                style={DefaultMetricStyle.H25}
                title={i18n.t(i18nKeys.biz_perf_total_gpu_hours)}
                value={
                  data?.data?.gpu_hours
                    ? numberToWanOrThousands(data?.data?.gpu_hours)
                    : NO_DATA_TAG
                }
                unit="h"
              />
              <MetricItem
                flex={1}
                style={DefaultMetricStyle.H25}
                title={i18n.t(i18nKeys.biz_perf_total_training_finished)}
                value={data?.data?.chain_task_count ?? NO_DATA_TAG}
              />
              <MetricItem
                flex={2}
                style={DefaultMetricStyle.H25}
                title={i18n.t(i18nKeys.biz_perf_total_avg_gpu_util)}
                value={data?.data?.avg_gpu_util ?? NO_DATA_TAG}
                unit="%"
              />
            </>
          ) : (
            <div style={{ minHeight: 62 }}>Loading...</div>
          )}
        </div>
        <div className="side">
          <div className="label">{i18n.t(i18nKeys.biz_perf_statistics_by)}</div>
          <HTMLSelect fill value={summaryType} onChange={(e) => setSummaryType(e.target.value)}>
            <option value="user">{i18n.t(i18nKeys.base_user)}</option>
            <option value="group">{i18n.t(i18nKeys.base_shared_group)}</option>
          </HTMLSelect>
        </div>
      </div>
    </div>
  )
}
