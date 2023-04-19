import type { ServiceTaskTasksApiResult } from '@hai-platform/client-api-server'
import { ApiServerApiName } from '@hai-platform/client-api-server'
import { usePageFocus } from '@hai-platform/studio-pages/lib/hooks/usePageFocus'
import { useRefState } from '@hai-platform/studio-pages/lib/hooks/useRefState'
import { IOFrontier } from '@hai-platform/studio-pages/lib/socket'
import type { SubPayload } from '@hai-platform/studio-schemas'
import { SubscribeCommands } from '@hai-platform/studio-schemas'
import React, { useRef } from 'react'
import { useEffectOnce } from 'react-use'
import { GrootStatus } from 'use-groot'
import { GlobalApiServerClient } from '../../../../api/apiServer'
import { LevelLogger, getToken } from '../../../../utils'
import { ContainerList } from './ContainerList'

export const UserList2Container = () => {
  const [tasksResult, tasksResultRef, setTasksResult] =
    useRefState<ServiceTaskTasksApiResult | null>(null)
  const serviceTasksSubId = useRef<number | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [mockGrootStatus, mockGrootStatusRef, setMockGrootStatus] = useRefState(GrootStatus.pending)

  const updateFromRemote = () => {
    return GlobalApiServerClient.request(ApiServerApiName.SERVICE_TASK_TASKS)
      .then((res) => {
        setTasksResult(res)
        setMockGrootStatus(GrootStatus.success)
      })
      .catch(() => {
        setMockGrootStatus(GrootStatus.error)
      })
  }

  const serviceTasksCallback = (payload: SubPayload<SubscribeCommands.ServiceTasks>) => {
    if (tasksResultRef.current && payload.content?.tasks) {
      // 实际上并没有用这个 tasks，而是所有的都更新一下
      // 这样有些冗余，但是能保证数据的来源一致性
      updateFromRemote()
    }
  }

  /**
   * 这里是一个比较简单的长链接的使用
   * 这里的长链接主要是更新 tasks 这个字段，其他的大多数字段依赖 refresh 来更新
   * 这样的目的是避免 refresh 轮询，减少 api 请求
   */
  useEffectOnce(() => {
    updateFromRemote()

    IOFrontier.lazyInit(getToken())
    IOFrontier.getInstance().setLogger(LevelLogger)

    serviceTasksSubId.current = IOFrontier.getInstance().sub(
      SubscribeCommands.ServiceTasks,
      {
        query: {
          token: getToken(),
        },
      },
      serviceTasksCallback,
    )

    return () => {
      if (serviceTasksSubId.current) {
        IOFrontier.getInstance().unsub(serviceTasksSubId.current)
      }
    }
  })

  usePageFocus(() => {
    updateFromRemote()
  })

  return <ContainerList data={tasksResult} status={mockGrootStatus} refresh={updateFromRemote} />
}
