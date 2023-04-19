/* eslint-disable */
import { Collapse as HFCollapse } from '@hai-ui/core/lib/esm'
import type { ReactNode } from 'react'
import React, { useState } from 'react'
import { genPopover } from '../../popover'

import { InlineIcon } from '../../svgIcon'

/**
 * Collapse
 */
type DescRenderFunc = (show: boolean) => ReactNode | string

interface ICollapse extends React.HTMLAttributes<HTMLElement> {
  desc: string | ReactNode | DescRenderFunc
  handler?: (p: boolean) => void
  controller?: boolean
  defaultShow?: boolean
  title?: string
  titleTooltip?: string
  hideDescWhenShow?: boolean
}

export const Collapse = (p: ICollapse) => {
  const [_show, _setShow] = useState<boolean>(Boolean(p.defaultShow))
  const show = p.controller ?? _show
  const setter = p.handler ?? _setShow

  return (
    <div className="hf-collapse">
      <div className={`ptr ctl ${show ? 'show' : ''}`} onClick={() => setter(!show)}>
        {p.title ? (
          p.titleTooltip ? (
            <span className="hf-collapse-title">
              {genPopover({
                inline: true,
                label: p.title,
                helperText: p.titleTooltip,
              })}
            </span>
          ) : (
            <span className="hf-collapse-title">{p.title}</span>
          )
        ) : null}
        <InlineIcon style={{ marginRight: '6px' }} name="right" />
        {!(p.hideDescWhenShow && show) ? (
          <span className="hf-collapse-desc">
            {typeof p.desc === 'function' ? p.desc(show) : p.desc}
          </span>
        ) : (
          ''
        )}
      </div>
      <HFCollapse isOpen={show} keepChildrenMounted>
        {p.children}
      </HFCollapse>
    </div>
  )
}
