import type { GetUserTaskParams } from '@hai-platform/client-api-server'
import { ApiServerApiName } from '@hai-platform/client-api-server'
import { HFNoCacheHeader, TaskChainStatus, computeChainStatus } from '@hai-platform/shared'
import { SubscribeCommands } from '@hai-platform/studio-schemas'
import type { SubPayload, SubQueryParams } from '@hai-platform/studio-schemas'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { useEffectOnce } from 'react-use/esm'
import { CONSTS } from '../../../consts'
import { usePageFocus } from '../../../hooks/usePageFocus'
import { createChain } from '../../../model/Chain'
import { IOFrontier, IoStatus } from '../../../socket'
import { pathToNbName } from '../../../utils'
import { CountlyEventKey } from '../../../utils/countly/countly'
import { PageGlobalEventEmitter } from '../../../utils/pageGlobalEmitter'
import { ClusterHelper } from '../funcs/ClusterHelper'
import { UserHelper } from '../funcs/UserHelper'
import { ExpServiceContext } from '../reducer'
import { Exp2Panel } from './panel'

/**
主体四个部分：
╔══════════════════════════════╗
║ ExperimentHead               ║
╟──────────────────────────────╢
║ ExperimentSubmit             ║
╟──────────────────────────────╢
║ ExperimentStatus             ║
╟──────────────────────────────╢
║ ExperimentNodes              ║
╚══════════════════════════════╝
 */

