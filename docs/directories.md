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

Supports dynamic routes:

::: code-group

```ts [server.config.ts]
import { createServer } from './sweyn/index.ts'
import { renderFile } from './sweyn/renderer.ts'

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
```

:::

::: code-group

```html [/pages/[slug].html]
<h1>Hello from {{ slug }}</h1>
```

:::

::: code-group

```html [http://localhost:3003/foobar]
<h1>Hello from foobar</h1>
```

:::

## `/layouts` <Badge type="danger" text="wip" />

## `/app` <Badge type="warning" text="client" />

Used for storing static assets, like `.css` and `.js`

## `/content` <Badge type="tip" text="server" />

Used by the CMS, when activated, to store content files in `.md` format.

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