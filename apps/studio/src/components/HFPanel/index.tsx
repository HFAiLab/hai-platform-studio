/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { i18n, i18nKeys } from '@hai-platform/i18n'
import { ReactErrorBoundary } from '@hai-platform/studio-pages/lib/ui-components/errorBoundary'
import { HFLoading, HFLoadingError } from '@hai-platform/studio-pages/lib/ui-components/HFLoading'
import { SVGWrapper } from '@hai-platform/studio-pages/lib/ui-components/svgWrapper'
import classNames from 'classnames'
import React, { useEffect, useRef, useState } from 'react'
import type { DraggableProvidedDragHandleProps } from 'react-beautiful-dnd'
import useEffectOnce from 'react-use/esm/useEffectOnce'
import { v4 as uuidv4 } from 'uuid'
import PanelDndDrag from '../../components/svg/panel-dnd-drag.svg?raw'
import PanelDndMoveDown from '../../components/svg/panel-dnd-move-down.svg?raw'
import { CONSTS } from '../../consts'
import { WebEventsKeys, hfEventEmitter } from '../../modules/event'
import type { HomePanelNames } from '../../modules/settings/config'
import { PanelMetaInfoMap } from '../../pages/home/biz-comps/DND/dndConfig'
import { RuntimeErrorBoundaryFallback } from '../ErrorBoundary'
import { GlobalPanelController } from './controller'
import { LoadingStatus } from './schema'
import type { HFPanelCollapseProps } from './schema'

import './index.scss'

export { LoadingStatus } from './schema'
export type { HFPanelCollapseProps } from './schema'

type HFPanelProps = {
  title?: string
  panelName?: HomePanelNames
  flex?: number
  className?: string
  // eslint-disable-next-line react/no-unused-prop-types
  shadow?: boolean
  defaultVisibility?: 'show' | 'hide'
  disableLoading?: boolean
  dragHandleProps?: DraggableProvidedDragHandleProps
  collapseProps?: HFPanelCollapseProps
  nanoTopPadding?: boolean
  noPadding?: boolean
} & React.HTMLAttributes<HTMLElement>

export const HFPanelContext = React.createContext<{
  setVisibility: (visible: 'show' | 'hide') => any
  setLoadingSuccess: () => any
  setLoadingError: () => any
  setLoadingStatus: (loadingStatus: LoadingStatus) => any
  retryFlag: string
  loadingStatus: LoadingStatus
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error because not effect online
}>({
  retryFlag: '',
})

const AniDurationS = 0.5

