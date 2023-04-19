export enum LoadingStatus {
  init = 'init', // 初次就是 init
  loading = 'loading',
  success = 'success',
  error = 'error',
}

export interface HFPanelCollapseProps {
  enable: boolean
  getDomContainer: (dom: HTMLElement) => HTMLElement
  onBegin?: () => void
  onEnd?: () => void
}
