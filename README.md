# Nerest

Nerest is an opinionated micro frontend framework/stack for building SSR applications with TypeScript, Fastify, JSON Schema and React. It is available as a single `@nerest/nerest` npm package.

[View current documentation](https://nerestjs.github.io/docs/)

## Quick Start

[Follow the tutorial](https://nerestjs.github.io/docs/tutorial/) to build your first Nerest micro frontend step-by-step, or clone and run [the complete version](https://github.com/nerestjs/tutorial) of that micro frontend locally.

## Conventions

### `/apps`

The `/apps` directory must contain all of the apps provided by the micro frontend. E.g. `/apps/foo/index.tsx` is the entrypoint component of the `foo` app. It becomes available as the `/api/foo` route of the micro frontend server.

#### Examples (`/examples/*.json`)

The app directory may contain an `examples` subdirectory with example JSON files which can be used as props for the app entrypoint component. E.g. `/apps/foo/examples/example-1.json` becomes available as the `/api/foo/examples/example-1` route of the micro frontend server.

#### Schema (`/schema.json`)

The app directory should contain a `schema.json` file that describes the schema of a request body for this specific app in the [JSON Schema language](https://json-schema.org/). All requests sent to this app, and app examples from the `examples` subdirectory will be validated against this schema. `ajv` and `ajv-formats` are used for validation, so all JSON Schema features implemented by them are supported.

OpenAPI specification is compiled automatically based on the provided schemas and becomes available at `/api/json`. It can also be explored through Swagger UI that becomes available at `/api`.

#### Props Hook (`/props.ts`)

The app directory may contain a `props.ts` module that exports a default function. If it exists, this function will be executed on the server for every incoming request, receiving the body of the request and a logger as parameters. You can use this hook to modify and return a new object, which will be passed down to the `index.tsx` entrypoint component instead. For example:

```typescript
import type { FastifyBaseLogger } from 'fastify';

export default function (props: Props, logger: FastifyBaseLogger) {
  logger.info('Hello from props.ts!');

  return {
    ...props,
    greeting: `${props.greeting} (modified in props.ts)`,
  };
}
```

The exported function may be async, in which case Nerest will wait for the Promise to resolve, then pass the result object to the entrypoint component.

### `/package.json`

`name`, `description`, `version`, `homepage` and `repository` fields of the root `package.json` file are used to display project info in the header of the generated Swagger page.

`name` is also used to disambiguate multiple apps with the same name from different micro frontends. If you have multiple apps with the same name embeded in a single page, make sure that the `name` field of their micro frontends' `package.json` files is unique.

## Configuration

Different aspects of Nerest apps can be configured via environment variables, JSON configuration and runtime hooks written in TypeScript.

### Environment Variables

#### Buildtime

##### STATIC_PATH

`STATIC_PATH` is required for production build and should contain the URL where the client static assets will be deployed. It enables the server-side renderer to return their paths in the assets field of the response.

In development, it is optional and can be used to load example previews' assets from a different address than the default `127.0.0.1:$PORT`. This allows debugging of the micro frontend from another device on the same local network. For example, run `STATIC_PATH=<local_ip>:<port> npm run watch` and access previews from another device on the same network by going to `http://<local_ip>:<port>/api/`

#### Runtime

##### Client

All environment variables prefixed with `NEREST_` will be bundled with your app during buildtime. You can access them in the code using the special `import.meta.env` object. For example, `import.meta.env.NEREST_SOMEVAR` will be statically replaced during buildtime with the value of this environment variable on the build machine.

##### Server

Environment variables for runtime configuration:

- `PORT`: Sets the port number for the application. The default port is 3000.
- `ENABLE_K8S_PROBES`: Enables additional routes `/livenessProbe` and `/readinessProbe` to check the application status, useful for Kubernetes healthchecks.
- `DISABLE_SCHEMA_VALIDATION`: Disables validation of request body against app schema. Can be used in production to speed up request time.

### Build

Customize the build output by placing an optional `nerest/build.json` configuration file in the micro frontend's root directory. Refer to the [schemas/nerest-build.schema.json](schemas/nerest-build.schema.json) for the full schema of this file.

#### excludes: `string[]`

Excludes modules from the production client build and replaces their imports with imports of an empty module instead. You can use this to exclude either JS or CSS modules from the final build.

```
"excludes": ["@scope/name"]
```

#### externals: `Record<string, string>`

Excludes modules from the production client build and maps them to globally available constants instead. You can use this to share common dependencies between different micro frontends by exposing them on the `window` object. For example:

```
"externals": {
  "react": "window.React",
  "react-dom": "window['ReactDOM']"
}
```

Here `react` and `react-dom` imports will be replaced with accessing the respective `window` constants.

#### postcss.plugins: `Record<string, PluginOptions>`

Include specified PostCSS plugins in the build by providing their full package names as keys and their options as values. Make sure to install these plugins using `npm install` beforehand. Use an empty object for default options. Example:

```json
"postcss": {
  "plugins": {
    "postcss-extend": {},
    "postcss-short": {
      "features": {
        "position": false
      }
    }
  }
}
```

In the above example, `postcss-extend` is added to vite's PostCSS configuration with default options, enabling the use of `@extend` rules in CSS code. `postcss-short` is added with specific options provided.

### Runtime

If the module `nerest/runtime.ts` exists in the micro frontend's root directory and exports a default function, it will be executed when the server starts. The Fastify app instance will be passed as the function's only argument. Example of `nerest/runtime.ts`:

```typescript
import type { FastifyInstance } from 'fastify';

export default function (app: FastifyInstance) {
  console.log('Hello from nerest/runtime.ts');
}
```

This runtime hook can be used to adjust fastify settings, register additional plugins or add custom routes.

#### Logger

Nerest uses the [default server-side fastify logger](https://fastify.dev/docs/latest/Reference/Logging/#logging), enabled by default. To configure or disable it, export a `logger` function from the `nerest/runtime.ts` module. This function will be called on server start, and its return value will be used as the logger configuration for Fastify.

```typescript
import type { FastifyServerOptions } from 'fastify';

export function logger(): FastifyServerOptions['logger'] {
  return { prettyPrint: true };
}
```

To disable the logger, return `false` from the function.

### Preview

For customizing micro frontend previews, create a `nerest/preview-head.html` file in the project's root directory. This file allows you to modify the preview rendering by appending your own HTML markup, such as metadata, external stylesheets, or scripts to the end of the `<head>`. Use it to to enhance the appearance and behavior of previews according to your specific needs.

```html
<!-- Pull in static files served from the internet -->
<link rel="preload" href="https://example.com/cdn/fonts/my-font.woff2" />

<!-- Or load custom head-tag JavaScript -->
<script src="https://example.com/sample.js"></script>
<script>
  Sample.load();
</script>
```

## CLI

### `nerest build`

Creates the production build of the micro frontend, generating the necessary files in the build directory.

- Serverside entry is outputted to the `build/server.mjs` file.
- Clientside static files are outputted to the `build/client/assets` directory. These files should be made available [at the `STATIC_PATH` URL](#static_path).

### `nerest typegen`

Generates TypeScript type definitions for the micro frontend's app schemas and outputs them to the schema.d.ts file, located next to the corresponding schema file. By default, it searches for schema files in the root directories of app directories.

To override this behavior, provide a list of globs to the nerest typegen command. Remember to quote the globs to ensure they are executed by nerest and not your shell. For example:

```
nerest typegen 'apps/*/schema.json' 'schemas/*.json'
```

### `nerest watch`

Starts the development server on the default port 3000. The server will automatically reload when changes are made to the app's source code.

## Development

Run the build script to build the framework.

```
npm install
npm run build
```

- SSR server entry:
  - Development: [server/development.ts](server/development.ts)
  - Production: [server/production.ts](server/production.ts)
- Hydrating client entry: [client/index.ts](client/index.ts)
- CLI entry: [bin/index.ts](bin/index.ts)
- Production build script: [build/index.ts](build/index.ts)

## Testing

Nerest uses Vitest for both module and integration tests. Run module tests with:

```bash
npm run test:module
```

Integration tests verify the framework as a whole using a test harness micro frontend located in [`tests/integration/harness`](tests/integration/harness). There are two modes:

```bash
# Development mode - includes browser tests
npm run test:integration:dev

# Production mode - tests production build
npm run test:integration:prod
```

Development mode tests include browser-based tests using Playwright to verify client-side hydration and interactivity. Production mode tests verify the production build and server functionality.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for more information.
