import { NodeCurrentStatus, TaskPriority, TaskPriorityName } from '@hai-platform/shared'

/**
 * 布局相关信息
 */
export const LAYOUT = {
  /**
   * 侧边栏宽度
   *
   * @css var(--layout-sider-width)
   */
  SIDEBAR_WIDTH: 150,

  /**
   * 侧边栏折叠后宽度
   */
  SIDEBAR_WIDTH_COLLAPSED: 50,
} as const

/**
 * 主题相关配色信息
 */
export const COLORS_THEME_DARK = {
  /**
   * @css var(--component-background)
   */
  COMPONENT_BACKGROUND: '#001529',
} as const

/**
 * 图表相关配色信息
 */
export const COLORS_CHART = {
  /**
   * @css var(--c-green)
   */
  GREEN: '#059669',
  /**
   * @css var(--c-green-light)
   */
  GREEN_LIGHT: '#46ce9f',
  /**
   * @css var(--c-blue)
   */
  BLUE: '#60a5fa',
  /**
   * @css var(--c-yellow)
   */
  YELLOW: '#fbbf24',
  /**
   * @css var(--c-red)
   */
  RED: '#dc2626',
  /**
   * @css var(--c-gray)
   */
  GRAY: '#b4c0be',
} as const

/**
 * 任务优先级对应的图标 class
 */
export const PRIORITY_ICON_CLASS: Record<TaskPriority, string> = {
  [TaskPriority.AUTO]: 'i-hai-platform-priority--1',
  [TaskPriority.LOW]: 'i-hai-platform-priority-0',
  [TaskPriority.BELOW_NORMAL]: 'i-hai-platform-priority-5',
  [TaskPriority.NORMAL]: 'i-hai-platform-priority-10',
  [TaskPriority.ABOVE_NORMAL]: 'i-hai-platform-priority-20',
  [TaskPriority.HIGH]: 'i-hai-platform-priority-30',
  [TaskPriority.VERY_HIGH]: 'i-hai-platform-priority-40',
  [TaskPriority.EXTREME_HIGH]: 'i-hai-platform-priority-50',
}

/**
 * 任务优先级名称对应的图标 class
 */
export const PRIORITY_NAME_ICON_CLASS: Record<TaskPriorityName, string> = {
  [TaskPriorityName.AUTO]: PRIORITY_ICON_CLASS[TaskPriority.AUTO],
  [TaskPriorityName.LOW]: PRIORITY_ICON_CLASS[TaskPriority.LOW],
  [TaskPriorityName.BELOW_NORMAL]: PRIORITY_ICON_CLASS[TaskPriority.BELOW_NORMAL],
  [TaskPriorityName.NORMAL]: PRIORITY_ICON_CLASS[TaskPriority.NORMAL],
  [TaskPriorityName.ABOVE_NORMAL]: PRIORITY_ICON_CLASS[TaskPriority.ABOVE_NORMAL],
  [TaskPriorityName.HIGH]: PRIORITY_ICON_CLASS[TaskPriority.HIGH],
  [TaskPriorityName.VERY_HIGH]: PRIORITY_ICON_CLASS[TaskPriority.VERY_HIGH],
  [TaskPriorityName.EXTREME_HIGH]: PRIORITY_ICON_CLASS[TaskPriority.EXTREME_HIGH],
}

/**
 * 节点状态对应的颜色
 */
export const COLORS_NODE_STATUS: Record<NodeCurrentStatus, string> = {
  [NodeCurrentStatus.DEV]: COLORS_CHART.GRAY,
  [NodeCurrentStatus.SERVICE]: COLORS_CHART.GRAY,
  [NodeCurrentStatus.RELEASE]: COLORS_CHART.GRAY,
  [NodeCurrentStatus.ERR]: COLORS_CHART.RED,
  [NodeCurrentStatus.EXCLUSIVE]: COLORS_CHART.YELLOW,
  [NodeCurrentStatus.TRAINING_FREE]: COLORS_CHART.BLUE,
  [NodeCurrentStatus.TRAINING_WORKING]: COLORS_CHART.GREEN,
  [NodeCurrentStatus.TRAINING_UNSCHEDULABLE]: COLORS_CHART.RED,
}
