export enum SubOP {
  sub = 'sub',
  unsub = 'unsub',
}

export interface SubMeta<Q> {
  query: Q
  op?: SubOP
}

export interface IOResponse<T> {
  payload: {
    content: T
    changedKeys: string | string[]
    query: any
  }
}

export const FRONTIER_CONSTANTS = {
  FrontierForceRefresh: 'FrontierForceRefresh',
  FrontierVersion: 'FrontierVersion',
}
