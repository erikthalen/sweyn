# `/app` Directory <Badge type="warning" text="client" />

The `/app` directory is used to store client-side static assets, such as `.css`, `.js`, and other static files that are directly referenced by the client application.

## Overview

The `/app` directory is the designated location for all static client-side assets, including stylesheets, JavaScript files, images, fonts, and any other resources that the browser needs to display or execute. Files in this directory are publicly accessible and can be referenced directly by the HTML, CSS, or JavaScript code.

## Example Usage

### Example: Folder Structure

```
/app
  ├── style.css
  ├── main.js
  └── images
      └── logo.png
```

### Linking CSS File

In your `./index.html` or any other HTML file, you can reference the CSS file from the `/app` directory:

```html
<!-- ./index.html -->
<head>
  <link rel="stylesheet" href="/styles.css">
</head>
```

### Including JavaScript File

You can include JavaScript files from the `/app` directory in your HTML files:

```html
<!-- ./index.html -->
<body>
  <script src="/main.js"></script>
</body>
```

### Referencing Images

You can reference image files stored in `/app/images` within your HTML:

```html
<!-- ./index.html -->
<body>
  <img src="/images/logo.png" alt="App Logo">
</body>
```


## Hot Module Replacement (HMR)

During development, the framework supports **Hot Module Replacement (HMR)**, which automatically refreshes the browser whenever a file is updated. This feature helps streamline the development process by instantly reflecting changes in the browser without needing a full reload.

### Versioning for Cache Invalidation

To ensure that static assets like `.css` and `.js` files are updated automatically in the browser, a unique version query string is appended to each file request. This version is a randomly generated string that changes every time the server restarts.

By including the `version` variable in the asset URL, you can force the browser to fetch the updated version of the file, even if the browser has previously cached it.

### Example: Adding Versioning to Asset URLs

```html
<link href="/main.css?v={{ version }}" rel="stylesheet" />
```

In this example, the <code v-pre>v={{ version }}</code> query string is dynamically generated and ensures that each update to the `main.css` file results in a new URL. This forces the browser to reload the file, avoiding issues where outdated cached files are used.

This approach is also useful in **production environments** for cache invalidation after a redeployment. When new versions of assets are deployed, the version query string will ensure that the browser always loads the most recent files, even if the file paths haven’t changed.
