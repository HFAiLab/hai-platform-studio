import { Button } from '@hai-ui/core'
import React from 'react'
import { copyWithTip } from '../../../utils/clipboard'

const accessTokenWithEllipsis = (token: string) => {
  if (token.length < 20) return token
  return `${token.slice(0, 10)}...${token.slice(-10)}`
}

export const AccessTokenBackendModels = [
  {
    code: 'access_token',
    name: 'Access Token',
    width: 5,
    align: 'left',
    render: (value: string) => {
      return (
        <p className="access-token-mini-line" title={value}>
          <p>{accessTokenWithEllipsis(value)}</p>
          <Button
            small
            outlined
            onClick={() => {
              copyWithTip(value)
            }}
          >
            复制
          </Button>
        </p>
      )
    },
  },
  {
    code: 'created_by',
    name: '操作人',
    width: 2,
    align: 'left',
    render: (value: string) => {
      return <span title={value}>{value}</span>
    },
  },
  {
    code: 'access_user_name',
    name: '所属用户',
    width: 2,
    align: 'left',
    render: (value: string) => {
      return <span title={value}>{value}</span>
    },
  },
  {
    code: 'from_user_name',
    name: '授权给',
    width: 2,
    align: 'left',
    render: (value: string) => {
      return <span title={value}>{value}</span>
    },
  },
  {
    code: 'expire_at',
    name: '到期时间',
    width: 2,
    align: 'left',
    render: (value: string) => {
      return <span title={value}>{value}</span>
    },
  },
  {
    code: 'access_scope',
    name: '访问权限',
    width: 2,
    align: 'left',
  },
]

export const PickAccessTokenModels = (names: string[]) => {
  return AccessTokenBackendModels.filter((model) => {
    return names.includes(model.code)
  })
}
