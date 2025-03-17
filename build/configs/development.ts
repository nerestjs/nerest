import type { InlineConfig } from 'vite';

import type { BuildArgs } from './shared.js';
import { viteConfigShared } from './shared.js';
import logger from './vite-logger.development.js';

export async function viteConfigDevelopmentClient(
  args: BuildArgs
): Promise<InlineConfig> {
  return {
    ...(await viteConfigShared(args)),
    build: {
      // Manifest is needed to report used assets in SSR handles
      manifest: true,
      modulePreload: false,
      watch: {},
      rollupOptions: {
        input: '/node_modules/@nerest/nerest/client/index.ts',
        output: {
          dir: 'build/client/assets',
          entryFileNames: `[name].js`,
          chunkFileNames: `[name].js`,
          assetFileNames: `[name].[ext]`,
        },
      },
    },
    customLogger: logger,
  };
}

export async function viteConfigDevelopmentServer(
  args: BuildArgs
): Promise<InlineConfig> {
  return {
    ...(await viteConfigShared(args)),
    server: {
      // Middleware lets vite compile on the fly, providing
      // hot reload of certain modules
      middlewareMode: true,
      // Origin to serve imported assets from (like images)
      origin: new URL(args.base).origin,
      // Run HMR WebSocket server on random port to prevent conflicts
      // between multiple projects running simultaneously
      hmr: { port: randomPort() },
      // Allow requests from all hosts in development
      allowedHosts: true,
    },
    // optimizeDeps is only necessary with index.html entrypoint,
    // which we don't have
    optimizeDeps: {
      noDiscovery: true,
      include: [],
    },
    customLogger: logger,
  };
}

// Returns a random high-number port to prevent conflicts
function randomPort() {
  // 49152-65535 is the ephemeral port range
  // https://datatracker.ietf.org/doc/html/rfc6335#section-6
  return 49152 + Math.floor(Math.random() * (65535 - 49152));
}
