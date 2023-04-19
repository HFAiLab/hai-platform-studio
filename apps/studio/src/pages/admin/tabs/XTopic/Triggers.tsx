import type {
  XTopicNotificationTriggerInsertBody,
  XTopicNotificationTriggerListResult,
  XTopicNotificationTriggerSendedResult,
} from '@hai-platform/client-ailab-server'
import { AilabServerApiName } from '@hai-platform/client-ailab-server'
import type { XTopicNotificationTriggerSchema } from '@hai-platform/shared'
import { NotificationSpecialReceiver, NotificationTriggerEvent } from '@hai-platform/shared'
import { confirmDialog } from '@hai-platform/studio-pages/lib/ui-components/dialog'
import {
  Button,
  Callout,
  Checkbox,
  Dialog,
  FormGroup,
  HTMLSelect,
  InputGroup,
  TextArea,
} from '@hai-ui/core/lib/esm'
import { Classes } from '@hai-ui/core/lib/esm/common'
import type { ArtColumn } from 'ali-react-table'
import dayjs from 'dayjs'
import React, { useEffect, useState } from 'react'
import { GlobalAilabServerClient } from '../../../../api/ailabServer'
import { NoData } from '../../../../components/Errors/NoData'
import { HFAdminNarrowTable } from '../../../../components/HFTable'
import { AppToaster } from '../../../../utils'
import { getReceiverOptions, recMap } from './common'

const booleanRender = (v: boolean) => (v ? '√' : '')

const triggerEventMap = new Map([
  [NotificationTriggerEvent.REQUEST_LIST, '请求话题列表'],
  [NotificationTriggerEvent.USER_UPDATE, '更新个人信息'],
])
export const TriggerList = (props: {
  triggers: XTopicNotificationTriggerListResult
  isLoading: boolean
  updateHandler(item: XTopicNotificationTriggerSchema): void
  deleteHandler(item: XTopicNotificationTriggerSchema): void
  showSendedHandler(item: XTopicNotificationTriggerSchema): void
}) => {
  const columns = [
    {
      code: 'enabled',
      name: '启用',
      width: 15,
      align: 'left',
      render: booleanRender,
    },
    {
      code: 'createdAt',
      name: '添加时间',
      width: 30,
      align: 'left',
      render: (v: string) => dayjs(v).format('YY-MM-DD HH:mm'),
    },
    {
      code: 'expires',
      name: '过期',
      width: 30,
      align: 'left',
      render: (v: string) => {
        const dt = dayjs(v)
        return (
          <span style={{ color: dt.valueOf() < new Date().valueOf() ? 'red' : undefined }}>
            {dayjs(v).format('YY-MM-DD HH:mm')}
          </span>
        )
      },
    },
    {
      code: 'addBy',
      name: '添加者',
      width: 25,
      align: 'left',
    },
    {
      code: 'triggerEvent',
      name: '触发事件',
      width: 30,
      align: 'left',
      render: (v: string) => triggerEventMap.get(v as NotificationTriggerEvent) ?? v,
    },
    {
      code: 'receiver',
      name: '接收对象',
      width: 20,
      align: 'left',
      render: (v: string) => {
        const recv = recMap.get(v as any) ?? v
        return <span title={recv}>{recv}</span>
      }, // 库里不会有'custom’
    },
    {
      code: 'triggerCount',
      name: '计数',
      width: 15,
      align: 'left',
    },
    {
      code: 'triggerMultiple',
      name: '重复',
      width: 15,
      align: 'left',
      render: booleanRender,
    },
    {
      code: 'content',
      name: '内容',
      width: 100,
      align: 'left',
      render: (v: string) => <span title={v}>{v}</span>,
    },
    {
      code: 'index',
      name: '操作',
      width: 50,
      align: 'center',
      render: (v: number, row: XTopicNotificationTriggerSchema) => (
        <>
          <Button minimal small intent="danger" onClick={() => props.deleteHandler(row)}>
            删除
          </Button>
          <Button minimal small intent="primary" onClick={() => props.updateHandler(row)}>
            修改
          </Button>
          <Button minimal small onClick={() => props.showSendedHandler(row)}>
            查记录
          </Button>
        </>
      ),
    },
  ] as Array<ArtColumn>
  return (
    <div className="list-wrapper">
      <HFAdminNarrowTable
        style={
          {
            minHeight: 300,
            overflowY: 'auto',
            height: 'calc(100vh - 500px)',
          } as React.CSSProperties
        }
        className="quota-table"
        columns={columns}
        emptyCellHeight={140}
        dataSource={props.triggers.rows}
        isLoading={props.isLoading}
        components={{
          // eslint-disable-next-line react/no-unstable-nested-components
          EmptyContent: () => <NoData />,
        }}
        // dataSource={tableData}
      />
    </div>
  )
}

