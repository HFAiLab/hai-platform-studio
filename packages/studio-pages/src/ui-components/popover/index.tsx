import { Popover2 } from '@hai-ui/popover2/lib/esm'
import type { ReactNode } from 'react'
import React from 'react'

export const genPopover = (props: {
  inline?: boolean
  label: string
  helperText?: string
  placement?: 'left' | 'top'
}): ReactNode => {
  return props.inline && props.helperText ? (
    <Popover2
      content={<div style={{ display: 'inline-block', padding: '10px' }}>{props.helperText}</div>}
      placement={props.placement ?? 'left'}
      interactionKind="hover"
    >
      <label className="hai-ui-label">{props.label}</label>
    </Popover2>
  ) : (
    props.label
  )
}
