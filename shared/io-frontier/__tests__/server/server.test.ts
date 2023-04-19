import { compareContentChangeDefaultImpl } from '../../src/server/frontier'

describe('server-functions', () => {
  test('payload-compare', async () => {
    const res1 = compareContentChangeDefaultImpl(null, null, [])
    expect(res1.length).toBe(0)

    const obj2_1 = null
    const obj2_2 = { a: 1 }
    const res2 = compareContentChangeDefaultImpl(obj2_1, obj2_2, ['a'])
    expect(res2).toStrictEqual(['a'])

    const obj3_1 = null
    const obj3_2 = [{ a: 1 }]
    const res3 = compareContentChangeDefaultImpl(obj3_1, obj3_2, ['a'])
    expect(res3).toStrictEqual(['a'])

    const obj4_1 = { a: 1 }
    const obj4_2 = { a: 2 }
    const res4 = compareContentChangeDefaultImpl(obj4_1, obj4_2, ['a'])
    expect(res4).toStrictEqual(['a'])

    const obj5_1 = { a: 1 }
    const obj5_2 = { a: 1 }
    const res5 = compareContentChangeDefaultImpl(obj5_1, obj5_2, ['a'])
    expect(res5).toStrictEqual([])

    const obj6_1 = [{ a: 1 }]
    const obj6_2 = [{ a: 1 }]
    const res6 = compareContentChangeDefaultImpl(obj6_1, obj6_2, ['a'])
    expect(res6).toStrictEqual([])

    const obj7_1 = [{ a: 1 }, { a: 2 }]
    const obj7_2 = [{ a: 1 }, { a: 3 }]
    const res7 = compareContentChangeDefaultImpl(obj7_1, obj7_2, ['a'])
    expect(res7).toStrictEqual(['a'])
  })
})
