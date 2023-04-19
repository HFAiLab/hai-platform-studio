import { ApiServerApiName } from '@hai-platform/client-api-server'
import { i18n, i18nKeys } from '@hai-platform/i18n'
import { clearAndCreateNewContainer } from '@hai-platform/studio-pages/lib/entries/base/app'
import type { BaseContainerAPI } from '@hai-platform/studio-pages/lib/entries/base/container'
import type { ManagerContainerAPI } from '@hai-platform/studio-pages/lib/entries/manage/container'
import { ManageApp } from '@hai-platform/studio-pages/lib/entries/manage/index'
import {
  AsyncExpsManageServiceNames,
  ExpsManageServiceNames,
  ManageServiceAbilityNames,
} from '@hai-platform/studio-pages/lib/entries/manage/schema'
import type {
  AsyncExpsManageServiceParams,
  AsyncExpsManageServiceResult,
  ExpsManageServiceParams,
  ExpsManageServiceResult,
  ExpsPageManageState,
} from '@hai-platform/studio-pages/lib/entries/manage/schema'
import { EventsKeys } from '@hai-platform/studio-pages/lib/entries/manage/schema/event'
import type { ChartBlockProps } from '@hai-platform/studio-pages/lib/entries/perf/widgets/ChartBlock'
import type { Chain } from '@hai-platform/studio-pages/lib/model/Chain'
import type { ExtractProps } from '@hai-platform/studio-pages/lib/schemas/basic'
import { applyMixins } from '@hai-platform/studio-pages/lib/utils'
import React, { useContext, useRef, useState } from 'react'
import { useUpdateEffect } from 'react-use/esm'
import useEffectOnce from 'react-use/esm/useEffectOnce'
import { GlobalApiServerClient } from '../../../../api/apiServer'
import { JupyterBaseContainerAPI } from '../../../../api/base'
import { GlobalClusterInfoInstance } from '../../../../modules/cluster/ClusterInfo'
import {
  getCombineSettingsLazy,
  getCombineSettingsUnsafe,
  updateUserSettings,
} from '../../../../modules/settings'
import type { GlobalContextContentType } from '../../../../reducer/context'
import { GlobalContext } from '../../../../reducer/context'
import {
  AppToaster,
  LevelLogger,
  clearHashedSearch,
  getCurrentAgencyToken,
  getToken,
  getUserName,
  isCurrentOtherTrainingsUser,
} from '../../../../utils'
import { AilabCountly, CountlyEventKey } from '../../../../utils/countly'
import { openFileInJupyter, tryGetGPUjupyter } from '../../../../utils/jupyter'
import { ManagePageContext } from '../../reducer/context'
import { SelectChainFailed } from './SelectChainFailed'

export interface TrainingsProps {
  // eslint-disable-next-line react/no-unused-prop-types
  addLogDock: (chain: Chain, rank: number) => void
  // eslint-disable-next-line react/no-unused-prop-types
  changeExpByManager: (chain: Chain, rank: number) => void
  // eslint-disable-next-line react/no-unused-prop-types
  addPerfDock: (props: ChartBlockProps) => void
}
// hint: 如果后面有变量级别的属性，还需要再更新这个 schema

class Container implements ManagerContainerAPI {
  props: TrainingsProps

  contextRef: React.MutableRefObject<GlobalContextContentType>

  constructor(
    node: HTMLDivElement,
    props: TrainingsProps,
    options: {
      contextRef: React.MutableRefObject<GlobalContextContentType>
    },
  ) {
    this._node = node
    this.contextRef = options.contextRef
    this.props = props
  }

