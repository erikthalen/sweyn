import { marked } from 'marked'
import { createServer, renderFile, getContent, createDatabase } from 'sweyn'

const { db, createTable } = createDatabase()

createTable('foobar', {
  first: 'string',
})

createTable('fresh', {
  name: 'string',
})

async function createError(error) {
  return {
    type: 'error-page',
    response: await renderFile('error', {
      statusCode: 404,
      message: error.message,
      version: Date.now(),
    }),
  }
}

createServer({
  root: '../packages/sweyn',
  analytics: true,
  admin: {
    login: 'admin',
    password: 'admin',
  },
  routes: [
    {
      route: '/article/[page]',
      handler: async (req, res, options) => {
        const content = getContent(options?.route.page)

        if (typeof content !== 'string') {
          throw createError({ message: 'nooope' })
        }

        return renderFile('cms-page', {
          content: await marked.parse(content),
          version: Date.now(),
        })
      },
    },
    {
      route: '/erik/[slug]/[bar]',
      handler: (req, res, options) => {
        return renderFile('[slug]', options?.route)
      },
    },
  ],
})

export { db }