const receiverOptions = getReceiverOptions(true)

export const CreateTrigger = (props: {
  isOpen: boolean
  isLoading: boolean
  onClose: () => void
  submit: (option: XTopicNotificationTriggerInsertBody) => void
}) => {
  const getDefaultOption = () => {
    return {
      content: '',
      expires: new Date(),
      receiver: NotificationSpecialReceiver.PUBLIC,
      triggerEvent: NotificationTriggerEvent.REQUEST_LIST,
      triggerMultiple: false,
    }
  }
  const [createOption, setCreateOption] = useState<XTopicNotificationTriggerInsertBody>(
    getDefaultOption(),
  )
  useEffect(() => {
    setCreateOption(getDefaultOption())
  }, [props.isOpen])
  const canSubmit = createOption.content && !props.isLoading
  return (
    <Dialog
      isOpen={props.isOpen}
      className="trigger-create-dialog"
      onClose={props.onClose}
      title="创建触发器"
    >
      <div className={Classes.DIALOG_BODY}>
        <div className="content">
          <FormGroup label="内容" inline>
            <TextArea
              value={createOption.content}
              onChange={(e) => {
                setCreateOption({ ...createOption, content: e.target.value })
              }}
              style={{ width: 360, height: 100 }}
              placeholder="支持 HTML 标签"
            />
          </FormGroup>
          <FormGroup label="过期时间" inline>
            <InputGroup
              type="date"
              value={dayjs(createOption.expires).format('YYYY-MM-DD')}
              onChange={(e) => {
                setCreateOption({ ...createOption, expires: new Date(e.target.value) })
              }}
            />
          </FormGroup>
          <FormGroup label="接收者" inline>
            <HTMLSelect
              value={createOption.receiver}
              onChange={(e) => {
                setCreateOption({
                  ...createOption,
                  receiver: e.target.value as NotificationSpecialReceiver,
                })
              }}
            >
              {receiverOptions}
            </HTMLSelect>
          </FormGroup>
          <FormGroup label="何时触发" inline>
            <HTMLSelect
              value={createOption.triggerEvent}
              onChange={(e) => {
                setCreateOption({
                  ...createOption,
                  triggerEvent: e.target.value as NotificationTriggerEvent,
                })
              }}
            >
              <option value={NotificationTriggerEvent.REQUEST_LIST}>请求话题列表</option>
              <option value={NotificationTriggerEvent.USER_UPDATE}>更新个人信息</option>
            </HTMLSelect>
          </FormGroup>
          <FormGroup label="限制" inline>
            <Checkbox
              checked={createOption.triggerMultiple}
              label="允许多次发送给同一用户"
              onChange={(e) =>
                setCreateOption({
                  ...createOption,
                  triggerMultiple: e.currentTarget.checked,
                })
              }
            />
          </FormGroup>
          <Callout intent="warning">
            注意：提交后只有 [过期时间] 以及 [是否启用]
            可以修改，请谨慎填写内容和条件。填写错误请直接删除或者禁用
          </Callout>
        </div>
      </div>

      <div className={Classes.DIALOG_FOOTER}>
        <Button
          intent="primary"
          onClick={() => props.submit(createOption)}
          loading={props.isLoading}
          disabled={!canSubmit}
          fill
        >
          提交
        </Button>
      </div>
    </Dialog>
  )
}
type TriggerUpdateOption = { enabled: boolean; expires: Date }
const UpdateTrigger = (props: {
  triggerItem: XTopicNotificationTriggerSchema | null
  isLoading: boolean
  submit(index: number, option: TriggerUpdateOption): void
  onClose(): void
}) => {
  const [updateOption, setUpdateOption] = useState<TriggerUpdateOption>({
    enabled: props.triggerItem?.enabled ?? true,
    expires: props.triggerItem?.expires ?? new Date(),
  })
  const canSubmit = props.triggerItem && !!updateOption.expires

  useEffect(() => {
    if (props.triggerItem) {
      setUpdateOption({
        enabled: props.triggerItem.enabled,
        expires: props.triggerItem.expires,
      })
    }
  }, [props.triggerItem])

  return (
    <Dialog
      isOpen={!!props.triggerItem}
      className="trigger-create-dialog"
      onClose={props.onClose}
      title="修改触发器"
    >
      <div className={Classes.DIALOG_BODY}>
        <div className="content">
          <FormGroup label="内容" inline>
            <TextArea
              value={props.triggerItem?.content}
              disabled
              style={{ width: 360, height: 100 }}
            />
          </FormGroup>
          <FormGroup label="过期时间" inline>
            <InputGroup
              type="date"
              value={dayjs(updateOption.expires).format('YYYY-MM-DD')}
              onChange={(e) => {
                setUpdateOption({ ...updateOption, expires: new Date(e.target.value) })
              }}
            />
          </FormGroup>
          <FormGroup label="" inline>
            <Checkbox
              checked={updateOption.enabled}
              label="启用该触发器"
              onChange={(e) =>
                setUpdateOption({
                  ...updateOption,
                  enabled: e.currentTarget.checked,
                })
              }
            />
          </FormGroup>
        </div>
      </div>

      <div className={Classes.DIALOG_FOOTER}>
        <Button
          intent="primary"
          onClick={() => props.submit(props.triggerItem!.index, updateOption)}
          loading={props.isLoading}
          disabled={!canSubmit}
          fill
        >
          提交
        </Button>
      </div>
    </Dialog>
  )
}

