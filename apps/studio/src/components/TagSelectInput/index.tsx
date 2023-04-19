import { TagInput } from '@hai-ui/core'
import classNames from 'classnames'
import './index.scss'
import { isNumber } from 'lodash-es'
import React, { useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { AppToaster } from '../../utils'

export interface TagSelectInputItem {
  value: string
  name: string
}

interface TagSelectInputProps {
  large?: boolean
  max?: number
  onChange?: (response: string[]) => void
  getSuggestions: (value: string, currentTags: string[]) => TagSelectInputItem[]
  maxTextLength?: number
}

export const TagSelectInput = React.memo((props: TagSelectInputProps) => {
  // 【输入框 + 列表】当前输入框里面的内容列表
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  // 【输入框】当前正在输入的内容
  const [currentInputValue, setCurrentInputValue] = useState<string>('')

  // 【下拉】当前正在活跃的是哪一个条目
  const [currentActiveItemIndex, setCurrentActiveItemIndex] = useState<number>(-1)

  // select 提示框是否应该 展示
  const [shouldSelectOpen, setShouldSelectOpen] = useState(false)

  const [domUuid] = useState(uuidv4())
  const timeoutRef = useRef(-1)

  // 最多有多少个标签
  const { max } = props

  const updateSelectedItems = (items: string[]) => {
    setSelectedItems(items)
    if (props.onChange) props.onChange(items)
  }

  const currentSuggestions = props.getSuggestions(currentInputValue, selectedItems)

  // 用户改变输入的内容的时候
  const updateCurrentInputValue = (value: string) => {
    setCurrentActiveItemIndex(-1)
    setCurrentInputValue(value)
  }

  // 按下回车或者点击一个条目的情况：
  const enterCallback = (index?: number) => {
    const usedIndex = isNumber(index) ? index : currentActiveItemIndex

    let currentItem = currentInputValue
    if (currentSuggestions[usedIndex]?.value) {
      currentItem = currentSuggestions[usedIndex]!.value
    }

    if (!currentItem) return

    if (props.maxTextLength && currentItem.length > props.maxTextLength) {
      AppToaster.show({
        message: `单个 Tag 最多不能超过 ${props.maxTextLength} 个字符`,
        intent: 'danger',
      })
      return
    }

    const nextSelectItems = [...selectedItems, currentItem]

    if (max && nextSelectItems.length > max) {
      AppToaster.show({
        message: `最多不能超过 ${max} 个`,
        intent: 'danger',
      })
      return
    }

    setCurrentInputValue('')
    updateSelectedItems(nextSelectItems)
  }

  const deleteItemGroup = (index: number) => {
    if (index >= selectedItems.length) {
      return
    }
    const deleteCount = 1
    const removeIndex = index - (deleteCount - 1)
    const nextSelectedItems = [...selectedItems]
    nextSelectedItems.splice(removeIndex, deleteCount)
    updateSelectedItems(nextSelectedItems)
  }

  return (
    <div className="tsi-container">
      <div className={classNames('tsi-portal', { show: shouldSelectOpen })}>
        {currentSuggestions.map((item, index) => {
          return (
            <p
              className={classNames('multi-select-down-item', {
                active: currentActiveItemIndex === index,
              })}
              onClick={(e) => {
                enterCallback(index)
                document.getElementById(domUuid)!.focus()
                e.stopPropagation()
              }}
            >
              {item.name}
            </p>
          )
        })}
      </div>

      <TagInput
        // disableKeyboardOperation
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            let nextIndex = currentActiveItemIndex
            if (currentActiveItemIndex >= currentSuggestions.length) {
              nextIndex = 0
            } else {
              nextIndex += 1
            }
            setCurrentActiveItemIndex(nextIndex)
          } else if (e.key === 'ArrowUp') {
            let nextIndex = currentActiveItemIndex
            if (nextIndex <= 0) {
              nextIndex = currentSuggestions.length - 1
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
        placeholder="使用 ↑ 和 ↓ 选择现有标签，或直接输入自定义标签，通过回车确认输入"
        tagProps={() => {
          const propsForTag = {
            minimal: true,
          }
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
