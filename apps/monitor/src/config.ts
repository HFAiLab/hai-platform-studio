import { getStudioBFFURL, getStudioClusterServerURL } from '@hai-platform/shared'
// 用于保底忘记写 order 的情况
export const DEFAULT_ROUTER_ORDER = 10

const commonProps = {
  prepub: false,
  internal: true,
}

export const getBFFURL = (): string => {
  return getStudioBFFURL(commonProps)
}

export const getProxyURL = (): string => {
  return `${getBFFURL()}/proxy/s`
}

export const getCurrentClusterServerURL = (): string => {
  return getStudioClusterServerURL(commonProps)
}
