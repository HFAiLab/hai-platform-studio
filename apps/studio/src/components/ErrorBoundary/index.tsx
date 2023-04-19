import React from 'react'
import { RenderError } from '../Errors/RenderError'
import './index.scss'

export const DynamicImportErrorBoundaryFallback = () => {
  return (
    <div className="error-boundary-tip">
      {/* hint: 这里暂时没做多语言，是因为很多人虽然默认用英文，但对于这种文案，看不太懂 */}
      <h3>加载动态模块错误</h3>
      <p>通常情况下，是因为页面已经更新，之前的模块已经不存在，强制刷新浏览器页面即可</p>
    </div>
  )
}

export const RuntimeErrorBoundaryFallback = () => {
  return (
    <div className="error-boundary-container">
      <RenderError />
    </div>
  )
}
