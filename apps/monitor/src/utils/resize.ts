/* eslint-disable @typescript-eslint/explicit-function-return-type */
import throttle from 'lodash/throttle'

export interface ResizeManagerOptions {
  barDom: HTMLDivElement
  containerDom: HTMLDivElement
  // 当我们在交互的时候，可以通过设置状态位，来优化操作性能等
  interactionCallback: InteractionCallback
  offsetChangeCallback: OffsetChangeCallback
}

function convertTouchEventToMouseEvent(e: TouchEvent) {
  if (!e.touches.length) {
    return null
  } // bug 情况，不应该出现
  const touch = e.touches[0]!
  const { clientX, clientY } = touch
  const offsetX = clientX
  const offsetY = clientY
  const event = {
    button: 0,
    offsetX,
    offsetY,
    clientX,
    clientY,
  }
  return event as MouseEvent
}

function addMask(node: HTMLElement) {
  const tempDiv = document.createElement('div')
  tempDiv.style.width = '100%'
  tempDiv.style.height = '100%'
  tempDiv.style.position = 'fixed'
  tempDiv.style.backgroundColor = 'transparent'
  tempDiv.style.top = '0'
  tempDiv.style.left = '0'
  tempDiv.style.zIndex = `999999`
  tempDiv.style.cursor = 'move'
  node.appendChild(tempDiv)
  return tempDiv
}

type TouchEventCallback = (sourceEvent: TouchEvent) => void
type MouseEventCallback = (sourceEvent: MouseEvent) => void
type InteractionCallback = (interaction: boolean) => void

type OffsetChangeCallback = (offsetX: number, offsetY: number) => void

/**
 * 丝滑的原生滚动管理类
 */
export class ResizeManager {
  barDom: HTMLDivElement

  containerDom: HTMLDivElement

  eventDom: HTMLDivElement | null = null

  #handleTouchMoveThrottled: TouchEventCallback

  #handleMouseMoveThrottled: MouseEventCallback

  beginEvent?: MouseEvent

  enable = true

  interactionCallback: InteractionCallback

  offsetChangeCallback: OffsetChangeCallback

  containerHeight: number | null = null

  constructor(options: ResizeManagerOptions) {
    this.barDom = options.barDom
    this.containerDom = options.containerDom

    this.#handleTouchMoveThrottled = throttle(this.#handleTouchMove, 16)
    this.#handleMouseMoveThrottled = throttle(this.#handleMouseMove, 16)

    this.interactionCallback = options.interactionCallback
    this.offsetChangeCallback = options.offsetChangeCallback
  }

  setEnable = (enable: boolean) => {
    this.enable = enable
  }

  start = () => {
    this.#initListeners()
  }

  #handleTouchStart = (sourceEvent: TouchEvent) => {
    if (!this.enable) return
    sourceEvent.preventDefault()
    const e = convertTouchEventToMouseEvent(sourceEvent)
    if (!e) return
    this.beginEvent = e
    this.eventDom = addMask(document.body)
    this.#initActualDomListeners()
    this.interactionCallback(true)
  }

  #handleMouseDown = (e: MouseEvent) => {
    if (!this.enable) return
    this.beginEvent = e
    this.eventDom = addMask(document.body)
    this.#initActualDomListeners()
    this.interactionCallback(true)
  }

  #handleTouchEnd = (sourceEvent: TouchEvent) => {
    sourceEvent.preventDefault()
    sourceEvent.stopPropagation()
    this.#clearEventDom()
  }

  #handleTouchMove = (sourceEvent: TouchEvent) => {
    sourceEvent.preventDefault()
    const e = convertTouchEventToMouseEvent(sourceEvent)
    if (!e) return
    this.#handleMouseMove(e)
  }

  #handleMouseMove = (e: MouseEvent) => {
    if (!e) return
    // hint: 有可能 mouseMove 是从外界进入的，这个时候就没有 beginEvent
    if (!this.beginEvent) return
    const distanceY = e.clientY - this.beginEvent.clientY
    const distanceX = e.clientX - this.beginEvent.clientX
    if (this.offsetChangeCallback) this.offsetChangeCallback(distanceX, distanceY)
  }

  #handleMouseUp = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    this.#clearEventDom()
  }

  #handleMouseOut = () => {
    this.#clearEventDom()
  }

  #handleMouseLeave = () => {
    this.#clearEventDom()
  }

  #initListeners = () => {
    this.barDom.addEventListener('touchstart', this.#handleTouchStart)
    this.barDom.addEventListener('mousedown', this.#handleMouseDown)
  }

  #initActualDomListeners = () => {
    if (!this.eventDom) return
    this.barDom.addEventListener('touchend', this.#handleTouchEnd, true)
    this.barDom.addEventListener('touchmove', this.#handleTouchMoveThrottled)
    this.eventDom.addEventListener('mousemove', this.#handleMouseMoveThrottled)
    this.eventDom.addEventListener('mouseup', this.#handleMouseUp, true)
    this.eventDom.addEventListener('mouseleave', this.#handleMouseOut)
    this.eventDom.addEventListener('mouseout', this.#handleMouseLeave)
  }

  // 一次事件结束，清理操作：
  #clearEventDom = () => {
    if (!this.eventDom) return
    this.barDom.removeEventListener('touchend', this.#handleTouchEnd)
    this.barDom.removeEventListener('touchmove', this.#handleTouchMoveThrottled)
    this.eventDom.removeEventListener('mousemove', this.#handleMouseMoveThrottled)
    this.eventDom.removeEventListener('mouseup', this.#handleMouseUp)
    document.body.removeChild(this.eventDom)
    this.eventDom = null
    this.beginEvent = undefined
    this.interactionCallback(false)
  }
}
