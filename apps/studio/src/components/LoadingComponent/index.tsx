import React, { useEffect, useState } from 'react'

// APNG 格式动画
// https://icons8.com/preloaders/en/rectangular 生成的 APNG 格式动画

import loadingImage from '../../../public/resources/loading.png'

const ANI_DURATION = 3000 // ms

export const SmallLoading = (props: {
  updateStamp: string
  height?: number
  forceShow?: boolean
}) => {
  const height = props.height ?? 22
  const width = (height / 44) * 64 // raw_image: 64*44
  const [lastUpdate, setLastUpdate] = useState(props.updateStamp ?? '')

  useEffect(() => {
    if (props.updateStamp !== lastUpdate) {
      setTimeout(() => {
        setLastUpdate(props.updateStamp)
      }, ANI_DURATION)
    }
  }, [props.updateStamp, lastUpdate])
  const isShow = props.updateStamp !== lastUpdate || props.forceShow

  // 这里使用 background 是为了避免 img 标签存在样式（比如阴影）
  // 使用 visibility 是出于占位目的，方便布局调试等
  return (
    <div
      className="hf small-loading"
      style={{
        height,
        width,
        visibility: isShow ? 'visible' : 'hidden',
        backgroundImage: `url(${loadingImage})`,
        backgroundSize: 'cover',
      }}
    />
  )
}
