import { throttle } from 'lodash-es'
import { useRef, useState } from 'react'
import { Z_INDEX_ABOVE_ALL, Z_INDEX_BELOW_OP_MASK } from '../../style/z-index'

export function addMask(node: HTMLElement): HTMLDivElement {
  const tempDiv = document.createElement('div')
  tempDiv.style.width = '100%'
  tempDiv.style.height = '100%'
  tempDiv.style.position = 'fixed'
  tempDiv.style.backgroundColor = 'transparent'
  tempDiv.style.top = '0'
  tempDiv.style.left = '0'
  tempDiv.style.zIndex = `${Z_INDEX_ABOVE_ALL}`
  tempDiv.style.cursor = 'move'
  node.appendChild(tempDiv)
  return tempDiv
}

/*
 * 绑定多个事件
 * */
export function addEvents(dom: HTMLElement, events: string[], eF: () => void): void {
  for (let i = 0; i < events.length; i += 1) {
    dom.addEventListener(events[i]!, eF)
  }
}

interface ComputeRect {
  x1: number
  x2: number
  y1: number
  y2: number
}

type ComputeItem = ComputeRect & ToMovedItem

type ComputeContainer = {
  rect: ComputeRect
  computeItemLevelList: ComputeItem[]
  listId: string
  scrollLeft: number
  containerWidth: number
  contentWidth: number
}

interface ToMovedItem {
  listId: string
  itemId: string
}

export interface ToMovedInfo<T> {
  next: T | null
  pre: T | null
  listId: string
  itemId: string
  targetIndex: number
}

export interface ExpQueueOperationRes {
  success: 0 | 1
  msgs: string[]
}

export interface DragQueueProps<T> {
  renderer: (props: RendererProps<T>) => JSX.Element
  getItemId: (item: T) => string
  occupyWidthOrHeight: 90
  direction: 'horizontal'
  listClassName: string
  itemClassName: string
  getItems: (listId: string) => T[]
  handleMovedInfo: (item: T, toMovedInfo: ToMovedInfo<T>) => Promise<void>
  errorCallback: (e: Error) => void
  enableDragScroll: boolean
}

export interface DragMouseDownOptions {
  setOperating: (operating: boolean) => void
}

export interface RendererProps<T> {
  mouseDownCallback: (item: T, options: DragMouseDownOptions) => void
  movingItem: T | null
  toMovedItem: ToMovedItem | null
  inEditLoading: boolean
  // 用于 render 函数中快速调用操作：
  handleMovedInfo: (item: T, toMovedInfo: ToMovedInfo<T>) => Promise<void>
}

export const convertDOMRect = (domRect: DOMRect) => {
  return {
    x1: domRect.left,
    x2: domRect.right,
    y1: domRect.top,
    y2: domRect.bottom,
  }
}

