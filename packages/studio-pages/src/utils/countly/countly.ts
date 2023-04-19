const DebugDeviceId = 'debug-device'
let DebugUserName = 'unknown'
try {
  // @ts-expect-error ignore because of catch
  DebugUserName = process.env.DEBUG_USER_NAME
} catch (e) {
  console.warn('get DebugUserName error')
}

export function getCurrentAgencyUserName() {
  /* eslint-disable-next-line */
  const user = /\/([^\/]*?)\/([^\/]*?)\/lab/.exec(window.location.href)
  if (user && user.length >= 2) {
    return user[1] || DebugUserName
  }
  return DebugUserName
}

export function getCurrentDeviceId() {
  // 用户名 + 他的哪个实例
  /* eslint-disable-next-line */
  const device = /\/([^\/]*?\/[^\/]*?)\/lab/.exec(window.location.href)
  if (device && device.length >= 2) {
    return device[1]
  }
  return DebugDeviceId
}

export enum CountlyEventKey {
  ExtPrepareInit = 'ExtPrepareInit',
  ExtLanInit = 'ExtLanInit',
  ExtInit = 'ExtInit',
  ExpDetailOpenSideBarCreate = 'ExpDetailOpenSideBarCreate',
  ExpSubmit = 'ExpSubmit',
  ExpDetailRefresh = 'ExpDetailRefresh',
  ExpDetailFilterClick = 'ExpDetailFilterClick',
  ExpNodeClick = 'ExpNodeClick',
  ExpNodeValidate = 'ExpNodeValidate',
  InfoPanelOpen = 'InfoPanelOpen',
  InfoPanelQuotaReq = 'InfoPanelQuotaReq',
  TrainingsOpen = 'TrainingsOpen',
  TrainingsRefresh = 'TrainingsRefresh',
  TrainingsOnlyTrainingsClick = 'TrainingsOnlyTrainingsClick',
  TrainingsFilterTabClick = 'TrainingsFilterTabClick',
  TrainingsFilterTextEnter = 'TrainingsFilterTextEnter',
  ExpDetailContainerFindTimesTooMuch = 'ExpDetailContainerFindTimesTooMuch',
  ExpDetailContainerFindTimesTooFew = 'ExpDetailContainerFindTimesTooFew',
  ExtZenMode = 'ExtZenMode',
  Exp2Init = 'Exp2Init', // v2 侧边栏初始化
  Exp2Submit = 'Exp2Submit', // v2 侧边栏提交任务
  Exp2IOSub = 'Exp2IOSub', // v2 侧边栏长链接订阅
  Exp2Refresh = 'Exp2Refresh', // v2 侧边栏刷新、
  Exp2IORefresh = 'Exp2IORefresh', // v2 侧边栏刷新
  Exp2HttpRefresh = 'Exp2HttpRefresh', // v2 侧边栏刷新
  Exp2Resume = 'Exp2Resume',
  BatchResume = 'BatchResume',
  Exp2ShowYaml = 'Exp2ShowYaml', // 点击展示 yaml
}
