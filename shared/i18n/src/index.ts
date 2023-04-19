import { copyWriting } from './config'
import { Languages } from './languages'

export { Languages } from './languages'
export * from './config'

export interface CopyWritingObject {
  [Languages.EN]: string
  [Languages.ZH_CN]: string
}

export interface CopyWriting {
  [key: string]: CopyWritingObject
}

export class I18n<T> {
  copyWriting: CopyWriting | null = null

  constructor(cw: CopyWriting) {
    this.copyWriting = cw
  }

  // default is English
  currentLanguage = Languages.EN

  setLanguage(lan: Languages) {
    this.currentLanguage = lan
  }

  extend(extendCopyWriting: CopyWriting) {
    this.copyWriting = { ...this.copyWriting, ...extendCopyWriting }
  }

  getRawText(key: string) {
    if (!this.copyWriting || !this.copyWriting[key]) return ''
    return (
      this.copyWriting[key]![this.currentLanguage] || this.copyWriting[key]![Languages.EN]! || ''
    )
  }

  // HINT: 目前并没有模式匹配的需求，所以就可以简写
  t(key: T, params?: Record<string, string | null | undefined | number>) {
    let select_text = this.getRawText(key as unknown as string)
    // {{param}}
    const matchPattern = /\{\{(.*?)\}\}/g
    let depth = 0
    while (matchPattern.test(select_text)) {
      select_text = `${select_text}`.replace(/\{\{(.*?)\}\}/g, (_pattern, sKey: string) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return `${(params || {})[sKey] || this.getRawText(sKey)}`
      })
      depth += 1
      if (depth >= 50) {
        throw new Error(
          `Get I18n: ${key} , Too many iterations, there may be a circular reference.`,
        )
      }
    }
    return select_text
  }
}

export const i18n = new I18n<keyof typeof copyWriting>(copyWriting)
