import React, { useContext } from 'react'
// eslint-disable-next-line import/no-cycle
import { ServiceContext } from '../..'

import { HTTPLogViewer, IOLogViewer } from './Core'

// HINT: 不建议在这里使用 Suspense，是因为这样会导致打包体积明显变大
export const LogContainer = () => {
  const srvc = useContext(ServiceContext)
  const { reqType } = srvc.app

  return (
    // 显示 <Spinner> 组件直至 OtherComponent 加载完成
    // <React.Suspense fallback={<LogLoader />}>
    <>
      {reqType === 'http' && <HTTPLogViewer />}
      {reqType === 'io' && <IOLogViewer />}
    </>
  )
}
