import { i18n, i18nKeys } from '@hai-platform/i18n'
import { Button, FormGroup, MenuItem } from '@hai-ui/core/lib/esm/components'
import { Select } from '@hai-ui/select/lib/esm/components'
import classNames from 'classnames'
import React, { useContext, useMemo, useState } from 'react'
import { genPopover } from '../../../../../ui-components/popover'
import { ClusterHelper } from '../../../funcs/ClusterHelper'
import type { EnvSchemaForDisplay, IEnv } from '../../../funcs/ExperimentHelper'
import { ExperimentHelper } from '../../../funcs/ExperimentHelper'
import { ExpServiceContext } from '../../../reducer'
import type { HaiEnvItem } from '../../../schema'
import type { SubmitCommonInputProps } from '../schema'

const PyEnvSelect = Select.ofType<EnvSchemaForDisplay>()

interface PyEnvSelectComponentProps {
  hfEnvList: IEnv[]
  py_venv: string
  onChange: SubmitCommonInputProps['onChange']
  isLock: boolean
  isLoading: boolean
  venvOutdated: boolean
}

export const PyEnvSelectComponent = (props: PyEnvSelectComponentProps) => {
  const srvc = useContext(ExpServiceContext)
  const [userEnv, setUserEnv] = useState<{ own: HaiEnvItem[]; others: HaiEnvItem[] }>({
    own: [],
    others: [],
  })
  const [userLoading, setUserLoading] = useState(false)
  const [filterQuery, setFilterQuery] = useState('')

  const combinedEnv = useMemo(() => {
    if (userLoading) {
      const ret = ExperimentHelper.combineEnvList({
        sysList: props.hfEnvList,
        ownList: [],
        othersList: [],
      })
      ret.push({
        key: 'loading...',
        name: 'loading user envs...',
        value: 'loading...',
        isDivider: true,
        type: 'H2',
      })
      return ret
    }
    return ExperimentHelper.combineEnvList({
      sysList: props.hfEnvList,
      ownList: userEnv.own,
      othersList: userEnv.others,
      filterQuery,
    })
  }, [props.hfEnvList, userEnv, userLoading, filterQuery])

  const fetchHaiEvnList = () => {
    setUserLoading(true)
    ClusterHelper.fetchHaiEvnList({
      invokeAsyncService: srvc.app.api().invokeAsyncService,
      token: srvc.app.api().getToken(),
    })
      .then((r) => {
        setUserEnv({
          others: r.others ?? [],
          own: r.own ?? [],
        })
        setUserLoading(false)
      })
      .catch(() => {
        setUserEnv({ others: [], own: [] })
        setUserLoading(false)
        console.warn('FetchHaiEnvList Failed')
      })
  }

  return (
    <FormGroup
      label={genPopover({
        label: i18n.t(i18nKeys.biz_exp_submit_python_hf_env),
        helperText: i18n.t(i18nKeys.biz_exp_submit_python_hf_env_helper),
      })}
      inline
    >
      <PyEnvSelect
        fill
        filterable
        items={combinedEnv}
        // eslint-disable-next-line react/no-unstable-nested-components
        itemRenderer={(i, { handleClick, modifiers }) => {
          if (i.isDivider) {
            return (
              <div key={i.key} className={classNames('submit-settings-hf-create-classify', i.type)}>
                {i.name}
              </div>
            )
          }
          if (!modifiers.matchesPredicate) {
            return null
          }
          let initialStr = ''
          if (i.type === 'leaf') {
            initialStr = '├─ '
          }
          if (i.type === 'lastLeaf') {
            initialStr = '└─ '
          }

          return (
            <MenuItem
              className="haiEnv-list-item"
              active={i.value === props.py_venv}
              key={i.key}
              onClick={handleClick}
              text={`${initialStr}${i.name}`}
              title={i.value}
              label={i.pyVer}
            />
          )
        }}
        query={filterQuery}
        onQueryChange={setFilterQuery}
        popoverProps={{ minimal: true }}
        activeItem={combinedEnv.find((i) => i.value === props.py_venv)}
        onItemSelect={(item) => {
          props.onChange({ type: 'py_venv', value: item.value })
        }}
        disabled={props.isLock}
      >
        <Button
          title={props.py_venv}
          loading={props.isLoading}
          rightIcon="caret-down"
          className="exp2-submit-common-select-btn"
          onClick={fetchHaiEvnList}
          small
          disabled={props.isLock}
        >
          {!props.isLock && props.venvOutdated ? `(${i18n.t(i18nKeys.base_inv)}) ` : ``}
          {props.py_venv}
        </Button>
      </PyEnvSelect>
    </FormGroup>
  )
}
