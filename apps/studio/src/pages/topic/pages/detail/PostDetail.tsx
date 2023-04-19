import type { XTopicReplyListParams } from '@hai-platform/client-ailab-server'
import { AilabServerApiName } from '@hai-platform/client-ailab-server'
import { createDialog } from '@hai-platform/studio-pages/lib/ui-components/dialog'
import { HFLoadingError } from '@hai-platform/studio-pages/lib/ui-components/HFLoading'
import { simpleCopy } from '@hai-platform/studio-pages/lib/utils/copyToClipboard'
import { XEditor } from '@hai-platform/x-editor'
import { Button } from '@hai-ui/core/lib/esm'
import classNames from 'classnames'
import React, { useContext, useEffect, useRef, useState } from 'react'
import ReactPaginate from 'react-paginate'
import { useNavigate, useParams } from 'react-router-dom'
import { useEffectOnce } from 'react-use/esm'
import { GrootStatus, useGroot } from 'use-groot'
import { GlobalAilabServerClient } from '../../../../api/ailabServer'
import { HFPanel } from '../../../../components/HFPanel'
import { GlobalTopicLikeTrigger } from '../../../../modules/xtopic/likeTrigger'
import { GlobalRefreshXtopicNotification } from '../../../../modules/xtopic/refreshNotification'
import { GlobalContext } from '../../../../reducer/context'
import {
  AppToaster,
  CONSTS,
  LevelLogger,
  TOPIC_DEFAULT_AVATAR_SRC,
  getUserName,
  vditorStaticUrl,
} from '../../../../utils'
import { AilabCountly, CountlyEventKey } from '../../../../utils/countly'
import { scrollToBottom } from '../../../../utils/scroll'
import { XTopicAboutTopic } from '../../common-blocks/AboutTopic'
import { XTopicBulletin } from '../../common-blocks/Bulletin'
import { promptUpdateNickName } from '../../utils'
import { XTopicDate } from '../../widgets/Date'
import type { XtopicMenuProps } from '../../widgets/MoreMenu'
import { XtopicMoreMenu } from '../../widgets/MoreMenu'
import { XtopicReportModal } from '../../widgets/ReportModal'
import { XTopicTag } from '../../widgets/Tag'
import { XTopicUpvoteButton } from '../../widgets/UpvoteButton'
import { ReplyInsert } from './ReplyInsert'
import { ReplyList } from './ReplyList'

import './PostDetail.scss'

export interface PostDetailParams {
  postIndex: string | undefined
  after?(): void
}

export interface PostDetailRichTextProps {
  markdown: string
  after?(): void
}

