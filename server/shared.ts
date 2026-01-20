import fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import type { RouteShorthandOptions } from 'fastify';
import fastifyGracefulShutdown from 'fastify-graceful-shutdown';
import type { ComponentType } from 'react';
import { renderApp } from './parts/render.js';
import { setupSwagger } from './parts/swagger.js';
import { setupValidator, validator } from './parts/validator.js';
import { renderPreviewPage } from './parts/preview.js';
import { setupK8SProbes } from './parts/k8s-probes.js';
import { runRuntimeHook } from './hooks/runtime.js';
import { runPropsHook } from './hooks/props.js';
import { runLoggerHook } from './hooks/logger.js';
import type { Project } from './loaders/project.js';
import { loadPreviewParts } from './loaders/preview.js';
import type { PreviewParts } from './loaders/preview.js';
import type { AppEntry } from './loaders/apps.js';
import { randomId } from './utils.js';

type ServerOptions = {
  root: string;
  project: Project;
  apps: Record<string, AppEntry>;
  loadComponent: (entry: string) => Promise<ComponentType>;
  loadPropsHook: (entry: string) => Promise<unknown>;
  loadRuntimeHook: () => Promise<unknown>;
};

type ServerOptionsWithPreview = ServerOptions & {
  previewParts: PreviewParts;
};

export async function createServer(options: ServerOptions) {
  const { project, root, loadRuntimeHook } = options;

  const app = fastify({
    logger: (await runLoggerHook(loadRuntimeHook)) ?? true,
    routerOptions: {
      ignoreTrailingSlash: true,
    },
    // JSON parsing can take a long time and blocks the event loop,
    // so we need to limit the size of the body. 10MB is a good compromise
    // baseline that was chosen by experimenting with real world usage
    bodyLimit: 10 * 1024 * 1024,
    genReqId(req): string {
      return String(req.headers['x-request-id'] || randomId());
    },
  });

  // Setup payload validation and Swagger based on apps' JSON Schema
  setupValidator(app);
  await setupSwagger(app, project);

  // Load preview parts from `nerest/preview-{part}.html` files
  const previewParts = await loadPreviewParts(root);

  await setupRoutes(app, { ...options, previewParts });

  // Add graceful shutdown handler to prevent requests errors
  await app.register(fastifyGracefulShutdown);

  if (process.env.ENABLE_K8S_PROBES) {
    await setupK8SProbes(app);
  }

  // Execute runtime hook in nerest/runtime.ts if it exists
  await runRuntimeHook(app, loadRuntimeHook);

  return app;
}

async function setupRoutes(
  app: FastifyInstance,
  options: ServerOptionsWithPreview
) {
  const { project, apps, previewParts, loadComponent, loadPropsHook } = options;

  for (const appEntry of Object.values(apps)) {
    const { name, examples, schema, assets } = appEntry;

    const routeOptions: RouteShorthandOptions = {};

    // TODO: report error if schema is missing, making it mandatory
    if (schema) {
      routeOptions.schema = {
        summary: schema.description as string,
        // Tags are used to group routes in Swagger UI
        tags: [name],
        body: {
          ...schema,
          // Examples are also displayed in Swagger UI
          examples: Object.values(examples),
        },
      };
    }

    // POST /api/{name} -> render app with request.body as props
    app.post(`/api/${name}`, routeOptions, async (request) => {
      const component = await loadComponent(name);
      const props = await runPropsHook(
        app,
        () => loadPropsHook(name),
        request.body
      );
      return renderApp({ name, assets, component, project }, props);
    });

    for (const [exampleName, example] of Object.entries(examples)) {
      // Validate examples against schema
      if (schema && !validator.validate(schema, example)) {
        app.log.error(
          `Example "${exampleName}" of app "${name}" does not satisfy schema: ${validator.errorsText()}`
        );
      }

      // GET /api/{name}/examples/{example} -> render a preview page
      const exampleRoute = `/api/${name}/examples/${exampleName}`;
      app.get(
        exampleRoute,
        {
          schema: {
            // Add clickable link to go to the example in Swagger UI
            description: `Open sandbox: [${exampleRoute}](${exampleRoute})`,
            // Place examples under the same tag as the app
            tags: [name],
          },
        },
        async (request, reply) => {
          const component = await loadComponent(name);
          const props = await runPropsHook(
            app,
            () => loadPropsHook(name),
            example
          );
          const { html, assets: outAssets } = renderApp(
            {
              name,
              assets,
              component,
              project,
            },
            props
          );

          reply.type('text/html');
          return renderPreviewPage(html, outAssets, previewParts);
        }
      );
    }
  }
}
