/**
 * 对于同一个 key，串行执行 promise，
 * 如果先前有 promise 在执行了，先等待先前的执行完成
 */
export class PromiseSingletonExecuter {
  // eslint-disable-next-line @typescript-eslint/ban-types
  promiseExecutingMap: Map<string | Function, Promise<unknown>> = new Map()

  execute<REQ extends unknown[], RES>(
    PromiseGenerator: (...params: REQ) => Promise<RES>,
    params?: [...REQ],
    key?: string,
  ): Promise<RES> {
    const promiseKey = key || PromiseGenerator

    const currentRunningThisTypePromise = this.promiseExecutingMap.get(promiseKey)
    if (currentRunningThisTypePromise) {
      return currentRunningThisTypePromise as Promise<RES>
    }

    const newPromise = PromiseGenerator(...(params || ([] as unknown[] as REQ)))
    this.promiseExecutingMap.set(promiseKey, newPromise)

    newPromise.finally(() => {
      this.promiseExecutingMap.delete(promiseKey)
    })

    return newPromise
  }
}
