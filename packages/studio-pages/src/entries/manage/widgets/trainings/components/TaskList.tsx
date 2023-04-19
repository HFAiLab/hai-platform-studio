import { AilabServerApiName } from '@hai-platform/client-ailab-server'
import { ApiServerApiName } from '@hai-platform/client-api-server'
import { i18n, i18nKeys } from '@hai-platform/i18n'
import { TaskTaskType, excludeStar, getSimpleGroup } from '@hai-platform/shared'
import type {
  ExperimentsSubParamsFilterPart,
  SubQueryParams,
} from '@hai-platform/studio-schemas/lib/esm/socket'
import { SubscribeCommands } from '@hai-platform/studio-schemas/lib/esm/socket'
import { secondsToDisplay } from '@hai-platform/studio-toolkit/lib/esm/utils/convert'
import {
  MetaType,
  getMetaList,
} from '@hai-platform/studio-toolkit/lib/esm/utils/nodeNetworkMetaMap'
import { Tag } from '@hai-ui/core/lib/esm'
import { Colors, Position } from '@hai-ui/core/lib/esm/common'
import { Checkbox, Icon } from '@hai-ui/core/lib/esm/components'
import { Popover2 } from '@hai-ui/popover2'
import { Tooltip2 } from '@hai-ui/popover2/lib/esm/tooltip2'
import classNames from 'classnames'
import dayjs from 'dayjs'
import React, { useContext, useEffect, useState } from 'react'
import { useEffectOnce } from 'react-use'
import { CONSTS } from '../../../../../consts'
import { useRefState } from '../../../../../hooks/useRefState'
import type { Chain } from '../../../../../model/Chain'
import { IOFrontier } from '../../../../../socket'
import { HFLoading } from '../../../../../ui-components/HFLoading'
import { InlineIcon, PriorityIcon, StatusIconV2, icons } from '../../../../../ui-components/svgIcon'
import { SVGWrapper } from '../../../../../ui-components/svgWrapper'
import { simpleCopy } from '../../../../../utils/copyToClipboard'
import { ManagerServiceContext } from '../../../reducer'
// eslint-disable-next-line import/no-cycle
import { ManageServiceAbilityNames } from '../../../schema'
import { AsyncExpsManageServiceNames } from '../../../schema/services'
import type { FormattedPerfData } from './DataHandler'
import { CustomTrainingsConfig, FormatPerfData } from './DataHandler'
import { Filter } from './Filter'

const TagsRender = (props: { tags?: string[] }) => {
  const excludeStarTags = excludeStar(props.tags || [])
  if (excludeStarTags.length === 0) {
    return null
  }
  return (
    <div className="tn-tags-show">
      {excludeStarTags.length === 1 ? (
        <Tag minimal intent="warning">
          {excludeStarTags[0]}
        </Tag>
      ) : (
        <Popover2
          position="top"
          autoFocus={false}
          interactionKind="hover"
          content={
            <div style={{ padding: '10px 6px 6px 10px', maxWidth: 300 }}>
              {excludeStarTags.map((t) => (
                <Tag style={{ marginBottom: 4, marginRight: 4 }} minimal intent="warning">
                  {t}
                </Tag>
              ))}
            </div>
          }
        >
          <div className="multi-content">
            <Tag minimal intent="warning">
              {excludeStarTags[0]}
            </Tag>
            <span className="more">{excludeStarTags.length}</span>
          </div>
        </Popover2>
      )}
    </div>
  )
}

