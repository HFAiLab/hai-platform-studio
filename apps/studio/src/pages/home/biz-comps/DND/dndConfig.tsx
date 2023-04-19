/* eslint-disable @typescript-eslint/no-shadow */
import { i18n, i18nKeys } from '@hai-platform/i18n'
import { UserRole } from '@hai-platform/shared'
import type { DraggableProvidedDragHandleProps } from 'react-beautiful-dnd'
import type { HFPanelCollapseProps } from '../../../../components/HFPanel/schema'
import PanelCurrentTrainingsSvg from '../../../../components/svg/panels/current-trainings.svg?raw'
import PanelPathGuideSvg from '../../../../components/svg/panels/paths.svg?raw'
import PanelStorageSvg from '../../../../components/svg/panels/storage.svg?raw'
import PanelTaskStatisicsSvg from '../../../../components/svg/panels/task-statisics.svg?raw'
import PanelWorkspaceSvg from '../../../../components/svg/panels/workspace.svg?raw'
import {
  getCombineSettingsLazy,
  getCombineSettingsUnsafe,
  updateUserSettings,
} from '../../../../modules/settings'
import type { CustomHomePanelsConfig } from '../../../../modules/settings/config'
import { HomePanelNames, HomePanelStrategyName } from '../../../../modules/settings/config'
import { AppToaster } from '../../../../utils'

export interface DndPanelProps {
  dragHandleProps?: DraggableProvidedDragHandleProps
  partCollapseProps: Partial<HFPanelCollapseProps>
}

export const getCollapseProps = (partCollapseProps: Partial<HFPanelCollapseProps>) => {
  return {
    enable: true,
    getDomContainer: (dom: HTMLElement) => {
      return dom.parentElement as HTMLElement
    },
    ...partCollapseProps,
  }
}

/**
 * hint: ATTENTION: 如何新增一个面板
 * 在 AllHomePanelNamesWithOrder、PanelMetaInfoMap、strategyConfig 中依次增加对应面板的配置，
 * 在 apps/studio/src/pages/home/biz-comps/DND/dndPanels.tsx 中增加配置
 * 然后验证
 *
 * hint: 这里目前只开启了 CurrentTrainings 面板，可以按需自行实现开启更多面板
 */
export const AllHomePanelNamesWithOrder = window.is_hai_studio
  ? [HomePanelNames.CurrentTrainings]
  : [
      HomePanelNames.CurrentTrainings,
      HomePanelNames.StorageUsage,
      HomePanelNames.Workspace,
      HomePanelNames.PathGuide,
      HomePanelNames.TaskAndPerformance,
    ]

export interface PanelMetaInfo {
  icon: string
  text: keyof typeof i18nKeys
  for: UserRole[]
}

export const PanelMetaInfoMap: Record<HomePanelNames, PanelMetaInfo> = {
  [HomePanelNames.CurrentTrainings]: {
    icon: PanelCurrentTrainingsSvg,
    text: i18nKeys.biz_home_scheduler,
    for: [UserRole.EXTERNAL, UserRole.INTERNAL],
  },
  [HomePanelNames.StorageUsage]: {
    icon: PanelStorageSvg,
    text: i18nKeys.biz_home_storage,
    for: [UserRole.EXTERNAL, UserRole.INTERNAL],
  },
  [HomePanelNames.Workspace]: {
    icon: PanelWorkspaceSvg,
    text: i18nKeys.biz_workspace,
    for: [UserRole.EXTERNAL],
  },
  [HomePanelNames.PathGuide]: {
    icon: PanelPathGuideSvg,
    text: i18nKeys.biz_path_guide,
    for: [UserRole.EXTERNAL],
  },
  [HomePanelNames.TaskAndPerformance]: {
    icon: PanelTaskStatisicsSvg,
    text: i18nKeys.biz_home_history_trainings,
    for: [UserRole.EXTERNAL, UserRole.INTERNAL],
  },
}

export const strategyConfig: Record<HomePanelStrategyName, CustomHomePanelsConfig> = {
  [HomePanelStrategyName.Default]: {
    /**
     * hai_studio 示例尚未支持完整的功能
     */
    displayPanels: window.is_hai_studio
      ? [HomePanelNames.CurrentTrainings]
      : [
          HomePanelNames.CurrentTrainings,
          HomePanelNames.StorageUsage,
          HomePanelNames.TaskAndPerformance,
          HomePanelNames.Workspace,
          HomePanelNames.PathGuide,
        ],
    collapsePanels: [],
    strategyName: HomePanelStrategyName.Default,
  },
  [HomePanelStrategyName.Custom]: {
    displayPanels: window.is_hai_studio
      ? [HomePanelNames.CurrentTrainings]
      : [
          HomePanelNames.CurrentTrainings,
          HomePanelNames.StorageUsage,
          HomePanelNames.TaskAndPerformance,
          HomePanelNames.Workspace,
          HomePanelNames.PathGuide,
        ],
    collapsePanels: [],
    strategyName: HomePanelStrategyName.Default,
  },
  [HomePanelStrategyName.StatisticFirst]: {
    displayPanels: [
      HomePanelNames.TaskAndPerformance,
      HomePanelNames.CurrentTrainings,
      HomePanelNames.StorageUsage,
    ],
    collapsePanels: [HomePanelNames.PathGuide, HomePanelNames.Workspace],
    strategyName: HomePanelStrategyName.StatisticFirst,
  },
  [HomePanelStrategyName.StorageFirst]: {
    displayPanels: [
      HomePanelNames.StorageUsage,
      HomePanelNames.PathGuide,
      HomePanelNames.Workspace,
      HomePanelNames.CurrentTrainings,
    ],
    collapsePanels: [HomePanelNames.TaskAndPerformance],
    strategyName: HomePanelStrategyName.StorageFirst,
  },
}

