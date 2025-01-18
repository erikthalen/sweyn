import type { ReadStream } from 'node:fs'
import type {
  IncomingMessage,
  ServerResponse,
  RequestListener,
} from 'node:http'

export type Config = {
  root?: string
  port?: number
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
  handler: RouteHandler | string
}

export type RoutesOfMethod = Map<string, RouteHandler | string>

export type Routes = Map<string, RoutesOfMethod>

export type RouteHandlerOptions = Record<string, Record<string, string>>

export type RouteHandler = (
  req: IncomingMessage,
  res: ServerResponse,
  options?: RouteHandlerOptions
) => any

export type cmsConfig = {
  contentRoot?: string
  sweynRoot?: string
  username: string
  password: string
}
