import { describe, expect, it } from 'vitest'
import { stringToColor, stringTruncateEnd, stringTruncateMiddle } from '@/utils'

describe('utils > strings.ts', () => {
  describe('stringTruncateEnd', () => {
    const cases: { input: [string, number, string?]; expected: string }[] = [
      {
        input: ['12345', 10],
        expected: '12345',
      },
      {
        input: ['1234567890', 10],
        expected: '1234567890',
      },
      {
        input: ['12345678901234567890', 10],
        expected: '1234567890 ...',
      },
      {
        input: ['12345678901234567890', 10, '---'],
        expected: '1234567890 ---',
      },
    ]

    cases.forEach(({ input, expected }) =>
      it(`input: ${input}`, () => {
        expect(stringTruncateEnd(...input)).toEqual(expected)
      }),
    )
  })

  describe('stringTruncateMiddle', () => {
    const cases: { input: [string, number, string?]; expected: string }[] = [
      {
        input: ['12345', 10],
        expected: '12345',
      },
      {
        input: ['1234567890', 10],
        expected: '1234567890',
      },
      {
        input: ['12345678901234567890', 10],
        expected: '12345 ... 67890',
      },
      {
        input: ['123456789012345678901', 10],
        expected: '12345 ... 78901',
      },
      {
        input: ['123456789012345678901', 11],
        expected: '12345 ... 678901',
      },
      {
        input: ['12345678901234567890', 10, '---'],
        expected: '12345 --- 67890',
      },
    ]

    cases.forEach(({ input, expected }) =>
      it(`input: ${input}`, () => {
        expect(stringTruncateMiddle(...input)).toEqual(expected)
      }),
    )
  })

  describe('stringToColor', () => {
    it(`should generate HEX color code`, () => {
      expect(stringToColor('foo')).toMatch(/^#[0-9a-f]{6}$/)
    })

    it(`should get same output with same input`, () => {
      expect(stringToColor('foo')).toEqual(stringToColor('foo'))
      expect(stringToColor('foo', 0.5)).toEqual(stringToColor('foo', 0.5))
    })

    it(`should get different output with different input`, () => {
      expect(stringToColor('foo')).not.toEqual(stringToColor('bar'))
      expect(stringToColor('foo', 0.3)).not.toEqual(stringToColor('foo', 0.4))
    })
  })
})
