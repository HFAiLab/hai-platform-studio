export function convertParamsToList(params: Record<string, string | boolean | string[]>) {
  let result: string[] = []

  for (const key in params) {
    if (key === '_') {
      result = [...result, ...(params[key] as string[])]
      continue
    }
    const value = params[key]
    const ifSingleKey = key.length === 1
    const prefix = ifSingleKey ? '-' : '--'

    if (value instanceof Array) {
      for (const v of value) {
        result.push(`${prefix}${key} ${v}`)
      }
    } else if (value === true) {
      result.push(`${prefix}${key}`)
    } else if (typeof value === 'string' || typeof value === 'number') {
      result.push(`${prefix}${key} ${value}`)
    }
  }

  return result
}