export const HFPanel: React.FC<HFPanelProps> = (props: HFPanelProps) => {
  const [visibility, setVisibility] = useState(props.defaultVisibility ?? 'show')
  const [loadingStatus, setLoadingStatus] = useState(
    props.disableLoading ? LoadingStatus.success : LoadingStatus.init,
  )
  const [retryFlag, setRetryFlag] = useState('')
  const domRef = useRef<HTMLDivElement>(null)

  const setLoadingSuccess = () => {
    setLoadingStatus(LoadingStatus.success)
  }

  const setLoadingError = () => {
    setLoadingStatus(LoadingStatus.error)
  }

  const handleRefresh = () => {
    setRetryFlag(uuidv4())
  }

  useEffectOnce(() => {
    hfEventEmitter.on(WebEventsKeys.refreshDashboard, handleRefresh)
    return () => {
      hfEventEmitter.off(WebEventsKeys.refreshDashboard, handleRefresh)
    }
  })

  // 屏蔽 panel shadow, 内容多了之后可以不需要平面阴影装饰
  // const shadow = props.shadow ? 'shadow' : null
  const shadow = null

  const showHeaderContainer = props.dragHandleProps || props.title

  // 折叠动画实现：先做动画，动画做完了更新对应的数据结构
  const collapseHandler = () => {
    if (!domRef.current) return
    if (!props.collapseProps?.enable) return
    const currentDom = domRef.current as HTMLElement
    const currentParentDom = props.collapseProps.getDomContainer(currentDom)

    /*
     * 操作：
        内部的 dom 主要作用是维持排版布局的稳定
        我们需要操作外部 dom 容器来做动画
        目前这个只是一个非常简单的示意，后续可以增加更加复杂的动画
     */
    currentDom.style.width = `${currentDom.offsetWidth}px`
    currentDom.style.height = `${currentDom.offsetHeight}px`

    currentParentDom.style.width = `${currentParentDom.offsetWidth}px`
    currentParentDom.style.overflow = 'hidden'
    currentParentDom.style.height = `${currentParentDom.offsetHeight}px`

    currentParentDom.style.transition = `${AniDurationS}s`

    window.requestAnimationFrame(() => {
      currentParentDom.style.width = '0px'
      currentParentDom.style.height = '0px'
      currentParentDom.style.marginBottom = '0px'
    })

    if (props.collapseProps.onBegin) {
      props.collapseProps.onBegin()
    }

    setTimeout(() => {
      if (props.collapseProps?.onEnd) {
        props.collapseProps.onEnd()
      }
    }, AniDurationS * 1000)
  }

  /**
   * 判断这个面板出现的时候是不是需要动效
   * 当用户手动从 dock 部分点开一个面板的时候，应该是有动画展示的
   */
  useEffect(() => {
    if (!domRef.current) return
    if (!props.collapseProps?.enable) return
    if (!props.panelName) return
    if (!GlobalPanelController.hasEnterLoadingPanel(props.panelName)) return
    GlobalPanelController.removeEnterLoadingPanel(props.panelName)

    const currentDom = domRef.current as HTMLElement
    const currentParentDom = props.collapseProps.getDomContainer(currentDom)

    currentDom.style.width = `${CONSTS.HOME_PANEL_DEFAULT_WIDTH}px`
    currentDom.style.height = `max-content`

    currentParentDom.style.width = `0px`
    currentParentDom.style.overflow = 'hidden'
    currentParentDom.style.height = `0px`
    currentParentDom.style.transition = `${AniDurationS}s`

    window.requestAnimationFrame(() => {
      currentParentDom.style.width = `${currentDom.offsetWidth}px`
      currentParentDom.style.height = `${currentDom.offsetHeight}px`
      currentParentDom.style.minHeight = `100px`
      setTimeout(() => {
        currentParentDom.style.width = ``
        currentParentDom.style.height = ``
        currentParentDom.style.minHeight = ``
      }, AniDurationS * 1000)
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <HFPanelContext.Provider
      // eslint-disable-next-line react/jsx-no-constructed-context-values
      value={{
        setVisibility,
        setLoadingSuccess,
        setLoadingError,
        retryFlag,
        loadingStatus,
        setLoadingStatus,
      }}
    >
      <div
        ref={domRef}
        style={{ flex: props.flex ?? '' }}
        className={classNames('hf-panel', props.className, shadow, {
          'panel-hide': visibility === 'hide',
        })}
      >
        {showHeaderContainer && (
          <div className="header-container">
            {props.panelName && PanelMetaInfoMap[props.panelName] && (
              <SVGWrapper
                width="30px"
                dClassName="hf-panel-title-icon"
                height="30px"
                svg={PanelMetaInfoMap[props.panelName].icon}
              />
            )}
            {props.title && <header className="hf-panel-title">{props.title}</header>}
            <div className="flex-1" />
            {props.collapseProps && props.collapseProps.enable && (
              <div
                className="collapse-handler"
                title={i18n.t(i18nKeys.biz_home_dnd_minimize)}
                onClick={collapseHandler}
              >
                <SVGWrapper
                  width="20px"
                  dClassName="hf-panel-title-dnd-move-down"
                  height="20px"
                  svg={PanelDndMoveDown}
                />
              </div>
            )}
            {props.dragHandleProps && (
              <div
                className="panel-move-handler"
                title={i18n.t(i18nKeys.biz_home_dnd_drag_prompt)}
                {...props.dragHandleProps}
              >
                <SVGWrapper
                  width="20px"
                  dClassName="hf-panel-title-dnd-drag"
                  height="20px"
                  svg={PanelDndDrag}
                />
              </div>
            )}
          </div>
        )}
        <div
          className={classNames('children-container', {
            'nano-top-padding': props.nanoTopPadding,
            'no-padding': props.noPadding,
          })}
        >
          {(loadingStatus === LoadingStatus.init || loadingStatus === LoadingStatus.loading) && (
            <HFLoading />
          )}
          {loadingStatus === LoadingStatus.error && (
            <HFLoadingError
              retry={() => {
                setRetryFlag(uuidv4())
              }}
            />
          )}
          <ReactErrorBoundary errorComp={<RuntimeErrorBoundaryFallback />}>
            {props.children}
          </ReactErrorBoundary>
        </div>
      </div>
    </HFPanelContext.Provider>
  )
}
