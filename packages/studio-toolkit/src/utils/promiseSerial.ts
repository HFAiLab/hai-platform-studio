/**
 * Promise 串行执行器
 * 对于同一个 key 的 promise，能够保证串行执行
 * 如果先前有 promise 在执行了，先等待先前的执行完成
 */
import { v4 as uuidv4 } from 'uuid'

const DEFAULT_PROMISE_KEY = 'PromiseSerialDefaultKey'

export class PromiseSerialExecuter {
  promiseRunningMap: Map<string, Promise<unknown>> = new Map()

  promiseCurrentUUIDMap: Map<string, string> = new Map()

  execute<REQ extends unknown[], RES>(
    PromiseGenerator: (...params: REQ) => Promise<RES>,
    params: [...REQ],
    key?: string,
  ): Promise<RES> {
    const promiseKey = key || DEFAULT_PROMISE_KEY
    const currentUUID = uuidv4()

    this.promiseCurrentUUIDMap.set(promiseKey, currentUUID)

    const currentPromiseList = this.promiseRunningMap.get(promiseKey)

    const checkClear = () => {
      if (this.promiseCurrentUUIDMap.get(promiseKey) === currentUUID) {
        this.promiseCurrentUUIDMap.delete(promiseKey)
        this.promiseRunningMap.delete(promiseKey)
      }
    }

    let nextPromiseList: Promise<RES>

    if (currentPromiseList) {
      nextPromiseList = currentPromiseList
        .then(() => {
          return PromiseGenerator(...params)
        })
        .catch(() => {
          return PromiseGenerator(...params)
        })
    } else {
      nextPromiseList = PromiseGenerator(...params)
    }

    this.promiseRunningMap.set(promiseKey, nextPromiseList)
    return nextPromiseList
      .then((res) => {
        checkClear()
        return res
      })
      .catch((e) => {
        checkClear()
        throw e
      })
  }
}
