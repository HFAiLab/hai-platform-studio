import { i18n, i18nKeys } from '@hai-platform/i18n'
import type { Pod } from '@hai-platform/shared'
import {
  MetaType,
  getMetaList,
} from '@hai-platform/studio-toolkit/lib/esm/utils/nodeNetworkMetaMap'
import { Button, Dialog, InputGroup } from '@hai-ui/core/lib/esm'
import React, { useContext, useState } from 'react'
import { ValidatePortal } from '../../../../biz-components/validate'
import type { Chain } from '../../../../model/Chain'
import type { IQueryType } from '../../../../schemas/basic'
import { JobComponent } from '../../../../ui-components/jobCell'
import { InlineIcon, SwitcherIcon } from '../../../../ui-components/svgIcon'
import { TabTitle } from '../../../../ui-components/uikit'
import { isInnerUser } from '../../../../utils/platform'
import { ExpServiceContext } from '../../reducer'
import { ServiceNames } from '../../schema'

export interface OpenLogViewerParams {
  chain: Chain
  rank: number
  queryType: IQueryType
}

export const Exp2Nodes = (props: { mini?: boolean }): JSX.Element => {
  const srvc = useContext(ExpServiceContext)
  const { chain, queryType } = srvc.state

  const [filter, setFilter] = useState<string>('')
  const [showFilter, setShowFilter] = useState<boolean>(false)
  const [isValidateOpen, setIsValidateOpen] = useState<boolean>(false)

  let show_pods: Pod[] = []

  if (chain && chain.pods.length) {
    show_pods = [...chain.pods]

    // mock test:
    // for (let i = 0; i < 100; i += 1) {
    //   show_pods = [...show_pods, ...chain.pods]
    // }
  }

  const handleNodeClick = (rank: number) => {
    srvc.app.api().invokeService(ServiceNames.openLogViewer, {
      chain: chain! as any,
      rank,
      queryType,
    })
  }

  if (!chain) {
    if (props.mini) {
      // eslint-disable-next-line react/jsx-no-useless-fragment
      return <></>
    }
    return (
      <div className="jobs-wrapper">
        <TabTitle title={i18n.t(i18nKeys.biz_exp_nodes_task_nodes)} desc="" />
        <p>{i18n.t(i18nKeys.biz_exp_select_node)}</p>
      </div>
    )
  }

  const leafCount = getMetaList(chain!.pods, MetaType.leaf).length
  const spineCount = getMetaList(chain!.pods, MetaType.spine).length
  const scheduleZone = getMetaList(chain!.pods.slice(0, 1), MetaType.scheduleZone)[0] || '-'

  const networkCountStr =
    leafCount > 0 ? `, L${leafCount} / S${spineCount}, Zone: ${scheduleZone}` : ''
  return (
    <div className="jobs-wrapper">
      <TabTitle
        title={
          i18n.t(i18nKeys.biz_exp_nodes_task_nodes) +
          (chain ? ` ( ${chain.pods.length}${networkCountStr} ) ` : '')
        }
        desc=""
      />
      {chain && chain.pods.length ? (
        <>
          <SwitcherIcon
            handler={() => {
              if (!showFilter) {
                // CountlyReport.addEvent(CountlyEventKey.ExpDetailFilterClick);
              }
              setShowFilter(!showFilter)
              if (showFilter) {
                setFilter('')
              }
            }}
            tooltip={i18n.t(i18nKeys.biz_exp_nodes_filter)}
            controller={showFilter}
            name="filter"
            style={{ position: 'absolute', right: 0, top: 0 }}
          />
          <div
            className="nodes-filter"
            style={{ marginBottom: '10px', display: showFilter ? 'block' : 'none' }}
          >
            <InputGroup
              value={filter}
              placeholder={i18n.t(i18nKeys.biz_exp_nodes_filter)}
              onChange={(e) => {
                setFilter(e.target.value)
              }}
            />
          </div>
          <div className="cell-flex-box">
            {show_pods.map((item: Pod, index: number) => (
              <JobComponent
                rank={index}
                clickHandler={handleNodeClick}
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                pod={item}
                filter={filter}
              />
            ))}
          </div>
          {isInnerUser() && !window.is_hai_studio && (
            <>
              <Button
                small
                className="validate-btn"
                style={{ display: show_pods.length && !showFilter ? 'inline-block' : 'none' }}
                onClick={() => {
                  setIsValidateOpen(true)
                }}
                icon={<InlineIcon name="validate" />}
              >
                {i18n.t(i18nKeys.biz_exp_nodes_validate_nodes)}
              </Button>
              <Dialog isOpen={isValidateOpen} className="validate-dialog">
                <ValidatePortal
                  chain={chain}
                  onCancel={() => {
                    setIsValidateOpen(false)
                  }}
                  onValidate={(config: any) => {
                    chain.validate({ config })
                    setIsValidateOpen(false)
                  }}
                  toaster={srvc.app.api().getHFUIToaster()}
                />
              </Dialog>
            </>
          )}
        </>
      ) : (
        <div>
          <p>{i18n.t(i18nKeys.biz_exp_nodes_no_worker)}</p>
        </div>
      )}
    </div>
  )
}
