import { ApiServerApiName } from '@hai-platform/client-api-server'
import type { AccessTokenFullInfo } from '@hai-platform/shared'
import { dangerousDialog } from '@hai-platform/studio-pages/lib/ui-components/dialog'
import { Button, Callout, Dialog, FormGroup, Pre, Switch } from '@hai-ui/core'
import { Tab } from '@hai-ui/core/lib/esm/components/tabs/tab'
import { Tabs } from '@hai-ui/core/lib/esm/components/tabs/tabs'
import type { ArtColumn } from 'ali-react-table/dist/interfaces'
import dayjs from 'dayjs'
import React, { useState } from 'react'
import { useEffectOnce } from 'react-use'
import { useGroot } from 'use-groot'
import { GlobalApiServerClient } from '../../../api/apiServer'
import { NoData } from '../../../components/Errors/NoData'
import { HFDashTable } from '../../../components/HFTable'
import { InputGroupWithCheck } from '../../../components/Input'
import { User } from '../../../modules/user'
import { AppToaster, getToken, getUserName, removeUserToken } from '../../../utils'
import { copyWithTip } from '../../../utils/clipboard'

import './AccessManager.scss'
import { PickAccessTokenModels } from './Model'

export type StudioTabId = 'my_access_token' | 'external' | 'all'

export interface AccessTokenMap {
  mine: AccessTokenFullInfo[]
  othersAuthMine: AccessTokenFullInfo[]
  myManaged: AccessTokenFullInfo[]
}

const getAccessTokenMapFromRemote = async (): Promise<AccessTokenMap> => {
  const result = await GlobalApiServerClient.request(ApiServerApiName.LIST_ACCESS_TOKEN)
  const activeAccessTokens = result.access_tokens.filter((item) => !!item.active)
  const currentUser = getUserName()
  const mine = activeAccessTokens.filter(
    (item) =>
      item.created_by === currentUser &&
      item.access_user_name === currentUser &&
      item.from_user_name === currentUser,
  )
  const othersAuthMine = activeAccessTokens.filter(
    (item) =>
      item.created_by !== currentUser &&
      item.access_user_name !== currentUser &&
      item.from_user_name === currentUser,
  )
  const myManaged = User.getInstance().isAccessTokenAdmin()
    ? activeAccessTokens.filter(
        (item) =>
          !(
            item.created_by === currentUser &&
            item.access_user_name === currentUser &&
            item.from_user_name === currentUser
          ),
      )
    : activeAccessTokens.filter(
        (item) =>
          item.created_by === currentUser &&
          item.access_user_name === currentUser &&
          item.from_user_name !== currentUser,
      )

  return {
    mine,
    othersAuthMine,
    myManaged,
  }
}