  invokeAsyncService = <T extends AsyncExpsManageServiceNames>(
    key: T,
    params: ExtractProps<T, AsyncExpsManageServiceParams>,
  ): Promise<AsyncExpsManageServiceResult[T]> => {
    if (key === AsyncExpsManageServiceNames.openFile) {
      const p = params as AsyncExpsManageServiceParams[AsyncExpsManageServiceNames.openFile]
      const filePath = p.path
      GlobalApiServerClient.request(ApiServerApiName.SERVICE_TASK_TASKS).then((hubData) => {
        const jupyterTask = tryGetGPUjupyter(hubData)
        if (!jupyterTask) {
          AppToaster.show({
            message: i18n.t(i18nKeys.biz_jupyter_not_found),
            intent: 'danger',
            icon: 'warning-sign',
          })
          return false as any
        }
        AppToaster.show({
          message: i18n.t(i18nKeys.biz_jupyter_open_pending, {
            file_name: filePath,
            jupyter_name: jupyterTask.nb_name,
          }),
          intent: 'none',
        })
        setTimeout(() => {
          openFileInJupyter(jupyterTask, filePath)
          // hint: 延迟一会打开 jupyter，显示 toast 让用户看到
        }, 600)
        return true as any
      })
    } else if (key === AsyncExpsManageServiceNames.reflushClusterInfo) {
      return GlobalClusterInfoInstance.getFromRemote() as any
    } else {
      throw new Error(`invokeAsyncService ${key} Method not implemented.`)
    }

    return null as any
  }

  invokeService = <T extends ExpsManageServiceNames>(
    key: T,
    params: ExpsManageServiceParams[T],
  ): ExpsManageServiceResult[T] => {
    if (key === ExpsManageServiceNames.getAutoShowLog) {
      return getCombineSettingsUnsafe().combineSettings.autoShowLog as any
    }

    if (key === ExpsManageServiceNames.setAutoShowLog) {
      getCombineSettingsLazy().then((settings) => {
        updateUserSettings(
          JSON.stringify(
            {
              ...settings.userSettings,
              autoShowLog: params as ExpsManageServiceParams[ExpsManageServiceNames.setAutoShowLog],
            },
            null,
            4,
          ),
        )
      })
      return null as any
    }

    if (key === ExpsManageServiceNames.getExperimentsFilterMemorize) {
      return getCombineSettingsUnsafe().combineSettings.experimentsFilterMemorize as any
    }

    if (key === ExpsManageServiceNames.setExperimentsFilterMemorize) {
      const nextExperimentsFilterMemorize =
        params as ExpsManageServiceParams[ExpsManageServiceNames.setExperimentsFilterMemorize]

      if (!nextExperimentsFilterMemorize) {
        clearHashedSearch()
      }

      if (nextExperimentsFilterMemorize) {
        AilabCountly.safeReport(CountlyEventKey.enableExperimentsFilterMemorize)
      } else {
        AilabCountly.safeReport(CountlyEventKey.disableExperimentsFilterMemorize)
      }

      getCombineSettingsLazy().then((settings) => {
        updateUserSettings(
          JSON.stringify(
            {
              ...settings.userSettings,
              experimentsFilterMemorize: nextExperimentsFilterMemorize,
            },
            null,
            4,
          ),
        )
      })
      return null as any
    }

    if (key === ExpsManageServiceNames.getTrainingsColumns) {
      return getCombineSettingsUnsafe().combineSettings.trainingsCustomColumns as any
    }

    if (key === ExpsManageServiceNames.setTrainingsColumns) {
      getCombineSettingsLazy().then((settings) => {
        updateUserSettings(
          JSON.stringify(
            {
              ...settings.userSettings,
              trainingsCustomColumns:
                params as ExpsManageServiceParams[ExpsManageServiceNames.setTrainingsColumns],
            },
            null,
            4,
          ),
        )
      })
      return null as any
    }
    if (key === ExpsManageServiceNames.setCurrentChain) {
      this.props.changeExpByManager(params as Chain, 0)
      return undefined as any
    }
    if (key === ExpsManageServiceNames.openLog) {
      const p = params as ExpsManageServiceParams[ExpsManageServiceNames.openLog]
      this.props.addLogDock(p.chain, p.rank)
      return undefined as any
    }
    if (key === ExpsManageServiceNames.emitChainChanged) {
      return undefined as any
    }
    if (key === ExpsManageServiceNames.getUserName) {
      return getUserName() as any
    }

    if (key === ExpsManageServiceNames.getDefaultManageState) {
      // 主要的作用是从 url 中获得
      return this.contextRef.current.state.expsPageManageState as any
    }

    if (key === ExpsManageServiceNames.setPageState) {
      if (!getCombineSettingsUnsafe().combineSettings.experimentsFilterMemorize) return true as any
      // 主要的作用是写回 url
      this.contextRef.current.dispatch([
        {
          type: 'expsPageManageState',
          value: {
            ...(params as ExpsPageManageState),
            defaultSelectLogOpen:
              this.contextRef.current.state.expsPageManageState.defaultSelectLogOpen,
          },
        },
      ])
      // hint: 这里可以对 state 进行适当的拆分，从而支持多个模块，目前分开的需要手动覆盖一下
      return true as any
    }

    throw new Error(`invokeService ${key} Method not implemented.`)
  }

