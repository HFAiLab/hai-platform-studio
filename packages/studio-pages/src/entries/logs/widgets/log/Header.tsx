import { i18n, i18nKeys } from '@hai-platform/i18n'
import type { TaskConfigJsonTraining } from '@hai-platform/shared'
import { Button, MenuItem } from '@hai-ui/core/lib/esm'
import { Select2 } from '@hai-ui/select/lib/esm/'
import React, { useContext, useMemo } from 'react'
import { CONSTS } from '../../../../consts'
import type { Chain, IPod } from '../../../../model/Chain'
import { DynamicUpdate } from '../../../../ui-components/dynamicUpdate'
import { RankSelectWrapper } from '../../../../ui-components/rankSelect'
import { RefreshBtn } from '../../../../ui-components/refresh'
import { StatusIconV2, icons } from '../../../../ui-components/svgIcon'
import { SVGWrapper } from '../../../../ui-components/svgWrapper'
import { shortNodeName } from '../../../../utils/convert'
import { ServiceContext } from '../../app'
import { EventsKeys } from '../../schema/event'
import { ExperimentInfo } from './ExpInfo'

enum WordWrapEnums {
  on = 'on',
  off = 'off',
}
export type IOButtonStatus = 'on' | 'off' | 'disabled'

const ServiceSelect = Select2.ofType<string>()

/**
 * Normal header
 * @returns
 */