// 侧边栏入口
export const ExperimentPanelContainer = () => {
  // 拿到之后，直接就长链接
  const srvc = useContext(ExpServiceContext)
  const { state } = srvc

  const subIdRef = useRef<number | null>(null)
  const [resumeTimeStamp, setResumeTimestamp] = useState<number | null>(null)

  const chainByIdChangeCallback = (payload: SubPayload<SubscribeCommands.Experiment2>) => {
    if (!payload.content) {
      return
    }

    // 如果是按照 path 订阅的，确实可能没有 task，是正常的，直接 return 就行了
    if (!payload.content.task) {
      return
    }

    const newChain = createChain(payload.content.task, srvc.app.api())

    if (
      subIdRef.current &&
      newChain.chain_status === TaskChainStatus.FINISHED &&
      state.queryType === 'chainId'
    ) {
      // 对于已经结束的实验，如果是以 chainId 来跟踪的，就不会再变了
      IOFrontier.getInstance().unsub(subIdRef.current)
    }

    srvc.dispatch({
      type: 'chain',
      value: newChain,
    })
  }

  const getQueryFromState = () => {
    let query: GetUserTaskParams
    if (state.queryType === 'chainId') {
      query = {
        chain_id: state.queryValue,
        token: srvc.app.api().getToken(),
      }
    } else {
      query = {
        // 可能要调用一下 pathToName
        nb_name: pathToNbName(state.queryValue),
        token: srvc.app.api().getToken(),
      }
    }
    return query
  }

  useEffect(() => {
    const query = getQueryFromState()
    let subId: number | null = null
    let destroyed = false
    srvc.app
      .api()
      .getApiServerClient()
      .request(ApiServerApiName.GET_USER_TASK, query, {
        headers: {
          ...HFNoCacheHeader,
        },
      })
      .then((res) => {
        if (destroyed) return
        const newChain = createChain(res.task, srvc.app.api())
        srvc.dispatch({
          type: 'chain',
          value: newChain,
        })

        if (
          res.task &&
          computeChainStatus(res.task) === TaskChainStatus.FINISHED &&
          state.queryType === 'chainId' // 如果是按照 nb_name 查询的，需要一直更新
        ) {
          return
        }

        srvc.app.api().countlyReportEvent(CountlyEventKey.Exp2IOSub)
        subId = IOFrontier.getInstance().sub<SubQueryParams[SubscribeCommands.Experiment2]>(
          SubscribeCommands.Experiment2,
          {
            query,
          },
          chainByIdChangeCallback,
        )
        subIdRef.current = subId
      })
      .catch(() => {
        // 如果么有找到这个 chain，就会报错，其实是正常的逻辑
        if (state.queryType === 'path') {
          srvc.app.api().countlyReportEvent(CountlyEventKey.Exp2IOSub)
          subId = IOFrontier.getInstance().sub<SubQueryParams[SubscribeCommands.Experiment2]>(
            SubscribeCommands.Experiment2,
            {
              query,
            },
            chainByIdChangeCallback,
          )
          subIdRef.current = subId
        }
      })
      .finally(() => {
        srvc.dispatch({
          type: 'globalInitLoading',
          value: false,
        })
      })
    return () => {
      destroyed = true
      if (subId) {
        IOFrontier.getInstance().unsub(subId)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.queryType, state.queryValue, state.mode, resumeTimeStamp])

  const syncRemoteInfo = () => {
    return Promise.all([
      ClusterHelper.getClusterUsage({
        apiServerClient: srvc.app.api().getApiServerClient(),
      }),
      UserHelper.getQuotaFromRemote({
        ailabServerClient: srvc.app.api().getAilabServerClient(),
        token: srvc.app.api().getToken(),
      }),
    ]).then(([clusterUsage, quotaMap]) => {
      srvc.batchDispatch([
        {
          type: 'sourceClusterUsage',
          value: clusterUsage,
        },
        {
          type: 'sourceQuotaMap',
          value: quotaMap,
        },
      ])
    })
  }

  const refresh = () => {
    /**
     * refresh 的时候刷新的一个场景：
     * 比如用户改了 quota，但是这页面迟迟没有刷新
     * 或者用户认为，这个刷新按钮应该能刷新一下可用节点的剩余，但是没有刷新
     * 另外需要知道的是，我们目前 page focus 也是会刷新的，这个频率后面可以看下要不要控制
     */
    if (state.mode === 'readWrite') {
      syncRemoteInfo()
    }

    srvc.app.api().countlyReportEvent(CountlyEventKey.Exp2Refresh)
    // 如果不是长链接，直接请求一下然后更新 Chain
    if (IOFrontier.ioStatus === IoStatus.fatal || IOFrontier.ioStatus === IoStatus.none) {
      const query = getQueryFromState()
      srvc.app
        .api()
        .getApiServerClient()
        .request(ApiServerApiName.GET_USER_TASK, query, {
          headers: {
            ...HFNoCacheHeader,
          },
        })
        .then((res) => {
          const newChain = createChain(res.task, srvc.app.api())
          srvc.dispatch({
            type: 'chain',
            value: newChain,
          })
        })
      srvc.app.api().countlyReportEvent(CountlyEventKey.Exp2HttpRefresh)
      return true
    }
    if (subIdRef.current === null) {
      return false
    }
    srvc.app.api().countlyReportEvent(CountlyEventKey.Exp2IORefresh)
    const expireRes = IOFrontier.getInstance().expireById(subIdRef.current)
    return expireRes
  }

  const updateResumeTimestamp = () => {
    setResumeTimestamp(Date.now())
  }

  // setResumeTimestamp 相当于是比 refresh 更彻底的刷新
  usePageFocus(() => {
    setResumeTimestamp(Date.now())
  })

  // 其他页面点击了恢复按钮；
  const resumeChainIdCallback = (e: StorageEvent) => {
    if (document.visibilityState !== 'visible') {
      return
    }
    if (e.key !== CONSTS.EXPS_LAST_RESUME_CHAIN_ID_LIST) return
    const chainIds = JSON.parse(e.newValue || '[]')
    if (state.queryType === 'chainId' && chainIds.includes(state.queryValue)) {
      updateResumeTimestamp()
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
    if (state.queryType === 'chainId' && chainIds.includes(state.queryValue)) {
      updateResumeTimestamp()
    }
  }

  useEffectOnce(() => {
    PageGlobalEventEmitter.on(CONSTS.EXPS_LAST_RESUME_CHAIN_ID_LIST, localResumeChainIdCallback)
    return () => {
      PageGlobalEventEmitter.off(CONSTS.EXPS_LAST_RESUME_CHAIN_ID_LIST, localResumeChainIdCallback)
    }
  })

  return <Exp2Panel refresh={refresh} syncRemoteInfo={syncRemoteInfo} />
}
