# Directories

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
