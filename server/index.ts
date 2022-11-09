// This is the nerest server entrypoint
import path from 'path';

import vite from 'vite';
import type { InlineConfig } from 'vite';

import fastify from 'fastify';
import fastifyStatic from '@fastify/static';

import { loadApps } from './apps';
import { renderSsrComponent } from './render';

export async function createServer() {
  const root = process.cwd();

  const config: InlineConfig = {
    root,
    appType: 'custom',
    server: { middlewareMode: true },
    build: {
      manifest: true,
      modulePreload: false,
      watch: {},
      rollupOptions: {
        input: '/node_modules/@nerest/nerest/client/index.ts',
        output: {
          entryFileNames: `assets/[name].js`,
          chunkFileNames: `assets/[name].js`,
          assetFileNames: `assets/[name].[ext]`,
        },
      },
    },
  };

  const viteSsr = await vite.createServer(config);

  // TODO: this is here temporarily for testing purposes only
  await vite.build(config);

  const apps = await loadApps(root);

  const app = fastify();

  for (const [appName, appEntry] of Object.entries(apps)) {
    const { entry, assets } = appEntry;
    app.post(`/api/${appName}`, async (request) => {
      const ssrComponent = await viteSsr.ssrLoadModule(entry, {
        fixStacktrace: true,
      });
      const html = renderSsrComponent(
        appName,
        ssrComponent.default,
        request.body as Record<string, unknown>
      );
      return { html, assets };
    });
  }

  // TODO: only do this locally, load from CDN in production
  app.register(fastifyStatic, {
    root: path.join(root, 'dist'),
  });

  return { app };
}
