/* 如果有相对敏感的外部用户路径，可以在这里适当屏蔽 */
export const formatExternalPath = (path: string | undefined): string => {
  return path || ''
}
