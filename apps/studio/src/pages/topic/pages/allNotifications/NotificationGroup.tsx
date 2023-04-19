import dayjs from 'dayjs'
import React from 'react'
import type { NotificationItemProps } from '../../widgets/NotificationItem'
import { NotificationItem } from '../../widgets/NotificationItem'

export const GroupedItems = (props: { items: NotificationItemProps[] }) => {
  const dateGroupedMap = new Map() as Map<string, NotificationItemProps[]>
  const sortedItems = props.items.sort((a, b) => {
    return a.item.lastUpdatedAt > b.item.lastUpdatedAt ? -1 : 1
  })
  for (const item of sortedItems) {
    const dString = dayjs(item.item.lastUpdatedAt).format('YYYY-MM-DD')
    if (dateGroupedMap.get(dString) === undefined) {
      dateGroupedMap.set(dString, [])
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    dateGroupedMap.get(dString)!.push(item)
  }
  const dateGroupedList = [...dateGroupedMap.entries()]

  if (!dateGroupedList.length) {
    return (
      <div className="no-notification">
        <div className="pop" />
        <div className="desc">没有所选类型通知</div>
      </div>
    )
  }
  return (
    <>
      {dateGroupedList.map(([date, items]) => (
        <div className="group" key={date}>
          <div className="group-title">{date}</div>
          {items.map((item) => (
            // eslint-disable-next-line react/jsx-props-no-spreading
            <NotificationItem {...item} key={item.item.index} />
          ))}
        </div>
      ))}
    </>
  )
}
