export const DashBoardConfig = {
  refreshInterval: 10 * 1000,
  // Jupyter 是全局定时器，5min，因为这里毕竟不是所有页面都请求的，所以比 jupyter 的时间短一点，体验好点
  userMessageRefreshInterval: 60 * 1000,
}
