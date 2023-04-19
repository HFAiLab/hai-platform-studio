import type { ServiceTaskTasksApiResult } from '@hai-platform/client-api-server'
import type { ContainerTask } from '@hai-platform/shared'
import { ContainerTaskStatus, getDefaultJupyterGroupPrefix } from '@hai-platform/shared'
import { getToken } from './hfaiToken'
import { getHubURL } from '.'

export function tryGetGPUjupyter(hubData: ServiceTaskTasksApiResult | null) {
  if (!hubData) return null
  let someReadyTask: ContainerTask | null = null
  for (const task of hubData.tasks) {
    if (task.status === ContainerTaskStatus.RUNNING) {
      if (task.group === `${getDefaultJupyterGroupPrefix()}_gpu`) {
        return task
      }
      someReadyTask = task
    }
  }

  return someReadyTask
}

export function openFileInJupyter(paramsData: ContainerTask, path?: string | null) {
  window.open(
    `${getHubURL()}/${paramsData.user_name}/${
      paramsData.nb_name
    }?token=${getToken()}&default_open_file=${encodeURIComponent(path || '')}`,
  )
}
