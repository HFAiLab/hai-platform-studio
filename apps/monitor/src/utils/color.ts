/* eslint-disable no-param-reassign */

export const RGBToHSL = (r: number, g: number, b: number): [number, number, number] => {
  r /= 255
  g /= 255
  b /= 255
  const l = Math.max(r, g, b)
  const s = l - Math.min(r, g, b)
  // eslint-disable-next-line no-nested-ternary
  const h = s ? (l === r ? (g - b) / s : l === g ? 2 + (b - r) / s : 4 + (r - g) / s) : 0
  return [
    60 * h < 0 ? 60 * h + 360 : 60 * h,
    // eslint-disable-next-line no-nested-ternary
    100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0),
    (100 * (2 * l - s)) / 2,
  ]
}

export const HSLToRGB = (h: number, s: number, l: number): [number, number, number] => {
  s /= 100
  l /= 100
  const k = (n: number): number => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n: number): number => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return [255 * f(0), 255 * f(8), 255 * f(4)]
}

/**
 * 输入一个 hsl 范畴内 0 - 100 的值，将颜色明度调整到这个值
 */
export const lightenTo = (color: string, l: number): string => {
  const expRes = /rgba\((\d+),(\d+),(\d+),(\d+)\)/.exec(color)
  if (!expRes) return color
  const [r, g, b, a] = expRes.slice(1)
  const [h, s] = RGBToHSL(Number(r), Number(g), Number(b))
  const [r2, g2, b2] = HSLToRGB(h, s, l)
  return `rgba(${r2},${g2},${b2},${a})`
}
