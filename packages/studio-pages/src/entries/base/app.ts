import { i18n } from '@hai-platform/i18n'
import type { EmitterMethod } from 'event-emitter'
import EventEmitter from 'event-emitter'
import type { BaseContainerAPI } from './container'

// outContainer 是外部传入的 Container
// 如果是 React 套 React，强烈建议使用这种架构
export const clearAndCreateNewContainer = (outContainer: HTMLDivElement) => {
  const newDiv = document.createElement('div')
  outContainer.innerHTML = ''
  newDiv.style.height = '100%'
  newDiv.style.width = '100%'
  outContainer.appendChild(newDiv)
  return newDiv
}

export class BaseApp<T extends BaseContainerAPI> {
  private _container_api: T

  protected ee: EventEmitter.Emitter

  constructor(container_api: T) {
    this._container_api = container_api
    this.ee = EventEmitter({})
  }

  protected _emit(type: string, ...args: any[]) {
    this.ee.emit(type, ...args)
  }

  protected _on(type: string, fn: EmitterMethod) {
    this.ee.on(type, fn)
  }

  protected _off(type: string, fn: EmitterMethod) {
    this.ee.off(type, fn)
  }

  protected _once(type: string, fn: EmitterMethod) {
    this.ee.once(type, fn)
  }

  api() {
    return this._container_api
  }

  stop() {}

  execute() {}

  asyncExecute() {}

  prepare() {
    i18n.setLanguage(this.api().getLan())
  }
}
