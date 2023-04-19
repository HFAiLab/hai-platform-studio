import type { ContainerTaskByAdmin } from '@hai-platform/shared'
import { getHubURL, getToken, getUserName } from '../../../utils'

export const getAccessURL = (containerInfo: ContainerTaskByAdmin, serviceName: string): string => {
  const servicePath = serviceName === 'jupyter' ? '' : `/${serviceName}`
  return `${getHubURL()}/${containerInfo.user_name}/${containerInfo.nb_name}${servicePath}?token=${
    containerInfo.token || getToken()
  }&origin_hf_user_name=${getUserName()}`
}

export const getKernelURL = (containerInfo: ContainerTaskByAdmin): string => {
  // serviceName 一定是 jupyter
  return `${getHubURL()}/${containerInfo.user_name}/${containerInfo.nb_name}?token=${
    containerInfo.token || getToken()
  }`
}

export const commonAccessContainer = (
  containerInfo: ContainerTaskByAdmin,
  serviceName: string,
): void => {
  window.open(getAccessURL(containerInfo, serviceName))
}
