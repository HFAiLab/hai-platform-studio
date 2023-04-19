import { i18n, i18nKeys } from '@hai-platform/i18n'
import { useInterval } from '@hai-platform/studio-pages/lib/hooks/useInterval'
import { createDialog } from '@hai-platform/studio-pages/lib/ui-components/dialog'
import { SVGWrapper } from '@hai-platform/studio-pages/lib/ui-components/svgWrapper'
import { Intent, PopoverPosition } from '@hai-ui/core'
import { Tooltip2 } from '@hai-ui/popover2'
import React, { useEffect } from 'react'
import { conn } from '../../api/serverConnection'
import LogUpload from '../../components/svg/logUpload.svg?raw'
import { AppToaster, CONSTS, getUserName } from '../../utils'
import { getFingerprint } from '../../utils/fingerprint'

import HFLogger from '../../utils/log'

function requestIdleCallback(callback: () => any) {
  if (window.requestIdleCallback) {
    window.requestIdleCallback(callback)
  } else {
    setTimeout(callback)
  }
}

export const UploadLog = () => {
  const UploadLogImpl = async () => {
    AppToaster.show({
      message: i18n.t(i18nKeys.biz_log_upload_start),
      intent: 'none',
      icon: 'tick',
    })
    const logBundle = await HFLogger.genLogBundle()
    await conn.uploadLog({
      channel: CONSTS.LogUploadChannel,
      uid: getUserName(),
      fingerprint: getFingerprint(),
      data: logBundle,
    })
    AppToaster.show({
      message: i18n.t(i18nKeys.biz_log_upload_end),
      intent: 'none',
      icon: 'tick',
    })
  }

  const UploadLogConfirm = async () => {
    const confirmResult = await createDialog({
      body: i18n.t(i18nKeys.biz_log_upload_body),
      title: i18n.t(i18nKeys.biz_log_upload_title),
      intent: Intent.PRIMARY,
      cancelText: i18n.t(i18nKeys.biz_log_upload_cancel),
      confirmText: i18n.t(i18nKeys.biz_log_upload_confirm),
    })
    if (confirmResult) {
      requestIdleCallback(UploadLogImpl)
    }
  }

  useEffect(() => {
    conn.queryShouldUploadLog()
  }, [])

  useInterval(async () => {
    const queryResult = await conn.queryShouldUploadLog()
    if (!queryResult.shouldUpload) return
    if (!queryResult.rid) return
    localStorage.setItem(CONSTS.LocalStorage_LastUploadRid, queryResult.rid)
    const logBundle = await HFLogger.genLogBundle()
    await conn.uploadLogAuto({
      rid: queryResult.rid,
      fingerprint: getFingerprint(),
      data: logBundle,
    })
  }, CONSTS.LogUploadCheckInterval)

  return (
    <div className="log-upload-container" onClick={UploadLogConfirm}>
      <Tooltip2
        className="log-upload--icon-container"
        position={PopoverPosition.TOP}
        content={<span>{i18n.t(i18nKeys.biz_log_upload)}</span>}
      >
        <SVGWrapper svg={LogUpload} dClassName="log-upload" />
      </Tooltip2>
    </div>
  )
}
