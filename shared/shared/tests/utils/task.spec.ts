import { describe, expect, it } from 'vitest'
import { TaskChainStatus, TaskQueueStatus, computeChainStatus } from '../../src'
import type { Task } from '../../src'

describe('shared > utils > task', () => {
  describe('computeChainStatus', () => {
    const testCases: [Partial<Task>, TaskChainStatus][] = [
      [
        {
          queue_status: TaskQueueStatus.FINISHED,
        },
        TaskChainStatus.FINISHED,
      ],
      [
        {
          queue_status: TaskQueueStatus.SCHEDULED,
        },
        TaskChainStatus.RUNNING,
      ],
      [
        {
          queue_status: TaskQueueStatus.SCHEDULED,
          id_list: [],
        },
        TaskChainStatus.RUNNING,
      ],
      [
        {
          queue_status: TaskQueueStatus.QUEUED,
          id_list: [],
        },
        TaskChainStatus.WAITING_INIT,
      ],
      [
        {
          queue_status: TaskQueueStatus.QUEUED,
          id_list: [1],
        },
        TaskChainStatus.WAITING_INIT,
      ],
      [
        {
          queue_status: TaskQueueStatus.QUEUED,
          id_list: [1, 2],
        },
        TaskChainStatus.SUSPENDED,
      ],
    ]

    testCases.forEach(([source, expected]) => {
      it(`${source} -> ${expected}`, () => {
        expect(computeChainStatus(source as Task)).toBe(expected)
      })
    })
  })
})
