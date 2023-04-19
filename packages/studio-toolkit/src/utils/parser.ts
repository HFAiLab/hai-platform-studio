export const parseUploadedFilename = (rawName: string) => {
  // rawName 类似 "2022-08-06-18-23_username_cmF3X2RhdGFfZG93bmxvYWRlci5zaA==.sh"
  function uAtob(ascii: string) {
    const utf8decoder = new TextDecoder()
    return utf8decoder.decode(Uint8Array.from(atob(ascii), (c) => c.charCodeAt(0)))
  }
  const na = rawName.split('_')
  const fna = na[na.length - 1]?.split('.') ?? null
  if (fna && fna[0]) {
    return uAtob(fna[0])
  }
  return null
}
