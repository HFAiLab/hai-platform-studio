import img_notfound from '@hai-platform/icons/sundries/not-found.svg?raw'
import { HFLoadingError } from '@hai-platform/studio-pages/lib/ui-components/HFLoading'
import { SVGWrapper } from '@hai-platform/studio-pages/lib/ui-components/svgWrapper'
import {
  Button,
  ButtonGroup,
  Icon,
  InputGroup,
  Menu,
  MenuItem,
  Tab,
  Tabs,
} from '@hai-ui/core/lib/esm'
import { Popover2 } from '@hai-ui/popover2/lib/esm'
import classNames from 'classnames'
import { debounce } from 'lodash-es'
import React, { useCallback, useContext, useState } from 'react'
import ReactPaginate from 'react-paginate'
import { useEffectOnce } from 'react-use'
import { GrootStatus } from 'use-groot'
import type { XTopicListPageState } from '../../../../reducer'
import { xTopicPageSizeLists } from '../../../../reducer'
import { GlobalContext } from '../../../../reducer/context'
import { AilabCountly, CountlyEventKey } from '../../../../utils/countly'
import type { CombinePostsResult } from '../../schema/posts'
import { PostListItem } from './PostListItem'
import { SearchListItem } from './SearchListItem'

import './PostList.scss'

export interface XTopicPostListProps {
  combinePosts: CombinePostsResult | undefined
  skeleton?: boolean
  postsStatus: GrootStatus
  error?: Error
  fullTextSearchAvailable: boolean
  refresh: () => void
}

