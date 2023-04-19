import React from 'react'
import { HFPanel } from '../../../components/HFPanel'
import { CONSTS } from '../../../consts'
import { XTopicDate } from '../widgets/Date'
import { HeatIcon } from '../widgets/Heat'

import './AboutTopic.scss'

export const XTopicAboutTopic = (p: {
  heat: number
  author: string
  createdAt: Date | string
  topicLikeCount: number
  replyCount: number
  nickname?: string
}) => {
  return (
    <HFPanel className="xtopic-about-topic" shadow title="关于该话题" disableLoading nanoTopPadding>
      <div className="content">
        <div className="current-heat">
          当前热力值
          <HeatIcon heat={p.heat} />
          <span className="heat-value">{p.heat}</span>
        </div>
        <div className="author">
          由 <span title={p.author}>{p.nickname || CONSTS.TOPIC_DEFAULT_NICK_NAME}</span> 创建于{' '}
          <XTopicDate date={p.createdAt} />
        </div>
        <div className="topic-like-count">话题收到 {p.topicLikeCount} 个赞</div>
        <div className="reply-count">共 {p.replyCount} 回复</div>
      </div>
    </HFPanel>
  )
}
