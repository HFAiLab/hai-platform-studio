import type { GetReportDataResult } from '@hai-platform/client-ailab-server'
import { i18n, i18nKeys } from '@hai-platform/i18n'
import { DatePeriod } from '@hai-platform/shared'
import type { ArtColumn } from 'ali-react-table/dist/interfaces'
import React from 'react'
import { NoData } from '../../../components/Errors/NoData'
import { HFDashTable } from '../../../components/HFTable'
import { DefaultMetricStyle, MetricItem, NO_DATA_TAG } from '../../../components/MetricItem'
import { PeriodSwitch } from '../../../components/PeriodSwitch'
import { convertDateStrToDisplay } from '../../../utils/convert'

export const UsageRankRender = React.memo(
  (props: {
    reportDataResponse: GetReportDataResult | undefined | null
    period: DatePeriod
    setPeriod: (value: DatePeriod) => void
  }) => {
    const columns = [
      { code: 'rank', name: 'Rank', width: 1, align: 'left' },
      {
        code: 'gpu_rate',
        name: 'GPU Util',
        width: 1,
        align: 'left',
        render: (p) => {
          return `${Number(p).toFixed(2)} %`
        },
      },
      {
        code: 'gpu_hours',
        name: 'GPU Hours',
        width: 1,
        align: 'left',
        render: (p) => {
          return `${Number(p).toFixed(0)} h`
        },
      },
    ] as Array<ArtColumn>

    return (
      <div className="rank-container" id="studio-home-rank-container">
        <div className="rank-top">
          <div className="rate">
            <MetricItem
              title={i18n.t(i18nKeys.biz_rank_my_rank)}
              value={props.reportDataResponse?.reportData?.ranks?.rank ?? NO_DATA_TAG}
              style={DefaultMetricStyle.H2}
            />
          </div>
        </div>
        <div className="rank-top5">
          <div className="title">TOP5</div>
          <HFDashTable
            columns={columns}
            emptyCellHeight={140}
            components={{
              // eslint-disable-next-line react/no-unstable-nested-components
              EmptyContent: () => <NoData />,
            }}
            dataSource={props.reportDataResponse?.reportData?.topRanks ?? ([] as any)}
          />
        </div>
        <div className="corner">
          <PeriodSwitch
            availablePeriods={[
              { period: DatePeriod.daily, disabled: false },
              { period: DatePeriod.weekly, disabled: false },
              { period: DatePeriod.monthly, disabled: false },
            ]}
            currentPeriod={props.period}
            outlined
            small
            setter={props.setPeriod}
          />
          <div className="periodInfo">
            <div>{convertDateStrToDisplay(props.reportDataResponse?.dateStr, props.period)}</div>
          </div>
        </div>
      </div>
    )
  },
)

UsageRankRender.displayName = 'UsageRankRender'
