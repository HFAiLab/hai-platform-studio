import type { TaskChainStatus, TaskWorkerStatus } from '../task'

export interface ExternalUserActivenessItem {
  active: boolean
  num_running_jupyters: number
  last_jupyter_end_time: string | null
  last_task_submit_time: string | null
  last_archive_time: string | null
  archive_worker_status: TaskWorkerStatus | null
  archive_chain_status: TaskChainStatus | null
  archive_task_id: number | null
}
