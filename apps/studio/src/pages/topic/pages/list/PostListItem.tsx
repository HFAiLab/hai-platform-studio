import type { XTopicPostListResult } from '@hai-platform/client-ailab-server'
import { SVGWrapper } from '@hai-platform/studio-pages/lib/ui-components/svgWrapper'
import classNames from 'classnames'

// 获取 dayjs.fromNow 的类型定义
import 'dayjs/plugin/relativeTime'

import React, { useContext } from 'react'
import { CONSTS } from '../../../../consts'
import { GlobalContext } from '../../../../reducer/context'
import svgIconComment from '../../images/icon_comment.svg?raw'
import { XTopicDate } from '../../widgets/Date'
import { HeatIcon } from '../../widgets/Heat'
import { XTopicTag } from '../../widgets/Tag'

import './PostListItem.scss'

export interface PostListItemProps {
  item: XTopicPostListResult['rows'][0]
  skeleton: boolean
}

const PinIcon = (p: { pin: boolean }) => (p.pin ? <span className="pin-icon">置顶</span> : null)

export const PostListItem = (props: PostListItemProps) => {
  const globalContext = useContext(GlobalContext)
  const { xTopicListPageState } = globalContext.state

  const { skeleton } = props

  return (
    <div className="xtopic-post-list-item">
      {!skeleton && <HeatIcon heat={props.item.heat} showValue />}
      {skeleton && <div className={classNames('heat-placeholder', 'hai-ui-skeleton')} />}
      <div className="meta">
        <div className={classNames('title', { 'hai-ui-skeleton': skeleton })}>
          <a href={`#/topic/${props.item.index}`}>
            {props.item.title} <PinIcon pin={Boolean(props.item.pin)} />
          </a>
        </div>
        <div className="other">
          <p className={classNames('tags', { 'hai-ui-skeleton': skeleton })}>
            {(props.item.tags || []).map((t) => (
              <XTopicTag
                minimal
                key={t}
                onClick={() => {
                  globalContext.dispatch([
                    {
                      type: 'xTopicListPageState',
                      value: {
                        ...xTopicListPageState,
                        tags: [t],
                        page: 1,
                      },
                    },
                  ])
                }}
              >
                {t}
              </XTopicTag>
            ))}
          </p>
          {!skeleton && (
            <div className="right">
              {props.item.lastRepliedAt && (
                <span className="last-reply">
                  最近回复：
                  <XTopicDate date={props.item.lastRepliedAt} showFromNow />
                </span>
              )}
              <span className="created-at">
                <span title={props.item.author}>
                  {props.item.nickname || CONSTS.TOPIC_DEFAULT_NICK_NAME}
                </span>{' '}
                于 <XTopicDate date={props.item.createdAt} showFromNow />
                创建
              </span>

              <SVGWrapper
                svg={svgIconComment}
                fill="var(--hai-ui-text-secondary)"
                width={16}
                height={16}
              />
              <span className="comment-count">{props.item.repliesCount}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
