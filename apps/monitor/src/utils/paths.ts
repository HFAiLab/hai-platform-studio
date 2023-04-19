/**
 * 确保末尾的斜杠
 */
export const ensureEndingSlash = (str: string): string => (str.endsWith('/') ? str : `${str}/`)

/**
 * 移除末尾的斜杠
 */
export const removeEndingSlash = (str: string): string => str.replace(/\/$/, '')

/**
 * 移除开头的斜杠
 */
export const removeLeadingSlash = (str: string): string => str.replace(/^\//, '')

/**
 * 移除开头和末尾的斜杠
 */
export const removeLeadingAndEndingSlash = (str: string): string => str.replace(/(^\/)|(\/$)/g, '')

/**
 * 判断路径 B 是不是路径 A 的子路径
 */
export const isSubPath = (pathA: string, pathB: string): boolean => {
  const pathASlash = ensureEndingSlash(pathA)
  return pathASlash !== pathB && pathB.startsWith(pathASlash)
}

/**
 * 判断路径 B 是不是路径 A 的直接子路径
 */
export const isDirectSubPath = (pathA: string, pathB: string): boolean => {
  if (!isSubPath(pathA, pathB)) return false
  return !removeLeadingAndEndingSlash(pathB.slice(pathA.length)).includes('/')
}

/**
 * 判断路径 B 是不是路径 A 的非直接子路径
 */
export const isNonDirectSubPath = (pathA: string, pathB: string): boolean => {
  if (!isSubPath(pathA, pathB)) return false
  return removeLeadingAndEndingSlash(pathB.slice(pathA.length)).includes('/')
}

/**
 * 如果路径 B 是路径 A 的非直接子路径，获取路径 A 到路径 B 之间的所有层级的子路径
 */
export const getMissingSubPaths = (pathA: string, pathB: string): string[] => {
  if (!isNonDirectSubPath(pathA, pathB)) return []
  const missingSegments = removeLeadingAndEndingSlash(pathB.slice(pathA.length))
    .split('/')
    .slice(0, -1)
  const result: string[] = []
  let last = pathA
  for (const item of missingSegments) {
    const subPath = `${ensureEndingSlash(last)}${item}`
    result.push(subPath)
    last = subPath
  }
  return result
}
