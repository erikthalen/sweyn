**Sweyn** is a lightweight **server-side web framework** designed to make building modern web applications as simple as possible. With **no build step or bundling**, you can focus on what matters most: writing your code.

Sweyn provides a set of powerful, file-based tools that integrate seamlessly to help you develop quickly and easily:

- **File-based routing**: Automatically map files in the `/pages` directory to routes in your application, simplifying your routing setup.
- **File-based API**: Define API endpoints in the `/api` folder. Each file in this directory automatically becomes an endpoint, making it easy to build server-side logic.
- **HMR (Hot Module Replacement)**: Enjoy a fast development workflow with automatic browser refreshes on file save. **Note**: This is a "fake" HMR, meaning the browser reloads entirely and application state will be lost on each update.
- **Static file-based Markdown CMS**: Easily manage content using Markdown files in the `/content` folder, which can be fetched and rendered dynamically with Markdown-to-HTML parsing.
- **Minimal HTML rendering engine**: Sweyn’s rendering engine allows you to easily inject dynamic content into your HTML files with a simple template system.

Whether you're building a small prototype or a larger-scale application, **Sweyn** is here to handle the server-side logic and make the process as seamless as possible.

**(human written note):** You probably don't want to use this for a "larger-scale application", lol