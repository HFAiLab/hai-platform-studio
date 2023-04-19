import { i18n, i18nKeys } from '@hai-platform/i18n'
import { SpecialTags, TaskQueueStatus, TaskWorkerStatus } from '@hai-platform/shared'
import type { ExperimentsSubParamsFilterPart } from '@hai-platform/studio-schemas/lib/esm'
import { Colors, Position } from '@hai-ui/core/lib/esm/common'
import {
  Button,
  ButtonGroup,
  Checkbox,
  Icon,
  InputGroup,
  Switch,
} from '@hai-ui/core/lib/esm/components'
import { PopoverPosition } from '@hai-ui/core/lib/esm/components/popover/popoverSharedProps'
import { Tooltip2 } from '@hai-ui/popover2/lib/esm/tooltip2'
import { Select } from '@hai-ui/select/lib/esm'
import classNames from 'classnames'
import dayjs from 'dayjs'
import React, { useContext, useState } from 'react'
import { useEffectOnce, useUpdateEffect } from 'react-use/esm'
import { StatusIconV2 } from '../../../../../ui-components/svgIcon'
import { CountlyEventKey } from '../../../../../utils/countly/countly'
import { ManagerServiceContext, getDefaultFilterParams } from '../../../reducer'
import type { ExpsPageManageState } from '../../../schema'
import { ManageServiceAbilityNames } from '../../../schema'
import { EventsKeys } from '../../../schema/event'
import { HFDateRangeInput } from './dateRangeInput'
import { FilterGroup } from './FilterGroup'
import { FilterTag } from './FilterTag'

enum StatusListEnum {
  all = 'all',
  waiting_init = 'waiting_init',
  running = 'running',
  finished = 'finished',
  failed = 'failed',
}

const StatusList = [
  {
    value: StatusListEnum.all,
    text: 'All',
  },
  {
    value: StatusListEnum.waiting_init,
    text: 'Pending',
  },
  {
    value: StatusListEnum.running,
    text: 'Running',
  },
  {
    value: StatusListEnum.finished,
    text: 'Finished',
  },
  {
    value: StatusListEnum.failed,
    text: 'Failed',
  },
]

const WorkerStatusToSelected = [
  TaskWorkerStatus.CANCELED,
  TaskWorkerStatus.FAILED,
  TaskWorkerStatus.STOPPED,
  TaskWorkerStatus.SUCCEEDED,
]

const WorkStatusSelect = Select.ofType<TaskWorkerStatus>()

// Filter 自己管理一个默认值
const FilterDefaultValues = {
  keyword: '',
  queueStatus: StatusListEnum.all,
  finishedSelects: new Set(WorkerStatusToSelected),
  selectGroups: new Set([]),
  beginAndEndTime: [null, null] as [null, null],
  showValidation: false,
  selectTags: new Set([]),
}

/**
 * state 转 Filter 默认参数，纯函数
 * 似乎是目前能想到最好维护的办法了
 */
export const getDefaultQueueStatusFromManageState = (
  manageState: ExpsPageManageState,
): StatusListEnum => {
  if (
    manageState.worker_status?.length === 1 &&
    manageState.worker_status.includes(TaskWorkerStatus.FAILED)
  ) {
    return StatusListEnum.failed
  }

  if (manageState.queue_status?.length === 1) {
    if (manageState.queue_status.includes(TaskQueueStatus.FINISHED)) return StatusListEnum.finished
    if (manageState.queue_status.includes(TaskQueueStatus.SCHEDULED)) return StatusListEnum.running
    if (manageState.queue_status.includes(TaskQueueStatus.QUEUED))
      return StatusListEnum.waiting_init
  }

  return FilterDefaultValues.queueStatus
}

/**
 * state 转 Filter 默认参数
 */
export const getDefaultFinishedSelectsFromManageState = (
  manageState: ExpsPageManageState,
): Set<TaskWorkerStatus> => {
  if (
    manageState.queue_status?.length === 1 &&
    manageState.queue_status.includes(TaskQueueStatus.FINISHED) &&
    manageState.worker_status?.length
  ) {
    return new Set([...manageState.worker_status])
  }

  return FilterDefaultValues.finishedSelects
}

