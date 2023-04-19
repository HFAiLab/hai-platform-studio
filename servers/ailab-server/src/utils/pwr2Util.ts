export const pwr2Util = (pwr: number | null | undefined) => {
  if (!pwr) {
    return pwr
  }
  if (pwr < 60) {
    return 0
  }
  let u = (pwr - 60) / 1.9
  // 保留两位小数
  u = Math.round(u * 100) / 100
  return Math.min(u, 100)
}
