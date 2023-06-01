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

  console.log('Producing production client build...');
  await vite.build(clientConfig);

  // Build server using the client manifest
  const serverConfig: InlineConfig = {
    root,
    appType: 'custom',
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
        },
      },
    },
  };

  console.log('Producing production server build...');
  await vite.build(serverConfig);
}
