import { i18n, i18nKeys } from '@hai-platform/i18n'
import type { LayoutBase, LayoutData, TabGroup } from '@hai-platform/rc-dock/es'
import type { Chain } from '@hai-platform/studio-pages/lib'
import type { OpenURLInNewTabParams } from '@hai-platform/studio-pages/lib/entries/experiment2/schema/services'
import type { ChartBlockProps } from '@hai-platform/studio-pages/lib/entries/perf/widgets/ChartBlock'
import React from 'react'
import { ExpPage } from './biz-comps/exp'
import type { ExpContainerAPIProps } from './biz-comps/exp'
import { IframePage } from './biz-comps/iframe'
import { LogPage } from './biz-comps/log'
import { Perf } from './biz-comps/perf'
import { TrainingsPage } from './biz-comps/trainings'

interface GroupsType {
  [key: string]: TabGroup
}

export const MainGroups: GroupsType = {
  trainings: {
    floatable: false,
    maximizable: false,
    animated: false,
    // tabLocked: true
  },
}

export const ExpGroup: GroupsType = {
  exp: {
    floatable: false,
    maximizable: false,
    animated: false,
  },
}

export function getPerfDock(
  id: string,
  props: {
    addPerfDock: (props: ChartBlockProps) => void
    perfProps: ChartBlockProps
  },
) {
  return {
    id,
    content: <Perf addPerfDock={props.addPerfDock} perfProps={props.perfProps} />,
    title: (
      <span title={`${props.perfProps.chain.showName} - log`}>
        {props.perfProps.chain.showName} - Perf
      </span>
    ),
    closable: true,
    closeWhenMiddleClick: true,
    cached: true,
    group: 'trainings',
  }
}

export function getLogDock(props: { id: string; chain: Chain; rank: number }) {
  return {
    id: props.id,
    content: <LogPage chain={props.chain} key={props.chain.chain_id} rank={props.rank} />,
    title: <span title={`${props.chain.showName} - log`}>{props.chain.showName} - log</span>,
    closable: true,
    closeWhenMiddleClick: true,
    cached: true,
    group: 'trainings',
  }
}

export function getIframeDock(props: { id: string; urlParams: OpenURLInNewTabParams }) {
  return {
    id: props.id,
    content: <IframePage urlParams={props.urlParams} />,
    title: props.urlParams.name,
    closable: true,
    cached: true,
    group: 'trainings',
  }
}

const tab = {
  content: <div>Tab Content</div>,
  closable: true,
  closeWhenMiddleClick: true,
}

export const trainingsTabId = 'manager_trainings'
export const expTabId = 'exp_detail'

export function getMainLayout(props: {
  addLogDock: (chain: Chain, rank: number) => void
  changeExpByManager: (chain: Chain, rank: number) => void
  addPerfDock: (props: ChartBlockProps) => void
}) {
  const layout: LayoutData = {
    dockbox: {
      mode: 'vertical',
      children: [
        {
          id: 'tr',
          size: 2000,
          mode: 'vertical',
          tabs: [
            {
              group: 'trainings',
              ...tab,
              id: trainingsTabId,
              title: i18n.t(i18nKeys.biz_exp_training_history_title),
              content: (
                <TrainingsPage
                  addLogDock={props.addLogDock}
                  changeExpByManager={props.changeExpByManager}
                  addPerfDock={props.addPerfDock}
                />
              ),
              cached: true,
              closable: false,
            },
          ],
          // panelLock: {panelStyle: 'main'},
        },
      ],
    },
  }
  return layout
}

export function getRightLayout(props: { containerProps: ExpContainerAPIProps }) {
  const layout: LayoutData = {
    dockbox: {
      mode: 'horizontal',
      children: [
        {
          size: 1000,
          mode: 'vertical',
          id: 'ex',
          children: [
            {
              tabs: [
                {
                  group: 'exp',
                  id: expTabId,
                  content: <ExpPage containerProps={props.containerProps} />,
                  title: i18n.t(i18nKeys.biz_exp_experiment_detail_title),
                  closable: false,
                },
              ],
            },
          ],
        },
      ],
    },
  }
  return layout
}

export function getRight() {
  if (document.body.offsetWidth > 690) return 10
  return 10 + document.body.offsetWidth - 690
}

// 这里是直接把信息变成字符串然后去查了，这样比较稳定高效，不论什么方法，最终没有问题能实现的就是可以的方法~
export function computeVisibleLogIds(layoutData: LayoutBase) {
  const reg = /"activeId":"(.*?)"/g
  const layoutDataString = JSON.stringify(layoutData)

  const activeIds: string[] = []
  let matchItem = reg.exec(layoutDataString)
  while (matchItem) {
    if (/-log/.test(matchItem[1]!)) activeIds.push(matchItem[1]!)
    matchItem = reg.exec(layoutDataString)
  }

  return activeIds
}

export function updateTabActiveStyle(dom: Element) {
  if (dom) {
    if (dom.classList.contains('highlight-tab')) {
      dom.classList.remove('highlight-tab')
      const color_id = dom.getAttribute('color_id')
      clearTimeout(Number(color_id))
    }
    setTimeout(() => {
      dom.classList.add('highlight-tab')
      const color_id = setTimeout(() => {
        dom.classList.remove('highlight-tab')
      }, 6000)
      dom.setAttribute('color_id', `${color_id}`)
    })
  }
}
