import type { XTopicUserPublicInfo } from '@hai-platform/shared'
import React from 'react'
import { CONSTS, TOPIC_DEFAULT_AVATAR_SRC } from '../../../utils'

import './UserInfoClip.scss'

export interface XTopicUserInfoClipProps {
  userInfo?: XTopicUserPublicInfo | null
  className?: string
  author?: string
}

export const XTopicUserInfoClip = (props: XTopicUserInfoClipProps) => {
  return (
    <div className={`xtopic-user-info-clip ${props.className}`}>
      <div className="avatar-container">
        <img className="avatar" src={props.userInfo?.avatar || TOPIC_DEFAULT_AVATAR_SRC} />
      </div>
      <div className="bio-container">
        <h6 className="nickname" title={props.author}>
          {' '}
          {props.userInfo?.nickname || CONSTS.TOPIC_DEFAULT_NICK_NAME}
        </h6>
        {!!props.userInfo?.bio && <p className="bio">{props.userInfo?.bio}</p>}
      </div>
    </div>
  )
}
