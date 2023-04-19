import { AilabServerApiName } from '@hai-platform/client-ailab-server'
import type { XTopicContentType } from '@hai-platform/shared'
import { Button, Dialog, InputGroup } from '@hai-ui/core/lib/esm'
import React, { useEffect, useState } from 'react'
import { GlobalAilabServerClient } from '../../../api/ailabServer'
import { AppToaster, getUserName } from '../../../utils'

export const XtopicReportModal = (p: {
  isOpen: boolean
  topic?: string
  nickname?: string
  index: number
  uuid: string
  contentType: XTopicContentType
  closeHandler: () => void
}) => {
  const [reason, setReason] = useState('')

  const typeMap = {
    comment: '评论',
    post: '话题',
    reply: '回复',
  } as Record<XTopicContentType, string>

  useEffect(() => {
    setReason('')
  }, [p.isOpen])
  const submit = () => {
    GlobalAilabServerClient.request(AilabServerApiName.XTOPIC_REPORT_INSERT, undefined, {
      data: {
        reason,
        contentType: p.contentType,
        itemUUID: p.uuid,
        itemIndex: p.index,
        submitter: getUserName(),
      },
    })
      .then(() => {
        AppToaster.show({
          message: '举报成功！',
          intent: 'success',
        })
        p.closeHandler()
      })
      .catch((e) => {
        AppToaster.show({
          message: `请求失败：${e}`,
          intent: 'danger',
        })
        p.closeHandler()
      })
  }

  return (
    <Dialog isOpen={p.isOpen} className="xtopic-report-dialog">
      <div className="hai-ui-dialog-header">
        <span className="hai-ui-icon-large hai-ui-icon-info-sign" />
        <h5 className="hai-ui-heading">举报</h5>
        <Button icon="cross" minimal small onClick={p.closeHandler} />
      </div>
      <div className="hai-ui-dialog-body">
        举报 {p.nickname} 的 {typeMap[p.contentType]} {p.topic && `“${p.topic}”`}
        <InputGroup
          style={{ marginTop: 20 }}
          value={reason}
          placeholder="请填写举报理由"
          onChange={(e) => {
            setReason(e.target.value)
          }}
        />
      </div>
      <div className="hai-ui-dialog-footer">
        <div className="hai-ui-dialog-footer-actions">
          <Button onClick={submit} intent="primary" disabled={!reason}>
            确认举报
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
