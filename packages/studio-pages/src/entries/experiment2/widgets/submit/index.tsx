import { AilabServerApiName } from '@hai-platform/client-ailab-server'
import { ApiServerApiName } from '@hai-platform/client-api-server'
import { i18n, i18nKeys } from '@hai-platform/i18n'
import {
  DefaultFFFSFuse,
  getDefaultMountInfo,
  getFuseValueFromRemote,
  ifUserShowFuse,
  ifUserShowSideCar,
  isBackgroundTask,
  isHalfTask,
} from '@hai-platform/shared'
import { Button } from '@hai-ui/core/lib/esm/components'
import React, { useContext, useEffect, useMemo, useState } from 'react'
import { CONSTS } from '../../../../consts'
import type { Chain } from '../../../../model/Chain'
import { Code2RC } from '../../../../ui-components/highlightCode'
import { pathToNbName } from '../../../../utils'
import { simpleCopy } from '../../../../utils/copyToClipboard'
import { CountlyEventKey } from '../../../../utils/countly/countly'
import { PageGlobalEventEmitter } from '../../../../utils/pageGlobalEmitter'
import { sleep } from '../../../../utils/promise'
import { ClusterHelper } from '../../funcs/ClusterHelper'
import { deleteDraftToLocalStorage } from '../../funcs/DraftManager'
import { ExperimentHelper } from '../../funcs/ExperimentHelper'
import { UserHelper } from '../../funcs/UserHelper'
import { ExpServiceContext } from '../../reducer'
import { AsyncServiceNames, ExpServiceAbilityNames, ServiceNames } from '../../schema'
import type { Exp2CreateParams } from '../../schema/params'
import { Exp2DirectoryInput } from './components/DirectoryInput'
import { Exp2EntryPointInput } from './components/EntryPointInput'
import { Exp2ExtraMountInput } from './components/ExtraMountInput'
import { Exp2ExtraOptions } from './components/ExtraOptions'
import { Exp2Fuse } from './components/Fuse'
import { Exp2GroupInput } from './components/GroupInput'
import { Exp2ImageInput } from './components/ImageInput'
import { Exp2Operations } from './components/Operations'
import { Exp2PriorityInput } from './components/PriorityInput'
import { Exp2Sidecar } from './components/Sidecar'
import { Exp2WholeLifeStateInput } from './components/WholeLifeStateInput'
import { Exp2WorkerInput } from './components/WorkerInput'

export interface Exp2SubmitProps {
  refresh: () => void
  syncRemoteInfo: () => Promise<void>
}

