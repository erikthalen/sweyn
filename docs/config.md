# Server Configuration

The `createServer` function allows you to configure and initialize your server. The configuration is defined using the `Config` type, which includes several options for controlling server behavior, enabling features like analytics, defining custom routes, serving static files, and more. This configuration object provides fine-grained control over the server’s functionality and environment.

Below is a description of the available configuration options:

## Configuration Options

| Option           | Type                                | Description                                                                     |
| ---------------- | ----------------------------------- | ------------------------------------------------------------------------------- |
| `port`           | `number` (optional)                 | Specifies the port the server should run on. Defaults to `3003`.                |
| `analytics`      | `boolean` (optional)                | Enables or disables the visitor analytics tracking system. Defaults to `false`. |
| `static`         | `string \| string[]` (optional)     | Defines additional directories containing static (public) files.                |
| `admin`          | `object` (optional)                 | Contains the credentials for logging into the CMS and analytics dashboard.      |
| `admin.login`    | `string`                            | The username for logging into the CMS and analytics dashboard.                  |
| `admin.password` | `string`                            | The password for logging into the CMS and analytics dashboard.                  |
| `plugins` (wip)  | `((req, res) => void)[]` (optional) | An array of custom middleware functions that will be executed for each request. |
| `routes`         | `Route[]` (optional)                | A list of custom routes to define for your server.                              |

## Example Configuration

```ts
import { createServer } from './.sweyn/index.ts'

createServer({
  port: 8080, // The server will run on port 8080
  analytics: true, // Enable analytics tracking
  static: './web', // Also serve static files from the "web" directory
  admin: {
    login: 'admin', // Admin username for CMS and analytics
    password: 'secret', // Admin password for CMS and analytics
  },
  routes: [
    {
      route: '/custom', // Define a custom route
      handler: (req, res) => {
        return 'Custom route!'
      },
    },
  ],
})
```

## Configuration Field Descriptions

### `port` (optional)

Specifies the port the server should listen on. If not provided, it defaults to `3003`.

```ts
port: 8080
```

### `analytics` (optional)

When set to `true`, this option enables the analytics tracking feature, which records visitor data such as IP address, referer, and visit timestamp. This feature is backed by an SQLite database for storing and querying the data.

```ts
analytics: true
```

### `static` (optional)

Defines one or more directories containing static files (e.g., images, CSS, JavaScript) to be served by the server. You can provide a single directory path as a string or an array of paths.

```ts
static: './web' // Serve static files from the "web" directory
```

### `admin` (optional)

Contains the credentials required for logging into the CMS and analytics dashboard. If `admin` is not set, no login will be required for accessing the dashboard.

```ts
admin: {
  login: 'admin',  // Admin username for CMS and analytics dashboard
  password: 'secret',  // Admin password for CMS and analytics dashboard
}
```

### `plugins` (optional)

An array of custom middleware functions that are executed for every request. Each function receives the incoming request (`req`) and the outgoing response (`res`) as arguments. Middleware can modify the request/response or perform additional actions.

```ts
plugins: [
  (req, res) => {
    // Custom middleware logic here
  },
]
```

### `routes` (optional)

Allows you to define custom routes and their associated handlers. Each route is an object with the following properties:

- `method`: The HTTP method for the route (e.g., `GET`, `POST`). If omitted, the route will accept all methods.
- `route`: The URL path for the route.
- `handler`: A function that will be called to handle the request. It receives the `req` and `res` objects and the `options` object containing variables passed from the server/router. The server handles return values of string, json and ReadStream.

```ts
routes: [
  {
    route: '/custom/[slug]',
    handler: (req, res, { route }) => {
      return 'Custom route: ' + route.slug
    },
  },
]
```
