---
sidebar_position: 2
---

# Tutorial

If you're new to micro frontends or have never worked with Nerest before, you're in the right place. In this guide, we'll walk you through setting up your first micro frontend with Nerest, from development to deployment. You'll also learn how to integrate it into an existing application.

You can [clone and run the complete project](https://github.com/nerestjs/tutorial) or follow this guide to build it from scratch.

## What are Micro Frontends?

Micro frontends are an architectural approach that breaks down a monolithic frontend into smaller, more manageable pieces. Each micro frontend represents an independently deployable and functional piece of the user interface.

The core idea is similar to microservices on the backend, where each microservice handles a specific function and communicates with others over well-defined APIs. With micro frontends, each piece of the UI is self-contained and can be developed using different technologies, frameworks, or even teams, without impacting the rest of the application.

Nerest is a framework that simplifies the process of building micro frontends and allows you to efficiently bootstrap these smaller frontend microservices. It handles the server-side rendering and integration, allowing you to focus on developing React components, while still providing flexibility for server-side customization when necessary.

We'll start experimenting with Nerest by setting up the project from scratch.

## Setting Up the Project

Begin by creating a new directory for your project and initializing it with the required dependencies:

```sh
mkdir nerest-tutorial
cd nerest-tutorial

npm init -y
npm i @nerest/nerest react react-dom
npm i --save-dev typescript @tsconfig/vite-react @types/react @types/react-dom
```

Next, update the project to use ES Modules. Add `"type": "module"` to your `package.json`. The file should look something like this:

```json
{
  "name": "nerest-tutorial",
  "private": true,
  "type": "module",
  "dependencies": {
    "@nerest/nerest": "^1.0.15",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@tsconfig/vite-react": "^3.4.0",
    "@types/react": "^18.3.18",
    "@types/react-dom": "^18.3.5",
    "typescript": "^5.7.3"
  }
}
```

Since Nerest uses TypeScript, create a `tsconfig.json` to configure it for the project. It is convenient to use `@tsconfig/vite-react` as a base:

```json
{
  "extends": "@tsconfig/vite-react/tsconfig.json",
  "compilerOptions": {
    "types": ["vite/client"]
  },
  "include": ["apps/**/*", "lib/**/*", "nerest/**/*"]
}
```

The `include` array specifies directories where your code will reside, based on conventions for Nerest projects:

- `/apps` stores all apps of the micro frontend that get auto-discovered by Nerest
- `/lib` holds all code that doesn't belong to a specific app or is shared between multiple of them
- `/nerest` stores global hooks and project configuration files

This conventional locations are described in full [in the README](https://github.com/nerestjs/nerest/blob/main/README.md).

With the base setup complete, you're ready to create your first app within this micro frontend.

## Creating an App

In Nerest, a micro frontend consists of one or more apps. Each app is a standalone component within a single microservice that can be invoked and rendered over HTTP. For instance, a `scaffold` microservice might contain separate `header` and `footer` apps.

Each app's entry point is an `index.tsx` file, such as `/apps/header/index.tsx`. When the micro frontend server runs, this file automatically becomes accessible as an HTTP route like `/api/header`.

Create the directory structure for the `header` app and add its entry file:

```sh
mkdir -p apps/header
touch apps/header/index.tsx
```

In `apps/header/index.tsx`, export a React component as the default. This component will render whenever the app's endpoint is invoked:

```typescript
export default function HeaderApp() {
  return (
    <header>
      <a href="#">Nerest Tutorial</a>
      <nav>
        <a href="#">Develop</a>
        <a href="#">Build</a>
        <a href="#">Deploy</a>
      </nav>
    </header>
  );
}
```

To run the micro frontend in development mode, use the `nerest watch` command. Add it to your `package.json` for convenience:

```sh
npm pkg set scripts.watch="nerest watch"
```

Start the service with `npm run watch` and visit `http://127.0.0.1:3000/api` in your browser. You will see a Swagger UI with the `/api/header` endpoint automatically listed. Test the endpoint using Swagger UI or the `curl` command:

```sh
curl -XPOST -H "Content-type: application/json" -d "{}" "http://127.0.0.1:3000/api/header"
```

The response will include the rendered `html` of the header app along with the `assets` that must be embeded into the target page to make it styled and interactive:

```json
{
  "html": "<div data-project-name=\"nerest-tutorial\" data-app-name=\"header\" data-app-id=\"EPfJgfRXa3NzGdFRT5RCH\"><header><a href=\"#\">Nerest Tutorial</a><nav><a href=\"#\">Develop</a><a href=\"#\">Build</a><a href=\"#\">Deploy</a></nav></header></div><script type=\"application/json\" data-app-id=\"EPfJgfRXa3NzGdFRT5RCH\">{}</script>",
  "assets": ["http://127.0.0.1:3000/index.js"]
}
```

Your React component is now available over HTTP. However, as it currently renders static content, extracting it into a microservice may seem unnecessary. In the next step, you’ll modify the app to dynamically render content based on request data.

## Use Request Data

To make micro frontends dynamic, you can pass JSON data in the request body and use it as props in the app's `index.tsx` component. Let's modify the `header` app to display a countdown, where the initial value comes from the request.

First, define the expected request format using [JSON Schema](https://json-schema.org/). Create `apps/header/schema.json` with the following content:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema",
  "title": "HeaderProps",
  "description": "Renders website's header with countdown",
  "type": "object",
  "properties": {
    "countdownSeconds": { "type": "number" }
  },
  "required": ["countdownSeconds"]
}
```

The `schema.json` file in the root of the app is conventional and automatically detected by Nerest. Once the schema is in place, generate TypeScript definitions from it using `nerest typegen` command. Add it to `package.json`:

```sh
npm pkg set scripts.typegen="nerest typegen"
```

Run `npm run typegen`, and a `schema.d.ts` file will be created alongside `schema.json`. It contains the generated TypeScript interface:

```typescript
export interface HeaderProps {
  countdownSeconds: number;
  [k: string]: unknown;
}
```

Now, import the generated type in `index.tsx` and use it to render the countdown value dynamically:

```typescript
import type { HeaderProps } from "./schema";

export default function HeaderApp({ countdownSeconds }: HeaderProps) {
  return (
    <header>
      <a href="#">Nerest Tutorial</a>
      <nav>
        <a href="#">Develop</a>
        <a href="#">Build</a>
        <a href="#">Deploy</a>
      </nav>
      <div>{countdownSeconds} seconds left</div>
    </header>
  );
}
```

Restart the server using `npm run watch` and visit `http://127.0.0.1:3000/api`. Swagger UI now reflects the schema, including a description and sample data. Test the app by sending a request with a countdown value:

```sh
curl -XPOST -H "Content-type: application/json" -d '{"countdownSeconds":1000}' "http://127.0.0.1:3000/api/header"
```

The response includes the rendered countdown:

```typescript
<div>1000<!-- --> seconds left</div>
```

The server also uses the schema to validate the body of the request, and returns an error if it is invalid. For instance, sending a request that's missing a required property:

```sh
curl -XPOST -H "Content-type: application/json" -d '{}' "http://127.0.0.1:3000/api/header"
```

Produces this descriptive error:

```json
{
  "statusCode": 400,
  "code": "FST_ERR_VALIDATION",
  "error": "Bad Request",
  "message": "body must have required property 'countdownSeconds'"
}
```

This ensures robust error handling. Next, we’ll set up interactive previews to improve the development workflow.

## Set up interactive previews

Interactive previews allow you to test your app's behavior with different inputs (request bodies) by rendering it with various sets of example data that match the schema. These inputs are placed under the conventional location `apps/{name}/examples/*.json`. To set this up, create an example file for the header app:

```sh
mkdir apps/header/examples
echo '{ "countdownSeconds": 5 }' > apps/header/examples/five.json
```

After restarting the service with `npm run watch`, you'll find a new Swagger UI row with the `GET /api/header/examples/five` endpoint. Expand it and click on "Open sandbox" to see your app fully rendered using the example data.

Next, enhance the app with dynamic countdown functionality and styling to demonstrate how the preview is fully functional. Create `index.module.css` alongside `index.tsx` and edit both files:

```typescript
// index.tsx

import { useEffect, useState } from "react";
import type { HeaderProps } from "./schema";
import styles from "./index.module.css";

export default function HeaderApp({ countdownSeconds }: HeaderProps) {
  const [secondsLeft, setSecondsLeft] = useState(countdownSeconds);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prevSeconds) => Math.max(prevSeconds - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  });

  return (
    <header className={styles.header}>
      <a href="#" className={styles.logo}>
        Nerest Tutorial
      </a>
      <nav className={styles.nav}>
        <a href="#">Develop</a>
        <a href="#">Build</a>
        <a href="#">Deploy</a>
      </nav>
      <div className={styles.countdown}>{secondsLeft} seconds left</div>
    </header>
  );
}
```

```css
/** index.module.css **/

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #282c34;
  color: #ffffff;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: #61dafb;
}

.nav {
  display: flex;
  gap: 1rem;
}

.nav a {
  color: #ffffff;
  text-decoration: none;
  font-size: 1rem;
}

.nav a:hover {
  text-decoration: underline;
}

.countdown {
  font-size: 1rem;
  color: #adb5bd;
}
```

Visit `http://127.0.0.1:3000/api/header/examples/five`. The rendered header now includes styled elements, and the countdown timer dynamically decrements every second, stopping at zero.

Interactive previews are invaluable for debugging and testing. They provide a live-rendered view of your app with specific input data, ensuring it functions as expected across various scenarios. They also simplify automating end-to-end tests.

Next, we’ll explore modifying the request data on the server, by injecting a random affirmation from an external API into the header, without having to make this request from the client-side.

## Modifying Request Data on the Server

`props.ts` hook defines the server-side logic for modifying the request body on the server before passing it to the `index.tsx` component. It supports asynchronous operations, enabling tasks like network requests or file handling.

For this example, we'll fetch an affirmation from the https://affirmations.dev API and display it in the header. Begin by adding an `affirmation` property to the `schema.json` file:

```json
"properties": {
  "countdownSeconds": { "type": "number" },
  "affirmation": { "type": "string" }
},
```

Run `npm run typegen` to regenerate the TypeScript definitions to include the new property.

Next, create a conventional `props.ts` file in `apps/header`. Export a default asynchronous function that fetches an affirmation and adds it to the props:

```typescript
import { HeaderProps } from './schema';

export default async (props: HeaderProps) => {
  const response = await fetch('https://affirmations.dev');
  const affirmation = await response.json();
  return {
    ...props,
    ...affirmation,
  };
};
```

Update `index.tsx` to display the fetched affirmation, for example replacing the navigation links:

```typescript
export default function HeaderApp({
  countdownSeconds,
  affirmation,
}: HeaderProps) {
  ...

  return (
      ...
      <nav className={styles.nav}>
        <div>{affirmation}</div>
      </nav>
      ...
  );
}
```

Restart the development server using `npm run watch` and visit `http://127.0.0.1:3000/api/header/examples/five`. Each refresh will fetch and display a new affirmation from the API.

The `props.ts` hook is a powerful tool for server-side processing. It allows you to:

- Configure your app with server-side environment variables.
- Fetch data or perform asynchronous operations before rendering.
- Keep sensitive data secure by not exposing it to the client.

Remember that the object returned by the `props.ts` function is serialized and sent to the client to hydrate the component, do not return any secrets that should remain on the server-side.

Next, we’ll explore how to embed a micro frontend in another server-side application.

## Embed the Micro Frontend in a Facade

To embed a micro frontend within a server-side generated page, you can set up a facade application that integrates various micro frontends, with each micro frontend responsible for rendering different parts of the page. This pattern allows the facade to manage the overall layout, while micro frontends handle their respective content areas.

We'll demonstrate this by embedding the header app from our micro frontend. Start by creating a new directory and installing Fastify:

```sh
mkdir nerest-facade
cd nerest-facade

npm init -y
npm i fastify
```

In the `nerest-facade` directory, create a `server.js` file with the following code:

```js
const fastify = require('fastify')({ logger: true });

fastify.get('/', async (request, reply) => {
  try {
    const response = await fetch('http://127.0.0.1:3000/api/header', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        countdownSeconds: secondsUntilEndOfDay(),
      }),
    });

    const appJson = await response.json();

    const stylesString = appJson.assets
      .filter((a) => a.endsWith('.css'))
      .map((href) => `<link rel="stylesheet" href="${href}">`)
      .join('');

    const scriptsString = appJson.assets
      .filter((a) => a.endsWith('.js'))
      .map((href) => `<script type="module" src="${href}"></script>`)
      .join('');

    // Simple HTML page embedding the header app
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Header App Embed</title>
        <!-- Embed the styles -->
        ${stylesString}
      </head>
      <body>
        <main>
          <!-- Embed the markup -->
          ${appJson.html}
          <!-- Embed the scripts -->
          ${scriptsString}
        </main>
      </body>
      </html>
    `;

    reply.type('text/html').send(htmlContent);
  } catch (error) {
    reply.status(500).send('Error embedding the header app');
  }
});

