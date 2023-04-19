/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable react/jsx-props-no-spreading */
import { useRefState } from '@hai-platform/studio-pages/lib/hooks/useRefState'
import classNames from 'classnames'
import React, { useCallback, useState } from 'react'
import type { DraggingStyle, DropResult, NotDraggingStyle } from 'react-beautiful-dnd'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'
import { useEffectOnce } from 'react-use/esm'
import { GlobalPanelController } from '../../../../components/HFPanel/controller'
import { WebEventsKeys, hfEventEmitter } from '../../../../modules/event'
import type { CustomHomePanelsConfig, HomePanelNames } from '../../../../modules/settings/config'
import { HomePanelStrategyName } from '../../../../modules/settings/config'
import { AilabCountly, CountlyEventKey } from '../../../../utils/countly'
import { CollapseCard } from '../CollapseCard/index'
import { GlobalDndConfigManager } from './dndConfig'
import { DNDPanelsMap } from './dndPanels'

import './index.scss'

export interface PanelMeta {
  id: string
}

const grid = 20

const getListStyle = (isDraggingOver: boolean) => ({
  background: isDraggingOver ? 'var(--hf-ui-highlight-bg)' : 'transparent',
  padding: 0,
  width: 1008,
})

const getItemStyle = (
  isDragging: boolean,
  draggableStyle: DraggingStyle | NotDraggingStyle | undefined,
) => ({
  // some basic styles to make the items look a bit nicer
  // userSelect: 'none',
  margin: `0 0 ${grid}px 0`,

  // change background colour if dragging
  background: isDragging ? 'var(--hf-ui-highlight-bg)' : 'white',

  // styles we need to apply on draggables
  ...draggableStyle,
})

// 部分拖拽
// https://github.com/atlassian/react-beautiful-dnd/issues/1714

export interface HomeDNDProps {
  onStrategyChangeToCustom: () => void
}

export const HomeDND = (props: HomeDNDProps) => {
  const [panels, panelsRef, updatePanels] = useRefState(GlobalDndConfigManager.getPanelsConfig())
  const [isDragging, setIsDragging] = useState<boolean>(false)

  const dndUpdatePanelsToRemote = (customConfig: CustomHomePanelsConfig) => {
    return GlobalDndConfigManager.updatePanelsToRemote({
      displayPanels: customConfig.displayPanels,
      collapsePanels: customConfig.collapsePanels,
      strategyName: HomePanelStrategyName.Custom,
    }).then((nextConfig) => {
      props.onStrategyChangeToCustom()
      return nextConfig
    })
  }

  const reorder = (list: HomePanelNames[], startIndex: number, endIndex: number) => {
    const result = Array.from(list)
    const [removed] = result.splice(startIndex, 1)
    if (removed) {
      result.splice(endIndex, 0, removed)
    }
    return [...result]
  }

  const onDragStart = () => {
    setIsDragging(true)
  }

  const onDragEnd = useCallback(
    (result: DropResult) => {
      setIsDragging(false)
      const { destination, source } = result
      if (!destination) {
        return
      }
      if (source.index === destination.index) {
        // 源和目标相同，说明排序没有发生变化，不做操作
        return
      }
      const nextDisplayPanels = reorder(panels.displayPanels || [], source.index, destination.index)
      const nextPanels = {
        ...panels,
        displayPanels: nextDisplayPanels,
      }
      updatePanels(nextPanels)
      dndUpdatePanelsToRemote(nextPanels)
      AilabCountly.safeReport(CountlyEventKey.dndUpdateByDrag)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [panels],
  )

  /**
   * 开始点击折叠按钮，开始动画：
   * Q: 为什么这个时候就更新 collapsePanels：
   * A: 因为这个时候底部也应该有动画，也应该展示
   *
   * 但是这个 updatePanels 并没有更新远程的！
   */
  const onCollapseBegin = (panelName: HomePanelNames) => {
    const collapsePanels = panels.collapsePanels || []
    collapsePanels.unshift(panelName)
    updatePanels({
      ...panels,
      collapsePanels: [...new Set(collapsePanels)],
    })
    AilabCountly.safeReport(CountlyEventKey.dndUpdateByCollapse, {
      segmentation: {
        panelName,
      },
    })
  }

  /**
   * 结束点击折叠按钮，结束动画
   * 这个时候同步到远程
   */
  const onCollapseEnd = (panelName: HomePanelNames) => {
    const displayPanels = panels.displayPanels || []
    displayPanels.splice(displayPanels.indexOf(panelName), 1)
    const nextPanels = {
      ...panels,
      strategyName: undefined,
      displayPanels: [...new Set(displayPanels)],
    }
    updatePanels(nextPanels)
    dndUpdatePanelsToRemote(nextPanels)
  }

  const onCollapseCardClick = useCallback((panelName: HomePanelNames) => {
    const displayPanels = panelsRef.current.displayPanels || []
    const collapsePanels = panelsRef.current.collapsePanels || []
    collapsePanels.splice(collapsePanels.indexOf(panelName), 1)
    displayPanels.push(panelName)

    const nextPanels = {
      strategyName: undefined,
      displayPanels: [...new Set(displayPanels)],
      collapsePanels: [...new Set(collapsePanels)],
    }
    updatePanels(nextPanels)
    dndUpdatePanelsToRemote(nextPanels)
    GlobalPanelController.addEnterLoadingPanel(panelName)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const resetStrategyByconfig = () => {
    updatePanels(GlobalDndConfigManager.getPanelsConfig())
  }

  useEffectOnce(() => {
    hfEventEmitter.on(WebEventsKeys.homeDNDStrategyChange, resetStrategyByconfig)
    return () => {
      hfEventEmitter.off(WebEventsKeys.homeDNDStrategyChange, resetStrategyByconfig)
    }
  })

  return (
    <div className="dnd-container">
      <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
        <Droppable droppableId="home-droppable">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              style={getListStyle(snapshot.isDraggingOver)}
            >
              {(panels.displayPanels || []).map((panelName, index) => {
                return (
                  <Draggable key={panelName} draggableId={`${panelName}`} index={index}>
                    {(provided2, snapshot2) => {
                      const onCollapseBeginWithParams = () => {
                        onCollapseBegin(panelName)
                      }
                      const onCollapseEndWithParams = () => {
                        onCollapseEnd(panelName)
                      }

                      return (
                        <div
                          className={classNames('drag-outer-panel', `id${panelName}`)}
                          ref={provided2.innerRef}
                          {...provided2.draggableProps}
                          style={getItemStyle(snapshot2.isDragging, provided2.draggableProps.style)}
                        >
                          {DNDPanelsMap[panelName].render({
                            dragHandleProps: provided2.dragHandleProps
                              ? provided2.dragHandleProps
                              : undefined,
                            partCollapseProps: {
                              onBegin: onCollapseBeginWithParams,
                              onEnd: onCollapseEndWithParams,
                            },
                          })}
                        </div>
                      )
                    }}
                  </Draggable>
                )
              })}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      {!isDragging && (
        <div className="collapse-card-container">
          {(panels.collapsePanels || []).map((panel) => {
            return <CollapseCard key={panel} panelName={panel} onClick={onCollapseCardClick} />
          })}
        </div>
      )}
    </div>
  )
}
