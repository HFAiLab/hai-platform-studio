/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { Exp2CreateParams, IExp2StateByProps } from '../schema/params'

// 一个 workspace 存一个 ts
interface DraftStorageItem {
  ts: number
  value: Record<string, Partial<Exp2CreateParams>>
}

type DraftStorage = Record<string, DraftStorageItem>

const DRAFT_STORAGE = 'hai:exp2_local_draft_storage'
const MAX_STORAGE = 1024 * 1024

const getWorkspaceName = () => {
  return /workspaces\/([^/]*)?\//g.exec(window.location.href)?.[1] || 'default_workspace'
}

const washDraftStorage = (storageStr: string) => {
  const currentStorage = JSON.parse(
    window.localStorage.getItem(DRAFT_STORAGE) || '{}',
  ) as DraftStorage

  try {
    if (storageStr.length < MAX_STORAGE) return currentStorage
    // 如果太大了，选择性删除一些，直到差不多比较小的时候
    // 按照 ts 排序，直到满足条件
    const nextStorage: DraftStorage = {}
    const totalReduceSize = storageStr.length - MAX_STORAGE + 1
    let currentReduceSize = 0

    for (const [key, value] of Object.entries(currentStorage).sort((a, b) => a[1].ts - b[1].ts)) {
      if (currentReduceSize <= totalReduceSize) {
        currentReduceSize += JSON.stringify({ [key]: value }).length
        continue
      }
      nextStorage[key] = value
    }

    window.localStorage.setItem(DRAFT_STORAGE, JSON.stringify(nextStorage))
    return nextStorage
  } catch (e) {
    console.error('washDraftStorage error:', e)
    return {}
  }
}

export const getDraftFromLocalStorage = (
  props: Pick<IExp2StateByProps, 'queryType' | 'queryValue'>,
): Partial<Exp2CreateParams> => {
  if (props.queryType === 'chainId') return {}
  const nb_name = props.queryValue
  const workspaceName = getWorkspaceName()

  const storageStr = window.localStorage.getItem(DRAFT_STORAGE) || '{}'
  const currentStorage = washDraftStorage(storageStr)

  if (!(workspaceName in currentStorage)) {
    currentStorage[workspaceName] = {
      ts: Date.now(),
      value: {},
    }
  }

  if (nb_name in currentStorage[workspaceName]!.value) {
    return currentStorage[workspaceName]!.value![nb_name as keyof Exp2CreateParams] || {}
  }
  return {}
}

export const updateDraftToLocalStorage = (
  props: Pick<IExp2StateByProps, 'queryType' | 'queryValue'>,
  draft: Partial<Exp2CreateParams>,
) => {
  if (props.queryType === 'chainId') return
  const nb_name = props.queryValue

  const workspaceName = getWorkspaceName()
  const currentStorage = JSON.parse(
    window.localStorage.getItem(DRAFT_STORAGE) || '{}',
  ) as DraftStorage

  if (!(workspaceName in currentStorage)) {
    currentStorage[workspaceName] = {
      ts: Date.now(),
      value: {},
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  currentStorage[workspaceName]!.value![nb_name as keyof Exp2CreateParams] = draft
  currentStorage[workspaceName]!.ts = Date.now()

  window.localStorage.setItem(DRAFT_STORAGE, JSON.stringify(currentStorage))
}

export const deleteDraftToLocalStorage = (
  props: Pick<IExp2StateByProps, 'queryType' | 'queryValue'>,
) => {
  if (props.queryType === 'chainId') return
  const nb_name = props.queryValue

  const workspaceName = getWorkspaceName()
  const currentStorage = JSON.parse(
    window.localStorage.getItem(DRAFT_STORAGE) || '{}',
  ) as DraftStorage

  if (!(workspaceName in currentStorage)) {
    // 如果本来就没有，啥也不用做
    return
  }

  delete currentStorage[workspaceName]!.value[nb_name as keyof Exp2CreateParams]
  if (Object.keys(currentStorage[workspaceName]!.value || {}).length === 0) {
    delete currentStorage[workspaceName]
  }
  window.localStorage.setItem(DRAFT_STORAGE, JSON.stringify(currentStorage))
}
