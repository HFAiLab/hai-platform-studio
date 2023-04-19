export enum TokenPosition {
  header = 'header',
  url = 'url',
  body = 'body',
  queryPath = 'queryPath',
}

export interface TokenConfig {
  position: TokenPosition
  prefix?: string
  suffix?: string
}