  hasAbility(name: ManageServiceAbilityNames) {
    const abilityDict = {
      [ManageServiceAbilityNames.openFile]: !isCurrentOtherTrainingsUser,
      [ManageServiceAbilityNames.stopExperiment]: !isCurrentOtherTrainingsUser,
      [ManageServiceAbilityNames.switchAutoShowLog]: !isCurrentOtherTrainingsUser,
      [ManageServiceAbilityNames.filterMemorize]: true,
    }
    return abilityDict[name] ?? false
  }

  getContainer() {
    return this._node
  }

  _node: HTMLDivElement
}

applyMixins(Container, [JupyterBaseContainerAPI])

export const TrainingsPage = (props: TrainingsProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const globalContext = useContext(GlobalContext)
  const globalContextRef = useRef(globalContext)
  const managePageContext = useContext(ManagePageContext)
  const manageAppRef = useRef<ManageApp | null>()
  const [selectChain404, setSelectChain404] = useState<boolean>(false)

  const ensureTrainings = () => {
    const { selectChainId } = globalContext.state.expsPageManageState
    if (!selectChainId)
      return new Promise((rs) => {
        rs(true)
      })
    return GlobalApiServerClient.request(ApiServerApiName.GET_USER_TASK, {
      token: getCurrentAgencyToken() || getToken(),
      chain_id: selectChainId,
    })
      .then(() => {
        return true
      })
      .catch((e) => {
        console.info('ensureTrainings e:', e)
        return false
      })
  }

  // hint: 这里我们假定 props 不会变了
  useEffectOnce(() => {
    ensureTrainings().then((res) => {
      if (!res) {
        setSelectChain404(true)
        return () => {}
      }
      if (!containerRef.current) {
        LevelLogger.error('trainings container not found')
        return undefined
      }

      const newDiv = clearAndCreateNewContainer(containerRef.current)
      const capi = new Container(newDiv, props, {
        contextRef: globalContextRef,
      }) as unknown as ManagerContainerAPI & BaseContainerAPI
      const manageApp = new ManageApp(capi)
      manageAppRef.current = manageApp
      manageApp.start()
      return () => {}
    })

    return () => {
      if (manageAppRef.current) {
        LevelLogger.info('manageApp stop')
        manageAppRef.current.stop()
        manageAppRef.current = null
      }
    }
  })

  useUpdateEffect(() => {
    if (manageAppRef.current)
      manageAppRef.current.emit(
        EventsKeys.AssignSelectChain,
        managePageContext?.state.currentSelectChain || null,
      )
  }, [managePageContext?.state.currentSelectChain])

  return (
    <>
      {selectChain404 && <SelectChainFailed />}
      <div className="trainings-page trainingsWindow hf" ref={containerRef} />
    </>
  )
}
