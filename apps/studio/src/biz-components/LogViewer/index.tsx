/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Chain } from '@hai-platform/studio-pages/lib'
import { clearAndCreateNewContainer } from '@hai-platform/studio-pages/lib/entries/base/app'
import type { BaseContainerAPI } from '@hai-platform/studio-pages/lib/entries/base/container'
import type { LogContainerAPI } from '@hai-platform/studio-pages/lib/entries/logs/container'
import { LogApp } from '@hai-platform/studio-pages/lib/entries/logs/index'
import type {
  AsyncLogServiceNames,
  AsyncLogServiceResult,
  LogServiceParams,
  LogServiceResult,
} from '@hai-platform/studio-pages/lib/entries/logs/schema'
import {
  LogServiceAbilityNames,
  LogServiceNames,
} from '@hai-platform/studio-pages/lib/entries/logs/schema'
import { EventsKeys } from '@hai-platform/studio-pages/lib/entries/logs/schema/event'
import { applyMixins } from '@hai-platform/studio-pages/lib/utils'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { JupyterBaseContainerAPI } from '../../api/base'
import type { WebEventParams } from '../../modules/event'
import { WebEventsKeys, hfEventEmitter } from '../../modules/event'
import { getCombineSettingsUnsafe } from '../../modules/settings'
import {
  CONSTS,
  LevelLogger,
  getCurrentAdminURL,
  getToken,
  getUserName,
  replaceOrAddSingleSearchParam,
} from '../../utils'
import { getCurrentTheme } from '../../utils/theme'

export interface ContainerProps {
  chain: Chain
  rank: number
  // eslint-disable-next-line react/no-unused-prop-types
  token?: string
  service?: string
  // eslint-disable-next-line react/no-unused-prop-types
  enableLogShare?: boolean
}
class ContainerAPI implements LogContainerAPI {
  #node: HTMLDivElement

  custom_token: string

  props: ContainerProps

  enableLogShare: boolean

  constructor(node: HTMLDivElement, props: ContainerProps) {
    this.#node = node
    this.props = props
    this.custom_token = props.token || getToken()
    this.enableLogShare = props.enableLogShare || false
  }

  invokeAsyncService = <T extends AsyncLogServiceNames>(): Promise<AsyncLogServiceResult[T]> => {
    throw new Error('Method not implemented.')
  }

  invokeService = <T extends keyof LogServiceParams>(
    key: T,
    params: LogServiceParams[T],
  ): LogServiceResult[T] => {
    if (key === LogServiceNames.GetLogSharedURL) {
      const options = params as LogServiceParams[LogServiceNames.GetLogSharedURL]
      /**
       * 两步：
       * 1. hash 部分参数整理成正确的
       * 2. 增加 admin 部分的参数
       */
      let url = window.location.href
      url = replaceOrAddSingleSearchParam(
        replaceOrAddSingleSearchParam(url, 'selectChainId', options.chainId),
        'defaultSelectLogOpen',
        'true',
      )
      const hash = `#${url.split('#')[1] ?? '/'}`
      const adminURL = getCurrentAdminURL(getToken(), getUserName())
      return `${adminURL}${hash}` as any
    }
    if (key === LogServiceNames.getCurrentLogChain) {
      return this.props.chain as any
    }
    if (key === LogServiceNames.getCurrentLogRank) {
      return this.props.rank as any
    }
    if (key === LogServiceNames.getCurrentLogService) {
      return this.props.service as any
    }
    if (key === LogServiceNames.invokeRankChanged) {
      const rank = params as LogServiceParams[LogServiceNames.invokeRankChanged]
      hfEventEmitter.emit(WebEventsKeys.invokeChangeLogRank, {
        chain_id: this.props.chain.chain_id,
        rank,
      })
    } else if (key === LogServiceNames.getTheme) {
      return getCurrentTheme() as any
    } else if (key === LogServiceNames.getHandleCR) {
      return getCombineSettingsUnsafe().combineSettings.handleCR as any
    } else {
      throw new Error('Method not implemented.')
    }

    return null as any
  }

  getContainer = (): HTMLDivElement => {
    return this.#node as HTMLDivElement
  }

  hasAbility = (name: LogServiceAbilityNames) => {
    const abilityDict = {
      // 值得注意的是，这里如果是别人登录了你自己的账号，也有这个分享权限
      [LogServiceAbilityNames.shareLog]: this.enableLogShare,
    }
    return abilityDict[name] ?? false
  }

  getToken = () => {
    return this.custom_token
  }
}

applyMixins(ContainerAPI, [JupyterBaseContainerAPI])

export interface LogViewerProps extends ContainerProps {
  visible: boolean
}

export const LogViewer = React.memo((props: LogViewerProps): JSX.Element => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [delayInit, setDelayInit] = useState(true)
  const logAppRef = useRef<LogApp | null>(null)
  const visibleRef = useRef(props.visible)

  if (delayInit) {
    setTimeout(() => {
      setDelayInit(false)
    }, CONSTS.HFAPP_DELAY_RENDER)
  }

  useLayoutEffect(() => {
    LevelLogger.info(`log app delayInit: ${delayInit}`)
    if (delayInit) return

    if (!containerRef.current) {
      LevelLogger.error('LogViewer container not found')
      return
    }
    const newDiv = clearAndCreateNewContainer(containerRef.current)

    const capi = new ContainerAPI(newDiv, props) as unknown as LogContainerAPI & BaseContainerAPI
    const logApp = new LogApp(capi)
    logAppRef.current = logApp

    logApp.start()
    logApp.emit(EventsKeys.LogMetaChange, {
      chain: props.chain,
      rank: props.rank,
      service: props.service,
    })

    const selectRankCallback = (params: WebEventParams[WebEventsKeys.invokeChangeLogRank]) => {
      if (params.chain_id !== props.chain.chain_id) return
      logApp.emit(EventsKeys.LogMetaChange, {
        chain: props.chain,
        rank: params.rank,
        service: props.service,
      })
    }

    const onThemeChange = (params: WebEventParams[WebEventsKeys.themeChange]) => {
      logApp.emit(EventsKeys.ThemeChange, {
        theme: params.newTheme,
      })
    }

    logApp.emit(EventsKeys.VisibilityChanged, visibleRef.current)

    hfEventEmitter.on(WebEventsKeys.invokeChangeLogRank, selectRankCallback)
    hfEventEmitter.on(WebEventsKeys.themeChange, onThemeChange)

    // eslint-disable-next-line consistent-return
    return () => {
      LevelLogger.info('log app stop')
      hfEventEmitter.off(WebEventsKeys.invokeChangeLogRank, selectRankCallback)
      hfEventEmitter.off(WebEventsKeys.themeChange, onThemeChange)
      logAppRef.current = null
      logApp.stop()
    }
    // hint: attention!: 这里如果加 visible 会在切换 tab 的时候触发一个连续的 stop 和 render
    // 这个时候 react 会有问题，导致 useEffect 的取消函数不能正确的被执行！
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delayInit, props.chain, props.rank, props.service])

  useEffect(() => {
    visibleRef.current = props.visible
    if (logAppRef.current) {
      logAppRef.current.emit(EventsKeys.VisibilityChanged, visibleRef.current)
    }
  }, [props.visible])

  // eslint-disable-next-line react/jsx-no-useless-fragment
  if (delayInit) return <></>
  return <div className="hf hf-log-web-container" ref={containerRef} />
})

export default LogViewer
