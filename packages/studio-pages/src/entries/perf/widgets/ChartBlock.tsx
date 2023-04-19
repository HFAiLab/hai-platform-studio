/* eslint-disable no-nested-ternary */
import { ApiServerApiName } from '@hai-platform/client-api-server'
import { i18n, i18nKeys } from '@hai-platform/i18n'
import { Button, MenuItem, Switch } from '@hai-ui/core/lib/esm'
import { Popover2 } from '@hai-ui/popover2/lib/esm'
import { Select } from '@hai-ui/select/lib/esm'
import React, { useContext, useEffect, useMemo, useState } from 'react'
import type { IPod } from '../../../biz-components/rankSelect'
import { RankSelectWrapper } from '../../../biz-components/rankSelect'
import type { Chain } from '../../../model/Chain'
import type { IQueryType } from '../../../schemas/basic'
import { RefreshBtn } from '../../../ui-components/refresh'
import { shortNodeName } from '../../../utils'
import { simpleCopy } from '../../../utils/copyToClipboard'
import { ServiceContext } from '../app'
import { PerfServiceAbilityNames, PerfServiceNames } from '../schema/services'
import { UChartWrapper } from './ChartComponent'
import type { TaskTsObj } from './ChartComponent/_data_factory'
import type { IMem } from './ChartComponent/_option'

export type { TaskTsObj } from './ChartComponent/_data_factory'

// eslint-disable-next-line @typescript-eslint/naming-convention
export type dKey = 'chain' | 'rank' | 'type' | 'continuous' | 'dataInterval'
export const dkey = new Set(['chain', 'rank', 'type', 'continuous', 'dataInterval']) as Set<dKey>

const TYPE_TO_DISPLAY = {
  gpu: 'GPU',
  cpu: 'CPU / IO',
  mem: 'MEM Usage',
  every_card: 'Every GPU Util',
  every_card_power: 'Every GPU Power',
  every_card_mem: 'Every GPU MEM',
}
const TYPES = [
  'gpu',
  'cpu',
  'mem',
  'every_card',
  'every_card_power',
  'every_card_mem',
] as Array<PerfQueryType>
const DATA_INTERVALS = ['5min', '1min'] as Array<PerfDataInterval>

export type PerfQueryType =
  | 'gpu'
  | 'cpu'
  | 'every_card'
  | 'every_card_power'
  | 'every_card_mem'
  | 'mem'
export type PerfDataInterval = '5min' | '1min'

export type ChartBlockProps = {
  chain: Chain
  rank: number
  type: PerfQueryType
  continuous: boolean
  dataInterval: PerfDataInterval
  createrQueryType: IQueryType
  setter: (type: dKey, v: any) => void
  height?: number
  width?: number
}

const TypeSelect = Select.ofType<PerfQueryType>()
const DataIntervalSelect = Select.ofType<PerfDataInterval>()

