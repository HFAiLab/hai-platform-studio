export const getFileBase64 = async (
  file: File,
): Promise<{ fileName?: string | undefined; content?: string | undefined }> => {
  if (!file) {
    return {
      fileName: undefined,
      content: undefined,
    }
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const res = reader.result as string
      const b64string = res.substr(res.indexOf(',') + 1)
      resolve({ fileName: file.name, content: b64string })
    }
    reader.onerror = (error) => reject(error)
  })
}
