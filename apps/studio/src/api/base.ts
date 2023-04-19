/* eslint-disable class-methods-use-this */
import type { AilabServerClient } from '@hai-platform/client-ailab-server'
import type { ApiServerClient } from '@hai-platform/client-api-server'
import { i18n } from '@hai-platform/i18n'
import type { Languages } from '@hai-platform/i18n'
import type { BaseContainerAPI } from '@hai-platform/studio-pages/lib/entries/base/container'
import { ErrorHandler } from '@hai-platform/studio-pages/lib/utils/errorHandler'
import type { CountlyEvent } from '@hai-platform/studio-toolkit/lib/esm/countly'
import type { IToastProps, IToaster } from '@hai-ui/core'
import { LevelLogger, getCurrentAgencyToken, getToken } from '../utils'
import type { CountlyEventKey } from '../utils/countly'
import { AilabCountly } from '../utils/countly'
import { AppToaster, toastWithCancel } from '../utils/toast'
import { GlobalAilabServerClient } from './ailabServer'
import { GlobalApiServerClient } from './apiServer'

const GlobalErrorHandler = new ErrorHandler()

export class JupyterBaseContainerAPI implements BaseContainerAPI {
  getToken(): string {
    return getCurrentAgencyToken() || getToken()
  }

  getLan(): Languages {
    return i18n.currentLanguage
  }

  getVersion(): string {
    return 'studio-no-version'
  }

  getSettingStorage(): void {
    throw new Error('Method not implemented.')
  }

  getLogger() {
    return LevelLogger
  }

  getErrorHandler(): ErrorHandler {
    return GlobalErrorHandler
  }

  getApiServerClient(): ApiServerClient {
    return GlobalApiServerClient
  }

  getAilabServerClient(): AilabServerClient {
    return GlobalAilabServerClient
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  i18n(): string {
    return 'no-i18n'
  }

  getHFUIToaster(): IToaster {
    return AppToaster
  }

  toastWithCancel(props: IToastProps, key?: string | undefined): Promise<boolean> {
    return toastWithCancel(props, key)
  }

  hasAbility() {
    return false
  }

  countlyReportEvent(key: string, event?: CountlyEvent): void {
    // 实际上是个字符串就行
    AilabCountly.safeReport(key as CountlyEventKey, event)
  }
}

export const baseContainerAPI = new JupyterBaseContainerAPI()
