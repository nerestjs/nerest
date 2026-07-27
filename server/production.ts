// This is the nerest production server entrypoint
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import type { ComponentType } from 'react';
import { createServer } from './shared.js';
import { loadNerestManifest } from './loaders/manifest.js';

// Important: this file is the server entrypoint that will be built by vite
// in `build/index.ts`. All of the import.meta.glob's will be resolved at build time
async function runProductionServer(port: number) {
  const root = process.cwd();

  // Load project information from the manifest generated during production build
  const { project, apps } = await loadNerestManifest(root);

  const components = import.meta.glob('/apps/*/index.tsx', {
    import: 'default',
    eager: true,
  }) as Record<string, ComponentType>;

  const propsHooks = import.meta.glob('/apps/*/props.ts', {
    eager: true,
  });

  const runtimeHook = import.meta.glob('/nerest/runtime.ts', { eager: true });

  // The preload hook is intentionally NOT globbed into this bundle. It is built
  // as a standalone `build/preload.mjs` (sibling to this file) so it can be
  // `--import`ed before the server (see `nerest start`). Here we dynamically
  // import that same module URL to reach its optional startup/shutdown
  // handlers; when it was `--import`ed, this returns the cached instance
  // without re-running its top-level side effects.
  const preloadBundle = join(
    dirname(fileURLToPath(import.meta.url)),
    'preload.mjs'
  );

  const app = await createServer({
    root,
    project,
    apps,
    loadComponent: async (entry: string) =>
      components[`/apps/${entry}/index.tsx`],
    loadPropsHook: async (entry: string) =>
      propsHooks[`/apps/${entry}/props.ts`],
    loadRuntimeHook: async () => runtimeHook['/nerest/runtime.ts'],
    loadPreloadHook: async () =>
      existsSync(preloadBundle)
        ? import(/* @vite-ignore */ pathToFileURL(preloadBundle).href)
        : undefined,
  });

  await app.listen({
    host: '0.0.0.0',
    port,
  });
}

runProductionServer(process.env.PORT ? Number(process.env.PORT) : 3000);
