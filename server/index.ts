// This is the nerest server entrypoint
import path from 'path';
import type { ServerResponse } from 'http';

import vite from 'vite';
import type { InlineConfig } from 'vite';
import type { RollupWatcher, RollupWatcherEvent } from 'rollup';

import fastify from 'fastify';
import fastifyStatic from '@fastify/static';

import { loadApps } from './apps';
import { renderApp } from './render';
import { renderPreviewPage } from './preview';

// TODO: this turned out to be a dev server, production server
// will most likely be implemented separately
export async function createServer() {
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
          entryFileNames: `assets/[name].js`,
          chunkFileNames: `assets/[name].js`,
          assetFileNames: `assets/[name].[ext]`,
        },
      },
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

  for (const appEntry of Object.values(apps)) {
    const { name, entry, examples } = appEntry;

    // POST /api/{name} -> render app with request.body as props
    app.post(`/api/${name}`, async (request) => {
      // ssrLoadModule drives the "hot-reload" logic, and allows
      // picking up changes to the source without restarting the server
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
      // GET /api/{name}/examples/{example} -> render a preview page
      // with a predefined example body
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

  return { app };
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
