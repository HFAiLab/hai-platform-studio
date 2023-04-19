import { NotificationItemCategory } from '@hai-platform/shared'
import { Button, Menu, MenuItem } from '@hai-ui/core/lib/esm'
import { Popover2 } from '@hai-ui/popover2/lib/esm'
import classNames from 'classnames'
import React, { useContext, useEffect, useState } from 'react'
import ReactPaginate from 'react-paginate'
import { HFPanel } from '../../../../components/HFPanel'
import { GlobalContext } from '../../../../reducer/context'

import { GroupedItems } from './NotificationGroup'
import './NotificationList.scss'

export const NotificationList = () => {
  const globalContext = useContext(GlobalContext)
  const { xTopicNotification } = globalContext.state

  const notifications = xTopicNotification?.rows ?? []

  const PAGESIZE = 20
  const [filterType, setFilterType] = useState<string>(NotificationItemCategory.ALL_NOTIFICATION)
  const [currentPage, setCurrentPage] = useState(0)

  const pageCount = xTopicNotification ? Math.ceil(xTopicNotification.count / PAGESIZE) : 1

  useEffect(() => {
    if (filterType === NotificationItemCategory.ALL_NOTIFICATION) {
      globalContext.dispatchers.updateXTopicNotifications({ page: currentPage, pageSize: PAGESIZE })
    } else {
      globalContext.dispatchers.updateXTopicNotifications({
        page: currentPage,
        pageSize: PAGESIZE,
        category: filterType as NotificationItemCategory,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType, currentPage])

  return (
    <HFPanel disableLoading className="xtopic-all-notifications-list">
      <div className="title-line">
        <div className="t">我的通知</div>
        <div className="options">
          <Popover2
            minimal
            position="bottom-right"
            content={
              <Menu className="xtopic-notification-type-select">
                <MenuItem
                  text="全部类型"
                  onClick={() => {
                    setFilterType(NotificationItemCategory.ALL_NOTIFICATION)
                  }}
                />
                <MenuItem
                  text={NotificationItemCategory.LIKE_NOTIFICATION}
                  onClick={() => {
                    setFilterType(NotificationItemCategory.LIKE_NOTIFICATION)
                  }}
                />
                <MenuItem
                  text={NotificationItemCategory.REPLY_NOTIFICATION}
                  onClick={() => {
                    setFilterType(NotificationItemCategory.REPLY_NOTIFICATION)
                  }}
                />
                <MenuItem
                  text={NotificationItemCategory.SYSTEM_NOTIFICATION}
                  onClick={() => {
                    setFilterType(NotificationItemCategory.SYSTEM_NOTIFICATION)
                  }}
                />
              </Menu>
            }
          >
            <Button minimal small rightIcon="caret-down">
              {filterType}
            </Button>
          </Popover2>
        </div>
      </div>
      <div className="content">
        <GroupedItems items={notifications.map((n) => ({ item: n as any, small: false }))} />
      </div>
      <div className={classNames('pagi', { 'no-pagi': pageCount > 1 })}>
        {pageCount > 1 && (
          <ReactPaginate
            previousLabel="<"
            nextLabel=">"
            breakLabel="..."
            breakClassName="break-me"
            pageCount={pageCount}
            marginPagesDisplayed={1}
            pageRangeDisplayed={3}
            onPageChange={(changeInfo) => {
              setCurrentPage(changeInfo.selected)
            }}
            containerClassName="common-pagination"
            activeClassName="active"
            forcePage={currentPage}
          />
        )}
      </div>
    </HFPanel>
  )
}
