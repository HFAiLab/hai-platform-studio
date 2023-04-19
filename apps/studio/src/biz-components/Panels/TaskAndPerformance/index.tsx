import { UserRole } from '@hai-platform/shared'
import React from 'react'
import { ExternalUsageSummary } from './ExternalUsageSummary'
import { RangeStatistics } from './RangeStatistics'
import './index.scss'

export const TaskAndPerformance = () => {
  const role = window._hf_user_if_in ? UserRole.INTERNAL : UserRole.EXTERNAL
  return (
    <div className="task-and-performance-container">
      {role === UserRole.EXTERNAL && <ExternalUsageSummary />}
      <RangeStatistics role={role} />
    </div>
  )
}
