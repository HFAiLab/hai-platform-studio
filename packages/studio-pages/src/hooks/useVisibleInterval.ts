import React from 'react'
import useEffectOnce from 'react-use/esm/useEffectOnce'

export const useVisibleInterval = (callback: () => any, delay: number) => {
  const savedCallback = React.useRef<() => any>()

  React.useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffectOnce(() => {
    let lastTickTime: number | null = null
    function tick() {
      if (document.visibilityState !== 'visible') return
      lastTickTime = Date.now()
      savedCallback.current && savedCallback.current()
    }
    function docVisibilityChange() {
      const currentTime = Date.now()
      if (!lastTickTime || currentTime - lastTickTime > delay) {
        tick()
      }
    }
    document.addEventListener('visibilitychange', docVisibilityChange)
    const id = setInterval(tick, delay)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', docVisibilityChange)
    }
  })
}