export const ShowSendedNotifications = (props: {
  triggerItem: XTopicNotificationTriggerSchema | null
  onClose(): void
}) => {
  const [sended, setSended] = useState<XTopicNotificationTriggerSendedResult>({
    count: 0,
    rows: [],
  })
  const [loading, setLoading] = useState(false)
  const fetchData = () => {
    if (!props.triggerItem) {
      return
    }
    setLoading(true)
    GlobalAilabServerClient.request(AilabServerApiName.XTOPIC_NOTIFICATION_TRIGGER_SENDED, {
      triggerId: props.triggerItem.index,
    })
      .then((res) => {
        setLoading(false)
        setSended(res)
      })
      .catch(() => {
        setLoading(false)
        setSended({ count: 0, rows: [] })
      })
  }
  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.triggerItem])
  const columns = [
    {
      code: 'createdAt',
      name: '时间',
      width: 3,
      align: 'left',
      render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      code: 'notifier',
      name: '接收人',
      width: 3,
      align: 'left',
    },
    {
      code: 'read',
      name: '已读',
      width: 2,
      align: 'left',
      render: booleanRender,
    },
  ] as Array<ArtColumn>
  return (
    <Dialog
      isOpen={!!props.triggerItem}
      className="trigger-create-dialog"
      onClose={props.onClose}
      title="触发历史"
    >
      <div className={Classes.DIALOG_BODY}>
        <div className="content">
          <FormGroup label="内容" inline>
            <TextArea
              value={props.triggerItem?.content}
              disabled
              style={{ width: 360, height: 60 }}
            />
          </FormGroup>
          <FormGroup label="事件" inline>
            <InputGroup
              value={
                triggerEventMap.get(props.triggerItem?.triggerEvent as NotificationTriggerEvent) ??
                props.triggerItem?.triggerEvent
              }
              disabled
            />
          </FormGroup>
          <HFAdminNarrowTable
            style={
              {
                maxHeight: 300,
                overflowY: 'auto',
                background: 'var(--hai-ui-layout-1)',
                padding: 10,
              } as React.CSSProperties
            }
            columns={columns}
            emptyCellHeight={140}
            dataSource={sended.rows}
            isLoading={loading}
            components={{
              // eslint-disable-next-line react/no-unstable-nested-components
              EmptyContent: () => <NoData />,
            }}
          />
        </div>
      </div>
    </Dialog>
  )
}

