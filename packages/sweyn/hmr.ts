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
let responses: ServerResponse<IncomingMessage>[] = []
let watchers: FSWatcher[] = []

export function initHRM() {
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) return

    const watcher = fs.watch(dir, (eventType, filename) => {
      if (filename === '.DS_Store') return

      console.log('hmr reload:', filename)

      refreshAppVersion()

      if (response && !response.closed) {
        response.write('data: reload\n\n')
        response.end()
      }
    })

    watchers.push(watcher)
  })

  registerRoute({
    route: '/hmr-update',
    handler: (req, res) => {
      response?.end()

      res.writeHead(200, {
        'Content-Type': 'text/html',
        'Transfer-Encoding': 'chunked',
      })

      console.log('connect')

      response = res
    },
  })
}

export function destroyHRM() {
  watchers.forEach(watcher => watcher.close())
  responses = []
}

export function injectHMR(fileContent: string) {
  return fileContent.replace(
    '<head>',
    `<head>
    <script type="module">
    try {
      const style = 'color: green; font-weight:bold; background: lightgreen; border-radius: 3px'
      console.log('%c ' + 'Connected to HMR' + ' ', style)
  
      const res = await fetch('/hmr-update')
      const text = await res.text()
      console.log(text)
  
      window.location.reload()
    } catch (error) {
      console.log(error)
    }
    </script>`
  )
}
// export function injectHMR(fileContent: string) {
//   return fileContent.replace(
//     '<head>',
//     `<head>
//     <script type="module">
// const source = new EventSource('/hmr-update')

// const style = 'color: green; font-weight:bold; background: lightgreen; border-radius: 3px'
// console.log('%c ' + 'Connected to HMR' + ' ', style)

// source.onmessage = (e) => {
// console.log('data:', e)
// // window.location.reload()
// }
// // source.onerror = (error) => {
// // // window.location.reload()
// // console.log(error)
// //   }
// source.onend = () => {
// source.close()
// console.log('close')
//   }
//     </script>`
//   )
// }

export function watchFilesAdded(onFileAdded: () => unknown) {
  const internalWatcher = fs.watch(
    './',
    { recursive: true },
    (eventType, filename) => {
      if (filename === '.DS_Store') return
      if (eventType !== 'rename') return

      internalWatcher.close()

      responses.forEach(response => {
        if (response) {
          console.log('watched files change')
          response.end()
        }
      })

      onFileAdded()
    }
  )
}
