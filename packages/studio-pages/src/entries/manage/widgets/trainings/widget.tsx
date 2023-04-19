/* eslint-disable react/jsx-no-useless-fragment */
import { AilabServerApiName } from '@hai-platform/client-ailab-server'
import { ApiServerApiName } from '@hai-platform/client-api-server'
import { i18n, i18nKeys } from '@hai-platform/i18n'
import { HF_LOGGER_LEVEL } from '@hai-platform/logger'
import {
  HFNoCacheHeader,
  TaskChainStatus,
  TaskTaskType,
  ifHasWekaLimit,
} from '@hai-platform/shared'
import type {
  ExperimentsSubParamsFilterPart,
  SubPayload,
  SubQueryParams,
} from '@hai-platform/studio-schemas/lib/esm/socket'
import { SubscribeCommands } from '@hai-platform/studio-schemas/lib/esm/socket'
import { Callout } from '@hai-ui/core'
import { Intent } from '@hai-ui/core/lib/esm/common'
import { Button, Switch } from '@hai-ui/core/lib/esm/components'
// @ts-expect-error ignore
import stableStringify from 'fast-stable-stringify'
import allSettled from 'promise.allsettled'
import React, { useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useEffectOnce } from 'react-use/esm'
import { CONSTS } from '../../../../consts'
import { usePageFocus } from '../../../../hooks/usePageFocus'
import type { Chain } from '../../../../model/Chain'
import { createChain } from '../../../../model/Chain'
import { IOFrontier } from '../../../../socket'
import { WindowTitle } from '../../../../ui-components/windowTitle/index'
import { simpleCopy } from '../../../../utils/copyToClipboard'
import { CountlyEventKey } from '../../../../utils/countly/countly'
import HFLogger from '../../../../utils/log'
import { PageGlobalEventEmitter } from '../../../../utils/pageGlobalEmitter'
import { sleep } from '../../../../utils/promise'
import type { IManagerState } from '../../reducer'
import { ManagerServiceContext, getDefaultFilterParams } from '../../reducer'
import type { ExpsPageManageState } from '../../schema'
import { ManageServiceAbilityNames } from '../../schema'
import { EventsKeys } from '../../schema/event'
import { ExpsManageServiceNames } from '../../schema/services'
import { BatchResumeAlertComponent } from './components/BatchResumeAlert'
import { BatchStopAlertComponent } from './components/BatchStopAlert'
import { BatchSuspendAlertComponent } from './components/BatchSuspendAlert'
import { ColumnSetter } from './components/ColumnSetter'
import { Pagination } from './components/Pagination'
import { SwitchCurrentUser } from './components/SwitchCurrentUser'
import { TagsEditorBatch, TagsEditorSingle } from './components/TagsEditor'
import { TaskLists } from './components/TaskList'

const MIN_PAGE_SIZE = 15
// hint: 如果服务端传入超过 50 的 会造成 assert error!
const MAX_PAGE_SIZE = 50

// 标志一下自己发出去的刷新请求
const REFRESH_LIST_SENDER_KEY = 'trainings-refresh-list'

declare global {
  interface Window {
    _select_chain_sync_init: boolean
  }
}

interface SelectChainOptions {
  noShowLog?: boolean
  notEmitSidePanel?: boolean
  forceShowLog?: boolean
}

// 根据当前状态获取需要响应的变化的字符串，因为有些状态属性不需要响应
const getExpPageManagerOrderKey = (manageState: ExpsPageManageState): string => {
  const state = { ...manageState, selectChainId: undefined }
  return stableStringify(state)
}

