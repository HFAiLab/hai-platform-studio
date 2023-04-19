import type { Socket } from 'socket.io'
import type { DefaultEventsMap } from 'socket.io/dist/typed-events'
import { FRONTIER_CONSTANTS } from '../schema'
import { FRONTIER_VERSION } from '../version'

export * from './frontier'

export function preInit(socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) {
  socket.emit(FRONTIER_CONSTANTS.FrontierVersion, FRONTIER_VERSION)
}
