# @hai-platform/client-api-server

> 请求 Api Server 使用的 Client Package

## Usage

```sh
pnpm i @hai-platform/client-api-server
```

```ts
import {
  ApiServerApiName,
  createHttpRequest,
  createApiServerClient,
} from '@hai-platform/client-api-server'

// 创建 client 实例
const apiServerClient = createApiServerClient({
  // createHttpRequest 提供默认的 httpRequest 方法，也可以根据实际情况传入自定义的实现
  httpRequest: createHttpRequest(),
})
```
