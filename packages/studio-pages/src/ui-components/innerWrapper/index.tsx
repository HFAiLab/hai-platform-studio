import React from 'react'

declare global {
  interface Window {
    _hf_user_if_in: boolean
  }
}

/**
 * Only show when user is a internal user.
 * @param p
 * @returns
 */
type IInWrapper = {
  addInClass?: boolean
} & React.HTMLAttributes<HTMLElement>

export const InWrapper = (p: IInWrapper): JSX.Element => {
  const cln = ''
  // delete p['className']
  // hint: 这里的 _hf_user_if_in 是 jupyter 插件初始化的时候会写入的，别的应用需要注意这个地方
  if (window._hf_user_if_in) {
    return (
      // eslint-disable-next-line react/jsx-props-no-spreading
      <div className={(cln ?? '') + (p.addInClass ? ' in' : '')} {...p}>
        {' '}
        {p.children}
      </div>
    )
  }
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <></>
}
