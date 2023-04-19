import { ApiServerApiName } from '@hai-platform/client-api-server'
import { Languages, i18n, i18nKeys } from '@hai-platform/i18n'
import { useStorageChange } from '@hai-platform/studio-pages/lib/hooks/useStorageChange'
import { SVGWrapper } from '@hai-platform/studio-pages/lib/ui-components/svgWrapper'
import { Button, Divider, FormGroup, InputGroup, Switch } from '@hai-ui/core'
import { Tooltip2 } from '@hai-ui/popover2/lib/esm/tooltip2'
import { AxiosError } from 'axios'
import React, { useEffect, useState } from 'react'
import { useEffectOnce } from 'react-use/esm'
import { GlobalApiServerClient } from '../../api/apiServer'
import { HAILOGO } from '../../components/Logo'
import {
  AppToaster,
  TokenStorageKey,
  clearMarsServerInfo,
  getStudioClusterServerHost,
  hasCustomMarsServer,
  isProduction,
  setUserToken,
} from '../../utils'
import { AilabCountly, CountlyEventKey } from '../../utils/countly'
import { Themes } from '../../utils/theme'
import { Ani } from './ani'

export const Login2 = (p: {
  lan?: Languages
  theme?: Themes
  changeLan?: () => void
  changeTheme?: () => void
}) => {
  const [currentToken, setCurrentToken] = useState<string>('')
  const [currentName, setCurrentName] = useState<string>('')
  const [remember, setRemember] = useState<boolean>(true)
  const [aniStage, setAniStage] = useState<1 | 2>(1)

  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [submitLoading, setSubmitLoading] = useState<boolean>(false)

  const lockButton = (
    <Tooltip2 content={`${showPassword ? 'Hide' : 'Show'} Token`} disabled={false}>
      <Button
        icon={showPassword ? 'eye-open' : 'eye-off'}
        minimal
        onClick={() => setShowPassword(!showPassword)}
      />
    </Tooltip2>
  )

  // 在其他页面有疑似登录行为，重新刷新一下页面：
  useStorageChange((e) => {
    if (e.key !== TokenStorageKey) return
    window.location.reload()
  })

  const submit = async () => {
    try {
      setSubmitLoading(true)
      const accessTokenResult = await GlobalApiServerClient.request(
        ApiServerApiName.CREATE_ACCESS_TOKEN,
        {
          from_user_name: currentName,
          access_user_name: currentName,
          access_scope: 'all',
          token: currentToken,
        },
        {
          headers: {
            token: currentToken,
          },
        },
      )

      setUserToken(accessTokenResult.from_user_name, accessTokenResult.access_token)
      setAniStage(2)

      // 这行也可以写进 ani 的 callback 里，但是安全起见在这 setTimeout 吧
      setTimeout(() => window.location.reload(), 2200)
      AilabCountly.safeReport(CountlyEventKey.loginSuccess)
    } catch (e) {
      setSubmitLoading(false)
      AppToaster.show({
        message: `${e} ${e instanceof AxiosError ? e?.response?.data?.msg : ''}`,
        intent: 'danger',
      })
    }
  }

  useEffect(() => {
    ;(document.getElementById('default-loading')! as any).style.display = 'none'
  }, [])

  useEffectOnce(() => {
    AilabCountly.safeReport(CountlyEventKey.pageLoginMount)
  })

  return (
    <div className="login-v3-container">
      <div className="main">
        <div className="left">
          <SVGWrapper
            fill="var(--hai-ui-text-primary)"
            svg={HAILOGO}
            dClassName="hfai-login-logo"
          />
          <div className="title">
            <div className="t">{i18n.t(i18nKeys.biz_base_studio)}</div>
            <div className="desc">
              {i18n.t(i18nKeys.base_highflyer_ai)} |{' '}
              {i18n.t(i18nKeys.biz_experiment_manage_platform)}
            </div>
          </div>

          <div className="form-login">
            <FormGroup
              className="login-form-group"
              label={i18n.t(i18nKeys.biz_user_name)}
              labelFor="input-name"
              helperText={
                hasCustomMarsServer() ? (
                  <p className="studio-login-helper-text">
                    当前服务端: {getStudioClusterServerHost()}
                    <Button
                      icon="cross"
                      title="清除当前服务端信息"
                      small
                      minimal
                      onClick={clearMarsServerInfo}
                    />
                  </p>
                ) : (
                  ''
                )
              }
            >
              <InputGroup
                id="input-name"
                value={currentName}
                onChange={(e) => {
                  setCurrentName((e.target as HTMLInputElement).value)
                }}
              />
            </FormGroup>
            <FormGroup className="login-form-group" label="Token" labelFor="input-token">
              <InputGroup
                id="input-token"
                placeholder={i18n.t(i18nKeys.biz_provided_token)}
                rightElement={lockButton}
                type={showPassword ? 'text' : 'password'}
                value={currentToken}
                onChange={(e) => {
                  setCurrentToken((e.target as HTMLInputElement).value)
                }}
              />
            </FormGroup>
            <Switch
              className="remember-me"
              checked={remember}
              title="Not support change yet"
              disabled
              label={i18n.t(i18nKeys.biz_remember_me)}
              onChange={(e) => {
                setRemember((e.target as HTMLInputElement).checked)
              }}
            />
            <Button
              fill
              large
              onClick={submit}
              loading={submitLoading}
              intent="primary"
              className="login-submit"
            >
              {i18n.t(i18nKeys.base_sign_in)}
            </Button>
          </div>
        </div>
        <div className="right">
          <Ani stage={aniStage} />
        </div>
      </div>
      <div className="corner">
        <Button minimal small onClick={p.changeLan}>
          <span className={`${p.lan === Languages.EN ? 'lan-active' : 'lan-not-active'}`}>EN</span>
          &nbsp;/&nbsp;
          <span className={`${p.lan === Languages.ZH_CN ? 'lan-active' : 'lan-not-active'}`}>
            中文
          </span>
        </Button>
        <Divider />
        <Button
          icon={p.theme === Themes.light ? 'flash' : 'moon'}
          minimal
          small
          disabled={isProduction}
          onClick={p.changeTheme}
        />
        {/* moon: 夜间模式 */}
      </div>
    </div>
  )
}
