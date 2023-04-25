/* eslint-disable no-alert */
import { Languages, i18n, i18nKeys } from '@hai-platform/i18n'
import { usePageVisible } from '@hai-platform/studio-pages/lib/hooks/usePageVisible'
import { useStorageChange } from '@hai-platform/studio-pages/lib/hooks/useStorageChange'
import { useVisibleInterval } from '@hai-platform/studio-pages/lib/hooks/useVisibleInterval'
import type { AllFatalErrorsType, ReportMetrics } from '@hai-platform/studio-pages/lib/socket'
import { IOFrontier, IoStatus, UserFatalError } from '@hai-platform/studio-pages/lib/socket'
import { ReactErrorBoundary } from '@hai-platform/studio-pages/lib/ui-components/errorBoundary'
import { HFLoading } from '@hai-platform/studio-pages/lib/ui-components/HFLoading'
import React, { Suspense, lazy, useEffect, useReducer, useState } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { useEffectOnce } from 'react-use'
import { checkCurrentAgencyUserToken } from '../../api/helpers'
import { Footer } from '../../biz-components/Footer'
import { UploadLog } from '../../biz-components/LogUpload/index'
import { Nav } from '../../biz-components/Nav'
import { RouteHooksTrigger } from '../../biz-components/routeHooksTrigger'
import { DynamicImportErrorBoundaryFallback } from '../../components/ErrorBoundary'
import { GlobalRefreshNoticeManager } from '../../modules/refreshNotice'
import { getCombineSettingsLazy } from '../../modules/settings'
import { User } from '../../modules/user'
import { GlobalVersionTrack } from '../../modules/versionTrack'
import {
  GlobalRefreshXtopicNotification,
  XTOPIC_CHECK_NOTIFICATION_INTERVAL,
} from '../../modules/xtopic/refreshNotification'
import { NotFound404 } from '../../pages/404'
import { AdminPage } from '../../pages/admin'
import { Home } from '../../pages/home'
import { JupyterPage } from '../../pages/jupyter'
import { Login2 } from '../../pages/login'
import { XTopicDetail, XTopicInsert, XTopicList } from '../../pages/topic'
import { XTopicAllNotifications } from '../../pages/topic/pages/allNotifications'
import { Tutorial } from '../../pages/tutorial'
import { UserPage } from '../../pages/user'
import type { GlobalState, IGlobalDispatch } from '../../reducer'
import { basicReducer, getDispatchers, initGlobalState } from '../../reducer'
import { GlobalContext } from '../../reducer/context'
import {
  AppToaster,
  TokenStorageKey,
  getCurrentClusterServerURL,
  getStudioClusterServerHost,
  getToken,
  getUserName,
  hasCustomMarsServer,
  isCurrentOtherTrainingsUser,
  removeUserToken,
} from '../../utils'
import { getUserAgentInfo } from '../../utils/browser'
import { AilabCountly, CountlyEventKey } from '../../utils/countly'
import { getCurrentLanguage, setCurrentLanguage } from '../../utils/lan'
import { Themes, getCurrentTheme, setCurrentTheme } from '../../utils/theme'

const DynManagePage = lazy(() => import(/* webpackChunkName: "dyn-manage" */ '../../pages/manage'))

