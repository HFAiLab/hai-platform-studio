import type { Pod } from '@hai-platform/shared'
import { MetaType, getMeta } from '@hai-platform/studio-toolkit/lib/esm/utils/nodeNetworkMetaMap'
import { Icon } from '@hai-ui/core'
import { Tooltip2 } from '@hai-ui/popover2/lib/esm'
import React from 'react'
import { shortNodeName } from '../../utils'

export const JobComponent = (props: {
  rank: number
  pod: Pod
  mini?: boolean
  filter?: string
  selected?: boolean
  clickHandler?(rank: number, node: string): void
}): JSX.Element => {
  let hit = false

  const { node, role, status, exit_code } = props.pod
  const meta = node ? getMeta(node, MetaType.all) : null

  let exit_code_show = exit_code || ''
  if (exit_code_show.toLocaleLowerCase() === 'nan') exit_code_show = 'killed'

  const not_finished =
    status === 'queued' ||
    status === 'running' ||
    status === 'created' ||
    status === 'building' ||
    status === 'unknown' ||
    status === 'unschedulable'

  const id = `${props.rank}-${node}-${status}-${props.mini ? 'm' : 'n'}`

  if (!props.filter) {
    hit = true
  } else {
    hit = Boolean(
      node!.includes(props.filter) ||
        status.includes(props.filter) ||
        meta?.leaf?.includes(props.filter) ||
        meta?.spine?.includes(props.filter),
    )
  }

  const Node = (
    <div
      onClick={() => {
        if (props.clickHandler) props.clickHandler(props.rank, node!)
      }}
      data-tip
      data-rank={props.rank}
      className={`job-cell ${status} ${role} ${props.mini ? ' mini' : ''}`}
      data-for={id}
    >
      {props.mini ? props.rank : `${props.rank} `}
    </div>
  )

  return !hit ? (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <></>
  ) : (
    <div className="cell-container">
      <Tooltip2
        placement="top"
        content={
          <span>
            Role: {role}
            <br />
            Node: {shortNodeName(node)}
            <br />
            Status: {status}
            <br />
            {!not_finished && exit_code_show && (
              <>
                {' '}
                Exit Code: {exit_code_show}
                <br />
              </>
            )}
            {meta?.leaf && (
              <>
                Leaf: {meta.leaf}
                <br />
              </>
            )}
            {meta?.spine && (
              <>
                Spine: {meta.spine}
                <br />
              </>
            )}
          </span>
        }
      >
        {props.selected ? (
          <div className="active-job-cell-container">
            <div className="active-job-cell-mask">
              <Icon icon="small-tick" className="mask-icon" />
            </div>
            {Node}
          </div>
        ) : (
          Node
        )}
      </Tooltip2>
    </div>
  )
}

/**
 * 展示节点的 Node 格式的宽一点的
 */
export const JobComponentV2 = (props: {
  rank: number
  pod: Pod
  mini?: boolean
  filter?: string
  selected?: boolean
  clickHandler?(node: string): void
}): JSX.Element => {
  let hit = false

  const { node, role, status, exit_code } = props.pod
  const meta = node ? getMeta(node, MetaType.all) : null

  let exit_code_show = exit_code || ''
  if (exit_code_show.toLocaleLowerCase() === 'nan') exit_code_show = 'killed'

  const not_finished =
    status === 'queued' ||
    status === 'running' ||
    status === 'created' ||
    status === 'building' ||
    status === 'unknown' ||
    status === 'unschedulable'

  const id = `${props.rank}-${node}-${status}-${props.mini ? 'm' : 'n'}`

  if (!props.filter) {
    hit = true
  } else {
    hit = Boolean(
      node!.includes(props.filter) ||
        status.includes(props.filter) ||
        meta?.leaf?.includes(props.filter) ||
        meta?.spine?.includes(props.filter),
    )
  }

  const Node = (
    <div
      onClick={() => {
        if (props.clickHandler) props.clickHandler(node)
      }}
      data-tip
      data-rank={props.rank}
      className={`job-cell2 ${status} ${role} ${props.mini ? ' mini' : ''}`}
      data-for={id}
    >
      {node}
    </div>
  )

  return !hit ? (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <></>
  ) : (
    <div className="cell-container">
      <Tooltip2
        placement="top"
        content={
          <span>
            Role: {role}
            <br />
            Node: {shortNodeName(node)}
            <br />
            Status: {status}
            <br />
            {!not_finished && exit_code_show && (
              <>
                {' '}
                Exit Code: {exit_code_show}
                <br />
              </>
            )}
            {meta?.leaf && (
              <>
                Leaf: {meta.leaf}
                <br />
              </>
            )}
            {meta?.spine && (
              <>
                Spine: {meta.spine}
                <br />
              </>
            )}
          </span>
        }
      >
        {props.selected ? (
          <div className="active-job-cell-container">
            <div className="active-job-cell-mask">
              <Icon icon="small-tick" className="mask-icon" />
            </div>
            {Node}
          </div>
        ) : (
          Node
        )}
      </Tooltip2>
    </div>
  )
}
