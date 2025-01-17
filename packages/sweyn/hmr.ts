import fs, { type FSWatcher } from 'node:fs'
import { registerRoute } from './routes.ts'
import { refreshAppVersion } from './index.ts'
import type { IncomingMessage, ServerResponse } from 'node:http'

const dirs = [
  './index.html',
  './app',
  './public',
  './pages',
  './snippets',
  './layouts',
  '/api',
]

let response: ServerResponse<IncomingMessage> | null = null
let watchers: FSWatcher[] = []

export function initHRM() {
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) return

    const watcher = fs.watch(dir, (eventType, filename) => {
      if (filename === '.DS_Store') return
      console.clear()
      console.log('hmr reload:', filename)

      refreshAppVersion()

      if (response) {
        response.write('data: reload\n\n')
      }
    })

    watchers.push(watcher)
  })

  registerRoute({
    route: '/hmr-update',
    handler: (req, res) => {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      })

      req.on('close', function () {
        // request closed unexpectedly
        res.end()
        response = null
      })

      req.on('end', function () {
        // request ended normally
        res.end()
        response = null
      })

      response = res
    },
  })
}

export function destroyHRM() {
  watchers.forEach(watcher => watcher.close())
  response = null
}

export function injectHMR(fileContent: string) {
  return fileContent.replace(
    '<head>',
    `<head>
    <script type="module">
const source = new EventSource('/hmr-update')

const style = 'color: green; font-weight:bold; background: lightgreen; border-radius: 3px'
console.log('%c ' + 'Connected to HMR' + ' ', style)

source.onmessage = () => window.location.reload()
source.onerror = (error) => window.location.reload()
    </script>`
  )
}

export function watchFilesAdded(onFileAdded: () => unknown) {
  const internalWatcher = fs.watch(
    './',
    { recursive: true },
    (eventType, filename) => {
      if (filename === '.DS_Store') return
      if (eventType !== 'rename') return

      internalWatcher.close()

      if (response) {
        response.end()
      }

      onFileAdded()
    }
  )
}
