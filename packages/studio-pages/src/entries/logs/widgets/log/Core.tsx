/* eslint-disable consistent-return */
import type { TaskLogRestartLogMap } from '@hai-platform/client-api-server'
import { ApiServerApiName } from '@hai-platform/client-api-server'
import { i18n, i18nKeys } from '@hai-platform/i18n'
import { HFNoCacheHeader } from '@hai-platform/shared'
import { LogErrors, SubscribeCommands } from '@hai-platform/studio-schemas/lib/esm'
import type { SubPayload, SubQueryParams } from '@hai-platform/studio-schemas/lib/esm'
import { Button, FormGroup, InputGroup } from '@hai-ui/core'
import classNames from 'classnames'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { useQuery } from 'react-query'
import { useEffectOnce } from 'react-use/esm'
// eslint-disable-next-line import/no-cycle
import { ServiceContext } from '../..'
import { CONSTS } from '../../../../consts'
import { usePageFocus } from '../../../../hooks/usePageFocus'
import type { Chain } from '../../../../model/Chain'
import { createChain } from '../../../../model/Chain'
import { IOFrontier } from '../../../../socket'
import { alertDialog } from '../../../../ui-components/dialog'
import { ReactErrorBoundary } from '../../../../ui-components/errorBoundary'
import { JobComponent } from '../../../../ui-components/jobCell'
import { getNameSpace } from '../../../../utils'
import { PageGlobalEventEmitter } from '../../../../utils/pageGlobalEmitter'
import { queryClient } from '../../query'
import { LogServiceNames } from '../../schema'
import type { LogMeta, ThemeConfig } from '../../schema/event'
import { EventsKeys } from '../../schema/event'
import type { IOButtonStatus } from './Header'
import { HeaderComponent } from './Header'

import type { IncrementalLog } from './monaco'

const MonacoViewer = React.lazy(() => import(/* webpackChunkName: "dyn-log-monaco" */ './monaco'))

enum WordWrapEnums {
  on = 'on',
  off = 'off',
}

const MonacoLoading = () => {
  return (
    <div className="monaco-loading">
      <p>Core Module Initializing</p>
    </div>
  )
}

const MonacoLoadError = () => {
  useEffect(() => {
    alertDialog(
      '核心模块加载失败，可能是由于容器重启后文件缺失，请保存文件后刷新整个页面',
      'Core Module Load Error',
    )
  }, [])
  return (
    <div className="monaco-load-error">
      <p className="error-title">Core Module Load Error</p>
      <p className="error-desc">{i18n.t(i18nKeys.biz_dynamic_module_load_error)}</p>
    </div>
  )
}

function spArr<T>(arr: T[], num: number): T[][] {
  // arr 是你要分割的数组，num 是以几个为一组
  const newArr = []
  for (let i = 0; i < arr.length; ) {
    newArr.push(arr.slice(i, (i += num)))
  }
  return newArr
}

