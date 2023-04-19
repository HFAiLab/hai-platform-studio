import { ApiServerApiName } from '@hai-platform/client-api-server'
import { i18n, i18nKeys } from '@hai-platform/i18n'
import { SpecialTags } from '@hai-platform/shared'
import type { TagProps } from '@hai-ui/core/lib/esm'
import { Button, FormGroup, Intent, Menu, MenuItem, TagInput } from '@hai-ui/core/lib/esm'
import { Popover2 } from '@hai-ui/popover2/lib/esm/popover2'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { genPopover } from '../../../../../ui-components/popover'
import { ExpServiceContext } from '../../../reducer'
import type { SubmitCommonInputProps } from '../schema'
import { Exp2EditTip } from '../widgets/EditTip'

export interface TagsInputProps extends SubmitCommonInputProps {
  tags: string[]
  showEditTip: boolean
  editTip?: string | undefined
}
const getTagProps = (value: React.ReactNode): TagProps => ({
  intent: Intent.WARNING,
  minimal: true,
  icon: value === SpecialTags.STAR ? 'star' : undefined,
})

interface HistoryProps {
  currentTags: string[]
  setter(tag: string, op: 'add' | 'remove'): void
}
const HistoryButton = (props: HistoryProps) => {
  const srvc = useContext(ExpServiceContext)
  const [suggestTags, setSuggestTags] = useState<string[]>([SpecialTags.STAR])
  const [popOpen, setPopOpen] = useState(false)
  const lastFetchTime = useRef(0)
  const [isLoading, setIsLoading] = useState(false)

  // 首次请求成功状态
  const [initFetched, setInitFetched] = useState(false)

  const fetchSuggestTags = () => {
    setIsLoading(true)
    srvc.app
      .api()
      .getApiServerClient()
      .request(ApiServerApiName.GET_TASK_TAGS)
      .then((ret) => {
        lastFetchTime.current = new Date().valueOf()
        setSuggestTags([...new Set([SpecialTags.STAR, ...(ret || []).sort()])])
        setInitFetched(true)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }
  useEffect(() => {
    if (popOpen) {
      if (new Date().valueOf() - lastFetchTime.current > 15 * 1000) fetchSuggestTags()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [popOpen])

  return (
    <Popover2
      onClose={() => setPopOpen(false)}
      onOpened={() => setPopOpen(true)}
      placement="right-end"
      minimal
      content={
        <Menu className="exp2-tag-history">
          {suggestTags.length ? (
            suggestTags.map((i) => {
              let icon: React.ComponentProps<typeof MenuItem>['icon']
              if (i === SpecialTags.STAR) {
                icon = props.currentTags.includes(i) ? 'star' : 'star-empty'
              } else {
                icon = props.currentTags.includes(i) ? 'tick' : 'blank'
              }
              return (
                <MenuItem
                  text={i}
                  icon={icon}
                  onClick={() => {
                    props.setter(i, props.currentTags.includes(i) ? 'remove' : 'add')
                  }}
                />
              )
            })
          ) : (
            <div style={{ textAlign: 'center', margin: '10', color: 'var(--hf-text-lighter)' }}>
              {isLoading || !initFetched
                ? i18n.t(i18nKeys.biz_loading)
                : i18n.t(i18nKeys.biz_exp_submit_tags_no_recently_tag)}
            </div>
          )}
        </Menu>
      }
    >
      <Button
        title={i18n.t(i18nKeys.biz_exp_tag_recently_used)}
        loading={isLoading}
        icon="history"
      />
    </Popover2>
  )
}

export const Exp2TagsInput = (props: TagsInputProps) => {
  const editTag = (tag: string, op: 'add' | 'remove') => {
    const nt = tag.trim()
    if (!nt) {
      return
    }
    if (op === 'add') {
      if (props.tags.includes(nt)) {
        return
      }
      props.onChange({ type: 'tags', value: [...props.tags, nt] })
      return
    }
    if (op === 'remove') {
      props.onChange({ type: 'tags', value: props.tags.filter((t) => t !== nt) })
    }
  }

  return (
    <>
      <FormGroup
        style={{ marginBottom: 4 }}
        label={genPopover({
          inline: true,
          label: i18n.t(i18nKeys.biz_exp_submit_tags),
          helperText: i18n.t(i18nKeys.biz_exp_submit_tags_desc),
        })}
        labelFor="exp2-tags-input"
      />
      <div className="extra-options-inner-unit">
        {props.showEditTip && <Exp2EditTip value={`${props.editTip}`} isLock={props.isLock} />}
        <TagInput
          disabled={props.isLock}
          leftIcon="tag"
          addOnBlur
          addOnPaste
          fill
          tagProps={getTagProps}
          values={props.tags}
          rightElement={
            props.isLock ? undefined : <HistoryButton setter={editTag} currentTags={props.tags} />
          }
          onAdd={(values) => {
            for (const t of values) {
              editTag(t as string, 'add')
            }
          }}
          onRemove={(value) => {
            editTag(value as string, 'remove')
          }}
        />
      </div>
    </>
  )
}
