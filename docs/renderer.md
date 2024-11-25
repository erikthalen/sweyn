# Renderer

Used to render files from the `/pages` folder.

Automatically applies html-layout.

```ts
import { createServer, renderFile } from './.sweyn/index.ts'

createServer({
  routes: [
    {
      route: '/',
      handler: () => {
        return renderFile('filename', {
          content: '<h1>Hello World!</h1>',
          name: 'Sweyn',
        })
      },
    },
  ],
})
```

The second argument maps to any variables in the `.html` file that's being rendered:

```html
<!-- /pages/filename.html -->
{{ content }}
<p>My name is {{ name }}</p>
```

```html
<!-- /pages/filename.html -->
<h1>Hello World!</h1>
<p>My name is Sweyn</p>
```