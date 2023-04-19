export abstract class ErrorHandler {
  abstract log(msg: string, type: 'INFO' | 'SUCCESS' | 'ERROR'): void
  abstract info(msg: string): void
  abstract info(msg: string): void
  abstract success(msg: string): void
  abstract error(msg: string): void
  abstract handleFetchError(e: any, fetch_type: string, showDialog: boolean): void

  abstract handleError(e: any, showDialog: boolean): void
}
