/**
 * 字符串达到长度限制后截断，并用 replacer 代替末尾的字符
 */
export const stringTruncateEnd = (str: string, limit: number, replacer = '...'): string =>
  str.length > limit ? `${str.slice(0, limit)} ${replacer}` : str

/**
 * 字符串达到长度限制后截断，并用 replacer 代替中间的字符
 */
export const stringTruncateMiddle = (str: string, limit: number, replacer = '...'): string => {
  if (str.length <= limit) return str
  const truncateHalfLength = (limit / 2) | 0
  return `${str.slice(0, truncateHalfLength)} ${replacer} ${str.slice(
    str.length - (limit - truncateHalfLength),
  )}`
}

/**
 * 根据字符串生成随机 RGB HEX 颜色字符串
 *
 * @see https://github.com/HugoJBello/string-to-hex-code-color
 */
export const stringToColor = (str: string, darker = 0.2): string => {
  // 根据原字符串生成 24 bits 的 hash
  let hash = 0xffffff
  for (let i = 0; i < str.length; i += 1) {
    // charCodeAt 返回的是 16 bits 整数，这里随便左移个 5 位来计算 hash
    hash = ((hash << 5) + str.charCodeAt(i)) & 0xffffff
  }
  let result = '#'
  for (let i = 0; i < 3; i += 1) {
    // 每 8 位生成对应的 HEX 值
    // 使用正数 darker 可以让颜色尽量偏深色，负数则偏浅色
    // 最后的 | 0 相当于取整数
    const colorCode = (((hash >> (i * 8)) & 0xff) * (1 - darker)) | 0
    const colorHex = `0${colorCode.toString(16)}`.slice(-2)
    result += colorHex
  }
  return result
}
