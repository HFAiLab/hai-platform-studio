import { LogUploadSource, LogUploadStatus } from '@hai-platform/shared'
import type { Attributes, FindOptions, Sequelize } from 'sequelize'
import sequelize from 'sequelize'
import type { LogUploadDetailAttributes, LogUploadRequestAttributes } from '../models/LogUpload'
import { LogUploadDetail, LogUploadInit, LogUploadRequest } from '../models/LogUpload'

export class LogUploadController {
  constructor(s: Sequelize) {
    LogUploadInit(s)
  }

  insertLogUploadRequest(data: LogUploadRequestAttributes) {
    const logDataRequest = LogUploadRequest.build(data)
    return logDataRequest.save()
  }

  insertLogUploadDetail(data: LogUploadDetailAttributes) {
    const logDataDetail = LogUploadDetail.build(data)
    return logDataDetail.save()
  }

  async updateLogRequest(rid: string, status: LogUploadStatus) {
    const latest = await LogUploadRequest.findOne({
      where: {
        rid,
      },
    })

    if (!latest) {
      return false
    }

    latest.status = status
    await latest.save()
    return true
  }

  // 寻找最近一次从日志平台触发的回捞，并且没有被取消的
  async getLatestLogQueryByUid(channel: string, uid: string) {
    const latest = await LogUploadRequest.findOne({
      order: [['createdAt', 'DESC']], // hint: the latest one
      where: {
        channel,
        uid,
        source: LogUploadSource.invoke,
        status: {
          [sequelize.Op.not]: LogUploadStatus.canceled,
        },
      },
    })
    return latest
  }

  async getDetailListByRid(rid: string) {
    const detailLists = await LogUploadDetail.findAll({
      where: {
        rid,
      },
    })
    return detailLists
  }

  async getLogUploadList(limit: number, offset: number, channel?: string) {
    const query: FindOptions<Attributes<LogUploadRequest>> = {
      order: [['updatedAt', 'DESC']],
      limit,
      offset,
      include: [
        {
          model: LogUploadDetail,
          as: 'details',
        },
      ],
    }

    const sumQuery: FindOptions<Attributes<LogUploadRequest>> = {}

    if (channel) {
      // eslint-disable-next-line no-multi-assign
      sumQuery.where = query.where = {
        channel,
      }
    }

    const result = await LogUploadRequest.findAll(query)
    const sum = await LogUploadRequest.count(sumQuery)
    return { list: result, sum }
  }

  // async getLogUpload(userName: string) {
  //     let user = await LogUploadRequest.findOne({
  //         where: {
  //             user_name: userName
  //         }
  //     })
  //     if (!user) {
  //         return {}
  //     };
  //     return user.config_json;
  // }
}
