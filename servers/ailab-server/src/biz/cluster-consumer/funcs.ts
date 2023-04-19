import type { UserTopTaskListMap } from '@hai-platform/shared'
import type { UserTaskMap } from '.'
import { UserTasksCounterConsumer, UserTopTaskListConsumer } from '.'

export interface CurrentTasksInfo {
  overview: UserTaskMap | undefined
  topTasks: UserTopTaskListMap | undefined
}

export async function getCurrentTasksInfo(user_name: string, force = false) {
  const [overview, topTasks] = await Promise.all([
    UserTasksCounterConsumer.getInstance().getUserData(user_name, force),
    UserTopTaskListConsumer.getInstance().getUserData(user_name, force),
  ])

  return {
    overview,
    topTasks,
  }
}