const ChainLine = (props: {
  chain: Chain
  // eslint-disable-next-line
  updateTag: {}
  updatedAt: string
  selectChains: Array<Chain>
  ioExpireAt?: number | undefined
  handleSelect: (t: Chain) => void
  handleBatchStopSelect: (t: Chain, select: boolean) => void
  handleTagEditorSingleClick: (t: Chain) => void
  refreshHandler: (hideToast?: boolean) => void
}): JSX.Element => {
  const t = props.chain
  const [, frontierIdRef, setFrontierId] = useRefState<number | null>(null)
  const srvc = useContext(ManagerServiceContext)
  const isIo = srvc.reqType === 'io'
  const [formattedPerfData, setFormattedPerfData] = useState<Partial<FormattedPerfData> | null>(
    null,
  )

  const { trainingsCustomColumns } = srvc.state
  const ignorePerf = t.chain_status !== 'running' || t.task_type === TaskTaskType.BACKGROUND_TASK

  function fetchCurrentPerfInfo() {
    if (ignorePerf) {
      return
    }

    srvc.app
      .api()
      .getAilabServerClient()
      .request(AilabServerApiName.GET_TASK_CURRENT_PERF_V2, {
        task_id: t.id,
        keys: trainingsCustomColumns,
      })
      .then((res) => {
        const nextFormattedPerfData = FormatPerfData(res.perfs, t)
        setFormattedPerfData(nextFormattedPerfData)
      })
  }

  useEffect(() => {
    if (frontierIdRef.current) {
      IOFrontier.getInstance().unsub(frontierIdRef.current)
      // 已经 unsub 了，这个时候自然设置成 null 就行了
      setFrontierId(null)
    }

    if (ignorePerf) {
      setFormattedPerfData(null)
      return () => {
        if (frontierIdRef.current !== null) {
          // eslint-disable-next-line react-hooks/exhaustive-deps
          IOFrontier.getInstance().unsub(frontierIdRef.current)
        }
      }
    }

    const currentId = IOFrontier.getInstance().sub<
      SubQueryParams[SubscribeCommands.TaskCurrentPerf2]
    >(
      SubscribeCommands.TaskCurrentPerf2,
      {
        query: {
          token: srvc.app.api().getToken(),
          task_id: t.rawTask.id,
          keys: trainingsCustomColumns,
        },
      },
      (res) => {
        const nextFormattedPerfData = FormatPerfData(res.content.perfs, t)
        setFormattedPerfData(nextFormattedPerfData)
      },
    )

    setFrontierId(currentId)
    return () => {
      if (currentId !== null) {
        IOFrontier.getInstance().unsub(currentId)
      }
    }
    /**
     * 这里出现过一次由于感知不到 id 变化造成订阅显示 ERR 的问题：
     *
     * 切换 tab 的时候，展示->隐藏时处于运行态，隐藏->展示的时候也处于运行态，
     * （如果此时经历了打断恢复并且没有新增其他实验）由于页面隐藏是不订阅的，这个时候只会比较两个快照，会丢失 chain_status 的中间态变化，
     * 导致感知不到 task_id 已经变了，还订阅的旧的 task_id。
     */
    // 可以通过 suspend + 恢复来验证
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t.chain_id, t.id, t.chain_status, isIo, trainingsCustomColumns, ignorePerf])

  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if (!isIo) {
      setFormattedPerfData(null)
      fetchCurrentPerfInfo()
    }

    return () => {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.updatedAt, isIo])

  useEffect(() => {
    if (frontierIdRef.current !== null) {
      IOFrontier.getInstance().expireById(frontierIdRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.ioExpireAt])

  const openPythonFileInJupyter = () => {
    const filePath = props.chain.showName
    if (!filePath) return
    srvc.app.api().invokeAsyncService(AsyncExpsManageServiceNames.openFile, { path: filePath })
  }

  const batchStopChecked = !!props.selectChains.find((item) => item.id === props.chain.id)
  const canOpenFile = srvc.app.api().hasAbility(ManageServiceAbilityNames.openFile)

  // const leafCount = getMetaList(t.pods, MetaType.leaf).length
  // const spineCount = getMetaList(t.pods, MetaType.spine).length
  const scheduleZone = getMetaList(t.pods.slice(0, 1), MetaType.scheduleZone)[0] || '-'

  const getFullGroup = () => {
    if (t.queue_status !== 'finished' && CONSTS.ChainDelayGroupRegex.test(t.group)) {
      return t.group
    }
    return (t.config_json.client_group || t.group) as string
  }

  const handlerStar = () => {
    const currentStar = t.star
    srvc.app
      .api()
      .getApiServerClient()
      .request(currentStar ? ApiServerApiName.UNTAG_TASK : ApiServerApiName.TAG_TASK, {
        chain_id: t.chain_id,
        tag: 'star',
      })
      .then((res) => {
        srvc.app.api().getHFUIToaster()?.show({
          message: res.msg,
          intent: 'success',
        })
        setTimeout(() => {
          props.refreshHandler(true)
        })
        // hint: 因为目前 QueryServer 查询有延迟，所以我们新增两个临时的特殊处理：
        setTimeout(() => {
          props.refreshHandler(true)
        }, 3000)
        setTimeout(() => {
          props.refreshHandler(true)
        }, 6000)
      })
      .catch((e) => {
        srvc.app.api().getHFUIToaster()?.show({
          message: e,
          intent: 'danger',
        })
      })
  }
  const handleTags = () => {
    props.handleTagEditorSingleClick(t)
  }

  const getCost = (chainForCost: Chain): number => {
    let totalCost = 0
    chainForCost.begin_at_list.forEach((begin_at, index) => {
      if (chainForCost.worker_status[index] === 'canceled') {
        return
      }
      totalCost +=
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        (new Date(chainForCost.end_at_list[index]!).getTime() - new Date(begin_at).getTime()) / 1000
    })
    return totalCost
  }

  return (
    <>
      <div
        className="tid v"
        title={i18n.t(i18nKeys.biz_copy_task_id)}
        onClick={() => simpleCopy(`${t.id}`, `ID : ${t.id}`, srvc.app.api().getHFUIToaster())}
      >
        {t.id}
      </div>
      <div
        className="tn"
        onClick={() => {
          props.handleSelect(props.chain)
        }}
      >
        <StatusIconV2
          workerStatus={t.worker_status}
          chainStatus={t.chain_status}
          customStyle={{ marginRight: '6px', height: '24px' }}
        />
        {window._hf_user_if_in && <PriorityIcon priority={t.priorityName} marginRight={6} />}
        {t.suspend_count > 0 && (
          <span className="chain-icon">
            <SVGWrapper svg={icons.chain} width="1em" height="1em" />
          </span>
        )}
        <div className="tn-item-text">
          <p className="tn-item-text-name" title={t.showName || undefined}>
            {t.showName}
          </p>
          <TagsRender tags={t.tags} />
          <div
            className={classNames('tn-star', { 'con-show': t.star })}
            title={t.star ? i18n.t(i18nKeys.biz_unstar_exp) : i18n.t(i18nKeys.biz_star_exp)}
          >
            <Icon
              icon={t.star ? 'star' : 'star-empty'}
              color={Colors.ORANGE5}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handlerStar()
              }}
            />
          </div>
          <div className={classNames('tn-tag')} title={i18n.t(i18nKeys.biz_exp_tag_click_to_edit)}>
            <Icon
              icon="tag"
              color={Colors.BLUE4}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleTags()
              }}
            />
          </div>
          {canOpenFile && (
            <div className="tn-open" title={i18n.t(i18nKeys.biz_tn_try_open_file_jupyter)}>
              <Icon
                icon="document-open"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  openPythonFileInJupyter()
                }}
              />
            </div>
          )}
        </div>
      </div>
      {!window.is_hai_studio && <div className="zone">{scheduleZone}</div>}
      <div className="lc_group" title={`the submitted group: ${getFullGroup()}`}>
        {getSimpleGroup(getFullGroup())}
      </div>
      <div className="wk tn-item-worker" data-chain_id={t.chain_id}>
        {t.nodes}
      </div>
      <div className="lu" title={dayjs(t.begin_at_list[0]).format('YYYY-MM-DD HH:mm:ss')}>
        {dayjs(t.begin_at_list[0]).format('MM-DD HH:mm')}
      </div>
      {/* <div className="leaf">{leafCount ? `${leafCount}/${spineCount}` : null}</div> */}
      <Tooltip2
        className="dur"
        position={Position.BOTTOM}
        content={
          <div className="dur-tip">
            {t.chain_status !== 'finished' && <p>not finish</p>}
            {t.chain_status === 'finished' && (
              <>
                <p>
                  <i>begin: </i>
                  {dayjs(t.begin_at_list[0]).format('YYYY-MM-DD HH:mm:ss')}
                </p>
                <p>
                  <i>end: </i>
                  {dayjs(t.end_at).format('YYYY-MM-DD HH:mm:ss')}
                </p>
              </>
            )}
          </div>
        }
      >
        {t.chain_status === 'finished' ? secondsToDisplay(Math.floor(getCost(t))) : '--'}
      </Tooltip2>

      {trainingsCustomColumns.map((column) => {
        return CustomTrainingsConfig[column] ? (
          <div
            className={`${CustomTrainingsConfig[column].className} ${
              CustomTrainingsConfig[column].dynClassName
                ? CustomTrainingsConfig[column].dynClassName!(formattedPerfData?.[column]?.avg, t)
                : ''
            }`}
            title={formattedPerfData?.[column]?.title || ''}
          >
            {formattedPerfData?.[column]?.formatted || '--'}
          </div>
        ) : null
      })}

      <div className="sel">
        <Checkbox
          checked={batchStopChecked}
          inline
          onChange={(e) => {
            props.handleBatchStopSelect(props.chain, e.currentTarget.checked)
          }}
        />
      </div>
    </>
  )
}

