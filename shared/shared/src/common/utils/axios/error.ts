import { AxiosError } from 'axios'

/**
 * 针对一个疑似 axios 的报错，返回一个我们需要展示的报错信息
 */
export const composeErrorMessage = (e: unknown): Error => {
  const errorUrl = e instanceof AxiosError ? e?.config?.url || '' : ''
  const msg = e instanceof AxiosError ? e?.response?.data?.msg || e.message : 'server error'
  const statusCode = e instanceof AxiosError ? e.response?.status || 'unknown' : 'unknown'
  const message = `[${statusCode}] ${errorUrl} ${msg}`
  return new Error(message)
}
