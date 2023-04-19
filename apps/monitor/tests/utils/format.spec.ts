import { describe, expect, it } from 'vitest'
import { formatDisplayPath } from '@/utils'

describe('utils > format.ts', () => {
  describe('formatDisplayPath', () => {
    const cases: { input: [string]; expected: string }[] = [
      {
        input: ['/weka/prod/foo/bar'],
        expected: 'bar',
      },
    ]

    cases.forEach(({ input, expected }) =>
      it(`input: ${input}`, () => {
        expect(formatDisplayPath(...input)).toEqual(expected)
      }),
    )
  })
})
