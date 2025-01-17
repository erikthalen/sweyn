import fs from 'node:fs'
import fsPromise from 'node:fs/promises'
import path from 'node:path'
import { registerRoute } from './routes.ts'
import { readBody } from './server.ts'
import { renderVariables } from './renderer.ts'
import { authenticate } from './utils.ts'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { cmsConfig, RouteHandlerOptions } from './types.ts'

let contentRoot = './'
let sweynRoot = '.sweyn'

async function saveFile(req: IncomingMessage) {
  try {
    const body = await readBody(req)
    const { filename, content } = Object.fromEntries(
      body.split('&').map(part => part.split('='))
    )

    fs.mkdirSync('.' + path.dirname(filename), {
      recursive: true,
    })

    const decodedContent = decodeURIComponent(content.replaceAll('+', ' '))

    fs.writeFileSync(
      path.join('.', contentRoot, filename.replaceAll(' ', '-') + '.md'),
      decodedContent
    )

    return `Saved ${filename} successfully`
  } catch (error) {
    console.log(error)
  }
}

function getFilepath(filename: string) {
  return path.join('.', contentRoot, filename + '.md')
}

export function createCms(options: cmsConfig) {
  contentRoot = options.contentRoot || './content'

  if (options.sweynRoot) {
    sweynRoot = options.sweynRoot
  }

  async function renderCms(
    req: IncomingMessage,
    res: ServerResponse,
    opts?: RouteHandlerOptions
  ) {
    authenticate(req, res, options)
    res.setHeader('Content-Type', 'text/html')
    const index = await fsPromise.readFile(path.join(sweynRoot, 'cms.html'))

    try {
      await fsPromise.readdir(`${contentRoot}`)
    } catch (error) {
      await fsPromise.mkdir(`${contentRoot}`)
    }

    const pages = await fsPromise.readdir(`${contentRoot}`, {
      encoding: 'utf8',
    })

    const menu = pages
      .map(page => {
        return `<div><a href="/admin/${page.replace('.md', '')}">${page}</a>
          <form action="/admin/api/delete">
            <input type="hidden" value="${page}" name="page">
            <input type="submit" value="Delete">
          </form></div>`
      })
      .join('')

    return renderVariables(index.toString(), {
      pages: menu,
      content: getContent(opts?.route.page),
      filename: opts?.route.page,
    })
  }

  registerRoute({
    route: '/admin',
    handler: renderCms,
  })

  registerRoute({
    route: '/admin/[page]',
    handler: renderCms,
  })

  registerRoute({
    route: '/admin/api/pages',
    handler: (req, res) => {
      authenticate(req, res, options)
      return fs.readdirSync(`.${contentRoot}`, { encoding: 'utf8' })
    },
  })

  registerRoute({
    route: '/admin/api/content',
    handler: (req, res) => {
      authenticate(req, res, options)
      const { searchParams } = new URL('http://foo.com' + req.url)
      const filename = searchParams.get('page')

      if (filename) {
        return getContent(filename)
      }
    },
  })

  registerRoute({
    route: '/admin/api/delete',
    handler: (req, res) => {
      authenticate(req, res, options)
      const { searchParams } = new URL('http://foo.com' + req.url)
      const filename = searchParams.get('page') || ''
      const filepath = path.join('.', contentRoot, filename)
      fs.unlinkSync(filepath)

      res.writeHead(301, { Location: '/admin' }).end()
    },
  })

  registerRoute({
    route: '/admin/api/new',
    handler: (req, res) => {
      authenticate(req, res, options)

      const { searchParams } = new URL('http://foo.com' + req.url)
      const filename = searchParams.get('filename')?.replaceAll(' ', '-')
      fs.writeFileSync(
        path.join('.', contentRoot, filename + '.md'),
        '# Start typing...'
      )
      res.writeHead(301, { Location: '/admin/' + filename }).end()
    },
  })

  registerRoute({
    method: 'POST',
    route: '/admin/api/save',
    handler: (req, res) => {
      authenticate(req, res, options)
      saveFile(req)
      res.writeHead(301, { Location: req.headers.referer }).end()
    },
  })
}

export function getContent(filename?: string) {
  if (!filename) return

  try {
    return fs.readFileSync(getFilepath(filename), { encoding: 'utf8' })
  } catch (error) {
    return null
  }
}
