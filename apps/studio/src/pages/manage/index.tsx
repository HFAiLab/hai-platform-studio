/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ApiServerApiName } from '@hai-platform/client-api-server'
import type { DropDirection, LayoutBase, TabData } from '@hai-platform/rc-dock/es'
import { DividerBox, DockLayout } from '@hai-platform/rc-dock/es'
import type { Chain } from '@hai-platform/studio-pages/lib'
import { createChain } from '@hai-platform/studio-pages/lib'
import type { OpenURLInNewTabParams } from '@hai-platform/studio-pages/lib/entries/experiment2/schema'
import type { ChartBlockProps } from '@hai-platform/studio-pages/lib/entries/perf/widgets/ChartBlock'
import { useRefState } from '@hai-platform/studio-pages/lib/hooks/useRefState'
import React, { useContext, useReducer, useRef } from 'react'
import { useEffectOnce, useUpdateEffect } from 'react-use/esm'
import { GlobalApiServerClient } from '../../api/apiServer'
import { baseContainerAPI } from '../../api/base'
import { WebEventsKeys, hfEventEmitter } from '../../modules/event'
import { getCombineSettingsLazy, getCombineSettingsUnsafe } from '../../modules/settings'
import { GlobalContext } from '../../reducer/context'
import { AilabCountly, CountlyEventKey } from '../../utils/countly'
import { LevelLogger } from '../../utils/log'
import {
  ExpGroup,
  MainGroups,
  computeVisibleLogIds,
  getIframeDock,
  getLogDock,
  getMainLayout,
  getPerfDock,
  getRightLayout,
  trainingsTabId,
  updateTabActiveStyle,
} from './helper'
import { ReducerActions, initialState, reducer } from './reducer'
import { ManagePageContext } from './reducer/context'
import {
  checkIsLogTabByTabId,
  checkIsPerfTabByTabId,
  getIdByTabId,
  getLogDockIdByChainId,
  getPerfDockIdByChainId,
} from './utils'

declare global {
  interface Window {
    _debug_getDocks: () => unknown
  }
}

