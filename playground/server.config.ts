import { marked } from 'marked'
import { createServer, renderFile, getContent, createDatabase } from 'sweyn'

const { db, createTable } = createDatabase()

createTable('foobar', {
  first: 'string',
})

createTable('fresh', {
  name: 'string',
})

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
      handler: async (req, res, { route }) => {
        return renderFile('cms-page', {
          content: await marked.parse(getContent(route.page)),
          version: Date.now(),
        })
      },
    },
    {
      route: '/erik/[slug]/[bar]',
      handler: (req, res, { route }) => {
        return renderFile('[slug]', route)
      },
    },
  ],
})

export { db }
