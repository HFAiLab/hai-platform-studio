import { ApiServerApiName } from '@hai-platform/client-api-server'
import { i18n, i18nKeys } from '@hai-platform/i18n'
import { SyncFileType } from '@hai-platform/shared'
import type { WorkspaceFile } from '@hai-platform/shared'
import { HFLoading } from '@hai-platform/studio-pages/lib/ui-components/HFLoading'
import { RefreshBtn } from '@hai-platform/studio-pages/lib/ui-components/refresh'
import { SVGWrapper } from '@hai-platform/studio-pages/lib/ui-components/svgWrapper'
import { LevelLogger } from '@hai-platform/studio-toolkit/lib/esm'
import { bytesToDisplay } from '@hai-platform/studio-toolkit/lib/esm/utils/convert'
import { PromisePool } from '@hai-platform/studio-toolkit/lib/esm/utils/promisePool'
import { Button } from '@hai-ui/core/lib/esm/components/button/buttons'
import classNames from 'classnames'
import dayjs from 'dayjs'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useEffectOnce } from 'react-use'
import { v4 as uuidv4 } from 'uuid'
import { GlobalApiServerClient } from '../../../api/apiServer'
import FileSvg from '../../../components/svg/file.svg?raw'
import FolderSvg from '../../../components/svg/folder.svg?raw'
import { AppToaster } from '../../../utils'
import { AilabCountly, CountlyEventKey } from '../../../utils/countly'
import type { SyncStatusObjectMap } from './types'

const BrowserConfig = {
  basicPageSize: 50, // 每次请求多少文件
  firstFetchSize: 300, // 第一次拉取，获取多少文件
}

