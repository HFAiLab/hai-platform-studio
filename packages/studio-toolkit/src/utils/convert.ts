// 将 bytes 转成人类可读的语言
export const bytesToDisplay = (bytes = 0, fixed = 1, linuxFormat = false) => {
  // linux format 使用 B K M G T 这种缩略表示
  function getDim(raw: 'B' | 'KB' | 'MB' | 'GB' | 'TB' | 'PB') {
    if (!linuxFormat || raw === 'B') {
      return raw
    }
    return raw.replace('B', '')
  }

  const logBytes = Math.log2(bytes)
  if (logBytes === -Infinity) return '0'
  if (logBytes < 10) return `${bytes.toFixed(fixed)} ${getDim('B')}`
  if (logBytes < 20) return `${(bytes / 1024).toFixed(fixed)} ${getDim('KB')}`
  if (logBytes < 30) return `${(bytes / 1024 / 1024).toFixed(fixed)} ${getDim('MB')}`
  if (logBytes < 40) return `${(bytes / 1024 / 1024 / 1024).toFixed(fixed)} ${getDim('GB')}`
  if (logBytes < 50) return `${(bytes / 1024 / 1024 / 1024 / 1024).toFixed(fixed)} ${getDim('TB')}`
  return `${(bytes / 1024 / 1024 / 1024 / 1024 / 1024).toFixed(1)} ${getDim('PB')}`
}

// 将 seconds 转成人类可读的语言
export const secondsToDisplay = (seconds = 0, fixed = 0) => {
  // eslint-disable-next-line no-param-reassign
  seconds = Number(seconds.toFixed(fixed))

  const secondsToMins = (s: number) => {
    return `${Math.floor(s / 60)}m${s % 60}s`
  }

  const secondsToHms = (s: number) => {
    return `${Math.floor(s / (60 * 60))}h${secondsToMins(seconds % (60 * 60))}`
  }

  const secondsToDHms = (s: number) => {
    return `${Math.floor(s / (60 * 60 * 24))}d${secondsToHms(s % (60 * 60 * 24))}`
  }

  if (seconds < 60) return `${seconds}s`
  if (seconds < 60 * 60) return secondsToMins(seconds)
  if (seconds < 24 * 60 * 60) return secondsToHms(seconds)
  return secondsToDHms(seconds)
}

export const cost2Hours = (seconds: number) => {
  return `${(seconds / 3600).toFixed(2)}h`
}
