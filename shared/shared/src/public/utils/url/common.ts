export const getFallbackWSURL = () => {
  if (window.haiConfig?.wsURL) {
    return window.haiConfig.wsURL
  }

  // 可以在这里自定义一些获取 url 的逻辑，避免直接报错
  throw new Error('wsURL not found')
}
