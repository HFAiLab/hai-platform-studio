/* eslint-disable class-methods-use-this */
import { AilabServerApiName } from '@hai-platform/client-ailab-server'
import { ONEDAY, ONEHOUR, ONEMINUTE } from '@hai-platform/studio-toolkit/lib/esm/date/utils'
import { Button } from '@hai-ui/core'
import React from 'react'
import { GlobalAilabServerClient } from '../../api/ailabServer'
import { APPShortVersion, AppToaster, getUserName, isPrePub } from '../../utils'

import './index.scss'

enum ShowTipStatus {
  NOT_SHOW = 'not_show',
  SHOWING = 'showing',
  SHOWED = 'showed',
}

enum TipTypes {
  OPEN_TOO_LONG = 'open_too_long',
  NEW_VERSION = 'new_version',
}

const getShowTipByType = (tipType: TipTypes) => {
  switch (tipType) {
    case TipTypes.OPEN_TOO_LONG:
      return '检测到打开本页面已经超过 7 天，为获得更好的使用体验，建议刷新页面获取更新'
    case TipTypes.NEW_VERSION:
    default:
      return '检测到新版本发布，为获得更好的使用体验，建议刷新页面获取更新'
  }
}

// 这个网页最多开多久就触发 toast: 7 天
const APP_SHOULD_RELOAD_TIME = 7 * ONEDAY

// 多久检查一次：60 分钟
const APP_CHECK_TIP_TIME = 60 * ONEMINUTE

// 当这次弹窗被 dismiss 之后，多久可以弹下一次：24 小时
const SHOW_TIP_NEXT_AFTER_DISMISS = 24 * ONEHOUR

export class RefreshNoticeManager {
  appStartTime = Date.now()

  showTipStatus = ShowTipStatus.NOT_SHOW

  lastCloseTipTime: number | null = null

  currentShowTipType: TipTypes | null = null

  intervalId: number | null = null

  start() {
    this.stop()
    this.intervalId = window.setInterval(() => {
      this.checkShouldShowTip()
    }, APP_CHECK_TIP_TIME)
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
    }
  }

  // 是否应该展示 Tip 了
  checkShouldShowTip = async () => {
    if (this.showTipStatus === ShowTipStatus.SHOWING) {
      return
    }

    if (this.lastCloseTipTime && Date.now() - this.lastCloseTipTime < SHOW_TIP_NEXT_AFTER_DISMISS) {
      return
    }

    if (await this.checkHasNewVersion()) {
      this.showTip(TipTypes.NEW_VERSION)
    } else if (this.checkOpenTimeTooLong()) {
      this.showTip(TipTypes.OPEN_TOO_LONG)
    }
  }

  showTip = (tipType: TipTypes) => {
    this.showTipStatus = ShowTipStatus.SHOWING
    AppToaster.show({
      message: (
        <div className="refresh-notice-container">
          <p className="refresh-notice-desc">{getShowTipByType(tipType)}</p>
          <Button
            outlined
            small
            intent="primary"
            className="refresh-notice-btn"
            onClick={() => {
              window.location.reload()
            }}
          >
            立即刷新
          </Button>
        </div>
      ),
      timeout: 0,
      intent: 'none',
      onDismiss: () => {
        this.lastCloseTipTime = Date.now()
        this.showTipStatus = ShowTipStatus.SHOWED
      },
    })
  }

  checkHasNewVersion = async () => {
    const latestVersionResult = await GlobalAilabServerClient.request(
      AilabServerApiName.TRAININGS_GET_LATEST_APP_VERSION,
      {
        app_name: 'studio',
        base_app_version: isPrePub ? 'prepub' : 'online',
      },
    )
    return Number(APPShortVersion) < Number(latestVersionResult.version)
  }

  checkOpenTimeTooLong() {
    return Date.now() - this.appStartTime > APP_SHOULD_RELOAD_TIME
  }
}

export const GlobalRefreshNoticeManager = new RefreshNoticeManager()
