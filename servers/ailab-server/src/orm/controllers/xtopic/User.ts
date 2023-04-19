import type { XTopicUserUpdateBody } from '@hai-platform/client-ailab-server'
import type { Sequelize } from 'sequelize'
import { XTopicUser, XTopicUserInit } from '../../models/xtopic/User'

export class XTopicUserController {
  constructor(sequelize: Sequelize) {
    XTopicUserInit(sequelize)
  }

  async list() {
    const itemList = await XTopicUser.findAll({})
    return itemList
  }

  async get(platformName: string) {
    const item = (await XTopicUser.findOne({
      where: {
        platformName,
      },
      raw: true,
    })) as unknown as XTopicUser

    if (!item) return null

    return item
  }

  // eslint-disable-next-line class-methods-use-this
  async update(platformName: string, option: XTopicUserUpdateBody) {
    let user = await XTopicUser.findOne({
      where: {
        platformName,
      },
    })
    if (!user) {
      user = XTopicUser.build({ platformName } as XTopicUser)
    }
    if (option.nickname) user.nickname = option.nickname
    if (option.avatar) user.avatar = option.avatar
    if (option.bio) user.bio = option.bio
    if (option.bio === '') user.bio = '' // 支持清空
    if (!user.nickname) throw new Error('请先设置昵称')
    return user.save()
  }
}
