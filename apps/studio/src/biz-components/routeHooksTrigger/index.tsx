// 依赖 useLocation 以及 GlobalContext，抽成一个组件来处理
import type { ReactElement } from 'react'
import { useContext, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useUpdateEffect } from 'react-use/esm'
import { HooksMap } from '../../reducer'
import { GlobalContext } from '../../reducer/context'

/**
 * HooksMap 是 globalState 的各个状态的钩子
 * 当 url 地址产生变化时 (通常为 react-router 的 hash 路由发生变化)
 * 调用 onRouteChange 对相应的 state 进行处理 (比如将指定的 state[key] 的值以 query 形式写到 url 的 hash 段中)
 */
export const RouteHooksTrigger = (props: { children: ReactElement }) => {
  const location = useLocation()
  const { state } = useContext(GlobalContext)
  const currentSearch = useRef(location.search)
  const currentPathname = useRef(location.pathname)

  useUpdateEffect(() => {
    if (
      location.pathname === currentPathname.current &&
      location.search !== currentSearch.current
    ) {
      window.location.reload()
      return
    }

    currentPathname.current = location.pathname
    currentSearch.current = location.search

    for (const key in HooksMap) {
      const k = key as keyof typeof HooksMap
      const instance = HooksMap[k]
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error ignore type there
      instance?.onRouteChange(state[k])
      /**
       * 之前这里的问题在于：当 hash 变化之后，又会被立刻写回当前的值，此 effect 被连续触发两次，并且最终的也是没有修改成功的
       */
    }
  }, [location])
  return props.children
}
