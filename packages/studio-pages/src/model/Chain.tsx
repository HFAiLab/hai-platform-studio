/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ApiServerApiName } from '@hai-platform/client-api-server'
import type { StopTaskParams, SuspendTaskParams } from '@hai-platform/client-api-server'
import { i18n, i18nKeys } from '@hai-platform/i18n'
import type { ExtendedTask, MountInfo, Pod, TaskConfigJsonTraining } from '@hai-platform/shared'
import { computeChainStatus, getMountInfoFromCode, priorityToName } from '@hai-platform/shared'
import type { ErrorHandler } from '@hai-platform/studio-schemas/lib/esm/error'
import type { IToastProps } from '@hai-ui/core'
import type { ValidateConfig } from '../biz-components/validate'
import type { BaseContainerAPI } from '../entries/base/container'
import { alertDialog, successDialog } from '../ui-components/dialog'
import { dateStr, nbNameToPath } from '../utils/convert'

export type IPod = Pod & { rank: number }

export class ExtendChain {
  rawTask: ExtendedTask

  instance_updated_at: string

  _container_api: BaseContainerAPI

  constructor(sourceTask: ExtendedTask, _container_api: BaseContainerAPI) {
    // hint: 这几个这样做是因为，以前返回的信息中 bff 做二次加工，会有这么几个字段，而新的逻辑不做二次加工了，没有这几个字段
    // 但是 bff 为了向前兼容，个别模块还是加了一些字段
    // 所以前端这里需要删掉，否则会提示存在对应的 getter，导致无法删除字段

    if (!sourceTask) {
      throw new Error('ExtendChain constructor error: sourceTask is null')
    }

    const rawTask = { ...sourceTask }
    try {
      // @ts-expect-error
      delete rawTask.pods
      // @ts-expect-error
      delete rawTask.chain_status
      // @ts-expect-error
      delete rawTask.suspend_count
    } catch (e) {
      // do nothing
    }

    Object.assign(this, rawTask)
    this.rawTask = rawTask
    this._container_api = _container_api
    this.instance_updated_at = dateStr()
  }

  /**
   * Convert a escaped name to a normal name.
   */
  get showName(): string | null {
    return this.rawTask.nb_name ? nbNameToPath(this.rawTask.nb_name) : null
  }

  /**
   * Initial part of a chain
   */
  get chainInitial(): string {
    return this.rawTask.chain_id.split('-')[0]!
  }

  /**
   * priority name
   */
  get priorityName(): string {
    return priorityToName(this.rawTask.priority)
  }

  get initPriorityName(): string | null {
    const { config_json } = this.rawTask
    const priority =
      ((this.rawTask.config_json as TaskConfigJsonTraining).schema?.priority ||
        (config_json.priority as number)) ??
      this.rawTask.priority

    return priorityToName(priority)
  }

  get pods() {
    return this.rawTask._pods_
  }

  get chain_status() {
    return computeChainStatus(this.rawTask)
  }

  get suspend_count() {
    return this.rawTask.restart_count
  }

  async control(p: {
    action: 'stop' | 'suspend' | 'resume' | 'validate' | 'suspend'
    needConfirm: boolean
    errorHandler?: ErrorHandler
    confirmCallback?: () => any
    skipSuccessTip?: boolean
    toast?: (props: IToastProps, key?: string) => string
    toastWithCancel?: (props: IToastProps, key?: string | undefined) => Promise<boolean>
  }) {
    const { action, needConfirm, toastWithCancel, toast } = p

    if (action === 'stop' || action === 'suspend' || action === 'resume') {
      const actionDict = {
        stop: (params: StopTaskParams) => {
          this._container_api.getApiServerClient().request(ApiServerApiName.STOP_TASK, params)
        },
        resume: (params: StopTaskParams) => {
          this._container_api.getApiServerClient().request(ApiServerApiName.RESUME_TASK, params)
        },
        suspend: (params: SuspendTaskParams) => {
          this._container_api.getApiServerClient().request(ApiServerApiName.SUSPEND_TASK, params)
        },
      }

      const act = async () => {
        try {
          await actionDict[action]({ chain_id: this.rawTask.chain_id })
          if (!p.skipSuccessTip && toast) {
            toast({
              message: i18n.t(i18nKeys.biz_control_success, { file: this.showName, action }),
              intent: 'success',
            })
          }
        } catch (e) {
          if (toast) {
            toast({
              message: `${i18n.t(i18nKeys.biz_control_failed)} err: ${String(e)}`,
              intent: 'danger',
            })
          }
        }
      }

      let confirmed = false || !needConfirm

      if (needConfirm && toastWithCancel) {
        confirmed = await toastWithCancel({
          message: i18n.t(i18nKeys.biz_control_toast_control, {
            file: this.showName,
            action,
          }),
          timeout: 3000,
          intent: 'primary',
        })
      }

      if (confirmed && p.confirmCallback) p.confirmCallback()
      if (confirmed) {
        await act()
      }
    }

    if (action === 'validate') {
      // do nothing
      // 目前不走这里的逻辑了
    }
  }

  async validate(p: { skipSuccessTip?: boolean; config: ValidateConfig }) {
    try {
      const validateResult = await this._container_api
        .getApiServerClient()
        .request(ApiServerApiName.VALIDATE_TASK, {
          id: this.rawTask.id,
          ranks: p.config.ranks || [],
        })
      if (!p.skipSuccessTip) {
        if (validateResult.created) {
          successDialog(
            i18n.t(i18nKeys.biz_vali_confirm_success, {
              id: this.rawTask.id,
            }),
          )
        } else {
          alertDialog(`${validateResult.msg}`)
        }
      }
    } catch (e) {
      alertDialog(`${i18n.t(i18nKeys.biz_vali_submit_failed)}:\n${e}`)
    }
  }

  // chore: delete updateByName\updateByChainId at 2022.12.19

  getMountSetting(): MountInfo {
    const code = this.rawTask.mount_code
    // 位运算
    return getMountInfoFromCode(code)
  }
}

export type Chain = ExtendedTask & ExtendChain

export const createChain = (chainObj: ExtendedTask, _container_api: BaseContainerAPI) => {
  return new ExtendChain(chainObj, _container_api) as Chain
}