export const PostDetailRichText = React.memo((props: PostDetailRichTextProps) => {
  const replyContentDom = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (props.markdown && replyContentDom.current) {
      XEditor.render(replyContentDom.current, props.markdown, {
        staticURL: vditorStaticUrl,
        after: () => {
          if (props.after) {
            props.after()
          }
        },
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.markdown])

  return <div className="post-content" ref={replyContentDom} />
})

export const PostDetail = () => {
  const navigate = useNavigate()

  const params = useParams()
  const [replyPageSize] = useState(10)
  const [replyPage, setReplyPage] = useState(0)
  const globalContext = useContext(GlobalContext)
  const { xTopicListPageState, xTopicUser } = globalContext.state

  const [currentLike, setCurrentLike] = useState(0)
  const [reportDialogOpen, setReportDialogOpen] = useState(false)

  const [skeleton, setSkeleton] = useState(true)
  const pvReported = useRef(false)
  const [showInsertEditor, setShowInsertEditor] = useState(false)
  const [showInsertLoading, setShowInsertLoading] = useState(false)

  // 当前的评论引用的是哪个回复：
  const [referReplyIndex, setReferReplyIndex] = useState<number | null>(null)
  // 当前是不是有正在 loading 的
  const [loadingReferBtnIndex, setLoadingReferBtnIndex] = useState<number | null>(null)

  const checkShowInsertEditor = async () => {
    if (showInsertLoading) return false

    setShowInsertLoading(true)
    if (!xTopicUser || !xTopicUser.nickname) {
      const res = await promptUpdateNickName()
      if (res) {
        globalContext.dispatch([
          {
            type: 'xTopicListPageState',
            value: {
              ...xTopicListPageState,
              invokingNickNameEditor: true,
            },
          },
        ])
        navigate('/topic')
        return false
      }
      setShowInsertLoading(false)
      return false
    }
    setShowInsertLoading(false)
    setShowInsertEditor(true)
    return true
  }

  const setReferReplyIndexAndInsert = async (replyIndex: number) => {
    AilabCountly.safeReport(CountlyEventKey.XTopicReferClick)

    setLoadingReferBtnIndex(replyIndex)
    const res = await checkShowInsertEditor()
    if (res) {
      setReferReplyIndex(replyIndex)
      scrollToBottom()
    }
    setLoadingReferBtnIndex(null)
  }

  const postIndex = Number(params.postIndex)
  const {
    data: detail,
    refresh: refreshDetail,
    status: detailRequestStatus,
    error: detailError,
  } = useGroot({
    fetcher: () =>
      GlobalAilabServerClient.request(AilabServerApiName.XTOPIC_POST_DETAIL, { index: postIndex }),
    auto: true,
    swr: true, // 开启 swr 以减少闪烁
  })

  const { data: replyList, refresh: refreshReplyList } = useGroot({
    fetcher: (replyParams: XTopicReplyListParams) =>
      GlobalAilabServerClient.request(AilabServerApiName.XTOPIC_REPLY_LIST, replyParams),
    auto: false,
    swr: true, // 开启 swr 以减少闪烁
  })

  const referReply = (replyList?.rows || []).find((reply) => reply.index === referReplyIndex)

  useEffect(() => {
    if (Number.isNaN(postIndex)) {
      return
    }
    refreshReplyList({
      page: replyPage,
      pageSize: replyPageSize,
      postIndex: Number(postIndex),
    }).catch((e) => {
      LevelLogger.error('refreshReplyList error:', e)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [replyPage, replyPageSize])

  const jumpToLastReplyPage = () => {
    if (!replyList) return
    // 这里有一个特殊的效果，当整除的时候，正好可以翻到下一页
    const lastPage = Math.floor(replyList.count / replyPageSize)
    if (lastPage === replyPage) refreshReplyList()
    else setReplyPage(lastPage)
  }

  useEffect(() => {
    if (detail) {
      setCurrentLike(detail.likeCount)
    }
  }, [detail])

  // 管理相关的或者管理员能否删帖：
  const enableDelete = detail?.isSelfPost && replyList && replyList.count === 0

  const enableDeleteByAdmin = xTopicUser?.isTopicAdmin

  const deletePost = async () => {
    if (!detail) return
    const res = await createDialog({
      body: '删除话题后，不可恢复',
      title: '是否确认删除话题',
      intent: 'danger',
      confirmText: '确认删除',
      cancelText: '取消',
    })
    if (!res) return
    try {
      await GlobalAilabServerClient.request(AilabServerApiName.XTOPIC_POST_DELETE, undefined, {
        data: {
          postIndex: detail.index,
        },
      })
      AppToaster.show({
        message: '删除成功',
        intent: 'success',
        icon: 'tick',
      })
      GlobalRefreshXtopicNotification.checkUnreadNotification()
      navigate('/topic')
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
        setReportDialogOpen(true)
      },
    },
  ]
  if (enableDelete) {
    menuSettings.unshift({
      text: '删除',
      intent: 'danger',
      onClick: () => {
        deletePost()
      },
    })
  }
  if (enableDeleteByAdmin) {
    menuSettings.unshift({
      text: '删除（管理员操作）',
      intent: 'danger',
      onClick: () => {
        deletePost()
      },
    })
  }

  const postInvokeLike = () => {
    if (!detail) return
    setCurrentLike(currentLike + 1)
    GlobalTopicLikeTrigger.trigger(
      {
        contentType: 'post',
        itemIndex: detail.index,
        itemUUID: detail.uuid,
        username: getUserName(),
        likeCount: 1,
      },
      async () => {
        await refreshDetail()
      },
    )
  }

  useEffectOnce(() => {
    return () => {
      if (!detail) return
      GlobalTopicLikeTrigger.removeCallback({
        contentType: 'post',
        itemIndex: detail.index,
        itemUUID: detail.uuid,
        username: getUserName(),
      })
    }
  })

  const notFound = !detail && detailRequestStatus === GrootStatus.success

  // 有两处会会用到，封装一个函数
  const countAndPagi = (atBottom: boolean) => {
    if (!replyList) {
      return null
    }
    if (atBottom && replyList.count <= replyPageSize) {
      return null
    }
    return (
      <div className={classNames('xtopic-detail-reply-count', { bottom: atBottom })}>
        {atBottom ? undefined : (
          <span className={classNames('count', { 'no-reply': (replyList?.count ?? 0) === 0 })}>
            {replyList?.count > 0 ? `共 ${replyList?.count} 回复` : null}
          </span>
        )}
        {replyList?.count > replyPageSize && (
          <div className="pagi">
            <span className="pagi-show">
              {`展示 ${replyPage * replyPageSize + 1} - ${Math.min(
                (replyPage + 1) * replyPageSize,
                replyList.count,
              )}`}
            </span>
            <ReactPaginate
              previousLabel="<"
              nextLabel=">"
              breakLabel="..."
              breakClassName="break-me"
              pageCount={Math.ceil(replyList.count / replyPageSize)}
              marginPagesDisplayed={1}
              pageRangeDisplayed={3}
              onPageChange={(changeInfo) => {
                setReplyPage(changeInfo.selected)
              }}
              containerClassName="common-pagination"
              activeClassName="active"
              forcePage={replyPage}
            />
          </div>
        )}
      </div>
    )
  }

  const contentRenderSuccessCallback = React.useCallback(() => {
    setSkeleton(false)
  }, [])

  useEffect(() => {
    if (!detail || pvReported.current) return
    pvReported.current = true
    GlobalAilabServerClient.request(AilabServerApiName.XTOPIC_POST_VISIT, undefined, {
      data: {
        postIndex: detail.index,
      },
    })
  }, [detail])

  return (
    <div className="xtopic-wrapper">
      <div className="main xtopic-detail-container">
        <HFPanel disableLoading shadow className="xtopic-detail-panel topic">
          <div>
            {!notFound && skeleton && !detailError && !detail && (
              <div className="xtopic-detail-skeleton">
                <div className="top-placeholder hai-ui-skeleton" />
                <div className="title-placeholder hai-ui-skeleton" />
                <div className="meta-placeholder hai-ui-skeleton" />
                <div className="content-placeholder hai-ui-skeleton" />
                <div className="content-placeholder hai-ui-skeleton" />
                <div className="content-placeholder hai-ui-skeleton" />
              </div>
            )}
            {detailRequestStatus === GrootStatus.error && detailError && (
              <div className="xtopic-detail-error-container">
                <HFLoadingError
                  message="获取话题详情失败，请稍后重试"
                  retryText="尝试重新获取"
                  retry={() => {
                    refreshDetail()
                  }}
                />
              </div>
            )}
            {notFound && <div className="xtopic-notfound">话题不存在或已经被删除</div>}
            {detail && (
              <>
                <div className="detail-header">
                  <div className="tags">
                    {detail.tags.map((t) => (
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
                          navigate('/topic')
                        }}
                      >
                        {t}
                      </XTopicTag>
                    ))}
                  </div>
                  <Button
                    small
                    outlined
                    intent="primary"
                    onClick={() => simpleCopy(`#${detail.index}`, `#${detail.index}`, AppToaster)}
                  >
                    复制话题 ID #{detail.index}
                  </Button>
                </div>
                <div className="title">{detail.title}</div>
                <div className="meta">
                  {detail.userInfo?.avatar && (
                    <img
                      className="avatar"
                      src={detail.userInfo.avatar || TOPIC_DEFAULT_AVATAR_SRC}
                    />
                  )}
                  <span className="nickname" title={detail.author}>
                    {detail.nickname || CONSTS.TOPIC_DEFAULT_NICK_NAME}
                  </span>
                  发布于&nbsp; <XTopicDate date={detail.createdAt} showFromNow />
                  <XTopicUpvoteButton upvoteValue={currentLike} onClick={postInvokeLike} minimal />
                </div>
                <div className="hr" />
                {!detail.content.trim() && (
                  <div className="detail-empty-placeholder">该话题无正文描述</div>
                )}
                <PostDetailRichText
                  markdown={detail.content}
                  after={contentRenderSuccessCallback}
                />
                <div className="footer-meta">
                  <div className="left">
                    <XTopicUpvoteButton
                      text="好话题"
                      upvoteValue={currentLike}
                      onClick={postInvokeLike}
                    />
                  </div>
                  <div className="right">
                    <XtopicMoreMenu className="more-menu" menuSettings={menuSettings} />
                    {detail.editorTimeList.length ? (
                      <span>
                        编辑于 <XTopicDate date={detail.updatedAt} />
                      </span>
                    ) : (
                      <span>
                        发布于 <XTopicDate date={detail.createdAt} />
                      </span>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </HFPanel>
        {!!replyList?.count && countAndPagi(false)}
        {!skeleton && !!replyList?.count && (
          <ReplyList
            loadingReferBtnIndex={loadingReferBtnIndex}
            replyList={replyList}
            refreshReplyList={refreshReplyList}
            refreshDetailHandler={refreshDetail}
            referReplyInvokeCallback={setReferReplyIndexAndInsert}
          />
        )}
        {!!replyList?.count && countAndPagi(true)}
        {!skeleton && !showInsertEditor && (
          <div className="add-insert-editor-container">
            <Button
              icon="plus"
              loading={showInsertLoading}
              intent="primary"
              className="add-insert-editor-btn"
              onClick={() => {
                AilabCountly.safeReport(CountlyEventKey.XTopicReplyClick)
                checkShowInsertEditor()
              }}
            >
              写回复
            </Button>
          </div>
        )}
        {!skeleton && showInsertEditor && (
          <ReplyInsert
            referReply={referReply}
            post={detail}
            successCallback={() => {
              refreshDetail()
              jumpToLastReplyPage()
            }}
            invokeCancelRefer={() => {
              setReferReplyIndex(null)
            }}
          />
        )}
      </div>
      <div className="side">
        <XTopicBulletin />
        {detail && (
          <XTopicAboutTopic
            author={detail.author}
            createdAt={detail.createdAt}
            heat={detail.heat}
            replyCount={replyList?.count ?? 0}
            topicLikeCount={currentLike}
            nickname={detail.nickname}
          />
        )}
        {}
      </div>
      {detail && (
        <XtopicReportModal
          isOpen={reportDialogOpen}
          closeHandler={() => {
            setReportDialogOpen(false)
          }}
          contentType="post"
          index={detail.index ?? -1}
          nickname={detail.nickname ?? CONSTS.TOPIC_DEFAULT_NICK_NAME}
          topic={detail.title}
          uuid={detail.uuid}
        />
      )}
    </div>
  )
}
