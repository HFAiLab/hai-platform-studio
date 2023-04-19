/**
 * 获取一个简单的随机 id
 */
export const getTraceID = () => {
  return `${Date.now()}_${Math.random().toString(36).slice(-8)}`
}
