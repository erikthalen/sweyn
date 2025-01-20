import fs, { type FSWatcher } from 'node:fs'
import { WebSocketServer, WebSocket } from 'ws'
import { refreshAppVersion } from './index.ts'
import type { RouteHandler } from './types.ts'

const dirs = [
  './index.html',
  './app',
  './public',
  './pages',
  './snippets',
  './layouts',
  '/api',
]

let wss: any = null
let watcher: FSWatcher | null = null

export function HMRServer() {
  wss = new WebSocketServer({ port: 8576 })

  wss.on('connection', function connection(ws: WebSocket) {
    ws.send('Connected to HMR')

    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) return

      watcher = fs.watch(dir, (eventType, filename) => {
        if (filename === '.DS_Store') return
        refreshAppVersion()
        console.clear()
        console.log('hmr reload:', filename)
        ws.send('reload')
      })
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
  if (process.env.NODE_ENV !== 'dev') {
    return handler
  }

  if (typeof handler === 'string') {
    return injectHMR(handler)
  }

  return async (...args: any[]) => {
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

  if (watcher) {
    watcher.close()
    watcher = null
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
