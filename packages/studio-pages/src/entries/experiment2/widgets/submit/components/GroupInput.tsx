import { i18n, i18nKeys } from '@hai-platform/i18n'
import type { IClusterInfoUsage } from '@hai-platform/shared'
import { Button, FormGroup, MenuItem } from '@hai-ui/core/lib/esm'
import { Select } from '@hai-ui/select'
import React, { useContext } from 'react'
import { CONSTS } from '../../../../../consts'
import { InWrapper } from '../../../../../ui-components/innerWrapper'
import { ExpServiceContext, IfParamChangeInDraft } from '../../../reducer'
import type { SubmitCommonInputProps } from '../schema'
import { Exp2EditTip } from '../widgets/EditTip'

const GroupSelect = Select.ofType<IClusterInfoUsage>()

export interface Exp2GroupInputProps extends SubmitCommonInputProps {
  value: string
  groupList: IClusterInfoUsage[]
  onFocus: () => void
  initialized: boolean
}

const loadingList = [
  { show: 'Loading...', group: CONSTS.INVALID_GROUP, total: 0, free: 0, isLeaf: true },
]

export const Exp2GroupInput = (props: Exp2GroupInputProps) => {
  const srvc = useContext(ExpServiceContext)
  const { state } = srvc

  const groupList = props.isLoading ? loadingList : props.groupList
  const { isLock } = props

  const selectDisabled = props.isLock

  const ifGroupChangeInDraft = IfParamChangeInDraft(state, 'group')

  // eslint-disable-next-line react/no-unstable-nested-components
  const GroupActiveItem = (): string => {
    if (
      isLock &&
      state.chain &&
      state.chain.queue_status !== 'finished' &&
      CONSTS.ChainDelayGroupRegex.test(state.chain.group)
    ) {
      /**
       * 对于未结束的任务，如果当前的 group 是 xxx_DELAY_MANUAL 或者 xxx_DELAY_1m 类似的
       * 说明是被调度改过的
       *
       * 这个时候 config_json.client_group 后端没有更改
       * 这个时候优先展示 state.chain.group
       */
      return state.chain.group
    }

    if (isLock)
      // eslint-disable-next-line react/jsx-no-useless-fragment
      return `${props.value}`
    const item = groupList.find((i) => i.group === props.value && i.isLeaf)
    if (!item) return `Please select`
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return `${item.group}` + (item.total !== -1 ? `(${item.free}/${item.total})` : ``)
  }

  return (
    <InWrapper>
      <div className="exp2-form-group-container">
        {ifGroupChangeInDraft && (
          <Exp2EditTip value={`${state.createDraft.group}`} isLock={props.isLock} />
        )}
        <FormGroup inline label={i18n.t(i18nKeys.biz_exp_submit_group)}>
          <div className="exp-submit-group-select" id="exp2-group-select">
            <GroupSelect
              fill
              filterable={false}
              items={groupList}
              // eslint-disable-next-line react/no-unstable-nested-components
              itemRenderer={(i, { handleClick, modifiers }) => {
                const text = `${
                  selectDisabled ? i.show.replace(/[├─└│ ]/g, '') : i.show.replace(/\s/g, '&nbsp;')
                }${
                  i.group === CONSTS.INVALID_GROUP || selectDisabled || i.total === -1
                    ? ''
                    : `&nbsp;&nbsp;&nbsp;(${i.free}/${i.total})`
                }`
                return (
                  <MenuItem
                    className="exp-submit-group-select-item"
                    active={modifiers.active}
                    disabled={!i.isLeaf}
                    // hint: 这里的 可以要保证它的唯一性
                    key={`${groupList.length}${i.show}${i.group}`}
                    onClick={handleClick}
                    // eslint-disable-next-line react/no-danger
                    text={<p dangerouslySetInnerHTML={{ __html: text }} />}
                  />
                )
              }}
              activeItem={groupList.find((i) => i.group === props.value && i.isLeaf)}
              popoverProps={{ minimal: true }}
              disabled={selectDisabled}
              onItemSelect={(item) => {
                props.onChange({ type: 'group', value: item.group })
              }}
            >
              <Button
                loading={!props.initialized}
                rightIcon="caret-down"
                text={GroupActiveItem()}
                title={GroupActiveItem()}
                small
                disabled={selectDisabled}
                className="exp2-submit-common-select-btn"
                onClick={() => {
                  props.onFocus()
                }}
              />
            </GroupSelect>
          </div>
        </FormGroup>
      </div>
    </InWrapper>
  )
}
