import type {
  XTopicTagDisplayInfo,
  XTopicTopTagListResult,
} from '@hai-platform/client-ailab-server'
import { AilabServerApiName } from '@hai-platform/client-ailab-server'
import { InputGroup } from '@hai-ui/core/lib/esm'
import { debounce } from 'lodash-es'
import React, { useCallback, useContext, useState } from 'react'
import { GlobalAilabServerClient } from '../../../api/ailabServer'
import { HFPanel } from '../../../components/HFPanel'
import { GlobalContext } from '../../../reducer/context'
import { AppToaster } from '../../../utils'
import { XTopicTag } from '../widgets/Tag'

import './TagsFilter.scss'

export interface XTopicTagsFilterProps {
  topTags: XTopicTopTagListResult | undefined
}

export const XTopicTagsFilter = (props: XTopicTagsFilterProps) => {
  const globalContext = useContext(GlobalContext)

  const { xTopicListPageState } = globalContext.state
  const selectedTags = xTopicListPageState.tags

  const [searchTag, setSearchTag] = useState<string>('')
  const [searchedTags, setSearchedTags] = useState<XTopicTagDisplayInfo[]>([])
  const [searchLoading, setSearchLoading] = useState<boolean>(false)
  const [hasMore, setHasMore] = useState<number | undefined>(undefined)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const search = useCallback(
    debounce((searchKey: string) => {
      setSearchLoading(true)
      GlobalAilabServerClient.request(AilabServerApiName.XTOPIC_TOP_TAG_LIST, {
        keyword_pattern: searchKey,
      })
        .then((res) => {
          setSearchedTags(res.tags)
          setHasMore(res.more)
          setSearchLoading(false)
        })
        .catch((e) => {
          setSearchLoading(false)
          AppToaster.show({
            message: `搜索标签失败：${e}`,
          })
        })
    }, 600),
    [],
  )

  const displayedTags = searchTag ? searchedTags : props.topTags?.tags || []
  const displayedMore = searchTag ? hasMore : props.topTags?.more || 0

  return (
    <HFPanel className="xtopic-tags-filter" shadow title="标签" disableLoading>
      <div className="content">
        <div className="selected">
          {selectedTags.map((tag) => (
            <XTopicTag
              key={`s${tag}`}
              onRemove={() => {
                globalContext.dispatch([
                  {
                    type: 'xTopicListPageState',
                    value: {
                      ...xTopicListPageState,
                      tags: selectedTags.filter((i) => i !== tag),
                      page: 1,
                    },
                  },
                ])
              }}
            >
              {tag}
            </XTopicTag>
          ))}
        </div>
        <div className="search">
          <InputGroup
            placeholder="搜索标签"
            leftIcon="search"
            value={searchTag}
            onChange={(e) => {
              setSearchTag(e.target.value)
              search(e.target.value)
            }}
          />
        </div>
        <div className="all">
          {searchLoading && searchTag && <div className="tags-search-tip">搜索中...</div>}
          {!searchLoading && searchTag && !searchedTags.length && (
            <div className="tags-search-tip">没找到相关标签</div>
          )}
          {!searchLoading &&
            displayedTags.map((tag) => (
              <XTopicTag
                key={`d${tag.name}`}
                minimal
                interactive
                onClick={() => {
                  globalContext.dispatch([
                    {
                      type: 'xTopicListPageState',
                      value: {
                        ...xTopicListPageState,
                        tags: [tag.name],
                        page: 1,
                      },
                    },
                  ])
                }}
                // 防止点击后 focus
              >
                {tag.name} &nbsp; {tag.count}
              </XTopicTag>
            ))}
          {!!displayedMore && <div className="tags-more">... {displayedMore} 个标签未显示</div>}
        </div>
      </div>
    </HFPanel>
  )
}
