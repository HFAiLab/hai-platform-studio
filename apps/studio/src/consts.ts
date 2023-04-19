import {
  getDocURL,
  getStudioBFFURL,
  getStudioClusterServerURL,
  getStudioJupyterURL,
  getStudioWSURL,
  getVditorStaticUrl,
} from '@hai-platform/shared'

/**
 * 静态的变量
 */
export const CONSTS = {
  INVALID_GROUP: 'FAILED',

  /**
   * 建议对比较复杂的模块增加一个延迟渲染的时间的原因：
   *
   * 比如点击实验列表直接打开 log 这个场景，如果不延迟，会同步做这几件事情：
   * rc-dock 计算和渲染、rc-dock 动画、log root 根节点同步渲染、exp root 根节点同步渲染
   * 会消耗 200ms 左右，这个时候 rc-dock 的动画就会卡顿
   * 如果延迟，就会先做 rc-dock 计算和渲染、rc-dock 动画，动画效果比较流畅
   */
  HFAPP_DELAY_RENDER: 500,

  HFAPP_AILAB_LAN_LOCALSTORAGE: 'HFAPP_AILAB_LAN_LOCALSTORAGE',
  HFAPP_AILAB_THEME_LOCALSTORAGE: 'HFAPP_AILAB_THEME_LOCALSTORAGE',

  HFAPP_INTERNAL_USER_GROUP_TAG: 'internal',

  LogUploadChannel: 'ailab_web',

  LocalStorage_LastUploadRid: 'LocalStorage_LastUploadRid',

  LogUploadCheckInterval: 1000 * 60,

  UserMessageCheckInterval: 1000 * 10,

  TASK_OVERVIEW_RANGE_SCHEDULE_HOURS: 3,

  EXTRA_MOUNT_CODE_VALUE: {
    three_fs_prod: 0b0000010,
    three_fs_stage: 0b0000100,
    ceph_stage: 0b0000001,
  },

  // 手动指定的集群服务端地址，通常测试的时候用到
  CUSTOM_MARS_SERVER_URL: 'CUSTOM_MARS_SERVER_URL',
  // 手动指定集群服务端地址之后，我们需要设置 Host 来正确路由到对应的人的 server，所以需要设置一个 Host
  CUSTOM_MARS_SERVER_HOST: 'CUSTOM_MARS_SERVER_HOST',

  // 和 apps/studio/src/style/variables.scss home_panel_default_width 保持对应
  HOME_PANEL_DEFAULT_WIDTH: 1008,

  ROUTER_PATHS: {
    home: '/',
    manage: '/manage',
    user: '/user',
    container: '/container',
    datasets: '/datasets',
    admin: '/admin',
    tutorial: '/tutorial',
    doc_private_dataset: '/doc/private_dataset',
    topic: '/topic',
    topic_insert: '/topic/insert',
    topic_post_index: '/topic/:postIndex',
    topic_notifications: '/topic/notifications',
    any: '*',
  },

  DebugAilabServerPathWhiteList: [
    'trainings/user/safe_get_user_info',
    'trainings/user_config/get_config_text',
    'trainings/log_upload/query_should_upload',
    'trainings/data_panel/user_node_quota_info',
  ],

  TOPIC_DEFAULT_NICK_NAME: '平台用户',
}

/* eslint-disable no-nested-ternary */
export const isProduction = (() => {
  try {
    return !!import.meta.env.VITE_PRODUCTION && import.meta.env.VITE_PRODUCTION !== 'false'
  } catch (e) {
    return false
  }
})()

// 是否是 prepub：注意，本地开发不是 prepub
export const isPrePub = (() => {
  try {
    return !!import.meta.env.VITE_PREPUB && import.meta.env.VITE_PREPUB !== 'false'
  } catch (e) {
    return false
  }
})()

export function hasCustomMarsServer() {
  return !!window.localStorage.getItem(CONSTS.CUSTOM_MARS_SERVER_URL)
}

// 用户指定了后端服务的地址，也认为是 prepub
export const isPrepubOrCustomMarsServer = isPrePub || hasCustomMarsServer()

export const APPVersion = (() => {
  try {
    return import.meta.env.VITE_APP_VERSION
  } catch (e) {
    return 'unknown-version'
  }
})()

export const APPShortVersion = (() => {
  try {
    return import.meta.env.VITE_SHORT_VERSION
  } catch (e) {
    return Number.MAX_SAFE_INTEGER
  }
})()

// 获取当前的一些 url 配置的通用参数
const getUrlProps = () => {
  return {
    prepub: isPrepubOrCustomMarsServer,
    internal: window._hf_user_if_in,
  }
}

export function getCurrentClusterServerURL() {
  return (
    window.localStorage.getItem(CONSTS.CUSTOM_MARS_SERVER_URL) ||
    getStudioClusterServerURL(getUrlProps())
  )
}

export function getStudioClusterServerHost() {
  if (!hasCustomMarsServer()) return ''
  return window.localStorage.getItem(CONSTS.CUSTOM_MARS_SERVER_HOST) || ''
}

// HINT: 这里挂到 window 了是希望能方便被别的地方使用，比如 packages/studio-pages/src/socket/index.ts
;(window as any).getProductionWSSUrl = () => {
  return getStudioWSURL(getUrlProps())
}

export const bffUrl = getStudioBFFURL(getUrlProps())
export const trainingsBffUrl = `${bffUrl}/trainings`
export const countlyBffUrl = `${bffUrl}/report/countly/i`
export const vditorStaticUrl = getVditorStaticUrl(getUrlProps())

export const getHubURL = (): string => {
  const currentHost = getStudioClusterServerHost()
  if (currentHost) return `https://${currentHost.replace('server', 'hfhub')}`
  return getStudioJupyterURL(getUrlProps())
}

export const getCurrentAdminURL = (token: string, user_name: string) => {
  const url = `${window.location.protocol}//${
    window.location.host
  }/?current_user_token=${`${token}`}&current_user=${user_name}`

  return url
}

export const TOPIC_DEFAULT_AVATAR_SRC = `/resources/default_avatar.jpg`
export const IS_HAI_STUDIO = !!window.is_hai_studio
export const getCurrentDocURL = () => getDocURL(getUrlProps())
