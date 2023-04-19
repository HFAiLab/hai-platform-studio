import { AilabServerApiName } from '@hai-platform/client-ailab-server'
import { getCurrentAgencyUserInfo } from '../utils'
import { GlobalAilabServerClient } from './ailabServer'

// 拿到当前的 user_token 和 user_name，进行对比，如果错了就提示出错
export async function checkCurrentAgencyUserToken() {
  const userInfo = getCurrentAgencyUserInfo()
  if (!userInfo) return

  const result = await GlobalAilabServerClient.request(
    AilabServerApiName.LOGIN_CHECK_USER,
    undefined,
    {
      data: {
        token: userInfo.token,
        name: userInfo.name,
      },
    },
  )

  console.info('login res:', result)

  if (!result || !result.match) {
    throw new Error('检测到指定了他人的 Token 但是 Token 不匹配')
  }
}
