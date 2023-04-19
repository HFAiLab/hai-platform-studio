import { i18n, i18nKeys } from '@hai-platform/i18n'
import { Button, Intent, Position, Toaster } from '@hai-ui/core'
import type { IToastProps } from '@hai-ui/core'
import { throttle } from 'lodash-es'
import React, { useEffect, useRef, useState } from 'react'

/** Singleton toaster instance. Create separate instances for different options. */
export const AppToaster = Toaster.create({
  className: 'recipe-toaster',
  position: Position.TOP,
  shouldReturnFocusOnClose: false,
})

export const throttleShowZenDragToast = throttle(() => {
  AppToaster.show({
    icon: 'info-sign',
    intent: Intent.NONE,
    message: i18n.t(i18nKeys.biz_toast_split_mode_double_click),
  })
}, 3000)

export const ShowZenLauncherCreatePythonToast = () => {
  AppToaster.show({
    icon: 'info-sign',
    intent: Intent.NONE,
    message: i18n.t(i18nKeys.biz_toast_create_python_success),
  })
}

interface CancellableToasterProps {
  msg: React.ReactNode
  timeout: number
  showTimeout: boolean | undefined
  cancelCallback: () => void
}

export const CancellableToasterComponent = (props: CancellableToasterProps) => {
  const [canceled, setCanceled] = useState(false)
  const [delayCloseTime, setDelayCloseTime] = useState(props.timeout)
  const [beginTime] = useState(Date.now())
  const timeoutUpdateRef = useRef<number | null>(null)

  const updateCountDown = (): void => {
    const elapsedTime = Date.now() - beginTime
    const nextDelayCloseTime = Math.max(props.timeout - elapsedTime, 0)
    setDelayCloseTime(nextDelayCloseTime)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    timeoutUpdateRef.current = window.setTimeout(updateCountDown, 1000)
  }

  useEffect(() => {
    updateCountDown()
    return () => {
      if (timeoutUpdateRef.current) {
        clearTimeout(timeoutUpdateRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="cancellable-toaster-container">
      <span>{props.msg}</span>

      {props.showTimeout && (
        <span className="timeout-tip">{(delayCloseTime / 1000).toFixed(0)}s</span>
      )}
      {!canceled && (
        <Button
          className="timeout-tip-btn"
          minimal
          intent="warning"
          small
          onClick={() => {
            setCanceled(true)
            props.cancelCallback()
          }}
        >
          {i18n.t(i18nKeys.base_Cancel)}
        </Button>
      )}
      {canceled && <span className="canceled">{i18n.t(i18nKeys.base_Canceled)}</span>}
    </div>
  )
}

export const toastWithCancel = (props: IToastProps, key?: string | undefined): Promise<boolean> => {
  return new Promise((rs) => {
    let canceled = false
    let resKey = ''

    const onDismissCallback = (didTimeoutExpire: boolean): void => {
      rs(!canceled)
      if (props.onDismiss) props.onDismiss(didTimeoutExpire)
    }

    // hint：这个时间不是特别准确，实际调度起来可能会略超 timeout 的时间
    const msgComponent = (
      <CancellableToasterComponent
        msg={props.message}
        showTimeout
        timeout={props.timeout || 5000}
        cancelCallback={() => {
          canceled = true
          AppToaster.dismiss(resKey)
          AppToaster.show({
            message: i18n.t(i18nKeys.base_Canceled_Success),
            intent: 'warning',
          })
        }}
      />
    )

    const overrideProps: IToastProps = {
      ...props,
      onDismiss: onDismissCallback,
      className: 'cancellable-Toast',
      message: msgComponent,
    }

    resKey = AppToaster.show(overrideProps, key)
  })
}
