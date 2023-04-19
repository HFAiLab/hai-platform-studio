import { Icon, InputGroup } from '@hai-ui/core'
import { debounce } from 'lodash-es'
import React, { useCallback, useContext } from 'react'
import { useEffectOnce } from 'react-use'
import { WebEventsKeys, hfEventEmitter } from '../../../../modules/event'
import { GlobalContext } from '../../../../reducer/context'

interface ServiceSearchProps {
  onSearch?: (value: string) => void
}

export const ServiceSearch = (props: ServiceSearchProps) => {
  const { state, dispatch } = useContext(GlobalContext)
  const value = state.jupyterManagePageState.filterKw
  const setValue = (v: string) => {
    dispatch([
      { type: 'jupyterManagePageState', value: { ...state.jupyterManagePageState, filterKw: v } },
    ])
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const searchChange = useCallback(
    debounce((searchValue: string) => {
      if (props.onSearch) {
        props.onSearch(searchValue)
      }
    }, 300),
    [],
  )

  // state 中可能存在 keyword
  useEffectOnce(() => {
    if (value) {
      searchChange(value)
    }
  })

  useEffectOnce(() => {
    const setSearch = (nextValue: string) => {
      setValue(nextValue)
    }
    hfEventEmitter.on(WebEventsKeys.containerAdminSearchChange, setSearch)

    return () => {
      hfEventEmitter.off(WebEventsKeys.containerAdminSearchChange, setSearch)
    }
  })

  return (
    <div className="ctm-search">
      <InputGroup
        value={value}
        placeholder="输入关键字搜索"
        onChange={(e) => {
          setValue(e.target.value)
          searchChange(e.target.value)
        }}
        rightElement={
          <div className="search-icon-container">
            <Icon
              icon="search-template"
              onClick={() => {
                if (props.onSearch) {
                  props.onSearch(value)
                }
              }}
            />
          </div>
        }
      />
    </div>
  )
}
