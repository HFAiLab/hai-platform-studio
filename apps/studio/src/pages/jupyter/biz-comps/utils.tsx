import { i18n, i18nKeys } from '@hai-platform/i18n'
import { BuiltinServiceList } from '@hai-platform/shared'
import { SVGWrapper } from '@hai-platform/studio-pages/lib/ui-components/svgWrapper'
import { Colors } from '@hai-ui/colors/lib/colors'
import React from 'react'
import CustomServiceSvg from '../../../components/svg/custom-service.svg?raw'
import NodePortSvg from '../../../components/svg/nodeport.svg?raw'

export const isBuiltin = (name: string) => {
  return (BuiltinServiceList as unknown as string[]).includes(name)
}

export function formatCPU(cpu?: number): string {
  if (cpu === 0) return i18n.t(i18nKeys.biz_container_exclusive)
  if (!cpu) return ''
  return `${cpu} ${i18n.t(i18nKeys.biz_container_cpu_core)}`
}

export function formatMem(mem?: number): string {
  if (mem === 0) return i18n.t(i18nKeys.biz_container_exclusive)
  if (!mem) return ''
  return `${mem} G`
}

export const ContainerIcon = (props: { type: string; className?: string }): JSX.Element => {
  if (props.type === 'jupyter') {
    return (
      <img src="/resources/jupyter.png" className={`service-item-logo ${props.className || ''}`} />
    )
  }
  if (props.type === 'ssh') {
    return (
      <SVGWrapper svg={NodePortSvg} dClassName={`service-item-logo ${props.className || ''}`} />
    )
  }

  return (
    <SVGWrapper
      svg={CustomServiceSvg}
      fill={Colors.CERULEAN5}
      dClassName={`service-item-logo ${props.className || ''}`}
    />
  )
}
