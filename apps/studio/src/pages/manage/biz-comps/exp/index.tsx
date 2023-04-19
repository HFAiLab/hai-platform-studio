import { i18n, i18nKeys } from '@hai-platform/i18n'
import { clearAndCreateNewContainer } from '@hai-platform/studio-pages/lib/entries/base/app'
import type { BaseContainerAPI } from '@hai-platform/studio-pages/lib/entries/base/container'
import { Experiment2App } from '@hai-platform/studio-pages/lib/entries/experiment2/app'
import type { Experiment2ContainerAPI } from '@hai-platform/studio-pages/lib/entries/experiment2/container'
import {
  ExpServiceAbilityNames,
  ServiceNames,
} from '@hai-platform/studio-pages/lib/entries/experiment2/schema'
import type {
  AsyncServiceNames,
  AsyncServiceResult,
  ExpServiceResult,
  OpenURLInNewTabParams,
  ServiceParams,
} from '@hai-platform/studio-pages/lib/entries/experiment2/schema'
import type { ChartBlockProps } from '@hai-platform/studio-pages/lib/entries/perf/widgets/ChartBlock'
import type { Chain } from '@hai-platform/studio-pages/lib/index'
import { applyMixins } from '@hai-platform/studio-pages/lib/utils'
import { Drawer, DrawerSize, Position } from '@hai-ui/core'
import React, { useContext, useLayoutEffect, useRef, useState } from 'react'
import { JupyterBaseContainerAPI } from '../../../../api/base'
import { ClusterInfo } from '../../../../modules/cluster/ClusterInfo'
import { User } from '../../../../modules/user'
import { IS_HAI_STUDIO, LevelLogger, isCurrentOtherTrainingsUser } from '../../../../utils'
import { openFileInJupyter } from '../../../../utils/jupyter'
import { ContainerManager } from '../../../jupyter/tabs'
import { ManagePageContext } from '../../reducer/context'

export interface ExpContainerAPIProps {
  addPerfDock: (props: Partial<ChartBlockProps>) => void
  addLogDock: (chain: Chain, rank: number) => void
  addIframeDock: (config: OpenURLInNewTabParams) => void
}

export interface ExpAdditionalProps {
  setShowJupyterDrawer: (show: boolean) => void
}

class ContainerAPI implements Experiment2ContainerAPI {
  containerProps: ExpContainerAPIProps

  additionalProps: ExpAdditionalProps

  constructor(
    node: HTMLDivElement,
    containerProps: ExpContainerAPIProps,
    additionalProps: ExpAdditionalProps,
  ) {
    this._node = node as HTMLDivElement
    this.additionalProps = additionalProps
    this.containerProps = containerProps
  }

  // eslint-disable-next-line class-methods-use-this
  invokeAsyncService<T extends AsyncServiceNames>(key: T): Promise<AsyncServiceResult[T]> {
    throw new Error(`invokeAsyncService ${key} Method not implemented.`)
  }

  invokeService<T extends ServiceNames>(key: T, params: ServiceParams[T]): ExpServiceResult[T] {
    if (key === ServiceNames.openLogViewer) {
      this.containerProps.addLogDock(
        (params as ServiceParams[ServiceNames.openLogViewer]).chain,
        (params as ServiceParams[ServiceNames.openLogViewer]).rank,
      )
      return null as any
    }
    if (key === ServiceNames.showPerformance) {
      this.containerProps.addPerfDock({
        chain: (params as ServiceParams[ServiceNames.showPerformance]).chain,
        createrQueryType: (params as ServiceParams[ServiceNames.showPerformance]).createrQueryType!,
      })
      return null as any
    }
    if (key === ServiceNames.quickOpenJupyter) {
      const paramsData = params as ServiceParams[ServiceNames.quickOpenJupyter]
      openFileInJupyter(paramsData.jupyterTask, paramsData.chain?.showName)
      return null as any
    }
    if (key === ServiceNames.openJupyterPanel) {
      this.additionalProps.setShowJupyterDrawer(true)
      return null as any
    }
    if (key === ServiceNames.openURLInNewTab) {
      const config = params as ServiceParams[ServiceNames.openURLInNewTab]
      this.containerProps.addIframeDock(config)
      return null as any
    }
    if (key === ServiceNames.maybeCreatedWithJupyter) {
      return false as any
    }
    if (key === ServiceNames.getServerRoot) {
      return '' as any
    }
    if (key === ServiceNames.getDirectoryList) {
      // 如果是 null，它内部会把 Chain.workspace 自动包含
      return null as any
    }
    if (key === ServiceNames.getUserGroupList) {
      return (User.getInstance().userInfo?.group_list || []) as any
    }

    throw new Error(`invokeService ${key} Method not implemented.`)
    // return null as any;
  }

