import { ReactErrorBoundary } from '@hai-platform/studio-pages/lib/ui-components/errorBoundary'
import { Button } from '@hai-ui/core'
import React, { useState } from 'react'
import { DynamicImportErrorBoundaryFallback } from '../../../components/ErrorBoundary'
import { useSettings } from '../../../modules/settings'
import { SettingParser } from '../../../modules/settings/parser'
import { AppToaster } from '../../../utils'

const JSONEditor = React.lazy(() => import(/* webpackChunkName: "dyn-settings-editor" */ './Core'))

export const SettingsEditor = () => {
  const {
    defaultSettingsText,
    userSettingsString,
    setUserSettingsString,
    saveUserSettings,
    isLoading,
  } = useSettings()
  const [uploadDisabled, setUploadDisabled] = useState<boolean>(true)

  const uploadSettings = () => {
    setUploadDisabled(true)
    try {
      SettingParser.parse(`${userSettingsString}`)
      saveUserSettings(userSettingsString || '').then((res) => {
        if (!res) setUploadDisabled(false)
        AppToaster.show({
          message: 'update settings success',
          intent: 'success',
        })
      })
    } catch (e) {
      AppToaster.show({
        message: 'update settings failed: parse failed',
        intent: 'danger',
      })
    }
  }

  // eslint-disable-next-line react/no-unstable-nested-components
  const Loading = () => {
    return <div className="module-init-container">module initializing...</div>
  }

  return (
    <div className="settings-container">
      <div className="setting-column">
        <div className="title">Default Settings</div>
        <React.Suspense fallback={<Loading />}>
          <JSONEditor defaultValue={`${defaultSettingsText}`} readonly />
        </React.Suspense>
      </div>
      <div className="setting-column">
        <div className="title">
          User Settings
          <Button icon="cloud-upload" small onClick={uploadSettings} disabled={uploadDisabled}>
            Save & Upload
          </Button>
        </div>
        {!isLoading && (
          <ReactErrorBoundary errorComp={<DynamicImportErrorBoundaryFallback />}>
            <React.Suspense fallback={<Loading />}>
              <JSONEditor
                defaultValue={`${userSettingsString}`}
                onChange={(value: string) => {
                  setUserSettingsString(`${value}`)
                  setUploadDisabled(false)
                }}
              />
            </React.Suspense>
          </ReactErrorBoundary>
        )}
        {/* <Editor /> */}
      </div>
    </div>
  )
}
