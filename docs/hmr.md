# HMR

**HMR (Hot Module Replacement)** provides automatic browser refreshes during development whenever a file is saved. This feature significantly improves the development workflow by automatically updating the browser without needing to manually refresh the page.

The HMR functionality is powered by **server-sent events** (SSE), which allows the server to push updates to the client when changes occur.

> **Note:** This is a "fake" HMR. While the browser automatically reloads the updated content, **all application state will be lost** upon each reload. It is not a true HMR where the state is preserved during updates.

## Automatic Refresh on File Save

Whenever you save a file, the browser will automatically reload the updated content, ensuring that you always see the latest version of your app. This is especially useful for CSS, JavaScript, and other assets that change frequently during development.

The updates are sent to the browser through **server-sent events**, which push the changes from the server to the client in real time. This enables automatic refreshing without the need for full-page reloads or manual intervention.

## Cache Busting with the `version` Variable

To ensure that assets such as `.css` or `.js` files always update in the browser after changes, you need to append a query parameter to the asset's URL. The query will automatically change with every server restart, invalidating the browser's cache and forcing it to load the latest version of the asset.

You can use the `version` variable to generate a random string that will change every time the server restarts.

### Example: Using the `version` Variable for Cache Busting

```html
<link href="/main.css?v={{ version }}" rel="stylesheet" />
```

In this example, the `v={{ version }}` query parameter ensures that the browser always fetches the latest version of the `main.css` file. The `version` value is a random string generated each time the server starts.

When the browser requests the asset, the query parameter (`?v=<random_string>`) will be stripped from the URL when the server reads it, ensuring the correct asset is served.

## Production Cache Invalidation

This approach is also useful for invalidating the cache in production after your app has been redeployed. By appending a unique version string to the asset URLs, you ensure that the latest assets are always fetched, even if the browser has cached older versions.
