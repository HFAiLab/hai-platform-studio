import React from 'react'
import { hasCustomMarsServer } from '../../../utils'
import { DebugEditor } from './DebugEditor'
import { SettingsEditor } from './SettingsEditor'

export const SettingsContainer = () => {
  return (
    <div>
      <SettingsEditor />
      {(hasCustomMarsServer() || window._hf_user_if_in) && <DebugEditor />}
    </div>
  )
}

export default SettingsContainer
