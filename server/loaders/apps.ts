import path from 'path';
import fg from 'fast-glob';
import type { Manifest as ViteManifest } from 'vite';
import type { JSONSchema } from '@apidevtools/json-schema-ref-parser';

import { loadAppAssets } from './assets.js';
import { loadAppExamples } from './examples.js';
import { loadAppSchema } from './schema.js';
import { loadViteManifest } from './manifest.js';

export type AppEntry = {
  name: string;
  root: string;
  entry: string;
  propsHookEntry: string;
  assets: string[];
  examples: Record<string, unknown>;
  schema: JSONSchema | null;
};

// Build the record of the available apps by convention
// apps -> /apps/{name}/index.tsx
// examples -> /apps/{name}/examples/{example}.json
export async function loadApps(root: string, deployedStaticPath: string) {
  const manifest = await loadViteManifest(root);

  const appBase = path.join(root, 'apps');
  const appPattern = `${fg.convertPathToPattern(appBase)}/*`;
  const appDirs = await fg.glob(appPattern, { onlyDirectories: true });

  const apps: Array<[name: string, entry: AppEntry]> = [];
  for (const appDir of appDirs) {
    apps.push(await loadApp(appDir, manifest, deployedStaticPath));
  }

  return Object.fromEntries(apps);
}

async function loadApp(
  appDir: string,
  manifest: ViteManifest,
  deployedStaticPath: string
): Promise<[name: string, entry: AppEntry]> {
  // TODO: report problems with loading entries, assets and/or examples
  const name = path.basename(appDir);
  return [
    name,
    {
      name,
      root: appDir,
      entry: path.join(appDir, 'index.tsx'),
      propsHookEntry: path.join(appDir, 'props.ts'),
      assets: loadAppAssets(name, manifest, deployedStaticPath),
      examples: await loadAppExamples(appDir),
      schema: await loadAppSchema(appDir),
    },
  ];
}