export const ChartBlock: React.FC<ChartBlockProps> = ({
  chain,
  rank,
  type,
  continuous,
  createrQueryType,
  dataInterval,
  setter,
  height,
  width,
}) => {
  const [data, setData] = useState<Array<TaskTsObj>>([])
  // 直接传 type 过去会导致 data 和 type 对不齐，在这里加一个 toDisplay 做 useEffect 的同步
  const [toDisplay, setToDisplay] = useState<PerfQueryType>(type)

  const [loading, setLoading] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [labelMemory, setLabelMemory] = useState<IMem>({})

  const context = useContext(ServiceContext)
  const pods = useMemo<Array<IPod>>(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    () => chain.pods.map((v, idx) => ({ ...v, rank: idx, node: shortNodeName(v.node) as string })),
    [chain],
  )
  const fetchData = () => {
    setData([])
    if (!chain) {
      return
    }
    setLoading(true)
    context.app
      .api()
      .getApiServerClient()
      .request(ApiServerApiName.CHAIN_PERF_SERIES, {
        chain_id: chain.chain_id,
        typ: type,
        rank,
        data_interval: dataInterval,
      })
      .then((v) => {
        setLoading(false)
        setErrorMessage(null)
        setData(v.data)
      })
      .catch((err) => {
        setLoading(false)
        const errorMessageTip = err.toString().includes('get_chain_time_series')
          ? '等待后端上线'
          : err.toString()
        setErrorMessage(errorMessageTip)
      })
  }

  useEffect(() => {
    setData([])
    setToDisplay(type)
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, rank, dataInterval])

  return (
    <div className="chart-block">
      <div className="control clearfix">
        <div className="left">
          <label>
            {i18n.t(i18nKeys.biz_perf_chart_rank)}
            <RankSelectWrapper
              className="mr20 ml10"
              pods={pods}
              currentRank={rank}
              onItemSelect={(r) => {
                setter('rank', r)
              }}
            />
          </label>
          <label>
            {i18n.t(i18nKeys.biz_perf_chart_display)}
            <TypeSelect
              className="mr20 ml10"
              popoverProps={{ minimal: true }}
              // eslint-disable-next-line react/no-unstable-nested-components
              itemRenderer={(typ, { handleClick }) => {
                return <MenuItem key={typ} onClick={handleClick} text={TYPE_TO_DISPLAY[typ]} />
              }}
              items={TYPES}
              onItemSelect={(item) => setter('type', item)}
              filterable={false}
              activeItem={type}
            >
              <Button rightIcon="caret-down" text={TYPE_TO_DISPLAY[type]} small />
            </TypeSelect>
          </label>
          <label>
            {i18n.t(i18nKeys.biz_exp_perf_data_interval)}
            <Popover2
              interactionKind="hover-target"
              content={
                <div style={{ padding: 10 }}>
                  {i18n.t(i18nKeys.biz_exp_perf_data_interval_help)}
                </div>
              }
              placement="top"
            >
              <DataIntervalSelect
                className="mr20 ml10"
                popoverProps={{ minimal: true }}
                // eslint-disable-next-line react/no-unstable-nested-components
                itemRenderer={(interval, { handleClick }) => {
                  return <MenuItem key={interval} onClick={handleClick} text={interval} />
                }}
                items={DATA_INTERVALS}
                onItemSelect={(item) => setter('dataInterval', item)}
                filterable={false}
                activeItem={dataInterval}
              >
                <Button rightIcon="caret-down" text={dataInterval} small />
              </DataIntervalSelect>
            </Popover2>
          </label>
          <Switch
            checked={continuous}
            label={i18n.t(i18nKeys.biz_perf_chart_continuous)}
            inline
            onChange={(e) => {
              setter('continuous', (e.target as unknown as HTMLInputElement).checked)
            }}
          />
          <RefreshBtn className="ml10" small onClick={fetchData} />
        </div>
        <div className="right">
          {context.app.api().hasAbility(PerfServiceAbilityNames.duplicate) && (
            <Popover2
              interactionKind="hover-target"
              content={<div style={{ padding: 10 }}>Duplicate this chart</div>}
              placement="top"
            >
              <Button
                icon="duplicate"
                minimal
                small
                onClick={() => {
                  context.app.api().invokeService(PerfServiceNames.openPerformanceChart, {
                    chain: chain as any,
                    rank,
                    continuous,
                    type,
                    duplicate: true,
                    createrQueryType,
                    dataInterval,
                  })
                }}
              />
            </Popover2>
          )}
          <Popover2
            interactionKind="hover-target"
            content={
              <div style={{ padding: 10, lineHeight: '1.5em' }}>
                {i18n.t(i18nKeys.biz_exp_perf_chart_zoom_tip1)} <br />
                {i18n.t(i18nKeys.biz_exp_perf_chart_zoom_tip2)}
              </div>
            }
          >
            <Button minimal small icon="help" />
          </Popover2>
        </div>
      </div>
      <div className="task-name">
        <span
          title={i18n.t(i18nKeys.biz_exp_perf_click_to_copy)}
          className="ptr"
          onClick={() => simpleCopy(chain.showName!, 'Name')}
        >
          Name: {chain.showName}
        </span>
      </div>
      <div className="chain-id">
        <span
          title={i18n.t(i18nKeys.biz_exp_perf_click_to_copy)}
          className="ptr"
          onClick={() => simpleCopy(chain.chain_id, 'Chain ID')}
        >
          Chain: {chain.chain_id}
        </span>
      </div>
      <div className="chart-wrapper">
        {errorMessage ? (
          <div className="err-msg">{errorMessage}</div>
        ) : loading ? (
          <div className="loading">{i18n.t(i18nKeys.biz_loading)}</div>
        ) : (
          <UChartWrapper
            labelMemory={labelMemory}
            setLabelMemory={setLabelMemory}
            data={data}
            toDisplay={toDisplay}
            height={height! - 150 ?? 300}
            width={width! - 20 ?? 700}
            continuous={continuous}
            currentTheme={context.app.api().invokeService(PerfServiceNames.getTheme, null)}
          />
        )}
      </div>
    </div>
  )
}
