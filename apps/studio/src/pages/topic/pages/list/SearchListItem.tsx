/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable react/no-danger */
import type { MeiliXTopicReply, XTopicMeiliSearchResultPost } from '@hai-platform/shared'
import { MeiliHighlightPostTag, MeiliHighlightPreTag } from '@hai-platform/shared'
import { SVGWrapper } from '@hai-platform/studio-pages/lib/ui-components/svgWrapper'
import classNames from 'classnames'
import React, { useContext } from 'react'
import { GlobalContext } from '../../../../reducer/context'
import svgIconComment from '../../images/icon_comment.svg?raw'
import { XTopicTag } from '../../widgets/Tag'

import './SearchListItem.scss'

export interface SearchListItemProps {
  searchItem: XTopicMeiliSearchResultPost

  skeleton: boolean
}

const MAX_VIEW_NUMBER = 200

/**
 * 返回一段用于预览的内容
 */
const getHighlightContent = (sourceContent: string) => {
  if (!sourceContent) return ''
  const content = sourceContent.replace(/\n/g, '')

  // 如果没有高亮的，简单返回前一部分字符就行
  if (!content.includes(MeiliHighlightPreTag)) return content.slice(0, MAX_VIEW_NUMBER)

  // 如果有高亮的部分，从高亮的前一段开始粗处理：
  const firstBeginIndex = content.indexOf(MeiliHighlightPreTag)
  const beginIndex = Math.max(firstBeginIndex - 20, 0)
  const sliced = content.slice(beginIndex)

  // 避免尾部太长
  let endIndex = 0
  const endIndexMax = sliced.length - 1

  while (endIndex < MAX_VIEW_NUMBER && endIndex < endIndexMax) {
    const nextPostTagIndex = sliced.indexOf(MeiliHighlightPostTag, endIndex)
    if (nextPostTagIndex === -1) endIndex += MAX_VIEW_NUMBER
    else {
      endIndex = endIndex + nextPostTagIndex + MeiliHighlightPostTag.length
    }
  }

  const slicedCutEnd = sliced.slice(0, endIndex)

  return beginIndex === 0 ? slicedCutEnd : `...${slicedCutEnd}`
}

const getReplies = (replies: MeiliXTopicReply[]) => {
  const showReplies: MeiliXTopicReply[] = []
  for (const reply of replies) {
    if (!(reply.content || '').includes(MeiliHighlightPreTag)) {
      continue
    }
    const content = getHighlightContent(reply.content || '')
    if (content) {
      showReplies.push({
        ...reply,
        content,
      })
      if (showReplies.length >= 2) return showReplies
    }
  }
  return showReplies
}

/**
 * 单一搜索结果条目，后面可能分拆成多种
 * @param searchItem
 * @returns JSX.Element
 */
export const SearchListItem = (props: SearchListItemProps) => {
  const { searchItem } = props
  const globalContext = useContext(GlobalContext)

  if (props.skeleton) {
    return (
      <div className="search-item-skeleton">
        <div className="search-item-title hai-ui-skeleton" />
        <div className="search-item-content hai-ui-skeleton" />
        <div className="search-item-bottom hai-ui-skeleton" />
      </div>
    )
  }

  const { xTopicListPageState } = globalContext.state
  const searchContent = getHighlightContent(searchItem._formatted.content || '')
  const showReplies = getReplies(searchItem._formatted.replies)

  return (
    <div className="xtopic-search-list-item">
      <div className="meta">
        <a
          className="title"
          href={`#/topic/${searchItem.index}`}
          dangerouslySetInnerHTML={{ __html: searchItem._formatted.title! }}
        />
      </div>
      {searchContent && (
        <div className="post">
          <p className="post-content" dangerouslySetInnerHTML={{ __html: searchContent }} />
        </div>
      )}
      {!!showReplies.length && (
        <div className="reply-container">
          {showReplies.map((reply) => {
            return (
              <div className="reply-snapshot">
                <div className="reply-title">
                  {reply.nickname || ''} 在 {reply.floorIndex} 楼的回复提及了相关内容：
                </div>
                <div
                  className="reply-content"
                  dangerouslySetInnerHTML={{ __html: reply.content! }}
                />
              </div>
            )
          })}
        </div>
      )}

      <div className="other">
        <p className={classNames('tags')}>
          {(searchItem.tags || []).map((t) => (
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
        <div className="right">
          <SVGWrapper
            svg={svgIconComment}
            fill="var(--hai-ui-text-secondary)"
            width={16}
            height={16}
          />
          <span className="comment-count">{searchItem.replies.length}</span>
        </div>
      </div>
    </div>
  )
}
