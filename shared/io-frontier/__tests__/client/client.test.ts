/// <reference types="jest" />
/// <reference types="../../src/@types/javascript-state-machine/index" />
import type * as SocketIO from 'socket.io-client'
import { IOFrontierClient } from '../../src/client/index'
import type { StateOptions } from '../../src/client/stm'
import { FatalError, IOStatus } from '../../src/client/stm'
import { FRONTIER_CONSTANTS } from '../../src/schema/index'
import { Logger } from '../../src/schema/logger'

type EventListener = (...args: any[]) => void
type EmitterMethod = (type: string, listener: EventListener) => void

interface EventEmitterMaps {
  [key: string]: Set<EventListener>
}

class EventEmitter {
  maps: EventEmitterMaps = {}

  emit = (type: string, ...args: any[]) => {
    if (!this.maps[type]) return
    for (const func of this.maps[type].values()) {
      func(...args)
    }
  }

  off = (type: string, listener: EventListener) => {
    if (!this.maps[type]) return
    this.maps[type].delete(listener)
  }

  on = (type: string, listener: EventListener) => {
    if (!this.maps[type]) this.maps[type] = new Set()
    this.maps[type].add(listener)
  }

  once = (type: string, listener: EventListener) => {
    throw new Error('Not implemented once')
  }
}

class MockSocketIO {
  protected ee: EventEmitter

  public connected = false

  public refreshNums = 0

  constructor() {
    this.ee = new EventEmitter()
  }

  get disconnected() {
    return !this.connected
  }

  reset() {
    this.connected = false
    this.ee = new EventEmitter()
  }

  public emitConnection() {
    this.connected = true
    this.emitFromServer('connection')
  }

  public emitDisconnect() {
    this.connected = false
    this.emitFromServer('disconnect')
  }

  public emitFromServer(type: string, ...args: any[]) {
    this.ee.emit(type, ...args)
  }

  public hasListeners(command: string) {
    return this.ee.maps[command] && this.ee.maps[command].size != 0
  }

  public removeAllListeners() {
    this.ee = new EventEmitter()
  }

  // hint: 这里的 emit 是 emit to server，叫 emit 是为了和 socketio 命名保持一致
  public emit(type: string, ...args: any[]) {
    if (type == FRONTIER_CONSTANTS.FrontierForceRefresh) {
      this.refreshNums += 1
    }
  }

  public on(type: string, fn: EmitterMethod) {
    this.ee.on(type, fn)
  }

  public off(type: string, fn: EmitterMethod) {
    this.ee.off(type, fn)
  }

  public once(type: string, fn: EmitterMethod) {
    this.ee.once(type, fn)
  }
}

export class MockLogger extends Logger {
  trace(message: any, ...args: any[]): void {}

  debug(message: any, ...args: any[]): void {}

  info(message: any, ...args: any[]): void {}

  warn(message: any, ...args: any[]): void {}

  error(message: any, ...args: any[]): void {}
}

class MockIOFrontierClient extends IOFrontierClient {
  public getStm(): StateMachine & StateOptions {
    return this.stm
  }

  public getFatalErrorEmit() {
    return this.fatalErrorEmit.bind(this)
  }
}

const sleep = (ms: number) => {
  return new Promise((rs, rj) => {
    setTimeout(() => {
      rs(undefined)
    }, ms)
  })
}

export const SubCommand1 = 'SubCommand1'
export interface SubQueryParams1 {
  id: number
}

export interface SubPayload1 {
  query: SubQueryParams1
  changedKeys: string[]
  content: {
    name: string
  }
}

