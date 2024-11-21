# Directories

## `/api` <Badge type="tip" text="server" />

Each file becomes an server side api endpoint.

::: code-group

```ts [/api/my-endpoint.ts]
export default (req: http.IncomingMessage, res: http.ServerResponse) => {
  return { data: 'Hello World!' }
}
```

:::

::: code-group

```ts [/app/main.ts]
const res = await fetch('/api/my-endpoint')
const json = await res.json()

console.log(json) // -> { data: 'Hello World!' }
```

:::

Define accepted method by adding `.[method].ts` in the filename:

`/api/create-user.post.ts`  
`/api/users.get.ts`

## `/pages` <Badge type="tip" text="server" /> <Badge type="warning" text="client" />

Each file becomes a router path.

In order to render files from the `/pages` folder, a `<slot></slot>` should be added to the `./index.html`:

::: code-group

```html [./index.html]
...
<body>
  <slot></slot>
</body>
...
```

:::

Supports routes not following folder structure:

::: code-group

```ts [server.config.ts]
import { createServer, renderFile } from './.sweyn/index.ts'

createServer({
  routes: [
    {
      route: '/my-special-route/[uri]',
      handler: (req, res, { route }) => {
        return renderFile('some-file', { uri: route.uri })
      },
    },
  ],
})
```

:::

::: code-group

```html [/pages/some-file.html]
<h1>Hello from {{ uri }}</h1>
```

:::

::: code-group

```html [http://localhost:3003/my-special-route/hello-world]
<h1>Hello from hello-world</h1>
```

:::

## `/layouts` <Badge type="danger" text="wip" />

## `/app` <Badge type="warning" text="client" />

Used for storing static assets, like `.css` and `.js`

## `/content` <Badge type="tip" text="server" />

Used by the CMS, when activated, to store content files in `.md` format. Get filecontent with `getContent()`

```ts
import { createServer, getContent } from './.sweyn/index.ts'
```

## `/public` <Badge type="warning" text="client" />

Used for storing static assets, images and media

## `/snippets` <Badge type="tip" text="server" /> <Badge type="warning" text="client" />

Gives access to html snippets used to insert into pages.

Use it by inserting the filename between squar brackets.

::: code-group

```html [/snippets/foobar.html]
<code>I'm a partial</code>
```

:::

::: code-group

```html [/pages/about.html]
<h1>About page</h1>
[[ foobar ]]
<p>Hello</p>
```

:::

::: code-group

```html [http://localhost:3003/about]
<h1>About page</h1>
<code>I'm a partial</code>
<p>Hello</p>
```

:::

Also accessible through API-endpoint, under the `/snippets/*` route:

```ts
const res = await fetch('/snippets/foobar')
const text = await res.text()

console.log(text) // -> '<code>I'm a partial</code>'
```
