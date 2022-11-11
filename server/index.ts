// This is the nerest server entrypoint
import path from 'path';

import vite from 'vite';
import type { InlineConfig } from 'vite';
import type { RollupWatcher, RollupWatcherEvent } from 'rollup';

import fastify from 'fastify';
import fastifyStatic from '@fastify/static';

import { loadApps } from './apps';
import { renderApp } from './render';
import { renderPreviewPage } from './preview';

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

  // TODO: this should probably be moved from here
  await startClientBuildWatcher(config);

  const apps = await loadApps(root);

  const viteSsr = await vite.createServer(config);
  const app = fastify();

  for (const appEntry of Object.values(apps)) {
    const { name, entry, examples } = appEntry;

    app.post(`/api/${name}`, async (request) => {
      const ssrComponent = await viteSsr.ssrLoadModule(entry, {
        fixStacktrace: true,
      });
      return renderApp(
        appEntry,
        ssrComponent.default,
        request.body as Record<string, unknown>
      );
    });

    for (const [exampleName, example] of Object.entries(examples)) {
      app.get(`/api/${name}/examples/${exampleName}`, async (_, reply) => {
        const ssrComponent = await viteSsr.ssrLoadModule(entry, {
          fixStacktrace: true,
        });
        const { html, assets } = renderApp(
          appEntry,
          ssrComponent.default,
          example as Record<string, unknown>
        );

        reply.type('text/html');

        return renderPreviewPage(html, assets);
      });
    }
  }

  // TODO: only do this locally, load from CDN in production
  app.register(fastifyStatic, {
    root: path.join(root, 'dist'),
  });

  return { app };
}

async function startClientBuildWatcher(config: InlineConfig) {
  const watcher = (await vite.build(config)) as RollupWatcher;
  return new Promise<void>((resolve) => {
    const listener = (ev: RollupWatcherEvent) => {
      if (ev.code === 'END') {
        watcher.off('event', listener);
        resolve();
      }
    };
    watcher.on('event', listener);
  });
}
