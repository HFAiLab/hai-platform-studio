import type { XTopicTagDisplayInfo } from '@hai-platform/client-ailab-server'
import { AilabServerApiName } from '@hai-platform/client-ailab-server'
import { createDialog } from '@hai-platform/studio-pages/lib/ui-components/dialog'
import type { XEditor } from '@hai-platform/x-editor'
import { Button, FormGroup, InputGroup } from '@hai-ui/core/lib/esm'
import React, { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEffectOnce } from 'react-use/esm'
import { GlobalAilabServerClient } from '../../../../api/ailabServer'
import { HFPanel } from '../../../../components/HFPanel'
import { XTopicEditor } from '../../../../components/MarkdownEditor'
import { TagSelectInput } from '../../../../components/TagSelectInput'
import { AppToaster, getUserName } from '../../../../utils'
import { AilabCountly, CountlyEventKey } from '../../../../utils/countly'
import { InternalWarningLine } from '../../widgets/InternalWarning'

import './PostInsert.scss'

export interface PostInsertLabelProps {
  title?: string
  description?: string
}

export const PostInsertLabel = (props: PostInsertLabelProps) => {
  return (
    <div className="post-insert-label">
      {!!props.title && <h5>{props.title}</h5>}
      {!!props.description && <p>{props.description} </p>}
    </div>
  )
}

export const PostInsert = () => {
  const XEditorInstance = useRef<XEditor | null>(null)
  const navigate = useNavigate()

  const [title, setTitle] = useState<string>('')

  const [currentTags, setCurrentTags] = useState<string[]>([])
  const [allTags, setAllTags] = useState<XTopicTagDisplayInfo[]>([])

  const onEditorInit = (instance: XEditor) => {
    XEditorInstance.current = instance
  }

  const insert = async () => {
    const content = XEditorInstance.current!.vditor.getValue()

    if (!title) {
      AppToaster.show({
        message: '请输入话题标题',
        intent: 'danger',
      })
      return
    }

    if (!currentTags.length) {
      AppToaster.show({
        message: '请输入至少一个标签',
        intent: 'danger',
      })
      return
    }

    const res = await createDialog({
      body: '话题发布后，在没有评论之前可以删除',
      title: '是否确认发布',
      intent: 'primary',
      confirmText: '确认发布',
      cancelText: '取消',
    })

    if (!res) return

    GlobalAilabServerClient.request(AilabServerApiName.XTOPIC_POST_INSERT, undefined, {
      data: {
        title,
        content,
        author: getUserName(),
        category: ['技术'],
        tags: currentTags,
        pin: 0,
      },
    })
      .then(() => {
        AppToaster.show({
          message: '发布成功',
          icon: 'tick',
          intent: 'success',
        })
        XEditorInstance.current!.vditor.setValue('')
        navigate('/topic')
      })
      .catch((e) => {
        AppToaster.show({
          message: `提交失败：${e}`,
          intent: 'danger',
        })
      })
  }

  useEffectOnce(() => {
    GlobalAilabServerClient.request(AilabServerApiName.XTOPIC_TOP_TAG_LIST, {
      showAll: true,
    }).then((res) => {
      setAllTags(res.tags)
    })
  })

  const getSuggestions = (value: string, tags: string[]) => {
    return allTags
      .filter((tagInfo) => {
        return !tags.includes(tagInfo.name) && (!value || tagInfo.name.includes(value))
      })

      .map((tagInfo) => {
        return {
          name: `${tagInfo.name} (${tagInfo.count})`,
          value: tagInfo.name,
        }
      })
  }

  useEffectOnce(() => {
    AilabCountly.safeReport(CountlyEventKey.XTopicInsertOpen)
  })

  return (
    <div className="xtopic-wrapper xtopic-insert-container">
      <div className="main">
        <HFPanel className="xtopic-insert-panel" shadow disableLoading>
          <FormGroup
            label={
              <PostInsertLabel
                title="标题"
                description="最长60个字，尽量简洁准确，如果是求助或者问题，请以问号结尾"
              />
            }
          >
            <InputGroup
              className="topic-insert-input"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
              }}
            />
          </FormGroup>
          <FormGroup
            label={
              <PostInsertLabel title="标签" description="话题最多有5个标签，请优先使用已有标签" />
            }
          >
            <TagSelectInput
              maxTextLength={20}
              getSuggestions={getSuggestions}
              max={5}
              onChange={setCurrentTags}
            />
          </FormGroup>
          <PostInsertLabel title="正文" />
          <InternalWarningLine />
          <XTopicEditor onAfter={onEditorInit} minHeight={360} />
          <div className="xtopic-pub-btn-container">
            <Button onClick={insert} intent="primary" icon="send-message">
              发布
            </Button>
          </div>
        </HFPanel>
      </div>
      <div className="side">
        <HFPanel className="xtopic-insert-tip-panel" shadow title="小提示" disableLoading>
          <ol className="xtopic-insert-tip-list">
            <li>
              <p className="primary">话题标题</p>
              <p className="secondary">
                请在标题中描述内容要点。如果能在标题的长度内就描述清楚，可以不写正文。
              </p>
            </li>
            <li>
              <p className="primary">正文编辑</p>
              <p className="secondary">
                支持 Markdown 格式，<b>拖拽图片到编辑区域，可以实现快速图片上传。</b>
              </p>
            </li>
            <li>
              <p className="primary">关于标签</p>
              <p className="secondary">
                请尽量使用已有的标签。广场的管理员可能会对相似的标签进行修改和合并。
              </p>
            </li>
            <li>
              <p className="primary">关于内容</p>
              <p className="secondary">
                发布前请先搜索是否有类似的话题。
                问题反馈和求助类话题，请提供环境、软硬件版本等信息，友善提问。以便定位和排查问题，节省沟通成本。
              </p>
            </li>
          </ol>
        </HFPanel>
      </div>
    </div>
  )
}
