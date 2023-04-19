export function isProduction() {
  return !!process.env.HOSTNAME
}

// 按照第一层属性比较是否相等
export function compareObjectLevel1(
  a: Record<string, any> | null | undefined,
  b: Record<string, any> | null | undefined,
) {
  if (!a || !b) return a === b
  if (typeof a !== 'object' || typeof b !== 'object') return a === b
  const keys = new Set([...Object.keys(a), ...Object.keys(b)])
  for (const key of keys.values()) {
    if (a[key] !== b[key]) {
      return false
    }
  }
  return true
}

export const hrtime2ms = (hrtime: number[]) => (hrtime[0]! * 1e9 + hrtime[1]!) / 1e6 // hrtime 转化成 ms
