import React from 'react'

export const useInterval = (callback: () => any, delay: number) => {
  const savedCallback = React.useRef<() => any>()

  React.useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  React.useEffect(() => {
    function tick() {
      savedCallback.current && savedCallback.current()
    }
    const id = setInterval(tick, delay)
    return () => clearInterval(id)
  }, [delay])
}
