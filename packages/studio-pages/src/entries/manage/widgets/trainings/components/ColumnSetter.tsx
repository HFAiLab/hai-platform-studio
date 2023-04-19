import type { TaskCurrentPerfStat } from '@hai-platform/client-ailab-server'
import { i18n, i18nKeys } from '@hai-platform/i18n'
import { Button, Checkbox, PopoverPosition } from '@hai-ui/core'
import { Tooltip2 } from '@hai-ui/popover2'
import { Select } from '@hai-ui/select'
import React, { useContext } from 'react'
import { ManagerServiceContext } from '../../../reducer'
import { CustomTrainingsConfig } from './DataHandler'

export interface ColumnMeta {
  key: keyof TaskCurrentPerfStat
  label: string
}

export const columnWeight = {
  cpu: 1,
  mem: 2,
  gpu_util: 3,
  gpu_power: 4,
  gpu_p2u: 5,
  ib_rx: 6,
  ib_tx: 7,
}

export const ColumnKeys: ColumnMeta[] = (
  [
    'cpu',
    'mem',
    'gpu_util',
    'gpu_power',
    'gpu_p2u',
    'ib_rx',
    'ib_tx',
  ] as (keyof TaskCurrentPerfStat)[]
).map((key) => ({
  key,
  label: CustomTrainingsConfig[key].name,
}))

export const ColumnSetter = () => {
  const WorkStatusSelect = Select.ofType<ColumnMeta>()
  const srvc = useContext(ManagerServiceContext)
  const { trainingsCustomColumns } = srvc.state

  return (
    <WorkStatusSelect
      popoverProps={{
        minimal: true,
        portalClassName: 'finish-select-list',
        position: PopoverPosition.BOTTOM_RIGHT,
        modifiers: {},
      }}
      // eslint-disable-next-line react/no-unstable-nested-components
      itemRenderer={(item, itemProps) => {
        return (
          <>
            {itemProps.index === 0 && (
              <div className="trainings-select-column-tip">选择需要展示的列名：</div>
            )}
            <Checkbox
              className="manager-training-column-setter-items"
              id={`manager-training-column-setter-items-${itemProps.index}`}
              key={`${item.key}`}
              checked={trainingsCustomColumns.includes(item.key)}
              label={item.label}
              onChange={(e) => {
                // @ts-expect-error just ignore dom
                if (!e.target.checked) {
                  srvc.dispatch({
                    type: 'trainingsCustomColumns',
                    value: trainingsCustomColumns.filter((key) => key !== item.key),
                  })
                } else {
                  srvc.dispatch({
                    type: 'trainingsCustomColumns',
                    value: [...new Set([...trainingsCustomColumns, item.key])].sort((a, b) => {
                      return columnWeight[a] - columnWeight[b]
                    }),
                  })
                }
              }}
            />
          </>
        )
      }}
      onItemSelect={() => {}}
      items={ColumnKeys}
      filterable={false}
    >
      <Tooltip2 placement="top" content={i18n.t(i18nKeys.biz_customize_columns_to_display)}>
        <Button
          className="user-column-setter"
          id="user-column-setter"
          small
          minimal
          icon="settings"
        />
      </Tooltip2>
    </WorkStatusSelect>
  )
}
