import type { XTopicLikeAddBody } from '@hai-platform/client-ailab-server'
import { AilabServerApiName } from '@hai-platform/client-ailab-server'
import { ONEMINUTE } from '@hai-platform/studio-toolkit/lib/esm/date/utils'
import { GlobalAilabServerClient } from '../../api/ailabServer'
import { AppToaster, LevelLogger } from '../../utils'
import { sleep } from '../../utils/promise'

interface LikeQueueItem {
  content: XTopicLikeAddBody
  timestamp: number
}

export type TriggerCallback = () => Promise<void>

interface TriggerCallbackInfo {
  callback: TriggerCallback
  timestamp: number
}

class LikeTrigger {
  queue: LikeQueueItem[] = []

  consuming = false

  // 开始消费的时间
  beginConsumeTime: number | null = null

  disableLike = false

  callbackMap: Map<string, TriggerCallbackInfo> = new Map()

  constructor() {
    console.info('LikeTrigger init')
  }

  private safetyCheck(): boolean {
    if (this.disableLike) {
      return false
    }

    // 短时间内存在大量的点赞，是不能过的
    if (this.queue.length > 2) {
      const duration =
        Math.floor(this.queue[this.queue.length - 1]!.timestamp - this.queue[0]!.timestamp) / 1000
      if (this.queue.length > 50 && this.queue.length / duration > 4) {
        return false
      }
    }

    if (this.beginConsumeTime && Date.now() - this.beginConsumeTime > 30 * ONEMINUTE) {
      // 连续 30 分钟不间断点赞，不是正常人能干出来的
      return false
    }
    return true
  }

  private async consume() {
    if (this.consuming) return
    this.consuming = true
    if (!this.beginConsumeTime) this.beginConsumeTime = Date.now()

    while (this.queue.length) {
      if (!this.safetyCheck()) {
        AppToaster.show({
          message: '检测到点赞行为存在异常，请重新刷新页面继续点赞',
        })
        this.disableLike = true
        this.beginConsumeTime = null
        this.consuming = false
        return
      }

      const item = this.queue.shift()!

      try {
        await GlobalAilabServerClient.request(AilabServerApiName.XTOPIC_LIKE_ADD, undefined, {
          data: item.content,
        })
        // 如果队列里面没有的话，就先暂时不执行了
        // if (this.queue.length) await sleep(500)
        // 直接停止，用户体验似乎会好一点
        await sleep(100)
      } catch (e) {
        console.error('xtopic add error:', e)
        LevelLogger.error('xtopic add error:', e)
      }

      const callbackId = this.genCallbackIndexId(item.content)
      if (this.callbackMap.get(callbackId)?.timestamp === item.timestamp) {
        // 如果时间戳相等，说明这个是最后一个想同类型的请求了
        await this.callbackMap.get(callbackId)!.callback()
      }
    }

    // 全都消费完了，就停了，恢复状态
    this.beginConsumeTime = null
    this.consuming = false
  }

  private genCallbackIndexId(
    content: Pick<XTopicLikeAddBody, 'contentType' | 'itemIndex' | 'itemUUID' | 'username'>,
  ) {
    return window.btoa(
      `${content.contentType}_${content.itemIndex}_${content.itemUUID}_${content.username}`,
    )
  }

  trigger(content: XTopicLikeAddBody, callback: TriggerCallback) {
    const currentTimeStamp = Date.now()
    this.queue.push({
      content,
      timestamp: currentTimeStamp,
    })
    this.callbackMap.set(this.genCallbackIndexId(content), {
      timestamp: currentTimeStamp,
      callback,
    })
    this.consume()
  }

  removeCallback(
    content: Pick<XTopicLikeAddBody, 'contentType' | 'itemIndex' | 'itemUUID' | 'username'>,
  ) {
    this.callbackMap.delete(this.genCallbackIndexId(content))
  }
}

export const GlobalTopicLikeTrigger = new LikeTrigger()
