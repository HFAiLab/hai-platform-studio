import { i18n, i18nKeys } from '@hai-platform/i18n'
import type { TaskCreateYamlSchemaV2 } from '@hai-platform/shared'
import type { IToaster } from '@hai-ui/core/lib/esm'
import { Button, FormGroup, MenuItem } from '@hai-ui/core/lib/esm'
import { Select } from '@hai-ui/select'
import classNames from 'classnames'
import React, { useContext } from 'react'
import { genPopover } from '../../../../../ui-components/popover'
import { simpleCopy } from '../../../../../utils/copyToClipboard'
import { ExpServiceContext, IfParamChangeInDraft } from '../../../reducer'
import type { SubmitCommonInputProps } from '../schema'
import { Exp2EditTip } from '../widgets/EditTip'

export interface Exp2DirectoryInputProps extends SubmitCommonInputProps {
  value: string
  directoryList: Array<string>
  chainYamlSchema: TaskCreateYamlSchemaV2 | null
  toaster: IToaster
}

const DirectorySelect = Select.ofType<string>()

export const Exp2DirectoryInput = (props: Exp2DirectoryInputProps) => {
  const srvc = useContext(ExpServiceContext)
  const { state } = srvc
  const ifDirectoryChangeInDraft = IfParamChangeInDraft(state, 'directory')

  const selectDisabled = props.isLock

  return (
    <div className="exp2-form-group-container">
      {ifDirectoryChangeInDraft && (
        <Exp2EditTip value={`${state.createDraft.directory}`} isLock={props.isLock} />
      )}
      <FormGroup
        label={genPopover({
          inline: true,
          label: i18n.t(i18nKeys.biz_exp_submit_dir),
          helperText: i18n.t(i18nKeys.biz_exp_submit_dir_helper),
        })}
        inline
        className="exp-settings-dir-override"
      >
        <DirectorySelect
          fill
          filterable={false}
          items={props.directoryList}
          // eslint-disable-next-line react/no-unstable-nested-components
          itemRenderer={(i, { handleClick }) => {
            return <MenuItem active={i === props.value} key={i} onClick={handleClick} text={i} />
          }}
          popoverProps={{ minimal: true }}
          activeItem={props.directoryList.find((i) => i === props.value)}
          onItemSelect={(dir) => {
            props.onChange({ type: 'directory', value: dir })
          }}
          className={classNames('exp-settings-dir-select-container', {
            short: props.isLock,
          })}
          disabled={selectDisabled}
        >
          <Button
            loading={props.isLoading}
            rightIcon="caret-down"
            className="exp2-submit-common-select-btn"
            small
            disabled={selectDisabled}
            title={props.value}
          >
            {/* 默认一个空格：为了没有 workspace 的情况下仍然布局正确 */}
            {props.value || ' '}
          </Button>
        </DirectorySelect>
        {props.isLock && (
          <Button
            className="exp2-additional-btn"
            small
            icon="duplicate"
            outlined
            title={i18n.t(i18nKeys.base_clear_zero)}
            onClick={() => {
              const workerSpace = props.chainYamlSchema?.spec.workspace || ''
              if (!workerSpace) {
                props.toaster.show({
                  // 目前发现，除了 validation 任务，没有其他任务有这种情况
                  intent: 'warning',
                  message: 'directory is empty',
                })
                return
              }
              simpleCopy(workerSpace, 'directory', props.toaster)
            }}
          />
        )}
      </FormGroup>
    </div>
  )
}
