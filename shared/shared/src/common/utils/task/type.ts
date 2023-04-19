export const isBackgroundTask = (taskGroup: string | null) => {
  return /#BG$/.test(taskGroup || '')
}

export const isHalfTask = (taskGroup: string | null) => {
  return /#HALF$/.test(taskGroup || '')
}