export const XTopicPostList = (props: XTopicPostListProps) => {
  const globalContext = useContext(GlobalContext)
  const { xTopicListPageState } = globalContext.state
  const [keyword, setKeyWord] = useState<string | undefined>(xTopicListPageState.keyword)
  const [searchFocus, setSearchFocus] = useState(false)
  const { combinePosts } = props

  const quickUpdateXTopicState = (keyValues: Partial<XTopicListPageState>) => {
    globalContext.dispatch([
      {
        type: 'xTopicListPageState',
        value: {
          ...xTopicListPageState,
          ...keyValues,
        },
      },
    ])
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const searchFromMeili = useCallback(
    debounce((searchKey: string) => {
      quickUpdateXTopicState({
        keyword: searchKey,
        tags: [],
        page: 1,
      })
    }, 300),
    [],
  )

  const nothingFound =
    props.postsStatus === GrootStatus.success &&
    ((combinePosts && combinePosts.type === 'search' && combinePosts.posts.hits.length === 0) ||
      (combinePosts && combinePosts.type === 'flow' && combinePosts.posts.rows.length === 0))

  const currentIsSearchMode = combinePosts?.type === 'search'

  let showCombinePosts = combinePosts

  if (props.skeleton) {
    if (!combinePosts?.type || combinePosts.type === 'flow') {
      showCombinePosts = {
        type: 'flow',
        posts: {
          count: xTopicListPageState.pageSize,
          rows: new Array(xTopicListPageState.pageSize).fill({}),
        },
      }
    } else {
      showCombinePosts = {
        type: 'search',
        posts: {
          ...combinePosts.posts,
          count: xTopicListPageState.pageSize,
          hits: new Array(xTopicListPageState.pageSize).fill({}),
        },
      }
    }
  }

  useEffectOnce(() => {
    AilabCountly.safeReport(CountlyEventKey.XTopicListOpen)
  })

  return (
    <div className="xtopic-post-list">
      <Tabs
        selectedTabId={
          // eslint-disable-next-line no-nested-ternary
          currentIsSearchMode ? 'all' : !xTopicListPageState.onlyAboutMe ? 'all' : 'onlyAboutMe'
        }
        onChange={(id) => {
          AilabCountly.safeReport(CountlyEventKey.XTopicChangeListTab)
          quickUpdateXTopicState({
            onlyAboutMe: id !== 'all',
            page: 1,
          })
        }}
      >
        <Tab id="all" title="全部话题" disabled={currentIsSearchMode} />
        <Tab
          id="onlyAboutMe"
          disabled={currentIsSearchMode}
          title={<span title="我创建或者回复的话题">我参与过的话题</span>}
        />

        <InputGroup
          className={classNames('xtopic-x-search-group', { focused: searchFocus })}
          placeholder={props.fullTextSearchAvailable ? '全文内容检索' : '标题搜索 (回车确认)'}
          leftIcon="search"
          value={keyword}
          type="search"
          onChange={(e) => {
            if (props.fullTextSearchAvailable) {
              setKeyWord(e.target.value)
              searchFromMeili(e.target.value)
            } else {
              if (keyword && !e.target.value) {
                quickUpdateXTopicState({
                  keyword: '',
                  page: 1,
                })
              }
              setKeyWord(e.target.value)
            }
          }}
          onFocus={() => {
            setSearchFocus(true)
          }}
          onBlur={() => {
            setSearchFocus(false)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              quickUpdateXTopicState({
                keyword,
                page: 1,
              })
            }
          }}
        />
        <Tabs.Expander />
        <div className="ops">
          <Popover2
            disabled={currentIsSearchMode || searchFocus}
            minimal
            position="bottom-left"
            content={
              <Menu>
                <MenuItem
                  text="按时间排序"
                  onClick={() => {
                    AilabCountly.safeReport(CountlyEventKey.XTopicChangeOrderType)
                    quickUpdateXTopicState({
                      orderBy: 'createdAt',
                    })
                  }}
                />
                <MenuItem
                  text="按热度排序"
                  onClick={() => {
                    AilabCountly.safeReport(CountlyEventKey.XTopicChangeOrderType)
                    quickUpdateXTopicState({
                      orderBy: 'heat',
                    })
                  }}
                />
              </Menu>
            }
          >
            <Button
              minimal
              disabled={currentIsSearchMode || searchFocus}
              icon="sort"
              onClick={() => {}}
              rightIcon="caret-down"
            >
              {xTopicListPageState.orderBy === 'createdAt' ? '按时间' : '按热度'}
            </Button>
          </Popover2>
        </div>
      </Tabs>
      <div className="hr" />
      {nothingFound && (
        <div className="posts-not-found-container">
          <SVGWrapper width="256px" height="256px" svg={img_notfound} />
          <p className="posts-not-found-tip">没有搜索到符合条件的记录</p>
        </div>
      )}
      {props.postsStatus === GrootStatus.error && props.error && (
        <div className="posts-error-container">
          <HFLoadingError
            message="获取话题列表失败，请稍后重试"
            retryText="尝试重新获取"
            retry={() => {
              props.refresh()
            }}
          />
        </div>
      )}
      {showCombinePosts && (
        <>
          {showCombinePosts?.type === 'search' &&
            showCombinePosts.posts.hits.map((searchItem) => {
              return <SearchListItem skeleton={!!props.skeleton} searchItem={searchItem} />
            })}
          {showCombinePosts?.type === 'flow' &&
            showCombinePosts.posts.rows.map((item) => (
              <PostListItem
                skeleton={!!props.skeleton}
                item={item}
                // 渲染骨架图的时候，key可能为空
                key={item.uuid ?? Math.random()}
              />
            ))}
          <div className="pagi">
            <ReactPaginate
              previousLabel="<"
              nextLabel=">"
              breakLabel="..."
              breakClassName="break-me"
              pageCount={Math.ceil(showCombinePosts.posts.count / xTopicListPageState.pageSize)}
              marginPagesDisplayed={1}
              pageRangeDisplayed={3}
              onPageChange={(changeInfo) => {
                quickUpdateXTopicState({
                  page: changeInfo.selected + 1,
                })
              }}
              containerClassName="common-pagination"
              activeClassName="active"
              forcePage={xTopicListPageState.page - 1}
            />
            <div className="page-size-control">
              <span>每页</span>
              <ButtonGroup>
                {xTopicPageSizeLists.map((pageSize) => (
                  <Button
                    small
                    key={pageSize}
                    outlined
                    intent={
                      `${pageSize}` === `${xTopicListPageState.pageSize}` ? 'primary' : undefined
                    }
                    active={`${pageSize}` === `${xTopicListPageState.pageSize}`}
                    onClick={() => {
                      quickUpdateXTopicState({
                        pageSize,
                        page: 1, // 选择 pageSize 之后直接切换到第一页，避免很多问题
                      })
                    }}
                  >
                    {pageSize}
                  </Button>
                ))}
              </ButtonGroup>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
