import { CONSTS } from '../consts'
import { removeUserToken } from './hfaiToken'
import { AppToaster } from './toast'

export const clearMarsServerInfo = () => {
  window.localStorage.removeItem(CONSTS.CUSTOM_MARS_SERVER_URL)
  window.localStorage.removeItem(CONSTS.CUSTOM_MARS_SERVER_HOST)

  AppToaster.show({
    message: '清除成功，即将跳转至登录页面...',
    intent: 'success',
  })

  setTimeout(() => {
    removeUserToken()
    window.location.reload()
  }, 1200)
}
