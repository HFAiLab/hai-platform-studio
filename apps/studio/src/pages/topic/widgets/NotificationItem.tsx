import type { XTopicNotificationListSchema } from '@hai-platform/client-ailab-server'
import { NotificationItemCategory, XTopicNotificationType } from '@hai-platform/shared'
import { SVGWrapper } from '@hai-platform/studio-pages/lib/ui-components/svgWrapper'
import dayjs from 'dayjs'
import { template } from 'lodash-es'
import React, { useRef } from 'react'
import svgLike from '../images/notification_icon_like.svg?raw'
import svgReply from '../images/notification_icon_reply.svg?raw'
import svgSystem from '../images/notification_icon_system.svg?raw'
import { XTopicDate } from './Date'

import './NotificationItem.scss'

export const getNotificationCategory = (item: XTopicNotificationListSchema) => {
  if (
    item.type === XTopicNotificationType.POST_LIKED ||
    item.type === XTopicNotificationType.REPLY_LIKED
  ) {
    return NotificationItemCategory.LIKE_NOTIFICATION
  }
  if (
    item.type === XTopicNotificationType.REPLY_NEW ||
    item.type === XTopicNotificationType.REPLY_REFERRED
  ) {
    return NotificationItemCategory.REPLY_NOTIFICATION
  }
  return NotificationItemCategory.SYSTEM_NOTIFICATION
}

// 通知信息条目
export interface NotificationItemProps {
  item: XTopicNotificationListSchema
  small: boolean
}

export const NotificationItem = (props: NotificationItemProps) => {
  const elementRef = useRef<HTMLDivElement>(null)

  let icon
  switch (getNotificationCategory(props.item)) {
    case NotificationItemCategory.LIKE_NOTIFICATION:
      icon = svgLike
      break
    case NotificationItemCategory.REPLY_NOTIFICATION:
      icon = svgReply
      break
    case NotificationItemCategory.SYSTEM_NOTIFICATION:
      icon = svgSystem
      break
    default:
      break
  }
  const contentHTML = () => {
    try {
      return template(props.item.content)(props.item.meta)
    } catch (e) {
      return String(e)
    }
  }

  if (props.small) {
    return (
      <div
        className={`xtopic-notification-item small ${props.item.read ? '' : 'unread'}`}
        ref={elementRef}
      >
        <div className="icon">
          <SVGWrapper svg={icon} width={30} height={30} />
        </div>
        <div className="right">
          {/* eslint-disable-next-line react/no-danger */}
          <span className="ct" dangerouslySetInnerHTML={{ __html: contentHTML() }} />
          <div className="small-t">
            <XTopicDate date={props.item.lastUpdatedAt} showFromNow />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`xtopic-notification-item ${props.item.read ? '' : 'unread'}`} ref={elementRef}>
      <div className="icon">
        <SVGWrapper svg={icon} width={40} height={40} />
      </div>
      <div className="right">
        {/* eslint-disable-next-line react/no-danger */}
        <span className="ct" dangerouslySetInnerHTML={{ __html: contentHTML() }} />
        <div className="actor">
          {/* {actor} */}
          <span className="time">{dayjs(props.item.lastUpdatedAt).format('HH:mm')}</span>
        </div>
      </div>
    </div>
  )
}
