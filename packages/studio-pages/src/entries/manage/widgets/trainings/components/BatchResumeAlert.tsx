import { i18n, i18nKeys } from '@hai-platform/i18n'
import { TaskChainStatus, TaskWorkerStatus } from '@hai-platform/shared'
import { Alert, Callout, Checkbox } from '@hai-ui/core/lib/esm'
import React, { useState } from 'react'
import type { Chain } from '../../../../../model/Chain'

export const BatchResumeAlertComponent = (props: {
  isOpen: boolean
  batchResuming: boolean
  setBatchResumeAlertShow(v: boolean): void
  batchResume(chains: Chain[]): void
  selectChains: Array<Chain>
}) => {
  const [onlyShowFailed, setOnlyShowFailed] = useState(true)

  const canBeResumed = (chain: Chain) => {
    return (
      chain.chain_status === TaskChainStatus.FINISHED &&
      (onlyShowFailed ? chain.worker_status === TaskWorkerStatus.FAILED : true)
    )
  }

  const resumeChains = props.selectChains.filter(canBeResumed)

  const finishedLength = resumeChains.length

  return (
    <Alert
      isOpen={props.isOpen}
      canEscapeKeyCancel
      className="manage-batch-alert"
      cancelButtonText={finishedLength ? i18n.t(i18nKeys.base_Cancel) : ''}
      confirmButtonText={
        finishedLength ? i18n.t(i18nKeys.base_Confirm) : i18n.t(i18nKeys.base_Cancel)
      }
      intent={finishedLength ? 'primary' : 'none'}
      onCancel={() => {
        props.setBatchResumeAlertShow(false)
      }}
      onConfirm={() => {
        if (!finishedLength) props.setBatchResumeAlertShow(false)
        else {
          props.batchResume(resumeChains)
        }
      }}
    >
      <Callout className="batch-alert-callout">{`${i18n.t(
        i18nKeys.biz_exp_batch_resume_already_filter,
      )}${finishedLength}`}</Callout>
      <div className="batch-alert-options">
        <Checkbox
          label={i18n.t(i18nKeys.biz_exp_batch_resume_only_failed)}
          checked={onlyShowFailed}
          onChange={() => {
            setOnlyShowFailed(!onlyShowFailed)
          }}
        />
      </div>

      {props.batchResuming && <p>{i18n.t(i18nKeys.biz_exp_resuming)}</p>}
      {!props.batchResuming && <p>{i18n.t(i18nKeys.biz_exp_batch_resume)}</p>}
      <ul>
        {resumeChains.map((item) => {
          return (
            <li key={`${item.id}${item.showName}`}>
              {item.id}&nbsp;:&nbsp;
              {item.showName}
            </li>
          )
        })}
      </ul>
      {!finishedLength && (
        <div className="batch-alert-no-match">{i18n.t(i18nKeys.biz_exp_batch_resume_empty)}</div>
      )}
    </Alert>
  )
}
