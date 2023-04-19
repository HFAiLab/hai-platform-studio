/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable react/no-unused-prop-types */
// @ts-nocheck 涉及到 svg 文件，忽略默认报错

// Priority icons
import iconPAuto from '@hai-platform/icons/priority/-1.svg?raw'
import iconP0 from '@hai-platform/icons/priority/0.svg?raw'
import iconP10 from '@hai-platform/icons/priority/10.svg?raw'
import iconP20 from '@hai-platform/icons/priority/20.svg?raw'
import iconP30 from '@hai-platform/icons/priority/30.svg?raw'
import iconP40 from '@hai-platform/icons/priority/40.svg?raw'
import iconP5 from '@hai-platform/icons/priority/5.svg?raw'
import iconP50 from '@hai-platform/icons/priority/50.svg?raw'

import share_icon_status_failed from '@hai-platform/icons/status/failed.svg?raw'
import share_icon_status_not_all_running from '@hai-platform/icons/status/not_all_running.svg?raw'
import share_icon_status_running from '@hai-platform/icons/status/running.svg?raw'
import share_icon_status_stopped from '@hai-platform/icons/status/stopped.svg?raw'
import share_icon_status_succeeded from '@hai-platform/icons/status/succeeded.svg?raw'
import share_icon_status_suspended from '@hai-platform/icons/status/suspended.svg?raw'
import share_icon_status_waiting_init from '@hai-platform/icons/status/waiting_init.svg?raw'
import img_notfound from '@hai-platform/icons/sundries/not-found.svg?raw'

import { priorityToName } from '@hai-platform/shared'
import type { PriorityName } from '@hai-platform/studio-schemas/lib/esm/model/Priority'
import { Tooltip2 } from '@hai-ui/popover2/lib/esm'
import { uniqueId } from 'lodash-es'
import type { ReactElement } from 'react'
import React, { useState } from 'react'
// import ReactTooltip from 'react-tooltip'

import icon_down from '../../../src/images/down.svg?raw'
import icon_auto_refresh from '../../../src/images/icon/ailab_icon_auto_refresh.svg?raw'
import icon_highflyer from '../../../src/images/icon/ailab_icon_color.svg?raw'
import icon_error_module from '../../../src/images/icon/error-module.svg?raw'
import icon_add_tag from '../../../src/images/icon/icon_add_tag.svg?raw'
import icon_highflyer_footer from '../../../src/images/icon/icon_ailab_footer.svg?raw'
import icon_highflyer_text from '../../../src/images/icon/icon_ailab_text.svg?raw'
import icon_chain from '../../../src/images/icon/icon_chain.svg?raw'
import icon_copy from '../../../src/images/icon/icon_copy.svg?raw'
import icon_edit from '../../../src/images/icon/icon_edit.svg?raw'
import icon_error from '../../../src/images/icon/icon_error.svg?raw'
import icon_filter from '../../../src/images/icon/icon_filter.svg?raw'
import icon_grafana from '../../../src/images/icon/icon_grafana.svg?raw'
import icon_help from '../../../src/images/icon/icon_help.svg?raw'
import icon_history from '../../../src/images/icon/icon_history.svg?raw'
import icon_home from '../../../src/images/icon/icon_home.svg?raw'
import icon_io_connect_disabled from '../../../src/images/icon/icon_io_connect_disabled.svg?raw'
import icon_io_connected from '../../../src/images/icon/icon_io_connected.svg?raw'
import icon_loading from '../../../src/images/icon/icon_loading.svg?raw'
import icon_log_jump_bottom from '../../../src/images/icon/icon_log_jump_bottom.svg?raw'
import icon_log_jump_down from '../../../src/images/icon/icon_log_jump_down.svg?raw'
import icon_log_jump_up from '../../../src/images/icon/icon_log_jump_up.svg?raw'
import icon_log_share from '../../../src/images/icon/icon_log_share.svg?raw'
import icon_logtime from '../../../src/images/icon/icon_logtime.svg?raw'
import icon_minimap from '../../../src/images/icon/icon_minimap.svg?raw'
import icon_multi_line from '../../../src/images/icon/icon_multi_line.svg?raw'
import icon_nodes from '../../../src/images/icon/icon_nodes.svg?raw'
import icon_open_slide from '../../../src/images/icon/icon_open_slide.svg?raw'
import icon_pause from '../../../src/images/icon/icon_pause.svg?raw'
import icon_perf from '../../../src/images/icon/icon_perf.svg?raw'
import icon_refresh from '../../../src/images/icon/icon_refresh.svg?raw'
import icon_restart from '../../../src/images/icon/icon_restart.svg?raw'
import icon_search from '../../../src/images/icon/icon_search.svg?raw'
import icon_search_global from '../../../src/images/icon/icon_search_global.svg?raw'
import icon_selected from '../../../src/images/icon/icon_selected.svg?raw'
import icon_stop from '../../../src/images/icon/icon_stop.svg?raw'
import icon_storage from '../../../src/images/icon/icon_storage.svg?raw'
import icon_syslog from '../../../src/images/icon/icon_syslog.svg?raw'
import icon_validate from '../../../src/images/icon/icon_validate.svg?raw'
import icon_waiting from '../../../src/images/icon/icon_waiting.svg?raw'

