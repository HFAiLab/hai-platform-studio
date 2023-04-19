import { SVGWrapper } from '@hai-platform/studio-pages/lib/ui-components/svgWrapper'
import classNames from 'classnames'
import React from 'react'
import { numberToThousands } from '../../../utils/convert'
import { isDarkTheme } from '../../../utils/theme'
import svgHeatHotDark from '../images/heat_hot_dark.svg?raw'
import svgHeatHotLight from '../images/heat_hot_light.svg?raw'
import svgHeatNormalDark from '../images/heat_normal_dark.svg?raw'
import svgHeatNormalLight from '../images/heat_normal_light.svg?raw'

import './Heat.scss'

const HOT_THRESHOLD = 200

const svgMap = {
  light: {
    hot: svgHeatHotLight,
    normal: svgHeatNormalLight,
  },
  dark: {
    hot: svgHeatHotDark,
    normal: svgHeatNormalDark,
  },
} as const

export const HeatIcon = (p: { heat?: number; showValue?: boolean; className?: string }) => {
  const heat = p.heat ?? 0
  const showValue = p.showValue ?? false
  const themeKey = isDarkTheme() ? 'dark' : 'light'
  const hotKey = heat > HOT_THRESHOLD ? 'hot' : 'normal'

  return (
    <div
      title={showValue ? '当前热力值' : undefined}
      className={classNames('xtopic-heat', p.className)}
    >
      <SVGWrapper width={30} height={30} svg={svgMap[themeKey][hotKey]} />
      {showValue && (
        <div className={classNames('value', { hot: heat > HOT_THRESHOLD })}>
          {numberToThousands(heat)}
        </div>
      )}
    </div>
  )
}
