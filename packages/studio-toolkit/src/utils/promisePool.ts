/**
 * 批量执行 Promise
 * 可以设置最大并发数目
 */
export class PromisePool {
  size: number

  constructor(size: number) {
    this.size = size
  }

  batchRequest<REQ, RES>(
    PromiseGenerator: (params: REQ) => Promise<RES>,
    paramsList: REQ[],
  ): Promise<RES[]> {
    const firstBatchParams = paramsList.slice(0, this.size)
    let cursor = this.size

    const result: RES[] = []
    let errorFlag = false // 错误了就别继续了

    const PromiseChain = (params: REQ, index: number): Promise<undefined | Promise<RES>> => {
      return PromiseGenerator(params)
        .then((res) => {
          result[index] = res
          if (cursor >= paramsList.length || errorFlag) {
            // do noting now
            return
          }

          const nextParams = paramsList[cursor]
          cursor += 1
          // eslint-disable-next-line consistent-return
          return PromiseChain(nextParams!, cursor - 1)
        })
        .catch((e) => {
          errorFlag = true
          throw e
        })
    }

    return Promise.all(firstBatchParams.map((params, index) => PromiseChain(params, index))).then(
      () => {
        return result
      },
    )
  }
}
