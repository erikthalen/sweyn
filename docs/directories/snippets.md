# `/snippets` Directory <Badge type="tip" text="server" /> <Badge type="warning" text="client" />

The `/snippets` directory allows you to store **HTML snippets** that can be inserted into various pages across your application. These snippets are reusable blocks of HTML that can be included in different parts of your site or application to maintain consistency and avoid duplication of code.

## Using Snippets in Pages

You can include a snippet into your pages by referencing its filename inside double square brackets (`[[ ]]`). The content of the snippet file will be injected at that location in the page.

### Example Snippet:

Create a snippet in the `/snippets` folder:

```
/snippets
  └── foobar.html
```

With the following content:

```html
<code>I'm a partial</code>
```

Then, you can reference this snippet in a page (e.g., `/pages/about.html`) like this:

```html
<h1>About page</h1>
[[ foobar ]]
<p>Hello</p>
```

When you visit the page at `http://localhost:3003/about`, the snippet will be dynamically inserted in place of `[[ foobar ]]`:

### Resulting HTML:

```html
<h1>About page</h1>
<code>I'm a partial</code>
<p>Hello</p>
```

### Key Points:

- `[[ foobar ]]` will be replaced by the contents of the `/snippets/foobar.html` file.
- The filename `foobar` is used without the `.html` extension when referencing the snippet.

---

## Accessing Snippets via API

You can also access the HTML snippets directly through an API endpoint at the `/snippets/*` route. This allows you to fetch the contents of a snippet programmatically using `fetch()` or similar HTTP request methods.

### Example: Fetching Snippet Content via API

To fetch the content of the `foobar.html` snippet:

```ts
const res = await fetch('/snippets/foobar');
const text = await res.text();

console.log(text); // -> '<code>I'm a partial</code>'
```

This can be useful if you need to load the snippet content dynamically on the client-side or if you need to manipulate it before rendering it.
