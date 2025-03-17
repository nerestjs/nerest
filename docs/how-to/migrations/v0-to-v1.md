# v0 to v1

The release of Nerest v1 coincides with Fastify v5, which [introduces some breaking changes](https://fastify.dev/docs/latest/Guides/Migration-Guide-V5/). The following notes will assist in the migration of your Nerest projects to v1.

## Mandatory Full JSON Schema for App Schemas

Fastify v5 enforces the use of complete JSON schemas. Implicit defaults like `"type": "object"` are no longer assumed for root objects in `schema.json`. No adjustments are necessary if your schemas are already fully specified.

In v1, you must define the root object type and properties explicitly, as shown below:

```json
// Before (v0) - apps/foo/schema.json
{
  "name": { "type": "string" },
  "age": { "type": "number" }
}
```

```json
// After (v1) - apps/foo/schema.json
{
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "age": { "type": "number" }
  },
  "required": ["name", "age"]
}
```

## Changes to Logger Hook

In Nerest v0, the `logger()` hook in `nerest/runtime.ts` could return a custom pino-compatible logger instance or a configuration object. With v1, due to changes in Fastify v5, you must now only return a configuration object from the logger hook; returning a custom logger instance is no longer supported.
