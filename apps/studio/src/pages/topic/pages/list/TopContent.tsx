import type { XTopicTopContentListResult } from '@hai-platform/client-ailab-server'
import classNames from 'classnames'
import React from 'react'

import './TopContent.scss'

export interface TopContentProps {
  topContents: XTopicTopContentListResult | undefined
  skeleton?: boolean
}

export const XTopicTopContent = (props: TopContentProps) => {
  let topContents = (props.topContents?.list || []).slice(0, 2) // 最多展示 2 条，多了不好看了

  if (props.skeleton) {
    const defaultContent = new Array(2).fill({ title: '-', description: '-' })
    topContents = defaultContent
  }

  if (!topContents.length && !props.skeleton) {
    return <div />
  }

  return (
    <div className="xtopic-top-content-container">
      {topContents.map((topContent) => {
        return (
          <a
            target="_blank"
            href={topContent.link}
            // 渲染骨架图时key可能为空
            key={topContent.link ?? Math.random()}
            className={classNames('xtopic-top-content-block', {
              'ailab-skeleton-light': props.skeleton,
            })}
            rel="noreferrer"
          >
            <div
              className="img-container"
              style={{
                backgroundImage: topContent.image ? `url(${topContent.image})` : ``,
              }}
            />
            <div className="img-overlay" />
            <div className="xtopic-top-title-and-content">
              <p
                className={classNames('hai-ui-heading title', {
                  'hai-ui-skeleton': props.skeleton,
                })}
              >
                {topContent.title}
              </p>
              {topContent.description && (
                <p
                  className={classNames('content', {
                    'hai-ui-skeleton': props.skeleton,
                  })}
                >
                  {topContent.description}
                </p>
              )}
            </div>
          </a>
        )
      })}
    </div>
  )
}
