import type { TaskCurrentPerfStat } from '@hai-platform/client-ailab-server'

export const DefaultAppConfig = {
  handleCR: {
    // key: 'handleCR',
    type: 'boolean',
    title: 'handleCR',
    description:
      "If set true, log viewer will handle CR('\\r') normally. Set false, it will handle CR as '\\n'.",
    default: false,
  },
  maxLogViewer: {
    // key: 'maxLogViewer',
    type: 'number',
    title: 'maxLogViewer',
    description: 'Max log viewer can show at same time.',
    default: 99,
  },
  autoShowLog: {
    // key: 'autoShowLog',
    type: 'boolean',
    title: 'autoShowLog',
    description: 'Auto open log when click training item',
    default: false,
  },
  experimentsFilterMemorize: {
    type: 'boolean',
    title: 'experimentsFilterMemorize',
    description: '将实验页面的筛选条件变化写入 url',
    default: true,
  },
  trainingsCustomColumns: {
    type: 'string[]',
    title: 'Trainings Custom Columns',
    description: 'Customize the columns to be displayed(cpu|mem|gpu_util|ib_rx|ib_tx)',
    // ref: packages/studio-pages/src/entries/manage/reducer/reducer.ts
    default: ['gpu_util', 'gpu_power', 'ib_rx', 'ib_tx'],
  },
  customHomePanelsConfig: {
    type: 'CustomHomePanelsConfig',
    title: 'Customize the homepage panel',
    description: 'It is recommended to complete customization by drag and drop',
    default: false,
  },
}

export enum HomePanelNames {
  CurrentTrainings = 'CurrentTrainings',
  StorageUsage = 'StorageUsage',
  Workspace = 'Workspace',
  PathGuide = 'PathGuide',
  TaskAndPerformance = 'TaskAndPerformance',
}

export enum HomePanelStrategyName {
  Default = 'Default',
  StorageFirst = 'StorageFirst', // 存储优先
  StatisticFirst = 'StatisticFirst', // 统计数据优先
  Custom = 'Custom',
}

export interface CustomHomePanelsConfig {
  collapsePanels?: HomePanelNames[]
  displayPanels?: HomePanelNames[]
  strategyName?: HomePanelStrategyName
}

export interface AppConfigSchema {
  handleCR: boolean
  maxLogViewer: number
  autoShowLog: boolean
  experimentsFilterMemorize: boolean
  trainingsCustomColumns: (keyof TaskCurrentPerfStat)[]
  customHomePanelsConfig: CustomHomePanelsConfig | false
}
