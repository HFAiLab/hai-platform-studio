export enum AlertType {
  confirm = 1,
  note = 2,
  warning = 3,
  error = 4,
}

export interface FetionAlertParams {
  type: AlertType
  namespace: string
  msg: string
  groupName: string
  assign?: string | string[]
}

export interface BasicFetion {
  alert(params: FetionAlertParams): Promise<void>
}
