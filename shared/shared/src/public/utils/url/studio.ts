/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 前端页面获取 url 的逻辑
 * 如果采用前端独立部署的方式，是不存在 haiConfig 变量的，即需要开发者手动指定各类 url
 */

interface CommonGetURLProps {
  // 是否是内部用户
  internal: boolean
  // 是否是预发布环境
  prepub: boolean
}

// 获取萤火集群地址
export const getStudioClusterServerURL = (props: Pick<CommonGetURLProps, 'prepub'>) => {
  if (window.haiConfig?.clusterServerURL) {
    return window.haiConfig.clusterServerURL
  }

  // 可以在这里自定义一些获取 url 的逻辑，避免直接报错
  throw new Error('clusterServerURL not found')
}

export const getStudioWSURL = (props: Pick<CommonGetURLProps, 'prepub'>) => {
  if (window.haiConfig?.wsURL) {
    return window.haiConfig.wsURL
  }

  // 可以在这里自定义一些获取 url 的逻辑，避免直接报错
  throw new Error('wsURL not found')
}

export const getStudioBFFURL = (props: Pick<CommonGetURLProps, 'prepub'>) => {
  if (window.haiConfig?.bffURL) {
    return window.haiConfig.bffURL
  }

  // 可以在这里自定义一些获取 url 的逻辑，避免直接报错
  throw new Error('bffURL not found')
}

export const getVditorStaticUrl = (props: Pick<CommonGetURLProps, 'prepub'>) => {
  return 'http://unpkg.com' // vditor 默认的 cdn 地址
}

// 获取 jupyter url
export const getStudioJupyterURL = (props: CommonGetURLProps) => {
  if (window.haiConfig?.jupyterURL) {
    return window.haiConfig.jupyterURL
  }

  // 可以在这里自定义一些获取 url 的逻辑，避免直接报错
  throw new Error('jupyterURL not found')
}

// 获取文档链接
export const getDocURL = (props: CommonGetURLProps) => {
  return 'https://doc.hfai.high-flyer.cn/'
}

// 获取 countly 数据上报地址
export const getCountlyURL = () => {
  return window.haiConfig?.countly?.url || ''
}

// 获取 countly 数据上报 api key
export const getCountlyAPIKey = () => {
  return window.haiConfig?.countly?.apiKey || ''
}
