import { i18n, i18nKeys } from '@hai-platform/i18n'
import { TaskWorkerStatus } from '@hai-platform/shared'
import { Tooltip2 } from '@hai-ui/popover2'
import classNames from 'classnames'
import dayjs from 'dayjs'
import React, { useContext } from 'react'
import { StatusIconV2 } from '../../../../ui-components/svgIcon'
import * as uikit from '../../../../ui-components/uikit'
import { ExpServiceContext } from '../../reducer'

export const ExpStatusLite = (): JSX.Element => {
  const srvc = useContext(ExpServiceContext)
  const { state } = srvc
  const { chain } = state

  const Contents = chain && (
    <div className="metas">
      <div className="meta-line">
        <div className="label">{i18n.t(i18nKeys.biz_exp_status_chain_id)}</div>
        <div className="info" style={{ color: '#AAA', fontSize: '10px' }}>
          {chain.chain_id.split('-')[0]}
        </div>
      </div>
      {window._hf_user_if_in && (
        <div className="meta-line">
          <div className="label">{i18n.t(i18nKeys.biz_current_priority)}</div>
          <div className="info">{chain.priorityName}</div>
        </div>
      )}
      <div className="meta-line">
        <div className="label">{i18n.t(i18nKeys.biz_exp_status_suspend_count)}</div>
        <div className="info">{chain.suspend_count}</div>
      </div>
      <div className="meta-line">
        <div className="label">{i18n.t(i18nKeys.biz_exp_status_task_created)}</div>
        <div className="info">{dayjs(chain.created_at_list[0]).format('YYYY-MM-DD HH:mm:ss')}</div>
      </div>
      <div className="meta-line">
        <div className="label">{i18n.t(i18nKeys.biz_exp_status_chain_begin)}</div>
        <div className="info">
          {chain.chain_status === 'waiting_init'
            ? 'Not Started'
            : (chain.begin_at_list[0] ?? '').replace('T', ' ').split('.')[0]}
        </div>
      </div>
      <div className="meta-line">
        <div className="label">{i18n.t(i18nKeys.biz_exp_status_chain_end)}</div>
        <div className="info">
          {chain.chain_status !== 'finished'
            ? 'Not Finished'
            : (chain.end_at ?? '').replace('T', ' ').split('.')[0]}
        </div>
      </div>
      <div className="meta-line">
        <div className="label" style={{ paddingRight: '20px' }}>
          {i18n.t(i18nKeys.biz_exp_status_current_whole_life_state)}
        </div>
        <div className="info">{chain.whole_life_state}</div>
      </div>
    </div>
  )

  if (chain) {
    return (
      <div
        className={classNames('status-wrapper', {
          'failed-file-status':
            chain.worker_status === TaskWorkerStatus.FAILED && state.queryType === 'path',
        })}
      >
        <uikit.Collapse
          defaultShow={false}
          desc={
            <Tooltip2
              position="top"
              content={
                chain.worker_status === TaskWorkerStatus.FAILED
                  ? '可以点击`恢复`快速恢复 当前的训练'
                  : ''
              }
            >
              <span>
                {i18n.t(i18nKeys.base_Status)} :{' '}
                <StatusIconV2
                  customStyle={{ position: 'relative', top: '.125em' }}
                  chainStatus={chain.chain_status}
                  workerStatus={chain.worker_status}
                />
                &nbsp;
                {chain.worker_status}
              </span>
            </Tooltip2>
          }
        >
          {Contents}
        </uikit.Collapse>
      </div>
    )
  }
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <></>
}
