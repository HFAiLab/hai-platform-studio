import classNames from 'classnames'
import type { CSSProperties } from 'react'
import React from 'react'
import { isProduction } from '../../utils/index'
import './index.scss'

type CommonPageProps = {
  title?: string
  style?: CSSProperties
} & React.HTMLAttributes<HTMLElement>

export const CommonPage: React.FC<CommonPageProps> = (props: CommonPageProps) => {
  if (isProduction) {
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <></>
  }
  return (
    <div style={{ ...props.style }} className="layout-container">
      {props.title && (
        <header className="layout-title">
          <h1>{props.title}</h1>
        </header>
      )}
      <div>{props.children}</div>
    </div>
  )
}

type HFLayoutProps = {
  direction?: 'horizontal' | 'vertical'
  className?: string
  flex?: number
  style?: CSSProperties
} & React.HTMLAttributes<HTMLElement>

export const HFLayout: React.FC<HFLayoutProps> = (props: HFLayoutProps) => {
  const direction = props.direction ?? 'horizontal'

  return (
    <div
      style={{ flex: props.flex ?? '', ...props.style }}
      className={classNames('hf-layout', direction, props.className)}
    >
      {props.children}
    </div>
  )
}

type PageLayoutProps = {
  outerClassName?: string
  innerClassName?: string
  responsive?: boolean
} & React.HTMLAttributes<HTMLElement>

export const HFPageLayout: React.FC<PageLayoutProps> = (props: PageLayoutProps) => {
  return (
    <div
      className={classNames('page-layout-outer-container', props.outerClassName, {
        responsive: props.responsive,
      })}
    >
      <div
        className={classNames('page-layout-inner-container', props.innerClassName, {
          responsive: props.responsive,
        })}
      >
        {props.children}
      </div>
    </div>
  )
}
