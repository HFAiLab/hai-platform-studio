import type { AggFetionRequest, ParsedInfo } from '../schema'

/**
 * 内存队列，存储上报内容
 */
class AggFetionQueue {
  // 粗处理好的，放到这里，供去重：
  parsedQueue: ParsedInfo[] = []

  // 去重之后，放到这里，供处理
  handlerQueue: AggFetionRequest[] = []
}

export const GlobalAggFetionQueue = new AggFetionQueue()
