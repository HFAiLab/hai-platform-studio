export interface WhiteListCheckerMap {
  [key: string]: {
    // urllib.URL
    checker(url: { pathname: string }): boolean
  }
}

export const getProxyWhiteList = (): WhiteListCheckerMap => {
  return {
    // 这里补充可以通过 proxy 的地址
  }
}
