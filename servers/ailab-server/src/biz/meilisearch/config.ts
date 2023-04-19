import { MeiliSearch } from 'meilisearch'
import { GlobalConfig } from '../../config'

export const GlobalMeiliSearchClient =
  GlobalConfig.STUDIO_MEILI_SEARCH_KEY && GlobalConfig.STUDIO_MEILI_SEARCH_URL
    ? new MeiliSearch({
        // online 和本地测试集群要分开
        host: GlobalConfig.STUDIO_MEILI_SEARCH_URL,
        apiKey: GlobalConfig.STUDIO_MEILI_SEARCH_KEY,
      })
    : null

export enum MeiliIndexConsts {
  XTOPIC = 'xtopic',
}
