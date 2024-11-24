import fs from 'node:fs'
import { WebSocketServer } from 'ws'
import { refreshAppVersion } from './index.ts'

const dirs = ['./app', './public', './pages', './snippets', './layouts', '/api']

export function HMRServer() {
  const wss = new WebSocketServer({ port: 8576 })

  wss.on('connection', function connection(ws) {
    ws.send('Connected to HMR')

    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) return

      fs.watch(dir, (eventType, filename) => {
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

export function injectHMR(str) {
  return str.replace(
    '<head>',
    `<head><script type="module">${HMRClient}</script>`
  )
}

export function withHMR(handler, { fromString = false } = {}) {
  if (process.env.NODE_ENV !== 'dev') {
    return handler
  }

  if (fromString) {
    return injectHMR(handler)
  }

  return async (...args) => {
    const response = await handler(...args)
    return injectHMR(response)
  }
}
