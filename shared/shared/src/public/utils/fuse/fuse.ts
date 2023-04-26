export const FuseOptions = [
  {
    key: 'true',
    value: 'true',
  },
  {
    key: 'false',
    value: 'false',
  },
  {
    key: 'default',
    value: 'undefined',
  },
]

/**
 * 传递给后端前，进行实际值的转义，string 对前端来说传递起来比较方便
 */
export const convertFuseValueToSubmit = (value: string) => {
  if (value === 'true') return true
  if (value === 'false') return false
  return undefined
}

/**
 * 从后端拿到值之后，转成客户端需要的字符串类型
 */
export const getFuseValueFromRemote = (value: boolean | undefined | null) => {
  if (value === true) return 'true'
  if (value === false) return 'false'
  return 'undefined'
}

/**
 * 什么情况下展示 fuse，可以自行补充
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const ifUserShowFuse = (group_lists: string[]) => {
  return false
}

export const DefaultFFFSFuse = undefined
