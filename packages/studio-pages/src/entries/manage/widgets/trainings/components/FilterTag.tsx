import { ApiServerApiName } from '@hai-platform/client-api-server'
import { i18n, i18nKeys } from '@hai-platform/i18n'
import { SpecialTags, excludeStar } from '@hai-platform/shared'
import { Classes } from '@hai-ui/core'
import { Button, MenuItem } from '@hai-ui/core/lib/esm/components'
import classNames from 'classnames'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { listenDocumentClickAndTryClose } from '../../../../../utils/dom'
import { ManagerServiceContext } from '../../../reducer'

export interface FilterTagProps {
  tag: Set<string>
  onChange: (newTags: Set<string>) => void
}

export const FilterTag = (props: FilterTagProps) => {
  const srvc = useContext(ManagerServiceContext)
  const [popOverShow, setPopOverShow] = useState(false)
  const excludeStarSelectedTags = useCallback(
    () => new Set(excludeStar([...props.tag])),
    [props.tag],
  )
  const [excludeStarAllTagList, setExcludeStarAllTagList] = useState<string[] | undefined>()
  const tagsShowInList = [
    ...new Set([
      SpecialTags.HIDDEN,
      ...[...(excludeStarAllTagList || []), ...excludeStarSelectedTags()].sort(),
    ]),
  ]

  const fetchAllTags = () =>
    srvc.app
      .api()
      .getApiServerClient()
      .request(ApiServerApiName.GET_TASK_TAGS)
      .then((ret) => {
        setExcludeStarAllTagList(excludeStar(ret || []))
      })

  let btnText = i18n.t(i18nKeys.biz_filter_by_tag)

  if (excludeStarSelectedTags().size) {
    btnText =
      excludeStarSelectedTags().size > 1
        ? i18n.t(i18nKeys.biz_filter_n_tag, {
            n: excludeStarSelectedTags().size,
          })
        : [...excludeStarSelectedTags()].join(',')
  }

  useEffect(() => {
    if (!popOverShow) return () => {}
    const clear = listenDocumentClickAndTryClose('filter-tag-container', () => {
      setPopOverShow(false)
    })
    return () => {
      clear()
    }
  }, [popOverShow])

  return (
    <div className="filter-tag-container">
      <div className="filter-tag-show">
        <Button
          className="filter-btn"
          small
          outlined
          title={i18n.t(i18nKeys.biz_filter_by_tag)}
          active={excludeStarSelectedTags().size > 0}
          onClick={() => {
            fetchAllTags()
            setPopOverShow(!popOverShow)
          }}
        >
          {btnText}
        </Button>
      </div>
      <div
        className={classNames('filter-tag-popover', {
          show: popOverShow,
        })}
      >
        <div className="quick-opts">
          <Button
            small
            outlined
            disabled={!excludeStarSelectedTags().size}
            onClick={() => {
              props.onChange(new Set(props.tag.has(SpecialTags.STAR) ? [SpecialTags.STAR] : []))
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
          {!excludeStarAllTagList && <div className="loading">loading...</div>}
          {tagsShowInList.map((i) => {
            return (
              <MenuItem
                className="exp-submit-tag-select-item"
                active={props.tag.has(i)}
                icon={i === SpecialTags.HIDDEN ? 'eye-off' : 'tag'}
                key={i}
                onClick={() => {
                  const nextTags = new Set([...props.tag])
                  if (props.tag.has(i)) nextTags.delete(i)
                  else nextTags.add(i)
                  props.onChange(nextTags)
                }}
                text={i}
                intent={i === SpecialTags.HIDDEN ? 'primary' : undefined}
                label={
                  i === SpecialTags.HIDDEN
                    ? i18n.t(i18nKeys.biz_exp_tag_default_no_hidden)
                    : undefined
                }
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
