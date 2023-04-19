import { i18n, i18nKeys } from '@hai-platform/i18n'
import { UserRole } from '@hai-platform/shared'
import React from 'react'
import { CurrentTrainings } from '../../../../biz-components/Panels/CurrentTrainings'
import { PathGuide } from '../../../../biz-components/Panels/PathGuide'
import { StorageUsage } from '../../../../biz-components/Panels/StorageUsage'
import { TaskAndPerformance } from '../../../../biz-components/Panels/TaskAndPerformance'
import { Workspace } from '../../../../biz-components/Panels/Workspace'
import { HFPanel } from '../../../../components/HFPanel'
import { HomePanelNames } from '../../../../modules/settings/config'
import type { DndPanelProps } from './dndConfig'
import { getCollapseProps } from './dndConfig'

export const DNDPanelsMap = {
  [HomePanelNames.CurrentTrainings]: {
    render(props: DndPanelProps) {
      return (
        <HFPanel
          panelName={HomePanelNames.CurrentTrainings}
          title={i18n.t(i18nKeys.biz_home_scheduler)}
          dragHandleProps={props.dragHandleProps}
          shadow
          nanoTopPadding
          collapseProps={getCollapseProps(props.partCollapseProps)}
        >
          <CurrentTrainings />
        </HFPanel>
      )
    },
  },
  [HomePanelNames.StorageUsage]: {
    render(props: DndPanelProps) {
      return (
        <HFPanel
          panelName={HomePanelNames.StorageUsage}
          title={i18n.t(i18nKeys.biz_home_storage)}
          dragHandleProps={props.dragHandleProps}
          shadow
          collapseProps={getCollapseProps(props.partCollapseProps)}
        >
          <StorageUsage role={window._hf_user_if_in ? UserRole.INTERNAL : UserRole.EXTERNAL} />
        </HFPanel>
      )
    },
  },
  [HomePanelNames.Workspace]: {
    render(props: DndPanelProps) {
      return (
        <HFPanel
          nanoTopPadding
          panelName={HomePanelNames.Workspace}
          title={i18n.t(i18nKeys.biz_workspace)}
          dragHandleProps={props.dragHandleProps}
          shadow
          collapseProps={getCollapseProps(props.partCollapseProps)}
        >
          <Workspace />
        </HFPanel>
      )
    },
  },
  [HomePanelNames.PathGuide]: {
    render(props: DndPanelProps) {
      return (
        <HFPanel
          panelName={HomePanelNames.PathGuide}
          title={i18n.t(i18nKeys.biz_path_guide)}
          dragHandleProps={props.dragHandleProps}
          shadow
          disableLoading
          collapseProps={getCollapseProps(props.partCollapseProps)}
        >
          <PathGuide />
        </HFPanel>
      )
    },
  },
  [HomePanelNames.TaskAndPerformance]: {
    render(props: DndPanelProps) {
      return (
        <HFPanel
          panelName={HomePanelNames.TaskAndPerformance}
          title={i18n.t(i18nKeys.biz_home_history_trainings)}
          dragHandleProps={props.dragHandleProps}
          shadow
          disableLoading
          collapseProps={getCollapseProps(props.partCollapseProps)}
        >
          <TaskAndPerformance />
        </HFPanel>
      )
    },
  },
}
