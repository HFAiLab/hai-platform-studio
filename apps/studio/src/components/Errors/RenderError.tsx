import { i18n, i18nKeys } from '@hai-platform/i18n'
import { SVGWrapper } from '@hai-platform/studio-pages/lib/ui-components/svgWrapper'
import React from 'react'
import ErrorRender from '../../components/svg/error-render.svg?raw'
import './RenderError.scss'

export const RenderError = () => {
  return (
    <div className="render-error-container">
      <SVGWrapper svg={ErrorRender} dClassName="error-render" />
      <p className="render-tip">{i18n.t(i18nKeys.biz_render_no_data)}</p>
    </div>
  )
}
