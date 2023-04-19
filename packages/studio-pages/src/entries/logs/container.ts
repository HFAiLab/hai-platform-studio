import type {
  AsyncLogServiceNames,
  AsyncLogServiceParams,
  AsyncLogServiceResult,
  LogServiceAbilityNames,
  LogServiceNames,
  LogServiceParams,
  LogServiceResult,
} from './schema'
import type { ExtractProps } from './schema/basic'

export abstract class LogContainerAPI {
  // 同步服务调用
  abstract invokeService<T extends LogServiceNames>(
    key: T,
    params: ExtractProps<T, LogServiceParams>,
  ): LogServiceResult[T]

  // 异步服务调用
  abstract invokeAsyncService<T extends AsyncLogServiceNames>(
    key: T,
    params: ExtractProps<T, AsyncLogServiceParams>,
  ): Promise<AsyncLogServiceResult[T]>

  // 渲染容器：
  abstract getContainer(): HTMLDivElement

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  hasAbility(name: LogServiceAbilityNames) {
    return false
  }
}

export abstract class StateMachine {}
