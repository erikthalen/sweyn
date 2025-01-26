import fs, { type FSWatcher } from 'node:fs'
import { WebSocketServer, WebSocket } from 'ws'
import { refreshAppVersion } from './index.ts'
import type { RouteHandler } from './types.ts'

const dirs = [
  './index.html',
  // './app',
  './dist',
  './public',
  './pages',
  './snippets',
  './layouts',
  '/api',
]

let wss: any = null
let watchers: FSWatcher[] | null = null

export function HMRServer() {
  wss = new WebSocketServer({ port: 8576 })

  wss.on('connection', function connection(ws: WebSocket) {
    ws.send('Connected to HMR')

    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) return

      const watcher = fs.watch(dir, (eventType, filename) => {
        if (filename === '.DS_Store') return
        refreshAppVersion()
        console.clear()
        console.log('hmr reload:', filename)
        ws.send('reload')
      })

      watchers?.push(watcher)
    })
  })
}

const HMRClient = `const connection = new WebSocket('ws://localhost:8576')
  connection.onmessage = e => {
    if (e.data === 'reload') {
      window.location.reload()
    } else if (e.data === 'close') {
      connection.close()
    } else {
      console.log(
        '%c ' + e.data + ' ',
        'color: green; font-weight:bold; background: lightgreen; border-radius: 3px'
      )
    }
  }
  connection.onclose = function () {
    window.location.reload()
  }`

export function injectHMR(str: string) {
  return str.replace(
    '<head>',
    `<head><script type="module">${HMRClient}</script>`
  )
}

export function withHMR(handler: RouteHandler) {
  if (process.env.NODE_ENV !== 'development') {
    return handler
  }

  if (typeof handler === 'string') {
    return injectHMR(handler)
  }

  return async (...args: any[]) => {
    // @ts-ignore
    const response = await handler(...args)
    return injectHMR(response)
  }
}

export function disconnectHMR() {
  if (wss) {
    wss.clients.forEach((ws: WebSocket) => {
      ws.send('close')
      ws.terminate()
    })
    wss.close()
  }

  if (watchers?.length) {
    watchers.forEach(watcher => {
      watcher.close()
    })

    watchers = null
  }
}

export function watchFilesAdded(onFileAdded: () => any) {
  const internalWatcher = fs.watch(
    './',
    { recursive: true },
    (eventType, filename) => {
      if (filename === '.DS_Store') return

      if (eventType === 'rename') {
        internalWatcher.close()
        onFileAdded()
      }
    }
  )
}
