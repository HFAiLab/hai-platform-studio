export interface SidecarInfo {
  alias: string
}

/**
 * 可以在这里制定一些 sidecar
 */
export const SidecarInfoMap: { [key: string]: SidecarInfo } = {}

/**
 * 什么情况下展示 sidecar
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const ifUserShowSideCar = (group_lists: string[]) => {
  return false
}

/**
 * 默认选择的 sidecar，一般为空即可
 */
export const DefaultSideCar: Array<string> = []
