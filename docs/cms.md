# CMS

A **file-based CMS** that stores content in `.md` files. It is accessible via the `/admin` URL for managing content.

## Activate

To activate the CMS, add an `admin` configuration to your `./server.config.ts` file and supply a `login` and `password` for access:

```ts
import { createServer } from './.sweyn/index.ts'

createServer({
  admin: {
    login: 'admin', // Admin username
    password: 'admin', // Admin password
  },
})
```

Once activated, the CMS can be accessed at `/admin`, where you can create, update, and delete content stored in the `/content` directory.

## Accessing CMS Content

You can use the `getContent('filename')` function to retrieve content from the `/content` folder. The filename passed to `getContent` should match the name of the Markdown (`.md`) file you wish to load.

### Example: Using `getContent` in a Route

```ts
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
        return getContent(route.page)
      },
    },
  ],
})
```

This example creates a dynamic route `/article/[page]` where the `page` parameter is used to retrieve content from the corresponding Markdown file in the `/content` folder.

On the route `/article/about`, the file `/content/about.md` would be loaded.

## Parsing Markdown

The content fetched by `getContent()` is raw Markdown, so you’ll need a Markdown-to-HTML parser to convert it to HTML. You can use a library like [marked](https://marked.js.org/) to parse the content.

### Example: Using `marked` to Parse Content

```ts
import { marked } from 'marked'
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
        return await marked.parse(getContent(route.page)) // Parse the Markdown content
      },
    },
  ],
})
```

In this example, `getContent(route.page)` fetches the raw Markdown file, and `marked.parse()` converts the content to HTML.

## Rendering Content with Layout

To render the parsed HTML content within the page layout, use the `renderFile()` function. This function takes the target HTML file (from `/pages`) and injects the parsed content as a variable.

### Example: Rendering Content with Layout

```ts
import { marked } from 'marked'
import { createServer, getContent, renderFile } from './.sweyn/index.ts'

createServer({
  admin: {
    login: 'admin',
    password: 'admin',
  },
  routes: [
    {
      route: '/article/[page]',
      handler: async (req, res, { route }) => {
        return renderFile('cms-page', {
          // Render the content inside a layout
          content: await marked.parse(getContent(route.page)), // Parse and pass the content
        })
      },
    },
  ],
})
```

In this case, the `getContent(route.page)` fetches the raw Markdown file corresponding to the `page` parameter, and `marked.parse()` converts it to HTML. The parsed HTML is then passed to the `renderFile()` function as the `content` variable, which will be injected into the `/pages/cms-page.html` template.

### Example HTML Template (`/pages/cms-page.html`)

```html
<!-- /pages/cms-page.html -->
<p>Page with CMS content</p>
{{ content }}
<!-- The parsed content will be injected here -->
```

This example renders the parsed content inside a layout defined in the `cms-page.html` template. The `content` placeholder in the template is replaced with the parsed HTML from the Markdown file.
