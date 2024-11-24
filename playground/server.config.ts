import { marked } from 'marked'
import { createServer, renderFile, getContent, createDatabase } from 'sweyn'

const { db, createTable } = createDatabase()

createTable('foobar', {
  first: 'string',
})

createServer({
  root: '../packages/sweyn',
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