async function testBasicLifeStyle(props: {
  ioInstance: MockIOFrontierClient
  mockSocketIO: MockSocketIO
  skipFirstConnectionEmit?: boolean
}) {
  const { ioInstance, mockSocketIO } = props
  const StateVariables = {
    subId1CallbackTimes: 0,
    subId2CallbackTimes: 0,
    subId3CallbackTimes: 0,
    subId4CallbackTimes: 0,
    subId5CallbackTimes: 0,
  }

  await sleep(500)

  // --> io 等待建联或已经提前建联
  if (!props.skipFirstConnectionEmit) {
    expect(ioInstance.getStm().state).toBe(IOStatus.waitConnection)
    mockSocketIO.emitConnection()
  } else {
    expect(ioInstance.getStm().state).toBe(IOStatus.connected)
  }

  expect(ioInstance.getStm().state).toBe(IOStatus.connected)

  const subId1 = ioInstance.sub<SubQueryParams1>(
    SubCommand1,
    {
      query: {
        id: 1,
      },
    },
    (payload: SubPayload1, command: any, meta: any) => {},
  )

  expect(ioInstance.getStm().stmData.ioCallbackMap.size).toBe(1)
  expect(ioInstance.getStm().stmData.callbackIdKeyMap.size).toBe(1)

  const subId2 = ioInstance.sub<SubQueryParams1>(
    SubCommand1,
    {
      query: {
        id: 1,
      },
    },
    (payload: SubPayload1, command: any, meta: any) => {},
  )

  expect(ioInstance.getStm().stmData.ioCallbackMap.size).toBe(1)
  expect(ioInstance.getStm().stmData.callbackIdKeyMap.size).toBe(2)

  const subId3 = ioInstance.sub<SubQueryParams1>(
    SubCommand1,
    {
      query: {
        id: 2,
      },
    },
    (payload: SubPayload1, command: any, meta: any) => {},
  )

  expect(ioInstance.getStm().stmData.ioCallbackMap.size).toBe(2)
  expect(ioInstance.getStm().stmData.callbackIdKeyMap.size).toBe(3)

  ioInstance.unsub(subId1)
  expect(ioInstance.getStm().stmData.ioCallbackMap.size).toBe(2)
  expect(ioInstance.getStm().stmData.callbackIdKeyMap.size).toBe(2)
  ioInstance.unsub(subId2)
  expect(ioInstance.getStm().stmData.ioCallbackMap.size).toBe(1)
  expect(ioInstance.getStm().stmData.callbackIdKeyMap.size).toBe(1)
  ioInstance.unsub(subId3)
  expect(ioInstance.getStm().stmData.ioCallbackMap.size).toBe(0)
  expect(ioInstance.getStm().stmData.callbackIdKeyMap.size).toBe(0)

  const unsubRes = ioInstance.unsub(10000000)
  expect(unsubRes).toBe(-1)

  const subId4 = ioInstance.sub<SubQueryParams1>(
    SubCommand1,
    {
      query: {
        id: 1,
      },
    },
    (payload: SubPayload1, command: any, meta: any) => {
      StateVariables.subId4CallbackTimes += 1
    },
  )

  expect(ioInstance.getStm().stmData.ioCallbackMap.size).toBe(1)
  expect(ioInstance.getStm().stmData.callbackIdKeyMap.size).toBe(1)

  // --> io 断开
  mockSocketIO.emitDisconnect()
  expect(ioInstance.getStm().state).toBe(IOStatus.disconnect)

  const subId5 = ioInstance.sub<SubQueryParams1>(
    SubCommand1,
    {
      query: {
        id: 5,
      },
    },
    (payload: SubPayload1, command: any, meta: any) => {
      StateVariables.subId5CallbackTimes += 1
    },
  )

  expect(ioInstance.getStm().stmData.ioCallbackMap.size).toBe(2)
  expect(ioInstance.getStm().stmData.callbackIdKeyMap.size).toBe(2)

  await sleep(500)

  mockSocketIO.emitConnection()
  expect(ioInstance.getStm().state).toBe(IOStatus.connected)

  mockSocketIO.emitFromServer(SubCommand1, {
    payload: {
      query: {
        id: 1,
      },
      changedKeys: ['demo'],
      content: {
        name: 'mock',
      },
    },
  })

  mockSocketIO.emitFromServer(SubCommand1, {
    payload: {
      query: {
        id: 5,
      },
      changedKeys: ['demo'],
      content: {
        name: 'mock',
      },
    },
  })
  expect(StateVariables.subId1CallbackTimes).toBe(0)
  expect(StateVariables.subId2CallbackTimes).toBe(0)
  expect(StateVariables.subId3CallbackTimes).toBe(0)
  expect(StateVariables.subId4CallbackTimes).toBe(1)
  expect(StateVariables.subId5CallbackTimes).toBe(1)

  const expireRes1 = ioInstance.expire(SubCommand1, {
    id: 1,
  })
  expect(mockSocketIO.refreshNums).toBe(1)
  expect(expireRes1).toBe(true)
  mockSocketIO.emitFromServer(SubCommand1, {
    payload: {
      query: {
        id: 1,
      },
      changedKeys: ['demo'],
      content: {
        name: 'mock',
      },
    },
  })
  expect(StateVariables.subId4CallbackTimes).toBe(2)
  expect(StateVariables.subId1CallbackTimes).toBe(0)
  expect(StateVariables.subId2CallbackTimes).toBe(0)
  expect(StateVariables.subId3CallbackTimes).toBe(0)

  const expireRes2 = ioInstance.expire(`${SubCommand1}NotExist`, {
    id: 1,
  })
  expect(mockSocketIO.refreshNums).toBe(1)
  expect(expireRes2).toBe(false)

  const expireRes3 = ioInstance.expireById(100000)
  expect(mockSocketIO.refreshNums).toBe(1)
  expect(expireRes3).toBe(false)

  const expireRes4 = ioInstance.expireById(subId4)
  expect(mockSocketIO.refreshNums).toBe(2)
  expect(expireRes4).toBe(true)
  mockSocketIO.emitFromServer(SubCommand1, {
    payload: {
      query: {
        id: 1,
      },
      changedKeys: ['demo'],
      content: {
        name: 'mock',
      },
    },
  })
  expect(StateVariables.subId4CallbackTimes).toBe(3)
  expect(StateVariables.subId1CallbackTimes).toBe(0)
  expect(StateVariables.subId2CallbackTimes).toBe(0)
  expect(StateVariables.subId3CallbackTimes).toBe(0)

  // @ts-ignore
  global.visibilityState = 'hidden'
  // global.jsdom.reconfigure({ documentHidden: true }) // visible state
  document.dispatchEvent(new Event('visibilitychange'))
  await sleep(500)
  // @ts-ignore
  global.visibilityState = 'visible'
  // global.jsdom.reconfigure({ documentHidden: false }) // visible state
  document.dispatchEvent(new Event('visibilitychange'))

  // @ts-ignore
  global.visibilityState = 'hidden'
  // global.jsdom.reconfigure({ documentHidden: true }) // visible state
  document.dispatchEvent(new Event('visibilitychange'))
  // @ts-ignore
  global.visibilityState = 'visible'
  // global.jsdom.reconfigure({ documentHidden: false }) // visible state
  document.dispatchEvent(new Event('visibilitychange'))

  mockSocketIO.emitFromServer(SubCommand1, {
    payload: {
      query: {
        id: 1,
      },
      changedKeys: ['demo'],
      content: {
        name: 'mock',
      },
    },
  })
  expect(StateVariables.subId4CallbackTimes).toBe(4)
  expect(StateVariables.subId1CallbackTimes).toBe(0)
  expect(StateVariables.subId2CallbackTimes).toBe(0)
  expect(StateVariables.subId3CallbackTimes).toBe(0)

  // --> stop:

  mockSocketIO.emitDisconnect()
  ioInstance.clearAndStop()
  expect(ioInstance.getStm().state).toBe(IOStatus.stopped)

  const sub5ResCode = ioInstance.sub<SubQueryParams1>(
    SubCommand1,
    {
      query: {
        id: 5,
      },
    },
    (payload: SubPayload1, command: any, meta: any) => {},
  )
  // @change: hint: 现在 stop 状态下也是可以订阅的，所以这里并不是 -1
  expect(sub5ResCode).not.toBe(-1)
}