async function start() {
  try {
    await fastify.listen({ port: 3001 });
    console.log('Server running at http://127.0.0.1:3001/');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

function secondsUntilEndOfDay() {
  const d = new Date();
  const h = d.getHours();
  const m = d.getMinutes();
  const s = d.getSeconds();
  return 24 * 60 * 60 - h * 60 * 60 - m * 60 - s;
}

start();
```

In this setup, the facade fetches the header app from `http://127.0.0.1:3000/api/header`, passing the number of seconds remaining until midnight. It then assembles the HTML, CSS, and JavaScript files into a final page that is returned to the client. This simple example uses string concatenation for generating the final HTML, but in production, you would likely use a templating engine for more flexibility and maintainability.

To run the application, execute `node server.js` from the `nerest-facade` directory. Ensure your micro frontend service is running (use `npm run watch` in the `nerest-tutorial` directory). Then, navigate to `http://127.0.0.1:3001/` in your browser, where you'll see the header app embedded within the layout of the facade.

We'll finally explore how to generate a production build of a Nerest micro frontend and deploy it to a production environment.

## Create a production build

To create a production build of a Nerest micro frontend, you will use the `nerest build` command, which generates both a client-side and a server-side build. The client-side build is split into dynamic chunks that the browser loads for interactivity, while the server-side build facilitates server rendering and includes the list of necessary assets for client hydration.

First, specify the location where your client-side assets will be deployed (typically a CDN or static file host). For this example, we’ll assume the assets will be deployed to `https://cdn.example/nerest-tutorial/`. Start by adding a build command to your `package.json`:

```sh
npm pkg set scripts.build="nerest build"
```

Then, run the build command while setting the `STATIC_PATH` environment variable to point to your asset location:

```sh
STATIC_PATH=https://cdn.example/nerest-tutorial/ npm run build
```

This will generate a `build` directory that contains both the client-side and server-side builds. To ensure the app functions correctly, deploy the contents of the `build/client/assets` directory so that they are accessible at the specified `STATIC_PATH`.

For server-side deployment, you need to deploy the entire `build` directory, along with your `node_modules`, to your server. Once deployed, you can start the micro frontend on the server by running `node build/server.mjs`.

By following these steps, your Nerest micro frontend is set up and fully operational in a production environment.

## What's next?

For more advanced usage and details on Nerest, refer to the following resources:

- The [README](https://github.com/nerestjs/nerest/blob/main/README.md) offers a concise reference covering all available options and configurations for Nerest micro frontends, including features not covered in this guide.
- The [How-to section](/how-to/index.md) provides practical instructions on embedding and deploying micro frontends with Nerest. It includes real-world examples and solutions to help you implement your micro frontends effectively.
- The [Explanations section](/explanations/index.md) provides an in-depth look into the internal workings of the Nerest framework.
