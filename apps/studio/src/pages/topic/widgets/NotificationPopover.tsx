import { Button } from '@hai-ui/core/lib/esm'
import { Popover2 } from '@hai-ui/popover2/lib/esm'
import classNames from 'classnames'
import React, { useContext, useEffect, useState } from 'react'
import { useEffectOnce } from 'react-use'
import {
  GlobalRefreshXtopicNotification,
  UnreadNotificationStorageKey,
} from '../../../modules/xtopic/refreshNotification'
import { GlobalContext } from '../../../reducer/context'
import bellIcon from '../images/icon_bell.svg?raw'
import { NotificationItem } from './NotificationItem'

import './NotificationPopover.scss'

export const NotificationButton = () => {
  const globalContext = useContext(GlobalContext)
  const { xTopicNotification } = globalContext.state
  const [loading, setLoading] = useState<boolean>(true)
  const [unreadCount, setUnreadCount] = useState<number>(
    GlobalRefreshXtopicNotification.getUnread(),
  )
  useEffect(() => {
    function checkData() {
      const item = localStorage.getItem(UnreadNotificationStorageKey)
      if (item) setUnreadCount(Number(item))
    }
    window.addEventListener('storage', checkData)
    return () => {
      window.removeEventListener('storage', checkData)
    }
  }, [])

  const open = () => {
    globalContext.dispatchers.updateXTopicNotifications({ onlyUnread: true }, () => {
      setUnreadCount(0)
      setLoading(false)
      globalContext.dispatchers.updateXTopicUser() // 更新未读消息数目
      GlobalRefreshXtopicNotification.checkUnreadNotification()
    })
  }

  const close = () => {
    globalContext.dispatchers.updateXTopicNotifications({ onlyUnread: true })
    setLoading(true)
  }

  useEffectOnce(() => {
    setUnreadCount(GlobalRefreshXtopicNotification.getUnread())
  })

  const content = loading ? (
    <div className="xtopic-notification-pop-body">
      <div className="header">新通知</div>
      <div className="notification-item-place-holder hai-ui-skeleton" />
      <div className="notification-item-place-holder hai-ui-skeleton" />
      <div className="notification-item-place-holder hai-ui-skeleton" />
      <div className="control">
        <a href="#/topic/notifications">查看全部通知</a>
      </div>
    </div>
  ) : (
    <div className="xtopic-notification-pop-body">
      <div className="header">新通知</div>
      {xTopicNotification && xTopicNotification.count > 0 ? (
        <div className="list">
          {xTopicNotification.rows.map((item) => (
            // eslint-disable-next-line react/jsx-props-no-spreading
            <NotificationItem item={item} key={item.index} small />
          ))}
        </div>
      ) : (
        <div className="no-notification">没有新的通知</div>
      )}
      <div className="control">
        <a href="#/topic/notifications">查看全部通知</a>
      </div>
    </div>
  )

  return (
    <div className="xtopic-notification-wrapper">
      <Popover2
        interactionKind="click"
        content={content}
        placement="bottom-end"
        onOpened={open}
        onClose={close}
      >
        <Button
          minimal
          className={classNames('xtopic-notification-button', { highlight: unreadCount > 0 })}
          // eslint-disable-next-line react/no-danger
          icon={<div dangerouslySetInnerHTML={{ __html: bellIcon }} />}
        >
          通知
        </Button>
      </Popover2>
      {unreadCount > 0 && (
        <div className={classNames('count', 'xtopic-red-dot')}>
          {unreadCount >= 100 ? '99+' : unreadCount}
        </div>
      )}
    </div>
  )
}