export const DragQueue = <T,>(props: DragQueueProps<T>) => {
  const [movingItem, setMovingItem] = useState<T | null>(null)
  const [toMovedItem, setToMovedItem] = useState<ToMovedItem | null>(null)
  const toMovedItemRef = useRef(toMovedItem)
  const [inEditing, setInEditing] = useState(false)
  const [inEditLoading, setInEditLoading] = useState(false)

  const mouseDownCallback = (item: T, options: DragMouseDownOptions) => {
    if (inEditing || inEditLoading) return

    setInEditing(true)
    options.setOperating(true)
    setMovingItem(item)

    const currentDom = document.getElementById(props.getItemId(item)) as HTMLDivElement
    const cloneDom = currentDom.cloneNode(true) as HTMLDivElement

    const boundaryRect = currentDom.getBoundingClientRect()

    cloneDom.classList.add('moving')
    cloneDom.style.top = `${boundaryRect.top}px`
    cloneDom.style.left = `${boundaryRect.left}px`
    cloneDom.style.zIndex = `${Z_INDEX_BELOW_OP_MASK}`
    document.body.appendChild(cloneDom)
    // 把当前的 dom 复制一份到新的正在拖动的

    const clearToMovedItem = () => {
      setToMovedItem(null)
      toMovedItemRef.current = null
    }

    const clearCallback = () => {
      clearToMovedItem()
      setInEditing(false)
      options.setOperating(false)
      setMovingItem(null)
    }

    const computeBoundaries = () => {
      /**
       * 目标位置计算
       *
       */
      const listDoms = document.getElementsByClassName(
        props.listClassName,
      ) as unknown as HTMLDivElement[]

      const computeListLevelList: ComputeContainer[] = []
      let lastId = ''

      for (const listDom of listDoms) {
        const qItems = listDom.getElementsByClassName(
          props.itemClassName,
        ) as unknown as HTMLDivElement[]
        const listId = listDom.getAttribute('id')
        if (!listId) {
          clearCallback()
          props.errorCallback(new Error('list should has id'))
          return
        }
        const listParentDom = listDom.parentElement as HTMLDivElement
        if (!listParentDom) {
          clearCallback()
          return
        }
        const listBoundary = listParentDom.getBoundingClientRect()

        const computeItemLevelList: ComputeItem[] = []
        const computeRate = 0.5

        let lastBoundary: DOMRect | null = null

        for (let i = 0; i < qItems.length; i += 1) {
          const qItem = qItems[i]!
          const boundary = qItem.getBoundingClientRect()
          const itemId = qItem.getAttribute('id')

          if (
            !props.enableDragScroll &&
            (boundary.right < listBoundary.left ||
              (lastBoundary && lastBoundary.left > listBoundary.right))
          ) {
            lastId = itemId!
            lastBoundary = boundary
            continue
          }

          if (i === 0 && itemId !== props.getItemId(item)) {
            computeItemLevelList.push({
              x1: boundary.x,
              x2: boundary.x + computeRate * boundary.width,
              y1: boundary.top,
              y2: boundary.bottom,
              listId,
              itemId: 'begin',
            })
            lastId = itemId!
            lastBoundary = boundary
          }

          // 用到了上次的，放前面
          if (i !== 0 && lastId !== props.getItemId(item) && itemId !== props.getItemId(item)) {
            computeItemLevelList.push({
              x1: lastBoundary!.right - lastBoundary!.width * computeRate,
              x2: boundary.left + boundary.width * computeRate,
              y1: boundary.top,
              y2: boundary.bottom,
              listId,
              itemId: lastId,
            })
          }

          if (i === qItems.length - 1 && itemId !== props.getItemId(item)) {
            computeItemLevelList.push({
              x1: boundary!.right - boundary!.width * computeRate,
              x2: boundary.right + boundary!.width * 2,
              y1: boundary.top,
              y2: boundary.bottom,
              listId,
              itemId: 'end',
            })
          }

          lastBoundary = boundary
          lastId = itemId!
        }

        if (computeItemLevelList.length === 0) {
          if (qItems.length === 1 && qItems[0]!.getAttribute('id') === props.getItemId(item)) {
            computeItemLevelList.push({
              x1: listBoundary.left,
              x2: listBoundary.left - 1,
              y1: listBoundary.top,
              y2: listBoundary.bottom,
              listId,
              itemId: 'begin',
            })
          } else {
            computeItemLevelList.push({
              x1: listBoundary.left,
              x2: listBoundary.left + props.occupyWidthOrHeight * 2,
              y1: listBoundary.top,
              y2: listBoundary.bottom,
              listId,
              itemId: 'begin',
            })
          }
        }

        // 旧算法
        // const computeItemListRect = {
        //   x1: computeItemLevelList[0]!.x1,
        //   x2: computeItemLevelList[computeItemLevelList.length - 1]!.x2,
        //   y1: computeItemLevelList[0].y1,
        //   y2: computeItemLevelList[0].y2,
        // }

        // hint: 如果这里用旧算法，可能导致的问题：如果拖动的是第一个，滚过去再滚回来，这个时候边界判断有问题，因为边界是从第二个开始算的
        const computeItemListRect = convertDOMRect(listParentDom.getBoundingClientRect())
        // hint：对于最后一个，给宽一点的区间
        computeItemListRect.x2 += props.occupyWidthOrHeight

        computeListLevelList.push({
          computeItemLevelList,
          rect: computeItemListRect,
          listId,
          scrollLeft: listParentDom.scrollLeft,
          containerWidth: listParentDom.offsetWidth,
          contentWidth: listDom.offsetWidth,
        })
      }

      const findMaxX2 = (list: ComputeContainer[]) => {
        if (!list.length) return 0
        let max = list[0]!.rect.x2
        for (const container of list) {
          if (container.rect.x2 > max) {
            max = container.rect.x2
          }
        }
        return max
      }

      // 如果移动的是第一个，这个时候应该特殊处理一下
      const computeTopLevelRect = {
        x1: computeListLevelList[0]!.rect.x1,
        x2: findMaxX2(computeListLevelList),
        y1: computeListLevelList[0]!.rect.y1,
        y2: computeListLevelList[computeListLevelList.length - 1]!.rect.y2,
      }

      // eslint-disable-next-line consistent-return
      return {
        computeTopLevelRect,
        computeListLevelList,
      }
    }

    const computeResult = computeBoundaries()
    if (!computeResult) {
      clearCallback()
      props.errorCallback(new Error('null'))
      return
    }
    const { computeTopLevelRect, computeListLevelList } = computeResult
    // console.log('[QUEUE LOG] computeListLevelList:', computeListLevelList)

    const ifXYinRect = (x: number, y: number, rect: ComputeRect) => {
      return (x - rect.x1) * (x - rect.x2) <= 0 && (y - rect.y1) * (y - rect.y2) <= 0
    }

    const handleScroll = throttle(
      (
        listContainerDom: HTMLDivElement,
        direction: 'begin' | 'end',
        listContainer: ComputeContainer,
      ) => {
        const step = 15
        if (direction === 'end') {
          const containerScrolledWidth = listContainer.scrollLeft + listContainer.containerWidth
          const remainWidth = listContainer.contentWidth - containerScrolledWidth
          if (remainWidth <= 0) return
          const realStep = Math.min(step, remainWidth)
          listContainer.scrollLeft += realStep
          listContainer.computeItemLevelList.forEach((computeItem) => {
            computeItem.x1 -= realStep
            computeItem.x2 -= realStep
          })
          listContainerDom.scrollTo({
            top: 0,
            left: listContainer.scrollLeft,
            behavior: 'smooth',
          })
        }
        if (direction === 'begin') {
          const { scrollLeft } = listContainer
          if (scrollLeft <= 0) return
          const realStep = Math.min(step, scrollLeft)
          listContainer.scrollLeft -= realStep
          listContainer.computeItemLevelList.forEach((T) => {
            T.x1 += realStep
            T.x2 += realStep
          })
          listContainerDom.scrollTo({
            top: 0,
            left: listContainer.scrollLeft,
            behavior: 'smooth',
          })
        }
      },
      50,
    )

    /**
     * 目标位置计算结束
     *
     */
    const computeCollision = (x: number, y: number) => {
      // console.log(`--> computeCollision x: ${x}, y:${y}, `, computeTopLevelRect)
      if (!ifXYinRect(x, y, computeTopLevelRect)) {
        clearToMovedItem()
        return
      }

      for (const listContainer of computeListLevelList) {
        // console.log(`x: ${x}, y: ${y}, listContainer.rect`, listContainer.rect)
        if (!ifXYinRect(x, y, listContainer.rect)) continue

        if (props.enableDragScroll) {
          const listDom = document.getElementById(listContainer.listId)! as HTMLDivElement
          const listContainerDom = listDom.parentElement! as HTMLDivElement
          const containerBoundary = listContainerDom.getBoundingClientRect()
          if (x - containerBoundary.left > 0 && x - containerBoundary.left < 50) {
            handleScroll(listContainerDom, 'begin', listContainer)
          }
          if (containerBoundary.right - x > 0 && containerBoundary.right - x < 50) {
            handleScroll(listContainerDom, 'end', listContainer)
          }
        }

        for (const computeItem of listContainer.computeItemLevelList) {
          if (ifXYinRect(x, y, computeItem)) {
            const nextToMovedItem = {
              listId: computeItem.listId,
              itemId: computeItem.itemId,
            }
            if (
              toMovedItemRef.current &&
              toMovedItemRef.current.listId === nextToMovedItem.listId &&
              toMovedItemRef.current.itemId === nextToMovedItem.itemId
            ) {
              return
            }
            setToMovedItem(nextToMovedItem)
            toMovedItemRef.current = nextToMovedItem
            return
          }
        }
      }

      clearToMovedItem()
    }

    let startX = -1
    let startY = -1
    let currentTop = boundaryRect.top
    let currentLeft = boundaryRect.left

    let moveCallbackContinueId: number | null = null

    const moveCallback = (e: MouseEvent) => {
      if (moveCallbackContinueId) {
        clearTimeout(moveCallbackContinueId)
        moveCallbackContinueId = null
      }
      // console.log('e:', e);
      if (startX === -1 && startY === -1) {
        startX = e.clientX
        startY = e.clientY
        return
      }
      const dy = e.clientY - startY
      const dx = e.clientX - startX

      currentTop += dy
      currentLeft += dx
      cloneDom.style.top = `${currentTop}px`
      cloneDom.style.left = `${currentLeft}px`
      computeCollision(e.clientX, e.clientY)

      startX = e.clientX
      startY = e.clientY

      moveCallbackContinueId = window.setTimeout(() => {
        moveCallback(e)
      }, 100)
    }

    const backgroundMask = addMask(document.body)
    backgroundMask.addEventListener('mousemove', moveCallback)

    const getToMovedInfo = (currToMovedItem: ToMovedItem): ToMovedInfo<T> | null => {
      // 根据类型选择
      if (!currToMovedItem) return null
      const itemList = props.getItems(currToMovedItem.listId)

      let pre: T | null = null
      let next: T | null = null

      if (currToMovedItem.itemId === 'begin') {
        // eslint-disable-next-line prefer-destructuring
        next = itemList[0]!
        return {
          ...currToMovedItem,
          next,
          pre,
          targetIndex: 0,
        }
      }
      if (currToMovedItem.itemId === 'end') {
        pre = itemList[itemList.length - 1]!
        return {
          ...currToMovedItem,
          next,
          pre,
          targetIndex: itemList.length,
        }
      }

      // 放在 chainId 的后面

      let res = null
      itemList.forEach((pItem, index) => {
        if (props.getItemId(pItem) === currToMovedItem.itemId) {
          // 放在 item 的后面
          const nextItem = itemList[index + 1]
          res = {
            ...currToMovedItem,
            next: nextItem,
            pre: pItem,
            targetIndex: index + 1,
          }
        }
      })

      return res
    }

    addEvents.call(backgroundMask, backgroundMask, ['mouseup', 'mouseout', 'click'], () => {
      if (moveCallbackContinueId) {
        clearTimeout(moveCallbackContinueId)
        moveCallbackContinueId = null
      }
      backgroundMask.removeEventListener('mousemove', moveCallback)
      document.body.removeChild(backgroundMask)
      setMovingItem(null)
      document.body.removeChild(cloneDom)

      if (toMovedItemRef.current) {
        const toMovedInfo = getToMovedInfo(toMovedItemRef.current)

        if (toMovedInfo) {
          setInEditLoading(true)
          props.handleMovedInfo(item, toMovedInfo).then(() => {
            setInEditLoading(false)
            options.setOperating(false)
          })
        }
      } else {
        options.setOperating(false)
      }
      setToMovedItem(null)
      toMovedItemRef.current = null
      setInEditing(false)
    })
  }

  return props.renderer({
    mouseDownCallback,
    movingItem,
    toMovedItem,
    inEditLoading,
    handleMovedInfo: props.handleMovedInfo,
  })
}
