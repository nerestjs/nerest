// This is the nerest production server entrypoint
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

  const app = await createServer({
    root,
    project,
    apps,
    loadComponent: async (entry: string) =>
      components[`/apps/${entry}/index.tsx`],
    loadPropsHook: async (entry: string) =>
      propsHooks[`/apps/${entry}/props.ts`],
    loadRuntimeHook: async () => runtimeHook['/nerest/runtime.ts'],
  });

  await app.listen({
    host: '0.0.0.0',
    port,
  });
}

runProductionServer(process.env.PORT ? Number(process.env.PORT) : 3000);
