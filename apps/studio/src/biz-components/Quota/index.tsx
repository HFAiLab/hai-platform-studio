import { ApiServerApiName } from '@hai-platform/client-api-server'
import { i18n, i18nKeys } from '@hai-platform/i18n'
import { getDefaultTrainingGroup } from '@hai-platform/shared'
import type { IPriorityItem } from '@hai-platform/studio-pages/lib/model/TaskCreateSettings'
import {
  InlineIcon,
  PriorityIcon,
} from '@hai-platform/studio-pages/lib/ui-components/svgIcon/index'
import { Button } from '@hai-ui/core/lib/esm/components/button/buttons'
import { Dialog } from '@hai-ui/core/lib/esm/components/dialog/dialog'
import { InputGroup } from '@hai-ui/core/lib/esm/components/forms/inputGroup'
import type { ArtColumn } from 'ali-react-table/dist/interfaces'
import React, { useState } from 'react'
import { GlobalApiServerClient } from '../../api/apiServer'
import { HFDashTable } from '../../components/HFTable'
import { User } from '../../modules/user'
import { AppToaster, getToken } from '../../utils'
import { computeQuotaList } from '../../utils/quota'
import './index.scss'

export const QuotaDetail = (props: {
  dataSource: IPriorityItem[]
  groupName: string
  refreshQuota: () => void
}) => {
  const [currentQuotaToBeChange, setCurrentQuotaToBeChange] = useState<number>(-1)
  const [currentPriorityToBeChange, setCurrentPriorityToBeChange] = useState<string>('')
  const [quotaUpdating, setQuotaUpdating] = useState(false)

  const columnsOfPaths = [
    {
      code: 'priority',
      name: i18n.t(i18nKeys.biz_priority),
      align: 'left',
      render: (p) => {
        return (
          <>
            <PriorityIcon priority={p} />
            {p}
          </>
        )
      },
      width: 36,
    },
    { code: 'used', name: i18n.t(i18nKeys.biz_quota_used), width: 16, align: 'left' },
    { code: 'total', name: i18n.t(i18nKeys.biz_quota_total), width: 16, align: 'left' },
    { code: 'limit', name: i18n.t(i18nKeys.biz_quota_limit), width: 16, align: 'left' },
  ] as Array<ArtColumn>

  if (User.getInstance().in) {
    columnsOfPaths.push({
      code: 'edit',
      name: '',
      align: 'right',
      width: 6,
      render: (p, record: IPriorityItem) => {
        return (
          <span className="edit">
            <a
              onClick={() => {
                const { priority } = record
                const total = Number(record.total) || 0
                setCurrentPriorityToBeChange(priority)
                setCurrentQuotaToBeChange(total)
              }}
            >
              <InlineIcon name="edit" />
            </a>
          </span>
        )
      },
    })
  }

  const updateQuota = async () => {
    if (quotaUpdating) return
    setQuotaUpdating(true)
    try {
      await GlobalApiServerClient.request(ApiServerApiName.SET_TRAINING_QUOTA, {
        group_label: props.groupName,
        priority_label: currentPriorityToBeChange,
        quota: currentQuotaToBeChange,
        token: getToken(),
      })
      setQuotaUpdating(false)
      setCurrentPriorityToBeChange('')
      props.refreshQuota()
    } catch (e) {
      AppToaster.show({
        message: i18n.t(i18nKeys.biz_request_error),
      })
    }
  }

  return (
    <>
      <Dialog
        isOpen={!!currentPriorityToBeChange}
        className="quotachange-dialog"
        onClose={() => {
          setCurrentPriorityToBeChange('')
        }}
      >
        <p>{i18n.t(i18nKeys.biz_quota_change_desc, { priority: currentPriorityToBeChange })}</p>
        <InputGroup
          id="input-token"
          className="quotachange-input"
          type="number"
          value={`${currentQuotaToBeChange}`}
          onChange={(e) => {
            setCurrentQuotaToBeChange(Number(e.target.value))
          }}
        />
        <Button intent="primary" onClick={updateQuota}>
          {i18n.t(i18nKeys.biz_ensure_change)}
        </Button>
      </Dialog>
      <HFDashTable columns={columnsOfPaths} dataSource={props.dataSource} />
      <div className="desc">{i18n.t(i18nKeys.biz_quota_limit_desc)}</div>
    </>
  )
}

export const Quota = () => {
  const [quotaGroup, setQuotaGroup] = useState<string>(getDefaultTrainingGroup())
  const [quotaMap, setQuotaMap] = useState(User.getInstance().quotaMap)
  const dataSource = computeQuotaList(quotaMap, quotaGroup)

  const triggerUpdateQuota = () => {
    User.getInstance()
      .fetchQuotaInfo(true)
      .then((qMap) => {
        setQuotaMap(qMap)
      })
  }

  const refreshQuota = () => {
    triggerUpdateQuota()
    // 考虑到可能存在的主从库延迟，兜个底
    setTimeout(() => {
      triggerUpdateQuota()
    }, 2000)
  }

  return (
    <div className="quota-container">
      <div className="hai-ui-html-select .modifier quota-selects">
        <select
          onChangeCapture={(e) => {
            setQuotaGroup((e.target! as any).value)
          }}
        >
          {Object.keys(quotaMap).map((key) => {
            return (
              <option key={key} selected={key === quotaGroup}>
                {key}
              </option>
            )
          })}
        </select>
        <span className="hai-ui-icon hai-ui-icon-double-caret-vertical" />
      </div>
      {!!dataSource && (
        <QuotaDetail refreshQuota={refreshQuota} dataSource={dataSource} groupName={quotaGroup} />
      )}
    </div>
  )
}
