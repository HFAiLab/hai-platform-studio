import { Button } from '@hai-ui/core/lib/esm'
import { FormGroup, InputGroup } from '@hai-ui/core/lib/esm/components'
import React, { useState } from 'react'
import { AppToaster, CONSTS, clearMarsServerInfo, removeUserToken } from '../../../utils'

import './DebugEditor.scss'

export const DebugEditor = () => {
  const [currentURL, setCurrentURL] = useState(
    window.localStorage.getItem(CONSTS.CUSTOM_MARS_SERVER_URL) || '',
  )
  const [currentHost, setCurrentHost] = useState(
    window.localStorage.getItem(CONSTS.CUSTOM_MARS_SERVER_HOST) || '',
  )

  const update = () => {
    window.localStorage.setItem(CONSTS.CUSTOM_MARS_SERVER_URL, currentURL)
    window.localStorage.setItem(CONSTS.CUSTOM_MARS_SERVER_HOST, currentHost)

    AppToaster.show({
      message: '配置成功，即将跳转至登录页面...',
      intent: 'success',
    })

    setTimeout(() => {
      removeUserToken()
      window.location.reload()
    }, 1200)
  }

  return (
    <div className="debug-editor-container">
      {}
      <FormGroup label="手动指定集群服务端集群地址" helperText="请以 http:// 开头">
        <div className="one-line">
          <InputGroup
            value={`${currentURL}`}
            placeholder=""
            onChange={(e) => {
              setCurrentURL(e.target.value)
            }}
          />
        </div>
      </FormGroup>
      {}
      <FormGroup label="手动指定集群服务端 Host" helperText="">
        <div className="one-line">
          <InputGroup
            value={`${currentHost}`}
            placeholder=""
            onChange={(e) => {
              setCurrentHost(e.target.value)
            }}
          />
        </div>
      </FormGroup>
      <div className="operations">
        <Button
          onClick={() => {
            update()
          }}
          intent="primary"
        >
          更新
        </Button>
        <Button onClick={clearMarsServerInfo} intent="none">
          清除
        </Button>
      </div>
    </div>
  )
}
