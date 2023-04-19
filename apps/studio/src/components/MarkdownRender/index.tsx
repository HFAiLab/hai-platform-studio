import { Code2RC } from '@hai-platform/studio-pages/lib/ui-components/highlightCode'
import { XEditor } from '@hai-platform/x-editor'
import React, { useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import { vditorStaticUrl } from '../../utils'

import './index.scss'

export const HFMarkdownRender = (p: { doc: string }) => {
  return (
    <ReactMarkdown
      className="markdown-body"
      components={{
        // eslint-disable-next-line react/no-unstable-nested-components
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '')
          const language = (match && match[1]) ?? 'unknown'
          return (
            <Code2RC
              code={String(children)}
              lang={language}
              className={className}
              // eslint-disable-next-line react/jsx-props-no-spreading
              {...props}
            />
          )
        },
      }}
    >
      {p.doc}
    </ReactMarkdown>
  )
}

// 使用 XEditor
export const HFMarkdownRenderX = React.memo((props: { doc: string; after?(): void }) => {
  const replyContentDom = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (props.doc && replyContentDom.current) {
      XEditor.render(replyContentDom.current, props.doc, {
        staticURL: vditorStaticUrl,
        after: () => {
          if (props.after) {
            props.after()
          }
        },
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.doc])
  return <div ref={replyContentDom} />
})