export const Filter = (props: {
  filterHandler: (opts: ExperimentsSubParamsFilterPart) => void
  // eslint-disable-next-line react/no-unused-prop-types
  refreshHandler: () => void
  handleBatchStopClick: () => void
  handleBatchResumeAlertClick: () => void
  handleBatchSuspendAlertClick: () => void
  handleBatchEditTagClick: () => void
  loading: boolean
  showBatchStop: boolean
  showValidation: { value: boolean; setter: (v: boolean) => void }
}) => {
  const srvc = useContext(ManagerServiceContext)
  const { manageState } = srvc.state
  const canStopExperiment = srvc.app.api().hasAbility(ManageServiceAbilityNames.stopExperiment)
  const [batchStopShowed, setBatchStopShowed] = useState<boolean>(false)

  // Filter 的参数：自己维护，批量变更
  const [keyword, setKeyword] = useState<string>(
    manageState.nb_name_pattern || FilterDefaultValues.keyword,
  )
  const [queueStatus, setQueueStatus] = useState<StatusListEnum>(
    getDefaultQueueStatusFromManageState(manageState),
  )
  const [finishedSelects, setFinishedSelects] = useState<Set<TaskWorkerStatus>>(
    getDefaultFinishedSelectsFromManageState(manageState),
  )
  const [selectGroups, setSelectGroups] = useState<Set<string>>(
    manageState.group ? new Set(manageState.group) : FilterDefaultValues.selectGroups,
  )
  const [selectTags, setSelectTags] = useState<Set<string>>(
    manageState.tag ? new Set(manageState.tag) : FilterDefaultValues.selectTags,
  )
  const [createdBeginAndEndTime, setCreatedBeginAndEndTime] = useState<[Date | null, Date | null]>([
    manageState.created_start_time ? new Date(manageState.created_start_time) : null,
    manageState.created_end_time ? new Date(manageState.created_end_time) : null,
  ])

  if (props.showBatchStop && !batchStopShowed) setBatchStopShowed(true)

  const invokeFilter = (
    queryParams: ExperimentsSubParamsFilterPart,
    options?: { disablePageReset?: boolean },
  ) => {
    props.filterHandler(queryParams)

    if (options?.disablePageReset) {
      return
    }

    srvc.dispatch({
      type: 'manageState',
      value: {
        currentPage: 1,
      },
    })
  }

  function applyFilter(options?: {
    status?: StatusListEnum
    currFinishedSelects?: Set<TaskWorkerStatus>
    disablePageReset?: boolean
  }) {
    const queryStatus = options?.status || queueStatus

    const queryParams: ExperimentsSubParamsFilterPart = {}

    if (keyword.length) {
      queryParams.nb_name_pattern = keyword
    }

    if (createdBeginAndEndTime[0] && createdBeginAndEndTime[1]) {
      if (
        Number.isNaN(createdBeginAndEndTime[0].getTime()) ||
        Number.isNaN(createdBeginAndEndTime[1].getTime())
      ) {
        // 这个其实是一定存在的
        srvc.app.api().getHFUIToaster()!.show({
          message: '请输入有效的开始和结束时间',
          intent: 'warning',
        })
      } else {
        queryParams.created_end_time = dayjs(createdBeginAndEndTime[1]).format(
          'YYYY-MM-DD HH:mm:ss',
        )
        queryParams.created_start_time = dayjs(createdBeginAndEndTime[0]).format(
          'YYYY-MM-DD HH:mm:ss',
        )
      }
    }

    switch (queryStatus) {
      case StatusListEnum.failed:
        queryParams.worker_status = [TaskWorkerStatus.FAILED]
        break
      case StatusListEnum.finished:
        queryParams.queue_status = [TaskQueueStatus.FINISHED]
        queryParams.worker_status = [...(options?.currFinishedSelects || finishedSelects)]
        break
      case StatusListEnum.running:
        queryParams.queue_status = [TaskQueueStatus.SCHEDULED]
        break
      case StatusListEnum.waiting_init:
        queryParams.queue_status = [TaskQueueStatus.QUEUED]
        break
      case StatusListEnum.all:
      default:
        // do nothing
        break
    }

    if (selectGroups.size) queryParams.group = [...selectGroups]

    queryParams.tag = [...selectTags]

    // 除了 star 和有 hidden 的情况下，exclude_tag 为 hidden
    if (!(selectTags.has(SpecialTags.STAR) || selectTags.has(SpecialTags.HIDDEN))) {
      queryParams.excluded_tag = [SpecialTags.HIDDEN]
    } else {
      queryParams.excluded_tag = []
    }

    invokeFilter(queryParams, {
      disablePageReset: options?.disablePageReset,
    })
  }

  const resetFilters = () => {
    setKeyword(FilterDefaultValues.keyword)
    setQueueStatus(FilterDefaultValues.queueStatus)
    setFinishedSelects(FilterDefaultValues.finishedSelects)
    setSelectGroups(FilterDefaultValues.selectGroups)
    setSelectTags(FilterDefaultValues.selectTags)
    setCreatedBeginAndEndTime(FilterDefaultValues.beginAndEndTime)
    props.showValidation.setter(FilterDefaultValues.showValidation)
    invokeFilter(getDefaultFilterParams())
  }

  useUpdateEffect(() => {
    const hasBeginAndEnd = createdBeginAndEndTime[0] && createdBeginAndEndTime[1]
    const notBeginAndEnd = !createdBeginAndEndTime[0] && !createdBeginAndEndTime[1]
    if (hasBeginAndEnd || notBeginAndEnd) {
      applyFilter()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createdBeginAndEndTime])

  useUpdateEffect(() => {
    applyFilter()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectGroups, selectTags])

  useEffectOnce(() => {
    srvc.app.on(EventsKeys.ResetFilters, resetFilters)
    return () => {
      srvc.app.off(EventsKeys.ResetFilters, resetFilters)
    }
  })

  const finishSelectActive = finishedSelects.size < WorkerStatusToSelected.length

  return (
    <div className="hf-exps-filter-container">
      <div className="filter-trainings">
        {!window.is_hai_studio && (
          <Tooltip2
            position={Position.TOP}
            content={<span>{i18n.t(i18nKeys.biz_no_validate_exps_tip)}</span>}
          >
            <Switch
              checked={props.showValidation.value}
              className="trainings-switch"
              label={i18n.t(i18nKeys.biz_exp_only_trainings)}
              onChange={(e) => {
                if (props.loading) return
                srvc.app.api().countlyReportEvent(CountlyEventKey.TrainingsOnlyTrainingsClick)
                props.showValidation.setter(e.currentTarget.checked)
              }}
            />
          </Tooltip2>
        )}
      </div>

      <div className="star-status">
        <Tooltip2
          className="log-upload--icon-container"
          position={PopoverPosition.TOP}
          content={<span>{i18n.t(i18nKeys.biz_only_show_star)}</span>}
        >
          <Icon
            onClick={() => {
              const nextTags = new Set([...selectTags])
              if (selectTags.has(SpecialTags.STAR)) nextTags.delete(SpecialTags.STAR)
              else nextTags.add(SpecialTags.STAR)
              setSelectTags(nextTags)
            }}
            icon={selectTags.has(SpecialTags.STAR) ? 'star' : 'star-empty'}
            color={Colors.ORANGE5}
          />
        </Tooltip2>
      </div>

      <div className="manage-filter-tag">
        <FilterTag
          tag={selectTags}
          onChange={(tags) => {
            setSelectTags(tags)
          }}
        />
      </div>
      <div className="manage-filter-date-range">
        <HFDateRangeInput
          onChange={(e) => {
            setCreatedBeginAndEndTime(e)
          }}
        />
      </div>

      {window._hf_user_if_in && (
        <div className="manage-filter-group">
          <FilterGroup
            groups={selectGroups}
            onChange={(groups) => {
              setSelectGroups(groups)
            }}
          />
        </div>
      )}

      <div className="filter-status">
        <ButtonGroup style={{ minWidth: 200, width: 'max-content' }}>
          {StatusList.map((item) => (
            <Button
              key={item.value}
              outlined
              active={queueStatus === item.value}
              small
              rightIcon={
                item.text === 'Finished' ? (
                  <div
                    onClick={(e) => {
                      e.stopPropagation()
                    }}
                    className={classNames('finish-select-container', {
                      active: finishSelectActive,
                    })}
                  >
                    <WorkStatusSelect
                      popoverProps={{
                        minimal: true,
                        portalClassName: 'finish-select-list',
                        position: PopoverPosition.BOTTOM_RIGHT,
                        modifiers: {},
                      }}
                      // eslint-disable-next-line react/no-unstable-nested-components
                      itemRenderer={(status) => {
                        return (
                          <Checkbox
                            key={`${item.value}${status}`}
                            className="finish-select-checkbox"
                            checked={finishedSelects.has(status)}
                            label={status}
                            onChange={(e) => {
                              const { checked } = e.target as HTMLInputElement
                              if (checked) {
                                finishedSelects.add(status)
                              } else {
                                finishedSelects.delete(status)
                              }
                              setFinishedSelects(new Set(finishedSelects))
                              applyFilter({
                                status: StatusListEnum.finished,
                                currFinishedSelects: finishedSelects,
                              })
                              if (queueStatus !== StatusListEnum.finished) {
                                setQueueStatus(item.value)
                              }
                            }}
                          />
                        )
                      }}
                      onItemSelect={() => {}}
                      items={WorkerStatusToSelected}
                      filterable={false}
                    >
                      <Icon
                        color={finishSelectActive ? 'white' : undefined}
                        className="finish-select-icon"
                        icon="caret-down"
                      />
                    </WorkStatusSelect>
                  </div>
                ) : null
              }
              data-value={item.value}
              onClick={() => {
                if (props.loading) return
                srvc.app.api().countlyReportEvent(CountlyEventKey.TrainingsOnlyTrainingsClick)
                setQueueStatus(item.value)
                applyFilter({
                  status: item.value as StatusListEnum,
                })
              }}
            >
              {item.text}
            </Button>
          ))}
        </ButtonGroup>
      </div>

      <div className={classNames('filter-search', { 'batch-active': props.showBatchStop })}>
        <InputGroup
          placeholder={i18n.t(i18nKeys.biz_exp_search_by_task_name)}
          rightElement={
            <Button
              icon="search"
              minimal
              onClick={() => {
                if (props.loading) return
                srvc.app.api().countlyReportEvent(CountlyEventKey.TrainingsFilterTextEnter)
                applyFilter()
              }}
            />
          }
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value)
          }}
          onKeyUp={(e) => {
            if (props.loading) return
            if (e.key === 'Enter') {
              srvc.app.api().countlyReportEvent(CountlyEventKey.TrainingsFilterTextEnter)
              applyFilter()
            }
          }}
          small
        />
      </div>

      <div
        className={classNames(
          'batch-op-container',
          // eslint-disable-next-line no-nested-ternary
          batchStopShowed ? (!props.showBatchStop ? 'batch-stop-leave' : 'batch-stop-enter') : '',
        )}
      >
        <div className="batch-op-content">
          <div>{i18n.t(i18nKeys.biz_exp_batch)}</div>
          <Button
            small
            title={i18n.t(i18nKeys.biz_exp_batch_stop_html_title)}
            // className="batch-stop-btn"
            disabled={!canStopExperiment}
            onClick={() => {
              props.handleBatchStopClick()
            }}
          >
            {i18n.t(i18nKeys.biz_exp_batch_stop_btn)}
          </Button>
          <Button
            small
            // className="batch-resume-btn"
            disabled={!canStopExperiment}
            onClick={() => {
              props.handleBatchResumeAlertClick()
            }}
            title={i18n.t(i18nKeys.biz_exp_batch_resume_html_title)}
          >
            {i18n.t(i18nKeys.biz_exp_batch_resume_btn)}
          </Button>
          <Button
            small
            className="batch-suspend"
            title={i18n.t(i18nKeys.biz_exp_batch_suspend_html_title)}
            icon={<StatusIconV2 disableTooltip workerStatus="" chainStatus="suspended" />}
            onClick={() => {
              props.handleBatchSuspendAlertClick()
            }}
          />
          <Button
            small
            icon="tag"
            onClick={() => {
              props.handleBatchEditTagClick()
            }}
            title={i18n.t(i18nKeys.biz_exp_batch_tag_html_title)}
          />
        </div>
      </div>
    </div>
  )
}