const ManagePage = () => {
  const [state, dispatch] = useReducer(reducer, initialState)
  const globalContext = useContext(GlobalContext)
  const docRef = useRef<DockLayout | null>(null)
  const [logDocLists, logDockListRef, setLogDockLists] = useRefState<string[]>([])
  const [perfDocLists, perfDocListsRef, updatePerfDockLists] = useRefState<string[]>([])

  const currentSideBarChainId = useRef<string>()
  const lastHandleClickPanelTimeStamp = useRef<number | null>()

  window._debug_getDocks = () => {
    return docRef.current!.getLayout()
  }

  const highlightSomeTab = (tabId: string) => {
    const tabDivs = [...document.getElementsByClassName('dock-tab')]
    tabDivs.forEach((tabDiv) => {
      const tab = tabDiv.children[0]
      if (!tab) return
      if (tabId && tab.id.includes(tabId)) {
        tab.classList.add('dock-tab-highlight')
      } else {
        tab.classList.remove('dock-tab-highlight')
      }
    })
  }

  // hint: 由于可能被用户移动，它的 parent 不见得就是 tr 了
  const getTrainingsParentId = () => {
    const tabData = docRef.current!.find(trainingsTabId) as TabData
    return tabData.parent!.id!
  }

  // ATTENTION: hint: 此函数，不能使用实时 state!
  const addPerfDock = (perfProps: Partial<ChartBlockProps>) => {
    AilabCountly.safeReport(CountlyEventKey.perfOpen)
    highlightSomeTab('')

    // eslint-disable-next-line no-param-reassign
    perfProps = {
      rank: 0,
      type: 'gpu',
      continuous: true,
      dataInterval: '5min',
      ...perfProps,
    }

    const newTabId = getPerfDockIdByChainId(perfProps.chain!.chain_id)
    const newTab = getPerfDock(newTabId, {
      perfProps: perfProps as ChartBlockProps,
      addPerfDock,
    })
    // step1 判断有没有
    // step2 if perfs? add perfs after; else
    // step3 if logs? add log after; else
    // step4 add trains after
    const tabData = docRef.current!.find(newTabId)
    if (tabData) {
      docRef.current!.updateTab(newTabId, tabData as TabData)
      const dom = [...document.getElementsByClassName('dock-tab-btn')].filter((item) => {
        return item.id.includes(newTabId)
      })[0]
      if (dom) updateTabActiveStyle(dom)
      return
    }

    if (perfDocListsRef.current.length) {
      const lastPerfId = perfDocListsRef.current[perfDocListsRef.current.length - 1]!
      docRef.current!.dockMove(newTab, lastPerfId, 'after-tab')
      updatePerfDockLists([...perfDocListsRef.current, newTabId])
      return
    }

    if (logDockListRef.current.length) {
      const lastDocId = logDockListRef.current[logDockListRef.current.length - 1]!
      docRef.current!.dockMove(newTab, lastDocId, 'after-tab')
      updatePerfDockLists([...perfDocListsRef.current, newTabId])
      return
    }

    docRef.current!.dockMove(newTab, getTrainingsParentId(), 'bottom')
  }

  const addIframeDock = (config: OpenURLInNewTabParams) => {
    const newTab = getIframeDock({
      id: `${Date.now()}`,
      urlParams: config,
    })
    docRef.current!.dockMove(newTab, trainingsTabId, 'after-tab')
  }

  // ATTENTION: hint: 此函数，不能使用实时 state!
  const addLogDock = async (chain: Chain, rank: number) => {
    const currentLogDocLists = logDockListRef.current!
    AilabCountly.safeReport(CountlyEventKey.expLogOpen)

    const nextLogDockId = getLogDockIdByChainId(chain.chain_id)

    if (!currentLogDocLists.length) {
      const newTab = getLogDock({
        id: nextLogDockId,
        chain,
        rank,
      })
      docRef.current!.dockMove(newTab, getTrainingsParentId(), 'bottom')
      currentLogDocLists.push(nextLogDockId)
      setLogDockLists([...currentLogDocLists])
    } else if (currentLogDocLists.includes(nextLogDockId)) {
      // hint: 如果找到了，直接激活
      LevelLogger.info(`[log dock] find and active: ${chain.chain_id}`)
      const tabData = docRef.current!.find(nextLogDockId) as TabData
      docRef.current!.updateTab(nextLogDockId, tabData)
      const dom = [...document.getElementsByClassName('dock-tab-btn')].filter((item) => {
        return item.id.includes(nextLogDockId)
      })[0]
      if (dom) updateTabActiveStyle(dom)
      hfEventEmitter.emit(WebEventsKeys.invokeChangeLogRank, {
        chain_id: chain.chain_id,
        rank,
      })
      currentLogDocLists.splice(currentLogDocLists.indexOf(nextLogDockId), 1)
      currentLogDocLists.push(nextLogDockId)
      setLogDockLists([...currentLogDocLists])
    } else {
      // hint: 当前的并不活跃
      const { combineSettings } = await getCombineSettingsLazy()
      if (combineSettings && currentLogDocLists.length >= combineSettings.maxLogViewer) {
        const toBeRemoveId = currentLogDocLists.shift()!
        LevelLogger.info(`[log dock] remove: ${toBeRemoveId}`)
        const tabData = docRef.current!.find(toBeRemoveId) as TabData
        if (!tabData) {
          LevelLogger.error('[log dock] unexcepted tabData is null')
        }
        docRef.current!.dockMove(tabData, null, 'remove')
        setLogDockLists([...currentLogDocLists])
      }
      const newTab = getLogDock({
        id: nextLogDockId,
        chain,
        rank,
      })
      if (currentLogDocLists.length) {
        const lastId = currentLogDocLists[currentLogDocLists.length - 1]!
        LevelLogger.info(`[log dock] set after: ${lastId}`)
        docRef.current!.dockMove(newTab, lastId, 'after-tab')
      } else {
        LevelLogger.info('[log dock] set new')
        docRef.current!.dockMove(newTab, getTrainingsParentId(), 'bottom')
      }

      currentLogDocLists.push(nextLogDockId)
      setLogDockLists([...currentLogDocLists])
    }
  }

  // hint: 目前这里处理的主要逻辑是删除逻辑
  const onLayoutChange = (
    newLayout: LayoutBase,
    currentTabId?: string | undefined,
    direction?: DropDirection | undefined,
  ) => {
    // control DockLayout from state
    const activeLogIds = computeVisibleLogIds(newLayout)
    hfEventEmitter.emit(WebEventsKeys.logVisibleUpdated, activeLogIds)
    // console.log('onLayoutChange', currentTabId, newLayout, direction, logDocLists)
    if (!currentTabId) return
    if (
      checkIsLogTabByTabId(currentTabId) &&
      direction === 'remove' &&
      logDocLists.includes(currentTabId)
    ) {
      logDocLists.splice(logDocLists.indexOf(currentTabId), 1)
      setLogDockLists([...logDocLists])
      /**
       * 如果设置自动打开日志了，关掉了所有日志，我们认为此时没有选择实验
       * 这个做法是为了保持我们 URL 记忆的体验一致性
       */
      if (!logDocLists.length && getCombineSettingsUnsafe().combineSettings.autoShowLog) {
        dispatch({
          actionName: ReducerActions.UpdateSelectChain,
          payload: {
            currentSelectChain: null,
          },
        })
      }
    } else if (
      checkIsPerfTabByTabId(currentTabId) &&
      direction === 'remove' &&
      perfDocLists.includes(currentTabId)
    ) {
      perfDocLists.splice(perfDocLists.indexOf(currentTabId), 1)
      updatePerfDockLists([...perfDocLists])
      // console.log('after onLayoutChange perf:', perfDocLists);
    }
  }

  // 设置当前活跃的 Chain 为 manager 选的那一个
  const changeExpByManager = (chain: Chain) => {
    AilabCountly.safeReport(CountlyEventKey.expDetailOpen)
    dispatch({
      actionName: ReducerActions.UpdateSelectChain,
      payload: {
        currentSelectChain: chain,
      },
    })
    currentSideBarChainId.current = chain.chain_id
  }

  const onTabClick = (tabId: string) => {
    highlightSomeTab(tabId)
    let nextChainId: string | null = null
    const ifClickTrainingsId = tabId === trainingsTabId
    if (ifClickTrainingsId) {
      // hint: 实验 Tab 的当前 chain 是和其他 Tab 同步的，所以这里其实肯定应该是一样的才对
      return
    }

    nextChainId = getIdByTabId(tabId)

    if (!nextChainId) return
    if (nextChainId === state.currentSelectChain?.chain_id) return

    const currentTimeStamp = Date.now()
    lastHandleClickPanelTimeStamp.current = currentTimeStamp
    GlobalApiServerClient.request(ApiServerApiName.GET_USER_TASK, {
      chain_id: nextChainId,
    }).then(({ task }) => {
      if (lastHandleClickPanelTimeStamp.current !== currentTimeStamp) {
        // hint: 有了更新的请求所以去掉
        return
      }
      const chain = createChain(task, baseContainerAPI)
      dispatch({
        actionName: ReducerActions.UpdateSelectChain,
        payload: {
          currentSelectChain: chain,
        },
      })
    })
    // 根据 tabId 获取对应的 Chain
  }

  useEffectOnce(() => {
    setTimeout(() => {
      highlightSomeTab(trainingsTabId)
    })
  })

  useEffectOnce(() => {
    AilabCountly.safeReport(CountlyEventKey.pageManageMount)
  })

  const { selectChainId, defaultSelectLogOpen } = globalContext.state.expsPageManageState

  /**
   * 根据当前 log 是否处于打开状态，决定是否在 url 里面携带默认打开 log 的参数
   * 仅针对没有开启“自动打开日志”的情况有效
   */
  useUpdateEffect(() => {
    if (selectChainId) {
      const judgeLogID = getLogDockIdByChainId(selectChainId)
      const changeDefaultSelect = (defaultOpen: boolean) => {
        globalContext.dispatch([
          {
            type: 'expsPageManageState',
            value: {
              ...globalContext.state.expsPageManageState,
              defaultSelectLogOpen: defaultOpen,
            },
          },
        ])
      }
      if (logDocLists.includes(judgeLogID) && !defaultSelectLogOpen) {
        changeDefaultSelect(true)
      }
      if (!logDocLists.includes(judgeLogID) && defaultSelectLogOpen) {
        changeDefaultSelect(false)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logDocLists])

  return (
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    <ManagePageContext.Provider value={{ state, dispatch }}>
      <DividerBox
        style={{ position: 'absolute', left: 10, top: 55, right: 10, bottom: 10, minWidth: 1080 }}
      >
        <DockLayout
          ref={docRef}
          defaultLayout={getMainLayout({
            addLogDock,
            changeExpByManager,
            addPerfDock,
          })}
          onTabClick={onTabClick}
          onLayoutChange={onLayoutChange}
          groups={MainGroups}
          style={{ width: '85%' }}
        />
        <DockLayout
          defaultLayout={getRightLayout({
            containerProps: { addPerfDock, addLogDock, addIframeDock },
          })}
          groups={ExpGroup}
          style={{ width: '15%', minWidth: 270 }}
        />
      </DividerBox>
    </ManagePageContext.Provider>
  )
}

export default ManagePage
