export function createWindowResizeTrigger(
  element: HTMLDivElement,
  callback: (...args: any[]) => any,
) {
  const obj = document.createElement('object')
  obj.setAttribute(
    'style',
    'display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden;opacity: 0; pointer-events: none; z-index: -1;',
  )
  obj.onload = () => {
    if (obj) obj.contentDocument!.defaultView!.addEventListener('resize', callback)
  }
  obj.type = 'text/html'
  element.appendChild(obj)
  obj.data = 'about:blank'
  return obj
}

/**
 * 监听一个 dom 元素的 size 变化
 * */
export function createDomResizeTrigger(element: HTMLDivElement, callback: (...args: any[]) => any) {
  const observer = new ResizeObserver((entries) => {
    for (const entry of entries) {
      if (entry.target !== element) {
        return
      }
      callback()
    }
  })

  // 观察一个或多个元素
  observer.observe(element)
  return observer
}
