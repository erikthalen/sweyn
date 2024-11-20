import { createServer, renderFile } from 'sweyn'

createServer({
  routes: [
    {
      route: '/erik/[slug]/[bar]',
      handler: (req, res, { route }) => {
        console.log(route)
        return renderFile('[slug]', route)
      },
    },
  ],
})
