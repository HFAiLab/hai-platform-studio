import type {
  ReferReplyMinimalInfo,
  XTopicReplyExtendedSchema,
  XTopicReplyListResult,
} from '@hai-platform/client-ailab-server'
import { AilabServerApiName } from '@hai-platform/client-ailab-server'
import { createDialog } from '@hai-platform/studio-pages/lib/ui-components/dialog'
import { XEditor } from '@hai-platform/x-editor'
import { Button } from '@hai-ui/core'
import classNames from 'classnames'
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { GlobalAilabServerClient } from '../../../../api/ailabServer'
import { HFPanel } from '../../../../components/HFPanel'
import { GlobalTopicLikeTrigger } from '../../../../modules/xtopic/likeTrigger'
import { GlobalRefreshXtopicNotification } from '../../../../modules/xtopic/refreshNotification'
import { GlobalContext } from '../../../../reducer/context'
import { AppToaster, CONSTS, getUserName, vditorStaticUrl } from '../../../../utils'
import { XTopicDate } from '../../widgets/Date'
import type { XtopicMenuProps } from '../../widgets/MoreMenu'
import { XtopicMoreMenu } from '../../widgets/MoreMenu'
import { XtopicReportModal } from '../../widgets/ReportModal'
import { XTopicUpvoteButton } from '../../widgets/UpvoteButton'
import { XTopicUserInfoClip } from '../../widgets/UserInfoClip'

import './ReplyList.scss'

// 显示展开和收起按钮的最小高度
const MIN_EXPAND_HEIGHT = 300
// max-height 补偿高度：只影响动画时间，没啥别的影响：
const EXPAND_SUPPLEMENT = 200

export interface ReplyRichTextProps {
  markdown: string
  className?: string
  toExpandShowText: string
  toStowShowText: string
}