const App = () => {
  const [state, actualDispatch] = useReducer(basicReducer, initGlobalState())
  function dispatch<T extends keyof GlobalState>(args: IGlobalDispatch<T>[]) {
    actualDispatch(args)
  }
  const dispatchers = getDispatchers(dispatch)

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [waitLogin, setWaitLogin] = useState<boolean>(false)
  const [lan, setLan] = useState<Languages>(getCurrentLanguage())
  const [theme, setTheme] = useState<Themes>(getCurrentTheme())

  const changeLan = () => {
    if (lan === Languages.EN) {
      setLan(Languages.ZH_CN)
      setCurrentLanguage(Languages.ZH_CN)
      window.location.reload()
    } else {
      setLan(Languages.EN)
      setCurrentLanguage(Languages.EN)
      window.location.reload()
    }
  }

  const changeTheme = () => {
    if (theme === Themes.light) {
      setTheme(Themes.dark)
      setCurrentTheme(Themes.dark)
    } else {
      setTheme(Themes.light)
      setCurrentTheme(Themes.light)
    }
  }

  // 全局信息初始化：
  // 1. 获取登录态
  // 2. user 信息初始化
  const lazyInitWhenGetToken = async () => {
    await User.getInstance().lazyInit()
    await getCombineSettingsLazy()
    GlobalRefreshXtopicNotification.checkUnreadNotification()
  }

  useEffect(() => {
    ;(document.getElementById('default-loading-tip')! as HTMLParagraphElement).innerHTML =
      '[3/3] Fetching User Info'

    if (hasCustomMarsServer()) {
      dispatchers.updateGlobalDebugState(true)
      IOFrontier.setAdditionalParams({
        marsServerURL: getCurrentClusterServerURL(),
        marsServerHost: getStudioClusterServerHost(),
      })
    }

    const token = getToken()
    if (!token) {
      setWaitLogin(true)
      setIsLoading(false)
    } else {
      try {
        // 当前是不是别人
        checkCurrentAgencyUserToken()
          .then(() => {
            return lazyInitWhenGetToken().then(() => {
              setIsLoading(false)
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              ;(document.getElementById('default-loading')! as any).style.display = 'none'
            })
          })
          .catch((e) => {
            console.error(e)
            if (/^\[403\]/.test(e.message)) {
              alert(i18n.t(i18nKeys.biz_not_allowed_for_studio))
              removeUserToken()
              window.location.reload()
            } else {
              alert('init error:' + e)
            }
          })
      } catch (e) {
        alert('catch init error' + e)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const connectedCallback = () => {
      dispatch([
        {
          type: 'ioStatus',
          value: IoStatus.connected,
        },
        {
          type: 'ioLastError',
          value: null,
        },
      ])
    }

    const ioFatalErrorCallback = (error: AllFatalErrorsType) => {
      if ((error as unknown as string) !== (UserFatalError.userManuallyDisconnect as string)) {
        AppToaster.show({
          message: i18n.t(i18nKeys.biz_io_disconnected_already),
          intent: 'danger',
        })
      }
      dispatch([
        {
          type: 'ioStatus',
          value: IoStatus.fatal,
        },
        {
          type: 'ioLastError',
          value: error,
        },
      ])
    }
    const disConnectedCallback = () => {
      // hint: 目前的实现逻辑 disconnect 不关心
    }

    const reportMetricsCallback = (metrics: ReportMetrics[]) => {
      for (const metric of metrics) {
        AilabCountly.safeReport(metric as unknown as CountlyEventKey)
      }
    }

    IOFrontier.addConnectedCallback(connectedCallback)
    IOFrontier.addFatalErrorCallback(ioFatalErrorCallback)
    IOFrontier.addDisConnectCallback(disConnectedCallback)
    IOFrontier.addReportMetricsCallback(reportMetricsCallback)
    return () => {
      IOFrontier.removeConnectedCallback(connectedCallback)
      IOFrontier.removeFatalErrorCallback(ioFatalErrorCallback)
      IOFrontier.removeDisConnectCallback(disConnectedCallback)
      IOFrontier.removeReportMetricsCallback()
    }
    // 这里不能有任何的依赖，否则拿不到最新的 state
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  usePageVisible(() => {
    // 当 page 显示的时候，检查 token
    getToken()
  })

  useStorageChange((e) => {
    if (e.key !== TokenStorageKey) return
    // 当 token 相关的存储变化的时候，检查页面
    getToken()
  })

  useEffectOnce(() => {
    GlobalRefreshNoticeManager.start()
  })

  useVisibleInterval(() => {
    GlobalRefreshXtopicNotification.checkUnreadNotification()
  }, XTOPIC_CHECK_NOTIFICATION_INTERVAL)

  if (isLoading) {
    return <div className="app-loading">Please wait, loading...</div>
  }

  if (waitLogin)
    return <Login2 lan={lan} changeLan={changeLan} changeTheme={changeTheme} theme={theme} />

  if (!window.ailabCountly) {
    AilabCountly.lazyInit(getUserName())
    AilabCountly.safeReport(CountlyEventKey.ailabInit)
    const browserAndVersion = getUserAgentInfo()
    const browser = browserAndVersion.split('-')[0]
    const browserAndVersionWithUser = `${browserAndVersion}-${getUserName()}`
    AilabCountly.safeReport(CountlyEventKey.visitBrowserVersion, {
      segmentation: {
        browserAndVersion,
        browserAndVersionWithUser,
        browser,
      },
    })
    GlobalVersionTrack.reportVersionTrack()
  }

  return (
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    <GlobalContext.Provider value={{ state, dispatch, dispatchers }}>
      <UploadLog />
      <HashRouter>
        <RouteHooksTrigger>
          <div className="App hf">
            {/* <div className="page-fixing-banner">
            后面我们可以考虑这种方式来增加自定义重要的通知
          </div> */}
            <Nav lan={lan} changeLan={changeLan} changeTheme={changeTheme} theme={theme} />
            <Suspense fallback={<HFLoading />}>
              <Routes>
                {/* <Route path="/plan" element={<Plan />} /> */}
                {!isCurrentOtherTrainingsUser && <Route path="/" element={<Home />} />}
                <Route
                  path="/manage"
                  element={
                    <ReactErrorBoundary errorComp={<DynamicImportErrorBoundaryFallback />}>
                      <DynManagePage />
                    </ReactErrorBoundary>
                  }
                />
                <Route path="*" element={<NotFound404 />} />
                {/* <Route path="/settings" element={<SettingsPage />}></Route> */}
                <Route path="/user" element={<UserPage />} />
                {!isCurrentOtherTrainingsUser && (
                  <Route path="/container" element={<JupyterPage />} />
                )}
                {}
                {!isCurrentOtherTrainingsUser && <Route path="/admin" element={<AdminPage />} />}
                {!isCurrentOtherTrainingsUser && <Route path="/tutorial" element={<Tutorial />} />}
                {}
                {!isCurrentOtherTrainingsUser && <Route path="/topic" element={<XTopicList />} />}
                {!isCurrentOtherTrainingsUser && (
                  <Route path="/topic/insert" element={<XTopicInsert />} />
                )}
                {!isCurrentOtherTrainingsUser && (
                  <Route path="/topic/:postIndex" element={<XTopicDetail />} />
                )}
                {!isCurrentOtherTrainingsUser && (
                  <Route path="/topic/notifications" element={<XTopicAllNotifications />} />
                )}
              </Routes>
            </Suspense>
            <Footer />
          </div>
        </RouteHooksTrigger>
      </HashRouter>
    </GlobalContext.Provider>
  )
}

export default App
