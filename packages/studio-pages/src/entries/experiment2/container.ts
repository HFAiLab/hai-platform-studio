import type { ExtractProps } from '../../schemas/basic'
import type {
  AsyncServiceNames,
  AsyncServiceParams,
  AsyncServiceResult,
  ExpServiceAbilityNames,
  ExpServiceResult,
  ServiceNames,
  ServiceParams,
} from './schema/services'

export abstract class Experiment2ContainerAPI {
  // 同步服务调用
  abstract invokeService<T extends ServiceNames>(
    key: T,
    params: ExtractProps<T, ServiceParams>,
  ): ExpServiceResult[T]

  // 异步服务调用
  abstract invokeAsyncService<T extends AsyncServiceNames>(
    key: T,
    params: ExtractProps<T, AsyncServiceParams>,
  ): Promise<AsyncServiceResult[T]>

  // 渲染容器：
  abstract getContainer(): HTMLDivElement

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  hasAbility(name: ExpServiceAbilityNames) {
    return false
  }
}
