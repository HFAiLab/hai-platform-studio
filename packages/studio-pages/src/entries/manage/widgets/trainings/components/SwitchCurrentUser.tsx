import { Button, Callout, Dialog, FormGroup, InputGroup } from '@hai-ui/core'
import React, { useState } from 'react'

export interface SwitchCurrentUserProps {
  isOpen: boolean
  onClose: () => void
}

export const SwitchCurrentUser = (props: SwitchCurrentUserProps) => {
  const [nextUserToken, setNextUserToken] = useState('')
  const [nextUserName, setNextUserName] = useState('')

  const changeCurrentUser = () => {
    if (!nextUserName || !nextUserToken) {
      // eslint-disable-next-line no-alert
      alert('name 和 token 都需要填写')
    }
    window.open(
      `${window.location.protocol}//${window.location.host}/?current_user_token=${nextUserToken}&current_user=${nextUserName}#/manage`,
    )
  }

  return (
    <Dialog
      title="切换当前用户"
      isOpen={props.isOpen}
      onClose={() => {
        props.onClose()
      }}
      className="switch-current-user-container"
    >
      <Callout intent="warning">切换为其他用户的只读模式，请谨慎操作</Callout>
      <div className="switch-user-op-container">
        <FormGroup label="切换用户的 名字 " inline>
          <InputGroup
            className="quotachange-input"
            value={nextUserName}
            id="next-user-name"
            onChange={(e) => {
              setNextUserName(e.target.value)
            }}
          />
        </FormGroup>
        <FormGroup label="切换用户的 Token" inline>
          <InputGroup
            className="quotachange-input"
            value={nextUserToken}
            id="next-user-token"
            onChange={(e) => {
              setNextUserToken(e.target.value)
            }}
          />
        </FormGroup>
        <Button onClick={changeCurrentUser}>确认切换</Button>
      </div>
    </Dialog>
  )
}
