import { i18n, i18nKeys } from '@hai-platform/i18n'
import { Button } from '@hai-ui/core/lib/esm'
import React, { useState } from 'react'

export const RefreshBtn = (props: {
  small?: boolean
  className?: string
  svgOnly?: boolean
  onClick: () => any
}) => {
  const [refreshClassTimerId, setRefreshClassTimerId] = useState(0)

  const refreshClickCallback = () => {
    if (refreshClassTimerId) {
      clearTimeout(refreshClassTimerId)
    }
    const timerId = window.setTimeout(() => {
      setRefreshClassTimerId(0)
    }, 1000)

    setRefreshClassTimerId(timerId)

    props.onClick()
  }

  return (
    <Button
      className={`${refreshClassTimerId ? 'animation-rotate' : ''} ${
        props.className ? props.className : ''
      }`}
      onClick={refreshClickCallback}
      icon="refresh"
      text={props.svgOnly ? '' : i18n.t(i18nKeys.biz_exp_refresh)}
      small={!!props.small}
    />
  )
}
