import { describe, expect, it } from 'vitest'
import { formatExternalUsername } from '@/utils'

describe('utils > username.ts', () => {
  describe('formatExternalUsername', () => {
    const cases: { input: [string]; expected: string }[] = [
      {
        input: ['foo'],
        expected: 'foo*',
      },
    ]

    cases.forEach(({ input, expected }) =>
      it(`input: ${input}`, () => {
        expect(formatExternalUsername(...input)).toEqual(expected)
      }),
    )
  })
})
