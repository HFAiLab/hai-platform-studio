import { Colors } from '@hai-ui/colors'
import { Button } from '@hai-ui/core'
import React from 'react'
import { icons } from '../svgIcon'
import { SVGWrapper } from '../svgWrapper'

declare global {
  interface Window {
    loadingAnimation?: () => void
    lastTimeStamp: number
    lastDeg: number
  }
}

// hint: 这里的默认样式是满足大部分情况，但是有些特殊的地方，需要覆盖样式，就采用传递 style 的方式
export interface HFLoadingProps {
  style?: React.CSSProperties
}

export const HFLoading = (props: HFLoadingProps) => {
  return (
    <div
      style={props.style}
      className="hf-loading-container"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{
        __html: `<def style="display: none;">
            <svg xmlns="http://www.w3.org/2000/svg" display="none">
                <g id="aiui-loading-point">
                    <path d="M0 6.45833L7.95745 0L16 6.45833V9.58333L8 16L0 9.58333V6.45833Z" fill="${Colors.BLUE5}" />
                </g>
            </svg>
        </def>
        <div class="lds-ellipsis">
            <div>
                <svg width="16" height="16" viewBox="0 0 16 16">
                    <use xlink:href="#aiui-loading-point" />
                </svg>
            </div>
            <div>
                <svg width="16" height="16" viewBox="0 0 16 16">
                    <use xlink:href="#aiui-loading-point" />
                </svg>
            </div>
            <div>
                <svg width="16" height="16" viewBox="0 0 16 16">
                    <use xlink:href="#aiui-loading-point" />
                </svg>
            </div>
            <div>
                <svg width="16" height="16" viewBox="0 0 16 16">
                    <use xlink:href="#aiui-loading-point" />
                </svg>
            </div>
        </div>`,
      }}
    />
  )
}

export const HFLoadingError = (props: {
  retry: () => void
  message?: string
  retryText?: string
}) => {
  const defaultMessage = `oops! loading error!!!`
  return (
    <div className="hf-loading-container">
      <div className="error-container">
        <SVGWrapper
          width="16px"
          height="16px"
          dClassName="error-load-data"
          svg={icons.error_module}
        />
        <p className="message">{props.message || defaultMessage}</p>
        <Button small minimal outlined onClick={props.retry}>
          {props.retryText || 'retry'}
        </Button>
      </div>
    </div>
  )
}
