import { i18n, i18nKeys } from '@hai-platform/i18n'
import { SVGWrapper } from '@hai-platform/studio-pages/lib/ui-components/svgWrapper'
import React from 'react'
import ErrorLoadData from '../../components/svg/error-modules.svg?raw'
import './LoadDataError.scss'

export const LoadDataError = () => {
  return (
    <div className="load-error-container">
      <SVGWrapper svg={ErrorLoadData} dClassName="error-load-data" />
      <p className="error-load-data-tip">{i18n.t(i18nKeys.biz_load_data_error)}</p>
    </div>
  )
}
