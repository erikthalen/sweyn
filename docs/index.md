# Server with Everything You Need

**Sweyn** is a lightweight, **server-side web framework** designed for simplicity and ease of use in building web applications. With no build step or bundling required.

The entire framework is contained in just **36KB**, making it a highly efficient solution for building small to medium-sized applications. Additionally, the complete source code is included in the starter template, allowing full transparency and flexibility in how it operates.

Sweyn provides several file-based tools for rapid development:

- **File-based routing**: Automatically maps files in the `/pages` directory to routes in your application, reducing the need for manual route configuration.
- **File-based API**: Allows you to define API endpoints directly in the `/api` folder, with each file automatically becoming an endpoint.
- **HMR (Hot Module Replacement)**: Provides automatic browser refreshes on file save during development. **Note**: This is a "fake" HMR, meaning the browser reloads entirely, and application state will be lost on each update.
- **Static file-based Markdown CMS**: Allows you to manage content with Markdown files in the `/content` folder, which can be fetched and rendered dynamically using a Markdown-to-HTML parser.
- **Minimal HTML rendering engine**: A lightweight rendering engine that injects dynamic content into your HTML files using a simple template system.

The **Sweyn** framework is designed for small to mid-sized applications, where simplicity, rapid development, and transparency are essential.