export const TriggerManager = () => {
  const [triggers, setTriggers] = useState<XTopicNotificationTriggerListResult>({
    count: 0,
    rows: [],
  })
  const [triggersLoading, setTriggersLoading] = useState(false)
  const [onlyNotExpired, setOnlyNotExpired] = useState(true)

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)

  const [triggerToUpdate, setTriggerToUpdate] = useState<XTopicNotificationTriggerSchema | null>(
    null,
  )
  const [updateLoading, setUpdateLoading] = useState(false)
  const [triggerToShowSended, setTriggerToShowSended] =
    useState<XTopicNotificationTriggerSchema | null>(null)

  const fetchTriggers = () => {
    setTriggersLoading(true)
    GlobalAilabServerClient.request(AilabServerApiName.XTOPIC_NOTIFICATION_TRIGGER_LIST, {
      onlyNotExpired,
    })
      .then((res) => {
        setTriggers(res)
        setTriggersLoading(false)
      })
      .catch(() => {
        setTriggersLoading(false)
      })
  }

  const createTrigger = (option: XTopicNotificationTriggerInsertBody) => {
    setCreateLoading(true)
    GlobalAilabServerClient.request(
      AilabServerApiName.XTOPIC_NOTIFICATION_TRIGGER_INSERT,
      undefined,
      {
        data: option,
      },
    )
      .then(() => {
        AppToaster.show({ message: '创建触发器成功', intent: 'success' })
        setCreateLoading(false)
        setCreateDialogOpen(false)
        fetchTriggers()
      })
      .catch(() => {
        setCreateLoading(false)
      })
  }

  const openUpdate = (item: XTopicNotificationTriggerSchema) => {
    setTriggerToUpdate(item)
  }
  const openDelete = (item: XTopicNotificationTriggerSchema) => {
    confirmDialog(`确定要删除触发器 "${item.content}" 吗？`).then((confirmed) => {
      if (confirmed) {
        GlobalAilabServerClient.request(
          AilabServerApiName.XTOPIC_NOTIFICATION_TRIGGER_UPDATE,
          undefined,
          { data: { index: item.index, type: 'delete' } },
        ).then(() => {
          AppToaster.show({ message: '删除成功', intent: 'success' })
          fetchTriggers()
        })
      }
    })
  }
  const showSended = (item: XTopicNotificationTriggerSchema) => {
    setTriggerToShowSended(item)
  }

  const submitUpdate = (index: number, option: TriggerUpdateOption) => {
    setUpdateLoading(true)
    GlobalAilabServerClient.request(
      AilabServerApiName.XTOPIC_NOTIFICATION_TRIGGER_UPDATE,
      undefined,
      {
        data: {
          type: 'update',
          index,
          option,
        },
      },
    )
      .then(() => {
        setUpdateLoading(false)
        setTriggerToUpdate(null)
        fetchTriggers()
        AppToaster.show({ message: '更新成功', intent: 'success' })
      })
      .catch(() => {
        setTriggersLoading(false)
      })
  }

  useEffect(fetchTriggers, [onlyNotExpired])

  return (
    <div className="trigger-manager">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingRight: 30,
          marginBottom: 10,
        }}
      >
        <Checkbox
          checked={onlyNotExpired}
          label="只显示未过期的Trigger"
          onChange={(e) => setOnlyNotExpired(e.currentTarget.checked)}
        />
        <Button small intent="primary" icon="plus" onClick={() => setCreateDialogOpen(true)}>
          创建新触发器
        </Button>
      </div>
      <TriggerList
        isLoading={triggersLoading}
        triggers={triggers}
        updateHandler={openUpdate}
        deleteHandler={openDelete}
        showSendedHandler={showSended}
      />
      <CreateTrigger
        isLoading={createLoading}
        isOpen={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        submit={createTrigger}
      />
      <UpdateTrigger
        isLoading={updateLoading}
        triggerItem={triggerToUpdate}
        onClose={() => setTriggerToUpdate(null)}
        submit={submitUpdate}
      />
      <ShowSendedNotifications
        onClose={() => {
          setTriggerToShowSended(null)
        }}
        triggerItem={triggerToShowSended}
      />
    </div>
  )
}
