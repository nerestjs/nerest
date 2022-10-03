// This is the nerest server entrypoint
import fastify from 'fastify';
import vite from 'vite';

import { loadApps } from './apps';
import { renderSsrComponent } from './entry';

export async function createServer() {
  const root = process.cwd();

  const viteSsr = await vite.createServer({ root, appType: 'custom' });

  const apps = await loadApps(root);

  const app = fastify();

  Object.entries(apps).forEach(([appName, appEntry]) => {
    app.get(`/api/${appName}`, async (request, reply) => {
      const ssrComponent = await viteSsr.ssrLoadModule(appEntry.entry);
      const markup = renderSsrComponent(ssrComponent.default);

      reply.type('text/html');

      return markup;
    });
  });

  return { app };
}
