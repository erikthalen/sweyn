# `/app` Directory <Badge type="warning" text="client" />

The `/app` directory is the central location for client-side TypeScript code in a Sweyn application. This directory is specifically designed to store all the front-end logic and components of your application. The files within this directory are bundled using [esbuild](https://esbuild.github.io/).

Once the code in `/app` is bundled, the output is placed in a `/dist` directory, which is publicly accessible and can be served by the web server under the root path (e.g.: `/main.js`).

## Hot Module Replacement (HMR)

During development, the framework supports **Hot Module Replacement (HMR)**, which automatically refreshes the browser whenever a file is updated. This feature helps streamline the development process by instantly reflecting changes in the browser without needing a full reload.
