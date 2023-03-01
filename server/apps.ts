import path from 'path';
import fs from 'fs/promises';
import type { Manifest } from 'vite';

import { loadAppAssets } from './app-parts/assets';
import { loadAppExamples } from './app-parts/examples';
import { loadAppSchema } from './app-parts/schema';

export type AppEntry = {
  name: string;
  root: string;
  entry: string;
  assets: string[];
  examples: Record<string, unknown>;
  schema: Record<string, unknown> | null;
};

// Build the record of the available apps by convention
// apps -> /apps/{name}/index.tsx
// examples -> /apps/{name}/examples/{example}.json
export async function loadApps(root: string) {
  const appsRoot = path.join(root, 'apps');
  const manifest = await loadManifest(root);

  const appsDirs = (await fs.readdir(appsRoot, { withFileTypes: true }))
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  const apps: Array<[name: string, entry: AppEntry]> = [];
  for (const appDir of appsDirs) {
    apps.push(await loadApp(appsRoot, appDir, manifest));
  }

  return Object.fromEntries(apps);
}

async function loadApp(
  appsRoot: string,
  name: string,
  manifest: Manifest
): Promise<[name: string, entry: AppEntry]> {
  // TODO: report problems with loading entries, assets and/or examples
  const appRoot = path.join(appsRoot, name);
  return [
    name,
    {
      name,
      root: appRoot,
      entry: path.join(appRoot, 'index.tsx'),
      assets: loadAppAssets(manifest, name),
      examples: await loadAppExamples(appRoot),
      schema: await loadAppSchema(appRoot),
    },
  ];
}

// Manifest is used to provide assets list for every app
// for use with SSR
async function loadManifest(root: string) {
  // TODO: error handling
  const manifestPath = path.join(root, 'dist', 'manifest.json');
  const manifestData = await fs.readFile(manifestPath, { encoding: 'utf8' });
  return JSON.parse(manifestData);
}
