import http from 'node:http'

export type RouteHandler = (
  req: http.IncomingMessage,
  res: http.ServerResponse,
  options?: Record<string, Record<string, string>>
) => void

export type Route = {
  method?: string
  route: string
  handler: RouteHandler
}

export type Config = {
  port?: number
  static?: string | string[]
  cms?: {
    cmsIndexRoot?: string
    login: string
    password: string
  }
  plugins?: ((req: http.IncomingMessage, res: http.ServerResponse) => void)[]
  routes?: Route[]
}