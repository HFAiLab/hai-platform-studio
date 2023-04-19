import type { AilabServerClient } from '@hai-platform/client-ailab-server'
import type { ApiServerClient } from '@hai-platform/client-api-server'
import type { Languages } from '@hai-platform/i18n'
import type { ErrorHandler } from '@hai-platform/studio-schemas/lib/esm/error'
import type { CountlyEvent } from '@hai-platform/studio-toolkit/lib/esm/countly'
import type { IToastProps, IToaster } from '@hai-ui/core'
import type { HFAppLogger } from './schema/logger'

// eslint-disable-next-line @typescript-eslint/naming-convention
export type ExtractProps<T, K> = T extends keyof K ? K[T] : never

export abstract class BaseContainerAPI {
  // 多语言
  abstract getLan(): Languages

  // 获取错误处理对象
  abstract getErrorHandler(): ErrorHandler

  abstract getSettingStorage(): void

  abstract getLogger(): HFAppLogger

  abstract getApiServerClient(): ApiServerClient

  abstract getAilabServerClient(): AilabServerClient

  abstract getVersion(): string

  abstract countlyReportEvent(key: string, event?: CountlyEvent): void

  abstract getToken(): string

  // 获取 HFUI 提供的 toaster，因为一个应用最好只有一个 toaster，所以建议从外部传入
  // eslint-disable-next-line class-methods-use-this
  abstract getHFUIToaster(): IToaster

  // hint: 后面我们可能会去改 ui 组件库，这个 toast 暂时直接加到这里，有一定的优化空间
  abstract toastWithCancel(props: IToastProps, key?: string | undefined): Promise<boolean>
}
