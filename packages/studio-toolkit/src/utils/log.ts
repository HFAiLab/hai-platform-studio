import HFLogger, { HF_LOGGER_LEVEL } from '@hai-platform/logger'

export default HFLogger
export { HF_LOGGER_LEVEL } from '@hai-platform/logger'

export const LevelLogger = {
  trace: (...args: any[]) => {
    const str = args.map((item) => item.toString()).join(',')
    HFLogger.log(str, HF_LOGGER_LEVEL.TRACE)
  },
  debug: (...args: any[]) => {
    const str = args.map((item) => item.toString()).join(',')
    HFLogger.log(str, HF_LOGGER_LEVEL.DEBUG)
  },
  info: (...args: any[]) => {
    const str = args.map((item) => item.toString()).join(',')
    HFLogger.log(str, HF_LOGGER_LEVEL.INFO)
  },
  warn: (...args: any[]) => {
    const str = args.map((item) => item.toString()).join(',')
    HFLogger.log(str, HF_LOGGER_LEVEL.WARN)
  },
  error: (...args: any[]) => {
    const str = args.map((item) => item.toString()).join(',')
    HFLogger.log(str, HF_LOGGER_LEVEL.ERROR)
  },
}
