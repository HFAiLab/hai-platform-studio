import type { ApiServerClient } from '@hai-platform/client-api-server'
import { ApiServerApiName } from '@hai-platform/client-api-server'
import { i18n, i18nKeys } from '@hai-platform/i18n'
import { makeListFromClusterDF } from '@hai-platform/shared'
import { Classes } from '@hai-ui/core'
import { Button, MenuItem } from '@hai-ui/core/lib/esm/components'
import classNames from 'classnames'
import React, { useContext, useEffect, useState } from 'react'
import { useGroot } from 'use-groot'
import { listenDocumentClickAndTryClose } from '../../../../../utils/dom'
import { ManagerServiceContext } from '../../../reducer'

export const getClusterInfoFromRemote = async (apiServerClient: ApiServerClient) => {
  try {
    const clusterDF = await apiServerClient.request(ApiServerApiName.CLUSTER_DF, {
      monitor: false,
    })
    const clusterUsage = makeListFromClusterDF(clusterDF.cluster_df, {
      ifInnerUser: window._hf_user_if_in,
    })
    return clusterUsage
  } catch (e) {
    // 这个可能在外发版比较常见，就先打出来方便后续定位问题
    console.error('getClusterInfoFromRemote error:', e)
    throw e
  }
}

export interface FilterGroupProps {
  groups: Set<string>
  onChange: (newGroups: Set<string>) => void
}

export const FilterGroup = (props: FilterGroupProps) => {
  const srvc = useContext(ManagerServiceContext)
  const [popOverShow, setPopOverShow] = useState(false)

  const { data: groupData, req } = useGroot({
    fetcher: getClusterInfoFromRemote,
    params: [srvc.app.api().getApiServerClient()],
    auto: false,
    swr: true,
  })

  let btnText = i18n.t(i18nKeys.biz_filter_by_groups)

  if (props.groups.size) {
    btnText =
      props.groups.size > 1
        ? i18n.t(i18nKeys.biz_filter_n_groups, {
            n: props.groups.size,
          })
        : [...props.groups].join(',')
  }

  useEffect(() => {
    if (!popOverShow) return () => {}
    const clear = listenDocumentClickAndTryClose('filter-group-container', () => {
      setPopOverShow(false)
    })
    return () => {
      clear()
    }
  }, [popOverShow])

  return (
    <div className="filter-group-container">
      <div className="filter-group-show">
        <Button
          className="filter-btn"
          small
          outlined
          title={btnText}
          active={props.groups.size > 0}
          onClick={() => {
            req()
            setPopOverShow(!popOverShow)
          }}
        >
          {btnText}
        </Button>
      </div>
      <div
        className={classNames('filter-range-popover', {
          show: popOverShow,
        })}
      >
        <div className="quick-opts">
          <Button
            small
            outlined
            disabled={!props.groups.size}
            onClick={() => {
              props.onChange(new Set([]))
            }}
          >
            {i18n.t(i18nKeys.biz_validate_clear_all_search)}
          </Button>
          <div className="flex-1" />
          <Button
            icon="cross"
            onClick={() => {
              setPopOverShow(false)
            }}
            small
            minimal
          />
        </div>
        <div className={`${Classes.MENU} filter-menu`}>
          {!groupData && <div className="loading">loading...</div>}
          {(groupData || []).map((i) => {
            const text = `${i.show.replace(/\s/g, '&nbsp;')}`
            return (
              <MenuItem
                className="exp-submit-group-select-item"
                active={props.groups.has(i.group)}
                disabled={!i.isLeaf}
                key={`${groupData?.length}-${i.show}-${i.group}`}
                onClick={() => {
                  const nextNextGroups = new Set([...props.groups])
                  if (props.groups.has(i.group)) nextNextGroups.delete(i.group)
                  else nextNextGroups.add(i.group)
                  props.onChange(nextNextGroups)
                }}
                // eslint-disable-next-line react/no-danger
                text={<p dangerouslySetInnerHTML={{ __html: text }} />}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
