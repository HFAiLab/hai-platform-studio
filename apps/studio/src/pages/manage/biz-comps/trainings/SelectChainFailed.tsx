import { Button } from '@hai-ui/core'
import React from 'react'
import { removeUserToken, replaceOrAddSingleSearchParam } from '../../../../utils'
import './SelectChainFailed.scss'

export const SelectChainFailed = () => {
  const dirAccess = () => {
    const currentURL = window.location.href
    const targetURL = replaceOrAddSingleSearchParam(currentURL, 'selectChainId', '')
    window.location.replace(targetURL)
  }

  const relogin = () => {
    removeUserToken()
    window.location.reload()
  }

  return (
    <div className="select-chain-failed-container">
      <div className="select-chain-failed-content">
        <h1 className="error-title">Error: 404</h1>
        <p className="error-desc">当前选中的实验不存在</p>
        <div className="error-opts">
          <Button intent="primary" className="relogin" onClick={relogin}>
            退出并重新登录
          </Button>
          <a className="dir-access" onClick={dirAccess}>
            {'继续访问实验管理 ->'}
          </a>
        </div>
      </div>
    </div>
  )
}
