import type { ExtractProps } from '../../schemas/basic'
import type { ManageServiceAbilityNames } from './schema'
import type {
  AsyncExpsManageServiceNames,
  AsyncExpsManageServiceParams,
  AsyncExpsManageServiceResult,
  ExpsManageServiceNames,
  ExpsManageServiceParams,
  ExpsManageServiceResult,
} from './schema/services'

export abstract class ManagerContainerAPI {
  // 同步服务调用
  abstract invokeService<T extends ExpsManageServiceNames>(
    key: T,
    params: ExtractProps<T, ExpsManageServiceParams>,
  ): ExpsManageServiceResult[T]

  // 异步服务调用
  abstract invokeAsyncService<T extends AsyncExpsManageServiceNames>(
    key: T,
    params: ExtractProps<T, AsyncExpsManageServiceParams>,
  ): Promise<AsyncExpsManageServiceResult[T]>

  // 渲染容器：
  abstract getContainer(): HTMLDivElement

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  hasAbility(name: ManageServiceAbilityNames) {
    return false
  }
}

export abstract class StateMachine {}
