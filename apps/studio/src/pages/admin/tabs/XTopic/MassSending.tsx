import type {
  XTopicNotificationMassSendingHistoryListResult,
  XTopicNotificationSendMassBody,
} from '@hai-platform/client-ailab-server'
import { AilabServerApiName } from '@hai-platform/client-ailab-server'
import { NotificationSpecialReceiver } from '@hai-platform/shared'
import { confirmDialog, successDialog } from '@hai-platform/studio-pages/lib/ui-components/dialog'
import { Button, Checkbox, FormGroup, HTMLSelect, TextArea } from '@hai-ui/core/lib/esm'
import type { ArtColumn } from 'ali-react-table'
import dayjs from 'dayjs'

import React, { useState } from 'react'
import { useEffectOnce } from 'react-use/esm'
import { GlobalAilabServerClient } from '../../../../api/ailabServer'
import { NoData } from '../../../../components/Errors/NoData'
import { HFDashTable } from '../../../../components/HFTable'
import { AppToaster } from '../../../../utils'
import { getReceiverOptions, recMap } from './common'

export const SendingHistory = (props: {
  history: XTopicNotificationMassSendingHistoryListResult
  isLoading: boolean
  pageSize: number
}) => {
  const columns = [
    {
      code: 'createdAt',
      name: '时间',
      width: 20,
      align: 'left',
      render: (v: string) => dayjs(v).format('YY-MM-DD HH:mm'),
    },
    {
      code: 'sender',
      name: '发送人',
      width: 15,
      align: 'left',
    },
    {
      code: 'messageCount',
      name: '计数',
      width: 7,
      align: 'right',
    },
    {
      code: 'receiver',
      name: '接收者',
      width: 20,
      align: 'left',
      render: (v: string) => {
        const recv = recMap.get(v as any) ?? v
        return <span title={recv}>{recv}</span>
      }, // 库里不会有'custom’
    },
    {
      code: 'notes',
      name: '备注',
      width: 20,
      align: 'left',
      render: (v: string) => <span title={v}>{v}</span>,
    },
    {
      code: 'content',
      name: '内容',
      width: 100,
      align: 'left',
      render: (v: string) => <span title={v}>{v}</span>,
      // 放原始文本数据
    },
  ] as Array<ArtColumn>
  return (
    <div className="history-wrapper">
      <div className="history-title sub-title">最近 {props.pageSize} 条发送记录</div>
      <HFDashTable
        style={
          {
            height: 'calc(100vh - 700px)',
            minHeight: 200,
            overflowY: 'auto',
          } as React.CSSProperties
        }
        columns={columns}
        emptyCellHeight={140}
        dataSource={props.history.rows}
        isLoading={props.isLoading}
        components={{
          // eslint-disable-next-line react/no-unstable-nested-components
          EmptyContent: () => <NoData />,
        }}
      />
    </div>
  )
}

const receiverOptions = getReceiverOptions()

export const MassSending = (props: {
  submitHandler(option: XTopicNotificationSendMassBody): void
}) => {
  const [receiver, setReceiver] = useState<NotificationSpecialReceiver | 'custom'>(
    NotificationSpecialReceiver.PUBLIC,
  )
  const [customReceiver, setCustomReceiver] = useState('')
  const [content, setContent] = useState('')
  const [onlyInitializedUser, setOnlyInitializedUser] = useState(false)

  const submit = () => {
    const recv = receiver === 'custom' ? customReceiver : receiver
    if (!recv) {
      AppToaster.show({ message: '指定的用户不能为空', intent: 'danger', icon: 'error' })
      return
    }

    if (!content) {
      AppToaster.show({ message: '群发内容不能为空', intent: 'danger', icon: 'error' })
      return
    }

    confirmDialog(
      `确定要向 ${onlyInitializedUser ? '已经初始化的' : ''} ${recMap.get(receiver)} ${
        receiver === 'custom' ? customReceiver : ''
      } 发送消息 "${content}" 吗`,
    ).then((confirm) => {
      if (confirm) {
        props.submitHandler({ content, onlyInitializedUser, receiver: recv })
      }
    })
  }

  return (
    <div className="mass-sending-panel">
      <FormGroup label="接收者" labelFor="mass-sending-receiver" inline>
        <HTMLSelect
          value={receiver}
          id="mass-sending-receiver"
          onChange={(e) => {
            setReceiver(e.target.value as NotificationSpecialReceiver | 'custom')
          }}
        >
          {receiverOptions}
        </HTMLSelect>
      </FormGroup>
      {receiver === 'custom' && (
        <FormGroup label="自定义用户" labelFor="mass-sending-custom-receiver" inline>
          <TextArea
            value={customReceiver}
            id="mass-sending-custom-receiver"
            style={{ width: 600 }}
            placeholder="多个用户名之间使用逗号隔开"
            onChange={(e) => {
              setCustomReceiver(e.target.value)
            }}
          />
        </FormGroup>
      )}
      <FormGroup label="群发内容" labelFor="mass-sending-content" inline>
        <TextArea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          id="mass-sending-content"
          style={{ width: 600, height: 100 }}
          placeholder="支持 HTML 标签"
        />
      </FormGroup>
      <FormGroup label="其他选项" labelFor="mass-sending-content" inline>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            width: 600,
            justifyContent: 'space-between',
          }}
        >
          <Checkbox
            checked={onlyInitializedUser}
            label="只对已经初始化过昵称和头像的用户发送"
            onChange={(e) => setOnlyInitializedUser(e.currentTarget.checked)}
          />
          <div>
            <Button small intent="primary" icon="send-message" onClick={submit}>
              发送
            </Button>
          </div>
        </div>
      </FormGroup>
    </div>
  )
}
export const MassSendingMain = () => {
  const [historyLoading, setHistoryLoading] = useState(false)
  const [history, setHistory] = useState<XTopicNotificationMassSendingHistoryListResult>({
    count: 0,
    rows: [],
  })
  const HISTORY_COUNT = 100
  const fetchHistory = () => {
    setHistoryLoading(true)
    GlobalAilabServerClient.request(AilabServerApiName.XTOPIC_NOTIFICATION_MASS_SENDING_HISTORY, {
      page: 0,
      pageSize: HISTORY_COUNT,
    })
      .then((res) => {
        setHistory(res)
        setHistoryLoading(false)
      })
      .catch(() => {
        setHistoryLoading(false)
      })
  }

  useEffectOnce(fetchHistory)

  const sendMass = (option: XTopicNotificationSendMassBody) => {
    GlobalAilabServerClient.request(AilabServerApiName.XTOPIC_NOTIFICATION_SEND_MASS, undefined, {
      data: option,
    })
      .then((res) => {
        successDialog(`成功发送${res.messageCount}条`)
        fetchHistory()
      })
      .catch(fetchHistory)
  }

  return (
    <>
      <MassSending submitHandler={sendMass} />
      <SendingHistory isLoading={historyLoading} history={history} pageSize={HISTORY_COUNT} />
    </>
  )
}
