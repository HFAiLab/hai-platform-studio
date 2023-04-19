export interface AggFetionStrategyGroup {
  name: string | string[]
  options?: unknown
}

export interface AggFetionMeta {
  /**
   * 这个报错的来源，建议这个可以宽泛一点，比如，bff、scheduler
   */
  source: string

  /**
   * 这个报错的 uuid，uuid 可以用于定位一个错误的处理流程生命周期
   */
  // uuid?: string
}

export interface AggFetionTargetConfig {
  /**
   * qq 群的群名称
   */
  groupName: string

  /**
   * 这条信息需要 @ 到的人
   */
  assign?: string | string[]
}

export interface AggFetionPayload {
  /**
   * 标志一类
   */
  agg_keyword?: string

  /**
   * 展示在 qq 里面的消息
   */
  message: string
}

export interface AggFetionRequest {
  /**
   * 一些元信息
   */
  meta: AggFetionMeta

  // /**
  //  * 报错策略信息
  //  */
  strategyGroup: AggFetionStrategyGroup

  /**
   * 目标信息
   */
  target: AggFetionTargetConfig

  /**
   * 详情
   */
  payload: AggFetionPayload
}

// ----------------------------- strategy handler result --------------------------------

export interface StrategyHandlerResult {
  end: boolean
}

// ----------------------------- 待定 --------------------------------

export interface FetionReportClusterPayload {
  /**
   * http method: GET\POST 或者小写的 get\post
   */
  method: string

  /**
   * 这里应该是有一个相对的 url
   */
  url: string

  /**
   * 状态码，我们目前只处理 50X
   */
  status_code?: number

  /**
   * 请求时间：
   *    一般来说，认为 5 秒 warn，10 秒 error
   */
  response_time?: number

  /**
   * 有的时候，没有状态码也不超时，比如 socket hang up，可以填 error_message
   */
  error_message?: string

  /**
   * 参数，目前的设计上来说应该是基本不用传这个字段的，预留
   */
  params?: Record<string, number | string>
}

export type FetionReportAxiosPayload = FetionReportClusterPayload

/**
 * 普通通知，应该是单条发送
 */
export interface FetionReportBFFNoticePayload {
  content: string

  assign?: string
}

/**
 * bff 的普通报错，按照 content 聚合一下
 */
export interface FetionReportBFFErrorPayload {
  assign?: string

  keyword?: string

  content: string
}

/**
 * 具体的策略
 */
export enum AggStrategyName {
  bff_get_task_log = 'bff_get_task_log',
  one_and_batch = 'one_and_batch',
  batch = 'batch',
  one_and_one = 'one_and_one',
  not_classify = 'not_classify',
}

/**
 * 给 http 的来源
 */
export enum AggFetionSource {
  axios = 'axios',
  cluster = 'cluster',
  bff_notice = 'bff_notice',
  bff_error = 'bff_error',
}

export type FetionReport =
  | {
      source: AggFetionSource.axios
      payload: FetionReportAxiosPayload
    }
  | {
      source: AggFetionSource.cluster
      payload: FetionReportClusterPayload
    }
  | {
      source: AggFetionSource.bff_notice
      payload: FetionReportBFFNoticePayload
    }
  | {
      source: AggFetionSource.bff_error
      payload: FetionReportBFFErrorPayload
    }

// 粗处理成这样的格式，方便分类和去重：
export interface ParsedInfo {
  source: AggFetionSource
  key: string
  request: AggFetionRequest
}
