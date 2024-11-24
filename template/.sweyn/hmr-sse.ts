import fs from 'node:fs'
import { registerRoute } from './routes.ts'
import { refreshAppVersion } from './index.ts'

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

let response = null

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) return

  fs.watch(dir, (eventType, filename) => {
    if (filename === '.DS_Store') return
    console.clear()
    console.log('hmr reload:', filename)

    refreshAppVersion()

    if (response) {
      response.write('data: reload\n\n')
    }
  })
})

registerRoute({
  route: '/hmr-update',
  handler: (req, res) => {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    })

    req.on("close", function() {
      // request closed unexpectedly
      console.log('CLOSE')
      res.end()
    });
    
    req.on("end", function() {
      // request ended normally
      console.log('END')
    });

    response = res
    // return 'hej'
  },
})

let i = 0

export function injectHMR(fileContent: string) {
  console.log('INJECTING HMR', i++)
  return fileContent.replace(
    '<head>',
    `<head>
    <script type="module">
const source = new EventSource('/hmr-update')
const style = 'color: green; font-weight:bold; background: lightgreen; border-radius: 3px'
console.log('%c ' + 'Connected to HMR' + ' ', style)
source.onmessage = () => window.location.reload()
// source.onerror = () => window.location.reload()
    </script>`
  )
}