export const Exp2Submit = (props: Exp2SubmitProps) => {
  const srvc = useContext(ExpServiceContext)
  const { state } = srvc
  const { chain, createParams, createDraft, showYAML } = state
  const toaster = srvc.app.api().getHFUIToaster()
  const canCreate = (chain && chain.queue_status === 'finished') || (!chain && state.queryValue)
  const isLock = !canCreate || state.mode === 'onlyRead' || state.mode === 'readControl'

  const [syncRemoteReady, setSyncRemoteReady] = useState<boolean>(false)
  const [isCreating, setCreating] = useState<boolean>(false)
  const [syncRemoteFirstReady, setSyncRemoteFirstReady] = useState(false)
  const userGroupList = srvc.app.api().invokeService(ServiceNames.getUserGroupList, null)
  const showSidecar = ifUserShowSideCar(userGroupList)
  const showFuse = ifUserShowFuse(userGroupList)

  // group 聚焦的时候，只更新 ClusterInfo
  const syncClusterInfo = () => {
    setSyncRemoteReady(false)
    ClusterHelper.getClusterUsage({
      apiServerClient: srvc.app.api().getApiServerClient(),
    })
      .then((clusterUsage) => {
        srvc.batchDispatch([
          {
            type: 'sourceClusterUsage',
            value: clusterUsage,
          },
        ])
        setSyncRemoteReady(true)
      })
      .catch(() => {
        toaster.show({
          message: '获取集群节点信息失败，请稍后重试',
          intent: 'danger',
        })
        setSyncRemoteReady(true)
      })
  }

  const syncRemoteInfo = () => {
    if (isLock) {
      setSyncRemoteReady(true)
      setSyncRemoteFirstReady(true)
      return
    }
    props.syncRemoteInfo().finally(() => {
      setSyncRemoteReady(true)
      setSyncRemoteFirstReady(true)
    })
  }

  const createParamsFromChain = ExperimentHelper.getDefaultCreateParams({
    chain,
    maybeCreatedWithJupyter: (currentChain: Chain) => {
      return srvc.app.api().invokeService(ServiceNames.maybeCreatedWithJupyter, currentChain)
    },
    getServerRoot: () => {
      return srvc.app.api().invokeService(ServiceNames.getServerRoot, null)
    },
  })

  const getCurrentCreateParam = <T extends keyof Exp2CreateParams>(
    key: T,
  ): Exp2CreateParams[T] | undefined => {
    if (key in state.createDraft) {
      return state.createDraft[key] as unknown as Exp2CreateParams[T]
    }

    return createParams?.[key]
  }

  const groupValue = isLock
    ? createParamsFromChain.group || ''
    : getCurrentCreateParam('group') || ''
  const workerValue = isLock
    ? createParamsFromChain.worker || 0
    : getCurrentCreateParam('worker') || 0
  const priorityValue = isLock
    ? createParamsFromChain.priority || -1
    : getCurrentCreateParam('priority') || -1
  const imageValue = isLock
    ? createParamsFromChain.image || ''
    : getCurrentCreateParam('image') || 'default'
  const directoryValue = isLock
    ? createParamsFromChain.directory || ''
    : getCurrentCreateParam('directory') || CONSTS.WORKSPACE_ROOT_STR
  const wholeLifeStateValue = isLock
    ? createParamsFromChain.whole_life_state || 0
    : getCurrentCreateParam('whole_life_state') || 0
  const pyVenv = isLock ? createParamsFromChain.py_venv : getCurrentCreateParam('py_venv') || ''
  const envs = isLock ? createParamsFromChain.envs : getCurrentCreateParam('envs') || []
  const parameters = isLock
    ? createParamsFromChain.parameters
    : getCurrentCreateParam('parameters') || []
  const mount_extra = isLock
    ? createParamsFromChain.mount_extra
    : getCurrentCreateParam('mount_extra') || getDefaultMountInfo()
  const sidecar = isLock ? createParamsFromChain.sidecar : getCurrentCreateParam('sidecar') || []
  const fffs_enable_fuse = isLock
    ? createParamsFromChain.fffs_enable_fuse
    : getCurrentCreateParam('fffs_enable_fuse') || getFuseValueFromRemote(DefaultFFFSFuse)

  const tags = isLock ? createParamsFromChain.tags : getCurrentCreateParam('tags') || []
  const watchdogTime = isLock
    ? createParamsFromChain.watchdog_time
    : getCurrentCreateParam('watchdog_time') || 0

  const isCurrentBackgroundTask = isBackgroundTask(groupValue)
  const isCurrentHalfTask = isHalfTask(groupValue)

  const isGlobalContextLoading = state.globalInitLoading

  const commonChange = <T extends keyof Exp2CreateParams>(content: {
    type: T
    value: Exp2CreateParams[T]
  }): void => {
    const key = content.type
    const v = content.value

    const currentCreateDraft = state.createDraft

    if (key === 'image') {
      currentCreateDraft.image = v as Exp2CreateParams['image']
      currentCreateDraft.py_venv = 'NOT_SET'
    } else {
      currentCreateDraft[key] = v
    }

    // checkMaxWorker 的逻辑，无论什么时候，都执行一下：
    const maxWorker = ExperimentHelper.getMaxWorker({
      priority: getCurrentCreateParam('priority') || -1,
      group: getCurrentCreateParam('group') || '',
      sourceQuotaMap: state.sourceQuotaMap,
    })
    if (maxWorker === -1) currentCreateDraft.worker = getCurrentCreateParam('worker') as number
    else {
      currentCreateDraft.worker = Math.min(maxWorker, getCurrentCreateParam('worker') as number)
    }

    srvc.dispatch({
      type: 'createDraft',
      value: { ...currentCreateDraft },
    })
  }

  const availablePriorities = UserHelper.getAvailablePriority({
    group: groupValue,
    quotaMap: state.sourceQuotaMap,
  })
  const priorityList = ExperimentHelper.getPriorityList()
  const imageListInfo = ExperimentHelper.getImageListInfo({
    sourceTrainImages: state.sourceTrainImages,
    imageValue,
  })
  const directoryList = srvc.app.api().invokeService(ServiceNames.getDirectoryList, null) || [
    chain?.workspace || '',
  ]
  const hfEnvList = useMemo(
    () =>
      ExperimentHelper.getHFEnvList({
        sourceTrainImages: state.sourceTrainImages,
        imageValue,
        hf_env: pyVenv,
      }),
    [state.sourceTrainImages, imageValue, pyVenv],
  )
  const imageEnvironments = ExperimentHelper.getImageDefaultEnvironments({
    sourceTrainImages: state.sourceTrainImages,
    imageValue,
  })

  const submit = async () => {
    let settingParams
    try {
      const submitParams = { ...createParams, ...createDraft } as Exp2CreateParams | null
      await srvc.app.api().invokeAsyncService(AsyncServiceNames.editorReadyCheck, null)

      // 如果没有获取 Image，在这里拿一下
      let { sourceTrainImages } = state
      if (!sourceTrainImages) {
        sourceTrainImages = await ClusterHelper.getTrainImages({
          apiServerClient: srvc.app.api().getApiServerClient(),
          token: srvc.app.api().getToken(),
        })
        srvc.dispatch({
          type: 'sourceTrainImages',
          value: sourceTrainImages,
        })
      }

      settingParams = ExperimentHelper.convertToParams({
        submitParams,
        sourceClusterUsage: state.sourceClusterUsage,
        sourceTrainImages,
      })

      // 提交实验后，删除缓存草稿
      deleteDraftToLocalStorage({
        queryType: state.queryType,
        queryValue: state.queryValue, // chainId | nb_name
      })
      srvc.batchDispatch([
        {
          type: 'createDraft',
          value: {},
        },
        {
          type: 'createParams',
          value: submitParams,
        },
      ])
    } catch (e) {
      toaster.show({
        message: `${e}`,
        intent: 'danger',
        icon: 'error',
      })
      return
    }

    const entrypoint = state.queryValue.replace(settingParams.directory, '')

    if (/\s+/g.test(entrypoint)) {
      toaster.show({
        message: i18n.t(i18nKeys.biz_submit_not_allow_space),
        intent: 'danger',
        icon: 'error',
      })
      return
    }

    setCreating(true)
    try {
      await srvc.app.api().invokeAsyncService(AsyncServiceNames.createExperiment, {
        nb_name: pathToNbName(state.queryValue),
        entrypoint,
        entrypoint_executable: false,
        ...settingParams,
      })
      toaster.show({
        message: i18n.t(i18nKeys.biz_create_experiment_success),
        intent: 'success',
        icon: 'tick',
      })
      // 这里是因为，我们的推送端是 3 秒左右查询一次，极端情况下，用户可能等待三秒才能收到更新。
      // 因此我们手动 refresh 一下，这个 refresh 就是多触发一次查询，没有什么副作用
      setTimeout(() => {
        props.refresh()
      }, 800)
    } catch (e) {
      setCreating(false)
      toaster.show({
        message: `${e}`,
        intent: 'danger',
        icon: 'error',
      })
    }
  }

  const stop = async () => {
    if (!state.chain) {
      return
    }
    await state.chain.control({
      action: 'stop',
      needConfirm: !window._hf_user_if_in,
      errorHandler: srvc.app.api().getErrorHandler(),
      toastWithCancel: srvc.app.api().toastWithCancel,
      toast: toaster.show.bind(toaster),
      confirmCallback: () => {},
    })
  }

  const resume = async () => {
    if (!state.chain) {
      srvc.app
        .api()
        .getHFUIToaster()
        .show({
          message: i18n.t(i18nKeys.biz_exp_status_resume_no_chain_found),
        })
      return
    }
    await state.chain.control({
      action: 'resume',
      needConfirm: !window._hf_user_if_in,
      errorHandler: srvc.app.api().getErrorHandler(),
      toastWithCancel: srvc.app.api().toastWithCancel,
      toast: toaster.show.bind(toaster),
      confirmCallback: () => {},
    })

    // 只是为了更好地体验，最好是能直接订阅新的了，实在兜不住其实对用户影响也不大
    // MagicNumber 1500：随便拍的，让后端数据库主从同步有更充分的时间（管理面板那里还有一处）
    await sleep(1500)
    await srvc.app
      .api()
      .getAilabServerClient()
      .request(AilabServerApiName.SOCKET_CONTROL_DELETE_TASK_CACHE, undefined, {
        data: {
          paramsList: [
            {
              chain_id: state.queryValue,
              token: srvc.app.api().getToken(),
            },
          ],
        },
      })

    srvc.app.api().countlyReportEvent(CountlyEventKey.BatchResume)

    const { chain_id } = state.chain
    PageGlobalEventEmitter.emit(CONSTS.EXPS_LAST_RESUME_CHAIN_ID_LIST, [chain_id])

    // 针对同一个浏览器的其他页面触发侧边栏的更新：
    window.localStorage.setItem(
      CONSTS.EXPS_LAST_RESUME_CHAIN_ID_LIST,
      JSON.stringify([chain_id, `${Date.now()}`]),
    )
    // 目前发现 headers 中不加禁用缓存控制字段就可以了，这里暂时先不用了
    // 实测发现这个时候偶然取不到新的状态，所以这里补刀一下
    // setTimeout(() => {
    //   PageGlobalEventEmitter.emit(CONSTS.EXPS_LAST_RESUME_CHAIN_ID_LIST, [chain_id])
    // }, 2000)
  }

  // 用于实验提交：
  useEffect(() => {
    if (isLock) return
    // 如果当前没有 isLock，初始化一个参数
    // 如果当前没有 chain，也是可能的

    const nextCreateParams = ExperimentHelper.getDefaultCreateParams({
      chain,
      maybeCreatedWithJupyter: (currentChain: Chain) => {
        return srvc.app.api().invokeService(ServiceNames.maybeCreatedWithJupyter, currentChain)
      },
      getServerRoot: () => {
        return srvc.app.api().invokeService(ServiceNames.getServerRoot, null)
      },
    })

    srvc.dispatch({
      type: 'createParams',
      value: nextCreateParams,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chain])

  // 当我们在 jupyter 打开一个 py 文件，它从运行中到结束之后，可能会触发 isLock 的变化
  useEffect(() => {
    syncRemoteInfo()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLock])

  // 用于 chain -> YAML
  useEffect(() => {
    // 之前是判断了 chain?.chain_status !== TaskChainStatus.FINISHED 但是会有一个问题：
    // 点击提交 -> 立刻切到别的 tab -> 等待实验完整之后再切过来，这个时候提交按钮仍然是在 loading
    // 稳妥起见，只要变了就设置为 false
    setCreating(false)

    if (!chain) return

    const chainYamlSchema = ExperimentHelper.getChainYamlSchema({
      chain,
    })
    srvc.dispatch({
      type: 'chainYamlSchema',
      value: chainYamlSchema,
    })

    ExperimentHelper.getChainYamlString({
      schemaValue: chainYamlSchema,
      ailabServerClient: srvc.app.api().getAilabServerClient(),
    }).then((chainYamlString) => {
      srvc.dispatch({
        type: 'chainYamlString',
        value: chainYamlString as string,
      })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chain])

  useEffect(() => {
    const canOpenJupyter = srvc.app.api().hasAbility(ExpServiceAbilityNames.openJupyter)

    if (canOpenJupyter)
      srvc.app
        .api()
        .getApiServerClient()
        .request(ApiServerApiName.SERVICE_TASK_TASKS)
        .then((hubDataResponse) => {
          hubDataResponse.tasks = hubDataResponse.tasks.filter((task) => {
            return !!task.builtin_services.find((service) => service.name === 'jupyter')
          })
          srvc.dispatch({
            type: 'hubData',
            value: hubDataResponse,
          })
        })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div>
      {showYAML && (
        <pre className="exp-yaml-container hf-basic-code">
          <Button
            icon="duplicate"
            small
            minimal
            title="Copy Config"
            className="yaml-copy"
            onClick={() => {
              simpleCopy(state.chainYamlString, 'schema', srvc.app.api().getHFUIToaster())
            }}
          />
          <Code2RC code={state.chainYamlString} lang="yaml" />
        </pre>
      )}
      {!showYAML && (
        <div className="submit-settings-container hf" id="exp2-submit-settings-container">
          <Exp2GroupInput
            value={groupValue}
            groupList={state.sourceClusterUsage}
            isLock={isLock}
            onChange={commonChange}
            onFocus={syncClusterInfo}
            isLoading={!syncRemoteReady || isGlobalContextLoading}
            initialized={syncRemoteFirstReady}
          />
          <Exp2WorkerInput
            value={workerValue}
            onChange={commonChange}
            isLock={isLock}
            isLoading={isGlobalContextLoading}
            isCurrentBackgroundOrHalfTask={isCurrentBackgroundTask || isCurrentHalfTask}
          />
          <Exp2PriorityInput
            isLock={isLock}
            value={priorityValue}
            onChange={commonChange}
            isLoading={!syncRemoteFirstReady || isGlobalContextLoading}
            isCurrentBackgroundTask={isCurrentBackgroundTask}
            availablePriorities={availablePriorities}
            priorityList={priorityList}
          />
          <Exp2ImageInput
            isLock={isLock}
            value={imageValue}
            onChange={commonChange}
            isLoading={!syncRemoteFirstReady || isGlobalContextLoading}
            imageListInfo={imageListInfo}
          />
          <Exp2DirectoryInput
            isLock={isLock}
            value={directoryValue}
            onChange={commonChange}
            isLoading={isGlobalContextLoading}
            directoryList={directoryList}
            chainYamlSchema={state.chainYamlSchema}
            toaster={toaster}
          />
          <Exp2EntryPointInput
            isLock={isLock}
            isLoading={isGlobalContextLoading}
            value={state.chainYamlSchema?.spec.entrypoint || ''}
            onChange={commonChange}
            toaster={toaster}
          />
          <Exp2WholeLifeStateInput
            isLock={isLock}
            isLoading={isGlobalContextLoading}
            onChange={commonChange}
            value={wholeLifeStateValue}
          />
          <Exp2ExtraMountInput
            isLock={isLock}
            isLoading={isGlobalContextLoading}
            onChange={commonChange}
            value={mount_extra}
          />
          {showSidecar && (
            <Exp2Sidecar
              isLock={isLock}
              isLoading={isGlobalContextLoading}
              onChange={commonChange}
              value={sidecar}
              historyValue={createParamsFromChain.sidecar}
            />
          )}
          {showFuse && (
            <Exp2Fuse
              isLock={isLock}
              isLoading={isGlobalContextLoading}
              onChange={commonChange}
              value={fffs_enable_fuse}
            />
          )}
          <Exp2ExtraOptions
            isLock={isLock}
            isLoading={isGlobalContextLoading}
            onChange={commonChange}
            tags={tags}
            watchdogTime={watchdogTime}
            py_venv={pyVenv}
            envs={envs}
            parameters={parameters}
            hfEnvList={hfEnvList}
            imageEnvironments={imageEnvironments}
          />
        </div>
      )}
      <Exp2Operations
        submit={submit}
        stop={stop}
        resume={resume}
        isLock={isLock}
        isCreating={isCreating}
      />
    </div>
  )
}
