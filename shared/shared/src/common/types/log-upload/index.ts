export enum LogUploadStatus {
  'pending' = 'pending',
  'retrieving' = 'retrieving',
  'finished' = 'finished',
  'canceled' = 'canceled',
}

export enum LogUploadSource {
  'user' = 'user',
  'invoke' = 'invoke',
}

export interface LogUploadRequestAttributes {
  channel: string // channel 表示平台，比如 ailab-web 是一个
  rid: string
  uid: string
  status: string
  source: string // 来源，主动上报或者被动的
  createdAt?: Date
  updatedAt?: Date
}

export interface LogUploadDetailAttributes {
  rid: string // 对应 LogUploadRequestAttributes
  fingerprint: string
  distpath: string
  createdAt?: Date
  updatedAt?: Date
}

export type LogUploadListItem = LogUploadRequestAttributes & {
  details: LogUploadDetailAttributes[]
}

export interface InsertDetailParams {
  rid: string // 对应 LogUploadRequestAttributes
  fingerprint: string
  data: string // 需要存储到文件里面
}

// 用户自己主动上传一条日志的请求参数（body）
export interface UserInsertDetailParams {
  channel: string
  uid: string
  fingerprint: string
  data: string // 需要存储到文件里面
}

// 更新日志上传状态，目前其实没有用到这个接口
export interface UpdateRequestStatusParams {
  rid: string
  status: LogUploadStatus
}

// 请求是否需要上传日志的参数
export interface QueryShouldUploadParams {
  uid: string
  channel: string
  fingerprint: string
}

// 被动上传日志的参数
export interface InsertRequestParams {
  channel: string
  uid: string
}

// 管理员获取列表的参数
export interface QueryListParams {
  pageSize: number
  offset: number
  channel?: string
}
