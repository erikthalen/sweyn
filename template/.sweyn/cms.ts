import fs from 'node:fs'
import fsPromise from 'node:fs/promises'
import path from 'node:path'
import { registerRoute } from './routes.ts'
import { readBody } from './server.ts'
import { renderVariables } from './renderer.ts'

let rootDir = './'
let cmsIndexRoot = '.sweyn'

async function saveFile(req, res) {
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
      path.join('.', rootDir, filename.replaceAll(' ', '-') + '.md'),
      decodedContent
    )
  
    return `Saved ${filename} successfully`
  } catch(error) {
    console.log(error)
  }
}

function authenticate(req, res, login) {
  const { authorization } = req.headers

  if (!authorization) {
    res.setHeader('WWW-Authenticate', 'Basic')
    throw { status: 401, message: 'Not authorized' }
  }

  const [_, encodedLogin] = authorization.split(' ')
  const [user, pw] = Buffer.from(encodedLogin, 'base64')
    .toString('ascii')
    .split(':')

  if (user === login.username && pw === login.password) {
    return true
  } else {
    res.setHeader('WWW-Authenticate', 'Basic')
    throw { status: 401, message: 'Not authorized' }
  }
}

function getFilepath(file) {
  return path.join('.', rootDir, file + '.md')
}

export function createCms(options) {
  rootDir = options.root || './content'

  if (options.cmsIndexRoot) {
    cmsIndexRoot = options.cmsIndexRoot
  }

  async function renderCms(req, res, opts) {
    authenticate(req, res, options)
    res.setHeader('Content-Type', 'text/html')
    const index = await fsPromise.readFile(path.join(cmsIndexRoot, 'cms.html'))

    try {
      await fsPromise.readdir(`${rootDir}`)
    } catch (error) {
      await fsPromise.mkdir(`${rootDir}`)
    }

    const pages = await fsPromise.readdir(`${rootDir}`, { encoding: 'utf8' })

    const menu = pages
      .map(page => {
        return `<a href="/admin/${page.replace('.md', '')}">${page}</a>
          <form action="/admin/api/delete">
            <input type="hidden" value="${page}" name="page">
            <input type="submit" value="Delete">
          </form>`
      })
      .join('')

    return renderVariables(index.toString(), {
      pages: menu,
      content: getContent(opts.route.page),
      filename: opts.route.page,
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
      return fs.readdirSync(`.${rootDir}`, { encoding: 'utf8' })
    },
  })

  registerRoute({
    route: '/admin/api/content',
    handler: (req, res) => {
      authenticate(req, res, options)
      const { searchParams } = new URL('http://foo.com' + req.url)
      return getContent(searchParams.get('page'))
    },
  })

  registerRoute({
    route: '/admin/api/delete',
    handler: (req, res) => {
      authenticate(req, res, options)
      const { searchParams } = new URL('http://foo.com' + req.url)
      const filename = searchParams.get('page') || ''
      const filepath = path.join('.', rootDir, filename)
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
        path.join('.', rootDir, filename + '.md'),
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
      saveFile(req, res)
      res.writeHead(301, { Location: req.headers.referer }).end()
    },
  })
}

export function getContent(name) {
  try {
    return fs.readFileSync(getFilepath(name), { encoding: 'utf8' })
  } catch (error) {
    return null
  }
}
