import type { HttpRequestConfig } from '@hai-platform/request-client'

// 把 method 改成 Get（默认为 Post）
export const MethodToGetHandler = (config: HttpRequestConfig): HttpRequestConfig => {
  return { ...config, method: 'GET' }
}
