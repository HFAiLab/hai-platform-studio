export interface BFFResponse {
  success: boolean
  data: any
  msg?: string
}

export interface BFFResponseWithType<T> {
  success: boolean
  data: T
  msg?: string
}
