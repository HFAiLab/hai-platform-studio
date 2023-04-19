// polyfills
import json5 from 'json5'
import type { AppConfigSchema } from './config'
import { DefaultAppConfig } from './config'

if (typeof (window as any).global === 'undefined') {
  ;(window as any).global = window
}

export interface IConfig {
  type: 'boolean' | 'string' | 'object' | 'number'
  title: string
  description: string
  default: any
}

export interface IConfigList {
  [key: string]: IConfig
}

export class SettingParser {
  static parse(content: string) {
    return json5.parse(content)
  }

  static get defaultSettingsContent(): AppConfigSchema {
    return Object.keys(DefaultAppConfig).reduce((curr, key) => {
      curr[key] = DefaultAppConfig[key as keyof typeof DefaultAppConfig].default
      return curr
    }, {} as any) as AppConfigSchema
  }

  static renderDefault() {
    let output = '{\n'
    const keys = Object.keys(DefaultAppConfig)

    keys.forEach((key, index) => {
      const value = DefaultAppConfig[key as keyof typeof DefaultAppConfig] as unknown as IConfig
      output += [
        '',
        `// ${value.title}`,
        `// ${value.description}`,
        `"${key}": ${JSON.stringify(value.default)}`,
      ].join('\n')
      if (index !== keys.length - 1) output += ','
      output += '\n'
    })

    output += '\n}\n'
    return output
  }
}
