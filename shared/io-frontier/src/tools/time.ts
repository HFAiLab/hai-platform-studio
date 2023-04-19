export function getUTC8TimeStamp() {
  return new Date().getTime() + (Number(new Date().getTimezoneOffset() / 60) + 8) * 3600 * 1000
}
