/**
 * 目前来说，我们的 bff 请求 server 都统一增加了这个禁用缓存字段
 *
 * 但是客户端的请求，出于避免请求量太大，大部分请求都没有这个字段的
 */
export const HFNoCacheHeader = {
  'X-HF-Cache-Control': 'no-cache',
}
