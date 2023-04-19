// 从 object 中删除 value 为 undefined 的 key
export const noUndefinedKey = (obj: Record<string, any>) => {
  const keys = Object.keys(obj)
  const ret = {} as Record<string, any>
  keys.forEach((key) => {
    if (obj[key] !== undefined) {
      ret[key] = obj[key]
    }
  })
  return ret
}
