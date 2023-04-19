import {
  PromiseSerialExecuter,
  PromiseSingletonExecuter,
} from '@hai-platform/studio-toolkit/lib/cjs/utils/'

export const sleep = (ms: number) => {
  return new Promise((rs) => {
    setTimeout(() => {
      rs(undefined)
    }, ms)
  })
}

export const GlobalPromiseSerialExecuter = new PromiseSerialExecuter()

export const GlobalPromiseSingletonExecuter = new PromiseSingletonExecuter()
