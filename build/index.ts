import vite from 'vite';
import type { InlineConfig } from 'vite';

export async function buildMicroFrontend() {
  const root = process.cwd();

  // Build client
  // TODO: extract shared parts between build/index.ts and server/index.ts
  // into a shared config
  const clientConfig: InlineConfig = {
    root,
    appType: 'custom',
    build: {
      // Manifest is needed to report used assets in SSR handles
      manifest: true,
      modulePreload: false,
      rollupOptions: {
        input: '/node_modules/@nerest/nerest/client/index.ts',
        output: {
          dir: 'build',
          entryFileNames: `client/assets/[name].js`,
          chunkFileNames: `client/assets/[name].js`,
          assetFileNames: `client/assets/[name].[ext]`,
        },
      },
    },
  };
  await vite.build(clientConfig);

  // TODO: Build server using the client manifest
}