// Status icons
import icon_right from '../../../src/images/right.svg?raw'

import { SVGWrapper } from '../svgWrapper'

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace icons {
  export const down = icon_down
  export const right = icon_right
  export const chain = icon_chain
  export const help = icon_help
  export const history = icon_history
  export const home = icon_home
  export const loading = icon_loading
  export const pause = icon_pause
  export const refresh = icon_refresh
  export const restart = icon_restart
  export const selected = icon_selected
  export const stop = icon_stop
  export const error = icon_error
  export const storage = icon_storage
  export const waiting = icon_waiting
  export const highflyer = icon_highflyer
  export const highflyerText = icon_highflyer_text
  export const highflyerFooter = icon_highflyer_footer
  export const edit = icon_edit
  export const logtime = icon_logtime
  export const filter = icon_filter
  export const search = icon_search
  export const validate = icon_validate
  export const openSlide = icon_open_slide
  export const perf = icon_perf
  export const syslog = icon_syslog
  export const copy = icon_copy
  export const nodes = icon_nodes
  export const multi_line = icon_multi_line
  export const minimap = icon_minimap
  export const notfound_bg = img_notfound
  export const auto_refresh = icon_auto_refresh
  export const io_connected = icon_io_connected
  export const io_connect_disabled = icon_io_connect_disabled
  export const search_global = icon_search_global
  export const error_module = icon_error_module
  export const grafana = icon_grafana
  export const log_share = icon_log_share
  export const log_jump_bottom = icon_log_jump_bottom
  export const log_jump_up = icon_log_jump_up
  export const log_jump_down = icon_log_jump_down
  export const add_tag = icon_add_tag
}

export type TIcon =
  | 'down'
  | 'right'
  | 'chain'
  | 'help'
  | 'history'
  | 'home'
  | 'loading'
  | 'pause'
  | 'refresh'
  | 'restart'
  | 'selected'
  | 'stop'
  | 'error'
  | 'storage'
  | 'waiting'
  | 'highflyer'
  | 'edit'
  | 'logtime'
  | 'filter'
  | 'search'
  | 'validate'
  | 'openSlide'
  | 'perf'
  | 'syslog'
  | 'copy'
  | 'nodes'
  | 'auto_refresh'
  | 'io_connected'
  | 'io_connect_disabled'
  | 'icon_search_global'
  | 'icon_error_module'
  | 'icon_grafana'
  | 'log_share'
  | 'log_jump_bottom'
  | 'log_jump_up'
  | 'log_jump_down'
  | 'add_tag'
  | null