export const HeaderComponent = (props: {
  show: boolean
  chain: Chain
  selectedRank: number
  showLineTime: boolean
  showSearch: boolean
  wordWrap: WordWrapEnums
  showSyslog: boolean
  miniMapEnabled: boolean
  ioButtonStatus?: IOButtonStatus
  globalSearchContainerShow?: boolean
  handleIOClick?(): void
  handleRefreshClick(): void
  handleShowLineTimeClick(): void
  handleShowSearchClick(): void
  handleRankSelect(rank: number): void
  handleShowSyslogClick(): void
  handleWordWrapClick(): void
  handleMiniMapClick(): void
  toggleGlobalContainerShow(): void
}): JSX.Element => {
  const srvc = useContext(ServiceContext)

  const { chain } = props
  const pods = useMemo<Array<IPod>>(
    () =>
      chain
        ? chain.pods.map((v, idx) => ({
            ...v,
            rank: idx,
            node: `${shortNodeName(v.node) || ''}`,
          }))
        : [],
    [chain],
  )

  const ioTooltipKeys = {
    on: i18nKeys.biz_io_on,
    off: i18nKeys.biz_io_off,
    disabled: i18nKeys.biz_io_disabled,
  }

  const serviceNames = ((chain.config_json as TaskConfigJsonTraining)?.schema?.services || [])
    .map((item) => item.name)
    .filter((name) => !!name)

  const showServiceNames = !!serviceNames.length
  const displayServiceNames = [CONSTS.DEFAULT_LOG_SERVICE_NAME, ...serviceNames]

  return (
    <div
      className="hfapp-log-header"
      style={{ display: props.show ? 'block' : 'none' }}
      id="hf-log-viewer-header"
    >
      <div className="left">
        {chain && (
          <div className="log-header-status">
            <StatusIconV2 workerStatus={chain.worker_status} chainStatus={chain.chain_status} />
          </div>
        )}
        <div className="task-name"> {chain?.showName || 'unknown'}</div>

        <RankSelectWrapper
          className="ml20"
          pods={pods}
          currentRank={props.selectedRank}
          onItemSelect={props.handleRankSelect}
        />
        <Button
          title={i18n.t(i18nKeys.biz_search_global_placeholder)}
          active={!!props.globalSearchContainerShow}
          minimal
          className="btn-search-global"
          small
          icon={
            <span aria-hidden="true" className="hai-ui-icon hai-ui-icon">
              <SVGWrapper width="16px" height="16px" svg={icons.search_global} />
            </span>
          }
          onClick={props.toggleGlobalContainerShow}
        />
      </div>
      <div className="right">
        {props.ioButtonStatus && (
          <div style={{ marginRight: '4px' }} title={i18n.t(ioTooltipKeys[props.ioButtonStatus])}>
            <Button
              active={props.ioButtonStatus === 'on'}
              minimal
              small
              disabled={props.ioButtonStatus === 'disabled'}
              icon={
                <span aria-hidden="true" className="hai-ui-icon hai-ui-icon-time">
                  <SVGWrapper
                    width="16px"
                    height="16px"
                    svg={
                      props.ioButtonStatus !== 'disabled'
                        ? icons.io_connected
                        : icons.io_connect_disabled
                    }
                    fill={props.ioButtonStatus === 'on' ? '#489fe6' : undefined}
                  />
                </span>
              }
              onClick={props.handleIOClick!}
            />
          </div>
        )}
        {chain?.instance_updated_at && (
          <DynamicUpdate
            value={chain?.instance_updated_at?.slice(5)}
            style={{
              fontSize: '12px',
              wordBreak: 'break-all',
            }}
          />
        )}
        <div className="refresh">
          <RefreshBtn
            small
            onClick={() => {
              props.handleRefreshClick()
            }}
          />
        </div>
        {showServiceNames && (
          <ServiceSelect
            filterable={false}
            popoverProps={{
              minimal: true,
              position: 'bottom-right',
            }}
            // eslint-disable-next-line react/no-unstable-nested-components
            itemRenderer={(serviceName, { handleClick, modifiers }) => {
              return (
                <MenuItem
                  active={
                    serviceName === srvc.state.service ||
                    (serviceName === CONSTS.DEFAULT_LOG_SERVICE_NAME && !srvc.state.service)
                  }
                  disabled={modifiers.disabled}
                  onClick={handleClick}
                  text={serviceName}
                />
              )
            }}
            className="service-name-select"
            items={displayServiceNames}
            onItemSelect={(nextServiceName: string): void => {
              srvc.dispatch({
                type: 'service',
                value:
                  // 注意：这里 undefined 还是 '' 对集群后端来说是有区别的，前者表示不指定
                  nextServiceName === CONSTS.DEFAULT_LOG_SERVICE_NAME ? undefined : nextServiceName,
              })
            }}
          >
            <Button
              alignText="left"
              title={i18n.t(i18nKeys.biz_exp_log_change_service_name)}
              rightIcon="caret-down"
              className="log-service-name-show-btn"
              small
            >
              {srvc.state.service || CONSTS.DEFAULT_LOG_SERVICE_NAME}
            </Button>
          </ServiceSelect>
        )}
        <div style={{ marginLeft: '4px' }} title={i18n.t(i18nKeys.biz_logViewer_show_sys_log)}>
          <Button
            active={props.showSyslog}
            minimal
            small
            icon={
              <span aria-hidden="true" className="hai-ui-icon hai-ui-icon-time">
                <SVGWrapper width="16px" height="16px" svg={icons.syslog} />
              </span>
            }
            onClick={props.handleShowSyslogClick}
          />
        </div>
        <ExperimentInfo className="ml20" chain={chain} />
        <div style={{ marginLeft: '4px' }} title={i18n.t(i18nKeys.biz_logViewer_show_line_time)}>
          <Button
            active={props.showLineTime}
            minimal
            small
            icon="time"
            onClick={props.handleShowLineTimeClick}
          />
        </div>
        <div style={{ marginLeft: '4px' }} title={i18n.t(i18nKeys.biz_logViewer_auto_word_wrap)}>
          <Button
            active={props.wordWrap === WordWrapEnums.on}
            minimal
            small
            icon={
              <span aria-hidden="true" className="hai-ui-icon hai-ui-icon-time">
                <SVGWrapper width="16px" height="16px" svg={icons.multi_line} />
              </span>
            }
            onClick={props.handleWordWrapClick}
          />
        </div>
        <div style={{ marginLeft: '4px' }} title={i18n.t(i18nKeys.biz_logViewer_show_minimap)}>
          <Button
            active={props.miniMapEnabled}
            minimal
            small
            icon={
              <span aria-hidden="true" className="hai-ui-icon hai-ui-icon-time">
                <SVGWrapper width="16px" height="16px" svg={icons.minimap} />
              </span>
            }
            onClick={props.handleMiniMapClick}
          />
        </div>
        <div style={{ marginLeft: '4px' }} className="line-option-container">
          <Button
            title={i18n.t(i18nKeys.biz_logViewer_split_line_jump_up)}
            minimal
            small
            className="split-line-jump-btn"
            icon={
              <span aria-hidden="true" className="hai-ui-icon hai-ui-icon-time">
                <SVGWrapper width="16px" height="16px" svg={icons.log_jump_up} />
              </span>
            }
            onClick={() => {
              srvc.app.emit(EventsKeys.SplitLineJump, {
                direction: 'up',
              })
            }}
          />
          <Button
            title={i18n.t(i18nKeys.biz_logViewer_split_line_jump_down)}
            minimal
            className="split-line-jump-btn"
            small
            icon={
              <span aria-hidden="true" className="hai-ui-icon hai-ui-icon-time">
                <SVGWrapper width="16px" height="16px" svg={icons.log_jump_down} />
              </span>
            }
            onClick={() => {
              srvc.app.emit(EventsKeys.SplitLineJump, {
                direction: 'down',
              })
            }}
          />
          <Button
            title={i18n.t(i18nKeys.biz_logViewer_split_line_jump_bottom)}
            minimal
            className="split-line-jump-btn"
            small
            icon={
              <span aria-hidden="true" className="hai-ui-icon hai-ui-icon-time">
                <SVGWrapper width="16px" height="16px" svg={icons.log_jump_bottom} />
              </span>
            }
            onClick={() => {
              srvc.app.emit(EventsKeys.SplitLineJump, {
                direction: 'bottom',
              })
            }}
          />
        </div>
        <div style={{ marginLeft: '4px' }} title={i18n.t(i18nKeys.base_Search)}>
          <Button
            active={props.showSearch}
            minimal
            small
            icon="search"
            onClick={props.handleShowSearchClick}
          />
        </div>
      </div>
    </div>
  )
}
