export type TPodStatus =
  | 'created'
  | 'building'
  | 'unschedulable'
  | 'scheduled'
  | 'running'
  | 'succeeded'
  | 'failed'
  | 'stopped'
  | 'unknown'
  | 'queued'

export enum ChainStatus {
  waiting_init = 'waiting_init',
  running = 'running',
  suspended = 'suspended',
  finished = 'finished',
}

export enum WorkerStatus {
  terminating = 'terminating',
  failed = 'failed',
  stopped = 'stopped',
  succeeded = 'succeeded',
  unfinished = 'unfinished',
  canceled = 'canceled',
}

export enum QueueStatus {
  queued = 'queued',
  scheduled = 'scheduled',
  finished = 'finished',
}

export interface PodObj {
  job_uid: string
  node?: string | null | undefined
  pod_id: string
  role?: 'master' | 'worker'
  started_at: string // UTC
  status: TPodStatus
  exit_code?: string | undefined
}

export interface ChainExtraConfig {
  /**
   * Priority when task create.
   */
  priority?: number | null
  /**
   * Whole life state value at chain init.
   */
  whole_life_state?: number | null

  // 指定的机房
  schedule_zone?: string

  // 更完整的客户端提交的分组，带后缀
  client_group?: string

  cpu?: number

  memory?: number
}

export abstract class IChainObj {
  /**
   * Node assigned.
   */
  readonly assigned_nodes?: Array<string>

  /**
   * Backend server type.
   */
  readonly backend!: string

  /**
   * type: "YY-MM-DD HH:mm:ss" / "YY-MM-DDTHH:mm:ss"
   * Latest task begin running/ begin waiting
   */
  readonly begin_at!: string

  /**
   * type: "YY-MM-DD HH:mm:ss" / "YY-MM-DDTHH:mm:ss"
   * List of every task begin
   */
  readonly begin_at_list!: Array<string>

  /**
   * Id for this chain
   */
  readonly chain_id!: string

  /**
   * Life cycle for a Chain
   */
  readonly chain_status!: ChainStatus

  /**
   * Which cluster to run
   */
  readonly cluster!: string

  /**
   * Task file
   */
  readonly code_file!: string

  /**
   * Time when this task inserted into database
   * "YY-MM-DDTHH:mm:ss"
   */
  readonly created_at!: string

  /**
   * When task finished / canceled
   * "YY-MM-DDTHH:mm:ss"
   */
  readonly end_at!: string

  readonly end_at_list!: string[]

  /**
   * Outdated, if this task created with env RESTART=1.
   */
  readonly force_restart1?: number

  /**
   * Which cluster group to run.
   */
  group!: string

  /**
   * Latest task id for this chain.
   */
  id!: number

  /**
   * unknown
   */
  job_info?: string

  /**
   * Chain's name (Notebook name)
   */
  nb_name!: string

  /**
   * Number, required nodes for each group, like "3;3". Normally just one group.
   */
  nodes!: number

  /**
   * Number, required nodes for each group, like ["3", "3"]. Normally just one group.
   */
  nodes_list!: Array<number>

  /**
   * Workers info for latest task.
   */
  pods!: Array<PodObj>

  /**
   * Priority for the chain.
   */
  priority!: number

  /**
   * Since v6.1, Always 1.
   */
  queue_job!: boolean

  /**
   * Schedule status for latest task.
   */
  queue_status!: 'queued' | 'scheduled' | 'finished'

  /**
   * Outdated
   */
  restart_count!: number

  /**
   * If this task got a stop command
   */
  received_stop?: boolean

  star!: boolean

  /**
   * "YY-MM-DDTHH:mm:ss"
   * Date when this task begin.
   */
  // started_at: string

  /**
   * The count of suspend for the chain
   */
  /**
   * "YY-MM-DDTHH:mm:ss"
   * Date when this task begin.
   */
  // started_at: string
  suspend_count!: number

  /**
   * "YY-MM-DDTHH:mm:ss"
   * Date when this task last suspended.
   */
  suspend_updated_at!: string

  /**
   * Username.
   */
  user_name!: string

  /**
   * An int value set by training, this is the latest value of the chain.
   */
  whole_life_state!: number

  /**
   * The path for target script to run at. It's "pwd"
   */
  workspace!: string

  /**
   * Update time for current instance.
   */
  instance_updated_at?: string

  /**
   * Chain Stop Code
   */
  stop_code!: number

  /**
   * Worker Stop Code List
   */
  stop_code_list!: number[]

  /**
   * Extra mount. need convert
   */
  mount_code!: number

  /**
   * contains init info
   */
  config_json!: ChainExtraConfig

  worker_status!: WorkerStatus

  worker_status_list!: WorkerStatus[]
}
