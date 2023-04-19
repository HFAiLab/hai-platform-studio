import type {
  XTopicPostExtendedSchema,
  XTopicReplyExtendedSchema,
} from '@hai-platform/client-ailab-server'
import { AilabServerApiName } from '@hai-platform/client-ailab-server'
import { SVGWrapper } from '@hai-platform/studio-pages/lib/ui-components/svgWrapper'
import type { XEditor } from '@hai-platform/x-editor'
import { Button } from '@hai-ui/core/lib/esm'
import React, { useContext, useEffect, useRef } from 'react'
import { GlobalAilabServerClient } from '../../../../api/ailabServer'
import { HFPanel } from '../../../../components/HFPanel'
import { XTopicEditor, checkMarkdown } from '../../../../components/MarkdownEditor'
import ReferSvg from '../../../../components/svg/refer.svg?raw'
import { GlobalContext } from '../../../../reducer/context'
import { AppToaster, getUserName } from '../../../../utils'
import { InternalWarningLine } from '../../widgets/InternalWarning'

import './ReplyInsert.scss'

export interface ReplyInsertProps {
  post: XTopicPostExtendedSchema | undefined
  successCallback?(): void
  referReply: XTopicReplyExtendedSchema | undefined
  invokeCancelRefer(): void
}

export const ReplyInsert = (props: ReplyInsertProps) => {
  const XEditorInstance = useRef<XEditor | null>(null)
  const globalContext = useContext(GlobalContext)

  const onEditorInit = (instance: XEditor) => {
    XEditorInstance.current = instance
  }

  const insertReply = () => {
    if (!XEditorInstance.current) {
      AppToaster.show({
        message: '编辑器初始化未成功，请稍后重试',
        intent: 'warning',
      })
      return
    }
    if (!props.post) return

    const result = checkMarkdown(XEditorInstance.current)

    if (!result.success) {
      AppToaster.show({
        message: result.message || '',
        intent: 'danger',
      })
      return
    }

    const currentMarkdown = XEditorInstance.current.vditor.getValue()

    GlobalAilabServerClient.request(AilabServerApiName.XTOPIC_REPLY_INSERT, undefined, {
      data: {
        content: currentMarkdown,
        author: getUserName(),
        postIndex: props.post.index,
        referReplyIndex: props.referReply?.index,
      },
    }).then(() => {
      XEditorInstance.current!.vditor.setValue('')
      AppToaster.show({
        message: '回帖发布成功',
        intent: 'success',
        icon: 'tick',
      })
      if (props.successCallback) {
        props.successCallback()
      }
    })
  }

  useEffect(() => {
    if (!XEditorInstance.current) return
    try {
      // scrollToBottom()
      XEditorInstance.current.vditor.focus()
    } catch (e) {
      // do nothing
    }
  }, [props.referReply])

  return (
    <div className="reply-insert-container">
      <div className="reply-insert-meta">
        <span className="add-reply">添加我的回复</span>
      </div>
      <HFPanel className="xtopic-tags-filter" shadow disableLoading>
        <div className="reply-insert-tip">
          <div className="name-tip">
            以「{globalContext.state.xTopicUser?.nickname || ''}」撰写回复
          </div>
          <div className="desc-tip">请尽量让自己的回复对别人有所帮助</div>
        </div>
        {!!props.referReply && (
          <div className="reply-refer-tip">
            <SVGWrapper svg={ReferSvg} dClassName="reply-refer-tip-svg" />
            当前编辑的回复引用了 {props.referReply.floorIndex} 层 「{' '}
            {props.referReply.userInfo?.nickname} 」的发言。
            <Button minimal intent="primary" onClick={props.invokeCancelRefer}>
              取消引用
            </Button>
          </div>
        )}
        <InternalWarningLine />
        <XTopicEditor onAfter={onEditorInit} cacheKey="disable" />
        <div className="reply-insert-ops">
          <Button intent="primary" onClick={insertReply}>
            发布回复
          </Button>
        </div>
      </HFPanel>
    </div>
  )
}
