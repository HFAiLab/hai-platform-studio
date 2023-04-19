import { clearAndCreateNewContainer } from '@hai-platform/studio-pages/lib/entries/base/app'
import type { BaseContainerAPI } from '@hai-platform/studio-pages/lib/entries/base/container'
import type { PerfContainerAPI } from '@hai-platform/studio-pages/lib/entries/perf/container'
import { PerfApp } from '@hai-platform/studio-pages/lib/entries/perf/index'
import {
  PerfServiceAbilityNames,
  PerfServiceNames,
} from '@hai-platform/studio-pages/lib/entries/perf/schema'
import type {
  AsyncPerfServiceNames,
  AsyncPerfServiceResult,
  PerfServiceParams,
  PerfServiceResult,
} from '@hai-platform/studio-pages/lib/entries/perf/schema'
import type {
  ChartBlockProps,
  dKey,
} from '@hai-platform/studio-pages/lib/entries/perf/widgets/ChartBlock'
import { dkey } from '@hai-platform/studio-pages/lib/entries/perf/widgets/ChartBlock'
import { applyMixins } from '@hai-platform/studio-pages/lib/utils'
import { throttle } from 'lodash-es'
import React, { useEffect, useRef } from 'react'
import { JupyterBaseContainerAPI } from '../../../../api/base'
import { LevelLogger } from '../../../../utils'
import { createDomResizeTrigger } from '../../../../utils/domResizeTrigger'
import { getCurrentTheme } from '../../../../utils/theme'

class Container implements PerfContainerAPI {
  #node: HTMLDivElement

  constructor(node: HTMLDivElement) {
    this.#node = node
  }

  invokeAsyncService<T extends AsyncPerfServiceNames>(
    key: T,
    // params: ExtractProps<T, AsyncServiceParams>,
  ): Promise<AsyncPerfServiceResult[T]> {
    throw new Error(`Method not implemented: ${key}`)
  }

  invokeService<T extends keyof PerfServiceParams>(
    key: T,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    params: PerfServiceParams[T],
  ): PerfServiceResult[T] {
    if (key === PerfServiceNames.openPerformanceChart) {
      return true as any
    }
    if (key === PerfServiceNames.getTheme) {
      return getCurrentTheme() as any
    }
    return null as any
  }

  getContainer(): HTMLDivElement {
    return this.#node
  }

  hasAbility(name: PerfServiceAbilityNames) {
    const abilityDict = {
      [PerfServiceAbilityNames.duplicate]: false,
    }
    return abilityDict[name] ?? false
  }
}

applyMixins(Container, [JupyterBaseContainerAPI])

export const Perf = (props: {
  // eslint-disable-next-line react/no-unused-prop-types
  addPerfDock: (props: ChartBlockProps) => void
  perfProps: ChartBlockProps
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!containerRef.current) {
      LevelLogger.error('perf container not found')
      return
    }

    const height = containerRef.current.offsetHeight
    const width = containerRef.current.offsetWidth
    const perfProps = { height, width, ...props.perfProps }

    const resizeCallback = () => {
      if (!containerRef.current) return
      const newHeight = Math.max(containerRef.current.offsetHeight, 350)
      const newWidth = Math.max(containerRef.current.offsetWidth, 590)
      perfProps.height = newHeight
      perfProps.width = newWidth
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      perfApp.update(perfProps)
    }
    const resizeObserver = createDomResizeTrigger(
      containerRef.current,
      throttle(resizeCallback, 1000),
    )

    const setter = (type: dKey, v: any) => {
      if (!dkey.has(type)) {
        throw new Error(`Performance chart setter: Invalid key - ${String(type)}`)
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error because perfApp is below
      perfProps[type] = v
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      perfApp.update(perfProps)
    }
    perfProps.setter = setter

    const newDiv = clearAndCreateNewContainer(containerRef.current)
    const capi = new Container(newDiv) as unknown as PerfContainerAPI & BaseContainerAPI
    const perfApp = new PerfApp(capi)
    perfApp.start(perfProps)

    // eslint-disable-next-line consistent-return
    return () => {
      perfApp.stop()
      resizeObserver.disconnect()
    }
  }, [props.perfProps])

  return <div className="trainings-page trainingsWindow hf perf" ref={containerRef} />
}
