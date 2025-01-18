# Routing System <Badge type="tip" text="server" /> <Badge type="warning" text="client" />

The `/pages` folder is where all route files are stored. Each file in the `/pages` folder automatically becomes a route in the application. The name and structure of the file determine the URL path for that route.

To render content from the `/pages` folder, the application must include a `<slot></slot>` element in the `./index.html` file. This `<slot></slot>` element acts as a placeholder where the content of each route will be dynamically injected.

## Overview

The `/pages` directory serves as the main place for defining the routing logic of your application. Each file placed inside `/pages` corresponds to a unique route in the app. When a user navigates to that route, the content inside the file is rendered at that location.

For example, the file `/pages/about.html` will become accessible at the `/about` route in the application.

## Rendering Pages

In order to render files from the `/pages` folder, a `<slot></slot>` tag must be added to the `./index.html` file. This slot will be dynamically populated with the content of the specific route file when the user navigates to that route.

### Example: Adding a Slot to `index.html`

```html
<!-- ./index.html -->
<body>
  <slot></slot>
</body>
```

- The `<slot></slot>` tag in the `./index.html` file is used as a placeholder for the content of the route that is currently being accessed.
- When the user navigates to a route (e.g., `/about`), the content of `/pages/about.html` will be injected into the `<slot></slot>`.

---

## Folder Structure

The folder structure within `/pages` determines the route structure. Each file corresponds to a route path based on its name and location within the folder.

### Example: Folder Structure

```
/pages
  ├── about.html        -> Route: /about
  ├── contact.html      -> Route: /contact
  ├── products.html     -> Route: /products
  └── products
      └── shirt.html    -> Route: /products/shirt
```

In this example:
- The `/pages/about.html` file corresponds to the `/about` route.
- The `/pages/contact.html` file corresponds to the `/contact` route.
- The `/pages/products.html` file corresponds to the `/products` route.
- The `/pages/products/shirt.html` file corresponds to the `/products/shirt` route.

## Example Usage

### Step 1: Add a Slot in `index.html`

To start, add the following `<slot></slot>` element in your `index.html`:

```html
<!-- ./index.html -->
<body>
  <slot></slot>
</body>
```

### Step 2: Create Route Files in `/pages`

Next, define your route files in the `/pages` directory. For instance, create a file for the `/about` route:

```html
<!-- /pages/about.html -->
<h1>About Us</h1>
<p>Welcome to the About page!</p>
```

### Step 3: Access the Route

When a user navigates to `/about` in the browser, the content from `/pages/about.html` will be dynamically injected into the `<slot></slot>` tag in `index.html`. The page will look like this:

```html
<h1>About Us</h1>
<p>Welcome to the About page!</p>
```

Similarly, if you have another file, like `/pages/contact.html`, it will be rendered when the user visits `/contact`.