export const CoreLogViewer: React.FC<{
  ioButtonStatus?: IOButtonStatus
  handleIOClick?(): void
  sysLog?: string
  userLog?: string
  restartLog?: TaskLogRestartLogMap
  error: any
  isFetching: boolean
  errorMsg: string | null
  setCurrentChainAndRank: (chain: Chain | null, rank: number, service?: string) => void
  currentChain: Chain | null
  currentRank: number
  showSystemLog: boolean
  IORawLogReInit?: number
  setShowSystemLog: (show: boolean) => void
  setIsVisible?: (visible: boolean) => void
  handleRefreshClick: () => void
  incrementalLog?: IncrementalLog
}> = (props) => {
  const srvc = useContext(ServiceContext)
  const chain_id = props.currentChain?.chain_id
  const [showLineTime, setShowLineTime] = useState(false)
  const [wordWrap, setWordWrap] = useState<WordWrapEnums>(WordWrapEnums.off)
  const [showSearch] = useState(false) // 点击即聚焦，不设置高亮态
  const containerTheme = srvc.state.theme
  const handleCR = srvc.app.api().invokeService(LogServiceNames.getHandleCR, null)
  const isShowHeader = true
  const [miniMapEnabled, setMiniMapEnabled] = useState(true)
  const [invokeFind, setInvokeFind] = useState(0)
  const [globalSearchContent, setGlobalSearchContent] = useState('')
  const [globalSearchRankResult, setGlobalSearchRankResult] = useState<number[]>([])
  const [globalSearchRankResultReturned, setGlobalSearchRankResultReturned] = useState(false)
  const [globalSearchContainerShow, setGlobalSearchContainerShow] = useState(false)
  const [globalOrderMethod, setGlobalOrderMethod] = useState<'rank' | 'frequency'>('rank')

  const globalSearchRankResultFormatted = globalSearchRankResult
    .map((times, index) => {
      return {
        times,
        id: index,
      }
    })
    .sort((a, b) => {
      if (globalOrderMethod === 'rank') return a.id - b.id

      if (a.times === b.times) return a.id - b.id
      return b.times - a.times
    })

  const logMetaChangeHandler = (logMetaInfo: LogMeta) => {
    const nextChain = logMetaInfo.chain
    const nextRank = logMetaInfo.rank
    const nextService = logMetaInfo.service

    if (nextChain == null) return
    props.setCurrentChainAndRank(nextChain, nextRank, nextService)
  }

  // 初始化一次
  useEffect(() => {
    // only for first time:
    const cChain = srvc.app.api().invokeService(LogServiceNames.getCurrentLogChain, null)
    const cRank = srvc.app.api().invokeService(LogServiceNames.getCurrentLogRank, null)
    const cService = srvc.app.api().invokeService(LogServiceNames.getCurrentLogService, null)

    if (cChain !== props.currentChain || cRank !== props.currentRank) {
      props.setCurrentChainAndRank(cChain, cRank, cService)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const visibilityChangedHandler = (visible: boolean) => {
    if (props.setIsVisible) props.setIsVisible(visible)
  }

  function updateTheme(themeConfig: ThemeConfig) {
    srvc.dispatch({ type: 'theme', value: themeConfig.theme })
  }

  const handleRefreshClick = () => {
    srvc.app
      .api()
      .getLogger()
      .info(
        `handleRefreshClick, chain_id: ${chain_id}, rank: ${props.currentRank}, showSystemLog: ${props.showSystemLog}`,
      )
    props.handleRefreshClick()
  }

  const onLogRefresh = (meta: LogMeta) => {
    if (meta.chain?.chain_id !== props.currentChain?.chain_id || meta.rank !== props.currentRank) {
      return
    }
    // if (meta.chain?.chain_status == 'finished') return;
    handleRefreshClick()
  }

  const handleShowSearchClick = () => {
    // srvc.app.emit(EventsKeys.ShowMonacoFind, null); // 因为避免 monaco lazy component 引入太多内容，所以这里不引入 emit
    setInvokeFind(invokeFind + 1)
  }

  const handleShowLineTimeClick = () => {
    setShowLineTime(!showLineTime)
  }

  const handleRankSelect = (rank: number) => {
    srvc.app.api().invokeService(LogServiceNames.invokeRankChanged, rank)
  }

  const handleShowSyslogClick = () => {
    const nextShowSystemLog = !props.showSystemLog
    props.setShowSystemLog(!props.showSystemLog)
    if (nextShowSystemLog) {
      setMiniMapEnabled(false)
    } else {
      setMiniMapEnabled(true)
    }
  }

  const handleWordWrapClick = () => {
    const nextWordWrap = wordWrap === WordWrapEnums.on ? WordWrapEnums.off : WordWrapEnums.on
    setWordWrap(nextWordWrap)
  }

  const handleMiniMapClick = () => {
    const nextMiniMapEnabled = !miniMapEnabled
    setMiniMapEnabled(nextMiniMapEnabled)
  }

  const handleGlobalSearchClick = () => {
    if (!globalSearchContent) {
      setGlobalSearchRankResultReturned(false)
      setGlobalSearchRankResult([])
      return
    }
    srvc.app
      .api()
      .getApiServerClient()
      .request(ApiServerApiName.SEARCH_IN_GLOBAL, {
        chain_id: chain_id!,
        content: globalSearchContent,
      })
      .then((res) => {
        setGlobalSearchRankResultReturned(true)
        if (res) {
          setGlobalSearchRankResult(res.data)
        }
      })
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleGlobalSearchClick()
    }
  }

  const handleSearchContainerKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setGlobalSearchContainerShow(false)
    }
  }

  const toggleGlobalContainerShow = () => {
    setGlobalSearchContainerShow(!globalSearchContainerShow)
  }

  const IfShowSyslogBanner =
    !props.showSystemLog &&
    props.currentChain &&
    ['stopped', 'failed'].includes(props.currentChain.worker_status) &&
    props.sysLog
  const LastSysLogLine = IfShowSyslogBanner
    ? props.sysLog
        ?.replace(/[\r\n]$/g, '')
        .split('\n')
        .pop()
    : ''

  useEffect(() => {
    // HINT 涉及到事件监听的地方，需要每次都重新监听，否则可能因为闭包而捕获到旧的变量
    srvc.app.on(EventsKeys.LogMetaChange, logMetaChangeHandler)
    srvc.app.on(EventsKeys.LogRefresh, onLogRefresh)
    srvc.app.on(EventsKeys.ThemeChange, updateTheme)
    srvc.app.on(EventsKeys.VisibilityChanged, visibilityChangedHandler)
    return () => {
      srvc.app.off(EventsKeys.LogRefresh, onLogRefresh)
      srvc.app.off(EventsKeys.LogMetaChange, logMetaChangeHandler)
      srvc.app.off(EventsKeys.ThemeChange, updateTheme)
      srvc.app.off(EventsKeys.VisibilityChanged, visibilityChangedHandler)
    }
  })

  return (
    <div className="hf-log-container">
      <HeaderComponent
        ioButtonStatus={props.ioButtonStatus}
        handleIOClick={props.handleIOClick}
        chain={props.currentChain!}
        selectedRank={props.currentRank!}
        show={isShowHeader}
        showLineTime={showLineTime}
        showSearch={showSearch}
        wordWrap={wordWrap}
        showSyslog={props.showSystemLog}
        miniMapEnabled={miniMapEnabled}
        globalSearchContainerShow={globalSearchContainerShow}
        handleShowSearchClick={handleShowSearchClick}
        handleShowLineTimeClick={handleShowLineTimeClick}
        handleRankSelect={handleRankSelect}
        handleShowSyslogClick={handleShowSyslogClick}
        handleRefreshClick={handleRefreshClick}
        handleWordWrapClick={handleWordWrapClick}
        handleMiniMapClick={handleMiniMapClick}
        toggleGlobalContainerShow={toggleGlobalContainerShow}
      />
      {IfShowSyslogBanner && (
        <div className="sys-log-brief">
          <div className="brief-line-tip">[System Log]</div>
          <p className="brief-content" title={LastSysLogLine}>
            {LastSysLogLine}
          </p>
          <div className="brief-more" onClick={handleShowSyslogClick}>
            <a>More</a>
          </div>
        </div>
      )}
      {globalSearchContainerShow && (
        <div className="global-search-container" onKeyDown={handleSearchContainerKeyDown}>
          <FormGroup className="global-search-group">
            <InputGroup
              className="global-search-form-group"
              value={globalSearchContent}
              onChange={(e) => {
                setGlobalSearchContent(e.target.value)
              }}
              id="text-input"
              autoFocus
              placeholder={i18n.t(i18nKeys.biz_search_global_placeholder)}
              onKeyDown={handleSearchKeyDown}
            />
            <span
              className={`${getNameSpace()}-icon search-icon ${getNameSpace()}-icon-search`}
              onClick={handleGlobalSearchClick}
            />
          </FormGroup>
          {globalSearchRankResultReturned && !globalSearchRankResultFormatted.length && (
            <div className="global-search-result empty">
              <div>{i18n.t(i18nKeys.biz_search_global_no_node_found)}</div>
            </div>
          )}
          {!!globalSearchRankResultFormatted.length && (
            <>
              <div className="global-search-result-header">
                {new Array(3).fill(0).map(() => (
                  <div className={classNames('search-flex-item', 'search-title')}>
                    <div className={classNames('search-flex-item-1')}>Rank</div>
                    <div className={classNames('search-flex-item-2')}>
                      {i18n.t(i18nKeys.biz_search_global_count)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="global-search-result">
                {props.currentChain &&
                  props.currentChain?.pods &&
                  spArr(globalSearchRankResultFormatted, 3).map((items) => {
                    return items.map((item) => {
                      return (
                        <div className={classNames('search-flex-item', 'search-content')}>
                          <div className={classNames('search-flex-item-1')}>
                            <JobComponent
                              rank={item.id}
                              clickHandler={() => {
                                handleRankSelect(item.id)
                              }}
                              key={item.id}
                              pod={props.currentChain!.pods[item.id]!}
                            />
                          </div>
                          <div className={classNames('search-flex-item-2 search-content-times')}>
                            {item.times}
                          </div>
                        </div>
                      )
                    })
                  })}
              </div>
              <div className="global-search-order">
                <div>
                  Order:{' '}
                  <Button
                    active={globalOrderMethod === 'rank'}
                    onClick={() => {
                      setGlobalOrderMethod('rank')
                    }}
                    small
                    minimal
                  >
                    Rank
                  </Button>{' '}
                  |{' '}
                  <Button
                    active={globalOrderMethod === 'frequency'}
                    onClick={() => {
                      setGlobalOrderMethod('frequency')
                    }}
                    small
                    minimal
                  >
                    {i18n.t(i18nKeys.biz_search_global_count)}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
      {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
      <ReactErrorBoundary errorComp={<MonacoLoadError />}>
        <React.Suspense fallback={<MonacoLoading />}>
          <MonacoViewer
            showLineTime={showLineTime}
            showSystemLog={props.showSystemLog}
            rawLog={props.showSystemLog ? props.sysLog : props.userLog}
            restartLog={props.restartLog}
            containerTheme={containerTheme}
            handleCR={handleCR}
            isFetching={props.isFetching}
            miniMapEnabled={miniMapEnabled}
            wordWrap={wordWrap}
            invokeFind={invokeFind}
            id_list={props.currentChain?.id_list || []}
            incrementalLog={props.incrementalLog}
            IORawLogReInit={props.IORawLogReInit}
          />
        </React.Suspense>
      </ReactErrorBoundary>
      {props.error && (
        <div className="hflog-error-container">
          <p>{props.errorMsg}</p>
        </div>
      )}
    </div>
  )
}

export const HTTPLogViewer = () => {
  const srvc = useContext(ServiceContext)
  const currentChain = srvc.state.chain
  const currentRank = srvc.state.rank
  const currentService = srvc.state.service
  const [showSystemLog, setShowSystemLog] = useState(false)
  const chain_id = currentChain?.chain_id
  const [IORawLogReInit, setIORawLogReInit] = useState(Date.now())

  const userToken = srvc.app.api().getToken()

  const {
    error: HTTPError,
    data: HTTPrawLog,
    isFetching: isHTTPFetching,
  } = useQuery(
    ['hfapp-log', { chain_id, rank: currentRank, showSystemLog, service: currentService }],
    () => {
      const api = srvc.app.api()
      const apiServerClient = api.getApiServerClient()
      api
        .getLogger()
        .info(`[hfapp-log] begin-query, c: ${chain_id}, r: ${currentRank}, s: ${showSystemLog}`)
      if (!chain_id) {
        return {
          log: 'init...',
          sysLog: '',
          restartLog: undefined,
        }
      }
      const expQuery = apiServerClient.request(
        ApiServerApiName.GET_USER_TASK,
        { chain_id, token: userToken },
        {
          headers: {
            ...HFNoCacheHeader,
          },
        },
      )
      const logQuery = showSystemLog
        ? apiServerClient
            .request(ApiServerApiName.GET_TASK_SYS_LOG, { chain_id, token: userToken })
            .then((log) => {
              return {
                log: '',
                sysLog: log.data || '',
                restartLog: undefined,
              }
            })
        : apiServerClient
            .request(ApiServerApiName.GET_TASK_LOG, {
              chain_id,
              rank: currentRank,
              service: currentService,
              token: userToken,
            })
            .then((logInfo) => {
              return {
                log: logInfo.data,
                sysLog: logInfo.error_msg,
                restartLog: logInfo.restart_log,
              }
            })
      return Promise.all([expQuery, logQuery]).then((values) => {
        const [{ task }, rawLog] = values
        const newChain = createChain(task, srvc.app.api())
        srvc.dispatch({ type: 'chain', value: newChain })
        return rawLog
      })
    },
    {
      staleTime: Number.MAX_SAFE_INTEGER,
    },
  )

  const userLog = HTTPrawLog?.log
  const sysLog = HTTPrawLog?.sysLog
  const restartLog = HTTPrawLog?.restartLog
  const error = Boolean(HTTPError)
  const isFetching = isHTTPFetching
  const errorMsg = error ? 'Get Log Failed' : null

  useEffect(() => {
    setIORawLogReInit(Date.now())
  }, [HTTPrawLog])

  const handleRefreshClick = () => {
    srvc.app
      .api()
      .getLogger()
      .info(
        `invalidateQueries, chain_id: ${chain_id}, rank: ${currentRank}, showSystemLog: ${showSystemLog}, service: ${currentService}`,
      )
    queryClient.invalidateQueries([
      'hfapp-log',
      { chain_id, rank: currentRank, showSystemLog, service: currentService },
    ])
  }

  const setCurrentChainAndRank = (
    nextChain: Chain | null,
    nextRank: number,
    nextService?: string,
  ) => {
    srvc.dispatch({ type: 'chain', value: nextChain })
    srvc.dispatch({ type: 'rank', value: nextRank })
    srvc.dispatch({ type: 'service', value: nextService })

    queryClient.invalidateQueries([
      'hfapp-log',
      { chain_id: nextChain?.chain_id, rank: nextRank, showSystemLog, service: nextService },
    ])
  }

  const canSwitchToIO = IOFrontier.getInstance().isConnected()
  const switchToIO = () => {
    srvc.app.setReqType('io')
  }

  return (
    <CoreLogViewer
      handleIOClick={switchToIO}
      ioButtonStatus={canSwitchToIO ? 'off' : 'disabled'}
      showSystemLog={showSystemLog}
      IORawLogReInit={IORawLogReInit}
      currentChain={currentChain}
      currentRank={currentRank}
      setCurrentChainAndRank={setCurrentChainAndRank}
      userLog={userLog}
      sysLog={sysLog}
      restartLog={restartLog}
      error={error}
      isFetching={isFetching}
      errorMsg={errorMsg}
      handleRefreshClick={handleRefreshClick}
      setShowSystemLog={setShowSystemLog}
    />
  )
}

export const IOLogViewer = () => {
  const srvc = useContext(ServiceContext)

  const currentChain = srvc.state.chain
  const currentChainRef = useRef(currentChain)
  const currentRank = srvc.state.rank
  const currentService = srvc.state.service
  const [showSystemLog, setShowSystemLog] = useState(false)
  const chain_id = currentChain?.chain_id

  // IO state
  const [IOrawLog, setIOrawLog] = useState('')
  const [restartLog, setRestartLog] = useState<TaskLogRestartLogMap | undefined>(undefined)
  const IORawLogRef = useRef('')
  const [IORawLogReInit, setIORawLogReInit] = useState(Date.now())
  const [IOsysLog, setIOsysLog] = useState('')
  const frontierId = useRef<number | null>(null)
  const [IOErrMsg, setIOErrMsg] = useState<string | null>('')
  const [isIOFetching, setIsIOFetching] = useState(false)
  const isVisible = srvc.state.visibility
  const [incrementalLog, setIncrementalLog] = useState<IncrementalLog>({
    updateTime: Date.now(),
    content: '',
    frontierId: -1,
  })
  const [resumeTimeStamp, setResumeTimestamp] = useState<number | null>(null)

  // setResumeTimestamp 相当于是比 refresh 更彻底的刷新
  usePageFocus(() => {
    setResumeTimestamp(Date.now())
  })

  // IO state end

  const setIsVisible = (visible: boolean) => {
    srvc.dispatch({ type: 'visibility', value: visible })
  }

  // IO fetch
  useEffect(() => {
    srvc.app
      .api()
      .getLogger()
      .info(
        `log in Effect, showName: ${currentChain?.showName}, isVisible: ${isVisible}, currentRank: ${currentRank}, currentChain?.chain_id: ${currentChain?.chain_id}, showSystemLog: ${showSystemLog}`,
      )

    if (frontierId.current !== null) {
      srvc.app.api().getLogger().info(`<Logviewer> unsub frontierId:${frontierId.current}`)
      IOFrontier.getInstance().unsub(frontierId!.current)
      frontierId.current = null
    }

    if (!isVisible) {
      srvc.app.api().getLogger().info(`<Logviewer> isVisible:${isVisible}, skip sub`)
      return
    }
    if (!currentChain) {
      srvc.app.api().getLogger().info(`<Logviewer> no_current_chain unsub frontierId:${frontierId}`)
      return
    }
    setIsIOFetching(true)

    const inIns = IOFrontier.getInstance()
    const currentId = showSystemLog
      ? inIns.sub<SubQueryParams[SubscribeCommands.SysLog]>(
          SubscribeCommands.SysLog,
          {
            query: {
              chainId: chain_id!,
              token: srvc.app.api().getToken(),
            },
          },
          (payload: SubPayload<SubscribeCommands.SysLog>) => {
            setIsIOFetching(false)
            const { content } = payload
            if (!content) {
              srvc.app
                .api()
                .getHFUIToaster()
                ?.show({
                  message: i18n.t(i18nKeys.socket_get_logs_failed),
                })
              return
            }
            if (content.success) {
              setIOsysLog(content.data ?? '')
              setIOErrMsg(null)
              setIORawLogReInit(Date.now())
            } else {
              setIOErrMsg(content.msg ?? 'get syslog failed: unknown err')
              setIORawLogReInit(Date.now())
            }
          },
        )
      : inIns.sub<SubQueryParams[SubscribeCommands.Log]>(
          SubscribeCommands.Log,
          {
            query: {
              key: chain_id!,
              queryType: 'chainId',
              rank: currentRank,
              token: srvc.app.api().getToken(),
              service: currentService,
            },
          },
          (payload: SubPayload<SubscribeCommands.Log>) => {
            setIsIOFetching(false)
            const { content } = payload

            if (!content) {
              srvc.app
                .api()
                .getHFUIToaster()
                ?.show({
                  message: i18n.t(i18nKeys.socket_get_logs_failed),
                })
              return
            }

            setIOsysLog(content.error_msg ?? '')
            setRestartLog(content.restart_log) // hint: restartLog 要在 setIORawLogReInit 之前
            if (typeof content.fullLog === 'string') {
              setIOrawLog(content.fullLog)
              IORawLogRef.current = content.fullLog
              setIORawLogReInit(Date.now())
            } else if (content.data) {
              IORawLogRef.current += content.data
              setIOrawLog(IORawLogRef.current)
              setIncrementalLog({
                updateTime: Date.now(),
                content: content.data,
                frontierId: frontierId.current,
              })
            }

            if (content.chain) {
              srvc.dispatch({
                type: 'chain',
                value: createChain(content.chain, srvc.app.api()),
              })
            }

            if (content.success === 1) {
              setIOErrMsg(null)
            } else {
              switch (content.msg) {
                case LogErrors.GetLogFailed:
                  setIOErrMsg(
                    `Request failed (Get log content failed, Wll automatically retry in a few seconds)`,
                  )
                  break
                case LogErrors.LookUpChainFailed:
                  setIOErrMsg(`Get chain info timeout: ${payload.query.key}`)
                  break
                case LogErrors.RankOutOfRange:
                  srvc.dispatch({ type: 'rank', value: 0 })
                  break
                default:
                  setIOErrMsg(`Get Log Failed: ${content.msg}`)
              }
            }
          },
        )
    srvc.app.api().getLogger().info(`<Logviewer>logger sub success: id: ${currentId}`)
    frontierId.current = currentId
    return () => {
      srvc.app
        .api()
        .getLogger()
        .info(
          `<Logviewer>logger unsub: ${frontierId.current}, (unsafe)chain_id: ${currentChain?.chain_id}`,
        )
      if (frontierId.current) IOFrontier.getInstance().unsub(frontierId.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentChain?.chain_id,
    currentRank,
    showSystemLog,
    isVisible,
    resumeTimeStamp,
    srvc.state.service,
  ])

  const handleRefreshClick = () => {
    if (frontierId.current) {
      IOFrontier.getInstance().expireById(frontierId.current)
    }
  }

  const userLog = IOrawLog
  const sysLog = IOsysLog
  const error = Boolean(IOErrMsg)
  const isFetching = isIOFetching
  const errorMsg = IOErrMsg

  const setCurrentChainAndRank = (
    nextChain: Chain | null,
    nextRank: number,
    nextService?: string,
  ) => {
    srvc.dispatch({ type: 'chain', value: nextChain })
    srvc.dispatch({ type: 'rank', value: nextRank })
    srvc.dispatch({ type: 'service', value: nextService })
  }

  const switchToHTTP = () => {
    srvc.app.setReqType('http')
  }

  // 其他页面点击了恢复按钮；
  const resumeChainIdCallback = (e: StorageEvent) => {
    if (document.visibilityState !== 'visible') {
      return
    }
    if (e.key !== CONSTS.EXPS_LAST_RESUME_CHAIN_ID_LIST) return
    const chainIds = JSON.parse(e.newValue || '[]')
    if (currentChainRef.current?.chain_id && chainIds.includes(currentChainRef.current.chain_id)) {
      handleRefreshClick()
    }
  }

  useEffectOnce(() => {
    window.addEventListener('storage', resumeChainIdCallback)
    return () => {
      window.removeEventListener('storage', resumeChainIdCallback)
    }
  })

  // 当前页面点击了恢复按钮：
  const localResumeChainIdCallback = (chainIds: string[]) => {
    if (document.visibilityState !== 'visible') {
      return
    }
    if (currentChainRef.current?.chain_id && chainIds.includes(currentChainRef.current.chain_id)) {
      handleRefreshClick()
    }
  }

  useEffectOnce(() => {
    PageGlobalEventEmitter.on(CONSTS.EXPS_LAST_RESUME_CHAIN_ID_LIST, localResumeChainIdCallback)
    return () => {
      PageGlobalEventEmitter.off(CONSTS.EXPS_LAST_RESUME_CHAIN_ID_LIST, localResumeChainIdCallback)
    }
  })

  return (
    <CoreLogViewer
      ioButtonStatus="on"
      handleIOClick={switchToHTTP}
      showSystemLog={showSystemLog}
      currentChain={currentChain}
      currentRank={currentRank}
      restartLog={restartLog}
      setCurrentChainAndRank={setCurrentChainAndRank}
      userLog={userLog}
      sysLog={sysLog}
      incrementalLog={incrementalLog}
      error={error}
      isFetching={isFetching}
      errorMsg={errorMsg}
      setIsVisible={setIsVisible}
      IORawLogReInit={IORawLogReInit}
      handleRefreshClick={handleRefreshClick}
      setShowSystemLog={setShowSystemLog}
    />
  )
}
