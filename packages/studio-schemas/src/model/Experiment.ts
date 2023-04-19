import type { IChainObj } from './Chain'

// eslint-disable-next-line @typescript-eslint/naming-convention
enum QUE_STATUS {
  QUEUED = 'queued', // 任务在队列中
  SCHEDULED = 'scheduled', // 任务被调度到了
  FINISHED = 'finished', // 任务结束
}

// eslint-disable-next-line @typescript-eslint/naming-convention
enum CHAIN_STATUS {
  WAITING_INIT = 'waiting_init',
  RUNNING = 'running',
  SUSPENDED = 'suspended',
  FINISHED = 'finished',
}

export function dangerousConvertExperiment(remote_exp: any): IChainObj {
  const res = { ...remote_exp }

  function getChainStatus(exp: any) {
    if (exp.queue_status === QUE_STATUS.FINISHED) {
      return CHAIN_STATUS.FINISHED
    }
    if (exp.queue_status === QUE_STATUS.SCHEDULED) {
      return CHAIN_STATUS.RUNNING
    }
    // 如果是第一个并且在排队
    if (exp.id_list.length <= 1) {
      return CHAIN_STATUS.WAITING_INIT
    }
    return CHAIN_STATUS.SUSPENDED
  }

  function getCluster(exp: any) {
    try {
      return exp.group.split(':').pop().slice(0, 2)
    } catch (e) {
      console.error('Serious! error: getCluster')
      return 'unknown'
    }
  }

  function getGroupList(exp: any) {
    try {
      return exp.group.split(';').map((item: any) => item.split(':').pop().trim())
    } catch (e) {
      console.error('Serious! error: getGroupList')
      return []
    }
  }

  function getNodesList(exp: any) {
    try {
      return [exp.nodes]
    } catch (e) {
      console.error('Serious! error: getNodesList')
      return []
    }
  }

  res.ChainStatus = getChainStatus(remote_exp)
  res.chain_status = getChainStatus(remote_exp)
  res.cluster = getCluster(remote_exp)
  // TO BE DEL:
  // res.experiment_columns = ['id', 'nb_name', 'nodes', 'chain_status', 'suspend_count', 'updated_at']
  res.groups_list = getGroupList(remote_exp)
  res.nodes_list = getNodesList(remote_exp)

  res.job_info = `[${remote_exp.user_name}][${remote_exp.nb_name}][${remote_exp.id}]`
  res.pods = remote_exp._pods_
  res.queue_job = true
  res.suspend_count = res.restart_count

  return res as IChainObj
}
