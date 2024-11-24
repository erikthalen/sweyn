import { IncomingMessage, ServerResponse } from 'node:http'

export type RouteHandler = (
  req: IncomingMessage,
  res: ServerResponse,
  options?: Record<string, Record<string, string>>
) => any

export type Route = {
  method?: string
  route: string
  handler: RouteHandler
}

export type Config = {
  root?: string
  port?: number
  HMRPort?: number
  static?: string | string[]
  admin?: {
    login: string
    password: string
  }
  plugins?: ((req: IncomingMessage, res: ServerResponse) => unknown)[]
  routes?: Route[]
}
