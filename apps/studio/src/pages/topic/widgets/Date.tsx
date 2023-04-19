import { Tooltip2 } from '@hai-ui/popover2/lib/esm'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import React from 'react'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)

type TooltipProps = React.ComponentProps<typeof Tooltip2>

export const XTopicDate = (p: {
  date: Date | string
  position?: TooltipProps['position']
  showFromNow?: boolean
}) => {
  const position = p.position ?? 'top'
  const showFromNow = p.showFromNow ?? false
  if (showFromNow) {
    return (
      <Tooltip2 position={position} content={dayjs(p.date).format('YYYY-MM-DD HH:mm')}>
        {dayjs(p.date).locale('zh-cn').fromNow()}
      </Tooltip2>
    )
  }
  return <>{dayjs(p.date).format('YYYY-MM-DD HH:mm')}</>
}
