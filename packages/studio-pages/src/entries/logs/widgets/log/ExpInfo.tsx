import { i18n, i18nKeys } from '@hai-platform/i18n'
import { Button } from '@hai-ui/core/lib/esm'
import { Popover2 } from '@hai-ui/popover2/lib/esm'
import React, { useContext } from 'react'
import { ServiceContext } from '../..'
import type { Chain } from '../../../../model/Chain'
import { icons } from '../../../../ui-components/svgIcon'
import { SVGWrapper } from '../../../../ui-components/svgWrapper'
import { simpleCopy } from '../../../../utils/copyToClipboard'

interface IExperimentInfo {
  chain: Chain
  className?: string
}

export const ExperimentInfo: React.FC<IExperimentInfo> = ({ chain, className }) => {
  const srvc = useContext(ServiceContext)

  const getPodsShowText = () => {
    const nodes = chain.pods.map((item) => item.node)
    if (nodes.length < 1) return nodes.join(',')
    return `${nodes.slice(0, 1).join(',')}... (total ${nodes.length})`
  }

  return chain ? (
    <Popover2
      className={className ?? ''}
      position="bottom-right"
      content={
        <div className="hf-experiment-info">
          <ul>
            <li>
              <span className="label">{i18n.t(i18nKeys.biz_exp_log_last_id)}:</span>
              <span className="value">{chain.id}</span>
              <Button
                title={i18n.t(i18nKeys.biz_exp_log_clip_board)}
                icon={
                  <span aria-hidden="true" className="hai-ui-icon ">
                    <SVGWrapper width="16px" height="16px" svg={icons.copy} />
                  </span>
                }
                minimal
                small
                onClick={() => {
                  simpleCopy(String(chain.id), 'Last ID', srvc.app.api().getHFUIToaster())
                }}
              />
            </li>
            <li>
              <span className="label">{i18n.t(i18nKeys.biz_exp_log_chain_id)}:</span>
              <span className="value">{chain.chainInitial}...</span>
              <Button
                title={i18n.t(i18nKeys.biz_exp_log_clip_board)}
                icon={
                  <span aria-hidden="true" className="hai-ui-icon ">
                    <SVGWrapper width="16px" height="16px" svg={icons.copy} />
                  </span>
                }
                minimal
                small
                onClick={() => {
                  simpleCopy(String(chain.chain_id), 'Chain ID', srvc.app.api().getHFUIToaster())
                }}
              />
            </li>
            <li>
              <span className="label">{i18n.t(i18nKeys.biz_exp_log_name)}:</span>
              <span className="value">{chain.showName}</span>
              <Button
                title={i18n.t(i18nKeys.biz_exp_log_clip_board)}
                icon={
                  <span aria-hidden="true" className="hai-ui-icon ">
                    <SVGWrapper width="16px" height="16px" svg={icons.copy} />
                  </span>
                }
                minimal
                small
                onClick={() => {
                  simpleCopy(String(chain.showName), 'Name', srvc.app.api().getHFUIToaster())
                }}
              />
            </li>
            <li>
              <span className="label">{i18n.t(i18nKeys.biz_exp_node_list)}:</span>
              <span className="value">{getPodsShowText()}</span>
              <Button
                title={i18n.t(i18nKeys.biz_exp_log_clip_board)}
                icon={
                  <span aria-hidden="true" className="hai-ui-icon ">
                    <SVGWrapper width="16px" height="16px" svg={icons.copy} />
                  </span>
                }
                minimal
                small
                onClick={() => {
                  simpleCopy(
                    String(chain.pods.map((item) => item.node).join(',')),
                    'Node List',
                    srvc.app.api().getHFUIToaster(),
                  )
                }}
              />
            </li>
          </ul>
        </div>
      }
    >
      <Button
        style={{ marginLeft: '4px' }}
        icon="info-sign"
        title={i18n.t(i18nKeys.biz_exp_log_show_info_for_chain)}
        minimal
        small
      />
    </Popover2>
  ) : null
}
