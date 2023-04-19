import React from 'react'

export const SVGWrapper = (props: {
  width?: number | string
  height?: number | string
  fill?: string | undefined
  dClassName?: string
  svg: string | undefined
  onClick?: (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => void
}): JSX.Element => {
  return (
    <svg
      onClick={(e) => {
        if (props.onClick) props.onClick(e)
      }}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: String(props.svg) }}
      width={props.width || undefined}
      height={props.height || undefined}
      fill={props.fill || undefined}
      className={props.dClassName || undefined}
    />
  )
}