export const AccessManager = () => {
  const isAccessTokenAdmin = User.getInstance().isAccessTokenAdmin()

  const [currentTab, setCurrentTab] = useState<StudioTabId>('my_access_token')
  const [showCreateNewAccessToken, setShowCreateNewAccessToken] = useState(false)

  const [newAccessUserName, setNewAccessUserName] = useState(
    isAccessTokenAdmin ? '' : getUserName(),
  )
  const [newAccessExpireTime, setNewAccessExpireTime] = useState<string>('')
  const [newFromUserName, setNewFromUserName] = useState('')
  const [newAccessUserScope, setNewAccessUserScope] = useState('except_jupyter')

  // 状态相关：
  const [showCreateLoading, setShowCreateLoading] = useState(false)
  const [showCreateSuccess, setShowCreateSuccess] = useState(false)
  const [showCreateSuccessToken, setShowCreateSuccessToken] = useState<string | null>(null)
  const [showCreateFail, setShowCreateFail] = useState(false)
  const [showCreateErrorInfo, setShowCreateErrorInfo] = useState<string | null>(null)

  const [showSelfAuthToken, setShowSelfAuthToken] = useState(false)

  const { data: accessTokenMap, refresh } = useGroot({
    fetcher: getAccessTokenMapFromRemote,
    auto: true,
    swr: true, // 开启 swr 以减少闪烁
  })

  const deleteAccessToken = async (access_token: string) => {
    const confirm = await dangerousDialog(
      '删除 access token 之后，所有用到该 access token 的平台都需要重新登录或者初始化 (包括 Studio 自身平台)',
      '请谨慎操作！',
    )

    if (!confirm) return

    GlobalApiServerClient.request(ApiServerApiName.DELETE_ACCESS_TOKEN, {
      access_token,
    })
      .then(() => {
        AppToaster.show({
          message: '删除成功',
          intent: 'success',
          icon: 'tick',
        })
        if (access_token === getToken()) {
          removeUserToken()
          window.location.reload()
        }
        refresh()
      })
      .catch((e) => {
        refresh()
        AppToaster.show({
          message: e,
          intent: 'danger',
        })
      })
  }

  const createNewAccessToken = async () => {
    if (!newAccessUserName || !newFromUserName) {
      AppToaster.show({
        message: '请完整填写授权相关信息',
        intent: 'warning',
      })
      return
    }

    try {
      setShowCreateSuccess(false)
      setShowCreateFail(false)
      setShowCreateLoading(true)
      const accessTokenResult = await GlobalApiServerClient.request(
        ApiServerApiName.CREATE_ACCESS_TOKEN,
        {
          from_user_name: newFromUserName,
          access_user_name: newAccessUserName,
          access_scope: newAccessUserScope as 'all' | 'except_jupyter',
          token: getToken(),
          expire_at: newAccessExpireTime
            ? dayjs(new Date(newAccessExpireTime)).format('YYYY-MM-DD HH:mm:ss')
            : undefined,
        },
      )
      refresh()
      setShowCreateSuccess(true)
      setShowCreateSuccessToken(accessTokenResult.access_token)
    } catch (e) {
      setShowCreateErrorInfo(`${e}`)
      setShowCreateFail(true)
    } finally {
      setShowCreateLoading(false)
    }
  }

  useEffectOnce(() => {})

  const MyAccessTokenColumns = [
    ...PickAccessTokenModels(['access_token', 'expire_at']),
    {
      code: 'operation',
      name: '操作',
      width: 2,
      align: 'left',
      render: (value: string, row: AccessTokenFullInfo) => (
        <Button
          small
          outlined
          disabled
          onClick={() => {
            deleteAccessToken(row.access_token)
          }}
        >
          删除
        </Button>
      ),
    },
  ] as Array<ArtColumn>

  const OtherAuthMeColumns = [
    ...PickAccessTokenModels(['access_token', 'access_user_name', 'expire_at', 'access_scope']),
    {
      code: 'visit',
      name: '访问',
      width: 2,
      align: 'left',
      render: (value: string, row: AccessTokenFullInfo) => (
        <Button
          small
          outlined
          onClick={() => {
            window.open(
              `${window.location.protocol}//${
                window.location.host
              }/?current_user_token=${`${row.access_token}`}&current_user=${
                row.access_user_name
              }#/manage`,
            )
          }}
        >
          只读访问 Studio
        </Button>
      ),
    },
  ] as Array<ArtColumn>

  const MyOpAuthOthersColumns = [
    ...PickAccessTokenModels([
      'access_token',
      'created_by',
      'access_user_name',
      'from_user_name',
      'expire_at',
      'access_scope',
    ]),
    {
      code: 'operation',
      name: '操作',
      width: 3,
      align: 'left',
      render: (value: string, row: AccessTokenFullInfo) => (
        <>
          <Button
            small
            outlined
            onClick={() => {
              deleteAccessToken(row.access_token)
            }}
          >
            删除
          </Button>
          <Button
            small
            outlined
            className="m-l-10"
            onClick={() => {
              window.open(
                `${window.location.protocol}//${
                  window.location.host
                }/?current_user_token=${`${row.access_token}`}&current_user=${
                  row.access_user_name
                }#/manage`,
              )
            }}
          >
            只读访问 Studio
          </Button>
        </>
      ),
    },
  ] as Array<ArtColumn>

  return (
    <div className="access-token-manager">
      <Dialog
        title="新建授权"
        isOpen={!!showCreateNewAccessToken}
        className="create-access-token-dialog"
        onClose={() => {
          setShowCreateNewAccessToken(false)
        }}
      >
        <div className="access-token-dialog-container">
          <FormGroup label="要访问的用户">
            <InputGroupWithCheck
              fill
              value={newAccessUserName}
              placeholder=""
              disabled={!isAccessTokenAdmin}
              onChange={(e) => {
                setNewAccessUserName(e.target.value)
              }}
            />
          </FormGroup>
          <FormGroup label="授权给">
            <InputGroupWithCheck
              fill
              value={newFromUserName}
              placeholder=""
              onChange={(e) => {
                setNewFromUserName(e.target.value)
              }}
            />
          </FormGroup>
          <FormGroup label="访问权限">
            <div className="hai-ui-html-select .modifier dialog-access-scope">
              <select
                name="group"
                value={newAccessUserScope}
                onChange={(e) => {
                  setNewAccessUserScope(e.target.value)
                }}
              >
                {['all', 'except_jupyter'].map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
              <span className="hai-ui-icon hai-ui-icon-double-caret-vertical" />
            </div>
          </FormGroup>
          <FormGroup label="到期时间（不填写代表永不过期）">
            <InputGroupWithCheck
              fill
              value={newAccessExpireTime}
              placeholder=""
              type="datetime-local"
              onChange={(e) => {
                setNewAccessExpireTime(e.target.value)
              }}
            />
          </FormGroup>
          {showCreateSuccess && (
            <Callout intent="primary" className="create-access-token-success-callout">
              <p className="create-access-token-success">
                创建 Access Token 成功，对方可以在访问权限管理面板看到
              </p>
              <Pre>{showCreateSuccessToken}</Pre>
              <Button
                outlined
                small
                onClick={() => {
                  copyWithTip(showCreateSuccessToken || '')
                }}
              >
                复制
              </Button>
            </Callout>
          )}
          {showCreateFail && (
            <Callout intent="danger" className="create-access-token-error-callout">
              <p className="create-access-token-error">创建 Access Token 失败</p>
              <Pre>{showCreateErrorInfo}</Pre>
            </Callout>
          )}
          <div className="create-access-token-footer">
            <Button
              loading={showCreateLoading}
              intent="primary"
              onClick={() => {
                createNewAccessToken()
              }}
            >
              创建 Access Token
            </Button>
          </div>
        </div>
      </Dialog>
      <div className="access-operating-container">
        <Button
          className="new-access-token"
          intent="primary"
          onClick={() => {
            setShowCreateNewAccessToken(true)
          }}
        >
          新建授权
        </Button>
        <div className="access-operating-span" />
        <Button
          className="new-access-token"
          onClick={() => {
            refresh()
          }}
        >
          刷新
        </Button>
      </div>

      {accessTokenMap && (
        <Tabs
          selectedTabId={currentTab}
          renderActiveTabPanelOnly={false}
          onChange={(id) => {
            setCurrentTab(id as StudioTabId)
          }}
        >
          <Tab
            id="my_access_token"
            title="我的 Access Token"
            panel={
              <div>
                <HFDashTable
                  className="quota-table"
                  columns={MyAccessTokenColumns}
                  emptyCellHeight={140}
                  components={{
                    // eslint-disable-next-line react/no-unstable-nested-components
                    EmptyContent: () => <NoData />,
                  }}
                  dataSource={accessTokenMap.mine}
                />
              </div>
            }
          />
          <Tab
            id="other_auth_me"
            title="他人授权的 Access Token"
            panel={
              <div>
                <HFDashTable
                  className="quota-table"
                  columns={OtherAuthMeColumns}
                  emptyCellHeight={140}
                  components={{
                    // eslint-disable-next-line react/no-unstable-nested-components
                    EmptyContent: () => <NoData />,
                  }}
                  dataSource={accessTokenMap.othersAuthMine}
                />
              </div>
            }
          />
          <Tab
            id="my_op_token"
            title="我管理的 Access Token"
            panel={
              <div>
                <Switch
                  checked={showSelfAuthToken}
                  className="access-show-self-auth-switch"
                  label="展示用户自授权 token"
                  onChange={() => {
                    setShowSelfAuthToken(!showSelfAuthToken)
                  }}
                />
                <HFDashTable
                  className="quota-table"
                  columns={MyOpAuthOthersColumns}
                  emptyCellHeight={140}
                  components={{
                    // eslint-disable-next-line react/no-unstable-nested-components
                    EmptyContent: () => <NoData />,
                  }}
                  dataSource={accessTokenMap.myManaged.filter((tokenInfo) => {
                    if (showSelfAuthToken) return true
                    return tokenInfo.access_user_name !== tokenInfo.from_user_name
                  })}
                />
              </div>
            }
          />
        </Tabs>
      )}
    </div>
  )
}
