# @nerest/nerest

React micro frontend framework

> TODO: purpose, outline, documentation

## Installation

```
npm i --save @nerest/nerest react react-dom
```

## Points of Interest

- SSR server entry:
  - Development: [server/development.ts](server/development.ts)
  - Production: [server/production.ts](server/production.ts)
- Hydrating client entry: [client/index.ts](client/index.ts)
- CLI entry: [bin/index.ts](bin/index.ts)

## Conventions

The `apps` directory must contain all of the apps provided by the micro frontend. E.g. `/apps/foo/index.tsx` is the entrypoint component of the `foo` app. It becomes available as the `/api/foo` route of the micro frontend server.

See [nerest-harness](https://github.com/nerestjs/harness) for the minimal example of a nerest micro frontend.

### Examples (`/examples/*.json`)

The app directory may contain an `examples` subdirectory with example JSON files which can be used as props for the app entrypoint component. E.g. `/apps/foo/examples/example-1.json` becomes available as the `/api/foo/examples/example-1` route of the micro frontend server.

### Schema (`/schema.json`)

The app directory should contain a `schema.json` file that describes the schema of a request body for this specific app in the [JSON Schema language](https://json-schema.org/). All requests sent to this app, and app examples from the `examples` subdirectory will be validated against this schema. `ajv` and `ajv-formats` are used for validation, so all JSON Schema features implemented by them are supported.

OpenAPI specification is compiled automatically based on the provided schemas and becomes available at `/api/json`. It can also be explored through Swagger UI that becomes available at `/api`.

## Development

Run the build script to build the framework.

```
npm install
npm run build
```

Use [nerest-harness](https://github.com/nerestjs/harness) with `npm link` to test changes locally.
