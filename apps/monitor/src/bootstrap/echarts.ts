import {
  BarChart,
  CustomChart,
  GaugeChart,
  HeatmapChart,
  LineChart,
  SankeyChart,
  TreemapChart,
} from 'echarts/charts'
import {
  BrushComponent,
  CalendarComponent,
  DataZoomComponent,
  GridComponent,
  LegendComponent,
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  VisualMapComponent,
} from 'echarts/components'
import * as echarts from 'echarts/core'
import darkTheme from 'echarts/lib/theme/dark'
import { CanvasRenderer } from 'echarts/renderers'
import type { App } from 'vue'
import { THEME_KEY } from 'vue-echarts'
import { useTheme } from '@/composables'
import { COLORS_THEME_DARK } from '@/constants'

export const bootstrapEcharts = (app: App): void => {
  echarts.use([
    // charts
    CustomChart,
    GaugeChart,
    HeatmapChart,
    LineChart,
    TreemapChart,
    SankeyChart,
    BarChart,

    // components
    BrushComponent,
    CalendarComponent,
    DataZoomComponent,
    GridComponent,
    LegendComponent,
    TooltipComponent,
    VisualMapComponent,
    TitleComponent,
    ToolboxComponent,

    // renderers
    CanvasRenderer,
  ])

  // 覆盖内置 dark theme 的背景色
  darkTheme['backgroundColor'] = COLORS_THEME_DARK.COMPONENT_BACKGROUND
  echarts.registerTheme('dark', darkTheme)

  // 全局默认配置
  app.provide(THEME_KEY, useTheme())
}
