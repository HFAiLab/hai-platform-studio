import { AilabServerApiName } from '@hai-platform/client-ailab-server'
import { XEditor } from '@hai-platform/x-editor'
import React, { useRef } from 'react'
import { useEffectOnce } from 'react-use'
import { GlobalAilabServerClient } from '../../api/ailabServer'
import { WebEventsKeys, hfEventEmitter } from '../../modules/event'
import { bffUrl, getToken, vditorStaticUrl } from '../../utils'
import { isDarkTheme } from '../../utils/theme'

import './index.scss'

export interface XTopicEditorProps {
  onAfter?(instance: XEditor): void
  // 初始化后不会改变
  onInput?(value: string): void
  // 初始化后不会改变
  onFocus?(value: string): void
  // 初始化后不会改变
  onBlur?(value: string): void
  cacheKey?: string
  minHeight?: number
  height?: number
  width?: number
}

export interface CheckMarkdownResult {
  message?: string
  success: boolean
}

export const checkMarkdown = (instance: XEditor) => {
  const currentMarkdown = instance.vditor.getValue()

  if (instance.vditor.isUploading()) {
    return {
      message: '正在上传文件，请稍后',
      success: false,
    }
  }

  if (currentMarkdown.length > instance.getCounterMax()) {
    return {
      message: '字数超过最大限制',
      success: false,
    }
  }

  if (!currentMarkdown.trim()) {
    return {
      message: '内容不能为空',
      success: false,
    }
  }

  return {
    success: true,
  }
}

export const XTopicEditor = (props: XTopicEditorProps) => {
  const editorDom = useRef<HTMLDivElement | null>(null)
  const XEditorInstance = useRef<XEditor | null>(null)

  const inputCallbackRef = useRef<(v: string) => void>()
  const focusCallbackRef = useRef<(v: string) => void>()
  const blurCallbackRef = useRef<(v: string) => void>()

  inputCallbackRef.current = props.onInput
  focusCallbackRef.current = props.onFocus
  blurCallbackRef.current = props.onBlur

  useEffectOnce(() => {
    if (!editorDom.current) return

    XEditorInstance.current = new XEditor({
      containerDom: editorDom.current,
      theme: isDarkTheme() ? 'dark' : 'classic',
      cacheKey: props.cacheKey === 'disable' ? undefined : props.cacheKey || 'post-draft',
      bffURL: bffUrl,
      token: getToken(),
      staticURL: vditorStaticUrl,
      minHeight: props.minHeight,
      height: props.height,
      width: props.width,
      hint: {
        extend: [
          {
            key: '#',
            hint: (value) => {
              return GlobalAilabServerClient.request(AilabServerApiName.XTOPIC_POST_SUGGEST_LIST, {
                keyword_pattern: value,
              }).then((res) => {
                return res.suggestions.map((suggestion) => {
                  return {
                    html: `<div class="xtopic-editor-tip-li"><span class="xtopic-editor-tip-id">#${suggestion.index}</span> ${suggestion.title}</div>`,
                    value: `[#${suggestion.index}|${suggestion.title}](#/topic/${suggestion.index})`,
                  }
                })
              })
            },
          },
        ],
      },
      after: () => {
        if (props.onAfter) props.onAfter(XEditorInstance.current!)
      },
      input: (value) => {
        if (inputCallbackRef.current) {
          inputCallbackRef.current(value)
        }
      },
      focus: (value) => {
        if (focusCallbackRef.current) {
          focusCallbackRef.current(value)
        }
      },
      blur: (value) => {
        if (blurCallbackRef.current) {
          blurCallbackRef.current(value)
        }
      },
    })

    hfEventEmitter.on(WebEventsKeys.themeChange, () => {
      XEditorInstance.current!.setTheme(isDarkTheme() ? 'dark' : 'classic')
    })
  })

  return <div className="xtopic-editor-container" ref={editorDom} />
}
