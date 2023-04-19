import { i18n, i18nKeys } from '@hai-platform/i18n'
import type { OutOfQuotaTask } from '@hai-platform/shared'
import { Colors } from '@hai-ui/colors/lib/colors'
import { Icon } from '@hai-ui/core'
import React, { useContext, useState } from 'react'
import useEffectOnce from 'react-use/esm/useEffectOnce'
import useUpdateEffect from 'react-use/esm/useUpdateEffect'
import { conn } from '../../../api/serverConnection'
import { HFPanelContext, LoadingStatus } from '../../../components/HFPanel'
import './index.scss'

export const ErrorTrainings = () => {
  const panelCTX = useContext(HFPanelContext)

  const [outOfQuotaTasks, setOutOfQuotaTasks] = useState<OutOfQuotaTask[]>([])

  const PanelContext = useContext(HFPanelContext)

  const fetchOutOfQuotaTrainings = () => {
    return conn.getOutOfQuotaTasks().then((tasks) => {
      if (tasks && tasks.length) {
        PanelContext.setVisibility('show')
      } else {
        PanelContext.setVisibility('hide')
      }
      setOutOfQuotaTasks(tasks || [])
    })
  }

  const fetchData = () => {
    if (panelCTX.loadingStatus === LoadingStatus.loading) return
    panelCTX.setLoadingStatus(LoadingStatus.loading)

    fetchOutOfQuotaTrainings()
      .then(() => {
        panelCTX.setLoadingSuccess()
      })
      .catch(() => {
        panelCTX.setLoadingError()
      })
  }

  useEffectOnce(() => {
    fetchData()
  })

  useUpdateEffect(() => {
    fetchData()
  }, [panelCTX.retryFlag])

  return (
    <div>
      <div className="error-train-title">
        {i18n.t(i18nKeys.biz_error_trainings_error_desc, {
          n: `${outOfQuotaTasks.length}`,
        })}
      </div>
      <div className="error-trainings-container">
        {outOfQuotaTasks.map((item) => {
          return (
            <div className="error-train-item" key={item.nb_name}>
              <Icon icon="issue" className="item-icon" color={Colors.RED3} />
              <p>
                {i18n.t(i18nKeys.biz_error_trainings_quota_exceeded_desc, {
                  name: item.nb_name,
                })}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
