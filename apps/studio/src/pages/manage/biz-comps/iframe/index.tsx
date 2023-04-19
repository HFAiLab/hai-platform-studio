import type { OpenURLInNewTabParams } from '@hai-platform/studio-pages/lib/entries/experiment2/schema'
import { Button } from '@hai-ui/core'
import React from 'react'
import { copyWithTip } from '../../../../utils/clipboard'
import './index.scss'

export const IframePage = (props: { urlParams: OpenURLInNewTabParams }) => {
  return (
    <>
      <Button
        icon="link"
        className="iframe-link-btn"
        outlined
        title="拷贝链接到剪切板"
        onClick={() => {
          copyWithTip(props.urlParams.url)
        }}
      />
      <iframe width="100%" height="100%" src={props.urlParams.url} />
    </>
  )
}
