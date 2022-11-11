# @nerest/nerest

React micro frontend framework

> TODO: purpose, outline, documentation

## Installation

```
npm i --save @nerest/nerest react react-dom
```

## Conventions

The `apps` directory must contain all of the apps provided by the micro frontend. E.g. `/apps/foo/index.tsx` is the entrypoint component of the `foo` app. It becomes available as the `/api/foo` route of the micro frontend server.

The single app directory may contain an `examples` subdirectory with example JSON files which can be used as props for the app entrypoint component. E.g. `/apps/foo/examples/example-1.json` becomes available as the `/api/foo/examples/example-1` route of the micro frontend server.

See [nerest-harness](https://github.com/nerestjs/harness) for the minimal example of a nerest micro frontend.

## Development

Run the build script to build the framework.

```
npm install
npm run build
```

Use [nerest-harness](https://github.com/nerestjs/harness) with `npm link` to test changes locally.
