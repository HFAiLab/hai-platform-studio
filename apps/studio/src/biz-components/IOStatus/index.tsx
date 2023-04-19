import { i18n, i18nKeys } from '@hai-platform/i18n'
import type { AllFatalErrorsType } from '@hai-platform/studio-pages/lib/socket/index'
import { IOFrontier, IoStatus, UserFatalError } from '@hai-platform/studio-pages/lib/socket/index'
import { icons } from '@hai-platform/studio-pages/lib/ui-components/svgIcon'
import { SVGWrapper } from '@hai-platform/studio-pages/lib/ui-components/svgWrapper'
import { Colors } from '@hai-ui/colors'
import { Button, Dialog, PopoverPosition } from '@hai-ui/core'
import { Tooltip2 } from '@hai-ui/popover2'
import React, { useContext, useState } from 'react'
import { GlobalContext } from '../../reducer/context'
import { AilabCountly, CountlyEventKey } from '../../utils/countly'
import './index.scss'

// 长链接的部分比较重要，暂时不做 i18n 了
const getIOStatusText = (status: IoStatus, error: AllFatalErrorsType | null) => {
  if (status === IoStatus.connected) return i18n.t(i18nKeys.io_tip_connected_title)
  if (status === IoStatus.fataled) {
    if (
      error &&
      (error as unknown as string) === (UserFatalError.userManuallyDisconnect as string)
    ) {
      return '用户手动关闭了长链接'
    }
    return i18n.t(i18nKeys.io_tip_fatal_title)
  }
  if (status === IoStatus.none) return i18n.t(i18nKeys.io_tip_not_connected_title)
  return ``
}

export const IOStatusTag = () => {
  const globalContext = useContext(GlobalContext)
  const [statusPanelIsOpen, setStatusPanelIsOpen] = useState(false)
  const handleClick = () => {
    if (statusPanelIsOpen) return
    setStatusPanelIsOpen(true)
    AilabCountly.safeReport(CountlyEventKey.IOclickIoStatus)
  }
  const manuallyDisconnect = () => {
    IOFrontier.manuallyDisconnect()
    AilabCountly.safeReport(CountlyEventKey.IOmanuallyDisconnect)
  }

  const manuallyConnect = () => {
    IOFrontier.manuallyConnect()
    AilabCountly.safeReport(CountlyEventKey.IOmanuallyConnect)
  }

  const isConnected = globalContext.state.ioStatus === IoStatus.connected
  const isFatal = globalContext.state.ioStatus === IoStatus.fataled

  return (
    <>
      <Dialog
        isOpen={!!statusPanelIsOpen}
        onClose={() => {
          setStatusPanelIsOpen(false)
        }}
      >
        <div className="socket-content-wrapper">
          <div className="socket-status-line">
            <div className="status-title">当前实时更新状态：</div>
            <SVGWrapper
              dClassName="io-status-icon"
              width="16px"
              height="16px"
              onClick={handleClick}
              svg={isConnected ? icons.io_connected : icons.io_connect_disabled}
              fill={isConnected ? Colors.BLUE3 : Colors.GRAY3}
            />
            <div
              style={{
                color: isConnected ? Colors.BLUE3 : Colors.GRAY3,
              }}
            >
              {isConnected ? `链接正常` : `实时更新关闭`}
            </div>
          </div>
          {!isConnected &&
            (globalContext.state.ioLastError as unknown as string) !==
              (UserFatalError.userManuallyDisconnect as string) && (
              <div className="socket-status-desc">
                实时更新断开原因：检测到请求集群持续出现错误，主动断开
              </div>
            )}
          {!isConnected &&
            (globalContext.state.ioLastError as unknown as string) ===
              (UserFatalError.userManuallyDisconnect as string) && (
              <div className="socket-status-desc">实时更新断开原因：用户手动断开</div>
            )}
          {isConnected && (
            <div className="socket-status-desc">
              在实时更新状态下，集群信息、日志、实验状态等会自动进行更新
            </div>
          )}
          {isConnected && (
            <div className="close-btn-group">
              <Button outlined intent="danger" small onClick={manuallyDisconnect}>
                关闭长链接
              </Button>
              <p className="close-btn-tip">关闭长链接后只能手动刷新实验状态，请谨慎操作</p>
            </div>
          )}
          {isFatal && (
            <Button small onClick={manuallyConnect}>
              尝试重新开启
            </Button>
          )}
        </div>
      </Dialog>
      {globalContext.state.ioStatus !== IoStatus.none && (
        <Tooltip2
          className="io-status-icon-container"
          position={PopoverPosition.BOTTOM}
          content={
            <span>
              {getIOStatusText(globalContext.state.ioStatus, globalContext.state.ioLastError)}
            </span>
          }
        >
          <SVGWrapper
            dClassName="io-status-icon"
            width="16px"
            height="16px"
            onClick={handleClick}
            svg={isConnected ? icons.io_connected : icons.io_connect_disabled}
            fill={isConnected ? '#489fe6' : '#999'}
          />
        </Tooltip2>
      )}
      <div />
    </>
  )
}
