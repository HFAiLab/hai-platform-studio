/* eslint-disable */
import deepMerge from 'deepmerge'
import jsonc from 'jsonc'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const getConfig = (module, urlType) => {
  try {
    const devrcString = `${fs.readFileSync(path.join(__dirname, '../../../.devrc'))}`
    const devrcLocalString = (() => {
      try {
        return `${fs.readFileSync(path.join(__dirname, '../../../.devrc.local'))}`
      } catch (e) {
        return '{}'
      }
    })()
    const config = deepMerge(jsonc.parse(devrcString), jsonc.parse(devrcLocalString))
    console.info('config:', config)
    return config[module][urlType]
  } catch (e) {
    console.error(e)
    return ''
  }
}
