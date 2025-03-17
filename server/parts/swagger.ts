import type { FastifyInstance } from 'fastify';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';

import type { Project } from '../loaders/project.js';

// Setup automatic OpenAPI specification compilation and enable
// Swagger UI at the `/api` route
export async function setupSwagger(app: FastifyInstance, project: Project) {
  const homepage =
    project.homepage ||
    (typeof project.repository === 'string'
      ? project.repository
      : project.repository?.url);

  await app.register(fastifySwagger, {
    openapi: {
      info: {
        title: project.name || 'Nerest micro frontend',
        description: project.description,
        version: project.version ?? '',
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
