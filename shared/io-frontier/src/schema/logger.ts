export abstract class Logger {
  abstract trace(message: any, ...args: any[]): void
  abstract debug(message: any, ...args: any[]): void
  abstract info(message: any, ...args: any[]): void
  abstract warn(message: any, ...args: any[]): void
  abstract error(message: any, ...args: any[]): void
}

export class DefaultLogger extends Logger {
  trace(message: any, ...args: any[]): void {
    console.trace(message, ...args)
  }

  debug(message: any, ...args: any[]): void {
    console.debug(message, ...args)
  }

  info(message: any, ...args: any[]): void {
    console.info(message, ...args)
  }

  warn(message: any, ...args: any[]): void {
    console.warn(message, ...args)
  }

  error(message: any, ...args: any[]): void {
    console.error(message, ...args)
  }
}

export class LoggerContainer {
  logger: Logger

  prefix = '[frontier]'

  constructor(logger: Logger, perfix?: string) {
    this.logger = logger
    this.prefix = perfix || this.prefix
  }

  trace(message: any, ...args: any[]): void {
    this.logger.trace(message, ...args)
  }

  debug(message: any, ...args: any[]): void {
    this.logger.debug(message, ...args)
  }

  info(message: any, ...args: any[]): void {
    this.logger.info(message, ...args)
  }

  warn(message: any, ...args: any[]): void {
    this.logger.warn(message, ...args)
  }

  error(message: any, ...args: any[]): void {
    this.logger.error(message, ...args)
  }
}
