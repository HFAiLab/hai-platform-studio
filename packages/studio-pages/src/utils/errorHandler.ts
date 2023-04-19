/**
 * Collect extension's log and handle error.
 */

import { i18n, i18nKeys } from '@hai-platform/i18n'
import type { ErrorHandler as HFErrorHandler } from '@hai-platform/studio-schemas/lib/esm/error'
import { errorDialog } from '../ui-components/dialog'
import { LevelLogger } from './log'

export interface ILogMsg {
  msg: string
  type: 'INFO' | 'SUCCESS' | 'ERROR'
  time?: Date | null
}

// 此 ErrorHandler 的实现为之前 jupyter 里面遗留的实现，后续建议可以直接使用 LevelLogger
export class ErrorHandler implements HFErrorHandler {
  log(msg: string): void {
    LevelLogger.info(msg)
  }

  info(msg: string) {
    LevelLogger.info(msg)
  }

  success(msg: string) {
    LevelLogger.info(msg)
  }

  error(msg: string) {
    LevelLogger.error(msg)
  }

  /**
   * Handle a fetch error
   *
   * @param e : error
   * @param fetch_type: string, what you fetch
   * @param showDialog: boolean, default true
   */
  handleFetchError(e: any, fetch_type: string, showDialog = true) {
    let msg
    if (e.response && e.response.status === 401) {
      msg = i18n.t(i18nKeys.biz_error_401)
      this.error(msg)
      if (showDialog) {
        errorDialog(msg)
      }
    } else {
      if (e.response) {
        msg = i18n.t(i18nKeys.biz_error_fetch_with_response, {
          fetch_type,
          status_code: e.response.status,
        })
        this.error(`Error: ${String(e)}`)
      } else {
        msg = i18n.t(i18nKeys.biz_error_fetch, { fetch_type, err: String(e) })
        this.error(`Error: ${String(e)}`)
      }
      if (showDialog) {
        errorDialog(msg)
      }
    }
  }

  /**
   * Handle a error
   * @param e error
   * @param showDialog boolean, default true.
   */
  handleError(e: any, showDialog = true) {
    const msg = i18n.t(i18nKeys.biz_error_simple, { err: String(e) })
    this.error(msg)
    if (showDialog) {
      errorDialog(msg)
    }
  }
}
