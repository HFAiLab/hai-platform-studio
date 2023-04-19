/* eslint-disable */
import type { GetReportDataBody } from '@hai-platform/client-ailab-server'
import { AilabServerApiName } from '@hai-platform/client-ailab-server'
import type {
  InsertDetailParams,
  QueryShouldUploadParams,
  UserInsertDetailParams,
} from '@hai-platform/shared'
import type { OutOfQuotaTask } from '@hai-platform/shared'
import type { TaskChainStatus, UserRole } from '@hai-platform/shared'
import type { CurrentScheduleTotalInfo } from '@hai-platform/studio-schemas/lib/esm/isomorph/schedule'
import { CONSTS, bffUrl, getToken, getUserName, trainingsBffUrl } from '../utils'
import { getFingerprint } from '../utils/fingerprint'
import { GlobalAilabServerClient } from './ailabServer'
import { req } from './request'

export type QueryType = 'gpu' | 'cpu' | 'every_card' | 'mem'

export type TaskTsObj = {
  start: number
  end: number
  series: Array<Array<any>>
  id: string | number
  rank: number
  type: QueryType
  node?: string
}

export interface UpdatePriorityResponse {
  msg: string
  success: 0 | 1
  timestamp: number
}

export interface UpdatePriorityParams {
  priority?: number
  custom_rank?: number
}

/**
 * @deprecated 新接口请直接通过 GlobalAilabServerClient 或 GlobalApiServerClient 请求
 */
export namespace conn {
  export interface ITimelineResponseObj {
    begin_at_list: Array<string>
    chain_id: string
    nb_name: string
    chain_status: TaskChainStatus
    created_at: string
    end_at_list: Array<string>
    group: string
    nodes: number
    priority: number
    whole_life_state_list: Array<string>
  }

  export interface IGlobalTaskOverview {
    [key: string]: TaskOverview
  }

  export interface TaskOverview {
    scheduled: number
    queued: number
  }

  export interface IStorageItem {
    host_path?: string
    mount_path: string
    mount_type: 'Directory' | 'File' | ''
    read_only: boolean
    src: string
  }

  export async function setUserSettings(props: { userName: string; config: string }) {
    const result = await GlobalAilabServerClient.request(
      AilabServerApiName.TRAININGS_SET_CONFIG_TEXT,
      undefined,
      {
        data: {
          user_name: props.userName,
          config_json: props.config,
        },
      },
    )
    console.info('setUserSettings result', result)
    return result
  }

  export interface JupyterTaskCommonResponse {
    success: number
    msg: string
    taskid: number
  }

  export interface NextCommonResponse<T> {
    success: number
    msg: string
    result: T
  }

  export async function uploadLog(content: UserInsertDetailParams) {
    const result = await GlobalAilabServerClient.request(
      AilabServerApiName.TRAININGS_LOG_USER_INSERT_DETAIL,
      undefined,
      {
        data: {
          data: content,
        },
      },
    )
    return result
  }

  export async function uploadLogAuto(content: InsertDetailParams) {
    const result = await GlobalAilabServerClient.request(
      AilabServerApiName.TRAININGS_LOG_INSERT_DETAIL,
      undefined,
      {
        data: {
          data: content,
        },
      },
    )
    return result
  }

  export async function queryShouldUploadLog() {
    const queryData: QueryShouldUploadParams = {
      uid: getUserName(),
      fingerprint: getFingerprint(),
      channel: CONSTS.LogUploadChannel,
    }

    const result = await GlobalAilabServerClient.request(
      AilabServerApiName.QUERY_SHOULD_UPLOAD,
      undefined,
      {
        data: queryData,
      },
    )

    if (!result) {
      return { shouldUpload: false }
    }

    let { shouldUpload } = result
    if (shouldUpload) {
      shouldUpload = localStorage.getItem(CONSTS.LocalStorage_LastUploadRid) !== result.lastRid
    }

    return {
      shouldUpload,
      rid: result.lastRid,
    }
  }

  export async function getOutOfQuotaTasks() {
    const result = await req<any, OutOfQuotaTask[]>({
      url: `${trainingsBffUrl}/data_panel/quota_exceeded_tasks`,
      method: 'POST',
    })
    return result
  }

  export function getReportDataCacheKey(props: GetReportDataBody) {
    return `cache_key_getReportData_${props.DatePeriod}_${props.dateStr}_${props.dateType}_${props.taskType}`
  }

  // 拿用户备注
  export interface NicknameInfo {
    user_name: string
    nick_name: string
    active: boolean
  }
  export interface NicknameDict {
    [name: string]: string
  }
  export async function getAdminUserNickname(): Promise<NicknameDict> {
    const response = await req<any, NicknameInfo[]>({
      url: `${trainingsBffUrl}/user/nickname_map`,
      method: 'POST',
      data: {
        token: getToken(),
        name: getUserName(),
      },
    })
    if (!response) {
      return {} as { [name: string]: string }
    }
    const ret = {} as { [name: string]: string }
    response.forEach((i) => {
      ret[i.user_name] = i.active ? i.nick_name : `【停用】 ${i.nick_name}`
    })
    return ret
  }

  export async function getExternalTaskCount() {
    const result = await req<any, CurrentScheduleTotalInfo>({
      url: `${trainingsBffUrl}/data_panel/get_external_task_count`,
      method: 'POST',
      params: {},
    })
    return result
  }

  export async function getJupyterAccessibility(url: string): Promise<{ accessibility: boolean }> {
    const res = await req<any, { accessibility: boolean }>({
      url: `${trainingsBffUrl}/jupyter/accessibility`,
      method: 'POST',
      data: {
        url,
      },
    })
    return res!
  }

  export async function uploadResource(blob: Blob, avatarName: string) {
    const fd = new FormData()
    fd.append('file[]', blob, avatarName)

    const res = await req<any, { errFiles: string[]; succMap: { [fileName: string]: string } }>({
      url: `${bffUrl}/xtopic/resource/upload`,
      method: 'POST',
      data: fd,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return res
  }
}
