import {
  LineChart,
  // BarChart
  PieChart,
} from 'echarts/charts'
import { DatasetComponent, GridComponent, TooltipComponent } from 'echarts/components'
import * as echarts from 'echarts/core'

import { CanvasRenderer } from 'echarts/renderers'

echarts.use([
  TooltipComponent,
  TooltipComponent,
  DatasetComponent,
  GridComponent,
  LineChart,
  PieChart,
  // BarChart,
  CanvasRenderer,
])

export default echarts
