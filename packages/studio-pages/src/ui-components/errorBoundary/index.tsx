import type { ReactNode } from 'react'
import React from 'react'
import { LevelLogger } from '../../utils/log'

interface ErrorBoundaryProps {
  errorComp: NonNullable<ReactNode> | null
}

interface ErrorBoundaryState {
  hasError: boolean
}

export class ReactErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  errorComp: NonNullable<ReactNode> | null = null

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
    this.errorComp = props.errorComp
  }

  static getDerivedStateFromError() {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return { hasError: true }
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  override componentDidCatch(error: any, errorInfo: any) {
    // 你同样可以将错误日志上报给服务器
    LevelLogger.error(`[ErrorBoundary] catch error:${error}, errorInfo: ${errorInfo}`)
    console.error(`[ErrorBoundary] catch error, errorInfo:`, error, errorInfo)
  }

  override render() {
    if (this.state.hasError) {
      // 你可以自定义降级后的 UI 并渲染
      return this.errorComp
    }

    return this.props.children
  }
}
