/* eslint-disable @typescript-eslint/ban-ts-comment */
import fs from 'node:fs'
import path from 'node:path'
import type Router from 'koa-router'
import { logger } from '../../base/logger'
import { GlobalConfig } from '../../config'
import { Base64 } from '../../utils/base64'

interface UploadFile {
  size: number
  path: string
  name: string
  type: string
  hash: string | null
  lastModifiedDate: Date
  _writeStream: any
}

const splitFileName = (originName: string) => {
  const i = originName.lastIndexOf('.')
  const name = originName.substring(0, i)
  const type = originName.substring(i, originName.length) // for example: .png
  return [name || '', type || '']
}

function register(router: Router) {
  router.post('/upload', async (ctx, next) => {
    // 获取图片源
    //  <input type="file" name="file" multiple>

    let files = ctx.request?.files?.['file[]'] as unknown as UploadFile[]

    logger.info('[XTOPIC] upload files', files)

    if (!files) {
      await next()
      return
    }

    if (!(files instanceof Array)) {
      files = [files]
    }

    const successFiles: Record<string, string> = {}
    const errFiles: string[] = []
    const supportFiles = /^\.(jpg|png|webp|gif|jpeg|bmp)$/

    if (
      !(
        GlobalConfig.STUDIO_XTOPIC_STATIC_ONLINE_PATH ||
        GlobalConfig.STUDIO_XTOPIC_STATIC_ONLINE_URI
      )
    ) {
      ctx.response.body = {
        msg: 'xtopic path or url not set',
        code: 0,
        success: false,
        data: null,
      }
      return
    }

    files.forEach((file) => {
      // 接收读出流
      const reader = fs.createReadStream(file.path)
      // 创建写入流
      // 3. 指定图片路径文件名（即上传图片存储目录）
      const [fileName, fileSuffix] = splitFileName(file.name)

      if (!fileName) {
        errFiles.push(file.name)
        return
      }

      if (!fileSuffix || !supportFiles.test(fileSuffix)) {
        errFiles.push(file.name)
        return
      }

      const newFileName = `${Date.now()}${Base64.encode(fileName)
        .replace(/=/g, '')
        .replace(/[^0-9a-zA-Z_]/g, '')}${fileSuffix}`

      const stream = fs.createWriteStream(
        path.join(GlobalConfig.STUDIO_XTOPIC_STATIC_ONLINE_PATH as string, newFileName),
      )
      reader.pipe(stream)
      successFiles[file.name] = `${GlobalConfig.STUDIO_XTOPIC_STATIC_ONLINE_URI}/${newFileName}`
    })

    ctx.response.body = {
      msg: '',
      code: 0,
      success: true,
      data: {
        errFiles,
        succMap: successFiles,
      },
    }
  })
}

export default register
