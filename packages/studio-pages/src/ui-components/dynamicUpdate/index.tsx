import type { CSSProperties } from 'react'
import React, { useEffect, useState } from 'react'

export const DynamicUpdate = (props: {
  value: string
  style?: CSSProperties
  animationTime?: number
}): JSX.Element => {
  const style = props.style ?? {}
  const animationTime = props.animationTime ?? 2
  const [ifAnimation, setAnimation] = useState<boolean>(false)

  useEffect(() => {
    let animationResetTimerId: number | null = null
    if (!ifAnimation) {
      setAnimation(true)
      animationResetTimerId = window.setTimeout(() => {
        setAnimation(false)
      }, animationTime * 1000)
    }
    return () => {
      if (animationResetTimerId) clearTimeout(animationResetTimerId)
      setAnimation(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.value])

  return (
    <span
      className="dynamic-updated-at"
      style={{
        ...style,
        animation: ifAnimation ? `background-fade ${animationTime}s ease-out` : '',
      }}
    >
      Updated: {props.value}
    </span>
  )
}
