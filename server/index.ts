// This is the nerest server entrypoint
import fastify from 'fastify';
import vite from 'vite';

import type { InlineConfig } from 'vite';

import { loadApps } from './apps';
import { renderSsrComponent } from './entry';

export async function createServer() {
  const root = process.cwd();

  const config: InlineConfig = {
    root,
    appType: 'custom',
    build: {
      manifest: true,
      modulePreload: false,
      rollupOptions: {
        input: '/node_modules/@nerest/nerest/client/entry.ts',
      },
    },
  };

  const viteSsr = await vite.createServer(config);

  // TODO: this is here temporarily for testing purposes only
  await vite.build(config);

  const apps = await loadApps(root);

  const app = fastify();

  for (const [appName, appEntry] of Object.entries(apps)) {
    app.post(`/api/${appName}`, async (request) => {
      const ssrComponent = await viteSsr.ssrLoadModule(appEntry.entry);
      const html = renderSsrComponent(
        ssrComponent.default,
        request.body as Record<string, unknown>
      );
      return { html, assets: [] };
    });
  }

  return { app };
}
