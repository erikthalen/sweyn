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

## Caching

Since files in the `/public` directory are static and can be cached by the browser, it’s recommended to use versioning (e.g., appending query strings or filenames with hashes) for cache-busting when assets are updated.

Example:

```html
<link href="/styles.css?v={{ version }}" rel="stylesheet" />
<script src="/scripts.js?v={{ version }}"></script>
```

The `version` variable is generated each time the server restarts to ensure that the browser fetches the latest version of assets.
