import type { ExtractProps } from './schema/basic'
import type {
  AsyncPerfServiceNames,
  AsyncPerfServiceParams,
  AsyncPerfServiceResult,
  PerfServiceAbilityNames,
  PerfServiceNames,
  PerfServiceParams,
  PerfServiceResult,
} from './schema/services'

export abstract class PerfContainerAPI {
  // 同步服务调用
  abstract invokeService<T extends PerfServiceNames>(
    key: T,
    params: ExtractProps<T, PerfServiceParams>,
  ): PerfServiceResult[T]

  // 异步服务调用
  abstract invokeAsyncService<T extends AsyncPerfServiceNames>(
    key: T,
    params: ExtractProps<T, AsyncPerfServiceParams>,
  ): Promise<AsyncPerfServiceResult[T]>

  // 渲染容器：
  abstract getContainer(): HTMLDivElement

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  hasAbility(name: PerfServiceAbilityNames) {
    return false
  }
}

export abstract class StateMachine {}
