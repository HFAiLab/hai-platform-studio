import { i18n, i18nKeys } from '@hai-platform/i18n'
import React from 'react'
import { useEffectOnce } from 'react-use/esm'
import { HFLayout, HFPageLayout } from '../../components/HFLayout'
import { HFPanel } from '../../components/HFPanel'
import { AilabCountly, CountlyEventKey } from '../../utils/countly'
import { ContainerManager } from './tabs'

export const JupyterPage = () => {
  useEffectOnce(() => {
    AilabCountly.safeReport(CountlyEventKey.pageContainerMount)
  })

  return (
    <HFPageLayout
      outerClassName="user-container"
      innerClassName="dev-container-container"
      responsive
    >
      <HFLayout direction="vertical">
        <HFPanel className="dash-title-panel" disableLoading>
          <h1>{i18n.t(i18nKeys.biz_dev_container_manage)}</h1>
          <p>{i18n.t(i18nKeys.biz_dev_container_desc)}</p>
        </HFPanel>
        <HFPanel disableLoading nanoTopPadding>
          <ContainerManager />
        </HFPanel>
      </HFLayout>
    </HFPageLayout>
  )
}
