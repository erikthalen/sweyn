# API Server Documentation

This documentation provides an overview of how to create and interact with an API server using the framework. Each file in the `/api` directory represents an individual server-side API endpoint, with support for different HTTP methods like GET, POST, etc.

## Overview

The `/api` directory allows you to define server-side API endpoints by creating TypeScript files. Each file corresponds to an API endpoint, and you can control the logic for handling requests and responses in these files. The framework automatically maps each file to a specific API route.

For example, the file `/api/my-endpoint.ts` would automatically become accessible via the `/api/my-endpoint` route.

## File Structure

```
/api
  ├── my-endpoint.ts
  ├── create-user.post.ts
  ├── users.get.ts
/app
  ├── main.ts
```

- **/api/**: Contains the API route files. Each file in this folder represents an API endpoint, where the file name determines the endpoint's URL and the HTTP method it handles.
- **/app/**: Contains application code. The example shows how the front-end can consume the API endpoints defined in `/api`.

## Defining API Endpoints

Each API endpoint is defined in a TypeScript file located in the `/api` folder. The contents of the file export a function that handles HTTP requests and returns the desired response.

### Example: Basic API Endpoint

#### `/api/my-endpoint.ts`

```ts
import type { IncomingMessage, ServerResponse } from 'http'

export default (req: IncomingMessage, res: ServerResponse) => {
  return { data: 'Hello World!' }
}
```

- This file corresponds to the endpoint `/api/my-endpoint`.
- When accessed, it will return a JSON response: `{ data: 'Hello World!' }`.

## Handling Different HTTP Methods

To handle different HTTP methods (such as `GET`, `POST`, `PUT`, `DELETE`), you can add `.method.ts` to the filename. For example:

### Example: Handling POST and GET Requests

#### `/api/create-user.post.ts`

```ts
import type { IncomingMessage, ServerResponse } from 'http'

export default (req: IncomingMessage, res: ServerResponse) => {
  // Logic for handling POST request to create a user
  return { message: 'User Created Successfully' }
}
```

- This file listens for `POST` requests at `/api/create-user`.
- When a `POST` request is sent, the API responds with a message: `{ message: 'User Created Successfully' }`.

#### `/api/users.get.ts`

```ts
import type { IncomingMessage, ServerResponse } from 'http'

export default (req: IncomingMessage, res: ServerResponse) => {
  // Logic for handling GET request to fetch users
  return {
    users: [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ],
  }
}
```

- This file listens for `GET` requests at `/api/users`.
- It responds with a list of users: `{ users: [...] }`.

By naming the file with the appropriate `.method.ts` suffix, the server can differentiate between different HTTP methods for the same endpoint.
