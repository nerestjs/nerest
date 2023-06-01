// This is the nerest development server entrypoint
import path from 'path';
import type { ServerResponse } from 'http';

import vite from 'vite';
import type { InlineConfig } from 'vite';
import type { RollupWatcher, RollupWatcherEvent } from 'rollup';

import type { RouteShorthandOptions } from 'fastify';
import fastify from 'fastify';
import fastifyStatic from '@fastify/static';

import { loadApps } from './parts/apps';
import { renderApp } from './parts/render';
import { renderPreviewPage } from './parts/preview';
import { validator } from './parts/validator';
import { setupSwagger } from './parts/swagger';

export async function runDevelopmentServer() {
  const root = process.cwd();

  // TODO: move build config into a separate file
  // TODO: look at @vitejs/plugin-react (everything seems fine without it though)
  // TODO: look at @vitejs/plugin-legacy (needed for browsers without module support)
  const config: InlineConfig = {
    root,
    appType: 'custom',
    server: { middlewareMode: true },
    build: {
      // Manifest is needed to report used assets in SSR handles
      manifest: true,
      modulePreload: false,
      // TODO: watch is only necessary for the client build
      watch: {},
      rollupOptions: {
        input: '/node_modules/@nerest/nerest/client/index.ts',
        output: {
          dir: 'build',
          entryFileNames: `client/assets/[name].js`,
          chunkFileNames: `client/assets/[name].js`,
          assetFileNames: `client/assets/[name].[ext]`,
        },
      },
    },
    // TODO: this doesn't seem to work without the index.html file entry and
    // produces warnings in dev mode. look into this maybe
    optimizeDeps: {
      disabled: true,
    },
  };

  // Build the clientside assets and watch for changes
  // TODO: this should probably be moved from here
  await startClientBuildWatcher(config);

  // Load app entries following the `apps/{name}/index.tsx` convention
  const apps = await loadApps(root);

  // Start vite server that will be rendering SSR components
  const viteSsr = await vite.createServer(config);
  const app = fastify();

  // Setup schema validation. We have to use our own ajv instance that
  // we can use both to validate request bodies and examples against
  // app schemas
  app.setValidatorCompiler(({ schema }) => validator.compile(schema));

  await setupSwagger(app);

  for (const appEntry of Object.values(apps)) {
    const { name, entry, examples, schema } = appEntry;

    const routeOptions: RouteShorthandOptions = {};

    // TODO: report error if schema is missing, unless this app is client-only.
    // TODO: disallow apps without schemas in production build
    if (schema) {
      routeOptions.schema = {
        // Use description as Swagger summary, since summary is visible
        // even when the route is collapsed in the UI
        summary: schema.description as string,
        body: {
          ...schema,
          // Mix examples into the schema so they become accessible
          // in the Swagger UI
          examples: Object.values(examples),
        },
      };
    }

    // POST /api/{name} -> render app with request.body as props
    app.post(`/api/${name}`, routeOptions, async (request) => {
      // ssrLoadModule drives the "hot-reload" logic, and allows
      // picking up changes to the source without restarting the server
      const ssrComponent = await viteSsr.ssrLoadModule(entry, {
        fixStacktrace: true,
      });
      return renderApp(
        {
          name,
          assets: appEntry.assets,
          component: ssrComponent.default,
        },
        request.body as Record<string, unknown>
      );
    });

    for (const [exampleName, example] of Object.entries(examples)) {
      // Validate example against schema when specified
      if (schema && !validator.validate(schema, example)) {
        // TODO: use logger and display errors more prominently
        console.error(
          `Example "${exampleName}" of app "${name}" does not satisfy schema: ${validator.errorsText()}`
        );
      }

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
          const ssrComponent = await viteSsr.ssrLoadModule(entry, {
            fixStacktrace: true,
          });
          const { html, assets } = renderApp(
            {
              name,
              assets: appEntry.assets,
              component: ssrComponent.default,
            },
            example as Record<string, unknown>
          );

          reply.type('text/html');

          return renderPreviewPage(html, assets);
        }
      );
    }
  }

  // TODO: only do this locally, load from CDN in production
  await app.register(fastifyStatic, {
    root: path.join(root, 'build'),
    // TODO: maybe use @fastify/cors instead
    setHeaders(res: ServerResponse) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET');
      res.setHeader(
        'Access-Control-Allow-Headers',
        'X-Requested-With, content-type, Authorization'
      );
    },
  });

  // TODO: remove hardcoded port
  await app.listen({
    host: '0.0.0.0',
    port: 3000,
  });

  console.log('Nerest is listening on 0.0.0.0:3000');
}

// TODO: this should probably be moved from here
async function startClientBuildWatcher(config: InlineConfig) {
  const watcher = (await vite.build(config)) as RollupWatcher;
  return new Promise<void>((resolve) => {
    // We need to have a built manifest.json to provide assets
    // links in SSR. We will wait for rollup to report when it
    // has finished the build
    const listener = (ev: RollupWatcherEvent) => {
      if (ev.code === 'END') {
        watcher.off('event', listener);
        resolve();
      }
    };
    watcher.on('event', listener);
  });
}
