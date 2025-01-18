# Renderer

The **Renderer** is used to render files from the `/pages` folder. It automatically applies an HTML layout to the rendered content, allowing you to easily inject dynamic content into your HTML templates.

### Rendering a File

You can render an HTML file using the `renderFile()` function, which is provided by the framework. This function takes the filename (without the `.html` extension) and an object of variables that will be injected into the template.

### Example: Rendering a File with Dynamic Content

```ts
import { createServer, renderFile } from './.sweyn/index.ts';

createServer({
  routes: [
    {
      route: '/',
      handler: () => {
        return renderFile('filename', {
          content: '<h1>Hello World!</h1>',
          name: 'Sweyn',
        });
      },
    },
  ],
});
```

In this example, the `renderFile()` function renders the `/pages/filename.html` template. The variables `content` and `name` are passed as arguments to be injected into the template.

## Using Template Variables

The second argument passed to `renderFile()` is an object where the **keys** are variable names and the **values** are the content that will replace the placeholders in the HTML file.

### Example HTML Template (`/pages/filename.html`)

```html
<!-- /pages/filename.html -->
{{ content }}
<p>My name is {{ name }}</p>
```

In this template, `{{ content }}` and `{{ name }}` are placeholders that will be replaced with the corresponding values from the `renderFile()` call:

- `{{ content }}` will be replaced with the HTML string passed in the `content` variable.
- `{{ name }}` will be replaced with the value of the `name` variable.

### Example Output:

```html
<!-- Rendered HTML -->
<h1>Hello World!</h1>
<p>My name is Sweyn</p>
```

In this case, when the route `/` is accessed, the content `Hello World!` will be injected into the `{{ content }}` placeholder, and `Sweyn` will be inserted into `{{ name }}`.
