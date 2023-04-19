import type { Chain } from '../../../model/Chain'
import type { EventParams, EventsKeys } from './event'

/**
 * 在 manage 范畴下，定义一下自身内部引用的能力避免造成循环引用
 */
export abstract class ManageAppInPages {
  abstract on<T extends EventsKeys>(type: T, fn: (params: EventParams[T]) => any): void

  abstract off<T extends EventsKeys>(type: T, fn: (params: EventParams[T]) => any): void

  abstract emit<T extends EventsKeys>(type: T, args: EventParams[T]): void

  abstract setCurrentChain(chain: Chain | null): void
}
