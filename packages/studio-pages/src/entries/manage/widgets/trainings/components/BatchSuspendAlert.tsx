import { i18n, i18nKeys } from '@hai-platform/i18n'
import { TaskChainStatus } from '@hai-platform/shared'
import { Alert, Callout } from '@hai-ui/core/lib/esm'
import React from 'react'
import type { Chain } from '../../../../../model/Chain'

export const BatchSuspendAlertComponent = (props: {
  isOpen: boolean
  batchSuspending: boolean
  setBatchSuspendAlertShow(v: boolean): void
  batchSuspend(chains: Chain[]): void
  selectChains: Array<Chain>
}) => {
  const suspendChains = props.selectChains.filter(
    (chain) => chain.chain_status === TaskChainStatus.RUNNING,
  )

  const suspendLength = suspendChains.length

  return (
    <Alert
      isOpen={props.isOpen}
      canEscapeKeyCancel
      className="manage-batch-alert"
      cancelButtonText={suspendLength ? i18n.t(i18nKeys.base_Cancel) : ''}
      confirmButtonText={
        suspendLength ? i18n.t(i18nKeys.base_Confirm) : i18n.t(i18nKeys.base_Cancel)
      }
      intent={suspendLength ? 'primary' : 'none'}
      onCancel={() => {
        props.setBatchSuspendAlertShow(false)
      }}
      onConfirm={() => {
        if (!suspendLength) props.setBatchSuspendAlertShow(false)
        else {
          props.batchSuspend(suspendChains)
        }
      }}
    >
      <Callout className="batch-alert-callout">{`${i18n.t(
        i18nKeys.biz_exp_batch_suspend_already_filter,
      )}${suspendLength}`}</Callout>

      {props.batchSuspending && <p>{i18n.t(i18nKeys.biz_exp_suspending)}</p>}
      {!props.batchSuspending && <p>{i18n.t(i18nKeys.biz_exp_batch_suspend)}</p>}
      <ul>
        {suspendChains.map((item) => {
          return (
            <li key={`${item.id}${item.showName}`}>
              {item.id}&nbsp;:&nbsp;
              {item.showName}
            </li>
          )
        })}
      </ul>
      {!suspendLength && (
        <div className="batch-alert-no-match">{i18n.t(i18nKeys.biz_exp_batch_suspend_empty)}</div>
      )}
    </Alert>
  )
}
