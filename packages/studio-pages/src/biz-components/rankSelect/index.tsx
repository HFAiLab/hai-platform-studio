import type { Pod } from '@hai-platform/shared'
import { Button, MenuItem } from '@hai-ui/core/lib/esm/components'
import { Select } from '@hai-ui/select/lib/esm/'
import React from 'react'

export type IPod = Pod & { rank: number }
const RankSelect = Select.ofType<IPod>()
export interface IRankSelectWrapper {
  pods: Array<IPod>
  currentRank: number
  onItemSelect: (rank: number) => void
  className?: string
}

export const RankSelectWrapper: React.FC<IRankSelectWrapper> = ({
  pods,
  currentRank,
  onItemSelect,
  className,
}) => {
  return (
    <RankSelect
      className={className}
      items={pods}
      // eslint-disable-next-line react/no-unstable-nested-components
      itemRenderer={(pod, { handleClick, modifiers }) => {
        if (!modifiers.matchesPredicate) {
          return null
        }
        const text = `${pod.rank}-${pod.node}`
        return (
          <MenuItem
            active={modifiers.active}
            disabled={modifiers.disabled}
            label={pod.status === 'failed' ? 'FAILED' : undefined}
            key={pod.rank}
            onClick={handleClick}
            text={text}
          />
        )
      }}
      itemPredicate={(query, pod, _index, exactMatch) => {
        const normalizedTitle = (pod.node || '').toLowerCase()
        const normalizedQuery = query.toLowerCase()

        if (exactMatch) {
          return normalizedTitle === normalizedQuery
        }
        // 这里 failed 不能填大写，因为搜索字符串被 toLowerCase 了
        return (
          `${pod.rank} ${normalizedTitle} ${pod.status === 'failed' ? 'failed' : ''}`.indexOf(
            normalizedQuery,
          ) >= 0
        )
      }}
      onItemSelect={(item) => onItemSelect(item.rank)}
      activeItem={pods[currentRank]}
      popoverProps={{ minimal: true }}
    >
      <Button
        rightIcon="caret-down"
        text={
          pods[currentRank]
            ? `${pods[currentRank]!.rank}-${pods[currentRank]!.node}`
            : '(No selection)'
        }
        small
      />
    </RankSelect>
  )
}
