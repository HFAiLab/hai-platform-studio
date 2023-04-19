export * from '@hai-platform/studio-schemas/lib/esm/error'
export * from './context'
export * from './services'

export enum ManageServiceAbilityNames {
  openFile = 'openFile',
  stopExperiment = 'stopExperiment',
  switchAutoShowLog = 'switchAutoShowLog',
  filterMemorize = 'filterMemorize', // 将筛选条件记录到 url 里面
}
