export const Base64 = {
  encode(str: string) {
    const b = Buffer.from(str)
    return b.toString('base64')
  },
  decode(str: string) {
    const b = Buffer.from(str, 'base64')
    return b.toString()
  },
}
