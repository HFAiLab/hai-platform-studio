import { Icon } from '@hai-ui/core/lib/esm/components'
import classnames from 'classnames'
import React from 'react'
import './index.scss'

export interface TabItem {
  title: string
  displayTitle?: string
  icon: React.ComponentProps<typeof Icon>['icon']
  content?: React.ReactNode
}

interface VerticalTabProps {
  className?: string
  showTitle?: boolean
  showIcon?: boolean
  active: string
  activeSetter(tab: string): void
  children?: React.ReactNode
  items: TabItem[]
}

export const NotFoundModule = (props: { activeItem: string }) => (
  <div>未找到模块 [ {props.activeItem} ] ,请检查 url 是否正确，以及是否有对应访问权限</div>
)

export const VerticalTab = (props: VerticalTabProps) => {
  const activeItem = props.items.find((item) => item.title === props.active)
  const content = props.children ?? activeItem?.content ?? (
    <NotFoundModule activeItem={props.active} />
  )
  const defaultIcon = 'info-sign'
  return (
    <div className={classnames('hf-vertical-tab', props.className)}>
      <div className="nav">
        {props.items.map((item) => (
          <li
            key={item.title}
            className={classnames('tab-item', { active: item.title === props.active })}
            onClick={() => props.activeSetter(item.title)}
          >
            {props.showIcon && <Icon icon={item.icon ?? defaultIcon} />}
            <span>{item.displayTitle ?? item.title}</span>
          </li>
        ))}
      </div>
      <div className="tab-content">
        {props.showTitle && (
          <div className="title">{activeItem?.displayTitle ?? activeItem?.title}</div>
        )}
        <div className="content">{content}</div>
      </div>
    </div>
  )
}
