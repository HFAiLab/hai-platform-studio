import { expect, test } from 'vitest'
import { PromiseSerialExecuter } from '../src/utils/promiseSerial'

test('promise-serial-test', async () => {
  console.log('promise-serial')

  const GlobalPromiseSerialExecuter = new PromiseSerialExecuter()

  const promise1 = () => {
    return new Promise((rs, rj) => {
      setTimeout(() => {
        rs('promise1:result')
      }, 1000)
    })
  }

  const promise2 = () => {
    return new Promise((rs, rj) => {
      throw new Error('promise2:error')
    })
  }

  const promise3 = () => {
    return new Promise((rs, rj) => {
      throw new Error('promise3:error')
    })
  }

  const promise4 = () => {
    return new Promise((rs, rj) => {
      setTimeout(() => {
        rs('promise4:result')
      }, 1000)
    })
  }

  const p1Result = await GlobalPromiseSerialExecuter.execute(promise1, [], 'k1')
  // console.info('p1Result', p1Result)
  expect(p1Result).toEqual('promise1:result')

  const p1Result2 = await GlobalPromiseSerialExecuter.execute(promise1, [], 'k2')
  // console.info('p1Result2', p1Result2)
  expect(p1Result2).toEqual('promise1:result')

  try {
    await GlobalPromiseSerialExecuter.execute(promise2, [], 'k1')
  } catch (e) {
    // console.info('p2Error', e)
  }

  try {
    await GlobalPromiseSerialExecuter.execute(promise3, [], 'k1')
  } catch (e) {
    // console.info('p3Error', e)
  }

  const p4Result = await GlobalPromiseSerialExecuter.execute(promise4, [], 'k1')
  // console.info('p4Result', p4Result)
  expect(p4Result).toEqual('promise4:result')

  expect(GlobalPromiseSerialExecuter.promiseCurrentUUIDMap.size).toBe(0)
  expect(GlobalPromiseSerialExecuter.promiseRunningMap.size).toBe(0)
})
