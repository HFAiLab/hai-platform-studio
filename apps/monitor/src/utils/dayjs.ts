import dayjs from 'dayjs/esm'
import 'dayjs/esm/locale/zh-cn'
import customParseFormat from 'dayjs/esm/plugin/customParseFormat'
import duration from 'dayjs/esm/plugin/duration'

dayjs.extend(customParseFormat).locale('zh-cn')
dayjs.extend(duration)

export { dayjs }
