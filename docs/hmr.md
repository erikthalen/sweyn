# HMR

There's a build in browser refresh on file save during development.

All assets that should be able to update automatically needs a new url on each update.
This ican be achieved with the `version` variable, which is a random string generated each time the server starts.

The query will be stripped when the server reads the file url.

```html
<link href="/main.css?v={{ version }}" rel="stylesheet" />
```

This is also good for invalidating cache after your app is re-deployed in production.