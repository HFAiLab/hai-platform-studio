import { i18n, i18nKeys } from '@hai-platform/i18n'
import React from 'react'
import './index.scss'

export const Footer = () => {
  return (
    <div className="footer-container">
      <p className="footer-title">{i18n.t(i18nKeys.biz_footer_statement)}</p>
    </div>
  )
}