export const ReplyRichText = React.memo((props: ReplyRichTextProps) => {
  const replyContentDom = useRef<HTMLDivElement | null>(null)
  const [contentRenderSuccess, setContentRenderSuccess] = useState(false)
  const [contentExpand, setContentExpand] = useState(true)
  const [showExpandAndStow, setShowExpandAndStow] = useState(false)

  const [maxHeight, setMaxHeight] = useState(-1)

  useEffect(() => {
    if (props.markdown && replyContentDom.current) {
      XEditor.render(replyContentDom.current, props.markdown, {
        staticURL: vditorStaticUrl,
        after: () => {
          setContentRenderSuccess(true)
          const currentContentHeight = replyContentDom.current?.offsetHeight || 0
          if (currentContentHeight > MIN_EXPAND_HEIGHT) {
            setShowExpandAndStow(true)
            setContentExpand(false)
            setMaxHeight(currentContentHeight + EXPAND_SUPPLEMENT)
          }
          // hint: 可以在这里增加一些逻辑，完成点击再展开详情的功能
        },
      })
    }
  }, [props.markdown])

  const notExpand = !contentExpand && contentRenderSuccess

  return (
    <div
      className={classNames(
        'reply-rich-text-container',
        {
          'not-expand': notExpand,
          'loading': !contentRenderSuccess,
        },
        props.className,
      )}
      style={{
        maxHeight: !notExpand && maxHeight !== -1 ? maxHeight : '',
      }}
    >
      <div className="content" ref={replyContentDom} />
      {contentRenderSuccess && showExpandAndStow && !contentExpand && (
        <div className="content-ref-block-operation">
          <div className="gradient-container" />
          <div className="solid-container">
            <Button
              minimal
              intent="primary"
              rightIcon="chevron-down"
              onClick={() => {
                setContentExpand(true)
              }}
            >
              {props.toExpandShowText}
            </Button>
          </div>
        </div>
      )}
      {contentRenderSuccess && showExpandAndStow && contentExpand && (
        <div className="content-ref-block-up-operation">
          <div className="solid-container">
            <Button
              minimal
              intent="primary"
              rightIcon="chevron-up"
              onClick={() => {
                setContentExpand(false)
              }}
            >
              {props.toStowShowText}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
})

export const ReplyReferRichText = (props: { referReply?: ReferReplyMinimalInfo }) => {
  return (
    <div className="reply-refer-container">
      {props.referReply && (
        <>
          <div className="reply-refer-header">
            引用「{props.referReply.userInfo?.nickname || ''}」{props.referReply.floorIndex}楼
            的回复：
          </div>
          <div className="reply-refer-content">
            <ReplyRichText
              markdown={props.referReply.content}
              toExpandShowText="展开引用"
              toStowShowText="收起"
              className="refer-reply"
            />
          </div>
        </>
      )}
      {!props.referReply && <div className="reply-refer-delete-tip">引用的回复已经被删除</div>}
    </div>
  )
}

export const ReplyItem = React.memo(
  (props: {
    reply: XTopicReplyExtendedSchema
    refreshDetailHandler(): void
    refreshReplyList(): void
    referReplyInvokeCallback(index: number): void
    reportHandler(reply: XTopicReplyExtendedSchema): void
    referLoading: boolean
  }) => {
    const [currentLike, setCurrentLike] = useState(props.reply.likeCount)
    const globalContext = useContext(GlobalContext)
    const { xTopicUser } = globalContext.state

    const enableDelete = props.reply.isSelfReply
    const enableDeleteByAdmin = xTopicUser?.isTopicAdmin

    const deleteReply = async () => {
      if (!props.reply) return
      const res = await createDialog({
        body: '删除回复后，不可恢复',
        title: '是否确认删除回复',
        intent: 'danger',
        confirmText: '确认删除',
        cancelText: '取消',
      })
      if (!res) return
      try {
        await GlobalAilabServerClient.request(AilabServerApiName.XTOPIC_REPLY_DELETE, undefined, {
          data: {
            replyIndex: props.reply.index,
          },
        })
        AppToaster.show({
          message: '删除成功',
          intent: 'success',
          icon: 'tick',
        })
        props.refreshReplyList()
        GlobalRefreshXtopicNotification.checkUnreadNotification()
      } catch (e) {
        AppToaster.show({
          message: `删除失败：${e}`,
          intent: 'danger',
        })
      }
    }

    const menuSettings: XtopicMenuProps = [
      {
        text: '举报/投诉',
        onClick: () => {
          props.reportHandler(props.reply)
        },
      },
    ]
    if (enableDelete) {
      menuSettings.unshift({
        text: '删除',
        intent: 'danger',
        onClick: deleteReply,
      })
    }
    if (enableDeleteByAdmin) {
      menuSettings.unshift({
        text: '删除（管理员操作）',
        intent: 'danger',
        onClick: deleteReply,
      })
    }

    useEffect(() => {
      setCurrentLike(props.reply.likeCount)
    }, [props.reply.likeCount])

    const replyInvokeLike = () => {
      setCurrentLike(currentLike + 1)
      GlobalTopicLikeTrigger.trigger(
        {
          contentType: 'reply',
          itemIndex: props.reply.index,
          itemUUID: props.reply.uuid,
          username: getUserName(),
          likeCount: 1,
        },
        async () => {
          await props.refreshDetailHandler()
        },
      )
    }

    return (
      <HFPanel disableLoading shadow className="xtopic-detail-panel xtopic-reply-panel">
        <div className="meta-reply">
          <div className="meta-reply-line">
            <XTopicUserInfoClip
              className="reply-user-clip"
              userInfo={props.reply.userInfo}
              author={props.reply.author}
            />
            <div className="meta-reply-floor">
              <div className="floor-tip">{props.reply.floorIndex} 楼</div>
              <Button
                intent="primary"
                minimal
                loading={props.referLoading}
                onClick={() => {
                  props.referReplyInvokeCallback(props.reply.index)
                }}
              >
                引用
              </Button>
            </div>
          </div>
          {currentLike > 0 && <div className="like-count">收到 {currentLike} 个「有用」</div>}
        </div>

        {props.reply.referReplyIndex && <ReplyReferRichText referReply={props.reply.referReply} />}
        <ReplyRichText
          markdown={props.reply.content}
          toExpandShowText="展开回复"
          toStowShowText="收起"
          className="reply"
        />
        <div className="footer-meta">
          <div className="left">
            <XTopicUpvoteButton text="有用" upvoteValue={currentLike} onClick={replyInvokeLike} />
          </div>
          <div className="right">
            <XtopicMoreMenu className="more-menu" menuSettings={menuSettings} />
            {props.reply.editorTimeList.length ? (
              <span>
                编辑于 <XTopicDate date={props.reply.updatedAt} />
              </span>
            ) : (
              <span>
                发布于 <XTopicDate date={props.reply.createdAt} />
              </span>
            )}
          </div>
        </div>
      </HFPanel>
    )
  },
)

export const ReplyList = (props: {
  replyList: XTopicReplyListResult | undefined
  refreshDetailHandler(): void
  refreshReplyList(): void
  loadingReferBtnIndex: number | null
  referReplyInvokeCallback(index: number): void
}) => {
  const [reportDialogOpen, setReportDialogOpen] = useState(false)
  const [replyToReport, setReplyToReport] = useState<XTopicReplyExtendedSchema | null>(null)

  // 举报
  const handleReport = useCallback((reply: XTopicReplyExtendedSchema) => {
    setReplyToReport(reply)
    setReportDialogOpen(true)
  }, [])

  return (
    <div className="reply-list-panel">
      {props.replyList &&
        props.replyList.rows.map((reply) => {
          return (
            <ReplyItem
              reply={reply}
              key={reply.uuid}
              refreshReplyList={props.refreshReplyList}
              referReplyInvokeCallback={props.referReplyInvokeCallback}
              referLoading={props.loadingReferBtnIndex === reply.index}
              refreshDetailHandler={props.refreshDetailHandler}
              reportHandler={handleReport}
            />
          )
        })}
      {replyToReport && (
        <XtopicReportModal
          isOpen={reportDialogOpen}
          closeHandler={() => {
            setReportDialogOpen(false)
          }}
          contentType="reply"
          index={replyToReport.index}
          nickname={replyToReport.nickname ?? CONSTS.TOPIC_DEFAULT_NICK_NAME}
          uuid={replyToReport.uuid}
        />
      )}
    </div>
  )
}
