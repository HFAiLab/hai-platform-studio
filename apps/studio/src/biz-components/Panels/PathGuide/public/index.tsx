import { i18n, i18nKeys } from '@hai-platform/i18n'
import { simpleCopy } from '@hai-platform/studio-pages/lib/utils/copyToClipboard'
import { Button } from '@hai-ui/core/lib/esm'
import type { ReactElement } from 'react'
import React from 'react'
import { AppToaster } from '../../../../utils'

import './index.scss'

export const PathLine = (props: {
  nameContent: ReactElement | string
  valueContent: string
  absolutePath?: string
}) => {
  return (
    <li>
      <div className="path-name">{props.nameContent}</div>
      <div className="right">
        <div className="path-value">{props.valueContent}</div>
        <Button
          small
          minimal
          intent="primary"
          onClick={() =>
            simpleCopy(
              props.absolutePath ?? props.valueContent,
              i18n.t(i18nKeys.base_path),
              AppToaster,
            )
          }
        >
          {i18n.t(i18nKeys.biz_paths_copy_absolute_path)}
        </Button>
      </div>
    </li>
  )
}

export const PathGuide = () => {
  return (
    <div className="path-guide-container">
      <div className="desc">{i18n.t(i18nKeys.biz_paths_important_paths)}</div>
      <ul>{/* 可以在这里使用 PathLine 展示一些必要的路径信息提示 */}</ul>
    </div>
  )
}
