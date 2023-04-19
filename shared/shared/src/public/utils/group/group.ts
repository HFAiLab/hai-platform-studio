/* eslint-disable @typescript-eslint/no-unused-vars */
/* 获取默认的训练分组 */
export const getDefaultTrainingGroup = () => {
  if (window && window.haiConfig && window.haiConfig.schedulerDefaultGroup) {
    return window.haiConfig.schedulerDefaultGroup
  }

  console.warn('default group not found')
  return 'training'
}

/* 获取默认的训练分组对应的正则表达式 */
export const getDefaultTrainingGroupRegex = () => {
  return new RegExp(`^${getDefaultTrainingGroup()}`)
}

/* 获取手动禁用节点的分组 */
export const getDefaultErrorNodeMetaGroup = () => {
  return window.haiConfig?.schedulerErrorNodeMetaGroup || 'jd_err'
}

/* 获取 jupyter 共享公共分组 */
export const getDefaultJupyterGroupPrefix = () => {
  return window.haiConfig?.jupyterSharedNodeGroupPrefix || 'jd_shared'
}

/* 获取 jupyter 共享公共分组前缀 */
export const getDefaultJupyterGroupPrefixRegex = () => {
  return new RegExp(`^${getDefaultJupyterGroupPrefix()}`)
}

/* 获取默认的内部用户训练分组列表 */
export const getDefaultInternalTrainingGroups = () => {
  return [getDefaultTrainingGroup()]
}

/* 获取默认的外部用户训练分组列表 */
export const getDefaultExternalTrainingGroups = () => {
  return [getDefaultTrainingGroup()]
}

/* 根据 group 的全称获取一个简称，当 group 较为复杂时可以在展示的时候提供帮助 */
export const getSimpleGroup = (group: string) => {
  return group
}

/**
 * 判断是 cpu 的分组还是 gpu 的分组，默认都是 gpu 分组
 * 在实际使用中，同一个分组的节点应当都为 cpu 或 gpu 机器
 */
export const isGPUGroup = (group: string) => {
  return true
}

/**
 * 判断是 cpu 的分组还是 gpu 的分组，默认都是 gpu 分组
 * 在实际使用中，同一个分组的节点应当都为 cpu 或 gpu 机器
 */
export const isCPUGroup = (group: string) => {
  return false
}
