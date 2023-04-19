import { ApiServerApiName } from '@hai-platform/client-api-server'
import { i18n, i18nKeys } from '@hai-platform/i18n'
import type { ContainerTask } from '@hai-platform/shared'
import { dangerousDialog, primaryDialog } from '@hai-platform/studio-pages/lib/ui-components/dialog'
import { LevelLogger } from '@hai-platform/studio-toolkit'
import { cloneDeep } from 'lodash-es'
import { GlobalApiServerClient } from '../../../api/apiServer'
import { AppToaster } from '../../../utils'
import { isBuiltin } from '../biz-comps/utils'

export type TaskOperationSuccessCallback = () => void

export class TaskOperation {
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  static opTask = async (
    task: ContainerTask,
    op: 'stop' | 'start' | 'delete' | 'restart',
    req: (task: ContainerTask) => Promise<unknown>,
    successCallback?: TaskOperationSuccessCallback,
  ) => {
    LevelLogger.info(`opTask, op: ${op}`)
    const confirm = await (op === 'start' ? primaryDialog : dangerousDialog)(
      i18n.t(i18nKeys.biz_jupyter_exec_op, {
        name: task.nb_name,
        op,
      }),
    )
    if (!confirm) return
    let res
    try {
      res = await req(task)
      AppToaster.show({
        message: i18n.t(i18nKeys.biz_jupyter_exec_succ, {
          name: task.nb_name,
          op,
        }),
        intent: 'success',
        icon: 'tick',
      })
      if (successCallback) successCallback()
      // props.refresh()
      return
    } catch (e) {
      res = { msg: e }
    }
    AppToaster.show({
      message: i18n.t(i18nKeys.biz_jupyter_exec_fail, {
        name: task.nb_name,
        op,
        msg: `${res.msg}`,
      }),
      intent: 'danger',
    })
  }

  static stop = async (
    currentTask: ContainerTask,
    successCallback?: TaskOperationSuccessCallback,
  ) => {
    await TaskOperation.opTask(
      currentTask,
      'stop',
      (task) => {
        return GlobalApiServerClient.request(ApiServerApiName.SERVICE_TASK_STOP, {
          id: task.id,
        })
      },
      successCallback,
    )
  }

  static start = async (
    currentTask: ContainerTask,
    token: string,
    user_name: string,
    successCallback?: TaskOperationSuccessCallback,
  ) => {
    await TaskOperation.opTask(
      currentTask,
      'start',
      (task) => {
        const body = cloneDeep(task.config_json.schema)
        // 兼容老的 schema，删掉这几个字段
        for (const service of body.services) {
          if (isBuiltin(service.name)) {
            delete service.type
            delete service.port
            delete service.startup_script
          }
        }
        return GlobalApiServerClient.request(
          ApiServerApiName.SERVICE_TASK_CREATE_V2,
          {
            user_name,
          },
          {
            data: body,
          },
        )
      },
      successCallback,
    )
  }

  static restartTask = async (
    currentTask: ContainerTask,
    successCallback?: TaskOperationSuccessCallback,
  ) => {
    await TaskOperation.opTask(
      currentTask,
      'restart',
      (task) => {
        return GlobalApiServerClient.request(ApiServerApiName.SERVICE_TASK_RESTART, {
          id: task.id,
        })
      },
      successCallback,
    )
  }

  static deleteTask = async (
    currentTask: ContainerTask,
    successCallback?: TaskOperationSuccessCallback,
  ) => {
    await TaskOperation.opTask(
      currentTask,
      'delete',
      (task) => {
        return GlobalApiServerClient.request(ApiServerApiName.SERVICE_TASK_DELETE, {
          id: task.id,
        })
      },
      successCallback,
    )
  }
}
