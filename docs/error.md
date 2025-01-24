# Error Handling in Sweyn

Sweyn allows you to display custom error pages for server errors, such as **404 Not Found** or **500 Internal Server Error**. This makes it easier to provide a user-friendly experience when something goes wrong on the server.

## How It Works

When an error occurs, Sweyn looks for an `error.html` file in the following locations:

1. **Root Directory**: If an `error.html` file exists at the root of your project, it will be served for all errors.
2. **`/pages` Directory**: If no `error.html` file is found in the root, Sweyn will check the `/pages` directory.

If no `error.html` file is found in either location, Sweyn will fall back to a default error json response.

## Setting Up Custom Error Pages

To handle errors effectively, you can create an `error.html` file in either the root or `/pages` directory. This file will be shown when a **404** or **500** error occurs.

The `error.html` file has access to the following variables that can be used to display dynamic content:

- <code v-pre>{{ statusCode }}</code>: The HTTP status code (e.g., 404, 500).
- <code v-pre>{{ message }}</code>: A brief message explaining the error.

### Example `error.html` Template

Here’s how you can use these variables in your `error.html` file:

```html
<h1>Error</h1>
<h2>Code: {{ statusCode }}</h2>
<p>Message: {{ message }}</p>
```

### File Tree Examples

#### Option 1: `error.html` in the Root Directory

```
/root
  └── error.html      <!-- Custom error page for 404/500 errors
```

#### Option 2: `error.html` in the `/pages` Directory

```
/root
  └── /pages
       └── error.html  <!-- Custom error page for 404/500 errors
```
