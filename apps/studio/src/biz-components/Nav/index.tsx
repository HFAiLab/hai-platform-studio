import { Languages, i18n, i18nKeys } from '@hai-platform/i18n'
import { SVGWrapper } from '@hai-platform/studio-pages/lib/ui-components/svgWrapper'
import { Alignment, Button, Classes, Divider, Icon, Navbar, NavbarGroup, Tag } from '@hai-ui/core'
import classNames from 'classnames'
import React, { useContext, useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { HAILOGO, HAILOGO_ONLY_ICON } from '../../components/Logo'
import { User } from '../../modules/user'
import {
  GlobalRefreshXtopicNotification,
  UnreadNotificationStorageKey,
} from '../../modules/xtopic/refreshNotification'
import { GlobalContext } from '../../reducer/context'
import {
  APPShortVersion,
  CONSTS,
  getCurrentAgencyUserName,
  getStudioClusterServerHost,
  getUserName,
  isCurrentOtherTrainingsUser,
  removeUserToken,
} from '../../utils'

import { Themes } from '../../utils/theme'
import { IOStatusTag } from '../IOStatus'

import './index.scss'

export interface NavProps {
  theme: Themes
  lan: Languages
  changeLan(): void
  changeTheme(): void
}

export const Nav = (props: NavProps) => {
  const { theme, lan, changeLan, changeTheme } = props
  const location = useLocation()
  const inTopicPage = /^\/topic/g.test(location.pathname)
  const globalContext = useContext(GlobalContext)
  const { inDebug } = globalContext.state

  const logout = () => {
    removeUserToken()
    window.location.reload()
    // 现在我们只有唯一的 access token，所以登出的时候只删除登录态就行了
    // 如果后续逻辑变更也要删除 access token，取消注释即可
    // GlobalApiServerClient.request(ApiServerApiName.DELETE_ACCESS_TOKEN, {
    //   access_token: getToken(),
    // })
    //   .then(() => {
    //     removeUserToken()
    //     window.location.reload()
    //   })
    //   .catch((e) => {
    //     AppToaster.show({
    //       message: e,
    //       intent: 'danger',
    //     })
    //   })
  }

  // 话题页未读通知刷新
  const [unreadCount, setUnreadCount] = useState<number>(
    GlobalRefreshXtopicNotification.getUnread(),
  )
  useEffect(() => {
    function checkData() {
      const item = localStorage.getItem(UnreadNotificationStorageKey)
      if (item) setUnreadCount(Number(item))
    }
    window.addEventListener('storage', checkData)
    checkData()
    return () => {
      window.removeEventListener('storage', checkData)
    }
  }, [])

  return (
    <Navbar
      fixedToTop
      className={classNames(
        'app-nav-bar',
        {
          'hai-ui-dark': !inTopicPage || theme === Themes.dark,
        },
        {
          'in-other-user': isCurrentOtherTrainingsUser,
        },
      )}
    >
      <NavbarGroup align={Alignment.LEFT}>
        <NavLink
          to={CONSTS.ROUTER_PATHS.home}
          title={APPShortVersion}
          className="hai-nav-logo-container"
        >
          <SVGWrapper
            fill={!inTopicPage ? 'white' : '#3682c9'}
            svg={HAILOGO}
            dClassName="hai-nav-logo"
          />
          <SVGWrapper
            fill={!inTopicPage ? 'white' : '#3682c9'}
            svg={HAILOGO_ONLY_ICON}
            dClassName="hai-nav-only-logo"
          />
        </NavLink>
        {!isCurrentOtherTrainingsUser && (
          <NavLink
            className="hfai-nav-item"
            to={CONSTS.ROUTER_PATHS.home}
            // eslint-disable-next-line react/no-children-prop
            children={(cprops) => {
              return (
                <Button
                  active={cprops.isActive}
                  className={Classes.MINIMAL}
                  text={i18n.t(i18nKeys.biz_nav_overview)}
                />
              )
            }}
          />
        )}
        {!isCurrentOtherTrainingsUser && (
          <NavLink
            className="hfai-nav-item"
            // eslint-disable-next-line react/no-children-prop
            children={(cprops) => {
              return (
                <Button
                  active={cprops.isActive}
                  className={Classes.MINIMAL}
                  text={i18n.t(i18nKeys.biz_nav_containers)}
                />
              )
            }}
            to={CONSTS.ROUTER_PATHS.container}
          />
        )}
        {
          <NavLink
            className="hfai-nav-item"
            // eslint-disable-next-line react/no-children-prop
            children={(cprops) => {
              return (
                <Button
                  active={cprops.isActive}
                  className={Classes.MINIMAL}
                  text={i18n.t(i18nKeys.biz_nav_trainings)}
                />
              )
            }}
            to={CONSTS.ROUTER_PATHS.manage}
          />
        }
        {}
        {!isCurrentOtherTrainingsUser && !globalContext.state.inDebug && (
          <NavLink
            className="hfai-nav-item"
            // eslint-disable-next-line react/no-children-prop
            children={(cprops) => {
              return (
                <Button
                  intent={inTopicPage ? 'primary' : 'none'}
                  active={cprops.isActive}
                  className={classNames(Classes.MINIMAL, 'xtopic-nav-button', {
                    'beta-badge': !unreadCount,
                  })}
                  text={i18n.t(i18nKeys.biz_xtopic_nav)}
                >
                  {unreadCount > 0 && (
                    <div className="hfai-nav-item-badge xtopic-red-dot">
                      {unreadCount >= 100 ? '99+' : unreadCount}
                    </div>
                  )}
                </Button>
              )
            }}
            to={CONSTS.ROUTER_PATHS.topic}
          />
        )}
        {}
        {/* Host 更有用 */}
        {inDebug && (
          <Tag intent="primary">已手动指定集群服务端地址：{getStudioClusterServerHost()}</Tag>
        )}
      </NavbarGroup>
      <NavbarGroup align={Alignment.RIGHT}>
        {/* hint: 在容器页面等一些页面，没有长链接需求的话默认就是 None */}
        <IOStatusTag />
        <Button minimal small onClick={changeLan}>
          <span className={`${lan === Languages.EN ? 'lan-active' : 'lan-not-active'}`}>EN</span>
          &nbsp;/&nbsp;
          <span className={`${lan === Languages.ZH_CN ? 'lan-active' : 'lan-not-active'}`}>
            中文
          </span>
        </Button>
        <Divider />
        <Button
          icon={theme === Themes.light ? 'flash' : 'moon'}
          minimal
          small
          onClick={changeTheme}
        />
        {/* moon: 夜间模式 */}
        <Divider />
        <div>
          {!isCurrentOtherTrainingsUser && (
            <NavLink
              className="hfai-nav-item user"
              to={CONSTS.ROUTER_PATHS.user}
              // eslint-disable-next-line react/no-children-prop
              children={(cprops) => {
                return (
                  <Button
                    icon="user"
                    active={cprops.isActive}
                    className={Classes.MINIMAL}
                    text={getUserName()}
                  />
                )
              }}
            />
          )}
          {isCurrentOtherTrainingsUser && (
            <span className={classNames('nav-user-name')}>{getUserName()} </span>
          )}
        </div>
        {isCurrentOtherTrainingsUser ? (
          <span className="nav-current-other-user">
            [{getCurrentAgencyUserName()}{' '}
            <Icon
              className="nav-current-other-user-icon"
              icon="small-cross"
              onClick={() => {
                window.location.replace(`${window.location.origin}${window.location.hash}`)
              }}
            />
            ]
          </span>
        ) : null}
        <Divider />
        {User.getInstance().canAdmin && !isCurrentOtherTrainingsUser && (
          <NavLink
            className="hfai-nav-item"
            to={CONSTS.ROUTER_PATHS.admin}
            // eslint-disable-next-line react/no-children-prop
            children={(cprops) => {
              return (
                <Button
                  icon="key"
                  active={cprops.isActive}
                  className={Classes.MINIMAL}
                  text={i18n.t(i18nKeys.biz_nav_admin)}
                />
              )
            }}
          />
        )}
        <Button icon="log-out" id="studio-log-out" minimal small onClick={logout} />
      </NavbarGroup>
    </Navbar>
  )
}