// 这里主要做得事情是选择一些参数，然后对于一些可选参数，[] 实际上表示全选，因此需要变成 undefined
const getFilterParamsFromState = (state: IManagerState): ExperimentsSubParamsFilterPart => {
  const { manageState } = state
  return {
    nb_name_pattern: manageState.nb_name_pattern,
    worker_status:
      !manageState.worker_status || manageState.worker_status.length === 0
        ? undefined
        : manageState.worker_status,
    queue_status:
      !manageState.queue_status || manageState.queue_status.length === 0
        ? undefined
        : manageState.queue_status,
    created_start_time: manageState.created_start_time,
    created_end_time: manageState.created_end_time,
    group: manageState.group,
    tag: manageState.tag,
    excluded_tag: manageState.excluded_tag,
  }
}

/**
 * 拆成纯函数组件和带状态的组件
 * 如何把长链接和短链接结合起来，即长链接断掉的时候用短的
 */
// Main Window
export const Trainings = (props: {
  setFilterParams: (params: ExperimentsSubParamsFilterPart) => void
  handleSelectChain: (t: Chain, options?: SelectChainOptions) => void
  refreshHandler: (hideToast?: boolean) => void
  loading: boolean
  ioExpireAt?: number
  showAutoRefresh: boolean
}): JSX.Element => {
  const { setFilterParams } = props
  const { loading } = props
  const { handleSelectChain } = props
  const { refreshHandler } = props

  const srvc = useContext(ManagerServiceContext)
  const trainingsContainer = useRef<HTMLDivElement>(null)
  const selectedChain = srvc.state.currentSelectedChain
  const totalChain = srvc.state.totalChainCount
  const { updatedAt } = srvc.state
  const { selectChains } = srvc.state
  const { manageState } = srvc.state
  const { currentPage, pageSize, showValidation } = manageState
  const chainList = srvc.state.trainingsList

  const [batchStopAlertShow, setBatchStopAlertShow] = useState<boolean>(false)
  const [batchStopping, setBatchStopping] = useState<boolean>(false)
  // 当前是否是点击了批量按钮，点击全选之后，再点击某一个之后可能会变
  const [batchTotalChecked, setBatchStopTotalChecked] = useState<boolean>(false)
  const [switchUserOpen, setSwitchUserOpen] = useState<boolean>(false)

  const [batchResuming, setBatchResuming] = useState<boolean>(false)
  const [batchResumeAlertShow, setBatchResumeAlertShow] = useState<boolean>(false)

  const [batchSuspending, setBatchSuspending] = useState<boolean>(false)
  const [batchSuspendAlertShow, setBatchSuspendAlertShow] = useState<boolean>(false)

  const [hasWekaLimit, setHasWekaLimit] = useState<boolean>(false)

  const [tagsEditorSingleShow, setTagsEditorSingleShow] = useState(false)
  const [tagEditorSingleChain, setTagEditorSingleChain] = useState<Chain | undefined>()

  const [tagsEditorBatchShow, setTagsEditorBatchShow] = useState(false)

  const handleTagEditorSingleClick = (chain: Chain) => {
    setTagEditorSingleChain(chain)
    setTagsEditorSingleShow(true)
  }
  const handleBatchEditTagClick = () => {
    setTagsEditorBatchShow(true)
  }
  const clearSelectedChains = () => {
    srvc.dispatch({ type: 'selectChains', value: [] })
    setBatchStopTotalChecked(false)
  }

  const canSwitchAutoShowLog = srvc.app
    .api()
    .hasAbility(ManageServiceAbilityNames.switchAutoShowLog)

  const handleBatchStopClick = () => {
    setBatchStopAlertShow(true)
  }

  const handleBatchResumeAlertShowClick = () => {
    setBatchResumeAlertShow(true)
  }

  const handleBatchSuspendAlertClick = () => {
    setBatchSuspendAlertShow(true)
  }

  const handleBatchStopSelect = useCallback(
    (chain: Chain, select: boolean): void => {
      if (select) {
        srvc.dispatch({
          type: 'selectChains',
          value: [...selectChains, chain],
        })
      } else {
        srvc.dispatch({
          type: 'selectChains',
          value: selectChains.filter((c) => c.id !== chain.id),
        })
        setBatchStopTotalChecked(false)
      }
    },
    [selectChains, srvc],
  )

  const handleBatchTotalSelect = () => {
    if (!batchTotalChecked) {
      srvc.dispatch({
        type: 'selectChains',
        value: chainList,
      })
      setBatchStopTotalChecked(true)
    } else {
      srvc.dispatch({ type: 'selectChains', value: [] })
      setBatchStopTotalChecked(false)
    }
  }

  const toaster = srvc.app.api().getHFUIToaster()!

  const batchResume = async (resumeChains: Chain[]) => {
    setBatchResuming(true)
    const promises: Promise<any>[] = []

    resumeChains.forEach((chain) => {
      const p = chain.control({
        action: 'resume',
        needConfirm: false,
        skipSuccessTip: true,
        errorHandler: srvc.app.api().getErrorHandler(),
        toast: srvc.app.api().getHFUIToaster()?.show,
      })
      promises.push(p)
    })

    const result = await allSettled(promises)

    const successCount = result.filter((item) => item.status === 'fulfilled').length
    const failCount = result.filter((item) => item.status !== 'fulfilled').length

    // 先更新用户交互：
    if (failCount === 0) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      toaster.show({
        icon: 'tick',
        intent: Intent.SUCCESS,
        message: i18n.t(i18nKeys.biz_batch_resume_success_all),
      })
    } else {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      toaster.show({
        icon: 'info-sign',
        intent: Intent.NONE,
        message: i18n.t(i18nKeys.biz_batch_resume_success_part, {
          success: successCount,
          fail: failCount,
        }),
      })
    }

    // 再更新交互状态：
    setBatchResuming(false)
    setBatchResumeAlertShow(false)
    srvc.dispatch({ type: 'selectChains', value: [] })
    setBatchStopTotalChecked(false)

    // 最后通知更新侧边栏，先移除缓存
    // MagicNumber 1500：随便拍的，让后端数据库主从同步有更充分的时间（侧边栏那里还有一处）
    await sleep(1500)
    await srvc.app
      .api()
      .getAilabServerClient()
      .request(AilabServerApiName.SOCKET_CONTROL_DELETE_TASK_CACHE, undefined, {
        data: {
          paramsList: resumeChains.map((chain) => ({
            chain_id: chain.chain_id,
            token: srvc.app.api().getToken(),
          })),
        },
      })

    PageGlobalEventEmitter.emit(
      CONSTS.EXPS_LAST_RESUME_CHAIN_ID_LIST,
      resumeChains.map((chain) => chain.chain_id),
    )

    // 针对同一个浏览器的其他页面触发侧边栏的更新：
    window.localStorage.setItem(
      CONSTS.EXPS_LAST_RESUME_CHAIN_ID_LIST,
      // 相同的 chain_id 不会触发 storage 事件，所以加一个随机数
      JSON.stringify(resumeChains.map((chain) => chain.chain_id).concat(`${Date.now()}`)),
    )

    srvc.app.api().countlyReportEvent(CountlyEventKey.BatchResume)
  }

  const batchSuspend = async (suspendChains: Chain[]) => {
    setBatchSuspending(true)

    const promises: Promise<any>[] = []
    suspendChains.forEach((chain) => {
      const p = chain.control({
        action: 'suspend',
        needConfirm: false,
        skipSuccessTip: true,
        errorHandler: srvc.app.api().getErrorHandler(),
        toast: srvc.app.api().getHFUIToaster()?.show,
      })
      promises.push(p)
    })

    const result = await allSettled(promises)
    const successCount = result.filter((item) => item.status === 'fulfilled').length
    const failCount = result.filter((item) => item.status !== 'fulfilled').length

    // 先更新用户交互：
    if (failCount === 0) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      toaster.show({
        icon: 'tick',
        intent: Intent.SUCCESS,
        message: i18n.t(i18nKeys.biz_batch_suspend_success_all),
      })
    } else {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      toaster.show({
        icon: 'info-sign',
        intent: Intent.NONE,
        message: i18n.t(i18nKeys.biz_batch_suspend_success_part, {
          success: successCount,
          fail: failCount,
        }),
      })
    }

    setBatchSuspending(false)
    setBatchSuspendAlertShow(false)
    srvc.dispatch({ type: 'selectChains', value: [] })
    setBatchStopTotalChecked(false)
  }

  const batchStop = async () => {
    setBatchStopping(true)
    const promises: Promise<any>[] = []

    const notFinishedChains = selectChains.filter(
      (chain) => chain.chain_status !== TaskChainStatus.FINISHED,
    )

    notFinishedChains.forEach((chain) => {
      const p = chain.control({
        action: 'stop',
        needConfirm: false,
        skipSuccessTip: true,
        errorHandler: srvc.app.api().getErrorHandler(),
        toast: srvc.app.api().getHFUIToaster()?.show,
      })
      promises.push(p)
    })

    const result = await allSettled(promises)
    HFLogger.log(`stop allSettled: ${result}`, HF_LOGGER_LEVEL.INFO)

    const successCount = result.filter((item) => item.status === 'fulfilled').length
    const failCount = result.filter((item) => item.status !== 'fulfilled').length

    if (failCount === 0) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      toaster.show({
        icon: 'tick',
        intent: Intent.SUCCESS,
        message: i18n.t(i18nKeys.biz_batch_stop_success_all),
      })
    } else {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      toaster.show({
        icon: 'info-sign',
        intent: Intent.NONE,
        message: i18n.t(i18nKeys.biz_batch_stop_success_part, {
          success: successCount,
          fail: failCount,
        }),
      })
    }

    setBatchStopping(false)
    setBatchStopAlertShow(false)
    srvc.dispatch({ type: 'selectChains', value: [] })
    setBatchStopTotalChecked(false)
  }

  const fetchIfWekaLimit = async () => {
    const res = await srvc.app
      .api()
      .getAilabServerClient()
      .request(AilabServerApiName.TRAININGS_USER_NODE_QUOTA_INFO)

    setHasWekaLimit(ifHasWekaLimit(res.total))
  }

  const handlePagiChange = (e: { selected: number }): void => {
    if (e.selected === currentPage) {
      return
    }
    srvc.dispatch({
      type: 'manageState',
      value: {
        currentPage: e.selected,
      },
    })
    srvc.dispatch({ type: 'selectChains', value: [] })
    setBatchStopTotalChecked(false)
  }

  const handleFilterApply = (opts: ExperimentsSubParamsFilterPart): void => {
    try {
      setFilterParams(opts)
    } catch (e) {
      srvc.app.api().getErrorHandler().handleError(String(e), true)
    }
  }

  useLayoutEffect(() => {
    if (Number.isNaN(pageSize)) {
      if (!trainingsContainer.current) {
        return
      }

      // 原则上这个可以通过 ref 等方式计算得到，不过这样代码会多很多，考虑页面结构变化不多，在这里写死了
      const TitleHeight = 64
      const ToolHeight = 44
      const PaginationHeight = 42

      const TableContentHeight =
        trainingsContainer.current.offsetHeight - TitleHeight - ToolHeight - PaginationHeight
      const nextPageSize = Math.min(
        Math.max(Math.floor(TableContentHeight / 38), MIN_PAGE_SIZE),
        MAX_PAGE_SIZE,
      )

      srvc.dispatch({
        type: 'manageState',
        value: {
          pageSize: nextPageSize,
        },
      })
    }
  })

  const copyNodesCallback = (e: KeyboardEvent) => {
    if (!(e.altKey && (e.key === 'C' || e.key === 'c'))) return
    const rawSelection = document.getSelection()
    if (!rawSelection) return
    const allChainNodes = document.getElementsByClassName('tn-item-worker') || []
    const selectChainIds = [...allChainNodes]
      .filter((item) => rawSelection?.containsNode(item))
      .map((item) => {
        return (item as any).dataset.chain_id
      })
    const copyStr = chainList
      .filter((item) => selectChainIds.includes(item.chain_id))
      .map((item) => {
        return `${item.nb_name} ${item.chain_id}: \n${item.pods.map((pod) => pod.node).join(',')}`
      })
      .join('\n')
    if (!copyStr) return
    simpleCopy(copyStr, 'Node Lists(batch)', srvc.app.api().getHFUIToaster())
  }

  useEffect(() => {
    document.addEventListener('keydown', copyNodesCallback)
    return () => {
      document.removeEventListener('keydown', copyNodesCallback)
    }
  })

  usePageFocus(() => {
    srvc.app.api().getLogger().info('page focus, refresh trainings')
    props.refreshHandler(true)
    fetchIfWekaLimit()
  })

  useEffectOnce(() => {
    fetchIfWekaLimit()
  })

  // render 开始
  return (
    <div className="trainings-widget">
      <TagsEditorSingle
        isOpen={tagsEditorSingleShow}
        setShow={setTagsEditorSingleShow}
        targetChain={tagEditorSingleChain}
        refreshHandler={refreshHandler}
      />
      <TagsEditorBatch
        selectChains={selectChains}
        isOpen={tagsEditorBatchShow}
        successCallback={clearSelectedChains}
        setShow={setTagsEditorBatchShow}
        refreshHandler={refreshHandler}
      />
      <BatchStopAlertComponent
        isOpen={batchStopAlertShow}
        batchStop={batchStop}
        selectChains={selectChains}
        batchStopping={batchStopping}
        setBatchStopAlertShow={setBatchStopAlertShow}
      />
      <BatchResumeAlertComponent
        isOpen={batchResumeAlertShow}
        batchResume={batchResume}
        selectChains={selectChains}
        batchResuming={batchResuming}
        setBatchResumeAlertShow={setBatchResumeAlertShow}
      />
      <BatchSuspendAlertComponent
        isOpen={batchSuspendAlertShow}
        batchSuspend={batchSuspend}
        selectChains={selectChains}
        batchSuspending={batchSuspending}
        setBatchSuspendAlertShow={setBatchSuspendAlertShow}
      />
      <WindowTitle
        // showRefresh
        showAutoRefresh={props.showAutoRefresh}
        showRefresh={!props.showAutoRefresh}
        showUpdateTime
        updateDate={updatedAt ?? new Date(0)}
        title={i18n.t(i18nKeys.biz_exp_training_history_title_h)}
        onRefresh={refreshHandler}
      />
      <SwitchCurrentUser
        isOpen={switchUserOpen}
        onClose={() => {
          setSwitchUserOpen(false)
        }}
      />

      <div className="trainings-container" ref={trainingsContainer}>
        {/* 暂时不开这个能力 */}
        {/* <Button
          icon="user"
          small
          minimal
          className="change-current-user"
          title="切换为只读其他用户"
          onClick={() => {
            setSwitchUserOpen(true)
          }}
        /> */}
        <div className="trainings-user-op-bar">
          <Switch
            disabled={!canSwitchAutoShowLog}
            checked={srvc.state.autoShowLog}
            className="autoShowLog-switch"
            label={i18n.t(i18nKeys.biz_exp_auto_show_log)}
            onChange={() =>
              srvc.dispatch({
                type: 'autoShowLog',
                value: !srvc.state.autoShowLog,
              })
            }
          />
          <Button
            small
            outlined
            className="fast-reset-filter"
            onClick={() => {
              srvc.app.emit(EventsKeys.ResetFilters, null)
            }}
          >
            {i18n.t(i18nKeys.biz_filter_reset)}
          </Button>
          {!window.is_hai_studio && <ColumnSetter />}
        </div>
        {hasWekaLimit && (
          <Callout intent="warning" className="storage-usage-warning">
            {i18n.t(i18nKeys.biz_storage_exceed_tip_in_manage)}
          </Callout>
        )}

        <div className="float-left">
          {Number.isNaN(pageSize) ? (
            <></>
          ) : (
            <>
              <TaskLists
                loading={loading}
                showValidation={{
                  value: showValidation,
                  setter: (value: boolean) => {
                    srvc.dispatch({
                      type: 'manageState',
                      value: {
                        showValidation: value,
                        currentPage: 1,
                      },
                    })
                  },
                }}
                selectChains={selectChains}
                handleBatchStopClick={handleBatchStopClick}
                handleBatchResumeAlertClick={handleBatchResumeAlertShowClick}
                handleBatchSuspendAlertClick={handleBatchSuspendAlertClick}
                handleBatchStopSelect={handleBatchStopSelect}
                handleTagEditorSingleClick={handleTagEditorSingleClick}
                handleBatchEditTagClick={handleBatchEditTagClick}
                tasks={chainList}
                updatedAt={updatedAt?.toString() ?? ''}
                ioExpireAt={props.ioExpireAt || 0}
                selected={selectedChain}
                handleSelect={handleSelectChain}
                refreshHandler={refreshHandler}
                filterHandler={handleFilterApply}
                batchTotalChecked={batchTotalChecked}
                handleBatchTotalSelect={handleBatchTotalSelect}
              />
              {totalChain && !loading ? (
                <Pagination
                  loading={loading}
                  pageCount={Math.ceil(totalChain / pageSize)}
                  forcePage={currentPage}
                  changeHandler={handlePagiChange}
                />
              ) : (
                <></>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ===================== Recent Tasks End =====================
export const IOTrainingsContainer = (): JSX.Element => {
  const srvc = useContext(ManagerServiceContext)
  const { manageState } = srvc.state
  const { showValidation, pageSize, currentPage } = manageState
  const [loading, setLoading] = useState<boolean>(true)
  const { autoShowLog } = srvc.state
  const selectedChain = srvc.state.currentSelectedChain
  const [frontierId, setFrontierId] = useState<number | null>(null)
  const [ioExpireAt, setIoExpireAt] = useState<number>(0)

  const setFilterParams = (params: ExperimentsSubParamsFilterPart): void => {
    srvc.dispatch({
      type: 'manageState',
      value: {
        ...getDefaultFilterParams(),
        ...params,
      },
    })
  }

  const handleSelectChain = useCallback(
    (t: Chain, options?: SelectChainOptions): void => {
      srvc.batchDispatch([
        { type: 'currentSelectedChain', value: t },
        {
          type: 'manageState',
          value: {
            selectChainId: t.chain_id,
          },
        },
      ])
      if (options?.forceShowLog || (autoShowLog && !options?.noShowLog)) {
        srvc.app.api().invokeService(ExpsManageServiceNames.openLog, {
          chain: t,
          rank: 0,
          queryType: 'chainId',
          ignoreRank: true,
        })
      }
      if (!options?.notEmitSidePanel) {
        srvc.app.setCurrentChain(t)
      }
    },
    [autoShowLog, srvc],
  )

  const expireFrontierData = useCallback(() => {
    if (frontierId === null) {
      return false
    }
    const expireRes = IOFrontier.getInstance().expireById(frontierId)
    srvc.app.api().getLogger().info('manage update expire result:', expireRes)
    return true
  }, [frontierId, srvc.app])

  const refreshHandler = useCallback(() => {
    // update: 长链接的时候不触发 ExpsManageServiceNames.emitChainChanged
    srvc.app.api().countlyReportEvent(CountlyEventKey.TrainingsRefresh)

    expireFrontierData()
    // 这个 refresh 会触发服务端重新比较一次，但是不一定会发送全量过来
    // 因此不一定收到 TasksRealTimeChangeCallback，所以这里手动模拟一下 updateAt 的变化
    srvc.dispatch({ type: 'updatedAt', value: new Date() })
    setIoExpireAt(Date.now())
  }, [expireFrontierData, srvc])

  const TasksRealTimeChangeCallback = (payload: SubPayload<SubscribeCommands.Experiments2>) => {
    if (!payload.content) {
      srvc.app
        .api()
        .getHFUIToaster()
        ?.show({
          message: i18n.t(i18nKeys.socket_get_tasks_failed),
          intent: 'danger',
        })
      return
    }
    const { total, tasks } = payload.content
    const chains = tasks.map((item) => createChain(item, srvc.app.api()))

    /**
     * 在收到第一次数据返回的时候，如果 url 里面已经有选中的 chain 的 id，是需要同步一次的
     */
    if (!window._select_chain_sync_init && !selectedChain && manageState.selectChainId) {
      const hit = chains.find(
        (chain: { chain_id: string }) => chain.chain_id === manageState.selectChainId,
      )
      if (hit) {
        handleSelectChain(hit, {
          forceShowLog: manageState.defaultSelectLogOpen,
        })
      } else {
        srvc.app
          .api()
          .getApiServerClient()
          .request(
            ApiServerApiName.GET_USER_TASK,
            {
              token: srvc.app.api().getToken(),
              chain_id: manageState.selectChainId,
            },
            {
              headers: {
                ...HFNoCacheHeader,
              },
            },
          )
          .then((res) => {
            const chain = createChain(res.task, srvc.app.api())
            handleSelectChain(chain, {
              forceShowLog: manageState.defaultSelectLogOpen,
            })
          })
      }
      window._select_chain_sync_init = true
    }

    srvc.dispatch({ type: 'trainingsList', value: chains })
    srvc.dispatch({ type: 'totalChainCount', value: total })

    if (selectedChain) {
      const selectedChainId = selectedChain.chain_id
      const hit = chains.filter((chain: { chain_id: string }) => chain.chain_id === selectedChainId)
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      hit.length &&
        handleSelectChain(hit[0]!, {
          noShowLog: true,
          notEmitSidePanel: true,
        })
    }

    srvc.dispatch({ type: 'updatedAt', value: new Date() })
    setLoading(false)
  }

  const manageStateOrderString = getExpPageManagerOrderKey(srvc.state.manageState)

  useEffect(() => {
    const filterParams = getFilterParamsFromState(srvc.state)

    if (frontierId !== null) {
      srvc.app.api().getLogger().info(`unsub frontierId:${frontierId}`)
      IOFrontier.getInstance().unsub(frontierId)
    }

    if (Number.isNaN(pageSize)) {
      return () => {
        if (frontierId !== null) {
          IOFrontier.getInstance().unsub(frontierId)
        }
      }
    }

    setLoading(true)
    // hint: 注意是不是首次添加
    const currentId = IOFrontier.getInstance().sub<SubQueryParams[SubscribeCommands.Experiments2]>(
      SubscribeCommands.Experiments2,
      {
        query: {
          page: currentPage,
          page_size: pageSize || 10,
          task_type: showValidation
            ? [
                TaskTaskType.TRAINING_TASK,
                TaskTaskType.VIRTUAL_TASK,
                TaskTaskType.BACKGROUND_TASK,
                TaskTaskType.VALIDATION_TASK,
              ]
            : [TaskTaskType.TRAINING_TASK, TaskTaskType.VIRTUAL_TASK, TaskTaskType.BACKGROUND_TASK],
          token: srvc.app.api().getToken(),
          userName: srvc.app.api().invokeService(ExpsManageServiceNames.getUserName, null),
          ...filterParams,
        },
      },
      TasksRealTimeChangeCallback,
    )

    srvc.app.api().getLogger().info(`sub SubscribeCommands.Experiments:${currentId}`)

    setFrontierId(currentId)
    return () => {
      if (currentId !== null) {
        IOFrontier.getInstance().unsub(currentId)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showValidation, manageStateOrderString, currentPage, pageSize])

  return (
    <Trainings
      showAutoRefresh={false}
      refreshHandler={refreshHandler}
      setFilterParams={setFilterParams}
      handleSelectChain={handleSelectChain}
      ioExpireAt={ioExpireAt}
      loading={loading}
    />
  )
}

export const HTTPTrainingsContainer = (): JSX.Element => {
  const srvc = useContext(ManagerServiceContext)
  const [loading, setLoading] = useState<boolean>(true)
  const { autoShowLog } = srvc.state
  const selectedChain = srvc.state.currentSelectedChain

  const setFilterParams = (params: ExperimentsSubParamsFilterPart): void => {
    srvc.dispatch({
      type: 'manageState',
      value: {
        ...getDefaultFilterParams(),
        ...params,
      },
    })
  }

  const handleSelectChain = (t: Chain, options?: SelectChainOptions): void => {
    srvc.dispatch({ type: 'currentSelectedChain', value: t })
    if (options?.forceShowLog || (autoShowLog && !options?.noShowLog)) {
      srvc.app.api().invokeService(ExpsManageServiceNames.openLog, {
        chain: t,
        rank: 0,
        queryType: 'chainId',
        ignoreRank: true,
      })
    }
    if (!options?.notEmitSidePanel) {
      srvc.app.setCurrentChain(t)
    }
  }

  const fetchTasks = () => {
    const filterParams = getFilterParamsFromState(srvc.state)
    const { showValidation, pageSize, currentPage } = srvc.state.manageState

    setLoading(true)
    return srvc.app
      .api()
      .getApiServerClient()
      .request(ApiServerApiName.GET_USER_TASKS, {
        token: srvc.app.api().getToken(),
        page: currentPage,
        page_size: pageSize || 10,
        task_type: showValidation
          ? [
              TaskTaskType.TRAINING_TASK,
              TaskTaskType.VIRTUAL_TASK,
              TaskTaskType.BACKGROUND_TASK,
              TaskTaskType.VALIDATION_TASK,
            ]
          : [TaskTaskType.TRAINING_TASK, TaskTaskType.VIRTUAL_TASK, TaskTaskType.BACKGROUND_TASK],
        ...filterParams,
      })
      .then((res) => {
        const { total, tasks } = res
        const chains = tasks.map((item) => createChain(item, srvc.app.api()))
        srvc.dispatch({ type: 'trainingsList', value: chains })
        srvc.dispatch({ type: 'totalChainCount', value: total })

        if (selectedChain) {
          const selectedChainId = selectedChain.chain_id
          const hit = chains.filter(
            (chain: { chain_id: string }) => chain.chain_id === selectedChainId,
          )
          if (hit.length)
            handleSelectChain(hit[0]!, {
              noShowLog: true,
              notEmitSidePanel: true,
            })
        }

        srvc.dispatch({ type: 'updatedAt', value: new Date() })
        setLoading(false)
      })
      .catch((e) => {
        setLoading(false)
        srvc.app.api().getErrorHandler().handleFetchError(e, 'tasks', true)
      })
  }

  const refreshHandler = (hideToast?: boolean) => {
    if (selectedChain) {
      srvc.app.api().invokeService(ExpsManageServiceNames.emitChainChanged, {
        chainId: selectedChain.chain_id,
        sender: REFRESH_LIST_SENDER_KEY,
      })
    }
    srvc.app.api().countlyReportEvent(CountlyEventKey.TrainingsRefresh)

    fetchTasks().then(() => {
      if (!hideToast) {
        srvc.app.api().getHFUIToaster()!.show({
          icon: 'tick',
          intent: Intent.SUCCESS,
          message: 'Experiments update success',
        })
      }
    })
  }

  useEffect(() => {
    if (Number.isNaN(srvc.state.manageState.pageSize)) {
      return
    }
    fetchTasks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [srvc.state.manageState])

  return (
    <Trainings
      showAutoRefresh={false}
      refreshHandler={refreshHandler}
      setFilterParams={setFilterParams}
      handleSelectChain={handleSelectChain}
      loading={loading}
    />
  )
}
