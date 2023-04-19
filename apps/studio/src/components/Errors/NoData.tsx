import { i18n, i18nKeys } from '@hai-platform/i18n'
import { SVGWrapper } from '@hai-platform/studio-pages/lib/ui-components/svgWrapper'
import React from 'react'
import ErrorNoData from '../../components/svg/error-no-data.svg?raw'
import './NoData.scss'

export const NoData = () => {
  return (
    <div className="no-data-error-container">
      <SVGWrapper svg={ErrorNoData} dClassName="error-no-data" />
      <p className="no-data-tip">{i18n.t(i18nKeys.base_no_data)}</p>
    </div>
  )
}
