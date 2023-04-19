export const sleep = (ms: number) => {
  return new Promise((rs) => {
    setTimeout(() => {
      rs(undefined)
    }, ms)
  })
}
