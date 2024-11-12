import { createServer, renderFile } from 'sweyn'

createServer({
  routes: [
    {
      route: '/[slug]',
      handler: (req, res, { route }) => {
        return renderFile('[slug]', { slug: route.slug })
      },
    },
  ],
})
