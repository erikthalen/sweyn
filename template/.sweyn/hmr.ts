import fs from 'node:fs'
import { registerRoute } from './routes.ts'

const dirs = [
  './',
  './app',
  './content',
  './public',
  './pages',
  './snippets',
  './layouts',
  './api',
]

registerRoute({
  route: '/hmr-update',
  handler: async (req, res) => {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    })

    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) return

      fs.watch(dir, (eventType, filename) => {
        if (filename === '.DS_Store') return
        console.clear()
        console.log('hmr reload:', filename)
        res.write('data: reload\n\n')
      })
    })
  },
})

export function injectHMR(htmlFileContent: string) {
  return htmlFileContent.replace(
    '<head>',
    `<head>
    <script type="module">
const source = new EventSource('/hmr-update')

const style = 'color: green; font-weight:bold; background: lightgreen; border-radius: 3px'

console.log('%c ' + 'Connected to HMR' + ' ', style)

source.onmessage = () => window.location.reload()
source.onerror = () => window.location.reload()
    </script>`
  )
}
