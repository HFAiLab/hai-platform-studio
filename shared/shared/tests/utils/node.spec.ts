import { describe, expect, it } from 'vitest'
import type { Node } from '../../src'
import {
  NodeCurrentCategory,
  NodeCurrentStatus,
  NodeStatus,
  TaskTaskType,
  computeNodeCurrentStatus,
} from '../../src'

describe('shared > utils > node', () => {
  describe('computeNodeCurrentStatus', () => {
    const testCases: [Partial<Node>, NodeCurrentStatus][] = [
      [
        {
          current_category: NodeCurrentCategory.DEV,
          status: NodeStatus.READY,
          working: null,
        },
        NodeCurrentStatus.DEV,
      ],
      [
        {
          current_category: NodeCurrentCategory.ERR,
          status: NodeStatus.READY,
          working: null,
        },
        NodeCurrentStatus.ERR,
      ],
      [
        {
          current_category: NodeCurrentCategory.EXCLUSIVE,
          status: NodeStatus.READY,
          working: null,
        },
        NodeCurrentStatus.EXCLUSIVE,
      ],
      [
        {
          current_category: NodeCurrentCategory.RELEASE,
          status: NodeStatus.READY,
          working: null,
        },
        NodeCurrentStatus.RELEASE,
      ],
      [
        {
          current_category: NodeCurrentCategory.SERVICE,
          status: NodeStatus.READY,
          working: null,
        },
        NodeCurrentStatus.SERVICE,
      ],
      [
        {
          current_category: NodeCurrentCategory.TRAINING,
          status: NodeStatus.READY,
          working: null,
        },
        NodeCurrentStatus.TRAINING_FREE,
      ],
      [
        {
          current_category: NodeCurrentCategory.TRAINING,
          status: NodeStatus.READY,
          working: TaskTaskType.TRAINING_TASK,
        },
        NodeCurrentStatus.TRAINING_WORKING,
      ],
      [
        {
          current_category: NodeCurrentCategory.TRAINING,
          status: NodeStatus.NOT_READY,
          working: null,
        },
        NodeCurrentStatus.TRAINING_UNSCHEDULABLE,
      ],
      [
        {
          current_category: NodeCurrentCategory.TRAINING,
          status: NodeStatus.SCHEDULING_DISABLED,
          working: null,
        },
        NodeCurrentStatus.TRAINING_UNSCHEDULABLE,
      ],
    ]

    testCases.forEach(([source, expected]) => {
      it(`${source} -> ${expected}`, () => {
        expect(computeNodeCurrentStatus(source as Node)).toBe(expected)
      })
    })
  })
})
