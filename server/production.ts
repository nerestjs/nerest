// This is the nerest production server entrypoint
import path from 'path';
import fs from 'fs/promises';

import fastify from 'fastify';
import type { RouteShorthandOptions } from 'fastify';

import type { AppEntry } from './parts/apps';
import { renderApp } from './parts/render';
import { setupSwagger } from './parts/swagger';
import { validator } from './parts/validator';
import { renderPreviewPage } from './parts/preview';

// TODO: refactor to merge the similar parts between production and development server?
async function runProductionServer() {
  const root = process.cwd();

  // TODO: error handling for file reading
  const apps = JSON.parse(
    await fs.readFile(path.join(root, 'build/nerest-manifest.json'), {
      encoding: 'utf-8',
    })
  ) as Record<string, AppEntry>;

  const components = import.meta.glob('/apps/*/index.tsx', {
    import: 'default',
    eager: true,
  }) as Record<string, React.ComponentType>;

  const app = fastify();

  // Setup schema validation. We have to use our own ajv instance that
  // we can use both to validate request bodies and examples against
  // app schemas
  app.setValidatorCompiler(({ schema }) => validator.compile(schema));

  await setupSwagger(app);

  for (const appEntry of Object.values(apps)) {
    const { name, examples, schema, assets } = appEntry;
    const component = components[`/apps/${name}/index.tsx`];

    const routeOptions: RouteShorthandOptions = {};

    // TODO: report error if schema is missing, unless this app is client-only
    // TODO: disallow apps without schemas in production build
    if (schema) {
      routeOptions.schema = {
        // Use description as Swagger summary, since summary is visible
        // even when the route is collapsed in the UI
        summary: schema.description as string,
        // TODO: do we need to mix in examples like in the development server?
        body: schema,
      };
    }

    // POST /api/{name} -> render app with request.body as props
    app.post(`/api/${name}`, routeOptions, (request) =>
      renderApp(
        { name, assets, component },
        request.body as Record<string, unknown>
      )
    );

    for (const [exampleName, example] of Object.entries(examples)) {
      // GET /api/{name}/examples/{example} -> render a preview page
      // with a predefined example body
      const exampleRoute = `/api/${name}/examples/${exampleName}`;
      app.get(
        exampleRoute,
        {
          schema: {
            // Add a clickable link to the example route in route's Swagger
            // description so it's easier to navigate to
            description: `Open sandbox: [${exampleRoute}](${exampleRoute})`,
          },
        },
        async (_, reply) => {
          const { html, assets: outAssets } = renderApp(
            {
              name,
              assets,
              component,
            },
            example as Record<string, unknown>
          );

          reply.type('text/html');

          return renderPreviewPage(html, outAssets);
        }
      );
    }
  }

  // TODO: remove hardcoded port
  await app.listen({
    host: '0.0.0.0',
    port: 3000,
  });

  console.log('Nerest is listening on 0.0.0.0:3000');
}

runProductionServer();
