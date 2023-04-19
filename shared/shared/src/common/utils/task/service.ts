import { ContainerTaskStatus } from '../../types'

export const JupyterTaskStatusColorMap = {
  [ContainerTaskStatus.STOPPED]: '#abb3bf',
  [ContainerTaskStatus.FINISHED]: '#abb3bf',
  [ContainerTaskStatus.QUEUED]: '#ff9800',
  [ContainerTaskStatus.CREATED]: '#1e81b0',
  [ContainerTaskStatus.BUILDING]: '#1e81b0',
  [ContainerTaskStatus.TERMINATING]: '#1e81b0',
  [ContainerTaskStatus.RUNNING]: '#4caf50',
}

export const BuiltinServiceList = ['jupyter', 'ssh']

export const BuiltinServiceListExternal = ['jupyter']
