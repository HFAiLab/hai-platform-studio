import { getCountlyAPIKey, getCountlyURL } from '@hai-platform/shared'
import type { CountlyEvent } from '@hai-platform/studio-toolkit/lib/esm/countly'
import { CountlyReport } from '@hai-platform/studio-toolkit/lib/esm/countly'
import { APPVersion, countlyBffUrl, isProduction } from '.'

export const PAGE_NAME = 'hf_ailab_web'

export enum CountlyEventKey {
  loginSuccess = 'loginSuccess',
  ailabInit = 'ailabInit',
  expDetailOpen = 'expDetailOpen',
  expLogOpen = 'expLogOpen',
  perfOpen = 'perfOpen',
  pageUserMount = 'pageUserMount', // pageXXMount 即子页面访问统计
  pageHomeMount = 'pageHomeMount',
  pageContainerMount = 'pageContainerMount',
  pageLoginMount = 'pageLoginMount',
  pageDatasetsMount = 'pageDatasetsMount',
  pageTutorialMount = 'pageTutorialMount',
  pageManageMount = 'pageManageMount',
  pageXTopicMount = 'pageXTopicMount',
  dragQueueUpdatePriorityReq = 'dragQueueUpdatePriorityReq',
  dragQueueUpdatePrioritySucc = 'dragQueueUpdatePrioritySucc',
  dragQueueBeginDrag = 'dragQueueBeginDrag',
  pageAdminMount = 'pageAdminMount',
  containerEnterCreator = 'containerEnterCreator', // 进入开发容器创建页面
  containerEnterUserList = 'containerEnterUserList', // 进入用户列表页
  containerEnterAll = 'containerEnterAll', // 进入管理员页面
  containerCreate = 'containerCreate', // 创建开发容器
  IOclickIoStatus = 'clickIoStatus', // 点击 io 状态图标
  IOmanuallyDisconnect = 'IOmanuallyDisconnect', // 手动断开长链接
  IOmanuallyConnect = 'IOmanuallyConnect', // 手动链接长链接
  workSpaceOpenBrowser = 'workSpaceOpenBrowser', // workspace 打开 browser
  bffRequestUnknownError = 'bffRequestUnknownError', // bff 请求意料之外的错误，不应该出现
  XTopicListOpen = 'XTopicListOpen', // 讨论区页面
  XTopicDetailOpen = 'XTopicDetailOpen', // 讨论区详情
  XTopicInsertOpen = 'XTopicInsertOpen', // 讨论区新建页面
  XTopicNotificationOpen = 'XTopicNotificationOpen', // 讨论区通知页面
  XTopicReferClick = 'XTopicReferClick', // 讨论区点击回复引用
  XTopicReplyClick = 'XTopicReplyClick', // 讨论区点击回复
  XTopicChangeOrderType = 'XTopicChangeOrderType', // 切换排序方式
  XTopicChangeListTab = 'XTopicChangeListTab', // 切换列表的 Tab
  enableExperimentsFilterMemorize = 'enableExperimentsFilterMemorize', // 打开针对实验的 url 参数记忆
  disableExperimentsFilterMemorize = 'disableExperimentsFilterMemorize', // 关闭针对实验的 url 参数记忆
  visitBrowserVersion = 'visitBrowserVersion', // 访问用到的浏览器以及版本信息
  appVersionTrack = 'appVersionTrack', // app 版本追踪功能
  dndUpdateByStrategy = 'dndUpdateByStrategy', // 根据策略更新概览拖拽面板排序
  dndUpdateByDrag = 'dndUpdateByDrag', // 手动更新概览拖拽面板排序
  dndUpdateByCollapse = 'dndUpdateByCollapse', // 根据折叠更新拖拽面板排序
}

interface ReportCache {
  key: CountlyEventKey
  event?: CountlyEvent
}

let ailabCountly: CountlyReport<CountlyEventKey> | null = null
const reportCaches: ReportCache[] = []

export class AilabCountly {
  static getInstance() {
    return ailabCountly
  }

  static safeReport(key: CountlyEventKey, event?: CountlyEvent) {
    if (!isProduction) {
      // eslint-disable-next-line no-console
      console.info(`[debug] safeReport key: ${key}, event:`, event)
      return
    }
    if (!getCountlyURL() || !getCountlyAPIKey()) return
    if (!AilabCountly.getInstance()) {
      reportCaches.push({
        key,
        event,
      })
    } else {
      AilabCountly.getInstance()!.addEvent(key, event)
    }
  }

  static lazyInit(userName: string) {
    const deviceId = `ailab-${userName}`
    if (!getCountlyURL() || !getCountlyAPIKey()) return
    ailabCountly = new CountlyReport<CountlyEventKey>({
      apiKey: getCountlyAPIKey(),
      countlyURL: getCountlyURL(),
      pageName: PAGE_NAME,
      version: `${APPVersion}`,
      deviceId,
      proxy_url: countlyBffUrl,
      debug: !isProduction,
    })
    window.ailabCountly = ailabCountly
    if (reportCaches) {
      reportCaches.forEach((item) => {
        ailabCountly!.addEvent(item.key, item.event)
      })
    }
  }
}
