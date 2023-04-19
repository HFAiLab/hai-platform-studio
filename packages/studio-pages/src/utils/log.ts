import HFLogger, { HF_LOGGER_LEVEL } from '@hai-platform/logger'

export default HFLogger

export const LevelLogger = {
  trace: (str: string) => {
    HFLogger.log(str, HF_LOGGER_LEVEL.TRACE)
  },
  debug: (str: string) => {
    HFLogger.log(str, HF_LOGGER_LEVEL.DEBUG)
  },
  info: (str: string) => {
    HFLogger.log(str, HF_LOGGER_LEVEL.INFO)
  },
  warn: (str: string) => {
    HFLogger.log(str, HF_LOGGER_LEVEL.WARN)
  },
  error: (str: string) => {
    HFLogger.log(str, HF_LOGGER_LEVEL.ERROR)
  },
}