function composeDirs(sourceFiles: WorkspaceFile[]) {
  const dist: any = {}

  for (const sourceFile of sourceFiles) {
    const pathList = sourceFile.path.split('/')
    let curr = dist
    for (let i = 0; i < pathList.length - 1; i += 1) {
      if (!curr[pathList[i]!]) {
        curr[pathList[i]!] = {
          meta: {
            type: 'directory',
          },
          children: [],
        }
      }
      curr = curr[pathList[i]!].children
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    curr[pathList[pathList.length - 1]!] = {
      meta: {
        type: 'file',
        ...sourceFile,
      },
    }
  }
}

const defaultQueryPath = ['.']

export const WorkspaceBrowser = (props: {
  workspaceMap: SyncStatusObjectMap
  activePanelName: string
  updateActivePanelName: (name: string) => void
}) => {
  const [currentQueryPath, setCurrentQueryPath] = useState(['.'])
  const [currentListItems, setCurrentListItems] = useState<WorkspaceFile[]>([])

  const [uuid, setUuid] = useState(uuidv4())
  const uuidRef = useRef(uuid)
  const [nextFetchPage, setNextFetchPage] = useState(1)
  const [currentTotal, setCurrentTotal] = useState(0)
  const [firstFetchDone, setFirstFetchDone] = useState(false)
  const [appendFetching, setAppendFetching] = useState(false)

  const [filesOverFlow, setFilesOverFlow] = useState(false)
  const filesContainer = useRef<HTMLDivElement>(null)

  const reset = () => {
    setNextFetchPage(1)
    setCurrentTotal(0)
    setFirstFetchDone(false)
    setAppendFetching(false)

    const nextUUId = uuidv4()
    setUuid(nextUUId)
    uuidRef.current = nextUUId
  }

  const getCurrentFilePath = () => {
    return currentQueryPath.join('/')
  }

  const firstFetch = (currentUuid: string) => {
    GlobalApiServerClient.request(
      ApiServerApiName.LIST_CLUSTER_FILES,
      {
        file_type: SyncFileType.workspace,
        name: props.activePanelName,
        page: 1,
        size: BrowserConfig.basicPageSize,
        recursive: false,
        no_checksum: true,
      },
      {
        data: {
          file_list: {
            files: [getCurrentFilePath()],
          },
        },
      },
    )
      .then(async (res) => {
        if (currentUuid !== uuidRef.current) {
          LevelLogger.warn('uuid not equal, skip')
          return
        }

        let totalItems = res.items
        const requestTotal = Math.min(res.total, BrowserConfig.firstFetchSize)
        const restLength = requestTotal - BrowserConfig.basicPageSize

        setCurrentTotal(res.total)

        if (restLength > 0) {
          const reqNumber = Math.ceil(restLength / BrowserConfig.basicPageSize)
          let pages = new Array(reqNumber).fill(0)
          pages = pages.map((i, index) => index + 2)

          setNextFetchPage(pages[pages.length - 1] + 1)

          const paramsList = pages.map((page) => {
            return {
              size: BrowserConfig.basicPageSize,
              page,
              files: [getCurrentFilePath()],
              name: props.activePanelName,
              file_type: SyncFileType.workspace,
              recursive: false,
            }
          })

          const pool = new PromisePool(6)
          const restRes = await pool.batchRequest((params) => {
            return GlobalApiServerClient.request(
              ApiServerApiName.LIST_CLUSTER_FILES,
              {
                size: params.size,
                page: params.page,
                name: params.name,
                file_type: params.file_type,
                recursive: params.recursive,
                no_checksum: true,
              },
              {
                data: {
                  file_list: {
                    files: params.files,
                  },
                },
              },
            )
          }, paramsList)

          if (currentUuid !== uuidRef.current) {
            LevelLogger.warn('uuid not equal in pool fetch, skip')
            return
          }

          totalItems = [...totalItems].concat(...restRes.map((subRes) => subRes.items))
        } else {
          // 一起能请求完，不需要下一页了
          setNextFetchPage(2)
        }
        composeDirs(totalItems)
        setCurrentListItems(totalItems)
        setFirstFetchDone(true)
      })
      .catch((e) => {
        AppToaster.show({
          message: e,
          intent: 'danger',
        })
      })
  }

  const loadMoreFiles = (currentUuid: string) => {
    setAppendFetching(true)
    GlobalApiServerClient.request(
      ApiServerApiName.LIST_CLUSTER_FILES,
      {
        size: BrowserConfig.basicPageSize,
        page: nextFetchPage,
        name: props.activePanelName,
        file_type: SyncFileType.workspace,
        recursive: false,
        no_checksum: true,
      },
      {
        data: {
          file_list: {
            files: [getCurrentFilePath()],
          },
        },
      },
    ).then((res) => {
      if (currentUuid !== uuidRef.current) {
        LevelLogger.warn('loadmore uuid not equal, skip')
        return
      }

      const nextListItems = [...currentListItems].concat(res.items)
      setNextFetchPage(nextFetchPage + 1)
      setCurrentListItems(nextListItems)
      setAppendFetching(false)
    })
  }

  const shouldShowLoadMore =
    firstFetchDone && (nextFetchPage - 1) * BrowserConfig.basicPageSize < currentTotal

  useEffect(() => {
    reset()
    firstFetch(uuidRef.current)
    /* eslint-disable-next-line */
  }, [currentQueryPath, props.activePanelName])

  const currPath = (path: string) => {
    const isDir = /\/$/.test(path)
    return path.replace(/\/$/, '').split('/')!.pop()! + (isDir ? '/' : '')
  }

  const isDir = (path: string) => {
    return /\/$/.test(currPath(path))
  }

  const setNextQueryPath = (nextPaths: string[]) => {
    if (nextPaths.join('/') === currentQueryPath.join('/')) return

    setFirstFetchDone(false) // 这里可以提前进入 loading，优化用户体验
    setCurrentQueryPath(nextPaths)
  }

  /* eslint-disable-next-line */
  useLayoutEffect(() => {
    if (!filesContainer.current) return
    const nextFilesOverFlow =
      filesContainer.current.scrollHeight > filesContainer.current.clientHeight
    if (nextFilesOverFlow !== filesOverFlow) setFilesOverFlow(filesOverFlow)
  })

  useEffectOnce(() => {
    AilabCountly.safeReport(CountlyEventKey.workSpaceOpenBrowser)
  })

  return (
    <div className="workspace-side-container hf">
      <div className="header-panel">
        <div className="header-left">
          <div className="unit">
            <div className="title">{i18n.t(i18nKeys.biz_workspace_name)}</div>
            <div className="content">
              <div className="hai-ui-html-select .modifier">
                <select
                  onChange={(e) => {
                    props.updateActivePanelName(e.target!.value)
                    setNextQueryPath(defaultQueryPath)
                  }}
                >
                  {Object.values(props.workspaceMap).map((item) => {
                    return (
                      <option
                        key={item.name}
                        selected={props.activePanelName === item.name}
                        value={item.name}
                      >
                        {item.name}
                      </option>
                    )
                  })}
                </select>
                <span className="hai-ui-icon hai-ui-icon-double-caret-vertical" />
              </div>
            </div>
          </div>
          <div className="unit">
            <div className="title">{i18n.t(i18nKeys.biz_workspace_cluster_path)}</div>
            <div className="content">{props.workspaceMap[props.activePanelName]?.cluster_path}</div>
          </div>
        </div>
        <div className="header-right">
          <RefreshBtn
            className="header-refresh"
            onClick={() => {
              firstFetch(uuid)
            }}
          />
          <p>
            {i18n.t(i18nKeys.biz_workspace_push_updated_at_time)}:{' '}
            {dayjs(props.workspaceMap[props.activePanelName]?.push_updated_at).format(
              'YYYY-MM-DD HH:MM',
            )}
          </p>
        </div>
      </div>
      <div className="file-panel-path">
        <p>
          {currentQueryPath.map((item, index) => {
            const itemPath =
              index === 0 ? props.workspaceMap[props.activePanelName]?.cluster_path : item
            const pathLastIsDirSymbol = /\/$/.test(itemPath || '')

            return (
              <>
                <span
                  className={classNames('file-path-select-item', {
                    first: index === 0,
                  })}
                  onClick={() => {
                    setNextQueryPath(currentQueryPath.slice(0, index + 1))
                  }}
                >
                  {itemPath}
                </span>
                {index !== currentQueryPath.length - 1 && !pathLastIsDirSymbol && <span>/</span>}
              </>
            )
          })}
        </p>
      </div>
      <div className={classNames('file-panel-title-container', { overflow: filesOverFlow })}>
        <div className={classNames('file-panel-title', { overflow: filesOverFlow })}>
          <div className="path">{i18n.t(i18nKeys.biz_workspace_cluster_path)}</div>
          <div className="size">{i18n.t(i18nKeys.biz_workspace_size)}</div>
          <div className="modified">{i18n.t(i18nKeys.biz_workspace_file_update_time)}</div>
          {/* <div className="download">operation</div> */}
        </div>
      </div>
      <div className={classNames('file-panel-item-group')} ref={filesContainer}>
        {!firstFetchDone && <HFLoading />}
        {currentQueryPath.length !== 1 && (
          <div className="file-panel-item">
            <div
              className={classNames('path', 'clickable')}
              onClick={() => {
                setNextQueryPath(currentQueryPath.slice(0, currentQueryPath.length - 1))
              }}
            >
              <SVGWrapper svg={FolderSvg} dClassName="path-icon" />
              <span>..</span>
            </div>
          </div>
        )}
        {currentListItems.map((item) => (
          <div key={item.path} className="file-panel-item">
            <div
              className={classNames('path', {
                clickable: isDir(item.path),
                ignore: item.ignored,
              })}
              onClick={() => {
                if (!/\/$/.test(currPath(item.path))) return
                setNextQueryPath([...currentQueryPath, currPath(item.path)])
              }}
            >
              <SVGWrapper svg={isDir(item.path) ? FolderSvg : FileSvg} dClassName="path-icon" />
              <span
                title={
                  item.ignored
                    ? `[ignore by .hfignore] ${currPath(item.path)}`
                    : `${currPath(item.path)}`
                }
              >
                {currPath(item.path)}
              </span>
            </div>
            <div className="size">{bytesToDisplay(item.size)}</div>
            <div className="modified">{item.last_modified}</div>
            {/* <div className="download"></div> */}
          </div>
        ))}
        {shouldShowLoadMore && (
          <div className="file-panel-loadmore">
            <Button
              loading={appendFetching}
              onClick={() => {
                if (appendFetching) return
                loadMoreFiles(uuid)
              }}
            >
              {i18n.t(i18nKeys.biz_workspace_files_loadmore)}
            </Button>
          </div>
        )}
        {currentTotal > BrowserConfig.firstFetchSize && !shouldShowLoadMore && (
          <div className="file-panel-load-ready">
            <p>{i18n.t(i18nKeys.biz_workspace_files_load_done)}</p>
          </div>
        )}
      </div>
    </div>
  )
}
