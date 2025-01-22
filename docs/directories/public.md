# `/public` Directory <Badge type="warning" text="client" />

The `/public` directory is used to store **static assets**, such as images, media files, and other resources that need to be publicly accessible. These files can be referenced directly in your HTML, CSS, and JavaScript files, and they will be served by the application as-is, without any processing.

## Using Static Assets from `/public`

Any files placed inside the `/public` directory will be accessible via the root URL. This means that you can link to images, CSS files, JavaScript files, and other assets directly by using their relative path in the `/public` directory.

### Example:

If you have an image called `logo.png` in the `/public` folder:

```
/public
  └── logo.png
```

You can access this image at:

```
http://localhost:3003/logo.png
```

### Accessing Static Assets in HTML:

To use this image in your HTML, you can reference it like so:

```html
<img src="/logo.png" alt="Logo" />
```

Similarly, you can use static assets like CSS or JavaScript:

```html
<link href="/styles.css" rel="stylesheet" />
<script src="/scripts.js"></script>
```

These files will be served by the server directly without any modification, and the browser can cache them for performance.

### Versioning for Cache Invalidation

To ensure that static assets like `.css` and `.js` files are updated automatically in the browser, a unique version query string is appended to each file request. This version is a randomly generated string that changes every time the server restarts.

By including the `version` variable in the asset URL, you can force the browser to fetch the updated version of the file, even if the browser has previously cached it.

### Example: Adding Versioning to Asset URLs

```html
<link href="/main.css?v={{ version }}" rel="stylesheet" />
```

In this example, the <code v-pre>v={{ version }}</code> query string is dynamically generated and ensures that each update to the `main.css` file results in a new URL. This forces the browser to reload the file, avoiding issues where outdated cached files are used.

This approach is also useful in **production environments** for cache invalidation after a redeployment. When new versions of assets are deployed, the version query string will ensure that the browser always loads the most recent files, even if the file paths haven’t changed.
