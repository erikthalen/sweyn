# Config

::: code-group

```ts [server.config.ts]
import { createServer } from './.sweyn/index.ts'

createServer(config?: Config)
```

:::

```ts
type Route = {
  method?: string
  route: string
  handler: (
    req: http.IncomingMessage,
    res: http.ServerResponse,
    options: Record<string, unknown>
  ) => void
}

type Config = {
  port?: number
  hmrPort?: number
  static?: string | string[]
  admin?: {
    login: string
    password: string
  }
  plugins?: ((req: http.IncomingMessage, res: http.ServerResponse) => void)[]
  routes?: Route[]
}
```
