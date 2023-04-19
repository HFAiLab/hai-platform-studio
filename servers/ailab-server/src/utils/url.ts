import type { CUserInfo } from '@hai-platform/studio-schemas/lib/cjs/isomorph/user/external'
import * as pinyin from 'tiny-pinyin'

export function appendQuery(uri: string, key: string, value: string) {
  if (!value) {
    return uri
  }
  const re = new RegExp(`([?&])${key}=.*?(&|$)`, 'i')
  const separator = uri.indexOf('?') !== -1 ? '&' : '?'
  if (uri.match(re)) {
    return uri.replace(re, `$1${key}=${value}$2`)
  }
  return `${uri + separator + key}=${value}`
}

export function skipToken(obj: string | object) {
  if (typeof obj === 'string') {
    return obj
      .replace(/token=(.{3})(.*?)(\\s|&|$)/g, 'token=$1***$3')
      .replace(/"token":"(.{3})(.*?)"/, '"token":"$1***"')
      .replace(/get_worker_user_info\/(.{3})(.*?)(\/|$)/, 'get_worker_user_info/$1***$3')
      .replace(/cancel_queue_api\/(.{3})(.*?)(\/|$)/, 'cancel_queue_api/$1***$3')
      .replace(/set_user_gpu_quota\/(.{3})(.*?)(\/|$)/, 'set_user_gpu_quota/$1***$3')
      .replace(/get_user_info\/(.{3})(.*?)(\/|$)/, 'get_user_info/$1***$3')
      .replace(
        /get_lifecycle_from_chain_id_api\/(.{3})(.*?)(\/|$)/,
        'get_lifecycle_from_chain_id_api/$1***$3',
      )
  }
  if (typeof obj === 'object' && Object.prototype.hasOwnProperty.call(obj, 'token')) {
    ;(obj as { token: string }).token = `${`${(obj as { token: string }).token}`.slice(0, 3)}***`
  }
  return obj
}

export function generateAccountToken() {
  let result = ''
  const ascii_letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  for (let i = 0; i < 4; i += 1) {
    result += ascii_letters.charAt(Math.floor(Math.random() * ascii_letters.length))
  }
  const url_safe_letters = `${ascii_letters}0123456789-_`
  for (let i = 0; i < 12; i += 1) {
    result += url_safe_letters.charAt(Math.floor(Math.random() * url_safe_letters.length))
  }
  return result
}

export function convertChineseToPinyin(chinese: string, users: CUserInfo[]) {
  const all_quanpin = pinyin
    .convertToPinyin(chinese, undefined, true)
    .toLowerCase()
    .replace(/[^a-z]/g, '')
  if (!users.find((u) => u.user_name === all_quanpin)) return all_quanpin
  // 重名生成规则
  // 1 优先使用全拼首字母组合
  // 2 如果都占用，则使用全拼 + 单后缀
  const quanpin_arr = pinyin.convertToPinyin(chinese, '-', true).split('-')
  const first_letter_arr = quanpin_arr.map((quanpin) => quanpin.slice(0, 1))
  const len = quanpin_arr.length
  for (let i = 0; i < 2 ** len; i += 1) {
    let draft = ''
    for (let j = 0; j < len; j += 1) {
      const use_first_letter = (i & (2 ** (len - 1 - j))) > 0
      draft += use_first_letter ? first_letter_arr[j] : quanpin_arr[j]
    }
    if (!users.find((u) => u.user_name === draft)) return draft
  }
  const suffix = 'abcdefghijklmnopqrstuvwxyz123456789'
  for (const suf of suffix) {
    const draft = all_quanpin + suf
    if (!users.find((u) => u.user_name === draft)) return draft
  }
  throw new Error('用户名命名失败，重名尝试失败')
}

export function findMaxExternalId(users: CUserInfo[]) {
  const UIDs = users.map((u) => u.user_uid)
  const MIN_ID = 100001
  if (UIDs.length === 0) return MIN_ID
  return UIDs.reduce((prev, cur) => Math.max(prev, cur), MIN_ID)
}
