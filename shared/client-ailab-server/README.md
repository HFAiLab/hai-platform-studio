# @hai-platform/client-ailab-server

> 请求 AILab Server 使用的 Client Package

## Usage

```sh
pnpm i @hai-platform/client-ailab-server
```

```ts
import {
  AilabServerApiName,
  createHttpRequest,
  createAilabServerClient,
} from '@hai-platform/client-ailab-server'

// 创建 client 实例
const ailabServerClient = createAilabServerClient({
  // createHttpRequest 提供默认的 httpRequest 方法，也可以根据实际情况传入自定义的实现
  httpRequest: createHttpRequest(),
})

// 通过 request 方法和对应接口名称发送请求
const currentTaskInfo = await ailabServerClient.request(
  AilabServerApiName.TRAININGS_CURRENT_TASK_INFO,
  {
    token: 'XXX',
  },
)
```
