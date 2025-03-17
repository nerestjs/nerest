// This is the nerest development server entrypoint
import path from 'path';
import { build, createServer as createViteServer } from 'vite';
import type { InlineConfig } from 'vite';
import type { RollupWatcher, RollupWatcherEvent } from 'rollup';
import fastifyStatic from '@fastify/static';
import fastifyMiddie from '@fastify/middie';
import { createServer } from './shared.js';
import {
  viteConfigDevelopmentClient,
  viteConfigDevelopmentServer,
} from '../build/configs/development.js';
import { loadBuildConfig } from './loaders/build.js';
import { loadApps } from './loaders/apps.js';
import { loadProject } from './loaders/project.js';

export async function runDevelopmentServer(port: number) {
  const root = process.cwd();

  // Allow overriding STATIC_PATH in development, useful for debugging
  // micro frontend from another device on the same local network
  let staticPath = process.env.STATIC_PATH || `http://127.0.0.1:${port}/`;
  if (!staticPath.endsWith('/')) {
    staticPath += '/';
  }

  // Generate vite configuration with nerest/build.json applied
  const buildConfig = await loadBuildConfig(root);

  // Load project meta details
  const project = await loadProject(root);

  // Build the clientside assets and watch for changes
  await startClientBuildWatcher(
    await viteConfigDevelopmentClient({
      root,
      base: staticPath,
      buildConfig,
      project,
    })
  );

  // Start vite server that will be rendering SSR components
  const viteSsr = await createViteServer(
    await viteConfigDevelopmentServer({
      root,
      base: staticPath,
      buildConfig,
      project,
    })
  );

  // Load app entries following the `apps/{name}/index.tsx` convention
  const apps = await loadApps(root, staticPath);

  const app = await createServer({
    root,
    project,
    apps,
    // ssrLoadModule picks up the changes without restarting the server
    loadComponent: async (entry: string) =>
      (
        await viteSsr.ssrLoadModule(`/apps/${entry}/index.tsx`, {
          fixStacktrace: true,
        })
      ).default,
    loadPropsHook: (entry: string) =>
      viteSsr.ssrLoadModule(`/apps/${entry}/props.ts`),
    loadRuntimeHook: () => viteSsr.ssrLoadModule('/nerest/runtime.ts'),
  });

  // Register middie to use vite's Connect-style middlewares
  await app.register(fastifyMiddie);
  app.use(viteSsr.middlewares);

  // @fastify/static is only used locally for development, in production static
  // files are served from STATIC_PATH, which is usually a CDN location
  await app.register(fastifyStatic, {
    root: path.join(root, 'build/client/assets'),

    // Set CORS headers so the development server assets can be accessed from
    // remote devices, e.g. mobile phones
    setHeaders(res) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET');
      res.setHeader(
        'Access-Control-Allow-Headers',
        'X-Requested-With, content-type, Authorization'
      );
    },
  });

  await app.listen({
    host: '0.0.0.0',
    port,
  });
}

async function startClientBuildWatcher(config: InlineConfig) {
  const watcher = (await build(config)) as RollupWatcher;
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