export const InlineIcon = (props: {
  name: TIcon
  id?: string
  fill?: string
  tooltip?: string | ReactElement | ReactElement[]
  tooltipPlace?: 'top' | 'right' | 'bottom' | 'left'
  style?: React.HTMLAttributes<HTMLElement>['style']
  onClick?: React.HTMLAttributes<HTMLElement>['onClick']
  iconObj?: string
}): JSX.Element => {
  const elTooltip = !(typeof props.tooltip === 'string')
  const [id] = useState<string>(props.id ?? uniqueId('hf_tooltip_id_'))
  return (
    <span
      style={props.style}
      onClick={props.onClick}
      className="hf svg-icon svg-baseline"
      data-for={id}
      data-tip={elTooltip ? '' : props.tooltip}
    >
      {props.tooltip ? (
        // eslint-disable-next-line react/jsx-no-useless-fragment
        <Tooltip2 placement="top" content={<>{props.tooltip}</>}>
          <SVGWrapper
            fill={props.fill ?? 'var(--hf-ui-font-color1)'}
            svg={props.iconObj ?? icons[props.name!]}
          />
        </Tooltip2>
      ) : (
        <SVGWrapper
          fill={props.fill ?? 'var(--hf-ui-font-color1)'}
          svg={props.iconObj ?? icons[props.name!]}
        />
      )}

      {/* {props.tooltip && <ReactTooltip
            border
            borderColor='var(--jp-layout-color3)'
            textColor='var(--hf-text-normal)'
            backgroundColor='var(--jp-layout-color1)'
            id={id}
            place={props.tooltipPlace}
            effect='solid' children={elTooltip ? props.tooltip : undefined} />} */}
    </span>
  )
}

const PRIORITY_ICON = {
  AUTO: iconPAuto,
  LOW: iconP0,
  NORMAL: iconP10,
  ABOVE_NORMAL: iconP20,
  HIGH: iconP30,
  VERY_HIGH: iconP40,
  EXTREME_HIGH: iconP50,
  BELOW_NORMAL: iconP5,
} as { [key in PriorityName]: string }

export const PriorityIcon = (props: {
  priority: number | string
  marginRight?: number
  overwriteClassName?: string
}): JSX.Element => {
  const pName = typeof props.priority === 'string' ? props.priority : priorityToName(props.priority)
  const marginRight = props.marginRight ?? 4
  return (
    <span
      className={props.overwriteClassName ?? 'hf svg-icon svg-baseline'}
      title={`Priority : ${pName}`}
      style={{ marginRight }}
    >
      <SVGWrapper svg={PRIORITY_ICON[pName as PriorityName] ?? icon_help} />
    </span>
  )
}

export const StatusIconV2 = (props: {
  workerStatus: WorkerStatus
  chainStatus: ChainStatus
  customStyle?: React.HTMLAttributes<HTMLElement>['style']
  disableTooltip?: boolean
}): JSX.Element => {
  const { workerStatus, chainStatus, customStyle } = props
  let tooltip = null
  let icon = null
  if (chainStatus === 'waiting_init') {
    tooltip = 'ChainStatus: waiting_init'
    icon = share_icon_status_waiting_init
  }
  if (chainStatus === 'suspended') {
    tooltip = 'ChainStatus: suspended'
    icon = share_icon_status_suspended
  }
  if (chainStatus === 'running') {
    if (workerStatus === 'running') {
      tooltip = 'ChainStatus: running'
      icon = share_icon_status_running
    } else {
      tooltip = `ChainStatus: running, workerStatus: ${workerStatus}`
      icon = share_icon_status_not_all_running
    }
  }
  if (chainStatus === 'finished') {
    icon = share_icon_status_stopped
    tooltip = `ChainStatus: finished, workerStatus: ${workerStatus}`
    if (workerStatus === 'succeeded') {
      icon = share_icon_status_succeeded
    } else if (workerStatus === 'failed') {
      icon = share_icon_status_failed
    }
  }

  return (
    <InlineIcon
      style={customStyle}
      name={null}
      tooltip={props.disableTooltip ? '' : tooltip || ''}
      iconObj={icon}
      tooltipPlace="right"
    />
  )
}

/* Switcher */
export const SwitcherIcon = (props: {
  handler: (x?: any) => void
  controller: boolean
  name: TIcon
  onFill?: string
  offFill?: string
  onBg?: string
  offBg?: string
  tooltip?: string
  style?: React.HTMLAttributes<HTMLElement>['style']
  zoom?: number
}): JSX.Element => {
  const scale = `scale(${props.zoom},${props.zoom})`
  return (
    <button
      style={{
        transform: props.zoom ? scale : undefined,
        ...(props.style ?? {}),
      }}
      onClick={props.handler}
      className={`hf-switcher small ${props.controller ? 'active' : ''}`}
    >
      <InlineIcon name={props.name} tooltip={props.tooltip} />
    </button>
  )
}
