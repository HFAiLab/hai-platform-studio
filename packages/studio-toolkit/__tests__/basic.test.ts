import { assert, expect, test } from 'vitest'
import { PromisePool } from '../src/utils/promisePool'

async function mockQuickPromise(params: number) {
  return new Promise((rs, rj) => {
    rs(params + 10)
  })
}

async function mockPromise(params: number) {
  return new Promise((rs, rj) => {
    setTimeout(() => {
      rs(params + 10)
    })
  })
}

async function mockPromiseSomeFailure(params: number) {
  return new Promise((rs, rj) => {
    setTimeout(() => {
      if (params == 2) rj('someError')
      else {
        rs(params + 10)
      }
    })
  })
}

test('PromisePoolBasic', async () => {
  const res = await mockPromise(1)
  assert.equal(res, 11)
})

test('PromisePoolBatch', async () => {
  const paramsLists1 = [1, 2, 3, 4, 5]
  const pool1 = new PromisePool(2)
  const result1 = await pool1.batchRequest(mockQuickPromise, paramsLists1)
  expect(result1).toEqual([11, 12, 13, 14, 15])
})

test('PromisePoolMassDataTest', async () => {
  const massSize = 60000
  const paramsLists1 = new Array(massSize).fill(0)
  const pool1 = new PromisePool(1)
  const result1 = await pool1.batchRequest(mockQuickPromise, paramsLists1)
  assert.equal(result1.length, massSize)
  assert.equal(result1[0], 10)
})

test('PromisePoolError', async () => {
  const paramsLists1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
  const pool1 = new PromisePool(5)
  await expect(pool1.batchRequest(mockPromiseSomeFailure, paramsLists1)).rejects.toThrow(
    'someError',
  )
})
