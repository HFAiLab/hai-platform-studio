import { SVGWrapper } from '@hai-platform/studio-pages/lib/ui-components/svgWrapper'
import classNames from 'classnames'
import React, { useRef } from 'react'
import svgUpvote from '../images/upvote.svg?raw'
import './UpvoteButton.scss'

// 控制点击频率
let lastClickTimestamp = new Date().valueOf()
const TOO_FAST_THRESHOLD = 160 // ms

export const XTopicUpvoteButton = (p: {
  text?: string
  className?: string
  upvoteValue?: number | null
  onClick?(): void
  minimal?: boolean
}) => {
  const value = p.upvoteValue || null
  const ref = useRef<HTMLSpanElement>(null)

  const triggerAnime = () => {
    if (!ref.current || p.upvoteValue === undefined || p.upvoteValue === null) {
      return
    }

    const fatherEl = ref.current
    const aniEl = document.createElement('div')

    // 给父元素加 ani
    fatherEl.classList.remove('ani')
    fatherEl.classList.add('ani')
    setTimeout(() => {
      fatherEl.classList.remove('ani')
    }, 300)

    if (p.upvoteValue % 10 !== 9) {
      aniEl.setAttribute('class', 'xtopic-upvote-ani-a')
      aniEl.innerHTML = '+1 Amazing'
      fatherEl.appendChild(aniEl)
      setTimeout(() => {
        if (aniEl) aniEl.remove()
      }, 600)
    } else {
      aniEl.setAttribute('class', 'xtopic-upvote-ani-b')
      fatherEl.appendChild(aniEl)
      setTimeout(() => {
        if (aniEl) aniEl.remove()
      }, 1500)
    }
  }

  const checkTooFast = (): boolean => {
    const tooFast = new Date().valueOf() - lastClickTimestamp < TOO_FAST_THRESHOLD
    if (!tooFast) {
      lastClickTimestamp = new Date().valueOf()
    }
    return tooFast
  }

  const onClick = () => {
    if (!p.onClick) {
      return
    }
    if (checkTooFast()) {
      // do nothing
    } else {
      triggerAnime()
      p.onClick()
    }
  }

  return (
    <span
      ref={ref}
      className="xtopic-upvote-btn-wrapper"
      style={{ position: 'relative', display: 'inline-block' }}
    >
      <button
        onClick={onClick}
        className={classNames('xtopic-upvote-btn', p.className, { minimal: p.minimal })}
      >
        <SVGWrapper svg={svgUpvote} width={20} height={20} />
        {(p.text || value) && (
          <span className="btn-text">
            {p.text} {value}
          </span>
        )}
      </button>
    </span>
  )
}
