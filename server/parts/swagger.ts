import path from 'path';
import fs from 'fs';
import type { FastifyInstance } from 'fastify';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';

// Setup automatic OpenAPI specification compilation and enable
// Swagger UI at the `/api` route
export async function setupSwagger(app: FastifyInstance) {
  let appInfo: {
    name?: string;
    description?: string;
    version?: string;
    homepage?: string;
    repository?: string | { url?: string };
  } = {};

  try {
    const packageJson = fs.readFileSync(
      path.join(process.cwd(), 'package.json'),
      { encoding: 'utf-8' }
    );
    appInfo = JSON.parse(packageJson);
  } catch (e) {
    // We only use package.json info to setup Swagger info and links,
    // if we are unable to load them -- that's fine
  }

  const homepage =
    appInfo.homepage ||
    (typeof appInfo.repository === 'string'
      ? appInfo.repository
      : appInfo.repository?.url);

  await app.register(fastifySwagger, {
    openapi: {
      info: {
        title: appInfo.name ?? 'Nerest micro frontend',
        description: appInfo.description,
        version: appInfo.version ?? '',
        contact: homepage
          ? {
              name: 'Homepage',
              url: homepage,
            }
          : undefined,
      },
      externalDocs: {
        url: 'https://github.com/nerestjs/nerest',
        description: 'Built with Nerest',
      },
    },
  });

  await app.register(fastifySwaggerUi, {
    routePrefix: '/api',
  });
}
