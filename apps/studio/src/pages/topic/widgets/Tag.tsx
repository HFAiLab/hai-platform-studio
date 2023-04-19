import { Tag } from '@hai-ui/core/lib/esm'
import classNames from 'classnames'
import React from 'react'
import './Tag.scss'

type TagProps = React.ComponentProps<typeof Tag>
export const XTopicTag = (p: {
  className?: TagProps['className']
  onRemove?: TagProps['onRemove']
  minimal?: TagProps['minimal']
  interactive?: TagProps['interactive']
  onClick?: TagProps['onClick']
  children?: TagProps['children']
}) => {
  return (
    <Tag
      className={classNames('xtopic-tag', p.className)}
      minimal={p.minimal}
      // 默认的intent配色太素了, 可选 primary，或者 warning
      // primary 的蓝色相对和谐一些
      intent="primary"
      interactive={p.interactive}
      onRemove={p.onRemove}
      onClick={p.onClick}
      // 防止点击后focus
      tabIndex={null as any}
    >
      {p.children}
    </Tag>
  )
}
