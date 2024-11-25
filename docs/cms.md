# CMS

File based CMS that stores `.md` files.

Accessable on the `/admin` url.

## Activate

Add CMS object to config in `./server.config.ts`, and supply login and password:

```ts
import { createServer } from './.sweyn/index.ts'

createServer({
  admin: { // [!code ++]
    login: 'admin', // [!code ++]
    password: 'admin', // [!code ++]
  }, // [!code ++]
})
```

Use the `getContent('filename')` to get content from the `/content` folder:

```ts
import { createServer } from './.sweyn/index.ts' // [!code --]
import { createServer, getContent } from './.sweyn/index.ts' // [!code ++]

createServer({
  admin: {
    login: 'admin',
    password: 'admin',
  },
  routes: [ // [!code ++]
    { // [!code ++]
      route: '/article/[page]', // [!code ++]
      handler: async (req, res, { route }) => { // [!code ++]
        return getContent(route.page) // [!code ++]
      }, // [!code ++]
    }, // [!code ++]
  ], // [!code ++]
})
```

It's in raw markdown, install a markdown-to-html parser of choice, and parse the content:

```ts
import { marked } from 'marked' // [!code ++]
import { createServer, getContent } from './.sweyn/index.ts'

createServer({
  admin: {
    login: 'admin',
    password: 'admin',
  },
  routes: [
    {
      route: '/article/[page]',
      handler: async (req, res, { route }) => {
        return getContent(route.page) // [!code --]
        return await marked.parse(getContent(route.page)) // [!code ++]
      },
    },
  ],
})
```

Run the parsed html through `renderFile()` in order to get the file from the `/pages` folder, with the layout applied:

```ts
import { marked } from 'marked'
import { createServer, getContent } from './.sweyn/index.ts' // [!code --]
import { createServer, getContent, renderFile } from './.sweyn/index.ts' // [!code ++]

createServer({
  admin: {
    login: 'admin',
    password: 'admin',
  },
  routes: [
    {
      route: '/article/[page]',
      handler: async (req, res, { route }) => {
        return await marked.parse(getContent(route.page)) // [!code --]
        return renderFile('cms-page', { // [!code ++]
          content: await marked.parse(getContent(route.page)), // [!code ++]
        }) // [!code ++]
      },
    },
  ],
})
```

```html
<!-- /pages/cms-page.html -->
<p>Page with CMS content</p>
{{ content }}
```

Because the route is `/article/[page]`, the handler's option object will be filled with `option.route` containing the value of the current `[page]` uri.

Use the `getContent(route.page)` to get content of the markdown file with the name matching the uri.

Run this through a markdown-to-html parser of choice, f.ex. [marked](https://marked.js.org/)

Pass this to the second argument of `renderFile()`, on a key matching the variable in your target `.html` file.