  hasAbility(name: ExpServiceAbilityNames) {
    const abilityDict = {
      [ExpServiceAbilityNames.openFile]: false,
      [ExpServiceAbilityNames.openJupyter]: !isCurrentOtherTrainingsUser,
      [ExpServiceAbilityNames.stopExperiment]: !isCurrentOtherTrainingsUser,
      [ExpServiceAbilityNames.grafana]: !IS_HAI_STUDIO,
    }
    return abilityDict[name] ?? false
  }

  getContainer() {
    return this._node
  }

  _node: HTMLDivElement
}

applyMixins(ContainerAPI, [JupyterBaseContainerAPI])

export const ExpPage = (props: { containerProps: ExpContainerAPIProps }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const context = useContext(ManagePageContext)
  const [showJupyterDrawer, setShowJupyterDrawer] = useState<boolean>(false)
  const [clusterWithCache] = useState(new ClusterInfo())

  useLayoutEffect(() => {
    if (!context?.state.currentSelectChain) {
      return
    }

    const currentChain = context?.state.currentSelectChain
    if (!containerRef.current) {
      LevelLogger.error('trainings container not found')
      return
    }

    // hint: 这几行的作用是希望 React 能够正常的渲染和卸载
    // 具体可以参考 hf-drip 的 react.md 中关于嵌套 ReactDOM.render 的记录
    // 当时思考了一下 clearAndCreateNewContainer 是不是默认放到内部比较好：
    //     主要考虑到并不是所有的场景都是 React 套 React，所以就放在外面就行了
    const newDiv = clearAndCreateNewContainer(containerRef.current)

    const capi = new ContainerAPI(newDiv, props.containerProps, {
      setShowJupyterDrawer,
    }) as unknown as Experiment2ContainerAPI & BaseContainerAPI

    const exp2App = new Experiment2App(capi)

    exp2App.start({
      queryType: 'chainId',
      queryValue: currentChain.chain_id,
      mode: isCurrentOtherTrainingsUser ? 'onlyRead' : 'readControl',
    })

    // eslint-disable-next-line consistent-return
    return () => {
      exp2App.stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context?.state.currentSelectChain, clusterWithCache, props.containerProps])

  return (
    <>
      <div className="hf hf-exp-web-container expSidePanel">
        {!context?.state.currentSelectChain && (
          <div className="exp-side-panel-empty-tip-container">
            <p className="exp-side-panel-empty-tip">Please Select a Chain</p>
          </div>
        )}
        <div className="inner-container" ref={containerRef} />
      </div>

      <Drawer
        isOpen={showJupyterDrawer}
        className="jupyter-drawer-container"
        onClose={() => {
          setShowJupyterDrawer(false)
        }}
        title={i18n.t(i18nKeys.biz_jupyter_manage)}
        position={Position.RIGHT}
        // backdropClassName={"app-drawer-backdrop"}
        hasBackdrop={false}
        size={DrawerSize.STANDARD}
        style={{ minWidth: '750px' }}
      >
        <div className="app-drawer-content-container">
          <ContainerManager />
        </div>
      </Drawer>
    </>
  )
}