export const TaskLists = (props: {
  tasks: Array<Chain>
  loading: boolean
  selected: Chain | null
  updatedAt: string
  batchTotalChecked: boolean
  selectChains: Array<Chain>
  handleSelect: (t: Chain) => void
  handleBatchStopClick: () => void
  handleTagEditorSingleClick: (t: Chain) => void
  handleBatchEditTagClick: () => void
  handleBatchResumeAlertClick: () => void
  handleBatchSuspendAlertClick: () => void
  handleBatchStopSelect: (t: Chain, select: boolean) => void
  handleBatchTotalSelect: () => void
  filterHandler: (opts: ExperimentsSubParamsFilterPart) => void
  refreshHandler: (hideToast?: boolean) => void
  ioExpireAt?: number
  showValidation: { value: boolean; setter: (v: boolean) => void }
}): JSX.Element => {
  const srvc = useContext(ManagerServiceContext)
  const [update, setUpdate] = useState({})
  const { trainingsCustomColumns } = srvc.state

  useEffectOnce(() => {
    srvc.app
      .api()
      .invokeAsyncService(AsyncExpsManageServiceNames.reflushClusterInfo, null)
      .then(() => {
        setUpdate({})
      })
  })

  const propsLoading = props.loading

  return (
    <div className="page-task-list">
      <Filter
        loading={propsLoading}
        showValidation={props.showValidation}
        showBatchStop={!!props.selectChains.length}
        handleBatchStopClick={props.handleBatchStopClick}
        handleBatchEditTagClick={props.handleBatchEditTagClick}
        handleBatchResumeAlertClick={props.handleBatchResumeAlertClick}
        handleBatchSuspendAlertClick={props.handleBatchSuspendAlertClick}
        filterHandler={props.filterHandler}
        refreshHandler={props.refreshHandler}
      />
      {props.tasks.length && !propsLoading ? (
        <div className="task-list-main" id="task-list-main">
          <div className="list-header">
            <div className="tid">ID</div>
            <div className="tn">Task Name</div>
            {!window.is_hai_studio && (
              <div className="zone" title="The zone where the experiment actually runs">
                Zone
              </div>
            )}
            <div className="lc_group" title="current group">
              Group
            </div>
            <div className="wk" title="select and `alt+c` to copy all nodes">
              Worker
            </div>
            {/* <div className="leaf" title="count of IB switch leaf / spine workers located">
              L/S
            </div> */}
            <div className="lu">
              Begin At&nbsp;
              <Tooltip2
                position={Position.BOTTOM}
                content={<span>{i18n.t(i18nKeys.biz_begin_at_help)}</span>}
              >
                <span className="help-icon">
                  <InlineIcon name="help" fill="var(--hf-ui-font-color2)" />
                </span>
              </Tooltip2>
            </div>
            <div className="dur">
              Cost&nbsp;
              <Tooltip2
                position={Position.BOTTOM}
                content={<span>{i18n.t(i18nKeys.biz_cost_time_help)}</span>}
              >
                <span className="help-icon">
                  <InlineIcon name="help" fill="var(--hf-ui-font-color2)" />
                </span>
              </Tooltip2>
            </div>

            {trainingsCustomColumns.map((column) => {
              const columnSetting = CustomTrainingsConfig[column]
              if (!columnSetting) {
                return null
              }
              return (
                <div className={columnSetting.className} title={columnSetting.title || ''}>
                  {columnSetting.name}
                  {columnSetting.tooltip && (
                    <Tooltip2
                      position={Position.BOTTOM}
                      content={<span>{columnSetting.tooltip}</span>}
                    >
                      <span className="help-icon">
                        &nbsp;
                        <InlineIcon name="help" fill="var(--hf-ui-font-color2)" />
                      </span>
                    </Tooltip2>
                  )}
                </div>
              )
            })}

            <div className="sel">
              <Checkbox
                checked={props.batchTotalChecked}
                inline
                onChange={() => {
                  props.handleBatchTotalSelect()
                }}
              />
            </div>
          </div>
          <ul className="list-content">
            {props.tasks.map((chain) => {
              return (
                <li
                  key={chain.chain_id}
                  className={classNames('task-list-item', {
                    selected: chain.chain_id === props.selected?.chain_id,
                  })}
                >
                  <ChainLine
                    // hint: 其实没有 updateTag 目前也是会重新渲染的，这里谨防重构的话可能忘记这回事
                    updateTag={update}
                    refreshHandler={props.refreshHandler}
                    ioExpireAt={props.ioExpireAt}
                    selectChains={props.selectChains}
                    chain={chain}
                    updatedAt={props.updatedAt}
                    handleSelect={props.handleSelect}
                    handleBatchStopSelect={props.handleBatchStopSelect}
                    handleTagEditorSingleClick={props.handleTagEditorSingleClick}
                  />
                </li>
              )
            })}
          </ul>
        </div>
      ) : (
        <div className="pic-notfound">
          {propsLoading ? (
            <HFLoading style={{ backgroundColor: 'transparent' }} />
          ) : (
            <>
              <SVGWrapper svg={icons.notfound_bg} width="400px" height="300px" />
              <div className="text">Oops. No result ...</div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
