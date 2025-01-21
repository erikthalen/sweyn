# Server With Everything You Need

**Sweyn** is a **server-side web framework** written in TypeScript, designed to run without any build step or bundling. The whole source code of the library is included in the starter template, making it easy to adjust as needed.

The entire framework is contained in just **36KB**.

Sweyn provides several file-based tools for rapid development:

- **File-based routing**: Automatically maps files in the `/pages` directory to routes in your application, reducing the need for manual route configuration.
- **File-based API**: Allows you to define API endpoints directly in the `/api` folder, with each file automatically becoming an endpoint.
- **HMR (Hot Module Replacement)**: Provides automatic browser refreshes on file save during development.
- **Static file-based Markdown CMS**: Allows you to manage content with Markdown files in the `/content` folder, which can be fetched and rendered dynamically using a Markdown-to-HTML parser.
- **Minimal HTML rendering engine**: A lightweight rendering engine that injects dynamic content into your HTML files using a simple template system.
