import { i18n, i18nKeys } from '@hai-platform/i18n'
import type { IToaster } from '@hai-ui/core/lib/esm'
import { Button, FormGroup, InputGroup } from '@hai-ui/core/lib/esm'
import React from 'react'
import { simpleCopy } from '../../../../../utils/copyToClipboard'
import type { SubmitCommonInputProps } from '../schema'

export interface Exp2EntryPointInputProps extends SubmitCommonInputProps {
  value: string
  toaster: IToaster
}

export const Exp2EntryPointInput = (props: Exp2EntryPointInputProps) => {
  return props.isLock ? (
    <FormGroup
      inline
      label={i18n.t(i18nKeys.biz_exp_submit_file)}
      className="exp-settings-file-override"
    >
      <InputGroup
        className="hf-input middle"
        disabled
        id="exp2-entrypoint-input"
        fill
        value={props.value || ''}
        // 注意：这里用了 rtl 的排版，有一个坑是如果是以非字母开头的话，会有些错乱
        title={props.value || ''}
      />
      <Button
        className="exp2-additional-btn"
        small
        icon="duplicate"
        outlined
        title="copy full path"
        onClick={() => {
          simpleCopy(props.value || '', 'file path', props.toaster)
        }}
      />
    </FormGroup>
  ) : null
}
