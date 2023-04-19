import StateMachine from 'javascript-state-machine'
import type { Logger } from '../schema/logger'
import type { IOFrontierClient, STMData } from './frontier'

export type IOCallbackRecord = Function[]

export enum IOStatus {
  waitConnection = 'waitConnection',
  connected = 'connected',
  disconnect = 'disconnect',
  stopped = 'stopped',
}

export enum FatalError {
  disConnectedTooLong = 'disConnectedTooLong',
  wrongStateMachine = 'wrongStateMachine',
  invalidAuth = 'invalidAuth',
  versionNotMatch = 'versionNotMatch',
}

export interface StateOptions {
  agency: IOFrontierClient
  stmData: STMData
  logger: Logger
}

const stmTransitions = [
  {
    name: 'allToConnected',
    from: [IOStatus.waitConnection, IOStatus.disconnect, IOStatus.stopped],
    to: IOStatus.connected,
  },
  { name: 'connected2Disconnect', from: IOStatus.connected, to: IOStatus.disconnect },
  { name: 'allToStopped', from: '*', to: IOStatus.stopped },
  // { name: 'disconnect2Wait', from: IOStatus.disconnect, to: IOStatus.waitConnection },
]

const STMTools = {
  getAgency(stm: any) {
    return stm.agency as unknown as IOFrontierClient
  },
  getStmData(stm: any) {
    return stm.stmData as unknown as STMData
  },
  getLogger(stm: any) {
    return stm.logger as unknown as Logger
  },
}

export const STMGenerator = StateMachine.factory<StateOptions>({
  init: IOStatus.waitConnection,
  transitions: stmTransitions,
  data(options: StateOptions) {
    //  <-- use a method that can be called for each instance
    return {
      agency: options.agency,
      stmData: options.stmData,
      logger: options.logger,
    }
  },
  methods: {
    // 自动跳转状态机的辅助函数
    autoGoto(status: IOStatus) {
      STMTools.getLogger(this).info(`[autoGoto] goto ${status} and current status: ${this.state}`)
      const transitions = stmTransitions.filter((item) => {
        return (
          (item.from instanceof Array
            ? item.from.includes(this.state as unknown as IOStatus)
            : item.from === (this.state as unknown as IOStatus) || item.from === '*') &&
          item.to === status
        )
      })
      if (transitions.length !== 1) {
        STMTools.getLogger(this).info(
          `fatal error when goto ${status} and current status: ${this.state}`,
        )
        STMTools.getAgency(this).fatalErrorEmit(FatalError.disConnectedTooLong)
      }
      if (transitions.length === 0) {
        STMTools.getLogger(this).error(
          `[no transitions]fatal error when goto ${status} and current status: ${this.state}`,
        )
        return
      }
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this[transitions[0]!.name]!()
    },
    // just for log
    onTransition(lifecycle) {
      STMTools.getLogger(this).info(
        `[stm][onTransition] ${lifecycle.transition} from ${lifecycle.from} to ${lifecycle.to}`,
      )
      // stmData 有点大，这里不打了
      return true
    },
    onWaitConnection() {
      STMTools.getLogger(this).info('[stm] onWaitConnection')
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.checkFatalEmit!()
    },
    onAllToConnected() {
      STMTools.getLogger(this).info('[stm] onconnected')
      const stmData = STMTools.getStmData(this)
      const agency = STMTools.getAgency(this)
      if (stmData.notConnectedTimerId != null) {
        clearTimeout(stmData.notConnectedTimerId)
        stmData.notConnectedTimerId = null
      }
      if (!stmData.preserved) {
        agency.resumeAllSub()
      }
      if (agency.connectedCallback) {
        agency.connectedCallback()
      }
    },
    onConnected2Disconnect() {
      STMTools.getAgency(this).preserveAllSub()
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.checkFatalEmit!()
      const agency = STMTools.getAgency(this)
      const stmData = STMTools.getStmData(this)

      if (agency.disConnectCallback) {
        agency.disConnectCallback()
      }
      if (stmData.notConnectedTimerId === null) {
        stmData.notConnectedTimerId = window.setTimeout(() => {
          agency.fatalErrorEmit(FatalError.disConnectedTooLong)
        }, stmData.notConnectedTimeout)
      }
    },
    onStopped() {
      STMTools.getLogger(this).info('[stm] onStopped')
      const stmData = STMTools.getStmData(this)
      const agency = STMTools.getAgency(this)

      agency.preserveAllSub()
      stmData.callbackIdKeyMap = new Map()
      stmData.ioCallbackMap = new Map()
      stmData.preserved = false
    },
    checkFatalEmit() {
      const agency = STMTools.getAgency(this)
      const stmData = STMTools.getStmData(this)

      if (!agency.getIO()) return
      if (!agency.getIO()!.connected && stmData.notConnectedTimerId === null) {
        stmData.notConnectedTimerId = window.setTimeout(() => {
          agency.fatalErrorEmit(FatalError.disConnectedTooLong)
        }, stmData.notConnectedTimeout)
      }
    },
  },
})
