import type { InlineConfig } from 'vite';
import { viteExternalsPlugin } from 'vite-plugin-externals';

import type { BuildArgs } from './shared.js';
import { viteConfigShared } from './shared.js';
import { excludes } from '../excludes/index.js';

export async function viteConfigProductionClient(
  args: BuildArgs
): Promise<InlineConfig> {
  return {
    ...(await viteConfigShared(args)),
    build: {
      // Manifest is needed to report used assets in SSR handles
      manifest: true,
      modulePreload: false,
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
    resolve: {
      // excludes - map buildConfig.excludes packages to an empty module
      alias: excludes(args.buildConfig?.excludes),
    },
    plugins: [
      // externals - map buildConfig.externals packages to a global variable on window
      viteExternalsPlugin(args.buildConfig?.externals, { useWindow: false }),
    ],
  };
}

export async function viteConfigProductionServer(
  args: BuildArgs
): Promise<InlineConfig> {
  return {
    ...(await viteConfigShared(args)),
    build: {
      emptyOutDir: false,
      modulePreload: false,
      // This is an important setting for producing a server build
      ssr: true,
      rollupOptions: {
        input: '/node_modules/@nerest/nerest/server/production.ts',
        output: {
          dir: 'build',
          entryFileNames: `server.mjs`,
          chunkFileNames: `[name].mjs`,
          assetFileNames: `[name].[ext]`,
        },
      },
    },
  };
}
