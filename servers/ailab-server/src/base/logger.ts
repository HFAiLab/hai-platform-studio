import path from 'path'
import log4js from 'log4js'
import { hideBin } from 'yargs/helpers'
import yargs from 'yargs/yargs'
import { isOnline } from '../config'

const argv = yargs(hideBin(process.argv)).argv as any // hint: 可以考虑补充一个 interface

console.log('argv.logDir:', argv.logDir)

export function getLogDir() {
  return argv.logDir
}

const env = isOnline() ? 'online' : 'pre'

// --log-dir
const { logDir } = argv
const appenders = ['out']
const bizTerminalAppenders = ['out']

let fileName = process.env.HOSTNAME
  ? `${env}_${process.env.HOSTNAME}.log`
  : `${env}_ailab-server.log`

let bizTerminalLogFileName = process.env.HOSTNAME
  ? `${env}_biz_terminal_${process.env.HOSTNAME}.log`
  : `${env}_biz_terminal_ailab-server.log`

if (logDir) {
  appenders.push('file')
  fileName = path.join(logDir, fileName)

  bizTerminalAppenders.push('bizTerminal')
  bizTerminalLogFileName = path.join(logDir, bizTerminalLogFileName)
}

log4js.configure({
  appenders: {
    file: {
      type: 'dateFile',
      filename: fileName,
      daysToKeep: 7,
      pattern: '.yyyy-MM-dd',
      // 回滚旧的日志文件时，保证以 .log 结尾（只有在 alwaysIncludePattern 为 false 生效）
      keepFileExt: true,
      // 输出的日志文件名是都始终包含 pattern 日期结尾
      alwaysIncludePattern: true,
    },
    bizTerminal: {
      type: 'dateFile',
      filename: bizTerminalLogFileName,
      daysToKeep: 7,
      pattern: '.yyyy-MM-dd',
      // 回滚旧的日志文件时，保证以 .log 结尾（只有在 alwaysIncludePattern 为 false 生效）
      keepFileExt: true,
      // 输出的日志文件名是都始终包含 pattern 日期结尾
      alwaysIncludePattern: true,
    },
    out: {
      type: 'stdout',
      layout: {
        type: 'colored',
      },
    },
  },
  categories: {
    default: { appenders, level: 'trace' },
    terminal: { appenders: bizTerminalAppenders, level: 'trace' },
  },
})

// hint: 之前我们有考虑在这里增加敏感字段的能力，出于以下原因暂时先不做了：
// 1. 性能问题
// 2. logger 本身没有提供很方便的能力，我们可以采用诸如 Proxy 等方式去做，但是不是很优雅
// 3. 全局的处理，导致所有地方都拿不到 token 了，包括文件日志，容易埋坑

export const logger = log4js.getLogger('default')

// hint: 这里的作用是因为用户的命令行可能会输出一些奇怪的东西，我们需要有一个地方单独记录
export const bizTerminalLogger = log4js.getLogger('terminal')
