import { i18n, i18nKeys } from '@hai-platform/i18n'
import { TaskChainStatus } from '@hai-platform/shared'
import { Alert, Callout } from '@hai-ui/core/lib/esm'
import React from 'react'
import type { Chain } from '../../../../../model/Chain'

export const BatchStopAlertComponent = (props: {
  isOpen: boolean
  batchStopping: boolean
  setBatchStopAlertShow(v: boolean): void
  batchStop(): void
  selectChains: Array<Chain>
}) => {
  const notFinishedChains = props.selectChains.filter(
    (chain) => chain.chain_status !== TaskChainStatus.FINISHED,
  )
  const notFinishedLength = notFinishedChains.length

  return (
    <Alert
      isOpen={props.isOpen}
      canEscapeKeyCancel
      className="manage-batch-alert"
      cancelButtonText={notFinishedLength ? i18n.t(i18nKeys.base_Cancel) : ''}
      confirmButtonText={
        notFinishedLength ? i18n.t(i18nKeys.base_Confirm) : i18n.t(i18nKeys.base_Cancel)
      }
      intent={notFinishedLength ? 'primary' : 'none'}
      onCancel={() => {
        props.setBatchStopAlertShow(false)
      }}
      onConfirm={() => {
        if (!notFinishedLength) props.setBatchStopAlertShow(false)
        else {
          props.batchStop()
        }
      }}
    >
      <Callout className="batch-alert-callout">{`${i18n.t(
        i18nKeys.biz_exp_batch_stop_already_filter,
      )}${notFinishedLength}`}</Callout>
      {props.batchStopping && <p>{i18n.t(i18nKeys.biz_exp_stopping)}</p>}
      {!props.batchStopping && <p>{i18n.t(i18nKeys.biz_exp_batch_stop)}</p>}
      <ul>
        {notFinishedChains.map((item) => {
          return (
            <li key={`${item.id}${item.showName}`}>
              {item.id}&nbsp;:&nbsp;
              {item.showName}
            </li>
          )
        })}
      </ul>
      {!notFinishedLength && <div className="batch-alert-no-match">没有可以停止的任务</div>}
    </Alert>
  )
}
