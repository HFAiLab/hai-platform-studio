import fs from 'fs'

export const isDirExist = (filePath: string) => {
  try {
    const isDir = fs.lstatSync(filePath).isDirectory()
    return isDir
  } catch (e) {
    // resText += `${command[0]}: Directory not found is not a directory\r\n`
    return false
  }
}

export const isFileExist = (filePath: string) => {
  try {
    const isDir = fs.lstatSync(filePath).isFile()
    return isDir
  } catch (e) {
    // resText += `${command[0]}: Directory not found is not a directory\r\n`
    return false
  }
}
