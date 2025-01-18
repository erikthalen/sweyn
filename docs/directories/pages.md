# Pages <Badge type="tip" text="server" /> <Badge type="warning" text="client" />

The **routing system** in Sweyn is designed to be intuitive and flexible, allowing you to easily define routes using a **file-based structure**. Every file inside the `/pages` folder automatically becomes a route in your application. The structure and naming of these files determine the URL paths, with built-in support for **dynamic routing**.

## Overview

The `/pages` directory serves as the central place for defining routes in your application. Each file inside the `/pages` folder corresponds to a unique route based on its filename. When a user navigates to a particular route, the corresponding file is rendered at that location.

For example, the file `/pages/about.html` will be accessible at the `/about` route.

### Dynamic Routing

Sweyn supports **dynamic routing** by using file names wrapped in square brackets. A dynamic route allows you to capture a part of the URL as a variable. For instance, if you create a file named `[slug].html` in the `/pages` folder, this file will match any route with a dynamic segment (e.g., `/article/first-post`, `/article/second-post`).

### Example: Dynamic Route Setup

```html
<!-- /pages/[slug].html -->
<h1>Article: {{ slug }}</h1>
```

With this setup, when a user navigates to `/article/first-post`, the value of `{{ slug }}` will be `first-post`.

## Rendering Pages

To render content from the `/pages` folder, you need to include a `<slot></slot>` element in the `./index.html` file. This `<slot></slot>` tag serves as a placeholder where the content of the current route will be injected dynamically.

### Example: Adding a Slot to `index.html`

```html
<!-- ./index.html -->
<body>
  <slot></slot>
</body>
```

- The `<slot></slot>` tag in `index.html` is used as a placeholder for the content of the route currently being accessed.
- When the user visits a route (e.g., `/about`), the content from `/pages/about.html` will be injected into the `<slot></slot>`.

## Folder Structure

The folder structure within `/pages` directly determines the route structure. Each file corresponds to a route path based on its location and name.

### Example: Folder Structure

```
/pages
  ├── about.html        -> Route: /about
  ├── contact.html      -> Route: /contact
  ├── products.html     -> Route: /products
  └── products
      └── shirt.html    -> Route: /products/shirt
  └── [slug].html       -> Route: /article/[slug]
```

In this example:
- `/pages/about.html` corresponds to the `/about` route.
- `/pages/contact.html` corresponds to the `/contact` route.
- `/pages/products.html` corresponds to the `/products` route.
- `/pages/products/shirt.html` corresponds to `/products/shirt`.
- `/pages/[slug].html` corresponds to dynamic routes like `/article/first-post`, where `slug` is a variable.

## Example Usage

### Step 1: Add a Slot in `index.html`

Start by adding the `<slot></slot>` element to your `index.html`:

```html
<!-- ./index.html -->
<body>
  <slot></slot>
</body>
```

### Step 2: Create Route Files in `/pages`

Next, create route files in the `/pages` directory. For example, to define an `/about` route, create `/pages/about.html`:

```html
<!-- /pages/about.html -->
<h1>About Us</h1>
<p>Welcome to the About page!</p>
```

### Step 3: Create Dynamic Route File

To create a dynamic route (for instance, `/article/[slug]`), create a file named `[slug].html`:

```html
<!-- /pages/[slug].html -->
<h1>Article: {{ slug }}</h1>
<p>Content for the article: {{ slug }}</p>
```

### Step 4: Access the Dynamic Route in `createServer()`

When defining custom routes in `createServer()`, you can access the dynamic segment of the URL (like `slug` or `page`) through the third parameter in the route handler function. This parameter contains the `route` object, where dynamic parts of the URL are stored.

### Example: Dynamic Route Handler

```ts
import { createServer } from './.sweyn/index.ts'

createServer({
  routes: [
    {
      route: '/article/[page]',
      handler: async (req, res, { route }) => {
        // Access the dynamic part of the route via route.page
        return route.page
      },
    },
  ],
})
```

In this example, if a user visits `/article/first-post`, `route.page` will be equal to `'first-post'`. You can use this dynamic value to fetch data, render content, or perform any other necessary actions.

### Step 5: Access the Route

When a user navigates to `/about`, the content from `/pages/about.html` will be injected into the `<slot></slot>` tag in `index.html`. Similarly, if the user visits `/article/first-post`, the content from `/pages/[slug].html` will be rendered, with `first-post` accessible via `route.slug`.
