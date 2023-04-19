import { expect, test } from 'vitest'
import { PromiseSingletonExecuter } from '../src/utils/promiseSingleton'

function sleep(ms: number) {
  return new Promise((rs) => {
    setTimeout(() => {
      rs(null)
    }, ms)
  })
}

test('promise-serial-test', async () => {
  console.log('promise-serial')

  const GlobalPromiseSerialExecuter = new PromiseSingletonExecuter()

  let count1 = 0
  let count2 = 0
  let count3 = 0
  let count4 = 0

  const promise1 = () => {
    return new Promise((rs, rj) => {
      setTimeout(() => {
        count1 += 1
        rs('promise1:result')
      }, 100)
    })
  }

  const promise2 = () => {
    return new Promise((rs, rj) => {
      count2 += 1
      rs(true)
    })
  }

  const promise3 = () => {
    return new Promise((rs, rj) => {
      count3 += 1
      rs(true)
    })
  }

  const promise4 = () => {
    return new Promise((rs, rj) => {
      setTimeout(() => {
        count4 += 1
        rs('promise4:result')
      }, 100)
    })
  }

  await GlobalPromiseSerialExecuter.execute(promise1)
  await GlobalPromiseSerialExecuter.execute(promise2)
  await GlobalPromiseSerialExecuter.execute(promise3)
  await GlobalPromiseSerialExecuter.execute(promise4, [], 'promise4')

  await GlobalPromiseSerialExecuter.execute(promise1)
  await GlobalPromiseSerialExecuter.execute(promise2)
  await GlobalPromiseSerialExecuter.execute(promise1)

  expect(count1).toBe(3)
  expect(count2).toBe(2)
  expect(count3).toBe(1)
  expect(count4).toBe(1)

  await sleep(200)

  await GlobalPromiseSerialExecuter.execute(promise1)
  expect(count1).toBe(4)
})
