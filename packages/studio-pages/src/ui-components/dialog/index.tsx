import { i18n, i18nKeys } from '@hai-platform/i18n'
import { Alert, Intent } from '@hai-ui/core/lib/esm'
import React, { useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom'

export type MaybeElement = JSX.Element | false | null | undefined

// 出于体验，所有的都写死 10 秒后关闭
const STATIC_DELAY_CLOSE_TIME = 10 * 1000

/**
 * Dialog 核心组件
 */
const DialogComp = (props: {
  rs: (value?: unknown) => void
  rj: (value?: unknown) => void
  content: string | MaybeElement
  intent?: Intent | undefined
  confirmText?: string | undefined
  cancelText?: string | undefined
  disableCountDown?: boolean
}): JSX.Element => {
  const [alertOpen, setAlertOpen] = useState(true)
  const [delayCloseTime, setDelayCloseTime] = useState(STATIC_DELAY_CLOSE_TIME)
  const [beginTime] = useState(Date.now())
  const timeoutUpdateRef = useRef<number | null>(null)

  const updateCountDown = (): void => {
    const elapsedTime = Date.now() - beginTime
    const nextDelayCloseTime = STATIC_DELAY_CLOSE_TIME - elapsedTime
    if (nextDelayCloseTime < 0) {
      setAlertOpen(false)
      props.rj()
    } else {
      setDelayCloseTime(nextDelayCloseTime)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      timeoutUpdateRef.current = window.setTimeout(updateCountDown, 1000)
    }
  }

  useEffect(() => {
    if (props.disableCountDown) return () => {}
    updateCountDown()
    return () => {
      if (timeoutUpdateRef.current) {
        clearTimeout(timeoutUpdateRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Alert
      className="base-dialog-container"
      isOpen={alertOpen}
      canEscapeKeyCancel
      cancelButtonText={props.cancelText || i18n.t(i18nKeys.base_Cancel)}
      confirmButtonText={props.confirmText || i18n.t(i18nKeys.base_Confirm)}
      intent={props.intent || Intent.NONE}
      onCancel={() => {
        setAlertOpen(false)
        props.rj()
      }}
      onConfirm={() => {
        setAlertOpen(false)
        props.rs()
      }}
    >
      {!props.disableCountDown && (
        <div className="base-dialog-close-tip">
          {i18n.t(i18nKeys.base_dialog_close_tip, {
            seconds: (delayCloseTime / 1000).toFixed(0),
          })}
        </div>
      )}
      <div style={{ marginBottom: 10 }}>{props.content}</div>
    </Alert>
  )
}

/**
 * 创建 Dialog 的管理函数
 * @date 2022-01-07
 * @param {any} content:string|MaybeElement
 * @param {any} intent?:Intent
 * @returns Promise<boolean>
 */
const baseDialog = async (props: {
  content: string | MaybeElement
  intent?: Intent | undefined
  confirmText?: string | undefined
  cancelText?: string | undefined
  disableCountDown?: boolean
}): Promise<boolean> => {
  const ps: { rs?: (value?: unknown) => void; rj?: (value?: unknown) => void } = {}
  const promise = new Promise((rs, rj) => {
    ps.rs = rs
    ps.rj = rj
  })

  const container = document.createElement('div')
  document.body.appendChild(container)
  // eslint-disable-next-line react/jsx-props-no-spreading
  ReactDOM.render(<DialogComp rs={ps.rs!} rj={ps.rj!} {...props} />, container)

  let confirmRes
  try {
    await promise
    confirmRes = true
  } catch (e) {
    confirmRes = false
  }

  setTimeout(() => {
    ReactDOM.unmountComponentAtNode(container)
    document.body.removeChild(container)
  }, 2000)
  return confirmRes
}

export const createDialog = async (props: {
  body: string | MaybeElement
  title?: string | MaybeElement
  intent?: Intent
  confirmText?: string
  cancelText?: string
  disableCountDown?: boolean
}): Promise<boolean> => {
  let content
  let { title } = props
  if (typeof title === 'string') {
    title = <h3 style={{ marginTop: 0 }}>{title}</h3>
  }
  if (!props.title) {
    content = props.body
  } else {
    content = (
      <>
        {title}
        {props.body}
      </>
    )
  }

  const confirmResult = await baseDialog({
    content,
    intent: props.intent,
    confirmText: props.confirmText,
    cancelText: props.cancelText,
    disableCountDown: props.disableCountDown,
  })
  return confirmResult
}

export const confirmDialog = async (
  body: string | MaybeElement,
  title?: string | MaybeElement,
): Promise<boolean> => {
  return createDialog({
    body,
    title,
    intent: Intent.NONE,
  })
}

export const okDialog = async (
  body: string | MaybeElement,
  title?: string | MaybeElement,
): Promise<boolean> => {
  // 预期内的对参数赋值
  // eslint-disable-next-line no-param-reassign
  if (!title) title = i18n.t(i18nKeys.biz_notification)
  return createDialog({
    body,
    title,
    intent: Intent.NONE,
    confirmText: i18n.t(i18nKeys.base_OK),
  })
}

export const successDialog = async (
  body: string | MaybeElement,
  title = 'SUCCESS',
): Promise<boolean> => {
  return createDialog({
    body,
    title,
    intent: Intent.PRIMARY,
    confirmText: i18n.t(i18nKeys.base_OK),
  })
}

export const primaryDialog = async (
  body: string | MaybeElement,
  title = 'ATTENTION',
): Promise<boolean> => {
  return successDialog(body, title)
}

export const alertDialog = async (
  body: string | MaybeElement,
  title = 'ATTENTION',
): Promise<boolean> => {
  return createDialog({
    body,
    title,
    intent: Intent.WARNING,
  })
}

export const errorDialog = async (
  body: string | MaybeElement,
  title = 'ERROR',
): Promise<boolean> => {
  return createDialog({
    body,
    title,
    intent: Intent.DANGER,
    confirmText: i18n.t(i18nKeys.base_OK),
    disableCountDown: true,
  })
}

export const dangerousDialog = async (
  body: string | MaybeElement,
  title = 'ATTENTION',
): Promise<boolean> => {
  return errorDialog(body, title)
}

export const downloadDialog = async (
  body: string | MaybeElement,
  title?: string,
): Promise<boolean> => {
  return createDialog({
    body,
    title,
    intent: Intent.NONE,
    confirmText: i18n.t(i18nKeys.base_Download),
  })
}
