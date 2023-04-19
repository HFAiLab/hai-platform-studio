import { Colors } from '@hai-ui/colors'
import { Callout, Drawer, Icon, Position } from '@hai-ui/core'
import React, { useContext, useEffect, useState } from 'react'
import { PersonaEditor } from '../../../biz-components/PersonaEditor'
import { HFPanel } from '../../../components/HFPanel'
import { GlobalContext } from '../../../reducer/context'
import { CONSTS, TOPIC_DEFAULT_AVATAR_SRC } from '../../../utils'
import { NotificationButton } from '../widgets/NotificationPopover'

import './Persona.scss'

export const XTopicPersona = (props: { noNotification?: boolean }) => {
  const globalContext = useContext(GlobalContext)
  const { xTopicUser: user, xTopicListPageState } = globalContext.state

  const [showPersonaEditorDrawer, setShowPersonaEditorDrawer] = useState<boolean>(false)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const openEditorDrawer = (type: unknown) => {
    setShowPersonaEditorDrawer(true)
  }

  useEffect(() => {
    if (xTopicListPageState.invokingNickNameEditor) {
      openEditorDrawer('nickname')
      globalContext.dispatch([
        {
          type: 'xTopicListPageState',
          value: {
            ...xTopicListPageState,
            invokingNickNameEditor: false,
          },
        },
      ])
    }
  })

  return (
    <HFPanel className="xtopic-persona" shadow disableLoading>
      <div className="content">
        <div className="avatar" onClick={() => openEditorDrawer('avatar')}>
          <img
            className="avatar-img"
            src={user?.avatar || TOPIC_DEFAULT_AVATAR_SRC}
            alt="暂无头像"
          />
          <label className="edit-overlay">
            <Icon icon="camera" color="white" />
          </label>
        </div>
        <div className="nickname" title="更改昵称" onClick={() => openEditorDrawer('nickname')}>
          {user?.nickname || CONSTS.TOPIC_DEFAULT_NICK_NAME}
          <Icon size={16} color={Colors.ORANGE3} icon="edit" />
        </div>
        <div className="bio" onClick={() => openEditorDrawer('bio')}>
          {user?.bio || '未填写个人简介'}
        </div>
        {user?.nickname ? (
          <div className="stats">
            <div className="col vec-divide">
              <div className="stats-header">收到的赞</div>
              <div className="stats-value">{user.likes ?? 0}</div>
            </div>
            <div className="col vec-divide">
              <div className="stats-header">我的回复</div>
              <div className="stats-value">{user.replies ?? 0}</div>
            </div>
            <div className="col">
              <div className="stats-header">创建话题</div>
              <div className="stats-value">{user.posts ?? 0}</div>
            </div>
          </div>
        ) : (
          <Callout intent="none" icon="info-sign" className="persona-warning-tip">
            为了能让让大家更好的认识你，来
            <a onClick={() => openEditorDrawer('all')}>设置昵称和头像</a>吧
          </Callout>
        )}
        {user && !props.noNotification && <NotificationButton />}
      </div>
      <Drawer
        isOpen={showPersonaEditorDrawer}
        className="avatar-upload-dialog"
        onClose={() => {
          setShowPersonaEditorDrawer(false)
          globalContext.dispatchers.updateXTopicUser()
        }}
        title="修改昵称头像"
        position={Position.LEFT}
        hasBackdrop
        style={{ width: '720px' }}
      >
        <PersonaEditor user={user} fetchUser={globalContext.dispatchers.updateXTopicUser} />
      </Drawer>
    </HFPanel>
  )
}
