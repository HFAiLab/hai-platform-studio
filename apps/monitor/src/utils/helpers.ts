export const isNumber = (val: unknown): val is number => typeof val === 'number'
export const isString = (val: unknown): val is string => typeof val === 'string'

export const uniq = <T>(arr: T[]): T[] => Array.from(new Set(arr))

export const versionCompare = (v1: string, v2: string): number => {
  const v1parts = v1.split('.')
  const v2parts = v2.split('.')

  const isValidPart = (x: string): boolean => /^\d+$/.test(x)

  if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
    return NaN
  }

  const v1partNums = v1parts.map(Number)
  const v2partNums = v2parts.map(Number)

  for (let i = 0; i < v1partNums.length; i += 1) {
    if (v2partNums.length === i) {
      return 1
    }

    if (v1partNums[i] === v2partNums[i]) {
      continue
    } else if (v1partNums[i]! > v2partNums[i]!) {
      return 1
    } else {
      return -1
    }
  }

  if (v1partNums.length !== v2partNums.length) {
    return -1
  }

  return 0
}