export interface StrategyInfo {
  name: HomePanelStrategyName
  display: keyof typeof i18nKeys
}

export const strategyList: StrategyInfo[] = [
  {
    name: HomePanelStrategyName.Default,
    display: i18nKeys.biz_home_dnd_order_first,
  },
  {
    name: HomePanelStrategyName.StatisticFirst,
    display: i18nKeys.biz_home_dnd_order_statistic_first,
  },
  {
    name: HomePanelStrategyName.StorageFirst,
    display: i18nKeys.biz_home_dnd_order_storage_first,
  },
  {
    name: HomePanelStrategyName.Custom,
    display: i18nKeys.biz_home_dnd_order_custom,
  },
]

export class DndConfigManager {
  getStrategies = () => {
    const userPanelsConfig = getCombineSettingsUnsafe().combineSettings.customHomePanelsConfig

    if (
      userPanelsConfig &&
      (userPanelsConfig.collapsePanels?.length || userPanelsConfig.displayPanels?.length)
    )
      return strategyList

    return strategyList.filter((config) => {
      return config.name !== HomePanelStrategyName.Custom
    })
  }

  getCurrentStrategyName = () => {
    const userPanelsConfig = getCombineSettingsUnsafe().combineSettings.customHomePanelsConfig

    if (!userPanelsConfig) {
      return HomePanelStrategyName.Default
    }

    return userPanelsConfig.strategyName
  }

  getConfigByStrategyName = (strategyName: HomePanelStrategyName): CustomHomePanelsConfig => {
    return strategyConfig[strategyName]
  }

  getNotIncludePanels = (userConfig: CustomHomePanelsConfig): HomePanelNames[] => {
    const allPanels = [...AllHomePanelNamesWithOrder]

    for (const panel of userConfig.displayPanels || []) {
      allPanels.splice(allPanels.indexOf(panel), 1)
    }

    for (const panel of userConfig.collapsePanels || []) {
      allPanels.splice(allPanels.indexOf(panel), 1)
    }

    return allPanels
  }

  getPanelsConfig = (): CustomHomePanelsConfig => {
    const getConf = () => {
      /**
       * 操作：
       * 1. 如果没有任何设置，全部返回默认的
       * 2. 如果设置了 strategyName，就以 strategyName 返回展开和折叠的 Panel
       * 3. 如果设置了自定义的展开和折叠：
       *    1. 找到没有展开也没有折叠的
       *    2. 把它放到第二个以及以后
       * */
      const userPanelsConfig = getCombineSettingsUnsafe().combineSettings.customHomePanelsConfig

      // 如果用户没有设置过，直接返回默认的就行了
      if (!userPanelsConfig) {
        return strategyConfig[HomePanelStrategyName.Default]
      }

      if (
        userPanelsConfig.strategyName &&
        userPanelsConfig.strategyName !== HomePanelStrategyName.Custom
      ) {
        return this.getConfigByStrategyName(userPanelsConfig.strategyName)
      }

      const notIncludePanels = this.getNotIncludePanels(userPanelsConfig)

      const displayPanels = [...(userPanelsConfig.displayPanels || [])]
      const collapsePanels = [...(userPanelsConfig.collapsePanels || [])]

      displayPanels.splice(1, 0, ...notIncludePanels)

      return {
        displayPanels,
        collapsePanels,
      }
    }

    // 返回前需要把拿到的结果过滤一下：处理设置里面有但是在 allpanel 里被删了的情况，以及处理内外部用户
    const filterFunc = (panel: HomePanelNames) => {
      const role = window._hf_user_if_in ? UserRole.INTERNAL : UserRole.EXTERNAL
      if (!AllHomePanelNamesWithOrder.includes(panel)) {
        return false
      }
      return PanelMetaInfoMap[panel].for.includes(role)
    }

    const ret = getConf()
    return {
      collapsePanels: ret.collapsePanels?.filter(filterFunc),
      displayPanels: ret.displayPanels?.filter(filterFunc),
      strategyName: ret.strategyName,
    }
  }

  updatePanelsToRemote = (customConfig: CustomHomePanelsConfig) => {
    let nextConfig: CustomHomePanelsConfig

    if (customConfig.strategyName !== HomePanelStrategyName.Custom) {
      // 非自定义的情况下，只改变一个策略名称就行了
      nextConfig = { ...getCombineSettingsUnsafe().combineSettings.customHomePanelsConfig }
      nextConfig.strategyName = customConfig.strategyName
    } else {
      nextConfig = { ...customConfig }
      // hint: 主页点击 custom，是没有其他参数的；自己拖拽的情况下，是有其他参数的
      if (!nextConfig.displayPanels && !nextConfig.collapsePanels) {
        nextConfig = {
          ...getCombineSettingsUnsafe().combineSettings.customHomePanelsConfig,
          ...customConfig,
        }
      }
    }

    return getCombineSettingsLazy()
      .then((settings) => {
        return updateUserSettings(
          JSON.stringify(
            {
              ...settings.userSettings,
              customHomePanelsConfig: nextConfig,
            },
            null,
            4,
          ),
        )
      })
      .then(() => {
        AppToaster.show({
          message: i18n.t(i18nKeys.biz_home_dnd_order_update_success),
          intent: 'success',
        })
        return nextConfig
      })
  }
}

export const GlobalDndConfigManager = new DndConfigManager()
