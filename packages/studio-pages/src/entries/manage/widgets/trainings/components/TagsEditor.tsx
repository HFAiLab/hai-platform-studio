import { ApiServerApiName } from '@hai-platform/client-api-server'
import { i18n, i18nKeys } from '@hai-platform/i18n'
import { SpecialTags, excludeStar } from '@hai-platform/shared'
import type { TagProps } from '@hai-ui/core/lib/esm'
import {
  Button,
  Callout,
  Dialog,
  Icon,
  Intent,
  Menu,
  MenuItem,
  Tab,
  Tabs,
  Tag,
  TagInput,
} from '@hai-ui/core/lib/esm'
import { isEqual } from 'lodash-es'
import allSettled from 'promise.allsettled'
import React, { useContext, useEffect, useState } from 'react'
import type { Chain } from '../../../../../model/Chain'
import { ManagerServiceContext } from '../../../reducer'

const getTagProps = (): TagProps => ({
  intent: Intent.WARNING,
  minimal: true,
})

export const TagsEditorSingle = (props: {
  isOpen: boolean
  targetChain?: Chain
  setShow(show: boolean): void
  refreshHandler: (hideToast?: boolean) => void
}) => {
  const srvc = useContext(ManagerServiceContext)
  // 过滤掉 star 这个 tag，这个是单独作为收藏用
  const noStarTags = excludeStar(props.targetChain?.tags ?? [])
  const [suggestTags, setSuggestTags] = useState([SpecialTags.HIDDEN])

  const [submitLock, setSubmitLock] = useState(false)
  const [newTags, setNewTags] = useState(noStarTags)
  const changed = !isEqual(newTags, noStarTags)

  const fetchSuggestTags = () => {
    srvc.app
      .api()
      .getApiServerClient()
      .request(ApiServerApiName.GET_TASK_TAGS)
      .then((ret) => {
        setSuggestTags([...new Set([SpecialTags.HIDDEN, ...excludeStar(ret || []).sort()])])
      })
  }

  useEffect(() => {
    if (props.isOpen) {
      setNewTags(noStarTags)
      fetchSuggestTags()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.targetChain, props.isOpen])

  const clearButton = <Button icon="cross" minimal onClick={() => setNewTags([])} />

  const handleSubmit = async () => {
    const chainId = props.targetChain?.chain_id
    if (!chainId) {
      return
    }
    const toAdd = newTags.filter((t) => !noStarTags.includes(t))
    const toRemove = noStarTags.filter((t) => !newTags.includes(t))
    const succeededOps = [] as string[]
    const failedOps = [] as string[]
    const client = srvc.app.api().getApiServerClient()

    const allTags = [...toAdd, ...toRemove]
    const promises = allTags.map((tag) =>
      client.request(
        toAdd.includes(tag) ? ApiServerApiName.TAG_TASK : ApiServerApiName.UNTAG_TASK,
        {
          chain_id: chainId,
          tag,
        },
      ),
    )
    setSubmitLock(true)
    const res = await allSettled(promises)
    setSubmitLock(false)
    res.forEach((r, index) => {
      if (r.status === 'fulfilled') {
        succeededOps.push(allTags[index]!)
      } else {
        failedOps.push(allTags[index]!)
      }
    })

    if (!failedOps.length) {
      srvc.app
        .api()
        .getHFUIToaster()
        ?.show({
          message: i18n.t(i18nKeys.biz_exp_tag_single_succeeded),
          intent: Intent.SUCCESS,
        })
      props.setShow(false)
      props.refreshHandler(true)
    } else {
      srvc.app
        .api()
        .getHFUIToaster()
        ?.show({
          message: i18n.t(i18nKeys.biz_exp_tag_single_failed, { tags: failedOps.join(',') }),
          intent: Intent.DANGER,
        })
      props.refreshHandler(true)
    }
  }

  return (
    <Dialog
      isOpen={props.isOpen}
      className="tag-editor-single"
      onClose={() => {
        props.setShow(false)
      }}
      title={i18n.t(i18nKeys.biz_exp_tag_update_one)}
    >
      <div className="dialog-body">
        <div className="nb-name">{props.targetChain?.showName}</div>
        <div className="help">{i18n.t(i18nKeys.biz_exp_tag_add_panel_help)}</div>
        <TagInput
          leftIcon="tag"
          addOnBlur
          addOnPaste
          fill
          tagProps={getTagProps}
          values={newTags}
          rightElement={clearButton}
          onAdd={(values) => {
            if (values) {
              setNewTags([...new Set([...newTags, ...(values as string[])])])
            }
          }}
          onRemove={(value) => {
            setNewTags(newTags.filter((t) => t !== value))
          }}
        />
        <div className="sub-title">{i18n.t(i18nKeys.biz_exp_tag_recently_used)}</div>
        <div className="suggested-tags">
          {suggestTags.map((t) => {
            const exist = newTags.includes(t)
            const setTag = () => {
              if (exist) {
                setNewTags(newTags.filter((tag) => tag !== t))
              } else {
                setNewTags([...newTags, t])
              }
            }
            return (
              <Button
                title={t}
                icon={t === SpecialTags.HIDDEN ? 'eye-off' : undefined}
                onClick={setTag}
                key={t}
                small
                outlined={!exist}
                intent={Intent.WARNING}
              >
                {t}
                {t === SpecialTags.HIDDEN && (
                  <span style={{ fontSize: 12, marginLeft: 8 }}>
                    {`${i18n.t(i18nKeys.biz_exp_tag_default_no_hidden)}`}
                  </span>
                )}
              </Button>
            )
          })}
        </div>
        <div className="footer">
          <Button
            onClick={() => {
              props.setShow(false)
            }}
          >
            {i18n.t(i18nKeys.base_Cancel)}
          </Button>
          <Button
            intent="primary"
            disabled={!changed || submitLock}
            onClick={handleSubmit}
            loading={submitLock}
          >
            {i18n.t(i18nKeys.base_Confirm)}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}

interface ChainLiteForTag {
  showName: string
  tags: string[]
  chain_id: string
}

export const TagsEditorBatch = (props: {
  isOpen: boolean
  selectChains: Chain[]
  setShow(show: boolean): void
  refreshHandler(hideToast?: boolean): void
  successCallback(): void
}) => {
  const TAB_ADD_ID = 'add'
  const TAB_REMOVE_ID = 'remove'
  const TAB_REMOVE_ALL_ID = 'remove_all'
  const srvc = useContext(ManagerServiceContext)

  // 打开窗口的一瞬间，固定 chain 的信息，防止选择列表发生意料之外的变动
  const [chainsSnapshot, setChainsSnapshot] = useState<ChainLiteForTag[]>([])
  const [tagsToRemove, setTagsToRemove] = useState<{ tag: string; checked: boolean }[]>([])
  const [suggestTags, setSuggestTags] = useState([SpecialTags.HIDDEN])

  const [submitLock, setSubmitLock] = useState(false)
  const [currentTab, setCurrentTab] = useState<
    typeof TAB_ADD_ID | typeof TAB_REMOVE_ID | typeof TAB_REMOVE_ALL_ID
  >(TAB_ADD_ID)
  const [tagsToAdd, setTagsToAdd] = useState<string[]>([])
  const [selectedTagsToRemoveAll, setSelectedTagsToRemoveAll] = useState<string[]>([])

  const client = srvc.app.api().getApiServerClient()
  const toRemoveStrList = tagsToRemove.filter((t) => t.checked).map((t) => t.tag)

  const initTagsToRemove = () => {
    const tags = new Set<string>()
    props.selectChains.forEach((chain) => {
      if (chain.tags) {
        chain.tags.forEach((t) => tags.add(t))
      }
    })
    setTagsToRemove(
      excludeStar([...tags]).map((t) => {
        return { tag: t, checked: false }
      }),
    )
  }
  const fetchSuggestTags = () => {
    srvc.app
      .api()
      .getApiServerClient()
      .request(ApiServerApiName.GET_TASK_TAGS)
      .then((ret) => {
        setSuggestTags([...new Set([SpecialTags.HIDDEN, ...excludeStar(ret || []).sort()])])
      })
  }

  useEffect(() => {
    setSelectedTagsToRemoveAll([])
    if (props.isOpen) {
      setChainsSnapshot(
        props.selectChains.map((chain) => {
          return {
            chain_id: chain.chain_id,
            showName: chain.showName ?? '**UNKNOWN',
            tags: chain.tags ?? [],
          }
        }),
      )
      initTagsToRemove()
      setTagsToAdd([])
      fetchSuggestTags()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.isOpen])

  const doBatchAction = async (
    ct: typeof TAB_ADD_ID | typeof TAB_REMOVE_ID | typeof TAB_REMOVE_ALL_ID,
  ) => {
    const promises = [] as Promise<any>[]
    if (ct === TAB_ADD_ID || ct === TAB_REMOVE_ID) {
      // 批量增减
      for (const chainLite of chainsSnapshot) {
        const filtered =
          ct === TAB_ADD_ID
            ? tagsToAdd.filter((t) => !chainLite.tags.includes(t))
            : toRemoveStrList.filter((t) => chainLite.tags.includes(t))

        filtered.forEach((t) =>
          promises.push(
            client.request(
              ct === TAB_ADD_ID ? ApiServerApiName.TAG_TASK : ApiServerApiName.UNTAG_TASK,
              {
                chain_id: chainLite.chain_id,
                tag: t,
              },
            ),
          ),
        )
      }
    } else if (ct === TAB_REMOVE_ALL_ID) {
      promises.push(
        client.request(ApiServerApiName.DELETE_TAGS, { tag: [...selectedTagsToRemoveAll] }),
      )
    }
    setSubmitLock(true)
    const res = await allSettled(promises)
    const failedCount = res.filter((r) => r.status === 'rejected').length
    setSubmitLock(false)
    if (!failedCount) {
      srvc.app
        .api()
        .getHFUIToaster()
        ?.show({
          message: i18n.t(i18nKeys.biz_exp_tag_batch_succeeded),
          intent: Intent.SUCCESS,
        })
      props.setShow(false)
      props.refreshHandler(true)
      props.successCallback()
    } else {
      srvc.app
        .api()
        .getHFUIToaster()
        ?.show({
          message: i18n.t(i18nKeys.biz_exp_tag_batch_failed),
          intent: Intent.DANGER,
        })
      props.refreshHandler(true)
    }
  }

  const handleSubmit = () => {
    doBatchAction(currentTab)
  }

  const clearButton = <Button icon="cross" minimal onClick={() => setTagsToAdd([])} />
  let submitButtonContent
  if (currentTab === TAB_ADD_ID) {
    submitButtonContent = { text: i18n.t(i18nKeys.biz_base_add), icon: undefined }
  } else if (currentTab === TAB_REMOVE_ID) {
    submitButtonContent = { text: i18n.t(i18nKeys.biz_base_remove), icon: undefined }
  } else if (currentTab === TAB_REMOVE_ALL_ID) {
    submitButtonContent = {
      text: i18n.t(i18nKeys.biz_exp_tag_batch_remove_all),
      icon: 'warning-sign',
    }
  }

  return (
    <Dialog
      isOpen={props.isOpen}
      className="tag-editor-batch"
      title={i18n.t(i18nKeys.biz_exp_tag_batch_edit)}
      onClose={() => {
        props.setShow(false)
      }}
    >
      <div className="dialog-body">
        <div className="nb-name">
          <ul>
            {chainsSnapshot.slice(0, 4).map((c) => (
              <li>{c.showName}</li>
            ))}
            {chainsSnapshot.length > 4 && (
              <>
                <div>...</div>
                <div>
                  {i18n.t(i18nKeys.biz_exp_tag_batch_count, { count: chainsSnapshot.length })}
                </div>
              </>
            )}
          </ul>
        </div>
        <div className="funcs">
          <Tabs
            onChange={(tab) => {
              setCurrentTab(tab as typeof TAB_ADD_ID | typeof TAB_REMOVE_ID)
            }}
            selectedTabId={currentTab}
          >
            <Tab id={TAB_ADD_ID} title={i18n.t(i18nKeys.biz_exp_tag_batch_add)} />
            <Tab id={TAB_REMOVE_ID} title={i18n.t(i18nKeys.biz_exp_tag_batch_remove)} />
            <Tab
              id={TAB_REMOVE_ALL_ID}
              title={
                <>
                  <Icon icon="warning-sign" color="orange" />
                  {i18n.t(i18nKeys.biz_exp_tag_batch_remove_all)}
                </>
              }
            />
          </Tabs>

          {/* Add Panel */}
          {currentTab === TAB_ADD_ID && (
            <div className="panel add-panel">
              <div className="help">{i18n.t(i18nKeys.biz_exp_tag_batch_add_panel_help)}</div>
              <TagInput
                leftIcon="tag"
                addOnBlur
                addOnPaste
                fill
                tagProps={getTagProps}
                values={tagsToAdd}
                rightElement={clearButton}
                onAdd={(values) => {
                  if (values) {
                    setTagsToAdd([...new Set([...tagsToAdd, ...(values as string[])])])
                  }
                }}
                onRemove={(value) => {
                  setTagsToAdd(tagsToAdd.filter((t) => t !== value))
                }}
              />
              <div className="sub-title">{i18n.t(i18nKeys.biz_exp_tag_recently_used)}</div>
              <div className="suggested-tags">
                {suggestTags.map((t) => {
                  const exist = tagsToAdd.includes(t)
                  const setTag = () => {
                    if (exist) {
                      setTagsToAdd(tagsToAdd.filter((tag) => tag !== t))
                    } else {
                      setTagsToAdd([...tagsToAdd, t])
                    }
                  }
                  return (
                    <Button
                      title={t}
                      onClick={setTag}
                      key={t}
                      small
                      outlined={!exist}
                      intent={Intent.WARNING}
                      icon={t === SpecialTags.HIDDEN ? 'eye-off' : undefined}
                    >
                      {t}
                      {t === SpecialTags.HIDDEN && (
                        <span style={{ fontSize: 12, marginLeft: 8 }}>
                          {`(${i18n.t(i18nKeys.biz_exp_tag_default_no_hidden)})`}
                        </span>
                      )}
                    </Button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Remove Panel */}
          {currentTab === TAB_REMOVE_ID && (
            <div className="panel remove-panel">
              <div className="sub-title">{i18n.t(i18nKeys.biz_exp_tag_select_tag_to_remove)}</div>
              <div className="remove-tag-select">
                {tagsToRemove.length ? (
                  <Menu>
                    {tagsToRemove.map((t) => (
                      <MenuItem
                        // className="exp-submit-group-select-item"
                        active={t.checked}
                        icon="tag"
                        key={t.tag}
                        onClick={() => {
                          const all = [...tagsToRemove]
                          const ins = all.find((i) => i.tag === t.tag)
                          if (ins) {
                            ins.checked = !ins.checked
                          }
                          setTagsToRemove(all)
                        }}
                        text={t.tag}
                      />
                    ))}
                  </Menu>
                ) : (
                  <div className="no-tag-to-remove">
                    {i18n.t(i18nKeys.biz_exp_tag_no_tag_to_remove)}
                  </div>
                )}
              </div>
              <div style={{ marginTop: 10, wordBreak: 'break-word' }}>
                <div style={{ marginBottom: 10 }}>{i18n.t(i18nKeys.biz_exp_tag_selected)}</div>

                <div className="selected-to-remove">
                  {toRemoveStrList.length ? (
                    toRemoveStrList.map((t) => (
                      <Tag
                        minimal
                        intent="warning"
                        onRemove={() => {
                          const all = [...tagsToRemove]
                          const ins = all.find((i) => i.tag === t)
                          if (ins) {
                            ins.checked = !ins.checked
                          }
                          setTagsToRemove(all)
                        }}
                      >
                        {t}
                      </Tag>
                    ))
                  ) : (
                    <span style={{ color: '#888' }}>
                      {i18n.t(i18nKeys.biz_exp_tag_no_tag_selected)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
          {/* Remove All Panel */}
          {currentTab === TAB_REMOVE_ALL_ID && (
            <div className="panel remove-panel">
              <Callout intent="warning">
                {i18n.t(i18nKeys.biz_exp_tag_batch_remove_all_callout)}
              </Callout>
              <div className="sub-title">{i18n.t(i18nKeys.biz_exp_tag_select_tag_to_remove)}</div>
              <div className="remove-tag-select">
                {suggestTags.length ? (
                  <Menu>
                    {suggestTags.map((t) => (
                      <MenuItem
                        // className="exp-submit-group-select-item"
                        active={selectedTagsToRemoveAll.includes(t)}
                        icon="tag"
                        key={t}
                        onClick={() => {
                          if (selectedTagsToRemoveAll.includes(t)) {
                            setSelectedTagsToRemoveAll(
                              selectedTagsToRemoveAll.filter((i) => i !== t),
                            )
                          } else {
                            setSelectedTagsToRemoveAll([...selectedTagsToRemoveAll, t])
                          }
                        }}
                        text={t}
                      />
                    ))}
                  </Menu>
                ) : (
                  <div className="no-tag-to-remove">
                    {i18n.t(i18nKeys.biz_exp_tag_no_tag_to_remove)}
                  </div>
                )}
              </div>
              <div style={{ marginTop: 10, wordBreak: 'break-word' }}>
                <div style={{ marginBottom: 10 }}>{i18n.t(i18nKeys.biz_exp_tag_selected)}</div>
                <div className="selected-to-remove">
                  {selectedTagsToRemoveAll.length ? (
                    selectedTagsToRemoveAll.map((t) => (
                      <Tag
                        minimal
                        intent="warning"
                        onRemove={() => {
                          setSelectedTagsToRemoveAll(selectedTagsToRemoveAll.filter((i) => i !== t))
                        }}
                      >
                        {t}
                      </Tag>
                    ))
                  ) : (
                    <span style={{ color: '#888' }}>
                      {i18n.t(i18nKeys.biz_exp_tag_no_tag_selected)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="footer">
          <Button
            onClick={() => {
              props.setShow(false)
            }}
          >
            {i18n.t(i18nKeys.base_Cancel)}
          </Button>
          <Button
            intent="primary"
            loading={submitLock}
            disabled={
              submitLock ||
              (currentTab === TAB_REMOVE_ID && toRemoveStrList.length === 0) ||
              (currentTab === TAB_REMOVE_ALL_ID && selectedTagsToRemoveAll.length === 0) ||
              (currentTab === TAB_ADD_ID && tagsToAdd.length === 0)
            }
            onClick={handleSubmit}
            text={submitButtonContent?.text}
            icon={submitButtonContent?.icon as any}
          />
        </div>
      </div>
    </Dialog>
  )
}
