// Chrome 109 移除了 e.path,firefox 等浏览器也不太支持这个属性
export const getEventPath = (e: MouseEvent) => {
  if ('path' in e) {
    return e.path as HTMLElement[]
  }

  return e.composedPath() as HTMLElement[]
}
export const listenDocumentClickAndTryClose = (className: string, callback: () => void) => {
  const tryCallback = (e: MouseEvent) => {
    const pathClassNames = getEventPath(e).map((dom) =>
      dom.getAttribute ? dom.getAttribute('class') : '',
    ) as string[]
    if (!pathClassNames.join(',').includes(className)) {
      document.removeEventListener('click', tryCallback)
      callback()
    }
  }

  document.addEventListener('click', tryCallback)

  return () => {
    document.removeEventListener('click', tryCallback)
  }
}
