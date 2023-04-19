export const shortNodeName = (name?: string | null): string | null | undefined => {
  if (!name) {
    return null
  }
  const a = name.split('-')
  // eslint-disable-next-line no-nested-ternary
  return a.length === 3
    ? a[1] === 'rank'
      ? 'hfai' // External user
      : a[1]
    : name
}

interface INodeNetwork {
  scheduleZone: string | null
  leaf: string | null
  spine: string | null
}

let nodeNetworkMetaMap = {} as {
  [name: string]: INodeNetwork
}
let shortNodeNetworkMetaMap = {} as {
  [name: string]: INodeNetwork
}

const STORAGE_KEY = '__network_meta_map'

function saveToLocalStorage() {
  try {
    const origin = JSON.stringify(nodeNetworkMetaMap)
    const rev = btoa(origin).split('').reverse().join('')
    window.localStorage.setItem(STORAGE_KEY, rev)
  } catch (e) {
    console.error('Error: save network meta failed.')
  }
}

export function setNodeMeta(
  node: string,
  leaf: string | null,
  spine: string | null,
  scheduleZone: string | null,
): void {
  if (node.includes('dev') || node.includes('k8s')) {
    return
  }
  const meta = {
    leaf,
    spine,
    scheduleZone: scheduleZone || '-',
  }
  nodeNetworkMetaMap[node] = meta
  const short = shortNodeName(node)
  if (short) shortNodeNetworkMetaMap[short] = meta
}

function loadFromLocalStorage() {
  try {
    const d = window.localStorage.getItem(STORAGE_KEY)
    if (d) {
      const rev = d.split('').reverse().join('')
      const map = JSON.parse(atob(rev))
      for (const node in map) {
        const meta = map[node]
        setNodeMeta(node, meta?.leaf ?? null, meta?.spine ?? null, meta?.scheduleZone ?? null)
      }
    }
  } catch (e) {
    console.error('Error: save network meta failed.')
  }
}

export function save() {
  saveToLocalStorage()
}
export function clear() {
  nodeNetworkMetaMap = {}
  shortNodeNetworkMetaMap = {}
}

interface IPodLite {
  node?: string | null | undefined
  [name: string]: any
}

export enum MetaType {
  all = 'all',
  leaf = 'leaf',
  spine = 'spine',
  scheduleZone = 'scheduleZone',
}

/* eslint-disable-next-line */
export function getMeta(
  nodeName: string | undefined | null,
  type: MetaType.all,
): INodeNetwork | null
/* eslint-disable-next-line */
export function getMeta(
  nodeName: string | undefined | null,
  type: MetaType.leaf | MetaType.spine | MetaType.scheduleZone,
): string | null
/* eslint-disable-next-line */
export function getMeta(
  nodeName: string | undefined | null,
  type: MetaType,
): (string | INodeNetwork) | null {
  if (!nodeName) {
    return null
  }
  let target
  if (nodeName.includes('-')) {
    target = nodeNetworkMetaMap
  } else {
    target = shortNodeNetworkMetaMap
  }

  let m
  let n
  switch (type) {
    case MetaType.all:
      return target[nodeName] ?? null
    case MetaType.leaf:
      m = target[nodeName]
      return m ? m.leaf : null
    case MetaType.spine:
      n = target[nodeName]
      return n ? n.spine : null
    case MetaType.scheduleZone:
      n = target[nodeName]
      return n ? n.scheduleZone : null
    default:
      return null
  }
}

loadFromLocalStorage()

export function getMetaList(
  a: Array<IPodLite>,
  type: MetaType.leaf | MetaType.spine | MetaType.scheduleZone,
): Array<string | null> {
  return [...new Set(a.map((item) => getMeta(`${item.node}`, type)).filter((v) => v !== null))]
}
