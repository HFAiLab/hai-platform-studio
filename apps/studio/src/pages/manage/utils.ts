export function getLogDockIdByChainId(chainId: string): string {
  return `${chainId}-log`
}

export function getPerfDockIdByChainId(chainId: string): string {
  return `${chainId}-perf`
}

export function checkIsLogTabByTabId(id: string) {
  return !!/-log$/.test(id)
}

export function checkIsPerfTabByTabId(id: string) {
  return !!/-perf$/.test(id)
}

export function getIdByTabId(id: string) {
  if (checkIsLogTabByTabId(id)) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return /^(.*?)-log$/.exec(id)![1]!
  }
  if (checkIsPerfTabByTabId(id)) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return /^(.*?)-perf$/.exec(id)![1]!
  }

  return null
}
