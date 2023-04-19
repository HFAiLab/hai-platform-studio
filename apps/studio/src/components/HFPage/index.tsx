import React from 'react'
import { isProduction } from '../../utils/index'

type CommonPageProps = {
  title?: string
} & React.HTMLAttributes<HTMLElement>

export const CommonPage: React.FC<CommonPageProps> = (props: CommonPageProps) => {
  if (isProduction) {
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <></>
  }
  return (
    <div className="layout-container">
      {props.title && (
        <header className="layout-title">
          <h1>{props.title}</h1>
        </header>
      )}
      <div>{props.children}</div>
    </div>
  )
}
