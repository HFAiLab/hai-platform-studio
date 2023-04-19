import path from 'path'
import { getUTC8TimeStamp } from '@hai-platform/io-frontier/lib/cjs/tools/time'
import fs from 'fs-extra'
import { getLogDir } from '../base/logger'

const LogUploadDir = path.join(getLogDir(), 'UploadLog')

fs.ensureDir(LogUploadDir)

export const MaxDuration = 5 * 1000 * 60 // 5 分钟内，不允许重复的 invoke

export function generateRid(uid: string) {
  return `${uid}-${Math.random().toString(36).substr(3)}-${getUTC8TimeStamp()}`
}

export async function writeLog(rid: string, data: string) {
  const distPath = path.join(LogUploadDir, `${rid}-${getUTC8TimeStamp()}.log`)
  await fs.writeFile(distPath, data)
  return distPath
}
