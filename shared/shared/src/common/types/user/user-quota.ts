export interface UserQuotaInfo {
  user_name: string
  resource: 'node' | 'node_limit'
  group: string
  quota: number
  role: 'internal' | 'external'
  user_groups: string[]
  priority: number
  expire_time?: string
}
