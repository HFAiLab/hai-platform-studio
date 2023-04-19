import React from 'react'
import useEffectOnce from 'react-use/esm/useEffectOnce'

export const useFocusInterval = (callback: () => any, delay: number) => {
  const savedCallback = React.useRef<() => any>()

  React.useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffectOnce(() => {
    let lastTickTime: number | null = null
    function tick() {
      if (!document.hasFocus()) return
      lastTickTime = Date.now()
      savedCallback.current && savedCallback.current()
    }
    function pageFocusCallback() {
      const currentTime = Date.now()
      if (!lastTickTime || currentTime - lastTickTime > delay) {
        tick()
      }
    }
    window.addEventListener('focus', pageFocusCallback)
    const id = setInterval(tick, delay)
    return () => {
      clearInterval(id)
      window.removeEventListener('focus', pageFocusCallback)
    }
  })
}
