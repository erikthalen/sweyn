import type {
  IncomingMessage,
  ServerResponse,
  RequestListener,
} from 'node:http'

export type Config = {
  root?: string
  port?: number
  HMRPort?: number
  static?: string | string[]
  analytics?: boolean
  admin?: {
    login: string
    password: string
  }
  plugins?: RequestListener[]
  routes?: Route[]
}

export type Route = {
  method?: string
  route: string
  handler: RouteHandler
}

export type RouteHandler = (
  req: IncomingMessage,
  res: ServerResponse,
  options?: Record<string, Record<string, string>>
) => any
