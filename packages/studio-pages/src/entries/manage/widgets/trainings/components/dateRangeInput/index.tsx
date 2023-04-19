import { i18n, i18nKeys } from '@hai-platform/i18n'
import { ONEDAY } from '@hai-platform/studio-toolkit/lib/esm/date/utils'
import type { IToaster } from '@hai-ui/core/lib/esm'
import { Button } from '@hai-ui/core/lib/esm'
import classNames from 'classnames'
import dayjs from 'dayjs'
import React, { useContext, useEffect, useState } from 'react'
import { useEffectOnce } from 'react-use/esm'
import { listenDocumentClickAndTryClose } from '../../../../../../utils/dom'
import { ManagerServiceContext } from '../../../../reducer'
import { EventsKeys } from '../../../../schema/event'

export type DateRangeType = [Date | null, Date | null]

export interface DateRangeProps {
  onChange?: (range: DateRangeType) => void
  toaster?: IToaster
}

enum QuickSelectMode {
  TODAY = 'TODAY',
  YESTERDAY = 'YESTERDAY',
  LAST_WEEK = 'LAST_WEEK',
}

const inputFormat = 'YYYY-MM-DDTHH:mm'

export const HFDateRangeInput = (props: DateRangeProps) => {
  const srvc = useContext(ManagerServiceContext)
  const { manageState } = srvc.state

  const [beginAndEnd, setBeginAndEnd] = useState<DateRangeType>([
    manageState.created_start_time ? new Date(manageState.created_start_time) : null,
    manageState.created_end_time ? new Date(manageState.created_end_time) : null,
  ])

  const [currentBegin, setCurrentBegin] = useState<string | null>(null)
  const [currentEnd, setCurrentEnd] = useState<string | null>(null)

  const [popOverShow, setPopOverShow] = useState(false)

  const updatePopOverShow = () => {
    if (!popOverShow) {
      setCurrentBegin(beginAndEnd[0] ? dayjs(beginAndEnd[0]).format(inputFormat) : '')
      setCurrentEnd(beginAndEnd[1] ? dayjs(beginAndEnd[1]).format(inputFormat) : '')
    }
    setPopOverShow(!popOverShow)
  }

  const syncCurrentDate = () => {
    if ((currentBegin && !currentEnd) || (!currentBegin && currentEnd)) {
      if (props.toaster) {
        props.toaster.show({
          message: '请输入有效的开始和结束时间',
        })
      }
    }

    const nextBeginAndEnd = [
      currentBegin ? new Date(currentBegin) : null,
      currentEnd ? new Date(currentEnd) : null,
    ] as DateRangeType

    setBeginAndEnd(nextBeginAndEnd)
    if (props.onChange) {
      props.onChange(nextBeginAndEnd)
    }
    setPopOverShow(false)
  }

  const clearCurrentDate = () => {
    const nextBeginAndEnd = [null, null] as DateRangeType
    setBeginAndEnd(nextBeginAndEnd)
    if (props.onChange) {
      props.onChange(nextBeginAndEnd)
    }
    setPopOverShow(false)
  }

  const quickSelect = (selectMode: QuickSelectMode) => {
    const todayStartTime = new Date(new Date().setHours(0, 0, 0, 0)).getTime()
    if (selectMode === QuickSelectMode.TODAY) {
      setCurrentBegin(dayjs(new Date(todayStartTime)).format(inputFormat))
      setCurrentEnd(dayjs(new Date()).format(inputFormat))
    }

    if (selectMode === QuickSelectMode.YESTERDAY) {
      const yesterdayStartTime = todayStartTime - ONEDAY

      setCurrentBegin(dayjs(new Date(yesterdayStartTime)).format(inputFormat))

      setCurrentEnd(dayjs(new Date(todayStartTime)).format(inputFormat))
    }

    if (selectMode === QuickSelectMode.LAST_WEEK) {
      const last7StartTime = todayStartTime - ONEDAY * 7
      setCurrentBegin(dayjs(new Date(last7StartTime)).format(inputFormat))
      setCurrentEnd(dayjs(new Date()).format(inputFormat))
    }
  }

  const resetFilters = () => {
    setBeginAndEnd([null, null])
  }

  useEffectOnce(() => {
    srvc.app.on(EventsKeys.ResetFilters, resetFilters)
    return () => {
      srvc.app.off(EventsKeys.ResetFilters, resetFilters)
    }
  })

  useEffect(() => {
    if (!popOverShow) return () => {}
    const clear = listenDocumentClickAndTryClose('manage-date-range-container', () => {
      setPopOverShow(false)
    })
    return () => {
      clear()
    }
  }, [popOverShow])

  return (
    <div className="date-range-container manage-date-range-container">
      <div className="date-range-show">
        <Button onClick={updatePopOverShow} active={!!beginAndEnd[0]} small outlined>
          {!beginAndEnd[0] && i18n.t(i18nKeys.biz_date_select_range)}
          {beginAndEnd[0] &&
            `${dayjs(beginAndEnd[0]).format('YY-MM-DD HH:mm')} - ${dayjs(beginAndEnd[1]).format(
              'YY-MM-DD HH:mm',
            )}`}
        </Button>
      </div>
      <div
        className={classNames('date-range-popover', {
          show: popOverShow,
        })}
      >
        <div className="quick-select">
          <Button
            small
            onClick={() => {
              quickSelect(QuickSelectMode.TODAY)
            }}
          >
            {i18n.t(i18nKeys.biz_date_today)}
          </Button>
          <Button
            small
            onClick={() => {
              quickSelect(QuickSelectMode.YESTERDAY)
            }}
          >
            {i18n.t(i18nKeys.biz_date_yesterday)}
          </Button>
          <Button
            small
            onClick={() => {
              quickSelect(QuickSelectMode.LAST_WEEK)
            }}
          >
            {i18n.t(i18nKeys.biz_date_last_week)}
          </Button>
        </div>

        <div>
          <div className="date-select-line">
            <label className="label">{i18n.t(i18nKeys.biz_date_range_begin)}</label>
            <input
              value={currentBegin || ''}
              type="datetime-local"
              onChange={(e) => {
                setCurrentBegin(e.target.value)
              }}
            />
          </div>
          <div className="date-select-line">
            <label className="label">{i18n.t(i18nKeys.biz_date_range_end)}</label>
            <input
              value={currentEnd || ''}
              type="datetime-local"
              onChange={(e) => {
                setCurrentEnd(e.target.value)
              }}
            />
          </div>
        </div>
        <div className="date-operation">
          <Button small intent="primary" onClick={syncCurrentDate}>
            {i18n.t(i18nKeys.base_Confirm)}
          </Button>
          <Button small onClick={clearCurrentDate}>
            {i18n.t(i18nKeys.base_Clear)}
          </Button>
        </div>
      </div>
    </div>
  )
}
