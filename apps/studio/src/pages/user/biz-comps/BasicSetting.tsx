import { ApiServerApiName } from '@hai-platform/client-api-server'
import { i18n, i18nKeys } from '@hai-platform/i18n'
import { SVGWrapper } from '@hai-platform/studio-pages/lib/ui-components/svgWrapper'
import React, { useState } from 'react'
import { useEffectOnce } from 'react-use'
import { GlobalApiServerClient } from '../../../api/apiServer'
import { Quota } from '../../../biz-components/Quota'
import UserBasicEnv from '../../../components/svg/user-basic-env.svg?raw'
import UserDataPath from '../../../components/svg/user-data-path.svg?raw'
import UserGroupPath from '../../../components/svg/user-group-path.svg?raw'
import UserGroupSvg from '../../../components/svg/user-group.svg?raw'
import UserNameSvg from '../../../components/svg/user-name.svg?raw'
import UserQuota from '../../../components/svg/user-quota.svg?raw'
import { GlobalClusterInfoInstance } from '../../../modules/cluster/ClusterInfo'
import { User } from '../../../modules/user'
import { getUserName } from '../../../utils'

// 一条记录：
const UserItem = (props: { icon: any; title: string; rightComp: JSX.Element }) => {
  return (
    <div className="user-item">
      <div className="left">
        <SVGWrapper svg={props.icon} dClassName="left-icon" />
        <p className="left-title">{props.title}</p>
      </div>
      <div className="right">{props.rightComp}</div>
    </div>
  )
}

const UserAttr = (props: { textLists: string[]; linkText?: string; linkURL?: string }) => {
  return (
    <div className="user-attr-container">
      <div className="left">
        {props.textLists.map((text) => {
          return <p key={text}>{text}</p>
        })}
        {!props.textLists.length && <p>--</p>}
      </div>
      {!!props.linkText && (
        <div className="right">
          <a href={props.linkURL}>{props.linkText}</a>
        </div>
      )}
    </div>
  )
}

export const BasicSetting = () => {
  const [datasetPaths, setDatasetPaths] = useState<string[]>([])
  const [envLists, setEnvList] = useState<string[]>([])

  useEffectOnce(() => {
    // datasetPaths 可以自行获取添加
    GlobalClusterInfoInstance.getFromRemote().then(() => {
      setEnvList(GlobalClusterInfoInstance.env)
    })
  })

  return (
    <div className="user-list-container">
      {/* padding-top: 30 for each list item */}
      <UserItem
        icon={UserNameSvg}
        title={i18n.t(i18nKeys.biz_user_name)}
        rightComp={<UserAttr textLists={[getUserName()]} />}
      />
      <UserItem
        icon={UserGroupSvg}
        title={i18n.t(i18nKeys.biz_user_share_group)}
        rightComp={<UserAttr textLists={[User.getInstance().userInfo?.shared_group || '']} />}
      />
      <UserItem
        icon={UserDataPath}
        title={i18n.t(i18nKeys.biz_user_work_dir)}
        rightComp={
          <UserAttr
            textLists={
              User.getInstance().in
                ? []
                : [`${User.getInstance().userInfo?.shared_group || ''}/${getUserName()}/workspaces`]
            }
          />
        }
      />
      <UserItem
        icon={UserGroupPath}
        title={i18n.t(i18nKeys.biz_user_data_dir)}
        rightComp={<UserAttr textLists={datasetPaths} />}
      />
      <UserItem
        icon={UserBasicEnv}
        title={i18n.t(i18nKeys.biz_user_basic_env)}
        rightComp={<UserAttr textLists={envLists} />}
      />
      {window._hf_user_if_in && (
        <UserItem
          icon={UserQuota}
          title={i18n.t(i18nKeys.biz_user_resource_quota)}
          rightComp={<Quota />}
        />
      )}
    </div>
  )
}
