/**
 * 获取实验信息的三选一参数，至少填一个，优先级：
 * id > chian_id > nb_name
 */
export interface ChainTaskRequestInfo {
  id?: number

  chain_id?: string

  nb_name?: string
}
