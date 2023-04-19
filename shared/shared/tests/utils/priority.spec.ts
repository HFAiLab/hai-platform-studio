import { describe, expect, it } from 'vitest'
import {
  TaskPriority,
  TaskPriorityName,
  isDeprecatedPriority,
  isDeprecatedPriorityName,
  priorityToName,
} from '../../src'

describe('shared > utils > priority', () => {
  describe('priorityToName', () => {
    const testCases: [TaskPriority, TaskPriorityName][] = [
      [TaskPriority.AUTO, TaskPriorityName.AUTO],
      [TaskPriority.LOW, TaskPriorityName.LOW],
      [TaskPriority.BELOW_NORMAL, TaskPriorityName.BELOW_NORMAL],
      [TaskPriority.NORMAL, TaskPriorityName.NORMAL],
      [TaskPriority.ABOVE_NORMAL, TaskPriorityName.ABOVE_NORMAL],
      [TaskPriority.HIGH, TaskPriorityName.HIGH],
      [TaskPriority.VERY_HIGH, TaskPriorityName.VERY_HIGH],
      [TaskPriority.EXTREME_HIGH, TaskPriorityName.EXTREME_HIGH],
    ]

    testCases.forEach(([source, expected]) => {
      it(`${source} -> ${expected}`, () => {
        expect(priorityToName(source)).toBe(expected)
      })
    })
  })

  describe('isDeprecatedPriority', () => {
    const testCases: [TaskPriority, boolean][] = [
      [TaskPriority.AUTO, false],
      [TaskPriority.LOW, true],
      [TaskPriority.BELOW_NORMAL, true],
      [TaskPriority.NORMAL, true],
      [TaskPriority.ABOVE_NORMAL, false],
      [TaskPriority.HIGH, false],
      [TaskPriority.VERY_HIGH, false],
      [TaskPriority.EXTREME_HIGH, false],
      [666 as TaskPriority, true],
    ]

    testCases.forEach(([source, expected]) => {
      it(`${source} -> ${expected}`, () => {
        expect(isDeprecatedPriority(source)).toBe(expected)
      })
    })
  })

  describe('isDeprecatedPriorityName', () => {
    const testCases: [TaskPriorityName, boolean][] = [
      [TaskPriorityName.AUTO, false],
      [TaskPriorityName.LOW, true],
      [TaskPriorityName.BELOW_NORMAL, true],
      [TaskPriorityName.NORMAL, true],
      [TaskPriorityName.ABOVE_NORMAL, false],
      [TaskPriorityName.HIGH, false],
      [TaskPriorityName.VERY_HIGH, false],
      [TaskPriorityName.EXTREME_HIGH, false],
      ['UNKNOWN' as TaskPriorityName, true],
    ]

    testCases.forEach(([source, expected]) => {
      it(`${source} -> ${expected}`, () => {
        expect(isDeprecatedPriorityName(source)).toBe(expected)
      })
    })
  })
})
