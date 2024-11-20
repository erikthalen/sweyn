import { marked } from 'marked'
import { createServer, renderFile, getContent } from 'sweyn'

createServer({
  cms: {
    cmsIndexRoot: '../packages/sweyn',
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
