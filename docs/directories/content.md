# `/content` Directory <Badge type="tip" text="server" />

The `/content` directory is used to store content files in `.md` (Markdown) format. When the CMS is activated, it reads and processes these Markdown files to generate dynamic content. The content is then accessible via server-side functions, like `getContent()`, which allows you to retrieve the file content dynamically and render it within your application.

## Activating the CMS

Before you can start using the `/content` directory to manage your content, you need to **activate** the CMS functionality. This is done by calling `createServer()` in your server configuration and providing the `admin` object with login credentials.

### Example: Activating the CMS

```ts
import { createServer } from './.sweyn/index.ts'

createServer({
  admin: {
    login: 'admin',
    password: 'p4ssw0rd',
  },
})
```

Once activated, the CMS will be available for managing and editing content stored in the `/content` directory via the admin panel.

## Accessing the Admin Panel

After activation, the CMS admin interface is accessible at the `/admin` route. The admin panel allows you to:

- **Create new content files**: Add new `.md` files for blog posts, pages, or other content.
- **Update existing content**: Edit the contents of the Markdown files.
- **Delete content files**: Remove any outdated or unnecessary content files.

To access the admin interface, navigate to:

```
http://localhost:3003/admin
```

Login with the `login` and `password` credentials you specified in the server configuration to manage the content files in the `/content` directory.

## Retrieving Content with `getContent()`

Once content files are stored in the `/content` directory, you can retrieve the content using the `getContent()` function from the server-side API.

```ts
import { createServer, getContent } from './.sweyn/index.ts'
```

The `getContent()` function fetches the content of a specific `.md` file. This is useful for dynamically rendering content like blog posts, static pages (e.g., "About Us", "Contact"), or any other textual content stored in Markdown files.

### Syntax

```ts
const content = await getContent('file-name')
```

- `file-name`: The name of the `.md` file without the file extension.

For example, to retrieve the content of `about.md`, you would call:

```ts
const aboutContent = await getContent('about')
```

The content will be returned as a string, which can then be processed or directly rendered in your application.

## Markdown to HTML Parsing

**Important**: The CMS does **not** automatically convert Markdown into HTML. You will need to use a Markdown-to-HTML parser, such as [**Marked**](https://github.com/markedjs/marked), to render the Markdown content as HTML.

### Example Using `marked`

To convert the retrieved Markdown content into HTML, you can use a library like `marked`. Here's how you can do it:

1. **Install the `marked` library** (or any other Markdown parser):

```bash
npm install marked
```

2. **Parse the Markdown content** using `marked`:

```ts
import { createServer, getContent } from './.sweyn/index.ts'
import marked from 'marked'

createServer({
  routes: [
    {
      route: '/about',
      handler: async (req, res) => {
        const aboutContent = await getContent('about')
        const htmlContent = marked.parse(aboutContent) // Convert Markdown to HTML

        return renderFile('cms-page', { content: htmlContent }) // Render HTML using a template
      },
    },
  ],
})
```

In this example, `getContent('about')` retrieves the raw Markdown content from `about.md`, and `marked(aboutContent)` converts that Markdown into HTML. The HTML content is then sent as the response.

You can replace `marked` with any other Markdown parser of your choice, such as [**markdown-it**](https://github.com/markdown-it/markdown-it).

## Advanced Example: Dynamic Content with Routes

Here's a more advanced example where the server dynamically handles routes for individual content files in the `/content` directory.

### Example: Dynamic Article Route

In this case, the server will render content from Markdown files (e.g., `/content/about.md`) dynamically at a route like `/article/about`. This is done by utilizing route parameters (e.g., `:page`), retrieving the content dynamically based on the route, and rendering it with an HTML template.

```ts
import { createServer, getContent, renderFile } from './.sweyn/index.ts'
import marked from 'marked'

createServer({
  admin: {
    login: 'admin',
    password: 'admin',
  },
  routes: [
    {
      route: '/article/[page]',
      handler: async (req, res, { route }) => {
        const content = await getContent(route.page) // Retrieve content based on route parameter
        const html = marked.parse(content) // Convert Markdown to HTML

        return renderFile('cms-page', { content: html }) // Render HTML using a template
      },
    },
  ],
})
```

### Breakdown:

- **Route `/article/[page]`**: The `[page]` parameter represents any page name (e.g., `about`, `contact`, etc.). The route is dynamic and will match any path under `/article/`, such as `/article/about`, `/article/contact`, etc.
- **`getContent(route.page)`**: This function dynamically loads the content file from the `/content` directory. For example, if the route is `/article/about`, it will attempt to load the file `about.md` from `/content/about.md`.
- **`marked.parse(content)`**: The Markdown content is then parsed into HTML using the `marked` parser.
- **`renderFile('cms-page', { content: html })`**: Finally, the HTML content is passed to a template (`/pages/cms-page.html`) to render it within a predefined layout.