/**
 * @file Tests for hflogger-opensource
 */
describe('client-basic', () => {
  let ioInstance: MockIOFrontierClient
  let notMatchErrorNums = 0

  const mockSocketIO = new MockSocketIO() as unknown as SocketIO.Socket & MockSocketIO

  beforeEach(async () => {
    notMatchErrorNums = 0
    mockSocketIO.reset()

    // --> prepare begin
    function fatalErrorCallback(errorType: FatalError) {
      if (errorType == FatalError.versionNotMatch) {
        notMatchErrorNums += 1
      }
    }
    function connectedCallback() {}
    function disConnectCallback() {}
    ioInstance = new MockIOFrontierClient({
      // 本地 9700, 测试集群 39700
      io: mockSocketIO,
      fatalErrorCallback,
      connectedCallback,
      disConnectCallback,
      logger: new MockLogger(),
    })
    ioInstance.setLogger(new MockLogger())

    ioInstance.setToken('mocktoken')
    // --> prepare end
  })
  test('basic-lifestyle-n', async () => {
    expect(ioInstance.isConnected()).toBe(false)
    await testBasicLifeStyle({
      ioInstance,
      mockSocketIO,
    })
  })
})

describe('client-connected-before', () => {
  let ioInstance: MockIOFrontierClient
  let notMatchErrorNums = 0
  let invalidAuthNums = 0
  const mockSocketIO = new MockSocketIO() as unknown as SocketIO.Socket & MockSocketIO
  beforeEach(async () => {
    notMatchErrorNums = 0
    invalidAuthNums = 0

    mockSocketIO.reset()
    mockSocketIO.emitConnection()

    // --> prepare begin
    function fatalErrorCallback(errorType: FatalError) {
      if (errorType == FatalError.versionNotMatch) {
        notMatchErrorNums += 1
      }
      if (errorType == FatalError.invalidAuth) {
        invalidAuthNums += 1
      }
    }
    function connectedCallback() {}
    function disConnectCallback() {}
    ioInstance = new MockIOFrontierClient({
      // 本地 9700, 测试集群 39700
      io: mockSocketIO,
      fatalErrorCallback,
      connectedCallback,
      disConnectCallback,
      logger: new MockLogger(),
    })
    ioInstance.setToken('mocktoken')
    // --> prepare end
  })
  test('basic-lifestyle-cbf', async () => {
    expect(ioInstance.isConnected()).toBe(true)
    await testBasicLifeStyle({
      ioInstance,
      mockSocketIO,
      skipFirstConnectionEmit: true,
    })
  })
  test('version-not-match-cbf', async () => {
    expect(ioInstance.isConnected()).toBe(true)
    mockSocketIO.emitFromServer(FRONTIER_CONSTANTS.FrontierVersion, 'v2')
    expect(notMatchErrorNums).toBe(1)

    mockSocketIO.emitDisconnect()
    // hint: 由于 io-frontier 本身没有什么全局变量，所以 disconnect 之后应该就没有了
  })
  test('connect-auth-error', async () => {
    mockSocketIO.emitFromServer('connect_error', {
      message: 'Invalid Auth',
    })
    expect(invalidAuthNums).toBe(1)
  })
  test('stop-error', async () => {
    const stopRes = ioInstance.clearAndStop()
    expect(stopRes).toBe(-1)
  })
})

describe('client-connected-before', () => {
  let ioInstance: MockIOFrontierClient
  const mockSocketIO = new MockSocketIO() as unknown as SocketIO.Socket & MockSocketIO
  beforeEach(async () => {
    mockSocketIO.reset()
    mockSocketIO.emitConnection()

    // --> prepare begin
    ioInstance = new MockIOFrontierClient({
      // 本地 9700, 测试集群 39700
      io: mockSocketIO,
      preserveTimeout: 3000,
    })
    ioInstance.setToken('mocktoken')
    // --> prepare end
  })
  test('basic-lifestyle-cbf', async () => {
    expect(ioInstance.isConnected()).toBe(true)
    await testBasicLifeStyle({
      ioInstance,
      mockSocketIO,
      skipFirstConnectionEmit: true,
    })
  })
})
