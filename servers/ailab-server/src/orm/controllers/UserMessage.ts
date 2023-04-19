import { ONEMINUTE } from '@hai-platform/studio-toolkit/lib/cjs/date/utils'
import type { Sequelize } from 'sequelize'
import { Op } from 'sequelize'
import { ClusterUserMessage, ClusterUserMessageInit } from '../models/UserMessage'

const MESSAGE_CACHE_TIME = 1 * ONEMINUTE

export class ClusterUserMessageController {
  messageCache: ClusterUserMessage[] | null = null

  allMessageRequestTime: number | null = null

  constructor(sequelize: Sequelize) {
    ClusterUserMessageInit(sequelize)
  }

  async getAllMessage() {
    if (
      !this.allMessageRequestTime ||
      !this.messageCache ||
      Date.now() - this.allMessageRequestTime > MESSAGE_CACHE_TIME
    ) {
      this.messageCache = await ClusterUserMessage.findAll({
        where: {
          expiry: {
            [Op.gte]: new Date(),
          },
        },
      })
      this.allMessageRequestTime = Date.now()
    }
    return this.messageCache
  }

  // groupList 包括用户分组和自己的名字
  async getValidMessageByGroupList(groupList: string[]) {
    // 所有未过期的消息：
    const allMessages = await this.getAllMessage()
    return allMessages.filter((message) => {
      return groupList.includes(message.assigned_to)
    })
  }
}
