import { i18n, i18nKeys } from '@hai-platform/i18n'
import { Icon, TagInput } from '@hai-ui/core'
import classNames from 'classnames'
import { isNumber } from 'lodash-es'
import React, { useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import './index.scss'

interface SelectInputResponse {
  key: string
  operation: string
  value: string
}

// 目前 value 默认都是字符串，后面有了需求在调整
interface SelectInputProps {
  selectKeys: string[]
  operations: string[]
  large?: boolean
  onChange?: (response: SelectInputResponse[]) => void
}

enum CurrentSelectStatus {
  key = 'key',
  operation = 'operation',
  value = 'value',
}

const NO_DATA_KEY = 'THIS_IS_NO_DATA_FOR_SELECT'

const convertItemsToResponse = (items: string[]) => {
  const response = []
  for (let i = 0; i < items.length; i += 3) {
    const item = {
      key: items[i]!,
      operation: items[i + 1]!,
      value: items[i + 2]!,
    }
    response.push(item)
  }
  return response
}

export const MultiSelectInput = React.memo((props: SelectInputProps) => {
  // 【输入框 + 列表】当前输入框里面的内容列表
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  // 【输入框】当前正在输入的内容
  const [currentInputValue, setCurrentInputValue] = useState<string>('')

  // 【下拉】当前正在活跃的是哪一个条目
  const [currentActiveItemIndex, setCurrentActiveItemIndex] = useState<number>(-1)

  // 【状态】当前正在输入什么
  const [currentSelectStatus, setCurrentSelectStatus] = useState<CurrentSelectStatus>(
    CurrentSelectStatus.key,
  )

  // select 提示框是否应该 展示
  const [shouldSelectOpen, setShouldSelectOpen] = useState(false)

  const [domUuid] = useState(uuidv4())
  const timeoutRef = useRef(-1)

  const updateSelectedItems = (items: string[]) => {
    setSelectedItems(items)
    if (items.length % 3 === 0 && props.onChange) {
      props.onChange(convertItemsToResponse(items))
    }
  }

  const getShowSelectItems = () => {
    if (currentSelectStatus === CurrentSelectStatus.key) {
      return props.selectKeys.filter((key) => {
        return (
          !selectedItems.filter((_, index) => index % 3 === 0).includes(key) &&
          key.includes(currentInputValue)
        )
      })
    }
    if (currentSelectStatus === CurrentSelectStatus.operation) {
      return props.operations.filter((key) => {
        return key.includes(currentInputValue)
      })
    }
    return [!currentInputValue ? i18n.t(i18nKeys.biz_please_enter_content) : currentInputValue]
  }

  let currentShowItems = getShowSelectItems()
  if (!currentShowItems.length) {
    currentShowItems = [NO_DATA_KEY]
  }

  // 用户改变输入的内容的时候
  const updateCurrentInputValue = (value: string) => {
    if (currentSelectStatus === CurrentSelectStatus.value) {
      setCurrentInputValue(value)
      return
    }

    setCurrentActiveItemIndex(0)
    setCurrentInputValue(value)
  }

  // 按下回车或者点击一个条目的情况：
  const enterCallback = (index?: number) => {
    const usedIndex = isNumber(index) ? index : currentActiveItemIndex

    let currentItem: string

    if (currentSelectStatus === CurrentSelectStatus.value) {
      if (!currentInputValue) return
      currentItem = currentInputValue
    } else {
      if (!currentShowItems[usedIndex]) return
      currentItem = currentShowItems[usedIndex]!
    }

    setCurrentInputValue('')
    const nextSelectItems = [...selectedItems, currentItem]
    updateSelectedItems(nextSelectItems)

    if (nextSelectItems.length % 3 === 0) {
      setCurrentSelectStatus(CurrentSelectStatus.key)
    }
    if (nextSelectItems.length % 3 === 1) {
      setCurrentSelectStatus(CurrentSelectStatus.operation)
    }
    if (nextSelectItems.length % 3 === 2) {
      setCurrentSelectStatus(CurrentSelectStatus.value)
    }
  }

  const deleteItemGroup = (index: number) => {
    if (index >= selectedItems.length) {
      return
    }
    const deleteCount = (index % 3) + 1
    const removeIndex = index - (deleteCount - 1)
    const nextSelectedItems = [...selectedItems]
    nextSelectedItems.splice(removeIndex, deleteCount)
    updateSelectedItems(nextSelectedItems)
    setCurrentSelectStatus(CurrentSelectStatus.key)
  }

  return (
    <div className="mst-container">
      <div className={classNames('mst-portal', { show: shouldSelectOpen })}>
        {currentShowItems.map((item, index) => {
          if (item === NO_DATA_KEY) {
            return <p className="mst-no-data">{i18n.t(i18nKeys.base_please_filter)}</p>
          }
          return (
            <p
              className={classNames('multi-select-down-item', {
                'active': currentActiveItemIndex === index,
                'please-input':
                  !currentInputValue && currentSelectStatus === CurrentSelectStatus.value,
              })}
              onClick={(e) => {
                enterCallback(index)
                document.getElementById(domUuid)!.focus()
                e.stopPropagation()
              }}
            >
              {item}
            </p>
          )
        })}
      </div>

      <TagInput
        rightElement={
          <div className="search-icon-container">
            <Icon icon="search-template" />
          </div>
        }
        // disableKeyboardOperation
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            let nextIndex = currentActiveItemIndex
            if (currentActiveItemIndex >= currentShowItems.length) {
              nextIndex = 0
            } else {
              nextIndex += 1
            }
            setCurrentActiveItemIndex(nextIndex)
          } else if (e.key === 'ArrowUp') {
            let nextIndex = currentActiveItemIndex
            if (nextIndex <= 0) {
              nextIndex = currentShowItems.length - 1
            } else {
              nextIndex -= 1
            }
            setCurrentActiveItemIndex(nextIndex)
          } else if (e.key === 'Enter') {
            enterCallback()
            e.stopPropagation()
          } else if (e.key === 'Backspace') {
            e.stopPropagation()

            if (currentInputValue) return
            deleteItemGroup(selectedItems.length - 1)
          } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.stopPropagation()
          }
        }}
        inputProps={{
          onClick: () => {
            setShouldSelectOpen(true)
            clearTimeout(timeoutRef.current)
          },
          onFocus: () => {
            setShouldSelectOpen(true)
            clearTimeout(timeoutRef.current)
          },
          onBlur: () => {
            // document.getElementById('mst-mock-content').focus()
            timeoutRef.current = window.setTimeout(() => {
              setShouldSelectOpen(false)
            }, 200)
          },
          value: currentInputValue,
          onKeyDown: (e) => {
            e.stopPropagation()
          },
          onChange: (e) => {
            updateCurrentInputValue(e.target.value)
          },
          id: domUuid,
        }}
        large={props.large}
        placeholder="Select By Filter (Use ↑ and ↓ to select)"
        tagProps={(value, index) => {
          const propsForTag: any = {
            minimal: true,
          }
          if (index % 3 !== 2) propsForTag.onRemove = undefined
          return propsForTag
        }}
        onRemove={(value, index) => {
          deleteItemGroup(index)
        }}
        className="multi-select-input-container"
        values={selectedItems}
      />
    </div>
  )
})
